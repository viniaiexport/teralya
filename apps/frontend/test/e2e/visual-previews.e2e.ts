import {expect,test} from '@playwright/test';

const wineId='11111111-1111-4111-8111-111111111111';
const wineryId='22222222-2222-4222-8222-222222222222';

test('genera las primeras vistas públicas de Teralya',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});
  const previews=[
    {path:'/',heading:'El vino que eliges. La historia que recibes.',file:'01-portada.png'},
    {path:'/vinos',heading:'Vinos con origen',file:'02-catalogo-vinos.png'},
    {path:`/vinos/${wineId}`,heading:'Reserva E2E',file:'03-ficha-vino.png'},
    {path:'/bodegas',heading:'Bodegas de Teralya',file:'04-bodegas.png'},
    {path:`/bodegas/${wineryId}`,heading:'Bodega Determinista',file:'05-ficha-bodega.png'},
    {path:'/para-bodegas',heading:'Tu bodega merece vender por su nombre.',file:'06-para-bodegas.png'},
  ] as const;
  for(const preview of previews){
    await page.goto(preview.path);
    await expect(page.getByRole('heading',{name:preview.heading,exact:true})).toBeVisible();
    await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
    await page.screenshot({path:`visual-previews/${preview.file}`,fullPage:true});
  }
});

test('publica un sitemap con catálogo y bodegas',async({request})=>{
  const response=await request.get('/sitemap.xml');
  expect(response.ok()).toBe(true);
  const xml=await response.text();
  expect(xml).toContain(`/vinos/${wineId}`);
  expect(xml).toContain(`/bodegas/${wineryId}`);
  expect(xml).toContain('/para-bodegas');
});

test('la portada no desborda ni depende de un vídeo externo en móvil',async({page})=>{
  await page.setViewportSize({width:393,height:852});
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'El vino que eliges. La historia que recibes.',exact:true})).toBeVisible();
  await expect(page.locator('.premium-film-media video')).toHaveCount(0);
  const viewport=await page.evaluate(()=>({
    clientWidth:document.documentElement.clientWidth,
    scrollWidth:document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
});

test('detecta el idioma y permite cambiarlo sin alterar la ruta',async({page,context})=>{
  await context.addCookies([{name:'teralya_locale',value:'de',domain:'127.0.0.1',path:'/'}]);
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'Der Wein, den Sie wählen. Die Geschichte, die Sie erhalten.',exact:true})).toBeVisible();
  await page.getByLabel('Sprache').selectOption('fr');
  await expect(page.getByRole('heading',{name:'Le vin que vous choisissez. L’histoire que vous recevez.',exact:true})).toBeVisible();
  await expect(page).toHaveURL('http://127.0.0.1:3000/');
});
