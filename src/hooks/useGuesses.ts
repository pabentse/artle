import { useCallback, useState } from "react";
import { Guess, loadAllGuesses, saveGuesses } from "../domain/guess";

export function useGuesses(
  dayString: string,
  storageKey: string = "guesses_round1"
): [Guess[], (guess: Guess) => void, () => void] {
  const [guesses, setGuesses] = useState<Guess[]>(
    loadAllGuesses(storageKey)[dayString] ?? []
  );

  const resetGuesses = useCallback(() => {
    setGuesses([]);
    saveGuesses(dayString, [], storageKey); // Clear this round's entry
  }, [dayString, storageKey]);

  const addGuess = useCallback(
    (newGuess: Guess) => {
      const newGuesses = [...guesses, newGuess];

      setGuesses(newGuesses);
      saveGuesses(dayString, newGuesses, storageKey);

      console.log("Inside useGuesses, updated guesses:", newGuesses);
    },
    [dayString, guesses, storageKey]
  );

  return [guesses, addGuess, resetGuesses];
}
