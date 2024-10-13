/**
 * 指定されたスプレッドシートIDとシートIDを元にシートを取得する関数。
 * スプレッドシートIDが指定されていない場合、現在アクティブなスプレッドシートを使用します。
 * シートIDが指定されていない場合、現在アクティブなシートを返します。
 *
 * @param {Object} ids - スプレッドシートIDとシートIDを指定するオブジェクト。
 * @param {string} [ids.spreadSheetId] - スプレッドシートのID。省略した場合、現在アクティブなスプレッドシートを使用。
 * @param {number} [ids.sheetId] - 取得するシートのID。省略した場合、アクティブなシートを返します。
 *
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} 指定されたIDのシートオブジェクト。
 *
 * @throws {Error} 指定されたシートIDが存在しない場合にエラーを投げます。
 *
 * @example
 * // アクティブなスプレッドシートのアクティブなシートを取得
 * const sheet = getSheet({});
 *
 * @example
 * // 特定のスプレッドシートとシートIDを指定してシートを取得
 * const sheet = getSheet({ spreadSheetId: '1A2B3C4D5E', sheetId: 123456 });
 */
function getSheet(ids: { spreadSheetId?: string; sheetId?: number }) {
  // スプレッドシートIDがあればそれを開き、なければアクティブなスプレッドシートを取得
  const spreadSheet = ids.spreadSheetId
    ? SpreadsheetApp.openById(ids.spreadSheetId)
    : SpreadsheetApp.getActive();

  // シートIDが指定されていない場合はアクティブシートを返す
  if (!ids.sheetId) {
    return spreadSheet.getActiveSheet();
  }

  // 全てのシートを取得し、シートIDで検索
  const sheets = spreadSheet.getSheets();
  const sheet = sheets.find((sheet) => sheet.getSheetId() === ids.sheetId);

  // シートが見つからなかった場合のエラーハンドリング
  if (!sheet) {
    Logger.log("シートが見つかりませんでした");
    throw new Error("指定されたシートIDが見つかりません");
  }

  return sheet;
}

export { getSheet };
