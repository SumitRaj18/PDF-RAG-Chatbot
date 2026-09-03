import { useEffect, useState } from "react";
import { API_BASE } from "../../lib/api.js";
import axios from "axios";

export default function DocumentList({ activeDocId, onSelect, refreshKey, onDeleted }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  async function handleDelete(e, doc) {
    e.stopPropagation(); // prevent the parent select-button click from firing too

    if (!window.confirm(`Delete "${doc.fileName}"? This can't be undone.`)) {
      return;
    }

    setDeletingId(doc.documentId);
    try {
      await axios.delete(`${API_BASE}/api/documents/${doc.documentId}`, {
        withCredentials: true,
      });
      setDocs((prev) => prev.filter((d) => d.documentId !== doc.documentId));
      if (doc.documentId === activeDocId) {
        onDeleted?.(); // let the parent know to clear the open chat, if this was the active doc
      }
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Couldn't delete that document — try again.");
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/documents`, {
          credentials: "include",
        });
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) {
          setDocs(data.documents);
        } else {
          setError(data.error || "Couldn't load your documents.");
        }
      } catch {
        if (!cancelled) {
          setError("Couldn't reach the server — is it running?");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (loading) return <p className="doc-list__hint">Loading your documents…</p>;
  if (error) return <p className="doc-list__hint doc-list__hint--error">{error}</p>;
  if (docs.length === 0) return <p className="doc-list__hint">No documents yet — upload one above.</p>;

  return (
    <ul className="doc-list">
      {docs.map((doc) => (
        <li key={doc.documentId} className="flex items-center gap-2">
          <button
            className={`doc-list__item flex-1 ${doc.documentId === activeDocId ? "doc-list__item--active" : ""}`}
            onClick={() => onSelect(doc)}
          >
            {doc.fileName}
          </button>
          <button
            onClick={(e) => handleDelete(e, doc)}
            disabled={deletingId === doc.documentId}
            aria-label={`Delete ${doc.fileName}`}
            className="text-xs text-[#A13D2A] px-2 py-1 disabled:opacity-40"
          >
            {deletingId === doc.documentId ? "…" : "Delete"}
          </button>
        </li>
      ))}
    </ul>
  );
}