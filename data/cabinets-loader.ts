import { Cabinet } from "@/types/cabinet";

// Import the index file (metadata only)
import cabinetsIndex from "./cabinets-index.json";

// Dynamically import cabinet files as needed
// This works with static export because imports are resolved at build time
const cabinetFiles: Record<string, () => Promise<{ default: Cabinet }>> = {
  "BC-002": () => import("./cabinets/BC-002.json").then((m) => m as any),
  // Add more cabinets here as they are created
};

/**
 * Get list of all cabinets with metadata (no step details)
 */
export function getAllCabinets(): Omit<Cabinet, "steps">[] {
  return cabinetsIndex.cabinets as any;
}

/**
 * Get a specific cabinet with full details including steps
 * Returns the cabinet data synchronously by importing it directly
 */
export function getCabinet(cabinetId: string): Cabinet | null {
  try {
    // Get metadata from index
    const metadata = cabinetsIndex.cabinets.find((c) => c.id === cabinetId);
    if (!metadata) {
      return null;
    }

    // Load steps from separate file if it exists
    let steps: any[] = [];
    try {
      switch (cabinetId) {
        case "BC-002":
          const cabinetData = require("./cabinets/BC-002.json");
          steps = cabinetData.steps || [];
          break;
        // Add more cases as cabinets are added
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
    } as Cabinet;
  } catch (error) {
    return null;
  }
}

/**
 * Get all cabinet IDs (for generating static paths)
 */
export function getAllCabinetIds(): string[] {
  return cabinetsIndex.cabinets.map((c) => c.id);
}

/**
 * Filter cabinets by category
 */
export function getCabinetsByCategory(
  category: string,
): Omit<Cabinet, "steps">[] {
  return cabinetsIndex.cabinets.filter((c) => c.category === category) as any;
}

// Legacy support: Export all cabinets data (loads ALL files)
// Use sparingly as this loads all cabinet data
export function getAllCabinetsWithSteps(): { cabinets: Cabinet[] } {
  const cabinets: Cabinet[] = [];

  // Load each cabinet
  cabinetsIndex.cabinets.forEach((meta) => {
    const cabinet = getCabinet(meta.id);
    if (cabinet) {
      cabinets.push(cabinet);
    }
  });

  return { cabinets };
}
