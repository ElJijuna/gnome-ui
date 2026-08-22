import { expect, test } from '@playwright/test';

// Switch is an <input type="checkbox" role="switch"> with `appearance: none`;
// the track and the sliding knob are drawn entirely by the `:checked` rule and
// a `::before` pseudo element. jsdom renders no CSS and has no pseudo
// elements, so Switch.test.tsx can assert `.checked` but never that the knob
// actually moved — and it cannot activate the control with the Space key.

test('the knob really moves when the switch is toggled', async ({ page }) => {
  await page.goto('/iframe.html?id=components-switch--with-label');

  const wifi = page.getByRole('switch').first();
  await expect(wifi).toBeChecked();

  // The knob slides with `transform: translateX(28px)` under `:checked` and
  // the track recolours — both pure CSS, both invisible to jsdom.
  const knob = (el: HTMLElement) => ({
    transform: getComputedStyle(el, '::before').transform,
    track: getComputedStyle(el).backgroundColor,
  });

  const on = await wifi.evaluate(knob);
  expect(on.transform).not.toBe('none');

  await wifi.uncheck();
  await expect.poll(async () => (await wifi.evaluate(knob)).transform).toBe('none');

  const off = await wifi.evaluate(knob);
  expect(off.track).not.toBe(on.track);
});

test('the Space key flips the switch that has focus', async ({ page }) => {
  await page.goto('/iframe.html?id=components-switch--with-label');

  const bluetooth = page.getByRole('switch').nth(1);
  await expect(bluetooth).not.toBeChecked();

  await bluetooth.focus();
  await page.keyboard.press(' ');

  await expect(bluetooth).toBeChecked();
  await expect(page.getByRole('switch').nth(2)).not.toBeChecked();
});

test('clicking the row label toggles the switch the browser associates with it', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-switch--with-label');

  const airplane = page.getByRole('switch').nth(2);
  await expect(airplane).not.toBeChecked();

  // The label wraps both the text and the input, and the text sits at the far
  // side of a space-between row — only the browser ties them together.
  await page.getByText('Airplane Mode').click();

  await expect(airplane).toBeChecked();
});
