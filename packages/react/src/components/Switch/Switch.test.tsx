import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Switch } from "./Switch";

describe("Switch", () => {
  describe("rendering", () => {
    it("renders a switch input", () => {
      render(<Switch aria-label="Enable notifications" />);
      expect(screen.getByRole("switch")).toBeInTheDocument();
    });

    it("renders as a checkbox with role switch", () => {
      render(<Switch aria-label="Toggle" />);
      const input = screen.getByRole("switch");
      expect(input).toHaveAttribute("type", "checkbox");
    });
  });

  describe("checked state", () => {
    it("is unchecked by default", () => {
      render(<Switch aria-label="Toggle" defaultChecked={false} />);
      expect(screen.getByRole("switch")).not.toBeChecked();
    });

    it("is checked when defaultChecked is true", () => {
      render(<Switch aria-label="Toggle" defaultChecked />);
      expect(screen.getByRole("switch")).toBeChecked();
    });

    it("reflects controlled checked prop", () => {
      render(<Switch aria-label="Toggle" checked onChange={() => {}} />);
      expect(screen.getByRole("switch")).toBeChecked();
    });
  });

  describe("interactions", () => {
    it("calls onChange when toggled", async () => {
      const onChange = vi.fn();
      render(<Switch aria-label="Toggle" onChange={onChange} />);
      await userEvent.click(screen.getByRole("switch"));
      expect(onChange).toHaveBeenCalledOnce();
    });

    it("does not call onChange when disabled", async () => {
      const onChange = vi.fn();
      render(<Switch aria-label="Toggle" disabled onChange={onChange} />);
      await userEvent.click(screen.getByRole("switch"));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className", () => {
      render(<Switch aria-label="Toggle" className="custom" />);
      expect(screen.getByRole("switch")).toHaveClass("custom");
    });

    it("forwards aria-label", () => {
      render(<Switch aria-label="Dark mode" />);
      expect(screen.getByRole("switch")).toHaveAttribute(
        "aria-label",
        "Dark mode",
      );
    });

    it("is disabled when disabled prop is set", () => {
      render(<Switch aria-label="Toggle" disabled />);
      expect(screen.getByRole("switch")).toBeDisabled();
    });
  });
});
