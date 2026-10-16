// Her plotting spreadsheets in and out (R-B-074). Her method is kept, not replaced:
// beats, the Thesis / Antithesis / Synthesis worlds, descriptions, where each beat goes,
// word ranges at 250 and 300 words per page, page numbers and scene type.
// Numbers that disagree with their own page column are flagged, never silently imported.

import { SAVE_THE_CAT } from '../structure.js';

export interface SheetBeat {
  row: number;
  name: string;            // as written, cleaned of invisible characters
  key: string | null;      // matched beat
  group: string | null;
  description: string;
  where: string;           // "Where does it go" / tolerance text
  sceneType: string;
  words: Record<string, [number, number] | null>;   // by words-per-page
  percent?: [number, number] | null;                // a "%" column, as fractions of the book
  pages: Record<string, [number, number] | null>;
  wordsText: Record<string, string>;
  flags: string[];
}
export interface SheetRead { sheet: string; groups: { key: string; name: string; description: string }[]; beats: SheetBeat[]; columns: string[]; densities: number[]; flags: string[] }

const clean = (s: unknown) => String(s ?? '').replace(/[​-‍﻿ ]/g, ' ').replace(/\s+/g, ' ').trim();
const cellText = (v: unknown): string => {
  if (v == null) return '';
  if (typeof v === 'object') {
    const o = v as { result?: unknown; richText?: { text: string }[]; text?: string; formula?: string };
    if (o.richText) return o.richText.map((x) => x.text).join('');
    if (o.result !== undefined) return String(o.result);
    if (o.text) return o.text;
    return '';
  }
  return String(v);
};

/** "1,200 - 10,800", "Page 4-36", "21600", "36" → [start, end]. */
export function parseRange(t: string): [number, number] | null {
  const nums = (t.replace(/(\d),(\d{3})/g, '$1$2').match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
  if (!nums.length) return null;
  return [nums[0]!, nums[1] ?? nums[0]!];
}

const ALIASES: Record<string, string> = { 'set-up': 'setup', 'set up': 'setup', 'dark night of the soul': 'dark_night', 'stasis = death': 'stasis_death', 'stasis=death': 'stasis_death', 'executing the new plan': 'new_plan' };
export function matchBeat(name: string): string | null {
  const n = clean(name).toLowerCase().replace(/^\d+\.\s*/, '').replace(/\s*\(.*?\)\s*/g, ' ').trim();
  if (ALIASES[n]) return ALIASES[n]!;
  const d = SAVE_THE_CAT.find((x) => x.name.toLowerCase() === n || n.startsWith(x.name.toLowerCase()));
  return d?.key ?? null;
}

export async function readBeatSheet(buf: Buffer): Promise<SheetRead> {
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf as unknown as ArrayBuffer);
  const ws = wb.worksheets[0];
  if (!ws) throw new Error('The workbook has no sheets.');
  const rows: string[][] = [];
  ws.eachRow({ includeEmpty: true }, (row, n) => { rows[n] = (row.values as unknown[]).slice(1).map((c) => clean(cellText(c))); });
  const flags: string[] = [];
  const groups: SheetRead['groups'] = [];
  const beats: SheetBeat[] = [];
  let header: string[] = [], group: string | null = null;
  const col = (re: RegExp) => header.findIndex((h) => re.test(h));
  const densities = new Set<number>();
  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r] ?? [];
    const first = cells.findIndex((c) => c);
    if (first < 0) continue;
    const lead = cells[first]!;
    const gm = /^(thesis|antithesis|synthesis)\s+world\s*:?\s*(.*)$/i.exec(lead);
    if (gm) { group = gm[1]!.toLowerCase(); groups.push({ key: group, name: `${gm[1]![0]!.toUpperCase()}${gm[1]!.slice(1).toLowerCase()} World`, description: clean(gm[2] || cells.slice(first + 1).find(Boolean) || '') }); continue; }
    if (/^(beats?|stages?|steps?|points?|plot points?)$/i.test(lead)) { header = cells; for (const h of header) { const m = /(\d{3})\s*words per page/i.exec(h); if (m) densities.add(Number(m[1])); } continue; }
    if (!header.length) continue;
    const nameCol = col(/^(beats?|stages?|steps?|points?|plot points?)$/i);
    const name = cells[nameCol] ?? '';
    if (!name) continue;
    const key = matchBeat(name);
    const b: SheetBeat = { row: r, name, key, group, description: cells[col(/^description/i)] ?? '', where: '', sceneType: cells[col(/scene type/i)] ?? '', words: {}, pages: {}, wordsText: {}, flags: [] };
    const whereCols = header.map((h, i) => [h, i] as const).filter(([h]) => /where does it go|revised stc|website update/i.test(h));
    b.where = whereCols.map(([, i]) => cells[i]).filter(Boolean).join(' | ');
    // Word and page columns: a page column is immediately followed by the word column for the same density.
    header.forEach((h, i) => {
      const m = /word count.*?(\d{3})\s*words per page/i.exec(h);
      if (!m) return;
      const wpp = m[1]!;
      b.wordsText[wpp] = cells[i] ?? '';
      b.words[wpp] = parseRange(cells[i] ?? '');
      const prev = header[i - 1] ?? '';
      if (/page number/i.test(prev)) b.pages[wpp] = parseRange(cells[i - 1] ?? '');
    });
    const pc = col(/percent|%|where in the book/i);
    if (pc >= 0 && cells[pc]) {
      const raw = cells[pc]!;
      const r = parseRange(raw);
      if (r) b.percent = /%/.test(raw) || r[0] > 1 || r[1] > 1 ? [r[0] / 100, r[1] / 100] : r;
    }
    if (!b.description) b.description = cells[col(/description|what happens|what it is|purpose/i)] ?? '';
    if (!key) b.flags.push(`"${name}" did not match a Save the Cat beat. It is kept as written; choose its beat or leave it out.`);
    for (const [wpp, pg] of Object.entries(b.pages)) {
      const w = b.words[wpp];
      if (!pg || !w) continue;
      const W = Number(wpp);
      // Page p is read as p × words-per-page (her sheets do this), or as the start of page p; page 1 may start at 0.
      const fits = (words: number, page: number) => [page * W, (page - 1) * W].some((e) => Math.abs(words - e) <= W / 10);
      (['start', 'end'] as const).forEach((side, i) => {
        if (fits(w[i]!, pg[i]!)) return;
        const sug = pg[i]! * W;
        b.flags.push(`At ${wpp} words per page, the sheet gives ${w[i]!.toLocaleString()} words for the ${side} of this beat, but page ${pg[i]} works out to ${sug.toLocaleString()}. Possible typo; ${sug.toLocaleString()} is suggested.`);
      });
    }
    beats.push(b);
  }
  if (!beats.length) flags.push('No beat rows were found. The importer looks for a header row that starts with "Beats".');
  if (!header.length) flags.push('No header row was found.');
  const sat = new Set(beats.map((b) => b.key).filter(Boolean));
  const missing = SAVE_THE_CAT.filter((d) => !d.parent && !sat.has(d.key) && d.key !== 'stasis_death').map((d) => d.name);
  if (missing.length && beats.length) flags.push(`Beats not in the sheet: ${missing.join(', ')}.`);
  return { sheet: ws.name, groups, beats, columns: header.filter(Boolean), densities: [...densities].sort(), flags };
}

