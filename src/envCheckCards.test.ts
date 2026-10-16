import { deepEqual, equal } from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildEnvCheckCards } from "./features/env-check/envCheckCards.ts";

function readSource(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8").replace(/\r\n/g, "\n");
}

const cards = buildEnvCheckCards(null, "macos");

const codexDesktopCard = cards.find((card) => card.key === "codex_desktop");
equal(codexDesktopCard?.title, "ChatGPT（Codex）");
equal(codexDesktopCard?.launchCommand, "open");
deepEqual(codexDesktopCard?.launchArgs, ["-b", "com.openai.codex"]);

const appSource = readSource("./App.tsx");
const envCheckCardsSource = readSource("./features/env-check/envCheckCards.ts");
equal(envCheckCardsSource.includes("Codex 桌面功能已集成在 ChatGPT 中"), true);
deepEqual(cards.map((card) => card.key), ["claude_cli", "claude_desktop", "codex_cli", "codex_desktop"]);
equal(appSource.includes("启动命令"), true);
equal(appSource.includes("启动参数"), true);
equal(appSource.includes("launchCommandDisplay(item)"), true);
equal(appSource.includes("launchArgsDisplay(item)"), true);
equal(appSource.includes(': "无"'), false);
equal(appSource.includes('item.badge.includes("桌面端")'), true);
equal(appSource.includes('record.label !== "ChatGPT.app"'), true);
