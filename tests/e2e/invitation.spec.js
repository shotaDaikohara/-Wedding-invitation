// @ts-check
import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const indexPath = 'file://' + join(__dirname, '../../index.html');

test('封筒クリックで手紙が表示される', async ({ page }) => {
  await page.goto(indexPath);

  // Phase 1: 封筒が表示されている
  await expect(page.locator('#phase-envelope')).toBeVisible();
  await expect(page.locator('#phase-letter')).toBeHidden();

  // シーリングスタンプをクリック
  await page.locator('.sealing-stamp').click();

  // アニメーション完了を待つ（封筒: 0.4s + 0.8s + transition 0.8s + 余裕）
  await page.waitForTimeout(2500);

  // Phase 2: 手紙が表示されている
  await expect(page.locator('#phase-letter')).toBeVisible();
  // phase-envelope は phase--hidden クラスが付いて非表示
  const envelopeClass = await page.locator('#phase-envelope').getAttribute('class');
  expect(envelopeClass).toContain('phase--hidden');

  // 手紙の内容が見える
  await expect(page.locator('.letter')).toBeVisible();

  // letterのopacityが1になっている
  const opacity = await page.locator('.letter').evaluate(el => {
    return window.getComputedStyle(el).opacity;
  });
  console.log('letter opacity after reveal:', opacity);
  expect(parseFloat(opacity)).toBeGreaterThan(0.9);
});

test('謎解きが動作する', async ({ page }) => {
  await page.goto(indexPath);
  await page.locator('.sealing-stamp').click();
  await page.waitForTimeout(1500);

  // 正解を入力
  await page.locator('#answer-input').fill('TANBO');
  await page.locator('.mystery-submit-btn').click();

  // Phase 3: RSVPフォームが表示される
  await page.waitForTimeout(500);
  await expect(page.locator('#phase-rsvp')).toBeVisible();
  await expect(page.locator('#rsvp-form')).toBeVisible();
});
