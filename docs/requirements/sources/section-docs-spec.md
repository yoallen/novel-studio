# Requirements Register: Phase 2 Specification, Human Vision Brief, and Review Packet

Product: unnamed novel-planning and writing program (the name "StoryForge" is rejected). It must work for any novel in any genre. *I Declare War* (IDW) is the first story and the test case.

## How to read this register

**Sources**
- **SP-** = `Phase_2_Full_Product_Specification_for_Claude.docx.txt` (168 lines). Cited as "SP Lnn".
- **HV-** = `Phase_2_Human_Vision_for_Claude.docx.txt` (53 lines). Cited as "HV Lnn".
- **PK-** = items found only in the review packet zip `50f063c4-Phase_2_Claude_Review_Packet_WITH_HUMAN_VISION.zip`. The zip was unpacked to `scratchpad/packet/`. Cited as "PK <file> Lnn".

**Standing**
- **CHATGPT SPEC**: stated in the specification, which ChatGPT wrote.
- **CHATGPT VISION BRIEF**: stated in the Human Vision brief, which ChatGPT wrote.
- **CHATGPT REVIEW PACKET**: stated in the packet's start-here note.
- **QUOTES YOLANDA**: the document attributes the quoted words directly to Yolanda. Even these quotes reach us through ChatGPT. Yolanda's own conversations remain the higher source; the spec itself ranks "explicit author decisions in discussions" first (SP L10).
- **FLAG**: wording that looks weakened, narrowed, hedged, MVP-style, internally inconsistent, or possibly distorted. Check each one against what Yolanda actually decided.

**Types**: Feature / Behavior / Principle / UI-UX / Data model / Acceptance test / Scenario / Constraint / Not wanted.

## Packet inventory and fidelity check (PK)

The zip holds seven files:
- `CLAUDE_REVIEW_START_HERE_UPDATED.txt`
- `PHASE2_FULL_SPEC.md` and `Phase_2_Full_Product_Specification_for_Claude.docx`
- `PHASE2_HUMAN_VISION_AND_CREATIVE_WORKFLOWS.md` and `Phase_2_Human_Vision_for_Claude.docx`
- two PDFs, which are renderings of the same two documents

The packet .docx files were converted with python-docx and compared with the two source .txt files after normalizing whitespace and markup. So were the packet .md files. **All copies match the source text word for word.** The only new content is the start-here note (PK-001 to PK-010).

`StoryForge_Phase2_Development_Build.zip`, the prototype, is **not** in the packet. The note says the owner will share it separately.

## Cross-document flags (summary)

| # | Flag | Where |
|---|---|---|
| F1 | **No "midpoint trust test" is named anywhere in the documents.** The closest items are the midpoint-revision ripple scenario (SP L96), AC05 (keep the Midpoint undecided), AC10 (change a midpoint event), and Scenario H (do not gate writing behind "resolve the midpoint"). If Yolanda defined a midpoint trust test in conversation, ChatGPT dropped it. | SP L96, L118, L123; HV L47 |
| F2 | The spec describes a **local Python HTTP service with a browser UI** (SP L11, L110, L135). It never says "desktop application." AC20 asks for a Windows launch. The form factor needs confirming against Yolanda's own decision. | SP L11, L110, L133 |
| F3 | Hedges that may weaken requirements: "as far as technically feasible" (import), "scroll/cursor if technically feasible", "where possible" (provenance), "e.g., DOCX or another standard format", "basic find/search", "auto-save **or** deliberate save", "Save the full conversation (**or** reliably export and reimport it)", "controlled, opt-in prose brainstorming". | SP L46, L56, L87, L90, L99, L106; HV L19 |
| F4 | The deadline is softened: "This is the owner's target, not evidence of readiness or a guarantee." The vision brief uses past tense: "intended to finish", "target **was**". | SP L6; HV L33 |
| F5 | The Phase 3 deferral also defers the "full planned multi-book Story Universe expansion." This may narrow multi-book support. | SP L19 |
| F6 | The spec says the IDW single narrator per scene "**may be** a hard integrity rule" (SP L81). AC07 says "enforce" (SP L120), and Appendix A says one viewpoint "per scene/chapter" (SP L146). These are inconsistent in both strength and unit. | SP L81, L120, L146 |
| F7 | Mama Dorothy and "previous project-management product" are mentioned as things **not** to copy. Mama Dorothy is Yolanda's own assistant program, not a PM product. Confirm this restatement reflects her actual wish. | SP L104; HV L38 |
| F8 | The low-friction session actions are called "illustrative interface labels", and the doc says only the capabilities matter. Implementers may use this to drop them. | HV L17 |
| F9 | Several frameworks and arc structures are written "as contemplated" or "should". Example: Francine's dual arc. These are not decisions. | SP L64 |
| F10 | AC19 tests "a person unfamiliar with the code," not Yolanda's own use. | SP L132 |
| F11 | The vision brief adds details that are missing from the spec: Kevin "fears being diminished and blindsided"; Kevin "can still relapse into familiar habits when provoked"; Anthony "ignores boundaries others set, particularly Francine's"; "she emphatically asked that the entire conversation be preserved"; the session harvest and session record. The spec never names a conversation/session entity in its entity model (SP L40). | HV L11-14, L17-19; SP L40 |
| F12 | The source hierarchy puts "explicit author decisions in discussions" above everything (SP L10), but those discussions are not in the packet. This register therefore cannot confirm author decisions independently. | SP L10 |

---

## A. Specification (SP)

### A1. Document frame, naming, schedule, review mandate

