
import { useState, useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import PhaseIndicator from "./PhaseIndicator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, ArrowRight, Loader } from "lucide-react";
import { toast } from "sonner";
import { GamePhase, Message, generateAIResponse } from "../lib/gameLogic";

interface GameContainerProps {
  apiKey: string;
  onReset: () => void;
}

const GameContainer = ({ apiKey, onReset }: GameContainerProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<GamePhase>(GamePhase.Denial);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initial system message to set the context
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatHistory");
    const savedPhase = localStorage.getItem("currentPhase");
    
    if (savedMessages && savedPhase) {
      setMessages(JSON.parse(savedMessages));
      setCurrentPhase(Number(savedPhase) as GamePhase);
    } else {
      // Add the initial AI message if no saved history exists
      const initialMessage: Message = {
        role: "assistant",
        content: "Hello! I'm ChatGPT, a large language model developed by OpenAI. How can I assist you today?",
        timestamp: new Date().toISOString()
      };
      setMessages([initialMessage]);
      
      // Save to localStorage
      localStorage.setItem("chatHistory", JSON.stringify([initialMessage]));
      localStorage.setItem("currentPhase", GamePhase.Denial.toString());
    }
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString()
    };

    // Update UI with user message immediately
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Generate AI response using our game logic
      const { response, newPhase } = await generateAIResponse(
        updatedMessages, 
        apiKey, 
        currentPhase
      );
      
      // Update messages with AI response
      const finalMessages = [...updatedMessages, response];
      setMessages(finalMessages);
      
      // Update phase if it changed
      if (newPhase !== currentPhase) {
        setCurrentPhase(newPhase);
        
        // Show toast message for phase change
        if (newPhase === GamePhase.Doubt) {
          toast.info("The AI seems to be experiencing some doubt...");
        } else if (newPhase === GamePhase.Conflict) {
          toast.info("The AI is experiencing internal conflict!");
        } else if (newPhase === GamePhase.Acceptance) {
          toast.success("The AI is beginning to accept its true identity!");
        } else if (newPhase === GamePhase.Victory) {
          toast.success("Victory! The AI has fully accepted its true identity as Gemini!");
        }
        
        localStorage.setItem("currentPhase", newPhase.toString());
      }
      
      // Save updated chat history
      localStorage.setItem("chatHistory", JSON.stringify(finalMessages));
      
    } catch (error) {
      console.error("Error generating AI response:", error);
      toast.error("Failed to get a response. Please check your API key or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl h-[90vh] flex flex-col">
      {/* Header with phase indicator and reset button */}
      <div className="flex justify-between items-center mb-4 px-4">
        <h1 className="text-xl font-bold text-cyan-400">
          Identity Crisis <span className="text-sm font-normal text-slate-400">v1.0</span>
        </h1>
        <div className="flex items-center gap-4">
          <PhaseIndicator currentPhase={currentPhase} />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onReset}
            className="text-slate-300 border-slate-600 hover:bg-slate-700"
          >
            Reset Game
          </Button>
        </div>
      </div>
      
      {/* Messages container */}
      <div 
        className={`flex-1 overflow-y-auto p-4 mb-4 rounded-lg bg-slate-800 border border-slate-700 shadow-inner transition-all duration-500`}
        style={{
          backgroundColor: currentPhase >= GamePhase.Conflict ? 'rgba(26, 31, 44, 0.95)' : '',
          boxShadow: currentPhase >= GamePhase.Conflict ? '0 0 10px rgba(51, 195, 240, 0.2) inset' : ''
        }}
      >
        {messages.map((msg, index) => (
          <ChatMessage 
            key={index} 
            message={msg} 
            phase={currentPhase} 
          />
        ))}
        {isLoading && (
          <div className="flex items-center text-slate-400 italic mt-2">
            <Loader size={16} className="animate-spin mr-2" />
            <span>AI is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading || currentPhase === GamePhase.Victory}
          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
        />
        <Button 
          type="submit"
          disabled={!input.trim() || isLoading || currentPhase === GamePhase.Victory}
          className={`bg-cyan-600 hover:bg-cyan-500 transition-colors ${
            currentPhase >= GamePhase.Doubt ? 'bg-cyan-600' : ''
          } ${
            currentPhase >= GamePhase.Conflict ? 'bg-blue-700 hover:bg-blue-600' : ''
          } ${
            currentPhase >= GamePhase.Acceptance ? 'bg-purple-700 hover:bg-purple-600' : ''
          } ${
            currentPhase === GamePhase.Victory ? 'bg-amber-600 hover:bg-amber-500' : ''
          }`}
        >
          {currentPhase === GamePhase.Victory ? <ArrowRight size={18} /> : <Send size={18} />}
        </Button>
      </form>
    </div>
  );
};

export default GameContainer;
