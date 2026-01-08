import React, { useEffect, useRef } from 'react';
import { Scene, PlayerState } from '../types';
import { CODEX_ENTRIES, SPEAKER_CODEX_MAP, LORE_TOOLTIPS } from '../constants';

interface StoryPanelProps {
  scene: Scene;
  onChoice: (nextSceneId: string, action?: (s: PlayerState) => PlayerState) => void;
  player: PlayerState;
}

const StoryPanel: React.FC<StoryPanelProps> = ({ scene, onChoice, player }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [scene]);

  const textLines = scene?.text || [];

  // Helper to check if a speaker has a codex entry
  const getCodexContent = (speakerName: string): string | null => {
    const codexId = SPEAKER_CODEX_MAP[speakerName];
    if (codexId && player.unlockedCodexEntries.includes(codexId)) {
      // Return brief summary (first line of codex)
      const entry = CODEX_ENTRIES[codexId];
      return entry ? entry.content[0] : null;
    }
    return null;
  };

  // Helper to parse text and inject tooltips for lore keywords
  const renderTextWithTooltips = (text: string) => {
    if (!text) return null;
    
    // Create a regex pattern from the keys of LORE_TOOLTIPS
    const keywords = Object.keys(LORE_TOOLTIPS);
    if (keywords.length === 0) return text;
    
    const pattern = new RegExp(`(${keywords.join('|')})`, 'gi');
    const parts = text.split(pattern);

    return parts.map((part, i) => {
        // Check if part matches a keyword (case-insensitive)
        const lowerPart = part.toLowerCase();
        const matchedKey = keywords.find(k => k.toLowerCase() === lowerPart);

        if (matchedKey) {
            return (
                <span key={i} className="tooltip-container relative group cursor-help inline-block">
                    <span className="text-zinc-300 border-b border-zinc-500/50 hover:text-yellow-400 hover:border-yellow-500 transition-colors duration-300">
                        {part}
                    </span>
                    <span className="tooltip-text">
                        <strong className="block text-yellow-600 mb-1 border-b border-zinc-700 pb-1 font-title uppercase tracking-widest text-xs">{matchedKey}</strong>
                        {LORE_TOOLTIPS[matchedKey]}
                    </span>
                </span>
            );
        }
        return part;
    });
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden">
      {/* Enhanced Speaker Display */}
      {scene?.speaker && (
        <div className="mb-6 flex justify-center">
          <div className="tooltip-container group cursor-help">
            <span className="inline-block px-6 py-2 bg-gradient-to-r from-transparent via-yellow-900/30 to-transparent border-y border-yellow-900/50 text-yellow-500 font-title text-xl uppercase tracking-widest shadow-lg animate-subtle-pulse">
              {scene.speaker}
            </span>
            {/* Tooltip Content */}
            {getCodexContent(scene.speaker) && (
              <div className="tooltip-text">
                 <strong className="block text-yellow-600 mb-1 border-b border-zinc-700 pb-1">{scene.speaker}</strong>
                 {getCodexContent(scene.speaker)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Text */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 text-lg md:text-xl leading-relaxed text-zinc-300 pr-2 font-serif"
      >
        {textLines.map((paragraph, idx) => {
           // Basic formatting for importance
           const isImportant = paragraph.includes("DÜNYANIN EN OP") || paragraph.includes("Öldüm mü") || paragraph.includes("SAVAŞ");
           
           return (
            <p key={idx} className={`${idx === textLines.length - 1 ? "animate-fade-in" : ""} ${isImportant ? "text-yellow-100/90 font-semibold" : ""}`}>
              {renderTextWithTooltips(paragraph)}
            </p>
           );
        })}
      </div>

      {/* Choices Area */}
      <div className="mt-8 grid gap-3">
        {scene?.choices?.map((choice, idx) => {
          if (choice.condition && !choice.condition(player)) return null;

          return (
            <button
              key={idx}
              onClick={() => onChoice(choice.nextSceneId, choice.action)}
              className="group relative px-6 py-4 bg-zinc-900/80 border border-zinc-700 hover:border-yellow-700 text-left transition-all duration-300 hover:bg-zinc-800"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-900 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="font-title text-yellow-100/80 group-hover:text-yellow-400 tracking-wide text-sm md:text-lg group-hover:translate-x-1 transition-transform inline-block">
                {choice.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StoryPanel;