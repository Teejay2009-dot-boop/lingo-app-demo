import { useState } from "react";
import teacher from '../../assets/IMG-20250724-WA0123-removebg-preview.png'

export const MainIdea = ({ data, onAnswer, disabled, isAnswered }) => {
  const [selected, setSelected] = useState(null);

  const handleSelect = (option) => {
    if (disabled || selected) return;
    setSelected(option);
    onAnswer(option === data.answer);
  };

  return (
    <div className="bg-gray-100 rounded-lg p-6 max-w-[700px] mx-auto text-center">
      <h2 className="text-2xl font-bold">{data.question}</h2>
      <div className="flex items-center gap-5 lg:gap-10 justify-between mb-4 border p-6 rounded-2xl">
        <div>
          
          <p className="font-semibold">{data.composition}</p>
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
