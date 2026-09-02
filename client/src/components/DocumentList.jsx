import { useEffect, useState } from "react";
import { API_BASE } from "../../lib/api.js";

export default function DocumentList({ activeDocId, onSelect, refreshKey }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/documents`, {
          credentials: "include", // sends the httpOnly auth cookie
        });
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) {
          setDocs(data.documents);
        } else {
          setError(data.error || "Couldn't load your documents.");
        }
      } catch {
        // fetch() throws (not a rejected .json()) when the request never
        // reached the server at all — backend down, wrong API_BASE, or CORS.
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
        <li key={doc.documentId}>
          <button
            className={`doc-list__item ${doc.documentId === activeDocId ? "doc-list__item--active" : ""}`}
            onClick={() => onSelect(doc)}
          >
            {doc.fileName}
          </button>
        </li>
      ))}
    </ul>
  );
}