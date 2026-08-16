import React, { useState } from 'react';
import { FullGlobalState } from '../types/wealth';
import { Play, Key, Eye } from 'lucide-react';

interface ShellGameProps {
  state: FullGlobalState;
  onUpdateState: (newState: FullGlobalState) => void;
}

export const ShellGame: React.FC<ShellGameProps> = ({ state, onUpdateState }) => {
  const [shellBetAmount, setShellBetAmount] = useState<number>(2000);
  const [shellStatus, setShellStatus] = useState<'idle' | 'shuffling' | 'ready' | 'revealed'>('idle');
  const [shellWinnerIdx, setShellWinnerIdx] = useState<number>(0);
  const [shellSelectedIdx, setShellSelectedIdx] = useState<number | null>(null);
  const [shellFeedback, setShellFeedback] = useState<string | null>(null);

  const currentPlayer = state.players[state.current_player_id] || Object.values(state.players)[0];

  const handleStartShellGame = () => {
    if (currentPlayer.bank_clean < shellBetAmount) {
      alert("Solde de banque propre insuffisant pour parier !");
      return;
    }

    setShellStatus('shuffling');
    setShellSelectedIdx(null);
    setShellFeedback("Mélange des ports USB en cours... Suivez attentivement !");

    // Deduct bet immediately
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id] || next.players[next.current_player_id] || Object.values(next.players)[0];
    player.bank_clean -= shellBetAmount;
    onUpdateState(next);

    setTimeout(() => {
      setShellWinnerIdx(Math.floor(Math.random() * 3));
      setShellStatus('ready');
      setShellFeedback("Clés USB mélangées ! Choisissez la clé USB dorée.");
    }, 1200);
  };

  const handleSelectShell = (idx: number) => {
    if (shellStatus !== 'ready') return;
    setShellSelectedIdx(idx);
    setShellStatus('revealed');

    const won = idx === shellWinnerIdx;
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id] || next.players[next.current_player_id] || Object.values(next.players)[0];

    if (won) {
      const payout = Math.round(shellBetAmount * 2.8);
      player.bank_clean += payout;
      setShellFeedback(`🎉 VICTOIRE ! La clé USB ${idx + 1} contenait bien la clé privée dorée Bitcoin ! Vous gagnez +$${payout.toLocaleString()}`);

      next.logs.unshift({
        id: `log_shell_win_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'CASINO',
        uid: player.id,
        message: `🔑 BONNETEAU : ${player.name} trouve la clé privée dorée sur la clé USB ${idx + 1} et gagne $${payout.toLocaleString()}`,
        status: 'OK'
      });
    } else {
      setShellFeedback(`💥 PERDU ! La clé privée était cachée sous la clé USB ${shellWinnerIdx + 1}. Celle-ci était corrompue !`);

      next.logs.unshift({
        id: `log_shell_lose_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'CASINO',
        uid: player.id,
        message: `🔑 BONNETEAU : ${player.name} échoue au bonneteau et perd sa mise de $${shellBetAmount.toLocaleString()}`,
        status: 'WARN'
      });
    }

    onUpdateState(next);
  };

  return (
    <div className="bg-[#0F0F16] border border-blue-500/20 rounded-xl p-6 space-y-6 shadow-2xl font-mono">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
          <Key className="w-4 h-4 text-blue-400" /> Bonneteau USB (RTP 96.0%)
        </h3>
        <span className="text-[10px] text-gray-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-bold uppercase">
          Recherche Privée
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Visualisation des Clés USB */}
        <div className="bg-[#08080C] p-6 rounded-xl border border-white/5 flex flex-col justify-center items-center space-y-6 min-h-[200px]">
          <div className="flex justify-center items-center gap-8 w-full">
            {Array.from({ length: 3 }).map((_, idx) => {
              let keyBg = 'bg-[#111118] border-white/10';
              let keyLabel = `Port USB ${idx + 1}`;

              if (shellStatus === 'shuffling') {
                keyBg = 'bg-blue-500/10 border-blue-500/30 animate-pulse';
              } else if (shellStatus === 'ready') {
                keyBg = 'bg-[#121224] border-blue-500/40 hover:border-blue-400 cursor-pointer shadow-lg hover:scale-105';
              } else if (shellStatus === 'revealed') {
                if (idx === shellWinnerIdx) {
                  keyBg = 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse';
                  keyLabel = '🔑 OR';
                } else if (idx === shellSelectedIdx) {
                  keyBg = 'bg-red-500/10 border-red-500/50 text-red-400';
                  keyLabel = '💥 CORROMPU';
                } else {
                  keyBg = 'bg-[#111] border-white/5 opacity-50 text-gray-600';
                  keyLabel = 'Vide';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectShell(idx)}
                  disabled={shellStatus !== 'ready'}
                  className={`w-20 h-24 rounded-xl border p-2 flex flex-col justify-between items-center transition ${keyBg}`}
                >
                  <Eye className={`w-6 h-6 ${shellStatus === 'ready' ? 'text-blue-400 animate-pulse' : 'text-slate-600'}`} />
                  <span className="text-[9px] font-bold block truncate max-w-full text-center">
                    {keyLabel}
                  </span>
                </button>
              );
            })}
          </div>

          <span className="text-[9px] text-gray-500 tracking-widest uppercase">
            {shellStatus === 'shuffling' ? 'Transposition des ports...' : shellStatus === 'ready' ? 'Sélectionnez un port' : 'Tirage terminé'}
          </span>
        </div>

        {/* Contrôles et Feedback */}
        <div className="space-y-4 bg-[#08080C]/40 p-5 rounded-xl border border-white/5 flex flex-col justify-between">
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="text-gray-400 text-[10px] uppercase block mb-1">MISE $ (BANQUE)</label>
              <input
                type="number"
                value={shellBetAmount}
                onChange={(e) => setShellBetAmount(Math.max(100, Number(e.target.value)))}
                disabled={shellStatus === 'shuffling' || shellStatus === 'ready'}
                className="w-full bg-[#08080C] border border-white/10 text-white p-2.5 rounded focus:outline-none focus:border-blue-400 font-bold"
              />
            </div>

            {shellFeedback && (
              <div className={`p-3 rounded border text-center font-bold text-[10px] leading-relaxed ${
                shellFeedback.includes('VICTOIRE') 
                  ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                  : shellFeedback.includes('PERDU')
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
              }`}>
                {shellFeedback}
              </div>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={handleStartShellGame}
              disabled={shellStatus === 'shuffling' || shellStatus === 'ready'}
              className="w-full py-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 font-bold transition flex items-center justify-center gap-2 cursor-pointer uppercase text-xs tracking-wider"
            >
              <Play className="w-4 h-4 text-blue-400" /> Mélanger & Lancer (-${shellBetAmount.toLocaleString()})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
