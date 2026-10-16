import type { TargetMeta } from "./appTypes.ts";
import { isProxyTarget, type ProxyTargetKey } from "./proxyTargets.ts";

export const claudeDesktopConfigPathLabel = "macOS: ~/Library/Application Support/Claude-3p/configLibrary · Windows: %APPDATA%\\Claude-3p\\configLibrary";

export const targetOptions: TargetMeta[] = [
  {
    key: "codex",
    title: "Codex",
    summary: "Codex 官方登录与三方连接",
    description: "管理官方登录、三方 provider 和兼容网关。",
    configFileLabel: "Codex 配置文件",
    configFilePath: "~/.codex/config.toml + ~/.codex/auth.json",
    logo: "/target-icons/codex.svg",
    badge: "多端",
  },
  {
    key: "claude_cli",
    title: "Claude Code",
    summary: "命令行配置写回 ~/.claude/settings.json",
    description: "适合为 Claude Code 维护独立的厂商运行参数、Base URL 与模型映射。",
    configFileLabel: "Claude Code 配置文件",
    configFilePath: "~/.claude/settings.json",
    logo: "/target-icons/claude-code.svg",
    badge: "命令行",
  },
  {
    key: "claude_desktop",
    title: "Claude Desktop",
    summary: "桌面端配置写回 Claude-3p/configLibrary",
    description: "维护 Claude Desktop 可切换的厂商配置，并指定当前 appliedId。",
    configFileLabel: "Claude 桌面端配置库",
    configFilePath: claudeDesktopConfigPathLabel,
    logo: "/target-icons/claude.svg",
    badge: "桌面端",
  },
];

export const gatewayProxyTargetOptions = targetOptions.filter(
  (option): option is TargetMeta & { key: ProxyTargetKey } => isProxyTarget(option.key),
);
export const visibleTargetOptions = targetOptions;
