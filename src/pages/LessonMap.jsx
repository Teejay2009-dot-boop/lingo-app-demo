import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowAltCircleLeft,
  FaLock,
  FaTimes,
  FaBook,
  FaHeadphones,
  FaRandom,
  FaRedo,
  FaCoins,
  FaHeart,
  FaArrowLeft,
} from "react-icons/fa"; // Added FaTimes for modal close
import { getSections } from "../data/lessons";
import { auth, db } from "../firebase/config/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import learningCuate from "../assets/IMG-20250724-WA0115-removebg-preview.png";
// import DashboardLayout from "../components/dashboard/DashboardLayout"; // Removed DashboardLayout

const LessonMap = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [moduleProgress, setModuleProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }

    const uid = auth.currentUser.uid;
    const sectionsData = getSections();
    setSections(sectionsData);

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

  const handleClick = (module) => {
    setSelectedModule(module);
    setShowLessonModal(true);
  };

  const handleLessonStart = (lessonId, module_id, lessonIndex) => {
    const progress = moduleProgress[module_id] || { completedLessons: 0 };
    const isLessonUnlocked = lessonIndex <= progress.completedLessons;

    if (isLessonUnlocked) {
      navigate(`/lessons/module/${module_id}/${lessonIndex}`);
      setShowLessonModal(false);
    } else {
      alert("This lesson is locked. Complete the previous lessons first!");
    }
  };

  const getModuleIcon = (type) => {
    switch (type) {
      case "vocabulary":
        return <FaBook className="text-4xl text-amber" />;
      case "listening":
        return <FaHeadphones className="text-4xl text-amber" />;
      case "mixed":
        return <FaRandom className="text-4xl text-amber" />;
      case "practice":
        return <FaRedo className="text-4xl text-amber" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">Loading modules...</div> // Removed DashboardLayout
    );
  }

  return (
    <>
      <div className="w-full bg-white h-10 flex justify-end lg:justify-between items-center pr-1 md:pr-5 pt-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="p-3 text-amber text-2xl rounded-lg "
          >
            <FaArrowLeft />
          </button>
        </div>
        <div className="flex justify-between gap-5 md:gap-7 lg:gap-10 md:text-xl text-md">
          <div className="flex justify-center items-center gap-2 ">
            <FaCoins className="text-yellow-500" />
            <p>5736</p>
          </div>
          <div className="flex justify-center items-center gap-2 ">
            <FaHeart className="text-red-600" />
            <p>5736</p>
          </div>
          <div className="flex justify-center items-center gap-2 text-amber ">
            XP
            <p>1345</p>
          </div>
        </div>
      </div>
      <section className="min-h-screen bg-white pb-12 pt-7 px-4">
        {" "}
        {/* Removed DashboardLayout */}
        <h2 className="text-3xl font-bold text-center mb-10 text-amber font-fredoka">
          Choose a Section
        </h2>
        <div className="relative flex flex-col items-center space-y-8">
          {sections.map((section, sectionIdx) => (
            <div key={section.section_id} className="w-full">
              <div className="flex flex-col items-center w-full">
                {/* Section Title */}
                <h3 className="text-2xl font-semibold text-center mb-6 text-indigo-700 font-fredoka">
                  {section.title}
                </h3>
                {/* Section Image */}
                <div className="w-full flex justify-center mb-8">
                  <img
                    src={learningCuate} // Using the provided image for the section
                    alt="Section illustration"
                    className="w-3/4 md:w-1/2 max-w-[250px] object-contain"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 max-w-md mx-auto">
                {section.modules.map((module, moduleIdx) => {
                  const progress = moduleProgress[module.module_id] || {
                    completedLessons: 0,
                  };
                  // Determine if the current module should be locked
                  const isLocked =
                    moduleIdx > 0 &&
                    !(
                      moduleProgress[section.modules[moduleIdx - 1].module_id]
                        ?.completedLessons ===
                      section.modules[moduleIdx - 1].lessons.length
                    );

                  const content = (
                    <div
                      key={module.module_id}
                      className="w-full relative flex flex-col items-center"
                    >
                      {/* Connector line above (except for the first module in a section) */}
                      {moduleIdx !== 0 && (
                        <div className="absolute top-[-32px] h-8 w-1 bg-amber-400 z-0" />
                      )}

                      {/* Module button */}
                      <div
                        onClick={() => !isLocked && handleClick(module)}
                        className={`z-10 relative flex ${
                          moduleIdx % 2 === 0 ? "justify-start" : "justify-end"
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
                          {getModuleIcon(module.type)}
                          <span className="text-xs font-normal text-gray-800 mt-1">
                            Module {moduleIdx + 1}
                          </span>
                        </div>
                      </div>

                      {/* Connector line below (except last module in a section) */}
                      {moduleIdx < section.modules.length - 1 && (
                        <div className="w-1 h-10 bg-amber-400 mt-2 mb-2 z-0" />
                      )}
                    </div>
                  );

                  return content;
                })}
              </div>
            </div>
          ))}
        </div>
        {/* Lesson Selection Modal */}
        {showLessonModal && selectedModule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 shadow-xl relative w-full max-w-sm">
              <button
                onClick={() => setShowLessonModal(false)}
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
              >
                <FaTimes className="text-xl" />
              </button>
              <h3 className="text-2xl font-bold text-center mb-6 text-indigo-700 font-fredoka">
                Lesson{" "}
                {selectedModule ? selectedModule.module_id.split("_")[1] : ""}{" "}
              </h3>
              <div className="space-y-4">
                {selectedModule.lessons.map((lesson, lessonIdx) => {
                  const progress = moduleProgress[selectedModule.module_id] || {
                    completedLessons: 0,
                  };
                  const isLessonUnlocked =
                    lessonIdx <= progress.completedLessons; // Unlocked if index is <= completed lessons
                  const lessonCompleted = lessonIdx < progress.completedLessons; // Completed if index is strictly less than completed lessons

                  return (
                    <button
                      key={lesson.lesson_id}
                      onClick={() =>
                        handleLessonStart(
                          lesson.lesson_id,
                          selectedModule.module_id,
                          lessonIdx
                        )
                      }
                      className={`flex items-center justify-between w-full p-4 rounded-lg shadow-md transition-all duration-200
                      ${
                        isLessonUnlocked && !lessonCompleted
                          ? "bg-amber-100 hover:bg-amber-200 cursor-pointer"
                          : lessonCompleted
                          ? "bg-green-100 text-green-700 cursor-pointer"
                          : "bg-gray-100 cursor-not-allowed opacity-70"
                      }
                    `}
                      disabled={!isLessonUnlocked}
                    >
                      <span className="text-lg font-medium text-gray-800">
                        {lesson.title}
                      </span>
                      {isLessonUnlocked ? (
                        lessonCompleted ? (
                          <span className="text-green-600">Completed</span>
                        ) : (
                          <span className="text-amber-600">Start</span>
                        )
                      ) : (
                        <FaLock className="text-gray-500" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="w-full mx-auto h-12 pt-6 rounded-lg mt-6 bg-amber justify-center items-center flex">
                <button
                  className="text-white text-xl font-semibold text-center pb-5 font-fredoka"
                  onClick={() => setShowLessonModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default LessonMap;
