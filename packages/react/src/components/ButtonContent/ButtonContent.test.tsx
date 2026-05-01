import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ButtonContent } from "./ButtonContent";

describe("ButtonContent", () => {
  it("renders the label", () => {
    render(<ButtonContent label="Save" />);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("renders the icon when provided", () => {
    render(
      <ButtonContent
        label="Save"
        icon={<span data-testid="icon">★</span>}
      />,
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("places icon before label by default (iconPosition=start)", () => {
    const { container } = render(
      <ButtonContent
        label="Save"
        icon={<span data-testid="icon" />}
      />,
    );
    const root = container.firstChild as HTMLElement;
    const children = Array.from(root.children);
    const iconIdx = children.findIndex(c => c.querySelector("[data-testid='icon']"));
    const labelIdx = children.findIndex(c => c.textContent === "Save");
    expect(iconIdx).toBeLessThan(labelIdx);
  });

  it("places icon after label when iconPosition=end", () => {
    const { container } = render(
      <ButtonContent
        label="Save"
        icon={<span data-testid="icon" />}
        iconPosition="end"
      />,
    );
    const root = container.firstChild as HTMLElement;
    const children = Array.from(root.children);
    const iconIdx = children.findIndex(c => c.querySelector("[data-testid='icon']"));
    const labelIdx = children.findIndex(c => c.textContent === "Save");
    expect(labelIdx).toBeLessThan(iconIdx);
  });

  it("forwards className", () => {
    const { container } = render(<ButtonContent label="X" className="btn-content" />);
    expect(container.firstChild).toHaveClass("btn-content");
  });

  it("forwards data-testid", () => {
    render(<ButtonContent label="X" data-testid="bc" />);
    expect(screen.getByTestId("bc")).toBeInTheDocument();
  });
});
