import { DateTime } from "luxon";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  countries,
  getCountryName,
  sanitizeCountryName,
  getMusemName,
  getCityName,
  getArtistName,
  getYear,
  getCountryCountry,
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
import { ScoreProvider, useScore } from "./ScoreContext";
import { MetaRoundProvider, useMetaRound } from "./MetaRoundContext";
import { Guess, saveGuesses } from "../domain/guess";

function getDayStringNew() {
  return DateTime.now().toFormat("dd-MM-yyyy");
}

const MAX_TRY_COUNT = 3; //Max number of guesses

interface GameProps {
  settingsData: SettingsData;
}

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

export function Game({ settingsData }: GameProps) {
  const navigate = useNavigate(); // Hook to navigate programmatically
  //const [currentMetaRound, setCurrentMetaRound] = useState(1); // Or whatever initial value you want

  const [currentGuessGlobal, setCurrentGuessGlobal] = useState("");
  const { i18n } = useTranslation();
  const dayStringNew = useMemo(getDayStringNew, []);
  const [isGuessCorrect, setIsGuessCorrect] = useState(false);

  const countryInputRef = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const [currentRound, setCurrentRound] = usePersistedState<number>(
    `currentRound-${today}`,
    MAX_TRY_COUNT - 1
  );

  const { currentMetaRound, setCurrentMetaRound } = useMetaRound();

  useEffect(() => {
    if (currentMetaRound > 1) {
      navigate(`/round${currentMetaRound}`);
    }
  }, [currentMetaRound, navigate]);

  const [country, randomAngle, imageScale] = useCountry(dayStringNew);

  const [currentGuess, setCurrentGuess] = useState("");

  const [guesses, addGuess] = useGuesses(dayStringNew, "guesses_round1");

  const [hideImageMode, setHideImageMode] = useMode(
    "hideImageMode",
    dayStringNew,
    settingsData.noImageMode
  );
  const [rotationMode, setRotationMode] = useMode(
    "rotationMode",
    dayStringNew,
    settingsData.rotationMode
  );

  useEffect(() => {
    const imageIndices: number[] = [5, 3, 0];
    for (const i of imageIndices) {
      const img: HTMLImageElement = new Image();
      img.src = `images/countries/${country.code.toLowerCase()}/vector${i}.png`;
    }
  }, [country.code]); // Now `country.code` is in dependency array

  // Using usePersistedState for isModalOpen to persist its state across sessions for the same day
  const [isModalOpen, setIsModalOpen] = usePersistedState<boolean>(
    `isModalOpen-${today}`,
    true // Default to true, can be set to false based on your game's logic
  );

  // assuming currentRound is of type number
  const roundToImageIndexMapping: { [key in number]: number } = {
    2: 5,
    1: 3,
    0: 0,
  };
  const imageIndex =
    roundToImageIndexMapping[
      currentRound as keyof typeof roundToImageIndexMapping
    ];
  const image = `images/countries/${country.code.toLowerCase()}/vector${imageIndex}.png`;
  //const image = `images/countries/${country.code.toLowerCase()}/vector${imageIndex}.png?${new Date().getTime()}`;

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
    guesses.length === MAX_TRY_COUNT ||
    //guesses[guesses.length - 1]?.distance === 0;
    guesses[guesses.length - 1]?.isCorrect === true;
  const [countryFeedback, setCountryFeedback] = useState<string | null>(null);
  const [centuryFeedback, setCenturyFeedback] = useState<string | null>(null);
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const guessedCountry = countries.find(
        (country) =>
          sanitizeCountryName(getArtistName(i18n.resolvedLanguage, country)) ===
          sanitizeCountryName(currentGuess)
      );
      if (guessedCountry == null) {
        //If the guess is wrong?
        toast.error("Unknown artist");
        //console.log("Unknown artist");
        return;
      }
      const isCorrect =
        getArtistName(i18n.resolvedLanguage, country) ===
        getArtistName(i18n.resolvedLanguage, guessedCountry);
      const isCorrectCountryValue =
        guessedCountry.country === getCountryCountry(country);
      const isCorrectCenturyValue =
        Math.floor(guessedCountry.year / 100) ===
        Math.floor(country.year / 100);

      const newGuess = {
        name: currentGuess,
        artist: getArtistName(i18n.resolvedLanguage, guessedCountry),
        distance: geolib.getDistance(guessedCountry, country),
        direction: geolib.getCompassDirection(guessedCountry, country),
        year: getYear(guessedCountry),
        isCorrect: isCorrect,
        isCorrectCentury: isCorrectCenturyValue,
        isCorrectCountry: isCorrectCountryValue,
        countryNew: guessedCountry.country,
      };

      addGuess(newGuess); // Use the addGuess function here

      setCurrentGuess("");

      if (isCorrect) {
        setIsGuessCorrect(true);
        setCurrentRound(0); //Jump to the last round (last image)
        toast.success("Well done!", { delay: 50 });
        setIsExploding(true);
        //we should now set the score, and it should give 3 points if the guess is correct on the first try, 2 on second, 1 on third
        setScore((prevScore) => prevScore + (MAX_TRY_COUNT - guesses.length));
      } else {
        setIsGuessCorrect(false);
        //console.log("Wrong guess");

        /* if (isCorrectCenturyValue) {
          setCenturyFeedback("Correct century!"); //this is currently not used
        } else {
          setCenturyFeedback(null);
        } */

        setCurrentRound((round) => Math.max(0, round - 1)); //Jump to the next round (next image)
      }
    },
    [
      addGuess,
      country,
      currentGuess,
      i18n.resolvedLanguage,
      setCurrentRound,
      setScore,
      guesses.length,
    ]
  );

  useEffect(() => {
    if (
      guesses.length === MAX_TRY_COUNT && //If length of guesses is 3
      //guesses[guesses.length - 1].distance > 0 //If the last guess is wrong?
      guesses[guesses.length - 1].isCorrect === false
    ) {
      toast.info(getArtistName(i18n.resolvedLanguage, country).toUpperCase(), {
        //If the last guess is wrong, show the correct answer
        autoClose: false,
        delay: 2000,
      });
    }
  }, [country, guesses, i18n.resolvedLanguage]);

  //console.log("currentRound is ", currentRound);
  //console.log("currentMetaRound is ", currentMetaRound);
  //console.log("score is", score);

  return (
    <div className="flex-grow flex flex-col mx-2">
      <div className="flex flex-row justify-between">
        <GuessRow
          centuryFeedback={centuryFeedback}
          countryFeedback={countryFeedback}
          settingsData={settingsData}
        />
      </div>
      {hideImageMode && !roundOneEnded && (
        <button
          className="border-2 uppercase my-2 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-slate-800 dark:active:bg-slate-700"
          type="button"
          onClick={() => setHideImageMode(false)}
        >
          {"Vis på kart"}
        </button>
      )}
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
              className={`max-h-52 m-auto transition-transform duration-700 ease-in ${
                hideImageMode && !roundOneEnded ? "h-0" : "h-full"
              } cursor-pointer`}
              alt="country to guess"
              src={image}
              onClick={() => setIsModalOpen(true)} //zoom
              style={{
                transition: "filter 0.5s ease-in-out",
              }}
            />
          )}
        </div>
      </div>
      {rotationMode && !hideImageMode && !roundOneEnded && (
        <button
          className="border-2 uppercase mb-2 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-slate-800 dark:active:bg-slate-700"
          type="button"
          onClick={() => setRotationMode(false)}
        >
          {"Ikke rotér"}
        </button>
      )}
      <Guesses
        rowCount={MAX_TRY_COUNT}
        guesses={guesses}
        settingsData={settingsData}
        countryInputRef={countryInputRef}
      />
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
            {
              <NextRound
                guesses={guesses}
                dayString={dayStringNew}
                settingsData={settingsData}
                hideImageMode={hideImageMode}
                rotationMode={rotationMode}
              />
            }
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <CountryInput
                inputRef={countryInputRef}
                currentGuess={currentGuess}
                setCurrentGuess={setCurrentGuess}
              />
              <button
                className="border-2 uppercase my-0.5 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-slate-800 dark:active:bg-slate-700"
                type="submit"
              >
                🎨 {"Guess"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
