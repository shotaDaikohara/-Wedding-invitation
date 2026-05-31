/**
 * mystery.test.js — normalizeAnswer / validate のユニットテスト
 * タスク 4.2: MysteryComponent の normalizeAnswer と validate を実装する
 * Requirements: 3.2, 3.5
 */

import { normalizeAnswer, validate } from '../../js/mystery.js';

// ---------------------------------------------------------------------------
// normalizeAnswer
// ---------------------------------------------------------------------------

describe('normalizeAnswer()', () => {
  test('半角小文字はそのまま返す', () => {
    expect(normalizeAnswer('tanbo')).toBe('tanbo');
  });

  test('半角大文字を小文字に変換する', () => {
    expect(normalizeAnswer('TANBO')).toBe('tanbo');
  });

  test('全角大文字を半角小文字に変換する', () => {
    expect(normalizeAnswer('ＴＡＮＢＯ')).toBe('tanbo');
  });

  test('全角小文字を半角小文字に変換する', () => {
    expect(normalizeAnswer('ｔａｎｂｏ')).toBe('tanbo');
  });

  test('前後の半角スペースを除去する', () => {
    expect(normalizeAnswer('  tanbo  ')).toBe('tanbo');
  });

  test('前後の全角スペースを除去する', () => {
    expect(normalizeAnswer('\u3000tanbo\u3000')).toBe('tanbo');
  });

  test('空文字列は空文字列を返す', () => {
    expect(normalizeAnswer('')).toBe('');
  });

  test('空白のみの文字列は空文字列を返す', () => {
    expect(normalizeAnswer('   ')).toBe('');
  });

  test('全角数字を半角に変換する', () => {
    expect(normalizeAnswer('１２３')).toBe('123');
  });

  test('正解 TANBO の正規化結果は tanbo', () => {
    expect(normalizeAnswer('TANBO')).toBe('tanbo');
  });

  test('全角・大文字混在の正解文字列を正規化する', () => {
    expect(normalizeAnswer('ＴＡＮbo')).toBe('tanbo');
  });
});

// ---------------------------------------------------------------------------
// validate
// ---------------------------------------------------------------------------

describe('validate()', () => {
  test('空文字列は "empty" を返す', () => {
    expect(validate('')).toBe('empty');
  });

  test('空白のみの文字列は "empty" を返す', () => {
    expect(validate('   ')).toBe('empty');
  });

  test('全角スペースのみの文字列は "empty" を返す', () => {
    expect(validate('\u3000\u3000')).toBe('empty');
  });

  test('正解（半角小文字）は "correct" を返す', () => {
    expect(validate('tanbo')).toBe('correct');
  });

  test('正解（半角大文字）は "correct" を返す', () => {
    expect(validate('TANBO')).toBe('correct');
  });

  test('正解（全角大文字）は "correct" を返す', () => {
    expect(validate('ＴＡＮＢＯ')).toBe('correct');
  });

  test('正解（全角小文字）は "correct" を返す', () => {
    expect(validate('ｔａｎｂｏ')).toBe('correct');
  });

  test('正解（前後に空白あり）は "correct" を返す', () => {
    expect(validate('  TANBO  ')).toBe('correct');
  });

  test('不正解は "incorrect" を返す', () => {
    expect(validate('wrong')).toBe('incorrect');
  });

  test('部分一致は "incorrect" を返す', () => {
    expect(validate('tan')).toBe('incorrect');
  });

  test('余分な文字が付いた入力は "incorrect" を返す', () => {
    expect(validate('tanbo!')).toBe('incorrect');
  });
});

// ---------------------------------------------------------------------------
// MysteryComponent
// ---------------------------------------------------------------------------

import { jest } from '@jest/globals';
import { MysteryComponent } from '../../js/mystery.js';

/**
 * jsdom に謎解きセクションの DOM を構築するヘルパー
 */
function setupMysteryDOM() {
  document.body.innerHTML = `
    <input type="text" id="answer-input" />
    <p id="answer-error"></p>
    <button class="mystery-submit-btn">封を解く</button>
    <a id="skip-link" class="skip-link" href="#">謎を解かずに回答する</a>
  `;
}

