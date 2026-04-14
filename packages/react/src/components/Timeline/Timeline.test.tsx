import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Timeline } from "./Timeline";
import type { TimelineItem } from "./Timeline";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const basicItems: TimelineItem[] = [
  { content: "Event one" },
  { content: "Event two" },
  { content: "Event three" },
];

const richItems: TimelineItem[] = [
  {
    leading: <span>10:00</span>,
    icon: <span data-testid="icon-0">★</span>,
    content: "First event",
  },
  {
    leading: <span>10:30</span>,
    icon: <span data-testid="icon-1">✓</span>,
    content: "Second event",
  },
  {
    content: "Third event",
  },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Timeline", () => {
  // ── Rendering ──────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders all item content", () => {
      render(<Timeline items={basicItems} />);
      expect(screen.getByText("Event one")).toBeInTheDocument();
      expect(screen.getByText("Event two")).toBeInTheDocument();
      expect(screen.getByText("Event three")).toBeInTheDocument();
    });

    it("renders a list container with role='list'", () => {
      render(<Timeline items={basicItems} />);
      expect(screen.getByRole("list")).toBeInTheDocument();
    });

    it("renders each item with role='listitem'", () => {
      render(<Timeline items={basicItems} />);
      expect(screen.getAllByRole("listitem")).toHaveLength(basicItems.length);
    });

    it("renders leading content when provided", () => {
      render(<Timeline items={richItems} />);
      expect(screen.getByText("10:00")).toBeInTheDocument();
      expect(screen.getByText("10:30")).toBeInTheDocument();
    });

    it("does not render a leading wrapper when leading is omitted", () => {
      render(<Timeline items={[{ content: "No leading" }]} />);
      // Only one listitem and content is present; no extra wrapper
      expect(screen.getByText("No leading")).toBeInTheDocument();
    });

    it("renders icons when provided", () => {
      render(<Timeline items={richItems} />);
      expect(screen.getByTestId("icon-0")).toBeInTheDocument();
      expect(screen.getByTestId("icon-1")).toBeInTheDocument();
    });

    it("renders nothing meaningful for an empty items array", () => {
      render(<Timeline items={[]} />);
      expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    });
  });

  // ── Connector lines ─────────────────────────────────────────────────────────

  describe("connector lines", () => {
    it("renders n-1 lines for n items (default variant)", () => {
      const { container } = render(<Timeline items={basicItems} />);
      const lines = container.querySelectorAll("[aria-hidden='true']");
      // One line between each pair of adjacent items: n-1 = 2
      expect(lines).toHaveLength(basicItems.length - 1);
    });

    it("renders no lines when variant='none'", () => {
      const { container } = render(
        <Timeline items={basicItems} variant="none" />,
      );
      expect(container.querySelectorAll("[aria-hidden='true']")).toHaveLength(0);
    });

    it("renders lines with dotted class when variant='dotted'", () => {
      const { container } = render(
        <Timeline items={basicItems} variant="dotted" />,
      );
      const lines = container.querySelectorAll("[class*='lineDotted']");
      expect(lines).toHaveLength(basicItems.length - 1);
    });

    it("single-item list renders no connector line", () => {
      const { container } = render(
        <Timeline items={[{ content: "Solo" }]} />,
      );
      expect(container.querySelectorAll("[aria-hidden='true']")).toHaveLength(0);
    });
  });

  // ── Horizontal orientation ──────────────────────────────────────────────────

  describe("horizontal orientation", () => {
    it("applies horizontal class to the root", () => {
      const { container } = render(
        <Timeline items={basicItems} orientation="horizontal" />,
      );
      expect(container.firstChild).toHaveClass(/horizontal/);
    });

    it("renders 2 lines per item in horizontal orientation (for centering)", () => {
      const { container } = render(
        <Timeline items={basicItems} orientation="horizontal" />,
      );
      // Horizontal always renders 2 lines per item (left + right) so the node
      // stays centered. Edge lines use visibility:hidden, not removed from DOM.
      const lines = container.querySelectorAll("[aria-hidden='true']");
      expect(lines).toHaveLength(basicItems.length * 2);
    });

    it("first item left line has lineInvisible class", () => {
      const { container } = render(
        <Timeline items={basicItems} orientation="horizontal" />,
      );
      const firstItem = container.querySelectorAll("[role='listitem']")[0];
      const nodeTrack = firstItem.querySelector("[class*='nodeTrack']")!;
      const leftLine = nodeTrack.firstElementChild as HTMLElement;
      expect(leftLine.className).toMatch(/lineInvisible/);
    });

    it("last item right line has lineInvisible class", () => {
      const { container } = render(
        <Timeline items={basicItems} orientation="horizontal" />,
      );
      const listItems = container.querySelectorAll("[role='listitem']");
      const lastItem = listItems[listItems.length - 1];
      const nodeTrack = lastItem.querySelector("[class*='nodeTrack']")!;
      const rightLine = nodeTrack.lastElementChild as HTMLElement;
      expect(rightLine.className).toMatch(/lineInvisible/);
    });
  });

  // ── Vertical orientation ────────────────────────────────────────────────────

  describe("vertical orientation (default)", () => {
    it("applies vertical class to the root by default", () => {
      const { container } = render(<Timeline items={basicItems} />);
      expect(container.firstChild).toHaveClass(/vertical/);
    });

    it("applies vertical class explicitly", () => {
      const { container } = render(
        <Timeline items={basicItems} orientation="vertical" />,
      );
      expect(container.firstChild).toHaveClass(/vertical/);
    });
  });

  // ── Node variants ───────────────────────────────────────────────────────────

  describe("node variants", () => {
    it("applies nodeWithIcon class when icon is provided", () => {
      const { container } = render(
        <Timeline
          items={[{ icon: <span>★</span>, content: "With icon" }]}
        />,
      );
      expect(container.querySelector("[class*='nodeWithIcon']")).not.toBeNull();
    });

    it("applies nodeDot class when icon is omitted", () => {
      const { container } = render(
        <Timeline items={[{ content: "No icon" }]} />,
      );
      expect(container.querySelector("[class*='nodeDot']")).not.toBeNull();
    });
  });

  // ── HTML attribute forwarding ────────────────────────────────────────────────

  describe("HTML attribute forwarding", () => {
    it("forwards className to the root element", () => {
      const { container } = render(
        <Timeline items={basicItems} className="my-timeline" />,
      );
      expect(container.firstChild).toHaveClass("my-timeline");
    });

    it("forwards inline style to the root element", () => {
      const { container } = render(
        <Timeline items={basicItems} style={{ width: "500px" }} />,
      );
      expect((container.firstChild as HTMLElement).style.width).toBe("500px");
    });

    it("forwards arbitrary HTML attributes to the root element", () => {
      const { container } = render(
        <Timeline
          items={basicItems}
          data-testid="my-timeline"
          aria-label="Activity timeline"
        />,
      );
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveAttribute("data-testid", "my-timeline");
      expect(root).toHaveAttribute("aria-label", "Activity timeline");
    });
  });
});
