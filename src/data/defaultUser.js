// src/data/defaultUser.js
export const defaultUser = {
  username: "",
  avatar: "../assets/Girlremovebg-preview.png",
  rank: "Moonstone", // Default rank
  learning_reason: "",
  proficiency_level: "A1",
  xp: 0,
  total_accuracy: 0,
  total_lessons: 0,
  total_xp: 0,
  level: 1,
  level_name: "Beginner",
  xp_to_next_level: 100,

  streak_days: 0,
  current_streak: 0,
  streak_required: 0,
  reward_streak: 0,
  streak_freezes: 0,
  used_streak_freezes: [],

  last_active_date: new Date().toISOString(),
  last_reward_date: null,
  last_life_lost_time: null,
  last_login: new Date().toISOString(),

  lives: 5,
  max_lives: 5,
  life_purchases: [],
  is_premium: false,

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
  lesson_history: [],

  // 🔑 keep practice + challenge stats
  practice_sessions: 0,
  practice_time: 0,
  challenges_attempted: 0,
  challenges_won: 0,
  fastest_challenge_time: null,

  // 🔑 unlocked systems (final earned stuff)
  unlocked_badges: [], // only store badge ids here
  unlocked_achievements: [], // only store achievement ids here
  rank_history: [],

  // 🔑 progress tracking (temporary/session data)
  progress: {
    accuracy: 0,
    fluency: 0,
    score: 0,
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

  title: "Beginner",
  lessons: 0,
};
