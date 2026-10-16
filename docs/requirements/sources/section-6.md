# Requirements Register — Section 6 (lines 15062–18491)

Source file: `90955321-Story_Map_Planning_FULL_with_code.md`
Time span: 2026-10-14 16:48 ET through 2026-10-15 08:33 ET
Read: every line from 15040 through 18509 (a few lines of context on each side).

## What happens in this section

1. Yolanda splits the work into phases (16:48). Phase 1 is illustrated story maps using AI art. Phase 2 is "the story system" (the program). Phase 3, "further down the line," is the visual story mapping engine, "done correctly."
2. Yolanda says she will build the posters herself in Canva or Illustrator from an "extensive write up" (16:51). ChatGPT writes the Story Map Production Bible Volume 1 (Poster 1, Chronological Story Map). At her request it becomes a printable PDF and DOCX.
3. Yolanda: "I'm tired of trying to work around the poster and the artwork." She asks to start designing the program now. Her deadlines are planning by 10/31/2026 and writing from 11/1/2026 (18:01).
4. ChatGPT proposes an MVP-style "November 1 writing release." Yolanda rejects it: the **full** Phase 2 must be built, tested and usable by Saturday, October 17 (18:06).
5. Yolanda sets the workflow: ChatGPT builds, then Claude verifies (18:12). ChatGPT delivers the "StoryForge" development build ZIP (18:20). The build is a Python/SQLite local web app.
6. There is a long IDW character breakthrough on Kevin (Ghost, therapy, Dr. Fingleburger) and Anthony (self-appointed HOA enforcer, podcast "The Voice of Reason," co-hosting, "Giving honor to God, and Miss Francine…"). Yolanda asks to "lock this entire conversation in somewhere."
7. Yolanda rejects the name "StoryForge" ("I dislike 'Forge'"). She asks for a full, non-brief write-up of the FULL Phase 2 for Claude (07:59 on 10-15). ChatGPT writes PHASE2_FULL_SPEC.md: 20 sections and 20 acceptance tests (AC01–AC20).
8. Yolanda says the spec "misses the 'human' touch" of her sharing ideas and ChatGPT edifying the product (08:33). The section ends there.

Standing key: DECIDED BY YOLANDA / ACCEPTED PROPOSAL / UNANSWERED PROPOSAL / POSSIBILITY / EXAMPLE / ILLUSTRATION / REJECTED.

---

## A. Phasing and roadmap

**S6-001**
- **Type:** Principle / Process
- **Statement:** The overall effort is split into phases.
  - Phase 1 is the illustrated story maps ("the barrier," i.e. the posters she asked for).
  - Phase 2 is "just the story system... whatever we decide to call the overall program."
  - Phase 3 ("further down the line") integrates the visual story mapping system, "but we do it correctly."
- **Why:** Future software requirements kept complicating what she needs now. The visual engine must look professional and needs its own design.
- **Standing:** DECIDED BY YOLANDA ("I think that has to come as a different phase... phase two should just be the story system... further down the line, we also integrate this visual system, but we do it correctly").
- **Source:** L15064–15070, 2026-10-14 16:48
- **Relationship:** Possibly relates to an earlier decision. ChatGPT notes its "original Phase 3" (Story Universe) is renumbered to Phase 4 (L15151). The earlier phase numbering came from before this section.

**S6-002**
- **Type:** Feature (Phase 3)
- **Statement:** There will be a "Visual Story Mapping Engine," a visual story mapping system/engine.
- **Why:** She likes the idea. It "definitely needs to be designed, so it looks professional."
- **Standing:** DECIDED BY YOLANDA ("I like the thought of a visual story mapping system/engine. It definitely needs to be designed, so it looks professional").
- **Source:** L15064, 16:48
- **Relationship:** Adds to the earlier ChatGPT proposal at L15060 (from the end of the previous section).

**S6-003**
- **Type:** Constraint (Phase 1)
- **Statement:** For Phase 1, AI-generated artwork is acceptable ("I think an AI representation is okay. Good until I AI art" — likely voice-to-text garble).
- **Why:** She needs the posters now and does not want to wait for a rendering engine.
- **Standing:** DECIDED BY YOLANDA
- **Source:** L15066, 16:48
- **Relationship:** Possibly relates to earlier poster-quality discussions (before this section). It relaxes art provenance, not accuracy (see S6-013).

**S6-004**
- **Type:** Process (roadmap restatement)
- **Statement:** ChatGPT's four-phase roadmap:
  - Phase 1: Illustrated Story Maps. The ten story maps and companion pieces, AI art.
  - Phase 2: The Novel-Writing System, the actual software application.
  - Phase 3: Visual Story Mapping Engine.
  - Phase 4: Story Universe and Beyond (connected novels, series continuity, shared fictional worlds, TV, film, other formats; relationships between manuscripts, characters, timelines, storyworlds).
- **Why:** To stop expanding Phase 1 every time a new desirable software feature appears.
- **Standing:** Phases 1–3 are ACCEPTED PROPOSAL (they match her statement). The Phase 4 numbering is an UNANSWERED PROPOSAL.
- **Source:** L15086–15151, 16:48
- **Relationship:** RESTATEMENT OF S6-001, with Phase 4 added. "Original Phase 3" (the universe) became Phase 4 (possibly relates to an earlier decision).

**S6-005**
- **Type:** Principle
- **Statement:** Phase 1 will not keep expanding every time another desirable software feature is discovered.
- **Why:** Scope creep had stalled the posters.
- **Standing:** ACCEPTED PROPOSAL (implicitly accepted; she proceeds).
- **Source:** L15101, 16:48
- **Relationship:** ADDS TO S6-001

**S6-006**
- **Type:** Feature list (Phase 2 scope as restated by ChatGPT)
- **Statement:** Phase 2 includes:
  - Story Brain (central repository)
  - character development, psychology, relationships, integrity analysis
  - story structure (McKee, Snyder, Weiland, Ingermanson, others)
  - dramatic gaps, progressive complications, story values, causal integrity
  - acts, sequences, scenes, manuscripts, drafting
  - Narrative Zoom
  - Questions I Have, and Things & Ideas I'm Thinking About
  - capture-first organization, author-controlled decisions, ripple-effect analysis
  - version history, reliable saving, backups, exports
  - Return to Writing
- **Why:** "Phase 2 must help you WRITE THE DAMN STORY, not just plan it."
- **Standing:** ACCEPTED PROPOSAL. Yolanda later demands "all of those things" (S6-047).
- **Source:** L15103–15125, 16:48
- **Relationship:** RESTATEMENT of earlier-section decisions (Story Brain, Narrative Zoom, Ripple Effect, etc.). It does not list the Writing Trail or other earlier-named features. Omission does not cancel them.

**S6-007**
- **Type:** Constraint
- **Statement:** Phase 2 does not need a sophisticated poster-generation system. It can use practical, straightforward interface elements to show relationships and structures. Advanced visual presentation and print production come later.
- **Why:** To keep Phase 2 focused on writing.
- **Standing:** ACCEPTED PROPOSAL (consistent with S6-001)
- **Source:** L15121–15123
- **Relationship:** ADDS TO S6-001

**S6-008**
- **Type:** Principle
- **Statement:** Narrative Zoom is retained in Phase 2. She must be able to move between novel, act, sequence and individual scene. Only the advanced graphical visualization and poster export are postponed.
  - "Phase 2: Navigate and understand the connections. Phase 3: See those connections through sophisticated visual maps and export them professionally."
- **Why:** "You originally described Narrative Zoom as the ability to move between the big picture and the intricate details." ChatGPT says this is "fundamental to your writing process."
- **Standing:** UNANSWERED PROPOSAL. It protects an earlier Yolanda decision (Narrative Zoom). She did not respond specifically, but later demanded "all of those things."
- **Source:** L15155–15171
- **Relationship:** Possibly relates to an earlier decision (Narrative Zoom defined before this section). ADDS TO S6-001.

**S6-009**
- **Type:** Feature (Phase 3)
- **Statement:** Phase 3 engine responsibilities:
  - professional diagram design
  - interactive story maps
  - Narrative Zoom visualizations
  - chronological maps
  - relationship diagrams
  - companion posters
  - reliable large-format printing
  - deterministic layouts, readable typography, editable visual elements, print preflight, dependable exports
  - "not another collection of corporate-looking charts"
- **Why:** Lessons from poster failures.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L15127–15142
- **Relationship:** ADDS TO S6-002. It also restates the preceding-section list at L15040–15046 (print-safe export, zoom views, density, preflight, art layering).

**S6-010**
- **Type:** Principle
- **Statement:** "A story map that is correct in the database but broken in the export is still broken."
- **Why:** For Yolanda, broken output would make the program feel unusable.
- **Standing:** UNANSWERED PROPOSAL (from the end of the previous section; context only)
- **Source:** L15056–15058
- **Relationship:** Context from before the section start

**S6-011**
- **Type:** Principle
- **Statement:** Guiding principle per phase:
  - Phase 1: "Help me SEE my story."
  - Phase 2: "Help me DEVELOP and WRITE my story."
  - Phase 3: "Help me VISUALIZE and PRESENT my story professionally."
  - Phase 4: "Help me EXPAND my story into a larger creative universe."
- **Why:** It protects "getting your stories out of your head and onto the page."
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L15191–15203
- **Relationship:** RESTATEMENT OF S6-004

**S6-012**
- **Type:** Constraint
- **Statement:** Printing AI art at 60 × 45 inches has limits. Accepting AI artwork "doesn't magically increase its resolution."
- **Why:** Transparency about print quality.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L15185

**S6-013**
- **Type:** Principle
- **Statement:** The requirement that Yolanda deliver professionally typeset posters is relaxed. The requirement that story information be accurate is not. Written information is verified against the story bible before it is treated as poster copy.
- **Why:** Earlier posters contained errors (e.g. omitted Dark Night of the Soul, misattributed fish guts).
- **Standing:** UNANSWERED PROPOSAL. It is consistent with her standing accuracy demands.
- **Source:** L15351–15353
- **Relationship:** ADDS TO S6-003

## B. Phase 1 production approach (posters built by Yolanda)

**S6-014**
- **Type:** Process / Decision
- **Statement:** For Phase 1, Yolanda will use ChatGPT's AI artwork. Given an "extensive write up," she will create the actual posters herself in Canva, Illustrator "or something like that."
- **Why:** This is a practical route that avoids endless AI poster revisions. She knows Illustrator.
- **Standing:** DECIDED BY YOLANDA ("I can use canva, or illustrator... and create the actual posters myself")
- **Source:** L15209, 16:51
- **Relationship:** ADDS TO S6-003

**S6-015**
- **Type:** Process
- **Statement:** Separate three things: the creative artwork, the story information, and the final poster design.
  - Illustrations are created as separate pieces rather than embedded in one infographic, so she can arrange, resize and replace them.
  - "The artwork tells the visual story. It doesn't have to carry the written information."
- **Why:** To give her control and stop text-in-image errors.
- **Standing:** ACCEPTED PROPOSAL (she said "Please start")
- **Source:** L15221–15237, 16:51
- **Relationship:** ADDS TO S6-014

**S6-016**
- **Type:** Feature (Phase 1 deliverable)
- **Statement:** A comprehensive, poster-by-poster Story Map Production Guide. For each of the ten posters it gives:
  - poster purpose
  - recommended layout
  - exact headings
  - exact poster copy
  - story references
  - decision status
  - visual direction
  - connections (arrows, causal chains)
  - print considerations
- **Why:** "You shouldn't have to figure out what the poster is supposed to say while you're trying to design it."
- **Standing:** ACCEPTED PROPOSAL ("Please start")
- **Source:** L15239–15265; acceptance at L15369
- **Relationship:** ADDS TO S6-014

**S6-017**
- **Type:** Feature (Phase 1)
- **Statement:** A separate Artwork Guide / illustration inventory per poster. For example, the Chronological Map needs a neighborhood panorama, three portraits, a garden and scene illustrations.
  - It keeps character appearances consistent across posters, while the designs "remain representative until you approve their physical characteristics."
- **Why:** To prevent Kevin from looking dramatically different from one poster to the next.
- **Standing:** ACCEPTED PROPOSAL (bundled in "Please start")
- **Source:** L15267–15277

