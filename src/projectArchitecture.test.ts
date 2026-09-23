// Project architecture tests
import { strict as assert } from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

function readSource(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8").replace(/\r\n/g, "\n");
}

const hasPrivateCore = existsSync(new URL("../.private/agent-switch-private-core/src-tauri-core/src/lib.rs", import.meta.url));
const privateCoreTestOptions = hasPrivateCore ? {} : { skip: "requires-private-core" };

test("targetOptions module exports expected values", async () => {
  const mod = await import("./targetOptions.ts");
  assert.equal(Array.isArray(mod.targetOptions), true);
  assert.equal(mod.targetOptions.length, 11);
  assert.equal(mod.visibleTargetOptions.length, 10);
  assert.equal(typeof mod.claudeDesktopConfigPathLabel, "string");
});

test("target metadata stays independent from icon components", () => {
  const targetOptions = readSource("./targetOptions.ts");
  const targetIconsUrl = new URL("./targetIcons.tsx", import.meta.url);

  assert.equal(targetOptions.includes("@phosphor-icons/react"), false);
  assert.equal(targetOptions.includes("icon:"), false);
  assert.equal(existsSync(targetIconsUrl), true);
});

test("subscription proxy is exposed as a local-only CLIProxyAPI tool", privateCoreTestOptions, () => {
  const app = readSource("./App.tsx");
  const appSidebar = readSource("./features/app-shell/AppSidebar.tsx");
  const nativeIpc = readSource("./nativeIpc.ts");
  const proxyView = readSource("./features/subscription-proxy/SubscriptionProxyView.tsx");
  const proxyConfig = readSource("./subscriptionProxyConfig.ts");
  const privateCore = readSource("../.private/agent-switch-private-core/src-tauri-core/src/lib.rs");
  const privateModule = readSource("../.private/agent-switch-private-core/src-tauri-core/src/subscription_proxy.rs");
  const packageJson = JSON.parse(readSource("../package.json"));
  const prepareSidecar = readSource("../scripts/prepare-cliproxyapi-sidecar.mjs");
  const releaseWorkflow = readSource("../.github/workflows/release.yml");
  const tauriConfig = JSON.parse(readSource("../src-tauri/tauri.conf.json"));

  assert.equal(appSidebar.includes("订阅代理"), true);
  assert.equal(nativeIpc.includes('subscriptionProxyStatus: "subscription_proxy_status"'), true);
  assert.equal(nativeIpc.includes("installSubscriptionProxy"), false);
  assert.equal(nativeIpc.includes('loginSubscriptionProxyCodex: "login_subscription_proxy_codex"'), true);
  assert.equal(nativeIpc.includes('startSubscriptionProxy: "start_subscription_proxy"'), true);
  assert.equal(nativeIpc.includes('stopSubscriptionProxy: "stop_subscription_proxy"'), true);
  assert.deepEqual(tauriConfig.bundle.externalBin, ["binaries/cliproxyapi"]);
  assert.equal(tauriConfig.bundle.resources.includes("third-party/CLIProxyAPI-LICENSE.txt"), true);
  assert.equal(packageJson.scripts["prepare:cliproxyapi"], "node scripts/prepare-cliproxyapi-sidecar.mjs");
  assert.equal(prepareSidecar.includes('const VERSION = "7.3.15"'), true);
  assert.equal(prepareSidecar.includes("c1e49c148a94c476dc43a6a0eed28bca34239d5153ebb7792048d8c18f3b92f0"), true);
  assert.equal(prepareSidecar.includes("router-for-me/CLIProxyAPI/releases/download"), true);
  assert.equal(releaseWorkflow.includes("CLIPROXYAPI_TARGET: aarch64-apple-darwin"), true);
  assert.equal(proxyView.includes("安装 CLIProxyAPI"), false);
  assert.equal(proxyView.includes("已内置"), true);
  assert.equal(proxyView.includes("已同步应用"), true);
  assert.equal(proxyView.includes("Codex 与 ChatGPT 应用保持各自官方登录和配置，不同步、也不经过此网关。"), true);
  assert.equal(proxyView.includes('type ConnectionFieldKey = "apiKey" | "baseUrl" | "model"'), true);
  assert.equal(proxyView.includes("添加到配置列表"), false);
  assert.equal(proxyView.includes("复制启动命令"), false);
  assert.equal(proxyConfig.includes("buildClaudeCodeLaunchCommand"), false);
  assert.equal(proxyConfig.includes('"switchpp-chatgpt-subscription"'), true);
  assert.equal(proxyConfig.includes("syncSubscriptionProxyProfiles"), true);
  assert.equal(app.includes("currentState.claude_desktop"), true);
  assert.equal(app.includes("currentState.grok_build"), true);
  assert.equal(app.includes("onProxyStatusChange={syncSubscriptionProxyAppProfiles}"), true);
  assert.equal(app.includes("syncedApplications={subscriptionProxySyncedApplications}"), true);
  const subscriptionSyncStart = app.indexOf("function appStateWithSubscriptionProxyProfiles(");
  const subscriptionSyncEnd = app.indexOf("\nfunction App()", subscriptionSyncStart);
  const subscriptionSyncSource = app.slice(subscriptionSyncStart, subscriptionSyncEnd);
  assert.equal(subscriptionSyncSource.includes("currentState.codex"), false);
  assert.equal(privateCore.includes("is_subscription_proxy_profile"), true);
  assert.equal(privateModule.includes("ProxyConfigScope::SubscriptionOpenAi"), true);
  assert.equal(privateModule.includes("gateway_base_url"), true);
  assert.equal(privateModule.includes('host: "127.0.0.1"'), true);
  assert.equal(privateModule.includes("allow_remote: false"), true);
  assert.equal(privateModule.includes("disable_control_panel: true"), true);
  assert.equal(privateModule.includes("Homebrew"), false);
  assert.equal(privateModule.includes("find_brew"), false);
  assert.equal(privateModule.includes('.sidecar("cliproxyapi")'), true);
});

