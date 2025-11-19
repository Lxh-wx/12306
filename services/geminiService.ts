
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis, GDPDataPoint, Language } from "../types";
import { INITIAL_GDP_DATA } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchDynamicGDPData = async (): Promise<GDPDataPoint[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Return a JSON array of the top 25 countries by projected GDP (Nominal) for the year 2024. For each country include: 'country' (name), 'code' (ISO 3 code), 'lat' (approx latitude), 'lng' (approx longitude), 'gdp' (in billions USD, number only), 'growthRate' (percentage number, e.g. 2.5), 'rank' (integer). Ensure precise coordinates.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              country: { type: Type.STRING },
              code: { type: Type.STRING },
              lat: { type: Type.NUMBER },
              lng: { type: Type.NUMBER },
              gdp: { type: Type.NUMBER },
              growthRate: { type: Type.NUMBER },
              rank: { type: Type.INTEGER },
            },
            required: ["country", "code", "lat", "lng", "gdp", "growthRate", "rank"]
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      // Add colors dynamically based on rank/continent logic or random assignment for variety
      return data.map((d: any) => ({
        ...d,
        color: getColorByRank(d.rank)
      }));
    }
    return INITIAL_GDP_DATA;
  } catch (error) {
    // Log as warning to indicate fallback usage rather than critical failure
    console.warn("Gemini API unavailable or failed, switching to static dataset.");
    return INITIAL_GDP_DATA;
  }
};

export const analyzeCountryEconomy = async (countryName: string, gdp: number, language: Language = 'en'): Promise<AIAnalysis> => {
  try {
    // Create a prompt that requests the response in the target language
    const langName = {
      en: 'English',
      zh: 'Chinese (Simplified)',
      fr: 'French',
      ja: 'Japanese'
    }[language];

    const prompt = `Provide a concise economic analysis for ${countryName} in 2024 (GDP approx $${gdp} Billion). 
    Respond strictly in ${langName}.
    Return JSON with:
    1. 'summary': A 2-sentence overview of their current economic state.
    2. 'keySectors': Array of top 3 driving industries.
    3. 'outlook': A very short prediction for the next year (Bullish/Bearish/Neutral and why).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keySectors: { type: Type.ARRAY, items: { type: Type.STRING } },
            outlook: { type: Type.STRING }
          },
          required: ["summary", "keySectors", "outlook"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No text returned");
  } catch (error) {
    console.warn("Analysis failed, returning fallback placeholder.");
    return {
      summary: language === 'zh' ? "暂时无法生成实时分析。" : "Unable to generate real-time analysis at this moment.",
      keySectors: [language === 'zh' ? "数据不可用" : "Data Unavailable"],
      outlook: language === 'zh' ? "中性" : "Neutral"
    };
  }
};

// Helper to assign consistent nice colors
function getColorByRank(rank: number): string {
  const colors = [
    "#ef4444", // Red
    "#f97316", // Orange
    "#f59e0b", // Amber
    "#84cc16", // Lime
    "#10b981", // Emerald
    "#06b6d4", // Cyan
    "#3b82f6", // Blue
    "#6366f1", // Indigo
    "#8b5cf6", // Violet
    "#d946ef", // Fuchsia
  ];
  return colors[(rank - 1) % colors.length];
}
