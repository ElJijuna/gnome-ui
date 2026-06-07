Empty-state and status page following the Adwaita `AdwStatusPage` pattern.

Use to fill an empty view with context and a path forward.

### Guidelines
- Always explain **why** the view is empty and **what the user can do** about it.
- Keep the title to one short noun phrase — "No Results", "All Done", "Connection Lost".
- The description should be one or two sentences at most.
- Provide one primary action when there is a clear next step.
- Choose an icon that reinforces the message — do not use generic placeholders.
- Do not use for loading states — use `Spinner` or `ProgressBar` instead.
