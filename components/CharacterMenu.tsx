import React, { useState } from 'react';
import { PlayerState, PlayerStats } from '../types';
import { Shield, Sword, User, X, Plus, Grip } from 'lucide-react';

interface CharacterMenuProps {
  player: PlayerState;
  onClose: () => void;
  updatePlayer: (update: PlayerState | ((prev: PlayerState) => PlayerState)) => void;
}

const CharacterMenu: React.FC<CharacterMenuProps> = ({ player, onClose, updatePlayer }) => {
  const activeTab = 'INVENTORY'; // Only one tab actually needed for this prompt but keeping structure
  const [view, setView] = useState<'INVENTORY' | 'STATS'>('INVENTORY');

  // Level Up Logic
  const handleLevelUp = (stat: keyof PlayerStats) => {
    if (player.attributePoints > 0) {
      updatePlayer(prev => {
        const newStats = { ...prev.stats, [stat]: prev.stats[stat] + 1 };
        
        let newMaxHp = prev.maxHp;
        let newMaxStamina = prev.maxStamina;

        if (stat === 'vitality') newMaxHp += 10;
        if (stat === 'endurance') newMaxStamina += 5;

        return {
          ...prev,
          stats: newStats,
          attributePoints: prev.attributePoints - 1,
          maxHp: newMaxHp,
          hp: prev.hp + (newMaxHp - prev.maxHp), 
          maxStamina: newMaxStamina
        };
      });
    }
  };

  const handleEquip = (itemName: string) => {
    updatePlayer(prev => ({
        ...prev,
        equippedWeapon: itemName
    }));
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-4xl border border-zinc-700 bg-zinc-900 shadow-2xl relative flex flex-col h-[600px]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-zinc-700 bg-black/50">
          <div className="flex gap-4">
             <button 
               onClick={() => setView('INVENTORY')}
               className={`font-title text-lg px-4 py-2 transition-colors ${view === 'INVENTORY' ? 'text-yellow-500 border-b border-yellow-500' : 'text-zinc-500 hover:text-zinc-300'}`}
             >
               ENVANTER
             </button>
             <button 
               onClick={() => setView('STATS')}
               className={`font-title text-lg px-4 py-2 transition-colors ${view === 'STATS' ? 'text-yellow-500 border-b border-yellow-500' : 'text-zinc-500 hover:text-zinc-300'}`}
             >
               KARAKTER ({player.attributePoints > 0 ? '!' : ''})
             </button>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-red-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* INVENTORY TAB */}
          {view === 'INVENTORY' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {player.inventory.map((item, idx) => (
                <div key={idx} className={`bg-black/40 border p-3 flex flex-col gap-2 transition-colors ${player.equippedWeapon === item.name ? 'border-yellow-600/50 bg-yellow-900/10' : 'border-zinc-800 hover:border-zinc-600'}`}>
                  <div className="flex gap-3 items-start">
                    <div className="p-3 bg-zinc-900 border border-zinc-700">
                        {item.type === 'WEAPON' ? <Sword className="w-6 h-6 text-zinc-400" /> : <Shield className="w-6 h-6 text-zinc-400" />}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-title text-yellow-100/90">{item.name}</h3>
                        <p className="text-xs text-zinc-500 italic mt-1">{item.description}</p>
                        
                        {/* Stats Display */}
                        {item.weaponStats && (
                            <div className="mt-2 text-xs grid grid-cols-2 gap-1 text-zinc-400">
                                <span>DMG: <span className="text-red-400">{item.weaponStats.damage}</span></span>
                                <span>SCALE: <span className="text-blue-400">{item.weaponStats.scaling}</span></span>
                                <span className="col-span-2 text-[10px] uppercase text-zinc-500">{item.weaponStats.description}</span>
                            </div>
                        )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end pt-2 border-t border-zinc-800/50">
                    {item.type === 'WEAPON' && (
                         player.equippedWeapon === item.name ? (
                             <span className="px-3 py-1 bg-green-900/30 text-green-500 border border-green-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                 <Grip className="w-3 h-3" /> KUŞANILDI
                             </span>
                         ) : (
                             <button 
                                onClick={() => handleEquip(item.name)}
                                className="px-3 py-1 bg-zinc-800 hover:bg-yellow-900/30 text-zinc-400 hover:text-yellow-500 border border-zinc-700 hover:border-yellow-700 text-xs font-bold uppercase tracking-wider transition-all"
                             >
                                 KUŞAN
                             </button>
                         )
                    )}
                  </div>
                </div>
              ))}
              {player.inventory.length === 0 && (
                <p className="text-zinc-500 italic">Çantanız boş.</p>
              )}
            </div>
          )}

          {/* STATS TAB */}
          {view === 'STATS' && (
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left: General Info */}
              <div className="w-full md:w-1/3 space-y-4 border-r border-zinc-800 pr-4">
                <div className="bg-black/30 p-4 border border-zinc-800">
                    <User className="w-12 h-12 text-zinc-500 mb-2 mx-auto" />
                    <h2 className="text-center font-title text-xl text-yellow-500">{player.name}</h2>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Level</span>
                        <span className="text-white font-bold">{player.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">XP</span>
                        <span className="text-white">{player.xp} / {player.xpToNextLevel}</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1 mt-1">
                        <div className="bg-yellow-600 h-full" style={{ width: `${Math.min(100, (player.xp / player.xpToNextLevel) * 100)}%` }}></div>
                      </div>
                    </div>
                </div>
                
                <div className="text-xs text-zinc-500 text-center">
                   {player.attributePoints > 0 
                     ? `${player.attributePoints} puan dağıtılabilir.` 
                     : "Puan kazanmak için XP topla."}
                </div>
              </div>

              {/* Right: Attributes */}
              <div className="flex-1 grid grid-cols-1 gap-4">
                 <StatRow 
                   label="Vitality" 
                   value={player.stats.vitality} 
                   desc="Maksimum HP artırır." 
                   canUpgrade={player.attributePoints > 0}
                   onUpgrade={() => handleLevelUp('vitality')}
                 />
                 <StatRow 
                   label="Endurance" 
                   value={player.stats.endurance} 
                   desc="Maksimum Stamina artırır."
                   canUpgrade={player.attributePoints > 0}
                   onUpgrade={() => handleLevelUp('endurance')}
                 />
                 <StatRow 
                   label="Strength" 
                   value={player.stats.strength} 
                   desc="Fiziksel hasarı artırır."
                   canUpgrade={player.attributePoints > 0}
                   onUpgrade={() => handleLevelUp('strength')}
                 />
                 <StatRow 
                   label="Dexterity" 
                   value={player.stats.dexterity} 
                   desc="Kritik ve savunma şansını artırır."
                   canUpgrade={player.attributePoints > 0}
                   onUpgrade={() => handleLevelUp('dexterity')}
                 />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatRow: React.FC<{ label: string, value: number, desc: string, canUpgrade: boolean, onUpgrade: () => void }> = ({ label, value, desc, canUpgrade, onUpgrade }) => (
  <div className="flex items-center justify-between bg-zinc-900/50 p-3 border border-zinc-800 hover:border-zinc-600">
    <div>
      <div className="font-title text-zinc-200">{label} <span className="text-yellow-500 ml-2 text-xl">{value}</span></div>
      <div className="text-xs text-zinc-500">{desc}</div>
    </div>
    {canUpgrade && (
      <button 
        onClick={onUpgrade}
        className="p-2 bg-yellow-900/30 text-yellow-500 hover:bg-yellow-500 hover:text-black border border-yellow-700 transition-all rounded-full"
      >
        <Plus className="w-4 h-4" />
      </button>
    )}
  </div>
);

export default CharacterMenu;