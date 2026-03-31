import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AddTripPage from "../page";
import { generateItinerary, generateTrip } from "@/features/trips/api";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/features/trips/api", () => ({
  generateTrip: jest.fn(),
  generateItinerary: jest.fn(),
}));

jest.mock("@/features/trips/components/DateRangePicker", () => ({
  __esModule: true,
  default: ({
    onChange,
  }: {
    onChange: (start: string | null, end: string | null) => void;
  }) => (
    <button type="button" onClick={() => onChange("2026-04-10", "2026-04-15")}>
      pick-dates
    </button>
  ),
}));

const mockedGenerateTrip = jest.mocked(generateTrip);
const mockedGenerateItinerary = jest.mocked(generateItinerary);
const mockedUseRouter = jest.mocked(useRouter);

describe("AddTripPage", () => {
  const push = jest.fn();

  beforeEach(() => {
    push.mockReset();
    mockedGenerateTrip.mockReset();
    mockedGenerateItinerary.mockReset();
    mockedUseRouter.mockReturnValue({ push } as never);
  });

  it("submits the generated trip request and routes to the new trip", async () => {
    mockedGenerateTrip.mockResolvedValue({
      id: "trip-123",
      titleOrDestination: "Tokyo",
    });
    mockedGenerateItinerary.mockResolvedValue([]);

    render(<AddTripPage />);

    fireEvent.change(screen.getByPlaceholderText("e.g., Tokyo, Japan"), {
      target: { value: "Tokyo" },
    });
    fireEvent.click(screen.getByRole("button", { name: "pick-dates" }));
    fireEvent.click(screen.getByRole("button", { name: "Food & Dining" }));
    fireEvent.click(screen.getByRole("button", { name: /generate my guide/i }));

    await waitFor(() =>
      expect(mockedGenerateTrip).toHaveBeenCalledWith(
        expect.objectContaining({
          titleOrDestination: "Tokyo",
          startDate: "2026-04-10",
          endDate: "2026-04-15",
          travelers: expect.any(String),
          budget: expect.any(String),
          interests: ["Food & Dining"],
        }),
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        }),
      ),
    );
    expect(mockedGenerateItinerary).toHaveBeenCalledWith("trip-123");

    expect(push).toHaveBeenCalledWith("/trips/trip-123");
  });

  it("shows a validation-style error when generation fails with a 400", async () => {
    mockedGenerateTrip.mockRejectedValue({
      message: "Trip generation request is invalid. Check the dates and required fields.",
    });

    render(<AddTripPage />);

    fireEvent.change(screen.getByPlaceholderText("e.g., Tokyo, Japan"), {
      target: { value: "Kyoto" },
    });
    fireEvent.click(screen.getByRole("button", { name: "pick-dates" }));
    fireEvent.click(screen.getByRole("button", { name: /generate my guide/i }));

    expect(
      await screen.findByText(/trip generation request is invalid/i),
    ).toBeInTheDocument();
    expect(mockedGenerateItinerary).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });
});
