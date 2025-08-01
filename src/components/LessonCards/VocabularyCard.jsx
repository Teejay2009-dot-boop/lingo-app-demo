// src/components/LessonCards/VocabularyCard.jsx
import React, { useState } from "react";
import teacher from "../../assets/IMG-20250724-WA0123-removebg-preview.png";

export const VocabularyCard = ({ data, onAnswer, disabled }) => {
  const [selected, setSelected] = useState(null);

  const handleSelect = (option) => {
    if (selected || disabled) return;
    setSelected(option);
    const isCorrect = option === data.answer;
    onAnswer(isCorrect); // Call parent with result
  };

  return (
    <div className="bg-gray-100 rounded-lg p-6 max-w-[700px] mx-auto text-center">
      <div className="flex items-center justify-between mb-4 border p-10 rounded-2xl">
        <h2 className="text-2xl font-bold mb-4">{data.question}</h2>
        <img src={teacher} style={{ width: "8rem" }} alt="teacher" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20">
        {data.options.map((option, index) => {
          const isSelected = selected === option;
          const isAnswer = option === data.answer;

          let btnStyle = "border px-4 py-2 rounded transition";

          if (selected) {
            if (isSelected && isAnswer) {
              btnStyle += " border-green-500 bg-green-100";
            } else if (isSelected && !isAnswer) {
              btnStyle += " border-red-500 bg-red-100";
            } else {
              btnStyle += " border-gray-300 text-gray-400 cursor-not-allowed";
            }
          } else {
            btnStyle += " border-gray-300 hover:bg-gray-100";
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              className={btnStyle}
              disabled={!!selected || disabled}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};
