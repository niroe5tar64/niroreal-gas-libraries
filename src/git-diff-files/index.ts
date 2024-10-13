import { formatDate } from "../common-module/date-utils";
import { getSheet } from "../common-module/sheet-access";
import { parseDiffFiles } from "./private/parse-diff-files";

const TARGET_SPREADSHEET_ID = "";
const TABLE_SHEET_ID = 0;
const FORM_SHEET_ID = 0;
const SELECT_INITIATIVE_NAME_CELL = "B1";
const INPUT_FOR_DIFF_FILES_CELL = "B2";
const DIFF_FILE_RANGE_IN_TABLE_SHEET = "A:F";

type DiffFile = {
  initiativeName: string;
  repositoryName: string;
  filePath: string;
};

export function execute() {
  const completedDiffFiles: DiffFile[] = [];
  const incomingDiffFiles = getIncomingDiffFiles();
  const sheet = getSheet({ spreadSheetId: TARGET_SPREADSHEET_ID, sheetId: TABLE_SHEET_ID });
  const rowValues = sheet.getRange(DIFF_FILE_RANGE_IN_TABLE_SHEET).getValues();
  const lastIndex = rowValues.findLastIndex((row) => row.some((cell) => cell)); // 1つでもtruthyな値がある
  const lastRowNumber = lastIndex + 1;

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
}

function getIncomingDiffFiles(): DiffFile[] {
  const sheet = getSheet({ spreadSheetId: TARGET_SPREADSHEET_ID, sheetId: FORM_SHEET_ID });
  const selectInitiativeNameCell = sheet.getRange(SELECT_INITIATIVE_NAME_CELL);
  const inputDiffFilesCell = sheet.getRange(INPUT_FOR_DIFF_FILES_CELL);

  const initiativeName = selectInitiativeNameCell.getValue();
  const inputText = inputDiffFilesCell.getValue();

  const repositoryFiles = parseDiffFiles(inputText);
  return repositoryFiles.map((obj) => {
    return { ...obj, initiativeName };
  });
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
