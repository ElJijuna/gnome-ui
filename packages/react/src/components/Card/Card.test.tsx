import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Card } from "./Card";

describe("Card", () => {
  describe("rendering", () => {
    it("renders children", () => {
      render(<Card>Content</Card>);
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("renders as a <div> by default", () => {
      const { container } = render(<Card>Content</Card>);
      expect(container.querySelector("div")).toBeInTheDocument();
      expect(container.querySelector("button")).not.toBeInTheDocument();
    });

    it("renders as a <button> when interactive", () => {
      render(<Card interactive>Content</Card>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("renders as the element provided via as prop", () => {
      const { container } = render(<Card as="section">Content</Card>);
      expect(container.querySelector("section")).toBeInTheDocument();
    });
  });

  describe("padding", () => {
    it.each(["none", "sm", "md", "lg"] as const)(
      "applies padding-%s class",
      (padding) => {
        const { container } = render(<Card padding={padding}>Content</Card>);
        expect(container.firstElementChild!.className).toMatch(
          new RegExp(`padding-${padding}`),
        );
      },
    );

    it("defaults to padding-md", () => {
      const { container } = render(<Card>Content</Card>);
      expect(container.firstElementChild!.className).toMatch(/padding-md/);
    });
  });

  describe("interactive", () => {
    it("applies interactive class when interactive is true", () => {
      render(<Card interactive>Content</Card>);
      expect(screen.getByRole("button").className).toMatch(/interactive/);
    });

    it("does not apply interactive class by default", () => {
      const { container } = render(<Card>Content</Card>);
      expect(container.firstElementChild!.className).not.toMatch(/interactive/);
    });

    it("calls onClick when interactive card is clicked", async () => {
      const onClick = vi.fn();
      render(<Card interactive onClick={onClick}>Content</Card>);
      await userEvent.click(screen.getByRole("button"));
      expect(onClick).toHaveBeenCalledOnce();
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className", () => {
      const { container } = render(<Card className="custom">Content</Card>);
      expect(container.firstElementChild).toHaveClass("custom");
    });

    it("forwards aria-label", () => {
      render(<Card interactive aria-label="Open settings">Content</Card>);
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-label",
        "Open settings",
      );
    });
  });
});
