# Art**l**e.eu
[Art**l**e](https://www.artle.eu) er et spill der man får se mer og mer av et kunstverk, og skal blant annet gjette hvilken kunstner som står bak bildet. Målet er å lære mer om billedkunst, kunsthistorie og om ulike sjangere.

Artle er en fork av spillet [Kommundle](https://www.kommundle.no). Det er [Øyvind Solheim](https://github.com/oyvindbso) og [Sandra Bruce](https://twitter.com/SandraBruce) som har laget Kommundle.

Kommundle er en fork av spillet [Wordle](https://worldle.teuteuf.fr/) som er laget av [@teuteuf@mastodon.social](https://mastodon.social/@teuteuf). 

Bildene av kunsten er hentet fra Wikimedia.

## Advertising (19 October 2026)

Ad serving is **disabled** in `.env.production` (`REACT_APP_ADSENSE_ENABLED=false`).
Verification is independent of serving: `public/index.html` contains the AdSense
account meta tag and `public/ads.txt` authorizes publisher `pub-5334366314528443`.
The privacy policy is a standalone, script-free page at `/privacy.html`; old
`/#/privacy` links redirect there.

The prepared manual banner uses Artle's own slot `3589348108`, named
“Artle – completed game – 320 × 50” in AdSense. It appears only below the final
round's results/share section, with 32px separation. There are no placements in
rounds one or two. The unit has a fixed 320 × 50 size, skips screens below 360px,
loads only when in view, and collapses on an unfilled response or loading error.
Local and preview hosts cannot serve ads. There are no refresh loops or requests
to disable ad blockers. Existing Google Analytics is separate and unchanged.

### Activation requirements

Do not enable ads merely because Google approves the site. First:

1. Confirm `artle.eu` is approved in AdSense.
2. Publish and integrate a Google-certified consent platform for this site, with
   reject/manage choices and a persistent control to reopen and revoke choices.
3. Test consent acceptance, rejection, withdrawal and returning visits in an
   applicable region, including blocking requests until the required choice.
4. Update the privacy page to describe the actual active consent controls.
5. Keep Artle Auto ads and automatic optimization OFF. Keep ad-size optimization
   OFF; no anchors, vignettes, auto-placement or automatic experiments.
6. Only then set `REACT_APP_ADSENSE_ENABLED=true`, rebuild, deploy and check the
   completed-game placement on mobile and desktop. The flag is compiled into the
   bundle: editing an environment variable without rebuilding changes nothing.

### Deployment

Production is GitHub Pages, repository `pabentse/artle`, branch `gh-pages` at `/`.
Commit/push source to `main`, then run `npm run deploy` (build + `gh-pages -d build`).
`public/CNAME` preserves `artle.eu`. Do not deploy to the Kviss hosting project.

Google dashboard status: Auto ads and automatic optimization were switched/confirmed
OFF for Artle on 19 October 2026. The existing Artle unit was renamed and saved
as fixed 320 × 50. The European consent editor remained blank after a reload
with Google's internal “Could not find event bus in current window context”
error. Its overview reports two active messages, but their site assignments and
settings could not be inspected. No consent configuration was published or
accepted as verified, and no binding terms were accepted. Serving stays OFF.
