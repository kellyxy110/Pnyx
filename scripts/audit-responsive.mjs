import { chromium } from 'playwright';

const baseURL = process.env.PNYX_AUDIT_URL ?? 'http://127.0.0.1:3000';
const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
const widths = [320,360,375,390,412,430,768,1024,1280,1440,1920];
const routes = ['/', '/sign-in', '/sign-up', '/spaces', '/explore', '/knowledge', '/ai'];
const browser = await chromium.launch({ headless:true, ...(executablePath ? { executablePath } : {}) });
const results = [];
try {
  for (const width of widths) {
    const context = await browser.newContext({ viewport:{ width, height:844 }, reducedMotion:'reduce' });
    try {
      for (const route of routes) {
        const page = await context.newPage();
        try {
          const response = await page.goto(new URL(route, baseURL).href, {waitUntil:'domcontentloaded',timeout:30000});
          const data = await page.evaluate(() => {
            const main = document.querySelector('main');
            const nav = document.querySelector('.shell-mobile-nav');
            const visible = nav && getComputedStyle(nav).display !== 'none';
            const nr = visible ? nav.getBoundingClientRect() : null;
            const vw = document.documentElement.clientWidth;
            return {
              overflow: document.documentElement.scrollWidth > vw + 1,
              main: Boolean(main),
              mobileNavVisible: Boolean(visible),
              navOutsideViewport: Boolean(nr && (nr.left < -1 || nr.right > vw + 1 || nr.bottom > window.innerHeight + 1)),
              navLinks: visible ? [...nav.querySelectorAll('a')].map(a => ({label:a.textContent?.trim(),width:Math.round(a.getBoundingClientRect().width)})) : [],
            };
          });
          results.push({width,route,status:response?.status() ?? 0,...data});
        } catch(error) { results.push({width,route,error:String(error)}); }
        finally { await page.close(); }
      }
    } finally { await context.close(); }
  }
} finally { await browser.close(); }
const failures = results.filter(r=>r.error || r.status < 200 || r.status >= 400 || r.overflow || !r.main || r.navOutsideViewport || r.navLinks?.some(x=>x.width<44));
console.log(JSON.stringify({baseURL,total:results.length,passed:results.length-failures.length,failed:failures.length,failures},null,2));
process.exitCode = failures.length ? 1 : 0;
