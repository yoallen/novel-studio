# The collaborator and your conversations

This chapter covers two things that live together on the **Conversations** tab. The first is the collaborator, an optional AI thinking partner built into Story Canon. The second is every conversation you keep, whether you had it with the collaborator, with ChatGPT, with Claude in a web browser, or with a friend over email.

You can use every part of this chapter without the collaborator. Bringing in chats, selecting words to keep, and Harvest all work with the collaborator switched off.

## What the collaborator is, and what it never does

**The collaborator** is an AI writing partner inside Story Canon. It is powered by Claude, an AI made by the company Anthropic. You type a question, and it answers in the conversation, the way a chat app does.

The difference is what it knows and what it is allowed to do. A chat app in your web browser starts every conversation knowing nothing about your book. It treats your maybes as facts, and it will happily rewrite your chapter if you paste it in. The collaborator is built the other way around.

**What it does:**

- It reads your decisions, your open questions, your guardrails and your beat sheet before it answers, so "I'm stuck on beat three" means your beat three.
- It reads your **About you** answers, so it calls you by your name, uses your pronouns, and helps the way you said you like to be helped.
- It tells you which things are yours and settled, which are still open, and which are its own idea.
- It offers ideas as **suggestions**. A suggestion waits for you in the Story Brain. Nothing it says becomes part of your story until you accept it.

**What it never does:**

