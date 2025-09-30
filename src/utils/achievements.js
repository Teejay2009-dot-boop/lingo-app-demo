import { doc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { db } from "../firebase/config/firebase";
import ACHIEVEMENTS from "../data/achievements";

// Check if user earns any new achievements
export const checkForNewAchievements = (userData, previousUserData = {}) => {
  if (!userData || !userData.unlocked_achievements) return [];

  const newAchievements = [];
  const currentAchievements = new Set(userData.unlocked_achievements || []);

  // Check each achievement
  Object.values(ACHIEVEMENTS).forEach((achievement) => {
    if (!currentAchievements.has(achievement.id)) {
      const isEarned = checkAchievementRequirements(
        achievement,
        userData,
        previousUserData
      );
      if (isEarned) {
        newAchievements.push(achievement);
      }
    }
  });

  return newAchievements;
};

// Check if achievement requirements are met
const checkAchievementRequirements = (
  achievement,
  userData,
  previousUserData
) => {
  const requirements = {
    first_lesson: () => (userData.completed_lessons?.length || 0) >= 1,
    streak_7: () => (userData.current_streak || 0) >= 7,
    streak_30: () => (userData.current_streak || 0) >= 30,
    perfectionist: () => {
      // Check if any lesson had 100% accuracy
      const lessons = userData.lesson_history || [];
      return lessons.some((lesson) => lesson.accuracy === 100);
    },
    vocab_master: () =>
      (userData.progress?.exercise_data?.vocabulary?.completed || 0) >= 50,
    listening_pro: () =>
      (userData.progress?.exercise_data?.listening?.completed || 0) >= 30,
    grammar_guru: () =>
      (userData.progress?.exercise_data?.grammar?.completed || 0) >= 40,
    social_butterfly: () =>
      (userData.progress?.exercise_data?.roleplay?.completed || 0) >= 20,
    speed_racer: () => {
      // Check if any lesson was completed in under 5 minutes
      const lessons = userData.lesson_history || [];
      return lessons.some((lesson) => lesson.duration && lesson.duration < 300);
    },
    early_bird: () => {
      // Check if any lesson was completed before 8 AM
      const lessons = userData.lesson_history || [];
      return lessons.some((lesson) => {
        if (!lesson.timestamp) return false;
        const hour = new Date(lesson.timestamp).getHours();
        return hour < 8;
      });
    },
    night_owl: () => {
      // Check if any lesson was completed after 10 PM
      const lessons = userData.lesson_history || [];
      return lessons.some((lesson) => {
        if (!lesson.timestamp) return false;
        const hour = new Date(lesson.timestamp).getHours();
        return hour >= 22;
      });
    },
    weekend_warrior: () => {
      // Check if lessons were completed on both Saturday and Sunday
      const lessons = userData.lesson_history || [];
      const daysCompleted = new Set();
      lessons.forEach((lesson) => {
        if (lesson.timestamp) {
          const day = new Date(lesson.timestamp).getDay();
          if (day === 0 || day === 6) {
            // 0 = Sunday, 6 = Saturday
            daysCompleted.add(day);
          }
        }
      });
      return daysCompleted.size >= 2;
    },
    collectionist: () => (userData.unlocked_badges?.length || 0) >= 10,
    completionist: () => {
      // This would need the total number of badges - for now, hardcode or import
      const totalBadges = 15; // Update this with actual badge count
      return (userData.unlocked_badges?.length || 0) >= totalBadges;
    },
    linguist: () => (userData.level || 1) >= 20,
    polyglot: () => (userData.level || 1) >= 50,
    marathon: () => {
      // Check if user completed 5 lessons in one day
      const lessons = userData.lesson_history || [];
      const lessonsByDay = {};
      lessons.forEach((lesson) => {
        if (lesson.timestamp) {
          const date = new Date(lesson.timestamp).toDateString();
          lessonsByDay[date] = (lessonsByDay[date] || 0) + 1;
        }
      });
      return Object.values(lessonsByDay).some((count) => count >= 5);
    },
    // These would need app-specific implementation
    generous: () => false, // Would need referral tracking
    reviewer: () => false, // Would need app rating tracking
    explorer: () => {
      // Check if user tried all exercise types
      const lessons = userData.lesson_history || [];
      const exerciseTypes = new Set(
        lessons.map((lesson) => lesson.type).filter(Boolean)
      );
      return exerciseTypes.size >= 5; // Adjust based on your exercise types
    },
  };

  const checkFunction = requirements[achievement.id];
  return checkFunction ? checkFunction() : false;
};

// Award achievement to user
export const awardAchievement = async (userId, achievementId) => {
  try {
    const userRef = doc(db, "users", userId);
    const achievement = ACHIEVEMENTS[achievementId];

    // Update achievements and apply rewards
    const updateData = {
      unlocked_achievements: arrayUnion(achievementId),
    };

    // Add reward coins
    if (achievement.reward?.coins) {
      updateData.coins = increment(achievement.reward.coins);
      updateData.total_coins_earned = increment(achievement.reward.coins);
    }

    // Add reward tickets
    if (achievement.reward?.tickets) {
      updateData.tickets = increment(achievement.reward.tickets);
      updateData.total_tickets_earned = increment(achievement.reward.tickets);
    }

    await updateDoc(userRef, updateData);
    return true;
  } catch (error) {
    console.error("Error awarding achievement:", error);
    return false;
  }
};

// Get achievement progress (for progress bars)
export const getAchievementProgress = (achievement, userData) => {
  if (!userData) return 0;

  const progressCalculators = {
    first_lesson: () =>
      Math.min(((userData.completed_lessons?.length || 0) / 1) * 100, 100),
    streak_7: () => Math.min(((userData.current_streak || 0) / 7) * 100, 100),
    streak_30: () => Math.min(((userData.current_streak || 0) / 30) * 100, 100),
    vocab_master: () =>
      Math.min(
        ((userData.progress?.exercise_data?.vocabulary?.completed || 0) / 50) *
          100,
        100
      ),
    listening_pro: () =>
      Math.min(
        ((userData.progress?.exercise_data?.listening?.completed || 0) / 30) *
          100,
        100
      ),
    grammar_guru: () =>
      Math.min(
        ((userData.progress?.exercise_data?.grammar?.completed || 0) / 40) *
          100,
        100
      ),
    social_butterfly: () =>
      Math.min(
        ((userData.progress?.exercise_data?.roleplay?.completed || 0) / 20) *
          100,
        100
      ),
    collectionist: () =>
      Math.min(((userData.unlocked_badges?.length || 0) / 10) * 100, 100),
    linguist: () => Math.min(((userData.level || 1) / 20) * 100, 100),
    polyglot: () => Math.min(((userData.level || 1) / 50) * 100, 100),
    marathon: () => {
      const lessons = userData.lesson_history || [];
      const lessonsByDay = {};
      lessons.forEach((lesson) => {
        if (lesson.timestamp) {
          const date = new Date(lesson.timestamp).toDateString();
          lessonsByDay[date] = (lessonsByDay[date] || 0) + 1;
        }
      });
      const maxLessonsInDay = Math.max(...Object.values(lessonsByDay), 0);
      return Math.min((maxLessonsInDay / 5) * 100, 100);
    },
    // Default progress for boolean achievements
    perfectionist: () => {
      const lessons = userData.lesson_history || [];
      return lessons.some((lesson) => lesson.accuracy === 100) ? 100 : 0;
    },
    speed_racer: () => {
      const lessons = userData.lesson_history || [];
      return lessons.some((lesson) => lesson.duration && lesson.duration < 300)
        ? 100
        : 0;
    },
    early_bird: () => {
      const lessons = userData.lesson_history || [];
      return lessons.some((lesson) => {
        if (!lesson.timestamp) return false;
        const hour = new Date(lesson.timestamp).getHours();
        return hour < 8;
      })
        ? 100
        : 0;
    },
    night_owl: () => {
      const lessons = userData.lesson_history || [];
      return lessons.some((lesson) => {
        if (!lesson.timestamp) return false;
        const hour = new Date(lesson.timestamp).getHours();
        return hour >= 22;
      })
        ? 100
        : 0;
    },
    weekend_warrior: () => {
      const lessons = userData.lesson_history || [];
      const daysCompleted = new Set();
      lessons.forEach((lesson) => {
        if (lesson.timestamp) {
          const day = new Date(lesson.timestamp).getDay();
          if (day === 0 || day === 6) {
            daysCompleted.add(day);
          }
        }
      });
      return Math.min((daysCompleted.size / 2) * 100, 100);
    },
    explorer: () => {
      const lessons = userData.lesson_history || [];
      const exerciseTypes = new Set(
        lessons.map((lesson) => lesson.type).filter(Boolean)
      );
      return Math.min((exerciseTypes.size / 5) * 100, 100);
    },
  };

  const calculator = progressCalculators[achievement.id];
  return calculator ? Math.round(calculator()) : 0;
};
