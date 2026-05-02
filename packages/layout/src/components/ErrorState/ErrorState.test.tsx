import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@gnome-ui/react";
import { ErrorState } from "./ErrorState";

describe("ErrorState", () => {
  describe("preset defaults", () => {
    it.each([
      ["generic",    "Something went wrong"],
      ["network",    "No connection"],
      ["permission", "Access denied"],
      ["not-found",  "Not found"],
    ] as const)("type '%s' renders default title '%s'", (type, title) => {
      render(<ErrorState type={type} />);
      expect(screen.getByText(title)).toBeInTheDocument();
    });

    it("defaults to generic when type is omitted", () => {
      render(<ErrorState />);
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });
  });

  describe("title override", () => {
    it("renders a custom title instead of the preset default", () => {
      render(<ErrorState type="network" title="Server unreachable" />);
      expect(screen.getByText("Server unreachable")).toBeInTheDocument();
      expect(screen.queryByText("No connection")).toBeNull();
    });
  });

  describe("description", () => {
    it("renders description when provided", () => {
      render(<ErrorState description="Please check your connection." />);
      expect(screen.getByText("Please check your connection.")).toBeInTheDocument();
    });

    it("does not render description when omitted", () => {
      render(<ErrorState />);
      expect(screen.queryByText("Please check your connection.")).toBeNull();
    });
  });

  describe("icon override", () => {
    it("renders a custom icon instead of the preset icon", () => {
      render(<ErrorState icon={<svg data-testid="custom-icon" />} />);
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });
  });

  describe("action", () => {
    it("renders the action slot when provided", () => {
      render(
        <ErrorState action={<Button variant="suggested">Try again</Button>} />,
      );
      expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    });

    it("does not render an action slot when omitted", () => {
      render(<ErrorState />);
      expect(screen.queryByRole("button")).toBeNull();
    });
  });

  describe("type class on icon", () => {
    it.each(["generic", "network", "permission", "not-found"] as const)(
      "applies type class '%s' to the icon slot",
      (type) => {
        const { container } = render(<ErrorState type={type} />);
        const iconSlot = container.querySelector("[aria-hidden='true']");
        expect(iconSlot?.className).toMatch(type === "not-found" ? "not-found" : type);
      },
    );
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className to the root element", () => {
      const { container } = render(<ErrorState className="my-error" />);
      expect(container.firstChild).toHaveClass("my-error");
    });

    it("forwards arbitrary HTML attributes to the root element", () => {
      const { container } = render(<ErrorState data-testid="error-state" />);
      expect(container.firstChild).toHaveAttribute("data-testid", "error-state");
    });
  });
});
