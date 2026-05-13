import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

  it("renders the header alias when provided", () => {
    render(
      <Layout header={<div>Alias Header</div>}>
        <p>Content</p>
      </Layout>,
    );
    expect(screen.getByText("Alias Header")).toBeInTheDocument();
  });

  it("prefers topBar over header when both are provided", () => {
    render(
      <Layout topBar={<div>Legacy Header</div>} header={<div>Alias Header</div>}>
        <p>Content</p>
      </Layout>,
    );
    expect(screen.getByText("Legacy Header")).toBeInTheDocument();
    expect(screen.queryByText("Alias Header")).not.toBeInTheDocument();
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

  it("renders the footer alias when provided", () => {
    render(
      <Layout footer={<div>Alias Footer</div>}>
        <p>Content</p>
      </Layout>,
    );
    expect(screen.getByText("Alias Footer")).toBeInTheDocument();
  });

  it("prefers bottomBar over footer when both are provided", () => {
    render(
      <Layout bottomBar={<div>Legacy Footer</div>} footer={<div>Alias Footer</div>}>
        <p>Content</p>
      </Layout>,
    );
    expect(screen.getByText("Legacy Footer")).toBeInTheDocument();
    expect(screen.queryByText("Alias Footer")).not.toBeInTheDocument();
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

  it("uses semantic landmark elements for the shell zones", () => {
    const { container } = render(
      <Layout
        header={<div>Header</div>}
        sidebar={<div>Navigation</div>}
        footer={<div>Footer</div>}
      >
        <p>Content</p>
      </Layout>,
    );

    expect(container.querySelector("header")).not.toBeNull();
    expect(container.querySelector("aside")).not.toBeNull();
    expect(container.querySelector("main")).not.toBeNull();
    expect(container.querySelector("footer")).not.toBeNull();
  });

  it("applies sidebarLabel to the sidebar landmark wrapper", () => {
    render(
      <Layout sidebar={<div>Navigation</div>} sidebarLabel="Primary navigation">
        <p>Content</p>
      </Layout>,
    );

    expect(screen.getByLabelText("Primary navigation")).toBeInTheDocument();
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

  it("defaults to viewport height and content scrolling", () => {
    const { container } = render(<Layout><p>Content</p></Layout>);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toMatch(/heightViewport/);
    expect(root.className).toMatch(/scrollContent/);
  });

  it("supports parent height for nested layouts", () => {
    const { container } = render(
      <Layout height="parent"><p>Content</p></Layout>,
    );
    expect((container.firstChild as HTMLElement).className).toMatch(/heightParent/);
  });

  it.each(["content", "page", "none"] as const)(
    "supports the %s scroll model",
    (scroll) => {
      const { container } = render(
        <Layout scroll={scroll}><p>Content</p></Layout>,
      );
      const expectedClass = {
        content: /scrollContent/,
        page: /scrollPage/,
        none: /scrollNone/,
      }[scroll];
      expect((container.firstChild as HTMLElement).className).toMatch(expectedClass);
    },
  );

  describe("mobile sidebar overlay", () => {
    it("does not apply bodySidebarOpen class when sidebarOpen is false", () => {
      const { container } = render(
        <Layout sidebar={<nav>Nav</nav>} sidebarOpen={false}>
          <p>Content</p>
        </Layout>,
      );
      expect(container.querySelector("[class*='bodySidebarOpen']")).toBeNull();
    });

    it("applies bodySidebarOpen class when sidebarOpen is true", () => {
      const { container } = render(
        <Layout sidebar={<nav>Nav</nav>} sidebarOpen>
          <p>Content</p>
        </Layout>,
      );
      expect(container.querySelector("[class*='bodySidebarOpen']")).not.toBeNull();
    });

    it("does not apply bodySidebarOpen when sidebar is absent even if sidebarOpen is true", () => {
      const { container } = render(
        <Layout sidebarOpen>
          <p>Content</p>
        </Layout>,
      );
      expect(container.querySelector("[class*='bodySidebarOpen']")).toBeNull();
    });

    it("calls onSidebarClose when the backdrop is clicked", () => {
      const onClose = vi.fn();
      const { container } = render(
        <Layout sidebar={<nav>Nav</nav>} sidebarOpen onSidebarClose={onClose}>
          <p>Content</p>
        </Layout>,
      );
      const backdrop = container.querySelector("[class*='backdrop']") as HTMLElement;
      expect(backdrop).not.toBeNull();
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onSidebarOpenChange with backdrop reason when the backdrop is clicked", () => {
      const onOpenChange = vi.fn();
      const { container } = render(
        <Layout
          sidebar={<nav>Nav</nav>}
          sidebarOpen
          onSidebarOpenChange={onOpenChange}
        >
          <p>Content</p>
        </Layout>,
      );
      const backdrop = container.querySelector("[class*='backdrop']") as HTMLElement;
      fireEvent.click(backdrop);
      expect(onOpenChange).toHaveBeenCalledWith(false, "backdrop");
    });

    it("calls onSidebarOpenChange with escape reason when Escape is pressed", () => {
      const onOpenChange = vi.fn();
      render(
        <Layout
          sidebar={<nav>Nav</nav>}
          sidebarOpen
          onSidebarOpenChange={onOpenChange}
        >
          <p>Content</p>
        </Layout>,
      );
      fireEvent.keyDown(document, { key: "Escape" });
      expect(onOpenChange).toHaveBeenCalledWith(false, "escape");
    });

    it("moves focus into the sidebar when opened", () => {
      render(
        <Layout
          sidebar={<button type="button">First sidebar action</button>}
          sidebarOpen
        >
          <button type="button">Content action</button>
        </Layout>,
      );

      expect(screen.getByRole("button", { name: "First sidebar action" })).toHaveFocus();
    });

    it("keeps Tab focus inside the open sidebar", () => {
      render(
        <Layout
          sidebar={
            <>
              <button type="button">First</button>
              <button type="button">Last</button>
            </>
          }
          sidebarOpen
        >
          <button type="button">Content action</button>
        </Layout>,
      );

      const first = screen.getByRole("button", { name: "First" });
      const last = screen.getByRole("button", { name: "Last" });

      last.focus();
      fireEvent.keyDown(document, { key: "Tab" });
      expect(first).toHaveFocus();

      fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
      expect(last).toHaveFocus();
    });

    it("restores focus when the open sidebar closes", async () => {
      function ControlledLayout() {
        const [open, setOpen] = useState(false);

        return (
          <>
            <button type="button" onClick={() => setOpen(true)}>Trigger</button>
            <Layout
              sidebar={<button type="button">Sidebar action</button>}
              sidebarOpen={open}
              onSidebarOpenChange={setOpen}
            >
              <p>Content</p>
            </Layout>
          </>
        );
      }

      render(<ControlledLayout />);
      const trigger = screen.getByRole("button", { name: "Trigger" });

      trigger.focus();
      fireEvent.click(trigger);
      expect(screen.getByRole("button", { name: "Sidebar action" })).toHaveFocus();
      fireEvent.keyDown(document, { key: "Escape" });

      await waitFor(() => expect(trigger).toHaveFocus());
    });

    it("applies end placement class when sidebarPlacement is end", () => {
      const { container } = render(
        <Layout sidebar={<nav>Nav</nav>} sidebarPlacement="end">
          <p>Content</p>
        </Layout>,
      );
      expect(container.querySelector("[class*='bodySidebarEnd']")).not.toBeNull();
    });

    it.each(["narrow", "medium", "wide"] as const)(
      "applies %s sidebar breakpoint class",
      (sidebarBreakpoint) => {
        const { container } = render(
          <Layout sidebar={<nav>Nav</nav>} sidebarBreakpoint={sidebarBreakpoint}>
            <p>Content</p>
          </Layout>,
        );
        const expectedClass = {
          narrow: /breakpointNarrow/,
          medium: /breakpointMedium/,
          wide: /breakpointWide/,
        }[sidebarBreakpoint];
        expect(container.querySelector("[class*='body']")?.className).toMatch(expectedClass);
      },
    );

    it("applies rail collapsed class and collapsed width variable", () => {
      const { container } = render(
        <Layout
          sidebar={<nav>Nav</nav>}
          sidebarCollapseMode="rail"
          sidebarCollapsed
          sidebarCollapsedWidth={64}
        >
          <p>Content</p>
        </Layout>,
      );
      const body = container.querySelector("[class*='body']") as HTMLElement;
      const aside = container.querySelector("aside") as HTMLElement;

      expect(body.className).toMatch(/collapseRail/);
      expect(body.className).toMatch(/sidebarCollapsed/);
      expect(aside.style.getPropertyValue("--layout-sidebar-collapsed-width")).toBe("64px");
    });

    it("custom trigger collapses and expands a rail sidebar", () => {
      function ControlledLayout() {
        const [collapsed, setCollapsed] = useState(false);

        return (
          <>
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
            >
              Toggle sidebar
            </button>
            <Layout
              sidebar={<nav>Nav</nav>}
              sidebarCollapseMode="rail"
              sidebarCollapsed={collapsed}
            >
              <p>Content</p>
            </Layout>
          </>
        );
      }

      const { container } = render(<ControlledLayout />);
      const body = () => container.querySelector("[class*='body']") as HTMLElement;

      expect(body().className).not.toMatch(/sidebarCollapsed/);
      fireEvent.click(screen.getByRole("button", { name: "Toggle sidebar" }));
      expect(body().className).toMatch(/sidebarCollapsed/);
      fireEvent.click(screen.getByRole("button", { name: "Toggle sidebar" }));
      expect(body().className).not.toMatch(/sidebarCollapsed/);
    });

    it("can close the mobile sidebar when a navigation item is selected", async () => {
      function ControlledLayout() {
        const [open, setOpen] = useState(true);

        return (
          <Layout
            sidebar={
              <button type="button" onClick={() => setOpen(false)}>
                Home
              </button>
            }
            sidebarOpen={open}
            onSidebarOpenChange={setOpen}
          >
            <p>Content</p>
          </Layout>
        );
      }

      const { container } = render(<ControlledLayout />);
      const body = () => container.querySelector("[class*='body']") as HTMLElement;

      expect(body().className).toMatch(/bodySidebarOpen/);
      fireEvent.click(screen.getByRole("button", { name: "Home" }));

      await waitFor(() => {
        expect(body().className).not.toMatch(/bodySidebarOpen/);
      });
    });
  });
});
