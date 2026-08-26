Onboarding **feature-discovery** pattern: spotlight a UI element and anchor a
callout bubble (title, description, actions) beside it to teach a user one
feature. Compose several with `CoachMarkTour`, or drive a single mark with
`open`.

Not a GNOME HIG widget — a pragmatic web-app pattern built on the same design
tokens and primitives (`Button`, `Portal`) as the rest of the library. Renders
into a portal, positions with a viewport-aware flip, traps focus in the bubble,
closes on <kbd>Escape</kbd>, and honours `prefers-reduced-motion`.

## Single mark

```tsx
import { useRef, useState } from 'react';
import { CoachMark } from '@gnome-ui/react/components/CoachMark';

function Example() {
  const target = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(true);

  return (
    <>
      <button ref={target}>Sync</button>
      <CoachMark
        open={open}
        targetRef={target}
        title="Sync your files"
        description="Press this to keep every device up to date."
        primaryAction={{ label: 'Got it', onClick: () => setOpen(false) }}
        onDismiss={() => setOpen(false)}
      />
    </>
  );
}
```

## Guided tour

```tsx
import { CoachMarkTour } from '@gnome-ui/react/components/CoachMark';

<CoachMarkTour
  open={running}
  steps={[
    { targetRef: searchRef, title: 'Search', description: 'Find anything fast.' },
    { targetRef: addRef, title: 'Add', description: 'Create a new item here.', placement: 'left' },
    { targetRef: menuRef, title: 'Menu', description: 'Everything else lives here.' },
  ]}
  onFinish={() => setRunning(false)}
  onSkip={() => setRunning(false)}
/>
```

Each step shows **Next**/**Done** (primary) and **Skip**/**Back** (secondary),
plus an "X of N" counter. Labels are overridable via `labels` for i18n.
