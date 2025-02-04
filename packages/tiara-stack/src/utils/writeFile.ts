import fsp from "node:fs/promises";
import { dirname } from "pathe";

export const writeFile = async (file: string, contents: Buffer | string) => {
  await fsp.mkdir(dirname(file), { recursive: true });
  await fsp.writeFile(
    file,
    contents,
    typeof contents === "string" ? "utf8" : undefined,
  );
};
