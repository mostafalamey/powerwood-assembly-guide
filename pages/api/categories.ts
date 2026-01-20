import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const CATEGORIES_FILE = path.join(process.cwd(), "data", "categories.json");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const fileContents = fs.readFileSync(CATEGORIES_FILE, "utf8");
    const categories = JSON.parse(fileContents);
    return res.status(200).json(categories);
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
