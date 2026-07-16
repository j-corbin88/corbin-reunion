import { getStore } from "@netlify/blobs";

// Normalize for grading (ignore case, spacing, punctuation)
function norm(s) {
  return String(s || "").toLowerCase().trim().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}
function makeId() {
  return "q" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default async (req) => {
  const store = getStore({ name: "reunion-trivia", consistency: "strong" });

  const getQuestions = async () => (await store.get("questions", { type: "json" })) || [];
  const getPlayers = async () => (await store.get("players", { type: "json" })) || {};

  const leaderboard = (players) =>
    Object.values(players)
      .map((p) => ({ name: p.name, score: p.score || 0, answered: Object.keys(p.answered || {}).length }))
      .sort((a, b) => b.score - a.score || b.answered - a.answered)
      .slice(0, 20);

  // Serve a question WITHOUT revealing which option is correct
  const serve = (q) => ({ id: q.id, q: q.q, options: shuffle(q.options || [q.answer]) });

  // Questions this player hasn't answered and didn't write
  const openFor = (questions, rec) => {
    const answered = rec.answered || {};
    return questions.filter((q) => !answered[q.id]);
  };

  if (req.method === "GET") {
    const url = new URL(req.url);
    const rawName = url.searchParams.get("player") || "";
    const player = norm(rawName);
    const questions = await getQuestions();
    const players = await getPlayers();
    const board = leaderboard(players);

    if (!player) return Response.json({ totalQuestions: questions.length, leaderboard: board });

    const rec = players[player] || { name: rawName, score: 0, answered: {} };
    const open = openFor(questions, rec);
    return Response.json({
      score: rec.score || 0,
      answeredCount: Object.keys(rec.answered || {}).length,
      totalQuestions: questions.length,
      remaining: open.length,
      question: open.length ? serve(open[0]) : null,
      questions: open.map(serve),
      leaderboard: board,
    });
  }

  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response("Bad request", { status: 400 });
    }

    const rawName = (body.player || "").toString().trim().slice(0, 24);
    const player = norm(rawName);
    if (!player) return new Response("Name required", { status: 400 });

    // Add a multiple-choice question
    if (body.action === "add") {
      const q = (body.q || "").toString().trim().slice(0, 200);
      const answer = (body.answer || "").toString().trim().slice(0, 80);
      const wrong = Array.isArray(body.wrong)
        ? body.wrong.map((w) => String(w || "").trim().slice(0, 80)).filter(Boolean)
        : [];
      if (!q || !answer) return new Response("Question and correct answer required", { status: 400 });
      if (wrong.length < 1) return new Response("At least one wrong answer required", { status: 400 });

      // De-duplicate options while keeping the correct answer
      const seen = new Set();
      const options = [answer, ...wrong].filter((o) => {
        const n = norm(o);
        if (!n || seen.has(n)) return false;
        seen.add(n);
        return true;
      });
      if (options.length < 2) return new Response("Need at least two distinct options", { status: 400 });

      const questions = await getQuestions();
      questions.push({ id: makeId(), q, answer, options, author: rawName });
      await store.setJSON("questions", questions);
      return Response.json({ ok: true, totalQuestions: questions.length });
    }

    // Answer a question (once per player)
    if (body.action === "answer") {
      const id = (body.id || "").toString();
      const questions = await getQuestions();
      const question = questions.find((x) => x.id === id);
      if (!question) return new Response("No such question", { status: 404 });

      const players = await getPlayers();
      const rec = players[player] || { name: rawName, score: 0, answered: {} };
      rec.name = rawName;
      rec.answered = rec.answered || {};

      if (rec.answered[id]) {
        const open = openFor(questions, rec);
        return Response.json({
          already: true, correct: false, correctAnswer: question.answer,
          score: rec.score || 0, remaining: open.length,
          question: open.length ? serve(open[0]) : null, questions: open.map(serve),
          leaderboard: leaderboard(players),
        });
      }

      const correct = norm(body.answer) !== "" && norm(body.answer) === norm(question.answer);
      rec.answered[id] = 1;
      if (correct) rec.score = (rec.score || 0) + 1;
      players[player] = rec;
      await store.setJSON("players", players);

      const open = openFor(questions, rec);
      return Response.json({
        correct, correctAnswer: question.answer, score: rec.score || 0,
        remaining: open.length, question: open.length ? serve(open[0]) : null,
        questions: open.map(serve), leaderboard: leaderboard(players),
      });
    }

    return new Response("Unknown action", { status: 400 });
  }

  return new Response("Method not allowed", { status: 405 });
};
