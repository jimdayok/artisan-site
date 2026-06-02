import { test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.join(process.cwd(), 'docs/qa-screenshots-2026-06-01/validation-pass');
fs.mkdirSync(outDir, { recursive: true });
const reportPath = path.join(outDir, 'validation-evidence.json');
const report: any = { generatedAt: new Date().toISOString(), checks: {} };

const base = 'http://localhost:3000';
const canonical = (code: string) => code==='G5'?'G6':code==='P5'?'P6':code==='A5'?'A6':code;
const accounts = JSON.parse(fs.readFileSync(path.join(process.cwd(),'private-source/portal/dashboard-v1/current/accounts_index.json'),'utf8'));
function accountData(acct:string){
  const row = accounts.find((a:any)=>String(a.account_id).toUpperCase()===acct.toUpperCase());
  const assigned = Array.isArray(row?.price_lists)?row.price_lists:[];
  const effective=[...new Set(assigned.map(canonical))].sort();
  const visible=[...new Set([...effective,'M5','Y5'])].sort();
  return { acctId: row?.account_id, businessName: row?.business_name, assigned, effective, expectedVisible: visible };
}

function setDevCookie(context:any, email:string){
  return context.addCookies([{name:'portal_dev_email', value: encodeURIComponent(email), domain:'localhost', path:'/'}]);
}

test('validation pass', async ({ browser }) => {
  // customer visibility single
  for (const sample of [
    { email:'alicia@artisanopticaldenver.com', acct:'10019-DEN', label:'single' },
    { email:'028opticians@wilsoneyecenter.com', acct:'4167-PDX', label:'multi' },
  ]) {
    const context = await browser.newContext({ viewport: { width: 1720, height: 1200 } });
    await setDevCookie(context, sample.email);
    const page = await context.newPage();
    await page.goto(`${base}/portal/price-list/g6?account=${encodeURIComponent(sample.acct)}`);
    await page.waitForTimeout(1500);
    const nav = await page.locator('section:has-text("Available Price Lists") a').allTextContents();
    await page.screenshot({ path: path.join(outDir, `nav-${sample.label}-${sample.acct}.png`), fullPage: true });
    const data = accountData(sample.acct);
    report.checks[`nav_${sample.label}`] = {
      sample,
      account: data,
      navTexts: nav,
      unexpectedVisible: nav.filter((t:string)=>!data.expectedVisible.some((c:string)=>t.includes(c))),
    };
    await context.close();
  }

  // BPY + mirrors + logos + reference on G6
  {
    const context = await browser.newContext({ viewport: { width: 1720, height: 1200 } });
    await setDevCookie(context, 'alicia@artisanopticaldenver.com');
    const page = await context.newPage();
    await page.goto(`${base}/portal/price-list/g6?account=10019-DEN`);
    await page.waitForTimeout(2000);

    // expand first builder for BPY test
    const buildBtn = page.locator('button:has-text("Build Price")').first();
    await buildBtn.click();
    await page.waitForTimeout(800);

    const materialSelect = page.locator('label:has-text("Material") select').first();
    const beforeOptions = await materialSelect.locator('option').allTextContents();
    await page.screenshot({ path: path.join(outDir, 'bpy-before.png'), fullPage: true });

    const blueBtn = page.locator('button:has-text("Enable Blue Light Material")').first();
    await blueBtn.click();
    await page.waitForTimeout(800);
    const afterOptions = await materialSelect.locator('option').allTextContents();
    await page.screenshot({ path: path.join(outDir, 'bpy-after.png'), fullPage: true });

    report.checks.bpy_ui = {
      beforeOptionCount: beforeOptions.length,
      afterOptionCount: afterOptions.length,
      beforeOptions,
      afterOptions,
      hasBPYAfter: afterOptions.some((v:string)=>v.toUpperCase().includes('BPY')),
      hasBPYBefore: beforeOptions.some((v:string)=>v.toUpperCase().includes('BPY')),
    };

    await page.locator('#mirror-treatments').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, 'g6-mirror.png'), fullPage: true });
    const mirrorText = await page.locator('#mirror-treatments').textContent();
    report.checks.mirror = {
      hasMirrorCoatingsHeading: /Mirror Coatings/i.test(mirrorText||''),
      hasMirrorMatched: /Mirror Matched/i.test(mirrorText||''),
      hasGradientMirror: /Gradient Mirror/i.test(mirrorText||''),
      hasColoredMirrors: /Colored Mirrors/i.test(mirrorText||''),
      rawCodeVisible: /\b(MMI|GMR|RSM|RDM|PKM|ORM|BKM|BLM|CHM|CHR|CAM|FSM|FGM|FMR|GDM|GRM|MIR|RGM|SEM|SLM)\b/.test(mirrorText||''),
    };

    await page.locator('section:has-text("Reference Key")').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, 'g6-reference-key.png'), fullPage: true });
    const ref = await page.locator('section:has-text("Reference Key")').textContent();
    report.checks.reference = {
      renderedAbbreviations: [...new Set((ref||'').match(/\b(SV|ESV|MF|OCP|PAL|OCU)\b/g) || [])],
      hasESV: /\bESV\b/.test(ref||''),
      hasOCU: /\bOCU\b/.test(ref||''),
    };

    const srcs = await page.locator('img').evaluateAll((imgs)=>imgs.map((i)=>i.getAttribute('src')||''));
    report.checks.logos = {
      hasArtisanTransparentRings: srcs.some((s)=>s.includes('/rings.png')),
      hasNewtonSvg: srcs.some((s)=>s.includes('/logos/newton.svg')),
      hasVariluxLogo: srcs.some((s)=>s.includes('/varilux-logo.png')),
      hasHoyaLogo: srcs.some((s)=>s.includes('/hoya-logo.png')),
      hasShamirLogo: srcs.some((s)=>s.includes('/shamir-logo.png')),
      hasTokaiLogo: srcs.some((s)=>s.includes('/tokai-logo.png')),
      hasCrizalLogo: srcs.some((s)=>s.toLowerCase().includes('crizal')),
    };

    await context.close();
  }

  // E5 design types
  {
    const context = await browser.newContext({ viewport: { width: 1720, height: 1200 } });
    await setDevCookie(context, 'alicia@artisanopticaldenver.com');
    const page = await context.newPage();
    await page.goto(`${base}/portal/price-list/e5?account=10019-DEN`);
    await page.waitForTimeout(1800);
    await page.screenshot({ path: path.join(outDir, 'e5-design-types.png'), fullPage: true });
    const rows = await page.locator('tr').allTextContents();
    report.checks.e5 = {
      matchedRows: rows.filter((r)=>/Diamond Series|Platinum Series|Gold Series|CFB/.test(r)).slice(0,20),
      anySingleVisionForCore: rows.some((r)=>/Single Vision/.test(r) && /Diamond Series|Platinum Series|Gold Series|CFB/.test(r)),
    };
    await context.close();
  }

  // M5 tiers
  {
    const context = await browser.newContext({ viewport: { width: 1720, height: 1200 } });
    await setDevCookie(context, 'alicia@artisanopticaldenver.com');
    const page = await context.newPage();
    await page.goto(`${base}/portal/price-list/m5?account=10019-DEN`);
    await page.waitForTimeout(1800);
    await page.locator('section:has-text("Modern Frame System Package Tiers")').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, 'm5-tiers.png'), fullPage: true });
    const body = await page.locator('body').textContent();
    report.checks.m5 = {
      hasSection: /Modern Frame System Package Tiers/.test(body||''),
      hasAllRows: ['Green Group','Lime Group','Blue Group','Red Group','Yellow Group','Black Diamond'].every(v=>(body||'').includes(v)),
      hasPrices: ['$8','$24','$29','$33'].every(v=>(body||'').includes(v)),
    };
    await context.close();
  }

  fs.writeFileSync(reportPath, JSON.stringify(report,null,2));
});
