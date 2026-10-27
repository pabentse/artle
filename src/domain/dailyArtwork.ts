import seedrandom from "seedrandom";
import { countriesWithImage, Country } from "./countries";

// Freeze membership and order for this schedule version. Adding artwork to the
// catalogue must not change puzzles that players have already started.
const DECK_CODES = [
  "municip5046",
  "municip5045",
  "municip1103",
  "municip1106",
  "municip5042",
  "municip5041",
  "municip5047",
  "municip5048",
  "municip5049",
  "municip5050",
  "municip5051",
  "municip5052",
  "municip5053",
  "municip5054",
  "municip5055",
  "municip5056",
  "municip5057",
  "municip5058",
  "municip5059",
  "municip5060",
  "municip5061",
  "municip5062",
  "municip5063",
  "municip5064",
  "municip5065",
  "municip5066",
  "municip5067",
  "municip5068",
  "municip5069",
  "municip5070",
  "municip5071",
  "municip5072",
  "municip5073",
  "municip5074",
  "municip5075",
  "municip5076",
  "municip5077",
  "municip5078",
  "municip5079",
  "municip5080",
  "municip5081",
  "municip5082",
  "municip5083",
  "municip5084",
  "municip5085",
  "municip5086",
  "municip5087",
  "municip5088",
  "municip5089",
  "municip5090",
  "municip5091",
  "municip5092",
  "municip5093",
  "municip5094",
  "municip5095",
  "municip5096",
  "municip5097",
  "municip5098",
  "municip5099",
  "municip5100",
  "municip5101",
  "municip5102",
  "municip5103",
  "municip5104",
  "municip5105",
  "municip5106",
  "municip5107",
  "municip5108",
  "municip5109",
  "municip5110",
  "municip5111",
  "municip5112",
  "municip5113",
  "municip5114",
  "municip5115",
  "municip5116",
  "municip5117",
  "municip5118",
  "municip5119",
  "municip5120",
  "municip5121",
  "municip5122",
  "municip5123",
  "municip5124",
  "municip5125",
  "municip5126",
  "municip5127",
  "municip5128",
  "municip5129",
];
const scheduledArtworks = DECK_CODES.map((code) => {
  const artwork = countriesWithImage.find((entry) => entry.code === code);
  if (!artwork) throw new Error(`Scheduled artwork is missing: ${code}`);
  return artwork;
});
const DECK_START = Date.UTC(2026, 9, 27);
const DAY_MS = 24 * 60 * 60 * 1000;
const REPEAT_COOLDOWN = 30;
const FIRST_ARTWORK = "municip5070"; // Isle of the Dead, unchanged on 27 Oct 2026.

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
  "20-11-2025": "municip5129",
};

function legacyArtwork(dayString: string): Country {
  const forced = scheduledArtworks.find(
    (artwork) => artwork.code === forcedCountries[dayString]
  );
  if (forced) return forced;

  const [day, month, year] = dayString.split("-");
  const rng = seedrandom.alea(`${year}-${month}`);
  const shuffled = [...scheduledArtworks];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled[Number(day) - 1];
}

function dateKey(timestamp: number): string {
  const date = new Date(timestamp);
  return [
    String(date.getUTCDate()).padStart(2, "0"),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    date.getUTCFullYear(),
  ].join("-");
}

// This cache is only an optimization: every browser reconstructs the same decks
// from the versioned seed, irrespective of visit history or local storage.
const decks: string[][] = [];
let recentCodes: string[] = [];

function getDeck(cycle: number): string[] {
  if (recentCodes.length === 0) {
    recentCodes = Array.from(
      { length: REPEAT_COOLDOWN },
      (_, index) =>
        legacyArtwork(
          dateKey(DECK_START - (REPEAT_COOLDOWN - 1 - index) * DAY_MS)
        ).code
    );
  }

  while (decks.length <= cycle) {
    const deckIndex = decks.length;
    const rng = seedrandom.alea(`artle-deck-v1-2026-10-27-${deckIndex}`);
    const deck = deckIndex === 0 ? [FIRST_ARTWORK] : [];
    const remaining = DECK_CODES.filter((code) => !deck.includes(code));

    while (remaining.length > 0) {
      // Randomly draw an eligible card without replacement. Recent cards from
      // the previous deck become eligible as its last 30 days leave the window.
      const excluded = new Set(recentCodes);
      const eligible = remaining.filter((code) => !excluded.has(code));
      if (eligible.length === 0) {
        throw new Error(
          "Artle artwork deck is too small for the repeat cooldown"
        );
      }
      const chosen = eligible[Math.floor(rng() * eligible.length)];
      deck.push(chosen);
      remaining.splice(remaining.indexOf(chosen), 1);
      recentCodes.push(chosen);
      recentCodes = recentCodes.slice(-REPEAT_COOLDOWN);
    }
    decks.push(deck);
  }
  return decks[cycle];
}

export function getDailyArtwork(dayString: string): Country {
  const [day, month, year] = dayString.split("-").map(Number);
  // Count calendar dates in UTC, so daylight-saving changes cannot shift cards.
  // The caller still supplies the player's local calendar date as before.
  const offset = Math.floor(
    (Date.UTC(year, month - 1, day) - DECK_START) / DAY_MS
  );
  if (offset < 0) return legacyArtwork(dayString);

  const cycle = Math.floor(offset / DECK_CODES.length);
  const code = getDeck(cycle)[offset % DECK_CODES.length];
  const artwork = countriesWithImage.find((entry) => entry.code === code);
  if (!artwork) throw new Error(`Scheduled artwork is missing: ${code}`);
  return artwork;
}