test("uiTranslation module exports expected functions", async () => {
  const mod = await import("./i18n/uiTranslation.ts");
  assert.equal(typeof mod.translateUiText, "function");
  assert.equal(typeof mod.normalizeLanguage, "function");
  assert.equal(typeof mod.shouldTranslateTextNode, "function");
});

test("appConstants exports expected constants", async () => {
  const mod = await import("./appConstants.ts");
  assert.equal(mod.SIDEBAR_DEFAULT_WIDTH, 234);
  assert.equal(mod.SIDEBAR_MIN_WIDTH, 234);
  assert.equal(mod.SIDEBAR_MAX_WIDTH, 234);
  assert.equal(mod.DEFAULT_ENV_CARD_KEY, "codex_cli");
});

test("public branding uses Switch++ naming", () => {
  const packageJson = JSON.parse(readSource("../package.json"));
  const tauriConfig = JSON.parse(readSource("../src-tauri/tauri.conf.json"));
  const cargoToml = readSource("../src-tauri/Cargo.toml");
  const indexHtml = readSource("../index.html");
  const readme = readSource("../README.md");
  const readmeEn = readSource("../README.en.md");
  const docs = readSource("../docs/index.html");
  const appConstants = readSource("./appConstants.ts");

  assert.equal(packageJson.name, "switch-plus-plus");
  assert.equal(tauriConfig.productName, "Switch++");
  assert.equal(tauriConfig.mainBinaryName, "Switch++");
  assert.equal(tauriConfig.bundle.macOS.bundleName, "Switch++");
  assert.equal(tauriConfig.app.trayIcon.tooltip, "Switch++");
  assert.equal(tauriConfig.app.trayIcon.iconPath, "icons/tray-template.png");
  assert.equal(tauriConfig.app.trayIcon.iconAsTemplate, true);
  assert.deepEqual(tauriConfig.bundle.resources, [
    "icons/32x32.png",
    "icons/tray-template.png",
    "third-party/CLIProxyAPI-LICENSE.txt",
  ]);
  assert.match(cargoToml, /features = \["macos-private-api", "tray-icon", "image-png"\]/);
  assert.equal(packageJson.scripts.dev, 'PATH="$HOME/.cargo/bin:$PATH" tauri dev --runner ../scripts/tauri-dev-runner.sh');
  assert.match(cargoToml, /^name = "switch-plus-plus"$/m);
  assert.match(cargoToml, /^name = "agent_switch_lib"$/m);
  assert.equal(readSource("../scripts/tauri-dev-runner.sh").includes('source_binary="$binary_dir/switch-plus-plus"'), true);
  assert.equal(packageJson.homepage, "https://sssstwee.github.io/switch-plus-plus/");
  assert.equal(packageJson.repository.url, "https://github.com/sssstwee/switch-plus-plus.git");
  assert.equal(packageJson.keywords.includes("claude-code"), true);
  assert.equal(packageJson.keywords.includes("codex"), true);
  assert.equal(packageJson.keywords.includes("codex-desktop"), true);
  assert.equal(appConstants.includes('APP_OFFICIAL_SITE_URL = "https://switchpp.pages.dev/"'), true);
  assert.equal(appConstants.includes('APP_LICENSE_PURCHASE_SESSION_URL = "https://license.tastedistill.com/v1/purchase-sessions"'), true);
  assert.equal(appConstants.includes('APP_LICENSE_PURCHASE_URL = "https://license.tastedistill.com/buy"'), false);
  assert.equal(indexHtml.includes("<title>Switch++</title>"), true);
  assert.equal(indexHtml.includes("/switchpp-logo.png"), true);
  assert.equal(readme.includes("https://github.com/sssstwee/switch-plus-plus/releases/latest"), true);
  assert.equal(readmeEn.includes("https://github.com/sssstwee/switch-plus-plus/releases/latest"), true);
  assert.equal(docs.includes("https://github.com/sssstwee/switch-plus-plus/releases/latest"), true);
  assert.equal(docs.includes('id="latest-download-link"'), true);
  assert.equal(docs.includes("https://api.github.com/repos/sssstwee/switch-plus-plus/releases/latest"), true);
  assert.equal(docs.includes("/aarch64\\.dmg$/i"), true);
  assert.equal(docs.includes("/x64\\.dmg$/i"), true);
  assert.equal(docs.includes("/x64-setup\\.exe$/i"), true);
  assert.equal(docs.includes("/amd64\\.AppImage$/i"), true);
  assert.equal(docs.includes("third-party config switcher"), true);
  assert.equal(readme.includes("Switch++"), true);
  assert.equal(readmeEn.includes("Switch++"), true);
  assert.equal(readme.includes("Switch++ -"), false);
  assert.equal(readmeEn.includes("Switch++ -"), false);
  assert.equal(tauriConfig.app.windows[0].title.includes("Switch++ -"), false);
  assert.equal(docs.includes("Switch++ 下载与使用指南"), true);
  assert.equal(readme.includes("Code3P"), false);
  assert.equal(readmeEn.includes("Code3P"), false);
  assert.equal(docs.includes("Code3P"), false);
  assert.equal(readme.includes("CC3P"), false);
  assert.equal(readmeEn.includes("CC3P"), false);
  assert.equal(docs.includes("CC3P"), false);
});

