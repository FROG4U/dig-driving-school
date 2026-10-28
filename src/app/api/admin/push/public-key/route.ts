import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";

// Serves the VAPID public key to the admin client so it never has to be
// hardcoded. Empty string when push isn't configured (client hides the toggle).
export async function GET() {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  return NextResponse.json({ publicKey: process.env.VAPID_PUBLIC_KEY || "" });
}
