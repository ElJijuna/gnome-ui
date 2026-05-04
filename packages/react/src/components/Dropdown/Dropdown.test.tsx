import { beforeAll, describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Dropdown } from "./Dropdown";

const options = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "Follow system", description: "Use OS setting" },
  { value: "locked", label: "Locked", disabled: true },
];

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe("Dropdown", () => {
  it("renders placeholder when no value is selected", () => {
    render(
      <Dropdown
        aria-label="Colour scheme"
        placeholder="Choose scheme"
        options={options}
      />,
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("Choose scheme");
  });

  it("renders selected option label", () => {
    render(
      <Dropdown
        aria-label="Colour scheme"
        value="dark"
        options={options}
      />,
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("Dark");
  });

  it("opens and selects an option by click", () => {
    const onChange = vi.fn();
    render(
      <Dropdown
        aria-label="Colour scheme"
        options={options}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Dark" }));

    expect(onChange).toHaveBeenCalledWith("dark");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("does not select disabled options", () => {
    const onChange = vi.fn();
    render(
      <Dropdown
        aria-label="Colour scheme"
        options={options}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Locked" }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("opens with keyboard and selects the active option", () => {
    const onChange = vi.fn();
    render(
      <Dropdown
        aria-label="Colour scheme"
        options={options}
        onChange={onChange}
      />,
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("listbox"), { key: "ArrowDown" });
    fireEvent.keyDown(screen.getByRole("listbox"), { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith("dark");
  });

  it("closes on Escape", () => {
    render(<Dropdown aria-label="Colour scheme" options={options} />);

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.keyDown(screen.getByRole("listbox"), { key: "Escape" });

    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("disables the trigger when disabled", () => {
    render(<Dropdown aria-label="Colour scheme" options={options} disabled />);

    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});
