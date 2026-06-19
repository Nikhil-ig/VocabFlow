const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Simple CSV parser that respects quotes
function parseCSV(text) {
  let result = [];
  let row = [];
  let inQuotes = false;
  let currentVal = '';

  for (let i = 0; i < text.length; i++) {
    let char = text[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(currentVal.trim());
      currentVal = '';
    } else if (char === '\n' && !inQuotes) {
      row.push(currentVal.trim());
      result.push(row);
      row = [];
      currentVal = '';
    } else if (char !== '\r') {
      currentVal += char;
    }
  }
  
  if (currentVal || row.length > 0) {
    row.push(currentVal.trim());
    result.push(row);
  }
  
  return result;
}

async function main() {
  const userId = 'cmqi28s8f0000gckfzpeijjza'; // test user
  
  const csvPath = path.join(__dirname, '../../backend/VocabFlow_ Vocabulary Learning - Sheet1-2.csv');
  console.log(`Reading CSV from ${csvPath}`);
  
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);
  
  // Skip header
  const headers = rows[0];
  const dataRows = rows.slice(1);
  
  console.log(`Found ${dataRows.length} rows to import`);
  
  let count = 0;
  for (const row of dataRows) {
    if (row.length < 12) continue; // Skip incomplete rows
    
    // Word,Meaning,Example,Part of Speech,Synonyms,Antonyms,Pronunciation Guide,Root Words,Mood,Difficulty Level,Status,Connotation
    const [
      word, meaning, example, pos, synonyms, antonyms,
      pronunciation, rootWords, mood, difficulty, statusStr, connotation
    ] = row;
    
    if (!word || !meaning) continue;
    
    let status = 'TO_LEARN';
    if (statusStr.toLowerCase().includes('learning')) status = 'LEARNING';
    if (statusStr.toLowerCase().includes('mastered')) status = 'MASTERED';
    
    try {
      await prisma.vocabularyCard.create({
        data: {
          word,
          meaning,
          example: example || null,
          pos: pos || null,
          synonyms: synonyms || null,
          antonyms: antonyms || null,
          pronunciation: pronunciation || null,
          rootWords: rootWords || null,
          mood: mood || null,
          difficulty: difficulty || null,
          connotation: connotation || null,
          status,
          userId,
        }
      });
      count++;
    } catch (e) {
      console.error(`Error importing ${word}:`, e.message);
    }
  }
  
  console.log(`Successfully imported ${count} cards.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
