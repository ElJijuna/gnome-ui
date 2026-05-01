import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToolbarView } from "./ToolbarView";

describe("ToolbarView", () => {
  it("renders children in the content area", () => {
    render(<ToolbarView><p>Main content</p></ToolbarView>);
    expect(screen.getByText("Main content")).toBeInTheDocument();
  });

  it("renders topBar when provided", () => {
    render(<ToolbarView topBar={<header>Top</header>}><p>Content</p></ToolbarView>);
    expect(screen.getByText("Top")).toBeInTheDocument();
  });

  it("renders bottomBar when provided", () => {
    render(<ToolbarView bottomBar={<footer>Bottom</footer>}><p>Content</p></ToolbarView>);
    expect(screen.getByText("Bottom")).toBeInTheDocument();
  });

  it("does not render topBar wrapper when topBar is omitted", () => {
    const { container } = render(<ToolbarView><p>Content</p></ToolbarView>);
    expect(container.querySelector("[class*='top']")).toBeNull();
  });

  it("does not render bottomBar wrapper when bottomBar is omitted", () => {
    const { container } = render(<ToolbarView><p>Content</p></ToolbarView>);
    expect(container.querySelector("[class*='bottom']")).toBeNull();
  });

  it("renders all three slots simultaneously", () => {
    render(
      <ToolbarView
        topBar={<div>Header</div>}
        bottomBar={<div>Footer</div>}
      >
        <div>Body</div>
      </ToolbarView>,
    );
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("forwards className", () => {
    const { container } = render(<ToolbarView className="view"><p /></ToolbarView>);
    expect(container.firstChild).toHaveClass("view");
  });

  it("forwards data-testid", () => {
    render(<ToolbarView data-testid="tv"><p /></ToolbarView>);
    expect(screen.getByTestId("tv")).toBeInTheDocument();
  });
});
