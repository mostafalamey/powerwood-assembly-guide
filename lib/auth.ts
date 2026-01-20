import bcrypt from "bcryptjs";

// Hardcoded admin credentials for MVP
// In production, these should be in environment variables
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD_HASH = bcrypt.hashSync("admin123", 10); // Default password: admin123

export const verifyCredentials = async (
  username: string,
  password: string,
): Promise<boolean> => {
  if (username !== ADMIN_USERNAME) {
    return false;
  }
  return bcrypt.compare(password, ADMIN_PASSWORD_HASH);
};

export const generateToken = (): string => {
  // Simple token generation for MVP
  // In production, use JWT or similar
  return Buffer.from(`${Date.now()}-${Math.random()}`).toString("base64");
};

export const validateToken = (token: string): boolean => {
  // Simple validation for MVP
  // In production, verify JWT signature and expiration
  if (!token) return false;

  try {
    const decoded = Buffer.from(token, "base64").toString();
    const timestamp = parseInt(decoded.split("-")[0]);
    const age = Date.now() - timestamp;

    // Token expires after 24 hours
    return age < 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
};
