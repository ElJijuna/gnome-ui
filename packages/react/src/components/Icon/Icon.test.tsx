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

describe("Icon — RawPathIconDefinition (simple-icons compatible)", () => {
  const rawPath = "M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0z";

  it("renders an SVG element from a raw path object", () => {
    const { container } = render(<Icon icon={{ path: rawPath }} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("defaults viewBox to 0 0 24 24 when not specified", () => {
    const { container } = render(<Icon icon={{ path: rawPath }} />);
    expect(container.querySelector("svg")).toHaveAttribute("viewBox", "0 0 24 24");
  });

  it("respects an explicit viewBox override", () => {
    const { container } = render(<Icon icon={{ path: rawPath, viewBox: "0 0 32 32" }} />);
    expect(container.querySelector("svg")).toHaveAttribute("viewBox", "0 0 32 32");
  });

  it("renders a single path element with the correct d attribute", () => {
    const { container } = render(<Icon icon={{ path: rawPath }} />);
    const paths = container.querySelectorAll("path");
    expect(paths).toHaveLength(1);
    expect(paths[0]).toHaveAttribute("d", rawPath);
  });

  it("is structurally compatible with a full SimpleIcon object (extra fields ignored)", () => {
    const siGithubMock = {
      title: "GitHub",
      slug: "github",
      hex: "181717",
      source: "https://github.com",
      svg: "<svg/>",
      path: rawPath,
    };
    const { container } = render(<Icon icon={siGithubMock} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelector("path")).toHaveAttribute("d", rawPath);
  });

  it("gives precedence to paths when both path and paths are present", () => {
    const mixed = { path: "M1 1", paths: [{ d: "M2 2" }], viewBox: "0 0 16 16" };
    const { container } = render(<Icon icon={mixed} />);
    expect(container.querySelector("path")).toHaveAttribute("d", "M2 2");
  });

  it("applies label and aria attributes to raw path icons", () => {
    render(<Icon icon={{ path: rawPath }} label="GitHub" />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("aria-label", "GitHub");
    expect(svg).toHaveAttribute("role", "img");
  });
});
