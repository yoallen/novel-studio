// Built-in field templates for story elements. Every field is optional (R-A-069, R-A-074): fields are
// offered as places to put what she knows, and lens questions are prompts, never requirements.
// The author can add her own kinds and fields per novel (R-A-109); they merge with these.
// Private fields are off-page writing aids and never leave the program in manuscript exports (R-A-070).

export interface FieldDef {
  field: string;
  label: string;
  group: string;
  prompt?: string;
  multi?: boolean;      // several decided values can stand together (e.g. Ingermanson values)
  private?: boolean;    // writing aid, never exported as a story fact
  timed?: boolean;      // offers "when is this true" (backstory, start of story, during the story, not decided)
  identity?: boolean;   // shows "Not yet specified" and is never inferred (R-A-071)
  custom?: boolean;
}

export const TIMING = [
  { key: 'backstory', label: 'Before the story' },
  { key: 'story_start', label: 'True when the story opens' },
  { key: 'in_story', label: 'Happens during the story' },
  { key: 'unknown', label: 'Timing not decided' },
] as const;

const f = (group: string, field: string, label: string, extra: Partial<FieldDef> = {}): FieldDef => ({ group, field, label, ...extra });

const CHARACTER: FieldDef[] = [
  f('Role in the story', 'role', 'Role', { prompt: 'Co-lead, B-story lead, hidden engine, supporting, narrator, secret-keeper…' }),
  f('Role in the story', 'importance', 'Narrative importance', { prompt: 'Main, supporting or minor. Depth is judged against this, never against how many fields are filled.' }),
  f('Role in the story', 'narrates', 'Narrates?', { prompt: 'Whether and how this character narrates (viewpoint, grammatical person).' }),
  f('Role in the story', 'pov_withheld_until', 'Viewpoint withheld until', { prompt: 'For a secret keeper: the beat or moment before which we never get inside their head.' }),
  f('Role in the story', 'last_page', 'Last page, in one line', { prompt: 'If you wrote this character\'s last page in one line, who are they now?' }),

  f('Ingermanson', 'goal', 'Goal', { prompt: 'Concrete and reachable. What would winning look like?' }),
  f('Ingermanson', 'ambition', 'Ambition', { prompt: 'The abstract hunger underneath the goal. The gap between them is where the truest choices come from.' }),
  f('Ingermanson', 'values', 'Values', { multi: true, prompt: 'Finish "Nothing is more important than ___" as many ways as you can. The two or three that conflict are the engine.' }),
  f('Ingermanson', 'conflict', 'Conflict', { prompt: 'What blocks the goal?' }),
  f('Ingermanson', 'epiphany', 'Epiphany', { prompt: 'What do they learn?' }),

  f('Forces of antagonism', 'core_value', 'The value they live by', { prompt: 'The value under pressure in their own story.' }),
  f('Forces of antagonism', 'force_inner', 'Inner force', { prompt: 'What inside them works against them?' }),
  f('Forces of antagonism', 'force_personal', 'Personal force', { prompt: 'Who close to them works against them?' }),
  f('Forces of antagonism', 'force_extra_personal', 'Extra-personal force', { prompt: 'What in the wider world works against them?' }),
  f('Forces of antagonism', 'negation_of_negation', 'The worst form of their value', { prompt: 'Their value at its darkest, set for this book\'s tone.' }),

  f('Identity', 'ethnicity', 'Race or ethnicity', { identity: true }),
  f('Identity', 'age', 'Age', { identity: true, timed: true }),
  f('Identity', 'religion', 'Faith or religion', { identity: true }),
  f('Identity', 'culture', 'Culture and community', { identity: true }),
  f('Identity', 'occupation', 'Work', { identity: true, timed: true }),
  f('Identity', 'family', 'Family', { identity: true, timed: true }),
  f('Identity', 'appearance', 'Appearance', { identity: true }),

  f('Physical', 'physical', 'Physical notes', { multi: true, timed: true, prompt: 'Health, build, how they move, what people notice first.' }),
  f('Personality', 'temperament', 'Temperament'),
  f('Personality', 'humor', 'Humor', { prompt: 'What makes them funny, and what do they find funny?' }),
  f('Personality', 'habits', 'Habits and props', { multi: true, prompt: 'Make sure each habit belongs to the right character.' }),
  f('Personality', 'strengths', 'Strengths'),
  f('Personality', 'weaknesses', 'Weaknesses'),
  f('Environmental', 'home', 'Home and neighborhood', { timed: true }),
  f('Environmental', 'history', 'History', { multi: true, timed: true }),
  f('Psychological', 'fears', 'Fears'),
  f('Psychological', 'wounds', 'Wounds', { timed: true }),
  f('Psychological', 'desires', 'Desires'),
  f('Psychological', 'beliefs', 'Beliefs'),

  f('Depth lenses', 'motivation_conscious', 'What they think they want', { prompt: 'What does this person want beyond their plot function?' }),
  f('Depth lenses', 'motivation_unconscious', 'What drives them underneath'),
  f('Depth lenses', 'under_pressure', 'Under pressure', { prompt: 'How do they behave under pressure, uncertainty, success and failure?' }),
  f('Depth lenses', 'comic_engine', 'Comic engine', { prompt: 'What reliably makes them funny on the page?' }),
  f('Depth lenses', 'voice', 'Voice', { prompt: 'Vocabulary, rhythm, what they notice, how they joke. Never dialect as a shortcut.' }),
  f('Depth lenses', 'with_others', 'With different people', { multi: true, prompt: 'How do they act with a rival, an ally, family, a stranger?' }),
  f('Depth lenses', 'agency', 'Agency', { prompt: 'What do they make happen, rather than react to?' }),

  f('Contradiction layers', 'public_identity', 'Public identity'),
  f('Contradiction layers', 'private_identity', 'Private identity'),
  f('Contradiction layers', 'demonstrated_behavior', 'What they do'),
  f('Contradiction layers', 'underlying_motivation', 'Why they really do it'),

  f('Comparisons', 'comparisons', 'Like…', { multi: true, prompt: 'A person or character whose qualities you are borrowing. Note which qualities, so it never becomes a literal copy.' }),

  f('Writing aids (private)', 'tuning_fork', 'Casting tuning fork', { private: true, prompt: 'An actor whose voice and tempo help you write them. Never a description of the character.' }),
  f('Writing aids (private)', 'theme_music', 'Theme music', { private: true }),
  f('Writing aids (private)', 'playlist', 'Playlist', { private: true, multi: true }),
];

