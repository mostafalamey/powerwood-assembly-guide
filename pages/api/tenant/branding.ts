import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { validateToken } from "@/lib/auth";

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
    fs.writeFileSync(
      TENANT_CONFIG_PATH,
      JSON.stringify(defaultConfig, null, 2),
    );
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

// Normalize branding data from old structure to new structure
const normalizeBranding = (config: any) => {
  const branding = config.branding || {};

  // Handle old structure with appName.en/ar
  let companyName = branding.companyName;
  let companyNameAr = branding.companyNameAr;

  // If old structure with appName object exists, migrate it
  if (branding.appName && typeof branding.appName === "object") {
    companyName = companyName || branding.appName.en || "PW Assembly Guide";
    companyNameAr = companyNameAr || branding.appName.ar || "دليل التجميع";
  }

  // Only use logo field - don't fallback to logoUrl which may be an invalid placeholder
  const logo = branding.logo || "";

  return {
    companyName: companyName || "PW Assembly Guide",
    companyNameAr: companyNameAr || "دليل التجميع",
    logo,
    primaryColor: branding.primaryColor || "#3b82f6",
    secondaryColor: branding.secondaryColor || "#6366f1",
    favicon: branding.favicon || "",
  };
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const config = readTenantConfig();
      const branding = normalizeBranding(config);
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

    if (!validateToken(token)) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    try {
      const branding = req.body;

      // Validation
      if (!branding.companyName || !branding.companyNameAr) {
        return res
          .status(400)
          .json({ error: "Company name is required in both languages" });
      }

      // Read current config
      const config = readTenantConfig();

      // Update branding with new structure (this will replace old structure)
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

      // Return the saved branding
      res.status(200).json(config.branding);
    } catch (error) {
      console.error("Error updating branding:", error);
      res.status(500).json({ error: "Failed to update branding settings" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
