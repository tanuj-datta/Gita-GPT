import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const CHAPTER_VERSE_COUNTS: Record<number, number> = {
  1: 47,
  2: 72,
  3: 43,
  4: 42,
  5: 29,
  6: 47,
  7: 30,
  8: 28,
  9: 34,
  10: 42,
  11: 55,
  12: 20,
  13: 35,
  14: 27,
  15: 20,
  16: 24,
  17: 28,
  18: 78
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chapterNum = parseInt(id);

    if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > 18) {
      return NextResponse.json({ error: "Invalid chapter number. Must be between 1 and 18." }, { status: 400 });
    }

    const cacheDir = path.join(process.cwd(), "lib/chapters");
    const cachePath = path.join(cacheDir, `chapter-${chapterNum}.json`);

    // Ensure cache directory exists
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // 1. Check local cache first
    if (fs.existsSync(cachePath)) {
      try {
        const cachedData = JSON.parse(fs.readFileSync(cachePath, "utf8"));
        return NextResponse.json(cachedData);
      } catch (err) {
        console.error(`Error reading cache for chapter ${chapterNum}:`, err);
      }
    }

    // 2. Fetch using Gemini in chunks of 30 verses to avoid truncation or skipped verses
    const totalVerses = CHAPTER_VERSE_COUNTS[chapterNum] || 40;
    const chunkSize = 30;
    const slokas: any[] = [];
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    for (let start = 1; start <= totalVerses; start += chunkSize) {
      const end = Math.min(start + chunkSize - 1, totalVerses);
      console.log(`Generating chapter ${chapterNum} slokas from ${start} to ${end}...`);

      const prompt = `
        You are a highly precise Vedic scholar and translator.
        Generate a JSON array of slokas for Bhagavad Gita Chapter ${chapterNum}, from verse ${start} to ${end} (inclusive).

        For each verse in this range, you must return an object with:
        - "number": the verse number as a number (e.g. ${start})
        - "sanskrit": the Sanskrit Devanagari text of the verse (with correct formatting/line breaks, exact and authentic)
        - "english": a short, clear, and profound English translation/meaning of the verse (1-2 sentences)
        - "telugu": a short, clear, and authentic traditional Telugu translation/meaning of the verse (1-2 sentences, written in Telugu script)

        Make sure you include EVERY single verse from ${start} to ${end} without skipping any.
        Return ONLY a valid JSON array of objects. Do not wrap the JSON in markdown code blocks like \`\`\`json.
      `;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      try {
        const chunkSlokas = JSON.parse(text);
        if (Array.isArray(chunkSlokas)) {
          slokas.push(...chunkSlokas);
        } else {
          console.error(`Invalid format returned from Gemini for chapter ${chapterNum} range ${start}-${end}:`, text);
        }
      } catch (err) {
        console.error(`Failed to parse JSON for chapter ${chapterNum} range ${start}-${end}. Raw text:`, text, err);
        throw new Error(`Failed to generate slokas for range ${start}-${end}`);
      }
    }

    // Sort slokas by number just to be safe
    slokas.sort((a, b) => a.number - b.number);

    // Save to local cache
    const finalData = {
      chapter: chapterNum,
      totalVerses: slokas.length,
      slokas
    };

    fs.writeFileSync(cachePath, JSON.stringify(finalData, null, 2), "utf8");
    return NextResponse.json(finalData);

  } catch (error) {
    console.error("Failed to generate chapter slokas:", error);
    return NextResponse.json({ error: "Failed to retrieve chapter slokas. Please try again." }, { status: 500 });
  }
}
