// src/components/GoBackButton.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import mascot from '../assets/IMG-20250724-WA0115-removebg-preview.png'

const GoBackBtn = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleExit = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <>
      {/* Back Icon Button */}
      <div className="absolute top-4 left-4 z-50">
        <button onClick={() => setShowConfirm(true)}>
          <FaArrowLeft className="text-2xl text-gray-700 hover:text-black" />
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-sm w-full flex flex-col items-center">
        <img src={mascot} style={{width:'10rem', textAlign:'center'}} alt="" />
            <p className="text-lg font-semibold mb-4">
              Wait, dont go you'll lose your progress if you go now!
            </p>
            <div className="flex gap-5 flex-col">
              <button
                onClick={handleExit}
                className=" py-2 bg-amber text-white rounded hover:bg-amberSoft block px-32 font-semibold transition duration-300 ease-in"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition duration-300 ease-in block px-32 font-semibold"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GoBackBtn;
