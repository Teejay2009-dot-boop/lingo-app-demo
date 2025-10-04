import React from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import chrip from "../assets/IMG-20250724-WA0115-removebg-preview.png";

const PracticeSection = () => {
  const navigate = useNavigate();

  const practiceTypes = [
    {
      id: "vocabulary",
      name: "Vocabulary",
      emoji: "📚",
      description: "Practice word meanings and translations",
    },
    {
      id: "listening",
      name: "Listening",
      emoji: "👂",
      description: "Improve your listening comprehension",
    },
    {
      id: "role_playing",
      name: "Role Playing",
      emoji: "🧍‍♂️",
      description: "Practice conversations and dialogues",
    },
    {
      id: "speaking",
      name: "Speaking",
      emoji: "🗣",
      description: "Work on pronunciation and speaking",
    },
    {
      id: "mixed",
      name: "Mixed Practice",
      emoji: "🔄",
      description: "All exercise types combined",
    },
  ];

  const startPractice = (practiceType) => {
    navigate("/practice/display", {
      state: {
        practiceType: practiceType.id,
        practiceName: practiceType.name,
      },
    });
  };

  return (
    <>
      <DashboardLayout>
        <div className="pt-14 lg:pt-0 p-4">
          <button
            onClick={() => navigate(`/lessons/section`)}
            className="p-3 text-amber text-2xl rounded-lg"
          >
            <FaArrowLeft />
          </button>

          <p className="flex align-top justify-center text-amber text-3xl font-bold mb-6">
            Practice
          </p>

          <div className="practice-container flex flex-col items-center mb-8">
            <p className="text-lg font-semibold pt-7 text-center">
              Learn with chirp and improve your knowledge
            </p>
            <img src={chrip} style={{ width: "10rem" }} alt="Chirp mascot" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {practiceTypes.map((type) => (
              <div
                key={type.id}
                onClick={() => startPractice(type)}
                className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200 hover:shadow-lg border-2 border-transparent hover:border-amber-300"
              >
                <p className="text-center text-6xl pb-3">{type.emoji}</p>
                <p className="text-xl text-center font-semibold mb-2">
                  {type.name}
                </p>
                <p className="text-gray-500 text-center text-sm mb-4">
                  {type.description}
                </p>
                <button className="mt-2 bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors">
                  Start Practice
                </button>
              </div>
            ))}
          </div>

          {/* Practice Instructions */}
          <div className="mt-8 bg-amber-50 rounded-lg p-6 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-amber-700 mb-3">
              How Practice Mode Works:
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Unlimited questions of your chosen type</li>
              <li>No timer pressure - learn at your own pace</li>
              <li>Track your accuracy and build streaks</li>
              <li>Earn XP for correct answers</li>
              <li>Exit anytime when you're done practicing</li>
            </ul>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default PracticeSection;
