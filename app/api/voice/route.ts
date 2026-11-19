import { NextResponse } from 'next/server';
import { EdgeTTS } from 'node-edge-tts';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function cleanTextForSpeech(rawText: string): string {
  if (!rawText) return '';

  let text = rawText;

  // 1. Remove Markdown headers, bold, italics, code blocks
  text = text.replace(/```[\s\S]*?```/g, ' '); // code blocks
  text = text.replace(/`([^`]+)`/g, '$1');     // inline code
  text = text.replace(/[*_~#]/g, '');          // markdown decorators
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // links [text](url)
  text = text.replace(/https?:\/\/\S+/g, '');  // raw urls

  // 2. Remove Sanskrit Devanagari verses (to avoid butchered robotic pronunciation)
  text = text.replace(/[\u0900-\u097F]+/g, ' ');

  // 3. Remove common emojis and symbols
  text = text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

  // 4. Clean extra punctuation and excessive whitespaces
  text = text.replace(/\s+/g, ' ').trim();

  // 5. If response is very long, limit to first 1200 characters at sentence boundary for smooth playback
  if (text.length > 1200) {
    const cut = text.substring(0, 1200);
    const lastPeriod = Math.max(cut.lastIndexOf('.'), cut.lastIndexOf('?'), cut.lastIndexOf('!'), cut.lastIndexOf('।'));
    if (lastPeriod > 400) {
      text = cut.substring(0, lastPeriod + 1);
    } else {
      text = cut + '...';
    }
  }

  return text;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { text, language } = body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const cleanedText = cleanTextForSpeech(text);
    if (!cleanedText) {
      return NextResponse.json({ error: 'No speakable text found' }, { status: 400 });
    }

    // Detect language: check if explicit 'Telugu' or text contains Telugu Unicode range (\u0C00-\u0C7F)
    const isTelugu = language === 'Telugu' || language === 'te' || /[\u0C00-\u0C7F]/.test(cleanedText);

    // Voice configs tailored for Lord Krishna's gentle, calm, warm bass persona:
    // English: en-IN-PrabhatNeural (Warm, mature, steady Indian male tone with gentle bass)
    // Telugu: te-IN-MohanNeural (Soothing, authentic Telugu male voice)
    const voice = isTelugu ? 'te-IN-MohanNeural' : 'en-IN-PrabhatNeural';
    const lang = isTelugu ? 'te-IN' : 'en-IN';
    const rate = isTelugu ? '-4%' : '-6%';
    const pitch = isTelugu ? '-3Hz' : '-4Hz';

    const tts = new EdgeTTS({
      voice,
      lang,
      rate,
      pitch,
      outputFormat: 'audio-24khz-48kbitrate-mono-mp3'
    });

    const uniqueId = `krishna-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const tempFilePath = path.join(os.tmpdir(), `${uniqueId}.mp3`);

    await tts.ttsPromise(cleanedText, tempFilePath);

    const audioBuffer = await fs.promises.readFile(tempFilePath);
    await fs.promises.unlink(tempFilePath).catch(() => {});

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'X-Krishna-Voice': voice,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/voice:', error);
    return NextResponse.json(
      { error: error?.message || 'Voice synthesis failed' },
      { status: 500 }
    );
  }
}
