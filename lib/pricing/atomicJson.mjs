import { createWriteStream } from "node:fs";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { once } from "node:events";
import path from "node:path";

function temporaryPathFor(filePath) {
  const token = `${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return path.join(path.dirname(filePath), `.${path.basename(filePath)}.${token}.tmp`);
}

export async function writeJsonAtomic(filePath, value, { pretty = true } = {}) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = temporaryPathFor(filePath);
  const payload = `${JSON.stringify(value, null, pretty ? 2 : 0)}\n`;
  try {
    await writeFile(temporaryPath, payload, { encoding: "utf8", flag: "wx" });
    await rename(temporaryPath, filePath);
  } catch (error) {
    await rm(temporaryPath, { force: true }).catch(() => {});
    throw error;
  }
}

export async function writeBufferAtomic(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = temporaryPathFor(filePath);
  try {
    await writeFile(temporaryPath, value, { flag: "wx" });
    await rename(temporaryPath, filePath);
  } catch (error) {
    await rm(temporaryPath, { force: true }).catch(() => {});
    throw error;
  }
}

async function writeChunk(stream, chunk) {
  if (!stream.write(chunk, "utf8")) await once(stream, "drain");
}

function indentJson(value, spaces) {
  const indentation = " ".repeat(spaces);
  return JSON.stringify(value, null, 2)
    .split("\n")
    .map((line) => `${indentation}${line}`)
    .join("\n");
}

async function writeArray(stream, values, indentation) {
  if (values.length === 0) return;
  await writeChunk(stream, "\n");
  for (let index = 0; index < values.length; index += 1) {
    if (index > 0) await writeChunk(stream, ",\n");
    await writeChunk(stream, indentJson(values[index], indentation));
  }
  await writeChunk(stream, `\n${" ".repeat(indentation - 2)}`);
}

export async function writeDviArtifactAtomic(filePath, payload, { onRowsWritten } = {}) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = temporaryPathFor(filePath);
  const stream = createWriteStream(temporaryPath, {
    encoding: "utf8",
    flags: "wx",
  });

  const streamFailure = new Promise((_, reject) => stream.once("error", reject));

  async function performWrite() {
    await writeChunk(stream, `{\n  "code": ${JSON.stringify(payload.code)},\n`);
    await writeChunk(stream, `  "listName": ${JSON.stringify(payload.listName)},\n`);
    await writeChunk(stream, '  "rows": [');
    for (let index = 0; index < payload.rows.length; index += 1) {
      if (index > 0) await writeChunk(stream, ",\n");
      else await writeChunk(stream, "\n");
      await writeChunk(stream, indentJson(payload.rows[index], 4));
      onRowsWritten?.(index + 1, payload.rows.length);
    }
    if (payload.rows.length > 0) await writeChunk(stream, "\n  ");
    await writeChunk(stream, '],\n  "scheduleCatalog": {\n    "coating": [');
    await writeArray(stream, payload.scheduleCatalog.coating, 6);
    await writeChunk(stream, '],\n    "addOn": [');
    await writeArray(stream, payload.scheduleCatalog.addOn, 6);
    await writeChunk(stream, `]\n  },\n  "generatedAt": ${JSON.stringify(payload.generatedAt)},\n`);
    await writeChunk(stream, `  "source": ${JSON.stringify(payload.source)}\n}\n`);
    stream.end();
    await once(stream, "close");
    await rename(temporaryPath, filePath);
  }

  try {
    await Promise.race([performWrite(), streamFailure]);
  } catch (error) {
    stream.destroy();
    await rm(temporaryPath, { force: true }).catch(() => {});
    throw error;
  }
}
