import { render, screen } from "@testing-library/react";
import ActivitiesView from "../ActivitiesView";

describe("ActivitiesView", () => {
  it("renders temporary unavailable message", () => {
    render(<ActivitiesView />);

    expect(screen.getByText("Activities")).toBeInTheDocument();
    expect(
      screen.getByText("Activities are temporarily unavailable.")
    ).toBeInTheDocument();
  });
});
