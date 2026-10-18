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

interface Kept { seen: string[] }

/** A file must sit untouched this long before it is read, so a note still being dictated (Word on a
 *  phone saves every few seconds) comes in once, finished, rather than a piece at a time. */
const QUIET_MS = 60_000;
/** After the computer has been asleep or closed, wait this long so newer work from the other
 *  computer can arrive first. */
const WAKE_HOLD_MS = 3 * 60_000;

export class RoadNotes {
  private mtimes = new Map<string, number>();
  private lastCheck = 0;
  private holdUntil = 0;
  constructor(private store: Store, private brain: Brain, private sharedDir: () => string | null, private now: () => number = Date.now, private timing = { quietMs: QUIET_MS, wakeHoldMs: WAKE_HOLD_MS }) {}

  private kept(pid: string): Kept {
    const k = this.brain.project(pid).profile.roadNotes as Kept | undefined;
    return { seen: Array.isArray(k?.seen) ? [...k!.seen] : [] };
  }
  private keep(pid: string, k: Kept) {
    const p = this.brain.project(pid);
    this.store.batch({ projectId: pid, actor: 'author', reason: 'Notes from the road' }, (w) =>
      w.update('projects', pid, { profile_json: JSON.stringify({ ...p.profile, roadNotes: { seen: k.seen.slice(-KEEP_SEEN) } }) }));
  }
  // Which file belongs to which novel is kept on this computer, not in the novel, so a rename keeps
  // the file she already knows, and recording it is never a change the other computer has to take in.
  private files(): Record<string, string> {
    const r = this.store.db.prepare("SELECT value_json FROM settings WHERE key='road_notes_files'").get() as { value_json: string } | undefined;
    return r ? JSON.parse(r.value_json) : {};
  }
  private setFile(pid: string, file: string) {
    const all = { ...this.files(), [pid]: file };
    this.store.db.prepare("INSERT INTO settings(key,value_json) VALUES ('road_notes_files',?) ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json").run(JSON.stringify(all));
  }

  /** Where this novel's notes file is, making it the first time. null when sharing is off. */
  async ensure(pid: string): Promise<{ path: string; folder: string; file: string; made: boolean } | null> {
    const dir = this.sharedDir();
    if (!dir) return null;
    const folder = join(dir, NOTES_DIR);
    const title = this.brain.project(pid).title as string;
    const files = this.files();
    let file = files[pid];
    if (!file) {
      // Named for the novel. Another novel here with the same name gets its own file.
      const taken = new Set(Object.entries(files).filter(([id]) => id !== pid).map(([, f]) => f.replace(/\.(docx|txt)$/i, '').toLowerCase()));
      let base = safeName(title), n = 2;
      while (taken.has(base.toLowerCase())) base = `${safeName(title)} (${n++})`;
      file = existsSync(join(folder, `${base}.txt`)) && !existsSync(join(folder, `${base}.docx`)) ? `${base}.txt` : `${base}.docx`;
      this.setFile(pid, file);
    }
    let path = join(folder, file);
    let made = false;
    if (!existsSync(path)) {
      // A plain-text file of the same name works too, for a phone without Word.
      const other = /\.docx$/i.test(file) ? file.replace(/\.docx$/i, '.txt') : file.replace(/\.txt$/i, '.docx');
      if (existsSync(join(folder, other))) { file = other; path = join(folder, other); this.setFile(pid, file); }
      else {
        mkdirSync(folder, { recursive: true });
        if (/\.txt$/i.test(file)) writeFileSync(path, headerFor(title) + '\n\n');
        else {
          const { Document, Packer, Paragraph, TextRun } = await import('docx');
          const doc = new Document({ sections: [{ children: [new Paragraph({ children: [new TextRun({ text: headerFor(title), italics: true, color: '74578D' })] }), new Paragraph('')] }] });
          writeFileSync(path, await Packer.toBuffer(doc));
        }
        made = true;
      }
    }
    // Nothing is recorded with the novel until a note actually comes in: making the file is not a
    // change to the book, so it can never make the two computers disagree.
    return { path, folder, file, made };
  }

  /** Bring in every paragraph not seen before. Cheap when the file has not changed. */
  async check(pid: string): Promise<{ added: number; file: string | null }> {
    const now = this.now();
    // A long gap since the last check means the computer slept or was closed: give the other computer's work time to arrive.
    if (this.lastCheck && now - this.lastCheck > 2 * 60_000) this.holdUntil = now + this.timing.wakeHoldMs;
    if (!this.lastCheck) this.holdUntil = now + this.timing.wakeHoldMs;
    this.lastCheck = now;
    const at = await this.ensure(pid);
    if (!at || !existsSync(at.path)) return { added: 0, file: at?.file ?? null };
    if (now < this.holdUntil) return { added: 0, file: at.file };
    let mtime = 0;
    try { mtime = statSync(at.path).mtimeMs; } catch { return { added: 0, file: at.file }; }
    if (this.mtimes.get(at.path) === mtime) return { added: 0, file: at.file };
    if (now - mtime < this.timing.quietMs) return { added: 0, file: at.file }; // still being written
    let paras: string[];
    try { paras = await paragraphs(at.path); } catch { return { added: 0, file: at.file }; } // half-synced or open elsewhere: try again next time
    this.mtimes.set(at.path, mtime);
    const k = this.kept(pid);
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
