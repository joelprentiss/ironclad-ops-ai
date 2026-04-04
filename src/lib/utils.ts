export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function compactText(value: string, maxLength = 150) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 3)}...`;
}
