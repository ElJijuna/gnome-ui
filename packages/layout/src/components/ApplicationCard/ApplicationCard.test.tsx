import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ApplicationCard } from "./ApplicationCard";

const avatar = <div data-testid="avatar">A</div>;

describe("ApplicationCard", () => {
  describe("required props", () => {
    it("renders the avatar slot", () => {
      render(<ApplicationCard avatar={avatar} name="GNOME Weather" />);
      expect(screen.getByTestId("avatar")).toBeInTheDocument();
    });

    it("renders the name", () => {
      render(<ApplicationCard avatar={avatar} name="GNOME Weather" />);
      expect(screen.getByText("GNOME Weather")).toBeInTheDocument();
    });
  });

  describe("optional props", () => {
    it("renders badge when provided", () => {
      render(<ApplicationCard avatar={avatar} name="T" badge={<span>published</span>} />);
      expect(screen.getByText("published")).toBeInTheDocument();
    });

    it("renders description when provided", () => {
      render(<ApplicationCard avatar={avatar} name="T" description="A weather app." />);
      expect(screen.getByText("A weather app.")).toBeInTheDocument();
    });

    it("does not render description when omitted", () => {
      render(<ApplicationCard avatar={avatar} name="T" />);
      expect(screen.queryByText("A weather app.")).toBeNull();
    });

    it("renders action slot when provided", () => {
      render(<ApplicationCard avatar={avatar} name="T" actions={<button>Edit</button>} />);
      expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    });

    it("does not render action slot when omitted", () => {
      render(<ApplicationCard avatar={avatar} name="T" />);
      expect(screen.queryByRole("button")).toBeNull();
    });
  });

  describe("stats", () => {
    const stats = [
      { label: "Version", value: "v4.8.1" },
      { label: "Builds",  value: "24" },
    ];

    it("renders stat labels and values", () => {
      render(<ApplicationCard avatar={avatar} name="T" stats={stats} />);
      expect(screen.getByText("Version")).toBeInTheDocument();
      expect(screen.getByText("v4.8.1")).toBeInTheDocument();
      expect(screen.getByText("Builds")).toBeInTheDocument();
      expect(screen.getByText("24")).toBeInTheDocument();
    });

    it("omits stats row when stats is undefined", () => {
      const { container } = render(<ApplicationCard avatar={avatar} name="T" />);
      expect(container.querySelector("[class*=stats]")).toBeNull();
    });

    it("omits stats row when stats is empty array", () => {
      const { container } = render(<ApplicationCard avatar={avatar} name="T" stats={[]} />);
      expect(container.querySelector("[class*=stats]")).toBeNull();
    });
  });

  describe("loading", () => {
    it("renders with aria-busy='true' when loading", () => {
      const { container } = render(<ApplicationCard avatar={avatar} name="GNOME Weather" loading />);
      expect(container.firstChild).toHaveAttribute("aria-busy", "true");
    });

    it("does not render the name when loading", () => {
      render(<ApplicationCard avatar={avatar} name="GNOME Weather" loading />);
      expect(screen.queryByText("GNOME Weather")).toBeNull();
    });

    it("renders skeleton by default when loading={true}", () => {
      const { container } = render(<ApplicationCard avatar={avatar} name="T" loading />);
      expect(container.firstChild).toHaveAttribute("aria-busy", "true");
      expect(screen.queryByRole("status")).toBeNull();
    });

    it("renders skeleton when loadingType='skeleton' is explicit", () => {
      const { container } = render(
        <ApplicationCard avatar={avatar} name="T" loading loadingType="skeleton" />,
      );
      expect(container.firstChild).toHaveAttribute("aria-busy", "true");
    });

    it("renders spinner when loadingType='spinner'", () => {
      const { container } = render(
        <ApplicationCard avatar={avatar} name="T" loading loadingType="spinner" />,
      );
      expect(container.firstChild).toHaveAttribute("aria-busy", "true");
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("does not render spinner when not loading", () => {
      render(<ApplicationCard avatar={avatar} name="GNOME Weather" loadingType="spinner" />);
      expect(screen.queryByRole("status")).toBeNull();
      expect(screen.getByText("GNOME Weather")).toBeInTheDocument();
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards data-testid to root element", () => {
      render(<ApplicationCard avatar={avatar} name="T" data-testid="appcard" />);
      expect(screen.getByTestId("appcard")).toBeInTheDocument();
    });

    it("forwards className to root element", () => {
      const { container } = render(<ApplicationCard avatar={avatar} name="T" className="custom" />);
      expect((container.firstChild as HTMLElement).className).toContain("custom");
    });
  });
});
