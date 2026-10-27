import { getDailyArtwork } from "./dailyArtwork";
import { countriesWithImage } from "./countries";

const DAY_MS = 86400000;
const START = Date.UTC(2026, 9, 27);
const DECK_SIZE = 89;

function dayKey(offset: number): string {
  const date = new Date(START + offset * DAY_MS);
  return [
    String(date.getUTCDate()).padStart(2, "0"),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    date.getUTCFullYear(),
  ].join("-");
}

test("keeps the release day's artwork and previous puzzles unchanged", () => {
  expect(getDailyArtwork("27-10-2026").code).toBe("municip5070");
  expect(getDailyArtwork("26-10-2026").code).toBe("municip5060");
  expect(getDailyArtwork("01-10-2026").code).toBe("municip5081");
  expect(getDailyArtwork("22-09-2026").code).toBe("municip5081");
  expect(getDailyArtwork("20-11-2025").code).toBe("municip5129");
  expect(getDailyArtwork("11-05-2024").code).toBe("municip5100");
});

test("every deck contains every artwork exactly once, across months and leap years", () => {
  const expected = countriesWithImage.map((artwork) => artwork.code).sort();
  expect(expected).toHaveLength(DECK_SIZE);
  const orders = new Set<string>();
  for (let cycle = 0; cycle < 100; cycle++) {
    const codes = Array.from(
      { length: DECK_SIZE },
      (_, day) => getDailyArtwork(dayKey(cycle * DECK_SIZE + day)).code
    );
    expect([...codes].sort()).toEqual(expected);
    orders.add(codes.join(","));
  }
  expect(orders.size).toBe(100);
});

test("repeat appearances are at least 31 days apart, including the migration and deck boundaries", () => {
  const lastSeen = new Map<string, number>();
  for (let offset = -29; offset < DECK_SIZE * 100; offset++) {
    const code = getDailyArtwork(dayKey(offset)).code;
    const previous = lastSeen.get(code);
    if (previous !== undefined) expect(offset - previous).toBeGreaterThan(30);
    lastSeen.set(code, offset);
  }
});

test("fresh browsers get the same cards even when dates are requested out of order", () => {
  const offsets = [890, 0, 178, 88, 89, 1, 365, 366, 120, 121];
  const expected = offsets.map(
    (offset) => getDailyArtwork(dayKey(offset)).code
  );
  jest.isolateModules(() => {
    // A fresh module has no previously generated decks or player history.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fresh = require("./dailyArtwork") as typeof import("./dailyArtwork");
    expect(
      offsets.map((offset) => fresh.getDailyArtwork(dayKey(offset)).code)
    ).toEqual(expected);
  });
});

test("catalogue additions and reordering cannot reshuffle the published schedule", () => {
  const dates = [-365, -1, 0, 1, 89, 365].map(dayKey);
  const expected = dates.map((date) => getDailyArtwork(date).code);
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const catalogue = require("./countries") as typeof import("./countries");
    catalogue.countriesWithImage.reverse();
    catalogue.countriesWithImage.push({
      ...catalogue.countriesWithImage[0],
      code: "future-artwork",
    });
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fresh = require("./dailyArtwork") as typeof import("./dailyArtwork");
    expect(dates.map((date) => fresh.getDailyArtwork(date).code)).toEqual(
      expected
    );
  });
});
