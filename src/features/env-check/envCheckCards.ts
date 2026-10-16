import type { EnvCheckResult, EnvCommandInstall, EnvConfigLocation, EnvPlatform } from "../../appConstants.ts";
import {
  claudeCliEnvConfigLabel,
  claudeDesktopEnvConfigLabel,
  claudeDesktopInstallHint,
  codexEnvConfigLabel,
} from "../../envCheckUtils.ts";

export type EnvCheckCard = {
  key: string;
  title: string;
  badge: string;
  logo: string;
  installed: boolean | null;
  version: string;
  latest: string;
  upgradeAvailable: boolean;
  path: string;
  launchCommand: string;
  launchArgs: string[];
  configLabel: string;
  configExists: boolean | null;
  hint: string;
  installations: EnvCommandInstall[];
  locations: EnvConfigLocation[];
  configs: EnvConfigLocation[];
};

export function buildEnvCheckCards(
  envResults: EnvCheckResult | null,
  currentEnvPlatform: EnvPlatform,
): EnvCheckCard[] {
  if (!envResults) {
    return [
      emptyEnvCheckCard("claude_cli", "Claude Code", "命令行", "/target-icons/claude-code.svg", claudeCliEnvConfigLabel(currentEnvPlatform), currentEnvPlatform),
      emptyEnvCheckCard("claude_desktop", "Claude Desktop", "桌面端", "/target-icons/claude.svg", claudeDesktopEnvConfigLabel(currentEnvPlatform), currentEnvPlatform),
      emptyEnvCheckCard("codex_cli", "Codex CLI", "命令行", "/target-icons/codex.svg", codexEnvConfigLabel(currentEnvPlatform), currentEnvPlatform),
      emptyEnvCheckCard("codex_desktop", "ChatGPT（Codex）", "桌面端", "/target-icons/codex.svg", codexEnvConfigLabel(currentEnvPlatform), currentEnvPlatform),
    ];
  }

  return [
    {
      key: "claude_cli",
      title: "Claude Code",
      badge: "命令行",
      logo: "/target-icons/claude-code.svg",
      installed: envResults.claude_cli_installed,
      version: envResults.claude_cli_version,
      latest: envResults.claude_cli_latest,
      upgradeAvailable: envResults.claude_cli_upgrade_available,
      path: envResults.claude_cli_path,
      ...envCardLaunch("claude_cli", currentEnvPlatform),
      configLabel: claudeCliEnvConfigLabel(currentEnvPlatform),
      configExists: envResults.claude_cli_config_exists,
      hint: "请运行 npm install -g @anthropic-ai/claude-code 安装。",
      installations: envResults.claude_cli_installations,
      locations: [],
      configs: envResults.claude_cli_configs,
    },
    {
      key: "claude_desktop",
      title: "Claude Desktop",
      badge: "桌面端",
      logo: "/target-icons/claude.svg",
      installed: envResults.claude_desktop_installed,
      version: envResults.claude_desktop_version,
      latest: envResults.claude_desktop_latest,
      upgradeAvailable: envResults.claude_desktop_upgrade_available,
      path: envResults.claude_desktop_path,
      ...envCardLaunch("claude_desktop", currentEnvPlatform),
      configLabel: claudeDesktopEnvConfigLabel(currentEnvPlatform),
      configExists: envResults.claude_desktop_config_exists,
      hint: claudeDesktopInstallHint(currentEnvPlatform),
      installations: [],
      locations: envResults.claude_desktop_apps,
      configs: envResults.claude_desktop_configs,
    },
    {
      key: "codex_cli",
      title: "Codex CLI",
      badge: "命令行",
      logo: "/target-icons/codex.svg",
      installed: envResults.codex_cli_installed,
      version: envResults.codex_cli_version,
      latest: envResults.codex_cli_latest,
      upgradeAvailable: envResults.codex_cli_upgrade_available,
      path: envResults.codex_cli_path,
      ...envCardLaunch("codex_cli", currentEnvPlatform),
      configLabel: codexEnvConfigLabel(currentEnvPlatform),
      configExists: envResults.codex_config_exists,
      hint: "请先安装 Codex；该目标会写入 ~/.codex。",
      installations: envResults.codex_cli_installations,
      locations: [],
      configs: envResults.codex_configs,
    },
    {
      key: "codex_desktop",
      title: "ChatGPT（Codex）",
      badge: "桌面端",
      logo: "/target-icons/codex.svg",
      installed: envResults.codex_desktop_installed,
      version: envResults.codex_desktop_version,
      latest: envResults.codex_desktop_latest,
      upgradeAvailable: envResults.codex_desktop_upgrade_available,
      path: envResults.codex_desktop_path,
      ...envCardLaunch("codex_desktop", currentEnvPlatform),
      configLabel: codexEnvConfigLabel(currentEnvPlatform),
      configExists: envResults.codex_config_exists,
      hint: "请安装最新版 ChatGPT；Codex 桌面功能已集成在 ChatGPT 中。",
      installations: [],
      locations: envResults.codex_desktop_apps,
      configs: envResults.codex_configs,
    },
  ];
}

function emptyEnvCheckCard(
  key: string,
  title: string,
  badge: string,
  logo: string,
  configLabel: string,
  currentEnvPlatform: EnvPlatform,
): EnvCheckCard {
  return {
    key,
    title,
    badge,
    logo,
    installed: null,
    version: "",
    latest: "",
    upgradeAvailable: false,
    path: "",
    ...envCardLaunch(key, currentEnvPlatform),
    configLabel,
    configExists: null,
    hint: "",
    installations: [],
    locations: [],
    configs: [],
  };
}

function envCardLaunch(
  key: string,
  platform: EnvPlatform,
): Pick<EnvCheckCard, "launchCommand" | "launchArgs"> {
  switch (key) {
    case "claude_cli":
      return { launchCommand: "claude", launchArgs: [] };
    case "claude_desktop":
      if (platform === "macos") return { launchCommand: "open", launchArgs: ["-a", "Claude"] };
      if (platform === "windows") return { launchCommand: "Claude.exe", launchArgs: [] };
      return { launchCommand: "claude-desktop", launchArgs: [] };
    case "codex_cli":
      return { launchCommand: "codex", launchArgs: [] };
    case "codex_desktop":
      if (platform === "macos") return { launchCommand: "open", launchArgs: ["-b", "com.openai.codex"] };
      if (platform === "windows") return { launchCommand: "Codex.exe", launchArgs: [] };
      return { launchCommand: "codex", launchArgs: [] };
    default:
      return { launchCommand: "", launchArgs: [] };
  }
}
