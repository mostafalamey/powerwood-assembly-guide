import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const TENANT_CONFIG_PATH = path.join(process.cwd(), "config", "tenant.json");

// Ensure config directory exists
const ensureConfigDir = () => {
  const configDir = path.dirname(TENANT_CONFIG_PATH);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
};

// Read tenant config
const readTenantConfig = () => {
  ensureConfigDir();
  if (!fs.existsSync(TENANT_CONFIG_PATH)) {
    // Create default config if it doesn't exist
    const defaultConfig = {
      branding: {
        companyName: "PW Assembly",
        companyNameAr: "دليل التجميع",
        logo: "",
        primaryColor: "#3b82f6",
        secondaryColor: "#6366f1",
        favicon: "",
      },
      categories: [],
    };
    fs.writeFileSync(TENANT_CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }
  const content = fs.readFileSync(TENANT_CONFIG_PATH, "utf-8");
  return JSON.parse(content);
};

// Write tenant config
const writeTenantConfig = (config: any) => {
  ensureConfigDir();
  fs.writeFileSync(TENANT_CONFIG_PATH, JSON.stringify(config, null, 2));
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const config = readTenantConfig();
      const branding = config.branding || {
        companyName: "PW Assembly",
        companyNameAr: "دليل التجميع",
        logo: "",
        primaryColor: "#3b82f6",
        secondaryColor: "#6366f1",
        favicon: "",
      };
      res.status(200).json(branding);
    } catch (error) {
      console.error("Error reading branding:", error);
      res.status(500).json({ error: "Failed to read branding settings" });
    }
  } else if (req.method === "PUT") {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7);
    const adminToken = process.env.ADMIN_TOKEN || "admin123";
    
    if (token !== adminToken) {
      return res.status(401).json({ error: "Invalid token" });
    }

    try {
      const branding = req.body;

      // Validation
      if (!branding.companyName || !branding.companyNameAr) {
        return res.status(400).json({ error: "Company name is required in both languages" });
      }

      // Read current config
      const config = readTenantConfig();

      // Update branding
      config.branding = {
        companyName: branding.companyName,
        companyNameAr: branding.companyNameAr,
        logo: branding.logo || "",
        primaryColor: branding.primaryColor || "#3b82f6",
        secondaryColor: branding.secondaryColor || "#6366f1",
        favicon: branding.favicon || "",
      };

      // Write updated config
      writeTenantConfig(config);

      res.status(200).json(config.branding);
    } catch (error) {
      console.error("Error updating branding:", error);
      res.status(500).json({ error: "Failed to update branding settings" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
