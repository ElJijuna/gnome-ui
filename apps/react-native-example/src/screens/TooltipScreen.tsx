import { Button, Tooltip, type TooltipPlacement } from '@gnome-ui/react-native';
import { View } from 'react-native';

import { Section } from '../Section';

const PLACEMENTS: TooltipPlacement[] = ['top', 'bottom', 'left', 'right'];

export const TooltipScreen = () => {
  return (
    <>
      <Section title="Placements" description="Long-press a button to reveal its tooltip">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {PLACEMENTS.map((placement) => (
            <Tooltip key={placement} label={`Placed ${placement}`} placement={placement}>
              <Button variant="flat">{placement}</Button>
            </Tooltip>
          ))}
        </View>
      </Section>

      <Section title="Auto-flip" description="Flips to fit when the preferred side has no room">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Tooltip label="Flips to the right — no room on the left" placement="left">
            <Button variant="flat">Left edge</Button>
          </Tooltip>
          <Tooltip label="Flips to the left — no room on the right" placement="right">
            <Button variant="flat">Right edge</Button>
          </Tooltip>
        </View>
      </Section>

      <Section title="Instant" description="delay={0} — shows immediately">
        <Tooltip label="No delay" delay={0}>
          <Button variant="flat">Instant tooltip</Button>
        </Tooltip>
      </Section>
    </>
  );
};
