const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');const root=path.resolve(__dirname,'../..');
for(const width of [320,390,768,1024,1440])test(`Explorar VIZU ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname!=='vizu.test')return route.abort();const file=path.resolve(root,'.'+u.pathname);if(!file.startsWith(root+path.sep)||!fs.existsSync(file))return route.abort();return route.fulfill({path:file});});
 await page.goto('https://vizu.test/explorar.html');await expect(page.locator('.vx-card')).toHaveCount(6);await expect(page.locator('.vx-disclaimer')).toContainText('Não são perfis reais');
 await page.locator('[name=city]').fill('Recife');await page.locator('#categories [data-category=unhas]').click();await expect(page.locator('.vx-card')).toHaveCount(1);await expect(page.locator('.vx-card a')).toHaveAttribute('href',/location=Recife/);
 await page.locator('#clear-discovery').click();await expect(page.locator('.vx-card')).toHaveCount(6);
 await page.locator('[name=query]').fill('inexistente');await page.locator('#discover-form button').click();await expect(page.locator('.vx-empty')).toBeVisible();
 await page.locator('#clear-discovery').click();await page.locator('#vx-motion').click();await expect(page.locator('html')).toHaveClass(/vx-paused/);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);expect(errors).toEqual([]);await page.screenshot({path:`test-results/explore-vizu-${width}.png`,fullPage:true});
});
