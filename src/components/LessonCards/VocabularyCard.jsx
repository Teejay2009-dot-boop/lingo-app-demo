import React, { useState, useEffect } from "react";
import teacher from "../../assets/IMG-20250724-WA0123-removebg-preview.png";
import lessonData from '../../data/lesson.json'

export const VocabularyCard = ({ data, onAnswer, disabled, isAnswered }) => {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    // reset selection when question changes
    setSelected(null);
  }, [data]);

  const handleSelect = (option) => {
    if (disabled || selected) return;
    setSelected(option);
    const isCorrect = option === data.answer;
    onAnswer(isCorrect);
  };

  return (
    <div className="bg-gray-100 rounded-lg p-6 max-w-[700px] mx-auto text-center">
      <div className="flex items-center justify-between mb-4 border p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-bold">{data.question}</h2>
          <p>{}</p>
        </div>
        <img src={teacher} alt="Teacher" style={{ width: "7rem" }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.options.map((option, index) => {
          const isSelected = selected === option;
          const isCorrect = option === data.answer;

          let btnStyle = "border px-4 py-2 rounded transition";

          if (selected) {
            if (isSelected && isCorrect) {
              btnStyle += " border-green-500 bg-green-100";
            } else if (isSelected && !isCorrect) {
              btnStyle += " border-red-500 bg-red-100";
            } else {
              btnStyle += " border-gray-300 text-gray-400";
            }
          } else {
            btnStyle += " border-gray-300 hover:bg-gray-100";
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              className={btnStyle}
              disabled={disabled || !!selected}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};
