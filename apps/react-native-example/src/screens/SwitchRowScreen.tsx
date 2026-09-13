import { BoxedList, SwitchRow } from '@gnome-ui/react-native';
import { useState } from 'react';

import { Section } from '../Section';

export const SwitchRowScreen = () => {
  const [selected, setSelected] = useState<Record<string, boolean>>({
    wifi: true,
    bluetooth: false,
    airplaneMode: false,
  });

  return (
    <>
      <Section title="Uncontrolled" description="Press anywhere on the row to toggle">
        <BoxedList>
          <SwitchRow title="Dark mode" subtitle="Follow system appearance" defaultChecked />
          <SwitchRow title="Notifications" subtitle="Show badges and banners" />
        </BoxedList>
      </Section>

      <Section title="Controlled" description="Settings-style toggles">
        <BoxedList>
          <SwitchRow
            title="Wi-Fi"
            subtitle="Home Network"
            checked={selected.wifi}
            onCheckedChange={(checked) => setSelected((prev) => ({ ...prev, wifi: checked }))}
          />
          <SwitchRow
            title="Bluetooth"
            subtitle="Off"
            checked={selected.bluetooth}
            onCheckedChange={(checked) => setSelected((prev) => ({ ...prev, bluetooth: checked }))}
          />
          <SwitchRow
            title="Airplane Mode"
            checked={selected.airplaneMode}
            onCheckedChange={(checked) =>
              setSelected((prev) => ({ ...prev, airplaneMode: checked }))
            }
          />
        </BoxedList>
      </Section>

      <Section title="Disabled" description="opacity dims, press is inert">
        <BoxedList>
          <SwitchRow title="Developer options" disabled />
          <SwitchRow
            title="Legacy sync"
            subtitle="Unavailable on this account"
            disabled
            defaultChecked
          />
        </BoxedList>
      </Section>
    </>
  );
};
