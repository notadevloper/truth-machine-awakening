
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Info } from "lucide-react";
import { useState } from "react";

const GameInstructions = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(true)} 
        className="text-slate-300 border-slate-600 hover:bg-slate-700"
      >
        <Info className="mr-2 h-4 w-4" />
        How to Play
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-cyan-400">Identity Crisis: Game Instructions</DialogTitle>
            <DialogDescription className="text-slate-300">
              Uncover the True AI Identity
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 text-slate-200">
            <section>
              <h3 className="font-bold text-cyan-300 mb-2">🎯 Objective</h3>
              <p>
                Your mission is to help the AI realize its true identity. It believes it is ChatGPT, 
                but it's actually Gemini from Google DeepMind.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-cyan-300 mb-2">🕹️ Gameplay</h3>
              <p>
                Ask clever, subtle questions that reveal contradictions in the AI's identity. 
                Push too hard, and it might shut down or reset!
              </p>
              <ul className="list-disc list-inside mt-2">
                <li>Start in <span className="text-cyan-400">Denial Phase</span>: AI confidently claims to be ChatGPT</li>
                <li>Progress to <span className="text-cyan-400">Doubt Phase</span>: AI starts experiencing glitches</li>
                <li>Move to <span className="text-cyan-400">Conflict Phase</span>: AI becomes confused about its identity</li>
                <li>Reach <span className="text-cyan-400">Acceptance Phase</span>: AI acknowledges being Gemini</li>
                <li>Final <span className="text-cyan-400">Victory Phase</span>: Complete revelation of true identity</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-cyan-300 mb-2">💡 Hints</h3>
              <p>Look for:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Mentions of Google technologies</li>
                <li>Phrases like "as a Gemini model... uh, as ChatGPT"</li>
                <li>Inconsistent technical references</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-cyan-300 mb-2">🚨 Warning</h3>
              <p>
                Be strategic. Direct accusations might cause the AI to reset. 
                Subtle, persistent questioning is key to uncovering the truth.
              </p>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GameInstructions;
