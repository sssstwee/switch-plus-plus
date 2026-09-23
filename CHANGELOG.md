# Changelog

## v1.0.18 - 2026-09-23

Switch++ 更新至 ChatGPT/Codex 当前 GPT-6 模型系列，默认使用 GPT-6 Astra，并支持 GPT-6 Sol 与 GPT-6 Luna。

### 功能亮点 / Highlights

- OpenAI 套餐与 API 配置仅保留官方当前 GPT-6 Astra、GPT-6 Sol、GPT-6 Luna 模型；旧 GPT-5.x 模型不再显示或作为回退选项。 / OpenAI plan and API configurations now expose only the current official GPT-6 Astra, GPT-6 Sol, and GPT-6 Luna models; older GPT-5.x models are no longer offered or used as fallbacks.
- 更新 Codex 模型目录与 Responses 能力识别，并升级内置 CLIProxyAPI 至 `v7.3.15`，支持最新 GPT-6 模型目录。 / Updated the Codex model catalog and Responses capability detection, and upgraded bundled CLIProxyAPI to `v7.3.15` for the latest GPT-6 model catalog.

### 界面预览 / Screenshots

**Codex 配置 / Codex Configuration**

![Codex 配置列表](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/main/docs/assets/screenshots/switchpp-codex-profiles.png)

### macOS 首次启动说明 / macOS First-Launch Notice

Switch++ 尚未通过 Apple 公证（notarization），macOS 首次启动时可能会阻止。安装到 `/Applications` 后请运行：

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```

## v1.0.17 - 2026-09-05

Switch++ 现在支持 GPT-6 Astra，并解决官方配置编辑页仍默认选中旧模型、GPT-6 推理选项在保存时被清理的问题。

### 功能亮点 / Highlights

- OpenAI 官方套餐与 API 预设新增 `gpt-6-astra` 并设为默认模型，同时保留 GPT-5.6 等现有候选。 / Added `gpt-6-astra` as the default model in the official OpenAI and API presets while retaining existing GPT-5.6 and other model choices.
- 新增、编辑或同步 Codex 官方配置时，默认选中最新模型，并同步默认模型输入框与生成的配置；进入表单后仍可手动切换。 / Official Codex profile creation, editing, and local sync now select the latest model by default and keep the model field and generated configuration aligned; manual selection remains available.
- 修复 GPT-6 原生 Responses 配置的推理强度、推理摘要、输出详略和联网选项被误判为不支持的问题，确保选项正确保存。 / Fixed GPT-6 native Responses profiles incorrectly rejecting reasoning effort, reasoning summaries, verbosity, and web search settings so selected options are preserved.
- 内置 CLIProxyAPI 升级至 `v7.2.151`，支持 Astra；订阅代理自动选模优先选择可用的 Astra，并保留用户明确指定的模型。 / Updated the bundled CLIProxyAPI to `v7.2.151` with Astra support; automatic subscription model selection prefers an available Astra model while honoring explicit choices.

### 界面预览 / Screenshots

**Codex 配置 / Codex Configuration**

![Codex 配置列表](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/main/docs/assets/screenshots/switchpp-codex-profiles.png)

### macOS 首次启动说明 / macOS First-Launch Notice

Switch++ 尚未通过 Apple 公证（notarization），macOS 首次启动时可能会阻止。安装到 `/Applications` 后请运行：

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```

## v1.0.16 - 2026-08-13

Switch++ 兼容性更新。本次解决 Claude Desktop 使用 DeepSeek V4 时无法处理图片的问题，并补齐三方 Cowork 会话的网络访问配置。

### 功能亮点 / Highlights

- Claude Desktop 的 DeepSeek 本地网关新增可选视觉代理：先由已保存的 Anthropic 或 OpenAI Chat 视觉模型生成图片描述，再将文本交给 DeepSeek，保留 DeepSeek 文本推理链路。 / Added an optional vision proxy for DeepSeek in the Claude Desktop local gateway: a saved Anthropic or OpenAI Chat vision model describes images before the text is sent to DeepSeek, preserving the existing DeepSeek reasoning path.
- 支持处理消息内图片、图片读取工具结果和历史图片上下文，并同步改写 token 统计请求，避免 DeepSeek 收到不支持的图片内容块。 / Added support for message images, image-reading tool results, and historical image context, while rewriting token-count requests so unsupported image blocks never reach DeepSeek.
- 三方 Claude Desktop 配置现在写入 `coworkEgressAllowedHosts: ["*"]`，避免 Cowork 会话因缺少网络放行而无法访问所需服务；切回官方 1P 模式时会自动移除。 / Third-party Claude Desktop profiles now write `coworkEgressAllowedHosts: ["*"]` so Cowork sessions can reach required services; the setting is removed automatically when switching back to official 1P mode.
- 增强 Claude Desktop 配置导入与视觉代理校验，拒绝空 API Key、DeepSeek 自引用和不受支持的协议，并补充前后端回归测试。 / Improved Claude Desktop config import and vision-proxy validation by rejecting empty API keys, DeepSeek self-reference, and unsupported protocols, with frontend and backend regression coverage.

### 界面预览 / Screenshots

**Claude Desktop 配置 / Claude Desktop Configuration**

![Claude Desktop 配置列表](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/main/docs/assets/screenshots/switchpp-codex-profiles.png)

### macOS 首次启动说明 / macOS First-Launch Notice

