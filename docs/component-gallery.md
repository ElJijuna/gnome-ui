# Component Gallery

A prototype: each component below has one live demo per platform it ships
on, switched by the tabs — React and Web Components embed their **real,
already-deployed Storybook story**; React Native has no web-viewable
Storybook (it's a mobile/Expo app, not a browser target), so its tab shows
only the usage snippet. Code blocks are syntax-highlighted with the same
GNOME/Adwaita palette as the rest of this site.

## Button

<div class="gnome-platform-tabs">
  <button type="button" class="gnome-platform-tab gnome-platform-badge gnome-platform-badge--react is-active" data-group="button" data-target="react">React</button>
  <button type="button" class="gnome-platform-tab gnome-platform-badge gnome-platform-badge--react-native" data-group="button" data-target="react-native">React Native</button>
  <button type="button" class="gnome-platform-tab gnome-platform-badge gnome-platform-badge--web-components" data-group="button" data-target="web-components">Web Components</button>
</div>

<div markdown="1" class="gnome-platform-panel" data-group="button" data-platform="react">

<div class="gnome-live-demo">
  <div class="gnome-live-demo__bar">
    <div class="gnome-live-demo__dots"><span></span><span></span><span></span></div>
    <div class="gnome-live-demo__url">gnome-ui.org/react — Button</div>
  </div>
  <iframe src="https://gnome-ui.org/react/iframe.html?id=components-button--default&viewMode=story" title="Button live demo (React)"></iframe>
</div>

```tsx
import { Button } from '@gnome-ui/react';

<Button variant="suggested" onClick={() => save()}>
  Save Changes
</Button>
```

[Full docs & controls →](https://gnome-ui.org/react/?path=/docs/components-button--docs)

</div>

<div markdown="1" class="gnome-platform-panel" data-group="button" data-platform="react-native" hidden>

```tsx
import { Button } from '@gnome-ui/react-native';

<Button variant="suggested" onPress={() => save()}>
  Save Changes
</Button>
```

No web-viewable Storybook for this platform — verified on a real iOS
Simulator instead. See [the React Native package's own
README](https://github.com/ElJijuna/gnome-ui/tree/main/packages/react-native#button).

</div>

<div markdown="1" class="gnome-platform-panel" data-group="button" data-platform="web-components" hidden>

<div class="gnome-live-demo">
  <div class="gnome-live-demo__bar">
    <div class="gnome-live-demo__dots"><span></span><span></span><span></span></div>
    <div class="gnome-live-demo__url">gnome-ui.org/web-components — Button</div>
  </div>
  <iframe src="https://gnome-ui.org/web-components/iframe.html?id=web-components-button--interactive&viewMode=story" title="Button live demo (Web Components)"></iframe>
</div>

```html
<gnome-button variant="suggested" size="md">
  <button type="submit" data-slot="button-control">Save Changes</button>
</gnome-button>
```

[Full docs & controls →](https://gnome-ui.org/web-components/?path=/docs/web-components-button--docs)

</div>

## Toolbar

<div class="gnome-platform-tabs">
  <button type="button" class="gnome-platform-tab gnome-platform-badge gnome-platform-badge--react is-active" data-group="toolbar" data-target="react">React</button>
  <button type="button" class="gnome-platform-tab gnome-platform-badge gnome-platform-badge--react-native" data-group="toolbar" data-target="react-native">React Native</button>
  <button type="button" class="gnome-platform-tab gnome-platform-badge gnome-platform-badge--web-components" data-group="toolbar" data-target="web-components">Web Components</button>
</div>

<div markdown="1" class="gnome-platform-panel" data-group="toolbar" data-platform="react">

<div class="gnome-live-demo">
  <div class="gnome-live-demo__bar">
    <div class="gnome-live-demo__dots"><span></span><span></span><span></span></div>
    <div class="gnome-live-demo__url">gnome-ui.org/react — Toolbar</div>
  </div>
  <iframe src="https://gnome-ui.org/react/iframe.html?id=components-toolbar--default&viewMode=story" title="Toolbar live demo (React)"></iframe>
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

</div>

<div markdown="1" class="gnome-platform-panel" data-group="toolbar" data-platform="react-native" hidden>

```tsx
import { Button, Spacer, Toolbar } from '@gnome-ui/react-native';

<Toolbar>
  <Button variant="flat">Back</Button>
  <Spacer />
  <Button variant="flat">Edit</Button>
  <Button variant="flat">Done</Button>
</Toolbar>
```

No web-viewable Storybook for this platform — verified on a real iOS
Simulator instead. See [the React Native package's own
README](https://github.com/ElJijuna/gnome-ui/tree/main/packages/react-native#toolbar).

</div>

<div markdown="1" class="gnome-platform-panel" data-group="toolbar" data-platform="web-components" hidden>

<div class="gnome-live-demo">
  <div class="gnome-live-demo__bar">
    <div class="gnome-live-demo__dots"><span></span><span></span><span></span></div>
    <div class="gnome-live-demo__url">gnome-ui.org/web-components — Toolbar</div>
  </div>
  <iframe src="https://gnome-ui.org/web-components/iframe.html?id=web-components-toolbar--interactive&viewMode=story" title="Toolbar live demo (Web Components)"></iframe>
</div>

```html
<gnome-toolbar>
  <gnome-button variant="flat">
    <button type="button" data-slot="button-control">Back</button>
  </gnome-button>
  <div style="flex: 1"></div>
  <gnome-button variant="suggested">
    <button type="button" data-slot="button-control">Save</button>
  </gnome-button>
</gnome-toolbar>
```

[Full docs & controls →](https://gnome-ui.org/web-components/?path=/docs/web-components-toolbar--docs)

</div>

## StepIndicator

<div class="gnome-platform-tabs">
  <button type="button" class="gnome-platform-tab gnome-platform-badge gnome-platform-badge--react is-active" data-group="stepindicator" data-target="react">React</button>
  <button type="button" class="gnome-platform-tab gnome-platform-badge gnome-platform-badge--react-native" data-group="stepindicator" data-target="react-native">React Native</button>
  <button type="button" class="gnome-platform-tab gnome-platform-badge gnome-platform-badge--web-components" data-group="stepindicator" data-target="web-components">Web Components</button>
</div>

<div markdown="1" class="gnome-platform-panel" data-group="stepindicator" data-platform="react">

<div class="gnome-live-demo gnome-live-demo--tall">
  <div class="gnome-live-demo__bar">
    <div class="gnome-live-demo__dots"><span></span><span></span><span></span></div>
    <div class="gnome-live-demo__url">gnome-ui.org/react — StepIndicator</div>
  </div>
  <iframe src="https://gnome-ui.org/react/iframe.html?id=components-stepindicator--default&viewMode=story" title="StepIndicator live demo (React)"></iframe>
</div>

```tsx
import { StepIndicator } from '@gnome-ui/react';

<StepIndicator steps={4} currentStep={1} />
<StepIndicator steps={['Account', 'Profile', 'Confirm']} currentStep={1} />
```

[Full docs & controls →](https://gnome-ui.org/react/?path=/docs/components-stepindicator--docs)

</div>

<div markdown="1" class="gnome-platform-panel" data-group="stepindicator" data-platform="react-native" hidden>

```tsx
import { StepIndicator } from '@gnome-ui/react-native';

<StepIndicator steps={4} currentStep={1} />
<StepIndicator steps={['Account', 'Profile', 'Confirm']} currentStep={1} />
```

No web-viewable Storybook for this platform — verified on a real iOS
Simulator instead. See [the React Native package's own
README](https://github.com/ElJijuna/gnome-ui/tree/main/packages/react-native#stepindicator).

</div>

<div markdown="1" class="gnome-platform-panel" data-group="stepindicator" data-platform="web-components" hidden>

<div class="gnome-live-demo gnome-live-demo--tall">
  <div class="gnome-live-demo__bar">
    <div class="gnome-live-demo__dots"><span></span><span></span><span></span></div>
    <div class="gnome-live-demo__url">gnome-ui.org/web-components — StepIndicator</div>
  </div>
  <iframe src="https://gnome-ui.org/web-components/iframe.html?id=web-components-step-indicator--interactive&viewMode=story" title="StepIndicator live demo (Web Components)"></iframe>
</div>

```html
<gnome-step-indicator steps="4" current="1"></gnome-step-indicator>
<gnome-step-indicator steps="Account, Profile, Confirm" current="1"></gnome-step-indicator>
```

[Full docs & controls →](https://gnome-ui.org/web-components/?path=/docs/web-components-step-indicator--docs)

</div>
