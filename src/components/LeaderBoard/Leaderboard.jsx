import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../../firebase/config/firebase";
import { FaTrophy, FaCrown, FaMedal, FaUserAlt, FaFire } from "react-icons/fa";
import { Link } from "react-router-dom";
import DashboardLayout from "../dashboard/DashboardLayout";

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all-time");
  const [currentUserPosition, setCurrentUserPosition] = useState(null);

  useEffect(() => {
    let unsubscribe;
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);

        // Determine the field to sort by
        let sortField;
        switch (timeRange) {
          case "weekly":
            sortField = "weeklyXP";
            break;
          case "monthly":
            sortField = "monthlyXP";
            break;
          default:
            sortField = "total_xp";
        }

        const q = query(
          collection(db, "users"),
          orderBy(sortField, "desc"),
          limit(50)
        );

        unsubscribe = onSnapshot(q, (querySnapshot) => {
          const usersData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
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

    fetchLeaderboard();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [timeRange]);

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

        {/* Time range selector */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setTimeRange("weekly")}
            className={`px-4 py-2 rounded-full ${
              timeRange === "weekly" ? "bg-amber text-white" : "bg-gray-200"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimeRange("monthly")}
            className={`px-4 py-2 rounded-full ${
              timeRange === "monthly" ? "bg-amber text-white" : "bg-gray-200"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setTimeRange("all-time")}
            className={`px-4 py-2 rounded-full ${
              timeRange === "all-time" ? "bg-amber text-white" : "bg-gray-200"
            }`}
          >
            All Time
          </button>
        </div>

        {/* Leaderboard table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          {users.length === 0 ? (
            <div className="text-center p-8">No users found</div>
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
                          {user.title || "Beginner"}
                        </p>
                      </div>

                      {/* XP and Level - Moved to the far right */}
                      <div className="text-right min-w-[100px]">
                        <p className="font-bold text-gray-800 text-lg">
                          {timeRange === "weekly"
                            ? user.weeklyXP || 0
                            : timeRange === "monthly"
                            ? user.monthlyXP || 0
                            : user.total_xp || 0}{" "}
                          XP
                        </p>
                        <div className="flex items-center justify-end">
                          <p className="text-sm text-gray-500 mr-1">
                            Lvl {user.level || 1}
                          </p>
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
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
          <h2 className="text-xl font-semibold mb-2">Your Position</h2>
          {currentUserPosition ? (
            <div className="flex items-center justify-between">
              <p className="text-gray-700">
                You're ranked{" "}
                <span className="font-bold">#{currentUserPosition}</span>
              </p>
              {users[currentUserPosition - 1]?.current_streak > 3 && (
                <div className="flex items-center text-amber-600">
                  <FaFire className="mr-1" />
                  <span>
                    {users[currentUserPosition - 1].current_streak}-day streak
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-700">
              You're not on the leaderboard yet. Complete lessons to earn XP!
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Leaderboard;
