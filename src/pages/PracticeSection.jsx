import React from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import chrip from "../assets/IMG-20250724-WA0115-removebg-preview.png";
const PracticeSection = () => {
  const navigate = useNavigate();
  return (
    <>
      <DashboardLayout>
        <div className="pt-14 lg:pt-0">
          <button
            onClick={() => navigate(-1)}
            className="p-3 text-amber text-2xl rounded-lg "
          >
            <FaArrowLeft />
          </button>

          <p className="flex align-top justify-center text-amber text-3xl font-bold">
            Practice
          </p> 

          <div className="practice-container">
            <p className="text-lg font-semibold pt-7 pl-3">
              Learn with chirp and improve your knowledge
            </p>
            <img src={chrip} style={{ width: "10rem" }} alt="" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 m-4">
            <div className="bg-white shadow-md w-40 h-44 flex  flex-col justify-center align-middle">
              <p className="text-center text-6xl pb-3">📚</p>
              <p className="text-xl text-center font-semibold">Vocabulary</p>
            </div>
            <div className="bg-white shadow-md w-40 h-44 flex  flex-col justify-center align-middle">
              <p className="text-center text-6xl pb-3">👂</p>
              <p className="text-xl text-center font-semibold">Listening</p>
            </div>
            <div className="bg-white shadow-md w-40 h-44 flex  flex-col justify-center align-middle">
              <p className="text-center text-6xl pb-3">🧍‍♂️</p>
              <p className="text-xl text-center font-semibold">Role Playing</p>
            </div>
            <div className="bg-white shadow-md w-40 h-44 flex  flex-col justify-center align-middle">
              <p className="text-center text-6xl pb-3">🗣</p>
              <p className="text-xl text-center font-semibold">Speaking</p>
            </div>
            <div className="bg-white shadow-md w-40 h-44 flex  flex-col justify-center align-middle">
              <p className="text-center text-6xl pb-3">📖</p>
              <p className="text-xl text-center font-semibold">Dictionary</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default PracticeSection;
