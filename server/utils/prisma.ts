import type { PrismaClient as PrismaClientType } from "@prisma/client";
// "node:module" ve "createRequire" satırlarını silin
import { PrismaClient } from "@prisma/client"; // Doğrudan import edin

const prismaClientSingleton = () => {
  return new PrismaClient();
};

type GlobalWithPrisma = typeof globalThis & {
  prismaGlobal?: PrismaClientType;
};

const globalWithPrisma = globalThis as GlobalWithPrisma;

const prisma = globalWithPrisma.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalWithPrisma.prismaGlobal = prisma;
}

export default prisma;