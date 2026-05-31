import { normalizeAnswer, validate, validate2, MysteryComponent } from '../../js/mystery.js';
import { jest } from '@jest/globals';

// ---------------------------------------------------------------------------
// normalizeAnswer
// ---------------------------------------------------------------------------
describe('normalizeAnswer()', () => {
  test('半角小文字はそのまま返す', () => expect(normalizeAnswer('tanbo')).toBe('tanbo'));
  test('半角大文字を小文字に変換する', () => expect(normalizeAnswer('TANBO')).toBe('tanbo'));
  test('全角大文字を半角小文字に変換する', () => expect(normalizeAnswer('ＴＡＮＢＯ')).toBe('tanbo'));
  test('前後の空白を除去する', () => expect(normalizeAnswer('  tanbo  ')).toBe('tanbo'));
  test('空文字列は空文字列を返す', () => expect(normalizeAnswer('')).toBe(''));
  test('空白のみは空文字列を返す', () => expect(normalizeAnswer('   ')).toBe(''));
});

// ---------------------------------------------------------------------------
// validate (謎1: TANBO)
// ---------------------------------------------------------------------------
describe('validate() 謎1', () => {
  test('空文字列は "empty"', () => expect(validate('')).toBe('empty'));
  test('正解(小文字)は "correct"', () => expect(validate('tanbo')).toBe('correct'));
  test('正解(大文字)は "correct"', () => expect(validate('TANBO')).toBe('correct'));
  test('正解(全角)は "correct"', () => expect(validate('ＴＡＮＢＯ')).toBe('correct'));
  test('不正解は "incorrect"', () => expect(validate('wrong')).toBe('incorrect'));
});

// ---------------------------------------------------------------------------
// validate2 (謎2: 鹿児島)
// ---------------------------------------------------------------------------
describe('validate2() 謎2', () => {
  test('空文字列は "empty"', () => expect(validate2('')).toBe('empty'));
  test('"かごしま" は "correct"', () => expect(validate2('かごしま')).toBe('correct'));
  test('"鹿児島" は "correct"', () => expect(validate2('鹿児島')).toBe('correct'));
  test('"kagoshima" は "correct"', () => expect(validate2('kagoshima')).toBe('correct'));
  test('"KAGOSHIMA" は "correct"', () => expect(validate2('KAGOSHIMA')).toBe('correct'));
  test('不正解は "incorrect"', () => expect(validate2('tokyo')).toBe('incorrect'));
});

// ---------------------------------------------------------------------------
// MysteryComponent
// ---------------------------------------------------------------------------
function setupDOM() {
  document.body.innerHTML = `
    <section id="mystery-1">
      <input type="text" id="answer-input-1" />
      <p id="answer-error-1"></p>
      <button id="mystery-btn-1">封を解く</button>
      <a id="skip-link" href="#" class="skip-link">謎を解かずに回答する</a>
    </section>
    <section id="mystery-2" style="display:none;">
      <input type="text" id="answer-input-2" />
      <p id="answer-error-2"></p>
      <button id="mystery-btn-2">封を解く</button>
      <a id="skip-link-2" href="#" class="skip-link">謎を解かずに回答する</a>
    </section>
  `;
}

describe('MysteryComponent', () => {
  beforeEach(() => {
    setupDOM();
    MysteryComponent._failCount = 0;
    MysteryComponent._onSolve = null;
  });

  test('謎1正解で謎2が表示される', () => {
    MysteryComponent.init({ onSolve: jest.fn() });
    document.getElementById('answer-input-1').value = 'TANBO';
    document.getElementById('mystery-btn-1').click();
    expect(document.getElementById('mystery-2').style.display).toBe('block');
    expect(document.getElementById('mystery-1').style.display).toBe('none');
  });

  test('謎1不正解でエラーメッセージが表示される', () => {
    MysteryComponent.init({ onSolve: jest.fn() });
    document.getElementById('answer-input-1').value = 'wrong';
    document.getElementById('mystery-btn-1').click();
    expect(document.getElementById('answer-error-1').textContent).toBe('もう一度考えてみてください');
  });

  test('謎1空入力でエラーメッセージが表示される', () => {
    MysteryComponent.init({ onSolve: jest.fn() });
    document.getElementById('answer-input-1').value = '';
    document.getElementById('mystery-btn-1').click();
    expect(document.getElementById('answer-error-1').textContent).toBe('答えを入力してください');
  });

  test('謎2正解でonSolveが呼ばれる', () => {
    const onSolve = jest.fn();
    MysteryComponent.init({ onSolve });
    document.getElementById('answer-input-2').value = 'かごしま';
    document.getElementById('mystery-btn-2').click();
    expect(onSolve).toHaveBeenCalledTimes(1);
  });

  test('謎2で「鹿児島」も正解', () => {
    const onSolve = jest.fn();
    MysteryComponent.init({ onSolve });
    document.getElementById('answer-input-2').value = '鹿児島';
    document.getElementById('mystery-btn-2').click();
    expect(onSolve).toHaveBeenCalledTimes(1);
  });

  test('謎1スキップで謎2が表示される', () => {
    MysteryComponent.init({ onSolve: jest.fn() });
    document.getElementById('skip-link').click();
    expect(document.getElementById('mystery-2').style.display).toBe('block');
  });

  test('謎2スキップでonSolveが呼ばれる', () => {
    const onSolve = jest.fn();
    MysteryComponent.init({ onSolve });
    document.getElementById('skip-link-2').click();
    expect(onSolve).toHaveBeenCalledTimes(1);
  });

  test('5回不正解でskip-linkが強調される', () => {
    MysteryComponent.init({ onSolve: jest.fn() });
    for (let i = 0; i < 5; i++) {
      document.getElementById('answer-input-1').value = 'wrong';
      document.getElementById('mystery-btn-1').click();
    }
    expect(document.getElementById('skip-link').classList.contains('skip-link--highlighted')).toBe(true);
  });
});
