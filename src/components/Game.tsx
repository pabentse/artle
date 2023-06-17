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
import ConfettiExplosion from "react-confetti-explosion";

function getDayString() {
  return DateTime.now().toFormat("yyyy-MM-dd");
}

function getDayStringNew() {
  return DateTime.now().toFormat("dd-MM-yyyy");
}

const MAX_TRY_COUNT = 6;

interface GameProps {
  settingsData: SettingsData;
}

export function Game({ settingsData }: GameProps) {
  const { i18n } = useTranslation();
  const dayString = useMemo(getDayString, []);
  const dayStringNew = useMemo(getDayStringNew, []);

  const countryInputRef = useRef<HTMLInputElement>(null);

  const [country, randomAngle, imageScale] = useCountry(dayStringNew);

  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, addGuess] = useGuesses(dayStringNew);
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

  const [isExploding, setIsExploding] = React.useState(false);

  useEffect(() => {
    if (isExploding) {
      const timer = setTimeout(() => {
        setIsExploding(false);
      }, 3000); // adjust the delay as needed
      return () => clearTimeout(timer);
    }
  }, [isExploding]);

  const gameEnded =
    guesses.length === MAX_TRY_COUNT ||
    guesses[guesses.length - 1]?.distance === 0;

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const guessedCountry = countries.find(
        (country) =>
          sanitizeCountryName(getArtistName(i18n.resolvedLanguage, country)) ===
          sanitizeCountryName(currentGuess)
      );

      if (guessedCountry == null) {
        toast.error("Unknown artist");
        return;
      }

      const newGuess = {
        name: currentGuess,
        artist: getArtistName(i18n.resolvedLanguage, guessedCountry),
        distance: geolib.getDistance(guessedCountry, country),
        direction: geolib.getCompassDirection(guessedCountry, country),
      };

      addGuess(newGuess);
      setCurrentGuess("");
      if (newGuess.artist === getArtistName(i18n.resolvedLanguage, country)) {
        //^Denne har jeg endret fra newGuess.country til newGuess.artist
        toast.success("Well done!", { delay: 2000 });
        setIsExploding(true);
      }
    },
    [addGuess, country, currentGuess, i18n.resolvedLanguage]
  );

  useEffect(() => {
    if (
      guesses.length === MAX_TRY_COUNT &&
      guesses[guesses.length - 1].distance > 0
    ) {
      toast.info(getCountryName(i18n.resolvedLanguage, country).toUpperCase(), {
        autoClose: false,
        delay: 2000,
      });
    }
  }, [country, guesses, i18n.resolvedLanguage]);

  return (
    <div className="flex-grow flex flex-col mx-2">
      {hideImageMode && !gameEnded && (
        <button
          className="border-2 uppercase my-2 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-slate-800 dark:active:bg-slate-700"
          type="button"
          onClick={() => setHideImageMode(false)}
        >
          {"Vis på kart"}
        </button>
      )}
      <div className="my-1">
        <img
          className={`max-h-52 m-auto transition-transform duration-700 ease-in ${
            hideImageMode && !gameEnded ? "h-0" : "h-full"
          }`}
          alt="country to guess"
          src={`images/countries/${country.code.toLowerCase()}/vector.png`}
          style={
            rotationMode && !gameEnded
              ? {
                  transform: `rotate(${randomAngle}deg) scale(${imageScale})`,
                }
              : {}
          }
        />
      </div>
      {rotationMode && !hideImageMode && !gameEnded && (
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
        {gameEnded ? (
          <>
            {isExploding && (
              <div className="confetti-container">
                <ConfettiExplosion
                  force={0.8}
                  duration={3000}
                  particleCount={300} //400 lagger litt, 300 er bra
                  width={1600}
                />
              </div>
            )}
            <Share
              guesses={guesses}
              dayString={dayString}
              settingsData={settingsData}
              hideImageMode={hideImageMode}
              rotationMode={rotationMode}
            />
            <a
              className="underline w-full text-center block mt-4"
              href={`https://www.google.com/maps?q=${getMusemName(
                i18n.resolvedLanguage,
                country
              )},%20${getCityName(i18n.resolvedLanguage, country)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {"Show on Google Maps"}
            </a>
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
