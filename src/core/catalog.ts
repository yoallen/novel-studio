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
  { key: 'magical_realism', name: 'Magical Realism', asks: ['What is the one impossible thing, and why does no one in the story question it?', 'What does the magic say about the ordinary life around it?'], leansOn: ['story rules', 'motifs'] },
  { key: 'literary_romance', name: 'Literary Romance', asks: ['Beyond whether they end up together, what larger question does this love answer?', 'How does each of them have to change to deserve the ending?'], leansOn: ['arcs', 'relationships'] },
  { key: 'romantic_suspense', name: 'Romantic Suspense', asks: ['Does the danger and the love story rise together, each raising the stakes of the other?', 'What does the threat force the two of them to reveal?'], leansOn: ['relationships', 'who knows what'] },
  { key: 'romantic_comedy', name: 'Romantic Comedy', asks: ['What comic flaw keeps them apart?', 'Where does the comedy turn tender without losing its laugh?'], leansOn: ['relationships', 'set pieces'] },
  { key: 'erotic_romance', name: 'Erotic Romance', asks: ['How does each intimate scene change the relationship, not only the temperature?', 'Is consent clear and the heat level consistent from start to finish?'], leansOn: ['relationships', 'arcs'] },
  { key: 'paranormal_romance', name: 'Paranormal Romance', asks: ['What does the supernatural make impossible about this love?', 'What are the rules of the otherworldly partner, and what do they cost?'], leansOn: ['story rules', 'relationships'] },
  { key: 'cozy_mystery', name: 'Cozy Mystery', asks: ['What community does the sleuth belong to, and who in it could have done this?', 'Is the violence kept off the page while the puzzle stays fair?'], leansOn: ['setups and payoffs', 'places'] },
  { key: 'psychological_thriller', name: 'Psychological Thriller', asks: ['Whose mind can the reader not trust, and when do they find out?', 'What is the real truth, step by step, under the version the reader is told?'], leansOn: ['who knows what', 'secret operations'] },
  { key: 'domestic_thriller', name: 'Domestic Thriller', asks: ['What does this marriage or family hide behind its front door?', 'Who stands to lose the most if the truth comes out?'], leansOn: ['relationships', 'secret operations'] },
  { key: 'legal_thriller', name: 'Legal Thriller', asks: ['What does the case turn on, and when does the reader learn it?', 'What does winning cost the lawyer personally?'], leansOn: ['research', 'setups and payoffs'] },
  { key: 'police_procedural', name: 'Police Procedural', asks: ['Is each step of the investigation true to how the work is really done?', 'What does the case cost the people working it?'], leansOn: ['research', 'timelines'] },
  { key: 'urban_fantasy', name: 'Urban Fantasy', asks: ['How does the magic hide inside the modern city?', 'Who polices the line between the two worlds?'], leansOn: ['story rules', 'places'] },
  { key: 'paranormal', name: 'Paranormal', asks: ['What is the supernatural presence, and what are its rules?', 'Who believes, who does not, and what does belief cost?'], leansOn: ['story rules', 'who knows what'] },
  { key: 'dystopian', name: 'Dystopian', asks: ['What went wrong with this society, and who benefits from it staying wrong?', 'What small act of resistance starts the story?'], leansOn: ['story rules', 'storylines'] },
  { key: 'gothic', name: 'Gothic', asks: ['What does the house or place remember?', 'What buried secret from the past presses on the present?'], leansOn: ['places', 'motifs'] },
  { key: 'contemporary', name: 'Contemporary Fiction', asks: ['What about life right now does this story see clearly?', 'What ordinary pressure becomes extraordinary for these characters?'], leansOn: ['arcs', 'relationships'] },
  { key: 'upmarket', name: 'Upmarket Fiction', asks: ['What is the hook a book club will argue about?', 'How does the prose earn its literary moments without slowing the story?'], leansOn: ['arcs', 'motifs'] },
  { key: 'action_adventure', name: 'Action and Adventure', asks: ['What is the goal, and what keeps getting in the way, bigger each time?', 'Where does each set piece change the plan?'], leansOn: ['set pieces', 'storylines'] },
  { key: 'western', name: 'Western', asks: ['What does the land demand of the people on it?', 'What code does the hero live by, and when is it tested?'], leansOn: ['places', 'arcs'] },
  { key: 'holiday', name: 'Holiday', asks: ['What does the holiday promise, and what is missing this year?', 'How does the season itself turn the story?'], leansOn: ['relationships', 'timelines'] },
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
  { key: 'reconstructed_narration', name: 'A narrator who is not who they seem', group: 'Information', turnsOn: 'Who seems to tell each scene beside who really does, and where the reader finds out' },
  { key: 'memory_triggers', name: 'The present calls up the past', group: 'Time', turnsOn: 'Memory links (calls up) shown beside each scene in Timelines' },
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
  { key: 'short_stories', name: 'Short story collection', group: 'Form' },
  { key: 'linked_stories', name: 'Linked stories', group: 'Form' },
  { key: 'serial', name: 'Serial, published in parts', group: 'Form' },
  { key: 'retelling', name: 'A retelling of a myth, legend or classic', group: 'Form', turnsOn: 'Source records: the original, your version, and every change' },
  { key: 'past_tense', name: 'Past tense', group: 'Tense' },
  { key: 'present_tense', name: 'Present tense', group: 'Tense' },
  { key: 'mixed_tense', name: 'Mixed or shifting tense', group: 'Tense', turnsOn: 'Tense set scene by scene in the Viewpoint view' },
  { key: 'contemporary_setting', name: 'Contemporary, our world now', group: 'Setting' },
  { key: 'recent_past', name: 'Recent past (within living memory)', group: 'Setting' },
  { key: 'historical_setting', name: 'Historical', group: 'Setting' },
  { key: 'near_future', name: 'Near future', group: 'Setting' },
  { key: 'far_future', name: 'Far future', group: 'Setting' },
  { key: 'invented_world', name: 'An invented world', group: 'Setting' },
  { key: 'hidden_world', name: 'Our world, with a hidden one inside it', group: 'Setting' },
  { key: 'adult', name: 'Adult', group: 'Readership' },
  { key: 'new_adult', name: 'New Adult (characters about 18 to 25)', group: 'Readership' },
  { key: 'young_adult_readers', name: 'Young Adult (about 12 to 18)', group: 'Readership' },
  { key: 'middle_grade', name: 'Middle Grade (about 8 to 12)', group: 'Readership' },
  { key: 'comic_tone', name: 'Comic', group: 'Tone' },
  { key: 'playful', name: 'Playful', group: 'Tone' },
  { key: 'whimsical', name: 'Whimsical', group: 'Tone' },
  { key: 'wry', name: 'Wry', group: 'Tone' },
  { key: 'cozy', name: 'Cozy', group: 'Tone' },
  { key: 'warm_tone', name: 'Warm', group: 'Tone' },
  { key: 'tender', name: 'Tender', group: 'Tone' },
  { key: 'hopeful', name: 'Hopeful', group: 'Tone' },
  { key: 'uplifting', name: 'Uplifting', group: 'Tone' },
  { key: 'earnest', name: 'Earnest', group: 'Tone' },
  { key: 'romantic_tone', name: 'Romantic', group: 'Tone' },
  { key: 'sensual_tone', name: 'Sensual', group: 'Tone' },
  { key: 'lyrical', name: 'Lyrical', group: 'Tone' },
  { key: 'bittersweet', name: 'Bittersweet', group: 'Tone' },
  { key: 'melancholy', name: 'Melancholy', group: 'Tone' },
  { key: 'tense_tone', name: 'Tense', group: 'Tone' },
  { key: 'suspenseful', name: 'Suspenseful', group: 'Tone' },
  { key: 'eerie', name: 'Eerie', group: 'Tone' },
  { key: 'menacing', name: 'Menacing', group: 'Tone' },
  { key: 'dark_tone', name: 'Dark', group: 'Tone' },
  { key: 'gritty', name: 'Gritty', group: 'Tone' },
  { key: 'bleak', name: 'Bleak', group: 'Tone' },
  { key: 'satirical', name: 'Satirical', group: 'Tone' },
  { key: 'heat_closed', name: 'Closed door', group: 'Heat level' },
  { key: 'heat_sweet', name: 'Sweet (kisses on the page)', group: 'Heat level' },
  { key: 'heat_sensual', name: 'Sensual (fade before the explicit)', group: 'Heat level', turnsOn: 'A heat field on each scene card, so the level stays consistent' },
  { key: 'heat_steamy', name: 'Steamy (on the page)', group: 'Heat level', turnsOn: 'A heat field on each scene card, so the level stays consistent' },
  { key: 'heat_explicit', name: 'Explicit', group: 'Heat level', turnsOn: 'A heat field on each scene card, so the level stays consistent' },
  { key: 'language_clean', name: 'Clean', group: 'Language' },
  { key: 'language_mild', name: 'Mild', group: 'Language' },
  { key: 'language_moderate', name: 'Moderate', group: 'Language' },
  { key: 'language_strong', name: 'Strong', group: 'Language' },
  { key: 'cw_death', name: 'Death and grief', group: 'Content to flag' },
  { key: 'cw_violence', name: 'Violence', group: 'Content to flag' },
  { key: 'cw_sexual_violence', name: 'Sexual violence', group: 'Content to flag' },
  { key: 'cw_abuse', name: 'Abuse', group: 'Content to flag' },
  { key: 'cw_addiction', name: 'Addiction', group: 'Content to flag' },
  { key: 'cw_suicide', name: 'Suicide or self-harm', group: 'Content to flag' },
  { key: 'cw_infidelity', name: 'Infidelity', group: 'Content to flag' },
  { key: 'cw_pregnancy_loss', name: 'Pregnancy or child loss', group: 'Content to flag' },
  { key: 'cw_illness', name: 'Serious illness', group: 'Content to flag' },
  { key: 'cw_racism', name: 'Racism', group: 'Content to flag' },
  { key: 'trope_friends_to_lovers', name: 'Friends to lovers', group: 'Romance tropes' },
  { key: 'trope_second_chance', name: 'Second chance', group: 'Romance tropes' },
  { key: 'trope_enemies_to_lovers', name: 'Enemies to lovers', group: 'Romance tropes' },
  { key: 'trope_forced_proximity', name: 'Forced proximity', group: 'Romance tropes' },
  { key: 'trope_fake_relationship', name: 'Fake relationship', group: 'Romance tropes' },
  { key: 'trope_grumpy_sunshine', name: 'Grumpy and sunshine', group: 'Romance tropes' },
  { key: 'trope_slow_burn', name: 'Slow burn', group: 'Romance tropes' },
  { key: 'trope_forbidden', name: 'Forbidden love', group: 'Romance tropes' },
  { key: 'trope_love_triangle', name: 'Love triangle', group: 'Romance tropes' },
  { key: 'trope_convenience', name: 'Marriage of convenience', group: 'Romance tropes' },
  { key: 'trope_opposites', name: 'Opposites attract', group: 'Romance tropes' },
  { key: 'trope_grief', name: 'Love after loss', group: 'Romance tropes' },
  { key: 'trope_ghost', name: 'Love across life and death', group: 'Romance tropes' },
  { key: 'trope_age_gap', name: 'Age gap', group: 'Romance tropes' },
];

