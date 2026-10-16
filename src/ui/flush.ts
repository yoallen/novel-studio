// Lets any part of the window make sure the open page is saved before doing something to the scene
// (deleting it, restoring an earlier version). Only one editor is open at a time.
let current: (() => Promise<void>) | null = null;
export function registerFlush(f: (() => Promise<void>) | null) { current = f; }
export async function flushEditor() { if (current) await current(); }
