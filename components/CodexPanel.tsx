import React, { useState } from 'react';
import { PlayerState, CodexEntry } from '../types';
import { CODEX_ENTRIES } from '../constants';
import { Book, X, Wand2, Loader2, MapPin, User, Scroll } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface CodexPanelProps {
  player: PlayerState;
  onClose: () => void;
  updatePlayer: (update: PlayerState | ((prev: PlayerState) => PlayerState)) => void;
}

const CodexPanel: React.FC<CodexPanelProps> = ({ player, onClose, updatePlayer }) => {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'PERSON' | 'PLACE' | 'LORE'>('PERSON');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const unlockedIds = player.unlockedCodexEntries || [];
  
  // Filter entries based on unlocked status AND active category
  const filteredEntries = unlockedIds
    .map(id => CODEX_ENTRIES[id])
    .filter(entry => entry && entry.category === activeCategory);

  const selectedEntry = selectedEntryId ? CODEX_ENTRIES[selectedEntryId] : (filteredEntries.length > 0 ? filteredEntries[0] : null);

  // Check if we have a generated image in player state
  const displayImage = selectedEntry 
    ? (player.codexImages?.[selectedEntry.id] || selectedEntry.image) 
    : null;

  const executeGeneration = async () => {
    if (!selectedEntry) return;
    
    if (!process.env.API_KEY) {
        alert("API Key bulunamadı! Lütfen API anahtarının tanımlı olduğundan emin olun.");
        return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Construct a SAFE prompt
      // We explicitly avoid user input and sanitize the description
      const safeDescription = selectedEntry.content[0].substring(0, 150)
         .replace(/blood/gi, "crimson liquid")
         .replace(/gore/gi, "shadows")
         .replace(/kill/gi, "defeat")
         .replace(/death/gi, "eternal rest");

      const prompt = `Dark fantasy concept art, oil painting style, cinematic lighting, atmospheric, mysterious, highly detailed. Subject: ${selectedEntry.title}. Context: ${safeDescription}. No text, no ui.`;

      // Use gemini-2.5-flash-image (Nano Banana) for broader compatibility
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          }
        }
      });
      
      let imageUrl = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                // Ensure mimeType is present, otherwise default to image/png
                const mimeType = part.inlineData.mimeType || 'image/png';
                imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
                break;
            }
        }
      }

      if (imageUrl) {
        updatePlayer((prev) => ({
          ...prev,
          codexImages: {
            ...prev.codexImages,
            [selectedEntry.id]: imageUrl
          }
        }));
      } else {
        throw new Error("Model görsel verisi döndürmedi (No inlineData found).");
      }
    } catch (error: any) {
      console.error("Image generation failed:", error);
      let msg = "Görüntü oluşturulamadı.";
      
      // Improved error messaging
      if (error.message?.includes("404") || error.toString().includes("404")) {
         msg += " Model sunucuda bulunamadı. (Model: gemini-2.5-flash-image)";
      } else if (error.message?.includes("SAFETY") || error.toString().includes("SAFETY")) {
         msg += " Güvenlik filtresine takıldı. İçerik çok karanlık olabilir.";
      } else {
         msg += " Lütfen daha sonra tekrar deneyin.";
      }
      
      alert(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 md:p-10 animate-fade-in">
      <div className="w-full max-w-5xl h-full border border-yellow-900/40 flex flex-col md:flex-row bg-zinc-950/80 backdrop-blur-sm shadow-2xl overflow-hidden relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-zinc-500 hover:text-red-500 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Sidebar List */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col bg-black/40">
           <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
             <div className="flex items-center gap-3 text-yellow-600 mb-4">
               <Book className="w-5 h-5" />
               <h2 className="font-title text-xl font-bold tracking-widest">KODEX</h2>
             </div>
             
             {/* Categories */}
             <div className="flex gap-1 bg-black/50 p-1 rounded-lg">
                <button 
                    onClick={() => setActiveCategory('PERSON')}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider flex justify-center items-center gap-1 transition-colors ${activeCategory === 'PERSON' ? 'bg-zinc-800 text-yellow-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <User className="w-3 h-3" /> Kişiler
                </button>
                <button 
                    onClick={() => setActiveCategory('PLACE')}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider flex justify-center items-center gap-1 transition-colors ${activeCategory === 'PLACE' ? 'bg-zinc-800 text-yellow-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <MapPin className="w-3 h-3" /> Mekanlar
                </button>
                <button 
                    onClick={() => setActiveCategory('LORE')}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider flex justify-center items-center gap-1 transition-colors ${activeCategory === 'LORE' ? 'bg-zinc-800 text-yellow-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Scroll className="w-3 h-3" /> Eşyalar
                </button>
             </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-2 space-y-1">
             {filteredEntries.length === 0 ? (
               <div className="p-4 text-zinc-600 text-sm italic text-center mt-10">
                 Bu kategoride henüz kayıt yok.
               </div>
             ) : (
               filteredEntries.map(entry => (
                 <button
                   key={entry.id}
                   onClick={() => {
                     setSelectedEntryId(entry.id);
                   }}
                   className={`w-full text-left p-3 border transition-all duration-200 group relative overflow-hidden ${
                     (selectedEntry?.id === entry.id) 
                       ? 'bg-yellow-900/20 border-yellow-800/50 text-yellow-100' 
                       : 'bg-zinc-900/30 border-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                   }`}
                 >
                   <span className="font-title text-sm relative z-10">{entry.title}</span>
                   {selectedEntry?.id === entry.id && (
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-600"></div>
                   )}
                 </button>
               ))
             )}
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 relative">
          {selectedEntry ? (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
              <h1 className="font-title text-3xl md:text-4xl text-yellow-500 border-b border-yellow-900/30 pb-4 flex justify-between items-center">
                <span>{selectedEntry.title}</span>
              </h1>
              
              {/* Image Area */}
              <div className="w-full h-64 border border-zinc-800 overflow-hidden relative group bg-black shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                {isGenerating ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
                    <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mb-2" />
                    <span className="text-yellow-500 font-title text-sm tracking-widest">GÖRÜNTÜ OLUŞTURULUYOR...</span>
                  </div>
                ) : null}

                {displayImage ? (
                  <img 
                    src={displayImage} 
                    alt={selectedEntry.title} 
                    className="w-full h-full object-cover transition-opacity duration-700"
                  />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-zinc-800 bg-zinc-900">
                     <span className="text-6xl font-title opacity-20">?</span>
                   </div>
                )}
                
                {/* Generate Button Overlay */}
                <div className="absolute bottom-2 right-2">
                    <button 
                        onClick={executeGeneration}
                        disabled={isGenerating}
                        className="bg-black/80 hover:bg-yellow-900/80 text-yellow-500 border border-yellow-700/50 px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        <Wand2 className="w-3 h-3" />
                        {displayImage ? "Yeniden Resmet" : "Yapay Zeka ile Resmet"}
                    </button>
                </div>
              </div>

              <div className="space-y-4 text-zinc-300 leading-loose text-lg font-serif">
                {selectedEntry.content.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-700 font-title text-2xl uppercase tracking-widest opacity-20 select-none">
              Alevlerin Sırları
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodexPanel;