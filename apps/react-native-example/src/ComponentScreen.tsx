import { Button, Separator, Text } from '@gnome-ui/react-native';
import type { ComponentType } from 'react';
import { ScrollView, View } from 'react-native';

import { ActionRowScreen } from './screens/ActionRowScreen';
import { BoxedListScreen } from './screens/BoxedListScreen';
import { ButtonScreen } from './screens/ButtonScreen';
import { CardScreen } from './screens/CardScreen';
import { CheckboxScreen } from './screens/CheckboxScreen';
import { HeaderBarScreen } from './screens/HeaderBarScreen';
import { LinkScreen } from './screens/LinkScreen';
import { RadioButtonScreen } from './screens/RadioButtonScreen';
import { SeparatorScreen } from './screens/SeparatorScreen';
import { SidebarScreen } from './screens/SidebarScreen';
import { SwitchScreen } from './screens/SwitchScreen';
import { TabsScreen } from './screens/TabsScreen';
import { TextFieldScreen } from './screens/TextFieldScreen';
import { TextScreen } from './screens/TextScreen';
import { ViewSwitcherScreen } from './screens/ViewSwitcherScreen';
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
