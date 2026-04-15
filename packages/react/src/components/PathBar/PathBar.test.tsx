import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PathBar } from "./PathBar";
import type { PathBarSegment } from "./PathBar";

const segments: PathBarSegment[] = [
  { label: "Home", path: "/home" },
  { label: "Documents", path: "/home/documents" },
  { label: "Projects", path: "/home/documents/projects" },
];

describe("PathBar", () => {
  it("renders all segment labels", () => {
    render(<PathBar segments={segments} />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Documents")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("renders ancestor segments as buttons", () => {
    render(<PathBar segments={segments} />);
    expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Documents" })).toBeInTheDocument();
  });

  it("renders the last segment as non-interactive with aria-current=page", () => {
    render(<PathBar segments={segments} />);
    const current = screen.getByText("Projects");
    expect(current).not.toHaveRole("button");
    expect(current).toHaveAttribute("aria-current", "page");
  });

  it("calls onNavigate with path and index when ancestor segment is clicked", () => {
    const onNavigate = vi.fn();
    render(<PathBar segments={segments} onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    expect(onNavigate).toHaveBeenCalledWith("/home", 0);

    fireEvent.click(screen.getByRole("button", { name: "Documents" }));
    expect(onNavigate).toHaveBeenCalledWith("/home/documents", 1);
  });

  it("does not call onNavigate when current segment is absent onNavigate", () => {
    const onNavigate = vi.fn();
    render(<PathBar segments={segments} onNavigate={onNavigate} />);
    // Projects is the current segment and is a span, not button — can't be clicked
    expect(screen.queryByRole("button", { name: "Projects" })).toBeNull();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("renders single segment as current (no buttons)", () => {
    const single: PathBarSegment[] = [{ label: "Home", path: "/" }];
    render(<PathBar segments={single} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.getByText("Home")).toHaveAttribute("aria-current", "page");
  });

  it("forwards className to root nav", () => {
    const { container } = render(<PathBar segments={segments} className="my-pathbar" />);
    expect(container.querySelector("nav")).toHaveClass("my-pathbar");
  });

  it("has accessible breadcrumb landmark", () => {
    render(<PathBar segments={segments} />);
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
  });

  it("renders segment icons when provided", () => {
    const withIcons: PathBarSegment[] = [
      { label: "Home", path: "/", icon: <span data-testid="home-icon" /> },
      { label: "Docs", path: "/docs", icon: <span data-testid="docs-icon" /> },
    ];
    render(<PathBar segments={withIcons} />);
    expect(screen.getByTestId("home-icon")).toBeInTheDocument();
    expect(screen.getByTestId("docs-icon")).toBeInTheDocument();
  });

  it("does not render separators for single segment", () => {
    const { container } = render(<PathBar segments={[{ label: "Root", path: "/" }]} />);
    expect(container.querySelectorAll("svg")).toHaveLength(0);
  });

  it("renders N-1 separators for N segments", () => {
    render(<PathBar segments={segments} />);
    // 3 segments → 2 separators (each is a span with an svg inside)
    const separators = screen.getAllByRole("listitem")
      .map((li) => li.querySelector("svg"))
      .filter(Boolean);
    expect(separators).toHaveLength(2);
  });
});
