import { Button, StepIndicator, useGnomeTheme } from '@gnome-ui/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Section } from '../Section';

export const StepIndicatorScreen = () => {
  const theme = useGnomeTheme();
  const [step, setStep] = useState(1);
  const [labeledStep, setLabeledStep] = useState(0);

  return (
    <>
      <Section title="Unlabelled" description="Plain number, no onStepClick — shows the caption">
        <StepIndicator steps={5} currentStep={step} />
        <View style={{ flexDirection: 'row', gap: theme.space2, marginTop: theme.space2 }}>
          <Button variant="flat" disabled={step === 0} onPress={() => setStep((s) => s - 1)}>
            Back
          </Button>
          <Button variant="flat" disabled={step === 4} onPress={() => setStep((s) => s + 1)}>
            Next
          </Button>
        </View>
      </Section>

      <Section
        title="Labelled + clickable"
        description="Tap a completed step's circle to jump back to it"
      >
        <StepIndicator
          steps={['Account', 'Profile', 'Payment', 'Confirm']}
          currentStep={labeledStep}
          onStepClick={setLabeledStep}
        />
        <View style={{ flexDirection: 'row', gap: theme.space2, marginTop: theme.space2 }}>
          <Button
            variant="flat"
            disabled={labeledStep === 0}
            onPress={() => setLabeledStep((s) => s - 1)}
          >
            Back
          </Button>
          <Button
            variant="suggested"
            disabled={labeledStep === 3}
            onPress={() => setLabeledStep((s) => s + 1)}
          >
            Next
          </Button>
        </View>
      </Section>

      <Section title="Vertical" description="Labels beside each circle, connector runs downward">
        <StepIndicator
          steps={['Order placed', 'Packed', 'Shipped', 'Delivered']}
          currentStep={2}
          orientation="vertical"
        />
      </Section>

      <Section
        title="Last step"
        description="Earlier circles show checkmarks; the last one is current, not completed"
      >
        <StepIndicator steps={4} currentStep={3} />
      </Section>
    </>
  );
};
