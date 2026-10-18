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
  suggestions?: string[]; // words she can tap to fill in; she can always write her own
  custom?: boolean;
  own?: boolean;         // added by her to one element only
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
  f('Role in the story', 'essence', 'Who they are', { prompt: 'In a sentence or two, who this person is.' }),
  f('Role in the story', 'facts', 'Other facts about them', { multi: true }),
  f('Role in the story', 'importance', 'Narrative importance', { prompt: 'Main, supporting or minor. Depth is judged against this, never against how many fields are filled.' }),
  f('Role in the story', 'narrates', 'Narrates?', { prompt: 'Whether and how this character narrates (viewpoint, grammatical person).' }),
  f('Role in the story', 'pov_withheld_until', 'Viewpoint withheld until', { prompt: 'For a secret keeper: the beat or moment before which we never get inside their head.' }),
  f('Role in the story', 'stakes', 'What they stand to lose', { prompt: 'If they fail, what is gone for good?' }),
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

  // Identity is always in her own words. Suggestions are a convenience, never a list to choose from.
  f('Identity', 'gender', 'Gender identity', { identity: true, prompt: 'In your own words. Used for checks such as the Bechdel test; never assumed from a name.', suggestions: ['Woman', 'Man', 'Nonbinary', 'Trans woman', 'Trans man', 'Genderqueer', 'Genderfluid', 'Agender', 'Two-Spirit', 'Questioning'] }),
  f('Identity', 'pronouns', 'Pronouns', { identity: true, timed: true, suggestions: ['she/her', 'he/him', 'they/them', 'she/they', 'he/they', 'ze/zir', 'xe/xem', 'any pronouns', 'name only'] }),
  f('Identity', 'orientation', 'Sexual orientation', { identity: true, timed: true, prompt: 'Only if it matters to who they are or to the story. Leaving it unsaid is a choice too.', suggestions: ['Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Asexual', 'Demisexual', 'Queer', 'Questioning'] }),
  f('Identity', 'romantic_orientation', 'Romantic orientation, if it differs', { identity: true, suggestions: ['Aromantic', 'Biromantic', 'Panromantic', 'Homoromantic', 'Heteroromantic', 'Demiromantic'] }),
  f('Identity', 'sex_characteristics', 'Intersex or sex characteristics, if it matters', { identity: true, suggestions: ['Intersex'] }),
  f('Identity', 'ethnicity', 'Race or ethnicity', { identity: true }),
  f('Identity', 'heritage', 'Heritage, nationality and roots', { identity: true, prompt: 'Where their people are from, where they were raised, what they call home.' }),
  f('Identity', 'age', 'Age', { identity: true, timed: true }),
  f('Beyond human', 'being', 'Kind of being', { prompt: 'Connect them to its record (is a) for everything their kind shares.' }),
  f('Beyond human', 'powers', 'Their own powers or abilities', { multi: true }),
  f('Beyond human', 'own_limits', 'Their own limits and weaknesses', { multi: true }),
  f('Identity', 'born', 'Year born', { prompt: 'With a year on each scene, the program works out their age everywhere.' }),
  f('Identity', 'fixed_age', 'Age, if it never changes', { prompt: 'For a younger self who stays eight, a ghost, or anyone outside time.' }),
  f('Identity', 'religion', 'Faith or religion', { identity: true }),
  f('Identity', 'culture', 'Culture and community', { identity: true }),
  f('Identity', 'disability', 'Disability, chronic illness or neurodivergence', { identity: true, timed: true, prompt: 'How it shapes their days, in their terms. Never a plot device by default.' }),
  f('Identity', 'occupation', 'Work', { identity: true, timed: true }),
  f('Identity', 'family', 'Family', { identity: true, timed: true }),

  f('Appearance', 'appearance', 'The overall look', { identity: true, prompt: 'What someone notices first, from across a room.' }),
  f('Appearance', 'skin', 'Skin tone', { identity: true, prompt: 'In your own words: depth, undertone, how light finds it.' }),
  f('Appearance', 'hair', 'Hair', { identity: true, timed: true, prompt: 'Color, texture, length and how they wear it. Hair changes; mark when.' }),
  f('Appearance', 'eyes', 'Eyes', { identity: true }),
  f('Appearance', 'height', 'Height', { identity: true }),
  f('Appearance', 'build', 'Build and body', { identity: true, timed: true }),
  f('Appearance', 'features', 'Distinctive features', { identity: true, multi: true, prompt: 'Scars, tattoos, birthmarks, glasses, a gap in the teeth.' }),
  f('Appearance', 'dress', 'How they dress', { timed: true }),

  f('Language and voice', 'languages', 'Languages they speak', { identity: true, multi: true, prompt: 'And how well: native, fluent, conversational, a few phrases.' }),
  f('Language and voice', 'accent', 'Accent and how they sound', { identity: true, prompt: 'Rhythm and word choice carry a voice better than spelled-out dialect.' }),
  f('Language and voice', 'speech', 'Sayings and verbal habits', { multi: true }),

  f('Physical', 'physical', 'Physical notes', { multi: true, timed: true, prompt: 'Health, energy, how they move.' }),
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

  f('Wound and its fallout', 'wound_event', 'The wounding event', { timed: true, prompt: 'What happened, and how old they were. Weiland calls this the Ghost.' }),
  f('Wound and its fallout', 'wound_belief', 'What they came to believe because of it'),
  f('Wound and its fallout', 'wound_fear', 'What they fear will happen again'),
  f('Wound and its fallout', 'wound_guards', 'What they avoid or guard against now', { multi: true }),
  f('Wound and its fallout', 'wound_behaviors', 'How it shows in what they do', { multi: true }),
  f('Wound and its fallout', 'wound_triggers', 'What sets it off', { multi: true }),
  f('Traits and flaws', 'positive_traits', 'Positive traits', { multi: true, prompt: 'Where each one came from, and how it shows without being named.' }),
  f('Traits and flaws', 'flaws', 'Flaws', { multi: true, prompt: 'What each one protects them from, and what it costs.' }),
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
  f('Between them', 'their_names', 'What they call each other', { multi: true, prompt: 'The names nobody else uses. Tabs and Tee.' }),
  f('Between them', 'private_words', 'Words only they share', { multi: true, prompt: 'Their private language: the word, and what it means to them.' }),
];

