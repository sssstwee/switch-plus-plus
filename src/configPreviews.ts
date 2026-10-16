import type { AddForm, AppState, ModelMap, ProviderModel, TargetKey, VendorPreset } from "./appTypes.ts";
import {
  CODEX_LOCAL_GATEWAY_AUTH_TOKEN,
  CODEX_LOCAL_PROXY_BASE_URL,
  CLAUDE_CLI_LOCAL_GATEWAY_AUTH_TOKEN,
  CLAUDE_CLI_LOCAL_PROXY_BASE_URL,
  CLAUDE_DESKTOP_LOCAL_PROXY_BASE_URL,
  PROXY_HOST,
} from "./appConstants.ts";
import {
  buildCodexConfigOptionTomlParts,
  codexConfigOptionItems,
  getCodexConfigOptionSupport,
  normalizeCodexConfigOptions,
  type CodexConfigOptions,
} from "./codexConfig.ts";
import { sanitizeClaudeConfigOptionsForStableExperience } from "./gatewayConfigOptions.ts";
import { isAsciiHeaderValue, isOfficialAnthropicBaseUrl, modelSupports1mContext } from "./gatewayProfile.ts";
import { claudeDesktopGatewayModelMap, claudeDesktopGatewayModels } from "./vendorPresets.ts";
import { allowedReasoningEfforts, capabilityContextForForm, claudeModelCapabilities } from "./configCapabilities.ts";

// Re-export for backward compatibility — consumers should prefer appConstants.ts directly.
export { CODEX_LOCAL_PROXY_BASE_URL } from "./appConstants.ts";

function withCodexConfigDefaults(form: AddForm): AddForm {
  return {
    ...form,
    api_format: form.api_format || "openai_responses",
    auth_field: "OPENAI_API_KEY",
  };
}

function codexFormUsesProxy(form: Pick<AddForm, "compat_mode" | "api_format">) {
  return form.compat_mode === "proxy" || form.api_format !== "openai_responses";
}

function codexConfigBaseUrl(form: AddForm) {
  return codexFormUsesProxy(form) ? CODEX_LOCAL_PROXY_BASE_URL : form.base_url;
}

export function codexGatewayCompatComment(form: Pick<AddForm, "compat_mode" | "api_format">) {
  if (!codexFormUsesProxy(form)) return "# agent-switch codex compat: provider responses";
  if (form.api_format === "openai_responses") return "# agent-switch codex compat: local gateway responses-pass-through";
  return "# agent-switch codex compat: local gateway responses-to-chat";
}

export function localClaudeProxyBaseUrlForTarget(target: TargetKey) {
  return target === "claude_desktop" ? CLAUDE_DESKTOP_LOCAL_PROXY_BASE_URL : CLAUDE_CLI_LOCAL_PROXY_BASE_URL;
}

function gatewayFormRequiresLocalProxy(form: AddForm, target: TargetKey = "claude_cli") {
  const protocolRequiresProxy = form.api_format === "openai_chat" || form.api_format === "openai_responses";
  if (target === "claude_cli") return form.compat_mode === "proxy" || protocolRequiresProxy;
  return form.compat_mode === "proxy" || protocolRequiresProxy;
}

function gatewayConfigBaseUrl(form: AddForm, target: TargetKey = "claude_cli") {
  return gatewayFormRequiresLocalProxy(form, target) ? localClaudeProxyBaseUrlForTarget(target) : form.base_url;
}

function gatewayClientAuthEnv(form: AddForm, target: TargetKey): Record<string, string> {
  if (target === "claude_cli" && form.compat_mode === "proxy") {
    return { ANTHROPIC_AUTH_TOKEN: CLAUDE_CLI_LOCAL_GATEWAY_AUTH_TOKEN };
  }
  return form.api_key.trim() ? { [form.auth_field]: form.api_key } : {};
}

function originFromUrl(url: string) {
  const match = url.trim().match(/^(https?:\/\/[^/]+)/i);
  return match?.[1];
}

function isLocalGatewayUrl(url: string) {
  const normalized = url.trim().toLowerCase();
  return normalized.startsWith(`http://${PROXY_HOST}:`) || normalized.startsWith("http://localhost:");
}

