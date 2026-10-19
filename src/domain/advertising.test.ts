import { advertisingEnabled } from "./advertising";

const original = process.env.REACT_APP_ADSENSE_ENABLED;
afterEach(() => {
  if (original === undefined) delete process.env.REACT_APP_ADSENSE_ENABLED;
  else process.env.REACT_APP_ADSENSE_ENABLED = original;
});

test("ads are disabled by default", () => {
  delete process.env.REACT_APP_ADSENSE_ENABLED;
  expect(advertisingEnabled()).toBe(false);
});

test("an explicit off flag disables ads", () => {
  process.env.REACT_APP_ADSENSE_ENABLED = "false";
  expect(advertisingEnabled()).toBe(false);
});

test("even an enabled flag cannot serve ads on a preview host", () => {
  process.env.REACT_APP_ADSENSE_ENABLED = "true";
  expect(window.location.hostname).toBe("localhost");
  expect(advertisingEnabled()).toBe(false);
});
