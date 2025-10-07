import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import Badge from "../components/dashboard/Badges";
import {
  checkForNewAchievements,
  awardAchievement,
} from "../utils/achievements";
import { Link } from "react-router-dom";

import AchievementEarnedModal from "../components/dashboard/BadgeEarnedModal";
import NavBar from "../components/dashboard/NavBar";
import { checkForNewBadges, awardBadge } from "../utils/badges";
import { LevelUpModal } from "../components/LevelUpModal";
import BadgeEarnedModal from "../components/dashboard/BadgeEarnedModal";
import { getUserRank } from "../utils/rankSystem";
import { RankUpScreen } from "../components/RankUpScreen";
import { addNotification } from "../firebase/utils/notifications";
import { getRankUpData, getNextRankProgress } from "../data/RankSystem"; // FIXED: lowercase 'r'
import { getLevelProgress, getLevel } from "../utils/progression";
import { updateStreak } from "../utils/streak";
import {
  FaStar,
  FaSteam,
  FaHeart,
  FaWallet,
  FaBell,
  FaFire,
  FaCoins,
  FaChartBar,
  FaProcedures,
  FaKeyboard,
  FaTree,
  FaHome,
} from "react-icons/fa";

import avatar from "../assets/girlwithbg.jpg";
import { auth, db } from "../firebase/config/firebase";
import {
  doc,
  onSnapshot,
  updateDoc,
  increment,
  query,
  collection,
  where,
  setDoc,
  getDoc,
} from "firebase/firestore";

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDevTools, setShowDevTools] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [newlyEarnedAchievement, setNewlyEarnedAchievement] = useState(null);
  const [showRankUpScreen, setShowRankUpScreen] = useState(false);
  const [rankUpData, setRankUpData] = useState(null);
  const lastComputedRef = useRef(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [newlyEarnedBadge, setNewlyEarnedBadge] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // FIXED: formatXP function with proper null/undefined handling
  const formatXP = (xp) => {
    if (xp === undefined || xp === null) return "0";
    const xpNumber = Number(xp);
    if (isNaN(xpNumber)) return "0";
    if (xpNumber >= 1000000) {
      return (xpNumber / 1000000).toFixed(1) + "M";
    } else if (xpNumber >= 1000) {
      return (xpNumber / 1000).toFixed(1) + "K";
    }
    return xpNumber.toString();
  };

  // FIXED: Safe progress data calculation
  const getProgressData = () => {
    if (!userData || userData.xp === undefined || userData.xp === null) {
      return {
        currentLevel: 1,
        progress: 0,
        xpProgress: 0,
        xpNeeded: 100,
        totalXP: 0,
        currentLevelXP: 0,
        nextLevelXP: 100,
      };
    }
    try {
      return getLevelProgress(userData.xp);
    } catch (error) {
      console.error("Error calculating level progress:", error);
      return {
        currentLevel: 1,
        progress: 0,
        xpProgress: 0,
        xpNeeded: 100,
        totalXP: userData.xp || 0,
        currentLevelXP: 0,
        nextLevelXP: 100,
      };
    }
  };

  const progressData = getProgressData();

  // KEEP EXISTING: Refactored level progress calculation using progression utility
  const { currentLevel, progress } = getLevelProgress(userData?.xp || 0);

  // KEEP EXISTING: Get real rank using rank system
  const realRank = userData
    ? getUserRank({
        level: userData.level || 1,
        accuracy: userData.progress?.accuracy || 0,
        streak: userData.current_streak || 0,
        lessonsCompleted: userData.total_lessons || userData.lessons || 0,
      })
    : "Moonstone";

  // FIXED: Rank and level up detection
  useEffect(() => {
    if (!userData) return;

    // Prevent re-running if we already processed this data
    if (lastComputedRef.current?.xp === userData.xp) return;

    const userCurrentLevel = userData.level || 1;
    const userCurrentXP = userData.xp || 0;

    const updatedUserLevelInfo = getLevelProgress(userCurrentXP);

    // Check for level up
    if (updatedUserLevelInfo.currentLevel > userCurrentLevel) {
      setShowLevelUpModal(true);

      addNotification(auth.currentUser.uid, {
        type: "level-up",
        message: `You reached Level ${updatedUserLevelInfo.currentLevel}! 🎉`,
        level: updatedUserLevelInfo.currentLevel,
      });

      // Update user document - this will trigger userData change
      updateDoc(doc(db, "users", auth.currentUser.uid), {
        level: updatedUserLevelInfo.currentLevel,
      });
    }

    // FIXED: Check for rank up using full user data objects
    const currentUserData = {
      level: userData.level || 1,
      accuracy: userData.progress?.accuracy || 0,
      streak: userData.current_streak || 0,
      lessonsCompleted: userData.total_lessons || userData.lessons || 0,
      rank: userData.rank || "Moonstone",
    };

    const previousUserData = lastComputedRef.current?.userData || {
      level: 1,
      accuracy: 0,
      streak: 0,
      lessonsCompleted: 0,
      rank: "Moonstone",
    };

    const rankChange = getRankUpData(previousUserData, currentUserData);

    if (rankChange.rankedUp && rankChange.newRank !== userData.rank) {
      setRankUpData({
        ...rankChange,
        userXp: userCurrentXP,
        accuracy: userData.progress?.accuracy || 0,
        streak: userData.current_streak || 0,
        lessonsCompleted: userData.total_lessons || userData.lessons || 0,
      });
      setShowRankUpScreen(true);

      addNotification(auth.currentUser.uid, {
        type: "rankup",
        message: `You've been promoted to ${rankChange.newRank}! 🏆`,
        rank: rankChange.newRank,
      });

      // Update Firestore - this will trigger userData change
      updateDoc(doc(db, "users", auth.currentUser.uid), {
        rank: rankChange.newRank,
      });
    }

    // Update last computed snapshot to prevent re-processing
    lastComputedRef.current = {
      level: updatedUserLevelInfo.currentLevel,
      xp: userCurrentXP,
      userData: { ...currentUserData }, // Store full user data for rank comparison
    };
  }, [userData]);

  useEffect(() => {
    if (!userData || !auth.currentUser) return;

    console.log("🔍 Checking for new achievements...");

    const newAchievements = checkForNewAchievements(userData);

    if (newAchievements.length > 0) {
      console.log(
        "🏆 Found new achievements:",
        newAchievements.map((a) => a.name)
      );

      // Award each new achievement and show modal for the first one
      newAchievements.forEach(async (achievement, index) => {
        const success = await awardAchievement(
          auth.currentUser.uid,
          achievement.id
        );
        if (success) {
          console.log(`🎉 Awarded achievement: ${achievement.name}`);

          // Show modal for the first achievement
          if (index === 0) {
            setNewlyEarnedAchievement(achievement);
            setShowAchievementModal(true);
          }

          // Send notification
          addNotification(auth.currentUser.uid, {
            type: "achievement",
            title: "Achievement Unlocked! 💎",
            message: `You earned "${achievement.name}"!`,
            achievementId: achievement.id,
            timestamp: new Date(),
          });
        }
      });
    }
  }, [userData]);

  useEffect(() => {
    if (!userData || !auth.currentUser) return;

    console.log("🔄 Checking for new badges...");

    const newBadges = checkForNewBadges(userData);

    if (newBadges.length > 0) {
      console.log(
        "🏆 Found new badges:",
        newBadges.map((b) => b.name)
      );

      // Award each new badge and show modal for the first one
      newBadges.forEach(async (badge, index) => {
        const success = await awardBadge(auth.currentUser.uid, badge.id);
        if (success) {
          console.log(`🎉 Awarded badge: ${badge.name}`);

          // Show modal for the first badge
          if (index === 0) {
            setNewlyEarnedBadge(badge);
            setShowBadgeModal(true);
          }

          // Send regular notification
          addNotification(auth.currentUser.uid, {
            type: "badge",
            title: "Badge Earned! 🏆",
            message: `You unlocked the "${badge.name}" badge!`,
            badgeId: badge.id,
            timestamp: new Date(),
          });
        }
      });
    }
  }, [userData]);

  useEffect(() => {
    if (!userData || !auth.currentUser) return;

    console.log("🔄 Checking for badges...");

    // Check for new badges
    const newBadges = checkForNewBadges(userData);

    if (newBadges.length > 0) {
      console.log(
        "🏆 Found new badges:",
        newBadges.map((b) => b.name)
      );

      // Award each new badge
      newBadges.forEach(async (badge) => {
        const success = await awardBadge(auth.currentUser.uid, badge.id);
        if (success) {
          console.log(`🎉 Awarded badge: ${badge.name}`);
        }
      });
    } else {
      console.log("📭 No new badges found");
    }
  }, [userData]);

  // Add this temporary debug useEffect to see your rank status
  useEffect(() => {
    if (userData) {
      console.log("=== RANK DEBUG INFO ===");
      console.log("User Data:", {
        level: userData.level,
        xp: userData.xp,
        accuracy: userData.progress?.accuracy,
        streak: userData.current_streak,
        lessons: userData.lessons,
        total_lessons: userData.total_lessons,
      });

      const currentRank = getUserRank({
        level: userData.level || 1,
        accuracy: userData.progress?.accuracy || 0,
        streak: userData.current_streak || 0,
        lessonsCompleted: userData.total_lessons || userData.lessons || 0,
      });
      console.log("Current Rank:", currentRank);

      const nextRankProgress = getNextRankProgress({
        level: userData.level || 1,
        accuracy: userData.progress?.accuracy || 0,
        streak: userData.current_streak || 0,
        lessonsCompleted: userData.total_lessons || userData.lessons || 0,
      });
      console.log("Next Rank Requirements:", nextRankProgress);
      console.log("=== END DEBUG ===");
    }
  }, [userData]);

  useEffect(() => {
    // Listen for auth state, then set up Firestore listener
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const streakMetaRef = doc(db, `users/${user.uid}/meta`, "streak");

        const unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData({
              ...docSnap.data(),
            });
          }
          setLoading(false);
        });

        const unsubscribeStreak = onSnapshot(streakMetaRef, (snap) => {
          if (snap.exists()) {
            const streakData = snap.data();
            setCurrentStreak(streakData.streak || 0);
            setLongestStreak(streakData.longestStreak || 0);
          } else {
            setDoc(streakMetaRef, { streak: 0, lastActive: null });
          }
        });

        // Call updateStreak once per day
        updateStreak(user.uid);

        return () => {
          unsubscribeSnapshot();
          unsubscribeStreak();
        };
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;

    const notificationsRef = collection(
      db,
      `users/${auth.currentUser.uid}/notifications`
    );
    const q = query(notificationsRef, where("read", "==", false));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadNotificationCount(snapshot.size);
    });

    return unsubscribe;
  }, [userData]);

  if (loading) {
    return (
      <DashboardLayout>
        <NavBar />
        <div className="p-8 text-center flex items-center justify-center text-xl h-screen">
          Loading your data...
        </div>
      </DashboardLayout>
    );
  }

  if (!userData) {
    return (
      <DashboardLayout>
        <NavBar />
        <div className="p-8 text-center flex items-center justify-center text-xl h-screen">
          Please log in to view your dashboard.
        </div>
      </DashboardLayout>
    );
  }

  const totalLessons = userData?.totalLessons || 0;
  const completedLessons = userData?.completed_lessons?.length || 0;
  const progressPercent =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  // Add these test functions
  const simulateLevelUp = async (level) => {
    const userRef = doc(db, "users", auth.currentUser.uid);
    const targetXP = getLevel(userData?.xp || 0).xpRequired;

    await updateDoc(userRef, {
      level: level,
      xp: targetXP,
      rank: getLevel(level).rank,
    });

    setShowLevelUpModal(true);
  };

  const resetTestData = async () => {
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, {
      level: 1,
      xp: 0,
      current_streak: 0,
      title: "Beginner",
    });
    setShowLevelUpModal(false);
  };

  return (
    <DashboardLayout>
      <div className="hidden lg:block bg-gray-50">
        <div className="">
          <div className="flex gap-10 pt-4 items-center justify-end mr-9">
            <Link to="/notifications" className="relative">
              <FaBell className="text-3xl hover:translate-y-[-2px] transition-transform duration-500 cursor-pointer pt-1 text-amber" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotificationCount}
                </span>
              )}
            </Link>
            <div className="text-xl flex justify-center gap-2">
              <div className="flex items-center justify-center gap-2">
                <div>👩‍🦰</div>
                <div className="text-amber pt-1 font-semibold">
                  {userData?.username || "User"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Greeting Banner */}
      <div className="pt-28 md:pt-18 lg:10 bg-gray-50 py-0 px-4 lg:px-12 rounded-xl shadow-sm mb-10 animate-fade-in-up transition">
        <div className="md:flex items-center justify-between flex-wrap">
          <div className="flex items-center gap-6">
            <img
              src={avatar}
              alt="Avatar"
              className="w-16 h-16 rounded-full border-2 border-amber"
            />
            <div>
              <h1 className="text-4xl font-bold text-amber pt-2">
                Hi, {userData?.username || "Learner"}!
              </h1>
              <p className="text-amber py-1 text-lg">{userData.rank}</p>
            </div>
          </div>
          <Link to={"/lessons"}>
            <button className="bg-amber text-white py-3 px-8 rounded-lg shadow hover:scale-105 transition-transform my-4 lg:my-0">
              Start Lesson
            </button>
          </Link>
          
        </div>
      </div>

       <div>
            <button className=" text-amber text-2xl ">
              <Link to="/dashboard/ranking" className="p-3">
                View Ranks
              </Link>
            </button>
          </div>
      
      {/* Stats */}
      {userData && (
        <div className="grid md:grid-cols-3 md:grid-rows-2 gap-8 bg-gray-50 py-10 px-4 lg:px-12">
          {/* UPDATED XP Card with new progressive system */}
          <div className="bg-white p-6 flex justify-between rounded-2xl shadow items-center">
            <FaStar className="text-7xl text-amber" />
            <div>
              {/* CHANGED: Show formatted total XP */}
              <h1 className="text-3xl font-bold">
                {formatXP(progressData.xpProgress)}
              </h1>
              <p className="text-gray-500">Current XP</p>

              <div className="w-40 h-2 bg-gray-200 rounded mt-2 overflow-hidden">
                <div
                  className="h-2 bg-amber rounded transition-all duration-500"
                  style={{ width: `${progressData.progress}%` }}
                />
              </div>

             

              {/* CHANGED: Fixed XP calculation */}
              <p className="text-xs text-gray-400">
                {progressData.currentLevel >= 100 ? (
                  "Max level reached!"
                ) : (
                  <>
                    Level {progressData.currentLevel} •{" "}
                    {progressData.progress.toFixed(1)}%
                  </>
                )}
              </p>

              {/* ADDED: Detailed XP info */}
              <p className="text-xs text-gray-500 mt-1">
                {formatXP(progressData.xpProgress)} /{" "}
                {formatXP(progressData.xpNeeded)} XP to Level{" "}
                {progressData.currentLevel + 1}
              </p>
            </div>
          </div>

          {/* Streak Card */}
          <div className="bg-white p-6 rounded-2xl shadow flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-amber-100 p-3 rounded-full">
                <FaFire className="text-2xl text-amber" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Streak</h2>
                <p className="text-gray-500">Daily Progress</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-3xl font-bold text-amber">{currentStreak}</p>
                <p className="text-sm">Current</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{longestStreak}</p>
                <p className="text-sm">Longest</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">
                  {userData?.streak_freezes || 0}
                </p>
                <p className="text-sm">Freezes</p>
              </div>
            </div>
          </div>

          {/* Coins & Lives */}
          <div className="bg-white p-6 rounded-2xl shadow flex flex-col justify-between">
            <div className="flex items-center gap-4">
              <FaWallet className="text-3xl text-yellow-500" />
              <p className="text-lg font-bold">Coins: {userData?.coins}</p>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <FaHeart className="text-red-500 text-3xl" />
              <p className="text-lg font-bold">
                Lives: {userData?.lives}/{userData?.max_lives}
              </p>
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-2">Weekly Progress</h2>
            <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden mb-2">
              <div
                className="h-4 bg-yellow-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {completedLessons} / {totalLessons} lessons completed
            </p>
          </div>

          {/* Challenge Card */}
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center">
            <span className="text-4xl mb-2">⚡</span>
            <h1 className="text-2xl font-semibold text-center mb-4">
              Try today's Challenge
            </h1>
            <button className="w-full bg-amber py-2 text-white rounded-2xl shadow font-semibold hover:scale-105 transition-transform duration-200">
              Start Challenge
            </button>
          </div>

          {/* Explore More */}
          <div className="bg-amber pt-4 px-2 rounded-2xl flex flex-col justify-between text-white">
            <div>
              <h1 className="text-3xl font-semibold px-3">Explore More</h1>
              <p className="text-2xl font-semibold px-3">Lessons</p>
            </div>
            <Link to={"/lessons"}>
              <button className="bg-white text-amber mt-4 py-2 rounded-full w-full font-bold mb-5 hover:bg-gray-200">
                Go to Lessons
              </button>
            </Link>
          </div>
        </div>
      )}
      {/* Badges */}
      <div className="mt-8 transition-transform duration-300 hover:scale-105 px-4 lg:px-12">
        <Badge />
      </div>
      <div className="fixed bottom-0 left-0 w-full h-16 flex items-center text-amber justify-around bg-gray-100 lg:hidden">
        <Link to={"/lessons"} className="flex flex-col items-center pt-3">
          <FaHome className="text-2xl" />
          <p className="text-amber text-sm">Home</p>
        </Link>
        <Link to={"/leaderboard"} className="flex flex-col items-center pt-3">
          <FaChartBar className="text-2xl" />
          <p className="text-amber text-sm">Ranking</p>
        </Link>
        <Link to={"/dashboard"} className="flex flex-col items-center pt-3">
          <FaKeyboard className="text-2xl " />
          <p className="text-amber text-sm">Dashboard</p>
        </Link>
        <Link to={"/notifications"} className="flex flex-col items-center pt-3">
          <FaTree className="text-2xl" />
          <p className="text-amber text-sm">Feed</p>
        </Link>
        <Link to={"/profile"} className="flex flex-col items-center pt-3">
          <FaProcedures className="text-2xl" />
          <p className="text-amber text-sm">Profile</p>
        </Link>
      </div>
      {/* Developer Tools Button */}
      <button
        onClick={() => setShowDevTools(!showDevTools)}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-3 rounded-full shadow-lg z-50"
      >
        {showDevTools ? "❌" : "🧪"}
      </button>
      {/* Developer Tools Panel */}
      {showDevTools && (
        <div className="fixed bottom-24 right-4 bg-white p-4 rounded-lg shadow-xl border-2 border-red-500 z-50 max-w-sm w-80 overflow-y-auto max-h-96">
          <h3 className="font-bold text-lg mb-3 text-red-600">
            Developer Tools 🛠️
          </h3>

          {/* Quick Actions Section */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2 text-gray-700">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  updateDoc(doc(db, "users", auth.currentUser.uid), {
                    xp: increment(100),
                    coins: increment(50),
                  })
                }
                className="bg-blue-500 text-white px-2 py-2 rounded text-xs hover:bg-blue-600"
              >
                +100 XP +50 Coins
              </button>

              <button
                onClick={() =>
                  addNotification(auth.currentUser.uid, {
                    title: "Test Notification",
                    message: "This is only a test 🔔",
                    type: "test",
                  })
                }
                className="bg-purple-500 text-white px-2 py-2 rounded text-xs hover:bg-purple-600"
              >
                Test Notification
              </button>

              <button
                onClick={async () => {
                  const streakMetaRef = doc(
                    db,
                    `users/${auth.currentUser.uid}/meta`,
                    "streak"
                  );
                  const currentStreakSnap = await getDoc(streakMetaRef);
                  const currentStreak = currentStreakSnap.exists()
                    ? currentStreakSnap.data().streak || 0
                    : 0;

                  await setDoc(
                    streakMetaRef,
                    {
                      streak: currentStreak + 1,
                      lastActive: new Date(),
                    },
                    { merge: true }
                  );

                  await updateDoc(doc(db, "users", auth.currentUser.uid), {
                    current_streak: currentStreak + 1,
                  });
                  console.log("✅ Streak increased to:", currentStreak + 1);
                }}
                className="bg-green-500 text-white px-2 py-2 rounded text-xs hover:bg-green-600"
              >
                +1 Streak
              </button>

              <button
                onClick={resetTestData}
                className="bg-gray-500 text-white px-2 py-2 rounded text-xs hover:bg-gray-600"
              >
                Reset Data
              </button>
            </div>
          </div>

          {/* Rank Testing Section */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2 text-gray-700">
              Rank Testing 🏆
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={async () => {
                  await updateDoc(doc(db, "users", auth.currentUser.uid), {
                    level: 11,
                    current_streak: 5,
                    total_lessons: 15,
                    progress: { accuracy: 65 },
                    xp: 1500,
                  });
                  console.log("✅ Set Topaz requirements");
                }}
                className="bg-yellow-500 text-white px-2 py-2 rounded text-xs hover:bg-yellow-600"
              >
                Set Topaz
              </button>

              <button
                onClick={async () => {
                  await updateDoc(doc(db, "users", auth.currentUser.uid), {
                    level: 21,
                    current_streak: 7,
                    total_lessons: 25,
                    progress: { accuracy: 70 },
                    xp: 3000,
                  });
                  console.log("✅ Set Amethyst requirements");
                }}
                className="bg-purple-500 text-white px-2 py-2 rounded text-xs hover:bg-purple-600"
              >
                Set Amethyst
              </button>

              <button
                onClick={async () => {
                  await updateDoc(doc(db, "users", auth.currentUser.uid), {
                    level: 31,
                    current_streak: 10,
                    total_lessons: 35,
                    progress: { accuracy: 75 },
                    xp: 5000,
                  });
                  console.log("✅ Set Emerald requirements");
                }}
                className="bg-green-600 text-white px-2 py-2 rounded text-xs hover:bg-green-700"
              >
                Set Emerald
              </button>

              <button
                onClick={async () => {
                  await updateDoc(doc(db, "users", auth.currentUser.uid), {
                    level: 11,
                    current_streak: 5,
                    total_lessons: 15,
                    progress: { accuracy: 65 },
                    xp: 1500,
                    rank: "Moonstone",
                  });
                  console.log("🎯 Ready for Topaz rank up!");
                }}
                className="bg-red-500 text-white px-2 py-2 rounded text-xs hover:bg-red-600"
              >
                Force Rank Up
              </button>

              <button
                onClick={async () => {
                  await updateDoc(doc(db, "users", auth.currentUser.uid), {
                    level: 1,
                    current_streak: 0,
                    total_lessons: 0,
                    progress: { accuracy: 0 },
                    xp: 0,
                    rank: "Moonstone",
                  });
                  console.log("🔄 Reset to Moonstone");
                }}
                className="bg-gray-500 text-white px-2 py-2 rounded text-xs hover:bg-gray-600 col-span-2"
              >
                Reset to Moonstone
              </button>
            </div>
          </div>

          {/* Current Status Section */}
          <div className="mb-4 p-3 bg-gray-50 rounded border">
            <h4 className="font-semibold mb-2 text-gray-700">
              Current Status 📊
            </h4>
            <button
              onClick={() => {
                if (userData) {
                  const currentRank = getUserRank({
                    level: userData.level || 1,
                    accuracy: userData.progress?.accuracy || 0,
                    streak: userData.current_streak || 0,
                    lessonsCompleted: userData.total_lessons || 0,
                  });
                  const status = `
  Current Rank: ${currentRank.name}
  Level: ${userData.level || 1}
  XP: ${userData.xp || 0}
  Streak: ${userData.current_streak || 0}
  Lessons: ${userData.total_lessons || 0}
  Accuracy: ${userData.progress?.accuracy || 0}%
  Coins: ${userData.coins || 0}
                  `;
                  console.log("📊 Current Status:", status);
                  alert(status);
                } else {
                  alert("No user data available");
                }
              }}
              className="bg-blue-500 text-white px-3 py-2 rounded text-xs w-full hover:bg-blue-600"
            >
              Check Current Status
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            🚀 Test all rank levels instantly!
          </p>
        </div>
      )}
      {/* Level Up Modal */}
      {showLevelUpModal && (
        <LevelUpModal
          level={currentLevel}
          onClose={() => setShowLevelUpModal(false)}
        />
      )}
      {/* Badge Earned Modal */}
      {showBadgeModal && newlyEarnedBadge && (
        <BadgeEarnedModal
          badge={newlyEarnedBadge}
          isOpen={showBadgeModal}
          onClose={() => setShowBadgeModal(false)}
        />
      )}
      {/* Achievement Earned Modal */}
      {showAchievementModal && newlyEarnedAchievement && (
        <AchievementEarnedModal
          achievement={newlyEarnedAchievement}
          isOpen={showAchievementModal}
          onClose={() => setShowAchievementModal(false)}
        />
      )}
      {/* Rank Up Screen */}
      {showRankUpScreen && rankUpData && (
        <RankUpScreen
          isOpen={showRankUpScreen}
          onClose={() => setShowRankUpScreen(false)}
          rankData={rankUpData}
        />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
