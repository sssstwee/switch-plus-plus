import type { CodexProfile, GatewayProfile, TargetKey, VendorPreset } from "./appTypes.ts";
import {
  gatewayProfileUsesProxyForTarget,
  isOfficialAnthropicBaseUrl,
  isSubscriptionProxyBaseUrl,
} from "./gatewayProfile.ts";

export type GatewayRequirementLevel = "required" | "recommended" | "none";

export type GatewayRequirement = {
  level: GatewayRequirementLevel;
  label: "必须开启" | "建议开启" | "无需开启";
  cornerLabel: "必开" | "建议" | "无需";
  detail: string;
  limitation?: string;
};

const gatewayRequirementCopy: Record<GatewayRequirementLevel, GatewayRequirement> = {
  required: {
    level: "required",
    label: "必须开启",
    cornerLabel: "必开",
    detail: "当前问题：客户端配置依赖 Switch++ 本地网关，关闭后请求无法按预期到达上游。开启收益：网关负责协议适配、认证隔离、调用记录和统一启停。",
  },
  recommended: {
    level: "recommended",
    label: "建议开启",
    cornerLabel: "建议",
    detail: "当前问题：此配置不强制依赖本地网关，但少了 Switch++ 的观测、预检和统一管理。开启收益：由本地网关接管，并提供认证隔离、调用记录和统一启停。",
  },
  none: {
    level: "none",
    label: "无需开启",
    cornerLabel: "无需",
    detail: "当前配置不需要开启 Switch++ 本地网关。",
  },
};

export function gatewayRequirement(level: GatewayRequirementLevel): GatewayRequirement {
  return gatewayRequirementCopy[level];
}

function withGatewayRequirementDetail(level: GatewayRequirementLevel, detail: string, limitation?: string): GatewayRequirement {
  return {
    ...gatewayRequirement(level),
    detail,
    ...(limitation ? { limitation } : {}),
  };
}

export function targetSupportsGateway(target: TargetKey) {
  return target === "codex" || target === "claude_cli" || target === "claude_desktop";
}

function isCodexProfile(profile: CodexProfile | GatewayProfile): profile is CodexProfile {
  return "connection_mode" in profile;
}

function isOfficialOpenAiBaseUrl(baseUrl: string) {
  return baseUrl.trim().toLowerCase().includes("api.openai.com");
}

function isCodexThirdPartyDirectProfile(profile: CodexProfile) {
  return profile.connection_mode !== "official"
    && (profile.compat_mode ?? "direct") === "direct"
    && !isOfficialOpenAiBaseUrl(profile.base_url);
}

function codexApiFormat(profile: CodexProfile) {
  return profile.api_format ?? "openai_chat";
}

function isCodexLocalGatewayProfile(profile: CodexProfile) {
  return profile.connection_mode !== "official"
    && ((profile.compat_mode ?? "proxy") !== "direct" || codexApiFormat(profile) !== "openai_responses");
}

function isDeepSeekAnthropicProfile(profile: GatewayProfile) {
  return profile.api_format === "anthropic"
    && profile.base_url.trim().toLowerCase().includes("api.deepseek.com");
}

type VendorCapabilityKind =
  | "openai"
  | "anthropic"
  | "deepseek"
  | "minimax"
  | "bailian"
  | "kimi-code"
  | "kimi"
  | "siliconflow"
  | "zai"
  | "openrouter"
  | "google"
  | "modelscope"
  | "generic";

function vendorCapabilityKind(profile: CodexProfile | GatewayProfile, preset?: VendorPreset | null): VendorCapabilityKind {
  const presetId = preset?.id ?? "";
  const baseUrl = profile.base_url.trim().toLowerCase();
  const model = "model" in profile
    ? profile.model.toLowerCase()
    : JSON.stringify(profile.model_map ?? {}).toLowerCase();
  const displayName = profile.display_name.toLowerCase();
  const source = `${presetId} ${baseUrl} ${model} ${displayName}`;

  if (presetId === "openai" || presetId === "openai-package" || isOfficialOpenAiBaseUrl(profile.base_url)) return "openai";
  if (presetId === "anthropic" || isOfficialAnthropicBaseUrl(profile.base_url)) return "anthropic";
  if (presetId.includes("bailian") || displayName.includes("阿里百炼") || baseUrl.includes("dashscope") || baseUrl.includes("aliyuncs.com")) return "bailian";
  if (presetId.includes("minimax") || displayName.includes("minimax") || baseUrl.includes("minimax")) return "minimax";
  if (presetId.includes("deepseek") || displayName.includes("deepseek") || baseUrl.includes("api.deepseek.com")) return "deepseek";
  if (source.includes("kimi-code") || baseUrl.includes("api.kimi.com/coding")) return "kimi-code";
  if (source.includes("kimi") || source.includes("moonshot")) return "kimi";
  if (source.includes("siliconflow")) return "siliconflow";
  if (source.includes("zai") || source.includes("glm") || source.includes("bigmodel")) return "zai";
  if (source.includes("openrouter")) return "openrouter";
  if (source.includes("google") || source.includes("gemini") || baseUrl.includes("generativelanguage.googleapis.com")) return "google";
  if (source.includes("modelscope")) return "modelscope";
  return "generic";
}