**S6-018**
- **Type:** UI-UX / Data model
- **Statement:** Four decision-status classifications appear discreetly on posters:
  - Established: confirmed by you
  - Developing: a possibility you're exploring, or "you know the function but execution is being explored"
  - Unanswered: something you still need to decide
  - Illustrative: an example used to explain a concept
- **Why:** To separate decisions from possibilities without overwhelming the art.
- **Standing:** ACCEPTED PROPOSAL
- **Source:** L15285–15295; L15430–15443
- **Relationship:** Possibly relates to the earlier status model in previous sections. ChatGPT gives two slightly different Developing definitions: "a possibility you're exploring" (L15289) versus "you know the function, but exact execution is still being explored" (L15437).

**S6-019**
- **Type:** UI-UX
- **Statement:** Reusable poster design system:
  - purple-and-gold palette, typography hierarchy, panel treatments, illustration style, spacing, conventions
  - preserve the visual personality of the original posters
- **Standing:** ACCEPTED PROPOSAL
- **Source:** L15279–15283

**S6-020**
- **Type:** Process
- **Statement:** Production workflow:
  - Open a 48 × 36 in document in Illustrator, or use Canva subject to its size and export limits.
  - Enter lettering as actual text, not text generated in images.
  - Use Illustrator for the 60 × 45 print.
- **Why:** It eliminates the recurring garbled-text problem and gives her full control.
- **Standing:** ACCEPTED PROPOSAL
- **Source:** L15297–15307

