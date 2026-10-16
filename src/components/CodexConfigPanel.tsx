import { ArrowsClockwise as RefreshCwIcon, CaretDown as ChevronDownIcon } from "@phosphor-icons/react";
import type { AddForm, VendorPreset } from "../appTypes.ts";
import {
  codexConfigOptionItems,
  getCodexConfigOptionSupport,
} from "../codexConfig.ts";
import type { CodexOssProvider } from "../codexConfig.ts";
import { extractTomlAssignment } from "../gatewayProfile.ts";
import { Tooltip } from "../nativeUi.tsx";
import { CODEX_LOCAL_PROXY_BASE_URL } from "../configPreviews.ts";
import { ReasoningEffortField } from "./ReasoningEffortField.tsx";

type CodexConfigPanelProps = {
  isOfficialCodexDirect: boolean;
  codexConfigOpen: boolean;
  onToggleOpen: () => void;
  busy: boolean;
  codexAuthJsonValue: string;
  codexConfigTomlValue: string;
  addForm: AddForm;
  currentSelectedPreset: VendorPreset | null;
  onAuthJsonChange: (value: string) => void;
  onConfigTomlChange: (value: string, model: string) => void;
  onCodexConfigOptionChange: (key: string, checked: boolean) => void;
  onCodexOssProviderChange: (value: CodexOssProvider) => void;
  onImportOfficialProfile: () => void;
  onApplyRecommended: () => void;
  onReasoningEffortChange: (value: string) => void;
};