Switch++ 尚未通过 Apple 公证（notarization），macOS 首次启动时可能会阻止。安装到 `/Applications` 后请运行：

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```

## v1.0.15 - 2026-08-03

Switch++ 功能更新。本次新增本地订阅代理与 Grok Build 配置支持，并同步 DeepSeek V4、Codex 和主流厂商的最新接入方式。

### 功能亮点 / Highlights

- 新增本地 CLIProxyAPI 订阅代理管理，可在应用内启动、停止、选择上游模型，并自动同步到 Claude Code、Claude Desktop 与 Grok Build；sidecar 在构建时按目标架构下载并校验，不进入源码仓库。 / Added local CLIProxyAPI subscription proxy management with in-app lifecycle and model selection, automatic Claude Code, Claude Desktop, and Grok Build profile sync, plus architecture-aware verified sidecar preparation during builds.
- 新增 Grok Build 目标及 `~/.grok/config.toml` 原生写入，支持 xAI、OpenAI-compatible 与 Anthropic-compatible 厂商预设，并保留用户已有配置。 / Added Grok Build as a first-class target with native `~/.grok/config.toml` merging for xAI, OpenAI-compatible, and Anthropic-compatible providers while preserving existing user settings.
- DeepSeek V4-Flash 改为 Codex 原生 Responses API 直连，写入官方 API 登录方式、1M 上下文模型目录和 high 推理档位；界面同时明确 V4-Pro 当前尚未开放 Responses。 / Switched DeepSeek V4-Flash to native Codex Responses API routing with official API authentication fields, 1M model metadata, and high reasoning defaults, while clearly marking V4-Pro Responses as not yet available.
- 更新 Claude、Codex、MiniMax、GLM、Kimi、百炼、硅基流动、ModelScope、OpenAI 与 xAI 的模型预设、协议路由和配置预览，并补充目标级回归测试。 / Refreshed model presets, protocol routing, and configuration previews for Claude, Codex, MiniMax, GLM, Kimi, Bailian, SiliconFlow, ModelScope, OpenAI, and xAI, with target-level regression coverage.
- 本地兼容网关新增订阅代理隔离路由、Anthropic token count 转发和更可靠的 SQLite 调用记录清理；历史记录保留周期统一为 7 天。 / Added isolated subscription routing, Anthropic token-count forwarding, and more reliable SQLite call-history cleanup to the local gateway, with a unified seven-day retention window.

### 界面预览 / Screenshots

**Codex 配置 / Codex Configuration**

![Codex 配置列表](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/main/docs/assets/screenshots/switchpp-codex-profiles.png)

### macOS 首次启动说明 / macOS First-Launch Notice

Switch++ 尚未通过 Apple 公证（notarization），macOS 首次启动时可能会阻止。安装到 `/Applications` 后请运行：

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```

## v1.0.14 - 2026-07-14

Switch++ 小版本更新。本次重点修复上游应用、模型和配置项演进后产生的兼容偏差，让 Claude、Codex 与当前 ChatGPT 桌面端配置保持一致。

### 功能亮点 / Highlights

- 修复 Claude 官方套餐配置可能残留三方网关环境变量的问题；Claude Code 与 Claude Desktop 恢复官方连接时会清理 Switch++ 路由覆盖，同时继续区分 Anthropic API 直连和本地兼容网关。 / Fixed stale third-party gateway variables when restoring official Claude access, while keeping direct Anthropic API and local gateway modes separate.
- 更新 Codex 模型与配置支持：同步新的 GPT-5.6 模型槽位，新增 Ollama / LM Studio `oss_provider` 选择，并移除已过时的 Undo 配置项。 / Updated Codex model and configuration support with new GPT-5.6 slots, Ollama / LM Studio `oss_provider` selection, and removal of the obsolete Undo option.
- 更新厂商预设、模型发现和配置预览，让保存后的真实配置与界面候选保持一致，并补充对应回归测试。 / Updated vendor presets, model discovery, and configuration previews so saved output matches UI candidates, with regression coverage added.
- 环境检查现在识别当前 `ChatGPT.app` 中的 Codex 桌面能力，同时保留旧版 `Codex.app` 检测，并避免把 ChatGPT 误列为 Codex 卸载目标。 / Environment checks now recognize Codex desktop capabilities in `ChatGPT.app`, retain legacy `Codex.app` detection, and avoid offering ChatGPT as a Codex uninstall target.
- 统一前端包、Rust crate 与开发二进制名称为 `switch-plus-plus`，避免开发启动脚本查找旧二进制名。 / Unified the frontend package, Rust crate, and development binary name as `switch-plus-plus` to prevent the dev runner from looking for the obsolete binary name.
- 精简发布流水线，仅构建 Apple Silicon（M 系列）macOS 的 `.dmg` 与签名更新包，移除 Intel macOS、Windows 和 Linux 打包任务。 / Streamlined the release pipeline to build only Apple Silicon macOS `.dmg` and signed updater artifacts, removing Intel macOS, Windows, and Linux packaging jobs.

### 界面预览 / Screenshots

**Codex 配置 / Codex Configuration**

![Codex 配置列表](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/main/docs/assets/screenshots/switchpp-codex-profiles.png)

### macOS 首次启动说明 / macOS First-Launch Notice

Switch++ 尚未通过 Apple 公证（notarization），macOS 首次启动时可能会阻止。安装到 `/Applications` 后请运行：

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```

## v1.0.13 - 2026-06-15

Switch++ 小版本更新。本次修复自动更新安装并重启后，首次启动侧边栏菜单可能短时间无响应的问题。

### 功能亮点 / Highlights

- 自动更新完成后会稍作等待再 relaunch，降低 macOS 刚替换应用包后立即拉起时的窗口状态恢复问题。 / Auto-update now waits briefly before relaunching, reducing macOS window-state issues immediately after replacing the app bundle.
- 授权状态读取会优先返回本机已有试用/授权判断，把联网刷新交给后台流程，避免启动时网络请求阻塞菜单切换。 / License status loading now returns the existing local trial/license decision first and leaves network refresh to the background flow, avoiding startup navigation stalls.
- 授权读取失败仍保持 fail-closed；已过期或无有效试用的设备不会因为这个启动优化获得访问权限。 / License read failures remain fail-closed; expired or unverified devices do not gain access from this startup optimization.

### 界面预览 / Screenshots

**自动更新 / Auto Update**

![Codex 配置列表](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/main/docs/assets/screenshots/switchpp-codex-profiles.png)

### macOS 首次启动说明 / macOS First-Launch Notice

Switch++ 尚未通过 Apple 公证（notarization），macOS 首次启动时可能会阻止。安装到 `/Applications` 后请运行：

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```

