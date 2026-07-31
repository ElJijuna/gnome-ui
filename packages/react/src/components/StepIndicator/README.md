Numbered "Step X of Y" progress indicator for onboarding/wizard flows.

Complements `CarouselIndicatorDots`/`CarouselIndicatorLines` with a labelled, linear alternative — steps are numbered circles connected by a progress line, with the completed portion tinted in the accent color.

```tsx
import { StepIndicator } from '@gnome-ui/react';

<StepIndicator steps={4} currentStep={1} />
<StepIndicator steps={['Account', 'Profile', 'Confirm']} currentStep={1} />
```

Pass a plain `number` for an unlabelled sequence — a "Step X of Y" caption is shown above the circles. Pass an array of strings to label each step instead; the caption is omitted since the labels already convey progress.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | `number \| string[]` | — | Total step count, or an array of per-step labels |
| `currentStep` | `number` | — | Zero-based index of the current/active step |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout direction |
| `onStepClick` | `(index: number) => void` | — | Called when a **completed** step's circle is clicked, to jump back |
| `label` | `string` | `'Progress'` | Accessible label for the `nav` landmark |

### Guidelines

- Only completed steps become clickable when `onStepClick` is provided — the current step is already there, and upcoming steps haven't been validated yet, so neither is clickable. This matches typical wizard back-navigation: users can revisit a finished step, but can't skip ahead.
- Use `orientation="vertical"` for a sidebar-style step list (e.g. a multi-section settings wizard); keep the default horizontal layout for top-of-page progress in a dialog or full-page flow.
- `currentStep` is clamped to a valid index automatically, so passing the step count (rather than the last valid index) after the final step completes won't throw or render out of bounds.
