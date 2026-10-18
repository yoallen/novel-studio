// How each kind of connection reads, in both directions, with a one-line explanation.
// A connection is stored once, from one record to another. On the "from" record it reads with `forward`,
// on the "to" record with `back`. {x} marks where the other record's name goes; without it, the name follows.

export interface RelationInfo {
  key: string;
  group: string;
  forward: string;
  back: string;
  about: string;
}

export const RELATION_GROUPS = ['Cause and effect', 'Setups, clues and secrets', 'Who knows what', 'Where and who', 'Echoes and sources', 'Music', 'Structure', 'General'] as const;

export const RELATION_INFO: RelationInfo[] = [
  { key: 'causes', group: 'Cause and effect', forward: 'causes', back: 'is caused by', about: 'One thing makes the other happen.' },
  { key: 'enables', group: 'Cause and effect', forward: 'makes possible', back: 'is made possible by', about: 'One thing opens the door for the other without forcing it.' },
  { key: 'motivates', group: 'Cause and effect', forward: 'motivates', back: 'is motivated by', about: 'A reason someone acts: a wound, a want, an event.' },
  { key: 'depends_on', group: 'Cause and effect', forward: 'depends on', back: 'is needed by', about: 'This cannot work unless the other is in place first.' },
  { key: 'advances', group: 'Cause and effect', forward: 'moves forward', back: 'is moved forward by', about: 'A scene or event that pushes a storyline, arc or question along.' },

  { key: 'plants', group: 'Setups, clues and secrets', forward: 'plants', back: 'is planted in', about: 'Where a setup or clue first appears. The Setups and payoffs check reads this.' },
  { key: 'pays_off', group: 'Setups, clues and secrets', forward: 'pays off', back: 'pays off in', about: 'Where a setup or clue comes back and matters. The Setups and payoffs check reads this.' },
  { key: 'foreshadows', group: 'Setups, clues and secrets', forward: 'foreshadows', back: 'is foreshadowed by', about: 'A hint of something that comes later.' },
  { key: 'reveals', group: 'Setups, clues and secrets', forward: 'reveals', back: 'is revealed in', about: 'Where a truth comes out to the reader or a character.' },
  { key: 'conceals', group: 'Setups, clues and secrets', forward: 'hides', back: 'is hidden in', about: 'Where a truth is kept out of sight on purpose.' },
  { key: 'raises', group: 'Setups, clues and secrets', forward: 'raises', back: 'is raised by', about: 'A scene or event that makes the reader ask a question.' },
  { key: 'answers', group: 'Setups, clues and secrets', forward: 'answers', back: 'is answered by', about: 'Where a question the story raised gets its answer.' },

  { key: 'knows', group: 'Who knows what', forward: 'knows', back: 'is known by', about: 'A character knows this truth. Who knows what reads this.' },
  { key: 'suspects', group: 'Who knows what', forward: 'suspects', back: 'is suspected by', about: 'A character half-knows or guesses this.' },
  { key: 'believes_falsely', group: 'Who knows what', forward: 'wrongly believes', back: 'is wrongly believed by', about: 'A character is sure of something that is not true.' },
  { key: 'can_see', group: 'Who knows what', forward: 'can see', back: 'can be seen by', about: 'A character is in a position to witness this.' },
  { key: 'cannot_see', group: 'Who knows what', forward: 'cannot see', back: 'cannot be seen by', about: 'A character is kept from witnessing this.' },

  { key: 'appears_in', group: 'Where and who', forward: 'appears in', back: 'has in it', about: 'A character, object or line shows up in a scene.' },
  { key: 'pov_of', group: 'Where and who', forward: 'is the viewpoint of', back: 'is seen through', about: 'Whose eyes a scene is told through.' },
  { key: 'located_at', group: 'Where and who', forward: 'happens at', back: 'is where {x} happens', about: 'Where a scene or event takes place.' },
  { key: 'member_of', group: 'Where and who', forward: 'is a member of', back: 'has as a member', about: 'A character belongs to a group, family or faction.' },
  { key: 'is_a', group: 'Where and who', forward: 'is a', back: 'includes', about: 'A character is one of a kind of being, such as a ghost or a dragon.' },
  { key: 'same_person_as', group: 'Where and who', forward: 'is the same person as', back: 'is the same person as', about: 'Two records for one person, such as a younger self.' },

  { key: 'mirrors', group: 'Echoes and sources', forward: 'mirrors', back: 'is mirrored by', about: 'Two things echo each other on purpose.' },
  { key: 'contradicts', group: 'Echoes and sources', forward: 'contradicts', back: 'is contradicted by', about: 'Two things cannot both be true. Worth a look.' },
  { key: 'calls_up', group: 'Echoes and sources', forward: 'calls up', back: 'is called up by', about: 'Something in the present brings back a memory.' },
  { key: 'inspired_by', group: 'Echoes and sources', forward: 'is inspired by', back: 'inspired', about: 'Where an idea came from, inside or outside the book.' },
  { key: 'retells', group: 'Echoes and sources', forward: 'retells', back: 'is retold in', about: 'Your version of a myth, legend or classic.' },
  { key: 'written_by', group: 'Echoes and sources', forward: 'is written by', back: 'wrote', about: 'Who wrote a letter, diary or other in-world document.' },

  { key: 'plays_in', group: 'Music', forward: 'plays in', back: 'has playing in it', about: 'A song heard in a scene.' },
  { key: 'theme_song_of', group: 'Music', forward: 'is the theme song of', back: 'has as its theme song', about: 'A song that belongs to a character or storyline.' },

  { key: 'contains', group: 'Structure', forward: 'contains', back: 'is inside', about: 'One part of the plan holds another, such as an act and its beats.' },
  { key: 'part_of', group: 'Structure', forward: 'is part of', back: 'has as a part', about: 'The other way of saying contains.' },
  { key: 'realizes', group: 'Structure', forward: 'carries out', back: 'is carried out by', about: 'A scene card that does the job a beat asks for.' },

  { key: 'relates_to', group: 'General', forward: 'relates to', back: 'relates to', about: 'A general tie when no other word fits.' },
];

const BY_KEY = new Map(RELATION_INFO.map((r) => [r.key, r]));

export function relationInfo(key: string): RelationInfo {
  return BY_KEY.get(key) ?? { key, group: 'General', forward: key.replace(/_/g, ' '), back: key.replace(/_/g, ' '), about: '' };
}

/** "happens at the garden" / "is where Opening image happens". The phrase only, the other name filled in. */
export function relationPhrase(key: string, direction: 'forward' | 'back', other: string): string {
  const info = relationInfo(key);
  const p = direction === 'forward' ? info.forward : info.back;
  return p.includes('{x}') ? p.replace('{x}', other) : `${p} ${other}`;
}

/** A whole sentence, read from the "from" record: "Opening image happens at the garden". */
export function relationSentence(key: string, from: string, to: string): string {
  return `${from} ${relationPhrase(key, 'forward', to)}`;
}
