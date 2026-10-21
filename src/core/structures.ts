// Beat sheets other than Save the Cat (R-B-093, R-B-094). Descriptions are teaching in plain words.
// `at` is the usual placement as fractions of the book; `moment` ties equivalent beats across frameworks
// (her Master Translation: Break into Two is Crossing the Threshold is the First Plot Point).

export interface StructBeat {
  key: string; number: number | null; name: string;
  act: 'I' | 'IIA' | 'IIB' | 'III'; kind: 'point' | 'span';
  at: [number, number];
  description: string;
  test?: string;
  moment?: string;
}

const s = (key: string, number: number, name: string, act: StructBeat['act'], kind: StructBeat['kind'], at: [number, number], description: string, extra: Partial<StructBeat> = {}): StructBeat => ({ key, number, name, act, kind, at, description, ...extra });

export const HEROS_JOURNEY: StructBeat[] = [
  s('ordinary_world', 1, 'The Ordinary World', 'I', 'span', [0, 0.1], 'The hero at home, before anything changes. Show what is missing, so the reader feels the need before the hero does.', { moment: 'opening' }),
  s('call_to_adventure', 2, 'The Call to Adventure', 'I', 'point', [0.1, 0.1], 'Something arrives that the ordinary world cannot absorb: a message, a loss, a threat, an opportunity.', { moment: 'inciting', test: 'Could the hero go back to normal tomorrow? If so, it is not yet the Call.' }),
  s('refusal', 3, 'Refusal of the Call', 'I', 'span', [0.1, 0.15], 'Fear wins, briefly. The refusal shows what the journey will cost.', { moment: 'debate' }),
  s('mentor', 4, 'Meeting the Mentor', 'I', 'point', [0.15, 0.2], 'Someone or something gives the hero what they need to go: advice, a gift, a push.'),
  s('crossing_threshold', 5, 'Crossing the First Threshold', 'IIA', 'point', [0.2, 0.25], 'The hero commits and enters the special world. There is no easy way back.', { moment: 'threshold', test: 'The hero chooses it; it changes the situation, not just the mind.' }),
  s('tests_allies_enemies', 6, 'Tests, Allies and Enemies', 'IIA', 'span', [0.25, 0.4], 'The rules of the new world are learned the hard way. Friends and enemies sort themselves out.', { moment: 'fun' }),
  s('approach', 7, 'Approach to the Inmost Cave', 'IIA', 'span', [0.4, 0.5], 'Preparation for the central ordeal. Tension tightens; plans are made and doubted.'),
  s('ordeal', 8, 'The Ordeal', 'IIB', 'point', [0.5, 0.55], 'The hero faces the greatest fear so far and seems to die, literally or in spirit, and is reborn.', { moment: 'midpoint' }),
  s('reward', 9, 'Reward (Seizing the Sword)', 'IIB', 'span', [0.55, 0.65], 'Having survived, the hero takes the prize: an object, a truth, a reconciliation. Celebration is brief.'),
  s('road_back', 10, 'The Road Back', 'IIB', 'span', [0.65, 0.8], 'The hero turns for home, and the consequences of the ordeal give chase.', { moment: 'third' }),
  s('resurrection', 11, 'The Resurrection', 'III', 'span', [0.8, 0.95], 'The final, most dangerous test, where everything learned is used at once. The old self dies for good.', { moment: 'climax' }),
  s('return_with_elixir', 12, 'Return with the Elixir', 'III', 'point', [0.95, 1], 'Home again, changed, carrying something that heals the ordinary world.', { moment: 'ending' }),
];

export const STORY_CIRCLE: StructBeat[] = [
  s('you', 1, 'You', 'I', 'span', [0, 0.1], 'A character in a zone of comfort.', { moment: 'opening' }),
  s('need', 2, 'Need', 'I', 'point', [0.1, 0.15], 'But they want something.', { moment: 'inciting' }),
  s('go', 3, 'Go', 'IIA', 'point', [0.2, 0.25], 'They enter an unfamiliar situation.', { moment: 'threshold' }),
  s('search', 4, 'Search', 'IIA', 'span', [0.25, 0.5], 'They adapt to it.', { moment: 'fun' }),
  s('find', 5, 'Find', 'IIB', 'point', [0.5, 0.5], 'They get what they wanted.', { moment: 'midpoint' }),
  s('take', 6, 'Take', 'IIB', 'span', [0.5, 0.75], 'They pay a heavy price for it.', { moment: 'lowest' }),
  s('return', 7, 'Return', 'III', 'span', [0.75, 0.9], 'They return to their familiar situation.', { moment: 'third' }),
  s('change', 8, 'Change', 'III', 'point', [0.9, 1], 'Having changed.', { moment: 'ending' }),
];

