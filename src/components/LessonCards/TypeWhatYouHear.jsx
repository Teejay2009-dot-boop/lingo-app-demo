import React, { useState, useRef } from "react";

const TypeWhatYouHear = ({ data, onAnswer, disabled, isAnswered }) => {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const audioRef = useRef(null);

  const handleSubmit = () => {
    if (submitted || disabled) return;

    const isCorrect = input.trim().toLowerCase() === data.correct_answer.trim().toLowerCase();
    setSubmitted(true);
    onAnswer(isCorrect);
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-[700px] mx-auto text-center shadow-md">
      <h2 className="text-xl font-semibold mb-4">Type What You Hear</h2>

      <button
        onClick={() => audioRef.current && audioRef.current.play()}
        className="border border-amber rounded-2xl px-20 lg:px-28 py-16 text-black mb-6 cursor-pointer transition"
        disabled={disabled}
      >
        🔊 Play Audio
      </button>
      <audio ref={audioRef} src={data.audio_path}></audio>

      <input
        type="text"
        className="w-full border border-gray-300 rounded px-4 py-2 mb-4"
        placeholder="Type your answer..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={submitted || disabled}
      />

      <button
        onClick={handleSubmit}
        disabled={submitted || disabled || input.trim() === ""}
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
      >
        Submit
      </button>

      {submitted && (
        <p
          className={`mt-4 text-lg font-semibold ${
            input.trim().toLowerCase() === data.correct_answer.trim().toLowerCase()
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {/* {input.trim().toLowerCase() === data.correct_answer.trim().toLowerCase()
            ? "✅ Correct!"
            : `❌ Incorrect! Answer: ${data.correct_answer}`} */}
        </p>
      )}
    </div>
  );
};

export default TypeWhatYouHear;
