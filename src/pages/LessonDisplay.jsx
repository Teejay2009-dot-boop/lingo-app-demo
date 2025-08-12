import React, { useEffect, useState } from "react";
import { VocabularyCard } from "../components/LessonCards/VocabularyCard";
import AudioChoiceCard from "../components/LessonCards/AudioChoiceCard";
import GoBackBtn from "../components/GoBackBtn";
import lessonData from "../data/lesson.json";
import { Link } from "react-router-dom";
import RolePlayTypeYourself from "../components/LessonCards/RolePlayTypeYourself";
import MatchImageToWord from "../components/LessonCards/MatchImageToWord";
import mascot from "../assets/IMG-20250724-WA0115-removebg-preview.png";
import { FaArrowAltCircleRight, FaArrowCircleLeft } from "react-icons/fa";
import { MainIdea } from "../components/LessonCards/MainIdea";
import { FillintheGapBestOption } from "../components/LessonCards/FillintheGapBestOption";
import { FillTheGap } from "../components/LessonCards/FillintheGap";
import MatchWords from "../components/LessonCards/MatchWords";
import TypeWhatYouHear from "../components/LessonCards/TypeWhatYouHear";
import RolePlayOptions from "../components/LessonCards/RolePlayOptions";
import { auth, db } from "../firebase/config/firebase";
import { doc, updateDoc, increment, getDoc } from "firebase/firestore";

const LessonDisplay = () => {
  const lesson = lessonData.lesson_1;
  const exercises = lesson.exercises;

  const baseXp = lesson.base_xp || 10;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(5);
  const [xp, setXp] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);
  const [answeredMap, setAnsweredMap] = useState({});

  const currentExercise = exercises[currentIndex];
  const progressPercent = Math.round((currentIndex / exercises.length) * 100);

  // Fetch lives + XP from Firestore on mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;
      const userRef = doc(db, "users", auth.currentUser.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        setLives(snap.data().lives ?? 5);
        setXp(snap.data().xp ?? 0);
      }
    };
    fetchUserData();
  }, []);

  // Handle correct/incorrect answer logic
  const handleAnswer = async (isCorrect) => {
    if (answeredMap[currentIndex]) return;

    setAnsweredMap((prev) => ({
      ...prev,
      [currentIndex]: { isCorrect },
    }));

    setShowModal(true);
    setLastAnswerCorrect(isCorrect);

    const userRef = doc(db, "users", auth.currentUser.uid);

    if (!isCorrect) {
      setLives((prev) => Math.max(0, prev - 1));
      await updateDoc(userRef, {
        lives: increment(-1),
      });
    } else {
      setXp((prev) => prev + baseXp);
      await updateDoc(userRef, {
        xp: increment(baseXp),
        coins: increment(5),
      });
    }
  };

  // Proceed to next question
  const handleNext = () => {
    setShowModal(false);
    setCurrentIndex((prev) => prev + 1);
    setLastAnswerCorrect(null);
  };

  // Render appropriate card
  const renderCard = () => {
    const isAnswered = answeredMap[currentIndex];
    const shouldDisable = showModal || !!isAnswered;

    const props = {
      data: currentExercise,
      onAnswer: handleAnswer,
      disabled: shouldDisable,
      isAnswered: isAnswered,
    };

    switch (currentExercise.type) {
      case "vocabulary":
        return <VocabularyCard {...props} />;
      case "tap_what_you_hear":
        return <AudioChoiceCard {...props} />;
      case "main_idea":
        return <MainIdea {...props} />;
      case "fill_gap_best_option":
        return <FillintheGapBestOption {...props} />;
      case "fill_the_gap":
        return <FillTheGap {...props} />;
      case "match_words":
        return <MatchWords {...props} />;
      case "type_what_you_hear":
        return <TypeWhatYouHear {...props} />;
      case "role_play_type_yourself":
        return <RolePlayTypeYourself {...props} />;
      case "match_image_to_word":
        return <MatchImageToWord {...props} />;
      case "role_play_options":
        return <RolePlayOptions {...props} />;
      default:
        return <p>Unsupported card type</p>;
    }
  };

  // Game Over
  if (lives <= 0) {
    return (
      <div className="p-6 h-screen flex flex-col items-center justify-center text-center">
        <img src={mascot} style={{ width: "10rem" }} alt="" />
        <h2 className="text-2xl font-bold mb-4">Game Over</h2>
        <p>You’ve lost all your lives! Come back tomorrow.</p>
        <Link to="/lessons/section/learn">
          <button className="bg-amber text-white font-semibold flex gap-4 items-center px-6 py-2 text-lg rounded-full my-3">
            <FaArrowCircleLeft style={{ fontSize: "1rem" }} /> Go Back
          </button>
        </Link>
      </div>
    );
  }

  // Lesson Completion
  const isLessonComplete = currentIndex >= exercises.length;
  if (isLessonComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-around px-3 text-center py-6">
        <img src={mascot} alt="Completed" className="w-28 mb-6" />
        <h2 className="text-3xl font-bold text-amber mb-3">
          Lesson Complete 🎉
        </h2>
        <div className="flex justify-center gap-10 rounded-full">
          <button className="py-7 px-4 border border-amber rounded-full flex flex-col gap-5">
            <p className="text-xl">Xp</p>
            <p>{getDoc(xp )}</p>
          </button>
          <button className="p-8 items-center border border-amber rounded-lg flex flex-col gap-5"><p className="text-xl">Coins</p></button>
          <button className="py-7 px-4 border border-amber rounded-md flex flex-col gap-5"><p className="text-xl">Lives Remaining</p></button>
        </div>
       <div className="flex justify-between gap-4">
         <Link to="/dashboard">
          <button className="mt-6 bg-amber text-white px-6 py-2 rounded-full hover:bg-amber-600 transition-all">
            Go to Dashboard
          </button>
        </Link>
         <Link to="/dashboard">
          <button className="mt-6 bg-amber text-white px-6 py-2 rounded-full hover:bg-amber-600 transition-all">
            Go to Shop
          </button>
        </Link>
       </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">
      <GoBackBtn />
      <div className="flex justify-between items-center pt-10 mb-4">
        <p className="font-semibold">❤ Lives: {lives}</p>
        <p className="font-semibold">XP: {xp}</p>
      </div>
      <div className="w-full bg-gray-300 h-2 rounded mb-4">
        <div
          className="bg-amber h-2 rounded transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      {renderCard()}
      <div className="flex justify-between mt-6 max-w-[700px] mx-auto">
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
          disabled={currentIndex === 0}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
        >
          <FaArrowCircleLeft /> Previous
        </button>
        <button
          onClick={() => setCurrentIndex((prev) => prev + 1)}
          disabled={currentIndex >= exercises.length}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          <FaArrowAltCircleRight /> Skip
        </button>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div
            className={`p-6 rounded-lg shadow-md text-center w-11/12 max-w-md border ${
              lastAnswerCorrect
                ? "bg-green-300 border-green-500"
                : "bg-red-300 border-red-500"
            }`}
          >
            <h2
              className={`text-2xl font-bold mb-4 ${
                lastAnswerCorrect ? "text-green-600" : "text-red-600"
              }`}
            >
              {lastAnswerCorrect ? "✔ Correct" : "❌ Incorrect!"}
            </h2>
            <button
              onClick={handleNext}
              className={`px-6 py-2 mt-4 rounded text-white shadow-lg transition duration-300 ${
                lastAnswerCorrect
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonDisplay;