test("public docs and release metadata do not advertise legacy repository names", () => {
  const publicSurfaceFiles = [
    "../README.md",
    "../README.en.md",
    "../docs/index.html",
    "../index.html",
    "../package.json",
    "../src-tauri/Cargo.toml",
    "../src-tauri/tauri.conf.json",
    "../.github/workflows/release.yml",
    "../CHANGELOG.md",
    "../LICENSE",
  ];
  const legacyPublicTerms = [
    "Code3P",
    "CC3P",
    "https://github.com/sssstwee/cc3p",
    "https://github.com/sssstwee/Code3P",
    "https://sssstwee.github.io/cc3p",
    "https://sssstwee.github.io/Code3P",
    "cc3p-download",
    "Agent-Switch",
    "AgentSwitch",
  ];

  for (const file of publicSurfaceFiles) {
    const source = readSource(file);
    for (const legacyTerm of legacyPublicTerms) {
      assert.equal(source.includes(legacyTerm), false, `${file} should not include ${legacyTerm}`);
    }
  }
});

test("public docs describe the source-available shell and private core build boundary", () => {
  const readme = readSource("../README.md");
  const readmeEn = readSource("../README.en.md");

  assert.equal(readme.includes("部分源码开放版本（source-available）"), true);
  assert.equal(readme.includes("不是完整开源发行版，也不是 OSI 定义的开源项目"), true);
  assert.equal(readme.includes(".private/agent-switch-private-core/src-tauri-core/src/lib.rs"), true);
  assert.equal(readme.includes("仅 clone 本仓库不能构建出完整可用的官方应用"), true);
  assert.equal(readme.includes("跳过标记为 internal-only 的私库依赖测试"), true);

  assert.equal(readmeEn.includes("source-available public shell"), true);
  assert.equal(readmeEn.includes("not a complete open-source distribution and not an OSI open-source project"), true);
  assert.equal(readmeEn.includes(".private/agent-switch-private-core/src-tauri-core/src/lib.rs"), true);
  assert.equal(readmeEn.includes("cloning this repository alone cannot produce a complete official app build"), true);
  assert.equal(readmeEn.includes("skips internal-only tests"), true);
});

test("official distribution uses Tauri signed updater for in-app installs", () => {
  const packageJson = JSON.parse(readSource("../package.json"));
  const cargoToml = readSource("../src-tauri/Cargo.toml");
  const tauriConfig = JSON.parse(readSource("../src-tauri/tauri.conf.json"));
  const defaultCapability = JSON.parse(readSource("../src-tauri/capabilities/default.json"));
  const releaseWorkflow = readSource("../.github/workflows/release.yml");
  const appShellChrome = readSource("./features/app-shell/useAppShellChrome.ts");
  const appSidebar = readSource("./features/app-shell/AppSidebar.tsx");
  const appUpdater = readSource("./appUpdater.ts");
  const updaterModuleUrl = new URL("./appUpdater.ts", import.meta.url);

  assert.match(packageJson.dependencies["@tauri-apps/plugin-updater"], /^\^2/);
  assert.match(packageJson.dependencies["@tauri-apps/plugin-process"], /^\^2/);
  assert.match(cargoToml, /^tauri-plugin-updater = "2"$/m);
  assert.match(cargoToml, /^tauri-plugin-process = "2"$/m);
  assert.equal(tauriConfig.bundle.createUpdaterArtifacts, true);
  assert.equal(typeof tauriConfig.plugins.updater.pubkey, "string");
  assert.equal(tauriConfig.plugins.updater.pubkey.length > 80, true);
  assert.deepEqual(tauriConfig.plugins.updater.endpoints, [
    "https://github.com/sssstwee/switch-plus-plus/releases/latest/download/latest.json",
  ]);
  assert.equal(defaultCapability.permissions.includes("updater:default"), true);
  assert.equal(defaultCapability.permissions.includes("process:allow-restart"), true);
  assert.equal(existsSync(updaterModuleUrl), true);
  assert.equal(appShellChrome.includes("checkOfficialAppUpdate"), true);
  assert.equal(appShellChrome.includes("installOfficialAppUpdate"), true);
  assert.equal(appUpdater.includes("update.downloadAndInstall"), true);
  assert.equal(appUpdater.includes("window.setTimeout(resolve, 1200)"), true);
  assert.equal(appUpdater.includes("await relaunch();"), true);
  assert.equal(appShellChrome.includes("openUrl(url)"), false);
  assert.equal(appSidebar.includes("appUpdateInstallState"), true);
  assert.equal(appSidebar.includes('className="ccr-sidebar-update-label"'), true);
  assert.equal(appSidebar.includes("购买授权码"), true);
  assert.equal(appSidebar.includes("!licenseActivated ? ("), true);
  assert.equal(appSidebar.includes("当前版本"), true);
  assert.equal(appSidebar.includes("APP_LICENSE_PURCHASE_SESSION_URL"), true);
  assert.equal(appSidebar.includes("createLicensePurchaseSession"), true);
  assert.equal(releaseWorkflow.includes("TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}"), true);
  assert.equal(
    releaseWorkflow.includes("TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}"),
    true,
  );
  assert.equal(releaseWorkflow.includes("includeUpdaterJson: true"), true);
  assert.equal(releaseWorkflow.includes("prepare-release:"), true);
  assert.equal(releaseWorkflow.includes("release_id: ${{ steps.release.outputs.release_id }}"), true);
  assert.equal(releaseWorkflow.includes("releaseId: ${{ needs.prepare-release.outputs.release_id }}"), true);
  assert.equal(releaseWorkflow.includes("--target aarch64-apple-darwin --bundles app,dmg"), true);
  assert.equal(releaseWorkflow.includes("--target x86_64-apple-darwin --bundles app,dmg"), false);
  assert.equal(releaseWorkflow.includes("- platform: windows-latest"), false);
  assert.equal(releaseWorkflow.includes("- platform: ubuntu-22.04"), false);
  assert.equal(releaseWorkflow.includes("--bundles nsis"), false);
  assert.equal(releaseWorkflow.includes("--bundles appimage"), false);
  assert.equal(releaseWorkflow.includes("shared-key: ${{ runner.os }}-${{ matrix.cacheKey }}"), true);
  assert.equal(releaseWorkflow.includes("Switch++_aarch64.app.tar.gz"), true);
  assert.equal(releaseWorkflow.includes("Switch++_x64.app.tar.gz"), false);
  assert.equal(releaseWorkflow.includes("*.app.tar.gz.sig"), true);
  assert.equal(releaseWorkflow.includes("actions/upload-artifact@v4"), true);
  assert.equal(releaseWorkflow.includes("merge-updater-manifest:"), true);
  assert.equal(releaseWorkflow.includes("expected 1 updater manifest"), true);
  assert.equal(releaseWorkflow.includes('has("darwin-aarch64")'), true);
  assert.equal(releaseWorkflow.includes('has("darwin-x86_64")'), false);
  assert.equal(releaseWorkflow.includes('has("linux-x86_64")'), false);
  assert.equal(releaseWorkflow.includes('has("windows-x86_64")'), false);
  assert.equal(releaseWorkflow.includes('gh release upload "${GITHUB_REF_NAME}" latest.json --clobber'), true);
});

