import type { ApiFormat, AuthField, ModelMap, TargetKey, VendorPreset } from "./appTypes.ts";
import { defaultModelMap } from "./gatewayProfile.ts";

export const vendorIconPaths: Record<string, string> = {
  deepseek: "/vendor-icons/deepseek.ico",
  "minimax-cn": "/vendor-icons/minimax.ico",
  "minimax-global": "/vendor-icons/minimax.ico",
  "minimax-coding": "/vendor-icons/minimax.ico",
  "minimax-coding-cn": "/vendor-icons/minimax.ico",
  "minimax-coding-global": "/vendor-icons/minimax.ico",
  "glm-cn": "/vendor-icons/bigmodel.png",
  "zai-global": "/vendor-icons/zai.svg",
  "zai-coding": "/vendor-icons/zai.svg",
  "zai-coding-cn": "/vendor-icons/zai.svg",
  "kimi-cn": "/vendor-icons/kimi.svg",
  "kimi-global": "/vendor-icons/kimi.svg",
  "kimi-code": "/vendor-icons/kimi.svg",
  siliconflow: "/vendor-icons/siliconflow.png",
  bailian: "/vendor-icons/bailian.svg",
  "bailian-coding": "/vendor-icons/bailian.svg",
  modelscope: "/vendor-icons/modelscope.png",
  "openai-package": "/vendor-icons/openai.svg",
  openai: "/vendor-icons/openai.svg",
  "anthropic-package": "/vendor-icons/anthropic.png",
  anthropic: "/vendor-icons/anthropic.png",
  openrouter: "/vendor-icons/openrouter.ico",
};

export const claudeDesktopGatewayModelMap: ModelMap = {
  main: "Fable5",
  haiku: "Fable5",
  sonnet: "Fable5",
  opus: "Fable5",
};

export const claudeDesktopGatewayModels = ["Fable5"];

// Verified 2026-10-16: https://platform.claude.com/docs/en/models/overview
export const claudeApiModelMap: ModelMap = {
  main: "claude-fable-5-1",
  opus: "claude-opus-5-5",
  sonnet: "claude-sonnet-5-5",
  haiku: "claude-haiku-5-5",
};

export const claudeApiModels = [
  "claude-fable-5-1",
  "claude-opus-5-5",
  "claude-sonnet-5-5",
  "claude-haiku-5-5",
];

// Current authenticated Codex menu fallback. The server-provided catalog remains the availability source of truth.
// https://developers.openai.com/codex/models
// https://developers.openai.com/api/docs/guides/latest-model
export const openaiPackageModels = [
  "gpt-6-astra",
  "gpt-6.1-sol",
  "gpt-6-sol",
  "gpt-6-luna",
];

export const customPreset: VendorPreset = {
  id: "custom",
  name: "自定义配置",
  description: "手动填写供应商、请求地址、API Key 与模型",
  website_url: "",
  base_url: "",
  request_url: "",
  api_key_hint: "输入 API Key",
  api_key_url: "",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_AUTH_TOKEN",
  use_full_url: false,
  note: "",
  model_map: defaultModelMap("gpt-6-astra"),
  models: ["gpt-6-astra"],
  group: "custom",
  codex_support_status: "unconfirmed",
  codex_support_note: "自定义 Codex 配置不会假定兼容性；请先确认厂商支持 OpenAI Responses API，或可由 Switch++ 本地网关适配到 OpenAI Chat Completions。",
};

