const fs = require("fs");
const path = require("path");

/**
 * Auto-generate assemblies-loader.ts based on actual assembly files
 * This keeps the loader in sync with the file system
 */

const assembliesDir = path.join(__dirname, "..", "data", "assemblies");
const loaderPath = path.join(__dirname, "..", "data", "assemblies-loader.ts");

// Get all assembly JSON files
const files = fs.readdirSync(assembliesDir).filter((f) => f.endsWith(".json"));
const assemblyIds = files.map((f) => f.replace(".json", ""));

console.log(`Found ${files.length} assembly file(s):`);
assemblyIds.forEach((id) => console.log(`  - ${id}`));

// Generate the loader file content
const loaderContent = `import { Assembly } from "@/types/assembly";

// Import the index file (metadata only)
import assembliesIndex from "./assemblies-index.json";

// Dynamically import assembly files as needed
// This works with static export because imports are resolved at build time
// AUTO-GENERATED - DO NOT EDIT MANUALLY
// Run: npm run generate:loader to regenerate this file
const assemblyFiles: Record<string, () => Promise<{ default: Assembly }>> = {
${assemblyIds
  .map(
    (id) =>
      `  "${id}": () => import("./assemblies/${id}.json").then((m) => m as any),`,
  )
  .join("\n")}
};

/**
 * Get list of all assemblies with metadata (no step details)
 */
export function getAllAssemblies(): Omit<Assembly, "steps">[] {
  return assembliesIndex.assemblies as any;
}

/**
 * Get a specific assembly with full details including steps
 * Returns the assembly data synchronously by importing it directly
 */
export function getAssembly(assemblyId: string): Assembly | null {
  try {
    // Get metadata from index
    const metadata = assembliesIndex.assemblies.find(
      (c) => c.id === assemblyId,
    );
    if (!metadata) {
      return null;
    }

    // Load steps from separate file if it exists
    let steps: any[] = [];
    try {
      // AUTO-GENERATED SWITCH STATEMENT
      switch (assemblyId) {
${assemblyIds
  .map(
    (id) => `        case "${id}":
          const ${id.replace(/-/g, "_")}Data = require("./assemblies/${id}.json");
          steps = ${id.replace(/-/g, "_")}Data.steps || [];
          break;`,
  )
  .join("\n")}
        default:
          steps = [];
      }
    } catch (error) {
      // Steps file doesn't exist yet, that's okay
      steps = [];
    }

    // Merge metadata with steps
    return {
      ...metadata,
      steps,
    } as Assembly;
  } catch (error) {
    return null;
  }
}

/**
 * Get all assembly IDs (for generating static paths)
 */
export function getAllAssemblyIds(): string[] {
  return assembliesIndex.assemblies.map((c) => c.id);
}

/**
 * Filter assemblies by category
 */
export function getAssembliesByCategory(
  category: string,
): Omit<Assembly, "steps">[] {
  return assembliesIndex.assemblies.filter(
    (c) => c.category === category,
  ) as any;
}

// Legacy support: Export all assemblies data (loads ALL files)
// Use sparingly as this loads all assembly data
export function getAllAssembliesWithSteps(): { assemblies: Assembly[] } {
  const assemblies: Assembly[] = [];

  // Load each assembly
  assembliesIndex.assemblies.forEach((meta) => {
    const assembly = getAssembly(meta.id);
    if (assembly) {
      assemblies.push(assembly);
    }
  });

  return { assemblies };
}
`;

// Write the loader file
fs.writeFileSync(loaderPath, loaderContent, "utf8");

console.log("\n✅ Generated assemblies-loader.ts");
console.log(`   ${assemblyIds.length} assembly import(s) added`);