test("Tauri build script reruns when app icons change", () => {
  const buildRs = readSource("../src-tauri/build.rs");

  assert.equal(buildRs.includes("cargo:rerun-if-changed=icons/32x32.png"), true);
  assert.equal(buildRs.includes("cargo:rerun-if-changed=icons/tray-template.png"), true);
  assert.equal(buildRs.includes("cargo:rerun-if-changed=icons/icon.png"), true);
  assert.equal(buildRs.includes("cargo:rerun-if-changed=icons/icon.icns"), true);
  assert.equal(buildRs.includes("cargo:rerun-if-changed=icons/icon.ico"), true);
});

test("macOS tray icon is explicitly installed as a template image", privateCoreTestOptions, () => {
  const appShell = readSource("../.private/agent-switch-private-core/src-tauri-core/src/app_shell.rs");

  assert.equal(appShell.includes("include_bytes!(concat!(env!(\"CARGO_MANIFEST_DIR\"), \"/icons/tray-template.png\"))"), true);
  assert.equal(appShell.includes("fn bundled_tray_icon()"), true);
  assert.equal(appShell.includes("set_icon_with_as_template(Some(icon), true)"), true);
  assert.equal(appShell.includes(".icon_as_template(true)"), true);
  assert.equal(appShell.includes(".tooltip(TRAY_TOOLTIP)"), true);
  assert.equal(appShell.includes("const USAGE_WINDOW_LABEL: &str = \"usage\";"), false);
  assert.equal(appShell.includes("fn show_usage_window"), false);
  assert.equal(appShell.includes("WebviewWindowBuilder::new"), false);
  assert.equal(appShell.includes("show_main_window(app);"), true);
});

test("App delegates gateway snapshot assembly to GatewayPage module", () => {
  const appTsx = readSource("./App.tsx");
  assert.equal(appTsx.includes("getGatewaySnapshot as buildGatewaySnapshot"), true);
  assert.equal(appTsx.includes("function getGatewaySnapshot"), false);
});

test("gateway page UI state lives in a zustand store", () => {
  const appTsx = readSource("./App.tsx");
  const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  const storeUrl = new URL("./store/useGatewayStore.ts", import.meta.url);

  assert.equal(packageJson.dependencies.zustand, "^5.0.13");
  assert.equal(existsSync(storeUrl), true);
  assert.equal(appTsx.includes("useGatewayStore"), true);
  assert.equal(appTsx.includes("useState<CodexProxyStatus | null>"), false);
  assert.equal(appTsx.includes("useState<CodexProxyCallsPage | null>"), false);
  assert.equal(appTsx.includes("useState<CodexProxyOverview | null>"), false);
  assert.equal(appTsx.includes("useState<ProxyTargetKey | null>"), false);
});

test("GatewayPage avoids loose profile casts", () => {
  const gatewayPage = readSource("./components/GatewayPage.tsx");
  const gatewayHelpers = readSource("./components/gatewayHelpers.ts");

  assert.equal(gatewayPage.includes(" as any"), false);
  assert.equal(gatewayHelpers.includes("function isCodexProfile"), true);
});

