import { expect, type Page, test } from '@playwright/test';

declare global {
  interface Window {
    __samples?: number[];
    __raf?: number;
  }
}

// Carousel drives navigation through a real `el.scrollTo()` on its track and
// reads the page back from real `el.scrollLeft` on scroll. Carousel.test.tsx
// stubs `Element.prototype.scrollTo = vi.fn()` entirely — its own comment
// notes "scrollLeft is still 0 in jsdom" — so the actual scroll round-trip
// (click → real scroll → real scroll event → page state syncs back) has
// never run.

/** The page picker's buttons — scoped, since arrows and pause are buttons too. */
const pageButtons = (page: Page) =>
  page.getByRole('group', { name: 'Carousel pages' }).getByRole('button');

test('clicking a page tab really scrolls the track and updates the selected tab', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-carousel--with-dots');

  const track = page.getByRole('region');
  const page1Dot = page.getByRole('button', { name: 'Page 1' });
  const page2Dot = page.getByRole('button', { name: 'Page 2' });

  await expect(page1Dot).toHaveAttribute('aria-current', 'true');

  await page2Dot.click();

  await expect(page2Dot).toHaveAttribute('aria-current', 'true');
  await expect(page1Dot).not.toHaveAttribute('aria-current');

  await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
});

test('dragging the track with the pointer changes the page', async ({ page }) => {
  await page.goto('/iframe.html?id=components-carousel--with-dots');

  const track = page.getByRole('region');
  const box = await track.boundingBox();
  expect(box).not.toBeNull();

  const y = box!.y + box!.height / 2;

  await page.mouse.move(box!.x + box!.width - 20, y);
  await page.mouse.down();
  await page.mouse.move(box!.x + 20, y, { steps: 10 });
  await page.mouse.up();

  await expect(page.getByRole('button', { name: 'Page 2' })).toHaveAttribute(
    'aria-current',
    'true',
  );
});

