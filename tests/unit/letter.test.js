/**
 * letter.test.js — LetterComponent のユニットテスト
 * Requirements: 2.1, 2.6
 */

import { LetterComponent } from '../../js/main.js';

describe('LetterComponent.reveal()', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <section id="phase-letter" class="phase phase--hidden">
        <article class="letter"></article>
      </section>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('.letter 要素が存在する場合にエラーが発生しない（Requirements 2.1）', () => {
    expect(() => LetterComponent.reveal()).not.toThrow();
  });

  test('.letter 要素が存在しない場合でもエラーが発生しない（Requirements 2.6）', () => {
    document.body.innerHTML = '';
    expect(() => LetterComponent.reveal()).not.toThrow();
  });

  test('reveal() を複数回呼び出してもエラーが発生しない', () => {
    expect(() => {
      LetterComponent.reveal();
      LetterComponent.reveal();
    }).not.toThrow();
  });
});
