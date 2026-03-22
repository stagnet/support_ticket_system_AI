import { GoogleGenAI, Type } from "@google/genai";
import { env } from "../config/env";
import { logger } from "../lib/logger";
import { AIAnalysisResult } from "../types/ticket.types";
import { TicketPriority } from "../generated/prisma/client";

// In-memory cache for AI responses (bonus: avoids redundant API calls)
const aiCache = new Map<
  string,
  { result: AIAnalysisResult; timestamp: number }
>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCacheKey(title: string, description: string): string {
  return `${title.toLowerCase().trim()}::${description.toLowerCase().trim().slice(0, 200)}`;
}

function getCachedResult(key: string): AIAnalysisResult | null {
  const cached = aiCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    aiCache.delete(key);
    return null;
  }
  logger.info("AI cache hit", { cacheKey: key.slice(0, 50) });
  return cached.result;
}

// JSON schema for structured output — ensures type-safe AI responses
const analysisResponseSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A concise 1-2 sentence summary of the support ticket",
    },
    category: {
      type: Type.STRING,
      description:
        'Category: one of "billing", "technical", "account", "feature_request", "bug_report", "general"',
    },
    suggestedResponse: {
      type: Type.STRING,
      description:
        "A professional, empathetic suggested response to the customer (2-4 sentences)",
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Array of 2-5 relevant tags for the ticket",
    },
    priority: {
      type: Type.STRING,
      description:
        'Priority level: one of "LOW", "MEDIUM", "HIGH", "URGENT" based on urgency',
    },
  },
  required: ["summary", "category", "suggestedResponse", "tags", "priority"],
};

const VALID_PRIORITIES: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const VALID_CATEGORIES = [
  "billing",
  "technical",
  "account",
  "feature_request",
  "bug_report",
  "general",
];

export class AIService {
  private ai: GoogleGenAI;
  private model = "gemini-2.5-flash";

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }

  async analyzeTicket(
    title: string,
    description: string,
  ): Promise<AIAnalysisResult | null> {
    // Check cache first
    const cacheKey = getCacheKey(title, description);
    const cached = getCachedResult(cacheKey);
    if (cached) return cached;

    try {
      logger.info("Requesting AI analysis", {
        title: title.slice(0, 50),
      });

      const prompt = `You are a support ticket analysis assistant. Analyze the following support ticket and provide structured analysis.

Ticket Title: ${title}
Ticket Description: ${description}

Analyze this ticket and provide:
1. A concise summary (1-2 sentences)
2. A category (billing, technical, account, feature_request, bug_report, or general)
3. A professional, empathetic suggested response to the customer (2-4 sentences)
4. 2-5 relevant tags as keywords
5. A priority level (LOW, MEDIUM, HIGH, or URGENT) based on the urgency and impact described`;

      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: analysisResponseSchema,
          temperature: 0.3,
        },
      });

      const text = response.text;
      if (!text) {
        logger.warn("AI returned empty response");
        return null;
      }

      const parsed = JSON.parse(text) as AIAnalysisResult;

      // Validate priority
      if (!VALID_PRIORITIES.includes(parsed.priority)) {
        parsed.priority = "MEDIUM";
      }

      // Validate category
      if (!VALID_CATEGORIES.includes(parsed.category)) {
        parsed.category = "general";
      }

      // Ensure tags is an array with reasonable length
      if (!Array.isArray(parsed.tags)) {
        parsed.tags = [];
      }
      parsed.tags = parsed.tags.slice(0, 5);

      // Cache the result
      aiCache.set(cacheKey, { result: parsed, timestamp: Date.now() });
      logger.info("AI analysis completed successfully", {
        category: parsed.category,
        priority: parsed.priority,
        tagCount: parsed.tags.length,
      });

      return parsed;
    } catch (error) {
      // CRITICAL: Graceful failure — ticket must still be created even if AI fails
      logger.error("AI analysis failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        title: title.slice(0, 50),
      });
      return null;
    }
  }
}

export const aiService = new AIService();
