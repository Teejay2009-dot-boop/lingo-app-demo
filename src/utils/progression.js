// src/utils/progression.js

// Progressive XP requirements (100 → 120 → 144 → etc.)
export const calculateLevelThresholds = () => {
  const thresholds = [];
  let xpRequired = 100; // Starting XP for level 2 (level 1 is 0 XP)
  
  thresholds.push(0); // Level 1: 0 XP
  
  for (let level = 2; level <= 100; level++) {
    thresholds.push(Math.floor(xpRequired));
    xpRequired *= 1.2; // 20% increase per level
  }
  
  return thresholds;
};

const LEVEL_THRESHOLDS = calculateLevelThresholds();

export const getLevel = (xp) => {
  let currentLevel = 1;
  
  for (let level = 1; level <= LEVEL_THRESHOLDS.length; level++) {
    if (xp >= LEVEL_THRESHOLDS[level - 1]) {
      currentLevel = level;
    } else {
      break;
    }
  }
  
  return currentLevel;
};

export const getLevelProgress = (xp) => {
  const currentLevel = getLevel(xp);
  const currentLevelXP = LEVEL_THRESHOLDS[currentLevel - 1];
  const nextLevelXP = LEVEL_THRESHOLDS[currentLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  
  const xpProgress = xp - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const progress = xpNeeded > 0 ? Math.min(100, (xpProgress / xpNeeded) * 100) : 100;
  
  return {
    currentLevel,
    progress,
    xpProgress,
    xpNeeded,
    currentLevelXP,
    nextLevelXP
  };
};

// Level-up detection only (no ranks here)
export const getLevelUpData = (oldXp, newXp) => {
  const oldLevel = getLevel(oldXp);
  const newLevel = getLevel(newXp);

  if (newLevel > oldLevel) {
    return {
      leveledUp: true,
      oldLevel,
      newLevel
    };
  }

  return { leveledUp: false };
};