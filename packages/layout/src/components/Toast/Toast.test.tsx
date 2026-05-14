import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { ToastProvider, useToast } from "./Toast";
import type { ToastContextValue, ToastOptions } from "./Toast";
import { useEffect } from "react";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function Trigger({ options, onReady }: {
  options: ToastOptions;
  onReady?: (ctx: ToastContextValue) => void;
}) {
  const ctx = useToast();
  useEffect(() => { onReady?.(ctx); }, []);  // eslint-disable-line
  return <button onClick={() => ctx.show(options)}>Show</button>;
}

function wrap(ui: React.ReactNode) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("ToastProvider", () => {
  it("renders children", () => {
    wrap(<div>App content</div>);
    expect(screen.getByText("App content")).toBeInTheDocument();
  });
});

describe("useToast", () => {
  it("throws when used outside ToastProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Trigger options={{ title: "x" }} />)).toThrow(
      "useToast must be used inside <ToastProvider>",
    );
    spy.mockRestore();
  });
});

describe("toast queue", () => {
  beforeEach(() =>
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"] }),
  );
  afterEach(() => vi.useRealTimers());

  it("shows a toast after show() is called", () => {
    wrap(<Trigger options={{ title: "File saved", timeout: 0 }} />);
    fireEvent.click(screen.getByRole("button", { name: "Show" }));
    expect(screen.getByText("File saved")).toBeInTheDocument();
  });

  it("renders the action button when provided", () => {
    wrap(
      <Trigger
        options={{ title: "Deleted", action: { label: "Undo", onClick: vi.fn() }, timeout: 0 }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Show" }));
    expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
  });

  it("dismisses the toast when the dismiss button is clicked", () => {
    wrap(<Trigger options={{ title: "Hello", timeout: 0 }} />);
    fireEvent.click(screen.getByRole("button", { name: "Show" }));
    expect(screen.getByText("Hello")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    act(() => vi.advanceTimersByTime(300));

    expect(screen.queryByText("Hello")).not.toBeInTheDocument();
  });

  it("auto-dismisses after the configured timeout", () => {
    wrap(<Trigger options={{ title: "Auto", timeout: 2000 }} />);
    fireEvent.click(screen.getByRole("button", { name: "Show" }));
    expect(screen.getByText("Auto")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(2000 + 300));
    expect(screen.queryByText("Auto")).not.toBeInTheDocument();
  });

  it("does not auto-dismiss when timeout is 0", () => {
    wrap(<Trigger options={{ title: "Persistent", timeout: 0 }} />);
    fireEvent.click(screen.getByRole("button", { name: "Show" }));

    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.getByText("Persistent")).toBeInTheDocument();
  });

  it("queues subsequent toasts and shows them in order", () => {
    function MultiTrigger() {
      const { show } = useToast();
      return (
        <>
          <button onClick={() => show({ title: "First",  timeout: 1000 })}>A</button>
          <button onClick={() => show({ title: "Second", timeout: 0 })}>B</button>
        </>
      );
    }

    render(
      <ToastProvider>
        <MultiTrigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "A" }));
    fireEvent.click(screen.getByRole("button", { name: "B" }));

    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.queryByText("Second")).not.toBeInTheDocument();

    // advance past auto-dismiss (1000ms) + exit animation (220ms)
    act(() => vi.advanceTimersByTime(1000 + 300));

    expect(screen.queryByText("First")).not.toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  it("calling action button also dismisses the toast", () => {
    const onAction = vi.fn();
    wrap(
      <Trigger
        options={{ title: "Undo?", action: { label: "Undo", onClick: onAction }, timeout: 0 }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Show" }));
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));

    act(() => vi.advanceTimersByTime(300));

    expect(onAction).toHaveBeenCalledOnce();
    expect(screen.queryByText("Undo?")).not.toBeInTheDocument();
  });

  it("dismissAll clears the queue immediately", () => {
    let ctx!: ToastContextValue;
    wrap(
      <Trigger
        options={{ title: "One", timeout: 0 }}
        onReady={(c) => { ctx = c; }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Show" }));
    expect(screen.getByText("One")).toBeInTheDocument();

    act(() => ctx.dismissAll());
    expect(screen.queryByText("One")).not.toBeInTheDocument();
  });

  it("deduplicates toasts with the same id", () => {
    function DedupTrigger() {
      const { show } = useToast();
      return (
        <button onClick={() => show({ id: "stable", title: "Same", timeout: 0 })}>Show</button>
      );
    }

    render(
      <ToastProvider>
        <DedupTrigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Show" }));
    fireEvent.click(screen.getByRole("button", { name: "Show" }));

    expect(screen.getAllByText("Same")).toHaveLength(1);
  });
});
