export enum GamePhase {
  STORY = 'STORY',
  COMBAT = 'COMBAT',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export interface WeaponStats {
  damage: number;
  scaling: 'STR' | 'DEX' | 'NONE'; // Hangi stattan güç alıyor
  parryBonus: number; // 0.1 = %10 ekstra şans
  description: string; // Kısa stat açıklaması (örn: "Yüksek Hasar, Düşük Peri")
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'WEAPON' | 'CONSUMABLE' | 'KEY';
  weaponStats?: WeaponStats; // Sadece silahlar için
  effect?: (state: PlayerState) => PlayerState;
}

export interface CodexEntry {
  id: string;
  title: string;
  category: 'PERSON' | 'PLACE' | 'LORE'; // New Category Field
  content: string[];
  image?: string;
}

export interface PlayerStats {
  vitality: number;   // Increases HP
  endurance: number;  // Increases Stamina
  strength: number;   // Increases Damage
  dexterity: number;  // Increases Crit/Parry chance
}

export interface Bankai {
  name: string;
  releaseCommand: string; // e.g. "Parçala", "Uyan"
  description: string;
  type: 'INSTANT' | 'BUFF';
  visualColor: string; // Hex code or tailwind class hint
  // Effects
  damageMultiplier?: number; // For instant
  buffStats?: Partial<PlayerStats>; // For buff
}

export interface PlayerState {
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  estus: number;
  name: string;
  inventory: Item[];
  equippedWeapon: string; // Name of the item
  unlockedCodexEntries: string[];
  codexImages: Record<string, string>;
  // RPG Mechanics
  stats: PlayerStats;
  level: number;
  xp: number;
  xpToNextLevel: number;
  attributePoints: number;
  // Limit Break / Bankai
  limitGauge: number;
  maxLimitGauge: number;
  bankai: Bankai;
}

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  damage: number;
  description: string;
  image?: string;
  stamina: number;
  maxStamina: number;
  xpReward: number; 
}

export interface Choice {
  text: string;
  nextSceneId: string;
  condition?: (state: PlayerState) => boolean;
  action?: (state: PlayerState) => PlayerState;
}

export interface Scene {
  id: string;
  text: string[];
  image?: string;
  speaker?: string; 
  choices: Choice[];
  combatEncounter?: Enemy; 
}

export interface GameState {
  currentSceneId: string;
  phase: GamePhase;
  player: PlayerState;
  currentEnemy: Enemy | null;
  history: string[]; 
}