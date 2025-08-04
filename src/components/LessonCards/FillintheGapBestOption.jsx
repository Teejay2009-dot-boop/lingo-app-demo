import React, { useState } from "react";

export const FillintheGapBestOption = ({
  data,
  onAnswer,
  disabled,
  isAnswered,
}) => {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (option) => {
    if (submitted || disabled) return;

    setSelected(option);
    const isCorrect = option === data.correct_answer;
    onAnswer(isCorrect);
    setSubmitted(true);
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-[700px] mx-auto text-center shadow-md">
      <h2 className="text-xl font-semibold mb-4">Choose the Best Word</h2>

      <p className="text-lg font-medium mb-4">
        {data.sentence_parts.map((part, idx) =>
          idx === data.gap_index ? (
            <span key={idx} className="mx-1 font-bold text-blue-600">
              _____
            </span>
          ) : (
            <span key={idx} className="mx-1">
              {part}
            </span>
          )
        )}
      </p>

      {/* Hint */}
      {data.hint && (
        <p className="text-sm text-gray-500 mb-4 italic">Hint: {data.hint}</p>
      )}

      <div className="grid grid-cols-2 gap-4 justify-center">
        {data.options.map((option, index) => {
          let style = "px-4 py-2 rounded border transition ";

          if (submitted) {
            if (option === data.correct_answer) {
              style += "bg-green-200 border-green-500 text-green-800";
            } else if (selected === option) {
              style += "bg-red-200 border-red-500 text-red-800";
            } else {
              style += "bg-gray-100 border-gray-300 text-gray-400";
            }
          } else {
            style += "hover:bg-gray-100 border-gray-300";
          }

          return (
            <button
              key={index}
              className={style}
              onClick={() => handleSelect(option)}
              disabled={submitted || disabled}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {submitted && (
        <p
          className={`mt-4 text-lg font-semibold ${
            selected === data.correct_answer ? "text-green-600" : "text-red-600"
          }`}
        >
          {selected === data.correct_answer
            ? "✅ Correct!"
            : `❌ Wrong! Answer: ${data.correct_answer}`}
        </p>
      )}
    </div>
  );
};
