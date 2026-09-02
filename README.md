# PDF RAG Chatbot (MERN + LangChain + Pinecone + Gemini)

Upload a PDF, then ask questions about it. Retrieval-augmented generation
using LangChain.js, Google Gemini for embeddings/chat, and Pinecone as the
vector store.

## Structure

```
pdf-rag-chatbot/
├── server/     Express API (upload + chat routes, RAG pipeline)
└── client/     React (Vite) frontend
```

## 1. Set up Pinecone

Create an index in the Pinecone console:
- Dimensions: **768** (must match the Gemini embedding model's output size —
  check the current dimension for whichever `GEMINI_EMBEDDING_MODEL` you use)
- Metric: cosine

## 2. Configure environment variables

```bash
cd server
cp .env.example .env
```

Fill in `.env` with your real Pinecone API key, Pinecone index name, Google
API key, a MongoDB connection string, and a `JWT_SECRET` (any long random
string — e.g. `openssl rand -hex 32`). **Never commit `.env` or hardcode
keys in source — if you ever pasted a real key into code or chat, rotate it
immediately.**

MongoDB is now required (not optional) — it stores user accounts and which
documents belong to whom, which is what makes multi-user isolation work.

## 3. Install and run the server

```bash
cd server
npm install
npm run dev
```

Server runs on `http://localhost:5000`. Health check: `GET /health`.

## 4. Install and run the client

```bash
cd client
npm install
npm run dev
```

Client runs on `http://localhost:5173` and proxies `/api` requests to the
server (see `vite.config.js`).

## Auth & multi-user isolation

- `POST /api/auth/signup` / `POST /api/auth/login` — create an account or
  log in; both return a JWT. The client stores it in `localStorage` and
  sends it as `Authorization: Bearer <token>` on every request.
- `requireAuth` middleware verifies the JWT and sets `req.userId` from it —
  routes never trust a client-supplied user id.
- Every upload is saved to `server/uploads/<userId>/` and recorded in
  MongoDB's `Document` collection as `{ documentId, userId, fileName }`.
- `GET /api/documents` lists only the logged-in user's own documents.
- Before answering any question, `POST /api/chat` looks up the
  `documentId` in MongoDB and checks its `userId` matches the requester —
  if not, it returns `403`. This is what actually prevents one user from
  querying another user's PDF, even if they guess a `documentId`.
- Uploads are capped at 20 per user (`MAX_DOCS_PER_USER` in
  `routes/upload.js`) and 20MB per file.

## How it works

1. **Upload** (`POST /api/upload`, requires auth): a PDF is saved under the
   user's own folder, loaded and split into ~1000-character chunks with
   LangChain's `PDFLoader` + `RecursiveCharacterTextSplitter`, embedded with
   Gemini, and upserted into Pinecone. Each chunk is tagged with
   `documentId` and `userId` metadata.
2. **Chat** (`POST /api/chat`, requires auth + ownership check): the
   question is embedded, Pinecone is searched (filtered by `documentId`)
   for the top-k most similar chunks, and those chunks are stuffed into a
   prompt sent to Gemini for the final answer.

## Next steps to consider

- **Chat history**: persist conversations in MongoDB, keyed by `documentId`
  + `userId`, and feed recent turns back into the prompt for follow-ups.
- **Streaming**: swap `chatModel.invoke()` for a streaming call and use
  Server-Sent Events or a WebSocket so answers appear token-by-token.
- **Multi-document chat**: drop the `documentId` filter (or allow an array
  of ids) to let users query across everything they've uploaded.
- **Delete/cleanup**: add a route to delete a document's vectors from
  Pinecone (by metadata filter) and its file/record when a user removes it.
- **Refresh tokens**: the current JWT is long-lived (`JWT_EXPIRES_IN`); for
  production, consider shorter-lived access tokens plus a refresh flow.
