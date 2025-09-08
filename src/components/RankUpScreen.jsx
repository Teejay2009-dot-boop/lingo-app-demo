import React from "react";

export const RankUpScreen = ({ rank, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-10 rounded-xl shadow-2xl text-center max-w-lg mx-auto animate-zoom-in border-4 border-yellow-400">
        <div className="text-7xl mb-6 animate-bounce-slow">🏆</div>
        <h2 className="text-4xl font-extrabold text-gray-900 mb-3">Rank Up!</h2>
        <p className="text-2xl text-purple-700 font-semibold mb-8">
          You are now a {rank}!
        </p>
        <button
          onClick={onClose}
          className="bg-yellow-500 text-white py-4 px-12 rounded-full text-xl font-bold shadow-lg hover:bg-yellow-600 transition duration-300 transform hover:scale-105"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

