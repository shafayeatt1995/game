import fs from "fs";
import path from "path";

const THRESHOLD = 500;

// Directories or patterns to ignore
const IGNORED_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "dist",
  "build",
  "coverage",
  ".gemini",
  "prisma/migrations"
]);

const ALLOWED_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".css",
  ".json",
  ".prisma",
  ".md",
  ".html"
]);

interface FileResult {
  filePath: string;
  lines: number;
}

function countLinesInFile(filePath: string): number {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    if (!content) return 0;
    return content.split("\n").length;
  } catch {
    return 0;
  }
}

function scanDirectory(dirPath: string, results: FileResult[]) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        scanDirectory(fullPath, results);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (ALLOWED_EXTENSIONS.has(ext)) {
        const lines = countLinesInFile(fullPath);
        if (lines > THRESHOLD) {
          results.push({
            filePath: path.relative(process.cwd(), fullPath),
            lines,
          });
        }
      }
    }
  }
}

function main() {
  const results: FileResult[] = [];
  const rootDir = process.cwd();

  console.log(`\n🔍 Scanning project for files with more than ${THRESHOLD} lines of code...\n`);

  scanDirectory(rootDir, results);

  // Sort descending by line count
  results.sort((a, b) => b.lines - a.lines);

  if (results.length === 0) {
    console.log(`✅ Awesome! No files found with more than ${THRESHOLD} lines.\n`);
    return;
  }

  console.log(`⚠️  Found ${results.length} file(s) exceeding ${THRESHOLD} lines:\n`);
  console.log("----------------------------------------------------------------------");
  console.log(`  Lines\t| File Path`);
  console.log("----------------------------------------------------------------------");

  for (const item of results) {
    console.log(`  ${String(item.lines).padEnd(6)}\t| ${item.filePath}`);
  }

  console.log("----------------------------------------------------------------------\n");
}

main();
