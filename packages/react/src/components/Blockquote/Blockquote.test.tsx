import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Blockquote } from "./Blockquote";

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Blockquote", () => {
  // ── Rendering ──────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders a <blockquote> element", () => {
      const { container } = render(<Blockquote>Text</Blockquote>);
      expect(container.querySelector("blockquote")).toBeInTheDocument();
    });

    it("renders the quoted content", () => {
      render(<Blockquote>The quick brown fox</Blockquote>);
      expect(screen.getByText("The quick brown fox")).toBeInTheDocument();
    });

    it("renders cite inside a <footer><cite> when provided", () => {
      const { container } = render(
        <Blockquote cite="Ada Lovelace">Some quote</Blockquote>,
      );
      const footer = container.querySelector("footer");
      const cite = container.querySelector("cite");
      expect(footer).toBeInTheDocument();
      expect(cite).toBeInTheDocument();
      expect(cite).toHaveTextContent("Ada Lovelace");
    });

    it("does not render a footer when cite is omitted", () => {
      const { container } = render(<Blockquote>No cite</Blockquote>);
      expect(container.querySelector("footer")).not.toBeInTheDocument();
    });

    it("renders icon when provided", () => {
      render(
        <Blockquote icon={<span data-testid="icon">★</span>}>Text</Blockquote>,
      );
      expect(screen.getByTestId("icon")).toBeInTheDocument();
    });

    it("does not render icon wrapper when icon is omitted", () => {
      const { container } = render(<Blockquote>No icon</Blockquote>);
      expect(container.querySelector("[aria-hidden='true']")).not.toBeInTheDocument();
    });

    it("renders children wrapped in a <p>", () => {
      const { container } = render(<Blockquote>Paragraph</Blockquote>);
      expect(container.querySelector("p")).toHaveTextContent("Paragraph");
    });
  });

  // ── Variants ───────────────────────────────────────────────────────────────

  describe("variants", () => {
    it("applies default variant class by default", () => {
      const { container } = render(<Blockquote>Text</Blockquote>);
      expect(container.querySelector("blockquote")).toHaveClass(/default/);
    });

    it.each(["info", "warning", "error", "success"] as const)(
      "applies %s variant class",
      (variant) => {
        const { container } = render(
          <Blockquote variant={variant}>Text</Blockquote>,
        );
        expect(container.querySelector("blockquote")).toHaveClass(
          new RegExp(variant),
        );
      },
    );
  });

  // ── HTML attribute forwarding ───────────────────────────────────────────────

  describe("HTML attribute forwarding", () => {
    it("forwards className to the root element", () => {
      const { container } = render(
        <Blockquote className="my-quote">Text</Blockquote>,
      );
      expect(container.querySelector("blockquote")).toHaveClass("my-quote");
    });

    it("forwards inline style to the root element", () => {
      const { container } = render(
        <Blockquote style={{ maxWidth: "400px" }}>Text</Blockquote>,
      );
      expect(
        (container.querySelector("blockquote") as HTMLElement).style.maxWidth,
      ).toBe("400px");
    });

    it("forwards arbitrary HTML attributes to the root element", () => {
      const { container } = render(
        <Blockquote data-testid="bq" aria-label="Quote">Text</Blockquote>,
      );
      const bq = container.querySelector("blockquote") as HTMLElement;
      expect(bq).toHaveAttribute("data-testid", "bq");
      expect(bq).toHaveAttribute("aria-label", "Quote");
    });
  });
});
