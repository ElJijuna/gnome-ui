import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EntityCard } from "./EntityCard";

const avatar = <div data-testid="avatar">A</div>;

describe("EntityCard", () => {
  describe("required props", () => {
    it("renders the avatar slot", () => {
      render(<EntityCard avatar={avatar} title="Title" />);
      expect(screen.getByTestId("avatar")).toBeInTheDocument();
    });

    it("renders the title", () => {
      render(<EntityCard avatar={avatar} title="GNOME Weather" />);
      expect(screen.getByText("GNOME Weather")).toBeInTheDocument();
    });
  });

  describe("optional props", () => {
    it("renders badge when provided", () => {
      render(<EntityCard avatar={avatar} title="T" badge={<span>beta</span>} />);
      expect(screen.getByText("beta")).toBeInTheDocument();
    });

    it("does not render badge slot when omitted", () => {
      render(<EntityCard avatar={avatar} title="T" />);
      expect(screen.queryByRole("generic", { name: /beta/i })).toBeNull();
    });

    it("renders trailing when provided", () => {
      render(<EntityCard avatar={avatar} title="T" trailing={<span>›</span>} />);
      expect(screen.getByText("›")).toBeInTheDocument();
    });

    it("renders subtitle when provided", () => {
      render(<EntityCard avatar={avatar} title="T" subtitle="@alice_dev" />);
      expect(screen.getByText("@alice_dev")).toBeInTheDocument();
    });

    it("does not render subtitle when omitted", () => {
      render(<EntityCard avatar={avatar} title="T" />);
      expect(screen.queryByText("@alice_dev")).toBeNull();
    });

    it("renders description when provided", () => {
      render(<EntityCard avatar={avatar} title="T" description="A weather app." />);
      expect(screen.getByText("A weather app.")).toBeInTheDocument();
    });

    it("does not render description when omitted", () => {
      render(<EntityCard avatar={avatar} title="T" />);
      expect(screen.queryByText("A weather app.")).toBeNull();
    });
  });

  describe("meta footer", () => {
    it("renders both meta strings", () => {
      render(<EntityCard avatar={avatar} title="T" meta={["v4.8.0", "⭐ 203"]} />);
      expect(screen.getByText("v4.8.0")).toBeInTheDocument();
      expect(screen.getByText("⭐ 203")).toBeInTheDocument();
    });

    it("renders only the first meta string when second is omitted", () => {
      render(<EntityCard avatar={avatar} title="T" meta={["v1.0"]} />);
      expect(screen.getByText("v1.0")).toBeInTheDocument();
    });

    it("omits the footer when meta is undefined", () => {
      const { container } = render(<EntityCard avatar={avatar} title="T" />);
      expect(container.querySelector("[class*=footer]")).toBeNull();
    });

    it("omits the footer when meta is an empty tuple", () => {
      const { container } = render(<EntityCard avatar={avatar} title="T" meta={[]} />);
      expect(container.querySelector("[class*=footer]")).toBeNull();
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards data-testid to root element", () => {
      render(<EntityCard avatar={avatar} title="T" data-testid="entity" />);
      expect(screen.getByTestId("entity")).toBeInTheDocument();
    });

    it("forwards className to root element", () => {
      const { container } = render(<EntityCard avatar={avatar} title="T" className="custom" />);
      expect((container.firstChild as HTMLElement).className).toContain("custom");
    });
  });
});
