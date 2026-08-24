import { expect, test } from '@playwright/test';

// GnomeProvider's whole job happens outside React: it stamps `data-theme` on
// `document.documentElement`, writes accent custom properties onto it, and
// subscribes to `matchMedia('(prefers-color-scheme: dark)')` so a live OS
// change re-resolves the accent shade. jsdom has no matchMedia change events
// and resolves no custom properties, so GnomeProvider.test.tsx can only check
// the context value. Every story is wrapped by the provider through the
// Storybook decorator, so the globals in the URL drive it directly.

const story = (globals: string) =>
  `/iframe.html?id=components-button--suggested&globals=${globals}`;

const themeAttribute = () => document.documentElement.getAttribute('data-theme');

test('forcing a colour scheme stamps data-theme and repaints the window', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });

  await page.goto(story('theme:light'));
  const button = page.getByRole('button', { name: 'Apply' });
  await expect(button).toBeVisible();
  await expect.poll(() => page.evaluate(themeAttribute)).toBe('light');
  const light = await page.evaluate(() =>
    getComputedStyle(document.body).getPropertyValue('--gnome-window-bg-color'),
  );

  await page.goto(story('theme:dark'));
  await expect(button).toBeVisible();
  await expect.poll(() => page.evaluate(themeAttribute)).toBe('dark');
  const dark = await page.evaluate(() =>
    getComputedStyle(document.body).getPropertyValue('--gnome-window-bg-color'),
  );

  expect(dark).not.toBe(light);
});

test('the system scheme follows the OS without stamping data-theme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(story('theme:'));

  await expect(page.getByRole('button', { name: 'Apply' })).toBeVisible();
  await expect.poll(() => page.evaluate(themeAttribute)).toBeNull();

  const [osDark, osLight] = await (async () => {
    const read = () =>
      page.evaluate(() =>
        getComputedStyle(document.body).getPropertyValue('--gnome-window-bg-color'),
      );

    const inDark = await read();
    await page.emulateMedia({ colorScheme: 'light' });
    return [inDark, await read()];
  })();

  expect(osDark).not.toBe(osLight);
});

test('a live OS scheme change re-resolves the named accent shade', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto(story('theme:;accentColor:green'));

  const accent = () =>
    page.evaluate(() => document.documentElement.style.getPropertyValue('--gnome-accent-color'));

  await expect.poll(accent).toBe('var(--gnome-green-3)');

  // No reload: the provider only learns about this through its matchMedia
  // "change" listener, which is the thing jsdom cannot deliver.
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect.poll(accent).toBe('var(--gnome-green-2)');

  await page.emulateMedia({ colorScheme: 'light' });
  await expect.poll(accent).toBe('var(--gnome-green-3)');
});

test('a named accent actually tints accent-driven components', async ({ page }) => {
  await page.goto(story('theme:light;accentColor:green'));

  const button = page.getByRole('button', { name: 'Apply' });
  await expect(button).toBeVisible();

  // The accent tokens are authored in oklch, so the computed string says
  // nothing about what lands on screen — rasterise it to sRGB instead.
  const [r, g, b] = await button.evaluate((el) => {
    const context = document.createElement('canvas').getContext('2d')!;

    context.fillStyle = getComputedStyle(el).backgroundColor;
    context.fillRect(0, 0, 1, 1);

    return Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3);
  });

  expect(g).toBeGreaterThan(r);
  expect(g).toBeGreaterThan(b);
});

test('the default accent leaves the document custom properties untouched', async ({ page }) => {
  await page.goto(story('theme:light;accentColor:blue'));
  await expect(page.getByRole('button', { name: 'Apply' })).toBeVisible();

  const overrides = await page.evaluate(() => ({
    accent: document.documentElement.style.getPropertyValue('--gnome-accent-color'),
    accentBg: document.documentElement.style.getPropertyValue('--gnome-accent-bg-color'),
  }));

  expect(overrides).toEqual({ accent: '', accentBg: '' });
});
