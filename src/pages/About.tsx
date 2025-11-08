export function AboutPage() {
  return (
    <main className="prose prose-sm md:prose dark:prose-invert max-w-3xl mx-auto px-4 py-6">
      <h1>About Artle</h1>
      <p>
        Artle is a daily guessing game. Each day we highlight a new artwork from museum collections
        around the world. Guess the artist, the year, and a defining attribute to complete the
        challenge.
      </p>
      <p>
        The game is non-commercial and runs entirely in the browser.
      </p>
      <h2>Credits</h2>
      <ul>
        <li>Artwork information sourced from public museum datasets and Wikimedia Commons.</li>
        <li>Geographical clues generated with open geo libraries.</li>
      </ul>
    </main>
  );
}

