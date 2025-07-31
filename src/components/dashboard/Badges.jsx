import React, { useState } from "react";

const WeeklyBadges = () => {
  const [activity, setActivity] = useState({
    streak: 5,
    xp: 120,
    lessons: 4,
    challengeCompleted: true,
  });

  const earnedBadges = {
    streak: activity.streak >= 5,
    xp: activity.xp >= 100,
    lessons: activity.lessons >= 3,
    challenge: activity.challengeCompleted,
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4 text-amber-600">
        🏅 Weekly Badges
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <Badge earned={earnedBadges.streak} icon="🔥" label="5-Day Streak" />
        <Badge earned={earnedBadges.xp} icon="⚡️" label="100 XP" />
        <Badge earned={earnedBadges.lessons} icon="📘" label="3 Lessons" />
        <Badge
          earned={earnedBadges.challenge}
          icon="🎯"
          label="Challenge Completed"
        />
      </div>
    </div>
  );
};

const Badge = ({ earned, icon, label }) => {
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg transition ${
        earned ? "bg-amber-100 border-amber-400 border" : "bg-gray-100"
      }`}
    >
      <span className="text-3xl">{icon}</span>
      <span
        className={`font-medium ${earned ? "text-amber-600" : "text-gray-500"}`}
      >
        {label}
      </span>
    </div>
  );
};

export default WeeklyBadges;
