import { Button, CoachMark, CoachMarkTour } from '@gnome-ui/react-native';
import { useRef, useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

const SingleMarkDemo = () => {
  const target = useRef<View>(null);
  const [open, setOpen] = useState(false);

  return (
    <View style={{ alignItems: 'flex-start' }}>
      <Button ref={target} onPress={() => setOpen(true)}>
        Sync
      </Button>
      <CoachMark
        open={open}
        targetRef={target}
        title="Sync your files"
        description="Press this to keep every device up to date."
        primaryAction={{ label: 'Got it', onPress: () => setOpen(false) }}
        onDismiss={() => setOpen(false)}
      />
    </View>
  );
};

const TourDemo = () => {
  const searchRef = useRef<View>(null);
  const addRef = useRef<View>(null);
  const menuRef = useRef<View>(null);
  const [running, setRunning] = useState(false);

  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <Button ref={searchRef} variant="flat" onPress={() => setRunning(true)}>
        Search
      </Button>
      <Button ref={addRef} variant="flat">
        Add
      </Button>
      <Button ref={menuRef} variant="flat">
        Menu
      </Button>

      <CoachMarkTour
        open={running}
        steps={[
          { targetRef: searchRef, title: 'Search', description: 'Find anything fast.' },
          {
            targetRef: addRef,
            title: 'Add',
            description: 'Create a new item here.',
            placement: 'left',
          },
          { targetRef: menuRef, title: 'Menu', description: 'Everything else lives here.' },
        ]}
        onFinish={() => setRunning(false)}
        onSkip={() => setRunning(false)}
      />
    </View>
  );
};

export const CoachMarkScreen = () => {
  return (
    <>
      <Section title="Single mark" description="Tap Sync to spotlight it">
        <SingleMarkDemo />
      </Section>

      <Section title="Guided tour" description="Tap Search to start a 3-step tour">
        <TourDemo />
      </Section>
    </>
  );
};
