import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import EditSegmentModal, { type TransportSegmentEditForm } from "../EditSegmentModal";

jest.mock("../../OverlayModal", () => ({
  __esModule: true,
  default: ({
    open,
    title,
    description,
    footer,
    children,
  }: {
    open: boolean;
    title: string;
    description?: string;
    footer?: ReactNode;
    children: ReactNode;
  }) =>
    open ? (
      <div>
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
        <div>{children}</div>
        <div>{footer}</div>
      </div>
    ) : null,
}));

describe("EditSegmentModal", () => {
  const form: TransportSegmentEditForm = {
    title: "SFO -> JFK",
    type: "FLIGHT",
    startTime: "2026-12-01T10:00",
    startLocation: "SFO",
    endTime: "2026-12-01T18:00",
    endLocation: "JFK",
    status: "CONFIRMED",
    confirmationCode: "ABC123",
    ticketUrl: "https://tickets.example",
  };

  it("renders null when closed", () => {
    render(
      <EditSegmentModal
        open={false}
        form={form}
        onFormChange={jest.fn()}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />
    );

    expect(screen.queryByText("Edit transport segment")).not.toBeInTheDocument();
  });

  it("handles edits and action buttons", () => {
    const onFormChange = jest.fn();
    const onClose = jest.fn();
    const onSave = jest.fn();

    render(
      <EditSegmentModal
        open
        form={form}
        error="Invalid fields"
        onFormChange={onFormChange}
        onClose={onClose}
        onSave={onSave}
      />
    );

    expect(screen.getByText("Edit transport segment")).toBeInTheDocument();
    expect(screen.getByText("Invalid fields")).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue("SFO -> JFK"), {
      target: { value: "YYZ -> YVR" },
    });
    fireEvent.change(screen.getAllByRole("combobox")[0], {
      target: { value: "TRAIN" },
    });
    fireEvent.change(screen.getByDisplayValue("SFO"), {
      target: { value: "YYZ" },
    });
    fireEvent.change(screen.getAllByRole("combobox")[1], {
      target: { value: "COMPLETED" },
    });

    expect(onFormChange).toHaveBeenCalledWith(
      expect.objectContaining({ title: "YYZ -> YVR" })
    );
    expect(onFormChange).toHaveBeenCalledWith(
      expect.objectContaining({ type: "TRAIN" })
    );
    expect(onFormChange).toHaveBeenCalledWith(
      expect.objectContaining({ startLocation: "YYZ" })
    );
    expect(onFormChange).toHaveBeenCalledWith(
      expect.objectContaining({ status: "COMPLETED" })
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClose).toHaveBeenCalled();
    expect(onSave).toHaveBeenCalled();
  });
});
