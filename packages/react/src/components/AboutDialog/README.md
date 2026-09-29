Standard app info dialog with details, credits, and legal tabs.
Mirrors `AdwAboutDialog`.

Provide `applicationName` plus any combination of `version`, `comments`,
`developerName`, `website`, `developers`, `designers`, `artists`,
`copyright`, `licenseType`, and `licenseText`.
Credits and Legal tabs appear automatically when their content is supplied.

### Other apps (libadwaita 1.10 / GNOME 51)
- **`otherApps`** — other applications by the same developer (`name`, `summary`, `icon`, `url`), listed at the end of the Details tab.
- **`otherAppsTitle`** — custom heading for that section. Defaults to "Other Apps by {developerName}", or "Other Apps" without a developer name.
