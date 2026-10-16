# Requirements register

Every feature in this program traces to a requirement here, and every requirement traces to Yolanda's own words, with line references into the design conversation ("Story Map Planning", ChatGPT, October 14 to 15, 2026) or to her decisions in the Claude build conversation.

## How it was made
1. The full design conversation (23,501 lines) was read line by line in eight consecutive sections, with nothing skimmed. The output is in `sources/section-1.md` to `section-8.md`, including the edited and regenerated message versions.
2. ChatGPT's Phase 2 specification, its Human Vision brief and the review packet were registered separately as ChatGPT's restatements, not Yolanda's words (`sources/section-docs-spec.md`).
3. Story Bible v5 (10-13), the Character Breakthrough Archives (10-14, 10-15), her two beat-sheet spreadsheets and the poster data were registered with their original labels (`sources/section-docs-story.md`).
4. Everything was then consolidated by theme, with duplicates merged and every distinct detail kept.
5. An independent reviewer checked a sample of 116 items against the transcript and read all 103 of Yolanda's messages in full. It found 15 errors and one missing decision, and all of them were corrected (`verification.md`).

## Files
| File | Covers |
| --- | --- |
| `00-decisions-with-claude.md` | Her decisions in the Claude build conversation, plus the standing rules |
| `A-principles-brain-characters-ai.md` | Author authority, statuses and canon, provenance, the Story Brain, conversations, the character model, the AI collaborator, the Craft Resource Advisor |
| `B-writing-ux-platform-io-scope.md` | Writing environment, Return to Writing, the Writing Trail, work habits, UX, platform, backups, import and export, project setup, phasing |
| `C-architecture-zoom-ripple.md` | Beats and frameworks, storylines, POV, time, causality, knowledge tracking, Narrative Zoom, the Ripple Effect and moving elements, analyzers |
| `IDW-story-data.md` | I Declare War as project data: every fact with status, sources and how it evolved. This is data for one story, not program behavior. |

## Standing rules
A later statement replaces an earlier one only when Yolanda actually changed her mind or explicitly replaced it. It does not replace it when it is:
- a possibility, which coexists with the earlier one;
- an example;
- ChatGPT restating or summarizing (an omission never cancels anything);
- a ChatGPT proposal she did not accept or did not read;
- an addition, which builds on the earlier one;
- about a different subject.

When the standing is unclear, it is marked NEEDS YOLANDA.

Standings used: Decided by Yolanda, Accepted proposal, Unanswered proposal, Spec-only, Possibility.

## The program is for every story
I Declare War is the first story and the richest test case. Nothing specific to it is built into the program; it is loaded as one project's data.
