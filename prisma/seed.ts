import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const superAdminPassword = await bcrypt.hash("SuperAdmin123!", 12);
  const adminPassword = await bcrypt.hash("Admin123!", 12);

  await prisma.admin.upsert({
    where: { email: "superadmin@digds.co.uk" },
    update: {},
    create: {
      email: "superadmin@digds.co.uk",
      password: superAdminPassword,
      name: "Super Admin",
      role: "SUPER_ADMIN",
    },
  });

  await prisma.admin.upsert({
    where: { email: "admin@digds.co.uk" },
    update: {},
    create: {
      email: "admin@digds.co.uk",
      password: adminPassword,
      name: "Admin",
      role: "ADMIN",
    },
  });

  console.log("✓ Seeded admin accounts.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
