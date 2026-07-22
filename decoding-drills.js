// Hebrew decoding drills — the content behind the decoding ladder (Modern/Israeli pronunciation).
// A distinct global (window.DecodingDrills, NOT window.SederCourse) so loadUnits and the
// source-reasoning audit ignore it — decoding is genre-less phonics with its own model and its own
// integrity check (test/decoding-drills.test.mjs). `bands` is the ordered manifest the index renders;
// `lessons` holds each lesson's glyph-card items. Each item: a glyph, a recognition prompt, MC answers
// (index 0 is correct before the engine shuffles), feedback, an optional `say` (a short Hebrew string
// for the text-to-speech "hear it" button), and a `short` label for the progress rail.
window.DecodingDrills = {
  bands: [
    { id: '0.1', title: 'Letters', lessons: ['letters-1', 'letters-2', 'letters-3'] },
    { id: '0.2', title: 'Vowels', lessons: ['vowels-1'] }
  ],
  lessons: {
    'letters-1': {
      band: '0.1', bandLabel: 'LETTERS · LESSON 1', title: 'Meet your first Hebrew letters.',
      intro: 'Seven letters to start, in Modern Hebrew pronunciation. Read the letter, not the vowel.',
      items: [
        { glyph: 'א', short: 'alef', prompt: 'This is the first letter, alef. What sound does it make on its own?', answers: ['No sound of its own — alef is silent, and simply carries whatever vowel is written with it.', 'A hard “g” sound, as in “go.”', 'An “sh” sound, as in “shalom.”'], correct: 0, feedback: 'Right. Alef (א) is silent; it holds a vowel but adds no consonant sound of its own.' },
        { glyph: 'בּ', short: 'bet', say: 'בָּ', prompt: 'This letter has a dot inside it (בּ). It is bet. What sound does it make?', answers: ['“b” as in “boy” — the dot inside, a dagesh, gives it the hard sound.', '“v” as in “voice,” which is what it says without the dot.', '“d” as in “door.”'], correct: 0, feedback: 'Yes. With the dot it is bet, “b.” Without the dot, ב softens to “v” — vet.' },
        { glyph: 'ג', short: 'gimel', say: 'גָּ', prompt: 'This letter is gimel. What sound does it make?', answers: ['“g” as in “go” — always the hard g, never a soft “j.”', '“j” as in “jam.”', '“k” as in “kite.”'], correct: 0, feedback: 'Correct. Gimel (ג) is a hard “g,” as in “go.”' },
        { glyph: 'ד', short: 'dalet', say: 'דָּ', prompt: 'This letter is dalet. What sound does it make?', answers: ['“d” as in “door” — note the square heel at its lower right.', '“r,” a rolled r, which belongs to a rounder look-alike letter.', '“t” as in “table.”'], correct: 0, feedback: 'Right, dalet is “d.” Its sharp heel tells it from the round ר (resh), which you meet next.' },
        { glyph: 'ר', short: 'resh', say: 'רָ', prompt: 'This is resh — the look-alike you were warned about. What sound, and how is it shaped differently from dalet?', answers: ['“r,” and it is round-shouldered with no heel, where dalet (ד) has a square corner.', '“d,” and it is identical to dalet.', '“z,” like zayin.'], correct: 0, feedback: 'Exactly. Resh (ר) says “r” and curves; dalet (ד) says “d” and turns a corner.' },
        { glyph: 'ה', short: 'hey', say: 'הָ', prompt: 'This letter is hey. What sound does it make?', answers: ['“h” as in “hello,” a soft breath.', '“ch,” a throat-clearing sound, which belongs to another letter.', '“t” as in “table.”'], correct: 0, feedback: 'Right. Hey (ה) is a light “h.” Its small upper-left gap tells it from chet (ח).' },
        { glyph: 'ו', short: 'vav', say: 'וָ', prompt: 'This letter is vav. As a consonant, what sound does it make?', answers: ['“v” as in “vine” — though it will also mark the vowels “o” and “u.”', '“w” as in “water,” always.', 'It is silent, like alef.'], correct: 0, feedback: 'Correct. As a consonant, vav (ו) says “v”; with a dot it also spells “o” (וֹ) and “u” (וּ).' },
        { glyph: 'ז', short: 'zayin', say: 'זָ', prompt: 'This letter is zayin. What sound does it make?', answers: ['“z” as in “zebra.”', '“v,” the same as vav.', 'No sound of its own, like alef.'], correct: 0, feedback: 'Right, zayin (ז) says “z.” Its crown and straight leg tell it from plain vav (ו).' },
        { glyph: 'ג', short: 'find g', say: 'גָּ', prompt: 'The other way around: which letter makes the “g” sound, as in “go”?', answers: ['This one — gimel (ג).', 'Zayin, which says “z.”', 'Dalet, which says “d.”'], correct: 0, feedback: 'Well read. Recognizing a letter from its sound is how decoding becomes automatic.' }
      ]
    },
    'letters-2': {
      band: '0.1', bandLabel: 'LETTERS · LESSON 2', title: 'The middle letters.',
      intro: 'Seven more: chet through nun. Two of them change sound with a dot, and two have final forms.',
      items: [
        { glyph: 'ח', short: 'chet', say: 'חָ', prompt: 'This letter is chet. What sound does it make?', answers: ['A throaty “ch,” from the back of the throat (as in “challah”).', 'A soft “h,” a light breath.', 'A hard “k.”'], correct: 0, feedback: 'Chet (ח) is a throaty “ch.” It is closed on top — that tells it from hey (ה), which has a gap.' },
        { glyph: 'ט', short: 'tet', say: 'טָ', prompt: 'This letter is tet. What sound does it make?', answers: ['“t” as in “table.”', '“ch,” throaty.', '“m.”'], correct: 0, feedback: 'Tet (ט) is “t.” In Modern Hebrew it sounds the same as tav (ת) — both say “t.”' },
        { glyph: 'י', short: 'yod', say: 'יָ', prompt: 'This small letter is yod. What sound does it make?', answers: ['“y” as in “yes” — the smallest letter, and it also helps mark vowels.', '“v.”', 'Silent, like alef.'], correct: 0, feedback: 'Yod (י) is “y.” It is the smallest letter; you will also see it lengthen an “i” or “e.”' },
        { glyph: 'כּ', short: 'kaf', say: 'כָּ', prompt: 'This letter with a dot (כּ) is kaf. What sound does it make?', answers: ['“k” — the dot makes it hard, like bet and pei.', '“ch,” throaty, which is what it says without the dot.', '“g.”'], correct: 0, feedback: 'With the dot it is kaf, “k”; without it (כ) it softens to a throaty “ch” — chaf. Final form: ך.' },
        { glyph: 'ל', short: 'lamed', say: 'לָ', prompt: 'This tall letter is lamed. What sound does it make?', answers: ['“l” as in “light” — the one letter that rises above the line.', '“r.”', '“n.”'], correct: 0, feedback: 'Lamed (ל) is “l,” and it is the tallest letter, reaching above the line.' },
        { glyph: 'מ', short: 'mem', say: 'מָ', prompt: 'This letter is mem. What sound does it make?', answers: ['“m” as in “moon.”', '“s.”', '“t.”'], correct: 0, feedback: 'Mem (מ) is “m.” At the end of a word it becomes the closed final form ם.' },
        { glyph: 'נ', short: 'nun', say: 'נָ', prompt: 'This letter is nun. What sound does it make?', answers: ['“n” as in “now.”', '“g.”', '“v.”'], correct: 0, feedback: 'Nun (נ) is “n.” Its final form is ן, a long stroke dropping below the line.' },
        { glyph: 'ח', short: 'find ch', say: 'חָ', prompt: 'Which of these letters makes the throaty “ch” sound?', answers: ['This one — chet (ח).', 'Tet, which says “t.”', 'Lamed, which says “l.”'], correct: 0, feedback: 'Right — chet (ח) carries the throaty “ch.”' }
      ]
    },
    'letters-3': {
      band: '0.1', bandLabel: 'LETTERS · LESSON 3', title: 'The last letters, and the final forms.',
      intro: 'The final eight letters, the shin/sin dot, and the five sofit (final) forms that close a word.',
      items: [
        { glyph: 'ס', short: 'samech', say: 'סָ', prompt: 'This round letter is samech. What sound does it make?', answers: ['“s” as in “sun” — closed and round.', '“m.”', 'Silent.'], correct: 0, feedback: 'Samech (ס) is “s.” It is round and closed — tell it from the more square final mem ם.' },
        { glyph: 'ע', short: 'ayin', prompt: 'This letter is ayin. What sound does it make in Modern Hebrew?', answers: ['No sound of its own — like alef, it carries a vowel.', 'A hard “g.”', '“ts.”'], correct: 0, feedback: 'Ayin (ע) is treated as silent in Modern Hebrew, carrying its vowel — the second silent carrier, with alef.' },
        { glyph: 'פּ', short: 'pei', say: 'פָּ', prompt: 'This letter with a dot (פּ) is pei. What sound does it make?', answers: ['“p” — the dot hardens it, like bet and kaf.', '“f,” which is what it says without the dot.', '“b.”'], correct: 0, feedback: 'With the dot it is pei, “p”; without it (פ) it softens to “f” — fei. Final form: ף.' },
        { glyph: 'צ', short: 'tzadi', say: 'צָ', prompt: 'This letter is tzadi. What sound does it make?', answers: ['“ts” as in “cats.”', '“s.”', '“z.”'], correct: 0, feedback: 'Tzadi (צ) is “ts.” Its final form is ץ, dropping below the line.' },
        { glyph: 'ק', short: 'kuf', say: 'קָ', prompt: 'This letter is kuf. What sound does it make?', answers: ['“k” as in “kite” — it sounds like kaf, but is its own letter.', '“ch,” throaty.', '“g.”'], correct: 0, feedback: 'Kuf (ק) is “k.” It matches kaf-with-dagesh in sound, but drops below the line.' },
        { glyph: 'שׁ', short: 'shin', say: 'שָׁ', prompt: 'This letter has a dot on the upper right. What sound does it make?', answers: ['The dot on the RIGHT makes “sh” — this is shin.', 'The dot means “t.”', 'It is always silent.'], correct: 0, feedback: 'Dot on the right = shin, “sh” (שׁ). Dot on the left = sin, “s” (שׂ). Same body, different dot.' },
        { glyph: 'ת', short: 'tav', say: 'תָּ', prompt: 'This letter is tav. What sound does it make in Modern Hebrew?', answers: ['“t” as in “table.”', '“th” as in “think,” always.', '“s.”'], correct: 0, feedback: 'Tav (ת) is “t” in Modern Hebrew. Its left foot tells it from chet (ח) and hey (ה).' },
        { glyph: 'ך ם ן ף ץ', short: 'finals', prompt: 'These five shapes appear only at the end of a word. What are they?', answers: ['The FINAL forms of chaf, mem, nun, fei, and tzadi — the same letters, written to close a word.', 'Five brand-new letters to memorize separately.', 'Letters that only appear at the start of a word.'], correct: 0, feedback: 'The five sofit forms — ך ם ן ף ץ — are just כ מ נ פ צ written differently because they end the word.' }
      ]
    },
    'vowels-1': {
      band: '0.2', bandLabel: 'VOWELS · LESSON 1', title: 'The five vowel sounds.',
      intro: 'Letters carry vowels written as dots and lines. Meet the five sounds — a, e, i, o, u — on the letter bet.',
      items: [
        { glyph: 'בָּ', short: 'a', say: 'בָּ', prompt: 'The mark under this letter is a kamatz. What vowel sound does it make?', answers: ['“a” — so בָּ is “ba.” (A flat patach, ַ, also says “a.”)', '“o.”', '“e.”'], correct: 0, feedback: 'Kamatz (ָ) says “a” in most cases; patach (ַ), a flat line, also says “a.” Two marks, one sound.' },
        { glyph: 'בֵּ', short: 'e', say: 'בֵּ', prompt: 'The two dots under this letter are a tzere. What vowel sound?', answers: ['“e” — so בֵּ is “be.” (Three dots, segol ֶ, also says “e.”)', '“i.”', '“a.”'], correct: 0, feedback: 'Tzere (ֵ, two dots) says “e.” Segol (ֶ, three dots) also says “e.”' },
        { glyph: 'בִּ', short: 'i', say: 'בִּ', prompt: 'The single dot under this letter is a chirik. What vowel sound?', answers: ['“i” as in “machine” — so בִּ is “bee.”', '“e.”', '“u.”'], correct: 0, feedback: 'One dot beneath, chirik (ִ), says “i.” Count the dots to tell it from tzere’s two.' },
        { glyph: 'בּוֹ', short: 'o', say: 'בּוֹ', prompt: 'A vav topped by a dot marks the vowel here. What sound?', answers: ['“o” — cholam — so בּוֹ is “bo.”', '“u.”', '“a.”'], correct: 0, feedback: 'Cholam says “o”: a dot at the upper left, or written full with a vav — וֹ.' },
        { glyph: 'בּוּ', short: 'u', say: 'בּוּ', prompt: 'A vav with a dot in its middle marks the vowel here. What sound?', answers: ['“u” — shuruk — so בּוּ is “boo.”', '“o.”', '“i.”'], correct: 0, feedback: 'Shuruk (וּ) says “u.” Kubutz — three diagonal dots (ֻ) — also says “u.”' },
        { glyph: 'בִּ', short: 'spot i', prompt: 'A single dot sits directly under a letter. Which vowel is it?', answers: ['Chirik — “i.”', 'Cholam — “o.”', 'Shuruk — “u.”'], correct: 0, feedback: 'Position matters: one dot beneath = chirik = “i”; a dot at the upper left = cholam = “o.”' },
        { glyph: 'שָׁלוֹם', short: 'read it', say: 'שָׁלוֹם', prompt: 'Now read a whole word: shin-“a”, lamed, vav-“o”, mem. What is it?', answers: ['“Shalom” — peace, and hello.', '“Shesh.”', '“Melech.”'], correct: 0, feedback: 'שָׁלוֹם = “shalom.” You just blended consonants and vowels into a real word — the whole point.' }
      ]
    }
  }
};
