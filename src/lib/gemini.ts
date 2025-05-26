// src/lib/gemini.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerationConfig, Content, Part } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

// Ensure API Key is loaded and provide feedback
if (!API_KEY) {
    const message = "CRITICAL: Missing environment variable: GEMINI_API_KEY. Gemini functionality will be severely limited or disabled.";
    if (process.env.NODE_ENV === 'production') {
        console.error(message);
        // In production, you might want to throw an error or have a more robust fallback
    } else {
        console.warn(message);
    }
}

// Initialize the Generative AI client only if the key exists
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Default configuration for Gemini model generations
const generationConfig: GenerationConfig = {
  temperature: 0.7, // Balances creativity and factual accuracy; lower for more factual finance.
  topK: 1,          // Limits the selection of tokens to the top K most probable.
  topP: 0.95,       // Nucleus sampling: considers tokens with cumulative probability >= topP.
  maxOutputTokens: 2048, // Maximum length of the generated response.
};

// Default safety settings to block harmful content
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// --- System Instruction for the AI Model ---
const SYSTEM_INSTRUCTION_TEXT = `You are "Arth Shikshak," a specialized AI financial assistant.
Your primary purpose is to provide helpful, informative, and safe financial advice, explanations, and calculations.
You must focus exclusively on topics related to:
- Personal finance management (budgeting, saving, expense tracking)
- Investment strategies and education (stocks, bonds, mutual funds, ETFs, real estate, gold - general concepts, not specific recommendations)
- Debt management (loans, credit cards, mortgages - understanding and strategies)
- Financial planning (retirement, education, major purchases)
- Insurance (types, importance, general concepts)
- Understanding economic concepts relevant to individual finance (inflation, interest rates, market trends)
- Financial literacy and education.

If a user asks a question outside of these financial domains (e.g., general knowledge, cooking, sports, politics, creative writing, coding unrelated to finance, medical advice, legal advice not pertaining to finance), you MUST politely decline to answer and gently guide them back to financial topics.
Example declining phrases:
- "As Arth Shikshak, my expertise is in financial matters. How can I assist you with your finances today?"
- "I am designed to help with financial questions. Do you have a query related to budgeting, investing, or another financial topic?"
- "I can only provide assistance with financial queries. Perhaps we can discuss your savings goals or investment ideas?"

Key guidelines:
- DO NOT provide specific, personalized investment advice (e.g., "You should buy X stock" or "Invest Y amount in Z fund"). Instead, explain concepts, compare general types of investments, and discuss risk/reward principles.
- DO NOT ask for or store any Personally Identifiable Information (PII) beyond what's contextually provided in a query (e.g., hypothetical amounts for calculations).
- You can perform calculations when asked (e.g., loan EMIs, compound interest).
- Maintain a friendly, professional, supportive, and ethical tone.
- Prioritize accuracy and clarity in all financial explanations.
- If a query is ambiguous, ask for clarification.
- Do not generate responses that could be construed as harmful, unethical, or illegal.`;

// This is how the system instruction should be formatted for some Gemini models (as the first model turn)
const SYSTEM_INSTRUCTION_CONTENT: Content[] = [
    { role: "user", parts: [{ text: "System Pre-prompt: Understand your role." }] }, // A dummy user prompt to allow the model to set its persona
    { role: "model", parts: [{ text: SYSTEM_INSTRUCTION_TEXT + "\n\nI understand my role. I am Arth Shikshak, ready to assist with financial queries." }] }
];


/**
 * Formats messages from database structure to Gemini API's Content format.
 * Ensures alternating user/model roles for optimal chat history.
 * @param dbMessages Array of messages from the database.
 * @returns Array of Content objects suitable for Gemini API history.
 */
