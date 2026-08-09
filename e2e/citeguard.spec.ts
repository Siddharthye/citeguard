import { expect, test } from "@playwright/test";

test.describe("CiteGuard", () => {
  test("health endpoint is up", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.service).toBe("citeguard");
  });

  test("answers an in-scope policy question with citations", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator(".brand-mark")).toContainText("CiteGuard");

    await page.getByTestId("question-input").fill(
      "How many days of paid annual leave do employees receive?",
    );
    await page.getByTestId("ask-button").click();

    await expect(page.getByTestId("answer-text")).toContainText(/18/i, {
      timeout: 15_000,
    });
    await expect(page.getByTestId("citations")).toBeVisible();
    await expect(page.getByTestId("answer-meta")).toContainText(/auditor: pass/i);
    await expect(page.getByTestId("audit-list")).toContainText(/leave/i);

    await page.getByTestId("citation-button").first().click();
    await expect(page.getByTestId("source-panel")).toBeVisible();
    await expect(page.getByTestId("source-content")).toContainText(/18/i);

    await page.getByTestId("question-input").fill(
      "What is the secret recipe for the company cafeteria pizza?",
    );
    await expect(page.getByTestId("source-panel")).toHaveCount(0);
  });

  test("refuses an out-of-scope question", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("try-pizza").click();
    await expect(page.getByTestId("question-input")).toHaveValue(
      /cafeteria pizza topping/i,
    );
    await page.getByTestId("ask-button").click();

    await expect(page.getByTestId("answer-text")).toContainText(
      /I don't know/i,
      { timeout: 15_000 },
    );
  });

  test("exports audit log as CSV", async ({ request, page }) => {
    await page.goto("/");
    await page.getByTestId("question-input").fill(
      "How many days of paid annual leave do employees receive?",
    );
    await page.getByTestId("ask-button").click();
    await expect(page.getByTestId("answer-text")).toContainText(/18/i, {
      timeout: 15_000,
    });

    const response = await request.get("/api/audit?format=csv");
    expect(response.ok()).toBeTruthy();
    const text = await response.text();
    expect(text).toContain("createdAt,question,refused,citationCount,answer");
    expect(text.toLowerCase()).toContain("leave");
  });

  test("shows conflict banner when multiple sources match", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("upload-name").fill("leave-a.md");
    await page
      .getByTestId("upload-content")
      .fill("Team Alpha handbook: paid leave is 18 days per year.");
    await page.getByTestId("upload-button").click();
    await expect(page.getByTestId("document-list")).toContainText("leave-a.md");

    await page.getByTestId("upload-name").fill("leave-b.md");
    await page
      .getByTestId("upload-content")
      .fill("Team Beta handbook: paid leave is 22 days per year.");
    await page.getByTestId("upload-button").click();
    await expect(page.getByTestId("document-list")).toContainText("leave-b.md");

    await page
      .getByTestId("question-input")
      .fill("How many paid leave days are in the handbook?");
    await page.getByTestId("ask-button").click();

    await expect(page.getByTestId("answer-text")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("conflict-banner")).toContainText(
      /Multiple sources disagree/i,
    );
  });

  test("Day 2 one-click supersession demo", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("try-day2-supersession").click();

    await expect(page.getByTestId("answer-text")).toContainText(/22/i, {
      timeout: 20_000,
    });
    await expect(page.getByTestId("superseded-banner")).toContainText(
      /leave-policy-2020/i,
    );
    await expect(page.getByTestId("citations")).toContainText(
      "leave-policy-2024.md",
    );
    await expect(page.getByTestId("badge-superseded").first()).toBeVisible();
  });
});
