import { getStore } from "@netlify/blobs";

// Secret that controls who can publish the tree. Must match ADMIN_KEY in index.html.
const ADMIN_KEY = "corbin2026";

// Seeded once. After that the tree is fully editable and persists in Blobs.
const SEED = [
  { id: "bev", name: "Beverly Opal Walsh", spouse: "Jim Corbin", parent: null, deceased: true },

  // Beverly & Jim's seven children (branch heads)
  { id: "pam", name: "Pam Rouse", spouse: "Rick Rouse", parent: "bev", deceased: false },
  { id: "webb", name: "Webb Corbin", spouse: "", parent: "bev", deceased: false },
  { id: "jimc", name: "Jim Corbin", spouse: "Susie Corbin", parent: "bev", deceased: false },
  { id: "cyn", name: "Cynthia Goldner", spouse: "Allan Goldner", parent: "bev", deceased: false },
  { id: "wanda", name: "Wanda Corbin", spouse: "", parent: "bev", deceased: false },
  { id: "ruth", name: "Ruth Scott", spouse: "", parent: "bev", deceased: false },
  { id: "reb", name: "Rebekah Crofford", spouse: "Chad Crofford", parent: "bev", deceased: false },
  { id: "dave", name: "Dave Corbin", spouse: "Karen Corbin", parent: "bev", deceased: false },

  // Pam's branch
  { id: "mark", name: "Mark Rouse", spouse: "", parent: "pam", deceased: false },
  { id: "rebecca", name: "Rebecca Rouse", spouse: "", parent: "pam", deceased: false },
  { id: "sarah", name: "Sarah Moley", spouse: "", parent: "pam", deceased: false },
  { id: "olivia", name: "Olivia Rouse", spouse: "", parent: "mark", deceased: false },
  { id: "kaia", name: "Kaia Rouse", spouse: "", parent: "mark", deceased: false },
  { id: "siobohn", name: "Siobohn Rouse", spouse: "", parent: "mark", deceased: false },
  { id: "camryn", name: "Camryn Moley", spouse: "", parent: "sarah", deceased: false },

  // Webb's branch
  { id: "josh", name: "Joshua Corbin", spouse: "Beth Corbin", parent: "webb", deceased: false },
  { id: "jordan", name: "Jordan Corbin", spouse: "Shelley Corbin", parent: "webb", deceased: false },
  { id: "jared", name: "Jared Corbin", spouse: "Abbey Corbin", parent: "webb", deceased: false },
  { id: "jon", name: "Jonathan Corbin", spouse: "Mixi Corbin", parent: "webb", deceased: false },
  { id: "cole", name: "Cole Corbin", spouse: "", parent: "jordan", deceased: false },
  { id: "grace", name: "Grace Corbin", spouse: "", parent: "jordan", deceased: false },
  { id: "margaux", name: "Margaux Corbin", spouse: "", parent: "jordan", deceased: false },
  { id: "jemma", name: "Jemma Corbin", spouse: "", parent: "jordan", deceased: false },
  { id: "jaredbaby1", name: "Baby Corbin", spouse: "", parent: "jared", deceased: false },
  { id: "jaredbaby2", name: "Baby Corbin", spouse: "", parent: "jared", deceased: false },
  { id: "ynez", name: "Ynez Corbin", spouse: "", parent: "jon", deceased: false },

  // Jim & Susie's branch
  { id: "taylor", name: "Taylor Johnson", spouse: "Jake Johnson", parent: "jimc", deceased: false },
  { id: "erikson", name: "Erikson Corbin", spouse: "Anna Corbin", parent: "jimc", deceased: false },
  { id: "johnsonbaby", name: "Baby Johnson", spouse: "", parent: "taylor", deceased: false },
  { id: "benjamin", name: "Benjamin Corbin", spouse: "", parent: "erikson", deceased: false },
  { id: "madison", name: "Madison Corbin", spouse: "", parent: "erikson", deceased: false },

  // Cynthia's branch
  { id: "theresa", name: "Theresa Ludwigsen", spouse: "Michael Ludwigsen", parent: "cyn", deceased: false },
  { id: "tina", name: "Tina Anwar", spouse: "", parent: "cyn", deceased: false },
  { id: "martino", name: "Lilianna Martino", spouse: "Timmy Martino", parent: "cyn", deceased: false },
  { id: "tonya", name: "Tonya Wyss", spouse: "James Wyss", parent: "cyn", deceased: false },
  { id: "tristan", name: "Tristan Ludwigsen", spouse: "", parent: "theresa", deceased: false },
  { id: "madelyn", name: "Madelyn Ludwigsen", spouse: "", parent: "theresa", deceased: false },
  { id: "grayson", name: "Grayson Ludwigsen", spouse: "", parent: "theresa", deceased: false },
  { id: "arianna", name: "Arianna Anwar", spouse: "", parent: "tina", deceased: false },
  { id: "emma", name: "Emma Wyss", spouse: "", parent: "tonya", deceased: false },
  { id: "jackson", name: "Jackson Wyss", spouse: "", parent: "tonya", deceased: false },

  // Wanda's branch
  { id: "jessica", name: "Jessica Netro", spouse: "Greg Netro", parent: "wanda", deceased: false },
  { id: "melissa", name: "Melissa Lalley", spouse: "Jim Lalley", parent: "wanda", deceased: false },
  { id: "brady", name: "Matthew Brady", spouse: "Alexandra Brady", parent: "wanda", deceased: false },
  { id: "max", name: "Max Netro", spouse: "", parent: "jessica", deceased: false },
  { id: "addyson", name: "Addyson Brady", spouse: "", parent: "brady", deceased: false },
  { id: "audriana", name: "Audriana Lalley", spouse: "", parent: "melissa", deceased: false },
  { id: "gabriela", name: "Gabriela Lalley", spouse: "", parent: "melissa", deceased: false },
  { id: "dominic", name: "Dominic Lalley", spouse: "", parent: "melissa", deceased: false },
  { id: "lalleybaby", name: "Baby Lalley", spouse: "", parent: "melissa", deceased: false },

  // Ruth's branch
  { id: "caleb", name: "Caleb Martel", spouse: "Emily Martel", parent: "ruth", deceased: false },

  // Rebekah's branch
  { id: "mikayla", name: "Mikayla Glover", spouse: "Drew Glover", parent: "reb", deceased: false },
  { id: "jeremiah", name: "Jeremiah Crofford", spouse: "", parent: "reb", deceased: false },
  { id: "isabel", name: "Isabel Crofford", spouse: "", parent: "reb", deceased: false },

  // Dave's branch (not attending, but part of the family)
  { id: "quinn", name: "Quinn Corbin", spouse: "", parent: "dave", deceased: false },
  { id: "zach", name: "Zach Corbin", spouse: "", parent: "dave", deceased: false },
  { id: "haley", name: "Haley Corbin", spouse: "", parent: "dave", deceased: false },
];