const PLACE: FieldDef[] = [
  f('Place', 'description', 'What it is like'),
  f('Place', 'atmosphere', 'Atmosphere'),
  f('Place', 'season', 'Season', { timed: true }),
  f('Place', 'who_is_here', 'Who is usually here', { multi: true }),
  f('Settlement', 'governs', 'Who governs, and how'),
  f('Settlement', 'economy', 'How people earn a living'),
  f('Settlement', 'water_food', 'Water and food'),
  f('Settlement', 'roads_power', 'Roads, travel and power', { prompt: 'How people and goods move, and what keeps the lights (or fires) on.' }),
  f('Settlement', 'defense', 'Defenses'),
  f('Settlement', 'districts', 'Neighborhoods and districts', { multi: true }),
  f('Settlement', 'rich_poor', 'Who is rich and who is poor, and where each lives'),
  f('Settlement', 'population', 'Who lives here, and how many'),
  f('Settlement', 'senses', 'What it sounds and smells like'),
  f('Between worlds', 'which_world', 'Which world this place is in', { prompt: 'Our world, the hidden one inside it, or a world of its own.' }),
  f('Between worlds', 'crossings', 'Doorways and crossing points', { multi: true }),
  f('Between worlds', 'crossing_rules', 'The rules for crossing, and what it costs'),
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
  f('Red herring', 'red_herring', 'Is this a red herring?', { prompt: 'A false trail on purpose.' }),
  f('Red herring', 'hides', 'What it draws attention away from'),
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
  f('On the board', 'home', 'Home', { prompt: 'The hero at home before the story changes it: who they live with, how it feels.' }),
  f('On the board', 'work', 'Work', { prompt: 'The hero at work, or at whatever fills their days.' }),
  f('On the board', 'play', 'Play', { prompt: 'The hero at play: what they do for fun, or what they gave up.' }),
  f('On the board', 'things_to_fix', 'Six things that need fixing', { multi: true, prompt: 'Flaws or problems in the hero\'s life, shown in the Setup. Each one gets paid off or fixed later in the book. Add them one at a time.' }),
  f('On the board', 'debate_question', 'The Debate question'),
  f('On the board', 'want', "The hero's WANT"), f('On the board', 'need', "The hero's NEED"),
  f('On the board', 'polarity', 'False victory or false defeat'),
  f('On the board', 'whiff_of_death', 'Whiff of death'),
  f('On the board', 'final_change', 'Hero is changed, or rejects change'),
];

