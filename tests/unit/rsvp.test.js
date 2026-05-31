/**
 * rsvp.test.js — RsvpComponent のユニットテスト
 * タスク 7.2: validate() と buildPayload() の動作確認
 * タスク 7.5: submitWithTimeout() と RsvpComponent.init/show の動作確認
 * Requirements: 5.2, 5.3, 5.4, 5.5, 5.7, 5.8, 6.4
 */

import { validate, buildPayload, submitWithTimeout, RsvpComponent } from '../../js/rsvp.js';
import { jest } from '@jest/globals';

// ─── validate() ───────────────────────────────────────────────────────────────

describe('validate()', () => {
  describe('氏名バリデーション（Requirements 5.2, 5.4）', () => {
    test('氏名が空文字列のとき valid: false かつ errors.name が設定される', () => {
      const result = validate({ name: '', attendance: '出席' });
      expect(result.valid).toBe(false);
      expect(result.errors.name).toBe('必須項目です');
    });

    test('氏名が半角スペースのみのとき valid: false', () => {
      const result = validate({ name: '   ', attendance: '出席' });
      expect(result.valid).toBe(false);
      expect(result.errors.name).toBe('必須項目です');
    });

    test('氏名がタブのみのとき valid: false', () => {
      const result = validate({ name: '\t\t', attendance: '出席' });
      expect(result.valid).toBe(false);
      expect(result.errors.name).toBe('必須項目です');
    });

    test('氏名が全角スペースのみのとき valid: false', () => {
      const result = validate({ name: '\u3000\u3000', attendance: '出席' });
      expect(result.valid).toBe(false);
      expect(result.errors.name).toBe('必須項目です');
    });

    test('氏名が改行のみのとき valid: false', () => {
      const result = validate({ name: '\n\n', attendance: '出席' });
      expect(result.valid).toBe(false);
      expect(result.errors.name).toBe('必須項目です');
    });

    test('氏名が有効な文字列のとき errors.name は設定されない', () => {
      const result = validate({ name: '山田 太郎', attendance: '出席' });
      expect(result.errors.name).toBeUndefined();
    });
  });

  describe('出欠バリデーション（Requirements 5.3, 5.4）', () => {
    test('出欠が未選択（空文字列）のとき valid: false かつ errors.attendance が設定される', () => {
      const result = validate({ name: '山田 太郎', attendance: '' });
      expect(result.valid).toBe(false);
      expect(result.errors.attendance).toBe('必須項目です');
    });

    test('出欠が undefined のとき valid: false', () => {
      const result = validate({ name: '山田 太郎', attendance: undefined });
      expect(result.valid).toBe(false);
      expect(result.errors.attendance).toBe('必須項目です');
    });

    test('出欠が不正な値のとき valid: false', () => {
      const result = validate({ name: '山田 太郎', attendance: '参加' });
      expect(result.valid).toBe(false);
      expect(result.errors.attendance).toBe('必須項目です');
    });

    test('出欠が "出席" のとき errors.attendance は設定されない', () => {
      const result = validate({ name: '山田 太郎', attendance: '出席' });
      expect(result.errors.attendance).toBeUndefined();
    });

    test('出欠が "欠席" のとき errors.attendance は設定されない', () => {
      const result = validate({ name: '山田 太郎', attendance: '欠席' });
      expect(result.errors.attendance).toBeUndefined();
    });
  });

  describe('複合バリデーション', () => {
    test('氏名・出欠ともに有効なとき valid: true かつ errors は空オブジェクト', () => {
      const result = validate({ name: '山田 太郎', attendance: '出席' });
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    test('氏名・出欠ともに無効なとき valid: false かつ両方のエラーが設定される', () => {
      const result = validate({ name: '', attendance: '' });
      expect(result.valid).toBe(false);
      expect(result.errors.name).toBe('必須項目です');
      expect(result.errors.attendance).toBe('必須項目です');
    });
  });
});

// ─── buildPayload() ───────────────────────────────────────────────────────────

describe('buildPayload()', () => {
  test('4フィールドすべてを含むオブジェクトを返す（Requirements 5.5）', () => {
    const payload = buildPayload({
      name: '山田 太郎',
      attendance: '出席',
      allergy: 'えび・かに',
      message: 'おめでとうございます！',
    });
    expect(payload).toEqual({
      name: '山田 太郎',
      attendance: '出席',
      allergy: 'えび・かに',
      message: 'おめでとうございます！',
    });
  });

  test('allergy が未入力（undefined）のとき空文字列になる', () => {
    const payload = buildPayload({
      name: '山田 太郎',
      attendance: '出席',
      allergy: undefined,
      message: 'よろしくお願いします',
    });
    expect(payload.allergy).toBe('');
  });

  test('message が未入力（undefined）のとき空文字列になる', () => {
    const payload = buildPayload({
      name: '山田 太郎',
      attendance: '欠席',
      allergy: '',
      message: undefined,
    });
    expect(payload.message).toBe('');
  });

  test('allergy・message ともに未入力のとき両方空文字列になる', () => {
    const payload = buildPayload({
      name: '鈴木 花子',
      attendance: '欠席',
    });
    expect(payload.allergy).toBe('');
    expect(payload.message).toBe('');
  });

  test('返却オブジェクトは name, attendance, allergy, message の4キーのみを持つ', () => {
    const payload = buildPayload({
      name: '田中 一郎',
      attendance: '出席',
      allergy: '',
      message: '',
    });
    expect(Object.keys(payload).sort()).toEqual(['allergy', 'attendance', 'message', 'name']);
  });
});

// ─── submitWithTimeout() ──────────────────────────────────────────────────────

describe('submitWithTimeout()', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('成功レスポンスを返す（Requirements 5.5, 6.2）', async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({ result: 'success' }),
    });

    const result = await submitWithTimeout(
      { name: '山田 太郎', attendance: '出席', allergy: '', message: '' },
      'https://example.com/api'
    );
    expect(result).toEqual({ result: 'success' });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/api',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  test('ネットワークエラー時に例外をスローする（Requirements 5.7, 6.4）', async () => {
    global.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(
      submitWithTimeout(
        { name: '山田 太郎', attendance: '出席', allergy: '', message: '' },
        'https://example.com/api'
      )
    ).rejects.toThrow('Failed to fetch');
  });

  test('タイムアウト時に AbortError をスローする（Requirements 6.4）', async () => {
    global.fetch.mockImplementationOnce((_url, options) => {
      return new Promise((_resolve, reject) => {
        options.signal.addEventListener('abort', () => {
          const err = new DOMException('The operation was aborted.', 'AbortError');
          reject(err);
        });
      });
    });

    await expect(
      submitWithTimeout(
        { name: '山田 太郎', attendance: '出席', allergy: '', message: '' },
        'https://example.com/api',
        10 // 10ms タイムアウト
      )
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
});

// ─── RsvpComponent.show() ────────────────────────────────────────────────────

describe('RsvpComponent.show()', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="rsvp-form" class="rsvp-form rsvp-form--hidden"></form>
    `;
  });

  test('rsvp-form--hidden クラスを除去して表示する（Requirements 5.8）', () => {
    RsvpComponent.show();
    const form = document.getElementById('rsvp-form');
    expect(form.classList.contains('rsvp-form--hidden')).toBe(false);
  });

  test('フォームが存在しない場合もエラーにならない', () => {
    document.body.innerHTML = '';
    expect(() => RsvpComponent.show()).not.toThrow();
  });
});

// ─── RsvpComponent.init() — フォーム送信フロー ───────────────────────────────

describe('RsvpComponent.init() — フォーム送信フロー', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="rsvp-form" novalidate>
        <p id="rsvp-error"></p>
        <div>
          <input type="text" id="rsvp-name" name="name" />
          <p id="rsvp-name-error"></p>
        </div>
        <div>
          <input type="radio" name="attendance" value="出席" id="rsvp-attend" />
          <input type="radio" name="attendance" value="欠席" id="rsvp-absent" />
          <p id="rsvp-attendance-error"></p>
        </div>
        <textarea id="rsvp-allergy" name="allergy"></textarea>
        <textarea id="rsvp-message" name="message"></textarea>
        <button type="submit" id="rsvp-submit">送信する</button>
      </form>
      <div id="rsvp-success" style="display: none;"></div>
    `;
    global.fetch = jest.fn();
    RsvpComponent.init({ apiEndpoint: 'https://example.com/api' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('氏名未入力でバリデーション失敗・エラーメッセージ表示（Requirements 5.2, 5.4）', async () => {
    document.getElementById('rsvp-attend').checked = true;
    // 氏名は空のまま

    const form = document.getElementById('rsvp-form');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    // 非同期処理を待つ
    await new Promise((r) => setTimeout(r, 0));

    expect(document.getElementById('rsvp-name-error').textContent).toBe('必須項目です');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('出欠未選択でバリデーション失敗・エラーメッセージ表示（Requirements 5.3, 5.4）', async () => {
    document.getElementById('rsvp-name').value = '山田 太郎';
    // 出欠は未選択のまま

    const form = document.getElementById('rsvp-form');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    await new Promise((r) => setTimeout(r, 0));

    expect(document.getElementById('rsvp-attendance-error').textContent).toBe('必須項目です');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('API成功時に完了メッセージを表示しフォームを非表示にする（Requirements 5.8, 6.3）', async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({ result: 'success' }),
    });

    document.getElementById('rsvp-name').value = '山田 太郎';
    document.getElementById('rsvp-attend').checked = true;

    const form = document.getElementById('rsvp-form');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    await new Promise((r) => setTimeout(r, 50));

    expect(document.getElementById('rsvp-form').classList.contains('rsvp-form--hidden')).toBe(true);
    expect(document.getElementById('rsvp-success').style.display).toBe('block');
  });

  test('APIエラーレスポンス時に入力データ保持・エラーメッセージ表示（Requirements 5.7, 6.7）', async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({ result: 'error', message: 'Internal error' }),
    });

    document.getElementById('rsvp-name').value = '山田 太郎';
    document.getElementById('rsvp-attend').checked = true;

    const form = document.getElementById('rsvp-form');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    await new Promise((r) => setTimeout(r, 50));

    expect(document.getElementById('rsvp-error').textContent).toBe(
      '送信に失敗しました。もう一度お試しください。'
    );
    // フォームは非表示にならない（入力データ保持）
    expect(document.getElementById('rsvp-form').style.display).not.toBe('none');
    // 入力値が保持されている
    expect(document.getElementById('rsvp-name').value).toBe('山田 太郎');
  });

  test('ネットワークエラー時にエラーメッセージを表示する（Requirements 5.7, 6.4）', async () => {
    global.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    document.getElementById('rsvp-name').value = '山田 太郎';
    document.getElementById('rsvp-attend').checked = true;

    const form = document.getElementById('rsvp-form');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    await new Promise((r) => setTimeout(r, 50));

    expect(document.getElementById('rsvp-error').textContent).toBe(
      '送信に失敗しました。もう一度お試しください。'
    );
  });
});
