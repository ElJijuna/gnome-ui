import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeaderBar } from "./HeaderBar";

describe("HeaderBar", () => {
  it("renders as a <header> element", () => {
    const { container } = render(<HeaderBar />);
    expect(container.firstChild?.nodeName).toBe("HEADER");
  });

  it("renders a string title", () => {
    render(<HeaderBar title="My App" />);
    expect(screen.getByText("My App")).toBeInTheDocument();
  });

  it("renders a ReactNode title", () => {
    render(<HeaderBar title={<span data-testid="custom-title">Files</span>} />);
    expect(screen.getByTestId("custom-title")).toBeInTheDocument();
  });

  it("renders start slot content", () => {
    render(<HeaderBar start={<button>Back</button>} />);
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
  });

  it("renders end slot content", () => {
    render(<HeaderBar end={<button>Menu</button>} />);
    expect(screen.getByRole("button", { name: "Menu" })).toBeInTheDocument();
  });

  it("forwards className", () => {
    const { container } = render(<HeaderBar className="top-bar" />);
    expect(container.firstChild).toHaveClass("top-bar");
  });

  it("forwards data-testid", () => {
    render(<HeaderBar data-testid="hb" />);
    expect(screen.getByTestId("hb")).toBeInTheDocument();
  });
});
