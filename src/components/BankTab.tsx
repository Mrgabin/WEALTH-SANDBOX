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
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');

  // Handle Cash Deposits (risk of TRACFIN audit for large quantities)
  const handleDeposit = (amountStr: string) => {
    const amount = parseInt(amountStr);
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage("Veuillez entrer un montant de dépôt valide supérieur à 0.");
      return;
    }
    if (currentPlayer.cash_dirty < amount) {
      setErrorMessage("Vous ne possédez pas autant d'argent liquide (Cash Sale) !");
      return;
    }

    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[next.current_player_id];

    // Deduct cash dirty
    player.cash_dirty -= amount;

    // Calculate audit risk & transaction fees based on deposit amount
    let risk = 0;
    let feePercent = 0;
    if (amount <= 1000) {
      risk = 0.01; // extremely low risk
      feePercent = 0.0;
    } else if (amount <= 10000) {
      risk = 0.12; // 12% risk
      feePercent = 0.02; // 2% fee
    } else if (amount <= 50000) {
      risk = 0.35; // 35% risk
      feePercent = 0.05; // 5% fee
    } else {
      risk = 0.65; // 65% risk of audit
      feePercent = 0.12; // 12% fee
    }

    // VPN subscription safety discount reduces audit risks by 75%
    if (player.active_subscriptions?.includes('vpn_premium')) {
      risk = risk * 0.25;
    }

    const fee = Math.floor(amount * feePercent);
    const depositNet = amount - fee;

    const auditTriggered = Math.random() < risk;

    if (auditTriggered) {
      // 50% confiscation penalty by TRACFIN
      const fine = Math.floor(depositNet * 0.50);
      const remainingDeposit = depositNet - fine;
      player.bank_clean += remainingDeposit;

      next.logs.unshift({
        id: `log_deposit_audit_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'TAX_ISF',
        uid: player.id,
        message: `🚨 CONTRÔLE TRACFIN : Dépôt suspect de ${amount.toLocaleString()} repéré chez ${player.name} ! Amende de 50% infligée (-${fine.toLocaleString()})`,
        status: 'ALERT'
      });

      next.active_event = {
        id: `event_audit_${Date.now()}`,
        title: "🚨 COMPTE RENDU TRACFIN : SUSPICION DE BLANCHIMENT !",
        description: `Votre dépôt de ${amount.toLocaleString()} en liquide a fait l'objet d'un signalement automatisé pour blanchiment d'argent d'origine non justifiée.`,
        type: 'TAX_AUDIT' as any,
        severity: 'CRITICAL',
        impactText: `TRACFIN a saisi les fonds. Après examen administratif accéléré, une retenue forfaitaire de 50% (-${fine.toLocaleString()}) a été confisquée.`
      };

      setErrorMessage(`Contrôle fiscal TRACFIN ! Votre dépôt a été inspecté et taxé à hauteur de 50% pour suspicion d'origine illicite.`);
      setTimeout(() => setErrorMessage(null), 8000);
    } else {
      player.bank_clean += depositNet;

      next.logs.unshift({
        id: `log_deposit_ok_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'DB_WRITE',
        uid: player.id,
        message: `BANQUE : Dépôt en espèces réussi par ${player.name} de ${amount.toLocaleString()} (Frais : ${fee.toLocaleString()})`,
        status: 'OK'
      });

      setSuccessMessage(`Dépôt de ${depositNet.toLocaleString()} crédité sur votre compte bancaire.`);
      setTimeout(() => setSuccessMessage(null), 5000);
    }

    setDepositAmount('');
    onUpdateState(next);
  };

  // Handle Bank Withdrawals (convert bank clean money to spending cash)
  const handleWithdraw = (amountStr: string) => {
    const amount = parseInt(amountStr);
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage("Veuillez entrer un montant de retrait valide supérieur à 0.");
      return;
    }
    if (currentPlayer.bank_clean < amount) {
      setErrorMessage("Fonds bancaires propres insuffisants.");
      return;
    }

    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[next.current_player_id];

    player.bank_clean -= amount;
    player.cash_dirty += amount;

    next.logs.unshift({
      id: `log_withdraw_ok_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: player.id,
      message: `BANQUE : Retrait en espèces de ${amount.toLocaleString()} effectué par ${player.name}`,
      status: 'OK'
    });

    setSuccessMessage(`Retrait de ${amount.toLocaleString()} effectué. Le liquide est maintenant disponible.`);
    setTimeout(() => setSuccessMessage(null), 5000);
    setWithdrawAmount('');
    onUpdateState(next);
  };

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

      {/* ATM Guichet Automatique de Dépôts et Retraits */}
      <div className="bg-[#0F0F16] border border-white/5 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider border-b border-white/5 pb-3">
          🏦 Guichet Automatique Central (Dépôts & Retraits d'Espèces)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deposit Card */}
          <div className="bg-[#08080C] border border-white/5 p-4 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-500" /> Verser des Espèces (Dépôt)
              </h3>
              <span className="text-[10px] text-gray-500">Disponible: ${currentPlayer.cash_dirty.toLocaleString()}</span>
            </div>
            
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Versez vos espèces (Cash Sale) pour les sécuriser sur votre compte bancaire propre.
              <br />
              <span className="text-red-400 font-bold">⚠️ ATTENTION :</span> Les banques déclarent automatiquement les gros dépôts en espèces. Déposer de trop grosses sommes augmente le risque d'inspection <span className="text-red-400 font-bold">TRACFIN</span> et de saisie immédiate de 50% des fonds !
            </p>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Montant du dépôt (ex: 5000)"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="flex-1 bg-[#0F0F16] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => handleDeposit(depositAmount)}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-4 py-2 rounded-lg text-xs font-mono uppercase transition cursor-pointer"
                >
                  Déposer
                </button>
              </div>

              {/* Declarations and Risk table */}
              <div className="bg-[#0F0F16] p-2.5 rounded border border-white/5 text-[10px] space-y-1.5 text-gray-500 font-mono">
                <div className="flex justify-between text-gray-400">
                  <span>Tranche de Dépôt</span>
                  <span>Frais / Risque TRACFIN</span>
                </div>
                <div className="border-t border-white/5 my-1"></div>
                <div className="flex justify-between">
                  <span>&le; $1,000</span>
                  <span className="text-green-400 font-bold">Gratuit • Risque &lt;1%</span>
                </div>
                <div className="flex justify-between">
                  <span>$1,001 - $10,000</span>
                  <span className="text-cyan-400">Frais 2% • Risque 12%</span>
                </div>
                <div className="flex justify-between">
                  <span>$10,001 - $50,000</span>
                  <span className="text-amber-500 font-bold">Frais 5% • Risque 35%</span>
                </div>
                <div className="flex justify-between">
                  <span>&gt; $50,000</span>
                  <span className="text-red-500 font-bold">Frais 12% • Risque 65%</span>
                </div>
                {currentPlayer.active_subscriptions?.includes('vpn_premium') && (
                  <div className="border-t border-white/5 pt-1 mt-1 text-cyan-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    VPN Premium Actif : Risques d'audit TRACFIN divisés par 4 !
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Withdrawal Card */}
          <div className="bg-[#08080C] border border-white/5 p-4 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-green-500" /> Retirer du Liquide (Retrait)
              </h3>
              <span className="text-[10px] text-gray-500">Disponible: ${currentPlayer.bank_clean.toLocaleString()}</span>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed">
              Convertissez vos fonds propres en banque en billets de banque liquide (espèces) pour faire des achats de matériel d'occasion ou d'affaires dégradées en cash auprès des revendeurs P2P clandestins.
              <br />
              <span className="text-green-400 font-bold">✓ SÉCURISÉ :</span> Le retrait d'espèces de votre propre compte est 100% légal et ne comporte aucun risque de contrôle fiscal ou frais de déclaration.
            </p>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Montant du retrait (ex: 1000)"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="flex-1 bg-[#0F0F16] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => handleWithdraw(withdrawAmount)}
                  className="bg-green-500 hover:bg-green-400 text-black font-extrabold px-4 py-2 rounded-lg text-xs font-mono uppercase transition cursor-pointer"
                >
                  Retirer
                </button>
              </div>

              {/* Declarations information */}
              <div className="bg-[#0F0F16] p-3 rounded border border-white/5 text-[10px] text-gray-500 leading-relaxed font-mono">
                <p className="text-green-400 font-bold">Réglementation des retraits :</p>
                Aucune limite de montant ni de déclaration fiscale. Les espèces retirées sont immédiatement ajoutées à votre portefeuille de Cash Sale et prêtes pour des transactions discrètes.
              </div>
            </div>
          </div>
        </div>
      </div>

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
