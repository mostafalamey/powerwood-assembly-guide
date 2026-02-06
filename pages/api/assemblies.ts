import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const ASSEMBLIES_INDEX_FILE = path.join(
  process.cwd(),
  "data",
  "assemblies-index.json",
);
const ASSEMBLIES_DIR = path.join(process.cwd(), "data", "assemblies");

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
  // GET requests are public for viewing assemblies
  if (req.method !== "GET") {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  }

  try {
    // Read assemblies index data
    const fileContents = fs.readFileSync(ASSEMBLIES_INDEX_FILE, "utf8");
    const data = JSON.parse(fileContents);

    switch (req.method) {
      case "GET":
        // Get all assemblies or single assembly by ID
        if (req.query.id) {
          const assembly = data.assemblies.find(
            (c: any) => c.id === req.query.id,
          );
          if (!assembly) {
            return res.status(404).json({ message: "Assembly not found" });
          }

          // Load steps/animation data from separate file if it exists
          const assemblyFile = path.join(
            ASSEMBLIES_DIR,
            `${req.query.id}.json`,
          );
          if (fs.existsSync(assemblyFile)) {
            const assemblyData = JSON.parse(
              fs.readFileSync(assemblyFile, "utf8"),
            );
            return res
              .status(200)
              .json({ ...assembly, steps: assemblyData.steps || [] });
          }

          return res.status(200).json({ ...assembly, steps: [] });
        }
        return res.status(200).json(data.assemblies);

      case "POST":
        // Create new assembly
        const newAssembly = req.body;

        // Validate required fields
        if (!newAssembly.id || !newAssembly.name?.en || !newAssembly.category) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        // Check for duplicate ID
        if (data.assemblies.some((c: any) => c.id === newAssembly.id)) {
          return res
            .status(409)
            .json({ message: "Assembly ID already exists" });
        }

        // Separate metadata from steps/animation
        const { steps, ...assemblyMetadata } = newAssembly;
        assemblyMetadata.stepCount = steps?.length || 0;

        // Add assembly metadata to index
        data.assemblies.push(assemblyMetadata);
        fs.writeFileSync(ASSEMBLIES_INDEX_FILE, JSON.stringify(data, null, 2));

        // Save steps/animation to separate file if exists
        if (steps && steps.length > 0) {
          const newAssemblyFile = path.join(
            ASSEMBLIES_DIR,
            `${newAssembly.id}.json`,
          );
          fs.writeFileSync(
            newAssemblyFile,
            JSON.stringify(
              {
                id: newAssembly.id,
                steps,
              },
              null,
              2,
            ),
          );
        }

        return res.status(201).json(newAssembly);

      case "PUT":
        // Update existing assembly
        const updatedAssembly = req.body;
        const index = data.assemblies.findIndex(
          (c: any) => c.id === updatedAssembly.id,
        );

        if (index === -1) {
          return res.status(404).json({ message: "Assembly not found" });
        }

        // Separate metadata from steps/animation
        const { steps: updatedSteps, ...updatedMetadata } = updatedAssembly;
        updatedMetadata.stepCount = updatedSteps?.length || 0;

        // Update assembly metadata in index
        data.assemblies[index] = updatedMetadata;
        fs.writeFileSync(ASSEMBLIES_INDEX_FILE, JSON.stringify(data, null, 2));

        // Update steps/animation in separate file
        const updateAssemblyFile = path.join(
          ASSEMBLIES_DIR,
          `${updatedAssembly.id}.json`,
        );
        if (updatedSteps && updatedSteps.length > 0) {
          fs.writeFileSync(
            updateAssemblyFile,
            JSON.stringify(
              {
                id: updatedAssembly.id,
                steps: updatedSteps,
              },
              null,
              2,
            ),
          );
        } else if (fs.existsSync(updateAssemblyFile)) {
          // Delete animation file if no steps
          fs.unlinkSync(updateAssemblyFile);
        }

        return res.status(200).json(updatedAssembly);

      case "DELETE":
        // Delete assembly
        const deleteId = req.query.id as string;
        const deleteIndex = data.assemblies.findIndex(
          (c: any) => c.id === deleteId,
        );

        if (deleteIndex === -1) {
          return res.status(404).json({ message: "Assembly not found" });
        }

        // Remove from index
        data.assemblies.splice(deleteIndex, 1);
        fs.writeFileSync(ASSEMBLIES_INDEX_FILE, JSON.stringify(data, null, 2));

        // Delete animation file if exists
        const deleteAssemblyFile = path.join(
          ASSEMBLIES_DIR,
          `${deleteId}.json`,
        );
        if (fs.existsSync(deleteAssemblyFile)) {
          fs.unlinkSync(deleteAssemblyFile);
        }

        return res
          .status(200)
          .json({ message: "Assembly deleted successfully" });

      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
