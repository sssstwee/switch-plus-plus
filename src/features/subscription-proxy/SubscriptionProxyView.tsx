import {
  ArrowsClockwise as RefreshIcon,
  CheckCircle as ReadyIcon,
  Key as LoginIcon,
  Play as StartIcon,
  Stop as StopIcon,
  TerminalWindow as TerminalIcon,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AppLanguage } from "../../appConstants.ts";
import type { SubscriptionProxyStatus } from "../../appTypes.ts";
import { nativeApi } from "../../nativeApi.ts";
import { Button, Chip } from "../../nativeUi.tsx";
import {
  selectSubscriptionProxyModel,
  subscriptionProxyUsableModels,
} from "../../subscriptionProxyConfig.ts";

type ProxyAction = "login" | "refresh" | "start" | "stop" | "sync";

type SubscriptionProxyViewProps = {
  language: AppLanguage;
  onProxyStatusChange: (
    status: SubscriptionProxyStatus,
    preferredModel?: string,
  ) => Promise<void>;
  syncedApplications: readonly string[];
};

const textByLanguage = {
  zh: {
    account: "Codex 账号",
    accounts: "个 Codex 账号",
    apiKey: "API Key",
    authDir: "授权目录",
    baseUrl: "Base URL",
    codexExcluded: "Codex 与 ChatGPT 应用保持各自官方登录和配置，不同步、也不经过此网关。",
    configPath: "托管配置",
    gatewayRunning: "网关已接入",
    gatewayStopped: "网关未接入",
    installed: "已内置",
    localOnly: "仅本机",
    localOnlyDescription: "固定监听 127.0.0.1；远程管理 API 与内置控制面板均已关闭。",
    login: "登录 ChatGPT",
    loggedIn: "已登录",
    loggingIn: "等待登录…",
    model: "模型",
    modelEmpty: "代理已启动，但暂未读到可用模型。登录完成后刷新状态。",
    notInstalled: "组件不可用",
    notLoggedIn: "未登录",
    notRunning: "未运行",
    refresh: "刷新",
    refreshing: "刷新中…",
    running: "运行中",
    start: "启动代理",
    starting: "启动中…",
    stop: "停止代理",
    stopping: "停止中…",
    syncedApplications: "已同步应用",
    syncedDescription: "代理运行时自动维护以下应用配置，停止后自动移除。",
    syncedEmpty: "尚未同步到应用配置列表。",
    syncing: "同步配置中…",
    subtitle: "通过内置 CLIProxyAPI，把 ChatGPT/Codex 官方订阅提供给本机 Claude Code、Claude Desktop。",
    title: "ChatGPT 订阅代理",
    unmanaged: "当前代理不是由本次 Switch++ 会话启动，需在原启动位置停止。",
    version: "版本",
  },
  en: {
    account: "Codex account",
    accounts: " Codex accounts",
    apiKey: "API Key",
    authDir: "Auth directory",
    baseUrl: "Base URL",
    codexExcluded: "Codex and ChatGPT keep their own official sign-ins and configuration; they are neither synced nor routed through this gateway.",
    configPath: "Managed config",
    gatewayRunning: "Gateway connected",
    gatewayStopped: "Gateway disconnected",
    installed: "Bundled",
    localOnly: "Local only",
    localOnlyDescription: "Bound to 127.0.0.1. Remote management and the bundled control panel are disabled.",
    login: "Sign in to ChatGPT",
    loggedIn: "Signed in",
    loggingIn: "Waiting for sign-in…",
    model: "Model",
    modelEmpty: "The proxy is running, but no models are available yet. Finish sign-in and refresh.",
    notInstalled: "Component unavailable",
    notLoggedIn: "Not signed in",
    notRunning: "Stopped",
    refresh: "Refresh",
    refreshing: "Refreshing…",
    running: "Running",
    start: "Start proxy",
    starting: "Starting…",
    stop: "Stop proxy",
    stopping: "Stopping…",
    syncedApplications: "Synced apps",
    syncedDescription: "These app profiles are maintained while the proxy runs and removed when it stops.",
    syncedEmpty: "No app profiles are currently synced.",
    syncing: "Syncing profile…",
    subtitle: "Use the bundled CLIProxyAPI to expose a ChatGPT/Codex subscription to local Claude Code and Claude Desktop.",
    title: "ChatGPT Subscription Proxy",
    unmanaged: "This proxy was not started by the current Switch++ session. Stop it from its original launcher.",
    version: "Version",
  },
} as const;

