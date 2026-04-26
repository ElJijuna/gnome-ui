import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  describe("rendering", () => {
    it("renders with role=status", () => {
      render(<Spinner />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("has default aria-label", () => {
      render(<Spinner />);
      expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Loading…");
    });

    it("uses custom label when provided", () => {
      render(<Spinner label="Saving…" />);
      expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Saving…");
    });

    it("sets aria-hidden and no aria-label when label is empty string", () => {
      const { container } = render(<Spinner label="" />);
      const spinner = container.querySelector("[role='status']");
      expect(spinner).toHaveAttribute("aria-hidden", "true");
      expect(spinner).not.toHaveAttribute("aria-label");
    });
  });

  describe("sizes", () => {
    it.each(["sm", "md", "lg"] as const)("applies %s size class", (size) => {
      render(<Spinner size={size} />);
      expect(screen.getByRole("status").className).toMatch(new RegExp(size));
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className", () => {
      render(<Spinner className="custom" />);
      expect(screen.getByRole("status")).toHaveClass("custom");
    });

    it("forwards data attributes", () => {
      render(<Spinner data-testid="my-spinner" />);
      expect(screen.getByTestId("my-spinner")).toBeInTheDocument();
    });
  });
});
