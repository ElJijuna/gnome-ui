import { GaugeChart } from '@gnome-ui/react-native-charts';

import { Section } from '../Section';

export const GaugeChartScreen = () => {
  return (
    <>
      <Section title="Default" description="value, min, max — accent color">
        <GaugeChart value={62} label="CPU" aria-label="CPU usage" height={200} />
      </Section>

      <Section title="Thresholds" description="Ascending value/color status bands">
        <GaugeChart
          value={82}
          label="Disk"
          thresholds={[
            { value: 0, color: '#2ec27e' },
            { value: 50, color: '#f6d32d' },
            { value: 80, color: '#e01b24' },
          ]}
          height={200}
          aria-label="Disk usage"
        />
      </Section>

      <Section
        title="Custom range + formatter"
        description="min={0} max={1000}, custom valueFormatter"
      >
        <GaugeChart
          value={620}
          min={0}
          max={1000}
          label="Requests/min"
          valueFormatter={(v) => `${v}`}
          color="#3584e4"
          height={200}
          aria-label="Requests per minute"
        />
      </Section>

      <Section title="No value" description="showValue={false}">
        <GaugeChart value={30} showValue={false} height={160} aria-label="Battery level" />
      </Section>
    </>
  );
};
