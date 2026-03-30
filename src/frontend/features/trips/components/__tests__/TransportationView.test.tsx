import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import TransportationView from "../TransportationView";
import { getTransportSegments } from "@/features/trips/api";
import { apiPost } from "@/lib/apiClient";

jest.mock("@/features/trips/api", () => ({
  getTransportSegments: jest.fn(),
}));

jest.mock("@/lib/apiClient", () => ({
  apiPost: jest.fn(),
}));

jest.mock("../transportation/AddSegmentModal", () => ({
  __esModule: true,
  default: ({
    onSave,
    onClose,
  }: {
    onSave: (segment: unknown) => void;
    onClose: () => void;
  }) => (
    <div>
      <button
        type="button"
        onClick={() =>
          onSave({
            id: "local-seg-1",
            mode: "TRAIN",
            type: "TRAIN",
            title: "Local Train to Ottawa",
            startTime: "2026-11-01T09:00:00.000Z",
            startTz: null,
            startLocation: "Toronto",
            endTime: "2026-11-01T12:00:00.000Z",
            endTz: null,
            endLocation: "Ottawa",
            durationText: "3h",
            status: "upcoming",
            confirmationCode: "TRN-77",
            ticketsUrl: "https://tickets.local/train",
            ticketUrl: "https://tickets.local/train",
            notes: null,
            completed: false,
          })
        }
      >
        save-mocked-segment
      </button>
      <button type="button" onClick={onClose}>
        close-add-modal
      </button>
    </div>
  ),
}));

jest.mock("../transportation/EditSegmentModal", () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) =>
    open ? <div>Edit segment modal</div> : null,
}));

jest.mock("../OverlayModal", () => ({
  __esModule: true,
  default: ({
    open,
    title,
    children,
    footer,
  }: {
    open: boolean;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
  }) =>
    open ? (
      <div>
        <h3>{title}</h3>
        <div>{children}</div>
        <div>{footer}</div>
      </div>
    ) : null,
}));

jest.mock("../ConfirmOverlay", () => ({
  __esModule: true,
  default: ({
    open,
    title,
    message,
    onConfirm,
    onCancel,
    confirmLabel,
    cancelLabel,
  }: {
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel: string;
    cancelLabel: string;
  }) =>
    open ? (
      <div>
        <h4>{title}</h4>
        <p>{message}</p>
        <button type="button" onClick={onConfirm}>
          {confirmLabel}
        </button>
        <button type="button" onClick={onCancel}>
          {cancelLabel}
        </button>
      </div>
    ) : null,
}));

describe("TransportationView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("loads segments from API when none are provided", async () => {
    (getTransportSegments as jest.Mock).mockResolvedValue([
      {
        id: "seg-api-1",
        type: "FLIGHT",
        title: "Flight to NYC",
        startTime: "2026-11-10T10:00:00.000Z",
        endTime: "2026-11-10T13:30:00.000Z",
        startLocation: "YYZ",
        endLocation: "JFK",
        durationText: "3h 30m",
        status: "CONFIRMED",
        confirmationCode: "AA100",
        ticketUrl: "https://tickets.example/aa100",
        completed: false,
      },
    ]);

    render(<TransportationView tripId="trip-transport-1" editable />);

    expect(screen.getByText("Loading segments...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Flight to NYC")).toBeInTheDocument();
    });

    expect(getTransportSegments).toHaveBeenCalledWith("trip-transport-1");
    expect(screen.getAllByText("3h 30m")).toHaveLength(2);
  });

  it("adds a local segment through AddSegmentModal when tripId is missing", async () => {
    render(<TransportationView editable />);

    fireEvent.click(screen.getByRole("button", { name: /add segment/i }));
    fireEvent.click(screen.getByRole("button", { name: "save-mocked-segment" }));

    await waitFor(() => {
      expect(screen.getByText("Local Train to Ottawa")).toBeInTheDocument();
    });
  });

  it("deletes a segment after confirmation", async () => {
    render(
      <TransportationView
        tripId="trip-transport-2"
        editable
        segments={[
          {
            id: "seg-del-1",
            mode: "FLIGHT",
            type: "FLIGHT",
            title: "Delete Me",
            startTime: "2026-11-15T08:00:00.000Z",
            startTz: null,
            startLocation: "YYZ",
            endTime: "2026-11-15T10:00:00.000Z",
            endTz: null,
            endLocation: "BOS",
            durationText: "2h",
            status: "CONFIRMED",
            confirmationCode: "RM100",
            ticketsUrl: "https://tickets.example/rm100",
            ticketUrl: "https://tickets.example/rm100",
            notes: null,
            completed: false,
          },
        ]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete segment" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(screen.queryByText("Delete Me")).not.toBeInTheDocument();
    });
  });

  it("submits add segment form and renders created segment", async () => {
    (apiPost as jest.Mock).mockResolvedValue({
      id: "api-created-1",
      type: "TRAIN",
      title: "API Created Segment",
      startTime: "2026-12-01T09:00:00.000Z",
      endTime: "2026-12-01T11:00:00.000Z",
      startLocation: "Toronto",
      endLocation: "Ottawa",
      durationText: "2h",
      status: "CONFIRMED",
      confirmationCode: "TR-12",
      ticketUrl: "https://tickets.example/tr12",
      completed: false,
    });

    render(<TransportationView tripId="trip-transport-form" editable />);

    fireEvent.click(screen.getByRole("button", { name: /add segment/i }));
    fireEvent.change(screen.getByPlaceholderText("SFO → JFK"), {
      target: { value: "API Created Segment" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save segment" }));

    await waitFor(() => {
      expect(screen.getByText("API Created Segment")).toBeInTheDocument();
    });

    expect(apiPost).toHaveBeenCalledWith(
      "/api/trips/trip-transport-form/transport-segments",
      expect.objectContaining({
        title: "API Created Segment",
      })
    );
  });

  it("shows API error in modal when create request fails", async () => {
    (apiPost as jest.Mock).mockRejectedValue(new Error("Server rejected payload"));

    render(<TransportationView tripId="trip-transport-error" editable />);

    fireEvent.click(screen.getByRole("button", { name: /add segment/i }));
    fireEvent.change(screen.getByPlaceholderText("SFO → JFK"), {
      target: { value: "Fail Segment" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save segment" }));

    expect(await screen.findByText("Server rejected payload")).toBeInTheDocument();
  });

  it("falls back to local add when network is unavailable", async () => {
    (apiPost as jest.Mock).mockRejectedValue(new Error("Failed to fetch"));
    jest.spyOn(global.crypto, "randomUUID").mockReturnValue("offline-seg");

    render(<TransportationView tripId="trip-transport-offline" editable />);

    fireEvent.click(screen.getByRole("button", { name: /add segment/i }));
    fireEvent.change(screen.getByPlaceholderText("SFO → JFK"), {
      target: { value: "Offline Segment" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save segment" }));

    await waitFor(() => {
      expect(screen.getByText("Offline Segment")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Backend unavailable. Segment has been added locally.")
    ).toBeInTheDocument();
  });
});
