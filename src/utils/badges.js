import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase/config/firebase";
import BADGES from "../data/badges";

// Check if user earns any new badges
export const checkForNewBadges = (userData) => {
  if (!userData || !userData.unlocked_badges) return [];

  const newBadges = [];
  const currentBadges = new Set(userData.unlocked_badges);

  // Check each badge
  Object.values(BADGES).forEach((badge) => {
    if (!currentBadges.has(badge.id)) {
      const isEarned = checkBadgeRequirements(badge, userData);
      if (isEarned) {
        newBadges.push(badge);
      }
    }
  });

  return newBadges;
};

// Check if badge requirements are met
const checkBadgeRequirements = (badge, userData) => {
  const requirements = badge.requirements;

  for (const [key, requiredValue] of Object.entries(requirements)) {
    let currentValue = 0;

    switch (key) {
      case "lessons":
      case "total_lessons":
        currentValue = userData.completed_lessons?.length || 0;
        break;
      case "streak":
        currentValue = userData.current_streak || 0;
        break;
      case "accuracy":
        currentValue = userData.progress?.accuracy || 0;
        break;
      case "level":
        currentValue = userData.level || 1;
        break;
      default:
        currentValue = 0;
    }

    if (currentValue < requiredValue) {
      return false;
    }
  }

  return true;
};

// Award badge to user
export const awardBadge = async (userId, badgeId) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      unlocked_badges: arrayUnion(badgeId),
    });
    return true;
  } catch (error) {
    console.error("Error awarding badge:", error);
    return false;
  }
};
