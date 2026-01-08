import React, { useState, useEffect } from 'react';
import { Enemy, PlayerState } from '../types';
import { Sword, Shield, Footprints, RotateCcw, Zap, Flame, Loader2, Wand2, Sparkles, X } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface CombatPanelProps {
  enemy: Enemy;
  player: PlayerState;
  onVictory: () => void;
  onDefeat: () => void;
  updatePlayer: (newState: PlayerState | ((prev: PlayerState) => PlayerState)) => void;
}

// Effect Types for Visual Feedback
type CombatEffect = 'PARRY_SUCCESS' | 'BLOCK' | 'DODGE' | 'HIT' | null;

const CombatPanel: React.FC<CombatPanelProps> = ({ enemy, player, onVictory, onDefeat, updatePlayer }) => {
  const [enemyHp, setEnemyHp] = useState(enemy.hp);
  const [enemyStamina, setEnemyStamina] = useState(enemy.maxStamina || 100);
  const [log, setLog] = useState<string[]>([`${enemy.name} ile savaş başladı!`]);
  const [playerTurn, setPlayerTurn] = useState(true);
  const [blocking, setBlocking] = useState(false);
  const [victoryProcessed, setVictoryProcessed] = useState(false);
  
  // Dynamic Shake State
  const [shakeIntensity, setShakeIntensity] = useState<'sm' | 'md' | 'lg' | null>(null);
  
  // Visual Effect State
  const [combatEffect, setCombatEffect] = useState<CombatEffect>(null);

  // Image Generation State
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  // Bankai State
  const [bankaiActive, setBankaiActive] = useState(false);
  const [showBankaiVisual, setShowBankaiVisual] = useState(false);

  // Victory State
  const [showVictoryAnimation, setShowVictoryAnimation] = useState(false);

  // Simple scroll to bottom of log
  const logEndRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  // Determine which image to show: Player's generated memory (codex) -> Enemy Default -> Fallback
  const displayImage = player.codexImages[enemy.id] || enemy.image;

  const addLog = (msg: string) => setLog(prev => [...prev, msg]);

  // --- Dynamic Shake Logic ---
  const triggerShake = (damage: number) => {
    let intensity: 'sm' | 'md' | 'lg' = 'sm';
    
    if (damage > 40) intensity = 'lg';
    else if (damage > 15) intensity = 'md';
    
    setShakeIntensity(intensity);
    // Reset shake after animation duration (approx 500ms)
    setTimeout(() => setShakeIntensity(null), 600);
  };

  // --- Visual Effect Logic ---
  const triggerCombatEffect = (effect: CombatEffect) => {
    setCombatEffect(effect);
    setTimeout(() => setCombatEffect(null), 800); // Effect duration
  };

  // --- Image Generation Logic ---
  const generateEnemyImage = async () => {
    if (!process.env.API_KEY) {
        alert("API Key bulunamadı!");
        return;
    }

    setIsGeneratingImage(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Clean description for safety
      const safeDesc = enemy.description
         .replace(/blood/gi, "crimson liquid")
         .replace(/gore/gi, "dark atmosphere")
         .replace(/kill/gi, "fight");

      const prompt = `Dark fantasy boss portrait, oil painting style, menacing, highly detailed, dramatic lighting. Character: ${enemy.name}. Description: ${safeDesc}. No text.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });
      
      let imageUrl = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const mimeType = part.inlineData.mimeType || 'image/png';
                imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
                break;
            }
        }
      }

      if (imageUrl) {
        // Save to player state (codexImages) so it persists
        updatePlayer(prev => ({
          ...prev,
          codexImages: {
            ...prev.codexImages,
            [enemy.id]: imageUrl
          }
        }));
        addLog("Düşmanın sureti zihnine kazındı.");
      } else {
        throw new Error("Görsel verisi alınamadı.");
      }
    } catch (error) {
      console.error("Combat image gen failed:", error);
      addLog("Görsel oluşturulamadı: Karanlık çok yoğun.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Helper: Get Equipped Weapon
  const getWeapon = () => {
    const w = player.inventory.find(i => i.name === player.equippedWeapon);
    return w;
  };

  // Helper to increase Limit Gauge
  const increaseLimit = (amount: number) => {
    updatePlayer(prev => ({
        ...prev,
        limitGauge: Math.min(prev.maxLimitGauge, prev.limitGauge + amount)
    }));
  };

  const handleAttack = () => {
    if (player.stamina < 20) {
      addLog("Saldırmak için yeterli dayanıklılığın yok!");
      return;
    }

    const weapon = getWeapon();
    const weaponStats = weapon?.weaponStats || { damage: 5, scaling: 'NONE', parryBonus: 0 };
    
    // Scaling Logic
    let statBonus = 0;
    if (weaponStats.scaling === 'STR') statBonus = player.stats.strength;
    if (weaponStats.scaling === 'DEX') statBonus = player.stats.dexterity;
    
    // Bankai Buff
    if (bankaiActive && player.bankai.type === 'BUFF' && player.bankai.buffStats?.strength) {
       statBonus += player.bankai.buffStats.strength;
    }

    // Damage Calc
    const baseDmg = weaponStats.damage;
    let totalDmg = Math.floor(baseDmg + (statBonus * 0.5) + (Math.random() * 5));
    
    setEnemyHp(prev => Math.max(0, prev - totalDmg));
    updatePlayer(prev => ({ ...prev, stamina: prev.stamina - 20 }));
    addLog(`${weapon?.name || 'Yumruk'} ile saldırdın! ${totalDmg} hasar.`);
    
    increaseLimit(5); // Passive gain on attack

    setPlayerTurn(false);
    setTimeout(() => enemyTurn(false), 1000);
  };

  const handleBlock = () => {
    setBlocking(true);
    addLog("Kalkanını kaldırdın. Savunma pozisyonu.");
    updatePlayer(prev => ({ ...prev, stamina: Math.min(prev.maxStamina, prev.stamina + 10) }));
    setPlayerTurn(false);
    setTimeout(() => enemyTurn(false), 1000);
  };

  const handleParry = () => {
    if (player.stamina < 25) {
      addLog("Peri atmak için çok yorgunsun!");
      return;
    }

    const weapon = getWeapon();
    const parryBonus = weapon?.weaponStats?.parryBonus || 0;

    updatePlayer(prev => ({ ...prev, stamina: prev.stamina - 25 }));
    
    const dexBonus = player.stats ? (player.stats.dexterity * 0.01) : 0;
    // Base 30% + Dex + Weapon Bonus
    const success = Math.random() < (0.3 + dexBonus + parryBonus); 

    if (success) {
      triggerCombatEffect('PARRY_SUCCESS'); // TRIGGER EFFECT
      addLog(`MÜKEMMEL PERİ! (${weapon?.name} etkisi)`);
      setEnemyStamina(prev => Math.max(0, prev - 50));
      increaseLimit(30); 
      setPlayerTurn(true); 
    } else {
      addLog("Peri başarısız! Açık verdin!");
      setTimeout(() => enemyTurn(false, 1.5), 500);
      setPlayerTurn(false);
    }
  };

  const handleDodge = () => {
    if (player.stamina < 15) {
       addLog("Kaçınmak için yorgunsun!");
       return;
    }
    
    updatePlayer(prev => ({ ...prev, stamina: prev.stamina - 15 }));
    
    const dexBonus = player.stats ? (player.stats.dexterity * 0.01) : 0;
    const success = Math.random() < (0.5 + dexBonus);

    if (success) {
      triggerCombatEffect('DODGE'); // TRIGGER EFFECT
      addLog("Kaçındın ve açık yakaladın! (KONTRA ATAK FIRSATI)");
      setEnemyStamina(prev => Math.max(0, prev - 15));
      increaseLimit(10); // Moderate gain on Dodge
      setPlayerTurn(true); 
    } else {
      addLog("Kaçınamadın!");
      setPlayerTurn(false);
      setTimeout(() => enemyTurn(false), 1000);
    }
  };

  const handleBankai = () => {
    if (player.limitGauge < player.maxLimitGauge) return;

    // Trigger Visuals
    setShowBankaiVisual(true);
    setTimeout(() => setShowBankaiVisual(false), 3000);

    const bankai = player.bankai;
    addLog(`BANKAI AÇILDI: ${bankai.releaseCommand}, ${bankai.name.toUpperCase()}!`);
    addLog(bankai.description);

    // Consume Gauge
    updatePlayer(prev => ({ ...prev, limitGauge: 0 }));

    if (bankai.type === 'INSTANT') {
       const dmgMultiplier = bankai.damageMultiplier || 3;
       const baseDmg = 50 + (player.stats.strength * 2);
       const totalDmg = Math.floor(baseDmg * dmgMultiplier);
       
       setTimeout(() => {
         setEnemyHp(prev => Math.max(0, prev - totalDmg));
         addLog(`BANKAI SALDIRISI! ${totalDmg} hasar!`);
       }, 2000);

    } else if (bankai.type === 'BUFF') {
       setBankaiActive(true);
       addLog("Ruhsal baskın arttı! Güçlerin yükseliyor.");
    }
  };

  const handleEstus = () => {
    if (player.estus > 0) {
      const heal = 50 + (player.stats ? player.stats.vitality * 2 : 0); 
      updatePlayer(prev => {
        const newHp = Math.min(prev.maxHp, prev.hp + heal);
        return { ...prev, estus: prev.estus - 1, hp: newHp };
      });
      addLog(`Estus Flask içtin. (${player.estus - 1} kaldı)`);
      setPlayerTurn(false);
      setTimeout(() => enemyTurn(false), 1000);
    } else {
      addLog("Estus Flask boş!");
    }
  };

  const enemyTurn = (dodged = false, dmgMultiplier = 1) => {
    if (enemyHp <= 0) return;

    increaseLimit(2);

    if (enemyStamina < 20) {
      addLog(`${enemy.name} yorgunluktan soluklanıyor...`);
      setEnemyStamina(prev => Math.min(enemy.maxStamina, prev + 40)); 
      setPlayerTurn(true);
      return;
    }

    let dmg = Math.floor(enemy.damage * dmgMultiplier);
    setEnemyStamina(prev => Math.max(0, prev - 20));

    if (blocking) {
        dmg = Math.floor(dmg * 0.2); 
        if (bankaiActive && player.bankai.type === 'BUFF') {
            dmg = Math.floor(dmg * 0.5); 
        }

        const staminaLoss = 30;
        
        updatePlayer(prev => {
             if (prev.stamina < staminaLoss) {
                addLog("SAVUNMA KIRILDI (GUARD BREAK)! Tam hasar aldın.");
                triggerShake(enemy.damage); // Heavy shake on guard break
                triggerCombatEffect('HIT');
                return { ...prev, stamina: 0, hp: Math.max(0, prev.hp - enemy.damage) };
            } else {
                triggerCombatEffect('BLOCK'); // TRIGGER EFFECT
                addLog(`${enemy.name} kalkanına vurdu. Absorbe edildi.`);
                return { ...prev, stamina: prev.stamina - staminaLoss, hp: Math.max(0, prev.hp - dmg) };
            }
        });
    } else {
        addLog(`${enemy.name} acımasızca vurdu! ${dmg} hasar.`);
        updatePlayer(prev => ({ ...prev, hp: Math.max(0, prev.hp - dmg) }));
        triggerShake(dmg); // Shake based on actual damage
        triggerCombatEffect('HIT');
    }

    setBlocking(false);
    updatePlayer(prev => ({ ...prev, stamina: Math.min(prev.maxStamina, prev.stamina + 25) }));
    setPlayerTurn(true);
  };
  
  // Check Win/Loss
  useEffect(() => {
    if (enemyHp <= 0 && !victoryProcessed) {
      setVictoryProcessed(true);
      setShowVictoryAnimation(true); // Trigger Victory Text
      
      const xpGain = enemy.xpReward || 100;
      updatePlayer(prev => {
         let newXp = prev.xp + xpGain;
         let newLevel = prev.level;
         let newPoints = prev.attributePoints;
         let newXpToNext = prev.xpToNextLevel;

         while (newXp >= newXpToNext) {
             newXp -= newXpToNext;
             newLevel++;
             newPoints++;
             newXpToNext = Math.floor(newXpToNext * 1.2);
         }

         return {
             ...prev,
             xp: newXp,
             level: newLevel,
             attributePoints: newPoints,
             xpToNextLevel: newXpToNext
         };
      });
      
      // Delay transition to let animation play
      setTimeout(() => {
          setShowVictoryAnimation(false);
          onVictory();
      }, 4500);
    }
    if (player.hp <= 0) {
      setTimeout(onDefeat, 1500);
    }
  }, [enemyHp, player.hp, onVictory, onDefeat, updatePlayer, enemy.xpReward, victoryProcessed]);

  return (
    <div className={`flex-1 flex flex-col p-4 animate-fade-in relative overflow-hidden 
        ${shakeIntensity === 'sm' ? 'animate-shake-sm' : ''}
        ${shakeIntensity === 'md' ? 'animate-shake-md' : ''}
        ${shakeIntensity === 'lg' ? 'animate-shake-lg' : ''}
    `}>
      
      {/* --- VISUAL EFFECT OVERLAY --- */}
      {combatEffect && (
          <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
             {combatEffect === 'PARRY_SUCCESS' && (
                 <>
                    <div className="absolute inset-0 bg-white/40 animate-out fade-out duration-300"></div>
                    <div className="animate-clash relative flex flex-col items-center">
                        <div className="relative">
                            <Sword className="w-32 h-32 text-yellow-300 drop-shadow-[0_0_20px_rgba(234,179,8,1)] rotate-45" />
                            <Sword className="w-32 h-32 text-zinc-300 absolute top-0 left-0 drop-shadow-[0_0_20px_rgba(255,255,255,1)] -rotate-45" />
                            <Sparkles className="w-20 h-20 text-yellow-100 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping" />
                        </div>
                        <h2 className="text-4xl font-title font-black text-yellow-200 mt-4 tracking-widest drop-shadow-lg stroke-black">KONTRA!</h2>
                    </div>
                 </>
             )}

             {combatEffect === 'BLOCK' && (
                 <div className="animate-shield-impact flex flex-col items-center">
                    <Shield className="w-24 h-24 text-blue-400 drop-shadow-[0_0_30px_rgba(59,130,246,0.6)]" />
                 </div>
             )}

             {combatEffect === 'DODGE' && (
                 <div className="absolute inset-0 animate-dodge bg-gradient-to-r from-transparent via-white/10 to-transparent">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                         <Footprints className="w-20 h-20 text-green-400 opacity-50 blur-sm" />
                     </div>
                 </div>
             )}

             {combatEffect === 'HIT' && (
                 <div className="absolute inset-0 bg-red-900/30 animate-pulse flex items-center justify-center">
                 </div>
             )}
          </div>
      )}

      {/* Victory Text Overlay */}
      {showVictoryAnimation && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 pointer-events-none animate-in fade-in duration-700">
             <div className="relative">
                 {/* Main Text */}
                 <h1 className="text-5xl md:text-7xl font-title font-black text-yellow-500 tracking-widest uppercase animate-victory-text text-center drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]">
                    DÜŞMAN KATLEDİLDİ
                 </h1>
                 {/* Shine Effect line */}
                 <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent mt-4 animate-pulse"></div>
             </div>
          </div>
      )}

      {/* Bankai Visual */}
      {showBankaiVisual && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 pointer-events-none animate-in fade-in duration-300">
             <div className="text-center">
                 <h1 
                    className="text-6xl md:text-8xl font-title font-black tracking-widest uppercase animate-bankai-text"
                    style={{ color: player.bankai.visualColor, textShadow: `0 0 30px ${player.bankai.visualColor}` }}
                 >
                    BANKAI
                 </h1>
                 <p className="text-2xl text-white font-serif italic mt-4 animate-bounce">
                    "{player.bankai.releaseCommand}, {player.bankai.name}!"
                 </p>
             </div>
          </div>
      )}

      {/* Visuals */}
      <div className="flex justify-center mb-6 relative z-10">
         <div className="w-full max-w-md bg-black border border-red-900/50 relative overflow-hidden flex flex-col shadow-2xl group">
             {/* Image Container with Generation Overlay */}
             <div className="h-48 relative flex items-center justify-center overflow-hidden bg-zinc-900 group/img">
                {isGeneratingImage && (
                    <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mb-2" />
                        <span className="text-xs text-yellow-500 font-title tracking-widest">OLUŞTURULUYOR...</span>
                    </div>
                )}
                
                {displayImage ? (
                    <img src={displayImage} alt={enemy.name} className={`w-full h-full object-cover transition-all duration-700 ${enemyHp <= 0 ? 'grayscale blur-sm scale-95' : 'group-hover:scale-105'}`} />
                ) : (
                    <div className="text-red-900 font-title text-6xl opacity-20">BOSS</div>
                )}

                {/* Generate Button Button (Visible on Hover if Player Turn) */}
                <button 
                    onClick={generateEnemyImage}
                    disabled={isGeneratingImage}
                    className="absolute bottom-2 right-2 opacity-0 group-hover/img:opacity-100 bg-black/80 hover:bg-red-900/80 text-zinc-300 hover:text-white border border-zinc-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all z-10"
                >
                    <Wand2 className="w-3 h-3" />
                    {displayImage ? "Yeniden Resmet" : "Yaratığı Resmet"}
                </button>
             </div>
             
             {/* Enemy Stats UI */}
             <div className="p-3 bg-zinc-950/90 border-t border-red-900/30">
                 <div className="flex justify-between text-red-200 text-sm font-bold mb-2 uppercase tracking-widest font-title">
                    <span>{enemy.name}</span>
                    <span>{enemyHp}/{enemy.maxHp}</span>
                 </div>
                 <div className="h-4 bg-red-950 border border-red-800 mb-2 relative">
                    <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${(enemyHp/enemy.maxHp)*100}%` }}></div>
                 </div>
                 <div className="h-1 bg-zinc-800 w-full flex justify-end">
                    <div className="h-full bg-yellow-600 transition-all duration-300" style={{ width: `${(enemyStamina/enemy.maxStamina)*100}%` }}></div>
                 </div>
             </div>
         </div>
      </div>

      {/* Combat Log */}
      <div className="flex-1 bg-black/50 border border-zinc-800 p-3 mb-4 overflow-y-auto max-h-32 text-sm text-zinc-400 font-mono shadow-inner z-10">
        {log.map((line, i) => <div key={i} className={`mb-1 border-b border-zinc-800/50 pb-1 ${line.includes('BANKAI') ? 'text-purple-400 font-bold text-lg' : line.includes('KATLEDİLDİ') ? 'text-yellow-500 font-bold' : ''}`}>{`> ${line}`}</div>)}
        <div ref={logEndRef} />
      </div>

      {/* Limit Gauge Bar */}
      <div className="mb-4 z-10">
         <div className="flex justify-between items-end mb-1">
             <span className="text-xs font-title tracking-widest text-zinc-400">LIMIT GAUGE</span>
             <span className="text-xs text-purple-400 font-bold">{Math.floor(player.limitGauge)}%</span>
         </div>
         <div className="h-2 bg-zinc-900 border border-zinc-700 relative overflow-hidden">
             <div 
                className={`h-full transition-all duration-500 ${player.limitGauge >= player.maxLimitGauge ? 'bg-purple-500 animate-pulse shadow-[0_0_10px_#a855f7]' : 'bg-purple-900'}`}
                style={{ width: `${(player.limitGauge / player.maxLimitGauge) * 100}%` }}
             ></div>
         </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 z-10">
        <button 
            disabled={!playerTurn}
            onClick={handleAttack}
            className="group flex flex-col items-center justify-center p-3 bg-zinc-900 border border-red-900/30 hover:bg-red-900/20 hover:border-red-500 disabled:opacity-50 transition-all"
        >
            <Sword className="w-5 h-5 mb-1 text-red-500 group-hover:scale-110 transition-transform" />
            <span className="font-title text-[10px] tracking-wider">SALDIR</span>
        </button>

        <button 
            disabled={!playerTurn}
            onClick={handleBlock}
            className="group flex flex-col items-center justify-center p-3 bg-zinc-900 border border-blue-900/30 hover:bg-blue-900/20 hover:border-blue-500 disabled:opacity-50 transition-all"
        >
            <Shield className="w-5 h-5 mb-1 text-blue-500 group-hover:scale-110 transition-transform" />
            <span className="font-title text-[10px] tracking-wider">SAVUN</span>
        </button>

        <button 
            disabled={!playerTurn}
            onClick={handleParry}
            className="group flex flex-col items-center justify-center p-3 bg-zinc-900 border border-purple-900/30 hover:bg-purple-900/20 hover:border-purple-500 disabled:opacity-50 transition-all"
        >
            <Zap className="w-5 h-5 mb-1 text-purple-500 group-hover:scale-110 transition-transform" />
            <span className="font-title text-[10px] tracking-wider">PERİ</span>
        </button>

        <button 
            disabled={!playerTurn}
            onClick={handleDodge}
            className="group flex flex-col items-center justify-center p-3 bg-zinc-900 border border-green-900/30 hover:bg-green-900/20 hover:border-green-500 disabled:opacity-50 transition-all"
        >
            <Footprints className="w-5 h-5 mb-1 text-green-500 group-hover:scale-110 transition-transform" />
            <span className="font-title text-[10px] tracking-wider">KAÇIN</span>
        </button>

        <button 
            disabled={!playerTurn}
            onClick={handleEstus}
            className="group flex flex-col items-center justify-center p-3 bg-zinc-900 border border-yellow-900/30 hover:bg-yellow-900/20 hover:border-yellow-500 disabled:opacity-50 transition-all"
        >
            <RotateCcw className="w-5 h-5 mb-1 text-yellow-500 group-hover:scale-110 transition-transform" />
            <span className="font-title text-[10px] tracking-wider">ESTUS ({player.estus})</span>
        </button>

        {/* BANKAI BUTTON */}
        <button 
            disabled={!playerTurn || player.limitGauge < player.maxLimitGauge}
            onClick={handleBankai}
            className={`group flex flex-col items-center justify-center p-3 border transition-all relative overflow-hidden ${
                player.limitGauge >= player.maxLimitGauge 
                ? 'bg-purple-900/50 border-purple-500 hover:bg-purple-800 text-white animate-pulse' 
                : 'bg-zinc-950 border-zinc-800 text-zinc-600 disabled:opacity-30'
            }`}
        >   
            {/* Animated Background for charged state */}
            {player.limitGauge >= player.maxLimitGauge && (
                 <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent animate-subtle-pulse"></div>
            )}
            <Flame className={`w-5 h-5 mb-1 transition-transform group-hover:scale-125 ${player.limitGauge >= player.maxLimitGauge ? 'text-white' : 'text-zinc-600'}`} />
            <span className="font-title text-[10px] tracking-widest font-bold z-10">BANKAI</span>
        </button>
      </div>
    </div>
  );
};

export default CombatPanel;