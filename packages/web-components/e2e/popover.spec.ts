import { expect, test } from '@playwright/test';

test('popover follows resized content and restores trigger focus', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-popover--interactive');

  const trigger = page.getByRole('button', { name: 'Project options' });
  const content = page.locator('[data-slot="popover-content"]');
  await trigger.click();

  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('button', { name: 'Rename' })).toBeFocused();
  const initialLeft = await content.evaluate((element) => element.style.left);

  await content.evaluate((element) => {
    element.style.width = '320px';
  });

  await expect.poll(() => content.evaluate((element) => element.style.left)).not.toBe(initialLeft);

  await page.keyboard.press('Escape');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toBeFocused();
});

test('popover rewires ARIA after an htmx-style trigger swap', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-popover--interactive');

  await page.getByRole('button', { name: 'Project options' }).click();
  const content = page.locator('[data-slot="popover-content"]');

  await page.evaluate(() => {
    const original = document.querySelector<HTMLElement>('[data-slot="popover-trigger"]');
    const replacement = document.createElement('button');
    replacement.type = 'button';
    replacement.dataset.slot = 'popover-trigger';
    replacement.textContent = 'Updated options';
    original?.replaceWith(replacement);
  });

  const replacement = page.getByRole('button', { name: 'Updated options' });
  const contentId = await content.getAttribute('id');
  const replacementId = await replacement.getAttribute('id');

  if (!contentId || !replacementId) {
    throw new Error('Popover relationships require generated part IDs.');
  }

  await expect(replacement).toHaveAttribute('aria-expanded', 'true');
  await expect(replacement).toHaveAttribute('aria-controls', contentId);
  await expect(content).toHaveAttribute('aria-labelledby', replacementId);

  await content.evaluate((element) => {
    element.setAttribute('aria-label', 'Explicit actions');
  });

  await expect(content).not.toHaveAttribute('aria-labelledby');
});
