import { useState, useEffect, useRef } from "react";

import DashboardLayout from "../components/dashboard/DashboardLayout";

import Badge from "../components/dashboard/Badges";

import {
  checkForNewAchievements,
  awardAchievement,
} from "../utils/achievements";
import AchievementEarnedModal from "../components/dashboard/BadgeEarnedModal";

import NavBar from "../components/dashboard/NavBar";
import { checkForNewBadges, awardBadge } from "../utils/badges";
import { LevelUpModal } from "../components/LevelUpModal";
import BadgeEarnedModal from "../components/dashboard/BadgeEarnedModal";
import { getUserRank } from "../utils/rankSystem";
import { RankUpScreen } from "../components/RankUpScreen";
import { addNotification } from "../firebase/utils/notifications";
import {
  getLevelProgress,
  getLevel,
  LEVELS,
  getRankUpData,
  // Import LEVELS for developer tools
} from "../utils/progression";
import { updateStreak } from "../utils/streak"; // Import updateStreak
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

import { Link } from "react-router-dom";

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
  setDoc, // Added setDoc
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
  // Add to your Dashboard states
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [newlyEarnedBadge, setNewlyEarnedBadge] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(0); // New state for current streak
  const [longestStreak, setLongestStreak] = useState(0); // New state for longest streak
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0); // New state for unread notifications
  // Refactored level progress calculation using progression utility
  const { currentLevel, progress } = getLevelProgress(userData?.xp || 0);
  // Get real rank using rank system
  const realRank = userData
    ? getUserRank({
        level: userData.level,
        accuracy: userData.progress?.accuracy || 0,
        streak: userData.current_streak || 0,
        lessons: userData.lessons || 0,
      })
    : "Moonstone";

  useEffect(() => {
    if (!userData) return;

    // Prevent re-running if we already processed this data
    if (lastComputedRef.current?.xp === userData.xp) return;

    const userCurrentLevel = userData.level;
    const userCurrentXP = userData.xp;

    const updatedUserLevelInfo = getLevel(userCurrentXP);

    // Check for level up
    if (updatedUserLevelInfo.level > userCurrentLevel) {
      setShowLevelUpModal(true);

      addNotification(auth.currentUser.uid, {
        type: "level-up",
        message: `You reached Level ${updatedUserLevelInfo.level}! 🎉`,
        level: updatedUserLevelInfo.level,
      });

      // Update user document - this will trigger userData change
      updateDoc(doc(db, "users", auth.currentUser.uid), {
        level: updatedUserLevelInfo.level,
        rank: updatedUserLevelInfo.rank,
      });
    }

    // Check for rank up - only if XP changed significantly
    const rankChange = getRankUpData(
      lastComputedRef.current?.xp || 0,
      userCurrentXP
    );

    if (rankChange.leveledUp && rankChange.newRank !== userData.rank) {
      setRankUpData({
        ...rankChange,
        userXp: userCurrentXP,
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
        level: rankChange.level,
      });
    }

    // Update last computed snapshot to prevent re-processing
    lastComputedRef.current = {
      level: updatedUserLevelInfo.level,
      rank: updatedUserLevelInfo.rank,
      xp: userCurrentXP,
    };
  }, [userData]); // Keep the dependency, but add guards

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

  // UNCOMMENT THIS and replace with the updated version:
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

  // Add this useEffect to your Dashboard component
  // In your Dashboard, UNCOMMENT and modify the badge useEffect:
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
            setLongestStreak(streakData.longestStreak || 0); // Assuming longestStreak is stored here
          } else {
            // Initialize streak if it doesn't exist
            setDoc(streakMetaRef, { streak: 0, lastActive: null });
          }
        });

        // Call updateStreak once per day
        updateStreak(user.uid); // This handles the daily logic

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
  }, []); // Empty dependency array to run once on mount

  // New useEffect to listen for unread notifications
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

    // Determine the XP required for the target level
    const targetXP = getLevel(userData?.xp || 0).xpRequired;

    await updateDoc(userRef, {
      level: level,

      xp: targetXP,
      rank: getLevel(level).rank,
      // current_streak: nextLevel.streak_required, // Streak requirement removed from level up
      // title: nextLevel.title,
    });

    setShowLevelUpModal(true);
  };

  const resetTestData = async () => {
    const userRef = doc(db, "users", auth.currentUser.uid);

    await updateDoc(userRef, {
      level: 1,

      xp: 0,

      current_streak: 0,

      title: "Beginner", // Updated title to match new rank system
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
                  {userData?.username}
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

              <p className="text-amber py-1 text-lg">{realRank}</p>
            </div>
          </div>

          <Link to={"/lessons"}>
            <button className="bg-amber text-white py-3 px-8 rounded-lg shadow hover:scale-105 transition-transform my-4 lg:my-0">
              Start Lesson
            </button>
          </Link>
        </div>
      </div>

      {/* Stats */}

      {userData && (
        <div className="grid md:grid-cols-3 md:grid-rows-2 gap-8 bg-gray-50 py-10 px-4 lg:px-12">
          {/* Updated XP Card with dynamic progress */}

          <div className="bg-white p-6 flex justify-between rounded-2xl shadow items-center">
            <FaStar className="text-7xl text-amber" />

            <div>
              <h1 className="text-3xl font-bold">{userData?.xp}</h1>

              <p className="text-gray-500">Current XP</p>

              <div className="w-40 h-2 bg-gray-200 rounded mt-2 overflow-hidden">
                <div
                  className="h-2 bg-amber rounded"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-xs text-gray-400">
                {currentLevel >= LEVELS[LEVELS.length - 1].level ? (
                  "Max level reached!"
                ) : (
                  <>
                    {userData?.xp - getLevel(userData?.xp || 0).xpRequired}/
                    {getLevel(userData?.xp || 0).xpRequired -
                      getLevel(userData?.xp || 0).xpRequired}{" "}
                    XP to Level {currentLevel + 1}
                  </>
                )}
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
        <div className="fixed bottom-20 right-4 bg-white p-4 rounded-lg shadow-xl border-2 border-red-500 z-50 max-w-xs">
          <h3 className="font-bold text-lg mb-2 text-red-600">
            Developer Tools
          </h3>

          {/* <div className="mb-4">
            <h4 className="font-semibold mb-1">Test Level Up</h4>

            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map((levelInfo, index) => (
                <button
                  key={index + 1}
                  onClick={() => simulateLevelUp(index + 1)}
                  className={`py-1 px-2 rounded text-xs bg-gray-200`}
                >
                  Level {index + 1}
                </button>
              ))}
            </div>
          </div> */}

          <div className="mb-4">
            <h4 className="font-semibold mb-1">Quick Actions</h4>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() =>
                  updateDoc(doc(db, "users", auth.currentUser.uid), {
                    xp: increment(100),

                    coins: increment(50),
                  })
                }
                className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
              >
                +100 XP +50 Coins
              </button>
              // Add to your Developer Tools panel in Dashboard
              <div className="mb-4">
                <h4 className="font-semibold mb-1">Test Badges</h4>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      // Test First Lesson badge
                      awardBadge(auth.currentUser.uid, "first_lesson").then(
                        (success) => {
                          if (success) {
                            console.log("✅ First lesson badge awarded");
                            // Manually trigger the modal
                            setNewlyEarnedBadge(BADGES.first_lesson);
                            setShowBadgeModal(true);
                          }
                        }
                      );
                    }}
                    className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                  >
                    First Lesson Badge
                  </button>

                  <button
                    onClick={() => {
                      awardBadge(auth.currentUser.uid, "streak_master_7").then(
                        (success) => {
                          if (success) {
                            console.log("✅ Weekly Warrior badge awarded");
                            setNewlyEarnedBadge(BADGES.streak_master_7);
                            setShowBadgeModal(true);
                          }
                        }
                      );
                    }}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Weekly Warrior
                  </button>

                  <button
                    onClick={() => {
                      // Test Perfectionist badge
                      awardBadge(auth.currentUser.uid, "perfectionist").then(
                        (success) => {
                          if (success) {
                            console.log("✅ Perfectionist badge awarded");
                            setNewlyEarnedBadge(BADGES.perfectionist);
                            setShowBadgeModal(true);
                          }
                        }
                      );
                    }}
                    className="bg-purple-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Perfectionist
                  </button>
                </div>
              </div>
              <button
                onClick={() =>
                  addNotification(auth.currentUser.uid, {
                    title: "Test Notification",
                    message: "This is only a test 🔔",
                    type: "test",
                  })
                }
                className="bg-purple-500 text-white px-2 py-1 rounded text-xs"
              >
                Send Test Notification
              </button>
              <button
                onClick={async () => {
                  await updateStreak(auth.currentUser.uid);
                }}
                className="bg-green-500 text-white px-2 py-1 rounded text-xs"
              >
                +1 Streak
              </button>
              <button
                onClick={resetTestData}
                className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
              >
                Reset Data
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            These controls are for testing only
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

      {/* ✅ ADD BADGE EARNED MODAL HERE */}
      {showBadgeModal && newlyEarnedBadge && (
        <BadgeEarnedModal
          badge={newlyEarnedBadge}
          isOpen={showBadgeModal}
          onClose={() => setShowBadgeModal(false)}
        />
      )}

      {/* Add with other modals in Dashboard return statement */}
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
