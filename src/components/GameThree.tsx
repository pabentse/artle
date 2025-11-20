import { DateTime } from "luxon";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import {
  countries,
  getCountryName,
  sanitizeCountryName,
  getMusemName,
  getCityName,
  getArtistName,
  getYear,
  getCountryCountry,
  getAttributes,
  Country,
} from "../domain/countries";
import { useGuesses } from "../hooks/useGuesses";
import { CountryInput } from "./CountryInput";
import * as geolib from "geolib";
import { Share } from "./Share";
import { Guesses } from "./Guesses";
import { useTranslation } from "react-i18next";
import { SettingsData } from "../hooks/useSettings";
import { useMode } from "../hooks/useMode";
import { useCountry } from "../hooks/useCountry";
import Modal from "./Modal";
import { GuessRow } from "./GuessRow";
import ConfettiExplosion from "confetti-explosion-react";
import { NextRound } from "./NextRound";
import seedrandom from "seedrandom";
import { get } from "http";
import { ScoreProvider, useScore } from "./ScoreContext";
import { useMetaRound } from "./MetaRoundContext";
import { useNavigate } from "react-router-dom";
import { AdUnit } from "./AdUnit";

function getDayString() {
  return DateTime.now().toFormat("yyyy-MM-dd");
}

function getDayStringNew() {
  return DateTime.now().toFormat("dd-MM-yyyy");
}

interface GameProps {
  settingsData: SettingsData;
}
const seed = new Date().getDate(); // Using the day of the month as the seed
const rng = seedrandom(seed.toString());

const usePersistedState = <T,>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    try {
      const savedState = window.localStorage.getItem(key);
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (err) {
      // If the JSON is malformed or it's an empty document it will fall in this block
      console.error(
        `Error parsing state for key "${key}" from localstorage`,
        err
      );
    }
    return defaultValue; // If no valid data was found, return the default value
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};

