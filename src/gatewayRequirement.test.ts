import type { CodexProfile, GatewayProfile } from "./appTypes.ts";
import {
  gatewayRequirementForProfile,
  gatewayRequirementForTarget,
} from "./gatewayRequirement.ts";

function equal<T>(actual: T, expected: T) {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, got ${String(actual)}`);
  }
}

function notMatch(actual: string, pattern: RegExp) {
  if (pattern.test(actual)) {
    throw new Error(`Expected ${actual} not to match ${pattern}`);
  }
}

const baseGatewayProfile: GatewayProfile = {
  id: "profile-1",
  display_name: "DeepSeek",
  website_url: "",
  note: "",
  base_url: "https://api.deepseek.com/anthropic",
  api_key: "sk-test",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_AUTH_TOKEN",
  use_full_url: false,
  compat_mode: "proxy",
  model_map: {
    main: "deepseek-v4-pro",
    haiku: "deepseek-v4-pro",
    sonnet: "deepseek-v4-pro",
    opus: "deepseek-v4-pro",
  },
  provider_model_map: {
    main: "deepseek-v4-pro",
    haiku: "deepseek-v4-pro",
    sonnet: "deepseek-v4-pro",
    opus: "deepseek-v4-pro",
  },
  config_options: {} as GatewayProfile["config_options"],
  models: [],
  updated_at: 0,
};

const directClaudeProfile: GatewayProfile = {
  ...baseGatewayProfile,
  id: "profile-2",
  display_name: "Anthropic",
  base_url: "https://api.anthropic.com",
  compat_mode: "direct",
};

const directThirdPartyClaudeProfile: GatewayProfile = {
  ...baseGatewayProfile,
  id: "profile-3",
  display_name: "阿里百炼",
  base_url: "https://dashscope.aliyuncs.com/apps/anthropic",
  compat_mode: "direct",
};

const genericDirectThirdPartyClaudeProfile: GatewayProfile = {
  ...baseGatewayProfile,
  id: "profile-generic-anthropic",
  display_name: "Example Anthropic 兼容",
  base_url: "https://llm-gateway.example.com/anthropic",
  compat_mode: "direct",
  model_map: {
    main: "example-pro",
    haiku: "example-fast",
    sonnet: "example-pro",
    opus: "example-pro",
  },
  provider_model_map: {
    main: "example-pro",
    haiku: "example-fast",
    sonnet: "example-pro",
    opus: "example-pro",
  },
};

const subscriptionProxyClaudeProfile: GatewayProfile = {
  ...baseGatewayProfile,
  id: "switchpp-chatgpt-subscription",
  display_name: "ChatGPT 订阅",
  base_url: "http://127.0.0.1:8317",
  compat_mode: "proxy",
  model_map: {
    main: "gpt-5.4",
    haiku: "gpt-5.4",
    sonnet: "gpt-5.4",
    opus: "gpt-5.4",
  },
};

const chatOnlyClaudeProfile: GatewayProfile = {
  ...baseGatewayProfile,
  id: "profile-4",
  display_name: "Chat 兼容上游",
  base_url: "https://api.example.com/v1",
  api_format: "openai_chat",
};

const minimaxClaudeProfile: GatewayProfile = {
  ...baseGatewayProfile,
  id: "profile-minimax",
  display_name: "MiniMax",
  base_url: "https://api.minimax.io/anthropic",
  model_map: {
    main: "MiniMax-M3",
    haiku: "MiniMax-M3",
    sonnet: "MiniMax-M3",
    opus: "MiniMax-M3",
  },
};

const kimiCodeClaudeProfile: GatewayProfile = {
  ...baseGatewayProfile,
  id: "profile-kimi-code",
  display_name: "Kimi 套餐",
  base_url: "https://api.kimi.com/coding/",
  model_map: {
    main: "k3",
    haiku: "k3",
    sonnet: "k3",
    opus: "k3",
  },
};

const siliconFlowClaudeProfile: GatewayProfile = {
  ...baseGatewayProfile,
  id: "profile-siliconflow",
  display_name: "硅基流动",
  base_url: "https://api.siliconflow.cn",
  model_map: {
    main: "zai-org/GLM-5.2",
    haiku: "zai-org/GLM-5.2",
    sonnet: "zai-org/GLM-5.2",
    opus: "zai-org/GLM-5.2",
  },
};


const modelscopeClaudeProfile: GatewayProfile = {
  ...baseGatewayProfile,
  id: "profile-modelscope",
  display_name: "ModelScope",
  base_url: "https://api-inference.modelscope.cn/v1/",
};

const codexProxyProfile: CodexProfile = {
  id: "codex-proxy",
  display_name: "MiniMax",
  website_url: "",
  note: "",
  connection_mode: "gateway",
  compat_mode: "proxy",
  base_url: "https://api.minimaxi.com/v1",
  api_key: "sk-test",
  model: "MiniMax-M3",
  auth_json: "{}",
  config_toml: "",
  codex_config_options: undefined,
  updated_at: 0,
};

const deepseekCodexProfile: CodexProfile = {
  ...codexProxyProfile,
  id: "codex-deepseek",
  display_name: "DeepSeek",
  compat_mode: "direct",
  api_format: "openai_responses",
  base_url: "https://api.deepseek.com",
  model: "deepseek-v4-flash",
};

const officialCodexProfile: CodexProfile = {
  ...codexProxyProfile,
  id: "codex-official",
  display_name: "OpenAI 套餐",
  connection_mode: "official",
  compat_mode: "direct",
};

const directThirdPartyCodexResponsesProfile: CodexProfile = {
  ...codexProxyProfile,
  id: "codex-bailian-responses",
  display_name: "阿里百炼",
  connection_mode: "gateway",
  compat_mode: "direct",
  base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  model: "qwen3.6-plus",
  api_format: "openai_responses",
};

const responsesPassthroughCodexProfile: CodexProfile = {
  ...directThirdPartyCodexResponsesProfile,
  id: "codex-bailian-responses-proxy",
  compat_mode: "proxy",
};

const directOpenAiCodexProfile: CodexProfile = {
  ...directThirdPartyCodexResponsesProfile,
  id: "codex-openai-api",
  display_name: "OpenAI API",
  base_url: "https://api.openai.com/v1",
  model: "gpt-5.5",
};

const legacyDirectThirdPartyCodexProfile: CodexProfile = {
  ...directThirdPartyCodexResponsesProfile,
  id: "codex-bailian-legacy-direct",
  api_format: "openai_chat",
};

equal(gatewayRequirementForProfile("codex", codexProxyProfile).label, "必须开启");
equal(gatewayRequirementForProfile("codex", codexProxyProfile).cornerLabel, "必开");
equal(
  gatewayRequirementForProfile("codex", codexProxyProfile).detail,
  "当前问题：Codex 客户端仍按 Responses 发送请求，但当前上游是 Chat Completions，绕过本地网关会协议不匹配。开启收益：Switch++ 负责协议适配、认证隔离、调用记录和统一启停。",
);
equal(gatewayRequirementForProfile("codex", officialCodexProfile).label, "无需开启");
equal(gatewayRequirementForProfile("codex", officialCodexProfile).cornerLabel, "无需");
equal(
  gatewayRequirementForProfile("codex", officialCodexProfile).detail,
  "OpenAI 套餐直连 Codex 官方服务，不经过 Switch++ 网关；调用记录仅适用于三方网关配置。",
);
equal(gatewayRequirementForProfile("codex", directThirdPartyCodexResponsesProfile).label, "建议开启");
equal(gatewayRequirementForProfile("codex", directThirdPartyCodexResponsesProfile).cornerLabel, "建议");
equal(gatewayRequirementForProfile("codex", responsesPassthroughCodexProfile).label, "必须开启");
equal(gatewayRequirementForProfile("codex", responsesPassthroughCodexProfile).cornerLabel, "必开");
equal(gatewayRequirementForProfile("codex", legacyDirectThirdPartyCodexProfile).label, "必须开启");
equal(gatewayRequirementForProfile("codex", legacyDirectThirdPartyCodexProfile).cornerLabel, "必开");
equal(
  gatewayRequirementForProfile("codex", directThirdPartyCodexResponsesProfile).detail,
  "当前建议：此配置没有把 Codex 指向 Switch++ 本地 Responses 兼容层，因此不是必开。开启后可通过本地兼容网关统一路由，并获得调用记录、统一启停和流式观测。",
);
equal(
  gatewayRequirementForProfile("codex", responsesPassthroughCodexProfile).detail,
  "当前问题：Codex 已写入 Switch++ 本地 Responses 地址；关闭后 Codex 会请求不可用的本地端口。开启收益：本地网关负责认证隔离、调用记录和统一启停。",
);
equal(gatewayRequirementForProfile("codex", directThirdPartyCodexResponsesProfile).detail.includes("codex-shim"), false);
equal(gatewayRequirementForProfile("codex", responsesPassthroughCodexProfile).detail.includes("shim"), false);
equal(gatewayRequirementForProfile("codex", directOpenAiCodexProfile).label, "无需开启");
notMatch(gatewayRequirementForProfile("codex", deepseekCodexProfile).limitation ?? "", /Anthropic|Messages|search_result/);
equal(
  (gatewayRequirementForProfile("codex", deepseekCodexProfile).limitation ?? "").includes("原生 Responses 支持 deepseek-flash 与 deepseek-v4-pro"),
  true,
);
notMatch(gatewayRequirementForProfile("claude_cli", chatOnlyClaudeProfile).detail, /OpenAI/);
notMatch(gatewayRequirementForProfile("claude_cli", modelscopeClaudeProfile).limitation ?? "", /OpenAI/);
notMatch(gatewayRequirementForProfile("codex", codexProxyProfile).limitation ?? "", /Anthropic/);
equal(gatewayRequirementForProfile("claude_cli", baseGatewayProfile).label, "必须开启");
equal(gatewayRequirementForProfile("claude_cli", directClaudeProfile).label, "无需开启");
equal(gatewayRequirementForProfile("claude_cli", directThirdPartyClaudeProfile).label, "必须开启");
equal(gatewayRequirementForProfile("claude_cli", directThirdPartyClaudeProfile).cornerLabel, "必开");
equal(
  gatewayRequirementForProfile("claude_cli", directThirdPartyClaudeProfile).detail,
  "当前问题：最新版 Claude Code 直连该厂商 Anthropic 兼容端点实测失败，需要通过 Switch++ 本地网关完成模型映射、请求清洗、工具 schema 压缩和兼容转发。",
);
equal(gatewayRequirementForProfile("claude_cli", genericDirectThirdPartyClaudeProfile).label, "建议开启");
equal(gatewayRequirementForProfile("claude_cli", genericDirectThirdPartyClaudeProfile).cornerLabel, "建议");
equal(
  gatewayRequirementForProfile("claude_cli", genericDirectThirdPartyClaudeProfile).detail,
  "当前问题：上游已支持 Anthropic Messages，Claude Code 可以直接连接厂商，但不经过本地网关会缺少模型别名、调用记录、请求预检和工具 schema 压缩。开启收益：本地网关保留原生协议能力，同时降低模型跑偏与 Prompt 过长风险。",
);
equal(gatewayRequirementForProfile("claude_cli", subscriptionProxyClaudeProfile).label, "必须开启");
equal(
  gatewayRequirementForProfile("claude_cli", subscriptionProxyClaudeProfile).detail,
  "当前配置需要通过 Switch++ 本地兼容网关连接内置 CLIProxyAPI；网关负责应用隔离、模型映射、认证转发和调用记录。",
);
equal(
  gatewayRequirementForProfile("claude_cli", baseGatewayProfile).detail,
  "当前问题：最新版 Claude Code 直连该厂商 Anthropic 兼容端点实测失败，需要通过 Switch++ 本地网关完成模型映射、请求清洗、工具 schema 压缩和兼容转发。",
);
equal(
  gatewayRequirementForProfile("claude_cli", baseGatewayProfile).limitation,
  "仍有限制：DeepSeek-Flash（V4.1）原生支持图片，图片直接发送给所选上游模型；纯文本模型请切换到支持图片的型号。",
);
equal(
  gatewayRequirementForProfile("claude_desktop", baseGatewayProfile).limitation,
  "仍有限制：DeepSeek-Flash（V4.1）原生支持图片，图片直接发送给所选上游模型；纯文本模型请切换到支持图片的型号。",
);
equal(
  gatewayRequirementForProfile("claude_cli", minimaxClaudeProfile).limitation,
  "仍有限制：MiniMax M3 原生支持图片和视频，但能力仍取决于 Claude 请求内容和 MiniMax 兼容端点；本地网关不能绕过格式、大小和计费限制。",
);
equal(gatewayRequirementForProfile("claude_cli", minimaxClaudeProfile).label, "必须开启");
equal(gatewayRequirementForProfile("claude_cli", minimaxClaudeProfile).cornerLabel, "必开");
equal(
  gatewayRequirementForProfile("claude_cli", kimiCodeClaudeProfile).limitation,
  "仍有限制：Kimi Code 的 k3 与 kimi-for-coding 等套餐 ID 不同于平台 API 型号；kimi-for-coding 已升级至 K2.8 Preview，能力仍取决于所选模型和套餐权限。",
);
equal(
  gatewayRequirementForProfile("claude_cli", siliconFlowClaudeProfile).limitation,
  "仍有限制：硅基流动文档说明只有 VLM 模型可处理图片；当前预设的 GLM-5.2 等文本模型仍按文本模型处理，本地网关不会自动切换到视觉模型。",
);
equal(gatewayRequirementForProfile("claude_cli", chatOnlyClaudeProfile).label, "必须开启");
equal(
  gatewayRequirementForProfile("claude_cli", chatOnlyClaudeProfile).detail,
  "当前问题：Claude 客户端发送 Claude 兼容请求，但当前上游不能直接接收该请求，绕过本地网关会协议不匹配。开启收益：Switch++ 负责协议适配、模型映射、认证隔离和调用记录。",
);
equal(gatewayRequirementForProfile("claude_desktop", directThirdPartyClaudeProfile).label, "必须开启");
equal(
  gatewayRequirementForProfile("claude_desktop", directThirdPartyClaudeProfile).detail,
  "当前问题：该厂商在 Claude Desktop 直连场景实测不可用，需要通过 Switch++ 本地网关完成模型映射、请求预检和兼容处理。",
);
equal(gatewayRequirementForProfile("claude_desktop", baseGatewayProfile).label, "无需开启");
equal(gatewayRequirementForProfile("claude_desktop", baseGatewayProfile).cornerLabel, "无需");
equal(
  gatewayRequirementForProfile("claude_desktop", baseGatewayProfile).detail,
  "该厂商 Anthropic 兼容端点已实测可由 Claude 直连使用，不需要开启 Switch++ 本地网关；需要调用记录、模型映射或请求清洗时再开启网关。",
);
equal(gatewayRequirementForProfile("claude_desktop", { ...minimaxClaudeProfile, compat_mode: "direct" }).label, "建议开启");

equal(
  gatewayRequirementForTarget("claude_cli", [directClaudeProfile, directThirdPartyClaudeProfile], directThirdPartyClaudeProfile.id).label,
  "必须开启",
);
equal(
  gatewayRequirementForTarget("claude_cli", [directClaudeProfile, baseGatewayProfile], directClaudeProfile.id).label,
  "无需开启",
);
equal(
  gatewayRequirementForTarget("claude_cli", [directClaudeProfile, baseGatewayProfile], baseGatewayProfile.id).label,
  "必须开启",
);
equal(
  gatewayRequirementForTarget("claude_cli", [directClaudeProfile, genericDirectThirdPartyClaudeProfile], directClaudeProfile.id).label,
  "建议开启",
);
equal(
  gatewayRequirementForTarget("codex", [responsesPassthroughCodexProfile], responsesPassthroughCodexProfile.id).label,
  "必须开启",
);
