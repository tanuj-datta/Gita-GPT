'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import gitaData from '@/lib/gita-data.json';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLanding, setIsLanding] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState<'English' | 'Telugu' | null>(null);
  const [customContext, setCustomContext] = useState('');
  const [showContextInput, setShowContextInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Background Music and TTS States
  const [bgMusicPlaying, setBgMusicPlaying] = useState(false);
  const [speakingMsgIndex, setSpeakingMsgIndex] = useState<number | null>(null);
  const [speakingType, setSpeakingType] = useState<'sanskrit' | 'explanation' | null>(null);
  const [speakingDaily, setSpeakingDaily] = useState<'sanskrit' | 'translation' | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Database Chat State
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatList, setChatList] = useState<any[]>([]);

  // Client-Side Layout & Sloka States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dailySloka, setDailySloka] = useState<any>(null);
  const [showDailyWisdom, setShowDailyWisdom] = useState(true);

  const scrollToBottom = () => {
    const container = document.getElementById('chat-messages-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  };

  const renderMessageContent = (content: string) => {
    if (!content) return null;
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return (
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} style={{ color: 'var(--accent-gold-light)', fontWeight: '700' }}>{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </div>
    );
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Background Music playback controls
  useEffect(() => {
    if (audioRef.current) {
      if (bgMusicPlaying) {
        audioRef.current.play().catch(e => console.warn("Audio autoplay blocked or failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [bgMusicPlaying]);

  // Set initial background music volume and handle speech initialization
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.12; // Set volume to 12% (quiet ambient)
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
      window.speechSynthesis.getVoices(); // Force load voices
    }

    // Select a random powerful sloka on the client side only to avoid hydration mismatches
    // The selection is pseudo-randomized daily based on the current calendar date seed,
    // ensuring a fresh random sloka everyday that remains stable throughout the day.
    const allSlokas: any[] = [];
    gitaData.chapters.forEach((chap: any) => {
      chap.slokas.forEach((s: any) => {
        allSlokas.push({
          ...s,
          chapterNumber: chap.number,
          chapterName: chap.name
        });
      });
    });
    if (allSlokas.length > 0) {
      const today = new Date();
      const y = today.getFullYear();
      const m = today.getMonth() + 1;
      const d = today.getDate();
      // Seed formula: YYYYMMDD
      const seed = y * 10000 + m * 100 + d;
      // Linear Congruential Generator (LCG) parameters to produce pseudorandom numbers
      const a = 1664525;
      const c = 1013904223;
      const m_val = Math.pow(2, 32);
      const rand = (a * seed + c) % m_val;
      const randomIndex = rand % allSlokas.length;
      setDailySloka(allSlokas[randomIndex]);
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stop current speech playback if chat changes or component unmounts
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingMsgIndex(null);
      setSpeakingType(null);
      setSpeakingDaily(null);
    }
  }, [activeChatId]);

  // Extract Sanskrit Devanagari lines or fallback to transliterated text
  const extractSanskrit = (content: string): string => {
    const devanagariRegex = /[\u0900-\u097F]/;
    const latinRegex = /[a-zA-Z]/;
    const teluguRegex = /[\u0c00-\u0c7f]/;
    const lines = content.split('\n');
    const sanskritLines = lines.filter(line => {
      const trimmed = line.trim();
      return devanagariRegex.test(trimmed) && !latinRegex.test(trimmed) && !teluguRegex.test(trimmed);
    });
    
    if (sanskritLines.length > 0) {
      return sanskritLines.join(' ').replace(/[*#_]/g, '').trim();
    }
    
    // Fallback: search for verse lines between Chapter/Verse citation and Translation/Meaning
    const citationIndex = lines.findIndex(l => l.includes('Chapter') || l.includes('Verse'));
    const meaningIndex = lines.findIndex(l => l.toLowerCase().includes('meaning') || l.toLowerCase().includes('translation'));
    
    if (citationIndex !== -1 && meaningIndex !== -1 && meaningIndex > citationIndex + 1) {
      return lines.slice(citationIndex + 1, meaningIndex).join(' ').replace(/[*#_]/g, '').trim();
    }
    
    return lines.slice(0, 2).join(' ').replace(/[*#_]/g, '').trim();
  };

  // Speak bot message content using Web Speech API
  const handleSpeakMessage = (content: string, isSanskrit: boolean, index: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (speakingMsgIndex === index && speakingType === (isSanskrit ? 'sanskrit' : 'explanation')) {
      window.speechSynthesis.cancel();
      setSpeakingMsgIndex(null);
      setSpeakingType(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingDaily(null); // Reset daily sloka voice state if playing

    let textToSpeak = '';
    if (isSanskrit) {
      textToSpeak = extractSanskrit(content);
      if (!textToSpeak) {
        textToSpeak = content; // Fallback
      }
    } else {
      // For translation/explanation, filter out Devanagari lines
      const devanagariRegex = /[\u0900-\u097F]/;
      const lines = content.split('\n');
      const nonSanskritLines = lines.filter(line => !devanagariRegex.test(line));
      textToSpeak = nonSanskritLines.join('\n').replace(/[*#_]/g, '').trim();
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const voices = window.speechSynthesis.getVoices();

    if (isSanskrit) {
      // Find a Hindi voice (hi-IN) or Indian English voice (en-IN) for accurate Sanskrit phonetics
      const hindiVoice = voices.find(v => v.lang.startsWith('hi-') || v.lang.startsWith('sa-'))
                        || voices.find(v => v.lang.startsWith('en-IN'));
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }
      utterance.rate = 0.78; // Slower, rhythmic flow for slokas
      utterance.pitch = 0.95; // Steady, resonant pitch
    } else {
      // Search for English/Telugu voices
      const targetPrefix = language === 'Telugu' ? 'te-IN' : 'en-';
      const langVoice = voices.find(v => v.lang.startsWith(targetPrefix))
                        || voices.find(v => v.lang.startsWith('en-IN'))
                        || voices.find(v => v.lang.startsWith('en-'));
      if (langVoice) {
        utterance.voice = langVoice;
      }
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
    }

    utterance.onend = () => {
      setSpeakingMsgIndex(null);
      setSpeakingType(null);
    };

    utterance.onerror = (e) => {
      console.error("Speech Synthesis error:", e);
      setSpeakingMsgIndex(null);
      setSpeakingType(null);
    };

    setSpeakingMsgIndex(index);
    setSpeakingType(isSanskrit ? 'sanskrit' : 'explanation');
    window.speechSynthesis.speak(utterance);
  };

  const handleSpeakDaily = (sanskrit: string, translation: string, isSanskrit: boolean) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const targetType = isSanskrit ? 'sanskrit' : 'translation';
    if (speakingDaily === targetType) {
      window.speechSynthesis.cancel();
      setSpeakingDaily(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingMsgIndex(null);
    setSpeakingType(null);

    const textToSpeak = isSanskrit ? sanskrit : translation;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const voices = window.speechSynthesis.getVoices();

    if (isSanskrit) {
      const hindiVoice = voices.find(v => v.lang.startsWith('hi-') || v.lang.startsWith('sa-'))
                        || voices.find(v => v.lang.startsWith('en-IN'));
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }
      utterance.rate = 0.78;
      utterance.pitch = 0.95;
    } else {
      const targetPrefix = language === 'Telugu' ? 'te-IN' : 'en-';
      const langVoice = voices.find(v => v.lang.startsWith(targetPrefix))
                        || voices.find(v => v.lang.startsWith('en-IN'))
                        || voices.find(v => v.lang.startsWith('en-'));
      if (langVoice) {
        utterance.voice = langVoice;
      }
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
    }

    utterance.onend = () => {
      setSpeakingDaily(null);
    };

    utterance.onerror = (e) => {
      console.error("Speech Synthesis error:", e);
      setSpeakingDaily(null);
    };

    setSpeakingDaily(targetType);
    window.speechSynthesis.speak(utterance);
  };

  const extractSanskritForCard = (content: string): string => {
    const devanagariRegex = /[\u0900-\u097F]/;
    const latinRegex = /[a-zA-Z]/;
    const teluguRegex = /[\u0c00-\u0c7f]/;
    const lines = content.split('\n');
    const sanskritLines = lines.filter(line => {
      const trimmed = line.trim();
      return devanagariRegex.test(trimmed) && !latinRegex.test(trimmed) && !teluguRegex.test(trimmed);
    });
    if (sanskritLines.length > 0) {
      return sanskritLines.join('\n').replace(/[*#_]/g, '').trim();
    }
    return "परित्राणाय साधूनां विनाशाय च दुष्कृताम्।\nधर्मसंस्थापनार्थाय सम्भवामि युगे युगे॥";
  };

  const extractCitationForCard = (content: string): string => {
    const patterns = [
      /\*\*(Chapter\s*\d+[\s,:]*Verse\s*\d+)\*\*/i,
      /\*\*(అధ్యాయం\s*\d+[\s,:]*శ్లోకం\s*\d+)\*\*/i,
      /Chapter\s*\d+[\s,:]*Verse\s*\d+/i,
      /అధ్యాయం\s*\d+[\s,:]*శ్లోకం\s*\d+/i,
      /Chapter\s*\d+\s*:\s*\d+/i,
      /BG\s*\d+\.\d+/i,
      /Gita\s*\d+\.\d+/i
    ];
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return match[0].replace(/\*\*/g, '').trim();
      }
    }
    return "Bhagavad Gita";
  };

  const extractTranslationForCard = (content: string): string => {
    const lines = content.split('\n');
    const devanagariRegex = /[\u0900-\u097F]/;
    const filtered = lines.filter(line => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      if (devanagariRegex.test(trimmed)) return false;
      if (trimmed.includes('Chapter') && trimmed.includes('Verse')) return false;
      if (trimmed.includes('అధ్యాయం') && trimmed.includes('శ్లోకం')) return false;
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) return false;
      if (trimmed.toLowerCase().includes('transliteration:')) return false;
      return true;
    });

    if (filtered.length > 0) {
      for (const line of filtered) {
        let cleaned = line.replace(/[*#_]/g, '').trim();
        cleaned = cleaned.replace(/^(translation|meaning|telugu translation|తాత్పర్యం|భావం|శ్లోకం భావం)\s*:\s*/i, '');
        if (cleaned.length > 15) {
          return cleaned;
        }
      }
      let firstCleaned = filtered[0].replace(/[*#_]/g, '').trim();
      firstCleaned = firstCleaned.replace(/^(translation|meaning|telugu translation|తాత్పర్యం|భావం|శ్లోకం భావం)\s*:\s*/i, '');
      return firstCleaned;
    }
    
    return language === 'Telugu' 
      ? "సమస్త ధర్మాలను వదిలి నన్నొక్కడినే శరణు వేడుము. నేను నిన్ను అన్ని పాపాల నుండి విముక్తుడిని చేస్తాను, భయపడకుము."
      : "Focus on your actions, never on the fruits of your actions. Perform your duty with devotion.";
  };

  const handleExportCard = (sanskrit: string, translation: string, citation: string, isTelugu: boolean) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Draw Background (Saffron-Sandalwood Radial Gradient)
    const gradient = ctx.createRadialGradient(540, 540, 50, 540, 540, 750);
    gradient.addColorStop(0, '#FFF2D9'); // Sandalwood center glow
    gradient.addColorStop(0.3, '#FF9933'); // Warm Saffron
    gradient.addColorStop(0.75, '#802000'); // Deep Terracotta
    gradient.addColorStop(1, '#330800'); // Dark Maroon edges
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);

    // Gold gradient for borders
    const goldGrad = ctx.createLinearGradient(0, 0, 1080, 1080);
    goldGrad.addColorStop(0, '#FFE899');
    goldGrad.addColorStop(0.3, '#F5C443');
    goldGrad.addColorStop(0.5, '#D4AF37'); // Metallic Gold
    goldGrad.addColorStop(0.7, '#B8860B');
    goldGrad.addColorStop(1, '#6B5400');
    
    // Draw outer border (inset by 45px)
    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 4;
    ctx.strokeRect(45, 45, 990, 990);
    
    // Draw inner border (inset by 58px)
    ctx.lineWidth = 1.5;
    ctx.strokeRect(58, 58, 964, 964);
    
    // Corner accents - concentric loops/arcs
    // TL
    ctx.beginPath();
    ctx.arc(45, 45, 40, 0, Math.PI / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(45, 45, 25, 0, Math.PI / 2);
    ctx.stroke();
    
    // TR
    ctx.beginPath();
    ctx.arc(1035, 45, 40, Math.PI / 2, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(1035, 45, 25, Math.PI / 2, Math.PI);
    ctx.stroke();
    
    // BR
    ctx.beginPath();
    ctx.arc(1035, 1035, 40, Math.PI, 3 * Math.PI / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(1035, 1035, 25, Math.PI, 3 * Math.PI / 2);
    ctx.stroke();
    
    // BL
    ctx.beginPath();
    ctx.arc(45, 1035, 40, 3 * Math.PI / 2, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(45, 1035, 25, 3 * Math.PI / 2, 2 * Math.PI);
    ctx.stroke();
    
    // Draw diamonds at corner junctions
    const drawDiamond = (cx: number, cy: number, size: number) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy - size);
      ctx.lineTo(cx + size, cy);
      ctx.lineTo(cx, cy + size);
      ctx.lineTo(cx - size, cy);
      ctx.closePath();
      ctx.fillStyle = goldGrad;
      ctx.fill();
    };
    
    drawDiamond(45, 45, 8);
    drawDiamond(1035, 45, 8);
    drawDiamond(1035, 1035, 8);
    drawDiamond(45, 1035, 8);

    // 2. Draw Diya/Oil Lamp
    const cx = 540;
    const cy = 135;
    
    // Flame glow
    const flameGlow = ctx.createRadialGradient(cx, cy - 25, 2, cx, cy - 25, 45);
    flameGlow.addColorStop(0, 'rgba(255, 255, 200, 0.9)');
    flameGlow.addColorStop(0.3, 'rgba(255, 165, 0, 0.6)');
    flameGlow.addColorStop(1, 'rgba(255, 69, 0, 0)');
    ctx.fillStyle = flameGlow;
    ctx.beginPath();
    ctx.arc(cx, cy - 25, 45, 0, Math.PI * 2);
    ctx.fill();

    // Flame center (tear-drop shape)
    ctx.beginPath();
    ctx.moveTo(cx, cy - 50); // Flame tip
    ctx.bezierCurveTo(cx - 14, cy - 22, cx - 14, cy, cx, cy); // Left side
    ctx.bezierCurveTo(cx + 14, cy, cx + 14, cy - 22, cx, cy - 50); // Right side
    ctx.closePath();

    const flameGrad = ctx.createLinearGradient(cx, cy - 50, cx, cy);
    flameGrad.addColorStop(0, '#FFFFFF'); // White core
    flameGrad.addColorStop(0.3, '#FFE066'); // Golden yellow
    flameGrad.addColorStop(0.8, '#FF5500'); // Deep orange-red
    ctx.fillStyle = flameGrad;
    ctx.fill();

    // Diya Base
    ctx.beginPath();
    ctx.moveTo(cx - 45, cy);
    ctx.bezierCurveTo(cx - 35, cy + 32, cx + 35, cy + 32, cx + 45, cy);
    ctx.bezierCurveTo(cx + 12, cy + 6, cx - 12, cy + 6, cx - 45, cy);
    ctx.closePath();
    
    const baseGrad = ctx.createLinearGradient(cx - 45, cy, cx + 45, cy);
    baseGrad.addColorStop(0, '#5C2E0B');
    baseGrad.addColorStop(0.5, '#CD853F');
    baseGrad.addColorStop(1, '#5C2E0B');
    ctx.fillStyle = baseGrad;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = goldGrad;
    ctx.stroke();

    // 3. Draw Header Texts
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.fillStyle = '#FFE8CC';
    ctx.font = 'bold 22px "Inter", "Segoe UI", sans-serif';
    ctx.fillText(isTelugu ? "భగవద్గీత" : "BHAGAVAD GITA", 540, 195);
    
    ctx.fillStyle = '#FF9E3D';
    ctx.font = 'italic bold 20px "Georgia", serif';
    ctx.fillText(citation, 540, 235);
    
    // Thin gold divider line
    ctx.strokeStyle = 'rgba(245, 196, 67, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(420, 265);
    ctx.lineTo(660, 265);
    ctx.stroke();

    // 4. Draw Sanskrit Devanagari
    ctx.fillStyle = '#FFEBD6';
    ctx.font = 'italic bold 32px "Noto Serif Devanagari", "Georgia", "Mukta", serif';
    
    // Add text shadow for beautiful pop
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    const sanskritLines = sanskrit.split('\n');
    let currentY = 330;
    const sanskritLineHeight = 52;
    
    for (const line of sanskritLines) {
      if (line.trim()) {
        ctx.fillText(line.trim(), 540, currentY);
        currentY += sanskritLineHeight;
      }
    }
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 5. Center Divider between Sanskrit and Translation
    const dividerY = Math.max(currentY + 10, 520);
    ctx.strokeStyle = 'rgba(245, 196, 67, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(460, dividerY);
    ctx.lineTo(620, dividerY);
    ctx.stroke();
    
    drawDiamond(540, dividerY, 6);

    // 6. Draw Translation
    ctx.fillStyle = '#FFFFFF';
    ctx.font = isTelugu 
      ? '500 24px "Inter", "Segoe UI", sans-serif'
      : '500 24px "Georgia", serif';
    
    const translationY = dividerY + 50;
    const translationLineHeight = 36;
    const maxTranslationWidth = 780;
    
    const words = translation.split(' ');
    let currentLine = '';
    let textY = translationY;
    
    for (let n = 0; n < words.length; n++) {
      const testLine = currentLine + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxTranslationWidth && n > 0) {
        ctx.fillText(currentLine, 540, textY);
        currentLine = words[n] + ' ';
        textY += translationLineHeight;
      } else {
        currentLine = testLine;
      }
    }
    ctx.fillText(currentLine, 540, textY);

    // 7. Draw Watermark/Signature at the bottom
    ctx.fillStyle = 'rgba(255, 232, 204, 0.4)';
    ctx.font = 'bold 20px "Inter", sans-serif';
    ctx.fillText("Gita-GPT 🪈", 540, 1005);
    
    // 8. Trigger Download
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `gita-wisdom-${citation.toLowerCase().replace(/[\s,:]+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate and download card:", err);
    }
  };

  // Fetch list of chats (combining server and client local chats)
  const fetchChats = async () => {
    try {
      let serverChats: any[] = [];
      try {
        const res = await fetch('/api/chats');
        if (res.ok) {
          serverChats = await res.json();
        }
      } catch (e) {
        console.warn("Failed to fetch server chats, using fallback:", e);
      }
      
      let localChats: any[] = [];
      if (typeof window !== 'undefined') {
        const localChatsRaw = localStorage.getItem('gita_chats');
        localChats = localChatsRaw ? JSON.parse(localChatsRaw) : [];
      }
      
      const merged = [...localChats, ...serverChats].sort((a, b) => {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
      
      setChatList(merged);
    } catch (e) {
      console.error("Failed to fetch chat list:", e);
    }
  };

  // Save local chat history
  const saveChatLocally = (id: string, msgs: Message[], lang: string, ctx: string) => {
    if (!id.startsWith('local-chat-')) return;
    try {
      const localChatsRaw = localStorage.getItem('gita_chats');
      let localChats = localChatsRaw ? JSON.parse(localChatsRaw) : [];
      
      const existingIndex = localChats.findIndex((c: any) => c.id === id);
      const firstUserMsg = msgs.find(m => m.role === 'user')?.content || 'New Conversation';
      const title = firstUserMsg.length > 35 ? firstUserMsg.substring(0, 35) + "..." : firstUserMsg;
      
      const chatData = {
        id,
        title,
        language: lang,
        customContext: ctx,
        messages: msgs,
        updatedAt: new Date().toISOString()
      };
      
      if (existingIndex > -1) {
        localChats[existingIndex] = chatData;
      } else {
        localChats.unshift(chatData);
      }
      
      localStorage.setItem('gita_chats', JSON.stringify(localChats));
      fetchChats();
    } catch (e) {
      console.error("Failed to save chat locally:", e);
    }
  };

  // Load chat list on mount
  useEffect(() => {
    fetchChats();
  }, []);

  // Start new chat
  const startNewChat = () => {
    setMessages([]);
    setActiveChatId(null);
    setLanguage(null);
    setCustomContext('');
    setIsLanding(true);
    setShowDailyWisdom(true);
  };

  // Load existing chat
  const loadChat = async (id: string) => {
    if (id.startsWith('local-chat-')) {
      try {
        const localChatsRaw = localStorage.getItem('gita_chats');
        const localChats = localChatsRaw ? JSON.parse(localChatsRaw) : [];
        const chat = localChats.find((c: any) => c.id === id);
        if (chat) {
          setActiveChatId(chat.id);
          setLanguage(chat.language);
          setCustomContext(chat.customContext || '');
          setIsLanding(false);
          setMessages(chat.messages || []);
        }
      } catch (e) {
        console.error("Failed to load local chat:", e);
      }
      return;
    }

    try {
      const res = await fetch(`/api/chats/${id}`);
      if (res.ok) {
        const chat = await res.json();
        setActiveChatId(chat.id);
        setLanguage(chat.language);
        setCustomContext(chat.customContext || '');
        setIsLanding(false);
        if (chat.messages && chat.messages.length > 0) {
          setMessages(chat.messages.map((m: any) => ({
            role: m.role as 'user' | 'bot',
            content: m.content
          })));
        } else {
          setMessages([]);
        }
      }
    } catch (e) {
      console.error("Failed to load chat details:", e);
    }
  };

  // Delete chat
  const deleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this conversation?")) {
      if (id.startsWith('local-chat-')) {
        try {
          const localChatsRaw = localStorage.getItem('gita_chats');
          let localChats = localChatsRaw ? JSON.parse(localChatsRaw) : [];
          localChats = localChats.filter((c: any) => c.id !== id);
          localStorage.setItem('gita_chats', JSON.stringify(localChats));
          
          fetchChats();
          if (activeChatId === id) {
            startNewChat();
          }
        } catch (e) {
          console.error("Failed to delete local chat:", e);
        }
        return;
      }

      try {
        const res = await fetch(`/api/chats/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          fetchChats();
          if (activeChatId === id) {
            startNewChat();
          }
        }
      } catch (e) {
        console.error("Failed to delete chat:", e);
      }
    }
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingMsgIndex(null);
      setSpeakingType(null);
    }

    if (isLanding) setIsLanding(false);

    const userMessage: Message = { role: 'user', content: text };
    setMessages((prev) => {
      const nextMsgs = [...prev, userMessage];
      if (activeChatId && activeChatId.startsWith('local-chat-')) {
        saveChatLocally(activeChatId, nextMsgs, language || 'English', customContext);
      }
      return nextMsgs;
    });
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chatId: activeChatId && !activeChatId.startsWith('local-chat-') ? activeChatId : null,
          message: text, 
          language, 
          customContext 
        }),
      });

      if (!response.ok) throw new Error('Stream error');

      // Update active chat ID if a new chat was created
      let returnedChatId = response.headers.get("X-Chat-ID");
      let activeIdToUse = activeChatId;

      if (returnedChatId && returnedChatId !== activeChatId) {
        setActiveChatId(returnedChatId);
        activeIdToUse = returnedChatId;
      } else if (!returnedChatId && !activeChatId) {
        returnedChatId = `local-chat-${Date.now()}`;
        setActiveChatId(returnedChatId);
        activeIdToUse = returnedChatId;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      // Initialize an empty bot message
      setMessages((prev) => [...prev, { role: 'bot', content: '' }]);
      setIsTyping(false);

      if (reader) {
        let fullContent = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;
          
          // Update the last bot message with the new chunk (handling React concurrency state lag)
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === 'bot') {
              lastMessage.content = fullContent;
            } else {
              newMessages.push({ role: 'bot', content: fullContent });
            }
            return newMessages;
          });
        }

        // Persist final local chat state
        if (activeIdToUse && activeIdToUse.startsWith('local-chat-')) {
          setMessages((prev) => {
            saveChatLocally(activeIdToUse, prev, language || 'English', customContext);
            return prev;
          });
        }
      }

      // Refresh chats list to display the updated order
      fetchChats();
    } catch (error) {
      console.error(error);
      const errorMessage: Message = { 
        role: 'bot', 
        content: "My dear friend, the divine connection seems to be fluctuating. Please try again in a moment. 🪈" 
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const suggestions = [
    { title: "Seek Guidance", desc: "I am feeling very stressed and anxious about my career.", icon: "🧘" },
    { title: "Retrieve Sloka", desc: "Show me Chapter 2 Sloka 47 and its meaning.", icon: "📖" },
    { title: "Find Peace", desc: "How can I find inner peace in a chaotic world?", icon: "🕊️" },
    { title: "Overcome Fear", desc: "I am scared of what the future holds for me.", icon: "🛡️" },
  ];

  return (
    <div className="app-container">
      {/* Background Music Audio Element */}
      <audio 
        ref={audioRef} 
        src="/audio/monsoon_whispers.m4a" 
        loop 
        preload="auto"
      />
      <div className="bg-grid"></div>
      <div className="bg-oil-lamp"></div>
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="new-chat-btn" onClick={() => { startNewChat(); setSidebarOpen(false); }}>
          <span>+</span> New Chat
        </button>
        <div className="chat-list">
          {chatList.map((chat) => (
            <div 
              key={chat.id} 
              className={`chat-item ${activeChatId === chat.id ? 'active' : ''}`}
              onClick={() => { loadChat(chat.id); setSidebarOpen(false); }}
            >
              <span className="chat-item-text" title={chat.title}>{chat.title}</span>
              <button 
                className="chat-item-delete" 
                onClick={(e) => deleteChat(chat.id, e)}
                title="Delete Chat"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          ))}
          {chatList.length === 0 && (
            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem', fontStyle: 'italic' }}>
              No chats saved yet
            </div>
          )}
        </div>
      </aside>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Main Chat Area */}
      <main className="main-chat">
        <header className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="mobile-menu-btn" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle Sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <div 
              className="logo" 
              style={{ fontWeight: 600, color: 'var(--accent-gold)', cursor: 'pointer' }}
              onClick={() => {
                setLanguage(null);
                setIsLanding(true);
                setMessages([]);
                setShowDailyWisdom(true);
                if (typeof window !== 'undefined' && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                }
                setSpeakingMsgIndex(null);
                setSpeakingType(null);
                setSpeakingDaily(null);
              }}
            >
              Gita-GPT {language && `(${language})`} 🪈
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setBgMusicPlaying(!bgMusicPlaying)}
              className={`music-toggle-btn ${bgMusicPlaying ? 'playing' : ''}`}
              title={bgMusicPlaying ? "Pause soothing flute music" : "Play soothing flute music"}
              style={{
                background: bgMusicPlaying ? 'rgba(255, 179, 0, 0.1)' : 'var(--glass-hover)',
                border: bgMusicPlaying ? '1px solid rgba(255, 179, 0, 0.3)' : '1px solid var(--glass-border)',
                color: bgMusicPlaying ? 'var(--accent-gold)' : 'var(--text-muted)',
                padding: '0.5rem 1rem',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                fontWeight: 500,
                transition: 'all 0.3s ease',
              }}
            >
              {bgMusicPlaying ? (
                <>
                  <span className="audio-waves">
                    <span className="wave-bar bar-1"></span>
                    <span className="wave-bar bar-2"></span>
                    <span className="wave-bar bar-3"></span>
                  </span>
                  <span>Soothing Flute</span>
                </>
              ) : (
                <>
                  <span>🪈</span>
                  <span>Soothing Flute</span>
                </>
              )}
            </button>
            <div className="user-profile" style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--glass-hover)' }}></div>
          </div>
        </header>

        {!language ? (
          <div className="landing">
            <div className="hero-image-wrapper">
                <Image 
                    src="/images/krishna_hero.png" 
                    alt="Lord Krishna" 
                    fill 
                    sizes="(max-width: 768px) 100vw, 200px"
                    className="hero-image"
                    priority
                />
            </div>
            <h1>Choose Your Language</h1>
            <p>Select the language in which you wish to explore the divine wisdom of the Bhagavad Gita.</p>
            
            <div className="suggestions" style={{ gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: '400px' }}>
              <div className="suggestion-card" onClick={() => { setLanguage('English'); setShowDailyWisdom(true); }}>
                <h3 style={{ textAlign: 'center', fontSize: '1.2rem' }}>English</h3>
              </div>
              <div className="suggestion-card" onClick={() => { setLanguage('Telugu'); setShowDailyWisdom(true); }}>
                <h3 style={{ textAlign: 'center', fontSize: '1.2rem' }}>తెలుగు (Telugu)</h3>
              </div>
            </div>
          </div>
        ) : isLanding ? (
          <div className="landing">
            <div className="hero-image-wrapper">
                <Image 
                    src="/images/krishna_hero.png" 
                    alt="Lord Krishna" 
                    fill 
                    sizes="(max-width: 768px) 100vw, 200px"
                    className="hero-image"
                    priority
                />
            </div>
            <h1>Welcome, Seeker</h1>
            <p>Explore the eternal wisdom of the Bhagavad Gita. Seek guidance for life's challenges or find specific verses to illuminate your path.</p>
            
            {dailySloka && showDailyWisdom && (
              <div className="daily-sloka-card" style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowDailyWisdom(false)}
                  className="daily-sloka-close"
                  title="Dismiss Daily Wisdom"
                >
                  ✕
                </button>
                <div className="daily-sloka-badge">
                  <span>✨ {language === 'Telugu' ? "నేటి శ్లోకం" : "DAILY WISDOM"}</span>
                </div>
                <h3 className="daily-sloka-citation">
                  {language === 'Telugu' 
                    ? `అధ్యాయం ${dailySloka.chapterNumber}, శ్లోకం ${dailySloka.number}` 
                    : `Chapter ${dailySloka.chapterNumber}, Verse ${dailySloka.number}`}
                </h3>
                <div className="daily-sloka-sanskrit">
                  {dailySloka.sanskrit}
                </div>
                <blockquote className="daily-sloka-translation">
                  {language === 'Telugu' ? dailySloka.telugu : dailySloka.english}
                </blockquote>
                <div className="daily-sloka-actions">
                  <button
                    onClick={() => handleSpeakDaily(dailySloka.sanskrit, language === 'Telugu' ? dailySloka.telugu : dailySloka.english, true)}
                    className={`daily-action-btn ${speakingDaily === 'sanskrit' ? 'active' : ''}`}
                    title="Pronounce Sanskrit Sloka"
                  >
                    {speakingDaily === 'sanskrit' ? "⏸️ Stop Pronunciation" : "🪈 Pronounce Sloka"}
                  </button>
                  <button
                    onClick={() => handleSpeakDaily(dailySloka.sanskrit, language === 'Telugu' ? dailySloka.telugu : dailySloka.english, false)}
                    className={`daily-action-btn ${speakingDaily === 'translation' ? 'active' : ''}`}
                    title="Listen to Translation"
                  >
                    {speakingDaily === 'translation' ? "⏸️ Stop Translation" : "🔊 Listen Translation"}
                  </button>
                  <button
                    onClick={() => handleExportCard(
                      dailySloka.sanskrit, 
                      language === 'Telugu' ? dailySloka.telugu : dailySloka.english, 
                      language === 'Telugu' ? `అధ్యాయం ${dailySloka.chapterNumber}, శ్లోకం ${dailySloka.number}` : `Chapter ${dailySloka.chapterNumber}, Verse ${dailySloka.number}`,
                      language === 'Telugu'
                    )}
                    className="daily-action-btn export"
                    title="Export as Wisdom Card"
                  >
                    🎨 Export Card
                  </button>
                </div>
              </div>
            )}

            <div className="suggestions">
              {suggestions.map((s, i) => (
                <div key={i} className="suggestion-card" onClick={() => handleSend(s.desc)}>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div id="chat-messages-container" className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role === 'bot' ? 'bot-message' : 'user-message'}`}>
                <div className="avatar">
                  {msg.role === 'bot' ? '🪈' : '👤'}
                </div>
                <div className="message-content">
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '0.4rem' 
                  }}>
                    <span style={{ 
                      fontWeight: 600, 
                      fontSize: '0.85rem', 
                      color: msg.role === 'bot' ? 'var(--accent-gold)' : 'var(--text-muted)' 
                    }}>
                      {msg.role === 'bot' ? "Krishna's Wisdom" : 'You'}
                    </span>
                    {msg.role === 'bot' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleSpeakMessage(msg.content, true, i)}
                          className={`speech-btn ${speakingMsgIndex === i && speakingType === 'sanskrit' ? 'active' : ''}`}
                          title="Pronounce Sanskrit Sloka"
                        >
                          {speakingMsgIndex === i && speakingType === 'sanskrit' ? (
                            <>⏸️ Stop Sloka</>
                          ) : (
                            <>🪈 Pronounce Sloka</>
                          )}
                        </button>
                        <button
                          onClick={() => handleSpeakMessage(msg.content, false, i)}
                          className={`speech-btn ${speakingMsgIndex === i && speakingType === 'explanation' ? 'active' : ''}`}
                          title="Listen to translation and explanation"
                        >
                          {speakingMsgIndex === i && speakingType === 'explanation' ? (
                            <>⏸️ Stop Explanation</>
                          ) : (
                            <>🔊 Listen Explanation</>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            const sanskrit = extractSanskritForCard(msg.content);
                            const citation = extractCitationForCard(msg.content);
                            const translation = extractTranslationForCard(msg.content);
                            handleExportCard(sanskrit, translation, citation, language === 'Telugu');
                          }}
                          className="export-btn"
                          title="Export as Wisdom Card"
                        >
                          🎨 Export Card
                        </button>
                      </div>
                    )}
                  </div>
                  {renderMessageContent(msg.content)}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message bot-message">
                <div className="avatar">🪈</div>
                <div className="message-content" style={{ color: 'var(--text-muted)' }}>Krishna is reflecting...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {language && (
          <div className="input-container">
            <div className="input-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem', padding: '1rem 1.5rem', borderRadius: '24px' }}>
              {showContextInput && (
                <div className="context-row" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--accent-gold)' }}>Custom Grounding Context / Background Info</span>
                    {customContext.trim() && (
                      <button 
                        onClick={() => setCustomContext('')}
                        style={{ background: 'transparent', border: 'none', color: 'var(--saffron)', fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        Clear Context
                      </button>
                    )}
                  </div>
                  <textarea
                    className="context-textarea-inline"
                    style={{
                      width: '100%',
                      height: '60px',
                      background: 'rgba(0, 0, 0, 0.2)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      padding: '0.5rem 0.75rem',
                      color: 'var(--text-main)',
                      fontFamily: 'var(--font-content)',
                      fontSize: '0.85rem',
                      resize: 'none',
                      outline: 'none'
                    }}
                    placeholder="Tell Krishna about your background or situation for personalized guidance..."
                    value={customContext}
                    onChange={(e) => setCustomContext(e.target.value)}
                  />
                </div>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                  className={`context-toggle-btn ${showContextInput ? 'active' : ''}`}
                  onClick={() => setShowContextInput(!showContextInput)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: showContextInput || customContext.trim() ? 'var(--accent-gold)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    borderRadius: '50%',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  title="Add Custom Grounding Context"
                >
                  📜
                  {customContext.trim() && !showContextInput && (
                    <span style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--accent-gold)',
                      boxShadow: '0 0 8px var(--accent-gold)'
                    }} />
                  )}
                </button>
                
                <textarea 
                  className="chat-input"
                  placeholder="Ask about a sloka or share how you feel..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                
                <button className="send-btn" onClick={() => handleSend()}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.8rem' }}>
              Gita-GPT can provide spiritual guidance but is not a substitute for professional mental health support.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
