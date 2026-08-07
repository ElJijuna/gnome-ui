import { expect, test } from '@playwright/test';

// SidebarItem's `acceptTypes` check reads `e.dataTransfer.types` from a real
// native HTML5 drag gesture (`draggable` + real `dragstart`/`dragover`/
// `drop`). There's no SidebarItem-specific unit test for this at all — only
// the `Sidebar` story demonstrates it — so this is the first real coverage
// of the actual browser drag-and-drop path, using Playwright's native
// `dragTo()` rather than the `dataTransfer` object literals FileDropZone's
// tests use.

test('dragging the real pill onto an accepting row registers the drop', async ({ page }) => {
  await page.goto('/iframe.html?id=components-sidebar--drop-targets');

  const pill = page.getByText('Drag me onto a mailbox →');
  const sentRow = page.getByRole('button', { name: 'Sent' });

  await pill.dragTo(sentRow);

  await expect(page.getByText('Dropped into:')).toContainText('Sent');
});
