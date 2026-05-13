import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBar } from "./StatusBar";

describe("StatusBar", () => {
  it("renders children", () => {
    render(<StatusBar>Ready</StatusBar>);
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("renders trailing content", () => {
    render(<StatusBar trailing={<span>Synced</span>}>Ready</StatusBar>);
    expect(screen.getByText("Synced")).toBeInTheDocument();
  });

  it("forwards HTML attributes", () => {
    render(<StatusBar data-testid="status-bar">Ready</StatusBar>);
    expect(screen.getByTestId("status-bar")).toBeInTheDocument();
  });
});