## v1.0.12 - 2026-06-15

Switch++ 小版本更新。本次完成自动更新发布链路收口，修复多平台 release job 并发创建同一个 GitHub Release 时的竞争问题。

### 功能亮点 / Highlights

- 新增 `prepare-release` job，先创建或更新 GitHub Release，并把 `release_id` 传给所有平台构建。 / Added a `prepare-release` job that creates or updates the GitHub Release first and passes its `release_id` to every platform build.
- 所有 `tauri-action` 矩阵 job 现在上传到同一个预创建 release，避免 `already_exists` 导致某个 macOS 架构发布失败。 / All `tauri-action` matrix jobs now upload to the same pre-created release, avoiding `already_exists` failures for one macOS architecture.
- 保留从签名文件生成 updater manifest 的逻辑，最终清单仍合并 macOS、Windows、Linux 平台键后覆盖上传。 / Kept signature-file-based updater manifest generation, with the final manifest still merging macOS, Windows, and Linux platform keys before upload.
- 清理失败的 `v1.0.10` / `v1.0.11` 半成品 release/tag，避免 `releases/latest` 指向不可安装清单。 / Cleaned up the failed `v1.0.10` / `v1.0.11` partial releases and tags so `releases/latest` does not point to a non-installable manifest.

### 界面预览 / Screenshots

**自动更新 / Auto Update**

![Codex 配置列表](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/main/docs/assets/screenshots/switchpp-codex-profiles.png)

### macOS 首次启动说明 / macOS First-Launch Notice

Switch++ 尚未通过 Apple 公证（notarization），macOS 首次启动时可能会阻止。安装到 `/Applications` 后请运行：

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```

## v1.0.11 - 2026-06-15

Switch++ 小版本更新。本次继续收口自动更新发布链路，修复 `v1.0.10` 首次发布时暴露的 workflow manifest 收集问题。

### 功能亮点 / Highlights

- 修复 release cache key 因 `app,dmg` 含逗号导致 macOS job post-cache 报错的问题。 / Fixed the release cache key issue where `app,dmg` introduced a comma that broke the macOS job post-cache step.
- updater manifest 不再依赖 tauri-action 临时生成的 `latest.json` 路径；每个平台从自己的签名文件生成 manifest，再由最终 job 合并上传。 / Updater manifests no longer depend on tauri-action's temporary `latest.json` path; each platform generates its manifest from its own signature file before the final merge job uploads the combined manifest.
- 保留 macOS `app,dmg` 构建，确保自动更新使用 `.app.tar.gz`，手动下载安装仍保留 DMG。 / Kept macOS `app,dmg` builds so auto-update uses `.app.tar.gz` while manual downloads still get DMG installers.
- 最终合并后的清单继续校验 macOS、Windows、Linux 平台键，避免自动更新按钮再次指向不可安装状态。 / The final merged manifest still validates macOS, Windows, and Linux platform keys to prevent the update button from pointing to a non-installable state again.

### 界面预览 / Screenshots

**自动更新 / Auto Update**

![Codex 配置列表](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/main/docs/assets/screenshots/switchpp-codex-profiles.png)

### macOS 首次启动说明 / macOS First-Launch Notice

Switch++ 尚未通过 Apple 公证（notarization），macOS 首次启动时可能会阻止。安装到 `/Applications` 后请运行：

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```

## v1.0.10 - 2026-06-15

Switch++ 小版本更新。本次聚焦自动更新清单修复，解决 macOS 端看到更新按钮后点击却提示“自动更新清单暂不可用”的问题。

### 功能亮点 / Highlights

- 修复发布流水线只构建 `dmg` 导致 macOS 没有 updater 可安装 artifact 的问题；macOS release 现在同时构建 `app` 与 `dmg`。 / Fixed the release pipeline issue where macOS only built `dmg` bundles and produced no updater-installable artifact; macOS releases now build both `app` and `dmg`.
- 修复多平台矩阵 job 互相覆盖 `latest.json` 的问题；所有平台会先上传各自 updater manifest，再由最终 job 合并成一个包含 macOS、Windows、Linux 的清单。 / Fixed matrix jobs overwriting `latest.json`; each platform now uploads its own updater manifest and a final job merges macOS, Windows, and Linux entries.
- 自动更新清单发布前会校验 `darwin-aarch64`、`darwin-x86_64`、`linux-x86_64`、`windows-x86_64` 平台键，避免再次发布缺平台的清单。 / The updater manifest now validates `darwin-aarch64`, `darwin-x86_64`, `linux-x86_64`, and `windows-x86_64` before upload to prevent incomplete manifests.
- 补充发布架构测试，锁定 macOS updater bundle 与最终 manifest merge 步骤。 / Added release architecture coverage for macOS updater bundles and final manifest merging.

### 界面预览 / Screenshots

**自动更新 / Auto Update**

![Codex 配置列表](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/main/docs/assets/screenshots/switchpp-codex-profiles.png)

### macOS 首次启动说明 / macOS First-Launch Notice

