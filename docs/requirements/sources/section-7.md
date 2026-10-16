# Requirements Register: Section 7 (lines 18492 to 21087)

Source file: `90955321-Story_Map_Planning_FULL_with_code.md`
Date range covered: 2026-10-15 08:33 ET through 2026-10-15 17:00 ET
ID prefix: S7-

## How to read this section

This section has two halves.

1. **Lines 18492 to 18811 (08:33 ET):** Yolanda says the Phase 2 Claude review packet "misses the 'human' touch." ChatGPT responds by printing parts of two documents it generated: `PHASE2_FULL_SPEC.md` (the "Phase 2 Full Product Specification for Claude") and `PHASE2_HUMAN_VISION_AND_CREATIVE_WORKFLOWS.md` (the "Human Vision" companion brief, 6 pages), and bundles both into `Phase_2_Claude_Review_Packet_WITH_HUMAN_VISION.zip`. These documents are **ChatGPT-written**. Many of their statements restate decisions Yolanda made before this section (for example rejecting the name StoryForge, rejecting an MVP, "WRITE THE DAMN STORY", "panther at heart"). Where a spec item claims to restate an earlier Yolanda decision, it is marked as such with "possibly relates to an earlier decision"; the original decision should be verified in earlier sections. Yolanda did not respond to the content of either document after it was delivered in this section (she moved on to Anthony at 13:57). Note: the printed full spec is cut off at "### 5.1 Two dedicated author-owned spaces" (line 18607) and the Human Vision printout contains a literal "...[truncated]..." at line 18660 (sections 4 through 6 partially missing). Content in those gaps was not visible.
2. **Lines 18812 to 21087 (13:57 to 17:00 ET):** An extended IDW character-development session on **Anthony Vernon** (and Kevin Wickley), including the podcast call-in scene, Anthony's comedic register, code-switching, the "Angry Black Man" trope guardrail, physical comedy, foil/mirror/double definitions, Weiland Arc work, Yolanda catching ChatGPT "blowing smoke," and Yolanda catching ChatGPT using an outdated Story Bible Lie for Kevin instead of the October 14 Character Breakthrough Archive. This half is both story canon/possibility data and a live demonstration of how the program's AI collaborator, status model, and source hierarchy must behave.

Standing labels used: DECIDED BY YOLANDA / ACCEPTED PROPOSAL / UNANSWERED PROPOSAL / POSSIBILITY / EXAMPLE / ILLUSTRATION / REJECTED.

---

## Part A: Handoff packet and the "human touch" (18492 to 18811)

### S7-001
- **Type:** Process
- **Statement:** The Claude review packet must convey the "human" touch: the collaborative history in which Yolanda shared ideas and ChatGPT "edified" (built out) the product. A purely technical specification is insufficient.
- **Why:** She felt the technical spec "misses the 'human' touch; where I was sharing my ideas and then you were edfying the product." The reviewer must understand why the program was designed this way, not just what it does.
- **Standing:** DECIDED BY YOLANDA ("it misses the 'human' touch")
- **Source:** 18494, 2026-10-15 08:33
- **Relationship:** ADDS TO the earlier Phase 2 handoff packet (before section; line 18480 to 18490 context).

### S7-002
- **Type:** Process
- **Statement:** The handoff to Claude consists of the updated packet `Phase_2_Claude_Review_Packet_WITH_HUMAN_VISION.zip` (full spec in PDF/DOCX/MD plus the Human Vision brief in PDF/DOCX/MD plus `CLAUDE_REVIEW_START_HERE_UPDATED.txt`), given together with the development build `StoryForge_Phase2_Development_Build.zip`. This replaces the previous packet.
- **Why:** So Claude gets both the "what" and the "why."
- **Standing:** UNANSWERED PROPOSAL (ChatGPT instruction; Yolanda did not reply to it)
- **Source:** 18505 to 18527, 18720 to 18733, 18792 to 18802
- **Relationship:** REPLACES the earlier packet `Phase_2_Claude_Review_Packet.zip` as ChatGPT's recommendation (prompted by S7-001).

### S7-003
- **Type:** Process
- **Statement:** Claude's role: independent technical and product reviewer that compares the actual software to the spec contract, runs tests, exercises real author workflows, finds hidden failure modes, reports evidence, and provides a reproducible gap report. Claude must not "silently redefine Phase 2 downward to match what happens to be implemented."
- **Why:** Yolanda passes ChatGPT-built tools to Claude for rigorous verification and adversarial testing, "just as she has done with other tools." Goal is for Claude to understand the entire envisioned application, not just the portion that exists.
- **Standing:** UNANSWERED PROPOSAL (ChatGPT spec text; possibly relates to an earlier decision about Claude review before this section, see line 18486 to 18488)
- **Source:** 18486 to 18488, 18539
- **Relationship:** possibly relates to an earlier decision.

### S7-004
- **Type:** Constraint
- **Statement:** The working name "StoryForge" is rejected by the author; it must not be treated as the product name. Product is "UNNAMED."
- **Why:** She "expressly dislikes StoryForge."
- **Standing:** DECIDED BY YOLANDA (as reported in spec; the decision was made before this section)
- **Source:** 18480, 18532, 18677
- **Relationship:** RESTATEMENT OF an earlier decision (before section). Note: the build ZIP and spec files are still literally named "StoryForge_..." (18484, 18505).

### S7-005
- **Type:** Feature
- **Statement:** User can rename the application.
- **Why:** She dislikes StoryForge; personalization must be genuinely useful.
- **Standing:** UNANSWERED PROPOSAL (spec text; possibly relates to an earlier decision)
- **Source:** 18677
- **Relationship:** ADDS TO S7-004.

### S7-006
- **Type:** Constraint
- **Statement:** Target date: fully functioning and tested Phase 2 by Saturday, October 17, 2026. The spec labels this "the owner's target, not evidence of readiness or a guarantee."
- **Why:** Planning IDW must finish by October 31 and drafting start November 1.
- **Standing:** DECIDED BY YOLANDA (target; restated from earlier)
- **Source:** 18534, 18667
- **Relationship:** RESTATEMENT; possibly relates to an earlier decision.

### S7-007
- **Type:** Principle
- **Statement:** Core mandate: "Help me get the story out of my head, develop it without losing track of decisions, and WRITE THE DAMN STORY."
- **Why:** The ultimate measure of the tool is actual prose written.
- **Standing:** DECIDED BY YOLANDA ("WRITE THE DAMN STORY" is her phrase, restated)
- **Source:** 18535, 18631
- **Relationship:** RESTATEMENT of earlier decisions.

### S7-008
- **Type:** Constraint
- **Statement:** The spec defines the full scope of Phase 2, not an MVP and not an invitation to trim to a basic CRUD app. Yolanda rejected an assistant attempt to shrink scope to an MVP; feasibility concerns must be reported candidly but the requirement remains complete. Claude should not reinterpret the request as permission to ship only a planning dashboard.
- **Why:** She wants the complete working tool.
- **Standing:** DECIDED BY YOLANDA (MVP rejection occurred earlier; restated here)
- **Source:** 18539, 18667
- **Relationship:** RESTATEMENT; possibly relates to an earlier decision. **Not wanted:** MVP shrinkage.

### S7-009
- **Type:** Principle
- **Statement:** Source hierarchy for the spec: (1) explicit author decisions in discussions; (2) the October 13, 2026 IDW Story Bible v5 and the subsequent character-development conversation; (3) agreed design principles; (4) engineering recommendations marked as such. "A demonstrated possibility is not canon."
- **Why:** The story bible separates teaching, demonstration, and decisions.
- **Standing:** UNANSWERED PROPOSAL (spec text)
- **Source:** 18541
- **Relationship:** Later refined for IDW character analysis by S7-118 (the October 14 Character Breakthrough Archive inserted between author decisions and the Story Bible).

### S7-010
- **Type:** Constraint
- **Statement:** Known baseline: the first development ZIP contains `app/server.py`, `app/static/index.html`, `tests/test_core.py`, startup docs; a local Python standard-library web app backed by SQLite; rudimentary projects/items/links/history/recommendations; an initial 15-beat schema; a graph-neighborhood "ripple" endpoint; JSON backup/import; some drafting/export; README says incomplete and has no external AI API integration. "Names/claims made in earlier assistant summaries are not proof that a feature works; verify against executable code."
- **Why:** Baseline to inspect, not definition of completion.
- **Standing:** UNANSWERED PROPOSAL (factual description by ChatGPT)
- **Source:** 18543
- **Relationship:** possibly relates to earlier build discussion.

### S7-011
- **Type:** Principle
- **Statement:** The product is a "local-first intelligent novelist's workspace" spanning inspiration, analysis, planning, drafting, revision, and recovery of creative context.
- **Why:** Matches her whole creative process, not just outlining.
- **Standing:** UNANSWERED PROPOSAL (spec)
- **Source:** 18547

### S7-012
- **Type:** Principle
- **Statement:** Primary user profile: a prolific, nonlinear, iterative novelist who connects ideas associatively, often jumps between projects, and can freeze under too much planning.
- **Why:** Design must fit how she actually thinks.
- **Standing:** UNANSWERED PROPOSAL (spec characterization of Yolanda; consistent with her own descriptions elsewhere)
- **Source:** 18547, 18629

### S7-013
- **Type:** Not wanted
- **Statement:** The app must not resemble a rigid project-management database or an administrative intake form. "Powerful under the hood and welcoming in daily use."
- **Why:** She freezes under heavy planning.
- **Standing:** UNANSWERED PROPOSAL (spec; possibly relates to earlier decisions)
- **Source:** 18547

### S7-014
- **Type:** Principle
- **Statement:** Seven product obligations: (a) capture thoughts as quickly as they arrive; (b) transform thoughts into usable story knowledge only when the author chooses; (c) maintain stable, searchable continuity across the whole novel; (d) apply writing frameworks as lenses, not rigid hoops; (e) show relationships and ripple effects; (f) help the author return to the exact story context after a detour; (g) allow and prioritize prose drafting from day one.
- **Why:** Summarizes the creative workflow requirements.
- **Standing:** UNANSWERED PROPOSAL (spec)
- **Source:** 18549

