import { DateTime, Interval } from "luxon";
import { useMemo } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { toast } from "react-toastify";
import { computeProximityPercent, generateSquareCharacters } from "../domain/geography";
import { Guess } from "../domain/guess";
import React from "react";
import { SettingsData } from "../hooks/useSettings";
import { Link } from "react-router-dom";
import { ShareProps } from "./Share";
import { useMetaRound } from "./MetaRoundContext";

const START_DATE = DateTime.fromISO("2023-02-24");

type NextRoundProps = ShareProps;

export function NextRound({ guesses, dayString, settingsData, hideImageMode, rotationMode }: NextRoundProps) {
  const { theme } = settingsData;

  const { currentMetaRound, setCurrentMetaRound } = useMetaRound();

  let nextRoundLink = "/round2";
  let buttonText = "Go to round 2!";

  const nextRoundText = useMemo(() => {
    const guessCount = guesses[guesses.length - 1]?.distance === 0 ? guesses.length : "X";
    const parsedDay = DateTime.fromFormat(dayString, "dd-MM-yyyy");
    const dayCount = Math.floor(Interval.fromDateTimes(START_DATE, parsedDay).length("day"));
    const difficultyModifierEmoji = hideImageMode ? " " : rotationMode ? " " : "";
    const title = `#Artle #${dayCount} ${guessCount}/6${difficultyModifierEmoji}`;

    const guessString = guesses
      .map((guess) => {
        const percent = computeProximityPercent(guess.distance);
        return generateSquareCharacters(percent, theme).join("");
      })
      .join("\n");

    return [title, guessString, "https://artle.eu"].join("\n");
    //return null;
  }, [dayString, guesses, hideImageMode, rotationMode, theme]);

  if (currentMetaRound === 2) {
    nextRoundLink = "/round3";
    buttonText = "Go to round 3!";
  }

  return (
    <Link to={nextRoundLink}>
      <button
        className="border-2 px-4 uppercase bg-blue-600 hover:bg-blue-400 active:bg-blue-700 text-white w-full"
        onClick={() => {
          // Advance to the next meta round
          setCurrentMetaRound(currentMetaRound + 1);
        }}
      >
        {buttonText}
      </button>
    </Link>
  );
}
