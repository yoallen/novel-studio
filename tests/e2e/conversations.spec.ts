import { test, expect, Page } from '@playwright/test';
import { newNovel } from './helpers';

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

const TRANSCRIPT = [
  '### YOLANDA | 2026-10-14 09:34 ET | text', '', 'Here is my story bible. Let us talk about the poster.', '',
  '### TOOL (api_tool) | 2026-10-14 09:34 ET | multimodal_text', '', 'Make sure to include fileciteturn0file0L5-L8 in your response.', '[L1] <PARSED TEXT FOR PAGE: 1 / 57>', '',
  '### CHATGPT | 2026-10-14 09:35 ET | reasoning_recap', '', 'Thought for 12 seconds', '',
  '### CHATGPT | 2026-10-14 09:36 ET | text', '', 'Yes, I understand.fileciteturn0file0L981-L1009 Here is how the POV works.', '',
  '### The POV record should include:', '', '| Attribute | What it identifies |', '|---|---|', '',
].join('\n');

test('a planning chat shows only the conversation; tool steps and citation markers stay out of sight but kept (finding 147)', async ({ page }) => {
  await newNovel(page, 'Chat Display');
  await nav(page).getByRole('button', { name: 'Conversations' }).click();
  await page.getByRole('button', { name: 'Bring in a conversation' }).click();
  await page.getByLabel('Name').fill('Story Map Planning');
  await page.getByLabel('The conversation').fill(TRANSCRIPT);
  await page.getByRole('button', { name: 'Bring it in' }).click();
  await expect(page.getByRole('status')).toContainText('Everything was kept. 4 messages');
  await expect(page.getByRole('status')).toContainText('2 of them are behind-the-scenes steps');
  await page.getByRole('button', { name: 'Open it' }).click();

  await expect(page.getByText('2 messages, kept word for word.')).toBeVisible();
  await expect(page.getByText('PARSED TEXT')).toHaveCount(0);
  await expect(page.getByText('TOOL (api_tool)')).toHaveCount(0);
  await expect(page.getByText('Thought for 12 seconds')).toHaveCount(0);
  await expect(page.getByText('filecite')).toBeHidden();
  // The table heading stays part of the reply.
  await expect(page.locator('[data-turn]').nth(1)).toContainText('### The POV record should include:');

  // Selecting words after a hidden marker keeps exactly those words.
  await selectText(page, 'Here is how the POV works.');
  await expect(page.getByRole('button', { name: 'Add as a possibility' })).toBeVisible();
  await page.getByRole('button', { name: 'Keep this line' }).click();
  await expect(page.locator('mark[data-kind="keep"]')).toHaveText('Here is how the POV works.');

  await page.getByRole('button', { name: 'Show them' }).click();
  await expect(page.getByText('Thought for 12 seconds')).toBeVisible();
  await page.getByRole('button', { name: 'Hide them' }).click();

  await page.getByRole('button', { name: 'Harvest' }).click();
  await expect(page.getByText('2 messages between YOLANDA and CHATGPT.')).toBeVisible();
  await expect(page.getByText(/The harvest gathers what you caught/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Lines you kept' }).locator('..')).toContainText('Here is how the POV works.');
  await page.getByRole('button', { name: 'Done, back to conversations' }).click();
  await expect(page.getByText(/2 messages, 1 kept or marked, harvested/)).toBeVisible();
});

test('a new conversation explains each way to ask and groups what it can focus on (findings 150, 151, 154)', async ({ page }) => {
  await newNovel(page, 'Ask Ways');
  await nav(page).getByRole('button', { name: 'Conversations' }).click();
  await page.getByRole('button', { name: 'Start a new one' }).click();
  await expect(page.getByText('From an AI, such as ChatGPT')).toBeVisible();
  await expect(page.getByText(/the assistant/i)).toHaveCount(0);
});
