import { PineconeStore } from "@langchain/pinecone";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { pineconeIndex, embeddings, chatModel } from "./clients.js";

/**
 * Load a PDF from disk, split it into chunks, embed, and upsert into Pinecone.
 * Every chunk is tagged with documentId (and optionally userId) as metadata
 * so retrieval can be scoped to just this document/user later.
 */
export async function ingestPdf({ filePath, documentId, userId }) {
  const loader = new PDFLoader(filePath, { splitPages: false });
  const rawDocs = await loader.load();

  if (rawDocs.length === 0) {
    throw new Error("No content could be extracted from the PDF.");
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const splitDocs = await splitter.splitDocuments(rawDocs);

  // Attach metadata so we can filter retrieval per document/user
  const taggedDocs = splitDocs.map((doc) => ({
    ...doc,
    metadata: {
      ...doc.metadata,
      documentId,
      userId: userId || "anonymous",
    },
  }));

  await PineconeStore.fromDocuments(taggedDocs, embeddings, {
    pineconeIndex,
  });

  return { chunks: taggedDocs.length };
}

/**
 * Answer a question using only chunks belonging to the given documentId.
 */
export async function answerQuestion({ question, documentId, userId, k = 4 }) {
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
  });

  const filter = documentId ? { documentId } : undefined;

  const retriever = vectorStore.asRetriever({ k, filter });
  const relevantDocs = await retriever.invoke(question);

  if (!relevantDocs || relevantDocs.length === 0) {
    return {
      answer: "I couldn't find that information in the document.",
      sources: [],
    };
  }

  const context = relevantDocs
    .map((doc) => doc.pageContent)
    .join("\n\n---\n\n");

  const prompt = `You are a helpful assistant. Answer the user's question accurately using ONLY the provided context. If the answer is not contained in the context, say "I couldn't find that information in the document."

Context:
${context}

Question:
${question}

Answer:`;

  const response = await chatModel.invoke(prompt);

  return {
    answer: response.content,
    sources: relevantDocs.map((doc) => ({
      snippet: doc.pageContent.slice(0, 200),
      page: doc.metadata?.loc?.pageNumber ?? null,
    })),
  };
}
