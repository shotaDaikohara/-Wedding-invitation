/**
 * Wedding Mystery Invitation - GAS API
 *
 * Google Apps Script Web App エンドポイント。
 * ゲストの出欠回答データを受け取り、Googleスプレッドシートに記録する。
 *
 * スプレッドシートの列構成:
 *   A: タイムスタンプ（ISO 8601）
 *   B: 氏名（name）
 *   C: 出欠（attendance）
 *   D: アレルギー等（allergy）
 *   E: メッセージ（message）
 */

/**
 * HTTP POST リクエストを処理する。
 * リクエストボディの JSON をパースし、スプレッドシートの最終行に追記する。
 *
 * @param {Object} e - GAS イベントオブジェクト
 * @returns {ContentService.TextOutput} JSON レスポンス
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    var timestamp = new Date().toISOString();
    var name = data.name || '';
    var attendance = data.attendance || '';
    var allergy = data.allergy || '';
    var message = data.message || '';

    sheet.appendRow([timestamp, name, attendance, allergy, message]);

    return buildResponse({ result: 'success' });
  } catch (err) {
    return buildResponse({ result: 'error', message: err.message });
  }
}

/**
 * HTTP OPTIONS リクエスト（CORS プリフライト）を処理する。
 * Access-Control-Allow-Origin: * を含むレスポンスを返す。
 *
 * @param {Object} e - GAS イベントオブジェクト
 * @returns {ContentService.TextOutput} CORS プリフライトレスポンス
 */
function doOptions(e) {
  return buildResponse({ result: 'success' });
}

/**
 * CORS ヘッダーを付与した JSON レスポンスを生成する。
 *
 * @param {Object} payload - レスポンスボディとして返すオブジェクト
 * @returns {ContentService.TextOutput} JSON レスポンス
 */
function buildResponse(payload) {
  var output = ContentService.createTextOutput(JSON.stringify(payload));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