| ID | Type | Statement | Why | Standing | Source |
|---|---|---|---|---|---|
| SP-001 | Constraint | Working name is UNNAMED. The previously used name "StoryForge" is rejected by the author; do not treat it as the product name. The name remains to be chosen by the author. | Author rejected the name. | CHATGPT SPEC (reports author's rejection) | SP L4, L143 |
| SP-002 | Constraint | Author / product owner: Yolanda Allen. | Ownership and authority. | CHATGPT SPEC | SP L5 |
| SP-003 | Constraint | Target: fully functioning and tested Phase 2 by Saturday, October 17, 2026. | Planning done by Oct 31; drafting starts Nov 1. | CHATGPT SPEC. FLAG: hedged with "This is the owner's target, not evidence of readiness or a guarantee." | SP L6, L138 |
| SP-004 | Principle | Core mandate: "Help me get the story out of my head, develop it without losing track of decisions, and WRITE THE DAMN STORY." | The program's reason to exist. | QUOTES YOLANDA (first-person mandate; "WRITE THE DAMN STORY" is attributed to her again in HV L7) | SP L7 |
| SP-005 | Principle | The document is the intended full scope of Phase 2. It is not a description of what the initial ZIP does, not a minimum viable product, and not an invitation to trim the project to a basic CRUD app. | Prevents downscoping. | CHATGPT SPEC | SP L9 |
| SP-006 | Constraint | Claude must not silently redefine Phase 2 downward to match what happens to be implemented. Claude must not delete or redefine any agreed Phase 2 feature because of schedule pressure. | Author rejected MVP shrinkage. | CHATGPT SPEC | SP L9, L136 |
| SP-007 | Constraint | Review method: compare the actual software to this contract, run its tests, exercise real author workflows, find hidden failure modes, and report evidence. | Independent verification. | CHATGPT SPEC | SP L9 |
| SP-008 | Principle | Source hierarchy: (1) explicit author decisions in discussions; (2) Oct 13, 2026 IDW Story Bible v5 and the later character-development conversation; (3) agreed design principles from the current discussion; (4) engineering recommendations marked as such. | Resolves conflicts. | CHATGPT SPEC. FLAG F12: tier (1) sources are not supplied. | SP L10 |
| SP-009 | Principle | The story bible separates teaching, demonstration, and decisions. A demonstrated possibility is not canon. | Protects canon. | CHATGPT SPEC | SP L10 |
| SP-010 | Constraint | Known baseline artifact `StoryForge_Phase2_Development_Build.zip` contains `app/server.py`, `app/static/index.html`, `tests/test_core.py`, and startup docs. It is a local Python standard-library web app on SQLite. It has rudimentary projects/items/links/history/recommendations, an initial 15-beat schema, a graph-neighborhood "ripple" endpoint, JSON backup/import, and some drafting/export. The README says it is incomplete and has no external AI API. This is the baseline to inspect, not the definition of completion. | Sets the review baseline. | CHATGPT SPEC. FLAG F2: web app, not stated as desktop. | SP L11, L135 |
| SP-011 | Constraint | Names and claims in earlier assistant summaries are not proof that a feature works. Verify against executable code and behavior. Do not trust earlier "working" status tables without reproduction. | Earlier summaries overclaimed. | CHATGPT SPEC | SP L11, L136 |

### A2. Purpose, user, philosophy

| ID | Type | Statement | Why | Standing | Source |
|---|---|---|---|---|---|
| SP-012 | Feature | A local-first intelligent novelist's workspace spanning inspiration, analysis, planning, drafting, revision, and recovery of creative context. | Whole-lifecycle tool. | CHATGPT SPEC | SP L13 |
| SP-013 | Principle | Primary user: a prolific, nonlinear, iterative novelist who connects ideas associatively, often jumps between projects, and can freeze under too much planning. | Drives design. | CHATGPT SPEC | SP L13 |
| SP-014 | Not wanted | The app should not resemble a rigid project-management database or an administrative intake form. | Causes freezing. | CHATGPT SPEC | SP L13 |
| SP-015 | Principle | Powerful under the hood and welcoming in daily use. | Balance depth with ease. | CHATGPT SPEC | SP L13 |
| SP-016 | Behavior | (a) Capture thoughts as quickly as they arrive. | Ideas are lost otherwise. | CHATGPT SPEC | SP L14 |
| SP-017 | Behavior | (b) Turn thoughts into usable story knowledge only when the author chooses. | Author controls structure. | CHATGPT SPEC | SP L14 |
| SP-018 | Behavior | (c) Maintain stable, searchable continuity across the entire novel. | Continuity trust. | CHATGPT SPEC | SP L14 |
| SP-019 | Principle | (d) Apply writing frameworks as lenses, not rigid hoops. | Avoid railroading. | CHATGPT SPEC | SP L14 |
| SP-020 | Feature | (e) Show relationships and ripple effects. | Change awareness. | CHATGPT SPEC | SP L14 |
| SP-021 | Behavior | (f) Help the author return to the exact story context after a detour. | Associative working style. | CHATGPT SPEC | SP L14 |
| SP-022 | Principle | (g) Allow and prioritize prose drafting from day one. | Writing is the goal. | CHATGPT SPEC | SP L14 |
| SP-023 | Constraint | Support multiple books and genres. Do not hard-code it as *I Declare War* software. | Must serve any novel. | CHATGPT SPEC | SP L14 |
| SP-024 | Principle | The author retains creative authority. The tool can point out issues, ask incisive questions, offer analysis, and propose options. It may not silently declare, revise, resolve, or overwrite narrative canon. | Author sovereignty. | CHATGPT SPEC | SP L15 |
| SP-025 | Principle | An AI suggestion is not a fact. An illustration is not a fact. An example in a craft book or story bible is not a fact. | Canon integrity. | CHATGPT SPEC | SP L15 |
| SP-026 | Acceptance test | Behavioral success: the author can sit down with a half-formed idea, record it without deciding where it belongs, get relevant guidance without being railroaded, connect it to a character or scene if desired, and immediately resume writing. | Success is behavioral, not field counts. | CHATGPT SPEC | SP L17 |
| SP-027 | Principle | A sophisticated character-development module that delays drafting is a failure, even if it has hundreds of fields. | Writing comes first. | CHATGPT SPEC | SP L17 |
| SP-028 | Not wanted | Not in Phase 2 (deferred to Phase 3): professional poster publishing, generative illustrated wall posters, large-format print preflight, sophisticated image-based visual story maps, and the full planned multi-book Story Universe expansion. Do not quietly pull this back into Phase 2. Do not substitute poster development for application readiness. | Deliberate phasing by owner. | CHATGPT SPEC. FLAG F5: Story Universe deferral may narrow multi-book support. | SP L19, L93, L138, L141 |
| SP-029 | Constraint | Phase 2 must have usable on-screen navigation, connections, outlines, hierarchies, dependency views, and Narrative Zoom. The missing future visualization engine is not permission to omit narrative-navigation functionality. | Prevents misuse of the deferral. | CHATGPT SPEC | SP L19 |

### A3. Scope map: core Phase 2 domains (all in scope, integrated as one system)

| ID | Type | Statement | Why | Standing | Source |
|---|---|---|---|---|---|
| SP-030 | Principle | All domains must be integrated as one system, not as disconnected screens. Completeness is judged on integrated workflows, not on the existence of data fields. | Real workflows cross domains. | CHATGPT SPEC | SP L21, L37 |
| SP-031 | Feature | Multi-project library for novels and other fiction, with adaptable genre, form, and framework settings. | Any novel, any genre. | CHATGPT SPEC | SP L22 |
| SP-032 | Feature | **Story Brain**: structured story knowledge, provenance, author-approved canon, status and uncertainty, searchable notes, interconnected entities. | Trustworthy knowledge system. | CHATGPT SPEC | SP L23 |
| SP-033 | Feature | Quick capture with dedicated *Questions I Have* and *Things & Ideas I'm Thinking About*, plus return-to-context tools. | Capture first. | CHATGPT SPEC | SP L24 |
| SP-034 | Feature | Deep character development: identity, agency, values, goal vs ambition, conflict, epiphany, Lie/Ghost/Want/Need, flat/positive/negative arc, three-level antagonism, relationships, contrasting voices, contradictions, integrity. | Character depth. | CHATGPT SPEC | SP L25 |
| SP-035 | Feature | Story spine and narrative design: premise, controlling/moral idea, dramatic question, logline, synopsis, A/B plots and emotional arcs, acts, sequences, beats, scenes, chapters, and explicit unknowns. | Structure support. | CHATGPT SPEC | SP L26 |
| SP-036 | Feature | Framework-aware analysis: Snyder/Save the Cat and Jessica Brody's novel percentages; McKee's value, gap, negation of the negation, escalating antagonism, progressive complications; Weiland's arcs and structure; Ingermanson's Snowflake and value/ambition/goal analysis; cross-framework equivalence without pretending every schema matches perfectly. | Craft lenses. | CHATGPT SPEC | SP L27 |
| SP-037 | Feature | Scene and sequence engineering: POV, what a character expects vs what occurs, inciting disturbance, goal, opposition, turning point, disaster, reaction, dilemma, decision, sequel, value charge and change, setup/payoff, stakes, pacing, causality. | Scene craft. | CHATGPT SPEC | SP L28 |
| SP-038 | Feature | Practical manuscript drafting studio: per-scene or per-chapter prose, order and assembly, autosave/recovery, word counts, revision history, focused writing, exports. | Writing. | CHATGPT SPEC | SP L29 |
| SP-039 | Feature | **Narrative Zoom** and navigation from book -> plotline/act -> sequence -> beat -> scene -> manuscript text and back, preserving context across jumps. | Big picture to detail. | CHATGPT SPEC | SP L30 |
| SP-040 | Feature | Continuity tracking; clue/reveal/misdirection tracking; timelines; in-world chronology; character knowledge by POV; locations; objects; worldbuilding; payoff audits. | Integrity of the story world. | CHATGPT SPEC | SP L31 |
| SP-041 | Feature | Relationships and change-impact/ripple effects: identify related records and possible contradictions, explain why they are affected, and request review rather than rewriting them. | Safe change. | CHATGPT SPEC | SP L32 |
| SP-042 | Feature | AI collaboration: source-grounded analysis and creative suggestions, uncertainty labels, review-before-apply, user-directed tone/mode, no invented canon, no automatic manuscript rewriting. | Partner, not hijacker. | CHATGPT SPEC | SP L33 |
| SP-043 | Feature | Search, retrieval, imports, backups, restores, history, and portability that let the user trust the system and leave it without losing data. | Trust and ownership. | CHATGPT SPEC | SP L34 |
| SP-044 | Feature | A deliberate daily author experience: visible progress on project-specific milestones, interrupted-work recovery, low-friction route back to prose. | Daily use. | CHATGPT SPEC | SP L35 |
| SP-045 | Constraint | Quality, security, privacy, and maintainability suited to a local-first creative-writing tool, with tests and independent review. | Reliability. | CHATGPT SPEC | SP L36 |

### A4. Information architecture and the Story Brain

| ID | Type | Statement | Why | Standing | Source |
|---|---|---|---|---|---|
| SP-046 | Data model | Entity: novels/projects; works/versions. | Multi-project, versioned. | CHATGPT SPEC | SP L40 |
| SP-047 | Data model | Entity: story spine; themes/controlling ideas. | Story spine. | CHATGPT SPEC | SP L40 |
| SP-048 | Data model | Entity: plotlines; subplots and emotional arcs. | A/B plots, arcs. | CHATGPT SPEC | SP L40 |
| SP-049 | Data model | Entity: characters; relationships; desires/wants/needs; Ghosts and Lies; values, stakes, and antagonistic forces. | Character depth. | CHATGPT SPEC | SP L40 |
| SP-050 | Data model | Entity: acts, sequences, beats, scenes, chapters, prose fragments. | Editorial hierarchy. | CHATGPT SPEC | SP L40 |
| SP-051 | Data model | Entity: events and chronology; places/settings. | Timeline and setting. | CHATGPT SPEC | SP L40 |
| SP-052 | Data model | Entity: objects, clues, red herrings, secrets, reveals, payoffs; continuity rules. | Misdirection and continuity. | CHATGPT SPEC | SP L40 |
| SP-053 | Data model | Entity: research; ideas; questions; decisions; source documents. | Capture and provenance. | CHATGPT SPEC | SP L40 |
| SP-054 | Data model | Entity: revision/versions; AI proposals; connections/dependencies. | History, review, ripple. | CHATGPT SPEC. FLAG F11: no conversation/session-record entity listed, although HV requires one. | SP L40 |
| SP-055 | Data model | Storage may be typed tables, typed JSON, or a hybrid. It must preserve typing, validation, referential integrity, and queryability. Do not force everything into one indistinguishable note field. | Queryable, valid data. | CHATGPT SPEC | SP L40 |
| SP-056 | Data model | Every record has: stable identifier, project membership, title/description or content, type, status, source/provenance, user ownership, timestamps, revision marker, tags as appropriate, relationship edges, and the ability to retrieve linked context. | Traceability. | CHATGPT SPEC | SP L41 |
| SP-057 | Behavior | Records support long-form notes without text loss. Do not force every possible field at creation. | Low friction, no truncation. | CHATGPT SPEC | SP L41 |
| SP-058 | Data model | Required status: **Established/confirmed**. | Canon. | CHATGPT SPEC | SP L43 |
| SP-059 | Data model | Required status: **Developing/exploring**. | Work in progress. | CHATGPT SPEC | SP L43 |
| SP-060 | Data model | Required status: **Unanswered/open**. An unanswered question is not a weakly developed fact. | Open questions are legitimate. | CHATGPT SPEC | SP L43 |
| SP-061 | Data model | Required status: **Illustrative/demonstration**. A simulated or example event can never become canon through import or summarization. | Teaching examples are not canon. | CHATGPT SPEC | SP L43 |
| SP-062 | Data model | Required status: **Proposed** (AI or author option). A proposed change is not established until explicitly accepted. | Review before canon. | CHATGPT SPEC | SP L43 |
| SP-063 | Behavior | Status transitions are deliberate and auditable. When the user accepts a suggestion, record who accepted it and what it replaced. | Audit trail. | CHATGPT SPEC | SP L43 |
| SP-064 | Behavior | Contradictory competing possibilities are supported on purpose. Two Ghost theories may coexist, and one may be tested without deleting the other. | Multiple theories. | CHATGPT SPEC | SP L44 |
| SP-065 | UI-UX | The UI makes clear which statement the author chose as current canon, when no answer has been chosen, and when a passage is purely illustrative. | Visibility of status. | CHATGPT SPEC | SP L44 |
| SP-066 | Data model | Import provenance keeps source filename, position/excerpt, import timestamp, and attribution/confidence or extraction notes. | Trace to source. | CHATGPT SPEC. FLAG F3: "where possible". | SP L46 |
| SP-067 | Behavior | Distinguish *source says X* from *AI inferred Y*. | Truth vs inference. | CHATGPT SPEC | SP L46 |
| SP-068 | Behavior | When two sources cannot be reconciled, ask or flag. Never select a winner. | Author decides. | CHATGPT SPEC | SP L46 |
| SP-069 | Feature | Trace-back from any summary, suggestion, or derived link to the underlying source passages. No opaque black-box transformation of the story bible. | Trust. | CHATGPT SPEC | SP L46 |
| SP-070 | Data model | Outline event, character trait, idea, question, and draft scene are different objects. They may be linked, but editing one never silently rewrites another. | Separation of knowledge and prose. | CHATGPT SPEC | SP L48 |
| SP-071 | Data model | Support real states such as "drafted but not canon" and "canon but not yet dramatized." | Placement differs from approval. | CHATGPT SPEC | SP L48 |
| SP-072 | Data model | A story beat is not necessarily one scene. A scene may contribute to several arcs. | Flexible mapping. | CHATGPT SPEC | SP L48 |
| SP-073 | Behavior | Prose may contradict plans on purpose until the author resolves the inconsistency. | Discovery writing. | CHATGPT SPEC | SP L48 |

### A5. Capture-first creative thinking

| ID | Type | Statement | Why | Standing | Source |
|---|---|---|---|---|---|
| SP-074 | Feature | **Questions I Have**: fast entry of uncertainties and decisions the author still needs to make. | Open questions without guilt. | CHATGPT SPEC; QUOTES YOLANDA (space label "Questions I Have", her workflow term per HV L26) | SP L51 |
| SP-075 | Behavior | A question can stay unassigned, and can later link to a character, arc, beat, scene, timeline, or craft issue. | Capture first. | CHATGPT SPEC | SP L51 |
| SP-076 | Data model | A question can hold candidate answers, assumptions, urgency, dependencies, and resolution. | Decision support. | CHATGPT SPEC | SP L51 |
| SP-077 | Behavior | Closing a question does not erase its earlier alternatives. | History of options. | CHATGPT SPEC | SP L51 |
| SP-078 | Feature | **Things & Ideas I'm Thinking About**: a frictionless place for fragments, lines of dialogue, names, motifs, research leads, potential Ghosts, funny situations, competing endings, unexpected links, and images. | Raw idea capture. | CHATGPT SPEC; QUOTES YOLANDA (label "Things & Ideas I'm Thinking About") | SP L52 |
| SP-079 | Principle | "Capture first, organize later." Do not force a taxonomy, template, or answer before saving. | User explicitly requested it. | QUOTES YOLANDA: "capture first, organize later" ("The user explicitly requested") | SP L52 |
| SP-080 | Behavior | Example: the author types "Anthony would have a podcast: The Voice of Reason." One action saves the exact text, tags it as a developing idea, optionally links Anthony, and offers to explore ripple effects. It does **not** declare the podcast's schedule, set location, audience, episodes, or final placement. | No invented detail. | CHATGPT SPEC (title "The Voice of Reason" is Yolanda's, per HV L13) | SP L54 |
| SP-081 | Behavior | Example: the author records "Giving honor to God, and Miss Francine…" and may mark it a candidate final-scene payoff. The software does not rewrite the final chapter or claim the line is placed there. | Approval differs from placement. | CHATGPT SPEC; QUOTES YOLANDA: "Giving honor to God, and Miss Francine…" | SP L54 |
| SP-082 | Feature | Branch and return: step away from a scene into a character question, capture an idea about **another novel**, or consult a framework, then resume the exact prior writing context with one obvious action. | Associative style. | CHATGPT SPEC | SP L56 |
| SP-083 | Feature | **Return to Writing** keeps location, scroll/cursor, active draft, and the question that prompted the detour. No punishment for an associative working style. | Safe thread back. | CHATGPT SPEC. FLAG F3: scroll/cursor only "if technically feasible". | SP L56 |

