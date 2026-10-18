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
  // It says where the new chapters land beside the chapter she already has.
  await expect(page.getByRole('note').filter({ hasText: 'They go in after your last chapter' })).toContainText('the first one becomes chapter 2');
  await page.getByRole('button', { name: 'Add these chapters to my novel' }).click();
  await expect(page.getByRole('status')).toContainText('Every character of the accepted text is in the novel.');
  await page.getByRole('button', { name: 'Go to the Writing Room' }).click();
  await expect(page.getByRole('complementary', { name: 'Chapters and scenes' })).toContainText('In Which the Dogs Escape');

  await nav(page).getByRole('button', { name: 'Import and export' }).click();
  await page.getByRole('tab', { name: 'Send something out' }).click();
  await page.getByRole('combobox', { name: 'Format' }).selectOption('txt');
  await expect(page.getByRole('region', { name: 'Before you export' })).toContainText('does not keep italics');
  // Chapter headings are shown with one of her own chapters, and explained.
  await expect(page.getByRole('combobox', { name: 'Chapter headings' })).toHaveAccessibleDescription(/How each chapter starts in the file/);
  // Picking chapters shows the chapters to pick from.
  await page.getByRole('radio', { name: 'Only the chapters I pick' }).check();
  const pick = page.getByRole('group', { name: 'Chapters to include' });
  await expect(pick.getByRole('checkbox')).toHaveCount(3);
  await pick.getByRole('checkbox').first().uncheck();
  await expect(page.getByRole('region', { name: 'Before you export' })).toContainText('2 chapters');
  await page.getByRole('radio', { name: 'Every chapter', exact: true }).check();
  await expect(pick).toHaveCount(0);
  const dl = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  const file = await dl;
  expect(file.suggestedFilename()).toBe('Import Test.txt');
  const text = readFileSync((await file.path())!, 'utf8');
  expect(text).toContain('Kevin said it was not his fault, chapter 2.');
  const done = page.getByRole('status').filter({ hasText: 'Import Test.txt' });
  await expect(done).toContainText('Checked: all 3 chapters are in the file, in order, word for word.');
  await expect(done).toContainText('Your browser saved it where downloads go');
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

test('a novel can be set up first: genres, story types with ingredients, characteristics and toolkit (R-B-089 to R-B-093)', async ({ page }) => {
  await page.goto('/#t=e2etoken0123456789');
  await page.getByLabel('Working title').fill('Setup Test');
  await page.getByRole('button', { name: 'Set it up first' }).click();
  await expect(page.getByRole('heading', { name: 'How Setup Test is set up' })).toBeVisible();
  const genres = page.getByRole('region', { name: 'Genres' });
  await genres.getByLabel('Comedy', { exact: true }).click();
  await expect(genres.getByLabel('Comedy role')).toBeVisible();
  await genres.getByLabel('Comedy role').selectOption('primary');
  await genres.getByLabel('Mystery', { exact: true }).click();
  await expect(genres.getByLabel('Mystery role')).toBeVisible();
  await genres.getByLabel('Your own genre').fill('Neighborhood farce');
  await genres.getByRole('button', { name: 'Add' }).click();
  await expect(genres.getByLabel('Neighborhood farce role')).toHaveValue('secondary');
  await expect(genres).toContainText('Is every clue the solution needs planted before the reveal?');
  const types = page.getByRole('region', { name: 'Story types' });
  await types.getByLabel('Buddy Love', { exact: true }).click();
  await expect(types.getByRole('group', { name: 'Buddy Love ingredients' })).toContainText('A counterpart');
  await page.getByRole('region', { name: 'Narrative characteristics' }).getByLabel(/Unreliable narrator/).click();
  await expect(page.getByRole('region', { name: 'Narrative characteristics' }).getByLabel(/Unreliable narrator/)).toBeChecked();
  const kit = page.getByRole('region', { name: 'Storytelling toolkit' });
  await kit.getByLabel(/Save the Cat/).click();
  await expect(page.getByRole('status')).toContainText('is now the beat sheet for this novel');
  await kit.getByLabel('How I use it').fill('The spine.');
  await kit.getByLabel('How I use it').blur();
  await expect(page.getByRole('region', { name: 'What your choices switch on' })).toContainText('What the narrator believes');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Set up this novel' })).toHaveCount(0);
  await nav(page).getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Open novel setup' }).click();
  await expect(page.getByRole('region', { name: 'Genres' }).getByLabel('Comedy role')).toHaveValue('primary');
  await expect(page.getByRole('region', { name: 'Storytelling toolkit' }).getByLabel('How I use it')).toHaveValue('The spine.');
});

test("an editor's tracked changes come back and she decides each one (R-B-083)", async ({ page, request }) => {
  await newNovel(page, 'Editor Test');
  await page.locator('.hero').getByRole('button', { name: 'Write' }).click();
  await expect(page.locator('.ProseMirror')).toHaveAttribute('contenteditable', 'true');
  await page.locator('.ProseMirror').click();
  await page.keyboard.type('Kevin said it was not his fault.');
  await expect(page.getByRole('status').filter({ hasText: 'Saved' })).toBeVisible({ timeout: 10_000 });
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'Import and export' }).click();
  const h = { 'x-studio-token': 'e2etoken0123456789', 'content-type': 'application/json' };
  const projects = await (await request.get('/api/projects', { headers: h })).json();
  const pid = projects.find((p: any) => p.title === 'Editor Test').id;
  // The page commits its words when she leaves it; wait until they are in before exporting.
  await expect.poll(async () => (await (await request.get(`/api/projects/${pid}/outline`, { headers: h })).json()).totalWords).toBe(7);
  const ex = await (await request.post(`/api/projects/${pid}/export`, { headers: h, data: { format: 'docx', manuscript: true, sections: [], options: { titlePage: false } } })).json();
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(Buffer.from(ex.data, 'base64'));
  const xml = await zip.file('word/document.xml')!.async('string');
  zip.file('word/document.xml', xml.replace(/<w:t xml:space="preserve">Kevin said it was not his fault\.<\/w:t>/, '<w:t xml:space="preserve">Kevin said it was not his </w:t></w:r><w:del w:id="1" w:author="Ed"><w:r><w:delText>fault</w:delText></w:r></w:del><w:ins w:id="2" w:author="Ed"><w:r><w:t>doing</w:t></w:r></w:ins><w:r><w:t>.</w:t>'));
  const edited = await zip.generateAsync({ type: 'nodebuffer' });
  await page.getByLabel("My editor's changes").check();
  await page.getByLabel('File to bring in').setInputFiles({ name: 'Editor Test edited.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', buffer: edited });
  const region = page.getByRole('region', { name: /Changes in/ });
  await expect(region).toContainText('fault');
  await expect(region).toContainText('Ed');
  await region.getByRole('button', { name: 'Accept', exact: true }).click();
  await expect(region.getByRole('button', { name: 'Accept', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Make my decisions' }).click();
  await expect(page.getByRole('status')).toContainText('1 scene updated');
  await page.getByRole('button', { name: 'Go to the Writing Room' }).click();
  await expect(page.locator('.ProseMirror')).toContainText('Kevin said it was not his doing.');
});
