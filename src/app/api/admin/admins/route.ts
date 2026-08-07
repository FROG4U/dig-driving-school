import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  const user = await getAdminUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admins = await prisma.admin.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(admins);
}

export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email, name, password, role } = await req.json();

  if (!email || !name || !password) {
    return NextResponse.json({ error: "All fields required." }, { status: 400 });
  }

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use." }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.create({
    data: {
      email,
      name,
      password: hashed,
      role: role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN",
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  return NextResponse.json(admin);
}
