import React, { useState, useEffect } from "react";

const AudioChoiceCard = ({ data, onAnswer, disabled, isAnswered }) => {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setSelected(null);
  }, [data]);

  const handlePlayAudio = () => {
    const audio = new Audio(data.audio_path);
    audio.play();
  };

  const handleSelect = (option) => {
    if (disabled || selected) return;
    setSelected(option);
    const isCorrect = option === data.correct_answer;
    onAnswer(isCorrect);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow max-w-[700px] mx-auto text-center">
      <h2 className="text-xl font-semibold mb-4">🎧 Tap the audio and choose</h2>

      <button
        onClick={handlePlayAudio}
        className="border border-amber rounded-2xl px-20 lg:px-28 py-16 text-black mb-6 cursor-pointer transition"
        disabled={disabled}
      >
        🔊 Play Audio
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.options.map((option, index) => {
          const isSelected = selected === option;
          const isCorrect = option === data.correct_answer;

          let btnStyle = "rounded-lg hover:translate-y-[3px] ease-in duration-300 transition border px-4 py-2 rounded transition";

          if (selected) {
            if (isSelected && isCorrect) {
              btnStyle += " border-green-500 bg-green-100";
            } else if (isSelected && !isCorrect) {
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

export default AudioChoiceCard;
