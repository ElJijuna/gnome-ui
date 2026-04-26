import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge", () => {
  describe("rendering", () => {
    it("renders children as text", () => {
      render(<Badge>42</Badge>);
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("renders a dot badge without children", () => {
      const { container } = render(<Badge dot />);
      const badge = container.querySelector("span");
      expect(badge).toBeInTheDocument();
      expect(badge).toBeEmptyDOMElement();
    });

    it("does not render children when dot is true", () => {
      render(<Badge dot>99</Badge>);
      expect(screen.queryByText("99")).not.toBeInTheDocument();
    });
  });

  describe("variants", () => {
    it.each(["accent", "success", "warning", "error", "neutral"] as const)(
      "applies %s variant class",
      (variant) => {
        const { container } = render(<Badge variant={variant}>1</Badge>);
        expect(container.querySelector("span")!.className).toMatch(
          new RegExp(variant),
        );
      },
    );

    it("defaults to accent variant", () => {
      const { container } = render(<Badge>1</Badge>);
      expect(container.querySelector("span")!.className).toMatch(/accent/);
    });
  });

  describe("anchor mode", () => {
    it("renders anchor child alongside the badge", () => {
      render(
        <Badge anchor={<button>Icon</button>}>3</Badge>,
      );
      expect(screen.getByRole("button", { name: "Icon" })).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("applies anchored class when anchor is provided", () => {
      const { container } = render(
        <Badge anchor={<span />}>5</Badge>,
      );
      expect(container.querySelector("span[class*='anchored']")).toBeInTheDocument();
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className", () => {
      const { container } = render(<Badge className="custom">1</Badge>);
      expect(container.querySelector("span")).toHaveClass("custom");
    });

    it("forwards aria-label", () => {
      const { container } = render(<Badge aria-label="3 notifications">3</Badge>);
      expect(container.querySelector("span")).toHaveAttribute(
        "aria-label",
        "3 notifications",
      );
    });
  });
});
