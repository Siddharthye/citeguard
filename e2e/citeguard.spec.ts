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
    await expect(page.getByText("CiteGuard")).toBeVisible();

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
  });

  test("refuses an out-of-scope question", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("question-input").fill(
      "What is the secret recipe for the company cafeteria pizza?",
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

  test("uploads a document and can ask about it", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("upload-name").fill("travel-policy.txt");
    await page
      .getByTestId("upload-content")
      .fill(
        "International flights require economy class booking. Business class is allowed only for flights longer than 8 hours with VP approval.",
      );
    await page.getByTestId("upload-button").click();

    await expect(page.getByTestId("document-list")).toContainText(
      "travel-policy.txt",
    );

    await page
      .getByTestId("question-input")
      .fill("When is business class allowed for flights?");
    await page.getByTestId("ask-button").click();

    await expect(page.getByTestId("answer-text")).toContainText(/8 hours/i, {
      timeout: 15_000,
    });
    await expect(page.getByTestId("citations")).toContainText(
      "travel-policy.txt",
    );
  });
});
