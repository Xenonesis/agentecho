import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
await page.goto('https://xenonesis.github.io/Pinmark/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

const audit = (theme) => {
  const html = document.documentElement;
  html.dataset.theme = theme;
  return new Promise(r => setTimeout(() => r(auditColors()), 100));
};

const auditColors = () => {
  const issues = [];
  const knownVars = new Set([
    'transparent', 'inherit', 'currentcolor', 'initial', 'unset', 'none', 'auto',
    '--bg', '--bg-elev', '--ink', '--ink-mid', '--muted', '--line', '--line-strong',
    '--accent', '--accent-soft', '--marker', '--marker-soft',
    '--code-bg', '--code-ink', '--code-muted', '--code-accent',
    '--code-green', '--code-yellow', '--code-red', '--max'
  ]);
  
  document.querySelectorAll('*').forEach(el => {
    const cs = getComputedStyle(el);
    const props = ['color', 'background-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'fill', 'stroke'];
    props.forEach(prop => {
      const val = cs.getPropertyValue(prop).trim();
      if (!val || val === 'rgba(0, 0, 0, 0)') return;
      // Check if it's a hex/rgb that doesn't match a var
      if (val.match(/^(#[0-9a-f]{3,8}|rgb|rgba)/i) && !val.includes('var(')) {
        // ignore color-mix fallbacks if any
        const sel = el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + (el.className.split(' ')[0] || '') : '');
        issues.push({ sel: sel.slice(0, 40), prop, val: val.slice(0, 50) });
      }
    });
  });
  return issues.slice(0, 50);
};

console.log('=== LIGHT MODE HARDCODED COLORS ===');
console.log(JSON.stringify(await page.evaluate(audit, 'light'), null, 2));

console.log('\n=== DARK MODE HARDCODED COLORS ===');
console.log(JSON.stringify(await page.evaluate(audit, 'dark'), null, 2));

await browser.close();