/** A placement profile from the sheet's word ranges at one density, as fractions of the whole book. */
export function profileFromSheet(read: SheetRead, wpp: number, corrected: Record<number, [number, number]> = {}) {
  const at: Record<string, [number, number]> = {};
  const ranges = read.beats.map((b) => ({ b, r: corrected[b.row] ?? b.words[String(wpp)] ?? null })).filter((x) => x.b.key && x.r);
  const total = Math.max(...ranges.map((x) => x.r![1]));
  if (!Number.isFinite(total) || total <= 0) return null;
  for (const { b, r } of ranges) at[b.key!] = [Math.round((r![0] / total) * 10000) / 10000, Math.round((r![1] / total) * 10000) / 10000];
  const windows: Record<string, { max: number; text: string }> = {};
  for (const b of read.beats) {
    if (!b.key) continue;
    const m = /(?:first|within the first|before[^%]*?)\s*(\d{1,2})\s*%|(\d{1,2})\s*%\s*or earlier|one-quarter/i.exec(b.where);
    if (m) windows[b.key] = { max: m[0].toLowerCase().includes('quarter') ? 0.25 : Number(m[1] ?? m[2]) / 100, text: b.where.split('|').map((x) => x.trim()).find((x) => /%|quarter/i.test(x)) ?? b.where };
  }
  return { at, windows, total };
}

/** Her sheet layout written back out, with this novel's numbers and what is planned at each beat. */
export async function writeBeatSheet(input: {
  title: string; targetWords: number; densities: number[];
  groups: { key: string; name: string; description: string }[];
  beats: { key: string; number: number | null; name: string; group: string; description: string; where: string; sceneType: string; at: [number, number] | null; plan: string; scenes: number }[];
  profileName: string;
}) {
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Story Canon';
  const ws = wb.addWorksheet('Beat sheet', { views: [{ state: 'frozen', ySplit: 0 }] });
  const head = ['Beats', 'Description', 'Where does it go', ...input.densities.flatMap((w) => [`Approximate page number(s) (${w} words per page)`, `Word count for entire beat (${w} words per page)`]), 'Scene type', `In ${input.title}`, 'Scenes placed'];
  ws.columns = head.map((h, i) => ({ key: `c${i}`, width: i === 1 ? 70 : i === head.length - 2 ? 50 : i === 0 ? 30 : 22 }));
  ws.addRow([`${input.title}: beat sheet at ${input.targetWords.toLocaleString()} words (${input.profileName})`]).font = { bold: true, size: 13 };
  for (const g of input.groups) {
    const gr = ws.addRow([`${g.name.toUpperCase()}: ${g.description}`]);
    gr.font = { bold: true }; ws.mergeCells(gr.number, 1, gr.number, head.length); gr.alignment = { wrapText: true, vertical: 'top' }; gr.height = 45;
    const hr = ws.addRow(head); hr.font = { bold: true }; hr.alignment = { wrapText: true, vertical: 'top' };
    hr.eachCell((c) => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAF5EF' } }; });
    for (const b of input.beats.filter((x) => x.group === g.key)) {
      const nums = input.densities.flatMap((w) => {
        if (!b.at) return ['', ''];
        const words = [Math.round(b.at[0] * input.targetWords), Math.round(b.at[1] * input.targetWords)];
        const pages = words.map((x) => Math.max(1, Math.ceil(x / w)));
        return [pages[0] === pages[1] ? `${pages[0]}` : `${pages[0]} - ${pages[1]}`, words[0] === words[1] ? words[0]!.toLocaleString() : `${words[0]!.toLocaleString()} - ${words[1]!.toLocaleString()}`];
      });
      const row = ws.addRow([`${b.number ? `${b.number}. ` : ''}${b.name}`, b.description, b.where, ...nums, b.sceneType, b.plan, b.scenes || '']);
      row.alignment = { wrapText: true, vertical: 'top' };
    }
  }
  return Buffer.from(await wb.xlsx.writeBuffer());
}
