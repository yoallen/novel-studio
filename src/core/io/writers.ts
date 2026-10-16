// Writing a book out: Word, RTF, plain text, Markdown, PDF, EPUB, OpenDocument and a web page.
// Each writer says up front what its format cannot carry (R-B-078).

import { createRequire } from 'node:module';
import { BRAND } from '../../brand.js';
import { readFileSync } from 'node:fs';
import { Block, Run, plain, blockText } from './blocks.js';

export type ExportFormat = 'docx' | 'rtf' | 'txt' | 'md' | 'pdf' | 'epub' | 'odt' | 'html';

export interface BookScene { title: string; blocks: Block[]; id?: string }
export interface BookChapter { number: number; title: string; heading: string; scenes: BookScene[] }
export interface Book {
  title: string;
  author: string;
  chapters: BookChapter[];
  /** Planning sections exported alongside or instead of the manuscript. */
  extras: { heading: string; blocks: Block[] }[];
}
export interface WriteOptions {
  sceneBreak: string;                      // shown between scenes
  sceneTitles: boolean;                    // print scene titles as small headings
  titlePage: boolean;
  manuscriptFormat: boolean;               // double-spaced, 12 pt, first-line indents, running header
  chapterOnNewPage: boolean;
}

export const FORMAT_INFO: Record<ExportFormat, { label: string; ext: string; mime: string; loses: string[] }> = {
  docx: { label: 'Word (.docx)', ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', loses: [] },
  rtf: { label: 'Rich Text (.rtf)', ext: 'rtf', mime: 'application/rtf', loses: [] },
  odt: { label: 'OpenDocument (.odt)', ext: 'odt', mime: 'application/vnd.oasis.opendocument.text', loses: [] },
  pdf: { label: 'PDF', ext: 'pdf', mime: 'application/pdf', loses: ['A PDF is for reading and printing; it cannot be edited as text.'] },
  epub: { label: 'E-book (.epub)', ext: 'epub', mime: 'application/epub+zip', loses: ['E-readers choose their own page size, so manuscript formatting and page numbers are not kept.'] },
  md: { label: 'Markdown (.md)', ext: 'md', mime: 'text/markdown; charset=utf-8', loses: ['Underline is not part of Markdown and is dropped.', 'Centered and right-aligned paragraphs become ordinary paragraphs.', 'Page layout and manuscript formatting are not kept.'] },
  txt: { label: 'Plain text (.txt)', ext: 'txt', mime: 'text/plain; charset=utf-8', loses: ['Plain text does not keep italics, bold or underline.', 'Headings become ordinary lines.', 'Page layout and manuscript formatting are not kept.'] },
  html: { label: 'Web page (.html)', ext: 'html', mime: 'text/html; charset=utf-8', loses: ['Page layout and manuscript formatting are not kept.'] },
};

/** What this particular book would lose in this format: only losses that apply to what is actually in it. */
export function lossesFor(book: Book, format: ExportFormat): string[] {
  const all = allBlocks(book);
  const runs = all.flatMap((b) => (b.type === 'break' ? [] : b.runs));
  const has = { i: runs.some((r) => r.i), b: runs.some((r) => r.b), u: runs.some((r) => r.u), align: all.some((b) => b.type === 'p' && b.align) };
  const out: string[] = [];
  if (format === 'txt') {
    const kinds = [has.i && 'italics', has.b && 'bold', has.u && 'underline'].filter(Boolean) as string[];
    const count = runs.filter((r) => r.i || r.b || r.u).length;
    if (kinds.length) out.push(`Plain text does not keep ${kinds.join(', ')} (${count} passage${count === 1 ? '' : 's'}). Your manuscript itself is unchanged.`);
    out.push('Headings become ordinary lines.');
  } else if (format === 'md') {
    if (has.u) out.push(`Markdown has no underline; ${runs.filter((r) => r.u).length} underlined passage(s) become plain. Your manuscript itself is unchanged.`);
    if (has.align) out.push('Centered or right-aligned paragraphs become ordinary paragraphs.');
  } else out.push(...FORMAT_INFO[format].loses);
  if (format === 'pdf') {
    const odd = [...new Set([...all.map(blockText).join('')].filter((c) => c.codePointAt(0)! > 0x24f && !/[‐-‧‰-⁞€™←-⇿]/.test(c)))];
    if (odd.length) out.push(`These characters are outside the PDF font and may print as blanks: ${odd.slice(0, 12).join(' ')}`);
  }
  return out;
}

export function allBlocks(book: Book): Block[] {
  return [...book.chapters.flatMap((c) => c.scenes.flatMap((s) => s.blocks)), ...book.extras.flatMap((e) => e.blocks)];
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function runsHtml(runs: Run[]) {
  return runs.map((r) => {
    let t = esc(r.text).replace(/\n/g, '<br/>');
    if (r.u) t = `<u>${t}</u>`;
    if (r.s) t = `<s>${t}</s>`;
    if (r.b) t = `<strong>${t}</strong>`;
    if (r.i) t = `<em>${t}</em>`;
    return t;
  }).join('');
}

function blocksHtml(blocks: Block[], sceneBreak: string) {
  return blocks.map((b) => {
    if (b.type === 'break') return `<p class="break">${esc(sceneBreak)}</p>`;
    if (b.type === 'h') return `<h${Math.min(b.level + 2, 6)}>${runsHtml(b.runs)}</h${Math.min(b.level + 2, 6)}>`;
    const p = `<p${b.align ? ` style="text-align:${b.align}"` : ''}>${runsHtml(b.runs)}</p>`;
    return b.quote ? `<blockquote>${p}</blockquote>` : p;
  }).join('\n');
}

function chapterHtml(c: BookChapter, o: WriteOptions) {
  const parts: string[] = [`<h1>${esc(c.heading)}</h1>`];
  c.scenes.forEach((s, i) => {
    if (i > 0) parts.push(`<p class="break">${esc(o.sceneBreak)}</p>`);
    if (o.sceneTitles && s.title) parts.push(`<h2>${esc(s.title)}</h2>`);
    parts.push(blocksHtml(s.blocks, o.sceneBreak));
  });
  return parts.join('\n');
}

export function toHtml(book: Book, o: WriteOptions) {
  const body = [
    o.titlePage ? `<section class="title"><h1 class="book">${esc(book.title)}</h1>${book.author ? `<p class="by">${esc(book.author)}</p>` : ''}</section>` : '',
    ...book.chapters.map((c) => `<section class="chapter">${chapterHtml(c, o)}</section>`),
    ...book.extras.map((e) => `<section class="extra"><h1>${esc(e.heading)}</h1>${blocksHtml(e.blocks, o.sceneBreak)}</section>`),
  ].join('\n');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(book.title)}</title><style>
body{font-family:Georgia,'Times New Roman',serif;max-width:38em;margin:3em auto;padding:0 1em;line-height:1.6;color:#1a1a1a;background:#fff}
h1{font-size:1.5em;margin:2.5em 0 1em;text-align:center} h1.book{font-size:2.2em;margin-top:30vh} .by{text-align:center}
h2{font-size:1.05em;font-style:italic;font-weight:normal;margin:1.5em 0 .5em}
p{margin:0;text-indent:1.5em} h1+p,h2+p,.break+p{text-indent:0} .break{text-align:center;text-indent:0;margin:1em 0}
blockquote{margin:1em 2em} section.chapter{page-break-before:always}
</style></head><body>
${body}
</body></html>`;
}

export function toText(book: Book, o: WriteOptions) {
  const out: string[] = [];
  if (o.titlePage) out.push(book.title.toUpperCase(), book.author ? `by ${book.author}` : '', '');
  const blk = (bs: Block[]) => bs.map((b) => (b.type === 'break' ? o.sceneBreak : plain(b.runs)));
  for (const c of book.chapters) {
    out.push('', c.heading, '');
    c.scenes.forEach((s, i) => {
      if (i > 0) out.push(o.sceneBreak, '');
      if (o.sceneTitles && s.title) out.push(s.title, '');
      for (const p of blk(s.blocks)) out.push(p, '');
    });
  }
  for (const e of book.extras) { out.push('', e.heading, ''); for (const p of blk(e.blocks)) out.push(p, ''); }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

function mdRuns(runs: Run[]) {
  return runs.map((r) => {
    let t = r.text.replace(/([\\`*_[\]#<>])/g, '\\$1').replace(/\n/g, '  \n');
    const lead = /^\s*/.exec(t)![0], trail = /\s*$/.exec(t)![0];
    let core = t.trim();
    if (!core) return t;
    if (r.s) core = `~~${core}~~`;
    if (r.b && r.i) core = `***${core}***`; else if (r.b) core = `**${core}**`; else if (r.i) core = `*${core}*`;
    return lead + core + trail;
  }).join('');
}

