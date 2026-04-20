const { spawn } = require("node:child_process");

const command = process.argv[2];

if (!command || !["dev", "build", "start"].includes(command)) {
  console.error("Usage: node scripts/run-next.cjs <dev|build|start>");
  process.exit(1);
}

const nextBin = require.resolve("next/dist/bin/next");

const child = spawn(process.execPath, [nextBin, command], {
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_IGNORE_INCORRECT_LOCKFILE: "1"
  }
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
