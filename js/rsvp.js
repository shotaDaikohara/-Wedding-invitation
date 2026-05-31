/**
 * rsvp.js — RsvpComponent のバリデーション・ペイロード生成・送信ロジック
 * Requirements: 5.2, 5.3, 5.4, 5.5, 5.7, 5.8, 6.4
 */

/**
 * フォームデータをバリデーションする。
 * @param {{ name: string, attendance: string }} formData
 * @returns {{ valid: boolean, errors: { name?: string, attendance?: string } }}
 */
export function validate(formData) {
  const errors = {};

  // 氏名バリデーション: 空文字列または空白のみ（スペース・タブ・全角スペース・改行）
  const name = formData.name ?? '';
  if (/^[\s\u3000]*$/.test(name)) {
    errors.name = '必須項目です';
  }

  // 出欠バリデーション: '出席' または '欠席' 以外は無効
  const attendance = formData.attendance ?? '';
  if (attendance !== '出席' && attendance !== '欠席') {
    errors.attendance = '必須項目です';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * フォームデータからAPIに送信するJSONペイロードを生成する。
 * @param {{ name: string, attendance: string, allergy: string, message: string }} formData
 * @returns {{ name: string, attendance: string, allergy: string, message: string }}
 */
export function buildPayload(formData) {
  return {
    name: formData.name ?? '',
    attendance: formData.attendance ?? '',
    allergy: formData.allergy ?? '',
    message: formData.message ?? '',
  };
}

/**
 * GAS APIへデータを送信する（AbortController によるタイムアウト制御付き）。
 * @param {Object} data - 送信するフォームデータ
 * @param {string} apiEndpoint - GAS APIのURL
 * @param {number} [timeoutMs=30000] - タイムアウトまでのミリ秒
 * @returns {Promise<{result: 'success' | 'error', message?: string}>}
 */
export async function submitWithTimeout(data, apiEndpoint, timeoutMs = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // GAS Web App は CORS ヘッダーを返せないため no-cors モードで送信する。
    // no-cors では レスポンスボディを読めないが、送信自体は成功する。
    await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(data),
      signal: controller.signal,
      mode: 'no-cors',
    });
    // no-cors では常に opaque response が返るため、送信できたら成功とみなす
    return { result: 'success' };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * RSVPフォームコンポーネント。
 * フォームの表示・バリデーション・API送信を管理する。
 */
export const RsvpComponent = {
  /** @type {string} */
  _apiEndpoint: '',

  /**
   * コンポーネントを初期化する。
   * @param {{ apiEndpoint: string }} options
   */
  init(options) {
    this._apiEndpoint = options.apiEndpoint ?? '';

    const form = document.getElementById('rsvp-form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      // 前回のエラーメッセージをクリア
      this._clearErrors();

      // フォームデータを収集
      const formData = this._collectFormData(form);

      // バリデーション
      const { valid, errors } = validate(formData);
      if (!valid) {
        this._showFieldErrors(errors);
        return;
      }

      // 送信ボタンを無効化（二重送信防止）
      const submitBtn = document.getElementById('rsvp-submit');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const payload = buildPayload(formData);
        const result = await submitWithTimeout(payload, this._apiEndpoint);

        if (result && result.result === 'success') {
          // 成功: 完了メッセージを表示しフォームを非表示
          this._showSuccess();
        } else {
          // APIエラーレスポンス
          this._showError();
        }
      } catch (_err) {
        // ネットワークエラー・タイムアウト
        this._showError();
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  },

  /**
   * フォームを表示する（フェードインアニメーション）。
   * Requirements: 5.8, 6.3
   */
  show() {
    const form = document.getElementById('rsvp-form');
    if (!form) return;
    // クラスで表示制御（style属性より優先度が安定する）
    form.classList.remove('rsvp-form--hidden');
  },

  /**
   * フォームからデータを収集する。
   * @param {HTMLFormElement} form
   * @returns {{ name: string, attendance: string, allergy: string, message: string }}
   */
  _collectFormData(form) {
    const data = new FormData(form);
    return {
      name: data.get('name') ?? '',
      attendance: data.get('attendance') ?? '',
      allergy: data.get('allergy') ?? '',
      message: data.get('message') ?? '',
    };
  },

  /**
   * フィールドエラーメッセージをクリアする。
   */
  _clearErrors() {
    const nameError = document.getElementById('rsvp-name-error');
    const attendanceError = document.getElementById('rsvp-attendance-error');
    const globalError = document.getElementById('rsvp-error');

    if (nameError) nameError.textContent = '';
    if (attendanceError) attendanceError.textContent = '';
    if (globalError) globalError.textContent = '';
  },

  /**
   * フィールドごとのエラーメッセージを表示する。
   * @param {{ name?: string, attendance?: string }} errors
   */
  _showFieldErrors(errors) {
    if (errors.name) {
      const nameError = document.getElementById('rsvp-name-error');
      if (nameError) nameError.textContent = errors.name;
    }
    if (errors.attendance) {
      const attendanceError = document.getElementById('rsvp-attendance-error');
      if (attendanceError) attendanceError.textContent = errors.attendance;
    }
  },

  /**
   * 送信成功時の処理: 完了メッセージを表示しフォームを非表示にする。
   * Requirements: 5.8, 6.3
   */
  _showSuccess() {
    const form = document.getElementById('rsvp-form');
    const success = document.getElementById('rsvp-success');

    if (form) form.classList.add('rsvp-form--hidden');
    if (success) success.style.display = 'block';
  },

  /**
   * 送信失敗時の処理: 入力データを保持したままエラーメッセージを表示する。
   * Requirements: 5.7, 6.4
   */
  _showError() {
    const globalError = document.getElementById('rsvp-error');
    if (globalError) {
      globalError.textContent = '送信に失敗しました。もう一度お試しください。';
    }
  },
};

