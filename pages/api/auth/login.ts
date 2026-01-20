import type { NextApiRequest, NextApiResponse } from "next";
import { verifyCredentials, generateToken } from "../../../lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  const isValid = await verifyCredentials(username, password);

  if (isValid) {
    const token = generateToken();
    return res.status(200).json({ token, message: "Login successful" });
  }

  return res.status(401).json({ message: "Invalid credentials" });
}
