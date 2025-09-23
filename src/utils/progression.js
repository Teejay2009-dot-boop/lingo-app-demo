// src/utils/progression.js
export const LEVELS = [
  { level: 1, xpRequired: 0, rank: "Moonstone" },
  { level: 2, xpRequired: 600, rank: "Topaz" },
  { level: 3, xpRequired: 1500, rank: "Sapphire" },
  { level: 4, xpRequired: 3000, rank: "Ruby" },
  { level: 5, xpRequired: 5000, rank: "Diamond" },
  // Add more levels as needed
];

export const getLevel = (xp) => {
  let currentLevel = LEVELS[0];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) {
      currentLevel = LEVELS[i];
      break;
    }
  }
  return currentLevel;
};

export const getLevelProgress = (xp) => {
  const currentLevelInfo = getLevel(xp);
  const nextLevelInfo = LEVELS.find(
    (level) => level.level === currentLevelInfo.level + 1
  );

  if (!nextLevelInfo) {
    return {
      currentLevel: currentLevelInfo.level,
      rank: currentLevelInfo.rank,
      progress: 100,
    };
  }

  const xpTowardsNextLevel = xp - currentLevelInfo.xpRequired;
  const xpNeededForNextLevel =
    nextLevelInfo.xpRequired - currentLevelInfo.xpRequired;
  const progress = Math.min(
    100,
    (xpTowardsNextLevel / xpNeededForNextLevel) * 100
  );

  return {
    currentLevel: currentLevelInfo.level,
    rank: currentLevelInfo.rank,
    progress,
  };
};

// New function specifically for rank-up detection
export const getRankUpData = (oldXp, newXp) => {
  const oldLevelInfo = getLevel(oldXp);
  const newLevelInfo = getLevel(newXp);

  if (oldLevelInfo.rank !== newLevelInfo.rank) {
    return {
      oldRank: oldLevelInfo.rank,
      newRank: newLevelInfo.rank,
      level: newLevelInfo.level,
      leveledUp: true,
    };
  }

  return { leveledUp: false };
};
