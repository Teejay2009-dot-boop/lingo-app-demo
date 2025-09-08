import React from "react";

export const ModuleCompletionModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-10 rounded-xl shadow-2xl text-center max-w-md mx-auto animate-pop-in border-4 border-green-500">
        <div className="text-7xl mb-6 animate-bounce-slow">🎉</div>
        <h2 className="text-4xl font-extrabold text-gray-900 mb-3">
          Module Completed!
        </h2>
        <p className="text-xl text-green-700 font-semibold mb-8">
          You have completed all lessons in this section!
        </p>
        <button
          onClick={onClose}
          className="bg-green-600 text-white py-4 px-12 rounded-full text-xl font-bold shadow-lg hover:bg-green-700 transition duration-300 transform hover:scale-105"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
