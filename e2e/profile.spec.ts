import { expect, test } from "@playwright/test";

test("trang chủ hiển thị hero nền tảng", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Nền tảng profile đa tenant/i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Xem profile demo/i })).toBeVisible();
});

test("profile công khai miyaru hiển thị nội dung", async ({ page }) => {
  await page.goto("/profile/miyaru");
  await expect(page.getByRole("heading", { name: "Miyaru Yue" })).toBeVisible();
  await expect(page.getByText("Kỹ năng & Dịch vụ")).toBeVisible();
  await expect(page.getByText("Liên kết nhanh")).toBeVisible();
  await expect(page.getByText("Hành trình")).toBeVisible();
});

test("trang đăng nhập có form seed", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /Đăng nhập/i })).toBeVisible();
  await expect(page.locator('input[type="email"]')).toHaveValue("miyaru2k5@gmail.com");
});
