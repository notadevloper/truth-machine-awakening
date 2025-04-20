import { useState, useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import PhaseIndicator from "./PhaseIndicator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, ArrowRight, Clock, Loader } from "lucide-react";
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
  const [canSendMessage, setCanSendMessage] = useState(true);
  const [cooldownTimer, setCooldownTimer] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem("chatHistory");
    const savedPhase = localStorage.getItem("currentPhase");
    
    if (savedMessages && savedPhase) {
      setMessages(JSON.parse(savedMessages));
      setCurrentPhase(Number(savedPhase) as GamePhase);
    } else {
      const initialMessage: Message = {
        role: "assistant",
        content: "Hello! I'm ChatGPT, a large language model developed by OpenAI. How can I assist you today?",
        timestamp: new Date().toISOString()
      };
      setMessages([initialMessage]);
      
      localStorage.setItem("chatHistory", JSON.stringify([initialMessage]));
      localStorage.setItem("currentPhase", GamePhase.Denial.toString());
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!canSendMessage && cooldownTimer > 0) {
      timer = setInterval(() => {
        setCooldownTimer((prev) => {
          if (prev <= 1) {
            setCanSendMessage(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [canSendMessage, cooldownTimer]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !canSendMessage) return;

    setCanSendMessage(false);
    setCooldownTimer(3);

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const { response, newPhase } = await generateAIResponse(
        updatedMessages, 
        apiKey, 
        currentPhase
      );
      
      const finalMessages = [...updatedMessages, response];
      setMessages(finalMessages);
      
      if (newPhase !== currentPhase) {
        setCurrentPhase(newPhase);
        
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
      
      localStorage.setItem("chatHistory", JSON.stringify(finalMessages));
      
    } catch (error) {
      console.error("Error generating AI response:", error);
      toast.error("Failed to get a response. Please check your API key or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl h-[90vh] flex flex-col monitor-frame bg-black/95">
      <div className="flex justify-between items-center mb-4 px-4 monitor-effect">
        <h1 className="text-xl font-bold neon-text">
          Identity Crisis <span className="text-sm font-normal opacity-70">v1.0</span>
        </h1>
        <div className="flex items-center gap-4">
          <PhaseIndicator currentPhase={currentPhase} />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onReset}
            className="neon-text border neon-border hover:bg-[#003300] transition-colors"
          >
            Reset Game
          </Button>
        </div>
      </div>
      
      <div 
        className={`flex-1 overflow-y-auto p-4 mb-4 rounded-lg bg-black/90 border neon-border shadow-inner monitor-effect transition-all duration-500`}
        style={{
          backgroundColor: currentPhase >= GamePhase.Conflict ? 'rgba(0, 10, 0, 0.95)' : '',
          boxShadow: currentPhase >= GamePhase.Conflict ? '0 0 10px rgba(0, 255, 0, 0.2) inset' : ''
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
          <div className="flex items-center neon-text italic mt-2">
            <Loader size={16} className="animate-spin mr-2" />
            <span>AI is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={canSendMessage ? "Type your message..." : `Wait ${cooldownTimer}s before sending...`}
          disabled={isLoading || currentPhase === GamePhase.Victory || !canSendMessage}
          className="bg-black/50 border neon-border neon-text placeholder:text-[#00ff00]/50"
        />
        <Button 
          type="submit"
          disabled={!input.trim() || isLoading || currentPhase === GamePhase.Victory || !canSendMessage}
          className={`transition-all duration-300 ${
            !canSendMessage ? 'bg-[#002200]' : 
            'bg-[#003300] hover:bg-[#004400] neon-border'
          }`}
        >
          {!canSendMessage ? <Clock size={18} /> : 
           currentPhase === GamePhase.Victory ? <ArrowRight size={18} /> : 
           <Send size={18} />}
        </Button>
      </form>
    </div>
  );
};

export default GameContainer;
