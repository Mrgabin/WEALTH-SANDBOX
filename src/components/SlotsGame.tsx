import React, { useState } from 'react';
import { FullGlobalState } from '../types/wealth';
import { Play, Sparkles, Trophy } from 'lucide-react';

interface SlotsGameProps {
  state: FullGlobalState;
  onUpdateState: (newState: FullGlobalState) => void;
}

export const SlotsGame: React.FC<SlotsGameProps> = ({ state, onUpdateState }) => {
  const [slotsBetAmount, setSlotsBetAmount] = useState<number>(1000);
  const [slotsReels, setSlotsReels] = useState<string[]>(['🎰', '🎰', '🎰']);
  const [slotsSpinning, setSlotsSpinning] = useState<boolean>(false);
  const [slotsFeedback, setSlotsFeedback] = useState<string | null>(null);

  const currentPlayer = state.players[state.current_player_id] || Object.values(state.players)[0];

  const handleSpinSlots = () => {
    if (currentPlayer.bank_clean < slotsBetAmount) {
      alert("Solde de banque propre insuffisant pour parier !");
      return;
    }

    setSlotsSpinning(true);
    setSlotsFeedback(null);

    // Deduct bet immediately
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id] || next.players[next.current_player_id] || Object.values(next.players)[0];
    player.bank_clean -= slotsBetAmount;
    onUpdateState(next);

    const symbols = ['🍏', '⚡', '📦', '🚀', '💎', '🎰'];

    let spins = 0;
    const timer = setInterval(() => {
      setSlotsReels([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
      ]);
      spins++;

      if (spins > 10) {
        clearInterval(timer);

        const r1 = symbols[Math.floor(Math.random() * symbols.length)];
        const r2 = symbols[Math.floor(Math.random() * symbols.length)];
        const r3 = symbols[Math.floor(Math.random() * symbols.length)];
        const finalReels = [r1, r2, r3];
        setSlotsReels(finalReels);
        setSlotsSpinning(false);

        let mult = 0;
        let isWin = false;

        if (r1 === r2 && r2 === r3) {
          isWin = true;
          if (r1 === '🎰') mult = 50;
          else if (r1 === '💎') mult = 25;
          else if (r1 === '⚡') mult = 15;
          else if (r1 === '🚀') mult = 10;
          else if (r1 === '📦') mult = 5;
          else mult = 3;
        } else if (r1 === r2 || r2 === r3 || r1 === r3) {
          isWin = true;
          mult = 1.5;
        }

        const endState = JSON.parse(JSON.stringify(next)) as FullGlobalState;
        const endPlayer = endState.players[currentPlayer.id] || endState.players[endState.current_player_id] || Object.values(endState.players)[0];

        if (isWin) {
          const payout = Math.round(slotsBetAmount * mult);
          endPlayer.bank_clean += payout;
          setSlotsFeedback(`🎉 COMBO GAGNANT ! Alignement [${finalReels.join(' ')}]. Multiplicateur x${mult} : +$${payout.toLocaleString()}`);

          endState.logs.unshift({
            id: `log_slots_win_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            type: 'CASINO',
            uid: endPlayer.id,
            message: `🎰 GPU JACKPOT : ${endPlayer.name} aligne [${finalReels.join(' ')}] et gagne $${payout.toLocaleString()} !`,
            status: 'OK'
          });
        } else {
          setSlotsFeedback(`💥 PERDU ! Combinaison perdante [${finalReels.join(' ')}]. Retentez votre chance !`);
          endState.logs.unshift({
            id: `log_slots_lose_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            type: 'CASINO',
            uid: endPlayer.id,
            message: `🎰 SLOTS : ${endPlayer.name} perd sa mise de $${slotsBetAmount.toLocaleString()} [${finalReels.join(' ')}]`,
            status: 'WARN'
          });
        }

        onUpdateState(endState);
      }
    }, 100);
  };

  return (
    <div className="bg-[#0F0F16] border border-violet-500/20 rounded-xl p-6 space-y-6 shadow-2xl font-mono">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <h3 className="text-sm font-bold text-violet-400 uppercase tracking-widest flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400" /> Jackpot GPU (RTP 96.0%)
        </h3>
        <span className="text-[10px] text-gray-500 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20 font-bold uppercase">
          Mining Wheel
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Rouleaux Animés */}
        <div className="bg-[#08080C] p-6 rounded-xl border border-white/5 flex flex-col justify-center items-center space-y-6 min-h-[220px]">
          <div className="flex gap-4">
            {slotsReels.map((symbol, idx) => (
              <div
                key={idx}
                className={`w-16 h-20 bg-gradient-to-br from-[#111] to-[#151522] border rounded-xl flex items-center justify-center text-4xl shadow-xl transition-all ${
                  slotsSpinning ? 'animate-bounce border-violet-500/30' : 'border-white/10'
                }`}
              >
                {symbol}
              </div>
            ))}
          </div>

          <span className="text-[9px] text-gray-500 tracking-widest uppercase">
            {slotsSpinning ? "Calcul de l'alignement..." : "GPU en veille"}
          </span>
        </div>

        {/* Mises et Table des gains */}
        <div className="space-y-4 bg-[#08080C]/40 p-5 rounded-xl border border-white/5 flex flex-col justify-between">
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="text-gray-400 text-[10px] uppercase block mb-1">MISE $ (BANQUE)</label>
              <input
                type="number"
                value={slotsBetAmount}
                onChange={(e) => setSlotsBetAmount(Math.max(100, Number(e.target.value)))}
                disabled={slotsSpinning}
                className="w-full bg-[#08080C] border border-white/10 text-white p-2.5 rounded focus:outline-none focus:border-violet-400 font-bold"
              />
            </div>

            {slotsFeedback && (
              <div className={`p-3 rounded border text-center font-bold text-[10px] leading-relaxed ${
                slotsFeedback.includes('COMBO') 
                  ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {slotsFeedback}
              </div>
            )}

            {/* Table des gains simplifiée */}
            <div className="bg-[#08080C] p-2.5 rounded border border-white/5 space-y-1 text-[9px] text-gray-500 font-mono">
              <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">COMBINAISONS (3 ALIGNÉS)</span>
              <div className="flex justify-between"><span>🎰 🎰 🎰 Jackpot Royal</span> <span className="text-amber-400 font-bold">50x</span></div>
              <div className="flex justify-between"><span>💎 💎 💎 Diamant Pur</span> <span className="text-violet-400 font-bold">25x</span></div>
              <div className="flex justify-between"><span>⚡ ⚡ ⚡ Haute Tension</span> <span className="text-cyan-400 font-bold">15x</span></div>
              <div className="flex justify-between"><span>🚀 🚀 🚀 Fusée Cyber</span> <span className="text-pink-400 font-bold">10x</span></div>
              <div className="flex justify-between"><span>📦 📦 📦 Serveur Node</span> <span className="text-indigo-400 font-bold">5x</span></div>
              <div className="flex justify-between"><span>🍏 🍏 🍏 Pomme d'or</span> <span className="text-green-400 font-bold">3x</span></div>
              <div className="flex justify-between border-t border-white/5 pt-1 mt-1 text-[10px] text-gray-400"><span>Cibles doublées (2 identiques)</span> <span className="font-bold text-emerald-400">1.5x</span></div>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleSpinSlots}
              disabled={slotsSpinning}
              className="w-full py-3 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40 text-violet-300 font-bold transition flex items-center justify-center gap-2 cursor-pointer uppercase text-xs tracking-wider"
            >
              <Trophy className="w-4 h-4 text-violet-400" /> Actionner le Levier (-${slotsBetAmount.toLocaleString()})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
