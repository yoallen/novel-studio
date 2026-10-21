# Rebuilding the Story Canon User's Guide

The guide lives in `src/ui/guide/*.md` and is shown in the program's Help (one long page, chapters in file-name order). You are rewriting part of it. Write your new chapter files into `src/ui/guide-new/` (create it if missing). Do not touch `src/ui/guide/`, and do not change program code.

## Who reads this

A brand-new user who has never seen Story Canon, may never have written a novel, and may have ADHD. They read in order, from the first chapter, and they meet things in the program in the same order. The author of the program (Yolanda) judged the old guide "disorganized" because it used words before explaining them (for example, it said "under many blanks on a record page" before saying what a record or a blank is), and because it was full of her own novel, I Declare War.

## The rules

1. **Define before use.** Never use a Story Canon term before it is defined. The terms in "The shared words" below are defined in chapter 01, so every later chapter may use them freely. Any other term (a screen name, a button, a craft word like "beat" or "viewpoint") is defined in plain words the first time your chapter uses it.
2. **Teach fully.** For each thing a user can do: name it, say what it is, why it matters, whether most writers need it, how to do it step by step (exact button names in **bold**, as they appear on screen), the common mistake, then a short example. Do not label a concept and jump to the example.
3. **One example novel, everywhere:** *The Keeper of Gull Point*, a mystery with a heart. The hero is **Marisol Vega**, 41, keeper of the Gull Point lighthouse, who has never left the island. Her younger brother **Eli** drowned twelve years ago (her wound). The Catalyst: an empty boat washes onto her rocks. Her Lie: "Anyone I care about will leave." Want: never to need anyone. Need: to let someone stay. Other people: **Ana Ruiz**, the new doctor in town (B Story); **Cyrus Hale**, the harbor master who knows more than he says (antagonist). Places: the lighthouse, the harbor town of **Port Ellery**. You may invent small details consistent with this. Do not use I Declare War, Kevin, Anthony, Francine, "Story Bible v5" or any of Yolanda's own material, except in the one place that explains bringing in your own planning documents, and even there describe it generally.
4. **Words.** Say **field** for a place to write on a record (never "blank"). Say "a blank line" only for how an Open item looks. Statuses are always called by their screen words: **Decided**, **Developing**, **Still open**, **Example**, **Suggestion**, **Set aside**.
5. **Style.** Plain, warm, direct, second person ("you"). Short paragraphs. No em dashes anywhere (use commas, colons, periods or parentheses). No AI-speak: never "leverage, unlock, seamless, robust, delve, north star, in this space, at the end of the day". No emojis. No separator lines. Headings with `##` and `###` (and `####` sparingly). Use tables when comparing items; numbered lists for steps.
6. **Accuracy first.** Every button name, label, menu and behavior must match the program as it is now. Verify against the code in `src/ui/*.tsx` and `src/core/*.ts` and the existing guide chapter you are rewriting (which was checked against the program). When the old chapter and the code disagree, the code wins. Do not invent features.
7. **Keep everything true and useful from the old chapters.** You are reorganizing and re-teaching, not cutting. Remove only Yolanda-specific material and repetition. If something you must cover belongs to another chapter in the new order, write one sentence and link to that chapter.
8. **Links.** Internal links use the form `[text](#slug)`. The slug is the heading text lowercased, apostrophes removed, every run of other characters turned into a single hyphen, leading and trailing hyphens removed. Link only to (a) headings in your own files, or (b) the chapter titles below, using the slugs given. Every heading in the whole guide must be unique, so prefix generic sub-headings with their subject (for example "### Writing Room: the status steps", not "### Status steps").
9. Each file begins with exactly one `# ` heading, the chapter title given below, then an opening paragraph that says what the chapter covers and when you would read it.

## New since the old guide (teach these where they belong)

