# Architecture

Working name: **Novel Studio** (provisional; the author renames it in Settings).

## Product promise

Help me discover my story the way my mind actually works, remember what matters without making decisions for me, and return me to the page so I can write it.

Every design choice below serves one of four guarantees:

1. **Nothing is lost.** Prose autosaves within seconds, every change is journaled, deleted work is restorable, backups are automatic and verified.
2. **Nothing is decided for the author.** Assistant output is a proposal until she accepts it. Examples never become canon. The newest author statement is current; older ones remain as history.
3. **Everything is connected.** One master story model feeds the manuscript, Zoom, analysis, AI context and exports.
4. **Writing is always one action away.** Planning is never a prerequisite for drafting.

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Desktop shell | Electron | Real Windows program, installer built automatically, OS-level secret storage for the API key |
| Interface | React + TypeScript + Vite | Rich, fast, keyboard-friendly UI |
| Manuscript editor | TipTap (ProseMirror) | Reliable rich-text prose editing with structured documents |
| Local service | Node + Fastify, bound to 127.0.0.1 | Testable over HTTP; same code runs in tests and in the app |
| Storage | SQLite (better-sqlite3), WAL mode | Single-file, transactional, crash-safe, portable |
| AI | Anthropic Claude API | Optional; every feature except the collaborator works offline |
| Tests | Vitest (core, API), Playwright (interface) | Every claim backed by a test that runs against the real service |

## Security model (local-first is not automatically secure)

- Service binds to 127.0.0.1 only.
- Every request must carry a per-launch random token; the token is passed to the window privately, never in a URL.
- Requests whose Host is not `127.0.0.1:<port>` or `localhost:<port>` are refused (blocks DNS rebinding).
- State-changing requests require `Content-Type: application/json` and an Origin equal to the app (blocks cross-site forgery).
- Strict schema validation on every input; errors never leak internals.
- The API key is stored with the operating system's credential protection, never in the database or backups.
- No telemetry. Story text leaves the machine only when the author invokes the AI collaborator, and the interface says so.

## The data model

### Projects
A project is one novel. It carries its own profile: conventional genres and Snyder story types (separate lists, each with primary / secondary / influence), structural frameworks, development methods, narrative traits, target word count, words-per-page densities (default 250 and 300), POV rules, and guidance level.

### Sources and provenance
Every piece of story knowledge records where it came from.

- **Source**: a document or session: Story Bible, archive, conversation, spreadsheet, author entry in the app, AI session. Records name, date, file hash.
- **Excerpt**: a located quotation inside a source (section or message index plus the exact text).
- **Speaker**: who said it: the author, an assistant (named), or the source document itself.

The app can always answer "Where did we get this?" by showing the excerpt.

### Story elements and statements (the Story Brain)
A **story element** is anything the story knows about: a character, relationship, beat, planned scene, location, object, clue, storyline, theme, rule, question, idea, thought.

An element's content is a set of **statements**, one per fact about it (for example: Kevin / Lie, Anthony / comic register, Fish guts / distraction mechanism). A statement has:

