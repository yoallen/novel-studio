// What a novel can be set up with (R-B-088 to R-B-095). Every list is optional and every list accepts her own entries.
// Selections are never decoration: each one switches on fields, views, questions or guidance somewhere in the program.

export type Role = 'primary' | 'secondary' | 'influence';

export interface GenreDef {
  key: string;
  name: string;
  /** What readers of this genre come for, in plain words. Shown as questions, never as rules. */
  asks: string[];
  /** Parts of the program this genre leans on. */
  leansOn: string[];
}

export const GENRES: GenreDef[] = [
  { key: 'comedy', name: 'Comedy', asks: ['Who is the comic engine, and what flaw do they keep acting on?', 'Does each comic set piece escalate from the one before?', 'What is the truth under the laughter?'], leansOn: ['running gags', 'escalation', 'voice'] },
  { key: 'mystery', name: 'Mystery', asks: ['Is every clue the solution needs planted before the reveal?', 'Could a careful reader reach the answer?', 'Which red herrings are fair, and what does each one hide?'], leansOn: ['setups and payoffs', 'who knows what', 'secret log'] },
  { key: 'thriller', name: 'Thriller', asks: ['What is the ticking clock?', 'What does the hero stand to lose, and does it grow?', 'Where does the reader know more than the hero?'], leansOn: ['timelines', 'who knows what', 'stakes'] },
  { key: 'horror', name: 'Horror', asks: ['What is the threat, and what are its rules?', 'Where does dread build before anything is seen?', 'What sin or choice let it in?'], leansOn: ['atmosphere', 'setups and payoffs'] },
  { key: 'romance', name: 'Romance', asks: ['What keeps the two apart, inside and out?', 'Where does each fall a little further?', 'Is the ending earned by change in both?'], leansOn: ['relationships', 'arcs'] },
  { key: 'historical', name: 'Historical Fiction', asks: ['Which real events does the story touch, and when?', 'What did people of the time believe that we no longer do?', 'Where might a detail be anachronistic?'], leansOn: ['timelines', 'storyworld'] },
  { key: 'fantasy', name: 'Fantasy', asks: ['What are the rules of the magic, and what does it cost?', 'What does the reader need to learn about the world, and when?'], leansOn: ['storyworld', 'who knows what'] },
  { key: 'science_fiction', name: 'Science Fiction', asks: ['What is the one big change, and what follows from it?', 'Which rules of the world must never break?'], leansOn: ['storyworld', 'guardrails'] },
  { key: 'literary', name: 'Literary Fiction', asks: ['What is the inner change, and how is it shown rather than told?', 'What image or motif carries the meaning?'], leansOn: ['arcs', 'motifs'] },
  { key: 'womens_fiction', name: "Women's Fiction", asks: ['What is the heroine\'s personal journey, apart from any romance?', 'Which relationships carry the change?'], leansOn: ['arcs', 'relationships'] },
  { key: 'suspense', name: 'Suspense', asks: ['What does the reader fear will happen?', 'Where is information held back on purpose?'], leansOn: ['who knows what', 'secret log'] },
  { key: 'crime', name: 'Crime', asks: ['What was the crime, step by step, as it really happened?', 'Who knows the truth, and when do they learn it?'], leansOn: ['secret log', 'timelines'] },
  { key: 'young_adult', name: 'Young Adult', asks: ['Whose coming of age is this?', 'Does the voice sound like the age it claims?'], leansOn: ['voice', 'arcs'] },
  { key: 'christian', name: 'Christian / Inspirational', asks: ['What faith question does the story hold?', 'Is grace shown in what characters do, not only in what they say?'], leansOn: ['arcs', 'theme'] },
  { key: 'family_saga', name: 'Family Saga', asks: ['Which generations, and what passes between them?', 'What is the family secret or wound?'], leansOn: ['relationships', 'timelines'] },
];

export interface StoryTypeDef { key: string; name: string; ingredients: { key: string; label: string; prompt: string }[]; about: string }

