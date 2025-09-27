// src/utils/rankSystem.js

export const RANK_SYSTEM = {
  Moonstone: {
    min_level: 1,
    max_level: 10,
    requirements: { accuracy: 60, streak: 3, lessons: 5 },
    color: [0.8, 0.8, 1, 1], // Light blue
  },
  Topaz: {
    min_level: 11,
    max_level: 20,
    requirements: { accuracy: 65, streak: 5, lessons: 10 },
    color: [0.1, 0.8, 0.8, 1], // Teal
  },
  Amethyst: {
    min_level: 21,
    max_level: 30,
    requirements: { accuracy: 70, streak: 7, lessons: 20 },
    color: [0.6, 0.2, 0.8, 1], // Purple
  },
  Emerald: {
    min_level: 31,
    max_level: 40,
    requirements: { accuracy: 75, streak: 10, lessons: 30 },
    color: [0.2, 0.8, 0.2, 1], // Green
  },
  Sapphire: {
    min_level: 41,
    max_level: 50,
    requirements: { accuracy: 80, streak: 14, lessons: 40 },
    color: [0.2, 0.2, 1, 1], // Blue
  },
  Ruby: {
    min_level: 51,
    max_level: 60,
    requirements: { accuracy: 85, streak: 21, lessons: 50 },
    color: [1, 0.2, 0.2, 1], // Red
  },
  Diamond: {
    min_level: 61,
    max_level: 70,
    requirements: { accuracy: 90, streak: 30, lessons: 60 },
    color: [0.8, 0.8, 0.8, 1], // Light gray
  },
  Platinum: {
    min_level: 71,
    max_level: 80,
    requirements: { accuracy: 95, streak: 45, lessons: 70 },
    color: [0.9, 0.9, 0.9, 1], // White
  },
  "Philosophers Stone": {
    min_level: 81,
    max_level: 100,
    requirements: { accuracy: 100, streak: 60, lessons: 100 },
    color: [1, 0.84, 0, 1], // Gold
  },
};

export function getUserRank({ level, accuracy, streak, lessons }) {
  for (const [rank, info] of Object.entries(RANK_SYSTEM)) {
    if (
      level >= info.min_level &&
      level <= info.max_level &&
      accuracy >= info.requirements.accuracy &&
      streak >= info.requirements.streak &&
      lessons >= info.requirements.lessons
    ) {
      return rank;
    }
  }
  // If no rank matches, return lowest
  return "Moonstone";
}
