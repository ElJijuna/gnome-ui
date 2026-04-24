// Styles — consumers must import this once at the root of their app:
// import "@gnome-ui/layout/styles"
import "@gnome-ui/core/styles";

export { Layout } from "./components/Layout";
export type { LayoutProps } from "./components/Layout";

export { CounterCard } from "./components/CounterCard";
export type { CounterCardProps } from "./components/CounterCard";

export { UserCard } from "./components/UserCard";
export type { UserCardProps, UserCardAction } from "./components/UserCard";

export { PanelCard } from "./components/PanelCard";
export type { PanelCardProps, PanelCardHandle } from "./components/PanelCard";

export { AdaptiveLayout } from "./components/AdaptiveLayout";
export type { AdaptiveLayoutProps, AdaptiveNavItem } from "./components/AdaptiveLayout";

export { IconBadge } from "./components/IconBadge";
export type { IconBadgeProps, IconBadgeColor, IconBadgeSize } from "./components/IconBadge";
