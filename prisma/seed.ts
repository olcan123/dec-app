// prisma/seed.ts

import { PrismaClient, DeclarationPeriod, DeclarationPriorityLevel } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDeclarationTypes() {
  console.log('Başlangıç: DeclarationTypes tabloları temizleniyor...');
  // Daha önce eklenmiş tüm beyanname türlerini sil (tekrar eden kaydı önlemek için)
  await prisma.declarationType.deleteMany();

  console.log('Besleme verileri oluşturuluyor...');
  const declarationTypes = [
    // 1. KDV Beyannamesi (TVSH)
    {
      typeName: 'TVSH',
      description: 'Tatimi mbi Vlerën e Shtuar (TVSH)',
      defaultDay: 20,
      period: DeclarationPeriod.Monthly,
      priorityLevel: DeclarationPriorityLevel.Critical,
      colorCode: '#FF0000', // Örnek renk kodu
    },
    // 2. İşçi Vergi Beyannamesi (WM)
    {
      typeName: 'WM',
      description: 'Tatimi mbi Pagat (WM)',
      defaultDay: 15,
      period: DeclarationPeriod.Monthly,
      priorityLevel: DeclarationPriorityLevel.Low,
      colorCode: '#00FF00',
    },
    // 3. İşçi Katkı Payı (CM)
    {
      typeName: 'CM',
      description: 'Kontributi i Punëtorit (CM)',
      defaultDay: 15,
      period: DeclarationPeriod.Monthly,
      priorityLevel: DeclarationPriorityLevel.Low,
      colorCode: '#0000FF',
    },
    // 4. Kira Vergisi (WR)
    {
      typeName: 'WR',
      description: 'Tatimi mbi Qiranë (WR)',
      defaultDay: 15,
      period: DeclarationPeriod.Monthly,
      priorityLevel: DeclarationPriorityLevel.Low,
      colorCode: '#FFFF00',
    },
    // 5. Gelir Vergisi (Tremujor) - QL/IS/QS
    {
      typeName: 'QL/IL/IS/QS',
      description: 'Tatimi mbi Fitimin (Deklarim Tremujor)',
      defaultDay: 15,
      period: DeclarationPeriod.Quarterly,
      priorityLevel: DeclarationPriorityLevel.Critical,
      colorCode: '#FF00FF',
    },
    // 6. Yıllık Gelir Vergisi Beyannamesi (CD/PD)
    {
      typeName: 'CD/PD',
      description: 'Deklarata Vjetore e Tatimit mbi Të Ardhurat',
      defaultDay: 31,
      period: DeclarationPeriod.Annual,
      priorityLevel: DeclarationPriorityLevel.Low,
      colorCode: '#00FFFF',
    },
  ];

  // Tüm verileri veritabanına ekle
  for (const type of declarationTypes) {
    await prisma.declarationType.create({
      data: type,
    });
  }

  console.log(`Besleme tamamlandı. ${declarationTypes.length} adet beyanname türü eklendi.`);
}

// Ana fonksiyonu çalıştır ve hata yakala
seedDeclarationTypes()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });