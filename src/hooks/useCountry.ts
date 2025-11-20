import { useMemo } from "react";
import seedrandom from "seedrandom";
import { countriesWithImage, Country } from "../domain/countries";

function getMonthKey(dayString: string): string {
  // dayString format dd-MM-yyyy
  const parts = dayString.split("-");
  const day = parseInt(parts[0], 10);
  const month = parts[1];
  const year = parts[2];
  return `${year}-${month}`;
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[], rng: () => number): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

//hardcoded countries for each day
const forcedCountries: Record<string, string> = {
  "11-05-2024": "municip5100",
  "12-05-2024": "municip5128",
  "13-05-2024": "municip5127",
  "14-05-2024": "municip5126",
  "15-05-2024": "municip5125",
  "16-05-2024": "municip5124",
  "17-05-2024": "municip5123",
  "18-05-2024": "municip5122",
  "19-05-2024": "municip5121",
  "20-05-2024": "municip5120",
  "21-05-2024": "municip5119",
  "22-05-2024": "municip5118",
  "23-05-2024": "municip5117",
  "24-05-2024": "municip5116",
  "25-05-2024": "municip5115",
  "26-05-2024": "municip5114",
  "27-05-2024": "municip5113",
  "28-05-2024": "municip5112",
  "29-05-2024": "municip5111",
  "30-05-2024": "municip5110",
  "31-05-2024": "municip5109",
  "01-06-2024": "municip5108",
  "02-06-2024": "municip5107",
  "03-06-2024": "municip5106",
  "04-06-2024": "municip5105",
  "05-06-2024": "municip5104",
  "10-12-2024": "municip5046",
  "13-05-2025": "municip5045",
  "14-05-2025": "municip9999",
  "19-11-2025": "municip5104",
  "20-11-2025": "municip5219",
};

export function useCountry(dayString: string): [Country, number, number] {
  const country = useMemo(() => {
    const forcedCountryCode = forcedCountries[dayString];
    if (forcedCountryCode) {
      const forcedCountry = countriesWithImage.find(
        (c) => c.code === forcedCountryCode
      );
      if (forcedCountry) return forcedCountry;
    }

    // Determine the month key and day index
    const monthKey = getMonthKey(dayString);
    const day = parseInt(dayString.split("-")[0], 10); // dd

    // Seedrandom with the month key
    const rng = seedrandom.alea(monthKey);

    // Shuffle countries once per month based on monthKey
    const shuffledCountries = shuffleArray(countriesWithImage, rng);

    // Pick the (day-1)-th element, ensuring no repeats in the same month
    // If you have fewer days than images, no problem. If more, you may wrap around or handle differently.
    const chosen = shuffledCountries[day - 1];
    return chosen;
  }, [dayString]);

  const randomAngle = useMemo(
    () => seedrandom.alea(dayString)() * 360,
    [dayString]
  );

  const imageScale = useMemo(() => {
    const normalizedAngle = 45 - (randomAngle % 90);
    const radianAngle = (normalizedAngle * Math.PI) / 180;
    return 1 / (Math.cos(radianAngle) * Math.sqrt(2));
  }, [randomAngle]);

  return [country, randomAngle, imageScale];
}
