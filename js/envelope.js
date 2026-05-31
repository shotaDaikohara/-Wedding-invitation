/**
 * envelope.js — Phase 1: 封筒開封アニメーション制御
 *
 * 開封シーケンス:
 *   1. pointer-events: none を設定（追加クリック無効化）
 *   2. .stamp-breaking クラス付与（スタンプ割れアニメーション 0.4s）
 *   3. 400ms 後に .flap-opening クラス付与（封筒蓋開きアニメーション 0.8s）
 *   4. 800ms 後に onOpenComplete() 呼び出し
 */

/**
 * @type {{
 *   _onOpenComplete: Function|null,
 *   init: (options: { onOpenComplete: Function }) => void,
 *   startOpenSequence: () => void,
 * }}
 */
export const EnvelopeComponent = {
  /** @type {Function|null} */
  _onOpenComplete: null,

  /**
   * 初期化。Sealing_Stamp にクリックイベントを登録する。
   * @param {{ onOpenComplete: Function }} options
   */
  init(options) {
    this._onOpenComplete = options?.onOpenComplete ?? null;

    const stamp = document.querySelector('.sealing-stamp');
    if (!stamp) return;

    stamp.addEventListener('click', () => {
      this.startOpenSequence();
    });
  },

  /**
   * 開封シーケンスを開始する。
   * アニメーション中は追加クリックを無効化する。
   */
  startOpenSequence() {
    const stamp = document.querySelector('.sealing-stamp');
    const flap = document.querySelector('.envelope-flap');

    if (!stamp || !flap) return;

    // Step 1: pointer-events: none で追加クリックを無効化
    stamp.style.pointerEvents = 'none';

    // Step 2: スタンプ割れアニメーション開始
    stamp.classList.add('stamp-breaking');

    // Step 3: 400ms 後に封筒蓋開きアニメーション開始
    setTimeout(() => {
      flap.classList.add('flap-opening');

      // Step 4: 800ms 後に onOpenComplete() 呼び出し
      setTimeout(() => {
        if (typeof this._onOpenComplete === 'function') {
          this._onOpenComplete();
        }
      }, 800);
    }, 400);
  },
};
