import React from "react";
import "./YorubaVirtualKeyboard.css";

const YorubaVirtualKeyboard = ({ onKeyPress, disabled = false }) => {
  const yorubaCharacters = [
    // First row - Standard vowels with marks
    ["a", "e", "ẹ", "i", "o", "ọ", "u"],
    // Second row - Special characters
    ["ṣ", "gb", "ṣ", "ń", "ǹ", "ṅ", "ḿ"],
    // Third row - Standard consonants
    ["b", "d", "f", "g", "h", "j", "k", "l"],
    // Fourth row - More consonants
    ["m", "n", "p", "r", "s", "t", "w", "y"],
  ];

  const handleKeyClick = (char) => {
    if (!disabled) {
      onKeyPress(char);
    }
  };

  const handleSpecialAction = (action) => {
    if (!disabled) {
      onKeyPress(action);
    }
  };

  return (
    <div className="yoruba-keyboard">
      {/* Main character keys */}
      <div className="keyboard-row">
        {yorubaCharacters[0].map((char) => (
          <button
            key={char}
            className="keyboard-key"
            onClick={() => handleKeyClick(char)}
            disabled={disabled}
          >
            {char}
          </button>
        ))}
      </div>

      <div className="keyboard-row">
        {yorubaCharacters[1].map((char) => (
          <button
            key={char}
            className="keyboard-key special-key"
            onClick={() => handleKeyClick(char)}
            disabled={disabled}
          >
            {char}
          </button>
        ))}
      </div>

      <div className="keyboard-row">
        {yorubaCharacters[2].map((char) => (
          <button
            key={char}
            className="keyboard-key"
            onClick={() => handleKeyClick(char)}
            disabled={disabled}
          >
            {char}
          </button>
        ))}
      </div>

      <div className="keyboard-row">
        {yorubaCharacters[3].map((char) => (
          <button
            key={char}
            className="keyboard-key"
            onClick={() => handleKeyClick(char)}
            disabled={disabled}
          >
            {char}
          </button>
        ))}
      </div>

      {/* Action keys row */}
      <div className="keyboard-row action-keys">
        <button
          className="keyboard-key action-key space-key"
          onClick={() => handleKeyPress(" ")}
          disabled={disabled}
        >
          Space
        </button>
        <button
          className="keyboard-key action-key backspace-key"
          onClick={() => handleSpecialAction("backspace")}
          disabled={disabled}
        >
          ⌫
        </button>
        <button
          className="keyboard-key action-key clear-key"
          onClick={() => handleSpecialAction("clear")}
          disabled={disabled}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default YorubaVirtualKeyboard;
