import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  describe("rendering", () => {
    it("renders initials from name when no src is provided", () => {
      render(<Avatar name="Alice Bob" />);
      expect(screen.getByText("AB")).toBeInTheDocument();
    });

    it("renders an img when src is provided", () => {
      const { container } = render(
        <Avatar name="Alice" src="https://example.com/alice.jpg" />,
      );
      const img = container.querySelector("img");
      expect(img).toBeInTheDocument();
    });

    it("uses name as alt text by default", () => {
      const { container } = render(
        <Avatar name="Alice" src="https://example.com/alice.jpg" />,
      );
      const img = container.querySelector("img");
      expect(img).toHaveAttribute("alt", "Alice");
    });

    it("uses explicit alt text when provided", () => {
      const { container } = render(
        <Avatar
          name="Alice"
          src="https://example.com/alice.jpg"
          alt="Profile photo"
        />,
      );
      const img = container.querySelector("img");
      expect(img).toHaveAttribute("alt", "Profile photo");
    });

    it("does not render an img when src is omitted", () => {
      const { container } = render(<Avatar name="Alice" />);
      expect(container.querySelector("img")).not.toBeInTheDocument();
    });
  });

  describe("initials", () => {
    it("generates single initial from one-word name", () => {
      render(<Avatar name="Alice" />);
      expect(screen.getByText("A")).toBeInTheDocument();
    });

    it("generates two initials from two-word name", () => {
      render(<Avatar name="John Doe" />);
      expect(screen.getByText("JD")).toBeInTheDocument();
    });
  });

  describe("sizes", () => {
    it.each(["sm", "md", "lg", "xl"] as const)("applies %s size class", (size) => {
      const { container } = render(<Avatar name="A" size={size} />);
      expect(container.querySelector("span")!.className).toMatch(
        new RegExp(size),
      );
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className", () => {
      const { container } = render(<Avatar name="A" className="custom" />);
      expect(container.querySelector("span")).toHaveClass("custom");
    });
  });
});
