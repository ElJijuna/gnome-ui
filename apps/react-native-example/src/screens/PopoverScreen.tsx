import { Button, Popover, Text } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

export const PopoverScreen = () => {
  const [controlledOpen, setControlledOpen] = useState(false);

  return (
    <>
      <Section title="Basic" description="Rich content — plain text here">
        <Popover content={<Text>This is a popover with some rich content inside.</Text>}>
          <Button>Open popover</Button>
        </Popover>
      </Section>

      <Section title="Placements" description="Auto-flips when there isn't enough room">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <Popover placement="top" content={<Text>Above the trigger</Text>}>
            <Button variant="flat">Top</Button>
          </Popover>
          <Popover placement="bottom" content={<Text>Below the trigger</Text>}>
            <Button variant="flat">Bottom</Button>
          </Popover>
          <Popover placement="left" content={<Text>Left of the trigger</Text>}>
            <Button variant="flat">Left</Button>
          </Popover>
          <Popover placement="right" content={<Text>Right of the trigger</Text>}>
            <Button variant="flat">Right</Button>
          </Popover>
        </View>
      </Section>

      <Section title="Interactive content" description="Buttons inside the panel work normally">
        <Popover
          content={
            <View style={{ gap: 8 }}>
              <Text variant="heading">Quick actions</Text>
              <Button size="sm" variant="suggested" onPress={() => {}}>
                Confirm
              </Button>
              <Button size="sm" variant="flat" onPress={() => {}}>
                Cancel
              </Button>
            </View>
          }
        >
          <Button variant="suggested">Actions</Button>
        </Popover>
      </Section>

      <Section title="Controlled" description={`Externally open: ${controlledOpen}`}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Popover
            content={<Text>Controlled from outside the trigger.</Text>}
            open={controlledOpen}
            onOpenChange={setControlledOpen}
          >
            <Button>Toggle</Button>
          </Popover>
          <Button variant="flat" onPress={() => setControlledOpen(false)}>
            Force close
          </Button>
        </View>
      </Section>
    </>
  );
};
