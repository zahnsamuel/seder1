# Transfer items — authoring schema (north-star #9)

Product law: [`docs/skill-graph-north-star.md`](skill-graph-north-star.md) checklist item 9.
Starter-set freeze: [`docs/foundation-starter-set.md`](foundation-starter-set.md).
Assessment node class: [`docs/foundation-graph-schema.md`](foundation-graph-schema.md) §2.3.

**This stages the shape. It does not fill the 0/55 (starter: 0/29) transfer-item gap.**
Software cannot invent real transfer pedagogy. The two items in
`data/foundation-transfer-items.examples.json` are labeled **EXAMPLE** — schema
illustrations, not production coverage, and they are **not** loaded by academy.

## What a transfer item is

A **transfer** item asks the learner to make the **same skill** on a source family
they did **not** practice in.

| Kind | File | Family | Job |
|---|---|---|---|
| Recognition / practice | `data/foundation-authored-items.json` (Claude) | Familiar (the bank) | Secure the move in known genres |
| Transfer | this schema | Unfamiliar (`sourceFamily` ∉ `practicedFamilies`) | Evidence the move travels |

Do **not** put transfer items in `foundation-authored-items.json`. That file is the
per-skill recognition bank (≥3 items). Mixing them would hide the transfer gap
inside a practice bank.

The graph already has a `transfer` **string** on every skill (what the move looks
like in a new genre). That is teaching language, not an assessment item.
`npm run graph:quality` still reports authored transfer items as 0 until a
`status: ready` item exists for the skill.

## Files

| File | Role |
|---|---|
| [`data/foundation-transfer-items.schema.json`](../data/foundation-transfer-items.schema.json) | JSON Schema (the contract) |
| [`data/foundation-transfer-items.examples.json`](../data/foundation-transfer-items.examples.json) | 2 EXAMPLE entries. `status: examples-only`. `loadIntoAcademy: false` |
| [`data/foundation-transfer-items.mjs`](../data/foundation-transfer-items.mjs) | Shared validator (used by tests; later by an import script) |
| *future* `data/foundation-transfer-items.json` | Educator-authored `draft` / `ready` items. Not created in this pass |

Academy may optionally load `ready` items later. Until that wiring exists, keep
`loadIntoAcademy: false` on every record.

## Required fields (one item)

Same stem/choices/`correct`/feedback/`sourceRef` conventions as the recognition
bank, plus transfer-only fields:

```
id                 example-xfer-<skill>-<n>   (illustrations)
                   xfer-<skill>-<n>           (real authored items)
label              include "EXAMPLE" on illustrations
skill              fnd-* from the graph (starter set first)
type               "transfer"
status             example | draft | ready
loadIntoAcademy    false until academy is wired; examples stay false
sourceRef          exact citation (work, chapter / folio / se'if)
sefariaUrl         https://www.sefaria.org/…  (verify before shipping)
sourceFamily       tanakh | rabbinic | halakhic | liturgical | thought | historical
practicedFamilies  families the skill was actually practiced in
whyTransfer        educator note: what is new, why it is still this skill
stem               on-page Hebrew excerpt + translation + one clear ask
choices            2–5 distinct strings (plausible wrong readings)
correct            index into choices in this authoring file
feedback           teaches after the answer (≥25 characters)
```

Optional: `misconceptions` (empty until the audit names them), `difficulty` /
`discrimination` (null until the pilot).

**Invariant:** `sourceFamily` must not appear in `practicedFamilies`. That is the
whole difference between transfer and another practice item.

Render choices **shuffled** (same pattern as `course-engine.js` / `canon-course.js`).
Never show them in data order with a fixed visible `correct` index. When academy
loads production items, strip `correct` from the client payload the way
`data/foundation-assessment-items.json` already does.

## How to add a real transfer item

1. Pick a **starter** skill (`data/foundation-starter-set.json`). Frozen skills wait.
2. List the families already in that skill's recognition bank (and teaching
   contexts). Those are `practicedFamilies`.
3. Choose a real source in a **different** family. Verify the Hebrew and
   translation on Sefaria; put the excerpt in the stem (not a link as the ask).
4. Ask the learner to make **this skill's move**, not a new skill. Distractors are
   near-miss readings of the same source.
5. Copy an EXAMPLE object. Change `id` to `xfer-<skill>-1`, `status` to `draft`,
   drop "EXAMPLE" from `label` and the stem.
6. Keep length-bias in check: the correct choice must not be the obvious longest.
   Avoid untaught jargon in the stem and choices (product law: teach a term before
   you test it). Sensitive subjects still need a study-not-ruling boundary.
7. Second-reader pass → `status: ready`. Do **not** edit
   `foundation-authored-items.json`.
8. Land ready items in a new `data/foundation-transfer-items.json` (not the
   examples file). Coverage counts only `ready` items. Examples never count.

Do not author 29–55 items in one pass to "clear the bar." One honest item per
skill, reviewed, beats a generated bank.

## The two EXAMPLE entries (what they are demonstrating)

| Id | Skill | Practiced in | Transfer source | Why it is transfer |
|---|---|---|---|---|
| `example-xfer-fnd-orient-source-type-1` | Tell what kind of text you are looking at | tanakh + rabbinic (Torah / Mishnah / Gemara / commentary) | Shulchan Aruch, Orach Chaim 1:1 (halakhic code) | Same genre-naming move; ruling-code tells, not verse/mishnah/gemara |
| `example-xfer-fnd-arg-claim-1` | State the claim | thought + rabbinic (Rambam Yesodei HaTorah 1:1, Berakhot 2a) | Psalms 23:1 (tanakh) | Same "this source claims that…" move in a psalm |

Citations checked on Sefaria (2026-09-08):
- https://www.sefaria.org/Shulchan_Arukh,_Orach_Chayim.1.1
- https://www.sefaria.org/Psalms.23.1

Hebrew for Orach Chaim 1:1 is the standard opening line ("strengthen like a lion…"),
not the Maginei Eretz concatenation Sefaria's default Hebrew version sometimes
returns. English follows that opening.

## What this does *not* do

- Does not rewrite or deepen `data/foundation-authored-items.json`.
- Does not invent a transfer item for every starter skill.
- Does not change Today, next-action, placement, or academy-session loading.
- Does not move `graph:quality`'s transfer count off 0.
