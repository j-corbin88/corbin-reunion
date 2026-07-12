import { getStore } from "@netlify/blobs";

// Keep the top 50 in storage; return the top 20 to the page.
const MAX_KEEP = 50;

export default async (req) => {
  const store = getStore("reunion-leaderboard");

  // Read the leaderboard
  if (req.method === "GET") {
    const scores = (await store.get("scores", { type: "json" })) || [];
    return Response.json(scores.slice(0, 20));
  }

  // Add a score
  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response("Bad request", { status: 400 });
    }

    let name = (body && body.name ? String(body.name) : "").trim().slice(0, 20);
    const score = parseInt(body && body.score, 10);

    if (!name) name = "Anonymous";
    if (!Number.isFinite(score) || score < 0 || score > 1000) {
      return new Response("Invalid score", { status: 400 });
    }

    const scores = (await store.get("scores", { type: "json" })) || [];
    scores.push({ name, score, ts: Date.now() });
    // Highest score first; earlier submission wins ties
    scores.sort((a, b) => b.score - a.score || a.ts - b.ts);

    const trimmed = scores.slice(0, MAX_KEEP);
    await store.setJSON("scores", trimmed);

    return Response.json(trimmed.slice(0, 20));
  }

  return new Response("Method not allowed", { status: 405 });
};
