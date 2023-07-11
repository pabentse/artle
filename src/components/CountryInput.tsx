import React, { useState } from "react";
import Autosuggest from "react-autosuggest";
import { useTranslation } from "react-i18next";
import {
  countries,
  getCountryName,
  sanitizeCountryName,
  getArtistName,
} from "../domain/countries";

interface CountryInputProps {
  inputRef: React.RefObject<HTMLInputElement>;
  currentGuess: string;
  setCurrentGuess: (guess: string) => void;
}

export function CountryInput({
  inputRef,
  currentGuess,
  setCurrentGuess,
}: CountryInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const { i18n } = useTranslation();

  return (
    <Autosuggest
      suggestions={suggestions}
      onSuggestionsFetchRequested={({ value }) => {
        let suggestions = countries
          .map((c) => getArtistName(i18n.resolvedLanguage, c).toUpperCase())
          .filter((countryName) =>
            sanitizeCountryName(countryName).includes(
              sanitizeCountryName(value)
            )
          );
        // Filter out duplicates by converting the array to a Set and back to an Array
        suggestions = Array.from(new Set(suggestions));
        setSuggestions(suggestions);
      }}
      onSuggestionsClearRequested={() => setSuggestions([])}
      getSuggestionValue={(suggestion) => suggestion}
      renderSuggestion={(suggestion, { isHighlighted }) => (
        <div
          className={`border-2 dark:bg-slate-800 dark:text-slate-100 ${
            isHighlighted ? "font-bold" : ""
          }`}
        >
          {suggestion}
        </div>
      )}
      containerProps={{
        className: "border-2 flex-auto relative",
      }}
      inputProps={{
        ref: inputRef,
        className: "w-full dark:bg-slate-800 dark:text-slate-100",
        placeholder: "Name of artist",
        value: currentGuess,
        onChange: (_e, { newValue }) => setCurrentGuess(newValue),
      }}
      renderSuggestionsContainer={({ containerProps, children }) => (
        <div
          {...containerProps}
          className={`${containerProps.className} absolute bottom-full w-full bg-white mb-1 divide-x-2 max-h-52 overflow-auto`}
        >
          {children}
        </div>
      )}
      highlightFirstSuggestion={true}
    />
  );
}
