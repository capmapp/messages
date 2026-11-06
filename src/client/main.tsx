import { StrictMode, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  Check,
  Copy,
  Heart,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import type { Message } from "../shared/message";
import "./styles.css";

function App() {
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const activeRequest = useRef<AbortController | null>(null);

  async function loadMessage(excludedId?: number) {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setLoading(true);
    setError("");
    setCopyStatus("");
    try {
      const query = excludedId === undefined ? "" : `?exclude=${excludedId}`;
      const response = await fetch(`/api/messages/random${query}`, {
        signal: controller.signal,
      });
      if (!response.ok)
        throw new Error("No se pudo cargar el mensaje. Intenta de nuevo.");
      const data: unknown = await response.json();
      if (
        typeof data !== "object" ||
        data === null ||
        !("id" in data) ||
        !("message" in data) ||
        typeof data.id !== "number" ||
        typeof data.message !== "string"
      ) {
        throw new Error("La respuesta del servidor no es válida.");
      }
      setMessage({ id: data.id, message: data.message });
    } catch (cause) {
      if (!controller.signal.aborted) {
        setError(
          cause instanceof Error
            ? cause.message
            : "No se pudo conectar con el servidor.",
        );
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  useEffect(() => {
    void loadMessage();
    return () => activeRequest.current?.abort();
  }, []);

  async function copyMessage() {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message.message);
      setCopyStatus("Mensaje copiado");
    } catch {
      setCopyStatus("No se pudo copiar el mensaje.");
    }
  }

  return (
    <div className="page">
      <header className="header">
        <a className="brand" href="/" aria-label="Para papá, inicio">
          <Heart size={21} /> Para papá<span>.</span>
        </a>
        <span className="header-note">Palabras que se quedan</span>
      </header>
      <main>
        <section className="message-section" aria-labelledby="title">
          <div className="section-label">
            <span className="small-line" /> CON TODO MI CARIÑO
          </div>
          <h1 id="title">Para papá.</h1>
          <div
            className="message-content"
            aria-live="polite"
            aria-busy={loading}
          >
            <span className="quote-mark" aria-hidden="true">
              “
            </span>
            {message ? (
              <blockquote key={message.id}>{message.message}</blockquote>
            ) : (
              <p className="placeholder">
                {loading
                  ? "Buscando unas palabras especiales..."
                  : "Tu mensaje está a un paso."}
              </p>
            )}
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="actions">
            <button
              className="primary"
              onClick={() => void loadMessage(message?.id)}
              disabled={loading}
            >
              {loading ? (
                <LoaderCircle className="spin" size={18} />
              ) : error ? (
                <RefreshCw size={18} />
              ) : (
                <ArrowRight size={18} />
              )}
              {loading ? "Cargando..." : error ? "Reintentar" : "Otro mensaje"}
            </button>
            <button
              className="copy"
              title="Copiar mensaje"
              aria-label="Copiar mensaje"
              onClick={() => void copyMessage()}
              disabled={!message || loading}
            >
              {copyStatus === "Mensaje copiado" ? (
                <Check size={20} />
              ) : (
                <Copy size={20} />
              )}
            </button>
          </div>
          <p className="copy-status" role="status">
            {copyStatus}
          </p>
        </section>
        <figure className="photo">
          <img
            src="https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?auto=format&fit=crop&w=1400&q=85"
            alt="Un papá comparte un momento al aire libre con su hijo"
          />
          <figcaption>
            Los pequeños momentos.
            <br />
            El amor de siempre.
          </figcaption>
        </figure>
      </main>
      <footer>
        <span>Un mensaje. Mucho por decir.</span>
        <Heart size={16} aria-hidden="true" />
        <span>Hecho de gratitud.</span>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
