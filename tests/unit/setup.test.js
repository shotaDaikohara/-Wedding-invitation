/**
 * setup.test.js — プロジェクト基盤のセットアップ確認テスト
 * タスク1: package.json, jest.config.js, index.html, css/base.css, js/main.js の存在確認
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '../../');

describe('タスク1: プロジェクト基盤のセットアップ', () => {
  test('package.json が存在し、必要な devDependencies を含む', () => {
    const pkgPath = resolve(ROOT, 'package.json');
    expect(existsSync(pkgPath)).toBe(true);

    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    expect(pkg.devDependencies).toHaveProperty('jest');
    expect(pkg.devDependencies).toHaveProperty('jest-environment-jsdom');
    expect(pkg.devDependencies).toHaveProperty('fast-check');
  });

  test('jest.config.js が存在し、testEnvironment が jsdom に設定されている', () => {
    const configPath = resolve(ROOT, 'jest.config.js');
    expect(existsSync(configPath)).toBe(true);

    const content = readFileSync(configPath, 'utf-8');
    expect(content).toContain('jsdom');
  });

  test('index.html が存在し、必要な要素を含む', () => {
    const htmlPath = resolve(ROOT, 'index.html');
    expect(existsSync(htmlPath)).toBe(true);

    const content = readFileSync(htmlPath, 'utf-8');
    expect(content).toContain('<!DOCTYPE html>');
    expect(content).toContain('meta name="viewport"');
    expect(content).toContain('fonts.googleapis.com');
    expect(content).toContain('css/base.css');
    expect(content).toContain('js/main.js');
  });

  test('css/base.css が存在し、CSS カスタムプロパティを含む', () => {
    const cssPath = resolve(ROOT, 'css/base.css');
    expect(existsSync(cssPath)).toBe(true);

    const content = readFileSync(cssPath, 'utf-8');
    expect(content).toContain('--color-bg: #f4f1ea');
    expect(content).toContain('--color-accent: #d4af37');
    expect(content).toContain('Shippori Mincho');
    expect(content).toContain('serif');
  });

  test('js/main.js が存在し、AppState を export している', () => {
    const jsPath = resolve(ROOT, 'js/main.js');
    expect(existsSync(jsPath)).toBe(true);

    const content = readFileSync(jsPath, 'utf-8');
    expect(content).toContain('export const AppState');
    expect(content).toContain('phase:');
    expect(content).toContain('isAnimating:');
    expect(content).toContain('failCount:');
    expect(content).toContain('DOMContentLoaded');
  });
});

describe('AppState の初期値', () => {
  test('AppState の初期値が正しい', async () => {
    const { AppState } = await import('../../js/main.js');
    expect(AppState.phase).toBe(1);
    expect(AppState.isAnimating).toBe(false);
    expect(AppState.failCount).toBe(0);
  });
});
