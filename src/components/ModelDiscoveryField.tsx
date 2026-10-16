import type { ProviderModel } from "../appTypes.ts";
import { providerModelLabel, providerModelCapabilityLabel } from "../modelDiscovery.ts";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  ArrowsClockwise as RefreshCwIcon,
  Plus as PlusIcon,
  Trash as TrashIcon,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { SortableProfileCard } from "./AppUiPrimitives.tsx";
import { Input } from "../nativeUi.tsx";

let modelRowIdCounter = 0;

function createModelRowId() {
  modelRowIdCounter += 1;
  return `model-row-${modelRowIdCounter}`;
}

function normalizeModelRowIds(ids: string[], count: number) {
  if (ids.length === count) return ids;
  if (ids.length > count) return ids.slice(0, count);
  return [
    ...ids,
    ...Array.from({ length: count - ids.length }, () => createModelRowId()),
  ];
}

function reorderModelRowIds(ids: string[], fromIndex: number, toIndex: number) {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= ids.length ||
    toIndex >= ids.length
  ) {
    return ids;
  }
  const nextIds = [...ids];
  const [movedId] = nextIds.splice(fromIndex, 1);
  nextIds.splice(toIndex, 0, movedId);
  return nextIds;
}

type ModelDiscoveryFieldProps = {
  label?: string;
  value: string;
  apiKeyValue: string;
  modelDiscoveryBusy: boolean;
  modelDiscoveryEndpoint: string;
  providerModelCandidates: string[];
  modelDetails?: ProviderModel[];
  placeholder: string;
  onDiscover: () => void;
  onChange: (value: string) => void;
  onSelectCandidate: (model: string) => void;
  extraModels?: string[];
  onAddExtraModel?: () => void;
  onChangeExtraModel?: (index: number, value: string) => void;
  onRemoveExtraModel?: (index: number) => void;
  onChangeModelAt?: (index: number, value: string) => void;
  onRemoveModelAt?: (index: number) => void;
  onReorderModels?: (fromIndex: number, toIndex: number) => void;
};

