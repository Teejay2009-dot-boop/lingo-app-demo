// src/data/rankSystem.js
export const RANK_SYSTEM = {
  Moonstone: {
    min_level: 1,
    max_level: 10,
    requirements: { accuracy: 60, streak: 3, lessons: 5 },
    color: [0.8, 0.8, 1, 1],
  },
  Topaz: {
    min_level: 11,
    max_level: 20,
    requirements: { accuracy: 65, streak: 5, lessons: 10 },
    color: [0.1, 0.8, 0.8, 1],
  },
  Amethyst: {
    min_level: 21,
    max_level: 30,
    requirements: { accuracy: 70, streak: 7, lessons: 20 },
    color: [0.6, 0.2, 0.8, 1],
  },
  Emerald: {
    min_level: 31,
    max_level: 40,
    requirements: { accuracy: 75, streak: 10, lessons: 30 },
    color: [0.2, 0.8, 0.2, 1],
  },
  Sapphire: {
    min_level: 41,
    max_level: 50,
    requirements: { accuracy: 80, streak: 14, lessons: 40 },
    color: [0.2, 0.2, 1, 1],
  },
  Ruby: {
    min_level: 51,
    max_level: 60,
    requirements: { accuracy: 85, streak: 21, lessons: 50 },
    color: [1, 0.2, 0.2, 1],
  },
  Diamond: {
    min_level: 61,
    max_level: 70,
    requirements: { accuracy: 90, streak: 30, lessons: 60 },
    color: [0.8, 0.8, 0.8, 1],
  },
  Platinum: {
    min_level: 71,
    max_level: 80,
    requirements: { accuracy: 95, streak: 45, lessons: 70 },
    color: [0.9, 0.9, 0.9, 1],
  },
  "Philosophers Stone": {
    min_level: 81,
    max_level: 100,
    requirements: { accuracy: 100, streak: 60, lessons: 100 },
    color: [1, 0.84, 0, 1],
  },
};

// New function to calculate user's current rank
export const getUserRank = (userData) => {
  const { level = 1, accuracy = 0, streak = 0, lessonsCompleted = 0 } = userData;
  
  const ranks = Object.keys(RANK_SYSTEM);
  
  // Check from highest to lowest rank
  for (let i = ranks.length - 1; i >= 0; i--) {
    const rankName = ranks[i];
    const rank = RANK_SYSTEM[rankName];
    
    if (level >= rank.min_level && 
        level <= rank.max_level &&
        accuracy >= rank.requirements.accuracy &&
        streak >= rank.requirements.streak &&
        lessonsCompleted >= rank.requirements.lessons) {
      return {
        name: rankName,
        ...rank
      };
    }
  }
  
  // Default to first rank if no requirements met
  const defaultRank = RANK_SYSTEM.Moonstone;
  return {
    name: "Moonstone",
    ...defaultRank
  };
};

// Check if user ranked up
export const getRankUpData = (oldUserData, newUserData) => {
  const oldRank = getUserRank(oldUserData);
  const newRank = getUserRank(newUserData);
  
  if (oldRank.name !== newRank.name) {
    return {
      rankedUp: true,
      oldRank: oldRank.name,
      newRank: newRank.name,
      rankData: newRank
    };
  }
  
  return { rankedUp: false };
};

// Get progress towards next rank
export const getNextRankProgress = (userData) => {
  const currentRank = getUserRank(userData);
  const ranks = Object.keys(RANK_SYSTEM);
  const currentIndex = ranks.indexOf(currentRank.name);
  
  if (currentIndex < ranks.length - 1) {
    const nextRankName = ranks[currentIndex + 1];
    const nextRank = RANK_SYSTEM[nextRankName];
    
    const progress = {
      level: Math.min(100, (userData.level / nextRank.min_level) * 100),
      accuracy: Math.min(100, (userData.accuracy / nextRank.requirements.accuracy) * 100),
      streak: Math.min(100, (userData.streak / nextRank.requirements.streak) * 100),
      lessons: Math.min(100, (userData.lessonsCompleted / nextRank.requirements.lessons) * 100)
    };
    
    return {
      nextRank: {
        name: nextRankName,
        ...nextRank
      },
      progress,
      requirements: nextRank
    };
  }
  
  return null; // User is at max rank
};