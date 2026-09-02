# JLA learner UI principles

Product law for Jewish Learning Academy surfaces. This is our own voice: a mastery academy
with a calm daily habit, not a content catalog and not a chat window.

The north star: **0→1 Jewish literacy** — roughly a day-school high-school graduate’s
comfort with opening Jewish texts. The emotional win is love of Jewish learning and ease
in non-Haredi Jewish spaces. Pedagogy is mastery (skill graph, placement, evidence before
advance, spaced retrieval, low cognitive load, the system chooses the next task). The
interface should feel as simple and sticky as a well-designed habit app without becoming
shallow.

Yochai’s knowledge graph is inspiration and a later source layer. These rules govern the
**learner UI** in front of that work.

## One next task

The learner should always be able to answer, in one glance: **what do I do now?**

Hub, Today, and the first screen of a lesson each have one primary action. Secondary
material (privacy, account, a progress reference) may exist; it must not compete for the
same visual rank as the next task.

## The system chooses the next action

Jewish Learning Academy is not a buffet. Placement, review, repair, and frontier work are
selected from evidence. The learner does not pick from a map of the whole curriculum in
order to begin.

Today is the recommendation surface. Academy and path pages are progress references. The
global shell must not invent a second “next step.”

## Mastery evidence over vanity XP

Progress is what the learner can now **do**: a capability demonstrated, then held, then
transferred in a new source. Hidden XP hooks may remain for older scripts; they are not
the scoreboard.

Do not lead with points, streaks-as-trophies, or a dead `0`. Before there is evidence,
invite (“Day 1”, “In reach”, “Your first reading move is waiting”). After there is
evidence, name the capability.

## A short daily rhythm

A typical sitting is about **twenty minutes**: one source, one reading move, one check.
The UI should make a short return feel complete. A lapsed learner gets a smaller re-entry,
not a guilt wall and not a full map.

## Low cognitive load

One thing at a time. Short copy. Few chrome items. No dashboard of five statuses on the
daily page. Never require the learner to understand the whole curriculum before beginning.

If a control does not help the next twenty minutes, it does not belong on the first screen.

## No chatbot as the primary UI

This is a study academy, not a conversation product. Lessons, retrieval, and source
reading are the work. A chatbot is not the home, not Today, and not the way we teach a
skill.

## Progress = skills + canon touched

A full picture of growth has two honest parts:

1. **Skills** — capabilities on the graph, with evidence states.
2. **Canon touched** — real sources the learner has actually opened (Berakhot, a Torah
   verse, a prayer, a historical document), not a generic “content complete” bar.

Vanity totals that hide which skill is fragile, or which source family has never been
seen, are not progress.

## Cream / navy / gold through `jla-system`

Visual identity lives in `jla-system.css` as `--jla-*` tokens and `.jla-*` components:
cream paper, navy ink, gold signal. Fraunces for display, Inter for body.

New learner chrome should adopt those tokens rather than invent a parallel palette.
Page-local CSS may exist; it should bridge to `--jla-*` when both sheets are present.

## A study aid, not pesak

Jewish Learning Academy teaches literacy: how to open a source, follow a move, and ask a
better question. It does not rule on practice, family life, mourning, or other lived
halakha. Sensitive subjects keep a responsible-learning boundary. Footer and voice stay
explicit: **study aid, not halakhic guidance.**

## Mobile-first

Most study happens on a phone, often in a short window.

- Primary actions are full-width on small screens and at least **44px** tall.
- Hub and Today stack to a single column; the next-action control is unmistakable.
- Hebrew retains `lang` and `dir` where it appears.
- Focus-visible outlines and the shared skip-to-main link stay intact.

If a layout only works as a wide two-column poster, it is not done.