export function CodexConfigPanel({
  isOfficialCodexDirect,
  codexConfigOpen,
  onToggleOpen,
  busy,
  codexAuthJsonValue,
  codexConfigTomlValue,
  addForm,
  currentSelectedPreset,
  onAuthJsonChange,
  onConfigTomlChange,
  onCodexConfigOptionChange,
  onCodexOssProviderChange,
  onImportOfficialProfile,
  onApplyRecommended,
  onReasoningEffortChange,
}: CodexConfigPanelProps) {
  const codexPanelTitle = isOfficialCodexDirect ? "官方登录配置" : "Codex 生效预览";

  return (
    <div className="ccr-advanced-panel">
      <button
        type="button"
        className="ccr-advanced-trigger"
        aria-expanded={codexConfigOpen}
        onClick={onToggleOpen}
      >
        <span className="ccr-advanced-trigger-main">
          <ChevronDownIcon className={codexConfigOpen ? "ccr-advanced-chevron open" : "ccr-advanced-chevron"} />
          <span className="ccr-advanced-title">{codexPanelTitle}</span>
        </span>
        <span className="ccr-advanced-summary">
          {isOfficialCodexDirect ? "可同步本机官方登录态" : "专用 provider"}
        </span>
      </button>
      {codexConfigOpen ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {isOfficialCodexDirect ? (
            <div className="ccr-edit-field">
              <label>auth.json (JSON)</label>
              <div className="ccr-config-json-shell">
                <button
                  type="button"
                  disabled={busy}
                  onClick={onImportOfficialProfile}
                  className="ccr-inline-sync-action ccr-config-json-sync"
                >
                  <RefreshCwIcon className="h-3 w-3" />
                  同步本机 Codex 配置
                </button>
                <textarea
                  className="ccr-config-json ccr-config-json-editor"
                  spellCheck={false}
                  aria-label="Codex auth.json"
                  value={codexAuthJsonValue}
                  onChange={(e) => onAuthJsonChange(e.currentTarget.value)}
                />
              </div>
              <span className="ccr-field-help">
                auth.json 包含登录凭据；仅从本机 Codex 同步，请勿复制或分享。
              </span>
            </div>
          ) : null}
          <div className="ccr-edit-field">
            <label>{isOfficialCodexDirect ? "config.toml (TOML)" : "生成的三方 provider (TOML)"}</label>
            {!isOfficialCodexDirect ? (
              <div className="ccr-note-box">
                三方配置使用独立 custom provider；通过 Switch++ profile 切换，不会并入官方账号模型菜单。
              </div>
            ) : null}
            <div className="ccr-option-actions">
              <div>
                <span className="ccr-option-actions-title">Codex 运行选项</span>
                <span className="ccr-option-actions-note">
                  {isOfficialCodexDirect
                    ? "这些选项会合并进官方 config.toml，并在新 Codex 会话中生效。"
                    : "这些选项会写入三方专用 provider 配置；认证与官方登录态隔离。"}
                </span>
              </div>
              <div className="ccr-option-actions-buttons">
                <button type="button" className="ccr-option-action" onClick={onApplyRecommended}>
                  应用推荐配置
                </button>
              </div>
            </div>
            <div className="ccr-edit-field">
              <label>OSS 默认本地 provider</label>
              <select
                value={addForm.codex_config_options.oss_provider}
                onChange={(event) => onCodexOssProviderChange(event.currentTarget.value as CodexOssProvider)}
              >
                <option value="">不设置</option>
                <option value="ollama">Ollama</option>
                <option value="lmstudio">LM Studio</option>
              </select>
              <span className="ccr-field-help">
                写入全局顶层 oss_provider，供 codex --oss 选择 Ollama 或 LM Studio；与当前 model_provider 和登录方式无关。
              </span>
            </div>
            <span className="ccr-field-help">{addForm.client_version ? `已检测 Codex：${addForm.client_version}` : "正在确认本机 Codex 版本；未确认的选项暂不写入。"}</span>
            <ReasoningEffortField target="codex" form={addForm} onChange={onReasoningEffortChange} />
            <div className="ccr-config-options">
              {codexConfigOptionItems.filter((option) => option.key !== "high_reasoning").map((option) => {
                const support = getCodexConfigOptionSupport(option, {
                  model: addForm.model,
                  compatMode: addForm.compat_mode,
                  connectionMode: addForm.connection_mode,
                  presetId: currentSelectedPreset?.id,
                  presetName: currentSelectedPreset?.name,
                  metadata: addForm.model_metadata, clientVersion: addForm.client_version, apiFormat: addForm.api_format,
                });
                return (
                  <Tooltip.Root key={option.key} delay={350}>
                    <Tooltip.Trigger className="ccr-option-tooltip-trigger">
                      <label className={support.supported ? "ccr-check" : "ccr-check disabled"}>
                        <input
                          type="checkbox"
                          checked={support.supported && addForm.codex_config_options[option.key]}
                          disabled={!support.supported}
                          onChange={(e) => onCodexConfigOptionChange(option.key, e.currentTarget.checked)}
                        />
                        <span>{option.label}</span>
                      </label>
                    </Tooltip.Trigger>
                    <Tooltip.Content showArrow className="ccr-option-tooltip">
                      <div className="ccr-tooltip-section">
                        <div className="ccr-tooltip-label">说明</div>
                        <div>{option.description}</div>
                      </div>
                      <div className="ccr-tooltip-section">
                        <div className="ccr-tooltip-label">建议</div>
                        <span className={`ccr-tooltip-status ${support.tone}`}>
                          {support.statusText}
                        </span>
                        <div>{support.recommendation}</div>
                      </div>
                      <div className="ccr-tooltip-section">
                        <div className="ccr-tooltip-label">状态</div>
                        <span className={support.supported ? "ccr-tooltip-status ok" : "ccr-tooltip-status muted"}>
                          {support.supported ? "Codex 支持" : "当前配置不建议"}
                        </span>
                      </div>
                      <div className="ccr-tooltip-section">
                        <div className="ccr-tooltip-label">依据</div>
                        <div>{support.detail}</div>
                      </div>
                      <div className="ccr-tooltip-section">
                        <div className="ccr-tooltip-label">来源</div>
                        {support.source.url ? (
                          <a
                            className="ccr-tooltip-source"
                            href={support.source.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            onPointerDown={(event) => event.stopPropagation()}
                          >
                            {support.source.label}
                          </a>
                        ) : (
                          <span>{support.source.label}</span>
                        )}
                      </div>
                    </Tooltip.Content>
                  </Tooltip.Root>
                );
              })}
            </div>
            <div className="ccr-config-json-shell">
              <textarea
                className="ccr-config-json ccr-config-json-editor"
                spellCheck={false}
                aria-label="Codex config.toml"
                value={codexConfigTomlValue}
                readOnly={!isOfficialCodexDirect}
                onChange={(e) => {
                  if (!isOfficialCodexDirect) return;
                  const nextToml = e.currentTarget.value;
                  onConfigTomlChange(nextToml, extractTomlAssignment(nextToml, "model") || addForm.model);
                }}
              />
            </div>
            <span className="ccr-field-help">
              {isOfficialCodexDirect
                ? "官方模式会写入 `~/.codex/config.toml` 并按上方选项合并 TOML；切回三方配置时不会修改官方 auth.json。"
                : addForm.compat_mode === "direct"
                  ? "三方厂商连接会写入 custom provider 和 provider bearer token，不写入官方 auth.json。"
                  : addForm.api_format === "openai_responses"
                    ? `三方网关模式会写入本地网关 ${CODEX_LOCAL_PROXY_BASE_URL}；上游 token 只保存在 Switch++ profile 和网关配置中。`
                    : `三方网关模式会写入本地网关 ${CODEX_LOCAL_PROXY_BASE_URL}；Codex 仍走 Responses，本地网关负责适配到 Chat Completions。`}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
