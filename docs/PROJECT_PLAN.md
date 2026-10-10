# Project Plan — English for Uzbek Speakers

> Working name: **Vocabulary Notebook** (repo: `vocabularies-learn`). The final brand name is still open — see [Open questions](#17-open-questions).
>
> Status: draft v1 · 2026-10-03

---

## Table of contents

1. [Purpose and vision](#1-purpose-and-vision)
2. [Who it is for](#2-who-it-is-for)
3. [What makes it different](#3-what-makes-it-different)
4. [Where the code is today](#4-where-the-code-is-today)
5. [Core concepts (glossary)](#5-core-concepts-glossary)
6. [User journeys](#6-user-journeys)
7. [Feature modules and their business logic](#7-feature-modules-and-their-business-logic)
   - 7.1 [Accounts and sign-in](#71-accounts-and-sign-in)
   - 7.2 [Onboarding and placement test](#72-onboarding-and-placement-test)
   - 7.3 [Home and the daily plan](#73-home-and-the-daily-plan)
   - 7.4 [Vocabulary](#74-vocabulary)
   - 7.5 [Spaced repetition engine](#75-spaced-repetition-engine)
   - 7.6 [Exercise types and answer checking](#76-exercise-types-and-answer-checking)
   - 7.7 [Grammar course](#77-grammar-course)
   - 7.8 [Listening and pronunciation](#78-listening-and-pronunciation)
   - 7.9 [AI tutor](#79-ai-tutor)
   - 7.10 [Exam preparation (IELTS and the national CEFR test)](#710-exam-preparation-ielts-and-the-national-cefr-test)
   - 7.11 [Motivation: XP, streaks, leagues](#711-motivation-xp-streaks-leagues)
   - 7.12 [Progress and statistics](#712-progress-and-statistics)
   - 7.13 [Notifications and the Telegram bot](#713-notifications-and-the-telegram-bot)
   - 7.14 [Teachers and classes](#714-teachers-and-classes)
   - 7.15 [Content management (admin)](#715-content-management-admin)
   - 7.16 [Subscriptions and payments](#716-subscriptions-and-payments)
   - 7.17 [Offline mode](#717-offline-mode)
8. [Business rules — one-page summary](#8-business-rules--one-page-summary)
9. [Data model](#9-data-model)
10. [API endpoints](#10-api-endpoints)
11. [Frontend screens and routes](#11-frontend-screens-and-routes)
12. [Non-functional requirements](#12-non-functional-requirements)
13. [Content plan](#13-content-plan)
14. [Roadmap](#14-roadmap)
15. [Success metrics](#15-success-metrics)
16. [Risks](#16-risks)
17. [Open questions](#17-open-questions)

---

## 1. Purpose and vision

**Purpose.** Help Uzbek speakers learn English, from their first words up to the level they need for university, work and exams. The app teaches in Uzbek and is built around the mistakes Uzbek speakers actually make.

**Vision.** To be the app an Uzbek learner opens every day: the place where they learn new words, understand grammar in their own language, practise until it sticks, and prepare for IELTS or the national CEFR certificate.

**What "best" means for this project** — the outcomes we measure ourselves against:

| Outcome | How we know |
|---|---|
| Learners actually remember what they study | Review accuracy for mature words is 85% or higher (see §15) |
| Learners come back daily | Day-7 retention is 25% or higher, and the median streak keeps growing |
| Learners move up a CEFR level | Placement retests show measurable gains after 3 months |
| Content is trustworthy | Every published word and lesson has been checked by an Uzbek English teacher |
| It works where our users are | It loads fast on a cheap Android phone with a weak 3G signal, and works offline |

**Three product pillars**

1. **Vocabulary** — CEFR-levelled word decks with Uzbek meanings, plus the learner's own notebook, all scheduled with spaced repetition.
2. **Grammar** — a structured course from A1 to C1, explained in Uzbek, with exercises and the learner's mistakes brought back for review.
3. **Practice and feedback** — varied exercises, listening, and an AI tutor that explains mistakes in Uzbek and gives feedback on writing.

---

## 2. Who it is for

| Persona | Description | What they need |
|---|---|---|
| **Dilnoza, 17, school student** | Preparing for university entrance. Needs a CEFR certificate or IELTS 6.0+ for a grant. | A clear path, exam vocabulary, writing feedback, motivation to keep going. |
| **Jasur, 24, works in IT / sales** | Knows some English from school, gets stuck on grammar and speaking. | Short daily sessions, practical vocabulary, fixing old mistakes (articles, tenses). |
| **Malika, 35, beginner** | Wants English for travel or to help her children. Prefers explanations in Uzbek; may read Cyrillic more easily than Latin. | A gentle start, everything in Uzbek, audio for every word. |
| **Teacher at a learning centre** | Teaches 3–6 groups of 10–20 students. | Assign homework, see who did it, spot common mistakes. |

**Primary market:** Uzbekistan, mostly on Android phones, with Telegram as the main messaging platform.
**Interface languages:** Uzbek Latin (default), Uzbek Cyrillic, and English. Russian may come later.

---

## 3. What makes it different

Duolingo, Anki and Quizlet already exist, so we win by being built specifically for Uzbek speakers.

### 3.1 Taught in Uzbek
Meanings, grammar explanations, hints and feedback are all in Uzbek. The learner can switch between Latin and Cyrillic script at any time. Script conversion is done automatically from the Latin source text.

### 3.2 Built around the mistakes Uzbek speakers make
Every grammar topic and exercise is tagged with the error patterns it targets. The main ones:

| Error pattern (tag) | Why it happens | Example mistake |
|---|---|---|
| `articles` | Uzbek has no articles | ~~I have car.~~ → I have **a** car. |
| `he-she` | Uzbek "u" covers he, she and it | ~~My mother, he is a doctor.~~ |
| `copula` | Uzbek often leaves out "to be" | ~~She teacher.~~ → She **is** a teacher. |
| `word-order` | Uzbek is SOV (verb last) | ~~I English learn.~~ |
| `prepositions` | Uzbek uses case suffixes (-da, -ga, -dan) | ~~in Monday~~, ~~arrive to Tashkent~~ |
| `perfect-vs-past` | No direct equivalent of the Present Perfect | ~~I have seen him yesterday.~~ |
| `plural-after-numbers` | Uzbek keeps the noun singular after numbers | ~~three book~~ → three book**s** |
| `question-form` | Uzbek marks questions with "-mi" | ~~You are student?~~ |
| `false-friends` | Words borrowed via Russian | magazine ≠ do'kon, family ≠ familiya, artist ≠ aktyor, accurate ≠ akkurat |
| `pron-w-v`, `pron-th`, `pron-vowel-length` | Sounds missing from Uzbek | west/vest, think/sink, ship/sheep |

When a learner makes an error with one of these tags, the explanation for that pattern is shown, and their personal "weak spots" list is updated (see §7.12).

### 3.3 Focused on exams
IELTS and the national CEFR certificate (Milliy sertifikat) decide university places and grants. We offer IELTS topic vocabulary, CEFR-aligned levels, writing feedback with a band estimate, and timed practice tests.

### 3.4 Telegram first
Daily word, review reminders, streak alerts and quick quizzes all happen through a Telegram bot. Later, the whole app can run as a Telegram Mini App. Learners can sign in with Telegram.

### 3.5 Light and offline
The app is a PWA (already done) with an offline review queue. It is small enough to load fast on a weak signal.

---

## 4. Where the code is today

### 4.1 Stack

| Layer | Technology |
|---|---|
| Monorepo | npm workspaces (`apps/web`, `apps/api`) |
| Frontend | Angular 22 (standalone components, signals), Tailwind 4, service worker (PWA), deployed to Netlify |
| Backend | NestJS 12, Kysely, PostgreSQL, argon2, JWT |
| Tests | Vitest (both apps) |
| External | dictionaryapi.dev + Datamuse for word lookups; browser speech synthesis for audio |

### 4.2 Features that already exist
- Register and log in with a username ("login") and password. Passwords are hashed with argon2, and a JWT access token is stored in localStorage.
- `GET /users/me`.
- A personal notebook: add a word, with automatic lookup of part of speech, pronunciation and definitions. Words have collocations and example sentences.
- A library with filters and statuses (new / learning / known).
- A writing drill: the meaning is shown, the learner types the word, and the example sentence is shown with the word hidden. Five correct answers in a row = known.
- Speak button (text-to-speech), dark mode, installable PWA, JSON export/import.

### 4.3 Problems to fix before building more

| # | Problem | Where | Effect |
|---|---|---|---|
| 1 | Drill progress, edits and deletes are only changed in the browser's memory | `web/.../vocab-store.ts` (`update`, `remove`, `grade`) | Everything is lost on reload |
| 2 | Access token expires after 15 minutes and there is no refresh token | `api/.../auth.module.ts` | Users get logged out every 15 minutes |
| 3 | `meaning` is `@IsOptional` in the DTO but `NOT NULL` in the database | `vocabularies.dto.ts` | A missing meaning causes a 500 error instead of a 400 |
| 4 | DTO max lengths don't match the columns (`word` is 60 in the DTO, 100 in the DB) | same | Confusing limits |
| 5 | The frontend offers "phrasal verb" and "idiom", but the backend DTO rejects them | `dictionary.ts` vs DTO | Saving fails with a 400 |
| 6 | A duplicate word hits the unique index and returns a 500; the `try/catch` never runs because the promise isn't awaited | `vocabularies.service.ts` | Should return a 409 "already in your notebook" |
| 7 | CORS only allows `http://localhost:4200` | `main.ts` | The production frontend can't call the API |
| 8 | Each `vocabularies` row stores both the word and one user's progress | migration | Shared decks are impossible; the same word's data is duplicated for every user |
| 9 | No way to recover an account (username only, no email/phone/Telegram) | users table | A forgotten password means a lost account |

Phase 0 of the roadmap (§14) fixes all of these.

---

## 5. Core concepts (glossary)

| Term | Meaning |
|---|---|
| **Word** | A dictionary entry in the shared dictionary: headword + part of speech + one sense. "run (verb, to move fast)" and "run (noun, a period of running)" are separate words. |
| **Personal word** | A word the learner added themselves. It is private to them and not checked by editors. |
| **Deck** | An ordered set of words: "A1 · Family", "IELTS · Environment". Decks are official (made by editors), class decks (made by a teacher), or personal. |
| **Card** | A learner's memory record for one word: the spaced-repetition state + history. It is created when the learner first studies the word. |
| **Review** | One answer to one card. It produces a grade and moves the card's next due date. |
| **Grammar topic** | One grammar unit, e.g. "Present Perfect vs Past Simple". It has a lesson, exercises and a checkpoint quiz. |
| **Exercise item** | One question: a type (multiple choice, gap fill…), content, accepted answers and error tags. |
| **Error tag** | A label for a mistake pattern (`articles`, `he-she`…), see §3.2. |
| **CEFR level** | A1, A2, B1, B2, C1, C2. Used for words, topics, users and decks. |
| **XP** | Points earned for learning activity. They drive the daily goal, streak and leagues. |
| **Streak** | The number of consecutive days the learner reached their daily goal. |
| **Day** | A calendar day in the learner's time zone (default `Asia/Tashkent`, UTC+5). |

---

## 6. User journeys

### 6.1 First visit → first lesson (target: under 3 minutes)
1. The landing page explains the app in Uzbek, with the button **"Boshlash"** (Start).
2. The learner picks an interface language and script (Latin by default).
3. They pick a goal: *everyday English / school & university / IELTS / CEFR certificate / work*.
4. They pick a daily goal: 5 / 10 / 15 / 20 minutes.
5. **Level:** the learner picks it (A1–C1; "I'm a complete beginner" → A1). *Later:* the placement test (about 8 minutes) is offered as a second option.
6. They do their first short lesson *as a guest*: 5 new words + 1 grammar step.
7. **Then** they are asked to create an account ("Save your progress") with Telegram, Google, or username + password. Guest progress is kept and merged into the new account.

> Rule: the learner must reach a real learning moment before we ask them to sign up. Asking for registration first loses most visitors.

### 6.2 Daily loop (returning learner)
1. A Telegram reminder arrives at their chosen time: "Bugun 14 ta so'z takrorlash vaqti keldi 🔁" ("14 words are due for review today").
2. They open the app on **Home** and see today's plan: reviews due, new words, the next grammar step, and progress towards the daily goal.
3. **Start** runs a mixed session: reviews first, then new words, then grammar.
4. At the end they see XP earned, streak +1, and words that moved up a level.
5. Optional extras: their own notebook, the AI tutor, exam practice.

### 6.3 Adding a word they found while reading
1. Tap **+**, type "threshold".
2. The app looks it up and suggests: part of speech, pronunciation, an English definition, and the **Uzbek meaning** (from our dictionary first, otherwise suggested by AI and marked "unverified").
3. Save. The word goes into "My words" and joins the review schedule.

### 6.4 Exam learner
Goal = IELTS → the home screen shows an "IELTS track" card: topic vocabulary for this week, a writing task, and a practice test countdown. They write a Task 2 essay and get an estimated band, feedback per criterion (in Uzbek, with English examples), and a corrected version.

### 6.5 Teacher
The teacher registers, requests teacher access, and is approved by an admin. They create the class "Group 7B" and get a join code. Students join with the code. The teacher assigns the deck "A2 · Travel" and the topic "Past Simple", due Friday. The class dashboard shows who finished and the class's most common error tags.

---

## 7. Feature modules and their business logic

Each module lists **what it does**, the **business rules** it follows, and the **phase** it ships in (see §14).

### 7.1 Accounts and sign-in

**Phase:** 0 (refresh tokens, fixes) · 1 (Telegram, recovery) · 2 (guest mode; Google only if sign-up data shows a need) · Later (phone + SMS)

#### Ways to sign in

| Method | How it works | Notes |
|---|---|---|
| **Username + password** | Already exists. Username is 3–40 characters (letters, numbers, `_`, `.`) and is stored lowercase. Password is at least 8 characters. | Keep it. Prompt the user to link a recovery method. |
| **Telegram** | Telegram Login Widget (web) or Mini App `initData`. The server checks the HMAC signature with the bot token and rejects data older than 24 hours. | Expected to be the main method. Also links the bot for notifications. |
| **Phone number + SMS code** — *later* | +998 numbers. A 6-digit code is sent through a local SMS provider (e.g. Eskiz) and is valid for 5 minutes, with at most 5 tries. | **Not in the first releases:** every SMS is paid to the provider. Added once there is a budget; rate-limited when it comes. |
| **Google** | OAuth 2.0 / OpenID Connect. | For users who prefer it. |
| **Guest** | A temporary account is created on the device; progress is saved on the server under a guest ID. | Guest data is deleted after 30 days if never claimed. |

One user can link **several** methods (`auth_identities` table). Linking an identity that already belongs to another account → error "This Telegram account is already linked to another profile."

#### Sessions and tokens
- **Access token:** JWT, 15 minutes, kept in memory only (no longer in localStorage). Contains `sub`, `role`, `plan`.
- **Refresh token:** a random 256-bit value stored *hashed* in `sessions`, sent as an `httpOnly; Secure; SameSite=Lax` cookie, valid for 30 days.
- **Rotation:** each refresh issues a new refresh token and invalidates the old one. If an already-used token is presented again → the whole session family is revoked (theft protection).
- **Logout** revokes the current session. **"Log out everywhere"** revokes them all.
- The frontend interceptor: on a 401 → call `/auth/refresh` once → retry the request → if that also fails, send the user to the login page.

#### Security rules
- Login is limited to 5 failed attempts per 15 minutes for each username, and 30 per 15 minutes for each IP address. After that → 429 with a "try again later" time.
- The same error message is shown for "unknown user" and "wrong password" (already true).
- Password reset is only possible through a linked method (Telegram message or email; SMS once phone sign-in exists). An account with only a username and password **cannot** be recovered. The UI warns about this and pushes the user to link Telegram.
- Changing the password revokes every other session.

#### Profile and settings
- Display name, avatar (optional), interface language (`uz-Latn` / `uz-Cyrl` / `en`), time zone (default `Asia/Tashkent`).
- Learning settings: goal, daily target, new words per day (5–30, default 10), reminder time, CEFR level (set by the placement test, can be changed by hand).
- **Delete account:** an immediate soft delete (the user can't log in); all personal data is removed permanently after 14 days; the user can change their mind by logging in during that time.

#### Roles

| Role | Can do |
|---|---|
| `learner` | Everything to do with their own learning (the current `user` role becomes this) |
| `teacher` | All of the above + create classes, assign work, view their students' progress |
| `editor` | Create and edit content; send it for review |
| `admin` | Everything, including publishing content, managing users, approving teachers |

A user has one role. Teacher access is requested and then approved by an admin.

---

### 7.2 Onboarding and placement test

**Phase:** 2

**Onboarding steps:** language/script → goal → daily target → level → first lesson → sign-up prompt.

**First release:** the learner **picks their own level** (A1–C1). The placement test below comes in Phase 2 as a second option next to "pick it yourself". Each step after the first can be skipped, and sensible defaults are used.

**Placement test:**
- **Adaptive.** It starts at A2. A correct answer raises the difficulty of the next question; a wrong answer lowers it.
- **20–30 items, about 8 minutes:** vocabulary recognition, grammar multiple choice, short reading, short listening.
- **Stops early** once the estimate has settled (the last 6 items stay within one level).
- **Result:** a CEFR level for the user, plus a sub-score for vocabulary and for grammar.

**Business rules**
- The result **unlocks** content up to that level and **marks the lower levels as "probably known"**: easier words are not forced into lessons, but they can show up as quick check-ins.
- The test can be retaken once every 30 days (so people can see their progress, without gaming it).
- A learner can always choose a lower level by hand. Choosing a higher level than their result shows a warning, but is allowed.
- Grammar topics below the learner's level are marked "skippable": passing the topic's checkpoint quiz completes it without doing the lesson.

---

### 7.3 Home and the daily plan

**Phase:** 1

Home shows **today's plan**, worked out on the server:

```
reviews_due     = cards due now (capped at max_reviews_per_day, default 200)
new_words       = min(new_words_per_day setting, words left in active decks)
grammar_step    = the next unfinished step of the active grammar topic
daily_goal_xp   = 5 min → 30 XP · 10 min → 50 XP · 15 min → 80 XP · 20 min → 120 XP
```

**Session order:** reviews → new words → grammar step. A session is split into chunks of 10–15 items, so the learner can stop after any chunk and still have their progress saved.

**Business rules**
- **Reviews are never behind a paywall** and never hidden. The learner must always be able to review what they started.
- If the learner has more than 100 reviews due, new words are automatically held back for the day (`new_words = 0`) and a message explains why ("Avval takrorlashni tugataylik" — "Let's finish your reviews first").
- Active decks: the learner chooses up to 3 at a time. New words are taken from them in turn.
- Home also shows: streak, a ring for progress towards the daily goal, a weak-spots card (§7.12), and an exam card if the goal is an exam.

---

### 7.4 Vocabulary

**Phase:** 1 (official decks, Uzbek meanings) · 2 (more decks, word details)

#### 7.4.1 The shared dictionary (`words`)
Each word record has:
- `headword`, `part_of_speech`, `cefr_level`, `frequency_rank`
- `ipa` (UK, plus US if it differs), `respelling` (the existing ARPAbet → respelling code), `audio_url`
- `definition_en` (simple, learner-friendly), **`meaning_uz`** (the Uzbek meaning, short), `meaning_uz_note` (usage notes in Uzbek, optional)
- `examples`: 1–3 sentences, each with an Uzbek translation
- `collocations`, `synonyms`, `antonyms`, `word_family` (decide, decision, decisive)
- `false_friend_note` (optional, e.g. "magazine — jurnal, do'kon emas" — "a magazine, not a shop")
- `tags`: topic tags (family, travel, environment…)
- `status`: `draft` → `in_review` → `published` (see §7.15)

**Rule:** learners only ever see `published` words, plus their own personal words.

#### 7.4.2 Decks
- **Official decks:** made by editors and organised by level and topic. Examples: "A1 · Greetings", "B1 · Work", "IELTS · Education", "False friends", "Top 100 phrasal verbs".
- **Class decks:** made by a teacher and visible only to the members of that class.
- **Personal decks:** the learner groups their own words.
- A word can belong to many decks. Its card (memory record) is **shared across decks**: learning "decision" in one deck counts everywhere it appears.

#### 7.4.3 My words (the existing notebook)
The current notebook becomes "My words":
- The learner adds a word. The lookup suggests details as it does today, **plus**:
  - If the headword + part of speech exists in the shared dictionary → offer to **link** to it (with a verified Uzbek meaning and audio) instead of making a copy.
  - Otherwise → it is saved as a personal word, and a Uzbek meaning can be suggested by AI, marked *"tekshirilmagan"* (unverified).
- Personal words can be edited and deleted. Official words can't be edited, but the learner can add a **personal note**.
- **Duplicates:** the same headword (case-insensitive) + part of speech for the same user → 409 with "Bu so'z daftaringizda bor" ("This word is already in your notebook") and a link to it.
- Limits: free plan, 500 personal words; premium, unlimited. (Words linked to official entries don't count.)
- Export to JSON/CSV (both plans). Import JSON/CSV (premium, or the first 100 rows on free).

#### 7.4.4 Word states (what the learner sees)

| State | Rule |
|---|---|
| **New** | No card exists yet, or the card has no reviews |
| **Learning** | Card exists and its stability (the current interval) is under 7 days |
| **Familiar** | Interval is 7–20 days |
| **Mastered** | Interval is 21 days or more **and** the last review was correct |
| **Suspended** | The learner chose "I already know this" or "hide". It leaves the review queue and doesn't count as mastered unless proven in a quiz. |

"I already know this" on a new word → one immediate check (e.g. pick the meaning). Correct → the card starts at a 21-day interval (Mastered). Wrong → it starts as a normal new card.

This replaces the current rule of "5 correct in a row = known".

---

### 7.5 Spaced repetition engine

**Phase:** 1

We use **FSRS** (Free Spaced Repetition Scheduler, open-source, well tested) with the default parameters at first. Later, each user's parameters can be tuned once they have more than 1,000 reviews. If FSRS turns out to be too much work for the first release, SM-2 is an acceptable fallback, as long as it sits behind the same interface.

**How a card works**
- Card state: `stability`, `difficulty`, `due_at`, `reps`, `lapses`, `state` (new/learning/review/relearning), `last_reviewed_at`.
- Each answer is turned into an FSRS grade: **Again (1) / Hard (2) / Good (3) / Easy (4)**.

**Grading from exercises.** Learners never pick a grade themselves in typed exercises; we work it out:

| What happened | Grade |
|---|---|
| Wrong answer, or "I don't know" | Again |
| Correct, but with a hint, or a close typo (see §7.6), or slow (more than 20 s) | Hard |
| Correct | Good |
| Correct and fast (under 5 s) on an *easy* exercise type | Good (no Easy from fast recognition, to avoid inflated intervals) |
| Correct on a *hard* exercise type (spelling or listening dictation) in under 8 s | Easy |

On self-graded flashcards, the learner taps Again / Hard / Good / Easy themselves.

**Which exercise type a card gets.** It depends on how strong the card is, to keep practice both varied and hard enough:

| Card stability | Exercise types |
|---|---|
| New (first time) | Introduction card (word, audio, meaning, example) → recognition (choose the Uzbek meaning) |
| Under 3 days | Recognition: choose the meaning, choose the word, listen and choose |
| 3–20 days | Recall: Uzbek → English typing, gap fill in a sentence |
| 21 days or more | Hardest: dictation, collocation completion, using it in a sentence (AI-checked, premium) |

**Other rules**
- A card answered "Again" comes back later **in the same session** (after 3–5 other items) and is counted as a lapse.
- Cards are reviewed in order of how overdue they are, measured relative to their interval.
- Overdue cards are never "punished": FSRS handles long gaps itself. If a learner returns after weeks away, the due queue is capped at 200 per day.
- **Leech:** a card with 8 lapses is marked as a leech. It is shown with extra help (the Uzbek explanation + a memory hint) and listed in "Difficult words".
- Every review is stored in `review_logs` (needed for stats, tuning FSRS and finding bugs).

---

### 7.6 Exercise types and answer checking

**Phase:** 1 (vocabulary types) · 2 (grammar types)

| Type | Shown | Learner does | Checked by |
|---|---|---|---|
| `intro` | Word, audio, meaning, example | Taps "Got it" | — (not graded) |
| `choose_meaning` | English word | Picks the Uzbek meaning from 4 | Exact option |
| `choose_word` | Uzbek meaning | Picks the English word from 4 | Exact option |
| `listen_choose` | Audio only | Picks the word from 4 | Exact option |
| `type_word` | Uzbek meaning (+ masked example) | Types the English word | Normalized text (see below) |
| `dictation` | Audio | Types what they heard | Normalized text |
| `gap_fill` | Sentence with a gap | Types or picks the missing word/form | Accepted-answers list |
| `word_order` | Shuffled words | Puts them in order | Exact sequence (any accepted variant) |
| `error_correction` | A sentence with one mistake | Taps the mistake, then fixes it | Position + accepted fix |
| `transform` | "Make it negative / passive…" | Types the new sentence | Accepted answers, with AI fallback (premium) |
| `match_pairs` | 5 words + 5 meanings | Matches them | Exact pairs |
| `translate_uz_en` | Uzbek sentence | Types English | Accepted answers + AI fallback |
| `free_sentence` | A target word | Writes their own sentence using it | AI (premium) |
| `flashcard` | Word, then reveal | Grades themselves | Self-graded |

**Wrong options for multiple choice** come from the same part of speech and a similar level, never the right answer's synonyms, and preferably from words the learner has already seen.

**Normalizing typed answers** (this extends the existing `normalize()`):
1. Trim, lowercase, collapse spaces, drop punctuation at the end.
2. Treat curly and straight apostrophes the same (`'` `'` `ʼ`). This matters because Uzbek keyboards use `ʻ` and `ʼ`.
3. Expand common contractions both ways (`don't` ≡ `do not`) when the exercise allows it.
4. **Close typo:** for an answer of 6 or more letters, being 1 edit away (Levenshtein) is accepted as **Hard**. The UI shows "Almost! Correct spelling: …". For shorter words, any difference counts as wrong.
5. **Right word, wrong form:** if the learner typed another member of the word family (e.g. "decide" instead of "decision") → wrong, but with the message "Bu so'zning boshqa shakli" ("That's a different form of this word").

**Feedback after a wrong answer** always shows the correct answer, the audio, and — if the item has error tags — a short Uzbek explanation of that pattern with a link to the grammar topic.

**"Report a problem"** is on every item (wrong translation, broken audio, more than one correct answer). Reports go to the editors' queue (§7.15).

---

### 7.7 Grammar course

**Phase:** 2 (A1–B1) · 3 (B2–C1)

#### Structure
`Level (A1…C1)` → `Unit` (e.g. "Talking about the past") → `Topic` (e.g. "Past Simple — irregular verbs") → `Steps`.

Each topic has these steps:
1. **Explanation** in Uzbek (short, with lots of examples). It includes an **"O'zbek tilida qanday?"** ("How do we say it in Uzbek?") box comparing it with Uzbek, and a **"Ko'p uchraydigan xatolar"** ("Common mistakes") box.
2. **Guided practice:** 6–10 easy items.
3. **Practice:** 10–15 mixed items.
4. **Checkpoint quiz:** 10 items. **80% or more to pass.**

#### Business rules
- A topic is **completed** when its checkpoint quiz is passed. Failing shows the items they got wrong, and they can retry straight away (with different items from the pool).
- **Order:** topics in a unit are suggested in order, but nothing is locked. Learners can open any topic up to one level above their own. Higher topics show "This may be difficult" but still open.
- **Grammar review:** every exercise item the learner got wrong becomes a **grammar card** in the same FSRS queue as words, so grammar mistakes come back the way words do.
- **Topic mastery:** a topic is mastered when it is completed **and** its grammar cards reach an average interval of 21 days or more.
- Each topic has at least 40 items in its pool, so retries and reviews don't repeat the same questions too often.

#### Curriculum (first version)

Topics marked ⚠ target a known Uzbek-speaker difficulty (§3.2).

| Level | Topics |
|---|---|
| **A1** | ⚠ To be (am/is/are) · ⚠ Subject pronouns, he/she/it · ⚠ Articles a/an · ⚠ Plural nouns · This/that/these/those · Have got / has · Present Simple · ⚠ Questions and negatives in the Present Simple · There is / there are · Can / can't · ⚠ Prepositions of place · Possessive 's and possessive adjectives · Imperatives |
| **A2** | Past Simple: regular verbs · Past Simple: irregular verbs · Present Continuous · Present Simple vs Continuous · Future: going to / will · Comparatives and superlatives · Countable / uncountable, some/any, much/many · ⚠ Articles: the vs no article · ⚠ Prepositions of time in/on/at · Object pronouns · Adverbs of frequency · Should / must / have to |
| **B1** | ⚠ Present Perfect · ⚠ Present Perfect vs Past Simple · Past Continuous · First conditional · Second conditional · Passive (present and past) · Relative clauses (who/which/that) · Gerund vs infinitive · Used to · Reported speech (basics) · Modals of deduction · Phrasal verbs: introduction |
| **B2** | Present Perfect Continuous · Past Perfect · Third and mixed conditionals · Passive: all tenses · Wish / if only · Reported speech: complete · Linking words for writing · ⚠ Advanced articles · Future Continuous / Perfect |
| **C1** | Inversion · Cleft sentences · Participle clauses · Advanced modals · Nominalisation · Hedging and academic style |

About 55 topics in total. A1–B1 (about 37 topics) is the Phase 2 target.

---

### 7.8 Listening and pronunciation

**Phase:** 1 (audio for every word) · 3 (minimal pairs, shadowing) · 4 (speech scoring)

- **Audio for every word and example sentence.** Phase 1 keeps the browser's speech synthesis (`speech.ts`) as a fallback. Phase 2 adds pre-generated, high-quality TTS audio files (UK and US voices) stored in object storage and cached by the service worker.
- **Slow playback** (0.75×) on every audio button.
- **Minimal pairs** drills aimed at Uzbek speakers: w/v, θ/s, ð/z, ɪ/iː, æ/e, ʌ/ɑː, final consonants. Format: listen → pick which word was said.
- **Shadowing:** listen → record yourself → play both back. No automatic scoring at first.
- **Speech scoring (Phase 4, premium):** the learner reads a sentence, speech-to-text compares it with the target, and the mismatched words are highlighted. This is approximate only — it is labelled "beta" and is never used to lower a card's grade.

---

### 7.9 AI tutor

**Phase:** 3 (explanations, writing feedback) · 4 (conversation)

Built on the Claude API (see `docs/` later for the prompt specs). Model choice: a small, fast model (Haiku) for short explanations and checking answers; a larger model (Sonnet) for essay feedback and conversation.

| Feature | What it does | Plan |
|---|---|---|
| **"Why was I wrong?"** | Explains a specific mistake in Uzbek, using the learner's own answer | Free: 5 per day · Premium: unlimited (fair use) |
| **Fallback answer checker** | For `transform` / `translate_uz_en` / `free_sentence` when the answer isn't in the accepted list: decides correct / almost / wrong and explains | Premium |
| **Word help** | More examples, simpler explanation, memory hint for a leech card | Free: 5 per day · Premium |
| **Writing feedback** | IELTS Task 1/2 or a free text → estimated band per criterion (Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy), mistakes with error tags, a corrected version, and 3 things to improve — in Uzbek | Free: 1 per week · Premium: 30 per month |
| **Conversation practice** | Role-play scenarios ("at the airport", "job interview") at the learner's level, with gentle corrections afterwards | Premium |

**Rules**
- AI output is **always labelled** as AI. Band scores are labelled "taxminiy" (estimated) and must never be presented as official.
- AI never changes official content directly. AI-drafted content goes through the editor workflow (§7.15).
- Learners' mistakes found by the AI are tagged with the same error tags and feed into weak spots (§7.12).
- **Cost control:** each user has a daily token budget; prompts are cached; essays are limited to 500 words; repeat requests for the same item return the cached answer.
- **Safety:** the AI tutor only discusses English learning. Off-topic requests are politely declined. Personal data is not sent to the model beyond the text being checked.

---

### 7.10 Exam preparation (IELTS and the national CEFR test)

**Phase:** 3–4

- **Exam tracks:** choosing the goal "IELTS" or "CEFR certificate" adds a track with a target score and an exam date. The daily plan adds exam tasks (topic vocabulary + one exam-style task every 2–3 days).
- **Vocabulary:** IELTS topic decks (Education, Environment, Technology, Health, Work, Crime, Globalisation, Media…), academic word list, linking words.
- **Writing:** Task 1 (charts, letters) and Task 2 (essays) with AI feedback (§7.9), model answers at band 6, 7 and 8, and Uzbek explanations of the structure.
- **Reading and listening:** timed practice sets in exam format, with answer keys, explanations, and a converted band/level estimate.
- **Speaking:** a question bank for Parts 1–3 with useful phrases; recording practice; AI conversation (premium).
- **Countdown:** "Imtihongacha 47 kun" ("47 days until the exam"), with plan intensity increasing in the last 30 days.

**Rule:** all practice tests are **our own original content**. We never copy official exam papers (copyright).

---

### 7.11 Motivation: XP, streaks, leagues

**Phase:** 1 (XP, daily goal, streak) · 3 (leagues, achievements)

**XP**

| Action | XP |
|---|---|
| Review answered correctly | 2 |
| Review answered wrong | 1 (effort still counts) |
| New word learned (intro + first recognition) | 3 |
| Grammar practice item correct | 2 |
| Grammar checkpoint passed | 20 (first time only) |
| Writing task submitted | 15 |
| Daily goal reached | +10 bonus |

- XP **can't be farmed:** repeating a finished checkpoint gives no bonus; flashcards rated "Easy" in under 1.5 s give 0 XP; at most 600 XP per day count towards leagues.

**Streak**
- The streak goes up by 1 on each day the daily XP goal is reached.
- A day runs from 00:00 to 23:59 in the user's time zone.
- If a day is missed, the streak drops to 0 — unless the learner has a **streak freeze**: it is used automatically, and the streak is kept but doesn't grow that day.
- Freezes: everyone has 1 (refilled every month). Premium users can hold up to 3 at once. Up to 2 can also be bought with gems earned from leagues (Phase 3).
- Changing time zone is limited to once every 7 days, so the streak can't be gamed.

**Leagues (Phase 3)**
- Weekly groups of 30 learners at a similar XP level. The week runs from Monday 00:00 to Sunday 23:59 (Tashkent time).
- Top 5 move up a league, bottom 5 move down. Leagues: Bronze → Silver → Gold → Sapphire → Diamond.
- Learners can opt out of leagues in settings (some adults don't like it).
- Only display name + avatar are shown — never username or phone.

**Achievements (Phase 3):** first 100 words, a 7-day / 30-day / 100-day streak, a completed level, a 10-day run of perfect reviews, etc.

---

### 7.12 Progress and statistics

**Phase:** 1 (basic) · 3 (weak spots, full stats)

- **Overview:** words by state (new / learning / familiar / mastered), topics completed by level, current streak, total XP, time studied.
- **Estimated level:** the learner's vocabulary and grammar progress mapped against each CEFR level ("A2 vocabulary: 78% mastered").
- **Charts:** reviews per day (last 30 days), retention rate, forecast of reviews due over the next 7 days.
- **Weak spots:** the top 3 error tags by how often they appear in the last 14 days, weighted towards recent mistakes. Each links to the matching grammar topic and a 10-item focused drill.
- **Difficult words:** leeches and words with the lowest accuracy.

**Rule:** statistics are calculated from `review_logs` and `attempts`, never stored as separate counters that could drift out of sync. (Counters can be cached, but the logs are the source of truth.)

---

### 7.13 Notifications and the Telegram bot

**Phase:** 1 (bot: link + reminders) · 3 (word of the day, quizzes) · 4 (Mini App)

**Linking:** in settings, "Connect Telegram" → a deep link `t.me/<bot>?start=<one-time token>` → the bot confirms. The token is valid for 10 minutes and works only once. Signing in with Telegram links the bot automatically.

**Bot messages**

| Message | When | Rule |
|---|---|---|
| Review reminder | At the learner's chosen time, if they haven't reached their goal today | At most 1 per day |
| Streak at risk | 20:00 local time, if the goal isn't reached and the streak is 3 or more | At most 1 per day; never after 22:00 |
| Word of the day | Morning, opt-in | Word + audio + Uzbek meaning + quiz button |
| Mini quiz | Opt-in, 3 per week | 3 quick questions answered in the chat; counts towards XP |
| Teacher assignment | When assigned, and the day before it's due | Only for class members |
| Weekly summary | Sunday evening | XP, words learned, league result |

**Rules**
- Every type of notification can be turned off on its own. "Stop" in the bot pauses everything.
- **Quiet hours:** no messages between 22:00 and 08:00 local time.
- If the learner hasn't opened the app for 3 days, reminders drop to every other day; after 14 days, once a week; after 60 days, they stop.
- Web push (PWA) works the same way, for those without Telegram.

**Telegram Mini App (Phase 4):** the same Angular app, opened inside Telegram, signed in automatically with `initData`. Payments through Telegram are possible here too.

---

### 7.14 Teachers and classes

**Phase:** 3

- **Teacher access:** requested from profile settings (name, school/centre, phone). An admin approves it. While waiting, the user stays a learner.
- **Classes:** a teacher creates a class → gets an 8-character join code + link. A teacher can have up to 10 classes on the free teacher plan, up to 40 students each.
- **Joining:** a student enters the code → joins the class. A student can be in up to 5 classes. The teacher can remove a student; a student can leave.
- **Assignments:** deck X (learn N new words), grammar topic Y (pass the checkpoint), or a writing task — each with a due date. The assignment shows up on the student's Home screen with a "Vazifa" (homework) badge.
- **Completion:** a deck assignment is done when all its words have been introduced and answered correctly at least once; a topic, when its checkpoint is passed; a writing task, when it is submitted.
- **Dashboard:** per student — last active, streak, assignments done / late / missing, accuracy; per class — the most common error tags and the hardest words.
- **Privacy:** a teacher sees only learning data **related to their class** (assignments, accuracy, error tags, streak). They don't see the student's personal notebook, contact details or AI conversations.
- **Learning centres (business):** an organisation account pays per student seat. Premium features are unlocked for its students while they are enrolled.

---

### 7.15 Content management (admin)

**Phase:** 1 (word and deck editor) · 2 (grammar editor, reports) · 3 (AI drafting)

**Content workflow**

```
draft ──(editor submits)──► in_review ──(reviewer approves)──► published
  ▲                              │
  └─────(reviewer rejects, with comment)──┘
published ──(edit)──► new draft version (the live version stays visible until the new one is approved)
published ──(archive)──► archived (hidden from new learners; existing cards keep working)
```

**Rules**
- Only an `admin` or a designated reviewer can publish. An editor can't approve their own work.
- Every published change is versioned: who, when, what changed.
- **Never delete published content** that has learner data attached — archive it instead.
- Every word must have before publishing: headword, part of speech, CEFR level, English definition, Uzbek meaning, at least 1 example with a translation, IPA, and audio.
- Every grammar topic must have before publishing: an Uzbek explanation, at least 40 exercise items, a checkpoint pool of at least 20, and error tags.

**Tools**
- Word, deck, topic and exercise editors, with a live preview in Latin and Cyrillic.
- **Bulk import** of words from CSV (validated row by row, with an error report).
- **AI drafting:** generate the Uzbek meaning, examples, collocations or exercise items as a *draft* for a human to review. Never published automatically.
- **Report queue:** problems reported by learners, grouped by item, sorted by how many people reported them.
- **Users:** search, view, change role, approve teachers, suspend accounts, see the audit log.

---

### 7.16 Subscriptions and payments

**Phase:** 3

#### Free vs Premium

| Feature | Free | Premium |
|---|---|---|
| All official A1–B1 decks and grammar | ✅ | ✅ |
| B2–C1 decks and grammar | First 2 units of each level | ✅ |
| Reviews (spaced repetition) | ✅ unlimited, **never locked** | ✅ |
| New words per day | Up to 20 | Up to 50 |
| My words (personal) | 500 | Unlimited |
| "Why was I wrong?" AI | 5 / day | Unlimited (fair use) |
| AI writing feedback | 1 / week | 30 / month |
| AI conversation | — | ✅ |
| IELTS / CEFR tracks and practice tests | 1 sample test | ✅ |
| Offline downloads | Today's review queue | Full decks |
| Streak freezes held | 1 | 3 |
| Ads | None (we don't plan to show ads at all) | None |

**Pricing** (to be confirmed — §17): monthly, 6-month and yearly plans in UZS, with yearly roughly 40% cheaper per month. Student discount for verified `.edu.uz` emails, or through a learning centre.

**Payment providers:** Click and Payme (Uzbek cards — Uzcard and Humo), possibly Uzum later; Telegram Stars inside the Mini App.

**Business rules**
- **Trial:** 7 days of premium for new accounts, once per person (checked by Telegram ID, not just per account).
- **Renewal:** automatic where the provider supports saved cards; otherwise the learner is reminded 3 days before expiry.
- **When premium ends:** nothing is deleted. Personal words above 500 stay visible and reviewable, but no new ones can be added; locked decks stop giving new words, but **their existing cards stay in reviews**.
- **Refunds:** within 7 days of the first payment, if premium was barely used. Handled by an admin.
- **Webhook rules:** payment status is set only by the provider's signed callback, never by the frontend. Every callback is idempotent (stored by `provider_transaction_id`) and logged.

---

### 7.17 Offline mode

**Phase:** 3

- The service worker caches the app shell (already in place) and audio for words in today's plan.
- When "Start session" is tapped online, the session (the next ~50 items, with their answers and audio) is downloaded.
- Offline answers are graded on the device using the same FSRS code (a shared TypeScript package used by both web and api) and saved in IndexedDB.
- When back online, they are sent to `POST /reviews/sync` in order, with the time each answer was given.
- **Conflict rule:** the server replays offline reviews in the order they happened. If the same card was also reviewed on another device, both reviews are kept and FSRS processes them in time order. XP is counted once per review (each review has a unique ID made on the device).
- AI features and placement tests need a connection.

---

## 8. Business rules — one-page summary

1. **Reviews are never paywalled.** The learner can always review what they've started.
2. **Learn before sign-up.** A first lesson as a guest comes before the account wall.
3. **Uzbek first.** Every explanation, hint and piece of feedback exists in Uzbek (Latin, with automatic Cyrillic).
4. **Only reviewed content is shown.** Learners see published content and their own words only; AI drafts never go live without a human.
5. **One memory record per word per learner.** It is shared across all decks.
6. **The scheduler decides when, not the learner.** FSRS sets due dates; grades come from performance, except on flashcards.
7. **Mastered = interval of 21 days or more, last answer correct.**
8. **Grammar topic done = checkpoint passed (80%+).** Mistakes become review cards.
9. **Daily goal reached → streak +1**, in the learner's time zone; a freeze covers one missed day.
10. **AI is always labelled**, band scores are "estimated", and usage is capped to control cost.
11. **Teachers see only what relates to their class.**
12. **Payment status comes only from signed provider webhooks.**
13. **Never delete published content that has learner data;** archive it.
14. **Notifications:** at most 1 reminder a day, quiet hours 22:00–08:00, fewer reminders for inactive users.
15. **Account deletion:** soft-delete now, permanent removal after 14 days.

---

## 9. Data model

PostgreSQL. All IDs are `uuid` (`gen_random_uuid()`); all timestamps are `timestamptz`. Only the important columns are listed.

### 9.1 Accounts

```
users
  id, display_name, login (unique, nullable — not every user has a password login),
  password_hash (nullable), role enum(learner, teacher, editor, admin),
  ui_language enum(uz-Latn, uz-Cyrl, en), timezone (default 'Asia/Tashkent'),
  cefr_level, goal enum(general, school, ielts, cefr_cert, work),
  daily_goal_xp, new_words_per_day, reminder_time,
  is_guest bool, deleted_at, created_at, updated_at

auth_identities                     -- the ways a user can sign in
  id, user_id → users, provider enum(telegram, phone, google, email),
  provider_user_id, verified_at, created_at
  UNIQUE (provider, provider_user_id)

sessions                            -- refresh tokens
  id, user_id, family_id, token_hash, user_agent, ip,
  expires_at, revoked_at, replaced_by, created_at

verification_codes                  -- SMS / email / Telegram codes
  id, target, purpose enum(login, link, reset), code_hash,
  attempts, expires_at, used_at

teacher_requests
  id, user_id, organisation, phone, status enum(pending, approved, rejected),
  reviewed_by, created_at
```

### 9.2 Content

```
words
  id, headword, part_of_speech, cefr_level, frequency_rank,
  ipa_uk, ipa_us, respelling, audio_uk_url, audio_us_url,
  definition_en, meaning_uz, meaning_uz_note, false_friend_note,
  status enum(draft, in_review, published, archived), version,
  created_by, updated_by, published_at, created_at, updated_at
  UNIQUE (lower(headword), part_of_speech, sense_key)

word_examples      id, word_id, sentence_en, sentence_uz, audio_url, position
word_relations     word_id, related_word_id, kind enum(synonym, antonym, family, collocation_with)
word_collocations  id, word_id, phrase, meaning_uz
tags               id, slug, name_uz, name_en, kind enum(topic, error)
word_tags          word_id, tag_id

decks
  id, title_uz, title_en, description_uz, cefr_level, kind enum(official, class, personal),
  owner_user_id (null for official), class_id (for class decks),
  is_premium bool, status, position, created_at
deck_words         deck_id, word_id, position

personal_words                      -- the existing notebook, now separate
  id, user_id, linked_word_id (nullable → words), headword, part_of_speech,
  pronunciation, definition, meaning_uz, examples text, collocations text,
  note, created_at, updated_at
  UNIQUE (user_id, lower(headword), part_of_speech)

grammar_units      id, cefr_level, title_uz, title_en, position
grammar_topics     id, unit_id, slug, title_uz, title_en, explanation_uz (markdown),
                   uz_comparison (markdown), common_mistakes (markdown),
                   status, version, is_premium, position
exercise_items
  id, topic_id (nullable), word_id (nullable), type (see §7.6),
  prompt jsonb, accepted_answers jsonb, options jsonb, explanation_uz,
  difficulty smallint, is_checkpoint bool, status, created_at
exercise_item_tags item_id, tag_id

content_versions   id, entity_type, entity_id, version, snapshot jsonb, author_id, created_at
content_reports    id, user_id, entity_type, entity_id, reason, comment,
                   status enum(open, fixed, dismissed), handled_by, created_at
```

### 9.3 Learning state

```
cards                               -- one memory record per learner per item
  id, user_id,
  word_id | personal_word_id | exercise_item_id   (exactly one is set — CHECK constraint)
  state enum(new, learning, review, relearning, suspended),
  stability real, difficulty real, due_at, reps, lapses, is_leech bool,
  last_reviewed_at, created_at
  INDEX (user_id, due_at) WHERE state <> 'suspended'

review_logs                         -- append-only
  id (made on the device, for idempotent offline sync), card_id, user_id,
  exercise_type, grade smallint(1-4), answer text, was_correct bool,
  response_ms, error_tags text[], reviewed_at,
  stability_before, stability_after, due_before, due_after

user_decks         user_id, deck_id, is_active bool, added_at
topic_progress     user_id, topic_id, status enum(not_started, in_progress, completed, mastered),
                   best_score, attempts, completed_at
attempts           -- grammar practice / checkpoint answers
  id, user_id, item_id, topic_id, mode enum(practice, checkpoint, placement),
  answer, was_correct, error_tags text[], created_at

placement_results  id, user_id, cefr_level, vocab_score, grammar_score, items jsonb, created_at
xp_events          id, user_id, source, source_id, amount, local_date, created_at
daily_activity     user_id, local_date, xp, goal_met bool, reviews, new_words, minutes
                   PRIMARY KEY (user_id, local_date)
streaks            user_id, current, longest, last_goal_date, freezes_available
```

### 9.4 Social, classes, money, AI

```
league_weeks       id, starts_on, ends_on
league_groups      id, week_id, tier
league_members     group_id, user_id, xp, final_rank
achievements       id, slug, title_uz, criteria jsonb
user_achievements  user_id, achievement_id, earned_at

classes            id, teacher_id, name, join_code (unique), archived_at, created_at
class_members      class_id, user_id, joined_at, left_at
assignments        id, class_id, kind enum(deck, topic, writing), target_id,
                   new_words_target, due_at, created_at
assignment_progress assignment_id, user_id, status enum(todo, done, late), completed_at

plans              id, code, period_months, price_uzs, is_active
subscriptions      id, user_id | organisation_id, plan_id, status enum(trial, active, past_due, cancelled, expired),
                   current_period_start, current_period_end, provider, created_at
payments           id, subscription_id, provider enum(click, payme, uzum, telegram),
                   provider_transaction_id (unique), amount_uzs, status, raw jsonb, created_at
organisations      id, name, seats, contact, created_at

ai_requests        id, user_id, feature, model, input_tokens, output_tokens,
                   cache_key, created_at                   -- for budgets and cost tracking
writing_submissions id, user_id, task_type, prompt, text, word_count,
                   feedback jsonb, band_estimate, created_at

notification_prefs user_id, channel enum(telegram, push), kind, enabled
telegram_links     user_id, chat_id, linked_at
audit_log          id, actor_id, action, entity_type, entity_id, meta jsonb, created_at
```

### 9.5 Moving from the current schema
1. Create the new tables.
2. Copy each `vocabularies` row → `personal_words` (fields map one to one; `sentences` → `examples`).
3. Create a `cards` row for each one, starting from the existing streak/attempts:
   streak 5 or more → review state, 21-day interval; attempts > 0 → learning; otherwise new.
4. Change `users.role` `'user'` → `'learner'`. Add the new columns with defaults.
5. Keep `vocabularies` read-only for one release, then drop it.

---

## 10. API endpoints

REST under `/api/v1`. Auth: `Authorization: Bearer <access token>`; the refresh token goes in a cookie. Errors use one shape: `{ code, message_uz, message_en, details? }`.

### Auth and account
```
POST   /auth/register                 username + password
POST   /auth/login                    username + password
POST   /auth/telegram                 Telegram widget payload or Mini App initData
POST   /auth/phone/request-code       { phone }      (later — SMS sign-in)
POST   /auth/phone/verify             { phone, code } (later — SMS sign-in)
GET    /auth/google/start | /auth/google/callback
POST   /auth/guest                    create a guest account
POST   /auth/refresh                  rotate the refresh token (cookie)
POST   /auth/logout                   revoke the current session
POST   /auth/logout-all
POST   /auth/password/reset-request   via a linked method
POST   /auth/password/reset
GET    /me                            profile + settings + plan + streak
PATCH  /me                            settings
POST   /me/identities/:provider       link a sign-in method
DELETE /me/identities/:id
POST   /me/claim-guest                merge guest progress into this account
DELETE /me                            soft-delete the account
POST   /me/teacher-request
```

### Learning
```
GET    /home                          today's plan (reviews due, new words, grammar step, goal)
POST   /sessions                      build a session → items with exercise types
POST   /reviews                       { card_id, exercise_type, answer, response_ms, client_id } → grade, next due, XP
POST   /reviews/sync                  offline batch
POST   /answers/check                 check a free-text answer (AI fallback for premium)

GET    /decks?level=&kind=            browse
GET    /decks/:id
POST   /me/decks/:id                  add to active decks
DELETE /me/decks/:id
POST   /cards/:id/suspend | /unsuspend | /known

GET    /words/search?q=               shared dictionary search
GET    /words/:id
GET    /me/words                      personal words (+ filters)
POST   /me/words
PATCH  /me/words/:id
DELETE /me/words/:id
POST   /me/words/import | GET /me/words/export?format=json|csv

GET    /grammar                       units + topics + my progress
GET    /grammar/topics/:slug
POST   /grammar/topics/:slug/practice     → items
POST   /grammar/topics/:slug/checkpoint   → items; POST answers → result

POST   /placement/start | /placement/answer | GET /placement/result
```

### Progress, AI, exams
```
GET    /stats/overview | /stats/history?days=30 | /stats/weak-spots | /stats/forecast
GET    /leagues/current
GET    /achievements
POST   /ai/explain                    { item_id, answer }
POST   /ai/word-help                  { word_id }
POST   /ai/writing                    { task_type, prompt, text }
POST   /ai/chat                       { scenario_id, messages }
GET    /exam/tracks | POST /exam/tracks | GET /exam/tests/:id | POST /exam/tests/:id/submit
POST   /reports                       report a content problem
```

### Teachers, payments, notifications, admin
```
POST   /classes | GET /classes | GET /classes/:id | PATCH | DELETE
POST   /classes/join                  { code }
DELETE /classes/:id/members/:userId
POST   /classes/:id/assignments | GET /classes/:id/dashboard

GET    /plans
POST   /subscriptions/checkout        { plan_id, provider } → payment URL
POST   /webhooks/click | /webhooks/payme | /webhooks/telegram-payments
GET    /me/subscription

POST   /telegram/link-token
POST   /webhooks/telegram             bot updates
GET    /me/notifications | PATCH /me/notifications

/admin/words, /admin/decks, /admin/grammar, /admin/items     CRUD + submit / approve / reject
/admin/import/words                                          CSV upload
/admin/ai/draft                                              AI draft generation
/admin/reports, /admin/users, /admin/teacher-requests, /admin/audit
```

---

## 11. Frontend screens and routes

| Route | Screen | Access |
|---|---|---|
| `/` | Landing page (Uzbek) — what it is, start button | Public |
| `/start` | Onboarding: language → goal → daily target → level | Public / guest |
| `/placement` | Placement test | Guest / learner |
| `/login`, `/register` | Sign in / up (Telegram, Google, username; phone later) | Public |
| `/reset-password` | Recovery via a linked method | Public |
| `/home` | Today's plan, streak, goal ring, weak spots, assignments | Learner |
| `/session` | The learning session player (all exercise types) | Learner |
| `/decks`, `/decks/:id` | Browse and add decks | Learner |
| `/words`, `/words/:id` | My words (the current notebook + library) | Learner |
| `/dictionary/:id` | Word detail | Learner |
| `/grammar`, `/grammar/:slug` | Course map and a topic (explanation → practice → checkpoint) | Learner |
| `/listening` | Minimal pairs, dictation, shadowing | Learner |
| `/tutor` | AI tutor: writing feedback, conversation | Learner |
| `/exam` | Exam track and practice tests | Learner |
| `/stats` | Progress and statistics | Learner |
| `/leagues`, `/achievements` | Motivation | Learner |
| `/classes`, `/classes/:id` | Classes (student view: assignments; teacher view: dashboard) | Learner / teacher |
| `/settings` | Profile, sign-in methods, learning, notifications, subscription, delete account | Learner |
| `/premium` | Plans and checkout | Learner |
| `/admin/**` | Content editors, reports, users, teacher approvals | Editor / admin |

**Frontend rules**
- Mobile first, designed at 360 px wide. Bottom tab bar: Home · Words · Grammar · Stats · Profile.
- All interface text comes from translation files (`uz-Latn` is the source; `uz-Cyrl` is generated by converting it; `en`).
- Each session item is a separate component in `features/session/exercises/`, all implementing one `Exercise` interface — so the session player doesn't need to know about each type.
- Keep the current approach: signals, standalone components, lazy-loaded routes, and the existing `dictionary.ts` + `speech.ts` services.

---

## 12. Non-functional requirements

| Area | Requirement |
|---|---|
| **Performance** | First load under 3 s on a mid-range Android phone on 3G; initial JS bundle under 250 KB gzipped; API p95 under 300 ms for `/home`, `/sessions` and `/reviews`. |
| **Availability** | 99.5% monthly. Review answers are queued on the device if the API is down. |
| **Security** | Argon2 for passwords (done); access token kept in memory; refresh tokens in httpOnly cookies; rate limits (login, SMS, AI); input validation on every DTO (done with class-validator); CORS from configuration; secrets in environment variables; helmet headers; signed webhooks. |
| **Privacy and law** | Uzbekistan's personal data law requires citizens' personal data to be stored on servers located in Uzbekistan — **confirm with a lawyer and pick hosting accordingly** (§16). Privacy policy and terms in Uzbek. Minimum data collected; export and deletion on request. Extra care for users under 18. |
| **Accessibility** | WCAG 2.1 AA: contrast, focus states, labelled buttons, captions/text for all audio, works with a screen reader. |
| **Localisation** | Uzbek Latin as the source, Cyrillic generated automatically (with a list of exceptions), English. Dates and numbers formatted for `uz`. |
| **Observability** | Structured logs, error tracking (e.g. Sentry), product analytics (privacy-friendly, self-hosted if possible), uptime checks, an AI cost dashboard. |
| **Testing** | Unit tests for FSRS, answer checking, XP/streak and payment webhooks (these must have 100% branch coverage); API e2e tests for the main flows; a few Playwright tests: onboarding → session → review. |
| **Backups** | Daily Postgres backups kept for 30 days, with a restore drill every quarter. |
| **CI/CD** | GitHub Actions: lint, test and build on each PR; migrations run on deploy; separate staging and production. |

**Shared code:** add `packages/core` to the workspace for things both web and api need: the FSRS scheduler, `normalize()` / answer checking, XP rules, shared types. This keeps offline grading and server grading identical.

---

## 13. Content plan

Content is the biggest piece of work, and the thing that sets us apart. Plan it like a product.

**Word lists (be careful with licensing)**
- Do **not** copy Oxford 3000/5000 or the English Vocabulary Profile wholesale — they are copyrighted.
- Start from openly licensed lists: **NGSL** (New General Service List, CC BY-SA), **NAWL** (academic words), and CEFR-J where the licence allows. Assign our own CEFR levels with teacher review.
- Targets: A1 ~600 · A2 ~800 · B1 ~1,100 · B2 ~1,500 · C1 ~1,500 words, plus IELTS topic decks, false friends and phrasal verbs.

**Production pipeline**
1. Import the headword + part of speech + level.
2. AI drafts the definition, Uzbek meaning, 2 examples with translations, collocations and a false-friend note.
3. A **human reviewer** (an Uzbek English teacher) checks and fixes it. Target: about 100 words per reviewer-hour.
4. Generate audio (TTS) and IPA.
5. Publish in batches by deck.

**Grammar**
- A teacher writes each topic using the AI draft as a starting point, then a second teacher reviews it.
- At least 40 items per topic; each item is tagged with error tags.

**Team** (minimum): 1–2 part-time Uzbek English teachers as content editors/reviewers, plus you as admin. Budget for this from day one.

**Quality loop:** "report a problem" → editor queue → fix within 7 days. Track the items most often answered wrong and check them for ambiguity.

---

## 14. Roadmap

Each phase lists its scope and the **definition of done** (DoD).

### Phase 0 — Fix the foundation (about 1–2 weeks)
- Fix the 9 problems in §4.3: save progress, refresh tokens, DTO mismatches, duplicate 409, CORS from config.
- New schema (§9) with the migration from `vocabularies` (§9.5).
- Add `packages/core`; set up CI; a staging environment.

**DoD:** progress survives a reload; the user stays logged in for 30 days; every existing word moved over with its progress; CI is green.

### Phase 1 — Vocabulary MVP (about 4–6 weeks)
- FSRS engine + cards + review logs.
- Session player with `intro`, `choose_meaning`, `choose_word`, `listen_choose`, `type_word`, `gap_fill`, `flashcard`.
- The shared dictionary + official decks A1–A2 (about 1,400 reviewed words) with Uzbek meanings.
- My words (the current notebook, moved to `personal_words` and linkable to official words).
- Home and the daily plan; XP, daily goal, streak.
- Interface in Uzbek Latin + Cyrillic.
- Telegram login + bot linking + daily reminder.
- Admin: word, deck and CSV import editors.

**DoD:** a new user can sign in with Telegram, add A1 decks, and do daily sessions for a week with reminders; progress and streak are correct across devices.

### Phase 2 — Grammar and onboarding (about 6–8 weeks)
- Grammar course A1–B1 (about 37 topics), all grammar exercise types, checkpoints, grammar cards.
- Error tags + feedback in Uzbek.
- Placement test; guest mode + claiming guest progress; onboarding flow.
- Google sign-in, password reset (via Telegram or email).
- B1 vocabulary decks; pre-generated audio.
- Content report queue; grammar editor.

**DoD:** a guest can go from the landing page to a finished first lesson in under 3 minutes; A1–B1 grammar is fully playable; placement results match a teacher's assessment for 80% or more of 30 test users.

### Phase 3 — Engagement and money (about 6–8 weeks)
- Premium plans + Click/Payme + trial.
- AI tutor: "why was I wrong", word help, writing feedback.
- Stats, weak spots, leagues, achievements, streak freezes.
- Teachers and classes, assignments, dashboard.
- Offline sessions.
- B2–C1 content begins; IELTS vocabulary decks.

**DoD:** a payment goes through end to end on production with a real card; a teacher can run a class of 20 for a week; AI cost per active premium user stays within budget.

### Phase 4 — Exams and scale (ongoing)
- IELTS and CEFR tracks, practice tests, speaking practice, AI conversation.
- Telegram Mini App.
- Speech scoring (beta).
- Learning-centre (organisation) accounts.

### Later — when there is a budget
- Phone number + SMS sign-in. Every SMS is paid to a provider (e.g. Eskiz), so it waits until the app earns money. Telegram sign-in covers the same need for free.
- FSRS parameters tuned for each user.

---

## 15. Success metrics

| Metric | Target (6 months after launch) |
|---|---|
| Visitor → finished first lesson | ≥ 50% |
| Finished first lesson → signed up | ≥ 40% |
| Day-1 / day-7 / day-30 retention | ≥ 45% / ≥ 25% / ≥ 12% |
| Median daily minutes (active users) | ≥ 10 |
| Accuracy on mature reviews (interval of 21 days or more) | ≥ 85% (lower → intervals are too long or the content is unclear) |
| Free → premium conversion | ≥ 3% of monthly active users |
| Content problems reported per 1,000 items answered | ≤ 0.5, falling |
| Learners who move up a placement level within 3 months | ≥ 30% of those who retake the test |

---

## 16. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Uzbek translations of poor quality | Learners lose trust; we lose our main advantage | Human review of every published item; report queue; track error rates per item |
| Content production is slow | Phases slip | AI drafts + teacher review; launch with A1–A2 only; grow level by level |
| Copyrighted word lists or exam materials | Legal trouble | Openly licensed lists only; all exam tasks are our own originals |
| Personal data must be stored in Uzbekistan | Hosting has to change later | Check with a lawyer before launch; choose a local data centre or a compliant cloud from the start |
| AI costs grow faster than revenue | Losses | Per-user budgets, caching, small models where possible, premium-only for heavy features |
| SMS cost / abuse | Unexpected bills | Phone + SMS sign-in is postponed until there is a budget; when added: rate limits per phone and per IP, captcha after 2 requests |
| Payment integration delays (Click/Payme need merchant registration) | Premium launch slips | Start the merchant paperwork during Phase 1 |
| Learners drop off after the first week | Low retention | Telegram reminders, streaks, short sessions, measure everything in §15 |
| Competitors (Duolingo, local Telegram channels and teachers) | Hard to stand out | Focus on Uzbek-specific errors, exam prep, teacher tools, and content quality |

---

## 17. Open questions

1. **Brand name and domain.** "Vocabulary Notebook" is a working name.
2. **Prices** in UZS for monthly / 6-month / yearly plans. Check them against learning-centre prices and competitors.
3. **Hosting** for the API and database: local Uzbek provider vs international cloud (depends on the data-law check).
4. **British or American English as the default?** Suggestion: British (IELTS), with American spellings accepted and US audio offered.
5. **Russian interface:** add it later, or never?
6. **Should guests be able to use the AI tutor?** Suggestion: no — it needs an account, for cost control.
7. **Content team:** who are the first 1–2 teacher-reviewers, and how are they paid?
8. **FSRS or SM-2 for the first release?** Suggestion: FSRS, using an existing open-source implementation.
9. **Minimum age** and how to handle users under 16 (parental consent).
