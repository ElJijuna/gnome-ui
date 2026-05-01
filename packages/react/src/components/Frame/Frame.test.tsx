import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Frame } from "./Frame";

describe("Frame", () => {
  it("renders children", () => {
    render(<Frame><p>inside frame</p></Frame>);
    expect(screen.getByText("inside frame")).toBeInTheDocument();
  });

  it("renders as a div", () => {
    const { container } = render(<Frame />);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it("forwards className", () => {
    const { container } = render(<Frame className="my-frame" />);
    expect(container.firstChild).toHaveClass("my-frame");
  });

  it("forwards data-testid", () => {
    render(<Frame data-testid="frame" />);
    expect(screen.getByTestId("frame")).toBeInTheDocument();
  });

  it("forwards aria-label", () => {
    const { container } = render(<Frame aria-label="section" />);
    expect(container.firstChild).toHaveAttribute("aria-label", "section");
  });
});