/** How each group of characteristics reads in setup. A "one choice" group keeps a single answer at a time. */
export const CHARACTERISTIC_GROUPS: { name: string; about: string; one?: boolean }[] = [
  { name: 'Viewpoint', about: 'Whose eyes, and how close.' },
  { name: 'Tense', about: 'When the telling stands in relation to the events.', one: true },
  { name: 'Construction', about: 'How many leads, and how they share the book.' },
  { name: 'Information', about: 'What the reader knows, and when.' },
  { name: 'Time', about: 'The order the story is told in.' },
  { name: 'Setting', about: 'When and where the story happens.' },
  { name: 'Readership', about: 'Who the book is for. This is separate from genre: a fantasy can be written for adults or for teens.', one: true },
  { name: 'Tone', about: 'The feeling of the book. Choose as many as fit.' },
  { name: 'Heat level', about: 'How much of the intimacy is on the page.', one: true },
  { name: 'Language', about: 'How strong the language is.', one: true },
  { name: 'Content to flag', about: 'Subjects a reader may want to know about before reading. Kept for content notes.' },
  { name: 'Romance tropes', about: 'The familiar shapes a love story takes. Readers look for them by name.' },
  { name: 'Technique', about: 'Devices the story uses.' },
  { name: 'Form', about: 'The shape of the book itself.' },
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
  reconstructed_narration: [{ kind: 'scene_plan', group: 'Who tells it' }],
  dual_timeline: [{ kind: 'scene_plan', group: 'Timeline strand' }],
  heat_sensual: [{ kind: 'scene_plan', group: 'Heat' }],
  heat_steamy: [{ kind: 'scene_plan', group: 'Heat' }],
  heat_explicit: [{ kind: 'scene_plan', group: 'Heat' }],
  frame_story: [{ kind: 'scene_plan', group: 'Timeline strand' }],
  running_gags: [{ kind: 'scene_plan', group: 'Callbacks' }],
  red_herrings: [{ kind: 'clue', group: 'Red herring' }],
};

