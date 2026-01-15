const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());


const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME || "brilliant";
const COLLECTION = process.env.COLLECTION || "tasks";

if (!MONGO_URL) {
  console.error("Brak MONGO_URL w zmiennych środowiskowych!");
  process.exit(1);
}

let client;
let collection;

async function connectMongo() {
  client = new MongoClient(MONGO_URL);
  await client.connect();
  const db = client.db(DB_NAME);
  collection = db.collection(COLLECTION);
  console.log("Połączono z MongoDB:", DB_NAME, COLLECTION);
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "brilliant-api" });
});

// GET /api/tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await collection.find({}).sort({ createdAt: -1 }).toArray();
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ error: "Błąd odczytu tasks", details: String(e) });
  }
});

// POST /api/tasks
app.post("/api/tasks", async (req, res) => {
  try {
    const title = (req.body.title || "").trim();
    if (!title) return res.status(400).json({ error: "title wymagany" });

    const doc = { title, done: false, createdAt: new Date() };
    const result = await collection.insertOne(doc);
    res.status(201).json({ _id: result.insertedId, ...doc });
  } catch (e) {
    res.status(500).json({ error: "Błąd dodania task", details: String(e) });
  }
});

// PATCH /api/tasks/:id
app.patch("/api/tasks/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const update = {};
    if (typeof req.body.done === "boolean") update.done = req.body.done;
    if (typeof req.body.title === "string") update.title = req.body.title.trim();

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" }
    );

    if (!result.value) return res.status(404).json({ error: "Nie znaleziono" });
    res.json(result.value);
  } catch (e) {
    res.status(500).json({ error: "Błąd aktualizacji task", details: String(e) });
  }
});

// DELETE /api/tasks/:id
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Nie znaleziono" });
    res.json({ deleted: true });
  } catch (e) {
    res.status(500).json({ error: "Błąd usuwania task", details: String(e) });
  }
});

connectMongo()
  .then(() => {
    app.listen(PORT, () => console.log(`API działa na porcie ${PORT}`));
  })
  .catch((e) => {
    console.error("Nie udało się połączyć z MongoDB:", e);
    process.exit(1);
  });


process.on("SIGINT", async () => {
  try { await client?.close(); } catch {}
  process.exit(0);
});
