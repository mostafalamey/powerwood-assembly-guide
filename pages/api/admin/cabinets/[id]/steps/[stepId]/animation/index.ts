import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const CABINETS_DIR = path.join(process.cwd(), "data", "cabinets");

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
    return res.status(400).json({ message: "Missing cabinet ID or step ID" });
  }

  try {
    // Read the cabinet file
    const cabinetFile = path.join(CABINETS_DIR, `${id}.json`);
    console.log(`[Animation API] Looking for file:`, cabinetFile);
    console.log(`[Animation API] File exists:`, fs.existsSync(cabinetFile));

    if (!fs.existsSync(cabinetFile)) {
      console.log(`[Animation API] ERROR: Cabinet file not found`);
      return res.status(404).json({ message: "Cabinet not found" });
    }

    const cabinetData = JSON.parse(fs.readFileSync(cabinetFile, "utf8"));
    console.log(
      `[Animation API] Cabinet data loaded, steps count:`,
      cabinetData.steps?.length,
    );

    // Find the step (compare as strings since JSON has string IDs)
    const stepIndex = cabinetData.steps?.findIndex(
      (s: any) => s.id === stepId || s.id === parseInt(stepId as string),
    );
    console.log(`[Animation API] Looking for step ID:`, stepId);
    console.log(`[Animation API] Step index found:`, stepIndex);
    console.log(
      `[Animation API] Available step IDs:`,
      cabinetData.steps?.map((s: any) => s.id),
    );

    if (stepIndex === -1 || stepIndex === undefined) {
      console.log(`[Animation API] ERROR: Step not found`);
      return res.status(404).json({ message: "Step not found" });
    }

    // Update the animation data
    cabinetData.steps[stepIndex].animation = req.body;
    console.log(`[Animation API] Animation data updated for step ${stepId}`);

    // Write back to file
    fs.writeFileSync(cabinetFile, JSON.stringify(cabinetData, null, 2), "utf8");
    console.log(`[Animation API] File saved successfully`);

    return res.status(200).json({ message: "Animation saved successfully" });
  } catch (error) {
    console.error("[Animation API] Exception:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
