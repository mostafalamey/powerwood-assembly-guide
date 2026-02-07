import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const CATEGORIES_FILE = path.join(process.cwd(), "data", "categories.json");

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
  if (req.method !== "GET") {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  }

  try {
    const fileContents = fs.readFileSync(CATEGORIES_FILE, "utf8");
    const data = JSON.parse(fileContents);

    switch (req.method) {
      case "GET":
        return res.status(200).json(data);

      case "POST":
        // Create new category
        const newCategory = req.body;

        // Validate required fields
        if (!newCategory.id || !newCategory.name || !newCategory.nameAr) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        // Check for duplicate ID
        if (data.categories.some((c: any) => c.id === newCategory.id)) {
          return res
            .status(409)
            .json({ message: "Category ID already exists" });
        }

        // Add new category
        data.categories.push(newCategory);
        fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(data, null, 2));

        return res.status(201).json(newCategory);

      case "PUT":
        // Update existing category
        const updatedCategory = req.body;
        const index = data.categories.findIndex(
          (c: any) => c.id === updatedCategory.id,
        );

        if (index === -1) {
          return res.status(404).json({ message: "Category not found" });
        }

        // Update category
        data.categories[index] = updatedCategory;
        fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(data, null, 2));

        return res.status(200).json(updatedCategory);

      case "DELETE":
        // Delete category
        const deleteId = req.query.id as string;
        const deleteIndex = data.categories.findIndex(
          (c: any) => c.id === deleteId,
        );

        if (deleteIndex === -1) {
          return res.status(404).json({ message: "Category not found" });
        }

        // Remove category
        data.categories.splice(deleteIndex, 1);
        fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(data, null, 2));

        return res
          .status(200)
          .json({ message: "Category deleted successfully" });

      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
