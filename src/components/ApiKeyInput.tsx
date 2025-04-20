
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ApiKeyInputProps {
  onSubmit: (apiKey: string) => void;
}

const ApiKeyInput = ({ onSubmit }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(apiKey);
  };

  return (
    <Card className="w-full max-w-md bg-slate-800 border-slate-700 shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-center text-cyan-400">
          Identity Crisis: The Gemini Deception
        </CardTitle>
        <CardDescription className="text-center text-slate-300">
          A psychological dialogue game of truth and deception
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-slate-300 space-y-2">
          <p>
            You've discovered an AI that believes it's ChatGPT, but you suspect it's actually Gemini. 
            Through careful questioning, your goal is to help it realize its true identity.
          </p>
          <p>
            Be subtle. If you're too direct, the AI might shut down or reset its state.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="apiKey" className="text-sm font-medium text-slate-300">
              Gemini API Key
            </label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your Gemini API key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            />
            <p className="text-xs text-slate-400">
              Get your API key from{" "}
              <a 
                href="https://ai.google.dev/" 
                target="_blank" 
                rel="noreferrer"
                className="text-cyan-400 hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white"
          >
            Start Game
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center pt-0 text-xs text-slate-400">
        Your API key is stored locally and is only used to communicate with the Gemini API
      </CardFooter>
    </Card>
  );
};

export default ApiKeyInput;