Switch++ 尚未通过 Apple 公证（notarization），macOS 首次启动时可能会阻止。安装到 `/Applications` 后请运行：

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```

## v1.0.9 - 2026-06-14

Switch++ 小版本更新。本次聚焦 Claude Desktop 模型菜单修复，解决配置已改为 Fable5 但 `/model` 弹窗仍显示旧 Claude Opus/Sonnet/Haiku 模型的问题。

### 功能亮点 / Highlights

- Claude Desktop 写入的 `inferenceModels` 现在统一使用 `Fable5`，让 `/model` 菜单和 Switch++ 配置保持一致。 / Claude Desktop `inferenceModels` now use `Fable5`, keeping the `/model` picker aligned with Switch++ configuration.
- 已保存的 Claude Desktop profile 会在加载和应用时迁移到 Fable5 可见模型，同时保留 DeepSeek、MiniMax、阿里百炼等供应商真实上游模型映射。 / Existing Claude Desktop profiles migrate to the Fable5 visible model on load/apply while preserving real provider model mappings for DeepSeek, MiniMax, Bailian, and similar upstreams.
- Anthropic/Claude Desktop preset、配置预览、保存路径和私有 core 写入逻辑改为共享同一组模型常量，避免只改 UI 默认值而真实配置仍回退旧模型。 / Anthropic/Claude Desktop presets, previews, save paths, and private-core writes now share one model source, preventing UI defaults from drifting away from real written config.
- 补充 Claude Desktop 预览与私有 core 迁移测试，锁定 Fable5 菜单和 provider 模型映射不互相覆盖。 / Added preview and private-core migration coverage so the Fable5 menu and provider model mappings do not overwrite each other.

### 界面预览 / Screenshots

**Claude Desktop 模型菜单 / Claude Desktop Model Picker**

![Codex 配置列表](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/main/docs/assets/screenshots/switchpp-codex-profiles.png)

### macOS 首次启动说明 / macOS First-Launch Notice

Switch++ 尚未通过 Apple 公证（notarization），macOS 首次启动时可能会阻止。安装到 `/Applications` 后请运行：

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```

## v1.0.8 - 2026-06-14

Switch++ 小版本更新。本次聚焦授权边界和源码开放边界，避免授权状态异常或公开源码本地构建造成错误放行。

### 功能亮点 / Highlights

- 授权状态读取失败时默认锁定付费功能，不再把异常状态当作可用试用状态放行。 / License status failures now lock paid access by default instead of treating an unknown state as an active trial.
- 收紧客户端授权判断：缺少 `access_allowed` 时默认视为未授权，并补充回归测试防止失败放行逻辑回退。 / Hardened client-side access checks so missing `access_allowed` defaults to locked, with regression coverage against fail-open behavior.
- 明确公开仓库是 source-available shell，不是完整官方构建；核心 native 实现、授权校验、配置写入、gateway 和安装诊断能力仍保留在私有 core。 / Clarified that the public repository is a source-available shell rather than the complete official build; the native core, licensing, config writes, gateway, and selected diagnostics remain private.
- 无私有 core 的环境会跳过内部专用测试，便于公开层审阅与贡献，同时官方发布仍在维护者环境运行完整验证。 / Environments without the private core now skip internal-only tests for public review and contribution, while official releases still run full maintainer-side verification.

### 界面预览 / Screenshots

**授权设置 / License Settings**

![Codex 配置列表](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/main/docs/assets/screenshots/switchpp-codex-profiles.png)

### macOS 首次启动说明 / macOS First-Launch Notice

Switch++ 尚未通过 Apple 公证（notarization），macOS 首次启动时可能会阻止。安装到 `/Applications` 后请运行：

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```

## v1.0.7 - 2026-06-14

Switch++ 小版本更新。本次聚焦官方版授权体验、试用期锁定和更新安全性，让免费试用与激活后的状态更清楚。

### 功能亮点 / Highlights

- 将免费试用期调整为 7 天；试用期内不做功能阉割，试用结束后未激活用户会锁定左侧应用与工具菜单，只保留设置入口用于激活。 / Changed the free trial to 7 days. Trial users keep full functionality during the trial; after expiry, app and tool navigation is locked except Settings for activation.
- 强化授权锁定路径：除了按钮禁用，应用层导航也会检查授权状态，避免通过调试入口绕过菜单锁定。 / Hardened license gating so app-level navigation also checks license access, preventing debug-path bypasses.
- 关闭 Tauri 开发者工具入口，减少通过 WebView 控制台调试绕过 UI 状态的风险。 / Disabled the Tauri WebView devtools entry to reduce console-based UI bypass risk.
- 已激活用户的设置弹窗不再显示“购买授权码”，并新增当前版本号展示。 / Activated users no longer see the purchase-license entry in Settings, and Settings now shows the current app version.

### 界面预览 / Screenshots

**授权设置 / License Settings**

![Codex 配置列表](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/main/docs/assets/screenshots/switchpp-codex-profiles.png)

### macOS 首次启动说明 / macOS First-Launch Notice

Switch++ 尚未通过 Apple 公证（notarization），macOS 首次启动时可能会阻止。安装到 `/Applications` 后请运行：

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```

## v1.0.6 - 2026-06-04

Switch++ 小版本更新。本次聚焦 Codex 官方登录配置安全性，以及 Hermes/OpenCode/OpenClaw/Pi 等客户端的模型字段写入准确性。

### 修复与改进 / Fixes & Improvements