**S6-021**
- **Type:** Process
- **Statement:** The ten posters are one comprehensive production package:
  - 3 master maps (overall architecture)
  - act companions (Narrative Zoom)
  - Fish-Guts Sequence (scene-level causality, McKee's dramatic gap)
  - Character Depth and McKee companions (reusable craft references)
  - All draw from the same verified story information, so the Chronological Map cannot contradict the Act IIB poster about the ledger.
- **Why:** Consistency across posters.
- **Standing:** ACCEPTED PROPOSAL
- **Source:** L15311–15325

**S6-022**
- **Type:** Principle
- **Statement:** The manually built posters serve as design references and requirements for the future Phase 3 engine. Building them by hand reveals which arrangements, relationships and levels of detail are useful while writing.
- **Why:** This is better than designing the software around assumptions.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L15327–15339

**S6-023**
- **Type:** Feature (deliverable)
- **Statement:** "The I Declare War Story Map Production Bible" covers all ten posters: exact wording, established facts, unresolved questions, layouts, artwork specs, printing instructions. It must be detailed enough that she does not have to reconstruct conversations.
- **Standing:** ACCEPTED PROPOSAL ("Please start")
- **Source:** L15343–15349; L15369

**S6-024**
- **Type:** Process
- **Statement:** Production Bible Volume 1 structure:
  1. Global production rules
  2. Design system
  3. Poster 1 Chronological Story Map
  4. later volumes for Posters 2–10
  - Usable in Canva, Illustrator or InDesign.
- **Standing:** ACCEPTED PROPOSAL (delivered)
- **Source:** L15385–15401

**S6-025**
- **Type:** Principle (poster purpose)
- **Statement:** The posters help Yolanda:
  - see the story as a whole
  - understand structure, causality and progression
  - reduce analysis paralysis
  - support actual drafting
  - be beautiful and wall-worthy
  - "These posters are not the manuscript. They are story architecture tools."
- **Standing:** UNANSWERED PROPOSAL. It reflects her known goals.
- **Source:** L15405–15416

**S6-026**
- **Type:** Principle / Data model
- **Statement:** The source of truth is the IDW story bible (v5, 10/13/2026) plus the author's later clarifications in conversation. An analytical example is not automatically an established story event.
- **Standing:** UNANSWERED PROPOSAL. It is consistent with her repeated insistence.
- **Source:** L15424–15428; L16283

**S6-027**
- **Type:** Principle / Data model
- **Statement:** The function of a beat may be established even when its exact form is still developing. Example: established function "Francine needs Kevin and Anthony distracted"; developing execution "five-dollar bill or something else." Keep these two layers distinct on every poster.
- **Why:** To avoid falsely locking executions.
- **Standing:** UNANSWERED PROPOSAL. It derives from earlier Yolanda corrections.
- **Source:** L15473–15479; L16285
- **Relationship:** Possibly relates to an earlier Yolanda decision about the fish-guts distraction (five-dollar bill not decided).

**S6-028**
- **Type:** UI-UX
- **Statement:** Poster tone: professional, literary, visually rich, warm, intelligent, cinematic. Not childish, not corporate, not clipart-like.
- **Standing:** UNANSWERED PROPOSAL. It matches her earlier frustrations.
- **Source:** L15487–15498; L16304
- **Relationship:** The DOCX adds: dimensional, humorous, expressive; no flat generic corporate symbols; no illustration-heavy text boxes that obscure the information.

**S6-029**
- **Type:** UI-UX
- **Statement:** Poster color direction:
  - deep plum/aubergine for headers
  - warm gold for structure labels and emphasis
  - cream/parchment/ivory for panels
  - muted rose/mauve/blush accents
  - dark charcoal/espresso for body text
  - soft sage/garden green as a subtle accent for Francine and the garden
- **Standing:** UNANSWERED PROPOSAL (a ChatGPT suggestion)
- **Source:** L15500–15508

**S6-030**
- **Type:** UI-UX
- **Statement:** Typography hierarchy:
  - elegant serif/literary display for the title
  - strong serif or semi-formal sans for section headers
  - highly readable body type
  - clean sans for beat labels and micro labels
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L15510–15523

**S6-031**
- **Type:** UI-UX
- **Statement:** Status notation key on every poster:
  - Established = solid gold tag
  - Developing = plum outline / dashed border
  - Unanswered = soft gray or mauve question marker
  - Illustrative = italic, lighter treatment
  - Keep it subtle. The DOCX adds "Color must have meaning."
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L15525–15535; L16307

**S6-032**
- **Type:** Feature
- **Statement:** Output formats per poster:
  - 48 × 36 in wall version
  - 60 × 45 in extra-large (same 4:3 proportions; scale only once the art is resolution-checked)
  - US Letter/Tabloid working reference version, reflowed or split rather than simply miniaturized
- **Standing:** UNANSWERED PROPOSAL. The sizes likely derive from earlier Yolanda requests.
- **Source:** L15539–15551; L16308

## C. Poster 1: Chronological Story Map spec

**S6-033**
- **Type:** Feature (poster spec)
- **Statement:** Poster 1, the Chronological Story Map, is "the first and most important master poster" and the big-picture wall map. It shows:
  - the 15 Save the Cat beats
  - act structure
  - approximate % placement
  - approximate pages for 250- and 300-page novels
  - major story functions
  - established vs developing
  - movement from setup to escalation to revelation to resolution
- **Standing:** ACCEPTED PROPOSAL (Volume 1 delivered and requested as a printable doc)
- **Source:** L15555–15576

**S6-034**
- **Type:** UI-UX
- **Statement:** Landscape horizontal timeline with five zones:
  - A: title, subtitle, one-line description, status legend
  - B: act bands I/IIA/IIB/III
  - C: 15 beat cards grouped by act
  - D: supporting notes (POV, ledger, fish guts, story-state, established/developing reminder)
  - E: footer (page-count legend, version/date, optional "Story architecture map, not manuscript outline")
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L15580–15622

**S6-035**
- **Type:** Feature (copy)
- **Statement:** Title copy:
  - "I DECLARE WAR / Chronological Story Map"
  - subtitle "A structural map of plot, escalation, revelation, and resolution"
  - two alternative purpose-statement texts (long and short)
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L15626–15645

**S6-036**
- **Type:** Data model (structure)
- **Statement:** Act grouping:
  - Act I 0–20%, beats 1–5
  - Act IIA 20–50%, beats 6–8
  - Act IIB 50–80%, beats 9–12
  - Act III 80–100%, beats 13–15
  - The DOCX adds act subtitles: "Setup and Sparks," "The War Escalates," "Chaos and Revelation," "Truth and Connection."
- **Standing:** UNANSWERED PROPOSAL. The act names are a ChatGPT invention in the code only.
- **Source:** L15649–15658; L16317

**S6-037**
- **Type:** Constraint / Acceptance test
- **Statement:** All 15 beats must appear with no omissions:
  Opening Image, Theme Stated, Set-Up, Catalyst, Debate, Break into Two, B Story, Fun and Games, Midpoint, Bad Guys Close In, All Is Lost, Dark Night of the Soul, Break into Three, Finale, Final Image.
  - "Dark Night of the Soul... was omitted before and should never be omitted again."
- **Why:** An earlier poster omitted DNotS, which was a Yolanda complaint.
- **Standing:** DECIDED BY YOLANDA earlier (ChatGPT references her prior correction)
- **Source:** L15662–15679; L15981–15982
- **Relationship:** Possibly relates to an earlier Yolanda decision before this section

**S6-038**
- **Type:** Principle
- **Statement:** Where an exact story event is not decided, the card says so clearly. "Do not over-specify the exact opening scene unless you have decided it." "Do not fill an undecided event with an invented scene merely to make the card feel complete."
- **Standing:** UNANSWERED PROPOSAL. It is consistent with Yolanda's accuracy rules.
- **Source:** L15687–15712; L16318

**S6-039**
- **Type:** Data model / Example
- **Statement:** Beat-card content per beat: label, status, approximate placement (% and pages for 250/300), beat purpose text, story-specific note. Placement data:

  | Beat | % | 250-page | 300-page |
  |---|---|---|---|
  | Opening Image | 0–1% | p1–3 | p1–3 |
  | Theme Stated | ~5% | 12–13 | 15 |
  | Setup | 1–10% | 3–25 | 3–30 |
  | Catalyst | ~10% | 25 | 30 |
  | Debate | 10–20% | 25–50 | 30–60 |
  | Break into Two | ~20% | 50 | 60 |
  | B Story | ~22% | 55 | 66 |
  | Fun & Games | 20–50% | 50–125 | 60–150 |
  | Midpoint | ~50% | 125 | 150 |
  | BGCI | 50–75% | 125–188 | 150–225 |
  | All Is Lost | ~75% | 188 | 225 |
  | DNotS | 75–80% | 188–200 | 225–240 |
  | Break into Three | ~80% | 200 | 240 |
  | Finale | 80–99% | 200–248 | 240–297 |
  | Final Image | 99–100% | 249–250 (DOCX: 248–250) | 298–300 (DOCX: 297–300) |

- **Standing:** UNANSWERED PROPOSAL (structural reference data)
- **Source:** L15692–16070; L16321–16339
- **Relationship:** Minor internal inconsistency in the Final Image pages between the chat text and the DOCX.

**S6-040**
- **Type:** Principle
- **Statement:** Page figures are approximate structural landmarks, not mandatory chapter breaks. The footer table need not list every beat.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L16072–16073; L16340

**S6-041**
- **Type:** UI-UX
- **Statement:** Theme Stated (~5%) falls within the overlapping Setup span (1–10%). Show it as a landmark inside the early Setup window, not as a claim that Setup starts after it.
- **Standing:** UNANSWERED PROPOSAL (code only)
- **Source:** L16311; L16356

**S6-042**
- **Type:** Feature (support panels)
- **Statement:** 3–5 support panels:
  - A: POV Structure
  - B: Francine's Hidden Influence
  - C: Ledger Progression ("Discovery and use are separate dramatic functions")
  - D: Fish-Guts Sequence
  - E: Story Status Reminder
  - Copy is supplied for each.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L16077–16109; L16342–16347

**S6-043**
- **Type:** UI-UX
- **Statement:** Illustration direction:
  - core: one each of Kevin, Anthony and Francine, a neighborhood streetscape, a garden/flowers/ledger motif
  - optional spot art: Opening Image, Catalyst, Midpoint, All Is Lost, Finale, Final Image
  - "The art should enrich the map, not swallow it."
  - DOCX adds: casting inspirations are not literal celebrity portraits; cinematic depth; fully framed subjects; don't crop heads, hands or key actions; art separate from text.
- **Standing:** UNANSWERED PROPOSAL. Cropping and casting rules likely reflect earlier Yolanda complaints.
- **Source:** L16113–16136; L16349

**S6-044**
- **Type:** Process
- **Statement:** Canva build notes:
  - start 48 × 36; use guides
  - build the act grid and repeatable beat cards before art
  - editable text
  - duplicate to 60 × 45 after the structure is right

  Illustrator build notes:
  - paragraph/character/color styles first
  - beat cards as components; 4 act-band grid
  - layers: Background, Decorative motifs, Illustrations, Structural shapes, Beat cards, Text, Status markers, Footer
  - linked art; unflattened type
  - export a print PDF per the provider's bleed/color specs
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L16140–16164; L16351–16354

**S6-045**
- **Type:** Acceptance test (Poster 1)
- **Statement:** Poster 1 checklist:
  - all 15 beats; DNotS included
  - acts correct; Theme Stated ~5% overlapping Setup; page landmarks consistent
  - three leads and the diverse neighborhood accurate
  - Francine's role not erased or reassigned; she orchestrates the fish-guts prank; the distraction is not locked to five dollars
  - ledger discovery separated from its use
  - alternating first-person POV mentioned
  - Established/Developing/Unanswered/Illustrative never conflated and visibly distinguishable
  - no cropped subjects; readable text at viewing distance
  - verify dimensions, effective PPI, bleed/safe margins and provider requirements
- **Standing:** UNANSWERED PROPOSAL. It encodes earlier Yolanda corrections.
- **Source:** L16168–16182; L16356

**S6-046**
- **Type:** Process
- **Statement:** Poster sequence for remaining volumes:
  - 2 Narrative Relationship Map
  - 3 Story Command Center
  - 4 Act I Companion
  - 5 Act IIA Companion
  - 6 Act IIB Companion
  - 7 Act III Companion
  - 8 Fish-Guts Sequence Map
  - 9 Character Depth & Integrity Map
  - 10 McKee Dramatic Engine Map
  - Volume 1 covers only Poster 1. The others are "discussed but not yet authored."
- **Standing:** UNANSWERED PROPOSAL. Posters 2–10 were never produced in this section, because Yolanda pivoted to the program.
- **Source:** L16186–16209; L16357–16359
- **Relationship:** Possibly relates to the earlier ten-poster plan

**S6-047**
- **Type:** UI-UX / Work habit
- **Statement:** Long chat output is "a lot to scroll through and read." She wants it as a downloadable document she can print and refer to while designing in Canva or Illustrator.
- **Why:** She works from printed references beside the computer.
- **Standing:** DECIDED BY YOLANDA ("Can you put all of this in a downloadable? Document that I can print")
- **Source:** L16213, 17:57
- **Relationship:** This general preference matters for the program: long guidance should be printable and exportable.

**S6-048**
- **Type:** Feature (delivered)
- **Statement:** "I Declare War Story Map Production Bible Volume 1," a 9-page PDF plus an editable DOCX. Recommendation: print the PDF and keep the DOCX for notes and revisions.
- **Standing:** ACCEPTED PROPOSAL (delivered at her request)
- **Source:** L16441–16477

## D. Pivot to building the program, deadline and scope

**S6-049**
- **Type:** Frustration / Decision
- **Statement:** "I'm tired of trying to work around the poster and the artwork. Let's get to the nitty gritty and start designing the program so that I can actually start using it."
- **Why:** The poster work had become an obstacle.
- **Standing:** DECIDED BY YOLANDA
- **Source:** L16481, 18:01
- **Relationship:** Effectively shelves Phase 1 poster production (Posters 2–10 not continued). It does NOT cancel S6-014; it deprioritizes it. UNCLEAR whether Phase 1 continues later.

**S6-050**
- **Type:** Constraint (schedule)
- **Statement:** She starts writing IDW on 11/1/2026 and must be finished planning by 10/31/2026. She corrected the date: "Actually today is 10/14/2026."
- **Standing:** DECIDED BY YOLANDA
- **Source:** L16481; L16491

**S6-051**
- **Type:** Process (rejected)
- **Statement:** ChatGPT's staged plan:
  - Oct 14–18 foundation
  - 19–23 planning tools
  - 24–27 connections
  - 28–30 test
  - 31 deadline
  - Nov 1 "WRITE THE DAMN STORY"
  - Plus a split between the "full Phase 2 vision" and a "November 1 writing release" (the smallest useful version).
- **Standing:** REJECTED ("Wrong.")
- **Source:** L16509–16545; rejection L16565
- **Relationship:** Replaced by S6-052

**S6-052**
- **Type:** Constraint / Decision
- **Statement:** The program must be fully functional with ALL Phase 2 items, built, tested and ready for full use by Saturday, October 17, 2026 (3–4 days). "There is no reason that this should take until october thirty first to keep designing."
  - Not an MVP, not a stripped-down substitute.
- **Why:** She needs the remaining two weeks to plan the novel in the tool.
- **Standing:** DECIDED BY YOLANDA ("This program should be fully functional, with the things that we said would be in phase two, all of those things... By Saturday, we should have it fully built. And tested")
- **Source:** L16565, 18:06
- **Relationship:** REPLACES S6-051 (Yolanda explicitly rejected it)

**S6-053**
- **Type:** Not wanted
- **Statement:** She does not want ChatGPT to reduce her requirements without her agreement, or to treat a minimum viable product as the deliverable.
- **Standing:** DECIDED BY YOLANDA (by rejection). ChatGPT acknowledged: "I shouldn't have reduced your requirements without your agreement."
- **Source:** L16565; L16573–16579

**S6-054**
- **Type:** Constraint (technology)
- **Statement:** Recommendation: a browser-based application that runs locally on her computer, with persistent storage and backups. No hosting or subscriptions are needed to start.
- **Standing:** UNANSWERED PROPOSAL. She did not object, and it was implemented that way.
- **Source:** L16551–16553

**S6-055**
- **Type:** Process (decided)
- **Statement:** Development workflow: ChatGPT builds the program. She will then take it to Claude to verify, "just like i've had you verify programs that claude initially built." ChatGPT's restatement: "ChatGPT builds → Claude independently reviews, challenges, and tests → findings addressed → released." The same process was used for Mama Dorothy.
- **Standing:** DECIDED BY YOLANDA ("once you build the program, I will take it to claude, to verify things")
- **Source:** L16623–16625, 18:12

**S6-056**
- **Type:** Frustration / Not wanted
- **Statement:** She does not want to be asked questions she has already answered. "How could you possibly ask me that question? You already know the answer. Everything about this program has only been discussed here."
  - She wants ChatGPT to use the existing design discussions and build.
- **Standing:** DECIDED BY YOLANDA
- **Source:** L16623
- **Relationship:** This general expectation also applies to the program's AI: don't re-ask settled decisions.

**S6-057**
- **Type:** Process
- **Statement:** The handoff to Claude should contain source code, installation instructions, test suite, test results, known limitations, and explicit instructions for challenging the application's behavior.
  - Testing: automated tests, integration tests, realistic workflows, data-integrity checks, adversarial scenarios.
  - "I'm not going to label anything complete simply because the code runs."
- **Standing:** UNANSWERED PROPOSAL. It is consistent with her process.
- **Source:** L16665–16671

**S6-058**
- **Type:** Process
- **Statement:** "Please implement." She authorizes implementation.
- **Standing:** DECIDED BY YOLANDA
- **Source:** L16681, 18:16

## E. StoryForge development build (code-revealed behavior)

**S6-059**
- **Type:** Feature (delivered build)
- **Statement:** The first executable build, provisionally named "StoryForge," was delivered as a ZIP with app, source, install instructions and tests.
  - Runs with `python app/server.py` at http://127.0.0.1:8765. Needs Python 3.10+.
  - Has a "Load I Declare War foundation" button.
  - Story data is stored locally.
- **Standing:** ACCEPTED PROPOSAL as a build. The NAME is REJECTED later (S6-108).
- **Source:** L16699–16767, 18:20

**S6-060**
- **Type:** Feature (status claims)
- **Statement:** ChatGPT's capability table, as claimed:
  - Working:
    - multiple novels; character records; acts/sequences/scenes/chapters; Save the Cat structure
    - McKee scene-value and dramatic-gap fields; questions and ideas capture
    - manuscript drafting and word counts; story-element relationships; linked-element impact identification
    - established/developing/unanswered statuses; backups/imports; manuscript export
    - AI recommendation review queue (without direct AI)
  - Partial: change history/revision restoration; automated structural checks.
- **Standing:** UNANSWERED PROPOSAL (claims). The later spec says these claims should not be trusted without reproduction (L18219).
- **Source:** L16713–16729
- **Relationship:** The later spec explicitly cautions against this table.

**S6-061**
- **Type:** Story data
- **Statement:** The starter IDW project contains 35 story elements:
  - leads; all 15 beats; A/B plot distinction; Confession significance
  - ledger discovery and use; established rules; open questions
  - A "curated starting foundation, not yet a complete import" of the bible.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L16731–16743

**S6-062**
- **Type:** Process
- **Statement:** Six automated tests passed. The API, project creation, retrieval, validation, backup export/import and page delivery were tested. "These are initial tests, not comprehensive certification."
  - Not yet done: direct AI-assisted analysis, sophisticated causal reasoning, deeper framework integration, production readiness.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L16745–16777

**S6-063**
- **Type:** Data model (code)
- **Statement:** Item kinds in code:
  project, character, relationship, plotline, beat, act, sequence, scene, chapter, draft, world, location, timeline, event, theme, motif, clue, payoff, question, idea, note, research, arc, value, gap, complication, stakes, antagonism, framework, goal, task, source, version, voice, setting, continuity.
- **Standing:** UNANSWERED PROPOSAL (implementation detail)
- **Source:** L17856

**S6-064**
- **Type:** Data model (code)
- **Statement:** Status states in code: established, developing, unanswered, illustrative, **proposed** (five states; "proposed" is added beyond the four poster states).
  - The default item status is "developing."
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L17857; L17868
- **Relationship:** ADDS TO S6-018 (adds Proposed). Restated in spec §4.2 (S6-121).

**S6-065**
- **Type:** Data model (code)
- **Statement:** SQLite schema:
  - projects (title, genre, description)
  - items (kind, title, body, status, position, meta JSON)
  - links (source, target, relation, notes; unique per triple)
  - history (entity, action, before_json, after_json)
  - recommendations (proposal, rationale, status pending)
  - settings
  - WAL journal; foreign keys; cascade deletes
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L17865–17875

**S6-066**
- **Type:** Behavior (code)
- **Statement:** Every create and update writes a history event with before/after JSON. This is the basis for audit and revert.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L17882; L17903; L17914

**S6-067**
- **Type:** Behavior (code)
- **Statement:** The ripple endpoint does a breadth-first traversal over all links (both directions) from an item. It returns affected items with distance, relation and direction, plus a note: "Impact candidates, not automatic edits. Review linked elements before accepting proposed changes."
- **Standing:** UNANSWERED PROPOSAL. The later spec calls this insufficient (S6-139).
- **Source:** L17916–17928

**S6-068**
- **Type:** Behavior (code)
- **Statement:** Validation:
  - warns when any of Save the Cat beats 1–15 is missing, or a beat number is duplicated
  - notice for a scene with no POV
  - warning when an item marked established has an illustrative source_type
  - notice for an unlinked payoff
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L17930–17942

**S6-069**
- **Type:** Feature (code)
- **Statement:** API routes:
  /api/projects, items, item ripple, links, validate, analysis, history, history/revert, export, import, recommendations, draft-export.
  - The README says: no external AI API; the AI Review Queue stores manually pasted suggestions and prevents automatic edits; not a completed release.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L17944–17951

**S6-070**
- **Type:** Constraint (environment)
- **Statement:** The data directory can be set by the STORYFORGE_DATA env variable; default is user_data/storyforge.sqlite3.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L17853–17854

## F. IDW character breakthrough (Kevin, Anthony, Francine)

**S6-071**
- **Type:** Process / Craft
- **Statement:** Yolanda's craft exercise: "If you were to write Kevin's last page of the novel in one line — who is he now? What is the Lie he had to drop to become him? Then His need. And his ghost. Use my story bible... WE can also talk it out."
  - This came from her "Fast homework" (L17721).
- **Why:** Working backward from the transformed character defines the arc.
- **Standing:** DECIDED BY YOLANDA (as a technique she uses)
- **Source:** L16789, 20:56
- **Relationship:** It shows a scenario for the program: work backward from a last-page identity to Lie/Need/Ghost, and talk it out conversationally.

**S6-072**
- **Type:** Story fact (IDW) / Proposal
- **Statement:** Proposed last-page Kevin: "Kevin is a man who no longer needs to win every confrontation to believe he deserves respect. He's learned that being seen matters more than being right, and that letting someone into his life isn't the same as giving them power over it." He is still Kevin, but without needing his defenses to do all the work.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L16825–16831
- **Relationship:** Later revised (S6-083)

**S6-073**
- **Type:** Story fact (IDW)
- **Statement:** ChatGPT's first-pass chain:
  - Lie (proposed): "If I don't protect myself and stay one step ahead, people will make a fool of me."
  - Need (proposed): to be vulnerable, imperfect, occasionally wrong without losing dignity.
  - Ghost (undecided): a past experience taught him being caught off guard means humiliation.
  - Truth (proposed): "I don't have to defeat someone to earn respect..."
  - The story bible labels its own Lie/Ghost/Want/Need chain as an example, not a decision.
- **Standing:** UNANSWERED PROPOSAL (Ghost explicitly undecided)
- **Source:** L16837–16877
- **Relationship:** ALTERNATIVE TO S6-081 (the later chain built on the job-loss Ghost). Both remain proposals.

**S6-074**
- **Type:** Story fact (IDW)
- **Statement:** The bible distinguishes Kevin's concrete Goal (win the neighborhood war; prove Anthony responsible) from his Ambition (to matter, be taken seriously, stop feeling like the fool).
- **Standing:** DECIDED BY YOLANDA (per the story bible; ChatGPT cites it). Ingermanson goal/ambition.
- **Source:** L16881–16887

**S6-075**
- **Type:** Story fact (IDW) / Possibility
- **Statement:** Irony: "The harder Kevin fights to avoid being made a fool, the more foolish he becomes." Kevin overlooks Francine, the person who matters most to the mystery. "He survives being wrong."
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L16891–16911

**S6-076**
- **Type:** Story fact (IDW) / Possibility
- **Statement:** Ghost options:
  - A: Kevin was humiliated (fears humiliation).
  - B: Kevin wasn't taken seriously when it mattered (fears invisibility). Option B parallels Francine, who actually is overlooked.
  - "I'm not suggesting we establish either option."
- **Standing:** POSSIBILITY
- **Source:** L16919–16945
- **Relationship:** Superseded in practice by Yolanda's own idea (S6-077). Not formally rejected.

**S6-077**
- **Type:** Story fact (IDW)
- **Statement:** Kevin's possible Ghost: he lost his job a long time ago, which left him insecure. "Because Kevin is Kevin," the insecurities trickled into his marriage, his behavior toward his family became weird, and he almost lost his wife and kids. "That's just a thought."
- **Standing:** POSSIBILITY, authored by Yolanda ("That's just a thought"). The spec correctly labels it exploratory.
- **Source:** L16949, 20:59
- **Relationship:** ALTERNATIVE TO S6-076 (her own option, beyond A/B)

**S6-078**
- **Type:** Story fact (IDW) / Proposal
- **Statement:** Proposed causal chain: job loss → insecurity becomes hypervigilance → marriage and family suffer → nearly loses family → present-day vow never to be caught off guard. "A possible causal chain... We can test each link."
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L16967–16998

**S6-079**
- **Type:** Principle (craft)
- **Statement:** Don't make the job loss the explanation for every strange thing Kevin does. He was Kevin before (dramatic, imaginative, competitive, catastrophizing; the Stephen King obsession predates it). "The experience didn't create his personality. It turned his existing personality into a defense mechanism." Keep the comedy; don't make the book a solemn exploration of unemployment.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L17022–17040
- **Relationship:** A general craft principle the program's AI could apply: a Ghost is not a symptom list.

**S6-080**
- **Type:** Story fact (IDW) / Possibility
- **Statement:** "Almost lost" means Kevin got a second chance he may not have learned to accept. The neighborhood war may not be his first war against an imagined enemy. The story bible already anticipates a wife character, whose identity and connection are still open. ChatGPT won't auto-assign that character to Kevin.
- **Standing:** POSSIBILITY. The wife assignment is UNANSWERED.
- **Source:** L17044–17064

**S6-081**
- **Type:** Story fact (IDW)
- **Statement:** What brought Kevin back from the edge: he agreed to go to therapy, both individual and couples counseling.
- **Standing:** DECIDED BY YOLANDA, as a definite answer within the possible Ghost backstory ("What brought him back from the edge is he agreed to go to therapy, individual and couples counseling"). The whole Ghost remains labeled exploratory in the spec.
- **Source:** L17080, 21:03
- **Relationship:** ADDS TO S6-077

**S6-082**
- **Type:** Story fact (IDW) / Proposal
- **Statement:** Working arc table:
  - Ghost: job loss → nearly lost family
  - Past growth: therapy
  - Remaining Lie: "If I let my guard down, I could lose everything again."
  - Want: defeat Anthony; prove no one can take advantage of him
  - Need: trust the growth already made; stop treating pride challenges as security threats
  - Last-page Kevin: can be wrong, embarrassed or outmaneuvered without believing his world is falling apart
  - "He needs to stop abandoning the healthier version of himself when his pride gets challenged."
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L17112–17123
- **Relationship:** It refines the interim table at L17002–17008 (Lie: "If I'm not in control, everything I've worked for can be taken away"; Truth: "I can lose control of a situation without losing my worth or the people who love me"). Both versions remain proposals.

**S6-083**
- **Type:** Story fact (IDW) / Possibility
- **Statement:** Comedy: Kevin knows what catastrophizing is (his therapist explained it), can name it, and catastrophizes anyway. Recurring joke: he mentally quotes the therapist, then explains why this situation is an exception. "I wouldn't make therapy itself the joke. Kevin's selective application of what he learned is the joke."
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L17125–17143

**S6-084**
- **Type:** Story question (IDW)
- **Statement:** Avoid having Kevin learn the same lesson twice. Possibility: therapy taught him how his behavior affects people he loves; the war teaches him to extend that awareness to people he doesn't yet understand (Anthony, Francine).
  - Open question: at the start, is his marriage healthy and stable, or still recovering with his wife worried he's slipping?
- **Standing:** POSSIBILITY. The open question is unanswered (Yolanda answered with the Fingleburger gag instead).
- **Source:** L17145–17165

**S6-085**
- **Type:** Story fact (IDW)
- **Statement:** During the shenanigans, Kevin's wife says, "Do I need to make you an appointment with Dr. Fingleburger?" with a raised eyebrow and a look of concern. "It'll be humorously played when I write it out." Dr. Fingleburger is Kevin's therapist.
- **Standing:** DECIDED BY YOLANDA ("I think there will be a time... when his wife says"). Placement is open.
- **Source:** L17169, 21:06
- **Relationship:** ADDS TO S6-081

**S6-086**
- **Type:** Story fact (IDW) / Analysis
- **Statement:** The Fingleburger line implies:
  - a marriage with history in a single exchange
  - the wife has seen this before
  - Kevin has sought help
  - she recognizes spirals
  - she is healed enough to use humor
  - "Concern, not just exasperation." It may be evidence the marriage is healthy, not in trouble. It is an economical reminder of the Ghost without an exposition dump. Early the name is just funny; later it carries meaning.
- **Standing:** UNANSWERED PROPOSAL (interpretation)
- **Source:** L17189–17226

**S6-087**
- **Type:** Story fact (IDW)
- **Statement:** Kevin's line: "First of all, I don't appreciate the implication that my perfectly reasonable concerns about Anthony Vernon require professional intervention."
- **Standing:** DECIDED BY YOLANDA ("I'm keeping that for the book!"). Placement is open.
- **Source:** ChatGPT wrote it at L17206; Yolanda adopted it at L17238, 21:08

**S6-088**
- **Type:** Story fact (IDW)
- **Statement:** Visual gag: someone stands in the kitchen holding a notebook documenting seventeen alleged violations of neighborhood etiquette.
  - Yolanda first said "Keeping that too!" for Kevin. She then said Anthony "would be a notebook wielding fool too!" ChatGPT reassigned it to Anthony as "more naturally Anthony's territory."
- **Standing:**
  - The gag is DECIDED BY YOLANDA as a keeper.
  - Ownership was reassigned to Anthony by an ACCEPTED/UNANSWERED PROPOSAL. Yolanda's "too" is ambiguous (Anthony also, or instead?).
  - The spec says: do not codify notebook ownership as Kevin's canon.
- **Source:** L17208; L17240; L17293; L17326–17334
- **Relationship:** UNCLEAR. Yolanda's "too" could mean both men carry notebooks. ChatGPT treated it as REPLACES (Kevin narrates; Anthony documents). See Unclear items.

**S6-089**
- **Type:** Principle (craft)
- **Statement:** Be careful about character habits. Do not give one character a habit that belongs to another, especially when the habit reveals something fundamental about that other character.
- **Why:** It keeps the characters distinct.
- **Standing:** DECIDED BY YOLANDA ("We have to be careful about his habits though")
- **Source:** L17293, 21:11
- **Relationship:** This is a program requirement too: a character-integrity or voice check that flags behaviors assigned to the wrong character.

**S6-090**
- **Type:** Story fact (IDW)
- **Statement:** Anthony is the neighborhood HOA "bully"/"rule-enforcer." He doesn't respect boundaries set by others (like Francine's) and he pushes people's buttons (like Kevin's).
- **Standing:** DECIDED BY YOLANDA
- **Source:** L17293