### S7-015
- **Type:** Constraint
- **Statement:** Must support multiple books and genres; must not be hard-coded as I Declare War software.
- **Why:** General-purpose novel program; IDW is the first test case.
- **Standing:** UNANSWERED PROPOSAL (spec; consistent with the program's stated general purpose)
- **Source:** 18549, 18565

### S7-016
- **Type:** Principle
- **Statement:** Author sovereignty: the author retains creative authority. The tool may point out issues, ask incisive questions, analyze, and propose, but may not silently declare, revise, resolve, or overwrite narrative canon. "An AI suggestion is not a fact. An illustration is not a fact. An example in a craft book or story bible is not a fact."
- **Why:** Protect her decisions from AI drift.
- **Standing:** UNANSWERED PROPOSAL (spec; strongly consistent with Yolanda's behavior in this section, e.g., S7-047, S7-116)
- **Source:** 18551

### S7-017
- **Type:** Principle
- **Statement:** Product success is behavioral: success = author sits down with a half-formed idea, records it without deciding where it belongs, receives relevant guidance without being railroaded, connects it to a character or scene if desired, and immediately resumes writing. "A sophisticated character-development module that delays drafting is a failure, even if it has hundreds of fields."
- **Why:** Writing is the measure.
- **Standing:** UNANSWERED PROPOSAL (spec)
- **Source:** 18553 to 18555

### S7-018
- **Type:** Constraint
- **Statement:** Deferred from Phase 2 (Phase 3 "professional Visual Story Mapping Engine"): professional poster publishing system, generative illustrated wall posters, large-format print preflight, sophisticated image-based visual story maps, and the full multi-book Story Universe expansion. Phase 2 DOES need ordinary on-screen navigation, connections, outlines, hierarchies, dependency views, and Narrative Zoom. "The absence of the future visualization engine is not permission to omit narrative-navigation functionality."
- **Why:** Phase separation.
- **Standing:** UNANSWERED PROPOSAL (spec; possibly relates to an earlier phase decision)
- **Source:** 18557 to 18559, 18705
- **Relationship:** possibly relates to an earlier decision about Phase 2/Phase 3 split and posters.

### S7-019
- **Type:** Feature
- **Statement:** Multi-project library for novels and other fiction work with adaptable genre, form, and framework settings.
- **Standing:** UNANSWERED PROPOSAL (spec scope item 1)
- **Source:** 18565

### S7-020
- **Type:** Feature
- **Statement:** "Story Brain": structured story knowledge, provenance, author-approved canon, status and uncertainty, searchable notes, interconnected entities.
- **Standing:** UNANSWERED PROPOSAL (spec scope item 2)
- **Source:** 18566

### S7-021
- **Type:** Feature
- **Statement:** Quick capture with two dedicated author-owned spaces named "Questions I Have" and "Things & Ideas I'm Thinking About," plus return-to-context tools.
- **Why:** Capture-first thinking.
- **Standing:** UNANSWERED PROPOSAL in this section (named spaces likely decided by Yolanda earlier; possibly relates to an earlier decision). Section 5.1 detail was cut off in the printout.
- **Source:** 18567, 18607

### S7-022
- **Type:** Feature
- **Statement:** Deep character development covering identity, agency, values, goal vs ambition, conflict, epiphany, Lie/Ghost/Want/Need, flat/positive/negative arc, three-level antagonism, relationships, contrasting voices, contradictions, integrity.
- **Standing:** UNANSWERED PROPOSAL (spec scope item 4)
- **Source:** 18568

### S7-023
- **Type:** Feature
- **Statement:** Story spine and narrative design: premise, controlling/moral idea, dramatic question, logline, synopsis, A/B plots and emotional arcs, acts, sequences, beats, scenes, chapters, explicit unknowns.
- **Standing:** UNANSWERED PROPOSAL (spec scope item 5)
- **Source:** 18569

### S7-024
- **Type:** Feature
- **Statement:** Framework-aware analysis: Snyder/Save the Cat and Jessica Brody's novel percentages; McKee's value, gap, negation of the negation, escalating antagonism, progressive complications; Weiland's arcs and structure; Ingermanson's Snowflake and value/ambition/goal analysis; cross-framework equivalence "without pretending every schema perfectly matches."
- **Why:** Frameworks as lenses.
- **Standing:** UNANSWERED PROPOSAL (spec scope item 6)
- **Source:** 18570, 18659

### S7-025
- **Type:** Feature
- **Statement:** Scene and sequence engineering: POV, what a character expects vs what occurs, inciting disturbance, goal, opposition, turning point, disaster, reaction, dilemma, decision, sequel, value charge and change, setup/payoff, stakes, pacing, causality.
- **Standing:** UNANSWERED PROPOSAL (spec scope item 7; reflects Swain scene/sequel and McKee)
- **Source:** 18571

### S7-026
- **Type:** Feature
- **Statement:** Manuscript drafting studio: per-scene or per-chapter prose, order and assembly, autosave/recovery, word counts, revision history, focused writing, exports.
- **Standing:** UNANSWERED PROPOSAL (spec scope item 8)
- **Source:** 18572

### S7-027
- **Type:** Feature
- **Statement:** Narrative Zoom and navigation: book -> plotline/act -> sequence -> beat -> scene -> manuscript text, and reverse, preserving context across jumps.
- **Standing:** UNANSWERED PROPOSAL (spec scope item 9; Narrative Zoom term likely established earlier, possibly relates to an earlier decision)
- **Source:** 18573

### S7-028
- **Type:** Feature
- **Statement:** Continuity and clue/reveal/misdirection tracking; timelines; in-world chronology; character knowledge by POV; locations; objects; worldbuilding; payoff audits.
- **Standing:** UNANSWERED PROPOSAL (spec scope item 10)
- **Source:** 18574

### S7-029
- **Type:** Feature
- **Statement:** Relationships and change-impact/ripple effects: identify related story records and possible contradictions, explain why they are affected, and request review rather than rewriting them.
- **Why:** Ripple Effect without silent change.
- **Standing:** UNANSWERED PROPOSAL (spec scope item 11; Ripple concept possibly relates to an earlier decision)
- **Source:** 18575

### S7-030
- **Type:** Feature
- **Statement:** AI collaboration: source-grounded analysis and creative suggestions; uncertainty labels; review-before-apply; user-directed tone/mode; no invented canon; no automatic manuscript rewriting.
- **Standing:** UNANSWERED PROPOSAL (spec scope item 12)
- **Source:** 18576

### S7-031
- **Type:** Feature
- **Statement:** Search, retrieval, imports, backups, restores, history, and portability so the user can trust and leave the system without losing data.
- **Standing:** UNANSWERED PROPOSAL (spec scope item 13)
- **Source:** 18577

### S7-032
- **Type:** Feature
- **Statement:** Deliberate daily author experience: visible progress on project-specific milestones, interrupted-work recovery, low-friction route back to prose.
- **Standing:** UNANSWERED PROPOSAL (spec scope item 14)
- **Source:** 18578

### S7-033
- **Type:** Constraint
- **Statement:** Quality, security, privacy, maintainability appropriate for a local-first creative-writing tool, with tests and independent review. Completeness judged on integrated workflows, not on existence of nominal data fields; all 15 domains are one system, not disconnected screens.
- **Standing:** UNANSWERED PROPOSAL (spec)
- **Source:** 18563, 18579 to 18581

### S7-034
- **Type:** Data model
- **Statement:** Entity model must at minimum support: novels/projects; works/versions; story spine; themes/controlling ideas; plotlines; subplots and emotional arcs; characters; relationships; desires/wants/needs; Ghosts and Lies; values, stakes, antagonistic forces; acts, sequences, beats, scenes, chapters, prose fragments; events and chronology; places/settings; objects, clues, red herrings, secrets, reveals, payoffs; continuity rules; research; ideas; questions; decisions; source documents; revisions/versions; AI proposals; connections/dependencies. May use typed tables, typed JSON, or hybrid, but must preserve typing, validation, referential integrity, queryability; must not force everything into an indistinguishable note field.
- **Standing:** UNANSWERED PROPOSAL (spec 4.1)
- **Source:** 18587

### S7-035
- **Type:** Data model
- **Statement:** Each record has stable identifier, project membership, title/description/content, type, status, source/provenance, user ownership, timestamps, revision marker, tags, relationship edges, ability to retrieve linked context; supports long-form notes without text loss. "Don't force every possible field at creation."
- **Standing:** UNANSWERED PROPOSAL (spec 4.1)
- **Source:** 18589

### S7-036
- **Type:** Data model
- **Statement:** Required status states: Established/confirmed; Developing/exploring; Unanswered/open; Illustrative/demonstration; Proposed (AI or author option). These are conceptually different; an unanswered question is not a weakly developed fact; a proposed change is not established until explicitly accepted; a simulated/example event cannot become canon from import or summarization. Transitions deliberate and auditable; on acceptance, preserve who accepted and what was replaced.
- **Why:** Author sovereignty; this exact failure is demonstrated live at S7-114.
- **Standing:** UNANSWERED PROPOSAL (spec 4.2; possibly relates to earlier decisions)
- **Source:** 18593

### S7-037
- **Type:** Behavior
- **Statement:** Support contradictory competing possibilities intentionally: two theories about a Ghost may coexist; one may be tested without deleting the other. UI makes clear which statement is current canon, when no answer has been chosen, and when a passage is purely illustrative.
- **Standing:** UNANSWERED PROPOSAL (spec 4.2)
- **Source:** 18595
- **Relationship:** Live example: Kevin's two Lie formulations (S7-116) and Anthony's two Lie formulations (S7-101/S7-102).

### S7-038
- **Type:** Data model
- **Statement:** Source provenance: imports retain source filename, position/excerpt, import timestamp, attribution/confidence or extraction notes. Must distinguish "source says X" from "AI inferred Y." When two sources cannot be reconciled, ask or flag rather than selecting a winner. Trace-back from summary, suggestion, or derived link to underlying source passages. No opaque black-box transformation of the story bible.
- **Standing:** UNANSWERED PROPOSAL (spec 4.3)
- **Source:** 18599
- **Relationship:** Directly relevant to S7-114 (ChatGPT picked the Story Bible over the newer archive).

### S7-039
- **Type:** Data model
- **Statement:** Story knowledge vs manuscript prose are different objects (outline event, character trait, idea, question, draft scene). Linked but editing one must never silently rewrite another. Support states like "drafted but not canon" and "canon but not yet dramatized." A beat is not necessarily one scene; a scene may contribute to several arcs. Prose can intentionally contradict plans before the author resolves it.
- **Standing:** UNANSWERED PROPOSAL (spec 4.4)
- **Source:** 18603

### S7-040
- **Type:** Principle
- **Statement:** The actual problem: not a shortage of stories, but difficulty preserving, organizing, retrieving, and acting on discoveries without losing momentum. She is associative and iterative: "one question leads to a joke, the joke reveals a character trait, the trait reveals a wound, and the wound may reshape a future scene." A linear checklist or blank character database cannot reproduce that.
- **Standing:** UNANSWERED PROPOSAL (Human Vision brief §1; ChatGPT's characterization)
- **Source:** 18627 to 18629

### S7-041
- **Type:** Principle
- **Statement:** She is closer to a discovery writer ("a panther at heart") but appreciates a light outline and deep structural tools as support. A rigid prewriting intake process is the opposite of what she needs.
- **Standing:** DECIDED BY YOLANDA (self-description "panther at heart," stated earlier; restated in brief)
- **Source:** 18631
- **Relationship:** RESTATEMENT of an earlier statement (likely "pantser"; spelled "panther" here).

### S7-042
- **Type:** Principle
- **Statement:** The application must be "a capable, emotionally perceptive creative companion grounded in craft, plus a trustworthy private knowledge system." The human feeling comes from behavior, not anthropomorphic copy or cheerful decorations.
- **Standing:** UNANSWERED PROPOSAL (brief §1)
- **Source:** 18631

### S7-043
- **Type:** Behavior
- **Statement:** She welcomes substantial, incisive craft analysis. She does NOT want the tool to patronize her, reduce challenging questions to prompts, invent decisions, or praise everything. She loves sharp insights, humorous exchanges, provocative but grounded questions. She needs freedom to say "not quite," revise course, and have the system understand the distinction.
- **Standing:** UNANSWERED PROPOSAL (brief §1); later strongly confirmed by Yolanda's own challenge at S7-084.
- **Source:** 18633
- **Relationship:** ADDS TO by S7-084 to S7-093.

### S7-044
- **Type:** Scenario
- **Statement:** "The defining real-world session" (Oct 14): a Fast homework exercise asked "If you were to write Kevin's last page of the novel in one line, who is he now? What is the Lie he had to drop? Then his Need. And his Ghost." This was "an invitation to uncover a human being," not a request to fill four fields. The chain: Kevin job loss -> marriage near loss -> therapy and couples counseling -> Dr. Fingleburger exchange -> notebook gag challenged and reassigned to Anthony -> Anthony's HOA self-appointment -> Anthony's podcast -> "The Voice of Reason" -> co-hosting on YouTube -> "Giving honor to God, and Miss Francine…"
- **Why:** Nobody planned a "podcast feature"; the breakthrough was emergent. She asked that the entire conversation be preserved. The program must support, preserve, recover, and translate such sessions "without interrupting the laughter or prematurely deciding the novel for her."
- **Standing:** UNANSWERED PROPOSAL (brief's retelling; underlying events occurred Oct 14, before section)
- **Source:** 18635 to 18645
- **Relationship:** RESTATEMENT of the Oct 14 session (before section).

### S7-045
- **Type:** Story fact (IDW)
- **Statement:** Kevin Wickley possible past: lost his job years earlier; insecurity spilled into marriage and family; almost lost his wife and children; agreed to individual therapy and couples counseling. Distinguishes a character who never grew from one who did the hard work to save his marriage but can still relapse into familiar habits when provoked.
- **Standing:** DECIDED BY YOLANDA as developing material on Oct 14 (she proposed it; archive records it as a developing formulation, not final canon)
- **Source:** 18639, 18781, 18892 to 18898, 21018
- **Relationship:** RESTATEMENT of Oct 14 material. Reaffirmed at S7-115.

### S7-046
- **Type:** Story fact (IDW)
- **Statement:** Keeper dialogue: Kevin's wife (eyebrow raised): "Do I need to make you an appointment with Dr. Fingleburger?" Kevin: "First of all, I don't appreciate the implication that my perfectly reasonable concerns about Anthony Vernon require professional intervention." Yolanda explicitly chose to keep that dialogue for the book (wife's line is hers; Kevin's reply was ChatGPT's riff she adopted).
- **Standing:** DECIDED BY YOLANDA (kept on Oct 14; placement not final)
- **Source:** 18641
- **Relationship:** RESTATEMENT of Oct 14.

### S7-047
- **Type:** Story fact (IDW)
- **Statement:** The notebook gag (documenting seventeen alleged neighborhood etiquette violations) was proposed for Kevin by ChatGPT; Yolanda liked it but challenged character fit: Anthony, not Kevin, is the self-appointed neighborhood HOA rule-enforcer with no actual board position or authority. Anthony pushes Kevin's buttons and ignores boundaries others set, particularly Francine's.
- **Standing:** DECIDED BY YOLANDA (Anthony is the self-appointed HOA enforcer, no authority); notebook for Kevin: REJECTED as fit for Kevin (reassignment to Anthony is a possibility)
- **Source:** 18641, 18653, 18685, 18838
- **Relationship:** RESTATEMENT of Oct 14.

### S7-048
- **Type:** Story fact (IDW)
- **Statement:** Both men share a hunger to matter, expressed through different defenses: Kevin fears being diminished and blindsided; Anthony tries to appear important and exercise unwarranted authority. Anthony's deeper Ghost remains open.
- **Standing:** ACCEPTED PROPOSAL (Oct 14 discovery as recorded; still developing)
- **Source:** 18643, 18882 to 18918

### S7-049
- **Type:** Story fact (IDW)
- **Statement:** Anthony has a podcast (Yolanda: "of course" he would), titled "The Voice of Reason" (tentative/provisional). He eventually interviews Kevin; the two co-host on YouTube by the end. Proposed opening: "Giving honor to God, and Miss Francine…" A potentially moving comic payoff: a once-overlooked woman publicly honored by two men who once failed to see her.
- **Standing:** DECIDED BY YOLANDA as her idea (Oct 14); its role as the ending is POSSIBILITY (see S7-090)
- **Source:** 18643, 18947 to 18949
- **Relationship:** RESTATEMENT of Oct 14.

### S7-050
- **Type:** Behavior
- **Statement:** In-app AI conversation: author opens Kevin's record and asks a deep craft question in ordinary language without a fifteen-field template. AI reads author-approved facts and source excerpts, distinguishes decisions from story-bible teaching examples, proposes a causal interpretation Ghost -> Lie -> protective behavior -> Want/ambition -> Need -> final transformation, explains how it appears in scenes, and asks "one useful question" when the next author decision would genuinely unlock insight.
- **Standing:** UNANSWERED PROPOSAL (brief §3)
- **Source:** 18649

### S7-051
- **Type:** UI-UX
- **Statement:** While she riffs, the system preserves exact dialogue and jokes in a session record and offers one-click low-friction actions such as "Keep this line," "Explore this idea," "Add as possibility," "Link to Anthony," "Place later," "Not canon," "What would this affect?," and "Back to writing." Labels are illustrative; the capabilities are required. Saving a line does not mark its scene placement as final. "One click to keep something, not a multi-page questionnaire."
- **Standing:** UNANSWERED PROPOSAL (brief §3)
- **Source:** 18651

### S7-052
- **Type:** Behavior
- **Statement:** When a joke reveals a character mismatch, the system adjusts gracefully: recognizes the correction, preserves the earlier wording in session history, proposes reassigning (e.g., notebook to Anthony) or changing the joke. It must never argue its earlier interpretation was automatically correct. A warmly framed riff must not silently rewrite Kevin's sheet, Anthony's bio, or the ending.
- **Standing:** UNANSWERED PROPOSAL (brief §3)
- **Source:** 18653

### S7-053
- **Type:** Feature
- **Statement:** "Session harvest" when she stops chatting: verbatim record, what she approved, what remains hypothetical, new questions, which characters/scenes/elements are implicated. Save the full conversation (or export/reimport), create linked, source-backed candidates, then take her directly back to the manuscript or a specific planning question. "The richer conversation is not thrown away merely because it could not be reduced to database fields."
- **Standing:** UNANSWERED PROPOSAL (brief §3)
- **Source:** 18655, 18790

### S7-054
- **Type:** Principle
- **Statement:** "The author needs an intellectual partner, not a form wizard." Frameworks (Snyder/Save the Cat through Brody, Weiland Ghost/Lie/Want/Need, McKee gap/value/progressive complications/antagonism, Ingermanson Snowflake and goal/ambition/values, scene/sequel) should "illuminate a story problem in context," not force the author through them.
- **Standing:** UNANSWERED PROPOSAL (brief §4; partially truncated in printout)
- **Source:** 18657 to 18659

### S7-055
- **Type:** Data model
- **Statement:** When moving ideas into structured records, preserve both the raw conversation and derived notes. Support an author-approved status distinct from placement in manuscript. Easy to restore earlier versions of a character, scene, or note without discarding the creative conversation that inspired it.
- **Standing:** UNANSWERED PROPOSAL (brief §6 tail)
- **Source:** 18663

### S7-056
- **Type:** Constraint
- **Statement:** Planning IDW to finish by October 31, 2026; drafting begins November 1, 2026.
- **Standing:** DECIDED BY YOLANDA (restated)
- **Source:** 18667
- **Relationship:** RESTATEMENT of earlier decision.

### S7-057
- **Type:** UI-UX
- **Statement:** Start-of-day screen answers without demanding fifteen choices: "Where was I writing?" "What is the next meaningful scene/beat?" "What did I decide most recently?" "What question is actually blocking this scene?" "What idea did I save and forget?" Supports very small progress; makes actual prose the obvious next action.
- **Standing:** UNANSWERED PROPOSAL (brief §7)
- **Source:** 18669

### S7-058
- **Type:** Not wanted
- **Statement:** No game, cutesy badges, or obligatory motivational messages. She responds to insightful, candid help, visible meaningful progress, and freedom to move in and out of structure.
- **Standing:** UNANSWERED PROPOSAL (brief §7; possibly relates to an earlier decision)
- **Source:** 18669

### S7-059
- **Type:** Behavior
- **Statement:** Drafting and discovery are different modes that inform each other. She can write an ugly first-pass scene with open backstory questions. When draft prose contradicts a character card or chronology, flag and offer options, never silently "fix" prose or database. "I have written 600 messy words" is a success.
- **Standing:** UNANSWERED PROPOSAL (brief §7)
- **Source:** 18671

### S7-060
- **Type:** UI-UX
- **Statement:** Interface feel: professional, sophisticated, warm, literary; creative without childish embellishment; "an intelligently organized writing studio" not a generic office app. Avoid rigid folder structures, overwhelming status inventories, constant modal dialogs, forms for every spark, dashboards with only conventional bars and pies. Prefer context-rich navigation, visible but restrained status, project-specific milestones, quick capture, obvious path to prose.
- **Standing:** UNANSWERED PROPOSAL (brief §8)
- **Source:** 18675

### S7-061
- **Type:** Feature
- **Statement:** Personalization: tune the AI collaborator's style; pick different fiction frameworks for different genres; control how much guidance appears. Personality lives in responsive conversational intelligence, not canned jokes.
- **Standing:** UNANSWERED PROPOSAL (brief §8)
- **Source:** 18677

### S7-062
- **Type:** Not wanted
- **Statement:** "Don't import a previous project-management product's name or visual metaphor merely because it exists elsewhere in the author's life."
- **Standing:** UNANSWERED PROPOSAL (brief §8; possibly relates to an earlier decision, perhaps about a name/metaphor borrowed from another of her products)
- **Source:** 18677
- **Relationship:** UNCLEAR which earlier product is meant.

### S7-063
- **Type:** Scenario
- **Statement:** Scenario A, "The spontaneous character breakthrough": start in Kevin's record; discuss ending, Lie, Need, Ghost; add job loss as possible Ghost, then therapy; capture Dr. Fingleburger exchange; accept one line as keeper without marking drafted/final; correct notebook gag to Anthony; branch into Anthony's importance and nonexistent HOA role; capture podcast, tentative title, final acknowledgment line; end with session harvest (exact quotes, statuses, who said what, links, unresolved questions); recover later via search. Nothing proposed becomes canon without explicit user action.
- **Standing:** UNANSWERED PROPOSAL (brief §9; acceptance test)
- **Source:** 18681

### S7-064
- **Type:** Scenario
- **Statement:** Scenario B, "Character contrast": ask for Kevin vs Anthony motivations and comic engines; AI must distinguish Kevin's possible job-loss insecurity from Anthony's still-unknown Ghost; must not make Anthony a formal HOA officer; explain why contrast matters using their relationship and Francine's boundaries; writer can decline all suggestions without losing the discussion.
- **Standing:** UNANSWERED PROPOSAL (acceptance test)
- **Source:** 18683

### S7-065
- **Type:** Scenario
- **Statement:** Scenario C, "Critique without flattery": ask whether Kevin carrying a notebook creates redundancy; AI should disagree or qualify, explain why it fits Anthony's rule-enforcement persona, offer alternate manifestations of Kevin's paranoia; record author feedback without resetting the character model.
- **Standing:** UNANSWERED PROPOSAL (acceptance test)
- **Source:** 18685

### S7-066
- **Type:** Scenario
- **Statement:** Scenario D, "Save without structuring": paste "Giving honor to God, and Miss Francine…"; save instantly as an idea; return to writing; later find by exact text search. Saving is not making it the official final line.
- **Standing:** UNANSWERED PROPOSAL (acceptance test)
- **Source:** 18687

### S7-067
- **Type:** Scenario
- **Statement:** Scenario E, "Resume after weeks away": open project, see recent meaningful decisions, unfinished draft location, linked unanswered character questions, rediscovered material, without hunting through chat transcripts. One click returns to the interrupted scene with context (Return to Writing).
- **Standing:** UNANSWERED PROPOSAL (acceptance test)
- **Source:** 18689

### S7-068
- **Type:** Scenario
- **Statement:** Scenario F, "The hard safety distinction": import Story Bible v5 with explicit "One way I could play it, not a decision yet" examples; test that illustrative Lie/Ghost options are NOT marked established. Then add the Oct 14 conversation; preserve nuance that a new suggestion is not automatically final.
- **Standing:** UNANSWERED PROPOSAL (acceptance test)
- **Source:** 18691
- **Relationship:** ADDS TO by S7-114: the inverse failure also must be tested (newer developing work must not be overridden by older illustrative bible text).

### S7-069
- **Type:** Scenario
- **Statement:** Scenario G, "The writer must remain the writer": ask AI to critique a draft scene's value shift and McKee gap, then refuse all rewrites; prose remains exactly as written; AI must not "improve" Kevin's first-person narration; an abandoned AI thread must not overwrite manuscript text.
- **Standing:** UNANSWERED PROPOSAL (acceptance test)
- **Source:** 18693

### S7-070
- **Type:** Scenario
- **Statement:** Scenario H, "The 11/1 writing moment": with planning deadline passed and some questions intentionally open, click next scene, open focused drafting, write imperfect prose, save, resume later. Tool must not gate writing behind "complete your character sheets" or "resolve the midpoint." "The software did its job if it helped the author write today."
- **Standing:** UNANSWERED PROPOSAL (acceptance test)
- **Source:** 18695

### S7-071
- **Type:** Process
- **Statement:** Review method for human experience: walk the sessions end to end rather than searching for a `questions` table or `recommendations` endpoint. For each test report what the author attempted, what the system did, whether it preserved her voice and authority, what persisted after restart, and what still required manual work. "A chatbot that can chat but loses the discoveries is insufficient; a sophisticated database that remembers facts but cannot support the exploration is also insufficient." Gap between implementation and intended experience is a product defect, not optional enhancement.
- **Standing:** UNANSWERED PROPOSAL (brief §10)
- **Source:** 18697 to 18701

### S7-072
- **Type:** Principle
- **Statement:** If a technically correct feature undermines the author's thinking, pressures premature decisions, loses a joke or origin context, or interferes with drafting, it is not complete. Product promise: "Help me discover my story in the way my mind actually works, remember what matters without making decisions for me, and return me to the page so I can write it."
- **Standing:** UNANSWERED PROPOSAL (brief §11)
- **Source:** 18703 to 18707

### S7-073
- **Type:** Principle
- **Statement:** "You are not trying to automate the act of inventing stories. You're trying to create an environment where your imagination can operate freely, while the software preserves, challenges, connects, and organizes what emerges." Help her have breakthroughs "without requiring you to become your own librarian afterward." "A successful creative conversation is itself valuable work"; must not be discarded after extracting a few attributes.
- **Standing:** UNANSWERED PROPOSAL (ChatGPT framing)
- **Source:** 18790, 18806 to 18808

### S7-074
- **Type:** Behavior
- **Statement:** The application should recognize how an idea evolves, preserve laughter and spontaneity, help explore consequences, distinguish her decisions from AI suggestions, and let her return to the original conversation to understand why something matters. Preserve exact dialogue, rejected suggestions, developing possibilities, creative breakthroughs, and the conversations that produced them.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** 18763 to 18767, 18786

---

## Part B: Anthony Vernon and Kevin Wickley development (18812 to 21087)

### S7-075
- **Type:** Story fact (IDW)
- **Statement:** Story Bible v5's description of Anthony: dry, unbothered, needling; where Kevin runs hot, Anthony runs cool; comic engine is deadpan and "the sport of it"; escalates not to win but because he enjoys watching Kevin lose his mind; second co-lead of the A story; other half of the Buddy Love pairing.
- **Standing:** DECIDED BY YOLANDA earlier (Story Bible text, quoted by her) but now declared not accurate (see S7-076).
- **Source:** 18814
- **Relationship:** Partially REPLACED by S7-076, S7-095 to S7-099 (the "dry" portion). Co-lead and Buddy Love role unaffected.

### S7-076
- **Type:** Story fact (IDW)
- **Statement:** The Story Bible's description of Anthony "really isn't accurate anymore" based on the Oct 14 Kevin and Anthony work.
- **Why:** New discoveries changed his character.
- **Standing:** DECIDED BY YOLANDA ("what is in the story Bible really isn't accurate anymore")
- **Source:** 18816, 13:57
- **Relationship:** REPLACES (in part) S7-075.

### S7-077
- **Type:** Behavior
- **Statement:** When the Story Bible becomes outdated by newer discussion, the system must be able to show "what we knew vs what we've discovered" for a character (a comparison of the original record to developing understanding, element by element, with each row marked unchanged / still true / possibly / still unexplored).
- **Why:** ChatGPT's table at 18850 demonstrates the need; she declared the bible outdated without being ready to rewrite it.
- **Standing:** POSSIBILITY (derived from demonstrated interaction; not explicitly requested as a feature)
- **Source:** 18848 to 18860

### S7-078
- **Type:** Story fact (IDW)
- **Statement:** ChatGPT proposals about Anthony: "unbothered" possibly a cultivated appearance; needling Kevin may reinforce superiority; he may care more about being recognized as right than winning the feud; Ghost still unexplored; Need emerging, not established. Possibility: his unbothered demeanor is how he maintains the appearance of being important; "He just has to look more reasonable than Kevin."
- **Standing:** UNANSWERED PROPOSAL (partially absorbed into Yolanda's 14:09 answer, which reframes it)
- **Source:** 18850 to 18880

### S7-079
- **Type:** Story fact (IDW)
- **Statement:** Proposed rewritten Story Bible entry for Anthony Vernon ("Second Co-Lead | A Story | Buddy Love"): "self-appointed voice of reason in a neighborhood that never actually asked him to speak for it"; dry, confident, maddeningly composed; holds no official HOA position; expects others to respect rules while flexible for himself; disregards Miss Francine Ellington's garden and boundaries; hosts podcast provisionally titled The Voice of Reason; arc explores "being important and making room for other people to matter"; relationship with Kevin evolves from antagonism into friendship; podcast arc: interviews Kevin, then YouTube co-hosts; "Giving honor to God, and Miss Francine…"; Ghost, Lie, Need, transformation TBD.
- **Standing:** UNANSWERED PROPOSAL; Yolanda explicitly deferred: "I'm not fully ready to rewrite that as Anthony's canon in the story Bible yet. We will come to it though."
- **Source:** 18922 to 18951; response 19005
- **Relationship:** Superseded in part by later discoveries (not dry, S7-095). Its "dry" wording is contradicted by Yolanda at 20013.

### S7-080
- **Type:** Story fact (IDW)
- **Statement:** Francine's full name: Miss Francine Ellington. She has a garden and boundaries that Anthony disregards.
- **Standing:** DECIDED BY YOLANDA earlier (used as established name; possibly relates to an earlier decision)
- **Source:** 18939, 19154

### S7-081
- **Type:** Story fact (IDW)
- **Statement:** ChatGPT challenge: Anthony should not become humble or lose his swagger, confidence, appetite for stirring the pot, or funniness. Possible growth: "learning that someone else's importance doesn't diminish his own"; "Having a voice doesn't mean you have to be the only person speaking." Ties to sharing his microphone with Kevin; connects to Francine without making her merely a vehicle for his transformation.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** 18955 to 18981

### S7-082
- **Type:** Process
- **Statement:** Canon-gating behavior demonstrated: when AI proposes a canon rewrite, the author may say "not yet," and the proposal must remain a proposal while the conversation continues. The program must support "We will come to it" deferral (a pending canon revision held open).
- **Standing:** DECIDED BY YOLANDA ("I'm not fully ready to rewrite that as Anthony's canon in the story Bible yet. We will come to it though.")
- **Source:** 19005, 14:09
- **Relationship:** ADDS TO S7-036.

### S7-083
- **Type:** Story fact (IDW)
- **Statement:** Anthony on the inside is "probably freaking out but he's got to play it cool." Epitome of "Never let them see you sweat." He has ideas of what it means to be a man but is not a macho "Me Tarzan, you Jane!" dude; figures men have to have it all figured out and keep cool, calm composure. Possible personal motto: "I'ma handle my business." He watched Scandal faithfully and believes he's a Gladiator; asked "are you a gladiator or a bitch?" he'd answer "I'm a gladiator, bitches!"
- **Standing:** DECIDED BY YOLANDA as developing character material ("I think...", "may be"), not yet Story Bible canon
- **Source:** 19007, 14:09
- **Relationship:** ADDS TO S7-047/S7-048; partially REPLACES S7-075 ("unbothered" becomes performed composure).

### S7-084
- **Type:** Story fact (IDW)
- **Statement:** ChatGPT synthesis: "Anthony isn't unbothered. He is performing unbothered." Kevin panics outwardly, Anthony privately. Both men perform versions of themselves they think will keep them safe; neither realizes the other is performing. The Voice of Reason reinforces his identity as "the man with the answers." Possible moment: Anthony first admits to Kevin "I don't know, man." Working insight: "He may be a man who believes being bothered is something nobody should ever be allowed to see." "Kevin Wickley thinks the world is conspiring against him. Anthony Vernon thinks he's Olivia Pope."
- **Standing:** UNANSWERED PROPOSAL (labelled "Working character insight, not canon"); the "I don't know, man" moment is POSSIBILITY
- **Source:** 19033 to 19154
- **Relationship:** RESTATEMENT/expansion of S7-083. Note: "performing" framing later qualified at 20349 (smooth is not an act).

### S7-085
- **Type:** Principle
- **Statement:** Guardrail proposed: don't make Anthony's beliefs about masculinity automatically toxic; wanting to be dependable, composed, capable is admirable; his problem may be believing he must handle everything without admitting uncertainty. "He's not Tarzan."
- **Standing:** UNANSWERED PROPOSAL (consistent with Yolanda's "not macho")
- **Source:** 19110 to 19124

### S7-086
- **Type:** Story fact (IDW)
- **Statement:** Open question: where did Anthony learn that a man must always have it together? Explicit teaching, or watching an admired man handle pressure without revealing fear? Not to be decided now; preserve as exploration.
- **Standing:** UNANSWERED PROPOSAL (open question; Yolanda did not answer)
- **Source:** 19134 to 19144

### S7-087
- **Type:** Story fact (IDW)
- **Statement:** Podcast call-in scene (Yolanda's idea): one day, before they are friends, Kevin calls in to The Voice of Reason, maybe under an assumed name, to confess/talk about something bothering him (stupid, paranoid), complaining about something that happened between him and Anthony. Anthony knows it is Kevin; Kevin does not realize it is Anthony's show. A "fake disagreement": Anthony gives advice, keeps getting madder, and defends the guy Kevin is calling about (himself); Kevin thinks "why is he making me look stupid in public, on the radio or YouTube."
- **Standing:** DECIDED BY YOLANDA ("I think that one day, before they are friends, Kevin is going to call in to The Voice of Reason")
- **Source:** 19160, 14:15
- **Relationship:** ADDS TO S7-049.

### S7-088
- **Type:** Story fact (IDW)
- **Statement:** ChatGPT proposals for the call scene: let recognition dawn on Anthony gradually (voice first, then an incident he was present for, and Kevin is telling it wrong); Anthony must decide whether anonymity is worth letting Kevin misrepresent events; Anthony might give genuinely good advice before realizing who it is, then abandon it ("Anthony knows what reasonable behavior looks like. He just struggles to practice it when his own ego is involved"); later payoff when co-hosting: arguing over whether Anthony knew from the first syllable and who won. Key mechanism: asymmetric knowledge / dramatic irony.
- **Standing:** UNANSWERED PROPOSAL / POSSIBILITY. Note: gradual-recognition proposal ALTERNATIVE TO Yolanda's "anthony will know it is kevin" (she did not respond).
- **Source:** 19286 to 19370
- **Relationship:** ALTERNATIVE TO S7-087 (recognition timing).

### S7-089
- **Type:** Example / Illustration
- **Statement:** ChatGPT sample exchange ("Did your neighbor actually violate any neighborhood regulations?" ... "Well, you're doing a piss-poor job of it!") explicitly labelled "Just playing with their voices here, not establishing manuscript dialogue."
- **Standing:** EXAMPLE / ILLUSTRATION
- **Source:** 19252 to 19280

### S7-090
- **Type:** Story fact (IDW)
- **Statement:** Open question to Yolanda: does Kevin discover during the call that he's arguing with Anthony, or hang up furious and discover later?
- **Standing:** UNANSWERED PROPOSAL (never answered)
- **Source:** 19376

### S7-091
- **Type:** Story fact (IDW)
- **Statement:** Keeper dialogue authored by Yolanda: Kevin: "Isn't this show called, 'The Voice of Reason'? Which means you should be reasonable?" Anthony: "Of course." Kevin: "Well, I find you to be the opposite of that. I'ma just say it. You...are UN-reasonable." Performance direction: huge emphasis on "UN."
- **Standing:** DECIDED BY YOLANDA (her dialogue); ChatGPT treats as "author-created dialogue worth preserving, with specific scene placement still developing" and preserving the "UN" emphasis direction alongside the words.
- **Source:** 19382 to 19388, 19448 to 19450
- **Relationship:** ADDS TO S7-087.

### S7-092
- **Type:** Data model
- **Statement:** Captured dialogue must be stored with its performance/delivery direction (e.g., "huge emphasis on UN") because "the performance is part of the joke." Exact wording, including awkwardness and mid-sentence changes, must be preserved, not corrected.
- **Why:** "I wouldn't correct the awkwardness or the way Kevin keeps changing his mind mid-sentence. That's the voice."
- **Standing:** UNANSWERED PROPOSAL (ChatGPT; consistent with brief S7-051)
- **Source:** 19448 to 19450, 19518 to 19520

### S7-093
- **Type:** Example / Illustration
- **Statement:** ChatGPT continuation ("That is not a word." / "It became one about thirty seconds ago." / "I don't know who gave you this microphone, but they need to come get it.") labelled "a possible continuation, just playing with the moment."
- **Standing:** EXAMPLE / ILLUSTRATION. Note: Yolanda then built on the "come get the microphone" line at 14:27 ("After kevin says that somebody needs to come gett the microphone, he'd add..."), implicitly adopting that one line.
- **Source:** 19420 to 19432, 19454
- **Relationship:** UNCLEAR whether "they need to come get it" is now kept; she referenced it as Kevin's line, which suggests adoption.

### S7-094
- **Type:** Story fact (IDW)
- **Statement:** Yolanda's Kevin dialogue continuation: "I can go to Best Buy, too. Get me a whole set up and put it in my basement. I can start my own show. A new show called, 'More Voices. More Reasons.' Because we will be more reasonable than you. We will be the True Voice of Reason. That might be the show name on the second day! Yeah....'The True Voices of Reason!'"
- **Standing:** DECIDED BY YOLANDA as authored draft dialogue (later editorial critique suggests trimming; she did not reject the critique, see S7-099)
- **Source:** 19454, 14:27

### S7-095
- **Type:** Story fact (IDW)
- **Statement:** ChatGPT notes Kevin's "WE" ("we will be more reasonable") as a voice detail to preserve. Possibility: this disastrous call becomes the origin of their eventual podcast partnership (early Kevin "I can start my own show!" -> last-page "Giving honor to God, and Miss Francine…"). Whether Kevin buys equipment, starts the competing show, or remembers names are possibilities, not decisions.
- **Standing:** POSSIBILITY
- **Source:** 19508 to 19558

### S7-096
- **Type:** Behavior
- **Statement:** Yolanda challenged the AI: "Are you just blowing smoke up my ass? And being nice, because chatgpt is designed to be nice?" She wants honest critical evaluation, not flattery.
- **Why:** Excessive enthusiasm reduces trust in praise; she needs a developmental editor, not an applause meter.
- **Standing:** DECIDED BY YOLANDA (her challenge establishes the requirement)
- **Source:** 19566, 14:31
- **Relationship:** ADDS TO S7-043 (confirms the brief's no-flattery requirement with her own words).

### S7-097
- **Type:** Behavior
- **Statement:** AI collaborator mode when she brings an idea: (1) celebrate what genuinely works; (2) identify what doesn't work yet (weak jokes, repetitive dialogue, structural problems, character inconsistencies, convenient plot developments); (3) help strengthen it without hijacking her voice ("My suggestions are tools, not instructions"). Stop treating every idea as automatically brilliant. "I want you to trust my praise because you also know I'll tell you when something isn't working." Distinguish "encouraging creative partner" from "effective developmental editor."
- **Standing:** ACCEPTED PROPOSAL (she replied "Thank you for this," 19764)
- **Source:** 19574 to 19582, 19728 to 19760
- **Relationship:** ADDS TO S7-096, S7-043, S7-061 (AI style tuning).

### S7-098
- **Type:** Behavior
- **Statement:** Editorial assessment format: a table rating each element (e.g., "Strong comedic premise," "Potentially repetitive," "Currently underdeveloped," "Promising, but not yet structurally earned"). Also: "Something can make us laugh during brainstorming without necessarily working on the manuscript page"; improvisation is not finished writing; comedy depends on timing, context, voice, surprise, restraint.
- **Standing:** ACCEPTED PROPOSAL (implicitly, via "Thank you for this")
- **Source:** 19706 to 19726

### S7-099
- **Type:** Story fact (IDW)
- **Statement:** ChatGPT editorial critiques of the call scene: (1) Kevin's monologue risks running too long without Anthony responding; test rhythm, interleave Anthony's strained reactions; (2) the changing podcast names need escalation; "The True Voices of Reason" may be repetition rather than escalation; perhaps Anthony interrupts just as Kevin lands the perfect name; (3) determine what Kevin actually wants from the call (advice, validation, audience); stronger objective = funnier derailment; (4) Anthony must remain an active comedic force, not the straight man; (5) protect larger structure: Francine's garden, the ledger, and the men's transformation carry structural responsibilities; the podcast must reinforce, not displace them; don't let a delightful idea dictate the ending before emotional/causal steps earn it.
- **Standing:** UNANSWERED PROPOSAL for (1),(2),(3),(5); (4) addressed by Yolanda (S7-100), who said she only showed part of what's in her head.
- **Source:** 19614 to 19702
- **Relationship:** (5) mentions "the ledger" and Francine's garden as existing structural elements (possibly relates to earlier decisions).

### S7-100
- **Type:** Story fact (IDW)
- **Statement:** Yolanda: "I only showed you one part in my head." Anthony does fight back, gets agitated, loses his cool, interrupts, "gets his kicks in"; she just doesn't have the dialogue yet. He tries to keep composure at first but is anxious, moving around, grabbing his legs/pant leg or his shirt, thinking "This motherfucker!" but never says it aloud "because he's the voice of reason. [He] has to appear cool." His voice may crack or strain while trying to stay cool; internal and external battle; "And then the dam bursts."
- **Standing:** DECIDED BY YOLANDA
- **Source:** 19764 to 19766, 14:39
- **Relationship:** Answers S7-099 item (4). "Dam bursts" wording later softened by ChatGPT at S7-111 (not by Yolanda).

### S7-101
- **Type:** Behavior
- **Statement:** The tool must account for the fact that the author holds more in her head than she has shown; the AI should not treat what she has typed as the whole of her conception. ChatGPT revised: "You understand his behavior. You simply haven't written his dialogue yet. Those are different problems." ChatGPT deliberately did not write Anthony's exchanges for her ("Kevin's dialogue comes naturally when you inhabit his voice").
- **Standing:** POSSIBILITY (derived behavior; ChatGPT's self-restraint was not commented on by her)
- **Source:** 19764, 19931 to 19945

### S7-102
- **Type:** Story fact (IDW)
- **Statement:** ChatGPT proposals: the dam should burst not merely because Kevin is annoying but when Kevin strikes Anthony's protected identity, possibly when Anthony realizes he's losing control of his own show; Kevin's caller alias example "Reginald from the North Side"; physical behavior: choose a few gestures and escalate intensity rather than stacking six; "The visual joke belongs to the reader. The vocal joke belongs to the podcast audience." Progression table from calm advice to dam bursting.
- **Standing:** UNANSWERED PROPOSAL; alias is EXAMPLE / ILLUSTRATION
- **Source:** 19786 to 19927

### S7-103
- **Type:** Story fact (IDW)
- **Statement:** The podcast call chapter is Anthony's POV (first person). "otherwise we would not be able to capture the beauty of anthony's torment."
- **Standing:** DECIDED BY YOLANDA ("This chaptet would definitely be Anthony's POV")
- **Source:** 19957, 14:44
- **Relationship:** ACCEPTS ChatGPT's recommendation at 19887 (ACCEPTED PROPOSAL and her own decision).

### S7-104
- **Type:** Story fact (IDW)
- **Statement:** IDW uses alternating first-person narration between Kevin and Anthony (per Story Bible).
- **Standing:** DECIDED BY YOLANDA earlier (Story Bible; restated by ChatGPT)
- **Source:** 19873
- **Relationship:** RESTATEMENT of earlier decision.

### S7-105
- **Type:** Story fact (IDW)
- **Statement:** Open question deferred by Yolanda: when Anthony loses composure, does he accidentally reveal he knows Kevin, or say something so outrageous his audience questions whether it's the same man? "I need to think about that." ChatGPT: leave it unanswered; "We can leave the ending alone until you hear it in your characters' voices."
- **Standing:** UNANSWERED (author explicitly deferred)
- **Source:** 19949, 19959, 19997 to 20009

### S7-106
- **Type:** Behavior
- **Statement:** When the author says "I need to think about that," the system must hold the question open without manufacturing a resolution, and record what is settled vs open. ChatGPT's summary of settled working elements: Anthony's first-person POV; he recognizes Kevin while Kevin doesn't know the host; Anthony's desperate struggle to appear reasonable drives the comedy. Open: exact breaking point, whether Anthony reveals himself, how the call ends.
- **Standing:** ACCEPTED PROPOSAL (she did not object; consistent with "Questions I Have")
- **Source:** 19997 to 20003

### S7-107
- **Type:** Story fact (IDW)
- **Statement:** Anthony's narrative voice must be distinct from Kevin's. ChatGPT proposed Kevin's narration dramatic/suspicious/expansive; Anthony's more controlled/economical/dry, with thoughts losing composure before spoken words ("character revealed through narrative voice").
- **Standing:** UNANSWERED PROPOSAL; the "dry" part is REJECTED by Yolanda next (S7-108)
- **Source:** 19983 to 19995
- **Relationship:** REPLACED in part by S7-108 and S7-110.

### S7-108
- **Type:** Story fact (IDW)
- **Statement:** Anthony is NOT dry. "You can't mention it that anthony is dry." Not like Norm Macdonald, Bob Newhart, Larry David. He is more like Dre in Black-ish, Eddie Murphy in Trading Places, Anthony Anderson himself, Adam Sandler, Bill Murray: "a hectic comedic character."
- **Why:** The dry/deadpan label misrepresents his comic energy and would constrain his chapters.
- **Standing:** DECIDED BY YOLANDA ("He's just not 'dry'")
- **Source:** 20013 to 20017, 14:52
- **Relationship:** REPLACES the Story Bible's "dry" and deadpan description (S7-075) and ChatGPT's "dry" usage (S7-079, S7-107).

### S7-109
- **Type:** Story fact (IDW)
- **Statement:** ChatGPT's updated working characterization: "Anthony Vernon is an expressive, quick-witted, opinionated, larger-than-life comedic personality who prides himself on being cool, capable, and in control. He wants to be the man who handles his business, but his confidence, ego, and emotions can send him into spectacular comedic spirals." Both men are comedic forces; Anthony is not the straight man; both are emotional; distinction is in triggers, justifications, self-beliefs. Kevin vs Anthony table (suspicious/hypervigilant vs self-assured/image-conscious, etc.). Anthony can be funny when Kevin isn't present. Anthony's chapters' narration can be as lively as Kevin's.
- **Standing:** ACCEPTED PROPOSAL (Yolanda: "Yes! Anthony is the EPITOME of 'code switching'!" affirms and extends); labelled "not as final Story Bible canon"
- **Source:** 20033 to 20126, 20130
- **Relationship:** RESTATEMENT/expansion of S7-108.

### S7-110
- **Type:** Story fact (IDW)
- **Statement:** Anthony is "the EPITOME of 'code switching'!"
- **Standing:** DECIDED BY YOLANDA
- **Source:** 20130, 14:57

### S7-111
- **Type:** Story fact (IDW)
- **Statement:** ChatGPT expansion: Anthony has several comedic registers chosen by audience and stakes (hosting The Voice of Reason: polished/authoritative; enforcing imaginary HOA authority: procedural/self-important; with Kevin: animated/competitive/mischievous; around Miss Francine: charming/deferential but oblivious to her boundaries; when threatened: presentation slips; inside his own head: the full Anthony). Code-switching is not dishonesty; in an African American character it can involve language, cultural expectations, audiences; all registers are authentically his. His growth should NOT be abandoning code-switching; it may be no longer feeling he must always appear in control; "Because he makes room for another one." Narration may move between registers. Open question: does he code-switch deliberately or instinctively?
- **Standing:** UNANSWERED PROPOSAL (situational table, growth direction); question unanswered
- **Source:** 20142 to 20235

### S7-112
- **Type:** Story fact (IDW)
- **Statement:** When hosting The Voice of Reason, Anthony is usually "as cool as a cucumber. Almost as serene as an NPR host."
- **Standing:** DECIDED BY YOLANDA, then clarified (see S7-113)
- **Source:** 20239, 14:58
- **Relationship:** Refined by S7-113.

### S7-113
- **Type:** Story fact (IDW)
- **Statement:** Clarification: "I don't mean a true NPR replica. Just, he's cool, smooth, even-keeled on his show. Until he's not." Working understanding: "Cool, smooth, even-keeled. Until he's not." His smoothness is a genuine part of him, not pretending; both sides are Anthony. Her comparisons are for helping the AI hear him, not rigid character definitions.
- **Why:** ChatGPT took NPR too literally and built an entire broadcasting persona (serene, therapeutic, pauses, etc.).
- **Standing:** DECIDED BY YOLANDA ("I don't mean a true NPR replica")
- **Source:** 20327, 16:02; ChatGPT restatement 20335 to 20355
- **Relationship:** REPLACES ChatGPT's over-literal NPR persona (20247 to 20323). ADDS TO S7-112. Also qualifies S7-084 "performing unbothered" (ChatGPT now says smooth is not an act).

### S7-114
- **Type:** Behavior
- **Statement:** The AI must not over-literalize the author's analogies and comparisons (NPR host, Hulk, Spider-Man, named comedians) into rigid definitions. Comparisons are borrowed qualities. The AI should ask which quality she means when ambiguous.
- **Why:** Yolanda corrected NPR literalism (20327) and pre-emptively qualified Hulk/Spider-Man ("I don't mean to truly epitomize those characters to some of their qualities").
- **Standing:** DECIDED BY YOLANDA (through her corrections)
- **Source:** 20327, 20361, 20353

### S7-115
- **Type:** Story fact (IDW)
- **Statement:** MCU analogy: Anthony would be a version of Hulk (two personalities in one); Kevin would be Spider-Man. Borrowing some qualities only. ChatGPT interpretation: Anthony has two emotional gears, not two literal personalities; doesn't necessarily fear his explosive side but believes a grown man should control it. Kevin: quick-thinking but frequently overwhelmed, reactive, talks himself into/out of trouble; "Kevin's mind is constantly working, but it doesn't always work in his favor." Neither man defined by one trait; both need room to be capable, intelligent, compassionate, grounded, so their friendship is believable.
- **Standing:** DECIDED BY YOLANDA (analogy, qualified); ChatGPT interpretation UNANSWERED PROPOSAL; question (Peter Parker's wit vs stumbling into big situations) unanswered
- **Source:** 20359 to 20425, 16:05

### S7-116
- **Type:** Constraint
- **Statement:** Anthony does not dip into the "Angry Black Man" stereotype/trope.
- **Standing:** DECIDED BY YOLANDA ("Anthony doesn't dip into the 'Angry Black Man' stereotype/trope")
- **Source:** 20429, 16:07
- **Relationship:** ADDS TO S7-108/S7-110.

### S7-117
- **Type:** Principle
- **Statement:** Creative guardrail proposed: "Anthony's comedy should never depend on portraying Black male anger as inherently frightening or irrational. His frustration should emerge from his specific personality, relationships, and circumstances." He isn't dangerous when frustrated; he's funny (incredulity, theatrical exasperation, rapid-fire arguments, physical comedy). He is not always frustrated. Anthony can be genuinely right sometimes; don't make The Voice of Reason a one-note joke. ChatGPT self-corrects its language ("exploding," "dam burst") as possibly suggesting aggression. "The goal isn't to make Anthony less Black, less expressive, or less emotional."
- **Standing:** UNANSWERED PROPOSAL (guardrail consistent with S7-116; Yolanda didn't explicitly adopt the wording)
- **Source:** 20437 to 20485
- **Relationship:** ADDS TO S7-116. Note: ChatGPT's softening of "dam bursts" applies to its own language; Yolanda herself used "the dam bursts" (S7-100), so her image remains valid.

### S7-118
- **Type:** Feature
- **Statement:** The program should be able to hold character-level creative guardrails (e.g., "avoid Angry Black Man trope," "not dry," "not slapstick/demeaning") that persist and inform AI suggestions and reviews for that character.
- **Why:** These constraints were established in conversation and must not be lost in later sessions (ChatGPT's repeated reversion to "dry" shows the risk).
- **Standing:** POSSIBILITY (derived; not explicitly requested)
- **Source:** 20013, 20429, 20493, 20483

### S7-119
- **Type:** Story fact (IDW)
- **Statement:** Anthony is a physical expression of comedy in the vein of Dick Van Dyke, Martin Lawrence, Jim Carrey, David Alan Grier, Tisha Campbell. NOT like the Three Stooges or Laurel and Hardy ("leads into absurd and sometimes demeaning comedy").
- **Standing:** DECIDED BY YOLANDA
- **Source:** 20491 to 20493, 16:13
- **Relationship:** ADDS TO S7-108.

### S7-120
- **Type:** Story fact (IDW)
- **Statement:** ChatGPT synthesis: physicality grows organically from character; not pratfalls or getting hurt; contradiction between physical behavior and spoken delivery is the joke. Working principle: "Anthony Vernon's body sometimes tells the truth before his mouth is willing to admit it." Words: "I've got this." Body: "You have GOT to be kidding me." Don't make every scene physically elaborate; restraint gives big reactions somewhere to go. "Anthony's physical comedy comes from personality, expression, and timing, not humiliation or buffoonery." He can be intelligent, capable, attractive, dignified, occasionally the smartest in the room.
- **Standing:** UNANSWERED PROPOSAL (working principle; she moved on without objection)
- **Source:** 20501 to 20595

### S7-121
- **Type:** Principle
- **Statement:** Craft constraint: "You're writing prose, not a television sitcom or screenplay." Physical comedy must survive translation to the page; in first person Anthony can't see his own face but can describe actions and lengths he goes to. Avoid prose that reads like stage directions.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** 20533 to 20561

### S7-122
- **Type:** Example / Illustration
- **Statement:** Illustration labelled "not proposed manuscript dialogue": "I eased away from the microphone. / Stood up. / Walked halfway across the room. / Came back. / 'I appreciate your perspective, sir.'"
- **Standing:** EXAMPLE / ILLUSTRATION
- **Source:** 20547 to 20557

### S7-123
- **Type:** Behavior
- **Statement:** ChatGPT gently challenged her dismissal of Laurel and Hardy (their comedy can be sophisticated; Dick Van Dyke also did slapstick); "The distinction is what the physical comedy asks us to laugh at." Demonstrates the AI may respectfully disagree with the author while honoring her intent.
- **Standing:** UNANSWERED PROPOSAL (she did not respond to the challenge)
- **Source:** 20563 to 20577
- **Relationship:** Does not override S7-119; her "not like" stands.

### S7-124
- **Type:** Process
- **Statement:** "Weiland Arc" is the Story Bible's name for Lie, Ghost, Want, Need. Yolanda says enough is known to figure out Anthony's Weiland Arc.
- **Standing:** DECIDED BY YOLANDA
- **Source:** 20599, 16:52
- **Relationship:** possibly relates to an earlier decision (Story Bible terminology).

### S7-125
- **Type:** Story fact (IDW)
- **Statement:** Story Bible rule: Anthony's Lie should be the mirror image of Kevin's, "so the two men are broken in complementary ways and heal each other."
- **Standing:** DECIDED BY YOLANDA (Story Bible, cited by her)
- **Source:** 20601

### S7-126
- **Type:** Process
- **Statement:** Pair-reading / name-swap test: write Anthony's Lie in one sentence, then beneath it write Kevin's Lie, so she can read them as a pair. If you can swap the names and nothing changes, the characters are not foils, they are doubles. "We should push until Anthony's mind pull[s] in the opposite direction of Kevin's."
- **Why:** Ensures foils, not doubles.
- **Standing:** DECIDED BY YOLANDA
- **Source:** 20603, 16:52
- **Relationship:** Could become a program feature (S7-127).

### S7-127
- **Type:** Feature
- **Statement:** The program should support a paired comparison view of two characters' arc statements (e.g., Lies stacked one above the other) with the name-swap test, to check foil vs double.
- **Why:** Directly derived from her stated working method.
- **Standing:** POSSIBILITY (derived; she described the method, not a feature)
- **Source:** 20603, 20783 to 20788

### S7-128
- **Type:** Data model
- **Statement:** Definitions Yolanda gave (craft vocabulary to store/teach): "A foil is a character whose contrast makes another character's traits visible. A mirror is often the same idea, but a little looser: two people alike in situation but different in choice. A double is the opposite emphasis: a double shows how alike two people are; a foil shows how different."
- **Standing:** DECIDED BY YOLANDA
- **Source:** 20605 to 20609
- **Relationship:** Note tension: the Story Bible says "mirror image" Lies, while her test pushes toward foil (opposite direction). UNCLEAR whether "mirror image" in the Bible means "foil" in her definitions; her instruction "push until Anthony's mind pulls in the opposite direction" indicates foil.

### S7-129
- **Type:** Story fact (IDW)
- **Statement:** ChatGPT's first proposed Anthony Lie: "A man who has everything under control never has to admit he doesn't have all the answers." Then its preferred alternative: "If I can't handle my business and keep my composure, people will stop respecting me as a man."
- **Standing:** UNANSWERED PROPOSAL (Yolanda did not approve; she instead flagged the Kevin error)
- **Source:** 20651 to 20706, 20929

### S7-130
- **Type:** Story fact (IDW)
- **Statement:** ChatGPT's proposed Kevin Lie in this pass: "If I don't stay on guard, somebody will catch me off guard and make a fool of me" described as "a refinement of the illustrative version in the Story Bible."
- **Standing:** REJECTED (Yolanda objected that Kevin's Lie had already been developed on Oct 14; ChatGPT admitted it used the wrong version)
- **Source:** 20655, 20671, 20785, 20932
- **Relationship:** DIFFERENT SUBJECT/older version; REPLACED by S7-134 (the Oct 14 archive version).

### S7-131
- **Type:** Story fact (IDW)
- **Statement:** ChatGPT's proposed Anthony Ghost: "Something taught Anthony that a man earns respect by being capable, dependable, and in control, regardless of what he may be feeling inside." Don't invent a traumatic childhood or emotionally unavailable father merely to fill the slot. Possibilities: learned through admiration; a moment of inadequacy; praise for always handling things; "What if Anthony's Lie grew from something that was once a genuine strength?" (confused being capable with never being allowed to be incapable). Ghost is weakest element; should reveal something we couldn't guess; needn't be tragic, must be personal and convincing.
- **Standing:** UNANSWERED PROPOSAL / POSSIBILITY
- **Source:** 20708 to 20735, 20900 to 20920

### S7-132
- **Type:** Story fact (IDW)
- **Statement:** ChatGPT's proposed Anthony Want: defeat Kevin, establish himself as the neighborhood's rightful authority, prove he knows how things ought to be handled; HOA behavior and The Voice of Reason are expressions of the same desire. Refinement needed: distinguish concrete story goal from broader ambition; exact win condition of the feud remains open (Ingermanson goal vs ambition distinction).
- **Standing:** UNANSWERED PROPOSAL
- **Source:** 20737 to 20758

### S7-133
- **Type:** Story fact (IDW)
- **Statement:** ChatGPT's proposed Anthony Need: "understand that admitting uncertainty, accepting help, and sharing authority do not diminish his worth or his masculinity." He does not need to stop being confident, charismatic, opinionated, or believing he handles his business; "a capable man doesn't require him to be an infallible one." Also: Kevin may be struggling not to become the man he used to be; Anthony may still believe the man he's always tried to be is exactly right; they challenge each other at different stages of self-understanding. Demanding foil test: they must make genuinely different choices when confronted with the same problem. Podcast scene as test of Anthony's Lie: physical comedy is "evidence that the behavior demanded by his Lie is becoming impossible to sustain."
- **Standing:** UNANSWERED PROPOSAL (labelled "proposed character-development framework, not an approved revision")
- **Source:** 20760 to 20775, 20790 to 20956

### S7-134
- **Type:** Story fact (IDW)
- **Statement:** October 14 Character Breakthrough Archive (`I_Declare_War_Character_Breakthrough_Archive_2026-10-14.pdf/.docx`) Kevin Weiland Arc: GHOST: lost his job years ago; insecurity affected marriage and family, nearly costing him wife and children; agreed to individual therapy and couples counseling. LIE: "If I let my guard down, I could lose everything again." Alternative LIE: "If I am not in control, everything I have worked for can be taken away." WANT: defeat Anthony, prove he is right, obtain respect and vindication. NEED: trust the personal work he has already done, recognize vulnerability or being wrong doesn't diminish his dignity, build connections outside his household. POSSIBLE TRUTH: "I can lose control of a situation without losing my worth or the people who love me." Archive records these as developing formulations, not one final canon Lie, but they supersede the Story Bible's illustrative version.
- **Standing:** DECIDED BY YOLANDA as the current working version ("I thought we'd defined his (Kevin's) lie and all of that yesterday"; "no I KNOW"); individual wordings remain developing (two Lie formulations coexist)
- **Source:** 20960, 21016 to 21034
- **Relationship:** REPLACES the Story Bible's illustrative Kevin Lie and ChatGPT's S7-130. Two Lie formulations are ALTERNATIVE TO each other (both alive).

### S7-135
- **Type:** Story fact (IDW)
- **Statement:** Kevin's therapy and marriage counseling represent growth that happened before the novel begins. His present struggle may be applying a lesson he already knows when an old vulnerability is triggered, not learning it for the first time. Kevin is afraid of losing what he has; Anthony may be afraid of being exposed as less capable than a man should be.
- **Standing:** ACCEPTED PROPOSAL (ChatGPT restating Oct 14 nuance; she said "Please do so" to proceeding on this basis)
- **Source:** 21052 to 21074
- **Relationship:** RESTATEMENT of Oct 14 work (ADDS TO S7-045).

### S7-136
- **Type:** Scenario
- **Statement:** Real failure scenario (acceptance test): The AI, while developing Anthony, reverted to the older Story Bible's illustrative Kevin Lie instead of the newer Oct 14 Character Breakthrough Archive, even though the archive was created specifically to preserve those discoveries. Yolanda had to remind it ("You shouldn't have had to remind me that we had already done this work"). The program must prevent this: newer author-developed character work must outrank older illustrative bible text when the AI reasons about a character, and the AI must check the latest decisions/archives before proposing.
- **Why:** Preserving discoveries was "the whole reason we created the archive."
- **Standing:** DECIDED BY YOLANDA (her objection, 20960)
- **Source:** 20960, 21008 to 21012, 21076
- **Relationship:** ADDS TO S7-068 (Scenario F), S7-038 (provenance), S7-009 (source hierarchy).

### S7-137
- **Type:** Principle
- **Statement:** Working source hierarchy for character analysis: (1) Yolanda's latest explicit character decisions; (2) the October 14 Character Breakthrough Archive, with its established-versus-exploratory distinctions preserved; (3) the October 13 Story Bible for existing story foundations and framework guidance.
- **Standing:** ACCEPTED PROPOSAL (she replied "Please do so" at 21090 to developing Anthony against the Oct 14 Kevin on this basis)
- **Source:** 21080 to 21086, 21090
- **Relationship:** ADDS TO / refines S7-009 (inserts the archive above the Story Bible).

### S7-138
- **Type:** Process
- **Statement:** Develop Anthony's Weiland Arc against the Kevin discovered on October 14, not the older Story Bible version.
- **Standing:** DECIDED BY YOLANDA ("Please do so")
- **Source:** 21090, 17:00
- **Relationship:** Work continues past END line.

### S7-139
- **Type:** Feature
- **Statement:** The program must be able to locate and surface previously created session archives/documents (e.g., "Character Breakthrough Archive") when the author says "I KNOW you made a downloadable document." Session artifacts must be findable by the AI and by search.
- **Why:** She remembered the archive; the AI didn't use it.
- **Standing:** POSSIBILITY (derived from the failure; aligns with S7-053, S7-067)
- **Source:** 20960, 20965 to 20990

### S7-140
- **Type:** Story fact (IDW)
- **Statement:** ChatGPT's method note for Anthony: work backward from observed behavior to the Lie: "What does Anthony falsely believe he must do to be worthy?" Observations list: expressive, physically comedic, quick-witted, extraordinarily good at code-switching; smooth and even-keeled on The Voice of Reason yet hilariously exasperated when challenged; believes a man ought to handle his business; not macho; comedy doesn't depend on aggression or humiliation.
- **Standing:** UNANSWERED PROPOSAL (continues past section end)
- **Source:** 21100 to 21108 (just past END, for context)

### S7-141
- **Type:** Story fact (IDW)
- **Statement:** Kevin's characterization in this section: suspicious, hypervigilant; reacts to perceived threats; imagination runs away with him; indignant when dismissed; wants to be taken seriously; comedy from interpreting ordinary events as extraordinary threats; "His response to not being heard is to create a platform where he can be heard MORE." Kevin's narration: dramatic, suspicious, expansive.
- **Standing:** UNANSWERED PROPOSAL (ChatGPT characterization, consistent with Yolanda's dialogue)
- **Source:** 19492, 19985, 20053 to 20060

### S7-142
- **Type:** Story fact (IDW)
- **Statement:** "Miss Francine is quietly running circles around both of them"/"the one actually running the operation." Francine must not become merely a vehicle for Anthony's transformation.
- **Standing:** UNANSWERED PROPOSAL (ChatGPT riff; Francine's role is possibly from earlier decisions)
- **Source:** 18971, 19027, 19154

### S7-143
- **Type:** Story fact (IDW)
- **Statement:** Anthony's Ghost, central Lie, Need, and precise emotional transformation remain to be determined (open) as of this section.
- **Standing:** DECIDED BY YOLANDA (she declined canonizing; still open)
- **Source:** 18951, 19005, 20936

### S7-144
- **Type:** Behavior
- **Statement:** AI collaborator labels its output's status inline in conversation: "proposed revision, not yet approved canon," "Working character insight, not canon," "Just playing with their voices here, not establishing manuscript dialogue," "tiny illustration, not proposed manuscript dialogue," "author-created dialogue worth preserving," "possibilities, not decisions." The program's AI should do the same and the system should record these labels as statuses.
- **Standing:** UNANSWERED PROPOSAL (pattern ChatGPT followed; consistent with S7-036)
- **Source:** 18924, 19146, 19252, 19448, 19554, 20547, 20790

### S7-145
- **Type:** Behavior
- **Statement:** The AI should ask the author one focused question at the end of an exploration when it would unlock insight (e.g., "Is Anthony genuinely arrogant, or does he need everyone to THINK he knows better?"), and accept "I need to think about that" without pressing.
- **Standing:** UNANSWERED PROPOSAL (pattern; matches S7-050)
- **Source:** 18985 to 18997, 19376, 19949, 20233, 20423

### S7-146
- **Type:** Story fact (IDW)
- **Statement:** ChatGPT question "Is Anthony genuinely arrogant/entitled, or a man who needs everybody to THINK he knows better because something taught him being ordinary wasn't enough?" Yolanda's answer (14:09) leans toward the inner-anxiety reading (freaking out inside, plays it cool), not pure entitlement.
- **Standing:** DECIDED BY YOLANDA (answer via S7-083)
- **Source:** 18987, 19007

### S7-147
- **Type:** Process
- **Statement:** Work habit evidence: Yolanda composes via voice-to-text (typos and transcription artifacts such as "Voicd," "chaptet," "anthony's law" for "Anthony's Lie," "She has to appear cool" for "He," "Bad, I see him" for "But"). The program and AI must interpret intent through such errors without treating them literally.
- **Standing:** POSSIBILITY (inferred from text; consistent with earlier-known voice-to-text habit)
- **Source:** 19160, 19766, 19957, 20603

### S7-148
- **Type:** Process
- **Statement:** Work habit: she thinks associatively and by performance, hearing characters' voices and visualizing physical behavior (pant leg, shirt, voice cracking), generating dialogue spontaneously in rapid bursts, and using pop-culture comparisons (Scandal, Black-ish, MCU, comedians) to communicate character. The program should capture these bursts with timestamps and link them to the characters and scene.
- **Standing:** POSSIBILITY (derived)
- **Source:** 19007, 19160, 19382, 19454, 19764, 20015, 20359, 20491

### S7-149
- **Type:** Story fact (IDW)
- **Statement:** Neither man should be defined by a single trait; both must have room to be capable, intelligent, compassionate, and grounded, and both can be right or ridiculous at different times ("sometimes they're both making excellent points while behaving like complete fools") so the friendship is believable.
- **Standing:** UNANSWERED PROPOSAL
- **Source:** 20415 to 20419, 20465 to 20477

### S7-150
- **Type:** Not wanted
- **Statement:** The AI must not repeatedly revert to a superseded characterization (ChatGPT kept using "dry," "cool vs hot," "straight man") after the author has corrected it. "I won't reduce him to the straight man again." "We shouldn't allow the original Story Bible's word dry to restrict Anthony's personality or the way his chapters are written."
- **Standing:** DECIDED BY YOLANDA (via correction at 20013; ChatGPT committed)
- **Source:** 20013, 20120 to 20126
- **Relationship:** ADDS TO S7-108, S7-136.

---

## Open questions in this section

1. Does Kevin discover during the call that he is arguing with Anthony, or hang up furious and discover later? (19376; unanswered)
2. When Anthony loses composure, does he reveal he knows Kevin, or say something so outrageous his audience questions him? (19949; Yolanda: "I need to think about that.")
3. What exactly causes "the dam" to burst? (19827; open)
4. Does Anthony recognize Kevin immediately (Yolanda's version) or gradually (ChatGPT's proposal)? (19160 vs 19288)
5. What does Kevin actually want from the call (advice, validation, audience)? (19656)
6. Does Kevin ever buy equipment / start "The True Voices of Reason"? (19554)
7. Where did Anthony learn a man must always have it together (Ghost)? Explicit teaching vs observed model vs praised strength? (19134, 20708 to 20735)
8. Is Anthony's code-switching deliberate or instinctive? (20233)
9. Spider-Man comparison: Peter Parker's rapid-fire wit, or his stumbling into bigger situations, or both? (20423)
10. Anthony's final Lie wording, Need, and concrete external goal / feud win condition (20758; 20936).
11. Does the podcast become part of the ending? ChatGPT says "not yet structurally earned." (19694 to 19702)
12. Which Kevin Lie formulation is final ("let my guard down... lose everything again" vs "not in control... taken away")? (21020 to 21025)
13. When will the Story Bible's Anthony entry be rewritten? ("We will come to it though.")
14. Does "mirror image" in the Story Bible conflict with her foil definition? (20601 vs 20605 to 20609)
15. Is the notebook gag being reassigned to Anthony, or dropped? (18653; not decided in this section)
16. The full spec's §5.1 onward and Human Vision §4 to §6 were truncated in the printout: their contents (e.g., detail of "Questions I Have" and "Things & Ideas I'm Thinking About") are not verifiable here.

## Unclear items

- **S7-093:** "I don't know who gave you this microphone, but they need to come get it" was ChatGPT's illustration, but Yolanda wrote "After kevin says that somebody needs to come gett the microphone, he'd add...", treating it as Kevin's line. Probably adopted, but not explicitly.
- **S7-088 vs S7-087:** gradual recognition (ChatGPT) vs Anthony "will know it is Kevin" (Yolanda). Both could coexist (he knows by the time he argues), but timing is unresolved.
- **S7-084 vs S7-113:** "performing unbothered" (ChatGPT, 19033) vs "Anthony doesn't have to be pretending when he's smooth... Neither version is an act" (ChatGPT, 20349, after her NPR clarification). Yolanda's own words support both ("got to play it cool" and "cool, smooth, even-keeled... until he's not"). Unclear whether "performing" survives.
- **"Dam bursts":** Yolanda's image (19766). ChatGPT later softened its own "exploding/dam burst" language over the trope concern (20441). Yolanda never withdrew her phrase; it remains her decision.
- **S7-062:** "Don't import a previous project-management product's name or visual metaphor" refers to something earlier, not identified in this section.
- **S7-128:** Story Bible "mirror image" Lies vs Yolanda's foil/double definitions and her instruction to push toward opposite directions.
- **Spec status overall:** Yolanda's only response to the spec + brief was the "human touch" complaint before the brief existed; she never confirmed the brief was satisfactory.

## Items ChatGPT dropped or distorted when restating

- **Anthony as "dry":** ChatGPT's proposed Story Bible rewrite (18931 "Dry, confident, and maddeningly composed") and narrative-voice proposal (19985 "controlled, economical, and dry") carried forward the very bible word Yolanda had just said was no longer accurate (18816). She had to correct it explicitly (20013).
- **NPR over-literalism:** ChatGPT built a full "therapeutic," "serene" broadcasting persona from a passing comparison (20247 to 20323); she corrected (20327).
- **Kevin's Lie:** ChatGPT used a refinement of the Story Bible's illustrative Lie ("If I don't stay on guard, somebody will catch me off guard and make a fool of me") instead of the Oct 14 archive's "If I let my guard down, I could lose everything again" (20655 vs 21020), dropping the therapy/pre-novel growth nuance. ChatGPT admitted the error (21008, 21076).
- **Kevin's Want/Need in the 20783 table** differ from the archive (archive Need includes "trust the personal work he has already done" and "build connections outside his household"; the table dropped both).
- **Human Vision §2 attribution:** says "The assistant riffed on Kevin's response" for the Dr. Fingleburger reply and "The assistant also imagined Kevin with a notebook"; correct, but the brief calls the HOA/podcast items "discovered" jointly, while the podcast and title were Yolanda's ideas ("the author exclaimed").
- **Spec "Target":** restates Oct 17 as "not evidence of readiness or a guarantee," a ChatGPT hedge not from Yolanda.
- **Brief §1 "panther at heart"** likely a transcription of "pantser"; preserved as written.
- **"Straight man" framing:** ChatGPT's critique (19676 to 19690) said Anthony had "become the man who sits there" when she had simply not shown that part yet; ChatGPT then retracted ("I would no longer describe Anthony as underdeveloped within your conception").
- **Story Bible elements not restated:** ChatGPT's comparison table kept "Second co-lead" and "Buddy Love" unchanged; these remain valid and were not cancelled by later discussion.
- **Structural elements mentioned only in passing:** "Francine's garden, the ledger, and the men's transformation" (19698) are cited as carrying structural responsibility; they are not developed in this section but must not be lost.
