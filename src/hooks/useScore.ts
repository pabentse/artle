import { useEffect, useState } from "react";

// Function to save the score to local storage
const saveScore = (dayString: string, score: number) => {
  const allScores = loadAllScores();
  allScores[dayString] = score;
  localStorage.setItem("scores", JSON.stringify(allScores));
};

// Function to load all scores from local storage
const loadAllScores = (): { [key: string]: number } => {
  const scoresString = localStorage.getItem("scores");
  return scoresString ? JSON.parse(scoresString) : {};
};

export function useScore(
  dayString: string
): [number, (newScore: number) => void] {
  // Load the score for the current day from local storage
  const [score, setScore] = useState<number>(loadAllScores()[dayString] ?? 0);

  // Save the score whenever it changes
  useEffect(() => {
    saveScore(dayString, score);
  }, [dayString, score]);

  // Function to update the score
  const updateScore = (newScore: number) => {
    setScore(newScore);
  };

  return [score, updateScore];
}
