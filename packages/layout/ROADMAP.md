# @gnome-ui/layout — Roadmap

Componentes de layout de nivel de aplicación que componen primitivos de
`@gnome-ui/react` siguiendo las GNOME Human Interface Guidelines y el patrón
Adwaita.

---

## Implementado

### `Layout`

Shell de aplicación con zonas nombradas `header`/`topBar`, `sidebar`,
`children`, `footer`/`bottomBar`. Soporta altura `viewport`/`parent`, modelos
de scroll, sidebar overlay, rail collapse, placement `start`/`end`, foco
contenido dentro del overlay y cierre por `Escape`/backdrop.

### `AppHeader`

Barra superior lista para usar con título/subtítulo, controles leading,
navegación, búsqueda y acciones. Envuelve patrones de `HeaderBar` y
`WindowTitle` en una pieza de layout opinionada.

### `PageContent`

Contenedor de página con padding GNOME, `as`, max-width opcional mediante
`Clamp`, y tamaños `sm`/`md`/`lg`/`xl`/numérico.

### `SidebarShell`

Sidebar vertical lista para usar: encabezado fijo, área de navegación
scrollable basada en `Sidebar`, pie fijo y passthrough de props como
`collapsed`, `searchable`, `filter`, `mode` y `variant`.

### `StatusBar`

Barra inferior compacta basada en `Toolbar`, pensada para estado, contadores,
acciones secundarias o metadata de aplicación.

### `UserCard`

Panel de identidad de usuario para sidebars, popovers o páginas de perfil.

### `DashboardGrid`

Grid responsivo de tarjetas con columnas fluidas, gap consistente y soporte
para celdas de distintos tamaños (`span`).

---

## Backlog

### `EmptyState`

Pantalla de estado vacío con ilustración SVG, título, descripción y CTA
principal/secundario. Versión más opinionada de `StatusPage` adaptada para
paneles de contenido.

### `SplitLayout`

Shell de dos columnas: lista/maestro en la izquierda, detalle en la derecha.
Colapsa a una sola columna en mobile (patrón `NavigationSplitView` pero al
nivel de página).

```tsx
<SplitLayout
  list={<ContactList />}
  detail={<ContactDetail />}
  listWidth={320}
/>
```

### `DialogLayout`

Shell interno para `Dialog`s grandes (preferencias, wizards): sección de
navegación lateral + área de contenido scrollable + barra de acciones fija en
el pie.

### `NotificationCenter`

Panel lateral deslizable (right drawer) que lista notificaciones agrupadas por
app. Usa `OverlaySplitView` internamente.

---

## Convenciones del paquete

- Cada componente de layout puede importar de `@gnome-ui/react` pero **nunca al revés**.
- Los estilos propios van en `ComponentName.module.css`; los tokens vienen de `@gnome-ui/core`.
- Cada componente exporta su tipo `Props` nombrado.
- Los valores numéricos deben usar `useNumberFormatter` de `@gnome-ui/react` para respetar `GnomeProvider` (`locale`, `numberFormat`) salvo que el componente exponga un `format` local explícito.
- Stories usan `layout: "fullscreen"` para mostrar el comportamiento en contexto real.
