# Requirements Register: Section 1 (file lines 1 to 3176)

Source file: `/root/.claude/uploads/74daabb6-71d7-5b82-b6b8-3eee2147b1d0/90955321-Story_Map_Planning_FULL_with_code.md`
Range covered: lines 1 to 3176 (2026-10-14, 09:34 ET to 10:14 ET). I read lines 3177 to 3200 for context only. That is Yolanda's 10:35 reply, which bears on the standing of the 10:14 proposals.

## How to read this section

- **Lines 1 to 1864** hold the parsed text of the attached **I Declare War Story Bible v5 (10-13-26)**. Yolanda wrote it, and it is her "single source of truth" for IDW.
  - Bible passages marked "Decided." are recorded as DECIDED BY YOLANDA (bible).
  - Passages marked "One way I could play it, not a decision yet" are recorded as EXAMPLE / ILLUSTRATION.
  - Passages marked "Still open" are recorded as POSSIBILITY (open).
  - Bible teaching text, the craft principles she adopted for her own book, is recorded as DECIDED BY YOLANDA (bible teaching). It describes how her story and her craft frameworks must work, so it tells us how the program must behave.
- The parse stops at bible page 50 of 57. Parts Seven to Nine are referenced but never shown in this transcript: Part Nine "Francine's Ledger", the plant-and-payoff tracker, and the reader-knowledge timeline (bible L1847 to L2058, cited by ChatGPT at file line 2262). Other agents or the bible itself must supply them.
- **Lines 1866 onward** are the live conversation.
  - Yolanda's turns: 09:34, 09:58, 10:14 (and 10:35, just past range).
  - ChatGPT's turns: 09:34, 09:58, 10:14.
- The program is general-purpose. IDW is the first test case.

---

## A. Origin request and Yolanda's direct statements

**S1-001**
- Type: Scenario
- Statement: Yolanda wants a visualization of the whole I Declare War story so she can "see it as a whole", then turn it into a poster for her wall. She will "probably make it a giant poster, so every structure, every plot point, every pertinent part is mentioned on that poster."
- Why: She needs to see the overall story at once. Physical wall display is part of how she works.
- Standing: DECIDED BY YOLANDA ("I will probably make it a giant poster")
- Source: L8, 10-14 09:34
- Relationship: none (originating item)

**S1-002**
- Type: Constraint
- Statement: The poster is NOT the whole story bible turned into a poster. It covers "just the plot, the theme, the structure, the A/B story, those kinds of things." Character profiles, lessons and similar material stay out.
- Why: The poster's job is structure, not the full reference.
- Standing: DECIDED BY YOLANDA ("I am not asking you to turn this entire story bible into the poster")
- Source: L9, 09:34
- Relationship: ADDS TO S1-001

**S1-003**
- Type: Process
- Statement: Talk it through before creating anything ("Before you start creating it let's talk about it. Let me know if you understand what I mean.").
- Why: She wants understanding confirmed before production. This is a work habit: discuss first, build second.
- Standing: DECIDED BY YOLANDA
- Source: L9, 09:34
- Relationship: none

**S1-004**
- Type: Feature
- Statement: Being able to print Map A, Map B, or the Hybrid. When she stands in front of the poster, "all three ARE important."
- Why: "would be excellent and helpful to my brain". Different views help on different days.
- Standing: DECIDED BY YOLANDA
- Source: L2112, 09:58
- Relationship: ADDS TO S1-122 and S1-123. UNCLEAR as to which letter means which; see S1-125.

**S1-005**
- Type: Feature
- Statement: The board and beat percentages must also show the **approximate page number** where things should fall, "say if you were writing a 250-page novel versus a 300-page novel for example."
- Why: Percentages alone are less practical while drafting. 250 and 300 are her examples of target lengths, not the only allowed lengths.
- Standing: DECIDED BY YOLANDA
- Source: L2114, 09:58
- Relationship: ADDS TO S1-074. ChatGPT later hard-coded 250 and 300; see S1-131.

**S1-006**
- Type: Principle / Feature
- Statement: Turn the whole thing into "some type of program that makes the story map for any novel. The author can feed in what they have and it produces the maps: either A, B, or hybrid."
- Why: She wants a general tool, not a one-off poster. This is the origin of the general-purpose program.
- Standing: DECIDED BY YOLANDA ("eventually")
- Source: L2116, 09:58
- Relationship: ADDS TO S1-004

**S1-007**
- Type: Behavior
- Statement: "Feed in what they have": the author supplies whatever material exists, partial or complete, and the program produces maps from it.
- Why: Implies working from incomplete input.
- Standing: DECIDED BY YOLANDA
- Source: L2116, 09:58
- Relationship: ADDS TO S1-006. Later echoed in S1-171 (Progressive complexity).

**S1-008**
- Type: Process
- Statement: She agreed with ChatGPT's 09:58 plan in full ("I agree with everything you said"). That plan covers:
  - one story data model;
  - A, B and Hybrid outputs;
  - page estimates;
  - a master schema before artwork;
  - the input and output list.
- Why: Endorsement.
- Standing: DECIDED BY YOLANDA ("I agree with everything you said")
- Source: L2383, 10:14
- Relationship: Converts S1-126 to S1-140 into ACCEPTED PROPOSALS

**S1-009**
- Type: Feature
- Statement: Track **scene value change**, positive to negative or vice versa, "a la Robert McKee".
- Why: "not only knowing the story value is important, but knowing the individual scene value is important."
- Standing: DECIDED BY YOLANDA
- Source: L2383, 10:14
- Relationship: ADDS TO S1-084 (bible +/- symbol) and S1-138 (Theme Layer)

**S1-010**
- Type: Data model
- Statement: Track the hierarchy in which scenes make up a sequence and sequences make up an act ("or something like that"; she recalls McKee and possibly Weiland). Track how the units relate in her story.
- Why: She wants structure tracked at every level, not only at the beat level.
- Standing: DECIDED BY YOLANDA
- Source: L2383, 10:14
- Relationship: ADDS TO S1-136 (Structural Spine)

**S1-011**
- Type: Data model
- Statement: Each unit is "seen as its own goal". Each scene, sequence and act has its own objective.
- Why: Each unit must do work.
- Standing: DECIDED BY YOLANDA ("as seen as its own goal")
- Source: L2383, 10:14
- Relationship: ADDS TO S1-010

