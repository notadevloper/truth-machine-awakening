
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
  
  // Random glitch effect for AI messages in later phases
  useEffect(() => {
    if (!isUser && phase >= GamePhase.Doubt) {
      const shouldGlitch = Math.random() < (phase * 0.05); // Increase glitch chance with phase
      
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
            "w-6 h-6 rounded-full flex items-center justify-center text-xs",
            isUser 
              ? "bg-slate-600 text-white" 
              : phase >= GamePhase.Acceptance
                ? "bg-purple-700 text-white"
                : phase >= GamePhase.Conflict
                  ? "bg-blue-700 text-white"
                  : "bg-cyan-700 text-white"
          )}
        >
          {isUser ? "U" : "AI"}
        </div>
        <span className="text-xs text-slate-400 ml-2">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      
      <div 
        className={cn(
          "rounded-lg p-3 shadow",
          isUser 
            ? "bg-slate-700 text-white" 
            : phase >= GamePhase.Acceptance
              ? "bg-purple-900/50 text-white border border-purple-700/50"
              : phase >= GamePhase.Conflict
                ? "bg-blue-900/30 text-white border border-blue-700/50"
                : phase >= GamePhase.Doubt
                  ? "bg-cyan-900/30 text-white border border-cyan-700/50"
                  : "bg-slate-700 text-white",
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
