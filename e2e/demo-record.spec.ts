import { expect, test } from "@playwright/test";
import path from "path";
import fs from "fs";

const DEMO_DIR = path.join(process.cwd(), "demos");

test.describe("CiteGuard demo recording", () => {
  test("full submission walkthrough", async ({ page }) => {
    fs.mkdirSync(DEMO_DIR, { recursive: true });

    await page.goto("/");
    await expect(page.getByText("CiteGuard")).toBeVisible();
    await page.screenshot({
      path: path.join(DEMO_DIR, "01-home.png"),
      fullPage: true,
    });

    await page.getByTestId("question-input").fill(
      "How many days of paid annual leave do employees receive?",
    );
    await page.getByTestId("ask-button").click();
    await expect(page.getByTestId("answer-text")).toContainText(/18/i, {
      timeout: 15_000,
    });
    await expect(page.getByTestId("citations")).toBeVisible();
    await page.screenshot({
      path: path.join(DEMO_DIR, "02-cited-answer.png"),
      fullPage: true,
    });

    await page.getByTestId("question-input").fill(
      "What is the cafeteria secret pizza topping?",
    );
    await page.getByTestId("ask-button").click();
    await expect(page.getByTestId("answer-text")).toContainText(
      /I don't know/i,
      { timeout: 15_000 },
    );
    await page.screenshot({
      path: path.join(DEMO_DIR, "03-refusal.png"),
      fullPage: true,
    });

    await page.getByTestId("upload-name").fill("travel-policy.txt");
    await page.getByTestId("upload-content").fill(
      "International flights require economy class booking. Business class is allowed only for flights longer than 8 hours with VP approval.",
    );
    await page.getByTestId("upload-button").click();
    await expect(page.getByTestId("document-list")).toContainText(
      "travel-policy.txt",
    );

    await page
      .getByTestId("question-input")
      .fill("When is business class allowed?");
    await page.getByTestId("ask-button").click();
    await expect(page.getByTestId("answer-text")).toContainText(/8 hours/i, {
      timeout: 15_000,
    });
    await page.screenshot({
      path: path.join(DEMO_DIR, "04-upload-and-ask.png"),
      fullPage: true,
    });

    await expect(page.getByTestId("audit-list")).toContainText(/leave|pizza|business/i);
    await page.screenshot({
      path: path.join(DEMO_DIR, "05-audit-log.png"),
      fullPage: true,
    });

    await page.getByTestId("try-day2-supersession").click();
    await expect(page.getByTestId("answer-text")).toContainText(/22/i, {
      timeout: 20_000,
    });
    await expect(page.getByTestId("superseded-banner")).toBeVisible();
    await page.screenshot({
      path: path.join(DEMO_DIR, "06-day2-supersession.png"),
      fullPage: true,
    });
  });
});
