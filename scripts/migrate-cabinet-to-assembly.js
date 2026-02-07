#!/usr/bin/env node

/**
 * Migration script: Cabinet -> Assembly
 * Automates the renaming of Cabinet references to Assembly throughout the codebase
 *
 * Usage: node scripts/migrate-cabinet-to-assembly.js [--dry-run]
 */

const fs = require("fs");
const path = require("path");

const DRY_RUN = process.argv.includes("--dry-run");

// File patterns to search
const INCLUDE_PATTERNS = [
  "pages/**/*.tsx",
  "pages/**/*.ts",
  "components/**/*.tsx",
  "components/**/*.ts",
  "lib/**/*.ts",
  "lib/**/*.tsx",
];

// Files/folders to exclude
const EXCLUDE_PATTERNS = [
  "node_modules",
  ".next",
  "out",
  "data/cabinets", // Old folder, keep as-is
  "types/cabinet.ts", // Old file, will be removed
  "data/cabinets-loader.ts", // Old file, will be removed
  "pages/api/cabinets.ts", // Old file, will be removed
  "php-api/cabinets.php", // Old file, will be removed
];

// Replacement patterns
const REPLACEMENTS = [
  // TypeScript imports
  { from: /from ['"]@\/types\/cabinet['"]/g, to: 'from "@/types/assembly"' },
  { from: /import \{ Cabinet \}/g, to: "import { Assembly }" },
  { from: /import type \{ Cabinet \}/g, to: "import type { Assembly }" },

  // Type references
  { from: /: Cabinet\b/g, to: ": Assembly" },
  { from: /<Cabinet>/g, to: "<Assembly>" },
  { from: /Cabinet\[\]/g, to: "Assembly[]" },
  { from: /Cabinet \|/g, to: "Assembly |" },

  // Variable names (common patterns)
  { from: /const cabinet /g, to: "const assembly " },
  { from: /let cabinet /g, to: "let assembly " },
  { from: /\bcabinet\./g, to: "assembly." },
  { from: /\bcabinet\b\)/g, to: "assembly)" },
  { from: /\bcabinet,/g, to: "assembly," },
  { from: /\(cabinet\)/g, to: "(assembly)" },
  { from: /\{cabinet\}/g, to: "{assembly}" },

  // Array/collection names
  { from: /const cabinets /g, to: "const assemblies " },
  { from: /let cabinets /g, to: "let assemblies " },
  { from: /\bcabinets\./g, to: "assemblies." },
  { from: /\bcabinets\[/g, to: "assemblies[" },
  { from: /\bcabinets,/g, to: "assemblies," },
  { from: /\bcabinets\}/g, to: "assemblies}" },

  // Function names and parameters
  { from: /cabinetId/g, to: "assemblyId" },
  { from: /cabinetData/g, to: "assemblyData" },
  { from: /cabinetFile/g, to: "assemblyFile" },
  { from: /getCabinet\(/g, to: "getAssembly(" },
  { from: /getAllCabinets\(/g, to: "getAllAssemblies(" },
  { from: /getCabinetsByCategory\(/g, to: "getAssembliesByCategory(" },
  { from: /fetchCabinet/g, to: "fetchAssembly" },

  // API endpoints
  { from: /\/api\/cabinets/g, to: "/api/assemblies" },
  { from: /CABINETS_INDEX/g, to: "ASSEMBLIES_INDEX" },
  { from: /CABINETS_DIR/g, to: "ASSEMBLIES_DIR" },

  // Data file references
  { from: /cabinets-index\.json/g, to: "assemblies-index.json" },
  { from: /data\/cabinets\//g, to: "data/assemblies/" },
  { from: /cabinets-loader/g, to: "assemblies-loader" },

  // URL routes (careful with this one)
  { from: /\/cabinet\//g, to: "/assembly/" },
  { from: /router\.push\(['"]\/cabinet/g, to: "router.push('/assembly" },
  { from: /href=['"]\/cabinet/g, to: 'href="/assembly' },

  // Comments
  { from: /\/\/ Cabinet /g, to: "// Assembly " },
  { from: /\/\/ Fetch cabinet/g, to: "// Fetch assembly" },
  { from: /\/\/ Get cabinet/g, to: "// Get assembly" },
  { from: /\/\/ Update cabinet/g, to: "// Update assembly" },
  { from: /\/\/ Delete cabinet/g, to: "// Delete assembly" },
  { from: /\/\/ Create cabinet/g, to: "// Create assembly" },
];

function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some((pattern) => filePath.includes(pattern));
}

function processFile(filePath) {
  if (shouldExclude(filePath)) {
    return { processed: false };
  }

  try {
    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;
    let changeCount = 0;

    REPLACEMENTS.forEach(({ from, to }) => {
      const matches = content.match(from);
      if (matches) {
        content = content.replace(from, to);
        modified = true;
        changeCount += matches.length;
      }
    });

    if (modified) {
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, content, "utf8");
      }
      return { processed: true, changeCount };
    }

    return { processed: false };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return { processed: false, error: error.message };
  }
}

function walkDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);

    if (shouldExclude(filePath)) {
      return;
    }

    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDirectory(filePath, fileList);
    } else if (filePath.match(/\.(tsx?|jsx?)$/)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Main execution
console.log("🔄 Cabinet → Assembly Migration Script");
console.log(
  DRY_RUN
    ? "📋 DRY RUN MODE (no files will be modified)\n"
    : "✏️  LIVE MODE (files will be modified)\n",
);

const directories = ["pages", "components", "lib"];
let totalFiles = 0;
let processedFiles = 0;
let totalChanges = 0;

directories.forEach((dir) => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directory not found: ${dir}`);
    return;
  }

  console.log(`📁 Processing ${dir}/...`);
  const files = walkDirectory(dirPath);

  files.forEach((filePath) => {
    totalFiles++;
    const result = processFile(filePath);

    if (result.processed) {
      processedFiles++;
      totalChanges += result.changeCount;
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`  ✅ ${relativePath} (${result.changeCount} changes)`);
    }
  });
});

console.log(`\n📊 Summary:`);
console.log(`   Files scanned: ${totalFiles}`);
console.log(`   Files modified: ${processedFiles}`);
console.log(`   Total changes: ${totalChanges}`);

if (DRY_RUN) {
  console.log(`\n💡 Run without --dry-run to apply changes`);
} else {
  console.log(`\n✨ Migration complete!`);
}
