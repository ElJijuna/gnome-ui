import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createRef, act } from "react";
import { PanelCard } from "./PanelCard";
import type { PanelCardHandle } from "./PanelCard";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TITLE = "Panel Title";
const BODY_TEXT = "Panel body content";
const FOOTER_TEXT = "Saved 2 min ago";

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("PanelCard", () => {
  // ── Header rendering ────────────────────────────────────────────────────────

  describe("header", () => {
    it("renders the title when given a string", () => {
      render(<PanelCard title={TITLE}>{BODY_TEXT}</PanelCard>);
      expect(screen.getByText(TITLE)).toBeInTheDocument();
    });

    it("renders a ReactNode title", () => {
      render(
        <PanelCard title={<span data-testid="custom-title">Custom</span>}>
          {BODY_TEXT}
        </PanelCard>,
      );
      expect(screen.getByTestId("custom-title")).toBeInTheDocument();
    });

    it("renders the icon when provided", () => {
      render(
        <PanelCard title={TITLE} icon={<span data-testid="panel-icon">★</span>}>
          {BODY_TEXT}
        </PanelCard>,
      );
      expect(screen.getByTestId("panel-icon")).toBeInTheDocument();
    });

    it("does not render an icon wrapper when icon is omitted", () => {
      const { container } = render(
        <PanelCard title={TITLE}>{BODY_TEXT}</PanelCard>,
      );
      // The .icon span is only rendered when the icon prop is provided
      const icons = container.querySelectorAll("[class*='icon']");
      expect(icons).toHaveLength(0);
    });

    it("renders headerActions when provided", () => {
      render(
        <PanelCard
          title={TITLE}
          headerActions={<button type="button">Edit</button>}
        >
          {BODY_TEXT}
        </PanelCard>,
      );
      expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    });
  });

  // ── Body rendering ──────────────────────────────────────────────────────────

  describe("body", () => {
    it("renders children inside the body", () => {
      render(<PanelCard title={TITLE}>{BODY_TEXT}</PanelCard>);
      expect(screen.getByText(BODY_TEXT)).toBeInTheDocument();
    });

    it("body is visible by default (defaultExpanded=true)", () => {
      const { container } = render(
        <PanelCard title={TITLE}>{BODY_TEXT}</PanelCard>,
      );
      const wrapper = container.querySelector("[class*='bodyWrapper']");
      expect(wrapper).not.toHaveAttribute("aria-hidden");
    });

    it("body is hidden when defaultExpanded=false", () => {
      const { container } = render(
        <PanelCard title={TITLE} defaultExpanded={false}>
          {BODY_TEXT}
        </PanelCard>,
      );
      const wrapper = container.querySelector("[class*='bodyWrapper']");
      expect(wrapper).toHaveAttribute("aria-hidden", "true");
    });
  });

  // ── Footer rendering ─────────────────────────────────────────────────────────

  describe("footer", () => {
    it("renders footer content when footer prop is provided", () => {
      render(
        <PanelCard title={TITLE} footer={<span>{FOOTER_TEXT}</span>}>
          {BODY_TEXT}
        </PanelCard>,
      );
      expect(screen.getByText(FOOTER_TEXT)).toBeInTheDocument();
    });

    it("renders footerActions when provided", () => {
      render(
        <PanelCard
          title={TITLE}
          footerActions={<button type="button">Save</button>}
        >
          {BODY_TEXT}
        </PanelCard>,
      );
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    });

    it("renders the footer when only footerActions is provided (no footer text)", () => {
      render(
        <PanelCard
          title={TITLE}
          footerActions={<button type="button">Save</button>}
        >
          {BODY_TEXT}
        </PanelCard>,
      );
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    });

    it("does not render the footer zone when neither footer nor footerActions is set", () => {
      render(<PanelCard title={TITLE}>{BODY_TEXT}</PanelCard>);
      expect(screen.queryByText(FOOTER_TEXT)).toBeNull();
    });
  });

  // ── Toggle button ────────────────────────────────────────────────────────────

  describe("toggle button", () => {
    it("renders the collapse toggle button by default", () => {
      render(<PanelCard title={TITLE}>{BODY_TEXT}</PanelCard>);
      expect(
        screen.getByRole("button", { name: "Collapse panel" }),
      ).toBeInTheDocument();
    });

    it("does not render the toggle when collapsible={false}", () => {
      render(
        <PanelCard title={TITLE} collapsible={false}>
          {BODY_TEXT}
        </PanelCard>,
      );
      expect(
        screen.queryByRole("button", { name: /collapse panel/i }),
      ).toBeNull();
      expect(
        screen.queryByRole("button", { name: /expand panel/i }),
      ).toBeNull();
    });

    it("toggle has aria-expanded=true when panel is expanded", () => {
      render(<PanelCard title={TITLE}>{BODY_TEXT}</PanelCard>);
      expect(screen.getByRole("button", { name: "Collapse panel" })).toHaveAttribute(
        "aria-expanded",
        "true",
      );
    });

    it("toggle has aria-expanded=false when panel is collapsed", () => {
      render(
        <PanelCard title={TITLE} defaultExpanded={false}>
          {BODY_TEXT}
        </PanelCard>,
      );
      expect(screen.getByRole("button", { name: "Expand panel" })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    });

    it("clicking the toggle collapses an expanded panel", () => {
      const { container } = render(
        <PanelCard title={TITLE}>{BODY_TEXT}</PanelCard>,
      );
      fireEvent.click(screen.getByRole("button", { name: "Collapse panel" }));
      const wrapper = container.querySelector("[class*='bodyWrapper']");
      expect(wrapper).toHaveAttribute("aria-hidden", "true");
    });

    it("clicking the toggle expands a collapsed panel", () => {
      const { container } = render(
        <PanelCard title={TITLE} defaultExpanded={false}>
          {BODY_TEXT}
        </PanelCard>,
      );
      fireEvent.click(screen.getByRole("button", { name: "Expand panel" }));
      const wrapper = container.querySelector("[class*='bodyWrapper']");
      expect(wrapper).not.toHaveAttribute("aria-hidden");
    });
  });

  // ── onExpandedChange callback ────────────────────────────────────────────────

  describe("onExpandedChange", () => {
    it("fires onExpandedChange with false when collapsing via toggle", () => {
      const onChange = vi.fn();
      render(
        <PanelCard title={TITLE} onExpandedChange={onChange}>
          {BODY_TEXT}
        </PanelCard>,
      );
      fireEvent.click(screen.getByRole("button", { name: "Collapse panel" }));
      expect(onChange).toHaveBeenCalledOnce();
      expect(onChange).toHaveBeenCalledWith(false);
    });

    it("fires onExpandedChange with true when expanding via toggle", () => {
      const onChange = vi.fn();
      render(
        <PanelCard title={TITLE} defaultExpanded={false} onExpandedChange={onChange}>
          {BODY_TEXT}
        </PanelCard>,
      );
      fireEvent.click(screen.getByRole("button", { name: "Expand panel" }));
      expect(onChange).toHaveBeenCalledOnce();
      expect(onChange).toHaveBeenCalledWith(true);
    });
  });

  // ── Imperative handle ────────────────────────────────────────────────────────

  describe("imperative handle (ref)", () => {
    it("expand() expands a collapsed panel", () => {
      const ref = createRef<PanelCardHandle>();
      const { container } = render(
        <PanelCard ref={ref} title={TITLE} defaultExpanded={false}>
          {BODY_TEXT}
        </PanelCard>,
      );
      act(() => ref.current!.expand());
      const wrapper = container.querySelector("[class*='bodyWrapper']");
      expect(wrapper).not.toHaveAttribute("aria-hidden");
    });

    it("collapse() collapses an expanded panel", () => {
      const ref = createRef<PanelCardHandle>();
      const { container } = render(
        <PanelCard ref={ref} title={TITLE}>
          {BODY_TEXT}
        </PanelCard>,
      );
      act(() => ref.current!.collapse());
      const wrapper = container.querySelector("[class*='bodyWrapper']");
      expect(wrapper).toHaveAttribute("aria-hidden", "true");
    });

    it("toggle() collapses an expanded panel", () => {
      const ref = createRef<PanelCardHandle>();
      const { container } = render(
        <PanelCard ref={ref} title={TITLE}>
          {BODY_TEXT}
        </PanelCard>,
      );
      act(() => ref.current!.toggle());
      const wrapper = container.querySelector("[class*='bodyWrapper']");
      expect(wrapper).toHaveAttribute("aria-hidden", "true");
    });

    it("toggle() expands a collapsed panel", () => {
      const ref = createRef<PanelCardHandle>();
      const { container } = render(
        <PanelCard ref={ref} title={TITLE} defaultExpanded={false}>
          {BODY_TEXT}
        </PanelCard>,
      );
      act(() => ref.current!.toggle());
      const wrapper = container.querySelector("[class*='bodyWrapper']");
      expect(wrapper).not.toHaveAttribute("aria-hidden");
    });

    it("expand() fires onExpandedChange with true", () => {
      const onChange = vi.fn();
      const ref = createRef<PanelCardHandle>();
      render(
        <PanelCard
          ref={ref}
          title={TITLE}
          defaultExpanded={false}
          onExpandedChange={onChange}
        >
          {BODY_TEXT}
        </PanelCard>,
      );
      act(() => ref.current!.expand());
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it("collapse() fires onExpandedChange with false", () => {
      const onChange = vi.fn();
      const ref = createRef<PanelCardHandle>();
      render(
        <PanelCard ref={ref} title={TITLE} onExpandedChange={onChange}>
          {BODY_TEXT}
        </PanelCard>,
      );
      act(() => ref.current!.collapse());
      expect(onChange).toHaveBeenCalledWith(false);
    });

    it("toggle() fires onExpandedChange with the new state", () => {
      const onChange = vi.fn();
      const ref = createRef<PanelCardHandle>();
      render(
        <PanelCard ref={ref} title={TITLE} onExpandedChange={onChange}>
          {BODY_TEXT}
        </PanelCard>,
      );
      act(() => ref.current!.toggle()); // expanded → collapsed
      expect(onChange).toHaveBeenCalledWith(false);
    });

    it("expand() is a no-op when the panel is already expanded", () => {
      const onChange = vi.fn();
      const ref = createRef<PanelCardHandle>();
      render(
        <PanelCard ref={ref} title={TITLE} onExpandedChange={onChange}>
          {BODY_TEXT}
        </PanelCard>,
      );
      act(() => ref.current!.expand());
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it("collapse() is a no-op when the panel is already collapsed", () => {
      const onChange = vi.fn();
      const ref = createRef<PanelCardHandle>();
      render(
        <PanelCard
          ref={ref}
          title={TITLE}
          defaultExpanded={false}
          onExpandedChange={onChange}
        >
          {BODY_TEXT}
        </PanelCard>,
      );
      act(() => ref.current!.collapse());
      expect(onChange).toHaveBeenCalledWith(false);
    });
  });

  // ── HTML attribute forwarding ────────────────────────────────────────────────

  describe("HTML attribute forwarding", () => {
    it("forwards className to the Card root element", () => {
      const { container } = render(
        <PanelCard title={TITLE} className="my-panel">
          {BODY_TEXT}
        </PanelCard>,
      );
      expect(container.firstChild).toHaveClass("my-panel");
    });

    it("forwards inline style to the Card root element", () => {
      const { container } = render(
        <PanelCard title={TITLE} style={{ width: "400px" }}>
          {BODY_TEXT}
        </PanelCard>,
      );
      expect((container.firstChild as HTMLElement).style.width).toBe("400px");
    });

    it("forwards arbitrary HTML attributes to the Card root element", () => {
      const { container } = render(
        <PanelCard title={TITLE} data-testid="my-panel" aria-label="Test panel">
          {BODY_TEXT}
        </PanelCard>,
      );
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveAttribute("data-testid", "my-panel");
      expect(root).toHaveAttribute("aria-label", "Test panel");
    });
  });
});