const ARC: FieldDef[] = [
  f('Arc', 'arc_value', 'Value this arc is about', { prompt: 'One character can carry more than one arc, each on a different value.' }),
  f('Arc', 'arc_type', 'Arc type', { prompt: 'Positive Change, Flat, Negative, or not decided.' }),
  f('Weiland Arc', 'ghost', 'Ghost', { timed: true, prompt: 'The formative experience that explains the Lie. It need not be tragic, but it must be personal and convincing.' }),
  f('Weiland Arc', 'lie', 'Lie', { prompt: 'The false belief that once felt protective.' }),
  f('Weiland Arc', 'want', 'Want', { prompt: 'What the Lie makes them chase.' }),
  f('Weiland Arc', 'need', 'Need', { prompt: 'The Truth that would heal them, usually the opposite of the Want.' }),
  f('Weiland Arc', 'truth', 'Truth'),
  f('Arc', 'key_tests', 'Key tests and turns', { multi: true }),
  f('Arc', 'final_state', 'Who they are at the end'),
  f('Arc', 'unresolved', 'Still unresolved', { multi: true }),
];

const RELATIONSHIP: FieldDef[] = [
  f('Where they stand', 'trust', 'Trust', { timed: true }),
  f('Where they stand', 'respect', 'Respect', { timed: true }),
  f('Where they stand', 'intimacy', 'Closeness', { timed: true }),
  f('Where they stand', 'resentment', 'Resentment', { timed: true }),
  f('Where they stand', 'dependence', 'Dependence', { timed: true }),
  f('Where they stand', 'rivalry', 'Rivalry', { timed: true }),
  f('Where they stand', 'power', 'Balance of power', { timed: true }),
  f('Underneath', 'shared_need', 'What they share underneath'),
  f('Underneath', 'external_opposition', 'Opposition on the surface'),
  f('Underneath', 'emotional_trajectory', 'Where the relationship is really going'),
  f('Underneath', 'hidden_influence', 'Hidden influence'),
  f('Underneath', 'false_assumptions', 'False assumptions', { multi: true }),
  f('Underneath', 'unequal_information', 'Who knows what the other does not', { multi: true }),
];

