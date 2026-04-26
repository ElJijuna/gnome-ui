import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  describe("rendering", () => {
    it("renders a checkbox input", () => {
      render(<Checkbox aria-label="Accept terms" />);
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("renders as type=checkbox", () => {
      render(<Checkbox aria-label="Accept" />);
      expect(screen.getByRole("checkbox")).toHaveAttribute("type", "checkbox");
    });
  });

  describe("checked state", () => {
    it("is unchecked by default", () => {
      render(<Checkbox aria-label="Accept" />);
      expect(screen.getByRole("checkbox")).not.toBeChecked();
    });

    it("is checked when defaultChecked is true", () => {
      render(<Checkbox aria-label="Accept" defaultChecked />);
      expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("reflects controlled checked prop", () => {
      render(<Checkbox aria-label="Accept" checked onChange={() => {}} />);
      expect(screen.getByRole("checkbox")).toBeChecked();
    });
  });

  describe("indeterminate state", () => {
    it("sets indeterminate property when prop is true", () => {
      render(<Checkbox aria-label="Select all" indeterminate />);
      const input = screen.getByRole("checkbox") as HTMLInputElement;
      expect(input.indeterminate).toBe(true);
    });

    it("clears indeterminate when prop is false", () => {
      render(<Checkbox aria-label="Select all" indeterminate={false} />);
      const input = screen.getByRole("checkbox") as HTMLInputElement;
      expect(input.indeterminate).toBe(false);
    });
  });

  describe("interactions", () => {
    it("calls onChange when clicked", async () => {
      const onChange = vi.fn();
      render(<Checkbox aria-label="Accept" onChange={onChange} />);
      await userEvent.click(screen.getByRole("checkbox"));
      expect(onChange).toHaveBeenCalledOnce();
    });

    it("does not call onChange when disabled", async () => {
      const onChange = vi.fn();
      render(<Checkbox aria-label="Accept" disabled onChange={onChange} />);
      await userEvent.click(screen.getByRole("checkbox"));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className", () => {
      render(<Checkbox aria-label="Accept" className="custom" />);
      expect(screen.getByRole("checkbox")).toHaveClass("custom");
    });

    it("forwards aria-label", () => {
      render(<Checkbox aria-label="Select row" />);
      expect(screen.getByRole("checkbox")).toHaveAttribute(
        "aria-label",
        "Select row",
      );
    });

    it("is disabled when disabled prop is set", () => {
      render(<Checkbox aria-label="Accept" disabled />);
      expect(screen.getByRole("checkbox")).toBeDisabled();
    });
  });
});
