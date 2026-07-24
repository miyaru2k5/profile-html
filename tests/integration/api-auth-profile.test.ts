import { beforeEach, describe, expect, it } from "vitest";
import { resetMemoryStore } from "@/infrastructure/memory/store";
import { resetContainer } from "@/core/di/container";
import { AuthController } from "@/modules/auth/presentation/auth-controller";
import { ProfileController } from "@/modules/profile/presentation/profile-controller";
import { NextRequest } from "next/server";

function jsonRequest(url: string, body: unknown, token?: string) {
  return new NextRequest(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe("API controllers integration", () => {
  beforeEach(() => {
    resetMemoryStore(true);
    resetContainer();
  });

  it("login -> list profiles -> public profile", async () => {
    const loginRes = await AuthController.login(
      jsonRequest("http://localhost/api/v1/auth/login", {
        email: "miyaru2k5@gmail.com",
        password: "demo1234",
      }),
    );
    const loginJson = await loginRes.json();
    expect(loginJson.success).toBe(true);
    const token = loginJson.data.token as string;

    const listRes = await ProfileController.list(
      new NextRequest("http://localhost/api/v1/profiles", {
        headers: { authorization: `Bearer ${token}` },
      }),
    );
    const listJson = await listRes.json();
    expect(listJson.success).toBe(true);
    expect(listJson.data.length).toBeGreaterThan(0);

    const publicRes = await ProfileController.getPublicBySlug(
      "miyaru",
      new NextRequest("http://localhost/api/v1/profiles/public/miyaru"),
    );
    const publicJson = await publicRes.json();
    expect(publicJson.success).toBe(true);
    expect(publicJson.data.profile.slug).toBe("miyaru");
  });
});
