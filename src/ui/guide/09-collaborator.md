# Conversations and the collaborator

This chapter covers the **Conversations** view and the collaborator, which live there together. The first half is about conversations themselves: keeping every chat you have about your book (with ChatGPT, with Claude in a web browser, with a friend over email), bringing them in, catching the words that matter, and gathering what a conversation produced. The second half is about the collaborator, Story Canon's optional AI thinking partner: what it does and never does, how to turn it on, how to ask it well, and how to turn it off. Read the first half whenever you have a chat worth keeping. Read the second half only if you want to use AI at all.

You can use everything in the first half without the collaborator. Bringing in chats, selecting words to keep, and Harvest all work with the collaborator switched off, and with no internet connection.

## The Conversations view: every conversation, word for word

**Where:** **Conversations**, in the list on the right.

**What it is.** One page that lists every conversation kept in this novel. A **conversation** here is any back-and-forth about your book, kept word for word: a chat you brought in, a talk with the collaborator, or one you built by hand.

**Why keep conversations here at all?** Ideas from a chat are easy to lose and hard to trace. Months later you will not remember whether a line was yours or ChatGPT's. Here, every conversation is kept whole, and anything you keep from it links back to the exact message. On a record, **Where did this come from?** opens the very words.

**Do most writers need it?** If you ever talk your book through in a chat app, yes. If you never do, you can skip this view entirely.

Each row in the list shows the conversation's name (click it to open), then how many messages it has, how many places you kept or marked, the word **harvested** if you have run Harvest on it, and the date it began. The newest is at the top.

Across the top are three buttons:

