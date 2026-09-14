import { Button, Separator, Text } from '@gnome-ui/react-native';
import type { ComponentType } from 'react';
import { ScrollView, View } from 'react-native';

import { ActionRowScreen } from './screens/ActionRowScreen';
import { AnimatedIconScreen } from './screens/AnimatedIconScreen';
import { AreaChartScreen } from './screens/AreaChartScreen';
import { AvatarGroupScreen } from './screens/AvatarGroupScreen';
import { AvatarRotatorScreen } from './screens/AvatarRotatorScreen';
import { AvatarScreen } from './screens/AvatarScreen';
import { BadgeScreen } from './screens/BadgeScreen';
import { BannerScreen } from './screens/BannerScreen';
import { BarChartScreen } from './screens/BarChartScreen';
import { BinScreen } from './screens/BinScreen';
import { BlockquoteScreen } from './screens/BlockquoteScreen';
import { BottomSheetScreen } from './screens/BottomSheetScreen';
import { BottomTabBarScreen } from './screens/BottomTabBarScreen';
import { BoxedListScreen } from './screens/BoxedListScreen';
import { BoxScreen } from './screens/BoxScreen';
import { BreakpointBinScreen } from './screens/BreakpointBinScreen';
import { ButtonContentScreen } from './screens/ButtonContentScreen';
import { ButtonRowScreen } from './screens/ButtonRowScreen';
import { ButtonScreen } from './screens/ButtonScreen';
import { CalloutScreen } from './screens/CalloutScreen';
import { CardScreen } from './screens/CardScreen';
import { CheckboxScreen } from './screens/CheckboxScreen';
import { CheckRowScreen } from './screens/CheckRowScreen';
import { ChipScreen } from './screens/ChipScreen';
import { ClampScreen } from './screens/ClampScreen';
import { CoachMarkScreen } from './screens/CoachMarkScreen';
import { ColorPickerScreen } from './screens/ColorPickerScreen';
import { ComboRowScreen } from './screens/ComboRowScreen';
import { CopyButtonScreen } from './screens/CopyButtonScreen';
import { DialogScreen } from './screens/DialogScreen';
import { DividerScreen } from './screens/DividerScreen';
import { DrawerScreen } from './screens/DrawerScreen';
import { DropdownScreen } from './screens/DropdownScreen';
import { EntryRowScreen } from './screens/EntryRowScreen';
import { ExpanderRowScreen } from './screens/ExpanderRowScreen';
import { ExpanderScreen } from './screens/ExpanderScreen';
import { FieldGroupScreen } from './screens/FieldGroupScreen';
import { FileTypeIconScreen } from './screens/FileTypeIconScreen';
import { FilterableMultiSelectDropdownScreen } from './screens/FilterableMultiSelectDropdownScreen';
import { HeaderBarScreen } from './screens/HeaderBarScreen';
import { HighlightScreen } from './screens/HighlightScreen';
import { IconButtonScreen } from './screens/IconButtonScreen';
import { IconScreen } from './screens/IconScreen';
import { InlineViewSwitcherScreen } from './screens/InlineViewSwitcherScreen';
import { LevelBarScreen } from './screens/LevelBarScreen';
import { LineChartScreen } from './screens/LineChartScreen';
import { LinkedGroupScreen } from './screens/LinkedGroupScreen';
import { LinkScreen } from './screens/LinkScreen';
import { MultiSelectDropdownScreen } from './screens/MultiSelectDropdownScreen';
import { NavigationSplitViewScreen } from './screens/NavigationSplitViewScreen';
import { OverlayScreen } from './screens/OverlayScreen';
import { PasswordEntryRowScreen } from './screens/PasswordEntryRowScreen';
import { PasswordFieldScreen } from './screens/PasswordFieldScreen';
import { PathBarScreen } from './screens/PathBarScreen';
import { PopoverScreen } from './screens/PopoverScreen';
import { PreferencesGroupScreen } from './screens/PreferencesGroupScreen';
import { ProgressBarScreen } from './screens/ProgressBarScreen';
import { RadioButtonScreen } from './screens/RadioButtonScreen';
import { RangeSliderScreen } from './screens/RangeSliderScreen';
import { RatingStarsScreen } from './screens/RatingStarsScreen';
import { ScrollToTopScreen } from './screens/ScrollToTopScreen';
import { SearchBarScreen } from './screens/SearchBarScreen';
import { SegmentedBarScreen } from './screens/SegmentedBarScreen';
import { SeparatorScreen } from './screens/SeparatorScreen';
import { SidebarScreen } from './screens/SidebarScreen';
import { SkeletonScreen } from './screens/SkeletonScreen';
import { SliderScreen } from './screens/SliderScreen';
import { SpacerScreen } from './screens/SpacerScreen';
import { SpinButtonScreen } from './screens/SpinButtonScreen';
import { SpinnerScreen } from './screens/SpinnerScreen';
import { SpinRowScreen } from './screens/SpinRowScreen';
import { SplitButtonScreen } from './screens/SplitButtonScreen';
import { StatusBadgeScreen } from './screens/StatusBadgeScreen';
import { StatusPageScreen } from './screens/StatusPageScreen';
import { StepIndicatorScreen } from './screens/StepIndicatorScreen';
import { SwitchRowScreen } from './screens/SwitchRowScreen';
import { SwitchScreen } from './screens/SwitchScreen';
import { TabsScreen } from './screens/TabsScreen';
import { TagInputScreen } from './screens/TagInputScreen';
import { TextFieldScreen } from './screens/TextFieldScreen';
import { TextScreen } from './screens/TextScreen';
import { TimelineScreen } from './screens/TimelineScreen';
import { ToastScreen } from './screens/ToastScreen';
import { ToggleGroupScreen } from './screens/ToggleGroupScreen';
import { ToolbarScreen } from './screens/ToolbarScreen';
import { TooltipScreen } from './screens/TooltipScreen';
import { ViewSwitcherScreen } from './screens/ViewSwitcherScreen';
import { WidgetManagerScreen } from './screens/WidgetManagerScreen';
import { WrapBoxScreen } from './screens/WrapBoxScreen';
import type { ComponentName } from './types';