- **Status inks.** On a record, the words themselves are colored by status: Decided is ink blue with a small blue square; Developing is pencil gray with a dashed underline; Still open is a blank line with a gray prompt; Example is sepia italic with a small boxed label reading "Example"; a Suggestion sits on a white slip, tucked in at a slight angle, in a handwriting typeface; Set aside is faded with a line through it. The legend under a record's name shows all of these.
- **Records are notebooks with numbered pages.** Under a record's name is a row of numbered page tabs, then **All pages** at the end of the row. A page number turns ink blue when that page has something written on it. One page shows at a time; links at the bottom of each page go to the page before and after. A character has 11 pages: 1 Who they are, 2 Identity, 3 Looks and voice, 4 Personality, 5 Goals, motives and values, 6 What opposes them, 7 Inner life, 8 Arc, 9 Their world and their people, 10 Interview, 11 Notes, guardrails and writing aids. A beat has 1 In this book, 2 Save the Cat's questions, 3 Notes and connections. A scene card has 1 The scene, 2 When it happens, 3 Who tells it, 4 Mood and feeling, 5 The reader, 6 Scene and sequel, 7 Notes and connections. The story world has 1 The heart of the book, 2 What it means, 3 Time, viewpoint and knowledge, 4 Notes and connections. An event or reveal has 1 What happens, 2 When, and who knows, 3 Notes and connections. Every other kind has one page named for it (for example "The place") plus Notes and connections. Pages without anything to show are left out (for example "Identity" pages always exist, but a page made only of method fields appears once that method is turned on in Novel setup). Suggestions waiting for a record stay above the page tabs. Accepting one turns to the page where it landed. Search opens a record on the page that holds what you found. "Low-energy day? One line counts" with **Fill in one line** sits above the tabs on a character and turns to the right page.
- **Where was I is the novel's home page.** Its top now says so ("This is <title>'s home page." and a short paragraph), and the left list shows "your novel's home page" under its name. The novel opens there.
- **A second computer can turn on sharing from the Library** (section "Your other computers" in the Library, below Your novels), with no novel open; novels shared by the other computer then appear under "On your other computers" with **Bring to this computer**.
- **Help is available in the Library** (Help button at the top right, or F1).
- **Capture** shows a short line beside the Capture button saying where the thought went, which fades after a few seconds.

## The shared words (defined in chapter 01; everyone else may use them)

novel; Library; view (one of the main screens, picked from the list on the right); record; kind (of record); field; fact (one entry written in a field, with a status, a date and a source); status (Decided, Developing, Still open, Example, Suggestion, Set aside); canon; suggestion and slip; page (of a record) and All pages; the collaborator; scene; chapter; beat; scene card; Capture; Help and F1; Why it matters (the teaching link under a field).

## The new chapters (file name, then title, then slug for links)

- `00-welcome.md`: Welcome to Story Canon (`#welcome-to-story-canon`)
- `01-words-and-help.md`: The words Story Canon uses, and getting help (`#the-words-story-canon-uses-and-getting-help`)
- `02-first-hour.md`: Your first hour: the Library and a new novel (`#your-first-hour-the-library-and-a-new-novel`)
- `03-home.md`: Where was I: your novel's home page (`#where-was-i-your-novels-home-page`)
- `04-writing-room.md`: The Writing Room (`#the-writing-room`)
- `05-goals-november.md`: Goals, sprints and November (`#goals-sprints-and-november`)
- `06-story-brain.md`: The Story Brain (`#the-story-brain`) (includes characters and arcs)
- `07-narrative-zoom.md`: Narrative Zoom (`#narrative-zoom`)
- `08-continuity.md`: Catching problems: the continuity checks (`#catching-problems-the-continuity-checks`)
- `09-collaborator.md`: Conversations and the collaborator (`#conversations-and-the-collaborator`)
- `10-finding-things.md`: Finding things: Search and Story Trail (`#finding-things-search-and-story-trail`)
- `11-import-export.md`: Bringing things in and sending things out (`#bringing-things-in-and-sending-things-out`)
- `12-settings.md`: Settings and your other computers (`#settings-and-your-other-computers`)
- `13-questions.md`: Common questions (`#common-questions`)
- `90-every-field.md` is generated from code; do not write it. You may link to `#every-kind-and-every-field`.

## When you finish

Report: the files you wrote, their word counts, every place where the code and the old guide disagreed and what you wrote, and anything you could not verify.