function isVerifiedClaudeAnthropicDirectKind(target: TargetKey, kind: VendorCapabilityKind) {
  if (target === "claude_desktop") {
    return kind === "deepseek";
  }
  return false;
}

function isBlockedClaudeAnthropicDirectKind(target: TargetKey, kind: VendorCapabilityKind) {
  if (target === "claude_cli") {
    return kind === "deepseek" || kind === "minimax" || kind === "bailian";
  }
  return target === "claude_desktop" && kind === "bailian";
}

function isVerifiedClaudeAnthropicDirectProfile(
  target: TargetKey,
  profile: CodexProfile | GatewayProfile,
  preset?: VendorPreset | null,
) {
  if ((target !== "claude_cli" && target !== "claude_desktop") || isCodexProfile(profile)) {
    return false;
  }
  return profile.api_format === "anthropic"
    && !isOfficialAnthropicBaseUrl(profile.base_url)
    && isVerifiedClaudeAnthropicDirectKind(target, vendorCapabilityKind(profile, preset));
}

function isBlockedClaudeAnthropicDirectProfile(
  target: TargetKey,
  profile: CodexProfile | GatewayProfile,
  preset?: VendorPreset | null,
) {
  if ((target !== "claude_cli" && target !== "claude_desktop") || isCodexProfile(profile)) {
    return false;
  }
  return profile.api_format === "anthropic"
    && !isOfficialAnthropicBaseUrl(profile.base_url)
    && isBlockedClaudeAnthropicDirectKind(target, vendorCapabilityKind(profile, preset));
}

