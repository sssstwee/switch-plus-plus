import type { AddForm } from "./appTypes.ts";
import {
  buildClaudeDesktopProfileConfigPreview,
  buildCodexAuthJsonTemplate,
  buildCodexConfigTomlTemplate,
  buildCodexModelCatalogPreview,
  buildGatewayModels,
  buildGatewayConfigPreview,
  buildGrokBuildConfigPreview,
  buildHermesConfigPreview,
  buildOhMyOpenCodeConfigPreview,
  buildOhMyPiConfigPreview,
  buildOpenCodeConfigPreview,
  buildOpenClawConfigPreview,
  buildPiConfigPreview,
} from "./configPreviews.ts";
import { defaultCodexConfigOptions } from "./codexConfig.ts";
import { defaultModelMap } from "./gatewayProfile.ts";
import { allVendorPresets, customPreset } from "./vendorPresets.ts";

function equal<T>(actual: T, expected: T) {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, got ${String(actual)}`);
  }
}

function includes(source: string, expected: string) {
  if (!source.includes(expected)) {
    throw new Error(`Expected source to include ${expected}`);
  }
}

function excludes(source: string, expected: string) {
  if (source.includes(expected)) {
    throw new Error(`Expected source to exclude ${expected}`);
  }
}

const baseCodexForm: AddForm = {
  display_name: "阿里百炼",
  website_url: "",
  note: "",
  connection_mode: "gateway",
  compat_mode: "proxy",
  base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  api_key: "sk-test",
  api_format: "openai_responses",
  auth_field: "OPENAI_API_KEY",
  use_full_url: false,
  model: "qwen3.6-plus",
  auth_json: "",
  config_toml: "",
  hide_think_blocks: false,
  supports_1m_context: false,
  codex_config_options: { ...defaultCodexConfigOptions },
  model_map: defaultModelMap("qwen3.6-plus"),
  provider_model_map: defaultModelMap("qwen3.6-plus"),
  models: ["qwen3.6-plus"],
  config_options: {} as AddForm["config_options"],
};

includes(
  buildCodexConfigTomlTemplate(baseCodexForm),
  "# agent-switch codex compat: local gateway responses-pass-through",
);

includes(
  buildCodexConfigTomlTemplate(baseCodexForm),
  "# Switch++ exposes third-party models through model/model_provider, model_catalog_json, and the local /models catalog.",
);

includes(
  buildCodexConfigTomlTemplate(baseCodexForm),
  "# Official plugins, mobile access, and connectors remain official-account features; switch back to an official profile to manage or verify them.",
);

includes(
  buildCodexConfigTomlTemplate(baseCodexForm),
  'model_provider = "custom"',
);

includes(
  buildCodexConfigTomlTemplate(baseCodexForm),
  'model = "gpt-6-astra"',
);

excludes(
  buildCodexConfigTomlTemplate(baseCodexForm),
  'name = "qwen3.6-plus · 阿里百炼"',
);
includes(
  buildCodexConfigTomlTemplate(baseCodexForm),
  'name = "Switch++"',
);

includes(
  buildCodexConfigTomlTemplate(baseCodexForm),
  'model_catalog_json = "~/.codex/.agent-switch/custom_model_catalog.json"',
);

includes(
  buildCodexConfigTomlTemplate(baseCodexForm),
  'base_url = "http://127.0.0.1:23457/v1"',
);

includes(
  buildCodexConfigTomlTemplate(baseCodexForm),
  'experimental_bearer_token = "agent-switch-local-gateway"',
);

includes(
  buildCodexConfigTomlTemplate({ ...baseCodexForm, compat_mode: "direct" }),
  'base_url = "https://dashscope.aliyuncs.com/compatible-mode/v1"',
);

includes(
  buildCodexConfigTomlTemplate({ ...baseCodexForm, compat_mode: "direct" }),
  'experimental_bearer_token = "sk-test"',
);

const openAiLoginCodexConfig = buildCodexConfigTomlTemplate({
  ...baseCodexForm,
  display_name: "OpenAI API",
  base_url: "https://api.openai.com/v1",
  api_key: "",
  model: "gpt-6-astra",
  compat_mode: "direct",
  codex_config_options: {
    ...defaultCodexConfigOptions,
    disable_websockets: true,
  },
});
includes(openAiLoginCodexConfig, 'model_provider = "custom"');
includes(openAiLoginCodexConfig, "[model_providers.custom]");
includes(openAiLoginCodexConfig, 'base_url = "https://api.openai.com/v1"');
includes(openAiLoginCodexConfig, "requires_openai_auth = true");
includes(openAiLoginCodexConfig, "supports_websockets = false");
excludes(openAiLoginCodexConfig, 'experimental_bearer_token = ""');

includes(
  buildCodexConfigTomlTemplate({ ...baseCodexForm, compat_mode: "direct", api_format: "openai_chat" }),
  'base_url = "http://127.0.0.1:23457/v1"',
);

includes(
  buildCodexConfigTomlTemplate({ ...baseCodexForm, compat_mode: "direct", api_format: "openai_chat" }),
  'experimental_bearer_token = "agent-switch-local-gateway"',
);

const websocketDisabledCodexConfig = buildCodexConfigTomlTemplate({
  ...baseCodexForm,
  codex_config_options: {
    ...defaultCodexConfigOptions,
    disable_websockets: true,
  },
});
includes(websocketDisabledCodexConfig, "[model_providers.custom]");
includes(websocketDisabledCodexConfig, "supports_websockets = false");

const thirdPartyCodexConfigWithOssProvider = buildCodexConfigTomlTemplate({
  ...baseCodexForm,
  codex_config_options: {
    ...defaultCodexConfigOptions,
    oss_provider: "ollama",
  },
});
includes(thirdPartyCodexConfigWithOssProvider, 'oss_provider = "ollama"');

const customCodexConfigWithOssProvider = buildCodexConfigTomlTemplate(
  {
    ...baseCodexForm,
    codex_config_options: {
      ...defaultCodexConfigOptions,
      oss_provider: "lmstudio",
    },
  },
  customPreset,
);
includes(customCodexConfigWithOssProvider, 'oss_provider = "lmstudio"');

includes(
  buildCodexConfigTomlTemplate({ ...baseCodexForm, api_format: "openai_chat" }),
  "# agent-switch codex compat: local gateway responses-to-chat",
);

includes(
  buildCodexAuthJsonTemplate(baseCodexForm.api_key, true),
  "{}",
);

includes(
  buildCodexAuthJsonTemplate(baseCodexForm.api_key, false),
  "{}",
);

includes(
  buildCodexModelCatalogPreview(baseCodexForm),
  '"display_name": "qwen3.6-plus"',
);
includes(
  buildCodexModelCatalogPreview(baseCodexForm),
  '"displayName": "qwen3.6-plus"',
);
includes(
  buildCodexModelCatalogPreview(baseCodexForm),
  '"provider": "custom"',
);
includes(
  buildCodexModelCatalogPreview(baseCodexForm),
  '"hidden": false',
);
{
  const codexCatalog = JSON.parse(buildCodexModelCatalogPreview(baseCodexForm));
  const models = codexCatalog.models as Array<{
    slug: string;
    display_name: string;
    description: string;
    isDefault?: boolean;
  }>;
  const primarySlot = models.find((model) => model.slug === "gpt-6-astra");
  const solSlot = models.find((model) => model.slug === "gpt-6-sol");
  const lunaSlot = models.find((model) => model.slug === "gpt-6-luna");
  equal(primarySlot?.display_name, "qwen3.6-plus");
  equal(solSlot?.display_name, undefined);
  equal(lunaSlot?.display_name, undefined);
  equal(primarySlot?.isDefault, true);
  equal(models.length, 1);
}
{
  const codexCatalog = JSON.parse(buildCodexModelCatalogPreview(baseCodexForm, ["qwen3.6-flash", "qwen3-coder-plus"]));
  const displayNames = (codexCatalog.models as Array<{ display_name: string }>).map((model) => model.display_name);
  equal(displayNames.join(","), "qwen3.6-plus,qwen3.6-flash,qwen3-coder-plus");
}
{
  const codexCatalog = JSON.parse(buildCodexModelCatalogPreview(baseCodexForm, ["qwen3-coder-plus", "qwen3.6-flash"]));
  const displayNames = (codexCatalog.models as Array<{ display_name: string }>).map((model) => model.display_name);
  equal(displayNames.join(","), "qwen3.6-plus,qwen3-coder-plus,qwen3.6-flash");
}
{
  const deepseekPreset = allVendorPresets.find((preset) => preset.id === "deepseek") ?? null;
  const deepseekForm: AddForm = {
    ...baseCodexForm,
    display_name: "DeepSeek",
    compat_mode: "direct",
    base_url: "https://api.deepseek.com",
    model: "deepseek-v4-flash",
    model_map: defaultModelMap("deepseek-v4-flash"),
    provider_model_map: defaultModelMap("deepseek-v4-flash"),
    models: ["deepseek-v4-flash", "deepseek-v4-pro"],
    codex_config_options: { ...defaultCodexConfigOptions, high_reasoning: true },
  };
  const deepseekConfig = buildCodexConfigTomlTemplate(deepseekForm, deepseekPreset);
  includes(deepseekConfig, 'model = "deepseek-v4-flash"');
  includes(deepseekConfig, 'preferred_auth_method = "apikey"');
  includes(deepseekConfig, 'forced_login_method = "api"');
  includes(deepseekConfig, 'model_reasoning_effort = "high"');
  includes(deepseekConfig, 'base_url = "https://api.deepseek.com"');
  includes(deepseekConfig, 'wire_api = "responses"');
}
{
  const deepseekCatalog = JSON.parse(buildCodexModelCatalogPreview({
    ...baseCodexForm,
    display_name: "DeepSeek",
    compat_mode: "direct",
    base_url: "https://api.deepseek.com",
    model: "deepseek-v4-flash",
    model_map: defaultModelMap("deepseek-v4-flash"),
    provider_model_map: defaultModelMap("deepseek-v4-flash"),
  }));
  const [flash] = deepseekCatalog.models as Array<{
    display_name: string;
    context_window: number;
    truncation_policy: { limit: number };
    default_reasoning_level: string;
    supported_reasoning_levels: Array<{ effort: string }>;
    support_verbosity: boolean;
    web_search_tool_type: string;
    minimal_client_version: string;
  }>;
  equal(flash?.display_name, "deepseek-v4-flash");
  equal(flash?.context_window, 1_048_576);
  equal(flash?.truncation_policy.limit, 10_000);
  equal(flash?.default_reasoning_level, "high");
  equal(flash?.supported_reasoning_levels.map((level) => level.effort).join(","), "low,high,max");
  equal(flash?.support_verbosity, true);
  equal(flash?.web_search_tool_type, "text");
  equal(flash?.minimal_client_version, "0.144.0");
}
{
  const deepseekCatalog = JSON.parse(buildCodexModelCatalogPreview({
    ...baseCodexForm,
    display_name: "DeepSeek",
    compat_mode: "direct",
    base_url: "https://api.deepseek.com",
    model: "deepseek-v4-flash",
    model_map: defaultModelMap("deepseek-v4-flash"),
    provider_model_map: defaultModelMap("deepseek-v4-flash"),
  }, ["deepseek-v4-pro"]));
  const displayNames = (deepseekCatalog.models as Array<{ display_name: string }>).map((model) => model.display_name);
  equal(displayNames.join(","), "deepseek-v4-flash,deepseek-v4-pro");
}
{
  const directCatalog = JSON.parse(buildCodexModelCatalogPreview({ ...baseCodexForm, compat_mode: "direct" }));
  const slugs = (directCatalog.models as Array<{ slug: string }>).map((model) => model.slug);
  equal(slugs.includes("gpt-6-astra"), false);
  equal(slugs.includes("gpt-6-sol"), false);
  equal(slugs.includes("gpt-6-luna"), false);
  equal(slugs.includes("qwen3.6-plus"), true);
  includes(
    buildCodexConfigTomlTemplate({ ...baseCodexForm, compat_mode: "direct" }),
    'model = "qwen3.6-plus"',
  );
}
includes(
  buildCodexModelCatalogPreview(baseCodexForm),
  "via Switch++ local Responses gateway.",
);
if (buildCodexModelCatalogPreview(baseCodexForm).toLowerCase().includes("codex-shim")) {
  throw new Error("Codex model catalog preview must not expose codex-shim branding");
}

const thirdPartyGatewayModels = buildGatewayModels(defaultModelMap("qwen3.6-plus"), ["kimi-k2.6"]);
equal(thirdPartyGatewayModels.find((model) => model.name === "qwen3.6-plus")?.supports_1m, false);
equal(thirdPartyGatewayModels.find((model) => model.name === "kimi-k2.6")?.supports_1m, false);
equal(buildGatewayModels(defaultModelMap("vendor-custom-long-context"), [], true)[0]?.supports_1m, true);
equal(buildGatewayModels(defaultModelMap("deepseek-v4-pro"))[0]?.supports_1m, true);
equal(buildGatewayModels(defaultModelMap("deepseek-v4-flash"))[0]?.supports_1m, true);
equal(buildGatewayModels(defaultModelMap("deepseek-chat"))[0]?.supports_1m, false);
equal(buildGatewayModels(defaultModelMap("anthropic/claude-sonnet-4.6"))[0]?.supports_1m, true);
equal(buildGatewayModels(defaultModelMap("custom-provider-model[1m]"))[0]?.supports_1m, true);
equal(buildGatewayModels(defaultModelMap("moonshot-v1-1m"))[0]?.supports_1m, true);

const autoCompactClaudePreview = buildGatewayConfigPreview({
  ...baseCodexForm,
  display_name: "DeepSeek",
  base_url: "https://api.deepseek.com/anthropic",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_AUTH_TOKEN",
  model: "deepseek-v4-pro",
  model_map: defaultModelMap("deepseek-v4-pro"),
  supports_1m_context: true,
  config_options: {
    auto_compact: true,
    compact_early: true,
  } as AddForm["config_options"],
});

includes(autoCompactClaudePreview, '"autoCompactEnabled": true');
includes(autoCompactClaudePreview, '"CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "70"');
includes(autoCompactClaudePreview, '"ANTHROPIC_MODEL": "deepseek-v4-pro[1m]"');
includes(autoCompactClaudePreview, '"ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-v4-pro[1m]"');
includes(autoCompactClaudePreview, '"ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-v4-pro[1m]"');
includes(autoCompactClaudePreview, '"ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-v4-pro"');

const officialClaudeCodePreview = buildGatewayConfigPreview({
  ...baseCodexForm,
  display_name: "Anthropic 套餐",
  base_url: "",
  api_key: "",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_AUTH_TOKEN",
  model: "fable",
  model_map: {
    main: "fable",
    opus: "opus",
    sonnet: "sonnet",
    haiku: "haiku",
  },
  supports_1m_context: true,
  config_options: {} as AddForm["config_options"],
});

excludes(officialClaudeCodePreview, "ANTHROPIC_MODEL");
excludes(officialClaudeCodePreview, "ANTHROPIC_DEFAULT_OPUS_MODEL");
excludes(officialClaudeCodePreview, "ANTHROPIC_DEFAULT_SONNET_MODEL");
excludes(officialClaudeCodePreview, "ANTHROPIC_DEFAULT_HAIKU_MODEL");
excludes(officialClaudeCodePreview, "[1m]");
excludes(officialClaudeCodePreview, "ANTHROPIC_BASE_URL");

const deepseekClaudePreviewWithUserOverrideOff = buildGatewayConfigPreview({
  ...baseCodexForm,
  display_name: "DeepSeek",
  base_url: "https://api.deepseek.com/anthropic",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_AUTH_TOKEN",
  model: "deepseek-v4-pro",
  model_map: defaultModelMap("deepseek-v4-pro"),
  supports_1m_context: false,
  config_options: {} as AddForm["config_options"],
});

excludes(deepseekClaudePreviewWithUserOverrideOff, "deepseek-v4-pro[1m]");

const manual1mClaudePreview = buildGatewayConfigPreview({
  ...baseCodexForm,
  display_name: "自定义模型",
  base_url: "https://example.com/anthropic",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_AUTH_TOKEN",
  model: "vendor-custom-long-context",
  model_map: defaultModelMap("vendor-custom-long-context"),
  supports_1m_context: true,
  config_options: {} as AddForm["config_options"],
});

includes(manual1mClaudePreview, '"ANTHROPIC_MODEL": "vendor-custom-long-context[1m]"');
includes(manual1mClaudePreview, '"ANTHROPIC_DEFAULT_OPUS_MODEL": "vendor-custom-long-context[1m]"');
includes(manual1mClaudePreview, '"ANTHROPIC_DEFAULT_SONNET_MODEL": "vendor-custom-long-context[1m]"');

const bailianClaudePreviewWithStale1mOverride = buildGatewayConfigPreview({
  ...baseCodexForm,
  display_name: "阿里百炼",
  base_url: "https://dashscope.aliyuncs.com/apps/anthropic",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_AUTH_TOKEN",
  model: "qwen3.6-plus",
  model_map: defaultModelMap("qwen3.6-plus"),
  supports_1m_context: true,
  config_options: {} as AddForm["config_options"],
});

includes(bailianClaudePreviewWithStale1mOverride, '"ANTHROPIC_MODEL": "qwen3.6-plus"');
excludes(bailianClaudePreviewWithStale1mOverride, "qwen3.6-plus[1m]");

const stableClaudePreview = buildGatewayConfigPreview({
  ...baseCodexForm,
  display_name: "DeepSeek",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_AUTH_TOKEN",
  model: "deepseek-v4-pro",
  model_map: defaultModelMap("deepseek-v4-pro"),
  config_options: {
    disable_experimental_betas: true,
    disable_nonstreaming_fallback: true,
    disable_auto_memory: true,
    disable_agent_view: true,
    disable_auto_update: true,
    skip_webfetch_preflight: true,
  } as AddForm["config_options"],
});

excludes(stableClaudePreview, "CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS");
excludes(stableClaudePreview, "CLAUDE_CODE_DISABLE_NONSTREAMING_FALLBACK");
excludes(stableClaudePreview, "CLAUDE_CODE_DISABLE_AUTO_MEMORY");
excludes(stableClaudePreview, "CLAUDE_CODE_DISABLE_AGENT_VIEW");
excludes(stableClaudePreview, "DISABLE_AUTOUPDATER");
excludes(stableClaudePreview, "skipWebFetchPreflight");

const maxThinkingClaudePreview = buildGatewayConfigPreview({
  ...baseCodexForm,
  config_options: {
    max_thinking: true,
    skip_introduction: true,
  } as unknown as AddForm["config_options"],
});

includes(maxThinkingClaudePreview, '"CLAUDE_CODE_EFFORT_LEVEL": "max"');
includes(maxThinkingClaudePreview, '"alwaysThinkingEnabled": true');
excludes(maxThinkingClaudePreview, '"effortLevel"');
excludes(maxThinkingClaudePreview, '"skipIntroduction"');

const bypassPermissionsClaudePreview = buildGatewayConfigPreview({
  ...baseCodexForm,
  display_name: "DeepSeek",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_AUTH_TOKEN",
  model: "deepseek-v4-pro",
  model_map: defaultModelMap("deepseek-v4-pro"),
  config_options: {
    bypass_permissions: true,
  } as AddForm["config_options"],
});

includes(bypassPermissionsClaudePreview, '"permissions": {');
includes(bypassPermissionsClaudePreview, '"defaultMode": "bypassPermissions"');
includes(bypassPermissionsClaudePreview, '"skipDangerousModePermissionPrompt": true');

const directThirdPartyDesktopPreview = buildClaudeDesktopProfileConfigPreview({
  ...baseCodexForm,
  display_name: "MiniMax 套餐",
  compat_mode: "direct",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_API_KEY",
  base_url: "https://api.minimaxi.com/anthropic",
  model: "MiniMax-M2.7",
  model_map: defaultModelMap("claude-opus-4-7"),
  provider_model_map: defaultModelMap("MiniMax-M2.7"),
});

includes(directThirdPartyDesktopPreview, '"agentSwitchClient": "Claude Desktop"');
includes(directThirdPartyDesktopPreview, '"agentSwitchRoute": "direct"');
includes(directThirdPartyDesktopPreview, '"agentSwitchUpstreamBaseUrl": "https://api.minimaxi.com/anthropic"');
includes(directThirdPartyDesktopPreview, '"coworkEgressAllowedHosts": [');
includes(directThirdPartyDesktopPreview, '"*"');
includes(directThirdPartyDesktopPreview, '"inferenceGatewayBaseUrl": "https://api.minimaxi.com/anthropic"');
includes(directThirdPartyDesktopPreview, '"agentSwitchUpstreamModel": "MiniMax-M2.7"');

const directAnthropicDesktopPreview = buildClaudeDesktopProfileConfigPreview({
  ...baseCodexForm,
  display_name: "Anthropic API",
  compat_mode: "direct",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_API_KEY",
  base_url: "https://api.anthropic.com",
  api_key: "sk-ant-test",
  note: "Direct Anthropic API",
  website_url: "https://console.anthropic.com",
  model: "claude-fable-5",
  model_map: defaultModelMap("claude-fable-5"),
  provider_model_map: {
    main: "claude-fable-5",
    opus: "claude-opus-4-8",
    sonnet: "claude-sonnet-5",
    haiku: "claude-haiku-4-5-20251001",
  },
  models: ["claude-fable-5", "claude-opus-4-8", "claude-sonnet-5", "claude-haiku-4-5-20251001"],
});

includes(directAnthropicDesktopPreview, '"inferenceProvider": "anthropic"');
includes(directAnthropicDesktopPreview, '"inferenceAnthropicApiKey": "sk-ant-test"');
includes(directAnthropicDesktopPreview, '"name": "claude-fable-5"');
excludes(directAnthropicDesktopPreview, "inferenceGateway");

const bypassPermissionsDesktopPreview = buildClaudeDesktopProfileConfigPreview({
  ...baseCodexForm,
  display_name: "MiniMax 套餐",
  compat_mode: "direct",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_API_KEY",
  base_url: "https://api.minimaxi.com/anthropic",
  config_options: {
    bypass_permissions: true,
  } as AddForm["config_options"],
});

includes(bypassPermissionsDesktopPreview, '"permissions": {');
includes(bypassPermissionsDesktopPreview, '"defaultMode": "bypassPermissions"');
includes(bypassPermissionsDesktopPreview, '"bypass_permissions": true');

const officialPackageDesktopPreview = buildClaudeDesktopProfileConfigPreview({
  ...baseCodexForm,
  display_name: "Anthropic 套餐",
  compat_mode: "direct",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_AUTH_TOKEN",
  base_url: "",
  api_key: "",
  model: "claude-opus-4-7",
  model_map: defaultModelMap("claude-opus-4-7"),
  provider_model_map: defaultModelMap("claude-opus-4-7"),
});

includes(officialPackageDesktopPreview, '"agentSwitchClient": "Claude Desktop"');
includes(officialPackageDesktopPreview, '"agentSwitchRoute": "official"');
includes(officialPackageDesktopPreview, '"agentSwitchOfficialAuth": "claude.ai"');
excludes(officialPackageDesktopPreview, '"disableDeploymentModeChooser"');
excludes(officialPackageDesktopPreview, '"inferenceModels"');
excludes(officialPackageDesktopPreview, '"coworkEgressAllowedHosts"');
if (/inferenceGateway(BaseUrl|ApiKey|AuthField|ApiFormat)/.test(officialPackageDesktopPreview)) {
  throw new Error("Claude Desktop official package preview must stay isolated from gateway/API fields");
}

const hermesPreview = buildHermesConfigPreview({
  ...baseCodexForm,
  display_name: "阿里百炼",
  api_format: "openai_chat",
  auth_field: "OPENAI_API_KEY",
  base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  model: "qwen3.7-max",
  model_map: {
    ...defaultModelMap("qwen3.7-max"),
    sonnet: "qwen-plus",
  },
  models: ["qwen3.7-max", "qwen3.6-plus", "qwen3.6-flash"],
});

includes(hermesPreview, 'base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1"');
includes(hermesPreview, 'api_mode: "chat_completions"');
includes(hermesPreview, 'provider: "switch++"');
includes(hermesPreview, '- name: "switch++"');
includes(hermesPreview, 'model: "qwen3.7-max"');
includes(hermesPreview, '      "qwen3.6-plus":\n        context_length: 262144');
includes(hermesPreview, '      "qwen3.6-flash":\n        context_length: 262144');
if (hermesPreview.includes('      "qwen-plus":\n        context_length: 262144')) {
  throw new Error("Hermes title generation model should not be forced into custom_providers.models");
}
includes(hermesPreview, 'auxiliary:\n  title_generation:\n    provider: "switch++"\n    model: "qwen-plus"');

const minimaxHermesPreview = buildHermesConfigPreview({
  ...baseCodexForm,
  display_name: "MiniMax",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_API_KEY",
  base_url: "https://api.minimax.io/anthropic",
  model: "MiniMax-M2.7",
  model_map: defaultModelMap("MiniMax-M2.7"),
});

includes(minimaxHermesPreview, 'base_url: "https://api.minimax.io/anthropic"');
includes(minimaxHermesPreview, 'api_mode: "anthropic_messages"');
includes(minimaxHermesPreview, 'model: "MiniMax-M2.7"');

const grokBuildResponsesPreview = buildGrokBuildConfigPreview({
  ...baseCodexForm,
  api_format: "openai_responses",
  models: ["qwen3.6-plus", "qwen3.6-flash"],
});
includes(grokBuildResponsesPreview, "[models]");
includes(grokBuildResponsesPreview, 'default = "switchpp"');
includes(grokBuildResponsesPreview, "[model.switchpp]");
includes(grokBuildResponsesPreview, 'api_backend = "responses"');
includes(grokBuildResponsesPreview, 'api_key = "sk-test"');
includes(grokBuildResponsesPreview, "[model.switchpp-2]");

const grokBuildAnthropicPreview = buildGrokBuildConfigPreview({
  ...baseCodexForm,
  api_format: "anthropic",
  base_url: "https://api.anthropic.com/v1",
});
includes(grokBuildAnthropicPreview, 'api_backend = "messages"');
includes(grokBuildAnthropicPreview, 'extra_headers = { "x-api-key" = "sk-test", "anthropic-version" = "2023-06-01" }');
excludes(grokBuildAnthropicPreview, 'api_key = "sk-test"');

const googleHermesPreview = buildHermesConfigPreview({
  ...baseCodexForm,
  display_name: "Google AI",
  api_format: "gemini",
  auth_field: "GEMINI_API_KEY",
  base_url: "https://generativelanguage.googleapis.com/v1beta",
  model: "gemini-2.5-pro",
  model_map: defaultModelMap("gemini-2.5-pro"),
});

includes(googleHermesPreview, 'provider: "gemini"');
includes(googleHermesPreview, 'base_url: "https://generativelanguage.googleapis.com/v1beta"');
includes(googleHermesPreview, 'title_generation:\n    provider: "gemini"\n    model: "gemini-2.5-pro"');
if (googleHermesPreview.includes("custom_providers:")) {
  throw new Error("Gemini Hermes preview should use Hermes native gemini provider, not custom_providers");
}

const openCodePreview = buildOpenCodeConfigPreview({
  ...baseCodexForm,
  display_name: "阿里百炼套餐",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_AUTH_TOKEN",
  base_url: "https://coding.dashscope.aliyuncs.com/apps/anthropic/v1",
  model: "qwen3.6-plus",
  model_map: {
    main: "qwen3.6-plus",
    haiku: "qwen3.6-flash",
    sonnet: "claude-sonnet-legacy",
    opus: "claude-opus-legacy",
  },
  models: ["qwen3.6-plus", "qwen3-coder-plus"],
});

includes(openCodePreview, '"npm": "@ai-sdk/anthropic"');
includes(openCodePreview, '"baseURL": "https://coding.dashscope.aliyuncs.com/apps/anthropic/v1"');
includes(openCodePreview, '"small_model": "agent-switch-provider/qwen3.6-flash"');
includes(openCodePreview, '"qwen3-coder-plus"');
excludes(openCodePreview, "claude-sonnet-legacy");
excludes(openCodePreview, "claude-opus-legacy");

const ohMyOpenAgentPreview = buildOhMyOpenCodeConfigPreview({
  ...baseCodexForm,
  model: "qwen3.6-plus",
  model_map: {
    main: "qwen3.6-plus",
    haiku: "qwen3.6-flash",
    sonnet: "claude-sonnet-legacy",
    opus: "claude-opus-legacy",
  },
  models: ["qwen3.6-plus", "qwen3-coder-plus"],
});
includes(ohMyOpenAgentPreview, '"sisyphus": {\n      "model": "agent-switch-provider/qwen3.6-plus"');
excludes(ohMyOpenAgentPreview, "claude-sonnet-legacy");
excludes(ohMyOpenAgentPreview, "claude-opus-legacy");

const appModelForm = {
  ...baseCodexForm,
  model: "qwen3.7-max",
  model_map: {
    main: "qwen3.7-max",
    haiku: "claude-haiku-legacy",
    sonnet: "claude-sonnet-legacy",
    opus: "claude-opus-legacy",
  },
  models: ["qwen3.7-max", "qwen-plus"],
};

const openClawPreview = buildOpenClawConfigPreview(appModelForm);
includes(openClawPreview, '"primary": "agent-switch-provider/qwen3.7-max"');
includes(openClawPreview, '"id": "qwen-plus"');
excludes(openClawPreview, "claude-haiku-legacy");
excludes(openClawPreview, "claude-sonnet-legacy");
excludes(openClawPreview, "claude-opus-legacy");

const piPreview = buildPiConfigPreview(appModelForm);
includes(piPreview, '"defaultModel": "qwen3.7-max"');
includes(piPreview, '"id": "qwen-plus"');
excludes(piPreview, "claude-haiku-legacy");
excludes(piPreview, "claude-sonnet-legacy");
excludes(piPreview, "claude-opus-legacy");

const ohMyPiPreview = buildOhMyPiConfigPreview(appModelForm);
includes(ohMyPiPreview, 'model: "agent-switch-provider/qwen3.7-max"');
includes(ohMyPiPreview, 'id: "qwen-plus"');
excludes(ohMyPiPreview, "claude-haiku-legacy");
excludes(ohMyPiPreview, "claude-sonnet-legacy");
excludes(ohMyPiPreview, "claude-opus-legacy");
