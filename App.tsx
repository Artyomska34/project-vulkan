import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import StatusBar from './components/StatusBar';
import StoryPanel from './components/StoryPanel';
import CombatPanel from './components/CombatPanel';
import CodexPanel from './components/CodexPanel';
import CharacterMenu from './components/CharacterMenu'; // New Component
import { INITIAL_PLAYER, SCENES } from './constants';
import { GameState, GamePhase, PlayerState, Item } from './types';
import { Book, Backpack } from 'lucide-react';

function App() {
  const [gameState, setGameState] = useState<GameState>({
    currentSceneId: 'start',
    phase: GamePhase.STORY,
    player: INITIAL_PLAYER,
    currentEnemy: null,
    history: []
  });

  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [isCharacterMenuOpen, setIsCharacterMenuOpen] = useState(false); // New state
  
  // Audio Refs
  const mainThemeRef = useRef<HTMLAudioElement>(null);
  const battleThemeRef = useRef<HTMLAudioElement>(null);

  const currentScene = SCENES[gameState.currentSceneId];

  // Music Logic
  useEffect(() => {
    if (gameState.phase === GamePhase.COMBAT) {
        mainThemeRef.current?.pause();
        if (battleThemeRef.current) {
            battleThemeRef.current.currentTime = 0;
            battleThemeRef.current.play().catch(e => console.log("Audio play failed (interaction needed):", e));
        }
    } else {
        battleThemeRef.current?.pause();
        if (mainThemeRef.current && mainThemeRef.current.paused) {
            mainThemeRef.current.play().catch(e => console.log("Audio play failed (interaction needed):", e));
        }
    }
  }, [gameState.phase]);

  const handleChoice = (nextSceneId: string, action?: (s: PlayerState) => PlayerState) => {
    let nextPlayerState = { ...gameState.player };
    
    if (action) {
      nextPlayerState = action(nextPlayerState);
    }

    // Passive HP Regeneration
    // Condition: Player has defeated Celebi (checked via unlocked codex entry)
    if (nextPlayerState.unlockedCodexEntries.includes('celebi')) {
       nextPlayerState.hp = Math.min(nextPlayerState.maxHp, nextPlayerState.hp + 5);
    }

    const nextScene = SCENES[nextSceneId];
    
    // Safety check if nextScene is undefined
    if (!nextScene) {
      console.error(`Scene not found: ${nextSceneId}`);
      return;
    }

    // Check for combat trigger
    if (nextScene.combatEncounter) {
      setGameState({
        ...gameState,
        player: nextPlayerState,
        currentSceneId: nextSceneId,
        phase: GamePhase.COMBAT,
        currentEnemy: nextScene.combatEncounter
      });
    } else {
      setGameState({
        ...gameState,
        player: nextPlayerState,
        currentSceneId: nextSceneId,
        phase: GamePhase.STORY,
        currentEnemy: null
      });
    }
  };

  // Modified to accept functional updates to prevent race conditions in combat
  const handleUpdatePlayer = (update: PlayerState | ((prev: PlayerState) => PlayerState)) => {
    setGameState(prev => {
      const newPlayer = typeof update === 'function' ? update(prev.player) : update;
      return { ...prev, player: newPlayer };
    });
  };

  const handleCombatVictory = () => {
    // Determine where to go after victory based on current scene
    const nextId = gameState.currentSceneId === 'celebi_intro' ? 'celebi_defeat' : 'start';
    
    setGameState(prev => ({
      ...prev,
      phase: GamePhase.STORY,
      currentSceneId: nextId,
      currentEnemy: null
    }));
  };

  const handleCombatDefeat = () => {
    setGameState(prev => ({
      ...prev,
      phase: GamePhase.GAME_OVER
    }));
  };

  const handleRestart = () => {
     setGameState({
        currentSceneId: 'start',
        phase: GamePhase.STORY,
        player: INITIAL_PLAYER,
        currentEnemy: null,
        history: []
      });
  };

  // Guard against invalid scene
  if (!currentScene) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center text-red-500">
          Error: Scene '{gameState.currentSceneId}' not found.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
       {/* Audio Elements */}
      <audio ref={mainThemeRef} src="/main_theme.mp3" loop />
      <audio ref={battleThemeRef} src="/battle_music.mp3" loop />

      <div className="absolute top-4 right-4 z-10 flex gap-2">
         {/* Character/Inventory Button */}
         <button 
            onClick={() => setIsCharacterMenuOpen(true)}
            className="p-2 bg-black/50 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors flex items-center gap-2"
         >
            <Backpack className="w-4 h-4" />
            <span className="text-xs font-title">
              KARAKTER
              {gameState.player.attributePoints > 0 && <span className="ml-1 text-yellow-500 animate-pulse">(!)</span>}
            </span>
         </button>

         {/* Codex Button */}
         <button 
           onClick={() => setIsCodexOpen(true)}
           className="p-2 bg-black/50 border border-zinc-700 text-zinc-400 hover:text-yellow-500 hover:border-yellow-700 transition-colors flex items-center gap-2"
         >
            <Book className="w-4 h-4" />
            <span className="text-xs font-title">KODEX</span>
         </button>
      </div>

      <StatusBar player={gameState.player} />

      <div className="flex-1 flex flex-col relative">
        {gameState.phase === GamePhase.STORY && (
          <StoryPanel 
            scene={currentScene} 
            onChoice={handleChoice} 
            player={gameState.player} 
          />
        )}

        {gameState.phase === GamePhase.COMBAT && gameState.currentEnemy && (
          <CombatPanel 
            enemy={gameState.currentEnemy} 
            player={gameState.player}
            onVictory={handleCombatVictory}
            onDefeat={handleCombatDefeat}
            updatePlayer={handleUpdatePlayer}
          />
        )}

        {gameState.phase === GamePhase.GAME_OVER && (
          <div className="flex-1 flex flex-col items-center justify-center bg-black/90 z-20 animate-fade-in">
             <h1 className="text-6xl text-red-800 font-title mb-8 tracking-widest animate-you-died">YOU DIED</h1>
             <button 
               onClick={handleRestart}
               className="px-8 py-3 border border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-white font-serif text-xl opacity-0 animate-[fade-in_2s_ease-out_1s_forwards]"
             >
               SON BONFIRE'DAN BAŞLA
             </button>
          </div>
        )}

        {/* Codex Overlay */}
        {isCodexOpen && (
          <CodexPanel 
            player={gameState.player} 
            onClose={() => setIsCodexOpen(false)}
            updatePlayer={handleUpdatePlayer}
          />
        )}

        {/* Character Menu Overlay */}
        {isCharacterMenuOpen && (
          <CharacterMenu
            player={gameState.player}
            onClose={() => setIsCharacterMenuOpen(false)}
            updatePlayer={handleUpdatePlayer}
          />
        )}
      </div>
    </Layout>
  );
}

export default App;