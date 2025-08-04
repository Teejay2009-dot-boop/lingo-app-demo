import React, { useState } from "react";
import image from '../../assets/IMG-20250724-WA0115-removebg-preview.png'

const MatchImageToWord = ({ data, onAnswer, disabled, isAnswered }) => {
  const [selected, setSelected] = useState(null);

  const handleSelect = (option) => {
    if (disabled || selected) return;
    setSelected(option);
    const isCorrect = option === data.answer;
    onAnswer(isCorrect);
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-[700px] mx-auto text-center shadow">
      <h2 className="text-xl font-semibold mb-4">{data.question}</h2>

      <img
        src={image}
        alt="match"
        className="w-40 h-40 object-contain mx-auto mb-6"
      />

      <div className="grid grid-cols-2 gap-4">
        {data.options.map((option, index) => {
          const isSelected = selected === option;
          const isCorrect = option === data.answer;

          let btnStyle = "border px-4 py-2 rounded";

          if (selected) {
            if (isSelected && isCorrect)
              btnStyle += " border-green-500 bg-green-100";
            else if (isSelected && !isCorrect)
              btnStyle += " border-red-500 bg-red-100";
            else btnStyle += " border-gray-300 text-gray-400";
          } else {
            btnStyle += " border-gray-300 hover:bg-gray-100";
          }

          return (
            <button
              key={index}
              className={btnStyle}
              onClick={() => handleSelect(option)}
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

export default MatchImageToWord;
