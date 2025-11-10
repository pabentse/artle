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
    <div className="border border-amber-200 bg-amber-50 rounded-md p-3 text-sm text-slate-800 my-3 shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
      <div className="flex justify-between items-start gap-3">
        <div>
          <h2 className="font-semibold text-base mb-1">What is Artle?</h2>
          <p className="mb-2">
            Artle is a daily art quiz. Guess the artist, the year, and an attribute across three
            rounds. New puzzles arrive at midnight CET. Your progress is saved in this browser only.
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Want details? Visit <a className="underline" href="#/about">About</a> or{" "}
            <a className="underline" href="#/privacy">Privacy</a>.
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


