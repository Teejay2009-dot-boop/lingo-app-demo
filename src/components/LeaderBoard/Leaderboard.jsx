import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../../firebase/config/firebase";
import { FaTrophy, FaCrown, FaMedal, FaUserAlt, FaFire } from "react-icons/fa";
import { Link } from "react-router-dom";
import DashboardLayout from "../dashboard/DashboardLayout";
import { getUserRank } from "../../utils/rankSystem";
import {
  FaChartBar,
  FaKeyboard,
  FaTree,
  FaHome,
  FaProcedures,
} from "react-icons/fa";

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardMode, setLeaderboardMode] = useState("general");
  const [currentUserPosition, setCurrentUserPosition] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  
  const mountedRef = useRef(true);

  // Fetch current user's data
  useEffect(() => {
    const fetchCurrentUserData = async () => {
      if (!auth.currentUser || !mountedRef.current) {
        setCurrentUserData(null);
        return;
      }

      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        
        if (!mountedRef.current) return;
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Calculate user's current rank
          const userRank = getUserRank({
            level: data.level || 1,
            accuracy: data.progress?.accuracy || 0,
            streak: data.current_streak || 0,
            lessonsCompleted: data.total_lessons || data.lessons || 0,
          });

          const userData = {
            ...data,
            xp: data.xp || 0,
            level: data.level || 1,
            // Use calculated rank if stored rank doesn't exist
            rank: data.rank || userRank.name,
            calculatedRank: userRank,
            current_streak: data.current_streak || 0,
            username: data.username || "Anonymous",
            progress: data.progress || { accuracy: 0 },
            total_lessons: data.total_lessons || data.lessons || 0,
          };
          setCurrentUserData(userData);
          console.log("Current user rank:", userData.rank, "Calculated:", userRank.name);
        } else {
          setCurrentUserData(null);
        }
      } catch (error) {
        console.error("Error fetching current user data:", error);
        if (mountedRef.current) {
          setCurrentUserData(null);
        }
      }
    };

    fetchCurrentUserData();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Fetch leaderboard data
  useEffect(() => {
    if (!mountedRef.current) return;

    const fetchLeaderboard = async () => {
      setLoading(true);
      
      try {
        let usersQuery;
        let allUsers = [];

        if (leaderboardMode === "general") {
          // Get all users with XP, sorted by XP descending
          usersQuery = query(
            collection(db, "users"),
            orderBy("xp", "desc"),
            limit(100)
          );
        } else if (leaderboardMode === "rank" && currentUserData) {
          const targetRank = currentUserData.rank;
          console.log("Fetching users for rank:", targetRank);
          
          // Try to fetch by stored rank first
          usersQuery = query(
            collection(db, "users"),
            where("rank", "==", targetRank),
            orderBy("xp", "desc"),
            limit(100)
          );
        } else {
          // Fallback to general if no rank data
          usersQuery = query(
            collection(db, "users"),
            orderBy("xp", "desc"),
            limit(100)
          );
        }

        const querySnapshot = await getDocs(usersQuery);
        
        if (!mountedRef.current) return;

        // Process users
        allUsers = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const userXp = data.xp || 0;
          const userLevel = data.level || 1;
          const userAccuracy = data.progress?.accuracy || 0;
          const userStreak = data.current_streak || 0;
          const userLessons = data.total_lessons || data.lessons || 0;

          // Calculate rank for each user
          const userRank = getUserRank({
            level: userLevel,
            accuracy: userAccuracy,
            streak: userStreak,
            lessonsCompleted: userLessons,
          });

          return {
            id: doc.id,
            username: data.username || "Anonymous",
            avatar: data.avatar || null,
            xp: userXp,
            level: userLevel,
            current_streak: userStreak,
            total_lessons: userLessons,
            progress: data.progress || { accuracy: 0 },
            rank: data.rank || userRank.name,
            calculatedRank: userRank,
            ...data
          };
        });

        console.log(`Found ${allUsers.length} users in ${leaderboardMode} mode`);

        // For rank mode, if we didn't find users by stored rank, try calculating ranks
        if (leaderboardMode === "rank" && allUsers.length === 0 && currentUserData) {
          console.log("No users found by stored rank, trying general query...");
          const generalQuery = query(
            collection(db, "users"),
            orderBy("xp", "desc"),
            limit(200) // Get more users to filter client-side
          );
          const generalSnapshot = await getDocs(generalQuery);
          
          allUsers = generalSnapshot.docs.map((doc) => {
            const data = doc.data();
            const userXp = data.xp || 0;
            const userLevel = data.level || 1;
            const userAccuracy = data.progress?.accuracy || 0;
            const userStreak = data.current_streak || 0;
            const userLessons = data.total_lessons || data.lessons || 0;

            const userRank = getUserRank({
              level: userLevel,
              accuracy: userAccuracy,
              streak: userStreak,
              lessonsCompleted: userLessons,
            });

            return {
              id: doc.id,
              username: data.username || "Anonymous",
              avatar: data.avatar || null,
              xp: userXp,
              level: userLevel,
              current_streak: userStreak,
              total_lessons: userLessons,
              progress: data.progress || { accuracy: 0 },
              rank: data.rank || userRank.name,
              calculatedRank: userRank,
              ...data
            };
          });

          // Filter by calculated rank client-side
          allUsers = allUsers.filter(user => 
            user.calculatedRank.name === currentUserData.rank
          );
          console.log(`Found ${allUsers.length} users after client-side filtering`);
        }

        // Sort by XP to ensure correct order
        allUsers.sort((a, b) => (b.xp || 0) - (a.xp || 0));

        setUsers(allUsers);

        // Find current user's position
        if (auth.currentUser) {
          const position = allUsers.findIndex(
            (user) => user.id === auth.currentUser.uid
          );
          setCurrentUserPosition(position >= 0 ? position + 1 : null);
          console.log("Current user position:", position >= 0 ? position + 1 : "Not found");
        } else {
          setCurrentUserPosition(null);
        }

      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        if (mountedRef.current) {
          setUsers([]);
          setCurrentUserPosition(null);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchLeaderboard();
  }, [leaderboardMode, currentUserData]);

  // Format XP to whole numbers
  const formatXP = (xp) => {
    const xpNumber = Number(xp) || 0;
    return Math.round(xpNumber);
  };

  // Get rank display name
  const getRankDisplayName = (user) => {
    return user.rank || user.calculatedRank?.name || "Beginner";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading leaderboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full px-2 sm:px-4 pt-20 md:pt-8 pb-20 max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Leaderboard
        </h1>

        {/* Leaderboard mode selector */}
        <div className="flex justify-center gap-2 sm:gap-4 mb-6">
          <button
            onClick={() => setLeaderboardMode("general")}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-colors text-sm sm:text-base ${
              leaderboardMode === "general"
                ? "bg-yellow-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Global
          </button>
          <button
            onClick={() => setLeaderboardMode("rank")}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-colors text-sm sm:text-base ${
              leaderboardMode === "rank"
                ? "bg-yellow-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            My Rank
          </button>
        </div>

        {/* Leaderboard info */}
        <div className="text-center mb-4 text-sm text-gray-600">
          {leaderboardMode === "general" 
            ? "Top users by XP" 
            : currentUserData 
              ? `Users in ${currentUserData.rank} Rank`
              : "My Rank"
          }
        </div>

        {/* Leaderboard table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          {users.length === 0 ? (
            <div className="text-center p-8 sm:p-12 text-gray-500 text-sm sm:text-base">
              {leaderboardMode === "rank" && currentUserData ? (
                <div>
                  <p className="mb-2">No other users found in {currentUserData.rank} Rank.</p>
                  <p className="text-xs">You're the first one! Invite friends to join your rank.</p>
                </div>
              ) : (
                "No users found. Be the first to earn XP!"
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {users.map((user, index) => (
                <li
                  key={user.id}
                  className={`relative flex items-center py-4 px-3 sm:py-6 sm:px-6 transition-colors ${
                    user.id === auth.currentUser?.uid
                      ? "bg-yellow-50 border-l-4 border-yellow-500"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {/* Rank Badge */}
                  <div className="flex-shrink-0 mr-3 sm:mr-4 w-6 sm:w-8 text-center">
                    {index === 0 ? (
                      <FaCrown className="text-yellow-500 text-xl sm:text-2xl" />
                    ) : index === 1 ? (
                      <FaTrophy className="text-gray-400 text-xl sm:text-2xl" />
                    ) : index === 2 ? (
                      <FaMedal className="text-yellow-600 text-xl sm:text-2xl" />
                    ) : (
                      <span className="text-gray-500 font-bold text-base sm:text-lg">
                        #{index + 1}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0 mr-3 sm:mr-4">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-white">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaUserAlt className="text-gray-500 text-sm sm:text-xl" />
                      )}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-grow min-w-0 flex justify-between items-center">
                    <div className="min-w-0 flex-1 mr-2">
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-lg truncate">
                        {user.username}
                        {user.id === auth.currentUser?.uid && (
                          <span className="ml-1 sm:ml-2 text-yellow-500 text-xs sm:text-sm">
                            (You)
                          </span>
                        )}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        {getRankDisplayName(user)} • Level {user.level || 1}
                        {user.progress?.accuracy > 0 && ` • ${Math.round(user.progress.accuracy)}% accuracy`}
                      </p>
                    </div>

                    {/* XP and Streak */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-800 text-sm sm:text-lg">
                        {formatXP(user.xp)} XP
                      </p>
                      <div className="flex items-center justify-end gap-2 text-xs sm:text-sm">
                        {(user.current_streak || 0) > 0 && (
                          <div className="flex items-center text-yellow-500">
                            <FaFire className="mr-1" />
                            <span>{user.current_streak}</span>
                          </div>
                        )}
                        {(user.total_lessons || 0) > 0 && (
                          <span className="text-gray-500 hidden sm:inline">
                            {user.total_lessons} lessons
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Current user's position */}
        {auth.currentUser && currentUserData && (
          <div className="bg-yellow-50 p-4 sm:p-6 rounded-xl border border-yellow-200">
            <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800">
              Your Position
            </h2>
            {currentUserPosition !== null ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex-1">
                  <p className="text-gray-700 text-sm sm:text-base">
                    {leaderboardMode === "general"
                      ? `You are #${currentUserPosition} globally with ${formatXP(currentUserData.xp)} XP`
                      : `You are #${currentUserPosition} in ${currentUserData.rank} Rank`}
                  </p>
                  <p className="text-gray-600 text-xs sm:text-sm mt-1">
                    Level {currentUserData.level || 1} • {currentUserData.total_lessons || 0} lessons completed
                  </p>
                </div>
                {(currentUserData?.current_streak || 0) > 0 && (
                  <div className="flex items-center text-yellow-600 text-sm sm:text-base bg-yellow-100 px-3 py-1 rounded-full">
                    <FaFire className="mr-2" />
                    <span>{currentUserData.current_streak}-day streak</span>
                  </div>
                )}
              </div>
            ) : leaderboardMode === "rank" ? (
              <div className="text-gray-700">
                <p className="text-sm sm:text-base">
                  You are the only user in {currentUserData.rank} Rank!
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Complete more lessons to maintain your rank or invite friends to join you.
                </p>
              </div>
            ) : (
              <div className="text-gray-700">
                <p className="text-sm sm:text-base">
                  You are not on the global leaderboard yet.
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Complete lessons and earn XP to climb the ranks!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
            <strong>Debug Info:</strong> Mode: {leaderboardMode} | 
            Users: {users.length} | 
            Current User Rank: {currentUserData?.rank} |
            Current User XP: {formatXP(currentUserData?.xp)}
          </div>
        )}

        {/* Mobile Navigation */}
        <div className="fixed bottom-0 left-0 w-full h-16 flex items-center text-yellow-500 justify-around bg-gray-100 lg:hidden">
          <Link to={"/lessons"} className="flex flex-col items-center pt-3">
            <FaHome className="text-xl" />
            <p className="text-yellow-500 text-xs">Home</p>
          </Link>
          <Link to={"/leaderboard"} className="flex flex-col items-center pt-3">
            <FaChartBar className="text-xl" />
            <p className="text-yellow-500 text-xs">Ranking</p>
          </Link>
          <Link to={"/dashboard"} className="flex flex-col items-center pt-3">
            <FaKeyboard className="text-xl" />
            <p className="text-yellow-500 text-xs">Dashboard</p>
          </Link>
          <Link
            to={"/notifications"}
            className="flex flex-col items-center pt-3"
          >
            <FaTree className="text-xl" />
            <p className="text-yellow-500 text-xs">Feed</p>
          </Link>
          <Link to={"/profile"} className="flex flex-col items-center pt-3">
            <FaProcedures className="text-xl" />
            <p className="text-yellow-500 text-xs">Profile</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Leaderboard;