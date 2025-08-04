import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Welcome from "./pages/Welcome";
import { NotFound } from "./pages/NotFound";
import { Login } from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { Lesson } from "./pages/Lesson";
import { Progress } from "./pages/Progress";
import Section from "./pages/Section";
import LessonDisplay from "./pages/LessonDisplay";
import LessonMap from "./pages/LessonMap";
import ChatBotUI from "./pages/ChatBotUi";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />

          <Route path="/lessons" element={<Lesson />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/lessons/section" element={<Section />}></Route>
          <Route path="/lessons/section/learn" element={<LessonMap />} />
          <Route path="/chat" element={<ChatBotUI />} />

          {/* Dynamic route for lesson display */}
          <Route
            path="/lessons/section/learn/:lessonId"
            element={<LessonDisplay />}
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
