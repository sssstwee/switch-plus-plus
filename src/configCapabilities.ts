import type { AddForm, ApiFormat, ProviderModel, TargetKey } from "./appTypes.ts";

export type ClientConfigContext = { versions: Partial<Record<TargetKey, string>>; codex_models: ProviderModel[] };
export type CapabilityContext = {
  model?: string;
  metadata?: ProviderModel[];
  apiFormat?: ApiFormat;
  clientVersion?: string;
  usesGateway?: boolean;
};

// These are tested baselines, not claims about the first release of each key.
export const verifiedClientVersions = { codex: "0.163.0", claude_cli: "2.1.185", claude_desktop: "2.42304.0" };
export function clientConfigSupport(target: TargetKey, version?: string, verifiedVersion = verifiedClientVersions[target]): string | null {
  if (version === undefined) return null; // Pure config generation has no local installation context.
  const actual = version.match(/\d+(?:\.\d+){2}/)?.[0].split(".").map(Number);
  if (!actual) return "未检测到可验证的应用版本，请安装应用或刷新环境检查。";
  const baseline = verifiedVersion.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if (actual[i] > baseline[i]) return null;
    if (actual[i] < baseline[i]) return `当前版本 ${version} 早于已验证版本 ${verifiedVersion}，暂不写入这些选项。`;
  }
  return null;
}

// Only exact, documented IDs are fallbacks. Live explicit negatives always win.
function bundledCapabilities(model: string) {
  if (["deepseek-flash", "deepseek-v4-pro", "deepseek-v4-flash"].includes(model)) {
    return { efforts: ["low", "high", "max"], capabilities: { thinking: true, reasoning_summary: false, verbosity: false, web_search: false } };
  }
  if (["MiniMax-M3", "MiniMax-M3.1-Flash-Preview"].includes(model)) {
    return { efforts: ["low", "medium", "high", "xhigh", "max"], capabilities: { thinking: true, reasoning_summary: false, verbosity: false, web_search: false } };
  }
  if (model === "glm-5.3") return { efforts: ["low", "high", "max"], capabilities: { thinking: true, reasoning_summary: false, verbosity: false, web_search: false } };
  if (["gpt-6-astra", "gpt-6-sol", "gpt-6.1-sol", "gpt-6-luna", "gpt-5.5", "gpt-5.6-sol", "gpt-5.6-terra", "gpt-5.6-luna"].includes(model)) {
    return { efforts: ["low", "medium", "high", "xhigh"], capabilities: { thinking: true, reasoning_summary: true, verbosity: true, web_search: true } };
  }
  if (["Fable5", "claude-fable-5-1", "claude-opus-5-5", "claude-sonnet-5-5"].includes(model)) {
    return { efforts: ["low", "medium", "high", "max"], capabilities: { thinking: true, adaptive_thinking: true } };
  }
  return { efforts: [], capabilities: {} };
}

export function modelCapability(context: CapabilityContext, capability: string): boolean | undefined {
  context = {...context, model: context.model?.replace(/\[1m\]$/i, "")};
  const live = context.metadata?.find((entry) => entry.id === context.model);
  if (live?.capabilities && capability in live.capabilities) return live.capabilities[capability];
  if (live?.supported_parameters) {
    const parameter = { verbosity: "verbosity", reasoning_summary: "reasoning.summary", web_search: "web_search" }[capability];
    if (parameter) return live.supported_parameters.includes(parameter);
  }
  return (bundledCapabilities(context.model ?? "").capabilities as Record<string, boolean>)[capability];
}

export function modelReasoningEfforts(context: CapabilityContext): string[] {
  context = {...context, model: context.model?.replace(/\[1m\]$/i, "")};
  const live = context.metadata?.find((entry) => entry.id === context.model);
  if (live?.capabilities?.effort === false) return [];
  if (live?.reasoning_efforts?.length) return live.reasoning_efforts;
  return bundledCapabilities(context.model ?? "").efforts;
}

export function allowedReasoningEfforts(target: TargetKey, context: CapabilityContext): string[] {
  if (clientConfigSupport(target, context.clientVersion)) return [];
  if (target === "claude_desktop") return []; // Desktop owns its effort picker.
  if (target === "claude_cli" && context.apiFormat && context.apiFormat !== "anthropic") return [];
  if (target === "codex" && context.apiFormat && context.apiFormat !== "openai_responses") return [];
  const levels = target === "claude_cli" ? ["low", "medium", "high", "xhigh", "max"] : ["none", "minimal", "low", "medium", "high", "xhigh", "max", "ultra"];
  return modelReasoningEfforts(context).filter((level) => levels.includes(level));
}

export function capabilityContextForForm(form: AddForm, target: TargetKey): CapabilityContext {
  return {model: (target === "codex" ? form.model : target === "claude_desktop" ? form.provider_model_map?.main || form.model : form.model_map.main || form.model).replace(/\[1m\]$/i, ""), metadata: form.model_metadata, apiFormat: form.api_format, clientVersion: form.client_version, usesGateway: Boolean(form.base_url.trim()) && !/^https:\/\/api\.anthropic\.com(?:\/|$)/i.test(form.base_url)};
}

export function mergeModelCapabilities(models: ProviderModel[], catalog: ProviderModel[]): ProviderModel[] {
  return models.map((model) => {
    const cached = catalog.find((entry) => entry.id === model.id);
    return cached ? {...cached, ...model, capabilities: {...cached.capabilities, ...model.capabilities}, reasoning_efforts: model.reasoning_efforts?.length ? model.reasoning_efforts : cached.reasoning_efforts} : model;
  });
}

export function claudeModelCapabilities(context: CapabilityContext): string[] {
  const levels = modelReasoningEfforts(context);
  return [
    ...(levels.length ? ["effort"] : []),
    ...(levels.includes("xhigh") ? ["xhigh_effort"] : []),
    ...(levels.includes("max") ? ["max_effort"] : []),
    ...["thinking", "adaptive_thinking", "interleaved_thinking"].filter((key) => modelCapability(context, key) === true),
  ];
}
