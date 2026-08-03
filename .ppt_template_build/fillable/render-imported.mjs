import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const source = "/Users/zaidlakhel/Documents/Claude/Projects/SEARULEA/PowerPoint_Template/SEARULEA_Ready_to_Fill_Template.pptx";
const out = "/Users/zaidlakhel/Documents/Claude/Projects/SEARULEA/.ppt_template_build/fillable/imported-render";
await fs.mkdir(out, { recursive: true });
const presentation = await PresentationFile.importPptx(await FileBlob.load(source));
for (const n of [4, 13, 29, 30, 31, 39, 47, 48, 55]) {
  const slide = presentation.slides.items[n - 1];
  const blob = await presentation.export({ slide, format: "png", scale: 1 });
  await fs.writeFile(path.join(out, `slide-${n}.png`), new Uint8Array(await blob.arrayBuffer()));
}