const PLACE: FieldDef[] = [
  f('Place', 'description', 'What it is like'),
  f('Place', 'atmosphere', 'Atmosphere'),
  f('Place', 'season', 'Season', { timed: true }),
  f('Place', 'who_is_here', 'Who is usually here', { multi: true }),
];

const EVENT: FieldDef[] = [
  f('What it does', 'function', 'What it must accomplish', { prompt: 'The dramatic job. This can be decided while how it happens stays open.' }),
  f('How it happens', 'execution', 'How it could happen', { prompt: 'Executions can sit side by side as possibilities until you choose one.' }),
  f('When', 'story_time', 'When it happens in the story'),
  f('Truth and knowledge', 'truth', 'What actually happened'),
  f('Truth and knowledge', 'who_knows', 'Who knows, and when', { multi: true }),
  f('Truth and knowledge', 'reader_knows', 'What the reader knows or suspects'),
  f('Truth and knowledge', 'layer', 'Visible or hidden story'),
];

const CLUE: FieldDef[] = [
  f('Clue', 'truth', 'What it really means'),
  f('Clue', 'significant', 'Significant enough that it must pay off?', { prompt: 'Not every detail needs to pay off. Mark the ones that do.' }),
  f('Clue', 'planted', 'Where it is planted', { multi: true }),
  f('Clue', 'paid_off', 'Where it pays off', { multi: true }),
  f('Clue', 'misread_as', 'What it is mistaken for'),
];

const LINE: FieldDef[] = [
  f('The line', 'speaker', 'Said by (in the story)'),
  f('The line', 'delivery', 'How it is delivered', { prompt: 'Emphasis, timing, physical business.' }),
  f('Where it goes', 'placement', 'Where it might go', { multi: true, prompt: 'Keeping a line does not place it. Candidates can sit side by side.' }),
];

const QUESTION: FieldDef[] = [
  f('Thinking it through', 'candidate_answer', 'Possible answers', { multi: true }),
  f('Thinking it through', 'assumption', 'Assumptions behind it', { multi: true }),
  f('Thinking it through', 'answer', 'Answer'),
];

const IDEA: FieldDef[] = [
  f('Thinking it through', 'what_it_changes', 'What it might change', { multi: true }),
  f('Thinking it through', 'where_it_fits', 'Where it might fit', { multi: true }),
];

const BEAT: FieldDef[] = [
  f('In this book', 'function', 'What this beat does in this book', { prompt: 'The turn it must deliver. This can be decided while the event stays open.' }),
  f('In this book', 'event', 'What it is (your plan)', { prompt: 'What happens here in this novel.' }),
  f('In this book', 'execution', 'How it could happen', { multi: true, prompt: 'Executions can sit side by side until you choose.' }),
  f('In this book', 'example', 'One way it could be done', { multi: true, prompt: 'Examples are never decisions.' }),
  f('In this book', 'classification', 'Disaster, discovery or win', { prompt: 'A disaster is a reversal, never a win. Finding is not winning.' }),
  f('In this book', 'caused_by_hero', 'Caused by the hero\'s own efforts?'),
  f('In this book', 'scene_type', 'Scene type', { prompt: 'Single Scene or Single Chapter; Single Beat; or Multi Scene or Multi Chapters.' }),
  f('On the board', 'theme_line', 'The line that states the theme'),
  f('On the board', 'home', 'Home'), f('On the board', 'work', 'Work'), f('On the board', 'play', 'Play'),
  f('On the board', 'debate_question', 'The Debate question'),
  f('On the board', 'want', "The hero's WANT"), f('On the board', 'need', "The hero's NEED"),
  f('On the board', 'polarity', 'False victory or false defeat'),
  f('On the board', 'whiff_of_death', 'Whiff of death'),
  f('On the board', 'final_change', 'Hero is changed, or rejects change'),
];

