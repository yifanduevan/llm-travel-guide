import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import EditItineraryItemModal from "../EditItineraryItemModal";

jest.mock("../../OverlayModal", () => ({
  __esModule: true,
  default: ({
    open,
    title,
    description,
    children,
    footer,
  }: {
    open: boolean;
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
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

jest.mock("../ItineraryTimePicker", () => ({
  __esModule: true,
  default: ({ onChange }: { onChange: (nextValue: string) => void }) => (
    <button type="button" onClick={() => onChange("14:45")}>
      pick-time
    </button>
  ),
}));

describe("EditItineraryItemModal", () => {
  const form = {
    title: "Flight",
    time: "09:00",
    note: "Direct",
  };

  it("does not render when closed", () => {
    render(
      <EditItineraryItemModal
        open={false}
        form={form}
        onFormChange={jest.fn()}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />
    );

    expect(screen.queryByText("Edit itinerary item")).not.toBeInTheDocument();
  });

  it("supports editing fields and save/cancel actions", () => {
    const onFormChange = jest.fn();
    const onClose = jest.fn();
    const onSave = jest.fn();

    render(
      <EditItineraryItemModal
        open
        form={form}
        onFormChange={onFormChange}
        onClose={onClose}
        onSave={onSave}
      />
    );

    fireEvent.change(screen.getByDisplayValue("Flight"), {
      target: { value: "Train" },
    });
    fireEvent.change(screen.getByDisplayValue("Direct"), {
      target: { value: "Window seat" },
    });
    fireEvent.click(screen.getByRole("button", { name: "pick-time" }));

    expect(onFormChange).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Train" })
    );
    expect(onFormChange).toHaveBeenCalledWith(
      expect.objectContaining({ note: "Window seat" })
    );
    expect(onFormChange).toHaveBeenCalledWith(
      expect.objectContaining({ time: "14:45" })
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onClose).toHaveBeenCalled();
    expect(onSave).toHaveBeenCalled();
  });

  it("renders custom labels", () => {
    render(
      <EditItineraryItemModal
        open
        form={form}
        title="Add activity"
        description="Custom description"
        saveLabel="Create"
        onFormChange={jest.fn()}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />
    );

    expect(screen.getByText("Add activity")).toBeInTheDocument();
    expect(screen.getByText("Custom description")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });
});
