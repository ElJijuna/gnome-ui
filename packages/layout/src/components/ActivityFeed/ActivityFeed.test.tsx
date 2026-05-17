import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ActivityFeed } from "./ActivityFeed";
import type { ActivityFeedItem } from "./ActivityFeed";

const NOW = new Date("2025-06-01T12:00:00Z");

function makeItem(overrides: Partial<ActivityFeedItem> = {}): ActivityFeedItem {
  return {
    id: "1",
    label: "User logged in",
    timestamp: new Date("2025-06-01T11:58:00Z"), // 2 minutes ago
    ...overrides,
  };
}

function makeItems(count: number): ActivityFeedItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    label: `Event ${i + 1}`,
    timestamp: new Date(NOW.getTime() - (i + 1) * 60_000),
  }));
}

describe("ActivityFeed", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("items", () => {
    it("renders each item label", () => {
      render(
        <ActivityFeed
          items={[
            makeItem({ id: "1", label: "File uploaded" }),
            makeItem({ id: "2", label: "User joined" }),
          ]}
        />,
      );
      expect(screen.getByText("File uploaded")).toBeInTheDocument();
      expect(screen.getByText("User joined")).toBeInTheDocument();
    });

    it("renders description when provided", () => {
      render(
        <ActivityFeed
          items={[makeItem({ description: "admin@example.com" })]}
        />,
      );
      expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    });

    it("does not render description when omitted", () => {
      render(<ActivityFeed items={[makeItem()]} />);
      expect(screen.queryByText("admin@example.com")).toBeNull();
    });

    it("renders icon when provided", () => {
      render(
        <ActivityFeed
          items={[makeItem({ icon: <span data-testid="icon" /> })]}
        />,
      );
      expect(screen.getByTestId("icon")).toBeInTheDocument();
    });
  });

  describe("timestamps", () => {
    it("shows 'now' for timestamps under 1 minute ago", () => {
      render(
        <ActivityFeed
          items={[makeItem({ timestamp: new Date(NOW.getTime() - 30_000) })]}
        />,
      );
      expect(screen.getByText("now")).toBeInTheDocument();
    });

    it("shows minutes for timestamps under 1 hour ago", () => {
      render(
        <ActivityFeed
          items={[makeItem({ timestamp: new Date(NOW.getTime() - 2 * 60_000) })]}
        />,
      );
      expect(screen.getByText("2 minutes ago")).toBeInTheDocument();
    });

    it("shows singular 'minute' for exactly 1 minute ago", () => {
      render(
        <ActivityFeed
          items={[makeItem({ timestamp: new Date(NOW.getTime() - 60_000) })]}
        />,
      );
      expect(screen.getByText("1 minute ago")).toBeInTheDocument();
    });

    it("shows hours for timestamps under 1 day ago", () => {
      render(
        <ActivityFeed
          items={[makeItem({ timestamp: new Date(NOW.getTime() - 3 * 3600_000) })]}
        />,
      );
      expect(screen.getByText("3 hours ago")).toBeInTheDocument();
    });

    it("shows days for timestamps over 1 day ago", () => {
      render(
        <ActivityFeed
          items={[makeItem({ timestamp: new Date(NOW.getTime() - 2 * 86400_000) })]}
        />,
      );
      expect(screen.getByText("2 days ago")).toBeInTheDocument();
    });

    it("renders a <time> element with the ISO dateTime attribute", () => {
      const ts = new Date("2025-06-01T11:58:00Z");
      render(<ActivityFeed items={[makeItem({ timestamp: ts })]} />);
      const time = document.querySelector("time");
      expect(time).toHaveAttribute("dateTime", ts.toISOString());
    });
  });

  describe("maxItems", () => {
    it("shows only maxItems items when list is longer", () => {
      render(<ActivityFeed items={makeItems(6)} maxItems={3} />);
      expect(screen.getAllByRole("listitem")).toHaveLength(3);
    });

    it("shows 'Show N more' button when truncated", () => {
      render(<ActivityFeed items={makeItems(6)} maxItems={3} />);
      expect(screen.getByRole("button", { name: "Show 3 more" })).toBeInTheDocument();
    });

    it("shows all items after clicking 'Show more'", () => {
      render(<ActivityFeed items={makeItems(6)} maxItems={3} />);
      fireEvent.click(screen.getByRole("button", { name: "Show 3 more" }));
      expect(screen.getAllByRole("listitem")).toHaveLength(6);
    });

    it("hides 'Show more' button after expanding", () => {
      render(<ActivityFeed items={makeItems(6)} maxItems={3} />);
      fireEvent.click(screen.getByRole("button", { name: "Show 3 more" }));
      expect(screen.queryByRole("button", { name: /Show .* more/ })).toBeNull();
    });

    it("does not render 'Show more' when items <= maxItems", () => {
      render(<ActivityFeed items={makeItems(3)} maxItems={5} />);
      expect(screen.queryByRole("button")).toBeNull();
    });
  });

  describe("loading", () => {
    it("renders with aria-busy='true' when loading", () => {
      const { container } = render(<ActivityFeed items={[]} loading />);
      expect(container.firstChild).toHaveAttribute("aria-busy", "true");
    });

    it("does not render item labels when loading", () => {
      render(
        <ActivityFeed items={[makeItem({ label: "Hidden label" })]} loading />,
      );
      expect(screen.queryByText("Hidden label")).toBeNull();
    });
  });

  describe("emptyState", () => {
    it("renders emptyState content when items is empty", () => {
      render(
        <ActivityFeed
          items={[]}
          emptyState={<p>No activity yet</p>}
        />,
      );
      expect(screen.getByText("No activity yet")).toBeInTheDocument();
    });

    it("renders nothing extra when items is empty and emptyState is omitted", () => {
      const { container } = render(<ActivityFeed items={[]} />);
      expect(container.firstChild?.childNodes).toHaveLength(0);
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className to the root element", () => {
      const { container } = render(
        <ActivityFeed items={[]} className="my-feed" />,
      );
      expect(container.firstChild).toHaveClass("my-feed");
    });

    it("forwards data attributes", () => {
      const { container } = render(
        <ActivityFeed items={[]} data-testid="feed" />,
      );
      expect(container.firstChild).toHaveAttribute("data-testid", "feed");
    });
  });
});
