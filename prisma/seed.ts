// prisma/seed.ts

import {
  PrismaClient,
  DeclarationPeriod,
  DeclarationPriorityLevel,
} from "@prisma/client";

const prisma = new PrismaClient();

async function seedDeclarationTypes() {
  console.log("DeclarationTypes tablosu kontrol ediliyor...");
  const existingTypes = await prisma.declarationType.findMany();
  if (existingTypes.length > 0) {
    console.log(
      `Zaten ${existingTypes.length} adet beyanname türü mevcut. Seed işlemi atlandı.`
    );
    return;
  }

  console.log("Besleme verileri oluşturuluyor...");
  const declarationTypes = [
    // 1. KDV Beyannamesi (TVSH)
    {
      typeName: "TVSH",
      description: "Tatimi mbi Vlerën e Shtuar (TVSH)",
      defaultDay: 20,
      period: DeclarationPeriod.Monthly,
      priorityLevel: DeclarationPriorityLevel.Critical,
      colorCode: "#FF0000", // Örnek renk kodu
    },
    // 2. İşçi Vergi Beyannamesi (WM)
    {
      typeName: "WM/CM",
      description: "Tatimi mbi Pagat dhe Kontributet (WM/CM)",
      defaultDay: 15,
      period: DeclarationPeriod.Monthly,
      priorityLevel: DeclarationPriorityLevel.Low,
      colorCode: "#00FF00",
    },
    // 3. Kira Vergisi (WR)
    {
      typeName: "WR",
      description: "Tatimi mbi Qiranë (WR)",
      defaultDay: 15,
      period: DeclarationPeriod.Monthly,
      priorityLevel: DeclarationPriorityLevel.Low,
      colorCode: "#FFFF00",
    },
    // 4. Gelir Vergisi (Tremujor) - QL/IS/QS
    {
      typeName: "QL/IL/IS/QS",
      description: "Tatimi mbi Fitimin (Deklarim Tremujor)",
      defaultDay: 15,
      period: DeclarationPeriod.Quarterly,
      priorityLevel: DeclarationPriorityLevel.Critical,
      colorCode: "#FF00FF",
    },
    // 5. Yıllık Gelir Vergisi Beyannamesi (CD/PD)
    {
      typeName: "CD/PD",
      description: "Deklarata Vjetore e Tatimit mbi Të Ardhurat",
      defaultDay: 31,
      period: DeclarationPeriod.Annual,
      priorityLevel: DeclarationPriorityLevel.Low,
      colorCode: "#00FFFF",
    },
  ];

  // Tüm verileri veritabanına ekle
  for (const type of declarationTypes) {
    await prisma.declarationType.create({
      data: type,
    });
  }

  console.log(
    `Besleme tamamlandı. ${declarationTypes.length} adet beyanname türü eklendi.`
  );
}

// Ana fonksiyonu çalıştır ve hata yakala
seedDeclarationTypes()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