test("App reuses shared gateway target helpers", () => {
  const appTsx = readSource("./App.tsx");
  const gatewayHelpers = readSource("./components/gatewayHelpers.ts");

  assert.equal(appTsx.includes('from "./components/gatewayHelpers.ts"'), true);
  assert.equal(gatewayHelpers.includes("function applyRestartMessage"), true);
  assert.equal(appTsx.includes("function codexProfileUsesProxy"), false);
  assert.equal(appTsx.includes("function isCodexTarget"), false);
  assert.equal(appTsx.includes("function targetDisplayName"), false);
  assert.equal(appTsx.includes("function profilesForTarget"), false);
  assert.equal(appTsx.includes("function applyRestartMessage"), false);
});

test("App delegates shared UI primitives to components", () => {
  const appTsx = readSource("./App.tsx");
  const primitiveUrl = new URL("./components/AppUiPrimitives.tsx", import.meta.url);

  assert.equal(existsSync(primitiveUrl), true);
  const primitiveSource = readSource("./components/AppUiPrimitives.tsx");
  assert.equal(primitiveSource.includes("function SortableProfileCard"), true);
  assert.equal(primitiveSource.includes("function TargetLogo"), true);
  assert.equal(appTsx.includes("function VendorLogo"), false);
  assert.equal(appTsx.includes("function SortableProfileCard"), false);
  assert.equal(appTsx.includes("function TargetLogo"), false);
  assert.equal(appTsx.includes("function ProfileVendorLogo"), false);
});

test("App delegates preset selection helpers to a module", () => {
  const appTsx = readSource("./App.tsx");
  const helperUrl = new URL("./profilePresetUtils.ts", import.meta.url);

  assert.equal(existsSync(helperUrl), true);
  const helperSource = readSource("./profilePresetUtils.ts");
  assert.equal(helperSource.includes("function buildPresetFamilies"), true);
  assert.equal(helperSource.includes("function codexPresetDisabledReason"), true);
  assert.equal(appTsx.includes("function presetFamilyKey"), false);
  assert.equal(appTsx.includes("function buildPresetFamilies"), false);
  assert.equal(appTsx.includes("function codexPresetDisabledReason"), false);
  assert.equal(appTsx.includes("function presetForProfile"), false);
});

test("App delegates config JSON import parsing to a module", () => {
  const appTsx = readSource("./App.tsx");
  const helperUrl = new URL("./configJsonImport.ts", import.meta.url);

  assert.equal(existsSync(helperUrl), true);
  const helperSource = readSource("./configJsonImport.ts");
  assert.equal(helperSource.includes("function formFromConfigJson"), true);
  assert.equal(helperSource.includes("function extractJsonText"), true);
  assert.equal(appTsx.includes("function formFromConfigJson"), false);
  assert.equal(appTsx.includes("function extractJsonText"), false);
});

test("Codex connection UI no longer keeps stale collapsed state", () => {
  const appTsx = readSource("./App.tsx");
  const appUiStore = readSource("./store/useAppUiStore.ts");

  assert.equal(appTsx.includes("codexConnectionOpen"), false);
  assert.equal(appUiStore.includes("codexConnectionOpen"), false);
  assert.equal(appUiStore.includes("setCodexConnectionOpen"), false);
});

test("App delegates gateway config option metadata to a module", () => {
  const appTsx = readSource("./App.tsx");
  const helperUrl = new URL("./gatewayConfigOptions.ts", import.meta.url);

  assert.equal(existsSync(helperUrl), true);
  const helperSource = readSource("./gatewayConfigOptions.ts");
  assert.equal(helperSource.includes("export const defaultGatewayConfigOptions"), true);
  assert.equal(helperSource.includes("export const gatewayConfigOptionItems"), true);
  assert.equal(helperSource.includes("function getConfigOptionSupport"), true);
  assert.equal(helperSource.includes("function configOptionItemsForTarget"), true);
  assert.equal(appTsx.includes("const defaultGatewayConfigOptions"), false);
  assert.equal(appTsx.includes("const gatewayConfigOptionItems"), false);
  assert.equal(appTsx.includes("function getConfigOptionSupport"), false);
  assert.equal(appTsx.includes("function configOptionItemsForTarget"), false);
});

test("App delegates profile form assembly to a module", () => {
  const appTsx = readSource("./App.tsx");
  const helperUrl = new URL("./profileFormUtils.ts", import.meta.url);

  assert.equal(existsSync(helperUrl), true);
  const helperSource = readSource("./profileFormUtils.ts");
  assert.equal(helperSource.includes("function createEmptyAddForm"), true);
  assert.equal(helperSource.includes("function formFromProfile"), true);
  assert.equal(helperSource.includes("function normalizeGatewayProfileForApply"), true);
  assert.equal(appTsx.includes("function createEmptyAddForm"), false);
  assert.equal(appTsx.includes("function formFromProfile"), false);
  assert.equal(appTsx.includes("function normalizeGatewayProfileForApply"), false);
});

test("App delegates profile display helpers to a module", () => {
  const appTsx = readSource("./App.tsx");
  const helperUrl = new URL("./profileDisplayUtils.ts", import.meta.url);

  assert.equal(existsSync(helperUrl), true);
  const helperSource = readSource("./profileDisplayUtils.ts");
  assert.equal(helperSource.includes("const apiFormatLabels"), true);
  assert.equal(helperSource.includes("function profileConfigMeta"), true);
  assert.equal(helperSource.includes("function gatewayRequirementIconClass"), true);
  assert.equal(appTsx.includes("function profileConfigMeta"), false);
  assert.equal(appTsx.includes("function formatCheckTime"), false);
  assert.equal(appTsx.includes("const apiFormatLabels"), false);
});