/** Blake Snyder's ten story types, kept apart from conventional genres (R-B-090). Each has three ingredients. */
export const STORY_TYPES: StoryTypeDef[] = [
  { key: 'monster_in_the_house', name: 'Monster in the House', about: 'Something deadly is loose in a confined space, and someone let it in.', ingredients: [{ key: 'monster', label: 'A monster', prompt: 'What hunts them?' }, { key: 'house', label: 'A house', prompt: 'Why can they not simply leave?' }, { key: 'sin', label: 'A sin', prompt: 'Whose wrong brought the monster in?' }] },
  { key: 'golden_fleece', name: 'Golden Fleece', about: 'A journey toward a prize that turns out to be about who the travelers become.', ingredients: [{ key: 'road', label: 'A road', prompt: 'What is the journey, across space or time?' }, { key: 'team', label: 'A team', prompt: 'Who goes, and what does each bring?' }, { key: 'prize', label: 'A prize', prompt: 'What are they after, and what do they find instead?' }] },
  { key: 'out_of_the_bottle', name: 'Out of the Bottle', about: 'A touch of magic arrives, and the hero learns a lesson before it leaves.', ingredients: [{ key: 'hero', label: 'A hero who deserves magic', prompt: 'Why this person, now?' }, { key: 'spell', label: 'A spell', prompt: 'What is the magic, and what are its rules?' }, { key: 'lesson', label: 'A lesson', prompt: 'What does the hero learn that outlasts the magic?' }] },
  { key: 'dude_with_a_problem', name: 'Dude with a Problem', about: 'An ordinary person is dropped into extraordinary trouble.', ingredients: [{ key: 'innocent', label: 'An innocent hero', prompt: 'Why did they not see it coming?' }, { key: 'event', label: 'A sudden event', prompt: 'What happens to them?' }, { key: 'battle', label: 'A life-or-death battle', prompt: 'What is at stake, literally or for the self?' }] },
  { key: 'rites_of_passage', name: 'Rites of Passage', about: 'A life problem everyone meets, met the wrong way first.', ingredients: [{ key: 'problem', label: 'A life problem', prompt: 'Loss, change, growing up, letting go?' }, { key: 'wrong_way', label: 'A wrong way to attack it', prompt: 'How do they avoid the real issue?' }, { key: 'acceptance', label: 'Acceptance of a hard truth', prompt: 'What do they finally accept?' }] },
  { key: 'buddy_love', name: 'Buddy Love', about: 'Two people who complete each other, though neither wants to admit it.', ingredients: [{ key: 'incomplete_hero', label: 'An incomplete hero', prompt: 'What is missing in them?' }, { key: 'counterpart', label: 'A counterpart', prompt: 'Who supplies it, and how are they opposite?' }, { key: 'complication', label: 'A complication', prompt: 'What keeps them apart or forces them together?' }] },
  { key: 'whydunit', name: 'Whydunit', about: 'An investigation that ends up revealing something dark about people, including us.', ingredients: [{ key: 'detective', label: 'A detective', prompt: 'Who investigates, officially or not?' }, { key: 'secret', label: 'A secret', prompt: 'What is hidden, and why does it matter?' }, { key: 'dark_turn', label: 'A dark turn', prompt: 'Where does the investigator break their own rules?' }] },
  { key: 'fool_triumphant', name: 'The Fool Triumphant', about: 'An underestimated person turns out to be wiser than the establishment.', ingredients: [{ key: 'fool', label: 'An undervalued fool', prompt: 'Who underestimates them, and why?' }, { key: 'establishment', label: 'An establishment', prompt: 'What group or system do they come up against?' }, { key: 'transmutation', label: 'A transmutation', prompt: 'How is the fool, or the establishment, changed?' }] },
  { key: 'institutionalized', name: 'Institutionalized', about: 'A group, its rules, and the cost of belonging.', ingredients: [{ key: 'group', label: 'A group', prompt: 'What is the group or institution?' }, { key: 'choice', label: 'A choice', prompt: 'Join, leave, or burn it down?' }, { key: 'sacrifice', label: 'A sacrifice', prompt: 'What does the choice cost?' }] },
  { key: 'superhero', name: 'Superhero', about: 'Someone extraordinary in an ordinary world, and what it costs them.', ingredients: [{ key: 'power', label: 'A special power', prompt: 'What sets them apart?' }, { key: 'nemesis', label: 'A nemesis', prompt: 'Who matches them, and how are they alike?' }, { key: 'curse', label: 'A curse', prompt: 'What does being special cost?' }] },
];

