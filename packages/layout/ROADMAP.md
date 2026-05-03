# @gnome-ui/layout — Roadmap

Componentes de layout de nivel de aplicación que componen primitivos de `@gnome-ui/react`
siguiendo las GNOME Human Interface Guidelines y el patrón Adwaita.

---

## En desarrollo

### `UserCard`

Panel de identidad de usuario para sidebars, popovers o páginas de perfil.

```tsx
<UserCard
  name="Ada Lovelace"
  email="ada@gnome.org"
  avatarSrc="/avatar.jpg"
  actions={[
    { label: "View Profile",     onClick: () => {} },
    { label: "Account Settings", onClick: () => {} },
    { label: "Sign Out",         onClick: () => {}, variant: "destructive" },
  ]}
/>
```

**Composición interna:** `Avatar` + `Text` + lista de `Button` planos.  
**Referencia Adwaita:** patrón de usuario en `AdwPreferencesGroup`.

---

## Backlog

### `AppHeader`

Barra superior lista para usar: logo, título de app, `SearchBar`, acciones y un `UserCard` en popover.
Envuelve `HeaderBar` + `Toolbar` en una sola pieza de layout.

**Por qué en layout:** combina primitivos de `@gnome-ui/react` con lógica de disposición (responsive collapse, avatar popover).

---

### `PageContent`

Contenedor de página con max-width centrado, padding horizontal responsivo y título opcional de sección.

```tsx
<PageContent title="Settings" maxWidth="md">
  …
</PageContent>
```

**Por qué en layout:** codifica las reglas de márgenes y anchos de la HIG en un solo componente.

---

### `SidebarShell`

Sidebar vertical lista para usar: encabezado con logo/título, área de navegación con scroll, pie de página fijo con `UserCard` y sección de acción.

**Por qué en layout:** es un patrón de composición recurrente que va más allá de un componente primitivo.

---

### `EmptyState`

Pantalla de estado vacío con ilustración SVG, título, descripción y CTA principal/secundario.  
Versión más opinionada de `StatusPage` adaptada para paneles de contenido.

**Por qué en layout:** ocupa el espacio de contenido (`children` de `Layout`) y su tamaño/centrado depende del contexto de layout.

---

### `SplitLayout`

Shell de dos columnas: lista/maestro en la izquierda, detalle en la derecha.  
Colapsa a una sola columna en mobile (patrón `NavigationSplitView` pero al nivel de página).

```tsx
<SplitLayout
  list={<ContactList />}
  detail={<ContactDetail />}
  listWidth={320}
/>
```

**Por qué en layout:** combina `NavigationSplitView` con lógica de breakpoint y transiciones.

---

### ~~`DashboardGrid`~~ ✅ Implementado — issue [#82](https://github.com/ElJijuna/gnome-ui/issues/82)

Grid responsivo de tarjetas con columnas fluidas, gap consistente y soporte para celdas de distintos tamaños (`span`).

---

### `DialogLayout`

Shell interno para `Dialog`s grandes (preferencias, wizards): sección de navegación lateral + área de contenido scrollable + barra de acciones fija en el pie.

**Por qué en layout:** es el mismo patrón que `Layout` pero scoped dentro de un modal; reutiliza las mismas zonas (`sidebar`, `content`, `bottomBar`).

---

### `NotificationCenter`

Panel lateral deslizable (right drawer) que lista notificaciones agrupadas por app.  
Usa `OverlaySplitView` internamente.

**Por qué en layout:** es un patrón de overlay de nivel de app, no un widget atómico.

---

## Convenciones del paquete

- Cada componente de layout puede importar de `@gnome-ui/react` pero **nunca al revés**.
- Los estilos propios van en `ComponentName.module.css`; los tokens vienen de `@gnome-ui/core`.
- Cada componente exporta su tipo `Props` nombrado.
- Stories usan `layout: "fullscreen"` para mostrar el comportamiento en contexto real.
