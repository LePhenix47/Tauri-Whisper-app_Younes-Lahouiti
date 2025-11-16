#!/usr/bin/env bun

/**
 * sync-windows-dlls.ts
 * Scans src-tauri/ for DLL files and automatically updates build configs
 */

import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join, resolve } from "path";

const PROJECT_ROOT = resolve(import.meta.dir, "..");
const SRC_TAURI_DIR = join(PROJECT_ROOT, "src-tauri");

function scanForDlls(directory: string): string[] {
  const dllFiles = readdirSync(directory)
    .filter((file: string) => file.endsWith(".dll"))
    .sort();

  return dllFiles;
}

function updateBuildRs(dllFiles: string[], buildRsPath: string): void {
  console.log("🔧 Updating build.rs...");

  const buildRsContent = readFileSync(buildRsPath, "utf-8");

  const dllList = dllFiles.map((dll) => `"${dll}"`).join(", ");

  const updatedContent = buildRsContent.replace(
    /"windows" => vec!\[.*?\],/,
    `"windows" => vec![${dllList}],`
  );

  writeFileSync(buildRsPath, updatedContent, "utf-8");
  console.log("   ✓ Updated build.rs\n");
}

function updateWindowsConfig(dllFiles: string[], configPath: string): void {
  console.log("🔧 Updating tauri.windows.conf.json...");

  const config = {
    bundle: {
      resources: dllFiles,
    },
  };

  writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
  console.log("   ✓ Updated tauri.windows.conf.json\n");
}

function printSummary(dllCount: number): void {
  console.log("✅ Sync complete!\n");
  console.log("📝 Summary:");

  const summary = [
    `Found ${dllCount} DLL files in src-tauri/`,
    "Updated build.rs",
    "Updated tauri.windows.conf.json",
  ] as const;

  for (const item of summary) {
    console.log(`   - ${item}`);
  }

  console.log("\n 💡 Next steps:");

  const nextSteps = [
    "Review the changes with: git diff",
    "Test the build with: bun run tauri:build",
    "Commit if everything looks good!",
  ] as const;

  for (let i = 0; i < nextSteps.length; i++) {
    const currentStep = nextSteps[i];
    const stepNumber = i + 1;

    console.log(`   ${stepNumber}. ${currentStep}`);
  }
}

function main(): void {
  console.log("🔄 Scanning for Windows DLL files in src-tauri/...");
  console.log(`   Directory: ${SRC_TAURI_DIR}\n`);

  const dllFiles = scanForDlls(SRC_TAURI_DIR);

  if (!dllFiles.length) {
    console.log("⚠️  No DLL files found in src-tauri/");
    process.exit(0);
  }

  console.log(`📦 Found ${dllFiles.length} DLL file(s):`);
  for (const dll of dllFiles) {
    console.log(`   - ${dll}`);
  }
  console.log("");

  const buildRsPath = join(SRC_TAURI_DIR, "build.rs");
  const windowsConfPath = join(SRC_TAURI_DIR, "tauri.windows.conf.json");

  updateBuildRs(dllFiles, buildRsPath);
  updateWindowsConfig(dllFiles, windowsConfPath);
  printSummary(dllFiles.length);
}

main();
