// `@gnome-ui/layout` and `@gnome-ui/charts` expose a `./styles` subpath
// export (`dist/style.css`) without a matching `types` entry, so TypeScript
// can't resolve the side-effect import on its own — declare it here.
declare module '@gnome-ui/layout/styles';
declare module '@gnome-ui/charts/styles';
