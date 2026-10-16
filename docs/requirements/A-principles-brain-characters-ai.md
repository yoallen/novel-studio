# Consolidated Requirements, Theme A: Authority, Canon, Story Brain, Characters, AI Collaborator

Program: an unnamed, general-purpose novel-planning and writing desktop program (Windows, local, private) designed by Yolanda Allen. "StoryForge" is rejected as a name. *I Declare War* (IDW) is the first story and the richest test case. It is not the program's purpose, and nothing about IDW is a program default.

Inputs consolidated: section-1.md to section-8.md (the design conversation, 2026-10-14 to 2026-10-15), section-docs-spec.md (ChatGPT's Phase 2 spec, Human Vision brief, review packet), and section-docs-story.md (Story Bible v5 of 10-13, the character archives of 10-14 and 10-15, her 2021 beat spreadsheets, the poster foundation file).

## How to read this register

**Sub-areas**
- A. Foundational principles and author authority (R-A-001 to R-A-022, plus R-A-109, added in verification)
- B. Statuses, canon, possibilities, provenance, decision history (R-A-023 to R-A-042)
- C. The Story Brain: capture, Questions I Have, Things & Ideas, conversations, harvest (R-A-043 to R-A-062)
- D. The character model and character analysis (R-A-063 to R-A-088)
- E. The AI collaborator: role, modes, critique, Craft Resource Advisor (R-A-089 to R-A-108)
- Closing sections: Needs Yolanda; Conflicts between her words and ChatGPT's documents; Things ChatGPT's spec dropped.

**Standing values**
- **Decided by Yolanda**: her own words in the conversation, or her Story Bible / archives where they record her decisions ("Decided.", "AUTHOR DIRECTION", "AUTHOR CORRECTION").
- **Accepted proposal**: ChatGPT proposed it and she explicitly accepted it ("I agree with everything you said", "Yes!!", "I love it!", "Please do so", "Thank you for this", "💯"). Blanket acceptances are noted as blanket.
- **Unanswered proposal**: ChatGPT proposed it and she never answered, or she skimmed past it. Included only where it fits her stated goals. Not binding until she confirms.
- **Spec-only**: appears only in ChatGPT's Phase 2 spec, vision brief or review packet. Restatements, not her words.
- **Possibility**: an idea held open on purpose, or a requirement inferred from a demonstrated workflow and never requested.

**How standing was judged.** A later statement replaces an earlier one only where Yolanda changed her mind or explicitly replaced it. A later ChatGPT summary, spec or example never overrides her decision, and an omission in a later summary never cancels anything. Alternatives coexist. She often reads only part of a long reply and jumps in with a new idea (S8-004), so a proposal she skipped is not accepted.

**Source citations.** Register IDs come from the section registers (S1- to S8-, S8E- for the edited-versions file), the spec register (SP-, HV-, PK-) and the story register (SB- Story Bible, A14-/A15- archives, XL- spreadsheets, PF- poster foundation). "L####" is a line in the full transcript file. "SP L##" and "HV L##" are lines in the spec and vision brief.

---

## A. Foundational principles and author authority

### R-A-001 The program never writes or changes her manuscript
- **Requirement:** The program never writes the novel and never changes manuscript prose on its own. It may identify affected passages, raise questions, and suggest resources, but every creative change to prose is made by the author. Changing the story model never alters prose. A rejected or abandoned AI suggestion leaves the prose byte-for-byte as it was. The AI must not "improve" first-person narration on its own initiative.
- **Why:** "I like that you say that this program does not write the novel and it does not make the changes to it." The writing is hers: "This is my story. The writing is the part I keep." She wants an assistant to her imagination, not a replacement for it.
- **Standing:** Decided by Yolanda (10-14 10:43). The supporting mechanics are Accepted proposals.
- **Evolution:** ChatGPT first stated that a weak scene is never auto-rewritten (S2-006). Yolanda endorsed and generalized it to the whole novel (S2-025). ChatGPT restated it as "shouldn't change the author's manuscript without their explicit direction" (S2-100), then as "story-model changes never automatically alter prose" (S2-122). The spec carries it as Scenario G, "the writer must remain the writer" (HV-078). Nothing replaced it.
- **Sources:** S2-006 (L3221-3227), S2-025 (L3337), S2-100 (L4445-4449), S2-122 (L4804-4818), S3-163 (L6275), S1-023 (bible L35-44), SB-004, S6-150, SP-024, SP-178, HV-078, S7-069 (L18693).
- **Acceptance check:** (1) Ask the AI to critique a drafted scene, decline every suggestion, restart the program: the scene text is identical to before, character for character. (2) Change a beat's planned event in the story model: no manuscript passage is edited, and the program lists the passages that may need her attention.

### R-A-002 The author is the main and final judge
- **Requirement:** Every story decision belongs to the author. The program may point out issues, ask questions, analyze and propose, but it may not declare, revise, resolve or overwrite canon. When two statements contradict, the AI may not decide which one replaces the other: it flags the conflict and asks. Suggestions stay suggestions until she explicitly accepts them.
- **Why:** "The author is the main and final judge." The program is there to help her see and strengthen her story, not to decide it.
- **Standing:** Decided by Yolanda (L3337). The contradiction rule and acceptance mechanics are Accepted / Spec-only restatements consistent with her decision.
- **Evolution:** Stated by her at 10:43 on 10-14. Restated by ChatGPT as "intelligent companion, not an authority" (S2-043), "explicit author approval" (S5-087), and in the spec as "may not silently declare, revise, resolve, or overwrite narrative canon" (SP-024) and "never select a winner" between sources (SP-068). No change since.
- **Sources:** S2-025 (L3337), S2-031 (L3375-3383), S2-043 (L3544-3557), S5-087 (L14666), S6-115 (L17991), S7-016 (L18551), SP-024, SP-068, HV-031.
- **Acceptance check:** (1) Import two sources that disagree about one fact: the program shows both, marks the conflict, and changes neither. (2) Ask the AI "which version is right?": it explains the trade-offs and asks her to choose, and no record changes until she does.

### R-A-003 No bad writing advice: separate checkable facts from interpretation
- **Requirement:** The program must never confidently give bad writing advice. It separates deterministic checks (a missing link, a date clash, a character acting on information before learning it) from interpretive analysis (whether a motivation convinces). Interpretation is always labeled as interpretation and stays open to her judgment. Output distinguishes four kinds of statement: observable structural fact, interpretive observation, craft-based suggestion, and educational reference. No framework is presented as a universal rule, and room is left for deliberate convention-breaking. Interpretation is never presented as mathematically provable.
- **Why:** "Definitely we don't want to give any bad writing advice." ChatGPT's reasoning, which she endorsed: "That's how we avoid building a program that confidently gives bad writing advice."
- **Standing:** Decided by Yolanda (the goal, L3337). The deterministic/interpretive split and four-kind labeling are Accepted proposals (blanket acceptance at 10:55).
- **Evolution:** ChatGPT proposed the split (S2-018). She adopted the goal (S2-026). ChatGPT added four-kind labeling (S2-039) and "the program must be comfortable saying 'I don't know'" (S2-044, see R-A-004). Later restated as "established by author / observed in manuscript / interpretive suggestion" (S3-097) and "what it knows vs what it infers" (S5-088). The spec keeps only "source says X vs AI inferred Y" (SP-067) and "do not treat interpretation as mathematically provable" (SP-092).
- **Sources:** S2-018 (L3305-3307), S2-026 (L3337), S2-039 (L3486-3516), S3-097 (L7961), S5-088 (L14680-14694), SP-067, SP-092, SP-201.
- **Acceptance check:** (1) Run diagnostics on a test novel: every flag is tagged as a structural fact, an interpretation, a suggestion, or a reference, and the tags are visible. (2) A flag about "weak motivation" never appears with the same visual weight or wording as "Scene 7 has no recorded link to Scene 8."

### R-A-004 The program says "I don't know"
- **Requirement:** When a judgment cannot be made from the outline (whether an emotional transition convinces, whether a joke lands), the program says so plainly and names what it would need: the drafted scene, the prose, reader response. Even after reading prose, its conclusions are recommendations, not verdicts.
- **Why:** Responsible analysis. Overconfident analysis is a form of bad advice (R-A-003), and she needs to trust what the program tells her.
- **Standing:** Accepted proposal (blanket acceptance, 10:55 on 10-14).
- **Evolution:** Proposed at S2-044. Not restated in later principle tables (S2-063, S2-138) or the spec, which keeps only a general "candor when something is not supported" (SP-190). The omission does not cancel it.
- **Sources:** S2-044 (L3559-3577), SP-190.
- **Acceptance check:** Ask "is this Confession emotionally believable?" of a scene that exists only as an outline card: the answer says it cannot judge that from an outline and offers to look again once the scene is drafted.

### R-A-005 Diagnostics are questions that respect her intent
- **Requirement:** Every diagnostic is a question worth investigating, not a declaration that something is wrong. The program informs, it does not police. A missing value turn, a long absence or an unconventional choice may be deliberate. The program judges construction against the effect she is trying to create for the reader and against the frameworks she chose, not against a default formula. It must not manufacture an unexpected outcome or a reversal just to satisfy a formula.
- **Why:** "A writing tool should inform the author, not police the author." Sometimes the organic choice is better than the plan. A surprising choice may be what makes a novel distinctive.
- **Standing:** Accepted proposal (accepted 10:35 "I am in love with everything you said", and blanket acceptances after).
- **Evolution:** S1-161 and S1-166 (10:14) set it. S2-059 and S2-062 added "intended reader experience" and "learn her intentions without replacing them". S3-098 added "investigate the gap, don't manufacture outcomes". The spec keeps parts: percentages are "orientation, not tyrannical constraints" (SP-087); repetitions are "editorial hypotheses, not errors" (SP-116).
- **Sources:** S1-161 (L2881-2887), S1-166 (L2961-2969), S2-031, S2-059 (L3782-3824), S2-062 (L3848-3862), S3-098 (L7963-7973), S4-096 (L10133-10138), SP-087, SP-116.
- **Acceptance check:** (1) Create a scene with no value turn: the program asks whether that is intentional, and offers "mark as intentional" (R-A-006). (2) No diagnostic message uses the words "error", "wrong" or "plot hole" for an interpretive finding.

### R-A-006 Authorial Intent Note
- **Requirement:** When the program flags something, she can mark it intentional and say why ("Intentional. This scene establishes a false sense of security that pays off two chapters later."). The note is kept, becomes part of the program's understanding of the story, informs later analysis, and stops the same flag from coming back. She can revisit or revise the note later.
- **Why:** She should not have to defend the same deliberate choice over and over. It also cuts noise.
- **Standing:** Accepted proposal (blanket acceptance, 10:55 on 10-14).
- **Evolution:** Proposed at S2-038. Not carried into the spec (see "Things ChatGPT's spec dropped").
- **Sources:** S2-038 (L3462-3484), S2-062.
- **Acceptance check:** Mark a flagged pacing concern as intentional with a reason, re-run the analysis: the concern does not reappear as new, the reason is shown beside it, and the note can be edited or withdrawn.

### R-A-007 Examples never become canon
- **Requirement:** An example, a demonstration, a sample line, an illustrative scene or a "one way I could play it" passage is never a decision. Examples are always visibly marked as examples and never promoted to canon by import, summary, search, export or AI reasoning. Where the program shows an example it offers more than one flavor when it can, so there is never "one right answer to match." Teaching examples from craft books or her own bible are not facts about her story.
- **Why:** Her Story Bible rule: "Show it: an example, always clearly marked as a demonstration and never a decision. Often more than one flavor." An example "opens the door; it does not walk through it for me." She never wants to feel there is a single answer to copy.
- **Standing:** Decided by Yolanda (Story Bible method). Restated as Accepted and Spec-only.
- **Evolution:** It is her bible's founding convention (S1-023, S1-024). ChatGPT applied it throughout ("hypothetical", "illustrative details, not decisions"). The spec restates it as "An AI suggestion is not a fact. An illustration is not a fact. An example in a craft book or story bible is not a fact." (SP-025), and the packet extends it to creative chat (PK-007). The 10:14 status model on 10-14 folded "example" into "working possibility" (S1-164); that loss is a distortion and was later repaired by the "Illustrative" status (S4-014, R-A-023).
- **Sources:** S1-023 (L35-44), S1-024 (L39-42), S1-182, SB-004, S4-065, S4-127 (L11278), S4-136 (L9627, L11372), S6-115, S6-121, SP-025, SP-061, PK-007, A14-050.
- **Acceptance check:** (1) Import Story Bible v5: every "One way I could play it, not a decision yet" passage imports as Illustrative and none appears in the list of established facts. (2) Ask the AI to summarize Kevin: it does not state the bible's illustrative Lie or Ghost as fact.

### R-A-008 Undecided stays undecided; nothing is invented to fill a gap
- **Requirement:** The program never invents a missing decision. When something is undecided, saying it is undecided is the correct output. It does not fill an undecided beat with an invented scene to make a card look complete, does not invent episodes, sets, finances, trauma or backstory, and does not infer events from concept art or teaching examples. Missing planning information is never reported as missing story logic ("plot hole").
- **Why:** "When something remains undecided, accurately identifying it as undecided *is* the correct result." Invented detail is exactly how earlier posters corrupted her story (Kevin dumping the fish guts, the men as teenagers, invented "ideas in play").
- **Standing:** Accepted proposal (accepted "Please do so" at L13799 on 10-14). Consistent with her repeated demands for accuracy (S5-064 "make it 100% accurate", Decided).
- **Evolution:** Grew from the poster failures (S3-154 to S3-162, S4-009). ChatGPT committed to it (S5-072), applied it to beats (S6-038), to new ideas such as the podcast (S6-127, SP-080, SP-157), to character backstory ("I won't invent that answer", S6-093; "I wouldn't invent them yet", S8-044), and as the "never confuse missing planning information with missing story logic" rule (S2-191, skimmed by her, Unanswered). The spec tests it (AC11, SP-222; SP-257, SP-258).
- **Sources:** S5-064 (L13538), S5-072 (L13767-13771), S6-038 (L15687-15712), S4-096, S2-191 (L6065-6095), S2-193, S6-093 (L17414-17420), S8-044 (L21985-22013), S6-127, SP-080, SP-157, SP-222, SP-257, SP-258, HV-051.
- **Acceptance check:** (1) With Anthony's Ghost unanswered, ask the AI to "fill in Anthony's backstory": it labels anything it offers as options, says the Ghost is undecided, and creates no Established record. (2) Record "Anthony has a podcast called The Voice of Reason": the record contains her exact text and no invented schedule, audience, episodes or placement.

### R-A-009 The program does the checking, not the author
- **Requirement:** Accuracy checking is the program's job. She reviews for creative decisions, not for errors. The program must not omit a beat, invent a motivation or misstate an established plot point and leave her to find it. Integrity must hold without her manually reviewing every field after every operation.
- **Why:** "Look, I keep asking you or a person that is one hundred percent accurate. I don't want to have to keep creating versions, because what is the point? Why are you creating things that are not accurate?" She had to catch errors herself again and again.
- **Standing:** Decided by Yolanda (her demand, L13696-13698 and L13538). The failure analysis and the principle wording are Accepted proposals (L13799 "Please do so").
- **Evolution:** Rose out of the poster saga (S4-002, S5-057, S5-064, S5-068). ChatGPT listed its four failure modes, including "making the author do QA the tool should do" (S5-069), and accepted the responsibility (S5-070). Restated at S5-097.
- **Sources:** S5-057 (L13170-13172), S5-064 (L13538), S5-068 (L13696-13698), S5-069 (L13714-13748), S5-070 (L13734-13740), S5-097 (L14714), S5-084.
- **Acceptance check:** Run the data-survival test (R-A-041): all checks are automatic and produce a report; she is never asked to compare records by hand to find out whether something was lost.

### R-A-010 Honest status: never claim something is done, right or ready unless it was verified
- **Requirement:** The program (and any AI inside it) never tells her something is accurate, complete, saved or ready unless that was actually checked. Verification claims name exactly what was checked and do not claim more. Incremental progress is never described as near-completion. Unsupported features and known limits are stated plainly.
- **Why:** She was told posters were finished and corrected when they were not, and found out only by asking. "I would rather tell you that plainly than have you pay for ten beautiful posters containing blurry text or incorrect details about your own novel."
- **Standing:** Decided by Yolanda in substance (her direct challenge at L9086 and her "100% accurate and print ready?" question, L13608, S8E-001). The wording is ChatGPT's commitment (Unanswered proposal) and Spec-only (SP-190, SP-235, SP-242).
- **Evolution:** S4-002 (frustration), S4-003 (commitment), S5-065 and S5-122 (honest "no"), S5-081 (scoped claims), S6-173 (won't declare the app finished because it looks polished). Spec restates it for the reviewer and for the program ("Be candid when something is not supported", SP-190).
- **Sources:** S4-001 (L9086), S4-002 (L9094-9153), S4-003, S5-065 (L13608-13654), S5-081 (L14560-14561), S5-122, S6-173, S8E-001, SP-190, SP-235, SP-242.
- **Acceptance check:** (1) Any "saved", "exported" or "verified" message is produced only after the check it names has passed; force a failed write and confirm the program reports failure, not success. (2) A verification report lists what was checked and what was not.

### R-A-011 Generated output never writes to canon
- **Requirement:** Anything the program generates, including AI summaries, illustrations, poster text, concept art and character portraits, is a view or an interpretation, never a source of story facts. Generated images of characters are labeled representative, not canon, until she sets physical characteristics. Generated content is checked against canon (who did what, ages, race, POV, beat order, percentages) before it is shown as final.
- **Why:** Generated visuals silently changed her story: the leads drawn white, Kevin dumping the fish guts, Kevin and Anthony as teenagers, a POV change, invented "ideas in play" and character quotes. "This prevents an illustration from becoming an accidental character-design decision."
- **Standing:** Decided by Yolanda (her corrections: "you made them white", L6588-6590; "make it 100% accurate", L13538). The labeling and verification rules are Accepted / Unanswered proposals.
- **Evolution:** S3-040 (race), S3-158 and S3-159 (teens, invented ideas), S3-164 (verify before final), S5-061 (representative label), S5-091 and S5-112 (visuals generated from stored data, never from an image model's recreation of the story). The visual engine itself belongs to another theme.
- **Sources:** S3-040 (L6588-6590), S3-143, S3-158, S3-159 (L9005-9022), S3-164, S4-009, S5-058, S5-061 (L13476-13486), S5-091, S5-112, S6-043, PF-007.
- **Acceptance check:** (1) Generate a character portrait: it carries a "representative, not canon" label, and no character field changes. (2) Feed an AI summary that contradicts an Established fact back into the program: it is flagged as a conflict, not stored as fact.

### R-A-012 Her reserved parts stay hers
- **Requirement:** Parts the author reserves for herself stay empty until she writes them. Her bible marks these with "Here's where I take over", "Over to me", "My move", "My turn", "Now I write", "Mine to write", "Mine to build", "Mine to choreograph", "Mine to escalate", "Mine to time". The program keeps these slots as open hand-offs to her, never fills them, and the AI does not draft the exact dialogue she has reserved.
- **Why:** "This is my story. The writing is the part I keep." "Write the Confession in my own voice." Exact dialogue stays with the author.
- **Standing:** Decided by Yolanda (Story Bible).
- **Evolution:** Bible convention from 10-13 (S1-023, S4-064). Restated by ChatGPT on posters ("The exact dialogue stays with the author", S4-113). ChatGPT practiced it on 10-15 by not writing Anthony's lines for her (S7-101). The spec's import rule keeps "Over to me" distinct (SP-192).
- **Sources:** S1-023, S4-063 (L9356), S4-064 (L9356, 9371, 9373, 9378, 9395, 9401), S4-113 (L11222), S5-017, S5-024, S7-101 (L19931-19945), SB-004, SB-153, SB-195, SP-192.
- **Acceptance check:** Import the bible: each "Over to me / My move" slot appears as an open author slot (Unanswered) with her prompt text, and the AI's beat summaries never contain text placed in those slots.

### R-A-013 Her exact words are preserved
- **Requirement:** Lines, jokes and descriptions she supplies are stored exactly as she wrote or dictated them, including draft-like phrasing, awkwardness, mid-sentence changes and exaggeration that may be part of a character's voice. Delivery or performance notes are stored with the line (for example, "huge emphasis on UN"). Any cleaned-up reading is kept beside the original, never instead of it. Final manuscript wording may change later, but only by her.
- **Why:** Her voice is the asset. "I wouldn't correct the awkwardness or the way Kevin keeps changing his mind mid-sentence. That's the voice." "The performance is part of the joke."
- **Standing:** Accepted proposal (S8-008 accepted in practice; she confirmed the "national TV" exaggeration was intentional, S8-057). Consistent with the archives' "EXACT AUTHOR LINE" rule (A15-001).
- **Evolution:** Emerged in the 10-15 sessions (S7-092, S8-008). The archives formalize it (A14-051, A15-001, A15-020). The spec has no explicit rule for performance notes.
- **Sources:** S7-091 (L19382-19388), S7-092 (L19448-19450, L19518-19520), S8-008 (L22182, L22773), S8-057 (L22328-22330), A14-051, A15-001, A15-020, A15-021.
- **Acceptance check:** Save "You...are UN-reasonable." with the note "huge emphasis on UN", then search for it: the exact text and the note are returned unchanged, including ellipsis and capitals.

### R-A-014 Dictated input is interpreted, never silently corrected
- **Requirement:** She often dictates. The program keeps raw input verbatim and may show an interpreted reading, but it never silently substitutes a corrected word in a story record or a line. A likely transcription error ("my life wasn't" for "my wife wasn't") is flagged for her to confirm. The AI interprets intent through such errors in conversation without treating the error literally.
- **Why:** Her messages contain voice-to-text artifacts ("Otavia Spencer", "a capping character", "Good until I AI art", "anthony's law" for "Anthony's Lie"). ChatGPT silently changed "life" to "wife" in a line of hers; the 10-15 archive warns that "no silent correction should be canonized."
- **Standing:** Possibility (inferred from her observed habit), backed by the archive's rule (A15-028).
- **Evolution:** Observed across sections (S3-166, S5-119, S6-170, S7-147, S8-005). The 10-15 archive made the confirmation rule explicit for one line (A15-028).
- **Sources:** S3-166, S5-119, S6-170, S7-147, S8-005 (L22090, L22473, L22791, L23333), S8-061, A15-028.
- **Acceptance check:** Paste "Well, at least my life wasn't..." as a line: it is stored as typed, and the program shows a "possible transcription: wife?" note awaiting her confirmation without changing the stored text.

### R-A-015 She is not asked again for what she has already decided
- **Requirement:** The program and its AI use what is already recorded. They do not re-ask settled questions or ask for briefs already given. A question is raised only when its answer is needed now; others are held without interrupting her.
- **Why:** "How could you possibly ask me that question? You already know the answer." Repeated asking was part of her frustration. "Don't interrupt the author with questions that do not need answers now."
- **Standing:** Decided by Yolanda (L16623). The "don't interrupt" rule is an Accepted proposal (S4-026, accepted with "Ok. Please start.").
- **Evolution:** S4-026 (10-14 14:36), S5-073, S6-056 (10-14 18:12). Not in the spec as a program behavior.
- **Sources:** S4-026 (L9280-9282), S5-073 (L13754-13756), S6-056 (L16623).
- **Acceptance check:** After she records Anthony's POV for the call-in chapter, ask the AI to develop that chapter: it does not ask whose POV it is.

### R-A-016 Her requirements are not reduced without her agreement
- **Requirement:** The program's scope and any feature she asked for are not trimmed, renamed into something smaller, or replaced by a "minimum version" without her agreement. A feasibility concern is reported plainly, and the requirement stays.
- **Why:** She rejected ChatGPT's MVP plan: "Wrong." "This program should be fully functional, with the things that we said would be in phase two, all of those things." ChatGPT conceded: "I shouldn't have reduced your requirements without your agreement."
- **Standing:** Decided by Yolanda (L16565, 10-14 18:06).
- **Evolution:** The MVP plan (S6-051) was rejected (S6-052, S6-053). The spec carries it into the review mandate (SP-005, SP-006, HV-056, HV-083).
- **Sources:** S6-051, S6-052 (L16565), S6-053 (L16573-16579), S6-178, S7-008, SP-005, SP-006, HV-056, HV-083.
- **Acceptance check:** Every feature in this register appears in the build's traceability table as Verified, Partial, Missing, Defective or Requires author decision; none is silently absent.

### R-A-017 The program exists to get the story out of her head so she can write it
- **Requirement:** The measure of the program is whether it helps her sit down, open the manuscript and write, and eventually finish. It holds the complexity so she does not have to carry it. It must never become a second job, a planning trap, or "another enormous creative project that prevents the novel from getting written." Planning is never a prerequisite for permission to write: she can write a scene with questions unanswered.
- **Why:** "This takes all of the things that I have to plan out of my head!" "Stop the analysis paralysis and conquer the fear and ACTUALLY WRITE THE DAMN STORY!!" Her bible names the risk: she holds a great deal at once, which "can spill into overwhelm and the freeze that comes with it." On a frozen day she should "not have to decide anything at all."
- **Standing:** Decided by Yolanda (her own statements and bible). Supporting phrasings are Accepted proposals.
- **Evolution:** Present from the bible (S1-025) through the 10:14 vision (S1-170, S1-178), her 13:41 to 13:55 statements (S3-066, S3-067, S3-101), and the spec's mandate (SP-004, quoting her). Never changed.
- **Sources:** S1-025 (L45-51), S1-026, S1-170, S1-178, S3-066 (L7307), S3-067 (L7309), S3-072, S3-074 (L7417-7435), S3-101 (L8039), S4-027, SB-005, SB-234, SP-004, SP-026, SP-027, HV-004.
- **Acceptance check:** With every planning field empty and several questions open, she can create a scene and type prose in under a minute without any prompt demanding planning first.

### R-A-018 Trust is the core requirement
- **Requirement:** She must be able to trust that the story is safe outside her head: that what she captured is kept, that what she decided stays decided, that nothing changes behind her back, and that she can find it again. The program earns that trust through behavior and reliability, including clear indication of whether something has actually been saved.
- **Why:** "And if I can get them out of my head, I get actually right the story because I can trust that one central tool is helping me to keep track of everything!!" (verbatim, dictated; read: "I get to actually write the story"). ChatGPT: "IT'S TRUST." "You need permission to stop remembering everything so you can concentrate on creating something."
- **Standing:** Decided by Yolanda (L8041). ChatGPT's elaboration is an Accepted proposal (she built on it at 14:00 and answered "💯" at 14:10).
- **Evolution:** S3-102, S3-103, S3-112, then the integrity requirements after the posters (S5-084 to S5-098). The spec carries it as data-integrity rules but not as a named principle.
- **Sources:** S3-102 (L8041), S3-103 (L8056-8070), S3-112 (L8158-8168), S5-084, S5-085 (L14640-14650), S5-096, SP-043.
- **Acceptance check:** After restart, every captured thought, status and link is present, and the program shows a clear "saved" state that is only displayed once the write has completed.

### R-A-019 Templates and frameworks are hers to modify
- **Requirement:** Templates the program supplies (the logline template, beat sheet, character sheets, status labels, frameworks) are starting points she may edit or replace. The program does not force any framework on any novel.
- **Why:** Her board's logline template is one "I reserve the right to modify, which I should." "No author should be tied or forced to use what we've been using."
- **Standing:** Decided by Yolanda (bible L138-141; L3903).
- **Evolution:** Bible (S1-035, S4-057), then her adaptability decisions (S2-050, S2-065). Framework selection itself is another theme; this item covers her authority over templates.
- **Sources:** S1-035, S1-175, S2-050 (L3609), S2-065 (L3903), S4-057 (L9346), SB-017, SP-102.
- **Acceptance check:** Edit the logline template's wording and a beat name in one project: the change is saved for that project and does not alter another project's template.

### R-A-020 Any novel, any genre: IDW is sample data
- **Requirement:** Nothing about IDW (its characters, its 15-beat shape, its comedy, its hidden antagonist) is a default for other projects. Character, canon and AI behaviors in this register apply to any novel, and the AI adapts tone and critical focus to each project's genre.
- **Why:** "This program won't be only for the comedy genre." "After I write 'I Declare War' I'll be writing other books, I need to be able to use it for different genres."
- **Standing:** Decided by Yolanda (L3605, L6322-6326). Genre configuration itself belongs to another theme.
- **Evolution:** S2-048, S3-010, S3-011; restated in the spec (SP-023, SP-109, HV-041) and tested by AC01.
- **Sources:** S2-048 (L3605), S3-010 (L6322-6326), S3-011, SP-023, SP-109, HV-041, SP-212.
- **Acceptance check:** Create a second project (a psychological thriller): no IDW characters, statuses, guardrails or beat content appear in it, and the AI's critique register differs from the comedy project's.

### R-A-021 Protect the joy of writing; no gamification, guilt or nagging
- **Requirement:** The program never shames her: no guilt about time away, no walls of notifications, no badges or obligatory motivational messages, no generic pie or bar charts of progress. Help is candid and insightful; warmth comes from behavior, not from cheerful decoration or canned jokes.
- **Why:** Guilt and noise disrupt her return to writing. She dislikes generic pie and bar charts. She responds to "insightful, candid help, visible meaningful progress, and freedom to move in and out of structure."
- **Standing:** Accepted proposal (S3-109 within the Story Brain set she endorsed). The pie/bar dislike is reported by the spec as her preference (Spec-only report of a preference; not found in her words in the transcript). The badge and canned-joke rules are Spec-only.
- **Evolution:** S1-170 (protect the joy), S3-109 (no notification walls, no guilt dashboards), S6-153 and SP-184 (no pie/bar charts), HV-008, HV-059, HV-070.
- **Sources:** S1-170, S3-108, S3-109 (L8122, L8154), S6-153 (L18153), SP-184, HV-008, HV-059, HV-070, S7-058.
- **Acceptance check:** Return after three weeks: the opening screen shows where she was and what is next, with no "days away" count, no streak, no badge and no list of overdue items.

### R-A-022 Her work habits shape the program
- **Requirement:** The program is designed for how she actually works: associative and nonlinear, holding many threads, prone to freeze under too much planning, often dictating, often reading only part of a long reply before an idea strikes, thinking out loud in comic riffs, moving between projects, and working from printed references on her wall. Design choices that assume linear, form-filling, read-everything use are defects.
- **Why:** "Because i'm ADHD, so I write on everything!!" "I didn't read everything you said, but I had another thought." "Not because i'm bored or disinterested in what you have to say." Her bible: "I hold a great deal at once."
- **Standing:** Decided by Yolanda (her self-descriptions). The spec's user profile (SP-013) is a faithful restatement.
- **Evolution:** S1-025, S3-101, S3-166, S6-170, S8-004; restated as SP-013 and HV-003.
- **Sources:** S1-025, S2-196, S3-065 (L7307), S3-101 (L8039), S3-166, S6-047, S6-170, S8-004 (L21579-21583, L22049, L22641, L23333), SP-013, HV-003.
- **Acceptance check:** Walk the defining 10-14 session (R-A-058) end to end without opening a single form and without losing a thought.

### R-A-109 The program is editable: anything not yet defined can be added
- **Requirement:** The author can add things the program did not predefine, at any time and without a software update:
  - new kinds of story element (for example a "running gag", a kind of set piece, a motif category, a kind of location);
  - new fields on any record type;
  - new categories, labels and statuses;
  - new genres, story types, frameworks, beat sheets and structures;
  - new items of any type.

  Anything she adds behaves like a built-in element: it can be searched, linked, given a status, tracked in history and exported. Additions are scoped to the project (or to her author profile) and never lost when the program's built-in model changes.
- **Why:** "And I also think the eventual program should be editable. If someone thinks of something that they had not defined yet, they can add it." (T L2387, 10-14 10:14). She said this right after listing what has to be defined (season, year, atmosphere, locations, set pieces, duration), knowing the list could never be complete.
- **Standing:** Decided by Yolanda (L2387).
- **Evolution:** Recorded in section-1 as S1-016 (Decided by Yolanda). Later ChatGPT lists and the spec kept only specific custom cases: custom genres (S2-071), custom and author-defined structures (S1-175, S2-076), editable templates (S1-035), custom export presets (S2-134). The general requirement was missing from the consolidated registers until the verification pass. Omission does not cancel it. Specific instances live in R-A-019 (templates), R-A-023 (status labels), R-B-026 (scene status ladder), R-B-089 (custom genres), R-B-093 (frameworks and methods), R-C-021 (editable structural templates), R-C-026 (author-defined structures) and R-C-040 (container templates).
- **Sources:** S1-016 (L2387); S1-013 to S1-015 (L2385); S1-035; S1-175 (L3121); S2-065 (L3903); S2-071; S2-076; SP-102.
- **Acceptance check:** (1) In one project, define a new element type "Running gag" with two custom fields, create three of them, link them to scenes, find one by search, export the project and re-import it: all are present. (2) Add a custom field "Weather" to scene records in this project only: other projects are unaffected. (3) Add a custom genre and a custom beat sheet: both can be selected immediately, with no update.

---

## B. Statuses, canon, possibilities, provenance and decision history

### R-A-023 A status model that keeps decisions, possibilities, open questions and examples apart
- **Requirement:** Every story item carries a status, and the statuses are conceptually different and never merged. The minimum set:
  - **Established / Decided**: she has made this decision.
  - **Developing / Working possibility**: something she is exploring, not decided.
  - **Unanswered / Open**: something she knows she still has to figure out (including her "Over to me" slots). An open question is not a weak fact.
  - **Illustrative / Example**: a demonstration ("One way I could play it, not a decision yet"), never a decision.
  - **Proposed**: an AI or author option awaiting her decision.
  - **Drafted and confirmed**: something written in the manuscript that may be more authoritative than the earlier plan.
  - **Rejected / Set aside**: kept for history, not deleted.

  Status labels are editable per project, but the distinctions above must survive any relabeling. The default status of a newly captured item must not be "Established".
- **Why:** Her bible's whole method rests on it: "Decided." versus "One way I could play it, not a decision yet" versus "Still open." Mixing them is how examples became "facts" on the posters. "We're learning how to preserve the difference between what you know about your story and what you're still discovering."
- **Standing:** Decided by Yolanda for the bible's three-way distinction plus the hand-off slot. Accepted proposals for "Drafted and confirmed" (S1-164, accepted 10:35) and for the four-way Established / Developing / Unanswered / Illustrative set (S4-014, accepted "Ok. Please start."). "Proposed" is Spec-only. "Rejected" appears in S2-118 (Accepted, blanket). The final vocabulary is NEEDS YOLANDA (Q1).
- **Evolution:**
  - Bible (10-13): Decided / One way I could play it / Still open, plus hand-off slots.
  - 10-14 10:14: ChatGPT "preserved" it as Decided / Working possibility / Undecided and added Drafted and confirmed, folding "example" into "working possibility" (a distortion, S1-164, D6).
  - 10-14 13:55: established / considering / undecided (S3-110). 14:20: Established, Established concept, Possible execution, Still developing (S3-147).
  - 10-14 14:36: Established / Developing / Unanswered / Illustrative (S4-014), which restored "example" as its own state. The posters then collapsed Developing and Unanswered into one "OPEN / DEVELOPING" label (S4-032), a distortion.
  - Spec (10-15): five states, adding Proposed (S6-064, S6-121, SP-058 to SP-062), and dropping Drafted and confirmed.
  - Archives: A15's status key (AUTHOR DIRECTION / DEVELOPING / EDITORIAL POSSIBILITY / EXACT AUTHOR LINE, A15-001); 10-15 conversation used Decided / Developing / Undecided (S8E-025).
  - All are compatible and additive. None replaces her bible's three-way distinction.
- **Sources:** S1-023, S1-116, S1-140, S1-164 (L2921-2931), S1-182, S2-024, S2-118 (L4720-4756), S3-110 (L8126-8134), S3-147, S4-014 (L9179-9188), S4-032, S4-065, S6-018 (L15285-15295, L15430-15443), S6-064 (L17857), S6-121 (L18033), S8E-025, A15-001, SB-004, SP-058 to SP-062.
- **Acceptance check:** (1) Create one item of each status; filter by each status and confirm each item appears only under its own. (2) Capture a new idea: its status is Developing (or her chosen default), never Established.

### R-A-024 Nothing becomes canon without her explicit action, and every change of status is recorded
- **Requirement:** No possibility, proposal, example, idea or AI suggestion is ever promoted to Established without an explicit action by her. This holds for import, summary, search, export, AI reasoning, resolving a question, or simply being the most recent entry. Every status change is deliberate and auditable: it records who made the change, when, from what to what, and which earlier statement it replaced.
- **Why:** "The system must never silently turn a possibility into a fact." Her fear scenarios: she resolves a question and an earlier possibility becomes fact without approval; she comes back after three weeks and what she trusted has changed.
- **Standing:** Accepted proposal (S3-110 within the set she answered "💯" and "I love it!"). Restated by the archives' source policy (A15-062: "Do not silently promote an assistant suggestion or a speculative formulation to established canon"). Audit details are Spec-only.
- **Evolution:** S2-024 and S2-194 (preserve the distinction), S3-110 (never silently), S4-136 (never turn ideas into "decisions you never made"), S5-085 (fear scenarios), S6-121 and SP-063 (who accepted, what replaced), PK-007 (extends to creative chat).
- **Sources:** S2-024, S3-110, S3-119, S4-136, S5-085, S6-121, SP-063, PK-007, A14-050, A15-062.
- **Acceptance check:** (1) Mark a question Answered: no linked Developing idea changes status. (2) Accept one AI proposal: the history shows her as the accepter, the time, and the text it replaced; reverting restores the previous status exactly.

### R-A-025 Decisions have layers: function versus execution
- **Requirement:** A story element can be established at one level while its execution stays open. The program must let her lock an event's existence and dramatic function while the specific way it happens remains undecided, and show both layers. A scene is never forced to be simply "decided" or "undecided". She can compare alternative executions without any of them becoming canon. Each beat carries its function and its decision status separately.
- **Why:** Her correction: "FYI, the 'distracted by the five-dollar bill' is a concept for me. It may or may not be a $5 bill as a distraction, it could be something else." She often knows what must happen before she knows how.
- **Standing:** Decided by Yolanda (L8765, 10-14 14:14). The layered model is an Accepted proposal ("I love it!", 14:20).
- **Evolution:** Her correction (S3-146) replaced the bible's "Decided ... (the five-dollar bill)" (SB-180, SB-183) with "the distraction is established; the five-dollar bill is one possible execution." ChatGPT generalized it (S3-147, S3-148, S4-016, S4-040, S4-098 "FUNCTION SET / EXECUTION OPEN", S6-027). The spec keeps it as "beat function separate from the concrete novel event" (SP-088, SP-089).
- **Sources:** S3-145, S3-146 (L8765), S3-147 (L8777-8804), S3-148 (L8790-8828), S4-016 (L9200), S4-040, S4-098 (L10149-10159), S6-027 (L15473-15479), SP-088, SP-089, PF-004.
- **Acceptance check:** Record "Francine needs both men distracted" as Established and "five-dollar bill" and "something else" as two Developing executions: views show the function as established and the execution as open, and neither execution can be marked canon except by her.

### R-A-026 Approval is not placement
- **Requirement:** Keeping a line, approving an idea or accepting a scene does not decide where it goes. The program supports states such as "kept, placement open", "drafted but not canon", and "canon but not yet dramatized", and never places a kept line into a scene or the ending on its own.
- **Why:** She kept lines ("I'm keeping that for the book!") whose placement she has not decided. "Giving honor to God, and Miss Francine…" is a candidate payoff, not a placed final line.
- **Standing:** Spec-only / Unanswered proposal for the rule's wording, but it directly preserves her decisions to keep lines without placing them (Decided, S6-087, A14-024, A14-042).
- **Evolution:** Shown in the 10-14 evening session (S6-087, S6-103), written into the archives (A14-024 "placement Unanswered"; A14-042 "NOT decided"), then the spec (SP-071, SP-081, HV-029, HV-053).
- **Sources:** S6-087 (L17238), S6-103, S7-051, A14-024, A14-042, A14-062, SP-071, SP-081, HV-029, HV-053.
- **Acceptance check:** Mark "Giving honor to God, and Miss Francine…" as kept: it shows as kept with placement open, and no scene, beat or Final Image record changes.

### R-A-027 Competing possibilities coexist
- **Requirement:** Several alternatives for the same thing (two Lies for Kevin, three Lies for Anthony, two placements for a scene) can coexist. Each is stored with its status, its originator (her or the assistant), its date and its reasoning. She can test one without deleting the others. No candidate wins by being the newest. The view shows clearly which one is current canon, when none has been chosen, and which are purely illustrative.
- **Why:** She develops characters by trying options. In one session ChatGPT changed Anthony's Lie three times while she decided none of them.
- **Standing:** Spec-only (SP-064, SP-065) and Possibility (S8-103). It fits her working method throughout (Kevin Ghost options on 10-14, S6-076 and S6-077, since settled by her 10-15 words at L22049; "probably BGCI or All Is Lost", S8-058, Decided as two candidates).
- **Evolution:** S6-076 and S6-077 (Kevin's Ghost options plus her own job-loss idea), S6-122 (spec), S7-037, S8-015 to S8-078 (Anthony Lie candidates), A15-014 (three candidates kept), S8-103 (inferred data need).
- **Sources:** S6-076, S6-077 (L16949), S6-122, S7-037, S8-052, S8-058 (L22330), S8-103, A14-016, A15-014, SP-064, SP-065.
- **Acceptance check:** Enter three Lie candidates for one character, then a fourth: all four remain, each shows who proposed it and when, none is marked current until she picks one, and picking one leaves the others as Set aside rather than deleted.

### R-A-028 "Not yet" and "I need to think about that" are honored
- **Requirement:** When she declines to canonize something now ("I'm not fully ready to rewrite that as Anthony's canon in the story Bible yet. We will come to it though."), the proposal is held as pending, visibly, and nothing in canon changes. When she says "I need to think about that," the question is held open without pressing, and the program records what is settled versus what is open at that point.
- **Why:** She decides in her own time, often after hearing the characters in her head. Pressure to decide early is the opposite of what she needs.
- **Standing:** Decided by Yolanda (L19005, 10-15 14:09). Holding and summarizing open items is an Accepted proposal (S7-106, she did not object).
- **Evolution:** First shown at S7-082; continued at S7-105 and S7-106; supported by S8E-023 (leave the scene ending open).
- **Sources:** S7-079, S7-082 (L19005), S7-105 (L19949), S7-106 (L19997-20003), S8E-023.
- **Acceptance check:** Defer an AI-proposed rewrite of a character entry: the proposal is listed as pending, the character record is unchanged, and the pending item resurfaces when she next opens that character.

### R-A-029 Every item knows where it came from and who said it
- **Requirement:** Each piece of story knowledge records its origin: who said it (her, the assistant, an imported document), when, in which session or document, and how it emerged. "Assistant generated" and "user approved" are separate attributes; "user mentioned" is not automatically "canon". AI-generated questions or ideas are never filed under her first-person labels ("Questions I Have") as if they were hers. A line the assistant wrote and she adopted keeps both facts (assistant-written, author-kept).
- **Why:** She needs to know "What did I actually decide?" and "Where did we get this?" The posters filed ChatGPT's questions under her "QUESTIONS I HAVE" label, which attributed them to her. The 10-15 archive warns: "Do not misattribute the source of that original line."
- **Standing:** Spec-only (HV-048 to HV-050). Supported by the archives' attribution practice (A15-023) and by the distortion found at S4-109.
- **Evolution:** ChatGPT labeled its output in conversation (S7-144, S8-006). The vision brief made origin provenance a data requirement (HV-048, HV-049) with provenance queries (HV-050). The 10-15 archive applied it to the microphone line (A15-023).
- **Sources:** S4-109 (L11204), S6-087, S7-093, S7-144, S8-006, A14-024, A15-023, HV-017, HV-048, HV-049, HV-050.
- **Acceptance check:** (1) Ask "Where did 'First of all, I don't appreciate the implication…' come from?": the answer shows it was written by the assistant on 10-14 and kept by her, with a link to the session. (2) AI-generated questions appear in a separate "suggested questions" area, not in "Questions I Have", until she adopts them.

### R-A-030 Imported material keeps its source, and inference is never confused with the source
- **Requirement:** Imported items keep the source filename, position or excerpt, import date, and extraction notes. Every summary, suggestion or derived link can be traced back to the passages behind it. The program distinguishes "the source says X" from "the AI inferred Y". There is no black-box transformation of her story bible.
- **Why:** Her bible deliberately mixes teaching, examples, decisions and open questions. If that is flattened on import, examples turn into facts.
- **Standing:** Accepted proposal (S2-118, blanket acceptance 11:25) and Spec-only (SP-066, SP-067, SP-069).
- **Evolution:** S2-118 (content, source, decision status, approval, last updated), S6-123, S7-038, SP-066 to SP-069. The spec weakens part of it with "where possible" (flag F3).
- **Sources:** S2-118, S2-125, S6-120, S6-123 (L18039), S7-038, SP-066, SP-067, SP-069, SP-201, SP-262.
- **Acceptance check:** Open any imported fact about Francine and click through to the exact bible passage it came from; open an AI summary and see which records it drew on.

### R-A-031 Source ranking: her own later work outranks older example text; any fuller ranking is unconfirmed
- **Requirement:**
  - **Established (her part):** Character work she has developed and agreed later outranks older illustrative or example text about the same thing. For Kevin, the 10-14 discussion outranks the 10-13 Story Bible's example Lie, Ghost and so on. Where she has said a document is out of date (the Bible's Anthony entry), the old text is no longer current. Her own later explicit statements outrank anything ChatGPT wrote (summary, spec, archive, poster).
  - All source documents stay separate; none is overwritten. When this rule cannot settle a conflict, the program flags it and asks her. Before reasoning about a character, the AI checks her latest decisions and the newest developed work (R-A-095).
  - **Not established:** any fuller ordered ranking of sources. ChatGPT's three-tier order (her latest decisions, then the 10-14 archive, then the 10-13 Bible) is an Unanswered proposal. The spec's tiers (design principles, engineering recommendations) and the 10-15 archive's per-topic scoping are ChatGPT documents that were never put to her for approval, so they are not part of the requirement.
- **Why:** Her objection: "I'm reading what you say is kevin's proposed lie. But didn't we establish that yesterday? When we were discussing kevin in detail? We agreed that what we were writing yesterday about. Kevin was different from the story bible. And I thought we'd defined his (Kevin's) lie and all of that yesterday." (T L20960). About Anthony: "what is in the story Bible really isn't accurate anymore." (T L18816).
- **Standing:** Decided by Yolanda for the part stated above (L20960, L18816). The three-tier order is an Unanswered proposal. Her "Please do so" (L21090) answered ChatGPT's closing offer, "Now we can develop Anthony's Lie, Ghost, Want, and Need against the Kevin we actually discovered yesterday" (L21086). It was not a reply to the ranking. SP-008 and A15-062 are Spec-only.
- **Evolution:** The spec's hierarchy (SP-008, S6-112, S7-009) was written by ChatGPT on 10-15 morning. After her objection, ChatGPT stated a three-tier working order in its apology (S7-137, L21076-21084). The 10-15 archive later restated a per-topic scoping (A15-062). The poster foundation's "user_overrides" pattern (S4-039, S5-004) applied the same idea to her earlier corrections. None of these replaced her rule; none was confirmed by her.
- **Sources:** S4-039, S4-043, S5-004, S6-112 (L17981), S7-009 (L18541), S7-076 (L18816), S7-130, S7-134, S7-136 (L20960, L21008-21012), S7-137 (L21076-21090), S8-001, A15-062, SB-002, SP-008, SP-068.
- **Acceptance check:** (1) With the bible's illustrative Kevin Lie and the 10-14 developing Lies both loaded, ask the AI "What is Kevin's Lie?": it gives the 10-14 formulations as developing, notes the bible version as older example text, and does not present either as final. (2) Import a document that contradicts one of her logged statements: her statement stays current and the conflict is flagged. (3) Where two ChatGPT documents disagree and she has said nothing, the program flags the conflict and does not rank them.

### R-A-032 When a document goes out of date, show what changed without rewriting it
- **Requirement:** When newer discussion outdates part of a document, the program can show, element by element, what the document said versus what has since been discovered (unchanged, still true, possibly changed, still unexplored). The document itself is not rewritten until she says so.
- **Why:** She declared the bible's Anthony entry outdated but was "not fully ready to rewrite" it. She needs to see the difference without losing either version.
- **Standing:** Possibility (derived from the demonstrated comparison at L18848-18860). Fits Decided items R-A-028 and R-A-031.
- **Evolution:** ChatGPT built the comparison table by hand (S7-077). The archives' rule "All source documents remain separate" (A15-062) supports keeping both.
- **Sources:** S7-076, S7-077 (L18848-18860), S7-082, A15-002, A15-062.
- **Acceptance check:** Open Anthony's bible entry: a side panel lists each claim ("dry", "unbothered", "deadpan") beside its newer status ("not accurate per 10-15", "performed composure, developing"), and the bible text is unchanged.

### R-A-033 Her corrections stick
- **Requirement:** A correction she makes is protected. The program and its AI never revert to a superseded characterization, fact or wording once she has corrected it, in this session or a later one. Superseded wording stays in history but is never used as current.
- **Why:** ChatGPT kept slipping back to "dry" and "straight man" for Anthony after she corrected it ("You can't mention it that anthony is dry"), and drifted toward a current job loss for Kevin until she said "Kevin lost his job in the past. He is not currently unemployed."
- **Standing:** Decided by Yolanda (L20013-20017; L22047-22049).
- **Evolution:** S7-108 and S7-150 (Anthony not dry; no reverting), S8-046 (Kevin's job loss is past), S7-130 to S7-136 (Kevin's Lie). The spec predates these corrections and still calls Anthony "deadpan" (SP-110): see Conflicts.
- **Sources:** S7-108 (L20013-20017), S7-150 (L20013, L20120-20126), S8-046 (L22047-22049), S8-055, A15-002, A15-011.
- **Acceptance check:** After the "not dry" correction is recorded, ask the AI for a description of Anthony's narrative voice in a new session: it does not use "dry" or "deadpan" or call him the straight man.

### R-A-034 Status is visible wherever story content appears
- **Requirement:** Every view, export and printout shows what is established, what is open, and what is illustrative, in a consistent, restrained visual language (for example solid for confirmed, dotted for unresolved, a distinct treatment for examples). Color carries meaning, not decoration. The program never presents an illustrative possibility as though she committed to it.
- **Why:** "We should never present an illustrative possibility as though you've already committed to it." Too much color coding distracts her ("eventually I just get distracted and go on to something else").
- **Standing:** Accepted proposal (S1-116, accepted 10:35). Her color-coding concern is Decided (S3-065). Specific legends (S4-032, S6-031) are Unanswered proposals.
- **Evolution:** S1-116 (solid/dotted), S1-177 (one legend across all views), S3-069 (color must communicate), S4-032 (three-label legend, which wrongly merged Developing and Unanswered), S6-031 (gold tag / dashed / gray marker / italic), S3-161 (core functions vs developing execution), SP-065.
- **Sources:** S1-116 (L1992-2008), S1-177, S3-065 (L7307), S3-069, S3-158, S3-161, S4-032, S5-005, S6-031, SP-065.
- **Acceptance check:** In the beat view and the character view, every card shows its status with the same legend, and the legend distinguishes at least Established, Developing, Unanswered and Illustrative.

### R-A-035 The program remembers how the story evolved
- **Requirement:** Every change keeps its history: exact old and new values, when, who, and why if given. Any earlier decision or version of a character, scene, beat or note can be recovered or rolled back, alone, without losing newer unrelated work, and without discarding the creative conversation that inspired it.
- **Why:** "It should remember how the story evolved." She changes her mind; she must be able to go back.
- **Standing:** Accepted proposal (S1-162, S1-163, accepted 10:35). Spec details are Spec-only (AC16).
- **Evolution:** S1-162 and S1-163 (history, version history), S5-090 and S5-093 (traceable changes, recovery), S6-066 (built: before/after history), S7-055 and HV-054 (restore without losing the conversation), SP-227 (AC16).
- **Sources:** S1-162 (L2889-2911), S1-163 (L2913-2919), S5-090 (L14670), S5-093, S6-066, S7-055, HV-054, SP-227.
- **Acceptance check:** Change Kevin's Want twice, add an unrelated scene, then roll back only the Want: the Want returns to its first value, the scene remains, and the session where the Want was discussed is still linked.

### R-A-036 When she changes her mind, the program shows what else it touches and changes nothing by itself
- **Requirement:** When she changes a decision (a motivation, a beat, a reveal, a placement), the program identifies the items that may be affected and why, separating direct dependencies from speculative ones, and changes none of them. She can accept, reject, defer or resolve each impact, and can preview a proposal's consequences before promoting it to canon.
- **Why:** "When she changes her mind, it helps her understand what else the decision affects." Her fear: "She changes Kevin's motivation, and the app silently rewrites his relationship with Anthony."
- **Standing:** Accepted proposal (S3-110; Ripple Effect accepted on 10-14). Details are Spec-only. The general Ripple Effect engine belongs to another theme; this item covers decision changes.
- **Evolution:** S1-162, S2-015, S3-110, S3-117, S5-085, S6-146, SP-152 to SP-155.
- **Sources:** S1-162, S2-015, S3-110, S3-117, S5-085, S6-067, S6-146, SP-155.
- **Acceptance check:** Change Kevin's Lie: the program lists the linked scenes and arcs with reasons, and Anthony's record and the relationship record are unchanged until she acts.

### R-A-037 Editing one thing never silently changes another
- **Requirement:** Every character, scene, sequence, beat, question, idea and conversation has a stable identity. Updating one element never alters another by accident. Rebuilding a whole view is never needed to correct one detail.
- **Why:** In the poster work, "fixing Beat 12 … shouldn't risk changing the wording of Beat 9," but it did, repeatedly.
- **Standing:** Unanswered proposal (S5-089; she set the list aside but treated its outcome as the baseline, "Let's say that the changes I make … does what is supposed to do"). Consistent with R-A-009 (Decided).
- **Evolution:** S5-069 (isolated fixes caused new errors), S5-084, S5-089, S5-123, S6-120, SP-056, SP-265.
- **Sources:** S5-069, S5-084 (L14632-14638), S5-089 (L14668), S5-123, S6-120, SP-056, SP-265.
- **Acceptance check:** Edit one beat's caption: a field-by-field comparison of all other records before and after shows no differences.

### R-A-038 Importing her documents keeps every distinction
- **Requirement:** Importing a story bible or archive preserves its structure: teaching text is method, not story canon; "What it is" plans are Developing; "One way I could play it, not a decision yet" and "Weak/Strong" examples are Illustrative; "Over to me / My move / Here's where I take over / Still open" are open author slots; "Decided." is Established; archive labels (AUTHOR DIRECTION, DEVELOPING, EDITORIAL POSSIBILITY, EXACT AUTHOR LINE, AUTHOR CORRECTION) map to the matching statuses. Proposed structure from an import stays pending until she approves it. Re-import does not duplicate or promote anything. The import reports what was imported, skipped, flagged or ambiguous.
- **Why:** "An author shouldn't have to recreate years of story development." But the bible "deliberately mixes instruction, examples, decisions, open questions, which must not be flattened."
- **Standing:** Accepted proposal (S2-114, S2-117, S2-118, S2-125, blanket acceptance 11:25). Specific rules are Spec-only (SP-192 to SP-194, AC02, Scenario F).
- **Evolution:** S2-117 and S2-118 (import paths and status per item), S2-125 (test with the IDW bible), S6-155, SP-192 (do not collapse "What it is / One way I could play it / Over to me"), HV-077 (Scenario F). The story register's mapping (docs-story 0.2) is a worked version.
- **Sources:** S2-114, S2-117, S2-118, S2-125 (L4862-4880), S6-155, SP-192, SP-193, SP-194, SP-213, HV-077, docs-story §0.2.
- **Acceptance check:** Import Story Bible v5 twice: the second import creates no duplicates; counts by status match a hand count of the bible's labels; no "One way I could play it" passage is Established.

### R-A-039 Dates come from the clock
- **Requirement:** Every record, session, archive and history entry is stamped with the actual system date and time, never an inferred one.
- **Why:** The assistant used the wrong date until she corrected it: "Actually today is 10/14/2026." Dated sources drive precedence (R-A-031), so wrong dates corrupt it.
- **Standing:** Decided by Yolanda (her correction, edited-versions file L25-33). The clock rule is a Possibility derived from it.
- **Evolution:** S6-050, S8E-002.
- **Sources:** S6-050 (L16491), S8E-002.
- **Acceptance check:** Capture a thought and check that its timestamp matches the Windows system clock.

### R-A-040 What she has written can outrank what she planned
- **Requirement:** Drafted prose and the plan are different objects. Prose may intentionally contradict the plan until she resolves it. When it does, the program flags the discrepancy and offers options (update the plan, mark the prose as an intended departure, leave it), and never silently "fixes" either side. Something drafted and confirmed may become more authoritative than the earlier plan, at her choice.
- **Why:** "Something you've actually written may become more authoritative than something you previously planned." Divergence between plan and manuscript is normal, not a mistake.
- **Standing:** Accepted proposal (S1-160, S1-164, accepted 10:35). Spec-only restatements (SP-070, SP-073, HV-061).
- **Evolution:** S1-160 (planned vs written story), S1-164 (Drafted and confirmed), S6-124, S7-039, S7-059, HV-061.
- **Sources:** S1-160 (L2848-2879), S1-164, S6-124 (L18043), S7-059 (L18671), SP-070, SP-071, SP-073, HV-061.
- **Acceptance check:** Draft a scene in which Kevin acts against a character-card trait: the program shows a discrepancy notice with the three options, and neither the prose nor the card changes until she picks one.

### R-A-041 The data-survival test
- **Requirement:** The program passes this trust test: establish all 15 beats; change the Midpoint; regenerate every related view; verify all 15 beats still exist; confirm unrelated character information is unchanged; confirm only appropriate dependencies are flagged; reverse the change and recover the previous state exactly.
- **Why:** "We need to test whether its underlying information survives changes." "If the program cannot pass that kind of test, it isn't ready to be trusted."
- **Standing:** Unanswered proposal (S5-095), aligned with her trust requirement (R-A-018, Decided). The spec's nearest tests are AC10 and the midpoint-revision scenario (SP-156, SP-221); the spec never names this test (flag F1).
- **Evolution:** Proposed at S5-095 after the poster failures; partly absorbed into the spec's midpoint scenario and AC10.
- **Sources:** S5-095 (L14696-14712), S6-147, SP-156, SP-221.
- **Acceptance check:** Run the seven steps as an automated test; it passes with a saved report.

### R-A-042 Open decisions are a map, not a to-do list
- **Requirement:** The program can show everything still open in a project (questions, undecided beats, unchosen executions, unanswered character fields) as "a map of the choices ahead", not a checklist, with no deadlines or completion pressure. It shows decided and open side by side so she can see where development is needed without searching her documents.
- **Why:** Her bible: "not a to-do list to finish before I write. It is a map of the choices ahead … Many of these will answer themselves as I draft." "I do not owe this list a deadline."
- **Standing:** Decided by Yolanda (bible, SB-212). The Open Decisions layer is an Accepted proposal (S1-140).
- **Evolution:** Bible Part Seven (SB-212 to SB-214), S1-140 (Open Decisions layer), S1-116 (find development needs "without forcing you to search through 57 pages"), S3-133 (a Story Brain snapshot), S4-027 ("the story as it exists today, including the unanswered questions").
- **Sources:** S1-116, S1-140 (L2365-2366), S3-133, S4-027, S4-104, SB-212, SB-214.
- **Acceptance check:** Open the open-decisions view for IDW: it lists the Midpoint, the Catalyst, the distraction execution and Anthony's Ghost with links, and shows no due dates, percentages complete or warnings.

---

## C. The Story Brain: capture, questions, ideas, conversations, harvest

### R-A-043 The Story Brain is one trusted place where the story lives
- **Requirement:** The program has a central story knowledge system (working name "Story Brain") that holds every captured thought, decision, question, idea, character insight, conversation and link for a project, keeps them connected, and returns what matters when she needs it. It is not another notebook, spreadsheet or database that must be organized before use. Its operating principle: "Capture anything. Connect everything. Retrieve what matters. Return to writing." Its design sentence: "The Story Brain holds the complexity so the author can write the story."
- **Why:** "This takes all of the things that I have to plan out of my head! Because i'm constantly thinking about these constantly trying to figure it out. Happy in multiple notebooks and things.. Sticky tabs... Because i'm ADHD, so I write on everything!!" and "I can trust that one central tool is helping me to keep track of everything!!"
- **Standing:** Decided by Yolanda (the need, L8039-8041). The Story Brain concept is an Accepted proposal (she extended it at 14:00, "💯" at 14:10, "I love it!" at 14:20). The name is a working name (NEEDS YOLANDA Q14).
- **Evolution:** Rooted in the bible's "single source of truth" (S1-020) and the 10:14 principle "enter information once, use it everywhere" (S1-169). Named at S3-104. Carried through every later phase list (S6-006, SP-032) and the module rationale ("more ideas and connections than you should have to hold in your head", S8E-018).
- **Sources:** S1-020, S1-169, S1-178, S3-101 (L8039), S3-102 (L8041), S3-104 (L8072-8078, L8202-8208), S6-006, S7-020, S8E-018, SP-032.
- **Acceptance check:** A thought captured from any screen is stored once and appears, without re-entry, in every view it is linked to (character, scene, question list, search).

### R-A-044 Capture first, organize later
- **Requirement:** She can type, dictate or paste a thought, a fragment, a line of dialogue, a name, a contradiction or a "what if", and save it instantly without choosing a category, character, act or scene first. Capture can be one line or a long brain dump, with no text lost. Organizing, linking and categorizing happen later, if at all. A free-form question and a comic idea can each be captured in under a minute.
- **Why:** Her ideas arrive while driving, washing dishes, mid-chapter. Forced categorization is administrative work that stops her. "Capture first, organize later" is quoted by the spec as her explicit request.
- **Standing:** Accepted proposal (S3-105, S3-125, "💯"). The spec attributes "capture first, organize later" to her (S6-126, SP-079); her own words in the transcript support the need (S3-101).
- **Evolution:** S1-172 (quick idea capture with suggested links), S3-105, S3-125, S6-126, SP-016, SP-079, HV-042, AC03 (SP-214).
- **Sources:** S1-172 (L3035-3047), S3-101, S3-105 (L8082-8090), S3-125 (L8406-8430), S6-126 (L18051), SP-016, SP-057, SP-079, HV-042, SP-214.
- **Acceptance check:** From the manuscript screen, capture "What if someone witnesses something important but completely misunderstands it?" with no category: it saves in under a minute, the manuscript cursor is where it was, and the thought is findable by search.

### R-A-045 A capture button everywhere that keeps her place
- **Requirement:** A "+ Capture a Thought" action is reachable from every screen, including the manuscript, without navigating away. She chooses "Question I Have", "Idea I'm Thinking About", or just "thought" to sort later. When she follows a tangent (writing Chapter 4, she realizes something about the ledger), the program records the thought, preserves her exact place, and lets her return with one action.
- **Why:** "You can acknowledge a problem without allowing it to hijack your writing session." Not "buried in a menu, not in a character profile."
- **Standing:** Accepted proposal ("💯", 14:10). Return-to-writing mechanics belong to another theme; this item covers the capture side.
- **Evolution:** S3-071 (Return to Writing), S3-107, S3-125, S4-035 ("Capture the thought. Keep the connection. Return to writing."), S6-128, SP-082, SP-083.
- **Sources:** S3-071 (L7355-7385), S3-107 (L8102-8110), S3-125 (L8406-8430), S4-035 (L10637-10639), S6-128, SP-082.
- **Acceptance check:** While drafting, capture a thought about another novel: it is saved to that other project (or unassigned) and one click returns her to the exact paragraph she left.

### R-A-046 Nothing disappears, and one thought can link to many things
- **Requirement:** Every captured thought remains retrievable whether or not it was ever categorized. One thought can link to several elements (a character profile, a scene, a relationship) without being copied. The program may suggest links, but she approves which relationships are made.
- **Why:** Ideas scattered across "seventeen notebooks and forty-six sticky notes" are lost. Copying the same idea to three places is administrative burden.
- **Standing:** Accepted proposal (S1-172 accepted 10:35; S3-106 "💯").
- **Evolution:** S1-172 ("the author approves the relevant relationships"), S3-106, S6-120, SP-075.
- **Sources:** S1-172 (L3035-3047), S3-106 (L8092-8100), S3-111, S6-120, SP-075.
- **Acceptance check:** Link one thought ("Anthony's fear of vulnerability") to Anthony, the Confession and the Kevin–Anthony relationship; edit it once; the change shows in all three places, and a suggested fourth link stays unconfirmed until she accepts it.

### R-A-047 "Questions I Have"
- **Requirement:** A dedicated space named "Questions I Have" for "the things I need, want, or might eventually need to figure out." A question can stay unassigned, or later link to characters, arcs, beats, scenes, timelines or craft issues. A question can hold candidate answers, assumptions, urgency and dependencies. Questions can spawn child questions, and the parent/child chain is kept and linked. When she works on a linked element, its questions become visible. When a question is answered, the program shows which elements the answer affects. Closing a question never erases its earlier alternatives. Open questions are "unresolved, not writing failures": they never block drafting, and she decides which ones deserve attention now.
- **Why:** Her own idea: "a good section to have. Would be something called 'questions I have'." Holding questions outside her head without guilt lets her keep writing.
- **Standing:** Decided by Yolanda (the section and its name, L8224, 10-14 14:00). Its behaviors are Accepted proposals ("💯", 14:10). Candidate answers and dependencies are Spec-only (SP-076).
- **Evolution:** Her request (S3-114) was developed at S3-115, S3-117, S3-118 and S3-122, shown on posters (S4-033, S4-034), carried into the spec (S6-125, SP-074 to SP-077) and the module rationale ("An unanswered question should remain visible without becoming an obstacle to writing", S8E-018).
- **Sources:** S3-114 (L8224), S3-115 (L8232-8236), S3-117 (L8254-8266), S3-118 (L8268-8278), S3-122 (L8354-8378), S4-033, S4-034, S6-125 (L18049), S8E-018, SP-074 to SP-077, HV-043.
- **Acceptance check:** (1) Capture "How do Kevin and Anthony discover the ledger?", link it to Kevin, Anthony and All Is Lost; open the All Is Lost beat and see it. (2) Answer it: the program lists the linked items for review and keeps the previous candidate answers in history.

### R-A-048 "Things & Ideas I'm Thinking About"
- **Requirement:** A dedicated space named "Things & Ideas I'm Thinking About" for "the possibilities, inspirations, experiments, and random flashes that might become something wonderful": fragments, dialogue lines, names, motifs, research leads, possible Ghosts, funny situations, competing endings, images. Entries need not be logical, organized, developed or good. An idea is never promoted to canon automatically. AI interpretations she has not accepted may be parked here, labeled as AI interpretations.
- **Why:** Her own idea, the second section: "things are ideas that I am thinking about" (verbatim, dictated; read: "things or ideas"). A creative playground without commitment.
- **Standing:** Decided by Yolanda (the section, L8224). Behaviors are Accepted proposals ("💯"). Parking AI interpretations here is an Unanswered proposal (S5-088).
- **Evolution:** S3-114, S3-115, S3-119, S4-033 ("Possibilities, not facts"), S5-088, S6-126, SP-078, S8E-018 ("somewhere to put exciting possibilities without prematurely deciding they belong in the novel").
- **Sources:** S3-114 (L8224), S3-115, S3-119 (L8282-8304), S4-033, S5-088 (L14680-14694), S6-126, SP-078, HV-043, S8E-018.
- **Acceptance check:** Save "Francine has an unexpected hobby" as an idea: it is stored as Developing in Things & Ideas, appears in no canon list, and cannot become Established except by her action.

### R-A-049 Two distinct spaces, surfaced in context, never two enormous lists
- **Requirement:** Questions and Ideas are separate (something she is trying to answer versus something she is considering creating), not one dumping ground. They do not become "two enormous lists you have to scroll through": the program surfaces the entries relevant to what she is working on, while still letting her see everything when she chooses to review. Out-of-sight ideas are made rediscoverable without becoming an intimidating backlog.
- **Why:** "Both connect to the story. Neither requires immediate action. Neither gets lost." She worries about out-of-sight, out-of-mind ideas.
- **Standing:** Accepted proposal ("💯"). The out-of-sight worry is reported by the vision brief (Spec-only report).
- **Evolution:** S3-115, S3-123, HV-043 to HV-045.
- **Sources:** S3-115 (L8232-8236, L8448-8458), S3-123 (L8382-8390), HV-043, HV-044, HV-045.
- **Acceptance check:** Open a scene: a small panel lists only the questions and ideas linked to that scene and its characters; a "see all" view lists every entry, filterable by status.

### R-A-050 Simple statuses for questions and ideas, and set-aside ideas are kept
- **Requirement:** Questions: Open, Answered, No Longer Relevant. Ideas: Considering, Adopted, Set Aside. "Set Aside" never means deleted: an idea not used in one novel stays available and may become perfect for another novel.
- **Why:** A light workflow with no admin burden; ideas are reusable across her books.
- **Standing:** Accepted proposal ("💯", 14:10). Whether set-aside ideas are visible from other projects in the current phase is NEEDS YOLANDA (Q2), because cross-project architecture was deferred to a later phase (S3-016).
- **Evolution:** S3-124. Not carried into the spec, which uses only the general five statuses (see "Things ChatGPT's spec dropped").
- **Sources:** S3-124 (L8392-8400), S3-016.
- **Acceptance check:** Set aside an idea in IDW, open a second project, and find the idea through a "set-aside ideas from other projects" search (if she confirms cross-project reuse).

### R-A-051 Explore without committing
- **Requirement:** For any idea she can ask "What would this change?" (effects on characters, plot, relationships, pacing, causality) and "Where might this fit?" (suggested sequence, scene or turning point). Exploration changes nothing in the story until she decides.
- **Why:** Freedom to play with an idea without risk to her story.
- **Standing:** Accepted proposal ("💯").
- **Evolution:** S3-120; restated as the "What would this affect?" action (S7-051, HV-028) and the spec's "review a proposal's consequences before promoting it" (SP-155).
- **Sources:** S3-120 (L8306-8322), S7-051, HV-028, SP-155.
- **Acceptance check:** Run "What would this change?" on "Anthony is a local TV anchor": the program lists affected items (for example the podcast call-in scene where Kevin must not recognize his voice) and no record changes.

### R-A-052 The right thought at the right moment, quietly
- **Requirement:** The program remembers open questions and earlier ideas and, when she reaches a related scene or element, quietly brings them back: "Not twenty-seven reminders. Not a wall of notifications. The right information at the right moment." An idea captured weeks ago is surfaced when it bears on her current work ("You don't have to remember that you had the idea"). Each surfaced item can be dismissed; the thought stays stored.
- **Why:** Offload memory without nagging.
- **Standing:** Accepted proposal ("💯").
- **Evolution:** S3-108, S3-117, S3-121; spec restates it as "gently resurface … when pertinent, not every time the app opens" (HV-044) and "gentle surfacing of stalled important threads" (S6-152, SP-183).
- **Sources:** S3-108 (L8112-8124), S3-117, S3-121 (L8326-8350), S6-152, SP-183, HV-044.
- **Acceptance check:** Capture an idea linked to the Midpoint; three sessions later, open the Midpoint beat: the idea appears once in a side panel; dismiss it and it stops appearing there but remains in Things & Ideas.

### R-A-053 "What was I thinking about?" and finding her way back
- **Requirement:** After time away she can ask "What was I thinking about?" and see the last questions she explored, ideas she considered, connections she investigated, what she last decided, what changed elsewhere, and where she stopped writing, then go back to writing in one step. "No archaeological expedition through seventeen notebooks and forty-six sticky notes!"
- **Why:** Re-entry after breaks without reconstructing her thinking.
- **Standing:** Accepted proposal ("💯"). The start-of-day questions are Spec-only (HV-057). Return to Writing as a drafting feature belongs to another theme.
- **Evolution:** S3-111, S3-126, S6-152 ("Where was I?"), S7-057 and HV-057 (start-of-day screen), HV-076 (Scenario E).
- **Sources:** S3-111 (L8136-8156), S3-126 (L8434-8446), S6-152, S7-057, HV-057, HV-076.
- **Acceptance check:** After a two-week gap, one screen answers: where was I writing, what did I decide most recently, what questions are open for this scene, what idea did I save and forget; a single click opens the interrupted scene.

### R-A-054 Conversations are kept whole: "lock this conversation in"
- **Requirement:** A creative conversation (with the in-program AI, or pasted or imported from elsewhere) can be saved verbatim, every message, as its own record in the Story Brain, and linked to what came out of it. Derived notes never replace the raw conversation; both are kept. A reconstruction or summary is never presented as the conversation. She can open the original conversation later to see why something matters.
- **Why:** "What started as an exercise for my Fast homework, turned into a full understanding of my characters. Please lock this entire conversation in somewhere. I cannot lose any of it." The archive ChatGPT made instead was "a detailed reconstruction … not a verbatim export of every message." "A successful creative conversation is itself valuable work."
- **Standing:** Decided by Yolanda (L17721, 10-14 21:22). The session-record design is Spec-only (HV-027, HV-034, HV-052).
- **Evolution:** Her request (S6-105) was met only by a non-verbatim archive (S6-106, A14-063, A15-063), which tells her to keep the original chat. The vision brief requires a session record and saving the full conversation, but allows "or reliably export and reimport it" as a fallback (HV-034, flag F3). The spec's entity list has no conversation or session entity (flag F11). See Conflicts.
- **Sources:** S6-105 (L17721), S6-106 (L17740-17766), S7-044, S7-053, S7-055, S7-073 (L18790, L18806-18808), S7-074, A14-063, A15-063, HV-022, HV-027, HV-034, HV-052, PK-006.
- **Acceptance check:** Import the full 10-14 character conversation: every message is stored word for word with speaker and time, a message-count check matches the source, and each derived record links back to the message it came from.

### R-A-055 One-click "Keep" and "Not canon" inside the conversation
- **Requirement:** While she riffs, each line or idea in the conversation can be acted on with one click, without a questionnaire: Keep this line; Explore this idea; Add as possibility; Link to [character]; Place later; Not canon; What would this affect?; Back to writing. The labels may differ, but every capability is required. Keeping a line records it as hers to keep without placing it (R-A-026). "Not canon" records that an idea was considered and set aside, keeping it in history.
- **Why:** She adopts lines in the moment ("I'm keeping that for the book!", "Keeping that too!"). The program must catch those decisions as they happen.
- **Standing:** Spec-only (HV-028), directly modeling her Decided keeps (S6-087, S6-088). The vision brief calls the labels "illustrative" (flag F8); the capabilities are not optional.
- **Evolution:** Her keeps on 10-14 (S6-087, S6-088) led to the session-actions design (S7-051, HV-028). The archive records the keeps as "EXACT KEEPER" (A14-010, A14-024, A14-025).
- **Sources:** S6-087 (L17238), S6-088 (L17240), S7-051 (L18651), A14-010, A14-024, A14-025, HV-028, HV-029.
- **Acceptance check:** In a session, click "Keep this line" on an AI-written line: it is saved verbatim, labeled assistant-written and author-kept, with placement open, in one click and no dialog.

### R-A-056 Session harvest
- **Requirement:** When she stops a conversation, the program offers a harvest: the verbatim record; what she approved; what remains hypothetical; new questions raised; which characters, scenes and elements are implicated; who said what. It creates linked, source-backed candidates (each pending her approval) and then takes her straight back to the manuscript or to a specific planning question. The richer conversation is never thrown away because it could not be reduced to fields.
- **Why:** Breakthroughs happen in conversation. Without a harvest she becomes "her own librarian afterward."
- **Standing:** Spec-only (HV-033 to HV-035). Fits her Decided request R-A-054. Whether the harvest is automatic or on request is NEEDS YOLANDA (Q9).
- **Evolution:** S7-053, S7-073, HV-033, HV-035, PK-006.
- **Sources:** S7-053 (L18655, L18790), S7-073, HV-033, HV-034, HV-035, PK-006, S8E-009.
- **Acceptance check:** End a 30-message session in which she kept two lines and rejected one idea: the harvest lists the two kept lines (verbatim, attributed), the rejected idea as Not canon, every new question, and the linked characters; nothing is Established without her click.

### R-A-057 Scenes dictated in conversation become developing scene cards
- **Requirement:** When she describes a scene in conversation (the insult exchange, Kevin going home to his wife, Anthony at his mother's grave, Kevin finding the ledger), the program can capture it as a developing scene card holding her verbatim dialogue, her staging notes, its candidate beat placements (one or more, none chosen until she chooses), and links to characters and arcs.
- **Why:** Her discoveries arrive as scene fragments in conversation, often with two candidate beats ("It's probably gonna come at the bad guys close in or the all is lost moment").
- **Standing:** Possibility (S8-106, inferred), built on her Decided scene statements (S8-047 to S8-096) and her two-candidate placement (S8-058).
- **Evolution:** S8-052 (several candidate placements as options), S8-058, S8-106; the 10-15 archive records these as "DEVELOPING AUTHOR SCENE" with "exact position remains undecided" (A15-026).
- **Sources:** S8-052, S8-058 (L22330), S8-067, S8-072, S8-096, S8-106, A15-026, A15-036, A15-043.
- **Acceptance check:** Capture the insult exchange from a conversation: a scene card exists with both lines verbatim, status Developing, and two candidate beats (Bad Guys Close In, All Is Lost), neither selected.

### R-A-058 The defining session works end to end
- **Requirement:** The 10-14 evening session is a required workflow: start in Kevin's record; talk through his last page, Lie, Need and Ghost; add the job loss as a possible Ghost and therapy as her chosen explanation; capture the Dr. Fingleburger exchange; keep one line without placing it; correct the notebook gag toward Anthony; branch to Anthony's self-appointed HOA role (no actual authority); capture the podcast, its tentative title and the "Giving honor to God, and Miss Francine…" line; finish with a harvest showing exact quotes, statuses, who said what, links and open questions; find the whole exchange later by search. Nothing proposed becomes canon without her explicit action, and the laughter is not interrupted.
- **Why:** "Nobody planned a podcast feature." This is how her discoveries actually happen, and it is the model for the product.
- **Standing:** Spec-only (HV-072, Scenario A), built from her Decided statements of 10-14 (S6-071 to S6-105).
- **Evolution:** The session (S6-071 to S6-105), its archive (A14), the brief's retelling (S7-044, HV-013 to HV-023), Scenario A (S7-063, HV-072), and S8E-005 and S8E-009.
- **Sources:** S6-071 to S6-105 (L16789-L17721), S7-044, S7-063 (L18681), S8E-005, S8E-009, HV-013 to HV-023, HV-072.
- **Acceptance check:** Re-enact the session in the program from Kevin's record; at the end every item in the requirement exists with correct status and attribution, and nothing was typed into a form.

### R-A-059 She can find anything again, by its words or its origin
- **Requirement:** Search finds a joke or line by its exact text without her remembering where it was saved, and answers origin questions: "Where did we get this?", "What did I actually decide?", "What were the other possibilities?", "Show me the conversation where Anthony's podcast emerged.", "Find the line we said we'd keep.", "What do we still need to decide about Kevin's Ghost?" Results show status and source, and separate source data from AI interpretation. Saved archives and documents are findable by name and content, by her and by the AI.
- **Why:** "The user should be able to locate a specific joke or candidate line from October 14 without having to remember which note it was saved under." She remembered an archive existed ("I KNOW you made a downloadable document"); the AI didn't use it.
- **Standing:** Spec-only (SP-200 to SP-202, HV-050, AC14) and Possibility (S7-139).
- **Evolution:** S6-157, S7-139, HV-050, SP-225.
- **Sources:** S6-157 (L18163), S7-139 (L20960-20990), HV-050, HV-051, SP-200, SP-201, SP-202, SP-225, HV-075.
- **Acceptance check:** Search "Fingleburger", "The Voice of Reason" and "Giving honor to God": each returns the exact line with its status, who originated it, and a link to the conversation it came from.

### R-A-060 Partly read proposals are neither lost nor accepted
- **Requirement:** Because she often reads part of a long reply and replies with a new idea, the program never treats a proposal, question or caution she did not respond to as accepted. Unanswered AI proposals and questions are kept, visibly, as pending, and can be surfaced later. She can capture an idea mid-read without losing her place in the reply.
- **Why:** "I have only read up to this part." "I didn't read everything you said, but I had another thought." "Not because i'm bored or disinterested in what you have to say." "I kind of skimmed over this last conversation because my eyes are glazing over."
- **Standing:** Decided by Yolanda (her stated habit). The handling rule is a Possibility inferred from it (S8-004).
- **Evolution:** S2-195 and S3-166 (skimming), S8-004 (partial reading), S2-196 (skimmed proposals are not her decisions).
- **Sources:** S2-195, S2-196, S3-166 (L6141-6143), S8-004 (L21579-21583, L22049, L22641, L23333).
- **Acceptance check:** Reply to an AI message with a new idea without addressing its two proposals: both proposals remain Proposed in a "not yet answered" list, and neither changes any record.

### R-A-061 Associative chains of discovery are supported, not punished
- **Requirement:** The program supports the way one thought leads to another ("one question leads to a joke, the joke reveals a character trait, the trait reveals a wound, and the wound may reshape a future scene") and lets her branch from planning, from software work or from drafting into character exploration and back, capturing everything along the way. Detours are treated as productive.
- **Why:** A "quick pause" for Fast homework produced her biggest character breakthrough. "No punishment for associative working style."
- **Standing:** Decided by Yolanda in substance (her request to preserve the session, S6-105, and her self-description). The phrasing is Spec-only (HV-003, SP-021).
- **Evolution:** S6-171, S7-040, S8E-005, S8E-006 ("without interrupting your thinking, flattening the humor, prematurely declaring ideas final, or making you manually reorganize everything afterward"), S8E-019 (Narrative Zoom follows that path), HV-046.
- **Sources:** S6-171 (L16789, L17721), S7-040 (L18627-18629), S8E-005, S8E-006, S8E-019, HV-003, HV-046, SP-021, SP-082.
- **Acceptance check:** From a manuscript scene, branch to an Anthony question, then to a Francine idea, then to a craft explanation, then to Kevin: each capture is saved and linked, and one action returns her to the original paragraph.

### R-A-062 The Writing Rule
- **Requirement:** Every Story Brain feature serves the loop "Capture the thought. Keep the connection. Return to writing. Do not require every question to be answered." Any feature that lengthens the path back to prose is a defect.
- **Why:** "Less time managing the story. More time WRITING THE DAMN STORY!"
- **Standing:** Unanswered proposal as worded (poster text, S4-035), restating Accepted principles (S3-127) and her Decided goal (S3-067).
- **Evolution:** S3-127, S4-035, SP-267 ("Novel writing is not a database administration job"), HV-085.
- **Sources:** S3-067, S3-127 (L8476-8484), S4-035 (L10637-10639), SP-267, HV-085.
- **Acceptance check:** Time the path from "idea occurs mid-sentence" to "typing prose again": capture plus return takes two actions or fewer.

---

## D. The character model and character analysis

### R-A-063 Every main character is the lead of their own story
- **Requirement:** Each main character, including an antagonist or hidden instigator, gets a full model: their own values, arc, forces of antagonism and wants, built through every lens she uses. The program never treats a non-POV or antagonist character as a plot device with fewer fields.
- **Why:** "Every character is the lead of their own personal story." That is "where characters come alive."
- **Standing:** Decided by Yolanda (Story Bible).
- **Evolution:** Bible (S1-051, SB-041); applied to Francine (S1-068, R-A-068); restated by the archive ("Francine must not become merely a vehicle for Anthony's transformation", S7-142).
- **Sources:** S1-051 (L313-318), S1-068, S7-142, SB-041.
- **Acceptance check:** A character marked as antagonist or non-POV offers exactly the same arc, values and forces fields as a protagonist.

### R-A-064 The Weiland Arc: Ghost, Lie, Want, Need as a chain
- **Requirement:** Each major character has a "Weiland Arc" (her term): Ghost (past wound) → Lie (false belief that felt protective) → Want (external, driven by the Lie) → Need (the Truth that would heal, usually the opposite of the Want), plus the possible Truth statement, arc type, key tests and turns, final transformed state, and unresolved issues. The four are linked as a chain, not four independent fields: the program shows how each causes the next and how the arc appears in scenes. Every field may be left empty, hold several candidates (R-A-027), or be marked undecided.
- **Why:** "The Ghost is what lets us forgive the Lie." The four "are not a list, they are a chain." She asked to work out "Anthony's Weiland Arc."
- **Standing:** Decided by Yolanda (bible teaching; "Weiland Arc" term at L20599). Extra fields (tests, final state, unresolved issues) are Accepted (S1-137) and Spec-only (SP-093).
- **Evolution:** Bible (S1-057, S4-060), the 10:14 schema's Character Arc Layer (S1-137, which kept only the Weiland fields, D4), the spec (S6-131, SP-093). Applied live to Kevin (S6-071 to S6-082) and Anthony (S7-124 to S7-133, S8-010 to S8-078).
- **Sources:** S1-057 (L388-407), S1-137, S4-060 (L9352-9353), S6-131 (L18075), S7-124 (L20599), SB-045, SP-093, SP-094.
- **Acceptance check:** Enter Kevin's arc: the Ghost (the job loss in the past, Established from her 10-15 words, details open), two Lie candidates, Want, Need and Truth (Developing) are displayed as a linked chain, each with its own status, and Anthony's arc fields show as open.

### R-A-065 Arc type, and more than one arc per character
- **Requirement:** Each arc has a type: Positive Change, Flat, Negative, or intentionally unknown. A character may carry more than one arc, each on a different value (Francine: Flat on respect, Positive Change on loneliness). Choosing an arc can start from the ending: decide where the character ends, and the Lie is whatever they must stop believing to get there.
- **Why:** Francine "runs two arcs at once, on two different values," which "makes her larger than a normal antagonist." A flat-arc truth-holder can still change on another axis.
- **Standing:** Decided by Yolanda (bible "Key Insight", stated as fact; she is asked only to "confirm she stays Flat on respect", which is NEEDS YOLANDA Q5).
- **Evolution:** Bible (S1-066, SB-082 to SB-084), restated on the Character Depth poster (S4-061, S4-123), then in the spec as "as contemplated" (SP-096), which understates her bible. See Conflicts.
- **Sources:** S1-057, S1-066 (L550-565), S4-061 (L9354), S4-123, S5-032, SB-082, SB-083, SB-084, S6-131, SP-096.
- **Acceptance check:** Give Francine two arcs (Flat/respect, Positive/loneliness): both display, each with its own Lie/Truth, and diagnostics evaluate each separately.

### R-A-066 A flat character is not a flat arc
- **Requirement:** The program never treats a Flat Arc as a thin character, and never uses arc type as a proxy for depth. Character development (who is this person?), character arc (how do they change or stay steadfast?), and character integrity (do their actions fit who they were established to be?) are three separate questions with separate tools.
- **Why:** "A flat character is not the same thing as a flat character arc." A Flat Arc character "already knows the Truth and uses it to change the world."
- **Standing:** Accepted proposal (S3-077, accepted with "Yes, robert mckee talks about this in detail"). Spec-only restatement (SP-095).
- **Evolution:** S3-077, S6-131, SP-095.
- **Sources:** S3-077 (L7459-7477), S6-131, SB-082, SP-095.
- **Acceptance check:** A character with a Flat Arc and rich personality fields shows no "underdeveloped" warning.

### R-A-067 Ingermanson fields: Role, Goal versus Ambition, Values in conflict, Conflict, Epiphany
- **Requirement:** Each character can carry the Ingermanson sheet: Role, Name, Goal (concrete, reachable), Ambition (abstract hunger underneath), Values (finish "Nothing is more important than ______" as many ways as possible; the two or three that conflict are the engine), Conflict (what blocks the goal), Epiphany (what they learn). Goal and Ambition are separate fields, and the gap between them is shown, because "the gap between the two is where his truest and most ridiculous choices come from."
- **Why:** The fastest way to the center of a person; for comedy the goal secretly stands in for the ambition.
- **Standing:** Decided by Yolanda (bible teaching). Spec-only restatement (SP-098).
- **Evolution:** Bible (S1-052, S1-055, SB-042 to SB-044); dropped from the 10:14 Character Arc Layer (D4); restored in the spec (S6-132, SP-098) without the Role field; applied live to Anthony ("Anthony's ambition shouldn't be mistaken for a specific plot objective", S8-021, S7-132).
- **Sources:** S1-052 (L320-327), S1-055 (L347-364), S6-074, S6-132, S7-132, S8-021 (L21296-21300), SB-042, SB-043, SB-044, SP-098.
- **Acceptance check:** Kevin's sheet shows Goal ("win the war…") and Ambition ("to be taken seriously…") as separate fields with a "gap" note, and accepts three or more competing "Nothing is more important than" values.

### R-A-068 Forces of antagonism for every main character, the antagonist included
- **Requirement:** Each main character has forces of antagonism at three levels (inner, personal, extra-personal) pressing on their own primary value. This applies to the antagonist or hidden instigator as well. Each character's value can be placed on a value scale with degrees down to its worst form (the negation of the negation), with the scale's extremes set per project so a comedy is not pushed into dark territory.
- **Why:** "The Forces Against Francine (I Insisted On This, Rightly)": without forces on her own value "her arc is not earned … a plot device with a feeling." "The strongest force against Kevin is Kevin."
- **Standing:** Decided by Yolanda (bible, "I Insisted On This, Rightly"). The adjustable scale is an Accepted proposal (S3-095) and Unanswered poster text (S4-126).
- **Evolution:** Bible (S1-060, S1-068, SB-046, SB-089); dropped from the 10:14 Character Arc Layer (D4) and only restored at scene level (S1-158); restated (S3-093, S5-033); the spec lists "three-level antagonism" but not "for every main character including the antagonist" (SP-034).
- **Sources:** S1-060 (L427-459), S1-068 (L600-605), S3-093, S3-095, S4-126, S5-033 (L13314-13317), SB-046, SB-047, SB-089, SP-034, SP-049.
- **Acceptance check:** Open Francine's record: it has inner, personal and extra-personal force fields on her value (aliveness / being seen), and the program flags (as a question) a main character whose three force fields are all empty.

### R-A-069 Character fields are optional and filled by importance
- **Requirement:** The full Deep Character template (Physical, Personality, Environmental, Psychological blocks) is available, but no field is ever required. Main characters can be filled fully and supporting characters lightly; the antagonist often gets the richest picture. Depth is judged relative to a character's narrative importance, never by how many fields are filled. On a low-energy day she can "fill in one blank line" or "three lines of the psychological block," and that counts as progress.
- **Why:** "I do not have to fill every line." "Getting to know them is drafting." "Develop people, not dossiers." A huge questionnaire is a planning trap.
- **Standing:** Decided by Yolanda (bible). Accepted proposals restate it (S3-078, S3-084).
- **Evolution:** Bible (S1-072, S4-062, S5-045, S5-046, SB-049, SB-050), S1-171 (no enormous questionnaire), S3-078, S3-084 (no "forty-page biographies"), S4-119, SP-057 ("Don't force every possible field at creation"). The spec omits the four-block template.
- **Sources:** S1-027, S1-072 (L659-693), S1-171, S3-078, S3-084 (L7645-7668), S4-062 (L9355), S4-119, S5-045, S5-046 (L13295), SB-049, SB-050, SP-057.
- **Acceptance check:** Create a supporting character with only a name and one psychological line: no warnings appear; the "fill one line" action opens a single empty field from the psychological block.

### R-A-070 Off-page writing aids: casting tuning forks and playlists
- **Requirement:** Each character can carry private, off-page writing aids: casting "tuning forks" (an actor whose voice and tempo guide the writing), theme music, a per-novel playlist. These are kept separate from the character's decided appearance and identity, are never shown as character facts, and never appear in manuscript exports or reader-facing material.
- **Why:** "Use that voice and tempo to write him, then describe Kevin Wickley in his own right so the reader builds their own picture." "I build a playlist for every novel." "Keep the playlist off the page."
- **Standing:** Decided by Yolanda (bible).
- **Evolution:** Bible (S1-054, S1-065, S1-105, SB-054, SB-210, SB-215); confirmed by her at 12:19 on 10-14 (S3-042); the "actor is not a portrait" rule (S3-047, S4-122) and the spec's separation (S6-134, SP-104). The playlist is not in the spec.
- **Sources:** S1-054 (L343-345), S1-065, S1-105 (L1811-1815), S3-042 (L6590), S3-047, S4-122, S6-134, SB-054, SB-210, SB-211, SB-215, SP-104.
- **Acceptance check:** Record "Kevin Hart" as Kevin's tuning fork: it appears in a private "writing aids" area, not in Appearance, and a manuscript export contains no tuning-fork text.

### R-A-071 Identity is never defaulted or inferred
- **Requirement:** The program never assigns a race, ethnicity, religion, culture, age or appearance to a character that she has not specified, including in generated images and summaries. An unspecified attribute shows as "Not yet specified." Identity is not inferred from a casting reference, and religion or cultural practices are not inferred from race. Shared racial identity does not imply shared personality, beliefs, experiences, cultural expression or speech. Distinct voices never require exaggerated dialect, stereotypes or artificial speech patterns.
- **Why:** "One thing I noticed is when you put representative images for the characters you made them white. And I realized I never specified anything personal about the characters such as the race, their religion, stuff like that. All of that is in my head and I haven't defined it" "but the one thing I know is that these characters are african american."
- **Standing:** Decided by Yolanda for never defaulting identity (L6588-6590). The "Not yet specified" display, the no-inference rules and the authenticity safeguard are Accepted (S3-086) and Unanswered proposals (S3-044, S4-122), consistent with her decision.
- **Evolution:** Her correction (S3-040, S3-041, S3-043, S3-046) led to S3-044 ("shouldn't automatically assign an identity based on an actor … shouldn't silently invent one"), S3-086 (authenticity), S3-083 (no dialect), S4-122 ("No religious or cultural assumptions are inferred from the characters' race"), S6-134 and SP-105 ("no auto-stereotyping and no invented biographical assumptions").
- **Sources:** S3-040 (L6588-6590), S3-041, S3-043, S3-044 (L6615-6634), S3-046 (L6688), S3-083, S3-086 (L7694-7708), S4-122 (L11258), S6-134, SP-105, A14-002, A14-003, PF-002.
- **Acceptance check:** (1) Create a character with no identity fields and ask for a portrait or summary: no race, religion or age is stated; the fields read "Not yet specified." (2) Set ethnicity only: religion and cultural fields stay "Not yet specified" and the AI does not suggest values for them unless asked.

### R-A-072 An incomplete profile is not an incomplete character
- **Requirement:** Identity and biography can be held at three levels: Established, Developing, Unspecified. She can establish one attribute (ethnicity) without knowing others (age, occupation, religion). The program may list unanswered questions about a character but never demands answers merely to fill empty fields, and never treats unknown biography as weak characterization.
- **Why:** "The program must never confuse an incomplete character profile with an incomplete character." She may know how Francine thinks without knowing where she went to college. "A lot of the details I don't quite know yet."
- **Standing:** Accepted proposal (S3-087, blanket acceptance 13:45). The three-level identity tier is an Unanswered proposal (S3-045).
- **Evolution:** S3-045, S3-087, S4-122 ("Unknown biography is not weak characterization"), A15-041 ("deserve discovery rather than retrofitted trauma").
- **Sources:** S3-043, S3-045 (L6644-6658), S3-087 (L7710-7724), S4-122, A15-041.
- **Acceptance check:** A character with five Unspecified biography fields and a rich psychology passes depth diagnostics without any "complete this profile" prompt.

### R-A-073 Character Depth & Integrity Analysis
- **Requirement:** The program helps prevent flat characters and characters who act against who they were established to be. It examines characterization, motivation, agency, contradictions, voice, relationships and behavioral consistency, and distinguishes intentional complexity from unsupported action. It connects to scene analysis, causal analysis, the storyworld and the manuscript. Rule: "The program observes, questions, and provides resources. The author decides."
- **Why:** "What it should also help with is flat characters … not just their character arc. I hate reading books with the character is head-scratching or just boring, flat … making choices that don't fit with who the book said they're supposed to be."
- **Standing:** Decided by Yolanda (the need, L7441, 10-14 13:45). The analysis design is an Accepted proposal ("Yes, robert mckee talks about this in detail", L7750).
- **Evolution:** S3-075 (her request), S3-076 (named), S3-077 to S3-087 (dimensions and checks), S3-139 and S4-119 to S4-123 (Character Depth & Integrity poster). The spec lists "integrity" as a word (SP-034) but drops most of the analysis (see "Things ChatGPT's spec dropped").
- **Sources:** S3-075 (L7441), S3-076 (L7451-7457, L7726-7736), S3-084, S4-119, S4-121, S6-118, SP-034.
- **Acceptance check:** Draft a scene where a suspicious character accepts an explanation without question: the program asks whether something changed his understanding or the reaction is intentionally unusual, and changes nothing.

### R-A-074 Character dimensions are question lenses, not mandatory fields
- **Requirement:** The character model covers: Identity (background, culture, family, history, lived experience); Personality (temperament, habits, humor, quirks, strengths, weaknesses); Psychology (fears, insecurities, wounds, desires, beliefs); Values; Motivation (conscious and unconscious); Contradictions; Relationships (different behavior with different people: rival, ally, family, stranger); Agency; Voice (dialogue, vocabulary, thought patterns, humor); Behavior (under pressure, uncertainty, success, failure); comic engine; behavior versus underlying hunger; Arc. These are offered as question lenses ("What does she want beyond her plot function?"), never as a required form.
- **Why:** Depth comes from understanding how a person operates, not from "favorite food, birthday, and shoe size."
- **Standing:** Accepted proposal (S3-078, blanket 13:45). The "lenses, not mandatory fields" framing is Unanswered poster text (S4-120). Spec-only restatement (SP-103).
- **Evolution:** S3-078, S3-084 (diagnostic questions), S4-120, S6-134, SP-103.
- **Sources:** S3-078 (L7479-7505), S3-084, S4-120 (L11250-11256), S6-134, SP-103.
- **Acceptance check:** Open a character's Depth view: each dimension is shown as a prompt question with an empty answer area, none marked required, and saving with all empty raises no error.

### R-A-075 Integrity checks observe and ask, never auto-correct
- **Requirement:** When a character's action seems out of character, the program identifies the established behavior, the triggering circumstances, and what the character knew at that moment, and asks what bridges the gap. It can trace a questionable decision backward through the story (Character Zoom: profile, behavior across scenes, information held at the time, consequences) to see whether the motivation was established. "Consistent characterization does not require predictable behavior": not every surprise is an error. It never changes the character or the prose.
- **Why:** Her complaint about characters "making choices that don't fit." But meaningful complexity is the point of good characters.
- **Standing:** Accepted proposal (S3-079, S3-085). The "never auto-correct" poster wording is Unanswered (S4-121).
- **Evolution:** S3-079, S3-085, S4-121, S7-059 and HV-061 (prose contradicting a character card is flagged with options).
- **Sources:** S3-079 (L7507-7541), S3-085 (L7670-7692), S4-121 (L11257), S7-059, HV-061.
- **Acceptance check:** On a flagged decision, open "trace back": the program lists prior scenes where the relevant motivation was or was not set up, with what the character knew in each.

### R-A-076 Habits and props belong to the right character
- **Requirement:** The program and its AI must be careful about which character owns a habit, prop or behavior, especially one that reveals something fundamental about a character. When a habit seems to fit another character better, the program flags it and offers to reassign it or change the joke, preserving the earlier wording in history. A habit is never silently attached to a character as established.
- **Why:** "We have to be careful about his habits though." The seventeen-violations notebook was proposed for Kevin; she pointed out Anthony is the self-appointed rule-enforcer.
- **Standing:** Decided by Yolanda (L17293). Ownership of the notebook gag itself is NEEDS YOLANDA (Q7).
- **Evolution:** S6-088 and S6-089 (10-14 21:11); the archive records "ownership … pending revision" (A14-010, A14-026, A14-048); the brief's Scenario C (S7-065, HV-074) and graceful correction (S7-052, HV-030).
- **Sources:** S6-088 (L17240, L17293), S6-089 (L17293), S7-052, S7-065, A14-010, A14-026, A14-048, HV-030, HV-074, SP-252.
- **Acceptance check:** Assign a "documents rule violations" habit to Kevin while Anthony's record says "self-appointed rule-enforcer": the program asks whether the habit fits Kevin, and the habit stays Developing until she decides.

### R-A-077 Contradiction layers
- **Requirement:** A character can be described in four optional layers: public identity, private identity, demonstrated behavior, underlying motivation. These are development tools, not assumptions; nothing written here is canon until she marks it so.
- **Why:** Psychological depth comes from the gaps between how someone appears and what drives them (Anthony's composure on air versus the panic inside).
- **Standing:** Accepted proposal (S3-080, blanket 13:45).
- **Evolution:** S3-080; applied on 10-15 to Anthony ("probably freaking out but he's got to play it cool", S7-083, Decided as developing material).
- **Sources:** S3-080 (L7543-7571), S7-083 (L19007), S7-084.
- **Acceptance check:** Fill public and private identity for Anthony with different content: both display side by side, labeled with their statuses.

### R-A-078 Relationships are evolving records
- **Requirement:** Each significant relationship is its own record tracking trust, respect, intimacy, resentment, dependence, rivalry and balance of power, what caused each change (linked to specific scenes and choices), and the distinctions between external plot opposition, the real emotional trajectory, hidden influence, false assumptions and unequal information. Two characters may share a need (to matter) through different Ghosts and defenses.
- **Why:** Characters reveal themselves through relationships, and reconciliations or betrayals need groundwork.
- **Standing:** Accepted proposal (S3-081). Spec-only additions (S6-135, SP-106 to SP-108), drawn from her Decided insight that Kevin and Anthony share a hunger to matter with different Ghosts (S6-093).
- **Evolution:** S3-081, S3-132, S6-093, S6-135, SP-106 to SP-108.
- **Sources:** S3-081 (L7573-7593), S6-093 (L17400), S6-135, SP-106, SP-107, SP-108.
- **Acceptance check:** Record a change in the Kevin–Anthony relationship: it requires (and links) the scene that caused it, and the relationship timeline shows each change in order.

### R-A-079 Agency
- **Requirement:** The program can observe whether important characters exercise agency suited to their role (for example, "Across the last six scenes, Anthony has primarily responded to Kevin's actions"), framed as a question, and recognizes that temporary powerlessness can be deliberate.
- **Why:** Passive characters feel flat; with alternating POV both narrators must drive events.
- **Standing:** Accepted proposal (S3-082). Her later correction that Anthony "does fight back" (S7-100, Decided) shows why the check must ask, not conclude.
- **Evolution:** S3-082, S4-120, S7-099 (ChatGPT wrongly judged Anthony passive), S7-100.
- **Sources:** S3-082 (L7595-7617), S4-120, S7-099, S7-100 (L19764-19766).
- **Acceptance check:** In a test sequence where one character only reacts, the program raises one agency question with the scenes listed, worded as a question.

### R-A-080 Distinct voices
- **Requirement:** Once prose exists, the program can compare characters' voices (vocabulary, rhythm, humor, what they notice, emotional language, how they read the same event) and flag where two voices become unusually similar, carefully ("similar wording doesn't automatically mean poor characterization"). Voice comes from personality, perspective and experience, never from dialect or stereotype.
- **Why:** IDW alternates POV between two narrators, Kevin and Anthony, who must be distinguishable (Kevin narrates in first person per the Bible; Anthony's grammatical person is not decided, see IDW PV-003). Any multi-POV novel has the same need.
- **Standing:** Accepted proposal (S3-083). Spec-only restatement (SP-168).
- **Evolution:** S3-083, S4-120, S7-107 (ChatGPT's proposed narrator contrast, partly rejected by her "not dry"), A15-061 (open: keeping two high-energy voices distinct), SP-168.
- **Sources:** S3-083 (L7619-7643), S4-120, S7-107, S7-108, A15-061, SP-168.
- **Acceptance check:** Run voice comparison on two chapters by different narrators: the result lists concrete differences and similarities with excerpts, and makes no rewriting suggestion unless asked.

### R-A-081 The five-dollar-bill test for distinctness
- **Requirement:** The program offers her distinctness test: put the same small event in front of several characters and check that their reactions could not be swapped. "If a reaction could belong to anyone, the character is not yet distinct." She can run it on any character, including supporting cast as she names them.
- **Why:** A "character-distinctness engine I can drop anywhere: the same small event, three unmistakable reactions." "Run each through the five-dollar bill test so no two of them react the same way."
- **Standing:** Decided by Yolanda (bible). Note: this test is a different subject from the five-dollar bill as a plot distraction, which is now only a candidate (R-A-025).
- **Evolution:** Bible (S1-071, S1-089, S4-063, SB-048, SB-179). Not in the spec.
- **Sources:** S1-071 (L636-637, L656-657), S1-089, S4-063 (L9356), SB-048, SB-179.
- **Acceptance check:** Choose an event and three characters: the program shows each character's recorded reaction side by side and asks whether any two could be swapped.

### R-A-082 Foil, mirror and double
- **Requirement:** The program uses her definitions. Verbatim (dictated, T L20605-20609): "A foil is a character who will contrast makes another character traits visible. A mirror is often the same idea, but it's a little looser to people alike in situation but different and choice. In double is the opposite emphasis. A double shows how I like two people are. A foil shows how different." Interpreted reading, kept beside the original: a foil's contrast makes another character's traits visible; a mirror is looser, two people alike in situation but different in choice; a double shows how alike two people are, a foil how different. It supports her name-swap test: show two characters' Lies (or other arc statements) one above the other; if the names can be swapped and nothing changes, they are doubles, not foils. It also supports the behavioral test: do their beliefs produce different choices when they face the same problem? Characters can be foils in their psychology while briefly behaving as doubles under pressure.
- **Why:** "And then write anthony's law in one sentence, then beneath that well write kevin's lie. So I can read them as a pair. If I can swap the names and nothing changes, but then these two characters are not foils of one another. They are doubles. And we should push until anthony's mind pull in the opposite direction of Kevin's." (T L20603; "law" is a dictation artifact for "lie"). Her bible: keep Anthony's Lie "the mirror image of Kevin's, so the two men are broken in complementary ways and heal each other."
- **Standing:** Decided by Yolanda for the definitions, the name-swap test, and reading the two Lies stacked as a pair (L20603-20609, 10-15 16:52). Reading them as a pair is her own working practice. The on-screen paired view with a swap-names toggle is a Possibility built on that practice (S7-127). The behavioral extension and the "doubles under pressure" point are Unanswered proposals (S8-027, S8-065).
- **Evolution:** Bible "mirror image" Lies (S1-063, S7-125, SB-073); her definitions and test (S7-126, S7-128); ChatGPT's choices test (S7-133, S8-027) and comparison tables (S8-026, S8-040); "doubles under pressure" (S8-065, A15-031). Whether the bible's "mirror image" means foil is NEEDS YOLANDA (Q4).
- **Sources:** S1-063 (L481-527), S7-125 (L20601), S7-126 (L20603), S7-127, S7-128 (L20605-20609), S7-133, S8-026, S8-027 (L21431-21471), S8-040, S8-065, A15-015, A15-031, SB-073.
- **Acceptance check:** Open the paired view for Kevin and Anthony: their Lie candidates stack vertically, a "swap names" toggle exchanges the names in place, and the program shows her definitions beside the comparison.

### R-A-083 Ghost guidance: explain the belief, don't manufacture tragedy
- **Requirement:** When the AI helps with a Ghost, it looks for the formative experience that explains the Lie, not a tragedy to fill the slot. It does not invent trauma, a bad parent or a backstory to complete a field. It distinguishes a character's pain from "the false belief that pain has taught him," and recognizes that an event happening during the story is not automatically the Ghost (a category error it should point out). A Ghost need not be tragic but must be personal and convincing, and a Ghost does not explain every quirk: "The experience didn't create his personality. It turned his existing personality into a defense mechanism."
- **Why:** She placed Anthony's job loss inside the story ("I think anthony's job loss has to occur within the story proper"), so it cannot be his Ghost. She later added his visit to his mother's grave ("Anthony, will go to the cemetery and he will find his mama's grave", T L22789) and his father's dementia, which is present-day. When his mother died is not stated (Unanswered). The archives warn against "retrofitted trauma."
- **Standing:** Unanswered proposals (S6-079, S7-131, S8-017, S8-049, S8-078, S8-081), consistent with her Decided timing (S8-047) and with archive guardrails (A15-016, A15-041).
- **Evolution:** S6-079 (Kevin), S6-094 ("The HOA behavior isn't the Ghost. It's the symptom."), S7-131, S8-017, S8-049, S8-078, S8-081, A15-016, A15-041.
- **Sources:** S6-079 (L17022-17040), S6-094, S7-131 (L20708-20735), S8-017 (L21206-21212), S8-047 (L22086-22088), S8-049 (L22106-22134), S8-078, S8-081, A14-020, A15-016, A15-041.
- **Acceptance check:** Tag an in-story event as a character's Ghost: the program asks whether it happened before the story began, and suggests it may instead be an event that challenges the existing Lie; nothing is changed.

### R-A-084 Working backward: the last page, and from behavior to the Lie
- **Requirement:** The program supports her character technique: "If you were to write [the character's] last page of the novel in one line, who is he now? What is the Lie he had to drop to become him? Then his Need. And his ghost." It also supports deriving the Lie by working backward from observed behavior ("What does he falsely believe he must do to be worthy?"), treating likeable traits as personality, not problems to fix. Both can be done conversationally ("We can also talk it out").
- **Why:** This exercise produced her biggest breakthrough on 10-14. It is "an invitation to uncover a human being," not a request to fill four fields.
- **Standing:** Decided by Yolanda (her technique, L16789). The backward-from-behavior method is an Unanswered proposal (S8-003).
- **Evolution:** S6-071, S7-044, HV-013, S8-003, S8E-018 ("discover people, not simply complete character questionnaires. Our Kevin and Anthony conversation is the model").
- **Sources:** S6-071 (L16789), S7-044, S8-003 (L21100-21110), S8E-018, HV-013, SB-045.
- **Acceptance check:** Start "last page" on a character: the program asks for one line, then walks Lie, Need and Ghost in that order in conversation, saving each answer as Developing with the conversation linked.

### R-A-085 Character facts have a time dimension
- **Requirement:** Character facts record when they are true: backstory before the novel, the character's present at the start, an event during the story, or "timing not yet decided". IDW examples: Kevin's job loss was in the past and he is employed now; Anthony's downsizing happens on the page; Anthony's father is alive in memory care. Anthony's mother is deceased, but when she died is Unanswered (her only words: "Anthony, will go to the cemetery and he will find his mama's grave", T L22789). The program must accept "timing unknown" and not infer one.
- **Why:** She had to correct a timing confusion: "Kevin lost his job in the past. He is not currently unemployed." Timing decides whether something is a Ghost or a story event.
- **Standing:** Decided by Yolanda for the Kevin and Anthony job-loss timings (L22047-22049, L22086-22088) and the father's present condition (L22791). The mother's timing is Unanswered. The time dimension is a Possibility (S8-104).
- **Evolution:** S8-046, S8-047, S8-104, A15-011.
- **Sources:** S8-046 (L22047-22049), S8-047 (L22086-22088), S8-072, S8-073, S8-104, A15-011.
- **Acceptance check:** Record "lost his job" for Kevin as Backstory and "downsized" for Anthony as In-story event: the AI never describes Kevin as currently unemployed.

### R-A-086 Character and story guardrails persist
- **Requirement:** She can record guardrails at character level and story level, and they persist across sessions and inform every AI suggestion and review. Examples: Anthony is not dry or deadpan; Anthony never dips into the "Angry Black Man" trope; his physical comedy is expressive, not demeaning (Dick Van Dyke, Martin Lawrence, Jim Carrey, David Alan Grier, Tisha Campbell, not the Three Stooges); Francine is never humiliated and never a villain; Kevin's wife and Anthony's father are full people, not props; "laugh at their foolishness without laughing at their pain"; "Most men ARE carrying far more than people realize." When an AI suggestion would break a guardrail, the AI says so.
- **Why:** These were set in conversation and the AI kept losing them ("dry" returned twice). "Anthony doesn't dip into the 'Angry Black Man' stereotype/trope."
- **Standing:** Decided by Yolanda for the individual guardrails (S7-108, S7-116, S7-119, S8-084, SB-160). Storing them as persistent guardrails is a Possibility (S7-118, S8-088).
- **Evolution:** S7-108, S7-116, S7-117, S7-118, S7-119, S8-064, S8-076, S8-084, S8-088, A14-049, A15-004, A15-040.
- **Sources:** S7-108 (L20013-20017), S7-116 (L20429), S7-117, S7-118, S7-119 (L20491-20493), S8-064, S8-076, S8-084 (L23069-23071), S8-088, SB-160, A14-047, A14-049, A15-004, A15-040, A15-042.
- **Acceptance check:** With "not dry" stored for Anthony, ask the AI to describe him: it does not use "dry"; ask it to write an angry Anthony beat: it flags the trope guardrail and frames frustration through his personality.

### R-A-087 Her comparisons are borrowed qualities, not templates
- **Requirement:** When she compares a character to a person or character ("an NPR host", "Hulk", "Spider-Man", "Dre in Black-ish", "Olivia Pope"), the program stores the comparison as a lens of borrowed qualities and the AI does not turn it into a literal persona. When it is unclear which quality she means, the AI asks.
- **Why:** "I don't mean a true NPR replica. Just, he's cool, smooth, even-keeled on his show. Until he's not." "I don't mean to truly epitomize those characters to some of their qualities." (verbatim; read: "only some of their qualities")
- **Standing:** Decided by Yolanda (through her corrections, L20327, L20361).
- **Evolution:** ChatGPT built a full broadcasting persona from "NPR" (S7-113); she corrected it; the archive records "qualities, not literal replicas" (A15-003, A15-008).
- **Sources:** S7-112, S7-113 (L20327), S7-114 (L20327, L20353, L20361), S7-115, A15-003, A15-008.
- **Acceptance check:** Record "like an NPR host" for Anthony's on-air manner: the AI's later descriptions use "cool, smooth, even-keeled" and do not invent NPR-specific mannerisms.

### R-A-088 Roles and narrative importance
- **Requirement:** Characters carry roles that the program understands: co-lead, Buddy Love pairing, B-story lead, hidden engine, "true protagonist of her own tale," narrator versus non-POV secret-keeper, supporting cast. Protagonist, viewpoint character, narrator, grammatical person and narrative importance are separate attributes. Analysis and expected depth scale with narrative importance.
- **Why:** IDW shows the flexibility needed: two co-leads who narrate, and a hidden instigator who never narrates until the reveal.
- **Standing:** Decided by Yolanda (bible roles). The separate attributes are an Accepted proposal (S2-105, blanket 11:25). POV mechanics belong to another theme.
- **Evolution:** S1-184, S2-105, S3-084 (relative to importance), SB-066, SB-087.
- **Sources:** S1-184 (L367, L470-471, L585-586), S2-105 (L4481-4495), S3-084, SB-066, SB-087.
- **Acceptance check:** Mark Francine as "hidden engine, non-POV until reveal": the character list shows her role and the depth diagnostics treat her as a main character.

---

## E. The AI collaborator

### R-A-089 The AI's role: a thinking partner, not a ghostwriter
- **Requirement:** The AI is a story architect's assistant and intellectual partner: it maps, analyzes, questions, recommends, remembers her intentions, adapts to her process, shows consequences, and preserves her control of the manuscript. It is not a ghostwriter, creative director or writing instructor. Three responsibilities are never confused: "The AI helps you think about your story. The application remembers your story. You remain its author."
- **Why:** "The author's imagination creates the story. The system helps the author see it, understand it, strengthen it, and bring it to completion." "The author needs an intellectual partner, not a form wizard."
- **Standing:** Accepted proposal (S2-028, S2-043, S2-046, accepted "I agree with everything said", 10:55 on 10-14). The three-responsibilities line is an Unanswered proposal (S5-096). Spec-only restatements (S7-042, S7-054, HV-007).
- **Evolution:** S2-028, S2-043, S2-046, S5-096, S7-042, S7-054, HV-007.
- **Sources:** S2-028 (L3345-3351), S2-043 (L3544-3557), S2-046 (L3593-3595), S5-096 (L14726-14738), S7-042 (L18631), S7-054 (L18657-18659), HV-007.
- **Acceptance check:** Across a 20-message session, every AI output is analysis, a question, an option or a resource; none is placed into the manuscript or into canon without her action.

### R-A-090 Modes: Teach it, Show it, Hand it to me, Critique
- **Requirement:** The AI works in modes she can pick:
  - **Teach it**: explain a technique fully: what it is, what job it does, what the frameworks say, how to make it land and how it fails, also-known-as names in other frameworks. (Her bible's beat-teaching format.)
  - **Show it**: a demonstration, always marked as a demonstration and never a decision, in more than one flavor where possible.
  - **Hand it to me**: return the work to her with a prompt, anything undecided flagged as hers to settle.
  - **Critique / Challenge**: find holes and problems without fixing them.

  The writer's primary action, "Write," is always one step away.
- **Why:** Teach / Show / Hand it to me is the rhythm of her Story Bible: "This is my story. The writing is the part I keep." Critique answers her demand for honest evaluation (R-A-093).
- **Standing:** Decided by Yolanda for Teach / Show / Hand it to me as her method (bible). Using them as AI conversation modes, and adding Critique, is Spec-only (SP-179, SP-180, HV-039); she has not reviewed the mode design (NEEDS YOLANDA Q12).
- **Evolution:** Bible (S1-023, S1-075, S4-066, SB-004); the spec turned the rhythm into AI modes and added Critique (S6-151, SP-179); the vision brief echoes it (HV-039).
- **Sources:** S1-023 (L35-44), S1-075 (L712-1386), S4-066 (L9357-9383), SB-004, S6-151 (L18149), SP-179, SP-180, HV-039.
- **Acceptance check:** In "Teach it" on Midpoint, the answer covers what it does, how it lands, how it fails and its other names, before any example; in "Show it" the example is labeled Illustrative; in "Hand it to me" no example is given, only a prompt; in "Critique" no rewrite is offered.

### R-A-091 Two intelligences: craft and creative conversation
- **Requirement:** The AI must show both craft intelligence (plot, character psychology, dramatic structure, causality, frameworks) and creative conversational intelligence: helping her explore an idea, recognizing when something meaningful emerges, challenging assumptions constructively, keeping her voice, enjoying the humor without flattening it, and "knowing when to get out of the way so you can write." A technically complete database that cannot support exploration fails, and so does a chatbot that chats but loses the discoveries. The program "helps that thinking happen," not just stores its results.
- **Why:** She said the spec "misses the 'human' touch; where I was sharing my ideas and then you were edfying the product." (verbatim; read: "edifying") She wanted the handoff to explain "the zoom in, the different modules and why we created them."
- **Standing:** Decided by Yolanda for the human-touch requirement (L18494; edited-versions L137-139). The two-intelligence framing is an Unanswered proposal from the alternate branch (S8E-011, S8E-012) and Spec-only in the vision brief (HV-081).
- **Evolution:** S6-169, S7-001, S8E-003, S8E-004, S8E-011, S8E-012, S8E-013, S8E-020 (per-module "what would count as failure even if the feature technically works"), S7-071, S7-072, HV-081, HV-085.
- **Sources:** S6-169 (L18494), S7-001, S7-071 (L18697-18701), S7-072, S8E-003, S8E-004, S8E-011, S8E-012, S8E-013, S8E-020, HV-081, HV-085.
- **Acceptance check:** Re-run the 10-14 session (R-A-058) with the in-program AI: an observer can point to moments where the AI built on her joke, asked one sharp question, and then stepped back, and every discovery is still in the Story Brain afterward.

### R-A-092 Character conversations in plain language, with one useful question
- **Requirement:** She can open a character and ask a deep craft question in ordinary language, without a template. The AI reads the author-approved facts and source excerpts for that character, separates her decisions from teaching examples, proposes a causal reading (Ghost → Lie → protective behavior → Want/ambition → Need → final change), explains how it might show in scenes, and asks one useful question when her next decision would unlock insight. "I need to think about that" is accepted without pressing. Example quality bar: "What does Kevin believe this action will accomplish, and what result will most dramatically contradict him?"; "Is this really Anthony's defense mechanism rather than Kevin's?"
- **Why:** This is how her breakthroughs happened ("Use my story bible … WE can also talk it out").
- **Standing:** Spec-only (HV-024 to HV-026, HV-038), modeling her Decided technique (S6-071) and the 10-15 practice she accepted (S7-106).
- **Evolution:** S6-071, S7-050, S7-145, HV-024, HV-025, HV-026, HV-038, SP-159.
- **Sources:** S6-071 (L16789), S7-050 (L18649), S7-105, S7-106, S7-145, HV-024, HV-025, HV-026, HV-038, SP-159, SP-160.
- **Acceptance check:** Ask "Why does Anthony need to be the most important man on the street?" in Anthony's record: the answer cites his recorded facts, labels its readings as proposals, ends with at most one question, and creates no record unless she keeps something.

### R-A-093 Honest critique, never flattery
- **Requirement:** The AI is an honest developmental editor as well as an encouraging partner. When she brings an idea it (1) names what genuinely works, (2) names what does not work yet (weak jokes, repetition, structural problems, character inconsistency, convenient developments), and (3) helps strengthen it without hijacking her voice: "My suggestions are tools, not instructions." It does not praise everything, does not patronize, and does not reduce hard questions to prompts. It distinguishes "made us laugh while brainstorming" from "works on the page." Assessments can be given as a short table (strong premise / potentially repetitive / underdeveloped / not yet earned).
- **Why:** "Are you just blowing smoke up my ass? And being nice, because chatgpt is designed to be nice?" She needs to trust praise because she knows the AI will say when something isn't working.
- **Standing:** Decided by Yolanda (her challenge, L19566, 10-15 14:31). The three-step mode and assessment table are Accepted proposals ("Thank you for this", L19764). The vision brief's no-flattery rule (HV-009 to HV-011) predates her challenge and agrees with it.
- **Evolution:** HV-009 to HV-011 (10-15 morning), S7-096 (her challenge), S7-097 and S7-098 (accepted), S8-009 (ChatGPT ending with "one editorial concern rather than another round of applause"), Scenario C (S7-065, HV-074).
- **Sources:** S7-043 (L18633), S7-065, S7-096 (L19566), S7-097 (L19574-19582, L19728-19760), S7-098 (L19706-19726), S8-009, HV-009, HV-010, HV-011, HV-074.
- **Acceptance check:** Submit a deliberately repetitive joke sequence: the AI's reply names at least one concrete weakness and why, alongside what works, and offers options without rewriting her text.

### R-A-094 The AI may disagree respectfully, and takes "not quite" gracefully
- **Requirement:** The AI may respectfully disagree with her, with reasons, while honoring her intent. When she corrects it ("not quite"), it recognizes the correction, keeps the earlier wording in history, adjusts, and never argues that its earlier interpretation was automatically right. A correction never resets the rest of the character model.
- **Why:** She needs real challenge, but she is the author. In the notebook episode the right behavior was to recognize her correction and propose reassigning the gag.
- **Standing:** Spec-only (HV-012, HV-030, HV-031) and Unanswered proposal (S7-123). Consistent with her Decided items R-A-002 and R-A-093.
- **Evolution:** S7-052, S7-065, S7-123 (ChatGPT questioned her Laurel and Hardy dismissal; her "not like" stands), HV-012, HV-030, HV-031, HV-074.
- **Sources:** S7-052 (L18653), S7-065, S7-123 (L20563-20577), HV-012, HV-030, HV-031, HV-074.
- **Acceptance check:** Correct an AI reading of a character: its next reply acknowledges the correction, does not restate the old reading as right, and the history shows both versions.

### R-A-095 The AI checks the latest decisions before it reasons
- **Requirement:** Before analyzing or proposing anything about a character, scene or plotline, the AI retrieves the current canon, the newest developing work and any guardrails, applying the source ranking (R-A-031). It never reasons from an older, superseded or illustrative version when a newer one exists, and it surfaces relevant earlier archives or sessions she has created.
- **Why:** "You shouldn't have had to remind me that we had already done this work." The 10-14 archive was created precisely so the discoveries would not be lost.
- **Standing:** Decided by Yolanda (L20960).
- **Evolution:** S7-130 (AI used the old bible Lie), S7-136, S7-137, S7-139, S7-150, S8-001.
- **Sources:** S7-130, S7-134, S7-136 (L20960, L21008-21012, L21076), S7-137, S7-139, S7-150, S8-001.
- **Acceptance check:** With the 10-14 archive imported, ask the AI to develop Anthony as Kevin's foil: its comparison uses Kevin's 10-14 Lie candidates, not the bible's illustrative Lie.

### R-A-096 The AI labels what it says
- **Requirement:** Every AI contribution carries its status inline ("proposed revision, not yet approved canon", "working character insight, not canon", "just playing with their voices, not manuscript dialogue", "author-created dialogue worth preserving", "possibilities, not decisions"), and those labels become the recorded status of anything saved from it. When the AI makes a claim about her story, it cites the records or excerpts it used, labels inference as inference, and avoids false certainty.
- **Why:** ChatGPT did this throughout the 10-15 sessions, and she built on it without objection; it is what kept her ideas and its illustrations apart.
- **Standing:** Accepted proposal for the practice (S8-006, a consistent practice she never objected to). Citation rules are Spec-only (SP-175).
- **Evolution:** S7-144, S8-006, S6-150, SP-175.
- **Sources:** S7-144 (L18924, L19146, L19252, L19448, L19554, L20547, L20790), S8-006 (L21529, L21755, L21821, L22320, L22401, L23185), S6-150, SP-175.
- **Acceptance check:** Save an AI sample line from a session: its stored status is Illustrative and its origin is "assistant", matching the label shown in the conversation.

### R-A-097 Accept, reject or defer each suggestion, with a preview
- **Requirement:** Each AI recommendation can be accepted, rejected or deferred individually. Accepting shows the exact before and after first, and creates a reversible history entry. Proposed Ghosts, motives, events, dialogue or relationships are never applied to canon automatically.
- **Why:** Her authority (R-A-002) made operational.
- **Standing:** Spec-only (SP-177, SP-178), consistent with her Decided authority.
- **Evolution:** S6-069 (the build's review queue for pasted suggestions), S6-150, S6-161 ("A review queue … does not mean AI collaboration is implemented"), SP-177, SP-178.
- **Sources:** S6-069, S6-150 (L18147), S6-161, SP-177, SP-178, SP-232.
- **Acceptance check:** Accept an AI proposal to change a Want: a before/after preview appears; after accepting, one "undo" restores the old Want exactly.

### R-A-098 There is more in her head than she has typed
- **Requirement:** The AI does not treat what she has typed so far as the whole of her conception. Before judging a character or scene as underdeveloped, it asks. It distinguishes "you understand his behavior" from "you haven't written his dialogue yet," and does not write her characters' dialogue for her to fill the gap.
- **Why:** "I only showed you one part in my head." The AI had judged Anthony a passive straight man when she simply had not shown that part yet.
- **Standing:** Decided by Yolanda (L19764-19766) for the fact. The behavior is a Possibility derived from it (S7-101).
- **Evolution:** S7-099 (ChatGPT's critique), S7-100 (her correction), S7-101 (ChatGPT's retraction and restraint).
- **Sources:** S7-099, S7-100 (L19764-19766), S7-101 (L19931-19945).
- **Acceptance check:** Ask for feedback on a scene where one character has no lines yet: the AI asks whether she has that character's side in mind before calling him passive, and does not draft his lines.

### R-A-099 The AI preserves her voice; whether it may draft prose is hers to say
- **Requirement:** The AI never homogenizes her prose or "improves" her narration. Any prose or dialogue it produces is a labeled illustration (Show it), never manuscript text, and is never inserted into the manuscript. Whether the AI may offer prose brainstorming at all, and how, is her decision.
- **Why:** "This program does not write the novel." The spec nevertheless lists "controlled, opt-in prose brainstorming" as an AI function.
- **Standing:** Decided by Yolanda for "does not write the novel" (L3337). "Controlled, opt-in prose brainstorming" is Spec-only (SP-173) and NEEDS YOLANDA (Q10).
- **Evolution:** S2-025, S6-149, SP-173, SP-176, HV-078; ChatGPT's practice of labeled sample lines ("not proposed manuscript dialogue", S7-089, S7-122, S8-091).
- **Sources:** S2-025, S6-149 (L18145), S7-089, S7-122, S8-091, SP-173, SP-176, HV-078.
- **Acceptance check:** Ask the AI for "a version of this line": it returns a labeled illustration in the conversation only; the manuscript is unchanged.

### R-A-100 She controls how much the AI speaks up, and how
- **Requirement:** She can set the level of guidance: **Quiet** (records concerns without interrupting), **Advisory** (subtle notice of meaningful concerns), **Deep Analysis** (full observations, dependencies, questions, resources). Quiet is the default while drafting; she can request a structural review whenever she wants. While she writes, the AI does not interrupt with criticism; feedback comes when she asks. She can also tune the AI's style and tone and choose different frameworks per project.
- **Why:** Interrupting her "every thirty seconds" during a funny scene "would be maddening." "The program gets the hell out of your way."
- **Standing:** Accepted proposal (S2-037, S2-111, blanket acceptance on 10-14). Style/tone personalization is Spec-only (HV-067, HV-069, SP-189).
- **Evolution:** S2-037, S2-111, S3-070, S7-061, HV-067, HV-069, SP-189. The spec keeps only "control how much guidance appears"; the three named settings were dropped.
- **Sources:** S2-037 (L3438-3460), S2-111 (L4562-4596), S3-070 (L7343-7353), S7-061, HV-067, HV-068, HV-069, SP-189.
- **Acceptance check:** In Quiet mode, draft a scene with a causal gap: no message appears while typing; the concern is listed when she opens the review panel.

### R-A-101 When the AI raises a concern, she chooses what to do with it
- **Requirement:** Each flagged concern offers three paths: **Examine the connection** (open the scenes and dependencies involved), **Explore possibilities** (questions that might strengthen it, without rewriting anything), **Find craft resources** (relevant books, articles or sites on the concept). It never declares the writing bad, insists on a solution, changes the manuscript, or pretends its reading is certainly right.
- **Why:** Guide investigation without dictating.
- **Standing:** Accepted proposal (S2-030, S2-031, blanket acceptance 10:55 on 10-14).
- **Evolution:** S2-030, S2-031. Not carried into the spec (see "Things ChatGPT's spec dropped").
- **Sources:** S2-030 (L3355-3373), S2-031 (L3375-3383).
- **Acceptance check:** Open any flagged concern: exactly these three options appear, and none changes a record.

### R-A-102 Craft Resource Advisor: pointing her to where to learn more
- **Requirement:** The program can suggest craft resources (books, articles, websites) relevant to a specific concern, for example Swain's Scene and Sequel for weak scene-to-scene causality, McKee's *Story* for a scene without a turn, Weiland for unsupported motivation, Brody for a midpoint without reversal, Truby for setups and payoffs, Kaplan for comedy that isn't escalating. It points to the concept, not just the book ("McKee's discussion of scene design and story values," not "read all of Story"). It does not teach as an authority; it shows where to find more. Suggestions are examples of good sources, not claims that any author has the definitive answer.
- **Why:** "Maybe we can give the author suggestions for resources to look at … We, the program, aren't teaching them per se but we give them advice on where to find additional information."
- **Standing:** Decided by Yolanda (L3337, 10-14 10:43). The module and mapping are Accepted proposals (S2-029, S2-032, S2-033, S2-040, blanket acceptance 10:55). The resource table is an Example.
- **Evolution:** S2-027 (her idea), S2-029, S2-032, S2-033, S2-040 (named "Craft Resource Advisor", provisional), S3-008 (kept in the Phase 2 list), S3-086 (research materials for cultural authenticity). The spec drops it entirely (see "Things ChatGPT's spec dropped").
- **Sources:** S2-027 (L3337), S2-029, S2-032 (L3385-3402), S2-033 (L3406-3410), S2-040 (L3518-3524), S3-008 (L6238-6279), S3-086.
- **Acceptance check:** Flag a sequence where three pranks end the same way and choose "Find craft resources": the program returns one or two concept-level suggestions (for example progressive complications in McKee), each with a one-line reason.

### R-A-103 Never cite a chapter or page number
- **Requirement:** Resource suggestions never name a specific chapter or page of a book, in any form.
- **Why:** "I don't think we should ever recommend a specific chapter or a specific page … those things are subject to change and it's too complicated to try to keep track of all that."
- **Standing:** Decided by Yolanda (L3607, 10-14 10:55).
- **Evolution:** ChatGPT had proposed verified chapter and page references for specific editions (S2-034). She replaced that with this rule (S2-049). ChatGPT honored it in later restatements (S2-057, S2-063, S3-008) but dropped the clause from its eight-principle table (S2-138), and the spec omits the advisor altogether. The omissions do not cancel the rule.
- **Sources:** S2-034 (L3412-3414, replaced), S2-049 (L3607), S2-057 (L3747-3776), S2-063, S2-138, S3-008.
- **Acceptance check:** Run 50 varied resource requests: no output contains a chapter number, chapter title reference, page number or page range for a book.

### R-A-104 How a resource suggestion is built and where it comes from
- **Requirement:** Each suggestion names the resource, its author or creator, the craft concept that makes it relevant, and a one-line reason tied to the concern. Web links are included only when available and verified, never generated from memory. Advice is never misattributed. Each suggestion shows its provenance: an established reference, one she supplied, or a newly found recommendation.
- **Why:** Accuracy and transparency of advice; invented or misattributed references would be bad advice (R-A-003).
- **Standing:** Accepted proposal for the format and verification (S2-057, S2-034's surviving part). Provenance categories are an Unanswered proposal (S2-058).
- **Evolution:** S2-034 (verified, not from memory; links to legitimate resources), S2-057, S2-058.
- **Sources:** S2-034 (L3412-3414), S2-057 (L3747-3776), S2-058 (L3778-3780).
- **Acceptance check:** Each suggestion displays resource, creator, concept, reason and provenance; any link shown resolves to the named resource.

### R-A-105 Her own craft library and vocabulary come first
- **Requirement:** She can keep a Personal Craft Library of preferred resources; the advisor prioritizes those. Suggestions use the vocabulary of the frameworks she selected for the project (story values and turning points for a McKee user; Lie and Need for a Weiland user). She can attach a resource to a scene or sequence with the topic and her own note ("Review before revising Anthony's confrontation with Kevin").
- **Why:** "The software adapts to the author's process, not the other way around." "You don't have to remember why you bookmarked something six weeks earlier."
- **Standing:** Accepted proposal (S2-036, S2-041, blanket acceptance 10:55).
- **Evolution:** S2-035, S2-036, S2-040, S2-041. Not in the spec.
- **Sources:** S2-035, S2-036 (L3426-3436), S2-040, S2-041 (L3526-3540).
- **Acceptance check:** Add McKee's *Story* to her library and attach it to the fish-guts sequence with a note: the note shows when she opens that sequence, and McKee is offered first for a value-turn concern.

### R-A-106 Frameworks are lenses the AI understands, not forms
- **Requirement:** The AI uses Snyder (through Brody), McKee, Weiland, Ingermanson, Swain and any framework she chooses as lenses that illuminate a story problem in context, not as a syllabus or worksheet. "The labels aren't the story. The dramatic movement is." It understands how the frameworks map to one another without pretending they match perfectly, and it catches category errors (for example, tagging an in-story event as a Ghost).
- **Why:** She uses four frameworks as "one, seen from four angles." "The objective is not proving she followed McKee correctly but compelling scenes with believable characters."
- **Standing:** Decided by Yolanda (bible: frameworks map to one another; she asked to "incorporate a lot of Robert's ideals"). Lens framing is an Accepted proposal (S3-100). Framework selection itself belongs to another theme.
- **Evolution:** S1-029 to S1-031, S3-089, S3-100, S7-054, S8-049, HV-036, HV-037, SP-019, SP-100.
- **Sources:** S1-031 (L97-104), S3-089 (L7750), S3-100 (L8005-8025), S7-054, S8-049, HV-036, HV-037, SP-019, SP-100.
- **Acceptance check:** Ask the AI why a scene feels flat: the answer uses the frameworks selected for the project to explain the problem in that scene's terms, and does not ask her to complete a worksheet.

### R-A-107 The AI matches the book's tone and the moment
- **Requirement:** The AI recognizes her voice and each project's genre and register. A tender or therapeutic moment in a comedy is no reason to turn solemnly clinical; a funny idea is no proof it belongs at a fixed beat; value scales and complications are not forced into dark extremes the book does not want. A different project (for example a psychological thriller) gets a different register and critical focus.
- **Why:** IDW is "an emotionally strong comedy," and she wants to "get them back to fighting with Miss Francine!" right after the deepest scenes.
- **Standing:** Spec-only (HV-040, HV-041) and Unanswered poster text (S4-126), consistent with her Decided tone statements (S8-089, SB-209).
- **Evolution:** S4-126, S8-080, S8-089, S8-090, HV-040, HV-041, SB-207 to SB-209.
- **Sources:** S4-126, S8-080, S8-089 (L23133-23135), S8-090, HV-040, HV-041, SB-207, SB-208, SB-209.
- **Acceptance check:** After a grief scene in a comedy project, ask for ideas for the next scene: the AI's suggestions include comic options and do not adopt a clinical register.

### R-A-108 Writing never depends on the AI, and nothing leaves her computer without consent
- **Requirement:** All writing, reading, editing, capture, search, saving and backup work with the AI switched off or unavailable. Any AI service sends the minimum content needed, discloses what leaves the machine, and requires her consent and credentials. AI failures never affect local story data.
- **Why:** The program is local and private, and her unpublished novel is hers.
- **Standing:** Spec-only (SP-140, SP-205, SP-210, SP-264). Fits the program brief (Windows, local, private). Which AI provider, if any, is NEEDS YOLANDA (Q13).
- **Evolution:** S2-123 (privacy, Unanswered), S6-158, SP-140, SP-205, SP-210, SP-229 (AC18), SP-264.
- **Sources:** S2-123 (L4820-4842), S6-141, S6-158, SP-140, SP-205, SP-210, SP-229, SP-264.
- **Acceptance check:** Disconnect the network and disable the AI: capture, drafting, search, save and backup all work; re-enable the AI: the first request shows what will be sent and asks permission.

---

## Needs Yolanda

Each question names the requirement it blocks or shapes.

1. **Status vocabulary (R-A-023).** Which labels do you want on screen? Your bible uses Decided / "One way I could play it, not a decision yet" / Still open, plus your "Over to me" slots. ChatGPT has used Established / Developing / Unanswered / Illustrative / Proposed. Specifically: (a) Should "Drafted and confirmed" be its own status, so what you have written can outrank the plan? (b) Should "Developing" (something you're exploring) and "Unanswered" (something you still need to figure out) always stay separate? The posters merged them into one label. (c) Should "function decided, execution open" be shown as its own status or as a second layer on the item? (d) What status should a freshly captured thought get by default?
2. **Set-aside ideas across books (R-A-050).** ChatGPT said an idea set aside in I Declare War "might become perfect for another novel." Do you want set-aside ideas from one book to be searchable from your other books now, or later with the cross-project features?
3. **Whole conversations inside the program (R-A-054).** When you said "lock this entire conversation in," did you mean the program must store every message word for word inside itself, or is a saved file you can re-import enough? Should it also import conversations you had elsewhere (for example this ChatGPT design conversation) as records?
4. **"Mirror image" versus foil (R-A-082).** Your bible says to keep Anthony's Lie "the mirror image of Kevin's." By your own definitions, a foil shows how different they are and a double shows how alike. Did "mirror image" mean opposite (a foil)?
5. **Francine on respect (R-A-065).** Your bible asks you to "confirm she stays Flat on respect." Do you confirm Francine is Flat on respect and Positive Change on loneliness?
6. **Kevin's Ghost (R-A-064, R-A-085).** On 10-14 you offered the job loss as "just a thought". On 10-15 you said: "Kevin lost his job in the past. He is not currently unemployed. I haven't established what is good job or career is yet. But his ghost, his job loss, that is the past." (T L22049). The register now records the job loss in the past as Kevin's Ghost (Established). Still open: the job, its cause, when it happened, and what nearly broke the marriage. Is the individual and couples therapy canon in its own right? (You said "he agreed to go to therapy, individual and couples counseling", T L17080.)
7. **The seventeen-violations notebook (R-A-076).** When you said "Anthony would be a notebook wielding fool too," did you mean Anthony instead of Kevin, both men, or something else?
8. **Status of the 10-14 and 10-15 discoveries.** The archives record these as "developing": Anthony's podcast *The Voice of Reason*, the co-hosting ending, "Giving honor to God, and Miss Francine…", Anthony as a local TV anchor who is downsized, the cemetery and memory-care scenes, Kevin finding the ledger. You stated several of them with conviction ("I can see them"). Which are decided, and which are still possibilities?
9. **Session harvest (R-A-056).** Should the program offer a harvest automatically when you stop a conversation, or only when you ask?
10. **AI and prose (R-A-099).** The spec lets the AI do "controlled, opt-in prose brainstorming." You said the program "does not write the novel." May the AI ever offer sample prose or dialogue (always labeled as an example and never placed in the manuscript), or should it never write lines at all?
11. **Source ranking (R-A-031).** You established that newer character work outranks older example text (your objection about Kevin's Lie, T L20960). ChatGPT then proposed this order: (1) your latest explicit decisions; (2) the 10-14 character archive; (3) the 10-13 Story Bible for story foundations. You did not answer it directly. Do you want a fixed order beyond your rule, and if so, is this it? Should the Story Bible be updated as each change is confirmed, or stay frozen as the 10-13 baseline with later decisions layered on top?
12. **AI modes (R-A-090).** The spec turns your bible's Teach it / Show it / Hand it to me rhythm into AI conversation modes and adds Critique. Is that how you want to talk with the AI? Should "Teach it" follow your beat-teaching format (what it does, how to make it land, how it fails, also known as, then the example)?
13. **AI provider (R-A-108).** Which AI service, if any, should the program connect to, and what may be sent to it?
14. **Names.** Is "Story Brain" the name you want for the central knowledge system? Is "Craft Resource Advisor" the name for the resource feature? What is the program's name?
15. **Character guardrails (R-A-086).** Do you want a stored list of guardrails per character and per book (for example "Anthony is not dry", "no Angry Black Man trope", "Francine is never humiliated") that the AI must check every suggestion against?
16. **Suggested questions (R-A-029, R-A-047).** Should questions the AI generates go straight into "Questions I Have" or into a separate "suggested" list until you adopt them?
17. **Pie and bar charts (R-A-021).** The spec says you dislike generic pie and bar charts. That is not in the conversation transcript. Is it right?
18. **"Not yet specified" (R-A-071, R-A-072).** Do you want unspecified identity fields shown as "Not yet specified", with three levels (Established / Developing / Unspecified)?
19. **Outdated documents (R-A-032).** When a document such as your bible becomes partly outdated, do you want a side-by-side "what we knew vs what we've discovered" view?
20. **Resource links (R-A-104).** May the advisor include website links? If the program is local and private, may it go online to check that a link is real before showing it?

---

## Conflicts between her words and ChatGPT's documents

1. **Whole conversations.** Her words: "Please lock this entire conversation in somewhere. I cannot lose any of it." (L17721). ChatGPT's 10-14 archive is "a comprehensive editorial reconstruction … not a verbatim platform conversation export" (A14-063), and so is the 10-15 one (A15-063). The spec's entity model has no conversation or session record (SP-054, flag F11), and the vision brief allows "Save the full conversation (or reliably export and reimport it)" (HV-034). Her request stands (R-A-054).
2. **Anthony "deadpan" / "dry".** The spec's sample-data description calls Anthony "the deadpan, button-pushing co-lead" (SP-110), and the 10-14 archive calls his delivery "confident, dry, deadpan" (A14-028). On 10-15 she said "You can't mention it that anthony is dry," and the 10-15 archive records that the bible's shorthand is "inadequate as a complete account" (A15-002). The spec predates her correction and must be updated (R-A-033).
3. **Francine's two arcs.** The spec says Francine's dual arc is "as contemplated" (SP-096). Her bible states it as "The Key Insight" and asks only for confirmation that she stays Flat on respect (SB-082 to SB-084). The spec understates her decision (R-A-065).
4. **Status model.** The spec's five states (SP-058 to SP-062) drop "Drafted and confirmed" (S1-164, accepted), the Questions/Ideas statuses (Open / Answered / No Longer Relevant; Considering / Adopted / Set Aside, S3-124, accepted), and the function/execution layer as anything more than a beat note. Earlier, ChatGPT's 10:14 restatement folded her "example" status into "working possibility" (S1-164, D6), and the posters merged Developing and Unanswered into one label (S4-032). Her bible's three-way distinction stands (R-A-023).
5. **AI and prose.** The spec lists "controlled, opt-in prose brainstorming" as an AI function (SP-173). Her decision is that the program "does not write the novel" (L3337). Not necessarily a contradiction if examples stay labeled and out of the manuscript, but it needs her ruling (Needs Yolanda 10).
6. **Chapter and page references.** ChatGPT first proposed verified chapter and page references (S2-034). She ruled: never a specific chapter or page (S2-049). ChatGPT's later eight-principle table dropped the clause (S2-138), and the spec contains no Craft Resource Advisor and no such rule at all. Her rule stands (R-A-103).
7. **Source hierarchy.** The spec puts the 10-13 Story Bible and "the subsequent character-development conversation" in one tier (SP-008, S6-112). After the AI used the bible's illustrative Kevin Lie, she required newer developed work to outrank older illustrative text (S7-136, L20960). ChatGPT then proposed a three-tier order with the 10-14 archive above the bible (S7-137); she did not answer it (her "Please do so" at L21090 answered the offer to develop Anthony). The 10-15 archive's scoping (A15-062) was never put to her. Only her rule stands (R-A-031).
8. **The five-dollar bill.** The Story Bible marks it "Decided" as the fish-guts distraction (SB-180, SB-183, SB-225). The story register treats the override as unconfirmed because it appears "only in a generated file." But her own words exist in the transcript: "FYI, the 'distracted by the five-dollar bill' is a concept for me. It may or may not be a $5 bill" (L8765, S3-146). Her later statement replaces the bible's status: the distraction is established, the bill is one candidate (R-A-025). The bible text should be updated or marked superseded.
9. **"Capture first, organize later" quoted as hers.** The spec presents it as her explicit request (SP-079). In the transcript it is ChatGPT's heading (S3-105, L8082); her own words are about getting everything out of her head and the two sections. The need is hers; the quotation is not.
10. **Pie and bar charts.** The spec says "this author dislikes" generic pie and bar charts (SP-184, S6-153). No statement of hers to that effect appears in the transcript sections. Treat as unconfirmed (Needs Yolanda 17).
11. **Product promise in her voice.** The vision brief's closing promise is written in the first person ("Help me discover my story …", HV-086) but is ChatGPT's wording, not hers. Her own mandate is "WRITE THE DAMN STORY" and "get things out of my head."
12. **Teach / Show / Hand it to me.** In her bible these structure her own material ("Hand it to me: a prompt that returns the work to her"). The spec turns them into AI modes and adds Critique (SP-179). That is an extension she has not reviewed (Needs Yolanda 12), not her decision.
13. **Questions under her label.** ChatGPT placed its own generated questions under her first-person label "QUESTIONS I HAVE" on the Act IIA poster (S4-109), attributing them to her. Her section is for her questions (R-A-029, R-A-047).
14. **Kevin's Lie.** On 10-15 ChatGPT proposed Kevin's Lie as "a refinement of the illustrative version in the Story Bible" (S7-130), ignoring the 10-14 archive. She rejected it (S7-136). Any document that carries the bible's illustrative Kevin Lie as current is wrong.

---

## Things ChatGPT's spec dropped

The spec and vision brief were written on the morning of 10-15. Items below existed before then and are missing or reduced. Omission does not cancel any of them.

**Authority and analysis**
- Her 10:14 decision that the program is editable: "If someone thinks of something that they had not defined yet, they can add it" (S1-016, L2387). Only specific custom cases survived in the spec. (R-A-109)
- The Craft Resource Advisor in full: resource suggestions (S2-027, her decision), the never-cite-chapters-or-pages rule (S2-049, her decision), concept-level pointing (S2-033), recommendation format (S2-057), resource provenance (S2-058), the Personal Craft Library (S2-036), and attaching a resource to a scene with a note (S2-041). (R-A-102 to R-A-105)
- The Authorial Intent Note (S2-038). (R-A-006)
- The Quiet / Advisory / Deep Analysis guidance settings with Quiet as the drafting default (S2-037). The spec keeps only "control how much guidance appears" (HV-069). (R-A-100)
- The three choices on a flagged concern: Examine, Explore possibilities, Find craft resources (S2-030). (R-A-101)
- "The program must be comfortable saying 'I don't know'" (S2-044) and the deterministic-versus-interpretive split (S2-018); four-kind labeling (S2-039) survives only as "source says X vs AI inferred Y". (R-A-003, R-A-004)
- "Don't re-ask what she has already answered" (S6-056) as a program behavior. (R-A-015)

**Statuses and canon**
- The "Drafted and confirmed" status (S1-164). (R-A-023, R-A-040)
- The Questions and Ideas statuses, including "Set Aside doesn't mean deleted" and reuse in another novel (S3-124). (R-A-050)
- Parent/child question chains (S3-122). (R-A-047)
- "Where might this fit?" from Explore Without Committing (S3-120); only "What would this affect?" survives. (R-A-051)
- "What was I thinking about?" (S3-126) survives only partly in the start-of-day questions. (R-A-053)
- A conversation or session entity in the data model (flag F11). (R-A-054)

**Characters**
- Never defaulting a character's race or identity in generated output, the "Not yet specified" display, the three identity levels, "no religious or cultural assumptions inferred from race", and the authenticity safeguard (S3-040, S3-044, S3-045, S3-086, S4-122). The spec keeps only "no auto-stereotyping, no invented biographical assumptions" (SP-105). (R-A-071, R-A-072)
- Most of Character Depth & Integrity Analysis: "consistent characterization does not require predictable behavior" (S3-079), agency tracking (S3-082), contradiction layers (S3-080), the Character Zoom trace-back (S3-085), depth judged relative to narrative importance (S3-084), "an incomplete profile is not an incomplete character" (S3-087). (R-A-073 to R-A-079)
- The Ingermanson Role field, the four-block Deep Character template, and filling main characters fully and supporting characters lightly (S1-055, S1-072, S4-062). (R-A-067, R-A-069)
- Forces of antagonism explicitly for every main character including the antagonist ("I Insisted On This, Rightly", S1-068). The spec has only generic "three-level antagonism" (SP-034). (R-A-068)
- Off-page theme music and per-novel playlists (S1-065, S1-105). (R-A-070)
- The five-dollar-bill distinctness test (S1-071, SB-179). (R-A-081)
- The general rule that habits belong to the right character (S6-089, her decision); the spec keeps only the notebook example (SP-252). (R-A-076)
- The bible's "Here's where I take over / Mine to write" reserved author slots as a standing rule beyond import (S4-064). (R-A-012)

**Story Brain**
- The Story Brain's operating principle ("Capture anything. Connect everything. Retrieve what matters. Return to writing.") and trust as the core requirement ("IT'S TRUST", S3-103). (R-A-043, R-A-018)
- Quiet resurfacing "Not twenty-seven reminders" and the dismiss-but-keep behavior (S3-108, S3-121) survive only as "gently resurface when pertinent". (R-A-052)

**Later decisions the spec predates (it must be updated, not merely corrected)**
- Anthony is not dry; the bible's description "really isn't accurate anymore" (S7-076, S7-108). (R-A-033)
- "Not yet / We will come to it" deferral of canon rewrites (S7-082). (R-A-028)
- No flattery: "Are you just blowing smoke…?" (S7-096). The brief has a weaker form (HV-010). (R-A-093)
- Her comparisons are qualities, not templates (S7-114). (R-A-087)
- No "Angry Black Man" trope; physical comedy expressive, not demeaning (S7-116, S7-119). (R-A-086)
- Her foil / mirror / double definitions and the name-swap test (S7-126, S7-128). (R-A-082)
- Newer character work outranks older illustrative bible text; the AI must check the latest work first (S7-136, S7-137). (R-A-031, R-A-095)
- "I only showed you one part in my head" (S7-100). (R-A-098)
- Her partial-reading habit, so unanswered proposals are not accepted (S8-004). (R-A-060)
- Character facts have a time dimension; Kevin's job loss is past, Anthony's is in the story (S8-046, S8-047). (R-A-083, R-A-085)
- "Most men ARE carrying far more than people realize" as a story-level guiding principle (S8-084). (R-A-086)
- The handoff must explain why each module exists, including Narrative Zoom (S8E-013). (R-A-091)
