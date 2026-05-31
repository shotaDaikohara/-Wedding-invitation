/**
 * Wedding Mystery Invitation - GAS API
 */

var SHEET_ID = '1ae4QbwIfSIr7Rx_tRNR1GupE9HudfuWuaLeuaUV-d-Y';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();

    sheet.appendRow([
      new Date().toISOString(),
      data.name || '',
      data.attendance || '',
      data.allergy || '',
      data.message || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
