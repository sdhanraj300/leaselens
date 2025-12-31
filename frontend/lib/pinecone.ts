import { Pinecone } from '@pinecone-database/pinecone';

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

// We'll export the index name constant for consistency but let the caller initialize the specific index
export const PINECONE_INDEX_NAME = 'leaselens';
