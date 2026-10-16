# Consolidated Requirements, Theme C: Story Architecture, Storylines, POV, Time, Causality, Narrative Zoom, Ripple Effect, Analyzers

Program: general-purpose, local, private Windows novel-planning and writing program. Any novel, any genre. *I Declare War* (IDW) is the first story and the richest test case, not the purpose. IDW details below are test data unless a requirement says otherwise.

## How to read this

- **Sources** cite register IDs from the section registers (S1- to S8-, S8E-), the spec register (SP-, HV-, PK-) and the story register (SB- Story Bible v5, A14-/A15- archives, XL- her 2021 BS2 spreadsheets, PF- poster foundation). "L" numbers are lines in the full transcript `Story_Map_Planning_FULL_with_code.md` unless prefixed (SB L, SP L, HV L).
- **Standing**:
  - **Decided by Yolanda**: her words, her Story Bible, or her own spreadsheets.
  - **Accepted proposal**: ChatGPT proposed it and she accepted it. Blanket "I agree with everything" is noted where that is the only acceptance.
  - **Unanswered proposal**: she never answered it, or said she skimmed it. Included only where it fits her stated goals.
  - **Spec-only**: appears only in ChatGPT's spec, vision brief or packet.
  - **Possibility**: an option or inference, not a decision.
- **Phase**: 2 is the story system and program she writes in, including multi-genre support (her correction, S3-010). 3 is the Visual Story Mapping Engine and professional posters. Her decision (S6-001, T L15064-15070) is only that the visual system "has to come as a different phase" after the story system and is integrated "further down the line … but we do it correctly". The label "Phase 3" (and "Phase 4" for Story Universe) is ChatGPT's numbering from its reply (S6-004, T L15127-15144), unconfirmed by her (Q17). Later covers Story Universe: series, TV, film, cross-project. She named Story Universe as a later iteration (S3-001). "2 data / 3 render" means Phase 2 must store what Phase 3 will draw.
- Where Yolanda skimmed (S2-195, S3-166, S8-004), the skimmed proposals are not treated as accepted.

---

## A. Story architecture: hierarchy and units

### R-C-001 Dramatic-unit hierarchy with an objective at every level
- **Requirement:** Model the units Story → Act → Sequence → Scene → Beat. Each level is its own goal-bearing unit with its own objective and outcome. Show how the units relate. Minimum fields per level:
  - Scene: goal, conflict, outcome, value before and after.
  - Sequence: sequence goal, escalation, cumulative value change, the new problem it creates for the next sequence.
  - Act: act objective, major conflict, turning point, value shift.
  - Story: controlling idea, overall transformation, final value.
  - Beat (micro): what changes in the exchange.
- **Why:** "Not only knowing the story value is important, but knowing the individual scene value is important." She wants structure tracked at every level, each "seen as its own goal," not only at Save the Cat beat level.
- **Standing:** Decided by Yolanda (hierarchy and per-unit goal). Accepted proposal (field list).
- **Phase:** 2
- **Evolution:**
  - She asked for it at 10:14 ("or something like that", recalling McKee and possibly Weiland). ChatGPT detailed the levels (S1-142).
  - Later the hierarchy was made "a useful analytical model, not the only legitimate way" (S2-055). It was generalized into configurable narrative containers (S2-162, R-C-040).
  - Neither change replaced it. It stays the default novel template.
- **Sources:** S1-010, S1-011 (L2383); S1-142 (L2409-2429); S2-011 (L3265); S2-165 (L5470-5492); SP-050; S6-119
- **Acceptance check:**
  - Create one act, one sequence inside it and two scenes inside that. Each unit shows its own objective and outcome fields.
  - The sequence shows a cumulative value change computed from, or entered beside, its scenes' value changes.

### R-C-002 Two meanings of "beat" kept distinct
- **Requirement:** A Save the Cat beat (one of 15 structural functions placed by percentage) and a McKee dramatic beat (an action/reaction exchange inside a scene) are different entity types. They have different labels in the UI and in exports.
- **Why:** ChatGPT's hierarchy used McKee's micro-beat while her board uses Snyder's beats. Conflating them would corrupt both models.
- **Standing:** Possibility (flagged by the section register). The labelling is undecided; see Needs Yolanda Q4.
- **Phase:** 2
- **Evolution:** Raised as an open question (S1 open Q9). Never resolved.
- **Sources:** S1-142 note; S1 open question 9; SP-149 (zoom level "beat" is ambiguous)
- **Acceptance check:**
  - Adding a dramatic beat inside a scene never adds a row to the 15-beat structure.
  - Search and filters can separate the two kinds.

### R-C-003 Flexible mapping between beats, scenes, chapters and storylines
- **Requirement:**
  - A structural beat may be one scene or "explode into several". A sequence (a montage, a chain of pranks) may be folded into one card.
  - A scene may serve several storylines and arcs.
  - A chapter may hold several scenes.
  - Reordering scenes or chapters never loses prose or links.
- **Why:** Her board practice: "some beats are a single card, others explode into several scenes." Real novels are not strict trees.
- **Standing:** Decided by Yolanda (Story Bible board convention). Spec restates the mapping.
- **Phase:** 2
- **Evolution:** The Bible convention (S1-083) became spec items SP-072, SP-111 and SP-112 and acceptance test AC05. The spec dropped the "fold a sequence into one card" detail.
- **Sources:** S1-083 (bible L1382-1389); SB-167; S4-081; S6-136 (L18097-18101); SP-072; SP-111; SP-112; SP-216 (AC05)
- **Acceptance check:**
  - Attach three scenes to Fun and Games and one scene to two storylines.
  - Move a scene to another beat. Prose, links and history survive.

### R-C-004 Scene-card board view (four rows)
- **Requirement:** A board view with four rows: Act One, Act Two first half, Act Two second half, Act Three. Each holds about 9 to 10 cards (about 40 in total).
  - Cards sit under their beats and can be colour-coded by story strand.
  - A suggested build order is offered: Midpoint first, then All Is Lost as its flip, then the two act breaks. It is guidance, never enforced.
  - Cards are printable for a physical wall or table board.
- **Why:** This is how she moves from beats to scenes. She likes to "get physical" with index cards, and it is "genuinely fun to do."
- **Standing:** Decided by Yolanda (Story Bible). Accepted proposal for the "scene-card board" output (S1-134).
- **Phase:** 2 for the on-screen board. 3 for printed cards.
- **Evolution:** The board came from the Bible and was listed by ChatGPT as a bonus output. It was dropped from the spec, the module list and the Phase 2 lists. Omission does not cancel it. Colour use is qualified by R-C-094 (colour must carry meaning).
- **Sources:** S1-083, S1-085 (bible L1382-1408); SB-167, SB-168, SB-169, SB-172; S1-134 (L2283-2302); XL-047; PF-009
- **Acceptance check:**
  - Open the board for a new novel. Four rows appear with the 15 beats as column anchors.
  - Add a card under Catalyst. Print the cards as an index-card sheet.

### R-C-005 Card symbols +/- and >< on every scene
- **Requirement:** Every scene card carries two fields.
  - **+/-**: emotional value at the start and at the end.
  - **><**: the conflict. Who the players are, each one's goal, the obstacle, and who wins.
  - A scene list row shows: POV, goal, conflict, outcome, value turned.
  - The program raises a question (never a block) when:
    - start and end values are not opposite;
    - there is more than one conflict;
    - there is neither emotional change nor conflict ("rebuild it or cut it").
- **Why:** "Every scene has to turn." One card satisfies three frameworks at once: Snyder's +/- equals McKee's value turn, and >< equals Ingermanson's Proactive Scene.
- **Standing:** Decided by Yolanda (Story Bible).
- **Phase:** 2
- **Evolution:** ChatGPT later allowed nuanced shifts, such as positive to more positive (S1-144, R-C-028). The two coexist (S1 unclear U5). Per the "questions not verdicts" principle (S1-166), the opposites rule becomes a question.
- **Sources:** S1-084 (bible L1391-1402); SB-170, SB-171; S1-009 (L2383)
- **Acceptance check:**
  - A scene with "+" start and "+" end shows the question "Does this scene turn?". It saves without error.
  - A scene with two conflict entries gets a one-conflict question.

### R-C-006 Single-beat focus view ("When I'm Stuck, Start Here")
- **Requirement:** One action opens only the beat she is on. Other beats are hidden.
  - The view shows that beat's example and a one-sentence entry ("what happens at that beat").
  - It offers the next rungs of her ladder: fill one blank line on a character sheet; write one line of a narrator's voice "complaining about anything."
- **Why:** "Read only that beat. Do not look at the others." Too much at once triggers overwhelm and freeze. "Break the freeze with the smallest possible true step. Momentum is the cure."
- **Standing:** Decided by Yolanda (Story Bible).
- **Phase:** 2
- **Evolution:** It coexists with the all-in-one poster (overview) and Narrative Zoom (R-C-066). ChatGPT dropped it from the schema, the modules and the spec (S1 D7).
- **Sources:** S1-027, S1-028 (bible L36-58); SB-006, SB-103; S1-183
- **Acceptance check:**
  - From any screen, "Focus on my beat" shows exactly one beat, its example and a single-line input.
  - Entering one sentence saves it as progress.

---

## B. Placement: percentages, words, pages, spans

### R-C-007 Landmarks computed for any target length, at 250 or 300 words per page
- **Requirement:** For every beat, show:
  - approximate percentage;
  - word position (or word range);
  - approximate page.
  
  These are computed from the project's target word count or target page count and a words-per-page density. The program must support:
  - any target length, not only 250 or 300 pages;
  - both of her densities, 250 and 300 words per page;
  - side-by-side columns for two lengths (her "250-page versus 300-page" view).
  
  Values are computed, never typed in. Page numbers are labelled as estimates unless a paginated manuscript exists.
- **Why:**
  - Percentages alone are impractical while drafting. "Say if you were writing a 250-page novel versus a 300-page novel for example."
  - Her own 2021 sheets hold hand-typed numbers and no formulas, so the program must do the math.
  - "Word counts are reliable drafting measurements. Page counts depend on manuscript formatting."
- **Standing:** Decided by Yolanda (the request, and her spreadsheets). Accepted proposal (estimate labelling, word-count column).
- **Phase:** 2
- **Evolution:**
  - She asked for page numbers "for example." ChatGPT hard-coded exactly 250 and 300 pages in tables and posters, which narrowed her request (S1-131, D2).
  - Her spreadsheets add a second sense of "250/300": **words per page** (XL-A at 300 wpp for 360 pages; XL-B at both 250 and 300 wpp for 90,000 words).
  - Both senses coexist. See Needs Yolanda Q12.
- **Sources:** S1-005 (L2114); S1-128, S1-129 (L2161-2249); S1-131; S2-088 (L4210-4216); S3-030; S4-086; S5-007; S6-039; XL-003, XL-014, XL-015, XL-038; SB-102
- **Acceptance check:**
  - Set the target to 90,000 words at 250 wpp. Catalyst under the Brody profile shows about 9,000 words and page about 36.
  - Change to 300 wpp and the pages recompute. Enter 412 pages and all landmarks recompute with "estimate" labels.

### R-C-008 Two placement profiles: Brody novel % and Snyder screenplay-proportional
- **Requirement:** Offer selectable placement profiles. Both are recomputed from the target length.
  - **Brody novel percentages** (her XL-A and her Bible): Catalyst 10%, Break into Two 20%, B Story 22%, Midpoint 50%, All Is Lost 75%, Break into Three 80%.
  - **Snyder screenplay-proportional** (her XL-B): the 110-page script beats scaled to the book. Catalyst ~10.9%, BI2 ~22.7%, B Story ~27.3%, AIL ~68.2%, BI3 ~77.3%.
  - Custom profiles are allowed.
  - Each profile defines span start anchors. For example, Fun and Games starts at Break into Two (Brody) or at B Story (screenplay).
- **Why:** Her own two workbooks model placement differently, and her Bible uses Brody. At 90,000 words the Bible puts AIL near 67,000 while XL-B puts it at 61,250/61,500.
- **Standing:** Decided by Yolanda (both models are her own artifacts). The default profile is open (Needs Yolanda Q2).
- **Phase:** 2
- **Evolution:** Neither workbook supersedes the other. XL-B was saved 1h40m before XL-A. XL-B even carries Brody pages in column D beside screenplay pages in E to H. The story register's synthesis (XL-049) is a compiler proposal. This requirement rests on her files.
- **Sources:** XL-002, XL-016, XL-039, XL-040, XL-041, XL-042; SB-008, SB-101, SB-102; S1-074 (bible L701-710)
- **Acceptance check:**
  - Switch profiles on a 90,000-word project. AIL moves between 67,500 and about 61,250/61,500.
  - Each profile's numbers match the arithmetic in XL-039 and XL-040.

### R-C-009 Point vs span beats, gaps, and tolerance windows with soft warnings
- **Requirement:**
  - Each beat is either a **point** (Catalyst, BI2, Midpoint, AIL, BI3, Final Image) or a **span** with start and end (Setup, Debate, Fun and Games, Bad Guys Close In, Dark Night, Finale).
  - Unassigned stretches between beats are allowed, such as the screenplay gap between Setup end and Catalyst.
  - Each beat may carry a **tolerance window** in her words:
    - Theme Stated "or somewhere within the first 10%";
    - Catalyst "10% or earlier";
    - Break into Two "before you get one-quarter of the way through your novel";
    - B Story "make sure it happens in the first 25%".
  - Leaving a window produces a question, never an error.
- **Why:** Her sheet gives placement rules, not just points. "The percentages are guides, not rules."
- **Standing:** Decided by Yolanda (spreadsheet text, Bible). The warning behaviour is an accepted proposal (S1-165 pacing concern; S1-166 questions not verdicts).
- **Phase:** 2
- **Evolution:**
  - Her XL-B numbers put B Story at ~27.3%, which breaks her own XL-A 25% rule (XL-046). This is an internal conflict for her to settle (Needs Yolanda Q2).
  - The spec reduced all of this to "approximate percentage/page positions" (SP-084).
- **Sources:** XL-038, XL-042, XL-043, XL-045, XL-046, XL-047, XL-048; SB-102; S1-074; SP-084, SP-087
- **Acceptance check:**
  - Place B Story at 27%. The beat shows "Your B Story rule says first 25%. Intentional?" and saves.
  - A span beat shows both start and end words. A point beat shows one value.

### R-C-010 Overlapping ranges are normal, and every percentage names what it is a percentage of
- **Requirement:**
  - Overlaps are legitimate and are not flagged as chronology errors. Example: Theme Stated at ~5% sits inside Setup at 1 to 10%. Show such a beat as a landmark inside the span.
  - Every displayed percentage names its reference unit (for example "% of manuscript" or "% of Book Two"). Estimates are distinguished from measured manuscript positions.
- **Why:** Overlap otherwise reads as a false error. An unlabelled percentage misleads once there are several containers or projected lengths.
- **Standing:**
  - Overlap tolerance: Unanswered proposal (ChatGPT editorial note).
  - Estimate labelling: Accepted proposal (S2-088).
  - Reference-unit rule: Unanswered proposal (skimmed section, S2-185). It fits her own percentage concern (S2-178).
- **Phase:** 2
- **Evolution:** The reference-unit rule arose for series. It applies equally to a single novel once actual and projected lengths differ.
- **Sources:** S5-010 (L14549-14550); S6-041 (L16311, L16356); S2-185 (L5925-5954); S2-088
- **Acceptance check:**
  - Theme Stated at 5% raises no chronology warning against Setup.
  - Every % on screen and in exports carries a unit label.

### R-C-011 Planned placement vs written placement, never treated as a mistake
- **Requirement:** Track the **Planned Story** (intended %, beat, scene) and the **Written Story** (actual % in the manuscript) side by side. Highlight significant divergence as information, with no error styling.
- **Why:** "A writing tool should inform the author, not police the author." The organically emerging scene may be better than the plan.
- **Standing:** Accepted proposal.
- **Phase:** 2
- **Evolution:** It began as the planning-vs-drafting state (S1-160). It was then made concrete as the planned vs actual word table (S2-087). The spec dropped it.
- **Sources:** S1-160, S1-161 (L2848-2887); S2-087 (L4191-4208); S1-165 (pacing concerns)
- **Acceptance check:** Planned Midpoint 50%, drafted at 54%. The beat shows "Planned 50% · Drafted 54%" with neutral styling and no blocking.

