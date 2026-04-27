import { test, expect , Page } from '@playwright/test';

const restaurantName = 'Fried Chicken Engineer';


async function login(page: Page) {
  await page.goto('http://localhost:3000/');

  await page.getByRole('link', { name: /login/i }).click();
  await expect(page).toHaveURL(/login/);

  await page.getByLabel('Email').fill('owner1@gmail.com');
  await page.getByLabel('Password').fill('123456');
  await page.getByRole('button', { name: /login/i }).click();

  await page.waitForURL('/');
  await expect(page).toHaveURL('http://localhost:3000/');
}

async function goToMyRestaurants(page: Page) {
  await page.getByRole('link', { name: /my restaurants/i }).click();
  await expect(page).toHaveURL('/yourRestaurants');
}

function getCard(page: Page) {
  return page.getByTestId(`restaurant-card-${restaurantName}`);
}

// ---------------- TESTS ----------------

test('restaurant owner adds restaurant', async ({ page }) => {
  await login(page);
  await goToMyRestaurants(page);

  await page.getByTestId('add-restaurant-btn').click();
  await expect(page.getByText('Add Restaurant')).toBeVisible();

  await page.getByLabel('Name:').fill(restaurantName);
  await page.getByLabel('Address:').fill(
    'PGPM+QM8 iCanteen คณะวิศวกรรมศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย Pathum Wan, Bangkok 10330'
  );
  await page.getByLabel('Tel:').fill('0896631981');

  await page.locator('#openTime').fill('08:00');
  await page.locator('#closeTime').fill('15:00');

  await page.getByLabel('Add Photo').fill(
    'https://img.wongnai.com/p/1920x0/2023/09/03/d2cd4f2d1bfa4c5da586ba6dc14f7a2f.jpg'
  );

  await page.getByRole('button', { name: /submit/i }).click();
});

test('restaurant owner view their restaurant', async ({ page }) => {
  await login(page);
  await goToMyRestaurants(page);

  const card = getCard(page);
  await expect(card).toBeVisible(); // ✅ กัน flaky

  await Promise.all([
    page.waitForURL(/\/restaurants\/[^/]+$/),
    card.getByRole('button', { name: /see more/i }).click(),
  ]);

  await expect(page).toHaveURL(/\/restaurants\/[^/]+$/);
  await expect(page.getByText(restaurantName)).toBeVisible();

  await expect(page.getByRole('link', { name: /edit/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /delete/i })).toBeVisible();
});

test('restaurant owner edit their restaurant', async ({ page }) => {
  await login(page);
  await goToMyRestaurants(page);

  const card = getCard(page);
  await expect(card).toBeVisible(); // ✅ สำคัญมาก

  await Promise.all([
    page.waitForURL(/\/restaurants\/[^/]+$/),
    card.getByRole('button', { name: /see more/i }).click(),
  ]);

  await expect(page).toHaveURL(/\/restaurants\/[^/]+$/);
  await expect(page.getByText(restaurantName)).toBeVisible();

  await page.getByRole('link', { name: /edit/i }).click();
  await expect(page).toHaveURL(/\/restaurants\/[^/]+\/edit$/);

  await expect(page.getByLabel('Name')).toHaveValue(restaurantName);
  await expect(page.getByLabel('Address')).toHaveValue(
    'PGPM+QM8 iCanteen คณะวิศวกรรมศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย Pathum Wan, Bangkok 10330'
  );
  await expect(page.getByLabel('Tel')).toHaveValue('0896631981');

  await page.locator('#tel').fill('0891234567');
  await page.getByRole('button', { name: /save/i }).click();

  await page.waitForURL(/\/restaurants\/[^/]+$/);
  await page.getByRole('link', { name: /edit/i }).click();

  await expect(page.getByLabel('Tel')).toHaveValue('0891234567');
});

test('restaurant owner delete their restaurant', async ({ page }) => {
  await login(page);
  await goToMyRestaurants(page);

  const card = getCard(page);
  await expect(card).toBeVisible(); // ✅ กัน undefined click

  await Promise.all([
    page.waitForURL(/\/restaurants\/[^/]+$/),
    card.getByRole('button', { name: /see more/i }).click(),
  ]);

  await expect(page).toHaveURL(/\/restaurants\/[^/]+$/);
  await expect(page.getByText(restaurantName)).toBeVisible();

  await page.getByRole('button', { name: /delete/i }).click();
  await page.getByRole('button', { name: /continue/i }).click();

  await page.waitForURL(/yourRestaurants/);
  await expect(page).toHaveURL(/yourRestaurants/);

  await expect(getCard(page)).toHaveCount(0);
});