/** Which board fields each of her beats carries (R-C-018). */
export const BEAT_BOARD_FIELDS: Record<string, string[]> = {
  theme_stated: ['theme_line'], setup: ['home', 'work', 'play', 'things_to_fix'], debate: ['debate_question'], break_into_two: ['want'],
  midpoint: ['polarity'], all_is_lost: ['polarity', 'whiff_of_death'], break_into_three: ['need'], final_image: ['final_change'],
};

const SCENE_PLAN: FieldDef[] = [
  f('The scene', 'purpose', 'What this scene must do'),
  f('The scene', 'objective', "The viewpoint character's objective"),
  f('The scene', 'conflict', 'The conflict', { prompt: 'Who is up against whom: the players, what each wants, what is in the way, and who wins.' }),
  f('The scene', 'outcome', 'Intended outcome or change'),
  f('The scene', 'value_start', 'Value at the start', { prompt: 'What is at stake for the viewpoint character as the scene opens, and whether it stands well (+) or badly (-). For example: Safety +.' }),
  f('The scene', 'value_end', 'Value at the end', { prompt: 'Where that value stands when the scene ends. Every scene has to turn: a + that ends -, or a - that ends +.' }),
  f('Around it', 'how_we_got_here', 'How we got here'),
  f('Around it', 'what_must_follow', 'What must follow'),
  f('Around it', 'story_time', 'When (story time)'),
  f('Around it', 'location', 'Where'),
  f('Around it', 'classification', 'Disaster, discovery or win'),
  f('Story time', 'story_day', 'Day in the story', { prompt: 'A number on your story clock, such as day 3 of the feud.' }),
  f('Story time', 'story_date', 'Date'),
  f('Story time', 'story_year', 'Year', { prompt: 'The year this scene happens. With birth years on characters, it gives everyone\'s age here.' }),
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
  f('Scene and sequel', 'scene_kind', 'Scene or sequel', { prompt: 'A scene: goal, conflict, disaster. A sequel: reaction, dilemma, decision. The decision becomes the next scene\'s goal.' }),
  f('Scene and sequel', 'reaction', 'Reaction'),
  f('Scene and sequel', 'dilemma', 'Dilemma'),
  f('Scene and sequel', 'decision', 'Decision', { prompt: 'This becomes the goal of the next scene.' }),
  f('Emotion on the page', 'pov_emotion', "The viewpoint character's main emotion here"),
  f('Emotion on the page', 'outward_signals', 'What the body shows', { multi: true, prompt: 'Gestures, posture, voice, actions.' }),
  f('Emotion on the page', 'inner_sensations', 'What they feel inside', { multi: true }),
  f('Emotion on the page', 'mental_responses', 'What their thoughts do', { multi: true }),
  f('Emotion on the page', 'hidden_emotion', 'What they try to hide, and what leaks out'),
  f('Narrator and truth', 'narrator_believes', 'What the narrator believes here'),
  f('Who tells it', 'apparent_narrator', 'Who seems to be telling this'),
  f('Who tells it', 'true_narrator', 'Who is really telling it', { prompt: 'A chapter told through someone else\'s memory of a person. The reader learns the difference when you decide.' }),
  f('Who tells it', 'revealed_at', 'Where the reader finds out'),
  f('Narrator and truth', 'actually_true', 'What is actually true', { prompt: 'The gap between these two is what the reader may or may not catch.' }),
  f('Timeline strand', 'timeline_strand', 'Which timeline', { prompt: 'Then or now, the frame or the tale, or your own names for the strands.' }),
  f('Callbacks', 'callbacks', 'Callbacks and running gags here', { multi: true, prompt: 'Name the gag. Each return should twist it a little further.' }),
  f('Reader response', 'reader_response', 'What you want the reader to feel', { multi: true, suggestions: ['Profound', 'Funny', 'Relatable', 'Shocking'], prompt: 'The colored tab a reader would stick here, to find it again: purple for profound, pink for funny, yellow for relatable, green for shocking, or your own word. Narrative Zoom shows them chapter by chapter under Reader response.' }),
  f('Heat', 'heat_on_page', 'What is on the page', { prompt: 'How far the scene goes, so the heat stays consistent with the rest of the book.' }),
  f('Heat', 'heat_changes', 'What the intimacy changes between them', { prompt: 'Every intimate scene should move the relationship, not only the temperature.' }),
];