- **Bring in from a Claude or ChatGPT export** brings in whole chats from a data export file. See [Bringing in chats from a Claude or ChatGPT export](#bringing-in-chats-from-a-claude-or-chatgpt-export).
- **Bring in a conversation** brings in one conversation you paste, or save as a text file. See [Bringing in one conversation by pasting it](#bringing-in-one-conversation-by-pasting-it).
- **Start a new one** starts an empty conversation named "Conversation" and today's date. You can fill it yourself, or ask the collaborator in it.

### Reading a conversation

Inside a conversation:

- **All conversations** (top left) goes back to the list. **Harvest** (top right) is explained in [Harvest: gathering what a conversation produced](#harvest-gathering-what-a-conversation-produced).
- Under the name, a line counts the messages and reminds you to select words to keep them.
- Each message starts with who said it and when, such as "ChatGPT, Oct 14, 2026, 1:34 PM".
- Your own messages have a magenta line down the left and are set in the book's typeface. Messages from anyone else have a gray line and plain type, so you can tell your words from theirs at a glance.

**Things that look odd but are working as designed:**

- **Stars and pound signs**, like `**Yes.**` or `## 1.`, appear in messages from ChatGPT or Claude. Those apps use these marks for bold text and headings. Story Canon keeps every character exactly as it was written, so the marks stay.
- **A bold heading with no name or time above it** is part of the message before it. The original file had a heading inside a message that looked like a new speaker, so Story Canon shows it as a continuation, not as a new person talking.
- **Short codes in square brackets** in a message, such as line or page markers, come from a document the other app read during the chat. They were in the original.
- **A line in square brackets starting "Attached:"** at the end of one of your messages means you attached a file or pasted a long text into Claude, which tucked it away as an attachment. Story Canon brings the attached text back in as part of your message, right after that line.

### Behind-the-scenes steps, out of sight

Chats from ChatGPT and Claude often contain steps nobody said out loud: the app reading a file, running code, searching the web, or leaving notes to itself. Story Canon calls these **behind-the-scenes steps**.

They are kept, because nothing is ever thrown away, but they are not conversation, so they are out of sight. A line under the conversation's name says how many there are, for example "12 behind-the-scenes steps (tools, code and the app's notes to itself) are kept too, out of sight, because they are not conversation."

- **Show them** displays them faintly, each headed "Behind the scenes:" and the step's name.
- **Hide them** puts them away again.
- The message count at the top, and on the list, counts real messages only.

ChatGPT also tucks little citation codes into its answers, which show as garbled symbols in some programs. Story Canon keeps them in the stored text but does not display them.

## Bringing in chats from a Claude or ChatGPT export

**What it is.** Both Claude and ChatGPT can send you a copy of every chat you have had, called a **data export**. It arrives as a .zip file: one compressed file that holds many files inside. You ask for it in each app's own settings, and the app emails you a link to download it.

**When to use this:** you planned part of your book in Claude or ChatGPT and want those conversations kept with the book, searchable and traceable.

**How:**

1. In **Conversations**, click **Bring in from a Claude or ChatGPT export**.
2. Click the file chooser and pick the .zip file just as it arrived. You do not need to open it. (You can also pick the conversations.json file from inside it.)
3. Story Canon reads it on this computer. Nothing is sent anywhere. Then it says how many chats are in the export and the dates they were started, newest first.
4. To find chats about your book, type in the box marked **A name, a character, a phrase**. It looks inside every message, not just the titles. A line tells you how many chats mention it, with the ones that have it in their name first, then the ones that mention it most.
5. Tick each chat that belongs to this novel. The button changes to **Bring in 3 chats** (or however many you ticked).
6. Click it. A line shows progress: "Bringing in 2 of 3."
7. When it finishes, each chat is listed with **Everything kept** (or **Check this one** if something went wrong), its message count, and how many behind-the-scenes steps were left out. Click a chat's name to open it, or **Done** to close.

**What happens to each chat:**

- It comes in word for word, with who said what and when.
- **Long text you pasted into Claude comes in too**, as part of your message.
- **Behind-the-scenes steps are left out, and counted.** Tool steps and the app's private reasoning are not conversation, so they stay out of an export bring-in, and the finished list tells you how many, so nothing disappears without you knowing.
- **Chats you already brought in** say **already here** beside their name, so you do not bring one in twice.
- Only the chats you tick are added. The rest of the file is never stored.

**Things that look odd but are working as designed:**

- **"A chat started outside those dates is in a different export."** An export only holds chats up to the day you asked for it. A newer chat needs a newer export.
- **"Showing 1,000 of 1,400. Search to narrow the list."** Very large exports show the first thousand. Type in the search box to find the rest.
- **"That zip has no conversations file in it."** You picked a different zip. Pick the export zip as it arrived.

**The common mistake** is unzipping the file first and then picking a random file from inside. Pick the .zip itself.

**Example.** You talked through the empty boat in *The Keeper of Gull Point* with ChatGPT over a dozen evenings. You request your ChatGPT export, pick the .zip, and type "Marisol" in the search box. Fourteen chats mention her. You tick the twelve about this book (two were about a different Marisol entirely) and click **Bring in 12 chats**.

## Bringing in one conversation by pasting it

For a single chat, an email thread or a transcript, use **Bring in a conversation**.

1. In **Conversations**, click **Bring in a conversation**.
2. Type a **Name** for it.
3. Paste the whole thing into **The conversation**, or use the file chooser to pick a saved .md or .txt file. (Picking a file fills in the name from the file name.)
4. Click **Bring it in**.

Story Canon works out who said what from how the text is laid out:

| If your text looks like | It is read as |
| --- | --- |
| "You said:" and "ChatGPT said:" (or Claude, Gemini, Copilot) on their own lines, as when you copy a web chat | A copied chat: your lines and the AI's lines |
| "Name: what they said" at the start of lines, with two to six different names | Named lines, one message per name. Lines from "Me", "You" or your own name count as yours |
| A saved transcript with a header line for each message, giving a name, a date and a type, separated by bars | Each header starts a message, with its date |
| Anything else | One single block, signed "Pasted text". Nothing is lost |

Then a report appears, such as "Everything was kept. 12 messages (6 from you), 8,140 characters, read as copied chat." Click **Open it**. If the report instead says "Some text may not have been kept. Check the conversation before relying on it.", open it and read it through before you rely on it.

**The common mistake** is pasting a chat with the speaker names stripped out. Without "You said:" or "Name:" lines, it comes in as one block. That is safe (nothing is lost), but you cannot tell who said what.

## Adding a message from elsewhere

At the very bottom of every conversation is a box called **Add a message from elsewhere**. It adds one message by hand, word for word.

**When to use it:**

- You asked ChatGPT something on your phone and want the answer kept with this conversation.
- Your writing group emailed a good idea.
- You want to write your own thinking into a conversation, as a note to yourself.

**How:**

1. Paste or type the message into the box.
2. Choose who said it: **From me** or **From an AI, such as ChatGPT**.
3. Click **Add**.

It appears at the end of the conversation like any other message, and you can select words in it, keep lines from it, and harvest it.

**This works with the collaborator off.** It is the way to build a conversation by hand. Adding a message here never sends anything anywhere.

**The common mistake** is pasting a whole long chat here one message at a time. For a full chat, use **Bring in a conversation**, which sorts out who said what for you.

## Selecting words in a conversation

The most useful thing you do in a conversation is catch what matters as you read it. You do that by selecting words.

**How:** click and drag across any words inside one message. (A selection that runs across two messages does nothing; select within one.) A bar slides up from the bottom of the window. At its top it repeats the words you chose in quotation marks, so you can check you caught the right ones.

The bar's buttons:

| Button | What it does | Where the result goes |
| --- | --- | --- |
| **Keep this line** | Saves the words as a line you may want to use, credited to whoever said them | **Kept lines**, in the Story Brain |
| **It's a question** | Files the words as a question to answer | The page **Questions** (headed **Questions I have**) in **Questions and ideas**; an AI's words go to the page **Questions an AI raised** instead |
| **It's an idea** | Files the words as an idea you are considering | The page **Ideas** (headed **Things and ideas I'm thinking about**) in **Questions and ideas** |
| **Add as a possibility** | Opens a second row so you can add the words, in pencil, to one field on one record | The record and field you choose |
| **Not canon** | Marks the words as never part of your story | Stays in the conversation, crossed out |
| **Cancel** | Closes the bar. Nothing is saved | Nowhere |

After any of these (except **Cancel**), the words in the message are highlighted, or crossed out for **Not canon**, and a small tag under the message names what you did: **Kept**, **Possibility**, **Question**, **Idea** or **Not canon**.

### Keep this line

**What it is.** A **kept line** is a phrase you might use one day: a joke, a description, a line of dialogue. Keeping it does not put it in your book.

**Why.** Good lines turn up in chats and then vanish in the scroll. Kept, they wait in one place with their source.

**Example.** ChatGPT writes, "The lighthouse doesn't save ships. It only tells them where the rocks are." You select it and click **Keep this line**. It appears under **Kept lines** in the Story Brain, credited to ChatGPT, linked to the message. Its record says "Written by ChatGPT, kept by you, placement open". To tie it to the scene where you might use it, connect it to that scene card with **appears in**.

### It's a question and It's an idea

Select words that ask something you need to settle, and click **It's a question**. Select words that offer something you might use, and click **It's an idea**. Both go to **Questions and ideas** in the Story Brain, word for word, with a link back to the message.

A question you catch from an AI's message (the collaborator's, or ChatGPT's in a chat you brought in) is kept apart from your own questions. It waits in **Questions and ideas**, on its own page, **Questions an AI raised** (that page tab appears only while there is one), until you click **Make it one of my questions** (or **Not relevant**). That way nothing is filed under your name that you did not ask.

### Add as a possibility

A **possibility** is a maybe written on a record, in pencil, linked back to these words. Nothing is decided.

1. Select the words.
2. Click **Add as a possibility**. The button stays pressed and the second row changes to **Add it in pencil to**.
3. In **Which record…**, choose the record. Records are grouped by kind, like a table of contents.
4. In **Which part…**, choose the field on that record. Each is shown as its group and its name, such as "Identity: Age".
5. Click **Add it**.

The words now sit in that field, linked to this message, and **Where did this come from?** beside them opens it. Their status depends on who said them:

- **Words you said** (or words pasted from a person) go in as **Developing**, in pencil.
- **Words an AI said** (ChatGPT, Claude, the collaborator) go in as a **Suggestion**, a slip that waits for you to accept it. An AI's idea never becomes yours just by being selected. You still choose it on purpose.

**The common mistake** is using **Keep this line** for facts. A kept line is for wording you like. A fact about a character belongs on the character, so use **Add as a possibility**.

### Not canon

**Not canon** marks words as something you have ruled out, so they are never mistaken for a decision later, by you, by Search, or by the collaborator.

**When to use it:** a chat proposed a twist you rejected, and you want the rejection on record. The words stay, crossed out, so you can see what you turned down and when.

### Linking a selection to a record

Without **Add as a possibility** pressed, the second row of the bar reads **Link it to a record (optional)**, with a dropdown that starts on **No record**.

Choose a record before you click **Keep this line**, **It's a question** or **It's an idea**, and what you save is also connected to that record. It then shows on that record too, so you find it where you work. The line at the bottom of the bar says so: "Linked, it also shows on that record, so you find it where you work."

**Example.** In a chat you wrote, "Does Cyrus know whose boat it is?" You select it, choose **Cyrus Hale** under **Link it to a record**, and click **It's a question**. The question waits in **Questions and ideas** and also appears on Cyrus's record.

### Removing a mark

Each tag under a message ends with a small **×**. Click it to remove that mark. The words go back to plain, and the mark is gone from the conversation. Anything the mark already created (a kept line, a question) stays where it went, and you handle it there.

## Harvest: gathering what a conversation produced

**What it is.** **Harvest** is a summary page of everything you caught in one conversation, in one list, so you can see what a long chat actually produced.

**Where:** the **Harvest** button at the top right of any open conversation.

**When to use it:** at the end of a planning session, or when you come back to an old conversation and want to remember what came of it.

**What the page shows,** after a line that counts the messages and names who took part:

| Section | What is in it |
| --- | --- |
| **Lines you kept** | Everything you saved with **Keep this line** |
| **Possibilities** | Everything you added with **Add as a possibility**, with the record, the field, its status word, and who said it if it was an AI |
| **New questions** | Questions you caught with **It's a question** |
| **New ideas** | Ideas you caught with **It's an idea** |
| **Not canon** | What you ruled out, crossed through |
| **What this touches** | The characters, scenes and other records that what you caught is linked to, plus the record this conversation was about. These are the places to look next |
| **Suggestions still waiting** | Suggestions from this conversation you have not answered. Shown only when there are some |

At the bottom are two buttons. **Done, back to writing** marks the conversation as harvested and takes you straight back to the scene you were writing. **Done, back to conversations** marks it harvested and returns to the list. Either way, the list then shows **harvested** beside the conversation. **Back to the conversation**, at the top, leaves without marking anything.

**This looks broken but is not:** a freshly brought-in conversation shows **None.** under every heading. Harvest does not read the conversation and pick things out for you. That would be the program deciding what matters. It gathers what *you* caught. Go back with **Back to the conversation**, select the words that matter, and Harvest fills up.

**Example.** After an hour talking through the empty boat, Harvest shows two kept lines, one possibility on Cyrus Hale ("Secret: he heard the mayday", Developing), three new questions, and under **What this touches**, Cyrus Hale, Eli and the scene card "The harbor inquest". You know exactly where to go next.

## The collaborator: what it is, and what it never does

**The collaborator** is an AI writing partner inside Story Canon. It is powered by Claude, an AI made by the company Anthropic. You type a question in a conversation, and it answers there, the way a chat app does.

The difference is what it knows and what it is allowed to do. A chat app in your web browser starts every conversation knowing nothing about your book. It treats your maybes as facts, and it will happily rewrite your chapter if you paste it in. The collaborator is built the other way around.

**What it does:**

- It reads your decisions, your open questions, your guardrails and your beat sheet before it answers, so "I'm stuck on the Catalyst" means *your* Catalyst.
- It reads your **About you** answers (in Settings), so it calls you by your name, uses your pronouns, and helps the way you said you like to be helped.
- It tells you which things are yours and settled, which are still open, and which are its own idea.
- It offers ideas as suggestions. A suggestion waits for you in the Story Brain. Nothing it says becomes part of your story until you accept it.

**What it never does:**

- It never writes into your manuscript. It has no way to type into your pages.
- It never decides anything. It cannot mark a fact Decided. Only you can.
- It never drafts anything you marked as **kept for you** (a mark for work only you will do; see [Kept for you: work only you will do](#kept-for-you-work-only-you-will-do)). On those, it asks questions or teaches instead.
- It writes sample lines only when you ask for them, and labels each one "One way it could be done", which means an example, never a decision.

**Why it is built this way.** A novel has to sound like one person. The moment an AI's sentences slip into your pages, your voice starts to blur, and you can no longer tell which ideas were yours. Keeping the collaborator outside your pages, with its ideas waiting on slips, gives you a sounding board without losing authorship.

**Do most writers need it?** No. It is entirely optional, it costs money per question, and every other part of Story Canon works without it. Some writers use it daily; many never turn it on.

**The common mistake** is saying "sure, sounds good" in a conversation and assuming that settled it. Agreeing in a chat changes nothing in your story. If you want an idea, accept it in **Suggestions waiting**, on purpose.

**Example.** You ask the collaborator, "Why would Cyrus stay silent for twelve years?" It answers with two possible motives, then leaves a suggestion slip on Cyrus's record: "Motive: he was drinking on duty that night." Cyrus's record does not change. The slip waits until you say yes, not yet, or no.

## Turning the collaborator on

The collaborator is off until you turn it on, and it is turned on one novel at a time. Until you do, nothing about your book is sent anywhere.

### Getting an API key and using it

An **API key** is a private code, like a password, that lets Story Canon talk to Claude on your behalf. Anthropic bills each question you ask to that key, from credit you load in advance. A Claude.ai subscription is separate and does not include this. You create a key in Anthropic's Console (Anthropic's website for developers), after adding credit there, and paste it into Story Canon in **Settings**, page **4 The collaborator**.

**Where:** **Settings**, page **4 The collaborator**. Click that tab in the row of page tabs near the top of Settings.

**How:**

1. Open **Settings** and click the page tab **4 The collaborator**.
2. Click in the box marked **Claude API key** and paste your key. The letters show as dots so nobody can read it over your shoulder.
3. Click **Use this key**. The box is replaced by the words **Your key is set.**
4. Tick the box described in the next section.

The heading says **Takes effect right away**. That means these choices are kept the moment you make them. You do not need **Save settings** for this section.

**Where the key is kept.** The line under the key says **The key is kept in Windows secure storage.** That is the same locked store Windows uses for its own passwords. The key is never put into your novel, your backups or your exports. If Windows cannot store it, a note says "Your key works for now, but this computer could not store it securely, so you will need to enter it again next time."

**If the key is wrong**, the first question you ask shows: "Claude did not accept the API key. Check it in Settings. Your message is kept." Your question is saved in the conversation either way. Two other messages you may see: "Claude is busy right now. Try again in a minute. Your message is kept." and "The collaborator could not be reached. Check the internet connection. Your message is kept."

### Use the collaborator for this novel

Under the key is a tick box that reads **Use the collaborator for** and your novel's title, followed by "Story records you ask about are sent to Claude when you ask."

- **What it means:** ticking it is your permission for this one novel. It is the switch that lets anything about this book leave your computer.
- **When it sends:** only when you click **Ask**. Story Canon never sends anything in the background.
- **Each novel is separate.** Turning it on for *The Keeper of Gull Point* does not turn it on for your other books.

The box below it, **Also share the prose of a scene when I ask about that scene**, is off at first, and can only be ticked once the first box is. **Prose** means your actual written sentences, as opposed to your notes and plans.

- **Off:** the collaborator sees your plans and records, never your pages.
- **On:** when you ask from inside a scene (with **Ask about this scene** in the Writing Room), it also sees the text of that one scene, up to about the last twelve thousand characters. It never sees other scenes' pages, and it is told never to rewrite them.

**When to turn it on:** when you want the collaborator to comment on a scene you wrote, for example with **Critique** (one of the six ways to ask, explained in [The six ways to ask](#the-six-ways-to-ask)). Many writers leave it off while drafting and turn it on in revision.

### Choosing which Claude answers

Under **Which Claude answers** you pick the model. A **model** is one version of Claude. They differ in how carefully they think, how fast they answer, and how much each question costs.

| Choice | What the screen says | Good for |
| --- | --- | --- |
| **Opus** | The most careful reader and thinker. Slower, and costs the most per question. | Critique, deep structure questions, teaching. This is the starting choice |
| **Sonnet** | Thoughtful and quicker. A good everyday choice at a middle cost. | Most everyday talking it through |
| **Haiku** | The fastest and least costly. Good for quick checks and short questions. | Short, simple questions |
| **Fable** | Another Claude model your key may reach. Check its price with Anthropic before you choose it. | Only if you know you want it |

The line above the choices says it plainly: "Each question is billed to your own key. Longer questions and longer answers cost more." Your choice applies to this novel and takes effect right away.

## What the collaborator sees when you ask

Every time you click **Ask**, Story Canon gathers a briefing about your book and sends it along with your question. Knowing what is in it helps you ask well, and tells you exactly what leaves your computer.

**What is sent with every question:**

- Your **About you** answers: your name, pronouns, how you find your story, your writing experience, how you like to be helped, what to avoid, and anything else you wrote there.
- The novel's title and its one sentence, and what you chose in Novel setup: genres, story types, how the story is told, and your storytelling toolkit, including your own methods.
- Every current fact in your Story Brain, each with its status word (Decided, Developing, Still open, Example or Suggestion). Older versions you replaced are left out, and so is anything you set aside.
- Your **beat sheet**, in order: each beat, what you wrote on it, and the names of the scene cards placed there or that might go there.
- Your **guardrails** (the rules your story must never break, written on a record), with an instruction to warn you if an idea would break one.
- Which scenes and records you marked as kept for you, so it never drafts them.
- Up to twelve open questions from the Story review (see [Catching problems: the continuity checks](#catching-problems-the-continuity-checks)).
- Your **craft shelf**, the list of craft books and teachers you keep in **Settings**, page **6 All my novels** (see [Settings: My craft shelf](#settings-my-craft-shelf)), so **Where to learn more** starts with your own books.
- The last thirty messages of this conversation, so it remembers what you just discussed.
- If the conversation is focused on a record, everything on that record (see [Focusing a conversation on one record or scene](#focusing-a-conversation-on-one-record-or-scene)).

**What is never sent:**

- Your manuscript pages, unless you ticked **Also share the prose of a scene when I ask about that scene**, and then only the one scene you asked from.
- Your private writing aids on a character: casting notes, theme music and playlists.
- Documents you brought in, other conversations, and earlier versions of anything.

**Why it matters.** The briefing is why the collaborator's answers fit your book instead of books in general. It is also why a tidy Story Brain gets you better help: a decision written down as **Decided** is treated as settled, while the same idea left in pencil is treated as still open.

**The common mistake** is expecting it to know something you only said in another conversation. Each conversation carries only its own last thirty messages. What it knows across conversations is what you put into the Story Brain.

## Guidance levels: Quiet, Advisory and Deep

A **guidance level** is how much the collaborator speaks up beyond what you asked. You set it in **Settings**, on page **2 Goals and November**, under **Guidance and goals**, with two dropdowns: **Guidance while drafting** and **Guidance while planning**. Unlike the collaborator section, these are saved with **Save settings**.

| Level | On screen | What the collaborator does |
| --- | --- | --- |
| **Quiet** | Quiet: note concerns, never interrupt | Answers only what you asked, briefly. It raises nothing else unless your idea would break a decision or a guardrail |
| **Advisory** | Advisory: small notices you can ignore | Answers what you asked, then mentions at most one thing you may want to look at next |
| **Deep** | Deep: full detail on everything it notices | Gives the full conversation: teaches, questions, and points out structure, cause and effect, and character problems it notices |

### Guidance while drafting and while planning

Which of your two levels applies depends on where you asked from:

- **While drafting** applies when you ask about a scene, from a conversation you started with **Ask about this scene** in the Writing Room. It starts at **Quiet**, because a writer in the middle of a scene needs an answer, not a lecture.
- **While planning** applies to every other conversation: ones you start in **Conversations** and ones you start with **Ask about this** on a record. It starts at **Advisory**.

**When to change them.** Turn planning up to **Deep** on a day you want to be challenged on structure. Turn drafting down to **Quiet** (or leave it there) when you are trying to finish pages.

**Example.** With planning at **Deep**, you ask "Is the Midpoint of *The Keeper of Gull Point* strong enough?" The answer covers the Midpoint, then asks whether the stakes rise afterward and whether Marisol causes her own trouble. With **Quiet**, the same question gets a short answer about the Midpoint only.

## Asking the collaborator

Every conversation with the collaborator is kept in **Conversations**, word for word, like a chat you brought in. You can start one three ways.

### Three ways to start a conversation with the collaborator

| Where you are | What you click | What you get |
| --- | --- | --- |
| **Conversations** | **Start a new one** | A new conversation named with today's date, about nothing in particular |
| Any record in the Story Brain | **Ask about this**, near the top of the record | A conversation named "About" and the record's name, already focused on that record |
| A scene in the Writing Room | **Ask about this scene**, above the page | A conversation named "About the scene" and the scene's name. The scene goes along with every question, and the conversation is focused on its scene card |

All three land you in **Conversations** with the new conversation open. (**Ask about this scene** is hidden while you are in **Focus** in the Writing Room, with only the page on screen, or in a writing sprint, so nothing pulls you out of the page.)

**How to ask, step by step:**

1. Scroll to **Ask the collaborator**, below the messages.
2. Choose one of the six ways to ask (the next section explains each).
3. Type in the box marked **Your question**.
4. If you like, choose a record in **Focus on… (optional)**.
5. Click **Ask**, or press **Ctrl+Enter**. The button reads **Thinking…** while you wait.

Your question and the answer appear in the conversation. Your message is signed with the name you gave in **About you** (or, if that is empty, the name in Settings under **Your name**), and the answer is signed **Collaborator**.

**If the collaborator is off**, the place where **Ask the collaborator** would be says "The collaborator is not set up" (or "is off for this novel"), with a link, **Turn it on in Settings**, and "Nothing is sent anywhere until you do." The link opens Settings at page **4 The collaborator**. Nothing is broken. It is waiting for your key or your tick.

### The six ways to ask

Before you ask, you choose the kind of help you want. Each choice is a round button (pick one) with a short line under it. The choice shapes the answer more than any wording you could add.

| Choose | What you get | Use it when |
| --- | --- | --- |
| **Talk it through** | A creative partner who asks one question at a time. | You have a tangle and want to think out loud |
| **Teach it** | A full explanation, with examples that work and examples that do not. | You met a craft word or idea you do not fully understand |
| **Show it** | Two or three examples, each labeled "One way it could be done." | You understand the idea but cannot picture it on the page |
| **Hand it to me** | What is decided and what is open, then the writing comes back to you. | You are about to write a scene and want the facts laid out, not written for you |
| **Critique** | An honest read: what works, what does not yet, and why. | You want a straight answer about something you made |
| **Where to learn more** | Books and teachers to look up, starting with your own shelf. | You want to study a problem properly |

A few notes on each:

- **Talk it through** is the starting choice. It asks at most one useful question at a time, so it never buries you in a list of ten.
- **Teach it** names the idea, defines any term, explains why it works and how it usually fails, then gives a fresh example. It is the choice for "what is a Midpoint actually for?"
- **Show it** always gives more than one example in different flavors, so there is never one right answer to copy. Each is an example, not a decision. If you like one, it is still yours to write.
- **Hand it to me** sets up the scene and stops. It ends with a prompt that invites you to write. It never writes the scene.
- **Critique** separates what can be checked ("the clue is never planted before it pays off") from interpretation ("the ending may feel rushed"), and frames concerns as questions. It does not flatter.
- **Where to learn more** names books, authors and well-known sources only. It never gives page or chapter numbers and never invents a title. If it is unsure a book exists, it says so.

**The common mistake** is choosing **Talk it through** when you want a critique, then feeling the answer was soft. If you want honesty, choose **Critique**. If you want an explanation, choose **Teach it**.

### The Start from questions

Under the six choices is a row headed **Start from:** with ready-made questions. Clicking one fills in **Your question** for you and switches the choice to **Critique**. You can edit the words before you click **Ask**.

| Start from | What it asks the collaborator to look at |
| --- | --- |
| **Does this cause and effect convince?** | Where one event is said to cause the next but the link is only asserted, not earned |
| **Does what happens surprise the character?** | Where what the character expects parts from what actually happens, and whether that gap is big enough to matter |
| **Is this character deep enough?** | Questions a demanding editor would ask: want against need, the Lie (the wrong belief that drives them), contradictions, what they would never do. It asks; it does not fill in answers |
| **Do these voices sound different?** | Where a reader might confuse two characters by how they speak and think |
| **Does the comedy escalate?** | Whether each comic beat raises the stakes or only repeats |

These work best in a focused conversation, so the collaborator knows which scene, character or cause you mean.

**Example.** You open Marisol's record, click **Ask about this**, then click **Is this character deep enough?** and **Ask**. The collaborator, reading her Lie ("Anyone I care about will leave"), her Want and her Need, asks what Marisol would never do, even to keep Ana from leaving. It does not answer for you.

## Focusing a conversation on one record or scene

**What it is.** **Focus** tells the collaborator which record you are talking about. It then reads everything on that record, in full, including beats and scene cards, which the general briefing only names.

**Where:** the dropdown marked **Focus on… (optional)**, beside the **Ask** button.

**How it is arranged.** The list is grouped under the kind of record, like a table of contents: Characters, Relationships, Beats, Scene cards, Clues, Kept lines and so on. Beats and scene cards are in story order. Everything else is alphabetical. To jump, click the dropdown and type the first letters of a name.

**When to use it:** whenever your question is about one thing. "Is this character deep enough?" needs to know which character.

**Things that look odd but are working as designed:**

- A conversation started with **Ask about this** already has the focus set to that record.
- A conversation started with **Ask about this scene** has the focus set to the scene's card. If the scene had no card yet, Story Canon makes one for it, so the collaborator can read the scene's plan.
- You can change the focus between questions. Each question uses whatever is chosen when you click **Ask**.

**The common mistake** is asking about a character in an unfocused conversation and getting a general answer. The briefing holds every fact, but focus tells the collaborator which ones matter right now.

## Suggestions from the collaborator, and how they wait

When the collaborator has an idea it thinks belongs in your story, it does not just say it. It files a **suggestion**. A suggestion from the collaborator is one of three things:

- **A proposed fact** for one field of a record, such as a motive for Cyrus.
- **A proposed question**, one it thinks you should answer.
- **A proposed connection** between two records (a link such as "plants" or "reveals" that the continuity checks read).

After an answer that left suggestions, a note appears under the **Ask** button: "One suggestion is waiting for you. Nothing was decided." Beside it is a link, **Look at it in Suggestions waiting**.

**Nothing is decided.** A suggestion changes nothing in your story until you accept it. A proposed fact also shows on the record it is about, as a slip tucked in, under **Suggestions waiting for you** above the page tabs. A proposed question or connection waits only in **Suggestions waiting**.

### Answering a suggestion in Suggestions waiting

**Where:** **Story Brain**, the entry called **Suggestions waiting**, near the top of the list on the left (under **Questions and ideas** and **Choices ahead**). The number beside it counts what is waiting.

The screen has two numbered pages, each with its count in the page tab. Suggestions from the collaborator sit on the page **From the collaborator**. Ideas that came in from a chat or document you brought in sit on the page **From your planning documents**. ([Suggestions waiting: ideas you have not taken yet](#suggestions-waiting-ideas-you-have-not-taken-yet) covers this list in full.)

Each suggestion from the collaborator has these buttons:

| Button | Shown for | What it does |
| --- | --- | --- |
| **Accept as Decided** | A proposed fact | Writes the fact on the record as settled |
| **Accept as Developing** | A proposed fact | Writes the fact on the record in pencil, still yours to change |
| **Accept** | A proposed question or connection | Makes the question one of yours, in **Questions I have**, or draws the connection |
| **Not yet** | Every suggestion | Keeps it waiting, marked "(you said not yet)". The button then goes away, since it is already waiting |
| **No** | Every suggestion | Turns it down. It leaves **Suggestions waiting** and the record, and nothing in your story changes. Story Canon notes that you said no, but does not show it again |

Ideas under **From your planning documents** have three buttons instead: **Accept as Decided**, **Accept as Developing**, and **No, set it aside**. **No, set it aside** keeps the words on their record as **Set aside**, faded with a line through them, so you can still see what you turned down.

Accepting a fact on a record's own page turns to the page where it landed. Anything you accept stays marked as suggested by the collaborator and accepted by you.

**The common mistake** is accepting as **Decided** because the idea sounds good today. If you are not sure, accept it as **Developing**. Pencil is free.

**Example.** The collaborator suggests the question "What does Marisol lose if the boat's owner is found alive?" In **Suggestions waiting** it reads "New question:" and the question, with **Accept**, **Not yet** and **No**. You click **Accept**. It becomes one of your questions in **Questions I have**.

## The collaborator while the door is closed

**Door closed** keeps everything in Story Canon from judging your first draft until a day you choose; it is taught in [Goals: door closed](#goals-door-closed).

While the door is closed, any question you ask about a scene (from a conversation started with **Ask about this scene**) is treated as **Quiet**, whatever your drafting level says, and the collaborator is told you are getting the story down, not getting it right. It will not point out problems in the draft unless you ask for them by name, for example "What is weak about this scene?" Questions you ask outside a scene still use your planning level.

## Turning the collaborator off, or never using AI at all

**To turn it off for one novel:** open **Settings**, page **4 The collaborator**, and untick **Use the collaborator for** and your novel's title. It takes effect right away. Your conversations stay, word for word, and nothing more is sent. Tick it again any time.

**To turn it off for every novel:** click **Remove key** in the same section. The key belongs to you, not to one book, so removing it stops the collaborator in every novel until you add a key again.

**To stop sharing your pages but keep the collaborator:** untick **Also share the prose of a scene when I ask about that scene**. It goes back to seeing plans and records only.

**To never use AI at all:** do nothing. Never add a key and never tick the box. Story Canon works fully without it: the Story Brain, Narrative Zoom and every continuity check, the Writing Room, Search, Story Trail, bringing in chats and documents, keeping lines, and Harvest. None of them needs the internet, and nothing about your book leaves your computer.

**What stays when you turn it off.** Everything the collaborator ever said stays in its conversations. Suggestions it left are still waiting in **Suggestions waiting** for you to accept or turn down. Anything you already accepted stays in your story, marked on its record as suggested by the collaborator and accepted by you.

**The common mistake** is thinking you have to turn the collaborator on to use **Conversations**. You do not. The whole first half of this chapter works without it.
