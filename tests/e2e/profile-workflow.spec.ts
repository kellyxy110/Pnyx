import { authenticatedVerificationTarget } from "../../src/lib/disposable-verification";
import { assertVerifiedApplication } from "../support/verified-application";
import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
const enabled = Boolean(authenticatedVerificationTarget(process.env));
async function signIn(page:Page){await page.goto('/sign-in');await page.getByLabel('Email',{exact:true}).fill(process.env.E2E_EMAIL!);await page.getByLabel('Password',{exact:true}).fill(process.env.E2E_PASSWORD!);await page.getByRole('button',{name:'Sign in to Pnyx'}).click();await expect(page).toHaveURL(/\/profile/);await expect(page.getByRole('button',{name:'Edit profile',exact:true})).toBeVisible();}
test.describe('disposable profile and author workflows',()=>{
 test.skip(!enabled,'Requires positively verified disposable fixtures.');
 test.beforeAll(async({request})=>{if(enabled)await assertVerifiedApplication(request);});
 test('failed profile saves retain edits, release controls, and recover',async({page})=>{
  await signIn(page);await page.getByRole('button',{name:'Edit profile',exact:true}).click();
  const bio=page.getByRole('textbox',{name:'Bio',exact:true});await bio.fill('Edits retained through a connection failure.');let fail=true;
  await page.route('**/api/account/profile',route=>route.request().method()==='PATCH'&&fail?route.abort('failed'):route.continue());
  await page.getByRole('button',{name:'Save profile',exact:true}).click();await expect(page.locator('.profile-message.error')).toContainText('edits are still here');
  await expect(page.getByRole('button',{name:'Save profile',exact:true})).toBeEnabled();await expect(bio).toHaveValue('Edits retained through a connection failure.');
  fail=false;await page.getByRole('button',{name:'Save profile',exact:true}).click();await expect(page.locator('.profile-message.success')).toContainText('Profile saved.');
 });
 test('cancel discards unsaved changes and additional links render after save',async({page})=>{
  await signIn(page);await page.getByRole('button',{name:'Edit profile',exact:true}).click();const field=page.getByLabel('Display name',{exact:true});const original=await field.inputValue();
  await field.fill('Unsaved temporary name');await page.getByRole('button',{name:'Cancel editing'}).click();await expect(page.getByRole('heading',{name:original,exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Edit profile',exact:true}).click();await expect(field).toHaveValue(original);
  const username=await page.getByLabel('Username',{exact:false}).inputValue();await page.getByRole('textbox',{name:'Additional links',exact:true}).fill('https://example.test/profile-notes');
  await page.getByRole('button',{name:'Save profile',exact:true}).click();await expect(page.locator('.profile-message.success')).toContainText('Profile saved.');await page.getByRole('button',{name:'Cancel editing'}).click();
  await expect(page.locator('a[href="https://example.test/profile-notes"]')).toBeVisible();await page.goto(`/people/${username}`);await expect(page.locator('a[href="https://example.test/profile-notes"]')).toBeVisible();
 });
 test('stored media is rendered directly without a remote image optimizer failure',async({page})=>{
  await signIn(page);const fixture=await readFile('public/brand/pnyx-mark.svg');
  await page.route('https://media.example.test/avatar.webp',route=>route.fulfill({body:fixture,contentType:'image/svg+xml'}));
  await page.route('**/api/account/profile',async route=>{if(route.request().method()!=='GET')return route.continue();const response=await route.fetch();const data=await response.json();return route.fulfill({json:{...data,avatarUrl:'https://media.example.test/avatar.webp'}});});
  await page.reload();const avatar=page.locator('img.profile-avatar');await expect(avatar).toHaveAttribute('src','https://media.example.test/avatar.webp');await expect.poll(()=>avatar.evaluate((image:HTMLImageElement)=>image.naturalWidth)).toBeGreaterThan(0);
 });
 test('profile drafts reopen in the composer, retain text on failure, and publish explicitly',async({page,request})=>{
  await signIn(page);const title=`Browser draft ${Date.now()}`;const data={spaceSlug:'web',type:'QUESTION',title,body:'A disposable question with enough context.',visibility:'PUBLIC',isDraft:true};
  const response=await page.request.post('/api/posts',{data});expect(response.status()).toBe(201);const id=(await response.json()).post.id;
  try {
   await page.reload();await page.locator(`a[href="/feed?draft=${id}#composer"]`).first().click();await expect(page.getByLabel('Title',{exact:true})).toHaveValue(title);await expect(page.getByRole('textbox',{name:'Body',exact:true})).toHaveValue(data.body);
   await page.getByLabel('Title',{exact:true}).fill(title+' revised');await expect.poll(async()=>((await (await page.request.get(`/api/posts/${id}`)).json()).post.title)).toBe(title+' revised');
   await page.route(`**/api/posts/${id}`,route=>route.request().method()==='PATCH'&&!route.request().postDataJSON().isDraft?route.abort('failed'):route.continue());
   await page.getByRole('button',{name:'Publish draft',exact:true}).click();await expect(page.locator('.composer-message')).toContainText('could not be confirmed');await expect(page.getByLabel('Title',{exact:true})).toHaveValue(title+' revised');await expect(page.getByRole('button',{name:'Publish draft',exact:true})).toBeEnabled();
   await page.unroute(`**/api/posts/${id}`);await page.getByRole('button',{name:'Publish draft',exact:true}).click();await expect(page).toHaveURL(new RegExp(`/posts/${id}$`));expect((await request.get(`/api/posts/${id}`)).status()).toBe(200);
  } finally {await page.unroute(`**/api/posts/${id}`);await page.request.delete(`/api/posts/${id}`);}
 });
 test('knowledge creation retains writing after network failure and reports unavailable AI honestly',async({page})=>{
  await signIn(page);await page.goto('/knowledge/new');await page.getByLabel('Title',{exact:true}).fill('A retained knowledge draft');await page.getByRole('textbox',{name:'Body',exact:true}).fill('Writing should remain after a connection failure.');
  await page.route('**/api/artifacts',route=>route.request().method()==='POST'?route.abort('failed'):route.continue());await page.getByRole('button',{name:'Save draft',exact:true}).click();await expect(page.getByRole('status')).toContainText('writing is still here');await expect(page.getByRole('button',{name:'Save draft',exact:true})).toBeEnabled();
  await page.getByPlaceholder('Paste a discussion link, e.g. https://pnyx.app/posts/…').fill('/posts/cfixture123456789012345678');await page.route('**/api/ai/draft',route=>route.fulfill({json:{text:null,status:'DISABLED',message:'AI drafting is unavailable in this fixture.'}}));await page.getByRole('button',{name:'Assist from linked discussion'}).click();await expect(page.getByRole('status')).toContainText('unavailable');await expect(page.getByRole('textbox',{name:'Body',exact:true})).toHaveValue('Writing should remain after a connection failure.');
 });
});