test('arrow buttons page the track and disable at the ends', async ({ page }) => {
  await page.goto('/iframe.html?id=components-carousel--with-arrows');

  const track = page.getByRole('region');
  const prev = page.getByRole('button', { name: 'Previous slide' });
  const next = page.getByRole('button', { name: 'Next slide' });

  await expect(prev).toBeDisabled();
  await expect(next).toBeEnabled();

  await next.click();

  await expect(page.getByRole('button', { name: 'Page 2' })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  await expect(prev).toBeEnabled();

  await prev.click();

  await expect(page.getByRole('button', { name: 'Page 1' })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBe(0);
  await expect(prev).toBeDisabled();
});

test('arrows advance a whole group when several slides are visible', async ({ page }) => {
  await page.goto('/iframe.html?id=components-carousel--multiple-visible-slides');

  // 5 slides in groups of 2 → 3 pages.
  await expect(pageButtons(page)).toHaveCount(3);

  await page.getByRole('button', { name: 'Next slide' }).click();

  await expect(page.getByRole('button', { name: 'Page 2' })).toHaveAttribute(
    'aria-current',
    'true',
  );
  // Third slide is now the leading one in the viewport.
  await expect(page.getByRole('group', { name: '3 of 5' })).toBeInViewport();
});

test('infinite wraps forward without rewinding across the deck', async ({ page }) => {
  await page.goto('/iframe.html?id=components-carousel--infinite');

  const track = page.getByRole('region');
  const next = page.getByRole('button', { name: 'Next slide' });
  const scroll = () => track.evaluate((el) => el.scrollLeft);

  // Clones stay out of the a11y tree: five real slides, five dots.
  // Scoped to the track — the page indicator is a group of its own.
  await expect(page.getByRole('region').getByRole('group')).toHaveCount(5);
  await expect(pageButtons(page)).toHaveCount(5);

  // Page 1 sits one page in, behind it the cloned last page.
  const firstOffset = await scroll();
  expect(firstOffset).toBeGreaterThan(0);

  for (let i = 0; i < 4; i++) {
    await next.click();
    await page.waitForTimeout(500);
  }
  const lastOffset = await scroll();
  expect(lastOffset).toBeGreaterThan(firstOffset);
  await expect(page.getByRole('button', { name: 'Page 5' })).toHaveAttribute(
    'aria-current',
    'true',
  );

  await next.click();
  // Mid-flight it is still travelling forward, onto the cloned first page…
  await page.waitForTimeout(120);
  expect(await scroll()).toBeGreaterThan(lastOffset);

  // …and once settled it has silently rewound onto the real first page.
  await expect(page.getByRole('button', { name: 'Page 1' })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await expect.poll(async () => Math.abs((await scroll()) - firstOffset) <= 1).toBe(true);
});

test('infinite wraps backward from the first page', async ({ page }) => {
  await page.goto('/iframe.html?id=components-carousel--infinite');

  const track = page.getByRole('region');
  const scroll = () => track.evaluate((el) => el.scrollLeft);
  const firstOffset = await scroll();

  await page.getByRole('button', { name: 'Previous slide' }).click();
  await page.waitForTimeout(120);
  expect(await scroll()).toBeLessThan(firstOffset);

  await expect(page.getByRole('button', { name: 'Page 5' })).toHaveAttribute(
    'aria-current',
    'true',
  );
  // The silent rewind lands on the last real page, within a pixel of its snap point.
  await expect.poll(async () => Math.abs((await scroll()) - firstOffset * 5) <= 1).toBe(true);
});

test('peek reveals the neighbouring slides at both edges', async ({ page }) => {
  await page.goto('/iframe.html?id=components-carousel--peek-with-multiple-slides');

  const edges = await page.getByRole('region').evaluate((el) => {
    const box = el.getBoundingClientRect();
    const onScreen = [...el.children]
      .map((slide) => {
        const rect = slide.getBoundingClientRect();
        return { left: rect.left - box.left, right: rect.right - box.left };
      })
      .filter((slide) => slide.right > 0.5 && slide.left < box.width - 0.5);
    return {
      leadVisible: Math.round(onScreen[0].right),
      trailVisible: Math.round(box.width - onScreen[onScreen.length - 1].left),
      onScreenCount: onScreen.length,
    };
  });

  // The story asks for peek={40} with two slides visible: a sliver of the
  // previous and of the next slide, symmetric, on top of the 12px spacing.
  expect(edges.leadVisible).toBe(40);
  expect(edges.trailVisible).toBe(40);
  expect(edges.onScreenCount).toBe(4); // peek + 2 full slides + peek
});

test('dragging backward off the first page lands on the last one in infinite mode', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-carousel--infinite');

  const track = page.getByRole('region');
  const scroll = () => track.evaluate((el) => el.scrollLeft);
  const firstOffset = await scroll();

  const box = await track.boundingBox();
  expect(box).not.toBeNull();
  const y = box!.y + box!.height / 2;

  // Drag the content to the right — i.e. reach for the previous slide. Start
  // clear of the overlaid prev arrow, which would swallow the pointerdown.
  await page.mouse.move(box!.x + 80, y);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width - 10, y, { steps: 10 });
  await page.mouse.up();

  await expect(page.getByRole('button', { name: 'Page 5' })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await expect.poll(async () => Math.abs((await scroll()) - firstOffset * 5) <= 1).toBe(true);
});

test('rapid arrow clicks across the wrap never rewind the carousel', async ({ page }) => {
  await page.goto('/iframe.html?id=components-carousel--infinite');

  const track = page.getByRole('region');
  const next = page.getByRole('button', { name: 'Next slide' });

  // Page 1 sits exactly one page in, so its offset is the page size.
  const pageSize = await track.evaluate((el) => el.scrollLeft);
  const cycle = pageSize * 5; // five pages in this story

  for (let i = 0; i < 4; i++) {
    await next.click();
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(400);

  // Sample the real scroll position on every animation frame.
  await track.evaluate((el) => {
    window.__samples = [];
    const tick = () => {
      window.__samples?.push(el.scrollLeft);
      window.__raf = requestAnimationFrame(tick);
    };
    tick();
  });

  // Wrap past the last page, then interrupt the animation with another click —
  // the case that used to smooth-scroll all the way back across the deck.
  await next.click();
  await page.waitForTimeout(150);
  await next.click();
  await page.waitForTimeout(1200);

  const samples = await page.evaluate(() => {
    if (window.__raf) {
      cancelAnimationFrame(window.__raf);
    }
    return window.__samples ?? [];
  });
  expect(samples.length).toBeGreaterThan(20);

  // Repositioning onto a clone shifts the offset by a whole cycle and is
  // pixel-identical, so undo those shifts before judging the motion.
  let shift = 0;
  const travelled = samples.map((value, i) => {
    if (i > 0 && value - samples[i - 1] < -cycle / 2) {
      shift += cycle;
    }
    return value + shift;
  });

  const worstBackwardStep = Math.min(...travelled.slice(1).map((value, i) => value - travelled[i]));
  expect(worstBackwardStep).toBeGreaterThanOrEqual(-1);

  // Two clicks forward means exactly two pages of travel, never a rewind.
  const total = travelled[travelled.length - 1] - travelled[0];
  expect(Math.abs(total - pageSize * 2)).toBeLessThanOrEqual(2);
  await expect(page.getByRole('button', { name: 'Page 2' })).toHaveAttribute(
    'aria-current',
    'true',
  );
});

test('focusActiveSlides shrinks the neighbours without shifting the snap points', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-carousel--focus-active-slides');

  const track = page.getByRole('region');
  const next = page.getByRole('button', { name: 'Next slide' });
  const pageSize = await track.evaluate((el) => el.scrollLeft);

  const measure = () =>
    track.evaluate((el) => {
      const box = el.getBoundingClientRect();
      const onScreen = [...el.children]
        .map((slide) => {
          const rect = (slide.firstElementChild as HTMLElement).getBoundingClientRect();
          return { left: rect.left - box.left, width: rect.width };
        })
        .filter((slide) => slide.left + slide.width > 0.5 && slide.left < box.width - 0.5);
      return { scroll: el.scrollLeft, onScreen };
    });

  const first = await measure();
  // Previous, active, next — the active one at full size, both neighbours at 80%.
  expect(first.onScreen).toHaveLength(3);
  const [previous, active, upcoming] = first.onScreen;
  expect(previous.width / active.width).toBeCloseTo(0.8, 2);
  expect(upcoming.width / active.width).toBeCloseTo(0.8, 2);

  // A scroll snap area is the *transformed* border box, so scaling the slide
  // itself would leave every page resting half its lost width off target.
  for (let i = 1; i <= 3; i++) {
    await next.click();
    await page.waitForTimeout(600);
    const step = await measure();
    expect(Math.abs(step.scroll - pageSize * (i + 1))).toBeLessThanOrEqual(1);
    expect(Math.abs(step.onScreen[1].left - first.onScreen[1].left)).toBeLessThanOrEqual(1);
    expect(step.onScreen[1].width).toBeCloseTo(active.width, 1);
  }
});

// `behavior: 'smooth'` passed to scrollTo beats the stylesheet's
// `scroll-behavior: auto`, so the reduced-motion media query alone never
// stopped the animation — only the component dropping the option does.
test('arrow navigation jumps straight to the page under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/iframe.html?id=components-carousel--with-arrows');

  const track = page.getByRole('region');
  const width = await track.evaluate((el) => el.clientWidth);

  await page.getByRole('button', { name: 'Next slide' }).click();

  // Read straight after the click, with no polling: an animated scroll would
  // still be near the start here.
  expect(await track.evaluate((el) => el.scrollLeft)).toBeCloseTo(width, -1);
});