**S6-091**
- **Type:** Story fact (IDW) / Proposal
- **Statement:** Kevin vs Anthony contrast ("different operating systems"):

  | | Kevin | Anthony |
  |---|---|---|
  | Core behavior | reacts to perceived threats | enforces rules, pushes boundaries |
  | Comic engine | paranoid overreaction | deadpan provocation, selective righteousness |
  | Blind spot | mistakes suspicion for evidence | mistakes authority for permission |

  - Kevin narrates and produces testimony; Anthony produces documentation and cites "Section 4, Paragraph B."
  - "Anthony is prosecuting a neighborhood violation. Kevin is prosecuting a personal betrayal."
  - Anthony is selective: organized against others, casual when rules inconvenience him.
  - Kevin's question: "Why is everybody always trying to get over on me?" Anthony's: "Why is everybody making such a big deal out of something that clearly doesn't apply to me?"
- **Standing:** UNANSWERED PROPOSAL. Section 4 Paragraph B is an EXAMPLE.
- **Source:** L17307–17392

**S6-092**
- **Type:** Story fact (IDW)
- **Statement:** Anthony is NOT on the HOA board and holds no position. "He WANTS to be important. Just like Kevin... just different motivations and ghosts."
- **Standing:** DECIDED BY YOLANDA ("Hell no! Anthony is not on the HOA board or in a position")
- **Source:** L17400, 21:14

**S6-093**
- **Type:** Story fact (IDW)
- **Statement:** Kevin and Anthony share an underlying hunger to matter, with different motivations and different Ghosts. Anthony's Ghost is NOT yet established; ChatGPT "won't invent that answer."
- **Standing:** DECIDED BY YOLANDA (shared hunger, different Ghosts). Anthony's Ghost is UNANSWERED.
- **Source:** L17400; L17414–17420

