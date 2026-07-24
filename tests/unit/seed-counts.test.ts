import { describe, expect, it } from "vitest";
import { resetMemoryStore } from "@/infrastructure/memory/store";
import { countSeedTables } from "@/infrastructure/memory/seed";

describe("Seed data — mỗi bảng ≥ 5 bản ghi", () => {
  it("counts all collections at least 5", () => {
    const store = resetMemoryStore(true);
    const counts = countSeedTables(store);
    for (const [table, n] of Object.entries(counts)) {
      expect(n, `${table} should have ≥ 5 rows (got ${n})`).toBeGreaterThanOrEqual(5);
    }
  });

  it("primary miyaru profile published with domains", () => {
    const store = resetMemoryStore(true);
    const p = store.profiles.find((x) => x.slug === "miyaru");
    expect(p?.status).toBe("PUBLISHED");
    expect(store.domains.some((d) => d.hostname === "miyaru.online" && d.isPrimary)).toBe(true);
  });
});
