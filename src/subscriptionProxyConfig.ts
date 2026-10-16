import type {
  GatewayProfile,
  SubscriptionProxyStatus,
} from "./appTypes.ts";
import { defaultGatewayConfigOptions } from "./gatewayConfigOptions.ts";
import { defaultModelMap } from "./gatewayProfile.ts";
import {
  claudeDesktopGatewayModelMap,
  claudeDesktopGatewayModels,
} from "./vendorPresets.ts";

export type SubscriptionProxyClientConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

export type SubscriptionProxyTargetKey = "claude_cli" | "claude_desktop";

export const SUBSCRIPTION_PROXY_PROFILE_ID =
  "switchpp-chatgpt-subscription";

export const SUBSCRIPTION_PROXY_CLAUDE_DESKTOP_PROFILE_ID =
  "a6810044-3043-48ab-99b7-96cc79d6744e";

const INTERNAL_SUBSCRIPTION_PROXY_MODELS = new Set([
  "codex-auto-review",
  "fable5",
]);

export type SubscriptionProxyProfileSyncAction =
  | "added"
  | "removed"
  | "unchanged"
  | "updated";

export type SubscriptionProxyProfileSyncResult = {
  action: SubscriptionProxyProfileSyncAction;
  appliedProfileId: string | null;
  clearedAppliedProfile: boolean;
  profiles: GatewayProfile[];
};

export function subscriptionProxyProfileIdForTarget(
  target: SubscriptionProxyTargetKey,
) {
  return target === "claude_desktop"
    ? SUBSCRIPTION_PROXY_CLAUDE_DESKTOP_PROFILE_ID
    : SUBSCRIPTION_PROXY_PROFILE_ID;
}

export function isSubscriptionProxyProfileId(
  profileId: string,
  target: SubscriptionProxyTargetKey,
) {
  if (target === "claude_desktop") {
    return profileId === SUBSCRIPTION_PROXY_CLAUDE_DESKTOP_PROFILE_ID
      || profileId === SUBSCRIPTION_PROXY_PROFILE_ID;
  }
  return profileId === SUBSCRIPTION_PROXY_PROFILE_ID;
}

export function buildClaudeCodeConnectionSummary(
  config: SubscriptionProxyClientConfig,
) {
  return [
    `Base URL: ${config.baseUrl.replace(/\/+$/, "")}`,
    `API Key: ${config.apiKey}`,
    `Model: ${config.model}`,
  ].join("\n");
}

export function subscriptionProxyUsableModels(models: readonly string[]) {
  return [...new Set(models.map((model) => model.trim()))].filter(
    (model) =>
      model
      && !INTERNAL_SUBSCRIPTION_PROXY_MODELS.has(model.toLowerCase())
      && !/^gpt-image(?:-|$)/i.test(model),
  );
}

export function selectSubscriptionProxyModel(
  models: readonly string[],
  preferredModel = "",
) {
  const usableModels = subscriptionProxyUsableModels(models);
  const normalizedPreferredModel = preferredModel.trim();
  if (usableModels.includes(normalizedPreferredModel)) {
    return normalizedPreferredModel;
  }

  const newest = (candidates: string[]) =>
    candidates.sort((left, right) =>
      right.localeCompare(left, "en", { numeric: true }));
  for (const pattern of [/-astra$/i, /-sol$/i, /-terra$/i, /-luna$/i]) {
    const model = newest(usableModels.filter((item) => pattern.test(item)))[0];
    if (model) return model;
  }
  return newest(
    usableModels.filter((model) => /^gpt-\d+(?:\.\d+)*$/i.test(model)),
  )[0] ?? usableModels[0] ?? "";
}

