import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Bin } from "./Bin";

describe("Bin", () => {
  it("renders children", () => {
    render(<Bin><p>content</p></Bin>);
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("renders as a div", () => {
    const { container } = render(<Bin />);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it("forwards className", () => {
    const { container } = render(<Bin className="custom" />);
    expect(container.firstChild).toHaveClass("custom");
  });

  it("forwards style", () => {
    const { container } = render(<Bin style={{ color: "red" }} />);
    expect((container.firstChild as HTMLElement).style.color).toBe("red");
  });

  it("forwards data attributes", () => {
    render(<Bin data-testid="bin" />);
    expect(screen.getByTestId("bin")).toBeInTheDocument();
  });

  it("forwards aria-label", () => {
    const { container } = render(<Bin aria-label="wrapper" />);
    expect(container.firstChild).toHaveAttribute("aria-label", "wrapper");
  });
});
