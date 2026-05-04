import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Search, Settings } from "@gnome-ui/icons";
import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("renders an icon-only button with an accessible label", () => {
    render(<IconButton icon={Search} label="Search" />);

    const button = screen.getByRole("button", { name: "Search" });
    expect(button).toBeInTheDocument();
    expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("defaults to a default circular button", () => {
    render(<IconButton icon={Search} label="Search" />);

    expect(screen.getByRole("button").className).toMatch(/default/);
    expect(screen.getByRole("button").className).toMatch(/circular/);
  });

  it.each(["default", "suggested", "destructive", "flat", "raised", "osd"] as const)(
    "applies %s variant",
    (variant) => {
      render(<IconButton icon={Settings} label="Settings" variant={variant} />);

      const className = screen.getByRole("button").className;
      expect(className).toMatch(variant === "osd" ? /osd/ : new RegExp(variant));
    },
  );

  it.each(["sm", "lg"] as const)("applies %s size", (size) => {
    render(<IconButton icon={Search} label="Search" size={size} />);

    expect(screen.getByRole("button").className).toMatch(new RegExp(size));
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<IconButton icon={Search} label="Search" onClick={onClick} />);

    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not call onClick when disabled", async () => {
    const onClick = vi.fn();
    render(<IconButton disabled icon={Search} label="Search" onClick={onClick} />);

    await userEvent.click(screen.getByRole("button", { name: "Search" }), {
      pointerEventsCheck: 0,
    });

    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Search" })).toBeDisabled();
  });

  it("forwards refs and HTML button attributes", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <IconButton
        ref={ref}
        data-testid="settings-action"
        icon={Settings}
        label="Settings"
        type="submit"
      />,
    );

    expect(ref.current).toBe(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByTestId("settings-action")).toHaveAttribute("type", "submit");
  });

  it("renders an optional tooltip", () => {
    render(
      <IconButton
        icon={Search}
        label="Search"
        tooltip="Search files"
        tooltipDelay={0}
      />,
    );

    expect(screen.getByText("Search files")).toBeInTheDocument();
  });

  it("forwards refs when wrapped with a tooltip", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <IconButton
        ref={ref}
        icon={Search}
        label="Search"
        tooltip="Search files"
      />,
    );

    expect(ref.current).toBe(screen.getByRole("button", { name: "Search" }));
  });
});