test("App delegates env check session helpers to a module", () => {
  const appTsx = readSource("./App.tsx");
  const helperUrl = new URL("./envCheckSessionUtils.ts", import.meta.url);

  assert.equal(existsSync(helperUrl), true);
  const helperSource = readSource("./envCheckSessionUtils.ts");
  assert.equal(helperSource.includes("function readEnvCheckSessionSnapshot"), true);
  assert.equal(helperSource.includes("function writeEnvCheckSessionSnapshot"), true);
  assert.equal(helperSource.includes("function envConfigStatusLabel"), true);
  assert.equal(appTsx.includes("function readEnvCheckSessionSnapshot"), false);
  assert.equal(appTsx.includes("function writeEnvCheckSessionSnapshot"), false);
  assert.equal(appTsx.includes("function envConfigStatusLabel"), false);
});

test("App delegates app shell chrome behavior to a feature hook", () => {
  const appTsx = readSource("./App.tsx");
  const hookUrl = new URL("./features/app-shell/useAppShellChrome.ts", import.meta.url);

  assert.equal(existsSync(hookUrl), true);
  const hookSource = readSource("./features/app-shell/useAppShellChrome.ts");
  assert.equal(hookSource.includes("function handleSidebarResizePointerDown"), false);
  assert.equal(hookSource.includes("function toggleSidebarCollapsed"), false);
  assert.equal(hookSource.includes("function runAppUpdateCheck"), true);
  assert.equal(hookSource.includes("function startWindowDrag"), true);
  assert.equal(appTsx.includes("function handleSidebarResizePointerDown"), false);
  assert.equal(appTsx.includes("function toggleSidebarCollapsed"), false);
  assert.equal(appTsx.includes("function runAppUpdateCheck"), false);
  assert.equal(appTsx.includes("function startWindowDrag"), false);
});

test("App delegates sidebar chrome markup to an app shell component", () => {
  const appTsx = readSource("./App.tsx");
  const sidebarUrl = new URL("./features/app-shell/AppSidebar.tsx", import.meta.url);

  assert.equal(existsSync(sidebarUrl), true);
  const sidebarSource = readSource("./features/app-shell/AppSidebar.tsx");
  assert.equal(sidebarSource.includes("function AppSidebar"), true);
  assert.equal(sidebarSource.includes("ccr-sidebar-resize-handle"), false);
  assert.equal(sidebarSource.includes("ccr-settings-popover"), true);
  assert.equal(appTsx.includes("<aside className=\"ccr-sidebar\">"), false);
  assert.equal(appTsx.includes("ccr-settings-popover-layer"), false);
});

test("App delegates Claude Desktop effective config markup to config-options", () => {
  const appTsx = readSource("./App.tsx");
  const panelUrl = new URL("./features/config-options/ClaudeDesktopEffectiveConfigPanel.tsx", import.meta.url);

  assert.equal(existsSync(panelUrl), true);
  const panelSource = readSource("./features/config-options/ClaudeDesktopEffectiveConfigPanel.tsx");
  assert.equal(panelSource.includes("function ClaudeDesktopEffectiveConfigPanel"), true);
  assert.equal(panelSource.includes("Desktop 实际生效配置"), true);
  assert.equal(panelSource.includes("inferenceGatewayBaseUrl"), true);
  assert.equal(appTsx.includes("function renderClaudeDesktopEffectiveConfig"), false);
  assert.equal(appTsx.includes("Claude Desktop 只读取网关、认证和模型列表等配置。"), false);
});

test("App delegates env check card assembly to env-check feature", () => {
  const appTsx = readSource("./App.tsx");
  const cardsUrl = new URL("./features/env-check/envCheckCards.ts", import.meta.url);

  assert.equal(existsSync(cardsUrl), true);
  const cardsSource = readSource("./features/env-check/envCheckCards.ts");
  assert.equal(cardsSource.includes("function buildEnvCheckCards"), true);
  assert.equal(cardsSource.includes("Claude Code"), true);
  assert.equal(cardsSource.includes("OpenClaw"), true);
  assert.equal(appTsx.includes("const envCheckCards: Array<{"), false);
  assert.equal(appTsx.includes("请安装 OpenClaw；推荐使用官方安装脚本或 npm i -g openclaw"), false);
});

test("private core delegates MCP and skills commands to modules", privateCoreTestOptions, () => {
  const privateCore = readSource("../.private/agent-switch-private-core/src-tauri-core/src/lib.rs");
  const mcpSource = readSource("../.private/agent-switch-private-core/src-tauri-core/src/mcp.rs");
  const skillsSource = readSource("../.private/agent-switch-private-core/src-tauri-core/src/skills.rs");

  assert.equal(privateCore.includes("mod mcp;"), true);
  assert.equal(privateCore.includes("mod skills;"), true);
  assert.equal(privateCore.includes("mcp::list_mcp_servers"), true);
  assert.equal(privateCore.includes("skills::list_skills"), true);
  assert.equal(mcpSource.includes("pub fn save_mcp_server"), true);
  assert.equal(skillsSource.includes("pub fn get_skill_content"), true);
  assert.equal(privateCore.includes("fn read_mcp_servers()"), false);
  assert.equal(privateCore.includes("fn read_skills()"), false);
});

