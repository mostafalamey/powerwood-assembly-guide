import type { NextApiRequest, NextApiResponse } from "next";
import { validateToken } from "../../../lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ valid: false, message: "Token required" });
  }

  const isValid = validateToken(token);

  return res.status(200).json({ valid: isValid });
}
