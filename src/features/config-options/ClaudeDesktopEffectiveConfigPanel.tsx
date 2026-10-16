import { CaretDown as ChevronDownIcon } from "@phosphor-icons/react";

type ClaudeDesktopEffectiveConfigPanelProps = {
  open: boolean;
  onToggle: () => void;
};

const CLAUDE_DESKTOP_EFFECTIVE_CONFIG_ROWS = [
  ["网关地址", "inferenceGatewayBaseUrl"],
  ["认证方式", "inferenceGatewayAuthScheme"],
  ["凭据来源", "inferenceCredentialKind"],
  ["调用模型身份", "inferenceModels[].name"],
  ["模型显示名称", "inferenceModels[].labelOverride"],
  ["当前厂商", "inferenceProvider"],
  ["关闭基础遥测", "disableEssentialTelemetry"],
  ["关闭使用统计", "disableNonessentialTelemetry"],
  ["流式等待秒数", "inferenceStreamIdleTimeoutSec"],
] as const;

export function ClaudeDesktopEffectiveConfigPanel({
  open,
  onToggle,
}: ClaudeDesktopEffectiveConfigPanelProps) {
  return (
    <div className="ccr-desktop-effective-panel">
      <button
        type="button"
        className="ccr-advanced-trigger"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span className="ccr-advanced-trigger-main">
          <ChevronDownIcon className={open ? "ccr-advanced-chevron open" : "ccr-advanced-chevron"} />
          <span className="ccr-advanced-title">Desktop 实际生效配置</span>
        </span>
        <span className="ccr-advanced-summary">Claude Desktop 读取字段</span>
      </button>
      {open ? (
        <>
          <div className="ccr-note-box">
            profile-id.json 是当前厂商的实际运行配置；_meta.json 只保存当前应用的 profile id 和列表索引。模型显示名称使用官方 labelOverride 字段，调用仍保留兼容别名。Switch++ 内部信息只保存在自己的配置中；完全退出并重启 Claude 后生效。
          </div>
          <div className="ccr-desktop-effective-grid">
            {CLAUDE_DESKTOP_EFFECTIVE_CONFIG_ROWS.map(([label, field]) => (
              <div className="ccr-desktop-effective-row" key={field}>
                <span>{label}</span>
                <code>{field}</code>
              </div>
            ))}

          </div>
        </>
      ) : null}
    </div>
  );
}
