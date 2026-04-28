const fs = require("node:fs");
const path = require("node:path");

const rootDir = process.cwd();
const groups = [
  { title: "MIGRATIONS", dir: "supabase/migrations" },
  { title: "POLICIES", dir: "supabase/policies" },
  { title: "SEEDS", dir: "supabase/seeds" }
];

function readSqlFiles(relativeDir) {
  const absoluteDir = path.join(rootDir, relativeDir);

  return fs
    .readdirSync(absoluteDir)
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort()
    .map((fileName) => ({
      fileName,
      contents: fs.readFileSync(path.join(absoluteDir, fileName), "utf8").trim()
    }));
}

const outputParts = [
  "-- AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.",
  "-- Run this in the Supabase SQL Editor to bootstrap the current project schema."
];

for (const group of groups) {
  outputParts.push("");
  outputParts.push(`-- ===== ${group.title} =====`);

  for (const file of readSqlFiles(group.dir)) {
    outputParts.push("");
    outputParts.push(`-- >>> ${group.dir}/${file.fileName}`);
    outputParts.push(file.contents);

    if (!file.contents.endsWith(";")) {
      outputParts.push(";");
    }
  }
}

const outDir = path.join(rootDir, "supabase/out");
const outFile = path.join(outDir, "001_full_bootstrap.sql");

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, `${outputParts.join("\n")}\n`, "utf8");

console.log(outFile);