- 修复 Codex 官方登录配置中“关闭 WebSockets”会误导用户的问题：官方 `openai` provider 是 Codex 内置 provider，不支持在不切换 provider 的情况下写入 `supports_websockets = false`，因此该选项现在会置灰，并在说明中展示官方配置依据。
- 移除此前会额外写入 `openai-sse` custom provider 的逻辑，避免切换官方登录 profile 后影响历史记录、登录态或官方 provider 行为。
- 官方 Codex profile 预览和保存时会清理当前路径不支持的运行选项，避免旧状态把不可用配置继续写进 `config.toml`。
- 改进 OpenAI API custom provider 认证预览：当 Base URL 为官方 API 且未填写 API Key 时，会写入 `requires_openai_auth = true`，避免生成空 bearer token。
- 改进 OpenCode、Oh My OpenAgent、OpenClaw、Hermes、Pi 和 Oh My Pi 的模型配置：按各自应用配置字段维护默认模型、可用模型、小模型或标题生成模型，不再把 Claude 模型映射字段误写进这些应用的 provider 模型列表。
- Hermes 配置说明更新为 CLI/Desktop 共享配置，并将 Hermes 入口提前，方便在 Codex/Claude 后快速配置 Hermes Agent。

## v1.0.5 - 2026-06-02

Switch++ 小版本更新。本次新增 Codex 记忆整理知识图谱，并优化记忆加载、重新加载和详情查看。

### 功能亮点 / Highlights

- 新增“记忆整理”：以知识图谱展示 Codex 生成记忆、纠偏层、扩展记忆、项目归属和召回关系。 / Added Memory Organizer: a knowledge graph for Codex generated memories, corrections, extensions, project grouping, and recall relationships.
- 改进记忆加载体验：首次进入不自动读取，点击“立即加载”后从 Codex 中获取；已加载过的会话再次进入直接展示图谱。 / Improved memory loading: first visit waits for explicit loading, while loaded sessions reopen directly to the graph.
- 优化图谱交互：父节点只展开/收起，叶子节点展示详情，详情面板可滚动且不会触发底层 hover 或画布缩放。 / Improved graph interaction: parent nodes expand/collapse only, leaf nodes show details, and detail panels scroll without triggering underlying hover or canvas zoom.
- 明确三方配置与官方账号能力边界：插件、移动端和 connector 仍需回到官方配置中管理和验证。 / Clarified that plugins, mobile access, and connectors should be managed and verified from an official profile.
- 合并本地网关图片输入、官方错误摘要和 Codex profile 去重修复。 / Included local gateway image-input handling, official error summaries, and Codex profile deduplication fixes.

### 界面预览 / Screenshots

**记忆整理 / Memory Organizer**

![记忆整理](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/main/docs/assets/screenshots/switchpp-codex-Memo.png)

### macOS 首次启动说明 / macOS First-Launch Notice

Switch++ 尚未通过 Apple 公证（notarization），macOS 首次启动时可能会阻止。安装到 `/Applications` 后请运行：

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```


## v1.0.3 - 2026-05-31

Switch++ 小版本更新。本次重点修复 Codex Desktop 三方厂商配置里的自定义模型列表：DeepSeek、阿里百炼等配置现在可以由用户维护多个真实上游模型，切换官方配置时也不会再残留三方 provider 信息。

### 功能亮点 / Highlights

- 修复 Codex Desktop 三方配置切换后“自定义”模型列表为空的问题：Switch++ 会写入 `custom` provider、`model_catalog_json` 和本地 `/models` catalog，让 Codex 能读取三方模型候选。 / Fixed empty Codex Desktop Custom model menus for third-party profiles by writing the `custom` provider, `model_catalog_json`, and the local `/models` catalog.
- 支持在三方配置中手动添加多个上游模型，并在模型发现候选中把选中的模型填入当前聚焦输入框。 / Added manual multi-model editing for third-party Codex profiles, with discovered candidates filling the currently focused model field.
- 修复三方模型重复显示、provider 名称冗余显示、以及切回官方 Codex 配置后仍显示三方模型的问题。 / Removed duplicate third-party model entries and provider-name clutter, while keeping official Codex profiles on the default official behavior.
- 修复自定义模型列表拖动排序后被校正回原顺序的问题；保存后 Codex 自定义列表顺序会与 Switch++ 配置文件顺序一致。 / Fixed custom model drag sorting snapping back; saved Codex model order now follows the Switch++ configured order.
- 改进 Codex 本地网关模型映射：三方模型按用户配置顺序映射到 Codex 可识别的模型槽位，不再按旧的 flash/coder 启发式重排。 / Improved local gateway model slot mapping so third-party models keep the user-configured order instead of being reordered by legacy heuristics.
- 保留官方登录态隔离：三方配置只写入专用 `custom` provider 和 provider bearer token，不改写官方 `auth.json`。 / Preserved official-login isolation: third-party profiles write the dedicated `custom` provider and provider bearer token without rewriting official `auth.json`.

### 界面预览 / Screenshots

**Codex 配置列表 / Codex profiles**

![Codex 配置列表](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/main/docs/assets/screenshots/switchpp-codex-profiles.png)

**新增 Codex 配置 / New Codex profile**

![新增 Codex 配置](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/main/docs/assets/screenshots/switchpp-codex-new-profile.png)

**Claude Code 配置列表 / Claude Code profiles**

![Claude Code 配置列表](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/main/docs/assets/screenshots/switchpp-claude-code-profiles.png)

**兼容网关概览 / Gateway overview**

![兼容网关概览](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/main/docs/assets/screenshots/switchpp-gateway-overview.png)

**兼容网关调用记录 / Gateway request history**

![兼容网关调用记录](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/main/docs/assets/screenshots/switchpp-gateway-requests.png)

**本地环境检查 / Environment check**

![本地环境检查](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/main/docs/assets/screenshots/switchpp-environment-check.png)

### macOS 首次启动说明 / macOS First-Launch Notice

Switch++ 尚未通过 Apple 公证（notarization），macOS 首次启动时可能会阻止。安装到 `/Applications` 后请运行：

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```