function isMinimaxGatewayForm(form: AddForm) {
  const source = [
    form.display_name,
    form.website_url,
    form.note,
    form.base_url,
    form.model,
    form.model_map.main,
  ].join(" ").toLowerCase();
  return source.includes("minimax") || source.includes("minimaxi.com");
}

function minimaxApiHostForForm(form: AddForm) {
  const baseUrl = form.base_url.trim();
  const lowerBaseUrl = baseUrl.toLowerCase();
  const lowerWebsite = form.website_url.toLowerCase();
  const lowerNote = form.note.toLowerCase();
  if (isLocalGatewayUrl(baseUrl)) {
    if (lowerWebsite.includes("minimax.io") || lowerNote.includes("国际")) return "https://api.minimax.io";
    return "https://api.minimaxi.com";
  }
  if (lowerBaseUrl.includes("api.minimaxi.com")) return "https://api.minimaxi.com";
  if (lowerBaseUrl.includes("api.minimax.io")) return "https://api.minimax.io";
  return originFromUrl(baseUrl) || "https://api.minimaxi.com";
}

function minimaxMcpServerConfig(form: AddForm) {
  const apiKey = form.api_key.trim();
  if (!apiKey || !isMinimaxGatewayForm(form)) return null;
  return {
    command: "uvx",
    args: ["minimax-coding-plan-mcp", "-y"],
    env: {
      MINIMAX_API_KEY: apiKey,
      MINIMAX_API_HOST: minimaxApiHostForForm(form),
    },
  };
}

function writeGatewayApiKeyFields(target: Record<string, unknown>, form: AddForm) {
  const key = form.api_key.trim();
  if (!key || !isAsciiHeaderValue(key)) return;
  target.inferenceGatewayApiKey = key;
  target.inferenceGatewayAuthScheme = "bearer";
}

function writeClaudePermissionOptions(target: Record<string, unknown>, configOptions: AddForm["config_options"]) {
  if (!configOptions.bypass_permissions) return;
  target.permissions = {
    ...((target.permissions && typeof target.permissions === "object" && !Array.isArray(target.permissions))
      ? target.permissions as Record<string, unknown>
      : {}),
    defaultMode: "bypassPermissions",
    skipDangerousModePermissionPrompt: true,
  };
}

export function buildClaudeDesktopProfileConfigPreview(form: AddForm, metadata: ProviderModel[] = []) {
  if (isAnthropicOfficialPackageForm(form)) return "{}";
  const providerModelMap = form.provider_model_map ?? form.model_map;
  const usesLocalGateway = gatewayFormRequiresLocalProxy(form, "claude_desktop");
  const directAnthropic = isDirectAnthropicApiForm(form);
  const models = usesLocalGateway
    ? buildGatewayModels(claudeDesktopGatewayModelMap, claudeDesktopGatewayModels, form.supports_1m_context)
    : buildGatewayModels(providerModelMap, form.models, form.supports_1m_context);
  const config: Record<string, unknown> = {
    coworkEgressAllowedHosts: ["*"],
    disableDeploymentModeChooser: true,
    inferenceCredentialKind: "static",
    inferenceModels: models.map((model) => ({
      name: model.name, supports1m: model.supports_1m,
      labelOverride: metadata.find((entry) => entry.id === (usesLocalGateway ? providerModelMap.main || form.model : model.name))?.name || (usesLocalGateway ? providerModelMap.main || form.model : model.name),
    })),
    inferenceProvider: directAnthropic ? "anthropic" : "gateway",
    disableEssentialTelemetry: Boolean(form.config_options.disable_telemetry),
    disableNonessentialTelemetry: Boolean(form.config_options.disable_telemetry || form.config_options.disable_nonessential_traffic),
    ...(form.config_options.api_timeout_long ? {inferenceStreamIdleTimeoutSec: 600} : {}),
  };
  if (directAnthropic) config.inferenceAnthropicApiKey = form.api_key;
  else {
    config.inferenceGatewayBaseUrl = gatewayConfigBaseUrl(form, "claude_desktop");
    writeGatewayApiKeyFields(config, form);
  }
  return JSON.stringify(config, null, 2);
}

