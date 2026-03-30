import { render, screen } from "@testing-library/react";
import LandingPage from "../page";

describe("LandingPage", () => {
  it("renders marketing copy and login CTA", () => {
    render(<LandingPage />);

    expect(screen.getByText("Trip Planner")).toBeInTheDocument();
    expect(screen.getByText("Organize your next trip.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go to login/i })).toHaveAttribute(
      "href",
      "/login"
    );
  });
});
