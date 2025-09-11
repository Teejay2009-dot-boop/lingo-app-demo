import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Section from "./pages/Section";
import LessonMap from "./pages/LessonMap";
import LessonDisplay from "./pages/LessonDisplay";
import Leaderboard from "./components/LeaderBoard/Leaderboard";
import Profile from "./pages/Profile";
import Feed from "./components/NotificationFeed";
import PracticeSection from "./pages/PracticeSection";
import Badges from "./pages/Badges";
import Achievements from "./pages/Achievements";

function App() {
  useEffect(() => {
    console.log("App component rendered.");
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/section" element={<Section />} />
        <Route path="/lesson-map/:moduleId" element={<LessonMap />} />
        <Route
          path="/lessons/module/:moduleId/:lessonIndex"
          element={<LessonDisplay />}
        />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Feed />} />
        <Route path="/practice" element={<PracticeSection />} />
        <Route path="/badges" element={<Badges />} />
        <Route path="/achievements" element={<Achievements />} />
      </Routes>
    </Router>
  );
}

export default App;
