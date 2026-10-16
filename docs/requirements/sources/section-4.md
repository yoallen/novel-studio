# Requirements Register: Section 4 (lines 9084 to 12133)

Range covered: 2026-10-14 14:30 ET to 2026-10-14 15:16 ET. I read every line from 9070 to 12143.

## Character of this section

This section is almost entirely ChatGPT working on poster production. Yolanda speaks eight times, all of them short:

- 9086: asks whether the images are now story-correct and good enough to print, both as extra-large wall posters and as normal documents on her own printer.
- 9157: "why do we need to do to get this really ready for me?"
- 9322: "Ok. Please start."
- 9631: "Looks good. Please continue."
- 10260: "Okay I am trusting the process. Please continue."
- 10790, 11424 and 12136: "Please continue."

Her "Ok. Please start." is an explicit acceptance of the production plan ChatGPT laid out at 9163 to 9318. After that she says "please continue" without engaging with any specific content. Treat the poster content produced afterward as UNANSWERED PROPOSAL, or as a ChatGPT RESTATEMENT of earlier decisions. Her "continue" responses are not approval of specific content.

The range also contains a large tool-output excerpt of the **I Declare War Story Bible v5 (10-13-26)** (lines 9345 to 9436). It is written in Yolanda's first-person voice ("my wall charts", "Mine to write"). It is a snapshot of earlier decisions, so those items are tagged as restatements. Their standing follows the Bible's own labels ("Decided" versus "One way I could play it, not a decision yet").

The JSON "verified_story_foundation_v1" (lines 9446 and 9781 to 9930) holds "user_overrides" dated October 14. These overrides record decisions Yolanda made before this section.

---

## A. Yolanda's concerns, scenarios and acceptance criteria

**S4-001**
- Type: Scenario / Constraint
- Statement: Yolanda wants each poster image to be (a) correct in story details and (b) high enough in pixel quality to print both as an extra-large wall poster and as a normal document on her home printer.
- Why: She is about to spend money on printing and needs to trust what is on her wall.
- Standing: DECIDED BY YOLANDA ("correct with regard to story details, at the proper pixel quality for printing as an extra large wall poster and/or a normal document on my printer")
- Source: 9086, 14:30
- Relationship: Possibly relates to an earlier decision. She had asked for higher pixel quality before this section (ChatGPT admits this at 9149).

**S4-002**
- Type: Not wanted / Scenario
- Statement: Frustration: ChatGPT had earlier given the impression that the posters were finished and corrected. When she asked for higher resolution, it produced new images at the same low resolution (about 1448 × 1086). She does not want to be told something is ready when it is not.
- Why: ChatGPT apologized: "when you previously requested higher pixel quality, I generated revised images without actually delivering the required print resolution." She found out only because she asked directly.
- Standing: DECIDED BY YOLANDA (implied by her direct question; ChatGPT conceded)
- Source: 9094 to 9153, 14:30
- Relationship: Possibly relates to an earlier decision (her earlier high-resolution request).

