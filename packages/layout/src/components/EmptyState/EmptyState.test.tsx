import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@gnome-ui/react";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  describe("title", () => {
    it("renders the title", () => {
      render(<EmptyState title="No files yet" />);
      expect(screen.getByText("No files yet")).toBeInTheDocument();
    });
  });

  describe("description", () => {
    it("renders description when provided", () => {
      render(<EmptyState title="No files yet" description="Files you add will appear here." />);
      expect(screen.getByText("Files you add will appear here.")).toBeInTheDocument();
    });

    it("does not render description text when omitted", () => {
      render(<EmptyState title="No files yet" />);
      expect(screen.queryByText("Files you add will appear here.")).toBeNull();
    });
  });

  describe("icon", () => {
    it("renders the icon slot when provided", () => {
      render(
        <EmptyState
          title="No files yet"
          icon={<svg data-testid="folder-icon" />}
        />,
      );
      expect(screen.getByTestId("folder-icon")).toBeInTheDocument();
    });

    it("does not render the icon slot when omitted", () => {
      const { container } = render(<EmptyState title="No files yet" />);
      expect(container.querySelector("[aria-hidden='true']")).toBeNull();
    });
  });

  describe("action", () => {
    it("renders the action slot when provided", () => {
      render(
        <EmptyState
          title="No files yet"
          action={<Button variant="suggested">Add File</Button>}
        />,
      );
      expect(screen.getByRole("button", { name: "Add File" })).toBeInTheDocument();
    });

    it("does not render an action slot when omitted", () => {
      render(<EmptyState title="No files yet" />);
      expect(screen.queryByRole("button")).toBeNull();
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className to the root element", () => {
      const { container } = render(
        <EmptyState title="No files yet" className="custom-empty" />,
      );
      expect(container.firstChild).toHaveClass("custom-empty");
    });

    it("forwards arbitrary HTML attributes to the root element", () => {
      const { container } = render(
        <EmptyState title="No files yet" data-testid="empty-state" />,
      );
      expect(container.firstChild).toHaveAttribute("data-testid", "empty-state");
    });
  });
});
