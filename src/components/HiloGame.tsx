import React, { useState } from 'react';
import { FullGlobalState } from '../types/wealth';
import { Play, ArrowUp, ArrowDown, Coins, Zap } from 'lucide-react';

interface HiloGameProps {
  state: FullGlobalState;
  onUpdateState: (newState: FullGlobalState) => void;
}

export const HiloGame: React.FC<HiloGameProps> = ({ state, onUpdateState }) => {
  const [hiloBetAmount, setHiloBetAmount] = useState<number>(2000);
  const [hiloStatus, setHiloStatus] = useState<'idle' | 'playing'>('idle');
  const [hiloCurrentVal, setHiloCurrentVal] = useState<number>(50);
  const [hiloNextVal, setHiloNextVal] = useState<number | null>(null);
  const [hiloStreak, setHiloStreak] = useState<number>(0);
  const [hiloMultiplier, setHiloMultiplier] = useState<number>(1.00);
  const [hiloFeedback, setHiloFeedback] = useState<string | null>(null);

  const currentPlayer = state.players[state.current_player_id] || Object.values(state.players)[0];

  const handleStartHilo = () => {
    if (currentPlayer.bank_clean < hiloBetAmount) {
      alert("Solde de banque propre insuffisant pour parier !");
      return;
    }

    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id] || next.players[next.current_player_id] || Object.values(next.players)[0];
    player.bank_clean -= hiloBetAmount;

    setHiloCurrentVal(Math.floor(Math.random() * 85) + 8); // Start between 8 and 92
    setHiloNextVal(null);
    setHiloStreak(0);
    setHiloMultiplier(1.00);
    setHiloStatus('playing');
    setHiloFeedback("Crypto-vague initialisée ! Devinez si le prochain bloc sera Plus Haut ou Plus Bas.");
    onUpdateState(next);
  };

  const handleHiloGuess = (guess: 'HIGH' | 'LOW') => {
    if (hiloStatus !== 'playing') return;

    // Roll next number distinct from current
    let rolled = Math.floor(Math.random() * 99) + 1;
    while (rolled === hiloCurrentVal) {
      rolled = Math.floor(Math.random() * 99) + 1;
    }

    setHiloNextVal(rolled);

    const isHighWin = rolled > hiloCurrentVal;
    const isCorrect = (guess === 'HIGH' && isHighWin) || (guess === 'LOW' && !isHighWin);

    if (isCorrect) {
      // Calculate probability of correct guess
      let prob = 1.0;
      if (guess === 'HIGH') {
        prob = (100 - hiloCurrentVal) / 99;
      } else {
        prob = (hiloCurrentVal - 1) / 99;
      }

      // Safeguard boundaries to avoid infinite or zero payouts
      prob = Math.max(0.08, Math.min(0.92, prob));
      // Applying a 3% house edge
      const stepMultiplierFactor = 0.97 / prob;
      const nextMult = Number((hiloMultiplier * stepMultiplierFactor).toFixed(2));

      setHiloStreak(prev => prev + 1);
      setHiloMultiplier(nextMult);
      setHiloFeedback(`✅ CORRECT ! La tendance passe de ${hiloCurrentVal} à ${rolled}. Multiplicateur : x${nextMult}`);
      setHiloCurrentVal(rolled);
    } else {
      setHiloStatus('idle');
      setHiloFeedback(`💥 FIN DE SÉRIE ! La tendance passe de ${hiloCurrentVal} à ${rolled}. Vous perdez la mise.`);

      const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
      const player = next.players[currentPlayer.id] || next.players[next.current_player_id] || Object.values(next.players)[0];
      next.logs.unshift({
        id: `log_hilo_lose_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'CASINO',
        uid: player.id,
        message: `📈 HILO : ${player.name} s'est trompé de tendance (${rolled} vs ${hiloCurrentVal}) et perd sa mise de $${hiloBetAmount.toLocaleString()}`,
        status: 'WARN'
      });
      onUpdateState(next);
    }
  };

  const handleHiloCashout = () => {
    if (hiloStatus !== 'playing' || hiloStreak === 0) return;

    setHiloStatus('idle');
    const payout = Math.round(hiloBetAmount * hiloMultiplier);
    setHiloFeedback(`🎉 RETRAIT RÉUSSI ! Gain de +$${payout.toLocaleString()} sécurisé !`);

    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id] || next.players[next.current_player_id] || Object.values(next.players)[0];
    player.bank_clean += payout;

    next.logs.unshift({
      id: `log_hilo_cashout_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'CASINO',
      uid: player.id,
      message: `💰 HILO CASHOUT : ${player.name} s'arrête à un streak de ${hiloStreak} (x${hiloMultiplier.toFixed(2)} | Gain: +$${payout.toLocaleString()})`,
      status: 'OK'
    });
    onUpdateState(next);
  };

  return (
    <div className="bg-[#0F0F16] border border-amber-500/20 rounded-xl p-6 space-y-6 shadow-2xl font-mono">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" /> Hi-Lo: Crypto Charts (RTP 97.0%)
        </h3>
        <span className="text-[10px] text-gray-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold uppercase">
          Analyse Technique
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Terminal Visuel */}
        <div className="bg-[#08080C] p-6 rounded-xl border border-white/5 flex flex-col justify-between space-y-4 min-h-[250px]">
          <div className="text-center space-y-2">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest block">INDICE CRYPTO ACTUEL</span>
            <div className="text-5xl font-black tracking-tight text-amber-400 font-sans animate-pulse">
              {hiloCurrentVal} <span className="text-xs text-amber-600">µBTC</span>
            </div>
            {hiloNextVal !== null && (
              <span className="text-[10px] text-gray-400 block font-mono">
                Dernier tirage : {hiloNextVal} µBTC
              </span>
            )}
          </div>

          {/* Sizing of probabilities */}
          {hiloStatus === 'playing' && (
            <div className="grid grid-cols-2 gap-2 text-center text-[10px] text-gray-400">
              <div className="bg-white/5 p-2 rounded border border-white/5">
                <span>CHANCE HAUT (▲)</span>
                <span className="block font-bold text-green-400 mt-0.5">
                  {Math.round(((100 - hiloCurrentVal) / 99) * 100)}%
                </span>
              </div>
              <div className="bg-white/5 p-2 rounded border border-white/5">
                <span>CHANCE BAS (▼)</span>
                <span className="block font-bold text-indigo-400 mt-0.5">
                  {Math.round(((hiloCurrentVal - 1) / 99) * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Contrôles et Feedback */}
        <div className="space-y-4 bg-[#08080C]/40 p-5 rounded-xl border border-white/5 flex flex-col justify-between">
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="text-gray-400 text-[10px] uppercase block mb-1">Mise $ (Banque Propre)</label>
              <input
                type="number"
                value={hiloBetAmount}
                onChange={(e) => setHiloBetAmount(Math.max(100, Number(e.target.value)))}
                disabled={hiloStatus === 'playing'}
                className="w-full bg-[#08080C] border border-white/10 text-white p-2.5 rounded focus:outline-none focus:border-amber-400"
              />
            </div>

            {hiloStatus === 'playing' && (
              <div className="p-3 bg-[#08080C] rounded border border-amber-500/20 text-center space-y-1">
                <span className="text-[10px] text-gray-400 block uppercase">SÉRIE EN COURS</span>
                <span className="text-lg font-bold text-green-400 flex justify-center items-center gap-1">
                  <Coins className="w-4 h-4 text-green-400" />
                  ${Math.round(hiloBetAmount * hiloMultiplier).toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-500 block">
                  ({hiloStreak} suppositions • Multiplicateur : x{hiloMultiplier.toFixed(2)})
                </span>
              </div>
            )}

            {hiloFeedback && (
              <div className={`p-3 rounded border text-center font-bold text-[10px] leading-relaxed ${
                hiloFeedback.includes('CORRECT') 
                  ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                  : hiloFeedback.includes('RÉUSSI')
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  : hiloFeedback.includes('FIN')
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}>
                {hiloFeedback}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {hiloStatus !== 'playing' ? (
              <button
                type="button"
                onClick={handleStartHilo}
                className="w-full py-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold transition flex items-center justify-center gap-2 cursor-pointer uppercase text-xs tracking-wider"
              >
                <Play className="w-4 h-4 text-amber-400" /> Commencer le trade (-${hiloBetAmount.toLocaleString()})
              </button>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleHiloGuess('HIGH')}
                    className="py-3 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-300 font-bold transition flex items-center justify-center gap-1 cursor-pointer text-xs uppercase"
                  >
                    <ArrowUp className="w-4 h-4" /> Plus Haut (▲)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleHiloGuess('LOW')}
                    className="py-3 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 font-bold transition flex items-center justify-center gap-1 cursor-pointer text-xs uppercase"
                  >
                    <ArrowDown className="w-4 h-4" /> Plus Bas (▼)
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleHiloCashout}
                  disabled={hiloStreak === 0}
                  className="w-full py-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold transition flex items-center justify-center gap-1 cursor-pointer uppercase text-xs"
                >
                  💰 Retrait Trade : Encaisser $
                  {Math.round(hiloBetAmount * hiloMultiplier).toLocaleString()}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
