/**
 * letter.test.js — LetterComponent のユニットテスト
 * タスク 3.2: LetterComponent.reveal() の動作確認
 * Requirements: 2.1, 2.3, 2.6
 */

import { LetterComponent } from '../../js/main.js';

describe('LetterComponent.reveal()', () => {
  beforeEach(() => {
    // jsdom に .letter 要素をセットアップ
    document.body.innerHTML = `
      <section id="phase-letter" class="phase phase--hidden">
        <article class="letter"></article>
      </section>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('.letter 要素に .letter--visible クラスが付与される（Requirements 2.1）', () => {
    const letterEl = document.querySelector('.letter');
    expect(letterEl.classList.contains('letter--visible')).toBe(false);

    LetterComponent.reveal();

    expect(letterEl.classList.contains('letter--visible')).toBe(true);
  });

  test('.letter 要素が存在しない場合でもエラーが発生しない（Requirements 2.6）', () => {
    document.body.innerHTML = '';
    expect(() => LetterComponent.reveal()).not.toThrow();
  });

  test('reveal() を複数回呼び出しても .letter--visible クラスは1つだけ付与される', () => {
    LetterComponent.reveal();
    LetterComponent.reveal();

    const letterEl = document.querySelector('.letter');
    // classList は重複クラスを持たない
    const visibleCount = Array.from(letterEl.classList).filter(
      (c) => c === 'letter--visible'
    ).length;
    expect(visibleCount).toBe(1);
  });
});
