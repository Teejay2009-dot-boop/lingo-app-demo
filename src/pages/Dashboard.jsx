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
import { getRankUpData, getNextRankProgress } from "../data/RankSystem";
import { getLevelProgress, getLevel } from "../utils/progression";
import {
  FaStar,
  FaHeart,
  FaWallet,
  FaBell,
  FaFire,
  FaChartBar,
  FaProcedures,
  FaKeyboard,
  FaTree,
  FaHome,
  FaClock,
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
  getDoc,
} from "firebase/firestore";

// FIXED: Regenerate 1 life per hour, NO stored lives
const checkLivesRegeneration = async (uid) => {
  if (!uid) return;

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const userData = userSnap.data();
  const currentLives = userData.lives || 0;
  const maxLives = userData.max_lives || 5;

  // If lives are already full, do nothing
  if (currentLives >= maxLives) return { currentLives, updated: false };

  const lastLifeUpdate = userData.last_life_update?.toDate();
  const now = new Date();

  // If no last update time, set it to now and return
  if (!lastLifeUpdate) {
    await updateDoc(userRef, {
      last_life_update: now,
    });
    return { currentLives, updated: false };
  }

  // Calculate time passed since last update
  const msSinceLastUpdate = now.getTime() - lastLifeUpdate.getTime();
  const hoursSinceLastUpdate = msSinceLastUpdate / (1000 * 60 * 60);

  // If at least 1 hour has passed, add one life
  if (hoursSinceLastUpdate >= 1) {
    const newLives = Math.min(currentLives + 1, maxLives);

    // Calculate the exact time for the next regeneration
    // This ensures we don't accumulate multiple lives at once
    const hoursToAdd = Math.floor(hoursSinceLastUpdate);
    const nextUpdateTime = new Date(
      lastLifeUpdate.getTime() + hoursToAdd * 60 * 60 * 1000
    );

    await updateDoc(userRef, {
      lives: newLives,
      last_life_update: nextUpdateTime,
    });

    // Only send notification if a life was actually added
    if (newLives > currentLives) {
      addNotification(uid, {
        type: "life-regenerated",
        title: "Life Regenerated!",
        message: `You gained 1 life back!`,
        timestamp: new Date(),
      });
    }

    return {
      currentLives: newLives,
      updated: newLives > currentLives,
    };
  }

  return { currentLives, updated: false };
};

