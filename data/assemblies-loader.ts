import { Assembly } from "@/types/assembly";

// Import the index file (metadata only)
import assembliesIndex from "./assemblies-index.json";

// Dynamically import assembly files as needed
// This works with static export because imports are resolved at build time
// AUTO-GENERATED - DO NOT EDIT MANUALLY
// Run: npm run generate:loader to regenerate this file
const assemblyFiles: Record<string, () => Promise<{ default: Assembly }>> = {
  "BU-1D-600": () => import("./assemblies/BU-1D-600.json").then((m) => m as any),
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
        case "BU-1D-600":
          const BU_1D_600Data = require("./assemblies/BU-1D-600.json");
          steps = BU_1D_600Data.steps || [];
          break;
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
