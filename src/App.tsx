import { ToastContainer, Flip } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Game } from "./components/Game";
import { GameTwo } from "./components/GameTwo";
import React, { useEffect, useState } from "react";
import { Infos } from "./components/panels/Infos";
import { useTranslation } from "react-i18next";
import { InfosFr } from "./components/panels/InfosFr";
import { Settings } from "./components/panels/Settings";
import { useSettings } from "./hooks/useSettings";
import { Stats } from "./components/panels/Stats";
import { Worldle } from "./components/Worldle";
import {
  HashRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { GameThree } from "./components/GameThree";
import { ScoreProvider } from "./components/ScoreContext";
import { MetaRoundProvider } from "./components/MetaRoundContext";

function App() {
  const { i18n } = useTranslation();

  const [infoOpen, setInfoOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  const [settingsData, updateSettings] = useSettings();

  // Meta round is provided via MetaRoundProvider; no local state here

  useEffect(() => {
    if (settingsData.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settingsData.theme]);

  return (
    <MetaRoundProvider>
      <ScoreProvider>
        <>
          <Router>
            <ToastContainer
              hideProgressBar
              position="top-center"
              transition={Flip}
              theme={settingsData.theme}
              autoClose={2000}
              bodyClassName="font-bold text-center"
            />
            {i18n.resolvedLanguage === "no" ? (
              <InfosFr
                isOpen={infoOpen}
                close={() => setInfoOpen(false)}
                settingsData={settingsData}
              />
            ) : (
              <Infos
                isOpen={infoOpen}
                close={() => setInfoOpen(false)}
                settingsData={settingsData}
              />
            )}
            <Settings
              isOpen={settingsOpen}
              close={() => setSettingsOpen(false)}
              settingsData={settingsData}
              updateSettings={updateSettings}
            />
            <Stats
              isOpen={statsOpen}
              close={() => setStatsOpen(false)}
              distanceUnit={settingsData.distanceUnit}
            />
            <div className="flex justify-center flex-auto dark:bg-slate-900 dark:text-slate-50">
              <div className="w-full max-w-lg flex flex-col">
                <header className="border-b-2 px-3 border-gray-200 flex">
                  <button
                    className="mr-3 text-xl"
                    type="button"
                    onClick={() => setInfoOpen(true)}
                  >
                    ❓
                  </button>
                  <h1 className="text-4xl font-bold uppercase tracking-wide text-center my-1 flex-auto">
                    ART<span className="text-green-600">L</span>E
                  </h1>
                  <button
                    className="ml-3 text-xl"
                    type="button"
                    onClick={() => setStatsOpen(true)}
                  >
                    📈
                  </button>
                  <button
                    className="ml-3 text-xl"
                    type="button"
                    onClick={() => setSettingsOpen(true)}
                  >
                    ⚙️
                  </button>
                </header>
                <Routes>
                  <Route path="/" element={<Game settingsData={settingsData} />} />
                  <Route path="/round2" element={<GameTwo settingsData={settingsData} />} />
                  <Route path="/round3" element={<GameThree settingsData={settingsData} />} />
                </Routes>
                <footer className="flex justify-center text-sm mt-8 mb-1">
                  <a>{""}</a>
                </footer>
                <footer className="flex justify-center text-sm mt-8 mb-1">
                  <a>{"Image copyrights: Wiki Commons"}</a>
                </footer>
                <footer className="flex justify-center text-sm mt-8 mb-1">
                  ❤️ <Worldle />? -
                  <a
                    className="underline pl-1"
                    href="https://ko-fi.com/artle"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {"Buy me a coffee!"}
                  </a>
                </footer>
              </div>
            </div>
          </Router>
        </>
      </ScoreProvider>
    </MetaRoundProvider>
  );
}

export default App;
