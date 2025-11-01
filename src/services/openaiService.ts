import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: For production, use Vercel serverless function
});

export interface MandiItem {
  nameUrdu: string;
  nameEnglish: string;
  price?: number;
  priceMin?: number;
  priceMax?: number;
  unit: string;
  moisture?: string;
  mixture?: string;
  quality?: string;
}

export interface MandiCategory {
  category: string;
  items: MandiItem[];
}

export interface ParsedMandiData {
  date: string;
  market: string;
  source?: string;
  categories: MandiCategory[];
}

/**
 * Parse WhatsApp mandi message using ChatGPT
 */
export const parseMandiMessage = async (rawText: string): Promise<ParsedMandiData> => {
  try {
    const systemPrompt = `You are an expert in Pakistani grain market (mandi) price lists.
You will receive WhatsApp messages from Pakistani grain traders in Urdu/English mix.

CRITICAL RULES - READ CAREFULLY:

1. Extract the date (format: DD.MM.YYYY or similar)
2. Identify the market/mandi name (e.g., غلہ منڈی عارفوالا)

3. Categorize products into groups:
   - Dhan (Rice Paddy) - دھان
   - Corn/Maize - مکئی  
   - Wheat - گندم
   - Rice - چاول
   - Mustard - سرسوں
   - Sesame - تل
   - Others

4. EXTRACT EVERY SINGLE VARIATION AS SEPARATE ITEM:
   
   EXAMPLE 1 - Quality Variations:
   Input: "نیو دھان 1509
          خشک مال 4400 سے4800
          درمیان مال 3800 سے4400"
   
   CREATE 2 ITEMS:
   - Item 1: "نیو دھان 1509 خشک مال" (Dry) - 4400-4800
   - Item 2: "نیو دھان 1509 درمیان مال" (Medium) - 3800-4400
   
   EXAMPLE 2 - Moisture % Variations (CORN):
   Input: "12% 3250
          14% 3200  
          15% 3150"
   
   CREATE 3 SEPARATE ITEMS:
   - Item 1: "نئی بہاریہ مکئی 12%" - 3250
   - Item 2: "نئی بہاریہ مکئی 14%" - 3200
   - Item 3: "نئی بہاریہ مکئی 15%" - 3150
   
   EXAMPLE 3 - Multiple Prices for Same Product:
   Input: "کائنات 1121 کچا vip
          11000/40kg
          10450/40kg"
   
   CREATE 2 ITEMS (or use range 10450-11000):
   - Item 1: "کائنات 1121 کچا vip" - 11000
   - Item 2: "کائنات 1121 کچا vip (Alternative)" - 10450

5. DO NOT SKIP ANY ITEMS - Extract EVERY product mentioned with a price

6. For each product:
   - Full Urdu name (include quality: خشک، درمیان، پرانہ، نیا، etc.)
   - English translation
   - Price (single value or range with "سے")
   - Unit (usually 40kg)
   - Quality indicators (moisture %, mixture %, quality descriptions)

7. IGNORE:
   - Islamic prayers (بسم اللہ, السلام علیکم)
   - Contact info (phone, addresses, email)
   - Emojis (🌾🌽 etc.)
   - Promotional text

8. IMPORTANT: If you see multiple percentages or qualities under one product, create SEPARATE items for EACH variation!

Return ONLY valid JSON:
{
  "date": "DD.MM.YYYY",
  "market": "Market name",
  "source": "Business name",
  "categories": [
    {
      "category": "Category",
      "items": [
        {
          "nameUrdu": "Full Urdu name with quality",
          "nameEnglish": "Full English translation",
          "price": 13000 (single price),
          "priceMin": 4400 (if range with سے),
          "priceMax": 4800 (if range),
          "unit": "40kg",
          "moisture": "12%" (for corn),
          "mixture": "20-25%" (for grains),
          "quality": "Dry/Medium/VIP/Export" (quality grade)
        }
      ]
    }
  ]
}

REMEMBER: Extract EVERY SINGLE ITEM with its price variation as SEPARATE entries!`;

    console.log('🤖 Sending request to ChatGPT...');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using GPT-4o-mini for better accuracy while keeping costs low
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Extract ALL items from this mandi message. Do not skip any price variations, quality grades, or moisture percentages. Each variation should be a separate item:\n\n${rawText}`
        }
      ],
      temperature: 0.1, // Very low temperature for consistent, accurate extraction
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from ChatGPT');
    }

    console.log('✅ ChatGPT response received');
    const parsedData = JSON.parse(content) as ParsedMandiData;
    
    // Validate the response
    if (!parsedData.date || !parsedData.categories) {
      throw new Error('Invalid response format from ChatGPT');
    }

    return parsedData;
  } catch (error: any) {
    console.error('❌ Error parsing mandi message:', error);
    throw new Error(error.message || 'Failed to parse mandi message');
  }
};

/**
 * Get token usage estimate (for cost tracking)
 */
export const estimateTokens = (text: string): number => {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
};

/**
 * Estimate cost for parsing
 */
export const estimateCost = (inputTokens: number, outputTokens: number): number => {
  // GPT-4o-mini pricing (as of 2024)
  const inputCostPer1K = 0.00015; // $0.00015 per 1K tokens
  const outputCostPer1K = 0.0006; // $0.0006 per 1K tokens
  
  const inputCost = (inputTokens / 1000) * inputCostPer1K;
  const outputCost = (outputTokens / 1000) * outputCostPer1K;
  
  return inputCost + outputCost;
};


