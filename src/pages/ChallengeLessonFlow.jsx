import React, { useState } from "react";
import { VocabularyCard } from "../components/LessonCards/VocabularyCard";
import { FillTheGap } from "../components/LessonCards/FillintheGap";
import { FillintheGapBestOption } from "../components/LessonCards/FillintheGapBestOption";
import { MainIdea } from "../components/LessonCards/MainIdea";
import MatchImageToWord from "../components/LessonCards/MatchImageToWord";
import MatchWords from "../components/LessonCards/MatchWords";
import RolePlayOptions from "../components/LessonCards/RolePlayOptions";
import RolePlayTypeYourself from "../components/LessonCards/RolePlayTypeYourself";
import TypeWhatYouHear from "../components/LessonCards/TypeWhatYouHear";
import AudioChoiceCard from "../components/LessonCards/AudioChoiceCard";

const componentMap = {
  vocabulary: VocabularyCard,
  fill_the_gap: FillTheGap,
  fill_gap_best_option: FillintheGapBestOption,
  main_idea: MainIdea,
  match_image_to_word: MatchImageToWord,
  match_words: MatchWords,
  role_play_options: RolePlayOptions,
  role_play_type_yourself: RolePlayTypeYourself,
  type_what_you_hear: TypeWhatYouHear,
  audio_choice: AudioChoiceCard,
};

export default function ChallengeLessonFlow({ exercises, timeLeft, onFinish }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);

  React.useEffect(() => {
    if (timeLeft === 0) {
      onFinish();
    }
  }, [timeLeft, onFinish]);

  if (!exercises || exercises.length === 0) return <div>No exercises found.</div>;

  const currentExercise = exercises[currentIdx];
  const ExerciseComponent = componentMap[currentExercise.type];

  const handleAnswer = (isCorrect) => {
    setAnswers((prev) => [...prev, isCorrect]);
    if (currentIdx < exercises.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      onFinish();
    }
  };

  return (
    <div>
      <div className="mb-6">
        <span className="font-semibold">Question {currentIdx + 1} of {exercises.length}</span>
      </div>
      {ExerciseComponent ? (
        <ExerciseComponent
          data={currentExercise}
          onAnswer={handleAnswer}
          disabled={timeLeft === 0}
          isAnswered={answers.length > currentIdx}
        />
      ) : (
        <div>Unknown exercise type: {currentExercise.type}</div>
      )}
    </div>
  );
}