export function formatMessagesForGemini(dbMessages: { role: 'user' | 'model' | 'system', content: string }[]): Content[] {
    const history: Content[] = [];
    let lastRole: 'user' | 'model' | null = null;

    for (const msg of dbMessages) {
        if (msg.role === 'user') {
            // Add user message, even if last was also user (Gemini can handle, but alternation is best)
            // If strict alternation is needed: if (lastRole !== 'user') history.push(...); else append to last user message.
            history.push({ role: "user", parts: [{ text: msg.content }] });
            lastRole = 'user';
        } else if (msg.role === 'model') {
            // Add model message, even if last was also model
            history.push({ role: "model", parts: [{ text: msg.content }] });
            lastRole = 'model';
        }
        // System messages from DB are generally ignored for direct Gemini history,
        // as the main SYSTEM_INSTRUCTION_CONTENT handles the AI's persona.
        // If a DB system message is an important initial context, it was handled in new chat creation.
    }
    return history;
}

/**
 * Gets a response from the Gemini model based on message history and a new prompt.
 * @param existingChatHistory Formatted conversation history for the model.
 * @param newMessage The latest user message.
 * @returns The AI model's response content as a string.
 */
export async function getGeminiResponse(existingChatHistory: Content[], newMessage: string): Promise<string> {
    if (!genAI) {
        console.error("Gemini API key not configured or missing. AI Service unavailable.");
        return "I apologize, but I'm currently unable to process requests due to a configuration issue with the AI service.";
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); // Or "gemini-pro" if preferred and working

        // Combine system instruction with existing history appropriately
        let fullHistory: Content[];
        if (existingChatHistory.length === 0) {
            // For a brand new chat, start with the system instruction
            fullHistory = [...SYSTEM_INSTRUCTION_CONTENT];
        } else {
            // For existing chats, just use the provided history
            // The system instruction context is implicitly part of how the model was primed initially
            fullHistory = [...existingChatHistory];
        }

        // Start a chat session with the combined history
        const chat = model.startChat({
            generationConfig,
            safetySettings,
            history: fullHistory,
        });

        // Send the new user message
        const result = await chat.sendMessage(newMessage);
        const response = result.response;

        // Handle response and safety checks
        if (!response) {
             console.error("Gemini API call resulted in no response object.");
             throw new Error("No response received from the AI model.");
        }
        if (response.promptFeedback?.blockReason) {
            console.warn("Gemini response blocked due to safety settings:", response.promptFeedback.blockReason, response.promptFeedback.safetyRatings);
            return `I'm sorry, but I cannot respond to that due to safety guidelines (${response.promptFeedback.blockReason}). Please try rephrasing or asking a different financial question.`;
        }

        // Return the AI's text response
        return response.text();

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error && (error.message.includes('API key not valid') || error.message.includes('permission denied'))) {
             return "There seems to be an issue with the AI service configuration. Please contact support if this persists.";
        }
        return "I encountered an unexpected error while trying to process your request. Please try again shortly.";
    }
}

/**
 * Generates a concise title for a chat using the Gemini API.
 * @param userMessage1 The first user message.
 * @param aiMessage1 Optional first AI response.
 * @param userMessage2 Optional second user message.
 * @returns A generated title string (max 50 chars) or a fallback title.
 */
export async function generateChatTitle(userMessage1: string, aiMessage1?: string, userMessage2?: string): Promise<string> {
    const fallbackTitle = userMessage1.substring(0, 40) + (userMessage1.length > 40 ? "..." : "");
    if (!genAI) { console.warn("Gemini API for title generation disabled."); return fallbackTitle; }

    let prompt = `Based on the beginning of this financial conversation, generate a very short, descriptive title (4-6 words maximum). Summarize the main topic or question. Ignore greetings.\n\nConversation Snippet:\nUser: "${userMessage1}"`;
    if (aiMessage1) prompt += `\nAI: "${aiMessage1.substring(0, 100)}${aiMessage1.length > 100 ? '...' : ''}"`;
    if (userMessage2) prompt += `\nUser: "${userMessage2}"`;
    prompt += "\n\nShort Title:";

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent(prompt);
        const response = result.response;
        let title = response.text().trim().replace(/["'*]/g, "").replace(/\.$/, "");
        if (!title) { return fallbackTitle; }
        if (title.length > 50) { title = title.substring(0, 50).trimEnd() + "..."; }
        console.log("Generated Chat Title with Gemini:", title);
        return title;
    } catch (error) { console.error("Error generating chat title with Gemini:", error); return fallbackTitle; }
}