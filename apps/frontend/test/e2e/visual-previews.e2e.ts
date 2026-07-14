import {expect,test} from '@playwright/test';

const wineryId='22222222-2222-4222-8222-222222222222';

test('genera las primeras vistas públicas de Teralya',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});
  const previews=[
    {path:'/',heading:'Descubre las bodegas que están construyendo Teralya.',file:'01-portada.png'},
    {path:'/vinos',heading:'Vinos con origen',file:'02-catalogo-vinos.png'},
    {path:'/bodegas',heading:'Bodegas de Teralya',file:'03-bodegas.png'},
    {path:`/bodegas/${wineryId}`,heading:'Bodega Determinista',file:'04-ficha-bodega.png'},
  ] as const;
  for(const preview of previews){
    await page.goto(preview.path);
    await expect(page.getByRole('heading',{name:preview.heading,exact:true})).toBeVisible();
    await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
    await page.screenshot({path:`visual-previews/${preview.file}`,fullPage:true});
  }
});
