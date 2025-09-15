import { getFilesSetup } from "./getFiles/mod.ts";
import { uploadFileSetup } from "./uploadFile/mod.ts";
import { serveFileSetup } from "./serveFile/mod.ts";

export const fileSetup = () => {
  getFilesSetup(), uploadFileSetup(), serveFileSetup();
};
