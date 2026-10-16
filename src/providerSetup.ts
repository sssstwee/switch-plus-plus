import type { AddForm, TargetKey, VendorPreset } from "./appTypes.ts";

// Keep account/plan guidance alongside the existing preset routing, without
// inventing protocol support from a vendor or model name.
export function providerSetupHints(preset: VendorPreset | null, target: TargetKey, form: AddForm): string[] {
  if (!preset || preset.id === "custom") return ["填写厂商提供的 Base URL 和真实模型 ID；协议须与该地址匹配。"];
  if (preset.id.endsWith("-package")) return [];
  const protocol = form.api_format === "anthropic" ? "Anthropic Messages"
    : form.api_format === "openai_responses" ? "OpenAI Responses" : "OpenAI Chat Completions";
  const app = target === "codex" ? "Codex" : target === "claude_cli" ? "Claude Code" : "Claude Desktop";
  const route = form.compat_mode === "proxy" ? `${app} → Switch++ 本地网关 → ${protocol}` : `${app} → ${protocol}`;
  const hints = [route];
  if (preset.id === "openai") hints.push("填写 OpenAI 平台 API Key，按 API 用量计费；ChatGPT 套餐登录请选官方登录方案。");
  else if (preset.id === "anthropic") hints.push("填写 Claude Console API Key；Claude 订阅登录请选官方登录方案，API 额度单独计算。");
  else if (preset.id === "deepseek") hints.push("DeepSeek-Flash 的官网名称为 DeepSeek-V4.1-Flash，调用 ID 仍是 deepseek-flash。图片直接发送给所选模型；按实时能力信息选择图片模型。");
  else if (preset.id.startsWith("minimax")) hints.push(preset.id.includes("coding")
    ? "使用对应站点的 M-Plan 密钥。MiniMax-M3.1-Flash-Preview 在 Codex 中使用官方推荐的 512K 上下文，默认 max 推理。"
    : "使用对应站点的按量 API Key；M-Plan 请选择套餐方案。模型 ID 区分大小写，请保留 MiniMax- 前缀。");
  else if (preset.id === "kimi-code") hints.push("使用 Kimi Code 套餐密钥。k3、k3-256k、kimi-for-coding 是调用 ID；K3 与 1M 上下文权限取决于套餐，k3-256k 固定为 256K。");
  else if (preset.id.startsWith("kimi")) hints.push("使用 Moonshot 开放平台密钥及模型 ID（如 kimi-k3）；Kimi Code 套餐的密钥与模型 ID 请在套餐方案中配置。");
  else if (preset.id.startsWith("zai-coding")) hints.push(target === "codex"
    ? "Coding Plan 使用专用 /api/v1 Responses 地址；GLM-5.3 默认 max，支持 low / high / max。个人与团队套餐密钥请对应选择。"
    : "Coding Plan 使用 /api/anthropic 地址。个人与团队套餐密钥请对应选择，模型角色可分别映射。");
  else if (preset.id === "glm-cn" || preset.id === "zai-global") hints.push("按量 API 与 Coding Plan 使用不同端点和额度；需要编程套餐时请选择套餐方案。");
  else if (preset.id === "bailian-coding") hints.push("填写 Coding Plan 专用 sk-sp- 密钥；套餐模型列表独立于按量 API。Codex 经本地网关适配 Chat，不使用 Responses 直连。");
  else if (preset.id === "bailian") hints.push("API Key 须与地域和工作空间匹配；可将地址替换为控制台提供的工作空间地址。仅部分模型支持 Responses；不支持的模型可在高级选项切换本地网关。");
  else if (preset.id === "modelscope") hints.push("填写魔搭访问令牌 Access Token。保留完整的 组织/模型 ID；通过 OpenAI Chat 接口和本地网关接入，额度与可用模型以魔搭账户为准。");
  else if (preset.id === "siliconflow") hints.push("保留完整模型 ID，包括组织名及 Pro/ 等前缀；模型可用性和图片能力以当前账户与实时列表为准。");
  else if (preset.id === "openrouter") hints.push("保留完整的 厂商/模型 ID。聚合平台的可用模型和上下文可能与模型原厂不同，以 OpenRouter 实时返回为准。");
  if (/minimax|kimi-(?:cn|global)|zai|glm-cn/.test(preset.id)) hints.push("国内与国际站的账户、密钥和额度请与所选地址保持一致。");
  return hints;
}

export function providerSetupValidation(preset: VendorPreset | null, form: AddForm): string | null {
  if (!form.base_url.trim()) return null;
  let url: URL;
  try { url = new URL(form.base_url.trim()); } catch { return "请输入完整的 http:// 或 https:// 请求地址。"; }
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return "请求地址须使用 HTTP/HTTPS；密钥请填写在 API Key 字段。";
  if (preset?.id === "bailian" && form.api_key.trim().startsWith("sk-sp-")) return "这是百炼 Coding Plan 密钥，请选择套餐方案以使用对应端点与额度。";
  return null;
}