export interface CharacteristicDef { key: string; name: string; group: string; turnsOn?: string }

/** Narrative characteristics, separate from genre (R-B-092). turnsOn names what the selection switches on. */
export const CHARACTERISTICS: CharacteristicDef[] = [
  { key: 'first_person', name: 'First person', group: 'Viewpoint' },
  { key: 'third_limited', name: 'Third person limited', group: 'Viewpoint' },
  { key: 'third_omniscient', name: 'Third person omniscient', group: 'Viewpoint' },
  { key: 'second_person', name: 'Second person', group: 'Viewpoint' },
  { key: 'multiple_pov', name: 'Alternating or multiple viewpoints', group: 'Viewpoint', turnsOn: 'Viewpoint coverage and the one-head-per-scene question' },
  { key: 'single_protagonist', name: 'Single protagonist', group: 'Construction' },
  { key: 'dual_protagonist', name: 'Dual protagonists', group: 'Construction', turnsOn: 'Two arcs side by side in the arc view' },
  { key: 'ensemble', name: 'Ensemble cast', group: 'Construction', turnsOn: 'Presence across scenes for every main character' },
  { key: 'dramatic_irony', name: 'Dramatic irony', group: 'Information', turnsOn: 'What the reader knows that characters do not, scene by scene' },
  { key: 'hidden_truth', name: 'A hidden truth or secret', group: 'Information', turnsOn: 'The secret operations log and visible versus hidden story' },
  { key: 'unreliable_narrator', name: 'Unreliable narrator', group: 'Information', turnsOn: '"What the narrator believes" beside "What is actually true" on each scene' },
  { key: 'red_herrings', name: 'Misdirection and red herrings', group: 'Information', turnsOn: 'Red herrings tracked with what each one hides' },
  { key: 'linear', name: 'Linear timeline', group: 'Time' },
  { key: 'nonlinear', name: 'Nonlinear or out of order', group: 'Time', turnsOn: 'Story time beside reading order on each scene' },
  { key: 'dual_timeline', name: 'Dual timeline', group: 'Time', turnsOn: 'A timeline strand on each scene' },
  { key: 'frame_story', name: 'Frame story', group: 'Time', turnsOn: 'A timeline strand on each scene' },
  { key: 'flashbacks', name: 'Flashbacks', group: 'Time', turnsOn: 'Story time beside reading order on each scene' },
  { key: 'running_gags', name: 'Running gags and callbacks', group: 'Technique', turnsOn: 'Callbacks on each scene, checked like setups and payoffs' },
  { key: 'foreshadowing', name: 'Foreshadowing', group: 'Technique', turnsOn: 'Setups and payoffs checked both ways' },
  { key: 'intrusive_narrator', name: 'Intrusive narrator', group: 'Technique' },
  { key: 'chapter_titles', name: 'Titled chapters ("In which…")', group: 'Technique' },
  { key: 'epistolary', name: 'Letters, documents or transcripts', group: 'Form' },
  { key: 'series', name: 'Part of a series', group: 'Form' },
  { key: 'novella', name: 'Novella length', group: 'Form' },
  { key: 'comic_tone', name: 'Comic', group: 'Tone' },
  { key: 'warm_tone', name: 'Warm', group: 'Tone' },
  { key: 'dark_tone', name: 'Dark', group: 'Tone' },
  { key: 'satirical', name: 'Satirical', group: 'Tone' },
];

export interface FrameworkDef {
  key: string;
  name: string;
  kind: 'structure' | 'lens' | 'method' | 'none';
  job: string;              // what job this framework performs, in plain words
  structure?: string;       // beat sheet it brings
  fieldGroups?: { kind: string; group: string }[];   // field groups it switches on
}