/** Which board fields each of her beats carries (R-C-018). */
export const BEAT_BOARD_FIELDS: Record<string, string[]> = {
  theme_stated: ['theme_line'], setup: ['home', 'work', 'play'], debate: ['debate_question'], break_into_two: ['want'],
  midpoint: ['polarity'], all_is_lost: ['polarity', 'whiff_of_death'], break_into_three: ['need'], final_image: ['final_change'],
};

const SCENE_PLAN: FieldDef[] = [
  f('The scene', 'purpose', 'What this scene must do'),
  f('The scene', 'objective', "The viewpoint character's objective"),
  f('The scene', 'conflict', 'The conflict (><)', { prompt: 'Who the players are, what each wants, what is in the way, and who wins.' }),
  f('The scene', 'outcome', 'Intended outcome or change'),
  f('The scene', 'value_start', 'Value at the start (+/-)'),
  f('The scene', 'value_end', 'Value at the end (+/-)', { prompt: 'Every scene has to turn.' }),
  f('Around it', 'how_we_got_here', 'How we got here'),
  f('Around it', 'what_must_follow', 'What must follow'),
  f('Around it', 'story_time', 'When (story time)'),
  f('Around it', 'location', 'Where'),
  f('Around it', 'classification', 'Disaster, discovery or win'),
  f('Story time', 'story_day', 'Day in the story', { prompt: 'A number on your story clock, such as day 3 of the feud.' }),
  f('Story time', 'story_date', 'Date'),
  f('Story time', 'time_of_day', 'Time of day'),
  f('Story time', 'elapsed', 'Time since the previous scene'),
  f('Atmosphere', 'season', 'Season'),
  f('Atmosphere', 'weather', 'Weather'),
  f('Atmosphere', 'physical_atmosphere', 'Physical atmosphere'),
  f('Atmosphere', 'emotional_atmosphere', 'Emotional atmosphere'),
  f('Atmosphere', 'sensory', 'Sensory details', { multi: true }),
  f('Atmosphere', 'consequence', 'What the setting does to the plot', { prompt: 'Mud after rain, heat that intensifies a smell, darkness that limits who can see.' }),
  f('What the reader knows', 'reader_suspects', 'What the reader suspects by the end of this scene'),
  f('What the reader knows', 'layer', 'Visible or hidden story', { prompt: 'Visible: what the viewpoint characters believe is happening. Hidden: what is actually happening.' }),
];

const STORYWORLD: FieldDef[] = [
  f('Time', 'era', 'Era or year'), f('Time', 'season', 'Season'), f('Time', 'atmosphere_now', 'The atmosphere now'),
  f('Time', 'duration', 'How long the story lasts', { prompt: 'A single week, a season, a year…' }), f('Time', 'day_counter', 'Name of your story clock', { prompt: 'For example: day of the feud.' }),
  f('Viewpoint', 'pov_approach', 'Viewpoint approach', { prompt: 'For example: alternating first person between two narrators.' }),
  f('Viewpoint', 'pov_rule', 'Viewpoint rule', { prompt: 'One viewpoint per scene, one per chapter, or no rule.' }),
  f('Viewpoint', 'pov_person', 'Default narrative person'), f('Viewpoint', 'pov_tense', 'Default tense'),
  f('Knowledge', 'hidden_truth', 'Does this book hide a truth from the reader?', { prompt: 'Turns on the reader-knowledge and secret-operations views.' }),
];

