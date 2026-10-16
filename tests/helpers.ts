import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Store } from '../src/core/store.js';
import { Brain } from '../src/core/brain.js';
import { Manuscript, textToDoc } from '../src/core/manuscript.js';

export function freshStore() {
  const dir = mkdtempSync(join(tmpdir(), 'ns-test-'));
  const store = new Store(join(dir, 'studio.sqlite3'));
  const brain = new Brain(store);
  const ms = new Manuscript(store);
  return { dir, store, brain, ms, doc: textToDoc, cleanup: () => { store.close(); rmSync(dir, { recursive: true, force: true }); } };
}
