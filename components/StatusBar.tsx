import React from 'react';
import { PlayerState } from '../types';
import { Heart, Zap, FlaskConical } from 'lucide-react';

interface StatusBarProps {
  player: PlayerState;
}

const StatusBar: React.FC<StatusBarProps> = ({ player }) => {
  const hpPercent = (player.hp / player.maxHp) * 100;
  const staminaPercent = (player.stamina / player.maxStamina) * 100;

  return (
    <div className="p-4 bg-zinc-900/80 border-b border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex flex-col w-full md:w-1/2 gap-2">
        {/* HP Bar */}
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-700 fill-red-900" />
          <div className="flex-1 h-4 bg-zinc-800 border border-zinc-700 relative">
            <div 
              className="h-full bg-red-800 transition-all duration-300"
              style={{ width: `${hpPercent}%` }}
            ></div>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-bold tracking-wider">
              {player.hp} / {player.maxHp}
            </span>
          </div>
        </div>
        
        {/* Stamina Bar */}
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-green-700 fill-green-900" />
          <div className="flex-1 h-3 bg-zinc-800 border border-zinc-700 relative">
             <div 
              className="h-full bg-green-800 transition-all duration-300"
              style={{ width: `${staminaPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
         <div className="flex items-center gap-2 text-yellow-600">
           <FlaskConical className="w-6 h-6" />
           <span className="text-xl font-title font-bold">x{player.estus}</span>
         </div>
         <div className="text-sm text-zinc-500 font-serif italic">
            {player.equippedWeapon}
         </div>
      </div>
    </div>
  );
};

export default StatusBar;