### R-C-012 Events can exist without a position, and can hold several candidate placements
- **Requirement:**
  - A story event can be recorded with what will happen and no where or when. Unknown position is stored as unknown; the program never invents a percentage, page or beat.
  - An event may hold several candidate placements at once, kept as options until the author picks. Examples: an insult exchange "probably" at Bad Guys Close In or All Is Lost; an apology earlier or at the Dark Night Confession; a candidate final line whose placement is open.
  - Optional placement precision levels and placement states (Unknown, Undecided, Tentative, Confirmed, Drafted, Intentionally unspecified) may be offered.
- **Why:** Her own point: "because Book 2 isn't written we don't know what percentage it's at yet." Approval of an idea differs from its placement.
- **Standing:**
  - Decided by Yolanda: the core point (S2-178) and her IDW habit of naming two candidate beats (S8-058).
  - Unanswered proposal: the precision levels and placement-state vocabulary (S2-181, S2-182). She skimmed those.
- **Phase:** 2 within one novel. Later for multi-book precision levels.
- **Evolution:** It began from her series question and was generalized by ChatGPT. The spec kept "approval differs from placement" (SP-071, SP-081, HV-053) but dropped unknown position and multiple candidate placements. How placement states relate to decision statuses is unclear (Needs Yolanda Q9).
- **Sources:** S2-178 (L5773); S2-179 to S2-183 (L5781-5913); S8-052, S8-058 (L22330); A15-026; A14-042; S8-106; SP-071, SP-081
- **Acceptance check:**
  - Create "insult exchange" with candidate beats BGCI and AIL. Neither is canon. Picking one keeps the other in history.
  - An event with no position never appears at a percentage on any timeline.

---

## C. Save the Cat model and her spreadsheet conventions

### R-C-013 Fifteen-beat template: fixed order, always complete, function separate from event
- **Requirement:** When the Save the Cat lens is on, the 15 beats always exist in order, with none missing:
  1. Opening Image
  2. Theme Stated
  3. Setup
  4. Catalyst
  5. Debate
  6. Break into Two
  7. B Story
  8. Fun and Games
  9. Midpoint
  10. Bad Guys Close In
  11. All Is Lost
  12. Dark Night of the Soul
  13. Break into Three
  14. Finale
  15. Final Image
  
  Further rules:
  - Default act grouping is I = 1-5, IIA = 6-8, IIB = 9-12, III = 13-15, and is configurable.
  - Each beat keeps its **structural function** separate from the **concrete story event**. "Event undecided" is a valid state.
  - No edit, regeneration or export may drop a beat.
- **Why:**
  - "The beat sheet tells me when a turn happens; what happens is mine."
  - AI posters dropped Dark Night of the Soul, and with it the Confession, "one of the most emotionally important scenes". It "should never be omitted again."
- **Standing:** Decided by Yolanda (Bible spine; her "100% accurate" demand). Accepted proposal (function vs event).
- **Phase:** 2
- **Evolution:**
  - ChatGPT's schema hard-coded "3 acts, 15 beats" (S1-136). It later said frameworks must not be forced (S1-175), so the 15 beats are the default lens, not a universal rule. Author-defined beat sheets are covered by her editability decision (A's R-A-109) and R-C-026.
  - The act subtitles ("Setup & Sparks", "Escalation", and so on) were ChatGPT inventions, not canon (S6-036).
- **Sources:** S1-074, S1-076; S5-008, S5-060, S5-064 (L13538); S6-037 (L15662-15679); S4-016, S4-040; SP-084, SP-085, SP-086, SP-088; SP-216 (AC05); S6-068
- **Acceptance check:**
  - Run every export and view after editing Beat 12. All 15 beats are present and in order.
  - A Midpoint whose event is "undecided" is valid and shows its function text.