const SONG: FieldDef[] = [
  f('The song', 'artist', 'Artist'),
  f('The song', 'year', 'Year it came out'),
  f('The song', 'carries', 'What it carries', { prompt: 'The feeling or memory this song holds in the story. Titles only, never lyrics.' }),
  f('The song', 'when_it_plays', 'When it plays', { prompt: 'On a radio, in a memory, at the wedding, as a chapter title…' }),
];

const INTERVIEW: FieldDef[] = [
  f('Answer', 'answer', 'Their answer, in their own voice', { prompt: 'Answer as the character. Then say it out loud without looking.' }),
  f('Answer', 'said_aloud', 'Said out loud without looking?', { suggestions: ['Yes, it held', 'Not yet', 'It fell apart'] }),
];

const BEING: FieldDef[] = [
  f('The kind', 'what_they_are', 'What they are'),
  f('The kind', 'origin', 'Where they come from'),
  f('The kind', 'body_senses', 'Body and senses', { prompt: 'What they see, hear or feel that humans cannot, and what they cannot.' }),
  f('The kind', 'lifespan', 'Lifespan'),
  f('The kind', 'abilities', 'Abilities', { multi: true }),
  f('The kind', 'limits', 'Limits and weaknesses', { multi: true, prompt: 'Limits make better stories than powers. What can they never do?' }),
  f('Among others', 'see_humans', 'How they see humans'),
  f('Among others', 'seen_by_humans', 'How humans see them'),
  f('Among others', 'among_them', 'How they live among their own'),
];

const MAGIC: FieldDef[] = [
  f('The power', 'source', 'Where it comes from'),
  f('The power', 'who_can', 'Who can use it, and how they learn'),
  f('The power', 'cost', 'What it costs the one who uses it'),
  f('The power', 'never', 'What it can never do', { multi: true, prompt: 'A magic system\'s limits make better stories than its powers. Readers enjoy a solution only when they understood the rules before it.' }),
  f('The power', 'misuse', 'What happens when it is misused'),
  f('The power', 'signs', 'What it looks, sounds or feels like'),
  f('The power', 'known_by', 'Who knows it exists'),
];

const CULTURE: FieldDef[] = [
  f('The people', 'customs', 'Customs', { multi: true }),
  f('The people', 'values', 'What they value most', { multi: true }),
  f('The people', 'taboos', 'Taboos', { multi: true }),
  f('The people', 'food', 'Food and drink'),
  f('The people', 'dress', 'Dress'),
  f('The people', 'celebrations', 'Celebrations and rites', { multi: true }),
  f('The people', 'outsiders', 'How they treat outsiders'),
  f('The people', 'speech', 'Their language and way of speaking'),
];

const FACTION: FieldDef[] = [
  f('The group', 'wants', 'What they want'),
  f('The group', 'leader', 'Who leads them'),
  f('The group', 'controls', 'What they control'),
  f('The group', 'power_over', 'Who they hold power over, and who holds power over them'),
  f('The group', 'methods', 'How they get what they want'),
  f('The group', 'secrets', 'What they hide', { multi: true }),
];

const BELIEF: FieldDef[] = [
  f('The faith', 'gods', 'Gods, spirits or powers'),
  f('The faith', 'core', 'What believers hold true'),
  f('The faith', 'rituals', 'Rituals', { multi: true }),
  f('The faith', 'speaks_for', 'Who speaks for it'),
  f('The faith', 'heresies', 'Heresies and doubts', { multi: true }),
  f('The faith', 'daily_life', 'How it shapes daily life'),
];

const LANGUAGE: FieldDef[] = [
  f('The language', 'sound', 'How it sounds'),
  f('The language', 'names', 'Naming patterns'),
  f('The language', 'words', 'Words and their meanings', { multi: true, prompt: 'One at a time: the word, then what it means.' }),
  f('The language', 'who_speaks', 'Who speaks it, and how well'),
];

const SOURCE: FieldDef[] = [
  f('The original', 'tradition', 'Where it comes from', { prompt: 'The myth, tradition, culture or author.' }),
  f('The original', 'original', 'What happens in the original'),
  f('The original', 'public_domain', 'Is the original in the public domain?', { suggestions: ['Yes', 'No', 'Not sure'] }),
  f('Your version', 'keeps', 'What you keep', { multi: true }),
  f('Your version', 'changes', 'What you change, and why', { multi: true }),
  f('Your version', 'honoring', 'How you honor the source', { prompt: 'Especially for a living tradition or a culture not your own.' }),
];

