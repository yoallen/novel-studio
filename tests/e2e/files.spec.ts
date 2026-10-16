import { test, expect, Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { newNovel } from './helpers';
import { toDocx, Book } from '../../src/core/io/writers';

const nav = (p: Page) => p.getByRole('navigation', { name: 'Views' });

function book(): Book {
  return {
    title: 'Driveway', author: 'Y', extras: [],
    chapters: [1, 2].map((n) => ({
      number: n, title: '', heading: n === 2 ? 'Chapter 2: In Which the Dogs Escape' : 'Chapter 1',
      scenes: [
        { title: '', blocks: [{ type: 'p', runs: [{ text: 'Kevin said it was ' }, { text: 'not', i: true }, { text: ` his fault, chapter ${n}.` }] }] },
        { title: '', blocks: [{ type: 'p', runs: [{ text: `Later that night, chapter ${n}.` }] }] },
      ],
    })),
  };
}

test('a Word manuscript comes in after she looks it over, and goes out again as checked plain text (R-B-071, R-B-072, R-B-078)', async ({ page }) => {
  await newNovel(page, 'Import Test');
  await nav(page).getByRole('button', { name: 'Import and export' }).click();
  await page.getByLabel('Chapters of my manuscript').check();
  const data = await toDocx(book(), { sceneBreak: '* * *', sceneTitles: false, titlePage: false, manuscriptFormat: false, chapterOnNewPage: true });
  await page.getByLabel('File to bring in').setInputFiles({ name: 'draft.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', buffer: data });
  await expect(page.getByRole('heading', { name: 'draft.docx' })).toBeVisible();
  await expect(page.getByLabel('Chapter title')).toHaveCount(2);
  await expect(page.getByLabel('Chapter title').nth(1)).toHaveValue('Chapter 2: In Which the Dogs Escape');
  await page.getByRole('button', { name: 'Add these chapters to my novel' }).click();
  await expect(page.getByRole('status')).toContainText('Every character of the accepted text is in the novel.');
  await page.getByRole('button', { name: 'Go to the Writing Room' }).click();
  await expect(page.getByRole('complementary', { name: 'Chapters and scenes' })).toContainText('In Which the Dogs Escape');

  await nav(page).getByRole('button', { name: 'Import and export' }).click();
  await page.getByRole('tab', { name: 'Send something out' }).click();
  await page.getByRole('combobox', { name: 'Format' }).selectOption('txt');
  await expect(page.getByRole('region', { name: 'Before you export' })).toContainText('does not keep italics');
  const dl = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  const file = await dl;
  expect(file.suggestedFilename()).toBe('Import Test.txt');
  const text = readFileSync((await file.path())!, 'utf8');
  expect(text).toContain('Kevin said it was not his fault, chapter 2.');
  await expect(page.getByRole('status').filter({ hasText: 'Import Test.txt' })).toContainText('word for word');
});

test('a planning document keeps her labels; nothing goes in until she says so (R-B-069, R-B-075)', async ({ page }) => {
  await newNovel(page, 'Bible Test');
  await nav(page).getByRole('button', { name: 'Import and export' }).click();
  await page.getByLabel('A planning document').check();
  const d = await import('docx');
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = d;
  const doc = new Document({ sections: [{ children: [
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Marla Quinn')] }),
    new Paragraph({ children: [new TextRun({ text: 'Decided. ', bold: true }), new TextRun('A retired lighthouse keeper.')] }),
    new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun('Weiland Arc: Lie, Ghost, Want, Need')] }),
    new Paragraph({ children: [new TextRun({ text: 'One way I could play it, not a decision yet: ', bold: true, italics: true }), new TextRun('The Lie: ships sink without me. The Want: to keep watch.')] }),
  ] }] });
  await page.getByLabel('File to bring in').setInputFiles({ name: 'Bible 10-13-26.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', buffer: await Packer.toBuffer(doc) });
  await expect(page.getByRole('heading', { name: 'New records it would make' })).toBeVisible();
  await expect(page.getByLabel('New record name')).toHaveValue('Marla Quinn');
  await expect(page.getByLabel('Status').first()).toHaveValue('established');
  await page.getByRole('button', { name: 'Add the checked passages' }).click();
  await expect(page.getByRole('status')).toContainText('3 passages added to your records');
  await page.getByRole('button', { name: 'Open the Story Brain' }).click();
  await expect(page.getByText('Marla Quinn').first()).toBeVisible();

  await nav(page).getByRole('button', { name: 'Import and export' }).click();
  await page.getByRole('tab', { name: 'Your documents' }).click();
  await page.getByRole('button', { name: 'Bible 10-13-26.docx' }).click();
  await expect(page.getByText(/Marla Quinn's arc, lie: One way it could be done/)).toBeVisible();
});
