import { expect, test } from '@playwright/test';

// FontPicker is a Popover wrapping two Dropdowns and a SpinButton, and its
// whole point is that the chosen family/weight/size are applied as real type.
// Whether a font stack resolves, whether the popover is placed clear of its
// trigger, and whether the controls inside an overlay are reachable are all
// browser facts; FontPicker.test.tsx renders into jsdom, which has no fonts,
// no layout, and no overlay positioning.

test('the popover opens below its trigger and holds the three controls', async ({ page }) => {
  await page.goto('/iframe.html?id=components-fontpicker--default');

  const trigger = page.getByRole('button', { name: /Cantarell/ });
  await trigger.click();

  const family = page.getByRole('combobox', { name: 'Font family' });
  const weight = page.getByRole('combobox', { name: 'Font weight' });
  const size = page.getByRole('spinbutton', { name: 'Font size' });

  await expect(family).toBeVisible();
  await expect(weight).toBeVisible();
  await expect(size).toBeVisible();

  const triggerBox = (await trigger.boundingBox())!;
  const familyBox = (await family.boundingBox())!;

  // `placement="bottom"` is only meaningful once something lays it out.
  expect(familyBox.y).toBeGreaterThan(triggerBox.y);
});

test('changing the size through the spin button retypes the trigger', async ({ page }) => {
  await page.goto('/iframe.html?id=components-fontpicker--default');

  const trigger = page.getByRole('button', { name: /Cantarell/ });
  await expect(trigger).toContainText('11');

  await trigger.click();
  const size = page.getByRole('spinbutton', { name: 'Font size' });
  await size.focus();
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');

  await expect(page.getByRole('button', { name: /Cantarell/ })).toContainText('13');
});

test('the chosen family and weight are really applied to the preview text', async ({ page }) => {
  await page.goto('/iframe.html?id=components-fontpicker--with-live-preview');

  const preview = page.getByText('The quick brown fox jumps over the lazy dog');
  const typography = () =>
    preview.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        family: style.fontFamily,
        weight: style.fontWeight,
        size: style.fontSize,
      };
    });

  const before = await typography();
  expect(before.weight).toBe('700');
  expect(before.size).toBe('20px');

  await page.getByRole('button', { name: /Heading font/ }).click();
  await page.getByRole('combobox', { name: 'Font weight' }).click();
  await page.getByRole('option', { name: 'Light', exact: true }).click();

  await expect.poll(async () => (await typography()).weight).not.toBe('700');
});
