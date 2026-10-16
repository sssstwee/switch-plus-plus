# 厂商配置核对（2026-10-16）

范围为 Codex、Claude Code、Claude Desktop 和应用当前保留的厂商。复用既有协议适配器、reqwest 和模型目录；没有引入第三方模型清单作为官方实时列表。GitHub 的 models.dev 可用作参考，但其目录不代表用户账户实际可调用模型，因此不新增运行依赖。

| 厂商／方案 | Codex | Claude Code / Desktop 上游 | 配置要点与官方依据 |
| --- | --- | --- | --- |
| OpenAI | 官方登录或 `/v1` Responses | 当前预设按目标支持范围展示 | ChatGPT 登录与 API 付费分开；[Codex 配置](https://developers.openai.com/codex/config-reference/)，[Models API](https://developers.openai.com/api/reference/resources/models/methods/list) |
| Anthropic | 当前预设按目标支持范围展示 | 官方登录或 Anthropic API | API Key 与订阅登录分开；模型列表使用 `x-api-key`、版本头、游标分页；[Models API](https://platform.claude.com/docs/en/api/models/list) |
| DeepSeek | 原生 Responses | `/anthropic` | Flash 的 API ID 不随官网展示名称变化；图片能力以模型返回为准；[Codex](https://api-docs.deepseek.com/quick_start/agent_integrations/codex)、[Anthropic](https://api-docs.deepseek.com/guides/anthropic_api/)、[模型列表](https://api-docs.deepseek.com/api/list-models/) |
| MiniMax 国内／国际、M-Plan | `/v1` Responses | `/anthropic` | 站点、套餐密钥匹配；M3.1 Flash Preview 的 Codex 窗口为 524288，默认 max；[Codex](https://platform.minimax.io/docs/m-plan/codex)、[Claude Code](https://platform.minimax.io/docs/m-plan/claude-code) |
| 智谱／Z.ai 按量 | `/api/paas/v4` Chat 经网关 | `/api/anthropic`，权限依厂商方案 | 不把 Coding Plan 的专用端点套给按量账户；[接入协议](https://docs.z.ai/devpack/tool/others) |
| 智谱／Z.ai Coding Plan | `/api/v1` 原生 Responses | `/api/anthropic` | GLM-5.3：1M、文本输入、low/high/max，默认 max；团队密钥不通用；[国内 Codex](https://docs.bigmodel.cn/cn/coding-plan/tool/codex)、[国际 Codex](https://docs.z.ai/devpack/tool/codex) |
| Kimi 平台／Kimi Code | Chat 经网关 | 平台 `/anthropic`；套餐 `/coding/` | 平台 ID 与套餐 ID 不同；K3 的 1M 取决于套餐，k3-256k 固定 256K；[平台 API](https://platform.kimi.ai/docs/api/overview)、[套餐模型](https://www.kimi.com/code/docs/en/kimi-code/models.html) |
| 硅基流动 | `/v1` Chat 经网关 | `/v1/messages` | 保留组织和 Pro/ 前缀；[Codex](https://docs.siliconflow.cn/docs/usercases/use-siliconcloud-in-codex)、[Claude 接入](https://docs.siliconflow.cn/en/usercases/use-siliconcloud-in-ccswitch) |
| 百炼按量 | 支持 Responses 的模型直连 | `/apps/anthropic` | 地址、地域、工作空间、密钥必须匹配；控制台提供工作空间地址时可直接替换；[Codex](https://help.aliyun.com/zh/model-studio/codex)、[Claude](https://help.aliyun.com/zh/model-studio/claude-code) |
| 百炼 Coding Plan | Chat 经网关 | `coding.dashscope.aliyuncs.com/apps/anthropic` | 专用 sk-sp- 密钥，独立模型列表，不支持 Responses；[Codex](https://help.aliyun.com/zh/model-studio/codex) |
| ModelScope | OpenAI Chat 经网关 | OpenAI Chat 经本地协议适配 | 使用 Access Token，保留组织/模型 ID；不标记为厂商原生 Anthropic 支持；[API Inference](https://modelscope.cn/docs/model-service/API-Inference/intro) |
| OpenRouter | `/api/v1` Responses | `/api` Anthropic Messages | 保留厂商/模型 ID；能力按聚合平台返回；[Claude Code](https://openrouter.ai/docs/cookbook/coding-agents/claude-code-integration) |

## 模型发现与参数处理

- 返回官方名称、API ID、发布时间、输入模态、上下文、输出上限和接口公开的推理档位；按发布时间排序，无时间时保留厂商顺序。未来 ID 和多模态模型不被家族白名单删掉。
- 支持 Anthropic 游标、DashScope 页码和同源 next 链接；分页失败不会把部分列表当完整结果。禁止自动重定向和跨源分页携带密钥。
- 未公开能力的接口不补造能力。成功刷新以实时列表为准；失败明确报错；内置候选明确标注。
- Codex 保存所选模型的实时能力，并在重新应用配置时写入目录。OpenAI/MiniMax 专用 Codex 客户端窗口保留官方建议，不直接用原始 API 窗口覆盖。
- Claude Desktop 的重复别名只展示一个有效映射，主模型优先。图片直接传给所选模型，不再调用视觉代理。
- 新的未知模型不默认开启 1M；已有显式设置保留。1M 是客户端声明，不会增加厂商或账户额度。

## 验证边界

本轮实际取得 DeepSeek（已保存密钥）、OpenRouter、ModelScope、百炼 Coding Plan 的模型列表。OpenRouter 完整返回 465 条，ModelScope 返回 36 条，百炼 Coding Plan 返回 6 条；这些数量只代表此次请求。

其他厂商已核对官方接入资料，并通过认证头、URL、分页和配置生成的回归测试。无有效密钥的探测返回 401，不能据此声称对应账户已成功调用或所有模型均可用。没有恢复已删除的配置，也没有把过期密钥问题当作软件故障。

发布使用 GitHub Actions 构建 Apple Silicon 安装包；本机仅运行源码检查和测试。

## Claude Desktop 专项核对

结合任务“排查 Claude Desktop 配置报错”的审计，修复原生字段写入、工具定义裁剪、错误转发和 `[1m]` 别名四项问题。

本机 Claude Desktop 2.42304.0 的配置校验仍拒绝含 deepseek、glm、kimi、minimax 等名称的调用 ID，同时识别 `inferenceModels[].labelOverride`。因此当前版本保留 `name: Fable5` 作为兼容调用身份，动态显示所选上游的官方名称（无名称时回退真实 ID）。后端映射仍按每条配置发送真实模型 ID，不硬编码 DeepSeek；DeepSeek、GLM、MiniMax 的动态名称和映射均有回归测试。

依据：[Claude Desktop 配置](https://claude.com/docs/third-party/claude-desktop/configuration)的 name/labelOverride 字段和[网关压缩要求](https://claude.com/docs/third-party/claude-desktop/gateway#context-window-and-compaction)。本机安装包源码校验补充了官网概述未说明的具体模型过滤行为。

内部 `agentSwitch*`、`configOptions` 仍由 Switch++ 自己的状态保存，停止写入 Claude 配置。实际写入 `disableEssentialTelemetry`、`disableNonessentialTelemetry`、`inferenceStreamIdleTimeoutSec`；不再把 Claude Code 的 permissions 字段误报为 Desktop 已生效。切换配置后需完全退出并重新启动 Claude。

## 参数选项补齐（v1.0.22）

- 本机验证基线：Codex 0.163.0、Claude Code 2.1.185、Claude Desktop 2.42304.0。基线是本次验证版本，不代表各字段最早发布版本。已知要求更高版本的字段单独限制（如 Claude Code 的提示建议环境变量需要 2.1.238）。配置页读取已安装版本；不自动升级其他应用。
- 实时能力与本机官方目录优先于已核实型号的内置说明。模型未公开具体能力时不推断支持；新型号没有说明时保留默认。能力获取不是账户调用权限的证明。
- 推理强度使用当前模型的可用档位，与 API 协议和应用接受的值求交集；Claude Desktop 沿用自身模型选择器，不写 Claude Code 的 effort 环境变量。
- Tool Search 需要上游正确处理 tool_reference；普通 Anthropic 兼容声明不能证明支持。三方路径缺少明确能力时不自动启用。1h 缓存及细粒度工具流同样不套用所有厂商。
- Claude 的模型角色逐一声明已确认的 effort/thinking 能力，未知角色不补造声明。开启 thinking 与 max effort 分开处理。
- 遥测、统计和署名保留用户偏好，不再作为接入稳定性的强制推荐。Desktop 流式等待只适用于网关连接。
- 回归覆盖实时能力否定、未知模型、协议切换、旧版本、每角色声明、max/ultra 档位以及 Goal=false 的后端往返。发布后核对安装版实际预览和配置文件。

依据：[Codex 配置](https://developers.openai.com/codex/config-reference)、[Claude Code 环境变量](https://code.claude.com/docs/en/env-vars)、[模型能力声明](https://code.claude.com/docs/en/model-config)、[Desktop 原生配置](https://claude.com/docs/third-party/claude-desktop/configuration)、[Anthropic 模型能力](https://platform.claude.com/docs/en/api/models/list)。