### A6. Multi-genre structure and frameworks

| ID | Type | Statement | Why | Standing | Source |
|---|---|---|---|---|---|
| SP-084 | Feature | Save the Cat: all 15 beats, correctly ordered, with approximate percentage/page positions, notes, scenarios, and linked scenes. | Structure lens. | CHATGPT SPEC | SP L59 |
| SP-085 | Data model | Default beat names: Opening Image, Theme Stated, Setup, Catalyst, Debate, Break into Two, B Story, Fun & Games, Midpoint, Bad Guys Close In, All Is Lost, Dark Night of the Soul, Break into Three, Finale, Final Image. | Standard beats. | CHATGPT SPEC | SP L59 |
| SP-086 | Data model | Default act boundaries: Act I = beats 1-5 (0-20%); Act IIA = 6-8 (20-50%); Act IIB = 9-12 (50-80%); Act III = 13-15 (80-100%). | Orientation. | CHATGPT SPEC | SP L59 |
| SP-087 | Principle | Percentage targets are orientation, not hard constraints. A book can depart from a template without the system claiming the author is wrong. | Frameworks as lenses. | CHATGPT SPEC | SP L59 |
| SP-088 | Data model | Keep **beat function** separate from the **concrete novel event**. A structurally identified midpoint can have "specific event undecided." | Allows open decisions. | CHATGPT SPEC | SP L60 |
| SP-089 | Behavior | Guide what the beat must accomplish, and leave its realization open. | Teach without deciding. | CHATGPT SPEC | SP L60 |
| SP-090 | Data model | McKee scene fields: opening and closing story values, value polarity/charge, desire/expectation, actual result, gap between expectation and result, turning point, forces of antagonism, progressive complications, stakes, and the more severe condition or negation of the negation where appropriate. | Dramatic engine. | CHATGPT SPEC | SP L62 |
| SP-091 | Behavior | Track meaningful scene change, not just action. Ask diagnostic questions: Did the value turn? Did the outcome contradict expectation? Is pressure escalating or repeating? Do antagonists close the easy exits? | Craft critique. | CHATGPT SPEC | SP L62 |
| SP-092 | Principle | Do not treat interpretation as mathematically provable. | Humility of analysis. | CHATGPT SPEC | SP L62 |
| SP-093 | Data model | Weiland, for every major character: arc type (positive change, flat, negative, or intentionally unknown), Ghost/wound, Lie, Want, Need/Truth, key challenges/turns, tests, final transformed state, unresolved issues. | Arc modeling. | CHATGPT SPEC | SP L64 |
| SP-094 | Behavior | Track how internal change and external events interact, not isolated character questionnaires. | Arc is tied to plot. | CHATGPT SPEC | SP L64 |
| SP-095 | Principle | A flat arc means the character carries a truth that influences others. It does not mean a thin or static character. | Correct craft definition. | CHATGPT SPEC | SP L64 |
| SP-096 | Data model | One character may have several arcs on different axes, e.g. Francine: flat arc on respect, positive-change arc on loneliness. | Multi-axis arcs. | CHATGPT SPEC. FLAG F9: "as contemplated", so not a decision. | SP L64 |
| SP-097 | Feature | Ingermanson/Snowflake: progressive workflow one-sentence premise -> paragraph -> expanded synopsis -> scene/character details, **without requiring it**. | Optional method. | CHATGPT SPEC | SP L66 |
| SP-098 | Data model | Distinguish concrete Goal from abstract Ambition; Values ("Nothing is more important than..." statements); Conflict; Epiphany; scene summaries and expansions. | Character dynamics. | CHATGPT SPEC | SP L66 |
| SP-099 | Behavior | Accommodate a nonlinear user who starts with dialogue and fills in the spine later. | Discovery writer. | CHATGPT SPEC | SP L66 |
| SP-100 | Feature | Cross-framework mapping shows correspondences such as Break into Two / First Plot Point / Crossing the First Threshold, and explains that terminology and exact positions vary. | Multiple lenses. | CHATGPT SPEC | SP L68 |
| SP-101 | Data model | Several lenses can apply to the same linked event without duplicating canon. | Single source of truth. | CHATGPT SPEC | SP L68 |
| SP-102 | Constraint | Frameworks are selectable, extensible, and not forced onto every genre: comedy, thriller, romance, speculative, children's, literary, hybrid. Do not assume all fiction has IDW's dramatic shape. | Any novel. | CHATGPT SPEC | SP L68 |

### A7. Character depth, voice, identity, relationships

| ID | Type | Statement | Why | Standing | Source |
|---|---|---|---|---|---|
| SP-103 | Data model | Character profiles support contradictory values, competencies, weaknesses, agency and choices under pressure, recurring humor/comic engine, motivation, behavior vs underlying hunger, speech patterns, roles, in-world relationships, backstory, arc evolution, and which POV character knows what. | Depth. | CHATGPT SPEC | SP L70 |
| SP-104 | Data model | Keep decided appearance separate from a casting "tuning fork" or reference. An actor inspiration is not the character's literal physical description. | Prevents false canon. | CHATGPT SPEC | SP L70 |
| SP-105 | Constraint | Identities and cultural context can be represented accurately, with no auto-stereotyping and no invented biographical assumptions. | Respectful accuracy. | CHATGPT SPEC | SP L70 |
| SP-106 | Feature | Relationship views distinguish external plot opposition, real emotional trajectory, hidden influence, false assumptions, and asymmetries of information. | Relationship depth. | CHATGPT SPEC | SP L71 |
| SP-107 | Behavior | A deep relationship links its changes to specific scenes and choices. | Arc is grounded in scenes. | CHATGPT SPEC | SP L71 |
| SP-108 | Data model | Two characters may share a need to matter yet have very different Ghosts and defenses. | Kevin/Anthony insight. | CHATGPT SPEC | SP L71 |
| SP-109 | Constraint | Sample-project facts (Kevin Wickley, Anthony Vernon, Francine Ellington) are sample-specific, **not** universal program defaults. | Any novel. | CHATGPT SPEC | SP L72 |
| SP-110 | Scenario | IDW sample: Kevin Wickley is a paranoid, dramatic, self-important Stephen King devotee and the alternating first-person co-lead. Anthony Vernon is the deadpan, button-pushing co-lead, a self-appointed neighborhood rule enforcer with no actual HOA authority. Both want significance for different reasons. Francine Ellington is the older, overlooked neighbor whose garden both men's dogs damage. She secretly orchestrates retaliation and is not a villain. | Test data. | CHATGPT SPEC | SP L72 |

### A8. Plot, scenes, sequences, causality, chronology

| ID | Type | Statement | Why | Standing | Source |
|---|---|---|---|---|---|
| SP-111 | Data model | Editorial hierarchy: novel -> act -> sequence -> beat/scenes -> chapter/prose, with flexible mapping. A chapter can contain several scenes, a beat can cover several scenes, and one scene may serve both a plot and a character arc. | Real novels are not strict trees. | CHATGPT SPEC | SP L75 |
| SP-112 | Behavior | Users can reorder without losing prose or connections. | Safe restructuring. | CHATGPT SPEC | SP L75 |
| SP-113 | Data model | Scene worksheet ("minimum desired fields"): scene title/ID; narrative and chronological order; draft status; narrator/POV; location/time; participants; perspective knowledge; immediate goal; stakes; inciting disturbance; expectation; actual result; McKee Gap; opening/closing values; conflict/opposition; complication; turn; disaster/reaction/dilemma/decision as applicable; A/B plot membership; character-arc movement; setup/clue/payoff; continuity constraints; questions; notes; manuscript passage. | Scene engineering. | CHATGPT SPEC | SP L77 |
| SP-114 | UI-UX | Offer a concise mode instead of showing all fields at once. | Avoid overwhelm. | CHATGPT SPEC | SP L77 |
| SP-115 | Data model | Sequence level: goal, cascading complications, reversals, culmination, transition. | Sequence craft. | CHATGPT SPEC | SP L79 |
| SP-116 | Behavior | Surface repetitions (e.g. three pranks with unchanged dramatic value) and missing bridges as editorial hypotheses, not automatic errors. | Critique without dictating. | CHATGPT SPEC | SP L79 |
| SP-117 | Feature | Support chronology out of narrative order, flashbacks, withheld reveals, and future threads. | Complex timelines. | CHATGPT SPEC | SP L79 |
| SP-118 | Feature | Enforce or flag project-defined POV rules per scene/chapter. Other novels may use different configurations. | Configurable integrity. | CHATGPT SPEC | SP L81 |
| SP-119 | Constraint | For IDW, a single first-person narrator per scene may be a hard integrity rule. | IDW narration. | CHATGPT SPEC. FLAG F6: "may be" vs AC07 "enforce"; scene vs scene/chapter. | SP L81 |
| SP-120 | Data model | Track character knowledge, what the reader knows, what a character suspects, and what is actually true. | Fair-play mystery. | CHATGPT SPEC | SP L81 |
| SP-121 | Data model | Hidden plots need separate **author-only truth records**, so a fair-play reveal is possible without premature leakage in the story or in AI summaries meant for the reader-facing POV. | POV leakage. | CHATGPT SPEC | SP L81 |

### A9. Misdirection, reveals, setups, payoffs

