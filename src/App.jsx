import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Welcome from "./pages/Welcome";
import { NotFound } from "./pages/NotFound";
import { Login } from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { Lesson } from "./pages/Lesson";
import { Progress } from "./pages/Progress";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />

          <Route path="/lesson" element={<Lesson />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
