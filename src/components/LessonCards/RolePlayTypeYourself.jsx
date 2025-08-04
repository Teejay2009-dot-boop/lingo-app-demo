import React, { useState } from "react";

const RolePlayTypeYourself = ({ data, onAnswer, disabled, isAnswered }) => {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const checkCorrect = () => {
    const normalizedInput = input.trim().toLowerCase();
    const isCorrect = data.correct_answers.some(
      (ans) => ans.trim().toLowerCase() === normalizedInput
    );
    setSubmitted(true);
    onAnswer(isCorrect);
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-[700px] mx-auto text-center shadow-md">
      <h2 className="text-xl font-semibold mb-2">Role Play</h2>
      <p className="mb-4 italic">{data.scenario}</p>

      {data.character_image && (
        <img
          src={data.character_image}
          alt="Character"
          className="mx-auto mb-4 w-32 h-32 object-contain"
        />
      )}

      <input
        type="text"
        className="w-full border border-gray-300 px-4 py-2 mb-4 rounded"
        placeholder="Type your response..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={submitted || disabled}
      />

      <button
        onClick={checkCorrect}
        disabled={submitted || disabled || !input.trim()}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
      >
        Submit
      </button>

      {submitted && (
        <p
          className={`mt-4 font-semibold ${
            data.correct_answers.some(
              (ans) => ans.toLowerCase() === input.trim().toLowerCase()
            )
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {data.correct_answers.some(
            (ans) => ans.toLowerCase() === input.trim().toLowerCase()
          )
            ? "✅ Nice response!"
            : "❌ That wasn't quite right."}
        </p>
      )}
    </div>
  );
};

export default RolePlayTypeYourself;
