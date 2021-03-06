import { useContext, useEffect } from "react";
import { Settings } from "../models";
import { SettingsContext } from "../context/SettingsProvider";

type UseSettingsHook = {
  settings: Settings;
  reloadSettings: Function;
  loadingSettings: boolean;
};

export function useSettings(refetch?: boolean): UseSettingsHook {
  const { settings, reloadSettings, loadingSettings } = useContext(
    SettingsContext
  );

  useEffect(() => {
    if (refetch) {
      reloadSettings();
    }
  }, [refetch, reloadSettings]);

  return {
    settings,
    reloadSettings,
    loadingSettings,
  };
}