- It never writes into your manuscript. It has no way to type into your pages.
- It never decides anything. It cannot mark a fact as decided. Only you can.
- It never drafts anything you marked as kept for you (see [The marker for what is yours to write or decide](#the-marker-for-what-is-yours-to-write-or-decide)). On those, it asks questions or teaches instead.
- It writes sample lines only when you ask for them, and it labels each one "One way it could be done," which means an example, never a decision.

**Why it is built this way.** A novel has to sound like one person. The moment an AI's sentences slip into your pages, your voice starts to blur, and you can no longer tell which ideas were yours. Keeping the collaborator outside your pages, with its ideas waiting on slips, means you get a sounding board without losing authorship.

**The common mistake** is saying "sure, sounds good" in a chat and assuming that settled it. Agreeing in a chat changes nothing in your story. If you want an idea, accept it in **Suggestions waiting**, on purpose.

**Example.** Dana is writing a novel about two rival florists. She asks the collaborator, "Why would Rosa sabotage the wedding order?" It answers with two possible motives, then leaves a suggestion slip on Rosa's record: "Motive: she was jilted at that church." Rosa's record does not change. The slip waits until Dana says yes, not yet, or no.

## Turning the collaborator on

The collaborator is off until you turn it on, and it is turned on one novel at a time. Until you do, nothing about your book is sent anywhere. Everything else in Story Canon works without it and without the internet.

### Getting an API key and using it

An **API key** is a private code, like a password, that lets Story Canon talk to Claude on your behalf. You get it from Anthropic, and Anthropic bills each question you ask to that key, from credit you load in advance. A Claude.ai subscription is separate and does not include this. The Installation Guide, Step 4, walks through getting a key.

**Where:** the **Settings** tab, in the section called **The collaborator**. You can jump there with **The collaborator** in the **On this page** list at the top of Settings.

**How:**

1. Open **Settings** and scroll to **The collaborator**.
2. Click in the box marked **Claude API key** and paste your key. The letters show as dots so nobody can read it over your shoulder.
3. Click **Use this key**. The box is replaced by the words **Your key is set.**
4. Tick the box described in the next section.

The heading says **Takes effect right away**. That means these choices are kept the moment you make them. You do not need **Save settings** for this section.

**Where the key is kept.** In the Windows program, the line under the key says **The key is kept in Windows secure storage.** That is the same locked store Windows uses for its own passwords. The key is never put into your novel, your backups or your exports. (If you ever see **In this preview the key is kept only while the program is open**, you are in a test version, and you will need to paste the key again next time.)

**To take the key out**, click **Remove key**. The collaborator stops working in every novel until you add a key again.

**If the key is wrong**, the first question you ask shows: "Claude did not accept the API key. Check it in Settings. Your message is kept." Your question is saved in the conversation either way.

### Use the collaborator for this novel

Under the key is a tick box that reads **Use the collaborator for** and your novel's title, followed by "Story records you ask about are sent to Claude when you ask."

- **What it means:** ticking it is your permission for this one novel. It is the switch that lets anything about this book leave your computer.
- **When it sends:** only when you click **Ask**. Story Canon never sends anything in the background.
- **Each novel is separate.** Turning it on for *I Declare War* does not turn it on for your other books.

The box below it, **Also share the prose of a scene when I ask about that scene**, is off at first. **Prose** means your actual written sentences, as opposed to your notes and plans.

- **Off:** the collaborator sees your plans and records, never your pages.
- **On:** when you ask from inside a scene (with **Ask about this scene** in the Writing Room), it also sees the text of that one scene, up to about the last twelve thousand characters. It never sees other scenes' pages, and it is told never to rewrite them.

**When to turn it on:** when you want the collaborator to comment on a scene you wrote, for example with **Critique**. Many writers leave it off while drafting and turn it on during revision.

### Choosing which Claude answers

Under **Which Claude answers** you pick the model. A **model** is one version of Claude. They differ in how carefully they think, how fast they answer, and how much each question costs.

| Choice | What the screen says | Good for |
| --- | --- | --- |
| **Opus** | The most careful reader and thinker. Slower, and costs the most per question. | Critique, deep structure questions, teaching. This is the starting choice. |
| **Sonnet** | Thoughtful and quicker. A good everyday choice at a middle cost. | Most everyday talking it through. |
| **Haiku** | The fastest and least costly. Good for quick checks and short questions. | "Is this name used anywhere?" kinds of questions. |
| **Fable** | Another Claude model your key may reach. Check its price with Anthropic before you choose it. | Only if you know you want it. |

The line above the choices says it plainly: each question is billed to your own key, and longer questions and longer answers cost more. Your choice applies to this novel and takes effect right away.

## The beat sheet and records the collaborator can see

Every time you click **Ask**, Story Canon gathers a briefing about your book and sends it along with your question. Knowing what is in that briefing helps you ask well, and tells you exactly what leaves your computer.

**What is sent with every question:**

- Your **About you** answers: your name, pronouns, how you find your story, how you like to be helped, what to avoid.
- The novel's title and its one sentence, and what you chose in Novel setup: genres, story types, how the story is told, and your storytelling toolkit, including your own methods.
- Every current fact in your Story Brain, each with its status word (Decided, Developing, Still open, Example or Suggestion). Older versions you replaced are left out, and so is anything you set aside.
- Your **beat sheet**, in order: each beat, what you wrote on it, and the names of the scene cards placed there or that might go there.
- Your **guardrails** (the rules your story must never break), with an instruction to warn you if an idea would break one.
- Which scenes you marked as kept for you, so it never drafts them.
- The open story questions the program has noticed in Narrative Zoom's Story review.
- Your craft shelf, so **Where to learn more** starts with your own books.
- The last thirty messages of this conversation, so it remembers what you just discussed.
- If you focused the conversation, everything on that one record (see [Focusing a conversation on one record or scene](#focusing-a-conversation-on-one-record-or-scene)).

**What is never sent:**

- Your manuscript pages, unless you ticked **Also share the prose of a scene when I ask about that scene**, and then only the one scene you asked from.
- Your private writing aids: casting notes, theme music and playlists on a character page.
- Documents you brought in, other conversations, and earlier versions of anything.

**Why it matters.** The briefing is why the collaborator's answers fit your book instead of books in general. It is also why a tidy Story Brain gets you better help: a decision written down as **Decided** is treated as settled, while the same idea left in pencil is treated as still open.

**The common mistake** is expecting it to know something you only said in another conversation. Each conversation carries its own last thirty messages. What it knows across conversations is what you put into the Story Brain.

## Guidance levels: Quiet, Advisory and Deep

A **guidance level** is how much the collaborator speaks up beyond what you asked. You set it in **Settings**, under **Guidance and goals**, with two dropdowns: **Guidance while drafting** and **Guidance while planning**. They are saved with **Save settings**.

| Level | On screen | What the collaborator does |
| --- | --- | --- |
| **Quiet** | Quiet: note concerns, never interrupt | Answers only what you asked, briefly. It raises nothing else unless your idea would break a decision or a guardrail. |
| **Advisory** | Advisory: small notices you can ignore | Answers what you asked, then mentions at most one thing you may want to look at next. |
| **Deep** | Deep: full detail on everything it notices | Gives the full conversation: teaches, questions, and points out structure, cause and effect, and character problems it notices. |

### Guidance while drafting and while planning

Which of your two levels applies depends on where you asked from:

- **While drafting** applies when you ask from a scene, using **Ask about this scene** in the Writing Room. It starts at **Quiet**, because a writer in the middle of a scene needs an answer, not a lecture.
- **While planning** applies to every other conversation: ones you start on the Conversations tab and ones you start with **Ask about this** on a record. It starts at **Advisory**.

**When to change them.** Turn planning up to **Deep** on a day you want to be challenged on structure. Turn drafting down to **Quiet** (or leave it there) when you are trying to finish pages.

**Example.** On planning at **Deep**, you ask "Is the Midpoint of *I Declare War* strong enough?" The answer covers the Midpoint, then asks whether the stakes rise afterward and whether Kevin causes his own trouble. On **Quiet**, the same question gets a short answer about the Midpoint only.

### The collaborator while the door is closed

**Door closed** is a setting that keeps everything in Story Canon from judging your first draft until a day you choose. It is explained in [Door closed: drafting without judgment](#door-closed-drafting-without-judgment).

While the door is closed, any question you ask from a scene is treated as **Quiet**, whatever your drafting level says, and the collaborator is told you are getting the story down, not getting it right. It will not point out problems in the draft unless you ask for them by name, for example "What is weak about this scene?" Questions you ask outside a scene still use your planning level.

## Starting a conversation with the collaborator

Every conversation with the collaborator is kept on the **Conversations** tab, word for word, like a chat you brought in. You can start one three ways.

### Three ways in: Conversations, Ask about this, Ask about this scene

| Where you are | What you click | What you get |
| --- | --- | --- |
| The **Conversations** tab | **Start a new one** | A new conversation named with today's date, about nothing in particular. |
| Any record in the Story Brain | **Ask about this**, near the top of the record | A conversation named "About" and the record's name, already focused on that record. |
| A scene in the Writing Room | **Ask about this scene**, above the page | A conversation named "About the scene" and the scene's name. The scene goes along with every question, and its card if it has one. |

All three land you on the **Conversations** tab with the new conversation open.

**How to ask, step by step:**

1. Scroll to **Ask the collaborator**, below the messages.
2. Choose one of the six ways to ask (the next section explains each).
3. Type in the box marked **Your question**.
4. If you like, choose a record in **Focus on… (optional)**.
5. Click **Ask**, or press **Ctrl+Enter**. The button reads **Thinking…** while you wait.

Your question and the answer appear in the conversation. Your message is signed with the name in **Settings**, under **Your name**, and the answer is signed **Collaborator**.

**If the collaborator is off**, the place where **Ask the collaborator** would be says "The collaborator is not set up" (or "is off for this novel"), with a link, **Turn it on in Settings**. Nothing is broken. It is waiting for your key or your tick.

## The six ways to ask

Before you ask, you choose the kind of help you want. Each choice is a radio button (pick one) with a short line under it. The choice shapes the answer more than any wording you could add.

| Choose | What you get | Use it when |
| --- | --- | --- |
| **Talk it through** | A creative partner who asks one question at a time. | You have a tangle and want to think out loud. |
| **Teach it** | A full explanation, with examples that work and examples that do not. | You met a craft word or idea you do not fully understand. |
| **Show it** | Two or three examples, each labeled "One way it could be done." | You understand the idea but cannot picture it on the page. |
| **Hand it to me** | What is decided and what is open, then the writing comes back to you. | You are about to write a scene and want the facts laid out, not written for you. |
| **Critique** | An honest read: what works, what does not yet, and why. | You want a straight answer about something you made. |
| **Where to learn more** | Books and teachers to look up, starting with your own shelf. | You want to study a problem properly. |

A few notes on each:

- **Talk it through** is the starting choice. It asks at most one useful question at a time, so it never buries you in a list of ten.
- **Teach it** names the idea, defines any term, explains why it works and how it usually fails, then gives a fresh example. It is the mode for "what is a Midpoint actually for?"
- **Show it** always gives more than one example in different flavors, so there is never one right answer to copy. Each example is an example, not a decision. If you like one, it is still yours to write.
- **Hand it to me** sets up the scene and stops. It ends with a prompt that invites you to write. It never writes the scene.
- **Critique** separates what can be checked ("the clue is never planted before it pays off") from interpretation ("the ending may feel rushed"), and frames concerns as questions. It does not flatter.
- **Where to learn more** names books, authors and well-known sources only. It never gives page or chapter numbers and never invents a title. If it is unsure a book exists, it says so. Your shelf is in Settings, under [My craft shelf](#my-craft-shelf).

**The common mistake** is asking **Talk it through** for a critique, then feeling the answer was soft. If you want honesty, choose **Critique**. If you want an explanation, choose **Teach it**.

### The Start from questions

Under the six choices is a row headed **Start from:** with ready-made questions. Clicking one fills in **Your question** for you and switches the choice to **Critique**. You can edit the words before you click **Ask**.

| Start from | What it asks the collaborator to look at |
| --- | --- |
| **Does this cause and effect convince?** | Where one event is said to cause the next but the link is only asserted, not earned. |
| **Does what happens surprise the character?** | Where what the character expects parts from what actually happens, and whether that gap is big enough to matter. |
| **Is this character deep enough?** | Questions a demanding editor would ask: what they want against what they need, the wrong belief that drives them, contradictions, what they would never do. It asks; it does not fill in answers. |
| **Do these voices sound different?** | Where a reader might confuse two characters by how they speak and think. |
| **Does the comedy escalate?** | Whether each comic beat raises the stakes or only repeats. |

These work best on a focused conversation, so the collaborator knows which scene, character or cause you mean.

## Focusing a conversation on one record or scene

**Focus** tells the collaborator which record you are talking about. It then reads everything on that record, in full, including beats and scene cards, which the general briefing only names.

**Where:** the dropdown marked **Focus on… (optional)**, beside the **Ask** button.

**How it is arranged.** The list is grouped under the kind of record, like a table of contents: Characters, Relationships, Beats, Scene cards, Clues, Kept lines and so on. Beats and scene cards are in story order. Everything else is alphabetical. To jump, click the dropdown and type the first letters of a name.

**When to use it:** whenever your question is about one thing. "Is this character deep enough?" needs to know which character.

**Things that look odd but are working as designed:**

- A conversation started with **Ask about this** already has the focus set to that record.
- A conversation started with **Ask about this scene** may show **Focus on… (optional)** with nothing chosen when the scene has no card. The scene still goes with every question. The focus list holds records, and a page in the Writing Room is not a record.
- You can change the focus between questions. Each question uses whatever is chosen when you click **Ask**.

## Suggestions from the collaborator, and how they wait

When the collaborator has an idea it thinks belongs in your story, it does not just say it. It files a **suggestion**: a proposed fact for one field of a record, a proposed question, or a proposed connection between two records. A suggestion is the program's word for an idea someone other than you offered.

After an answer that left suggestions, a note appears under the **Ask** button: "One suggestion is waiting for you. Nothing was decided." Beside it is a link, **Look at it in Suggestions waiting**.

**Nothing is decided.** A suggestion changes nothing in your story. The record it is about shows it as a slip tucked in, not as a fact. Questions the collaborator raises are kept apart from your own questions until you accept them.

### Answering a suggestion in Suggestions waiting

**Where:** the **Story Brain** tab, the list called **Suggestions waiting** at the top of the left column. The number beside it counts what is waiting.

Suggestions from the collaborator sit under **From the collaborator**. Ideas that came in from a chat or document you brought in (marked "Here's a suggestion" in the original) sit under **From your planning documents**.

Each one has buttons:

| Button | What it does |
| --- | --- |
| **Accept as Decided** | Takes in a proposed fact as settled. (Facts only.) |
| **Accept as Developing** | Takes in a proposed fact in pencil, still yours to change. (Facts only.) |
| **Accept** | Takes in a proposed question or connection. |
| **Not yet** | Keeps it waiting. It is marked "you said not yet." |
| **No** (or **No, set it aside**) | Turns it down. It is kept in history, never thrown away. |

**The common mistake** is accepting as **Decided** because the idea sounds good today. If you are not sure, accept it as **Developing**. Pencil is free.

**Example.** The collaborator suggests the question "What does the silence cost him?" You click **Accept**. It becomes one of your questions in **Questions I have**, and the conversation it came from is still linked.

## The Conversations tab: every conversation, word for word

**Where:** the **Conversations** tab on the right edge.

The page lists every conversation in this novel. Each row shows the conversation's name (click it to open), then how many messages it has, how many places you kept or marked, the word **harvested** if you have run Harvest on it, and the date it began.

Across the top are three buttons:

- **Bring in from a Claude or ChatGPT export** brings in whole chats from a data export file. See [Bringing in chats from Claude and ChatGPT exports](#bringing-in-chats-from-claude-and-chatgpt-exports).
- **Bring in a conversation** brings in one conversation you paste or save as a text file. See [Bringing in one conversation by pasting it](#bringing-in-one-conversation-by-pasting-it).
- **Start a new one** starts a conversation with the collaborator, or an empty one you fill yourself.

**Why keep conversations here at all?** Ideas from a chat are easy to lose and hard to trace. Months later you will not remember whether a line was yours or ChatGPT's. Here, every conversation is kept whole, and anything you keep from it links back to the exact message, so **Where did this come from?** on a record can open the very words.

### Reading a conversation

Inside a conversation:

- **All conversations** (top left) goes back to the list. **Harvest** (top right) is explained in [Harvest: gathering what a conversation produced](#harvest-gathering-what-a-conversation-produced).
- Under the name, a line counts the messages and reminds you to select words to keep them.
- Each message starts with who said it and when, such as "YOLANDA, Oct 14, 2026, 1:34 PM" or "CHATGPT."
- Your own messages have a pink line down the left and are set in the book's typeface. Messages from anyone else have a grey line and plain type, so you can tell your words from theirs at a glance.

**Things that look odd but are working as designed:**

- **Stars and pound signs**, like `**Yes.**` or `## 1.`, appear in messages from ChatGPT or Claude. Those apps use these marks for bold text and headings. Story Canon keeps every character exactly as it was written, so the marks stay.
- **A message headed "Continued"** with a phrase after it is part of the message above. The original file had a heading inside a message that looked like a new speaker, so it is shown as a continuation, not as a new person talking.
- **Long lists of line numbers** like "[L917]" in a message are from a document the other app read during the chat. They were in the original.

### Behind-the-scenes steps, out of sight

Chats from ChatGPT and Claude often contain steps nobody said out loud: the app reading a file, running code, searching the web, or leaving notes to itself. Story Canon calls these **behind-the-scenes steps**.

They are kept, because nothing is ever thrown away, but they are not conversation, so they are out of sight. A line under the conversation's name says how many there are, for example "318 behind-the-scenes steps (tools, code and the app's notes to itself) are kept too, out of sight, because they are not conversation."

- **Show them** displays them faintly, each headed "Behind the scenes:" and the step's name.
- **Hide them** puts them away again.
- The message count at the top counts real messages only.

ChatGPT also tucks little citation codes into its answers, which show as garbled symbols in some programs. Story Canon keeps them in the stored text but does not display them.

## Bringing in chats from Claude and ChatGPT exports

Both Claude and ChatGPT can send you a copy of every chat you have had, called a **data export**. It arrives as a .zip file, a single compressed file that holds many files inside. You ask for it in each app's settings, and the app emails you a link to download it.

**When to use this:** you planned part of your book in Claude or ChatGPT and want those conversations kept with the book, searchable and traceable.

**How:**

1. On the **Conversations** tab, click **Bring in from a Claude or ChatGPT export**.
2. Click the file chooser and pick the .zip file just as it arrived. You do not need to open it. (You can also pick the conversations.json file from inside it.)
3. Story Canon reads it on this computer. Then it says how many chats are in the export and the dates they were started, newest first.
4. To find chats about your book, type in the box marked **A name, a character, a phrase**. It looks inside every message, not just the titles. A line tells you how many chats mention it, with the ones that have it in their name first, then the ones that mention it most.
5. Tick each chat that belongs to this novel. The button changes to **Bring in 3 chats** (or however many you ticked).
6. Click it. A line shows progress: "Bringing in 2 of 3."
7. When it finishes, each chat is listed with **Everything kept** (or **Check this one** if something went wrong), its message count, and how many behind-the-scenes steps were left out. Click a chat's name to open it, or **Done** to close.

**What happens to each chat:**

- It comes in word for word, with who said what and when.
- **Long text you pasted into Claude comes in too.** Claude sometimes tucks a long paste away as an attachment. Story Canon brings it in as part of your message.
- **Behind-the-scenes steps are left out, and counted.** Tool steps and the app's private reasoning are not conversation, so they stay out of an export bring-in, and the finished list tells you how many, so nothing disappears without you knowing.
- **Chats you already brought in** say **already here** beside their name, so you do not bring one in twice.
- Only the chats you tick are added. The rest of the file is never stored.

**Things that look odd but are working as designed:**

- **"A chat started outside those dates is in a different export."** An export only holds chats up to the day you asked for it. A newer chat needs a newer export.
- **"Showing 1,000 of 1,400. Search to narrow the list."** Very large exports show the first thousand. Type in the search box to find the rest.
- **"That zip has no conversations file in it."** You picked a different zip. Pick the export zip as it arrived.

**The common mistake** is unzipping the file first and then picking a random file from inside. Pick the .zip itself.

### Bringing in one conversation by pasting it

For a single chat, an email thread or a transcript, use **Bring in a conversation**.

1. Click **Bring in a conversation**.
2. Type a **Name** for it.
3. Paste the whole thing into **The conversation**, or use the file chooser to pick a saved .md or .txt file. (Picking a file fills in the name from the file name.)
4. Click **Bring it in**.

Story Canon works out who said what from how the text is laid out:

| If your text looks like | It is read as |
| --- | --- |
| "You said:" and "ChatGPT said:" (or Claude, Gemini, Copilot) on their own lines, as when you copy a web chat | A copied chat: your lines and the AI's lines. |
| "Name: what they said" at the start of lines, with two to six different names | Named lines, one message per line. Lines from "Me" or your own name count as yours. |
| A saved ChatGPT export with headers | Each header starts a message, with its date. |
| Anything else | One single block, signed "Pasted text." Nothing is lost. |

Then a report appears, such as "Everything was kept. 12 messages (6 from you), 8,140 characters, read as copied chat." Click **Open it**. If the report instead says "Some text may not have been kept," check the conversation before relying on it.

## Selecting words in a chat

The most useful thing you do in a conversation is catch what matters as you read it. You do that by selecting words.

**How:** click and drag across any words inside one message. (A selection that runs across two messages does nothing; select within one.) A bar slides up from the bottom of the window. At its top it repeats the words you chose in quotation marks, so you can check you caught the right ones.

The bar's buttons:

| Button | What it does | Where the result goes |
| --- | --- | --- |
| **Keep this line** | Saves the words as a line you may want to use, credited to whoever said them. | **Kept lines**, in the Story Brain. |
| **It's a question** | Files the words as a question to answer. | **Questions I have**, in **Questions and ideas**. |
| **It's an idea** | Files the words as an idea you are considering. | **Things and ideas I'm thinking about**, in **Questions and ideas**. |
| **Add as a possibility** | Opens a second row so you can add the words, in pencil, to one blank on one record. | The record and blank you choose. |
| **Not canon** | Marks the words as never part of your story. | Stays in the conversation, crossed out. |
| **Cancel** | Closes the bar. Nothing is saved. | Nowhere. |

After any of these, the words in the message are highlighted (or crossed out, for **Not canon**), and a small tag under the message names what you did.

### Keep this line

**What it is:** a **kept line** is a phrase you might use one day: a joke, a description, a line of dialogue. Keeping it does not put it in your book.

**Why:** good lines turn up in chats and then vanish in the scroll. Kept, they wait in one place with their source.

**Example.** ChatGPT writes, "Francine lit the match once and the fire feeds itself." You select it and click **Keep this line**. It appears under **Kept lines** in the Story Brain, credited to ChatGPT, linked to the message. See [Kept lines: every field](#kept-lines-every-field) for what you can add to it there.

### It's a question and It's an idea

Select words that ask something you need to settle, and click **It's a question**. Select words that offer something you might use, and click **It's an idea**. Both go to **Questions and ideas** at the top of the Story Brain's list, word for word, with a link back to the message. See [Questions I have: every field](#questions-i-have-every-field).

A question you catch from an AI's message is kept apart from your own questions, as one the AI raised, until you adopt it. That way nothing is filed under your name that you did not ask.

### Add as a possibility

A **possibility** is a maybe written on a record, in pencil, linked back to these words. Nothing is decided.

1. Select the words.
2. Click **Add as a possibility**. The button stays pressed and a row appears: **Add it in pencil to**.
3. In **Which record…**, choose the record (grouped by kind, like the focus list).
4. In **Which part…**, choose the blank on that record. Each is shown as its group and its name, such as "Identity: Age."
5. Click **Add it**.

The words now sit on that record, linked to this message, and **Where did this come from?** on the record opens it. Their status depends on who said them:

- **Words you said** (or words pasted from a person) go in as **Developing**, in pencil.
- **Words an AI said** (ChatGPT, Claude, the collaborator) go in as a **Suggestion**, a slip that waits for you to accept it. An AI's idea never becomes yours by being selected. You still choose it on purpose.

**The common mistake** is using **Keep this line** for facts. A kept line is for wording you like. A fact about a character belongs on the character, so use **Add as a possibility**.

### Not canon

**Canon** means "officially part of the story." **Not canon** marks words as something you have ruled out, so they are never mistaken for a decision later, by you, by search, or by the collaborator.

**When to use it:** a chat proposed a twist you rejected, and you want the rejection on record. The words stay, crossed out, so you can see what you turned down and when.

### Linking a selection to a record

Without **Add as a possibility** pressed, the second row of the bar reads **Link it to a record (optional)** with a dropdown that starts on **No record**.

Choose a record before you click **Keep this line**, **It's a question** or **It's an idea**, and what you save is also linked to that record. It then shows on that record too, so you find it where you work. The line at the bottom of the bar says so: "Linked, it also shows on that record, so you find it where you work."

**Example.** You select "Does Anthony know about the marriage trouble?" choose **Anthony Vernon** under **Link it to a record**, and click **It's a question**. The question waits in Questions and ideas and also appears on Anthony's page.

### Removing a mark

Each tag under a message ends with a small **×**. Click it to remove that mark. The words go back to plain, and the mark is gone from the conversation. Anything the mark already created (a kept line, a question) stays where it went, and you handle it there.

## Harvest: gathering what a conversation produced

**Harvest** is a summary page of everything you caught in one conversation, in one list, so you can see what a long chat actually produced.

**Where:** the **Harvest** button at the top right of any open conversation.

**When to use it:** at the end of a planning session, or when you come back to an old conversation and want to remember what came of it.

**What the page shows,** after a line that counts the messages and names who took part:

| Section | What is in it |
| --- | --- |
| **Lines you kept** | Everything you saved with **Keep this line**. |
| **Possibilities** | Everything you added with **Add as a possibility**, with the record, the blank, its status word, and who said it if it was an AI. |
| **New questions** | Questions you caught with **It's a question**, plus questions the collaborator raised, marked "the collaborator raised it; it waits in Questions and ideas." |
| **New ideas** | Ideas you caught with **It's an idea**. |
| **Not canon** | What you ruled out, crossed through. |
| **What this touches** | The characters, scenes and other records that what you caught is linked to, plus the record this conversation was about. These are the places to look next. |
| **Suggestions still waiting** | Suggestions from this conversation you have not answered. Only shown when there are some. |

At the bottom are two buttons. **Done, back to writing** marks the conversation as harvested and takes you straight back to the scene you were writing. **Done, back to conversations** marks it harvested and returns to the list. Either way, the list then shows **harvested** beside the conversation.

**This looks broken but is not:** a freshly imported conversation shows **None.** under every heading. Harvest does not read the conversation and pick things out for you. That would be the program deciding what matters. It gathers what *you* caught. Go back with **Back to the conversation**, select the words that matter, and Harvest fills up.

**Example.** After an hour talking through the rival florists' wedding disaster, Harvest shows two kept lines, one possibility on Rosa ("Motive: jilted at that church," Developing), three new questions, and under **What this touches**, Rosa and the church. You know exactly where to go next.

## Adding a message from elsewhere

At the very bottom of every conversation is a box called **Add a message from elsewhere**. It lets you add one message by hand, word for word.

**When to use it:**

- You asked ChatGPT something on your phone and want the answer kept with this conversation.
- Your writing group emailed a good idea.
- You want to write your own thinking into a conversation, as a note to yourself.

**How:**

1. Paste or type the message into the box.
2. Choose who said it: **From me** or **From an AI, such as ChatGPT**.
3. Click **Add**.

It appears at the end of the conversation like any other message, and you can select words in it, keep lines from it, and harvest it.

**This works with the collaborator off.** It is the way to build a conversation by hand. Adding a message here never sends anything to Claude.

**The common mistake** is pasting a whole long chat here one message at a time. For a full chat, use **Bring in a conversation**, which sorts out who said what for you.
