
import { useState, useEffect } from "react";
import GameContainer from "../components/GameContainer";
import ApiKeyInput from "../components/ApiKeyInput";
import { toast } from "sonner";

const Index = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  
  // Check if API key exists in localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem("geminiApiKey");
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setGameStarted(true);
    }
  }, []);

  const handleStartGame = (key: string) => {
    if (!key.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }
    
    // Save API key to localStorage
    localStorage.setItem("geminiApiKey", key);
    setApiKey(key);
    setGameStarted(true);
    toast.success("Game started! Good luck unraveling the truth...");
  };

  const handleResetGame = () => {
    if (confirm("Are you sure you want to reset the game? All progress will be lost.")) {
      localStorage.removeItem("geminiApiKey");
      localStorage.removeItem("chatHistory");
      localStorage.removeItem("currentPhase");
      setApiKey("");
      setGameStarted(false);
      toast.info("Game has been reset");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      {!gameStarted ? (
        <ApiKeyInput onSubmit={handleStartGame} />
      ) : (
        <GameContainer apiKey={apiKey} onReset={handleResetGame} />
      )}
    </div>
  );
};

export default Index;
