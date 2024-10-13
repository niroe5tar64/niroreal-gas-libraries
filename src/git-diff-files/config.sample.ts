import type { ConfigGitDiffFiles } from "./index.ts";

const config: ConfigGitDiffFiles = {
  spreadSheetId: "",
  tableSheet: {
    id: 0,
    diffFileRange: "A:F",
    columnNumbers: {
      initiativeName: 2, // B列
      repositoryName: 3, // C列
      filePath: 4, // D列
      createdAt: 5, // E列
      updatedAt: 6, // F列
    },
  },
  formSheet: {
    id: 123456789,
    selectInitiativeNameCell: "B1",
    inputForDiffFilesCell: "B2",
  },
};

export default config;
