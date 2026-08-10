declare module '*.module.css' {
  const classes: Record<string, string>;

  export default classes;
}

// Plain (non-module) CSS side-effect import, e.g. the app's global reset.
declare module '*.css';
