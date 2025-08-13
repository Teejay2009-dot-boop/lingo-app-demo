import React, { useState } from "react";
import "../styles/flashcards.css";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import NavBar from "../components/dashboard/NavBar";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa6";

const dummyCards = [
  { front: "Òpẹ́", back: "Palm tree" },
  { front: "Ẹ kú àárọ̀", back: "Good morning" },
  { front: "Ọmọ", back: "Child" },
  { front: "Ìwé", back: "Book" },
  { front: "Bàbá", back: "Father" },
  { front: "Ìyá", back: "Mother" },
];

const Flashcard = ({ front, back }) => {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className={`flashcard ${flipped ? "flipped" : ""}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="front">{front}</div>
      <div className="back">{back}</div>
    </div>
  );
};

const Flashcards = () => {
  const [page, setPage] = useState(0);
  const cardsPerPage = 3;
  const totalPages = Math.ceil(dummyCards.length / cardsPerPage);

  const startIndex = page * cardsPerPage;
  const currentCards = dummyCards.slice(startIndex, startIndex + cardsPerPage);

  return (
    <>
    <DashboardLayout>
        <NavBar/>
        <div className="flashcards-page pt-24 md:pt-10">
      <h2 className="text-center text-4xl text-amber font-semibold">Flashcard Practice</h2>
      <p className="text-md text-center p-3">Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusamus voluptates saepe aperiam, nisi dolor optio sit, neque rem veniam </p>
      <div className="flashcards grid lg:grid-cols-3 md:grid-cols-2">
        {currentCards.map((card, idx) => (
          <Flashcard key={idx} {...card} />
        ))}
      </div>

      <div className="flex justify-around ">
        <button className="px-6 py-2 bg-amber rounded-full text-white font-semibold hover:translate-y-[-2px] transition-transform duration-300 ease-in" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
          <FaArrowLeft/>
        </button>
        <button className="px-6 py-2 bg-amber rounded-full text-white font-semibold hover:translate-y-[-2px] transition-transform duration-300 ease-in"
          onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
          disabled={page === totalPages - 1}
        >
          <FaArrowRight/>
        </button>
      </div>
    </div>
    </DashboardLayout>
    </>
  );
};

export default Flashcards;
