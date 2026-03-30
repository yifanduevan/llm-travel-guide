import { render, screen } from "@testing-library/react";
import AppLayout from "../layout";

describe("AppLayout", () => {
  it("renders shell navigation and children", () => {
    render(
      <AppLayout>
        <div>child-content</div>
      </AppLayout>
    );

    expect(screen.getByText("Trip Planner")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Trips" })).toHaveAttribute(
      "href",
      "/trips"
    );
    expect(screen.getByRole("link", { name: /add trip/i })).toHaveAttribute(
      "href",
      "/trips/add"
    );
    expect(screen.getByText("child-content")).toBeInTheDocument();
  });
});