function isAnthropicOfficialPackageForm(form: AddForm) {
  return !form.base_url.trim()
    && !form.api_key.trim()
    && form.api_format === "anthropic"
    && form.display_name.trim().toLowerCase().includes("anthropic");
}

function isDirectAnthropicApiForm(form: AddForm) {
  return form.api_format === "anthropic"
    && form.auth_field === "ANTHROPIC_API_KEY"
    && Boolean(form.base_url.trim())
    && Boolean(form.api_key.trim())
    && isOfficialAnthropicBaseUrl(form.base_url);
}

export function buildClaudeDesktopMetaConfigPreview(
  state: AppState | null,
  editingId: string | null,
  form: AddForm,
) {
  const profileId = editingId || "<new-profile-id-after-save>";
  const entries = new Map<string, string>();
  for (const profile of state?.claude_desktop ?? []) {
    entries.set(profile.id, profile.display_name);
  }
  entries.set(profileId, form.display_name.trim() || "Claude Desktop");

  return JSON.stringify(
    {
      appliedId: state?.applied.claude_desktop ?? null,
      entries: Array.from(entries, ([id, name]) => ({ id, name })),
    },
    null,
    2,
  );
}

function primaryGatewayModel(form: AddForm) {
  return form.model || form.model_map.main || "gpt-6-astra";
}

