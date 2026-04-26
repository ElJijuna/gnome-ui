import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Separator } from "./Separator";

describe("Separator", () => {
  describe("horizontal (default)", () => {
    it("renders an <hr> element", () => {
      const { container } = render(<Separator />);
      expect(container.querySelector("hr")).toBeInTheDocument();
    });

    it("applies horizontal class", () => {
      const { container } = render(<Separator />);
      expect(container.querySelector("hr")!.className).toMatch(/horizontal/);
    });

    it("does not render a div for horizontal orientation", () => {
      const { container } = render(<Separator />);
      expect(container.querySelector("div")).not.toBeInTheDocument();
    });
  });

  describe("vertical", () => {
    it("renders a <div> with role=separator", () => {
      const { container } = render(<Separator orientation="vertical" />);
      const el = container.querySelector("div");
      expect(el).toBeInTheDocument();
      expect(el).toHaveAttribute("role", "separator");
    });

    it("sets aria-orientation=vertical", () => {
      const { container } = render(<Separator orientation="vertical" />);
      expect(container.querySelector("div")).toHaveAttribute(
        "aria-orientation",
        "vertical",
      );
    });

    it("applies vertical class", () => {
      const { container } = render(<Separator orientation="vertical" />);
      expect(container.querySelector("div")!.className).toMatch(/vertical/);
    });

    it("does not render an <hr> for vertical orientation", () => {
      const { container } = render(<Separator orientation="vertical" />);
      expect(container.querySelector("hr")).not.toBeInTheDocument();
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className to horizontal separator", () => {
      const { container } = render(<Separator className="custom" />);
      expect(container.querySelector("hr")).toHaveClass("custom");
    });

    it("forwards className to vertical separator", () => {
      const { container } = render(
        <Separator orientation="vertical" className="custom" />,
      );
      expect(container.querySelector("div")).toHaveClass("custom");
    });
  });
});
