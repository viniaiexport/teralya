import { expect, test } from "@playwright/test";

async function login(
  page: import("@playwright/test").Page,
  email: string,
): Promise<void> {
  await page.goto("/acceso");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill("correcta-1234");
  await page.getByRole("button", { name: "Entrar" }).click();
}

test("navega del inicio al catálogo y conserva filtros", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  await expect(page.locator("main")).toHaveCount(1);
  await expect(
    page.getByRole("heading", {
      name: "Descubre las bodegas que están construyendo Teralya.",
    }),
  ).toBeVisible();
  await page
    .locator(".hero-actions")
    .getByRole("link", { name: "Explorar vinos" })
    .click();
  await expect(page.locator("main")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Vinos con origen" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Reserva E2E" }),
  ).toBeVisible();
  await page.getByLabel("Región").fill("Rioja");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(page).toHaveURL(/region=Rioja/);
  await expect(page.getByText("1 vino encontrado")).toBeVisible();
});

test("descubre una bodega pública y sus vinos", async ({ page }) => {
  await page.goto("/bodegas");
  await expect(
    page.getByRole("heading", { name: "Bodegas de Teralya" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Bodega Determinista" }).click();
  await expect(
    page.getByRole("heading", { name: "Bodega Determinista", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Nuestra historia" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Vinos de Bodega Determinista" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Reserva E2E" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Condiciones de envío de la bodega" }),
  ).toBeVisible();
  await expect(page.getByText("ES, FR, DE")).toBeVisible();
});

test("mantiene un único contenido principal en los registros", async ({ page }) => {
  for (const path of ["/registro", "/registro/bodega"]) {
    await page.goto(path);
    await expect(page.locator("main")).toHaveCount(1);
  }
});

test("redirige el acceso administrativo sin sesión", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/acceso$/);
  await expect(
    page.getByRole("heading", { name: "Acceso a Teralya" }),
  ).toBeVisible();
});

test("inicia sesión como administrador y muestra solo métricas MVP", async ({
  page,
}) => {
  await login(page, "admin@teralya.test");
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.locator("main")).toHaveCount(1);
  await expect(
    page.getByRole("link", { name: "Saltar al contenido" }),
  ).toHaveAttribute("href", "#main-content");
  await expect(
    page.getByRole("heading", { name: "Operación de hoy" }),
  ).toBeVisible();
  const metrics = page.locator(".admin-metric");
  await expect(metrics.nth(0)).toContainText("185,00");
  await expect(metrics.nth(1)).toContainText("Pedidos pendientes");
  await expect(metrics.nth(1)).toContainText("3");
});

test("entra como comprador y cancela un pedido propio de forma directa", async ({
  page,
}) => {
  await login(page, "comprador@teralya.test");
  await expect(page).toHaveURL(/\/cuenta$/);
  await expect(page.getByRole("heading", { name: "Mi cuenta" })).toBeVisible();
  await page.getByRole("link", { name: "Ver mis pedidos" }).click();
  await expect(page.locator("main")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Pedido TER-E2E-0001" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Ver detalle" }).click();
  await expect(page.locator("main")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Pedido TER-E2E-0001" }),
  ).toBeVisible();
  const cancelButton = page.getByRole("button", { name: "Cancelar pedido" });
  if (await cancelButton.count()) {
    await page.getByLabel("Confirmo que deseo cancelar este pedido.").check();
    page.once("dialog", (dialog) => dialog.accept());
    await Promise.all([
      page.waitForURL(/cancelacion=completada/),
      cancelButton.click(),
    ]);
  }
  await expect(
    page.getByText(
      "El pedido está cancelado y el reembolso ha sido confirmado.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Cancelar pedido" }),
  ).toHaveCount(0);
});

test("entra como bodega y actualiza su perfil propio", async ({ page }) => {
  await login(page, "bodega@teralya.test");
  await expect(page).toHaveURL(/\/bodega$/);
  await expect(page.locator("main")).toHaveCount(1);
  await expect(
    page.getByRole("link", { name: "Saltar al contenido" }),
  ).toHaveAttribute("href", "#main-content");
  await expect(
    page.getByRole("heading", { name: "Panel de bodega" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Editar perfil" }).click();
  await expect(
    page.getByRole("heading", { name: "Perfil de Bodega Determinista" }),
  ).toBeVisible();
  await page.getByLabel("Región").fill("Ribera del Duero");
  await page.getByLabel("Países de envío").fill("ES, FR, DE");
  await page
    .getByRole("button", { name: "Guardar perfil y condiciones" })
    .click();
  await expect(
    page.getByText("Perfil y condiciones de envío actualizados."),
  ).toBeVisible();
});