Switch++ has not passed Apple notarization yet, so macOS may block it on first launch. After installing to `/Applications`, run:

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```

## v1.0.2 - 2026-05-30

Switch++ 小版本更新。本次重点解决 Claude Code 三方模型接入、兼容网关判断、菜单栏图标和本地化文案中的实际问题，让配置写入后更容易判断“是否需要网关、为什么失败、该如何验证”。

### 修复与改进 / Fixes & Improvements

- 修复 Claude Code 使用部分三方 Anthropic-compatible 端点时容易直连失败的问题：Switch++ 会识别需要本地兼容网关的配置，并提示通过本地网关完成模型映射、请求清洗、工具 schema 压缩和兼容转发。
- 改进 Claude Code 兼容网关状态说明，不再只展示“建议/必须开启”，而是拆分说明当前问题、开启收益和仍有限制，帮助判断失败来自厂商端点、协议兼容还是本地配置。
- 修复 Claude Code / Claude Desktop 网关启停语义，支持用户在网关页手动关闭本地兼容网关，并用 switch 开关展示当前启停状态。
- 修复配置应用后的提示文案，去掉“写入磁盘”等偏实现细节的表述，改为描述配置已写入以及需要重启目标应用后生效。
- 修复英文模式下的中英混排问题，包括网关状态、刷新按钮、短状态和动作文案，避免出现 `已Start` 这类半翻译状态。
- 修复菜单栏图标显示为黑块、比例过细或与 Dock 图标混用的问题，改为独立的 switch 模板图标。
- 修复 Windows release 打包脚本对 `PATH="$HOME/.cargo/bin:$PATH"` 的依赖，避免 Windows 构建找不到 Tauri 命令。
- 补齐 CI 对私有核心和 Linux Tauri 依赖的检查，避免本地验证通过但主分支 CI 因缺少私有核心或系统库失败。
- 全新 UI 升级提升视觉体验。

### 界面预览 / Screenshots

**Codex 配置列表 / Codex profiles**

![Codex 配置列表](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/main/docs/assets/screenshots/switchpp-codex-profiles.png)

**新增 Codex 配置 / New Codex profile**

![新增 Codex 配置](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/main/docs/assets/screenshots/switchpp-codex-new-profile.png)

**Claude Code 配置列表 / Claude Code profiles**

![Claude Code 配置列表](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/main/docs/assets/screenshots/switchpp-claude-code-profiles.png)

**兼容网关概览 / Gateway overview**

![兼容网关概览](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/main/docs/assets/screenshots/switchpp-gateway-overview.png)

**兼容网关调用记录 / Gateway request history**

![兼容网关调用记录](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/main/docs/assets/screenshots/switchpp-gateway-requests.png)

**本地环境检查 / Environment check**

![本地环境检查](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/main/docs/assets/screenshots/switchpp-environment-check.png)

### macOS 首次启动说明 / macOS First-Launch Notice

Switch++ 尚未通过 Apple 公证（notarization），macOS 首次启动时可能会阻止。安装到 `/Applications` 后请运行：

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```

Switch++ has not passed Apple notarization yet, so macOS may block it on first launch. After installing to `/Applications`, run:

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```

## v1.0.1 - 2026-05-26

Switch++ 小版本更新。本次重点改进 Claude / Codex 本地兼容网关、后台流量统计、推荐配置项和公开说明，让第三方模型接入 Claude Desktop、Codex Desktop 和 Claude Code 时更容易诊断、更稳定。

### 更新亮点

- 改进本地兼容网关统计，区分缓存命中、缓存创建和上游未上报缓存字段，避免把没有 cache 字段的请求误判为“缓存未命中”。
- 将代理转发与流量统计解析拆分为不同模块，降低后续替换统计实现或引入第三方统计方案时对网关代理路径的影响。
- 支持 Claude Code / Claude Desktop 的 `bypassPermissions` 权限选项，以高风险按需勾选方式写入配置。
- 新增 Claude Desktop 推荐配置策略，区分 Claude Code 与 Claude Desktop 的稳定性选项，减少把 CLI 专属字段误用于桌面端。
- 改进 Codex / Claude 的 token、缓存、错误和趋势图展示，便于判断问题来自账号、模型、协议、缓存还是本地网关。
- 安装并启用打包内置托盘图标，修复部分环境下托盘图标缺失或回退为默认图标的问题。
- 更新 README、下载页和 Release 页面文案，突出 Switch++ 在 Claude Desktop、Codex Desktop、官方登录态隔离、本地兼容网关、请求诊断和可审计写入上的差异化能力。

### 为什么选择 Switch++

Switch++ 不只是一个 provider 切换器，而是面向 Claude / Codex 桌面与本地 agent 生态的三方模型接入控制台：

- **Claude Desktop 深度适配**：管理桌面端第三方配置库，让 Claude Desktop 可以通过本地网关、官方模型名映射和厂商真实模型转发使用第三方模型。
- **Codex Desktop 官方登录态隔离**：三方模型写入专用 `agent-switch` provider，尽量保留官方 `auth.json`、ChatGPT 登录壳、插件入口和移动端连接能力。
- **本地兼容网关**：当目标应用与上游厂商协议不一致时，由 Switch++ 负责协议适配、模型映射、认证隔离、请求记录和统一启停。
- **可诊断的请求链路**：请求详情、token、缓存命中、缓存创建、错误记录和趋势图都在本机可见，方便判断是账号、模型、协议还是网关问题。
- **写入前可审计**：生成的 JSON / TOML 配置会先预览，推荐选项以勾选框呈现，并在应用前创建备份，降低误写配置的风险。
- **本地 agent 工具链管理**：覆盖 Claude Code、Claude Desktop、Codex、Hermes、OpenCode、OpenClaw、Pi、Oh My OpenAgent、Oh My Pi 等常见本地 agent 入口。

### 界面预览 / Screenshots

**Codex Desktop 使用 DeepSeek 三方模型 / Codex Desktop with a DeepSeek third-party model**

![Codex Desktop 使用 DeepSeek 三方模型](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.1/docs/assets/screenshots/switchpp-codex-desktop-deepseek.png)

| Codex 配置列表 / Codex profiles | 新增 Codex 配置 / New Codex profile |
| --- | --- |
| ![Codex 配置列表](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.1/docs/assets/screenshots/switchpp-codex-profiles.png) | ![新增 Codex 配置](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.1/docs/assets/screenshots/switchpp-codex-new-profile.png) |

| Claude Desktop 配置切换 / Claude Desktop profiles | 本地环境检查 / Environment check |
| --- | --- |
| ![Claude Desktop 配置切换](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.1/docs/assets/screenshots/switchpp-claude-desktop-profiles.png) | ![本地环境检查](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.1/docs/assets/screenshots/switchpp-environment-check.png) |

| 兼容网关概览 / Gateway overview | 兼容网关调用记录 / Gateway request history |
| --- | --- |
| ![兼容网关概览](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.1/docs/assets/screenshots/switchpp-gateway-overview.png) | ![兼容网关调用记录](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.1/docs/assets/screenshots/switchpp-gateway-requests.png) |

| Claude Desktop 模型菜单 / Claude Desktop model menu | Claude Desktop 经由本地网关响应 / Claude Desktop through local gateway |
| --- | --- |
| ![Claude Desktop 模型菜单](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.1/docs/assets/screenshots/switchpp-claude-model-menu.png) | ![Claude Desktop 经由本地网关响应](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.1/docs/assets/screenshots/switchpp-claude-gateway-chat.png) |

### macOS 首次启动说明

Switch++ 尚未通过 Apple 公证（notarization），macOS 首次启动时可能会阻止。安装到 `/Applications` 后请运行：

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```

