// @ts-check
import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const indexPath = 'file://' + join(__dirname, '../../index.html');

test('デバッグ: クリック後のコンソールエラーとフェーズ状態を確認', async ({ page }) => {
  const errors = [];
  page.on('console', msg => {
    console.log(`[${msg.type()}] ${msg.text()}`);
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message);
    errors.push(err.message);
  });

  await page.goto(indexPath);
  await page.waitForTimeout(500);

  // 初期状態
  const stampVisible = await page.locator('.sealing-stamp').isVisible();
  console.log('stamp visible:', stampVisible);

  // クリック
  await page.locator('.sealing-stamp').click();
  await page.waitForTimeout(2000);

  // フェーズ状態
  const phaseLetterClass = await page.locator('#phase-letter').getAttribute('class');
  const phaseEnvelopeClass = await page.locator('#phase-envelope').getAttribute('class');
  console.log('#phase-envelope class:', phaseEnvelopeClass);
  console.log('#phase-letter class:', phaseLetterClass);

  const letterOpacity = await page.locator('.letter').evaluate(el =>
    window.getComputedStyle(el).opacity
  );
  console.log('.letter computed opacity:', letterOpacity);

  console.log('All errors:', errors);
});
