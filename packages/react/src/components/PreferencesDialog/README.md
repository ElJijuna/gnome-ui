Multi-page settings dialog using `PreferencesPage` tabs.

Renders a wide modal with a sidebar listing pages on the left. Each
`PreferencesPage` child becomes a navigation entry. When only one page
is provided the sidebar is hidden. Supports built-in search via the
`searchable` prop (default: `true`).

Mirrors `AdwPreferencesDialog`.

### Usage
```tsx
<PreferencesDialog open={open} onClose={() => setOpen(false)}>
  <PreferencesPage title="General" iconName="preferences-system-symbolic">
    <PreferencesGroup title="Appearance">
      <BoxedList>
        <SwitchRow title="Dark mode" />
      </BoxedList>
    </PreferencesGroup>
  </PreferencesPage>
</PreferencesDialog>
```