function gatewayCapabilityLimitation(target: TargetKey, profile: CodexProfile | GatewayProfile, preset?: VendorPreset | null) {
  const kind = vendorCapabilityKind(profile, preset);

  if (target === "codex" && isCodexProfile(profile)) {
    if (profile.connection_mode === "official" || kind === "openai") {
      return "仍有限制：Codex 官方账号或 OpenAI Responses 路径按官方能力工作；Switch++ 不介入模型能力，也不会改变 Codex 自身的图片、文件或工具支持边界。";
    }
    if (kind === "deepseek") {
      return "仍有限制：DeepSeek 原生 Responses 支持 deepseek-flash 与 deepseek-v4-pro；Flash 支持图片，Pro 为纯文本；previous_response_id 和服务端会话状态不受支持。";
    }
    if (kind === "minimax") {
      return "仍有限制：MiniMax 已支持 Codex 原生 Responses；M3.1 Flash Preview 目前仅向 M Plan 等指定入口开放，使用官方推荐的 512K 上下文，不能关闭思考。";
    }
    if (kind === "zai") {
      return "仍有限制：曾订阅 Coding Plan 的智谱/Z.ai 账号目前仍受 Chat 协议限制，Codex 使用本地网关；GLM-5.3 为纯文本，GLM-5.3-Flash 支持多模态，两者均不能关闭思考。";
    }
    if (kind === "kimi-code") {
      return "仍有限制：Kimi Code 使用 k3、k3-256k、kimi-for-coding 或 kimi-for-coding-highspeed；kimi-for-coding 已升级至 K2.8 Preview，不能直接填写产品版本名。";
    }
    if (kind === "kimi") {
      return "仍有限制：Kimi API 使用 kimi-k3 / kimi-k2.7-code 等平台模型 ID，与 Kimi Code 的 k3 等套餐 ID 不同；多模态能力仍取决于模型、请求格式和账号权限。";
    }
    if (kind === "bailian") {
      return "仍有限制：阿里百炼按量 API 支持 Responses；Qwen3.8 等模型的多模态能力与 Coding Plan 的精确模型清单应分别按官方说明确认。";
    }
    if (kind === "siliconflow") {
      return "仍有限制：硅基流动 Codex 路径经本地网关连接上游；只有 VLM 模型处理图片，当前 GLM-5.2 等文本模型仍按文本模型工作。";
    }
    if (kind === "openrouter") {
      return "仍有限制：OpenRouter 按模型声明 input_modalities；Codex 的厂商连接或本地网关都不会改变所选模型是否支持 image/file 输入。";
    }
    if (kind === "google") {
      return "仍有限制：Gemini 的图片能力取决于所选模型、Codex 请求内容和 Gemini 文件/图片限制；本地网关只负责 Codex 到 Gemini 上游的连接适配，不能改变模型能力。";
    }
    if (kind === "modelscope") {
      return "仍有限制：ModelScope 当前 Codex 预设面向代码/文本模型；图片能力需换成明确支持视觉的模型，本地网关不会补齐模型能力。";
    }
    return "仍有限制：Codex 的图片、文件和工具能力取决于 Codex 请求格式、所选厂商协议和上游模型；本地网关只做协议适配、认证隔离、记录和启停管理。";
  }

  if (target === "claude_cli" || target === "claude_desktop") {
    if (kind === "deepseek") {
      return target === "claude_desktop"
        ? "仍有限制：DeepSeek-Flash（V4.1）支持原生图片；V4-Pro 为纯文本，可在 Claude Desktop 中选择视觉代理生成图片描述；文件与工具内容仍受厂商协议限制。"
        : "仍有限制：DeepSeek-Flash（V4.1）支持原生图片；V4-Pro 为纯文本，图片需改用 Flash 或视觉代理；文件与工具内容仍受厂商协议限制。";
    }
    if (kind === "minimax") {
      return "仍有限制：MiniMax M3 原生支持图片和视频，但能力仍取决于 Claude 请求内容和 MiniMax 兼容端点；本地网关不能绕过格式、大小和计费限制。";
    }
    if (kind === "zai") {
      return "仍有限制：GLM-5.3 为纯文本，GLM-5.3-Flash 支持图片和视频；GLM-5.3 系列始终开启思考，具体模态与额度取决于模型和账号权限。";
    }
    if (kind === "kimi-code") {
      return "仍有限制：Kimi Code 的 k3 与 kimi-for-coding 等套餐 ID 不同于平台 API 型号；kimi-for-coding 已升级至 K2.8 Preview，能力仍取决于所选模型和套餐权限。";
    }
    if (kind === "kimi") {
      return "仍有限制：Kimi K3 支持原生视觉和 1M 上下文；图片和视频能力仍取决于模型、兼容端点、请求格式和账号权限。";
    }
    if (kind === "bailian") {
      return "仍有限制：阿里百炼图片/视频能力取决于模型与兼容端点；按量 API、Coding Plan 和 Token Plan 的模型清单与密钥不能混用。";
    }
    if (kind === "siliconflow") {
      return "仍有限制：硅基流动文档说明只有 VLM 模型可处理图片；当前预设的 GLM-5.2 等文本模型仍按文本模型处理，本地网关不会自动切换到视觉模型。";
    }
    if (kind === "openrouter") {
      return "仍有限制：OpenRouter 按模型声明 input_modalities；只有带 image/file 等输入模态的模型能处理图片或文档，本地网关不会改变所选模型的模态能力。";
    }
    if (kind === "google") {
      return "仍有限制：Gemini 的多模态能力取决于所选模型、Claude 请求内容和 Gemini 文件/图片限制；本地网关只做 Claude 到 Gemini 上游的连接适配，不能改变模型能力。";
    }
    if (kind === "modelscope") {
      return "仍有限制：ModelScope 当前 Claude 预设面向代码/文本模型；图片能力需选择明确支持视觉且适合 Claude 接入的模型，本地网关不能补齐上游模型能力。";
    }
    if (kind === "anthropic") {
      return "仍有限制：Anthropic 官方 Claude API 支持图片输入，但仍受 Claude Code 和 API 的图片格式、尺寸、请求体大小限制。";
    }
    if (profile.api_format === "anthropic") {
      return "仍有限制：图片、文档和视频能力取决于厂商 Anthropic 兼容端点和所选模型；本地网关不补齐上游模型本身不支持的多模态能力。";
    }
  }

  return undefined;
}

