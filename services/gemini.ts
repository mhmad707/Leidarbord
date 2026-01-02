
import { GoogleGenAI, Type } from "@google/genai";
import { SheetRow, GeminiAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const analyzeSheetData = async (data: SheetRow[]): Promise<GeminiAnalysis> => {
  const sampleData = data.slice(0, 10);
  const headers = Object.keys(data[0] || {});
  
  // Specific requested mapping
  const nameColHeader = headers[2] || "Name";
  const rankColHeader = headers[3] || "Rank";

  const prompt = `
    Analyze this spreadsheet data for a leaderboard.
    
    STRICT REQUIREMENTS FROM USER:
    1. The Name column is Column C (the 3rd column): "${nameColHeader}". This column contains names in ARABIC.
    2. The Ranking/Score column is Column D (the 4th column): "${rankColHeader}".
    
    Data Sample: ${JSON.stringify(sampleData)}
    
    Tasks:
    1. Identify the 'nameColumn' as "${nameColHeader}".
    2. Use "${rankColHeader}" as the mandatory 'scoreColumn' for all rankings.
    3. Provide a professional summary in English that acknowledges the Arabic names and their standings based on the "${rankColHeader}" column.
    4. Identify the top performers using their Arabic names from "${nameColHeader}".
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          topPerformers: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          trends: { type: Type.STRING },
          config: {
            type: Type.OBJECT,
            properties: {
              nameColumn: { type: Type.STRING },
              scoreColumn: { type: Type.STRING },
              groupColumn: { type: Type.STRING }
            },
            required: ["nameColumn", "scoreColumn"]
          }
        },
        required: ["summary", "topPerformers", "trends", "config"]
      }
    }
  });

  const result = JSON.parse(response.text);
  // Guarantee the columns are locked to user requirements
  result.config.nameColumn = nameColHeader;
  result.config.scoreColumn = rankColHeader;
  return result;
};
