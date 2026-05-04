import { createRef } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  describe("rendering", () => {
    it("renders a <button> element", () => {
      render(<Button>Click</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("renders children", () => {
      render(<Button>Save</Button>);
      expect(screen.getByRole("button")).toHaveTextContent("Save");
    });

    it("renders leadingIcon before children", () => {
      render(
        <Button leadingIcon={<span data-testid="icon" />}>Label</Button>,
      );
      expect(screen.getByTestId("icon")).toBeInTheDocument();
    });

    it("renders trailingIcon after children", () => {
      render(
        <Button trailingIcon={<span data-testid="icon" />}>Label</Button>,
      );
      expect(screen.getByTestId("icon")).toBeInTheDocument();
    });
  });

  describe("variants", () => {
    it.each(["default", "suggested", "destructive", "flat", "raised"] as const)(
      "applies %s variant class",
      (variant) => {
        render(<Button variant={variant}>X</Button>);
        expect(screen.getByRole("button").className).toMatch(
          new RegExp(variant),
        );
      },
    );
  });

  describe("sizes", () => {
    it.each(["sm", "lg"] as const)("applies %s size class", (size) => {
      render(<Button size={size}>X</Button>);
      expect(screen.getByRole("button").className).toMatch(new RegExp(size));
    });

    it("does not apply a size class for md (default)", () => {
      render(<Button size="md">X</Button>);
      expect(screen.getByRole("button").className).not.toMatch(/\bmd\b/);
    });
  });

  describe("shapes", () => {
    it.each(["pill", "circular"] as const)("applies %s shape class", (shape) => {
      render(<Button shape={shape}>X</Button>);
      expect(screen.getByRole("button").className).toMatch(new RegExp(shape));
    });
  });

  describe("osd", () => {
    it("applies osd class when osd is true", () => {
      render(<Button osd>X</Button>);
      expect(screen.getByRole("button").className).toMatch(/osd/);
    });

    it("does not apply osd class by default", () => {
      render(<Button>X</Button>);
      expect(screen.getByRole("button").className).not.toMatch(/osd/);
    });
  });

  describe("interactions", () => {
    it("calls onClick when clicked", async () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Click</Button>);
      await userEvent.click(screen.getByRole("button"));
      expect(onClick).toHaveBeenCalledOnce();
    });

    it("does not call onClick when disabled", async () => {
      const onClick = vi.fn();
      render(<Button disabled onClick={onClick}>Click</Button>);
      await userEvent.click(screen.getByRole("button"), { pointerEventsCheck: 0 });
      expect(onClick).not.toHaveBeenCalled();
    });

    it("is disabled when disabled prop is set", () => {
      render(<Button disabled>Click</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className", () => {
      render(<Button className="custom">X</Button>);
      expect(screen.getByRole("button")).toHaveClass("custom");
    });

    it("forwards type attribute", () => {
      render(<Button type="submit">X</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
    });

    it("forwards aria-label", () => {
      render(<Button aria-label="Close dialog">X</Button>);
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-label",
        "Close dialog",
      );
    });

    it("forwards refs", () => {
      const ref = createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Save</Button>);
      expect(ref.current).toBe(screen.getByRole("button", { name: "Save" }));
    });
  });
});