- **field**: what it is about
- **value**: the text (or structured value)
- **status**: Established, Developing, Unanswered, Illustrative, Proposed, Set aside
- **speaker** and **excerpt**: who said it and where
- **made at**: when it was said (the source's time, not the import time)
- **supersedes**: the earlier statement it replaces, if any

Rules:

- The **current** value of a field is the newest non-superseded statement. Older statements are never deleted; they form the field's timeline.
- Several Developing statements may stand side by side as **competing possibilities** (for example, three candidate Lies for Anthony). None is current canon until the author establishes one.
- Only the author can create an Established statement. Assistant statements enter as Proposed.
- Illustrative statements (examples, "one way I could play it") can never be promoted by import or summary; only an explicit author action can establish a new statement that quotes them.
- **Layered decisions**: a function can be Established while its execution is Developing (the distraction exists; the five-dollar bill is one option). This is modeled as two fields, not one ambiguous status.

### Connections
A **link** joins two elements with a typed relation from a fixed vocabulary that the ripple engine understands: contains, part of, realizes (scene realizes beat), causes, enables, motivates, depends on, plants, pays off, reveals, conceals, foreshadows, mirrors, contradicts, appears in, POV of, located at, knows, believes falsely. Each link records strength (direct or inferred), a note, and provenance.

### Manuscript
- **Chapters** contain ordered **scenes**. A scene holds prose as a structured document plus its plain text for search and counts.
- A manuscript scene can be linked to a planned scene element (its worksheet) but stands alone, so prose and plan may disagree deliberately.
- **Revisions**: every save that changes prose creates a revision; the author can compare and restore any revision without losing newer ones.
- **Autosave journal**: keystroke-level drafts are flushed to a journal every few seconds and on blur; on restart, any journal newer than the saved scene is offered for recovery.
- **Concurrency**: every editable record carries a version number. A save based on a stale version is refused with a conflict that shows both texts.

### Structure and continuity
- **Framework templates** (Save the Cat with Thesis / Antithesis / Synthesis worlds and sub-beats such as Stasis = Death; Weiland arc points; Ingermanson Snowflake steps; McKee scene and sequence units; Hero's Journey; custom). Templates are data, so new ones are added without code.
- **Beat instances** carry percentage, scene type (single or multi), and computed page ranges at each words-per-page density from the target word count.
- **Cross-framework correspondences** (Break into Two ≈ First Plot Point ≈ Crossing the Threshold) are shown as lenses on one event, never duplicated canon.
- **Scene worksheet**: POV, narrator, location, story-world time, goal, expectation, actual result, gap, value before and after, opposition, complication, turn, disaster / reaction / dilemma / decision, storylines, arc movement, plants and payoffs. Concise mode shows only the core.
- **Two timelines**: narrative order (manuscript) and story-world order (events with date, time, season, atmosphere).
- **Knowledge**: who knows, suspects or falsely believes each truth, as of each scene. Author-only truth records are excluded from reader-facing summaries.

### Creative conversations
A **conversation session** holds turns verbatim with speaker and time, whether held in the app with the AI collaborator or imported from elsewhere. Any span can be marked **Keep**, **Possibility** or **Not canon**, linked to elements, and turned into statements that cite the exact turn. A **session harvest** lists what was said verbatim, what the author approved, what remains hypothetical, new questions, and implicated elements.

### Questions, ideas and thoughts
- **Capture a Thought** saves raw text instantly with no category.
- **Questions I Have**: Open, Answered, No longer relevant; candidate answers kept; may spawn child questions.
- **Things & Ideas I'm Thinking About**: Considering, Adopted, Set aside (never deleted).
- Both link to any element and resurface when the author works on something they connect to.

### Proposals and change review
Assistant suggestions, import interpretations and ripple findings become **proposals**: target, exact before and after, rationale, citations, and status Pending / Accepted / Rejected / Deferred. Accepting writes new statements through the normal path, so it is journaled and reversible.

### Ripple analysis
When a statement or link changes, the engine walks the graph by relation type with rules (a changed cause affects its effects; a moved plant affects its payoff's ordering; a changed POV affects knowledge records) and stops at relations that do not propagate. Each finding carries a reason path, severity and direct / inferred label. Findings are review items, never edits.

### History
Every write goes through one journal: table, record, field, before, after, actor, reason, batch. Revert applies the inverse of one batch at field level and refuses (with an explanation) if a later batch changed the same field, unless the author confirms.

### Writing state
Last location and cursor per project, the Writing Trail (where she left, why, where she meant to return), writing sessions (start and end words, scenes touched), and the Next Writing Action.

## Backups
- Automatic: on close and every 30 minutes of active work, a consistent SQLite snapshot plus a JSON archive, kept with rotation in the user's documents folder.
- Manual: full project archive (portable, documented JSON plus manuscript files) and restore with a dry-run report of counts and checksums before anything is written.

## Testing contract
Nothing is reported as working unless a test that exercises the running service proves it. The suite includes the 42 checks from the independent review, AC01 to AC20, the eight Human Vision scenarios, and the midpoint trust test (change the midpoint, all 15 beats survive, unrelated characters untouched, only real dependencies flagged, exact reversal).
