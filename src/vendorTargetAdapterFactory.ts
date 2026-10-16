import type { ApiFormat, AuthField, TargetKey } from "./appTypes.ts";

export type VendorTargetAdapter = {
  base_url?: string;
  api_format?: ApiFormat;
  auth_field?: AuthField;
  source_url: string;
};

export function makeAnthropicCompatAdapters(
  baseUrl: string,
  sourceUrl: string,
): Partial<Record<TargetKey, VendorTargetAdapter>> {
  const adapter: VendorTargetAdapter = {
    base_url: baseUrl,
    api_format: "anthropic",
    source_url: sourceUrl,
  };
  return { claude_cli: adapter, claude_desktop: adapter };
}
