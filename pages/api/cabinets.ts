import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const CABINETS_INDEX_FILE = path.join(
  process.cwd(),
  "data",
  "cabinets-index.json",
);
const CABINETS_DIR = path.join(process.cwd(), "data", "cabinets");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Check if we're in a serverless environment (Vercel) for write operations
  if (process.env.VERCEL && req.method !== "GET") {
    return res.status(503).json({
      message:
        "Admin panel is not available in production. Please run locally for content management.",
      error: "READ_ONLY_FILESYSTEM",
    });
  }

  // Auth check - only required for write operations (POST, PUT, DELETE)
  // GET requests are public for viewing cabinets
  if (req.method !== "GET") {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  }

  try {
    // Read cabinets index data
    const fileContents = fs.readFileSync(CABINETS_INDEX_FILE, "utf8");
    const data = JSON.parse(fileContents);

    switch (req.method) {
      case "GET":
        // Get all cabinets or single cabinet by ID
        if (req.query.id) {
          const cabinet = data.cabinets.find((c: any) => c.id === req.query.id);
          if (!cabinet) {
            return res.status(404).json({ message: "Cabinet not found" });
          }

          // Load steps/animation data from separate file if it exists
          const cabinetFile = path.join(CABINETS_DIR, `${req.query.id}.json`);
          if (fs.existsSync(cabinetFile)) {
            const cabinetData = JSON.parse(
              fs.readFileSync(cabinetFile, "utf8"),
            );
            return res
              .status(200)
              .json({ ...cabinet, steps: cabinetData.steps || [] });
          }

          return res.status(200).json({ ...cabinet, steps: [] });
        }
        return res.status(200).json(data.cabinets);

      case "POST":
        // Create new cabinet
        const newCabinet = req.body;

        // Validate required fields
        if (!newCabinet.id || !newCabinet.name?.en || !newCabinet.category) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        // Check for duplicate ID
        if (data.cabinets.some((c: any) => c.id === newCabinet.id)) {
          return res.status(409).json({ message: "Cabinet ID already exists" });
        }

        // Separate metadata from steps/animation
        const { steps, ...cabinetMetadata } = newCabinet;
        cabinetMetadata.stepCount = steps?.length || 0;

        // Add cabinet metadata to index
        data.cabinets.push(cabinetMetadata);
        fs.writeFileSync(CABINETS_INDEX_FILE, JSON.stringify(data, null, 2));

        // Save steps/animation to separate file if exists
        if (steps && steps.length > 0) {
          const newCabinetFile = path.join(
            CABINETS_DIR,
            `${newCabinet.id}.json`,
          );
          fs.writeFileSync(
            newCabinetFile,
            JSON.stringify(
              {
                id: newCabinet.id,
                steps,
              },
              null,
              2,
            ),
          );
        }

        return res.status(201).json(newCabinet);

      case "PUT":
        // Update existing cabinet
        const updatedCabinet = req.body;
        const index = data.cabinets.findIndex(
          (c: any) => c.id === updatedCabinet.id,
        );

        if (index === -1) {
          return res.status(404).json({ message: "Cabinet not found" });
        }

        // Separate metadata from steps/animation
        const { steps: updatedSteps, ...updatedMetadata } = updatedCabinet;
        updatedMetadata.stepCount = updatedSteps?.length || 0;

        // Update cabinet metadata in index
        data.cabinets[index] = updatedMetadata;
        fs.writeFileSync(CABINETS_INDEX_FILE, JSON.stringify(data, null, 2));

        // Update steps/animation in separate file
        const updateCabinetFile = path.join(
          CABINETS_DIR,
          `${updatedCabinet.id}.json`,
        );
        if (updatedSteps && updatedSteps.length > 0) {
          fs.writeFileSync(
            updateCabinetFile,
            JSON.stringify(
              {
                id: updatedCabinet.id,
                steps: updatedSteps,
              },
              null,
              2,
            ),
          );
        } else if (fs.existsSync(updateCabinetFile)) {
          // Delete animation file if no steps
          fs.unlinkSync(updateCabinetFile);
        }

        return res.status(200).json(updatedCabinet);

      case "DELETE":
        // Delete cabinet
        const deleteId = req.query.id as string;
        const deleteIndex = data.cabinets.findIndex(
          (c: any) => c.id === deleteId,
        );

        if (deleteIndex === -1) {
          return res.status(404).json({ message: "Cabinet not found" });
        }

        // Remove from index
        data.cabinets.splice(deleteIndex, 1);
        fs.writeFileSync(CABINETS_INDEX_FILE, JSON.stringify(data, null, 2));

        // Delete animation file if exists
        const deleteCabinetFile = path.join(CABINETS_DIR, `${deleteId}.json`);
        if (fs.existsSync(deleteCabinetFile)) {
          fs.unlinkSync(deleteCabinetFile);
        }

        return res
          .status(200)
          .json({ message: "Cabinet deleted successfully" });

      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
