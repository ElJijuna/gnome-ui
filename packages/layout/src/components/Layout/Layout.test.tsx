import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Layout } from "./Layout";

describe("Layout", () => {
  it("renders children in the content area", () => {
    render(<Layout><p>Main content</p></Layout>);
    expect(screen.getByText("Main content")).toBeInTheDocument();
  });

  it("renders the topBar slot when provided", () => {
    render(
      <Layout topBar={<header>App Header</header>}>
        <p>Content</p>
      </Layout>,
    );
    expect(screen.getByText("App Header")).toBeInTheDocument();
  });

  it("does not render a top-bar wrapper when topBar is omitted", () => {
    const { container } = render(
      <Layout><p>Content</p></Layout>,
    );
    // The top-bar div is only rendered when topBar is truthy
    expect(container.querySelector("[class*='topBar']")).toBeNull();
  });

  it("renders the sidebar slot when provided", () => {
    render(
      <Layout sidebar={<nav>Navigation</nav>}>
        <p>Content</p>
      </Layout>,
    );
    expect(screen.getByText("Navigation")).toBeInTheDocument();
  });

  it("does not render a sidebar wrapper when sidebar is omitted", () => {
    const { container } = render(
      <Layout><p>Content</p></Layout>,
    );
    expect(container.querySelector("[class*='sidebar']")).toBeNull();
  });

  it("renders the bottomBar slot when provided", () => {
    render(
      <Layout bottomBar={<footer>Status bar</footer>}>
        <p>Content</p>
      </Layout>,
    );
    expect(screen.getByText("Status bar")).toBeInTheDocument();
  });

  it("does not render a bottom-bar wrapper when bottomBar is omitted", () => {
    const { container } = render(
      <Layout><p>Content</p></Layout>,
    );
    expect(container.querySelector("[class*='bottomBar']")).toBeNull();
  });

  it("renders all four zones simultaneously", () => {
    render(
      <Layout
        topBar={<div>Header</div>}
        sidebar={<nav>Sidebar</nav>}
        bottomBar={<div>Footer</div>}
      >
        <main>Content</main>
      </Layout>,
    );
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Sidebar")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("forwards className to the root element", () => {
    const { container } = render(
      <Layout className="custom-shell"><p>Content</p></Layout>,
    );
    expect(container.firstChild).toHaveClass("custom-shell");
  });

  it("forwards arbitrary HTML attributes to the root element", () => {
    const { container } = render(
      <Layout data-testid="workspace" aria-label="Application shell">
        <p>Content</p>
      </Layout>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute("data-testid", "workspace");
    expect(root).toHaveAttribute("aria-label", "Application shell");
  });

  it("forwards inline style to the root element", () => {
    const { container } = render(
      <Layout style={{ height: "500px" }}><p>Content</p></Layout>,
    );
    expect((container.firstChild as HTMLElement).style.height).toBe("500px");
  });
});
