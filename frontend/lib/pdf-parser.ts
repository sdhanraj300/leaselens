// Simple PDF text extractor using pdf-parse v1
// This version uses CommonJS to avoid Metro bundler issues

export async function parsePDF(buffer: Buffer): Promise<{ text: string; numPages: number }> {
  try {
    // Use dynamic require to avoid Metro trying to bundle at build time
    const pdfParse = require('pdf-parse');
    
    const data = await pdfParse(buffer);
    
    return {
      text: data.text || "",
      numPages: data.numpages || 0
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
}