function makeId() {
  return "n" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export default async (req) => {
  const store = getStore("reunion-tree");

  async function load() {
    let people = await store.get("people", { type: "json" });
    if (!people) {
      people = SEED;
      await store.setJSON("people", people);
    }
    return people;
  }
  async function getMeta() {
    return (await store.get("meta", { type: "json" })) || { live: false };
  }

  if (req.method === "GET") {
    const people = await load();
    const meta = await getMeta();
    return Response.json({ people, live: !!meta.live });
  }

  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response("Bad request", { status: 400 });
    }
    let people = await load();
    const byId = (id) => people.find((p) => p.id === id);

    if (body.action === "add") {
      const name = (body.name || "").toString().trim().slice(0, 40);
      if (!name) return new Response("Name required", { status: 400 });
      const parent = body.parent ? body.parent.toString() : null;
      if (parent && !byId(parent)) return new Response("Bad parent", { status: 400 });
      const person = {
        id: makeId(), name,
        spouse: (body.spouse || "").toString().trim().slice(0, 40),
        parent, deceased: !!body.deceased,
      };
      people.push(person);
      await store.setJSON("people", people);
      return Response.json({ ok: true, people });
    }

    if (body.action === "update") {
      const p = byId((body.id || "").toString());
      if (!p) return new Response("Not found", { status: 404 });
      if (typeof body.name === "string" && body.name.trim()) p.name = body.name.trim().slice(0, 40);
      if (typeof body.spouse === "string") p.spouse = body.spouse.trim().slice(0, 40);
      if (typeof body.deceased === "boolean") p.deceased = body.deceased;
      await store.setJSON("people", people);
      return Response.json({ ok: true, people });
    }

    if (body.action === "move") {
      const id = (body.id || "").toString();
      const np = body.parent ? body.parent.toString() : null;
      const p = byId(id);
      if (!p) return new Response("Not found", { status: 404 });
      if (np === id) return new Response("Invalid move", { status: 400 });
      if (np) {
        if (!byId(np)) return new Response("Bad parent", { status: 400 });
        // No cycles: np must not be a descendant of id
        let cur = byId(np), guard = 0;
        while (cur && guard++ < 2000) {
          if (cur.id === id) return new Response("Invalid move", { status: 400 });
          cur = cur.parent ? byId(cur.parent) : null;
        }
      }
      p.parent = np;
      await store.setJSON("people", people);
      return Response.json({ ok: true, people });
    }

    if (body.action === "delete") {
      const id = (body.id || "").toString();
      const p = byId(id);
      if (!p) return new Response("Not found", { status: 404 });
      people.forEach((x) => { if (x.parent === id) x.parent = p.parent; }); // kids move up
      people = people.filter((x) => x.id !== id);
      await store.setJSON("people", people);
      return Response.json({ ok: true, people });
    }

    if (body.action === "setlive") {
      if (body.key !== ADMIN_KEY) return new Response("Forbidden", { status: 403 });
      const meta = await getMeta();
      meta.live = !!body.live;
      await store.setJSON("meta", meta);
      return Response.json({ ok: true, live: meta.live, people });
    }

    return new Response("Unknown action", { status: 400 });
  }

  return new Response("Method not allowed", { status: 405 });
};
