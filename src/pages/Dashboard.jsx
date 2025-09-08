import { useState, useEffect } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import Badge from "../components/dashboard/Badges";
import NavBar from "../components/dashboard/NavBar";
import { LevelUpModal } from "../components/LevelUpModal";
import { RankUpScreen } from "../components/RankUpScreen";
import { useNavigate } from "react-router-dom";
import { addNotification } from "../firebase/utils/notifications";
import {
  FaStar,
  FaSteam,
  FaHeart,
  FaWallet,
  FaBell,
  FaFire,
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
} from "firebase/firestore";
import {
  xpTable,
  getNextXP,
  getRank,
  updateUserProgress,
} from "../data/defaultUser";

const Dashboard = () => {
  const [width, setWidth] = useState(window.innerWidth);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDevTools, setShowDevTools] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [showRankUpScreen, setShowRankUpScreen] = useState(false);
  const [testLevel, setTestLevel] = useState(1);
  const [testRank, setTestRank] = useState("Beginner");
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0); // New state for unread notifications
  const navigate = useNavigate();

  // Calculate level progress based on XP
  const getLevelProgress = (xp) => {
    const currentLevel = userData?.level || 1;
    const currentLevelXPThreshold = xpTable[currentLevel - 1] || 0;
    const nextLevelXPThreshold =
      xpTable[currentLevel] || xpTable[xpTable.length - 1];

    const isMaxLevel = currentLevel >= xpTable.length;

    if (isMaxLevel) {
      return {
        currentLevel,
        nextLevel: null,
        xpTowardsNextLevel: 0,
        xpNeededForNextLevel: 0,
        progressPercentage: 100,
        isMaxLevel: true,
      };
    }

    const xpNeededForNextLevel = nextLevelXPThreshold - currentLevelXPThreshold;
    const xpTowardsNextLevel = xp - currentLevelXPThreshold;
    const progressPercentage = Math.min(
      100,
      (xpTowardsNextLevel / xpNeededForNextLevel) * 100
    );

    return {
      currentLevel,
      nextLevel: { level: currentLevel + 1, name: `Level ${currentLevel + 1}` }, // Simplified nextLevel for display
      xpTowardsNextLevel,
      xpNeededForNextLevel,
      progressPercentage,
      isMaxLevel: false,
    };
  };

  const levelProgress = getLevelProgress(userData?.xp || 0);

  useEffect(() => {
    if (!userData) return;

    // Check if user has leveled up based on new logic
    const userCurrentLevel = userData.level;
    const userCurrentRank = userData.rank; // Get current rank
    const userCurrentXP = userData.xp;

    const updatedUser = updateUserProgress({
      ...userData,
      xp: userCurrentXP,
      level: userCurrentLevel,
    });

    if (updatedUser.level > userCurrentLevel) {
      // Level up! Push notification to Firestore
      setTestLevel(updatedUser.level);
      setShowLevelUpModal(true);
      addNotification(auth.currentUser.uid, {
        type: "level-up",
        message: `You reached Level ${updatedUser.level}! 🎉`,
        level: updatedUser.level,
      });
    }

    if (updatedUser.rank !== userCurrentRank) {
      // Rank up! Push notification to Firestore
      setTestRank(updatedUser.rank);
      setShowRankUpScreen(true);
      addNotification(auth.currentUser.uid, {
        type: "rank-up",
        message: `You’ve been promoted to ${updatedUser.rank}! 🏆`,
        rank: updatedUser.rank,
      });
    }

    // Only update Firestore if there's a change in level or rank
    if (
      updatedUser.level !== userCurrentLevel ||
      updatedUser.rank !== userCurrentRank
    ) {
      updateDoc(doc(db, "users", auth.currentUser.uid), {
        level: updatedUser.level,
        rank: updatedUser.rank,
      });
    }
  }, [userData]);

  useEffect(() => {
    // Track screen resize
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    // Listen for auth state, then set up Firestore listener
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData({
              ...docSnap.data(),
              current_streak: docSnap.data().current_streak || 0,
              longest_streak: docSnap.data().longest_streak || 0,
            });
          }
          setLoading(false);
        });
        return unsubscribeSnapshot;
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      unsubscribeAuth();
    };
  }, []);

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
    const targetXP = xpTable[level - 1] || 0;

    await updateDoc(userRef, {
      level: level,
      xp: targetXP,
      rank: getRank(level),
      // current_streak: nextLevel.streak_required, // Streak requirement removed from level up
      // title: nextLevel.title,
    });

    setTestLevel(level);
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
              <p className="text-amber py-1 text-lg">{userData?.rank}</p>
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
                style={{ width: `${levelProgress.progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">
              {levelProgress.isMaxLevel ? (
                "Max level reached!"
              ) : (
                <>
                  {levelProgress.xpTowardsNextLevel}/
                  {levelProgress.xpNeededForNextLevel} XP to{" "}
                  {levelProgress.nextLevel.name}
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
              <p className="text-3xl font-bold text-amber">
                {userData?.current_streak || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">
                {userData?.longest_streak || 0}
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
              className="bg-yellow-500 h-4 transition-all duration-500"
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

      {/* Badges */}
      <div className="mt-8 transition-transform duration-300 hover:scale-105 px-4 lg:px-12">
        <Badge />
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

          <div className="mb-4">
            <h4 className="font-semibold mb-1">Test Level Up</h4>
            <div className="grid grid-cols-3 gap-2">
              {xpTable.map((xpThreshold, index) => (
                <button
                  key={index + 1}
                  onClick={() => simulateLevelUp(index + 1)}
                  className={`py-1 px-2 rounded text-xs bg-gray-200`}
                >
                  Level {index + 1}
                </button>
              ))}
            </div>
          </div>

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
              <button
                onClick={() =>
                  updateDoc(doc(db, "users", auth.currentUser.uid), {
                    current_streak: increment(1),
                  })
                }
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
          level={testLevel}
          onClose={() => setShowLevelUpModal(false)}
        />
      )}

      {/* Rank Up Screen */}
      {showRankUpScreen && (
        <RankUpScreen
          rank={testRank}
          onClose={() => setShowRankUpScreen(false)}
        />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
