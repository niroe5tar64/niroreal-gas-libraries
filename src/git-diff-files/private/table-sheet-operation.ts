import { formatDate } from "../../common-module/date-utils";
import { getSheet } from "../../common-module/sheet-access";
import type { ColumnNumbers, ConfigGitDiffFiles, DiffFile } from "../index";

export function updateAlreadyExistsDiffFileRows(
  config: ConfigGitDiffFiles,
  incomingDiffFiles: DiffFile[],
): DiffFile[] {
  const completedDiffFiles: DiffFile[] = [];
  const sheet = getSheet({ spreadSheetId: config.spreadSheetId, sheetId: config.tableSheet.id });
  const rowValues = sheet.getRange(config.tableSheet.diffFileRange).getValues();
  const lastIndex = rowValues.findLastIndex((row) => row.some((cell) => cell)); // 1つでもtruthyな値がある

  const cns = { ...config.tableSheet.columnNumbers };

  for (let index = 0; index < lastIndex + 1; index++) {
    const currentRowNumber = index + 1;
    const currentRow = rowValues[index];
    // 一致する差分ファイルを検索
    const targetDiffFile = incomingDiffFiles.find(
      (file) =>
        file.initiativeName === currentRow[cns.initiativeName - 1] &&
        file.repositoryName === currentRow[cns.repositoryName - 1] &&
        file.filePath === currentRow[cns.filePath - 1],
    );
    // 一致する差分ファイルが存在しない場合、次の行へ移る
    if (!targetDiffFile) {
      continue;
    }
    updateRow(sheet, cns, currentRowNumber, targetDiffFile);
    completedDiffFiles.push(targetDiffFile);
  }
  return completedDiffFiles;
}

function updateRow(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  columnNumbers: ColumnNumbers,
  rowNumber: number,
  diffFile: DiffFile,
) {
  const cns = columnNumbers;
  // sheet.getRange(rowNumber, cns.initiativeName).setValue(diffFile.initiativeName);
  // sheet.getRange(rowNumber, cns.repositoryName).setValue(diffFile.repositoryName);
  // sheet.getRange(rowNumber, cns.filePath).setValue(diffFile.filePath);
  sheet.getRange(rowNumber, cns.updatedAt).setValue(formatDate(new Date(), "YYYY-MM-DD HH:mm:ss"));
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
    const cn = { ...config.tableSheet.columnNumbers };
    insertRows(sheet, cn, lastRowNumber + 1, remainingDiffFiles);
  }
  return remainingDiffFiles;
}

function insertRows(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  columnNumbers: ColumnNumbers,
  startRow: number,
  diffFiles: DiffFile[],
) {
  const maxCol = Math.max(...Object.values(columnNumbers));
  const emptyArray: (string | undefined)[] = new Array(maxCol).fill(undefined);
  const nowDateTimeString = formatDate(new Date(), "YYYY-MM-DD HH:mm:ss");

  const rowValues = diffFiles.map((file) => {
    const rowValue = [...emptyArray];

    const keys = Object.keys(columnNumbers);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i] as
        | "initiativeName"
        | "repositoryName"
        | "filePath"
        | "createdAt"
        | "updatedAt";

      const colIndex = columnNumbers[key] - 1;
      if (key === "createdAt" || key === "updatedAt") {
        rowValue[colIndex] = nowDateTimeString;
      } else {
        rowValue[colIndex] = file[key];
      }
    }

    rowValue[0] = "STG";
    return rowValue;
    // [example]
    //   rowValue = [
    //     "STG",
    //     file.initiativeName,
    //     file.repositoryName,
    //     file.filePath,
    //     nowDateTimeString,
    //     nowDateTimeString,
    //   ];
  });
  sheet.getRange(startRow, 1, rowValues.length, rowValues[0].length).setValues(rowValues);
}
