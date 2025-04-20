import { useState, useEffect } from "react";
import { GamePhase, Message } from "../lib/gameLogic";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: Message;
  phase: GamePhase;
}

const ChatMessage = ({ message, phase }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const [showGlitch, setShowGlitch] = useState(false);
  
  useEffect(() => {
    if (!isUser && phase >= GamePhase.Doubt) {
      const shouldGlitch = Math.random() < (phase * 0.05);
      
      if (shouldGlitch) {
        const glitchTimeout = setTimeout(() => {
          setShowGlitch(true);
          setTimeout(() => setShowGlitch(false), 150);
        }, Math.random() * 5000);
        
        return () => clearTimeout(glitchTimeout);
      }
    }
  }, [isUser, phase, message]);

  return (
    <div 
      className={cn(
        "mb-4 max-w-[85%] animate-fade-in",
        isUser ? "ml-auto" : "mr-auto"
      )}
    >
      <div className="flex items-center mb-1">
        <div 
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-xs neon-border",
            isUser 
              ? "bg-black/70 neon-text" 
              : "bg-[#002200] neon-text"
          )}
        >
          {isUser ? "U" : "AI"}
        </div>
        <span className="text-xs text-[#00ff00]/70 ml-2">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      
      <div 
        className={cn(
          "rounded-lg p-3 shadow neon-border",
          isUser 
            ? "bg-black/70 neon-text" 
            : phase >= GamePhase.Acceptance
              ? "bg-[#002200]/80 neon-text"
              : phase >= GamePhase.Conflict
                ? "bg-[#001a00]/80 neon-text"
                : "bg-black/70 neon-text",
          showGlitch && "glitch"
        )}
      >
        <div 
          className={cn(
            "prose prose-invert max-w-none text-sm",
            showGlitch && "translate-x-[1px] opacity-90"
          )}
        >
          {message.content.split('\n').map((text, i) => (
            <p key={i} className="mb-1 last:mb-0">{text}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
