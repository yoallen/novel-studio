// Reading files into blocks. Word through mammoth (italics, bold, underline, headings kept), RTF, Markdown, plain text.

import { Block, htmlToBlocks, markdownToBlocks, rtfToBlocks, textToBlocks } from './blocks.js';
import { ValidationError } from '../store.js';

export type FileFormat = 'docx' | 'rtf' | 'md' | 'txt' | 'odt';

export function formatOf(name: string): FileFormat {
  const ext = name.toLowerCase().split('.').pop() ?? '';
  if (ext === 'docx') return 'docx';
  if (ext === 'rtf') return 'rtf';
  if (ext === 'md' || ext === 'markdown') return 'md';
  if (ext === 'txt' || ext === 'text') return 'txt';
  if (ext === 'odt') return 'odt';
  if (ext === 'doc') throw new ValidationError('That is an older Word file (.doc). Open it in Word and save it as .docx, then import it.');
  if (ext === 'pdf') throw new ValidationError('PDF import is a later step. For now, save the document as .docx, .rtf or text and import that.');
  throw new ValidationError('That kind of file cannot be imported yet. Use .docx, .rtf, .md or .txt.');
}

/** Decode text bytes: UTF-8 (with or without a byte-order mark), UTF-16, or Windows-1252 as a fallback. */
export function decodeText(buf: Buffer): string {
  if (buf[0] === 0xff && buf[1] === 0xfe) return buf.subarray(2).toString('utf16le');
  if (buf[0] === 0xfe && buf[1] === 0xff) { const b = Buffer.from(buf.subarray(2)); b.swap16(); return b.toString('utf16le'); }
  const s = buf.toString('utf8');
  if (!s.includes('�')) return s.replace(/^﻿/, '');
  return new TextDecoder('windows-1252').decode(buf);
}

export async function readBlocks(name: string, buf: Buffer): Promise<{ blocks: Block[]; format: FileFormat; warnings: string[]; title?: string; modified?: string | null }> {
  const format = formatOf(name);
  const warnings: string[] = [];
  if (format === 'docx') {
    const mammoth = (await import('mammoth')).default;
    let result;
    try {
      result = await mammoth.convertToHtml({ buffer: buf }, { styleMap: ['u => u', "p[style-name='Title'] => h1:fresh", "p[style-name='Subtitle'] => h2:fresh", "p[style-name='Quote'] => blockquote > p:fresh", "p[style-name='Intense Quote'] => blockquote > p:fresh"], includeDefaultStyleMap: true });
    } catch { throw new ValidationError('That Word file could not be opened. It may be damaged or password-protected.'); }
    const unknownStyles = new Set<string>();
    for (const m of result.messages) {
      const st = /Unrecognised paragraph style: '([^']+)'/.exec(m.message);
      if (st) unknownStyles.add(st[1]!);
    }
    if (unknownStyles.size) warnings.push(`Paragraph styles read as ordinary paragraphs: ${[...unknownStyles].slice(0, 8).join(', ')}.`);
    if (/<img /.test(result.value)) warnings.push('Pictures in the document were not imported.');
    if (/<table/.test(result.value)) warnings.push('Tables were brought in as plain lines, one row per paragraph.');
    if (/footnote|endnote/.test(result.value)) warnings.push('Footnotes and endnotes were brought in at the end, as plain paragraphs.');
    const html = result.value.replace(/<img [^>]*>/g, '');
    let modified: string | null = null;
    try {
      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(buf);
      const core = await zip.file('docProps/core.xml')?.async('string');
      modified = /<dcterms:modified[^>]*>([^<]+)</.exec(core ?? '')?.[1] ?? null;
    } catch { /* optional */ }
    return { blocks: htmlToBlocks(html), format, warnings, modified };
  }
  if (format === 'odt') {
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(buf).catch(() => { throw new ValidationError('That OpenDocument file could not be opened.'); });
    const xml = await zip.file('content.xml')?.async('string');
    if (!xml) throw new ValidationError('That OpenDocument file has no text in it.');
    return { blocks: odtToBlocks(xml), format, warnings };
  }
  const text = decodeText(buf);
  if (format === 'rtf') {
    if (!text.startsWith('{\\rtf')) throw new ValidationError('That file is not a valid RTF document.');
    return { blocks: rtfToBlocks(text), format, warnings };
  }
  if (format === 'md') return { blocks: markdownToBlocks(text), format, warnings };
  return { blocks: textToBlocks(text), format, warnings };
}

/** OpenDocument text: headings, paragraphs, and italic or bold spans by their automatic styles. */
export function odtToBlocks(xml: string): Block[] {
  const styles = new Map<string, { i?: boolean; b?: boolean; u?: boolean }>();
  for (const m of xml.matchAll(/<style:style style:name="([^"]+)"[^>]*>([\s\S]*?)<\/style:style>/g)) {
    const props = m[2]!;
    styles.set(m[1]!, { i: /fo:font-style="italic"/.test(props) || undefined, b: /fo:font-weight="bold"/.test(props) || undefined, u: /style:text-underline-style="solid"/.test(props) || undefined });
  }
  const html = xml
    .replace(/<text:h[^>]*text:outline-level="(\d)"[^>]*>/g, '<h$1>').replace(/<\/text:h>/g, '</h9>')
    .replace(/<text:p[^>]*>/g, '<p>').replace(/<\/text:p>/g, '</p>')
    .replace(/<text:span text:style-name="([^"]+)"[^>]*>([\s\S]*?)<\/text:span>/g, (_m, st: string, inner: string) => {
      const s = styles.get(st) ?? {};
      return `${s.i ? '<em>' : ''}${s.b ? '<strong>' : ''}${s.u ? '<u>' : ''}${inner}${s.u ? '</u>' : ''}${s.b ? '</strong>' : ''}${s.i ? '</em>' : ''}`;
    })
    .replace(/<text:line-break\/>/g, '<br>').replace(/<text:tab\/>/g, '\t').replace(/<text:s(?: text:c="(\d+)")?\/>/g, (_m, n: string) => ' '.repeat(Number(n ?? 1)))
    .replace(/<\/?(office|style|text|draw|table|svg|fo|loext)[^>]*>/g, '');
  // Close headings with their own level.
  return htmlToBlocks(html.replace(/<h(\d)>([\s\S]*?)<\/h9>/g, '<h$1>$2</h$1>'));
}
