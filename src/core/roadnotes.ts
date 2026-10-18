// Notes from the road: one file per novel in the shared folder, beside the novels themselves.
// She writes or dictates into it on her phone (Word's microphone works well), and every new
// paragraph arrives in Capture on whichever computer has the novel open. Story Canon never changes
// the file after making it: what she wrote stays exactly as she wrote it, in both places.

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Brain } from './brain.js';
import type { Store } from './store.js';

export const NOTES_DIR = 'Story Canon notes';
const KEEP_SEEN = 5000;

const key = (t: string) => createHash('sha256').update(t.replace(/\s+/g, ' ').trim().toLowerCase()).digest('hex').slice(0, 24);
const safeName = (title: string) => (title.replace(/[<>:"/\\|?*\u0000-\u001f]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/[. ]+$/, '') || 'Novel').slice(0, 80);

export function headerFor(title: string) {
  return `Notes for ${title}. Write or dictate below, one note to a paragraph. Story Canon brings each new paragraph into Capture the next time the novel is open, and never changes this file.`;
}

interface Kept { file: string; seen: string[] }

export class RoadNotes {
  private mtimes = new Map<string, number>();
  constructor(private store: Store, private brain: Brain, private sharedDir: () => string | null) {}

  private kept(pid: string): Kept | null {
    const k = this.brain.project(pid).profile.roadNotes as Kept | undefined;
    return k && typeof k.file === 'string' && Array.isArray(k.seen) ? k : null;
  }
  private keep(pid: string, k: Kept) {
    const p = this.brain.project(pid);
    this.store.batch({ projectId: pid, actor: 'author', reason: 'Notes from the road' }, (w) =>
      w.update('projects', pid, { profile_json: JSON.stringify({ ...p.profile, roadNotes: { file: k.file, seen: k.seen.slice(-KEEP_SEEN) } }) }));
  }

  /** Where this novel's notes file is, making it the first time. null when sharing is off. */
  async ensure(pid: string): Promise<{ path: string; folder: string; file: string; made: boolean } | null> {
    const dir = this.sharedDir();
    if (!dir) return null;
    const folder = join(dir, NOTES_DIR);
    const title = this.brain.project(pid).title as string;
    const k = this.kept(pid);
    const file = k?.file ?? `${safeName(title)}.docx`;
    const path = join(folder, file);
    let made = false;
    if (!existsSync(path)) {
      // A plain-text file of the same name works too, for a phone without Word.
      const txt = path.replace(/\.docx$/i, '.txt');
      if (existsSync(txt)) return { path: txt, folder, file: file.replace(/\.docx$/i, '.txt'), made: false };
      mkdirSync(folder, { recursive: true });
      const { Document, Packer, Paragraph, TextRun } = await import('docx');
      const doc = new Document({ sections: [{ children: [new Paragraph({ children: [new TextRun({ text: headerFor(title), italics: true, color: '74578D' })] }), new Paragraph('')] }] });
      writeFileSync(path, await Packer.toBuffer(doc));
      made = true;
    }
    // Nothing is recorded with the novel until a note actually comes in: making the file is not a
    // change to the book, so it can never make the two computers disagree.
    return { path, folder, file, made };
  }

  /** Bring in every paragraph not seen before. Cheap when the file has not changed. */
  async check(pid: string): Promise<{ added: number; file: string | null }> {
    const at = await this.ensure(pid);
    if (!at || !existsSync(at.path)) return { added: 0, file: at?.file ?? null };
    let mtime = 0;
    try { mtime = statSync(at.path).mtimeMs; } catch { return { added: 0, file: at.file }; }
    if (this.mtimes.get(at.path) === mtime) return { added: 0, file: at.file };
    let paras: string[];
    try { paras = await paragraphs(at.path); } catch { return { added: 0, file: at.file }; } // half-synced or open elsewhere: try again next time
    this.mtimes.set(at.path, mtime);
    const k = this.kept(pid) ?? { file: at.file, seen: [] };
    const seen = new Set(k.seen);
    const fresh: string[] = [];
    for (const p of paras) {
      if (isHeader(p)) continue;
      const h = key(p);
      if (!seen.has(h)) { seen.add(h); fresh.push(p); k.seen.push(h); }
    }
    if (!fresh.length) return { added: 0, file: at.file };
    for (const text of fresh) this.brain.capture(pid, text, { kind: 'thought', from: 'Notes from the road' });
    this.keep(pid, k);
    return { added: fresh.length, file: at.file };
  }
}

/** The line Story Canon puts at the top of the file, whatever the novel was called then. */
function isHeader(p: string) { return /^Notes for .+\. Write or dictate below, one note to a paragraph\. Story Canon brings each new paragraph into Capture/.test(p); }

/** The file's paragraphs, each trimmed, empty ones left out. */
export async function paragraphs(path: string): Promise<string[]> {
  let text: string;
  if (/\.docx$/i.test(path)) {
    const mammoth = (await import('mammoth')).default;
    text = (await mammoth.extractRawText({ buffer: readFileSync(path) })).value;
  } else text = readFileSync(path, 'utf8').replace(/^﻿/, '');
  return text.replace(/\r\n?/g, '\n').split(/\n/).map((x) => x.trim()).filter(Boolean);
}
