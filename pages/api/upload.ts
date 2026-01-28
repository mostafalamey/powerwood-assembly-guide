import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { Fields, Files } from "formidable";
import fs from "fs";
import path from "path";
import { validateToken } from "../../lib/auth";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Simple auth check
const verifyToken = (req: NextApiRequest): boolean => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return false;
  return validateToken(token);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Check if we're in a serverless environment (Vercel)
  if (process.env.VERCEL) {
    return res.status(503).json({
      message:
        "File uploads are not available in production. Please run locally for content management.",
      error: "READ_ONLY_FILESYSTEM",
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Verify authentication
  if (!verifyToken(req)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const directory = Array.isArray(fields.directory)
      ? fields.directory[0]
      : fields.directory || "uploads";
    const requestedFilename = Array.isArray(fields.filename)
      ? fields.filename[0]
      : fields.filename;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Determine target directory based on the directory parameter
    let targetDir = path.join(process.cwd(), "public", directory);

    // Create directory if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Generate filename
    const originalName = file.originalFilename || "file";
    const originalExt = path.extname(originalName);
    let filename = "";

    if (requestedFilename) {
      const safeName = path.basename(String(requestedFilename));
      const hasExt = path.extname(safeName).length > 0;
      filename = hasExt ? safeName : `${safeName}${originalExt}`;
    } else {
      const baseName = path.basename(originalName, originalExt);
      const timestamp = Date.now();
      filename = `${baseName}-${timestamp}${originalExt}`;
    }

    const targetPath = path.join(targetDir, filename);

    // Move file to target directory
    fs.copyFileSync(file.filepath, targetPath);

    // Delete temp file
    fs.unlinkSync(file.filepath);

    // Return the public path
    const publicPath = `/${directory}/${filename}`;

    return res.status(200).json({
      message: "File uploaded successfully",
      path: publicPath,
      filename: filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      message: "Error uploading file",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
