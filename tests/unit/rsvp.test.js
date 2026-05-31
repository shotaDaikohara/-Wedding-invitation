import { validate, buildPayload, submitWithTimeout, RsvpComponent } from '../../js/rsvp.js';
import { jest } from '@jest/globals';

const VALID = { name: '山田 太郎', email: 'test@example.com', attendance: '出席' };

// ─── validate() ───────────────────────────────────────────────────────────────

describe('validate()', () => {
  test('氏名が空のとき valid: false', () => {
    expect(validate({ ...VALID, name: '' }).valid).toBe(false);
  });
  test('氏名が空白のみのとき valid: false', () => {
    expect(validate({ ...VALID, name: '   ' }).valid).toBe(false);
  });
  test('メアドが不正のとき valid: false', () => {
    expect(validate({ ...VALID, email: 'invalid' }).valid).toBe(false);
  });
  test('メアドが空のとき valid: false', () => {
    expect(validate({ ...VALID, email: '' }).valid).toBe(false);
  });
  test('出欠が未選択のとき valid: false', () => {
    expect(validate({ ...VALID, attendance: '' }).valid).toBe(false);
  });
  test('全て有効なとき valid: true', () => {
    expect(validate(VALID).valid).toBe(true);
  });
  test('出欠が "欠席" のとき valid: true', () => {
    expect(validate({ ...VALID, attendance: '欠席' }).valid).toBe(true);
  });
});

// ─── buildPayload() ───────────────────────────────────────────────────────────

describe('buildPayload()', () => {
  test('5フィールドすべてを含む', () => {
    const payload = buildPayload({ name: '山田', email: 'a@b.com', attendance: '出席', allergy: 'えび', message: 'よろしく' });
    expect(payload).toEqual({ name: '山田', email: 'a@b.com', attendance: '出席', allergy: 'えび', message: 'よろしく' });
  });
  test('allergy未入力は空文字列', () => {
    expect(buildPayload({ ...VALID, allergy: undefined, message: '' }).allergy).toBe('');
  });
  test('message未入力は空文字列', () => {
    expect(buildPayload({ ...VALID, allergy: '', message: undefined }).message).toBe('');
  });
});

// ─── submitWithTimeout() ──────────────────────────────────────────────────────

describe('submitWithTimeout()', () => {
  beforeEach(() => { global.fetch = jest.fn(); });
  afterEach(() => { jest.restoreAllMocks(); });

  test('no-corsで送信して成功を返す', async () => {
    global.fetch.mockResolvedValueOnce({ type: 'opaque', status: 0 });
    const result = await submitWithTimeout({ name: '山田', email: 'a@b.com', attendance: '出席', allergy: '', message: '' }, 'https://example.com/api');
    expect(result).toEqual({ result: 'success' });
    expect(global.fetch).toHaveBeenCalledWith('https://example.com/api', expect.objectContaining({ method: 'POST', mode: 'no-cors' }));
  });

  test('ネットワークエラー時に例外をスロー', async () => {
    global.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(submitWithTimeout({}, 'https://example.com/api')).rejects.toThrow('Failed to fetch');
  });
});

// ─── RsvpComponent.show() ────────────────────────────────────────────────────

describe('RsvpComponent.show()', () => {
  beforeEach(() => {
    document.body.innerHTML = `<form id="rsvp-form" class="rsvp-form rsvp-form--hidden"></form>`;
  });

  test('rsvp-form--hiddenクラスを除去する', () => {
    RsvpComponent.show();
    expect(document.getElementById('rsvp-form').classList.contains('rsvp-form--hidden')).toBe(false);
  });

  test('フォームが存在しない場合もエラーにならない', () => {
    document.body.innerHTML = '';
    expect(() => RsvpComponent.show()).not.toThrow();
  });
});

// ─── RsvpComponent.init() ────────────────────────────────────────────────────

describe('RsvpComponent.init() — フォーム送信フロー', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="rsvp-form" novalidate>
        <p id="rsvp-error"></p>
        <input type="text" id="rsvp-name" name="name" />
        <p id="rsvp-name-error"></p>
        <input type="email" id="rsvp-email" name="email" />
        <p id="rsvp-email-error"></p>
        <input type="radio" name="attendance" value="出席" id="rsvp-attend" />
        <input type="radio" name="attendance" value="欠席" id="rsvp-absent" />
        <p id="rsvp-attendance-error"></p>
        <textarea id="rsvp-allergy" name="allergy"></textarea>
        <textarea id="rsvp-message" name="message"></textarea>
        <button type="submit" id="rsvp-submit">送信する</button>
      </form>
      <div id="rsvp-success" style="display: none;"></div>
    `;
    global.fetch = jest.fn();
    RsvpComponent.init({ apiEndpoint: 'https://example.com/api' });
  });
  afterEach(() => { jest.restoreAllMocks(); });

  test('氏名未入力でバリデーション失敗', async () => {
    document.getElementById('rsvp-email').value = 'test@example.com';
    document.getElementById('rsvp-attend').checked = true;
    document.getElementById('rsvp-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await new Promise(r => setTimeout(r, 0));
    expect(document.getElementById('rsvp-name-error').textContent).toBe('必須項目です');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('出欠未選択でバリデーション失敗', async () => {
    document.getElementById('rsvp-name').value = '山田 太郎';
    document.getElementById('rsvp-email').value = 'test@example.com';
    document.getElementById('rsvp-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await new Promise(r => setTimeout(r, 0));
    expect(document.getElementById('rsvp-attendance-error').textContent).toBe('必須項目です');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('API成功時に完了メッセージ表示', async () => {
    global.fetch.mockResolvedValueOnce({ type: 'opaque' });
    document.getElementById('rsvp-name').value = '山田 太郎';
    document.getElementById('rsvp-email').value = 'test@example.com';
    document.getElementById('rsvp-attend').checked = true;
    document.getElementById('rsvp-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await new Promise(r => setTimeout(r, 50));
    expect(document.getElementById('rsvp-form').classList.contains('rsvp-form--hidden')).toBe(true);
    expect(document.getElementById('rsvp-success').style.display).toBe('block');
  });

  test('ネットワークエラー時にエラーメッセージ表示', async () => {
    global.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    document.getElementById('rsvp-name').value = '山田 太郎';
    document.getElementById('rsvp-email').value = 'test@example.com';
    document.getElementById('rsvp-attend').checked = true;
    document.getElementById('rsvp-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await new Promise(r => setTimeout(r, 50));
    expect(document.getElementById('rsvp-error').textContent).toBe('送信に失敗しました。もう一度お試しください。');
  });
});
