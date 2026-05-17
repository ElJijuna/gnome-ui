import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Text } from "./Text";

describe("Text", () => {
  describe("default rendering", () => {
    it("renders children", () => {
      render(<Text>Hello</Text>);
      expect(screen.getByText("Hello")).toBeInTheDocument();
    });

    it("defaults to body variant — renders a <p>", () => {
      const { container } = render(<Text>Body text</Text>);
      expect(container.querySelector("p")).toBeInTheDocument();
    });
  });

  describe("variant → element mapping", () => {
    it.each([
      ["large-title", "h1"],
      ["title-1",     "h1"],
      ["title-2",     "h2"],
      ["title-3",     "h3"],
      ["title-4",     "h4"],
      ["heading",     "h3"],
      ["body",        "p"],
      ["document",    "p"],
      ["caption",     "span"],
      ["caption-heading", "span"],
      ["monospace",   "code"],
      ["numeric",     "span"],
    ] as const)(
      "%s renders <%s>",
      (variant, tag) => {
        const { container } = render(<Text variant={variant}>text</Text>);
        expect(container.querySelector(tag)).toBeInTheDocument();
      },
    );
  });

  describe("as prop", () => {
    it("overrides the rendered element", () => {
      const { container } = render(<Text as="div">text</Text>);
      expect(container.querySelector("div")).toBeInTheDocument();
      expect(container.querySelector("p")).toBeNull();
    });

    it("renders as span when as='span'", () => {
      const { container } = render(<Text variant="body" as="span">text</Text>);
      expect(container.querySelector("span")).toBeInTheDocument();
    });
  });

  describe("color", () => {
    it.each(["default", "dim", "accent", "destructive", "success", "warning", "error"] as const)(
      "applies color-%s class for color='%s'",
      (color) => {
        const { container } = render(<Text color={color}>text</Text>);
        expect(container.firstElementChild!.className).toMatch(new RegExp(`color-${color}`));
      },
    );

    it("defaults to color-default class", () => {
      const { container } = render(<Text>text</Text>);
      expect(container.firstElementChild!.className).toMatch(/color-default/);
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className to the root element", () => {
      const { container } = render(<Text className="custom">text</Text>);
      expect(container.firstElementChild).toHaveClass("custom");
    });

    it("forwards data attributes", () => {
      const { container } = render(<Text data-testid="my-text">text</Text>);
      expect(container.firstElementChild).toHaveAttribute("data-testid", "my-text");
    });

    it("forwards aria-label", () => {
      const { container } = render(<Text aria-label="desc">text</Text>);
      expect(container.firstElementChild).toHaveAttribute("aria-label", "desc");
    });
  });
});
