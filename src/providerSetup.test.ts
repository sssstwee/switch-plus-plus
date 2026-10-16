import { equal, ok } from "node:assert/strict";
import { providerSetupHints, providerSetupValidation } from "./providerSetup.ts";
import { allVendorPresets, vendorPresetApiFormatForTarget, vendorPresetBaseUrlForTarget } from "./vendorPresets.ts";
import { createEmptyAddForm } from "./profileFormUtils.ts";
import { buildCodexModelCatalogPreview, buildCodexConfigTomlTemplate } from "./configPreviews.ts";

for (const preset of allVendorPresets.filter((item) => item.id !== "custom" && !item.id.endsWith("-package"))) {
  for (const target of ["codex", "claude_cli", "claude_desktop"] as const) {
    const form = {...createEmptyAddForm(), base_url:vendorPresetBaseUrlForTarget(preset,target), api_format:vendorPresetApiFormatForTarget(preset,target)};
    ok(providerSetupHints(preset,target,form).length >= 2, `${preset.id} ${target} needs specific setup guidance`);
    equal(providerSetupValidation(preset,form),null);
  }
}
const bailian = allVendorPresets.find((item) => item.id === "bailian")!;
ok(providerSetupValidation(bailian,{...createEmptyAddForm(),base_url:bailian.base_url,api_key:"sk-sp-test"}));
ok(providerSetupValidation(null,{...createEmptyAddForm(),base_url:"javascript:alert(1)"}));
ok(providerSetupValidation(null,{...createEmptyAddForm(),base_url:"https://user:secret@example.com/v1"}));

for (const id of ["zai-coding","zai-coding-cn"]) {
  const preset = allVendorPresets.find((item) => item.id === id)!;
  equal(vendorPresetApiFormatForTarget(preset,"codex"),"openai_responses");
  ok(vendorPresetBaseUrlForTarget(preset,"codex").endsWith("/api/v1"));
  ok(vendorPresetBaseUrlForTarget(preset,"claude_cli").endsWith("/api/anthropic"));
  const form = {...createEmptyAddForm(),model:"glm-5.3",base_url:preset.base_url,compat_mode:"direct" as const,api_format:"openai_responses" as const};
  const entry = JSON.parse(buildCodexModelCatalogPreview(form)).models[0];
  equal(entry.context_window,1048576);
  equal(entry.default_reasoning_level,"max");
  equal(entry.supported_reasoning_levels.map((level:{effort:string}) => level.effort).join(","),"low,high,max");
  equal(entry.input_modalities.join(","),"text");
  ok(buildCodexConfigTomlTemplate(form,preset).includes('enabled-reasoning-efforts = ["low", "high", "max"]'));
}
const future = JSON.parse(buildCodexModelCatalogPreview({...createEmptyAddForm(),model:"future-model"},[],[
  {id:"future-model",name:"Future",input_modalities:["text","image"],context_window:524288,reasoning_efforts:["low","max"],default_reasoning:"max"},
])).models[0];
equal(future.context_window,524288);
equal(future.default_reasoning_level,"max");
equal(future.input_modalities.join(","),"text,image");
console.log("providerSetup tests passed");
