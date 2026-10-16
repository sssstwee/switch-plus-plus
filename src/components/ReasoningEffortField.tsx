import type { AddForm, TargetKey } from "../appTypes.ts";
import { allowedReasoningEfforts, capabilityContextForForm, clientConfigSupport } from "../configCapabilities.ts";

export function ReasoningEffortField({target, form, onChange}: {target: TargetKey; form: AddForm; onChange: (value: string) => void}) {
  const context = capabilityContextForForm(form, target);
  const levels = allowedReasoningEfforts(target, context);
  const current = target === "codex" ? form.codex_config_options.reasoning_effort || (form.codex_config_options.high_reasoning ? "high" : "") : form.config_options.reasoning_effort || (form.config_options.max_thinking ? "max" : "");
  const defaultLevel = form.model_metadata?.find((model) => model.id === context.model)?.default_reasoning;
  return <div className="ccr-edit-field">
    <label>推理强度</label>
    <select aria-label="推理强度" value={levels.includes(current) ? current : ""} disabled={!levels.length} onChange={(event) => onChange(event.currentTarget.value)}>
      <option value="">{defaultLevel ? `模型默认（${defaultLevel}）` : "模型默认"}</option>
      {levels.map((level) => <option key={level} value={level}>{level}</option>)}
    </select>
    <span className="ccr-field-help">{clientConfigSupport(target, form.client_version) || (levels.length ? "仅列出当前模型与接入协议已确认的档位；默认沿用模型自身设置。" : "当前模型或接入协议未公开可用推理档位，保留模型默认值。")}</span>
  </div>;
}
