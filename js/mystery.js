/**
 * mystery.js — 謎解きロジック
 */

// 謎1の正解
const ANSWER_1 = 'TANBO';

// 謎2の正解（複数表現を許容）
const ANSWERS_2 = ['かごしま', '鹿児島', 'kagoshima'];

/**
 * 入力値を正規化する。
 * - 全角英数字 → 半角
 * - 大文字 → 小文字
 * - 前後の空白を除去
 */
export function normalizeAnswer(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
    .toLowerCase()
    .replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
}

/**
 * 謎1の入力値を検証する。
 */
export function validate(input) {
  const normalized = normalizeAnswer(input);
  if (normalized === '') return 'empty';
  if (normalized === normalizeAnswer(ANSWER_1)) return 'correct';
  return 'incorrect';
}

/**
 * 謎2の入力値を検証する（複数正解対応）。
 */
export function validate2(input) {
  const normalized = normalizeAnswer(input);
  if (normalized === '') return 'empty';
  if (ANSWERS_2.some(a => normalizeAnswer(a) === normalized)) return 'correct';
  return 'incorrect';
}

// ---------------------------------------------------------------------------
// MysteryComponent
// ---------------------------------------------------------------------------

export const MysteryComponent = {
  _failCount: 0,
  _onSolve: null,

  init(options) {
    this._failCount = 0;
    this._onSolve = options.onSolve ?? null;

    // 謎1のボタン
    const btn1 = document.getElementById('mystery-btn-1');
    if (btn1) {
      btn1.addEventListener('click', () => this._handleSubmit1());
    }

    // 謎1のスキップ
    const skip1 = document.getElementById('skip-link');
    if (skip1) {
      skip1.addEventListener('click', (e) => {
        e.preventDefault();
        this._showMystery2();
      });
      skip1.addEventListener('keydown', (e) => {
        if (e.key === ' ') { e.preventDefault(); this._showMystery2(); }
      });
    }

    // 謎2のボタン
    const btn2 = document.getElementById('mystery-btn-2');
    if (btn2) {
      btn2.addEventListener('click', () => this._handleSubmit2());
    }

    // 謎2のスキップ
    const skip2 = document.getElementById('skip-link-2');
    if (skip2) {
      skip2.addEventListener('click', (e) => {
        e.preventDefault();
        if (this._onSolve) this._onSolve();
      });
      skip2.addEventListener('keydown', (e) => {
        if (e.key === ' ') { e.preventDefault(); if (this._onSolve) this._onSolve(); }
      });
    }
  },

  _handleSubmit1() {
    const inputEl = document.getElementById('answer-input-1');
    const errorEl = document.getElementById('answer-error-1');
    if (!inputEl || !errorEl) return;

    const result = validate(inputEl.value);
    if (result === 'empty') {
      errorEl.textContent = '答えを入力してください';
    } else if (result === 'correct') {
      errorEl.textContent = '';
      this._showMystery2();
    } else {
      errorEl.textContent = 'もう一度考えてみてください';
      inputEl.value = '';
      this.incrementFailCount();
    }
  },

  _handleSubmit2() {
    const inputEl = document.getElementById('answer-input-2');
    const errorEl = document.getElementById('answer-error-2');
    if (!inputEl || !errorEl) return;

    const result = validate2(inputEl.value);
    if (result === 'empty') {
      errorEl.textContent = '答えを入力してください';
    } else if (result === 'correct') {
      errorEl.textContent = '';
      if (this._onSolve) this._onSolve();
    } else {
      errorEl.textContent = 'もう一度考えてみてください';
      inputEl.value = '';
    }
  },

  _showMystery2() {
    const m1 = document.getElementById('mystery-1');
    const m2 = document.getElementById('mystery-2');
    if (m1) m1.style.display = 'none';
    if (m2) m2.style.display = 'block';
  },

  incrementFailCount() {
    this._failCount += 1;
    if (this._failCount >= 5) {
      const skipLink = document.getElementById('skip-link');
      if (skipLink) skipLink.classList.add('skip-link--highlighted');
    }
  },
};
