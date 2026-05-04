import { describe, it, expect, beforeEach, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Popover } from "./Popover";

beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
});

describe("Popover", () => {
  it("opens and closes in uncontrolled mode", async () => {
    render(
      <Popover content={<button type="button">Popover action</button>}>
        <button type="button">Open menu</button>
      </Popover>,
    );

    const trigger = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(trigger);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Popover action" })).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("calls onOpenChange when toggled", () => {
    const onOpenChange = vi.fn();
    render(
      <Popover
        content={<div>Panel</div>}
        onOpenChange={onOpenChange}
      >
        <button type="button">Toggle</button>
      </Popover>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Toggle" }));

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("calls onClose in controlled mode", () => {
    const onClose = vi.fn();
    render(
      <Popover
        open
        onClose={onClose}
        content={<div>Panel</div>}
      >
        <button type="button">Toggle</button>
      </Popover>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Toggle" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on Escape", async () => {
    render(
      <Popover content={<button type="button">Panel button</button>}>
        <button type="button">Open</button>
      </Popover>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("preserves trigger click handler", () => {
    const onClick = vi.fn();
    render(
      <Popover content={<div>Panel</div>}>
        <button type="button" onClick={onClick}>Open</button>
      </Popover>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
