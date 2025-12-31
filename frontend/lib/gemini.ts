import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const geminiModel = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
});

// Helper function to generate content
export async function generateContent(prompt: string): Promise<string> {
  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
}

// Helper function to generate embeddings
export async function generateEmbedding(text: string): Promise<number[]> {
  const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}
