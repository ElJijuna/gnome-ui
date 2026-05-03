import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  describe("variants", () => {
    it("renders a rectangular block with width and height", () => {
      render(<Skeleton width={200} height={20} data-testid="skeleton" />);
      const skeleton = screen.getByTestId("skeleton");

      expect(skeleton.className).toMatch(/rect/);
      expect(skeleton).toHaveStyle({ width: "200px", height: "20px" });
    });

    it("accepts string dimensions for rectangular blocks", () => {
      render(<Skeleton width="12rem" height="2em" data-testid="skeleton" />);
      expect(screen.getByTestId("skeleton")).toHaveStyle({
        width: "12rem",
        height: "2em",
      });
    });

    it("renders a circular block with size", () => {
      render(<Skeleton variant="circle" size={40} data-testid="skeleton" />);
      const skeleton = screen.getByTestId("skeleton");

      expect(skeleton.className).toMatch(/circle/);
      expect(skeleton).toHaveStyle({ width: "40px", height: "40px" });
    });

    it("renders text rows and makes the last row shorter", () => {
      const { container } = render(
        <Skeleton variant="text" lines={3} data-testid="skeleton" />,
      );
      const lines = container.querySelectorAll("[class*='line']");

      expect(screen.getByTestId("skeleton").className).toMatch(/text/);
      expect(lines).toHaveLength(3);
      expect(lines[2]).toHaveStyle({ "--skeleton-line-width": "60%" });
    });
  });

  describe("animation", () => {
    it("is animated by default", () => {
      render(<Skeleton data-testid="skeleton" />);
      expect(screen.getByTestId("skeleton").className).toMatch(/animated/);
    });

    it("does not apply the animated class when disabled", () => {
      render(<Skeleton animated={false} data-testid="skeleton" />);
      expect(screen.getByTestId("skeleton").className).not.toMatch(/animated/);
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className", () => {
      render(<Skeleton className="custom" data-testid="skeleton" />);
      expect(screen.getByTestId("skeleton")).toHaveClass("custom");
    });

    it("is hidden from assistive technologies by default", () => {
      render(<Skeleton data-testid="skeleton" />);
      expect(screen.getByTestId("skeleton")).toHaveAttribute("aria-hidden", "true");
    });
  });
});
