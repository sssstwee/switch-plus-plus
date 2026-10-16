import { deepEqual, equal } from "node:assert/strict";
import { isProxyTarget, proxyTargetKeys } from "./proxyTargets.ts";
import type { TargetKey } from "./appTypes.ts";

deepEqual(proxyTargetKeys, ["codex", "claude_cli", "claude_desktop"]);

const proxyTargets: TargetKey[] = ["codex", "claude_cli", "claude_desktop"];

for (const target of proxyTargets) {
  equal(isProxyTarget(target), true, `${target} should stay in compatibility gateway`);
}
