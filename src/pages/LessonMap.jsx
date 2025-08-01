import React from "react";
import { useNavigate } from "react-router-dom";

const fakeLessons = [
  { id: 1, title: "Greetings", xp: 40, isLocked: false },
  { id: 2, title: "Numbers", xp: 50, isLocked: false },
  { id: 3, title: "Food", xp: 45, isLocked: true },
  { id: 4, title: "Colors", xp: 50, isLocked: true },
  { id: 4, title: "Colors", xp: 50, isLocked: true },
  { id: 4, title: "Colors", xp: 50, isLocked: true },
  { id: 4, title: "Colors", xp: 50, isLocked: true },
  { id: 4, title: "Colors", xp: 50, isLocked: true },
  { id: 4, title: "Colors", xp: 50, isLocked: true },
  { id: 4, title: "Colors", xp: 50, isLocked: true },
  { id: 4, title: "Colors", xp: 50, isLocked: true },
  { id: 4, title: "Colors", xp: 50, isLocked: true },
  { id: 4, title: "Colors", xp: 50, isLocked: true },
  { id: 4, title: "Colors", xp: 50, isLocked: true },
  { id: 4, title: "Colors", xp: 50, isLocked: true },
  { id: 4, title: "Colors", xp: 50, isLocked: true },
  { id: 4, title: "Colors", xp: 50, isLocked: true },
  { id: 4, title: "Colors", xp: 50, isLocked: true },
  { id: 4, title: "Colors", xp: 50, isLocked: true },
  { id: 4, title: "Colors", xp: 50, isLocked: true },
  { id: 4, title: "Colors", xp: 50, isLocked: true },
  { id: 4, title: "Colors", xp: 50, isLocked: true },
];

const LessonMap = () => {
  const navigate = useNavigate();

  const handleClick = (lesson) => {
    if (lesson.isLocked) return;
    setTimeout(() => navigate(`/lessons/section/learn/${lesson.id}`), 400);
  };

  return (
    <section className="min-h-screen bg-[#fff8e1] py-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-10 text-amber-600 font-fredoka">
        Choose a Lesson
      </h2>
      <div className="relative max-w-md mx-auto flex flex-col items-center space-y-4">
        {fakeLessons.map((lesson, idx) => (
          <div
            key={lesson.id}
            className="w-full relative flex flex-col items-center"
          >
            {/* Connector line above (except for the first item) */}
            {idx !== 0 && (
              <div className="absolute top-[-32px] h-8 w-1 bg-amber-400 z-0" />
            )}

            {/* Lesson bubble */}
            <div
              onClick={() => handleClick(lesson)}
              className={`z-10 relative flex ${
                idx % 2 === 0 ? "justify-start" : "justify-end"
              } w-full`}
            >
              <div
                className={`rounded-full w-24 h-24 flex flex-col items-center justify-center text-white font-bold shadow-md cursor-pointer transition-all duration-300 ${
                  lesson.isLocked
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-amber-500 hover:bg-amber-600 hover:scale-105"
                }`}
              >
                <span className="text-xl text-amber">S{lesson.id}</span>
                <span className="text-sm font-normal text-amber">{lesson.title}</span>
              </div>
            </div>

            {/* Connector line below (except last item) */}
            {idx < fakeLessons.length - 1 && (
              <div className="w-1 h-10 bg-amber-400 mt-2 mb-2 z-0" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default LessonMap;