/** "My Storytelling Toolkit" (R-B-093). No framework is required; combinations are deliberate. */
export const FRAMEWORKS: FrameworkDef[] = [
  { key: 'save_the_cat', name: 'Save the Cat (Brody for novels)', kind: 'structure', structure: 'save_the_cat', job: 'The spine: fifteen beats placed by percentage of the book, and the board that turns beats into scenes.', fieldGroups: [{ kind: 'beat', group: 'On the board' }] },
  { key: 'heros_journey', name: "The Hero's Journey", kind: 'structure', structure: 'heros_journey', job: 'Twelve stages of departure, ordeal and return, in Christopher Vogler\'s telling.' },
  { key: 'story_circle', name: 'Story Circle', kind: 'structure', structure: 'story_circle', job: "Dan Harmon's eight steps: a character goes somewhere unfamiliar, pays a price, and comes back changed." },
  { key: 'seven_point', name: 'Seven-Point Structure', kind: 'structure', structure: 'seven_point', job: "Dan Wells's method: decide the ending first, then the opposite beginning, then the turns that connect them." },
  { key: 'three_act', name: 'Three-Act Structure', kind: 'structure', structure: 'three_act', job: 'Setup, confrontation and resolution, with the turning points between them.' },
  { key: 'mckee', name: 'McKee (Story)', kind: 'lens', job: 'The depth: the controlling idea, the gap between expectation and result, forces of antagonism and the value scale.', fieldGroups: [{ kind: 'character', group: 'Forces of antagonism' }, { kind: 'storyworld', group: 'Controlling idea' }] },
  { key: 'weiland', name: 'Weiland (character arcs)', kind: 'lens', job: 'The arc: the Lie, the Ghost, the Want and the Need, and how the inside changes with the outside.', fieldGroups: [{ kind: 'arc', group: 'Weiland Arc' }] },
  { key: 'snowflake', name: 'Snowflake (Ingermanson)', kind: 'method', job: 'The build: grow the novel from one sentence outward, and know each character\'s values, ambition and goal.', fieldGroups: [{ kind: 'character', group: 'Ingermanson' }] },
  { key: 'swain', name: 'Scene and Sequel (Swain)', kind: 'method', job: 'The scene engine: goal, conflict and disaster, then reaction, dilemma and decision.', fieldGroups: [{ kind: 'scene_plan', group: 'Scene and sequel' }] },
  { key: 'moral_premise', name: 'The Moral Premise (Williams)', kind: 'lens', job: 'The thematic truth as an equation: a vice leads to defeat, a virtue leads to success.', fieldGroups: [{ kind: 'storyworld', group: 'Moral premise' }] },
  { key: 'thesauri', name: 'The Writers Helping Writers thesauri (Ackerman and Puglisi)', kind: 'lens', job: "Show, don't tell: the wound and the behavior it leaves, traits and flaws with their roots, and emotion carried by the body.", fieldGroups: [{ kind: 'character', group: 'Wound and its fallout' }, { kind: 'character', group: 'Traits and flaws' }, { kind: 'scene_plan', group: 'Emotion on the page' }] },
  { key: 'discovery', name: 'I find my story as I write', kind: 'none', job: 'No outline. Write, and let the program keep track of what you discover.' },
];

/** Characteristics that switch on field groups. */
export const CHARACTERISTIC_FIELDS: Record<string, { kind: string; group: string }[]> = {
  unreliable_narrator: [{ kind: 'scene_plan', group: 'Narrator and truth' }],
  dual_timeline: [{ kind: 'scene_plan', group: 'Timeline strand' }],
  frame_story: [{ kind: 'scene_plan', group: 'Timeline strand' }],
  running_gags: [{ kind: 'scene_plan', group: 'Callbacks' }],
  red_herrings: [{ kind: 'clue', group: 'Red herring' }],
};

/** Field groups that appear only when a framework or characteristic asks for them, once a novel's toolkit is set. */
export const CONDITIONAL_GROUPS: { kind: string; group: string; by: string[] }[] = [
  ...FRAMEWORKS.flatMap((f) => (f.fieldGroups ?? []).map((g) => ({ ...g, by: [f.key] }))),
  ...Object.entries(CHARACTERISTIC_FIELDS).flatMap(([k, gs]) => gs.map((g) => ({ ...g, by: [k] }))),
].reduce((acc, g) => {
  const same = acc.find((x) => x.kind === g.kind && x.group === g.group);
  if (same) same.by.push(...g.by); else acc.push({ ...g, by: [...g.by] });
  return acc;
}, [] as { kind: string; group: string; by: string[] }[]);
