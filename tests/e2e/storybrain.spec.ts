import { test, expect, Page } from '@playwright/test';
import { newNovel, TOKEN } from './helpers';

const nav = (p: Page) => p.getByRole('navigation', { name: 'Views' });

async function selectText(page: Page, phrase: string) {
  await page.evaluate((phrase) => {
    for (const box of Array.from(document.querySelectorAll('[data-turn]'))) {
      const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
      let n: Node | null;
      while ((n = walker.nextNode())) {
        const i = (n.textContent ?? '').indexOf(phrase);
        if (i >= 0) {
          const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + phrase.length);
          const s = window.getSelection()!; s.removeAllRanges(); s.addRange(r);
          box.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
          return;
        }
      }
    }
    throw new Error('phrase not found: ' + phrase);
  }, phrase);
}

const EXPORT = `### YOLANDA | 2026-10-14 21:05 ET | text

Let's start with Kevin. If you were to write Kevin's last page of the novel in one line, who is he now?

### CHATGPT | 2026-10-14 21:06 ET | text

His wife might say: "First of all, I don't appreciate the implication."

What if Kevin keeps a notebook of 17 violations?

### YOLANDA | 2026-10-14 21:11 ET | text

I'm keeping that for the book!  Anthony would be a notebook wielding fool too!
`;

test('a character holds competing possibilities, decisions with history, and identity that is never assumed (R-A-023, R-A-027, R-A-071)', async ({ page }) => {
  await newNovel(page, 'Brain One');
  await nav(page).getByRole('button', { name: 'Story Brain' }).click();
  await page.getByRole('button', { name: /^Characters/ }).click();
  await page.getByLabel('New Character').fill('Kevin Wickley');
  await page.getByRole('button', { name: 'Add character' }).click();
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Kevin Wickley');
  await expect(page.getByText('Not yet specified').first()).toBeVisible();

  await page.getByRole('button', { name: 'Add an arc' }).click();
  await page.getByRole('button', { name: /Kevin Wickley: arc 1/ }).click();
  const lie = page.locator('div').filter({ has: page.getByText('Lie', { exact: true }) }).last();
  for (const v of ['If I let my guard down, I could lose everything again.', 'If I am not in control, everything I have worked for can be taken away.']) {
    await page.locator('strong', { hasText: /^Lie$/ }).locator('..').getByRole('button', { name: 'Add' }).click();
    await page.getByRole('textbox', { name: 'Lie', exact: true }).fill(v);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText(v)).toBeVisible();
  }
  void lie;
  // Neither is decided; deciding one keeps the other beside it.
  await page.getByText('If I let my guard down').locator('..').getByRole('button', { name: 'Decide this' }).click();
  await expect(page.locator('.st[data-s="established"]', { hasText: 'If I let my guard down' })).toBeVisible();
  await expect(page.locator('.st[data-s="developing"]', { hasText: 'If I am not in control' })).toBeVisible();
  await page.getByRole('button', { name: /Back to Kevin Wickley/ }).click();
  await expect(page.locator('.st[data-s="established"]', { hasText: 'If I let my guard down' })).toBeVisible();

  await page.getByRole('textbox', { name: 'Add a guardrail' }).fill('Kevin is never written as a fool; the comedy is his pride, not his intelligence.');
  await page.getByRole('textbox', { name: 'Add a guardrail' }).press('Enter');
  await expect(page.getByText('never written as a fool')).toBeVisible();
});

