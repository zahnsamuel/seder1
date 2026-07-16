// Content sophistication audit. Scores every course unit, lab, and canon course
// against the standard in docs/content-standard.md. Run from repo root:
//   node scripts/audit-content.mjs
import { readFileSync, readdirSync } from 'node:fs';

const units = [];

// --- SederCourse unit files (window.SederCourse = {...}) ---
const jsFiles = readdirSync('.').filter((f) => f.endsWith('.js'));
for (const file of jsFiles) {
  const src = readFileSync(file, 'utf8');
  if (!src.includes('window.SederCourse')) continue;
  const window = {};
  try { (0, eval)(`(function(window, document, location){${src.replace(/^const arcId.*$/m, 'const arcId="chassidus";')}})`)(window, undefined, undefined); } catch { /* DOM code after assignment may throw; SederCourse is usually set by then */ }
  const course = window.SederCourse;
  if (!course || !course.steps) continue;
  units.push({ kind: 'unit', id: file.replace('.js', ''), steps: course.steps, title: course.completeTitle || '' });
}

// --- Tractate labs ---
const labs = JSON.parse(readFileSync('data/tractate-labs.json', 'utf8'));
for (const lab of labs.labs || labs) {
  if (!lab.steps) continue;
  units.push({ kind: 'lab', id: `lab:${lab.id}`, steps: lab.steps.map((s) => ({ ...s, prompt: s.prompt, answers: s.answers, correct: s.correct, feedback: s.feedback })), title: lab.focus || '' });
}

// --- Canon six-session courses (served merged; read the files the server reads) ---
const courseFiles = ['canon-six-session-courses', 'tefillah-six-session-course', 'thought-six-session-course', 'history-six-session-course', 'responsibility-six-session-course'];
for (const cf of courseFiles) {
  const data = JSON.parse(readFileSync(`data/${cf}.json`, 'utf8'));
  for (const c of data.courses) {
    units.push({ kind: 'course', id: `course:${c.id}`, steps: c.sessions.map((s) => ({ ...s, answers: s.choices, feedback: s.explanation })), production: !!c.production, title: c.title });
  }
}

// --- Metrics ---
const sensitive = /niddah|sotah|kaddish|mourn|honor.*parent|anger|simcha|grief|family/i;
function analyze(u) {
  const steps = u.steps;
  const mc = steps.filter((s) => Array.isArray(s.answers) && typeof s.correct === 'number');
  let correctLongest = 0, dupAnswers = 0, thinFeedback = 0, thinDistractors = 0;
  for (const s of mc) {
    const lens = s.answers.map((a) => a.length);
    if (lens[s.correct] === Math.max(...lens) && lens[s.correct] > 1.5 * Math.min(...lens)) correctLongest++;
    if (new Set(s.answers).size < s.answers.length) dupAnswers++;
    if (!s.feedback || s.feedback.length < 25) thinFeedback++;
    const distractors = s.answers.filter((_, i) => i !== s.correct);
    if (distractors.some((d) => d.length < 12)) thinDistractors++;
  }
  // Production principle (2026-07-15): a unit earns production credit for a terminal
  // check that PRODUCES, not merely recognizes — either a typed recall (produce the
  // meaning; used where the terminal competency is translation) or a shuffled,
  // retryable explanation/source check (produce a judgment about a reading move; used
  // where the terminal competency is argument/sourceReasoning). Both count here.
  const production = steps.filter((s) => s.typed || /PRODUCTION CHECK|SOURCE CHECK|EXPLANATION CHECK/i.test(s.mode || s.kind || '')).length + (u.production ? 1 : 0);
  const boundary = steps.some((s) => /RESPONSIBLE|BOUNDARY/i.test(s.mode || s.kind || '') || /boundary/i.test(s.skill || '') || /study is not|not a personal ruling|qualified guidance/i.test(s.feedback || ''));
  const needsBoundary = sensitive.test(u.id) || steps.some((s) => sensitive.test(s.ref || ''));
  const score =
    (steps.length >= 8 ? 2 : steps.length >= 6 ? 1 : 0) +
    (production > 0 ? 2 : 0) +
    (mc.length ? Math.round(3 * (1 - correctLongest / mc.length)) : 3) +
    (mc.length ? (thinFeedback / mc.length < 0.2 ? 1 : 0) : 1) +
    (!needsBoundary || boundary ? 1 : 0) +
    (dupAnswers === 0 ? 1 : 0);
  return { ...u, n: steps.length, production, correctLongest, mcCount: mc.length, thinFeedback, thinDistractors, dupAnswers, boundary, needsBoundary, score };
}

const results = units.map(analyze).sort((a, b) => a.score - b.score);
console.log('score | kind   | id                                | steps | prod  | longest-bias | thin-fb | needs/has boundary');
for (const r of results) {
  console.log(`${String(r.score).padStart(5)} | ${r.kind.padEnd(6)} | ${r.id.padEnd(33)} | ${String(r.n).padStart(5)} | ${String(r.production).padStart(5)} | ${String(r.correctLongest).padStart(3)}/${String(r.mcCount).padEnd(8)} | ${String(r.thinFeedback).padStart(7)} | ${r.needsBoundary ? (r.boundary ? 'ok' : 'MISSING') : '-'}`);
}
console.log(`\n${results.length} content units audited. Max score 10.`);
const buckets = {};
for (const r of results) buckets[r.score] = (buckets[r.score] || 0) + 1;
console.log('distribution:', JSON.stringify(buckets));
