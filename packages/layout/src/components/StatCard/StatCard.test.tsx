import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "./StatCard";

describe("StatCard", () => {
  it("renders the label and formatted numeric value", () => {
    render(<StatCard label="Active Users" value={1284} />);

    expect(screen.getByText("Active Users")).toBeInTheDocument();
    expect(screen.getByText("1,284")).toBeInTheDocument();
    expect(screen.getByLabelText("Active Users: 1,284")).toBeInTheDocument();
  });

  it("renders string values and unit suffixes", () => {
    render(<StatCard label="Uptime" value="99.9" unit="%" />);

    expect(screen.getByText("99.9")).toBeInTheDocument();
    expect(screen.getByText("%")).toBeInTheDocument();
    expect(screen.getByLabelText("Uptime: 99.9 %")).toBeInTheDocument();
  });

  it("renders the optional icon without exposing it as the button label", () => {
    render(
      <StatCard
        label="Projects"
        value={24}
        icon={<span data-testid="icon">P</span>}
      />,
    );

    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders an upward trend", () => {
    render(
      <StatCard
        label="Active Users"
        value={1284}
        trend={{ direction: "up", value: 12, period: "vs last week" }}
      />,
    );

    expect(screen.getByText("+12%")).toBeInTheDocument();
    expect(screen.getByText("vs last week")).toBeInTheDocument();
  });

  it("renders a downward trend", () => {
    render(
      <StatCard
        label="Errors"
        value={8}
        trend={{ direction: "down", value: -4, period: "vs yesterday" }}
      />,
    );

    expect(screen.getByText("-4%")).toBeInTheDocument();
    expect(screen.getByText("vs yesterday")).toBeInTheDocument();
  });

  it("renders a neutral trend", () => {
    render(
      <StatCard
        label="Latency"
        value={42}
        unit="ms"
        trend={{ direction: "neutral", value: 0 }}
      />,
    );

    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("renders a skeleton loading state", () => {
    const { container } = render(
      <StatCard label="Active Users" value={1284} loading data-testid="stat" />,
    );

    expect(screen.getByTestId("stat")).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByText("Active Users")).toBeNull();
    expect(container.querySelectorAll("[aria-hidden='true']").length).toBeGreaterThan(0);
  });

  it("forwards className, style, and data attributes to the root", () => {
    render(
      <StatCard
        label="Revenue"
        value={9420}
        className="custom-stat"
        style={{ width: 240 }}
        data-testid="stat"
      />,
    );

    const root = screen.getByTestId("stat");
    expect(root).toHaveClass("custom-stat");
    expect(root).toHaveStyle({ width: "240px" });
  });
});