export function ModelDiscoveryField({
  label = "上游模型",
  value,
  apiKeyValue,
  modelDiscoveryBusy,
  modelDiscoveryEndpoint,
  providerModelCandidates,
  modelDetails = [],
  placeholder,
  onDiscover,
  onChange,
  onSelectCandidate,
  extraModels = [],
  onAddExtraModel,
  onChangeExtraModel,
  onRemoveExtraModel,
  onChangeModelAt,
  onRemoveModelAt,
  onReorderModels,
}: ModelDiscoveryFieldProps) {
  const [modelSearch, setModelSearch] = useState("");
  useEffect(() => setModelSearch(""), [modelDiscoveryEndpoint]);
  const labelFor = (id: string) => {
    const detail = modelDetails.find((model) => model.id === id);
    return detail ? providerModelLabel(detail) : id;
  };
  const visibleCandidates = providerModelCandidates.filter((model) => labelFor(model).toLowerCase().includes(modelSearch.toLowerCase()));
  const canEditExtraModels = Boolean(onAddExtraModel && onChangeExtraModel && onRemoveExtraModel);
  const canEditModelList = Boolean(onAddExtraModel && onChangeModelAt && onRemoveModelAt && onReorderModels);
  const modelValues = [value, ...extraModels];
  const [modelItemIds, setModelItemIds] = useState(() => modelValues.map(() => createModelRowId()));
  const [activeModelInputIndex, setActiveModelInputIndex] = useState(0);
  const activeCandidateValue = modelValues[activeModelInputIndex] ?? value;
  const activeDetails = modelDetails.find((model) => model.id === activeCandidateValue);
  const modelDragSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  useEffect(() => {
    setModelItemIds((ids) => normalizeModelRowIds(ids, modelValues.length));
    setActiveModelInputIndex((activeIndex) => Math.min(activeIndex, Math.max(0, modelValues.length - 1)));
  }, [modelValues.length]);

  function handleSelectCandidate(model: string) {
    if (canEditModelList && onChangeModelAt) {
      onChangeModelAt(activeModelInputIndex, model);
      return;
    }
    onSelectCandidate(model);
  }

  function handleAddModel() {
    const nextIndex = modelValues.length;
    setModelItemIds((ids) => [...normalizeModelRowIds(ids, nextIndex), createModelRowId()]);
    onAddExtraModel?.();
    setActiveModelInputIndex(nextIndex);
  }

  function handleRemoveModel(index: number) {
    setModelItemIds((ids) => ids.filter((_, itemIndex) => itemIndex !== index));
    onRemoveModelAt?.(index);
    setActiveModelInputIndex((activeIndex) => {
      if (activeIndex === index) return Math.max(0, index - 1);
      return activeIndex > index ? activeIndex - 1 : activeIndex;
    });
  }

  function nextActiveIndexAfterMove(activeIndex: number, fromIndex: number, toIndex: number) {
    if (activeIndex === fromIndex) return toIndex;
    if (fromIndex < toIndex && activeIndex > fromIndex && activeIndex <= toIndex) return activeIndex - 1;
    if (fromIndex > toIndex && activeIndex >= toIndex && activeIndex < fromIndex) return activeIndex + 1;
    return activeIndex;
  }

  function handleModelDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = modelItemIds.indexOf(String(active.id));
    const toIndex = modelItemIds.indexOf(String(over.id));
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= modelValues.length || toIndex >= modelValues.length) return;
    setModelItemIds((ids) => reorderModelRowIds(ids, fromIndex, toIndex));
    onReorderModels?.(fromIndex, toIndex);
    setActiveModelInputIndex((activeIndex) => nextActiveIndexAfterMove(activeIndex, fromIndex, toIndex));
  }

  return (
    <div className="ccr-edit-field">
      <div className="ccr-field-label-row ccr-field-label-row-left">
        <label>{label}</label>
        <button
          type="button"
          className="ccr-inline-sync-action"
          disabled={modelDiscoveryBusy || !apiKeyValue.trim()}
          onClick={onDiscover}
          title="实时获取厂商模型列表和官方名称"
        >
          <RefreshCwIcon className="h-3 w-3" />
          {modelDiscoveryBusy ? "获取中" : "获取模型"}
        </button>
      </div>
      {canEditModelList ? (
        <DndContext
          sensors={modelDragSensors}
          collisionDetection={closestCenter}
          onDragEnd={handleModelDragEnd}
        >
          <SortableContext
            items={modelItemIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="ccr-model-grid" aria-label="自定义模型列表">
              {modelValues.map((model, index) => {
                const canDragModelItem = modelValues.length > 1;
                const canRemoveModelItem = modelValues.length > 1;
                return (
                  <SortableProfileCard
                    key={modelItemIds[index]}
                    id={modelItemIds[index]}
                    className="ccr-model-list-item"
                    disabled={!canDragModelItem}
                  >
                    {(dragHandle) => (
                      <>
                        {dragHandle}
                        <Input
                          aria-label={index === 0 ? label : `自定义模型 ${index + 1}`}
                          placeholder={index === 0 ? placeholder : "额外模型 ID"}
                          value={model}
                          onFocus={() => setActiveModelInputIndex(index)}
                          onChange={(e) => onChangeModelAt?.(index, e.currentTarget.value)}
                        />
                        <button
                          type="button"
                          className="ccr-model-icon-action danger"
                          disabled={!canRemoveModelItem}
                          onClick={() => handleRemoveModel(index)}
                          aria-label="删除自定义模型"
                          title={canRemoveModelItem ? "删除自定义模型" : "至少保留一个模型"}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </SortableProfileCard>
                );
              })}
              <button
                type="button"
                className="ccr-model-add-card"
                onClick={handleAddModel}
                aria-label="添加自定义模型"
                title="添加自定义模型"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className={canEditExtraModels ? "ccr-model-input-row" : undefined}>
          <Input
            placeholder={placeholder}
            value={value}
            onFocus={() => setActiveModelInputIndex(0)}
            onChange={(e) => onChange(e.currentTarget.value)}
          />
          {canEditExtraModels ? (
            <button
              type="button"
              className="ccr-model-icon-action"
              onClick={handleAddModel}
              aria-label="添加自定义模型"
              title="添加自定义模型"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      )}
      {!canEditModelList && canEditExtraModels && extraModels.length > 0 ? (
        <div className="ccr-extra-model-list" aria-label="自定义模型列表">
          {extraModels.map((model, index) => (
            <div className="ccr-model-input-row" key={index}>
              <Input
                aria-label={`自定义模型 ${index + 2}`}
                placeholder="额外模型 ID"
                value={model}
                onFocus={() => setActiveModelInputIndex(index + 1)}
                onChange={(e) => onChangeExtraModel?.(index, e.currentTarget.value)}
              />
              <button
                type="button"
                className="ccr-model-icon-action danger"
                onClick={() => onRemoveExtraModel?.(index)}
                aria-label="删除自定义模型"
                title="删除自定义模型"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
      {providerModelCandidates.length > 12 ? <Input aria-label="搜索模型" placeholder="搜索模型名称或 ID" value={modelSearch} onChange={(event) => setModelSearch(event.currentTarget.value)} /> : null}
      {providerModelCandidates.length > 0 ? (
        <div className="ccr-model-candidates" aria-label="模型候选">
          {visibleCandidates.map((model) => (
            <button
              key={model}
              type="button"
              className={activeCandidateValue === model ? "ccr-model-candidate active" : "ccr-model-candidate"}
              onClick={() => handleSelectCandidate(model)}
              title={labelFor(model)}
            >
              {labelFor(model)}
            </button>
          ))}
        </div>
      ) : null}
      {activeDetails && providerModelCapabilityLabel(activeDetails) ? <span className="ccr-field-help">{providerModelCapabilityLabel(activeDetails)}</span> : null}
      <span className="ccr-field-help">
        {modelDiscoveryEndpoint
          ? `实时模型列表来自 ${modelDiscoveryEndpoint}`
          : "当前为内置候选，点击获取模型刷新；厂商未开放接口时可手动填写官网模型 ID。"}
      </span>
    </div>
  );
}
