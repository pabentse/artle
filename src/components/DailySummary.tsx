import { Link } from "react-router-dom";

export function DailySummary() {
  return (
    <section className="mx-2 mt-3 mb-2 p-4 border border-slate-200 dark:border-slate-700 rounded-md bg-white/80 dark:bg-slate-900/60 shadow-sm text-sm leading-relaxed">
      <h2 className="text-base font-semibold mb-2 text-slate-800 dark:text-slate-100">
        Today in Artle
      </h2>
      <p className="text-slate-700 dark:text-slate-200 mb-2">
        Artle highlights a new museum artwork every day. Finish three quick rounds to reveal the
        full image:
      </p>
      <ol className="list-decimal pl-5 space-y-1 text-slate-700 dark:text-slate-200 mb-2">
        <li>Guess the <strong>artist</strong> within three attempts using geographic hints.</li>
        <li>Pick the correct <strong>year</strong> from curated options.</li>
        <li>Spot a defining <strong>style/attribute</strong> linked to the work.</li>
      </ol>
      <p className="text-slate-600 dark:text-slate-300">
        Progress, language, and settings stay in your browser only. Curious about the project?{" "}
        <Link className="underline" to="/about">
          Read the story behind Artle
        </Link>{" "}
        or review our{" "}
        <Link className="underline" to="/privacy">
          privacy policy
        </Link>
        .
      </p>
    </section>
  );
}


