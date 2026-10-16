# Section 2 Requirements Register (lines 3177 to 6138)

Source file: 90955321-Story_Map_Planning_FULL_with_code.md. Conversation dates 2026-10-14 onward (times ET). "Y" = Yolanda, "GPT" = ChatGPT. Line numbers refer to the source file.

Note on context: the section opens immediately after ChatGPT's long multi-point program vision (before line 3177, outside this range) that included a numbered list (item 15 = "Narrative Zoom") and the guiding principle at line 3173: "The system should understand the complexity of the story so the author doesn't have to carry all that complexity in her head." Items here that refer to "earlier" ideas possibly relate to Section 1 decisions.

---

### S2-001
- Type: Principle
- Statement: Yolanda wholeheartedly adopts ChatGPT's preceding program vision ("I am in love with everything you said! You understand what I shared completely"), including the guiding principle that the system understands the story's complexity so the author doesn't have to carry it all in her head.
- Why: The program exists to offload cognitive load of complex, interlocking stories.
- Standing: DECIDED BY YOLANDA (adopted: "I am in love with everything you said!")
- Source: 3171-3179, 10:35 ET
- Relationship: ADDS TO earlier Section 1 vision (possibly relates to an earlier decision: the numbered feature list before line 3177).

### S2-002
- Type: Feature
- Statement: Causal-chain weakness detection: if Scene 1 triggers Scene 2, which triggers 3, then 4, and the author's Scene 2 is weak, it "cannot logically create the next chain reaction"; the program must be "smart enough to see that and identify that and bring it to the author."
- Why: A weak link breaks the logical chain to later scenes; Yolanda had this as a concern about causal relationships.
- Standing: DECIDED BY YOLANDA ("the program needs to be smart enough to see that and identify that and bring it to the author")
- Source: 3181, 10:35 ET
- Relationship: ADDS TO earlier causal-relationship items in Section 1 (she notes GPT's prior plan already addressed it).

### S2-003
- Type: Feature
- Statement: Narrative Zoom (GPT's numbered item 15 from before this section): honing in on a particular section of the story. Yolanda: "I love it!"
- Why: Lets the author focus on one part of a complex story.
- Standing: DECIDED BY YOLANDA ("you called it the narrative zoom, I love it!")
- Source: 3183, 10:35 ET
- Relationship: ADDS TO earlier Section 1 proposal (GPT item 15); possibly relates to an earlier decision.

### S2-004
- Type: Feature
- Statement: "Causal integrity analysis" named as a core capability: the system must distinguish a MISSING connection from an UNCONVINCING connection between scenes.
- Why: "A story can contain individually excellent scenes and still fail because the logic connecting them doesn't hold."
- Standing: ACCEPTED PROPOSAL (GPT named it; Yolanda at 10:43 and 10:55 says she agrees with everything)
- Source: 3191-3195, 10:35 ET
- Relationship: ADDS TO S2-002 (names and refines her request).

### S2-005
- Type: Behavior / Scenario
- Statement: For a chain Scene 1 → 2 → 3 → 4, the program examines the dramatic logic of each transition and flags e.g. "Potential causal weakness: Scene 2 → Scene 3" with an explanation (example: Scene 3 depends on Kevin believing Anthony deliberately humiliated him, but Scene 2 only establishes an inconvenience; escalation may be insufficiently supported).
- Why: Gives concrete, specific diagnosis rather than vague advice.
- Standing: ACCEPTED PROPOSAL (behavior); the Kevin/Anthony text is EXAMPLE / ILLUSTRATION
- Source: 3199-3217, 10:35 ET
- Relationship: ADDS TO S2-004.

### S2-006
- Type: Constraint
- Statement: The program must NOT automatically rewrite a weak scene (e.g., Scene 2). Instead it offers diagnostic questions and optional approaches to strengthen the causal connection (e.g., public humiliation; triggering an established insecurity; misunderstanding compounded by earlier knowledge). "The author decides."
- Why: Author sovereignty; program is not a ghostwriter.
- Standing: ACCEPTED PROPOSAL (Yolanda at 10:43: "I like that you say that this program does not write the novel and it does not make the changes to it")
- Source: 3221-3227, 10:35 ET; confirmed 3337
- Relationship: ADDS TO S2-004.

### S2-007
- Type: Feature
- Statement: Dependency tracking identifies all downstream scenes (e.g., Scenes 4 and 5) that rely on the same unsupported assumption as the weak link.
- Why: "Substantially more useful than software that merely says, 'Your pacing seems slow.'"
- Standing: ACCEPTED PROPOSAL
- Source: 3229-3231, 10:35 ET
- Relationship: ADDS TO S2-004; ties to dependency tracking from earlier (possibly relates to Section 1).

### S2-008
- Type: Feature / Scenario
- Statement: Removal test ("load-bearing" analysis): if Scene 2 is removed, the system asks "Does Scene 3 still make sense?" If yes, Scene 2 may not be structurally necessary; if removal destroys motivation for Scenes 3, 4 and 7, Scene 2 is load-bearing. Load-bearing does not mean good.
- Why: Distinguish structural responsibility from quality.
- Standing: ACCEPTED PROPOSAL
- Source: 3235-3247, 10:35 ET
- Relationship: ADDS TO S2-004.

### S2-009
- Type: Data model / Principle
- Statement: Three separate scene-evaluation dimensions: Structural importance (how much depends on it), Dramatic effectiveness (does it accomplish its purpose convincingly), Causal integrity (does outcome support what follows). A scene can score high on one and low on another. Do NOT reduce to a single arbitrary numerical score; give a clear explanation of what works, what is questionable, and what depends on it.
- Why: Single scores mislead; explanation is actionable.
- Standing: ACCEPTED PROPOSAL
- Source: 3249-3259, 10:35 ET
- Relationship: ADDS TO S2-008.

### S2-010
- Type: Not wanted
- Statement: No single arbitrary numeric quality score for scenes.
- Why: Hides the distinction among importance, effectiveness and integrity.
- Standing: ACCEPTED PROPOSAL
- Source: 3257, 10:35 ET
- Relationship: ADDS TO S2-009.

### S2-011
- Type: Data model / UI-UX
- Statement: Narrative Zoom hierarchy: STORY → ACT → SEQUENCE → SCENE → BEAT.
- Why: Levels of dramatic structure to zoom between.
- Standing: ACCEPTED PROPOSAL (Yolanda loves Narrative Zoom; later (3705) GPT itself says this hierarchy must not be universally mandatory)
- Source: 3265-3267, 10:35 ET
- Relationship: ADDS TO S2-003. Later qualified by S2-055 (hierarchy optional) and generalized by S2-162, which does not cancel it but makes it a default model.

### S2-012
- Type: UI-UX
- Statement: "Zooming shouldn't mean losing context": when examining a scene, a breadcrumb/contextual trail shows its position, e.g. "I Declare War → Act II → Sequence 4 → Scene 17."
- Why: Prevent disorientation when focused deep in the structure.
- Standing: ACCEPTED PROPOSAL
- Source: 3271-3275, 10:35 ET
- Relationship: ADDS TO S2-003.

### S2-013
- Type: Feature / UI-UX
- Statement: From any scene in Narrative Zoom, the author can examine incoming causes, outgoing consequences, character-value changes, and connections to later payoffs.
- Why: Investigate relationships from the focal point.
- Standing: ACCEPTED PROPOSAL
- Source: 3277, 10:35 ET
- Relationship: ADDS TO S2-003.

### S2-014
- Type: UI-UX / Principle
- Statement: Two navigation dimensions in Narrative Zoom: Vertical navigation (moving between levels of dramatic structure) and Horizontal navigation (following cause and effect, character development, thematic relationships across the story).
- Why: "What could make Narrative Zoom genuinely different from a conventional outlining application."
- Standing: ACCEPTED PROPOSAL
- Source: 3279-3285, 10:35 ET
- Relationship: ADDS TO S2-003.

### S2-015
- Type: Feature
- Statement: The Ripple Effect (provisional name): when the author moves an event (example: moving the discovery of Francine's ledger in IDW by dragging it to a new position), the system recognizes and highlights what may be affected: timing of the revelation, the reader's knowledge, the men's motivation, the All Is Lost reversal, and leverage used in the finale. Highlighted as potential consequences, "not as errors necessarily." Each relationship can be followed via Narrative Zoom.
- Why: "Experiment with different story structures without losing track of the consequences."
- Standing: ACCEPTED PROPOSAL (Yolanda agrees with everything at 10:43/10:55; named later in her own work as Ripple Effect)
- Source: 3289-3303, 10:35 ET
- Relationship: ADDS TO S2-007.

### S2-016
- Type: Story fact (IDW)
- Statement: IDW contains "Francine's ledger," whose discovery is an event; it affects the men's motivation, the All Is Lost reversal, and the leverage the men use in the finale.
- Why: Used as Ripple Effect example; reveals plot dependencies.
- Standing: EXAMPLE / ILLUSTRATION (the dependencies listed are illustrative; the ledger itself presumably comes from her story bible, possibly relates to Section 1 facts)
- Source: 3291-3295
- Relationship: possibly relates to earlier IDW story facts.

### S2-017
- Type: UI-UX
- Statement: Drag-and-drop repositioning of events/scenes in the story structure.
- Why: Enables the Ripple Effect experimentation.
- Standing: ACCEPTED PROPOSAL (implicit)
- Source: 3293
- Relationship: ADDS TO S2-015.

### S2-018
- Type: Principle / Constraint
- Statement: Distinguish deterministic checks (missing links, inconsistent dates, a character using information before learning it) from interpretive analysis (whether motivation is convincing), which is probably AI-assisted and "should always remain open to the author's judgment."
- Why: "That's how we avoid building a program that confidently gives bad writing advice."
- Standing: ACCEPTED PROPOSAL (Yolanda: "definitely we don't want to give any bad writing advice")
- Source: 3305-3307, 10:35 ET; 3337
- Relationship: ADDS TO S2-004. Restated in S2-034.

### S2-019
- Type: Feature (deterministic check)
- Statement: Knowledge-timing check: flag a character using information before learning it. Also date consistency checks.
- Why: Objective continuity errors.
- Standing: ACCEPTED PROPOSAL
- Source: 3305
- Relationship: ADDS TO S2-018.

### S2-020
- Type: Process / Constraint
- Statement: The three posters are still the first deliverables, and serve as prototypes for the larger application; visual relationships developed for posters reveal what the software needs to understand.
- Why: Don't lose the original objective (giant poster to visualize IDW).
- Standing: DECIDED BY YOLANDA at 10:55 ("yes we start with building the three posters first")
- Source: 3311-3319, 10:35 ET; 3603
- Relationship: possibly relates to an earlier decision (three posters: chronological, relationship, hybrid, set in Section 1).

### S2-021
- Type: Principle
- Statement: "Every element should know where it belongs, what it depends on, what depends on it, and what changes because of it."
- Why: Turns maps into "tools for understanding whether the story actually works."
- Standing: ACCEPTED PROPOSAL
- Source: 3323-3327, 10:35 ET
- Relationship: ADDS TO S2-001.

### S2-022
- Type: Principle
- Statement: Build around a real novel (IDW) with real structural challenges rather than generic examples; IDW is the concrete test of every design decision.
- Why: Concreteness tests design.
- Standing: ACCEPTED PROPOSAL (later balanced by Yolanda's insistence the program is for all genres, S2-048)
- Source: 3329
- Relationship: ADDS TO S2-020.

### S2-023
- Type: Process
- Statement: Next productive move proposed: formally define the story data model and relationships, using the existing story bible as initial source and preserving the distinction between established decisions and possibilities.
- Why: Foundation for posters, Narrative Zoom, causal analysis and Ripple Effect without reinventing later.
- Standing: UNANSWERED PROPOSAL (Yolanda replied with a different addition rather than addressing this; she generally "agrees with everything")
- Source: 3331-3333
- Relationship: possibly relates to earlier decision on decided-vs-possibility distinction (Section 1).

### S2-024
- Type: Data model / Principle
- Statement: The story data must preserve the distinction between established decisions and possibilities.
- Why: Story bible contains both; analyses and posters must not treat options as canon.
- Standing: ACCEPTED PROPOSAL (possibly relates to an earlier Yolanda decision)
- Source: 3331
- Relationship: ADDS TO S2-023.

### S2-025
- Type: Principle
- Statement: The program does not write the novel and does not make changes to it. "The author is the main and final judge."
- Why: Author ownership; avoid bad advice.
- Standing: DECIDED BY YOLANDA ("The author is the main and final judge")
- Source: 3337, 10:43 ET
- Relationship: ADDS TO S2-006.

### S2-026
- Type: Not wanted
- Statement: Never give bad writing advice.
- Why: Author trust.
- Standing: DECIDED BY YOLANDA ("definitely we don't want to give any bad writing advice")
- Source: 3337
- Relationship: ADDS TO S2-018.

### S2-027
- Type: Feature
- Statement: The program may suggest resources to look at (books, websites, etc.). "We, the program, aren't teaching them per se but we give them advice on where to find additional information."
- Why: Help authors grow without the program acting as teacher or authority.
- Standing: DECIDED BY YOLANDA ("maybe we can give the author suggestions for resources to look at")
- Source: 3337, 10:43 ET
- Relationship: new.

### S2-028
- Type: Principle
- Statement: "The program is a story architect's assistant, not a ghostwriter, creative director, or writing instructor." Purpose: help authors understand their stories, recognize potential weaknesses, explore possibilities, and make informed decisions; the author owns story, choices, final judgment.
- Why: Foundational principle, not a feature.
- Standing: ACCEPTED PROPOSAL (Yolanda 10:55: "I agree with everything said")
- Source: 3345-3351
- Relationship: RESTATEMENT OF S2-025 / S2-027 (faithful).

### S2-029
- Type: Feature
- Statement: Contextual craft resource library.
- Why: From S2-027.
- Standing: ACCEPTED PROPOSAL
- Source: 3353
- Relationship: ADDS TO S2-027.

### S2-030
- Type: UI-UX / Behavior
- Statement: When a concern is flagged (e.g., "Potential concern: Character motivation" with explanation), the program offers three choices: Examine the connection (open Narrative Zoom on scenes/dependencies); Explore possibilities (questions that might strengthen motivation, without rewriting either scene); Find craft resources (books, articles, educational materials on the concept).
- Why: Guide investigation without dictating.
- Standing: ACCEPTED PROPOSAL
- Source: 3355-3373
- Relationship: ADDS TO S2-005, S2-029.

### S2-031
- Type: Not wanted
- Statement: When flagging, the program does not declare the writing bad, does not insist on a particular solution, does not automatically change the manuscript, and does not pretend its interpretation is necessarily correct.
- Why: Author sovereignty / humility.
- Standing: ACCEPTED PROPOSAL
- Source: 3375-3383
- Relationship: ADDS TO S2-025.

### S2-032
- Type: Feature
- Statement: Resource recommendations are context-aware and specific to the problem, not a generic library of hundreds of books. Example mapping table: weak scene-to-scene causality → Scene and Sequel; Goal, Conflict, Disaster → Swain, Techniques of the Selling Writer; Ingermanson resources. Scene lacks turn → story values, turning points, expectation/result gap → McKee, Story. Unsupported motivation → Lie, Want, Need, Ghost; internal conflict → Weiland, Creating Character Arcs. Midpoint lacks reversal → false victory/defeat, stakes → Brody, Save the Cat! Writes a Novel. Setup/payoff → foreshadowing, narrative promises, revelation → Truby, The Anatomy of Story. Comedy not escalating → comic structure, character-driven humor → Kaplan, The Hidden Tools of Comedy.
- Why: Relevance; "examples of resources we could include, not claims that any one author has the definitive answer."
- Standing: ACCEPTED PROPOSAL (concept); the table is EXAMPLE / ILLUSTRATION
- Source: 3385-3402
- Relationship: ADDS TO S2-029. Craft frameworks named: Swain, Ingermanson, McKee, Weiland, Brody, Truby, Kaplan.

### S2-033
- Type: Behavior
- Statement: Recommendations should point to the relevant concept, not merely the book (e.g., "McKee's discussion of scene design and story values" rather than "read all of Story").
- Why: Recommending a whole book isn't helpful.
- Standing: ACCEPTED PROPOSAL
- Source: 3406-3410
- Relationship: ADDS TO S2-032.

### S2-034
- Type: Possibility
- Statement: GPT suggested eventually providing chapter references, verified page references for specific editions, or links to legitimate online resources; references verified, not generated from memory; never invent page numbers or misattribute advice.
- Why: Accuracy.
- Standing: REJECTED in part by Yolanda at 10:55 (no chapters/pages ever). Links to verified online resources and "verified, not from memory" survive.
- Source: 3412-3414
- Relationship: Later REPLACED BY S2-049 (Yolanda's decision) for the chapter/page part.

### S2-035
- Type: Feature
- Statement: Authors choose their preferred craft frameworks. Yolanda uses Snyder, McKee, Weiland, and Ingermanson together for IDW; others may use one framework or reject formal plotting entirely. The program accommodates all.
- Why: Different authors, different methods.
- Standing: ACCEPTED PROPOSAL (Yolanda 11:07 strongly agrees "no author should be tied or forced")
- Source: 3416-3424
- Relationship: ADDS TO S2-032.

### S2-036
- Type: Feature / Data model
- Statement: Personal Craft Library: an author can establish a library of preferred resources; the software prioritizes those when suggesting. Recommendations are framed in the author's framework vocabulary (McKee user → story values, progressive complications, turning points; Weiland user → character arcs, internal vs external conflict). Discovery writers are not required to adopt a beat sheet.
- Why: "The software adapts to the author's process, not the other way around."
- Standing: ACCEPTED PROPOSAL
- Source: 3426-3436
- Relationship: ADDS TO S2-035.

### S2-037
- Type: Feature / UI-UX
- Statement: Three guidance settings: Quiet (records concerns without interrupting), Advisory (subtle notifications for meaningful concerns), Deep Analysis (detailed observations, dependency analysis, diagnostic questions, craft resources). Quiet is the default during drafting; author can request a structural review whenever ready.
- Why: Interrupting an author mid-drafting (e.g., a funny Kevin/Anthony scene) "every thirty seconds" "would be maddening"; protects the creative process.
- Standing: ACCEPTED PROPOSAL
- Source: 3438-3460
- Relationship: new.

### S2-038
- Type: Feature / Data model
- Statement: Authorial Intent Note: author can mark a flagged item as intentional with an explanation (e.g., "Intentional. This scene establishes a sense of false security that pays off two chapters later."). The system retains it, it becomes part of the program's understanding of the story, informs future analysis, prevents repeatedly defending the same choice; author can revisit or revise it later.
- Why: Respect deliberate choices; reduce noise.
- Standing: ACCEPTED PROPOSAL
- Source: 3462-3484
- Relationship: ADDS TO S2-031.

### S2-039
- Type: Principle / UI-UX
- Statement: Evidence vs interpretation: four distinct kinds of information must be clearly distinguished in output: Observable structural facts ("Scene 7 has no recorded causal connection to Scene 8"); Interpretive observations ("Kevin's decision in Scene 8 may need stronger motivation"); Craft-based suggestions; Educational references ("Consider reviewing Dwight Swain's Scene and Sequel approach"). Never present interpretation as verifiable fact; never suggest any framework is a universal requirement; leave room for intentional convention-breaking.
- Why: Fundamental to avoiding bad writing advice.
- Standing: ACCEPTED PROPOSAL
- Source: 3486-3516
- Relationship: ADDS TO S2-018.

### S2-040
- Type: Feature (module)
- Statement: Craft Resource Advisor module (name provisional): identifies relevant craft concepts, recommends reputable resources, connects them to specific story concerns, lets authors maintain their own reference libraries. Connects to Story Diagnostics, Narrative Zoom, and The Ripple Effect.
- Why: Modularize contextual guidance.
- Standing: ACCEPTED PROPOSAL
- Source: 3518-3524
- Relationship: ADDS TO S2-029, S2-036.

### S2-041
- Type: Feature
- Statement: Save/attach a resource recommendation directly to a scene or sequence, with topic and an author's note. Example: "I Declare War → Act II → Fish-Guts Sequence; Attached resource: Story, Robert McKee; Topic: Scene value changes and progressive complications; Author's note: Review before revising Anthony's confrontation with Kevin."
- Why: "You don't have to remember why you bookmarked something six weeks earlier."
- Standing: ACCEPTED PROPOSAL; example is EXAMPLE / ILLUSTRATION
- Source: 3526-3540
- Relationship: ADDS TO S2-040.

### S2-042
- Type: Story fact (IDW)
- Statement: IDW has a "Fish-Guts Sequence" in Act II, and a confrontation between Anthony and Kevin.
- Why: Referenced as example location.
- Standing: EXAMPLE / ILLUSTRATION (location in Act II may be illustrative; possibly relates to earlier story facts)
- Source: 3530-3536
- Relationship: possibly relates to earlier IDW facts.

### S2-043
- Type: Principle
- Statement: "Intelligent companion, not an authority." The program should: Map (without taking ownership), Analyze (not infallible), Question (without labeling unconventional writing defective), Recommend (without forcing a method), Remember (author's intentions and decisions), Adapt (to process), Visualize (consequences of structural changes), Preserve (author's absolute control over manuscript).
- Why: Clear product philosophy.
- Standing: ACCEPTED PROPOSAL
- Source: 3544-3557
- Relationship: RESTATEMENT/consolidation of S2-025, S2-031, S2-038, S2-039.

### S2-044
- Type: Principle
- Statement: "The program must be comfortable saying, 'I don't know.'" Some problems cannot be diagnosed from an outline; may need the actual scene, prose, voice, characterization, or reader response. Example: "The structural relationship between these scenes appears consistent. However, determining whether the emotional transition is convincing would require examining the drafted scenes." Even after examining prose, conclusions remain recommendations not verdicts.
- Why: Responsible analysis.
- Standing: ACCEPTED PROPOSAL
- Source: 3559-3577
- Relationship: ADDS TO S2-039.

### S2-045
- Type: Principle
- Statement: Features reinforce each other: "The map shows the story. Narrative Zoom reveals its construction. Diagnostics examine its relationships. The Ripple Effect exposes dependencies. The Craft Resource Advisor helps the author investigate potential weaknesses." Author remains in charge. Feature list at this point: story data model, three printable maps, Narrative Zoom, causal integrity analysis, The Ripple Effect, the Storyworld module, scene-value tracking, contextual craft recommendations.
- Why: Integrated system.
- Standing: ACCEPTED PROPOSAL
- Source: 3579-3591
- Relationship: RESTATEMENT. Note: mentions "Storyworld module" and "scene-value tracking" from before this section (possibly relates to Section 1 items).

### S2-046
- Type: Principle
- Statement: Guiding product philosophy: "The author's imagination creates the story. The system helps the author see it, understand it, strengthen it, and bring it to completion."
- Why: Mission statement.
- Standing: ACCEPTED PROPOSAL ("I agree with everything said")
- Source: 3593-3595
- Relationship: ADDS TO S2-001.

### S2-047
- Type: Constraint / Process
- Statement: Build the three IDW posters first to validate the architecture before expanding into a full application, to avoid "spending so much time developing the system that the actual creative work never gets finished."
- Why: Creative momentum.
- Standing: DECIDED BY YOLANDA ("yes we start with building the three posters first")
- Source: 3597-3603, 10:55 ET
- Relationship: RESTATEMENT OF S2-020 / confirmed.

### S2-048
- Type: Principle / Constraint
- Statement: The program is not only for comedy; it must serve mysteries, thrillers, horror, etc. Its "brain" must understand the different genres.
- Why: General-purpose tool for any author.
- Standing: DECIDED BY YOLANDA ("this program won't be only for the comedy genre ... We need to understand the different genres")
- Source: 3605, 10:55 ET
- Relationship: new; foundational.

### S2-049
- Type: Constraint
- Statement: Resource recommendations must NEVER cite a specific chapter or page of a book.
- Why: "those things are subject to change and it's too complicated to try to keep track of all that."
- Standing: DECIDED BY YOLANDA ("I don't think we should ever recommend a specific chapter or a specific page")
- Source: 3607, 10:55 ET
- Relationship: REPLACES S2-034 (chapter/page portion of GPT's earlier proposal).

### S2-050
- Type: Principle
- Statement: Adaptability is a foundational principle of the program.
- Why: Different authors, genres, methods.
- Standing: DECIDED BY YOLANDA ("I think this, too, is a foundational principle for the program: adaptability")
- Source: 3609, 10:55 ET
- Relationship: ADDS TO S2-035, S2-036.

### S2-051
- Type: Principle / Data model
- Statement: Design a genre-independent storytelling engine with genre-aware intelligence; avoid designing a comedy system and retrofitting it. Genre-independent core: characters have objectives, motivations, conflicts; events have causes/consequences; scenes produce changes in values; scenes→sequences→acts→narrative; themes, relationships, tension; information revealed/withheld; expectations and payoffs.
- Why: IDW is comedy; risk of unconscious bias.
- Standing: ACCEPTED PROPOSAL (Yolanda 11:07: "As usual I agree with everything")
- Source: 3617-3643
- Relationship: ADDS TO S2-048.

### S2-052
- Type: Feature / Data model
- Statement: Genre should influence the analysis, not dictate the story. Genre consideration table: Comedy (character-driven humor, comic escalation, incongruity, reversals, timing, emotional payoff); Mystery (clues, suspects, investigative logic, red herrings, fair revelations, information control); Thriller (threat escalation, urgency, suspense, reversals, stakes, vulnerability); Horror (fear, uncertainty, atmosphere, dread, vulnerability, escalating threats); Romance (relationship development, intimacy, internal barriers, romantic conflict, satisfying resolution); Fantasy (worldbuilding, magic systems, internal rules, objectives, consequences); Science Fiction (speculative premises, consistency, societal implications, causality); Historical Fiction (context, chronology, authenticity, agency); Literary Fiction (complexity, theme, form, psychological transformation). These are considerations, not mandatory checklists; conventions are not requirements (horror needn't escalate violence; mystery needn't have detective or murder).
- Why: Genre-aware, not genre-prescriptive.
- Standing: ACCEPTED PROPOSAL (table is illustrative content)
- Source: 3645-3667
- Relationship: ADDS TO S2-051.

### S2-053
- Type: Feature / Data model
- Statement: Genre blending: author describes a novel with Primary genre, Secondary influences, Narrative characteristics. IDW example: Primary genre Comedy; Secondary influences Mystery, satire; Narrative characteristics: misdirection, dramatic irony, hidden antagonist. This informs diagnostics and resource suggestions (a romantic thriller gets guidance for both). Author may change classifications any time as the story evolves.
- Why: Real novels mix genres.
- Standing: ACCEPTED PROPOSAL; Yolanda builds on it at 11:07 (S2-065)
- Source: 3669-3685
- Relationship: ADDS TO S2-052.

### S2-054
- Type: Story fact (IDW)
- Statement: IDW is a comedy whose hidden manipulation and eventual revelation use mystery techniques; it has a hidden antagonist, misdirection, dramatic irony, satire influence.
- Why: Classification example.
- Standing: ACCEPTED PROPOSAL (GPT's characterization; Yolanda agreed generally)
- Source: 3671-3679
- Relationship: possibly relates to earlier IDW facts.

### S2-055
- Type: Principle
- Statement: Five dimensions of adaptability: A. Genre; B. Structural (choose frameworks or none; not forced into Save the Cat's 15 beats; three-act, four-act, Hero's Journey, Snowflake, custom; Story/Act/Sequence/Scene hierarchy is "a useful analytical model, not the only legitimate way"); C. Process (outliners, discovery writers, in-between; no complete plot map required before chapter one); D. Complexity (simple romance with few threads to epic fantasy with multiple protagonists/timelines; simple stories shouldn't be made complicated); E. Author adaptability (chronological thinkers, relationship visualizers, arc thinkers, sequence or thematic thinkers): "The story remains the same. The representation adapts to the author's mind."
- Why: Expand Yolanda's adaptability principle.
- Standing: ACCEPTED PROPOSAL (Yolanda 11:07 specifically agrees on structures)
- Source: 3687-3745
- Relationship: ADDS TO S2-050; qualifies S2-011 (hierarchy not mandatory) without cancelling it.

### S2-056
- Type: Principle
- Statement: The three-poster idea embodies author adaptability: same story, different representations for different minds.
- Why: Representation adapts to author.
- Standing: ACCEPTED PROPOSAL
- Source: 3741-3745
- Relationship: ADDS TO S2-020.

### S2-057
- Type: Behavior / Data model
- Statement: Resource recommendation format: a relevant book, article, website or other reputable resource; the author/creator; the storytelling concept that makes it relevant; a concise explanation why. Example: concern (insufficient motivation between scenes) → concept (scene causality; goals, conflict, consequences) → resource (McKee's Story) → why (gap between expectation and result). No chapter references, no page numbers. Direct links for websites/articles when available and verified.
- Why: Implements S2-049.
- Standing: ACCEPTED PROPOSAL
- Source: 3747-3776
- Relationship: RESTATEMENT OF S2-049 (faithful) plus ADDS format.

### S2-058
- Type: Data model / Behavior
- Statement: Distinguish resource provenance: established references, author-supplied resources, and newly discovered recommendations.
- Why: Transparency of advice.
- Standing: UNANSWERED PROPOSAL (covered by blanket agreement)
- Source: 3778-3780
- Relationship: ADDS TO S2-036.

### S2-059
- Type: Feature / Principle
- Statement: Genre expectations vs author intentions: the system asks "What experience is the author trying to create for the reader?" (suspense, dread, laughter, wonder, heartbreak, romantic anticipation, intellectual curiosity, discovery, several simultaneously). It evaluates the intended effect rather than insisting on standard structure (e.g., a mystery revealing the culprit midway because the real question is proof). Job: determine whether construction supports intended effect.
- Why: Avoid flagging deliberate unconventional choices.
- Standing: ACCEPTED PROPOSAL
- Source: 3782-3824
- Relationship: ADDS TO S2-038.

### S2-060
- Type: Story fact (IDW)
- Statement: Intended reader experience for IDW: laughter, escalating absurdity, misdirection, and an ultimately meaningful emotional payoff.
- Why: Target effect for analysis.
- Standing: ACCEPTED PROPOSAL (GPT statement; not contradicted)
- Source: 3818
- Relationship: ADDS TO S2-054.

### S2-061
- Type: Principle / Data model
- Statement: Extensible architecture in three tiers: Core engine (narrative structure, scenes, sequences, character goals, value changes, causality, chronology, relationships, visualization); Genre-aware capabilities (mystery clue tracking, romance relationship development, horror threat progression, fantasy world rules, etc.); Author-defined capabilities (custom labels, story values, plot structures, relationship types, analytical priorities). No software update required when someone invents a new structure.
- Why: Can't anticipate every genre/method.
- Standing: ACCEPTED PROPOSAL
- Source: 3826-3846
- Relationship: ADDS TO S2-051.

### S2-062
- Type: Principle
- Statement: "The program should learn the author's creative intentions without attempting to replace them": stated objectives, chosen framework, deliberate departures, previous decisions (e.g., an unconventional midpoint). It may still question, but evaluates concerns in context of what author is trying to do.
- Why: Contextual analysis.
- Standing: ACCEPTED PROPOSAL
- Source: 3848-3862
- Relationship: ADDS TO S2-038, S2-059.

### S2-063
- Type: Principle
- Statement: Six governing principles: Author sovereignty; Adaptability; Narrative integrity; Transparency; Contextual guidance (no book chapters/pages); Progressive complexity (begin simply, expand). Plus seventh: Creative momentum (help authors complete novels; the system must not become "another elaborate task that competes with writing").
- Why: Product specification foundation.
- Standing: ACCEPTED PROPOSAL (Yolanda 11:07 agrees; her follow-up question on word count builds on creative momentum)
- Source: 3864-3881
- Relationship: RESTATEMENT/consolidation of S2-025, S2-050, S2-039, S2-049; adds Progressive complexity and Creative momentum.

### S2-064
- Type: UI-UX
- Statement: Poster purposes restated: chronological map emphasizes dramatic progression; relationship map emphasizes causality, thematic connections, narrative dependencies; hybrid integrates both into comprehensive visual architecture. All draw from the same underlying story information. Information model must not assume comedy, misdirection, or conventional three-act structure. "One story. Multiple ways to understand it. Adaptable to the author, not the other way around."
- Why: Next milestone.
- Standing: ACCEPTED PROPOSAL (restatement of earlier poster decisions; possibly relates to Section 1)
- Source: 3883-3897
- Relationship: RESTATEMENT OF earlier poster definitions.

### S2-065
- Type: Principle
- Statement: No author should be tied or forced to use the structures Yolanda and GPT have been using.
- Why: Adaptability.
- Standing: DECIDED BY YOLANDA ("no author should be tied or forced to use what we've been using")
- Source: 3903, 11:07 ET
- Relationship: ADDS TO S2-055.

### S2-066
- Type: Feature / UI-UX
- Statement: Checkboxes (selection) for author preferences: genre, structure, primary/secondary, narrative characteristics; e.g., Snowflake Method, Blake Snyder, Hero's Journey, "don't want to outline at all"; or combinations.
- Why: Let authors tell the program how they work.
- Standing: DECIDED BY YOLANDA (proposed by her as a question: "Do you think we should have checkboxes..."; GPT said yes)
- Source: 3905, 11:07 ET
- Relationship: ADDS TO S2-053, S2-055.

### S2-067
- Type: Feature / Story fact
- Statement: Yolanda combines Blake Snyder's (Save the Cat) genres and conventional genres "so I can see where my story fits on both and then have the primary/secondary for each of them." The program must support dual genre systems, each with its own primary/secondary.
- Why: Her actual practice.
- Standing: DECIDED BY YOLANDA
- Source: 3905, 11:07 ET
- Relationship: ADDS TO S2-053.

### S2-068
- Type: Feature (question)
- Statement: Yolanda asks whether, to move the author from designing to writing, the program should track word count, scenes being worked on, and scenes completed.
- Why: Creative momentum; finishing the book.
- Standing: DECIDED BY YOLANDA as a direction (raised as question; GPT said "Yes to both!")
- Source: 3907, 11:07 ET
- Relationship: ADDS TO S2-063 (Creative momentum).

### S2-069
- Type: Behavior
- Statement: Multiple genres, multiple structural frameworks, multiple writing methods may be selected without the software treating them as contradictions.
- Why: Yolanda combines approaches for IDW.
- Standing: ACCEPTED PROPOSAL
- Source: 3919-3921
- Relationship: ADDS TO S2-066.

### S2-070
- Type: Feature (module names)
- Statement: Two capabilities: The Author's Storytelling Profile and The Writing Workspace.
- Why: How authors tell the program their system; how the program helps finish the book.
- Standing: ACCEPTED PROPOSAL (see later response)
- Source: 3923
- Relationship: ADDS TO S2-066, S2-068.

### S2-071
- Type: UI-UX / Data model
- Statement: Conventional genre selection: list of genres (Comedy, Mystery, Thriller, Horror, Romance, Historical Fiction, Fantasy, Science Fiction, Literary Fiction) with Selected checkbox and Role column; option to add custom genres and subgenres. IDW illustration: Comedy = Primary, Mystery = Secondary.
- Why: Implements Yolanda's checkbox idea (S2-066).
- Standing: ACCEPTED PROPOSAL (concept); IDW checkmarks are EXAMPLE / ILLUSTRATION
- Source: 3931-3947, 11:07 ET
- Relationship: ADDS TO S2-066.

### S2-072
- Type: Data model
- Statement: Not limited to one secondary genre. Three roles: Primary genre (dominant storytelling promise), Secondary genre (important additional tradition), Genre influence (borrowed elements without adopting conventions). Editable as the novel develops.
- Why: A novel may meaningfully combine mystery, romance and comedy.
- Standing: UNANSWERED PROPOSAL (covered by "I AM STILL IN LOVE WITH THIS" at 11:17, which is blanket)
- Source: 3949-3961
- Relationship: ADDS TO S2-067 (Yolanda said primary/secondary; GPT adds a third tier "influence").

### S2-073
- Type: Data model / Constraint
- Statement: Blake Snyder story types (ten types, e.g., Buddy Love, Monster in the House, Whydunit, Golden Fleece, Dude with a Problem) are a separate classification from conventional genres. "The program should never combine these two classification systems into one list." Separate selections each with Primary, Secondary, Additional influences. Both optional.
- Why: Snyder types describe the underlying storytelling engine, not bookstore genre; author sees "what kind of book" and "what kind of dramatic engine."
- Standing: ACCEPTED PROPOSAL (builds directly on Yolanda's S2-067 request; she replied "Yes. I AM STILL IN LOVE WITH THIS!")
- Source: 3963-3997
- Relationship: ADDS TO S2-067.

### S2-074
- Type: Story fact (IDW)
- Statement: The IDW story bible explicitly identifies Kevin and Anthony as a Buddy Love pairing; use as initial Snyder story-type classification, leaving any additional Snyder classifications for Yolanda to decide.
- Why: Initial data.
- Standing: ACCEPTED PROPOSAL (bible fact; additional types open)
- Source: 3993
- Relationship: possibly relates to earlier IDW facts in story bible.

### S2-075
- Type: UI-UX / Feature
- Statement: "My Storytelling Toolkit" section: multi-select of frameworks/methods with "Use it?" checkbox and "How I use it" field. Options listed: Save the Cat, Robert McKee, K. M. Weiland, Snowflake Method, Hero's Journey, Story Circle, Seven-Point Story Structure, Three-Act Structure, Custom Structure. IDW illustration: Save the Cat (primary beat structure), McKee (scene values and dramatic progression), Weiland (character arcs), Snowflake (developing the story), Three-Act (overall organization).
- Why: Implements checkbox request; same author may combine.
- Standing: ACCEPTED PROPOSAL; IDW config is EXAMPLE / ILLUSTRATION ("illustrative of how we might configure")
- Source: 3999-4017
- Relationship: ADDS TO S2-066. Note: Ingermanson (Snowflake) is listed; earlier IDW framework list (S2-035) was Snyder, McKee, Weiland, Ingermanson.

### S2-076
- Type: Data model
- Statement: Each selected framework has a field "What job does this framework perform in your writing process?" Combinations (e.g., Save the Cat + Snowflake for different purposes) are deliberate, not conflicts.
- Why: Checkboxes alone are insufficient.
- Standing: ACCEPTED PROPOSAL
- Source: 4019-4029
- Relationship: ADDS TO S2-075.

### S2-077
- Type: Feature
- Statement: Framework mapping: show approximate correspondences between selected frameworks (e.g., Save the Cat Break into Two ≈ Weiland First Plot Point ≈ often Hero's Journey Crossing the First Threshold), explaining similarities without erasing meaningful distinctions in function and placement.
- Why: Combined-framework authors need to see overlap.
- Standing: UNANSWERED PROPOSAL (blanket approval only)
- Source: 4031-4051
- Relationship: ADDS TO S2-075.

### S2-078
- Type: Feature
- Statement: Discovery Writing option: "I prefer to find my story as I write." A valid selection; the program can build the story map retrospectively from scenes already written. "Plotters map before writing. Discovery writers can map what they've discovered. Hybrid writers can do both."
- Why: Process adaptability; Yolanda listed "they don't want to outline at all."
- Standing: ACCEPTED PROPOSAL (responds to Yolanda's example)
- Source: 4053-4067
- Relationship: ADDS TO S2-066, S2-055(C).

### S2-079
- Type: Data model
- Statement: Narrative characteristics are a separate category from genres: Narrative order (linear, nonlinear, reverse chronology); Point of view (first, third limited, omniscient, multiple POV); Story construction (ensemble, dual protagonist, single); Information control (mystery, dramatic irony, unreliable narrator, hidden truth); Timeline (single period, multiple timelines, time jumps); Character development (positive, flat, negative arc); Narrative form (epistolary, framed, conventional); Tone (comic, dark, suspenseful, whimsical, tragic, satirical).
- Why: Techniques cross genre boundaries; Yolanda asked for "narrative characteristics."
- Standing: ACCEPTED PROPOSAL
- Source: 4069-4086
- Relationship: ADDS TO S2-053, S2-066.

### S2-080
- Type: Behavior
- Statement: Narrative-characteristic selections activate relevant analytical capabilities (multiple timelines → advanced chronology checks; unreliable narrator → belief-versus-truth tracking; ensemble → sophisticated character and plot-strand visualizations) without forcing the author to learn every feature.
- Why: Progressive complexity; relevance.
- Standing: ACCEPTED PROPOSAL
- Source: 4088-4096
- Relationship: ADDS TO S2-079, S2-061.

### S2-081
- Type: Data model / Feature
- Statement: Two profile levels: Author Profile (preferred frameworks, techniques, working habits, creative preferences) and Project Profile (genres, frameworks, narrative characteristics, goals for this novel). Project inherits author defaults; anything can be changed; one novel's settings not imposed on another.
- Why: Yolanda may approach "The Replacement" (a psychological thriller) differently from IDW.
- Standing: ACCEPTED PROPOSAL
- Source: 4098-4116
- Relationship: ADDS TO S2-070.

### S2-082
- Type: Story fact (other project)
- Statement: Yolanda has another novel, "The Replacement," a psychological thriller.
- Why: Mentioned as second project needing a different profile.
- Standing: EXAMPLE / ILLUSTRATION (GPT reference; genre presumably from earlier context)
- Source: 4104
- Relationship: possibly relates to earlier mention.

### S2-083
- Type: Feature / Not wanted
- Statement: Track word counts, scenes, drafting progress, revisions, completed work, but NOT a generic dashboard with a progress bar "you're 37% finished." Show meaningful narrative progress; track both planning and drafting ("planning 40 scenes isn't the same thing as drafting them").
- Why: 10,000 words isn't necessarily 10,000 words of progress.
- Standing: ACCEPTED PROPOSAL (answers Yolanda's S2-068 question)
- Source: 4118-4132
- Relationship: ADDS TO S2-068.

### S2-084
- Type: Data model
- Statement: Scene development status (customizable): Idea, Planned, Ready to Draft, Drafting, First Draft Complete, Revising, Revised, Finalized. Authors can customize (some revise as they write; others multiple passes).
- Why: Track each scene's state.
- Standing: ACCEPTED PROPOSAL
- Source: 4134-4157
- Relationship: ADDS TO S2-083.

### S2-085
- Type: Behavior
- Statement: Sequence status reflects its scenes (e.g., 3 drafted, 1 revising, 1 unwritten → "partially drafted"). Do NOT automatically declare a sequence complete because every scene contains words. "Structural completion and drafting completion are different things."
- Why: A fully drafted sequence may need structural work.
- Standing: ACCEPTED PROPOSAL
- Source: 4159-4175
- Relationship: ADDS TO S2-084.

### S2-086
- Type: Feature
- Statement: Word counts at scene, sequence, act, and manuscript level, connected to the planned narrative architecture.
- Why: Yolanda asked about word count tracking.
- Standing: ACCEPTED PROPOSAL
- Source: 4177-4189
- Relationship: ADDS TO S2-068.

### S2-087
- Type: Feature
- Statement: Target word count (e.g., 80,000) + selected structure → estimated placement of turning points; compare planned vs actual placement (hypothetical table: Catalyst 8,000/9,400; Break into Two 16,000/17,200; Midpoint 40,000/43,500; All Is Lost 60,000/not written). Highlight significant differences but don't automatically treat as problems.
- Why: Structural pacing awareness.
- Standing: ACCEPTED PROPOSAL; values are EXAMPLE / ILLUSTRATION
- Source: 4191-4208
- Relationship: ADDS TO S2-086.

### S2-088
- Type: Feature / Constraint
- Statement: Yolanda wants page numbers on her posters; maintain a configurable page-estimation system. Page numbers must be clearly labeled as estimates unless working with an actual paginated manuscript ("Word counts are reliable drafting measurements. Page counts depend on manuscript formatting and eventual book design").
- Why: Page counts are formatting dependent.
- Standing: page numbers on posters: DECIDED BY YOLANDA earlier (GPT: "because you specifically want page numbers on your posters", possibly relates to an earlier decision in Section 1); estimate labeling: ACCEPTED PROPOSAL
- Source: 4210-4216
- Relationship: ADDS TO earlier poster page-number decision.

### S2-089
- Type: Feature
- Statement: Writing sessions record (optional): date, project, scene/sequence worked on, starting and ending word count, net words, time spent (if wanted), scene status changes, notes. Not mandatory; author can "write for twenty minutes, and leave without completing a form"; mostly automatic; import/sync progress if writing elsewhere.
- Why: Move from planning to execution without admin burden.
- Standing: ACCEPTED PROPOSAL
- Source: 4218-4240
- Relationship: ADDS TO S2-083.

### S2-090
- Type: Feature
- Statement: Next Writing Action: a concrete next step (e.g., "Draft Kevin's opening scene in the driveway") instead of a number ("Write 2,000 words today"). Distinguish Story Development Progress from Manuscript Progress.
- Why: Concrete entry point vs intimidating number.
- Standing: ACCEPTED PROPOSAL
- Source: 4242-4270
- Relationship: ADDS TO S2-083.

### S2-091
- Type: Story fact (IDW)
- Statement: IDW opening scene: Kevin in the driveway (Kevin's opening scene). Opening image, protagonist motivation, catalyst defined in planning.
- Why: Example of next writing action.
- Standing: EXAMPLE / ILLUSTRATION (possibly relates to earlier bible facts)
- Source: 4246-4262
- Relationship: possibly relates to earlier IDW facts.

### S2-092
- Type: Feature
- Statement: Selectable goal types: word-count goals, scene-completion goals, writing-time goals, milestone goals, or no goals at all.
- Why: Some authors love numbers; others find them intimidating.
- Standing: ACCEPTED PROPOSAL
- Source: 4272-4276
- Relationship: ADDS TO S2-090.

### S2-093
- Type: Feature / Constraint
- Statement: Drafting Readiness indicator checks whether the scene has: viewpoint character, purpose, character's objective, central conflict, intended outcome/change, relationship to surrounding story. Informational, never restrictive: "A scene should never be prevented from being drafted because some planning fields are incomplete." Messages like "Ready to draft" or "Open questions: ..." and always a prominent "Write Anyway" button.
- Why: "Sometimes the only way to figure out a scene is to write the damn thing."
- Standing: ACCEPTED PROPOSAL
- Source: 4278-4313
- Relationship: ADDS TO S2-084.

### S2-094
- Type: Feature / UI-UX
- Statement: Accomplishment tracking ("This week in I Declare War"): drafted two scenes; completed one sequence outline; resolved midpoint's central conflict; connected three disconnected plot events; identified payoff for an earlier setup; revised Anthony's motivation; wrote 3,200 new words. Recognizes non-typing work but keeps manuscript production visible; "We shouldn't allow endless outlining to masquerade as a completed manuscript" — shown without shaming.
- Why: Fuller picture of progress.
- Standing: ACCEPTED PROPOSAL; content is EXAMPLE / ILLUSTRATION
- Source: 4315-4345
- Relationship: ADDS TO S2-083.

### S2-095
- Type: UI-UX
- Statement: Drafting progress shown visually on maps: concept-only scene = subtle outline; drafted = filled marker; revising = another treatment. Map A: progress along chronological spine; Map B: development status within causal/thematic network; Hybrid: both structural and manuscript progress. Progress indicators can be toggled on/off when printing (a permanent architectural poster vs a periodically replaced progress version).
- Why: Eye immediately sees where manuscript exists.
- Standing: ACCEPTED PROPOSAL
- Source: 4347-4371
- Relationship: ADDS TO S2-020, S2-064.

### S2-096
- Type: Feature
- Statement: Writing Trail: not a conventional activity history; remembers which scene author was on, what prompted leaving, which related scene visited, whether issue resolved, where they intended to return. Preserves previous location and offers easy return. No forced linear workflow. Fits with Narrative Zoom.
- Why: Support nonlinear creative movement (e.g., Scene 12 → fix Scene 7 → back) "without losing the drafting thread."
- Standing: ACCEPTED PROPOSAL (Yolanda: "Yes. I AM STILL IN LOVE WITH THIS!")
- Source: 4373-4399
- Relationship: new; later items about "Return to Writing" may build on it (possibly relates to later sections).

### S2-097
- Type: Principle
- Statement: Common foundation: Story information, Narrative relationships, Author preferences, Manuscript progress; capabilities are views and operations on the same underlying system.
- Why: Ambitious but coherent.
- Standing: ACCEPTED PROPOSAL
- Source: 4401-4409
- Relationship: ADDS TO S2-021.

### S2-098
- Type: Process
- Statement: Build order: 1) Three large-format IDW posters (visual language, test architecture); 2) Editable underlying story model generating all three posters; 3) Interactive experience with Narrative Zoom, relationships, scene tracking; 4) Diagnostics, resource recommendations, genre-aware capabilities; 5) Fuller authoring environment (manuscript integration, sessions, progress, personalized workflows). Avoid decisions now that make future capabilities difficult.
- Why: Discipline.
- Standing: ACCEPTED PROPOSAL ("Yes.")
- Source: 4411-4429
- Relationship: ADDS TO S2-047. Later replaced/refined by the three-stage roadmap S2-117 (UNCLEAR whether that replaces it; both are GPT proposals).

### S2-099
- Type: Possibility
- Statement: Open question: should the program contain a manuscript editor or integrate with existing tools (Word, Scrivener, Google Docs)? GPT's initial preference: support both eventually, prioritize integration and import/export first; built-in editor later if compelling.
- Why: Full editor is enormously complex.
- Standing: POSSIBILITY (Yolanda responds at 11:17 with questions; at 11:25 assumes in-program writing is supported and adds export)
- Source: 4431-4443
- Relationship: superseded in discussion by S2-110 and S2-128 (not formally decided).

### S2-100
- Type: Principle
- Statement: "The program shouldn't change the author's manuscript without their explicit direction."
- Why: Author sovereignty.
- Standing: ACCEPTED PROPOSAL (restates Yolanda's S2-025)
- Source: 4445-4449
- Relationship: RESTATEMENT OF S2-025.

### S2-101
- Type: Process
- Statement: "The posters are the proof of concept. The program is the longer-term vision." Next concrete step: turn the IDW story bible into a structured foundation for the posters.
- Why: Focus.
- Standing: ACCEPTED PROPOSAL ("Yes.")
- Source: 4451-4453
- Relationship: RESTATEMENT OF S2-047.

### S2-102
- Type: Feature / Data model
- Statement: With multiple points of view (Yolanda: "which means it's an ensemble usually"), designate which character's POV is being examined and whether it is first person, second person, third, etc.
- Why: POV tracking.
- Standing: DECIDED BY YOLANDA ("we would need to designate which character's point of view is being examined")
- Source: 4459, 11:17 ET
- Relationship: ADDS TO S2-079.

### S2-103
- Type: Scenario (question)
- Statement: Yolanda asks: Is the author drafting the novel within the program, sharing the manuscript within it, or leaving it to the author's "honor system" to tell us what they're doing in a document outside the program? Same question applies to planning.
- Why: Determines how word counts/progress are known.
- Standing: DECIDED BY YOLANDA as an open design question (answered by S2-108 to S2-113)
- Source: 4461
- Relationship: ADDS TO S2-068, S2-099.

### S2-104
- Type: Principle / Not wanted
- Statement: Authors must not have to maintain two separate versions of their novel, nor manually enter information the program could reliably obtain from manuscripts/planning docs.
- Why: Would add administrative burden, defeating the principle of making writing easier.
- Standing: ACCEPTED PROPOSAL (Yolanda 11:25 "I agree with everything you said")
- Source: 4471-4475
- Relationship: ADDS TO S2-063 (Creative momentum).

### S2-105
- Type: Data model
- Statement: Multiple POV does not necessarily mean ensemble. Distinguish: protagonist(s), viewpoint character, narrator, grammatical person, narrative importance of each character.
- Why: These aren't always the same.
- Standing: ACCEPTED PROPOSAL (corrects Yolanda's "usually"; she agreed at 11:25)
- Source: 4481-4495
- Relationship: ADDS TO S2-102 (refines her assumption, does not cancel her requirement).

### S2-106
- Type: Data model
- Statement: POV tracked at three levels: Project (overall approach, e.g., alternating first-person), Chapter (viewpoint character and narrative person), Scene (actual viewpoint). Supports defaults with exceptions (third limited with first-person diary entries; alternating first-person; shifts within chapters). System shouldn't prohibit these.
- Why: Real books mix.
- Standing: ACCEPTED PROPOSAL
- Source: 4497-4517
- Relationship: ADDS TO S2-102.

### S2-107
- Type: Data model
- Statement: POV record attributes: Viewpoint character, Narrator, Narrative person (1st/2nd/3rd), Narrative distance, Narrative tense, Knowledge limitations, Reliability (reliable/unreliable/selectively informed), Narrative function (why chosen). Optional POV transition tracker showing where viewpoints change and whether deliberate.
- Why: Complete POV model.
- Standing: ACCEPTED PROPOSAL
- Source: 4519-4534
- Relationship: ADDS TO S2-106.

### S2-108
- Type: Story fact (IDW)
- Statement: In IDW, Kevin and Anthony alternate viewpoints while Francine's perspective is deliberately withheld; this restriction is part of the novel's misdirection strategy (story bible). The program must preserve that intention when analyzing viewpoint consistency.
- Why: Misdirection; hidden antagonist.
- Standing: DECIDED BY YOLANDA (per her story bible, cited by GPT; possibly relates to an earlier decision)
- Source: 4536-4540
- Relationship: ADDS TO S2-054.

### S2-109
- Type: Feature / UI-UX
- Statement: POV Coverage Map: entire novel with each chapter/scene visually associated with its viewpoint character; reveals if a character disappears for a stretch, balance changes, or a revelation occurs through the intended perspective. Observations, not rules.
- Why: Balance awareness.
- Standing: UNANSWERED PROPOSAL (blanket agreement only)
- Source: 4542-4550
- Relationship: ADDS TO S2-107.

### S2-110
- Type: Principle / Feature
- Statement: Support authors who write inside the program, outside it, and who move between both.
- Why: Answers S2-103.
- Standing: ACCEPTED PROPOSAL (Yolanda 11:25 agrees and adds export)
- Source: 4552-4560
- Relationship: ADDS TO S2-103.

### S2-111
- Type: Feature / UI-UX
- Statement: Mode One: write directly inside the program. Workspace example: header "I DECLARE WAR", breadcrumb "Act II → Sequence 3 → Scene 14", "Scene: Anthony Discovers the Animals". One side: structural info (scene objective, POV, time/location, conflict, starting and ending values, incoming causal relationships, intended outcome). Other side: clean manuscript editor. Planning info can be hidden for uninterrupted writing. Auto-tracks word counts, status, progress; does not interrupt with criticism; feedback only when explicitly requested.
- Why: No need to open another application.
- Standing: ACCEPTED PROPOSAL (Yolanda 11:25 "if we are supporting writing the manuscript within the program..." builds on it)
- Source: 4562-4596
- Relationship: ADDS TO S2-037 (no interruption).

### S2-112
- Type: Story fact (IDW)
- Statement: IDW scene "Anthony Discovers the Animals" (illustratively Act II, Sequence 3, Scene 14).
- Why: Example.
- Standing: EXAMPLE / ILLUSTRATION (scene title possibly from the bible; position illustrative)
- Source: 4576-4578
- Relationship: possibly relates to earlier IDW facts.

### S2-113
- Type: Constraint
- Statement: "Writing should never require completing the planning information first. An author should be able to open a blank page and write. Period."
- Why: Process adaptability.
- Standing: ACCEPTED PROPOSAL
- Source: 4598-4606
- Relationship: RESTATEMENT/ADDS TO S2-093.

### S2-114
- Type: Feature / Constraint
- Statement: Mode Two: write in another app (Word, Scrivener, Google Docs). Import manuscripts and, where feasible and authorized, connect to external apps; system attempts to identify chapters, scenes, viewpoint changes, locations. Safeguard: "The author approves structural interpretations before they're incorporated into the master story model." AI guesses (scene boundaries, flashback vs timeline, POV assignment) must not quietly become authoritative.
- Why: Don't force abandoning tools; AI may misread.
- Standing: ACCEPTED PROPOSAL
- Source: 4608-4634
- Relationship: ADDS TO S2-110.

### S2-115
- Type: Data model / Constraint
- Statement: Progress data provenance labels: Verified manuscript data; Last synchronized manuscript data; Author-reported progress. "We can only automatically track changes that the program can access." Manual reporting is "a privacy and workflow choice," not an honor-system problem.
- Why: Trustworthy information; answers Yolanda's "honor system" question.
- Standing: ACCEPTED PROPOSAL
- Source: 4636-4672
- Relationship: ADDS TO S2-103.

### S2-116
- Type: Feature
- Statement: Mode Three: plan in the program, write anywhere; the program as "creative command center"; author may sync manuscript or update progress manually; keeping manuscript content private is legitimate.
- Why: Many authors; privacy.
- Standing: ACCEPTED PROPOSAL
- Source: 4656-4672
- Relationship: ADDS TO S2-110.

### S2-117
- Type: Feature / Scenario
- Statement: Planning onboarding paths (essential from the beginning): Start with an idea (premise, title, single sentence → minimal project); Import existing planning materials (story bible, outline, beat sheet, character profiles, scene list → system extracts and proposes preliminary architecture → author reviews and approves); Start with an existing manuscript (partial/complete draft → proposed structural map; valuable for discovery writers); eventually Combine existing materials (Word bible, spreadsheets, handwritten notes, Scrivener manuscript → reconciled with author resolving conflicts).
- Why: "An author shouldn't have to recreate years of story development just to use our software."
- Standing: ACCEPTED PROPOSAL
- Source: 4674-4718
- Relationship: ADDS TO S2-103 (planning half).

### S2-118
- Type: Data model
- Statement: Distinguish story facts from document sources. Each extracted element carries: Content, Source (document/section), Decision status (Confirmed, working possibility, unresolved, rejected), Author approval, Last updated. Example: "Kevin Wickley is paranoid and self-important" (explicit in bible) vs "Kevin's Ghost may involve an earlier humiliation" (possible direction). Prevents treating speculative notes as canon; IDW bible deliberately mixes instruction, examples, decisions, open questions, which must not be flattened.
- Why: Accuracy of the story model.
- Standing: ACCEPTED PROPOSAL (consistent with S2-024)
- Source: 4720-4756
- Relationship: ADDS TO S2-024.

### S2-119
- Type: Story fact (IDW)
- Statement: Kevin Wickley is paranoid and self-important (established in bible). Kevin's Ghost may involve an earlier humiliation (working possibility only, not decided).
- Why: Data.
- Standing: first part DECIDED BY YOLANDA (per bible); second POSSIBILITY
- Source: 4728-4736
- Relationship: possibly relates to earlier IDW facts.

### S2-120
- Type: Feature
- Statement: Bidirectional navigation: from map to manuscript (select midpoint scene → opens manuscript passage) and manuscript to map ("Show in Story Map" highlights scene, sequence, act, relationships). The map becomes a navigable representation of the work itself.
- Why: Genuine integration.
- Standing: ACCEPTED PROPOSAL
- Source: 4758-4780
- Relationship: ADDS TO S2-003, S2-014.

### S2-121
- Type: Data model / Principle
- Statement: Manuscript and story model are related but not the same: manuscript = prose; story model = architecture (characters, scenes, sequences, relationships, values, timelines). Reference each other without being inseparably coupled (restructure without rewriting; rewrite without changing function; several manuscript versions sharing architecture).
- Why: "Perhaps the most important architectural decision in this entire discussion."
- Standing: ACCEPTED PROPOSAL
- Source: 4782-4802
- Relationship: new.

### S2-122
- Type: Constraint
- Statement: Proposed story-model updates from manuscript analysis remain pending until author approves; changing the story model never automatically alters prose — the program can identify affected passages, suggest resources, raise questions, but the author makes creative changes.
- Why: Author sovereignty in practice.
- Standing: ACCEPTED PROPOSAL
- Source: 4804-4818
- Relationship: ADDS TO S2-114, S2-025.

### S2-123
- Type: Constraint
- Statement: Manuscript ownership and privacy (foundational): clear ownership/control; transparent explanation of what's stored and processed; explicit permission before external connections access documents; reliable export and backup; ability to delete project data; protection against unauthorized access; no use of private manuscripts to train shared models without explicit informed permission. Strongly consider local-first/offline-friendly workflows where feasible.
- Why: Unpublished novels, personal material, commercial sensitivity.
- Standing: UNANSWERED PROPOSAL (blanket "I agree with everything" at 11:25; she then focuses on export)
- Source: 4820-4842
- Relationship: new.

### S2-124
- Type: Process
- Statement: Three-stage roadmap: 1. Story Mapping (import planning materials, structured story model, three posters); 2. Manuscript Integration (import drafts, link passages to scenes, track progress, sync); 3. Integrated Writing Workspace (built-in editor, writing sessions, Narrative Zoom, diagnostics, revision support). Story model designed from the start to support manuscript links and future editor.
- Why: Don't need an editor to build excellent maps.
- Standing: ACCEPTED PROPOSAL (blanket)
- Source: 4844-4860
- Relationship: UNCLEAR vs S2-098 (five-step build order puts Narrative Zoom at step 3; this puts Narrative Zoom in stage 3 with the editor). Both GPT proposals; neither explicitly replaced.

### S2-125
- Type: Process / Scenario
- Statement: Use the IDW story bible to test a realistic import-and-interpretation workflow; the prototype should learn to distinguish established decisions, illustrative possibilities, open questions, and craft instruction; then build architecture and posters; later connect drafted passages; map shows drafting progress. "You won't have to abandon your current writing process."
- Why: Real test material.
- Standing: ACCEPTED PROPOSAL
- Source: 4862-4880
- Relationship: ADDS TO S2-118.

### S2-126
- Type: Principle / Behavior
- Statement: Support non-linear processes: revise-in-place, writing the ending first, drafting out of order, dictating novels, big sittings vs short sessions. A scene can be complete though the preceding scene isn't drafted; a sequence can remain structurally unresolved after all prose is written.
- Why: Adaptability; no artificial workflow.
- Standing: ACCEPTED PROPOSAL
- Source: 4882-4906
- Relationship: ADDS TO S2-085, S2-055(C). Note "some dictate their novels" relates to Yolanda's own voice-to-text habit (possibly relates to other sections).

### S2-127
- Type: Principle
- Statement: "One creative project, multiple ways to work." Plan in Word, draft in Scrivener, brainstorm on paper, revise in Google Docs, use the program to understand the whole story — or eventually do almost everything inside. "The software should connect the creative process, not dictate it."
- Why: Choice belongs to the author.
- Standing: ACCEPTED PROPOSAL ("I agree with everything you said as usual")
- Source: 4908-4928
- Relationship: RESTATEMENT/summary of S2-110 to S2-116. Summary faithful; mentions manuscript integration before full editor.

### S2-128
- Type: Feature / Constraint
- Statement: If manuscripts can be written in the program, they must be importable from Word or Scrivener AND exportable from the program into different formats usable outside it.
- Why: Portability; author ownership.
- Standing: DECIDED BY YOLANDA ("we should be able to export it from our program into different formats that are usable outside of the program")
- Source: 4932, 11:25 ET
- Relationship: ADDS TO S2-114, S2-123.

### S2-129
- Type: Principle
- Statement: Import and export are foundational requirements, not optional later features. "The author owns the manuscript. Our program is a place to create and develop it, not a place where it becomes trapped." Must be able to take manuscript elsewhere without losing work, formatting, or editability.
- Why: Expands S2-128.
- Standing: ACCEPTED PROPOSAL (amplifies Yolanda's decision)
- Source: 4940-4946
- Relationship: ADDS TO S2-128.

### S2-130
- Type: Feature / Data model
- Statement: Import/export format matrix: Word .docx (import/export; writing, editing, sharing with editors); Scrivener .scriv (where supported); RTF; Plain text; Markdown; PDF (import/export; review, share, print); EPUB (import possibly, export yes; e-book); OpenDocument .odt. Reliable native Scrivener import/export and PDF import (especially scanned/heavily formatted) are specific engineering milestones, not promised from the start.
- Why: Implements S2-128.
- Standing: ACCEPTED PROPOSAL (Yolanda 11:28 "again I agree with everything you said")
- Source: 4948-4967, 11:25 ET
- Relationship: ADDS TO S2-128.

### S2-131
- Type: Behavior
- Statement: Manuscript export preserves (where destination supports): chapter titles/divisions, scene breaks, paragraph formatting, italics/emphasis, dialogue formatting, footnotes/endnotes, scene and chapter ordering, front and back matter, document metadata.
- Why: Preserve the author's work, not just words.
- Standing: ACCEPTED PROPOSAL
- Source: 4969-4983
- Relationship: ADDS TO S2-129.

### S2-132
- Type: Feature / Scenario
- Statement: Partial export: a single scene, a sequence, selected chapters, or whole manuscript. Scenario: finish first five chapters of IDW and send to a beta reader: select Chapters 1-5, choose Word or PDF, export, without manually deleting the rest.
- Why: Practical sharing.
- Standing: ACCEPTED PROPOSAL
- Source: 4985-4991
- Relationship: ADDS TO S2-131.

### S2-133
- Type: Data model
- Statement: Manuscript export (the novel) vs project export (creative architecture). Project export kinds: the manuscript; the story bible (characters, settings, themes, plot decisions); the structural map (acts, sequences, scenes, values, causal relationships); complete project archive (manuscript, story model, notes, relationships, planning data, assets) stored in a documented, portable format, not an opaque proprietary file, so work stays accessible if author stops using the app.
- Why: Different assets; no lock-in.
- Standing: ACCEPTED PROPOSAL (Yolanda 11:28 recognizes and endorses "project export")
- Source: 4993-5015
- Relationship: ADDS TO S2-129.

### S2-134
- Type: Feature
- Statement: Export presets: Working Manuscript; Editorial Manuscript (editor/agent); Beta Reader Copy (without private planning notes); Print Review (PDF for reading/annotation); E-book (EPUB); Project Backup. Authors can create their own presets (e.g., chapter numbers without titles or the opposite).
- Why: Different destinations; avoid reconfiguring each time.
- Standing: ACCEPTED PROPOSAL
- Source: 5017-5038
- Relationship: ADDS TO S2-133.

### S2-135
- Type: Constraint
- Statement: "Importing and exporting should never silently discard meaningful manuscript content." Tell the author if something (footnotes, comments, special formatting) can't be preserved; before exporting to a lesser format, explain what might change (e.g., "Plain text does not preserve italics or document formatting. Your original manuscript will remain unchanged."). Export verification checks expected chapters, scenes and text are present; don't claim success just because a file was created.
- Why: Protect against content loss.
- Standing: ACCEPTED PROPOSAL
- Source: 5040-5058
- Relationship: ADDS TO S2-129.

### S2-136
- Type: Feature / Scenario
- Statement: Round-trip editing: draft Ch. 1-5 in app → export to Word → editor revises with Track Changes → import revised file → compare with in-app version; author decides what to accept; no automatic overwrite; don't confuse prose changes with story-structure changes. Requires version history and careful Track Changes handling.
- Why: Author control with external editors.
- Standing: UNANSWERED PROPOSAL (blanket agreement)
- Source: 5060-5084
- Relationship: ADDS TO S2-122.

### S2-137
- Type: Constraint (policy)
- Statement: Never make exporting dependent on an active subscription; authors can always retrieve manuscripts and project data even after cancelling. Premium formatting/publishing integrations allowed, but basic access to one's own writing never held hostage.
- Why: "An author's unpublished novel shouldn't become leverage for retaining a customer."
- Standing: UNANSWERED PROPOSAL (blanket "agree with everything")
- Source: 5086-5096
- Relationship: ADDS TO S2-123.

### S2-138
- Type: Principle
- Statement: Creative Portability (eighth principle): authors can import, export, back up, and continue their work elsewhere. Plus "No vendor lock-in." Principles table: Author Sovereignty, Adaptability, Narrative Integrity, Transparency, Contextual Guidance, Progressive Complexity, Creative Momentum, Creative Portability.
- Why: Control over creative work.
- Standing: ACCEPTED PROPOSAL (11:28 "I agree with everything you said")
- Source: 5098-5119
- Relationship: ADDS TO S2-063. RESTATEMENT of principles: the Contextual Guidance row here drops "without citing book chapters and pages" (present in S2-063); omission does NOT cancel S2-049.

### S2-139
- Type: Process / Data model
- Statement: Create the IDW story information in a structured, portable format from the beginning; posters printable while retaining the structured data; when a plot decision changes, update data and regenerate maps. "One master story model. Three printable visualizations. Unlimited room to evolve."
- Why: Avoid rebuilding data when moving to software.
- Standing: ACCEPTED PROPOSAL
- Source: 5121-5137
- Relationship: ADDS TO S2-098, S2-101.

### S2-140
- Type: Feature
- Statement: Export the planning, the visuals, etc. (not only manuscript).
- Why: Yolanda wants the whole creative project portable.
- Standing: DECIDED BY YOLANDA ("We should also support exporting the planning, the visuals, etc.")
- Source: 5141, 11:28 ET
- Relationship: ADDS TO S2-133.

### S2-141
- Type: Behavior (terminology clarification)
- Statement: "Front matter" means material before the main text of a published book (title page, copyright page, dedication) and is separate from planning materials; Yolanda had wondered if front matter meant planning exports.
- Why: Clarification.
- Standing: ACCEPTED PROPOSAL (clarification)
- Source: 5141, 5153
- Relationship: DIFFERENT SUBJECT FROM S2-140.

### S2-142
- Type: Data model / Feature
- Statement: Five export categories: 1. Manuscript (entire, chapters, scenes, sequences); 2. Planning Materials (story bible, outlines, beat sheets, character profiles, setting info, scene plans, research notes); 3. Visualizations (chronological, relationship, hybrid maps, timelines, character arcs, causality diagrams, POV maps); 4. Analysis & Tracking (scene-value changes, diagnostics, writing progress, word counts, unresolved decisions, setups and payoffs); 5. Complete Project Archive (everything incl. relationships, metadata, author decisions, revision history).
- Why: Implements S2-140.
- Standing: ACCEPTED PROPOSAL
- Source: 5157-5167
- Relationship: ADDS TO S2-140, S2-133.

### S2-143
- Type: Feature
- Statement: Visual exports: PDF (high-resolution, print-ready posters including oversized formats), SVG, PNG, editable formats where feasible (PowerPoint, vector design software). Export entire map or selected portion.
- Why: Printing posters and sharing.
- Standing: ACCEPTED PROPOSAL
- Source: 5169-5178
- Relationship: ADDS TO S2-142.

### S2-144
- Type: Scenario / UI-UX
- Statement: Print the complete IDW story architecture at 48 × 36 inches, then separately print an enlarged map of Act Two; or print a detailed diagram of the fish-guts sequence showing each scene's goal, conflict, value change, and causal relationship. Yolanda: "That would, 100% be me!!"
- Why: Her actual working style: wall posters plus focused maps.
- Standing: DECIDED BY YOLANDA ("That would, 100% be me!!")
- Source: 5180-5182, 5249-5252, 11:30 ET
- Relationship: ADDS TO S2-143; poster size 48 × 36 possibly relates to an earlier decision on poster size.

### S2-145
- Type: Feature
- Statement: "Narrative Zoom should work for exporting, not just for viewing."
- Why: Print any zoom level.
- Standing: ACCEPTED PROPOSAL (Yolanda's enthusiastic 11:30 response)
- Source: 5184
- Relationship: ADDS TO S2-003.

### S2-146
- Type: Data model
- Statement: Two project export types: Presentation export (for humans: formatted docs, diagrams, tables, reports) and Portable data export (structured information importable elsewhere or restorable). Author can do both.
- Why: A PDF of a diagram is useful, but data preserves future ability to work with it.
- Standing: ACCEPTED PROPOSAL
- Source: 5186-5198
- Relationship: ADDS TO S2-142.

### S2-147
- Type: UI-UX
- Statement: Selectable export interface ("Export: I Declare War" with checkboxes: Complete manuscript, Story bible, Character development, Structural beat sheet, Scene and sequence maps, All three story posters, Timeline and locations, Causal relationships, Setup and payoff tracking, Author notes and decisions; unchecked: Private research materials, Revision history), then choose formats and destination.
- Why: Don't force an enormous archive when someone wants only character profiles.
- Standing: ACCEPTED PROPOSAL; checked state is EXAMPLE / ILLUSTRATION
- Source: 5200-5225
- Relationship: ADDS TO S2-142.

### S2-148
- Type: Constraint
- Statement: Exported project must remain intelligible without the software (years later). Exporting never alters the original project; it is a copy.
- Why: Genuine creative portability.
- Standing: ACCEPTED PROPOSAL
- Source: 5227-5241
- Relationship: ADDS TO S2-133.

### S2-149
- Type: Principle
- Statement: Expanded Creative Portability: "Authors must be able to import, export, back up, and independently access their manuscripts, planning materials, story architecture, visualizations, and project history in practical, widely usable formats."
- Why: Incorporates Yolanda's S2-140.
- Standing: ACCEPTED PROPOSAL
- Source: 5237-5239
- Relationship: ADDS TO S2-138.

### S2-150
- Type: Process
- Statement: Immediate objective intact: three large-format IDW posters supported by one editable master story model; so Yolanda can put posters on her wall and get back to writing her novel.
- Why: Creative momentum.
- Standing: ACCEPTED PROPOSAL
- Source: 5243-5245
- Relationship: RESTATEMENT OF S2-047, S2-139.

### S2-151
- Type: Principle / Scenario
- Statement: Narrative Zoom as a signature feature. Scenario: giant IDW map on the wall; when ready to write the fish-guts sequence, print a separate detailed map of that sequence and put it beside the computer; afterward return to the master poster.
- Why: Matches how Yolanda works.
- Standing: ACCEPTED PROPOSAL (derived from Yolanda's "100% be me")
- Source: 5260-5275
- Relationship: ADDS TO S2-144.

### S2-152
- Type: Feature / UI-UX
- Statement: Sequence detail map contents: sequence objective; individual scenes (goals, conflicts, outcomes, value changes); causal chain; character perspectives (what Kevin believes, what Anthony believes, what Francine is actually doing); setups and payoffs; larger context (how the sequence advances the A Story, B Story, and the controlling idea).
- Why: Focused working map.
- Standing: UNANSWERED PROPOSAL (Yolanda responded only to the A/B story limitation)
- Source: 5266-5273
- Relationship: ADDS TO S2-151. Note: "A Story, B Story" later challenged by Yolanda (S2-160).

### S2-153
- Type: Story fact (IDW)
- Statement: In IDW, Kevin and Anthony hold (mistaken) beliefs while Francine is "actually doing" something hidden — belief vs truth layers per character. IDW has a controlling idea, A Story and B Story.
- Why: Sequence map example.
- Standing: EXAMPLE / ILLUSTRATION (consistent with hidden-antagonist facts; possibly relates to earlier)
- Source: 5271-5273
- Relationship: ADDS TO S2-108.

### S2-154
- Type: Feature
- Statement: Narrative Zoom in two directions: zoom INTO structure (Novel → Act → Sequence → Scene → Dramatic Beat) and zoom ACROSS ("relational zoom"): e.g., a map of every appearance of Francine's ledger, every clue tied to it, every character who encounters it, and its payoff; or every scene where Kevin's need for respect influences his decisions.
- Why: Both chronological and relational focus.
- Standing: UNANSWERED PROPOSAL (blanket); related to accepted S2-014 (horizontal navigation)
- Source: 5277-5293
- Relationship: ADDS TO S2-014.

### S2-155
- Type: Story fact (IDW)
- Statement: Kevin has a "need for respect" that influences his decisions; Francine's ledger has clues and a payoff.
- Why: Relational zoom example.
- Standing: EXAMPLE / ILLUSTRATION (possibly relates to earlier bible facts)
- Source: 5287-5289
- Relationship: ADDS TO S2-016.

### S2-156
- Type: Feature / UI-UX
- Statement: Printable poster editions: Reference Edition (beautifully organized, information-rich established architecture) and Working Edition (same map with designated space for handwritten notes, questions, revisions, ideas). Stand at the wall, spot a weak connection, jot a solution, update the digital model later, print fresh version after significant changes.
- Why: Physical engagement with story.
- Standing: UNANSWERED PROPOSAL
- Source: 5295-5307
- Relationship: ADDS TO S2-095 (progress toggle) — different axis (notes space vs progress indicators).

### S2-157
- Type: Principle
- Statement: Product identity: "It shouldn't just help authors visualize their stories. It should let them physically surround themselves with the parts of their stories they're actively developing." The three posters become three "master views" from which a family of focused writing maps can be generated; design posters with that expansion in mind.
- Why: Yolanda's wall-of-maps working style; aim is the "OH! THAT'S WHAT NEEDS TO HAPPEN!" moment then straight to manuscript.
- Standing: UNANSWERED PROPOSAL (aligned with Yolanda's "100% be me")
- Source: 5309-5321
- Relationship: ADDS TO S2-020.

### S2-158
- Type: Constraint / Data model
- Statement: Cannot limit the author to just A and B stories; must support multiple plots, a series (e.g., three-book deal), TV shows, movies; plots A and B may settle in the first episode while C and D settle much later in a TV series.
- Why: Real structures have many plots resolving at different times.
- Standing: DECIDED BY YOLANDA ("we cannot limit the author to just A and B")
- Source: 5325, 11:33 ET
- Relationship: ADDS TO S2-152 (corrects A/B-only framing).

### S2-159
- Type: Principle / Scope
- Statement: Yolanda: "Oh darn. I think I just expanded this from being only for a novel." Scope extends to series, TV, film.
- Why: Follows from S2-158.
- Standing: DECIDED BY YOLANDA (stated; accepted by GPT as "narrative architecture platform"). Note: task brief describes program as novel-planning; this section is where scope widened to other media. Possibly relates to later decisions narrowing or keeping scope.
- Source: 5327, 11:33 ET
- Relationship: ADDS TO S2-048.

### S2-160
- Type: Principle
- Statement: GPT reframes as a "narrative architecture platform" supporting novels, book series, screenplays, TV episodes, seasons, entire series. "The underlying principles of storytelling remain recognizable across these formats. What changes is how the dramatic units are organized, developed, and resolved."
- Why: Architecture needs revealed, not changed.
- Standing: ACCEPTED PROPOSAL (Yolanda's next message 11:39 continues building; see later)
- Source: 5335-5343
- Relationship: ADDS TO S2-159.

### S2-161
- Type: Data model
- Statement: A/B/C/D plots not hardcoded; no limit on number. Labels A/B/C/D are not permanent properties of storylines; each storyline has a permanent identity (e.g., "STORYLINE-004: The Mysterious Disappearance") and its A/B/C/D designation is an attribute of its role within a particular narrative unit (episode). Novels may have seven storylines without naming A-G (labels optional). Illustrative TV table showing storylines' plot letter changing per episode.
- Why: "A storyline's importance within an episode is not necessarily the same as its importance within the entire series."
- Standing: ACCEPTED PROPOSAL (builds on Yolanda's S2-158); TV table is EXAMPLE / ILLUSTRATION
- Source: 5347-5390
- Relationship: ADDS TO S2-158.

### S2-162
- Type: Data model
- Statement: Narrative containers replace the fixed Story → Act → Sequence → Scene → Beat hierarchy with configurable templates: Standalone novel (Novel → Act → Sequence → Scene → Beat); Novel series (Series → Book → Act → ...); Film; Television (Series → Season → Episode → Act → Scene → Beat); Limited series; Anthology (Collection → Installment → Scene → Beat). Custom structures allowed (teaser + five acts; chapters and sequences without acts). "The software should understand the relationship between the units without dictating what those units must be called."
- Why: Single hierarchy insufficient for TV or sagas.
- Standing: ACCEPTED PROPOSAL
- Source: 5392-5429
- Relationship: ADDS TO S2-011 (generalizes; the novel hierarchy remains as one template, not replaced).

### S2-163
- Type: Data model
- Statement: Storyline lifecycle states: Introduced, Developing, Escalating, Temporarily resolved, Dormant, Reopened, Resolved, Intentionally unresolved; plus custom states. Plot threads need not resolve when the container ends.
- Why: E.g., Ep. 1 introduces four plotlines; A and B resolve, C advances, D pays off in Season 3.
- Standing: ACCEPTED PROPOSAL
- Source: 5431-5460
- Relationship: ADDS TO S2-161.

### S2-164
- Type: Feature
- Statement: Narrative Zoom on a single storyline shows its development across an entire series/trilogy: every major development, reversal, value change, and payoff from introduction to resolution.
- Why: Track long arcs.
- Standing: ACCEPTED PROPOSAL
- Source: 5462-5468
- Relationship: ADDS TO S2-154.

### S2-165
- Type: Data model
- Statement: Every narrative level has its own dramatic objective, dramatic question, progression, turning points and resolution, each contributing to the level above (scene → sequence → episode → season → series objectives example).
- Why: Extend dramatic-unit model rather than invent new architecture per medium.
- Standing: ACCEPTED PROPOSAL
- Source: 5470-5492
- Relationship: ADDS TO S2-162; possibly relates to earlier scene/sequence objective discussion (Section 1).

### S2-166
- Type: Data model
- Statement: Two distinct relationship systems: Containment (this scene belongs to this episode) and Participation (this scene contributes to this storyline, which may span containers). A scene belongs to one container but may advance several storylines.
- Why: "That distinction will become fundamental to our data model."
- Standing: ACCEPTED PROPOSAL
- Source: 5494-5510
- Relationship: ADDS TO S2-162, S2-161.

### S2-167
- Type: Feature / Data model
- Statement: Resolution Architecture: different kinds of closure — Scene closure, Episode closure, Season closure, Series closure; intentional loose ends allowed at every level. An episode can achieve closure without resolving every storyline.
- Why: Yolanda's TV example.
- Standing: ACCEPTED PROPOSAL
- Source: 5512-5537
- Relationship: ADDS TO S2-163.

### S2-168
- Type: Feature
- Statement: Narrative obligations: when an author introduces a significant question/promise, the system records the expectation, does not insist on immediate answer, remembers it, and shows development across intervening material (e.g., mystery introduced Ep. 2 resolved Ep. 17). Setup-and-payoff system at larger scale.
- Why: Track promises to the audience.
- Standing: ACCEPTED PROPOSAL
- Source: 5539-5553
- Relationship: ADDS TO S2-167; relates to setup/payoff (possibly earlier sections).

### S2-169
- Type: Feature
- Statement: Narrative Zoom medium-independent: vertical (Television Series → Season → Episode → Act → Sequence → Scene → Beat) and horizontal: a character across six seasons; zoom into Season 3; relationship arc between two characters; mystery spanning 14 episodes; every appearance of an important object; causal chain from Ep. 1 to Season 5. Zoom by structure, storyline, character, theme, chronology, or causal relationship.
- Why: Right architectural foundation.
- Standing: ACCEPTED PROPOSAL
- Source: 5555-5587
- Relationship: ADDS TO S2-154.

### S2-170
- Type: Data model / Feature
- Statement: Pacing measures vary by medium: novels (manuscript percentage, word count, approx pages); screenplay/TV (script pages, estimated screen time, episode runtime, act breaks, scene duration, season/episode placement); multibook series (book-level and series-level position, e.g., revelation at 75% of Book Two ≈ halfway through trilogy). "Narrative position relative to its container" is a core feature; don't assume all units are measured in novel pages.
- Why: Multi-media support.
- Standing: ACCEPTED PROPOSAL
- Source: 5589-5616
- Relationship: ADDS TO S2-087, S2-088.

### S2-171
- Type: Feature
- Statement: Continuity across installments: Character continuity (ages, relationships, physical traits, history, knowledge, change over time); World continuity (locations, geography, institutions, rules, setting changes); Event continuity (what, when, dependents); Object continuity (location, possession, fate); Relationship continuity; Unresolved narrative obligations. Distinguish what is true within the fictional world from what the audience has been allowed to learn.
- Why: Six-season series or seven-book saga continuity demands; important for mysteries, thrillers, serialized dramas.
- Standing: ACCEPTED PROPOSAL
- Source: 5618-5644
- Relationship: ADDS TO S2-019; references earlier IDW discussion of tracking locations, time, knowledge, events (possibly relates to Section 1 Storyworld).

### S2-172
- Type: Feature (future)
- Statement: Writers' rooms / collaboration (not first version, but anticipated): showrunner sets season arc; episode writer develops assigned episode; shared series-level model; changes to character history or long-running storylines flagged for review; permissions — not every collaborator can change series canon; future editorial approval, change proposals, version history, role-based access. Don't design foundation to make collaboration impossible.
- Why: TV involves multiple creators.
- Standing: UNANSWERED PROPOSAL (Yolanda later (11:39) speaks to collaboration? see S2-176+); POSSIBILITY for future
- Source: 5646-5672
- Relationship: new.

### S2-173
- Type: Principle
- Statement: Now a "medium-independent narrative development and visualization platform" whose intelligence understands: 1 dramatic units and relationships; 2 storylines across containers; 3 character and relationship arcs; 4 story values and change; 5 causes, consequences, dependencies; 6 storyworld time, locations, continuity; 7 information, revelation, audience knowledge; 8 promises and payoffs; 9 author intentions and decisions; 10 manuscripts, scripts, planning docs, visual representations. Specialized interfaces adapt to novels, films, TV.
- Why: Stronger than separate apps per medium.
- Standing: ACCEPTED PROPOSAL
- Source: 5674-5697
- Relationship: ADDS TO S2-160.

### S2-174
- Type: Process / Constraint
- Statement: Protect against scope explosion: design for the larger vision but do not implement it before producing the three posters; "I don't want the software concept to swallow the novel." Two parallel tracks: Track One = immediate creative tool: three printable IDW maps named Chronological Story Architecture, Narrative Relationship Map, Hybrid Story Command Center (first deliverables); Track Two = eventual platform: document broader requirements (multibook, film, TV, serialized plots, continuity) to inform the data model without becoming prerequisites.
- Why: Yolanda came to write IDW; preserve momentum.
- Standing: ACCEPTED PROPOSAL (Yolanda already decided posters first, S2-047)
- Source: 5699-5729
- Relationship: ADDS TO S2-047. Poster names here possibly relate to earlier names from Section 1.

### S2-175
- Type: Data model
- Statement: Story Universe as the highest-level entity (instead of the novel): may contain a standalone novel, trilogy, TV series, multiple related works, or mixed media; projects within it have their own structures; storylines, characters, locations, events, themes connect across projects. Authors are not forced to create a sprawling universe for one standalone novel; for simple projects the complexity stays invisible.
- Why: Multibook/serialized support with adaptability.
- Standing: ACCEPTED PROPOSAL. Yolanda explicitly adopts the name just past this section's end (6150, 11:45 ET: "calling it the story universe is right"), but as Iteration/Phase 3, not as part of the immediate build.
- Source: 5731-5749, 11:33 ET; confirmation 6150
- Relationship: ADDS TO S2-162; possibly relates to the Storyworld module (earlier sections) — DIFFERENT SUBJECT: "Storyworld" (setting/world facts) vs "Story Universe" (top-level container of projects).

### S2-176
- Type: Principle / Data model
- Statement: Three independent dimensions: "A narrative container determines where a story event is presented. A storyline determines what larger dramatic development that event belongs to. A causal relationship explains why the event happens." Must remain independent.
- Why: Same architecture can represent IDW, a psychological thriller trilogy, a screenplay, or a TV series.
- Standing: ACCEPTED PROPOSAL
- Source: 5751-5757
- Relationship: ADDS TO S2-166.

### S2-177
- Type: Process
- Statement: "We now understand the larger vision while keeping the first three posters firmly at the front of the line."
- Why: Scope control.
- Standing: ACCEPTED PROPOSAL (Yolanda confirms at 6147-6150 "We do not want scope creep")
- Source: 5769
- Relationship: RESTATEMENT OF S2-174.

### S2-178
- Type: Scenario / Data model
- Statement: For a novel series (e.g., three-book series), if Book 2 or 3 isn't written or even planned, parts of the plots may make up Story C; Story C is supposed to be resolved in Book 2, but since Book 2 isn't written, its percentage position is unknown. Page counts/percentages across multiple books, seasons, scripts must accommodate unknowns.
- Why: Can't compute position in unwritten installments.
- Standing: DECIDED BY YOLANDA (raised as a requirement: "because Book 2 isn't written we don't know what percentage it's at yet")
- Source: 5773, 11:41 ET
- Relationship: ADDS TO S2-170.

### S2-179
- Type: Principle
- Statement: Distinguish knowing WHAT will happen, WHERE it will happen, and WHEN it will happen; three independent pieces of information. "We cannot require an author to know where something happens in a book that hasn't been planned or written yet."
- Why: Response to S2-178.
- Standing: ACCEPTED PROPOSAL in substance (grounded in Yolanda's S2-178), but note: Yolanda said at 11:45 (just after the section) that she "kind of skimmed over this last conversation"; so details in S2-179 to S2-194 are effectively UNANSWERED PROPOSALS beyond her core point.
- Source: 5781-5789, 11:42 ET
- Relationship: ADDS TO S2-178.

### S2-180
- Type: Data model
- Statement: A storyline can have a destination without a position. Record: Introduced (Book 1), Continues (Book 2), Intended resolution (Book 2), Resolution scene / percentage / page = Undetermined, Planning status = "Intent established, placement pending." Do not assign an arbitrary percentage or page; do not treat missing info as a structural weakness — it is a decision at a higher narrative level and should be preserved.
- Why: Author hasn't failed to plan.
- Standing: UNANSWERED PROPOSAL (core idea from Yolanda; specifics skimmed)
- Source: 5791-5823
- Relationship: ADDS TO S2-178.

### S2-181
- Type: Feature / Data model
- Statement: Progressive Story Placement: position an event at any level of specificity: L1 Series placement (somewhere in trilogy); L2 Installment (Book 2); L3 Structural (Act Three of Book 2); L4 Relative (~80% through Book 2); L5 Scene (Scene 42 of Book 2); L6 Manuscript (around page 285). Not sequential stages; may stay at book level indefinitely; "more precision doesn't necessarily mean a better story."
- Why: Different levels of planning precision.
- Standing: UNANSWERED PROPOSAL
- Source: 5825-5865
- Relationship: ADDS TO S2-180.

### S2-182
- Type: Data model
- Statement: Placement planning states: Unknown (knows Book 2, not where); Undecided (Book 2 or 3 not decided); Tentative (expects midpoint of Book 2, may change); Confirmed (committed to Act Three); Drafted (appears in a written scene); Intentionally unspecified (prefers to decide during drafting). "Unknown is not the same as undecided."
- Why: Preserve subtle differences.
- Standing: UNANSWERED PROPOSAL
- Source: 5867-5887
- Relationship: ADDS TO S2-181; relates to decision status (S2-118: Confirmed, working possibility, unresolved, rejected) — UNCLEAR how these two status vocabularies combine (one is decision status of facts, the other is placement certainty).

### S2-183
- Type: UI-UX
- Statement: Visualizations show uncertainty without inventing precision. Trilogy map BOOK ONE → BOOK TWO → BOOK THREE: Story C as a continuous line from Book One into Book Two; introduction attached to exact scene; resolution marker associated with Book Two as a whole, labeled e.g. "Story C: Introduced in Book 1 → Resolution planned for Book 2 (placement TBD)"; as Book Two develops, marker becomes precise and visualization updates automatically.
- Why: Show what the author knows, no more.
- Standing: UNANSWERED PROPOSAL
- Source: 5889-5913
- Relationship: ADDS TO S2-181.

### S2-184
- Type: UI-UX / Constraint
- Statement: Never draw an unknown-position marker partway across a book (even labeled TBD), because placement visually implies a timing decision. Use an "unplaced events area" associated with that book.
- Why: Map communicates exactly what the author knows.
- Standing: UNANSWERED PROPOSAL (GPT: "a design detail I'd insist on")
- Source: 5915-5923
- Relationship: ADDS TO S2-183. Relevant even for IDW posters (undetermined events).

### S2-185
- Type: Constraint
- Statement: "Every percentage must identify what it is a percentage OF" (75% of Book Two, 40% of Season One, 60% of Episode Five, 90% of the trilogy). Never display a percentage without a reference unit. Overall percentages depend on relative lengths (e.g., 80k/100k/120k books); may be unknown. Distinguish actual manuscript placement from estimates based on projected lengths.
- Why: Trustworthy information.
- Standing: UNANSWERED PROPOSAL (responds to Yolanda's percentage concern)
- Source: 5925-5954
- Relationship: ADDS TO S2-170, S2-088 (estimates labeled).

### S2-186
- Type: Feature / Data model
- Statement: Outcome Anchor: record an intended outcome without scenes or causal path. Example "Story C: The Missing Inheritance" — Introduced Book One; Intended resolution Book Two; Outcome: inheritance discovered to have been deliberately concealed; revelation scene Unknown; causal sequence Not yet developed. Causal integrity analysis treats the incomplete chain as expected for an unplanned installment — a "development opportunity," not a plot hole.
- Why: Destination known before path.
- Standing: UNANSWERED PROPOSAL; "Missing Inheritance" is EXAMPLE / ILLUSTRATION (not IDW)
- Source: 5956-5986
- Relationship: ADDS TO S2-004 (modifies how causal analysis reports gaps).

### S2-187
- Type: Feature / Data model
- Statement: Narrative Commitments: things the author has decided must eventually happen even if how/where is undecided (Story C resolves in Book Two; a character must survive until Book Three; two characters reconcile before the finale; a Season One mystery explained in Season Three; an object returns in the final installment). Builds on narrative promises.
- Why: Such decisions shape architecture long before scenes exist.
- Standing: UNANSWERED PROPOSAL
- Source: 5988-6002
- Relationship: ADDS TO S2-168 (narrative obligations). Note: obligations = promises to audience; commitments = author's own decisions about future events — related but different emphasis.

### S2-188
- Type: Behavior / Scenario
- Statement: Ripple Effect with commitments: moving Story C's resolution from Book Two to Book Three identifies existing dependencies (Book Two events assuming resolution) but does not flag undeveloped Book Three as defective. Example message: "Story C's resolution has moved to Book Three. Two planned events in Book Two currently depend on that resolution having occurred. You may want to review those relationships."
- Why: Useful, specific, respects authority.
- Standing: UNANSWERED PROPOSAL
- Source: 6004-6016
- Relationship: ADDS TO S2-015.

### S2-189
- Type: Data model / Feature
- Statement: Two independent storyline progress indicators: Planning maturity (how much decided) and Manuscript realization (how much written). Example table: Story A fully outlined / Book 1 drafted; Story B major beats / partially drafted; Story C resolution assigned to Book 2 / not started; Story D concept only / not drafted. No percentage for planning maturity without a defensible basis; qualitative states preferred.
- Why: Conceptual development is independent of drafting.
- Standing: UNANSWERED PROPOSAL
- Source: 6018-6041
- Relationship: ADDS TO S2-090 (Story Development vs Manuscript Progress), S2-085; consistent with S2-010 (no arbitrary scores).

### S2-190
- Type: Scenario
- Statement: TV showrunner six-season example: secret introduced S1, audience learns S2, another character discovers S3, consequences dominate S4, resolves S5; episodes unknown; commitments later assigned to episodes, acts, sequences, scenes as writers' room plans each season. "The structure grows without requiring premature decisions."
- Why: Same principle across media.
- Standing: EXAMPLE / ILLUSTRATION
- Source: 6043-6063
- Relationship: ADDS TO S2-187, S2-172.

### S2-191
- Type: Constraint
- Statement: "The program must never confuse missing planning information with missing story logic." Must not announce "Plot hole detected" when intervening events are simply unmapped; instead: "Story C has an established resolution destination in Book Two. The events connecting its introduction to that resolution have not yet been mapped," with an option "Explore Story C's development" opening Narrative Zoom on that storyline. "No pressure, no invented structure, and no false diagnosis."
- Why: Protects causal analysis Yolanda was excited about from false positives.
- Standing: UNANSWERED PROPOSAL (strongly consistent with Yolanda's "no bad writing advice," S2-026)
- Source: 6065-6095
- Relationship: ADDS TO S2-004, S2-026.

### S2-192
- Type: Feature (summary)
- Statement: Three new concepts formally proposed: Progressive Story Placement; Outcome Anchors; Narrative Commitments — useful for multibook and also standalone novels (author can know the climax before Chapter Four).
- Why: Solve multibook/serial planning.
- Standing: UNANSWERED PROPOSAL
- Source: 6097-6113
- Relationship: RESTATEMENT OF S2-181, S2-186, S2-187.

### S2-193
- Type: Principle
- Statement: Progressive Definition: "The system must allow a story to exist at any stage of completeness, from a single idea to a finished manuscript, without inventing missing information or demanding premature decisions." Author can know beginning and end without middle; transformation without scenes; mystery answer without clue placement. "The program's job is to preserve what the author knows, make visible what remains open, and help connect those pieces when the author is ready."
- Why: Legitimate creative states.
- Standing: UNANSWERED PROPOSAL (Yolanda skimmed; no explicit response)
- Source: 6115-6133
- Relationship: ADDS TO S2-063 (alongside Adaptability and Author Sovereignty); related to Progressive complexity (S2-063) but DIFFERENT SUBJECT (complexity of features vs completeness of story info).

### S2-194
- Type: Principle / Process
- Statement: Even though IDW is standalone, Progressive Definition helps avoid presenting its many illustrative possibilities as established story decisions.
- Why: Architectural discipline.
- Standing: UNANSWERED PROPOSAL
- Source: 6135-6137
- Relationship: ADDS TO S2-024, S2-118.

### S2-195
- Type: Process (context, just past END)
- Statement: Immediately after this section (6141-6150, 11:45 ET), Yolanda says she skimmed the last response ("my eyes are glazing over"), needs to return to her paying job, believes the planning is valid and useful to her and others, and sets three iterations: 1. just delivering what she originally planned for (posters); 2. making this for the novel; 3. "calling it the story universe is right." Also "We do not want scope creep."
- Why: Scope control; governs how all items in this section should be phased.
- Standing: DECIDED BY YOLANDA (quoted)
- Source: 6141-6150 (outside range; included for context, handled by next section)
- Relationship: ADDS TO S2-174; confirms S2-175 name; implies S2-179 to S2-194 were skimmed rather than explicitly approved.

### S2-196
- Type: UI-UX / Work habit
- Statement: Yolanda's working style revealed: she prints and posts large maps on her wall and wants focused printed maps beside her computer; she gets enthusiastic and expansive in conversation; she writes conversationally and asks design questions rather than giving specs; she reads long responses but can glaze over ("I kind of skimmed"). Implication: deliverables and summaries should be concise; long specs risk being skimmed, so skimmed proposals should not be treated as her decisions.
- Why: Use patterns.
- Standing: DECIDED BY YOLANDA (behavior observed: "That would, 100% be me!!"; "I kind of skimmed")
- Source: 5249-5252; 6141
- Relationship: ADDS TO S2-144.

### S2-197
- Type: Principle
- Statement: Yolanda believes the program will be useful to her and also to other people (general-purpose intent stated by her).
- Why: Product purpose beyond IDW.
- Standing: DECIDED BY YOLANDA ("it'll be useful to other people")
- Source: 6145 (just past END)
- Relationship: ADDS TO S2-048.

---

## Open questions in this section

1. Built-in manuscript editor vs integration-first (S2-099): GPT recommended integration/import-export first and an editor later; Yolanda's 11:25 message ("if we are supporting writing the manuscript within the program...") implies in-program writing is expected but does not fix timing. The three-stage roadmap (S2-124) places the editor in Stage 3; the 6141+ phases put "manuscript integration" in Phase 2.
2. Two different build-order proposals (S2-098 five steps vs S2-124 three stages vs S2-174 two tracks); none explicitly chosen by Yolanda until her three iterations at 6147-6150 (next section).
3. Next step "formally define the story data model" (S2-023) was proposed; Yolanda never explicitly scheduled it.
4. How many Blake Snyder story types apply to IDW beyond Buddy Love (S2-074) — left for Yolanda to decide.
5. Whether genre roles are two-tier (Yolanda: primary/secondary) or three-tier (GPT: primary/secondary/influence) (S2-072).
6. Privacy items (S2-123), subscription/export policy (S2-137), local-first/offline: never explicitly addressed by Yolanda.
7. Whether the program is still "for novels" (task framing) or a multi-media platform: Yolanda expanded it (S2-159) and then phased it (S2-195): novel first, Story Universe third.
8. How Placement planning states (S2-182) reconcile with decision status vocabulary (S2-118).
9. Where poster page numbers come from before a manuscript exists (S2-088 says estimates must be labeled; percentages must state reference unit, S2-185).
10. Reference Edition vs Working Edition posters (S2-156) and progress-indicator toggle (S2-095) — not confirmed by Yolanda.
11. Whether collaboration/writers' room features (S2-172) are in scope at all.

## Unclear items

- S2-124 vs S2-098: both GPT roadmaps; neither cancels the other explicitly. Narrative Zoom appears as step 3 in S2-098 but as Stage 3 (with built-in editor) in S2-124. Superseded in practice by Yolanda's iterations (next section).
- S2-011 vs S2-162: the Story → Act → Sequence → Scene → Beat hierarchy is not replaced but becomes one configurable template among narrative containers; the novel template is still the default for IDW.
- S2-168 (Narrative obligations) vs S2-187 (Narrative Commitments): overlapping concepts; unclear whether they are one data type or two.
- S2-182 vs S2-118 status vocabularies: unclear whether they merge.
- S2-175 Story Universe vs earlier "Storyworld module" (referenced at 3581, from before this section): different subjects with similar names; risk of conflation.
- S2-179 to S2-194: grounded in Yolanda's question but she admitted skimming; treat as unanswered proposals, not decisions.
- S2-102 vs S2-105: Yolanda said multiple POV "usually" means ensemble; GPT corrected that it doesn't necessarily; she agreed with "everything" afterward. Her requirement (designate POV character and person) stands; her assumption was refined.

## Items ChatGPT dropped or distorted when restating

- Chapter/page ban: S2-063's Contextual Guidance row includes "without ... citing book chapters and pages," but the later principle table at 5104-5113 (S2-138) drops that clause. Omission does not cancel Yolanda's decision S2-049.
- GPT's earlier suggestion of chapter references and verified page references (S2-034) was explicitly overruled by Yolanda (S2-049); later restatements honored this.
- Yolanda's dual-genre-system practice (Blake Snyder genres AND conventional genres, each with primary/secondary, S2-067) was preserved by GPT (S2-073), but GPT added a third "influence" tier she did not request.
- Yolanda's "honor system" question (S2-103) was reframed by GPT as "a privacy and workflow choice" (S2-115) — a reframing rather than a distortion, but her concern about reliability of self-reported progress is answered only by labeling.
- Yolanda's request to export "the planning, the visuals, etc." (S2-140) — GPT had partially covered it as "project export" but its first format table (S2-130) covered only manuscripts; GPT acknowledged and expanded (S2-142).
- The sequence detail map (S2-152) used "A Story, the B Story" framing; Yolanda immediately corrected that authors can't be limited to A and B (S2-158).
- The 11:45 phase summary (just past END, 6163-6188) lists Phase 2 features but drops several items from this section, including: Writing Trail, Authorial Intent Notes, Quiet/Advisory/Deep Analysis guidance settings, Craft Resource Advisor (only implicitly via "genre awareness"), The Ripple Effect, POV tracking, Drafting Readiness / Write Anyway, Next Writing Action, privacy/ownership commitments, Reference vs Working poster editions, and Progressive Definition. Their omission does not cancel them.
- The 11:45 Phase 1 description adds "percentages, estimated page numbers" to the Chronological Map (consistent with S2-088 / earlier page-number decision) and names the posters "Chronological Map / Relationship Map / Hybrid Map," whereas S2-174 called them "Chronological Story Architecture / Narrative Relationship Map / Hybrid Story Command Center" — naming inconsistency, not a decision change.
- Product principle statements accumulate (6 → 7 → 8 principles, then Progressive Definition); the 8-principle table (S2-138) omits "I don't know" humility (S2-044) and the Evidence vs Interpretation four-type distinction (S2-039) except as "Transparency."
