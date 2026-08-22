import { expect, test } from '@playwright/test';

// ChoiceCardGroup is a roving-tabindex radiogroup built from <button
// role="radio"> cards, and its arrow handler walks a precomputed list of
// *enabled* indexes. ChoiceCardGroup.test.tsx focuses a card by hand and fires
// `keyDown` at it, so the two browser-owned halves — which card the Tab key
// actually reaches, and whether the handler's `.focus()` lands where it says —
// are never checked end to end.

test('the group is one tab stop and it sits on the selected card', async ({ page }) => {
  await page.goto('/iframe.html?id=components-choicecardgroup--default');

  const personal = page.getByRole('radio', { name: /Personal/ });
  const team = page.getByRole('radio', { name: /Team/ });
  await expect(personal).toHaveAttribute('aria-checked', 'true');

  await page.keyboard.press('Tab');
  await expect(personal).toBeFocused();

  // The other cards are tabIndex=-1, so Tab must leave the group.
  await page.keyboard.press('Tab');
  await expect(team).not.toBeFocused();
});

test('arrow keys move focus across the cards and wrap around', async ({ page }) => {
  await page.goto('/iframe.html?id=components-choicecardgroup--default');

  const personal = page.getByRole('radio', { name: /Personal/ });
  const team = page.getByRole('radio', { name: /Team/ });
  const enterprise = page.getByRole('radio', { name: /Enterprise/ });

  await personal.focus();
  await page.keyboard.press('ArrowRight');
  await expect(team).toBeFocused();

  await page.keyboard.press('ArrowRight');
  await expect(enterprise).toBeFocused();

  await page.keyboard.press('ArrowRight');
  await expect(personal).toBeFocused();

  await page.keyboard.press('ArrowUp');
  await expect(enterprise).toBeFocused();
});

test('a disabled card is skipped by the arrow keys and cannot be focused', async ({ page }) => {
  await page.goto('/iframe.html?id=components-choicecardgroup--with-disabled-option');

  const personal = page.getByRole('radio', { name: /Personal/ });
  const team = page.getByRole('radio', { name: /Team/ });
  const enterprise = page.getByRole('radio', { name: /Enterprise/ });

  await expect(enterprise).toBeDisabled();

  await personal.focus();
  await page.keyboard.press('ArrowRight');
  await expect(team).toBeFocused();

  // Enterprise is disabled, so the next step has to wrap back to Personal.
  await page.keyboard.press('ArrowRight');
  await expect(personal).toBeFocused();
  await expect(enterprise).not.toBeFocused();
});