test('a conversation comes in word for word; a line is kept in one action and harvested (R-A-054 to R-A-056)', async ({ page }) => {
  await newNovel(page, 'Brain Two');
  await nav(page).getByRole('button', { name: 'Conversations' }).click();
  await page.getByRole('button', { name: 'Bring in a conversation' }).click();
  await page.getByLabel('Name').fill('Kevin, 10-14 evening');
  await page.getByLabel('The conversation').fill(EXPORT);
  await page.getByRole('button', { name: 'Bring it in' }).click();
  await expect(page.getByRole('status')).toContainText('Everything was kept. 3 messages (2 from you)');
  await page.getByRole('button', { name: 'Open it' }).click();
  await expect(page.getByText('Anthony would be a notebook wielding fool too!')).toBeVisible();

  await selectText(page, '"First of all, I don\'t appreciate the implication."');
  await page.getByRole('button', { name: 'Keep this line' }).click();
  await expect(page.locator('mark[data-kind="keep"]')).toHaveText('"First of all, I don\'t appreciate the implication."');

  await selectText(page, 'What if Kevin keeps a notebook of 17 violations?');
  await page.getByRole('button', { name: "It's a question" }).click();

  await page.getByRole('button', { name: 'Harvest' }).click();
  await expect(page.getByRole('heading', { name: 'Lines you kept' }).locator('..')).toContainText("I don't appreciate the implication");
  await expect(page.getByRole('heading', { name: 'New questions' }).locator('..')).toContainText('17 violations');
  await page.getByRole('button', { name: 'Done', exact: true }).click();

  // The question the assistant raised waits apart from hers.
  await nav(page).getByRole('button', { name: 'Story Brain' }).click();
  await page.getByRole('button', { name: /^Questions and ideas/ }).click();
  await expect(page.getByRole('heading', { name: 'Questions the assistant raised' })).toBeVisible();
  await page.getByRole('button', { name: 'Make it one of my questions' }).click();
  await expect(page.getByRole('heading', { name: 'Questions the assistant raised' })).toHaveCount(0);

  // The kept line knows where it came from.
  await page.getByRole('button', { name: /^Kept lines/ }).click();
  await page.getByRole('button', { name: /First of all/ }).click();
  await expect(page.getByText('Written by the assistant, kept by you, placement open')).toBeVisible();
  await page.getByRole('button', { name: 'Where did this come from?' }).click();
  await expect(page.getByRole('dialog')).toContainText('Kevin, 10-14 evening, message 2, CHATGPT');
});

test('she can add a kind of element the program never defined, with her own fields (R-A-109)', async ({ page }) => {
  await newNovel(page, 'Brain Three');
  await nav(page).getByRole('button', { name: 'Story Brain' }).click();
  await page.getByLabel('Add your own kind').fill('Running gag');
  await page.getByRole('button', { name: 'Add kind' }).click();
  await expect(page.getByRole('heading', { name: 'Running gags' })).toBeVisible();
  await page.getByLabel('New Running gag').fill('Christine the cursed car');
  await page.getByRole('button', { name: 'Add running gag' }).click();
  await page.getByLabel('New field name').fill('How it escalates');
  await page.getByRole('button', { name: 'Add field' }).click();
  await page.locator('strong', { hasText: 'How it escalates' }).locator('..').getByRole('button', { name: 'Add' }).click();
  await page.getByRole('textbox', { name: 'How it escalates' }).fill('Each time it stalls, Kevin talks to it more tenderly.');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('talks to it more tenderly')).toBeVisible();
  await nav(page).getByRole('button', { name: 'Search' }).click();
  await page.getByLabel('Search this novel').fill('more tenderly');
  await expect(page.getByText('1 found')).toBeVisible();
});

test('a suggestion waits until she answers it, and "not yet" keeps it waiting (R-A-024, R-A-060)', async ({ page, request }) => {
  await newNovel(page, 'Brain Four');
  const h = { 'x-studio-token': TOKEN, 'content-type': 'application/json' };
  const projects = await (await request.get('/api/projects', { headers: h })).json();
  const pid = projects.find((p: any) => p.title === 'Brain Four').id;
  const anthony = await (await request.post(`/api/projects/${pid}/elements`, { headers: h, data: { kind: 'character', title: 'Anthony Vernon' } })).json();
  await request.post(`/api/projects/${pid}/proposals`, { headers: h, data: { origin: 'assistant', kind: 'statement', target: { elementId: anthony.id, field: 'humor' }, after: { value: 'Expressive, physical, the epitome of code-switching' } } });
  await nav(page).getByRole('button', { name: 'Story Brain' }).click();
  await page.getByRole('button', { name: /^Suggestions waiting 1/ }).click();
  await page.getByRole('button', { name: 'Not yet' }).click();
  await page.getByRole('button', { name: /^Characters/ }).click();
  await page.getByRole('button', { name: 'Anthony Vernon' }).click();
  await expect(page.getByText('you said not yet')).toBeVisible();
  await page.getByRole('button', { name: 'Accept as Decided' }).click();
  await expect(page.locator('.st[data-s="established"]', { hasText: 'code-switching' })).toContainText('suggested by the assistant');
  await expect(page.locator('.st[data-s="established"]', { hasText: 'code-switching' })).toContainText('accepted by you');
});
