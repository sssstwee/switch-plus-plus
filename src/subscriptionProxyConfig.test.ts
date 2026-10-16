import { strict as assert } from "node:assert";
import { test } from "node:test";
import type { SubscriptionProxyStatus } from "./appTypes.ts";
import { isSubscriptionProxyBaseUrl } from "./gatewayProfile.ts";
import {
  buildClaudeCodeConnectionSummary,
  buildSubscriptionProxyProfile,
  isSubscriptionProxyProfileId,
  selectSubscriptionProxyModel,
  SUBSCRIPTION_PROXY_CLAUDE_DESKTOP_PROFILE_ID,
  SUBSCRIPTION_PROXY_PROFILE_ID,
  subscriptionProxyUsableModels,
  syncSubscriptionProxyProfiles,
} from "./subscriptionProxyConfig.ts";

const clientConfig = {
  apiKey: "sk-switchpp-local",
  baseUrl: "http://127.0.0.1:8317",
  model: "gpt-5.4",
};

const runningStatus: SubscriptionProxyStatus = {
  installed: true,
  running: true,
  managed_by_app: true,
  binary_path: "/tmp/cliproxyapi",
  version: "7.2.102",
  base_url: clientConfig.baseUrl,
  client_api_key: clientConfig.apiKey,
  config_path: "/tmp/config.yaml",
  auth_dir: "/tmp/auth",
  codex_authenticated: true,
  codex_account_count: 1,
  gateway_running: true,
  gateway_base_url: "http://127.0.0.1:23457/subscription/v1",
  gateway_api_key: "agent-switch-local-gateway",
  models: [
    "codex-auto-review",
    "Fable5",
    "gpt-image-2",
    "gpt-5.4",
    "gpt-5.6-sol",
  ],
};

test("subscription proxy prefers available Astra while preserving an explicit model choice", () => {
  const models = [...runningStatus.models, "gpt-6-astra"];
  assert.equal(selectSubscriptionProxyModel(models), "gpt-6-astra");
  assert.equal(selectSubscriptionProxyModel(models, "gpt-5.6-sol"), "gpt-5.6-sol");
  assert.equal(selectSubscriptionProxyModel(runningStatus.models, "gpt-6-astra"), "gpt-5.6-sol");
});

test("Claude Code summary keeps the Anthropic-compatible base URL explicit", () => {
  assert.equal(
    buildClaudeCodeConnectionSummary(clientConfig),
    [
      "Base URL: http://127.0.0.1:8317",
      "API Key: sk-switchpp-local",
      "Model: gpt-5.4",
    ].join("\n"),
  );
});

test("subscription proxy creates a stable gateway-routed Claude Code profile", () => {
  const profile = buildSubscriptionProxyProfile(
    clientConfig,
    "claude_cli",
    undefined,
    123,
  );

  assert.equal(profile.id, SUBSCRIPTION_PROXY_PROFILE_ID);
  assert.equal(profile.display_name, "ChatGPT 订阅");
  assert.equal(profile.base_url, "http://127.0.0.1:8317");
  assert.equal(profile.api_key, "sk-switchpp-local");
  assert.equal(profile.api_format, "anthropic");
  assert.equal(profile.auth_field, "ANTHROPIC_AUTH_TOKEN");
  assert.equal(profile.compat_mode, "proxy");
  assert.deepEqual(profile.model_map, {
    main: "gpt-5.4",
    haiku: "gpt-5.4",
    sonnet: "gpt-5.4",
    opus: "gpt-5.4",
  });
  assert.deepEqual(profile.provider_model_map, profile.model_map);
  assert.deepEqual(profile.models, [{ name: "gpt-5.4", supports_1m: false }]);
  assert.equal(profile.config_options.write_general_config, true);
  assert.equal(profile.updated_at, 123);
  assert.equal(isSubscriptionProxyBaseUrl(profile.base_url), true);
  assert.equal(isSubscriptionProxyBaseUrl(`${profile.base_url}/`), true);
  assert.equal(isSubscriptionProxyBaseUrl(`${profile.base_url}/v1`), true);
});

test("subscription proxy excludes task-only and image models and prefers the newest Sol model", () => {
  assert.deepEqual(subscriptionProxyUsableModels(runningStatus.models), [
    "gpt-5.4",
    "gpt-5.6-sol",
  ]);
  assert.equal(
    selectSubscriptionProxyModel(runningStatus.models),
    "gpt-5.6-sol",
  );
  assert.equal(
    selectSubscriptionProxyModel(runningStatus.models, "codex-auto-review"),
    "gpt-5.6-sol",
  );
  assert.equal(
    selectSubscriptionProxyModel(runningStatus.models, "gpt-5.4"),
    "gpt-5.4",
  );
});

