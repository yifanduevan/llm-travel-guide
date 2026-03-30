import { fireEvent, render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import LoginPage from "../page";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockedUseRouter = jest.mocked(useRouter);

describe("LoginPage", () => {
  const push = jest.fn();

  beforeEach(() => {
    push.mockReset();
    document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    mockedUseRouter.mockReturnValue({ push } as never);
  });

  it("sets auth cookie and redirects to trips on submit", () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(push).toHaveBeenCalledWith("/trips");
  });

  it("renders a back-to-home link", () => {
    render(<LoginPage />);

    expect(screen.getByRole("link", { name: /back to home/i })).toHaveAttribute(
      "href",
      "/"
    );
  });
});
