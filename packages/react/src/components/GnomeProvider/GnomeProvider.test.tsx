import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { GnomeProvider } from "./GnomeProvider";
import {
  useDateTimeFormatter,
  useNumberFormatter,
} from "./GnomeContext";

function FormattedNumber({ value }: { value: number }) {
  const formatter = useNumberFormatter();
  return <span>{formatter.format(value)}</span>;
}

function FormattedMonth({ value }: { value: Date }) {
  const formatter = useDateTimeFormatter({ month: "short" });
  return <span>{formatter.format(value)}</span>;
}

describe("GnomeProvider intl formatting", () => {
  it("provides number format defaults to descendants", () => {
    render(
      <GnomeProvider
        locale="en-US"
        numberFormat={{ notation: "compact", compactDisplay: "short" }}
      >
        <FormattedNumber value={1000} />
      </GnomeProvider>,
    );

    expect(screen.getByText("1K")).toBeInTheDocument();
  });

  it("uses standard number formatting by default", () => {
    render(
      <GnomeProvider locale="en-US">
        <FormattedNumber value={1000} />
      </GnomeProvider>,
    );

    expect(screen.getByText("1,000")).toBeInTheDocument();
  });

  it("provides date time format defaults to descendants", () => {
    render(
      <GnomeProvider locale="es-ES">
        <FormattedMonth value={new Date(2000, 0, 1)} />
      </GnomeProvider>,
    );

    expect(screen.getByText("ene")).toBeInTheDocument();
  });
});
