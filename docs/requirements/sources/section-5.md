# Requirements Register — Section 5 (lines 12134–15061)

Source: `90955321-Story_Map_Planning_FULL_with_code.md`, 2026-10-14, 15:16 ET to 16:29 ET (plus Yolanda's 16:48 reply at 15062–15070, read past END because it answers the last proposal in this range).

## What happens in this section

The section opens in the middle of "Phase 1": producing ten large-format IDW story posters (wall posters at 48x36 and 60x45 inches, plus a letter-size desk reader). ChatGPT adds vector "clipart". Yolanda rejects it as "basic Clipart." ChatGPT then switches to a hybrid of illustration plus vector text, followed by AI-generated cinematic posters. Yolanda likes how these look but asks whether they are accurate. ChatGPT finds that Beat 12 is missing and the act labels are wrong. Yolanda asks for "100% accurate" and becomes frustrated by the repeated versions. ChatGPT apologizes and lays out a verification-first process, then builds a typeset master in which the text is verified but the artwork is low-resolution.

Yolanda then says this "would make the phase three program unusable." That leads to (a) data-integrity requirements for the Story Brain and (b) her own point: even if the story logic works, visual and print output would fail for the user. ChatGPT proposes a deterministic **Visual Story Mapping Engine**. Yolanda (at 15062, just past END) likes it, says it must look professional, and wants it as a separate later phase. Phase two should be "just the story system", and for now AI-rendered posters are acceptable to her.

Standing labels: DECIDED BY YOLANDA / ACCEPTED PROPOSAL / UNANSWERED PROPOSAL / POSSIBILITY / EXAMPLE / ILLUSTRATION / REJECTED.

---

## A. Phase 1 poster production: state at section start

**S5-001**
- Type: Process
- Statement: Phase 1 output set is ten poster concepts, each produced as vector-text PDF proofs at 48x36 in and 60x45 in. The ten are: Chronological Story Map (Master), Narrative Relationship Map, Story Command Center, Act I Companion, Act IIA Companion, Act IIB Companion, Act III Companion, Fish-Guts Sequence, Character Depth & Integrity, and McKee's Dramatic Gap. A US-Letter "Desk Reference Reader" reflows the proof text.
- Why: Gives her a "writing wall you can trust, not merely a collection of attractive decorations" (ChatGPT, 12130), plus a home-printable reading edition.
- Standing: ACCEPTED PROPOSAL. The set was established before this section; at 12136 Yolanda says "Please continue."
- Source: 12141–12198, 12316–12345 (15:16–15:17)
- Relationship: Possibly relates to an earlier decision that defined the ten posters (pre-section). This is a RESTATEMENT of the production state.

**S5-002**
- Type: Constraint
- Statement: Two print sizes are required for every wall poster: 48x36 inches and 60x45 inches. The desk reference is 11x8.5 landscape, reflowed rather than shrunk.
- Why: These are her intended printing dimensions. ChatGPT at 13754 says "We already know your intended printing dimensions."
- Standing: DECIDED BY YOLANDA. Set earlier and treated as given here.
- Source: 12240 (print_specs), 13675, 13785
- Relationship: Possibly relates to an earlier decision.

**S5-003**
- Type: Data model
- Statement: A "verified story foundation" JSON file (`verified_story_foundation_v1.json`) holds the story content in these structures:
  - title, source document, and source date;
  - `user_overrides`, holding the author's clarifications that supersede the bible;
  - an `established` list;
  - an `undecided` list;
  - a `beats` list, where each beat has number, name, position %, story_function, and decision_status;
  - `print_specs`.
- Why: Posters are generated from one verified data source instead of AI-generated lettering. This is an early embodiment of the "single source of truth" idea.
- Standing: UNANSWERED PROPOSAL. It is ChatGPT's implementation and Yolanda never commented on the structure. The principle behind it is later endorsed implicitly (see S5-086).
- Source: 12240, 13958–14238
- Relationship: An early form of S5-086 and S5-088.

**S5-004**
- Type: Data model
- Statement: Author clarifications are stored separately as "user_overrides" layered over the story bible, so a newer author statement beats an older bible line.
- Why: The bible (v5, 10-13-26) contains text she has since corrected, such as the five-dollar bill, race of the leads, and neighborhood diversity.
- Standing: UNANSWERED PROPOSAL. It is an implementation pattern, but it reflects her corrections.
- Source: 12240, 14529–14532
- Relationship: ADDS TO S5-003. The program should model the fact that later author clarifications override earlier documents.

**S5-005**
- Type: UI-UX
- Statement: Every beat card carries a "DECISION STATUS" box saying whether the content is established, developing, or undecided. Examples: "Opening staging undecided," "Exact midpoint NOT chosen," "Commitment established; staging open."
- Why: The maps must not imply that scenes are fully plotted when they are not. ChatGPT: "you're going to use these maps to guide your actual writing" (13504).
- Standing: ACCEPTED PROPOSAL. Yolanda never objected and kept asking for accuracy. ChatGPT at 13496 says the bible distinguishes decided, exploring, and still-to-determine.
- Source: 12297, 12963, 13490–13504, 14349
- Relationship: ADDS TO the earlier decision-status principle (pre-section).

**S5-006**
- Type: UI-UX
- Statement: Poster legend: "HOW TO READ THIS MAP — A beat is a structural function, not a commitment to an invented scene. Page positions are approximate."
- Why: Keeps readers (and the author) from mistaking framework placeholders for decisions.
- Standing: UNANSWERED PROPOSAL
- Source: 12267–12268, 12811
- Relationship: ADDS TO S5-005.

**S5-007**
- Type: Feature
- Statement: Beat cards show the percentage position plus approximate page landmarks for both a 250-page and a 300-page manuscript, for example "250-page: ~13 | 300-page: ~15." Beats without a single milestone show "Position guides; not fixed pages."
- Why: Lets her translate structure percentages into page targets for her planned book lengths.
- Standing: UNANSWERED PROPOSAL. Inherited from earlier and kept in later versions.
- Source: 12290–12293, 14269–14283, 14340
- Relationship: Possibly relates to an earlier decision about 250/300-page guides. In the final typeset version (14269–14283), page ranges were given for all 15 beats, for example Opening 1–3, Setup 1–25/1–30, and Finale 200–248/240–297.

**S5-008**
- Type: Story fact (IDW)
- Statement: The 15 Save the Cat beats with positions are: 1 Opening Image 0–1%; 2 Theme Stated ~5%; 3 Setup 1–10%; 4 Catalyst ~10%; 5 Debate 10–20%; 6 Break into Two ~20%; 7 B Story ~22%; 8 Fun and Games 20–50%; 9 Midpoint ~50%; 10 Bad Guys Close In 50–75%; 11 All Is Lost ~75%; 12 Dark Night of the Soul 75–80%; 13 Break into Three ~80%; 14 Finale 80–99%; 15 Final Image 99–100%.
- Why: This is the structural spine of the book. The bible: "Snyder's fifteen beats in order, placed by percentage of the manuscript (Brody's novel adaptation)."
- Standing: DECIDED BY YOLANDA. The bible line at 13323 says "This is the spine of the book."
- Source: 12223–12238, 13323
- Relationship: Possibly relates to an earlier decision.

**S5-009**
- Type: Story fact (IDW)
- Statement: The act divisions are:
  - Act I "Setup & Sparks": 0–20%, Beats 1–5.
  - Act IIA "Escalation": 20–50%, Beats 6–8.
  - Act IIB "Pressure & Reveal": 50–80%, Beats 9–12.
  - Act III "Connection": 80–100%, Beats 13–15.
- Why: Gives each poster a consistent four-band structure. ChatGPT: "The correct divisions are…"
- Standing: ACCEPTED PROPOSAL. Act names were proposed by ChatGPT and never objected to; the percentages follow Save the Cat.
- Source: 12239, 13449–13456, 14325, 14536
- Relationship: The act labels were later mispositioned in an AI image (see S5-052).

**S5-010**
- Type: Principle
- Statement: Overlapping beat ranges (Setup 1–10% versus Theme Stated ~5%) are normal planning conventions and do not mean two different chronological moments.
- Why: Prevents a false "error" reading of the chronology.
- Standing: UNANSWERED PROPOSAL. This is a ChatGPT editorial note.
- Source: 14549–14550
- Relationship: ADDS TO S5-008. The program's chronology checks should tolerate framework overlap.

---

## B. IDW story facts as carried in this section

These come from the verified foundation, the poster footers, and bible paragraphs that ChatGPT printed at 13295–13377.

**S5-011**
- Type: Story fact (IDW)
- Statement: All three leads (Kevin Wickley, Anthony Vernon, Miss Francine Ellington) are African American.
- Why: Her explicit clarification.
- Standing: DECIDED BY YOLANDA. It is listed as a "user override."
- Source: 12240, 12304, 12325
- Relationship: Possibly relates to an earlier decision made before this section.

**S5-012**
- Type: Story fact (IDW)
- Statement: The neighborhood is racially diverse.
- Why: Her clarification.
- Standing: DECIDED BY YOLANDA. It is a user override.
- Source: 12240, 12304
- Relationship: Same as S5-011.

**S5-013**
- Type: Story fact (IDW)
- Statement: Kevin Wickley and Anthony Vernon are co-leads in the visible neighborhood feud (the A story).
- Why: This is the core premise.
- Standing: DECIDED BY YOLANDA. The bible marks it "Decided."
- Source: 12240, 13356
- Relationship: —

**S5-014**
- Type: Story fact (IDW)
- Statement: Miss Francine Ellington secretly orchestrates the feud in response to the men's dogs repeatedly damaging her garden. She is the "one hidden instigator." The garden is the emotional center: "the one thing that is truly Francine's, and the men's dogs destroying it is the true cause."
- Why: This is the premise and the misdirection engine.
- Standing: DECIDED BY YOLANDA. Bible 13356: "Decided. The story is a neighborhood comedy, two houses in a feud with a third across the street."
- Source: 12240, 13321, 13356
- Relationship: —

**S5-015**
- Type: Story fact (IDW)
- Statement: Kevin and Anthony narrate in alternating first-person POV, one head per scene or chapter. Change heads "only at a seam, never inside a scene."
- Why: Two feuding narrators let the reader hold more than either man does. Head-hopping would destroy trust in the misdirection.
- Standing: DECIDED BY YOLANDA. Bible 13346 and 13352.
- Source: 12240, 13343–13346, 13352
- Relationship: The bible line at 13346 reads "Kevin narrates in first person, and the point of view alternates between Kevin and Anthony." The program should note the "one head per scene" rule as a checkable constraint.

**S5-016**
- Type: Story fact (IDW)
- Statement: Francine's POV and interior are withheld until the reveal (ledger reveal). The secret-keeper stays outside POV "until I am ready to reveal them."
- Why: So her cunning "lands like a thunderclap."
- Standing: DECIDED BY YOLANDA. Bible 13340 and 13346.
- Source: 12240, 13340, 13346
- Relationship: See open question S5-017.

**S5-017**
- Type: Story fact (IDW), open question
- Statement: When exactly Francine's POV first opens, at the reveal or just after, is undecided: "Mine to time."
- Why: —
- Standing: POSSIBILITY / open (bible "My move")
- Source: 13347, 13363
- Relationship: ADDS TO S5-016. Note that posters say "until near the reveal," which is slightly looser than the bible.

**S5-018**
- Type: Story fact (IDW)
- Statement: Fish-guts sequence:
  - Francine places raw fish guts in Anthony's yard while both men are distracted.
  - The smell comes first, and Anthony cannot place it.
  - About half a day later the animals arrive: cats, then raccoons.
  - Anthony blames Kevin, and Kevin truthfully denies it.
- Why: The bible says it works because of a "Delayed payoff… Escalate the reaction, not the event."
- Standing: DECIDED BY YOLANDA. Bible 13335 and 13336.
- Source: 12240, 12305, 13335–13336, 13466–13470
- Relationship: —

**S5-019**
- Type: Story fact (IDW)
- Statement: The distraction that gives Francine her opening is established, but its mechanism is UNDECIDED. The five-dollar bill is "only a candidate, not canon."
- Why: Her clarification overrides the bible.
- Standing: DECIDED BY YOLANDA (as a user override)
- Source: 12240, 12305, 12326, 14359
- Relationship: REPLACES the bible text at 13335 ("Decided. While the men are distracted (the five-dollar bill)…"). Yolanda changed this before this section; it is captured here as a user override.

**S5-020**
- Type: Story fact (IDW), open question
- Statement: Still open: the exact staging of the fish-guts sequence, how much of Francine the reader sees doing it, and how the brawl plays out.
- Why: "Mine to choreograph."
- Standing: POSSIBILITY / open
- Source: 13337, 13362
- Relationship: ADDS TO S5-018.

**S5-021**
- Type: Story fact (IDW)
- Statement: The ledger is DISCOVERED near All Is Lost (~75%) and WIELDED in the Finale. These are separate dramatic functions. "Finding is not winning."
- Why: The bible says a discovery is information (a gut-punch) and a win is an action. The men need "one real card against a woman they could never out-think."
- Standing: DECIDED BY YOLANDA. Bible 13299–13300 and 13371–13372.
- Source: 12240, 12306, 13298–13300
- Relationship: —

**S5-022**
- Type: Story fact (IDW)
- Statement: Francine's ledger is an in-world garden journal where she tallies what she has done. Her compulsion to document is "her one crack." It must be planted early in plain sight, and it is also how the reveal is delivered: the men, with the reader over their shoulder, read her mind via the ledger instead of a POV break.
- Why: It solves the ending without making her dumb or the men suddenly clever, and it preserves the POV rule.
- Standing: DECIDED BY YOLANDA. Bible 13370: "Decided: The Ledger Gets Found… it is now a decision."
- Source: 13370–13375
- Relationship: ADDS TO S5-021.

**S5-023**
- Type: Story fact (IDW)
- Statement: In the Finale the men wield the ledger for one genuine win, and Francine still wins the larger game, warmly.
- Why: Preserves her genius.
- Standing: DECIDED BY YOLANDA (bible 13300)
- Source: 12238, 14282
- Relationship: ADDS TO S5-021.

**S5-024**
- Type: Story fact (IDW)
- Statement: The Confession is a quiet emotional scene in Dark Night of the Soul. Kevin and Anthony begin real friendship, and no one says the word "lonely." Busy hands and deflecting jokes carry the feeling.
- Why: "The one rule: no one says the word."
- Standing: DECIDED BY YOLANDA. Bible 13341: "Write the Confession in my own voice."
- Source: 12240, 12236, 13341, 13431
- Relationship: —

**S5-025**
- Type: Story fact (IDW)
- Statement: The Opening and Final Images mirror each other in how Francine and her garden are treated: overlooked at the start, "finally seen" at the end. Opening image possibility from the bible: Kevin polishing the car he doesn't trust, Anthony amused, Francine "barely noticed."
- Why: Proves change.
- Standing: DECIDED BY YOLANDA for the mirror concept. The specific opening image is a POSSIBILITY (bible 13329: "One way I could play it, not a decision yet").
- Source: 12240, 13327–13329
- Relationship: —

**S5-026**
- Type: Story fact (IDW)
- Statement: Undecided items:
  - the Catalyst event;
  - the Midpoint event and its false-victory/false-defeat polarity;
  - exact moral premise wording;
  - town and season;
  - dog details;
  - ancillary cast;
  - exact prank sequence and scene-level outcomes;
  - the Break into Three plan;
  - exact Finale tactics;
  - final image staging.
- Why: Accurately listing these as undecided "is the correct result" (S5-071).
- Standing: DECIDED BY YOLANDA that these remain open
- Source: 12240, 13979–13986, 13357–13363
- Relationship: —

**S5-027**
- Type: Story fact (IDW), possibility
- Statement: Theme Stated possibility: someone (maybe the wife, maybe Francine, maybe a throwaway line) says "You two are so busy watching each other you don't see what's right in front of you," and Kevin waves it off. The theme is respect, being seen, and connection.
- Why: —
- Standing: POSSIBILITY. The theme direction is established, the line is undecided.
- Source: 13330, 12225
- Relationship: —

**S5-028**
- Type: Story fact (IDW), possibility
- Statement: Catalyst possibility: the garden is destroyed one time too many, and Francine invisibly engineers an incident that reads to Kevin as Anthony's opening move.
- Why: —
- Standing: POSSIBILITY. The beat is "undecided" on the posters.
- Source: 13332
- Relationship: —

**S5-029**
- Type: Story fact (IDW)
- Statement: Kevin is paranoid and self-important, a devoted Stephen King fan who half-believes his car is cursed ("a real-life Christine").
- Why: —
- Standing: DECIDED BY YOLANDA (bible 13304 "Decided.")
- Source: 13304
- Relationship: DIFFERENT SUBJECT FROM the AI poster tagline "Observant. Anxious. Comic narrator." (S5-058), which is invented.

**S5-030**
- Type: Story fact (IDW), possibility
- Statement: Kevin's value is respect. The war drives him from disrespect to humiliation. His forces of antagonism: inner (paranoia, pride), plus others. Concrete goal: win the war, prove Anthony is sabotaging him, be publicly vindicated. Ambition: to be taken seriously.
- Why: —
- Standing: POSSIBILITY ("One way I could play it, not a decision yet")
- Source: 13305, 13307
- Relationship: —

**S5-031**
- Type: Story fact (IDW), possibility
- Statement: Anthony's value is also respect, "but he pretends not to need it." Forces: detachment and pride, and Kevin's relentlessness.
- Why: —
- Standing: POSSIBILITY
- Source: 13308
- Relationship: DIFFERENT SUBJECT FROM S5-030.

**S5-032**
- Type: Story fact (IDW), possibility
- Statement: Francine is a Flat Arc on respect (she knows the truth and changes others) and a change arc on the loneliness axis. Possible Lie: "I am done, overlooked, and there is nothing left for me but to fade quietly." Possible Ghost: widowhood or displacement. Her three values in tension: dignity, her garden, not being alone.
- Why: The dual nature makes her "larger than a normal antagonist."
- Standing: POSSIBILITY. Bible 13312: "Decide Francine's Lie and Truth… Mine to settle."
- Source: 13310–13313, 13357
- Relationship: —

**S5-033**
- Type: Principle (craft)
- Statement: Every main character, Francine included, needs forces of antagonism on their own primary value at all three levels (inner, personal, extra-personal), "or her arc is not earned."
- Why: "If nothing threatens her aliveness, she is a plot device with a feeling."
- Standing: DECIDED BY YOLANDA. The bible heading reads "The Forces Against Francine (I Insisted On This, Rightly)."
- Source: 13314–13317, 13358
- Relationship: The program should prompt for forces of antagonism per main character.

**S5-034**
- Type: Story fact (IDW)
- Statement: Francine's family love her but see her as fragile, and they notice her spark return late in the book; this is the visible evidence of her loneliness arc. Names and identities are open.
- Why: —
- Standing: DECIDED BY YOLANDA "in spirit"; specifics are open.
- Source: 13320
- Relationship: —

**S5-035**
- Type: Story fact (IDW)
- Statement: The block-party pie scene:
  - Everyone brings food.
  - A wife is present. She is an innocent, not Francine's daughter, and Yolanda pictures Octavia Spencer for her.
  - The comedy turns on the reader being in on something about the pie that the eaters are not.
  - Open: the wife's name and connection, and the pie mechanics.
  - It is "one of my most important scenes."
- Why: Reader complicity.
- Standing: DECIDED BY YOLANDA for the frame; the mechanics are open.
- Source: 13319, 13338–13339, 13361
- Relationship: —

**S5-036**
- Type: Story fact (IDW)
- Statement: Both men's dogs ruin Francine's garden. The dogs' names and personalities, and whether they become characters, are open ("a comic goldmine").
- Why: —
- Standing: DECIDED BY YOLANDA for the cause; specifics are open.
- Source: 13321
- Relationship: —

**S5-037**
- Type: Story fact (IDW)
- Statement: Francine's theme music is big band jazz, Ray Charles's "Let the Good Times Roll," over her trickster and awakening scenes.
- Why: It is ironic, and it scores her loneliness-to-aliveness arc.
- Standing: DECIDED BY YOLANDA (bible 13355)
- Source: 13355
- Relationship: —

**S5-038**
- Type: Story fact (IDW)
- Statement: Casting "tuning forks": Kevin Hart as Kevin Wickley, Anthony Anderson as Anthony Vernon, and Phylicia Rashad as Miss Francine Ellington (cast against type as part of the misdirection). They guide the voices and "never app…" (truncated in the source).
- Why: Voice guidance.
- Standing: DECIDED BY YOLANDA (bible 13364)
- Source: 13364
- Relationship: Relevant to S5-061. Character illustrations are not canon.

**S5-039**
- Type: Story fact (IDW)
- Statement: Cover concept: Kevin and Anthony mid-feud in the foreground (one in a headlock); in the background, Francine in her garden looking over her shoulder with a small, mischievous expression.
- Why: "The cover is the promise of the premise in one image."
- Standing: DECIDED BY YOLANDA (bible 13365)
- Source: 13365
- Relationship: —

**S5-040**
- Type: Story fact (IDW), possibility
- Statement: Craft devices under consideration:
  - "In Which…" comic chapter titles (Fielding, Dickens, Gaiman), which can carry dramatic irony.
  - Direct reader address in a porch-storyteller voice (Gaiman, *Anansi Boys*). Whether to use it at all, and whose voice it would be, is open.
- Why: Voice and irony; seeding Francine in plain sight.
- Standing: POSSIBILITY
- Source: 13348–13352
- Relationship: —

**S5-041**
- Type: Principle (craft, IDW)
- Statement: Tone rule: keep the tone light enough to protect the tenderness. When a scene gets real, let a joke carry it. Failure modes: too jokey (nothing lands) or too heavy. "Mine to maintain across the whole book."
- Why: —
- Standing: DECIDED BY YOLANDA (bible 13353–13354)
- Source: 13353–13354
- Relationship: —

**S5-042**
- Type: Data model (operational records)
- Statement: The bible's operational layer has three records:
  - **Francine's Ledger: The Secret Operations Log**, a private chronological list of every hidden thing Francine does, the true cause behind each mysterious effect.
  - A **clue ledger** recording each on-camera clue, where it sits, what it secretly means, and where it pays off.
  - A **suspicion curve** showing what the reader may suspect about Francine at each stage, beside what Kevin and Anthony each know.
- Why: "A hidden-truth book needs these more than any other kind, because I am the only person holding" the truth. Without them she'd lose track of who caused what.
- Standing: DECIDED BY YOLANDA (bible 13366–13377)
- Source: 13366–13369, 13376–13377
- Relationship: Strong implication for the program: it needs hidden-cause, clue/payoff, and reader-knowledge tracking per character. This is a general feature, not IDW-only.

**S5-043**
- Type: Process (craft, framework use)
- Statement: The bible names each beat in multiple frameworks because "they are all the same turns": Snyder/Brody beats, Weiland plot points (First Plot Point = Break into Two; Midpoint = Moment of Truth), Swain/Ingermanson "three disasters" (Disaster 1 = Break into Two, Disaster 2 near Midpoint, Disaster 3 near All Is Lost), and the Moral Premise (Williams). It also uses her own Save the Cat wall-board template, which "I reserve the right to modify."
- Why: Cross-framework alignment.
- Standing: DECIDED BY YOLANDA (bible content)
- Source: 13296–13297, 13323
- Relationship: The program should map one beat to several framework names.

**S5-044**
- Type: Principle (craft)
- Statement: Moral Premise usage: characters start the book living the false half of the premise. At disaster two (near the Midpoint) they flip to the true half, and the back half proves it. Working possibility: "contempt and going it alone lead to an endless, humiliating war, but seeing others and letting them in lead to peace and belonging."
- Why: —
- Standing: DECIDED BY YOLANDA for the mechanism. The wording is a POSSIBILITY, and the exact wording is undecided.
- Source: 13301–13303, 12240
- Relationship: —

**S5-045**
- Type: Process (craft)
- Statement: Ingermanson: not every character needs every field. Fill the main characters fully and give the supporting players less. The character bible has four blocks, with the psychological block the richest.
- Why: Avoid busywork, but don't shortchange the "villain."
- Standing: DECIDED BY YOLANDA (bible)
- Source: 13318, 13322
- Relationship: The program's character sheets should allow partial fill by importance.

**S5-046**
- Type: Process (work habit)
- Statement: Bible advice for low-energy days: "open a character sheet (Part 2) and fill in one blank line about Kevin, Anthony, or Francine. Getting to know them is drafting."
- Why: Small-entry momentum.
- Standing: DECIDED BY YOLANDA (bible)
- Source: 13295
- Relationship: Relevant to any "return to writing" or low-energy entry point.

**S5-047**
- Type: Principle (craft, McKee)
- Statement: McKee lens on the posters: intention → action → expectation/result gap → changed value → new decision → complication.
- Why: Describes the causal engine of scenes.
- Standing: UNANSWERED PROPOSAL (ChatGPT phrasing of the McKee Gap poster)
- Source: 12307
- Relationship: Possibly relates to earlier McKee decisions.

---

## C. Visual direction for the posters

**S5-048**
- Type: UI-UX
- Statement: Vector chronological poster styling: deep purple header (#2B1438), gold (#D8B34C), cream background (#FFFCF4), act bands in lavender, pink, blue, and gold, numbered circular beat badges, and a "NON-NEGOTIABLE STORY CONTINUITY" footer.
- Why: Visual hierarchy.
- Standing: UNANSWERED PROPOSAL. Never commented on directly; superseded by S5-050 in illustration terms.
- Source: 12254–12310
- Relationship: The purple/gold/cream palette persists through all versions.

**S5-049**
- Type: Not wanted
- Statement: Simple vector "clipart" illustrations (little houses, flower stems, ledger icons, figure blobs) are rejected: "I do not like it because it looks like basic Clipart."
- Why: It lacks the personality of the original posters. ChatGPT: "feels like a corporate presentation with a few decorative icons."
- Standing: REJECTED (Yolanda, 15:21)
- Source: 12363–12419, 12521–12523
- Relationship: REPLACES the vector-illustration approach of 12484–12517.

**S5-050**
- Type: Principle / UI-UX
- Statement: Preserve the original illustrated aesthetic. That means:
  - rich, expressive character illustrations;
  - a recognizable neighborhood (houses, gardens, porches, fences, residents);
  - cinematic lighting and depth (warm evening colors);
  - sophisticated decorative details (flowers reinforcing Francine's garden);
  - storytelling within the illustrations.

  "We're changing the production technique, not lowering the aesthetic standard."
- Why: These qualities "made the earlier posters special."
- Standing: ACCEPTED PROPOSAL. At 12636 Yolanda says "Thank you for understanding the problem. Please continue."
- Source: 12558–12570, 12630
- Relationship: ADDS TO S5-049.

**S5-051**
- Type: Feature (architecture)
- Statement: Three-layer hybrid poster construction:
  - Layer 1: high-resolution illustrated artwork.
  - Layer 2: vector text and diagrams (beats, percentages, page numbers, McKee relationships, arrows).
  - Layer 3: editable information (decisions, developing ideas, unanswered questions) so posters update without full recreation.

  "Illustrations provide the personality. Vector typography provides the precision. Story-data foundation protects the accuracy."
- Why: Large-format print resolution, reliable text, and updatability.
- Standing: ACCEPTED PROPOSAL (12636)
- Source: 12572–12594
- Relationship: An early form of S5-102 (separate content from decoration).

**S5-052**
- Type: UI-UX
- Statement: Rich cinematic illustrations serve as focal points, supported by calm, carefully organized information panels. The goal is a "sophisticated illustrated storytelling atlas rather than classroom infographic." The artwork should direct attention, not compete with the information.
- Why: She loved the richness, but ChatGPT notes "you've also told me that excessive visual stimulation can become distracting."
- Standing: ACCEPTED PROPOSAL (12636)
- Source: 12596–12608, 13099
- Relationship: Possibly relates to an earlier statement by Yolanda about overstimulation (pre-section). This is a restatement of that preference.

**S5-053**
- Type: Process
- Statement: Get one poster (the Chronological Story Map) "right," not merely acceptable, before applying the approach to all ten.
- Why: Avoid propagating a wrong design.
- Standing: ACCEPTED PROPOSAL (12636)
- Source: 12618–12622
- Relationship: —

**S5-054**
- Type: Principle
- Statement: "You shouldn't have to choose between the beauty of the originals and the accuracy of the new versions. You should have both." The goal: "beautiful enough to display, accurate enough to trust, and practical enough to help you write."
- Why: These are her success criteria for any visual output.
- Standing: ACCEPTED PROPOSAL. Consistent with all of her feedback.
- Source: 12624–12626, 13101
- Relationship: An acceptance criterion for S5-104.

**S5-055**
- Type: UI-UX
- Statement: The cinematic concept proof has a hero triptych of character portraits (Kevin, Anthony, Francine) at the top, a title plate, the banner "THREE AFRICAN AMERICAN LEADS • ONE DIVERSE NEIGHBORHOOD • ONE HIDDEN INSTIGATOR," and beat cards each with a thumbnail illustration, description, and Decision Status box. The footer reads "STORY INTEGRITY / WHAT MUST NOT GET LOST."
- Why: Restores personality.
- Standing: ACCEPTED PROPOSAL. At 13107 Yolanda says "This is much better."
- Source: 12872–12981, 13073–13101
- Relationship: REPLACES S5-048's illustration approach.

**S5-056**
- Type: Not wanted / Constraint
- Statement: Images must not be cropped out of frame: "a lot of the images are out of the frame." The later typeset build places artwork "contained, never distorted and never cropped."
- Why: Cropped faces and scenes look broken.
- Standing: DECIDED BY YOLANDA (15:32 complaint)
- Source: 13105–13107, 14303–14306
- Relationship: Feeds the preflight check "Is any image cropped badly?" (S5-107).

**S5-057**
- Type: Scenario
- Statement: Yolanda's visual preference wins on the AI-generated cinematic poster ("Visually, of course I love this better"), but she immediately questions accuracy: "but is it accurate? I haven't fully checked."
- Why: Beauty alone is insufficient. She expects the tool to verify, and she should not have to.
- Standing: DECIDED BY YOLANDA
- Source: 13170–13172
- Relationship: Leads to S5-065 and S5-068.

**S5-058**
- Type: EXAMPLE / ILLUSTRATION (not canon)
- Statement: The AI-generated poster invented content:
  - "A comedic novel by Yolanda Allen."
  - "THREE NEIGHBORS. ONE STREET. A MUCH BIGGER STORY."
  - Kevin: "Observant. Anxious. Comic narrator."
  - Anthony: "Confident. Unbothered. Always has a plan."
  - Francine: "Wise. Unstoppable. The heart of the block."
  - An orange tabby cat, kids, a "UNITY" shirt.
  - Signs reading "SAME STREET DIFFERENT PEOPLE" and "A BRIGHTER TOMORROW."
  - Premise text calling it a "driveway-and-neighborhood war."
  - A "STORYWORLD" panel: "Miss Francine lives across the street."
  - A "Structural Lens" panel listing "Scene/Sequel engine."
  - Visual details: Anthony in sunglasses, Kevin in a blue hoodie, Francine in an orange headwrap with gold hoops, dogs, a raccoon at Midpoint, a tipped pot at Midpoint.
- Why: These are generated imagery and lettering, never decisions.
- Standing: EXAMPLE / ILLUSTRATION
- Source: 13116–13157, 13555–13595
- Relationship: These must NOT be loaded as IDW data. Exception: "across the street" matches bible 13356 ("a third across the street"). The Midpoint thumbnails (tipped pot, raccoon) imply an event even though the Midpoint is undecided, which is a distortion.

**S5-059**
- Type: Not wanted
- Statement: The AI-generated poster's garbled footer text ("the smell emerges and acts, then recedes, arrive later") and its "Both sides operate in alternating first-person" are distortions of established facts.
- Why: Image generation corrupts text.
- Standing: REJECTED (ChatGPT flags it; Yolanda demands accuracy)
- Source: 13153–13154, 13472–13474
- Relationship: RESTATEMENT of S5-018 and S5-015, distorted.

---

## D. Accuracy review and failure analysis

**S5-060**
- Type: Scenario / acceptance test
- Statement: ChatGPT's accuracy review of the AI poster found:
  - leads, diverse neighborhood, premise, alternating POV, Theme ~5%, Catalyst undecided, Midpoint unresolved, ledger discovery/use split, and Final Image are accurate;
  - **Beat 12 Dark Night of the Soul is missing** (the sequence jumps 11→13);
  - **act labels are mispositioned** (Act IIB over part of Act I);
  - the footer is garbled;
  - it is not print ready.
- Why: Losing Beat 12 loses the Confession, "one of the most emotionally important scenes in the entire novel."
- Standing: ACCEPTED PROPOSAL. At 13538 Yolanda says "Ok make it 100% accurate."
- Source: 13391–13534
- Relationship: An acceptance test for the program: all 15 beats must exist after any edit or export.

**S5-061**
- Type: Principle
- Statement: Character portraits are labeled "representative character illustrations," not canon, until the author establishes physical characteristics. "This prevents an illustration from becoming an accidental character-design decision." The typeset footnote reads: "Illustrations are representative, not character canon."
- Why: Generated visuals can silently become decisions.
- Standing: UNANSWERED PROPOSAL. Yolanda didn't respond specifically, but it is consistent with her accuracy demands.
- Source: 13476–13486, 14365, 14547–14548
- Relationship: ADDS TO S5-088 (known versus inferred). A general program rule: generated imagery never writes to canon.

**S5-062**
- Type: Principle
- Statement: Posters must not inadvertently imply scenes are fully plotted. Story-beat captions are "concise paraphrases of established functions, not an adopted complete scene-by-scene outline. Unchosen events remain unchosen."
- Why: "You're going to use these maps to guide your actual writing."
- Standing: ACCEPTED PROPOSAL
- Source: 13498–13504, 14545–14546
- Relationship: ADDS TO S5-005.

**S5-063**
- Type: Principle
- Statement: "This isn't merely a poster illustrating Save the Cat. It's a map of YOUR novel. The structure must be correct, but so must the meaning of every event within that structure."
- Why: Framework fidelity and story fidelity are both required.
- Standing: UNANSWERED PROPOSAL (ChatGPT statement, consistent with her)
- Source: 13528–13530
- Relationship: —

**S5-064**
- Type: Constraint (Yolanda)
- Statement: "Ok make it 100% accurate."
- Why: —
- Standing: DECIDED BY YOLANDA (15:38)
- Source: 13538
- Relationship: —

**S5-065**
- Type: Scenario
- Statement: After a second AI-generated poster, Yolanda asks: "And this 100% accurate and print ready?" ChatGPT answers no. The poster is 1448x1086 px, far too low for 48x36 or 60x45 with fine text, and it is uncertified because no line-by-line editorial pass was done.
- Why: An honest status was required.
- Standing: DECIDED BY YOLANDA (her criterion); the ChatGPT answer is a statement of fact.
- Source: 13608–13654
- Relationship: —

**S5-066**
- Type: Process / acceptance test
- Statement: To be called "100% accurate," every one of the following must be verified against the story bible:
  - every beat description;
  - every decision status;
  - every page or percentage reference;
  - every footer statement;
  - every claim about Kevin, Anthony, and Francine;
  - that every unresolved item stays unresolved.
- Why: Defines a certification pass.
- Standing: UNANSWERED PROPOSAL. Folded into the process she approved at 13799.
- Source: 13656–13666
- Relationship: ADDS TO S5-064.

**S5-067**
- Type: Constraint / acceptance test
- Statement: To be "print ready" a poster needs:
  - vector text;
  - a properly typeset layout;
  - high-resolution or purpose-made artwork;
  - large-format print PDFs;
  - a final proof at 48x36 and 60x45.

  Other gaps not yet cleared: printer CMYK/bleed specs, color profile, substrate, fine-text legibility at distance, and a proof print with the actual vendor.
- Why: Large-format printing.
- Standing: UNANSWERED PROPOSAL (accepted implicitly)
- Source: 13668–13675, 12321, 14552–14559
- Relationship: —

**S5-068**
- Type: Not wanted (frustration)
- Statement: "Look, I keep asking you or a person that is one hundred percent accurate. I don't want to have to keep creating versions, because what is the point? Why are you creating things that are not accurate?"
- Why: Endless iterations and inaccurate outputs waste her time and erode trust.
- Standing: DECIDED BY YOLANDA (15:47)
- Source: 13696–13698
- Relationship: The core motivation for S5-086 through S5-110. "or a person" is likely voice-to-text for "for a poster."

**S5-069**
- Type: Principle (failure analysis)
- Statement: ChatGPT's admitted failure modes:
  1. Prioritizing appearance over accuracy.
  2. Treating corrections as isolated fixes, so new versions introduced new errors ("Fixing Beat 12… shouldn't risk changing the wording of Beat 9").
  3. Making the author do QA the tool should do.
  4. Confusing progress with a finished product.
- Why: The program must avoid all four.
- Standing: ACCEPTED PROPOSAL. Yolanda at 13799: "Please do so."
- Source: 13714–13748
- Relationship: —

**S5-070**
- Type: Principle
- Statement: The author reviews for creative decisions, not for errors. "You should not have to inspect every poster to discover whether I've omitted a beat, invented a character motivation, or incorrectly represented an established plot point. That's my responsibility."
- Why: The author's job is authorship, not QA.
- Standing: ACCEPTED PROPOSAL (13799)
- Source: 13734–13740
- Relationship: REPEATED in S5-097 (must work "without you manually reviewing every field").

**S5-071**
- Type: Process
- Statement: Verification-first production process:
  1. Extract and verify content directly against the story bible.
  2. Establish which statements are confirmed, developing, or unresolved.
  3. Construct with reliable layout tools that reproduce the approved text precisely.
  4. Incorporate artwork without letting image generation rewrite the information.
  5. Independently check the complete file for accuracy, legibility, resolution, and dimensions.
  6. Present the finished product with an honest account of anything not verified.
- Why: Stop "the cycle of generating new posters and asking you to approve them."
- Standing: ACCEPTED PROPOSAL. Yolanda at 13799: "Please do so."
- Source: 13750–13765
- Relationship: —

**S5-072**
- Type: Principle
- Statement: "I can verify that a poster faithfully represents your story bible. I cannot declare an undecided story detail correct by inventing an answer. When something remains undecided, accurately identifying it as undecided *is* the correct result."
- Why: Accuracy means fidelity to decisions, including fidelity to open questions.
- Standing: ACCEPTED PROPOSAL (13799)
- Source: 13767–13771
- Relationship: —

**S5-073**
- Type: Principle
- Statement: "I don't need another creative brief from you." The bible, her visual preferences, and the print dimensions are already known. The tool should not keep asking for information it already has.
- Why: Repeated asking is part of her frustration.
- Standing: ACCEPTED PROPOSAL
- Source: 13754–13756
- Relationship: —

**S5-074**
- Type: Acceptance criterion
- Statement: What should have been delivered:
  - one beautiful, professionally typeset Chronological Story Map;
  - all fifteen beats;
  - every established detail faithfully represented;
  - every unresolved detail identified;
  - the cinematic artwork she loved;
  - two PDFs meeting the technical requirements at 48x36 and 60x45.

  "Not fifteen attempts."
- Why: —
- Standing: ACCEPTED PROPOSAL
- Source: 13773–13787
- Relationship: —

**S5-075**
- Type: Principle
- Statement: "I won't ask you to trust another attractive image simply because it looks finished. The next version needs to be the result of actual verification and production work, not another experiment with image generation."
- Why: —
- Standing: ACCEPTED PROPOSAL (13799)
- Source: 13793–13795
- Relationship: Later partially softened by Yolanda for Phase 1 (S5-112).

**S5-076**
- Type: Feature (generated code behavior)
- Statement: The typeset master build includes automated assertions: exactly 15 beats numbered 1–15; every beat name present in the selectable PDF text; "DECISION STATUS," "250 pp," "300 pp," the fish-guts note, and "Ledger DISCOVERED" present; page dimensions checked; description lines ≤7 and status lines ≤2 per card (to catch overflow). It writes a technical check JSON.
- Why: Automated structural validation instead of eyeballing.
- Standing: UNANSWERED PROPOSAL (implementation)
- Source: 14284, 14346, 14351, 14368–14381, 14534–14542
- Relationship: An early instance of S5-095 and S5-107.

**S5-077**
- Type: Story fact (IDW), typeset wording
- Statement: Final verified beat captions (typeset master):
  1. "Show the pre-war neighborhood. Francine and her garden are overlooked."
  2. "Plant the thematic question of respect, visibility, and connection."
  3. "Establish Kevin, Anthony, Francine, the dogs, the garden, and their neighborhood."
  4. "A triggering incident sparks the feud."
  5. "Suspicion and retaliation push the men toward an open war."
  6. "The men commit to the escalating neighborhood prank war."
  7. "Francine's concealed operations and awakening run beneath the A-story feud."
  8. "Comic escalation includes the fish-guts incident and other set pieces."
  9. "A major reversal changes the game; false win or false loss is possible."
  10. "External opposition and internal vulnerabilities tighten the pressure."
  11. "The men discover Francine's ledger and learn they were played."
  12. "The quiet Confession begins real friendship; neither says 'lonely.'"
  13. "The A story and Francine's hidden B story converge to enable a new approach."
  14. "The men WIELD the ledger for one genuine win; Francine still wins warmly."
  15. "Mirror the opening: Francine and her garden are finally seen and connected."
- Why: Concise paraphrases of established functions.
- Standing: UNANSWERED PROPOSAL. Yolanda never approved the wording.
- Source: 14268–14283
- Relationship: RESTATEMENT of S5-008 and S5-021 through S5-025. The Beat 6 wording drifted (see S5-078).

**S5-078**
- Type: Story fact (IDW), UNCLEAR
- Statement: Break into Two: the v1 foundation says "Kevin commits to fully engaging in the prank war." The cinematic and typeset versions say "The two men commit."
- Why: —
- Standing: UNCLEAR
- Source: 12231, 12902, 14274
- Relationship: UNCLEAR. A ChatGPT restatement changed the subject from Kevin to both men without a Yolanda decision. Check against the bible.

**S5-079**
- Type: Story fact (IDW), UNCLEAR
- Statement: B Story: in v1 it is "Francine's hidden thread of visibility, agency, and respect." In the typeset version it is "Francine's concealed operations and awakening." The bible frames her change as loneliness to aliveness, with respect Flat.
- Why: —
- Standing: UNCLEAR
- Source: 12230, 14275
- Relationship: The wording drifted between ChatGPT versions. Not a Yolanda decision.

**S5-080**
- Type: Constraint
- Statement: Upscaling is not acceptable as a fix for low-resolution art. "No upscaling process can reliably restore missing picture information." "I won't disguise that limitation by artificially enlarging them and calling the result print-ready."
- Why: Honesty about print quality.
- Standing: UNANSWERED PROPOSAL
- Source: 14556, 14608
- Relationship: —

**S5-081**
- Type: Principle
- Statement: Verification claims are scoped: "The verification provides assurance on checked properties only. It does not make an absolute claim of zero possible errors." The program should report exactly what was checked.
- Why: Honest status reporting.
- Standing: UNANSWERED PROPOSAL
- Source: 14560–14561
- Relationship: ADDS TO S5-071 step 6.

**S5-082**
- Type: Process
- Statement: Typeset Chronological Master status: text and dimensions passed; the illustrations (80–200 px crops) failed print quality. "These PDFs are trustworthy TEXT proofs and composition proofs, not final press files."
- Why: —
- Standing: EXAMPLE / ILLUSTRATION of the status reporting
- Source: 14552–14612
- Relationship: —

---

## E. Yolanda's turn: implications for the program

**S5-083**
- Type: Principle (Yolanda)
- Statement: "This would make the phase three program unusable." The failures seen in poster production would make the planned program unusable.
- Why: She is projecting the poster experience onto the software.
- Standing: DECIDED BY YOLANDA (16:26)
- Source: 14614–14616
- Relationship: UNCLEAR on phase numbering. She says "phase three program." ChatGPT says the novel app is Phase 2 and Story Universe is Phase 3 (14742). At 15068 she says "phase two should just be the story system." See S5-114.

**S5-084**
- Type: Not wanted
- Statement: Failure modes the program must not have:
  - information changes between versions (established details disappear, undecided possibilities become facts);
  - corrections introduce new errors;
  - the visual output doesn't reflect the underlying info;
  - verification is insufficient, so the author discovers errors herself;
  - too much is reconstructed instead of updating one element.
- Why: Learned from the poster experience.
- Standing: ACCEPTED PROPOSAL. Yolanda sets the architecture aside ("Ignoring all that for a moment") but does not reject it and later says "you are onto something correct."
- Source: 14632–14638
- Relationship: —

**S5-085**
- Type: Scenario (fears)
- Statement: Story Brain failure scenarios to prevent:
  - She changes Kevin's motivation, and the app silently rewrites his relationship with Anthony.
  - She updates the Midpoint, and the app accidentally changes the causal chain to All Is Lost.
  - She resolves a question, and an earlier possibility becomes established fact without approval.
  - She returns after three weeks, and the information she trusted has changed.
- Why: "That would defeat the entire purpose of building the application."
- Standing: UNANSWERED PROPOSAL (ChatGPT scenarios; she pivots to a different problem at 16:29)
- Source: 14640–14650
- Relationship: The three-week return scenario relates to Return to Writing (possibly an earlier decision).

**S5-086**
- Type: Principle / Data model
- Statement: There is one authoritative source of truth: a structured, persistent story model the author controls. Manuscript, decisions, character profiles, questions, ideas, scenes, relationships, and causal connections exist independently of the AI. Every visualization, scene map, character analysis, and exported poster draws from the same data.
- Why: AI-generated interpretations cannot be the authoritative record.
- Standing: UNANSWERED PROPOSAL. Yolanda said "Ignoring all that for a moment… Let's say that the changes I make… does what is supposed to do," which takes it as the assumed baseline but neither explicitly accepts nor rejects it.
- Source: 14652–14664
- Relationship: —

**S5-087**
- Type: Principle
- Statement: Explicit author approval. Suggestions remain suggestions until the author accepts them. Even when AI identifies a contradiction, it cannot independently decide which statement replaces the other.
- Why: Author control.
- Standing: UNANSWERED PROPOSAL
- Source: 14666
- Relationship: Possibly relates to earlier decisions about suggestions versus decisions.

**S5-088**
- Type: Principle
- Statement: The program must distinguish what it knows from what it infers. AI interpretations, for example "Anthony might fear rejection," stay labeled as AI interpretations. The author can accept them, reject them, or leave them under *Things & Ideas I'm Thinking About*. Until she decides, the authoritative character profile is unchanged. "That principle must apply everywhere."
- Why: Prevents silent canonization.
- Standing: UNANSWERED PROPOSAL
- Source: 14680–14694
- Relationship: References an existing feature name, "Things & Ideas I'm Thinking About" (possibly an earlier decision). ADDS TO S5-087.

**S5-089**
- Type: Data model
- Statement: Stable identifiers and relationships. Every character, scene, sequence, beat, question, and idea has a persistent identity. Updating one element must not accidentally alter another.
- Why: Isolation of edits.
- Standing: UNANSWERED PROPOSAL
- Source: 14668
- Relationship: —

**S5-090**
- Type: Feature
- Statement: Traceable changes. Show what changed, when, why, and which other story elements might be affected.
- Why: Trust and Ripple-style awareness.
- Standing: UNANSWERED PROPOSAL
- Source: 14670
- Relationship: Possibly relates to an earlier Ripple Effect decision.

**S5-091**
- Type: Principle
- Statement: Reproducible visualizations. Maps are generated from stored data, not by asking an image model to recreate the story. "Updating Beat 12 should not risk deleting Beat 9."
- Why: —
- Standing: UNANSWERED PROPOSAL. Effectively endorsed at 15064 via the visual engine.
- Source: 14672
- Relationship: An early form of S5-099.

**S5-092**
- Type: Feature
- Statement: Automated integrity checks. Before accepting an export as valid, test structure, references, chronology, decision status, and causal relationships.
- Why: —
- Standing: UNANSWERED PROPOSAL
- Source: 14674
- Relationship: ADDS TO S5-107.

**S5-093**
- Type: Feature
- Statement: Reliable saving and recovery. Version history, backups, and complete exports protect the work independently of AI-generated summaries.
- Why: —
- Standing: UNANSWERED PROPOSAL
- Source: 14676
- Relationship: Possibly relates to earlier backup and versioning decisions.

**S5-094**
- Type: Principle
- Statement: Separation of creative decisions from presentation. Changing an illustration, layout, or color must never change the underlying story.
- Why: —
- Standing: UNANSWERED PROPOSAL. Restated at 14896 and implicitly endorsed at 15064.
- Source: 14678
- Relationship: Same as S5-102.

**S5-095**
- Type: Process / acceptance test
- Statement: Data-survival test for the program:
  1. Establish all 15 Save the Cat beats.
  2. Change the Midpoint.
  3. Regenerate every related visualization.
  4. Verify all 15 beats still exist.
  5. Confirm unrelated character information is unchanged.
  6. Verify only the appropriate causal dependencies are flagged.
  7. Reverse the change and recover the previous state exactly.

  "If the program cannot pass that kind of test, it isn't ready to be trusted."
- Why: "We cannot test the eventual application simply by asking whether its output looks correct. We need to test whether its underlying information survives changes."
- Standing: UNANSWERED PROPOSAL
- Source: 14696–14712
- Relationship: —

**S5-096**
- Type: Principle
- Statement: "The AI helps you think about your story. The application remembers your story. You remain its author." These are three distinct responsibilities that are never to be confused. "The entire promise of the program is that you can finally stop trying to remember everything yourself."
- Why: Trustworthiness is the precondition for offloading memory.
- Standing: UNANSWERED PROPOSAL (a tagline-level principle)
- Source: 14726–14738
- Relationship: —

**S5-097**
- Type: Principle
- Statement: Integrity must work "without you manually reviewing every field after every operation."
- Why: She doesn't want to be the QA department.
- Standing: UNANSWERED PROPOSAL. Consistent with her 15:47 frustration.
- Source: 14714
- Relationship: RESTATEMENT of S5-070.

**S5-098**
- Type: Principle
- Statement: Reliability, data integrity, and author control are foundational requirements, "not enhancements we add later." They are built in from the start of the novel app phase and carried forward.
- Why: —
- Standing: UNANSWERED PROPOSAL
- Source: 14740–14742
- Relationship: See the phase numbering question (S5-114).

**S5-099**
- Type: Scenario (Yolanda)
- Statement: "Let's say that the changes I make to a value does what is supposed to do to all the other story elements… The problem would come when the user asks for a visual representation of her story. Nothing would print properly. She would run into the issues I've been having for the last hour or so."
- Why: She separates story-logic correctness from visual and print output. The visual output can fail even if the data is right. She is thinking of other users ("the user… her story"), so the program is for other authors too.
- Standing: DECIDED BY YOLANDA (16:29)
- Source: 14746–14748
- Relationship: ADDS TO S5-083. Confirms the program will have other users (a general-purpose product). "a value" here probably means a story element value.

**S5-100**
- Type: Principle
- Statement: "The visual representation is part of the core utility," not a cute add-on, for Yolanda.
- Why: She thinks visually and uses maps to write.
- Standing: ACCEPTED PROPOSAL. At 15064 she says "you are onto something correct."
- Source: 14764–14766
- Relationship: —

**S5-101**
- Type: Feature (architecture)
- Statement: There are two systems:
  1. **Story Logic System**: stores story data; updates linked elements; tracks acts, sequences, scenes, questions, ideas, relationships, values, and causality; preserves version history; keeps decisions stable.
  2. **Visual Output System**: turns story data into maps, posters, diagrams, timelines, and printable views; handles placement, overflow, scale, and legibility; exports for screen, home printing, and poster printing.

  "Even if system 1 works perfectly, system 2 can still make the product unusable."
- Why: Rendering is a separate engineering problem.
- Standing: ACCEPTED PROPOSAL (15064)
- Source: 14768–14789
- Relationship: —

**S5-102**
- Type: Not wanted
- Statement: Rendering failure list:
  - images cropped out of frame;
  - text too small, or cut off;
  - panels misaligned;
  - beats missing because the layout broke;
  - confusing relationships;
  - blurry exports at print size;
  - layouts that look good on screen but fail in print;
  - overwhelming information density;
  - decorative artwork interfering with clarity.
- Why: Every item happened during the poster work.
- Standing: ACCEPTED PROPOSAL (15064)
- Source: 14791–14812
- Relationship: —

**S5-103**
- Type: Principle / Constraint
- Statement: The program must never rely on generative image creation as the final rendering method for a story map. Image generation is OK for moodboards, concept art, optional decorative illustrations, scene inspiration, and character inspiration. It must not lay out beat cards, timelines, scene chains, labels, percentages, page ranges, arrows, relationship maps, causal chains, or print layouts. Those need a **deterministic rendering engine**.
- Why: The poster experience.
- Standing: ACCEPTED PROPOSAL for the program (15064: "I like the thought of a visual story mapping system/engine"). For Phase 1 posters, though, Yolanda says "an AI representation is okay" for now (S5-112).
- Source: 14814–14839
- Relationship: The S5-112 exception applies only to her current poster need.

**S5-104**
- Type: Feature
- Statement: Rule-based layout behaviors:
  - Put Act I in a region and beats 1–5 there.
  - If text exceeds a box, resize intelligently or expand the section.
  - If there are too many notes, move them to a continuation panel.
  - Poster mode uses the poster template; desk mode reflows into letter pages; zoom mode generates a focused act map.
  - If the user adds a third plotline, add a new layer or swimlane.
  - "If something won't fit, do not crop it silently, raise a layout warning."
- Why: "That is a real visual system."
- Standing: ACCEPTED PROPOSAL (15064)
- Source: 14841–14866
- Relationship: The third-plotline swimlane implies support for any number of plotlines (general-purpose).

**S5-105**
- Type: Feature
- Statement: Template-based maps. Named templates: Chronological Story Map, Relationship Map, Hybrid Command Center, Character Depth, McKee Gap, Act Zoom, Sequence Zoom. "Each template should know what information it expects and how to place it."
- Why: Controlled output.
- Standing: ACCEPTED PROPOSAL (15064)
- Source: 14868–14882
- Relationship: These derive from the Phase 1 poster set (S5-001), generalized for any novel.

**S5-106**
- Type: Feature
- Statement: Reflowable layout. When content grows, the system must adapt, not chop. It should expand sections, split dense areas across pages, reduce image size while protecting text size, create continuation panels, and offer "summary" versus "detailed" modes.
- Why: —
- Standing: ACCEPTED PROPOSAL (15064)
- Source: 14884–14894
- Relationship: —

**S5-107**
- Type: Principle
- Statement: Separate content from decoration. Changing the artwork, the layout, or the print size must not change the facts. "Art is layered on top of content, not fused with it."
- Why: "This is huge."
- Standing: ACCEPTED PROPOSAL (15064)
- Source: 14896–14906
- Relationship: RESTATEMENT of S5-094 and S5-051.

**S5-108**
- Type: Feature
- Statement: Multiple output modes:
  - **Wall Poster Mode**: big-picture overview.
  - **Desk Reference Mode**: readable multi-page letter size.
  - **Act Zoom Mode**: one act enlarged.
  - **Sequence Map Mode**: one sequence with scene-by-scene detail.
  - **Writer Focus Mode**: stripped-down clarity, minimal decoration.
  - **Presentation Mode**: prettier, less dense.
- Why: "One layout cannot do everything. You already proved that."
- Standing: ACCEPTED PROPOSAL (15064)
- Source: 14908–14931
- Relationship: Act Zoom and Sequence Map possibly relate to an earlier Narrative Zoom decision. Writer Focus Mode relates to her overstimulation concern (S5-052).

**S5-109**
- Type: Feature / acceptance test
- Statement: Preflight before export checks:
  - text overflow;
  - bad image crops;
  - fonts too small for the target print size;
  - all beats present;
  - all arrows connected;
  - overlapping labels;
  - sufficient resolution;
  - paper-size compatibility;
  - whether the export is better as one poster or multiple pages.

  If a check fails, the program does not export junk. It gives a specific message, for example: "This poster is not export-ready. Beat cards 9 through 12 exceed the allowed density. Choose larger format, condensed text, or multi-panel export."
- Why: "That would have saved us a lot of grief."
- Standing: ACCEPTED PROPOSAL (15064)
- Source: 14933–14952
- Relationship: ADDS TO S5-092 and S5-076.

**S5-110**
- Type: Constraint (technology)
- Statement: Build approach: structured story data, rule-based layout, vector graphics, real typography, PDF export, zoomable canvas views, and optional illustration layers. Render "more like InDesign, Figma, Lucidchart, Miro, Canva, or a specialized reporting engine. Not like an AI image prompt."
- Why: —
- Standing: UNANSWERED PROPOSAL. Accepted in concept (15064); the tech specifics were not discussed by her.
- Source: 14954–14974
- Relationship: —

**S5-111**
- Type: Feature
- Statement: The AI's lane on the visual side: suggesting layout types, summarizing text for small cards, proposing what to show, identifying clutter, recommending when to split a poster, and generating optional or companion artwork. AI is not the authority for final layout fidelity.
- Why: —
- Standing: UNANSWERED PROPOSAL (accepted in concept)
- Source: 14976–14989
- Relationship: —

**S5-112**
- Type: Principle (product rule)
- Statement: "No story visualization should depend on generative image rendering for correctness, legibility, or print fidelity."
- Why: "That one rule would protect the program from repeating what you've just experienced."
- Standing: ACCEPTED PROPOSAL for the program (15064)
- Source: 14991–14997
- Relationship: —

**S5-113**
- Type: Acceptance criterion
- Statement: If the app says "Here is your story poster," it must guarantee:
  - nothing important is missing;
  - nothing is silently cropped;
  - nothing is too blurry to print;
  - text is readable;
  - the layout is intentional;
  - the output matches the source story data.

  Otherwise "the visualization feature becomes ornamental instead of functional." "A story map that is correct in the database but broken in the export is still broken."
- Why: —
- Standing: ACCEPTED PROPOSAL (15064)
- Source: 14999–15016, 15056
- Relationship: —

**S5-114**
- Type: Feature (module)
- Statement: The **Visual Story Mapping Engine** is a major module and core product infrastructure, "not a side feature." It is responsible for deterministic rendering, responsive layout, print-safe export, multi-format outputs, zoom views, density management, visual hierarchy, preflight validation, and optional art layering. ChatGPT offered to define its requirements the way the Story Brain was defined.
- Why: —
- Standing: ACCEPTED PROPOSAL. At 15064 Yolanda says: "Yes. I think you are onto something correct. I like the thought of a visual story mapping system/engine. It definitely needs to be designed, so it looks professional."
- Source: 15030–15060, 15064
- Relationship: ADDS TO S5-101.

**S5-115**
- Type: Constraint (Yolanda)
- Statement: The Visual Story Mapping Engine "definitely needs to be designed, so it looks professional."
- Why: The visual quality bar.
- Standing: DECIDED BY YOLANDA
- Source: 15064 (just past END)
- Relationship: ADDS TO S5-114.

**S5-116**
- Type: Process (phasing)
- Statement: The visual engine "has to come as a different phase." Phase two "should just be the story system… whatever we decide to call the overall program." The visual system is integrated "further down the line… but we do it correctly."
- Why: Keeps the near-term scope manageable and does the visual system right.
- Standing: DECIDED BY YOLANDA (16:48)
- Source: 15066–15070 (just past END)
- Relationship: REPLACES (as a phasing decision) ChatGPT's implied inclusion of visualization inside the Story Brain build. UNCLEAR relative to the earlier "Phase 3 = Story Universe" naming (14742): she does not say whether the visual engine is Phase 3 or another phase.

**S5-117**
- Type: Constraint (Yolanda)
- Statement: For her immediate Phase 1 needs (the posters): "I think an AI representation is okay. Good until I AI art." Likely voice-to-text for "good enough with AI art."
- Why: She wants the visuals now; the rigorous engine comes later.
- Standing: DECIDED BY YOLANDA
- Source: 15066 (just past END)
- Relationship: Partially relaxes S5-075 and S5-103 for current posters only, not for the program. This is an exception, not a replacement of the program rule.

**S5-118**
- Type: Process
- Statement: ChatGPT's restated objective: "get beautiful visual representations of your novels that you can study, enjoy, and use while writing." This is separate from software requirements, which had been complicating it.
- Why: —
- Standing: ACCEPTED PROPOSAL
- Source: 15078–15084
- Relationship: RESTATEMENT of S5-116 and S5-117.

---

## F. Work habits and meta

**S5-119**
- Type: Process (work habit)
- Statement: Yolanda dictates by voice-to-text, which produces artifacts in the transcript, for example "you or a person" (for a poster?), "I need what I asked for the barrier" (the poster?), "Good until I AI art," and "updating elements of.the story." Interpret by intent.
- Why: —
- Standing: DECIDED BY YOLANDA (observed habit)
- Source: 13698, 15066, 14748
- Relationship: —

**S5-120**
- Type: Process (work habit)
- Statement: She reviews visuals on her phone via screenshots (attached jpg/png) and reacts to them in comparison: "In comparison, the artwork in this leaves much to be desired."
- Why: —
- Standing: DECIDED BY YOLANDA (observed)
- Source: 12519–12523, 13103–13107
- Relationship: —

**S5-121**
- Type: Principle
- Statement: She shouldn't have to keep making versions. The tool should get it right in one verified pass instead of iterating publicly ("what is the point?").
- Why: —
- Standing: DECIDED BY YOLANDA
- Source: 13698
- Relationship: RESTATEMENT of S5-068.

**S5-122**
- Type: Principle
- Statement: Honesty about status. The tool must say plainly when something isn't accurate or print-ready ("No. Not honestly, no.") instead of overclaiming. Describing an incremental improvement as near-completion creates false expectations.
- Why: The trust breakdown came from overclaiming.
- Standing: ACCEPTED PROPOSAL (implicit)
- Source: 13622–13654, 13742–13748
- Relationship: —

**S5-123**
- Type: Not wanted
- Statement: Rebuilding the whole artifact for a single correction.
- Why: Each rebuild introduces new errors.
- Standing: ACCEPTED PROPOSAL
- Source: 14638, 13726–13732
- Relationship: ADDS TO S5-089.

**S5-124**
- Type: Principle
- Statement: Posters (and program outputs) carry provenance: "Version 1 | Source: Story Bible, October 13, 2026 | User clarifications through October 14, 2026" and "Content reflects the October 13, 2026 story bible + author clarifications."
- Why: Shows which version of the truth the output reflects.
- Standing: UNANSWERED PROPOSAL
- Source: 12264, 12807, 14365
- Relationship: Supports traceability (S5-090).

**S5-125**
- Type: Constraint
- Statement: Fine text at distance: small gray or cream text may need stronger contrast and larger sizing. "Illustrative AI posters should NOT be used as print sources for tiny wording."
- Why: Legibility.
- Standing: UNANSWERED PROPOSAL
- Source: 12333–12334
- Relationship: ADDS TO S5-109 (font-size preflight).

---

## Open questions in this section

1. **Phase numbering.** Yolanda says "phase three program" (14616). ChatGPT says the novel app is Phase 2 and Story Universe is Phase 3 (14742). Yolanda then says "phase two should just be the story system" and the visual engine is "a different phase… further down the line" (15066–15070). Which phase number does the Visual Story Mapping Engine get, and where does Story Universe sit now?
2. The program name is still undecided: "whatever we decide to call the overall program" (15068).
3. Whether the Story Brain data-integrity requirements (S5-086 to S5-098) are formally accepted. Yolanda set them aside ("Ignoring all that for a moment") and never explicitly accepted or rejected them.
4. Phase 1 posters: what is the final deliverable standard now that she accepts "AI representation" for the near term? Is the typeset master still the path, or the AI image?
5. Break into Two: is it Kevin who commits, or both men? (S5-078)
6. B Story wording (S5-079).
7. When Francine's POV first opens: at the reveal, or "near" it? (S5-017)
8. IDW items the bible marks as open:
   - Francine's Lie and Truth;
   - forces of antagonism at all three levels;
   - the wife's name;
   - Francine's family;
   - the dogs' names;
   - the neighborhood chorus;
   - the specific events of every beat (Catalyst, Midpoint polarity, All Is Lost);
   - the five moves of the finale;
   - fish-guts staging and the brawl;
   - pie mechanics;
   - whether to use direct address.
9. Characters' physical appearance is not established, so the illustrations are representative only.
10. Print vendor specs (bleed, CMYK, substrate) have not been supplied.

## Unclear items

- **S5-078 (Break into Two subject)**: ChatGPT's wording changed from "Kevin commits" to "the two men commit" with no Yolanda input.
- **S5-079 (B Story framing)**: "visibility, agency, respect" versus "concealed operations and awakening."
- **S5-083 / S5-116 (phase numbering)**: see Open question 1.
- **S5-086–S5-098**: are they accepted or only tolerated? "Ignoring all that for a moment" followed by "you are onto something correct" at 15064 was said about the visual engine specifically, not necessarily the data-integrity list.
- **S5-117**: the meaning of "Good until I AI art" is garbled. Best reading: "good enough with AI art" for now.
- **S5-015**: the bible says "Kevin narrates in first person, and the point of view alternates." It is unclear whether Kevin is the primary narrator or the narration is strictly equal alternation.

## Items ChatGPT dropped or distorted when restating

- **Beat 12 Dark Night of the Soul (the Confession)** was entirely dropped by the AI-generated cinematic poster (13143→13147), and act labels were mispositioned. ChatGPT caught both at 13413–13456.
- **Fish-guts timing** was garbled in the AI poster footer ("the smell emerges and acts, then recedes, arrive later"). The "half-day later" delay from the bible was not on any poster.
- **"Both sides operate in alternating first-person"** (AI footer) dropped the names Kevin and Anthony and the one-head-per-scene rule.
- **Five-dollar bill**: the bible says "Decided… (the five-dollar bill)," but Yolanda's override makes it a candidate only. The posters handle this correctly, but the bible text still conflicts and should be updated.
- **Invented content in the AI posters**: character taglines, "A comedic novel by Yolanda Allen," "SAME STREET DIFFERENT PEOPLE," "A BRIGHTER TOMORROW," the cat, the "UNITY" shirt, "driveway-and-neighborhood war," and Midpoint thumbnails implying an event (tipped pot, raccoon at the trash can). None of this is canon. See S5-058.
- **Break into Two**: Kevin was changed to "the two men" (S5-078).
- **B Story** was reworded (S5-079).
- **"Her POV is withheld until near the reveal"** (posters) loosens the bible's "until the reveal."
- **Phase numbering**: ChatGPT's "Phase 2 novel app / Phase 3 Story Universe" does not match Yolanda's "phase three program" wording.
- **ChatGPT's 15:49 promise** that "the next version" would be verified production work still delivered low-resolution art crops. ChatGPT acknowledged this (14612).