// FIXED: Show time to next life (only if not full)
const getTimeUntilNextLife = (lastLifeUpdate, currentLives, maxLives = 5) => {
  if (currentLives >= maxLives) return "Full";
  if (!lastLifeUpdate) return "01:00:00";

  const lastUpdate = lastLifeUpdate.toDate();
  const now = new Date();
  const msPassed = now.getTime() - lastUpdate.getTime();
  const msPerHour = 60 * 60 * 1000;
  const msRemaining = msPerHour - (msPassed % msPerHour);

  if (msRemaining <= 0) return "Ready!";

  const hours = Math.floor(msRemaining / msPerHour);
  const minutes = Math.floor((msRemaining % msPerHour) / (60 * 1000));
  const seconds = Math.floor((msRemaining % (60 * 1000)) / 1000);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

// FIXED: Consume life and reset timer
export const consumeLife = async (uid) => {
  if (!uid) return false;

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return false;

  const userData = userSnap.data(); // FIXED: Changed from userDataSnap to userSnap
  const currentLives = userData.lives || 0;

  if (currentLives <= 0) return false;

  await updateDoc(userRef, {
    lives: increment(-1),
    last_life_update: new Date(), // Reset timer when life is lost
  });

  return true;
};

// Initialize lives for new users
export const initializeUserLives = async (uid) => {
  if (!uid) return;

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data();
    if (userData.lives === undefined || userData.max_lives === undefined) {
      await updateDoc(userRef, {
        lives: 5,
        max_lives: 5,
        last_life_update: new Date(),
      });
    }
  }
};

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
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [timeUntilNextLife, setTimeUntilNextLife] = useState("01:00:00");
  const livesCheckIntervalRef = useRef(null);

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

  // FIXED: Combined achievement and badge checking to reduce state updates
  const checkAchievementsAndBadges = useRef(async (userData, uid) => {
    if (!userData || !uid) return;

    // Check achievements
    const newAchievements = checkForNewAchievements(userData);
    if (newAchievements.length > 0) {
      for (const [index, achievement] of newAchievements.entries()) {
        const success = await awardAchievement(uid, achievement.id);
        if (success) {
          if (index === 0) {
            setNewlyEarnedAchievement(achievement);
            setShowAchievementModal(true);
          }

          addNotification(uid, {
            type: "achievement",
            title: "Achievement Unlocked!",
            message: `You earned "${achievement.name}"!`,
            achievementId: achievement.id,
            timestamp: new Date(),
          });
        }
      }
    }

    // Check badges
    const newBadges = checkForNewBadges(userData);
    if (newBadges.length > 0) {
      for (const [index, badge] of newBadges.entries()) {
        const success = await awardBadge(uid, badge.id);
        if (success) {
          if (index === 0) {
            setNewlyEarnedBadge(badge);
            setShowBadgeModal(true);
          }

          addNotification(uid, {
            type: "badge",
            title: "Badge Earned!",
            message: `You unlocked the "${badge.name}" badge!`,
            badgeId: badge.id,
            timestamp: new Date(),
          });
        }
      }
    }
  });

  // FIXED: Combined level, rank, and achievement detection
  useEffect(() => {
    if (!userData || !auth.currentUser) return;

    if (lastComputedRef.current?.xp === userData.xp) return;

    const userCurrentLevel = userData.level || 1;
    const userCurrentXP = userData.xp || 0;
    const updatedUserLevelInfo = getLevelProgress(userCurrentXP);

    if (updatedUserLevelInfo.currentLevel > userCurrentLevel) {
      setShowLevelUpModal(true);

      addNotification(auth.currentUser.uid, {
        type: "level-up",
        message: `You reached Level ${updatedUserLevelInfo.currentLevel}!`,
        level: updatedUserLevelInfo.currentLevel,
      });

      updateDoc(doc(db, "users", auth.currentUser.uid), {
        level: updatedUserLevelInfo.currentLevel,
      });
    }

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
        message: `You've been promoted to ${rankChange.newRank}!`,
        rank: rankChange.newRank,
      });

      updateDoc(doc(db, "users", auth.currentUser.uid), {
        rank: rankChange.newRank,
      });
    }

    checkAchievementsAndBadges.current(userData, auth.currentUser.uid);

    lastComputedRef.current = {
      level: updatedUserLevelInfo.currentLevel,
      xp: userCurrentXP,
      userData: { ...currentUserData },
    };
  }, [userData]);

  // FIXED: Lives regeneration - only check when lives are not full
  useEffect(() => {
    if (!auth.currentUser || !userData) return;

    const currentLives = userData.lives || 0;
    const maxLives = userData.max_lives || 5;

    // Only check regeneration if lives are not full
    if (currentLives >= maxLives) return;

    let mounted = true;

    const checkLives = async () => {
      if (!mounted) return;
      await checkLivesRegeneration(auth.currentUser.uid);
    };

    // Check immediately
    checkLives();

    // Check every 30 seconds if lives are not full
    const interval = setInterval(checkLives, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [userData?.lives, userData?.max_lives, userData?.last_life_update]);

  // FIXED: Update timer every second
  useEffect(() => {
    if (!userData) return;

    let mounted = true;

    const updateTimer = () => {
      if (!mounted) return;
      const time = getTimeUntilNextLife(
        userData.last_life_update,
        userData.lives || 0,
        userData.max_lives || 5
      );
      setTimeUntilNextLife(time);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [userData?.last_life_update, userData?.lives, userData?.max_lives]);

  // Single Firestore listener
  useEffect(() => {
    let unsubscribeSnapshot = null;
    let mounted = true;

    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!mounted) return;

      if (user) {
        await initializeUserLives(user.uid);
        const userRef = doc(db, "users", user.uid);

        unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
          if (!mounted) return;
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
          setLoading(false);
        });
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  // Notifications listener
  useEffect(() => {
    if (!auth.currentUser) return;

    let mounted = true;
    const notificationsRef = collection(
      db,
      `users/${auth.currentUser.uid}/notifications`
    );
    const q = query(notificationsRef, where("read", "==", false));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!mounted) return;
      setUnreadNotificationCount(snapshot.size);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Test functions
  const testConsumeLife = async () => {
    const success = await consumeLife(auth.currentUser.uid);
    console.log(success ? "Life consumed successfully" : "No lives available");
  };

  const initializeLivesSystem = async () => {
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      lives: 5,
      max_lives: 5,
      last_life_update: new Date(),
    });
    console.log("Lives system initialized");
  };

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

  return (
    <DashboardLayout>
      <div className="hidden lg:block bg-gray-50">
        <div className="">
          <div className="flex gap-10 pt-4 items-center justify-end mr-9">
            <Link to="/notifications" className="relative">
              <FaBell className="text-3xl hover:translate-y-[-2px] transition-transform duration-500 cursor-pointer pt-1 text-yellow-500" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotificationCount}
                </span>
              )}
            </Link>
            <div className="text-xl flex justify-center gap-2">
              <div className="flex items-center justify-center gap-2">
                <div>USER</div>
                <div className="text-yellow-500 pt-1 font-semibold">
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
              className="w-16 h-16 rounded-full border-2 border-yellow-500"
            />
            <div>
              <h1 className="text-4xl font-bold text-yellow-500 pt-2">
                Hi, {userData?.username || "Learner"}!
              </h1>
              <p className="text-yellow-500 py-1 text-lg">{userData.rank}</p>
            </div>
          </div>
          <Link to={"/lessons"}>
            <button className="bg-yellow-500 text-white py-3 px-8 rounded-lg shadow hover:scale-105 transition-transform my-4 lg:my-0">
              Start Lesson
            </button>
          </Link>
        </div>
      </div>

      <div>
        <button className=" text-yellow-500 text-2xl ">
          <Link to="/dashboard/ranking" className="p-3">
            View Ranks
          </Link>
        </button>
      </div>

      {/* Stats */}
      {userData && (
        <div className="grid md:grid-cols-3 md:grid-rows-2 gap-8 bg-gray-50 py-10 px-4 lg:px-12">
          {/* XP Card */}
          <div className="bg-white p-6 flex justify-between rounded-2xl shadow items-center">
            <FaStar className="text-7xl text-yellow-500" />
            <div>
              <h1 className="text-3xl font-bold">
                {formatXP(progressData.xpProgress)}
              </h1>
              <p className="text-gray-500">Current XP</p>

              <div className="w-40 h-2 bg-gray-200 rounded mt-2 overflow-hidden">
                <div
                  className="h-2 bg-yellow-500 rounded transition-all duration-500"
                  style={{ width: `${progressData.progress}%` }}
                />
              </div>

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
              <div className="bg-yellow-100 p-3 rounded-full">
                <FaFire className="text-2xl text-yellow-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Streak</h2>
                <p className="text-gray-500">Daily Progress</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-500">
                  {userData.current_streak || 0}
                </p>
                <p className="text-sm">Current</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">
                  {userData.longest_streak || 0}
                </p>
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
              <p className="text-lg font-bold">Coins: {userData?.coins || 0}</p>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <FaHeart className="text-red-500 text-3xl" />
              <div>
                <p className="text-lg font-bold">
                  Lives: {userData?.lives || 0}/{userData?.max_lives || 5}
                </p>
                {(userData?.lives || 0) < (userData?.max_lives || 5) && (
                  <div className="flex items-center gap-1">
                    <FaClock className="text-xs text-gray-500" />
                    <p className="text-xs text-gray-500">
                      Next life: {timeUntilNextLife}
                    </p>
                  </div>
                )}
                {(userData?.lives || 0) >= (userData?.max_lives || 5) && (
                  <p className="text-xs text-green-500">Full lives!</p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              1 life per hour • Countdown starts when life is lost
            </p>
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
            <span className="text-4xl mb-2">LIGHTNING</span>
            <h1 className="text-2xl font-semibold text-center mb-4">
              Try today's Challenge
            </h1>
            <button className="w-full bg-yellow-500 py-2 text-white rounded-2xl shadow font-semibold hover:scale-105 transition-transform duration-200">
              Start Challenge
            </button>
          </div>

          {/* Explore More */}
          <div className="bg-yellow-500 pt-4 px-2 rounded-2xl flex flex-col justify-between text-white">
            <div>
              <h1 className="text-3xl font-semibold px-3">Explore More</h1>
              <p className="text-2xl font-semibold px-3">Lessons</p>
            </div>
            <Link to={"/lessons"}>
              <button className="bg-white text-yellow-500 mt-4 py-2 rounded-full w-full font-bold mb-5 hover:bg-gray-200">
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

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 w-full h-16 flex items-center text-yellow-500 justify-around bg-gray-100 lg:hidden">
        <Link to={"/lessons"} className="flex flex-col items-center pt-3">
          <FaHome className="text-2xl" />
          <p className="text-yellow-500 text-sm">Home</p>
        </Link>
        <Link to={"/leaderboard"} className="flex flex-col items-center pt-3">
          <FaChartBar className="text-2xl" />
          <p className="text-yellow-500 text-sm">Ranking</p>
        </Link>
        <Link to={"/dashboard"} className="flex flex-col items-center pt-3">
          <FaKeyboard className="text-2xl " />
          <p className="text-yellow-500 text-sm">Dashboard</p>
        </Link>
        <Link to={"/notifications"} className="flex flex-col items-center pt-3">
          <FaTree className="text-2xl" />
          <p className="text-yellow-500 text-sm">Feed</p>
        </Link>
        <Link to={"/profile"} className="flex flex-col items-center pt-3">
          <FaProcedures className="text-2xl" />
          <p className="text-yellow-500 text-sm">Profile</p>
        </Link>
      </div>

      {/* Developer Tools Button */}
      <button
        onClick={() => setShowDevTools(!showDevTools)}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-3 rounded-full shadow-lg z-50"
      >
        {showDevTools ? "X" : "DEV"}
      </button>

      {/* Developer Tools Panel */}
      {showDevTools && (
        <div className="fixed bottom-24 right-4 bg-white p-4 rounded-lg shadow-xl border-2 border-red-500 z-50 max-w-sm w-80 overflow-y-auto max-h-96">
          <h3 className="font-bold text-lg mb-3 text-red-600">
            Developer Tools
          </h3>

          {/* Quick Actions */}
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
                    message: "This is only a test",
                    type: "test",
                  })
                }
                className="bg-purple-500 text-white px-2 py-2 rounded text-xs hover:bg-purple-600"
              >
                Test Notification
              </button>

              <button
                onClick={async () => {
                  const userRef = doc(db, "users", auth.currentUser.uid);
                  const currentStreak = userData?.current_streak || 0;
                  await updateDoc(userRef, {
                    current_streak: currentStreak + 1,
                  });
                }}
                className="bg-green-500 text-white px-2 py-2 rounded text-xs hover:bg-green-600"
              >
                +1 Streak
              </button>

              <button
                onClick={testConsumeLife}
                className="bg-red-500 text-white px-2 py-2 rounded text-xs hover:bg-red-600"
              >
                -1 Life
              </button>

              <button
                onClick={initializeLivesSystem}
                className="bg-pink-500 text-white px-2 py-2 rounded text-xs hover:bg-pink-600"
              >
                Init Lives System
              </button>

              <button
                onClick={async () => {
                  const userRef = doc(db, "users", auth.currentUser.uid);
                  await updateDoc(userRef, {
                    level: 1,
                    xp: 0,
                    current_streak: 0,
                    title: "Beginner",
                  });
                  setShowLevelUpModal(false);
                }}
                className="bg-gray-500 text-white px-2 py-2 rounded text-xs hover:bg-gray-600"
              >
                Reset Data
              </button>
            </div>
          </div>

          {/* Lives System Testing */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2 text-gray-700">
              Lives System Testing
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={async () => {
                  await updateDoc(doc(db, "users", auth.currentUser.uid), {
                    lives: 3,
                    last_life_update: new Date(),
                  });
                }}
                className="bg-orange-500 text-white px-2 py-2 rounded text-xs hover:bg-orange-600"
              >
                Set 3 Lives
              </button>

              <button
                onClick={async () => {
                  await updateDoc(doc(db, "users", auth.currentUser.uid), {
                    lives: 5,
                  });
                }}
                className="bg-green-500 text-white px-2 py-2 rounded text-xs hover:bg-green-600"
              >
                Set Full Lives
              </button>

              <button
                onClick={async () => {
                  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
                  await updateDoc(doc(db, "users", auth.currentUser.uid), {
                    last_life_update: oneHourAgo,
                    lives: 3,
                  });
                }}
                className="bg-blue-500 text-white px-2 py-2 rounded text-xs hover:bg-blue-600"
              >
                Simulate 1h Passed
              </button>

              <button
                onClick={async () => {
                  await updateDoc(doc(db, "users", auth.currentUser.uid), {
                    last_life_update: new Date(),
                  });
                }}
                className="bg-purple-500 text-white px-2 py-2 rounded text-xs hover:bg-purple-600"
              >
                Reset Timer
              </button>
            </div>
          </div>

          {/* Rank Testing */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2 text-gray-700">Rank Testing</h4>
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
                }}
                className="bg-gray-500 text-white px-2 py-2 rounded text-xs hover:bg-gray-600 col-span-2"
              >
                Reset to Moonstone
              </button>
            </div>
          </div>

          {/* Current Status */}
          <div className="mb-4 p-3 bg-gray-50 rounded border">
            <h4 className="font-semibold mb-2 text-gray-700">Current Status</h4>
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
  Lives: ${userData.lives || 0}/${userData.max_lives || 5}
  Next Life: ${timeUntilNextLife}
  Last Update: ${
    userData.last_life_update
      ? userData.last_life_update.toDate().toLocaleTimeString()
      : "Never"
  }
                  `;
                  alert(status.trim());
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
            Test all rank levels instantly!
          </p>
        </div>
      )}

      {/* Modals */}
      {showLevelUpModal && (
        <LevelUpModal
          level={getLevelProgress(userData?.xp || 0).currentLevel}
          onClose={() => setShowLevelUpModal(false)}
        />
      )}
      {showBadgeModal && newlyEarnedBadge && (
        <BadgeEarnedModal
          badge={newlyEarnedBadge}
          isOpen={showBadgeModal}
          onClose={() => setShowBadgeModal(false)}
        />
      )}
      {showAchievementModal && newlyEarnedAchievement && (
        <AchievementEarnedModal
          achievement={newlyEarnedAchievement}
          isOpen={showAchievementModal}
          onClose={() => setShowAchievementModal(false)}
        />
      )}
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
