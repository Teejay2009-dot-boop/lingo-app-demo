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