**S4-003**
- Type: Principle
- Statement: Honest readiness status. The program, and any assistant inside it, must never claim a deliverable is accurate or print-ready unless that has been verified. Status must be stated plainly: "visually developed, but not yet approved for printing."
- Why: Protects her printing investment and her trust. "I would rather tell you that plainly than have you pay for ten beautiful posters containing blurry text or incorrect details about your own novel."
- Standing: UNANSWERED PROPOSAL (ChatGPT's commitment). It responds directly to S4-001 and S4-002.
- Source: 9145 to 9153
- Relationship: ADDS TO S4-002

**S4-004**
- Type: Process
- Statement: Yolanda asked what is needed to make the posters "really ready for me."
- Why: She wants a finished, trustworthy product, not prototypes.
- Standing: DECIDED BY YOLANDA ("why do we need to do to get this really ready for me?")
- Source: 9157, 14:33
- Relationship: ADDS TO S4-001

**S4-005**
- Type: Process
- Statement: Yolanda approved the five-stage poster production plan and asked ChatGPT to begin.
- Why: She accepted the plan as the route to "really ready."
- Standing: ACCEPTED PROPOSAL ("Ok. Please start.")
- Source: 9322, 14:36
- Relationship: Accepts S4-010 through S4-030.

**S4-006**
- Type: Process
- Statement: After seeing the first vector Chronological Story Map preview, Yolanda said it looked good and asked ChatGPT to continue.
- Why: General approval of the direction: vector text with verified and undecided content kept separate. This was not a line-by-line content sign-off.
- Standing: ACCEPTED PROPOSAL ("Looks good. Please continue.")
- Source: 9631, 14:41
- Relationship: ADDS TO S4-005

**S4-007**
- Type: Process
- Statement: Yolanda is trusting the process and delegating continued production. She does not review each draft in detail.
- Why: Not stated. This reflects her work style: she wants the work carried forward without her having to manage every piece.
- Standing: DECIDED BY YOLANDA ("Okay I am trusting the process. Please continue.")
- Source: 10260, 14:52; also 10790, 11424, 12136
- Relationship: ADDS TO S4-006

---

## B. Diagnosis of the old AI posters (problems found)

**S4-008**
- Type: Not wanted
- Statement: Error found in one Chronological Story Map version: Kevin is shown as the primary narrator and Anthony appears only occasionally. This is wrong. The POV is alternating first-person between Kevin and Anthony.
- Why: It contradicts the story bible.
- Standing: DECIDED BY YOLANDA (alternating POV, per Bible). ChatGPT identified the error.
- Source: 9106
- Relationship: Possibly relates to an earlier decision (alternating POV). See S4-062.

**S4-009**
- Type: Not wanted
- Statement: Errors found in other poster versions:
  - The Narrative Relationship Map showed Kevin and Anthony as teenagers and added personality details she never established.
  - The Story Command Center replaced the standard Save the Cat beat names with invented events while still calling them "the 15 beats."
  - The companion maps presented proposed motivations, scene events and resolutions as established facts.
  - The Fish-Guts Sequence had Kevin placing the fish guts. It must be Francine, and the distraction's execution must stay undecided.
- Why: "These are not merely cosmetic issues. They affect the integrity of your story."
- Standing: DECIDED BY YOLANDA (the underlying facts were decided earlier). ChatGPT is diagnosing.
- Source: 9104 to 9112
- Relationship: Possibly relates to earlier decisions (the men are adults; Francine is the perpetrator).

**S4-010**
- Type: Constraint
- Statement: The AI images are about 1,448 × 1,086 px. At 60×45 in that is 24 PPI; at 48×36 in, 30 PPI; at 24×18 in, 60 PPI (blurry); at 11×8.25 in, 132 PPI (usable for review); at 8×6 in, 181 PPI (text too small). Upscaling cannot fix misgenerated letters or wrong content.
- Why: This explains why the AI images cannot be the print masters.
- Standing: UNANSWERED PROPOSAL (technical analysis)
- Source: 9116 to 9128

**S4-011**
- Type: Not wanted
- Statement: Do not use AI-generated images as the source for words, numbers or tiny lettering. "Illustrative AI posters should NOT be used as print sources for tiny wording."
- Why: Image generators misspell text and invent content.
- Standing: UNANSWERED PROPOSAL (implicitly accepted through S4-005)
- Source: 9128, 9208, 12024 (QA report)
- Relationship: ADDS TO S4-010

---

## C. Production plan and standards (accepted at 9322)

**S4-012**
- Type: Process
- Statement: Turn the posters from "beautiful AI-generated illustrations into professionally produced, fact-checked publishing files."
- Why: Accuracy and print quality.
- Standing: ACCEPTED PROPOSAL
- Source: 9165

**S4-013**
- Type: Process / Data model
- Statement: Stage 1: the story bible is the source of truth. Review every poster against the October 13, 2026 story bible. The deliverable is a single "verified master story-data file from which every poster draws its information."
- Why: Prevents invented motivations, events and plot developments.
- Standing: ACCEPTED PROPOSAL
- Source: 9175 to 9192
- Relationship: This anticipates the Story Brain data model: one source of truth with many views.

**S4-014**
- Type: Data model
- Statement: Four-way classification of every statement:
  - **Established**: you have made this creative decision.
  - **Developing**: you are exploring possibilities but have not decided.
  - **Unanswered**: you have identified something you still need to figure out.
  - **Illustrative**: an example created to demonstrate a storytelling principle, not a story decision.
- Why: "This will prevent us from accidentally inventing character motivations, scene events, or plot developments."
- Standing: ACCEPTED PROPOSAL
- Source: 9179 to 9188
- Relationship: Possibly relates to an earlier decision (Yolanda's "Questions I Have" and "Ideas I'm Thinking About" sections, and her separation of decided from undecided). See S4-033 and S4-034. Later posters collapse it to three labels (S4-031).

**S4-015**
- Type: Story fact (IDW)
- Statement: Fish-guts incident: Francine is the perpetrator. The specific way the distraction is executed stays undecided.
- Why: This was Yolanda's correction.
- Standing: DECIDED BY YOLANDA (earlier). Restated here.
- Source: 9110, 9190
- Relationship: RESTATEMENT of an earlier decision. See S4-071.

**S4-016**
- Type: Principle
- Statement: Function versus execution: "a story event can be established even when the specific way it happens remains undecided." The program must allow an event's existence and dramatic function to be locked while its execution stays open.
- Why: This is how Yolanda decides things. She knows what must happen before she knows how.
- Standing: ACCEPTED PROPOSAL (articulated by ChatGPT, built on her fish-guts correction)
- Source: 9200
- Relationship: ADDS TO S4-014. The Fish-Guts poster subtitle restates it as "Story functions fixed • execution choices protected" (10142).

**S4-017**
- Type: Process
- Statement: Stage 2: reconcile all ten posters with the master file. Check the Save the Cat beats, approximate percentages and page calculations, McKee's principles, character relationships, alternating POVs, and the ledger's discovery and later use. The deliverable is a content-approved specification for each poster.
- Why: Accuracy.
- Standing: ACCEPTED PROPOSAL
- Source: 9194 to 9202

**S4-018**
- Type: Process / UI-UX
- Statement: Stage 3: rebuild the posters as editable designs. Text, arrows, timelines, labels and tables become independent vector elements. Keep the illustrated neighborhood scenes, portraits, flowers and the purple-and-gold visual identity she loves.
- Why: Three gains: perfect spelling and numbers, sharp text at any size, and the ability to revise individual details later.
- Standing: ACCEPTED PROPOSAL
- Source: 9204 to 9216
- Relationship: Possibly relates to an earlier decision (her love of the illustrated look and the purple-and-gold palette).

**S4-019**
- Type: Constraint / Feature
- Statement: Three print editions, each built for its use rather than resized from one image:
  - **Large wall poster**: 48 × 36 in, her primary story-planning wall.
  - **Extra-large wall poster**: 60 × 45 in, for maximum visibility and detailed study.
  - **Desk reference**: 8.5 × 11 in, for reviewing at her desk.
- Why: Each use needs its own design.
- Standing: ACCEPTED PROPOSAL
- Source: 9220 to 9228
- Relationship: ADDS TO S4-001

**S4-020**
- Type: Behavior
- Statement: The two wall sizes share one vector design because they have the same 4:3 proportions. The desk editions must be reflowed for legibility, and dense posters may span two or more pages. They must not be miniature copies of the wall posters.
- Why: Readability on letter paper.
- Standing: ACCEPTED PROPOSAL
- Source: 9139, 9228 to 9232
- Relationship: ADDS TO S4-019

**S4-021**
- Type: Process
- Statement: Stage 5: final quality control at the intended print dimensions. Check legibility, page numbers, arrows, diagram connections, margins and image sharpness. Confirm no new story inaccuracies were introduced. Make an actual-size proof print of the portion with the smallest text.
- Why: Protects the printing investment.
- Standing: ACCEPTED PROPOSAL
- Source: 9236 to 9246

**S4-022**
- Type: Feature
- Statement: Editable source files are required, so story details can be revised without recreating the artwork.
- Why: The story will keep changing.
- Standing: ACCEPTED PROPOSAL
- Source: 9139, 9316

**S4-023**
- Type: Feature
- Statement: The ten-poster collection:
  - Three master maps: Chronological Story Map, Narrative Relationship Map, Story Command Center.
  - Five companions: Act I, Act IIA, Act IIB, Act III, Fish-Guts Sequence.
  - Two new companions: Character Depth & Integrity, and McKee's Dramatic Engine (later produced as "The Dramatic Gap · McKee Lens").
- Why: Restated as "the collection we discussed."
- Standing: ACCEPTED PROPOSAL. The collection was likely set earlier; the two new companions may be new in or near this section.
- Source: 9250 to 9258
- Relationship: RESTATEMENT of an earlier collection decision, plus additions.

**S4-024**
- Type: Principle
- Statement: The Character Depth & Integrity and McKee companions are designed to work for future novels, not only IDW. The McKee poster subtitle reads "An analytical companion that can be reused across novels • not new story canon."
- Why: The program is general-purpose.
- Standing: ACCEPTED PROPOSAL
- Source: 9260, 11615
- Relationship: ADDS TO S4-023

**S4-025**
- Type: Process / Not wanted
- Statement: Do not regenerate all ten posters at once "and hope they're correct." Build one finished, production-quality poster as the standard first (the Chronological Story Map), then apply its standards to the other nine.
- Why: Mass regeneration created the earlier errors.
- Standing: ACCEPTED PROPOSAL (at 9322)
- Source: 9262 to 9274
- Relationship: ChatGPT did not follow this. It went on to draft all ten before finishing the first (see Dropped/Distorted).

**S4-026**
- Type: Principle
- Statement: Do not interrupt the author with questions that do not need answers now. Preserve unresolved creative decisions as unresolved.
- Why: Respects her flow and her focus on writing.
- Standing: ACCEPTED PROPOSAL
- Source: 9280 to 9282

**S4-027**
- Type: Principle / Not wanted
- Statement: Planning artifacts must never become a requirement to finish developing every character and plot point before she can write. Posters show "the story as it exists today, including the unanswered questions."
- Why: The whole purpose is getting her back to writing.
- Standing: ACCEPTED PROPOSAL
- Source: 9284 to 9288
- Relationship: Possibly relates to an earlier decision (her "WRITE THE DAMN BOOK" goal).

**S4-028**
- Type: Process (acceptance test)
- Statement: Every finished poster must pass three integrity tests:
  - **Story integrity**: every statement is faithful to her decisions, with possibilities clearly distinguished.
  - **Visual integrity**: the hierarchy, relationships and diagrams are clear.
  - **Print integrity**: it prints sharp at its intended size.
  - "Until all three pass, it isn't finished."
- Why: A definition of done.
- Standing: ACCEPTED PROPOSAL
- Source: 9290 to 9300

**S4-029**
- Type: Principle (acceptance test)
- Statement: Fourth, personal test: "Does this poster make it easier for you to understand your story and get back to writing?" "That is the entire reason we're doing this."
- Why: The ultimate success criterion for every program artifact.
- Standing: ACCEPTED PROPOSAL
- Source: 9302 to 9306
- Relationship: ADDS TO S4-028

**S4-030**
- Type: Process
- Statement: Order of work: first the verified story-data foundation, then the Chronological Story Map as the first print-ready master. That foundation will eventually serve "the Story Brain application."
- Why: The data layer comes first; views are built on top of it.
- Standing: ACCEPTED PROPOSAL
- Source: 9308 to 9316
- Relationship: Possibly relates to the earlier Story Brain concept.

**S4-031**
- Type: Feature
- Statement: The goal is a "coordinated, editable, accurate visual storytelling system" that she can put on her wall, reference while writing, and update as the novel develops. That is the standard to meet "before you spend a dime at the printer."
- Why: Restates the overall goal.
- Standing: ACCEPTED PROPOSAL
- Source: 9316 to 9318

---

## D. Labels, legend and UI conventions shown on the vector drafts

**S4-032**
- Type: UI-UX
- Statement: Each poster header carries a three-label legend: "ESTABLISHED FACT" (green #197250), "OPEN / DEVELOPING" (amber #9D6929), "ILLUSTRATIVE LENS (NOT CANON)" (magenta #864070).
- Why: Readers can tell canon from possibility at a glance.
- Standing: UNANSWERED PROPOSAL (in drafts she only said "continue" to)
- Source: 10085 to 10087
- Relationship: RESTATEMENT of S4-014, collapsed from four categories to three. "Developing" and "Unanswered" are merged into one label.

**S4-033**
- Type: UI-UX / Feature
- Statement: The Story Command Center has a "STORY BRAIN · KEEP WHAT YOU KNOW SEPARATE FROM WHAT YOU ARE EXPLORING" band with three columns:
  - **CONFIRMED**: "What belongs to the novel."
  - **QUESTIONS I HAVE**: "Unresolved, not writing failures."
  - **IDEAS I'M THINKING ABOUT**: "Possibilities, not facts."
- Why: ChatGPT says these were "the two sections you requested."
- Standing: DECIDED BY YOLANDA for the "Questions I Have" and "Ideas I'm Thinking About" sections (her earlier request, restated here). The layout is ChatGPT's.
- Source: 10633 to 10636, 10739
- Relationship: Possibly relates to an earlier decision (her request for these two sections). ALTERNATIVE TO S4-014's vocabulary: these are her own words for Unanswered and Developing.

**S4-034**
- Type: Principle
- Statement: Open questions are "unresolved, not writing failures." Questions should be "retrievable, not blocking."
- Why: Removes the shame of not knowing, and keeps questions out of the way of drafting.
- Standing: UNANSWERED PROPOSAL (phrasing). Consistent with her earlier intent.
- Source: 10635, 11204
- Relationship: ADDS TO S4-033

**S4-035**
- Type: Principle / Feature
- Statement: "THE WRITING RULE: Capture the thought. Keep the connection. Return to writing. Do not require every question to be answered."
- Why: This is the core loop the program must support: quick capture, link it, get back to the manuscript.
- Standing: UNANSWERED PROPOSAL, though it closely mirrors her earlier stated goals (Return to Writing)
- Source: 10637 to 10639
- Relationship: Possibly relates to earlier decisions (the Return to Writing and Writing Trail concepts).

**S4-036**
- Type: UI-UX
- Statement: Poster visual system:
  - Deep purple (#291335 / #2B1438) header band, with "I DECLARE WAR" in gold (#DEB94E / #D8B34C) at the top.
  - Cream background (#FFF9EC / #FFFCF4).
  - Pastel card fills: lilac, pink, blue, green, orange.
  - Rounded cards, numbered purple circles for beats, purple section bars with cream text, arrows between flow cards.
- Why: Matches the purple-and-gold identity she loved.
- Standing: UNANSWERED PROPOSAL (implementation of the accepted S4-018)
- Source: 9461, 10050, 10078 to 10097

**S4-037**
- Type: UI-UX / Data model
- Statement: Every poster footer shows provenance and status: "SOURCE: I Declare War Story Bible v5 (October 13, 2026) + author clarifications (October 14, 2026)" and "Production draft • Vector typography • Review creative interpretations before final printing." The Chronological map shows "Version 1 | Source: … | User clarifications through October 14, 2026."
- Why: Traceability. You can always see which version of the truth a view came from.
- Standing: UNANSWERED PROPOSAL
- Source: 9470, 10095 to 10097
- Relationship: Implies versioned source data plus dated author clarifications.

**S4-038**
- Type: UI-UX
- Statement: "HOW TO READ THIS MAP: A beat is a structural function, not a commitment to an invented scene. Page positions are approximate."
- Why: Prevents structure from being read as canon.
- Standing: UNANSWERED PROPOSAL
- Source: 9473 to 9474
- Relationship: ADDS TO S4-016

---

## E. Verified Story Foundation (data model) and IDW facts it records

**S4-039**
- Type: Data model
- Statement: verified_story_foundation_v1.json has these fields: title; source; source_date; user_overrides[]; established[]; undecided[]; beats[] (each with number, name, position, story_function, decision_status); print_specs (vector_pdf_inches [[48,36],[60,45]]; desk_reference "11 x 8.5 landscape, reflowed").
- Why: This is the single source for all posters, and a prototype of the program's data model. Author overrides are kept distinct from the base source.
- Standing: UNANSWERED PROPOSAL (implements the accepted S4-013)
- Source: 9446, 9781 to 9930
- Relationship: ADDS TO S4-013. Note: the desk reference here is "11 x 8.5 landscape," while S4-019 and the later reader use 8.5×11 portrait (UNCLEAR, minor).

**S4-040**
- Type: Data model / Principle
- Statement: Each beat carries both a "story_function" (what the beat must do) and a "decision_status" (what is decided and what is undecided about it).
- Why: Implements the function-versus-execution distinction.
- Standing: UNANSWERED PROPOSAL
- Source: 9430 to 9444
- Relationship: ADDS TO S4-016

**S4-041**
- Type: Story fact (IDW)
- Statement: All three leads (Kevin Wickley, Anthony Vernon, Miss Francine Ellington) are African American.
- Why: This is Yolanda's override of earlier AI depictions.
- Standing: DECIDED BY YOLANDA (earlier; recorded as a "user_override")
- Source: 9446, 9786
- Relationship: RESTATEMENT of an earlier decision.

**S4-042**
- Type: Story fact (IDW)
- Statement: The neighborhood is racially diverse.
- Standing: DECIDED BY YOLANDA (earlier; user_override)
- Source: 9446, 9787
- Relationship: RESTATEMENT of an earlier decision.

**S4-043**
- Type: Story fact (IDW)
- Statement: A distraction enables Francine to place the fish guts. The five-dollar bill is "only a candidate, not canon."
- Standing: DECIDED BY YOLANDA (earlier; user_override)
- Source: 9446, 9788
- Relationship: REPLACES S4-071 (Bible v5 marked the five-dollar bill as "Decided"). This is an explicit user override of the Bible.

**S4-044**
- Type: Story fact (IDW)
- Statement: Kevin and Anthony are co-leads of the visible neighborhood feud.
- Standing: DECIDED BY YOLANDA (per Bible). Restated.
- Source: 9791

**S4-045**
- Type: Story fact (IDW)
- Statement: Miss Francine Ellington orchestrates the feud in response to damage the men's dogs did to her garden.
- Standing: DECIDED BY YOLANDA (restated)
- Source: 9792

**S4-046**
- Type: Story fact (IDW)
- Statement: Kevin and Anthony narrate in alternating first-person POV, with one head per scene or chapter.
- Standing: DECIDED BY YOLANDA (restated)
- Source: 9793

**S4-047**
- Type: Story fact (IDW)
- Statement: Francine's interior perspective is withheld until the ledger reveal.
- Standing: DECIDED BY YOLANDA (restated)
- Source: 9794, 9399

**S4-048**
- Type: Story fact (IDW)
- Statement: Francine puts the fish guts in Anthony's yard while both men are distracted.
- Standing: DECIDED BY YOLANDA
- Source: 9795

**S4-049**
- Type: Story fact (IDW)
- Statement: The smell is unexplained at first. Animals appear later: cats, then raccoons.
- Standing: DECIDED BY YOLANDA (per Bible "Decided"). The Bible text at 9319 is truncated after "cats, then"; the JSON says raccoons.
- Source: 9319, 9796

**S4-050**
- Type: Story fact (IDW)
- Statement: Anthony blames Kevin. Kevin truthfully denies it.
- Standing: DECIDED BY YOLANDA
- Source: 9797

**S4-051**
- Type: Story fact (IDW)
- Statement: Francine's ledger is found near All Is Lost (about 75%) and wielded in the Finale.
- Standing: DECIDED BY YOLANDA
- Source: 9798, 9380, 9426

**S4-052**
- Type: Story fact (IDW)
- Statement: The Confession is a quiet emotional scene that never names loneliness.
- Standing: DECIDED BY YOLANDA
- Source: 9799, 9335

**S4-053**
- Type: Story fact (IDW)
- Statement: "Opening and final images mirror the treatment of Francine and her garden."
- Standing: UNCLEAR. Listed as "established," but the Bible's Final Image text (9280 to 9282) only says the final image mirrors the opening (same street and people, the broken thing now whole). The focus on Francine and her garden may be ChatGPT's interpretation.
- Source: 9800
- Relationship: RESTATEMENT with possible added specificity.

**S4-054**
- Type: Story fact (IDW) / Open question
- Statement: Undecided list:
  - the specific distraction mechanism, including whether to use the five-dollar bill
  - the Midpoint event and whether it is a false victory or false defeat
  - the specific Catalyst event
  - the exact moral premise wording
  - the precise town and season, dog details, and ancillary cast specifics
  - the exact sequence of pranks and scene-level outcomes
- Standing: DECIDED BY YOLANDA that these are open (consistent with the Bible)
- Source: 9802 to 9808

---

## F. Story Bible v5 excerpts surfaced in this range (lines 9345 to 9436)

These are restatements of the October 13 Bible. They are captured because they reveal craft frameworks and program behavior.

**S4-055**
- Type: Principle (craft framework)
- Statement: "These frameworks all map to one another." Crossing the First Threshold = Break into Two = First Plot Point. Yolanda's own wall charts prove the mapping.
- Why: "The liberating part." One turn can carry many framework names, so the program should cross-map frameworks rather than force her to pick one.
- Standing: DECIDED BY YOLANDA (Bible, her voice: "the thing my own wall charts prove")
- Source: 9345
- Relationship: RESTATEMENT of an earlier decision.

**S4-056**
- Type: Data model (craft framework)
- Statement: Cross-framework equivalences:
  - **Inciting spark (~10%)**: Catalyst = Inciting Incident = Inciting Event = Call to Adventure.
  - **Commitment turn (~20%)**: Break into Two = First Plot Point = Crossing the First Threshold = Point of No Return = Ingermanson's disaster one.
  - **Great middle turn (50%)**: Midpoint = Turning Point = Moment of Truth = Mid-Act Climax = the flip from false to true Moral Premise = Ingermanson's disaster two.
  - **Low point (~75%)**: All Is Lost = Third Plot Point = Inmost Cave = Crisis = Dark Night approaching = Ingermanson's disaster three.
- Standing: DECIDED BY YOLANDA (Bible)
- Source: 9306 to 9309, 9347
- Relationship: ADDS TO S4-055

**S4-057**
- Type: Feature (craft framework)
- Statement: Save the Cat board template: a fill-in logline from her wall board ("On the verge of [stasis equals death], a [flawed protagonist] breaks into two, but when [the mi…"). She "reserve[s] the right to modify it, which I should."
- Why: Templates are starting points she can edit, not fixed forms.
- Standing: DECIDED BY YOLANDA
- Source: 9346

**S4-058**
- Type: Principle (story distinction)
- Statement: "A Disaster Is Not a Win." A discovery is a hidden truth landing on the character: information, a gut-punch. A win is something else, and the two must never be blurred. For the ledger: discovery at disaster three (All Is Lost), win in the finale when they wield it, "their one real card against a woman they could never out-think, and she takes the war back warmly anyway."
- Standing: DECIDED BY YOLANDA
- Source: 9348 to 9350, 9380
- Relationship: ADDS TO S4-051

**S4-059**
- Type: Story fact (IDW) / Craft framework
- Statement: Moral Premise (Stanley Williams). The characters start living the false half of the premise (the vice gets them what they want). At disaster two, near the midpoint, they flip to the true half.
- Standing: DECIDED BY YOLANDA (structure). The exact wording is undecided (S4-054).
- Source: 9351

**S4-060**
- Type: Craft framework
- Statement: Weiland chain: Ghost (past wound) plants the Lie (a false belief that felt protective), then Want and Need. These four "are not a list, they are a chain." Three arc types: Positive Change, Flat, and (implicitly) Negative.
- Standing: DECIDED BY YOLANDA (as a framework in use)
- Source: 9352 to 9353

**S4-061**
- Type: Story fact (IDW)
- Statement: On respect, Francine is a Flat Arc. She knows her worth from page one and does not learn respect. She makes the world catch up to what she already knows, and uses that self-respect to force Kevin and Anthony to change.
- Standing: DECIDED BY YOLANDA
- Source: 9354
- Relationship: The Character Depth poster (11602) adds "A flat-arc truth-holder can still undergo a loneliness-to-aliveness change." That addition is ChatGPT's (UNANSWERED PROPOSAL), possibly from an earlier discussion.

**S4-062**
- Type: Craft framework / Story fact (IDW)
- Statement: Ingermanson: not every character needs every field. The antagonist-type character (Francine, "though she is no villain") often gets the richest synopsis. Fill the main characters fully and give supporting characters less.
- Why: Avoids "dossier" overload.
- Standing: DECIDED BY YOLANDA
- Source: 9355

**S4-063**
- Type: Process / Story fact (IDW)
- Statement: "Here's where I take over. Name the wife, the family, and the dogs when I am ready. Run each through the five-dollar bill test so no two of them react the same way. Mine to build."
- Why: Ancillary cast naming is reserved for the author. The five-dollar bill test is a character-differentiation tool.
- Standing: DECIDED BY YOLANDA
- Source: 9356
- Relationship: DIFFERENT SUBJECT FROM S4-043. Here "five-dollar bill test" is a characterization method; S4-043 concerns the plot distraction.

**S4-064**
- Type: UI-UX / Principle
- Statement: The Bible uses handoff markers: "Here's where I take over," "Over to me," "Mine to write," "Mine to build," "Mine to escalate." These mark parts the author writes herself, in her own voice.
- Why: The tool must never write the parts the author reserves for herself.
- Standing: DECIDED BY YOLANDA
- Source: 9356, 9371, 9373, 9378, 9395, 9401

**S4-065**
- Type: UI-UX / Data model
- Statement: The Bible labels possibilities as "One way I could play it, not a decision yet," and decisions as "Decided."
- Why: Keeps examples from becoming canon. This is a direct ancestor of the program's status labels.
- Standing: DECIDED BY YOLANDA
- Source: 9371, 9373, 9378, 9385
- Relationship: ADDS TO S4-014

**S4-066**
- Type: Craft framework
- Statement: The 15 Save the Cat beats are placed by percentage of the manuscript, using Brody's novel adaptation. Each beat is also named in the other frameworks. Each beat section has: "What this beat really does," "How to make it land, and how it fails," "Also known as," and "One way I could play it."
- Why: This is her teaching format for beats, consistent with her stored preference for fully taught concepts.
- Standing: DECIDED BY YOLANDA
- Source: 9357 to 9383

**S4-067**
- Type: Story fact (IDW)
- Statement: The Midpoint is not decided. The author decides whether it is a false victory or a false defeat, and plants the first seed of the men realizing they have been manipulated. It is "the single most important turn."
- Standing: POSSIBILITY / open (Bible: "not a decision yet")
- Source: 9371

**S4-068**
- Type: Story fact (IDW)
- Statement: Bad Guys Close In: Francine "flex[es] her power here as the men start hunting her."
- Standing: POSSIBILITY ("One way I could play it, not a decision yet")
- Source: 9373
- Relationship: UNCLEAR. "Men start hunting her" before All Is Lost may conflict with the men only discovering her role at about 75%. Possibly an earlier idea.

**S4-069**
- Type: Story fact (IDW)
- Statement: Dark Night: the Confession scene, where Kevin and Anthony, "now allies by necessity," actually talk. They confide sideways, hands busy, letting the loneliness show without naming it. This is "the emotional floor of the book."
- Standing: DECIDED BY YOLANDA (that the Confession sits here is "likely"). Writing it is "Mine to write."
- Source: 9375 to 9378

**S4-070**
- Type: Craft framework
- Statement: Her board prints the Hero's NEED at Break into Three and the WANT at Break into Two. The Final Image board options are "Hero is changed (happy ending)" or "Hero rejects change."
- Standing: DECIDED BY YOLANDA (her board)
- Source: 9379, 9381

**S4-071**
- Type: Story fact (IDW)
- Statement: Bible v5 "Decided": a five-dollar bill on the sidewalk between the houses. Kevin suspects it is bait from Anthony, refuses to touch it, and photographs it as evidence. Anthony picks it up slowly while holding eye contact, purely to watch Kevin react.
- Standing: REJECTED as canon. Superseded by Yolanda's October 14 override, which makes it only a candidate.
- Source: 9391
- Relationship: REPLACED BY S4-043.

**S4-072**
- Type: Craft principle
- Statement: Why the fish-guts sequence works:
  - **Delayed payoff**: protect the gap between cause and effect so the reader almost forgets, then the animals arrive.
  - **Escalate the reaction, not the event**: the fish guts never grow; Anthony gets more upset.
- Standing: DECIDED BY YOLANDA (Bible)
- Source: 9320

**S4-073**
- Type: Craft principle / Story fact
- Statement: Alternating POV is not head-hopping. "Change heads only at a seam, never inside a scene." Head-hopping breaks the reader's trust and the misdirect.
- Standing: DECIDED BY YOLANDA
- Source: 9341, 9348, 9352

**S4-074**
- Type: Story fact (IDW)
- Statement: Bible POV line: "Kevin narrates in first person, and the point of view alternates between Kevin and Anthony. Francine's point of view is withheld until the reveal, so her cunning lands like a thunderclap."
- Standing: DECIDED BY YOLANDA
- Source: 9357
- Relationship: RESTATEMENT of S4-046. The wording "Kevin narrates" could be misread as Kevin being the sole narrator. That misreading likely caused error S4-008.

**S4-075**
- Type: Craft principle
- Statement: Tone tightrope: fall toward too jokey and the real thing never lands; the opposite failure is also named. "Keep the tone light enough to protect the tenderness. When a scene gets real, let a joke carry it." This is the author's job to maintain across the book.
- Standing: DECIDED BY YOLANDA
- Source: 9376 to 9377

**S4-076**
- Type: Feature / Story fact
- Statement: "Francine's Ledger: The Secret Operations Log" is an author-side tool. Because the reader never gets Francine's POV until the reveal, the ledger is "the only place the real story lives in order." It tracks which event she caused and which the men did to each other.
- Why: "Without it I will lose track."
- Standing: DECIDED BY YOLANDA
- Source: 9421 to 9423
- Relationship: This is a general program need: a hidden-causation timeline for withheld or secret actors.

**S4-077**
- Type: Story fact (IDW)
- Statement: Decided: the ledger gets found inside the book, as a little garden journal where Francine keeps tallies. "This began as my own aside and it is now a decision." It solves the ending, giving the men one true win against a smarter woman without her losing her genius.
- Standing: DECIDED BY YOLANDA
- Source: 9425 to 9427

**S4-078**
- Type: Craft principle / Story fact
- Statement: Three things to protect with the ledger:
  1. Plant it early and in plain sight, through the glimpsed habit of her writing in the little book.
  2. and 3. are truncated in the excerpt.
- Standing: DECIDED BY YOLANDA
- Source: 9431

**S4-079**
- Type: Story fact (IDW)
- Statement: The ledger is the reveal-delivery device. Instead of jumping into Francine's head, which would break the POV rule, the men, and the reader over their shoulders, read her mind through the ledger.
- Standing: DECIDED BY YOLANDA
- Source: 9432

**S4-080**
- Type: Feature
- Statement: Clue ledger: "a ledger of every clue I show on camera: where it sits, what it secretly means, and where it pays off."
- Why: Fair-play setups and payoffs.
- Standing: DECIDED BY YOLANDA (Bible)
- Source: 9436

**S4-081**
- Type: Feature (craft framework)
- Statement: The Save the Cat board is four rows of cards, one card per scene: Act One, Act Two first half, Act Two second half, Act Three. About nine or ten cards each, roughly forty in total. The fifteen beats are fixed; some beats are a single scene and others span several.
- Standing: DECIDED BY YOLANDA (her board)
- Source: 9290

**S4-082**
- Type: EXAMPLE / ILLUSTRATION
- Statement: Swain proactive scene example: "A Proactive scene for Kevin: Goal, he wants to prove Anthony planted the fish guts. Conflict, he can find no evidence and looks unhinged searching. Disaster, his snooping gets hi…"
- Standing: EXAMPLE / ILLUSTRATION ("One way I could play it, not a decision yet")
- Source: 9301
- Relationship: UNCLEAR and inconsistent with S4-048 and S4-050. The guts land in Anthony's yard and Anthony blames Kevin, so Kevin proving Anthony planted them does not fit. Never treat this as canon.

**S4-083**
- Type: Story fact (IDW)
- Statement: Fun and Games is "the heart of my comedy, the escalating prank war," running to the Midpoint. The developed set pieces live here.
- Standing: DECIDED BY YOLANDA
- Source: 9368

**S4-084**
- Type: Open question
- Statement: Bible open list: "The specific event at each of the fifteen beats, especially the Catalyst, the Midpoint (false victory or false defeat), and All Is Lost."
- Standing: DECIDED BY YOLANDA that these are open. Note that All Is Lost's function (ledger discovery) is decided but its specific staging is open.
- Source: 9402

---

## G. Chronological Story Map v1 content

**S4-085**
- Type: Feature / UI-UX
- Statement: Layout:
  - Title "CHRONOLOGICAL STORY MAP," subtitle "Story structure • causal movement • verified decisions • creative possibilities."
  - Four horizontal act bands with beat cards: ACT I / SETUP & SPARKS (beats 1–5, lilac), ACT II A / ESCALATION (6–8, pink), ACT II B / PRESSURE & REVEAL (9–12, blue), ACT III / CONNECTION (13–15, gold).
  - Each card shows the beat number, name, POSITION %, page estimates for 250-page and 300-page manuscripts (or "Position guides; not fixed pages"), the story function, and the decision status.
- Standing: ACCEPTED PROPOSAL (general "Looks good" at 9631)
- Source: 9429 to 9516, 9580 to 9605

**S4-086**
- Type: Data model
- Statement: Page landmarks are computed for both a 250-page and a 300-page manuscript: ~5% → 13/15; ~10% → 25/30; ~20% → 50/60; ~22% → 55/66; ~50% → 125/150; ~75% → 188/225; ~80% → 200/240.
- Why: Approximate guides, not fixed pages.
- Standing: ACCEPTED PROPOSAL (general)
- Source: 9496 to 9499
- Relationship: Possibly relates to an earlier decision (her target length or Brody percentages).

**S4-087**
- Type: Story fact (IDW)
- Statement: Beat functions on the map:
  - Opening Image (0–1%): world before disruption, garden and neighbors in uneasy proximity.
  - Theme Stated (~5%): respect, being seen, connection.
  - Setup (1–10%): Kevin, Anthony, Francine, the dogs, garden, neighborhood.
  - Catalyst (~10%): an incident disrupts the status quo; undecided.
  - Debate (10–20%).
  - Break into Two (~20%): "Kevin commits to fully engaging in the prank war."
  - B Story (~22%): Francine's hidden thread of visibility, agency, respect.
  - Fun and Games (20–50%).
  - Midpoint (~50%): UNDECIDED.
  - Bad Guys Close In (50–75%).
  - All Is Lost (~75%): ledger discovery, "NOT the ledger win."
  - Dark Night (75–80%): Confession.
  - Break into Three (~80%).
  - Finale (80–99%): WIELD the ledger.
  - Final Image (99–100%).
- Standing: UNANSWERED PROPOSAL for the specific wording
- Source: 9430 to 9444
- Relationship: Mostly RESTATEMENT. "Kevin commits" (only Kevin at Break into Two) and "B Story = Francine" may be ChatGPT interpretations. Flag for verification.

**S4-088**
- Type: UI-UX / Story fact
- Statement: Footer "NON-NEGOTIABLE STORY CONTINUITY":
  - African American co-leads with alternating first-person POV, in a diverse neighborhood.
  - Francine causes the fish-guts prank; the distraction execution is UNDECIDED.
  - All Is Lost = ledger DISCOVERED; Finale = ledger WIELDED.
  - McKee lens: intention → action → expectation/result gap → changed value → new decision → complication.
- Standing: RESTATEMENT. The facts are DECIDED BY YOLANDA earlier.
- Source: 9508 to 9513
- Relationship: The idea of a pinned continuity panel of non-negotiables on views is UNANSWERED PROPOSAL.

**S4-089**
- Type: Process
- Statement: This is the first production prototype, deliberately without the decorative artwork. Accuracy and a readable layout come first, then visual complexity. "Treat these PDFs as review copies."
- Standing: ACCEPTED PROPOSAL (9631)
- Source: 9607 to 9623

---

## H. Narrative Relationship Map v2 content

**S4-090**
- Type: Story fact (IDW)
- Statement: Kevin Wickley: African American, first-person co-lead. Established: paranoid, self-important, can catastrophize events; a Stephen King devotee with an anxious comic perspective. Open: his specific Lie, Ghost, Want and Need. Story role: the A-story feud, with friendship as its emotional arc.
- Standing: DECIDED BY YOLANDA for the traits (restated from the Bible). The poster is UNANSWERED PROPOSAL.
- Source: 10102

**S4-091**
- Type: Story fact (IDW)
- Statement: Anthony Vernon: African American, first-person co-lead. Established: dry, deadpan, outwardly unbothered, amused by provoking Kevin's reactions. Open: his precise psychological wounds and needs. Story role: the A-story feud, "not a separate friendship subplot."
- Standing: DECIDED BY YOLANDA (restated)
- Source: 10102

**S4-092**
- Type: Story fact (IDW)
- Statement: Miss Francine Ellington: African American, older neighbor. Established: her cherished garden is damaged by both dogs; she is overlooked; she secretly manipulates the feud; she wants dignity and respect, not villainy. Story role: the B story of hidden agency, visibility and awakening.
- Standing: DECIDED BY YOLANDA (restated)
- Source: 10102

**S4-093**
- Type: Principle / Story fact
- Statement: The men's move toward friendship is the emotional arc of the A-story plot, not a separate subplot.
- Standing: Possibly relates to an earlier decision by Yolanda. It is stated on several posters.
- Source: 10102, 10618

**S4-094**
- Type: Feature / UI-UX
- Statement: The "THREE FORCES, ONE ENTANGLED STORY" panel has three columns: VISIBLE OPPOSITION (Kevin vs. Anthony: misreading, escalation, wounded pride), HIDDEN CAUSATION (Francine's intervention, which neither man knows about), and EMOTIONAL SHIFT (rivalry to friendship: the reveal overturns assumptions, and the confession never names loneliness). The columns are linked by arrows.
- Why: Shows visible conflict, hidden causation and emotional change as separate layers.
- Standing: UNANSWERED PROPOSAL
- Source: 10112 to 10121
- Relationship: The visible-versus-hidden causation layer is a reusable program concept.

**S4-095**
- Type: Feature
- Statement: "SETUP → REVEAL → PAYOFF: THE LEDGER" chain:
  - EARLY: garden records planted as an ordinary habit.
  - ALL IS LOST (~75%): discovery, a revelation and emotional disaster.
  - DARK NIGHT: a sideways confession begins the real friendship.
  - FINALE (80–99%): they WIELD it for one genuine win, and Francine wins the larger game warmly.
- Standing: RESTATEMENT of decisions (DECIDED BY YOLANDA). The chain view is UNANSWERED PROPOSAL.
- Source: 10123 to 10131

**S4-096**
- Type: Principle / UI-UX
- Statement: "DRAMATIC QUESTIONS, NOT INVENTED ANSWERS." Posters pose questions where there are no decisions:
  - What is each man expecting, and where does reality contradict him?
  - Which choices create new pressure rather than repeat pranks?
  - What earns the friendship, and what is intentionally left unresolved?
- Why: Never fill gaps with invented canon.
- Standing: UNANSWERED PROPOSAL
- Source: 10133 to 10138

---

## I. Fish-Guts Sequence v2 ("Causal Zoom")

**S4-097**
- Type: Feature / Story fact
- Statement: Titled "FISH-GUTS SEQUENCE · CAUSAL ZOOM," subtitle "Story functions fixed • execution choices protected." The AUTHOR-ESTABLISHED CAUSAL CORE: Francine gets the men occupied elsewhere; she dumps raw fish guts in Anthony's yard; the source is unclear at first; the smell and animals later intensify the confusion; Anthony blames Kevin, who truthfully denies it. "OPEN EXECUTION: the five-dollar bill is one possible distraction, NOT confirmed canon."
- Standing: DECIDED BY YOLANDA (content). The layout is UNANSWERED PROPOSAL.
- Source: 10142 to 10147
- Relationship: "Causal Zoom" possibly relates to an earlier Narrative Zoom concept (zooming from story level to sequence level).

**S4-098**
- Type: Data model / Feature
- Statement: The sequence flow has seven steps, each with its own status:
  1. OPPORTUNITY (both men must be distracted): FUNCTION SET.
  2. DISTRACTION: EXECUTION OPEN.
  3. HIDDEN ACTION: ESTABLISHED.
  4. DELAYED EFFECT (smell, then cats and raccoons): ESTABLISHED.
  5. FALSE BLAME: ESTABLISHED.
  6. TRUE DENIAL ("Anthony mistrusts him"): ESTABLISHED.
  7. NEW PRESSURE (exact retaliation open): OUTCOME / DETAILS OPEN.
- Why: Status is tracked step by step inside a sequence. "Function set" is a distinct status from "established."
- Standing: UNANSWERED PROPOSAL
- Source: 10149 to 10159
- Relationship: ADDS TO S4-016. It introduces a fifth status, "FUNCTION SET / EXECUTION OPEN," which does not appear in S4-014.

**S4-099**
- Type: Feature (craft framework: McKee)
- Statement: The McKee lens applied to fish guts has three cells:
  - EXPECTATION: Anthony assumes Kevin did it ("A belief, NOT objective proof").
  - ACTUAL RESULT: Kevin denies it, and Francine is hidden ("Knowledge is unequal across characters").
  - GAP → CONSEQUENCE: distrust grows ("Resulting next prank or scene still open").
- Standing: ILLUSTRATIVE lens applied to decided facts. UNANSWERED PROPOSAL.
- Source: 10161 to 10167
- Relationship: "Knowledge is unequal across characters" implies a program need: tracking who knows what.

---

## J. Story Command Center v1

**S4-100**
- Type: Feature / UI-UX
- Statement: Subtitle: "Architecture • cause and effect • what is decided • what remains open." Its sections:
  - STORY ANCHORS · AUTHOR-ESTABLISHED: A STORY (Kevin and Anthony), B STORY (Francine), NARRATIVE LENS (two first-person voices, one narrator per scene or chapter, Francine's interior hidden).
  - THE FOUR MOVEMENTS: Act I 0–20%, Act IIA 20–50%, Act IIB 50–80%, Act III 80–100%.
  - McKee engine chain.
  - Story Brain band (S4-033).
  - Writing Rule (S4-035).
- Standing: UNANSWERED PROPOSAL
- Source: 10613 to 10640

**S4-101**
- Type: Feature (craft framework: McKee)
- Statement: "MCKEE-INSPIRED DRAMATIC ENGINE · ANALYTICAL LENS, NOT STORY CANON": DESIRE → EXPECTATION → ACTION → OPPOSITION → GAP + VALUE → NEW CHOICE. Each step is phrased as a question.
- Why: McKee is to be used as a lens that asks questions, not as content.
- Standing: UNANSWERED PROPOSAL
- Source: 10624 to 10631

**S4-102**
- Type: Open question (IDW)
- Statement: The Command Center's "Questions I Have":
  - What triggers the Catalyst?
  - What happens at the Midpoint?
  - How is the ledger discovered?
  - What is the exact final use of the ledger?
- Standing: DECIDED BY YOLANDA that these are open (consistent with the Bible)
- Source: 10635

---

## K. Act companions

**S4-103**
- Type: Feature / Story fact
- Statement: Act I · Setup and Sparks (0–20%), subtitle "framework functions, not invented chapter events." Five beats, with "Theme Stated occurs within Setup." Opening Image shows the ordinary world and Francine's near-invisibility with her garden quietly present. Theme Stated covers being seen, respect, contempt, loneliness and connection; the line and speaker are open. Setup covers Kevin's anxious suspicion, Anthony's dry amusement, the garden, both dogs and the community. The Catalyst is undecided. In Debate, Kevin commits near 20%.
- Standing: UNANSWERED PROPOSAL
- Source: 10642 to 10648
- Relationship: ChatGPT stressed "Importantly, Theme Stated remains at approximately 5%" (10751). That possibly relates to an earlier Yolanda correction about Theme Stated placement.

**S4-104**
- Type: Principle / UI-UX
- Statement: "OPEN DEVELOPMENT · HOLD WITHOUT BLOCKING THE DRAFT": the exact Catalyst, scene-by-scene comedy choreography, the Theme Stated line, town and season, and dog names and personalities. "These are questions to keep, not prerequisites for writing."
- Standing: UNANSWERED PROPOSAL (consistent with S4-027)
- Source: 10658 to 10660

**S4-105**
- Type: UI-UX
- Statement: "DRAMATIC EXPECTATIONS TO EXPLORE · SUGGESTIONS, NOT ESTABLISHED SCENES." Each card is labeled "Working question."
  - Expectation: what evidence convinces each man?
  - Gap: what surprises him?
  - Setup/Payoff: which innocuous detail can later prove Francine moved the pieces, without revealing her interior early?
- Standing: UNANSWERED PROPOSAL
- Source: 10653 to 10657

**S4-106**
- Type: Feature / Story fact
- Statement: Act IIA · The War Escalates (20–50%), subtitle "progressive complications, not a random collection of pranks." Beats 06–08. Note on B Story: "do not disclose her scheme to narrators prematurely." Fun and Games draws in the neighborhood.
- Standing: UNANSWERED PROPOSAL
- Source: 11189 to 11194
- Relationship: The neighborhood being drawn in is possibly a ChatGPT interpretation.

**S4-107**
- Type: Story fact (IDW)
- Statement: "The block-party pie moment exists in concept, but exact pie mechanics and timing are unresolved. Prank specifics and order remain flexible."
- Standing: DECIDED BY YOLANDA (exists in concept; came from earlier). The mechanics are open.
- Source: 11202
- Relationship: Possibly relates to an earlier decision (a block-party pie set piece).

**S4-108**
- Type: Process / Feature
- Statement: "SEQUENCE TEST · PRESSURE MUST CHANGE." For each set piece ask:
  - What did the POV character expect?
  - What actually happened?
  - What value turned?
  - Which new action is now unavoidable?
  - "Track the comic fallout without promoting invented details to canon."
- Standing: UNANSWERED PROPOSAL
- Source: 11203

**S4-109**
- Type: Open question (IDW)
- Statement: Act IIA "Questions I Have":
  - Which prank comes before fish guts?
  - When do the neighbors become involved?
  - What does each man misread?
  - How will the B story be visible without exposing Francine too early?
- Standing: UNANSWERED PROPOSAL (questions generated by ChatGPT, placed under her "Questions I Have" label)
- Source: 11204
- Relationship: Note that ChatGPT authored these but filed them under Yolanda's first-person label. That risks attributing them to her (see Distortions).

**S4-110**
- Type: Feature / Story fact
- Statement: Act IIB · Chaos and Revelation (50–80%):
  - Midpoint UNDECIDED.
  - Bad Guys Close In: exact antagonist pressures in development.
  - All Is Lost: the men DISCOVER the ledger and her hidden role; "the emotional disaster, not the final triumph."
  - Dark Night: the Confession follows, with vulnerability expressed indirectly with humor; "neither man says 'loneliness.'"
- Standing: RESTATEMENT (DECIDED BY YOLANDA content)
- Source: 11207 to 11213

**S4-111**
- Type: Principle / Story fact
- Statement: "LEDGER CONTINUITY · DO NOT COLLAPSE THESE STEPS": PLANTED EARLY (a genuine garden journal with a credible earlier footprint), FOUND IN ACT IIB (they realize they were manipulated; the discovery circumstances are open), and WIELDED IN ACT III.
- Standing: DECIDED BY YOLANDA (restated)
- Source: 11214 to 11217
- Relationship: As a program behavior, linked setup, reveal and payoff steps must stay distinct (UNANSWERED PROPOSAL).

**S4-112**
- Type: Principle
- Statement: "CHARACTER AND SCENE PRESSURE · TEST, DO NOT PREDECIDE." For Francine: "Do not replace her human motivation with a villain twist or invent her response."
- Standing: UNANSWERED PROPOSAL, consistent with her decision that Francine is "no villain"
- Source: 11218 to 11221

**S4-113**
- Type: Principle
- Statement: "The exact dialogue stays with the author."
- Standing: Consistent with S4-064 (DECIDED BY YOLANDA in principle)
- Source: 11222

**S4-114**
- Type: Feature / Story fact
- Statement: Act III · Truth and Connection (80–100%):
  - Break into Three: A and B converge, and the men make a different choice.
  - Finale: WIELD the ledger for one real win; Francine wins the larger game warmly; the exact confrontation is open.
  - Final Image: Francine and her garden become visible as the neighborhood shifts toward connection.
- Standing: UNANSWERED PROPOSAL (the content is mostly restated)
- Source: 11226 to 11231

**S4-115**
- Type: Principle
- Statement: "WHAT MUST BE EARNED THROUGH EARLIER CAUSES":
  - Kevin: respect without a shortcut; his precise Lie and Need are not fixed.
  - Anthony: friendship without sentimentality; "preserve his established voice; do not invent a sudden personality replacement."
  - Francine: seen, not villainized.
- Standing: UNANSWERED PROPOSAL
- Source: 11232 to 11235

**S4-116**
- Type: Feature
- Statement: "SETUP → PAYOFF PAIRS": Garden (Opening ↔ Final Image), Ledger (Discovery ↔ Use), Confession (Dark Night ↔ Finale).
- Why: Paired-element tracking.
- Standing: UNANSWERED PROPOSAL
- Source: 11236 to 11239
- Relationship: ADDS TO S4-080 (the clue ledger).

**S4-117**
- Type: Process (acceptance test)
- Statement: "FINAL STORY TEST: Does the ending result from who these people have become and the choices they make, rather than an unearned speech, convenient coincidence or surprise new information?"
- Standing: UNANSWERED PROPOSAL
- Source: 11240

**S4-118**
- Type: Open question (IDW)
- Statement: Act III open items: the exact ledger tactic in the Finale, comedy staging, community participation, supporting-cast reactions, and final image blocking. "Remain the author's choices."
- Standing: DECIDED BY YOLANDA that these are open
- Source: 11241

---

## L. Character Depth & Integrity companion

**S4-119**
- Type: Principle
- Statement: Subtitle: "Develop people, not dossiers • diagnostic questions are not asserted facts." Section header: "ESTABLISHED PORTRAITS · IDENTITY DOES NOT DEFINE PERSONALITY."
- Standing: UNANSWERED PROPOSAL
- Source: 11245 to 11246

**S4-120**
- Type: Feature
- Statement: "CHARACTER DEPTH · QUESTION LENSES (NOT MANDATORY PROFILE FIELDS)": Personal Values, Contradictions (complexity with a reason), Relationship Selves (how they act with rival, ally, family, stranger), Agency (who causes the next event; degree suited to the role), Distinctive Voice (how Kevin and Anthony differ in observation, humor, syntax and emotional attention, without stereotypes), and Believable Change.
- Why: Character fields should be optional lenses, not required forms.
- Standing: UNANSWERED PROPOSAL
- Source: 11250 to 11256
- Relationship: Consistent with S4-062 (Ingermanson: not every field for every character).

**S4-121**
- Type: Behavior
- Statement: "INTEGRITY CHECK · OBSERVE, ASK, NEVER AUTO-CORRECT." When a decision seems out of character, the program identifies the established behavior, the triggering circumstances and the knowledge available, and asks what bridges the gap. "Do not treat every surprise as an error."
- Why: A program behavior for character-consistency checks. Flag and ask, never auto-fix.
- Standing: UNANSWERED PROPOSAL
- Source: 11257

**S4-122**
- Type: Principle / Constraint
- Statement: "AN AUTHOR SAFEGUARD":
  - Unknown biography is not weak characterization.
  - Actor references guide comedic energy, not literal appearance or identity.
  - No religious or cultural assumptions are inferred from the characters' race.
- Standing: UNANSWERED PROPOSAL. The actor-references part possibly relates to an earlier Yolanda practice of giving actor references.
- Source: 11258
- Relationship: ADDS TO S4-041

**S4-123**
- Type: Story fact (IDW)
- Statement: The Character Depth poster states that Kevin's specific Want, Need, Lie and formative wound are not defined; Anthony's contradictions and deeper psychology are open; and Francine is "a flat-arc truth-holder [who] can still undergo a loneliness-to-aliveness change."
- Standing: Open items: DECIDED BY YOLANDA as open. The Francine change is a POSSIBILITY or earlier idea, not verified in this range.
- Source: 11247 to 11249
- Relationship: ADDS TO S4-061

---

## M. McKee Dramatic Gap companion

**S4-124**
- Type: Feature (craft framework: McKee)
- Statement: "THE DRAMATIC ENGINE · SCENE BY SCENE": 01 Desire, 02 Expectation, 03 Action (against forces of antagonism), 04 Actual Result (including unintended consequences), 05 The Gap (expectation ≠ result; "not simply 'acting out of character'"), 06 New Choice.
- Standing: UNANSWERED PROPOSAL
- Source: 11262 to 11269
- Relationship: ADDS TO S4-101

**S4-125**
- Type: Feature
- Statement: "PROGRESSIVE COMPLICATIONS · SCALE THE KIND OF TROUBLE":
  - Comedic Surface: add a new type of problem, not the same joke louder.
  - Personal Pressure.
  - Social Consequence: "Only use outcomes established in the manuscript."
- Standing: UNANSWERED PROPOSAL
- Source: 11270 to 11273

**S4-126**
- Type: Feature / Data model
- Statement: "SCENE VALUES · DEFINE POLARITY FOR THIS SCENE": Respect ↔ Humiliation, Isolation ↔ Connection, and Negation of Negation. "If the genre warrants it… Do not force dark extremes into this comedy."
- Why: Scene value tracking that adapts to genre.
- Standing: UNANSWERED PROPOSAL
- Source: 11274 to 11277
- Relationship: The genre-sensitivity supports the general-purpose principle.

**S4-127**
- Type: EXAMPLE / ILLUSTRATION
- Statement: "EXAMPLE ONLY · INSPIRED BY I DECLARE WAR, NOT A DECIDED SCENE": Anthony believes Kevin planted the fish guts, Kevin honestly denies it, and Francine's concealed role explains why their assumptions fail.
- Standing: EXAMPLE / ILLUSTRATION. It uses decided facts, but is labeled as an example.
- Source: 11278
- Relationship: The UI pattern is to label examples explicitly.

**S4-128**
- Type: Feature / Principle
- Statement: "STORY-LEVEL ZOOM: Scene gap → sequence consequence → act reversal → overall meaning. Trace causal links and value changes, but do not make each beat obey a rigid worksheet."
- Standing: UNANSWERED PROPOSAL
- Source: 11279
- Relationship: Possibly relates to the earlier Narrative Zoom concept (zoom levels from scene to whole story).

---

## N. Packaging, desk reader and QA

**S4-129**
- Type: Feature
- Statement: Home-printer Desk Reference: a 23-page US Letter PDF that reflows the text of all ten posters ("Instead of shrinking enormous posters"), so she can print, review and mark changes. It omits the diagrams and complements the posters rather than replacing them.
- Standing: UNANSWERED PROPOSAL (implements the accepted S4-019 and S4-020)
- Source: 11987 to 12019, 12079 to 12089

**S4-130**
- Type: Story fact / UI-UX
- Statement: The Desk Reference's "Critical story safeguards" restate:
  - All three leads are African American, in a diverse neighborhood.
  - Alternating POV; Francine does not narrate openly before her reveal.
  - Fish guts by Francine; the five-dollar bill is NOT decided; the smell comes first, then cats and raccoons; Anthony blames Kevin.
  - Ledger discovered near All Is Lost (about 75%), indirect confession in the Dark Night, ledger wielded in the Finale.
  - The midpoint, moral-premise wording and many details are open.
- Standing: RESTATEMENT (DECIDED BY YOLANDA)
- Source: 11989

**S4-131**
- Type: Process / Data model
- Statement: Production Manifest JSON (posters, file names, character counts, vector_text, size_verified, status) and an Editorial & Print QA report. The report lists items NOT YET CLEARED:
  - line-by-line story-bible verification
  - legibility at a distance
  - a vendor proof print
  - illustration re-integration and image resolution
  - printer CMYK and bleed specs
- Standing: UNANSWERED PROPOSAL
- Source: 12021 to 12025, 12091 to 12108

**S4-132**
- Type: Constraint
- Statement: QA concerns: "Concept maps may contain interpretations not explicitly stated in the story bible." "Small gray/cream text may require stronger contrast and larger production sizing."
- Why: An honest disclosure that the drafts may contain invented content.
- Standing: UNANSWERED PROPOSAL
- Source: 12024
- Relationship: ADDS TO S4-003

**S4-133**
- Type: Process
- Statement: Next steps stated: (1) bring back the artwork (neighborhood, characters, gardens, visual personality) while keeping sharp vector text and never embedding generated lettering; (2) an editorial review against the bible; (3) a printing test at actual scale and confirmation of the vendor's specs.
- Standing: UNANSWERED PROPOSAL (Yolanda said "Please continue" at 12136)
- Source: 12110 to 12118

**S4-134**
- Type: Principle
- Statement: "We're building a writing wall you can trust, not merely a collection of attractive decorations." The final posters must be "just as visually engaging as the originals while being far more accurate and practical."
- Standing: ACCEPTED PROPOSAL in spirit (S4-005)
- Source: 12128 to 12130

**S4-135**
- Type: Principle
- Statement: Destination: "Get the story out of your head, make its moving parts visible, and free you to WRITE THE DAMN BOOK!" Also: "a writing wall that helps you see your entire story without having to hold every moving piece in your head."
- Standing: Possibly relates to an earlier decision. "WRITE THE DAMN BOOK" is very likely Yolanda's phrase, restated here.
- Source: 10254, 11420
- Relationship: RESTATEMENT

**S4-136**
- Type: Principle
- Statement: Undecided ideas must never be turned into decisions "you never made."
- Standing: ACCEPTED PROPOSAL
- Source: 9627, 11372
- Relationship: RESTATEMENT of S4-014 and S4-016

**S4-137**
- Type: Behavior
- Statement: Build-time overflow guard: if text does not fit its box, generation fails ("Text overflow") rather than silently truncating.
- Why: Prevents clipped content on printed views.
- Standing: UNANSWERED PROPOSAL (implementation detail)
- Source: 10067

**S4-138**
- Type: Behavior
- Statement: Verification of outputs: physical page size checked (3456×2592 pt for 48×36 and 4320×3240 pt for 60×45), and the presence of selectable vector text checked.
- Standing: UNANSWERED PROPOSAL
- Source: 9553, 10707, 11287, 11997 to 12000

**S4-139**
- Type: Constraint
- Statement: Poster PDFs are produced in two sizes from one design by scaling (w/48). Previews are produced as PNG.
- Standing: UNANSWERED PROPOSAL
- Source: 10665, 11284

---

## Open questions in this section

1. IDW: the specific Catalyst event; the Midpoint event and whether it is a false victory or false defeat; how the ledger is discovered; the exact final use of the ledger; the Theme Stated line and its speaker; the exact moral premise wording; town and season; dog names and personalities; the ancillary cast (wife, family); prank order (which comes before fish guts); when the neighbors get involved; how the B story stays visible without exposing Francine; block-party pie mechanics and timing; aftermath reactions; final image blocking; the Finale confrontation; Kevin's and Anthony's Lie, Ghost, Want and Need.
2. Is the five-dollar bill still in play as a candidate distraction? It is open and remains only a possibility.
3. Was Break into Two "Kevin commits" (only Kevin) ever decided? The posters assert it.
4. Is "Francine and garden mirror" in the Opening and Final Images Yolanda's decision or ChatGPT's interpretation?
5. Is "Francine flexes her power as the men start hunting her" in Bad Guys Close In still live, given that discovery comes at All Is Lost?
6. Desk reference format: 11×8.5 landscape (JSON) or 8.5×11 portrait (plan and reader)?
7. Yolanda never reviewed any of the ten vector drafts in detail. Story-integrity sign-off is outstanding.
8. Print vendor specs (CMYK, bleed) are not yet known.

## Unclear items

- **S4-053**: "Opening and final images mirror the treatment of Francine and her garden" is listed as established, but the Bible text in range only says the final image mirrors the opening.
- **S4-068**: "men start hunting her" during Bad Guys Close In conflicts with discovery at about 75%.
- **S4-082**: the Swain example has Kevin trying to prove Anthony planted fish guts, which is inconsistent with the established fish-guts facts. It is an example only.
- **S4-074**: the Bible phrase "Kevin narrates in first person, and the point of view alternates" is ambiguous and probably caused error S4-008.
- **S4-039**: the desk reference orientation conflict.
- **S4-098**: a new status, "FUNCTION SET / EXECUTION OPEN," that is not in the four-category scheme. Should the program have a distinct status for "function locked, execution open"? Logically yes (S4-016), but it was never formally decided.
- **S4-123**: Francine's "loneliness-to-aliveness change" as a flat-arc character. Not verified as Yolanda's in this range.

## Items ChatGPT dropped or distorted when restating

1. **Four categories collapsed to three.** The accepted four-way classification (Established / Developing / Unanswered / Illustrative, S4-014) became a three-label legend on every poster (ESTABLISHED FACT / OPEN-DEVELOPING / ILLUSTRATIVE LENS). "Developing" and "Unanswered" were merged, losing the difference between ideas being explored and questions identified.
2. **"One standard poster first" abandoned.** ChatGPT proposed perfecting the Chronological Story Map before the other nine (S4-025), and Yolanda accepted that plan. It then drafted all ten within about 20 minutes, and the Chronological map was never finished with artwork. This contradicts the accepted process.
3. **ChatGPT questions filed under her label.** ChatGPT-generated questions appear under Yolanda's first-person label "QUESTIONS I HAVE" on the Act IIA poster (S4-109). That risks presenting assistant-generated questions as hers.
4. **Interpretations shown as established.** Some poster content may be interpretation presented as fact: "Kevin commits" at Break into Two; "draw in the neighborhood" during Fun and Games; "Opening/Final Image mirror Francine and garden"; "A sideways confession begins the men's real friendship." ChatGPT's own QA report admits concept maps may contain uncited interpretations.
5. **Five-dollar bill.** Bible v5 still marks the five-dollar bill scene "Decided" (S4-071). Every new artifact correctly overrides this with Yolanda's October 14 clarification, but the Bible source file itself was not updated in this range. The source of truth and the overrides disagree until it is revised.
6. **Lost Bible nuance.** The posters dropped some Bible nuance: the craft rules "escalate the reaction, not the event" and "delayed payoff" for fish guts; "change heads only at a seam"; "no one says the word" (kept partly as "never names loneliness"); the ledger as the reveal-delivery device that avoids breaking POV; the clue ledger; Francine as a Flat Arc on respect (reduced on the Character Depth poster); the "Mine to write" author-reserved markers. Omission does not cancel any of them.
7. **Illustrations deferred.** The illustrated look Yolanda loved (S4-018) was dropped from every draft in this range. It is still promised, not delivered.
8. **Print-readiness language.** ChatGPT repeatedly says "verified" for page dimensions and selectable text. That could read as story verification, which it has not done. Story integrity is explicitly still outstanding.
