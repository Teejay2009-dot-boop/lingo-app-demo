export const LEVELS = [
  { level: 1, xpRequired: 0, rank: "Beginner" },
  { level: 2, xpRequired: 100, rank: "Beginner" },
  { level: 3, xpRequired: 250, rank: "Intermediate" },
  { level: 4, xpRequired: 500, rank: "Intermediate" },
  { level: 5, xpRequired: 1000, rank: "Advanced" },
  { level: 6, xpRequired: 2000, rank: "Advanced" },
  { level: 7, xpRequired: 3500, rank: "Master" },
  { level: 8, xpRequired: 5000, rank: "Master" },
];

export const getLevel = (xp) => {
  let currentLevel = LEVELS[0];
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xpRequired) {
      currentLevel = LEVELS[i];
    } else {
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
      progress: 100, // Max level reached
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

