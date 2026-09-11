import { Button, Separator, Text } from '@gnome-ui/react-native';
import type { ComponentType } from 'react';
import { ScrollView, View } from 'react-native';

import { ActionRowScreen } from './screens/ActionRowScreen';
import { AnimatedIconScreen } from './screens/AnimatedIconScreen';
import { AvatarGroupScreen } from './screens/AvatarGroupScreen';
import { AvatarRotatorScreen } from './screens/AvatarRotatorScreen';
import { AvatarScreen } from './screens/AvatarScreen';
import { BadgeScreen } from './screens/BadgeScreen';
import { BannerScreen } from './screens/BannerScreen';
import { BinScreen } from './screens/BinScreen';
import { BlockquoteScreen } from './screens/BlockquoteScreen';
import { BottomSheetScreen } from './screens/BottomSheetScreen';
import { BoxedListScreen } from './screens/BoxedListScreen';
import { BoxScreen } from './screens/BoxScreen';
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
import { DialogScreen } from './screens/DialogScreen';
import { DividerScreen } from './screens/DividerScreen';
import { DrawerScreen } from './screens/DrawerScreen';
import { DropdownScreen } from './screens/DropdownScreen';
import { EntryRowScreen } from './screens/EntryRowScreen';
import { ExpanderRowScreen } from './screens/ExpanderRowScreen';
import { ExpanderScreen } from './screens/ExpanderScreen';
import { FieldGroupScreen } from './screens/FieldGroupScreen';
import { FileTypeIconScreen } from './screens/FileTypeIconScreen';
import { HeaderBarScreen } from './screens/HeaderBarScreen';
import { HighlightScreen } from './screens/HighlightScreen';
import { IconButtonScreen } from './screens/IconButtonScreen';
import { IconScreen } from './screens/IconScreen';
import { InlineViewSwitcherScreen } from './screens/InlineViewSwitcherScreen';
import { LevelBarScreen } from './screens/LevelBarScreen';
import { LinkScreen } from './screens/LinkScreen';
import { OverlayScreen } from './screens/OverlayScreen';
import { PasswordEntryRowScreen } from './screens/PasswordEntryRowScreen';
import { PathBarScreen } from './screens/PathBarScreen';
import { PopoverScreen } from './screens/PopoverScreen';
import { PreferencesGroupScreen } from './screens/PreferencesGroupScreen';
import { ProgressBarScreen } from './screens/ProgressBarScreen';
import { RadioButtonScreen } from './screens/RadioButtonScreen';
import { SearchBarScreen } from './screens/SearchBarScreen';
import { SegmentedBarScreen } from './screens/SegmentedBarScreen';
import { SeparatorScreen } from './screens/SeparatorScreen';
import { SidebarScreen } from './screens/SidebarScreen';
import { SkeletonScreen } from './screens/SkeletonScreen';
import { SliderScreen } from './screens/SliderScreen';
import { SpinButtonScreen } from './screens/SpinButtonScreen';
import { SpinnerScreen } from './screens/SpinnerScreen';
import { StatusPageScreen } from './screens/StatusPageScreen';
import { SwitchScreen } from './screens/SwitchScreen';
import { TabsScreen } from './screens/TabsScreen';
import { TextFieldScreen } from './screens/TextFieldScreen';
import { TextScreen } from './screens/TextScreen';
import { ToastScreen } from './screens/ToastScreen';
import { ToggleGroupScreen } from './screens/ToggleGroupScreen';
import { TooltipScreen } from './screens/TooltipScreen';
import { ViewSwitcherScreen } from './screens/ViewSwitcherScreen';
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
  WrapBox: WrapBoxScreen,
  StatusPage: StatusPageScreen,
  ToggleGroup: ToggleGroupScreen,
  InlineViewSwitcher: InlineViewSwitcherScreen,
  PreferencesGroup: PreferencesGroupScreen,
  EntryRow: EntryRowScreen,
  PasswordEntryRow: PasswordEntryRowScreen,
  ComboRow: ComboRowScreen,
  ColorPicker: ColorPickerScreen,
  Bin: BinScreen,
  Blockquote: BlockquoteScreen,
  ButtonRow: ButtonRowScreen,
  Callout: CalloutScreen,
  CheckRow: CheckRowScreen,
  ExpanderRow: ExpanderRowScreen,
  FieldGroup: FieldGroupScreen,
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
