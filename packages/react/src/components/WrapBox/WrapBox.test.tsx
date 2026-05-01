import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WrapBox } from "./WrapBox";

describe("WrapBox", () => {
  it("renders children", () => {
    render(<WrapBox><span>tag</span></WrapBox>);
    expect(screen.getByText("tag")).toBeInTheDocument();
  });

  it("renders as a div", () => {
    const { container } = render(<WrapBox />);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it("applies childSpacing as CSS variable", () => {
    const { container } = render(<WrapBox childSpacing={12} />);
    const style = (container.firstChild as HTMLElement).style;
    expect(style.getPropertyValue("--wrapbox-gap")).toBe("12px");
  });

  it("applies lineSpacing as separate row-gap variable", () => {
    const { container } = render(<WrapBox childSpacing={6} lineSpacing={12} />);
    const style = (container.firstChild as HTMLElement).style;
    expect(style.getPropertyValue("--wrapbox-row-gap")).toBe("12px");
  });

  it("applies justify as CSS variable", () => {
    const { container } = render(<WrapBox justify="center" />);
    const style = (container.firstChild as HTMLElement).style;
    expect(style.getPropertyValue("--wrapbox-justify")).toBe("center");
  });

  it("applies align as CSS variable", () => {
    const { container } = render(<WrapBox align="start" />);
    const style = (container.firstChild as HTMLElement).style;
    expect(style.getPropertyValue("--wrapbox-align")).toBe("start");
  });

  it("forwards className", () => {
    const { container } = render(<WrapBox className="chips" />);
    expect(container.firstChild).toHaveClass("chips");
  });

  it("forwards data-testid", () => {
    render(<WrapBox data-testid="wrap" />);
    expect(screen.getByTestId("wrap")).toBeInTheDocument();
  });
});
