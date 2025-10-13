import { db } from "../firebase/config/firebase";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

export const updateStreak = async (uid) => {
  if (!uid) {
    console.error("User ID is required for streak update.");
    return;
  }

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    console.error("User document not found");
    return;
  }

  const userData = userSnap.data();
  
  // Use client-side date only (no server timestamp for comparison)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset to start of day
  
  let currentStreak = userData.current_streak || 0;
  let longestStreak = userData.longest_streak || 0;
  let lastActiveDate = userData.last_login ? userData.last_login.toDate() : null;

  console.log("🔍 STREAK DEBUG:");
  console.log("Today:", today.toDateString());
  console.log("Last Active:", lastActiveDate ? lastActiveDate.toDateString() : "Never");
  console.log("Current Streak:", currentStreak);

  let newStreak = currentStreak;

  if (!lastActiveDate) {
    // First time login
    newStreak = 1;
    console.log("🎯 First login - streak set to 1");
  } else {
    // Reset last active to start of that day for comparison
    const lastActiveDay = new Date(lastActiveDate);
    lastActiveDay.setHours(0, 0, 0, 0);
    
    // Calculate difference in days
    const diffTime = today.getTime() - lastActiveDay.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    console.log("📅 Day Difference:", diffDays);

    if (diffDays === 1) {
      // Consecutive day - increment streak
      newStreak += 1;
      console.log("✅ Consecutive day - streak:", newStreak);
    } else if (diffDays === 0) {
      // Same day - no change
      console.log("🔄 Same day - streak unchanged:", newStreak);
    } else if (diffDays > 1) {
      // Broken streak - reset to 1
      newStreak = 1;
      console.log("🔄 Streak broken - reset to 1");
    } else if (diffDays < 0) {
      // Future date detected - reset streak (safety measure)
      console.log("⚠️ Future date detected - resetting streak");
      newStreak = 1;
    }
  }

  // Update longest streak if current is higher
  if (newStreak > longestStreak) {
    longestStreak = newStreak;
    console.log("🏆 New longest streak:", longestStreak);
  }

  // Always update last_login to current client time
  await updateDoc(userRef, {
    current_streak: newStreak,
    longest_streak: longestStreak,
    last_login: new Date(), // Use client date instead of serverTimestamp
  });
  
  console.log(`💾 Saved: streak=${newStreak}, longest=${longestStreak}`);

  return newStreak;
};