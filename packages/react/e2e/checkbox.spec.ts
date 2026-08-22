import { expect, test } from '@playwright/test';

// Checkbox is a native <input type="checkbox"> with `appearance: none`; every
// visual state it has comes from the `:checked` / `:indeterminate` pseudo
// classes and a `::before` pseudo element. jsdom evaluates no CSS and has no
// pseudo elements, so Checkbox.test.tsx asserting `.checked` or
// `.indeterminate` says nothing about what the user actually sees, and the
// native label-activation and indeterminate-resolution rules are unexercised.

test('the checked state is actually painted, not just set on the DOM node', async ({ page }) => {
  await page.goto('/iframe.html?id=components-checkbox--with-labels');

  const music = page.getByRole('checkbox', { name: 'Music' });
  const videos = page.getByRole('checkbox', { name: 'Videos' });

  await expect(music).toBeChecked();
  await expect(videos).not.toBeChecked();

  const paint = (el: HTMLElement) => ({
    box: getComputedStyle(el).backgroundColor,
    mark: getComputedStyle(el, '::before').opacity,
  });

  const checked = await music.evaluate(paint);
  const unchecked = await videos.evaluate(paint);

  // The `:checked` rule has to produce a visibly different control.
  expect(checked.box).not.toBe(unchecked.box);
  expect(checked).not.toEqual(unchecked);
});

test('clicking the label text toggles the box the browser has associated with it', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-checkbox--with-labels');

  const videos = page.getByRole('checkbox', { name: 'Videos' });
  const documents = page.getByRole('checkbox', { name: 'Documents' });
  await expect(videos).not.toBeChecked();

  // The <label> wraps the input implicitly — only the browser resolves that
  // into an activation of the right control.
  await page.getByText('Videos', { exact: true }).click();

  await expect(videos).toBeChecked();
  await expect(documents).not.toBeChecked();
});

test('an indeterminate box paints its third state and a real click resolves it', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-checkbox--select-all');

  const selectAll = page.getByRole('checkbox', { name: 'Select all' });
  const videos = page.getByRole('checkbox', { name: 'Videos' });

  // Two of four are checked, so the parent starts in the mixed state. That
  // state exists only as a DOM property — never an attribute — and is styled
  // through `:indeterminate`.
  expect(await selectAll.evaluate((el: HTMLInputElement) => el.indeterminate)).toBe(true);
  const glyph = (el: HTMLElement) => {
    const before = getComputedStyle(el, '::before');
    return { height: before.height, clipPath: before.clipPath };
  };
  // The mixed state paints a 2px dash; the checked state paints a clip-path
  // tick. Both live entirely in CSS.
  const mixed = await selectAll.evaluate(glyph);
  expect(mixed.clipPath).toBe('none');

  await videos.check();
  await page.getByRole('checkbox', { name: 'Documents' }).check();

  // All four checked — the parent must leave the mixed state for a real tick.
  expect(await selectAll.evaluate((el: HTMLInputElement) => el.indeterminate)).toBe(false);
  await expect(selectAll).toBeChecked();
  const ticked = await selectAll.evaluate(glyph);
  expect(ticked.clipPath).not.toBe('none');
  expect(ticked.height).not.toBe(mixed.height);
});
