import express from "express";
import path from "node:path";
import { createApp } from "./app.js";

const app = createApp();
const clientPath = path.resolve("dist/client");
const port = Number(process.env.PORT ?? 3001);

app.use(express.static(clientPath));
app.get("/{*path}", (_request, response) => {
  response.sendFile(path.join(clientPath, "index.html"));
});

app.listen(port, "127.0.0.1", () => {
  console.log(`API y aplicacion: http://127.0.0.1:${port}`);
});
