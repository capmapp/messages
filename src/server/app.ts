import express from "express";
import { readFile } from "node:fs/promises";
import { randomInt } from "node:crypto";
import path from "node:path";
import { z } from "zod";

const messagesSchema = z.object({
  messages: z
    .array(
      z.object({
        id: z.number().int().positive(),
        message: z.string().trim().min(1),
      }),
    )
    .min(1),
});

export function createApp(messagesPath = path.resolve("data/messages.json")) {
  const app = express();
  app.disable("x-powered-by");

  async function readMessages() {
    const content = await readFile(messagesPath, "utf8");
    return messagesSchema.parse(JSON.parse(content)).messages;
  }

  app.get("/api/messages", async (_request, response) => {
    try {
      response
        .set("Cache-Control", "no-store")
        .json({ messages: await readMessages() });
    } catch (error) {
      console.error("No se pudieron leer los mensajes:", error);
      response.status(500).json({ error: "No se pudieron leer los mensajes." });
    }
  });

  app.get("/api/messages/random", async (request, response) => {
    try {
      const messages = await readMessages();
      const excludedId = Number(request.query.exclude);
      const alternatives = messages.filter(
        (message) => message.id !== excludedId,
      );
      const candidates = alternatives.length > 0 ? alternatives : messages;
      response
        .set("Cache-Control", "no-store")
        .json(candidates[randomInt(candidates.length)]);
    } catch (error) {
      console.error("No se pudo obtener un mensaje:", error);
      response
        .status(500)
        .json({ error: "No se pudo obtener un mensaje. Intenta de nuevo." });
    }
  });

  app.use("/api", (_request, response) => {
    response.status(404).json({ error: "Ruta no encontrada." });
  });

  return app;
}