describe('MysteryComponent', () => {
  beforeEach(() => {
    setupMysteryDOM();
    // _failCount をリセット（オブジェクトリテラルなので直接リセット）
    MysteryComponent._failCount = 0;
    MysteryComponent._onSolve = null;
  });

  test('正解入力で onSolve コールバックが呼ばれる', () => {
    const onSolve = jest.fn();
    MysteryComponent.init({ answer: 'TANBO', onSolve });

    document.getElementById('answer-input').value = 'TANBO';
    document.querySelector('.mystery-submit-btn').click();

    expect(onSolve).toHaveBeenCalledTimes(1);
  });

  test('正解入力でエラーメッセージがクリアされる', () => {
    const onSolve = jest.fn();
    MysteryComponent.init({ answer: 'TANBO', onSolve });

    const errorEl = document.getElementById('answer-error');
    errorEl.textContent = '前回のエラー';

    document.getElementById('answer-input').value = 'tanbo';
    document.querySelector('.mystery-submit-btn').click();

    expect(errorEl.textContent).toBe('');
  });

  test('不正解入力でエラーメッセージが表示される', () => {
    MysteryComponent.init({ answer: 'TANBO', onSolve: jest.fn() });

    document.getElementById('answer-input').value = 'wrong';
    document.querySelector('.mystery-submit-btn').click();

    expect(document.getElementById('answer-error').textContent).toBe('もう一度考えてみてください');
  });

  test('不正解入力で Answer_Input がクリアされる', () => {
    MysteryComponent.init({ answer: 'TANBO', onSolve: jest.fn() });

    const inputEl = document.getElementById('answer-input');
    inputEl.value = 'wrong';
    document.querySelector('.mystery-submit-btn').click();

    expect(inputEl.value).toBe('');
  });

  test('空入力で「答えを入力してください」が表示される', () => {
    const onSolve = jest.fn();
    MysteryComponent.init({ answer: 'TANBO', onSolve });

    document.getElementById('answer-input').value = '';
    document.querySelector('.mystery-submit-btn').click();

    expect(document.getElementById('answer-error').textContent).toBe('答えを入力してください');
    expect(onSolve).not.toHaveBeenCalled();
  });

  test('空入力では onSolve が呼ばれない', () => {
    const onSolve = jest.fn();
    MysteryComponent.init({ answer: 'TANBO', onSolve });

    document.getElementById('answer-input').value = '   ';
    document.querySelector('.mystery-submit-btn').click();

    expect(onSolve).not.toHaveBeenCalled();
  });

  test('Skip_Link クリックで onSolve が呼ばれる', () => {
    const onSolve = jest.fn();
    MysteryComponent.init({ answer: 'TANBO', onSolve });

    document.getElementById('skip-link').click();

    expect(onSolve).toHaveBeenCalledTimes(1);
  });

  test('4回不正解では Skip_Link に強調クラスが付かない', () => {
    MysteryComponent.init({ answer: 'TANBO', onSolve: jest.fn() });
    const inputEl = document.getElementById('answer-input');
    const submitBtn = document.querySelector('.mystery-submit-btn');

    for (let i = 0; i < 4; i++) {
      inputEl.value = 'wrong';
      submitBtn.click();
    }

    expect(document.getElementById('skip-link').classList.contains('skip-link--highlighted')).toBe(false);
  });

  test('5回不正解で Skip_Link に skip-link--highlighted クラスが付与される', () => {
    MysteryComponent.init({ answer: 'TANBO', onSolve: jest.fn() });
    const inputEl = document.getElementById('answer-input');
    const submitBtn = document.querySelector('.mystery-submit-btn');

    for (let i = 0; i < 5; i++) {
      inputEl.value = 'wrong';
      submitBtn.click();
    }

    expect(document.getElementById('skip-link').classList.contains('skip-link--highlighted')).toBe(true);
  });
});
