import { modelSupports1mContext } from "./gatewayProfile.ts";
import type { ProviderModel, VendorPreset } from "./appTypes.ts";

export function isAggregatorPreset(preset: VendorPreset | null | undefined) {
  return Boolean(preset && ["bailian", "bailian-coding", "openrouter", "siliconflow", "modelscope"].includes(preset.id));
}

// The provider's live list is authoritative. Never hide future IDs, multimodal
// models or entire vendors based on a bundled family whitelist or a chip limit.
export function filterProviderModelCandidates(
  models: string[],
  _preset?: VendorPreset | null,
  _limit?: number,
) {
  return [...new Set(models.map((model) => model.trim()).filter(Boolean))];
}

export function orderProviderModels(details: ProviderModel[]): ProviderModel[] {
  const date = (model: ProviderModel) => typeof model.created_at === "number"
    ? model.created_at * 1000
    : Date.parse((model.created_at ?? "").replace(/^(\d{4}-\d{2}-\d{2}) /, "$1T")) || 0;
  // Use published timestamps where available; otherwise retain official order.
  return details.filter((model) => model.supports_text !== false)
    .sort((left, right) => date(right) - date(left));
}

export function providerModelLabel(model: ProviderModel): string {
  const name = model.name && model.name !== model.id ? `${model.name} · ${model.id}` : model.id;
  return `${name}${model.input_modalities.includes("image") ? " · 支持图片" : ""}`;
}

export function providerModelSupports1m(model: string, details: ProviderModel[] = []): boolean {
  const window = details.find((entry) => entry.id === model)?.context_window;
  return window != null ? window >= 1_000_000 : modelSupports1mContext(model);
}

export function providerModelCapabilityLabel(model: ProviderModel): string {
  const parts: string[] = [];
  if (model.context_window) parts.push(`上下文 ${model.context_window.toLocaleString("en-US")} tokens`);
  if (model.max_output_tokens) parts.push(`最大输出 ${model.max_output_tokens.toLocaleString("en-US")} tokens`);
  if (model.input_modalities.length) parts.push(`输入：${model.input_modalities.map((value) => ({text: "文本", image: "图片", audio: "音频", video: "视频"}[value] ?? value)).join("、")}`);
  if (model.reasoning_efforts?.length) parts.push(`推理强度 ${model.reasoning_efforts.join(" / ")}${model.default_reasoning ? `（默认 ${model.default_reasoning}）` : ""}`);
  return parts.join("；");
}