### R-C-014 Beat record in her teaching format and her spreadsheet columns
- **Requirement:** Each beat carries these fields (all optional except number and name):
  - number and name;
  - "Also known as" (cross-framework aliases);
  - "What this beat really does";
  - "How to make it land, and how it fails" (weak and strong examples);
  - "What it is" (this book's working plan);
  - example ("One way I could play it", status Illustrative);
  - the hand-off slot ("Over to me / My move", the author's to write);
  - her general Description text;
  - example/notes (film examples such as Star Wars and The Shining);
  - group, act, target %, tolerance, point or span, start/end words, scene type (R-C-017).
- **Why:** Teach it / Show it / Hand it to me for every beat. Examples are never decisions, and are "often in more than one flavor" so she "never feels there is one right answer."
- **Standing:** Decided by Yolanda (Bible format; spreadsheet columns). The full field synthesis in XL-049 is a compiler proposal.
- **Phase:** 2
- **Evolution:** The spec kept only "notes, scenarios, linked scenes" (SP-084). The teaching fields were dropped (S1 D7).
- **Sources:** S1-023, S1-024, S1-075; S4-066; SB-004, SB beat pattern (story register §1.8); XL-014, XL-015, XL-020 to XL-037; XL-049
- **Acceptance check:**
  - Import her Bible's Catalyst section. Its "One way I could play it" text lands as Illustrative and its "Over to me" as an empty author slot.
  - The XL Description text lands in Description.

### R-C-015 Thesis / Antithesis / Synthesis worlds, with configurable membership
- **Requirement:** Support her three-movement grouping, with her definitions as group descriptions:
  - **Thesis World**: "the world as it is before... for things to stay as they are... is death."
  - **Antithesis World**: "the upside down version... stepping into Act Two must be definite."
  - **Synthesis World**: "a new world, a new life... learn from our mistakes, no matter how embarrassing."
  
  Membership per beat is configurable. Groups map onto acts (Thesis = Act One, Antithesis = Act Two, Synthesis = Act Three). Optional group colours.
- **Why:** It is how she structures any novel's beat sheet. Her All Is Lost text describes the synthesis as "the fusion of the thesis... and the antithesis."
- **Standing:** Decided by Yolanda (both spreadsheets).
- **Phase:** 2
- **Evolution:** Her two sheets disagree on Break into Three: Synthesis in XL-A, Antithesis in XL-B. Both stay possible (Needs Yolanda Q3). The Bible's four board rows coexist as a second grouping. The spec dropped the whole model.
- **Sources:** XL-004, XL-005, XL-008 to XL-013; SB-167
- **Acceptance check:**
  - The beat list can be grouped by Thesis/Antithesis/Synthesis or by Act I/IIA/IIB/III.
  - Moving BI3 between groups changes nothing else.

### R-C-016 Sub-beats: Stasis = Death and others
- **Requirement:** Beats can have unnumbered child sub-beats with optional placement.
  - **Stasis = Death**: child of Setup, placed "just before Catalyst", with her teaching text ("unless something changes for our hero, life is going to be miserable... Staying where they are is no longer an option").
  - Finale's five steps: Gathering the Team, Storming the Castle, Hightower Surprise, Dig Deep Down, Executing the New Plan.
  - Weiland's Key Event: an optional second spark after the Catalyst.
  
  The logline template's "[stasis equals death]" slot links to the Stasis = Death sub-beat.
- **Why:** Her sheets and Bible use these as real structural moments without separate beat numbers.
- **Standing:** Decided by Yolanda (spreadsheet; Bible).
- **Phase:** 2
- **Evolution:** ChatGPT's hidden "24-beat spine" thought (S1-130) may have anticipated sub-beats but was never shown to her. The spec dropped sub-beats.
- **Sources:** XL-011, XL-019, XL-023; SB-017, SB-115, SB-157; S1-076; S1-130
- **Acceptance check:**
  - Setup shows a child "Stasis = Death" with no word count required.
  - Finale can expand into its five steps, each able to hold scenes.

### R-C-017 Scene Type per beat
- **Requirement:** A scene-type field with her vocabulary:
  - "Single Scene or Single Chapter. It is ONE piece of information."
  - "Single Beat."
  - "Multi Scene or Multi Chapters."
  
  Defaults follow her sheet. Dark Night of the Soul is Single even though it spans 75 to 80%. B Story is unset. The author can override.
- **Why:** It tells her whether a beat is one card or many before she plots scenes.
- **Standing:** Decided by Yolanda (XL-A column G).
- **Phase:** 2
- **Evolution:** XL-B dropped the column. XL-A carries it. The spec never mentions it.
- **Sources:** XL-014, XL-017, XL-048; SB-167
- **Acceptance check:** A new project's Catalyst defaults to "Single Scene or Single Chapter" and Fun and Games to "Multi Scene or Multi Chapters". Both are editable.

### R-C-018 Board fields printed at specific beats
- **Requirement:** Store her board's beat-specific fields:
  - the Hero's **WANT** at Break into Two;
  - the Hero's **NEED** at Break into Three;
  - a **False Victory / False Defeat** checkbox at the Midpoint;
  - "Hero is changed / Hero rejects change" at the Final Image;
  - **Home, Work, Play** arenas in Setup;
  - a **Debate question** ("The debate section must ask a question").
- **Why:** Her wall board "prints the Want and Need lines and the Home, Work, Play arenas right on it."
- **Standing:** Decided by Yolanda (Bible; spreadsheet).
- **Phase:** 2
- **Evolution:** Dropped by ChatGPT's schema and spec (S1 D7).
- **Sources:** S1-032; SB-013, SB-111, SB-122, SB-140, SB-154, SB-163; S4-070; XL-025
- **Acceptance check:** BI2 shows a WANT field and BI3 a NEED field, and both appear on the board view.

### R-C-019 Paired beats and the polarity rule
- **Requirement:** Link the paired beats:
  - Opening Image ↔ Final Image (mirror twins);
  - Midpoint ↔ All Is Lost (inverse polarity);
  - WANT at BI2 ↔ NEED at BI3.
  
  Raise questions (not errors) when:
  - Midpoint and All Is Lost carry the same polarity;
  - the Final Image is unrelated to the Opening Image, or states the lesson outright.
- **Why:**
  - "RULE: It's never as good as it seems to be at the midpoint and it's never as bad as it seems at the All Is Lost."
  - "If nothing in the opening can be turned over later, it is not yet doing its job."
  - "If you don't have that final image... go back and check your math."
- **Standing:** Decided by Yolanda (spreadsheet RULE; Bible).
- **Phase:** 2
- **Evolution:** Dropped by the spec.
- **Sources:** XL-020, XL-029, XL-030, XL-036; S1-077; SB-104, SB-163, SB-165
- **Acceptance check:** Mark both Midpoint and All Is Lost "false defeat". The program asks whether that is intended and saves either way.

### R-C-020 Beat tests offered as diagnostic questions
- **Requirement:** Each beat can show its craft test as an optional question:
  - Catalyst: "Could the character reasonably return to normal the next day?"
  - Break into Two changes the situation, not just the mind.
  - Midpoint must turn direction, not merely be the biggest event.
  - All Is Lost is caused by the hero's own efforts, and the death is internal.
  - Dark Night: one still beat, neither skipped nor wallowed in.
  - Break into Three: the hero acts on the truth.
  - Theme Stated is never spoken by the hero.
  - Project-specific tests may be added (IDW: Finale has no clean win and Francine is never humiliated).
- **Why:** Her Bible's "how it fails" tests. ChatGPT folded them into diagnostics.
- **Standing:** Decided by Yolanda (Bible teaching). Accepted proposal (shown as diagnostics, S1-165).
- **Phase:** 2
- **Evolution:** Only partly reflected in the diagnostics (S1 D10).
- **Sources:** S1-079; SB-108, SB-115, SB-122, SB-140, SB-147, SB-151, SB-154, SB-160; S1-165
- **Acceptance check:** Opening a beat's "test" shows its question. Nothing is checked automatically unless the author asks.

### R-C-021 Editable structural templates (logline template included)
- **Requirement:** Structural templates are user-editable per project and per author. This includes her board logline template: "On the verge of [stasis equals death], a [flawed protagonist] breaks into two, but when [the midpoint happens], he or she must learn [the theme] before [all is lost]." Its slots link to the matching beats.
- **Why:** Her Bible: "I reserve the right to modify it, which I should."
- **Standing:** Decided by Yolanda.
- **Phase:** 2
- **Evolution:** Dropped from the schema and spec.
- **Related:** One instance of her decision that the program is editable: "If someone thinks of something that they had not defined yet, they can add it." (A's R-A-109, S1-016, T L2387).
- **Sources:** S1-035; S4-057; SB-017; S1-016
- **Acceptance check:** Edit the template text in one project. The other projects keep theirs, and the slots still resolve to beat fields.

### R-C-022 Generic beat descriptions are defaults that a book may contradict
- **Requirement:** Generic conventions are defaults, never assertions about this book. Examples:
  - B Story as "the love story" with "a brand new bunch of characters";
  - the Finale's bad guys "must be dispatched completely".
  
  A project may override or contradict them without being flagged as wrong. In IDW the B story is Francine's hidden thread, present from the Opening Image, and she is never "dispatched" or humiliated.
- **Why:** Her Bible calls the separate-lane B story view a "half-teaching." Applying generic text to IDW would invert her decisions.
- **Standing:** Decided by Yolanda (Bible overrides her own generic sheet text for this book).
- **Phase:** 2
- **Evolution:** It coexists with her generic sheet as a general convention (story register conflict #10).
- **Sources:** XL-027, XL-035; SB-126, SB-128, SB-158, SB-160; SP-087
- **Acceptance check:** No analyzer or AI summary flags IDW's B story for lacking a romance or new cast.

### R-C-023 Ingermanson three disasters; disaster is not a win; discovery is not a win
- **Requirement:**
  - Support the one-paragraph spine: setup; disaster 1 ending Act One (= Break into Two); disaster 2 ending the first half of Act Two, near the Midpoint, flipping the false to the true Moral Premise; disaster 3 near All Is Lost; ending.
  - Disasters 2 and 3 may be tagged "caused by the protagonist's own efforts."
  - Event classification separates **disaster/reversal**, **discovery** (information landing) and **win** (leverage played). A disaster that leaves the hero better off raises a question.
- **Why:**
  - "A disaster is a reversal, never a win."
  - "Finding is not winning... Different beats, different places on the spine. Never blur it."
  - "When the character pulls the roof down himself... we lean in."
- **Standing:** Decided by Yolanda (Bible teaching).
- **Phase:** 2
- **Evolution:** ChatGPT kept only the IDW ledger instance and never made discovery vs win a data type (S1 D9). The spec keeps the ledger's separate records (AC08) but not the general classification.
- **Sources:** S1-038 to S1-042; SB-023 to SB-028, SB-159, SB-223; S4-058; SP-219 (AC08)
- **Acceptance check:**
  - Tag the ledger find as "discovery" at All Is Lost and its use as "win" at the Finale.
  - Tagging the find as a "win" at disaster three raises the question "A disaster is a reversal. Intended?"

### R-C-024 Snowflake growth is optional, and any entry point works
- **Requirement:** Offer the Snowflake progression (one sentence → paragraph → expanded synopsis → details) as an optional path. Never require it. A project may start with one sentence, a line of dialogue or a finished draft, and the map grows with it. There is no mandatory questionnaire.
- **Why:** "We start at the smallest, truest description and expand." "There should never be a requirement to complete an enormous questionnaire."
- **Standing:** Decided by Yolanda (Bible). Accepted proposal (progressive complexity).
- **Phase:** 2
- **Evolution:** Consistent throughout. The spec keeps it (SP-097, SP-099).
- **Sources:** S1-007, S1-033, S1-171; SB-014; SP-097, SP-099
- **Acceptance check:** A project created from one sentence shows a usable (sparse) structure view with no required fields.

### R-C-025 Moral Premise scene test (thematic connection)
- **Requirement:** A scene may be tagged as showing the vice costing someone, the virtue paying off, or a character crossing from one to the other. Scenes with none of these can be surfaced as a **thematic disconnect** question. The project may record where characters flip from the false to the true premise (near disaster 2 / Midpoint).
- **Why:** "A scene that does none of those is probably not earning its place." An equation can structure a book where a theme word cannot.
- **Standing:** Decided by Yolanda (Bible teaching). Accepted proposal (thematic-disconnect diagnostic).
- **Phase:** 2
- **Evolution:** The spec's "thematic coherence" AI check (SP-163) is vaguer and drops the three-way test.
- **Sources:** S1-047, S1-048; SB-034, SB-035, SB-036; S1-165; SP-163
- **Acceptance check:** A scene with no premise tag appears in "thematic questions", worded as a question, and only when the author runs a review.

---

## D. Frameworks as lenses and cross-framework mapping

### R-C-026 Frameworks are lenses, never forced; the author selects them and says how she uses each
- **Requirement:**
  - Per project, the author selects any combination of structural and craft frameworks, or none. Options include Save the Cat (with Brody's novel percentages), McKee, Weiland, Ingermanson/Snowflake, Swain scene/sequel, Hero's Journey, Story Circle, Seven-Point, Three-Act, discovery writing and custom.
  - Each selected framework has a "how I use it / what job it does" field.
  - Combinations are deliberate, not contradictions.
  - Discovery writers can build the map retrospectively from written scenes.
  - New author-defined structures need no software update.
  - Selections change the planning tools, diagnostics and suggestions. They are not decorative checkboxes.
  - These multi-genre and multi-method choices belong in Phase 2.
- **Why:**
  - "No author should be tied or forced to use what we've been using."
  - "After I write I Declare War I'll be writing other books."
  - "The labels aren't the story. The dramatic movement is."
- **Standing:** Decided by Yolanda (S2-065, S2-066, S3-010). Accepted proposal (details).
- **Phase:** 2
- **Evolution:**
  - ChatGPT moved "different genres and writing workflows" to Phase 3 (S3-009).
  - She rejected that and put them in Phase 2 (S3-010). This replaces S3-009.
- **Related:** Author-defined structures, frameworks, beat sheets and genres are instances of her editability decision (A's R-A-109, S1-016, T L2387). Custom placement profiles: R-C-008. Custom genres: B's R-B-089.
- **Sources:** S1-175 (L3121); S1-016 (L2387); S2-035, S2-055, S2-061, S2-065 (L3903), S2-066 (L3905), S2-069, S2-075, S2-076, S2-078; S3-010 (L6322-6326), S3-012, S3-013, S3-017, S3-100; S4-128; SP-087, SP-102; HV-037, HV-068
- **Acceptance check:**
  - Create a second novel with only Story Circle selected. No Save the Cat beats or warnings appear.
  - Create one with no framework. Writing and scene lists work fully (AC01).

### R-C-027 Cross-framework translation: one turn, many names, no duplicated canon
- **Requirement:** A built-in, editable alias table ("Master Translation") lets one structural turn carry several framework names, shown together at that point:
  - **Inciting spark (~10%)**: Catalyst = Inciting Incident (McKee) = Inciting Event (Weiland) = Call to Adventure.
  - **Commitment turn (~20%)**: Break into Two = First Plot Point = Crossing the First Threshold = Point of No Return = disaster one.
  - **Middle turn (50%)**: Midpoint = Turning Point = Moment of Truth = Mid-Act Climax = false-to-true premise flip = disaster two.
  - **Low point (~75%)**: All Is Lost = Third Plot Point = Inmost Cave = Crisis = disaster three.
  - Weiland's Second Pinch Point at Bad Guys Close In and the Key Event (R-C-016).
  
  Show the correspondences without erasing real differences in function and position. Several lenses apply to the same linked event without duplicating it.
- **Why:** "I am not juggling four systems. I am using one, seen from four angles." "I found these seams myself" (her ArchPlot wall chart). Show intersections "rather than four frameworks competing for space."
- **Standing:** Decided by Yolanda (Bible). Accepted proposal (show intersections, S1-113). Unanswered proposal (approximate-correspondence explanations, S2-077).
- **Phase:** 2
- **Evolution:** The spec keeps it (SP-100, SP-101), naming one example.
- **Sources:** S1-031, S1-040, S1-088, S1-113; S2-077 (L4031-4051); S4-055, S4-056; S5-043; SB-013, SB-026, SB-144, SB-178; SP-100, SP-101
- **Acceptance check:** Selecting Break into Two shows all its aliases. Linking a scene once makes it appear under every active lens's name for that turn.

---

## E. McKee: scene values, the gap, progressive complications

### R-C-028 Scene value change, including degree changes and apparent vs actual shifts
- **Requirement:** Each scene can record:
  - the story value at stake, with opening value and closing value (charge and polarity);
  - the shift type: positive to negative, negative to positive, positive to more positive, negative to more negative, or **apparently positive but secretly negative**;
  - both the **apparent** shift and the **actual** shift when they differ.
- **Why:** "Track scene value change... a la Robert McKee." The apparent-vs-actual split captures manipulation and dramatic irony, where a hidden actor makes something look good for a character while it advances her aim. It is useful for mysteries and thrillers too.
- **Standing:** Decided by Yolanda (scene value change). Accepted proposal (nuanced and apparent/actual).
- **Phase:** 2
- **Evolution:** It adds to her card +/- rule (R-C-005). Both stay alive. The spec dropped the apparent/actual split (SP-090 keeps opening/closing values).
- **Sources:** S1-009 (L2383); S1-084; S1-144 (L2481-2497); SP-090; S3-094
- **Acceptance check:** A scene stores apparent "+ → +" and actual "+ → −". Both appear in scene zoom.

### R-C-029 Author-defined value scales with degrees (negation of the negation)
- **Requirement:** The author can define value scales with ordered degrees per project or per character, and see where scenes fall. Examples: respect → disrespect → humiliation → contempt wearing a polite face; or respect ↔ humiliation and isolation ↔ connection. Scale depth is genre-sensitive: dark extremes are never forced into a comedy.
- **Why:** It separates ordinary conflict from escalating seriousness. Her Bible's value scale is IDW's.
- **Standing:** Decided by Yolanda (Bible teaching). Accepted proposal (feature). The IDW scale wording is undecided or illustrative.
- **Phase:** 2
- **Evolution:**
  - ChatGPT's illustrative scale ended in "Dehumanization", which it explicitly did not commit to.
  - The Bible's own bottom is "contempt wearing a polite face."
- **Sources:** S1-060; SB-047; S3-095 (L7912-7938); S4-126; SP-090
- **Acceptance check:** Define a four-step scale. Mark a scene's closing value as step 3, and the scene list sorts and filters by degree.

### R-C-030 The gap: behaviour gap vs story gap, tracked at five levels
- **Requirement:** Record McKee's gap between expectation and result at:
  - character level: self-perception vs stated values vs behaviour;
  - scene level: intended vs actual outcome;
  - sequence level: successive gaps create complications;
  - act level: accumulated consequences make the major reversal;
  - story level: pursuit of desire exposes the need.
  
  The levels are distinct applications, not one definition. The character-behaviour gap and the story gap that creates tension are kept apart.
- **Why:** "We should make sure we incorporate a lot of robert's ideals about story. Especially where robert talks about the gap not necessarily a capping character. Behavior although that is one but there's always that story gap, which creates the tension."
- **Standing:** Decided by Yolanda (S3-089). Accepted proposal (levels: "To all of this: YESSSSS").
- **Phase:** 2
- **Evolution:** It feeds the analyzer (R-C-086). The spec reduced it to a scene field "McKee Gap" (SP-113).
- **Sources:** S3-089 (L7750); S3-090, S3-091 (L7764-7816); S3-099; SB-173; SP-090, SP-113
- **Acceptance check:** A scene, its sequence and its act each have a gap field. Scene zoom shows the scene's gap and lets her step up to the sequence and act gaps.

### R-C-031 Progressive complications: the conflict must change, not repeat
- **Requirement:** Across a sequence or a run of similar scenes (such as successive pranks), surface as an editorial question when the consequences look similar: "Does each failure meaningfully increase the pressure, change the relationship, or create a new obstacle?" Track the kind of trouble: comedic surface (a new type of problem, not the same joke louder), personal pressure, and social consequence. Only use outcomes established in the manuscript.
- **Why:** "An effective dramatic progression doesn't merely repeat conflict. It changes the nature, intensity, or consequences of the conflict." The aim is "Action → Unexpected outcome → Increased pressure → New decision → More consequential conflict," not "Prank → Bigger prank."
- **Standing:** Accepted proposal.
- **Phase:** 2
- **Evolution:** It came from her McKee request and stayed consistent. The spec keeps "repetitions... as editorial hypotheses" (SP-116).
- **Sources:** S3-092 (L7818-7852); S3-135; S4-108, S4-125; SP-091, SP-116
- **Acceptance check:** Three scenes tagged with the same consequence type raise one question at sequence level, worded as a hypothesis.

### R-C-032 Forces of antagonism at three levels, for every main character including the antagonist
- **Requirement:** For each main character's primary value, record forces of antagonism at three levels: inner, personal and extra-personal. The program can ask whether all three press at once and close the easy exits. This applies to the hidden antagonist too.
- **Why:** "Strength, not villainy." Without forces on her own value, an antagonist's arc "is not earned... a plot device with a feeling". She insisted on this "rightly."
- **Standing:** Decided by Yolanda (S1-068, "I Insisted On This, Rightly").
- **Phase:** 2
- **Evolution:** ChatGPT's Character Arc Layer dropped per-character antagonism (S1 D4). It was partly restored as scene-level conflict levels (S1-158). The spec restores "three-level antagonism" (SP-034).
- **Sources:** S1-060, S1-068; S3-093; S5-033; SB-046, SB-089; S1-158; SP-034, SP-090
- **Acceptance check:** Each main character has three force slots. The antagonist record has them too, and empty slots surface as a question only in Deep Analysis mode.

### R-C-033 Tension, emotional intensity and comic intensity, separate from value
- **Requirement:** Each scene can carry ratings or notes for dramatic tension, emotional intensity and (for comedy) comic intensity, independent of the story value. The project can review the rhythm across scenes (humour, tension, tenderness, discovery). For example, it can show where intimate scenes sit back to back.
- **Why:**
  - "Maximum laughter" need not coincide with "maximum dramatic tension".
  - "Sometimes the quietest scene carries the greatest emotional weight."
  - The aim is to avoid an emotionally flat manuscript even when plenty happens.
- **Standing:** Accepted proposal (S1-153). Unanswered proposal (pacing caution S8-080; consistent with her "get them back to fighting").
- **Phase:** 2 for data. 3 for the visual rhythm chart.
- **Evolution:** Dropped by the spec.
- **Sources:** S1-153 (L2666-2712); S1-104; S8-080, S8-089 (L23133-23135)
- **Acceptance check:** Three consecutive scenes tagged "tenderness" with low comic intensity can be listed together by a rhythm filter.

---

## F. Swain scene and sequel

### R-C-034 Scene (proactive) and sequel (reactive) engine with alternation diagnostics
- **Requirement:**
  - A scene can be marked **Proactive** (Goal → Conflict → Disaster/Setback) or **Reactive/Sequel** (Reaction → Dilemma → Decision → New Goal).
  - A sequel's decision links to the next scene's goal.
  - Diagnostic: "spinning without moving" means Scenes with no Disaster or Sequels with no Decision. Either can be surfaced as a question.
  - Alternation can be reviewed: all scenes "suffocates", all sequels "sits in a chair".
- **Why:** "The pulse of a novel." "Scene is the inhale, Sequel the exhale. Most meaning lives in the Sequel." It is on her wall poster.
- **Standing:** Decided by Yolanda (Bible).
- **Phase:** 2
- **Evolution:**
  - ChatGPT linked it to the causal chain (R-C-047).
  - The spec keeps "disaster/reaction/dilemma/decision as applicable" but never names Swain and drops the alternation diagnostic (S6 dropped item 1).
  - The revised AI poster renamed the rows "Complication / Turning Point", a distortion (S3-154).
- **Sources:** S1-086 (bible L1410-1464); SB-011, SB-173 to SB-177; S3-032; S3-058; SP-037, SP-113; S2-032
- **Acceptance check:**
  - Mark a scene Reactive with no Decision. A structural review lists it under "sequels without a decision."
  - Its decision can be linked to the next scene's goal.

---

## G. Storylines beyond A and B; narrative containers

### R-C-035 Plot strands and values are different entities
- **Requirement:** A **plot strand** (A, B, C, sometimes D) is a line of action with its own events. An **arc or value** is cargo that rides on a strand, never a strand of its own. A character arc or relationship arc (for example rivalry to friendship) can be modelled inside a strand without becoming a "third plot."
- **Why:** "Values ride the plot lines, so I never mistake a value for a thread." Otherwise "a writer ends up thinking she has four plots when she has two plots carrying four meanings."
- **Standing:** Decided by Yolanda (Bible).
- **Phase:** 2
- **Evolution:**
  - ChatGPT restated it faithfully (S1-111). The spec keeps the IDW instance (SP-127).
  - Her board colours cards by "Kevin, Anthony, Francine, theme", which treats theme as a colour lane. That is a small internal tension (Needs Yolanda Q10).
- **Sources:** S1-080, S1-081 (bible L981-1007); SB-130, SB-131, SB-132, SB-169; A14-004, A14-040; SP-127
- **Acceptance check:** Create strand A and attach two values. The values never appear in the strand list, and they appear as cargo on A's events.

### R-C-036 Any number of storylines, each with a permanent identity
- **Requirement:**
  - No limit on storylines.
  - A/B/C/D labels are optional.
  - Each storyline has a permanent identity and name. Its letter is an attribute of its role, not its identity.
  - Visual layouts add a lane or layer for each additional storyline.
- **Why:** "We cannot limit the author to just A and B." Plots resolve at different times, and a storyline's importance in one unit may differ from its importance overall.
- **Standing:** Decided by Yolanda (S2-158). Accepted proposal (identity vs letter, S2-161; lane per plotline, S5-104).
- **Phase:** 2 within a novel. Later for per-episode or per-book letter roles.
- **Evolution:**
  - ChatGPT's sequence map assumed only "A Story, B Story" (S2-152), and she corrected it immediately.
  - The spec still says "A/B plots" (SP-035) and names no unlimited storylines. That is a narrowing.
- **Sources:** S2-158 (L5325); S2-161 (L5347-5390); S5-104 (L14841-14866); SP-035
- **Acceptance check:** Create seven storylines without letters, then letter three of them. Renaming or re-lettering never breaks links.

### R-C-037 Weave, touch-points, convergence, and resolve-now vs held-open
- **Requirement:** Track:
  - where storylines touch (scenes that move more than one strand);
  - where they converge (usually the climax);
  - for each storyline, whether it resolves now or is deliberately held open.
  
  Questions are raised when a secondary strand "runs untouched beside the A story," is "raised and then dropped," or "resolves off in its own corner."
- **Why:** "Threads weave rather than run in parallel; the strongest scenes move more than one thread at once." "Always know which of your threads resolve now and which you are deliberately holding open."
- **Standing:** Decided by Yolanda (Bible).
- **Phase:** 2
- **Evolution:** Not restated by ChatGPT (S1 D10). It was later generalized into resolution architecture (R-C-039).
- **Sources:** S1-082 (bible L970-1019); SB-128, SB-134, SB-135
- **Acceptance check:** A strand with no shared scene after 22% appears in a weave review as "untouched beside A?". Marking it "held open" suppresses unresolved-strand questions.

### R-C-038 Storyline lifecycle states
- **Requirement:** Each storyline can carry a state:
  - Introduced
  - Developing
  - Escalating
  - Temporarily resolved
  - Dormant
  - Reopened
  - Resolved
  - Intentionally unresolved
  - custom
  
  A storyline need not resolve when its container ends.
- **Why:** It came from her multi-plot example: A and B settle early while C and D settle much later.
- **Standing:** Accepted proposal (blanket acceptance).
- **Phase:** 2 as an optional field in a novel. Later across containers.
- **Evolution:** Proposed for TV, but useful for subplots in a single novel (Needs Yolanda Q11).
- **Sources:** S2-163 (L5431-5460)
- **Acceptance check:** Set a subplot to Dormant. The weave review stops asking about it until it is set to Reopened.

### R-C-039 Resolution architecture, narrative obligations, commitments and outcome anchors
- **Requirement:**
  - **Narrative obligations**: significant questions or promises made to the reader, remembered until paid, with no demand for an immediate answer.
  - **Closure levels**: scene, sequence, act, book, with intentional loose ends allowed at any level.
  - Optional **narrative commitments**: things that must happen, with how or where undecided.
  - Optional **outcome anchors**: a known destination with no causal path yet.
- **Why:** Promises to the audience and destinations known before paths are real planning states. They must be held without forcing premature decisions.
- **Standing:** Accepted proposal (closure, obligations: S2-167, S2-168). Unanswered proposal (commitments, outcome anchors: S2-186, S2-187; she skimmed).
- **Phase:** 2 inside a novel. Later across books and seasons.
- **Evolution:** Obligations (promises to the audience) and commitments (the author's own decisions about future events) overlap. Whether they are one data type or two is unclear (S2 unclear items).
- **Sources:** S2-167, S2-168 (L5512-5553); S2-186, S2-187 (L5956-6002); S2-192
- **Acceptance check:** Record "Who is behind the war?" as an obligation planted at 10%. It shows as open until a reveal event is linked as its payoff.

### R-C-040 Narrative containers are configurable, and containment, participation and causality stay independent
- **Requirement:** The data model keeps three independent dimensions:
  - **containment**: which container presents the event (novel → act → sequence → scene, or custom units);
  - **participation**: which storylines the event advances;
  - **causality**: why it happens.
  
  Container templates are configurable and unit names are not dictated. The standalone novel template is the default. Series, TV, film and anthology templates and the Story Universe come later. Phase 2 must not make them impossible.
- **Why:** "A narrative container determines where a story event is presented. A storyline determines what larger dramatic development that event belongs to. A causal relationship explains why the event happens." Her expansion to series and TV ("Oh darn. I think I just expanded this") was then phased by her: "We do not want scope creep."
- **Standing:** Accepted proposal (S2-162, S2-166, S2-176). Decided by Yolanda (phasing: Story Universe is iteration 3, later; S3-001, S6-001). Author-defined container templates and unit names are also an instance of her editability decision (A's R-A-109, T L2387).
- **Phase:** 2 for the data separation. Later for the multi-container templates.
- **Evolution:**
  - Yolanda's iterations: posters, then the novel program, then Story Universe.
  - ChatGPT later numbered the visual engine Phase 3 and Story Universe Phase 4 in a single reply (S6-004, T L15127-15144). She confirmed neither number.
  - The spec defers the Story Universe to Phase 3 alongside the visual engine (SP-028, F5). That conflicts with her numbering (see Conflicts).
- **Sources:** S2-159 (L5327); S2-162, S2-166, S2-175, S2-176 (L5392-5757); S3-001 (L6139-6150), S3-016; S6-001, S6-004; SP-028
- **Acceptance check:** In Phase 2 a scene's container link and its storyline links are separate relations. Removing a storyline link never moves the scene.

---

## H. Point of view

### R-C-041 POV recorded at project, chapter and scene levels with defaults and exceptions
- **Requirement:** POV is recorded at three levels:
  - Project: overall approach, such as alternating first person.
  - Chapter: viewpoint character and narrative person.
  - Scene: the actual viewpoint.
  
  Lower levels inherit defaults and allow exceptions, such as a third-limited novel with first-person diary entries. The author designates which character's POV each unit is in and its grammatical person.
- **Why:** "then we would need to designate which character's point of view is being examined and whether that POV is first person, second person, third, etc." Real books mix approaches.
- **Standing:** Decided by Yolanda (S2-102). Accepted proposal (three levels).
- **Phase:** 2
- **Evolution:**
  - She assumed multiple POV "usually" means an ensemble. ChatGPT refined this: not necessarily (S2-105). She agreed, so her requirement stands and only her assumption was refined.
  - The spec reduced this to "narrator/POV" per scene plus project rules (SP-113, SP-118).
- **Sources:** S2-102 (L4459); S2-105, S2-106 (L4481-4517); SP-113, SP-118
- **Acceptance check:** Set the project default to "alternating first person" and the chapter to Anthony. A scene inherits Anthony and first person and can override with a warning-free exception.

### R-C-042 POV record attributes
- **Requirement:** A POV record holds:
  - viewpoint character;
  - narrator;
  - narrative person (1st, 2nd, 3rd);
  - narrative distance;
  - tense;
  - knowledge limitations;
  - reliability (reliable, unreliable, selectively informed);
  - narrative function (why this POV was chosen).
  
  Protagonist, viewpoint character, narrator and narrative importance stay distinct. An optional POV transition tracker shows where viewpoints change and whether the change is deliberate.
- **Why:** These are not always the same person or property.
- **Standing:** Accepted proposal (blanket).
- **Phase:** 2
- **Evolution:** Dropped by the spec except narrator/POV and "which POV character knows what."
- **Sources:** S2-105, S2-107 (L4519-4534)
- **Acceptance check:** A scene can have narrator ≠ viewpoint character, and reliability = "selectively informed" is stored and filterable.

### R-C-043 One narrator per scene; heads change only at a seam
- **Requirement:**
  - A project-level rule can require one viewpoint per scene (or per chapter), with heads changing only at a visible seam (scene or chapter break), never inside a scene.
  - When the rule is on, drafts and plans with two viewpoints in one scene are flagged as possible head-hopping.
  - Other projects can configure different rules.
- **Why:** "Alternating Point of View Is Not Head-Hopping." "Change heads only at a seam, never inside a scene." Head-hopping breaks the reader's trust and the misdirection.
- **Standing:** Decided by Yolanda (Bible: "one point of view per scene or chapter, held without exception").
- **Phase:** 2
- **Evolution:**
  - IDW test data: the Bible decides that Kevin narrates in first person and that the POV alternates between Kevin and Anthony (SB L289). On 10-15 she decided only that the call-in chapter is Anthony's POV: "This chaptet would definitely be Anthony's POV. otherwise we would not be able to capture the beauty of anthony's torment." (S7-103, T L19957). "First person" for Anthony came from ChatGPT's reply ("because Anthony is narrating in first person", T L19966-19995) and was recorded in the 10-15 archive under an "AUTHOR DIRECTION" label (A15-018). Anthony's grammatical person is a Proposed item (IDW PV-003).
  - An AI poster wrongly made Kevin the primary narrator (S3-157, S4-008).
  - The spec weakened the rule to "may be a hard integrity rule" (SP-119). AC07 says "enforce" and the appendix says "per scene/chapter" (F6). See Conflicts and Needs Yolanda Q6.
- **Sources:** S1-098, S1-099, S1-100 (bible L1594-1687); SB-198, SB-199, SB-200; S4-046, S4-073; S5-015; S7-103 (L19957); A15-018; SP-118, SP-119, SP-218 (AC07), SP-248
- **Acceptance check:** With the rule on, a scene record listing two viewpoint characters, or a draft passage tagged with two heads, produces a head-hop question.

### R-C-044 Withheld POV (secret keeper) and leak checking
- **Requirement:**
  - A character can be marked "POV withheld until [event or point]."
  - Before that point the program can check for a **slow leak**: a line of the withheld character's interior in planned scenes, drafts, or POV-facing AI summaries.
  - When the withheld POV first opens is its own open decision.
  - A reveal can be delivered through a found object (a ledger or journal) instead of a POV break, and is recorded as the reveal-delivery device.
- **Why:**
  - "Point of view is the control valve on information."
  - "Keep the secret-keeper outside the point of view until I am ready to reveal them."
  - The reveal must be fair: "I never lied, I just never gave them Francine."
- **Standing:** Decided by Yolanda (Bible).
- **Phase:** 2
- **Evolution:**
  - Posters loosened "until the reveal" to "until near the reveal" (S5 distortions).
  - The spec keeps author-only truth records and leakage checks (SP-121, SP-166, AC07).
  - Whether the secret keeper ever gets her own POV section is open (SB-202).
- **Sources:** S1-064, S1-098, S1-101; SB-079, SB-197, SB-198, SB-201, SB-202, SB-224; S4-047, S4-079; S5-016, S5-017; SP-121, SP-166
- **Acceptance check:** Mark a character withheld until All Is Lost. A pre-AIL scene tagged with her interior, or an AI summary for a pre-AIL POV scene that mentions her hidden act, is flagged.

### R-C-045 POV coverage map and narrator honesty
- **Requirement:**
  - A **POV coverage** view lists every chapter and scene with its viewpoint. It reveals long absences, balance shifts, and whether a revelation arrives through the intended perspective. These are observations, not rules.
  - Optional AI critique questions on **narrator honesty**: a first-person narrator should not artificially conceal facts they know just to protect a reveal. Unreliability about their own emotional state is allowed.
- **Why:** Balance awareness in alternating-POV books. Psychological honesty in first person.
- **Standing:** Unanswered proposal (coverage map, S2-109; honesty, S8-074, S8E-022; A15-040 guidance).
- **Phase:** 2 as a list. 3 as a visual map.
- **Evolution:** The coverage map was proposed under blanket agreement. The honesty point arose live in the father-in-memory-care discussion.
- **Sources:** S2-109 (L4542-4550); S8-074 (L22899-22927); S8E-022; A15-040
- **Acceptance check:** The coverage list shows "Anthony: no scene for 6 chapters" as an observation. The honesty check is only offered on request.

---

## I. Time, storyworld, setting

### R-C-046 Story time, space and duration defined per project
- **Requirement:** Each project can define:
  - **Time**: year or era, season, and "the atmosphere now".
  - **Space**: locations and "all the different set pieces like each person's house or the neighborhood or where they go".
  - **Story duration**: a single week, a season, a year, multiple weeks, and so on.
  
  All are optional, filled in "as needed." In this sense "set pieces" means physical settings. It is a different subject from comedic set pieces (R-C-048).
- **Why:** The story world must be specified, and duration shapes the timeline. Details "fill in a piece at a time, whenever a detail arrives."
- **Standing:** Decided by Yolanda (S1-013, S1-014, S1-015). In the same message she added that anything not yet defined can be added (S1-016, T L2387; A's R-A-109). Custom setting fields, location kinds and set-piece kinds are therefore required, not just the listed ones.
- **Phase:** 2
- **Evolution:**
  - ChatGPT turned "space" into a Storyworld Database (S1-150, accepted) but kept the schema's "Set Pieces" layer as comedic scenes, so both concepts are needed (S1 D8).
  - The poster foundation swapped the Bible's "era" for "season" (PF-024). She asked for both year and season.
  - The spec mentions only places/settings and in-world chronology. It drops season, atmosphere and duration.
- **Sources:** S1-013, S1-014, S1-015 (L2385); S1-107; SB-099; PF-024; SP-040, SP-051
- **Acceptance check:** A project shows optional Era/Year, Season, Atmosphere and Duration fields plus a location list. A "set piece" location is a different type from a "set piece" scene.

### R-C-047 Locations with sub-spaces, relationships and sightlines
- **Requirement:**
  - Locations nest (neighbourhood → property → yard, porch, garden, room) and carry relationships, including **sightlines** ("Can Francine see Anthony's backyard from her porch?").
  - Locations can hold story-relevant objects and spots (for example where the ledger is kept).
  - Physical plausibility can be raised as a question against the scenes that use a location.
- **Why:** Sightlines "could determine whether an entire scene is physically plausible."
- **Standing:** Accepted proposal.
- **Phase:** 2
- **Evolution:** Dropped by the spec.
- **Sources:** S1-150, S1-151 (L2593-2642)
- **Acceptance check:** Record "porch → can see → Anthony's backyard: no". A scene where Francine observes the backyard from her porch is listed as a plausibility question.

### R-C-048 Comedic set pieces as structural items
- **Requirement:** Key set pieces (signature scenes or sequences) are records with:
  - where they land (beat or position);
  - the story job they perform;
  - the strands they move;
  - their planned/drafted state.
  
  A set piece may fold into one card or expand into a sequence.
- **Why:** Set pieces are "the promise of the premise". "Every prank should also be plot."
- **Standing:** Accepted proposal (Schema 6). Decided by Yolanda (Bible rules).
- **Phase:** 2
- **Evolution:** It coexists with physical "set pieces" (R-C-046) as a different subject.
- **Sources:** S1-138 (L2344-2352); SB-136, SB-138, SB-182, SB-188; S1-109
- **Acceptance check:** The set-piece list shows each piece's beat, job and strands, and opens into its sequence.

### R-C-049 Two synchronized timelines: narrative position and storyworld time
- **Requirement:** Each scene or event can be placed on two linked timelines:
  - **Timeline One, Narrative Position**: scene number, act, beat, % through the manuscript, page estimates.
  - **Timeline Two, Storyworld Time**: date, time of day, place, elapsed time since the previous incident, and a project-defined day counter (such as "day of the feud").
  
  Narrative order and chronological order can differ (flashbacks, overlapping POV, events revealed after they occur).
- **Why:** In a hidden-actor story, her acts happen before the others experience their consequences.
- **Standing:** Accepted proposal.
- **Phase:** 2
- **Evolution:**
  - The example values were illustrative.
  - ChatGPT hard-coded "page in 250 and 300 pages" here too (S1 D2). Use R-C-007 instead.
  - The spec keeps "narrative and chronological order" (SP-113) and "chronology out of narrative order" (SP-117). It drops elapsed time and the day counter.
- **Sources:** S1-148 (L2544-2583); S6-136; SP-113, SP-117
- **Acceptance check:** A flashback scene sits at narrative 40% while its storyworld date precedes scene 1. Both orderings can be listed.

### R-C-050 Three times per event: happens, reader encounters, each character learns
- **Requirement:** For any event, record:
  1. when it actually happens;
  2. when the reader encounters it;
  3. when each character learns about it.
- **Why:** The third "could become one of the program's most distinctive features." It is the backbone of misdirection and of knowledge-timing checks.
- **Standing:** Accepted proposal.
- **Phase:** 2
- **Evolution:** It feeds the knowledge layer (R-C-060) and the knowledge-timing check (R-C-063). The spec dropped it as an explicit structure.
- **Sources:** S1-149 (L2585-2591)
- **Acceptance check:** A hidden act happens at story-day 3, the reader learns of it at 75%, Kevin at 75% and Anthony that evening. All four values are stored and shown in scene zoom.

### R-C-051 Optional per-scene atmosphere fields
- **Requirement:** Optional per-scene fields:
  - season;
  - time of day;
  - weather;
  - physical atmosphere;
  - emotional atmosphere;
  - sensory details;
  - environmental consequences (mud after rain, heat affecting smell, darkness limiting visibility).
- **Why:** "Weather isn't always background decoration. Sometimes it participates in the plot." For example, a hot afternoon versus a cool morning changes how a smell plays.
- **Standing:** Accepted proposal (answers her atmosphere request S1-013).
- **Phase:** 2
- **Evolution:** Dropped by the spec.
- **Sources:** S1-152 (L2644-2664); S1-013
- **Acceptance check:** A scene saved with "Season: summer; Time of day: afternoon; Consequence: heat intensifies smell" shows these in scene zoom and filters.

### R-C-052 Time dimension on character facts: backstory, present, in-story event
- **Requirement:** Character facts can be marked:
  - past (backstory or Ghost);
  - present state at story start;
  - event within the story (with its narrative position).
  
  The program and AI must not treat an in-story event as the Ghost just because it is painful, and must not merge a past event with a current one.
- **Why:** She had to correct a timing confusion: "Kevin lost his job in the past. He is not currently unemployed." She then placed Anthony's job loss "within the story proper," which by Weiland logic makes it not his Ghost.
- **Standing:** Decided by Yolanda (the IDW corrections). Possibility (the general model, inferred).
- **Phase:** 2
- **Evolution:** ChatGPT first made the downsizing the Ghost (S8-043). Her timing decision replaced that (S8-047), and ChatGPT corrected itself (S8-049).
- **Sources:** S8-046 (L22047-22049), S8-047 (L22086-22088), S8-049, S8-104; A15-011, A15-016
- **Acceptance check:** Marking an event "in-story at ~60%" and also tagging it "Ghost" raises the question "A Ghost precedes the story. Intended?"

### R-C-053 Deterministic timeline consistency checks
- **Requirement:** On request (or quietly in the background), report factual contradictions:
  - a character in two places at once;
  - inconsistent dates or elapsed times;
  - age/timeline inconsistencies.
  
  Legitimate framework overlap (R-C-010) is tolerated.
- **Why:** These are objective continuity errors that the program can verify rather than guess.
- **Standing:** Accepted proposal.
- **Phase:** 2
- **Evolution:** The spec makes age/timeline an AI check (SP-165). This register keeps it deterministic where data allows.
- **Sources:** S1-165 (L2933-2959); S2-018, S2-019 (L3305); SP-165
- **Acceptance check:** Two scenes with the same storyworld date and time put one character in two locations. The structural review lists it as a factual finding, labelled as evidence.

---

## J. Causality, clues, plants and payoffs, knowledge

### R-C-054 Cause and effect as a first-class relationship, distinct from order
- **Requirement:**
  - Events and scenes can be linked by directed **causal** links (cause → effect), separate from chronological and structural order.
  - Each link can carry a reason ("why one event causes the next").
  - One cause can branch to several effects, and several causes can converge on one event.
  - Relationship types are kept distinct:
    - structural (containment);
    - causal;
    - thematic (a scene expresses or transforms a value);
    - participation (contributes to a storyline).
  - "Every element should know where it belongs, what it depends on, what depends on it, and what changes because of it."
- **Why:**
  - "There's a cause-and-effect between scenes."
  - "That chain of causality is the novel's engine."
  - Most writing software "only arranges scenes."
- **Standing:** Decided by Yolanda (S1-012). Accepted proposal (S1-117, S1-145, S1-147, S1-176, S2-021).
- **Phase:** 2
- **Evolution:** The spec keeps causality in scene fields and the ripple engine, but not branching or the explicit relationship typing.
- **Sources:** S1-012 (L2383); S1-117 (L2010-2036); S1-145, S1-147 (L2499-2542); S1-176 (L3125-3143); S2-021 (L3323-3327); S2-166
- **Acceptance check:** Link one scene to three effect scenes and one convergence scene. The causal view shows the branch and the convergence. Deleting a causal link leaves containment intact.

### R-C-055 Per-scene causal chain (Cause → Action → Consequence → Reaction → Decision → Next action)
- **Requirement:** Each scene can answer:
  - What caused this scene?
  - What does the viewpoint character want?
  - What opposes it?
  - What actually happens?
  - What value changes?
  - What new problem or opportunity emerges?
  - What decision follows?
  - Which scene does that decision cause?
  
  The chain is Story Value → Expectation/Result Gap → Character Response → Causal Consequence.
- **Why:** It maps Swain's scene/sequel onto causality, and it is "one of the central mechanisms in our scene-analysis system."
- **Standing:** Accepted proposal.
- **Phase:** 2
- **Evolution:** It links R-C-034 and R-C-030. The spec carries most fields in the scene worksheet (SP-113).
- **Sources:** S1-146 (L2517-2532); S3-094 (L7878-7910); SP-113
- **Acceptance check:** Fill "decision" in scene 5 and link it to scene 6. Scene 6's "what caused this" shows scene 5's decision.

### R-C-056 Causal integrity analysis: missing vs unconvincing links
- **Requirement:**
  - Examine the dramatic logic of each transition in a causal chain.
  - Report a **missing** connection (no recorded link) separately from an **unconvincing** one (a link exists but the outcome does not support what follows).
  - Each finding names the specific transition and explains why. Example: "Scene 3 depends on Kevin believing Anthony deliberately humiliated him, but Scene 2 only establishes an inconvenience."
- **Why:** Her concern: if scene 2 is weak it "cannot logically create the next chain reaction," and "the program needs to be smart enough to see that and identify that and bring it to the author." "A story can contain individually excellent scenes and still fail because the logic connecting them doesn't hold."
- **Standing:** Decided by Yolanda (S2-002). Accepted proposal (name and missing/unconvincing split).
- **Phase:** 2
- **Evolution:**
  - She raised it at 10:35. ChatGPT named it "causal integrity analysis."
  - It was confirmed as Phase 2 (S3-008).
  - The poster fish-guts error became the live example of why it matters (S3-143).
  - The spec reduces it to AI "possible causal holes" (SP-164). It drops the missing/unconvincing split.
- **Sources:** S1-179, S2-002 (L3181); S2-004, S2-005 (L3191-3217); S3-008; S3-143; SP-164
- **Acceptance check:**
  - A gap between two linked scenes is labelled "missing link" (evidence).
  - A linked pair whose outcome lacks the motivation needed downstream is labelled "potential causal weakness" (interpretation) with an explanation.

### R-C-057 Downstream dependency on an unsupported assumption
- **Requirement:** When a link is weak, identify every downstream scene that relies on the same unsupported assumption.
- **Why:** This is "substantially more useful than software that merely says 'Your pacing seems slow.'"
- **Standing:** Accepted proposal.
- **Phase:** 2
- **Evolution:** Dropped by the spec as a distinct behaviour.
- **Sources:** S2-007 (L3229-3231)
- **Acceptance check:** Weakness at 2 → 3 also lists scenes 4 and 5 that depend on the same belief.

### R-C-058 Removal (load-bearing) test, and three separate evaluation dimensions with no single score
- **Requirement:**
  - **Removal test**: "If Scene 2 is removed, does Scene 3 still make sense?" A scene whose removal destroys motivation downstream is load-bearing. Load-bearing does not mean good.
  - Each scene is described on three separate dimensions:
    - **structural importance** (how much depends on it);
    - **dramatic effectiveness** (does it accomplish its purpose convincingly);
    - **causal integrity** (does its outcome support what follows).
  - Never collapse these into one numeric score. Explain what works, what is questionable, and what depends on it.
- **Why:** A scene can be high on one dimension and low on another, and a single score hides that.
- **Standing:** Accepted proposal.
- **Phase:** 2
- **Evolution:** Dropped by the spec.
- **Sources:** S2-008, S2-009, S2-010 (L3235-3259)
- **Acceptance check:** A scene report shows three labelled sections in prose, and no overall score appears anywhere.

### R-C-059 Unplanned material is not a plot hole
- **Requirement:** The program never confuses missing planning information with missing story logic.
  - Unmapped intervening events are reported as "The events connecting X to its destination have not yet been mapped," with an option to explore that storyline. They are never reported as "Plot hole detected."
  - An incomplete chain toward a known outcome is a development opportunity.
  - Planned vs written divergence is not a mistake (R-C-011).
- **Why:**
  - "No pressure, no invented structure, and no false diagnosis."
  - It protects causal analysis from false positives, and matches her rule "we don't want to give any bad writing advice."
- **Standing:**
  - Decided by Yolanda: the core (S2-178, she cannot be required to know where something lands in unwritten material; S2-026, no bad advice).
  - Unanswered proposal: the exact wording and outcome-anchor mechanics (S2-186, S2-191; skimmed).
- **Phase:** 2
- **Evolution:** It arose for unwritten later books. It applies equally to an unplotted middle of one novel ("know the beginning and end without the middle," S2-193). The spec dropped it.
- **Sources:** S2-178, S2-180, S2-186, S2-191, S2-193 (L5773-6133); S2-026 (L3337); S1-160, S1-161
- **Acceptance check:** A storyline with an introduction at 10% and a resolution destination but no middle events never produces a "gap/hole" finding. It shows "not yet mapped" with an Explore action.

### R-C-060 Knowledge layer: truth, character knowledge, belief, reader knowledge, suspicion, revelation
- **Requirement:** Per revelation or secret, record:
  - actual truth;
  - each character's knowledge;
  - each character's **belief** (a character can hold information yet interpret it wrongly);
  - reader knowledge;
  - reader suspicion (what the narrative encourages);
  - the revelation point.
  
  The layer is optional per project and activated by narrative characteristics such as "hidden truth", "unreliable narrator" or "dramatic irony."
- **Why:**
  - "Protect the revelation you're engineering."
  - "Those differences are where some of your best comedy and misdirection could originate."
  - "Essential for your novel, but optional for other genres."
- **Standing:** Accepted proposal.
- **Phase:** 2
- **Evolution:**
  - It began as a poster reader-knowledge track (S1-115). It became Schema 7 (S1-139) and was expanded with belief and suspicion (S1-154).
  - The spec keeps knowledge, reader knowledge, suspicion and truth (SP-120). It drops **character belief** as distinct from knowledge.
- **Sources:** S1-115, S1-139, S1-154, S1-155 (L1984-2743); S2-080; SP-120, SP-124
- **Acceptance check:** Record "Kevin knows Anthony wasn't home" and "Kevin believes Anthony arranged it" as two entries at the same point. Both appear in the knowledge view for that scene.

### R-C-061 Secret Operations Log for a hidden actor
- **Requirement:** For any hidden or secret actor, keep an author-only chronological log with these columns:
  - When (beat or rough point);
  - the hidden move;
  - what the others see and how they misread it;
  - who takes the blame.
  
  Entries can be added before the scene the others experience is written. The log never leaks into POV-facing summaries.
- **Why:**
  - "The only place the real story lives in order." "Without it I will lose track."
  - "A hidden-truth book needs these more than any other kind, because I am the only person holding the truth."
- **Standing:** Decided by Yolanda (Bible Part Nine, "Francine's Ledger").
- **Phase:** 2
- **Evolution:**
  - Parts Seven to Nine were missing from the first transcript parse (S1-108) and surfaced later.
  - The spec keeps "secret-operations truth" as register (a) (SP-122) without her columns.
- **Sources:** SB-218, SB-219, SB-225; S4-076; S5-042; S6-138; SP-121, SP-122
- **Acceptance check:** Create a hidden actor log with the four columns. A row entered at Fun and Games appears in the author view and is absent from Kevin-POV summaries.

### R-C-062 Plant-and-payoff (clue) tracker with two-way completeness check
- **Requirement:**
  - Columns: the plant (shown on the page) / where it sits / what it secretly means / where it pays off.
  - Relations are many-to-many: one setup to several payoffs, one payoff from several setups. One object can carry several narrative functions.
  - Checks:
    - "no plant is missing its payoff and no payoff arrives without a plant";
    - significant setups without a payoff are listed as **Unpaid Promises**, noting that "not every detail needs to pay off."
  - Setup→reveal→payoff steps stay distinct records with reverse navigation (for example planted early / discovered at All Is Lost / wielded in the Finale).
  - Optional reader-curiosity plants are supported (a reader wonders, then a later scene explains).
- **Why:** "If it pays off later, it has to be here first." Payoffs should feel inevitable, not convenient. Fair play: "the reader can look back and see I never lied."
- **Standing:** Decided by Yolanda (Bible tracker and rules). Accepted proposal (many-to-many, Unpaid Promises).
- **Phase:** 2
- **Evolution:**
  - One Bible tracker row says the ledger is found "in the finale". Her Decided sections and both archives put discovery at All Is Lost, so that row is superseded (Needs Yolanda Q15).
  - The spec keeps clue registers (SP-122, SP-123) and AC08. It drops Unpaid Promises and the two-way check.
- **Sources:** S1-078, S1-139, S1-156, S1-157 (L2745-2775); SB-113, SB-223, SB-226 to SB-229; S4-080, S4-111, S4-116; A15-039; S8-068, S8-107; SP-122, SP-123, SP-219 (AC08)
- **Acceptance check:**
  - A payoff with no linked plant, and a plant marked significant with no payoff, both appear in the payoff audit as questions.
  - From a payoff, "show plant" navigates back.

### R-C-063 Knowledge-timing check (acting on information before learning it)
- **Requirement:** Deterministically flag a character who uses or acts on information in a scene that precedes the point where that character learns it (from R-C-050 and R-C-060).
- **Why:** It is an objective continuity error, one of the checks that "should" be deterministic.
- **Standing:** Accepted proposal.
- **Phase:** 2
- **Evolution:** The spec has POV leakage and continuity AI checks (SP-166, SP-167) but not this deterministic check.
- **Sources:** S2-018, S2-019 (L3305); S1-165
- **Acceptance check:** Kevin learns X at 75%. A 60% scene marked "Kevin acts on X" is listed as a factual finding.

### R-C-064 Reader-knowledge timeline (suspicion curve) and visible/hidden story layers
- **Requirement:**
  - A **Reader-Knowledge Timeline**: point in the book / what the reader suspects about the hidden truth / what each POV character knows. Shown beside each other.
  - Every event can be marked as part of the **visible story** (what the POV characters believe is happening) or the **hidden story** (what is actually happening), with emotional change as a third layer.
- **Why:**
  - "When a beat moves the reader's suspicion, make sure it moved because I chose to move it."
  - Two versions of the story run at once: the one the men think they are living and the one actually happening.
- **Standing:** Decided by Yolanda (Bible tracker). Accepted proposal (visible/hidden layers, S1-111, S1-112).
- **Phase:** 2 for data. 3 for the above/below-timeline layout.
- **Evolution:** The spec keeps the "reader knowledge/suspicion curve compared with each POV character" (SP-122) and "reader belief versus underlying truth" (SP-124).
- **Sources:** SB-230 to SB-233; S1-111, S1-112 (L1904-1938); S4-094; S5-042; SP-122, SP-124
- **Acceptance check:** Raise "reader suspects third party" at the Midpoint. The curve shows the step, and the hidden layer lists the events that caused it.

### R-C-065 Motifs and recurring elements
- **Requirement:** An image, object, behaviour, phrase or situation can be a motif. Track where it appears and how its meaning changes across the book.
- **Why:** Meaning develops (the garden goes from barely noticed, to motive, to the visible centre of peace). This is valuable for literary, historical and multigenerational fiction.
- **Standing:** Accepted proposal (the IDW motif list is a Possibility).
- **Phase:** 2
- **Evolution:** The spec lists "motif" only as a capture type (SP-078), not as a tracked entity.
- **Sources:** S1-159 (L2817-2846)
- **Acceptance check:** A motif shows a list of linked scenes, each with a short meaning-at-this-point note.

---

## K. Narrative Zoom

### R-C-066 Vertical Narrative Zoom across levels, operational in Phase 2
- **Requirement:**
  - Move between levels without losing your place: novel → storyline/character arc → act → sequence → beat → scene → manuscript passage, and back.
  - Unit names follow the project's container template.
  - It works with ordinary on-screen lists, outlines and panels. Designed graphics are not required in Phase 2.
- **Why:**
  - "You called it the narrative zoom, I love it!"
  - It is "the conceptual heart of the entire program."
  - She needs "a big picture view and also intricacies view" to "stop the analysis paralysis and... ACTUALLY WRITE THE DAMN STORY!!"
- **Standing:** Decided by Yolanda (S2-003, S3-067). Accepted proposal (details).
- **Phase:** 2
- **Evolution:**
  - When she moved visuals to Phase 3, Narrative Zoom navigation was explicitly kept in Phase 2 (S6-008, S6-117).
  - Phase 3 adds visual zoom maps and zoomed exports (R-C-095).
  - The spec's level list adds "plotline/character arc" (SP-149). Check it against her intent (S8E-014).
- **Sources:** S1-173 (L3049-3095); S2-003 (L3183); S2-011; S3-066, S3-067 (L7307-7309); S6-006, S6-008, S6-117, S6-144; SP-039, SP-147, SP-149, SP-151; S8E-014
- **Acceptance check (AC13):** Zoom from novel → Act IIB → All Is Lost → its scene → its passage, then back up and out, and land on the original editing location.

### R-C-067 Breadcrumbs and context: never lose your place
- **Requirement:** Deep inside the structure, a breadcrumb always shows the position, for example "I Declare War → Act II → Sequence 4 → Scene 17", and each crumb is clickable. Saved zoom state and quick return matter more than fancy diagrams. Don't dump the whole database on screen.
- **Why:** "Zooming shouldn't mean losing context." "See everything. Focus on one thing. Lose nothing."
- **Standing:** Accepted proposal.
- **Phase:** 2
- **Evolution:** The spec keeps it (SP-150).
- **Sources:** S2-012 (L3271-3275); S3-073 (L7413); SP-150
- **Acceptance check:** At any scene the breadcrumb shows its full ancestry. Clicking "Act II" returns to the act with the scene highlighted.

### R-C-068 Horizontal (relational) zoom
- **Requirement:** Besides moving up and down levels, the author can follow relationships across the story:
  - cause and effect (incoming causes, outgoing consequences);
  - one character's decisions across scenes;
  - a relationship between two characters;
  - one storyline from introduction to resolution;
  - every appearance of an object, with every clue tied to it, every character who encounters it and its payoff;
  - a theme or value;
  - chronology.
- **Why:** "What could make Narrative Zoom genuinely different from a conventional outlining application." She wants to see "the interaction between the acts, the sequences, the setup, the midpoint."
- **Standing:** Accepted proposal (horizontal navigation, S2-014). Unanswered proposal (relational-zoom examples, S2-154). Accepted proposal (single-storyline zoom, S2-164; character zoom, S3-085).
- **Phase:** 2
- **Evolution:** The spec says "cross-links" only (SP-150). It dropped relational zoom as a named capability.
- **Sources:** S2-013, S2-014 (L3277-3285); S2-154 (L5277-5293); S2-164; S2-169; S3-085 (L7670-7692)
- **Acceptance check:** From the ledger object, "follow" lists its plant, every appearance, the characters who touch it and its payoff in story order, and each item opens in zoom.

### R-C-069 Scene-level zoom contents
- **Requirement:** At scene level, zoom shows:
  - viewpoint character, objective, opposition, inciting action, turning point;
  - initial and final values, emotional change;
  - time and location;
  - preceding cause, resulting consequence, next scene;
  - character-value changes and connections to later payoffs;
  - the expectation/result gap, with a step up to the sequence reversal and the act turning point.
- **Why:** It answers both of the Hybrid questions: "Where am I in the story?" and "How does what I'm writing here affect everything else?"
- **Standing:** Accepted proposal.
- **Phase:** 2
- **Evolution:** It is consistent with the spec's zoom walk (SP-148).
- **Sources:** S1-124, S1-173; S2-013; S3-099 (L7975-8003); SP-148
- **Acceptance check:** Opening a scene shows all listed elements that have data. Empty ones are hidden, not shown as blanks.

### R-C-070 Focus and recede
- **Requirement:**
  - Working on a sequence, unrelated material recedes.
  - Writing a scene, the author sees what it must accomplish, how she arrived and what must follow.
  - When she is ready to write, the program "gets the hell out of your way."
  - Planning panels can be hidden for drafting.
- **Why:** Visual overload makes her drift ("too much color coding... I just get distracted"). One screen cannot hold everything: it is "not too much for one program, but too much for one screen."
- **Standing:** Accepted proposal.
- **Phase:** 2
- **Evolution:** Consistent. The spec keeps progressive disclosure and focused mode (SP-114, SP-129, SP-181).
- **Sources:** S1-141 (L2401-2405); S3-065, S3-069, S3-070 (L7307-7353); S2-111
- **Acceptance check:** In sequence focus, scenes outside the sequence are collapsed or dimmed. One click hides all planning panels around the editor.

### R-C-071 Writing Trail and Return to Writing (zoom never loses the drafting thread)
- **Requirement:** The program remembers:
  - the scene she was writing;
  - what prompted her to leave;
  - which related elements she visited;
  - whether the detour issue was resolved;
  - where she intended to return.
  
  One obvious action returns her to the exact location, with cursor and scroll position where feasible. A problem noticed mid-draft can be captured and attached to the relevant scene without "spending three hours restructuring Act Two."
- **Why:** She works associatively (Scene 12 → fix Scene 7 → back). "You can acknowledge a problem without allowing it to hijack your writing session."
- **Standing:** Accepted proposal ("Yes. I AM STILL IN LOVE WITH THIS!" for Writing Trail; Return to Writing accepted).
- **Phase:** 2
- **Evolution:**
  - The Writing Trail (S2-096) was followed by Return to Writing (S3-071). Both stand.
  - The spec keeps Return to Writing (SP-083, SP-141) but never names the Writing Trail and hedges cursor and scroll with "if technically feasible" (F3).
- **Sources:** S2-096 (L4373-4399); S3-071, S3-107 (L7355-8110); S6-128, S6-142; SP-082, SP-083, SP-141; HV-046
- **Acceptance check:** Draft in scene 12, jump to scene 7 via zoom, attach a note, then press Return. The editor reopens at the same paragraph of scene 12.

### R-C-072 Bidirectional map ↔ manuscript navigation
- **Requirement:** From any structural element (for example the Midpoint), open the linked manuscript passage. From the manuscript, "Show in Story Map" highlights the scene, its sequence, its act and its relationships.
- **Why:** The map "becomes a navigable representation of the work itself."
- **Standing:** Accepted proposal.
- **Phase:** 2
- **Evolution:** The spec keeps "direct navigation from the writing surface" (SP-130). It drops "Show in Story Map."
- **Sources:** S2-120 (L4758-4780); SP-130
- **Acceptance check:** In the editor, "Show in Story Map" lands on the scene with its act and sequence expanded.

### R-C-073 Zoom follows the author's associative path, not just the tree
- **Requirement:** Zoom supports a free path of thought: a character's Ghost → a conversation scene → the sequence it belongs in → its significance for the controlling idea. The path back is recorded (R-C-071).
- **Why:** Narrative Zoom "reflects the way you think about stories" and is "not merely a hierarchical navigation control."
- **Standing:** Unanswered proposal (an alternate branch she did not answer directly). It fits her stated goals.
- **Phase:** 2
- **Evolution:** It arose when she asked whether the handoff explains "the zoom in, the different modules and why we created them" (S8E-013, decided).
- **Sources:** S8E-013, S8E-019; HV-046
- **Acceptance check:** A path that crosses from character record to scene to theme can be walked back step by step.

### R-C-074 Focused views at every zoom level are printable
- **Requirement:** Any zoom level can be exported and printed as its own map: the whole book as the master map, one act enlarged, or one sequence with each scene's goal, conflict, value change and causal links.
- **Why:** "Print the complete IDW story architecture... then separately print an enlarged map of Act Two... That would, 100% be me!!" "The smaller companion posters will be divine to have!"
- **Standing:** Decided by Yolanda (S2-144, S3-055). Accepted proposal (S2-145).
- **Phase:** 3 (Phase 2 data must support every level).
- **Evolution:** It was part of the posters (Phase 1). The rigorous engine moved to Phase 3 (S6-001).
- **Sources:** S2-144 (L5180-5252), S2-145, S2-151; S3-055 (L6870-6900, L7051)
- **Acceptance check (Phase 3):** Export the Act IIA zoom and a single sequence zoom at letter size from the same data as the master map.

---

## L. The Ripple Effect and moving story elements

### R-C-075 Move beats, scenes, events and reveals, and see what the move would affect
- **Requirement:**
  - The author can drag or move any structural element (a beat's event, a scene, an event, a reveal) to a new position.
  - The program identifies and highlights what may be affected, for example:
    - revelation timing;
    - reader knowledge;
    - characters' motivations;
    - reversals that depended on it;
    - setups and payoffs;
    - leverage used later;
    - surrounding pacing and sequence membership.
  - Each affected item can be followed through Narrative Zoom.
  - Affected items are shown as potential consequences, "not as errors necessarily."
- **Why:** "Experiment with different story structures without losing track of the consequences." This is the Ripple Effect, by name and by her own adoption.
- **Standing:** Accepted proposal. She demanded "all of those things" in Phase 2 (S6-052), and Ripple Effect is in her Phase 2 list (S3-008).
- **Phase:** 2
- **Evolution:**
  - First example: moving the pie scene from 35% to the Midpoint (S1-162).
  - Then dragging the ledger discovery (S2-015, S2-017).
  - The build's "ripple" was a breadth-first walk over links. The spec itself calls that insufficient (S6-067, SP-232). See R-C-078.
- **Sources:** S1-162, S1-163 (L2889-2919); S2-015, S2-017 (L3289-3303); S3-008; S6-006, S6-146; SP-020, SP-041, SP-152
- **Acceptance check:** Drag "ledger discovered" from 75% to 50%. The impact list includes the All Is Lost reversal, reader-knowledge points after 50%, characters' later motivations and the Finale payoff. Each opens in zoom.

### R-C-076 Preview before committing; review after; earlier version always recoverable
- **Requirement:**
  - **Before** a move or change is committed, show its predicted consequences ("What would this change?", "Where might this fit?").
  - **After** it is committed, keep an impact list for review.
  - Accepting a change shows an exact before/after preview.
  - Every change creates a reversible history entry. The earlier structure is preserved for reversal.
- **Why:** "Show the connected elements without forcing changes, and preserve the earlier version for reversal." "Nothing changes in your actual story until you decide."
- **Standing:** Accepted proposal (S1-162, S3-120). Spec-only (exact before/after preview, SP-177).
- **Phase:** 2
- **Evolution:** "Explore Without Committing" (S3-120) extended the preview to ideas not yet placed.
- **Sources:** S1-162; S3-120 (L8306-8322); S6-146; SP-155, SP-177; S5-090
- **Acceptance check:** Choose "Preview move" on a scene. The impact list appears and nothing is saved. Commit, then undo, and the structure matches the original exactly.

### R-C-077 Findings are review items, never edits
- **Requirement:**
  - Ripple and analysis findings never edit story records or prose.
  - Each finding can be accepted, rejected, deferred or resolved.
  - A finding can be answered with an authorial intent note, which is retained, informs later analysis and stops the same question recurring.
  - Model changes never rewrite manuscript text. Affected passages are identified only.
- **Why:**
  - "I like that you say that this program does not write the novel and it does not make the changes to it."
  - "The author is the main and final judge."
  - The program does not insist on a particular solution.
- **Standing:** Decided by Yolanda (S2-025). Accepted proposal (intent note S2-038; accept/reject/defer from the spec).
- **Phase:** 2
- **Evolution:** Consistent throughout. The spec keeps it (SP-155, SP-178).
- **Sources:** S2-006, S2-025 (L3337), S2-031, S2-038 (L3462-3484); S2-122; S5-087; SP-155, SP-178
- **Acceptance check:** After a ripple, the record and the prose checksums are unchanged until the author acts. Marking a finding "Intentional: false security pays off later" suppresses it on the next run and keeps the note.

### R-C-078 A real change-impact engine, not a link walk
- **Requirement:** For each affected item, explain:
  - the causal or dependency path;
  - the reason it is affected;
  - risk or severity;
  - what to review.
  
  Distinguish **direct dependencies** from **speculative connections**. Avoid huge misleading cascades. A variation in a comic detail must not trigger a "wholesale rewrite of the book." Change types covered:
  - plot facts;
  - motivations;
  - POV;
  - sequence order;
  - timeline;
  - knowledge;
  - continuity;
  - setups and payoffs;
  - manuscript passages;
  - a newly introduced fact that threatens existing scenes (for example "a recognizable TV anchor" vs "Kevin doesn't recognize his voice on the call").
- **Why:** Breadth-first neighbours are not dependency-aware ripple analysis.
- **Standing:** Spec-only for the depth requirements (SP-152 to SP-154). Accepted proposal for the dependency awareness (S1-163). Possibility for new-fact continuity alerts (S8-105, which shows ChatGPT acting as this checker four times).
- **Phase:** 2
- **Evolution:** The code's breadth-first search was listed as "Working" (S6-060). The spec overruled that claim (S6-067, SP-232).
- **Sources:** S1-163; S6-067 (L17916-17928), S6-146, S6-147; S8-036, S8-105; SP-152, SP-153, SP-154, SP-232
- **Acceptance check:** Change a comic prop in one scene. The impact list contains only direct dependents, each with a stated reason, and no transitive cascade of unrelated profiles.

### R-C-079 Midpoint trust test (data-survival gate)
- **Requirement:** The program must pass this test before it is trusted:
  1. Establish all 15 beats.
  2. Change the Midpoint.
  3. Regenerate every related view.
  4. Verify all 15 beats still exist.
  5. Confirm unrelated character information is unchanged.
  6. Verify only the appropriate causal dependencies are flagged.
  7. Reverse the change and recover the previous state exactly.
- **Why:**
  - "If the program cannot pass that kind of test, it isn't ready to be trusted."
  - Her fears, demonstrated by the posters: the Midpoint update "accidentally changes the causal chain to All Is Lost," and "updating Beat 12 should not risk deleting Beat 9."
- **Standing:** Unanswered proposal. She set the data-integrity list aside ("Ignoring all that for a moment... Let's say that the changes I make... does what is supposed to do"), taking it as the assumed baseline, and her "100% accurate" and trust demands (S3-102, S5-064, S5-068) require it.
- **Phase:** 2
- **Evolution:**
  - The spec has the midpoint revision scenario (SP-156) and AC10 but never names the test (F1).
  - It dropped step 4 (all 15 beats still exist) and step 3 (regenerate all views).
  - It softened step 7 to "stay recoverable" rather than "recover exactly."
- **Sources:** S5-085, S5-089, S5-091, S5-095 (L14640-14712); S5-099 (L14746-14748); S3-102, S3-103; SP-156, SP-221 (AC10), SP-227 (AC16)
- **Acceptance check:** An automated test performs steps 1 to 7 on a copy of the IDW project. It asserts the beat count, an unchanged checksum of unrelated records, the flagged set, and byte-identical state after undo.

### R-C-080 Stable identities and isolated edits
- **Requirement:**
  - Every character, scene, sequence, beat, question and idea has a persistent identity.
  - Updating one element never alters another unintentionally.
  - Change history shows what changed, when, why, and which elements might be affected.
  - Corrections update one element instead of rebuilding the whole artefact.
- **Why:** The posters showed corrections introducing new errors ("Fixing Beat 12... shouldn't risk changing the wording of Beat 9").
- **Standing:** Accepted proposal (failure modes, S5-069, S5-084). Unanswered proposal (mechanism list).
- **Phase:** 2
- **Evolution:** The spec keeps stable IDs and history (SP-056, SP-227).
- **Sources:** S5-069, S5-084, S5-089, S5-090, S5-091, S5-123 (L13714-14678); SP-056, SP-063
- **Acceptance check:** Edit the text of Beat 12. A diff of all other records is empty, and the history entry lists Beat 12 only.

### R-C-081 Answering a question or adopting an idea ripples too
- **Requirement:** When a linked question is answered or an idea is adopted, identify the scenes and elements it affects, using the same review flow as R-C-075 to R-C-077. An idea can be asked "Where might this fit?" (suggested sequence, scene or turning point) without placing it.
- **Why:** Ideas and decisions change the structure just as moves do.
- **Standing:** Accepted proposal ("💯").
- **Phase:** 2
- **Evolution:** The spec keeps a podcast-idea ripple scenario (SP-157).
- **Sources:** S3-117, S3-120 (L8254-8322); SP-080, SP-157
- **Acceptance check:** Answer "How do they discover the ledger?". The impact list shows All Is Lost, the plant, the reader timeline and the Finale for review.

### R-C-082 Experimenting with alternative structures
- **Requirement:**
  - The author can try an alternative structure (for example a reveal earlier, or a set piece at the Midpoint) and compare its consequences with the current one without losing either.
  - Competing possibilities coexist, and the current canon is always clear.
  - Moving a commitment's destination (such as a storyline's resolution) flags existing dependents but never calls undeveloped later material defective.
- **Why:** The stated purpose of the Ripple Effect is experimenting "without losing track of the consequences." Competing theories must coexist and be testable without deletion.
- **Standing:** Accepted proposal (purpose, S2-015). Spec-only (competing possibilities, SP-064). Unanswered proposal (commitment move, S2-188). Possibility (a structural "sandbox" or branch mechanism; Needs Yolanda Q8).
- **Phase:** 2
- **Evolution:** Never designed beyond preview and undo.
- **Sources:** S2-015; S2-188 (L6004-6016); S6-122; SP-064, SP-065
- **Acceptance check:** Create "Variant: ledger at Midpoint." The impact comparison against current canon is visible, and discarding the variant leaves canon untouched.

---

## M. Analyzers

### R-C-083 Dramatic Gap & Progressive Complications Analyzer
- **Requirement:** Per relevant scene, ten optional fields:
  1. Desire
  2. Expectation
  3. Action
  4. Opposition
  5. Actual result
  6. The gap
  7. Value change
  8. Response
  9. New choice
  10. Progressive complication
  
  Further rules:
  - Not every scene needs all ten, and a scene may contain several action-and-gap cycles.
  - It distinguishes information **explicitly established by the author**, **observed in the manuscript** and **interpretive suggestion**.
  - It investigates the gap between intention and outcome. It never manufactures unexpected outcomes to satisfy a formula: a character may get what they intended and still cause unforeseen consequences, and a quiet scene may hold a subtle shift.
  - It zooms from scene gap → sequence consequence → act reversal → overall meaning.
  - It flags where a scene's outcome doesn't convincingly create the next action.
- **Why:** It operationalizes McKee as she asked, while "the labels aren't the story. The dramatic movement is."
- **Standing:** Accepted proposal ("To all of this: YESSSSSSSSSSS!!!").
- **Phase:** 2
- **Evolution:**
  - It also appears as a companion poster ("McKee's Dramatic Engine") that was promised and never produced (S3-162).
  - The spec keeps the fields (SP-090, SP-091) and AC06. It drops the three-kinds-of-information distinction and the "don't manufacture" rule.
- **Sources:** S3-096, S3-097, S3-098, S3-099, S3-100 (L7940-8025); S4-101, S4-124, S4-128; SP-090, SP-091, SP-092, SP-217 (AC06)
- **Acceptance check:** Analyze a scene where the expected result occurs. The analyzer does not demand a reversal, and it labels each statement as established, observed or interpretive.

### R-C-084 Causal Integrity Analyzer: packaging, cadence and response options
- **Requirement:** The analyzer (R-C-056 to R-C-059) runs:
  - on request ("structural review"); or
  - per the author's **guidance setting**: Quiet (record silently; the default while drafting), Advisory (subtle notice for meaningful concerns) or Deep Analysis.
  
  Each concern offers three choices:
  - **Examine the connection** (open zoom on the scenes and dependencies);
  - **Explore possibilities** (questions that might strengthen it, with no rewrite);
  - **Find craft resources** (concept-specific, never chapter or page citations).
- **Why:** Interrupting a funny scene "every thirty seconds would be maddening." She wants no bad advice and the author kept in charge.
- **Standing:** Accepted proposal. Decided by Yolanda (no chapter or page citations, S2-049).
- **Phase:** 2
- **Evolution:** The spec dropped the three guidance settings and the three-choice pattern (S2 dropped list).
- **Sources:** S2-030, S2-037 (L3438-3460), S2-049 (L3607); S3-008
- **Acceptance check:** In Quiet mode a weak link produces no notification and appears in the next requested review with the three action buttons.

### R-C-085 Comedy escalation analysis
- **Requirement:** For comedy projects (or any project that selects it):
  - **Escalate the reaction, not the event or harm.** Track comic escalation separately from actual harm, and flag when "the damage" escalates "instead of the reaction."
  - **Every prank should also be plot.** Flag set pieces that carry no story.
  - Progressive complications for gag runs ("not the same joke louder").
  - Comic intensity as its own track (R-C-033).
  - Project rules can be stated and checked as questions (for example IDW's "nobody gets seriously hurt" and the brawl rule).
  - Tonal movement "funny, then a heartbeat later someone has genuinely been hurt" is allowed.
  - Craft resources include Kaplan, *The Hidden Tools of Comedy*.
- **Why:**
  - Fails "as a string of disconnected gags." Avoid "the trap the neighbor-war movies fall into, going louder and meaner."
  - Laugh at their foolishness, not their pain.
- **Standing:** Decided by Yolanda (Bible rules). Accepted proposal (comic vs harm escalation S1-117; comic intensity S1-153; progressive complications S3-092; genre considerations S2-052; Kaplan mapping S2-032). Possibility for a named "comedy escalation analyzer" (never named as a module; Needs Yolanda Q7).
- **Phase:** 2
- **Evolution:** Scattered across sections. The spec dropped all of it except "three pranks with unchanged dramatic value" (SP-116).
- **Sources:** S1-092, S1-104, S1-117, S1-153; SB-136, SB-138, SB-184, SB-185; S2-032 (L3385-3402), S2-052; S3-092; S4-072, S4-125; S8-060, S8-088; SP-116
- **Acceptance check:** In a comedy project, a run of three set pieces tagged with rising harm and flat reaction raises "Escalating harm rather than reaction?". A set piece with no strand link raises "Is this prank also plot?".

### R-C-086 Story diagnostics as questions, with evidence kept apart from interpretation
- **Requirement:** On request, diagnostics cover:
  - causality gaps;
  - dead-end scenes;
  - missing value turns;
  - sequence weaknesses;
  - character disappearance;
  - unresolved setups;
  - timeline contradictions;
  - knowledge inconsistencies;
  - pacing (beat far from intended placement);
  - thematic disconnects.
  
  Output separates four kinds of information:
  - observable structural facts;
  - interpretive observations;
  - craft-based suggestions;
  - educational references.
  
  Further rules:
  - Deterministic checks are kept distinct from interpretive (AI-assisted) analysis, and interpretive results always stay open to the author's judgment.
  - Diagnostics are phrased as "questions worth investigating."
  - The program can say "I don't know," for example that emotional conviction needs the drafted prose.
- **Why:** "That's how we avoid building a program that confidently gives bad writing advice." "Definitely we don't want to give any bad writing advice."
- **Standing:** Accepted proposal. Decided by Yolanda (no bad advice).
- **Phase:** 2
- **Evolution:** The spec keeps "do not treat interpretation as mathematically provable" (SP-092) and source-vs-inference labels. It drops the full list and "I don't know."
- **Sources:** S1-165, S1-166 (L2933-2969); S2-018, S2-026 (L3305-3337), S2-039, S2-044 (L3486-3577); S3-097; SP-092, SP-175
- **Acceptance check:** A review report groups findings under "Fact", "Observation", "Suggestion" and "Reference". At least one interpretive item can return "Cannot judge from the outline; needs drafted scene."

### R-C-087 Genre-aware analysis against the intended reader experience
- **Requirement:**
  - Analyzers adapt to the project's genres (primary and secondary), its Snyder story type and its narrative characteristics. Genre informs, never dictates.
  - The author can state the intended reader experience (laughter, dread, suspense, and so on). Unconventional choices are evaluated against that intent.
  - Narrative characteristics switch on relevant checks: multiple timelines → chronology checks; unreliable narrator or hidden truth → belief-vs-truth tracking; ensemble → strand views.
- **Why:** "This program won't be only for the comedy genre... We need to understand the different genres." Genre flexibility belongs in Phase 2.
- **Standing:** Decided by Yolanda (S2-048, S3-010). Accepted proposal (S2-052, S2-059, S2-080).
- **Phase:** 2
- **Evolution:** It is consistent throughout. The spec has HV-041. It drops intended-experience evaluation and characteristic-driven activation.
- **Sources:** S2-048 (L3605), S2-051, S2-052, S2-059, S2-062, S2-080 (L3617-4096); S3-010; HV-041
- **Acceptance check:** Selecting "unreliable narrator" adds belief-vs-truth fields to scenes. A mystery that reveals its culprit at the midpoint and records the intent "the question is proof" is not flagged.

### R-C-088 Preflight before any visual export
- **Requirement:** Before exporting a map or poster, check:
  - text overflow;
  - bad image crops;
  - fonts too small for the target size;
  - every beat present;
  - every arrow connected;
  - overlapping labels;
  - resolution;
  - paper-size fit;
  - whether one poster or several pages fits better.
  
  On failure, give a specific message with choices (larger format, condensed text, or multi-panel). Never export a broken file, and never claim readiness beyond what was checked.
- **Why:** "That would have saved us a lot of grief." "A story map that is correct in the database but broken in the export is still broken."
- **Standing:** Accepted proposal ("you are onto something correct"; visual engine).
- **Phase:** 3. Its "all beats present" structural check also runs in Phase 2 (R-C-013).
- **Evolution:** The poster build's overflow guard and assertions were early instances (S4-137, S5-076). The spec defers large-format preflight to Phase 3 (SP-028).
- **Sources:** S5-076, S5-081, S5-109, S5-113, S5-114 (L14933-15064); S4-137, S4-138; SP-028
- **Acceptance check (Phase 3):** Export a poster where cards 9 to 12 overflow. Export is refused with the specific beat numbers and three remedies.

### R-C-089 Baseline structural validation
- **Requirement:** Lightweight validation is always available:
  - missing or duplicate Save the Cat beats (when the lens is on);
  - a scene with no POV;
  - an established item whose source is illustrative;
  - a payoff with no plant.
  
  All are shown as notices, not blocks.
- **Why:** These are the cheapest integrity checks, already in the build.
- **Standing:** Unanswered proposal (code behaviour; the spec lists it as baseline, SP-233).
- **Phase:** 2
- **Evolution:** The spec says such fields and checks do not by themselves satisfy the analyzers (SP-232).
- **Sources:** S6-068 (L17930-17942); SP-233
- **Acceptance check:** Delete Beat 7. A notice appears, and the project still saves.

---

## N. Status layers for structural elements

### R-C-090 Function vs execution: decisions have layers
- **Requirement:**
  - A beat, scene or sequence step can have its **story function established** while its **execution** stays undecided. Example: "the men must be distracted" is established; which distraction is open, and a five-dollar bill is one candidate.
  - Each step in a sequence carries its own status (for example "function set", "execution open", "established", "outcome open").
  - Alternative executions can be compared (expectation, gap, action) without silently becoming canon.
  - A scene is never marked simply decided or undecided as a whole.
- **Why:**
  - Her correction: "the 'distracted by the five-dollar bill' is a concept for me. It may or may not be a $5 bill."
  - "A confirmed story function does not automatically confirm the specific events used to accomplish it."
- **Standing:** Decided by Yolanda (S3-146). Accepted proposal (S3-148: "I love it!").
- **Phase:** 2
- **Evolution:**
  - The Bible marked the five-dollar bill "Decided". Her 10-14 override made it a candidate (story-register conflict #1).
  - A "function set / execution open" status appeared on a poster (S4-098) but was never formally added to the status vocabulary. The spec keeps "beat function separate from event" (SP-088) but not per-step status.
- **Sources:** S3-146 (L8765), S3-147, S3-148, S3-149 (L8777-8828); S4-016, S4-040, S4-098; S6-027; SP-088, SP-089; PF-004
- **Acceptance check:** A sequence step shows "Function: established / Execution: open (candidates: five-dollar bill)". Adopting a candidate requires an explicit action.

---

## O. Visual maps and posters: what the Phase 2 data model must support

### R-C-091 One story model rendered as many views
- **Requirement:** One master story model feeds every view and export. Required views:
  - **chronological/structural map**;
  - **relationship/systems map** (causality, arcs, thematic links, strands, reveal logic);
  - **hybrid command center**;
  - act companions (I, IIA, IIB, III);
  - sequence zoom maps;
  - a character depth map;
  - the McKee dramatic engine map;
  - the scene-card board.
  
  Views regenerate from data and never by re-typing or by image generation. Content is separate from decoration ("art is layered on top of content, not fused with it"). Enter information once and use it everywhere.
- **Why:**
  - "Print Map A, Map B, or the Hybrid... all three ARE important."
  - "The author can feed in what they have and it produces the maps."
  - The posters proved image generation silently changes story facts.
- **Standing:** Decided by Yolanda (S1-004, S1-006; the visual engine as its own phase, done "correctly", S6-001). Accepted proposal (S1-127, S1-169, S5-101, S5-105, S5-107, S5-112).
- **Phase:** 2 for data. 3 for rendering.
- **Evolution:**
  - The letters A and B swapped meaning mid-conversation (S1-125; Needs Yolanda Q1).
  - The ten-poster set grew from three masters (S3-140).
  - Rendering moved to Phase 3 because "phase two should just be the story system" (S6-001).
- **Sources:** S1-004 (L2112), S1-006 (L2116), S1-122 to S1-127, S1-134, S1-169; S3-140; S5-101, S5-105, S5-107, S5-112; S6-001 (L15064-15070), S6-022
- **Acceptance check:** Changing one beat's function text updates every view and export that shows it, with no other edit.

### R-C-092 Element typing and layering that maps need
- **Requirement:** Each element stores what a map needs to draw it:
  - visible-story vs hidden-story layer;
  - storyline membership (any number of lanes);
  - relationship type (conflict/opposition, hidden causation, causal sequence, emotional change, reveal/payoff, thematic link);
  - turning-point flag;
  - set-piece flag;
  - setup/payoff links;
  - reader-knowledge points;
  - framework intersections at each turn;
  - the act/sequence boundaries.
  
  Maps must show relationships, not elements "in separate boxes."
- **Why:** "That's what makes it a story map rather than an elaborate outline." Above the timeline sits the visible story and below it the hidden story. The poster layers are spine, A, B, arcs, theme, turning points, set pieces, setup/payoff, reader knowledge and resolution.
- **Standing:** Accepted proposal (S1-110, S1-112, S1-113, S1-114). Possibility (the relationship legend S3-022 as a convention).
- **Phase:** 2 for data. 3 for rendering.
- **Evolution:**
  - ChatGPT's poster scope went beyond her "just the plot, theme, structure, A/B" (S1-002) and she accepted it in general terms (S1 U6).
  - The legend came from AI posters, not from her.
- **Sources:** S1-002, S1-109, S1-110, S1-112, S1-113, S1-114 (L1882-1982); S3-022; S4-094; S5-104
- **Acceptance check:** A query returns, for any event, its layer, strands, relation types and turning-point flag. These are enough to place it on a two-layer timeline.

### R-C-093 Status, uncertainty and progress are data that maps can draw
- **Requirement:** Every drawable element exposes:
  - its decision status (established, developing, unanswered, illustrative; function vs execution);
  - its placement certainty (placed, candidate, unplaced);
  - its drafting progress (idea, planned, drafted, revising).
  
  Maps must never present a possibility as committed. Unplaced events go to an "unplaced" area, never to an implied position. Progress indicators can be toggled for print. One legend applies to every map so it is learned once.
- **Why:**
  - "We should never present an illustrative possibility as though you've already committed to it."
  - Placement "visually implies a timing decision."
- **Standing:** Accepted proposal (S1-116, S1-177, S2-095). Unanswered proposal (unplaced area, S2-184).
- **Phase:** 2 for data. 3 for rendering.
- **Evolution:**
  - Solid vs dotted outlines (S1-116), then a three-label legend on the vector drafts.
  - That legend collapsed her four statuses into three (S4-032, a distortion).
- **Sources:** S1-116, S1-177 (L1992-2008, L3145-3165); S2-095 (L4347-4371), S2-183, S2-184 (L5889-5923); S4-032; S6-031
- **Acceptance check:** An event with no placement never has an x-position in map data. Each element's status and progress are present in the export data.

### R-C-094 Colour carries meaning only
- **Requirement:** Strand colours (cards coloured by strand, one lane per storyline) and status colours are meaningful and configurable. Decoration-only colour is avoided, and the amount of colour is under the author's control.
- **Why:** "Too much color coding because eventually I just get distracted and go on to something else." "Color should communicate something specific, not merely decorate."
- **Standing:** Decided by Yolanda (S3-065; Bible strand colours). Accepted proposal (S3-069).
- **Phase:** 2 (board, lists). 3 (maps).
- **Evolution:** Her Bible colours by strand. Her own complaint limits how much colour is used. Both apply.
- **Sources:** SB-169; S3-065, S3-069 (L7307-7341); S6-031
- **Acceptance check:** Colour coding can be switched to "strand only" or "off". Every colour on screen appears in a visible legend.

### R-C-095 Print formats, modes and per-view provenance
- **Requirement:**
  - **Sizes**: 48 × 36 in and 60 × 45 in wall posters; a letter-size desk reference that is reflowed, not shrunk (it may span pages).
  - **Modes**: wall poster, desk reference, act zoom, sequence map, writer focus (minimal decoration), presentation.
  - Layout reflows (expand, split, continuation panels, summary vs detailed) instead of cropping.
  - Each export carries its provenance: data version or date, and which sources and clarifications it reflects.
- **Why:** "Safely print at either 48 × 36 inches and 60 × 45 inches." "An extra large wall poster and/or a normal document on my printer." "One layout cannot do everything."
- **Standing:** Decided by Yolanda (sizes, home printing: S3-052, S4-001). Accepted proposal (modes and reflow S5-106, S5-108; desk reflow S4-020). Unanswered proposal (provenance footer S4-037, S5-124).
- **Phase:** 3 (Phase 2 needs only version stamps on data).
- **Evolution:** Desk orientation was inconsistent: 11 × 8.5 landscape in the data file, 8.5 × 11 elsewhere (S4-039). It is open.
- **Sources:** S3-052 (L6898); S4-001 (L9086), S4-019, S4-020, S4-037; S5-106, S5-108, S5-124; PF-008
- **Acceptance check (Phase 3):** Export one map at 48 × 36, 60 × 45 and letter. The letter version is multi-page and reflowed, and all three show the same data version.

### R-C-096 Sequence detail view in her spreadsheet-like format
- **Requirement:** A sequence view (on screen in Phase 2, printable in Phase 3) shows:
  - sequence purpose or objective;
  - each scene's Goal / Conflict / Reaction / Dilemma / Decision;
  - the causal chain;
  - a value-change table (each value, before → after);
  - character pressure (what each character feels and how it drives them; what each believes vs what is actually happening);
  - Setup → Payoff → What Next;
  - how the sequence advances each storyline and the controlling idea.
- **Why:** "Omg!! This is nearly exactly how I manually plot my stories in a spreadsheet."
- **Standing:** Decided by Yolanda (it matches her method, S3-061). Accepted proposal (format S3-058). Unanswered proposal (contents list S2-152).
- **Phase:** 2 (on-screen). 3 (print).
- **Evolution:**
  - The first sequence map had the wrong story facts (the wrong person did the act) and was corrected.
  - The revised map renamed Dilemma/Decision to Complication/Turning Point (a distortion).
  - She offered to share a plotting spreadsheet. Import of her spreadsheet format is an unanswered proposal (S3-063).
- **Sources:** S2-152 (L5266-5273); S3-058, S3-061, S3-062, S3-063 (L7199-7285); S3-154
- **Acceptance check:** The sequence view for a five-scene sequence shows all seven blocks, each filled only from stored data.

### R-C-097 Import of her BS2 beat-sheet spreadsheets
- **Requirement:** Import her Save the Cat breakdown workbooks:
  - parse numeric cells and text ranges (for example "1,200 - 10,800", "Goes at around word count 5,400");
  - strip invisible characters in beat names;
  - map "Set-up" to Setup and keep her group bands and sub-beats;
  - flag the known typo (XL-B F13 "24,600" should be 24,500 at 250 wpp) for confirmation, not silent correction;
  - keep film examples as Illustrative notes.
- **Why:** "Don't ask her to abandon her spreadsheet-based process; study it and build upon what already works."
- **Standing:** Unanswered proposal (S3-063, S3-064). Her sheets are Decided as her conventions.
- **Phase:** 2
- **Evolution:** Not in the spec. The spec's import covers DOCX, text and structured formats only (SP-191).
- **Sources:** S3-062, S3-063, S3-064; XL-003, XL-007, XL-018, XL-035, XL-037, XL-044; SP-191
- **Acceptance check:** Importing XL-A yields 15 beats plus the Stasis = Death sub-beat, three groups and scene types. Importing XL-B raises one flagged value at F13.

---

## Needs Yolanda

1. **Map letters.** Which view is "Map A" and which is "Map B"? At first Option A was the relationship map and Option B the chronological board. Later A was chronological and B relational. You said "print A or B or Hybrid." (R-C-091; S1-125)
2. **Default placement profile and the B Story rule.** Should new novels default to Brody's novel percentages (your XL-A and Bible) or to Snyder's screenplay-proportional pages (your XL-B)? XL-B puts B Story at about 27%. Does your "first 25%" rule hold, and is XL-B a deliberate alternative or an older experiment? (R-C-008, R-C-009)
3. **Break into Three's world.** Is Break into Three part of Synthesis (XL-A) or the end of Antithesis (XL-B)? (R-C-015)
4. **Two "beats".** What should the program call McKee's action/reaction unit inside a scene, so it is never confused with your 15 Save the Cat beats? (R-C-002)
5. **"Every scene must turn."** Your card rule says start and end values must be opposites. ChatGPT added degree changes (positive to more positive). Should the program ask "Does this scene turn?" only when there is no change at all, or also when the change is only one of degree? (R-C-005, R-C-028)
6. **POV unit and strength.** For IDW, is the hard rule one narrator per **scene**, or per **scene or chapter**? Can a chapter switch heads at a scene break? Should the program enforce the rule or only flag? (R-C-043; spec SP-119 vs AC07)
7. **Comedy escalation analyzer.** Do you want "escalate the reaction, not the harm," "every prank is also plot," and gag-run progression gathered into one named analyzer for comedy projects? (R-C-085)
8. **Structural experiments.** When you try an alternative structure (for example the ledger at the Midpoint), do you want a saved side-by-side variant you can keep and compare, or is preview-then-undo enough? (R-C-082)
9. **Placement precision.** You said you skimmed the series-placement ideas. Do you want placement states (Unknown, Undecided, Tentative, Confirmed, Drafted, Intentionally unspecified), outcome anchors and narrative commitments in Phase 2? If so, are placement states separate from decision statuses (Established, Developing, and so on)? (R-C-012, R-C-039)
10. **Theme as a board colour.** Your Bible colours cards by "Kevin, Anthony, Francine, theme," but also says values are cargo and never threads. Should "theme" stay a card colour lane? (R-C-035, R-C-094)
11. **Storyline states in a single novel.** Should subplots in a standalone novel carry lifecycle states (Dormant, Reopened, Intentionally unresolved, and so on) in Phase 2, or is that only for series later? (R-C-038)
12. **What "250 and 300" means.** In conversation you meant a 250-page vs a 300-page novel. Your 2021 sheet means 250 vs 300 **words per page**. Should the program show both kinds of comparison, and which by default? (R-C-007)
13. **Era and season.** Your Bible lists the era as open, and the poster file swapped it for "season." Confirm both fields are wanted, plus duration. (R-C-046)
14. **Midpoint trust test.** Should the seven-step data-survival test be a formal release gate for the program? (R-C-079)
15. **Ledger tracker row.** One plant-tracker row in Bible v5 says the journal is found "in the finale." Every Decided section says it is discovered at All Is Lost and wielded in the Finale. Confirm the row is superseded. (R-C-062)
16. **Dramatic irony vs withheld POV.** The fish-guts notes say "the reader saw Francine," while how much the reader sees her is "still open" and her POV is withheld. Should the program treat "reader witnesses her act from outside" as allowed under the withheld-POV rule? (R-C-044, R-C-060)
17. **Phase numbering.** You decided the visual engine comes in a later, separate phase "done correctly", and you called Story Universe the third iteration. The numbers "Phase 3 = visual engine, Phase 4 = Story Universe" come from ChatGPT's reply (T L15127-15144), and the spec puts both in Phase 3. Do you accept ChatGPT's numbering, and which comes first? (R-C-040)

## Conflicts between her words and ChatGPT's documents

| # | Her words | ChatGPT document | Handling here |
|---|---|---|---|
| 1 | Page estimates "say if you were writing a 250-page novel versus a 300-page novel **for example**" (S1-005). Her sheets also use 250/300 words per page (XL). | Tables, posters, the two-timeline proposal and the poster data hard-code exactly 250 and 300 pages (S1-131, S1-148, S4-086, S6-039). | Any length, both densities (R-C-007). |
| 2 | Bible: "one point of view per scene or chapter, **held without exception**." Change heads "never inside a scene" (SB-198, SB-199). | Spec: IDW single narrator "**may be** a hard integrity rule" (SP-119). AC07 says "enforce" and per scene. The appendix says "per scene/chapter" (F6). | Her rule kept. Unit flagged (R-C-043; Q6). |
| 3 | "No author should be tied or forced" (S2-065). Frameworks are lenses. | ChatGPT's master schema hard-codes "3 acts, 15 beats" (S1-136). | 15 beats are a default lens only (R-C-013, R-C-026). |
| 4 | "We cannot limit the author to just A and B" (S2-158). | Spec scope says "A/B plots and emotional arcs" (SP-035) and names no unlimited storylines. The sequence map assumed A/B (S2-152). | Unlimited storylines (R-C-036). |
| 5 | Phase 2 must include different genres and workflows (S3-010). | ChatGPT's 11:48 list put them in Phase 3 (S3-009). | Hers replaces it (R-C-026). |
| 6 | The visual engine is "a different phase", integrated "further down the line … but we do it correctly". Story Universe was the third iteration (S3-001, S6-001). | ChatGPT numbered the visual engine Phase 3 and Story Universe Phase 4 in one reply (S6-004); neither number was confirmed by her. The spec defers Story Universe together with the visual engine to Phase 3 (SP-028, F5). | Marked Later, with a question (Q17). |
| 7 | Bible Debate is Kevin's **hesitation** before he talks himself into war (SB-120). | Poster foundation Debate: "Tension, suspicion, **retaliation**" (PF-030). | Bible governs. The poster wording is not canon. |
| 8 | Bible Break into Two plan is hedged ("maybe literally, maybe by an escalation"). Kevin declares war (SB-123). | Poster foundation marks "Kevin commits..." as "Story function established" (PF-031). Later posters say "the two men commit" (S5-078). | Function vs execution kept separate (R-C-090). Wording unresolved. |
| 9 | Her four-way distinction (decided / exploring / open question / illustrative example), plus her own "Questions I Have" vs "Things & Ideas I'm Thinking About" (S4-014, S4-033). | Vector poster legend collapses this to three labels, merging Developing and Unanswered (S4-032). | Status data keeps four plus function/execution (R-C-090, R-C-093). |
| 10 | Bible ledger: discovery at All Is Lost is a gut-punch, and the win is wielding it in the Finale ("finding is not winning"). | AI posters said "how/when the truth is revealed" is open, removed the ledger from All Is Lost, or made the ledger "used in confessions" and as a community good deed (S3-155, S3-156, S3-157, S3-159). | Bible and archives govern (R-C-023, R-C-062). |
| 11 | Swain scene/sequel rows: Goal, Conflict, Disaster; Reaction, Dilemma, Decision (SB-173, SB-174). | Revised sequence poster renamed them Goal / Conflict / Reaction / **Complication / Turning Point** (S3-154). The spec never names Swain. | Her terms kept (R-C-034, R-C-096). |
| 12 | Midpoint trust test logic: all 15 beats still exist; recover exactly (S5-095, accepted as baseline). | Spec midpoint scenario: "stay recoverable"; no all-beats check (SP-156, AC10). | Full seven steps (R-C-079). |
| 13 | The ripple must truly understand dependencies (S1-163, S2-015). | The build's capability table claimed "linked-element impact identification: Working" for a link walk (S6-060). | The spec itself overrules the claim (R-C-078). |

## Things ChatGPT's spec dropped (this theme)

None of these omissions cancels the requirement.

**Her spreadsheet conventions**
- Thesis/Antithesis/Synthesis worlds and their definitions, with configurable membership (R-C-015).
- The Stasis = Death sub-beat and sub-beats generally (Finale's five steps, Key Event) (R-C-016).
- Scene Type per beat (R-C-017).
- Tolerance windows ("first 25%", "10% or earlier") (R-C-009).
- Point vs span beats and span start anchors (R-C-009).
- Two placement profiles (R-C-008).
- Words-per-page densities and computed landmarks for any length (R-C-007).
- Spreadsheet import (R-C-097).

**Her board and Bible structure tools**
- Four-row scene-card board with strand colour and build order (R-C-004).
- +/- and >< card symbols and the "rebuild or cut" rule (R-C-005).
- The single-beat "When I'm Stuck" focus (R-C-006).
- WANT at BI2, NEED at BI3, the Midpoint polarity checkbox, Final Image changed/rejects change, Home/Work/Play, and the Debate question (R-C-018).
- The Midpoint/All Is Lost opposite-polarity rule and the Opening/Final Image mirror (R-C-019).
- Beat tests (R-C-020).
- Editable logline template (R-C-021).
- Teach / Show / Hand-off beat fields (R-C-014).

**Craft lenses**
- Ingermanson's three disasters.
- "A disaster is not a win."
- Discovery vs win as event types (R-C-023).
- The Moral Premise scene test (R-C-025).
- Swain by name and the scene/sequel alternation diagnostic (R-C-034).
- Truby and Kaplan in resource mapping (R-C-085). Brody survives.
- Apparent vs actual value shift (R-C-028).
- Character-gap vs story-gap distinction and gap at five levels (R-C-030).
- Tension and comic intensity tracks (R-C-033).
- Per-character three-level antagonism was dropped from ChatGPT's schema (D4). The spec restored it.

**Storylines**
- Unlimited storylines with identity separate from letter (R-C-036).
- Weave and touch-points, and resolve-now vs held-open (R-C-037).
- Lifecycle states (R-C-038).
- Obligations, commitments and outcome anchors (R-C-039).

**POV**
- Three-level POV (R-C-041).
- Full POV attribute set: distance, tense, reliability, function, transition tracker (R-C-042).
- POV coverage map (R-C-045).
- The strength of the one-narrator rule was weakened to "may be" (R-C-043).

**Time and setting**
- Three times per event (R-C-050).
- Elapsed time and the day counter on the storyworld timeline (R-C-049).
- Season, time of day, weather, atmosphere and environmental consequences (R-C-051).
- Story duration and era/season (R-C-046).
- Location sub-spaces and sightline plausibility (R-C-047).
- The two meanings of "set pieces" (R-C-046, R-C-048).
- Past / present / in-story time on character facts (R-C-052).

**Causality and knowledge**
- Missing vs unconvincing links (R-C-056).
- Downstream dependence on an unsupported assumption (R-C-057).
- The removal / load-bearing test, the three evaluation dimensions and the ban on a single score (R-C-058).
- "Unplanned material is not a plot hole" (R-C-059).
- Branching and converging causality, and the relationship-type distinctions (R-C-054).
- Character **belief** as distinct from knowledge (R-C-060).
- Her Secret Operations Log columns (R-C-061).
- Unpaid Promises and the two-way plant/payoff completeness check (R-C-062).
- The deterministic knowledge-timing check (R-C-063).
- Motifs as tracked entities (R-C-065).

**Narrative Zoom**
- Horizontal/relational zoom as a named capability (R-C-068).
- The Writing Trail by name (R-C-071).
- "Show in Story Map" (R-C-072).
- Zoom following an associative path (R-C-073).
- Cursor and scroll return hedged to "if feasible" (R-C-071).

**Ripple and moving**
- Drag-to-move as the trigger (R-C-075).
- Experimenting with alternative structures (R-C-082).
- Midpoint trust test steps "all 15 beats still exist" and "regenerate every view" (R-C-079).

**Analyzer behaviour**
- Quiet / Advisory / Deep Analysis guidance settings (R-C-084).
- The three-choice response to a concern (R-C-084).
- Authorial intent notes (R-C-077).
- "I don't know" (R-C-086).
- The four-kinds-of-information output (R-C-086).
- The analyzer's "don't manufacture outcomes" rule and the established / observed / interpretive split (R-C-083).
- Intended-reader-experience evaluation and narrative-characteristic activation (R-C-087).
- The comedy escalation rules (R-C-085).

**Map data**
- Unplaced-events area and percentage reference units (R-C-010, R-C-093).
- Visible/hidden layer and relation typing for maps (R-C-092).
- Planned vs written placement (R-C-011).
