import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BoxedList } from "./BoxedList";

describe("BoxedList", () => {
  it("renders children as list items", () => {
    render(
      <BoxedList>
        <div>First row</div>
        <div>Second row</div>
      </BoxedList>,
    );

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("First row")).toBeInTheDocument();
    expect(screen.getByText("Second row")).toBeInTheDocument();
  });

  it("filters out empty children", () => {
    render(
      <BoxedList>
        {null}
        <div>Visible row</div>
        {false}
      </BoxedList>,
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("inserts separators between default rows", () => {
    const { container } = render(
      <BoxedList>
        <div>First row</div>
        <div>Second row</div>
      </BoxedList>,
    );

    expect(container.querySelector("[aria-hidden='true']")).toBeInTheDocument();
  });

  it("applies separate variant without separators", () => {
    const { container } = render(
      <BoxedList variant="separate">
        <div>First row</div>
        <div>Second row</div>
      </BoxedList>,
    );

    expect((container.firstChild as HTMLElement).className).toMatch(/separate/);
    expect(container.querySelector("[aria-hidden='true']")).toBeNull();
  });

  it("forwards className and data attributes", () => {
    render(
      <BoxedList className="custom-list" data-testid="list">
        <div>Row</div>
      </BoxedList>,
    );

    expect(screen.getByTestId("list")).toHaveClass("custom-list");
  });
});
