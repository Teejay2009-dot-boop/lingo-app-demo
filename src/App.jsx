import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Section from "./pages/Section";
import LessonMap from "./pages/LessonMap";
import LessonDisplay from "./pages/LessonDisplay";
import Leaderboard from "./components/LeaderBoard/Leaderboard";
import Profile from "./pages/Profile";
import NotificationFeed from "./pages/Feed";
import PracticeSection from "./pages/PracticeSection";
import Badges from "./pages/Badges";
import Achievements from "./pages/Achievements";
import Shop from "./pages/Shop";
import { Lesson } from "./pages/Lesson";
import Welcome from "./pages/Welcome";
import Challenge from "./pages/Challenge";
import Settings from "./pages/Settings";

function App() {
  useEffect(() => {
    console.log("App component rendered.");
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/lessons/section/challenge" element={<Challenge />} />
        <Route path="/login" element={<Login />} />
        <Route path="/lessons" element={<Lesson />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/lesson-map/:moduleId" element={<LessonMap />} />
        <Route
          path="/lessons/module/:moduleId/:lessonIndex"
          element={<LessonDisplay />}
        />
        <Route path="/profile/settings" element={<Settings />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<NotificationFeed />} />
        <Route path="/lessons/section/practice" element={<PracticeSection />} />
        <Route path="/badges" element={<Badges />} />
        <Route path="/lessons/section" element={<Section />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/lessons/shop" element={<Shop />} />
      </Routes>
    </Router>
  );
}

export default App;
