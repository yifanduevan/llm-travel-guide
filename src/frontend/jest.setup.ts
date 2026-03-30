import "@testing-library/jest-dom";

if (typeof window !== "undefined" && window.HTMLElement?.prototype) {
  Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
    value: jest.fn(),
    writable: true,
  });
}
