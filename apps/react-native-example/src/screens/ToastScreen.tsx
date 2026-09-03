import { Button, Toast, Toaster, useGnomeTheme } from '@gnome-ui/react-native';
import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Section } from '../Section';

interface ToastItem {
  id: number;
  title: string;
  actionLabel?: string;
  dismissible?: boolean;
  duration?: number;
}

let nextId = 1;

const DemoStage = ({
  toasts,
  position,
  onDismiss,
}: {
  toasts: ToastItem[];
  position: 'top' | 'bottom';
  onDismiss: (id: number) => void;
}) => {
  const theme = useGnomeTheme();

  return (
    <View
      style={{
        height: 220,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: theme.viewBgColor,
        borderWidth: 1,
        borderColor: theme.borderSubtle,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: theme.windowFgColor, opacity: theme.opacityDim }}>
        App content goes here
      </Text>

      <Toaster position={position}>
        {toasts.map((t) => (
          <Toast
            key={t.id}
            title={t.title}
            actionLabel={t.actionLabel}
            onAction={() => {}}
            dismissible={t.dismissible}
            duration={t.duration}
            onDismiss={() => onDismiss(t.id)}
          />
        ))}
      </Toaster>
    </View>
  );
};

export const ToastScreen = () => {
  const [basic, setBasic] = useState<ToastItem[]>([]);
  const [top, setTop] = useState<ToastItem[]>([]);

  const push = (setter: Dispatch<SetStateAction<ToastItem[]>>, item: Omit<ToastItem, 'id'>) => {
    const id = nextId++;

    setter((prev) => [...prev, { ...item, id }]);
  };

  const dismiss = (setter: Dispatch<SetStateAction<ToastItem[]>>, id: number) => {
    setter((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      <Section title="Bottom (default)" description="Auto-dismisses after 3s — hold to pause it">
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Button variant="flat" onPress={() => push(setBasic, { title: 'Saved successfully' })}>
              Basic
            </Button>
            <Button
              variant="flat"
              onPress={() =>
                push(setBasic, { title: 'File deleted', actionLabel: 'Undo', duration: 5000 })
              }
            >
              With action
            </Button>
            <Button
              variant="flat"
              onPress={() =>
                push(setBasic, { title: 'Sync failed', dismissible: true, duration: 0 })
              }
            >
              Persistent
            </Button>
          </View>
          <DemoStage toasts={basic} position="bottom" onDismiss={(id) => dismiss(setBasic, id)} />
        </View>
      </Section>

      <Section title="Top">
        <View style={{ gap: 8 }}>
          <Button variant="flat" onPress={() => push(setTop, { title: 'Reconnected' })}>
            Show toast
          </Button>
          <DemoStage toasts={top} position="top" onDismiss={(id) => dismiss(setTop, id)} />
        </View>
      </Section>
    </>
  );
};