export function buildSubscriptionProxyProfile(
  config: SubscriptionProxyClientConfig,
  target: SubscriptionProxyTargetKey,
  existing?: GatewayProfile,
  updatedAt = Date.now(),
): GatewayProfile {
  const model = config.model.trim();
  const providerModelMap = defaultModelMap(model);
  const modelMap = target === "claude_desktop"
    ? { ...claudeDesktopGatewayModelMap }
    : { ...providerModelMap };
  const models = target === "claude_desktop"
    ? claudeDesktopGatewayModels.map((name) => ({
        name,
        supports_1m: false,
      }))
    : [{ name: model, supports_1m: false }];

  return {
    id: subscriptionProxyProfileIdForTarget(target),
    display_name: existing?.display_name.trim() || "ChatGPT 订阅",
    website_url: "",
    note:
      existing?.note.trim()
      || "通过 Switch++ 内置 CLIProxyAPI 使用 ChatGPT/Codex 订阅额度",
    base_url: config.baseUrl.trim().replace(/\/+$/, ""),
    api_key: config.apiKey,
    api_format: "anthropic",
    auth_field: "ANTHROPIC_AUTH_TOKEN",
    use_full_url: false,
    compat_mode: "proxy",
    upstream_model: model,
    model_map: modelMap,
    provider_model_map: providerModelMap,
    config_options: {
      ...defaultGatewayConfigOptions,
      ...(existing?.config_options ?? {}),
    },
    models,
    updated_at: updatedAt,
  };
}

function subscriptionProxyProfileFingerprint(profile: GatewayProfile) {
  return JSON.stringify({ ...profile, updated_at: 0 });
}

export function syncSubscriptionProxyProfiles(
  profiles: GatewayProfile[],
  appliedProfileId: string | null | undefined,
  status: SubscriptionProxyStatus,
  target: SubscriptionProxyTargetKey,
  preferredModel = "",
  updatedAt = Date.now(),
  createMissing = true,
): SubscriptionProxyProfileSyncResult {
  const profileId = subscriptionProxyProfileIdForTarget(target);
  const canonicalIndex = profiles.findIndex(
    (profile) => profile.id === profileId,
  );
  const existingIndex = canonicalIndex >= 0
    ? canonicalIndex
    : profiles.findIndex((profile) =>
        isSubscriptionProxyProfileId(profile.id, target));
  const existing = existingIndex >= 0 ? profiles[existingIndex] : undefined;
  const existingCount = profiles.filter(
    (profile) => isSubscriptionProxyProfileId(profile.id, target),
  ).length;
  const currentAppliedProfileId = appliedProfileId ?? null;
  const appliedProfileIsManaged = currentAppliedProfileId !== null
    && isSubscriptionProxyProfileId(currentAppliedProfileId, target);
  const nextAppliedProfileId = appliedProfileIsManaged
    ? profileId
    : currentAppliedProfileId;

  if (!status.installed || !status.running) {
    const clearedAppliedProfile = appliedProfileIsManaged;
    if (!existing && !clearedAppliedProfile) {
      return {
        action: "unchanged",
        appliedProfileId: currentAppliedProfileId,
        clearedAppliedProfile: false,
        profiles,
      };
    }
    return {
      action: "removed",
      appliedProfileId: clearedAppliedProfile ? null : currentAppliedProfileId,
      clearedAppliedProfile,
      profiles: profiles.filter(
        (profile) => !isSubscriptionProxyProfileId(profile.id, target),
      ),
    };
  }

  if (!existing && !createMissing) {
    return {
      action: "unchanged",
      appliedProfileId: currentAppliedProfileId,
      clearedAppliedProfile: false,
      profiles,
    };
  }

  const model = selectSubscriptionProxyModel(status.models, preferredModel);
  if (
    !model
    || !status.base_url.trim()
    || !status.client_api_key.trim()
  ) {
    return {
      action: "unchanged",
      appliedProfileId: currentAppliedProfileId,
      clearedAppliedProfile: false,
      profiles,
    };
  }

  const profile = buildSubscriptionProxyProfile(
    {
      apiKey: status.client_api_key,
      baseUrl: status.base_url,
      model,
    },
    target,
    existing,
    updatedAt,
  );
  if (
    existing
    && existingCount === 1
    && existing.id === profileId
    && currentAppliedProfileId === nextAppliedProfileId
    && subscriptionProxyProfileFingerprint(existing)
      === subscriptionProxyProfileFingerprint(profile)
  ) {
    return {
      action: "unchanged",
      appliedProfileId: currentAppliedProfileId,
      clearedAppliedProfile: false,
      profiles,
    };
  }

  const nextProfiles = profiles.filter(
    (item) => !isSubscriptionProxyProfileId(item.id, target),
  );
  if (existingIndex >= 0) {
    nextProfiles.splice(
      Math.min(existingIndex, nextProfiles.length),
      0,
      profile,
    );
  } else {
    nextProfiles.push(profile);
  }
  return {
    action: existing ? "updated" : "added",
    appliedProfileId: nextAppliedProfileId,
    clearedAppliedProfile: false,
    profiles: nextProfiles,
  };
}
