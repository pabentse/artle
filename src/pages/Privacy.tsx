export function PrivacyPage() {
  return (
    <main className="prose prose-sm md:prose dark:prose-invert max-w-3xl mx-auto px-4 py-6">
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().getFullYear()}</p>
      <p>
        We do not collect or sell personal information.
        The only data stored is the game progress, language, and settings saved in your own
        browser via <code>localStorage</code>. Clearing your browser storage resets the game.
      </p>
      <h2>Analytics</h2>
      <p>
        We use Google Analytics (gtag.js) to understand anonymous traffic patterns such as
        page views and device types. Google Analytics may set cookies as described in their
        own privacy policy.
      </p>
      <h2>Advertising</h2>
      <p>
        We experiment with Google AdSense to help cover hosting costs. AdSense may serve
        personalized or contextual ads depending on your consent choices. Any ads are clearly
        separated from gameplay.
      </p>
      <h2>Third-party links</h2>
      <p>
        Some hints link to external museum or map resources. We are not responsible for the
        content or privacy practices of those sites.
      </p>
      <h2>Contact</h2>
      <p>
        For questions about this policy or to report a bug, email us at
        <a href="mailto:hello@artle.eu"> hello@artle.eu</a>.
      </p>
    </main>
  );
}

