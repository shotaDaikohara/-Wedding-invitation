/**
 * mystery.js — 謎解きロジック（Answer_Validator）
 *
 * Requirements: 3.2, 3.3, 3.4, 3.5, 3.6
 */

const ANSWER = 'TANBO'; // 正解文字列

/**
 * 入力値を正規化する。
 * - 全角英数字（Ａ-Ｚ、ａ-ｚ、０-９）を半角に変換
 * - 大文字を小文字に変換
 * - 前後の空白（半角・全角）を除去
 * @param {string} input
 * @returns {string} 正規化済み文字列
 */
export function normalizeAnswer(input) {
  if (typeof input !== 'string') return '';

  return input
    // 全角英数字 → 半角（U+FF01〜U+FF5E の範囲を U+0021〜U+007E にシフト）
    .replace(/[\uFF01-\uFF5E]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)
    )
    // 大文字 → 小文字
    .toLowerCase()
    // 前後の空白（半角スペース・全角スペース・タブ・改行）を除去
    .replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
}

/**
 * 入力値を検証する。
 * @param {string} input
 * @returns {'correct' | 'incorrect' | 'empty'}
 */
export function validate(input) {
  const normalized = normalizeAnswer(input);

  if (normalized === '') {
    return 'empty';
  }

  if (normalized === normalizeAnswer(ANSWER)) {
    return 'correct';
  }

  return 'incorrect';
}

// ---------------------------------------------------------------------------
// MysteryComponent
// ---------------------------------------------------------------------------

/**
 * 謎解きコンポーネント。
 * 「封を解く」ボタンのクリックイベントを管理し、正解・不正解・空入力の各ケースを処理する。
 * Requirements: 3.2, 3.3, 3.4, 3.5, 3.6
 */
export const MysteryComponent = {
  /** @type {number} 不正解回数 */
  _failCount: 0,

  /** @type {Function|null} 正解時コールバック */
  _onSolve: null,

  /**
   * 初期化。
   * @param {Object} options
   * @param {string} options.answer - 正解文字列（現在は内部定数 ANSWER を使用）
   * @param {Function} options.onSolve - 正解時のコールバック
   */
  init(options) {
    this._failCount = 0;
    this._onSolve = options.onSolve ?? null;

    const submitBtn = document.querySelector('.mystery-submit-btn');
    const skipLink = document.getElementById('skip-link');

    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        this._handleSubmit();
      });
    }

    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (this._onSolve) {
          this._onSolve();
        }
      });

      // role="button" の <a> 要素は Space キーでも動作すべき（アクセシビリティ）
      skipLink.addEventListener('keydown', (e) => {
        if (e.key === ' ') {
          e.preventDefault();
          if (this._onSolve) {
            this._onSolve();
          }
        }
      });
    }
  },

  /**
   * 「封を解く」ボタンクリック時の処理。
   * @private
   */
  _handleSubmit() {
    const inputEl = document.getElementById('answer-input');
    const errorEl = document.getElementById('answer-error');

    if (!inputEl || !errorEl) return;

    const inputValue = inputEl.value;
    const result = validate(inputValue);

    if (result === 'empty') {
      errorEl.textContent = '答えを入力してください';
    } else if (result === 'correct') {
      errorEl.textContent = '';
      if (this._onSolve) {
        this._onSolve();
      }
    } else {
      // incorrect
      errorEl.textContent = 'もう一度考えてみてください';
      inputEl.value = '';
      this.incrementFailCount();
    }
  },

  /**
   * 不正解回数をインクリメントし、5回に達したら Skip_Link を強調表示する。
   * Requirements: 3.6
   */
  incrementFailCount() {
    this._failCount += 1;

    if (this._failCount >= 5) {
      const skipLink = document.getElementById('skip-link');
      if (skipLink) {
        skipLink.classList.add('skip-link--highlighted');
      }
    }
  },
};
