Blocking modal dialog — two modes in one component.

**Standard** — `title` + `children` + `buttons[]`.

**Alert** (`role="alertdialog"` + `responses[]` + `onResponse`) — for confirmations
and destructive-action warnings. Screen readers announce it immediately.
Escape / backdrop fire the first non-destructive response. Mirrors `AdwAlertDialog`.

For the app-info dialog, use `<AboutDialog />` instead.
