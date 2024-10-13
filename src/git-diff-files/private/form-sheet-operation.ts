import { getSheet } from "../../common-module/sheet-access";
import type { ConfigGitDiffFiles, DiffFile } from "../index";

export function getIncomingDiffFiles(config: ConfigGitDiffFiles): DiffFile[] {
  const sheet = getSheet({ spreadSheetId: config.spreadSheetId, sheetId: config.formSheet.id });
  const selectInitiativeNameCell = sheet.getRange(config.formSheet.selectInitiativeNameCell);
  const inputDiffFilesCell = sheet.getRange(config.formSheet.inputForDiffFilesCell);

  const initiativeName = selectInitiativeNameCell.getValue();
  const inputText = inputDiffFilesCell.getValue();

  const repositoryFiles = parseDiffFiles(inputText);
  return repositoryFiles.map((obj) => {
    return { ...obj, initiativeName };
  });
}

function parseDiffFiles(inputText: string): { repositoryName: string; filePath: string }[] {
  const inputLines = inputText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  let processingRepository = "";
  const result = [];
  for (const line of inputLines) {
    const repositoryName = extractRepository(line);
    if (repositoryName) {
      processingRepository = repositoryName;
      continue;
    }

    if (!processingRepository) {
      Logger.log("レポジトリが指定されていません");
      throw new Error("レポジトリが指定されていません");
    }
    if (!validFilePath) {
      Logger.log(`無効な文字列が含まれています: ${line}`);
      throw new Error(`無効な文字列が含まれています: ${line}`);
    }

    result.push({ repositoryName: processingRepository, filePath: line });
  }

  return result;
}

function extractRepository(text: string): string | null {
  const regex = /^\[(.+)\]$/;
  const match = text.match(regex);

  return match ? match[1] : null;
}

function validFilePath(filePath: string) {
  // ファイルパスに無効な文字が含まれていないかチェックする正規表現
  const regex = /^(\/|\.\/|\.\.\/)?([\w\-.]+\/)*[\w\-.]*$/;
  return regex.test(filePath);
}
