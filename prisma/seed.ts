import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "shafayetalanik@gmail.com";
  const name = "Shafayet Al-Anik";
  const plainPassword = "123456";

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: hashedPassword,
      role: "admin",
    },
    create: {
      name,
      email,
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log("Seeded user successfully:", {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
}

seed()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