test('arrow navigation animates when reduced motion is not requested', async ({ page }) => {
  await page.goto('/iframe.html?id=components-carousel--with-arrows');

  const track = page.getByRole('region');
  const width = await track.evaluate((el) => el.clientWidth);

  await page.getByRole('button', { name: 'Next slide' }).click();

  // Still under way, so nowhere near the destination yet...
  expect(await track.evaluate((el) => el.scrollLeft)).toBeLessThan(width / 2);
  // ...and it gets there once the animation finishes.
  await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeCloseTo(width, -1);
});

// WCAG 2.2.2: the rotation has to be stoppable, and stay stopped.
test('the auto-play control pauses and resumes the rotation', async ({ page }) => {
  await page.goto('/iframe.html?id=components-carousel--auto-play');

  const pause = page.getByRole('button', { name: 'Pause automatic slide rotation' });
  await expect(page.getByRole('button', { name: 'Page 1' })).toHaveAttribute(
    'aria-current',
    'true',
  );

  await pause.click();
  const resume = page.getByRole('button', { name: 'Resume automatic slide rotation' });
  await expect(resume).toBeVisible();

  // Two full intervals with no movement.
  await page.waitForTimeout(4500);
  await expect(page.getByRole('button', { name: 'Page 1' })).toHaveAttribute(
    'aria-current',
    'true',
  );

  await resume.click();
  await expect(page.getByRole('button', { name: 'Page 2' })).toHaveAttribute(
    'aria-current',
    'true',
  );
});

// Keyboard users get no hover pause, so focus has to do the same job.
test('auto-play pauses while the keyboard is inside the carousel', async ({ page }) => {
  await page.goto('/iframe.html?id=components-carousel--auto-play');

  await page.getByRole('region').focus();
  await page.waitForTimeout(4500);

  await expect(page.getByRole('button', { name: 'Page 1' })).toHaveAttribute(
    'aria-current',
    'true',
  );
});
