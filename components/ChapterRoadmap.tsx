'use client';

import React, { useState, useEffect } from 'react';
import { chapterRoadmapData, ChapterRoadmapItem } from '@/lib/chapter-roadmap-data';

interface ChapterRoadmapProps {
  language: 'English' | 'Telugu';
  onSelectVerse: (chapterNum: number, verseNum: string) => void;
}

export default function ChapterRoadmap({ language, onSelectVerse }: ChapterRoadmapProps) {
  const [selectedChapter, setSelectedChapter] = useState<ChapterRoadmapItem | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'slokas'>('summary');
  const [slokas, setSlokas] = useState<any[]>([]);
  const [loadingSlokas, setLoadingSlokas] = useState(false);
  const [errorSlokas, setErrorSlokas] = useState<string | null>(null);

  const isTelugu = language === 'Telugu';

  // Automatically fetch all slokas for the chapter when the 'slokas' tab is selected
  useEffect(() => {
    if (activeTab === 'slokas' && selectedChapter) {
      const fetchSlokas = async () => {
        setLoadingSlokas(true);
        setErrorSlokas(null);
        try {
          const res = await fetch(`/api/chapters/${selectedChapter.number}/slokas`);
          if (!res.ok) throw new Error("Failed to load slokas");
          const data = await res.json();
          setSlokas(data.slokas || []);
        } catch (err) {
          console.error("Error loading chapter slokas:", err);
          setErrorSlokas(isTelugu ? "శ్లోకాలను లోడ్ చేయడం విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి." : "Failed to load slokas. Please try again.");
        } finally {
          setLoadingSlokas(false);
        }
      };
      fetchSlokas();
    }
  }, [activeTab, selectedChapter, isTelugu]);

  const handleSelectChapter = (chap: ChapterRoadmapItem) => {
    setSelectedChapter(chap);
    setActiveTab('summary');
    setSlokas([]);
    setErrorSlokas(null);
  };

  return (
    <div className="roadmap-container">
      <div className="roadmap-header">
        <h2 className="roadmap-title">
          {isTelugu ? "భగవద్గీత: 18 అధ్యాయాల ఆధ్యాత్మిక ప్రయాణం" : "Bhagavad Gita: The 18-Chapter Spiritual Journey"}
        </h2>
        <p className="roadmap-subtitle">
          {isTelugu 
            ? "అర్జునుడి విషాదం నుండి మోక్షం వరకు సాగే మార్గాన్ని అన్వేషించండి. అధ్యాయాన్ని ఎంచుకుని దాని పూర్తి సారాంశం తెలుసుకోండి." 
            : "Trace the path from Arjuna's doubt to absolute liberation. Select any chapter to unlock its GenZ summary, takeaways, and key verses."}
        </p>
      </div>

      {/* Custom Dropdown Selector */}
      <div className="roadmap-dropdown-wrapper">
        <button 
          className={`roadmap-dropdown-trigger ${dropdownOpen ? 'open' : ''}`}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <span className="dropdown-trigger-icon">📖</span>
          <span className="dropdown-trigger-text">
            {isTelugu ? "అన్వేషించడానికి అధ్యాయాన్ని ఎంచుకోండి..." : "Select a Chapter to explore..."}
          </span>
          <span className="dropdown-chevron">▼</span>
        </button>

        {dropdownOpen && (
          <>
            <div className="roadmap-dropdown-backdrop" onClick={() => setDropdownOpen(false)} />
            <div className="roadmap-dropdown-menu">
              {chapterRoadmapData.map((chap) => {
                const chapTitle = isTelugu ? chap.teluguTitle : chap.englishTitle;
                const name = isTelugu ? chap.sanskritTeluguName : chap.sanskritName;

                return (
                  <div
                    key={chap.number}
                    className="roadmap-dropdown-item"
                    onClick={() => {
                      handleSelectChapter(chap);
                      setDropdownOpen(false);
                    }}
                  >
                    <span className="dropdown-item-number">Ch {chap.number}</span>
                    <div className="dropdown-item-details">
                      <span className="dropdown-item-sanskrit">{name}</span>
                      <span className="dropdown-item-title">{chapTitle}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Chapter Detail Overlay/Modal */}
      {selectedChapter && (
        <div className="roadmap-modal-overlay" onClick={() => setSelectedChapter(null)}>
          <div className="roadmap-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="roadmap-modal-close" 
              onClick={() => setSelectedChapter(null)}
              title="Close Details"
            >
              ✕
            </button>
            
            <div className="modal-badge-wrapper">
              <span className="modal-chapter-badge">
                {isTelugu ? `అధ్యాయం ${selectedChapter.number}` : `Chapter ${selectedChapter.number}`}
              </span>
            </div>

            <h3 className="modal-chapter-title">
              {isTelugu ? selectedChapter.sanskritTeluguName : selectedChapter.sanskritName}
            </h3>
            <p className="modal-chapter-translation">
              {isTelugu ? selectedChapter.teluguTitle : selectedChapter.englishTitle}
            </p>

            {/* Modal Tabs */}
            <div className="modal-tabs">
              <button 
                className={`modal-tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
                onClick={() => setActiveTab('summary')}
              >
                ✨ {isTelugu ? "సారాంశం" : "Summary"}
              </button>
              <button 
                className={`modal-tab-btn ${activeTab === 'slokas' ? 'active' : ''}`}
                onClick={() => setActiveTab('slokas')}
              >
                📖 {isTelugu ? "అన్ని శ్లోకాలు" : "All Slokas"}
              </button>
            </div>

            <div className="modal-section-divider"></div>

            <div className="modal-scroll-content">
              {activeTab === 'summary' && (
                <>
                  {/* GenZ Cheat Sheet Section */}
                  <div className="modal-section">
                    <h5 className="modal-section-title">
                      ⚡ {isTelugu ? "GenZ సారాంశం (Cheat Sheet)" : "GenZ Cheat Sheet"}
                    </h5>
                    <div className="modal-cheat-sheet-box">
                      {isTelugu ? selectedChapter.genzTeluguCheatSheet : selectedChapter.genzCheatSheet}
                    </div>
                  </div>

                  {/* Takeaway Section */}
                  <div className="modal-section">
                    <h5 className="modal-section-title">
                      🕊️ {isTelugu ? "ముఖ్య సారాంశం (Takeaway)" : "Key Takeaway"}
                    </h5>
                    <p className="modal-takeaway">
                      {isTelugu ? selectedChapter.teluguTakeaway : selectedChapter.takeaway}
                    </p>
                  </div>

                  {/* Key Verses Section */}
                  <div className="modal-section">
                    <h5 className="modal-section-title">
                      📖 {isTelugu ? "ముఖ్య శ్లోకాలు (Click to seek guidance)" : "Key Verses (Click to seek guidance)"}
                    </h5>
                    <div className="modal-verses-list">
                      {selectedChapter.keyVerses.map((verse) => (
                        <button
                          key={verse}
                          className="modal-verse-btn"
                          onClick={() => {
                            onSelectVerse(selectedChapter.number, verse);
                            setSelectedChapter(null);
                          }}
                          title={isTelugu ? `శ్లోకం ${verse} గురించి అడగండి` : `Ask Krishna about Verse ${verse}`}
                        >
                          🔖 {isTelugu ? `శ్లోకం ${verse}` : `Verse ${verse}`}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'slokas' && (
                <div className="modal-slokas-container">
                  {loadingSlokas && (
                    <div className="slokas-loading">
                      <div className="slokas-spinner"></div>
                      <p>{isTelugu ? "కృష్ణుడి జ్ఞానాన్ని లోడ్ చేస్తున్నాము..." : "Loading Krishna's Wisdom..."}</p>
                    </div>
                  )}

                  {errorSlokas && (
                    <div className="slokas-error">
                      <p>{errorSlokas}</p>
                      <button 
                        className="slokas-retry-btn"
                        onClick={() => {
                          setSlokas([]);
                          setErrorSlokas(null);
                          // Trigger refetch
                          setActiveTab('summary');
                          setTimeout(() => setActiveTab('slokas'), 50);
                        }}
                      >
                        {isTelugu ? "మళ్ళీ ప్రయత్నించు" : "Retry"}
                      </button>
                    </div>
                  )}

                  {!loadingSlokas && !errorSlokas && slokas.length > 0 && (
                    <div className="modal-slokas-list">
                      {slokas.map((sloka) => (
                        <div key={sloka.number} className="modal-sloka-card">
                          <div className="modal-sloka-card-header">
                            <span className="modal-sloka-number">
                              {isTelugu ? `శ్లోకం ${sloka.number}` : `Verse ${sloka.number}`}
                            </span>
                            <button
                              className="modal-sloka-ask-btn"
                              onClick={() => {
                                onSelectVerse(selectedChapter.number, sloka.number.toString());
                                setSelectedChapter(null);
                              }}
                              title={isTelugu ? `ఈ శ్లోకం గురించి అడగండి` : `Ask Krishna about this verse`}
                            >
                              💬 {isTelugu ? "అడుగు" : "Ask"}
                            </button>
                          </div>
                          <div className="modal-sloka-sanskrit">
                            {sloka.sanskrit}
                          </div>
                          <p className="modal-sloka-meaning">
                            {isTelugu ? sloka.telugu : sloka.english}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
