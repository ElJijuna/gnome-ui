import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Toolbar } from "./Toolbar";

describe("Toolbar", () => {
  it("renders children", () => {
    render(<Toolbar><button>Save</button></Toolbar>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("renders as a div", () => {
    const { container } = render(<Toolbar><span /></Toolbar>);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it("forwards className", () => {
    const { container } = render(<Toolbar className="my-toolbar"><span /></Toolbar>);
    expect(container.firstChild).toHaveClass("my-toolbar");
  });

  it("forwards data-testid", () => {
    render(<Toolbar data-testid="toolbar"><span /></Toolbar>);
    expect(screen.getByTestId("toolbar")).toBeInTheDocument();
  });

  it("forwards aria-label", () => {
    const { container } = render(<Toolbar aria-label="actions"><span /></Toolbar>);
    expect(container.firstChild).toHaveAttribute("aria-label", "actions");
  });
});
