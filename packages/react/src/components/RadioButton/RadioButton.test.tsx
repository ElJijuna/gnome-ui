import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RadioButton } from "./RadioButton";

describe("RadioButton", () => {
  describe("rendering", () => {
    it("renders a radio input", () => {
      render(<RadioButton aria-label="Option A" />);
      expect(screen.getByRole("radio")).toBeInTheDocument();
    });

    it("renders as type=radio", () => {
      render(<RadioButton aria-label="Option A" />);
      expect(screen.getByRole("radio")).toHaveAttribute("type", "radio");
    });
  });

  describe("checked state", () => {
    it("is unchecked by default", () => {
      render(<RadioButton aria-label="Option A" />);
      expect(screen.getByRole("radio")).not.toBeChecked();
    });

    it("is checked when defaultChecked is true", () => {
      render(<RadioButton aria-label="Option A" defaultChecked />);
      expect(screen.getByRole("radio")).toBeChecked();
    });

    it("reflects controlled checked prop", () => {
      render(<RadioButton aria-label="Option A" checked onChange={() => {}} />);
      expect(screen.getByRole("radio")).toBeChecked();
    });
  });

  describe("grouping", () => {
    it("groups buttons with the same name", () => {
      render(
        <>
          <RadioButton aria-label="A" name="group" value="a" />
          <RadioButton aria-label="B" name="group" value="b" />
        </>,
      );
      const radios = screen.getAllByRole("radio");
      expect(radios).toHaveLength(2);
      radios.forEach((r) => expect(r).toHaveAttribute("name", "group"));
    });
  });

  describe("interactions", () => {
    it("calls onChange when selected", async () => {
      const onChange = vi.fn();
      render(<RadioButton aria-label="Option A" onChange={onChange} />);
      await userEvent.click(screen.getByRole("radio"));
      expect(onChange).toHaveBeenCalledOnce();
    });

    it("does not call onChange when disabled", async () => {
      const onChange = vi.fn();
      render(
        <RadioButton aria-label="Option A" disabled onChange={onChange} />,
      );
      await userEvent.click(screen.getByRole("radio"), { pointerEventsCheck: 0 });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className", () => {
      render(<RadioButton aria-label="Option A" className="custom" />);
      expect(screen.getByRole("radio")).toHaveClass("custom");
    });

    it("forwards aria-label", () => {
      render(<RadioButton aria-label="Male" />);
      expect(screen.getByRole("radio")).toHaveAttribute("aria-label", "Male");
    });

    it("is disabled when disabled prop is set", () => {
      render(<RadioButton aria-label="Option A" disabled />);
      expect(screen.getByRole("radio")).toBeDisabled();
    });

    it("forwards value", () => {
      render(<RadioButton aria-label="Option A" value="option-a" />);
      expect(screen.getByRole("radio")).toHaveAttribute("value", "option-a");
    });
  });
});
