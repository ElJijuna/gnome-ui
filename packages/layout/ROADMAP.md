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

### `SidebarTrigger`

Botón de encabezado para controlar la sidebar con el mismo gesto en todos los
tamaños: abre/cierra overlay en pantallas estrechas y alterna el rail colapsado
en pantallas amplias.

### `StatusBar`

Barra inferior compacta basada en `Toolbar`, pensada para estado, contadores,
acciones secundarias o metadata de aplicación.

### `UserCard`

Panel de identidad de usuario para sidebars, popovers o páginas de perfil.

### `DashboardGrid`

Grid responsivo de 12 columnas con span por breakpoint, offset y gap
responsivo. Equivale a un sistema de grilla de nivel de página.

### `MasonryGrid`

Grid de altura variable que empaqueta items en la columna más corta (algoritmo
shortest-column-first). Apto para contenido heterogéneo como galerías o feeds.

### `AdaptiveLayout`

Shell adaptativo que cambia entre barra de navegación inferior (mobile) y
sidebar (desktop) según el breakpoint, siguiendo el patrón `AdwNavigationView`.

### `PanelCard`

Tarjeta de panel colapsable con encabezado, contenido scrollable y pie de
acciones. Útil para dashboards y vistas de detalle.

### `StatCard`

Tarjeta de métrica con valor numérico formateado, tendencia direccional
(up/down/neutral) y label. Respeta `GnomeProvider` para locale y formato.

### `CounterCard`

Tarjeta de métrica con contador animado (ease-out cúbico de 0 al valor destino).
Respeta `prefers-reduced-motion`.

### `EntityCard`

Tarjeta de entidad genérica con avatar, título, subtítulo, metadatos y acciones.
Sirve como base para listas de recursos (contactos, dispositivos, archivos).

### `ApplicationCard`

Tarjeta de aplicación con icono, nombre, descripción, stats y acción primaria.
Pensada para catálogos y dashboards de apps estilo GNOME Software.

### `IconBadge`

Contenedor de icono cuadrado redondeado con color de fondo a 15 % de opacidad.
Acepta los siete colores nombrados o cualquier valor hex.

### `StatusIndicator`

Indicador de estado circular (online/offline/warning/error/idle) con label
opcional. Sigue el uso de color semántico de las GNOME HIG.

### `QuickActions`

Cuadrícula de acciones de acceso rápido navegable con teclado (flechas). Las
acciones deshabilitadas son saltadas automáticamente.

### `EmptyState`

Pantalla de estado vacío con ilustración SVG/icono, título, descripción y CTA
principal/secundario. Versión opinionada de `StatusPage` para paneles de
contenido.

### `ErrorState`

Estado de error estructurado con tipo (404/500/network/permission), título,
descripción y acción de recuperación. Tipos predefinidos adaptan el mensaje
al contexto.

### `Toast`

Notificaciones transitorias en bottom-center con cola FIFO, auto-dismiss
configurable, acción opcional y animación de entrada/salida. Sigue las HIG
de GNOME: un toast a la vez, sin apilar.

### `Banner`

Franja persistente de estado en el top de la vista. No se auto-descarta.
Variantes semánticas (info/success/warning/error), acción opcional y botón de
cierre controlado por el padre. Para eventos puntuales usar `Toast`.

---

## Backlog

### `SplitLayout`

Shell de dos columnas: lista/maestro en la izquierda, detalle en la derecha.
Colapsa a una sola columna en mobile siguiendo el patrón
`AdwNavigationSplitView`.

```tsx
<SplitLayout
  list={<ContactList />}
  detail={<ContactDetail />}
  listWidth={320}
/>
```

### `ResizablePanel`

Dos o más paneles separados por un divisor arrastrable, basado en el patrón
`GtkPaned`. Fundamental para layouts maestro-detalle ajustables por el usuario
(editores de código, exploradores de archivos, tableros de análisis).

```tsx
<ResizablePanel direction="horizontal" defaultSizes={[30, 70]}>
  <FileTree />
  <Editor />
</ResizablePanel>
```

### `DrawerPanel`

Panel lateral que se desliza sobre el contenido desde cualquier lado.
Equivalente web de `AdwBottomSheet` (mobile) y `AdwOverlaySplitView` en modo
overlay (desktop). Ideal para filtros, configuración contextual y vistas de
detalle sin abandonar la página.

```tsx
<DrawerPanel open={open} onClose={close} placement="end" title="Filtros">
  <FilterForm />
</DrawerPanel>
```

### `SkeletonCard`

Placeholder de carga animado (shimmer) para tarjetas y listas. Siguiendo las
HIG de GNOME, se prefiere mostrar estructura percibida sobre un spinner vacío.
Soporte para variantes `card`, `list-item`, `text` y composición libre.

```tsx
<SkeletonCard lines={3} avatar />
```

### `CommandPalette`

Búsqueda global de acciones y navegación estilo Activities de GNOME Shell.
Activado por atajo de teclado (`Ctrl+K`). Keyboard-first: navegación con
flechas, activación con `Enter`, cierre con `Escape`. Soporta grupos de
resultados y preview.

```tsx
<CommandPalette
  open={open}
  onClose={close}
  actions={appActions}
  pages={navPages}
/>
```

### `DataTable`

Tabla de datos ordenable, con selección múltiple y scroll virtualizado,
siguiendo el patrón `GtkColumnView`. Columnas configurables, acciones por
fila, estado vacío integrado y soporte para datos asíncronos con skeleton.

```tsx
<DataTable
  columns={cols}
  rows={data}
  selectable
  onSort={handleSort}
  emptyState={<EmptyState />}
/>
```

### `DialogLayout`

Shell interno para `Dialog`s grandes (preferencias, wizards): sección de
navegación lateral + área de contenido scrollable + barra de acciones fija en
el pie. Basado en el patrón de `AdwPreferencesDialog`.

### `NotificationCenter`

Panel lateral deslizable (right drawer) que lista notificaciones agrupadas.
Usa `DrawerPanel` internamente una vez implementado.

---

## Demos de composición

Historias que ilustran cómo combinar primitivos del paquete para construir
interfaces GNOME completas. No generan componentes exportables.

- **FileManager** — Explorador de archivos estilo Nautilus con dual-headerbar y
  `AdwOverlaySplitView`.
- **Settings** — App de preferencias estilo GNOME Settings con
  `NavigationSplitView` y categorías laterales.

---

## Convenciones del paquete

- Cada componente de layout puede importar de `@gnome-ui/react` pero **nunca al revés**.
- Los estilos propios van en `ComponentName.module.css`; los tokens vienen de `@gnome-ui/core`.
- Cada componente exporta su tipo `Props` nombrado.
- Los valores numéricos deben usar `useNumberFormatter` de `@gnome-ui/react` para respetar `GnomeProvider` (`locale`, `numberFormat`) salvo que el componente exponga un `format` local explícito.
- Stories usan `layout: "fullscreen"` para mostrar el comportamiento en contexto real.
