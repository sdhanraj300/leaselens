require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Pinecone } = require('@pinecone-database/pinecone');

const PDFS_DIR = path.join(__dirname, '..', 'pdfs');
const CHUNK_SIZE = 1000; // Characters per chunk
const CHUNK_OVERLAP = 200;

// Simple text chunker
function chunkText(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
    const chunks = [];
    let start = 0;
    // Clean up excessive whitespace
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    while (start < cleanText.length) {
        const end = Math.min(start + chunkSize, cleanText.length);
        chunks.push(cleanText.slice(start, end));
        start += chunkSize - overlap;
    }
    return chunks;
}

async function run() {
    console.log("Starting PDF ingestion...");
    
    if (!process.env.GOOGLE_API_KEY || !process.env.PINECONE_API_KEY) {
        console.error("Missing API Keys (GOOGLE_API_KEY or PINECONE_API_KEY)");
        return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pinecone.index('leaselens');

    const city = "new york";
    const namespace = "new-york";
    const cityDir = path.join(PDFS_DIR, city);
    
    console.log(`\n--- Processing City: ${city} (Namespace: ${namespace}) ---`);

    const pdfFiles = fs.readdirSync(cityDir).filter(f => f.endsWith('.pdf'));
    console.log(`Found ${pdfFiles.length} PDF files in ${city}:`, pdfFiles);

    for (const file of pdfFiles) {
        console.log(`\n  --- Processing File: ${file} ---`);
        const filePath = path.join(cityDir, file);
        const dataBuffer = fs.readFileSync(filePath);
        
        try {
            const data = await pdfParse(dataBuffer);
            console.log(`    - Extracted ${data.numpages} pages, ${data.text.length} characters`);
            
            const chunks = chunkText(data.text);
            console.log(`    - Created ${chunks.length} chunks`);
            
            const EMBED_BATCH_SIZE = 10; 
            for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
                const batchChunks = chunks.slice(i, i + EMBED_BATCH_SIZE);
                console.log(`    - Embedding batch ${Math.floor(i/EMBED_BATCH_SIZE) + 1}/${Math.ceil(chunks.length/EMBED_BATCH_SIZE)}...`);
                
                try {
                    const result = await model.batchEmbedContents({
                        requests: batchChunks.map((text) => ({
                            content: { role: "user", parts: [{ text }] },
                        })),
                    });

                    const batchEmbeddings = result.embeddings;
                    console.log(`    - Received ${batchEmbeddings.length} embeddings. Dimension: ${batchEmbeddings[0]?.values?.length}`);
                    
                    if (!batchEmbeddings[0]?.values || batchEmbeddings[0].values.length === 0) {
                        throw new Error("Embedding failed - returned 0 dimension");
                    }

                    const vectors = batchEmbeddings.map((emb, idx) => {
                        const chunkIdx = i + idx;
                        return {
                            id: `${file.replace('.pdf', '').replace(/[^a-zA-Z0-9]/g, '_')}-chunk-${chunkIdx}`,
                            values: emb.values,
                            metadata: { 
                                text: batchChunks[idx],
                                source: file,
                                city: city
                            }
                        };
                    });

                    await index.namespace(namespace).upsert(vectors);
                    process.stdout.write(`    - Upserted ${vectors.length} chunks\n`);
                    
                    // Small delay between batches to stay under 15 RPM
                    await new Promise(resolve => setTimeout(resolve, 5000));
                } catch (e) {
                    if (e.message.includes('429')) {
                        console.log(`\n    Rate limited. Waiting 60 seconds...`);
                        await new Promise(resolve => setTimeout(resolve, 60000));
                        i -= EMBED_BATCH_SIZE; // Retry this batch
                    } else {
                        console.error(`\n    Error embedding batch:`, e.message);
                        throw e; // Stop if it's a fatal error
                    }
                }
            }
            console.log(`\n    ✅ Completed: ${file}`);
        } catch (e) {
            console.error(`    - Fatal Error processing ${file}:`, e.message);
        }
    }
    console.log(`\n✅ Ingestion complete for ${city}!`);
}

run();
