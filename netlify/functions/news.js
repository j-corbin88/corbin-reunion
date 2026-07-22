import { getStore } from "@netlify/blobs";

// Must match ADMIN_KEY in index.html — controls who can delete posts.
const ADMIN_KEY = "corbin2026";

function makeId() {
  return "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export default async (req) => {
  const store = getStore({ name: "reunion-news", consistency: "strong" });
  const load = async () => (await store.get("posts", { type: "json" })) || [];

  if (req.method === "GET") {
    const posts = await load();
    return Response.json({ posts: posts.slice(0, 100) });
  }

  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response("Bad request", { status: 400 });
    }

    if (body.action === "add") {
      const name = (body.name || "").toString().trim().slice(0, 40);
      const text = (body.text || "").toString().trim().slice(0, 600);
      if (!name || !text) return new Response("Name and message required", { status: 400 });
      const posts = await load();
      posts.unshift({ id: makeId(), name, text, ts: Date.now() });
      await store.setJSON("posts", posts.slice(0, 200));
      return Response.json({ posts: posts.slice(0, 100) });
    }

    if (body.action === "delete") {
      if (body.key !== ADMIN_KEY) return new Response("Forbidden", { status: 403 });
      let posts = await load();
      posts = posts.filter((p) => p.id !== (body.id || "").toString());
      await store.setJSON("posts", posts);
      return Response.json({ posts: posts.slice(0, 100) });
    }

    return new Response("Unknown action", { status: 400 });
  }

  return new Response("Method not allowed", { status: 405 });
};