function escapeTomlString(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

const CODEX_PROXY_MODEL_SLOT_PRIMARY = "gpt-6-astra";
const CODEX_PROXY_MODEL_SLOTS = [
  "gpt-6-astra",
  "gpt-6-sol",
  "gpt-6-luna",
] as const;
const CODEX_PROVIDER_DISPLAY_NAME = "Switch++";

function codexClientModel(form: AddForm) {
  return codexFormUsesProxy(form) ? CODEX_PROXY_MODEL_SLOT_PRIMARY : primaryGatewayModel(form);
}

export function buildCodexAuthJsonTemplate(apiKey = "", useLocalGatewayToken = false) {
  void apiKey;
  void useLocalGatewayToken;
  return JSON.stringify({}, null, 2);
}

function codexProviderBearerToken(form: AddForm) {
  return codexFormUsesProxy(form) ? CODEX_LOCAL_GATEWAY_AUTH_TOKEN : form.api_key.trim();
}

function codexProviderUsesOpenAiAuth(form: AddForm) {
  return !codexFormUsesProxy(form)
    && !form.api_key.trim()
    && /^https:\/\/api\.openai\.com\/v1\/?$/i.test(form.base_url.trim());
}

function codexProviderAuthLines(form: AddForm) {
  if (codexProviderUsesOpenAiAuth(form)) return ["requires_openai_auth = true"];
  return [`experimental_bearer_token = "${escapeTomlString(codexProviderBearerToken(form))}"`];
}

function codexModelCatalogPreviewPath() {
  return "~/.codex/.agent-switch/custom_model_catalog.json";
}

function codexCatalogContextWindowForModel(form: AddForm, model: string) {
  const label = `${form.display_name} ${form.note} ${form.base_url}`.toLowerCase();
  const supports1mContext = form.supports_1m_context ?? modelSupports1mContext(model);
  if (supports1mContext || label.includes("gemini")) return 1_000_000;
  if (/^gpt-(?:5|6)(?:[.-]|$)/i.test(model.trim()) || label.includes("openai")) return 400_000;
  if (model.trim().toLowerCase().includes("claude") || label.includes("anthropic")) return 200_000;
  return 128_000;
}

function codexGatewayModelCandidates(form: AddForm, extraModels?: string[]) {
  const seen = new Set<string>();
  const allModels: string[] = [];
  for (const model of [primaryGatewayModel(form), ...(extraModels ?? [])]) {
    const trimmed = model.trim();
    const key = trimmed.toLowerCase();
    if (trimmed && !seen.has(key)) {
      seen.add(key);
      allModels.push(trimmed);
    }
  }
  if (allModels.length === 0) allModels.push("gpt-6-astra");
  return allModels;
}

function codexProxyModelSlotPairs(form: AddForm, extraModels?: string[]) {
  const candidates = codexGatewayModelCandidates(form, extraModels);
  return candidates
    .slice(0, CODEX_PROXY_MODEL_SLOTS.length)
    .map((displayName, index) => ({
      slug: CODEX_PROXY_MODEL_SLOTS[index],
      displayName,
    }));
}

function codexCatalogModelEntries(form: AddForm, extraModels?: string[]) {
  if (form.compat_mode === "proxy") {
    return uniqueCodexCatalogEntries(codexProxyModelSlotPairs(form, extraModels));
  }
  return codexGatewayModelCandidates(form, extraModels).map((model) => ({ slug: model, displayName: model }));
}

function uniqueCodexCatalogEntries(entries: Array<{ slug: string; displayName: string }>) {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const key = entry.displayName.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildCodexModelCatalogPreview(form: AddForm, extraModels?: string[], metadata: ProviderModel[] = []) {
  const providerName = form.display_name || "Switch++";
  const routeDescription = form.compat_mode === "proxy"
    ? "via Switch++ local Responses gateway."
    : "via Switch++ Codex model catalog.";
  const allModels = codexCatalogModelEntries(form, extraModels);

  const catalogEntries = allModels.map(({ slug, displayName }, i) => {
    const isDeepSeekV4Responses = form.compat_mode === "direct"
      && form.api_format === "openai_responses"
      && form.base_url.toLowerCase().includes("api.deepseek.com")
      && /^(?:deepseek-flash|deepseek-v4-(?:flash(?:-vision-exp)?|pro))$/i.test(displayName);
    const isMinimaxM31Responses = form.compat_mode === "direct"
      && form.api_format === "openai_responses"
      && /^https:\/\/api\.(?:minimax\.io|minimaxi\.com)(?:\/|$)/i.test(form.base_url)
      && /^MiniMax-M3\.1-Flash-Preview$/i.test(displayName);
    const isOpenAiGpt6Responses = !codexFormUsesProxy(form)
      && /^https:\/\/api\.openai\.com\/v1\/?$/i.test(form.base_url.trim())
      && /^gpt-6(?:\.\d+)*-(?:astra|sol|luna)$/i.test(displayName);
    const isZaiResponses = form.compat_mode === "direct" && form.api_format === "openai_responses"
      && /^https:\/\/(?:api\.z\.ai|open\.bigmodel\.cn)\/api\/v1\/?$/i.test(form.base_url)
      && displayName === "glm-5.3";
    const isNativeVendor = isDeepSeekV4Responses || isMinimaxM31Responses || isZaiResponses;
    const supportsImages = (isDeepSeekV4Responses && !/pro$/i.test(displayName)) || isMinimaxM31Responses || isOpenAiGpt6Responses;
    const contextWindow = isDeepSeekV4Responses || isZaiResponses
      ? 1_048_576
      : isMinimaxM31Responses ? 524_288
      : isOpenAiGpt6Responses ? (form.supports_1m_context ? 872_000 : 272_000)
      : codexCatalogContextWindowForModel(form, displayName);
    const compactLimit = Math.max(8_000, Math.floor(contextWindow * 0.8));
    const truncationLimit = isNativeVendor
      ? 10_000
      : Math.min(64_000, Math.max(8_000, Math.floor(contextWindow * 0.32)));
    const live = metadata.find((model) => model.id === displayName);
    // Official Codex catalogs can reserve a smaller client window than the raw API limit.
    const liveContext = !isOpenAiGpt6Responses && !isMinimaxM31Responses ? live?.context_window : null;
    return {
      slug,
      display_name: displayName,
      displayName,
      description: `${providerName} · ${displayName} ${routeDescription}`,
      provider: "custom",
      hidden: false,
      wire_api: "responses",
      context_window: contextWindow,
      max_context_window: isOpenAiGpt6Responses ? 872_000 : contextWindow,
      auto_compact_token_limit: isNativeVendor ? null : compactLimit,
      truncation_policy: { mode: isZaiResponses ? "bytes" : "tokens", limit: truncationLimit },
      default_reasoning_level: isDeepSeekV4Responses ? "high" : isMinimaxM31Responses || isZaiResponses ? "max" : isOpenAiGpt6Responses && displayName === "gpt-6.1-sol" ? "low" : "medium",
      supported_reasoning_levels: isDeepSeekV4Responses || isZaiResponses
        ? [
            { effort: "low", description: "Fast responses with lighter reasoning" },
            { effort: "high", description: "Extra high reasoning depth for complex problems" },
            { effort: "max", description: "Maximum reasoning depth for the hardest problems" },
          ]
        : [
            { effort: "low", description: "Faster, lighter reasoning" },
            { effort: "medium", description: "Balanced speed and reasoning" },
            { effort: "high", description: "Deeper reasoning" },
            { effort: "xhigh", description: "Maximum reasoning where supported" },
            ...(isMinimaxM31Responses || isOpenAiGpt6Responses ? [{ effort: "max", description: "Maximum reasoning depth" }] : []),
          ],
      default_reasoning_summary: "none",
      reasoning_summary_format: isNativeVendor ? "experimental" : "none",
      supports_reasoning_summaries: isMinimaxM31Responses || isZaiResponses || isOpenAiGpt6Responses,
      default_verbosity: "low",
      support_verbosity: isDeepSeekV4Responses || isOpenAiGpt6Responses,
      apply_patch_tool_type: "freeform",
      web_search_tool_type: isNativeVendor ? "text" : "text_and_image",
      supports_search_tool: isNativeVendor || isOpenAiGpt6Responses,
      supports_parallel_tool_calls: true,
      experimental_supported_tools: [],
      input_modalities: supportsImages ? ["text", "image"] : ["text"],
      supports_image_detail_original: isDeepSeekV4Responses && supportsImages || isOpenAiGpt6Responses,
      shell_type: "shell_command",
      visibility: "list",
      minimal_client_version: isDeepSeekV4Responses ? "0.144.0" : isMinimaxM31Responses ? "0.146.0" : isOpenAiGpt6Responses ? (/^gpt-6-(?:sol|luna)$/i.test(displayName) ? "0.155.0" : "0.153.0") : "0.0.1",
      supported_in_api: true,
      availability_nux: null,
      upgrade: null,
      isDefault: i === 0,
      priority: 1000 - i,
      prefer_websockets: false,
      available_in_plans: ["free", "plus", "pro", "team", "business", "enterprise"],
      base_instructions: "You are a coding agent running in Codex through Switch++.",
      model_messages: {
        instructions_template: "You are Codex running on {model_name} through Switch++. Be a helpful, direct coding collaborator.",
        instructions_variables: { model_name: displayName },
      },
      ...(isNativeVendor ? {
        effective_context_window_percent: 95,
        comp_hash: "3000",
        tool_mode: isMinimaxM31Responses ? "code_mode_only" : null,
        multi_agent_version: "v2",
        use_responses_lite: false,
        include_skills_usage_instructions: false,
        auto_review_model_override: null,
      } : {}),
      ...(liveContext ? {context_window: liveContext, max_context_window: liveContext, auto_compact_token_limit: Math.floor(liveContext * 0.8)} : {}),
      ...(live?.input_modalities.length ? {input_modalities: live.input_modalities.filter((value) => value === "text" || value === "image")} : {}),
      ...(live?.capabilities?.effort === false ? {supported_reasoning_levels: []} : live?.reasoning_efforts?.length ? {supported_reasoning_levels: live.reasoning_efforts.map((effort) => ({effort, description: effort}))} : {}),
      ...(live?.capabilities?.reasoning_summary != null ? {supports_reasoning_summaries: live.capabilities.reasoning_summary} : {}),
      ...(live?.capabilities?.verbosity != null ? {support_verbosity: live.capabilities.verbosity} : {}),
      ...(live?.capabilities?.web_search != null ? {supports_search_tool: live.capabilities.web_search} : {}),
      ...(live?.default_reasoning ? {default_reasoning_level: live.default_reasoning} : {}),
    };
  });

  return JSON.stringify({ models: catalogEntries }, null, 2);
}

export function sanitizeCodexConfigOptionsForForm(form: AddForm, preset: VendorPreset | null = null): CodexConfigOptions {
  const next = normalizeCodexConfigOptions(form.codex_config_options);
  for (const option of codexConfigOptionItems) {
    const support = getCodexConfigOptionSupport(option, {
      model: form.model,
      compatMode: form.compat_mode,
      connectionMode: form.connection_mode,
      presetId: preset?.id,
      presetName: preset?.name,
      metadata: form.model_metadata, apiFormat: form.api_format, clientVersion: form.client_version,
    });
    if (!support.supported) {
      next[option.key] = false;
    }
  }
  const effort = next.reasoning_effort || (next.high_reasoning ? "high" : "");
  next.reasoning_effort = allowedReasoningEfforts("codex", capabilityContextForForm(form, "codex")).includes(effort) ? effort : "";
  next.high_reasoning = false;
  return next;
}

export function buildCodexConfigTomlTemplate(form: AddForm, preset: VendorPreset | null = null) {
  const providerId = "custom";
  const model = codexClientModel(form);
  const optionParts = buildCodexConfigOptionTomlParts(sanitizeCodexConfigOptionsForForm(form, preset), form.client_version);
  const compatComment = codexGatewayCompatComment(form);
  const isNativeVendor = !codexFormUsesProxy(form)
    && (preset?.id === "deepseek" || preset?.id.startsWith("minimax") || preset?.id.startsWith("zai-coding"));

  return [
    compatComment,
    "# Switch++ exposes third-party models through model/model_provider, model_catalog_json, and the local /models catalog.",
    "# Official plugins, mobile access, and connectors remain official-account features; switch back to an official profile to manage or verify them.",
    `model_provider = "${escapeTomlString(providerId)}"`,
    `model = "${escapeTomlString(model)}"`,
    `model_catalog_json = "${escapeTomlString(codexModelCatalogPreviewPath())}"`,
    ...(isNativeVendor
      ? ['forced_login_method = "api"']
      : []),
    ...optionParts.topLevelLines,
    ...(isNativeVendor ? ['web_search = "disabled"'] : []),
    "",
    `[model_providers.${providerId}]`,
    `name = "${escapeTomlString(CODEX_PROVIDER_DISPLAY_NAME)}"`,
    `base_url = "${escapeTomlString(codexConfigBaseUrl(form))}"`,
    `wire_api = "responses"`,
    ...codexProviderAuthLines(form),
    `request_max_retries = 3`,
    `stream_max_retries = 3`,
    `stream_idle_timeout_ms = 600000`,
    ...optionParts.providerLines,
    ...optionParts.sectionLines,
    ...(isNativeVendor ? [
      "",
      "[desktop]",
      `enabled-reasoning-efforts = [${allowedReasoningEfforts("codex", capabilityContextForForm(form, "codex")).map((level) => JSON.stringify(level)).join(", ")}]`,
    ] : []),
  ].join("\n");
}

export function withCodexTemplates(form: AddForm, preset: VendorPreset | null = null): AddForm {
  const normalized = withCodexConfigDefaults(form);
  return {
    ...normalized,
    auth_json: buildCodexAuthJsonTemplate(normalized.api_key, codexFormUsesProxy(normalized)),
    config_toml: buildCodexConfigTomlTemplate(normalized, preset),
  };
}

export function buildGatewayModels(
  modelMap: ModelMap,
  fallbackModels: string[] = [],
  supports1mContextOverride?: boolean,
) {
  const names = [modelMap.main, modelMap.haiku, modelMap.sonnet, modelMap.opus, ...fallbackModels]
    .map((model) => model.trim())
    .filter(Boolean);
  return Array.from(new Set(names)).map((name) => ({
    name,
    supports_1m: supports1mContextOverride ?? modelSupports1mContext(name),
  }));
}

export function buildTargetConfigPreview(form: AddForm, target: TargetKey = "claude_cli") {

  return buildGatewayConfigPreview(form, target);
}

function claudeCodeAllows1mSuffix(baseUrl: string) {
  const normalized = baseUrl.trim().toLowerCase();
  return Boolean(normalized)
    && !normalized.includes("api.anthropic.com")
    && !normalized.includes("dashscope.aliyuncs.com");
}

function withClaudeCode1mSuffix(model: string, supports1mContextOverride: boolean | undefined, baseUrl: string) {
  const trimmed = model.trim();
  const supports1mContext = supports1mContextOverride ?? modelSupports1mContext(trimmed);
  if (!trimmed || !claudeCodeAllows1mSuffix(baseUrl) || !supports1mContext || /\[1m]$/i.test(trimmed)) return trimmed;
  return `${trimmed}[1m]`;
}

function claudeCodeModelEnvValue(
  model: string,
  alias: "main" | "opus" | "sonnet" | "haiku",
  supports1mContextOverride?: boolean,
  baseUrl = "",
) {
  if (alias === "haiku") return model;
  return withClaudeCode1mSuffix(model, supports1mContextOverride, baseUrl);
}

export function buildGatewayConfigPreview(form: AddForm, target: TargetKey = "claude_cli") {
  const configOptions = target === "claude_cli" || target === "claude_desktop"
    ? sanitizeClaudeConfigOptionsForStableExperience(form.config_options)
    : form.config_options;
  const isOfficialPackage = target === "claude_cli" && isAnthropicOfficialPackageForm(form);
  const modelMap = target === "claude_cli" && !isOfficialPackage
    ? {
      main: claudeCodeModelEnvValue(form.model_map.main, "main", form.supports_1m_context, form.base_url),
      opus: claudeCodeModelEnvValue(form.model_map.opus, "opus", form.supports_1m_context, form.base_url),
      sonnet: claudeCodeModelEnvValue(form.model_map.sonnet, "sonnet", form.supports_1m_context, form.base_url),
      haiku: claudeCodeModelEnvValue(form.model_map.haiku, "haiku", form.supports_1m_context, form.base_url),
    }
    : form.model_map;
  const env: Record<string, string> = isOfficialPackage
    ? {}
    : {
        ANTHROPIC_BASE_URL: gatewayConfigBaseUrl(form, target),
        ...gatewayClientAuthEnv(form, target),
        ANTHROPIC_MODEL: modelMap.main,
        ANTHROPIC_DEFAULT_OPUS_MODEL: modelMap.opus,
        ANTHROPIC_DEFAULT_SONNET_MODEL: modelMap.sonnet,
        ANTHROPIC_DEFAULT_HAIKU_MODEL: modelMap.haiku,
      };
  const settings: Record<string, unknown> = { env };
  writeClaudePermissionOptions(settings, configOptions);

  if (configOptions.hide_ai_signature) {
    env.CLAUDE_CODE_ATTRIBUTION_HEADER = "0";
    settings.attribution = { commit: "", pr: "" };
  }

  if (configOptions.teammates_mode) {
    env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS = "1";
    settings.teammateMode = "in-process";
  }

  if (configOptions.enable_tool_search) {
    env.ENABLE_TOOL_SEARCH = "true";
  }

  if (!isOfficialPackage && configOptions.enable_gateway_model_discovery) {
    env.CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY = "1";
  }

  if (!isOfficialPackage && configOptions.enable_custom_model_option) {
    env.ANTHROPIC_CUSTOM_MODEL_OPTION = form.model_map.main;
    env.ANTHROPIC_CUSTOM_MODEL_OPTION_NAME = form.display_name || form.model_map.main;
    env.ANTHROPIC_CUSTOM_MODEL_OPTION_DESCRIPTION = `${form.display_name || "Custom gateway"} · ${form.model_map.main}`;
  }

  if (!isOfficialPackage && configOptions.declare_model_capabilities) {
    for (const role of ["haiku", "sonnet", "opus"] as const) {
      const capabilities = claudeModelCapabilities({...capabilityContextForForm(form, "claude_cli"), model: form.model_map[role]});
      if (capabilities.length) env[`ANTHROPIC_DEFAULT_${role.toUpperCase()}_MODEL_SUPPORTED_CAPABILITIES`] = capabilities.join(",");
    }
    const customCapabilities = claudeModelCapabilities(capabilityContextForForm(form, "claude_cli"));
    if (configOptions.enable_custom_model_option && customCapabilities.length) env.ANTHROPIC_CUSTOM_MODEL_OPTION_SUPPORTED_CAPABILITIES = customCapabilities.join(",");
  }

  if (configOptions.disable_experimental_betas) {
    env.CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS = "1";
  }

  if (configOptions.enable_fine_grained_tool_streaming) {
    env.CLAUDE_CODE_ENABLE_FINE_GRAINED_TOOL_STREAMING = "1";
  }

  if (configOptions.enable_stream_watchdog) {
    env.CLAUDE_ENABLE_STREAM_WATCHDOG = "1";
    env.CLAUDE_STREAM_IDLE_TIMEOUT_MS = "1800000";
  }

  if (configOptions.disable_nonstreaming_fallback) {
    env.CLAUDE_CODE_DISABLE_NONSTREAMING_FALLBACK = "1";
  }

  if (configOptions.disable_interleaved_thinking) {
    env.DISABLE_INTERLEAVED_THINKING = "1";
  }

  if (configOptions.disable_adaptive_thinking) {
    env.CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING = "1";
  }

  if (configOptions.disable_thinking) {
    env.CLAUDE_CODE_DISABLE_THINKING = "1";
  }

  const effort = configOptions.reasoning_effort || (configOptions.max_thinking ? "max" : "");
  if (allowedReasoningEfforts("claude_cli", capabilityContextForForm(form, "claude_cli")).includes(effort)) {
    env.CLAUDE_CODE_EFFORT_LEVEL = effort;
    if (claudeModelCapabilities(capabilityContextForForm(form, "claude_cli")).includes("thinking")) settings.alwaysThinkingEnabled = true;
  }

  if (configOptions.enable_prompt_caching_1h) {
    env.ENABLE_PROMPT_CACHING_1H = "1";
  }

  if (configOptions.disable_1m_context) {
    env.CLAUDE_CODE_DISABLE_1M_CONTEXT = "1";
  }

  if (configOptions.auto_compact) {
    settings.autoCompactEnabled = true;
  }

  if (configOptions.compact_early) {
    env.CLAUDE_AUTOCOMPACT_PCT_OVERRIDE = "70";
  }

  if (configOptions.disable_auto_memory) {
    env.CLAUDE_CODE_DISABLE_AUTO_MEMORY = "1";
    settings.autoMemoryEnabled = false;
  }

  if (configOptions.disable_background_tasks) {
    env.CLAUDE_CODE_DISABLE_BACKGROUND_TASKS = "1";
  }

  if (configOptions.disable_agent_view) {
    env.CLAUDE_CODE_DISABLE_AGENT_VIEW = "1";
    settings.disableAgentView = true;
  }

  if (configOptions.show_thinking_summaries) {
    settings.showThinkingSummaries = true;
  }

  if (configOptions.disable_git_instructions) {
    env.CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS = "1";
    settings.includeGitInstructions = false;
  }

  if (configOptions.disable_away_summary) {
    settings.awaySummaryEnabled = false;
  }

  if (configOptions.disable_spinner_tips) {
    settings.spinnerTipsEnabled = false;
  }

  if (configOptions.disable_terminal_progress) {
    settings.terminalProgressBarEnabled = false;
  }

  if (configOptions.disable_syntax_highlighting) {
    settings.syntaxHighlightingDisabled = true;
  }

  if (configOptions.classic_tui) {
    env.CLAUDE_CODE_DISABLE_ALTERNATE_SCREEN = "1";
    settings.tui = "default";
  }

  if (configOptions.reduce_motion) {
    settings.prefersReducedMotion = true;
  }

  if (configOptions.disable_prompt_suggestions) {
    env.CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION = "false";
  }

  if (configOptions.disable_terminal_title) {
    env.CLAUDE_CODE_DISABLE_TERMINAL_TITLE = "1";
  }

  if (configOptions.api_timeout_long) {
    env.API_TIMEOUT_MS = "3000000";
  }

  if (configOptions.skip_webfetch_preflight) {
    settings.skipWebFetchPreflight = true;
  }

  if (configOptions.disable_telemetry) {
    env.DISABLE_TELEMETRY = "1";
    env.DO_NOT_TRACK = "1";
  }

  if (configOptions.disable_nonessential_traffic) {
    env.CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC = "1";
  }

  if (configOptions.disable_auto_update) {
    env.DISABLE_AUTOUPDATER = "1";
  }

  const minimaxMcpServer = target === "claude_cli" ? minimaxMcpServerConfig(form) : null;
  if (minimaxMcpServer) {
    settings.mcpServers = { MiniMax: minimaxMcpServer };
  }

  if (Object.keys(env).length === 0) delete settings.env;

  return JSON.stringify(settings, null, 2);
}
