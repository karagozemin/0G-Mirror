import { hashText } from "@/lib/utils/hash";

export function createLocalId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function localNumericId(seed: string) {
  const hash = hashText(seed).slice(2, 14);
  return Number.parseInt(hash, 16);
}
