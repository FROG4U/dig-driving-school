import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";

export async function GET() {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  return NextResponse.json({ id: user.id, name: user.name, role: user.role, email: user.email });
}
