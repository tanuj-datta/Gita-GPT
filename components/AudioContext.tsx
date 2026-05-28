'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface AudioContextType {
  bgMusicPlaying: boolean;
  setBgMusicPlaying: (playing: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [bgMusicPlaying, setBgMusicPlayingState] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync with localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bg_music_playing');
      if (saved === 'true') {
        setBgMusicPlayingState(true);
      }
    } catch (e) {
      console.warn("Could not read from localStorage:", e);
    }
  }, []);

  const setBgMusicPlaying = (playing: boolean) => {
    setBgMusicPlayingState(playing);
    try {
      localStorage.setItem('bg_music_playing', playing ? 'true' : 'false');
    } catch (e) {
      console.warn("Could not write to localStorage:", e);
    }
  };

  // Play/pause the audio element based on state
  useEffect(() => {
    if (audioRef.current) {
      if (bgMusicPlaying) {
        audioRef.current.play().catch(e => {
          console.warn("Audio autoplay blocked or failed:", e);
          // Auto-play might be blocked by browser until user interaction.
          // We keep the state playing=true so it plays once they interact,
          // or we can fallback to pause. Let's just catch it.
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [bgMusicPlaying]);

  // Set initial volume on mount
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.12; // 12% volume for soft background flute music
    }
  }, []);

  return (
    <AudioContext.Provider value={{ bgMusicPlaying, setBgMusicPlaying }}>
      {children}
      <audio 
        ref={audioRef} 
        src="/audio/monsoon_whispers.m4a" 
        loop 
        preload="auto"
      />
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
