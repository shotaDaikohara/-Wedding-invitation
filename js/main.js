/**
 * main.js — アプリケーション初期化・フェーズ管理
 *
 * フェーズ遷移:
 *   Phase 1: 封筒表示 → シーリングスタンプクリックで開封
 *   Phase 2: 手紙出現 → 謎解き（またはスキップ）
 *   Phase 3: RSVPフォーム入力・送信
 */

import { EnvelopeComponent } from './envelope.js';
import { MysteryComponent } from './mystery.js';
import { RsvpComponent } from './rsvp.js';

// ---------------------------------------------------------------------------
// アプリケーション状態
// ---------------------------------------------------------------------------

/**
 * @type {{ phase: 1|2|3, isAnimating: boolean, failCount: number }}
 */
export const AppState = {
  phase: 1,           // 現在のフェーズ（1 | 2 | 3）
  isAnimating: false, // アニメーション中フラグ
  failCount: 0,       // 謎解き失敗回数
};

// ---------------------------------------------------------------------------
// フェーズ遷移ヘルパー
// ---------------------------------------------------------------------------

/**
 * 指定フェーズのセクションを表示し、他を非表示にする。
 * @param {1|2|3} nextPhase
 */
function transitionToPhase(nextPhase) {
  const phaseIds = {
    1: 'phase-envelope',
    2: 'phase-letter',
    3: 'phase-rsvp',
  };

  Object.entries(phaseIds).forEach(([phase, id]) => {
    const el = document.getElementById(id);
    if (!el) return;

    if (Number(phase) === nextPhase) {
      el.classList.remove('phase--hidden');
      el.classList.add('phase--active');
    } else {
      el.classList.remove('phase--active');
      el.classList.add('phase--hidden');
    }
  });

  AppState.phase = nextPhase;
}

// ---------------------------------------------------------------------------
// DOMContentLoaded 初期化処理
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  // Phase 1: 封筒コンポーネントの初期化
  // （envelope.js が実装されたら EnvelopeComponent.init() をここで呼び出す）
  initEnvelope();

  // Phase 3: RSVPコンポーネントの初期化
  initRsvp();
});

// ---------------------------------------------------------------------------
// 封筒コンポーネント初期化
// ---------------------------------------------------------------------------

function initEnvelope() {
  EnvelopeComponent.init({
    onOpenComplete: () => {
      AppState.isAnimating = false;
      transitionToPhase(2);
      initLetter();
    },
  });
}

// ---------------------------------------------------------------------------
// 手紙コンポーネント（LetterComponent）
// ---------------------------------------------------------------------------

/**
 * 手紙コンポーネント。
 * `.letter` 要素に `.letter--visible` クラスを付与して出現アニメーションを開始する。
 */
export const LetterComponent = {
  /**
   * 手紙を封筒から出現させる。
   * `.letter--visible` クラスを付与することで CSS アニメーション
   * （translateY: 100% → 0%、duration: 0.9s、ease-out）を開始する。
   * Requirements: 2.1, 2.3, 2.6
   */
  reveal() {
    const letterEl = document.querySelector('.letter');
    if (!letterEl) return;
    // 何もしない — letter は phase--active になれば自動的に表示される
  },
};

// ---------------------------------------------------------------------------
// 手紙コンポーネント初期化
// ---------------------------------------------------------------------------

function initLetter() {
  LetterComponent.reveal();
  initMystery();
}

// ---------------------------------------------------------------------------
// 謎解きコンポーネント初期化
// ---------------------------------------------------------------------------

function initMystery() {
  MysteryComponent.init({
    answer: 'TANBO',
    onSolve: () => {
      transitionToPhase(3);
      RsvpComponent.show();
    },
  });
}

// ---------------------------------------------------------------------------
// RSVPコンポーネント初期化（タスク 7.5 で完全実装予定）
// ---------------------------------------------------------------------------

function initRsvp() {
  RsvpComponent.init({
    apiEndpoint: 'https://script.google.com/macros/s/AKfycbzIvu6WrUm7TlFBQZsIbza9UJY6Inh3Ceasl39_egUShYZhUkBdoYkiucqBu6ouTbl0/exec',
  });
}