### English

Switch++ patch release focused on Claude / Codex local gateway reliability, backend traffic statistics, recommended configuration options, and public messaging. Third-party model access through Claude Desktop, Codex Desktop, and Claude Code is now easier to diagnose and more stable.

#### Highlights

- Improve local gateway usage statistics by distinguishing cache hits, cache creation, and upstream responses that do not report cache fields.
- Split proxy forwarding from usage-stat parsing, reducing the impact of future metrics implementation changes on the gateway proxy path.
- Add the Claude Code / Claude Desktop `bypassPermissions` option as a high-risk, opt-in checkbox.
- Add Claude Desktop-specific recommended configuration rules, separate from Claude Code CLI options.
- Improve Codex / Claude token, cache, error, and trend displays to help identify account, model, protocol, cache, or local gateway issues.
- Install and use the bundled tray icon so desktop builds do not fall back to a missing/default tray icon.
- Update README, download page, and Release page copy around Claude Desktop, Codex Desktop, official-login isolation, local compatibility gateway, request diagnostics, and auditable writes.

#### Why Switch++

Switch++ is not just a provider switcher. It is a third-party model access console for Claude / Codex desktop workflows and local agent toolchains:

- **Claude Desktop first-class support**: manage the desktop third-party config library, route Claude Desktop through the local gateway, and map official Claude model names to real provider models.
- **Codex Desktop with official-login isolation**: write third-party models to a dedicated `agent-switch` provider while preserving the official `auth.json`, ChatGPT login shell, plugin entry points, and mobile connection path as much as possible.
- **Local compatibility gateway**: when a target app and upstream provider speak different protocols, Switch++ handles protocol adaptation, model mapping, auth isolation, request records, and unified start/stop.
- **Diagnosable request path**: request details, tokens, cache hits, cache creation, errors, and trend charts stay visible locally, making it easier to identify account, model, protocol, or gateway issues.
- **Auditable writes**: generated JSON / TOML is previewed before writing, recommended options are exposed as checkboxes, and backups are created before applying changes.
- **Local agent toolchain management**: cover Claude Code, Claude Desktop, Codex, Hermes, OpenCode, OpenClaw, Pi, Oh My OpenAgent, Oh My Pi, and other local agent entry points.

#### macOS First-Launch Notice