export function GameThree({ settingsData }: GameProps) {
  const { currentMetaRound } = useMetaRound();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const dayString = useMemo(getDayString, []);
  const dayStringNew = useMemo(getDayStringNew, []);
  const [isGuessCorrect, setIsGuessCorrect] = useState(false);
  const MAX_TRY_COUNT = 1; //Max number of guesses

  //create a local score state, which is set to 0
  const [localScore, setLocalScore] = useState(0);

  const countryInputRef = useRef<HTMLInputElement>(null);
  //const [currentRoundInThree, setcurrentRoundInThree] = useState(MAX_TRY_COUNT - 1);
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const [gameLocked, setGameLocked] = useState(false);
  const [currentRoundInThree, setcurrentRoundInThree] =
    usePersistedState<number>(`currentRoundInThree-${today}`, MAX_TRY_COUNT);

  useEffect(() => {
    // Reset the currentRoundInThree to MAX_TRY_COUNT when a new game round begins
    setcurrentRoundInThree(MAX_TRY_COUNT);
    // Unlock the game for the new round
    setGameLocked(false);
  }, [currentMetaRound, setcurrentRoundInThree]);

  /* console.log("currentRoundInThree in beginning", currentRoundInThree);
  console.log("currentMetaRound in beginning", currentMetaRound);
  console.log("gameLocked in beginning", gameLocked); */

  const [country, randomAngle, imageScale] = useCountry(dayStringNew);
  const [guesses, addGuess, resetGuesses] = useGuesses(
    dayStringNew,
    "guesses_round3"
  );

  const correctAttributes = getAttributes(country);
  const [attributeOptions, setAttributeOptions] = useState<string[]>([]);
  useEffect(() => {
    const exceptionalTerms = ["Art", "Feminist", "Pop", "Abstract"]; // Add terms that should be exceptions

    const shouldExclude = (
      attribute: string,
      correctAttribute: string
    ): boolean => {
      const attributeTokens = attribute.split(" ");
      const correctAttributeTokens = correctAttribute.split(" ");

      for (const token of attributeTokens) {
        // Check if the token is an exceptional term
        if (exceptionalTerms.includes(token)) {
          continue;
        }

        // If token is in correctAttributeTokens but isn't a special term like "Post-Modernism"
        if (correctAttributeTokens.includes(token) && !token.includes("-")) {
          return true;
        }
      }
      return false;
    };
    function getRandomAttributes(
      excludedAttributes: string[],
      count: number,
      allCountries: Country[]
    ): string[] {
      const chosenAttributes = new Set<string>();

      while (chosenAttributes.size < count) {
        const randomCountry =
          allCountries[Math.floor(rng() * allCountries.length)];
        const attributesForRandomCountry = getAttributes(randomCountry);

        // Filter out excluded attributes and already chosen attributes
        const possibleAttributes = attributesForRandomCountry.filter((attr) => {
          return (
            !excludedAttributes.includes(attr) && // Check if it's not an excluded attribute
            !chosenAttributes.has(attr) // Check if it hasn't been chosen already
          );
        });

        // We use a random index to get a random attribute from the filtered list
        if (possibleAttributes.length > 0) {
          const randomIndex = Math.floor(rng() * possibleAttributes.length);
          const randomAttribute = possibleAttributes[randomIndex];

          chosenAttributes.add(randomAttribute);
        }
      }

      return Array.from(chosenAttributes);
    }

    const randomAttributeOptions = getRandomAttributes(
      correctAttributes,
      5,
      countries
    );

    //const shuffled = shuffleArray([...correctAttributes]); //dette er kode fra da vi brukte 2 riktige attributter
    //const chosenCorrectAttributes = shuffled.slice(0, 2);  //dette er kode fra da vi brukte 2 riktige attributter

    const chosenCorrectAttributes = correctAttributes[0];

    const allAttributeOptions = [
      ...randomAttributeOptions,
      chosenCorrectAttributes,
    ];

    const shuffledAttributeOptions = shuffleArray(allAttributeOptions);
    setAttributeOptions(shuffledAttributeOptions);
  }, [country, correctAttributes]);

  const [hideImageMode, setHideImageMode] = useMode(
    "hideImageMode",
    dayStringNew,
    settingsData.noImageMode
  );
  const [rotationMode, setRotationMode] = useMode(
    "rotationMode",
    dayString,
    settingsData.rotationMode
  );

  useEffect(() => {
    const imageIndices: number[] = [5, 3, 0];
    for (const i of imageIndices) {
      const img: HTMLImageElement = new Image();
      img.src = `images/countries/${country.code.toLowerCase()}/vector${i}.png`;
    }
  }, [country.code]); // Now `country.code` is in dependency array
  useEffect(() => {
    if (currentRoundInThree <= 0) {
      // Logic for end of round
      toast.info("Round over! Correct answers are highlighted.", {
        delay: 100,
      });
      // Lock the game
      setGameLocked(true);
    }
  }, [currentRoundInThree]);

  // Gate access based on meta round
  useEffect(() => {
    if (currentMetaRound < 3) {
      navigate(currentMetaRound === 1 ? "/" : "/round2");
    }
  }, [currentMetaRound, navigate]);

  // Using usePersistedState for isModalOpen to persist its state across sessions for the same day
  const [isModalOpen, setIsModalOpen] = usePersistedState<boolean>(
    `isModalOpen-${today}`,
    true // Default to true, can be set to false based on your game's logic
  );

  const getButtonStyle = (attribute: string) => {
    const guess = guessedAttributes.find((g) => g.attribute === attribute);

    if (guess) {
      if (guess.isCorrect) {
        return "bg-green-500 hover:bg-green-500";
      } else {
        return "bg-red-500 hover:bg-red-500";
      }
    } else if (
      currentRoundInThree === 0 &&
      correctAttributes.includes(attribute)
    ) {
      return "bg-green-200 hover:bg-green-200";
    } else {
      return "bg-opacity-0 hover:bg-gray-500";
    }
  };

  type GuessedAttribute = {
    attribute: string;
    isCorrect: boolean;
  };
  const [guessedAttributes, setGuessedAttributes] = useState<
    GuessedAttribute[]
  >([]);

  // Rehydrate round 3 selection on reload so UI shows chosen option and correctness
  useEffect(() => {
    const storageKey = `round3_attributes_${dayStringNew}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as GuessedAttribute[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setGuessedAttributes(parsed);
          setcurrentRoundInThree(0);
          setGameLocked(true);
        }
      } catch {
        // ignore
      }
    }
  }, [dayStringNew, setcurrentRoundInThree]);

  const image = `images/countries/${country.code.toLowerCase()}/vector0.png`;

  const { score, setScore } = useScore(); // Get the score from the context (global score)

  const [isExploding, setIsExploding] = React.useState(false); //For confetti

  useEffect(() => {
    if (isExploding) {
      const timer = setTimeout(() => {
        setIsExploding(false);
      }, 6000); // adjust the delay as needed
      return () => clearTimeout(timer);
    }
  }, [isExploding]);

  const roundOneEnded =
    guessedAttributes.length === 1 || //or
    guesses[guesses.length - 1]?.isCorrect === true;

  useEffect(() => {
    if (!roundOneEnded) {
      return;
    }

    const storageKey = `songcloud-toast-${dayStringNew}`;
    const alreadyShown = (() => {
      try {
        return window.localStorage.getItem(storageKey);
      } catch {
        return null;
      }
    })();

    if (alreadyShown) {
      return;
    }

    const timer = window.setTimeout(() => {
      toast.info(
        <a
          className="underline"
          href="https://songcloud.eu"
          target="_blank"
          rel="noopener noreferrer"
        >
          Like music too? Try SongCloud
        </a>,
        {
          autoClose: 6000,
          closeOnClick: true,
        }
      );
      try {
        window.localStorage.setItem(storageKey, "shown");
      } catch {
        // ignore write failures
      }
    }, 5000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [roundOneEnded, dayStringNew]);

  function shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const handleAttributeGuess = (guessedAttribute: string) => {
    const isCorrect = correctAttributes.includes(guessedAttribute);

    console.log("localScore is", localScore);
    if (isCorrect) {
      // Increase the local score by 1
      setLocalScore((prevLocalScore) => prevLocalScore + 1);
      // Increase the global score by 1
      setScore(score + 1); // Increase the score by 1
    }

    const next = [
      ...guessedAttributes,
      { attribute: guessedAttribute, isCorrect },
    ];
    setGuessedAttributes(next);
    try {
      localStorage.setItem(
        `round3_attributes_${dayStringNew}`,
        JSON.stringify(next)
      );
    } catch {}

    setcurrentRoundInThree(currentRoundInThree - 1);
  };

  useEffect(() => {
    if (
      guesses.length === MAX_TRY_COUNT && //If length of guesses is 6
      guesses[guesses.length - 1].distance > 0 //If the last guess is wrong?
    ) {
      toast.info(getArtistName(i18n.resolvedLanguage, country).toUpperCase(), {
        //If the last guess is wrong, show the correct answer
        autoClose: false,
        delay: 2000,
      });
    }
  }, [country, guesses, i18n.resolvedLanguage]);

  console.log("score is", score);
  console.log("roundoneended is", roundOneEnded);
  console.log("isExploding is", isExploding);

  if (localScore === 1) {
    //set is exploding to true useState
    setIsExploding(true); //For confetti
    console.log("isExploding should now be true", isExploding);
    setLocalScore(0); //Reset local score to 0
  }

  return (
    <div className="flex-grow flex flex-col mx-2">
      <div className="flex flex-row justify-between">
        <GuessRow settingsData={settingsData} />
      </div>

      <div className="my-1">
        <div className="my-1">
          {isModalOpen ? (
            <Modal
              active={isModalOpen}
              image={image}
              onClose={() => setIsModalOpen(false)}
            />
          ) : (
            <img
              className={`max-h-52 m-auto transition-transform duration-700 ease-in cursor-pointer`}
              alt="country to guess"
              src={image}
              onClick={() => setIsModalOpen(true)}
              style={{
                transition: "filter 0.5s ease-in-out",
              }}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1">
        {attributeOptions.map((attribute, index) => (
          <button
            key={index}
            className={`border-2 uppercase m-2 ${getButtonStyle(attribute)}`}
            onClick={() => handleAttributeGuess(attribute)}
            disabled={gameLocked} // Disable the button when the game is locked
          >
            {attribute}
          </button>
        ))}
      </div>
      <div className="my-2">
        {roundOneEnded ? (
          <>
            {isExploding && (
              <div className="confetti-container">
                {
                  <ConfettiExplosion
                    force={1}
                    duration={3500}
                    particleCount={120}
                    width={2000}
                    height={800}
                  />
                }
              </div>
            )}
            <Share
              guesses={guesses}
              dayString={dayString}
              settingsData={settingsData}
              hideImageMode={hideImageMode}
              rotationMode={rotationMode}
            />
          <AdUnit slot="3589348108" />
          </>
        ) : null}
      </div>
    </div>
  );
}
