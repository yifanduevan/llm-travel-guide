import { expect, type Page, test } from "@playwright/test";

type GenerateTripPayload = {
  titleOrDestination: string;
  travelers: "SOLO" | "COUPLE" | "FAMILY" | "GROUP";
  budget: "BUDGET" | "MEDIUM" | "LUXURY";
};

function parseGenerateTripPayload(value: unknown): GenerateTripPayload {
  const input = value as Partial<GenerateTripPayload> | null | undefined;
  return {
    titleOrDestination:
      typeof input?.titleOrDestination === "string" ? input.titleOrDestination : "",
    travelers:
      input?.travelers === "SOLO" ||
      input?.travelers === "COUPLE" ||
      input?.travelers === "FAMILY" ||
      input?.travelers === "GROUP"
        ? input.travelers
        : "COUPLE",
    budget:
      input?.budget === "BUDGET" ||
      input?.budget === "MEDIUM" ||
      input?.budget === "LUXURY"
        ? input.budget
        : "MEDIUM",
  };
}

async function authenticate(page: Page) {
  await page.context().addCookies([
    {
      name: "auth",
      value: "1",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
}

async function pickDateRange(page: Page) {
  await page
    .getByRole("button", { name: /Select departure and return dates|→/ })
    .click();

  const popover = page.getByTestId("date-range-popover");
  await expect(popover).toBeVisible();

  const selectableDayLabels = await popover
    .locator("button[aria-label]:not([disabled])")
    .evaluateAll((buttons) =>
      buttons
        .map((button) => button.getAttribute("aria-label") ?? "")
        .filter((label) => {
          const normalized = label.toLowerCase();
          return (
            !normalized.includes("previous month") &&
            !normalized.includes("next month") &&
            !normalized.includes("close")
          );
        }),
    );

  if (selectableDayLabels.length < 2) {
    throw new Error("Unable to find enough selectable day buttons in date picker.");
  }

  const startLabel = selectableDayLabels[0];
  const endLabel = selectableDayLabels[Math.min(selectableDayLabels.length - 1, 3)];

  await popover.getByLabel(startLabel, { exact: true }).click();
  await popover.getByLabel(endLabel, { exact: true }).click();
  await page.getByTestId("date-range-confirm").click();
}

test("create trip flow submits generation request and navigates to detail page", async ({
  page,
}) => {
  await authenticate(page);

  let postedBody: GenerateTripPayload = {
    titleOrDestination: "",
    travelers: "COUPLE",
    budget: "MEDIUM",
  };
  let sawGenerateRequest = false;
  await page.route("**/api/trips/generate", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    postedBody = parseGenerateTripPayload(route.request().postDataJSON());
    sawGenerateRequest = true;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "e2e-created-trip",
        titleOrDestination: "Lisbon",
        startDate: "2026-04-10",
        endDate: "2026-04-15",
      }),
    });
  });
  await page.route("**/api/trips/e2e-created-trip/generate-itinerary", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ days: [] }),
    });
  });

  await page.goto("/trips/add");
  await page.getByPlaceholder("e.g., Tokyo, Japan").fill("Lisbon");
  await pickDateRange(page);
  await page.getByRole("button", { name: "Generate my guide" }).click();

  await expect(page).toHaveURL(/\/trips\/e2e-created-trip$/);
  expect(sawGenerateRequest).toBeTruthy();
  expect(postedBody.titleOrDestination).toBe("Lisbon");
  expect(postedBody.travelers).toBe("COUPLE");
  expect(postedBody.budget).toBe("MEDIUM");
});

test("trip detail tabs load and switch views", async ({ page }) => {
  await authenticate(page);
  await page.route(
    "**/api/trips/1/dining-reservations",
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      });
    },
  );
  await page.goto("/trips/1");

  await expect(page.getByRole("heading", { name: "Your Journey" })).toBeVisible();

  await page.getByRole("button", { name: "Dining" }).click();
  await expect(page.getByRole("heading", { name: "Gastronomy" })).toBeVisible();

  await page.getByRole("button", { name: "Transportation" }).click();
  await expect(page.getByRole("heading", { name: "Logistics" })).toBeVisible();

  await page.getByRole("button", { name: "Accommodation" }).click();
  await expect(page.getByRole("heading", { name: "Stays & Havens" })).toBeVisible();

});

test("generate itinerary flow renders returned itinerary items", async ({ page }) => {
  await authenticate(page);

  await page.route("**/api/trips/generate", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "42",
        titleOrDestination: "Kyoto",
        startDate: "2026-05-01",
        endDate: "2026-05-06",
      }),
    });
  });
  await page.route("**/api/trips/42/generate-itinerary", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        days: [
          {
            date: "2026-05-01",
            items: [
              {
                title: "Fushimi Inari Shrine",
                time: "9:00 AM",
                description: "Early-morning visit.",
                locationText: "",
              },
            ],
          },
        ],
      }),
    });
  });

  await page.route("**/api/trips/42/itinerary", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          label: "Day 1",
          date: "Friday, May 1",
          active: true,
          items: [
            {
              icon: "temple_buddhist",
              title: "Fushimi Inari Shrine",
              time: "9:00 AM",
              note: "Early-morning visit.",
            },
          ],
        },
      ]),
    });
  });

  await page.goto("/trips/add");
  await page.getByPlaceholder("e.g., Tokyo, Japan").fill("Kyoto");
  await pickDateRange(page);
  await page.getByRole("button", { name: "Generate my guide" }).click();

  await expect(page).toHaveURL(/\/trips\/42$/);
  await expect(page.getByText("Fushimi Inari Shrine")).toBeVisible();
  await expect(page.getByText("Early-morning visit.")).toBeVisible();
});

test("shows an error when generation fails", async ({ page }) => {
  await authenticate(page);

  await page.route("**/api/trips/generate", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
      return;
    }
    await route.continue();
  });

  await page.goto("/trips/add");
  await page.getByPlaceholder("e.g., Tokyo, Japan").fill("Lisbon");
  await pickDateRange(page);
  await page.getByRole("button", { name: "Generate my guide" }).click();

  await expect(
    page.getByText(/backend trip creation failed/i),
  ).toBeVisible();
});
