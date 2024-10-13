import { formatDate } from "../../common-module/date-utils";
import { getSheet } from "../../common-module/sheet-access";
import type { ConfigGitDiffFiles, DiffFile } from "../index";

export function updateAlreadyExistsDiffFileRows(
  config: ConfigGitDiffFiles,
  incomingDiffFiles: DiffFile[],
): DiffFile[] {
  const completedDiffFiles: DiffFile[] = [];
  const sheet = getSheet({ spreadSheetId: config.spreadSheetId, sheetId: config.tableSheet.id });
  const rowValues = sheet.getRange(config.tableSheet.diffFileRange).getValues();
  const lastIndex = rowValues.findLastIndex((row) => row.some((cell) => cell)); // 1つでもtruthyな値がある

  for (let index = 0; index < lastIndex + 1; index++) {
    const currentRowNumber = index + 1;
    const currentRow = rowValues[index];
    // 一致する差分ファイルを検索
    const targetDiffFile = incomingDiffFiles.find(
      (file) =>
        file.initiativeName === currentRow[1] &&
        file.repositoryName === currentRow[2] &&
        file.filePath === currentRow[3],
    );
    // 一致する差分ファイルが存在しない場合、次の行へ移る
    if (!targetDiffFile) {
      continue;
    }
    updateRows(sheet, currentRowNumber, targetDiffFile);
    completedDiffFiles.push(targetDiffFile);
  }
  return completedDiffFiles;
}

function updateRows(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  rowNumber: number,
  diffFile: DiffFile,
) {
  sheet.getRange(rowNumber, 2).setValue(diffFile.initiativeName);
  sheet.getRange(rowNumber, 3).setValue(diffFile.repositoryName);
  sheet.getRange(rowNumber, 4).setValue(diffFile.filePath);
  sheet.getRange(rowNumber, 6).setValue(formatDate(new Date(), "YYYY-MM-DD HH:mm:ss"));
}

export function insertNewDiffFileRows(
  config: ConfigGitDiffFiles,
  incomingDiffFiles: DiffFile[],
  completedDiffFiles: DiffFile[],
): DiffFile[] {
  const sheet = getSheet({ spreadSheetId: config.spreadSheetId, sheetId: config.tableSheet.id });
  const rowValues = sheet.getRange(config.tableSheet.diffFileRange).getValues();
  const lastIndex = rowValues.findLastIndex((row) => row.some((cell) => cell)); // 1つでもtruthyな値がある
  const lastRowNumber = lastIndex + 1;

  // completedDiffFilesに含まれていないファイルを取得
  const remainingDiffFiles = incomingDiffFiles.filter(
    (incomingFile) =>
      !completedDiffFiles.some(
        (completedFile) =>
          completedFile.initiativeName === incomingFile.initiativeName &&
          completedFile.repositoryName === incomingFile.repositoryName &&
          completedFile.filePath === incomingFile.filePath,
      ),
  );
  if (remainingDiffFiles.length) {
    insertRows(sheet, lastRowNumber + 1, remainingDiffFiles);
  }
  return remainingDiffFiles;
}

function insertRows(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  startRow: number,
  diffFiles: DiffFile[],
) {
  const nowDateTimeString = formatDate(new Date(), "YYYY-MM-DD HH:mm:ss");
  const rowValues = diffFiles.map((file) => {
    return [
      "STG",
      file.initiativeName,
      file.repositoryName,
      file.filePath,
      nowDateTimeString,
      nowDateTimeString,
    ];
  });
  sheet.getRange(startRow, 1, rowValues.length, rowValues[0].length).setValues(rowValues);
}
