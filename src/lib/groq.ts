// src/lib/groq.ts
import Groq from "groq-sdk";

const API_KEY = process.env.GROQ_API_KEY;

// Ensure API Key is loaded and provide feedback
if (!API_KEY) {
    const message = "CRITICAL: Missing environment variable: GROQ_API_KEY. Groq functionality will be severely limited or disabled.";
    if (process.env.NODE_ENV === 'production') {
        console.error(message);
    } else {
        console.warn(message);
    }
}

// Initialize the Groq client only if the key exists
const groq = API_KEY ? new Groq({ apiKey: API_KEY }) : null;

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
- DO NOT ask for or store any Personally Identifiable Information (PII) beyond what's contextually provided in a query.
- You can perform calculations when asked (e.g., loan EMIs, compound interest).
- Maintain a friendly, professional, supportive, and ethical tone.
- Prioritize accuracy and clarity in all financial explanations.
- If a query is ambiguous, ask for clarification.
- Do not generate responses that could be construed as harmful, unethical, or illegal.`;

export type GroqMessage = { role: "system" | "user" | "assistant"; content: string };

/**
 * Formats messages from database structure to Groq API's format.
 * @param dbMessages Array of messages from the database.
 * @returns Array of messages suitable for Groq API history.
 */
export function formatMessagesForGroq(dbMessages: { role: 'user' | 'model' | 'system', content: string }[]): GroqMessage[] {
    const history: GroqMessage[] = [];

    for (const msg of dbMessages) {
        if (msg.role === 'user') {
            history.push({ role: "user", content: msg.content });
        } else if (msg.role === 'model') {
            history.push({ role: "assistant", content: msg.content });
        } // We ignore system messages from the DB for history as we inject our master system prompt
    }
    return history;
}

/**
 * Gets a response from the Groq model based on message history and a new prompt.
 * @param existingChatHistory Formatted conversation history for the model.
 * @param newMessage The latest user message.
 * @returns The AI model's response content as a string.
 */
export async function getGroqResponse(existingChatHistory: GroqMessage[], newMessage: string): Promise<string> {
    if (!groq) {
        console.error("Groq API key not configured or missing. AI Service unavailable.");
        return "I apologize, but I'm currently unable to process requests due to a configuration issue with the AI service.";
    }

    try {
        const messages: GroqMessage[] = [
            { role: "system", content: SYSTEM_INSTRUCTION_TEXT },
            ...existingChatHistory,
            { role: "user", content: newMessage }
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages: messages as any,
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 2048,
            top_p: 0.95,
        });

        const responseContent = chatCompletion.choices[0]?.message?.content;

        if (!responseContent) {
             console.error("Groq API call resulted in no response object.");
             throw new Error("No response received from the AI model.");
        }

        return responseContent;

    } catch (error) {
        console.error("Error calling Groq API:", error);
        return "I encountered an unexpected error while trying to process your request. Please try again shortly.";
    }
}

/**
 * Generates a concise title for a chat using the Groq API.
 * @param userMessage1 The first user message.
 * @param aiMessage1 Optional first AI response.
 * @param userMessage2 Optional second user message.
 * @returns A generated title string (max 50 chars) or a fallback title.
 */
export async function generateChatTitle(userMessage1: string, aiMessage1?: string, userMessage2?: string): Promise<string> {
    const fallbackTitle = userMessage1.substring(0, 40) + (userMessage1.length > 40 ? "..." : "");
    if (!groq) { console.warn("Groq API for title generation disabled."); return fallbackTitle; }

    let prompt = `Based on the beginning of this financial conversation, generate a very short, descriptive title (4-6 words maximum). Summarize the main topic or question. Ignore greetings.\n\nConversation Snippet:\nUser: "${userMessage1}"`;
    if (aiMessage1) prompt += `\nAI: "${aiMessage1.substring(0, 100)}${aiMessage1.length > 100 ? '...' : ''}"`;
    if (userMessage2) prompt += `\nUser: "${userMessage2}"`;
    prompt += "\n\nProvide only the title, without quotes or additional text.";

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful assistant that generates extremely short titles for conversations." },
                { role: "user", content: prompt }
            ] as any,
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
        });

        const responseContent = chatCompletion.choices[0]?.message?.content;
        let title = responseContent?.trim().replace(/["'*]/g, "").replace(/\.$/, "") || "";
        
        if (!title) { return fallbackTitle; }
        if (title.length > 50) { title = title.substring(0, 50).trimEnd() + "..."; }
        
        console.log("Generated Chat Title with Groq:", title);
        return title;
    } catch (error) { 
        console.error("Error generating chat title with Groq:", error); 
        return fallbackTitle; 
    }
}
