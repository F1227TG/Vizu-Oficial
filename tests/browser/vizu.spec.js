const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');

async function openVizu(page, width) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width, height: 920 });
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname !== 'vizu.test' || route.request().method() !== 'GET') return route.abort();
    const target = path.resolve(root, `.${decodeURIComponent(url.pathname)}`);
    if (!target.startsWith(root + path.sep) || !fs.existsSync(target) || !fs.statSync(target).isFile()) return route.abort();
    return route.fulfill({ path: target });
  });
  await page.goto('http://vizu.test/index.html');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Tecnologia que aproxima.');
  await expect(page.locator('.vizu-platform')).toHaveCount(2);
  await expect(page.locator('#barber-hub .vizu-platform-link')).toHaveAttribute('href', 'https://www.barberhuboficial.com.br/');
  await expect(page.locator('#beauty-hub .vizu-platform-link')).toHaveAttribute('href', 'https://beautyhuboficial.vercel.app/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow, `No horizontal overflow at ${width}px`).toBeLessThanOrEqual(1);
  expect(errors, 'No uncaught page errors').toEqual([]);
}

for (const width of [320, 360, 390, 768, 1440]) {
  test(`Vizu page renders both platforms without overflow at ${width}px`, async ({ page }) => {
    await openVizu(page, width);
    const cards = await page.locator('.vizu-platform').evaluateAll(items => items.map(item => item.getBoundingClientRect().x));
    if (width <= 680) expect(cards[1]).toBeCloseTo(cards[0], 1);
    else expect(cards[1]).toBeGreaterThan(cards[0]);
  });
}

test('mobile navigation opens, follows anchors, and closes with Escape', async ({ page }) => {
  await openVizu(page, 360);
  const toggle = page.locator('.vizu-menu-toggle');
  const navigation = page.getByRole('navigation', { name: 'Navegação principal' });
  await expect(navigation).toBeHidden();
  await toggle.click();
  await expect(navigation).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(navigation).toBeHidden();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
  await toggle.click();
  await navigation.getByRole('link', { name: 'A experiência' }).click();
  await expect(navigation).toBeHidden();
  await expect(page).toHaveURL(/#jornada$/);
});

test('journeys switch by keyboard and keep the correct destination', async ({ page }) => {
  await openVizu(page, 390);
  const beauty = page.getByRole('button', { name: 'Beauty Hub', exact: true });
  await beauty.focus();
  await page.keyboard.press('Enter');
  await expect(beauty).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#journey-content')).toContainText('Descubra formas de se cuidar');
  await expect(page.locator('#journey-link')).toHaveAttribute('href', 'https://beautyhuboficial.vercel.app/');
  await page.getByRole('button', { name: 'Barber Hub', exact: true }).click();
  await expect(page.locator('#journey-content')).toContainText('Descubra seu estilo');
  await expect(page.locator('#journey-link')).toHaveAttribute('href', 'https://www.barberhuboficial.com.br/');
});

test('FAQ and motion controls work on mobile', async ({ page }) => {
  await openVizu(page, 360);
  await page.locator('summary').filter({ hasText: 'As plataformas usam a mesma conta?' }).click();
  await expect(page.getByText('São produtos independentes', { exact: false })).toBeVisible();
  const motion = page.getByRole('button', { name: 'Pausar animações' }).first();
  await motion.click();
  await expect(page.locator('html')).toHaveClass(/vizu-paused/);
  await expect(page.getByRole('button', { name: 'Ativar animações' }).first()).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Ativar animações' }).first().click();
  await expect(page.locator('html')).not.toHaveClass(/vizu-paused/);
});

test('content and navigation remain available without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await openVizu(page, 360);
  await expect(page.getByRole('navigation')).toBeVisible();
  await expect(page.locator('#barber-hub')).toBeVisible();
  await context.close();
});

test('motion starts on entry even with reduced device motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openVizu(page, 390);
  await expect(page.locator('.vizu-platform').first()).toBeVisible();
  await expect(page.locator('html')).toHaveClass(/vizu-motion-enabled/);
  await expect(page.locator('.vizu-orbit-one')).toHaveCSS('animation-name', 'vizu-orbit');
});

for (const width of [390, 1440]) {
  test(`motion can be paused and resumed with reduced device motion at ${width}px`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openVizu(page, width);
    const orbit = page.locator('.vizu-orbit-one');
    await expect(orbit).toHaveCSS('animation-name', 'vizu-orbit');
    const control = page.locator('.vizu-hero-motion');
    await expect(control).toBeEnabled();
    await control.click();
    await expect(orbit).toHaveCSS('animation-name', 'none');
    await control.focus();
    await page.keyboard.press('Enter');
    await expect(orbit).toHaveCSS('animation-name', 'vizu-orbit');
    const initial = await orbit.evaluate(el => getComputedStyle(el).rotate);
    await expect.poll(() => orbit.evaluate(el => getComputedStyle(el).rotate)).not.toBe(initial);
    await expect(page.locator('.vizu-motion-toggle').last()).toHaveText('Pausar animações');
    await control.click();
    await expect(orbit).toHaveCSS('animation-name', 'none');
    await expect(page.locator('.vizu-motion-toggle').last()).toHaveText('Ativar animações');
  });
}

test('a new visit restores the active default after a manual pause', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openVizu(page, 390);
  await expect(page.locator('.vizu-orbit-one')).toHaveCSS('animation-name', 'vizu-orbit');
  await page.locator('.vizu-hero-motion').click();
  await expect(page.locator('.vizu-orbit-one')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.vizu-platform').first()).toHaveCSS('opacity', '1');
  await page.reload();
  await expect(page.locator('.vizu-orbit-one')).toHaveCSS('animation-name', 'vizu-orbit');
});