**S1-012**
- Type: Feature
- Statement: Track the cause and effect between scenes ("there's a cause-and-effect between scenes").
- Why: Scenes cause one another. This is the story's engine.
- Standing: DECIDED BY YOLANDA
- Source: L2383, 10:14
- Relationship: ADDS TO S1-117 (ChatGPT's causality emphasis)

**S1-013**
- Type: Data model
- Statement: Define the **time** of the story: "what's the season? What's the year? What's the atmosphere now."
- Why: The story world must be specified.
- Standing: DECIDED BY YOLANDA
- Source: L2385, 10:14
- Relationship: ADDS TO S1-107 (bible open item: era)

**S1-014**
- Type: Data model
- Statement: Define the **space**: the location and "all the different set pieces like each person's house or the neighborhood or where they go."
- Why: The setting must be defined.
- Note: here "set pieces" means physical settings or locations. It is a DIFFERENT SUBJECT FROM the comedic set pieces (S1-089 onward).
- Standing: DECIDED BY YOLANDA
- Source: L2385, 10:14
- Relationship: DIFFERENT SUBJECT FROM S1-089 to S1-096

**S1-015**
- Type: Data model
- Statement: Define **story duration**: "is it over a single week? A whole year? A single season, multiple weeks, et cetera."
- Why: How long the story lasts shapes the timeline.
- Standing: DECIDED BY YOLANDA
- Source: L2385, 10:14
- Relationship: ADDS TO S1-013

**S1-016**
- Type: Feature / Principle
- Statement: The eventual program must be **editable**: "If someone thinks of something that they had not defined yet, they can add it."
- Why: Ideas arrive late. The model must accept new categories and new items at any time.
- Standing: DECIDED BY YOLANDA
- Source: L2387, 10:14
- Relationship: ADDS TO S1-006

**S1-017**
- Type: Process
- Statement: She asks "what else do you think would be helpful?" She invites ChatGPT to propose further features.
- Why: Collaborative brainstorming.
- Standing: DECIDED BY YOLANDA
- Source: L2389, 10:14
- Relationship: none

**S1-018**
- Type: Constraint (concern)
- Statement: Concern: "Perhaps this is too much to expect one program to do, though. What do you think?"
- Why: She worries about scope.
- Standing: POSSIBILITY (a concern, answered at S1-141 and S1-167)
- Source: L2391, 10:14
- Relationship: none

**S1-019**
- Type: Process (context, just past range)
- Statement: At 10:35 she says "I am in love with everything you said! You understand what I shared completely." She restates the causal concern: if scene 2 is weak it "cannot logically create the next chain reaction", and "the program needs to be smart enough to see that and identify that and bring it to the author." She says "I love it!" to narrative zoom.
- Why: This makes the 10:14 proposals ACCEPTED.
- Standing: DECIDED BY YOLANDA
- Source: L3179 to L3183, 10:35 (just past END; included for standing only)
- Relationship: Converts S1-141 to S1-178 to ACCEPTED

---

## B. Story Bible: how Yolanda works and how the bible is built (program-relevant principles)

**S1-020**
- Type: Principle
- Statement: The bible is "the single source of truth for the story: who these people are, what it means, how it is built, and what happens."
- Why: One authoritative place.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L22 to L23
- Relationship: Foreshadows "enter information once" (S1-169)

**S1-021**
- Type: Process
- Statement: Read the bible once to put the whole story in one place. Keep it open beside her while drafting. Come back to whatever she is working on that day.
- Why: It is a daily drafting companion.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L27 to L28
- Relationship: none

**S1-022**
- Type: Principle
- Statement: The bible is separate from the workbook "Writing Funny". The workbook teaches universal comedy craft; the bible teaches that craft applied to this one story ("Same teacher's heart, different altitude").
- Why: Universal tool versus tool in hand. This parallels the general program versus project data.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L30 to L33
- Relationship: none

**S1-023**
- Type: Principle / UI-UX
- Statement: Every section follows a three-part rhythm:
  - **Teach it**: what the element is, what job it does, what the frameworks say.
  - **Show it**: an example, always clearly marked as a demonstration and never a decision, often in more than one flavor.
  - **Hand it to me**: a prompt that returns the work to her, with undecided items flagged as hers to settle.
- Why: "This is my story. The writing is the part I keep." Examples "open the door; it does not walk through it for me."
- Standing: DECIDED BY YOLANDA (bible)
- Source: L35 to L44
- Relationship: Basis for the status distinction in S1-116 and S1-164

**S1-024**
- Type: Principle
- Statement: Examples must never be treated as decisions. She wants more than one example flavor so she "never feel[s] there is one right answer to match."
- Why: It protects her ownership and keeps her from anchoring on a single example.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L39 to L42
- Relationship: ADDS TO S1-023

**S1-025**
- Type: Principle (work habit)
- Statement: "I hold a great deal at once, and that is a strength, but it can spill into overwhelm and the freeze that comes with it." The bible is "an anchor against that": once everything is on the page she can stop carrying it in her head. On a frozen day she should "not have to decide anything at all."
- Why: The core purpose of the system is to offload cognitive load.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L45 to L51
- Relationship: Echoed by ChatGPT in S1-170 and S1-178

**S1-026**
- Type: Principle
- Statement: Motto: "Brave, tiny, consistent. That is the whole system."
- Why: Small daily progress.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L50 to L51
- Relationship: none

**S1-027**
- Type: Process / Feature
- Statement: "When I'm Stuck, Start Here" is a paralysis-breaker sequence. Do these in order and stop when one catches:
  1. Open the beat sheet to the single beat she is on and read only that beat, not the others.
  2. Read the example for that beat.
  3. Write one sentence of what happens at that beat.
  4. If that is too much, fill one blank line on a character sheet for Kevin, Anthony or Francine.
  5. Write one line of Kevin's voice complaining about anything.
- Why: "Break the freeze with the smallest possible true step. Momentum is the cure." Confidence follows action.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L36 to L58
- Relationship: Program implication: it should support a single-beat focus view that hides the others.

**S1-028**
- Type: Behavior
- Statement: "Read only that beat. Do not look at the others." She needs a focused view with the others hidden.
- Why: Too much at once triggers overwhelm.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L44 to L45
- Relationship: ADDS TO S1-027. POSSIBLY TENSION with the giant all-in-one poster; both remain alive (poster for overview, focus view for stuck days).

**S1-029**
- Type: Principle (craft frameworks)
- Statement: She writes with four master lenses that are "four views of the same underlying thing, a person under rising pressure forced to change":
  - **Snyder (Save the Cat)**, the spine: 15 beats plus the board. For a novel she uses Jessica Brody's percentage adaptation.
  - **McKee (Story)**, the depth: controlling idea, gap between expectation and result, forces of antagonism (strength, not villainy), value scale.
  - **Weiland**, the arc: Lie, Ghost, Want versus Need, and three arc types (Positive Change, Flat, Negative).
  - **Ingermanson (Snowflake)**, the build and interior: ten steps, Values ("Nothing is more important than"), Ambition, Goal, and the Swain scene engine (Proactive: Goal, Conflict, Disaster; Reactive/Sequel: Reaction, Dilemma, Decision, looping).
- Why: She always knows which tool she is holding.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L61 to L91
- Relationship: none

**S1-030**
- Type: Principle
- Statement: Underneath all four lenses sits the **Moral Premise** (Stanley Williams, building on Lajos Egri). It is the same as McKee's controlling idea and Weiland's Lie versus Truth, and it is "the spine that ties every lens together."
- Why: It unifies the frameworks.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L92 to L95
- Relationship: ADDS TO S1-029

**S1-031**
- Type: Principle / Feature
- Statement: The frameworks map to one another, so the beat sheet "speaks all four languages at once." Crossing the First Threshold = Break into Two = First Plot Point = Point of No Return. Call to Adventure = Inciting Incident = Catalyst. "I am not juggling four systems. I am using one, seen from four angles."
- Why: It liberates her from juggling systems. Her own wall charts prove the mapping.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L97 to L104
- Relationship: Basis for S1-113 (show intersections on the poster)

**S1-032**
- Type: UI-UX (her physical tools)
- Statement: Her Save the Cat board on the wall already prints the Want and Need lines and the Home, Work and Play arenas.
- Why: Her existing physical tool is a model for the program's output.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L101 to L103
- Relationship: ADDS TO S1-031

**S1-033**
- Type: Process (Snowflake shape)
- Statement: The bible grows from one sentence outward (Snowflake), "We start at the smallest, truest description and expand."
- Why: Progressive expansion.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L112 to L115
- Relationship: Supports S1-171 (Progressive complexity)

**S1-034**
- Type: Feature (craft element)
- Statement: **Logline**: one sentence of under about 25 words. Snyder's four elements: irony, compelling mental picture, audience and cost (for a novel, audience and tone), and killer title. It is a diagnostic, not decoration: "if I cannot state the irony in one sentence... the story is not clear yet." Build it first.
- Why: It proves the story has a spine and is cheap to fix early.
- Standing: DECIDED BY YOLANDA (bible teaching)
- Source: L117 to L136
- Relationship: none

**S1-035**
- Type: Feature
- Statement: Her board's logline template, which she "reserve[s] the right to modify": "On the verge of [stasis equals death], a [flawed protagonist] breaks into two, but when [the midpoint happens], he or she must learn [the theme] before [all is lost]."
- Why: Templates must be modifiable by her.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L138 to L141
- Relationship: Program implication: user-editable templates

**S1-036**
- Type: Story fact (IDW)
- Statement: Example loglines (not decisions):
  - "Two feuding neighbors wage an escalating prank war over their driveways, never suspecting that the quiet old woman across the street started all of it, and is winning."
  - A board-template version: "On the verge of another invisible year, a paranoid man declares war..."
- Why: Shows the shape.
- Standing: EXAMPLE / ILLUSTRATION
- Source: L143 to L156
- Relationship: none

**S1-037**
- Type: Story fact (IDW)
- Statement: Title **I Declare War**. It also evokes the children's card game where players flip cards until someone declares war. The title "names both the neighbor feud and the childhood card game."
- Why: Double duty.
- Standing: DECIDED BY YOLANDA (bible "Decided.")
- Source: L166 to L167, L1829 to L1830
- Relationship: none

**S1-038**
- Type: Feature (craft element)
- Statement: **One Paragraph / Three-Act Spine** (Ingermanson), five sentences:
  - setup;
  - disaster one: ends Act One and forces commitment;
  - disaster two: ends the first half of Act Two and flips from false to true Moral Premise;
  - disaster three: ends Act Two and forces commitment to end the story;
  - ending.
  Disasters two and three must be caused by the protagonist's own efforts to fix things.
- Why: A sound three-act shape. "When the character pulls the roof down himself... we lean in."
- Standing: DECIDED BY YOLANDA (bible teaching)
- Source: L169 to L200
- Relationship: none

**S1-039**
- Type: Principle
- Statement: A disaster is "a turn that forces a choice the character cannot walk back." It is not merely a bad event. For IDW, "the war has to spiral out of their own escalation, never out of accident."
- Why: It distinguishes a story from a run of bad luck.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L179 to L189
- Relationship: ADDS TO S1-038

**S1-040**
- Type: Principle
- Statement: Cross-framework mapping of the disasters:
  - Disaster one = Break into Two = First Plot Point.
  - Disaster two is near the Midpoint / Moment of Truth.
  - Disaster three is near All Is Lost / Third Plot Point.
- Why: The three disasters are the load-bearing turns.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L191 to L200
- Relationship: ADDS TO S1-031

**S1-041**
- Type: Principle
- Statement: "A Disaster Is Not a Win": all three disasters are reversals, never victories. Even when a disaster hands the character something useful, its felt content is loss. A beat that leaves the character better off and in control is not a disaster.
- Why: Getting this wrong "tangles the back half of the book."
- Standing: DECIDED BY YOLANDA (bible)
- Source: L202 to L209
- Relationship: none

**S1-042**
- Type: Principle / Data model
- Statement: "Finding is not winning." A **discovery** (a hidden truth landing; information) is distinct from a **win** (acting and coming out ahead; leverage played). "Different beats, different places on the spine." "Never blur it."
- Why: The book lives on this distinction. Program implication: discovery and win are different event types.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L211 to L214
- Relationship: none

**S1-043**
- Type: Story fact (IDW)
- Statement: The men discovering Francine's ledger is the reveal. It belongs at disaster three, All Is Lost, and is a gut-punch ("it was the old lady the whole time, the war was a farce"). The book handing them a card to play does not turn the discovery into a win; it is the hook into Act Three.
- Why: Discovery equals reversal.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L215 to L220
- Relationship: ADDS TO S1-042

**S1-044**
- Type: Story fact (IDW)
- Statement: The win comes in the finale, when they wield the ledger as "their one real card against a woman they could never out-think," and she takes the war back warmly anyway. Order: discovery at disaster three (gut-punch), then wielding in the finale (the one real win), then her grace (the larger victory that keeps her whole).
- Why: It keeps the order right and keeps Francine whole.
- Standing: DECIDED BY YOLANDA (bible; reaffirmed as "Decided" at L1304)
- Source: L222 to L226, L1304 to L1310
- Relationship: ADDS TO S1-043

**S1-045**
- Type: Story fact (IDW)
- Statement: Disasters one and two are the men's plans failing, reversals aimed at them. One is "the wrong that lights the war and commits them." Two is "the spiral and the public humiliation that force them to stop and admit they have been played, without yet knowing by whom."
- Why: Three turns, each a loss for the men.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L226 to L230
- Relationship: ADDS TO S1-038

**S1-046**
- Type: Story fact (IDW)
- Statement: Example five-sentence paragraph:
  - Kevin Wickley believes neighbor Anthony Vernon is out to get him and half-believes his car is cursed. He lives across from Miss Francine Ellington, whose garden both men's dogs destroy.
  - D1: Francine quietly triggers the incident that makes Kevin declare war.
  - D2: the war spirals (animals, brawl, public humiliation) and they flip to "we have both been played."
  - D3: their attempt to catch the culprit backfires.
  - Ending: one real win, she takes it with grace and still wins warmly, and nobody in the neighborhood is alone.
- Why: Demonstrates the shape.
- Standing: EXAMPLE / ILLUSTRATION (the character names and premise elements are decided elsewhere)
- Source: L233 to L250
- Relationship: none

**S1-047**
- Type: Feature (craft element)
- Statement: **Moral Premise** as an equation: "[Vice] leads to defeat, but [Virtue] leads to success." Every external obstacle is rooted in one internal moral obstacle. It becomes a test every scene must pass: a scene shows the vice costing someone, the virtue paying off, or a character crossing from one to the other. A scene that does none of these "is probably not earning its place."
- Why: A theme word cannot structure a book; an equation can.
- Standing: DECIDED BY YOLANDA (bible teaching)
- Source: L259 to L277
- Relationship: Program implication: a scene-level thematic test, later echoed as "Thematic disconnects" (S1-165)

**S1-048**
- Type: Principle
- Statement: Characters start living the false half of the premise. At disaster two (near the midpoint) they flip to the true half, and the back half proves the true premise through consequence.
- Why: The premise drives the plot.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L284 to L287
- Relationship: none

**S1-049**
- Type: Story fact (IDW)
- Statement: Example Moral Premise: "contempt and going it alone lead to an endless, humiliating war, but seeing others and letting them in lead to peace and belonging." Tighter version: "disrespect breeds war; respect breeds peace." Francine already knows the true premise and forces the men to learn it. Candidate pairs to try: respect/contempt, connection/isolation, humility/pride.
- Why: Not yet chosen; "let it be the true one."
- Standing: EXAMPLE / ILLUSTRATION (the Moral Premise is undecided)
- Source: L289 to L305
- Relationship: none

**S1-050**
- Type: Story fact (IDW)
- Statement: The book's two values: **respect** on the surface (what they fight about) and **loneliness turning into connection** underneath (what they actually get). Respect is the controlling value.
- Why: The Moral Premise fuses them.
- Standing: DECIDED BY YOLANDA (bible: "the two values I already named")
- Source: L297 to L300, L325 to L326
- Relationship: none

**S1-051**
- Type: Principle
- Statement: "Every character is the lead of their own personal story." Each of the three is a full person with their own values, arc and forces, built through all four lenses at once.
- Why: That is where characters come alive.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L313 to L318
- Relationship: none

**S1-052**
- Type: Feature (craft element)
- Statement: Ingermanson Values via "Nothing is more important than ______." Most people land on two or three values, and a strong story puts them in conflict (Vito Corleone: respect versus family). Use it on all three leads.
- Why: The fastest way to the center of a person.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L320 to L327
- Relationship: none

---

## C. Story Bible: IDW characters

**S1-053**
- Type: Story fact (IDW)
- Statement: **Kevin Wickley**:
  - paranoid and self-important, certain the world (especially his neighbor) is out to get him;
  - a devoted Stephen King fan who half-believes his car is cursed, a real-life Christine;
  - **narrates the novel in first person**, so his anxious, operatic voice is the engine of the book and the delivery system for misdirection ("we only know what Kevin knows");
  - comic engine: paranoid overreaction, escalating the response while the actual event stays small.
- Why: The voice is the engine.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L335 to L341
- Relationship: none

**S1-054**
- Type: Story fact (IDW) / Data model
- Statement: Casting tuning forks are "kept off the page": Kevin = Kevin Hart (voice and tempo); Anthony = Anthony Anderson; Francine = Phylicia Rashad; the wife = Octavia Spencer. Use them to write, then describe the characters in their own right.
- Why: Writing aid; the reader builds their own picture. Program implication: a private, off-page character field.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L343 to L345, L473 to L474, L546 to L548, L640
- Relationship: none

**S1-055**
- Type: Data model (craft element)
- Statement: The Ingermanson character sheet has these fields: Role, Name, Goal (concrete), Ambition (abstract), Values (in conflict), Conflict, Epiphany. Goal and Ambition are distinct; the gap between them is "where the gold is" for comedy.
- Why: The goal secretly stands in for the ambition.
- Standing: DECIDED BY YOLANDA (bible teaching)
- Source: L347 to L364
- Relationship: none

**S1-056**
- Type: Story fact (IDW)
- Statement: Kevin's example sheet:
  - Role: co-lead (A story);
  - Goal: win the war, prove Anthony is sabotaging him, be vindicated;
  - Ambition: to be taken seriously, to not be the fool;
  - Values: respected versus right versus "my car";
  - Epiphany: respect comes from seeing the people he overlooked, Francine most of all.
- Why: Demonstration.
- Standing: EXAMPLE / ILLUSTRATION
- Source: L367 to L383
- Relationship: none

**S1-057**
- Type: Principle (craft)
- Statement: Weiland chain: **Ghost → Lie → Want → Need**. The Need is the Truth, usually the opposite of the Want. "The Ghost is what lets us forgive the Lie." Choose the arc by deciding where the character ends; the Lie is whatever he must stop believing to get there.
- Why: Keeps characters sympathetic.
- Standing: DECIDED BY YOLANDA (bible teaching)
- Source: L388 to L407
- Relationship: none

**S1-058**
- Type: Story fact (IDW)
- Statement: Kevin is "almost certainly" a Positive Change Arc.
- Why: He learns the Truth.
- Standing: POSSIBILITY (stated as near-certain, not marked Decided)
- Source: L389, L403
- Relationship: none

**S1-059**
- Type: Story fact (IDW)
- Statement: Kevin's example arc:
  - Lie: "If I am not constantly vigilant... people will disrespect me";
  - Ghost: an earlier humiliation where he was blindsided (which is why he is a King fan: in horror, paranoia is justified);
  - Want: win the war and force Anthony's respect;
  - Need: lower his guard enough to connect.
- Why: Demonstration.
- Standing: EXAMPLE / ILLUSTRATION
- Source: L409 to L425
- Relationship: none

**S1-060**
- Type: Principle (craft)
- Statement: McKee forces of antagonism work at three levels: inner, personal and extra-personal. They must close every easy exit, and all three must press at once. The value runs on a scale driven downward: respect → disrespect → humiliation → contempt wearing a polite face (the negation of the negation). For a character-driven comedy "the strongest force against Kevin is Kevin."
- Why: Shows who the character really is under pressure.
- Standing: DECIDED BY YOLANDA (bible teaching)
- Source: L427 to L459
- Relationship: Program implication: a value scale with degrees, and three-level antagonism fields

**S1-061**
- Type: Story fact (IDW)
- Statement: Kevin's example forces:
  - inner: paranoia and pride;
  - personal: Anthony's needling and Francine's invisible hand;
  - extra-personal: the neighborhood watching, the chaos of animals.
- Why: Demonstration.
- Standing: EXAMPLE / ILLUSTRATION
- Source: L448 to L454
- Relationship: none

**S1-062**
- Type: Story fact (IDW)
- Statement: **Anthony Vernon**:
  - dry, unbothered, needling; runs cool where Kevin runs hot;
  - comic engine: deadpan and the sport of it, escalating to watch Kevin lose his mind;
  - second co-lead of the A story and the other half of the **Buddy Love** pairing.
- Why: Contrast with Kevin.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L467 to L471
- Relationship: none

**S1-063**
- Type: Story fact (IDW)
- Statement: Anthony's example sheet and arc:
  - Goal: never let Kevin get the last word;
  - Ambition: control, untouchable;
  - Values: cool versus not disrespected at home versus (hidden) not alone;
  - Lie (detachment): "If I stay above it... I cannot be hurt";
  - Ghost: a loss that made caring a liability;
  - Need: to care about someone out loud.
  Instruction: "Keep his Lie the mirror image of Kevin's, so the two men are broken in complementary ways and heal each other." Likely also a Positive Change Arc.
- Why: Complementary breakage.
- Standing: EXAMPLE / ILLUSTRATION (the mirror-Lie guidance is bible teaching)
- Source: L481 to L527
- Relationship: none

**S1-064**
- Type: Story fact (IDW)
- Statement: **Miss Francine Ellington**:
  - the older woman across the street, dismissed and unseen;
  - secretly orchestrates the entire war because both men let their dogs destroy her garden, "the one thing that is truly hers";
  - plays chess while the men play checkers;
  - method = Zemo's tactics plus Leland Gaunt's watch-it-unfold delight, without villainy: "the most justified person in the book", with a warm heart;
  - comic engine: serene cunning and the straight face;
  - **POV withheld until the reveal**.
- Why: The reveal lands "like a thunderclap."
- Standing: DECIDED BY YOLANDA (bible)
- Source: L535 to L548
- Relationship: none

**S1-065**
- Type: Story fact (IDW)
- Statement: Francine's theme music: big band jazz, Ray Charles's "Let the Good Times Roll", over her trickster and awakening scenes. It is ironic, scores the loneliness-to-aliveness arc, and keeps her a trickster rather than a villain. In prose this becomes sentence rhythm: her scenes "should swing, short and snappy with a little bounce."
- Why: Tone control.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L543 to L544, L1805 to L1812
- Relationship: none

**S1-066**
- Type: Story fact (IDW)
- Statement: Francine runs two arcs at once on two values:
  - **Flat Arc on respect**: she already knows her worth and forces the men to grow ("whetstone").
  - **Positive Change Arc on loneliness**: she begins alone and the war wakes her up: "awake, alive, aware."
- Why: It makes her larger than a normal antagonist. Program implication: a character can carry multiple arcs on different values.
- Standing: DECIDED BY YOLANDA (bible "Key Insight", stated as fact; she is asked to "confirm she stays Flat on respect")
- Source: L550 to L565, L580 to L582
- Relationship: none

**S1-067**
- Type: Story fact (IDW)
- Statement: Francine's examples:
  - Lie on the loneliness axis: "I am done, overlooked...";
  - Ghost: widowed or displaced, spoken over;
  - Want: make the men pay and run her secret game;
  - Need: feel alive and seen, let herself be known;
  - sheet: Role = hidden engine, B-story lead, true protagonist of her own tale; Values = dignity, what is mine (the garden), not being alone.
- Why: Demonstration.
- Standing: EXAMPLE / ILLUSTRATION
- Source: L566 to L598
- Relationship: none

**S1-068**
- Type: Principle
- Statement: "The Forces Against Francine (I Insisted On This, Rightly)": every main character needs forces of antagonism on their own primary value, Francine included, or her arc is not earned ("a plot device with a feeling"). Her value is aliveness and being seen.
- Why: Yolanda's own craft insistence. Program implication: antagonism tracked per character, including antagonists.
- Standing: DECIDED BY YOLANDA ("I Insisted On This, Rightly")
- Source: L600 to L605
- Relationship: none

**S1-069**
- Type: Story fact (IDW)
- Statement: Example forces on Francine:
  - inner: guilt, fear, the habit of shrinking;
  - personal: a family who see her as fragile and want to move her to a smaller life;
  - extra-personal: risk of being caught, and the men reconciling too soon (ending the game that woke her).
  The family is "the warmest and the most painful."
- Why: Demonstration.
- Standing: EXAMPLE / ILLUSTRATION
- Source: L607 to L623
- Relationship: none

**S1-070**
- Type: Story fact (IDW)
- Statement: Supporting cast:
  - **The wife in the block party pie scene**: DECIDED she is an innocent, not Francine's daughter, an ordinary neighbor present for the pie moment; pictured as Octavia Spencer. OPEN: her name and how she connects to the plot.
  - **Francine's family**: decided in spirit that family love her but see her as fragile, and notice her spark return late in the book (visible evidence of her loneliness arc). OPEN: who, names, whether she lives with a daughter, how present.
  - **The dogs**: DECIDED both men's dogs ruin the garden, the true cause of everything. OPEN: names, personalities, whether they become characters.
  - **The neighborhood**: OPEN: name, character, whether other neighbors form a chorus.
- Why: Cast is partially decided.
- Standing: DECIDED BY YOLANDA (bible) for the decided parts; POSSIBILITY (open) for the rest
- Source: L639 to L657
- Relationship: The open items feed the "Open Decisions Layer" (S1-140)

**S1-071**
- Type: Principle (craft test)
- Statement: **Five-dollar bill test**: if a reaction could belong to anyone, the character is not yet distinct. Run it on every character.
- Why: Character distinctness.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L636 to L637, L656 to L657
- Relationship: See also the set piece S1-089

**S1-072**
- Type: Data model
- Statement: Deep Character Bible Template (Ingermanson Step 7) has four blocks:
  - **Physical**: name, age, birthdate, height, weight, ethnic heritage, hair and eyes, description, dress.
  - **Personality**: humor, type, religion, politics, hobbies, favorite music, books and movies, favorite color, wallet or purse contents.
  - **Environmental**: home, education, work, family, best friend, friends, enemies.
  - **Psychological**: best and worst childhood memories, one-line characterization, strongest and weakest traits, paradox, greatest hope and fear, philosophy, how they see themselves, how others see them.
  "I do not have to fill every line." Fill a little at a time; when a character feels thin, fill three psychological lines.
- Why: Character depth on demand. Program implication: optional fields, never mandatory.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L659 to L693
- Relationship: Supports S1-171

**S1-073**
- Type: Story fact (IDW)
- Statement: Kevin's example psychological block: fear of being made a fool in public; paradox that his need for respect makes him ridiculous; sees himself as "the only sane man on a street of threats"; others see "the loud man who argues with his own car."
- Why: Demonstration.
- Standing: EXAMPLE / ILLUSTRATION
- Source: L683 to L687
- Relationship: none

---

## D. Story Bible: the structure (beat sheet, board, scene engine)

**S1-074**
- Type: Feature / Data model
- Statement: **Integrated Beat Sheet**: Snyder's 15 beats placed by percentage of the manuscript (Brody), each beat also named in the other frameworks. Target word count converts percentages to landmarks: for 90,000 words, Catalyst is about 9,000, Midpoint about 45,000, All Is Lost about 67,000. "The percentages are guides, not rules. The beat sheet tells me when a turn happens; what happens is mine."
- Why: Rough landmarks.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L701 to L710
- Relationship: S1-005 ADDS page numbers to this

**S1-075**
- Type: Data model
- Statement: Every beat entry carries:
  - "Also known as" (cross-framework names);
  - "What this beat really does" (job);
  - "What it is" (IDW application);
  - "How to make it land, and how it fails" (weak versus strong examples);
  - an example ("One way I could play it");
  - a hand-off ("My move", "Over to me").
- Why: Teach, Show, Hand-off for every beat.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L712 to L1386
- Relationship: ADDS TO S1-023

**S1-076**
- Type: Story fact (IDW)
- Statement: The 15 beats with ranges and IDW content:
  - **Opening Image (0 to 1%)**: the street in uneasy peace. Kevin polishes the car he doesn't trust; Anthony watches amused; Francine is on her porch by her garden, present but overlooked, so the reader's eye slides past her. It must mirror the Final Image. It fails if it opens on the feud alone.
  - **Theme Stated (~5%)**: a throwaway line someone says (maybe the wife or Francine), e.g. "You two are so busy watching each other you don't see what's right in front of you", and Kevin waves it off. Never spoken by the hero.
  - **Setup (1 to 10%)**: Home, Work and Play for both men. Plant the garden, the dogs and the car. Make the reader care.
  - **Catalyst (~10%)**: the garden is destroyed one time too many. Francine invisibly engineers an incident that reads to Kevin as Anthony's opening move. The car is involved somehow, fusing the car paranoia with the neighbor paranoia. Strong version: the car is sabotaged publicly and humiliatingly, pointing at Anthony. Weiland's Key Event is also usable.
  - **Debate (10 to 20%)**: Kevin tries briefly to be the bigger man (maybe the wife or a neighbor counsels peace) and fails, narrating his restraint until he does something unrestrained.
  - **Break into Two (~20%)**: Kevin formally declares war (the title moment), out loud and in public. The board prints the WANT here. Disaster one.
  - **B Story (~22%)**: Francine's thread surfaces; the reader feels her without suspecting her and still gets no POV.
  - **Fun and Games (20 to 50%)**: fish-guts chain reaction, siege of animals, pranks, block party pie. "Escalate the reaction, not the harm"; "Every prank should also be plot."
  - **Midpoint (50%)**: false victory or false defeat (the board has a checkbox); perhaps the brawl or a public humiliation. The first crack: "wait, who is actually doing this?" Snyder says nail it first.
  - **Bad Guys Close In (50 to 75%)**: the second pinch point. Francine tightens her grip; the men's alliance fractures on their own flaws.
  - **All Is Lost (~75%)**: their plan to trap Francine backfires and exposes how she outplayed them. Disaster three. The old warring selves die.
  - **Dark Night of the Soul (75 to 80%)**: the Confession scene.
  - **Break into Three (~80%)**: the board prints the NEED. The A and B stories fuse; the men meet Francine as an equal; Kevin's NEED (connection) surfaces.
  - **Finale (80 to 99%)**: Snyder's five steps: Gathering the Team, Storming the Castle, Hightower Surprise, Dig Deep Down, Executing the New Plan. Minor characters' arcs complete.
  - **Final Image (99 to 100%)**: mirrors the opening. The men see Francine, everyone is connected, and the garden is now the visible center of a peace. The board offers "Hero is changed" or "Hero rejects change."
- Why: The book's spine.
- Standing:
  - Beat placements and teaching: DECIDED BY YOLANDA (bible).
  - IDW content in the "What it is" passages: mostly provisional ("maybe", "perhaps"), so treat it as POSSIBILITY.
  - The "One way I could play it" passages: EXAMPLE / ILLUSTRATION.
- Source: L712 to L1386
- Relationship: none

**S1-077**
- Type: Principle
- Statement: Opening Image and Final Image are twins. "If nothing in the opening can be turned over later, it is not yet doing its job." Show the change; never state the lesson in the final line.
- Why: Meaning is relative; the reader feels the distance traveled.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L716 to L724, L1335 to L1360
- Relationship: Program implication: link the opening and final image as mirror pair

**S1-078**
- Type: Principle
- Statement: Setup must plant every seed later harvested: "If it pays off later, it has to be here first."
- Why: Payoffs should feel inevitable, not convenient.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L820 to L829
- Relationship: Basis for the plant/payoff tracking (S1-139, S1-156)

**S1-079**
- Type: Principle (test)
- Statement: Beat tests:
  - **Catalyst**: if the character could reasonably return to normal the next day, it was not a catalyst.
  - **Break into Two**: a real break changes his situation, not just his mind.
  - **Midpoint**: it must turn direction, not just be the biggest event.
  - **All Is Lost**: it must be caused by the hero's own efforts; the death is internal.
  - **Dark Night**: one still beat, neither skipped nor wallowed in.
  - **Break into Three**: the hero acts on the truth, not merely realizes it.
  - **Finale**: no clean win; Francine is never humiliated.
- Why: Diagnostic tests for each beat.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L850 to L852, L930 to L932, L1082 to L1103, L1160 to L1185, L1204 to L1221, L1242 to L1263, L1289 to L1319
- Relationship: Program implication: candidate diagnostics (see S1-165)

**S1-080**
- Type: Principle / Data model
- Statement: **Plot versus value threads**: a plot strand (A, B, C, sometimes D) is a line of action with its own events. An arc or value is cargo that rides on a strand and is never a strand of its own. "Values ride the plot lines, so I never mistake a value for a thread." Most guides blur this, "which is how a writer ends up thinking she has four plots when she has two plots carrying four meanings."
- Why: Clarity of structure. Program implication: strands and values are separate entity types; values attach to strands.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L981 to L990
- Relationship: ChatGPT restated this faithfully at L1920 (S1-111)

**S1-081**
- Type: Story fact (IDW)
- Statement: IDW threads:
  - **A = the feud** (Kevin versus Anthony). It carries respect on the surface and isolation-to-friendship underneath.
  - **B = Francine's hidden game**, plus her invisible-to-alive arc. It is a true second thread running its own track until it collides with the men's at the reveal.
  - The men's friendship is NOT a C; it is the heart the A story carries.
  - A real C, if wanted, would be another line of action. The natural candidate is Francine's family pushing to manage her into a smaller life, paying off when they notice her spark.
- Why: Test case for thread logic.
- Standing: DECIDED BY YOLANDA (bible) for A and B and "friendship not a C"; POSSIBILITY for the C thread
- Source: L992 to L1007
- Relationship: none

**S1-082**
- Type: Principle
- Statement: Threads weave rather than run in parallel; the strongest scenes move more than one thread at once. The pie scene is a centerpiece because it drives A and B together while deepening the men's arc. The B story feeds the A story and finally fuses with it. It fails if it runs untouched beside A, is dropped, or resolves in its own corner. Threads converge at the climax; serialized TV holds some threads open on purpose. "Always know which of your threads resolve now and which you are deliberately holding open."
- Why: One weave, not two books stapled together. Program implication: track thread touch-points, convergence, and resolve-now versus hold-open (TV generality).
- Standing: DECIDED BY YOLANDA (bible)
- Source: L970 to L979, L1007 to L1019
- Relationship: none

**S1-083**
- Type: Feature / Data model
- Statement: **The Board**: four rows of cards (Act One, Act Two first half, Act Two second half, Act Three), about 9 or 10 cards each, roughly 40 total. Some beats are one card, others several; fold a sequence (montage, chain of pranks) into one card. Build order: nail the Midpoint first, then All Is Lost as its flip, then the two act breaks. **Color-code each card by story strand (Kevin, Anthony, Francine, theme).**
- Why: It turns 15 beats into scenes.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L1382 to L1389
- Relationship: Program implication: a scene-card board view (ChatGPT's "scene-card board", S1-134)

**S1-084**
- Type: Data model / UI-UX
- Statement: The two symbols on every card, written at the bottom in a different color:
  - **+/-**: emotional start and end, which must be opposites ("every scene has to turn").
  - **><**: the conflict: who the players are, each one's goal, the obstacle, and who wins.
  Only one conflict per scene. If a scene has no emotional change and no conflict, "rebuild it or cut it." +/- equals McKee's value turn; >< equals Ingermanson's Proactive Scene. One card satisfies all three frameworks. Scene list row: **POV, goal, conflict, outcome, value it turns.**
- Why: Every scene must turn.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L1391 to L1402
- Relationship: S1-009 ADDS TO this; S1-144 (ChatGPT nuance on value-shift types) ADDS TO this

**S1-085**
- Type: Process (work habit)
- Statement: When moving from beats to scenes she likes to "get physical": index cards or sticky notes in four rows on a wall or table. Write cards for scenes she can already see, place them under beats, fill gaps to 9 or 10 per act, and add +/- and ><. "Genuinely fun to do."
- Why: Tactile planning is part of the fun. Program implication: printable cards and a physical-board export should be considered.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L1404 to L1408
- Relationship: none

**S1-086**
- Type: Feature (craft element)
- Statement: **Scene Engine (Scene and Sequel, Swain), on her wall poster.**
  - Scene (Proactive): Goal, Conflict, Disaster. The disaster pushes the character sideways and is McKee's gap.
  - Sequel (Reactive): Reaction, Dilemma, Decision, New Goal. The decision launches the next Scene.
  - They must alternate: Scene is the inhale, Sequel the exhale. Most meaning lives in the Sequel.
  - Diagnostic: if the story is "spinning without moving," look for Scenes with no Disaster or Sequels with no Decision.
- Why: The pulse of a novel.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L1410 to L1464
- Relationship: ChatGPT links it to the causal chain at S1-146

**S1-087**
- Type: Story fact (IDW)
- Statement: Example Kevin proactive scene. Goal: prove Anthony planted the fish guts. Conflict: no evidence. Disaster: caught snooping by a neighbor, looks guilty. Sequel: humiliation; retaliate or retreat; decides to escalate smarter.
- Why: Demonstration.
- Standing: EXAMPLE / ILLUSTRATION
- Source: L1448 to L1454
- Relationship: none

**S1-088**
- Type: Feature
- Statement: **Master Translation table** ("my ArchPlot wall chart proves the point"):
  - commitment turn (~20%) = Break into Two = First Plot Point = Crossing the First Threshold = Point of No Return = disaster one;
  - middle turn (50%) = Midpoint = Turning Point = Moment of Truth = Mid-Act Climax = false-to-true Moral Premise flip = disaster two;
  - low point (~75%) = All Is Lost = Third Plot Point = Inmost Cave = Crisis = Dark Night approaching = disaster three;
  - inciting spark (~10%) = Catalyst = Inciting Incident = Inciting Event = Call to Adventure.
  "I found these seams myself."
- Why: She can move between tools and always be "working on the same book."
- Standing: DECIDED BY YOLANDA (bible)
- Source: L1466 to L1481
- Relationship: ADDS TO S1-031. Basis for S1-113.

---

## E. Story Bible: set pieces, narrative devices, tone, world

**S1-089**
- Type: Story fact (IDW)
- Statement: **Five-Dollar Bill Test in Action** (set piece): a five-dollar bill lies on the sidewalk between the houses.
  - Kevin suspects bait from Anthony, refuses to touch it, and photographs it as evidence.
  - Anthony picks it up slowly while holding eye contact, purely to watch Kevin lose it; he doesn't want the money.
  - Francine placed it there so one of them bends with his back turned to what she is actually doing.
  Three reactions, none swappable: paranoia, dry sport, chess.
- Why: Proves the cast is distinct and generates comedy for free.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L1494 to L1504
- Relationship: none

**S1-090**
- Type: Story fact (IDW)
- Statement: Open: where the five-dollar bill lands in the book and what Francine's decoy covers. "It could seed the fish-guts sequence."
- Why: Placement undecided.
- Standing: POSSIBILITY (open)
- Source: L1506 to L1507
- Relationship: ADDS TO S1-089. S1-091 states the decoy is the five-dollar bill ("While the men are distracted (the five-dollar bill)"), so the link to fish guts is partly decided; see Unclear U3.

**S1-091**
- Type: Story fact (IDW)
- Statement: **Fish-Guts Chain Reaction**:
  - While the men are distracted (the five-dollar bill), Francine loads Anthony's yard with raw fish guts.
  - The smell comes first and Anthony can't place it.
  - A half-day later the animals arrive: cats, then raccoons, escalating until he is besieged in his own house.
  - Anthony blames Kevin; Kevin denies it truthfully; retaliation follows.
  - The war becomes self-sustaining over a thing neither man did: "Francine lit the match once and the fire feeds itself."
- Why:
  - Delayed payoff (protect the gap between cause and effect).
  - Escalate the reaction, not the event.
  - Dramatic irony (the reader saw Francine).
  - Load-bearing.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L1509 to L1526
- Relationship: none

**S1-092**
- Type: Story fact (IDW) / Constraint
- Statement: The cardinal rule of the eventual brawl: **nobody gets seriously hurt.**
- Why: Comedy tone; escalate the reaction, not the harm.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L1525 to L1526
- Relationship: Reflected in ChatGPT's comic-versus-harm distinction (S1-117)

**S1-093**
- Type: Story fact (IDW)
- Statement: Fish guts open items: exact staging, how much of Francine the reader sees doing it, and how the brawl plays out. Tip: Kevin narrating Anthony's siege from across the street "is a gift."
- Why: Undecided.
- Standing: POSSIBILITY (open)
- Source: L1531 to L1536
- Relationship: none

**S1-094**
- Type: Story fact (IDW)
- Statement: **Block Party Pie Scene**: a reader-complicity set piece in the spirit of Minny's pie in *The Help*. It happens at a block party where everyone brings food, with the innocent wife present. "Reader complicity plus a justified target equals permission to enjoy it." "The scene will be just as funny as the pie in The Help as long as I write it correctly. Execution is what earns the laugh, not shock." Called "the still-unwritten center of the book."
- Why: The reader knows what the eaters don't.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L1541 to L1558
- Relationship: none

**S1-095**
- Type: Story fact (IDW)
- Statement: Pie scene open items: what is in or on the pie, what the reader knows and when, who eats it, and how it ties to Francine's game. "One of my most important scenes."
- Why: Undecided.
- Standing: POSSIBILITY (open)
- Source: L1552 to L1554
- Relationship: ChatGPT cites this as undecided at L2000 (faithful)

**S1-096**
- Type: Story fact (IDW)
- Statement: **The Confession**: the emotional floor, best placed in the Dark Night. As allies, the men confide sideways; we hear the pain without anyone naming loneliness. Hands busy, eyes anywhere but on each other (a stakeout, fixing a fence or a car). The confiding makes them friends; it is not a result of friendship. One undercuts the tender moment with a joke. "Never name the loneliness; trust the reader." "No one says the word."
- Why: It shows the deep value in action.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L1560 to L1582
- Relationship: none

**S1-097**
- Type: Principle (purpose of the book)
- Statement: "I said men need to see other men learning it is safe to lean on each other. That conviction is the soul of the scene and part of the reason the book exists."
- Why: Her personal conviction.
- Standing: DECIDED BY YOLANDA
- Source: L1578 to L1579
- Relationship: none

**S1-098**
- Type: Principle
- Statement: **Point of view is the control valve on information**. "Keep the secret-keeper outside the point of view until I am ready to reveal them." Two failures: head-hopping, and the slow leak (a stray line of Francine's interior). The reveal must be fair: "the reader can look back and see I never lied, I just never gave them Francine."
- Why: Protects the misdirection. Program implication: POV per scene, and a check for leaks.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L1594 to L1626
- Relationship: Basis for the reader-knowledge track (S1-115)

**S1-099**
- Type: Principle
- Statement: "Alternating Point of View Is Not Head-Hopping": one head per scene or chapter, switching only at a visible seam. Two feuding narrators let the reader sit above the feud. "Change heads only at a seam, never inside a scene."
- Why: Comedy generated by structure, and fairness.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L1631 to L1674
- Relationship: none

**S1-100**
- Type: Story fact (IDW)
- Statement: POV decisions:
  - Kevin narrates in first person.
  - POV alternates between Kevin and Anthony.
  - Francine is not a third narrator and has no POV sections until the reveal.
  - Never head-hop.
  - The reveal is delivered through **Francine's found ledger**, so her interior arrives as an object the reader can hold.
  - Full lesson in Part Nine (not in transcript).
- Why: Fair misdirection.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L1679 to L1687
- Relationship: ADDS TO S1-053, S1-064. UNCLEAR whether Anthony also narrates in first person; see Unclear U1.

**S1-101**
- Type: Story fact (IDW)
- Statement: Open: exactly when Francine's POV first opens, at the reveal or just after.
- Why: Undecided.
- Standing: POSSIBILITY (open)
- Source: L1689 to L1690
- Relationship: none

**S1-102**
- Type: Story fact (IDW) / Feature
- Statement: **"In Which" chapter titles** (Fielding, Dickens, Gaiman). Grand language over a small event; can carry dramatic irony.
  - Test: does the title reveal voice or irony, or only summarize? If it only explains, sharpen it toward a wink or cut it to a plain chapter number.
  - Examples: "In Which the Whole World Comes to an End"; "In Which the Raccoons Choose a Side"; "Chapter Four, In Which Kevin Declares War on a Casserole Dish."
  - Use is optional. If used, keep the voice hers ("warm, Southern, conviction over explanation") rather than a Gaiman impression.
- Why: Voice in the architecture.
- Standing: POSSIBILITY (optional, undecided). The titles themselves are EXAMPLE / ILLUSTRATION.
- Source: L1692 to L1752
- Relationship: Program implication: a chapter-title field

**S1-103**
- Type: Story fact (IDW)
- Statement: **Intrusive Narrator (Optional)**: a warm porch-storyteller voice (Anansi Boys) that could seed Francine in plain sight. Test: is the aside doing real work? Open: whether to use direct address and whose voice it would be.
- Why: Undecided.
- Standing: POSSIBILITY (open)
- Source: L1754 to L1762
- Relationship: none

**S1-104**
- Type: Principle (tone)
- Statement: **Levity as permission** (from Anansi Boys): comedy keeps the reader's guard down so the feeling lands without going sappy. It fails in both directions: too jokey ("clever and hollow") or too earnest ("feels handled"). Let the feeling be real for a beat, then let a joke carry it up out of the feeling. "Keep the tone light enough to protect the tenderness."
- Why: Tone tightrope.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L1764 to L1803
- Relationship: Relevant to the comic and emotional intensity tracks (S1-153)

**S1-105**
- Type: Process (work habit)
- Statement: "I build a playlist for every novel." For IDW she might add something anxious for Kevin and something dry and cool for Anthony. Keep the playlist off the page.
- Why: Writing aid. Program implication: per-character tuning-fork music field, private.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L1811 to L1815
- Relationship: none

**S1-106**
- Type: Story fact (IDW)
- Statement: World decided: a neighborhood comedy, two houses in a feud with a third across the street. The garden is the emotional center, the one thing truly Francine's, and the dogs destroying it is the true cause of the war.
- Why: Setting core.
- Standing: DECIDED BY YOLANDA (bible)
- Source: L1827 to L1830
- Relationship: none

**S1-107**
- Type: Story fact (IDW)
- Statement: World open:
  - the neighborhood's name and character;
  - the town or city;
  - the era (contemporary or a specific decade);
  - the houses;
  - the make and model of Kevin's car;
  - the dogs' names and personalities;
  - whether there is a neighborhood chorus.
  Suggested first: name Kevin's car (a whole comic thread) and the dogs ("innocent engines of the plot"). "Fill in the world a piece at a time, whenever a detail arrives."
- Why: Undecided; fill as ideas arrive.
- Standing: POSSIBILITY (open)
- Source: L1832 to L1839
- Relationship: S1-013 to S1-015 (her time and space requirements) ADD TO this

**S1-108**
- Type: Data model (missing from transcript)
- Statement: The bible contains Parts Seven to Nine, not shown in the transcript:
  - Part Nine "Francine's Ledger" (the full decision);
  - a plant-and-payoff tracker;
  - a reader-knowledge timeline;
  - an open-decisions list.
  ChatGPT cites them at bible L1847 to L1880 and L1941 to L2058, and refers to an "October 13 story bible" with 57 pages.
- Why: These are existing structures the program must ingest.
- Standing: DECIDED BY YOLANDA (bible content exists; not visible here)
- Source: L1308, L1687, L2008, L2253 to L2262
- Relationship: Source material for S1-115, S1-139, S1-156

---

## F. ChatGPT 09:34 response: understanding of the poster

**S1-109**
- Type: UI-UX
- Statement: The poster is imagined as about 36 × 48 inches, showing:
  - the complete structure (15 beats, three acts, turning points);
  - the A story and the B story;
  - the thematic structure;
  - the character arcs;
  - the major plot points;
  - the set pieces (five-dollar bill, fish guts, animal siege, block party pie, confession, ledger revelation);
  - setups and payoffs;
  - the emotional trajectory.
- Why: Lets her see the whole architecture at once.
- Standing: ACCEPTED PROPOSAL ("Wow you totally get me", L2112)
- Source: L1882 to L1896, 09:34
- Relationship: ADDS TO S1-001. NOTE: this list goes beyond Yolanda's "just plot, theme, structure, A/B" (S1-002) by adding arcs, set pieces, setups and payoffs, and emotional trajectory. She accepted it in general terms.

**S1-110**
- Type: Principle
- Statement: Elements must not sit in separate boxes; the visualization must show how they influence one another. "That's what makes it a story map rather than an elaborate outline."
- Why: Relationships are the point.
- Standing: ACCEPTED PROPOSAL
- Source: L1898 to L1902
- Relationship: none

**S1-111**
- Type: Story fact (IDW) / Data model
- Statement: Two versions of the same story run at once:
  - the story Kevin and Anthony believe they are living;
  - the story actually happening (Francine);
  - underneath both, the emotional story of three people needing connection.
  The bible's plot-versus-value distinction is preserved; the friendship is not a C plot.
- Why: The architecture of misdirection. Program implication: believed story versus actual story.
- Standing: ACCEPTED PROPOSAL
- Source: L1904 to L1920
- Relationship: RESTATEMENT OF S1-080 and S1-081 (faithful)

**S1-112**
- Type: UI-UX
- Statement: Layout:
  - a horizontal timeline as the backbone;
  - **above the timeline: the visible story** (Kevin and Anthony's war);
  - **below the timeline: the hidden story** (Francine's actions, motives, effects, transformation);
  - running through both: thematic and emotional developments, connecting vertically to plot events where external action produces internal change.
- Why: Look at the midpoint and see what it means for every storyline.
- Standing: ACCEPTED PROPOSAL
- Source: L1922 to L1938
- Relationship: none

**S1-113**
- Type: Principle / Constraint
- Statement: Don't print every framework lesson on the poster. Show where their structural concepts intersect (e.g. "Break into Two = First Plot Point = Point of No Return = Disaster One") at the point where it matters, so the result is "a unified narrative architecture rather than four frameworks competing for space."
- Why: Avoids clutter.
- Standing: ACCEPTED PROPOSAL
- Source: L1940 to L1965
- Relationship: ADDS TO S1-088

**S1-114**
- Type: UI-UX / Data model
- Statement: Ten visual layers:
  1. Narrative spine (acts, beats, %)
  2. A Story
  3. B Story
  4. Character arcs
  5. Thematic movement
  6. Major turning points
  7. Set pieces
  8. Setup and payoff
  9. Reader knowledge
  10. Resolution
  Style is "closer to an architectural blueprint than a traditional infographic."
- Why: A layered map.
- Standing: ACCEPTED PROPOSAL
- Source: L1967 to L1982
- Relationship: none

**S1-115**
- Type: Feature
- Statement: **Reader-knowledge track**, considered essential for IDW. Show what Kevin knows, what Anthony knows, what the reader suspects, and what Francine actually knows.
- Why: "Protect the revelation you're engineering." The book depends on misdirection.
- Standing: ACCEPTED PROPOSAL
- Source: L1984 to L1990
- Relationship: ADDS TO S1-098. Expanded at S1-154.

**S1-116**
- Type: UI-UX / Feature
- Statement: **Distinguish decided from still-developing material**: solid outlines for confirmed decisions, dotted outlines for unresolved beats. "We should never present an illustrative possibility as though you've already committed to it." Example: the ledger is established (discovered at All Is Lost, wielded in the finale, "deliberately separate moments"), while the pie mechanics are undecided.
- Why: The poster stays useful throughout writing and shows where development is needed "without forcing you to search through 57 pages."
- Standing: ACCEPTED PROPOSAL
- Source: L1992 to L2008
- Relationship: ADDS TO S1-023 and S1-024. RESTATEMENT OF S1-044 (faithful).

**S1-117**
- Type: Feature / Principle
- Statement: Emphasize **why one event causes the next**, not just what happens. Use the causality chain: garden destroyed → her motivation → manipulation → misunderstanding → retaliation → escalation → questioning → investigation → discovery. Show it with directional lines and positioning. Also distinguish the escalation of **comic reactions** from the escalation of **actual harm**.
- Why: "That chain of causality is the novel's engine."
- Standing: ACCEPTED PROPOSAL
- Source: L2010 to L2036
- Relationship: ADDS TO S1-091 and S1-092. Yolanda ADDS TO this at S1-012.

**S1-118**
- Type: UI-UX
- Statement: Format: landscape, large-format, 48 × 36 or even 60 × 36 inches.
  - NOT a flowchart that looks like an IT network diagram.
  - NOT a corporate presentation.
  - "Visually sophisticated and information-rich", with room to breathe.
- Why: Aesthetic fit.
- Standing: ACCEPTED PROPOSAL
- Source: L2038 to L2046
- Relationship: ALTERNATIVE TO the 36 × 48 portrait framing of S1-109. Orientation and size are not settled.

**S1-119**
- Type: Principle (acceptance criteria)
- Statement: Three qualities the poster must have:
  - **Comprehensive**: every major structural component represented.
  - **Readable**: understand the overall story from several feet away, then move closer to inspect individual beats.
  - **Useful**: when drafting a section, locate it on the poster and understand what that section must accomplish.
- Why: Success criteria.
- Standing: ACCEPTED PROPOSAL
- Source: L2048 to L2054
- Relationship: none

**S1-120**
- Type: Feature
- Statement: The final design should be **editable** and suitable for professional large-format printing, "so as you make decisions and refine the story, you won't have to rebuild the poster from scratch."
- Why: The story will evolve.
- Standing: ACCEPTED PROPOSAL
- Source: L2056
- Relationship: Yolanda generalizes this at S1-016

**S1-121**
- Type: Process
- Statement: Discuss the philosophy before designing anything.
- Why: Same as S1-003.
- Standing: ACCEPTED PROPOSAL
- Source: L2058
- Relationship: RESTATEMENT OF S1-003

**S1-122**
- Type: Feature
- Statement: **Option A, the Story Architecture Map**: emphasizes relationships among all elements, "the entire machinery of the novel with its casing removed."
- Why: An interconnection view.
- Standing: ACCEPTED PROPOSAL (Yolanda wants A printable)
- Source: L2062 to L2068
- Relationship: See S1-125 (label swap)

**S1-123**
- Type: Feature
- Statement: **Option B, the Writer's Story Board**: chronological, left to right through acts and beats; each beat contains plot, A/B stories, character transformation, thematic movement and key events. "An extremely sophisticated version of your existing Save the Cat board."
- Why: A chronological view.
- Standing: ACCEPTED PROPOSAL
- Source: L2070 to L2076
- Relationship: ADDS TO S1-032. See S1-125.

**S1-124**
- Type: Feature / Principle
- Statement: **Hybrid**: the chronological structure of B plus the interconnections of A. It answers two questions: **"Where am I in the story?"** and **"How does what I'm writing here affect everything else?"** "A really effective writing tool should answer both." It is called "the visual command center for writing your novel."
- Why: Both needs together.
- Standing: ACCEPTED PROPOSAL (Yolanda: all three important, print any)
- Source: L2078 to L2108
- Relationship: ADDS TO S1-122 and S1-123

**S1-125**
- Type: Constraint (labeling issue)
- Statement: Labels are inconsistent:
  - ChatGPT's philosophies: Option A = Architecture (relationships); Option B = Story Board (chronological).
  - ChatGPT's question: A = chronological; B = relationships; C = both.
  - Yolanda answered "print A or B Or Hybrid".
  - ChatGPT at 09:58 fixed A = Chronological/structural and B = Relationship/systems, which swaps the earlier Option labels.
- Why: The meaning of "A" and "B" flipped mid-conversation.
- Standing: UNCLEAR
- Source: L2062 to L2104, L2112, L2137 to L2139
- Relationship: UNCLEAR. Both views exist either way; only the letter names are ambiguous.

---

## G. ChatGPT 09:58 response (accepted at 10:14: "I agree with everything you said")

**S1-126**
- Type: Principle
- Statement: What she needs is a **master story-mapping system** that generates multiple visual views of the same novel: A (Chronological/structural), B (Relationship/systems), and Hybrid. "Your brain can use whichever view helps most on a given day."
- Why: Different days, different needs.
- Standing: ACCEPTED PROPOSAL
- Source: L2132 to L2141, 09:58
- Relationship: RESTATEMENT OF S1-004 and S1-006

**S1-127**
- Type: Data model / Principle
- Statement: Define the master underlying structure first: "**one story data model**" rendered as Poster A: Story Spine / Timeline; Poster B: Story Logic / Interconnection Map; Poster C: Hybrid Command Center.
- Why: It supports the generalized program.
- Standing: ACCEPTED PROPOSAL
- Source: L2145 to L2159
- Relationship: ADDS TO S1-126. Note: the Hybrid is called "Poster C" here, "Output C: Hybrid Wall Poster" at L2291, and "Hybrid" by Yolanda.

**S1-128**
- Type: Data model
- Statement: For every major beat show:
  - beat name;
  - approximate percentage;
  - approximate word count;
  - approximate page for 250 pages;
  - approximate page for 300 pages.
  Example: Catalyst = 10%, about p.25 in a 250-page novel, about p.30 in a 300-page novel.
- Why: Practical while drafting.
- Standing: ACCEPTED PROPOSAL
- Source: L2161 to L2183
- Relationship: ADDS TO S1-005. Adds word count, which Yolanda didn't ask for but accepted.

**S1-129**
- Type: Story fact (IDW) / Data model
- Statement: Page landmark table:

  | Beat | 250-page novel | 300-page novel |
  |---|---|---|
  | Opening Image | p.1 to 3 | p.1 to 3 |
  | Theme Stated | p.12 to 13 | p.15 |
  | Catalyst | p.25 | p.30 |
  | Break into Two | p.50 | p.60 |
  | B Story | p.55 | p.66 |
  | Midpoint | p.125 | p.150 |
  | All Is Lost | p.188 | p.225 |
  | Break into Three | p.200 | p.240 |
  | Final Image | p.248 to 250 | p.297 to 300 |
  | Setup (range) | p.3 to 25 | p.3 to 30 |
  | Debate (range) | p.25 to 50 | p.30 to 60 |
  | Fun and Games (range) | p.50 to 125 | p.60 to 150 |
  | Bad Guys Close In (range) | p.125 to 188 | p.150 to 225 |
  | Dark Night (range) | p.188 to 200 | p.225 to 240 |
  | Finale (range) | p.200 to 248 | p.240 to 297 |

- Why: Derived from the bible percentages.
- Standing: ACCEPTED PROPOSAL (the computed values)
- Source: L2185 to L2249
- Relationship: ADDS TO S1-074. These are computed, not story decisions.

**S1-130**
- Type: Not wanted (implied) / UI-UX
- Statement: In ChatGPT's internal thoughts: a "24-beat spine" with page bands, "a poster-safe legend", "a modular layout that can begin as one poster and later expand into a wall set", and "viewing distance: desk reference, wall reference, or both."
- Why: Hidden reasoning, never surfaced to Yolanda. "24-beat" conflicts with the 15 beats.
- Standing: UNANSWERED PROPOSAL (never shown to her)
- Source: L2124, 09:59 (thoughts)
- Relationship: UNCLEAR. The 24-beat figure contradicts S1-074 (15 beats). Modular wall set and viewing distance are ideas worth preserving.

**S1-131**
- Type: Constraint (distortion risk)
- Statement: ChatGPT fixed the page estimates to exactly 250 and 300 pages. Yolanda's request was an example ("say if... for example"). The program must compute page landmarks for any target page count or word count.
- Why: General-purpose requirement.
- Standing: DECIDED BY YOLANDA (her phrasing implies any length); ChatGPT's narrowing is a distortion
- Source: L2114 versus L2170 to L2171, L2375
- Relationship: ADDS TO S1-005. RESTATEMENT OF S1-005 with narrowing.

**S1-132**
- Type: Principle
- Statement: The bible already contains the layers a mapping program needs: integrated beat sheet, board / scene engine, A and B story logic, set pieces, open decisions, Francine's hidden ledger, plant-and-payoff tracker, reader-knowledge timeline. "This is actually the beginning of a reusable system."
- Why: IDW is the test case.
- Standing: ACCEPTED PROPOSAL
- Source: L2251 to L2265
- Relationship: ADDS TO S1-108

**S1-133**
- Type: Feature / Data model
- Statement: Program inputs: title, logline, theme / moral premise, target page or word count, major characters and arcs, A/B/C threads, beat-sheet events, set pieces, plants and payoffs, reveals / knowledge flow, unresolved items.
- Why: Generic inputs for any novel.
- Standing: ACCEPTED PROPOSAL
- Source: L2267 to L2281
- Relationship: ADDS TO S1-006

**S1-134**
- Type: Feature
- Statement: Outputs:
  - **A: Structural Timeline**: left-to-right spine with acts, beats, page counts, set pieces, turning points.
  - **B: Systems Map**: relationship diagram of causality, arcs, thematic links, plot strands, reveal logic.
  - **C: Hybrid Wall Poster**: chronology plus interconnections.
  - **Bonus outputs**: scene-card board, chapter planning sheet, drafting roadmap, revision map, setup/payoff tracker, mystery/reveal integrity map.
- Why: Multiple views.
- Standing: ACCEPTED PROPOSAL
- Source: L2283 to L2302
- Relationship: ADDS TO S1-126. The bonus outputs are new; their later fate is unknown.

**S1-135**
- Type: Process
- Statement: The next step is NOT visual styling. Define the **master schema**: the categories that must exist whatever the output. "Design the story-map framework first, not the artwork first."
- Why: Foundation before decoration.
- Standing: ACCEPTED PROPOSAL
- Source: L2304 to L2312, L2377
- Relationship: none

**S1-136**
- Type: Data model
- Statement: Schema 1 **Core Story Identity**: title, genre, tone, logline, moral premise / controlling idea. Schema 2 **Structural Spine**: 3 acts, 15 beats, percentage, word count, page estimates.
- Why: Master schema.
- Standing: ACCEPTED PROPOSAL
- Source: L2316 to L2328
- Relationship: Yolanda ADDS sequences and scenes (S1-010). The "3 acts, 15 beats" hard-code later becomes optional (S1-175).

**S1-137**
- Type: Data model
- Statement: Schema 3 **Plot Threads**: A story, B story, optional C story, and where they intersect. Schema 4 **Character Arc Layer**: Lie, Ghost, Want, Need, epiphany / turn, final state.
- Why: Master schema.
- Standing: ACCEPTED PROPOSAL
- Source: L2330 to L2342
- Relationship: Note: drops the Ingermanson Goal/Ambition/Values, McKee forces, and the multi-arc case (Francine Flat plus Positive). See Dropped D4.

**S1-138**
- Type: Data model
- Statement: Schema 5 **Theme Layer**: respect versus contempt, isolation versus connection, and how each thread carries each value. Schema 6 **Set Pieces**: key comedic scenes, where they land, what story job they perform.
- Why: Master schema.
- Standing: ACCEPTED PROPOSAL
- Source: L2344 to L2352
- Relationship: The Theme Layer is IDW-specific here; generically it is "values". Note: "respect vs contempt" is from the example Moral Premise, which is undecided (S1-049).

**S1-139**
- Type: Data model
- Statement: Schema 7 **Reveal / Knowledge Layer**: what the reader knows, what Kevin knows, what Anthony knows, what Francine knows. Schema 8 **Plant / Payoff Layer**: clue, placement, payoff.
- Why: Master schema.
- Standing: ACCEPTED PROPOSAL
- Source: L2354 to L2364
- Relationship: ADDS TO S1-115. S1-154 and S1-156 expand it.

**S1-140**
- Type: Data model
- Statement: Schema 9 **Open Decisions Layer**: unresolved items clearly marked.
- Why: Master schema.
- Standing: ACCEPTED PROPOSAL
- Source: L2365 to L2366
- Relationship: ADDS TO S1-116. Note: it reduces the decided / example / open distinction to "unresolved"; S1-166 restores a four-status model.

---

## H. ChatGPT 10:14 response (Yolanda at 10:35, just past range: "I am in love with everything you said!")

**S1-141**
- Type: Principle
- Statement: It is not too much for one program, but it is too much for one *screen*. "The challenge is designing a system that understands how they relate to one another without becoming so complicated that using it feels like a second job."
- Why: Answers her scope concern.
- Standing: ACCEPTED PROPOSAL (10:35)
- Source: L2401 to L2405
- Relationship: Answers S1-018

**S1-142**
- Type: Data model
- Statement: **Hierarchy of dramatic units** (McKee): **Beat → Scene → Sequence → Act → Story**. Each level tracks its own items:
  - Beat: what changes in the exchange.
  - Scene: goal, conflict, outcome, value before and after.
  - Sequence: sequence goal, escalation, cumulative value change.
  - Act: act objective, major conflict, turning point, value shift.
  - Story: controlling idea, overall transformation, final value.
  "Every level should have its own objective and outcome."
- Why: Yolanda's request S1-010 and S1-011.
- Standing: ACCEPTED PROPOSAL
- Source: L2409 to L2429
- Relationship: ADDS TO S1-010 and S1-011. NOTE: "beat" here is McKee's micro beat (action/reaction exchange), a DIFFERENT SUBJECT FROM the Save the Cat beats (S1-076). The program must keep the two senses of "beat" distinct.

**S1-143**
- Type: Story fact (IDW)
- Statement: Example fish-guts sequence broken into three scenes:
  1. The mysterious smell: Control (+) to Uncertainty (-).
  2. The animals arrive: Control to Humiliation.
  3. Anthony confronts Kevin: Superiority to Frustration.
  Sequence objective: Anthony tries to regain control and dignity. Sequence value: Security to Humiliation. Outcome: he wrongly blames Kevin, escalating the war. "The sequence creates a new problem that drives the next sequence." ChatGPT labels these hypothetical.
- Why: Illustrates the hierarchy.
- Standing: EXAMPLE / ILLUSTRATION ("hypothetical scene divisions, not established decisions")
- Source: L2431 to L2479
- Relationship: ADDS TO S1-091 as an illustration only

**S1-144**
- Type: Data model
- Statement: Scene value shifts can be nuanced: positive to negative, negative to positive, positive to more positive, negative to more negative, and **apparently positive to secretly negative**. Change can be one of degree. Record both the **apparent value shift and the actual value shift** when they differ.
- Why: Francine creates situations that seem to benefit a man while advancing her own aim. Useful for mysteries, thrillers, dramatic irony.
- Standing: ACCEPTED PROPOSAL
- Source: L2481 to L2497
- Relationship: ADDS TO S1-009 and S1-084. This nuances the bible's "must be opposites" rule; both remain alive.

**S1-145**
- Type: Feature / Principle
- Statement: **Cause and effect as a first-class feature.** Chronological arrangement is not the same as causal relationship; the causal version "is storytelling." Most writing software only arranges scenes.
- Why: The story's engine.
- Standing: ACCEPTED PROPOSAL
- Source: L2499 to L2515
- Relationship: ADDS TO S1-012 and S1-117

**S1-146**
- Type: Data model
- Statement: Track **Cause → Action → Consequence → Reaction → Decision → Next Action**, which corresponds to Scene and Sequel. Per-scene questions:
  - What caused this scene?
  - What does the viewpoint character want?
  - What opposes it?
  - What actually happens?
  - What value changes?
  - What new problem or opportunity emerges?
  - What decision follows?
  - Which scene does that decision cause?
- Why: Causal chain per scene.
- Standing: ACCEPTED PROPOSAL
- Source: L2517 to L2532
- Relationship: ADDS TO S1-086

**S1-147**
- Type: Feature
- Statement: **Branching causality**: one scene can cause multiple later scenes (e.g. fish guts triggers Anthony's animal crisis, Kevin's paranoia and a neighborhood reaction). The map shows branches and where they converge.
- Why: Real causality branches.
- Standing: ACCEPTED PROPOSAL
- Source: L2534 to L2542
- Relationship: ADDS TO S1-146

**S1-148**
- Type: Data model
- Statement: **Two synchronized timelines**:
  - **Timeline One, Narrative Position**: scene number, act, beat, % through the manuscript, page in 250 and 300 pages.
  - **Timeline Two, Storyworld Time**: date, time, place, elapsed time since the previous incident, day of the feud.
  The example values are illustrative.
- Why: Narrative order and chronological order differ (flashbacks, overlapping POV, events revealed after they occur). Francine's acts happen before the men experience their consequences.
- Standing: ACCEPTED PROPOSAL
- Source: L2544 to L2583
- Relationship: ADDS TO S1-013 and S1-015

**S1-149**
- Type: Data model / Feature
- Statement: Track three times per event:
  1. when it actually happens;
  2. when the reader encounters it;
  3. when the characters learn about it.
  The third "could become one of the program's most distinctive features."
- Why: Misdirection and knowledge flow.
- Standing: ACCEPTED PROPOSAL
- Source: L2585 to L2591
- Relationship: ADDS TO S1-148 and S1-115

**S1-150**
- Type: Data model
- Statement: **Storyworld Database** rather than a single "Location" field. It covers locations with sub-spaces and relationships, e.g.:
  - neighborhood: street configuration, house positions, sidewalks and driveways, common areas, sightlines, where characters can observe one another;
  - Kevin's property: house, driveway, garage, yards, interior rooms;
  - Anthony's property: house, yards, where the siege unfolds;
  - Francine's property: house, porch, garden, observation and manipulation spots, **where she keeps her ledger**.
  Locations are "defined as needed", not all established.
- Why: Yolanda's space requirement (S1-014).
- Standing: ACCEPTED PROPOSAL
- Source: L2593 to L2632
- Relationship: ADDS TO S1-014 and S1-107

**S1-151**
- Type: Feature
- Statement: Locations have relationships with each other, such as sightlines: "Can Francine see Anthony's backyard from her porch?" This "could determine whether an entire scene is physically plausible."
- Why: A plausibility check.
- Standing: ACCEPTED PROPOSAL
- Source: L2634 to L2642
- Relationship: ADDS TO S1-150

**S1-152**
- Type: Data model
- Statement: Optional per-scene atmosphere fields: season; time of day; weather; physical atmosphere; emotional atmosphere; sensory details; environmental consequences (mud after rain, heat affecting odors, darkness limiting visibility). "Weather isn't always background decoration. Sometimes it participates in the plot." Example: a hot summer afternoon versus a cool autumn morning for the fish guts.
- Why: Yolanda's atmosphere requirement (S1-013).
- Standing: ACCEPTED PROPOSAL
- Source: L2644 to L2664
- Relationship: ADDS TO S1-013

**S1-153**
- Type: Data model / Feature
- Statement: Track **dramatic tension separately from scene value**. Dimensions:
  - story value;
  - tension;
  - emotional intensity;
  - for comedy, a fourth: **comic intensity**.
  The novel can be viewed as a visual rhythm (comedy rises, tension rises... the Confession lets vulnerability emerge, the finale combines all three). "Maximum laughter" need not coincide with "maximum dramatic tension"; "Sometimes the quietest scene carries the greatest emotional weight."
- Why: Avoid an emotionally flat manuscript even when plenty is happening.
- Standing: ACCEPTED PROPOSAL
- Source: L2666 to L2712
- Relationship: ADDS TO S1-109 (emotional trajectory) and S1-104

**S1-154**
- Type: Data model / Feature
- Statement: Expanded knowledge tracking per revelation:
  - actual truth;
  - character knowledge;
  - **character belief** (what they think happened);
  - reader knowledge;
  - reader suspicion (what the narrative encourages);
  - revelation (when the truth becomes known).
  A character can hold information yet interpret it wrongly; e.g. Kevin knows Anthony wasn't home but still believes he arranged it. "Those differences are where some of your best comedy and misdirection could originate."
- Why: Misconception-driven comedy.
- Standing: ACCEPTED PROPOSAL
- Source: L2714 to L2737
- Relationship: ADDS TO S1-115 and S1-139

**S1-155**
- Type: Principle
- Statement: Knowledge tracking is "essential for your novel, but optional for other genres." "Not every author needs every tool."
- Why: General-purpose program with optional modules.
- Standing: ACCEPTED PROPOSAL
- Source: L2739 to L2743
- Relationship: ADDS TO S1-006

**S1-156**
- Type: Data model / Feature
- Statement: Setups and payoffs as a **relationship system** (many-to-many: one setup to several payoffs, one payoff from several setups). Any object, action, line of dialogue or motif can be associated with multiple narrative functions. Example: the ledger establishes her score-keeping, expresses personality, documents the true cause, provides the reveal, and gives the men leverage in the finale.
- Why: One object doing several storytelling jobs.
- Standing: ACCEPTED PROPOSAL
- Source: L2745 to L2765
- Relationship: ADDS TO S1-139 and S1-078

**S1-157**
- Type: Feature
- Statement: Diagnostic **"Unpaid Promises"**: flag significant setups with no identified payoff. "Not every detail needs to pay off."
- Why: The author can see whether a deliberate plant earns its place.
- Standing: ACCEPTED PROPOSAL
- Source: L2767 to L2775
- Relationship: ADDS TO S1-156

**S1-158**
- Type: Data model / Feature
- Statement: Conflict at multiple levels: internal, interpersonal, external or environmental. Plus **conflicting objectives within each scene** (Kevin wants Anthony to admit wrongdoing; Anthony wants Kevin to lose composure; both may win, both may fail, or one may appear to win while making things worse). A per-scene conflict diagram: **Kevin's objective → Opposing objective → Turning action → Outcome**, linked to the sequence objective.
- Why: Diagnose scenes that "feel entertaining but aren't advancing the story."
- Standing: ACCEPTED PROPOSAL
- Source: L2777 to L2815
- Relationship: ADDS TO S1-060 and S1-084 (><)

**S1-159**
- Type: Data model / Feature
- Statement: **Motifs and recurring story elements**: an image, object, behavior, phrase or situation whose meaning develops. IDW candidates: the garden, the car, the ledger, watching neighbors, the children's card game, being seen versus overlooked. The garden's arc: barely acknowledged, then the motivation behind everything, then the visible center of connection. Track where motifs appear and how their meaning changes.
- Why: Valuable for literary, historical and multigenerational fiction.
- Standing: ACCEPTED PROPOSAL (the IDW motif list is a POSSIBILITY)
- Source: L2817 to L2846
- Relationship: ADDS TO S1-077 and S1-106

**S1-160**
- Type: Feature / Data model
- Statement: **Planning versus drafting**: two related states, **Planned Story** (what the author intends) and **Written Story** (what is in the manuscript). Example table (hypothetical): Catalyst planned 10%, drafted 13%; Midpoint 50% versus 54%; All Is Lost not drafted; Confession not drafted. Show divergence without treating it as a mistake.
- Why: Plan and manuscript diverge normally.
- Standing: ACCEPTED PROPOSAL
- Source: L2848 to L2879
- Relationship: none

**S1-161**
- Type: Principle
- Statement: "**A writing tool should inform the author, not police the author.**" Sometimes the organically emerging scene is better than the planned one; the program helps the writer recognize and evaluate the change.
- Why: Respects the author.
- Standing: ACCEPTED PROPOSAL
- Source: L2881 to L2887
- Relationship: ADDS TO S1-160 and S1-165

**S1-162**
- Type: Feature
- Statement: **Decision and revision history**: "It should remember how the story evolved." Example: moving the pie scene from 35% to near the midpoint affects its sequence, the surrounding pacing and earlier setups. Show the connected elements without forcing changes, and preserve the earlier version for reversal.
- Why: Yolanda's editability requirement (S1-016).
- Standing: ACCEPTED PROPOSAL
- Source: L2889 to L2911
- Relationship: ADDS TO S1-016. The pie-at-35% example is EXAMPLE / ILLUSTRATION, not story canon.

**S1-163**
- Type: Feature
- Statement: Three core capabilities:
  - **Flexible editing**: add, remove, rename, move or revise any element.
  - **Dependency awareness**: see what may be affected by a change.
  - **Version history**: recover previous structural decisions.
- Why: Safe evolution.
- Standing: ACCEPTED PROPOSAL
- Source: L2913 to L2919
- Relationship: ADDS TO S1-162

**S1-164**
- Type: Data model
- Statement: Status model: preserve the bible's **Decided / Working possibility / Undecided**, and add a fourth, **Drafted and confirmed**, "because something you've actually written may become more authoritative than something you previously planned."
- Why: Authority of the written text.
- Standing: ACCEPTED PROPOSAL
- Source: L2921 to L2931
- Relationship: ADDS TO S1-116 and S1-140. RESTATEMENT OF S1-023 (bible: Decided / example / open).

**S1-165**
- Type: Feature
- Statement: **Story diagnostics** (questions, not verdicts):
  - causality gaps;
  - dead-end scenes;
  - missing value turns;
  - sequence weaknesses;
  - character disappearance;
  - unresolved setups;
  - timeline contradictions (in two places at once);
  - knowledge inconsistencies (acting on information not yet acquired);
  - pacing concerns (beat far from intended placement);
  - thematic disconnects (scenes unrelated to the controlling idea).
- Why: Analyze relationships, not just display them.
- Standing: ACCEPTED PROPOSAL
- Source: L2933 to L2959
- Relationship: ADDS TO S1-079, S1-047, S1-086, S1-157

**S1-166**
- Type: Principle
- Statement: Diagnostics are presented "as **questions worth investigating**, not automatic declarations that something is wrong." A missing value turn might be intentional; a long absence might be necessary; a surprising choice may be what makes a novel distinctive. "An intelligent tool needs to respect the author's creative judgment."
- Why: Author autonomy.
- Standing: ACCEPTED PROPOSAL
- Source: L2961 to L2969
- Relationship: ADDS TO S1-161

**S1-167**
- Type: Principle / Data model
- Statement: Architecture: **one program with a shared story database and specialized modules**, not one enormous tightly coupled app.
- Why: Maintainability.
- Standing: ACCEPTED PROPOSAL
- Source: L2971 to L2977
- Relationship: Answers S1-018

**S1-168**
- Type: Feature
- Statement: Eleven modules:
  1. Story Foundation
  2. Narrative Architecture
  3. Plot Engine
  4. Character Arcs
  5. Storyworld
  6. Dramatic Values
  7. Knowledge & Revelation
  8. Narrative Threads (setups, payoffs, motifs)
  9. Drafting & Revision
  10. Story Diagnostics
  11. Visualization Studio
- Why: Organizes the capabilities.
- Standing: ACCEPTED PROPOSAL
- Source: L2979 to L2993
- Relationship: ADDS TO S1-167

**S1-169**
- Type: Principle
- Statement: "**Enter information once. Use it everywhere.**" A scene defined in the Plot Engine automatically appears in Narrative Architecture, the Storyworld timeline, the Character Arc view and the posters. "You shouldn't need to enter the same information five times."
- Why: "That's how we keep a sophisticated program from becoming exhausting."
- Standing: ACCEPTED PROPOSAL
- Source: L2995 to L3003
- Relationship: ADDS TO S1-020 and S1-127

**S1-170**
- Type: Principle
- Statement: **Protect the joy of writing.** Don't create a system so sophisticated that maintaining it becomes more compelling than finishing I Declare War, "especially for someone who enjoys developing intricate creative systems."
- Why: A genuine risk for Yolanda specifically (bible: overwhelm and freeze).
- Standing: ACCEPTED PROPOSAL
- Source: L3005 to L3017
- Relationship: ADDS TO S1-025

**S1-171**
- Type: Principle / Feature
- Statement: **Progressive complexity.** An author can begin with nothing more than "I have an idea about two neighbors who go to war," and that is enough for a basic story map. Add characters, sequences, scenes, values, locations, timelines and relationships as the story develops. "The map grows with the novel." "There should never be a requirement to complete an enormous questionnaire before using the program."
- Why: Low barrier; matches the Snowflake growth.
- Standing: ACCEPTED PROPOSAL
- Source: L3019 to L3033
- Relationship: ADDS TO S1-007, S1-033, S1-072

**S1-172**
- Type: Feature / Scenario
- Statement: **Quick idea capture with suggested links.**
  1. The author types an idea, e.g. "Francine should have a habit of writing things down in her garden journal."
  2. The program proposes links to her character, the setup, the ledger reveal and the finale.
  3. **The author approves the relevant relationships.**
  4. The maps update.
- Why: "A much more natural creative workflow than making the author manually complete several database forms."
- Standing: ACCEPTED PROPOSAL. The garden-journal habit is EXAMPLE / ILLUSTRATION, not canon.
- Source: L3035 to L3047
- Relationship: ADDS TO S1-016 and S1-171. The garden-journal example possibly relates to the earlier ledger decision (S1-044, S1-100).

**S1-173**
- Type: Feature / UI-UX
- Statement: **Narrative zoom.** Move between levels of detail without losing your place: whole novel on the 48 × 36 poster → select Act Two → its sequences → the animal-siege sequence → its scenes chronologically → Anthony's confrontation with Kevin. At scene level it shows: viewpoint character, objective, opposition, inciting action, turning point, initial and final values, emotional change, time and location, preceding cause, resulting consequence, next scene. "The conceptual heart of the entire program." Zoom out to the forest, in to a tree, and out again without losing the relationship between them.
- Why: Managing a complex novel. It also resolves the poster problem: printed maps are views; the application allows interactive exploration.
- Standing: ACCEPTED PROPOSAL (10:35 "I love it!" for Narrative Zoom)
- Source: L3049 to L3095
- Relationship: ADDS TO S1-142 and S1-124

**S1-174**
- Type: Process
- Statement: Three stages:
  - **Stage One**: build the mapping architecture using I Declare War (information model, scene hierarchy, relationships, timelines, story values, visual conventions) and produce the three printable maps, "to discover what actually works when used for a real novel."
  - **Stage Two**: make the maps editable and interconnected, regenerating posters without manual rebuilding.
  - **Stage Three**: generalize for other authors (customizable structures, alternative frameworks, genre modules, drafting integration, diagnostics, richer visualization).
- Why: Don't build everything at once.
- Standing: ACCEPTED PROPOSAL
- Source: L3097 to L3119
- Relationship: none

**S1-175**
- Type: Principle / Constraint
- Statement: "The eventual program should not force every novel into Save the Cat or McKee. Those are frameworks the author can choose to use, not universal rules the software should impose."
- Why: General-purpose for any novel.
- Standing: ACCEPTED PROPOSAL
- Source: L3121 to L3123
- Relationship: ADDS TO S1-006. Qualifies S1-136 ("3 acts, 15 beats" in the schema), which becomes the IDW default rather than a fixed rule.

**S1-176**
- Type: Data model
- Statement: Three distinct relationship types:
  - **Structural**: scene in sequence in act.
  - **Causal**: event causes consequence, which triggers another event.
  - **Thematic**: scene expresses or transforms a value, belief or idea.
  "We need one interconnected representation of the novel that can be viewed from different perspectives," not a separate database per poster.
- Why: Makes varied visualizations feasible.
- Standing: ACCEPTED PROPOSAL
- Source: L3125 to L3143
- Relationship: ADDS TO S1-127 and S1-169

**S1-177**
- Type: UI-UX
- Statement: Before the first poster, establish a **story-map legend and visual language**. It distinguishes plot strands, character arcs, story values, sequence boundaries, major turning points, causal relationships, thematic relationships, setups and payoffs, and confirmed versus unresolved material. It stays consistent across all three posters and the eventual app: "learning to read the maps once."
- Why: Consistency.
- Standing: ACCEPTED PROPOSAL
- Source: L3145 to L3165
- Relationship: ADDS TO S1-116 and S1-083 (strand color-coding)

**S1-178**
- Type: Principle
- Statement: Guiding principle: "**The system should understand the complexity of the story so the author doesn't have to carry all that complexity in her head.**" The risk to avoid is the program becoming "another enormous creative project that prevents the novel from getting written."
- Why: Mirrors the bible's anchor purpose.
- Standing: ACCEPTED PROPOSAL
- Source: L3167 to L3175
- Relationship: RESTATEMENT OF S1-025 (faithful; it is the same purpose as the bible's "set the load down")

**S1-179**
- Type: Feature (just past range; context)
- Statement: Causal integrity: if scene 2 is weak, it "cannot logically create the next chain reaction" to scenes 3 and 4. "The program needs to be smart enough to see that and identify that and bring it to the author."
- Why: Yolanda's own concern.
- Standing: DECIDED BY YOLANDA
- Source: L3181, 10:35 (just past END)
- Relationship: ADDS TO S1-145 and S1-165 (causality gaps). It goes further than "missing" links to weak links. Another agent will capture the detail.

---

## I. Additional cross-cutting items

**S1-180**
- Type: Not wanted
- Statement: Not wanted:
  - a poster that is a condensed bible, a collection of character profiles, or "a decorative poster with a few plot points";
  - an IT network diagram look;
  - a corporate presentation look.
- Why: She wants a structural, information-rich, beautiful map.
- Standing: ACCEPTED PROPOSAL (ChatGPT's framing endorsed with "you totally get me")
- Source: L1874 to L1876, L2042 to L2044
- Relationship: ADDS TO S1-002

**S1-181**
- Type: Not wanted
- Statement: Not wanted:
  - an enormous mandatory questionnaire before use;
  - entering the same information multiple times;
  - a tool that polices the author;
  - diagnostics phrased as verdicts;
  - forcing Save the Cat or McKee on every novel;
  - a system whose maintenance competes with finishing the novel ("a second job").
- Why: These protect the joy of writing and author judgment.
- Standing: ACCEPTED PROPOSAL
- Source: L2405, L2883, L2961, L3013, L3033, L3121
- Relationship: Collects S1-161, S1-166, S1-170, S1-171, S1-175

**S1-182**
- Type: Principle
- Statement: Examples are always distinguished from decisions in program output. The bible's "One way I could play it, not a decision yet" convention and ChatGPT's repeated caveats ("hypothetical", "illustrative details, not decisions") must carry into the program, e.g. as an "example" status distinct from "working possibility".
- Why: Yolanda's ownership of her story.
- Standing: DECIDED BY YOLANDA (bible) and ACCEPTED PROPOSAL (L2002)
- Source: L21 to L24, L2002, L2465, L2575, L2877
- Relationship: ADDS TO S1-164. Note that S1-164's status list omits a distinct "example" status; see Dropped D6.

**S1-183**
- Type: Scenario
- Statement: Usage scenario: standing in front of the wall poster while drafting a section, she locates the section and understands what it must accomplish and how it affects everything else. On a stuck day she opens only the current beat.
- Why: Combines S1-119, S1-124 and S1-027.
- Standing: ACCEPTED PROPOSAL / DECIDED BY YOLANDA (combined)
- Source: L2052 to L2054, L2084 to L2090, L44 to L58
- Relationship: ADDS TO S1-119

**S1-184**
- Type: Data model
- Statement: Per-character story roles must be supported: co-lead (A story), B-story lead / hidden engine / "true protagonist of her own tale", Buddy Love pairing, and narrator versus non-POV secret-keeper.
- Why: IDW roles show the needed flexibility.
- Standing: DECIDED BY YOLANDA (bible) for co-lead and Buddy Love; EXAMPLE for Francine's role labels
- Source: L367, L470 to L471, L585 to L586
- Relationship: ADDS TO S1-055

---

## Open questions in this section

1. **Map letters.** Which letter means what: is A chronological or relational? See S1-125. Yolanda said "A or B or Hybrid" in answer to a question where A = chronological. Her intent, either way, is that all three views are printable.
2. **Poster size and orientation.** Is it 36 × 48 portrait-ish, 48 × 36 landscape, or 60 × 36? A single poster or a modular wall set (S1-130)?
3. **Target lengths.** Should page estimates be computed for any target length the author enters, or only for 250 and 300? (Yolanda's phrasing implies any length.)
4. **Moral Premise for IDW.** Undecided; candidates are respect/contempt, connection/isolation, humility/pride.
5. **IDW items Yolanda still has to decide in the bible:**
   - the pie mechanics;
   - five-dollar bill placement;
   - fish-guts staging and how much of Francine is seen;
   - the brawl;
   - when Francine's POV opens;
   - the wife's name and connection;
   - Francine's family;
   - the dogs;
   - neighborhood name and chorus;
   - town and era;
   - the make of Kevin's car;
   - whether to use "In Which" titles and an intrusive narrator;
   - Kevin's and Anthony's tuning-fork songs;
   - the Midpoint (false victory or false defeat);
   - whether the reveal lands at All Is Lost "or just before";
   - Theme Stated: who says it.
6. **Real C thread.** Is there one (Francine's family)?
7. **Story timeframe.** Year, season, duration (a week, season or year). Yolanda asked for these to be defined; none is decided.
8. **Status model.** Does it need a separate "Example" status beside Decided / Working possibility / Undecided / Drafted and confirmed?
9. **Two senses of "beat".** How should the program handle McKee's micro-beat versus Save the Cat beats?
10. **Bible Parts Seven to Nine.** The plant-and-payoff tracker, reader-knowledge timeline and Part Nine Ledger are missing from the transcript and must be pulled from the bible itself.
11. **Bonus outputs.** Which of these are in scope: scene-card board, chapter planning sheet, drafting roadmap, revision map, setup/payoff tracker, mystery/reveal integrity map?
12. **Viewing distance.** Desk reference, wall reference, or both? This was raised only in ChatGPT's hidden thoughts.

## Unclear items

- **U1 (S1-100).** The bible says Kevin narrates in first person and POV alternates with Anthony. It is unclear whether Anthony's chapters are also first person, or third person.
- **U2 (S1-125).** The A/B label swap between ChatGPT's "Option A/B" and its question choices. Yolanda's answer is ambiguous about which content the letters denote. The three views coexist regardless.
- **U3 (S1-090 vs S1-091).** The five-dollar bill placement is "open" and "could seed the fish-guts sequence". Yet the fish-guts entry already says Francine acts "while the men are distracted (the five-dollar bill)". So the linkage looks decided while its placement in the book stays open.
- **U4 (S1-130).** ChatGPT's hidden "24-beat spine" contradicts the 15-beat structure. It may be a slip, or it may anticipate including the five finale sub-steps and other sub-beats. Unknown.
- **U5 (S1-084 vs S1-144).** The bible rule says the emotional start and end "must be opposites". ChatGPT's nuance allows "positive to more positive" and similar shifts. Both remain alive; it is unclear which the program enforces (it should probably only question, per S1-166).
- **U6 (S1-109 vs S1-002).** Yolanda asked for "just plot, theme, structure, A/B". ChatGPT's poster scope adds character arcs, set pieces, setup/payoff, the emotional trajectory and a reader-knowledge track. She accepted it with enthusiasm, but this is an expansion rather than an explicit instruction from her.
- **U7 (S1-058, S1-063).** Kevin and Anthony as Positive Change Arcs are "almost certainly" and "likely", not marked Decided.

## Items ChatGPT dropped or distorted when restating

- **D1. The A/B letters flipped.** Option A was the relationship map and Option B the chronological board; at 09:58 A became chronological and B relational. (S1-125)
- **D2. Page counts narrowed.** Yolanda's "250 versus 300 for example" was turned into hard-coded 250 and 300 page columns, at L2170 and again at L2560 to L2561. The general requirement is any target length. (S1-131)
- **D3. Schema hard-codes "3 acts, 15 beats".** This later conflicts with ChatGPT's own principle that the program must not impose Save the Cat or McKee. (S1-136 vs S1-175)
- **D4. The Character Arc Layer is incomplete.** It lists only the Weiland fields (Lie, Ghost, Want, Need, epiphany, final state). It drops from the bible:
  - Ingermanson's Role, Goal, Ambition, Values ("Nothing is more important than"), Conflict, Epiphany;
  - McKee's three-level forces of antagonism per character, including Francine (which Yolanda "insisted on, rightly");
  - the value scale with degrees down to contempt wearing a polite face;
  - multiple arcs on different values for one character (Francine Flat on respect, Positive on loneliness);
  - the Deep Character Template blocks;
  - the off-page casting tuning forks and theme music / playlist.
  Later modules partially restore antagonism as scene-level "conflict at multiple levels" (S1-158), but not per character.
- **D5. Theme Layer uses the undecided example.** It lists "respect vs contempt" and "isolation vs connection" as if fixed. The Moral Premise is explicitly undecided in the bible.
- **D6. The status model drops "example".** ChatGPT says to "preserve your existing distinction between Decided / Working possibility / Undecided". The bible's actual three-way convention is Decided / "One way I could play it, not a decision yet" (example) / Still open. The bible's "example" status, which is never a decision, is folded into "working possibility", and an example is not the same as a working possibility. (S1-164, S1-182)
- **D7. Bible-specific tools absent from the schema and modules.** These were not carried into the master schema or the module list:
  - the "When I'm Stuck, Start Here" single-beat focus;
  - the Teach / Show / Hand-it-to-me rhythm;
  - the Snyder board's four rows of about 40 cards with strand color-coding;
  - the +/- and >< card symbols;
  - the Opening/Final Image mirror pair;
  - the finale's five sub-steps;
  - the "Also known as" cross-framework names per beat;
  - the logline template;
  - the five-sentence paragraph;
  - the In Which chapter titles;
  - POV-per-scene and the no-head-hopping rule.
  Some are implied by "scene-card board" and the knowledge layer, but none is named. Omission does not cancel them.
- **D8. The two meanings of "set pieces" were collapsed.** Yolanda's 10:14 "set pieces like each person's house or the neighborhood" means physical settings. ChatGPT correctly turned it into a Storyworld Database, but the schema's "Set Pieces" layer remains the comedic scenes. Both concepts are needed. (S1-014)
- **D9. Not restated: discovery versus win as distinct event types.** Only the IDW ledger example was mentioned. The general "Finding is not winning" rule (S1-042) and "a disaster is a reversal, never a win" (S1-041) were not carried into the data model. They should be distinct event classifications.
- **D10. Not restated: two bible craft rules.**
  - Threads resolve now versus deliberately held open (the serialized TV point, S1-082), which is relevant to generality.
  - Beat-level "weak vs strong" tests, which are only partly reflected in diagnostics.
