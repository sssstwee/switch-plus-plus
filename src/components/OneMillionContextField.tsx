import { Tooltip } from "../nativeUi.tsx";

type OneMillionContextFieldProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function OneMillionContextField({ checked, onChange, disabled }: OneMillionContextFieldProps) {
  return (
    <div className="ccr-config-options">
      <Tooltip.Root delay={350}>
        <Tooltip.Trigger className="ccr-option-tooltip-trigger">
          <label className="ccr-check">
            <input
              type="checkbox"
              checked={checked}
              disabled={disabled}
              onChange={(e) => onChange(e.currentTarget.checked)}
            />
            <span>1M 上下文</span>
          </label>
        </Tooltip.Trigger>
        <Tooltip.Content showArrow className="ccr-option-tooltip">
          <div className="ccr-tooltip-section">
            <div className="ccr-tooltip-label">说明</div>
            <div>
              根据模型接口返回的上下文或已确认的模型能力设置。未知模型默认关闭；仅在厂商和套餐均支持时手动开启。
            </div>
          </div>
          <div className="ccr-tooltip-section">
            <div className="ccr-tooltip-label">生效</div>
            <div>
              这是客户端长上下文声明，不会提升厂商或套餐额度。Codex 优先使用专用模型目录的上限；Claude Code 使用 [1m] 标记。
            </div>
          </div>
        </Tooltip.Content>
      </Tooltip.Root>
    </div>
  );
}
