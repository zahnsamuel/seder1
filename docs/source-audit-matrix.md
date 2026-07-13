# Seder source and instructional audit matrix

This is a learner-safety and accuracy checklist, not an editor-contribution workflow. Every source encounter must pass review before being described as production-ready. The machine-readable production contract is `data/source-review-schema.json`.

| Review field | Required check |
|---|---|
| Reference | Exact work, chapter, and folio/section are present and link to the intended primary text. |
| Hebrew/Aramaic | Text matches the cited edition; punctuation or vocalization does not change the reading. |
| Translation | Plain English reflects the source’s grammatical sense and marks paraphrase when used. |
| Genre | Torah, Mishnah, Gemara, prayer, ethical maxim, or historical source is identified correctly. |
| Context | Speaker, audience, setting, and limits are stated where they shape meaning. |
| Explanation | Explains a reading move; it does not overstate consensus or turn study into a ruling. |
| Assessment | One best answer is defensible from the source and distractors represent plausible misunderstandings. |
| Accessibility | Hebrew has `lang="he"` and `dir="rtl"`; translation and source context are available without a hover-only interaction. |
| Language support | Key terms, a sentence-role cue where needed, and a path to hear or inspect the original text are available. |
| Transfer | The learner meets the same skill in a second source form, not merely a reordered copy of the first question. |
| Safety boundary | The encounter distinguishes explaining a source from personal halakhic, medical, or pastoral guidance. |

## Review order

1. Gemara core: Berakhot, Shabbat, Eruvin, Pesachim, Sukkah, Bava Metzia, Bava Kamma, Bava Batra, Sanhedrin.
2. Sensitive-practice boundaries: Chullin, Niddah, Yoma, Kiddushin, Gittin, Yevamot.
3. Non-Gemara source sequences: Torah, Siddur, Halakha, Thought, Mussar/Chassidus, History, Wider World.
4. Every capstone, bridge, repair, and unseen-source assessment.

## Release gate

Each published encounter has a source record with all fields required by the schema and passes six gates: primary text, translation, context, assessment, accessibility, and safety boundary. This lets Seder grow without sacrificing the seriousness that makes source learning trustworthy.

No source should be presented as personal halakhic guidance. When practical action is implicated, Seder teaches the text’s structure and directs personal questions to qualified guidance.
