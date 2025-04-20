
import { GamePhase } from "../lib/gameLogic";

interface PhaseIndicatorProps {
  currentPhase: GamePhase;
}

const PhaseIndicator = ({ currentPhase }: PhaseIndicatorProps) => {
  const phases = [
    { name: "Denial", phase: GamePhase.Denial, color: "bg-cyan-700" },
    { name: "Doubt", phase: GamePhase.Doubt, color: "bg-cyan-600" },
    { name: "Conflict", phase: GamePhase.Conflict, color: "bg-blue-600" },
    { name: "Acceptance", phase: GamePhase.Acceptance, color: "bg-purple-600" },
    { name: "Truth", phase: GamePhase.Victory, color: "bg-amber-500" }
  ];

  return (
    <div className="flex items-center space-x-1">
      <span className="text-xs text-slate-400 mr-1">Phase:</span>
      {phases.map((phase, index) => (
        <div 
          key={index}
          className="flex flex-col items-center"
        >
          <div 
            className={`w-2 h-2 rounded-full ${
              currentPhase >= phase.phase ? phase.color : 'bg-slate-700'
            } ${
              currentPhase === phase.phase ? 'ring-1 ring-white' : ''
            }`} 
            title={phase.name}
          />
          {currentPhase === phase.phase && (
            <span className="text-xs font-medium text-slate-300 mt-1">
              {phase.name}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default PhaseIndicator;
