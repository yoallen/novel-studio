// Notes left in the page for later: anything typed inside double brackets, [[like this]].
// She keeps writing; the note waits in a list until December. Notes are not story words, so they
// never count toward a scene, a day or a push. No other imports, so the screens can use it too.

/** One note: [[ then anything except brackets or a line break, then ]]. */
export const LATER_RE = /\[\[([^[\]\n]*)\]\]/g;

/** The text with every note taken out, for counting words. */
export function withoutLater(text: string): string {
  return text.replace(LATER_RE, ' ');
}

/** Every note in a piece of text, in order: what it says and where it sits. */
export function laterIn(text: string): { note: string; at: number; raw: string }[] {
  const out: { note: string; at: number; raw: string }[] = [];
  for (const m of text.matchAll(LATER_RE)) out.push({ note: m[1]!.trim(), at: m.index!, raw: m[0] });
  return out;
}
