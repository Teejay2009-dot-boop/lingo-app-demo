import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where, // Added where for rank filtering
} from "firebase/firestore";
import { db, auth } from "../../firebase/config/firebase";
import { FaTrophy, FaCrown, FaMedal, FaUserAlt, FaFire } from "react-icons/fa";
import { Link } from "react-router-dom";
import DashboardLayout from "../dashboard/DashboardLayout";
import { getRank } from "../../data/defaultUser"; // Import getRank

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardMode, setLeaderboardMode] = useState("general"); // "general" or "rank"
  const [currentUserPosition, setCurrentUserPosition] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null); // To store current user's data

  // Fetch current user's data
  useEffect(() => {
    if (!auth.currentUser) return;

    const userRef = collection(db, "users");
    const q = query(userRef, where("id", "==", auth.currentUser.uid), limit(1));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setCurrentUserData(snapshot.docs[0].data());
      }
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.currentUser?.uid]); // Depend on auth.currentUser.uid

  useEffect(() => {
    let unsubscribe;
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        let q;

        if (leaderboardMode === "general") {
          q = query(collection(db, "users"), orderBy("xp", "desc"), limit(50)); // Order by xp
        } else if (leaderboardMode === "rank") {
          if (!currentUserData?.rank) {
            setUsers([]);
            setCurrentUserPosition(null);
            setLoading(false);
            return;
          }
          q = query(
            collection(db, "users"),
            where("rank", "==", currentUserData.rank),
            orderBy("xp", "desc"),
            limit(50)
          ); // Filter by current user's rank
        }

        unsubscribe = onSnapshot(q, (querySnapshot) => {
          const usersData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            rank: getRank(doc.data().level), // Ensure rank is calculated and available
          }));

          setUsers(usersData);

          // Find current user's position
          if (auth.currentUser) {
            const position = usersData.findIndex(
              (user) => user.id === auth.currentUser.uid
            );
            setCurrentUserPosition(position >= 0 ? position + 1 : null);
          }
        });
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    if (leaderboardMode === "rank" && !currentUserData) {
      // Wait for currentUserData to be fetched before fetching rank leaderboard
      return;
    }

    fetchLeaderboard();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [leaderboardMode, currentUserData]); // Depend on leaderboardMode and currentUserData

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">Loading leaderboard...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto bg-gray-50 px-4 pt-24 md:pt-0 pb-8">
        <h1 className="text-3xl font-bold text-center mb-6">Leaderboard</h1>

        {/* Leaderboard mode selector */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setLeaderboardMode("general")}
            className={`px-4 py-2 rounded-full ${
              leaderboardMode === "general"
                ? "bg-amber text-white"
                : "bg-gray-200"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setLeaderboardMode("rank")}
            className={`px-4 py-2 rounded-full ${
              leaderboardMode === "rank" ? "bg-amber text-white" : "bg-gray-200"
            }`}
          >
            My Rank
          </button>
        </div>

        {/* Leaderboard table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          {users.length === 0 ? (
            <div className="text-center p-8">
              {leaderboardMode === "rank" && !currentUserData?.rank
                ? "Log in to see your rank leaderboard."
                : "No users found for this leaderboard."}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {users.map((user, index) => (
                <li
                  key={user.id}
                  className={`relative flex items-center py-4 px-6 transition-colors
    ${user.id === auth.currentUser?.uid ? "bg-amber-50" : "hover:bg-gray-50"}`}
                >
                  {/* Vertical line (timeline effect) - centered on avatar */}
                  {index !== users.length - 1 && (
                    <span className="absolute left-16 top-full h-8 w-0.5 bg-gray-200 transform -translate-y-1/2"></span>
                  )}

                  {/* Rank Badge - Moved to the right */}
                  <div className="flex-shrink-0 mr-4">
                    {index === 0 ? (
                      <FaCrown className="text-yellow-500 text-2xl" />
                    ) : index === 1 ? (
                      <FaTrophy className="text-gray-400 text-2xl" />
                    ) : index === 2 ? (
                      <FaMedal className="text-amber-600 text-2xl" />
                    ) : (
                      <span className="text-gray-500 font-bold text-lg">
                        #{index + 1}
                      </span>
                    )}
                  </div>

                  {/* Avatar with centered shadow line */}
                  <div className="relative flex-shrink-0 mx-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaUserAlt className="text-gray-500 text-xl" />
                      )}
                    </div>
                  </div>

                  {/* User Info - Moved to the right of avatar */}
                  <div className="flex-grow ml-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {user.username || "Anonymous"}
                          {user.id === auth.currentUser?.uid && (
                            <span className="ml-2 text-amber-500 text-sm">
                              (You)
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {user.rank || "Beginner"} (Lvl {user.level || 1})
                        </p>
                      </div>

                      {/* XP and Level - Moved to the far right */}
                      <div className="text-right min-w-[100px]">
                        <p className="font-bold text-gray-800 text-lg">
                          {user.xp || 0} XP
                        </p>
                        <div className="flex items-center justify-end">
                          {user.current_streak > 3 && (
                            <FaFire className="text-amber-500 text-sm" />
                          )}
                        </div>
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
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
            <h2 className="text-xl font-semibold mb-2">Your Position</h2>
            {currentUserPosition !== null ? (
              <div className="flex items-center justify-between">
                <p className="text-gray-700">
                  {leaderboardMode === "general"
                    ? `You are #${currentUserPosition} globally.`
                    : `You are #${currentUserPosition} in ${currentUserData.rank} Rank.`}
                </p>
                {currentUserData?.current_streak > 3 && (
                  <div className="flex items-center text-amber-600">
                    <FaFire className="mr-1" />
                    <span>{currentUserData.current_streak}-day streak</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-700">
                {leaderboardMode === "rank"
                  ? `You are not yet ranked in ${currentUserData.rank} Rank. Complete lessons to earn XP!`
                  : `You are not on the leaderboard yet. Complete lessons to earn XP!`}
              </p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Leaderboard;