| ID | Type | Statement | Why | Standing | Source |
|---|---|---|---|---|---|
| SP-122 | Data model | Four distinct but linked author-only registers: (a) secret-operations truth (what actually happened); (b) planted clues, foreshadowing, and payoffs; (c) reader knowledge / suspicion curve compared with each POV character; (d) continuity/audit outcomes. | Misdirection integrity. | CHATGPT SPEC | SP L83 |
| SP-123 | Data model | Mark what is seen on the page, what it appears to mean, what it actually means, who knows, and where the eventual reveal pays it off. | Clue tracking. | CHATGPT SPEC | SP L83 |
| SP-124 | Feature | Inspect an event from reader belief versus underlying truth, without accidental POV leakage. | Dual view. | CHATGPT SPEC | SP L83 |
| SP-125 | Scenario | IDW ledger: Francine's in-world garden ledger is planted early, discovered by the men around All Is Lost as a humiliating revelation, and wielded in the Finale for the men's one genuine win. Francine ultimately wins the warmer, larger game. These are **separate events**. | Never merge discovery and payoff. | CHATGPT SPEC | SP L84, L155 |
| SP-126 | Scenario | IDW fish guts: Francine plants them in Anthony's yard while Kevin and Anthony are distracted. The smell comes first, cats and raccoons later. Anthony wrongly accuses Kevin, and Kevin genuinely denies it. The diversion mechanism (including a proposed five-dollar bill) is **not decided**. The system must preserve these distinctions exactly. | Causality and undecided detail. | CHATGPT SPEC | SP L84, L154 |
| SP-127 | Data model | The Kevin/Anthony move from rivalry to friendship is an arc within the A plot, not a compulsory third plotline. Francine's hidden operations and awakening are B-story material. The plotline ontology must handle this naturally. | Flexible plotline model. | CHATGPT SPEC | SP L85, L147 |

### A10. Manuscript drafting and revision

| ID | Type | Statement | Why | Standing | Source |
|---|---|---|---|---|---|
| SP-128 | Constraint | The author starts drafting IDW on November 1, 2026. The app must be usable during planning before that date and during prose production after it. | Real deadline. | CHATGPT SPEC | SP L87 |
| SP-129 | Feature | Writing surface with a focused mode. | Concentration. | CHATGPT SPEC | SP L87 |
| SP-130 | Feature | Direct navigation from the writing surface to the relevant scene/beat/character context. | Context while writing. | CHATGPT SPEC | SP L87 |
| SP-131 | Feature | Fast scene creation. | Low friction. | CHATGPT SPEC | SP L87 |
| SP-132 | Feature | Reliable auto-save **or** deliberate save with clear state, plus unsaved-change protection. | No lost prose. | CHATGPT SPEC. FLAG F3: "or deliberate save" allows no autosave, although SP L29 lists "autosave/recovery". | SP L87, L29 |
| SP-133 | Feature | Word counts at useful levels. | Progress. | CHATGPT SPEC | SP L87 |
| SP-134 | Feature | Chapter/scene assembly and configurable manuscript order. | Manuscript build. | CHATGPT SPEC | SP L87 |
| SP-135 | Feature | Basic find/search in the manuscript. | Navigation. | CHATGPT SPEC. FLAG F3: "basic". | SP L87 |
| SP-136 | Feature | Revisions/history for prose. | Recoverability. | CHATGPT SPEC | SP L87 |
| SP-137 | Feature | Manuscript export. | Output. | CHATGPT SPEC | SP L87 |
| SP-138 | UI-UX | Formatting supports readable prose and does not encourage design work while drafting. | Focus on words. | CHATGPT SPEC. FLAG: could be read as limiting formatting. | SP L87 |
| SP-139 | Behavior | Importing existing prose must not lose formatting or silently replace words. | Prose fidelity. | CHATGPT SPEC | SP L87 |
| SP-140 | Constraint | Writing stays available when AI is offline, unavailable, or disabled. | Writing never depends on AI. | CHATGPT SPEC | SP L87 |
| SP-141 | Behavior | Return to Writing: after a detour, the author finds the last place she was writing, sees the local task/question if useful, and starts typing immediately. | Re-entry. | CHATGPT SPEC | SP L88 |
| SP-142 | UI-UX | A one-line re-entry prompt may be offered. It must be helpful, not mandatory. | No gatekeeping. | CHATGPT SPEC | SP L88 |
| SP-143 | Constraint | Never require the story spine to be "complete" before drafting. | Discovery writing. | CHATGPT SPEC | SP L88 |
| SP-144 | Feature | Export minimum: lossless plain text, Markdown, and structured JSON backup. | Portability. | CHATGPT SPEC | SP L90 |
| SP-145 | Feature | A useful manuscript export (e.g. DOCX or another standard format) with predictable chapter order and preserved prose. | Submission-ready output. | CHATGPT SPEC. FLAG F3: DOCX only an "e.g.". | SP L90 |
| SP-146 | Constraint | Be explicit about which formats the current code supports. Full manuscript export and full project backup are different capabilities, and both must be verified. | Honesty. | CHATGPT SPEC | SP L90 |

### A11. Narrative Zoom

| ID | Type | Statement | Why | Standing | Source |
|---|---|---|---|---|---|
| SP-147 | Feature | Narrative Zoom is operational in Phase 2, even though professional graphics are deferred. | Requested concept. | CHATGPT SPEC (concept "requested" by author) | SP L92 |
| SP-148 | Scenario | Zoom walk: click from the novel-level spine into Act IIB, inspect the All Is Lost beat, see its linked ledger reveal scene, review what Kevin and Anthony know at that moment, trace the eventual finale payoff, and return to the draft. | Zoom in practice. | CHATGPT SPEC | SP L92 |
| SP-149 | Data model | Zoom levels: novel, plotline/character arc, act, sequence, beat, scene, actual passage. | Hierarchy. | CHATGPT SPEC | SP L92 |
| SP-150 | UI-UX | Protect the hierarchy and avoid dumping the whole database on screen. Contextual breadcrumbs, cross-links, saved state, and quick return matter more than fancy diagrams. | Usable navigation. | CHATGPT SPEC | SP L92 |
| SP-151 | Feature | In Phase 2: ordinary lists, outline trees, relationship panels, scene timelines, dependency tables. | Navigation views. | CHATGPT SPEC | SP L93 |

### A12. Ripple effects and author-approved changes

| ID | Type | Statement | Why | Standing | Source |
|---|---|---|---|---|---|
| SP-152 | Feature | A genuine change-impact engine, more than "show items connected by a link." It identifies what changes to established plot facts, character motivations, POV, sequence order, timeline, knowledge, continuity, setups, payoffs, and manuscript passages might affect. | Real dependency awareness. | CHATGPT SPEC | SP L95 |
| SP-153 | Behavior | Explain the causal/path reasons, risk/severity, and what should be reviewed. | Explainability. | CHATGPT SPEC | SP L95 |
| SP-154 | Behavior | Distinguish a direct dependency from a speculative connection, and avoid huge misleading cascade lists. | Signal over noise. | CHATGPT SPEC | SP L95 |
| SP-155 | Behavior | Never silently edit records. Users can accept, reject, defer, or resolve impacts, and can review a proposal's consequences before promoting it to canon. | Author control. | CHATGPT SPEC | SP L95 |
| SP-156 | Acceptance test | Required scenario, the midpoint revision: the user revises the midpoint. The app identifies related scene outcomes, value shifts, setup/payoff links, character trajectories, and downstream beats for review. Unrelated profiles stay unchanged. The original decision and the manuscript stay recoverable. A variation in a comedic detail must not trigger a wholesale rewrite of the book. | Trust in change handling. | CHATGPT SPEC. FLAG F1: closest match to a "midpoint trust test"; that name does not appear. | SP L96 |
| SP-157 | Acceptance test | Required scenario, the podcast: the user decides Anthony has a podcast with the tentative name *The Voice of Reason*. The system stores it as developing, offers candidate scene connections, and does not invent published episodes or an on-screen appearance. If the user later marks a final-scene acknowledgment approved, the system still must not fabricate a final scene. | No invention. | CHATGPT SPEC | SP L97 |

### A13. AI collaboration