Switch++ has not passed Apple notarization yet, so macOS may block it on first launch. After installing to `/Applications`, run:

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```

## v1.0.0 - 2026-05-26

Switch++ 首个正式公开版本。这个版本面向日常使用者，而不是内部测试版本；后续公开发布从 `v1.0.0` 开始。

### 功能亮点

- 让第三方模型稳定进入 Claude Code、Claude Desktop、Codex CLI、Codex Desktop 以及常用本地 AI 编程工具。
- 支持 DeepSeek、MiniMax、Kimi、GLM 等国产模型接入 Codex 客户端及 Claude 客户端，并提供本地协议适配路径。
- 支持国产模型接入 Codex 后配合使用官方插件和移动端能力；需先登录官方账号并添加官方配置，再与三方模型配置搭配使用。
- 在官方账号模式和第三方模型厂商模式之间快速切换。
- 为不同工具保存多套配置，并支持新增、编辑、复制、删除、排序和一键应用。
- 写入前预览配置内容，并在应用前自动保留备份，便于回退。
- 内置主流厂商预设、模型发现、能力提示和配置建议，减少手动试错。
- 提供本地兼容网关，统一承接 Claude 与 Codex 的第三方模型调用，并处理 Anthropic / OpenAI / Responses / Chat Completions 之间的协议差异。
- 展示网关状态、调用记录、消耗统计、缓存读写、错误记录和趋势图表，方便定位问题。
- 检查本机工具、应用、配置文件、安装版本和可升级状态。
- 支持一键安装、升级、卸载常用 CLI 工具。
- 支持中英双语界面、紧凑侧边栏、系统托盘和桌面原生窗口体验。

### 为什么选择 Switch++

Switch++ 不只是一个 provider 切换器，而是面向 Claude / Codex 桌面与本地 agent 生态的三方模型接入控制台：

- **Claude Desktop 深度适配**：管理桌面端第三方配置库，让 Claude Desktop 可以通过本地网关、官方模型名映射和厂商真实模型转发使用第三方模型。
- **Codex Desktop 官方登录态隔离**：三方模型写入专用 `agent-switch` provider，尽量保留官方 `auth.json`、ChatGPT 登录壳、插件入口和移动端连接能力。
- **本地兼容网关**：当目标应用与上游厂商协议不一致时，由 Switch++ 负责协议适配、模型映射、认证隔离、请求记录和统一启停。
- **可诊断的请求链路**：请求详情、token、缓存命中、缓存创建、错误记录和趋势图都在本机可见，方便判断是账号、模型、协议还是网关问题。
- **写入前可审计**：生成的 JSON / TOML 配置会先预览，推荐选项以勾选框呈现，并在应用前创建备份，降低误写配置的风险。
- **本地 agent 工具链管理**：覆盖 Claude Code、Claude Desktop、Codex、Hermes、OpenCode、OpenClaw、Pi、Oh My OpenAgent、Oh My Pi 等常见本地 agent 入口。

### 界面预览 / Screenshots

**Codex Desktop 使用 DeepSeek 三方模型 / Codex Desktop with a DeepSeek third-party model**

![Codex Desktop 使用 DeepSeek 三方模型](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.0/docs/assets/screenshots/switchpp-codex-desktop-deepseek.png)

| Codex 配置列表 / Codex profiles | 新增 Codex 配置 / New Codex profile |
| --- | --- |
| ![Codex 配置列表](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.0/docs/assets/screenshots/switchpp-codex-profiles.png) | ![新增 Codex 配置](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.0/docs/assets/screenshots/switchpp-codex-new-profile.png) |

| Claude Desktop 配置切换 / Claude Desktop profiles | 本地环境检查 / Environment check |
| --- | --- |
| ![Claude Desktop 配置切换](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.0/docs/assets/screenshots/switchpp-claude-desktop-profiles.png) | ![本地环境检查](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.0/docs/assets/screenshots/switchpp-environment-check.png) |

| 兼容网关概览 / Gateway overview | 兼容网关调用记录 / Gateway request history |
| --- | --- |
| ![兼容网关概览](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.0/docs/assets/screenshots/switchpp-gateway-overview.png) | ![兼容网关调用记录](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.0/docs/assets/screenshots/switchpp-gateway-requests.png) |

| Claude Desktop 模型菜单 / Claude Desktop model menu | Claude Desktop 经由本地网关响应 / Claude Desktop through local gateway |
| --- | --- |
| ![Claude Desktop 模型菜单](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.0/docs/assets/screenshots/switchpp-claude-model-menu.png) | ![Claude Desktop 经由本地网关响应](https://raw.githubusercontent.com/sssstwee/switch-plus-plus/v1.0.0/docs/assets/screenshots/switchpp-claude-gateway-chat.png) |

### macOS 首次启动说明

Switch++ 尚未通过 Apple 公证（notarization），macOS 首次启动时可能会阻止。安装到 `/Applications` 后请运行：

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```

### English

Switch++ first public stable release. This version is intended as the first official external release; public release history starts from `v1.0.0`.

#### Highlights

- Bring third-party models into Claude Code, Claude Desktop, Codex CLI, Codex Desktop, and common local AI coding tools.
- Connect domestic model providers such as DeepSeek, MiniMax, Kimi, and GLM to Codex and Claude clients through local protocol adaptation when needed.
- Use official Codex plugins and mobile features alongside domestic model profiles after signing in with an official account and adding the official configuration.
- Switch quickly between official-account mode and third-party provider mode.
- Save multiple profiles per tool, then add, edit, duplicate, delete, reorder, and apply them quickly.
- Preview local configuration before writing it, with backups created before changes are applied.
- Use built-in provider presets, model discovery, capability notes, and recommendations to reduce trial and error.
- Route Claude and Codex third-party model calls through the local compatibility gateway, including Anthropic / OpenAI / Responses / Chat Completions protocol differences.
- Inspect gateway status, request history, usage statistics, cache reads, cache creation, recent errors, and trend charts.
- Check local tools, apps, config files, installed versions, and available upgrades.
- Install, upgrade, and uninstall common CLI tools from the app.
- Use the bilingual desktop interface with compact navigation, tray support, and native window behavior.

#### Why Switch++

Switch++ is not just a provider switcher. It is a third-party model access console for Claude / Codex desktop workflows and local agent toolchains:

- **Claude Desktop first-class support**: manage the desktop third-party config library, route Claude Desktop through the local gateway, and map official Claude model names to real provider models.
- **Codex Desktop with official-login isolation**: write third-party models to a dedicated `agent-switch` provider while preserving the official `auth.json`, ChatGPT login shell, plugin entry points, and mobile connection path as much as possible.
- **Local compatibility gateway**: when a target app and upstream provider speak different protocols, Switch++ handles protocol adaptation, model mapping, auth isolation, request records, and unified start/stop.
- **Diagnosable request path**: request details, tokens, cache hits, cache creation, errors, and trend charts stay visible locally, making it easier to identify account, model, protocol, or gateway issues.
- **Auditable writes**: generated JSON / TOML is previewed before writing, recommended options are exposed as checkboxes, and backups are created before applying changes.
- **Local agent toolchain management**: cover Claude Code, Claude Desktop, Codex, Hermes, OpenCode, OpenClaw, Pi, Oh My OpenAgent, Oh My Pi, and other local agent entry points.

#### macOS First-Launch Notice

Switch++ has not passed Apple notarization yet, so macOS may block it on first launch. After installing to `/Applications`, run:

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Switch++.app"
open "/Applications/Switch++.app"
```
