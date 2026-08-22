import { expect, test } from '@playwright/test';

// WidgetManager stages picker choices and only commits them on Accept, with
// the picker itself living in a Modal. The staging round-trip crosses a real
// overlay: the Add buttons sit inside rows whose own click has to be stopped,
// Cancel has to discard staged state, and the modal has to close and hand
// focus back. WidgetManager.test.tsx runs in jsdom, where the modal is not a
// real overlay and clicks never actually propagate through one.

test('the full add flow stages in the picker and commits on Accept', async ({ page }) => {
  await page.goto('/iframe.html?id=components-widgetmanager--full-flow');

  await expect(page.getByText('No widgets added')).toBeVisible();

  await page.getByRole('button', { name: 'Edit widgets' }).click();
  await page.getByRole('button', { name: 'Add Widget' }).click();

  const picker = page.getByRole('dialog');
  await expect(picker).toBeVisible();

  // The Add button lives in the trailing slot of an ActionRow and stops
  // propagation — a real click has to reach it and go no further.
  const clockRow = picker.getByRole('listitem').filter({ hasText: 'Clock' });
  await clockRow.getByRole('button', { name: 'Add' }).click();
  await expect(clockRow.getByRole('button', { name: 'Remove' })).toBeVisible();

  await picker.getByRole('button', { name: 'Accept' }).click();

  await expect(picker).toBeHidden();
  await expect(page.getByText('No widgets added')).toHaveCount(0);
  await expect(page.getByText('Clock')).toBeVisible();
});

test('Cancel discards everything staged in the picker', async ({ page }) => {
  await page.goto('/iframe.html?id=components-widgetmanager--full-flow');

  await page.getByRole('button', { name: 'Edit widgets' }).click();
  await page.getByRole('button', { name: 'Add Widget' }).click();

  const picker = page.getByRole('dialog');
  await picker.getByRole('listitem').filter({ hasText: 'Clock' }).getByRole('button').click();

  await picker.getByRole('button', { name: 'Cancel' }).click();

  await expect(picker).toBeHidden();
  await expect(page.getByRole('button', { name: 'Add Widget' })).toBeVisible();
  // Nothing was committed, so the manager still has no widgets of its own.
  await expect(page.getByText('Clock')).toHaveCount(0);
});

test('the edit toggle reports its pressed state and reveals the add trigger', async ({ page }) => {
  await page.goto('/iframe.html?id=components-widgetmanager--full-flow');

  const edit = page.getByRole('button', { name: 'Edit widgets' });
  await expect(edit).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('button', { name: 'Add Widget' })).toHaveCount(0);

  await edit.click();

  await expect(edit).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Add Widget' })).toBeVisible();

  await edit.click();
  await expect(edit).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('button', { name: 'Add Widget' })).toHaveCount(0);
});

test('an added widget can be staged off again and removed on Accept', async ({ page }) => {
  await page.goto('/iframe.html?id=components-widgetmanager--full-flow');

  await page.getByRole('button', { name: 'Edit widgets' }).click();
  await page.getByRole('button', { name: 'Add Widget' }).click();

  const picker = page.getByRole('dialog');
  const clockRow = picker.getByRole('listitem').filter({ hasText: 'Clock' });
  await clockRow.getByRole('button', { name: 'Add' }).click();
  await picker.getByRole('button', { name: 'Accept' }).click();
  await expect(picker).toBeHidden();
  await expect(page.getByText('Clock')).toBeVisible();

  await page.getByRole('button', { name: 'Add Widget' }).click();
  const reopened = page.getByRole('dialog');
  await reopened
    .getByRole('listitem')
    .filter({ hasText: 'Clock' })
    .getByRole('button', { name: 'Remove' })
    .click();
  await reopened.getByRole('button', { name: 'Accept' }).click();

  await expect(reopened).toBeHidden();
  await expect(page.getByText('Clock')).toHaveCount(0);
});
