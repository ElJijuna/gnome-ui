import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";
import { AvatarRotator } from "./AvatarRotator";

const avatars = [
  "https://example.com/avatar-1.jpg",
  "https://example.com/avatar-2.jpg",
  "https://example.com/avatar-3.jpg",
];

describe("AvatarRotator", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders a single accessible avatar surface", () => {
    const { getByRole } = render(
      <AvatarRotator name="Alice Bob" avatars={avatars} />,
    );

    expect(getByRole("img", { name: "Alice Bob" })).toBeInTheDocument();
  });

  it("falls back to Avatar initials when no avatar sources are provided", () => {
    const { getByText } = render(<AvatarRotator name="Alice Bob" />);

    expect(getByText("AB")).toBeInTheDocument();
  });

  it("filters empty avatar sources", () => {
    const { container } = render(
      <AvatarRotator
        name="Alice"
        avatars={["", " https://example.com/avatar.jpg ", "  "]}
      />,
    );

    expect(container.querySelectorAll("img")).toHaveLength(1);
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://example.com/avatar.jpg",
    );
  });

  it("rotates through avatars on the configured interval", () => {
    vi.useFakeTimers();
    const onIndexChange = vi.fn();
    const { container } = render(
      <AvatarRotator
        name="Alice"
        avatars={avatars}
        interval={1000}
        onIndexChange={onIndexChange}
      />,
    );

    const layers = Array.from(
      container.querySelectorAll("img"),
      (img) => img.parentElement!,
    );
    expect(layers[0].className).toMatch(/active/);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onIndexChange).toHaveBeenCalledWith(1);
    expect(layers[1].className).toMatch(/active/);
  });

  it("supports a controlled active index", () => {
    const { container, rerender } = render(
      <AvatarRotator name="Alice" avatars={avatars} activeIndex={2} />,
    );

    let layers = Array.from(
      container.querySelectorAll("img"),
      (img) => img.parentElement!,
    );
    expect(layers[2].className).toMatch(/active/);

    rerender(<AvatarRotator name="Alice" avatars={avatars} activeIndex={1} />);
    layers = Array.from(
      container.querySelectorAll("img"),
      (img) => img.parentElement!,
    );
    expect(layers[1].className).toMatch(/active/);
  });

  it("pauses rotation while hovered", () => {
    vi.useFakeTimers();
    const onIndexChange = vi.fn();
    const { getByRole } = render(
      <AvatarRotator
        name="Alice"
        avatars={avatars}
        interval={1000}
        onIndexChange={onIndexChange}
      />,
    );

    fireEvent.mouseEnter(getByRole("img", { name: "Alice" }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onIndexChange).not.toHaveBeenCalled();
  });
});
