const LEGACY_AGENT_BRAND_PATTERN = /\bLexIA\b/gi;
const LEGACY_DEMO_SLUG_PATTERN = /\blexia-demo\b/gi;

export function normalizeVisibleCopy(value: string): string {
  return value
    .replace(LEGACY_AGENT_BRAND_PATTERN, "Clara")
    .replace(LEGACY_DEMO_SLUG_PATTERN, "clara-demo");
}

export function normalizeVisibleCopyList(values: readonly string[]): string[] {
  return values.map((value) => normalizeVisibleCopy(value));
}
