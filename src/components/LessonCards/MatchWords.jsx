import React, { useState, useEffect } from 'react';

const shuffle = (array) =>
  [...array]
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

const MatchWords = ({ data, onAnswer, disabled }) => {
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [rightOptions, setRightOptions] = useState(() =>
    shuffle(data.pairs.map((pair) => pair[1]))
  );
  const [showModal, setShowModal] = useState(false);

  const leftItems = data.pairs.map(([left]) => left);

  const isMatched = (word) =>
    matchedPairs.some(([l, r]) => l === word || r === word);

  const handleSelect = (side, word) => {
    if (disabled || isMatched(word)) return;

    if (side === 'left') {
      setSelectedLeft(word);
    } else {
      setSelectedRight(word);
    }
  };

  useEffect(() => {
    if (selectedLeft && selectedRight) {
      const isCorrect = data.pairs.some(
        ([l, r]) => l === selectedLeft && r === selectedRight
      );

      if (isCorrect) {
        setMatchedPairs((prev) => [...prev, [selectedLeft, selectedRight]]);
      }

      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 300);
    }
  }, [selectedLeft, selectedRight, data.pairs]);

  useEffect(() => {
    if (matchedPairs.length === data.pairs.length) {
      setTimeout(() => setShowModal(true), 300);
    }
  }, [matchedPairs, data.pairs.length]);

  const handleContinue = () => {
    setShowModal(false);
    onAnswer(true); // tell parent the card is complete
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-[700px] mx-auto text-center border shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Match the words</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Left column */}
        <div className="flex flex-col gap-3">
          {leftItems.map((word, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect('left', word)}
              className={`px-4 py-2 rounded border text-black font-medium ${
                isMatched(word)
                  ? 'bg-green-100 border-green-500'
                  : selectedLeft === word
                  ? 'bg-yellow-100 border-yellow-500'
                  : 'bg-white border-gray-300 hover:bg-gray-100'
              }`}
            >
              {word}
            </button>
          ))}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-3">
          {rightOptions.map((word, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect('right', word)}
              className={`px-4 py-2 rounded border text-black font-medium ${
                isMatched(word)
                  ? 'bg-green-100 border-green-500'
                  : selectedRight === word
                  ? 'bg-yellow-100 border-yellow-500'
                  : 'bg-white border-gray-300 hover:bg-gray-100'
              }`}
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {/* Modal on Complete */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-green-300 border border-green-500 p-6 rounded-lg shadow-md text-center w-11/12 max-w-md">
            <h2 className="text-2xl font-bold text-green-600 mb-4">✅ All matched!</h2>
            <button
              onClick={handleContinue}
              className="bg-green-600 text-white px-6 py-2 mt-4 rounded hover:bg-green-700 transition"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchWords;
