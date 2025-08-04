import React, { useState } from "react";

export const FillTheGap = ({ data, onAnswer, disabled, isAnswered }) => {
  const [input, setInput] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const isCorrect = input.trim().toLowerCase() === data.answer.toLowerCase();

  const handleSubmit = () => {
    if (hasSubmitted || disabled || !input.trim()) return;
    setHasSubmitted(true);
    onAnswer(isCorrect);
  };

  const playAudio = () => {
    if (data.audio_path) {
      const audio = new Audio(data.audio_path);
      audio.play();
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-[700px] mx-auto text-center shadow-md">
      <h2 className="text-xl font-semibold mb-4">Fill in the Gap</h2>

      {/* Audio playback */}
      {data.audio_path && (
        <button
          onClick={playAudio}
          className="border border-amber rounded-2xl px-28 py-16 text-black mb-6 cursor-pointer transition"
        >
          🔊 Play Audio
        </button>
      )}

      {/* Sentence Display */}
      <div className="text-lg font-medium mb-6">
        {data.sentence_parts.map((part, idx) =>
          idx === data.gap_index ? (
            <input
              key={idx}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={hasSubmitted || disabled}
              className="mx-2 px-2 py-1 border border-gray-400 rounded w-32 text-center"
              placeholder="___"
            />
          ) : (
            <span key={idx} className="mx-1">
              {part}
            </span>
          )
        )}
      </div>

      {/* Hint (optional) */}
      {data.hint && (
        <p className="text-sm text-gray-500 mb-4 italic">Hint: {data.hint}</p>
      )}

      {/* Submit button */}
      {!hasSubmitted && !disabled && (
        <button
          onClick={handleSubmit}
          className="bg-amber text-white px-5 py-2 rounded-full hover:bg-amber-600 transition"
        >
          Submit
        </button>
      )}

      {/* Feedback */}
      {hasSubmitted && (
        <p
          className={`mt-4 font-semibold text-lg ${
            isCorrect ? "text-green-600" : "text-red-600"
          }`}
        >
          {isCorrect ? "✅ Correct!" : `❌ Wrong! Correct: ${data.answer}`}
        </p>
      )}
    </div>
  );
};
