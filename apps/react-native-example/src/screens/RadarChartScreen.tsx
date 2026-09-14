import { RadarChart } from '@gnome-ui/react-native-charts';

import { Section } from '../Section';

const CAR_STATS = [
  { stat: 'Speed', car1: 80, car2: 60 },
  { stat: 'Power', car1: 90, car2: 95 },
  { stat: 'Handling', car1: 70, car2: 85 },
  { stat: 'Comfort', car1: 60, car2: 75 },
  { stat: 'Efficiency', car1: 50, car2: 65 },
  { stat: 'Range', car1: 65, car2: 80 },
];

export const RadarChartScreen = () => {
  return (
    <>
      <Section title="Single series" description="Outline only (default), no legend">
        <RadarChart
          data={CAR_STATS}
          series={[{ dataKey: 'car1', name: 'Car 1' }]}
          angleKey="stat"
          height={280}
        />
      </Section>

      <Section title="Filled multi-series with legend" description="filled, showLegend">
        <RadarChart
          data={CAR_STATS}
          series={[
            { dataKey: 'car1', name: 'Car 1' },
            { dataKey: 'car2', name: 'Car 2' },
          ]}
          angleKey="stat"
          filled
          showLegend
          height={300}
        />
      </Section>

      <Section title="Legend on the side" description='legendPosition="right"'>
        <RadarChart
          data={CAR_STATS}
          series={[
            { dataKey: 'car1', name: 'Car 1' },
            { dataKey: 'car2', name: 'Car 2' },
          ]}
          angleKey="stat"
          filled
          showLegend
          legendPosition="right"
          height={260}
        />
      </Section>
    </>
  );
};
