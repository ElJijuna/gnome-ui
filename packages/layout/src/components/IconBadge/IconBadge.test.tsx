import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { IconBadge } from "./IconBadge";

describe("IconBadge", () => {
  describe("rendering", () => {
    it("renders children", () => {
      render(<IconBadge>🚀</IconBadge>);
      expect(screen.getByText("🚀")).toBeInTheDocument();
    });

    it("renders with a color prop", () => {
      render(<IconBadge color="blue">🔵</IconBadge>);
      expect(screen.getByText("🔵")).toBeInTheDocument();
    });

    it("renders without a color prop (neutral)", () => {
      render(<IconBadge>📄</IconBadge>);
      expect(screen.getByText("📄")).toBeInTheDocument();
    });
  });

  describe("CSS classes", () => {
    it("applies the color class when color is provided", () => {
      const { container } = render(<IconBadge color="green">🌿</IconBadge>);
      expect((container.firstChild as HTMLElement).className).toMatch(/green/);
    });

    it("applies the neutral class when color is omitted", () => {
      const { container } = render(<IconBadge>📄</IconBadge>);
      expect((container.firstChild as HTMLElement).className).toMatch(/neutral/);
    });

    it("applies the size class", () => {
      const { container } = render(<IconBadge size="lg">🌿</IconBadge>);
      expect((container.firstChild as HTMLElement).className).toMatch(/lg/);
    });

    it("defaults to md size", () => {
      const { container } = render(<IconBadge>📄</IconBadge>);
      expect((container.firstChild as HTMLElement).className).toMatch(/md/);
    });
  });

  describe("hex color support", () => {
    it("applies inline background with color-mix for 6-digit hex", () => {
      const { container } = render(<IconBadge color="#4a90e2">🔵</IconBadge>);
      const el = container.firstChild as HTMLElement;
      expect(el.style.background).toContain("color-mix");
      expect(el.style.color).toBeTruthy();
    });

    it("applies inline background with color-mix for 3-digit hex", () => {
      const { container } = render(<IconBadge color="#abc">🟣</IconBadge>);
      const el = container.firstChild as HTMLElement;
      expect(el.style.background).toContain("color-mix");
    });

    it("does not apply a color CSS class when hex is provided", () => {
      const { container } = render(<IconBadge color="#ff0000">🔴</IconBadge>);
      const className = (container.firstChild as HTMLElement).className;
      expect(className).not.toMatch(/blue|green|red|orange|yellow|purple|brown/);
    });

    it("still applies neutral class when no color", () => {
      const { container } = render(<IconBadge>📄</IconBadge>);
      expect((container.firstChild as HTMLElement).className).toMatch(/neutral/);
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className", () => {
      const { container } = render(<IconBadge className="custom">📄</IconBadge>);
      expect(container.firstChild).toHaveClass("custom");
    });

    it("forwards inline style", () => {
      const { container } = render(<IconBadge style={{ opacity: 0.5 }}>📄</IconBadge>);
      expect((container.firstChild as HTMLElement).style.opacity).toBe("0.5");
    });

    it("forwards arbitrary HTML attributes", () => {
      render(<IconBadge data-testid="badge">📄</IconBadge>);
      expect(screen.getByTestId("badge")).toBeInTheDocument();
    });
  });
});
