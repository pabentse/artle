// Enable only after AdSense approval AND a published, tested certified CMP
// (including rejection and reopening/revoking choices). See README.
export function advertisingEnabled() {
  return (
    process.env.REACT_APP_ADSENSE_ENABLED === "true" &&
    ["artle.eu", "www.artle.eu"].includes(window.location.hostname)
  );
}
