import {
  allVendorPresets,
  vendorPresetApiFormatForTarget,
  vendorPresetBaseUrlForTarget,
  vendorPresetModelDiscoveryBaseUrlForTarget,
  vendorPresetSourceUrlForTarget,
} from "./vendorPresets.ts";
import { gatewayRequirementForProfile } from "./gatewayRequirement.ts";
import { buildPresetFamilies, codexCompatModeForPreset } from "./profilePresetUtils.ts";
import type { CodexProfile, VendorPreset } from "./appTypes.ts";

function equal<T>(actual: T, expected: T) {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, got ${String(actual)}`);
  }
}

function requiredPreset(id: string) {
  const preset = allVendorPresets.find((item) => item.id === id);
  if (!preset) throw new Error(`Missing preset ${id}`);
  return preset;
}

const currentDefaultModels: Record<string, string> = {
  deepseek: "deepseek-flash",
  "minimax-cn": "MiniMax-M3",
  "glm-cn": "glm-5.3",
  "kimi-cn": "kimi-k3",
  siliconflow: "zai-org/GLM-5.2",
  bailian: "qwen3.8-max",
  modelscope: "ZhipuAI/GLM-5.2",
  openai: "gpt-6-astra",
  xai: "grok-4.7",
  anthropic: "claude-fable-5-1",
  google: "gemini-3.8-flash",
  "minimax-global": "MiniMax-M3",
  "zai-global": "glm-5.3",
  "kimi-global": "kimi-k3",
  openrouter: "anthropic/claude-opus-5.5",
  "minimax-coding-cn": "MiniMax-M3.1-Flash-Preview",
  "minimax-coding-global": "MiniMax-M3.1-Flash-Preview",
  "kimi-code": "k3",
  "bailian-coding": "qwen3.7-plus",
  "zai-coding-cn": "glm-5.3",
  "zai-coding": "glm-5.3",
};
for (const [presetId, model] of Object.entries(currentDefaultModels)) {
  equal(requiredPreset(presetId).model_map.main, model);
}

const vendorTargetAdapterPresetIds = new Set([
  "bailian",
  "bailian-coding",
  "deepseek",
  "glm-cn",
  "kimi-code",
  "kimi-cn",
  "kimi-global",
  "modelscope",
  "minimax-cn",
  "minimax-global",
  "minimax-coding-cn",
  "minimax-coding-global",
  "openai",
  "xai",
  "openrouter",
  "google",
  "siliconflow",
  "zai-global",
  "zai-coding",
  "zai-coding-cn",
]);

const presetsWithSeparateClaudeAddress = allVendorPresets.filter((preset) =>
  preset.id !== "custom"
  && !vendorTargetAdapterPresetIds.has(preset.id)
  && preset.request_url.trim()
  && preset.request_url.trim() !== preset.base_url.trim()
);
for (const preset of presetsWithSeparateClaudeAddress) {
  equal(vendorPresetBaseUrlForTarget(preset, "codex"), preset.base_url);
  equal(vendorPresetBaseUrlForTarget(preset, "claude_cli"), preset.request_url);
  equal(vendorPresetBaseUrlForTarget(preset, "claude_desktop"), preset.request_url);
  equal(
    vendorPresetApiFormatForTarget(preset, "codex"),
    preset.codex_support_status === "responses" ? "openai_responses" : "openai_chat",
  );
  equal(vendorPresetApiFormatForTarget(preset, "claude_cli"), preset.api_format);
  equal(vendorPresetApiFormatForTarget(preset, "claude_desktop"), preset.api_format);
}

const deepseek = allVendorPresets.find((preset) => preset.id === "deepseek");
equal(deepseek?.model_map.main, "deepseek-flash");
equal(deepseek?.model_map.opus, "deepseek-v4-pro");
equal(deepseek?.model_map.sonnet, "deepseek-flash");
equal(deepseek?.model_map.haiku, "deepseek-flash");
equal(deepseek?.models.join(","), "deepseek-flash,deepseek-v4-pro");
equal(deepseek?.codex_compat_mode, "direct");
equal(deepseek?.codex_support_status, "responses");
equal(deepseek ? vendorPresetBaseUrlForTarget(deepseek, "codex") : "", "https://api.deepseek.com");
equal(deepseek ? vendorPresetApiFormatForTarget(deepseek, "codex") : "", "openai_responses");
equal(deepseek ? vendorPresetSourceUrlForTarget(deepseek, "codex") : "", "https://api-docs.deepseek.com/quick_start/agent_integrations/codex");
equal(deepseek ? vendorPresetBaseUrlForTarget(deepseek, "claude_cli") : "", "https://api.deepseek.com/anthropic");
equal(deepseek ? vendorPresetApiFormatForTarget(deepseek, "claude_cli") : "", "anthropic");
equal(deepseek ? vendorPresetSourceUrlForTarget(deepseek, "claude_cli") : "", "https://api-docs.deepseek.com/guides/agent_integrations/claude_code");
equal(deepseek ? vendorPresetSourceUrlForTarget(deepseek, "claude_desktop") : "", "https://api-docs.deepseek.com/guides/agent_integrations/claude_code");

const kimiCode = allVendorPresets.find((preset) => preset.id === "kimi-code");
equal(kimiCode?.model_map.main, "k3");
equal(kimiCode ? vendorPresetBaseUrlForTarget(kimiCode, "claude_cli") : "", "https://api.kimi.com/coding/");
equal(kimiCode ? vendorPresetApiFormatForTarget(kimiCode, "claude_cli") : "", "anthropic");
equal(kimiCode ? vendorPresetSourceUrlForTarget(kimiCode, "claude_cli") : "", "https://www.kimi.com/code/docs/en/third-party-tools/other-coding-agents.html");
equal(kimiCode ? vendorPresetSourceUrlForTarget(kimiCode, "claude_desktop") : "", "https://www.kimi.com/code/docs/en/third-party-tools/other-coding-agents.html");

const kimiGlobal = allVendorPresets.find((preset) => preset.id === "kimi-global");
equal(kimiGlobal ? vendorPresetBaseUrlForTarget(kimiGlobal, "claude_cli") : "", "https://api.moonshot.ai/anthropic");
equal(kimiGlobal ? vendorPresetApiFormatForTarget(kimiGlobal, "claude_cli") : "", "anthropic");

const kimiCn = allVendorPresets.find((preset) => preset.id === "kimi-cn");
equal(kimiCn ? vendorPresetBaseUrlForTarget(kimiCn, "claude_cli") : "", "https://api.moonshot.cn/anthropic");
equal(kimiCn ? vendorPresetApiFormatForTarget(kimiCn, "claude_cli") : "", "anthropic");

const glmCn = allVendorPresets.find((preset) => preset.id === "glm-cn");
equal(glmCn ? vendorPresetBaseUrlForTarget(glmCn, "claude_cli") : "", "https://open.bigmodel.cn/api/anthropic");
equal(glmCn ? vendorPresetApiFormatForTarget(glmCn, "claude_cli") : "", "anthropic");

const zaiGlobal = allVendorPresets.find((preset) => preset.id === "zai-global");
equal(zaiGlobal ? vendorPresetBaseUrlForTarget(zaiGlobal, "claude_cli") : "", "https://api.z.ai/api/anthropic");
equal(zaiGlobal ? vendorPresetApiFormatForTarget(zaiGlobal, "claude_cli") : "", "anthropic");

const modelscope = allVendorPresets.find((preset) => preset.id === "modelscope");
equal(modelscope?.api_format, "openai_chat");
equal(modelscope?.request_url, "https://api-inference.modelscope.cn/v1");
equal(modelscope?.claude_desktop_supported, false);
equal(modelscope ? vendorPresetSourceUrlForTarget(modelscope, "codex") : "", "https://modelscope.cn/docs/model-service/API-Inference/intro");
equal(modelscope ? vendorPresetSourceUrlForTarget(modelscope, "claude_cli") : "", "https://modelscope.cn/docs/model-service/API-Inference/intro");

const openai = allVendorPresets.find((preset) => preset.id === "openai");
equal(openai?.codex_support_status, "responses");
equal(openai ? vendorPresetApiFormatForTarget(openai, "codex") : "", "openai_responses");

const xai = requiredPreset("xai");
equal(xai.name, "xAI (Grok)");
equal(xai.base_url, "https://api.x.ai/v1");
equal(xai.model_map.main, "grok-4.7");
equal(xai.models.join(","), "grok-4.7,grok-4.6,grok-4.5");
equal(xai.codex_compat_mode, "direct");
equal(xai.codex_support_status, "responses");
equal(vendorPresetBaseUrlForTarget(xai, "codex"), "https://api.x.ai/v1");
equal(vendorPresetApiFormatForTarget(xai, "codex"), "openai_responses");

const anthropic = allVendorPresets.find((preset) => preset.id === "anthropic");
equal(anthropic ? vendorPresetSourceUrlForTarget(anthropic, "claude_cli") : "", "https://platform.claude.com/docs/en/api/overview");

const google = allVendorPresets.find((preset) => preset.id === "google");
equal(google?.base_url, "https://generativelanguage.googleapis.com/v1beta/openai");
equal(google?.api_format, "openai_chat");
equal(google?.codex_support_status, "gateway");

const minimaxCoding = allVendorPresets.find((preset) => preset.id === "minimax-coding-global");
equal(minimaxCoding?.model_map.main, "MiniMax-M3.1-Flash-Preview");

const minimaxGlobal = allVendorPresets.find((preset) => preset.id === "minimax-global");
equal(minimaxGlobal ? vendorPresetSourceUrlForTarget(minimaxGlobal, "claude_cli") : "", "https://platform.minimax.io/docs/m-plan/claude-code");
equal(minimaxGlobal ? vendorPresetSourceUrlForTarget(minimaxGlobal, "claude_desktop") : "", "https://platform.minimax.io/docs/m-plan/claude-code");

const minimaxCn = allVendorPresets.find((preset) => preset.id === "minimax-cn");
equal(minimaxCn ? vendorPresetSourceUrlForTarget(minimaxCn, "claude_cli") : "", "https://platform.minimax.io/docs/m-plan/claude-code");
equal(minimaxCn ? vendorPresetSourceUrlForTarget(minimaxCn, "claude_desktop") : "", "https://platform.minimax.io/docs/m-plan/claude-code");

const minimaxCodingGlobal = allVendorPresets.find((preset) => preset.id === "minimax-coding-global");
equal(minimaxCodingGlobal ? vendorPresetSourceUrlForTarget(minimaxCodingGlobal, "claude_cli") : "", "https://platform.minimax.io/docs/m-plan/claude-code");
equal(minimaxCodingGlobal ? vendorPresetSourceUrlForTarget(minimaxCodingGlobal, "claude_desktop") : "", "https://platform.minimax.io/docs/m-plan/claude-code");

const minimaxCodingCn = allVendorPresets.find((preset) => preset.id === "minimax-coding-cn");
equal(minimaxCodingCn ? vendorPresetSourceUrlForTarget(minimaxCodingCn, "claude_cli") : "", "https://platform.minimax.io/docs/m-plan/claude-code");
equal(minimaxCodingCn ? vendorPresetSourceUrlForTarget(minimaxCodingCn, "claude_desktop") : "", "https://platform.minimax.io/docs/m-plan/claude-code");

const siliconflow = allVendorPresets.find((preset) => preset.id === "siliconflow");
equal(siliconflow ? vendorPresetBaseUrlForTarget(siliconflow, "claude_cli") : "", "https://api.siliconflow.cn");
equal(siliconflow ? vendorPresetApiFormatForTarget(siliconflow, "claude_cli") : "", "anthropic");
equal(siliconflow ? vendorPresetSourceUrlForTarget(siliconflow, "codex") : "", "https://docs.siliconflow.cn/en/api-reference/chat-completions/chat-completions");
equal(siliconflow ? vendorPresetSourceUrlForTarget(siliconflow, "claude_cli") : "", "https://docs.siliconflow.cn/en/usercases/use-siliconcloud-in-ccswitch");
equal(siliconflow ? vendorPresetSourceUrlForTarget(siliconflow, "claude_desktop") : "", "https://docs.siliconflow.cn/en/usercases/use-siliconcloud-in-ccswitch");

const bailian = allVendorPresets.find((preset) => preset.id === "bailian");
equal(bailian?.codex_compat_mode, "direct");
equal(bailian?.codex_support_status, "responses");
equal(bailian ? vendorPresetApiFormatForTarget(bailian, "codex") : "", "openai_responses");
equal(bailian ? vendorPresetBaseUrlForTarget(bailian, "claude_cli") : "", "https://dashscope.aliyuncs.com/apps/anthropic");
equal(bailian ? vendorPresetModelDiscoveryBaseUrlForTarget(bailian, "claude_cli") : "", "https://dashscope.aliyuncs.com/compatible-mode/v1");
equal(bailian ? vendorPresetApiFormatForTarget(bailian, "claude_cli") : "", "anthropic");

const bailianCoding = allVendorPresets.find((preset) => preset.id === "bailian-coding");
equal(bailianCoding?.codex_compat_mode, "proxy");
equal(bailianCoding?.codex_support_status, "gateway");
equal(bailianCoding ? vendorPresetApiFormatForTarget(bailianCoding, "codex") : "", "openai_chat");
equal(bailianCoding ? vendorPresetBaseUrlForTarget(bailianCoding, "claude_cli") : "", "https://coding.dashscope.aliyuncs.com/apps/anthropic");
equal(bailianCoding ? vendorPresetModelDiscoveryBaseUrlForTarget(bailianCoding, "claude_cli") : "", "https://coding.dashscope.aliyuncs.com/v1");
equal(bailianCoding ? vendorPresetApiFormatForTarget(bailianCoding, "claude_cli") : "", "anthropic");

const zaiCoding = allVendorPresets.find((preset) => preset.id === "zai-coding");
equal(zaiCoding ? vendorPresetBaseUrlForTarget(zaiCoding, "claude_cli") : "", "https://api.z.ai/api/anthropic");
equal(zaiCoding ? vendorPresetApiFormatForTarget(zaiCoding, "claude_cli") : "", "anthropic");

const zaiCodingCn = allVendorPresets.find((preset) => preset.id === "zai-coding-cn");
equal(zaiCodingCn ? vendorPresetBaseUrlForTarget(zaiCodingCn, "claude_cli") : "", "https://open.bigmodel.cn/api/anthropic");
equal(zaiCodingCn ? vendorPresetApiFormatForTarget(zaiCodingCn, "claude_cli") : "", "anthropic");

const openrouter = allVendorPresets.find((preset) => preset.id === "openrouter");
equal(openrouter?.codex_compat_mode, "direct");
equal(openrouter?.codex_support_status, "responses");
equal(openrouter ? vendorPresetApiFormatForTarget(openrouter, "codex") : "", "openai_responses");
equal(openrouter ? vendorPresetBaseUrlForTarget(openrouter, "claude_cli") : "", "https://openrouter.ai/api");
equal(openrouter ? vendorPresetApiFormatForTarget(openrouter, "claude_cli") : "", "anthropic");
equal(openrouter ? vendorPresetSourceUrlForTarget(openrouter, "claude_cli") : "", "https://openrouter.ai/docs/api/api-reference/anthropic-messages/create-messages");
equal(openrouter ? vendorPresetSourceUrlForTarget(openrouter, "claude_desktop") : "", "https://openrouter.ai/docs/api/api-reference/anthropic-messages/create-messages");

const claudeCliPresetIds = buildPresetFamilies("claude_cli").flatMap((family) => family.presets.map((preset) => preset.id));
equal(claudeCliPresetIds.includes("anthropic-package"), true);
equal(claudeCliPresetIds.includes("openai-package"), false);

const claudeDesktopPresetIds = buildPresetFamilies("claude_desktop").flatMap((family) => family.presets.map((preset) => preset.id));
equal(claudeDesktopPresetIds.includes("anthropic"), true);
equal(claudeDesktopPresetIds.includes("anthropic-package"), true);
equal(claudeDesktopPresetIds.includes("openai-package"), false);

const anthropicPackage = requiredPreset("anthropic-package");
equal(anthropicPackage.model_map.main, "default");
equal(anthropicPackage.model_map.opus, "default");
equal(anthropicPackage.model_map.sonnet, "default");
equal(anthropicPackage.model_map.haiku, "default");
equal(anthropicPackage.models.join(","), "default");

const anthropicApi = requiredPreset("anthropic");
equal(anthropicApi.auth_field, "ANTHROPIC_API_KEY");
equal(anthropicApi.model_map.main, "claude-fable-5-1");
equal(anthropicApi.model_map.opus, "claude-opus-5-5");
equal(anthropicApi.model_map.sonnet, "claude-sonnet-5-5");
equal(anthropicApi.model_map.haiku, "claude-haiku-5-5");

const openaiPackage = requiredPreset("openai-package");
equal(openaiPackage.model_map.main, "gpt-6-astra");
equal(
  openaiPackage.models.join(","),
  "gpt-6-astra,gpt-6.1-sol,gpt-6-sol,gpt-6-luna",
);

function codexProfileForPresetForTest(preset: VendorPreset): CodexProfile {
  return {
    id: preset.id,
    display_name: preset.name,
    website_url: preset.website_url,
    note: preset.note,
    connection_mode: preset.id === "openai-package" ? "official" : "gateway",
    compat_mode: codexCompatModeForPreset(preset),
    api_format: vendorPresetApiFormatForTarget(preset, "codex"),
    base_url: vendorPresetBaseUrlForTarget(preset, "codex"),
    api_key: "sk-test",
    model: preset.model_map.main || preset.models[0] || "",
    auth_json: "{}",
    config_toml: "",
    updated_at: 0,
  };
}

const codexSelectablePresets = allVendorPresets.filter((preset) =>
  preset.id === "custom"
  || preset.id === "openai-package"
  || preset.codex_support_status === "responses"
  || preset.codex_support_status === "gateway"
);

equal(codexSelectablePresets.length > 0, true);

for (const preset of codexSelectablePresets) {
  const requirement = gatewayRequirementForProfile("codex", codexProfileForPresetForTest(preset), preset);
  if (preset.id === "openai-package" || preset.id === "openai") {
    equal(requirement.level, "none");
    equal(requirement.cornerLabel, "无需");
  } else if (codexCompatModeForPreset(preset) === "direct") {
    equal(requirement.level, "recommended");
    equal(requirement.cornerLabel, "建议");
  } else {
    equal(requirement.level, "required");
    equal(requirement.cornerLabel, "必开");
  }
}

const deepseekCodexRequirement = gatewayRequirementForProfile(
  "codex",
  codexProfileForPresetForTest(requiredPreset("deepseek")),
  requiredPreset("deepseek"),
);
equal(deepseekCodexRequirement.limitation?.includes("DeepSeek 原生 Responses"), true);
equal(deepseekCodexRequirement.limitation?.includes("Anthropic"), false);
equal(deepseekCodexRequirement.limitation?.includes("deepseek-flash"), true);

const bailianCodexRequirement = gatewayRequirementForProfile(
  "codex",
  codexProfileForPresetForTest(requiredPreset("bailian")),
  requiredPreset("bailian"),
);
equal(bailianCodexRequirement.limitation?.includes("阿里百炼按量 API 支持 Responses"), true);
equal(bailianCodexRequirement.limitation?.includes("Qwen3.8"), true);

const googleCodexRequirement = gatewayRequirementForProfile(
  "codex",
  codexProfileForPresetForTest(requiredPreset("google")),
  requiredPreset("google"),
);
equal(googleCodexRequirement.limitation?.includes("Gemini 的图片能力取决于所选模型"), true);
const glmCodingModels = requiredPreset("zai-coding").models;
equal(glmCodingModels.includes("glm-5.3-flash"), true);
equal(glmCodingModels.includes("glm-5.3-flashx"), false);
equal(requiredPreset("bailian-coding").models.includes("qwen3.8-max"), false);
equal(requiredPreset("bailian-coding").models.includes("qwen3.6-flash"), false);
