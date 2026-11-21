import { describe, expect, it } from "vitest";
import { formatCurrency, safeNextPath, slugify, truncate } from "@/lib/utils";
import { maskNik } from "@/lib/privacy";

describe("slugify", () => {
  it("creates url-safe slugs", () => {
    expect(slugify("KNPI Morowali: Pemuda & Karya!")).toBe("knpi-morowali-pemuda-karya");
  });

  it("handles accents and repeated separators", () => {
    expect(slugify("  Café   Morowali  ")).toBe("cafe-morowali");
  });
});

describe("safeNextPath", () => {
  it("allows internal paths", () => {
    expect(safeNextPath("/admin/berita")).toBe("/admin/berita");
  });

  it("blocks protocol-relative and external urls", () => {
    expect(safeNextPath("//evil.example")).toBe("/admin");
    expect(safeNextPath("https://evil.example")).toBe("/admin");
    expect(safeNextPath(null)).toBe("/admin");
  });
});

describe("format helpers", () => {
  it("formats rupiah without decimals", () => {
    expect(formatCurrency(2500000)).toContain("2.500.000");
  });

  it("truncates long text with ellipsis", () => {
    expect(truncate("abcdefghij", 5)).toBe("abcde…");
    expect(truncate("abc", 5)).toBe("abc");
  });
});

describe("maskNik", () => {
  it("masks the middle of a NIK", () => {
    expect(maskNik("7201000000000001")).toBe("7201••••••••0001");
  });
});