const DOCUMENT: FieldDef[] = [
  f('The document', 'form', 'What kind it is', { suggestions: ['Diary', 'Letter', 'Lore', 'Epigraph', 'Transcript', 'Report', 'Scripture'] }),
  f('The document', 'written_by', 'Who wrote it'),
  f('The document', 'when_written', 'When it was written'),
  f('The document', 'reveals', 'What it reveals'),
  f('The document', 'reliable', 'Can it be trusted?'),
  f('The document', 'placement', 'Where it appears in the book'),
];

const ERA: FieldDef[] = [
  f('The era', 'span', 'When', { prompt: 'Years, an age, or "before the Breaking".' }),
  f('The era', 'what_happened', 'What happened'),
  f('The era', 'legacy', 'What it left that the story still feels'),
  f('The era', 'who_remembers', 'Who remembers it, and how', { multi: true }),
];

const STORYWORLD: FieldDef[] = [
  f('Time', 'era', 'Era or year'), f('Time', 'season', 'Season'), f('Time', 'atmosphere_now', 'The atmosphere now'),
  f('Time', 'duration', 'How long the story lasts', { prompt: 'A single week, a season, a year…' }), f('Time', 'day_counter', 'Name of your story clock', { prompt: 'For example: day of the feud.' }),
  f('Viewpoint', 'pov_approach', 'Viewpoint approach', { prompt: 'For example: alternating first person between two narrators.' }),
  f('Viewpoint', 'pov_rule', 'Viewpoint rule', { prompt: 'One viewpoint per scene, one per chapter, or no rule.' }),
  f('Viewpoint', 'pov_person', 'Default narrative person'), f('Viewpoint', 'pov_tense', 'Default tense'),
  f('Knowledge', 'hidden_truth', 'Does this book hide a truth from the reader?', { prompt: 'Turns on the reader-knowledge and secret-operations views.' }),
  f('The core', 'logline', 'The one sentence', { prompt: 'The whole book squeezed until only its central irony is left. About twenty-five words.' }),
  f('The core', 'paragraph', 'The one paragraph', { prompt: 'Setup, three disasters, and the ending, one sentence each.' }),
  f('The core', 'ending', 'How it might end', { prompt: 'A guess is fine. Endings found early give the middle somewhere to go.' }),
  f('Moral premise', 'vice', 'The vice', { prompt: '[Vice] leads to defeat…' }),
  f('Moral premise', 'virtue', 'The virtue', { prompt: '…but [virtue] leads to success.' }),
  f('Moral premise', 'moral_premise', 'The moral premise, as one sentence'),
  f('Controlling idea', 'controlling_idea', 'Controlling idea', { prompt: 'McKee: the value and the cause that makes it change, in one sentence.' }),
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
  f('Storyline', 'story_type', 'Story type', { prompt: 'Blake Snyder\'s story type for this thread. A book can carry a different one in each storyline.', suggestions: ['Monster in the House', 'Golden Fleece', 'Out of the Bottle', 'Dude with a Problem', 'Rites of Passage', 'Buddy Love', 'Whydunit', 'The Fool Triumphant', 'Institutionalized', 'Superhero'] }),
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
  song: SONG,
  interview: INTERVIEW,
  being: BEING,
  magic: MAGIC,
  culture: CULTURE,
  faction: FACTION,
  belief: BELIEF,
  language: LANGUAGE,
  source: SOURCE,
  document: DOCUMENT,
  era: ERA,
};

export const KIND_LABELS: Record<string, { label: string; plural: string }> = {
  character: { label: 'Character', plural: 'Characters' },
  song: { label: 'Song', plural: 'Soundtrack' },
  being: { label: 'Kind of being', plural: 'Kinds of beings' },
  magic: { label: 'Magic or power', plural: 'Magic and powers' },
  culture: { label: 'Culture', plural: 'Cultures and peoples' },
  faction: { label: 'Faction', plural: 'Factions and institutions' },
  belief: { label: 'Belief', plural: 'Beliefs and faiths' },
  language: { label: 'Language', plural: 'Languages' },
  source: { label: 'Source', plural: 'Sources and retellings' },
  document: { label: 'In-world document', plural: 'In-world documents' },
  era: { label: 'Era', plural: 'World history' },
  interview: { label: 'Interview question', plural: 'Interviews' },
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
