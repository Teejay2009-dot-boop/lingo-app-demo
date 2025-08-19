import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { BiComment } from "react-icons/bi";

export const Dropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const links = [
    { name: "Achievements", path: "/achievements" },
    { name: "Leaderboard", path: "/leaderboard" },
    { name: "Study Groups", path: "/groups" },
    { name: "Resources", path: "/resources" },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        className="flex items-center text-white"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
      >
      <div className="flex items-center gap-3">
        <BiComment/>  More
      </div>
        <svg
          className={`w-4 h-4 ml-1 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute ml-16 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100"
          onMouseLeave={() => setIsOpen(false)}
        >
          {links.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              className="block px-4 py-2 text-gray-700 hover:bg-amber-50 hover:bg-gray-50"
              onClick={(e) => {
                e.stopPropagation(); // Prevent dropdown from closing
                setIsOpen(false); // Close after navigation
              }}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
