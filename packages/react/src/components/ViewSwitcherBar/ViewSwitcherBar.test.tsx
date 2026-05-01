import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ViewSwitcherBar } from "./ViewSwitcherBar";

describe("ViewSwitcherBar", () => {
  it("renders children when reveal=true (default)", () => {
    render(
      <ViewSwitcherBar>
        <button>Home</button>
      </ViewSwitcherBar>,
    );
    expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument();
  });

  it("returns null when reveal=false", () => {
    const { container } = render(
      <ViewSwitcherBar reveal={false}>
        <button>Home</button>
      </ViewSwitcherBar>,
    );
    expect(container.firstChild).toBeNull();
  });

  it("has role=navigation", () => {
    render(<ViewSwitcherBar><span /></ViewSwitcherBar>);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("has aria-label=Bottom navigation", () => {
    render(<ViewSwitcherBar><span /></ViewSwitcherBar>);
    expect(screen.getByRole("navigation", { name: "Bottom navigation" })).toBeInTheDocument();
  });

  it("forwards className", () => {
    const { container } = render(<ViewSwitcherBar className="bar"><span /></ViewSwitcherBar>);
    expect(container.firstChild).toHaveClass("bar");
  });

  it("forwards data-testid", () => {
    render(<ViewSwitcherBar data-testid="vsb"><span /></ViewSwitcherBar>);
    expect(screen.getByTestId("vsb")).toBeInTheDocument();
  });
});
