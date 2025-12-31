import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from '@pinecone-database/pinecone';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PDFS_DIR = path.join(__dirname, '..', 'pdfs');
const PINECONE_INDEX_NAME = 'leaselens';
const EXPECTED_DIMENSION = 768;

async function run() {
    console.log("Starting PDF ingestion...\n");
    
    if (!process.env.GOOGLE_API_KEY || !process.env.PINECONE_API_KEY) {
        console.error("Missing API Keys (GOOGLE_API_KEY or PINECONE_API_KEY)");
        return;
    }

    // Initialize Pinecone
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pinecone.index(PINECONE_INDEX_NAME);
    
    // Initialize embeddings  
    const embeddings = new GoogleGenerativeAIEmbeddings({
        model: "text-embedding-004", // Using newer model
        apiKey: process.env.GOOGLE_API_KEY
    });

    // Test embedding first
    console.log("Testing embedding...");
    try {
        const testEmbed = await embeddings.embedQuery("test");
        console.log(`Embedding dimension: ${testEmbed.length}`);
        if (testEmbed.length !== EXPECTED_DIMENSION) {
            console.error(`ERROR: Expected ${EXPECTED_DIMENSION} dimensions, got ${testEmbed.length}`);
            return;
        }
    } catch (e) {
        console.error("Embedding test failed:", e.message);
        return;
    }

    // Get all PDF files
    const pdfFiles = fs.readdirSync(PDFS_DIR).filter(f => f.endsWith('.pdf'));
    console.log(`\nFound ${pdfFiles.length} PDF files:`, pdfFiles);

    if (pdfFiles.length === 0) {
        console.error("No PDF files found in ./pdfs directory");
        return;
    }

    const allDocs = [];

    // Load and process each PDF
    for (const file of pdfFiles) {
        console.log(`\nProcessing: ${file}`);
        const filePath = path.join(PDFS_DIR, file);
        
        try {
            const loader = new PDFLoader(filePath);
            const docs = await loader.load();
            console.log(`  - Loaded ${docs.length} pages`);
            
            docs.forEach(doc => {
                doc.metadata.source = file;
            });
            
            allDocs.push(...docs);
        } catch (e) {
            console.error(`  - Error loading ${file}:`, e.message);
        }
    }

    console.log(`\nTotal pages loaded: ${allDocs.length}`);

    // Split documents into chunks
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    const splitDocs = await splitter.splitDocuments(allDocs);
    console.log(`Split into ${splitDocs.length} chunks`);

    // Embed and upsert in batches
    console.log("\nEmbedding and indexing in Pinecone...");
    const BATCH_SIZE = 50;
    let vectorsUpserted = 0;
    
    for (let i = 0; i < splitDocs.length; i += BATCH_SIZE) {
        const batch = splitDocs.slice(i, i + BATCH_SIZE);
        const vectors = [];
        
        console.log(`\nBatch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(splitDocs.length/BATCH_SIZE)}...`);
        
        for (let j = 0; j < batch.length; j++) {
            const doc = batch[j];
            try {
                const embedding = await embeddings.embedQuery(doc.pageContent);
                
                if (embedding.length !== EXPECTED_DIMENSION) {
                    console.error(`Wrong dimension for chunk ${i+j}: ${embedding.length}`);
                    continue;
                }
                
                vectors.push({
                    id: `law_chunk_${i + j}`,
                    values: embedding,
                    metadata: { 
                        text: doc.pageContent.substring(0, 1000), // Truncate for metadata limit
                        source: doc.metadata.source
                    }
                });
                process.stdout.write(".");
            } catch (e) {
                console.error(`\nError embedding chunk ${i+j}:`, e.message);
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

    console.log(`\n✅ Ingestion complete! Total vectors: ${vectorsUpserted}`);
}

run();
