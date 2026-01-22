import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { Fields, Files } from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Simple auth check
const verifyToken = (req: NextApiRequest): boolean => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const validToken = process.env.ADMIN_PASSWORD || "admin123";
  return token === validToken;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
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
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    const timestamp = Date.now();
    const filename = `${baseName}-${timestamp}${ext}`;

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
