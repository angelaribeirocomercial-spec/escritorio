const fs = require("node:fs");
const path = require("node:path");

const tsconfigPath = path.join(__dirname, "..", "tsconfig.json");
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));

if (Array.isArray(tsconfig.include)) {
  tsconfig.include = tsconfig.include.filter(
    (entry) => entry !== ".next/types/**/*.ts"
  );
}

fs.writeFileSync(tsconfigPath, `${JSON.stringify(tsconfig, null, 2)}\n`);
