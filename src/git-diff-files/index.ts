import { getIncomingDiffFiles } from "./private/form-sheet-operation";
import {
  insertNewDiffFileRows,
  updateAlreadyExistsDiffFileRows,
} from "./private/table-sheet-operation";

export type ConfigGitDiffFiles = {
  spreadSheetId: string;
  tableSheet: {
    id: number;
    diffFileRange: string;
    columnNumbers: ColumnNumbers;
  };
  formSheet: {
    id: number;
    selectInitiativeNameCell: string;
    inputForDiffFilesCell: string;
  };
};

export type ColumnNumbers = Record<
  "initiativeName" | "repositoryName" | "filePath" | "createdAt" | "updatedAt",
  number
>;

export type DiffFile = Record<"initiativeName" | "repositoryName" | "filePath", string>;

export function writeGitDiffFiles(config: ConfigGitDiffFiles) {
  const incomingDiffFiles = getIncomingDiffFiles(config);
  Logger.log(incomingDiffFiles);

  const updatedDiffFiles = updateAlreadyExistsDiffFileRows(config, incomingDiffFiles);
  Logger.log(updatedDiffFiles);

  const insertedDiffFiles = insertNewDiffFileRows(config, incomingDiffFiles, updatedDiffFiles);
  Logger.log(insertedDiffFiles);
}