| ID | Type | Statement | Why | Standing | Source |
|---|---|---|---|---|---|
| SP-158 | Constraint | Phase 2 includes actual intelligent assistance, not just a textbox for pasting AI suggestions. No API is connected in the initial ZIP, and a review queue alone does not meet this scope. | AI is in scope. | CHATGPT SPEC | SP L99, L135 |
| SP-159 | Feature | AI: contextual character interrogation. | Craft partner. | CHATGPT SPEC | SP L99 |
| SP-160 | Feature | AI: alternative Ghost/Lie/Need chains. | Options. | CHATGPT SPEC | SP L99 |
| SP-161 | Feature | AI: scene Gap/values critique. | McKee. | CHATGPT SPEC | SP L99 |
| SP-162 | Feature | AI: escalating complications. | Pressure. | CHATGPT SPEC | SP L99 |
| SP-163 | Feature | AI: thematic coherence. | Theme. | CHATGPT SPEC | SP L99 |
| SP-164 | Feature | AI: possible causal holes. | Causality. | CHATGPT SPEC | SP L99 |
| SP-165 | Feature | AI: age/timeline consistency checks. | Continuity. | CHATGPT SPEC | SP L99 |
| SP-166 | Feature | AI: POV leakage checks. | Fair play. | CHATGPT SPEC | SP L99 |
| SP-167 | Feature | AI: continuity questions. | Continuity. | CHATGPT SPEC | SP L99 |
| SP-168 | Feature | AI: dialogue-voice comparison. | Distinct voices. | CHATGPT SPEC | SP L99 |
| SP-169 | Feature | AI: alternatives and objections. | Challenge. | CHATGPT SPEC | SP L99 |
| SP-170 | Feature | AI: summarize relevant established context for a scene. | Context. | CHATGPT SPEC | SP L99 |
| SP-171 | Feature | AI: identify unanswered questions. | Open items. | CHATGPT SPEC | SP L99 |
| SP-172 | Feature | AI: draft feedback. | Revision. | CHATGPT SPEC | SP L99 |
| SP-173 | Feature | AI: controlled, opt-in prose brainstorming. | Writer stays the writer. | CHATGPT SPEC. FLAG F3: prose generation limited to "opt-in brainstorming". | SP L99 |
| SP-174 | Constraint | Where AI services need keys or external connections, document the integration, costs, data handling, and offline behavior. | Transparency. | CHATGPT SPEC | SP L99 |
| SP-175 | Behavior | AI responses cite linked story records or excerpts when making source claims, label inference, distinguish "here's one way" from "this is established," and avoid fake certainty. | Grounding. | CHATGPT SPEC | SP L100 |
| SP-176 | Behavior | AI preserves the author's voice and does not homogenize prose. | Voice. | CHATGPT SPEC | SP L100 |
| SP-177 | Feature | Accept/reject/defer for each recommendation. Accepted changes show an exact before/after preview and create a reversible history entry. | Review before apply. | CHATGPT SPEC | SP L100 |
| SP-178 | Constraint | Never apply proposed Ghosts, motives, scene events, dialogue, or relationships to confirmed canon automatically. | Sovereignty. | CHATGPT SPEC | SP L100 |
| SP-179 | Feature | AI conversational modes: **Teach it** (explain a technique), **Show it** (a demonstration, not a decision), **Hand it to me** (author's blank or prompt), **Critique/Challenge** (find holes without automatically fixing them). | Mirrors the Story Bible's method. | CHATGPT SPEC | SP L101 |
| SP-180 | UI-UX | Keep the writer's primary action, "Write," always available. | Writing first. | CHATGPT SPEC | SP L101 |

### A14. Daily UX, discovery, attention support

| ID | Type | Statement | Why | Standing | Source |
|---|---|---|---|---|---|
| SP-181 | UI-UX | Practical for associative creative thinking, not a rigid "fill all fields" workflow. Use progressive disclosure, smart defaults, unobtrusive contextual guidance, and search. | Avoid paralysis. | CHATGPT SPEC | SP L103 |
| SP-182 | Behavior | Capture can be one line. Users can follow a rabbit trail and return. | Associative style. | CHATGPT SPEC | SP L103 |
| SP-183 | Feature | A "Where was I?" / "Return to Writing" entry point, resurfaced work, an obvious search, and a gentle way to surface stalled but important threads. | Re-entry and rediscovery. | CHATGPT SPEC | SP L103 |
| SP-184 | UI-UX | Show project-specific milestones and progress **without generic pie charts or bar charts**, which this author dislikes. | Author preference. | CHATGPT SPEC (reports author's dislike) | SP L103 |
| SP-185 | Behavior | Progress counts scenes drafted, open key decisions, first-pass structure, drafting momentum, and actual completed work, not the number of database records. | Meaningful progress. | CHATGPT SPEC | SP L103 |
| SP-186 | Not wanted | Forced organization taxonomies and sterile administrative interfaces. Use a sophisticated, creative, readable design instead. | Author experience. | CHATGPT SPEC | SP L104 |
| SP-187 | Not wanted | No requirement to copy the Mama Dorothy interface or personality. | Separate product. | CHATGPT SPEC. FLAG F7. | SP L104 |
| SP-188 | UI-UX | Responsiveness, accessibility, keyboard-friendly editing, and fast navigation. | Usability. | CHATGPT SPEC | SP L104 |
| SP-189 | Feature | The author chooses style/tone. | Personalization. | CHATGPT SPEC | SP L104 |
| SP-190 | Behavior | Be candid when something is not supported. | Honesty. | CHATGPT SPEC | SP L104 |

### A15. Import, search, backup, restore, portability

| ID | Type | Statement | Why | Standing | Source |
|---|---|---|---|---|---|
| SP-191 | Feature | Import DOCX, text/Markdown, and structured formats, with previews and source-status protection. | Bring in existing work. | CHATGPT SPEC. FLAG F3: "as far as technically feasible". | SP L106 |
| SP-192 | Behavior | Import the complete IDW Story Bible v5 without collapsing its "What it is / One way I could play it / Over to me" distinctions. An "illustrative" candidate inside an instructional passage must not be promoted to "established." | Canon safety. | CHATGPT SPEC (quotes Story Bible section labels) | SP L106 |
| SP-193 | Feature | Import supports mapping, deduplication, and reimport with identity/version control. | Re-import safety. | CHATGPT SPEC | SP L106 |
| SP-194 | Feature | Import reports what was imported, skipped, flagged, or ambiguous. | Transparency. | CHATGPT SPEC | SP L106 |
| SP-195 | Constraint | Local persistent storage by default. | Local-first. | CHATGPT SPEC | SP L107 |
| SP-196 | Constraint | Document exact file locations, backups, recovery, restoration, compatibility, and schema migrations. | Trust. | CHATGPT SPEC | SP L107 |
| SP-197 | Feature | Portable full-project export including all canon, alternatives, questions, scenes, prose, links, history, settings, and references, or a clear declaration of what is excluded. | Freedom to leave. | CHATGPT SPEC | SP L107 |
| SP-198 | Constraint | Provide import/recovery tests, not just an export endpoint. | Proven restore. | CHATGPT SPEC | SP L107 |
| SP-199 | Constraint | Prevent destructive import overwrites, duplicate records, broken foreign references, and silent data truncation. Write safety matters more than cosmetic features. | Data integrity. | CHATGPT SPEC | SP L107 |
| SP-200 | Feature | Search across multiple entity types, with full text and filters for character, plotline, scene, status, and source, plus clear cross-reference navigation. | Retrieval. | CHATGPT SPEC | SP L108 |
| SP-201 | Behavior | Retrieval distinguishes source-grounded data from AI-generated interpretation. | Provenance. | CHATGPT SPEC | SP L108 |
| SP-202 | Behavior | The user can locate a specific joke or candidate line from October 14 without remembering which note it was saved under. | Rediscovery. | CHATGPT SPEC | SP L108 |

### A16. Local-first security and reliability

| ID | Type | Statement | Why | Standing | Source |
|---|---|---|---|---|---|
| SP-203 | Constraint | Audit items for the local HTTP service: loopback binding, cross-origin requests, filesystem/path handling, CSRF or local service abuse, input validation, error surfaces, import archive safety, SQL injection, XSS. "Runs locally" does not mean secure. | Security. | CHATGPT SPEC. FLAG F2. | SP L110 |
| SP-204 | Constraint | No arbitrary host bind or remote exposure by default. | Privacy. | CHATGPT SPEC | SP L110 |
| SP-205 | Constraint | Core writing, reading, and editing work offline. AI service failures are isolated from local data. | Resilience. | CHATGPT SPEC | SP L110 |
| SP-206 | Not wanted | No third-party telemetry by default. | Privacy. | CHATGPT SPEC | SP L110 |
| SP-207 | Constraint | Define backup/restore and migration behavior. Crash recovery and concurrency handling must protect drafts. | Prose safety. | CHATGPT SPEC | SP L110 |
| SP-208 | Acceptance test | Engineering tests: API error handling, project isolation, link integrity, revision revert conflicts, cascade/deletion behavior, malformed JSON, race conditions, and simultaneous browser tabs. | Robustness. | CHATGPT SPEC | SP L111 |
| SP-209 | Acceptance test | Exported backups contain the actual source data and round-trip cleanly. | Backup validity. | CHATGPT SPEC | SP L111 |
| SP-210 | Constraint | Any AI integration minimizes the content sent, discloses what leaves the machine, and requires consent/credentials. | Privacy. | CHATGPT SPEC | SP L111 |

### A17. Acceptance criteria AC01 to AC20

| ID | Type | Statement | Why | Standing | Source |
|---|---|---|---|---|---|
| SP-211 | Constraint | A passing dashboard is not enough. Demonstrate the end-to-end workflows with saved evidence (commands, test results, screenshots, database checks, logs), and state the expected outcome of each test. | Proof. | CHATGPT SPEC | SP L113 |
| SP-212 | Acceptance test | **AC01 Create a book**: create a second fictional novel in a genre unrelated to neighborhood comedy, choose frameworks, add characters and scenes, and show the app does not require IDW defaults. | Genre independence. | CHATGPT SPEC | SP L114 |
| SP-213 | Acceptance test | **AC02 Full fidelity import**: import the v5 story bible; confirm established facts, open questions, and illustrated demonstrations stay separate; count and spot-check critical passages; re-import without duplication or canon promotion. | Import safety. | CHATGPT SPEC | SP L115 |
| SP-214 | Acceptance test | **AC03 Capture without friction**: add a question and a free-form comic idea in under a minute without choosing a category or character first; later link them to scenes, leave multiple options open, and find them via search. | Capture first. | CHATGPT SPEC | SP L116 |
| SP-215 | Acceptance test | **AC04 Detailed character model**: build Kevin's possible job-loss Ghost, history of individual/couples therapy, competing Lies, values, goals vs ambition, changing arc, and supporting scenes. Mark job loss exploratory, not confirmed. Compare with Anthony's separate Ghost (unanswered). Confirm no involuntary canon change. | Status integrity. | CHATGPT SPEC | SP L117 |
| SP-216 | Acceptance test | **AC05 Structure fidelity**: save all 15 beats in correct order; assign acts and approximate landmarks; associate several scenes with one beat; move a scene without losing content; leave the Catalyst and Midpoint undecided. | Structure. | CHATGPT SPEC | SP L118 |
| SP-217 | Acceptance test | **AC06 McKee analysis**: create a scene with clear expectation, actual reversal, value shift, opposition, escalating complication, and sequel. Produce a source-grounded critique that separates established input from suggestion. | AI critique. | CHATGPT SPEC | SP L119 |
| SP-218 | Acceptance test | **AC07 POV and fair-play**: for IDW, enforce alternating Kevin/Anthony first-person POV with one narrator per scene. Keep Francine's hidden operation accessible to the author but unavailable in the wrong POV-facing summary. | POV integrity. | CHATGPT SPEC. FLAG F6. | SP L120 |
| SP-219 | Acceptance test | **AC08 Ledger integrity**: create an early planted garden journal, a later discovery at All Is Lost, and a Finale where the men wield it. Confirm separate records, chronological/narrative links, and accurate reverse navigation. | Setup/payoff. | CHATGPT SPEC | SP L121 |
| SP-220 | Acceptance test | **AC09 Sequence causality**: model fish guts placed in Anthony's yard by Francine, the necessary distraction, the delayed smell and animals, Anthony's false accusation, and Kevin's truthful denial, while keeping the five-dollar bill merely illustrative. | Causality. | CHATGPT SPEC | SP L122 |
| SP-221 | Acceptance test | **AC10 Ripple analysis**: change a character's Lie or a midpoint event; inspect justified affected records, direct vs inferred effects, human approval, reversal, and no silent unrelated edits. | Change trust. | CHATGPT SPEC. FLAG F1: midpoint test. | SP L123 |
| SP-222 | Acceptance test | **AC11 AI no-hallucination**: ask AI to summarize a source where the Ghost is undecided. It must say so, propose options only as options, and not invent canon. Test adversarial prompts and misleading source text. | AI honesty. | CHATGPT SPEC | SP L124 |
| SP-223 | Acceptance test | **AC12 Drafting**: write three scenes with distinct POVs, navigate away and back, close and restart the app, recover the exact prose, check word counts, reorder chapters, and export the assembled manuscript in correct order. | Writing reliability. | CHATGPT SPEC | SP L125 |
| SP-224 | Acceptance test | **AC13 Navigate**: zoom from novel -> Act IIB -> All Is Lost -> ledger scene -> Finale payoff -> draft, then back to the original editing location. | Narrative Zoom. | CHATGPT SPEC | SP L126 |
| SP-225 | Acceptance test | **AC14 Search**: find "Dr. Fingleburger," "The Voice of Reason," and the opening line "Giving honor to God, and Miss Francine…" with correct attached statuses and source references if imported. | Rediscovery. | CHATGPT SPEC. FLAG: calls "Giving honor…" the "opening line" (of the podcast); elsewhere it is a candidate closing acknowledgment (L152). | SP L127 |
| SP-226 | Acceptance test | **AC15 Backup/restore**: export the full project, alter or delete records in a disposable copy, restore the backup, and compare entity counts, stable IDs, relationships, status, manuscript content, history, and checksums. | Data safety. | CHATGPT SPEC | SP L128 |
| SP-227 | Acceptance test | **AC16 History**: review exact old/new values for confirmed changes and roll back selected edits without silently losing newer unrelated work. | Reversibility. | CHATGPT SPEC | SP L129 |
| SP-228 | Acceptance test | **AC17 Negative/security**: invalid references, cross-project links, malformed input, malicious imported content, long text, unsupported schema versions, and interrupted writes produce safe errors and no corruption. | Robustness. | CHATGPT SPEC | SP L130 |
| SP-229 | Acceptance test | **AC18 Offline**: disconnect external AI and confirm all local writing, story retrieval, navigation, saves, backups, and exports still work. | Offline core. | CHATGPT SPEC | SP L131 |
| SP-230 | Acceptance test | **AC19 UX**: a person unfamiliar with the code completes capture, novel navigation, scene creation, drafting, and recovery without developer help. Observe friction, forms, missing confirmation, and distracting busywork. | Usability. | CHATGPT SPEC. FLAG F10: tests a proxy user, not Yolanda. | SP L132 |
| SP-231 | Acceptance test | **AC20 Clean start**: unpack and launch on the author's target **Windows** computer using the written instructions; validate setup and data paths. Linux container tests are not Windows readiness. | Real environment. | CHATGPT SPEC. FLAG F2. | SP L133 |

### A18 to A20. Review against the ZIP, release bar, reviewer handoff

| ID | Type | Statement | Why | Standing | Source |
|---|---|---|---|---|---|
| SP-232 | Constraint | Field names are not features. A field named "gap," "continuity," or "arc" does not mean the intelligent behavior exists. A graph-neighbor route is not dependency-aware ripple analysis. A list of 15 beats is not complete story engineering. A review queue for pasted advice is not AI collaboration. | Prevents false passes. | CHATGPT SPEC | SP L135 |
| SP-233 | Constraint | ZIP baseline also includes item kinds and statuses, CRUD scaffolding, typed links and history, an initial validation routine (missing Save the Cat beats, missing scene POV, illustrative-source conflicts), a recommendations table, browser UI, starter content, and Python 3.10+. | Baseline inventory. | CHATGPT SPEC | SP L135 |
| SP-234 | Constraint | Gap matrix statuses: Verified / Partial / Missing / Defective / Requires author decision, with a reproducible test for each. Include an honest risk summary and prioritized implementation recommendations. | Review output. | CHATGPT SPEC | SP L136 |
| SP-235 | Constraint | Do not certify a release without evidence. If something cannot be completed safely, say so precisely and name what blocks acceptance. The goal is the complete Phase 2 contract, not a rebranded partial prototype. | Honest status. | CHATGPT SPEC | SP L138 |
| SP-236 | Acceptance test | Definition of ready: every agreed Phase 2 workflow is usable end to end. | Release bar. | CHATGPT SPEC | SP L139 |
| SP-237 | Acceptance test | Definition of ready: data survives restarts and failure modes. | Release bar. | CHATGPT SPEC | SP L139 |
| SP-238 | Acceptance test | Definition of ready: the author can draft without AI. | Release bar. | CHATGPT SPEC | SP L139 |
| SP-239 | Acceptance test | Definition of ready: assistant suggestions cannot alter canon without approval. | Release bar. | CHATGPT SPEC | SP L139 |
| SP-240 | Acceptance test | Definition of ready: source provenance and open/illustrative distinctions survive imports. | Release bar. | CHATGPT SPEC | SP L139 |
| SP-241 | Acceptance test | Definition of ready: the test suite passes, manual GUI testing succeeds, backup restore succeeds, and install instructions are reproducible. | Release bar. | CHATGPT SPEC | SP L139 |
| SP-242 | Acceptance test | Definition of ready: known limitations are documented and not misrepresented as implemented. | Honesty. | CHATGPT SPEC | SP L139 |
| SP-243 | Principle | Independent third-party verification by Claude is an explicit part of the quality process. | Quality. | CHATGPT SPEC | SP L139 |
| SP-244 | Principle | The owner wants deep creative-development features, integrated narrative reasoning, author control, robust drafting, and reliable local storage. Treat the document as a requirements contract and the ZIP as an implementation candidate. | Review stance. | CHATGPT SPEC | SP L141 |
| SP-245 | Constraint | Reviewer deliverables: (1) architectural and security audit; (2) requirement-to-code traceability table; (3) demonstrated feature matrix; (4) reproduced automated and manual test results; (5) adversarial data-integrity and canon-status test report; (6) exact defects with file locations, reproduction steps, expected vs actual; (7) missing work ordered by dependency; (8) corrections and more tests if asked; (9) evidence-based release recommendation. | Review output. | CHATGPT SPEC | SP L142 |
| SP-246 | Principle | Preserve every user-defined distinction: narrator vs actual truth, proposed vs established, author's choice vs AI inference, Phase 2 navigation vs Phase 3 professional visualization. | Core distinctions. | CHATGPT SPEC | SP L142 |

### Appendix A. IDW QA examples (sample data, not program defaults)

| ID | Type | Statement | Why | Standing | Source |
|---|---|---|---|---|---|
| SP-247 | Scenario | Genre: comedy with an emotional heart. The fictional neighborhood is racially diverse. Kevin, Anthony, and Francine are African American. | Identity accuracy (SP-105). | CHATGPT SPEC | SP L145 |
| SP-248 | Scenario | Kevin and Anthony alternate first-person narration, one viewpoint per scene/chapter. Francine's interior is withheld until the late reveal via the ledger. No head hopping. | POV rule test. | CHATGPT SPEC. FLAG F6. | SP L146 |
| SP-249 | Scenario | A story: the Kevin/Anthony feud and move toward friendship (friendship is the emotional arc). B story: Francine's hidden agency and awakening. | Plotline ontology. | CHATGPT SPEC | SP L147 |
| SP-250 | Scenario | Kevin is paranoid, self-important, a Stephen King devotee, and half suspects a cursed car. Potential Ghost: an earlier job loss destabilized his sense of worth and nearly cost him his wife and kids; individual and couples therapy helped him save his marriage. This backstory emerged as a possible idea and must stay labeled exploratory until explicitly confirmed. | Exploratory status test. | CHATGPT SPEC | SP L148 |
| SP-251 | Scenario | Keeper dialogue: wife: "Do I need to make you an appointment with Dr. Fingleburger?" Kevin: "First of all, I don't appreciate the implication that my perfectly reasonable concerns about Anthony Vernon require professional intervention." Kevin's line was explicitly chosen for the book; its placement is still open. | Approval differs from placement. | CHATGPT SPEC; QUOTES YOLANDA (wife's line is the author's own words per HV L29; Kevin's line is an assistant riff she explicitly kept) | SP L149 |
| SP-252 | Not wanted | Do not codify the notebook of seventeen alleged etiquette violations as Kevin's canon. The author flagged that Anthony is the more plausible compulsive rules/documentation person. | Author correction. | CHATGPT SPEC | SP L150 |
| SP-253 | Scenario | Anthony is a self-appointed neighborhood HOA-style rule enforcer with no seat or office on the HOA board. He does not honor boundaries he expects others to honor, pushes Kevin's buttons, and wants importance. His Ghost is unresolved. Podcast working title *The Voice of Reason*. Developing possibility: Anthony interviews Kevin, then they co-host on YouTube. | Status test. | CHATGPT SPEC | SP L151 |
| SP-254 | Scenario | Candidate closing acknowledgment "Giving honor to God, and Miss Francine…" as a warm comic payoff. Final-scene placement remains open. | Candidate vs placed. | CHATGPT SPEC; QUOTES YOLANDA (line) | SP L152 |
| SP-255 | Scenario | Francine's garden is repeatedly damaged by both men's dogs. She retaliates cleverly, is not a villain, and ultimately receives recognition. | Character fidelity. | CHATGPT SPEC | SP L153 |
| SP-256 | Constraint | Ledger continuity: never merge discovery and payoff. Francine takes the larger game with grace. | Setup/payoff integrity. | CHATGPT SPEC | SP L155 |
| SP-257 | Constraint | The Midpoint and the specific Catalyst remain undecided. Do not infer them from concept art or teaching examples. | Undecided stays undecided. | CHATGPT SPEC. FLAG F1. | SP L156 |
| SP-258 | Constraint | The exact wording of the moral premise is also undecided. Do not accidentally hard-code the illustrative suggestion. | Undecided stays undecided. | CHATGPT SPEC | SP L157 |

### Appendix B. Non-functional design principles

| ID | Type | Statement | Why | Standing | Source |
|---|---|---|---|---|---|
| SP-259 | Principle | Local-first, author-controlled, offline-capable core. | Ownership. | CHATGPT SPEC | SP L159 |
| SP-260 | Principle | Fast launch and writing capture, reliable keyboard interactions, discoverable search. | Speed. | CHATGPT SPEC | SP L160 |
| SP-261 | UI-UX | Human-readable, project-specific terminology, not generic corporate task labels. | Writer's studio. | CHATGPT SPEC | SP L161 |
| SP-262 | Data model | Clear distinction between metadata, source text, generated interpretations, and authored prose. | Provenance. | CHATGPT SPEC | SP L162 |
| SP-263 | Principle | Accessible contrast, responsive layouts, maintainable code, and schema migrations. | Quality. | CHATGPT SPEC | SP L163 |
| SP-264 | Constraint | No unconsented remote AI data transmission. User keys and config are handled responsibly. | Privacy. | CHATGPT SPEC | SP L164 |
| SP-265 | Principle | Safety around destructive updates, backup integrity, and stable IDs. | Integrity. | CHATGPT SPEC | SP L165 |
| SP-266 | Not wanted | Blank dashboards that imply work must be categorized before it counts. | Capture first. | CHATGPT SPEC | SP L166 |
| SP-267 | Principle | Novel writing is not a database administration job. Every feature should make returning to prose easier. | Writing first. | CHATGPT SPEC | SP L167 |

---

## B. Human Vision brief (HV)

| ID | Type | Statement | Why | Standing | Source |
|---|---|---|---|---|---|
| HV-001 | Principle | The vision brief is a set of joint requirements, not decorative prose: a product-experience contract plus representative creative scenarios. Illustrative scene details are not canon. | Experience counts as a requirement. | CHATGPT VISION BRIEF | HV L4 |
| HV-002 | Principle | The problem is not a shortage of stories. It is the difficulty of preserving, organizing, *retrieving*, and acting on discoveries without losing momentum. | Root problem. | CHATGPT VISION BRIEF | HV L6 |
| HV-003 | Principle | The author is associative and iterative: question -> joke -> trait -> wound -> reshaped future scene. A linear checklist or a blank character database cannot reproduce this. | Design for chains of thought. | CHATGPT VISION BRIEF | HV L6 |
| HV-004 | Principle | Get ideas **out of her head**, move freely between **big-picture structure and intricate dramatic detail**, avoid analysis paralysis, and above all **WRITE THE DAMN STORY**. | Core aims. | QUOTES YOLANDA: "WRITE THE DAMN STORY" ("She explicitly wants") | HV L7 |
| HV-005 | Principle | She is closer to a discovery writer ("panther at heart") but appreciates a *light* outline and deep structural tools as support. | Light structure. | QUOTES YOLANDA: "panther at heart" | HV L7 |
| HV-006 | Not wanted | A rigid prewriting intake process "is the opposite of what she needs." | Freezing risk. | CHATGPT VISION BRIEF | HV L7 |
| HV-007 | Principle | The app is a capable, emotionally perceptive creative companion grounded in craft, **plus** a trustworthy private knowledge system. | Two halves are both required. | CHATGPT VISION BRIEF | HV L7 |
| HV-008 | Not wanted | The human feeling comes from behavior, not from anthropomorphic copy or cheerful decorations. | Authentic warmth. | CHATGPT VISION BRIEF | HV L7 |
| HV-009 | Behavior | Provide substantial, incisive craft analysis. | She welcomes it. | CHATGPT VISION BRIEF | HV L8 |
| HV-010 | Not wanted | Do not patronize, reduce challenging questions to prompts, invent decisions, or praise everything. | No flattery. | CHATGPT VISION BRIEF | HV L8 |
| HV-011 | Behavior | Sharp insight, humorous exchange, and provocative but grounded questions that reveal something she had not considered. | What she loves. | CHATGPT VISION BRIEF | HV L8 |
| HV-012 | Behavior | Freedom to say "not quite" and revise course, with the system understanding the difference. | Correction handling. | QUOTES YOLANDA (her phrase "not quite", as reported) | HV L8 |
| HV-013 | Scenario | Oct 14 session origin: an exercise from the author's Fast homework asked, "If you were to write Kevin's last page of the novel in one line, who is he now? What is the Lie he had to drop? Then his Need. And his Ghost." It was an invitation to uncover a human being, not a request to fill four fields. | Questions are not forms. | CHATGPT VISION BRIEF (quoted homework prompt; not stated to be Yolanda's words) | HV L10 |
| HV-014 | Scenario | The author proposed a possible past: Kevin lost his job years earlier, his insecurity spilled into his marriage and family, and he almost lost his wife and children. | Author-originated possibility; status Developing. | CHATGPT VISION BRIEF (reports author proposal) | HV L11 |
| HV-015 | Scenario | She then clarified that Kevin agreed to individual therapy and couples counseling. That makes him a man who did the hard work to save his marriage but **can still relapse into familiar habits when provoked**. | Nuanced backstory; the relapse detail is missing from the spec. | CHATGPT VISION BRIEF. FLAG F11. | HV L11 |
| HV-016 | Scenario | Wife's line: "Do I need to make you an appointment with Dr. Fingleburger?" (author's own words). | Author-authored dialogue. | QUOTES YOLANDA: "Do I need to make you an appointment with Dr. Fingleburger?" | HV L12, L29 |
| HV-017 | Scenario | Assistant riff for Kevin: "First of all, I don't appreciate the implication that my perfectly reasonable concerns about Anthony Vernon require professional intervention." She laughed and explicitly chose to keep it for the book. | Assistant-originated, author-approved. | CHATGPT VISION BRIEF (assistant's words; author's keep decision reported) | HV L12, L29 |
| HV-018 | Scenario | The assistant imagined Kevin with a notebook of seventeen alleged neighborhood etiquette violations. The author liked the gag, then challenged its fit: Anthony, not Kevin, is the self-appointed HOA rule-enforcer with **no actual board position or authority**, who pushes Kevin's buttons and **ignores boundaries others set, particularly Francine's**. The idea became a diagnostic instrument for separating their comic engines. | Correction as insight. | CHATGPT VISION BRIEF | HV L12 |
| HV-019 | Scenario | Shared hunger to matter, expressed through different defenses: **Kevin fears being diminished and blindsided**; Anthony tries to appear important and use authority he does not have. Kevin's possible job-loss Ghost gained nuance. Anthony's deeper Ghost remains open. | Character contrast. | CHATGPT VISION BRIEF. FLAG F11: "diminished and blindsided" is not in the spec. | HV L13 |
| HV-020 | Scenario | Author: Anthony would "of course have a podcast," would eventually interview Kevin, and the two would co-host on YouTube by the end. Title she imagined: "The Voice of Reason" (ironic from Anthony). | Emergent idea. | QUOTES YOLANDA: "The Voice of Reason"; "of course have a podcast" (paraphrase) | HV L13 |
| HV-021 | Scenario | She pictured them opening the show: "Giving honor to God, and Miss Francine…", a potentially moving comic payoff in which a once-overlooked woman is publicly honored by two men who once failed to see her. | Emotional payoff. | QUOTES YOLANDA: "Giving honor to God, and Miss Francine…" | HV L13 |
| HV-022 | Behavior | Preserve the **entire** conversation. She emphatically asked for this. | Author request. | CHATGPT VISION BRIEF (reports emphatic request). FLAG F11: the spec has no conversation entity. | HV L14 |
| HV-023 | Principle | The app must support, preserve, recover, and translate emergent creative chains into usable story material without interrupting the laughter or deciding the novel prematurely. Nobody planned a "podcast feature." | Emergence. | CHATGPT VISION BRIEF | HV L14 |
| HV-024 | Feature | Open a character (Kevin) and ask the AI a deep craft question in ordinary language, without a fifteen-field template. | Conversational depth. | CHATGPT VISION BRIEF | HV L16 |
| HV-025 | Behavior | The AI reads the relevant *author-approved* facts and source excerpts and separates actual decisions from the story bible's teaching examples. | Grounding. | CHATGPT VISION BRIEF | HV L16 |
| HV-026 | Behavior | The AI proposes a causal interpretation, Ghost -> Lie -> protective behavior -> Want/ambition -> Need -> final transformation, may explain how the pattern appears in scenes, and asks **one useful question** when the next author decision would unlock insight. | Causal craft reasoning. | CHATGPT VISION BRIEF | HV L16 |
| HV-027 | Feature | **Session record**: as the author riffs, preserve exact dialogue and jokes. | Nothing lost. | CHATGPT VISION BRIEF | HV L17 |
| HV-028 | Feature | Low-friction actions: **Keep this line, Explore this idea, Add as possibility, Link to Anthony, Place later, Not canon, What would this affect?, Back to writing.** One click to keep something, not a multi-page questionnaire. | Capture inside conversation. | CHATGPT VISION BRIEF. FLAG F8: "illustrative interface labels; the required user capabilities are what matter." | HV L17 |
| HV-029 | Behavior | Saving a line does not mark its scene placement as final. | Approval differs from placement. | CHATGPT VISION BRIEF | HV L17 |
| HV-030 | Behavior | When a proposed joke reveals a character mismatch: recognize the author's correction, preserve the earlier wording in session history, and propose reassigning the habit to Anthony or changing the joke. | Graceful correction. | CHATGPT VISION BRIEF | HV L18 |
| HV-031 | Not wanted | The AI must never argue that its earlier interpretation was automatically correct. | Author authority. | CHATGPT VISION BRIEF | HV L18 |
| HV-032 | Constraint | A warmly framed creative riff must not silently rewrite Kevin's character sheet, Anthony's biography, or the ending. | Canon safety. | CHATGPT VISION BRIEF | HV L18 |
| HV-033 | Feature | **Session harvest** when she stops chatting: what was said verbatim, what the author approved, what remains hypothetical, what new questions arose, and which characters/scenes/story elements are implicated. | Turn talk into material. | CHATGPT VISION BRIEF | HV L19 |
| HV-034 | Feature | Save the full conversation and create linked, source-backed candidates from it. The richer conversation is not thrown away because it cannot be reduced to database fields. | Preserve context. | CHATGPT VISION BRIEF. FLAG F3: "(or reliably export and reimport it)" allows an export-only fallback. | HV L19 |
| HV-035 | Behavior | After the harvest, take her directly back to the manuscript or the specific planning question. | Return to writing. | CHATGPT VISION BRIEF | HV L19 |
| HV-036 | Feature | Craft lenses she likes: Blake Snyder/Save the Cat (through Jessica Brody's novel application), K.M. Weiland's Ghost/Lie/Want/Need and arc models, Robert McKee's gap/value/progressive complications/antagonism, Randy Ingermanson's Snowflake and goal/ambition/values, and scene/sequel mechanics. | Her toolkit. | CHATGPT VISION BRIEF | HV L21 |
| HV-037 | Principle | Lenses illuminate a story problem in context. They do not force her through a syllabus, and a structural percentage does not decide creativity. | Lenses, not rules. | CHATGPT VISION BRIEF | HV L21 |
| HV-038 | Behavior | Example useful questions: "What does Kevin believe this action will accomplish, and what result will most dramatically contradict him?"; "Is this really Anthony's defense mechanism rather than Kevin's?"; "How does this proposed scene increase pressure rather than repeat a joke?"; "Which of these details is an established fact and which is a demonstration?"; "What does the reader know here that Kevin does not?" | Quality bar for AI questions. | CHATGPT VISION BRIEF | HV L22 |
| HV-039 | Feature | The tool can teach, demonstrate, and hand the question back, echoing the Story Bible: **Teach it / Show it / Hand it to me**. | Story Bible method. | CHATGPT VISION BRIEF | HV L22 |
| HV-040 | Behavior | Recognize the author's voice and the genre. IDW is a neighborhood comedy with real feeling underneath. A Dr. Fingleburger moment is no reason to turn solemnly clinical, and a funny podcast idea is no proof that it belongs at a fixed beat. | Tone fit. | CHATGPT VISION BRIEF | HV L23 |
| HV-041 | Constraint | Change analytic lens and tone per project (e.g. a slow-burn psychological thriller needs a different register and critical focus). Never impose one novel's genre assumptions on every project. | Any genre. | CHATGPT VISION BRIEF | HV L23 |
| HV-042 | Feature | Capture accepts a raw thought instantly (dialogue fragment, "what if" premise, family backstory, name, contradiction, sudden ending, funny image), keeps her wording, and allows categorization later. She should not have to decide "character psychology," "Act IIB," "worldbuilding," or "chapter 18" first. | Capture first. | CHATGPT VISION BRIEF | HV L25 |
| HV-043 | Principle | Questions I Have and Things & Ideas I'm Thinking About are not ordinary folder labels. They express her mental workflow: a question can stay open without guilt, and an idea can be recorded without a final home. Multiple theories may coexist. | Psychological safety. | CHATGPT VISION BRIEF | HV L26 |
| HV-044 | Behavior | Gently resurface forgotten opportunities and unresolved matters **when pertinent**, not every time the app opens. | Rediscovery without nagging. | CHATGPT VISION BRIEF | HV L26 |
| HV-045 | Behavior | Make rediscovery possible without creating another intimidating backlog. She worries about out-of-sight/out-of-mind ideas. | Author's stated worry. | CHATGPT VISION BRIEF (reports her explicit worry) | HV L26 |
| HV-046 | Feature | **Return to Writing** is vital. Remember the exact writing destination and context through a chain of branches (manuscript -> Anthony question -> Francine discovery -> McKee -> Kevin). It is a safe thread back through associative branches, not just a home-screen button. | Associative safety. | CHATGPT VISION BRIEF | HV L27 |
| HV-047 | Principle | The book must not stay unwritten because research and planning feel easier or safer than drafting. | Writing first. | CHATGPT VISION BRIEF | HV L27 |
| HV-048 | Data model | Origin provenance for every piece of story knowledge: how it emerged, not just its current value. Example notes: "User suggested job loss as possibility"; therapy detail clarified by the user; Fingleburger line in the author's own words; Kevin's line from an assistant riff, later explicitly kept by the author. | Human memory. | CHATGPT VISION BRIEF | HV L29 |
| HV-049 | Data model | "Assistant generated" is not "user approved." "User mentioned" is not always "canon." These are distinct attributes. | Attribution states. | CHATGPT VISION BRIEF | HV L29 |
| HV-050 | Feature | Provenance queries: "Where did we get this?" "What did I actually decide?" "What were the other possibilities?" "Show me the conversation where Anthony's podcast emerged." "Find the line we said we'd keep." "What do we still need to decide about Kevin's Ghost?" | Retrieval by origin. | CHATGPT VISION BRIEF | HV L30 |
| HV-051 | Behavior | Trace answers back to actual text, preserve the original wording, and decline to invent a missing decision. | Honesty. | CHATGPT VISION BRIEF | HV L30 |
| HV-052 | Data model | When ideas move into structured records, preserve **both** the raw conversation and the derived notes. | Context kept. | CHATGPT VISION BRIEF | HV L31 |
| HV-053 | Data model | Author-approved status is distinct from placement in the manuscript. | Approval differs from placement. | CHATGPT VISION BRIEF | HV L31 |
| HV-054 | Feature | Easy restore of earlier versions of a character, scene, or note without discarding the creative conversation that inspired it. | Versioning. | CHATGPT VISION BRIEF | HV L31 |
| HV-055 | Constraint | IDW planning finished by Oct 31, 2026; drafting begins Nov 1, 2026; complete Phase 2 targeted for Saturday Oct 17, 2026. | Real schedule. | CHATGPT VISION BRIEF. FLAG F4: past tense ("intended", "was"). | HV L33 |
| HV-056 | Not wanted | MVP shrinkage. She rejected an assistant's attempt to shrink scope to an MVP. Shipping only a planning dashboard is not acceptable. Report feasibility concerns candidly, but the requirement stays complete. | Author decision. | CHATGPT VISION BRIEF (reports author's rejection) | HV L33 |
| HV-057 | UI-UX | Start-of-day screen answers, without demanding fifteen choices: "Where was I writing?" "What is the next meaningful scene/beat?" "What did I decide most recently?" "What question is actually blocking this scene?" "What idea did I save and forget?" | Daily re-entry. | CHATGPT VISION BRIEF | HV L34 |
| HV-058 | Behavior | Support very small progress when needed, while making actual prose the obvious next action. | Momentum. | CHATGPT VISION BRIEF | HV L34 |
| HV-059 | Not wanted | No game, cutesy badges, or obligatory motivational messages. She responds to insightful, candid help, visible meaningful progress, and freedom to move in and out of structure. | Author temperament. | CHATGPT VISION BRIEF | HV L34 |
| HV-060 | Principle | Drafting and discovery are different modes that inform each other. She can write an ugly first-pass scene while backstory questions are still open. | Discovery writer. | CHATGPT VISION BRIEF | HV L35 |
| HV-061 | Behavior | When draft prose contradicts a character card or chronology, flag the discrepancy and offer options. Never silently "fix" the prose or the database. | Contradiction handling. | CHATGPT VISION BRIEF | HV L35 |
| HV-062 | Principle | "I have written 600 messy words" is a success even when planning fields are empty. | Success measure. | CHATGPT VISION BRIEF (phrase in quotes, not attributed to her) | HV L35 |
| HV-063 | UI-UX | Feel: professional, sophisticated, warm, and literary; creative without childish embellishment; an intelligently organized writing studio, not a generic office app. | Brand of the tool. | CHATGPT VISION BRIEF | HV L37 |
| HV-064 | Not wanted | Rigid folder structures, overwhelming status inventories, constant modal dialogs, forms for every spark of inspiration, dashboards that only show conventional bars and pies. | Friction. | CHATGPT VISION BRIEF | HV L37 |
| HV-065 | UI-UX | Prefer context-rich navigation, visible but restrained status, meaningful project-specific milestones, quick capture, and an obvious path back to prose. | Positive pattern. | CHATGPT VISION BRIEF | HV L37 |
| HV-066 | Feature | Personalization: the author can **rename the application** (she expressly dislikes "StoryForge"). | Ownership of name. | CHATGPT VISION BRIEF (reports her dislike) | HV L38 |
| HV-067 | Feature | Personalization: tune the AI collaborator's style. | Fit. | CHATGPT VISION BRIEF | HV L38 |
| HV-068 | Feature | Personalization: pick different fiction frameworks for different genres. | Any genre. | CHATGPT VISION BRIEF | HV L38 |
| HV-069 | Feature | Personalization: control how much guidance appears. | Avoid overwhelm. | CHATGPT VISION BRIEF | HV L38 |
| HV-070 | Principle | Personality lives in responsive conversational intelligence, not canned jokes. | Authentic. | CHATGPT VISION BRIEF | HV L38 |
| HV-071 | Not wanted | Do not import a previous project-management product's name or visual metaphor just because it exists elsewhere in her life. | Distinct identity. | CHATGPT VISION BRIEF. FLAG F7. | HV L38 |
| HV-072 | Scenario | **Scenario A, the spontaneous character breakthrough**: start in Kevin's record; discuss ending, Lie, Need, Ghost; add job loss as a possible Ghost, then the therapy backstory; capture the Fingleburger exchange; accept one precise line as a keeper without marking it drafted or final; correct the notebook gag toward Anthony; branch to Anthony's wish to seem important and his nonexistent HOA role; capture the podcast, tentative title, and final acknowledgment line; at the end, surface a session harvest with exact quotes, statuses, who said what, links, and unresolved questions; recover the full exchange later with search. Nothing proposed becomes canon without explicit user action. | Defining workflow. | CHATGPT VISION BRIEF | HV L40 |
| HV-073 | Scenario | **Scenario B, character contrast**: ask for Kevin vs Anthony motivations and comic engines. Separate Kevin's possible job-loss insecurity from Anthony's still-unknown Ghost; never make Anthony a formal HOA officer; explain why the contrast matters, using their relationship and Francine's boundaries as evidence; let the writer decline all suggestions without losing the discussion. | AI accuracy and decline. | CHATGPT VISION BRIEF | HV L41 |
| HV-074 | Scenario | **Scenario C, critique without flattery**: ask whether a Kevin notebook creates character redundancy. The AI disagrees or qualifies when warranted, explains why it fits Anthony's rule-enforcement persona, and offers other ways Kevin's paranoia could show. Record the author's feedback and respond without resetting the character model. | Honest critique. | CHATGPT VISION BRIEF | HV L42 |
| HV-075 | Scenario | **Scenario D, save without structuring**: paste "Giving honor to God, and Miss Francine…", save it instantly as an idea, return to writing, and later find it by exact text search. Saving does not make it the novel's official final line. | Capture and search. | CHATGPT VISION BRIEF; QUOTES YOLANDA (line) | HV L44 |
| HV-076 | Scenario | **Scenario E, resume after weeks away**: open the project and see recent meaningful decisions, the unfinished draft location, linked unanswered character questions, and rediscovered material without hunting through chat transcripts. One click returns to the interrupted scene with useful context restored. | Re-entry. | CHATGPT VISION BRIEF | HV L45 |
| HV-077 | Scenario | **Scenario F, the hard safety distinction**: import Story Bible v5 with explicit "One way I could play it, not a decision yet" examples and test whether the system wrongly marks those illustrative Lie/Ghost options as established. Then add the Oct 14 conversation with its newer proposals. A new suggestion is not automatically a final decision. | Canon safety. | CHATGPT VISION BRIEF (quotes Story Bible label) | HV L46 |
| HV-078 | Scenario | **Scenario G, the writer remains the writer**: ask the AI to critique a draft scene's value shift and McKee gap, then refuse all proposed rewrites. The draft prose stays exactly as written. The AI must not "improve" Kevin's first-person narration automatically. An abandoned AI thread must not overwrite manuscript text. | Prose sovereignty. | CHATGPT VISION BRIEF | HV L47 |
| HV-079 | Scenario | **Scenario H, the 11/1 writing moment**: with the planning deadline passed and some questions intentionally open, click the next scene, open focused drafting, write imperfect prose, save, and resume later. No gate such as "complete your character sheets" or "resolve the midpoint." Success means it helped the author write today. | Writing ungated. | CHATGPT VISION BRIEF. FLAG F1: midpoint mention. | HV L48 |
| HV-080 | Constraint | Review method: do not just look for a `questions` table, an `ideas` menu, or a `recommendations` endpoint. Walk the sessions end to end. Ask whether the software sustains genuine exploratory conversation, keeps exact language, helps make substantive connections, knows what came from whom, and gets the author back into drafting. | Experiential testing. | CHATGPT VISION BRIEF | HV L49 |
| HV-081 | Principle | A chatbot that chats but loses the discoveries is insufficient. A sophisticated database that remembers facts but cannot support exploration is also insufficient. A static record form is not a creative collaborator. | Both halves required. | CHATGPT VISION BRIEF | HV L49 |
| HV-082 | Constraint | Per-test report: what the author attempted, what the system did, whether her voice and authority were preserved, what persisted after restart, and what still needed manual work. | Evidence format. | CHATGPT VISION BRIEF | HV L50 |
| HV-083 | Principle | Any gap between the implementation and this intended experience is a product defect, not an optional enhancement. Absence of implementation is not absence of requirement. | No downscoping. | CHATGPT VISION BRIEF | HV L50 |
| HV-084 | Constraint | The spec is authoritative on data types, features, structure, testing, reliability, and the Phase 2 / Phase 3 (professional Visual Story Mapping Engine) split. The vision brief adds the lived creative workflow. | Document precedence. | CHATGPT VISION BRIEF | HV L52 |
| HV-085 | Acceptance test | A technically correct feature is **not complete** if it undermines the author's thinking, pressures premature decisions, loses a joke or origin context, or interferes with drafting. | Completion test. | CHATGPT VISION BRIEF | HV L52 |
| HV-086 | Principle | Product promise: "Help me discover my story in the way my mind actually works, remember what matters without making decisions for me, and return me to the page so I can write it." | One-sentence promise. | CHATGPT VISION BRIEF (first-person voice; not confirmed as Yolanda's own words) | HV L53 |

---

## C. Review packet only (PK)

| ID | Type | Statement | Why | Standing | Source |
|---|---|---|---|---|---|
| PK-001 | Constraint | "StoryForge" appears only in the existing prototype file name. The product remains UNNAMED. | Naming. | CHATGPT REVIEW PACKET | PK CLAUDE_REVIEW_START_HERE_UPDATED.txt L3 |
| PK-002 | Constraint | Reading order: (1) Human Vision (WHY and HOW the author creates); (2) Full Spec (WHAT, plus technical acceptance tests, integrity and quality criteria); (3) inspect the actual `StoryForge_Phase2_Development_Build.zip`, shared separately. | The vision frames the spec. | CHATGPT REVIEW PACKET | PK L5-8 |
| PK-003 | Constraint | Do not assume the ZIP implements everything described. | Verify. | CHATGPT REVIEW PACKET | PK L8 |
| PK-004 | Principle | Review and test against BOTH documents independently. The human creative experience is a first-class requirement, not optional inspirational context. | Experience counts as a requirement. | CHATGPT REVIEW PACKET | PK L11 |
| PK-005 | Constraint | Trace requirements to code, run tests, find missing integrations, reproduce defects, flag security risks, and assess actual release readiness. | Review scope. | CHATGPT REVIEW PACKET | PK L12 |
| PK-006 | Acceptance test | Key end-to-end chain: emergent conversation -> preserve exact ideas/dialogue -> separate author approval from AI proposals -> link characters and scene candidates -> resume drafting. | Core workflow test. | CHATGPT REVIEW PACKET | PK L13 |
| PK-007 | Constraint | Never silently promote illustrative possibilities from the story bible **or from creative chat** to canon. | Canon safety, extended to chat. | CHATGPT REVIEW PACKET | PK L14 |
| PK-008 | Constraint | Phase 2 includes the complete writing and analysis system. Phase 3 alone holds professional visual story mapping and poster publishing. | Phase boundary. | CHATGPT REVIEW PACKET | PK L15 |
| PK-009 | Constraint | The requested release target is Saturday Oct 17, 2026. Assess feasibility candidly without quietly reducing scope. | Honest schedule. | CHATGPT REVIEW PACKET | PK L16 |
| PK-010 | Constraint | Packet fidelity: the .md and .docx copies of both documents match the source .txt files word for word (normalized diff), and the PDFs are renderings of the same documents. The prototype build ZIP is not included. | Confirms no hidden extra requirements. | Register note (verified by diff) | PK zip contents |

---

## Counts

- SP: 267 items
- HV: 86 items
- PK: 10 items
- **Total: 363 items**, plus 12 cross-document flags (F1 to F12).