export function profileRequiresGateway(target: TargetKey, profile: CodexProfile | GatewayProfile) {
  if (!targetSupportsGateway(target)) return false;
  if (target === "codex") {
    return isCodexProfile(profile) && isCodexLocalGatewayProfile(profile);
  }
  if (isCodexProfile(profile)) return false;
  if (isVerifiedClaudeAnthropicDirectProfile(target, profile)) return false;
  if (isBlockedClaudeAnthropicDirectProfile(target, profile)) return true;
  if (target === "claude_cli") {
    return profile.compat_mode === "proxy"
      || profile.api_format === "openai_chat"
      || profile.api_format === "openai_responses";
  }
  return gatewayProfileUsesProxyForTarget(profile, target);
}

export function profileCanBenefitFromGateway(target: TargetKey, profile: CodexProfile | GatewayProfile) {
  if (target === "codex" && isCodexProfile(profile) && !profileRequiresGateway(target, profile)) {
    return isCodexThirdPartyDirectProfile(profile);
  }
  if ((target !== "claude_cli" && target !== "claude_desktop") || isCodexProfile(profile) || profileRequiresGateway(target, profile)) {
    return false;
  }
  if (isVerifiedClaudeAnthropicDirectProfile(target, profile)) {
    return false;
  }
  return profile.api_format === "anthropic" && !isOfficialAnthropicBaseUrl(profile.base_url);
}

function requiredGatewayDetail(target: TargetKey, profile: CodexProfile | GatewayProfile) {
  if (target === "codex" && isCodexProfile(profile)) {
    if (codexApiFormat(profile) === "openai_responses") {
      return "当前问题：Codex 已写入 Switch++ 本地 Responses 地址；关闭后 Codex 会请求不可用的本地端口。开启收益：本地网关负责认证隔离、调用记录和统一启停。";
    }
    return "当前问题：Codex 客户端仍按 Responses 发送请求，但当前上游是 Chat Completions，绕过本地网关会协议不匹配。开启收益：Switch++ 负责协议适配、认证隔离、调用记录和统一启停。";
  }

  if (!isCodexProfile(profile)) {
    if (isSubscriptionProxyBaseUrl(profile.base_url)) {
      return "当前配置需要通过 Switch++ 本地兼容网关连接内置 CLIProxyAPI；网关负责应用隔离、模型映射、认证转发和调用记录。";
    }
    if (profile.api_format === "openai_chat" || profile.api_format === "openai_responses") {
      return "当前问题：Claude 客户端发送 Claude 兼容请求，但当前上游不能直接接收该请求，绕过本地网关会协议不匹配。开启收益：Switch++ 负责协议适配、模型映射、认证隔离和调用记录。";
    }
    if (target === "claude_desktop" && isBlockedClaudeAnthropicDirectProfile(target, profile)) {
      return "当前问题：该厂商在 Claude Desktop 直连场景实测不可用，需要通过 Switch++ 本地网关完成模型映射、请求预检和兼容处理。";
    }
    if (target === "claude_cli" && isBlockedClaudeAnthropicDirectProfile(target, profile)) {
      return "当前问题：最新版 Claude Code 直连该厂商 Anthropic 兼容端点实测失败，需要通过 Switch++ 本地网关完成模型映射、请求清洗、工具 schema 压缩和兼容转发。";
    }
    if (target === "claude_desktop" && !isOfficialAnthropicBaseUrl(profile.base_url)) {
      return "当前问题：Claude Desktop profile 的模型别名与第三方 Anthropic 上游真实模型不一定一致，直连时可能落到默认模型或失败。开启收益：Switch++ 接管模型别名映射、请求预检、调用记录和工具 schema 压缩。";
    }
  }

  return gatewayRequirement("required").detail;
}

function recommendedGatewayDetail(target: TargetKey, profile: CodexProfile | GatewayProfile) {
  if (target === "codex" && isCodexProfile(profile)) {
    if (codexApiFormat(profile) === "openai_responses") {
      return "当前建议：此配置没有把 Codex 指向 Switch++ 本地 Responses 兼容层，因此不是必开。开启后可通过本地兼容网关统一路由，并获得调用记录、统一启停和流式观测。";
    }
    return "当前建议：此配置没有把 Codex 指向 Switch++ 本地 Responses 兼容层，因此不是必开。开启后本地网关可把 Codex Responses 请求适配到上游协议，并提供调用记录和统一启停。";
  }

  if (target === "claude_cli" && !isCodexProfile(profile)) {
    if (isDeepSeekAnthropicProfile(profile)) {
      return "当前问题：DeepSeek Anthropic API 可以由 Claude Code 直接连接，但不经过本地网关时 Claude 模型名可能被上游自动映射到 flash，且图片/文档内容块不受支持。开启收益：Switch++ 接管模型别名映射、请求预检、调用记录和工具 schema 压缩，降低模型跑偏与 Prompt 过长风险。";
    }
    return "当前问题：上游已支持 Anthropic Messages，Claude Code 可以直接连接厂商，但不经过本地网关会缺少模型别名、调用记录、请求预检和工具 schema 压缩。开启收益：本地网关保留原生协议能力，同时降低模型跑偏与 Prompt 过长风险。";
  }
  if (target === "claude_desktop" && !isCodexProfile(profile)) {
    return "当前问题：Claude Desktop 可以直连支持 Anthropic Messages 的厂商，但不经过本地网关会缺少模型别名、调用记录、请求预检和工具 schema 压缩。开启收益：Switch++ 可接管模型映射与诊断；关闭后会写回厂商直连地址。";
  }

  return gatewayRequirement("recommended").detail;
}