const HIDDEN_MOVE: FieldDef[] = [
  f('The move', 'when', 'When (beat or rough point)'), f('The move', 'move', 'The hidden move'),
  f('The move', 'others_see', 'What the others see, and how they misread it'), f('The move', 'blame', 'Who takes the blame'),
];

const SET_PIECE: FieldDef[] = [
  f('Set piece', 'job', 'The story job it performs'), f('Set piece', 'strands', 'Storylines it moves', { multi: true }),
  f('Set piece', 'shape', 'One card or a sequence'),
];

const STORYLINE: FieldDef[] = [
  f('Storyline', 'letter', 'Letter (A, B, C…)', { prompt: 'Optional. The letter is its role, not its identity.' }),
  f('Storyline', 'state', 'Where it stands', { prompt: 'Introduced, Developing, Escalating, Temporarily resolved, Dormant, Reopened, Resolved, Intentionally unresolved, or your own.' }),
  f('Storyline', 'resolution', 'Resolves now, or held open on purpose'),
  f('Storyline', 'values', 'Values it carries', { multi: true, prompt: 'Values ride the plot lines; they are not threads of their own.' }),
  f('Storyline', 'promises', 'Promises made to the reader', { multi: true }),
];

const MOTIF: FieldDef[] = [f('Motif', 'meaning', 'What it means', { multi: true, prompt: 'How its meaning changes across the book.' })];

const GENERIC: FieldDef[] = [f('Notes', 'description', 'Description')];

export const TEMPLATES: Record<string, FieldDef[]> = {
  character: CHARACTER,
  arc: ARC,
  relationship: RELATIONSHIP,
  location: PLACE,
  event: EVENT,
  clue: CLUE,
  reveal: EVENT,
  payoff: CLUE,
  line: LINE,
  beat: BEAT,
  scene_plan: SCENE_PLAN,
  storyworld: STORYWORLD,
  hidden_move: HIDDEN_MOVE,
  set_piece: SET_PIECE,
  storyline: STORYLINE,
  motif: MOTIF,
  question: QUESTION,
  idea: IDEA,
};

export const KIND_LABELS: Record<string, { label: string; plural: string }> = {
  character: { label: 'Character', plural: 'Characters' },
  arc: { label: 'Arc', plural: 'Arcs' },
  relationship: { label: 'Relationship', plural: 'Relationships' },
  storyline: { label: 'Storyline', plural: 'Storylines' },
  location: { label: 'Place', plural: 'Places' },
  object: { label: 'Object', plural: 'Objects' },
  event: { label: 'Event', plural: 'Events' },
  clue: { label: 'Clue', plural: 'Clues' },
  reveal: { label: 'Reveal', plural: 'Reveals' },
  payoff: { label: 'Payoff', plural: 'Payoffs' },
  theme: { label: 'Theme', plural: 'Themes' },
  value: { label: 'Value', plural: 'Values' },
  motif: { label: 'Motif', plural: 'Motifs' },
  rule: { label: 'Story rule', plural: 'Story rules' },
  research: { label: 'Research', plural: 'Research' },
  line: { label: 'Kept line', plural: 'Kept lines' },
  guardrail: { label: 'Guardrail', plural: 'Guardrails' },
  question: { label: 'Question', plural: 'Questions I have' },
  idea: { label: 'Idea', plural: "Things and ideas I'm thinking about" },
  thought: { label: 'Thought', plural: 'Captured thoughts' },
  note: { label: 'Note', plural: 'Notes' },
  act: { label: 'Act', plural: 'Acts' },
  sequence: { label: 'Sequence', plural: 'Sequences' },
  beat: { label: 'Beat', plural: 'Beats' },
  scene_plan: { label: 'Scene card', plural: 'Scene cards' },
  storyworld: { label: 'Story world', plural: 'Story world' },
  hidden_move: { label: 'Hidden move', plural: 'Secret operations' },
  set_piece: { label: 'Set piece', plural: 'Set pieces' },
};

export function templateFor(kind: string): FieldDef[] { return TEMPLATES[kind] ?? GENERIC; }
