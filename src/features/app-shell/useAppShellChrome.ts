import { useEffect, useRef, useState, type MouseEvent } from "react";
import {
  checkOfficialAppUpdate,
  idleAppUpdateInstallState,
  installOfficialAppUpdate,
  isAppUpdateInstallBusy,
  type AppUpdateInstallState,
  type OfficialAppUpdateCheckResult,
} from "../../appUpdater.ts";
import {
  APP_UPDATE_INITIAL_CHECK_DELAY_MS,
  APP_UPDATE_POLL_INTERVAL_MS,
  APP_UPDATE_STARTUP_RETRY_DELAY_MS,
  shouldRunEventAppUpdateCheck,
  shouldRunScheduledAppUpdateCheck,
  shouldShowAppUpdateNotice,
  type AppUpdateCheckMode,
} from "../../appUpdatePolling.ts";
import {
  APP_RELEASES_URL,
  DEV_MOCK_APP_UPDATE_STORAGE_KEY,
  LEGACY_DEV_MOCK_APP_UPDATE_STORAGE_KEYS,
} from "../../appConstants.ts";
import type { AppUpdateCheckResult } from "../../appTypes.ts";
import { invokeNative, nativeCommand } from "../../nativeIpc.ts";

type StateUpdater<T> = T | ((current: T) => T);

type SettingsPopoverAnchor = {
  left: number;
  bottom: number;
};

type UseAppShellChromeOptions = {
  setSettingsPopoverOpen: (value: StateUpdater<boolean>) => void;
  setSettingsPopoverAnchor: (value: SettingsPopoverAnchor) => void;
  showStatus: (message: string, type?: "success" | "error" | "") => void;
};

function devMockAppUpdate(): AppUpdateCheckResult | null {
  try {
    if (!import.meta.env.DEV) return null;
    const enabled =
      window.localStorage.getItem(DEV_MOCK_APP_UPDATE_STORAGE_KEY) === "1" ||
      LEGACY_DEV_MOCK_APP_UPDATE_STORAGE_KEYS.some((key) => window.localStorage.getItem(key) === "1");
    if (!enabled) return null;
    return {
      current_version: "1.0.9",
      latest_version: "9.9.9",
      has_update: true,
      release_url: APP_RELEASES_URL,
      checked_at: Date.now(),
      message: "发现新版本",
      error: "",
    };
  } catch {
    return null;
  }
}

function currentDocumentVisibility(): DocumentVisibilityState | "unknown" {
  return typeof document === "undefined" ? "unknown" : document.visibilityState;
}