test("private core keeps proxy token parsing in the metrics module", privateCoreTestOptions, () => {
  const proxySource = readSource("../.private/agent-switch-private-core/src-tauri-core/src/codex_proxy.rs");
  const metricsSource = readSource("../.private/agent-switch-private-core/src-tauri-core/src/codex_proxy/codex_proxy_metrics.rs");

  assert.equal(proxySource.includes("mod codex_proxy_metrics;"), true);
  assert.equal(metricsSource.includes("pub(super) fn proxy_usage_numbers"), true);
  assert.equal(metricsSource.includes("pub(super) fn proxy_cache_tokens"), true);
  assert.equal(metricsSource.includes("pub(super) fn proxy_cache_creation_tokens"), true);
  assert.equal(metricsSource.includes("pub(super) struct StreamingUsageAccumulator"), true);
  assert.equal(proxySource.includes("fn proxy_usage_numbers(usage: &Value)"), false);
  assert.equal(proxySource.includes("fn proxy_cache_tokens(usage: &Value)"), false);
});

test("private core does not inject Codex Desktop runtime", privateCoreTestOptions, () => {
  const privateCore = readSource("../.private/agent-switch-private-core/src-tauri-core/src/lib.rs");

  assert.equal(privateCore.includes("async fn launch_codex_plugin_unlocker"), false);
  assert.equal(privateCore.includes("codex_plugin_unlocker_script"), false);
  assert.equal(privateCore.includes("__switchppCodexPluginUnlockerInstalled"), false);
  assert.equal(privateCore.includes("async fn load_codex_usage_quota"), false);
  assert.equal(privateCore.includes("fn open_settings_window"), false);
  assert.equal(privateCore.includes("Page.addScriptToEvaluateOnNewDocument"), false);
  assert.equal(privateCore.includes("Runtime.evaluate"), false);
  assert.equal(privateCore.includes("--remote-debugging-port="), false);
  assert.equal(privateCore.includes("force_quit_codex_desktop_before_enhanced_launch"), false);
  assert.equal(privateCore.includes('args(["/IM", "Codex.exe", "/T", "/F"])'), false);
  assert.equal(privateCore.includes("--user-data-dir="), false);
  assert.equal(privateCore.includes("codex-plugin-unlocker-profiles"), false);
  assert.equal(privateCore.includes("load_codex_usage_quota"), false);
  assert.equal(privateCore.includes("https://chatgpt.com/backend-api/wham/usage"), false);
  assert.equal(privateCore.includes("auth.openai.com/oauth/token"), false);
  assert.equal(privateCore.includes("asar extract"), false);
  assert.equal(privateCore.includes("app.asar.unpacked"), false);
  assert.equal(privateCore.includes("Contents/Resources/app.asar"), false);
});

test("private core migrates legacy app state before startup import", privateCoreTestOptions, () => {
  const privateCore = readSource("../.private/agent-switch-private-core/src-tauri-core/src/lib.rs");
  const loadAppStateStart = privateCore.indexOf("fn load_app_state()");
  const autostartProxyStart = privateCore.indexOf("fn autostart_active_proxies()");
  const loadAppStateSource = privateCore.slice(loadAppStateStart, autostartProxyStart);

  assert.equal(loadAppStateStart >= 0, true);
  assert.equal(loadAppStateSource.includes("migrate_legacy_app_state(&state_path)?;"), true);
  assert.equal(
    loadAppStateSource.indexOf("migrate_legacy_app_state(&state_path)?;") <
      loadAppStateSource.indexOf("let mut state = if state_path.exists()"),
    true,
  );
});

test("Codex profile application does not patch the Codex app bundle", privateCoreTestOptions, () => {
  const privateCore = readSource("../.private/agent-switch-private-core/src-tauri-core/src/lib.rs");
  const applyCodexStart = privateCore.indexOf("fn apply_codex_profile_direct");
  const writeCatalogStart = privateCore.indexOf("fn write_codex_model_catalog");
  const applyCodexSource = privateCore.slice(applyCodexStart, writeCatalogStart);

  assert.equal(applyCodexStart >= 0, true);
  assert.equal(writeCatalogStart > applyCodexStart, true);
  assert.equal(applyCodexSource.includes("ensure_codex_desktop_model_picker_allows_custom_catalog"), false);
});

test("Codex gateway toggle uses route-aware profile application", privateCoreTestOptions, () => {
  const privateCore = readSource("../.private/agent-switch-private-core/src-tauri-core/src/lib.rs");
  const toggleStart = privateCore.indexOf("fn stop_codex_proxy_and_switch_to_direct");
  const toggleEnd = privateCore.indexOf("fn applied_codex_profile_mut");
  const toggleSource = privateCore.slice(toggleStart, toggleEnd);

  assert.equal(toggleStart >= 0, true);
  assert.equal(toggleEnd > toggleStart, true);
  assert.equal(toggleSource.includes("apply_codex_profile(&direct_profile)?;"), true);
  assert.equal(toggleSource.includes("apply_codex_profile(&proxy_profile)?;"), true);
  assert.equal(toggleSource.includes("apply_codex_profile_direct(&direct_profile)?;"), false);
  assert.equal(toggleSource.includes("apply_codex_profile_direct(&proxy_profile)?;"), false);
});

