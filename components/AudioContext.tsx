'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface AudioContextType {
  bgMusicPlaying: boolean;
  setBgMusicPlaying: (playing: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [bgMusicPlaying, setBgMusicPlayingState] = useState(false);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const ytPlayer = useRef<any>(null);

  // Load YouTube IFrame API and initialize player
  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    // This function will be called by the YouTube API
    (window as any).onYouTubeIframeAPIReady = () => {
      ytPlayer.current = new (window as any).YT.Player('yt-player', {
        height: '0',
        width: '0',
        videoId: '_3PmWQ0lENE',
        events: {
          onReady: (event: any) => {
            // Unmute and set a louder volume for background music
            event.target.unMute();
            event.target.setVolume(60);
            playerReady.current = true;
            // If user already toggled playback before ready, apply it now
            if (pendingPlay.current) {
              event.target.playVideo();
            } else {
              // Ensure paused initially
              event.target.pauseVideo();
            }
          },
        },
      });
    };
    // Cleanup on unmount
    return () => {
      if ((window as any).YT && ytPlayer.current) {
        ytPlayer.current.destroy();
      }
    };
  }, []);

  const playerReady = useRef(false);
  const pendingPlay = useRef(false);

  const setBgMusicPlaying = (playing: boolean) => {
    setBgMusicPlayingState(playing);
    try {
      localStorage.setItem('bg_music_playing', playing ? 'true' : 'false');
    } catch (e) {
      console.warn("Could not write to localStorage:", e);
    }
    // Control YouTube player playback
    if (ytPlayer.current && playerReady.current) {
      if (playing) {
        ytPlayer.current.playVideo();
      } else {
        ytPlayer.current.pauseVideo();
      }
    } else {
      // Player not ready yet – remember what the user wants
      pendingPlay.current = playing;
    }
  };

  // Synchronize YouTube player with bgMusicPlaying state (handled in setBgMusicPlaying)
  // No additional effect needed here.

  // Initial volume is handled by YouTube player (setVolume in onReady).


  return (
    <AudioContext.Provider value={{ bgMusicPlaying, setBgMusicPlaying }}>
      {children}
      {/* Hidden YouTube player for background flute music */}
      <div id="yt-player" ref={playerRef} style={{ display: 'none' }} />
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
