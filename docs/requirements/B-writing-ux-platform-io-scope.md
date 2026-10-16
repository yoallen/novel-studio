# Consolidated Requirements, Theme B: Writing Environment, Work Habits, UX, Platform, Import/Export, Project Setup, Phasing

Program: unnamed general-purpose novel-planning and writing program ("StoryForge" rejected). Windows, local, private. It serves any novel in any genre. *I Declare War* (IDW) is the first story and the richest test case, not the purpose.

## How to read this file

**Inputs consolidated.** section-1.md to section-8.md (registers of the design conversation, cited as S1-nnn to S8-nnn, S8E-nnn, with transcript lines "L"), section-docs-spec.md (ChatGPT's Phase 2 spec SP-, Human Vision brief HV-, packet PK-, flags F1-F12), section-docs-story.md (Story Bible SB-, archives A14-/A15-, her spreadsheets XL-, poster foundation PF-).

**Standing values.**
- **Decided by Yolanda**: her own words, or her explicit choice between options.
- **Accepted proposal**: ChatGPT proposed it and she accepted it, by explicit reply or by a blanket "I agree with everything" / "Yes!!" given right after reading it.
- **Unanswered proposal**: she never answered it, or she said she skimmed the message. These are included only where they fit her stated goals, and they are labelled clearly.
- **Spec-only**: the item appears only in ChatGPT's documents (spec, vision brief, packet, generated poster files). Her general "This good details for Claude" (S6-111) does not turn individual spec lines into her decisions.
- **Possibility**: an option that coexists with others, or an implication inferred from her working pattern.

**Phase values.**
- **2**: build now.
- **3**: later, but the Phase 2 data model must already capture what Phase 3 needs.
- **Later**: after Phase 3 (Story Universe, series, other media, other users, collaboration).

**Judging rules applied.**
- A later ChatGPT summary never overrides her decision, and an omission never cancels anything.
- A requirement is marked replaced only where she changed her mind or explicitly overrode it.
- Alternatives coexist.
- Items only skimmed are not treated as accepted. At 11:45 on 10-14 she said she skimmed S2-179 to S2-194, and she often reads only part of a reply (S8-004).

Count: **121 requirements** (R-B-001 to R-B-121).

---

## A. Writing environment

### A1. Manuscript, editor and saving

#### R-B-001 Write the manuscript inside the program
- **Requirement:** The program has a built-in manuscript editor. The author can open any scene or chapter and type prose directly, with no other application needed. One side of the screen can show the scene's structural information: objective, POV, time and location, conflict, starting and ending values, incoming causes, intended outcome. The other side is a clean manuscript editor. The planning side can be hidden for uninterrupted writing.
- **Why:** "To move the author from designing to writing" (S2-068). Phase 2 is "this program so that I can use it to write 'I Declare War'... all the moving pieces" (S3-007). It must help her "ACTUALLY WRITE THE DAMN STORY" (S3-067).
- **Standing:** Accepted proposal. At 11:17 she asked the question: "are you expecting the author to be drafting the novel within the program or sharing the manuscript within the program? Or are we leaving it to the author's honor system…" (T L4459). ChatGPT proposed supporting in-program drafting (S2-099, S2-110), and she built on that at 11:25 with a conditional: "if we are supporting writing the manuscript within the program..." (S2-128). Phase 2 drafting was confirmed in S3-008 ("Yes!!") and S6-052.
- **Phase:** 2
- **Evolution:**
  - ChatGPT first preferred integration first, with an editor "later if compelling" (S2-099). Its three-stage roadmap put the editor in Stage 3 (S2-124).
  - Her assumption at 11:25, her Phase 2 definition (S3-007, "everything... all the moving pieces") and the accepted Phase 2 list ("Planning and Manuscript Workspace", S3-008) made drafting a Phase 2 feature.
  - The spec agrees: "Practical manuscript drafting studio" (SP-038, S6-141).
- **Sources:** S2-068, S2-099, S2-103, S2-110, S2-111, S2-124, S2-128, S3-007, S3-008, S6-006, S6-118, S6-141, S7-026, SP-038, SP-129 to SP-138
- **Acceptance check:**
  - Create a scene, type 500 words, hide the planning panel, show it again. The prose is unchanged.
  - Draft three scenes with no external app open (AC12).

#### R-B-002 Writing inside, outside, or both
- **Requirement:** The program supports three working modes.
  - Mode One: write inside the program.
  - Mode Two: write in Word, Scrivener or Google Docs and import or sync.
  - Mode Three: plan in the program and write anywhere, with manual progress updates.
  The author never has to keep two versions of the novel. The program never asks her to enter by hand what it can read from her files.
- **Why:** "One creative project, multiple ways to work... The software should connect the creative process, not dictate it" (S2-127). This answers her "honor system" question (S2-103).
- **Standing:** Accepted proposal. She said "I agree with everything you said" at 11:25.
- **Phase:** 2 for Mode One and for import. Live sync with external apps is Later. See Needs Yolanda Q12.
- **Evolution:** No change since it was proposed.
- **Sources:** S2-103, S2-104, S2-110, S2-114, S2-116, S2-127
- **Acceptance check:** Draft Chapter 1 in Word and import it. Draft Chapter 2 in the app. Both appear in one assembled manuscript, with no duplicate copy to maintain.

#### R-B-003 Chapters and scenes with flexible mapping
- **Requirement:**
  - Prose is held per scene and assembled into chapters.
  - A chapter can contain several scenes. A beat can span several scenes. One scene can serve several plotlines and arcs.
  - Manuscript order is configurable. Narrative order and chronological order are separate fields.
  - Reordering scenes or chapters never loses prose or links.
  - Fast scene creation.
- **Why:** Real novels are not strict trees (SP-111). Her board folds sequences into one card or explodes one beat into several scenes (SB-167, XL-017).
- **Standing:** Spec-only for the exact mapping rules. It is built on accepted items: the Beat → Scene → Sequence → Act hierarchy (S1-142) and her board convention, decided in the Bible (SB-167).
- **Phase:** 2
- **Evolution:** The novel hierarchy stays the default template. Configurable containers come later (R-B-107).
- **Sources:** S1-010, S1-142, S2-011, S6-136, SB-167, XL-017, XL-048, SP-111, SP-112, SP-131, SP-134, AC05, AC12
- **Acceptance check:**
  - Move a scene between chapters. Its prose, word count and links are unchanged.
  - Attach three scenes to one beat (AC05).
  - Export, and confirm the new order.

#### R-B-004 Focused writing that "gets the hell out of your way"
- **Requirement:** A focused drafting mode hides everything unrelated to the current scene. When the author is ready to write, the program shows only what the scene must do, how she got here, and what must follow. It shows no criticism or diagnostics unless she asks for them.
- **Why:** "When you're ready to write, the program gets the hell out of your way" (S3-070). Interruptions every thirty seconds "would be maddening" (S2-037).
- **Standing:** Accepted proposal. She said "i agree with everything you said" (13:45).
- **Phase:** 2
- **Evolution:** It adds to the hideable planning panel in Mode One (S2-111). The spec keeps it as "a focused mode" (SP-129).
- **Sources:** S2-111, S3-070, S3-113, SP-129, SP-138, SP-180
- **Acceptance check:** In focus mode, no diagnostic, reminder or notification appears during a 20-minute drafting session unless the author opens one.

#### R-B-005 Autosave with an unmistakable saved state
- **Requirement:**
  - Prose and records are saved automatically.
  - The interface always shows clearly whether the current text has actually been saved.
  - The author is protected from losing unsaved changes when she navigates away or closes the app.
- **Why:** "The system must make it clear whether something has actually been saved." "Trust isn't just an emotional experience. It's something the software must demonstrate through reliability" (S3-112). Trust is her central requirement (S3-102, R-B-040).
- **Standing:** Accepted proposal. She extended the Story Brain at 14:00, replied "💯" at 14:10, and said "I love it!" at 14:20.
- **Phase:** 2
- **Evolution:** The spec's §10 weakens this to "auto-save **or** deliberate save with clear state" (SP-132, flag F3), while its own scope list says "autosave/recovery" (SP-038). The weakening is not her decision. See Conflicts.
- **Sources:** S3-112, S5-093, S6-141, S7-026, SP-038, SP-132
- **Acceptance check:**
  - Type, wait a few seconds, then force-kill the process. On restart the text is present.
  - The save indicator changes from "unsaved" to "saved" without any manual action.

#### R-B-006 Crash, restart and interrupted-write recovery
- **Requirement:** Prose and story data survive restarts, crashes, interrupted writes and simultaneous windows or tabs. Recovery restores the exact prose (AC12). An interrupted write never corrupts the project.
- **Why:** This is part of "trust" (S3-103). "Write safety matters more than cosmetic features" (SP-199).
- **Standing:** Spec-only for the test list. It is consistent with the accepted trust and reliability requirements (S3-112).
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S3-112, S6-158, SP-207, SP-208, AC12, AC17
- **Acceptance check:**
  - Interrupt the app mid-save. Reopen it: no corruption, and the latest saved text is intact.
  - Edit the same scene in two windows. A conflict is reported, and no text is silently lost.

#### R-B-007 Prose revision history and restore
- **Requirement:** Each scene and chapter keeps a revision history. The author can view and compare earlier versions and restore one without losing newer work elsewhere. Restoring an earlier version of a character, scene or note keeps the creative conversation that inspired it.
- **Why:** "It should remember how the story evolved"; "preserve the earlier version for reversal" (S1-162). She wants the freedom to change her mind safely.
- **Standing:** Accepted proposal for version history (S1-163, accepted at 10:35). Spec-only for the per-record restore details (AC16, HV-054).
- **Phase:** 2
- **Evolution:** Structural version history (S1-163) was extended to prose (S7-026, SP-136).
- **Sources:** S1-162, S1-163, S3-112, S5-093, S7-026, S7-055, SP-136, HV-054, AC16
- **Acceptance check:** Revise a scene three times, restore version 1, and confirm that later edits in other scenes are untouched (AC16).

#### R-B-008 Writing never depends on AI or the network
- **Requirement:** Drafting, reading, navigation, saving, backups and exports all work offline, and with AI unavailable or disabled.
- **Why:** The writing must be safe and always available. Phase 2 must make sure she can write from November 1.
- **Standing:** Spec-only. It is consistent with "local, private" and with Quiet mode (R-B-035).
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S6-141, S6-158, SP-140, SP-205, SP-238, AC18
- **Acceptance check:** Disconnect the network and all AI keys. Draft, save, search, back up and export all succeed (AC18).

#### R-B-009 Search, including exact text
- **Requirement:**
  - Full-text search across the manuscript and every kind of record: characters, scenes, ideas, questions, imported conversations.
  - Filters for character, plotline, scene, status and source.
  - Exact-phrase search finds a remembered line without her knowing where it was saved. Examples: "Dr. Fingleburger", "The Voice of Reason", "Giving honor to God, and Miss Francine…".
- **Why:** She asked to "lock this entire conversation in somewhere. I cannot lose any of it" (S6-105). With ADHD, ideas live everywhere (S3-101), and she needs "no archaeological expedition through seventeen notebooks" (S3-111).
- **Standing:** Spec-only for the search spec (SP-200, AC14). Her underlying need is decided (S6-105). The spec's "basic find/search" for the manuscript (SP-135) is a hedge (F3).
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S3-111, S3-121, S6-105, S6-157, S7-139, SP-135, SP-200 to SP-202, AC14
- **Acceptance check:** Search "Fingleburger" and get the keeper line with its status and source (AC14). Search an exact sentence from an imported chat and land on it.

#### R-B-010 The program never writes or changes her manuscript
- **Requirement:**
  - The program never changes manuscript prose without her explicit direction.
  - It never rewrites a weak scene. It offers questions and options instead.
  - An abandoned AI thread never overwrites text.
  - AI must not "improve" her narration.
  - Changing story data never silently alters prose. The program can show which passages are affected.
- **Why:** "This program does not write the novel and it does not make the changes to it... The author is the main and final judge" (S2-025). "This is my story. The writing is the part I keep" (SB-004).
- **Standing:** Decided by Yolanda (S2-025; Bible SB-004).
- **Phase:** 2
- **Evolution:** It was restated faithfully many times (S2-100, S2-122, S3-163, HV-078). The spec adds "controlled, opt-in prose brainstorming" (SP-173), which sits uneasily with her decision. See Conflicts.
- **Sources:** S2-006, S2-025, S2-031, S2-100, S2-122, S3-163, S7-069, SB-004, SP-024, SP-173, SP-178, HV-078
- **Acceptance check:** Ask the AI to critique a scene, then reject every suggestion. The prose matches byte for byte (Scenario G).

#### R-B-011 Prose may contradict the plan; flag it, never fix it
- **Requirement:**
  - Drafted prose may diverge from or contradict the plan.
  - The program shows the divergence as information, not as an error. For example: Catalyst planned at 10%, drafted at 13%.
  - It offers options, and never silently "fixes" either the prose or the plan.
  - It supports the states "drafted but not canon" and "canon but not yet dramatized".
- **Why:** "A writing tool should inform the author, not police the author." The scene that emerges while writing may be better (S1-161). She is "a panther at heart", a discovery writer (HV-005).
- **Standing:** Accepted proposal (S1-160, S1-161, accepted at 10:35). The two named states are Spec-only (SP-071).
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S1-160, S1-161, S7-059, SP-071, SP-073, HV-060, HV-061
- **Acceptance check:** Draft a scene that contradicts its card. A non-blocking notice appears with options, and neither record changes until she chooses.

#### R-B-012 "Drafted and confirmed" status
- **Requirement:** The status model includes "Drafted and confirmed", because written text can become more authoritative than an earlier plan. The author can mark a drafted scene as confirmed, and that confirmation outranks the planned version.
- **Why:** "Something you've actually written may become more authoritative than something you previously planned" (S1-164).
- **Standing:** Accepted proposal (S1-164, 10:35 "I am in love with everything you said").
- **Phase:** 2
- **Evolution:**
  - It was proposed as a fourth status beside Decided / Working possibility / Undecided.
  - Later poster and spec status lists (S4-014, S6-121) dropped it. Omission does not cancel it.
  - The placement-state "Drafted" (S2-182) is related, but that proposal was only skimmed.
- **Sources:** S1-164, S2-182, S4-014, S6-064, S6-121
- **Acceptance check:** Mark a drafted scene "Drafted and confirmed". Ripple analysis and summaries then treat its content as the current truth over the earlier plan card.

### A2. Getting to the page and back

#### R-B-013 Planning never blocks writing ("Write Anyway")
- **Requirement:**
  - No planning field, open question or unfinished framework ever prevents drafting.
  - She can open a blank page and write. Period.
  - Any readiness check carries a prominent **Write Anyway** button.
  - The program never shows gates such as "complete your character sheets" or "resolve the midpoint".
- **Why:**
  - "Sometimes the only way to figure out a scene is to write the damn thing" (S2-093).
  - "The program must never make planning feel like a prerequisite for permission to write" (S3-074).
  - Her Bible: the open list "is not a to-do list to finish before I write... I do not owe this list a deadline" (SB-212).
- **Standing:** Accepted proposal (S2-093, S2-113, S3-074). It rests on decided Bible text (SB-212).
- **Phase:** 2
- **Evolution:** It was repeated consistently (S4-027, S4-104, SP-143, HV-079). Nothing has replaced it.
- **Sources:** S2-093, S2-113, S3-074, S3-118, S4-027, S4-104, SB-212, SP-143, HV-079
- **Acceptance check:** Create a scene with every planning field empty and click Write. The editor opens immediately, with no blocking dialog (Scenario H).

#### R-B-014 Drafting Readiness indicator (informational only)
- **Requirement:** Each scene can show Drafting Readiness by checking six things:
  - viewpoint character;
  - purpose;
  - the character's objective;
  - central conflict;
  - intended outcome or change;
  - relationship to the surrounding story.
  It shows either "Ready to draft" or "Open questions: …", and always offers Write Anyway (R-B-013). It is never restrictive.
- **Why:** It gives orientation without becoming a gate. "A scene should never be prevented from being drafted because some planning fields are incomplete."
- **Standing:** Accepted proposal (S2-093, 11:17 "Yes. I AM STILL IN LOVE WITH THIS!").
- **Phase:** 2
- **Evolution:** Dropped from ChatGPT's 11:45 Phase 2 list and from the spec. Omission does not cancel it.
- **Sources:** S2-093
- **Acceptance check:** A scene missing POV and conflict shows "Open questions: POV, conflict" next to an active Write Anyway button.

#### R-B-015 Next Writing Action
- **Requirement:**
  - The program offers a concrete next step, such as "Draft Kevin's opening scene in the driveway", rather than a number like "Write 2,000 words today".
  - It separates Story Development Progress from Manuscript Progress.
  - The start screen makes actual prose the obvious next action.
- **Why:** A concrete entry point beats an intimidating number. This supports her freeze pattern (R-B-043).
- **Standing:** Accepted proposal (S2-090, accepted 11:17).
- **Phase:** 2
- **Evolution:** It reappears in S3-111 ("your next meaningful writing action") and the vision brief start screen (HV-057). The spec dropped the name.
- **Sources:** S2-090, S3-111, S7-057, HV-057, HV-058
- **Acceptance check:** On launch, the home view shows one concrete next scene action, and one click opens that scene in the editor.

#### R-B-016 Return to Writing
- **Requirement:**
  - The author can step away mid-draft: jump to another scene to fix a causal problem, follow a character question, capture an idea (even about another novel), or consult a framework.
  - She can attach the problem or thought to the right element.
  - One obvious action returns her to the exact prior context: scene, active draft, scroll and cursor position, and the question that prompted the detour.
  - This works through a chain of branches (manuscript → Anthony question → Francine discovery → McKee → Kevin), not just a single hop.
- **Why:**
  - "You can acknowledge a problem without allowing it to hijack your writing session" (S3-071).
  - Tangents are part of how her mind works. "No punishment for associative working style" (S6-128).
  - Detours are productive: the Fast homework detour produced her character breakthrough (S6-171).
- **Standing:** Accepted proposal (S3-071, 13:45 "i agree with everything you said"). It was restated as her feature in S6-006 and S6-128.
- **Phase:** 2
- **Evolution:** The spec hedges scroll and cursor restore with "if technically feasible" (SP-083, F3). The vision brief strengthens it to "a safe thread back through associative branches" (HV-046). The full strength is required.
- **Sources:** S3-071, S3-107, S6-006, S6-128, S6-142, S6-171, SP-021, SP-082, SP-083, SP-141, HV-035, HV-046, AC13
- **Acceptance check:** From Scene 12, at cursor position X, go to Scene 7, then a character, then a framework page. Click Return to Writing: Scene 12 opens with the cursor at X (AC13).

#### R-B-017 Writing Trail
- **Requirement:** The program keeps a Writing Trail. It is not a conventional activity log. It remembers:
  - which scene she was on;
  - what prompted her to leave;
  - which related scene she visited;
  - whether the issue was resolved;
  - where she intended to return.
  It does not force a linear workflow, and it works with Narrative Zoom.
- **Why:** It supports nonlinear movement, such as Scene 12 → fix Scene 7 → back, "without losing the drafting thread" (S2-096).
- **Standing:** Accepted proposal (S2-096, her "Yes. I AM STILL IN LOVE WITH THIS!" at 11:17).
- **Phase:** 2
- **Evolution:**
  - It was named before Return to Writing (S3-071), which covers the return action.
  - The Trail's distinct content (why she left, whether the issue was resolved, where she intended to go) was dropped from every later list and from the spec (S6-006, S6-118, S8E-018). Omission does not cancel it.
  - The two coexist. Whether they are one feature is Needs Yolanda Q15.
- **Sources:** S2-096, S3-071, S6-006 (dropped), S8E-018 (dropped)
- **Acceptance check:** After a detour that ends without resolving the issue, the Trail shows "left Scene 12 to examine Scene 7: unresolved; intended return: Scene 12".

#### R-B-018 Find your way back after time away
- **Requirement:** After days or weeks away, a "Where was I?" / "What was I thinking about?" start view shows:
  - where she stopped writing;
  - what she last decided;
  - unresolved questions linked to the current work;
  - what changed elsewhere;
  - ideas saved and forgotten;
  - the next meaningful writing action.
  It never shows a guilt-inducing message about how long she has been away.
- **Why:** "No archaeological expedition through seventeen notebooks and forty-six sticky notes!" (S3-111). It protects her return after a break.
- **Standing:** Accepted proposal (S3-111, S3-126, "💯").
- **Phase:** 2
- **Evolution:** Restated in the brief as a start-of-day screen (HV-057) and Scenario E (HV-076).
- **Sources:** S3-109, S3-111, S3-126, S5-085, S7-057, S7-067, SP-183, HV-057, HV-076
- **Acceptance check:** Set the clock forward three weeks, then open the app. The resume view lists the last scene, the last decision and the open linked questions. No "you've been away X days" message appears.

#### R-B-019 "Need it now" vs "resolve later"
- **Requirement:** When she notices a problem while writing, she can mark it as either "something I need to know now to keep writing" or "something I can resolve later without losing the thought". Later items are parked and linked without interrupting the draft.
- **Why:** This prevents "spending three hours restructuring Act Two" (S3-071).
- **Standing:** Accepted proposal (S3-071).
- **Phase:** 2
- **Evolution:** None. It is not in the spec.
- **Sources:** S3-071, S3-118
- **Acceptance check:** Capture a problem marked "later". It appears linked to its scene and not in the drafting view.

#### R-B-020 Quiet resurfacing, never nagging
- **Requirement:**
  - Unresolved questions and forgotten ideas come back quietly when she reaches a relevant scene, not every time the app opens.
  - No walls of notifications, no reminder counts, no motivational pop-ups.
  - Resurfaced items can be dismissed without being deleted.
- **Why:** "Not twenty-seven reminders. Not a wall of notifications. The right information at the right moment" (S3-108). She worries about out-of-sight, out-of-mind ideas (HV-045).
- **Standing:** Accepted proposal (S3-108, S3-109, S3-121).
- **Phase:** 2
- **Evolution:** It is consistent with the brief (HV-044, HV-045).
- **Sources:** S3-108, S3-109, S3-121, S3-123, SP-183, HV-044, HV-045
- **Acceptance check:** A question linked to Scene 9 appears only when Scene 9 is opened. Dismissing it keeps it stored.

#### R-B-021 Single-beat focus and the "When I'm Stuck, Start Here" ladder
- **Requirement:** There is a stuck-day view that shows only the beat she is on, hiding all others, plus that beat's example. It offers the smallest true steps in her order:
  1. read only this beat;
  2. read its example;
  3. write one sentence of what happens;
  4. fill one blank line on a character sheet;
  5. write one line of the narrator's voice complaining about anything.
  Each step counts as progress. The ladder is configurable per novel. The IDW version names Kevin, Anthony and Francine, and Kevin's voice.
- **Why:**
  - "Break the freeze with the smallest possible true step. Momentum is the cure."
  - "On a frozen day I do not have to decide anything at all."
  - "Brave, tiny, consistent. That is the whole system" (SB-005, SB-006).
- **Standing:** Decided by Yolanda (Story Bible).
- **Phase:** 2
- **Evolution:** It was never carried into ChatGPT's schema, module list or spec (S1 D7). Omission does not cancel it.
- **Sources:** S1-025, S1-026, S1-027, S1-028, S1-183, S5-046, SB-005, SB-006, SB-103, SB-234
- **Acceptance check:** "I'm stuck" opens a view showing exactly one beat and its example, with a one-sentence field. Saving the sentence logs progress.

#### R-B-022 Small progress counts
- **Requirement:**
  - Very small units count as real progress: one sentence at a beat, one character-sheet line, 600 messy words.
  - Progress views never hide or dismiss them.
  - Imperfect prose is a success state.
- **Why:** "Write one sentence of what happens at that beat; that is a whole unit of progress" (SB-006). "The confidence does not come first. The line comes first" (SB-234).
- **Standing:** Decided by Yolanda (Bible). The vision brief echoes it (HV-062, Spec-only wording).
- **Phase:** 2
- **Evolution:** None.
- **Sources:** SB-006, SB-234, S1-026, HV-058, HV-062
- **Acceptance check:** Writing one sentence at a beat shows up in the session record and the weekly accomplishments.

### A3. Progress, word counts, targets, statuses

#### R-B-023 Word counts at every level
- **Requirement:** Word counts appear at scene, sequence, act and manuscript level, connected to the planned architecture. Counts update automatically as she types.
- **Why:** Her own question: should the program "track word count, scenes being worked on, and scenes completed" to move her from designing to writing? ChatGPT answered "Yes to both!" (S2-068).
- **Standing:** Decided by Yolanda (as a direction, S2-068). The level detail is an Accepted proposal (S2-086).
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S2-068, S2-086, S7-026, SP-133, AC12
- **Acceptance check:** Add 250 words to one scene. The scene, sequence, act and total counts each rise by 250.

#### R-B-024 Target length to beat landmarks, planned vs actual
- **Requirement:**
  - The author sets a target word count and/or page count of any value.
  - The program computes each beat's approximate landmark in percent, words and pages for the selected structure.
  - It compares planned placement with the drafted manuscript, and highlights significant differences without treating them as problems.
  - Values are computed, never hand-typed or image-generated.
- **Why:**
  - Percentages alone are impractical while drafting. "Say if you were writing a 250-page novel versus a 300-page novel, for example" (S1-005).
  - Her Bible's worked example: 90,000 words puts the Catalyst near 9,000 (SB-102).
  - Poster number errors showed that numbers must be computed (S3-031).
- **Standing:** Decided by Yolanda (S1-005, any length implied by "for example"; S1-131). The planned-vs-actual comparison is an Accepted proposal (S2-087).
- **Phase:** 2
- **Evolution:**
  - ChatGPT hard-coded exactly 250 and 300 pages (S1-128, S1-129, S2-087 example, all posters).
  - Her example implies any length (S1-131). The two-length display remains a valid default view, not the limit.
- **Sources:** S1-005, S1-074, S1-128, S1-129, S1-131, S2-087, S3-030, S3-031, S4-086, S5-007, SB-101, SB-102, XL-038, XL-039, AC05
- **Acceptance check:**
  - Enter 80,000 words: Catalyst ≈ 8,000.
  - Enter 112,000 words: Catalyst ≈ 11,200.
  - Draft 9,400 words before the Catalyst scene: a non-alarming note shows "planned ~8,000 / drafted 9,400".

#### R-B-025 Estimates labelled; every percentage names its unit
- **Requirement:**
  - Page numbers are labelled as estimates unless they come from a real paginated manuscript.
  - Every percentage names what it is a percentage of: the manuscript, the act, or later the book or series.
  - Beat cards can say "Position guides; not fixed pages".
- **Why:** "Word counts are reliable drafting measurements. Page counts depend on manuscript formatting" (S2-088). Percentages are "guides, not rules" (SB-102).
- **Standing:**
  - Page numbers on her posters: Decided by Yolanda.
  - Estimate labelling: Accepted proposal (S2-088).
  - "Percentage names its unit": Unanswered proposal (S2-185, skimmed). Included because it is essential for any multi-container use.
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S2-088, S2-185, S4-038, S5-006, S6-040, SP-087
- **Acceptance check:** Every displayed page figure carries "~" or "est." Every percent reads "of manuscript" or "of Act II".

#### R-B-026 Customizable scene status ladder
- **Requirement:**
  - Each scene carries a drafting status from a ladder the author can customize.
  - Default ladder: Idea, Planned, Ready to Draft, Drafting, First Draft Complete, Revising, Revised, Finalized.
  - Drafting status is separate from decision status (Established / Developing, and so on).
- **Why:** It tracks each scene's real state, so authors who revise as they write, or in multiple passes, can define their own steps.
- **Standing:** Accepted proposal (S2-084, accepted 11:17).
- **Phase:** 2
- **Evolution:** The spec collapses this to "draft status" (SP-113) with no ladder. Omission does not cancel the ladder. A customizable ladder is one instance of her decision that the program is editable (R-A-109, T L2387).
- **Sources:** S2-084, S6-136, SP-113
- **Acceptance check:** Rename "Revised" to "Polished" and add "Beta-read". Scenes can be set to the new statuses, and both statuses persist after restart.

#### R-B-027 Sequence status derived, never auto-complete
- **Requirement:** Sequence (and act) status is derived from its scenes, for example "partially drafted". A sequence is never declared complete just because every scene contains words. Structural completion and drafting completion are shown separately.
- **Why:** "Structural completion and drafting completion are different things" (S2-085).
- **Standing:** Accepted proposal.
- **Phase:** 2
- **Evolution:** It is consistent with "a sequence can remain structurally unresolved after all prose is written" (S2-126).
- **Sources:** S2-085, S2-126
- **Acceptance check:** Give a sequence 3 drafted scenes, 1 revising and 1 unwritten. It reads "partially drafted". When all five are drafted but the sequence's structure question is open, it does not read "complete".

#### R-B-028 Optional, mostly automatic writing sessions
- **Requirement:** Each session can record:
  - date and project;
  - scene or sequence worked on;
  - start and end word count, and net words;
  - time spent, if wanted;
  - status changes;
  - notes.
  Recording is automatic. No form is required. She can "write for twenty minutes and leave without completing a form".
- **Why:** It moves her from planning to execution without admin burden.
- **Standing:** Accepted proposal (S2-089).
- **Phase:** 2
- **Evolution:** Restated as "writing-session history" in the accepted Phase 2 list (S3-008).
- **Sources:** S2-089, S3-008
- **Acceptance check:** Open a scene, write, and close. A session entry exists with net words, and she was never prompted.

#### R-B-029 Selectable goal types, including none
- **Requirement:** The author chooses word-count goals, scene-completion goals, writing-time goals, milestone goals, or no goals at all, per project.
- **Why:** Some authors love numbers, while others find them intimidating.
- **Standing:** Accepted proposal (S2-092).
- **Phase:** 2
- **Evolution:** None. It is not in the spec.
- **Sources:** S2-092
- **Acceptance check:** Set "no goals". No targets or shortfalls appear anywhere.

#### R-B-030 Accomplishment view that sees thinking work, without shaming
- **Requirement:**
  - A "This week in [novel]" view lists what was accomplished: scenes drafted, sequences outlined, conflicts resolved, plot events connected, payoffs identified, motivations revised, new words.
  - Manuscript production stays visible, so endless outlining cannot pass for a manuscript.
  - The view never shames.
- **Why:** It gives a fuller picture of progress. "We shouldn't allow endless outlining to masquerade as a completed manuscript", shown "without shaming" (S2-094).
- **Standing:** Accepted proposal (S2-094).
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S2-094
- **Acceptance check:** A week with only planning shows the planning items, plus "0 new manuscript words" in neutral wording.

#### R-B-031 Meaningful progress, not generic dashboards
- **Requirement:**
  - No generic "you're 37% finished" bar.
  - Progress counts scenes drafted, key decisions still open, first-pass structure, drafting momentum and completed work, not database records.
  - No game mechanics, badges or obligatory motivational messages.
  - Generic pie and bar charts are avoided. See Needs Yolanda Q18.
- **Why:** 10,000 words is not necessarily 10,000 words of progress (S2-083). "Planning 40 scenes isn't the same thing as drafting them."
- **Standing:**
  - The no-generic-bar rule is an Accepted proposal (S2-083).
  - Pie/bar dislike: Spec-only. The spec says "which this author dislikes" (SP-184), but no statement of hers appears in the transcript sections.
  - No badges: Spec-only (HV-059).
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S2-083, S6-153, SP-184, SP-185, HV-059, HV-064
- **Acceptance check:** The progress screen contains no percent-complete bar, pie chart or badge. It lists scenes drafted and open decisions.

#### R-B-032 Progress provenance labels
- **Requirement:** Progress figures show where they came from:
  - verified manuscript data, written in the app;
  - last synchronized manuscript data, imported;
  - author-reported progress, for work written elsewhere.
  Manual reporting is treated as a legitimate privacy and workflow choice.
- **Why:** This answers her "honor system" concern (S2-103) with trustworthy information.
- **Standing:** Accepted proposal (S2-115).
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S2-103, S2-115
- **Acceptance check:** An author-reported word count displays "author-reported", while in-app counts display "verified".

#### R-B-033 Drafting progress visible on structure views
- **Requirement:**
  - On-screen structure views show which scenes exist only as ideas (a subtle outline), which are drafted (filled), and which are being revised (a third treatment).
  - In printed maps this can be toggled on or off, for a permanent architectural poster or a periodically reprinted progress version.
- **Why:** "The eye immediately sees where manuscript exists" (S2-095).
- **Standing:** Accepted proposal (S2-095).
- **Phase:** 2 for on-screen outlines and lists. 3 for printed maps and the print toggle. The Phase 2 data must carry each scene's drafting status.
- **Evolution:** None.
- **Sources:** S2-095, S2-156
- **Acceptance check:** In the outline view, drafted scenes render filled and idea-only scenes render as outlines.

#### R-B-034 Planning maturity vs manuscript realization (qualitative)
- **Requirement:** For each storyline or element, show two independent, qualitative indicators: how much is decided, and how much is written. No invented percentage is used for planning maturity.
- **Why:** Conceptual development is independent of drafting, and arbitrary scores mislead (S2-010).
- **Standing:** Unanswered proposal (S2-189, skimmed). It fits her goals and the accepted "no single score" rule (S2-010), and it adds to the accepted S2-090.
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S2-010, S2-090, S2-189
- **Acceptance check:** A storyline can read "major beats decided / partially drafted", with no numeric score.

### A4. Guidance, intent and author-reserved work

#### R-B-035 Guidance levels: Quiet, Advisory, Deep Analysis
- **Requirement:** The author sets how much guidance the program gives:
  - **Quiet** records concerns without interrupting.
  - **Advisory** gives subtle notices for meaningful concerns.
  - **Deep Analysis** gives detailed observations, dependency analysis, diagnostic questions and craft resources.
  Quiet is the default while drafting. A structural review can be requested at any time.
- **Why:** Interrupting her mid-scene "every thirty seconds would be maddening" and harms the creative process (S2-037).
- **Standing:** Accepted proposal (S2-037; blanket agreement at 10:55 and 11:07).
- **Phase:** 2
- **Evolution:**
  - It was dropped from ChatGPT's 11:45 Phase 2 list and from the spec.
  - The vision brief keeps only "control how much guidance appears" (HV-069).
  - Omission does not cancel the three named levels.
- **Sources:** S2-037, S2-111, S7-061, HV-069
- **Acceptance check:** In Quiet, a detected causal gap is logged but not shown while drafting. Switching to Deep Analysis shows it with explanations.

#### R-B-036 Authorial Intent Notes
- **Requirement:**
  - The author can mark a flagged item as intentional, with an explanation. Example: "Intentional. This scene establishes a sense of false security that pays off two chapters later."
  - The note is kept and informs all later analysis, so the same choice is not flagged again.
  - The note can be revisited and revised.
- **Why:** It respects deliberate choices and cuts noise. She should not have to "repeatedly defend the same choice" (S2-038).
- **Standing:** Accepted proposal (S2-038).
- **Phase:** 2
- **Evolution:** It was dropped from the 11:45 list and the spec. Omission does not cancel it. It is related to "learn the author's creative intentions" (S2-062).
- **Sources:** S2-038, S2-059, S2-062
- **Acceptance check:** Mark a missing value turn "intentional" with a note. Re-run diagnostics: the item is not re-raised, and the note is visible on the scene.

#### R-B-037 "Mine to write" / "Mine to build" markers
- **Requirement:**
  - Any element (scene, line, beat, character detail, choreography) can carry an author-reserved marker. Her vocabulary includes "Mine to write", "Mine to build", "Mine to design", "Mine to choreograph", "Mine to time", "Mine to escalate", "Mine to settle", "Over to me", "My move", "My turn", "Now I write" and "Here's where I take over".
  - Marked items are hers alone. The AI never drafts them, and they appear as hers to settle.
  - Imported "Over to me" slots arrive with this marker (R-B-069).
- **Why:**
  - "This is my story. The writing is the part I keep" (SB-004).
  - "Write the Confession in my own voice" (S5-024).
  - "Name the wife, the family, and the dogs when I am ready... Mine to build" (S4-063).
- **Standing:** Decided by Yolanda (Bible convention, S4-064, SB-004).
- **Phase:** 2
- **Evolution:** The spec turns this into an AI mode, "Hand it to me" (SP-179). A per-element reserved marker was never specified, so the reserved-marker concept was dropped.
- **Sources:** S1-023, S1-075, S4-063, S4-064, S4-113, S5-017, S5-020, S5-024, SB-004, docs-story §0.2 label map, SP-179
- **Acceptance check:** Mark a scene "Mine to write" and ask the AI for a draft of it. The AI declines, and offers questions or teaching instead.

#### R-B-038 Teach it / Show it / Hand it to me; examples never decisions
- **Requirement:**
  - Guidance follows her rhythm. **Teach it**: what the element is, its job, what the frameworks say. **Show it**: one or more examples, always marked as demonstrations. **Hand it to me**: a prompt that returns the work to her, with undecided items flagged as hers.
  - Examples are offered in more than one flavor, so there is never "one right answer to match".
  - An example can never become a decision through display, import or summary.
  - The primary "Write" action is always available.
- **Why:** "Examples open the door; it does not walk through it for me" (S1-023). It protects her ownership, and multiple flavors stop her anchoring on one (S1-024). This matches her stored preference for fully taught concepts in instructional material.
- **Standing:** Decided by Yolanda (Bible). The spec carries it as AI modes (SP-179, HV-039).
- **Phase:** 2
- **Evolution:** The status model behind "example" is covered by other themes. Here the requirement is the guidance format.
- **Sources:** S1-023, S1-024, S1-182, S6-151, SB-004, SP-179, SP-180, HV-039
- **Acceptance check:** Opening Midpoint guidance shows Teach, then two or more labelled examples, then a hand-off prompt. Saving an example never changes the Midpoint's status.

---

## B. Her work habits and how the program fits them

#### R-B-039 Get it out of her head
- **Requirement:**
  - The program is designed so that everything she thinks about for a story can leave her head and live in one place: plot, structure, characters, questions, ideas, connections.
  - Both views are available: the big picture and the intricacies.
  - The success measure is whether it helps her sit down and write, and eventually finish.
- **Why:**
  - "This takes all of the things that I have to plan out of my head!" (S3-101)
  - "Stop the analysis paralysis and conquer the fear and ACTUALLY WRITE THE DAMN STORY!!" (S3-067)
- **Standing:** Decided by Yolanda (S3-066, S3-067, S3-101).
- **Phase:** 2
- **Evolution:** It was restated faithfully (S3-068, S3-072, SP-004, HV-004).
- **Sources:** S1-025, S1-178, S2-001, S3-066, S3-067, S3-068, S3-072, S3-101, S4-135, S7-007, SP-004, HV-004
- **Acceptance check:** In a usability session she can capture, connect and resume drafting without opening any notebook or external file.

#### R-B-040 One central, trusted tool
- **Requirement:**
  - The program earns trust as the single central place that keeps track of everything.
  - Trust is demonstrated through reliability (R-B-005, R-B-062, R-B-064) and honesty (R-B-065).
  - It is never claimed through appearance.
- **Why:** "And if I can get them out of my head, I get actually right the story because I can trust that one central tool is helping me to keep track of everything!!" (S3-102; verbatim, dictated; read: "I get to actually write the story"). ChatGPT's summary: "IT'S TRUST."
- **Standing:** Decided by Yolanda (S3-102). The ChatGPT restatement (S3-103) is an Accepted proposal.
- **Phase:** 2
- **Evolution:** The trust breakdowns during poster work (S4-002, S5-068) reinforced it.
- **Sources:** S3-102, S3-103, S3-104, S3-112, S5-083, S5-096
- **Acceptance check:** The data-survival test passes (R-B-064). Every save and status claim the app makes is verifiable.

#### R-B-041 Capture anything instantly, organize later
- **Requirement:**
  - A **+ Capture a Thought** action is reachable from everywhere, including the manuscript, without navigating away.
  - She can type, dictate, paste or drop in a note, then choose "Question I Have", "Idea I'm Thinking About", or neither.
  - No category, character or location is needed before saving, and she returns at once to what she was doing.
- **Why:** She has ADHD and writes on everything (S3-101). "Capture first, organize later" (SP-079, quoted as her explicit request). Nothing is lost because it is uncategorized.
- **Standing:**
  - The "Questions I have" and "things/ideas I am thinking about" sections: Decided by Yolanda (S3-114).
  - The capture mechanics: Accepted proposal (S3-105, S3-125, "💯").
- **Phase:** 2
- **Evolution:** The Story Brain content of these sections is detailed by another theme. Here the requirement is fit to her habit: speed, ubiquity and no forced taxonomy.
- **Sources:** S3-101, S3-105, S3-106, S3-114, S3-115, S3-123, S3-125, S6-126, SP-079, SP-182, HV-042, AC03
- **Acceptance check:** From the editor, capture a one-line comic idea with no category in under a minute, then return with the cursor in place (AC03).

#### R-B-042 Replace the notebook and sticky-tab scatter without loss
- **Requirement:**
  - Every captured thought stays retrievable even if uncategorized.
  - One thought can link to several elements (a profile, a scene, a relationship) without being copied.
  - Questions and ideas never become "two enormous lists" to scroll. Relevant entries surface by context, with an option to review everything.
- **Why:** "Because i'm constantly thinking about these constantly trying to figure it out. Happy in multiple notebooks and things.. Sticky tabs... Because i'm ADHD, so I write on everything!!" (S3-101; verbatim, dictated). "Enter information once. Use it everywhere" (S1-169).
- **Standing:** Decided by Yolanda for the habit (S3-101). The mechanism is an Accepted proposal (S3-106, S3-123, S1-169).
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S1-169, S3-101, S3-106, S3-111, S3-123
- **Acceptance check:** Link one note to Anthony, a scene and a relationship. Editing it once updates all three places, and one copy exists in storage.

#### R-B-043 Built against overwhelm and freeze
- **Requirement:**
  - She controls how much she sees. The big picture shows the whole architecture. Working on a sequence makes the rest recede. Writing a scene shows only what that scene needs.
  - Progressive disclosure, smart defaults and a concise mode for long worksheets.
  - No enormous mandatory questionnaire before first use: "I have an idea about two neighbors" is enough to start.
  - Fast launch and fast capture for short windows around her paying job.
- **Why:**
  - "I hold a great deal at once... it can spill into overwhelm and the freeze that comes with it" (S1-025).
  - The program must not become "a second job" (S1-141) or "another enormous creative project" (S1-178).
- **Standing:**
  - The freeze pattern: Decided by Yolanda (Bible).
  - The design responses: Accepted proposals (S1-171, S3-070, S3-113).
  - Concise mode and fast launch: Spec-only.
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S1-025, S1-141, S1-170, S1-171, S1-178, S3-070, S3-113, S3-166, SP-114, SP-181, SP-260, HV-006
- **Acceptance check:**
  - A brand-new project with only a title and one sentence is fully usable.
  - The scene worksheet opens in concise mode, and full fields appear only on request.

#### R-B-044 Voice-to-text input kept verbatim
- **Requirement:**
  - Dictated input is stored exactly as captured, including transcription errors, awkward phrasing and mid-sentence changes.
  - Any cleaned interpretation is stored alongside the original, never in place of it.
  - Likely corrections (for example "my life wasn't" → "my wife wasn't") are flagged for her confirmation, never applied silently.
  - Captured dialogue keeps its performance direction (for example "HUGE stress on 'UN'").
- **Why:**
  - She composes by voice-to-text (S5-119, S6-170, S8-005).
  - "I wouldn't correct the awkwardness... That's the voice" (S7-092).
  - "No silent correction should be canonized; confirm the final spoken word with the author" (A15-028).
- **Standing:**
  - Her habit: Decided by Yolanda (observed, her own messages).
  - Verbatim-with-interpretation: Possibility derived from her pattern and the archive guardrail (A15-028). It is also consistent with S7-092 (Unanswered proposal).
- **Phase:** 2
- **Evolution:** ChatGPT silently changed "life" to "wife" (S8-061). The archive later flagged this as not to be done silently.
- **Sources:** S3-166, S5-119, S6-170, S7-092, S7-147, S8-005, S8-061, A15-020, A15-028
- **Acceptance check:** Paste "my life wasn't…". The stored original is unchanged, and a suggested reading "wife?" awaits confirmation.

#### R-B-045 Built for partial reading and burst replies
- **Requirement:**
  - The program and its AI assume she may read only part of a long reply.
  - A proposal, question or caution she did not answer is never treated as accepted.
  - Unanswered proposals and questions are stored and resurfaced later (R-B-020).
  - She can capture an idea mid-read without losing her place in the reply.
  - Long AI outputs are concise, structured and skimmable.
- **Why:**
  - "I have only read up to this part"; "I didn't read everything you said, but I had another thought". This is "Not because i'm bored or disinterested in what you have to say" (S8-004).
  - "My eyes are glazing over" (S2-195, S3-166).
- **Standing:**
  - Her habit: Decided by Yolanda (her own words).
  - The design response: Possibility, derived from her habit (S8-004 implication).
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S2-195, S2-196, S3-166, S8-004
- **Acceptance check:** End an AI exchange with an unanswered proposal. The proposal remains "Proposed / unanswered" and appears in the resume view (R-B-018).

#### R-B-046 Never re-ask what is already decided
- **Requirement:** The program and its AI use decisions already recorded and never ask her to restate them. A question is asked only when the answer is truly unknown, and at most one focused question at a time.
- **Why:** "How could you possibly ask me that question? You already know the answer" (S6-056). "I don't need another creative brief from you" (S5-073).
- **Standing:** Decided by Yolanda (S6-056). Its restatement (S5-073) is an Accepted proposal.
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S5-073, S6-056, S6-173, S7-145, HV-026
- **Acceptance check:** Ask the AI something already recorded as Established. It answers from the record and cites it, with no question back.

#### R-B-047 Her physical, wall-and-paper way of working
- **Requirement:**
  - Long guidance, plans and references can be produced as printable, downloadable documents she can keep beside the computer.
  - Large wall maps and focused act and sequence maps are produced in Phase 3 (R-B-085).
  - Printable scene cards for a physical board are a Possibility (Q19).
- **Why:**
  - Long chat output is "a lot to scroll through and read"; "Can you put all of this in a downloadable document that I can print" (S6-047).
  - Wall poster plus a focused sequence map beside the computer: "That would, 100% be me!!" (S2-144).
  - She likes to "get physical" with index cards and sticky notes (S1-085).
- **Standing:** Decided by Yolanda (S6-047, S2-144, S1-085 Bible).
- **Phase:** 2 for printable documents. 3 for large-format maps. Physical-board cards: Possibility.
- **Evolution:** None.
- **Sources:** S1-001, S1-085, S2-144, S2-151, S2-196, S3-165, S5-120, S6-047
- **Acceptance check:** Any long guidance or planning view has "Export as printable PDF/DOCX".

#### R-B-048 Restrained color, meaningful color
- **Requirement:**
  - Color is used sparingly, and every color communicates something specific: status, strand or type.
  - Nothing is colored just to decorate.
  - Users can see the meaning of every color in a legend.
- **Why:** "Too much color coding because eventually I just get distracted and go on to something else" (S3-065). "Visual hierarchy over visual complexity" (S3-069).
- **Standing:** Decided by Yolanda (S3-065). The principle is an Accepted proposal (S3-069).
- **Phase:** 2
- **Evolution:**
  - Her Bible asks for color-coding cards by strand (SB-169), which is meaningful color, so it is consistent.
  - ChatGPT's "Color must have meaning" (S6-031) is consistent.
- **Sources:** S3-065, S3-069, S5-052, S6-031, SB-169
- **Acceptance check:** Every colored element in the UI has a legend entry. No screen uses more than the defined set of meaningful colors.

#### R-B-049 Nonlinear process is normal
- **Requirement:** The program supports:
  - drafting out of order;
  - writing the ending first;
  - revising in place;
  - dictating;
  - short sessions and long sessions;
  - starting with dialogue and backfilling the spine;
  - building a map retrospectively from written scenes.
  A scene can be complete while the scene before it is unwritten.
- **Why:** She is "closer to a discovery writer" (HV-005) who connects ideas associatively and jumps between projects (SP-013).
- **Standing:** Accepted proposal (S2-126, S2-078, 11:25 "I agree with everything"). The "panther at heart" quote is Spec-only (HV-005).
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S2-078, S2-126, S6-113, S7-041, SP-013, SP-099, HV-005
- **Acceptance check:** Draft Final Image first, then Chapter 3. Both save, count and export in story order.

#### R-B-050 Verbatim preservation of breakthrough conversations
- **Requirement:**
  - Creative conversations (for example her October 14 character session) can be preserved in full and verbatim in the project: who said what, exact jokes and lines, what she kept, what stayed hypothetical.
  - They stay searchable and linkable to characters and scenes.
  - A reconstruction or summary never substitutes for the original.
- **Why:** "What started as an exercise for my Fast homework, turned into a full understanding of my characters. Please lock this entire conversation in somewhere. I cannot lose any of it" (S6-105).
- **Standing:** Decided by Yolanda (S6-105).
- **Phase:** 2
- **Evolution:**
  - ChatGPT delivered only a "detailed reconstruction... not a verbatim export" (S6-106, A14-063), which falls short of her request.
  - The vision brief adds a session record and session harvest (HV-027, HV-033).
  - The spec's entity model has no conversation entity (F11). See Dropped.
  - Import of conversations is R-B-073.
- **Sources:** S6-105, S6-106, S6-171, S7-044, S7-053, S7-055, S7-073, S7-074, A14-063, A15-063, HV-022, HV-027, HV-033, HV-034, HV-052
- **Acceptance check:** Import the full Oct 14 chat. Searching an exact mid-conversation sentence returns it in context, and the file matches the source byte for byte.

---

## C. UX and visual design, naming

#### R-B-051 Professional, literary, warm design; not corporate, not clipart
- **Requirement:** The interface and every visual output look professionally designed:
  - sophisticated, warm, literary, "an intelligently organized writing studio";
  - not a generic office app, a sterile admin interface, an IT network diagram, a corporate presentation, childish embellishment, or "basic Clipart".
- **Why:**
  - Of vector clipart: "I do not like it because it looks like basic Clipart" (S5-049).
  - The visual engine "definitely needs to be designed, so it looks professional" (S5-115).
  - Her success criteria: "beautiful enough to display, accurate enough to trust, and practical enough to help you write" (S5-054).
- **Standing:**
  - Clipart rejection and the professional bar: Decided by Yolanda (S5-049, S5-115).
  - Not IT diagram or corporate: Accepted proposal (S1-118, S1-180).
  - Studio feel: Spec-only (HV-063).
- **Phase:** 2 for the interface. 3 for the map and poster engine.
- **Evolution:** She stated the professional bar explicitly for the visual engine. It is applied to the Phase 2 UI through the accepted "sophisticated, creative, readable design" (S6-154, Spec-only) and her clipart rejection.
- **Sources:** S1-118, S1-180, S5-049, S5-050, S5-054, S5-115, S6-002, S6-028, S6-154, S7-060, SP-186, HV-063, HV-064
- **Acceptance check:** A design review against a checklist ("no stock icons, no default chart styling, typographic hierarchy, consistent spacing") passes. She approves the look on first sight.

#### R-B-052 Visual hierarchy and restrained status
- **Requirement:**
  - Clear visual hierarchy over visual complexity.
  - Status is visible but restrained.
  - Context-rich navigation.
  - No overwhelming status inventories, no constant modal dialogs, no forms for every spark.
- **Why:** Visual stimulation distracts her (S3-065, S5-052). The aim is "visual clarity", not "visual stimulation" (S3-069).
- **Standing:** Accepted proposal (S3-069, S3-113). The negatives list is Spec-only (HV-064).
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S3-069, S3-113, S5-052, S7-060, HV-064, HV-065
- **Acceptance check:** Capture, status change and navigation all complete without a modal dialog.

#### R-B-053 Status shown visually: solid vs dotted
- **Requirement:**
  - Decided and confirmed material is drawn with solid outlines or markers. Unresolved and still-developing material uses dotted or dashed outlines.
  - Illustrative examples are visually distinct again (for example italic or lighter), and idea-only scenes vs drafted scenes follow R-B-033.
  - The same convention is used on every screen and every printed output.
- **Why:** "We should never present an illustrative possibility as though you've already committed to it." The map shows where development is needed "without forcing you to search through 57 pages" (S1-116).
- **Standing:** Accepted proposal (S1-116, "Wow you totally get me" / 10:35 acceptance).
- **Phase:** 2 on screen. 3 in print.
- **Evolution:**
  - The poster notation key added solid gold tags, plum dashed borders, gray or mauve question markers, and italic illustrative text (S6-031, Unanswered).
  - Legend colors on poster drafts (S4-032) and a green check vs purple dotted circle (S3-158) are alternatives, not decisions.
  - The full set of statuses is defined by another theme. Here the requirement is visual encoding.
- **Sources:** S1-116, S1-177, S2-095, S3-022, S3-158, S4-032, S6-018, S6-031, SP-065
- **Acceptance check:** In the outline, a Developing beat renders dotted and an Established beat renders solid. The same item prints the same way.

#### R-B-054 One legend, learned once
- **Requirement:**
  - A single story-map legend and visual language covers plot strands, arcs, values, sequence boundaries, turning points, causal links, thematic links, setups and payoffs, and confirmed vs unresolved material.
  - It is consistent across the app and all future maps, so she learns to read it once.
  - Strand color-coding follows her board (Kevin, Anthony, Francine, theme, and so on), and is user-defined per novel.
- **Why:** "Learning to read the maps once" (S1-177). Her board color-codes cards by strand (S1-083, SB-169).
- **Standing:** Accepted proposal (S1-177). Strand color-coding is Decided by Yolanda (Bible).
- **Phase:** 2 for the legend definition and on-screen use. 3 for printed maps.
- **Evolution:** Several poster legends were drafted (S3-022 relationship arrows; S4-032), all Unanswered. The program defines one.
- **Sources:** S1-083, S1-177, S3-022, S4-032, S6-031, SB-169
- **Acceptance check:** A legend panel lists every visual code in use. Changing a strand color updates every view.

#### R-B-055 Name: "StoryForge" rejected; name undecided; user can rename
- **Requirement:**
  - The product name is undecided and is hers to choose. "StoryForge" (and "Forge") must not be used in the UI.
  - The display name is configurable, so she can rename the application.
  - "Story Brain" is a working name for the central knowledge store, not the product name.
  - Do not borrow a name or visual metaphor from another of her products just because it exists (Spec-only, F7).
- **Why:** "I will rename that because I dislike 'Forge'" (S6-108). "Whatever we decide to call the overall program" (S5-116).
- **Standing:**
  - Rejection of the name: Decided by Yolanda.
  - Rename capability: Spec-only (HV-066).
  - "Story Brain": Accepted proposal as a working name (S3-104).
- **Phase:** 2
- **Evolution:**
  - "StoryForge" was ChatGPT's provisional build name (S6-059) and was replaced by her rejection.
  - Build files are still literally named StoryForge (S7-004, PK-001). Rename them.
- **Sources:** S3-104, S5-116, S6-059, S6-108, S7-004, S7-005, S7-062, SP-001, HV-066, HV-071, PK-001
- **Acceptance check:** No "StoryForge" or "Forge" string appears in the UI or the installer. Settings let her set the app's display name.

#### R-B-056 Look and palette (to confirm)
- **Requirement:**
  - The visual identity uses a deliberate, elegant palette and typography: a literary serif display, readable body type, and a clean sans for labels.
  - Which palette applies is undecided. The options are the purple-and-gold poster identity (deep purple, gold, cream) or her personal palette (Deep Purple #522875, Bright Orange #ff6b35, Hot Magenta #ff1493, Soft Cream #faf5ef, Charcoal #1a1a1a). See Needs Yolanda Q8.
  - Any illustration is fully framed, never cropped or distorted.
- **Why:**
  - She reacted to the illustrated purple-and-gold posters with "Visually, of course I love this better" (S5-057).
  - "A lot of the images are out of the frame" (S5-056).
- **Standing:**
  - The cropping ban: Decided by Yolanda (S5-056).
  - Preserving the illustrated aesthetic for posters: Accepted proposal (S5-050).
  - The palette for the app UI: Possibility, needs a decision.
- **Phase:** 2 for the UI theme. 3 for poster art.
- **Evolution:** The poster palette was ChatGPT's (S3-021, S4-036, S6-029), and she responded positively to the overall look but never to the hex values.
- **Sources:** S3-021, S4-018, S4-036, S5-048, S5-050, S5-056, S5-057, S6-019, S6-029, S6-030
- **Acceptance check:** No image is clipped at any window size. The palette is set by one theme file she can approve.

#### R-B-057 Her terms, accessible, keyboard-friendly
- **Requirement:**
  - The interface uses her own language ("Questions I Have", "Things & Ideas I'm Thinking About", "Write Anyway", "Return to Writing", "Mine to write") and project-specific terminology, not corporate task labels.
  - It is accessible: contrast, responsive layouts, keyboard-friendly editing, fast navigation.
- **Why:** These labels "express her mental workflow" (HV-043). Writing is not "a database administration job" (SP-267).
- **Standing:** The labels themselves are Decided by Yolanda (S3-114). Terminology and accessibility rules are Spec-only.
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S3-114, SP-188, SP-261, SP-263, SP-267, HV-043
- **Acceptance check:** Labels match her terms exactly. Every core action is reachable by keyboard.

---

## D. Platform, installation, privacy, backups, history, reliability

#### R-B-058 Windows target with a clean install
- **Requirement:**
  - The program installs and runs on her Windows computer from written instructions.
  - Data paths are documented.
  - Linux tests do not count as Windows readiness.
- **Why:** She will use it on her own machine starting immediately.
- **Standing:** Spec-only (AC20) and stated in this consolidation's brief. It was not found in her own words in the transcript sections (S6-160). Confirm: Needs Yolanda Q2.
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S6-160, SP-231, F2
- **Acceptance check:** On a clean Windows machine, following only the README, she launches the app and creates a project (AC20).

#### R-B-059 Form factor: desktop program vs local browser app
- **Requirement:**
  - The program runs locally on her machine.
  - Whether it is a desktop application (its own window) or a local service opened in a browser is undecided.
  - Either way it needs no hosting or subscription and is private by default.
- **Why:** The brief calls it a "desktop program". ChatGPT's build and spec are a local Python web app at 127.0.0.1 opened in a browser (S6-054, S6-059, SP-010, F2).
- **Standing:** The browser-based local app is an Unanswered proposal (S6-054; she did not object, and it was implemented). Needs Yolanda Q1.
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S6-054, S6-059, S6-069, S6-070, SP-010, SP-203, F2
- **Acceptance check:** Per the chosen form, the app launches from a Start-menu or desktop icon with no terminal steps.

#### R-B-060 Local-first and private
- **Requirement:**
  - All data is stored locally by default.
  - No remote exposure: loopback only if a local server is used.
  - No third-party telemetry.
  - No unconsented AI transmission. Any AI use discloses what leaves the machine and requires her consent and credentials.
  - Private manuscripts are never used to train shared models without explicit informed permission.
  - Keeping manuscript content out of the program is a legitimate choice.
  - She can delete project data.
- **Why:** These are unpublished novels and personal material (S2-123). "Never assume that 'runs locally' means secure" (S6-158).
- **Standing:**
  - The ownership and privacy commitments: Unanswered proposal (S2-123, blanket "I agree with everything" at 11:25, then she focused on export).
  - "Local, private": stated in the consolidation brief.
  - Telemetry and AI-disclosure rules: Spec-only.
  - Included because it fits her stated need for one trusted tool.
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S2-116, S2-123, S6-054, S6-158, SP-195, SP-203 to SP-206, SP-210, SP-259, SP-264
- **Acceptance check:** A network monitor shows zero outbound traffic during a session with AI off. A data-deletion command removes a project fully.

#### R-B-061 Never trapped; never held hostage
- **Requirement:**
  - Her story never becomes trapped in the program.
  - Exporting and backing up never depend on a subscription, licence state or AI availability.
  - She can always retrieve manuscripts and project data.
- **Why:** "The author owns the manuscript. Our program is a place to create and develop it, not a place where it becomes trapped" (S2-129). "Your story must never become trapped inside the program" (S3-112).
- **Standing:** Accepted proposal (S2-129 amplifies her decided export requirement S2-128; S3-112). The no-subscription clause is an Unanswered proposal (S2-137).
- **Phase:** 2
- **Evolution:** It was named "Creative Portability" (S2-138, S2-149, Accepted).
- **Sources:** S2-128, S2-129, S2-137, S2-138, S2-149, S3-112, SP-043
- **Acceptance check:** With every optional service disabled, a full project export succeeds and opens without the app (R-B-082).

#### R-B-062 Reliable backups and verified restore
- **Requirement:**
  - Backups are automatic or one-click.
  - Locations are documented.
  - A full restore reproduces entity counts, stable IDs, relationships, statuses, manuscript text, history and checksums.
  - Import and recovery are tested, not just the export endpoint.
- **Why:** These are years of creative work. Trust is demonstrated through reliability (S3-112).
- **Standing:** Accepted proposal (S3-112, S5-093 as principle). The test detail is Spec-only (AC15).
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S3-008, S3-112, S5-093, S6-156, SP-196, SP-198, SP-209, AC15
- **Acceptance check:** Back up, delete records in a copy, restore. Counts, IDs, text and checksums match (AC15).

#### R-B-063 History and undo for every change
- **Requirement:**
  - Every change to story records and prose keeps a history: what changed, when, why, and what else might be affected.
  - The author can see exact old and new values.
  - She can undo a recent action and roll back selected changes without losing newer unrelated work.
  - She can recover earlier structural decisions, for example moving a scene back to its old position.
- **Why:** "Version history: recover previous structural decisions" (S1-163). Experimentation is safe only if reversible (S2-015).
- **Standing:** Accepted proposal (S1-162, S1-163). Traceable changes (S5-090) is an Unanswered proposal. Selective rollback is Spec-only (AC16).
- **Phase:** 2
- **Evolution:** The ChatGPT build writes before/after JSON per change (S6-066) but restore is only "Partial" (S6-060).
- **Sources:** S1-162, S1-163, S5-090, S5-093, S5-095, S6-060, S6-066, SP-063, SP-177, HV-054, AC16
- **Acceptance check:** Move the pie scene from 35% to 50%, edit three other things, then roll back only the move. The other three edits remain.

#### R-B-064 Data integrity: edits stay isolated
- **Requirement:**
  - Every record has a stable identity.
  - Updating one element never alters another unless she approves it.
  - A correction is a targeted update, never a rebuild.
  - The data-survival test passes:
    1. Establish 15 beats.
    2. Change the Midpoint.
    3. Regenerate the views.
    4. Check that all 15 beats still exist.
    5. Check that unrelated character information is unchanged.
    6. Check that only the right dependencies are flagged.
    7. Reverse the change exactly.
- **Why:**
  - Poster work showed versions dropping Beat 12 and changing canon (S5-060, S5-069).
  - "Look, I keep asking... one hundred percent accurate. I don't want to have to keep creating versions" (S5-068).
  - "This would make the phase three program unusable" (S5-083).
- **Standing:** Her frustration and the unusability concern are Decided by Yolanda (S5-068, S5-083). The integrity mechanisms are Unanswered proposals (S5-086 to S5-095). She said "Ignoring all that for a moment… let's say that the changes I make… does what is supposed to do", which assumes them as the baseline. Included because they are her baseline assumption.
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S5-068, S5-069, S5-083, S5-084, S5-085, S5-089, S5-095, S5-097, S5-098, S5-123, SP-199, SP-265
- **Acceptance check:** Run the seven-step survival test. All pass.

#### R-B-065 Honest status; never claim done or saved without verification
- **Requirement:**
  - The program states plainly what is saved, verified, print-ready or supported, and what is not.
  - Verification claims say exactly what was checked.
  - It never says "ready" because something looks finished.
- **Why:**
  - She had been told posters were finished and print-ready when they were not (S4-002).
  - "Is it accurate? I haven't fully checked" (S5-057). She should not have to be the QA department (S5-070).
- **Standing:**
  - Her complaint: Decided by Yolanda (S4-001, S4-002, S5-065).
  - The honesty commitments: Accepted proposal (S5-069 to S5-072, "Please do so").
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S4-001, S4-002, S4-003, S5-057, S5-065, S5-069, S5-070, S5-072, S5-081, S5-122, S6-173, SP-146, SP-190, SP-242
- **Acceptance check:** An export to a lossy format says what it dropped. Status texts never read "verified" unless a named check ran.

#### R-B-066 Content separate from presentation
- **Requirement:**
  - Story data, decisions and manuscript are stored independently of every view, layout, illustration and export.
  - Changing art, layout, colour or print size never changes a fact.
  - Generated images never write to canon.
- **Why:** Image generation silently changed canon: white characters, Kevin dumping fish guts, teen characters (S3-163). "Art is layered on top of content, not fused with it" (S5-107).
- **Standing:** Accepted proposal (S5-107, S5-112, accepted at 15064 with "you are onto something correct").
- **Phase:** 2 for the data separation. 3 for the rendering engine.
- **Evolution:** None.
- **Sources:** S3-163, S5-061, S5-086, S5-094, S5-101, S5-107, S5-112, S6-015, SP-262
- **Acceptance check:** Switch view theme or layout. A diff of the data store shows no change.

#### R-B-067 Dates from the system clock
- **Requirement:** All dated records (sessions, archives, imports, history) take dates from the system clock, never from inference.
- **Why:** The assistant used a wrong date, and she had to correct it: "Actually today is 10/14/2026" (S6-050, S8E-002).
- **Standing:** Possibility (inferred).
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S6-050, S8E-002
- **Acceptance check:** A capture's timestamp equals the OS time.

---

## E. Import

#### R-B-068 Four ways to start a project
- **Requirement:** A project can start from:
  - an idea (title or one sentence);
  - imported planning materials (story bible, outline, beat sheet, character profiles, scene list);
  - an existing manuscript, partial or complete, which produces a proposed structural map;
  - later, a combination of materials, with conflicts reconciled by the author.
- **Why:** "An author shouldn't have to recreate years of story development just to use our software" (S2-117).
- **Standing:** Accepted proposal (S2-117).
- **Phase:** 2 for idea, planning import and manuscript import. Later for combined reconciliation across many sources (stated as "eventually").
- **Evolution:** None.
- **Sources:** S2-117, S2-078, S1-007, S1-171
- **Acceptance check:** Create three projects, one by each route. Each opens with usable content.

#### R-B-069 Story Bible import that keeps her labels
- **Requirement:** Importing a story bible (IDW Bible v5 first) preserves her labels exactly:
  - "Decided." → Established.
  - "One way I could play it, not a decision yet", sample dialogue and "Weak:/Strong:" → Illustrative.
  - "Still open", "Over to me", "My move", "My turn", "Now I write", "Here's where I take over" → Unanswered / hers-to-write (R-B-037).
  - "Decided in spirit" → Developing.
  - Unlabeled "What it is" plans → Developing.
  - Craft teaching → Established as method.

  Further rules:
  - Nothing illustrative is promoted.
  - Every item keeps a link to its source passage.
  - Re-import updates without duplication or promotion.
  - The import report lists imported, skipped, flagged and ambiguous items.
- **Why:** The Bible "deliberately mixes instruction, examples, decisions, open questions, which must not be flattened" (S2-118). Examples are never decisions (SB-004).
- **Standing:**
  - The labels: Decided by Yolanda (Bible).
  - Import fidelity and the preliminary-architecture review: Accepted proposals (S2-118, S2-125).
  - Detail and tests: Spec-only (SP-192 to SP-194, AC02, Scenario F).
- **Phase:** 2
- **Evolution:**
  - ChatGPT's status model kept dropping "example" (S1 D6) or merging Developing with Unanswered (S4 Dropped 1).
  - Import must keep all distinctions.
  - The mapping table is from docs-story §0.2.
- **Sources:** S1-023, S1-182, S2-117, S2-118, S2-125, S4-065, S6-155, SB-004, docs-story §0.2, SP-192 to SP-194, HV-077, AC02
- **Acceptance check:**
  - Import Bible v5. Kevin's Bible Lie/Ghost shows as Illustrative, never Established.
  - Re-import: the record count is unchanged.

#### R-B-070 Later author clarifications outrank older documents
- **Requirement:**
  - When later author statements conflict with an imported document, the later statement wins, and both are kept with dates and sources.
  - Examples: her 10-14 Kevin work over the Bible's example Kevin Lie; her five-dollar-bill correction (the bill is a candidate, not decided).
  - Conflicts the program cannot resolve are flagged for her. It never picks a winner silently.
  - Imported "user_overrides" from generated files are flagged for confirmation.
  - Any fuller fixed ranking of documents is not a requirement yet (see Standing and A's R-A-031).
- **Why:** The AI reverted to the outdated Bible Lie for Kevin instead of their 10-14 work. Her words: "But didn't we establish that yesterday? … We agreed that what we were writing yesterday about. Kevin was different from the story bible. And I thought we'd defined his (Kevin's) lie and all of that yesterday." (T L20960). (ChatGPT's reply, not hers: "You shouldn't have had to remind me…", S7-136.)
- **Standing:** Decided by Yolanda for the rule above (her objection, T L20960; her "isn't accurate anymore" about the Bible's Anthony, T L18816). ChatGPT's three-tier order (latest decisions, then the Oct 14 archive, then the Oct 13 Bible; S7-137, S8-001) is an Unanswered proposal. Her "Please do so" (T L21090) answered ChatGPT's offer to develop Anthony's arc, not the ranking. The spec and archive tiers (SP-008, A15-062) were never put to her and are not part of this requirement.
- **Phase:** 2
- **Evolution:**
  - The spec's hierarchy (S6-112, SP-008) is author decisions, then Bible, then principles (Spec-only).
  - After her objection, ChatGPT stated latest decisions, then the Oct 14 archive, then the Oct 13 Bible (S7-137). Unanswered.
  - The 10-15 archive restates a scoping (A15-062). Spec-only.
- **Sources:** S5-004, S6-112, S7-009, S7-136, S7-137, S8-001, A15-062, SP-008, SP-068, docs-story §6 #1
- **Acceptance check:** After importing both the Bible and the Oct 14 archive, Kevin's current Lie shows the archive's version, with the Bible's version as an older illustrative alternative.

#### R-B-071 She approves interpretations before they enter the model
- **Requirement:** Structural interpretations made on import (scene boundaries, flashback vs timeline, POV assignment, beats, statuses) stay pending until she approves them. AI guesses never quietly become authoritative.
- **Why:** The AI may misread. "The author approves structural interpretations before they're incorporated into the master story model" (S2-114).
- **Standing:** Accepted proposal (S2-114, S2-122).
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S2-114, S2-117, S2-122, SP-067
- **Acceptance check:** After importing a manuscript, the proposed scene splits appear in a review queue. Nothing appears in the outline until she accepts it.

#### R-B-072 Manuscript import from Word, Scrivener and others
- **Requirement:**
  - She can import manuscripts from Word (.docx) and Scrivener (where feasible), plus RTF, plain text, Markdown, ODT, and PDF (with scanned PDF as a later milestone).
  - Import never loses formatting or silently replaces words.
  - The program tries to identify chapters, scenes, viewpoint changes and locations, subject to approval (R-B-071).
- **Why:** If manuscripts can be written in the program, "we should be able to import" from Word or Scrivener (S2-128).
- **Standing:**
  - Import from Word/Scrivener: Decided by Yolanda (S2-128).
  - The format list: Accepted proposal (S2-130, "again I agree with everything").
  - Fidelity rule: Spec-only (SP-139).
- **Phase:** 2 for DOCX, TXT, MD and RTF. Native Scrivener and PDF were "specific engineering milestones, not promised from the start" (S2-130). See Needs Yolanda Q4.
- **Evolution:** The spec narrows import to "DOCX, text/Markdown and structured formats", "as far as technically feasible" (SP-191). See Conflicts.
- **Sources:** S2-114, S2-128, S2-130, SP-139, SP-191
- **Acceptance check:** Import a .docx with italics and scene breaks. The text is identical and the formatting is preserved.

#### R-B-073 Import and preserve creative conversations
- **Requirement:**
  - She can import chat transcripts or exports, for example ChatGPT conversations.
  - Each is stored verbatim as a session record (R-B-050).
  - A session harvest is offered: what she approved, what stays hypothetical, new questions, and which characters and scenes are implicated.
  - Harvested items are linked, source-backed candidates, never canon.
  - Session archives stay findable by the AI and by search ("I KNOW you made a downloadable document").
- **Why:** "I cannot lose any of it" (S6-105). The AI failed to use the archive she remembered (S7-139).
- **Standing:** The need: Decided by Yolanda (S6-105). The harvest mechanism: Spec-only (HV-033, HV-034). Archive findability: Possibility (S7-139).
- **Phase:** 2
- **Evolution:** The spec has no conversation entity (F11). See Dropped.
- **Sources:** S6-105, S6-106, S7-053, S7-139, S8E-009, HV-022, HV-033, HV-034, PK-006
- **Acceptance check:** Import a chat. Choose "harvest": candidates appear as Proposed, each linking back to the exact message.

#### R-B-074 Import and export of her plotting spreadsheets
- **Requirement:**
  - She can import her plotting spreadsheets, starting with the BS2 Breakdown workbooks.
  - The importer recognizes beats, groups (Thesis/Antithesis/Synthesis), descriptions, placement percentages, page and word columns at 250 and 300 words per page, scene type, and sub-beats (Stasis = Death).
  - It parses both numbers and text ranges ("1,200 - 10,800"), strips invisible characters, and flags apparent typos (XL-B F13) rather than importing them silently.
  - It can export an updated plotting spreadsheet.
  - Her spreadsheet method is preserved, not replaced.
- **Why:**
  - Her reaction to the fish-guts sequence map: "Omg!! This is nearly exactly how I manually plot my stories in a spreadsheet" (S3-061).
  - She shared spreadsheets as the design reference (S3-062).
- **Standing:**
  - Her method and sharing: Decided by Yolanda (S3-061, S3-062).
  - Import/export: Unanswered proposal (S3-063). Included because it fits her goal of building on what works.
- **Phase:** 2. Confirm: Needs Yolanda Q14.
- **Evolution:** None.
- **Sources:** S3-058, S3-061, S3-062, S3-063, S3-064, XL-001 to XL-049
- **Acceptance check:** Import XL-A. Fifteen beats plus the "Stasis = Death" sub-beat appear with groups, scene types and 300-wpp landmarks. XL-B F13 is flagged.

#### R-B-075 Provenance on everything imported
- **Requirement:**
  - Each imported item keeps its source file, position or excerpt, import timestamp, decision status and extraction notes.
  - "Source says X" is kept distinct from "AI inferred Y".
  - Any summary or link traces back to its source passages.
- **Why:** It prevents treating speculative notes as canon (S2-118). "No black-box transformation of the story bible" (SP-069).
- **Standing:** Accepted proposal (S2-118: Content, Source, Decision status, Author approval, Last updated). The extended fields are Spec-only.
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S2-118, S4-037, S5-124, SP-066, SP-067, SP-069, HV-048
- **Acceptance check:** Open any imported fact and click "source". The exact Bible passage is shown.

---

## F. Export and printing

#### R-B-076 Manuscript export to formats usable outside
- **Requirement:**
  - Manuscripts export to Word (.docx), RTF, plain text, Markdown, PDF, EPUB and ODT, plus Scrivener where supported.
  - Chapter order is predictable and the prose is preserved.
- **Why:** "We should be able to export it from our program into different formats that are usable outside of the program" (S2-128).
- **Standing:** Export into multiple formats: Decided by Yolanda (S2-128). The format matrix: Accepted proposal (S2-130).
- **Phase:** 2 for DOCX, PDF, TXT, MD, RTF, EPUB and ODT. Scrivener is a later milestone (S2-130).
- **Evolution:**
  - The spec narrows the minimum to "lossless plain text, Markdown, structured JSON" plus a manuscript export "e.g., DOCX" (SP-144, SP-145, F3).
  - The narrowing is not hers. See Conflicts.
- **Sources:** S2-128, S2-129, S2-130, S6-143, SP-137, SP-144, SP-145, SP-146
- **Acceptance check:** Export the full manuscript to each Phase 2 format. Every file opens in a standard reader, with chapters in order.

#### R-B-077 Export the planning, the visuals, everything
- **Requirement:** Export covers five categories:
  1. manuscript (whole, or chapters, scenes or sequences);
  2. planning materials (story bible, outlines, beat sheets, character profiles, settings, scene plans, research);
  3. visualizations (maps, timelines, arcs; Phase 3 rendering);
  4. analysis and tracking (value changes, diagnostics, progress, word counts, unresolved decisions, setups and payoffs);
  5. a complete project archive.
  Each can be exported as a human-readable presentation (documents, tables, reports) and as portable data.
- **Why:** "We should also support exporting the planning, the visuals, etc." (S2-140).
- **Standing:** Decided by Yolanda (S2-140). The categories and the two export types are Accepted proposals (S2-142, S2-146).
- **Phase:** 2 for categories 1, 2, 4 and 5, and simple on-screen visuals as PDF. 3 for professional maps and posters.
- **Evolution:** The spec keeps only manuscript export and project backup (SP-143, SP-197). Presentation exports of planning were dropped. See Dropped.
- **Sources:** S2-133, S2-140, S2-141, S2-142, S2-146, S2-149
- **Acceptance check:** Export "Character profiles" alone as a formatted DOCX, and the same data as JSON.

#### R-B-078 Exports preserve formatting and never silently lose content
- **Requirement:**
  - Where the destination supports them, exports keep chapter titles and divisions, scene breaks, paragraphing, italics and emphasis, dialogue formatting, footnotes and endnotes, ordering, front and back matter, and metadata.
  - Before a lossy export, the program explains what will change ("Plain text does not preserve italics... Your original manuscript will remain unchanged").
  - After export it verifies that expected chapters, scenes and text are present, and never claims success just because a file exists.
  - Exporting never alters the original.
- **Why:** It protects her work, not just her words (S2-131, S2-135).
- **Standing:** Accepted proposal (S2-131, S2-135, S2-148).
- **Phase:** 2
- **Evolution:** It was dropped from the spec except "explicit about formats" (SP-146). See Dropped.
- **Sources:** S2-131, S2-135, S2-148, SP-146
- **Acceptance check:** Export to TXT: a warning lists the italics lost. Afterwards the verification report shows 100% of chapters present.

#### R-B-079 Partial export
- **Requirement:** Export a single scene, a sequence, selected chapters or the whole manuscript, without deleting anything. Example: send Chapters 1-5 to a beta reader as Word or PDF.
- **Why:** Practical sharing (S2-132).
- **Standing:** Accepted proposal.
- **Phase:** 2
- **Evolution:** It was dropped from the spec.
- **Sources:** S2-132
- **Acceptance check:** Select chapters 1-5 and export to PDF. The file holds exactly those chapters.

#### R-B-080 Export presets, including custom
- **Requirement:**
  - Built-in presets: Working Manuscript, Editorial Manuscript (for an editor or agent), Beta Reader Copy (without private planning notes), Print Review (PDF for reading and annotation), E-book (EPUB), Project Backup.
  - She can create her own presets, for example chapter numbers without titles.
- **Why:** Different destinations need different settings, and reconfiguring each time is a burden (S2-134).
- **Standing:** Accepted proposal.
- **Phase:** 2
- **Evolution:** It was dropped from the spec.
- **Sources:** S2-134
- **Acceptance check:** "Beta Reader Copy" output contains no planning notes. A saved custom preset reproduces identical output.

#### R-B-081 Selectable export screen
- **Requirement:**
  - An export screen with checkboxes for what to include: complete manuscript, story bible, character development, beat sheet, scene and sequence maps, posters (Phase 3), timeline and locations, causal relationships, setups and payoffs, author notes and decisions, private research, revision history.
  - Then she chooses formats and a destination.
- **Why:** Don't force an enormous archive when someone wants only character profiles (S2-147).
- **Standing:** Accepted proposal.
- **Phase:** 2
- **Evolution:** It was dropped from the spec.
- **Sources:** S2-147
- **Acceptance check:** Uncheck "revision history" and "private research". The export contains neither.

#### R-B-082 Portable, documented full-project archive
- **Requirement:**
  - The full project export holds all canon, alternatives, questions, ideas, scenes, prose, links, history, settings, references and session records.
  - It uses a documented, open, human-intelligible format, readable years later without the software.
  - It can be imported back.
- **Why:** No vendor lock-in. "Work stays accessible if author stops using the app" (S2-133).
- **Standing:** Accepted proposal (S2-133, S2-148). The completeness list is Spec-only (SP-197).
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S2-133, S2-139, S2-146, S2-148, SP-144, SP-197, SP-209
- **Acceptance check:** Open the archive in a text editor: structure and prose are readable. Re-import it into a clean install: an identical project results.

#### R-B-083 Round-trip editing with an outside editor
- **Requirement:**
  - Export chapters to Word. An editor revises with Track Changes.
  - She imports the revised file. The program compares it with the in-app version and lets her accept or reject per change.
  - Nothing is overwritten automatically, and prose changes are never confused with structure changes.
- **Why:** It keeps author control when working with external editors (S2-136).
- **Standing:** Unanswered proposal (S2-136, blanket agreement only). It fits her ownership principle.
- **Phase:** 2 or Later. See Needs Yolanda Q13.
- **Evolution:** None.
- **Sources:** S2-136
- **Acceptance check:** Re-import a tracked-changes DOCX. A diff view shows each change with accept/reject, and the original is untouched until she accepts.

#### R-B-084 Phase 2 printing
- **Requirement:**
  - Phase 2 provides printable output at home-printer sizes (US Letter): the manuscript (Print Review PDF), planning documents and long guidance (R-B-047), and simple outline and structure views.
  - Large-format posters and print preflight are Phase 3 (R-B-085, R-B-086).
- **Why:** She prints references to work beside her computer (S6-047). She asked for output "as an extra large wall poster and/or a normal document on my printer" (S4-001).
- **Standing:** Decided by Yolanda (S4-001, S6-047). The presets are an Accepted proposal (S2-134).
- **Phase:** 2 (letter-size); 3 (large-format).
- **Evolution:** None.
- **Sources:** S2-134, S4-001, S4-019, S4-020, S6-047, PF-008
- **Acceptance check:** Print the manuscript and a character profile on Letter paper: margins and pagination are correct, and the text is readable.

#### R-B-085 Large-format and zoom printing (Phase 3)
- **Requirement:**
  - Phase 3 prints whole-novel maps at 48×36 in and 60×45 in.
  - Act maps at 24×18 or 36×24, and sequence maps at 18×12 or 24×18.
  - A desk reference reflowed for letter paper, never shrunk.
  - Narrative Zoom works for export: any zoom level can be printed.
- **Why:**
  - "Please update the pixel quality so that I can safely print at either 48 × 36 inches and 60 × 45 inches" (S3-052).
  - Printing the whole map, an enlarged Act Two, or one sequence: "That would, 100% be me!!" (S2-144).
  - Of companion posters: "will be divine to have!" (S3-055).
- **Standing:**
  - Sizes and zoom printing: Decided by Yolanda (S3-052, S2-144).
  - Companion sizes: Accepted proposal (S3-055).
  - Zoom export: Accepted proposal (S2-145).
- **Phase:** 3. Phase 2 data must capture everything the maps show (beats, positions, statuses, links, strands, act and sequence membership) so maps can be generated without re-entry.
- **Evolution:** These sizes began as Phase 1 poster requirements and carry into the Phase 3 engine (S5-105).
- **Sources:** S2-143, S2-144, S2-145, S3-052, S3-055, S4-019, S4-020, S5-002, S5-105, S5-108, S6-032
- **Acceptance check:** In Phase 3, export the Act Two map at 36×24 and the full map at 60×45. Both pass preflight.

#### R-B-086 Print preflight and deterministic layouts (Phase 3)
- **Requirement:**
  - Story maps are rendered by a deterministic, rule-based engine (vector graphics, real typography), never by generative image creation.
  - Before export, preflight checks for text overflow, bad crops, fonts too small for the size, all beats present, arrows connected, overlapping labels, resolution, and paper fit.
  - On failure it refuses with a specific message and options, never exporting junk.
  - Templates include Chronological, Relationship, Hybrid Command Center, Character Depth, McKee Gap, Act Zoom and Sequence Zoom.
  - Output modes include Wall Poster, Desk Reference, Act Zoom, Sequence Map, Writer Focus and Presentation.
  - Optional art layers sit on top of content.
- **Why:** The poster failures (missing Beat 12, garbled text, 30 PPI images, cropped faces). "A story map that is correct in the database but broken in the export is still broken" (S5-113).
- **Standing:** Accepted proposal for the engine (S5-114, accepted at 15064: "I like the thought of a visual story mapping system/engine. It definitely needs to be designed, so it looks professional").
- **Phase:** 3
- **Evolution:** It was moved out of Phase 2 by her (S5-116). The Phase 1 exception (AI art acceptable for her own posters, S5-117) does not apply to the program.
- **Sources:** S5-101 to S5-114, S5-117, S6-009, S6-022
- **Acceptance check:** In Phase 3, a map with overflowing text fails preflight with a named reason. No PDF is written.

#### R-B-087 Visual export formats (Phase 3)
- **Requirement:** Maps export as high-resolution, print-ready PDF (including oversized), SVG, PNG, and editable formats where feasible. She can export a whole map or a selected portion.
- **Why:** Printing posters and sharing them (S2-143).
- **Standing:** Accepted proposal.
- **Phase:** 3
- **Evolution:** None.
- **Sources:** S2-143
- **Acceptance check:** In Phase 3, an SVG export opens in a vector editor with live text.

---

## G. Project setup

#### R-B-088 Many novels, each configured, none rebuilt
- **Requirement:**
  - The program holds multiple independent novel projects, for example IDW, The Replacement and Midnight Blues.
  - Each has its own genres, methods, characters, plots, storyworld, manuscript, progress and settings.
  - Nothing IDW-specific is hard-coded. A second novel in an unrelated genre works with no IDW defaults.
- **Why:**
  - "After I write 'I Declare War' I'll be writing other books" (S3-010).
  - "You configure the program for each novel. You don't rebuild the program for each novel" (S3-011).
- **Standing:** Decided by Yolanda (S3-010). The restatements are Accepted (S3-011, S3-015, "Yes!!").
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S2-048, S3-010, S3-011, S3-015, S3-168, SP-023, SP-031, SP-109, AC01
- **Acceptance check:** Create a thriller project with Hero's Journey. No Kevin, ledger or Save the Cat defaults appear (AC01).

#### R-B-089 Genre checkboxes with primary and secondary roles
- **Requirement:**
  - On project setup and at any later time, the author selects conventional genres by checkbox and assigns roles (primary, secondary).
  - The list includes Comedy, Mystery, Thriller, Horror, Romance, Historical Fiction, Fantasy, Science Fiction and Literary Fiction, and accepts custom genres and subgenres (for example psychological thriller, romantic comedy).
  - Selections can change any time as the story evolves.
- **Why:** She asked: "Do you think we should have checkboxes..." for genre, structure, primary/secondary (S2-066). The program "won't be only for the comedy genre" (S2-048).
- **Standing:** Decided by Yolanda (S2-066, S3-010). The list is an Accepted proposal (S2-071).
- **Phase:** 2
- **Evolution:**
  - ChatGPT put "different genres and writing workflows" in Phase 3 (S3-009).
  - She replaced that: "This should be in the program that works for me" (S3-010).
- **Related:** Custom genres and subgenres are one instance of her decision that the program is editable: "If someone thinks of something that they had not defined yet, they can add it." (R-A-109, T L2387).
- **Sources:** S2-048, S2-053, S2-066, S2-071, S3-009, S3-010, S3-012
- **Acceptance check:** Set Comedy as primary and Mystery as secondary, then add a custom "Neighborhood farce". All three persist and can be edited later.

#### R-B-090 Blake Snyder story types as a separate list
- **Requirement:**
  - Blake Snyder's story types (Buddy Love, Monster in the House, Whydunit, Golden Fleece, Dude with a Problem, and the rest of the ten) are a separate checkbox list. They are never merged into the conventional genre list.
  - The list has its own primary and secondary roles.
  - Both lists are optional.
- **Why:** "I combine Blake Snyder's genres and conventional genres so I can see where my story fits on both and then have the primary/secondary for each of them" (S2-067).
- **Standing:** Decided by Yolanda (S2-067). The separation rule is an Accepted proposal (S2-073, "Yes. I AM STILL IN LOVE WITH THIS!").
- **Phase:** 2
- **Evolution:** The spec reduces both to "adaptable genre, form, and framework settings" (SP-031). See Dropped.
- **Sources:** S2-067, S2-073, S2-074, S3-012, S3-014
- **Acceptance check:** The setup screen shows two separate lists. IDW can be Comedy (genre, primary) and Buddy Love (Snyder type, primary) at the same time.

#### R-B-091 A third genre tier ("influence" / "supporting")
- **Requirement:** Optionally, a third role, "Genre influence" or "supporting" (borrowed elements without adopting the conventions), can be offered in both lists.
- **Why:** A novel may meaningfully combine several traditions (S2-072).
- **Standing:** Unanswered proposal (S2-072, S3-012 "supporting"). She asked only for primary and secondary.
- **Phase:** 2 if confirmed.
- **Evolution:** It adds to her two-tier decision and does not replace it.
- **Sources:** S2-072, S3-012
- **Acceptance check:** If adopted, a genre can be marked "influence", and this changes guidance weighting.

#### R-B-092 Narrative characteristics as their own category
- **Requirement:**
  - She can select narrative characteristics separately from genre: narrative order, POV, construction (ensemble, dual protagonist), information control (dramatic irony, hidden truth, unreliable narrator), timeline, arc types, form, tone, and narrative techniques (foreshadowing, misdirection).
  - Each selection switches on the relevant capabilities (for example belief-vs-truth tracking).
- **Why:** She listed "the narrative characteristics" among the check marks she needs (S3-010). Techniques cross genre lines (S2-079).
- **Standing:** Decided by Yolanda that the category exists (S3-010). The list and activation are Accepted proposals (S2-079, S2-080).
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S2-053, S2-079, S2-080, S3-010, S3-012
- **Acceptance check:** Select "unreliable narrator": belief-vs-truth fields appear on scenes.

#### R-B-093 Frameworks and methods per novel ("My Storytelling Toolkit")
- **Requirement:**
  - Each novel selects its frameworks and methods by checkbox: Save the Cat (with Brody's novel percentages), McKee, Weiland, Snowflake/Ingermanson, Hero's Journey, Story Circle, Seven-Point, Three-Act, Swain scene/sequel, Custom, and "I prefer to find my story as I write" (discovery writing, no outline).
  - Each selection has a "How I use it / What job does this framework perform" field.
  - Combinations are deliberate, never flagged as conflicts.
  - No framework is ever required.
- **Why:**
  - "No author should be tied or forced to use what we've been using" (S2-065).
  - Adaptability is "a foundational principle" (S2-050).
  - She combines Snyder, McKee, Weiland and Ingermanson for IDW (SB-007 to SB-012).
- **Standing:** Decided by Yolanda (S2-050, S2-065, S2-066). The toolkit design is an Accepted proposal (S2-075, S2-076, S2-078).
- **Phase:** 2
- **Evolution:** None.
- **Related:** Custom frameworks, methods and beat sheets are instances of her editability decision (R-A-109, T L2387). Beat-sheet and placement-profile customization: R-B-097 and C's R-C-008, R-C-021, R-C-026.
- **Sources:** S1-175, S2-035, S2-050, S2-055, S2-065, S2-066, S2-075, S2-076, S2-078, S3-012, S3-017, SB-007 to SB-012, SP-102
- **Acceptance check:** Create a discovery-writing project with no frameworks. No beat sheet appears, and drafting works. In IDW, all four lenses are on, each with "how I use it" text.

#### R-B-094 Configuration drives behavior
- **Requirement:**
  - Selected genres, types, characteristics and frameworks change what the program shows and analyzes: planning tools, structural views, diagnostics, guidance vocabulary and recommended resources.
  - The selections are never decorative checkboxes.
  - The analytic lens and tone adapt per project.
- **Why:** "The application must understand how your selected methods work together. It shouldn't simply display a bunch of checked boxes" (S3-013).
- **Standing:** Accepted proposal (S3-013, "Yes!!").
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S2-036, S2-080, S3-013, HV-041, HV-068
- **Acceptance check:** Switching a project from Save the Cat to Hero's Journey changes the beat list and the guidance terms.

#### R-B-095 Author profile and project profile
- **Requirement:**
  - An Author Profile holds her default frameworks, techniques, habits and preferences, including the guidance level (R-B-035).
  - Each project inherits these defaults and can override anything.
  - One novel's settings are never imposed on another.
- **Why:** She may approach The Replacement (a psychological thriller) differently from IDW (S2-081).
- **Standing:** Accepted proposal (S2-081).
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S2-070, S2-081
- **Acceptance check:** Change the author default framework. A new project picks it up, and existing projects are unchanged.

#### R-B-096 Target words, words per page, page landmarks per novel
- **Requirement:**
  - Each novel stores a target word count and/or target page count, and a words-per-page density.
  - Her spreadsheet densities, 250 and 300 words per page, are the presets. Custom densities are allowed.
  - The program computes total pages and each beat's word and page landmarks, never stores hand-typed results, and can show two densities side by side as her spreadsheet does.
- **Why:**
  - Her spreadsheets model "Word Count For Entire Beat (250 words per page)" and "(300 words per page)" (XL-015, XL-038).
  - "250-page novel versus a 300-page novel" (S1-005).
  - The sheets contain no formulas, so the program must compute (XL-003).
- **Standing:** Decided by Yolanda (S1-005; her own spreadsheets, XL-002, XL-038).
- **Phase:** 2
- **Evolution:**
  - ChatGPT fixed "250 and 300 pages".
  - Her spreadsheets show the real pair is 250/300 *words per page* at 90,000 words (XL-B), plus 300 wpp at 108,000 words (XL-A).
  - Both readings coexist: page targets and word-per-page densities.
- **Sources:** S1-005, S1-128, S1-131, S2-088, XL-002, XL-003, XL-007, XL-014, XL-015, XL-038, XL-039
- **Acceptance check:**
  - Set 90,000 words at 250 and 300 wpp: totals show 360 and 300 pages, with Midpoint at p180 and p150.
  - Change to 100,000 words: every landmark recomputes.

#### R-B-097 Placement profiles and beat model from her spreadsheets
- **Requirement:**
  - Beat placement supports her two spreadsheet models: "Brody novel %" (XL-A) and "Snyder screenplay-proportional" (XL-B).
  - Beats carry a target, a tolerance window (for example B Story within the first 25%), point-or-span type, scene type (single scene/chapter, single beat, multi scene/chapter), a configurable group (Thesis/Antithesis/Synthesis), optional sub-beats (Stasis = Death, Finale steps, Key Event), and paired-beat links.
  - Gentle warnings appear when a tolerance is exceeded.
- **Why:** These are how she has modelled beats for any novel since 2017 (XL-001, XL-002).
- **Standing:**
  - The spreadsheet conventions: Decided by Yolanda (her files).
  - Offering both profiles and the beat-record synthesis: Possibility (compiler synthesis XL-049; XL-040 analysis).
  - Which profile is her current default: Needs Yolanda Q6.
- **Phase:** 2
- **Evolution:**
  - The two workbooks were saved 1h40m apart, and neither clearly supersedes the other (XL-002).
  - Her Bible uses Brody percentages (SB-101, SB-102).
- **Sources:** XL-001 to XL-049, SB-101, SB-102, SB-167, docs-story §6 #9
- **Acceptance check:** Toggle the profile on a 90,000-word project. All Is Lost moves between ~67,500 (Brody) and ~61,250/61,500 (screenplay-proportional).

#### R-B-098 IDW is the first project, not the template
- **Requirement:**
  - IDW ships (or imports) as the first project and is the richest test case.
  - Its facts, characters and conventions are project data and never program defaults.
- **Why:** "We are not building an I Declare War application. We're building YOUR novel-writing application, using I Declare War as its first project" (S3-011).
- **Standing:** Accepted proposal (S3-011, restating her S3-010).
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S2-022, S2-051, S3-011, SP-023, SP-109
- **Acceptance check:** Delete the IDW project. The program has no IDW content left anywhere.

---

## H. Phasing and scope

#### R-B-099 Phase 1: IDW posters first
- **Requirement:**
  - Phase 1 delivered printable story maps for IDW: three master maps, later ten posters with companions.
  - For Phase 1 only, AI-generated art is acceptable, and she will build the final posters herself in Canva or Illustrator from a written production guide.
- **Why:** "Yes we start with building the three posters first" (S2-047). Phase 1 must stand on its own. "I think an AI representation is okay" (S5-117). "I can use canva, or illustrator... and create the actual posters myself" (S6-014).
- **Standing:** Decided by Yolanda (S2-047, S3-020, S5-117, S6-014).
- **Phase:** Done or paused (pre-program). It is listed for scope clarity.
- **Evolution:**
  - Three posters grew to ten (S3-140, accepted).
  - She then said "I'm tired of trying to work around the poster and the artwork. Let's get to the nitty gritty" (S6-049), which paused Posters 2-10.
  - Whether they resume is Needs Yolanda Q11.
- **Sources:** S2-020, S2-047, S3-003, S3-004, S3-020, S3-140, S5-117, S6-003, S6-014, S6-049
- **Acceptance check:** Not a program test. The program must not depend on posters.

#### R-B-100 Phase 2: the complete program for her real writing
- **Requirement:**
  - Phase 2 is the full program she will use to plan and write IDW and her other books: "everything needed that we talked about for creating that novel... all the moving pieces".
  - It is not a prototype, a demo or a set of disconnected screens. It is developed in increments toward a complete application.
- **Why:** "Build this program so that I can use it to write 'I Declare War'" (S3-007).
- **Standing:** Decided by Yolanda (S3-007, S6-052).
- **Phase:** 2
- **Evolution:**
  - ChatGPT restated it accurately (S3-008, "a complete application, not a collection of disconnected demonstrations").
  - Later lists omitted items (Writing Trail, guidance levels, intent notes, readiness, export presets). Omission does not cancel them.
- **Sources:** S3-007, S3-008, S3-019, S6-006, S6-052, S6-111, S6-118, SP-005, SP-030, HV-083
- **Acceptance check:** Every requirement here marked Phase 2 is implemented, or explicitly reported as missing (spec gap matrix).

#### R-B-101 No MVP; no reduction without her agreement
- **Requirement:**
  - Scope is never reduced to an MVP or "smallest useful version" without her explicit agreement.
  - Feasibility concerns are reported candidly while the requirement stays complete.
  - No feature is silently redefined downward to match what exists.
- **Why:** She rejected ChatGPT's "November 1 writing release" with "Wrong." ChatGPT conceded: "I shouldn't have reduced your requirements without your agreement" (S6-053).
- **Standing:** Decided by Yolanda (S6-051 rejected, S6-052, S6-053, S6-178).
- **Phase:** 2
- **Evolution:** The MVP plan was replaced by her full-scope decision.
- **Sources:** S6-051, S6-052, S6-053, S6-178, S7-008, SP-005, SP-006, HV-056, PK-009
- **Acceptance check:** Any release note lists every Phase 2 requirement with status. None is missing without a recorded decision from her.

#### R-B-102 Deadlines
- **Requirement:**
  - Phase 2 fully built and tested for full use by **Saturday, October 17, 2026**.
  - IDW planning in the tool finished by **October 31, 2026**.
  - Drafting begins **November 1, 2026**.
  - The program must be usable for planning before Nov 1 and for prose from Nov 1.
- **Why:** "There is no reason that this should take until october thirty first to keep designing" (S6-052). She needs the remaining weeks to plan in the tool.
- **Standing:** Decided by Yolanda (S6-050, S6-052).
- **Phase:** 2
- **Evolution:**
  - The spec softens Oct 17 to "the owner's target, not evidence of readiness or a guarantee" (SP-003, F4).
  - Today is 2026-10-16, which leaves about one day. See Needs Yolanda Q22.
- **Sources:** S6-050, S6-052, S6-174, S7-006, S7-056, SP-003, SP-128, HV-055, PK-009
- **Acceptance check:** On Nov 1 she can open IDW, click the next scene and draft (Scenario H).

#### R-B-103 Genre and workflow adaptability is Phase 2
- **Requirement:** Multi-genre and multi-workflow configuration (R-B-088 to R-B-095) ships in Phase 2, not later.
- **Why:** "This should be in the program that works for me. Because after I write 'I Declare War' I'll be writing other books" (S3-010).
- **Standing:** Decided by Yolanda.
- **Phase:** 2
- **Evolution:** It replaced ChatGPT's placement in Phase 3 (S3-009). "Adaptability isn't a Phase 3 enhancement" (S3-018).
- **Sources:** S3-009, S3-010, S3-016, S3-018
- **Acceptance check:** As in R-B-088.

#### R-B-104 Phase 3: the Visual Story Mapping Engine
- **Requirement:**
  - Phase 3 holds the professionally designed visual system: interactive and printable story maps, posters and companions, Narrative Zoom visualizations, deterministic layouts, print preflight, large-format export, output modes and art layering (R-B-085 to R-B-087).
  - It is integrated "further down the line … but we do it correctly".
- **Why:** Her words (T L15064-15070): "I like the thought of a visual story mapping system/engine. It definitely needs to be designed, so it looks professional. I think that has to come as a different phase. … Secondly, phase two should just be the story system...whatever we decide to call the overall program. Then, further down the line, we also integrate this visual system, but we do it correctly."
- **Standing:** Decided by Yolanda: the visual engine is a separate phase after Phase 2, integrated later and done correctly, and Phase 2 is the story system (S5-115, S5-116, S6-001, S6-002). The number "Phase 3" is ChatGPT's. Its reply in the same message (T L15127-15144) numbered "Phase 3: Visual Story Mapping Engine" and "Phase 4: Story Universe and Beyond". She did not confirm or reject the numbers; her next messages were about Phase 1 artwork (T L15209) and "Please start" (T L15369). Both numbers have the same standing: an Unanswered proposal. "Phase 3" is used in this register as a label only (Q10).
- **Phase:** 3. Phase 2 data must capture everything Phase 3 renders: stable IDs, statuses, positions, strands, links, act and sequence membership, drafting status, provenance. Content must stay separate from presentation (R-B-066).
- **Evolution:**
  - ChatGPT had folded visualization into the Story Brain build. She split it out.
  - The manually built Phase 1 posters serve as design references (S6-022, Unanswered).
- **Sources:** S5-100, S5-101, S5-114, S5-115, S5-116, S6-001, S6-002, S6-007, S6-009, S6-022, S6-145, SP-028, PK-008
- **Acceptance check:** No Phase 2 feature depends on a poster renderer. The Phase 2 data export contains every field the Phase 3 templates list.

#### R-B-105 Phase 2 still has on-screen structure views and Narrative Zoom
- **Requirement:**
  - Deferring the visual engine never removes narrative navigation from Phase 2.
  - Phase 2 provides ordinary lists, outline trees, relationship panels, scene timelines, dependency tables, breadcrumbs and Narrative Zoom movement between novel, act, sequence, beat, scene and passage.
- **Why:** "Phase 2: Navigate and understand the connections. Phase 3: See those connections through sophisticated visual maps" (S6-008). She loves Narrative Zoom (S2-003).
- **Standing:** Accepted proposal (S6-008, S6-117; she then demanded "all of those things", S6-052). Narrative Zoom itself is Decided by Yolanda (S2-003).
- **Phase:** 2
- **Evolution:** The details of Narrative Zoom belong to another theme. Here the requirement is the phase boundary.
- **Sources:** S2-003, S6-007, S6-008, S6-117, S6-145, SP-029, SP-147, SP-151
- **Acceptance check:** With no visual engine present, she can go novel → Act IIB → All Is Lost → scene → passage → back (AC13).

#### R-B-106 Later: Story Universe and beyond
- **Requirement:** After Phase 3 come:
  - Story Universe: series and multi-book continuity, interconnected projects, shared worlds;
  - screenplays, film and TV;
  - writers' rooms and collaboration;
  - availability to other storytellers.
- **Why:** "1. Just delivering what I originally planned for 2. ...making this for the novel 3. calling it the story universe is right." "We do not want scope creep" (S3-001). Making it usable "for other people or for book series, movies, or TV series, that's later" (S3-007).
- **Standing:** Decided by Yolanda (S3-001, S3-007).
- **Phase:** Later.
- **Evolution:**
  - Story Universe was her third iteration.
  - When she made the visual engine a separate later phase, ChatGPT numbered the visual engine "Phase 3" and Story Universe "Phase 4" in the same reply (S6-004, T L15127-15144). Both numbers are an Unanswered proposal. Her decision is only the order: the story system now, the visual engine later and done correctly, and Story Universe as a later iteration.
  - The spec instead says the Story Universe is deferred to Phase 3 (SP-028). See Conflicts.
- **Sources:** S2-159, S2-172, S2-175, S3-001, S3-007, S3-009, S3-016, S6-004, S6-011, SP-028
- **Acceptance check:** Not in Phase 2. The Phase 2 data model passes R-B-107.

#### R-B-107 Phase 2 data must not block Phase 3 or Later
- **Requirement:** The Phase 2 data model must:
  - allow any number of plotlines (not only A/B), with labels that are not permanent;
  - keep containment (which unit a scene belongs to) separate from participation (which storylines it advances);
  - allow configurable container templates (novel by default);
  - allow an event's position to be unknown or undecided;
  - require every percentage to name its unit;
  - keep stable IDs, a structured portable format, and content separate from presentation;
  - accept author-added element types, fields and categories without a schema change (R-A-109).
- **Why:**
  - "we cannot limit the author to just A and B" (S2-158).
  - "Story C is supposed to be resolved in Book 2 but because Book 2 isn't written we don't know what percentage it's at yet" (S2-178).
  - "If someone thinks of something that they had not defined yet, they can add it" (S1-016, T L2387).
  - "Avoid decisions now that make future capabilities difficult" (S2-098).
- **Standing:**
  - Not limited to A/B and unknown position: Decided by Yolanda (S2-158, S2-178).
  - Containers, containment vs participation, structured portable data: Accepted proposals (S2-161, S2-162, S2-166, S2-139).
  - Progressive placement and its states: Unanswered (skimmed, S2-179 to S2-194).
- **Phase:** 2 (model), serving 3 and Later.
- **Evolution:** None.
- **Sources:** S2-098, S2-139, S2-158, S2-161, S2-162, S2-166, S2-174, S2-178, S2-180 to S2-185, S5-089, S5-107
- **Acceptance check:**
  - Add a fourth plotline "D" to IDW.
  - Mark one event "position unknown". It renders in an "unplaced" list, not at an invented position.

#### R-B-108 Scope discipline: iterations, no scope creep
- **Requirement:**
  - New feature ideas are captured and parked in a later phase or iteration, not added silently to the current build.
  - Phase 1 does not keep expanding.
  - The program must not become a project that competes with writing the novel.
- **Why:**
  - "True. We do not want scope creep. There have to be iterations of this right now" (S3-001).
  - "I don't want the software concept to swallow the novel" (S2-174, ChatGPT; consistent with her own words).
- **Standing:** Decided by Yolanda (S3-001).
- **Phase:** 2 (process).
- **Evolution:** None.
- **Sources:** S1-170, S2-047, S2-174, S2-177, S3-001, S3-004, S6-005
- **Acceptance check:** Each new request is logged with a phase tag before work starts.

#### R-B-109 Useful to her first, others later
- **Requirement:**
  - Design decisions favor her real use first.
  - The program remains general enough to serve other authors later, with nothing in it specific only to her.
- **Why:** "It will be extremely useful to nobody else but me. But I also know it'll be useful to other people" (S3-002). When she imagined later users, she wrote: "the user asks for a visual representation of her story" (S5-099).
- **Standing:** Decided by Yolanda (S3-002, S2-197).
- **Phase:** 2, with generalization Later.
- **Evolution:** None.
- **Sources:** S2-197, S3-002, S5-099, S3-007
- **Acceptance check:** As in R-B-098: no IDW or Yolanda-specific hard-coding.

#### R-B-110 Build and verification process
- **Requirement:**
  - One AI builds, and a second independently verifies with evidence: tests, workflows, a gap matrix.
  - "Done" is never claimed because code runs or looks polished.
  - The builder and verifier get not only the "what" but the "why": the human story of how each feature arose from her ideas, including Narrative Zoom and why each module exists.
- **Why:**
  - "Once you build the program, I will take it to claude, to verify things" (S6-055).
  - The spec "misses the 'human' touch; where I was sharing my ideas and then you were edfying the product" (S7-001; verbatim, read "edifying").
  - "Does it talk about the zoom in, the different modules and why we created them?" (S8E-013)
- **Standing:** Decided by Yolanda (S6-055, S7-001, S8E-013). Claude is now the builder, per the consolidation brief.
- **Phase:** 2 (process).
- **Evolution:** The ChatGPT-builds, Claude-verifies arrangement (S6-055) has become Claude building, so independent verification still needs an owner (Q24).
- **Sources:** S6-055, S6-057, S6-109, S6-169, S7-001, S7-003, S8E-003, S8E-004, S8E-013, S8E-020, SP-211, SP-234, SP-235
- **Acceptance check:** Each delivered module has a rationale note ("the need that led to it, what using it should feel like, what counts as failure").

---

## I. Additional cross-cutting environment requirements

#### R-B-111 Unresolved stays unresolved in every view
- **Requirement:**
  - Writing-environment surfaces (beat cards, readiness, next action, summaries) never fill an undecided event with an invented scene.
  - Undecided items show as undecided, for example "Midpoint: event undecided".
- **Why:** "When something remains undecided, accurately identifying it as undecided *is* the correct result" (S5-072).
- **Standing:** Accepted proposal (S5-072, "Please do so").
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S5-062, S5-072, S6-038, SP-088, SP-089
- **Acceptance check:** Next Writing Action for an undecided Midpoint suggests deciding or drafting freely, and never names an invented event.

#### R-B-112 Beat function separate from beat execution
- **Requirement:**
  - Beat cards and scene plans hold the beat's function separately from its concrete event.
  - Writing can proceed when the function is set and the execution is open. Example: "Francine needs the men distracted" is set; the distraction is open.
- **Why:** "FYI, the 'distracted by the five-dollar bill' is a concept for me... it could be something else" (S3-146).
- **Standing:** Decided by Yolanda (S3-146). The generalization is an Accepted proposal (S3-148, "I love it!").
- **Phase:** 2
- **Evolution:** The broader status model belongs to another theme. Here it matters for readiness and drafting views.
- **Sources:** S3-146, S3-147, S3-148, S4-016, S4-040, S6-027, SP-088
- **Acceptance check:** A beat with function "Established" and execution "Open" shows Ready to draft with "execution open" noted.

#### R-B-113 Physical-board cards with +/- and >< (possibility)
- **Requirement:**
  - Optionally, print scene cards (index-card size) for her four-row physical board.
  - Each card shows its +/- emotional start and end and its >< conflict, colour-coded by strand.
- **Why:** She plots physically: "index cards or sticky notes in four rows... Genuinely fun to do" (S1-085).
- **Standing:** Possibility. The board and card symbols are Decided by Yolanda (Bible). Printable cards were never proposed.
- **Phase:** 2 or 3. See Q19.
- **Evolution:** None.
- **Sources:** S1-083, S1-084, S1-085, SB-167, SB-170, SB-172
- **Acceptance check:** If adopted, print 40 cards on card stock, four per page, with strand colours.

#### R-B-114 Distinguish fact, interpretation, suggestion and reference
- **Requirement:** Guidance and diagnostics shown in the writing environment label each statement as one of:
  - an observable structural fact;
  - an interpretive observation;
  - a craft suggestion;
  - an educational reference.
  The program is comfortable saying "I don't know" when prose would be needed.
- **Why:** "Definitely we don't want to give any bad writing advice" (S2-026).
- **Standing:** Decided by Yolanda (S2-026). The mechanism is an Accepted proposal (S2-039, S2-044).
- **Phase:** 2
- **Evolution:** The 8-principle summary dropped this (S2 notes). Omission does not cancel it.
- **Sources:** S2-018, S2-026, S2-039, S2-044
- **Acceptance check:** Every diagnostic message carries one of the four labels.

#### R-B-115 Resources without chapter or page citations
- **Requirement:** Craft resource suggestions in guidance never cite a specific chapter or page of a book. They name the concept and the source.
- **Why:** "I don't think we should ever recommend a specific chapter or a specific page... those things are subject to change" (S2-049).
- **Standing:** Decided by Yolanda (S2-049). It replaced S2-034.
- **Phase:** 2
- **Evolution:** It was dropped from the 8-principle table (S2-138), but the omission does not cancel it.
- **Sources:** S2-034, S2-049, S2-057, S3-008
- **Acceptance check:** No resource text contains "chapter" with a number, or "p." with a number.

#### R-B-116 Story knowledge vs manuscript prose are different objects
- **Requirement:**
  - The architecture (beats, scenes as plan records, characters, relationships) and the prose are linked but separate.
  - She can restructure without rewriting, rewrite without changing function, and keep several manuscript versions that share one architecture.
- **Why:** ChatGPT called this "perhaps the most important architectural decision in this entire discussion" (S2-121).
- **Standing:** Accepted proposal (S2-121, 11:25 "I agree with everything").
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S2-121, S6-124, S7-039, SP-070
- **Acceptance check:** Move a beat card to another act. The scene's prose is untouched, and the link is kept.

#### R-B-117 Bidirectional map ↔ manuscript navigation
- **Requirement:**
  - From any structure item, open its manuscript passage.
  - From the manuscript, "Show in Story Map" highlights its scene, sequence, act and relationships.
- **Why:** "The map becomes a navigable representation of the work itself" (S2-120).
- **Standing:** Accepted proposal.
- **Phase:** 2 (on-screen).
- **Evolution:** None.
- **Sources:** S2-120, SP-130
- **Acceptance check:** Click Midpoint and the passage opens. Click "Show in Story Map" there, and Midpoint is highlighted.

#### R-B-118 POV designation per scene in the writing view
- **Requirement:**
  - Every scene and chapter shows its viewpoint character and narrative person (first, second, third).
  - Project defaults can be set, with exceptions.
  - The drafting view displays the current narrator.
- **Why:** "then we would need to designate which character's point of view is being examined and whether that POV is first person, second person, third, etc." (S2-102). IDW alternates POV between Kevin (first person, per the Bible) and Anthony (grammatical person not yet decided; IDW PV-003).
- **Standing:** Decided by Yolanda (S2-102). The three-level model is an Accepted proposal (S2-106).
- **Phase:** 2
- **Evolution:** POV rules and leakage checks belong to another theme.
- **Sources:** S2-102, S2-105, S2-106, S7-103
- **Acceptance check:** A new scene in IDW asks for the narrator, offering Kevin and Anthony. It fills in "first person" for Kevin and leaves Anthony's grammatical person unset until she records it.

#### R-B-119 Low-friction keep actions during conversations
- **Requirement:** While she riffs with the in-app AI, one-click actions are available: Keep this line, Explore this idea, Add as possibility, Link to [character], Place later, Not canon, What would this affect?, and Back to writing. Saving a line never marks its placement as final.
- **Why:** "One click to keep something, not a multi-page questionnaire" (HV-028). Her real practice: "I'm keeping that for the book!" (S6-087).
- **Standing:** Spec-only (HV-028; flag F8 calls the labels illustrative). It fits her decided keep-a-line behavior (S6-087).
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S6-087, S7-051, HV-028, HV-029
- **Acceptance check:** Click "Keep this line" on an AI or author line. It is saved verbatim as a Developing keeper with placement Unanswered.

#### R-B-120 AI personality and style are tunable, candid, not flattering
- **Requirement:**
  - The in-app AI's style can be tuned, and it is candid rather than flattering.
  - It celebrates what works and names what doesn't.
  - It doesn't over-literalize her comparisons; it asks which quality she means.
  - It doesn't revert to a characterization she has corrected.
- **Why:**
  - "Are you just blowing smoke up my ass? And being nice?" (S7-096)
  - "You can't mention it that anthony is dry" (S7-108)
  - "I don't mean a true NPR replica" (S7-113)
- **Standing:** Decided by Yolanda (S7-096, S7-114, S7-150). The style tuning is Spec-only (HV-067).
- **Phase:** 2
- **Evolution:** AI behavior is mainly covered by another theme. It is included here because it governs the writing-session experience.
- **Sources:** S7-043, S7-096, S7-097, S7-114, S7-150, HV-010, HV-067
- **Acceptance check:** Ask "is this great?" about a weak draft line. The AI names a specific weakness.

#### R-B-121 A system that never competes with finishing the book
- **Requirement:**
  - Every feature must make returning to prose easier.
  - The program is judged by whether she writes and finishes, not by its fields or how beautiful its maps look.
  - Maintaining the system must never become more compelling than writing.
- **Why:** The program must "protect the joy of writing", "especially for someone who enjoys developing intricate creative systems" (S1-170). Success is measured "by whether the program helps you sit down, open your manuscript, and write. And eventually, finish" (S3-072).
- **Standing:** Accepted proposal (S1-170, S3-072). It rests on her decided aim (S3-067).
- **Phase:** 2
- **Evolution:** None.
- **Sources:** S1-170, S1-178, S3-067, S3-072, S3-141, S4-029, SP-027, SP-267, HV-047
- **Acceptance check:** Usability review. From launch to typing prose in the next scene takes at most 2 clicks.

---

## Needs Yolanda (precise questions)

1. **Form factor.** Should the program be a true desktop app with its own window and installer, or is a local service opened in your browser (what ChatGPT built) acceptable? (R-B-059)
2. **Machine.** Confirm it must run on your Windows computer. Which Windows version? Is a Mac or a second machine ever needed? (R-B-058)
3. **Saving.** Must saving always be automatic, or may some areas use a deliberate Save button with a clear saved indicator? The spec allows either. (R-B-005)
4. **Formats in Phase 2.** Which import and export formats must work on day one? The accepted list was DOCX, RTF, TXT, Markdown, PDF, EPUB, ODT, plus Scrivener and PDF import later. The spec narrows this to TXT/MD/JSON plus "e.g. DOCX". (R-B-072, R-B-076)
5. **Genre roles.** Keep only primary and secondary, or also add a third "influence/supporting" role? Does this apply to both the genre list and the Snyder list? (R-B-091)
6. **Placement model.** Which spreadsheet is current: "Updated December 6 2021" (Brody percentages, 300 wpp, 108,000 words) or "revised with word count for 250 and 300 words per page" (screenplay-proportional, 90,000 words)? Should both be offered? Which density (250 or 300 wpp) is your default? Is XL-B cell F13 ("24,600") a typo for 24,500? (R-B-096, R-B-097)
7. **Scene status ladder.** Is Idea / Planned / Ready to Draft / Drafting / First Draft Complete / Revising / Revised / Finalized your preferred default, or do you want different steps? (R-B-026)
8. **Look.** For the program's own screens, should it use your personal palette (Deep Purple #522875, Bright Orange #ff6b35, Hot Magenta #ff1493, Soft Cream #faf5ef, Charcoal #1a1a1a), the purple-gold-cream poster look, or something else? (R-B-056)
9. **Name.** Do you have a name in mind, or should the app launch with a neutral placeholder you rename in Settings? (R-B-055)
10. **Phase numbers.** You decided the order: the story system now (Phase 2), the visual engine "further down the line … but we do it correctly", and Story Universe as a later iteration. The numbers "Phase 3 = visual engine, Phase 4 = Story Universe" are ChatGPT's (T L15127-15144), and the spec instead files Story Universe under Phase 3. Do you accept ChatGPT's numbering? Should the visual engine come before Story Universe? (R-B-104, R-B-106)
11. **Posters 2-10.** Are the remaining Phase 1 posters paused, or dropped in favor of the Phase 3 engine? (R-B-099)
12. **External sync.** Is one-way import enough in Phase 2, or must it sync live with Word or Scrivener? (R-B-002)
13. **Round-trip edits.** Do you need Track-Changes round-trips with an editor in Phase 2, or later? (R-B-083)
14. **Spreadsheets.** Should Phase 2 import and export your plotting spreadsheets? Will you share more of them beyond the two BS2 Breakdown files? (R-B-074)
15. **Writing Trail and Return to Writing.** Are these one feature, or both: a trail you can review, plus a one-click return? (R-B-016, R-B-017)
16. **Guidance default.** Confirm Quiet as the default while drafting. Should Advisory be the default while planning? (R-B-035)
17. **Privacy.** Confirm the commitments in R-B-060: no telemetry, explicit consent before any text leaves the machine, never used to train models, full delete. Which AI provider, if any, should Phase 2 connect to?
18. **Charts.** The spec says you dislike generic pie and bar charts. Is that right? (R-B-031)
19. **Physical board.** Do you want printable scene cards for your four-row wall board, and poster "Working Edition" versions with space for handwritten notes? (R-B-113)
20. **Cross-novel ideas.** Should a "Set Aside" idea from IDW be visible from your other novels in Phase 2, or is that Story Universe territory?
21. **AI prose.** The spec allows "controlled, opt-in prose brainstorming". Given "this program does not write the novel", should the AI ever draft sample prose on request, and if so only outside "Mine to write" items? (R-B-010, R-B-037)
22. **Deadline.** Today is October 16. Does the Saturday, October 17 build date still stand, or should the date move so that planning by Oct 31 and drafting on Nov 1 stay safe? (R-B-102)
23. **"Drafted and confirmed".** Should drafted, confirmed text automatically outrank an older plan card, or only when you mark it? (R-B-012)
24. **Verification.** Now that Claude builds, who does the independent verification you wanted: a separate Claude session, ChatGPT, or you? (R-B-110)

## Conflicts between her words and ChatGPT's documents

| # | Her decision or accepted item | ChatGPT document | Resolution here |
|---|---|---|---|
| 1 | Exports into "different formats usable outside the program" (S2-128). Accepted format matrix: DOCX, RTF, TXT, MD, PDF, EPUB, ODT, Scrivener (S2-130). | Spec minimum: TXT, MD, JSON, plus a manuscript export "e.g., DOCX" (SP-144, SP-145). Import "as far as technically feasible" (SP-191). | Her list governs (R-B-076, R-B-072). Q4 asks only for day-one priority. |
| 2 | Saved state must be unmistakable; trust through reliability (S3-112). Spec scope says "autosave/recovery" (SP-038). | §10: "auto-save **or** deliberate save" (SP-132). | Autosave required (R-B-005). Q3 confirms. |
| 3 | Planning never blocks; Write Anyway (S2-093, S3-074). | Fully kept in principle (SP-143), but the readiness indicator and Write Anyway button are not specified. | R-B-013 and R-B-014 keep both. |
| 4 | Return to Writing restores exact context (S3-071; HV-046 "safe thread back"). | Scroll/cursor only "if technically feasible" (SP-083). | Full restore required (R-B-016). |
| 5 | Program does not write the novel (S2-025). | AI "controlled, opt-in prose brainstorming" (SP-173). | Kept under author control; Q21. |
| 6 | Deadline: fully built and tested by Sat Oct 17 (S6-052). | "The owner's target, not evidence of readiness or a guarantee" (SP-003). Past tense in HV-055. | Her date stands (R-B-102); Q22. |
| 7 | Genres and workflows in Phase 2 (S3-010). | ChatGPT's 11:48 list put them in Phase 3 (S3-009). | Replaced by her decision (R-B-103). |
| 8 | Story Universe is her third iteration, "later". Visual engine is "a different phase... further down the line" (S5-116). | ChatGPT numbered the visual engine Phase 3 and Story Universe Phase 4 in one reply (S6-004); both numbers are unconfirmed. Spec defers "the full planned multi-book Story Universe" to Phase 3 (SP-028). | Both are "Later" here (R-B-106); Q10. |
| 9 | Page estimates for any length ("250 versus 300... for example", S1-005). Her spreadsheets use 250/300 *words per page* (XL-B). | 250-page and 300-page columns hard-coded everywhere (S1-128, S2-087, posters, S6-039). | Any target length plus selectable wpp (R-B-024, R-B-096). |
| 10 | Primary/secondary for genres and for Snyder types (S2-067). | Third "influence/supporting" tier added (S2-072, S3-012). | Kept as unanswered option (R-B-091); Q5. |
| 11 | "Capture first, organize later" and "panther at heart" are quoted as hers (SP-079, HV-005). Pie/bar chart dislike stated as hers (SP-184). | No such statements by her in the transcript sections. | Marked Spec-only; Q18. |
| 12 | Name undecided; "StoryForge" rejected (S6-108). | Build files and packet still named "StoryForge_..." (S7-004, PK-001). | Rename all artifacts (R-B-055). |
| 13 | Target platform presented as a Windows desktop program (consolidation brief). | Spec describes a local Python HTTP service with a browser UI, and asserts Windows only in AC20 (F2). | Q1, Q2. |
| 14 | Verbatim "entire conversation" (S6-105). | Archive is "a detailed reconstruction... not a verbatim export" (S6-106, A14-063). Spec has no conversation entity (F11). | Verbatim required (R-B-050, R-B-073). |
| 15 | Phase 2 tested by her real use. | AC19 tests "a person unfamiliar with the code" (F10). | Add her own session walk-through to acceptance (R-B-100). |
| 16 | Mama Dorothy is her own assistant program. | Spec: "no requirement to copy the Mama Dorothy interface or personality"; vision brief: don't import "a previous project-management product's" name or metaphor (F7). | Treated as Spec-only; nothing borrowed or forbidden without her word. |
| 17 | Four (then five) statuses including Developing vs Unanswered (S4-014, S6-121). | Poster legends collapsed them to three (S4-032). Bible "example" status dropped (S1 D6). | Visual encoding must show all distinctions (R-B-053, R-B-069). |

## Things ChatGPT's spec dropped

None of these is cancelled by the omission. All remain requirements as stated above.

0. **General editability** (her Decided 10:14 requirement, S1-016, T L2387): adding element types, fields and categories that were not predefined. Only specific custom cases survive in the spec (A's R-A-109; here R-B-026, R-B-089, R-B-093, R-B-107).
1. **Writing Trail** as distinct from Return to Writing (R-B-017).
2. **Guidance levels Quiet / Advisory / Deep Analysis**, with Quiet default while drafting. Only "control how much guidance appears" survives (R-B-035).
3. **Authorial Intent Notes** (R-B-036).
4. **Drafting Readiness indicator and the Write Anyway button** (R-B-014).
5. **Next Writing Action** by name, and the Story Development vs Manuscript Progress split (R-B-015).
6. **Customizable scene status ladder** (Idea … Finalized) and the derived sequence-status rule (R-B-026, R-B-027).
7. **Writing sessions record**, selectable goal types including none, the weekly accomplishment view, and progress provenance labels (R-B-028 to R-B-032).
8. **Progress visible on structure views** (R-B-033).
9. **"Drafted and confirmed" status** (R-B-012).
10. **"When I'm Stuck, Start Here" ladder and single-beat focus view** (R-B-021). Also "Brave, tiny, consistent" small-progress counting (R-B-022).
11. **"Mine to write / Mine to build" author-reserved markers** as element-level flags. Only the "Hand it to me" AI mode survives (R-B-037).
12. **"Something I need now" vs "resolve later"** (R-B-019).
13. **Three writing modes** (inside / outside / both) and progress sync (R-B-002).
14. **Onboarding paths**, including starting from an existing manuscript and building a map retrospectively (R-B-068).
15. **Spreadsheet import/export** and every convention from her BS2 Breakdown workbooks: words-per-page densities, Thesis/Antithesis/Synthesis groups, scene-type enum, sub-beats, tolerance windows, two placement profiles (R-B-074, R-B-096, R-B-097).
16. **Genre checkbox system with primary/secondary**, the **separate Snyder story-type list**, and narrative characteristics as their own category. The spec says only "adaptable genre, form, and framework settings" (R-B-089, R-B-090, R-B-092).
17. **"My Storytelling Toolkit" "How I use it" field** and the author vs project profile (R-B-093, R-B-095).
18. **Any-length targets and words-per-page** (R-B-096).
19. **Export of planning materials and visuals as human-readable presentations** (only a backup survives). Also: export presets, partial export, the selectable export screen, pre-export loss warnings, post-export verification, and the no-subscription-hostage rule (R-B-077 to R-B-081, R-B-061).
20. **Round-trip Track-Changes workflow** (R-B-083).
21. **Full import/export format matrix** (R-B-072, R-B-076).
22. **Privacy commitment not to train shared models on manuscripts** and the "delete project data" right (R-B-060).
23. **Restrained colour** ("too much color coding... I get distracted") as a design rule. The spec says only "visible but restrained status" (R-B-048).
24. **Solid vs dotted status encoding** and the single legend (R-B-053, R-B-054).
25. **Printable documents for long guidance** (her "downloadable document I can print") and Phase 2 letter-size printing (R-B-047, R-B-084).
26. **Verbatim voice-to-text preservation** with flagged, not silent, corrections (R-B-044).
27. **Partial-reading safeguard**: unread proposals stay unaccepted and resurface (R-B-045).
28. **No chapter or page citations in resource suggestions** (R-B-115). It was also dropped from ChatGPT's 8-principle table.
29. **The four-way fact / interpretation / suggestion / reference labelling** and "I don't know" humility (R-B-114).
30. **A conversation/session entity** in the data model, needed for her "lock this entire conversation" decision (R-B-050, R-B-073).