function directGatewayDetail(target: TargetKey, profile: CodexProfile | GatewayProfile) {
  if (!targetSupportsGateway(target)) {
    return "当前应用配置不依赖 Switch++ 本地兼容网关。";
  }

  if (target === "codex" && isCodexProfile(profile)) {
    if (profile.connection_mode === "official") {
      return "OpenAI 套餐直连 Codex 官方服务，不经过 Switch++ 网关；调用记录仅适用于三方网关配置。";
    }
    return "当前 Codex 配置可直接连接厂商 Responses 地址，不需要 Switch++ 本地网关。";
  }

  if (!isCodexProfile(profile) && isOfficialAnthropicBaseUrl(profile.base_url)) {
    return "Anthropic 官方服务使用原生 Messages 地址，不需要 Switch++ 本地网关。";
  }

  if (isVerifiedClaudeAnthropicDirectProfile(target, profile)) {
    return "该厂商 Anthropic 兼容端点已实测可由 Claude 直连使用，不需要开启 Switch++ 本地网关；需要调用记录、模型映射或请求清洗时再开启网关。";
  }

  return gatewayRequirement("none").detail;
}

export function gatewayRequirementForProfile(
  target: TargetKey,
  profile: CodexProfile | GatewayProfile,
  preset?: VendorPreset | null,
): GatewayRequirement {
  const limitation = gatewayCapabilityLimitation(target, profile, preset);
  if (profileRequiresGateway(target, profile)) {
    return withGatewayRequirementDetail("required", requiredGatewayDetail(target, profile), limitation);
  }
  if (profileCanBenefitFromGateway(target, profile)) {
    return withGatewayRequirementDetail("recommended", recommendedGatewayDetail(target, profile), limitation);
  }
  return withGatewayRequirementDetail("none", directGatewayDetail(target, profile), limitation);
}

export function gatewayRequirementForTarget(
  target: TargetKey,
  profiles: Array<CodexProfile | GatewayProfile>,
  appliedProfileId?: string | null,
  appliedPreset?: VendorPreset | null,
): GatewayRequirement {
  if (!targetSupportsGateway(target)) return gatewayRequirement("none");

  const appliedProfile = appliedProfileId
    ? profiles.find((profile) => profile.id === appliedProfileId)
    : null;
  if (appliedProfile && profileRequiresGateway(target, appliedProfile)) {
    return withGatewayRequirementDetail(
      "required",
      requiredGatewayDetail(target, appliedProfile),
      gatewayCapabilityLimitation(target, appliedProfile, appliedPreset),
    );
  }
  if (appliedProfile && profileCanBenefitFromGateway(target, appliedProfile)) {
    return withGatewayRequirementDetail(
      "recommended",
      recommendedGatewayDetail(target, appliedProfile),
      gatewayCapabilityLimitation(target, appliedProfile, appliedPreset),
    );
  }
  const otherProfiles = appliedProfile
    ? profiles.filter((profile) => profile.id !== appliedProfile.id)
    : profiles;
  const shouldRecommendFromOtherProfiles = appliedProfile
    ? otherProfiles.some((profile) => profileCanBenefitFromGateway(target, profile))
    : otherProfiles.some((profile) => profileRequiresGateway(target, profile) || profileCanBenefitFromGateway(target, profile));
  if (shouldRecommendFromOtherProfiles) {
    return withGatewayRequirementDetail(
      "recommended",
      "已添加配置中存在可使用或依赖本地网关的项目；建议在切换前确认网关状态。",
    );
  }
  return gatewayRequirement("none");
}
