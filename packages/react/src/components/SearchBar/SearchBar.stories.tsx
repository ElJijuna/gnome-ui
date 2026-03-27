import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SearchBar } from "./SearchBar";
import { HeaderBar } from "../HeaderBar";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { Text } from "../Text";
import { Search } from "@gnome-ui/icons";

const meta: Meta<typeof SearchBar> = {
  title: "Components/SearchBar",
  component: SearchBar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Collapsible search bar following the Adwaita \`AdwSearchBar\` pattern.

### Guidelines
- Toggle visibility with the \`open\` prop — the bar slides in/out with a CSS transition.
- Place it directly below a \`HeaderBar\` (the canonical GNOME pattern).
- Pass \`onClose\` to handle Escape key and any "close search" trigger in your UI.
- Use \`onClear\` to reset the search query when the × button is clicked.
- The input auto-focuses when \`open\` becomes \`true\`.
- Optional \`children\` render a filter-chip row below the input.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SearchBar>;

// ─── Default (controlled) ──────────────────────────────────────────────────────

export const Default: Story = {
  render: function DefaultStory() {
    const [open, setOpen] = useState(true);
    const [query, setQuery] = useState("");

    return (
      <div style={{ maxWidth: 480 }}>
        <div style={{ marginBottom: 8 }}>
          <Button
            variant="flat"
            aria-pressed={open}
            onClick={() => setOpen((o) => !o)}
          >
            <Icon icon={Search} size="md" aria-hidden />
            {open ? "Hide search" : "Show search"}
          </Button>
        </div>
        <SearchBar
          open={open}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClose={() => setOpen(false)}
          onClear={() => setQuery("")}
        />
        {query && (
          <Text variant="caption" color="dim" style={{ marginTop: 8, display: "block" }}>
            Searching for: <strong>{query}</strong>
          </Text>
        )}
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── In a HeaderBar (canonical pattern) ──────────────────────────────────────

export const InHeaderBar: Story = {
  render: function InHeaderBarStory() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");

    const items = ["Inbox", "Drafts", "Sent", "Trash"];
    const filtered = query
      ? items.filter((i) => i.toLowerCase().includes(query.toLowerCase()))
      : items;

    return (
      <div
        style={{
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: 12,
          overflow: "hidden",
          maxWidth: 480,
        }}
      >
        <HeaderBar
          title={searchOpen ? undefined : "Mail"}
          end={
            <Button
              variant="flat"
              aria-label="Toggle search"
              aria-pressed={searchOpen}
              onClick={() => {
                setSearchOpen((o) => !o);
                if (searchOpen) setQuery("");
              }}
            >
              <Icon icon={Search} size="md" aria-hidden />
            </Button>
          }
        />
        <SearchBar
          open={searchOpen}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClose={() => { setSearchOpen(false); setQuery(""); }}
          onClear={() => setQuery("")}
          placeholder="Search mail…"
        />
        <div style={{ padding: 16 }}>
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <div
                key={item}
                style={{
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <Text variant="body">{item}</Text>
              </div>
            ))
          ) : (
            <Text variant="body" color="dim">No results for "{query}"</Text>
          )}
        </div>
      </div>
    );
  },
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    docs: {
      description: {
        story:
          "The canonical GNOME pattern: a search button in the `HeaderBar` toggles the `SearchBar` below it. Escape closes the bar.",
      },
    },
  },
};

// ─── With filter chips ─────────────────────────────────────────────────────────

export const WithFilterChips: Story = {
  render: function FilterStory() {
    const [open, setOpen] = useState(true);
    const [query, setQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");

    const filters = [
      { id: "all", label: "All" },
      { id: "read", label: "Read" },
      { id: "unread", label: "Unread" },
      { id: "flagged", label: "Flagged" },
    ];

    return (
      <div style={{ maxWidth: 480 }}>
        <SearchBar
          open={open}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClose={() => setOpen(false)}
          onClear={() => setQuery("")}
          placeholder="Search…"
        >
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {filters.map((f) => (
              <Button
                key={f.id}
                variant={activeFilter === f.id ? "suggested" : "flat"}
                style={{ borderRadius: 999, padding: "2px 12px", fontSize: "0.8125rem" }}
                onClick={() => setActiveFilter(f.id)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </SearchBar>
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Pass filter chips as `children` — they appear in a second row below the input.",
      },
    },
  },
};

// ─── Initially closed ─────────────────────────────────────────────────────────

export const InitiallyClosed: Story = {
  render: function ClosedStory() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    return (
      <div style={{ maxWidth: 480 }}>
        <div style={{ marginBottom: 8 }}>
          <Button variant="flat" onClick={() => setOpen(true)}>
            Open search
          </Button>
        </div>
        <SearchBar
          open={open}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClose={() => { setOpen(false); setQuery(""); }}
          onClear={() => setQuery("")}
        />
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Starts closed. Input auto-focuses when the bar opens.",
      },
    },
  },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <SearchBar open value="some query" disabled onClose={() => {}} />
    </div>
  ),
  parameters: {
    controls: { disable: true },
  },
};

// ─── Inline ───────────────────────────────────────────────────────────────────

export const Inline: Story = {
  render: () => {
    const [query, setQuery] = useState("");
    return (
      <div
        style={{
          border: "1px solid var(--gnome-light-3, rgba(0,0,0,0.1))",
          borderRadius: 12,
          overflow: "hidden",
          maxWidth: 480,
          background: "var(--gnome-card-bg-color, #fff)",
        }}
      >
        <SearchBar
          inline
          open
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClose={() => setQuery("")}
          onClear={() => setQuery("")}
          placeholder="Search inside card…"
        />
        <div style={{ padding: 16, color: "var(--gnome-window-fg-color)", opacity: 0.5, fontSize: "0.875rem" }}>
          Card content area
        </div>
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Use `inline` to remove the header-bar background so the bar blends into any surface — cards, content areas, or custom containers.",
      },
    },
  },
};
