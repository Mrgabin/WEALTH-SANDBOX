import React, { useState } from 'react';
import { FullGlobalState } from '../types/wealth';
import { Play, Coins, Cpu, Award } from 'lucide-react';

interface PlinkoGameProps {
  state: FullGlobalState;
  onUpdateState: (newState: FullGlobalState) => void;
}

export const PlinkoGame: React.FC<PlinkoGameProps> = ({ state, onUpdateState }) => {
  const [plinkoBetAmount, setPlinkoBetAmount] = useState<number>(1000);
  const [plinkoDropping, setPlinkoDropping] = useState<boolean>(false);
  const [plinkoBallPos, setPlinkoBallPos] = useState<{ row: number; col: number } | null>(null);
  const [plinkoPath, setPlinkoPath] = useState<number[]>([]);
  const [plinkoResultMult, setPlinkoResultMult] = useState<number | null>(null);

  const currentPlayer = state.players[state.current_player_id] || Object.values(state.players)[0];

  const plinkoMultipliers = [12, 4, 1.5, 0.8, 0.3, 0.8, 1.5, 4, 12];

  const handleDropPlinko = () => {
    if (plinkoDropping) return;
    if (currentPlayer.bank_clean < plinkoBetAmount) {
      alert("Solde de banque propre insuffisant pour parier !");
      return;
    }

    setPlinkoDropping(true);
    setPlinkoResultMult(null);

    // Deduct bet immediately
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id] || next.players[next.current_player_id] || Object.values(next.players)[0];
    player.bank_clean -= plinkoBetAmount;
    onUpdateState(next);

    // Generate binomial path (8 steps)
    let current = 0;
    let path = [0];
    for (let r = 0; r < 8; r++) {
      const choice = Math.random() < 0.5 ? 0 : 1;
      current += choice;
      path.push(current);
    }
    setPlinkoPath(path);

    // Animate row by row
    let currentRow = -1;
    setPlinkoBallPos({ row: -1, col: 0 });

    const timer = setInterval(() => {
      currentRow++;
      if (currentRow <= 8) {
        setPlinkoBallPos({ row: currentRow, col: path[currentRow] });
      } else {
        clearInterval(timer);
        setPlinkoDropping(false);
        setPlinkoBallPos(null);

        // Map final column to multiplier
        const finalCol = path[8];
        const mult = plinkoMultipliers[finalCol];
        setPlinkoResultMult(mult);

        const payout = Math.round(plinkoBetAmount * mult);
        const endState = JSON.parse(JSON.stringify(next)) as FullGlobalState;
        const endPlayer = endState.players[currentPlayer.id] || endState.players[endState.current_player_id] || Object.values(endState.players)[0];

        endPlayer.bank_clean += payout;

        endState.logs.unshift({
          id: `log_plinko_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'CASINO',
          uid: endPlayer.id,
          message: `🔴 PLINKO : Puce de silicium tombée dans le canal ${finalCol} (x${mult} | Gain: +$${payout.toLocaleString()})`,
          status: mult >= 1.5 ? 'OK' : 'WARN'
        });

        onUpdateState(endState);
      }
    }, 180);
  };

  // Helper to get bucket color
  const getBucketBorderColor = (mult: number) => {
    if (mult >= 4) return 'border-red-500/50 text-red-400 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
    if (mult >= 1.5) return 'border-amber-500/50 text-amber-300 bg-amber-500/10';
    if (mult === 0.8) return 'border-blue-500/30 text-blue-300 bg-blue-500/5';
    return 'border-slate-500/30 text-slate-400 bg-slate-500/5';
  };

  return (
    <div className="bg-[#0F0F16] border border-pink-500/20 rounded-xl p-6 space-y-6 shadow-2xl font-mono">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <h3 className="text-sm font-bold text-pink-400 uppercase tracking-widest flex items-center gap-2">
          <Cpu className="w-4 h-4 text-pink-400" /> Silicon Plinko (RTP 97.0%)
        </h3>
        <span className="text-[10px] text-gray-500 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20 font-bold uppercase">
          Simulateur Électronique
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Grille de Plinko (8 colonnes / rangées) */}
        <div className="md:col-span-7 bg-[#08080C] p-6 rounded-xl border border-white/5 relative flex flex-col justify-between items-center overflow-hidden min-h-[320px]">
          {/* Top spawner peg indicator */}
          <div className="w-full flex justify-center mb-4">
            <div className={`w-3 h-3 rounded-full bg-slate-600 border border-white/20 relative flex items-center justify-center ${plinkoDropping && plinkoBallPos?.row === -1 ? 'bg-pink-500 shadow-[0_0_8px_#f43f5e]' : ''}`}>
              {plinkoDropping && plinkoBallPos?.row === -1 && (
                <span className="absolute w-2 h-2 rounded-full bg-pink-400 animate-ping" />
              )}
            </div>
          </div>

          {/* Peg grid rendering */}
          <div className="flex-1 flex flex-col justify-around w-full">
            {Array.from({ length: 8 }).map((_, rIndex) => (
              <div key={rIndex} className="flex justify-center gap-4 relative">
                {Array.from({ length: rIndex + 2 }).map((_, pIndex) => {
                  // Check if ball is on or touching this index
                  const isBallHere =
                    plinkoBallPos &&
                    plinkoBallPos.row === rIndex &&
                    plinkoBallPos.col === pIndex;

                  return (
                    <div
                      key={pIndex}
                      className={`w-1.5 h-1.5 rounded-full relative transition-all duration-150 ${
                        isBallHere
                          ? 'bg-pink-500 scale-150 shadow-[0_0_10px_#f43f5e] z-10'
                          : 'bg-slate-700/60'
                      }`}
                    >
                      {isBallHere && (
                        <span className="absolute -left-1 -top-1 w-3.5 h-3.5 rounded-full bg-pink-400 animate-ping opacity-75" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Buckets row */}
          <div className="grid grid-cols-9 gap-1 w-full border-t border-white/10 pt-4 mt-4">
            {plinkoMultipliers.map((mult, idx) => {
              const isLandedBucket = !plinkoDropping && plinkoResultMult === mult && plinkoPath[8] === idx;
              return (
                <div
                  key={idx}
                  className={`py-2 text-center rounded border text-[9px] font-bold font-mono uppercase tracking-tighter transition-all flex flex-col justify-center items-center ${getBucketBorderColor(mult)} ${
                    isLandedBucket ? 'scale-110 !border-pink-500 ring-2 ring-pink-500/40' : ''
                  }`}
                >
                  <span className="text-[7px] text-gray-500 block">x</span>
                  {mult}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contrôles de mise et résultats */}
        <div className="md:col-span-5 bg-[#08080C]/40 p-5 rounded-xl border border-white/5 space-y-5 self-stretch flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-[10px] uppercase block mb-1">Mise $ (Banque Propre)</label>
              <input
                type="number"
                value={plinkoBetAmount}
                onChange={(e) => setPlinkoBetAmount(Math.max(100, Number(e.target.value)))}
                disabled={plinkoDropping}
                className="w-full bg-[#08080C] border border-white/10 text-white p-2.5 rounded focus:outline-none focus:border-pink-400"
              />
            </div>

            {/* Quick selectors */}
            <div className="grid grid-cols-4 gap-1.5">
              {[100, 500, 1000, 5000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setPlinkoBetAmount(val)}
                  disabled={plinkoDropping}
                  className="py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-gray-400 hover:text-white transition cursor-pointer"
                >
                  ${val.toLocaleString()}
                </button>
              ))}
            </div>

            {plinkoResultMult !== null && (
              <div className={`p-4 rounded border text-center font-bold font-mono space-y-1 transition ${
                plinkoResultMult >= 1.5 
                  ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                <div className="text-[9px] uppercase tracking-wider text-gray-400">RÉSULTAT DU LÂCHER</div>
                <div className="text-xl">+{plinkoResultMult}x</div>
                <div className="text-xs">
                  Gain : ${Math.round(plinkoBetAmount * plinkoResultMult).toLocaleString()}
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={handleDropPlinko}
              disabled={plinkoDropping}
              className="w-full py-3 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-pink-300 font-bold transition flex items-center justify-center gap-2 cursor-pointer uppercase text-xs tracking-wider"
            >
              <Play className="w-4 h-4 text-pink-400" />
              {plinkoDropping ? 'Lancement en cours...' : `Lâcher la puce (-$${plinkoBetAmount.toLocaleString()})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