export function toMarkdown(book: Book, o: WriteOptions) {
  const out: string[] = [];
  if (o.titlePage) out.push(`# ${book.title}`, '', book.author ? `*by ${book.author}*` : '', '');
  const blk = (bs: Block[]) => bs.map((b) => (b.type === 'break' ? (o.sceneBreak === '* * *' ? '\\* \\* \\*' : o.sceneBreak) : b.type === 'h' ? `${'#'.repeat(Math.min(b.level + 2, 6))} ${mdRuns(b.runs)}` : `${b.quote ? '> ' : ''}${mdRuns(b.runs)}`));
  for (const c of book.chapters) {
    out.push(`## ${c.heading}`, '');
    c.scenes.forEach((s, i) => {
      if (i > 0) out.push(o.sceneBreak === '* * *' ? '\\* \\* \\*' : o.sceneBreak, '');
      if (o.sceneTitles && s.title) out.push(`### ${s.title}`, '');
      for (const p of blk(s.blocks)) out.push(p, '');
    });
  }
  for (const e of book.extras) { out.push(`## ${e.heading}`, ''); for (const p of blk(e.blocks)) out.push(p, ''); }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

// ---------- RTF ----------
function rtfEsc(s: string) {
  let out = '';
  for (const ch of s) {
    const c = ch.codePointAt(0)!;
    if (ch === '\\' || ch === '{' || ch === '}') out += '\\' + ch;
    else if (ch === '\n') out += '\\line ';
    else if (ch === '\t') out += '\\tab ';
    else if (c < 128) out += ch;
    else if (c < 0x10000) out += `\\u${c > 32767 ? c - 65536 : c}?`;
    else { const u = ch.charCodeAt(0), l = ch.charCodeAt(1); out += `\\u${u - 65536}?\\u${l - 65536}?`; }
  }
  return out;
}
function rtfRuns(runs: Run[]) {
  return runs.map((r) => { const f = `${r.i ? '\\i' : ''}${r.b ? '\\b' : ''}${r.u ? '\\ul' : ''}${r.s ? '\\strike' : ''}`; return f ? `{${f} ${rtfEsc(r.text)}}` : rtfEsc(r.text); }).join('');
}
export function toRtf(book: Book, o: WriteOptions) {
  const ms = o.manuscriptFormat;
  const para = ms ? '\\sl480\\slmult1\\fi720' : '\\sl276\\slmult1\\fi360\\sa0';
  const out: string[] = ['{\\rtf1\\ansi\\ansicpg1252\\deff0{\\fonttbl{\\f0\\froman Times New Roman;}}\\paperw12240\\paperh15840\\margl1440\\margr1440\\margt1440\\margb1440\\f0\\fs24'];
  if (ms) out.push(`{\\header\\pard\\qr ${rtfEsc(`${book.author.split(' ').pop() ?? ''} / ${book.title.toUpperCase()} / `)}\\chpgn\\par}`);
  if (o.titlePage) out.push(`\\pard\\qc\\sb4000 {\\fs36\\b ${rtfEsc(book.title)}}\\par\\pard\\qc ${rtfEsc(book.author ? `by ${book.author}` : '')}\\par\\page`);
  const blk = (bs: Block[]) => bs.forEach((b) => {
    if (b.type === 'break') out.push(`\\pard\\qc\\sb240\\sa240 ${rtfEsc(o.sceneBreak)}\\par`);
    else if (b.type === 'h') out.push(`\\pard\\sb240\\sa120\\outlinelevel${Math.min(b.level + 1, 8)} {\\b ${rtfRuns(b.runs)}}\\par`);
    else out.push(`\\pard${b.align === 'center' ? '\\qc' : b.align === 'right' ? '\\qr' : ''}${b.quote ? '\\li720\\ri720' : ''}${para} ${rtfRuns(b.runs)}\\par`);
  });
  book.chapters.forEach((c, ci) => {
    out.push(`\\pard${o.chapterOnNewPage && (ci > 0 || o.titlePage) ? '\\pagebb' : ''}\\qc\\sb${ms ? 2880 : 480}\\sa480\\outlinelevel0 {\\b\\fs28 ${rtfEsc(c.heading)}}\\par`);
    c.scenes.forEach((s, i) => {
      if (i > 0) out.push(`\\pard\\qc\\sb240\\sa240 ${rtfEsc(o.sceneBreak)}\\par`);
      if (o.sceneTitles && s.title) out.push(`\\pard\\sb240\\sa120\\outlinelevel1 {\\i ${rtfEsc(s.title)}}\\par`);
      blk(s.blocks);
    });
  });
  for (const e of book.extras) { out.push(`\\pard\\pagebb\\sb240\\sa240\\outlinelevel0 {\\b\\fs28 ${rtfEsc(e.heading)}}\\par`); blk(e.blocks); }
  out.push('}');
  return out.join('\n');
}

// ---------- Word ----------
export async function toDocx(book: Book, o: WriteOptions): Promise<Buffer> {
  const d = await import('docx');
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, PageNumber, LineRuleType, Bookmark } = d;
  const ms = o.manuscriptFormat;
  const spacing = ms ? { line: 480, lineRule: LineRuleType.AUTO } : { line: 300, lineRule: LineRuleType.AUTO, after: 0 };
  const runs = (rs: Run[]) => rs.flatMap((r) => r.text.split('\n').map((t, k) => new TextRun({ text: t, italics: !!r.i, bold: !!r.b, underline: r.u ? {} : undefined, strike: !!r.s, break: k > 0 ? 1 : undefined })));
  const children: InstanceType<typeof Paragraph>[] = [];
  const breakPara = () => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 240, after: 240 }, children: [new TextRun(o.sceneBreak)] });
  // Each scene is marked with a start and an end bookmark, so a revised copy can be matched back scene by scene (R-B-083).
  const blk = (bs: Block[], sceneId?: string) => {
    let first = true;
    const made: { opts: Record<string, unknown>; kids: unknown[] }[] = [];
    for (const b of bs) {
      if (b.type === 'break') { made.push({ opts: { alignment: AlignmentType.CENTER, spacing: { before: 240, after: 240 } }, kids: [new TextRun(o.sceneBreak)] }); first = true; continue; }
      if (b.type === 'h') { made.push({ opts: { heading: b.level <= 1 ? HeadingLevel.HEADING_3 : HeadingLevel.HEADING_4 }, kids: runs(b.runs) }); first = true; continue; }
      made.push({ opts: {
        spacing,
        alignment: b.align === 'center' ? AlignmentType.CENTER : b.align === 'right' ? AlignmentType.RIGHT : undefined,
        indent: b.quote ? { left: 720, right: 720 } : (first || b.align) ? undefined : { firstLine: ms ? 720 : 360 },
      }, kids: runs(b.runs) });
      first = false;
    }
    if (sceneId && made.length) {
      made[0]!.kids.unshift(new Bookmark({ id: `sc_${sceneId}`, children: [] }));
      made[made.length - 1]!.kids.push(new Bookmark({ id: `se_${sceneId}`, children: [] }));
    }
    for (const m of made) children.push(new Paragraph({ ...m.opts, children: m.kids as never }));
  };
  if (o.titlePage) {
    children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 4000 }, heading: HeadingLevel.TITLE, children: [new TextRun(book.title)] }));
    if (book.author) children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(`by ${book.author}`)] }));
  }
  book.chapters.forEach((c, ci) => {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, pageBreakBefore: o.chapterOnNewPage && (ci > 0 || o.titlePage), spacing: { before: ms ? 2880 : 480, after: 480 }, children: [new TextRun(c.heading)] }));
    c.scenes.forEach((s, i) => {
      if (i > 0) children.push(breakPara());
      if (o.sceneTitles && s.title) children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(s.title)] }));
      blk(s.blocks, s.id);
    });
  });
  for (const e of book.extras) { children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: children.length > 0, children: [new TextRun(e.heading)] })); blk(e.blocks); }
  const doc = new Document({
    creator: book.author || BRAND.name, title: book.title,
    styles: {
      default: {
        document: { run: { font: ms ? 'Times New Roman' : 'Georgia', size: 24 } },
        title: { run: { font: ms ? 'Times New Roman' : 'Georgia', size: 52, bold: true, color: '000000' } },
        heading1: { run: { font: ms ? 'Times New Roman' : 'Georgia', size: 32, bold: true, color: '000000' }, paragraph: { spacing: { after: 240 } } },
        heading2: { run: { font: ms ? 'Times New Roman' : 'Georgia', size: 26, bold: true, italics: true, color: '000000' } },
        heading3: { run: { font: ms ? 'Times New Roman' : 'Georgia', size: 24, bold: true, color: '000000' } },
        heading4: { run: { font: ms ? 'Times New Roman' : 'Georgia', size: 24, italics: true, color: '000000' } },
      },
    },
    sections: [{
      properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
      headers: ms ? { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun(`${book.author.split(' ').pop() ?? ''} / ${book.title.toUpperCase()} / `), new TextRun({ children: [PageNumber.CURRENT] })] })] }) } : undefined,
      children,
    }],
  });
  return Packer.toBuffer(doc);
}

