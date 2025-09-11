import React from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import { ClockLoader } from "react-spinners";
import chrip from "../assets/IMG-20250724-WA0123-removebg-preview.png";

const Challenge = () => {
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
            Challnge mode
          </p>

          <div className="challenge-container">
            <img src={chrip} style={{ width: "10rem" }} alt="" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 m-4">
            <div className="bg-white shadow-md w-40 h-44 flex  flex-col justify-center align-middle">
              <p className="flex justify-center text-6xl pb-3">
                <ClockLoader speedMultiplier={3} color="red" />
              </p>
              <p className="text-xl text-center font-semibold">50 seconds</p>
              <p className="text-gray-400 text-center text-lg pt-3">Hard</p>
            </div>
            <div className="bg-white shadow-md w-40 h-44 flex  flex-col justify-center align-middle">
              <p className="flex justify-center text-6xl pb-3">
                <ClockLoader speedMultiplier={2} color="yellow" />
              </p>
              <p className="text-xl text-center font-semibold">1 minute</p>
              <p className="text-gray-400 text-center text-lg pt-3">Medium</p>
            </div>
            <div className="bg-white shadow-md w-40 h-44 flex  flex-col justify-center align-middle">
              <p className="flex justify-center text-6xl pb-3">
                <ClockLoader speedMultiplier={1} color="orange" />
              </p>
              <p className="text-xl text-center font-semibold">
                1 minute 30 seconds
              </p>
              <p className="text-gray-400 text-center text-lg pt-3">Easy</p>
            </div>
            <div className="bg-white shadow-md w-40 h-44 flex  flex-col justify-center align-middle">
              <p className="flex justify-center text-6xl pb-3">
                <ClockLoader speedMultiplier={0.5} color="green" />
              </p>
              <p className="text-xl text-center font-semibold">2 minutes</p>
              <p className="text-gray-400 text-center text-lg pt-3">
                Very Easy
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Challenge;
