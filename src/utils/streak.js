import { db } from "../firebase/config/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export const updateStreak = async (uid) => {
  if (!uid) {
    console.error("User ID is required for streak update.");
    return;
  }

  const streakRef = doc(db, `users/${uid}/meta`, "streak");
  const streakSnap = await getDoc(streakRef);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentStreak = 0;
  let lastActiveDate = null;

  if (streakSnap.exists()) {
    const data = streakSnap.data();
    currentStreak = data.streak || 0;
    lastActiveDate = data.lastActive ? data.lastActive.toDate() : null; // Convert Firestore Timestamp to Date
    if (lastActiveDate) lastActiveDate.setHours(0, 0, 0, 0);
  }

  let newStreak = currentStreak;

  if (!lastActiveDate) {
    // First activity or no previous streak data
    newStreak = 1;
  } else {
    const diffTime = Math.abs(today.getTime() - lastActiveDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Active yesterday, increment streak
      newStreak += 1;
    } else if (diffDays === 0) {
      // Active today, keep streak unchanged (already updated today)
      // No action needed for newStreak, it retains currentStreak
    } else {
      // More than 1 day gap, reset streak
      newStreak = 1;
    }
  }

  // Update Firestore only if streak or lastActive needs updating
  if (
    newStreak !== currentStreak ||
    !lastActiveDate ||
    today.getTime() !== lastActiveDate.getTime()
  ) {
    await setDoc(
      streakRef,
      {
        streak: newStreak,
        lastActive: serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`Streak updated to: ${newStreak}`);
  }

  return newStreak;
};