// ---------- OpenDocument ----------
export async function toOdt(book: Book, o: WriteOptions): Promise<Buffer> {
  const JSZip = (await import('jszip')).default;
  const x = (s: string) => esc(s).replace(/'/g, '&apos;');
  const span = (r: Run) => {
    const st = [r.i && 'I', r.b && 'B', r.u && 'U', r.s && 'S'].filter(Boolean).join('');
    const t = x(r.text).split('\n').join('<text:line-break/>').replace(/\t/g, '<text:tab/>').replace(/ {2,}/g, (m) => ` <text:s text:c="${m.length - 1}"/>`);
    return st ? `<text:span text:style-name="T${st}">${t}</text:span>` : t;
  };
  const body: string[] = [];
  const blk = (bs: Block[]) => bs.forEach((b) => {
    if (b.type === 'break') body.push(`<text:p text:style-name="Break">${x(o.sceneBreak)}</text:p>`);
    else if (b.type === 'h') body.push(`<text:h text:style-name="Heading_20_${Math.min(b.level + 1, 6)}" text:outline-level="${Math.min(b.level + 1, 6)}">${b.runs.map(span).join('')}</text:h>`);
    else body.push(`<text:p text:style-name="${b.quote ? 'Quote' : b.align === 'center' ? 'Center' : 'Body'}">${b.runs.map(span).join('')}</text:p>`);
  });
  if (o.titlePage) body.push(`<text:p text:style-name="TitleP">${x(book.title)}</text:p><text:p text:style-name="Center">${x(book.author ? `by ${book.author}` : '')}</text:p>`);
  book.chapters.forEach((c, ci) => {
    body.push(`<text:h text:style-name="${o.chapterOnNewPage && (ci > 0 || o.titlePage) ? 'ChapterBreak' : 'Chapter'}" text:outline-level="1">${x(c.heading)}</text:h>`);
    c.scenes.forEach((s, i) => {
      if (i > 0) body.push(`<text:p text:style-name="Break">${x(o.sceneBreak)}</text:p>`);
      if (o.sceneTitles && s.title) body.push(`<text:h text:style-name="Heading_20_2" text:outline-level="2">${x(s.title)}</text:h>`);
      blk(s.blocks);
    });
  });
  for (const e of book.extras) { body.push(`<text:h text:style-name="ChapterBreak" text:outline-level="1">${x(e.heading)}</text:h>`); blk(e.blocks); }
  const lh = o.manuscriptFormat ? '200%' : '150%';
  const content = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" office:version="1.3">
<office:automatic-styles>
<style:style style:name="TI" style:family="text"><style:text-properties fo:font-style="italic"/></style:style>
<style:style style:name="TB" style:family="text"><style:text-properties fo:font-weight="bold"/></style:style>
<style:style style:name="TU" style:family="text"><style:text-properties style:text-underline-style="solid" style:text-underline-width="auto" style:text-underline-color="font-color"/></style:style>
<style:style style:name="TS" style:family="text"><style:text-properties style:text-line-through-style="solid"/></style:style>
${['IB', 'IU', 'BU', 'IBU', 'IS', 'BS', 'US', 'IBS', 'IUS', 'BUS', 'IBUS'].map((k) => `<style:style style:name="T${k}" style:family="text"><style:text-properties${k.includes('I') ? ' fo:font-style="italic"' : ''}${k.includes('B') ? ' fo:font-weight="bold"' : ''}${k.includes('U') ? ' style:text-underline-style="solid" style:text-underline-width="auto" style:text-underline-color="font-color"' : ''}${k.includes('S') ? ' style:text-line-through-style="solid"' : ''}/></style:style>`).join('\n')}
<style:style style:name="Body" style:family="paragraph"><style:paragraph-properties fo:text-indent="0.5in" fo:line-height="${lh}"/></style:style>
<style:style style:name="Quote" style:family="paragraph"><style:paragraph-properties fo:margin-left="0.5in" fo:margin-right="0.5in" fo:line-height="${lh}"/></style:style>
<style:style style:name="Center" style:family="paragraph"><style:paragraph-properties fo:text-align="center"/></style:style>
<style:style style:name="Break" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-top="0.17in" fo:margin-bottom="0.17in"/></style:style>
<style:style style:name="TitleP" style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-top="3in"/><style:text-properties fo:font-size="20pt" fo:font-weight="bold"/></style:style>
<style:style style:name="Chapter" style:family="paragraph" style:parent-style-name="Heading_20_1"><style:paragraph-properties fo:text-align="center" fo:margin-top="1in" fo:margin-bottom="0.33in"/></style:style>
<style:style style:name="ChapterBreak" style:family="paragraph" style:parent-style-name="Heading_20_1"><style:paragraph-properties fo:break-before="page" fo:text-align="center" fo:margin-top="1in" fo:margin-bottom="0.33in"/></style:style>
</office:automatic-styles>
<office:body><office:text>
${body.join('\n')}
</office:text></office:body></office:document-content>`;
  const styles = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" office:version="1.3">
<office:styles>
<style:default-style style:family="paragraph"><style:text-properties style:font-name="Times New Roman" fo:font-family="'Times New Roman'" fo:font-size="12pt"/></style:default-style>
${[1, 2, 3, 4, 5, 6].map((n) => `<style:style style:name="Heading_20_${n}" style:display-name="Heading ${n}" style:family="paragraph" style:default-outline-level="${n}"><style:text-properties fo:font-size="${[16, 14, 13, 12, 12, 12][n - 1]}pt" fo:font-weight="bold"/></style:style>`).join('\n')}
</office:styles>
<office:automatic-styles><style:page-layout style:name="pm1"><style:page-layout-properties fo:page-width="8.5in" fo:page-height="11in" fo:margin-top="1in" fo:margin-bottom="1in" fo:margin-left="1in" fo:margin-right="1in"/></style:page-layout></office:automatic-styles>
<office:master-styles><style:master-page style:name="Standard" style:page-layout-name="pm1"/></office:master-styles>
</office:document-styles>`;
  const meta = `<?xml version="1.0" encoding="UTF-8"?><office:document-meta xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:dc="http://purl.org/dc/elements/1.1/" office:version="1.3"><office:meta><dc:title>${x(book.title)}</dc:title><dc:creator>${x(book.author)}</dc:creator></office:meta></office:document-meta>`;
  const zip = new JSZip();
  zip.file('mimetype', 'application/vnd.oasis.opendocument.text', { compression: 'STORE' });
  zip.file('content.xml', content);
  zip.file('styles.xml', styles);
  zip.file('meta.xml', meta);
  zip.file('META-INF/manifest.xml', `<?xml version="1.0" encoding="UTF-8"?><manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.3"><manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/><manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/><manifest:file-entry manifest:full-path="meta.xml" manifest:media-type="text/xml"/></manifest:manifest>`);
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', mimeType: 'application/vnd.oasis.opendocument.text' });
}

// ---------- EPUB 3 ----------
export async function toEpub(book: Book, o: WriteOptions, id: string): Promise<Buffer> {
  const JSZip = (await import('jszip')).default;
  const xhtml = (title: string, body: string) => `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en"><head><meta charset="utf-8"/><title>${esc(title)}</title><link rel="stylesheet" href="book.css"/></head><body>
${body}
</body></html>`;
  const files: { id: string; href: string; title: string; body: string }[] = [];
  if (o.titlePage) files.push({ id: 'title', href: 'title.xhtml', title: book.title, body: `<section epub:type="titlepage"><h1 class="book">${esc(book.title)}</h1>${book.author ? `<p class="by">${esc(book.author)}</p>` : ''}</section>` });
  book.chapters.forEach((c, i) => files.push({ id: `c${i + 1}`, href: `chapter-${i + 1}.xhtml`, title: c.heading, body: `<section epub:type="chapter">${chapterHtml(c, o).replace(/<br>/g, '<br/>')}</section>` }));
  book.extras.forEach((e, i) => files.push({ id: `x${i + 1}`, href: `extra-${i + 1}.xhtml`, title: e.heading, body: `<section><h1>${esc(e.heading)}</h1>${blocksHtml(e.blocks, o.sceneBreak)}</section>` }));
  const zip = new JSZip();
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
  zip.file('META-INF/container.xml', '<?xml version="1.0" encoding="UTF-8"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');
  zip.file('OEBPS/book.css', 'body{font-family:serif;line-height:1.5} h1{text-align:center;margin:2em 0 1em;font-size:1.4em} h1.book{margin-top:30%;font-size:2em} .by{text-align:center} h2{font-size:1em;font-style:italic;font-weight:normal} p{margin:0;text-indent:1.5em} h1+p,h2+p,.break+p{text-indent:0} .break{text-align:center;text-indent:0;margin:1em 0} blockquote{margin:1em 2em}');
  for (const f of files) zip.file(`OEBPS/${f.href}`, xhtml(f.title, f.body));
  zip.file('OEBPS/nav.xhtml', xhtml('Contents', `<nav epub:type="toc" id="toc"><h1>Contents</h1><ol>${files.map((f) => `<li><a href="${f.href}">${esc(f.title)}</a></li>`).join('')}</ol></nav>`));
  const modified = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  zip.file('OEBPS/content.opf', `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="en">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="bookid">urn:uuid:${id}</dc:identifier><dc:title>${esc(book.title)}</dc:title><dc:creator>${esc(book.author || 'Unknown')}</dc:creator><dc:language>en</dc:language><meta property="dcterms:modified">${modified}</meta></metadata>
<manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="css" href="book.css" media-type="text/css"/>${files.map((f) => `<item id="${f.id}" href="${f.href}" media-type="application/xhtml+xml"/>`).join('')}</manifest>
<spine>${files.map((f) => `<itemref idref="${f.id}"/>`).join('')}</spine>
</package>`);
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', mimeType: 'application/epub+zip' });
}

// ---------- PDF (letter size, for reading and printing) ----------
const require = createRequire(import.meta.url);
function font(file: string) { return readFileSync(require.resolve(`@fontsource/literata/files/${file}`)); }

export async function toPdf(book: Book, o: WriteOptions): Promise<Buffer> {
  const PDFDocument = (await import('pdfkit')).default;
  const doc = new PDFDocument({ size: 'LETTER', margins: { top: 72, bottom: 72, left: 72, right: 72 }, bufferPages: true, info: { Title: book.title, Author: book.author } });
  doc.registerFont('R', font('literata-latin-400-normal.woff'));
  doc.registerFont('I', font('literata-latin-400-italic.woff'));
  doc.registerFont('B', font('literata-latin-700-normal.woff'));
  doc.registerFont('BI', font('literata-latin-700-italic.woff'));
  const chunks: Buffer[] = [];
  doc.on('data', (c: Buffer) => chunks.push(c));
  const done = new Promise<void>((res) => doc.on('end', () => res()));
  const size = o.manuscriptFormat ? 12 : 11.5;
  const gap = o.manuscriptFormat ? size * 1.0 : size * 0.45;
  const fontOf = (r: Run) => (r.b && r.i ? 'BI' : r.b ? 'B' : r.i ? 'I' : 'R');
  const para = (runs: Run[], opts: { indent?: number; align?: 'left' | 'center' | 'right' | 'justify'; quote?: boolean } = {}) => {
    const rs = runs.length ? runs : [{ text: ' ' }];
    const left = opts.quote ? 108 : 72, width = doc.page.width - left - (opts.quote ? 108 : 72);
    doc.x = left;
    rs.forEach((r, i) => {
      // Only the first piece of a paragraph sets the layout; changing it mid-paragraph would start a new line.
      const more = i < rs.length - 1;
      if (i === 0) doc.font(fontOf(r)).fontSize(size).text(r.text, left, undefined, { continued: more, indent: opts.indent ?? 0, align: opts.align ?? 'left', width, lineGap: gap, underline: !!r.u, strike: !!r.s });
      else doc.font(fontOf(r)).text(r.text, { continued: more, underline: !!r.u, strike: !!r.s });
    });
    doc.moveDown(o.manuscriptFormat ? 0 : 0.15);
  };
  const breakLine = () => { doc.moveDown(0.6); doc.font('R').fontSize(size).text(o.sceneBreak, 72, undefined, { align: 'center', width: doc.page.width - 144 }); doc.moveDown(0.6); };
  const blk = (bs: Block[]) => {
    let first = true;
    for (const b of bs) {
      if (b.type === 'break') { breakLine(); first = true; continue; }
      if (b.type === 'h') { doc.moveDown(0.5); doc.font('B').fontSize(size + 1).text(plain(b.runs), 72, undefined, { width: doc.page.width - 144 }); doc.moveDown(0.3); first = true; continue; }
      para(b.runs, { indent: first || b.align || b.quote ? 0 : 24, align: b.align ?? 'left', quote: b.quote });
      first = false;
    }
  };
  let pageUsed = false;
  if (o.titlePage) {
    doc.moveDown(12); doc.font('B').fontSize(26).text(book.title, { align: 'center' });
    if (book.author) { doc.moveDown(1); doc.font('R').fontSize(14).text(`by ${book.author}`, { align: 'center' }); }
    pageUsed = true;
  }
  for (const c of book.chapters) {
    if (pageUsed && o.chapterOnNewPage) doc.addPage(); else if (pageUsed) doc.moveDown(2);
    doc.moveDown(o.manuscriptFormat ? 8 : 4);
    doc.font('B').fontSize(18).text(c.heading, 72, undefined, { align: 'center', width: doc.page.width - 144 });
    doc.moveDown(1.5);
    c.scenes.forEach((s, i) => {
      if (i > 0) breakLine();
      if (o.sceneTitles && s.title) { doc.font('I').fontSize(size).text(s.title, 72); doc.moveDown(0.4); }
      blk(s.blocks);
    });
    pageUsed = true;
  }
  for (const e of book.extras) {
    if (pageUsed) doc.addPage();
    doc.font('B').fontSize(16).text(e.heading, 72); doc.moveDown(1);
    blk(e.blocks);
    pageUsed = true;
  }
  // Page numbers.
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    if (o.titlePage && i === 0) continue;
    doc.switchToPage(i);
    const label = o.manuscriptFormat ? `${book.author.split(' ').pop() ?? ''} / ${book.title.toUpperCase()} / ${i + 1}` : String(i + 1);
    doc.font('R').fontSize(9).text(label, 72, o.manuscriptFormat ? 40 : doc.page.height - 50, { align: o.manuscriptFormat ? 'right' : 'center', width: doc.page.width - 144, lineBreak: false });
  }
  doc.end();
  await done;
  return Buffer.concat(chunks);
}
