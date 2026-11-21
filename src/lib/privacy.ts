export function maskNik(nik: string) {
  if (nik.length < 8) return "••••";
  return `${nik.slice(0, 4)}••••••••${nik.slice(-4)}`;
}

export function maskName(name: string) {
  return name
    .split(/\s+/)
    .map((part) =>
      part.length <= 2 ? part : `${part[0]}${"•".repeat(Math.min(part.length - 2, 6))}${part.slice(-1)}`,
    )
    .join(" ");
}
