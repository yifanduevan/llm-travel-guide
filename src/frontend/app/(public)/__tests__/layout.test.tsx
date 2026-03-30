import { render, screen } from "@testing-library/react";
import PublicLayout from "../layout";

describe("PublicLayout", () => {
  it("renders wrapper and children", () => {
    render(
      <PublicLayout>
        <div>public-child</div>
      </PublicLayout>
    );

    expect(screen.getByText("public-child")).toBeInTheDocument();
  });
});
