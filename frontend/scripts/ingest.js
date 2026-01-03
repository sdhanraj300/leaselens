require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { Pinecone } = require('@pinecone-database/pinecone');

const PDFS_DIR = path.join(__dirname, '..', '..', 'pdfs');
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

    const embeddings = new GoogleGenerativeAIEmbeddings({
        modelName: "embedding-001",
        apiKey: process.env.GOOGLE_API_KEY
    });
    
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

    // Get all subdirectories in the pdfs directory
    const cities = fs.readdirSync(PDFS_DIR).filter(f => fs.statSync(path.join(PDFS_DIR, f)).isDirectory());
    console.log(`Found ${cities.length} city directories:`, cities);

    for (const city of cities) {
        const cityDir = path.join(PDFS_DIR, city);
        const indexName = city.toLowerCase().replace(/\s+/g, '-');
        console.log(`\n--- Processing City: ${city} (Index: ${indexName}) ---`);

        // Check/Create Index
        try {
            const indexes = await pinecone.listIndexes();
            const exists = indexes.indexes.some(idx => idx.name === indexName);
            
            if (!exists) {
                console.log(`Creating index ${indexName}...`);
                await pinecone.createIndex({
                    name: indexName,
                    dimension: 768, // Google embedding-001 dimension
                    metric: 'cosine',
                    spec: { 
                        serverless: { 
                            cloud: 'aws', 
                            region: 'us-east-1' 
                        } 
                    }
                });
                console.log(`Waiting for index ${indexName} to be ready...`);
                // Wait for a bit for the index to initialize
                await new Promise(resolve => setTimeout(resolve, 60000));
            }
        } catch (e) {
            console.error(`Error checking/creating index ${indexName}:`, e.message);
            // Continue anyway, maybe it exists or we can't create it
        }

        const index = pinecone.index(indexName);

        // Get all PDF files from the city directory
        const pdfFiles = fs.readdirSync(cityDir).filter(f => f.endsWith('.pdf'));
        console.log(`Found ${pdfFiles.length} PDF files in ${city}:`, pdfFiles);

        if (pdfFiles.length === 0) {
            console.log(`No PDF files found in ${cityDir}, skipping...`);
            continue;
        }

        const allChunks = [];
        
        // Extract text from each PDF
        for (const file of pdfFiles) {
            console.log(`  Processing: ${file}`);
            const filePath = path.join(cityDir, file);
            const dataBuffer = fs.readFileSync(filePath);
            
            try {
                const data = await pdfParse(dataBuffer);
                console.log(`    - Extracted ${data.numpages} pages, ${data.text.length} characters`);
                
                const chunks = chunkText(data.text);
                console.log(`    - Created ${chunks.length} chunks`);
                
                chunks.forEach((chunk, i) => {
                    allChunks.push({
                        id: `${file.replace('.pdf', '').replace(/[^a-zA-Z0-9]/g, '_')}-chunk-${i}`,
                        text: chunk,
                        source: file
                    });
                });
            } catch (e) {
                console.error(`    - Error processing ${file}:`, e.message);
            }
        }

        console.log(`  Total chunks to embed for ${city}: ${allChunks.length}`);
        
        // Embed and upsert in batches
        const BATCH_SIZE = 50;
        let vectorsUpserted = 0;
        
        for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
            const batch = allChunks.slice(i, i + BATCH_SIZE);
            const vectors = [];
            
            console.log(`  Embedding batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(allChunks.length/BATCH_SIZE)}...`);
            
            for (const chunk of batch) {
                try {
                    const embedding = await embeddings.embedQuery(chunk.text);
                    vectors.push({
                        id: chunk.id,
                        values: embedding,
                        metadata: { 
                            text: chunk.text,
                            source: chunk.source,
                            city: city
                        }
                    });
                    process.stdout.write(".");
                } catch (e) {
                    console.error(`\nError embedding ${chunk.id}:`, e.message);
                }
            }
            
            if (vectors.length > 0) {
                try {
                    await index.upsert(vectors);
                    vectorsUpserted += vectors.length;
                    console.log(` Upserted ${vectors.length} vectors`);
                } catch (e) {
                    console.error(`\nPinecone Upsert Error:`, e.message);
                }
            }
        }
        console.log(`\n✅ Ingestion complete for ${city}! Total vectors: ${vectorsUpserted}`);
    }
}

run();
