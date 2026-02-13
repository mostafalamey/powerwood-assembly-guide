import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const ASSEMBLIES_DIR = path.join(process.cwd(), "data", "assemblies");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  console.log(`[Animation API] ${req.method} request received`);
  console.log(`[Animation API] Query params:`, req.query);

  // Check if we're in a serverless environment (Vercel)
  if (process.env.VERCEL) {
    return res.status(503).json({
      message:
        "Admin panel is not available in production. Please run locally for content management.",
      error: "READ_ONLY_FILESYSTEM",
    });
  }

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id, stepId } = req.query;

  if (!id || !stepId) {
    return res.status(400).json({ message: "Missing assembly ID or step ID" });
  }

  try {
    // Read the assembly file
    const assemblyFile = path.join(ASSEMBLIES_DIR, `${id}.json`);
    console.log(`[Animation API] Looking for file:`, assemblyFile);
    console.log(`[Animation API] File exists:`, fs.existsSync(assemblyFile));

    if (!fs.existsSync(assemblyFile)) {
      console.log(`[Animation API] ERROR: Assembly file not found`);
      return res.status(404).json({ message: "Assembly not found" });
    }

    const assemblyData = JSON.parse(fs.readFileSync(assemblyFile, "utf8"));
    console.log(
      `[Animation API] Assembly data loaded, steps count:`,
      assemblyData.steps?.length,
    );

    // Find the step (compare as strings since JSON has string IDs)
    const stepIndex = assemblyData.steps?.findIndex(
      (s: any) => s.id === stepId || s.id === parseInt(stepId as string),
    );
    console.log(`[Animation API] Looking for step ID:`, stepId);
    console.log(`[Animation API] Step index found:`, stepIndex);
    console.log(
      `[Animation API] Available step IDs:`,
      assemblyData.steps?.map((s: any) => s.id),
    );

    if (stepIndex === -1 || stepIndex === undefined) {
      console.log(`[Animation API] ERROR: Step not found`);
      return res.status(404).json({ message: "Step not found" });
    }

    // Update the animation data
    assemblyData.steps[stepIndex].animation = req.body;
    console.log(`[Animation API] Animation data updated for step ${stepId}`);

    // Write back to file
    fs.writeFileSync(
      assemblyFile,
      JSON.stringify(assemblyData, null, 2),
      "utf8",
    );
    console.log(`[Animation API] File saved successfully`);

    return res.status(200).json({ message: "Animation saved successfully" });
  } catch (error) {
    console.error("[Animation API] Exception:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
