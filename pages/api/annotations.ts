import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { AnnotationCatalogItem } from "@/types/animation";

/**
 * API endpoint to list available annotation GLB files
 * GET /api/annotations - Returns list of available annotations
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnnotationCatalogItem[] | { error: string }>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const annotationsDir = path.join(
      process.cwd(),
      "public",
      "models",
      "annotations",
    );

    // Start with built-in text type
    const catalog: AnnotationCatalogItem[] = [
      { id: "text", name: "Text", filename: "", type: "text" },
    ];

    // Check if annotations directory exists
    if (fs.existsSync(annotationsDir)) {
      const files = fs.readdirSync(annotationsDir);
      const glbFiles = files.filter((f) => f.toLowerCase().endsWith(".glb"));
      const pngFiles = new Set(
        files.filter((f) => f.toLowerCase().endsWith(".png")),
      );

      for (const file of glbFiles) {
        const id = file.replace(/\.glb$/i, "");
        const name = formatAnnotationName(id);

        // Check for matching thumbnail
        const thumbnailFile = `${id}.png`;
        const thumbnail = pngFiles.has(thumbnailFile)
          ? `/models/annotations/${thumbnailFile}`
          : undefined;

        catalog.push({
          id,
          name,
          filename: file,
          type: "glb",
          thumbnail,
        });
      }
    }

    return res.status(200).json(catalog);
  } catch (error) {
    console.error("Error reading annotations directory:", error);
    return res.status(500).json({ error: "Failed to read annotations" });
  }
}

/**
 * Format annotation ID into display name
 * e.g., "arrows" -> "Arrows", "curved_arrow" -> "Curved Arrow"
 */
function formatAnnotationName(id: string): string {
  return id
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
