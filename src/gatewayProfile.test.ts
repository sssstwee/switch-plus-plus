import {
  defaultModelMap,
  extractTomlAssignment,
  gatewayProfileUsesProxy,
  gatewayProfileUsesProxyForTarget,
  isAsciiHeaderValue,
  isModelMapEmpty,
  isOfficialAnthropicBaseUrl,
  isSubscriptionProxyBaseUrl,
  modelSupports1mContext,
  resolveGatewayFormCompatMode,
  resolveGatewayUpstreamModel,
  validateProviderModelMap,
} from "./gatewayProfile.ts";
import type { GatewayProfile, VendorPreset } from "./appTypes.ts";

function equal<T>(actual: T, expected: T) {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, got ${String(actual)}`);
  }
}

const baseProfile: GatewayProfile = {
  id: "test",
  display_name: "Test",
  website_url: "",
  note: "",
  base_url: "https://api.anthropic.com",
  api_key: "sk-test",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_AUTH_TOKEN",
  use_full_url: false,
  compat_mode: "direct",
  model_map: defaultModelMap("claude-sonnet-4-6"),
  config_options: {
    hide_ai_signature: false,
    teammates_mode: false,
    enable_tool_search: false,
    enable_gateway_model_discovery: false,
    enable_custom_model_option: false,
    declare_model_capabilities: false,
    disable_experimental_betas: false,
    enable_fine_grained_tool_streaming: false,
    enable_stream_watchdog: false,
    disable_nonstreaming_fallback: false,
    disable_interleaved_thinking: false,
    disable_adaptive_thinking: false,
    disable_thinking: false,
    max_thinking: false,
    enable_prompt_caching_1h: false,
    disable_1m_context: false,
    auto_compact: false,
    compact_early: false,
    disable_auto_memory: false,
    disable_background_tasks: false,
    disable_agent_view: false,
    show_thinking_summaries: false,
    disable_git_instructions: false,
    disable_away_summary: false,
    disable_spinner_tips: false,
    disable_terminal_progress: false,
    disable_syntax_highlighting: false,
    classic_tui: false,
    reduce_motion: false,
    disable_prompt_suggestions: false,
    disable_terminal_title: false,
    api_timeout_long: false,
    skip_webfetch_preflight: false,
    bypass_permissions: false,
    disable_telemetry: false,
    disable_nonessential_traffic: false,
    disable_auto_update: false,
    write_general_config: true,
  },
  models: [{ name: "claude-sonnet-4-6", supports_1m: false }],
  updated_at: 1,
};

const preset: VendorPreset = {
  id: "deepseek",
  name: "DeepSeek",
  description: "",
  website_url: "",
  base_url: "https://api.deepseek.com",
  request_url: "https://api.deepseek.com/anthropic",
  api_key_hint: "",
  api_key_url: "",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_AUTH_TOKEN",
  use_full_url: false,
  note: "",
  model_map: defaultModelMap("deepseek-v4-pro"),
  models: ["deepseek-v4-pro"],
  group: "domestic",
};

equal(isOfficialAnthropicBaseUrl(""), true);
equal(isOfficialAnthropicBaseUrl("https://api.anthropic.com"), true);
equal(isOfficialAnthropicBaseUrl("https://api.deepseek.com"), false);
equal(isSubscriptionProxyBaseUrl("http://127.0.0.1:8317/"), true);
equal(isSubscriptionProxyBaseUrl("http://127.0.0.1:8317/v1"), true);
equal(isSubscriptionProxyBaseUrl("http://127.0.0.1:23457"), false);

equal(isAsciiHeaderValue("sk-test"), true);
equal(isAsciiHeaderValue("sk-测试"), false);
equal(isModelMapEmpty(defaultModelMap("")), true);
equal(isModelMapEmpty({ ...defaultModelMap(""), haiku: "deepseek-v4-flash" }), false);
equal(modelSupports1mContext("claude-fable-5"), true);
equal(modelSupports1mContext("claude-opus-4-8"), true);
equal(modelSupports1mContext("claude-sonnet-5"), true);
equal(
  validateProviderModelMap(defaultModelMap(""), "https://api.deepseek.com/anthropic"),
  "请填写主模型对应的上游真实模型。",
);
equal(
  validateProviderModelMap(defaultModelMap("claude-opus-4-7"), "https://api.deepseek.com/anthropic"),
  "上游模型不能填写 Claude 官方模型名；请填写供应商真实模型。",
);
equal(
  validateProviderModelMap(defaultModelMap("anthropic/claude-sonnet-4.6"), "https://openrouter.ai/api"),
  null,
);
equal(
  validateProviderModelMap(defaultModelMap("claude-opus-4-7"), "https://api.anthropic.com"),
  null,
);

equal(gatewayProfileUsesProxy(baseProfile), false);
equal(gatewayProfileUsesProxy({ ...baseProfile, base_url: "https://api.deepseek.com" }), true);
equal(gatewayProfileUsesProxy({ ...baseProfile, api_format: "openai_chat" }), true);
equal(
  gatewayProfileUsesProxy({
    ...baseProfile,
    base_url: "http://127.0.0.1:8317",
    compat_mode: "proxy",
  }),
  true,
);
equal(resolveGatewayFormCompatMode({ ...baseProfile, compat_mode: "direct" }, preset), "direct");
equal(resolveGatewayFormCompatMode({ ...baseProfile, compat_mode: "proxy" }, preset), "proxy");
equal(resolveGatewayFormCompatMode({ ...baseProfile, compat_mode: undefined }, preset), "proxy");
const deepseekDirectProfile: GatewayProfile = {
  ...baseProfile,
  base_url: "https://api.deepseek.com/anthropic",
  api_format: "anthropic",
  compat_mode: "direct",
};
equal(gatewayProfileUsesProxyForTarget(deepseekDirectProfile, "claude_cli"), true);
equal(gatewayProfileUsesProxyForTarget(deepseekDirectProfile, "claude_desktop"), false);

equal(resolveGatewayUpstreamModel(baseProfile, preset), "deepseek-v4-pro");
equal(extractTomlAssignment('model = "gpt-5.5"\nmodel_provider = "openai"', "model"), "gpt-5.5");

for (const model of ["deepseek-flash", "claude-fable-5-1", "claude-opus-5-5", "claude-sonnet-5-5", "claude-haiku-5-5", "MiniMax-M3.1-Flash-Preview", "glm-5.3", "glm-5.3-flash", "kimi-k3", "k3", "kimi-for-coding", "gemini-4-argon", "gemini-3.8-flash"]) {
  equal(modelSupports1mContext(model), true);
}
equal(modelSupports1mContext("k3-256k"), false);
