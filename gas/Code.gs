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
      data.email || '',
      data.attendance || '',
      data.allergy || '',
      data.message || ''
    ]);

    // 確認メールを送信
    if (data.email) {
      sendConfirmationEmail(data);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendConfirmationEmail(data) {
  var subject = '【ご回答確認】ウェディング招待状へのご回答ありがとうございます';
  var body = data.name + ' 様\n\n'
    + 'この度はご回答いただきありがとうございます。\n'
    + '以下の内容で承りました。\n\n'
    + '━━━━━━━━━━━━━━━━━━━━\n'
    + 'お名前：' + data.name + '\n'
    + 'ご出欠：' + data.attendance + '\n'
    + (data.allergy ? 'アレルギー等：' + data.allergy + '\n' : '')
    + (data.message ? 'メッセージ：' + data.message + '\n' : '')
    + '━━━━━━━━━━━━━━━━━━━━\n\n'
    + 'ご不明な点がございましたら、新郎新婦までお気軽にご連絡ください。\n\n'
    + '心よりお待ち申し上げております。';

  GmailApp.sendEmail(data.email, subject, body);
}