test("re-syncing the subscription proxy updates the stable profile without losing preferences", () => {
  const existing = buildSubscriptionProxyProfile(
    clientConfig,
    "claude_cli",
    undefined,
    123,
  );
  existing.display_name = "我的 ChatGPT";
  existing.note = "保留备注";
  existing.config_options.disable_auto_update = true;

  const updated = buildSubscriptionProxyProfile(
    {
      ...clientConfig,
      apiKey: "sk-switchpp-new",
      model: "gpt-5.5",
    },
    "claude_cli",
    existing,
    456,
  );

  assert.equal(updated.id, existing.id);
  assert.equal(updated.display_name, "我的 ChatGPT");
  assert.equal(updated.note, "保留备注");
  assert.equal(updated.api_key, "sk-switchpp-new");
  assert.equal(updated.model_map.main, "gpt-5.5");
  assert.equal(updated.config_options.disable_auto_update, true);
  assert.equal(updated.updated_at, 456);
});

test("Claude Desktop migrates the legacy automatic profile and applied marker to a UUID", () => {
  const legacy = {
    ...buildSubscriptionProxyProfile(
      clientConfig,
      "claude_desktop",
      undefined,
      123,
    ),
    id: SUBSCRIPTION_PROXY_PROFILE_ID,
  };
  legacy.display_name = "我的 ChatGPT";

  const migrated = syncSubscriptionProxyProfiles(
    [legacy],
    SUBSCRIPTION_PROXY_PROFILE_ID,
    runningStatus,
    "claude_desktop",
    "gpt-5.4",
    456,
  );

  assert.equal(migrated.action, "updated");
  assert.equal(migrated.profiles.length, 1);
  assert.equal(
    migrated.profiles[0].id,
    SUBSCRIPTION_PROXY_CLAUDE_DESKTOP_PROFILE_ID,
  );
  assert.equal(migrated.profiles[0].display_name, "我的 ChatGPT");
  assert.equal(
    migrated.appliedProfileId,
    SUBSCRIPTION_PROXY_CLAUDE_DESKTOP_PROFILE_ID,
  );
  assert.equal(
    isSubscriptionProxyProfileId(
      migrated.profiles[0].id,
      "claude_desktop",
    ),
    true,
  );
});

test("model selection updates and deduplicates the automatic profile", () => {
  const existing = buildSubscriptionProxyProfile(
    clientConfig,
    "claude_cli",
    undefined,
    123,
  );
  const updated = syncSubscriptionProxyProfiles(
    [existing, existing],
    SUBSCRIPTION_PROXY_PROFILE_ID,
    runningStatus,
    "claude_cli",
    "gpt-5.4",
    456,
  );

  assert.equal(updated.action, "updated");
  assert.equal(updated.profiles.length, 1);
  assert.equal(updated.profiles[0].model_map.main, "gpt-5.4");
  assert.equal(
    updated.appliedProfileId,
    SUBSCRIPTION_PROXY_PROFILE_ID,
  );
});

test("stopped proxy removes both current and legacy Claude Desktop automatic profiles", () => {
  const current = buildSubscriptionProxyProfile(
    clientConfig,
    "claude_desktop",
    undefined,
    123,
  );
  const legacy = {
    ...current,
    id: SUBSCRIPTION_PROXY_PROFILE_ID,
  };
  const removed = syncSubscriptionProxyProfiles(
    [legacy, current],
    SUBSCRIPTION_PROXY_PROFILE_ID,
    { ...runningStatus, running: false },
    "claude_desktop",
  );

  assert.equal(removed.action, "removed");
  assert.deepEqual(removed.profiles, []);
  assert.equal(removed.appliedProfileId, null);
  assert.equal(removed.clearedAppliedProfile, true);
});


test("startup sync preserves deleted subscription profiles until the user starts or configures the proxy", () => {
  for (const target of ["claude_cli", "claude_desktop"] as const) {
    const startup = syncSubscriptionProxyProfiles([], null, runningStatus, target, "", 123, false);
    assert.equal(startup.action, "unchanged");
    assert.deepEqual(startup.profiles, []);
    const explicitStart = syncSubscriptionProxyProfiles([], null, runningStatus, target, "", 123);
    assert.equal(explicitStart.action, "added");
    assert.equal(explicitStart.profiles.length, 1);
    const refresh = syncSubscriptionProxyProfiles(explicitStart.profiles, null, runningStatus, target, "gpt-5.4", 456, false);
    assert.equal(refresh.action, "updated");
    assert.equal(refresh.profiles[0].upstream_model, "gpt-5.4");
  }
});
