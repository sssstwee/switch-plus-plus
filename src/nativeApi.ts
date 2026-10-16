import type {
  AppState,
  ClaudeDesktopConfigFiles,
  CodexProxyCallRecord,
  CodexProxyCallsPage,
  CodexProxyOverview,
  CodexProxyOverviewBucket,
  CodexProxyOverviewRange,
  CodexProxyStatus,
  LicenseActivationResult,
  LicenseActivationStatus,
  McpServerData,
  ModelDiscoveryResult,
  RestartAppResult,
  SkillData,
  SubscriptionProxyStatus,
  TargetKey,
} from "./appTypes.ts";
import { invokeNative, nativeCommand } from "./nativeIpc.ts";
import type { ProxyTargetKey } from "./proxyTargets.ts";
import type { ClientConfigContext } from "./configCapabilities.ts";

export const nativeApi = {
  getClientConfigContext: () => invokeNative<ClientConfigContext>(nativeCommand.getClientConfigContext),
  loadAppState: () => invokeNative<AppState>(nativeCommand.loadAppState),
  saveAppState: (state: AppState) => invokeNative<AppState>(nativeCommand.saveAppState, { state }),
  applyTargetProfile: (target: TargetKey, profileId: string, state?: AppState) =>
    invokeNative<AppState>(nativeCommand.applyTargetProfile, { state, target, profileId }),
  restartTargetApp: (target: TargetKey) =>
    invokeNative<RestartAppResult>(nativeCommand.restartTargetApp, { target }),
  discoverProviderModels: (baseUrl: string, apiKey: string, authField: string) =>
    invokeNative<ModelDiscoveryResult>(nativeCommand.discoverProviderModels, {
      baseUrl,
      apiKey,
      authField,
    }),
  readClaudeCodeSettings: () => invokeNative<string>(nativeCommand.readClaudeCodeSettings),
  readClaudeDesktopConfigFiles: (profileId: string) =>
    invokeNative<ClaudeDesktopConfigFiles>(nativeCommand.readClaudeDesktopConfigFiles, {
      profileId,
    }),
  codexProxyStatus: () => invokeNative<CodexProxyStatus>(nativeCommand.codexProxyStatus),
  codexProxyCallsPage: (
    target: ProxyTargetKey,
    page: number,
    pageSize: number,
    range: CodexProxyOverviewRange,
    bucket: CodexProxyOverviewBucket,
  ) =>
    invokeNative<Omit<CodexProxyCallsPage, "target">>(nativeCommand.codexProxyCallsPage, {
      target,
      page,
      pageSize,
      range,
      bucket,
    }).then((result) => ({ ...result, target })),
  codexProxyOverview: (
    target: ProxyTargetKey,
    range: CodexProxyOverviewRange,
    bucket: CodexProxyOverviewBucket,
  ) =>
    invokeNative<Omit<CodexProxyOverview, "target">>(nativeCommand.codexProxyOverview, {
      target,
      range,
      bucket,
    }).then((result) => ({ ...result, target })),
  codexProxyCallDetail: (target: ProxyTargetKey, id: number) =>
    invokeNative<CodexProxyCallRecord>(nativeCommand.codexProxyCallDetail, { target, id }),
  startCodexProxy: (target: ProxyTargetKey) =>
    invokeNative<CodexProxyStatus>(nativeCommand.startCodexProxy, { target }),
  stopCodexProxy: (target: ProxyTargetKey) =>
    invokeNative<CodexProxyStatus>(nativeCommand.stopCodexProxy, { target }),
  clearCodexProxyRecords: (target: ProxyTargetKey) =>
    invokeNative<CodexProxyStatus>(nativeCommand.clearCodexProxyRecords, { target }),
  subscriptionProxyStatus: () =>
    invokeNative<SubscriptionProxyStatus>(nativeCommand.subscriptionProxyStatus),
  loginSubscriptionProxyCodex: () =>
    invokeNative<SubscriptionProxyStatus>(nativeCommand.loginSubscriptionProxyCodex),
  startSubscriptionProxy: () =>
    invokeNative<SubscriptionProxyStatus>(nativeCommand.startSubscriptionProxy),
  stopSubscriptionProxy: () =>
    invokeNative<SubscriptionProxyStatus>(nativeCommand.stopSubscriptionProxy),
  configureSubscriptionProxyModel: (model: string) =>
    invokeNative<void>(nativeCommand.configureSubscriptionProxyModel, { model }),
  loadLicenseStatus: () =>
    invokeNative<LicenseActivationStatus>(nativeCommand.loadLicenseStatus),
  activateLicenseCode: (code: string) =>
    invokeNative<LicenseActivationResult>(nativeCommand.activateLicenseCode, { code }),
  refreshLicenseActivation: () =>
    invokeNative<LicenseActivationStatus>(nativeCommand.refreshLicenseActivation),
  clearLicenseActivation: () =>
    invokeNative<LicenseActivationResult>(nativeCommand.clearLicenseActivation),
  listMcpServers: () => invokeNative<McpServerData[]>(nativeCommand.listMcpServers),
  saveMcpServer: (server: McpServerData) => invokeNative<void>(nativeCommand.saveMcpServer, { server }),
  deleteMcpServer: (name: string) =>
    invokeNative<McpServerData[]>(nativeCommand.deleteMcpServer, { name }),
  listSkills: () => invokeNative<SkillData[]>(nativeCommand.listSkills),
  getSkillContent: (name: string) => invokeNative<string>(nativeCommand.getSkillContent, { name }),
  deleteSkill: (name: string) => invokeNative<SkillData[]>(nativeCommand.deleteSkill, { name }),
} as const;
