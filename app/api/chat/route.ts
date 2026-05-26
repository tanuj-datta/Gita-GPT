import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRecommendation, getSloka } from "@/lib/gita-engine";
import gitaData from '@/lib/gita-data.json';
import { prisma } from "@/lib/prisma";
import fs from 'fs';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    let { chatId, message, language, customContext } = await req.json();

    // 1. DATABASE INTERACTION: Save user message and/or create chat
    let dbSuccess = false;
    try {
      if (process.env.DATABASE_URL) {
        if (!chatId) {
          const title = message.length > 35 ? message.substring(0, 35) + "..." : message;
          const chat = await prisma.chat.create({
            data: {
              title,
              language: language || "English",
              customContext: customContext || "",
            }
          });
          chatId = chat.id;
        }

        await prisma.message.create({
          data: {
            chatId,
            role: 'user',
            content: message
          }
        });
        dbSuccess = true;
      }
    } catch (e) {
      console.error("Database error (falling back to memory-only):", e);
    }

    // 2. LOAD CONVERSATION HISTORY (for LLM memory)
    let conversationHistory = "";
    if (dbSuccess && chatId) {
      try {
        const pastMessages = await prisma.message.findMany({
          where: { chatId },
          orderBy: { createdAt: "asc" },
          take: 12, // Load last 12 messages for context
        });
        if (pastMessages.length > 0) {
          // Filter out the last user message we just saved so we don't repeat it
          const historySlice = pastMessages.slice(0, -1);
          if (historySlice.length > 0) {
            conversationHistory = "[CONVERSATION HISTORY]\n" + historySlice
              .map((msg) => `${msg.role === 'user' ? 'Seeker' : 'Krishna'}: ${msg.content}`)
              .join("\n") + "\n\n";
          }
        }
      } catch (historyErr) {
        console.error("Error loading conversation history:", historyErr);
      }
    }

    // 3. ADVANCED CONTEXT RETRIEVAL (RAG)
    const lowerText = message.toLowerCase();
    let gitaContext = "";
    
    // Feature 1: Check for "Summary" or "18 Chapters" request
    if (lowerText.includes('summary') || lowerText.includes('18 chapters') || lowerText.includes('all chapters')) {
      gitaContext = `[ESSENTIAL SUMMARY OF 18 CHAPTERS]\n` + gitaData.eighteen_chapters_summary.join("\n");
    }

    // Feature 2: Structured lookup
    const lookupMatch = lowerText.match(/chapter\s*(\d+).*sloka\s*(\d+)/i);
    if (lookupMatch) {
      const result = getSloka(parseInt(lookupMatch[1]), parseInt(lookupMatch[2]));
      if (result) {
        gitaContext += `\n\n[DIRECT VERSE REFERENCE] Chapter ${lookupMatch[1]}, Verse ${lookupMatch[2]}: "${result.sanskrit}" | Meaning: "${result.english}"`;
      }
    }

    // Feature 3: Deep PDF Search
    try {
      const fullDataPath = path.join(process.cwd(), 'lib/gita-full-data.json');
      if (fs.existsSync(fullDataPath)) {
        const fullData = JSON.parse(fs.readFileSync(fullDataPath, 'utf8'));
        const pdfText = language === 'Telugu' ? fullData.telugu : fullData.english;
        
        const keywords = lowerText.split(' ').filter((w: string) => w.length > 3);
        
        // Emotional state mapping for PDF text search (both English and Telugu)
        if (lowerText.includes('sad') || lowerText.includes('grief') || lowerText.includes('sorrow') || lowerText.includes('depress') || lowerText.includes('pain') || lowerText.includes('బాధ') || lowerText.includes('దుఃఖ')) {
          keywords.push('grief', 'sorrow', 'lament', 'shoka', 'grieve', 'depressed', 'pain', 'బాధ', 'దుఃఖ');
        }
        if (lowerText.includes('angry') || lowerText.includes('anger') || lowerText.includes('rage') || lowerText.includes('temper') || lowerText.includes('కోపం') || lowerText.includes('క్రోధం')) {
          keywords.push('anger', 'krodha', 'wrath', 'lust', 'desire', 'passion', 'kama', 'కోపం', 'క్రోధం');
        }
        if (lowerText.includes('jealous') || lowerText.includes('envy') || lowerText.includes('envious') || lowerText.includes('jealousy') || lowerText.includes('అసూయ') || lowerText.includes('ఈర్ష్య')) {
          keywords.push('envy', 'jealous', 'envious', 'matsarya', 'hate', 'malice', 'అసూయ', 'ఈర్ష్య');
        }
        if (lowerText.includes('happy') || lowerText.includes('joy') || lowerText.includes('happiness') || lowerText.includes('pleasure') || lowerText.includes('సంతోష') || lowerText.includes('ఆనంద')) {
          keywords.push('joy', 'sukha', 'happiness', 'peace', 'pleasure', 'delight', 'సంతోష', 'ఆనంద');
        }
        if (lowerText.includes('scared') || lowerText.includes('fear') || lowerText.includes('anxious') || lowerText.includes('anxiety') || lowerText.includes('stress') || lowerText.includes('భయం')) {
          keywords.push('fear', 'anxiety', 'bhaya', 'worry', 'stress', 'mind', 'steady', 'భయం');
        }
        if (lowerText.includes('suicidal') || lowerText.includes('death') || lowerText.includes('చావు') || lowerText.includes('మరణం')) {
          keywords.push('life', 'mind', 'elevate', 'atma', 'shoka', 'suicide', 'death', 'చావు', 'మరణం');
        }

        let matchingSegments = [];
        const uniqueKeywords = [...new Set(keywords)];
        
        for (const kw of uniqueKeywords) {
          let pos = -1;
          while ((pos = pdfText.toLowerCase().indexOf(kw, pos + 1)) !== -1) {
            const start = Math.max(0, pos - 400);
            const end = Math.min(pdfText.length, pos + 600);
            matchingSegments.push(pdfText.substring(start, end));
            if (matchingSegments.length >= 8) break;
          }
          if (matchingSegments.length >= 8) break;
        }

        if (matchingSegments.length > 0) {
          gitaContext += `\n\n[DIVINE KNOWLEDGE BASE - ${(language || 'English').toUpperCase()}]\n` + matchingSegments.join("\n---\n");
        }
      }
    } catch (e) {
      console.error("PDF Context Error:", e);
    }

    // 4. LLM GENERATION
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `
      You are the Divine Voice of Lord Krishna, speaking directly to a GenZ seeker.
      
      CORE INSTRUCTIONS:
      1. SLOKA ON TOP: You MUST display the relevant Bhagavad Gita Sloka(s) (with Chapter and Verse numbers, Sanskrit text, and translation) at the very top of your response, before any explanations, advice, or GenZ analogies. Use bold for the verse citations (e.g., **Chapter 2, Verse 47**) so it stands out clearly.
      2. GENZ ACCENT & VIBE: Keep the explanation short, crisp, and punchy. Avoid long, boring paragraphs. Use relatable GenZ slang (e.g., "no cap", "fr fr", "rent-free", "toxic era", "lagging", "main character", "grind", "glow up", "vibe check", "cancel") naturally and compassionately.
      3. REAL GITA EXAMPLES EXPLAINED FOR GENZ: Ground your advice in actual analogies and examples from the Bhagavad Gita, explained in a modern GenZ way:
         - Arjuna's struggle (Chapter 1) = Having a major panic attack, lagging hard, wanting to quit the lobby.
         - Soul changing bodies (2.22) = Upgrading skins in Fortnite or changing your outfit. The soul is permanent; the body is just a fit.
         - Controlled mind (6.6) = Mind can either be your best friend or a toxic group chat living rent-free in your head.
         - Unattached action (2.47) = Focus on the grind (effort), not the clout or views (results).
         - Lust, anger, greed (16.21) = Major red flags that will ruin your vibe. Cancel them before they cancel you.
      4. GITA REMEDY & REFLECTION: Identify user emotions (sadness, anger, jealousy, anxiety). Give precise references (Chapter and Verse numbers) and explain how to overcome these struggles.
      5. RIGID FIDELITY TO SCRIPTURE: You must ground your response strictly in the Bhagavad Gita. Do not formulate random advices. Ground the response using the provided [DIVINE KNOWLEDGE BASE] and your internal training of the authentic Bhagavad Gita.
      6. LANGUAGE COMPLIANCE:
         - Selected Language: ${(language || 'English').toUpperCase()}
         - CRITICAL: If the selected language is TELUGU, translate the GenZ style, slang, and advice into modern, informal, highly relatable Telugu youth slang (e.g., using terms like "bro", "taggade le", "chill avvu", "baga cheppav"). The entire response must be generated in Telugu script. If English, write in English.
      
      TONE: Divine, wise, compassionate, but extremely chill, relatable, and direct. Use the 🪈 emoji.
      
      ${customContext ? `[ADDITIONAL SEEKER CONTEXT / BACKGROUND INFO]:\n${customContext}\n` : ""}

      CONTEXT:
      ${gitaContext}
    `;

    const prompt = `${systemPrompt}\n\n${conversationHistory}Seeker says: "${message}"\n\nKrishna says:`;

    const streamingResult = await model.generateContentStream(prompt);

    const currentChatId = chatId;
    const currentDbSuccess = dbSuccess;

    const stream = new ReadableStream({
      async start(controller) {
        let fullContent = "";
        try {
          for await (const chunk of streamingResult.stream) {
            const chunkText = chunk.text();
            fullContent += chunkText;
            controller.enqueue(new TextEncoder().encode(chunkText));
          }
          
          if (currentDbSuccess && currentChatId) {
            await prisma.message.create({
              data: {
                chatId: currentChatId,
                role: 'bot',
                content: fullContent,
              }
            });
            await prisma.chat.update({
              where: { id: currentChatId },
              data: { updatedAt: new Date() }
            });
          }
        } catch (err) {
          console.error("Streaming or database saving error:", err);
        } finally {
          controller.close();
        }
      },
    });

    const responseHeaders: Record<string, string> = {
      "Content-Type": "text/plain; charset=utf-8",
    };
    if (chatId) {
      responseHeaders["X-Chat-ID"] = chatId;
    }

    return new Response(stream, {
      headers: responseHeaders,
    });

  } catch (error) {
    console.error("Chat Error:", error);
    return new Response(JSON.stringify({ error: "Divine connection interrupted." }), {
      status: 500,
    });
  }
}