test("Codex fallback records chat completions with the resolved upstream model", privateCoreTestOptions, () => {
  const proxySource = readSource("../.private/agent-switch-private-core/src-tauri-core/src/codex_proxy.rs");
  const fallbackStart = proxySource.indexOf("async fn fallback_handler");
  const fallbackEnd = proxySource.indexOf("fn fallback_upstream_url");
  const fallbackSource = proxySource.slice(fallbackStart, fallbackEnd);

  assert.equal(fallbackStart >= 0, true);
  assert.equal(fallbackEnd > fallbackStart, true);
  assert.equal(proxySource.includes("fn fallback_record_model"), true);
  assert.equal(fallbackSource.includes("fallback_record_model(&path, body_bytes.as_ref(), &config)"), true);
  assert.equal(fallbackSource.includes("config.model,\n                StatusCode::BAD_GATEWAY"), false);
  assert.equal(fallbackSource.includes("config.model,\n        input_detail"), false);
});

test("private core keeps legacy app update mock environment variables", privateCoreTestOptions, () => {
  const privateCore = readSource("../.private/agent-switch-private-core/src-tauri-core/src/lib.rs");

  assert.equal(privateCore.includes('std::env::var("AGENT_SWITCH_APP_UPDATE_MOCK")'), true);
  assert.equal(privateCore.includes('std::env::var("CODE3P_APP_UPDATE_MOCK")'), true);
  assert.equal(
    privateCore.indexOf('std::env::var("AGENT_SWITCH_APP_UPDATE_MOCK")') <
      privateCore.indexOf('std::env::var("CODE3P_APP_UPDATE_MOCK")'),
    true,
  );
});

test("App subscribes to gateway store through a shallow selector", () => {
  const appTsx = readSource("./App.tsx");

  assert.equal(appTsx.includes('from "zustand/react/shallow"'), true);
  assert.equal(appTsx.includes("useGatewayStore(useShallow"), true);
  assert.equal(appTsx.includes("} = useGatewayStore();"), false);
});

test("environment check UI state lives in a zustand store", () => {
  const appTsx = readSource("./App.tsx");
  const storeUrl = new URL("./store/useEnvCheckStore.ts", import.meta.url);

  assert.equal(existsSync(storeUrl), true);
  assert.equal(appTsx.includes("useEnvCheckStore(useShallow"), true);
  assert.equal(appTsx.includes("useState<EnvCheckResult | null>"), false);
  assert.equal(appTsx.includes("useState<EnvOperationProgress | null>"), false);
  assert.equal(appTsx.includes("useState(DEFAULT_ENV_CARD_KEY)"), false);
});

test("environment check helpers live outside App", () => {
  const appTsx = readSource("./App.tsx");
  const helperUrl = new URL("./envCheckUtils.ts", import.meta.url);

  assert.equal(existsSync(helperUrl), true);
  const helperSource = readSource("./envCheckUtils.ts");
  assert.equal(helperSource.includes("function markDeletedEnvConfig"), true);
  assert.equal(helperSource.includes("function isEnvVersionNewer"), true);
  assert.equal(appTsx.includes("function browserEnvPlatform"), false);
  assert.equal(appTsx.includes("function markDeletedEnvConfig"), false);
  assert.equal(appTsx.includes("function isEnvVersionNewer"), false);
});

test("shell UI state lives in a zustand store", () => {
  const appTsx = readSource("./App.tsx");
  const shellStore = readSource("./store/useShellUiStore.ts");
  const storeUrl = new URL("./store/useShellUiStore.ts", import.meta.url);

  assert.equal(existsSync(storeUrl), true);
  assert.equal(appTsx.includes("useShellUiStore(useShallow"), true);
  assert.equal(shellStore.includes("showStatus"), true);
  assert.equal(appTsx.includes("useState<AppLanguage>"), false);
  assert.equal(appTsx.includes('const [status, setStatus] = useState("");'), false);
  assert.equal(appTsx.includes('const [statusType, setStatusType] = useState<"success" | "error" | "">("");'), false);
  assert.equal(appTsx.includes("const [settingsPopoverOpen, setSettingsPopoverOpen] = useState(false);"), false);
  assert.equal(appTsx.includes("const [sidebarCollapsed, setSidebarCollapsed] = useState"), false);
  assert.equal(appTsx.includes("useState({ left: 24, bottom: 56 })"), false);
});

test("profile navigation UI state lives in a zustand store", () => {
  const appTsx = readSource("./App.tsx");
  const storeUrl = new URL("./store/useAppUiStore.ts", import.meta.url);

  assert.equal(existsSync(storeUrl), true);
  assert.equal(appTsx.includes("useAppUiStore(useShallow"), true);
  assert.equal(appTsx.includes('useState<TargetKey>("claude_cli")'), false);
  assert.equal(appTsx.includes('useState<"list" | "add" | "env" | "overview" | "switch" | "mcp" | "gateway">("list")'), false);
  assert.equal(appTsx.includes("useState<string | null>(null)"), false);
  assert.equal(appTsx.includes("const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false);"), false);
  assert.equal(appTsx.includes("const [codexConfigOpen, setCodexConfigOpen] = useState(true);"), false);
});

test("package test script auto-discovers TypeScript tests", () => {
  const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  const runnerUrl = new URL("../scripts/run-tests.mjs", import.meta.url);

  assert.equal(packageJson.scripts.test, "node scripts/run-tests.mjs");
  assert.equal(existsSync(runnerUrl), true);
  const runnerSource = readFileSync(runnerUrl, "utf8");
  assert.equal(runnerSource.includes(".test.ts"), true);
  assert.equal(runnerSource.includes("--experimental-strip-types"), true);
});

console.log("Architecture tests passed.\n");
