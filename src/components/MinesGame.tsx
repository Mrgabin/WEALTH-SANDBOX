import React, { useState } from 'react';
import { FullGlobalState } from '../types/wealth';
import { Play, ShieldAlert, ShieldCheck, Flame, Coins, Zap } from 'lucide-react';

interface MinesGameProps {
  state: FullGlobalState;
  onUpdateState: (newState: FullGlobalState) => void;
}

interface MineCell {
  isMine: boolean;
  revealed: boolean;
}

export const MinesGame: React.FC<MinesGameProps> = ({ state, onUpdateState }) => {
  const [minesBetAmount, setMinesBetAmount] = useState<number>(5000);
  const [minesCount, setMinesCount] = useState<number>(3);
  const [minesStatus, setMinesStatus] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [minesGrid, setMinesGrid] = useState<MineCell[]>([]);
  const [minesRevealedCount, setMinesRevealedCount] = useState<number>(0);
  const [minesMultiplier, setMinesMultiplier] = useState<number>(1.00);
  const [minesFeedback, setMinesFeedback] = useState<string | null>(null);

  const currentPlayer = state.players[state.current_player_id] || Object.values(state.players)[0];

  const getMinesMultiplier = (totalMines: number, revealedSafe: number): number => {
    if (revealedSafe === 0) return 1.00;
    let prob = 1.0;
    const totalSafe = 25 - totalMines;
    for (let i = 0; i < revealedSafe; i++) {
      prob *= (totalSafe - i) / (25 - i);
    }
    // Apply a fair 3.5% house edge
    const rawMultiplier = 0.965 / prob;
    return Number(Math.max(1.01, rawMultiplier).toFixed(2));
  };

  const handleStartMines = () => {
    if (currentPlayer.bank_clean < minesBetAmount) {
      alert("Solde de banque propre insuffisant pour parier !");
      return;
    }
    if (minesCount < 1 || minesCount > 24) {
      alert("Le nombre de virus doit être compris entre 1 et 24 !");
      return;
    }

    // Deduct bet immediately
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id] || next.players[next.current_player_id] || Object.values(next.players)[0];
    player.bank_clean -= minesBetAmount;

    // Create grid
    let grid: MineCell[] = Array(25).fill(null).map(() => ({ isMine: false, revealed: false }));
    let placed = 0;
    while (placed < minesCount) {
      const idx = Math.floor(Math.random() * 25);
      if (!grid[idx].isMine) {
        grid[idx].isMine = true;
        placed++;
      }
    }

    setMinesGrid(grid);
    setMinesRevealedCount(0);
    setMinesMultiplier(1.00);
    setMinesStatus('playing');
    setMinesFeedback("Exploration réseau commencée. Évitez les nœuds infectés !");
    onUpdateState(next);
  };

  const handleRevealCell = (index: number) => {
    if (minesStatus !== 'playing' || minesGrid[index].revealed) return;

    const cell = minesGrid[index];
    const newGrid = [...minesGrid];
    newGrid[index] = { ...cell, revealed: true };
    setMinesGrid(newGrid);

    if (cell.isMine) {
      // Hit a mine! Boom!
      setMinesStatus('ended');
      setMinesFeedback("💥 ERREUR CRITIQUE ! Vous avez heurté un Cheval de Troie ! Cryptage corrompu et mise perdue.");
      
      // Reveal all mines visually
      setMinesGrid(newGrid.map(c => c.isMine ? { ...c, revealed: true } : c));

      const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
      const player = next.players[currentPlayer.id] || next.players[next.current_player_id] || Object.values(next.players)[0];
      next.logs.unshift({
        id: `log_mines_lose_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'CASINO',
        uid: player.id,
        message: `💥 MINES : ${player.name} s'est fait pirater par un Cheval de Troie (Mise: $${minesBetAmount.toLocaleString()})`,
        status: 'WARN'
      });
      onUpdateState(next);
    } else {
      const nextRevealedCount = minesRevealedCount + 1;
      setMinesRevealedCount(nextRevealedCount);

      const nextMult = getMinesMultiplier(minesCount, nextRevealedCount);
      setMinesMultiplier(nextMult);

      const totalSafe = 25 - minesCount;
      if (nextRevealedCount === totalSafe) {
        // Automatic flawless sweep win!
        setMinesStatus('ended');
        const payout = Math.round(minesBetAmount * nextMult);
        setMinesFeedback(`🎉 PARFAIT ! Tous les serveurs sains décryptés ! +$${payout.toLocaleString()} (x${nextMult})`);

        const nextStateObj = JSON.parse(JSON.stringify(state)) as FullGlobalState;
        const player = nextStateObj.players[currentPlayer.id] || nextStateObj.players[nextStateObj.current_player_id] || Object.values(nextStateObj.players)[0];
        player.bank_clean += payout;

        nextStateObj.logs.unshift({
          id: `log_mines_perfect_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'CASINO',
          uid: player.id,
          message: `🏆 DECRYPTAGE PARFAIT : ${player.name} démine 100% de la grille et gagne $${payout.toLocaleString()} (Multiplier x${nextMult}) !`,
          status: 'OK'
        });
        onUpdateState(nextStateObj);
      } else {
        setMinesFeedback(`✅ Nœud sain décrypté ! Multiplicateur actuel : x${nextMult}. Continuez ou sécurisez vos gains !`);
      }
    }
  };

  const handleMinesCashout = () => {
    if (minesStatus !== 'playing' || minesRevealedCount === 0) return;

    setMinesStatus('ended');
    const payout = Math.round(minesBetAmount * minesMultiplier);
    setMinesFeedback(`💰 RETRAIT SÉCURISÉ ! Gain de +$${payout.toLocaleString()} (x${minesMultiplier.toFixed(2)}) crédité !`);

    // Reveal the rest of the board for transparency
    setMinesGrid(minesGrid.map(c => ({ ...c, revealed: true })));

    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id] || next.players[next.current_player_id] || Object.values(next.players)[0];
    player.bank_clean += payout;

    next.logs.unshift({
      id: `log_mines_cashout_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'CASINO',
      uid: player.id,
      message: `💰 MINES CASHOUT : ${player.name} sécurise $${payout.toLocaleString()} (x${minesMultiplier.toFixed(2)}, ${minesRevealedCount} nœuds sains décryptés)`,
      status: 'OK'
    });
    onUpdateState(next);
  };

  return (
    <div className="bg-[#0F0F16] border border-cyan-500/20 rounded-xl p-6 space-y-6 shadow-2xl font-mono">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" /> Mines : Server Decrypt (RTP 96.5%)
        </h3>
        <span className="text-[10px] text-gray-500 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-bold uppercase">
          Sécurité Réseau
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Grille 5x5 de serveurs */}
        <div className="flex justify-center items-center">
          <div className="grid grid-cols-5 gap-2 bg-[#08080C] p-4 rounded-xl border border-white/5 max-w-[280px]">
            {minesStatus === 'idle' ? (
              Array(25).fill(null).map((_, idx) => (
                <div
                  key={idx}
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-700 opacity-60 text-[10px]"
                >
                  OFF
                </div>
              ))
            ) : (
              minesGrid.map((cell, idx) => {
                let cellColor = "bg-[#111118] border-white/10 hover:border-cyan-500/30 text-gray-500 cursor-pointer";
                if (cell.revealed) {
                  if (cell.isMine) {
                    cellColor = "bg-red-500/20 border-red-500 text-red-400 animate-pulse";
                  } else {
                    cellColor = "bg-green-500/20 border-green-500 text-green-400";
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleRevealCell(idx)}
                    disabled={minesStatus !== 'playing' || cell.revealed}
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center font-bold text-xs transition ${cellColor}`}
                  >
                    {cell.revealed ? (
                      cell.isMine ? <Flame className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />
                    ) : (
                      "?"
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Contrôles et stats */}
        <div className="space-y-4 bg-[#08080C]/40 p-5 rounded-xl border border-white/5 self-stretch flex flex-col justify-between">
          <div className="space-y-3.5 text-xs">
            {/* Bet and Mine choice inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-[10px] uppercase block mb-1">MISE $ (BANQUE)</label>
                <input
                  type="number"
                  value={minesBetAmount}
                  onChange={(e) => setMinesBetAmount(Math.max(100, Number(e.target.value)))}
                  disabled={minesStatus === 'playing'}
                  className="w-full bg-[#08080C] border border-white/10 text-white p-2.5 rounded focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-gray-400 text-[10px] uppercase block mb-1">VIRUS / TROJANS</label>
                <select
                  value={minesCount}
                  onChange={(e) => setMinesCount(Number(e.target.value))}
                  disabled={minesStatus === 'playing'}
                  className="w-full bg-[#08080C] border border-white/10 text-white p-2.5 rounded focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Current payout recap */}
            {minesStatus === 'playing' && (
              <div className="p-3 bg-[#08080C] rounded border border-cyan-500/20 text-center space-y-1">
                <span className="text-[10px] text-gray-400 block uppercase">GAIN POTENTIEL</span>
                <span className="text-lg font-bold text-green-400 flex justify-center items-center gap-1">
                  <Coins className="w-4 h-4 text-green-400" />
                  ${Math.round(minesBetAmount * minesMultiplier).toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-500 block">
                  ({minesRevealedCount} nœuds sains • Multiplicateur : x{minesMultiplier.toFixed(2)})
                </span>
              </div>
            )}

            {minesFeedback && (
              <div className={`p-3 rounded border text-center font-bold text-[10px] leading-relaxed ${
                minesFeedback.includes('CRITIQUE') 
                  ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                  : minesFeedback.includes('SÉCURISÉ') || minesFeedback.includes('PARFAIT')
                  ? 'bg-green-500/10 border-green-500/20 text-green-400'
                  : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
              }`}>
                {minesFeedback}
              </div>
            )}
          </div>

          <div>
            {minesStatus !== 'playing' ? (
              <button
                type="button"
                onClick={handleStartMines}
                className="w-full py-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold transition flex items-center justify-center gap-2 cursor-pointer uppercase text-xs tracking-wider"
              >
                <Play className="w-4 h-4 text-cyan-400" /> Commencer le scan (-${minesBetAmount.toLocaleString()})
              </button>
            ) : (
              <button
                type="button"
                onClick={handleMinesCashout}
                disabled={minesRevealedCount === 0}
                className="w-full py-3 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-300 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer uppercase text-xs tracking-wider"
              >
                <Zap className="w-4 h-4 text-green-400" /> Cash Out : Encasser $
                {Math.round(minesBetAmount * minesMultiplier).toLocaleString()} (x{minesMultiplier})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
