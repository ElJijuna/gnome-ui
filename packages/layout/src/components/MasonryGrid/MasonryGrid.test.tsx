import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { MasonryGrid } from "./MasonryGrid";

// jsdom doesn't implement ResizeObserver
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("MasonryGrid", () => {
  describe("rendering", () => {
    it("renders children", () => {
      render(
        <MasonryGrid>
          <div>Item A</div>
          <div>Item B</div>
          <div>Item C</div>
        </MasonryGrid>,
      );
      expect(screen.getByText("Item A")).toBeInTheDocument();
      expect(screen.getByText("Item B")).toBeInTheDocument();
      expect(screen.getByText("Item C")).toBeInTheDocument();
    });

    it("wraps each child in a positioned div", () => {
      const { container } = render(
        <MasonryGrid>
          <div>A</div>
          <div>B</div>
        </MasonryGrid>,
      );
      // root + 2 item wrappers
      const divs = container.querySelectorAll("div");
      expect(divs.length).toBeGreaterThanOrEqual(3);
    });

    it("renders nothing when children is empty", () => {
      const { container } = render(<MasonryGrid />);
      // Only the root div
      expect(container.firstChild).toBeTruthy();
      expect((container.firstChild as HTMLElement).children.length).toBe(0);
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className to the root element", () => {
      const { container } = render(
        <MasonryGrid className="my-masonry">
          <div>A</div>
        </MasonryGrid>,
      );
      expect(container.firstChild).toHaveClass("my-masonry");
    });

    it("forwards data attributes to the root element", () => {
      const { container } = render(
        <MasonryGrid data-testid="masonry">
          <div>A</div>
        </MasonryGrid>,
      );
      expect(container.firstChild).toHaveAttribute("data-testid", "masonry");
    });

    it("forwards aria attributes to the root element", () => {
      const { container } = render(
        <MasonryGrid aria-label="Image gallery">
          <div>A</div>
        </MasonryGrid>,
      );
      expect(container.firstChild).toHaveAttribute("aria-label", "Image gallery");
    });
  });

  describe("columns prop", () => {
    it("accepts a fixed number of columns", () => {
      expect(() =>
        render(
          <MasonryGrid columns={4}>
            <div>A</div>
          </MasonryGrid>,
        ),
      ).not.toThrow();
    });

    it("accepts a responsive columns object", () => {
      expect(() =>
        render(
          <MasonryGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}>
            <div>A</div>
          </MasonryGrid>,
        ),
      ).not.toThrow();
    });
  });

  describe("gap prop", () => {
    it.each(["sm", "md", "lg"] as const)("accepts gap='%s'", (gap) => {
      expect(() =>
        render(
          <MasonryGrid gap={gap}>
            <div>A</div>
          </MasonryGrid>,
        ),
      ).not.toThrow();
    });

    it("accepts a responsive gap object", () => {
      expect(() =>
        render(
          <MasonryGrid gap={{ xs: "sm", md: "md", xl: "lg" }}>
            <div>A</div>
          </MasonryGrid>,
        ),
      ).not.toThrow();
    });
  });

  describe("fresh prop", () => {
    it("renders without errors when fresh=true", () => {
      expect(() =>
        render(
          <MasonryGrid fresh>
            <div>A</div>
            <div>B</div>
          </MasonryGrid>,
        ),
      ).not.toThrow();
    });
  });
});
