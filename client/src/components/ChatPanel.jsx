import { useState, useRef, useEffect } from "react";
import { API_BASE } from "../../lib/api";
export default function ChatPanel({ token, documentId, fileName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleAsk(e) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, documentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      setMessages((m) => [
        ...m,
        { role: "assistant", text: data.answer, sources: data.sources },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: `⚠ ${err.message}`, error: true },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!documentId) {
    return (
      <div className="flex-1 flex items-center justify-center font-mono text-sm text-[#6B6A5E] p-6 text-center">
        <p>Upload a PDF on the left to start asking questions.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-[#DEDACB] flex flex-col gap-0.5">
        <span className="font-mono text-[11px] uppercase tracking-wide text-[#6B6A5E]">
          Now reading
        </span>
        <span className="font-serif text-lg text-[#22261F]">{fileName}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3.5 max-h-[420px]">
        {messages.length === 0 && (
          <p className="font-mono text-[13px] text-[#6B6A5E]">
            Try: &ldquo;What is this document about?&rdquo;
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={
              msg.role === "user"
                ? "max-w-[82%] self-end px-3.5 py-2.5 rounded-[3px] text-[15px] leading-relaxed bg-[#1F4B3F] text-[#F7F4EC]"
                : "max-w-[82%] self-start px-3.5 py-2.5 rounded-[3px] text-[15px] leading-relaxed bg-[#EFEADA] text-[#22261F] border-l-[3px] border-[#E2A13D]"
            }
          >
            <p className="m-0 whitespace-pre-wrap">{msg.text}</p>
            {msg.sources?.length > 0 && (
              <div className="mt-2 flex flex-col gap-1">
                {msg.sources.map((s, j) => (
                  <span
                    key={j}
                    className="font-mono text-[11px] text-[#6B6A5E] border-l-2 border-[#B9822C] pl-1.5"
                  >
                    {s.snippet}&hellip;
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="self-start flex gap-1 items-center px-3.5 py-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9822C] animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9822C] animate-pulse [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9822C] animate-pulse [animation-delay:300ms]" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleAsk}
        className="flex gap-2 px-5 py-4 border-t border-[#DEDACB]"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about the document…"
          className="flex-1 text-sm px-3 py-2.5 bg-white border border-[#D2CDBC] rounded-[3px] text-[#22261F] outline-none focus:border-[#1F4B3F] focus:ring-4 focus:ring-[#1F4B3F1F]"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="text-sm font-medium text-[#F7F4EC] bg-[#1F4B3F] rounded-[3px] px-5 disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:bg-[#17392F]"
        >
          Ask
        </button>
      </form>
    </div>
  );
}