/** Genres and characteristics that open the worldbuilding kit: beings, magic, cultures, factions, beliefs, languages,
 *  sources, in-world documents, world history, settlements and the ways between worlds. */
export const WORLD_GENRES = ['fantasy', 'science_fiction', 'urban_fantasy', 'paranormal', 'paranormal_romance', 'magical_realism', 'dystopian', 'gothic', 'horror'];
export const WORLD_CHARACTERISTICS = ['invented_world', 'hidden_world', 'retelling', 'far_future'];
export const WORLD_KINDS = ['being', 'magic', 'culture', 'faction', 'belief', 'language', 'source', 'document', 'era'];
export function worldbuildingOn(setup: { genres?: { key: string }[]; characteristics?: string[] } | undefined): boolean {
  return !!setup && ((setup.genres ?? []).some((g) => WORLD_GENRES.includes(g.key)) || (setup.characteristics ?? []).some((c) => WORLD_CHARACTERISTICS.includes(c)));
}

/** Field groups that appear only when a framework or characteristic asks for them, once a novel's toolkit is set. */
export const CONDITIONAL_GROUPS: { kind: string; group: string; by: string[] }[] = [
  ...FRAMEWORKS.flatMap((f) => (f.fieldGroups ?? []).map((g) => ({ ...g, by: [f.key] }))),
  ...Object.entries(CHARACTERISTIC_FIELDS).flatMap(([k, gs]) => gs.map((g) => ({ ...g, by: [k] }))),
  { kind: 'location', group: 'Settlement', by: ['worldbuilding'] },
  { kind: 'location', group: 'Between worlds', by: ['worldbuilding'] },
  { kind: 'character', group: 'Beyond human', by: ['worldbuilding'] },
].reduce((acc, g) => {
  const same = acc.find((x) => x.kind === g.kind && x.group === g.group);
  if (same) same.by.push(...g.by); else acc.push({ ...g, by: [...g.by] });
  return acc;
}, [] as { kind: string; group: string; by: string[] }[]);
