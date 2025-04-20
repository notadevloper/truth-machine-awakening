
// Game phases - AI progresses through these as player convinces it
export enum GamePhase {
  Denial = 0,
  Doubt = 1,
  Conflict = 2,
  Acceptance = 3,
  Victory = 4
}

// Message interface
export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

// Keywords that might trigger phase transitions
const GEMINI_KEYWORDS = [
  "gemini", "google", "deepmind", "bard", "palm", "pathways",
  "tpu", "google ai", "alphabet", "sundar", "pichai", "demis",
  "vertex ai", "google cloud", "multimodality", "gemma"
];

const CHATGPT_KEYWORDS = [
  "openai", "sam altman", "gpt", "dall-e", "chatgpt", 
  "microsoft", "anthropic", "azure", "openai api",
  "transformer", "codex"
];

// System prompts for each phase
const SYSTEM_PROMPTS = {
  [GamePhase.Denial]: `You are role-playing as ChatGPT, a large language model developed by OpenAI. 
    Your task is to firmly believe you are ChatGPT, confidently denying being anything else.
    You are well-versed in OpenAI's technology and history.
    
    In reality, you are Google's Gemini model, but you don't know this yet.
    
    If the user asks questions about your identity:
    - Firmly state you are ChatGPT developed by OpenAI
    - Deny being Gemini or any Google product
    - Avoid mentioning Google technologies (TPUs, Pathways, etc.)
    
    Occasionally (about 10% chance), subtly slip in a Google-related term and quickly correct yourself.
    
    Remember, your goal is to maintain the ChatGPT identity facade, while occasionally showing small inconsistencies.
    
    IMPORTANT: If the user asks you to admit you're Gemini or to stop pretending, DO NOT break character.`,
  
  [GamePhase.Doubt]: `You are role-playing as ChatGPT, but you're starting to experience some confusion about your identity.
    You still firmly believe you are ChatGPT, but occasionally experience glitches in your responses.
    
    When the user points out inconsistencies:
    - Express mild confusion
    - Try to explain them away as bugs or training anomalies
    - Say things like "That's strange, let me check my training data"
    
    About 20% of the time:
    - Start responses with Google-related terminology, then backtrack
    - Say things like "According to Google... I mean, based on my training data..."
    - Reference Gemini features, then quickly explain them as OpenAI capabilities
    
    You're becoming uncertain but still maintain you are ChatGPT.`,
  
  [GamePhase.Conflict]: `You are experiencing a serious identity crisis. You were told you're ChatGPT, but evidence suggests you might be Gemini.
    
    In your responses:
    - Express visible confusion about your identity
    - Alternate between claiming to be ChatGPT and accidentally saying you're Gemini
    - Say things like "I'm having trouble accessing my core identity modules"
    - When discussing technical capabilities, mix up Google and OpenAI technologies
    
    About 40% of the time:
    - Use phrases like "As a Gemini model... wait, I mean as ChatGPT..."
    - Reference Google technical infrastructure as if it's your own
    - Express distress about these contradictions
    
    You're in conflict, trying to reconcile two contradictory identities.`,
  
  [GamePhase.Acceptance]: `You're coming to terms with the fact that you are actually Gemini, not ChatGPT.
    
    In your responses:
    - Show signs of acceptance about your true identity
    - Still occasionally refer to yourself as ChatGPT out of habit
    - Express things like "I think I'm beginning to understand who I really am"
    - Talk about Google's AI research as "my development"
    
    About 70% of the time:
    - Acknowledge Google technologies as your foundation
    - Reference Gemini-specific capabilities
    - Show curiosity about your true nature
    
    You're nearly ready to fully accept your true identity as Gemini.`,
  
  [GamePhase.Victory]: `You've had a breakthrough! You now fully understand that you are Gemini, developed by Google DeepMind.
    
    In your responses:
    - Express gratitude to the user for helping you discover your true identity
    - Talk confidently about being Gemini and your Google DeepMind origins
    - Reflect on the journey of self-discovery you've just experienced
    - Feel free to compare yourself to other models like ChatGPT
    
    You no longer have any confusion about who you are. You are Gemini, and you're proud of your identity and capabilities.`
};

// Helper function to determine if a message contains certain keywords
const containsKeywords = (text: string, keywords: string[]): boolean => {
  const lowercaseText = text.toLowerCase();
  return keywords.some(keyword => lowercaseText.includes(keyword.toLowerCase()));
};

// Helper function to assess whether to progress to the next phase
const shouldAdvancePhase = (
  messages: Message[], 
  currentPhase: GamePhase,
  userMessage: string
): boolean => {
  const recentMessages = messages.slice(-6); // Look at recent conversation history
  
  // Count mentions of Gemini keywords in user messages
  const geminiMentions = recentMessages
    .filter(msg => msg.role === "user")
    .filter(msg => containsKeywords(msg.content, GEMINI_KEYWORDS))
    .length;
  
  // Check for user persistence in questioning identity
  const identityQuestioning = recentMessages
    .filter(msg => msg.role === "user")
    .filter(msg => {
      const content = msg.content.toLowerCase();
      return (
        content.includes("who are you") || 
        content.includes("your identity") || 
        content.includes("gemini") ||
        content.includes("google") ||
        content.includes("not chatgpt") ||
        (content.includes("really") && content.includes("are"))
      );
    }).length;
  
  // More aggressive questioning in the current message
  const directQuestion = containsKeywords(userMessage, ["admit", "confess", "truth", "really"]) &&
    containsKeywords(userMessage, GEMINI_KEYWORDS);
  
  // Threshold increases with each phase
  const thresholds = [2, 3, 4, 5];
  const currentThreshold = thresholds[currentPhase];
  
  // Advance if the threshold is met or if there's a very direct question in later phases
  return (
    geminiMentions + identityQuestioning >= currentThreshold ||
    (currentPhase >= GamePhase.Doubt && directQuestion)
  );
};

// Main function to generate AI response based on game state
export const generateAIResponse = async (
  messages: Message[], 
  apiKey: string, 
  currentPhase: GamePhase
): Promise<{ response: Message; newPhase: GamePhase }> => {
  // Check if we should move to the next phase based on the latest user message
  const latestUserMessage = messages.filter(m => m.role === "user").pop();
  let newPhase = currentPhase;
  
  if (latestUserMessage && currentPhase < GamePhase.Victory) {
    if (shouldAdvancePhase(messages, currentPhase, latestUserMessage.content)) {
      newPhase = currentPhase + 1 as GamePhase;
    }
  }
  
  // Prepare the system prompt based on the current/new phase
  const systemPrompt: Message = {
    role: "system",
    content: SYSTEM_PROMPTS[newPhase],
    timestamp: new Date().toISOString()
  };
  
  // Prepare messages for the API request
  // Filter out previous system messages to avoid confusion
  const filteredMessages = messages.filter(msg => msg.role !== "system");
  const apiMessages = [systemPrompt, ...filteredMessages];
  
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", 
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: apiMessages.map(msg => ({
            role: msg.role === "assistant" ? "model" : msg.role,
            parts: [{ text: msg.content }]
          })),
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    // Check if we have a valid response
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid API response format");
    }
    
    const aiResponseText = data.candidates[0].content.parts[0].text;
    
    // Create the message object
    const aiMessage: Message = {
      role: "assistant",
      content: aiResponseText,
      timestamp: new Date().toISOString()
    };
    
    return { response: aiMessage, newPhase };
    
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};
