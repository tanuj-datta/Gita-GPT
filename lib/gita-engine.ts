import gitaData from './gita-data.json';

export interface Sloka {
  number: number;
  sanskrit: string;
  transliteration: string;
  english: string;
  tags: string[];
}

export function getSloka(chapterNum: number, slokaNum: number): Sloka | null {
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
