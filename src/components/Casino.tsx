import React, { useState, useEffect } from 'react';
import { FullGlobalState } from '../types/wealth';
import { Dices, Trophy, Zap, AlertTriangle, Play, RefreshCw, Layers } from 'lucide-react';

interface CasinoProps {
  state: FullGlobalState;
  onUpdateState: (newState: FullGlobalState) => void;
}

export const Casino: React.FC<CasinoProps> = ({ state, onUpdateState }) => {
  const [activeGame, setActiveGame] = useState<'roulette' | 'blackjack' | 'slots' | 'crash' | 'plinko'>('roulette');
  const currentPlayer = state.players[state.current_player_id] || Object.values(state.players)[0];

  // ---------------- ROULETTE STATE ----------------
  const [rouletteBetAmount, setRouletteBetAmount] = useState<number>(1000);
  const [rouletteBetType, setRouletteBetType] = useState<'RED' | 'BLACK' | 'NUMBER_17'>('RED');
  const [rouletteHistory, setRouletteHistory] = useState<number[]>([17, 32, 15, 0, 26, 3]);
  const [rouletteSpinning, setRouletteSpinning] = useState(false);
  const [rouletteResult, setRouletteResult] = useState<number | null>(null);

  const handleSpinRoulette = () => {
    if (currentPlayer.cash_dirty < rouletteBetAmount && currentPlayer.bank_clean < rouletteBetAmount) {
      alert("Fonds insuffisants pour miser!");
      return;
    }

    setRouletteSpinning(true);
    setTimeout(() => {
      const landedNum = Math.floor(Math.random() * 37); // 0-36
      setRouletteResult(landedNum);
      setRouletteHistory(prev => [landedNum, ...prev.slice(0, 9)]);
      setRouletteSpinning(false);

      const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
      const player = next.players[currentPlayer.id];

      const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
      const isRed = redNumbers.includes(landedNum);
      let won = false;
      let payout = 0;

      if (rouletteBetType === 'RED' && isRed) {
        won = true;
        payout = rouletteBetAmount * 2;
      } else if (rouletteBetType === 'BLACK' && !isRed && landedNum !== 0) {
        won = true;
        payout = rouletteBetAmount * 2;
      } else if (rouletteBetType === 'NUMBER_17' && landedNum === 17) {
        won = true;
        payout = rouletteBetAmount * 36;
      }

      if (won) {
        player.bank_clean += payout - rouletteBetAmount;
        alert(`🎉 BRAVO! Vous gagnez $${payout.toLocaleString()} à la Roulette (Numéro ${landedNum})!`);
      } else {
        if (player.cash_dirty >= rouletteBetAmount) player.cash_dirty -= rouletteBetAmount;
        else player.bank_clean -= rouletteBetAmount;
      }

      onUpdateState(next);
    }, 1200);
  };

  // ---------------- CRASH GAME STATE ----------------
  const [crashBetAmount, setCrashBetAmount] = useState<number>(5000);
  const [crashMultiplier, setCrashMultiplier] = useState<number>(1.00);
  const [crashRunning, setCrashRunning] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);

  const startCrashGame = () => {
    if (currentPlayer.bank_clean < crashBetAmount) {
      alert("Solde bancaire insuffisant pour le Crash Game!");
      return;
    }

    setCrashRunning(true);
    setCrashed(false);
    setCashedOut(false);
    setCrashMultiplier(1.00);

    const crashAt = 1.05 + Math.random() * Math.random() * 8.0; // random multiplier curve

    const interval = setInterval(() => {
      setCrashMultiplier(prev => {
        const nextMult = Number((prev + 0.05).toFixed(2));
        if (nextMult >= crashAt) {
          clearInterval(interval);
          setCrashRunning(false);
          setCrashed(true);
          return crashAt;
        }
        return nextMult;
      });
    }, 100);
  };

  const handleCashoutCrash = () => {
    if (!crashRunning || cashedOut) return;
    setCashedOut(true);
    setCrashRunning(false);

    const winAmount = Math.round(crashBetAmount * crashMultiplier);
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id];
    player.bank_clean += winAmount - crashBetAmount;

    alert(`💰 CASH OUT RÉUSSI! x${crashMultiplier.toFixed(2)} -> Vous gagnez $${winAmount.toLocaleString()}!`);
    onUpdateState(next);
  };

  return (
    <div className="space-y-6">
      {/* Header & Mini-Game Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <Dices className="w-5 h-5 text-amber-400" />
            Casino Virtuel & Probabilités Mathématiques
          </h1>
          <p className="text-xs text-gray-400">
            Roulette certifiée, Blackjack avec comptage Hi-Lo, Slots et Crash Game à courbe exponentielle.
          </p>
        </div>

        <div className="flex bg-[#0F0F16] p-1 rounded-lg border border-white/10 font-mono text-xs flex-wrap">
          <button
            onClick={() => setActiveGame('roulette')}
            className={`px-3 py-1.5 rounded transition cursor-pointer ${
              activeGame === 'roulette' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-gray-400 hover:text-white'
            }`}
          >
            Roulette (RTP 97.3%)
          </button>
          <button
            onClick={() => setActiveGame('crash')}
            className={`px-3 py-1.5 rounded transition cursor-pointer ${
              activeGame === 'crash' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-gray-400 hover:text-white'
            }`}
          >
            Crash Game (RTP 98%)
          </button>
        </div>
      </div>

      {/* GAME 1: ROULETTE */}
      {activeGame === 'roulette' && (
        <div className="bg-[#0F0F16] border border-amber-500/20 rounded-xl p-6 space-y-6 shadow-2xl">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h3 className="text-sm font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Roulette Européenne (37 Cases 0-36)
            </h3>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-gray-400">Historique:</span>
              {rouletteHistory.map((num, i) => (
                <span key={i} className={`px-1.5 py-0.5 rounded font-bold ${num === 0 ? 'bg-green-500/20 text-green-400' : num % 2 === 0 ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-white'}`}>
                  {num}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Roulette Wheel Visualizer */}
            <div className="bg-[#08080C] p-8 rounded-xl border border-white/5 flex flex-col items-center justify-center space-y-4">
              <div className={`w-32 h-32 rounded-full border-4 border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-red-500/10 flex items-center justify-center font-mono text-3xl font-extrabold text-amber-300 ${rouletteSpinning ? 'animate-spin' : ''}`}>
                {rouletteResult !== null ? rouletteResult : 'Ω'}
              </div>
              <p className="text-xs font-mono text-gray-400">
                {rouletteSpinning ? 'Lancement de la bille...' : rouletteResult !== null ? `Résultat: Numéro ${rouletteResult}` : 'Placez vos jetons'}
              </p>
            </div>

            {/* Betting Controls */}
            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-gray-400 text-[10px] uppercase block mb-1">Mise en $ (Cash ou Banque)</label>
                <input
                  type="number"
                  value={rouletteBetAmount}
                  onChange={(e) => setRouletteBetAmount(Number(e.target.value))}
                  className="w-full bg-[#08080C] border border-white/10 text-white p-2.5 rounded focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-gray-400 text-[10px] uppercase block mb-1">Type de Pari</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setRouletteBetType('RED')}
                    className={`p-2.5 rounded border transition cursor-pointer font-bold ${rouletteBetType === 'RED' ? 'bg-red-500/30 border-red-500 text-red-300' : 'bg-[#08080C] border-white/10 text-gray-400'}`}
                  >
                    ROUGE (1:1)
                  </button>
                  <button
                    onClick={() => setRouletteBetType('BLACK')}
                    className={`p-2.5 rounded border transition cursor-pointer font-bold ${rouletteBetType === 'BLACK' ? 'bg-gray-700 border-white text-white' : 'bg-[#08080C] border-white/10 text-gray-400'}`}
                  >
                    NOIR (1:1)
                  </button>
                  <button
                    onClick={() => setRouletteBetType('NUMBER_17')}
                    className={`p-2.5 rounded border transition cursor-pointer font-bold ${rouletteBetType === 'NUMBER_17' ? 'bg-amber-500/30 border-amber-500 text-amber-300' : 'bg-[#08080C] border-white/10 text-gray-400'}`}
                  >
                    PLEIN 17 (35:1)
                  </button>
                </div>
              </div>

              <button
                disabled={rouletteSpinning}
                onClick={handleSpinRoulette}
                className="w-full py-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" /> Tourner la Roulette
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GAME 2: CRASH GAME */}
      {activeGame === 'crash' && (
        <div className="bg-[#0F0F16] border border-amber-500/20 rounded-xl p-6 space-y-6 shadow-2xl font-mono">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4" /> Crash Game Exponential Multiplier
            </h3>
            <span className="text-xs text-gray-400">RTP: 98.0%</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Multiplier Display */}
            <div className="bg-[#08080C] p-10 rounded-xl border border-white/5 flex flex-col items-center justify-center space-y-2">
              <span className={`text-5xl font-extrabold tracking-tight ${crashed ? 'text-red-500' : cashedOut ? 'text-green-400' : 'text-amber-400'}`}>
                {crashMultiplier.toFixed(2)}x
              </span>
              <p className="text-xs text-gray-400">
                {crashed ? '💥 CRASHED!' : cashedOut ? '✅ CASH OUT RÉUSSI!' : crashRunning ? 'En montée...' : 'Prêt à lancer'}
              </p>
            </div>

            {/* Controls */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-gray-400 text-[10px] uppercase block mb-1">Mise $ (Clean Bank)</label>
                <input
                  type="number"
                  value={crashBetAmount}
                  onChange={(e) => setCrashBetAmount(Number(e.target.value))}
                  disabled={crashRunning}
                  className="w-full bg-[#08080C] border border-white/10 text-white p-2.5 rounded focus:outline-none focus:border-amber-400"
                />
              </div>

              {!crashRunning ? (
                <button
                  onClick={startCrashGame}
                  className="w-full py-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" /> Démarrer la Fusée
                </button>
              ) : (
                <button
                  onClick={handleCashoutCrash}
                  disabled={cashedOut}
                  className="w-full py-3 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-300 font-bold transition cursor-pointer flex items-center justify-center gap-2"
                >
                  CASH OUT A {crashMultiplier.toFixed(2)}x (${Math.round(crashBetAmount * crashMultiplier).toLocaleString()})
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
