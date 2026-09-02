import { useRef, useState } from "react";
import { API_BASE } from "../../lib/api";

export default function UploadPanel({ token, onIngested }) {
  const inputRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | uploading | done | error
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file) {
    if (!file || file.type !== "application/pdf") {
      setError("Please choose a PDF file.");
      setStatus("error");
      return;
    }

    setFileName(file.name);
    setStatus("uploading");
    setError("");

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed.");

      setStatus("done");
      onIngested({ documentId: data.documentId, fileName: data.fileName });
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  return (
    <div
      className={`relative flex-1 m-5 border-[1.5px] border-dashed rounded-[3px] flex flex-col items-center justify-center text-center p-6 cursor-pointer transition-colors ${
        dragOver
          ? "border-[#E2A13D] bg-[#E2A13D14]"
          : "border-[#C9BD9E] hover:border-[#E2A13D] hover:bg-[#E2A13D14]"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files?.[0]);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <div
        className="absolute top-0 right-0 w-7 h-7 rounded-bl-sm bg-[linear-gradient(135deg,transparent_50%,#E6DDC7_50%)] shadow-[-2px_2px_4px_rgba(0,0,0,0.08)]"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {status === "idle" && (
        <>
          <p className="font-serif text-xl text-[#232323] m-0 mb-1.5">Drop a PDF here</p>
          <p className="font-mono text-sm text-[#6B6A5E] m-0">
            or click to browse — one document at a time
          </p>
        </>
      )}
      {status === "uploading" && (
        <p className="font-serif text-xl text-[#232323] m-0 mb-1.5">
          Reading &ldquo;{fileName}&rdquo;&hellip;
        </p>
      )}
      {status === "done" && (
        <>
          <p className="font-serif text-xl text-[#232323] m-0 mb-1.5">
            &ldquo;{fileName}&rdquo; is ready
          </p>
          <p className="font-mono text-sm text-[#6B6A5E] m-0">
            Ask anything about it on the right
          </p>
        </>
      )}
      {status === "error" && (
        <>
          <p className="font-serif text-xl text-[#A13D2A] m-0 mb-1.5">
            Couldn&rsquo;t read that file
          </p>
          <p className="font-mono text-sm text-[#6B6A5E] m-0">{error} — try again</p>
        </>
      )}
    </div>
  );
}