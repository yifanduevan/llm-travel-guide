import RootLayout, { metadata } from "../layout";

jest.mock("next/font/google", () => ({
  Geist: jest.fn(() => ({ variable: "--font-geist-sans" })),
  Geist_Mono: jest.fn(() => ({ variable: "--font-geist-mono" })),
}));

describe("RootLayout", () => {
  it("exports expected metadata", () => {
    expect(metadata).toEqual({
      title: "ECE651 Trips",
      description: "Trip planner workspace",
    });
  });

  it("builds html/body wrapper with children", () => {
    const element = RootLayout({
      children: <div>root-child</div>,
    });

    expect(element.type).toBe("html");
    expect(element.props.lang).toBe("en");
    expect(element.props.suppressHydrationWarning).toBe(true);

    const [head, body] = element.props.children as React.ReactElement[];
    expect(head.type).toBe("head");
    expect(body.type).toBe("body");
    expect(body.props.className).toContain("--font-geist-sans");
    expect(body.props.className).toContain("--font-geist-mono");
    expect(body.props.children.props.children).toBe("root-child");
  });
});
