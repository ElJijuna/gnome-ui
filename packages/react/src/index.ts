// Styles — consumers must import this once at the root of their app:
// import "@gnome-ui/react/styles"
import "@gnome-ui/core/styles";

// Components
export { Button } from "./components/Button";
export type { ButtonProps, ButtonVariant, ButtonSize, ButtonShape } from "./components/Button";

export { Text } from "./components/Text";
export type { TextProps, TextVariant, TextColor } from "./components/Text";

export { Card } from "./components/Card";
export type { CardProps, CardPadding } from "./components/Card";

export { Spinner } from "./components/Spinner";
export type { SpinnerProps, SpinnerSize } from "./components/Spinner";

export { Avatar } from "./components/Avatar";
export type { AvatarProps, AvatarSize, AvatarColor } from "./components/Avatar";

export { Separator } from "./components/Separator";
export type { SeparatorProps, SeparatorOrientation } from "./components/Separator";

export { Switch } from "./components/Switch";
export type { SwitchProps } from "./components/Switch";

export { Checkbox } from "./components/Checkbox";
export type { CheckboxProps } from "./components/Checkbox";

export { TextField } from "./components/TextField";
export type { TextFieldProps } from "./components/TextField";

export { RadioButton } from "./components/RadioButton";
export type { RadioButtonProps } from "./components/RadioButton";

export { ProgressBar } from "./components/ProgressBar";
export type { ProgressBarProps } from "./components/ProgressBar";

export { Banner } from "./components/Banner";
export type { BannerProps, BannerVariant } from "./components/Banner";

export { HeaderBar } from "./components/HeaderBar";
export type { HeaderBarProps } from "./components/HeaderBar";

export { Badge } from "./components/Badge";
export type { BadgeProps, BadgeVariant } from "./components/Badge";

export { Icon } from "./components/Icon";
export type { IconProps, IconSize } from "./components/Icon";

export { Sidebar, SidebarSection, SidebarItem } from "./components/Sidebar";
export type { SidebarProps, SidebarSectionProps, SidebarItemProps, SidebarMenuEntry } from "./components/Sidebar";

export { SpinButton } from "./components/SpinButton";
export type { SpinButtonProps } from "./components/SpinButton";

export { TabBar, TabItem, TabPanel } from "./components/Tabs";
export type { TabBarProps, TabItemProps, TabPanelProps } from "./components/Tabs";

export { ActionRow } from "./components/ActionRow";
export type { ActionRowProps } from "./components/ActionRow";

export { BoxedList } from "./components/BoxedList";
export type { BoxedListProps } from "./components/BoxedList";

export { ViewSwitcher, ViewSwitcherItem } from "./components/ViewSwitcher";
export type { ViewSwitcherProps, ViewSwitcherItemProps } from "./components/ViewSwitcher";

export { SearchBar } from "./components/SearchBar";
export type { SearchBarProps } from "./components/SearchBar";

export { Toast, Toaster } from "./components/Toast";
export type { ToastProps, ToasterProps } from "./components/Toast";

export { Dialog } from "./components/Dialog";
export type { DialogProps, DialogButton } from "./components/Dialog";

export { Tooltip } from "./components/Tooltip";
export type { TooltipProps, TooltipPlacement } from "./components/Tooltip";

export { StatusPage } from "./components/StatusPage";
export type { StatusPageProps } from "./components/StatusPage";

export { Dropdown } from "./components/Dropdown";
export type { DropdownProps, DropdownOption } from "./components/Dropdown";

export { Slider } from "./components/Slider";
export type { SliderProps } from "./components/Slider";

export { Popover } from "./components/Popover";
export type { PopoverProps, PopoverPlacement } from "./components/Popover";

// Hooks
export { useBreakpoint, GNOME_BREAKPOINTS } from "./hooks/useBreakpoint";
export type { BreakpointState, GnomeBreakpointName } from "./hooks/useBreakpoint";

// Adaptive Layout
export { Clamp } from "./components/Clamp";
export type { ClampProps } from "./components/Clamp";

export { NavigationSplitView } from "./components/NavigationSplitView";
export type { NavigationSplitViewProps } from "./components/NavigationSplitView";

export { OverlaySplitView } from "./components/OverlaySplitView";
export type { OverlaySplitViewProps } from "./components/OverlaySplitView";

export { ViewSwitcherBar } from "./components/ViewSwitcherBar";
export type { ViewSwitcherBarProps } from "./components/ViewSwitcherBar";

export { Link } from "./components/Link";
export type { LinkProps } from "./components/Link";

export { ToggleGroup, ToggleGroupItem } from "./components/ToggleGroup";
export type { ToggleGroupProps, ToggleGroupItemProps } from "./components/ToggleGroup";

export { WrapBox } from "./components/WrapBox";
export type { WrapBoxProps, WrapBoxJustify, WrapBoxAlign } from "./components/WrapBox";

export { Chip } from "./components/Chip";
export type { ChipProps } from "./components/Chip";

export { ShortcutsDialog } from "./components/ShortcutsDialog";
export type { ShortcutsDialogProps, ShortcutsSection, ShortcutEntry } from "./components/ShortcutsDialog";

export { ViewSwitcherSidebar, ViewSwitcherSidebarItem } from "./components/ViewSwitcherSidebar";
export type { ViewSwitcherSidebarProps, ViewSwitcherSidebarItemProps } from "./components/ViewSwitcherSidebar";
