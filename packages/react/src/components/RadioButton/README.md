Single-selection radio button following the GNOME HIG and Adwaita style.

### Guidelines
- Use radio buttons when only one option in a group can be active at a time.
- Always group with a shared `name` attribute so the browser enforces mutual exclusion and enables arrow-key navigation.
- Always pre-select a default option — never leave all options unselected.
- Use 2–5 options; for longer lists prefer a **Dropdown/Select**.
- Always pair each radio with a visible `<label>`.
- Label the group itself with a heading or `<fieldset>` + `<legend>`.
