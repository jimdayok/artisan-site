import { spawn } from "node:child_process";

const steps = [
  "portal:generate-dashboard-v1:launch-safe",
  "portal:bundle-dashboard-v1",
  "locator:generate",
  "pricing:generate-dvi",
  "pricing:generate",
  "pricing:normalize",
  "pricing:registry",
];

function runStep(step) {
  return new Promise((resolve, reject) => {
    const child = spawn("npm", ["run", step], {
      stdio: "inherit",
      env: process.env,
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`Step ${step} terminated with signal ${signal}`));
        return;
      }
      if (code !== 0) {
        reject(new Error(`Step ${step} exited with code ${code}`));
        return;
      }
      resolve();
    });
  });
}

async function main() {
  for (const step of steps) {
    await runStep(step);
  }
}

main().catch((error) => {
  console.error(`[prebuild] failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
