import type { ConfigGitDiffFiles } from "./index.ts";

const config: ConfigGitDiffFiles = {
  spreadSheetId: "",
  tableSheet: {
    id: 0,
    diffFileRange: "A:F",
  },
  formSheet: {
    id: 123456789,
    selectInitiativeNameCell: "B1",
    inputForDiffFilesCell: "B2",
  },
};

export default config;