export default function SubscriptionProxyView({
  language,
  onProxyStatusChange,
  syncedApplications,
}: SubscriptionProxyViewProps) {
  const text = textByLanguage[language];
  const [status, setStatus] = useState<SubscriptionProxyStatus | null>(null);
  const [busy, setBusy] = useState<ProxyAction | null>("refresh");
  const [error, setError] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const initialRefreshStartedRef = useRef(false);

  const perform = useCallback(
    async (
      action: ProxyAction,
      request: () => Promise<SubscriptionProxyStatus>,
    ) => {
      setBusy(action);
      setError("");
      try {
        const nextStatus = await request();
        const nextModel = selectSubscriptionProxyModel(
          nextStatus.models,
          selectedModel,
        );
        setStatus(nextStatus);
        setSelectedModel(nextModel);
        await onProxyStatusChange(nextStatus, nextModel);
      } catch (requestError) {
        setError(
          requestError instanceof Error ? requestError.message : String(requestError),
        );
      } finally {
        setBusy(null);
      }
    },
    [onProxyStatusChange, selectedModel],
  );

  useEffect(() => {
    if (initialRefreshStartedRef.current) return;
    initialRefreshStartedRef.current = true;
    void perform("refresh", nativeApi.subscriptionProxyStatus);
  }, [perform]);
  const usableModels = useMemo(
    () => subscriptionProxyUsableModels(status?.models ?? []),
    [status?.models],
  );

  const selectModel = useCallback(async (model: string) => {
    setSelectedModel(model);
    if (!status) return;
    setBusy("sync");
    setError("");
    try {
      await onProxyStatusChange(status, model);
    } catch (syncError) {
      setError(
        syncError instanceof Error ? syncError.message : String(syncError),
      );
    } finally {
      setBusy(null);
    }
  }, [onProxyStatusChange, status]);

  const actionLabel =
    busy === "sync"
      ? text.syncing
      : busy === "login"
        ? text.loggingIn
        : busy === "start"
          ? text.starting
          : busy === "stop"
            ? text.stopping
            : busy === "refresh"
              ? text.refreshing
              : "";

  return (
    <div className="ccr-subscription-proxy-view">
      <header className="ccr-subscription-proxy-header">
        <div className="ccr-subscription-proxy-heading">
          <span className="ccr-subscription-proxy-heading-icon">
            <TerminalIcon className="h-5 w-5" />
          </span>
          <div>
            <h2>{text.title}</h2>
            <p>{text.subtitle}</p>
          </div>
        </div>
        <div className="ccr-subscription-proxy-actions">
          <Button
            size="sm"
            variant="secondary"
            isDisabled={busy !== null}
            onPress={() => void perform("refresh", nativeApi.subscriptionProxyStatus)}
          >
            <RefreshIcon className="h-4 w-4" />
            {busy === "refresh" ? text.refreshing : text.refresh}
          </Button>
          {status?.installed ? (
            <>
              <Button
                size="sm"
                variant="secondary"
                isDisabled={busy !== null}
                onPress={() => void perform("login", nativeApi.loginSubscriptionProxyCodex)}
              >
                <LoginIcon className="h-4 w-4" />
                {busy === "login" ? text.loggingIn : text.login}
              </Button>
              {status.running ? (
                <Button
                  size="sm"
                  variant="danger-soft"
                  isDisabled={busy !== null || !status.managed_by_app}
                  onPress={() => void perform("stop", nativeApi.stopSubscriptionProxy)}
                >
                  <StopIcon className="h-4 w-4" />
                  {busy === "stop" ? text.stopping : text.stop}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  isDisabled={busy !== null}
                  onPress={() => void perform("start", nativeApi.startSubscriptionProxy)}
                >
                  <StartIcon className="h-4 w-4" />
                  {busy === "start" ? text.starting : text.start}
                </Button>
              )}
            </>
          ) : null}
        </div>
      </header>

      {error ? <div className="ccr-subscription-proxy-error">{error}</div> : null}
      {busy && busy !== "refresh" ? (
        <div className="ccr-subscription-proxy-progress" aria-live="polite">
          <span className="ccr-env-spinner-sm" />
          {actionLabel}
        </div>
      ) : null}

      <section className="ccr-subscription-proxy-status" aria-label={text.title}>
        <div className="ccr-subscription-proxy-chips">
          <Chip size="sm" color={status?.installed ? "success" : "warning"}>
            {status?.installed ? text.installed : text.notInstalled}
          </Chip>
          <Chip size="sm" color={status?.codex_authenticated ? "success" : "warning"}>
            {status?.codex_authenticated ? text.loggedIn : text.notLoggedIn}
          </Chip>
          <Chip size="sm" color={status?.running ? "success" : "default"}>
            {status?.running ? text.running : text.notRunning}
          </Chip>
          <Chip size="sm" color={status?.gateway_running ? "success" : "default"}>
            {status?.gateway_running ? text.gatewayRunning : text.gatewayStopped}
          </Chip>
          <Chip size="sm" color="success">
            {text.localOnly}
          </Chip>
        </div>
        <p className="ccr-subscription-proxy-security">
          <ReadyIcon className="h-4 w-4" weight="fill" />
          {text.localOnlyDescription}
        </p>
        {status ? (
          <dl className="ccr-subscription-proxy-details">
            <div>
              <dt>{text.version}</dt>
              <dd>{status.version || "—"}</dd>
            </div>
            <div>
              <dt>{text.account}</dt>
              <dd>
                {status.codex_account_count}
                {text.accounts}
              </dd>
            </div>
            <div>
              <dt>{text.configPath}</dt>
              <dd title={status.config_path}>{status.config_path}</dd>
            </div>
            <div>
              <dt>{text.authDir}</dt>
              <dd title={status.auth_dir}>{status.auth_dir}</dd>
            </div>
          </dl>
        ) : null}
        {status?.running && !status.managed_by_app ? (
          <p className="ccr-subscription-proxy-unmanaged">{text.unmanaged}</p>
        ) : null}
      </section>

      {status?.running ? (
        <section className="ccr-subscription-proxy-clients">
          {usableModels.length > 0 ? (
            <>
              <label className="ccr-subscription-proxy-model">
                <span>{text.model}</span>
                <select
                  value={selectedModel}
                  disabled={busy !== null}
                  onChange={(event) =>
                    void selectModel(event.currentTarget.value)
                  }
                >
                  {usableModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </label>

              <div className="ccr-subscription-proxy-synced">
                <div className="ccr-subscription-proxy-section-head">
                  <div>
                    <h3>{text.syncedApplications}</h3>
                    <p>{text.syncedDescription}</p>
                  </div>
                  <Chip size="sm" color="success">
                    {syncedApplications.length}
                  </Chip>
                </div>
                {syncedApplications.length > 0 ? (
                  <ul className="ccr-subscription-proxy-synced-list">
                    {syncedApplications.map((application) => (
                      <li key={application}>
                        <ReadyIcon className="h-4 w-4" weight="fill" />
                        {application}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="ccr-subscription-proxy-synced-empty">
                    {text.syncedEmpty}
                  </p>
                )}
                <p className="ccr-subscription-proxy-codex-note">
                  {text.codexExcluded}
                </p>
              </div>

            </>
          ) : (
            <div className="ccr-subscription-proxy-empty">{text.modelEmpty}</div>
          )}
        </section>
      ) : null}
    </div>
  );
}
