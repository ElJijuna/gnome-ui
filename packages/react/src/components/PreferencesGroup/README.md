Titled section that wraps a `BoxedList` with an optional description.

Use inside a `PreferencesPage` to group related settings under a named
heading. The group is purely a layout and labelling wrapper — pass a
`BoxedList` as `children`.

Mirrors `AdwPreferencesGroup`.

### Usage
- `title` labels the group (e.g. "Appearance", "Privacy").
- `description` adds a dimmed subtitle below the title.
- `headerSuffix` places a widget (e.g. a reset Button) at the trailing edge of the header.
