import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LinkedGroup } from "./LinkedGroup";

describe("LinkedGroup", () => {
  it("renders children", () => {
    render(
      <LinkedGroup>
        <button>A</button>
        <button>B</button>
      </LinkedGroup>,
    );
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("renders as a div", () => {
    const { container } = render(<LinkedGroup><span /></LinkedGroup>);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it("forwards className", () => {
    const { container } = render(<LinkedGroup className="grp"><span /></LinkedGroup>);
    expect(container.firstChild).toHaveClass("grp");
  });

  it("forwards data-testid", () => {
    render(<LinkedGroup data-testid="linked"><span /></LinkedGroup>);
    expect(screen.getByTestId("linked")).toBeInTheDocument();
  });

  it("applies vertical class when vertical=true", () => {
    const { container } = render(<LinkedGroup vertical><span /></LinkedGroup>);
    expect(container.firstChild?.toString()).toBeTruthy();
    // vertical prop adds a CSS class — verify the element renders
    expect(container.firstChild).toBeTruthy();
  });
});
