# Component Gallery

A prototype: each component below embeds its **real, live Storybook story**
(same origin, already deployed) plus the usage snippet, syntax-highlighted
with the same GNOME/Adwaita palette as the rest of this site.

## Button

<div class="gnome-platforms">
  <span class="gnome-platform-badge gnome-platform-badge--react" title="Available in @gnome-ui/react">React</span>
  <span class="gnome-platform-badge gnome-platform-badge--react-native" title="Available in @gnome-ui/react-native">React Native</span>
  <span class="gnome-platform-badge gnome-platform-badge--web-components" title="Available in @gnome-ui/web-components">Web Components</span>
</div>

<div class="gnome-live-demo">
  <div class="gnome-live-demo__bar">
    <div class="gnome-live-demo__dots"><span></span><span></span><span></span></div>
    <div class="gnome-live-demo__url">gnome-ui.org/react — Button</div>
  </div>
  <iframe src="https://gnome-ui.org/react/iframe.html?id=components-button--default&viewMode=story" title="Button live demo"></iframe>
</div>

```tsx
import { Button } from '@gnome-ui/react';

<Button variant="suggested" onClick={() => save()}>
  Save Changes
</Button>
```

[Full docs & controls →](https://gnome-ui.org/react/?path=/docs/components-button--docs)

## Toolbar

<div class="gnome-platforms">
  <span class="gnome-platform-badge gnome-platform-badge--react" title="Available in @gnome-ui/react">React</span>
  <span class="gnome-platform-badge gnome-platform-badge--react-native" title="Available in @gnome-ui/react-native">React Native</span>
  <span class="gnome-platform-badge gnome-platform-badge--web-components" title="Available in @gnome-ui/web-components">Web Components</span>
</div>

<div class="gnome-live-demo">
  <div class="gnome-live-demo__bar">
    <div class="gnome-live-demo__dots"><span></span><span></span><span></span></div>
    <div class="gnome-live-demo__url">gnome-ui.org/react — Toolbar</div>
  </div>
  <iframe src="https://gnome-ui.org/react/iframe.html?id=components-toolbar--default&viewMode=story" title="Toolbar live demo"></iframe>
</div>

```tsx
import { Button, Spacer, Toolbar } from '@gnome-ui/react';

<Toolbar>
  <Button variant="flat">Back</Button>
  <Spacer />
  <Button variant="flat">Edit</Button>
  <Button variant="flat">Done</Button>
</Toolbar>
```

[Full docs & controls →](https://gnome-ui.org/react/?path=/docs/components-toolbar--docs)

## StepIndicator

<div class="gnome-platforms">
  <span class="gnome-platform-badge gnome-platform-badge--react" title="Available in @gnome-ui/react">React</span>
  <span class="gnome-platform-badge gnome-platform-badge--react-native" title="Available in @gnome-ui/react-native">React Native</span>
  <span class="gnome-platform-badge gnome-platform-badge--web-components" title="Available in @gnome-ui/web-components">Web Components</span>
</div>

<div class="gnome-live-demo gnome-live-demo--tall">
  <div class="gnome-live-demo__bar">
    <div class="gnome-live-demo__dots"><span></span><span></span><span></span></div>
    <div class="gnome-live-demo__url">gnome-ui.org/react — StepIndicator</div>
  </div>
  <iframe src="https://gnome-ui.org/react/iframe.html?id=components-stepindicator--default&viewMode=story" title="StepIndicator live demo"></iframe>
</div>

```tsx
import { StepIndicator } from '@gnome-ui/react';

<StepIndicator steps={4} currentStep={1} />
<StepIndicator steps={['Account', 'Profile', 'Confirm']} currentStep={1} />
```

[Full docs & controls →](https://gnome-ui.org/react/?path=/docs/components-stepindicator--docs)
