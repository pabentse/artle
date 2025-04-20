import React from "react";
import { SettingsData } from "../../hooks/useSettings";
import { Panel } from "./Panel";

interface SettingsProps {
  isOpen: boolean;
  close: () => void;
  settingsData: SettingsData;
  updateSettings: (newSettings: Partial<SettingsData>) => void;
}

export function Settings({
  isOpen,
  close,
  settingsData,
  updateSettings,
}: SettingsProps) {
  return (
    <Panel title={"Settings"} isOpen={isOpen} close={close}>
      <div className="my-4">
        <div className="flex p-1">
          <select
            id="setting-theme"
            className="h-8 dark:bg-slate-800"
            value={settingsData.theme}
            onChange={(e) =>
              updateSettings({ theme: e.target.value as "light" | "dark" })
            }
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
          <label
            className="flex-1 ml-2 flex items-center"
            htmlFor="setting-theme"
          >
            {"Theme"}
          </label>
        </div>
      </div>
      <div className="my-4">
        <header className="my-2">
          <h3 className="text-lg font-bold">{"Hardeners"}</h3>
          <div className="text-sm italic text-gray-500">
            {"Starts next day"}
          </div>
        </header>
        <div className="flex p-1">
          <input
            type="checkbox"
            id="setting-noImage"
            checked={settingsData.noImageMode}
            onChange={(e) => updateSettings({ noImageMode: e.target.checked })}
          />
          <label className="flex-1 ml-2" htmlFor="setting-noImage">
            {"Without image"}
          </label>
        </div>
        <div className="flex p-1">
          <input
            type="checkbox"
            id="setting-rotationMode"
            checked={settingsData.rotationMode}
            onChange={(e) => updateSettings({ rotationMode: e.target.checked })}
          />
          <label className="flex-1 ml-2" htmlFor="setting-rotationMode">
            {"Rotate images"}
          </label>
        </div>
      </div>
    </Panel>
  );
}
