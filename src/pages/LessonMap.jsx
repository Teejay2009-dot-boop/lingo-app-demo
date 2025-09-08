import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import GoBackBtn from "../components/GoBackBtn";
import { FaArrowAltCircleLeft, FaLock } from "react-icons/fa";
import { getModules } from "../data/lessons";
import { auth, db } from "../firebase/config/firebase";
import { collection, doc, onSnapshot, query } from "firebase/firestore";
import DashboardLayout from "../components/dashboard/DashboardLayout"; // Using DashboardLayout for consistency

const LessonMap = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [moduleProgress, setModuleProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }

    const uid = auth.currentUser.uid;
    const modulesData = getModules();
    setModules(modulesData);

    const progressRef = collection(db, `users/${uid}/progress`);
    const unsubscribe = onSnapshot(progressRef, (snapshot) => {
      const progressMap = {};
      snapshot.docs.forEach((doc) => {
        progressMap[doc.id] = doc.data();
      });
      setModuleProgress(progressMap);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleClick = (moduleId) => {
    // Module locking logic can be added here if needed
    setTimeout(() => navigate(`/lessons/module/${moduleId}/0`), 400);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">Loading modules...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <section className="min-h-screen bg-[#fff8e1] pb-12 pt-7 px-4">
        <GoBackBtn />
        <h2 className="text-3xl font-bold text-center mb-10 text-amber-600 font-fredoka">
          Choose a Module
        </h2>
        <div className="relative max-w-md mx-auto flex flex-col items-center space-y-4">
          {modules.map((module, idx) => {
            const progress = moduleProgress[module.module_id] || {
              completedLessons: 0,
            };
            const percentage =
              (progress.completedLessons / module.lessons.length) * 100;
            const isModuleCompleted =
              progress.completedLessons === module.lessons.length;
            const isLocked = false; // Implement actual locking logic here if needed

            return (
              <div
                key={module.module_id}
                className="w-full relative flex flex-col items-center"
              >
                {/* Connector line above (except for the first item) */}
                {idx !== 0 && (
                  <div className="absolute top-[-32px] h-8 w-1 bg-amber-400 z-0" />
                )}

                {/* Module button */}
                <div
                  onClick={() => !isLocked && handleClick(module.module_id)}
                  className={`z-10 relative flex ${
                    idx % 2 === 0 ? "justify-start" : "justify-end"
                  } w-full`}
                >
                  <div
                    className={`rounded-full w-28 h-28 flex flex-col items-center justify-center text-white font-bold shadow-md cursor-pointer transition-all duration-300 
                      ${
                        isLocked
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-amber-500 hover:bg-amber-600 hover:scale-105"
                      }
                    `}
                  >
                    <div className="w-20 h-20">
                      <CircularProgressbar
                        value={percentage}
                        text={`${Math.round(percentage)}%`}
                        styles={buildStyles({
                          pathColor: isModuleCompleted ? "#22C55E" : "#F59E0B", // Green if complete, amber otherwise
                          textColor: "#ffffff",
                          trailColor: "#e0e0e0",
                        })}
                      />
                    </div>
                    {/* Moved title outside and below the progress bar for better visibility */}
                    <span className="text-xs font-normal text-white mt-1">
                      {module.title}
                    </span>
                  </div>
                </div>

                {/* Connector line below (except last item) */}
                {idx < modules.length - 1 && (
                  <div className="w-1 h-10 bg-amber-400 mt-2 mb-2 z-0" />
                )}
              </div>
            );
          })}
        </div>
      </section>
    </DashboardLayout>
  );
};

export default LessonMap;
