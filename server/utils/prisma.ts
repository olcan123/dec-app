import type { PrismaClient as PrismaClientType } from "@prisma/client";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client") as typeof import("@prisma/client");

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