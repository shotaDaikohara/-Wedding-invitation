(() => {
  // js/envelope.js
  var EnvelopeComponent = {
    /** @type {Function|null} */
    _onOpenComplete: null,
    /**
     * 初期化。Sealing_Stamp にクリックイベントを登録する。
     * @param {{ onOpenComplete: Function }} options
     */
    init(options) {
      this._onOpenComplete = options?.onOpenComplete ?? null;
      const stamp = document.querySelector(".sealing-stamp");
      if (!stamp) return;
      stamp.addEventListener("click", () => {
        this.startOpenSequence();
      });
    },
    /**
     * 開封シーケンスを開始する。
     * アニメーション中は追加クリックを無効化する。
     */
    startOpenSequence() {
      const stamp = document.querySelector(".sealing-stamp");
      const flap = document.querySelector(".envelope-flap");
      const envelopeSection = document.getElementById("phase-envelope");
      if (!stamp || !flap) return;
      stamp.style.pointerEvents = "none";
      stamp.classList.add("stamp-breaking");
      setTimeout(() => {
        flap.classList.add("flap-opening");
        setTimeout(() => {
          if (envelopeSection) {
            envelopeSection.style.transition = "opacity 0.5s ease";
            envelopeSection.style.opacity = "0";
          }
          setTimeout(() => {
            if (typeof this._onOpenComplete === "function") {
              this._onOpenComplete();
            }
          }, 500);
        }, 2e3);
      }, 400);
    }
  };

  // js/mystery.js
  var ANSWER = "TANBO";
  function normalizeAnswer(input) {
    if (typeof input !== "string") return "";
    return input.replace(
      /[\uFF01-\uFF5E]/g,
      (ch) => String.fromCharCode(ch.charCodeAt(0) - 65248)
    ).toLowerCase().replace(/^[\s\u3000]+|[\s\u3000]+$/g, "");
  }
  function validate(input) {
    const normalized = normalizeAnswer(input);
    if (normalized === "") {
      return "empty";
    }
    if (normalized === normalizeAnswer(ANSWER)) {
      return "correct";
    }
    return "incorrect";
  }
  var MysteryComponent = {
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
      const submitBtn = document.querySelector(".mystery-submit-btn");
      const skipLink = document.getElementById("skip-link");
      if (submitBtn) {
        submitBtn.addEventListener("click", () => {
          this._handleSubmit();
        });
      }
      if (skipLink) {
        skipLink.addEventListener("click", (e) => {
          e.preventDefault();
          if (this._onSolve) {
            this._onSolve();
          }
        });
        skipLink.addEventListener("keydown", (e) => {
          if (e.key === " ") {
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
      const inputEl = document.getElementById("answer-input");
      const errorEl = document.getElementById("answer-error");
      if (!inputEl || !errorEl) return;
      const inputValue = inputEl.value;
      const result = validate(inputValue);
      if (result === "empty") {
        errorEl.textContent = "\u7B54\u3048\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044";
      } else if (result === "correct") {
        errorEl.textContent = "";
        if (this._onSolve) {
          this._onSolve();
        }
      } else {
        errorEl.textContent = "\u3082\u3046\u4E00\u5EA6\u8003\u3048\u3066\u307F\u3066\u304F\u3060\u3055\u3044";
        inputEl.value = "";
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
        const skipLink = document.getElementById("skip-link");
        if (skipLink) {
          skipLink.classList.add("skip-link--highlighted");
        }
      }
    }
  };

  // js/rsvp.js
  function validate2(formData) {
    const errors = {};
    const name = formData.name ?? "";
    if (/^[\s\u3000]*$/.test(name)) {
      errors.name = "\u5FC5\u9808\u9805\u76EE\u3067\u3059";
    }
    const attendance = formData.attendance ?? "";
    if (attendance !== "\u51FA\u5E2D" && attendance !== "\u6B20\u5E2D") {
      errors.attendance = "\u5FC5\u9808\u9805\u76EE\u3067\u3059";
    }
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }
  function buildPayload(formData) {
    return {
      name: formData.name ?? "",
      attendance: formData.attendance ?? "",
      allergy: formData.allergy ?? "",
      message: formData.message ?? ""
    };
  }
  async function submitWithTimeout(data, apiEndpoint, timeoutMs = 3e4) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(data),
        signal: controller.signal,
        mode: "no-cors"
      });
      return { result: "success" };
    } finally {
      clearTimeout(timeoutId);
    }
  }
  var RsvpComponent = {
    /** @type {string} */
    _apiEndpoint: "",
    /**
     * コンポーネントを初期化する。
     * @param {{ apiEndpoint: string }} options
     */
    init(options) {
      this._apiEndpoint = options.apiEndpoint ?? "";
      const form = document.getElementById("rsvp-form");
      if (!form) return;
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        this._clearErrors();
        const formData = this._collectFormData(form);
        const { valid, errors } = validate2(formData);
        if (!valid) {
          this._showFieldErrors(errors);
          return;
        }
        const submitBtn = document.getElementById("rsvp-submit");
        if (submitBtn) submitBtn.disabled = true;
        try {
          const payload = buildPayload(formData);
          const result = await submitWithTimeout(payload, this._apiEndpoint);
          if (result && result.result === "success") {
            this._showSuccess();
          } else {
            this._showError();
          }
        } catch (_err) {
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
      const form = document.getElementById("rsvp-form");
      if (!form) return;
      form.classList.remove("rsvp-form--hidden");
    },
    /**
     * フォームからデータを収集する。
     * @param {HTMLFormElement} form
     * @returns {{ name: string, attendance: string, allergy: string, message: string }}
     */
    _collectFormData(form) {
      const data = new FormData(form);
      return {
        name: data.get("name") ?? "",
        attendance: data.get("attendance") ?? "",
        allergy: data.get("allergy") ?? "",
        message: data.get("message") ?? ""
      };
    },
    /**
     * フィールドエラーメッセージをクリアする。
     */
    _clearErrors() {
      const nameError = document.getElementById("rsvp-name-error");
      const attendanceError = document.getElementById("rsvp-attendance-error");
      const globalError = document.getElementById("rsvp-error");
      if (nameError) nameError.textContent = "";
      if (attendanceError) attendanceError.textContent = "";
      if (globalError) globalError.textContent = "";
    },
    /**
     * フィールドごとのエラーメッセージを表示する。
     * @param {{ name?: string, attendance?: string }} errors
     */
    _showFieldErrors(errors) {
      if (errors.name) {
        const nameError = document.getElementById("rsvp-name-error");
        if (nameError) nameError.textContent = errors.name;
      }
      if (errors.attendance) {
        const attendanceError = document.getElementById("rsvp-attendance-error");
        if (attendanceError) attendanceError.textContent = errors.attendance;
      }
    },
    /**
     * 送信成功時の処理: 完了メッセージを表示しフォームを非表示にする。
     * Requirements: 5.8, 6.3
     */
    _showSuccess() {
      const form = document.getElementById("rsvp-form");
      const success = document.getElementById("rsvp-success");
      if (form) form.classList.add("rsvp-form--hidden");
      if (success) success.style.display = "block";
    },
    /**
     * 送信失敗時の処理: 入力データを保持したままエラーメッセージを表示する。
     * Requirements: 5.7, 6.4
     */
    _showError() {
      const globalError = document.getElementById("rsvp-error");
      if (globalError) {
        globalError.textContent = "\u9001\u4FE1\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u3082\u3046\u4E00\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002";
      }
    }
  };

  // js/main.js
  var AppState = {
    phase: 1,
    // 現在のフェーズ（1 | 2 | 3）
    isAnimating: false,
    // アニメーション中フラグ
    failCount: 0
    // 謎解き失敗回数
  };
  function transitionToPhase(nextPhase) {
    const phaseIds = {
      1: "phase-envelope",
      2: "phase-letter",
      3: "phase-rsvp"
    };
    Object.entries(phaseIds).forEach(([phase, id]) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (Number(phase) === nextPhase) {
        el.classList.remove("phase--hidden");
        el.classList.add("phase--active");
      } else {
        el.classList.remove("phase--active");
        el.classList.add("phase--hidden");
      }
    });
    AppState.phase = nextPhase;
  }
  document.addEventListener("DOMContentLoaded", () => {
    initEnvelope();
    initRsvp();
  });
  function initEnvelope() {
    EnvelopeComponent.init({
      onOpenComplete: () => {
        AppState.isAnimating = false;
        transitionToPhase(2);
        initLetter();
      }
    });
  }
  var LetterComponent = {
    /**
     * 手紙を封筒から出現させる。
     * `.letter--visible` クラスを付与することで CSS アニメーション
     * （translateY: 100% → 0%、duration: 0.9s、ease-out）を開始する。
     * Requirements: 2.1, 2.3, 2.6
     */
    reveal() {
      const letterEl = document.querySelector(".letter");
      if (!letterEl) return;
    }
  };
  function initLetter() {
    LetterComponent.reveal();
    initMystery();
  }
  function initMystery() {
    MysteryComponent.init({
      answer: "TANBO",
      onSolve: () => {
        transitionToPhase(3);
        RsvpComponent.show();
      }
    });
  }
  function initRsvp() {
    RsvpComponent.init({
      apiEndpoint: "https://script.google.com/macros/s/AKfycbxZ7pXb0RRAPUAPiJnpWX23zO7AuQFMqPjKmtlmPPMj-3baRkZJ9Hlhpl5x8JLyzAdJ/exec"
    });
  }
})();