export const SEVEN_POINT: StructBeat[] = [
  s('hook', 1, 'Hook', 'I', 'point', [0, 0.05], 'The starting state, the opposite of the resolution. Decide the ending first, then begin here.', { moment: 'opening' }),
  s('plot_turn_1', 2, 'Plot Turn 1', 'I', 'point', [0.2, 0.25], 'The call to action: the world changes and the hero moves from the starting state toward the ending.', { moment: 'threshold' }),
  s('pinch_1', 3, 'Pinch 1', 'IIA', 'point', [0.35, 0.375], 'Pressure applied: the antagonist shows strength and forces the hero to act.'),
  s('midpoint', 4, 'Midpoint', 'IIB', 'point', [0.5, 0.5], 'The hero moves from reacting to acting.', { moment: 'midpoint' }),
  s('pinch_2', 5, 'Pinch 2', 'IIB', 'point', [0.625, 0.65], 'More pressure, until it seems all is lost. The plan fails; the mentor is gone.', { moment: 'lowest' }),
  s('plot_turn_2', 6, 'Plot Turn 2', 'III', 'point', [0.75, 0.8], 'The hero gets the final piece needed to win.', { moment: 'third' }),
  s('resolution', 7, 'Resolution', 'III', 'point', [0.95, 1], 'The climax and the new state, the opposite of the hook.', { moment: 'ending' }),
];

export const THREE_ACT: StructBeat[] = [
  s('setup', 1, 'Setup', 'I', 'span', [0, 0.12], 'Who, where, and what is at stake before the story turns.', { moment: 'opening' }),
  s('inciting_incident', 2, 'Inciting Incident', 'I', 'point', [0.12, 0.12], 'The event that sets the story in motion.', { moment: 'inciting' }),
  s('plot_point_1', 3, 'Plot Point 1', 'IIA', 'point', [0.25, 0.25], 'The turn into Act Two. The hero commits to a goal.', { moment: 'threshold' }),
  s('rising_action', 4, 'Rising Action', 'IIA', 'span', [0.25, 0.5], 'Attempts, obstacles and complications, each costing more.', { moment: 'fun' }),
  s('midpoint', 5, 'Midpoint', 'IIB', 'point', [0.5, 0.5], 'A reversal or revelation that changes the direction of the story.', { moment: 'midpoint' }),
  s('plot_point_2', 6, 'Plot Point 2', 'IIB', 'point', [0.75, 0.75], 'The lowest point, or the discovery that launches the final act.', { moment: 'lowest' }),
  s('climax', 7, 'Climax', 'III', 'span', [0.85, 0.95], 'The central conflict meets its decisive confrontation.', { moment: 'climax' }),
  s('resolution', 8, 'Resolution', 'III', 'span', [0.95, 1], 'The new normal, and what it means.', { moment: 'ending' }),
];

/** Robert McKee's five-part design, from Story. The same five parts shape a scene, a sequence, an act and the whole book. */
export const MCKEE_FIVE: StructBeat[] = [
  s('inciting_incident', 1, 'Inciting Incident', 'I', 'point', [0.1, 0.25], "The event that radically upsets the balance of the hero's life, for better or worse, and wakes a conscious desire to set it right. McKee places it within the first quarter of the story. It raises the question the climax will answer.", { moment: 'inciting', test: "It upsets the balance of the hero's life, and the hero must respond." }),
  s('progressive_complications', 2, 'Progressive Complications', 'IIA', 'span', [0.25, 0.75], "Scene by scene it gets harder. The hero acts, the world answers in ways they did not expect (McKee's gap), and the forces against them grow. Each complication costs more than the last, until there is no going back.", { moment: 'fun', test: 'No step backward: each turn costs more than the one before.' }),
  s('crisis', 3, 'Crisis', 'IIB', 'point', [0.75, 0.85], 'At the moment of greatest pressure the hero faces a true dilemma: the best of two bad choices, or two goods that cannot both be kept. The choice they make shows who they really are.', { moment: 'third', test: 'A real dilemma, decided by the hero, not by luck.' }),
  s('climax', 4, 'Climax', 'III', 'point', [0.85, 0.95], 'The action the hero takes on that choice, and the turn it causes: absolute and irreversible change. The values of the story reach their final charge.', { moment: 'climax', test: 'Absolute and irreversible: nothing can go back to how it was.' }),
  s('resolution', 5, 'Resolution', 'III', 'span', [0.95, 1], 'Whatever follows the climax: the change spreading through the hero\'s world, and a moment for the reader to feel it.', { moment: 'ending' }),
];

/** Save the Cat beats mapped to the same moments, for translation between frameworks. */
export const SAVE_THE_CAT_MOMENTS: Record<string, string> = {
  opening_image: 'opening', catalyst: 'inciting', debate: 'debate', break_into_two: 'threshold', fun_and_games: 'fun', midpoint: 'midpoint',
  all_is_lost: 'lowest', break_into_three: 'third', finale: 'climax', final_image: 'ending',
};

export const STRUCTURE_NAMES: Record<string, string> = {
  save_the_cat: 'Save the Cat', heros_journey: "The Hero's Journey", story_circle: 'Story Circle', seven_point: 'Seven-Point Structure', three_act: 'Three-Act Structure', mckee_five: "McKee's Five Parts",
};

export const OTHER_STRUCTURES: Record<string, StructBeat[]> = {
  heros_journey: HEROS_JOURNEY, story_circle: STORY_CIRCLE, seven_point: SEVEN_POINT, three_act: THREE_ACT, mckee_five: MCKEE_FIVE,
};