**S6-094**
- **Type:** Story fact (IDW) / Proposal
- **Statement:** "Two men. One hunger. Different defenses" table:
  - Kevin wants respect and pursues it through hypervigilance.
  - Anthony wants importance and pursues it through self-appointed authority.
  - Kevin is threatened by being blindsided; Anthony by being treated as though his authority doesn't matter.
  - Anthony's blind spot: entitled to influence he hasn't earned (ChatGPT's interpretation).
  - "Kevin is trying to protect his importance. Anthony is trying to establish his."
  - Anthony is not necessarily insecure; he may be confident and charismatic. His Ghost explains a need for recognition vs Kevin's need for protection.
  - "The HOA behavior isn't the Ghost. It's the symptom."
  - Key question: "Why does Anthony need to be the most important man on a street where nobody elected him to anything?"
- **Standing:** UNANSWERED PROPOSAL. The key question is unanswered.
- **Source:** L17424–17483

**S6-095**
- **Type:** Story fact (IDW)
- **Statement:** Thematic link: neither man respects the boundaries around Francine's garden. Her property is repeatedly violated by their dogs. She shows that the person with the least apparent authority can exercise the most influence.
- **Standing:** The dogs damaging the garden is established in the bible. The thematic framing is an UNANSWERED PROPOSAL.
- **Source:** L17447–17461

**S6-096**
- **Type:** Story fact (IDW)
- **Statement:** Anthony has a podcast. Once the men team up, he interviews Kevin on it, and at the end they co-host a podcast on YouTube.
- **Standing:** DECIDED BY YOLANDA as an idea ("Anthony would have a freaking podcast... at the end, they'd co-host"). The spec labels it a "developing possibility."
- **Source:** L17487, 21:16

**S6-097**
- **Type:** Story fact (IDW) / Proposal
- **Statement:** The podcast measures their friendship:
  - beginning: Anthony's own platform
  - later: Kevin as an uncontrollable guest (seven-minute non-answers)
  - end: co-hosts
  - It externally demonstrates internal change: Anthony learns to share the spotlight; Kevin participates without treating disagreement as a threat. They don't become less ridiculous; "growth doesn't erase their personalities."
  - The podcast should not make Anthony a good listener.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L17509–17576

**S6-098**
- **Type:** Example / Illustration
- **Statement:** Sample exchange:
  - Anthony: "Today we're joined by a man who has filed more imaginary complaints than the entire HOA has received in the last decade."
  - Kevin: "First of all, they were not imaginary. They were unacknowledged."
  - Explicitly "a proposed exchange, not established dialogue."
- **Standing:** EXAMPLE / ILLUSTRATION
- **Source:** L17562–17570

**S6-099**
- **Type:** Story fact (IDW) / Possibility
- **Statement:** The co-hosted podcast could be part of the Final Image, or a glimpse of life after. It should NOT replace Francine's garden as the visual mirror between opening and ending. Imagined: the garden flourishing, Francine seen, the two men arguing over whose name comes first.
- **Standing:** POSSIBILITY
- **Source:** L17578–17590
- **Relationship:** DIFFERENT SUBJECT FROM the established garden-mirror Final Image; it coexists with it.

**S6-100**
- **Type:** Story fact (IDW)
- **Statement:** The podcast is titled "The Voice of Reason" (working title).
- **Standing:** DECIDED BY YOLANDA as the working title ("he'd probably call it 'The Voice of Reason!'")
- **Source:** L17600, 21:17

**S6-101**
- **Type:** Story fact (IDW) / Proposal
- **Statement:** The title is both Anthony's self-image and the central joke: he believes he's the reasonable one while provoking Kevin.
  - End-state banner: "THE VOICE OF REASON with Anthony Vernon & Kevin Wickley."
  - Credits-order argument example: correlation vs causation; Kevin requests an independent audit of the analytics.
  - "Friendship demonstrated through behavior rather than explained through dialogue."
- **Standing:** UNANSWERED PROPOSAL. The banner and credits jokes are EXAMPLES.
- **Source:** L17614–17665

**S6-102**
- **Type:** Principle (structure)
- **Statement:** The podcast should serve the friendship arc within the A story. It must not become a separate subplot competing with Francine's hidden B story. "The real payoff... these two men... now willingly give each other a microphone."
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L17667–17671
- **Relationship:** ADDS TO the established A/B plot distinction (spec §9)

**S6-103**
- **Type:** Story fact (IDW)
- **Statement:** At the end, they start the podcast with "Giving honor to God, and Miss Francine…"
- **Standing:** DECIDED BY YOLANDA as an idea ("AT the end, I can see them starting the podcast off with"). Exact placement is open; the spec calls it a candidate final-scene payoff.
- **Source:** L17675, 21:20

**S6-104**
- **Type:** Principle (craft)
- **Statement:** That line is a character-arc payoff for Francine: she moves from overlooked to acknowledged right after God. "The audience doesn't need to know exactly why they're honoring her. But the reader does." Don't explain the joke in the manuscript; deliver it with straight faces; "they mean every single word."
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L17695–17717

**S6-105**
- **Type:** Process / Constraint (data preservation)
- **Statement:** "What started as an exercise for my Fast homework, turned into a full understanding of my characters. Please lock this entire conversation in somewhere. I cannot lose any of it."
- **Why:** Breakthroughs happen in conversation and must be captured.
- **Standing:** DECIDED BY YOLANDA
- **Source:** L17721, 21:22
- **Relationship:** Strong program requirement: capture conversational discoveries verbatim, losslessly and retrievably. ChatGPT itself says: "That's the kind of discovery your novel-writing program needs to help you capture... far too valuable to leave buried in a chat" (L17772–17774).

**S6-106**
- **Type:** Feature (delivered)
- **Statement:** "I Declare War: Character Breakthrough Archive," 5 pages (PDF + DOCX), plus a memory entry. ChatGPT caveat: it is a "detailed reconstruction... not a verbatim export of every message." Keep the original conversation too. It preserves which ideas were accepted versus still being explored.
- **Standing:** ACCEPTED PROPOSAL (delivered)
- **Source:** L17740–17766
- **Relationship:** The archive is non-verbatim, which falls short of her "entire conversation" request. The program should be able to hold verbatim transcripts.

**S6-107**
- **Type:** Principle
- **Statement:** The convergence: three people who all want to be seen, each for different reasons (Kevin, Anthony, Francine).
- **Standing:** UNANSWERED PROPOSAL (thematic synthesis)
- **Source:** L17770

## G. Name and the full Phase 2 specification for Claude

**S6-108**
- **Type:** Decision / Not wanted
- **Statement:** The name "StoryForge" is rejected. "I will rename that because I dislike 'Forge'." The name stays undecided and is the author's to choose.
- **Standing:** REJECTED / DECIDED BY YOLANDA
- **Source:** L17778, 2026-10-15 07:59
- **Relationship:** REPLACES the provisional name in S6-059

**S6-109**
- **Type:** Process
- **Statement:** She will share the program with Claude, but Claude needs background and details: "things you and I inherently know the tool is designed to do; but it doesn't." She wants "a full write up. Not a brief. But the details of what the FULL phase 2 is to do."
- **Standing:** DECIDED BY YOLANDA
- **Source:** L17778–17780

**S6-110**
- **Type:** Process
- **Statement:** The spec should distinguish:
  - what was explicitly decided
  - what the current build actually implements
  - what Claude should test or flag as incomplete
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L17784

**S6-111**
- **Type:** Principle (spec §1)
- **Statement:** The spec defines the full scope of Phase 2. It is not a description of the ZIP, not an MVP, and not an invitation to trim the project to CRUD. Claude must not redefine Phase 2 downward to match the implementation.
- **Standing:** ACCEPTED PROPOSAL (matches S6-052; Yolanda: "This good details for Claude")
- **Source:** L17979
- **Relationship:** RESTATEMENT OF S6-052

**S6-112**
- **Type:** Principle (spec §1)
- **Statement:** Source hierarchy:
  1. explicit author decisions in discussions
  2. the 10/13/2026 IDW Story Bible v5 and the subsequent character conversation
  3. agreed design principles
  4. engineering recommendations
  - "A demonstrated possibility is not canon."
- **Standing:** UNANSWERED PROPOSAL (approved in general by "This good details")
- **Source:** L17981

**S6-113**
- **Type:** Principle (spec §2)
- **Statement:** A local-first intelligent novelist's workspace spanning inspiration, analysis, planning, drafting, revision and recovery of creative context.
  - The user is a "prolific, nonlinear, iterative novelist who connects ideas associatively, often jumps between projects, and can freeze under too much planning."
  - Not a rigid project-management database or an administrative intake form. "Powerful under the hood and welcoming in daily use."
- **Standing:** ACCEPTED PROPOSAL (restating earlier Yolanda descriptions)
- **Source:** L17987
- **Relationship:** RESTATEMENT of earlier-section user description (possibly relates to earlier decisions)

**S6-114**
- **Type:** Principle (spec §2)
- **Statement:** The product should:
  - (a) capture thoughts as fast as they arrive
  - (b) turn them into story knowledge only when the author chooses
  - (c) keep stable, searchable continuity
  - (d) apply frameworks as lenses, not rigid hoops
  - (e) show relationships and ripple effects
  - (f) return the author to the exact context after a detour
  - (g) allow and prioritize prose drafting from day one
  - It must support multiple books and genres, and must not be hard-coded as IDW software.
- **Standing:** ACCEPTED PROPOSAL
- **Source:** L17989
- **Relationship:** RESTATEMENT of earlier decisions (capture-first, Return to Writing, generality)

**S6-115**
- **Type:** Principle (spec §2)
- **Statement:** The author retains creative authority. The tool may point out issues, ask questions, analyze and propose, but may not silently declare, revise, resolve or overwrite canon. "An AI suggestion is not a fact. An illustration is not a fact. An example in a craft book or story bible is not a fact."
- **Standing:** ACCEPTED PROPOSAL (restating earlier Yolanda decisions)
- **Source:** L17991

**S6-116**
- **Type:** Acceptance criterion (spec §2.1)
- **Statement:** Success is behavioral. The author sits down with a half-formed idea, records it without deciding where it belongs, gets relevant guidance without being railroaded, optionally connects it, and immediately resumes writing. "A sophisticated character-development module that delays drafting is a failure, even if it has hundreds of fields."
- **Standing:** UNANSWERED PROPOSAL (approved in general)
- **Source:** L17993–17995

**S6-117**
- **Type:** Constraint (spec §2.2)
- **Statement:** Phase 2 does NOT need:
  - a poster publishing system
  - generative wall posters
  - large-format print preflight
  - image-based visual maps
  - the full Story Universe

  Phase 2 DOES need:
  - ordinary on-screen navigation
  - connections, outlines, hierarchies, dependency views
  - Narrative Zoom
  - The absence of the visualization engine is not permission to omit narrative navigation.
- **Standing:** ACCEPTED PROPOSAL
- **Source:** L17997–17999
- **Relationship:** RESTATEMENT OF S6-007 and S6-008

**S6-118**
- **Type:** Feature list (spec §3)
- **Statement:** Fifteen core Phase 2 domains, integrated as one system:
  1. multi-project library with adaptable genre/form/framework settings
  2. Story Brain
  3. quick capture with Questions I Have / Things & Ideas I'm Thinking About and return-to-context
  4. deep character development (identity, agency, values, goal vs ambition, conflict, epiphany, Lie/Ghost/Want/Need, flat/positive/negative arc, three-level antagonism, relationships, contrasting voices, contradictions, integrity)
  5. story spine (premise, controlling/moral idea, dramatic question, logline, synopsis, A/B plots and emotional arcs, acts, sequences, beats, scenes, chapters, explicit unknowns)
  6. framework-aware analysis (Snyder/Save the Cat, Jessica Brody novel percentages, McKee, Weiland, Ingermanson, cross-framework equivalence)
  7. scene and sequence engineering
  8. manuscript drafting studio
  9. Narrative Zoom
  10. continuity/clue/reveal/misdirection tracking, timelines, POV knowledge, locations, objects, worldbuilding, payoff audits
  11. relationships and ripple effects
  12. AI collaboration
  13. search/import/backup/restore/history/portability
  14. a deliberate daily author experience with project-specific milestones
  15. quality/security/privacy/maintainability
  - Completeness is judged on integrated workflows, not fields.
- **Standing:** ACCEPTED PROPOSAL (approved in general)
- **Source:** L18001–18021
- **Relationship:** RESTATEMENT/expansion of S6-006. It adds Brody, three-level antagonism and epiphany. Possibly relates to earlier decisions. It does not mention the Writing Trail or Swain/Truby/Kaplan by name; omission does not cancel them.

**S6-119**
- **Type:** Data model (spec §4.1)
- **Statement:** Minimum entities:
  - projects, works/versions, story spine, themes/controlling ideas
  - plotlines, subplots, emotional arcs
  - characters, relationships, desires/wants/needs, Ghosts, Lies
  - values, stakes, antagonistic forces
  - acts, sequences, beats, scenes, chapters, prose fragments
  - events/chronology, places, objects
  - clues, red herrings, secrets, reveals, payoffs
  - continuity rules, research, ideas, questions, decisions
  - source documents, revisions, AI proposals, connections/dependencies
  - Typed and validated, with referential integrity; not one indistinguishable note field.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L18027

**S6-120**
- **Type:** Data model (spec §4.1)
- **Statement:** Each record has:
  - stable ID, project membership, title/content, type, status
  - source/provenance, ownership, timestamps, revision marker, tags
  - edges and retrievable linked context
  - Long-form notes are kept without text loss. "Don't force every possible field at creation."
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L18029

**S6-121**
- **Type:** Data model (spec §4.2)
- **Statement:** Five required states: Established/confirmed; Developing/exploring; Unanswered/open; Illustrative/demonstration; Proposed (AI or author option).
  - An unanswered question is not a weak fact.
  - A proposal is not established until explicitly accepted.
  - An example can't become canon via import or summary.
  - Transitions are deliberate and auditable, recording who accepted and what was replaced.
- **Standing:** UNANSWERED PROPOSAL (extends earlier Yolanda status rules)
- **Source:** L18033
- **Relationship:** ADDS TO S6-018 and S6-064

**S6-122**
- **Type:** Data model / Behavior (spec §4.2)
- **Statement:** Contradictory competing possibilities are supported intentionally. Two theories about a Ghost can coexist, and one can be tested without deleting the other. The UI shows which statement is current canon, when nothing is chosen, and when something is illustrative.
- **Standing:** UNANSWERED PROPOSAL. It reflects this section's Kevin Ghost A/B/job-loss alternatives.
- **Source:** L18035

**S6-123**
- **Type:** Data model (spec §4.3)
- **Statement:** Source provenance:
  - Imports keep filename, position/excerpt, timestamp, confidence/extraction notes.
  - Distinguish "source says X" from "AI inferred Y."
  - Flag or ask when sources conflict rather than picking a winner.
  - Trace back from any summary, suggestion or link to source passages.
  - No black-box transformation of the story bible.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L18039

**S6-124**
- **Type:** Data model (spec §4.4)
- **Statement:** Story knowledge and manuscript prose are different objects.
  - Editing one never silently rewrites another.
  - Supports states like "drafted but not canon" and "canon but not yet dramatized."
  - A beat is not necessarily one scene; a scene may serve several arcs.
  - Prose can intentionally contradict plans until resolved.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L18043

**S6-125**
- **Type:** Feature (spec §5.1)
- **Statement:** Questions I Have:
  - fast entry; can stay unassigned
  - can later link to a character, arc, beat, scene, timeline or craft issue
  - holds candidate answers, assumptions, urgency, dependencies and resolution
  - "Closing a question does not mean erasing its previous alternatives."
- **Standing:** ACCEPTED PROPOSAL (Yolanda-named feature, restated)
- **Source:** L18049
- **Relationship:** RESTATEMENT/expansion of an earlier Yolanda feature

**S6-126**
- **Type:** Feature (spec §5.1)
- **Statement:** Things & Ideas I'm Thinking About is a frictionless place for:
  - fragments, dialogue lines, names, motifs, research leads
  - potential Ghosts, funny situations, competing endings
  - unexpected links and images
  - "Capture first, organize later" (the user's explicit request). No forced taxonomy, template or answer before saving.
- **Standing:** DECIDED BY YOLANDA earlier ("capture first, organize later" quoted as her request)
- **Source:** L18051
- **Relationship:** RESTATEMENT of an earlier decision

**S6-127**
- **Type:** Scenario (spec §5.2)
- **Statement:** The author types "Anthony would have a podcast: The Voice of Reason." One action:
  - saves the exact text
  - tags it as a developing idea
  - optionally links Anthony
  - offers to explore ripple effects
  - Does NOT invent schedule, set, audience, episodes or placement.
  - Recording "Giving honor to God, and Miss Francine…" can mark it a candidate final-scene payoff without rewriting the final chapter or claiming it is placed.
- **Standing:** UNANSWERED PROPOSAL. The scenario is derived from this section's real usage.
- **Source:** L18055

**S6-128**
- **Type:** Feature (spec §5.3)
- **Statement:** Branch and return. Step away from a scene into a character question, an idea about another novel, or a framework explanation, then resume the precise prior context with one obvious action.
  - "Return to Writing" retains location, scroll/cursor if feasible, active draft, and which question prompted the detour.
  - "No punishment for associative working style."
- **Standing:** ACCEPTED PROPOSAL (Yolanda's earlier Return to Writing feature)
- **Source:** L18059
- **Relationship:** RESTATEMENT of earlier Return to Writing; possibly relates to the earlier Writing Trail (not named here)

**S6-129**
- **Type:** Feature (spec §6.1)
- **Statement:** Save the Cat: all 15 beats in order, with approximate %/page, notes, scenarios and linked scenes, plus conventional act boundaries.
  - Percentages are "orientation, not tyrannical hard constraints." "A book can depart from a template without the system claiming the author is wrong."
  - Beat function is separate from the concrete event (e.g. "specific event undecided" for the Midpoint).
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L18065–18067
- **Relationship:** ADDS TO S6-027

**S6-130**
- **Type:** Feature (spec §6.2)
- **Statement:** McKee's dramatic engine per scene:
  - opening/closing values and polarity
  - desire/expectation vs actual result; the gap
  - turning point, forces of antagonism, progressive complications, stakes
  - negation of the negation
  - Diagnostic questions: Did the value turn? Did the outcome contradict expectation? Is pressure escalating or repeating? Do antagonists close easy exits?
  - "Avoid treating interpretation as mathematically provable."
- **Standing:** UNANSWERED PROPOSAL (restating earlier McKee decisions)
- **Source:** L18071

**S6-131**
- **Type:** Feature (spec §6.3)
- **Statement:** Weiland arcs for every major character:
  - arc type (positive, flat, negative, unknown)
  - Ghost, Lie, Want, Need/Truth
  - challenges and tests, final transformed state, unresolved issues
  - interplay of internal and external events
  - A flat arc is not a thin character. A character can have multiple arcs (Francine: flat on respect, positive on loneliness).
- **Standing:** UNANSWERED PROPOSAL. The Francine dual arc was "contemplated" earlier (possibly relates to an earlier discussion).
- **Source:** L18075

**S6-132**
- **Type:** Feature (spec §6.4)
- **Statement:** Ingermanson/Snowflake:
  - optional progression from one-sentence premise → paragraph → expanded synopsis → details
  - concrete Goal vs abstract Ambition
  - Values ("Nothing is more important than..."), Conflict, Epiphany, scene summaries
  - Accommodates a nonlinear user who starts with dialogue and backfills the spine.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L18079

**S6-133**
- **Type:** Feature (spec §6.5)
- **Statement:** Cross-framework mapping, e.g. Break into Two / First Plot Point / Crossing the First Threshold. Terminology and positions vary. Multiple lenses apply to one linked event without duplicating canon. Frameworks are selectable, extensible and not forced on every genre (comedy, thriller, romance, speculative, children's, literary, hybrid). Do not assume IDW's shape.
- **Standing:** UNANSWERED PROPOSAL (aligned with the program-is-general principle)
- **Source:** L18083

**S6-134**
- **Type:** Feature (spec §7)
- **Statement:** Character profiles support:
  - contradictory values, competencies, weaknesses, agency under pressure
  - comic engine, motivation, behavior vs underlying hunger, speech patterns
  - roles, relationships, backstory, arc evolution, POV knowledge
  - Decided appearance is separate from a casting "tuning fork" reference; an actor inspiration is not the literal description.
  - Identities are represented accurately, without auto-stereotyping or invented biography.
- **Standing:** UNANSWERED PROPOSAL. The casting distinction likely reflects an earlier Yolanda decision.
- **Source:** L18087

**S6-135**
- **Type:** Feature (spec §7)
- **Statement:** Relationship views distinguish:
  - external plot opposition
  - real emotional trajectory
  - hidden influence
  - false assumptions
  - information asymmetry
  - Changes link to specific scenes and choices. Two characters may share a need to matter with different Ghosts and defenses.
- **Standing:** UNANSWERED PROPOSAL (derived from this section's Kevin/Anthony insight)
- **Source:** L18089

**S6-136**
- **Type:** Feature (spec §8)
- **Statement:** Editorial hierarchy is novel → act → sequence → beat/scenes → chapter/prose, with flexible mapping: a chapter can hold many scenes; a beat can span scenes; a scene can serve several arcs. Reordering must not lose prose or links.

  Scene worksheet fields:
  - title/ID; narrative and chronological order; draft status
  - POV, location/time, participants, perspective knowledge
  - goal, stakes, inciting disturbance, expectation, result, Gap
  - opening/closing values, conflict, complication, turn
  - disaster/reaction/dilemma/decision (Swain-style; not named)
  - A/B membership, arc movement, setup/clue/payoff
  - continuity constraints, questions, notes, passage
  - A concise mode is available instead of all fields.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L18097–18101
- **Relationship:** The Swain scene/sequel elements appear without Swain being named (possibly relates to earlier framework discussion).

**S6-137**
- **Type:** Feature (spec §8.3–8.4)
- **Statement:** Sequence tracking:
  - goal, cascading complications, reversals, culmination, transition
  - Surfaces repetitions (e.g. "three pranks with unchanged dramatic value") and missing bridges as editorial hypotheses, not errors.
  - Supports chronology out of narrative order, flashbacks, withheld reveals.

  POV rules are project-defined:
  - For IDW, one first-person narrator per scene is a hard integrity rule; other novels differ.
  - Tracks character knowledge vs reader knowledge vs suspicion vs truth.
  - Hidden plots get author-only truth records so reveals don't leak into POV/AI summaries.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L18105–18109

**S6-138**
- **Type:** Feature (spec §9)
- **Statement:** Author-only registers:
  - (a) secret-operations truth
  - (b) planted clues, foreshadowing, payoffs
  - (c) reader-knowledge/suspicion curve vs each POV character
  - (d) continuity/audit outcomes
  - For each item: what's seen, what it appears to mean, what it actually means, who knows, where it pays off. Inspect "reader belief versus underlying truth" without POV leakage.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L18113

**S6-139**
- **Type:** Story fact (IDW) (spec §9 and Appendix A)
- **Statement:** Ledger:
  - Francine's real garden ledger is planted early.
  - The men discover it around All Is Lost as a humiliating gut-punch revelation, NOT a victory.
  - They wield it later in the Finale for one genuine win.
  - Francine wins the warmer, larger game with dignity, not humiliated.
  - Discovery and payoff are never merged.

  Fish guts:
  - Francine plants them in Anthony's yard while the men are distracted.
  - The smell comes first; cats, then raccoons, arrive after a delay.
  - Anthony wrongly accuses Kevin; Kevin truthfully denies it.
  - The diversion mechanism (five-dollar bill) is NOT decided.
- **Standing:** DECIDED BY YOLANDA (per the story bible and earlier corrections). The diversion is UNANSWERED.
- **Source:** L15459–15479; L16295–16297; L16346; L18115; L18246–18247
- **Relationship:** Possibly relates to earlier decisions. "Planted early" appears only in the spec, not in the poster facts list.

**S6-140**
- **Type:** Story fact (IDW)
- **Statement:** The Kevin/Anthony rivalry-to-friendship is an arc within the A plot, not a separate third plotline. Francine's hidden operations and awakening are the B story. The plotline ontology must handle this.
- **Standing:** DECIDED BY YOLANDA (per the story bible: "external A story is escalating feud; Francine's concealed operations and emotional journey form the B story"; L16291)
- **Source:** L16291; L18117

**S6-141**
- **Type:** Feature (spec §10)
- **Statement:** Drafting:
  - usable during planning (before 11/1) and drafting
  - focused mode; direct navigation to scene/beat/character context
  - fast scene creation; reliable autosave or clear save state; unsaved-change protection
  - word counts at useful levels; chapter/scene assembly; configurable order
  - find/search; revisions/history; manuscript export
  - Formatting supports readable prose, not design work while drafting.
  - Imports don't lose formatting or silently replace words.
  - Writing works when AI is offline or disabled.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L18121

**S6-142**
- **Type:** Feature (spec §10)
- **Statement:** Return to Writing: find the last place she was writing, optionally see the local task/question, and type immediately. One-line re-entry prompts are optional, not mandatory. The app never requires the spine to be "complete" before drafting.
- **Standing:** ACCEPTED PROPOSAL (Yolanda's feature, restated)
- **Source:** L18123
- **Relationship:** RESTATEMENT OF S6-128

**S6-143**
- **Type:** Feature (spec §10.1)
- **Statement:** Exports:
  - lossless plain text/Markdown/structured JSON backup
  - manuscript export (e.g. DOCX) with predictable chapter order
  - Full manuscript export and full project backup are different capabilities; both are verified. Be explicit about which formats are supported.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L18127

**S6-144**
- **Type:** Feature / Scenario (spec §11)
- **Statement:** Narrative Zoom is operational in Phase 2. Scenario: click from the novel spine → Act IIB → All Is Lost beat → linked ledger reveal scene → what Kevin and Anthony know then → trace the finale payoff → return to the draft.
  - Zoom levels: novel, plotline/character arc, act, sequence, beat, scene, passage.
  - Protect hierarchy; don't dump the database.
  - Breadcrumbs, cross-links, saved state and quick return matter more than fancy diagrams.
- **Standing:** ACCEPTED PROPOSAL (Yolanda's Narrative Zoom, restated)
- **Source:** L18131
- **Relationship:** RESTATEMENT OF S6-008, adding the plotline/arc level

**S6-145**
- **Type:** Constraint (spec §11)
- **Statement:** Ordinary lists, outline trees, relationship panels, scene timelines and dependency tables belong in Phase 2. Deterministic posters, large-format art, publishing templates and advanced designed maps belong in Phase 3. "Do not quietly pull that scope back into Phase 2."
- **Standing:** ACCEPTED PROPOSAL
- **Source:** L18133

**S6-146**
- **Type:** Feature (spec §12)
- **Statement:** The Ripple Effects change-impact engine is "more than show items connected by a link." It identifies effects of changes to:
  - plot facts, motivations, POV, sequence order, timeline, knowledge
  - continuity, setups/payoffs, manuscript passages
  - It explains causal path reasons, risk/severity and what to review.
  - It distinguishes direct dependency from speculative connection and avoids huge misleading cascade lists.
  - It never silently edits.
  - Users can accept/reject/defer/resolve impacts and review consequences of a proposal before promoting it to canon.
- **Standing:** ACCEPTED PROPOSAL (Yolanda's Ripple Effect, restated)
- **Source:** L18137
- **Relationship:** ADDS TO S6-067 (says the code's BFS is insufficient)

**S6-147**
- **Type:** Scenario / Acceptance test (spec §12)
- **Statement:** Required scenario: the user revises the midpoint. The app identifies related scene outcomes, value shifts, setup/payoff links, character trajectories and downstream beats. Unrelated profiles are unchanged. The original decision and manuscript stay recoverable. "A variation in a comedic detail should not trigger a wholesale rewrite of the book."
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L18139

**S6-148**
- **Type:** Scenario (spec §12)
- **Statement:** Required scenario: the user decides Anthony has a podcast tentatively named The Voice of Reason. It is stored as developing; candidate scene connections are offered; no invented episodes or appearances. Approving the final acknowledgment must not fabricate a final scene.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L18141
- **Relationship:** RESTATEMENT OF S6-127

**S6-149**
- **Type:** Feature (spec §13)
- **Statement:** AI collaboration is real intelligent assistance, "not merely a textbox for pasting an AI suggestion." Functions:
  - contextual character interrogation; alternative Ghost/Lie/Need chains
  - scene Gap/values critique; escalating complications; thematic coherence; causal holes
  - age/timeline consistency; POV leakage checks; continuity questions
  - dialogue-voice comparison; alternatives and objections
  - summarizing context for a scene; identifying unanswered questions
  - draft feedback; controlled opt-in prose brainstorming
  - Document keys, costs, data handling and offline behavior.
- **Standing:** UNANSWERED PROPOSAL. It expands the earlier AI decisions. The S6-071 exercise (talking out Kevin's Ghost) is a model of "contextual character interrogation."
- **Source:** L18145

**S6-150**
- **Type:** Behavior (spec §13)
- **Statement:** AI must:
  - cite linked records/excerpts for source claims; label inference
  - distinguish "here's one way" from "this is established"
  - avoid fake certainty; preserve author voice rather than homogenizing prose
  - offer accept/reject/defer per recommendation
  - show an exact before/after preview on accept and create a reversible history entry
  - never auto-apply Ghosts, motives, events, dialogue or relationships to canon
- **Standing:** UNANSWERED PROPOSAL (consistent with Yolanda's author-control principle)
- **Source:** L18147

**S6-151**
- **Type:** Feature (spec §13)
- **Statement:** AI conversational modes:
  - **Teach it** (explain a technique)
  - **Show it** (a demonstration, not a decision)
  - **Hand it to me** (the author's blank/prompt)
  - **Critique/Challenge** (find holes without fixing)
  - Keep the primary writer action available: "Write."
- **Standing:** UNANSWERED PROPOSAL. It mirrors the story bible's "What it is / One way I could play it / Over to me" structure (possibly relates to an earlier decision).
- **Source:** L18149

**S6-152**
- **Type:** UI-UX (spec §14)
- **Statement:** Daily UX:
  - associative, not "fill all fields"
  - progressive disclosure, smart defaults, unobtrusive guidance
  - one-line capture; follow a rabbit trail and return
  - "Where was I?" / "Return to Writing" entry; resurfaced work; obvious search
  - gentle surfacing of stalled important threads
- **Standing:** UNANSWERED PROPOSAL (restating earlier preferences)
- **Source:** L18153

**S6-153**
- **Type:** Not wanted / UI-UX (spec §14)
- **Statement:** Show project-specific milestones and progress WITHOUT generic pie charts or bar charts, "which this author dislikes." Progress should prioritize scenes drafted, open key decisions, first-pass structure, drafting momentum and completed work, not the number of database records.
- **Standing:** DECIDED BY YOLANDA earlier (dislike of pie/bar charts cited as her preference)
- **Source:** L18153
- **Relationship:** Possibly relates to an earlier decision (outside this section)

**S6-154**
- **Type:** Not wanted / UI-UX (spec §14)
- **Statement:** Avoid:
  - forced organization taxonomies
  - sterile administrative interfaces
  - blank dashboards that imply work must be categorized before it counts
  - Use a sophisticated, creative, readable design.
  - No requirement to copy the Mama Dorothy interface or personality.
  - Responsive, accessible, keyboard-friendly, fast navigation.
  - Author choice of style/tone; candor when something is unsupported.
- **Standing:** UNANSWERED PROPOSAL. The Mama Dorothy statement is ChatGPT's own claim.
- **Source:** L18155; L18260

**S6-155**
- **Type:** Feature (spec §15)
- **Statement:** Import:
  - DOCX, text/Markdown and structured imports, with previews and source-status protection
  - Import the complete IDW Story Bible v5 without collapsing its "What it is / One way I could play it / Over to me" distinctions.
  - Illustrative candidates in instructional passages must not be promoted to established.
  - Mapping, dedupe, reimport with identity/version control
  - Report what was imported, skipped, flagged or ambiguous.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L18159
- **Relationship:** The story bible's three-part teaching structure ("What it is / One way I could play it / Over to me") is revealed here. Possibly relates to an earlier decision about her bible format.

**S6-156**
- **Type:** Feature (spec §15)
- **Statement:** Storage and backup:
  - local persistent storage by default
  - documented file locations, backups, recovery, restoration, migrations
  - portable full-project export of all canon, alternatives, questions, scenes, prose, links, history, settings and references (or declared exclusions)
  - import/recovery tests
  - no destructive overwrites, duplicates, broken references or silent truncation
  - "Write safety matters more than cosmetic features."
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L18161

**S6-157**
- **Type:** Feature / Scenario (spec §15)
- **Statement:** Search works across entity types with full text and filters (character, plotline, scene, status, source) and cross-reference navigation. It distinguishes source data from AI interpretation. "The user should be able to locate a specific joke or candidate line from October 14 without having to remember which note it was saved under."
- **Standing:** UNANSWERED PROPOSAL (scenario derived from S6-105)
- **Source:** L18163

**S6-158**
- **Type:** Constraint (spec §16)
- **Statement:** Security and reliability:
  - loopback binding only by default; audit CORS, CSRF, path handling, input validation, archive safety, SQLi, XSS
  - "Never assume that 'runs locally' means secure."
  - offline core; AI failures isolated; no telemetry by default
  - crash recovery and concurrency protect drafts
  - test simultaneous browser tabs
  - future AI should minimize sent content, disclose what leaves the machine, and require consent/credentials
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L18167–18169

**S6-159**
- **Type:** Acceptance tests (spec §17, AC01–AC20)
- **Statement:** "A passing dashboard is insufficient." Each test needs saved evidence and an explicit expected outcome.
  - AC01: second novel in an unrelated genre, no IDW defaults
  - AC02: full-fidelity v5 import; reimport without duplication or promotion
  - AC03: capture a question and a comic idea in under a minute with no category; later link and search
  - AC04: Kevin's job-loss Ghost, therapy and competing Lies marked exploratory; Anthony's Ghost unanswered
  - AC05: 15 beats in order; multiple scenes per beat; move a scene; Catalyst and Midpoint undecided
  - AC06: McKee scene and source-grounded critique
  - AC07: alternating Kevin/Anthony first-person POV, one narrator per scene; Francine's operation hidden from POV-facing summaries
  - AC08: ledger plant/discovery/wield as separate linked records with reverse navigation
  - AC09: fish-guts causality with the five-dollar bill illustrative only
  - AC10: ripple on a Lie or midpoint change
  - AC11: AI no-hallucination on an undecided Ghost; adversarial prompts
  - AC12: draft three scenes with distinct POVs; restart; recover; word counts; reorder; export
  - AC13: zoom path and back to the original editing location
  - AC14: search "Dr. Fingleburger," "The Voice of Reason," "Giving honor to God, and Miss Francine…"
  - AC15: backup/restore with checksums
  - AC16: history rollback without losing newer work
  - AC17: negative/security cases
  - AC18: offline
  - AC19: an unfamiliar user completes the workflows without help
  - AC20: clean start on the author's target **Windows** computer; don't equate Linux tests with Windows readiness
- **Standing:** UNANSWERED PROPOSAL (approved in general as "good details")
- **Source:** L18171–18213

**S6-160**
- **Type:** Constraint (environment)
- **Statement:** The author's target machine is a Windows computer (AC20).
- **Standing:** UNANSWERED PROPOSAL. It is asserted by ChatGPT, not stated by Yolanda in this section; possibly from earlier context.
- **Source:** L18213

**S6-161**
- **Type:** Process (spec §18)
- **Statement:** Claude should:
  - inspect the code and run tests; not trust earlier "working" tables
  - produce a gap matrix (Verified / Partial / Missing / Defective / Requires author decision) with reproducible tests
  - not delete or redefine any agreed Phase 2 feature because of schedule pressure
  - Key distinctions: "Merely having a field named 'gap'... does not mean the intelligent behavior... exists." "A review queue... does not mean AI collaboration is implemented."
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L18217–18219

**S6-162**
- **Type:** Acceptance criteria (spec §19)
- **Statement:** Definition of ready:
  - every Phase 2 workflow usable end to end
  - data survives restarts and failures
  - drafting works without AI
  - suggestions can't alter canon without approval
  - provenance and open/illustrative distinctions survive imports
  - tests pass; manual GUI testing succeeds; backup restore succeeds
  - reproducible install instructions
  - limitations documented honestly
  - independent Claude verification is part of the process
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L18225

**S6-163**
- **Type:** Process (spec §20)
- **Statement:** Claude deliverables:
  1. architecture/security audit
  2. requirement-to-code traceability table
  3. feature matrix
  4. reproduced tests
  5. adversarial canon-status test report
  6. exact defects
  7. dependency-ordered missing work
  8. corrections/tests if asked
  9. evidence-based release recommendation
  - Preserve distinctions: narrator vs truth, proposed vs established, author choice vs AI inference, Phase 2 navigation vs Phase 3 visualization.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** L18229–18231

**S6-164**
- **Type:** Story fact (IDW) (Appendix A)
- **Statement:** Additional IDW facts in the spec:
  - genre: comedy with emotional heart
  - Kevin half-suspects a cursed car and is a Stephen King devotee
  - Francine's interior is withheld until the late reveal, delivered via the ledger
  - no head-hopping; Francine retaliates cleverly, is not a villain, and ultimately receives recognition
  - moral premise wording undecided; Midpoint and Catalyst undecided; don't infer them from concept art
- **Standing:** DECIDED BY YOLANDA (per the story bible). Undecided items are UNANSWERED.
- **Source:** L18237–18249; L16290–16302

**S6-165**
- **Type:** Story fact (IDW) (from story bible as coded)
- **Statement:** Kevin is paranoid, self-important and a devoted Stephen King fan who half-suspects his car is cursed. Anthony is dry, unbothered and enjoys needling Kevin. Francine is a warm, overlooked older neighbor whose treasured garden is damaged by the men's dogs; she secretly engineers the conflict.
  - The Confession is near Dark Night of the Soul and moves the men toward friendship without them explicitly naming their loneliness.
  - The garden is the emotional center; the final image mirrors the opening through visibility, respect and connection.
- **Standing:** DECIDED BY YOLANDA (story bible, as summarized by ChatGPT)
- **Source:** L16292–16299

**S6-166**
- **Type:** Story fact (IDW)
- **Statement:** Still developing per the bible:
  - exact Catalyst and Midpoint
  - fish-guts distraction mechanics
  - staging/order of comic set pieces, including the "pie/block-party material"
  - character identity details beyond the leads' race
  - scene dialogue, final tactic, closing staging
  - the formal wording of the moral premise
- **Standing:** UNANSWERED (open questions)
- **Source:** L16301–16302

**S6-167**
- **Type:** Principle (Appendix B)
- **Statement:** Non-functional principles:
  - local-first and offline-capable; fast launch and capture
  - project-specific human terminology, not corporate task labels
  - clear separation of metadata, source text, generated interpretation and authored prose
  - accessible contrast; schema migrations
  - no unconsented AI transmissions; safe destructive updates; stable IDs
  - "Novel writing is not a database administration job: every feature should make returning to prose easier."
- **Standing:** UNANSWERED PROPOSAL (reflects earlier Yolanda preferences)
- **Source:** L18251–18261

**S6-168**
- **Type:** Feature (delivered)
- **Statement:** Claude Review Packet ZIP: spec MD, DOCX, PDF (13 pages) and CLAUDE_REVIEW_START_HERE.txt, plus a copyable instruction prompt for Claude. Send it together with the development ZIP.
- **Standing:** ACCEPTED PROPOSAL (delivered)
- **Source:** L18384–18488

**S6-169**
- **Type:** Frustration / Requirement
- **Statement:** The spec is "good details for Claude. However, it misses the 'human' touch; where I was sharing my ideas and then you were edifying the product."
- **Why:** The narrative of how ideas emerged in conversation (her ideas, ChatGPT building on them) carries intent and context that a requirements contract loses.
- **Standing:** DECIDED BY YOLANDA (critique; she wants the human/collaborative story conveyed to Claude)
- **Source:** L18494, 2026-10-15 08:33
- **Relationship:** ADDS TO S6-109. The response is beyond END (handled by the next section).

**S6-170**
- **Type:** Work habit
- **Statement:** Yolanda thinks out loud, conversationally and comedically. Character truths emerge in rapid back-and-forth riffs (laughter, "Hahahaha," "Keeping that!"). She adopts lines on the spot. Her messages show voice-to-text artifacts ("Good until I AI art," "edfying," "clause" for Claude).
- **Why:** The program must capture fast, informal, voice-dictated input and tolerate typos.
- **Standing:** DECIDED BY YOLANDA (observed behavior)
- **Source:** L15066; L16625; L17169–17675; L18494

**S6-171**
- **Type:** Scenario
- **Statement:** Detours are productive. A "quick pause on the development of the program" for Fast homework produced a major character breakthrough. The program must let her branch from software or planning work into character exploration and capture everything.
- **Standing:** DECIDED BY YOLANDA (implied by S6-105)
- **Source:** L16789; L17721

**S6-172**
- **Type:** Process
- **Statement:** Craft tool in use: the Ingermanson character sheet and Weiland character arc in her October 13 story bible. Kevin's Lie/Ghost/Want/Need example exists there but is labeled as an example.
- **Standing:** DECIDED BY YOLANDA (her bible structure)
- **Source:** L16819; L16877

**S6-173**
- **Type:** Principle
- **Statement:** ChatGPT's behavior commitments:
  - won't declare the app finished because its interface looks polished ("After our experience with the posters, that would be repeating the same mistake")
  - distinguishes implemented from unfinished features
  - won't ask her to repeat decisions
- **Standing:** UNANSWERED PROPOSAL (commitments; consistent with her demands)
- **Source:** L16595; L16671–16673; L16775

**S6-174**
- **Type:** Constraint
- **Statement:** ChatGPT cannot code between messages. Saturday is a target, not a guarantee. "I cannot guarantee that a complex application will be fully implemented... within three days."
- **Standing:** UNANSWERED PROPOSAL (caveat; Yolanda did not respond)
- **Source:** L16593; L16675

**S6-175**
- **Type:** Story fact (IDW)
- **Statement:** The three leads are African American, in a racially diverse neighborhood. Illustrations: expressive African American characters, the diverse neighborhood, lush gardens, cinematic lighting, sophisticated purple-and-gold presentation.
- **Standing:** DECIDED BY YOLANDA (established earlier)
- **Source:** L15093; L15453–15454

**S6-176**
- **Type:** Story fact (IDW)
- **Statement:** POV: alternating first-person between Kevin and Anthony, with no head-hopping. Francine's inner perspective is withheld until near the reveal; the ledger is a controlled way to reveal her hidden perspective.
- **Standing:** DECIDED BY YOLANDA (established earlier)
- **Source:** L15455–15456; L16294

**S6-177**
- **Type:** Story fact (IDW) / Proposal
- **Statement:** Beat-specific interpretations in the poster copy:
  - Theme Stated hints that "winning" the war is not the same as being fulfilled, seen or connected (themes: pride, conflict, loneliness, respect, community, connection).
  - Fun and Games must imply pressure, momentum, misinterpretation and consequences, not just "funny stuff." Set pieces must progress dramatically, not repeat jokes.
  - Midpoint: "false victory or false defeat is a structural possibility, not a selected scene."
  - B Story: Francine's hidden thread and "being seen." Do not reveal her thoughts prematurely or turn suggested backstory into canon.
  - Finale: do not imply the men permanently defeat Francine.
- **Standing:** UNANSWERED PROPOSAL (copy). The Finale constraint is DECIDED BY YOLANDA (earlier).
- **Source:** L15733; L15876–15883; L16027–16032; L16327–16334

**S6-178**
- **Type:** Not wanted
- **Statement:** ChatGPT's MVP framing ("smallest genuinely useful version") is not acceptable. Also not acceptable: a schedule in which design discussion extends to 10/31.
- **Standing:** REJECTED
- **Source:** L16541; L16565

---

## Open questions in this section

1. Anthony's Ghost: "Why does Anthony need to be the most important man on a street where nobody elected him to anything?" (L17479). Unanswered.
2. Kevin's Ghost is Yolanda's "just a thought" (job loss). Is it confirmed? The spec keeps it exploratory.
3. At the start of the novel, is Kevin's marriage healthy and stable, or still recovering (L17163)? Unanswered.
4. Is the existing wife character in the story bible Kevin's wife (L17062–17064)? Unanswered.
5. Does Kevin like Dr. Fingleburger, grudgingly or adoringly (L17230–17232)? Unanswered.
6. Is Anthony's original podcast about neighborhood/HOA affairs or "everything" (L17594)? She answered only with the title.
7. Is Kevin's deepest fear losing control or being abandoned when he fails (L17076)? Unanswered.
8. What is the program's final name? Not chosen; "StoryForge" is rejected.
9. Will Phase 1 posters 2–10 still be produced? Shelved when she pivoted to the program, not cancelled.
10. Exact Catalyst, Midpoint, fish-guts diversion, moral premise wording, final tactic, closing staging, and pie/block-party set-piece order remain open.
11. Placement of the Fingleburger line, the "First of all…" line, and "Giving honor to God, and Miss Francine…" is open.
12. Is Phase 4 (Story Universe) numbering accepted? Not confirmed.
13. AI integration: which provider, keys, costs? Not discussed by Yolanda; the build has no AI.
14. Target OS: the spec asserts Windows. Yolanda did not state this in this section.

## Unclear items

- **S6-088, notebook ownership.** Yolanda said "Keeping that too!" about Kevin's 17-violations notebook. She then said "Anthony would be a notebook wielding fool too!" ChatGPT moved the gag entirely to Anthony ("Kevin doesn't necessarily document... He narrates"), and the spec says don't codify it as Kevin's. Her "too" may mean both men carry notebooks, or that Anthony owns it instead. She never confirmed the reassignment.
- **S6-049 vs S6-014.** Her "tired of... the poster" pivot clearly deprioritizes Phase 1. It is unclear whether she abandoned self-built posters or only postponed them.
- **S6-018 "Developing" definition.** It is given as both "a possibility you're exploring" and "function known, execution being explored." These differ. The code also adds a fifth state, "Proposed."
- **S6-081.** Therapy is stated definitively by Yolanda, but it sits inside a Ghost she called "just a thought." It is unclear whether the therapy history is canon on its own.
- **S6-096/S6-103 (podcast; "Giving honor…").** Yolanda stated these with enthusiasm and imagery ("I can see them"). The spec treats them as developing or candidate. It is unclear whether she considers them decided.
- **Final Image pages** differ slightly between the chat copy (249–250 / 298–300) and the DOCX (248–250 / 297–300).

## Items ChatGPT dropped or distorted when restating

1. **Phase 2 list (S6-006, S6-118).** Neither restatement names the **Writing Trail**, nor Swain, Truby or Kaplan by name, nor Yolanda's spreadsheet. Swain-like scene/sequel fields appear unnamed. Omission does not cancel them.
2. **"November 1 writing release" / MVP (S6-051).** ChatGPT unilaterally reduced scope. Yolanda rejected it, and ChatGPT acknowledged it "shouldn't have reduced your requirements without your agreement."
3. **Capability table at 18:20 (S6-060).** It claims many features are "Working" (e.g. "linked-element impact identification," "McKee... fields"). ChatGPT's own later spec says these are scaffolding: a field named "gap" is not the intelligence, and graph neighbors are not ripple analysis. The earlier table overstated readiness.
4. **Character Breakthrough Archive (S6-106).** Yolanda asked to "lock this entire conversation in." ChatGPT produced a non-verbatim reconstruction and a memory note. Verbatim preservation was not delivered.
5. **Spec "human touch" (S6-169).** The spec turned conversational idea-generation into a dry contract. It dropped the narrative of Yolanda sharing ideas and ChatGPT edifying the product, as Yolanda flagged.
6. **Memory note (L17730).** It says the "user proposed... exact line 'Giving honor to God…'" and treats the job-loss Ghost as "possible." That is accurate. But it calls the notebook "correctly reassigned" to Anthony, which may over-read Yolanda's "too" (see Unclear items).
7. **Poster facts list (L15451–15464)** omits the dogs-damage-garden motive and the cats/raccoons delay, which the DOCX includes. These are minor omissions in the chat restatement only.
8. **Phase 3 → Phase 4 renumbering.** ChatGPT moved the "original Phase 3" (Story Universe) to Phase 4 without Yolanda explicitly approving the renumbering.
9. **AC20 asserts a Windows target** without Yolanda saying so in this section. This is possibly an inference.
10. **Spec §14 says there is no need to copy the Mama Dorothy interface.** This is ChatGPT's assertion, not a Yolanda statement in this section.
