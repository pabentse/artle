import { Direction } from "./geography";

export interface Guess {
  name: string;
  distance: number;
  direction?: Direction;
  year: number;
  isCorrect?: boolean;
  isCorrectCountry?: boolean;
  isCorrectCentury?: boolean;
  countryNew?: string;
  attribute?: string;
}

export function loadAllGuesses(storageKey: string = "guesses_round1"): Record<string, Guess[]> {
  const storedGuesses = localStorage.getItem(storageKey);
  return storedGuesses != null ? JSON.parse(storedGuesses) : {};
}

export function saveGuesses(
  dayStringNew: string,
  guesses: Guess[],
  storageKey: string = "guesses_round1"
): void {
  const allGuesses = loadAllGuesses(storageKey);
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      ...allGuesses,
      [dayStringNew]: guesses,
    })
  );
}
