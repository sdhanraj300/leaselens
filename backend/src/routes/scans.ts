import { Response, Router } from 'express';
import { prisma } from '../lib/prisma';
import { pinecone, PINECONE_INDEX_NAME } from '../lib/pinecone';
import { generateContent, generateEmbedding } from '../lib/gemini';
import { AuthRequest } from '../middleware/auth';
const pdf = require('pdf-parse');

const router = Router();

// GET /api/scans - Get user's scan history
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    const scans = await prisma.scan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fileName: true,
        riskScore: true,
        pageCount: true,
        createdAt: true,
        issues: true,
      }
    });
    return res.json({ scans });
  } catch (error) {
    console.error("Scans API Error:", error);
    return res.status(500).json({ error: "Failed to fetch scans" });
  }
});

// GET /api/scans/:id - Get specific scan details
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const scan = await prisma.scan.findUnique({
      where: { 
        id,
        userId: user.id 
      }
    });

    if (!scan) {
      return res.status(404).json({ error: "Scan not found" });
    }

    return res.json({ scan });
  } catch (error) {
    console.error("Scan Detail API Error:", error);
    return res.status(500).json({ error: "Failed to fetch scan details" });
  }
});

// POST /api/scan - Primary analysis endpoint with SSE for progress tracking
router.post('/scan', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const userId = user.id;

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendStatus = (step: number, message: string) => {
      res.write(`data: ${JSON.stringify({ type: 'status', step, message })}\n\n`);
    };

    sendStatus(0, "Initiating analysis...");

    // Credit check
    let dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: { id: userId, email: user.email!, credits: 1 }
      });
    }

    if (dbUser.credits <= 0) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: "Insufficient credits. Please top up." })}\n\n`);
      return res.end();
    }

    // Receive PDF
    const { fileBase64, fileName } = req.body;
    if (!fileBase64) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: "No file provided" })}\n\n`);
      return res.end();
    }

    sendStatus(0, "Reading PDF...");
    const pureBase64 = fileBase64.replace(/^data:application\/pdf;base64,/, "");
    const pdfBuffer = Buffer.from(pureBase64, 'base64');

    // Parse PDF
    let extractedText = "";
    let pageCount = 0;
    try {
      const result = await pdf(pdfBuffer);
      extractedText = result.text;
      pageCount = result.numpages || 0;
    } catch (parseError) {
      console.error("PDF Parsing Error:", parseError);
      res.write(`data: ${JSON.stringify({ type: 'error', message: "Failed to parse PDF" })}\n\n`);
      return res.end();
    }

    const userCity = dbUser.city || "london";
    const cityName = userCity === "london" ? "London" : "New York";

    sendStatus(1, `Checking ${cityName} Laws...`);

    // Only deduct credit if parsing succeeded
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 1 } }
    });

    // RAG
    const queryEmbedding = await generateEmbedding(`illegal clauses in tenancy agreements ${cityName}`);
    const index = pinecone.index(PINECONE_INDEX_NAME);
    const queryResponse = await index.namespace(userCity === "london" ? "" : userCity).query({
      vector: queryEmbedding,
      topK: 10,
      includeMetadata: true,
    });
    const context = queryResponse.matches.map(match => match.metadata?.text).join("\n\n");

    sendStatus(2, "Analyzing Risk Factors...");

    const prompt = `You are a ${cityName} Tenancy Lawyer. Analyze this lease against the provided Context laws for ${cityName}.
    
    Context Laws:
    ${context}
    
    Lease Text (Excerpt):
    ${extractedText.substring(0, 30000)} 
    
    Instructions:
    1. Highlight "Red Flags" (illegal or unfair clauses).
    2. Suggest Advice.
    3. Calculate a Risk Score (0-100, where 100 is extremely risky).
    
    Output JSON ONLY with this structure:
    { 
      "riskScore": number, 
      "issues": [
        { "title": string, "severity": "high" | "medium" | "low", "lawViolated": string, "description": string }
      ] 
    }
    `;

    const content = await generateContent(prompt);
    
    sendStatus(3, "Generating Report...");
    
    const cleanContent = content.replace(/```json|```/g, '').trim();
    const analysis = JSON.parse(cleanContent);

    const scan = await prisma.scan.create({
      data: {
        userId: userId,
        fileName: fileName || "Unknown.pdf",
        extractedText: extractedText.substring(0, 30000),
        pageCount: pageCount,
        riskScore: analysis.riskScore || 0,
        issues: analysis.issues || [],
      }
    });

    // Final result
    res.write(`data: ${JSON.stringify({ 
      type: 'result', 
      data: {
        scanId: scan.id,
        ...analysis
      } 
    })}\n\n`);
    res.end();

  } catch (error) {
    console.error("API Error:", error);
    res.write(`data: ${JSON.stringify({ 
      type: 'error', 
      message: "Analysis failed", 
      details: error instanceof Error ? error.message : String(error) 
    })}\n\n`);
    res.end();
  }
});

export default router;