// Model IDs and protocol availability verified against vendor docs on 2026-10-16.
// Aggregator availability still comes from each account's /models endpoint.
const domesticPresets: VendorPreset[] = [
  { id: "deepseek", name: "DeepSeek", description: "DeepSeek API · Responses / Anthropic 兼容", website_url: "https://platform.deepseek.com", base_url: "https://api.deepseek.com", request_url: "https://api.deepseek.com/anthropic", api_key_hint: "sk-...", api_key_url: "https://platform.deepseek.com/api_keys", api_format: "anthropic", auth_field: "ANTHROPIC_AUTH_TOKEN", use_full_url: false, note: "DeepSeek-Flash（V4.1）支持图片；Flash 与 V4-Pro 均支持 Codex 原生 Responses", model_map: { main: "deepseek-flash", haiku: "deepseek-flash", sonnet: "deepseek-flash", opus: "deepseek-v4-pro" }, models: ["deepseek-flash", "deepseek-v4-pro"], group: "domestic", supported_targets: ["codex"], codex_compat_mode: "direct", codex_support_status: "responses", codex_support_note: "DeepSeek 官方 Codex 文档提供 deepseek-flash 与 deepseek-v4-pro 原生 Responses 配置；Flash 支持图片，Pro 为纯文本。", codex_support_url: "https://api-docs.deepseek.com/quick_start/agent_integrations/codex", claude_desktop_supported: true, claude_desktop_support_note: "DeepSeek 官方文档提供了面向 Claude 兼容调用的模型映射说明。" },
  { id: "minimax-cn", name: "MiniMax", description: "MiniMax · 国内站", website_url: "https://www.minimaxi.com", base_url: "https://api.minimaxi.com/v1", request_url: "https://api.minimaxi.com/anthropic", api_key_hint: "mm-...", api_key_url: "https://platform.minimaxi.com/user-center/basic-information/interface-key", api_format: "anthropic", auth_field: "ANTHROPIC_API_KEY", use_full_url: false, note: "中国区 Claude Code endpoint", model_map: defaultModelMap("MiniMax-M3"), models: ["MiniMax-M3", "MiniMax-M2.7", "MiniMax-M2.7-highspeed"], group: "domestic", supported_targets: ["codex"], codex_compat_mode: "direct", codex_support_status: "responses", codex_support_note: "MiniMax 官方已提供原生 Responses API，可直接连接最新版 Codex；M3.1 Flash Preview 使用官方推荐的 512K 上下文。", codex_support_url: "https://platform.minimax.io/docs/m-plan/codex", claude_desktop_supported: true, claude_desktop_support_note: "MiniMax 官方文档提供了 Claude 兼容模型映射说明。" },
  { id: "glm-cn", name: "GLM (智谱)", description: "智谱 AI · 国内站", website_url: "https://open.bigmodel.cn", base_url: "https://open.bigmodel.cn/api/paas/v4", request_url: "https://open.bigmodel.cn/api/anthropic", api_key_hint: "zhipu-...", api_key_url: "https://open.bigmodel.cn/usercenter/apikeys", api_format: "anthropic", auth_field: "ANTHROPIC_AUTH_TOKEN", use_full_url: false, note: "智谱 Claude API 兼容地址", model_map: { main: "glm-5.3", haiku: "glm-5.3-flash", sonnet: "glm-5.3-flash", opus: "glm-5.3" }, models: ["glm-5.3", "glm-5.3-flash", "glm-5.3-flashx", "glm-5.2", "glm-5.1"], group: "domestic", supported_targets: ["codex"], codex_support_status: "gateway", codex_support_note: "智谱/Z.ai 官方 Coding Plan 文档提供 Chat Completions 端点；Codex 通过 Switch++ 本地网关适配后可用；按量调用与 Coding Plan 使用不同端点，请按所购方案选择。", codex_support_url: "https://docs.z.ai/devpack/tool/others", claude_desktop_supported: false, claude_desktop_support_note: "智谱开放平台提供 Claude 兼容 API，需订阅 Coding 套餐。" },
  { id: "kimi-cn", name: "Kimi (Moonshot)", description: "月之暗面 · 国内站", website_url: "https://platform.kimi.ai", base_url: "https://api.moonshot.cn/v1", request_url: "https://api.moonshot.cn/anthropic", api_key_hint: "sk-...", api_key_url: "https://platform.kimi.ai/console/api-keys", api_format: "anthropic", auth_field: "ANTHROPIC_AUTH_TOKEN", use_full_url: false, note: "Kimi 平台 Claude-compatible endpoint", model_map: { main: "kimi-k3", haiku: "kimi-k2.7-code-highspeed", sonnet: "kimi-k2.7-code", opus: "kimi-k3" }, models: ["kimi-k3", "kimi-k2.7-code", "kimi-k2.7-code-highspeed", "kimi-k2.6"], group: "domestic", supported_targets: ["codex"], codex_support_status: "gateway", codex_support_note: "Kimi 官方 API 文档确认 OpenAI Chat Completions 兼容格式；Codex 通过 Switch++ 本地网关适配后可用。", codex_support_url: "https://platform.kimi.ai/docs/api/overview", claude_desktop_supported: false, claude_desktop_support_note: "Kimi 平台 API 需订阅 Coding 套餐才能用于 Codex。" },
  { id: "siliconflow", name: "硅基流动", description: "SiliconFlow · OpenAI / Anthropic 兼容", website_url: "https://siliconflow.cn", base_url: "https://api.siliconflow.cn/v1", request_url: "https://api.siliconflow.cn", api_key_hint: "sk-...", api_key_url: "https://cloud.siliconflow.cn/account/ak", api_format: "anthropic", auth_field: "ANTHROPIC_AUTH_TOKEN", use_full_url: false, note: "Codex 使用 /v1/chat/completions；Claude 使用 /v1/messages", model_map: defaultModelMap("zai-org/GLM-5.2"), models: ["zai-org/GLM-5.2", "moonshotai/Kimi-K2.7-Code", "deepseek-ai/DeepSeek-V4-Pro", "Pro/moonshotai/Kimi-K2.6"], group: "domestic", supported_targets: ["codex", "claude_cli", "claude_desktop"], codex_support_status: "gateway", codex_support_note: "硅基流动提供 Chat Completions 兼容端点；Codex 通过 Switch++ 本地网关适配后可用。", codex_support_url: "https://docs.siliconflow.cn/en/api-reference/chat-completions/chat-completions", claude_desktop_supported: true, claude_desktop_support_note: "硅基流动提供 Claude 兼容接口，可用于 Claude Code/Claude Desktop。" },
  { id: "bailian", name: "阿里百炼", description: "DashScope 百炼 · Responses / Anthropic 兼容", website_url: "https://bailian.console.aliyun.com", base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1", request_url: "https://dashscope.aliyuncs.com/apps/anthropic", api_key_hint: "sk-...", api_key_url: "https://bailian.console.aliyun.com/?apiKey=1", api_format: "anthropic", auth_field: "ANTHROPIC_AUTH_TOKEN", use_full_url: false, note: "Codex 使用 Responses-compatible endpoint；Claude 使用 Claude 兼容端点", model_map: { main: "qwen3.8-max", haiku: "qwen3.8-flash", sonnet: "qwen3.7-plus", opus: "qwen3.8-max" }, models: ["qwen3.8-max", "qwen3.7-plus", "qwen3.8-flash", "qwen3-coder-plus"], group: "domestic", supported_targets: ["codex", "claude_cli", "claude_desktop"], codex_compat_mode: "direct", codex_support_status: "responses", codex_support_note: "阿里百炼官方 Codex 文档确认按量计费可用 Responses API，最新版 Codex 应写入 wire_api = \"responses\"。", codex_support_url: "https://help.aliyun.com/zh/model-studio/codex", claude_desktop_supported: true, claude_desktop_support_note: "阿里百炼官方提供 Claude 兼容端点，可用于 Claude。" },
  { id: "modelscope", name: "ModelScope", description: "魔搭社区 · OpenAI 兼容", website_url: "https://modelscope.cn", base_url: "https://api-inference.modelscope.cn/v1", request_url: "https://api-inference.modelscope.cn/v1", api_key_hint: "ms-...", api_key_url: "https://modelscope.cn/my/myaccesstoken", api_format: "openai_chat", auth_field: "OPENAI_API_KEY", use_full_url: false, note: "官方 API-Inference 文档确认 OpenAI-compatible endpoint；未确认 Anthropic-compatible endpoint", model_map: defaultModelMap("ZhipuAI/GLM-5.2"), models: ["ZhipuAI/GLM-5.2", "MiniMax/MiniMax-M3", "deepseek-ai/DeepSeek-V4-Pro", "Qwen/Qwen3.5-397B-A17B"], group: "domestic", supported_targets: ["codex"], codex_support_status: "gateway", codex_support_note: "ModelScope 提供 OpenAI 兼容模型推理端点；Codex 可通过 Switch++ 本地网关适配后使用，具体模型仍需实测。", codex_support_url: "https://modelscope.cn/docs/model-service/API-Inference/intro", claude_desktop_supported: false, claude_desktop_support_note: "未找到 ModelScope 官方 Anthropic-compatible / Claude Code 接入端点说明；Claude 类目标暂不标记为官方支持。" },
];

export const openaiPackagePreset: VendorPreset = {
  id: "openai-package",
  name: "OpenAI 套餐",
  description: "ChatGPT 套餐 / 官方登录",
  website_url: "https://chatgpt.com/codex",
  base_url: "",
  request_url: "",
  api_key_hint: "",
  api_key_url: "",
  api_format: "openai_responses",
  auth_field: "OPENAI_API_KEY",
  use_full_url: false,
  note: "ChatGPT 套餐包含 Codex 时，使用本地 auth.json 与 config.toml，不需要手填 API Key；GPT-6 模型请使用最新版 Codex，模型可用性与额度按当前套餐控制",
  model_map: defaultModelMap("gpt-6-astra"),
  models: openaiPackageModels,
  group: "international",
  supported_targets: ["codex"],
  codex_support_status: "responses",
  codex_support_note: "OpenAI 官方 Codex 配置参考确认自定义 provider 当前只支持 Responses 协议；官方账号额度与模型可用性按 ChatGPT 计划控制。",
  codex_support_url: "https://developers.openai.com/codex/config-reference/",
};

const anthropicPackagePreset: VendorPreset = {
  id: "anthropic-package",
  name: "Anthropic 套餐",
  description: "官方登录 / 套餐",
  website_url: "https://claude.ai",
  base_url: "",
  request_url: "",
  api_key_hint: "",
  api_key_url: "",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_AUTH_TOKEN",
  use_full_url: false,
  note: "Claude Code 使用本地官方登录态，不需要手填 API Key",
  model_map: defaultModelMap("default"),
  models: ["default"],
  group: "international",
  supported_targets: ["claude_cli", "claude_desktop"],
};

const internationalPresets: VendorPreset[] = [
  openaiPackagePreset,
  { id: "openai", name: "OpenAI API", description: "OpenAI API Key", website_url: "https://platform.openai.com", base_url: "https://api.openai.com/v1", request_url: "https://api.openai.com/v1", api_key_hint: "sk-proj-...", api_key_url: "https://platform.openai.com/api-keys", api_format: "openai_responses", auth_field: "OPENAI_API_KEY", use_full_url: false, note: "使用 OpenAI API Key 直接调用 Responses API；GPT-6 模型请使用最新版 Codex", model_map: defaultModelMap("gpt-6-astra"), models: openaiPackageModels, group: "international", supported_targets: ["codex"], codex_compat_mode: "direct", codex_support_status: "responses", codex_support_note: "OpenAI 官方 Codex 配置参考确认自定义 provider 当前只支持 Responses 协议。", codex_support_url: "https://developers.openai.com/codex/config-reference/", claude_desktop_supported: false, claude_desktop_support_note: "OpenAI API 可通过 Codex 调用。" },
  anthropicPackagePreset,
  { id: "anthropic", name: "Anthropic API", description: "Anthropic API Key", website_url: "https://console.anthropic.com", base_url: "https://api.anthropic.com", request_url: "https://api.anthropic.com", api_key_hint: "sk-ant-...", api_key_url: "https://console.anthropic.com/settings/keys", api_format: "anthropic", auth_field: "ANTHROPIC_API_KEY", use_full_url: false, note: "使用 Anthropic API Key 直接调用 Messages API", model_map: claudeApiModelMap, models: claudeApiModels, group: "international", supported_targets: ["claude_cli", "claude_desktop"], codex_support_status: "unconfirmed", codex_support_note: "Anthropic 原生 Messages API 不是 Codex 新版要求的 OpenAI Responses API。", codex_support_url: "https://platform.claude.com/docs/en/api/overview", claude_desktop_supported: true, claude_desktop_support_note: "Anthropic 原生模型可直接用于 Claude 桌面端。" },
  { id: "minimax-global", name: "MiniMax (国际)", description: "MiniMax · 国际站", website_url: "https://platform.minimax.io", base_url: "https://api.minimax.io/v1", request_url: "https://api.minimax.io/anthropic", api_key_hint: "mm-...", api_key_url: "https://platform.minimax.io/user-center/basic-information/interface-key", api_format: "anthropic", auth_field: "ANTHROPIC_API_KEY", use_full_url: false, note: "International Claude Code endpoint", model_map: defaultModelMap("MiniMax-M3"), models: ["MiniMax-M3", "MiniMax-M2.7", "MiniMax-M2.7-highspeed"], group: "international", supported_targets: ["codex"], codex_compat_mode: "direct", codex_support_status: "responses", codex_support_note: "MiniMax 官方已提供原生 Responses API，可直接连接最新版 Codex；M3.1 Flash Preview 使用官方推荐的 512K 上下文。", codex_support_url: "https://platform.minimax.io/docs/m-plan/codex", claude_desktop_supported: true, claude_desktop_support_note: "MiniMax 提供了 Claude 兼容模型映射能力。" },
  { id: "zai-global", name: "Z.ai (智谱国际)", description: "智谱 AI · 国际站", website_url: "https://z.ai", base_url: "https://api.z.ai/api/paas/v4", request_url: "https://api.z.ai/api/anthropic", api_key_hint: "zai-...", api_key_url: "https://chat.z.ai/apikeys", api_format: "anthropic", auth_field: "ANTHROPIC_AUTH_TOKEN", use_full_url: false, note: "Z.ai Claude Code / Goose endpoint", model_map: { main: "glm-5.3", haiku: "glm-5.3-flash", sonnet: "glm-5.3-flash", opus: "glm-5.3" }, models: ["glm-5.3", "glm-5.3-flash", "glm-5.3-flashx", "glm-5.2", "glm-5.1"], group: "international", supported_targets: ["codex"], codex_support_status: "gateway", codex_support_note: "Z.ai 官方 Coding Plan 文档提供 Chat Completions 端点；Codex 通过 Switch++ 本地网关适配后可用；按量调用与 Coding Plan 使用不同端点，请按所购方案选择。", codex_support_url: "https://docs.z.ai/devpack/tool/others", claude_desktop_supported: true, claude_desktop_support_note: "Z.ai 提供了 Claude 兼容模型映射能力。" },
  { id: "kimi-global", name: "Kimi (国际)", description: "月之暗面 · 国际站", website_url: "https://platform.kimi.ai", base_url: "https://api.moonshot.ai/v1", request_url: "https://api.moonshot.ai/anthropic", api_key_hint: "sk-...", api_key_url: "https://platform.kimi.ai/console/api-keys", api_format: "anthropic", auth_field: "ANTHROPIC_AUTH_TOKEN", use_full_url: false, note: "Kimi 平台国际 endpoint", model_map: { main: "kimi-k3", haiku: "kimi-k2.7-code-highspeed", sonnet: "kimi-k2.7-code", opus: "kimi-k3" }, models: ["kimi-k3", "kimi-k2.7-code", "kimi-k2.7-code-highspeed", "kimi-k2.6"], group: "international", supported_targets: ["codex"], codex_support_status: "gateway", codex_support_note: "Kimi 官方 API 文档确认 Chat Completions 兼容格式；Codex 通过 Switch++ 本地网关适配后可用。", codex_support_url: "https://platform.kimi.ai/docs/api/overview", claude_desktop_supported: false, claude_desktop_support_note: "Kimi 国际平台 API 需要订阅 Coding 套餐才能用于 Codex。" },
  { id: "openrouter", name: "OpenRouter", description: "统一路由代理", website_url: "https://openrouter.ai", base_url: "https://openrouter.ai/api/v1", request_url: "https://openrouter.ai/api", api_key_hint: "sk-or-...", api_key_url: "https://openrouter.ai/settings/keys", api_format: "anthropic", auth_field: "ANTHROPIC_AUTH_TOKEN", use_full_url: false, note: "Codex 使用 OpenRouter Responses endpoint", model_map: { main: "anthropic/claude-opus-5.5", haiku: "anthropic/claude-haiku-5.5", sonnet: "anthropic/claude-sonnet-5.5", opus: "anthropic/claude-opus-5.5" }, models: ["anthropic/claude-opus-5.5", "anthropic/claude-sonnet-5.5", "anthropic/claude-haiku-5.5", "anthropic/claude-fable-5.1", "openai/gpt-6.1-sol", "openai/gpt-6-astra", "google/gemini-4-argon", "google/gemini-3.8-flash", "x-ai/grok-4.7", "deepseek/deepseek-v4.1-flash", "z-ai/glm-5.3", "moonshotai/kimi-k3"], group: "international", supported_targets: ["codex"], codex_compat_mode: "direct", codex_support_status: "responses", codex_support_note: "OpenRouter 官方 API Reference 提供 /api/v1/responses，Codex 可按 Responses provider 连接厂商。", codex_support_url: "https://openrouter.ai/docs/api/api-reference/responses/create-responses", claude_desktop_supported: true, claude_desktop_support_note: "OpenRouter 提供了 Anthropic 兼容模型映射能力。" },
];

const codingPresets: VendorPreset[] = [
  { id: "minimax-coding-cn", name: "MiniMax 套餐", description: "MiniMax · 国内套餐调用地址", website_url: "https://platform.minimax.io/docs/m-plan/claude-code", base_url: "https://api.minimaxi.com/v1", request_url: "https://api.minimaxi.com/anthropic", api_key_hint: "sk-cp-...", api_key_url: "https://platform.minimaxi.com/user-center/basic-information/interface-key", api_format: "anthropic", auth_field: "ANTHROPIC_API_KEY", use_full_url: false, note: "国内套餐调用：M Plan 使用 MiniMax-M3.1-Flash-Preview；旧 Token Plan 请按权限选择 MiniMax-M3", model_map: defaultModelMap("MiniMax-M3.1-Flash-Preview"), models: ["MiniMax-M3.1-Flash-Preview", "MiniMax-M3", "MiniMax-M2.7", "MiniMax-M2.7-highspeed"], group: "coding", supported_targets: ["codex"], codex_compat_mode: "direct", codex_support_status: "responses", codex_support_note: "MiniMax 官方已提供原生 Responses API，可直接连接最新版 Codex；M3.1 Flash Preview 使用官方推荐的 512K 上下文。", codex_support_url: "https://platform.minimax.io/docs/m-plan/codex", claude_desktop_supported: true, claude_desktop_support_note: "MiniMax Token Plan 提供了 Claude Code 兼容配置说明。" },
  { id: "minimax-coding-global", name: "MiniMax 套餐", description: "MiniMax · 国际套餐调用地址", website_url: "https://platform.minimax.io/docs/m-plan/claude-code", base_url: "https://api.minimax.io/v1", request_url: "https://api.minimax.io/anthropic", api_key_hint: "sk-cp-...", api_key_url: "https://platform.minimax.io/user-center/basic-information/interface-key", api_format: "anthropic", auth_field: "ANTHROPIC_API_KEY", use_full_url: false, note: "国际套餐调用：M Plan 使用 MiniMax-M3.1-Flash-Preview；旧 Token Plan 请按权限选择 MiniMax-M3", model_map: defaultModelMap("MiniMax-M3.1-Flash-Preview"), models: ["MiniMax-M3.1-Flash-Preview", "MiniMax-M3", "MiniMax-M2.7", "MiniMax-M2.7-highspeed"], group: "coding", supported_targets: ["codex"], codex_compat_mode: "direct", codex_support_status: "responses", codex_support_note: "MiniMax 官方已提供原生 Responses API，可直接连接最新版 Codex；M3.1 Flash Preview 使用官方推荐的 512K 上下文。", codex_support_url: "https://platform.minimax.io/docs/m-plan/codex", claude_desktop_supported: true, claude_desktop_support_note: "MiniMax Token Plan 提供了 Claude Code 兼容配置说明。" },
  { id: "kimi-code", name: "Kimi 套餐", description: "月之暗面 · 套餐调用地址", website_url: "https://www.kimi.com/code", base_url: "https://api.kimi.com/coding/v1", request_url: "https://api.kimi.com/coding/", api_key_hint: "sk-kimi-...", api_key_url: "https://www.kimi.com/code/console", api_format: "anthropic", auth_field: "ANTHROPIC_AUTH_TOKEN", use_full_url: false, note: "套餐调用：Codex 使用 /coding/v1 路径接入", model_map: defaultModelMap("k3"), models: ["k3", "k3-256k", "kimi-for-coding", "kimi-for-coding-highspeed"], group: "coding", supported_targets: ["codex"], codex_support_status: "gateway", codex_support_note: "Kimi 官方 API 文档确认 Chat Completions 兼容格式；Codex 通过 Switch++ 本地网关适配后可用。", codex_support_url: "https://www.kimi.com/code/docs/en/kimi-code/models.html", claude_desktop_supported: true, claude_desktop_support_note: "Kimi 套餐提供了 Claude 兼容模型映射能力。" },
  { id: "bailian-coding", name: "阿里百炼套餐", description: "DashScope 百炼 · Coding Plan", website_url: "https://help.aliyun.com/zh/model-studio/coding-plan", base_url: "https://coding.dashscope.aliyuncs.com/v1", request_url: "https://coding.dashscope.aliyuncs.com/apps/anthropic", api_key_hint: "sk-sp-...", api_key_url: "https://bailian.console.aliyun.com/?apiKey=1", api_format: "anthropic", auth_field: "ANTHROPIC_AUTH_TOKEN", use_full_url: false, note: "Coding Plan 专属端点与精确模型清单；按量 API / Token Plan 的模型不能直接套用", model_map: { main: "qwen3.7-plus", haiku: "qwen3.6-plus", sonnet: "qwen3.7-plus", opus: "qwen3.7-plus" }, models: ["qwen3.7-plus", "qwen3.6-plus", "qwen3.5-plus", "glm-5", "kimi-k2.5", "MiniMax-M2.5"], group: "coding", supported_targets: ["codex", "claude_cli", "claude_desktop"], codex_compat_mode: "proxy", codex_support_status: "gateway", codex_support_note: "阿里百炼官方 Codex 文档写明 Coding Plan 仅支持 Chat/Completions API；新版 Codex 通过 Switch++ 本地网关适配后可用。", codex_support_url: "https://help.aliyun.com/zh/model-studio/codex", claude_desktop_supported: true, claude_desktop_support_note: "阿里百炼 Coding Plan 官方提供 Claude 兼容端点，可用于 Claude。" },
  { id: "zai-coding-cn", name: "智谱套餐", description: "智谱 AI · 国内套餐调用地址", website_url: "https://docs.bigmodel.cn/cn/coding-plan/tool/claude", base_url: "https://open.bigmodel.cn/api/v1", request_url: "https://open.bigmodel.cn/api/anthropic", api_key_hint: "zhipu-...", api_key_url: "https://open.bigmodel.cn/usercenter/apikeys", api_format: "anthropic", auth_field: "ANTHROPIC_AUTH_TOKEN", use_full_url: false, note: "国内套餐调用：Claude Code 用 /api/anthropic，Codex 用 /api/v1", model_map: { main: "glm-5.3", haiku: "glm-5.3-flash", sonnet: "glm-5.3-flash", opus: "glm-5.3" }, models: ["glm-5.3", "glm-5.3-flash", "glm-5.2", "glm-5.1"], group: "coding", supported_targets: ["codex"], codex_compat_mode: "direct", codex_support_status: "responses", codex_support_note: "Codex 使用官方专用 Responses 地址 /api/v1；GLM-5.3 支持 low、high、max，默认 max。套餐密钥需与国内／国际站及个人／团队套餐匹配。", codex_support_url: "https://docs.bigmodel.cn/cn/coding-plan/tool/codex", claude_desktop_supported: true, claude_desktop_support_note: "智谱 GLM Coding Plan 提供了 Claude Code 兼容配置说明。" },
  { id: "zai-coding", name: "Z.ai 套餐", description: "Z.ai · 国际套餐调用地址", website_url: "https://docs.z.ai/devpack/tool/claude", base_url: "https://api.z.ai/api/v1", request_url: "https://api.z.ai/api/anthropic", api_key_hint: "zai-...", api_key_url: "https://chat.z.ai/apikeys", api_format: "anthropic", auth_field: "ANTHROPIC_AUTH_TOKEN", use_full_url: false, note: "国际套餐调用：Claude Code 用 /api/anthropic，Codex 用 /api/v1", model_map: { main: "glm-5.3", haiku: "glm-5.3-flash", sonnet: "glm-5.3-flash", opus: "glm-5.3" }, models: ["glm-5.3", "glm-5.3-flash", "glm-5.2", "glm-5.1"], group: "coding", supported_targets: ["codex"], codex_compat_mode: "direct", codex_support_status: "responses", codex_support_note: "Codex 使用官方专用 Responses 地址 /api/v1；GLM-5.3 支持 low、high、max，默认 max。套餐密钥需与国内／国际站及个人／团队套餐匹配。", codex_support_url: "https://docs.z.ai/devpack/tool/codex", claude_desktop_supported: true, claude_desktop_support_note: "Z.ai GLM Coding Plan 提供了 Claude Code 兼容配置说明。" },
];

const customPresets: VendorPreset[] = [customPreset];
export const allVendorPresets = [...customPresets, ...domesticPresets, ...internationalPresets, ...codingPresets];

import { makeAnthropicCompatAdapters, type VendorTargetAdapter } from "./vendorTargetAdapterFactory.ts";

const vendorTargetAdapters: Partial<Record<string, Partial<Record<TargetKey, VendorTargetAdapter>>>> = {
  deepseek: makeAnthropicCompatAdapters("https://api.deepseek.com/anthropic", "https://api-docs.deepseek.com/guides/agent_integrations/claude_code"),
  "kimi-code": makeAnthropicCompatAdapters("https://api.kimi.com/coding/", "https://www.kimi.com/code/docs/en/third-party-tools/other-coding-agents.html"),
  "minimax-cn": makeAnthropicCompatAdapters("https://api.minimaxi.com/anthropic", "https://platform.minimax.io/docs/m-plan/claude-code"),
  "minimax-global": makeAnthropicCompatAdapters("https://api.minimax.io/anthropic", "https://platform.minimax.io/docs/m-plan/claude-code"),
  "minimax-coding-cn": makeAnthropicCompatAdapters("https://api.minimaxi.com/anthropic", "https://platform.minimax.io/docs/m-plan/claude-code"),
  "minimax-coding-global": makeAnthropicCompatAdapters("https://api.minimax.io/anthropic", "https://platform.minimax.io/docs/m-plan/claude-code"),
  "zai-coding-cn": makeAnthropicCompatAdapters("https://open.bigmodel.cn/api/anthropic", "https://docs.bigmodel.cn/cn/coding-plan/tool/claude"),
  "zai-coding": makeAnthropicCompatAdapters("https://api.z.ai/api/anthropic", "https://docs.z.ai/devpack/tool/claude"),
  bailian: makeAnthropicCompatAdapters("https://dashscope.aliyuncs.com/apps/anthropic", "https://help.aliyun.com/zh/model-studio/claude-code"),
  "bailian-coding": makeAnthropicCompatAdapters("https://coding.dashscope.aliyuncs.com/apps/anthropic", "https://help.aliyun.com/zh/model-studio/claude-code"),
  siliconflow: makeAnthropicCompatAdapters("https://api.siliconflow.cn", "https://docs.siliconflow.cn/en/usercases/use-siliconcloud-in-ccswitch"),
  openrouter: makeAnthropicCompatAdapters("https://openrouter.ai/api", "https://openrouter.ai/docs/api/api-reference/anthropic-messages/create-messages"),
};

function vendorTargetAdapterFor(preset: VendorPreset, targetKey: TargetKey) {
  return vendorTargetAdapters[preset.id]?.[targetKey];
}

export function vendorPresetHasTargetAdapter(preset: VendorPreset, targetKey: TargetKey) {
  return Boolean(vendorTargetAdapterFor(preset, targetKey));
}

export function vendorPresetBaseUrlForTarget(preset: VendorPreset, targetKey: TargetKey) {
  const adapter = vendorTargetAdapterFor(preset, targetKey);
  if (adapter?.base_url) return adapter.base_url;
  if (targetKey === "codex") return preset.base_url;

  if (preset.id === "custom") return preset.base_url;
  return preset.request_url || preset.base_url;
}

export function vendorPresetModelDiscoveryBaseUrlForTarget(preset: VendorPreset, targetKey: TargetKey) {
  if (preset.id === "custom") return preset.base_url;
  const targetApiFormat = vendorPresetApiFormatForTarget(preset, targetKey);
  if (targetApiFormat === "anthropic" && preset.base_url.trim()) {
    return preset.base_url;
  }
  return vendorPresetBaseUrlForTarget(preset, targetKey);
}

export function vendorPresetApiFormatForTarget(preset: VendorPreset, targetKey: TargetKey): ApiFormat {
  const adapter = vendorTargetAdapterFor(preset, targetKey);
  if (adapter?.api_format) return adapter.api_format;
  if (preset.id === "custom") {
    if (targetKey === "codex") return "openai_responses";
    if (targetKey === "claude_cli" || targetKey === "claude_desktop") return "anthropic";
    return "openai_chat";
  }

  if (targetKey !== "codex") return preset.api_format;
  return preset.codex_support_status === "responses" ? "openai_responses" : "openai_chat";
}

export function vendorPresetAuthFieldForTarget(preset: VendorPreset, targetKey: TargetKey): AuthField {
  const adapter = vendorTargetAdapterFor(preset, targetKey);
  if (adapter?.auth_field) return adapter.auth_field;
  const apiFormat = vendorPresetApiFormatForTarget(preset, targetKey);
  if (apiFormat === "gemini") return "GEMINI_API_KEY";
  if (apiFormat === "openai_chat" || apiFormat === "openai_responses" || apiFormat === "kimi") {
    return "OPENAI_API_KEY";
  }
  return preset.auth_field;
}

export function vendorPresetSourceUrlForTarget(preset: VendorPreset, targetKey: TargetKey) {
  const adapter = vendorTargetAdapterFor(preset, targetKey);
  if (adapter?.source_url) return adapter.source_url;
  if (isCodexTargetKey(targetKey)) return preset.codex_support_url ?? "";
  return preset.codex_support_url ?? preset.website_url;
}

function isCodexTargetKey(targetKey: TargetKey) {
  return targetKey === "codex";
}
