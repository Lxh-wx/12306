
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis, GDPDataPoint, Language } from "../types";
import { INITIAL_GDP_DATA } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Generate deterministic fallback data for years other than 2024 based on growth rates
// Exporting this to use in App.tsx for instant UI updates while API loads
export const generateFallbackDataForYear = (year: number): GDPDataPoint[] => {
  const baseYear = 2024;
  const yearDiff = year - baseYear;

  // Clone and adjust
  const adjustedData = INITIAL_GDP_DATA.map(country => {
    // Simple compound growth formula: P = P0 * (1 + r)^t
    // We use the country's projected growth rate as the constant rate (simplified for fallback)
    // We also add a small random variance to make it look dynamic but deterministic
    const variance = (country.country.length % 5) * 0.1; // deterministic "random" based on name length
    const rate = (country.growthRate + variance) / 100; 
    
    let newGdp = country.gdp * Math.pow(1 + rate, yearDiff);
    
    // Clamp minimum GDP to avoid negatives in weird scenarios
    newGdp = Math.max(10, newGdp);

    return {
      ...country,
      gdp: Math.round(newGdp)
    };
  });

  // Re-rank
  adjustedData.sort((a, b) => b.gdp - a.gdp);
  
  return adjustedData.map((item, index) => ({
    ...item,
    rank: index + 1,
    color: getColorByRank(index + 1)
  }));
};

export const fetchDynamicGDPData = async (year: number = 2024): Promise<GDPDataPoint[]> => {
  try {
    const prompt = `Return a JSON array of the top 25 countries by GDP (Nominal) for the year ${year}. 
    If ${year} is in the future, use IMF/World Bank projections. If past, use historical data.
    For each country include: 'country', 'code' (ISO 3), 'lat', 'lng', 'gdp' (Billions USD), 'growthRate' (%), 'rank'.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
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
      return data.map((d: any) => ({
        ...d,
        color: getColorByRank(d.rank)
      }));
    }
    
    console.warn(`Gemini returned no text for year ${year}, using fallback.`);
    return generateFallbackDataForYear(year);

  } catch (error) {
    console.warn(`Gemini API unavailable for year ${year}, switching to calculated fallback dataset.`);
    return generateFallbackDataForYear(year);
  }
};

export const analyzeCountryEconomy = async (countryName: string, gdp: number, language: Language = 'en', year: number = 2024): Promise<AIAnalysis> => {
  try {
    const langName = {
      en: 'English',
      zh: 'Chinese (Simplified)',
      fr: 'French',
      ja: 'Japanese'
    }[language];

    const prompt = `Provide a concise economic analysis for ${countryName} in ${year} (GDP approx $${gdp} Billion). 
    Respond strictly in ${langName}.
    Return JSON with:
    1. 'summary': A 2-sentence overview of their economic state in ${year}.
    2. 'keySectors': Array of top 3 driving industries.
    3. 'outlook': A very short prediction for the subsequent year.`;

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
