import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextField } from "./TextField";

describe("TextField", () => {
  describe("rendering", () => {
    it("renders a text input", () => {
      render(<TextField />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("renders a label when provided", () => {
      render(<TextField label="Username" />);
      expect(screen.getByLabelText("Username")).toBeInTheDocument();
    });

    it("does not render a label when omitted", () => {
      render(<TextField />);
      expect(screen.queryByText(/label/i)).not.toBeInTheDocument();
    });

    it("renders helper text below the input", () => {
      render(<TextField helperText="Enter your username" />);
      expect(screen.getByText("Enter your username")).toBeInTheDocument();
    });

    it("renders error message instead of helper text", () => {
      render(
        <TextField helperText="Helper" error="This field is required" />,
      );
      expect(screen.getByText("This field is required")).toBeInTheDocument();
      expect(screen.queryByText("Helper")).not.toBeInTheDocument();
    });

    it("does not render hint area when neither error nor helperText is set", () => {
      const { container } = render(<TextField />);
      expect(container.querySelector("[id$='-help']")).not.toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("associates label with input via htmlFor/id", () => {
      render(<TextField label="Email" />);
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
    });

    it("sets aria-describedby when helperText is present", () => {
      render(<TextField helperText="Some hint" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-describedby");
    });

    it("sets aria-invalid when error is present", () => {
      render(<TextField error="Required" />);
      expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    });

    it("does not set aria-invalid without error", () => {
      render(<TextField />);
      expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
    });
  });

  describe("disabled state", () => {
    it("disables the input", () => {
      render(<TextField disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });
  });

  describe("interactions", () => {
    it("accepts typed input", async () => {
      render(<TextField />);
      const input = screen.getByRole("textbox");
      await userEvent.type(input, "hello");
      expect(input).toHaveValue("hello");
    });

    it("calls onChange on input", async () => {
      const onChange = vi.fn();
      render(<TextField onChange={onChange} />);
      await userEvent.type(screen.getByRole("textbox"), "a");
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards placeholder", () => {
      render(<TextField placeholder="Type here…" />);
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "placeholder",
        "Type here…",
      );
    });

    it("forwards className to the input", () => {
      render(<TextField className="custom" />);
      expect(screen.getByRole("textbox")).toHaveClass("custom");
    });

    it("forwards data attributes", () => {
      render(<TextField data-testid="my-field" />);
      expect(screen.getByTestId("my-field")).toBeInTheDocument();
    });
  });
});