export function useAppShellChrome({
  setSettingsPopoverOpen,
  setSettingsPopoverAnchor,
  showStatus,
}: UseAppShellChromeOptions) {
  const settingsButtonRef = useRef<HTMLButtonElement | null>(null);
  const [appUpdate, setAppUpdate] = useState<AppUpdateCheckResult | null>(() => devMockAppUpdate());
  const [appUpdateInstallState, setAppUpdateInstallState] =
    useState<AppUpdateInstallState>(idleAppUpdateInstallState);
  const appUpdateRef = useRef<AppUpdateCheckResult | null>(devMockAppUpdate());
  const officialAppUpdateRef = useRef<OfficialAppUpdateCheckResult["update"] | null>(null);
  const appUpdateCheckingRef = useRef(false);
  const lastEventAppUpdateCheckAtRef = useRef<number | null>(null);

  function toggleSettingsPopover() {
    const rect = settingsButtonRef.current?.getBoundingClientRect();
    if (rect) {
      const popoverWidth = 156;
      const margin = 12;
      const left = Math.max(margin, Math.min(window.innerWidth - popoverWidth - margin, rect.right - popoverWidth));
      const bottom = Math.max(margin, window.innerHeight - rect.top + 8);
      setSettingsPopoverAnchor({ left, bottom });
    }
    setSettingsPopoverOpen((open) => !open);
  }

  async function runAppUpdateCheck(mode: AppUpdateCheckMode = "manual") {
    if (appUpdateCheckingRef.current) return;
    if (!shouldRunScheduledAppUpdateCheck(mode, currentDocumentVisibility())) return;
    const devMock = devMockAppUpdate();
    if (devMock) {
      officialAppUpdateRef.current = null;
      appUpdateRef.current = devMock;
      setAppUpdate(devMock);
      return;
    }
    appUpdateCheckingRef.current = true;
    try {
      const officialResult = await checkOfficialAppUpdate();
      officialAppUpdateRef.current = officialResult.update;
      const result = officialResult.result;
      const previous = appUpdateRef.current;
      appUpdateRef.current = result;
      setAppUpdate(result);
      if (shouldShowAppUpdateNotice(mode, previous, result)) {
        showStatus("发现新版本", "success");
      } else if (mode === "manual" && !result.error) {
        showStatus(result.message, "success");
      }
    } catch (error) {
      officialAppUpdateRef.current = null;
      try {
        const result = await invokeNative<AppUpdateCheckResult>(nativeCommand.checkAppUpdate);
        const previous = appUpdateRef.current;
        appUpdateRef.current = result;
        setAppUpdate(result);
        if (shouldShowAppUpdateNotice(mode, previous, result)) {
          showStatus("发现新版本", "success");
        } else if (mode === "manual" && !result.error) {
          showStatus(result.message, "success");
        }
      } catch {
        const previous = appUpdateRef.current;
        const result = {
          current_version: previous?.current_version ?? "",
          latest_version: previous?.latest_version ?? "",
          has_update: previous?.has_update ?? false,
          release_url: previous?.release_url || APP_RELEASES_URL,
          checked_at: Date.now(),
          message: "暂时无法检查更新",
          error: `版本检查失败：${String(error)}`,
        };
        appUpdateRef.current = result;
        setAppUpdate(result);
      }
    } finally {
      appUpdateCheckingRef.current = false;
    }
  }

  async function installAppUpdate(event?: MouseEvent<HTMLElement>) {
    event?.preventDefault();
    if (isAppUpdateInstallBusy(appUpdateInstallState)) return;
    const update = officialAppUpdateRef.current;
    if (!update) {
      const message = "自动更新清单暂不可用，请稍后再试。";
      setAppUpdateInstallState({
        ...idleAppUpdateInstallState,
        phase: "error",
        message,
      });
      showStatus(message, "error");
      return;
    }

    try {
      await installOfficialAppUpdate(update, setAppUpdateInstallState);
    } catch (error) {
      const message = `更新安装失败：${String(error)}`;
      setAppUpdateInstallState({
        ...idleAppUpdateInstallState,
        phase: "error",
        message,
      });
      showStatus(message, "error");
    }
  }

  useEffect(() => {
    const runEventAppUpdateCheck = () => {
      const now = Date.now();
      if (!shouldRunEventAppUpdateCheck(lastEventAppUpdateCheckAtRef.current, now)) return;
      lastEventAppUpdateCheckAtRef.current = now;
      runAppUpdateCheck("poll");
    };
    const startupTimer = window.setTimeout(() => {
      runAppUpdateCheck("startup");
    }, APP_UPDATE_INITIAL_CHECK_DELAY_MS);
    const startupRetryTimer = window.setTimeout(() => {
      runAppUpdateCheck("startup");
    }, APP_UPDATE_STARTUP_RETRY_DELAY_MS);
    const pollTimer = window.setInterval(() => {
      runAppUpdateCheck("poll");
    }, APP_UPDATE_POLL_INTERVAL_MS);
    const handleVisibilityChange = () => {
      if (currentDocumentVisibility() === "visible") {
        runEventAppUpdateCheck();
      }
    };
    const handleWindowFocus = () => {
      runEventAppUpdateCheck();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("online", handleWindowFocus);
    return () => {
      window.clearTimeout(startupTimer);
      window.clearTimeout(startupRetryTimer);
      window.clearInterval(pollTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("online", handleWindowFocus);
    };
  }, []);

  return {
    appUpdate,
    appUpdateInstallState,
    installAppUpdate,
    runAppUpdateCheck,
    settingsButtonRef,
    toggleSettingsPopover,
  };
}
