import { useEffect, useState } from "react";

const STORAGE_KEY = "artle_intro_seen";

export function IntroNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="border border-amber-200 bg-amber-50 rounded-md p-4 text-sm text-slate-800 my-3 shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
      <div className="flex justify-between items-start gap-3">
        <div>
          <h2 className="font-semibold text-base mb-2">What is Artle?</h2>
          <p className="mb-2">
            Artle is a daily art quiz that highlights a new artwork every day. Play three quick
            rounds to learn something new:
          </p>
          <ul className="list-disc pl-5 mb-2 space-y-1">
            <li>
              <strong>Round 1:</strong> Guess the artist with up to three attempts. We show progress
              hints as you narrow it down.
            </li>
            <li>
              <strong>Round 2:</strong> Pick the correct year the artwork was created. Choices are
              curated for each puzzle.
            </li>
            <li>
              <strong>Round 3:</strong> Identify an art style or defining attribute related to the
              work.
            </li>
          </ul>
          <p className="mb-2">
            New puzzles arrive at midnight CET. All progress, language, and settings are stored in{" "}
            your browser only; nothing is uploaded to our servers.
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Want the backstory? Visit <a className="underline" href="#/about">About</a>. Curious how
            we handle data? Read the <a className="underline" href="#/privacy">Privacy Policy</a>{" "}
            and <a className="underline" href="#/terms">Terms</a>.
          </p>
        </div>
        <button
          className="text-xs uppercase tracking-wide text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
          onClick={() => {
            setVisible(false);
            try {
              window.localStorage.setItem(STORAGE_KEY, "1");
            } catch {
              /* ignore storage issues */
            }
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}


