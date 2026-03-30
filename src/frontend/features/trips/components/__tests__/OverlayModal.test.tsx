import { fireEvent, render, screen } from "@testing-library/react";
import OverlayModal from "../OverlayModal";

describe("OverlayModal", () => {
  it("does not render when closed", () => {
    render(
      <OverlayModal open={false} title="Hidden" onClose={jest.fn()}>
        <div>Body</div>
      </OverlayModal>
    );

    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  it("renders content, handles close button and escape", () => {
    const onClose = jest.fn();

    render(
      <OverlayModal
        open
        title="Edit item"
        description="Update details"
        onClose={onClose}
        footer={<button type="button">Footer action</button>}
      >
        <div>Modal body</div>
      </OverlayModal>
    );

    expect(screen.getByText("Edit item")).toBeInTheDocument();
    expect(screen.getByText("Update details")).toBeInTheDocument();
    expect(screen.getByText("Modal body")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Footer action" })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: /close modal/i }));

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("removes keydown listener on unmount", () => {
    const removeSpy = jest.spyOn(document, "removeEventListener");
    const { unmount } = render(
      <OverlayModal open title="Cleanup" onClose={jest.fn()}>
        <div>Body</div>
      </OverlayModal>
    );

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
    removeSpy.mockRestore();
  });
});
