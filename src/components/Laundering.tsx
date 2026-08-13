import React, { useState } from 'react';
import { FullGlobalState } from '../types/wealth';
import { DollarSign, ShieldAlert, Sparkles, Building, Landmark, AlertTriangle } from 'lucide-react';

interface LaunderingProps {
  state: FullGlobalState;
  onUpdateState: (newState: FullGlobalState) => void;
}

export const Laundering: React.FC<LaunderingProps> = ({ state, onUpdateState }) => {
  const currentPlayer = state.players[state.current_player_id] || Object.values(state.players)[0];
  const playerBusinesses = state.laundering_businesses[currentPlayer.id] || [];

  const [launderAmount, setLaunderAmount] = useState<number>(10000);

  const handleManualLaunder = (bizId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id];
    const bizList = next.laundering_businesses[currentPlayer.id];
    const biz = bizList?.find(b => b.id === bizId);

    if (!biz) return;

    if (player.cash_dirty < launderAmount) {
      alert(`Argent Liquide (Dirty Cash) insuffisant! Disponible: $${player.cash_dirty.toLocaleString()}`);
      return;
    }

    const fee = launderAmount * biz.fee_rate;
    const cleanReceived = launderAmount - fee;

    player.cash_dirty -= launderAmount;
    player.bank_clean += cleanReceived;
    biz.total_laundered += launderAmount;

    next.logs.unshift({
      id: `log_launder_manual_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'LAUNDER',
      uid: player.id,
      message: `BLANCHIMENT IMMÉDIAT (${biz.name}): $${launderAmount.toLocaleString()} Dirty -> $${cleanReceived.toLocaleString()} Clean (Frais: ${(biz.fee_rate * 100).toFixed(0)}%)`,
      status: 'OK'
    });

    onUpdateState(next);
  };

  const isfThreshold = state.server_config.isf_threshold;
  const isfTriggered = currentPlayer.bank_clean > isfThreshold;
  const estimatedISFTax = isfTriggered ? (currentPlayer.bank_clean - isfThreshold) * state.server_config.isf_rate : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-purple-400" />
          Blanchiment d'Argent & Regulateur Fiscal
        </h1>
        <p className="text-xs text-gray-400">
          Transformez votre Cash Liquide (Dirty) en Argent Bancaire (Clean) via vos commerces de façade.
        </p>
      </div>

      {/* ISF & Fiscal Alert Panel */}
      <div className="bg-[#0F0F16] border border-purple-500/20 p-5 rounded-xl space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase">
              Régulation du Serveur: Impôt sur la Fortune (ISF Virtuel)
            </h3>
          </div>
          <span className="text-xs font-mono text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded">
            Seuil ISF: $1,000,000 Clean
          </span>
        </div>

        <p className="text-xs text-gray-400">
          Afin de forcer la réinjection du capital dans l'économie P2P, une taxe progressive de 0.1% par tick est prélevée sur tous les soldes bancaires Clean dépassant 1,000,000 $.
        </p>

        <div className="p-4 rounded-lg bg-[#08080C] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
          <div>
            <p className="text-gray-400 text-[10px] uppercase">Votre Solde Bancaire Clean</p>
            <p className="text-lg font-bold text-cyan-400">${currentPlayer.bank_clean.toLocaleString()}</p>
          </div>

          <div>
            <p className="text-gray-400 text-[10px] uppercase">Statut ISF Virtuel</p>
            <p className={`font-bold ${isfTriggered ? 'text-amber-400' : 'text-green-400'}`}>
              {isfTriggered ? `ASSUJETTI (-$${estimatedISFTax.toFixed(2)}/tick)` : 'NON ASSUJETTI (&lt; $1M)'}
            </p>
          </div>
        </div>
      </div>

      {/* Laundering Businesses Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
          Sociétés de Façade Active ({playerBusinesses.length})
        </h3>

        {playerBusinesses.map(biz => (
          <div key={biz.id} className="bg-[#0F0F16] border border-white/5 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">{biz.type}</span>
                <h4 className="text-base font-bold text-white mt-0.5">{biz.name}</h4>
              </div>
              <span className="text-xs font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded font-bold">
                Frais de blanchiment: {(biz.fee_rate * 100).toFixed(0)}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs bg-[#08080C] p-3.5 rounded-lg border border-white/5">
              <div>
                <p className="text-gray-500 text-[10px] uppercase">Capacité par Tick Server</p>
                <p className="text-sm font-bold text-cyan-300">${biz.capacity_per_tick.toLocaleString()} / tick</p>
              </div>

              <div>
                <p className="text-gray-500 text-[10px] uppercase">Total Blanchi Historique</p>
                <p className="text-sm font-bold text-green-400">${biz.total_laundered.toLocaleString()}</p>
              </div>
            </div>

            {/* Manual Laundering Controls */}
            <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 font-mono">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs text-gray-400">Montant à blanchir:</span>
                <input
                  type="number"
                  value={launderAmount}
                  onChange={(e) => setLaunderAmount(Number(e.target.value))}
                  className="bg-[#08080C] border border-white/10 text-white text-xs px-3 py-2 rounded focus:outline-none focus:border-cyan-400 w-32"
                  min={1000}
                  step={5000}
                />
                <span className="text-xs text-gray-400">Dirty Cash</span>
              </div>

              <button
                onClick={() => handleManualLaunder(biz.id)}
                className="px-5 py-2.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                Blanchir ${launderAmount.toLocaleString()} (Net: ${(launderAmount * (1 - biz.fee_rate)).toLocaleString()})
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
