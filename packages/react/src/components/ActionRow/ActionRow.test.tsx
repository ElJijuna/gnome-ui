import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ActionRow } from "./ActionRow";

describe("ActionRow", () => {
  it("renders title and subtitle", () => {
    render(<ActionRow title="Wi-Fi" subtitle="Connected" />);

    expect(screen.getByText("Wi-Fi")).toBeInTheDocument();
    expect(screen.getByText("Connected")).toBeInTheDocument();
  });

  it("renders leading and trailing slots", () => {
    render(
      <ActionRow
        title="Bluetooth"
        leading={<span data-testid="leading">B</span>}
        trailing={<button type="button">Configure</button>}
      />,
    );

    expect(screen.getByTestId("leading")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Configure" })).toBeInTheDocument();
  });

  it("renders a non-interactive row as a div", () => {
    const { container } = render(<ActionRow title="Sound" />);

    expect(container.firstElementChild?.tagName).toBe("DIV");
  });

  it("renders an interactive row as a button and handles clicks", () => {
    const onClick = vi.fn();
    render(<ActionRow title="Network" interactive onClick={onClick} />);

    fireEvent.click(screen.getByRole("button", { name: "Network" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies property variant text hierarchy", () => {
    render(
      <ActionRow title="OS Version" subtitle="GNOME 50" variant="property" />,
    );

    expect(screen.getByText("OS Version").className).toMatch(/propertyLabel/);
    expect(screen.getByText("GNOME 50").className).toMatch(/propertyValue/);
  });

  it("forwards className and data attributes", () => {
    render(
      <ActionRow
        title="Power"
        className="custom-row"
        data-testid="row"
      />,
    );

    expect(screen.getByTestId("row")).toHaveClass("custom-row");
  });
});
