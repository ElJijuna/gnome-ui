import { BoxedList, CheckRow } from '@gnome-ui/react-native';
import { useState } from 'react';

import { Section } from '../Section';

export const CheckRowScreen = () => {
  const [selected, setSelected] = useState<Record<string, boolean>>({
    wifi: true,
    bluetooth: false,
    vpn: false,
  });

  return (
    <>
      <Section title="Uncontrolled" description="Press anywhere on the row to toggle">
        <BoxedList>
          <CheckRow title="Backups" subtitle="Automatic, weekly" defaultChecked />
          <CheckRow title="Crash reports" subtitle="Send anonymized diagnostics" />
        </BoxedList>
      </Section>

      <Section title="Controlled" description="Multi-select scenario">
        <BoxedList>
          <CheckRow
            title="Wi-Fi"
            subtitle="Home Network"
            checked={selected.wifi}
            onCheckedChange={(checked) => setSelected((prev) => ({ ...prev, wifi: checked }))}
          />
          <CheckRow
            title="Bluetooth"
            subtitle="Off"
            checked={selected.bluetooth}
            onCheckedChange={(checked) => setSelected((prev) => ({ ...prev, bluetooth: checked }))}
          />
          <CheckRow
            title="VPN"
            subtitle="Not connected"
            checked={selected.vpn}
            onCheckedChange={(checked) => setSelected((prev) => ({ ...prev, vpn: checked }))}
          />
        </BoxedList>
      </Section>

      <Section title="Disabled" description="opacity dims, press is inert">
        <BoxedList>
          <CheckRow title="Restore purchase" disabled />
          <CheckRow
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
