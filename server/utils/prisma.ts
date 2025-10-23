import { PrismaClient } from "@prisma/client";

type PrismaClientType = PrismaClient;

const prismaClientSingleton = () => {
  return new PrismaClient();
};

type GlobalWithPrisma = typeof globalThis & {
  prismaGlobal?: PrismaClientType;
};

const globalWithPrisma = globalThis as GlobalWithPrisma;

const prisma = globalWithPrisma.prismaGlobal ?? prismaClientSingleton();

const isProduction =
  (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env
    ?.NODE_ENV === "production";

if (!isProduction) {
  globalWithPrisma.prismaGlobal = prisma;
}

export default prisma;