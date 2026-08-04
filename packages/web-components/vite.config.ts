import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const packageRoot = fileURLToPath(new URL('.', import.meta.url));
const externalPackages = ['@gnome-ui/core', '@gnome-ui/icons'];

function isExternalDependency(id: string) {
  return externalPackages.some(
    (packageName) => id === packageName || id.startsWith(`${packageName}/`),
  );
}

export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      exclude: ['src/**/*.test.ts', 'src/**/*.stories.ts', 'src/test'],
      insertTypesEntry: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(packageRoot, 'src'),
    },
  },
  build: {
    lib: {
      entry: {
        index: resolve(packageRoot, 'src/index.ts'),
        'action-row': resolve(packageRoot, 'src/action-row.ts'),
        avatar: resolve(packageRoot, 'src/avatar.ts'),
        badge: resolve(packageRoot, 'src/badge.ts'),
        banner: resolve(packageRoot, 'src/banner.ts'),
        'boxed-list': resolve(packageRoot, 'src/boxed-list.ts'),
        button: resolve(packageRoot, 'src/button.ts'),
        callout: resolve(packageRoot, 'src/callout.ts'),
        card: resolve(packageRoot, 'src/card.ts'),
        checkbox: resolve(packageRoot, 'src/checkbox.ts'),
        'choice-card-group': resolve(packageRoot, 'src/choice-card-group.ts'),
        'combo-row': resolve(packageRoot, 'src/combo-row.ts'),
        'copy-button': resolve(packageRoot, 'src/copy-button.ts'),
        dialog: resolve(packageRoot, 'src/dialog.ts'),
        divider: resolve(packageRoot, 'src/divider.ts'),
        dropdown: resolve(packageRoot, 'src/dropdown.ts'),
        expander: resolve(packageRoot, 'src/expander.ts'),
        'expander-row': resolve(packageRoot, 'src/expander-row.ts'),
        'field-group': resolve(packageRoot, 'src/field-group.ts'),
        'file-type-icon': resolve(packageRoot, 'src/file-type-icon.ts'),
        'header-bar': resolve(packageRoot, 'src/header-bar.ts'),
        highlight: resolve(packageRoot, 'src/highlight.ts'),
        'icon-button': resolve(packageRoot, 'src/icon-button.ts'),
        kbd: resolve(packageRoot, 'src/kbd.ts'),
        'level-bar': resolve(packageRoot, 'src/level-bar.ts'),
        menu: resolve(packageRoot, 'src/menu.ts'),
        'otp-input': resolve(packageRoot, 'src/otp-input.ts'),
        popover: resolve(packageRoot, 'src/popover.ts'),
        'progress-bar': resolve(packageRoot, 'src/progress-bar.ts'),
        'radio-group': resolve(packageRoot, 'src/radio-group.ts'),
        separator: resolve(packageRoot, 'src/separator.ts'),
        skeleton: resolve(packageRoot, 'src/skeleton.ts'),
        slider: resolve(packageRoot, 'src/slider.ts'),
        'spin-button': resolve(packageRoot, 'src/spin-button.ts'),
        spinner: resolve(packageRoot, 'src/spinner.ts'),
        'step-indicator': resolve(packageRoot, 'src/step-indicator.ts'),
        switch: resolve(packageRoot, 'src/switch.ts'),
        'switch-row': resolve(packageRoot, 'src/switch-row.ts'),
        'tab-bar': resolve(packageRoot, 'src/tab-bar.ts'),
        'text-field': resolve(packageRoot, 'src/text-field.ts'),
        'text-truncate': resolve(packageRoot, 'src/text-truncate.ts'),
        toast: resolve(packageRoot, 'src/toast.ts'),
        tooltip: resolve(packageRoot, 'src/tooltip.ts'),
        'view-switcher': resolve(packageRoot, 'src/view-switcher.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => (format === 'cjs' ? `${entryName}.cjs` : `${entryName}.js`),
    },
    cssCodeSplit: false,
    sourcemap: true,
    rollupOptions: {
      external: isExternalDependency,
      output: {
        assetFileNames: 'style.css',
      },
    },
  },
});
