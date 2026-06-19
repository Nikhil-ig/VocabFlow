const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear any existing columns just in case
  await prisma.boardColumn.deleteMany({});

  const defaultColumns = [
    { name: 'To Learn', color: 'border-indigo-500 text-indigo-600 bg-indigo-500', order: 0 },
    { name: 'Learning', color: 'border-amber-500 text-amber-600 bg-amber-500', order: 1 },
    { name: 'Mastered', color: 'border-emerald-500 text-emerald-600 bg-emerald-500', order: 2 },
  ];

  const createdColumns = {};
  for (const col of defaultColumns) {
    const created = await prisma.boardColumn.create({ data: col });
    // mapping TO_LEARN to To Learn's ID
    const key = col.name.toUpperCase().replace(' ', '_');
    createdColumns[key] = created.id;
  }
  
  const cards = await prisma.vocabularyCard.findMany();
  let migrated = 0;
  for (const card of cards) {
    let colId = createdColumns[card.status];
    if (!colId) colId = createdColumns['TO_LEARN']; // fallback
    
    await prisma.vocabularyCard.update({
      where: { id: card.id },
      data: { columnId: colId }
    });
    migrated++;
  }
  
  console.log(`Migrated ${migrated} cards to dynamic columns!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
