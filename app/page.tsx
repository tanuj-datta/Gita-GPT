'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import gitaData from '@/lib/gita-data.json';
import { useSession, signIn, signOut } from "next-auth/react";
import { useAudio } from '@/components/AudioContext';
import ChapterRoadmap from '@/components/ChapterRoadmap';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLanding, setIsLanding] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState<'English' | 'Telugu'>('English');
  const [customContext, setCustomContext] = useState('');
  const [showContextInput, setShowContextInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Background Music from global context
  const { bgMusicPlaying, setBgMusicPlaying } = useAudio();

  // Divine Sanctuary: Particles, Chime & Shifting Quotes
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chimeTriggeredRef = useRef<boolean>(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteFading, setQuoteFading] = useState(false);

  // Shifting Divine Quotes (English & Telugu)
  const divineQuotes = useMemo(() => {
    return language === 'Telugu' ? [
      "నీ ఆత్మలో సందేహం కలిగినప్పుడల్లా, నేను నీతోనే ఉన్నాను.",
      "కర్మ చేయడమే నీ హక్కు, ఫలితంపై నీకు అధికారం లేదు.",
      "శాంతి అంతరంగం నుండే ఉద్భవిస్తుంది. దానిని బయట వెతకకు.",
      "మనిషి తన స్వంత మనస్సు ద్వారానే ఉన్నత స్థాయికి ఎదగగలడు.",
      "ఆత్మకు పుట్టుక లేదు, మరణం అంతకంటే లేదు."
    ] : [
      "Whenever doubt shakes your spirit, I am here.",
      "You have a right to perform your duty, but not to the fruits of action.",
      "Peace comes from within. Do not seek it without.",
      "A person can rise through the efforts of their own mind.",
      "The soul is neither born, nor does it ever die."
    ];
  }, [language]);

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

  // Auto-expand textarea based on content like modern chat interfaces
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const targetHeight = Math.min(Math.max(scrollHeight, 24), 220);
      textareaRef.current.style.height = `${targetHeight}px`;
    }
  }, [input]);

  // Restore language preference from localStorage
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('gita_preferred_language');
      if (savedLang === 'English' || savedLang === 'Telugu') {
        setLanguage(savedLang);
      }
    } catch {}
  }, []);

  const setAndSaveLanguage = (lang: 'English' | 'Telugu') => {
    setLanguage(lang);
    try {
      localStorage.setItem('gita_preferred_language', lang);
    } catch {}
  };

  // Sacred brass temple bell chime (Web Audio API synthesis - 432 Hz divine harmonics)
  const playTempleChime = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;
      // Sacred 432Hz fundamental + Tibetan bowl bronze harmonics
      const freqs = [432, 864, 1296, 1728];
      const gains = [0.12, 0.06, 0.03, 0.015];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.998, now + 3.2);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(gains[i], now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 3.3);
      });
    } catch {}
  }, []);

  // Ambient chime on first interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!chimeTriggeredRef.current) {
        chimeTriggeredRef.current = true;
        playTempleChime();
      }
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });
    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [playTempleChime]);

  // Shifting Divine Quote (shifts every 6 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteFading(true);
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % divineQuotes.length);
        setQuoteFading(false);
      }, 400);
    }, 6000);

    return () => clearInterval(timer);
  }, [divineQuotes.length]);

  // Golden Celestial Particle Dust Canvas (Reacts to Mouse Movements)
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const particleCount = 55;
    const colors = [
      'rgba(245, 176, 39, ',  // Rich Gold
      'rgba(251, 191, 36, ',  // Bright Gold
      'rgba(254, 240, 138, ', // Pale Celestial Light
      'rgba(45, 212, 191, ',  // Soft Peacock Cyan
    ];

    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.8,
      baseAlpha: Math.random() * 0.45 + 0.2,
      alpha: 0.3,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: -Math.random() * 0.45 - 0.12,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.03 + 0.01,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.pulse += p.pulseSpeed;
        p.alpha = p.baseAlpha + Math.sin(p.pulse) * 0.18;

        p.x += p.speedX;
        p.y += p.speedY;

        // Subtle interactive mouse repulsion / wafting
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130 && dist > 0) {
          const force = (130 - dist) / 130;
          p.x -= (dx / dist) * force * 1.6;
          p.y -= (dy / dist) * force * 1.6;
        }

        // Boundary wrap
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.max(0, Math.min(1, p.alpha))})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(245, 176, 39, 0.4)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Daily Wisdom selection
  useEffect(() => {
    // Select a random powerful sloka on the client side only to avoid hydration mismatches
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
      const a = 1664525;
      const c = 1013904223;
      const m_val = Math.pow(2, 32);
      const rand = (a * seed + c) % m_val;
      const randomIndex = rand % allSlokas.length;
      setDailySloka(allSlokas[randomIndex]);
    }
  }, []);

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
      if (status === 'authenticated') {
        try {
          const res = await fetch('/api/chats');
          if (res.ok) {
            serverChats = await res.json();
          }
        } catch (e) {
          console.warn("Failed to fetch server chats:", e);
        }
      }
      
      let localChats: any[] = [];
      if (status !== 'authenticated' && typeof window !== 'undefined') {
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

  // Sync local chats to database on login, and refresh list
  useEffect(() => {
    const syncLocalChats = async () => {
      if (status === 'authenticated' && typeof window !== 'undefined') {
        try {
          const localChatsRaw = localStorage.getItem('gita_chats');
          const localChats = localChatsRaw ? JSON.parse(localChatsRaw) : [];
          
          if (localChats.length > 0) {
            console.log("Syncing local chats to server for user...");
            for (const localChat of localChats) {
              // 1. Create the chat on the server
              const createRes = await fetch('/api/chats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: localChat.title,
                  language: localChat.language,
                  customContext: localChat.customContext,
                })
              });
              
              if (createRes.ok) {
                const serverChat = await createRes.json();
                const serverChatId = serverChat.id;
                
                // 2. Push messages to the newly created server chat
                if (localChat.messages && localChat.messages.length > 0) {
                  for (const msg of localChat.messages) {
                    await fetch('/api/chat', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        chatId: serverChatId,
                        message: msg.content,
                        language: localChat.language,
                        customContext: localChat.customContext,
                      })
                    });
                  }
                }
              }
            }
            // Clear local storage guest chats after successful sync
            localStorage.removeItem('gita_chats');
          }
        } catch (err) {
          console.error("Failed to sync local chats to user account:", err);
        }
      }
      fetchChats();
    };

    syncLocalChats();
  }, [session, status]);

  // Start new chat
  const startNewChat = () => {
    setMessages([]);
    setActiveChatId(null);
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

  const handleSelectVerse = (chapterNum: number, verseNum: string) => {
    const query = language === 'Telugu'
      ? `అధ్యాయం ${chapterNum} శ్లోకం ${verseNum} చూపించి వివరించు.`
      : `Show me Chapter ${chapterNum} Sloka ${verseNum} and explain it.`;
    handleSend(query);
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
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

  const trendingDilemmas = language === 'Telugu' ? [
    { icon: "🌪️", label: "అశాంతి & భయాందోళన", query: "నా మనస్సు చాలా చంచలంగా, అశాంతిగా ఉంది. మనస్సును ఎలా ప్రశాంతపరచుకోవాలో భగవద్గీత ద్వారా వివరించండి." },
    { icon: "⚔️", label: "గత తప్పుల గిల్ట్", query: "గతంలో జరిగిన నిర్ణయాలు నన్ను నిరంతరం బాధపెడుతున్నాయి. గతం నుండి విముక్తి పొందడానికి కృష్ణుడు ఏమి చెబుతున్నాడు?" },
    { icon: "⚖️", label: "కర్మ & నిష్కామ కర్మ", query: "భగవద్గీతలోని నిష్కామ కర్మ సిద్ధాంతాన్ని సులభమైన మాటల్లో వివరించండి." },
    { icon: "🕊️", label: "జీవిత కర్తవ్యం (ధర్మం)", query: "జీవితంలో కష్టాలు ఎదురైనప్పుడు సరైన ధర్మ మార్గాన్ని ఎలా ఎంచుకోవాలి?" },
  ] : [
    { icon: "🌪️", label: "Anxiety & Restless Mind", query: "I feel very overwhelmed and my mind is constantly restless. How does Krishna advise to calm the mind?" },
    { icon: "⚔️", label: "Regret & Past Guilt", query: "I cannot stop feeling guilty about past mistakes and decisions. How can the Gita help me let go?" },
    { icon: "⚖️", label: "Karma & Detachment", query: "Explain the core teaching of Karma Yoga and detachment from Bhagavad Gita in simple words." },
    { icon: "🕊️", label: "Life Purpose & Dharma", query: "How do I discover my true purpose and duty (Dharma) when everything feels confusing?" },
  ];

  const suggestions = [
    { title: "Seek Guidance", desc: "I am feeling very stressed and anxious about my career.", icon: "🧘" },
    { title: "Retrieve Sloka", desc: "Show me Chapter 2 Sloka 47 and its meaning.", icon: "📖" },
    { title: "Find Peace", desc: "How can I find inner peace in a chaotic world?", icon: "🕊️" },
    { title: "Overcome Fear", desc: "I am scared of what the future holds for me.", icon: "🛡️" },
  ];

  return (
    <div className="app-container">
      {/* Ethereal Atmospheric Glassmorphic Aurora Mesh */}
      <div className="bg-ambient-mesh" aria-hidden="true"></div>
      <div className="bg-ambient-orb-gold" aria-hidden="true"></div>
      <div className="bg-ambient-orb-indigo" aria-hidden="true"></div>
      <div className="bg-ambient-orb-warm" aria-hidden="true"></div>
      <div className="bg-ambient-orb-cyan" aria-hidden="true"></div>
      <div className="bg-grid" aria-hidden="true"></div>
      <canvas ref={particleCanvasRef} className="divine-particle-canvas" aria-hidden="true" />

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
          <div className="header-left">
            <button 
              className="mobile-menu-btn" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle Sidebar"
              aria-label="Toggle Navigation Sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <div 
              className="logo" 
              onClick={() => {
                setIsLanding(true);
                setMessages([]);
                setShowDailyWisdom(true);
              }}
            >
              <span className="logo-title">Gita-GPT</span>
              {language && <span className="logo-badge">{language}</span>}
              <span className="logo-flute">🪈</span>
            </div>
          </div>
          
          <div className="header-right">
            <button
              onClick={() => setBgMusicPlaying(!bgMusicPlaying)}
              className={`music-toggle-btn ${bgMusicPlaying ? 'playing' : ''}`}
              title={bgMusicPlaying ? "Pause soothing flute music" : "Play soothing flute music"}
            >
              {bgMusicPlaying ? (
                <>
                  <span className="audio-waves">
                    <span className="wave-bar bar-1"></span>
                    <span className="wave-bar bar-2"></span>
                    <span className="wave-bar bar-3"></span>
                  </span>
                  <span className="music-btn-text">Soothing Flute</span>
                </>
              ) : (
                <>
                  <span>🪈</span>
                  <span className="music-btn-text">Soothing Flute</span>
                </>
              )}
            </button>
            {status === 'loading' ? (
              <div className="header-auth-spinner" />
            ) : session?.user ? (
              <div className="header-user-profile">
                {session.user.image ? (
                  <Image 
                    src={session.user.image} 
                    alt={session.user.name || "User"} 
                    width={32} 
                    height={32} 
                    className="user-avatar"
                    title={`Logged in as ${session.user.name}`}
                  />
                ) : (
                  <div 
                    className="avatar user-avatar-icon" 
                    title={`Logged in as ${session.user.name}`}
                  >
                    👤
                  </div>
                )}
                <button 
                  onClick={() => signOut()}
                  className="header-logout-btn"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="header-signin-btn"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.438-2.883-6.438-6.438s2.883-6.438 6.438-6.438c1.594 0 3.036.586 4.157 1.545l3.054-3.054C19.346 2.378 15.933 1 12.24 1 5.922 1 12.24s4.922 11.24 11.24 11.24c6.236 0 11.24-5.004 11.24-11.24 0-.743-.072-1.467-.2-2.155H12.24z"/>
                </svg>
                <span className="signin-text">Sign In</span>
              </button>
            )}
          </div>
        </header>

        {isLanding ? (
          <div className="landing">
            <div className="hero-image-wrapper">
                {/* Enhanced Sacred Crown Peacock Feather (Mayur Pankh) directly on top of Krishna's Image */}
                <div 
                  className="hero-crown-feather"
                  title="Lord Krishna's Divine Peacock Feather • Click for temple chime"
                  onClick={playTempleChime}
                >
                  <div className="feather-halo-glow" />
                  <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                    {/* Outer radiant plume vanes */}
                    <path 
                      d="M50 8C35 24 16 45 22 72C26 88 44 98 56 94C72 88 84 65 74 38C68 24 58 14 50 8Z" 
                      fill="url(#outerPlumeGrad)" 
                      opacity="0.95"
                    />
                    
                    {/* Fine barbules fan */}
                    <path d="M50 12C38 28 24 46 28 68" stroke="url(#barbuleGrad)" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
                    <path d="M50 15C62 30 76 48 72 70" stroke="url(#barbuleGrad)" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
                    <path d="M50 25C32 40 22 58 26 76" stroke="url(#barbuleGrad)" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
                    <path d="M50 25C68 40 78 58 74 76" stroke="url(#barbuleGrad)" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
                    <path d="M50 38C36 50 28 66 32 82" stroke="url(#barbuleGrad)" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
                    <path d="M50 38C64 50 72 66 68 82" stroke="url(#barbuleGrad)" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
                    
                    {/* Peacock Eye (Ocellus) - Layer 1: Golden Amber Halo */}
                    <ellipse cx="50" cy="58" rx="20" ry="25" fill="url(#eyeAmberGrad)" />
                    
                    {/* Peacock Eye - Layer 2: Emerald Teal Ring */}
                    <ellipse cx="50" cy="60" rx="15" ry="19" fill="url(#eyeEmeraldGrad)" />
                    
                    {/* Peacock Eye - Layer 3: Vibrant Royal Blue Ring */}
                    <ellipse cx="50" cy="62" rx="10.5" ry="13.5" fill="url(#eyeRoyalBlueGrad)" />
                    
                    {/* Peacock Eye - Layer 4: Deep Midnight Indigo Pupil */}
                    <circle cx="50" cy="63.5" r="5.5" fill="#1e1b4b" />
                    
                    {/* Divine Celestial Light Reflection Highlight */}
                    <ellipse cx="48" cy="61" rx="2" ry="1.4" fill="#ffffff" opacity="0.85" />
                    <circle cx="53" cy="65" r="0.9" fill="#ffffff" opacity="0.65" />
                    
                    {/* Central Golden Spine / Shaft (Rachis) */}
                    <path d="M50 8C49 35 46 75 36 112" stroke="url(#shaftGoldGrad)" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M50 8C49 35 46 75 36 112" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />

                    <defs>
                      <linearGradient id="outerPlumeGrad" x1="20" y1="10" x2="80" y2="95" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#0d9488" />
                        <stop offset="0.35" stopColor="#059669" />
                        <stop offset="0.7" stopColor="#0284c7" />
                        <stop offset="1" stopColor="#312e81" />
                      </linearGradient>
                      <linearGradient id="barbuleGrad" x1="30" y1="10" x2="70" y2="80" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#fbbf24" />
                        <stop offset="0.5" stopColor="#34d399" />
                        <stop offset="1" stopColor="#38bdf8" />
                      </linearGradient>
                      <radialGradient id="eyeAmberGrad" cx="50" cy="58" r="25" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#fbbf24" />
                        <stop offset="0.6" stopColor="#f59e0b" />
                        <stop offset="0.85" stopColor="#b45309" />
                        <stop offset="1" stopColor="#059669" />
                      </radialGradient>
                      <radialGradient id="eyeEmeraldGrad" cx="50" cy="60" r="19" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#10b981" />
                        <stop offset="0.65" stopColor="#0d9488" />
                        <stop offset="1" stopColor="#0369a1" />
                      </radialGradient>
                      <radialGradient id="eyeRoyalBlueGrad" cx="50" cy="62" r="13.5" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#38bdf8" />
                        <stop offset="0.4" stopColor="#0284c7" />
                        <stop offset="0.85" stopColor="#4338ca" />
                        <stop offset="1" stopColor="#1e1b4b" />
                      </radialGradient>
                      <linearGradient id="shaftGoldGrad" x1="50" y1="8" x2="36" y2="112" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#fef08a" />
                        <stop offset="0.3" stopColor="#f59e0b" />
                        <stop offset="0.8" stopColor="#d97706" />
                        <stop offset="1" stopColor="#92400e" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <Image 
                    src="/images/krishna_hero.png" 
                    alt="Lord Krishna" 
                    fill 
                    sizes="(max-width: 768px) 130px, 200px"
                    className="hero-image"
                    priority
                />
            </div>

            {/* Seamless Language Switcher Pill */}
            <div className="hero-language-switch">
              <button
                type="button"
                className={`hero-lang-btn ${language === 'English' ? 'active' : ''}`}
                onClick={() => setAndSaveLanguage('English')}
              >
                <span>🇬🇧</span> English
              </button>
              <button
                type="button"
                className={`hero-lang-btn ${language === 'Telugu' ? 'active' : ''}`}
                onClick={() => setAndSaveLanguage('Telugu')}
              >
                <span>🇮🇳</span> తెలుగు (Telugu)
              </button>
            </div>

            {/* Interactive 6-Second Shifting Divine Quote */}
            <div 
              className="divine-quote-container" 
              onClick={() => {
                playTempleChime();
                setQuoteFading(true);
                setTimeout(() => {
                  setQuoteIndex((prev) => (prev + 1) % divineQuotes.length);
                  setQuoteFading(false);
                }, 300);
              }}
              title="Click to hear temple bell & shift to next divine teaching"
            >
              <p className={`divine-shifting-quote ${quoteFading ? 'fade-out' : 'fade-in'}`}>
                “{divineQuotes[quoteIndex] || divineQuotes[0]}”
              </p>
              <span className="divine-quote-hint">🪈 Sri Krishna • shifts every 6s</span>
            </div>

            <h1>{language === 'Telugu' ? "స్వాగతం, సాధకా" : "Divine Wisdom for Life's Dilemmas"}</h1>
            <p>
              {language === 'Telugu' 
                ? "మీ జీవితంలోని సందేహాలు, ఆందోళనలు మరియు కర్తవ్య సంక్షోభాలకు భగవద్గీత ద్వారా పరమ శాంతిని పొందండి." 
                : "Seek timeless clarity from Lord Krishna for your career, relationships, inner peace, and life purpose."}
            </p>

            {/* Instant Divine Consultation Search Bar */}
            <div className="hero-consultation-container">
              <div className="hero-consultation-box">
                <span className="consultation-icon">🪈</span>
                <input 
                  type="text"
                  className="hero-consultation-input"
                  placeholder={language === 'Telugu' 
                    ? "మీ మనస్సును కలవరపెడుతున్న విషయాన్ని కృష్ణుడిని అడగండి..." 
                    : "Ask Krishna what is weighing on your soul today..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button 
                  className="hero-consultation-btn"
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  title="Ask Krishna"
                >
                  <span className="btn-text">{language === 'Telugu' ? "సలహా కోరండి" : "Ask Krishna"}</span>
                  <span className="btn-arrow">✨</span>
                </button>
              </div>
            </div>

            {/* Trending Divine Dilemmas (1-Click Chips) */}
            <div className="hero-trending-section">
              <span className="trending-label">
                💡 {language === 'Telugu' ? "సాధారణ ఆధ్యాత్మిక సందేహాలు:" : "Trending Divine Dilemmas:"}
              </span>
              <div className="trending-chips-wrap">
                {trendingDilemmas.map((d, idx) => (
                  <button 
                    key={idx}
                    className="trending-chip"
                    onClick={() => handleSend(d.query)}
                  >
                    <span className="chip-icon">{d.icon}</span>
                    <span className="chip-text">{d.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {status !== 'loading' && !session && (
              <div className="auth-backup-banner">
                <div className="auth-backup-content">
                  <h4 className="auth-backup-title">Save Your Spiritual Journey</h4>
                  <p className="auth-backup-desc">Sign in with Google to automatically back up your conversations and access your chat history from any device.</p>
                </div>
                <button
                  onClick={() => signIn('google')}
                  className="auth-backup-btn"
                >
                  Sign In with Google
                </button>
              </div>
            )}
            
            {dailySloka && showDailyWisdom && (
              <div className="daily-sloka-card">
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
                    onClick={() => handleExportCard(
                      dailySloka.sanskrit, 
                      language === 'Telugu' ? dailySloka.telugu : dailySloka.english, 
                      language === 'Telugu' ? `అధ్యాయం ${dailySloka.chapterNumber}, శ్లోకం ${dailySloka.number}` : `Chapter ${dailySloka.chapterNumber}, Verse ${dailySloka.number}`,
                      language === 'Telugu'
                    )}
                    className="daily-action-btn export"
                    title="Export as Wisdom Card"
                  >
                    <span className="btn-icon">🎨</span> <span className="btn-text">Export Card</span>
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

            <ChapterRoadmap 
              language={language} 
              onSelectVerse={handleSelectVerse} 
            />
          </div>
        ) : (
          <div id="chat-messages-container" className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role === 'bot' ? 'bot-message' : 'user-message'}`}>
                <div className="avatar">
                  {msg.role === 'bot' ? '🪈' : '👤'}
                </div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-sender-name" style={{ 
                      fontWeight: 600, 
                      fontSize: '0.85rem', 
                      color: msg.role === 'bot' ? 'var(--accent-gold)' : 'var(--text-muted)' 
                    }}>
                      {msg.role === 'bot' ? "Krishna's Wisdom" : 'You'}
                    </span>
                    {msg.role === 'bot' && (
                      <div className="message-actions">
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
                          <span className="btn-icon">🎨</span> <span className="btn-text">Export Card</span>
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
            <div className="input-wrapper">
              {showContextInput && (
                <div className="context-row">
                  <div className="context-header">
                    <span className="context-title">Custom Grounding Context / Background Info</span>
                    {customContext.trim() && (
                      <button 
                        onClick={() => setCustomContext('')}
                        className="context-clear-btn"
                      >
                        Clear Context
                      </button>
                    )}
                  </div>
                  <textarea
                    className="context-textarea-inline"
                    placeholder="Tell Krishna about your background or situation for personalized guidance..."
                    value={customContext}
                    onChange={(e) => setCustomContext(e.target.value)}
                  />
                </div>
              )}
              
              <div className="input-controls-row">
                <button 
                  className={`context-toggle-btn ${showContextInput ? 'active' : ''}`}
                  onClick={() => setShowContextInput(!showContextInput)}
                  title="Add Custom Grounding Context"
                >
                  📜
                  {customContext.trim() && !showContextInput && (
                    <span className="context-indicator" />
                  )}
                </button>
                
                <textarea 
                  ref={textareaRef}
                  className="chat-input"
                  placeholder="Ask about a sloka or share how you feel..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                
                <button className="send-btn" onClick={() => handleSend()} aria-label="Send message">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="disclaimer-text">
              Gita-GPT can provide spiritual guidance but is not a substitute for professional mental health support.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
