// Word-level comparison of two versions of a scene, for the revision view.
export type Part = { kind: 'same' | 'added' | 'removed'; text: string };

export function diffWords(a: string, b: string): Part[] {
  const A = a.split(/(\s+)/), B = b.split(/(\s+)/);
  // Trim common prefix and suffix so long scenes stay fast.
  let start = 0; while (start < A.length && start < B.length && A[start] === B[start]) start++;
  let endA = A.length, endB = B.length;
  while (endA > start && endB > start && A[endA - 1] === B[endB - 1]) { endA--; endB--; }
  const midA = A.slice(start, endA), midB = B.slice(start, endB);
  const out: Part[] = [];
  if (start) out.push({ kind: 'same', text: A.slice(0, start).join('') });
  if (midA.length * midB.length > 4_000_000) {
    if (midA.length) out.push({ kind: 'removed', text: midA.join('') });
    if (midB.length) out.push({ kind: 'added', text: midB.join('') });
  } else {
    const n = midA.length, m = midB.length;
    const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i]![j] = midA[i] === midB[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
    let i = 0, j = 0;
    const push = (kind: Part['kind'], t: string) => { const last = out[out.length - 1]; if (last && last.kind === kind) last.text += t; else out.push({ kind, text: t }); };
    while (i < n && j < m) {
      if (midA[i] === midB[j]) { push('same', midA[i]!); i++; j++; }
      else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) { push('removed', midA[i]!); i++; }
      else { push('added', midB[j]!); j++; }
    }
    while (i < n) push('removed', midA[i++]!);
    while (j < m) push('added', midB[j++]!);
  }
  if (endA < A.length) out.push({ kind: 'same', text: A.slice(endA).join('') });
  return out;
}
