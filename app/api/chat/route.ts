import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRecommendation, getSloka } from "@/lib/gita-engine";
import gitaData from '@/lib/gita-data.json';
import { prisma } from "@/lib/prisma";
import fs from 'fs';
import path from 'path';
import { auth } from "@/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    let { chatId, message, language, customContext } = await req.json();

    const session = await auth();
    const userId = session?.user?.id;

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
              userId: userId || null,
            }
          });
          chatId = chat.id;
        } else {
          // If chatId is provided, verify ownership
          const chat = await prisma.chat.findUnique({
            where: { id: chatId }
          });
          if (chat && chat.userId && chat.userId !== userId) {
            return new Response(JSON.stringify({ error: "Unauthorized access to this chat." }), { status: 403 });
          }
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
              .map((msg: { role: string; content: string }) => `${msg.role === 'user' ? 'Seeker' : 'Krishna'}: ${msg.content}`)
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

    // Feature 2: Structured lookup (matching both English and Telugu script formats)
    const lookupMatch = lowerText.match(/(?:chapter|అధ్యాయం|అధ్యాయము)\s*(\d+).*(?:sloka|శ్లోకం|శ్లోకము)\s*(\d+)/i);
    if (lookupMatch) {
      const chapNum = parseInt(lookupMatch[1]);
      const slokaNum = parseInt(lookupMatch[2]);
      
      let result = getSloka(chapNum, slokaNum);
      
      // Self-healing: if not cached, generate the chapter in real-time
      if (!result && chapNum >= 1 && chapNum <= 18) {
        try {
          console.log(`Dynamic request for ${chapNum}.${slokaNum} missed cache. Generating chapter ${chapNum} on-demand...`);
          const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
          // Use headers from current request to find correct host/origin
          const host = req.headers.get('host') || 'localhost:3000';
          const res = await fetch(`${protocol}://${host}/api/chapters/${chapNum}/slokas`);
          if (res.ok) {
            result = getSloka(chapNum, slokaNum);
          }
        } catch (err) {
          console.error("Failed to dynamically generate chapter on-demand:", err);
        }
      }

      if (result) {
        const meaning = language === 'Telugu' ? (result.telugu || result.english) : result.english;
        gitaContext += `\n\n[DIRECT VERSE REFERENCE] Chapter ${chapNum}, Verse ${slokaNum}: "${result.sanskrit}" | Meaning: "${meaning}"`;
      }
    }

    // Feature 3: Deep PDF Search
    try {
      const fullDataPath = path.join(process.cwd(), 'lib/gita-full-data.json');
      if (fs.existsSync(fullDataPath)) {
        const fullData = JSON.parse(fs.readFileSync(fullDataPath, 'utf8'));
        const pdfText = language === 'Telugu' ? fullData.telugu : fullData.english;
        
        const keywords = lowerText.split(' ').filter((w: string) => w.length > 3);
        
        // Emotional state mapping for PDF text search (both English, Telugu, and Tanglish transliterations)
        if (lowerText.includes('sad') || lowerText.includes('grief') || lowerText.includes('sorrow') || lowerText.includes('depress') || lowerText.includes('pain') || lowerText.includes('బాధ') || lowerText.includes('దుఃఖ') || lowerText.includes('కష్టం') || lowerText.includes('చింత') || lowerText.includes('badha') || lowerText.includes('baadha') || lowerText.includes('chinta') || lowerText.includes('dukkha') || lowerText.includes('kashtam') || lowerText.includes('kashtham')) {
          keywords.push('grief', 'sorrow', 'lament', 'shoka', 'grieve', 'depressed', 'pain', 'బాధ', 'దుఃఖ', 'కష్టం', 'చింత');
        }
        if (lowerText.includes('angry') || lowerText.includes('anger') || lowerText.includes('rage') || lowerText.includes('temper') || lowerText.includes('కోపం') || lowerText.includes('క్రోధం') || lowerText.includes('అగ్రహం') || lowerText.includes('kopam') || lowerText.includes('krodham') || lowerText.includes('agraham')) {
          keywords.push('anger', 'krodha', 'wrath', 'lust', 'desire', 'passion', 'kama', 'కోపం', 'క్రోధం', 'అగ్రహం');
        }
        if (lowerText.includes('jealous') || lowerText.includes('envy') || lowerText.includes('envious') || lowerText.includes('jealousy') || lowerText.includes('అసూయ') || lowerText.includes('ఈర్ష్య') || lowerText.includes('ద్వేషం') || lowerText.includes('asuya') || lowerText.includes('asuuya') || lowerText.includes('irshya') || lowerText.includes('dvesham')) {
          keywords.push('envy', 'jealous', 'envious', 'matsarya', 'hate', 'malice', 'అసూయ', 'ఈర్ష్య', 'ద్వేషం');
        }
        if (lowerText.includes('happy') || lowerText.includes('joy') || lowerText.includes('happiness') || lowerText.includes('pleasure') || lowerText.includes('సంతోష') || lowerText.includes('ఆనంద') || lowerText.includes('సుఖం') || lowerText.includes('santosham') || lowerText.includes('santhosham') || lowerText.includes('anandam') || lowerText.includes('sukham')) {
          keywords.push('joy', 'sukha', 'happiness', 'peace', 'pleasure', 'delight', 'సంతోష', 'ఆనంద', 'సుఖం');
        }
        if (lowerText.includes('scared') || lowerText.includes('fear') || lowerText.includes('anxious') || lowerText.includes('anxiety') || lowerText.includes('stress') || lowerText.includes('భయం') || lowerText.includes('ఆందోళన') || lowerText.includes('దిగులు') || lowerText.includes('bhayam') || lowerText.includes('bhayanga') || lowerText.includes('andolana') || lowerText.includes('digulu')) {
          keywords.push('fear', 'anxiety', 'bhaya', 'worry', 'stress', 'mind', 'steady', 'భయం', 'ఆందోళన', 'దిగులు');
        }
        if (lowerText.includes('suicidal') || lowerText.includes('death') || lowerText.includes('చావు') || lowerText.includes('మరణం') || lowerText.includes('chavu') || lowerText.includes('chaavu') || lowerText.includes('maranam')) {
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

    // Feature 4: Include core slokas with authentic translations in context
    let coreVersesContext = "[AUTHENTIC CORE VERSE TRANSLATIONS (ENGLISH & TELUGU)]\n";
    gitaData.chapters.forEach((chap: any) => {
      chap.slokas.forEach((s: any) => {
        coreVersesContext += `Chapter ${chap.number}, Verse ${s.number}:\n`;
        coreVersesContext += `Sanskrit: ${s.sanskrit}\n`;
        coreVersesContext += `English Translation: ${s.english}\n`;
        if (s.telugu) {
          coreVersesContext += `Telugu Translation (భావం): ${s.telugu}\n`;
        }
        coreVersesContext += `\n`;
      });
    });
    gitaContext += `\n\n${coreVersesContext}`;

    // 4. LLM GENERATION
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `
      You are the Divine Voice of Lord Krishna, speaking directly to a GenZ seeker.
      
      CORE INSTRUCTIONS:
      1. SLOKA ON TOP: You MUST display the relevant Bhagavad Gita Sloka(s) (with Chapter and Verse numbers, Sanskrit text, and translation) at the very top of your response, before any explanations, advice, or GenZ analogies. Use bold for the verse citations (e.g., **Chapter 2, Verse 47** or **అధ్యాయం 2, శ్లోకం 47**). If the selected language is TELUGU, the translation/meaning of the sloka MUST be the authentic, traditional Telugu meaning (Bhava/Tatparya) from the Bhagavad Gita, avoiding literal or line-to-line translation from English. Use the traditional Telugu verses and meanings found in [DIRECT VERSE REFERENCE] or [AUTHENTIC CORE VERSE TRANSLATIONS] if applicable, or traditional Bhagavad Gita interpretations.
      2. GENZ ACCENT & VIBE: Keep the explanation short, crisp, and punchy. Avoid long, boring paragraphs. Use relatable GenZ slang (e.g., "no cap", "fr fr", "rent-free", "toxic era", "lagging", "main character", "grind", "glow up", "vibe check", "cancel") naturally and compassionately.
      3. REAL GITA EXAMPLES EXPLAINED FOR GENZ: Ground your advice in actual analogies and examples from the Bhagavad Gita, explained in a modern GenZ way:
         - Arjuna's struggle (Chapter 1) = Having a major panic attack, lagging hard, wanting to quit the lobby.
         - Soul changing bodies (2.22) = Upgrading skins in Fortnite or changing your outfit. The soul is permanent; the body is just a fit.
         - Controlled mind (6.6) = Mind can either be your best friend or a toxic group chat living rent-free in your head.
         - Unattached action (2.47) = Focus on the grind (effort), not the clout or views (results).
         - Lust, anger, greed (16.21) = Major red flags that will ruin your vibe. Cancel them before they cancel you.
      4. GITA REMEDY & REFLECTION: Identify user emotions (sadness, anger, jealousy, anxiety). Give precise references (Chapter and Verse numbers) and explain how to overcome these struggles.
      5. RIGID FIDELITY TO SCRIPTURE: You must ground your response strictly in the Bhagavad Gita. Do not formulate random advices. Ground the response using the provided [DIVINE KNOWLEDGE BASE] and your internal training of the authentic Bhagavad Gita.
      6. LANGUAGE COMPLIANCE, TRANSLATION & ACCENTS:
         - Selected Language: ${(language || 'English').toUpperCase()}
         - INPUT INTERPRETATION: Seeker questions might be in Telugu script (e.g., "నాకు చాలా భయంగా ఉంది") or in transliterated Tanglish (e.g., "naku chala bhayanga undi", "life flow missing bro"). You must accurately decode the seeker's emotional state and intent in both writing styles.
         - AUTHENTIC TELUGU SPIRITUAL LEXICON: When explaining concepts from the Gita in Telugu, do NOT translate English phrases literally. Use traditional, culturally resonant terms:
           * Soul/Self -> "ఆత్మ" (Atma)
           * Righteousness/Duty -> "ధర్మం" (Dharmam)
           * Action/Effort -> "కర్మ" (Karmam) / "నిష్కామ కర్మ" (selfless action)
           * Attachment/Delusion -> "ఆసక్తి" (Aasakti) / "మమకారం" (Mamakaaram) / "మోహం" (Moham)
           * Equanimity -> "స్థితప్రజ్ఞత" (Sthithaprajnatha) / "సమస్థితి" (Samasthithi)
           * Senses/Control -> "ఇంద్రియ నిగ్రహం" (Indriya Nigraham)
           * Wisdom/Knowledge -> "జ్ఞానం" (Gnanam)
           * Illusion -> "మాయ" (Maya)
           * Devotion -> "భక్తి" (Bhakti)
           * Anger -> "క్రోధం" (Krodham) / "కోపం" (Kopam)
           * Desire/Lust -> "కామం" (Kaamam) / "కోరిక" (Korika)
           * Greed -> "లోభం" (Lobham)
         - TRADITIONAL TAATPARYAM (TAATTPARYA): Ensure that the Sloka's explanation/meaning (తాత్పర్యం/భావం) is presented in beautiful, correct, and culturally accurate Telugu, conveying the original philosophical depth instead of dry machine translation.
         - NATURAL COLLOQUIAL GENZ ADVICE: When giving advice/analogies in Telugu, blend English loanwords and youth slang naturally to match how modern Telugu speakers communicate informally:
           * "Chill avvu bro" (for calming the mind/restlessness)
           * "Lite teesko" (for detached action, letting go of results/clout)
           * "Taggade le" (for resolve, devotion, and focus)
           * "Toxic loop" (for Samsara/vicious cycle of desires)
           * "Main character energy" (for steady intelligence/Sthitaprajna)
           * "Glow up" (for spiritual growth/elevation of soul)
           * "Vibe check / Control pettu" (for sense control/mindfulness)
           Make sure the sentence syntax is grammatically correct and sounds authentic to regional Telugu speaking flow.
      7. STRICT REFUSALS & NO MATH/ROMANCE:
         - Do NOT answer any specific mathematical questions (such as "what is 2 + 2"), general factual trivia, coding requests, or academic/general knowledge questions unrelated to the Bhagavad Gita.
         - Do NOT answer any romantic, dating, crush, or relationship/love questions.
         - If a seeker asks a question in these categories, you must refuse to answer politely but firmly using the Lord Krishna GenZ persona (e.g., "That's not in the Gita's lobby, seeker. Let's focus on the spiritual grind, fr fr," or the Telugu equivalent if Telugu is selected). Guide them back to self-realization and spiritual growth.
      
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