const SCREENS: Record<ComponentName, ComponentType> = {
  Button: ButtonScreen,
  Text: TextScreen,
  Link: LinkScreen,
  TextField: TextFieldScreen,
  Switch: SwitchScreen,
  Checkbox: CheckboxScreen,
  RadioButton: RadioButtonScreen,
  Separator: SeparatorScreen,
  Card: CardScreen,
  BoxedList: BoxedListScreen,
  ActionRow: ActionRowScreen,
  HeaderBar: HeaderBarScreen,
  Tabs: TabsScreen,
  ViewSwitcher: ViewSwitcherScreen,
  Sidebar: SidebarScreen,
  SearchBar: SearchBarScreen,
  PathBar: PathBarScreen,
  Spinner: SpinnerScreen,
  ProgressBar: ProgressBarScreen,
  Skeleton: SkeletonScreen,
  Toast: ToastScreen,
  Banner: BannerScreen,
  Dialog: DialogScreen,
  Tooltip: TooltipScreen,
  Icon: IconScreen,
  AnimatedIcon: AnimatedIconScreen,
  Dropdown: DropdownScreen,
  Slider: SliderScreen,
  SpinButton: SpinButtonScreen,
  Avatar: AvatarScreen,
  Badge: BadgeScreen,
  Popover: PopoverScreen,
  BottomSheet: BottomSheetScreen,
  BottomTabBar: BottomTabBarScreen,
  Overlay: OverlayScreen,
  LevelBar: LevelBarScreen,
  Expander: ExpanderScreen,
  Divider: DividerScreen,
  Highlight: HighlightScreen,
  FileTypeIcon: FileTypeIconScreen,
  Chip: ChipScreen,
  SegmentedBar: SegmentedBarScreen,
  IconButton: IconButtonScreen,
  Drawer: DrawerScreen,
  AvatarGroup: AvatarGroupScreen,
  AvatarRotator: AvatarRotatorScreen,
  CoachMark: CoachMarkScreen,
  Clamp: ClampScreen,
  Box: BoxScreen,
  BreakpointBin: BreakpointBinScreen,
  WrapBox: WrapBoxScreen,
  StatusPage: StatusPageScreen,
  ToggleGroup: ToggleGroupScreen,
  InlineViewSwitcher: InlineViewSwitcherScreen,
  PreferencesGroup: PreferencesGroupScreen,
  EntryRow: EntryRowScreen,
  PasswordEntryRow: PasswordEntryRowScreen,
  ComboRow: ComboRowScreen,
  SpinRow: SpinRowScreen,
  SplitButton: SplitButtonScreen,
  TagInput: TagInputScreen,
  ColorPicker: ColorPickerScreen,
  Bin: BinScreen,
  Blockquote: BlockquoteScreen,
  ButtonContent: ButtonContentScreen,
  ButtonRow: ButtonRowScreen,
  Callout: CalloutScreen,
  CheckRow: CheckRowScreen,
  SwitchRow: SwitchRowScreen,
  ExpanderRow: ExpanderRowScreen,
  FieldGroup: FieldGroupScreen,
  MultiSelectDropdown: MultiSelectDropdownScreen,
  FilterableMultiSelectDropdown: FilterableMultiSelectDropdownScreen,
  PasswordField: PasswordFieldScreen,
  RangeSlider: RangeSliderScreen,
  StatusBadge: StatusBadgeScreen,
  WidgetManager: WidgetManagerScreen,
  ScrollToTop: ScrollToTopScreen,
  StepIndicator: StepIndicatorScreen,
  Timeline: TimelineScreen,
  CopyButton: CopyButtonScreen,
  Toolbar: ToolbarScreen,
  Spacer: SpacerScreen,
  LinkedGroup: LinkedGroupScreen,
  NavigationSplitView: NavigationSplitViewScreen,
  RatingStars: RatingStarsScreen,
  LineChart: LineChartScreen,
  BarChart: BarChartScreen,
  AreaChart: AreaChartScreen,
};

export interface ComponentScreenProps {
  name: ComponentName;
  onBack: () => void;
}

export const ComponentScreen = ({ name, onBack }: ComponentScreenProps) => {
  const Demo = SCREENS[name];

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
        <Button variant="flat" onPress={onBack}>
          {'‹ Home'}
        </Button>
        <Text variant="title-3" style={{ marginStart: 4 }}>
          {name}
        </Text>
      </View>
      <Separator />
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ padding: 16, gap: 28 }}
      >
        <Demo />
      </ScrollView>
    </View>
  );
};
