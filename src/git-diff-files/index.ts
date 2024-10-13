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
  };
  formSheet: {
    id: number;
    selectInitiativeNameCell: string;
    inputForDiffFilesCell: string;
  };
};

export type DiffFile = {
  initiativeName: string;
  repositoryName: string;
  filePath: string;
};

export function writeGitDiffFiles(config: ConfigGitDiffFiles) {
  const incomingDiffFiles = getIncomingDiffFiles(config);
  Logger.log(incomingDiffFiles);

  const updatedDiffFiles = updateAlreadyExistsDiffFileRows(config, incomingDiffFiles);
  Logger.log(updatedDiffFiles);

  const insertedDiffFiles = insertNewDiffFileRows(config, incomingDiffFiles, updatedDiffFiles);
  Logger.log(insertedDiffFiles);
}
