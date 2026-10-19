import gitaData from './gita-data.json';
import fs from 'fs';
import path from 'path';

export interface Sloka {
  number: number;
  sanskrit: string;
  transliteration?: string;
  english: string;
  telugu?: string;
  tags?: string[];
}

export function getSloka(chapterNum: number, slokaNum: number): Sloka | null {
  try {
    // 1. Try to load from cached chapters first
    const cachePath = path.join(process.cwd(), `lib/chapters/chapter-${chapterNum}.json`);
    if (fs.existsSync(cachePath)) {
      const data = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      const found = data.slokas?.find((s: any) => s.number === slokaNum);
      if (found) {
        return {
          number: found.number,
          sanskrit: found.sanskrit,
          english: found.english,
          telugu: found.telugu,
          tags: []
        };
      }
    }
  } catch (err) {
    console.error(`Error loading sloka ${chapterNum}.${slokaNum} from cache:`, err);
  }

  // 2. Fallback to static gita-data.json
  const chapter = gitaData.chapters.find((c: any) => c.number === chapterNum);
  if (!chapter) return null;
  return chapter.slokas.find((s: any) => s.number === slokaNum) || null;
}

export function getRecommendation(feeling: string): Sloka | null {
  const normalized = feeling.toLowerCase();
  
  // Find matching tag in emotional_mapping
  for (const [key, [chap, sloka]] of Object.entries(gitaData.emotional_mapping)) {
    if (normalized.includes(key)) {
      return getSloka(chap, sloka);
    }
  }

  // Fallback to searching tags in all slokas
  for (const chapter of gitaData.chapters) {
    for (const sloka of chapter.slokas) {
      if (sloka.tags.some(tag => normalized.includes(tag))) {
        return sloka;
      }
    }
  }

  return null;
}

