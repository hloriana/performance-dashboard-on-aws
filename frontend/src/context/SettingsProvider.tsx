import React, { useEffect, useState, useCallback } from "react";
import { Hub } from "aws-amplify";
import { Settings } from "../models";
import BackendService from "../services/BackendService";

/**
 * Default settings to start with while we fetch the actual
 * Settings from the Backend.
 */
const defaultSettings: Settings = {
  dateTimeFormat: {
    date: "YYYY-MM-DD",
    time: "HH:mm",
  },
  publishingGuidance:
    "I acknowledge that I have reviewed the dashboard" +
    " and it is ready to publish",
};

interface SettingsContextProps {
  settings: Settings;
  reloadSettings: Function;
  loadingSettings: boolean;
}

export const SettingsContext = React.createContext<SettingsContextProps>({
  reloadSettings: () => {},
  settings: defaultSettings,
  loadingSettings: false,
});

/**
 * This provider wraps the root of our component's tree in <App />
 * to provide Settings to all the children components in the tree. It
 * uses React Context so that settings are kept in a global state instead
 * of fetching them over and over on every screen.
 */
function SettingsProvider(props: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsContextProps>({
    reloadSettings: () => {},
    settings: defaultSettings,
    loadingSettings: false,
  });

  const fetchSettings = useCallback(async () => {
    try {
      /**
       * Its important that the reloadSettings function does not
       * change, because it causes an infinite loop due to the
       * settings-hook having a useEffect on it.
       */
      setSettings({
        reloadSettings: fetchSettings,
        settings: defaultSettings,
        loadingSettings: true,
      });
      const data = await BackendService.fetchSettings();
      setSettings({
        settings: data,
        reloadSettings: fetchSettings,
        loadingSettings: false,
      });
    } catch (err) {
      console.log("Failed to load settings from backend");
      setSettings({
        reloadSettings: fetchSettings,
        settings: defaultSettings,
        loadingSettings: false,
      });
    }
  }, []);

  /**
   * Listen for authentication events so that when users
   * signIn or their token is refreshed, we refetch the
   * Settings. This covers an edge case in which we fail
   * to fetch Settings the first time because the user was
   * not authenticated yet.
   */
  const listenAuthEvents = useCallback(
    (event: any) => {
      const { payload } = event;
      switch (payload.event) {
        case "signIn":
        case "tokenRefresh":
          fetchSettings();
          break;
        default:
          break;
      }
    },
    [fetchSettings]
  );

  useEffect(() => {
    fetchSettings();
    Hub.listen("auth", listenAuthEvents);
    return () => Hub.remove("auth", listenAuthEvents);
  }, [fetchSettings, listenAuthEvents]);

  return (
    <SettingsContext.Provider value={settings}>
      {props.children}
    </SettingsContext.Provider>
  );
}

export default SettingsProvider;
