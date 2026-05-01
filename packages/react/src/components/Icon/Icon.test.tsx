import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Add } from "@gnome-ui/icons";
import { Icon } from "./Icon";

describe("Icon", () => {
  it("renders an SVG element", () => {
    const { container } = render(<Icon icon={Add} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("is aria-hidden when no label is provided", () => {
    const { container } = render(<Icon icon={Add} />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("has aria-label when label is provided", () => {
    const { container } = render(<Icon icon={Add} label="Add item" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-label", "Add item");
    expect(svg).not.toHaveAttribute("aria-hidden");
  });

  it("has role=img when label is provided", () => {
    render(<Icon icon={Add} label="Add item" />);
    expect(screen.getByRole("img", { name: "Add item" })).toBeInTheDocument();
  });

  it("defaults to 16px (md) size", () => {
    const { container } = render(<Icon icon={Add} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "16");
    expect(svg).toHaveAttribute("height", "16");
  });

  it("renders sm size as 12px", () => {
    const { container } = render(<Icon icon={Add} size="sm" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "12");
  });

  it("renders lg size as 20px", () => {
    const { container } = render(<Icon icon={Add} size="lg" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "20");
  });

  it("overrides size with explicit width/height", () => {
    const { container } = render(<Icon icon={Add} width={32} height={32} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
  });

  it("renders path elements from the icon definition", () => {
    const { container } = render(<Icon icon={Add} />);
    expect(container.querySelectorAll("path").length).toBeGreaterThan(0);
  });
});
