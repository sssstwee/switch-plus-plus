import { deepStrictEqual, equal } from "node:assert/strict";
import { filterProviderModelCandidates, orderProviderModels, providerModelLabel, providerModelSupports1m, providerModelCapabilityLabel } from "./modelDiscovery.ts";
import { allVendorPresets } from "./vendorPresets.ts";
import type { ProviderModel } from "./appTypes.ts";

// Every remaining vendor must accept future IDs and multimodal text models.
for (const preset of allVendorPresets) {
  const models = ["future-model-9", "qwen-vl-new", "gpt-7-future", "provider/omni-new", "future-model-9"];
  deepStrictEqual(filterProviderModelCandidates(models, preset), models.slice(0,4));
}
const largeList = Array.from({ length: 120 }, (_, i) => `provider/model-${i}`);
deepStrictEqual(filterProviderModelCandidates(largeList, allVendorPresets.find((p) => p.id === "openrouter")),largeList);
const model = (id: string, patch: Partial<ProviderModel> = {}): ProviderModel => ({id, name:id, input_modalities:[], ...patch});
const flash = model("deepseek-flash", {name:"DeepSeek-V4.1-Flash",input_modalities:["text","image"]});
const pro = model("deepseek-v4-pro");
deepStrictEqual(orderProviderModels([flash,pro]).map((m) => m.id),[flash.id,pro.id]);
equal(providerModelLabel(flash), "DeepSeek-V4.1-Flash · deepseek-flash · 支持图片");
equal(providerModelLabel(pro),"deepseek-v4-pro");
deepStrictEqual(orderProviderModels([model("old",{created_at:1}),model("new",{created_at:3}),model("embed",{supports_text:false})]).map((m)=>m.id),["new","old"]);
deepStrictEqual(orderProviderModels([model("old",{created_at:"2025-01-01"}),model("new",{created_at:"2026-10-16"})]).map((m)=>m.id),["new","old"]);
console.log("modelDiscovery tests passed");

equal(providerModelSupports1m("unknown-model"), false);
equal(providerModelSupports1m("MiniMax-M3.1-Flash-Preview"), false);
equal(providerModelSupports1m("deepseek-flash", [model("deepseek-flash", {context_window: 128000})]), false);
equal(providerModelSupports1m("future-model", [model("future-model", {context_window: 1048576})]), true);
equal(providerModelCapabilityLabel(model("m", {context_window:524288, reasoning_efforts:["high","max"],default_reasoning:"max"})), "上下文 524,288 tokens；推理强度 high / max（默认 max）");
