// Some groups of fields are named after the teacher they come from. On screen they get a plain name
// first, with the teacher in small type, so a writer who has never met the method still knows what it is for.
// The stored group name never changes; only how it is shown.

export const GROUP_PLAIN: Record<string, { name: string; from: string }> = {
  Ingermanson: { name: 'Goal and motive', from: 'Ingermanson' },
  'Forces of antagonism': { name: 'What works against them', from: 'McKee, forces of antagonism' },
  'Weiland Arc': { name: 'Lie and truth', from: 'Weiland' },
  'Wound and its fallout': { name: 'Wound and its fallout', from: 'Ackerman and Puglisi' },
  'Traits and flaws': { name: 'Traits and flaws', from: 'Ackerman and Puglisi' },
  'Emotion on the page': { name: 'Emotion on the page', from: 'Ackerman and Puglisi' },
  'Moral premise': { name: 'Moral premise', from: 'Williams' },
  'Controlling idea': { name: 'Controlling idea', from: 'McKee' },
  'Scene and sequel': { name: 'Scene and sequel', from: 'Swain' },
  'On the board': { name: "Save the Cat's questions for this beat", from: 'Save the Cat' },
  'The core': { name: 'The heart of the book', from: 'Ingermanson, the Snowflake' },
};

/** "Goal and motive (Ingermanson)", for places that show a group name as plain text. */
export function groupTitle(group: string): string {
  const g = GROUP_PLAIN[group];
  return g ? `${g.name} (${g.from})` : group;
}
