import { db } from "../firebase/config/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

// Helper function to get UTC date string (YYYY-MM-DD)
const getUTCDateString = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

// Helper function to convert any date to UTC date string
const toUTCDateString = (date) => {
  if (!date) return null;
  
  // If it's a Firestore timestamp, convert to Date first
  const jsDate = date.toDate ? date.toDate() : new Date(date);
  return getUTCDateString(jsDate);
};

export const updateStreak = async (uid) => {
  if (!uid) {
    return;
  }

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return;
  }

  const userData = userSnap.data();
  
  // Get current UTC date (never trust client clock for dates)
  const todayUTCString = getUTCDateString();
  
  let currentStreak = userData.current_streak || 0;
  let longestStreak = userData.longest_streak || 0;
  let lastActiveUTC = userData.last_active_utc || null; // Store UTC date string
  let lastLogin = userData.last_login || null;

  let newStreak = currentStreak;
  let streakUpdated = false;

  if (!lastActiveUTC) {
    // First time login or migrating from old system
    newStreak = 1;
    streakUpdated = true;
  } else {
    // Calculate difference in days using UTC dates
    const lastActiveDate = new Date(lastActiveUTC + 'T00:00:00.000Z');
    const todayDate = new Date(todayUTCString + 'T00:00:00.000Z');
    
    const diffTime = todayDate.getTime() - lastActiveDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day - increment streak
      newStreak += 1;
      streakUpdated = true;
    } else if (diffDays === 0) {
      // Same day - no change to streak
    } else if (diffDays > 1) {
      // Broken streak - reset to 1
      newStreak = 1;
      streakUpdated = true;
    } else {
      // This shouldn't happen with UTC dates, but handle gracefully
      newStreak = 1;
      streakUpdated = true;
    }
  }

  // Update longest streak if current is higher
  if (newStreak > longestStreak) {
    longestStreak = newStreak;
  }

  // Always update last_active_utc to current UTC date
  // Use serverTimestamp for last_login for audit purposes
  const updateData = {
    last_active_utc: todayUTCString,
    last_login: serverTimestamp(),
  };

  // Only update streak fields if streak actually changed
  if (streakUpdated || !lastActiveUTC) {
    updateData.current_streak = newStreak;
    updateData.longest_streak = longestStreak;
  }

  await updateDoc(userRef, updateData);

  return {
    currentStreak: newStreak,
    longestStreak: longestStreak,
    streakUpdated: streakUpdated,
    lastActiveUTC: todayUTCString
  };
};

// Migration function for existing users
export const migrateToUTCStreak = async (uid) => {
  if (!uid) return;

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return;

  const userData = userSnap.data();
  
  // If user has last_login but no last_active_utc, migrate them
  if (userData.last_login && !userData.last_active_utc) {
    const lastLoginDate = userData.last_login.toDate();
    const lastActiveUTC = getUTCDateString(lastLoginDate);
    
    await updateDoc(userRef, {
      last_active_utc: lastActiveUTC,
      migrated_to_utc: true
    });
  }
};

// Utility function to check streak status without updating
export const checkStreakStatus = async (uid) => {
  if (!uid) return null;

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return null;

  const userData = userSnap.data();
  const todayUTCString = getUTCDateString();
  const lastActiveUTC = userData.last_active_utc;
  
  let canIncrementStreak = false;
  let daysSinceLastActive = null;

  if (lastActiveUTC) {
    const lastActiveDate = new Date(lastActiveUTC + 'T00:00:00.000Z');
    const todayDate = new Date(todayUTCString + 'T00:00:00.000Z');
    
    const diffTime = todayDate.getTime() - lastActiveDate.getTime();
    daysSinceLastActive = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    canIncrementStreak = daysSinceLastActive === 1;
  }

  return {
    currentStreak: userData.current_streak || 0,
    longestStreak: userData.longest_streak || 0,
    lastActiveUTC: lastActiveUTC,
    todayUTC: todayUTCString,
    canIncrementStreak: canIncrementStreak,
    daysSinceLastActive: daysSinceLastActive,
    needsMigration: !lastActiveUTC && userData.last_login
  };
};

// Test function to verify UTC logic
export const testUTCStreakLogic = async (uid, testDateUTC = null) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return;
  }

  const userData = userSnap.data();
  
  // Use test date or current UTC date
  const todayUTCString = testDateUTC || getUTCDateString();
  const lastActiveUTC = userData.last_active_utc;
  const currentStreak = userData.current_streak || 0;

  if (lastActiveUTC) {
    const lastActiveDate = new Date(lastActiveUTC + 'T00:00:00.000Z');
    const todayDate = new Date(todayUTCString + 'T00:00:00.000Z');
    
    const diffTime = todayDate.getTime() - lastActiveDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Would increment streak
    } else if (diffDays === 0) {
      // Same day - streak unchanged
    } else if (diffDays > 1) {
      // Would reset streak to 1
    } else {
      // Invalid day difference
    }
  } else {
    // No last_active_utc - would set streak to 1
  }
};