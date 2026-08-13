import React, { useState } from 'react';
import { FullGlobalState } from '../types/wealth';
import { Landmark, ShieldAlert, Coins, ArrowRight, HelpCircle, FileText, CheckCircle } from 'lucide-react';

interface BankTabProps {
  state: FullGlobalState;
  onUpdateState: (newState: FullGlobalState) => void;
}

export const BankTab: React.FC<BankTabProps> = ({ state, onUpdateState }) => {
  const currentPlayer = state.players[state.current_player_id] || Object.values(state.players)[0];
  const [loanAmount, setLoanAmount] = useState<number>(50000);
  const [loanIsDirty, setLoanIsDirty] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Take a loan
  const handleBorrow = (amount: number, isDirty: boolean) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[next.current_player_id];

    // Interest rate scales on credit score
    const interestRate = player.credit_score > 750 ? 0.08 : player.credit_score > 650 ? 0.12 : 0.18;

    if (isDirty) {
      player.cash_dirty += amount;
    } else {
      player.bank_clean += amount;
    }

    // Lower credit score on taking loans
    player.credit_score = Math.max(300, player.credit_score - 25);

    next.loans.push({
      id: `loan_${Date.now()}`,
      lender_id: 'central_bank_omni',
      lender_name: isDirty ? 'Serrure Noir (Prêteur sur Gage)' : 'Banque Centrale d\'Omni',
      borrower_id: player.id,
      borrower_name: player.name,
      amount,
      weekly_interest_rate: interestRate,
      is_dirty: isDirty,
      collateral: 'Garantie d\'Actifs Réels & Fermes',
      due_ticks_remaining: 40
    });

    next.logs.unshift({
      id: `log_loan_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: player.id,
      message: `BANQUE: ${player.name} a contracté un prêt de $${amount.toLocaleString()} (${isDirty ? 'Cash' : 'Banque'}) à ${Math.round(interestRate * 100)}% d'intérêt`,
      status: 'WARN'
    });

    setSuccessMessage(`Prêt de $${amount.toLocaleString()} accordé avec succès !`);
    setTimeout(() => setSuccessMessage(null), 4000);
    onUpdateState(next);
  };

  // Repay a loan
  const handleRepay = (loanId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[next.current_player_id];
    const loanIndex = next.loans.findIndex(l => l.id === loanId);
    if (loanIndex === -1) return;

    const loan = next.loans[loanIndex];
    const totalRepay = Math.round(loan.amount * (1 + loan.weekly_interest_rate));

    if (loan.is_dirty) {
      if (player.cash_dirty < totalRepay) {
        setErrorMessage(`Argent liquide (Cash Sale) insuffisant ! Il vous faut $${totalRepay.toLocaleString()} en liquide.`);
        setTimeout(() => setErrorMessage(null), 4000);
        return;
      }
      player.cash_dirty -= totalRepay;
    } else {
      if (player.bank_clean < totalRepay) {
        setErrorMessage(`Fonds bancaires propres insuffisants ! Il vous faut $${totalRepay.toLocaleString()} sur votre compte.`);
        setTimeout(() => setErrorMessage(null), 4000);
        return;
      }
      player.bank_clean -= totalRepay;
    }

    // Improve credit score on successful repayment
    player.credit_score = Math.min(850, player.credit_score + 35);

    next.loans.splice(loanIndex, 1);

    next.logs.unshift({
      id: `log_repay_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: player.id,
      message: `BANQUE: ${player.name} a entièrement remboursé son prêt de $${totalRepay.toLocaleString()}`,
      status: 'OK'
    });

    setSuccessMessage(`Prêt de $${totalRepay.toLocaleString()} remboursé avec succès !`);
    setTimeout(() => setSuccessMessage(null), 4000);
    onUpdateState(next);
  };

  const myLoans = state.loans.filter(l => l.borrower_id === currentPlayer.id);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0A0A0E] border border-cyan-500/20 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-[0.2em]">SYSTEME BANCAIRE CENTRAL</span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5 mt-1">
            <Landmark className="w-6 h-6 text-cyan-400" />
            La Banque Centrale d'Omni
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-xl font-sans">
            Gérez vos fonds propres, contractez des emprunts légaux basés sur votre score de crédit, ou sollicitez des prêteurs privés discrets pour des liquidités non enregistrées.
          </p>
        </div>

        <div className="flex gap-4 font-mono text-xs bg-[#0F0F16] border border-white/10 rounded-xl p-4 shrink-0">
          <div>
            <p className="text-gray-500 text-[10px] uppercase">Solde Propre (Banque)</p>
            <p className="text-base font-extrabold text-green-400">${currentPlayer.bank_clean.toLocaleString()}</p>
          </div>
          <div className="border-l border-white/10 pl-4">
            <p className="text-gray-500 text-[10px] uppercase">Score de Crédit</p>
            <p className="text-base font-extrabold text-cyan-400">{currentPlayer.credit_score} / 850</p>
          </div>
        </div>
      </div>

      {/* Alert Banner for Messages */}
      {errorMessage && (
        <div className="bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-mono p-3.5 rounded-xl flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-mono p-3.5 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Apply for Loan */}
        <div className="bg-[#0F0F16] border border-white/5 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider border-b border-white/5 pb-3">
            Demander un Financement
          </h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-mono block">Montant du prêt souhaité</label>
              <div className="grid grid-cols-4 gap-2">
                {[15000, 50000, 100000, 250000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setLoanAmount(val)}
                    className={`py-2 rounded-lg font-mono text-xs font-bold border transition cursor-pointer ${
                      loanAmount === val 
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' 
                        : 'bg-[#08080C] border-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    ${val.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-mono block">Nature des fonds requis</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLoanIsDirty(false)}
                  className={`p-4 rounded-xl text-left border transition cursor-pointer space-y-1 ${
                    !loanIsDirty 
                      ? 'bg-green-500/10 border-green-500/40 text-green-300' 
                      : 'bg-[#08080C] border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <p className="text-xs font-bold font-mono">Fonds Institutionnels (Propres)</p>
                  <p className="text-[10px] text-gray-500">Versés en Banque. Intérêts basés sur votre crédit score.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setLoanIsDirty(true)}
                  className={`p-4 rounded-xl text-left border transition cursor-pointer space-y-1 ${
                    loanIsDirty 
                      ? 'bg-red-500/10 border-red-500/40 text-red-300' 
                      : 'bg-[#08080C] border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <p className="text-xs font-bold font-mono">Liquidités Clandestines (Sales)</p>
                  <p className="text-[10px] text-gray-500">Remis en Cash. Intérêts élevés de 18% par semaine.</p>
                </button>
              </div>
            </div>

            {/* Simulated Interest rate card */}
            <div className="bg-[#08080C] border border-white/5 p-4 rounded-xl font-mono text-xs space-y-2">
              <div className="flex justify-between text-gray-400">
                <span>Taux d'intérêt estimé:</span>
                <span className={loanIsDirty ? "text-red-400 font-bold" : "text-green-400 font-bold"}>
                  {loanIsDirty ? '18%' : currentPlayer.credit_score > 750 ? '8%' : currentPlayer.credit_score > 650 ? '12%' : '18%'} / semaine
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Période d'échéance:</span>
                <span className="text-white font-bold">40 Ticks (~120 secondes)</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Impact crédit score:</span>
                <span className="text-amber-500 font-bold">-25 points</span>
              </div>
            </div>

            <button
              onClick={() => handleBorrow(loanAmount, loanIsDirty)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs uppercase tracking-wider transition cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <Coins className="w-4 h-4" /> Signer l'accord de prêt (${loanAmount.toLocaleString()})
            </button>
          </div>
        </div>

        {/* Right Card: Active Loans */}
        <div className="bg-[#0F0F16] border border-white/5 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider border-b border-white/5 pb-3">
            Vos Emprunts Actifs ({myLoans.length})
          </h2>

          {myLoans.length === 0 ? (
            <div className="bg-[#08080C] border border-white/5 rounded-xl p-8 text-center space-y-3 font-mono">
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto" />
              <h3 className="text-xs font-bold text-white uppercase">Aucune Dette Enregistrée</h3>
              <p className="text-[11px] text-gray-500">
                Votre historique financier est sain. Vous ne devez pas d'argent pour le moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
              {myLoans.map(loan => {
                const totalRepay = Math.round(loan.amount * (1 + loan.weekly_interest_rate));
                const canRepay = loan.is_dirty 
                  ? currentPlayer.cash_dirty >= totalRepay
                  : currentPlayer.bank_clean >= totalRepay;

                return (
                  <div key={loan.id} className="bg-[#08080C] border border-white/5 rounded-xl p-4 space-y-3 font-mono text-xs hover:border-cyan-500/20 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                          loan.is_dirty 
                            ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                            : 'bg-green-500/10 border-green-500/20 text-green-400'
                        }`}>
                          {loan.is_dirty ? 'Prêteur Clandestin' : 'Crédit Institutionnel'}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1.5">${loan.amount.toLocaleString()} empruntés</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-gray-500">Taux d'intérêt</p>
                        <p className="text-amber-400 font-bold">+{Math.round(loan.weekly_interest_rate * 100)}%</p>
                      </div>
                    </div>

                    <div className="space-y-1 bg-[#0F0F16] p-2.5 rounded border border-white/5 text-[11px] text-gray-400">
                      <p className="flex justify-between">
                        <span>Créancier:</span>
                        <span className="text-gray-200 font-bold">{loan.lender_name}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Restant:</span>
                        <span className="text-amber-500 font-bold">{loan.due_ticks_remaining} ticks</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Remboursement dû:</span>
                        <span className="text-white font-extrabold">${totalRepay.toLocaleString()}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleRepay(loan.id)}
                      className={`w-full py-2 rounded-lg text-xs font-bold font-mono transition cursor-pointer flex items-center justify-center gap-1.5 border ${
                        canRepay 
                          ? 'bg-green-500/20 hover:bg-green-500/30 border-green-500/40 text-green-300' 
                          : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/15'
                      }`}
                    >
                      <span>Rembourser ${totalRepay.toLocaleString()}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    {!canRepay && (
                      <p className="text-[9px] text-center text-red-500">
                        {loan.is_dirty ? 'Fonds Cash (Dirty) insuffisants' : 'Solde Banque insuffisant'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
