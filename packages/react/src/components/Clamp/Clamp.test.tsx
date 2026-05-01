import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Clamp } from "./Clamp";

describe("Clamp", () => {
  it("renders children", () => {
    render(<Clamp><p>content</p></Clamp>);
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("applies default max-width of 600px", () => {
    const { container } = render(<Clamp />);
    expect((container.firstChild as HTMLElement).style.maxWidth).toBe("600px");
  });

  it("applies custom maximumSize as max-width", () => {
    const { container } = render(<Clamp maximumSize={800} />);
    expect((container.firstChild as HTMLElement).style.maxWidth).toBe("800px");
  });

  it("forwards className", () => {
    const { container } = render(<Clamp className="narrow" />);
    expect(container.firstChild).toHaveClass("narrow");
  });

  it("forwards data-testid", () => {
    render(<Clamp data-testid="clamp" />);
    expect(screen.getByTestId("clamp")).toBeInTheDocument();
  });

  it("forwards style", () => {
    const { container } = render(<Clamp style={{ color: "blue" }} />);
    expect((container.firstChild as HTMLElement).style.color).toBe("blue");
  });
});
