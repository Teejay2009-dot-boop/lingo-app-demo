// src/data/defaultUser.js
export const defaultUser = {
  username: "",
  avatar: "../assets/Girlremovebg-preview.png",
  rank: "Moonstone",
  learning_reason: "",
  proficiency_level: "A1",
  xp: 0,
  total_accuracy: 0,
  total_lessons: 0,
  total_xp: 0,
  level: 1,
  level_name: "Moonstone",
  xp_to_next_level: 50,
  streak_required: 3,
  lesson_history: [],
  streak_days: 0,
  current_streak: 0,
  last_active_date: new Date().toISOString(),
  last_reward_date: null,
  reward_streak: 0,
  streak_freezes: 0,
  used_streak_freezes: [],
  lives: 5,
  max_lives: 5,
  last_life_lost_time: null,
  last_login: new Date().toISOString(),
  is_premium: false,
  life_purchases: [],
  coins: 0,
  tickets: 0,
  total_coins_earned: 0,
  total_coins_spent: 0,
  total_tickets_earned: 0,
  total_tickets_spent: 0,
  coin_history: [],
  ticket_history: [],
  notes: {},
  ad_watches: [],
  completed_lessons: [],
  progress: {
    accuracy: 0,
    fluency: 0,
    score: 0,
    rank: "",
    badges: [],
    achievements: [],
    current_lesson: "",
    completed_lessons: [],
    challenge_results: [],
    exercise_data: {
      vocabulary: {},
      grammar: {},
      speaking: {},
      listening: {},
    },
  },
  title: "Moonstone Beginner",
  lessons: 5,
};

export const xpTable = [0, 100, 250, 500, 1000, 2000, 3500, 5000];

export const rankTable = [
  { minLevel: 1, rank: "Beginner" },
  { minLevel: 3, rank: "Intermediate" },
  { minLevel: 5, rank: "Advanced" },
  { minLevel: 7, rank: "Master" },
];

export const getNextXP = (currentXP) => {
  for (let i = 0; i < xpTable.length; i++) {
    if (currentXP < xpTable[i]) {
      return xpTable[i];
    }
  }
  return xpTable[xpTable.length - 1]; // Max XP reached
};

export const getRank = (level) => {
  let userRank = "Beginner";
  for (const rankInfo of rankTable) {
    if (level >= rankInfo.minLevel) {
      userRank = rankInfo.rank;
    }
  }
  return userRank;
};

export const updateUserProgress = (user) => {
  let newLevel = user.level;
  for (let i = xpTable.length - 1; i >= 0; i--) {
    if (user.xp >= xpTable[i]) {
      newLevel = i + 1;
      break;
    }
  }

  const newRank = getRank(newLevel);

  return {
    ...user,
    level: newLevel,
    rank: newRank,
    xp_to_next_level: getNextXP(user.xp) - user.xp,
  };
};
