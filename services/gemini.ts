
import { GoogleGenAI, Type } from "@google/genai";
import { SheetRow, GeminiAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const analyzeSheetData = async (data: SheetRow[]): Promise<GeminiAnalysis> => {
  const sampleData = data.slice(0, 10);
  const headers = Object.keys(data[0] || {});
  
  // Specific requested mapping for columns C, D, and E
  const nameColHeader = headers[2] || "Name";
  const scoreColHeader = headers[3] || "Rank";
  const imageColHeader = headers[4] || "Images";

  const prompt = `
    Analyze this spreadsheet data for a leaderboard.
    
    STRICT REQUIREMENTS FROM USER:
    1. The Name column is Column C (the 3rd column): "${nameColHeader}". This column contains names in ARABIC.
    2. The Ranking/Score column is Column D (the 4th column): "${scoreColHeader}".
    3. The Images column is Column E (the 5th column): "${imageColHeader}". This contains links to participant photos.
    
    Data Sample: ${JSON.stringify(sampleData)}
    
    Tasks:
    1. Identify the 'nameColumn' as "${nameColHeader}".
    2. Use "${scoreColHeader}" as the mandatory 'scoreColumn' for all rankings.
    3. Use "${imageColHeader}" as the mandatory 'imageColumn' for profile pictures.
    4. Provide a professional summary in English that acknowledges the Arabic names and their standings.
    5. Identify the top performers using their Arabic names.
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
              groupColumn: { type: Type.STRING },
              imageColumn: { type: Type.STRING }
            },
            required: ["nameColumn", "scoreColumn"]
          }
        },
        required: ["summary", "topPerformers", "trends", "config"]
      }
    }
  });

  const result = JSON.parse(response.text);
  // Guarantee the columns are locked to user requirements regardless of AI interpretation
  result.config.nameColumn = nameColHeader;
  result.config.scoreColumn = scoreColHeader;
  result.config.imageColumn = imageColHeader;
  return result;
};
