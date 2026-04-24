import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders children", () => {
    render(<StatusBadge>published</StatusBadge>);
    expect(screen.getByText("published")).toBeInTheDocument();
  });

  it("defaults to neutral variant", () => {
    const { container } = render(<StatusBadge>draft</StatusBadge>);
    expect((container.firstChild as HTMLElement).className).toMatch(/neutral/);
  });

  it("applies the variant class", () => {
    const { container } = render(<StatusBadge variant="success">published</StatusBadge>);
    expect((container.firstChild as HTMLElement).className).toMatch(/success/);
  });

  it("applies the new variant class", () => {
    const { container } = render(<StatusBadge variant="new">new</StatusBadge>);
    expect((container.firstChild as HTMLElement).className).toMatch(/new/);
  });

  it("forwards className", () => {
    const { container } = render(<StatusBadge className="custom">x</StatusBadge>);
    expect((container.firstChild as HTMLElement).className).toContain("custom");
  });

  it("forwards arbitrary HTML attributes", () => {
    render(<StatusBadge data-testid="sb">x</StatusBadge>);
    expect(screen.getByTestId("sb")).toBeInTheDocument();
  });
});
