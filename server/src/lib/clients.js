import { Pinecone } from "@pinecone-database/pinecone";
import {
  GoogleGenerativeAIEmbeddings,
  ChatGoogleGenerativeAI,
} from "@langchain/google-genai";
import "dotenv/config";

// --- Pinecone client (singleton) ---
const pineconeClient = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

export const pineconeIndex = pineconeClient.Index(process.env.PINECONE_INDEX);

// --- Embeddings model (must be the SAME model for ingestion and querying) ---
export const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  model: process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001",
});

// --- Chat model used to generate the final answer ---
export const chatModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: process.env.GEMINI_CHAT_MODEL || "gemini-2.5-flash",
  temperature: 0.2,
});
