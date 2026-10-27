import { useMemo } from "react";
import seedrandom from "seedrandom";
import { Country } from "../domain/countries";
import { getDailyArtwork } from "../domain/dailyArtwork";

export function useCountry(dayString: string): [Country, number, number] {
  const country = useMemo(() => getDailyArtwork(dayString), [dayString]);

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
