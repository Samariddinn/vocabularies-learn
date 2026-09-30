# Vocabulary Notebook

An Angular 22 web app for learning English vocabulary by **writing words from memory**. Today it
is a personal notebook: words are stored in the browser (IndexedDB), and a writing drill shows the
meaning and asks for the word. It is installable as a PWA and deployed to Netlify.

**Where it is going:** a site for **Uzbek speakers** learning English, with vocabulary by CEFR
level, tests generated from that vocabulary, login, and reading and listening activities, on top
of a backend (not chosen yet). Build new work so it fits that direction. See "Roadmap" below.

## Commands

```bash
npm start                    # dev server on http://localhost:4200 (service worker off)
npm run build                # production build → dist/note/browser
npx ng test --watch=false    # Vitest unit tests, one run (plain `ng test` watches)
npx prettier --write <file>  # formatting: 100 columns, single quotes
```

Run the build and tests after every change.

## Layout

```
src/app/
  app.ts|html|css      the shell: header, tabs, sidebar tally, the add/edit dialog
  app.config.ts        providers (service worker)
  core/                app-wide services with no UI; one instance each (providedIn: 'root')
    vocab/             Entry model + VocabStore: IndexedDB persistence, status, import/export
    dictionary/        word lookup: part of speech, pronunciation respelling, definitions
    speech/            text-to-speech through the browser's speechSynthesis
  shared/              reusable UI used by more than one feature
    speak-button/      speaker icon that reads a word aloud
  features/            one folder per area of the product
    notebook/          the word list (library) and the add/edit form (entry-form)
    drill/             the writing drill (practice), including the answer masking
src/styles.css         ALL styling: design tokens, light/dark themes, every component's classes
```

Rules for this layout:

- **Imports use aliases:** `@core/...`, `@shared/...`, `@features/...` (defined in
  `tsconfig.json`). Use `./` only for files in the same folder.
- **Dependencies point one way:** features → shared → core. `core` never imports from `shared`
  or `features`. A feature never imports from another feature; move the common piece to
  `shared` (UI) or `core` (logic) instead.
- **A new product area gets its own folder** in `features/`, e.g. `features/levels`,
  `features/tests`, `features/reading`, `features/listening`, `features/auth`.
- **"Module" means a folder, not an NgModule.** Everything is a standalone component. Don't add
  NgModules.

## Conventions

- **Components:** standalone, `templateUrl` with a sibling `.html` file (a tiny template may be
  inline, like `speak-button`). Use `inject()`, not constructor parameters, and `input()` /
  `output()` / `viewChild()` signal APIs, not decorators.
- **State:** signals and `computed()`. No RxJS in app code, no NgRx.
- **Templates:** built-in control flow (`@if`, `@for`, `@switch`), not `*ngIf`/`*ngFor`. Form
  fields are bound by hand (`[value]` plus `(input)` into a signal). Angular Forms isn't used.
- **File names:** no `.component` / `.service` suffixes (`library.ts`, `vocab-store.ts`); class
  names without suffixes either (`Library`, `Dictionary`, `Speech`).
- **Comments** explain _why_, or give a concrete example, in plain sentences. Match the density
  of the existing code: a doc comment on non-obvious functions, none on the obvious ones.
- **Tests:** Vitest through `ng test`. Import `describe`/`it`/`expect` from `vitest` explicitly.
  Put a test next to its file (`dictionary.spec.ts`). Pure functions like `respell` and
  `maskAnswer` are the first things worth testing.

## Styling

- All CSS lives in `src/styles.css`, organised by section. Component `.css` files are not used.
  Add new classes there, next to the section they belong to.
- Colours, radii and motion come from tokens on `:root` (`--ink`, `--ink-2`, `--ink-3`,
  `--accent`, `--accent-soft`, `--surface`, `--surface-sunk`, `--rule-strong`, `--r-sm`,
  `--r-pill`, `--dur-1`, `--ease`, …). Never hard-code a colour.
- Themes: the tokens are redefined under `@media (prefers-color-scheme: dark)` for
  `:root:not([data-theme='light'])` and under `:root[data-theme='dark']`. The Auto/Light/Dark
  button sets `data-theme`. Any new colour token needs both dark definitions.
- Tailwind v4 is imported at the top of `styles.css`, but the UI uses no utility classes. Keep it
  that way: write named classes with tokens.
- The design language is "ink on notebook paper": serif headwords, ruled lines, quiet buttons.
  For visual work, see `.agents/skills/frontend-design`.
- It must work at phone width. Most future users will be on phones.

## Data

- `Entry` (in `core/vocab/vocab-store.ts`): word, reading (pronunciation), pos, meaning, example,
  collocations[], tags[], plus drill progress (streak, attempts, correct, reviewedAt).
- A word counts as memorized after `MASTERY_STREAK` (5) correct spellings in a row. The status can
  also be set by hand.
- **Adding a field to `Entry`:** entries already saved don't have it. Give it a default where the
  store loads (see how `collocations` is defaulted in `open()`) and in `importJson()`, and update
  the test fixture in `app.spec.ts`.
- Export/import is a JSON file with `{ app, version, entries }`. Keep old backups importable.

## External services

- **dictionaryapi.dev** (definitions, part of speech) and **Datamuse** (backup definitions, and
  always the pronunciation) are both free and need no key. Both are called from
  `core/dictionary`. dictionaryapi.dev goes down now and then (Cloudflare 522), so every call has
  a 4 s timeout, and the form must keep working when both fail.
- Pronunciation is shown as a readable respelling ("suh-STAY-nuh-buhl"), converted from Datamuse's
  ARPAbet by `respell()`. Don't show raw IPA to learners.
- Multi-word phrases never go to the network. Their part of speech comes from rules (`byShape`).
- Speech uses the browser's `speechSynthesis`. It's fine for single words but too robotic for
  listening passages; those will need pre-generated audio files.

## Behaviour to preserve

- The dictionary lookup only fills fields that are empty, or that it filled itself. It never
  overwrites what the user typed.
- The drill never reveals the answer before the user checks: the example sentence is masked
  (`maskAnswer` hides split and inflected forms of phrases), and the speak button and
  collocations appear only after checking.
- Saving in the add/edit dialog closes it. The shell shows the "Added …" message.

## Deploy

Netlify builds on push (`netlify.toml`): `npm run build`, publishes `dist/note/browser`, Node 22.
`ngsw-worker.js`, `ngsw.json` and `index.html` are served no-cache so a deploy reaches installed
PWAs. Don't remove those headers.

## Roadmap

Planned, roughly in this order:

1. Backend with login, and the user's words stored there. On first login, upload the words
   already in IndexedDB so nothing is lost.
2. Vocabulary by CEFR level (A1–C2) with Uzbek translations, plus an admin page for entering
   content.
3. Tests generated from the vocabulary: gap-fill (reuse `maskAnswer`), spell what you hear,
   write the word from its meaning, multiple choice, collocation matching.
4. Reading, then listening, with texts and questions per level.

Other decisions so far:

- The interface will be in Uzbek (Latin script), with English as an option. Meanings shown to
  learners should be available in Uzbek.
- The drill should move from "5 in a row" to spaced repetition.
- The personal notebook stays alongside the ready-made lists.
