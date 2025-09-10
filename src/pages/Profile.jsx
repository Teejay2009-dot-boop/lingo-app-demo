import { auth, db } from "../firebase/config/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import profilePic from "../assets/IMG-20250724-WA0123.jpg";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = onSnapshot(
      doc(db, "users", auth.currentUser.uid),
      (doc) => {
        if (doc.exists()) setUser(doc.data());
      }
    );

    const streakMetaRef = doc(
      db,
      `users/${auth.currentUser.uid}/meta`,
      "streak"
    );
    const unsubscribeStreak = onSnapshot(streakMetaRef, (snap) => {
      if (snap.exists()) {
        setUser((prevUser) => ({ ...prevUser, ...snap.data() }));
      }
    });

    return () => {
      unsubscribe();
      unsubscribeStreak();
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white relative pb-10">
        {/* Profile Header Background */}
        <div className="bg-yellow-400 h-48 rounded-b-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-profile-wave opacity-20"></div>
          <h1 className="text-white text-xl font-bold text-center pt-6">
            Profile
          </h1>
        </div>

        {/* Profile Picture */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2"
          style={{ top: "100px" }}
        >
          <img
            src={user?.photoURL || profilePic}
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
            alt="Profile"
          />
        </div>

        {/* User Info */}
        <div className="text-center mt-20 px-4">
          <h2 className="text-3xl font-bold text-gray-800">
            Hey {user?.username || "Joxy"}
          </h2>
          <p className="text-amber-600 text-lg flex items-center justify-center gap-1 mt-2">
            <span className="text-xl">🔶</span> {user?.rank || "Topaz"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="flex justify-around items-center flex-wrap gap-4 mt-8 px-4">
          {/* Level Card */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl shadow-md bg-white border border-yellow-200 w-32 h-32">
            <p className="text-amber-500 font-bold text-lg mb-2">Level</p>
            <p className="text-gray-800 text-3xl font-bold">
              {user?.level || 15}
            </p>
          </div>
          {/* Streak Card */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl shadow-md bg-white border border-yellow-200 w-32 h-32">
            <p className="text-4xl mb-1">🔥</p>
            <p className="text-gray-800 text-3xl font-bold">
              {user?.current_streak || 15} days
            </p>
          </div>
          {/* XP Card */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl shadow-md bg-white border border-yellow-200 w-32 h-32">
            <p className="text-amber-500 font-bold text-lg mb-2">XP</p>
            <p className="text-gray-800 text-3xl font-bold">
              {user?.xp || 800}
            </p>
          </div>
        </div>

        {/* Badges Section */}
        <div className="px-4 mt-12">
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">Badges</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* Example Badge 1 */}
            <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-md border border-yellow-100">
              <img
                src="/path/to/librarian-badge.png"
                alt="Librarian"
                className="w-16 h-16 mb-2"
              />{" "}
              {/* Replace with actual badge image */}
              <p className="text-gray-700 font-medium text-center">Librarain</p>
            </div>
            {/* Example Badge 2 */}
            <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-md border border-yellow-100">
              <img
                src="/path/to/most-searches-badge.png"
                alt="Most Searches"
                className="w-16 h-16 mb-2"
              />{" "}
              {/* Replace with actual badge image */}
              <p className="text-gray-700 font-medium text-center">
                Most Searches
              </p>
            </div>
            {/* Add more badges dynamically */}
          </div>
        </div>

        {/* Achievements Section */}
        <div className="px-4 mt-12">
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">
            Achievements
          </h2>
          <div className="space-y-4">
            {/* Example Achievement 1 */}
            <div className="flex items-center p-4 bg-white rounded-xl shadow-md border border-yellow-100">
              <img
                src="/path/to/first-leaderboard-achievement.png"
                alt="First on Leaderboard"
                className="w-16 h-16 mr-4"
              />{" "}
              {/* Replace with actual achievement image */}
              <p className="text-gray-700 font-medium">
                First on the leader board
              </p>
            </div>
            {/* Add more achievements dynamically */}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
