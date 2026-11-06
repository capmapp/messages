import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import request from "supertest";
import { createApp } from "./app.js";
import type { Message } from "../shared/message.js";

test("devuelve los mensajes del JSON original", async () => {
  const expected = JSON.parse(await readFile("data/messages.json", "utf8"));
  const response = await request(createApp()).get("/api/messages").expect(200);
  assert.deepEqual(response.body, expected);
});

test("devuelve un mensaje existente y excluye el actual", async () => {
  const app = createApp();
  const all = await request(app).get("/api/messages").expect(200);
  const response = await request(app)
    .get("/api/messages/random?exclude=1")
    .expect(200);
  assert.notEqual(response.body.id, 1);
  assert.ok(
    all.body.messages.some(
      (message: Message) =>
        message.id === response.body.id &&
        message.message === response.body.message,
    ),
  );
  assert.equal(response.headers["cache-control"], "no-store");
});

test("controla archivos invalidos, vacios y ausentes; admite un solo mensaje", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "messages-"));
  const file = path.join(directory, "messages.json");
  try {
    for (const content of [
      "not json",
      '{"messages":[]}',
      '{"messages":[{"id":1}]}',
    ]) {
      await writeFile(file, content);
      const response = await request(createApp(file))
        .get("/api/messages/random")
        .expect(500);
      assert.equal(typeof response.body.error, "string");
    }
    const single = { id: 1, message: "Gracias, papa." };
    await writeFile(file, JSON.stringify({ messages: [single] }));
    const response = await request(createApp(file))
      .get("/api/messages/random?exclude=1")
      .expect(200);
    assert.deepEqual(response.body, single);
    await rm(file);
    await request(createApp(file)).get("/api/messages").expect(500);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("responde 404 en rutas API desconocidas", async () => {
  await request(createApp()).get("/api/unknown").expect(404);
});
