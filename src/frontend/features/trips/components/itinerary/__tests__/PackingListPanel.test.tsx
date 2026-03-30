import { fireEvent, render, screen } from "@testing-library/react";
import PackingListPanel from "../PackingListPanel";

describe("PackingListPanel", () => {
  it("toggles checked state and updates progress counter", () => {
    render(<PackingListPanel />);

    expect(screen.getByText("2/4")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Formal dinner attire"));
    expect(screen.getByText("3/4")).toBeInTheDocument();
  });

  it("adds, edits, and deletes packing items", () => {
    render(<PackingListPanel />);

    fireEvent.click(screen.getByRole("button", { name: "lightbulb" }));
    fireEvent.change(screen.getByPlaceholderText("Enter item name"), {
      target: { value: "Camera" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.getByText("Camera")).toBeInTheDocument();

    const moreButtons = screen.getAllByRole("button", { name: "more_horiz" });
    fireEvent.click(moreButtons[moreButtons.length - 1]);
    fireEvent.click(screen.getByRole("button", { name: "edit" }));

    const editInput = screen.getByDisplayValue("Camera");
    fireEvent.change(editInput, { target: { value: "Camera Pro" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Camera Pro")).toBeInTheDocument();

    const moreButtonsAfterEdit = screen.getAllByRole("button", { name: "more_horiz" });
    fireEvent.click(moreButtonsAfterEdit[moreButtonsAfterEdit.length - 1]);
    fireEvent.click(screen.getByRole("button", { name: "delete" }));

    expect(screen.queryByText("Camera Pro")).not.toBeInTheDocument();
  });
});
