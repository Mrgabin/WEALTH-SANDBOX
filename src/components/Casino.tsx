import React, { useState } from 'react';
import { FullGlobalState } from '../types/wealth';
import { Dices, Trophy, Zap, AlertTriangle, Play, RefreshCw, Layers, Sparkles, ShieldAlert, Gift, ShieldCheck, Flame } from 'lucide-react';

interface CasinoProps {
  state: FullGlobalState;
  onUpdateState: (newState: FullGlobalState) => void;
}

export const Casino: React.FC<CasinoProps> = ({ state, onUpdateState }) => {
  const [activeGame, setActiveGame] = useState<'roulette' | 'crash' | 'mysterybox'>('roulette');
  const currentPlayer = state.players[state.current_player_id] || Object.values(state.players)[0];

  // ---------------- ROULETTE STATE ----------------
  const [rouletteBetAmount, setRouletteBetAmount] = useState<number>(1000);
  const [rouletteBetType, setRouletteBetType] = useState<'RED' | 'BLACK' | 'NUMBER_17'>('RED');
  const [rouletteHistory, setRouletteHistory] = useState<number[]>([17, 32, 15, 0, 26, 3]);
  const [rouletteSpinning, setRouletteSpinning] = useState(false);
  const [rouletteResult, setRouletteResult] = useState<number | null>(null);
  const [rouletteFeedback, setRouletteFeedback] = useState<string | null>(null);

  const handleSpinRoulette = () => {
    if (currentPlayer.bank_clean < rouletteBetAmount) {
      alert("Solde bancaire insuffisant pour parier !");
      return;
    }

    setRouletteSpinning(true);
    setRouletteFeedback(null);

    // Deduct bet immediately for real-time risk
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id] || next.players[next.current_player_id] || Object.values(next.players)[0];
    player.bank_clean -= rouletteBetAmount;
    onUpdateState(next);

    setTimeout(() => {
      const landedNum = Math.floor(Math.random() * 37); // 0-36
      setRouletteResult(landedNum);
      setRouletteHistory(prev => [landedNum, ...prev.slice(0, 9)]);
      setRouletteSpinning(false);

      const nextRound = JSON.parse(JSON.stringify(next)) as FullGlobalState;
      const playerRound = nextRound.players[currentPlayer.id] || nextRound.players[nextRound.current_player_id] || Object.values(nextRound.players)[0];

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
        playerRound.bank_clean += payout;
        setRouletteFeedback(`🎉 VICTOIRE ! Numéro ${landedNum}. Vous gagnez +$${payout.toLocaleString()} !`);
        nextRound.logs.unshift({
          id: `log_roulette_win_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'CASINO',
          uid: playerRound.id,
          message: `CASINO : ${playerRound.name} gagne $${payout.toLocaleString()} à la roulette (Mise: $${rouletteBetAmount.toLocaleString()}, Type: ${rouletteBetType})`,
          status: 'OK'
        });
      } else {
        setRouletteFeedback(`💥 PERDU ! Le numéro était ${landedNum}. -$${rouletteBetAmount.toLocaleString()}`);
        nextRound.logs.unshift({
          id: `log_roulette_lose_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'CASINO',
          uid: playerRound.id,
          message: `CASINO : ${playerRound.name} perd sa mise de $${rouletteBetAmount.toLocaleString()} à la roulette`,
          status: 'WARN'
        });
      }

      onUpdateState(nextRound);
    }, 1200);
  };

  // ---------------- CRASH GAME STATE ----------------
  const [crashBetAmount, setCrashBetAmount] = useState<number>(5000);
  const [crashMultiplier, setCrashMultiplier] = useState<number>(1.00);
  const [crashRunning, setCrashRunning] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [crashIntervalId, setCrashIntervalId] = useState<any>(null);

  const startCrashGame = () => {
    if (currentPlayer.bank_clean < crashBetAmount) {
      alert("Solde de banque propre insuffisant pour lancer la fusée !");
      return;
    }

    // Deduct the bet instantly - Casino Security Standard
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id] || next.players[next.current_player_id] || Object.values(next.players)[0];
    player.bank_clean -= crashBetAmount;

    next.logs.unshift({
      id: `log_crash_start_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'CASINO',
      uid: player.id,
      message: `CASINO : ${player.name} lance une fusée Crash Game de $${crashBetAmount.toLocaleString()}`,
      status: 'INFO'
    });
    onUpdateState(next);

    setCrashRunning(true);
    setCrashed(false);
    setCashedOut(false);
    setCrashMultiplier(1.00);

    const crashAt = Number((1.05 + Math.random() * Math.random() * 6.5).toFixed(2));

    const interval = setInterval(() => {
      setCrashMultiplier(prev => {
        const nextMult = Number((prev + 0.04).toFixed(2));
        if (nextMult >= crashAt) {
          clearInterval(interval);
          setCrashRunning(false);
          setCrashed(true);
          
          // Log crash failure
          const finalState = JSON.parse(JSON.stringify(next)) as FullGlobalState;
          finalState.logs.unshift({
            id: `log_crash_blown_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            type: 'CASINO',
            uid: currentPlayer.id,
            message: `💥 CRASH : La fusée a explosé à x${crashAt.toFixed(2)} ! Perte de la mise de $${crashBetAmount.toLocaleString()}`,
            status: 'ALERT'
          });
          onUpdateState(finalState);
          return crashAt;
        }
        return nextMult;
      });
    }, 100);

    setCrashIntervalId(interval);
  };

  const handleCashoutCrash = () => {
    if (!crashRunning || cashedOut) return;
    if (crashIntervalId) {
      clearInterval(crashIntervalId);
    }
    setCashedOut(true);
    setCrashRunning(false);

    const winAmount = Math.round(crashBetAmount * crashMultiplier);
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id] || next.players[next.current_player_id] || Object.values(next.players)[0];
    
    // Add full win amount because bet was already deducted
    player.bank_clean += winAmount;

    next.logs.unshift({
      id: `log_crash_cashout_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'CASINO',
      uid: player.id,
      message: `💰 CRASH WIN : ${player.name} Cashout à x${crashMultiplier.toFixed(2)} | Gain net: +$${(winAmount - crashBetAmount).toLocaleString()}`,
      status: 'OK'
    });

    onUpdateState(next);
  };

  // ---------------- MYSTERY BOXES STATE ----------------
  const [selectedBox, setSelectedBox] = useState<'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'>('BRONZE');
  const [riskMultiplier, setRiskMultiplier] = useState<'NONE' | 'X2' | 'X3' | 'X4'>('NONE');
  const [boxFeedback, setBoxFeedback] = useState<{
    success: boolean;
    itemName: string;
    itemValue: number;
    rarity: 'COMMUN' | 'RARE' | 'ÉPIQUE' | 'LÉGENDAIRE';
    boostPassed?: boolean;
  } | null>(null);
  const [unboxingActive, setUnboxingActive] = useState(false);

  const BOXES = {
    BRONZE: { name: 'Boîte en Bronze', price: 5000, color: 'text-amber-600 border-amber-600/30 bg-amber-950/10' },
    SILVER: { name: 'Boîte en Argent', price: 15000, color: 'text-slate-400 border-slate-400/30 bg-slate-950/10' },
    GOLD: { name: 'Boîte en Or', price: 50000, color: 'text-yellow-500 border-yellow-500/30 bg-yellow-950/10' },
    PLATINUM: { name: 'Boîte Cyber Platine', price: 150000, color: 'text-cyan-400 border-cyan-400/30 bg-cyan-950/10' },
  };

  const RISK_MODIFIERS = {
    NONE: { label: 'Pas de Booster (100%)', chance: 1.0, mult: 1 },
    X2: { label: 'Booster x2 (1 chance sur 10)', chance: 0.1, mult: 2 },
    X3: { label: 'Booster x3 (1 chance sur 20)', chance: 0.05, mult: 3 },
    X4: { label: 'Booster x4 (1 chance sur 30)', chance: 0.033, mult: 4 },
  };

  const LOOT_POOL = {
    BRONZE: [
      { name: 'Ventilateur Noctua Redux d\'occasion', baseVal: 350, rarity: 'COMMUN' },
      { name: 'Puce de silicium de grade B', baseVal: 1200, rarity: 'COMMUN' },
      { name: 'Module de RAM DDR4 8Go d\'occasion', baseVal: 1800, rarity: 'COMMUN' },
      { name: 'GPU RTX 3060 endommagé', baseVal: 4500, rarity: 'RARE' },
    ],
    SILVER: [
      { name: 'Double ventilateur de refroidissement liquide AIO', baseVal: 3200, rarity: 'COMMUN' },
      { name: 'Barette de RAM DDR5 Trident Z 16Go neuve', baseVal: 8500, rarity: 'RARE' },
      { name: 'Montre Vintage Seiko d\'occasion', baseVal: 12000, rarity: 'RARE' },
      { name: 'Puce Premium AD104 RTX 4070', baseVal: 19500, rarity: 'ÉPIQUE' },
    ],
    GOLD: [
      { name: 'Montre Omega Speedmaster d\'occasion', baseVal: 35000, rarity: 'RARE' },
      { name: 'Kit Dual-Fan Liquide Arctic LF3 pour Datacenter', baseVal: 45000, rarity: 'ÉPIQUE' },
      { name: 'Moteur de rechange pour Porsche 911', baseVal: 75000, rarity: 'ÉPIQUE' },
      { name: 'Processeur Graphique AD102 RTX 4090 d\'usine', baseVal: 120000, rarity: 'LÉGENDAIRE' },
    ],
    PLATINUM: [
      { name: 'Montre Rolex Daytona "Rainbow" en Or Rose', baseVal: 180000, rarity: 'ÉPIQUE' },
      { name: 'GPU Professionnel Nvidia H100 SXM5', baseVal: 240000, rarity: 'LÉGENDAIRE' },
      { name: 'Voiture de sport Ferrari 488 GTB d\'occasion', baseVal: 320000, rarity: 'LÉGENDAIRE' },
      { name: 'Lingot de platine pur d\'Omni-City', baseVal: 400000, rarity: 'LÉGENDAIRE' },
    ],
  };

  const handleOpenBox = () => {
    const boxCost = BOXES[selectedBox].price;
    if (currentPlayer.bank_clean < boxCost) {
      alert("Solde bancaire insuffisant pour acheter cette boîte !");
      return;
    }

    setUnboxingActive(true);
    setBoxFeedback(null);

    setTimeout(() => {
      const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
      const player = next.players[currentPlayer.id] || next.players[next.current_player_id] || Object.values(next.players)[0];

      // Deduct box cost
      player.bank_clean -= boxCost;

      // Risk booster check
      const mod = RISK_MODIFIERS[riskMultiplier];
      let boostPassed = true;
      if (riskMultiplier !== 'NONE') {
        const roll = Math.random();
        boostPassed = roll < mod.chance;
      }

      if (!boostPassed) {
        // Booster failed! Player loses box and gets nothing.
        setBoxFeedback({
          success: false,
          itemName: 'Rien (La boîte a explosé sous l\'effet de la surtension !)',
          itemValue: 0,
          rarity: 'COMMUN',
          boostPassed: false
        });

        next.logs.unshift({
          id: `log_box_fail_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'CASINO',
          uid: player.id,
          message: `🔥 SURCHARGE DE BOX : ${player.name} a tenté un booster ${riskMultiplier} sur une ${BOXES[selectedBox].name}. Échec et boîte détruite !`,
          status: 'ALERT'
        });

        setUnboxingActive(false);
        onUpdateState(next);
        return;
      }

      // Successful unboxing (or no boost used)
      const pool = LOOT_POOL[selectedBox];
      const rolledLoot = pool[Math.floor(Math.random() * pool.length)];

      // Scale final value based on boost multiplier
      const finalVal = Math.round(rolledLoot.baseVal * mod.mult);
      const formattedItemName = riskMultiplier !== 'NONE' 
        ? `[Booster ${riskMultiplier}] ${rolledLoot.name}`
        : rolledLoot.name;

      // Initialize possessions if missing
      if (!player.possessions) {
        player.possessions = [];
      }

      // Push to physical possessions collection
      player.possessions.push(`${formattedItemName} ($${finalVal.toLocaleString()})`);

      // Player also gets a portion of the clean bank value as immediate liquid profit
      player.bank_clean += Math.floor(finalVal * 0.4);

      setBoxFeedback({
        success: true,
        itemName: formattedItemName,
        itemValue: finalVal,
        rarity: rolledLoot.rarity as any,
        boostPassed: riskMultiplier !== 'NONE'
      });

      next.logs.unshift({
        id: `log_box_success_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'CASINO',
        uid: player.id,
        message: `🎁 UNBOXING : ${player.name} a ouvert une ${BOXES[selectedBox].name} (${riskMultiplier !== 'NONE' ? 'Booster ' + riskMultiplier + ' RÉUSSI !' : 'standard'}) et a obtenu : ${formattedItemName} (Estimé à $${finalVal.toLocaleString()})`,
        status: 'OK'
      });

      setUnboxingActive(false);
      onUpdateState(next);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Mini-Game Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <Dices className="w-5 h-5 text-amber-400" />
            Casino Virtuel & Unboxing Propre
          </h1>
          <p className="text-xs text-gray-400">
            Faites prospérer votre fortune légitime ou collectionnez des raretés exclusives via nos algorithmes certifiés.
          </p>
        </div>

        <div className="flex bg-[#0F0F16] p-1 rounded-xl border border-white/10 font-mono text-xs flex-wrap gap-1">
          <button
            onClick={() => setActiveGame('roulette')}
            className={`px-3 py-1.5 rounded transition cursor-pointer ${
              activeGame === 'roulette' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-gray-400 hover:text-white'
            }`}
          >
            Roulette (1:1 / 35:1)
          </button>
          <button
            onClick={() => setActiveGame('crash')}
            className={`px-3 py-1.5 rounded transition cursor-pointer ${
              activeGame === 'crash' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-gray-400 hover:text-white'
            }`}
          >
            Fusée Crash (Multiplier)
          </button>
          <button
            onClick={() => setActiveGame('mysterybox')}
            className={`px-3 py-1.5 rounded transition cursor-pointer ${
              activeGame === 'mysterybox' ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30' : 'text-gray-400 hover:text-white'
            }`}
          >
            🎁 Coffres Raretés & Booster
          </button>
        </div>
      </div>

      {/* GAME 1: ROULETTE */}
      {activeGame === 'roulette' && (
        <div className="bg-[#0F0F16] border border-amber-500/20 rounded-xl p-6 space-y-6 shadow-2xl">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h3 className="text-sm font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Roulette Européenne (RTP 97.3%)
            </h3>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-gray-400">Derniers tirages:</span>
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
              
              {rouletteFeedback && (
                <p className={`text-xs font-mono font-bold text-center p-2 rounded ${rouletteFeedback.includes('VICTOIRE') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {rouletteFeedback}
                </p>
              )}
            </div>

            {/* Betting Controls */}
            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-gray-400 text-[10px] uppercase block mb-1">Mise en $ (Banque Propre)</label>
                <input
                  type="number"
                  value={rouletteBetAmount}
                  onChange={(e) => setRouletteBetAmount(Math.max(10, Number(e.target.value)))}
                  className="w-full bg-[#08080C] border border-white/10 text-white p-2.5 rounded focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-gray-400 text-[10px] uppercase block mb-1">Type de Pari</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRouletteBetType('RED')}
                    className={`p-2.5 rounded border transition cursor-pointer font-bold ${rouletteBetType === 'RED' ? 'bg-red-500/30 border-red-500 text-red-300' : 'bg-[#08080C] border-white/10 text-gray-400'}`}
                  >
                    ROUGE (1:1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRouletteBetType('BLACK')}
                    className={`p-2.5 rounded border transition cursor-pointer font-bold ${rouletteBetType === 'BLACK' ? 'bg-gray-700 border-white text-white' : 'bg-[#08080C] border-white/10 text-gray-400'}`}
                  >
                    NOIR (1:1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRouletteBetType('NUMBER_17')}
                    className={`p-2.5 rounded border transition cursor-pointer font-bold ${rouletteBetType === 'NUMBER_17' ? 'bg-amber-500/30 border-amber-500 text-amber-300' : 'bg-[#08080C] border-white/10 text-gray-400'}`}
                  >
                    PLEIN 17 (35:1)
                  </button>
                </div>
              </div>

              <button
                type="button"
                disabled={rouletteSpinning}
                onClick={handleSpinRoulette}
                className="w-full py-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold transition cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${rouletteSpinning ? 'animate-spin' : ''}`} /> Tourner la Roulette
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
              <Zap className="w-4 h-4 text-cyan-400 animate-pulse" /> Multiplicateur Exponentiel (RTP 98.0%)
            </h3>
            <span className="text-xs text-red-400 font-bold uppercase">Mise débitée au décollage !</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Multiplier Display */}
            <div className="bg-[#08080C] p-10 rounded-xl border border-white/5 flex flex-col items-center justify-center space-y-4">
              <span className={`text-6xl font-extrabold tracking-tighter ${crashed ? 'text-red-500 animate-pulse' : cashedOut ? 'text-green-400' : 'text-cyan-400 animate-bounce'}`}>
                {crashMultiplier.toFixed(2)}x
              </span>
              
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-100 ${crashed ? 'bg-red-600' : 'bg-cyan-500'}`} 
                  style={{ width: `${Math.min(100, (crashMultiplier - 1) * 20)}%` }} 
                />
              </div>

              <p className="text-xs text-gray-400">
                {crashed ? '💥 BOOM ! CRASHÉ !' : cashedOut ? '✅ SÉCURISÉ ! GAIN CRÉDITÉ' : crashRunning ? '🚀 Altitude en hausse...' : 'Fusée prête sur le pas de tir'}
              </p>
            </div>

            {/* Controls */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Mise $ (Compte Propre Banque)</label>
                <input
                  type="number"
                  value={crashBetAmount}
                  onChange={(e) => setCrashBetAmount(Math.max(100, Number(e.target.value)))}
                  disabled={crashRunning}
                  className="w-full bg-[#08080C] border border-white/10 text-white p-2.5 rounded focus:outline-none focus:border-amber-400"
                />
              </div>

              {!crashRunning ? (
                <button
                  type="button"
                  onClick={startCrashGame}
                  className="w-full py-3.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-black transition cursor-pointer flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                  <Play className="w-4 h-4 text-cyan-400" /> Décoller (Débiter -${crashBetAmount.toLocaleString()})
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCashoutCrash}
                  disabled={cashedOut}
                  className="w-full py-3.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-300 font-black transition cursor-pointer flex flex-col items-center justify-center gap-0.5 text-xs uppercase tracking-wider"
                >
                  <span>CASH OUT MAINTENANT</span>
                  <span className="text-[10px] opacity-80">Récupérer +${Math.round(crashBetAmount * crashMultiplier).toLocaleString()} !</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* GAME 3: MYSTERY BOXES & COLLECTION */}
      {activeGame === 'mysterybox' && (
        <div className="space-y-6">
          <div className="bg-[#0F0F16] border border-purple-500/20 rounded-xl p-6 space-y-6 shadow-2xl font-mono">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
              <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
                <Gift className="w-4 h-4 text-purple-400" />
                Unboxing de Coffres d'Art & Technologie
              </h3>
              <p className="text-[10px] text-gray-400">
                Achetez des boîtes, appliquez un multiplicateur de risque élevé pour tenter de décupler le butin !
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Box Selector */}
              <div className="space-y-3">
                <label className="text-gray-400 text-[10px] uppercase block">1. Choisissez un Coffre</label>
                <div className="space-y-2">
                  {Object.entries(BOXES).map(([key, value]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => { setSelectedBox(key as any); setBoxFeedback(null); }}
                      disabled={unboxingActive}
                      className={`w-full p-3.5 rounded-xl border text-left flex justify-between items-center transition cursor-pointer ${
                        selectedBox === key 
                          ? 'bg-purple-500/10 border-purple-500 text-white font-bold' 
                          : 'bg-[#08080C] border-white/5 text-gray-400 hover:border-white/10'
                      }`}
                    >
                      <span className="text-xs">{value.name}</span>
                      <span className="text-xs text-green-400 font-extrabold">${value.price.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk Modifier */}
              <div className="space-y-3">
                <label className="text-gray-400 text-[10px] uppercase block">2. Multiplicateur de Risque ("Booster")</label>
                <div className="space-y-2">
                  {Object.entries(RISK_MODIFIERS).map(([key, value]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => { setRiskMultiplier(key as any); setBoxFeedback(null); }}
                      disabled={unboxingActive}
                      className={`w-full p-2.5 rounded-xl border text-left flex justify-between items-center transition cursor-pointer text-xs ${
                        riskMultiplier === key 
                          ? 'bg-amber-500/10 border-amber-500 text-white font-bold' 
                          : 'bg-[#08080C] border-white/5 text-gray-400 hover:border-white/10'
                      }`}
                    >
                      <span>{value.label}</span>
                      {key !== 'NONE' && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black font-mono">
                          x{value.mult} BUTIN
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-gray-500 leading-normal">
                  ⚠️ Si le booster échoue, la boîte subit une surcharge d'énergie et est instantanément détruite sans livrer son butin !
                </p>
              </div>

              {/* Unboxing Stage */}
              <div className="bg-[#08080C] p-6 rounded-xl border border-white/5 flex flex-col items-center justify-center space-y-4 relative overflow-hidden">
                <div className={`w-20 h-20 rounded-3xl border-2 border-dashed flex items-center justify-center ${unboxingActive ? 'animate-bounce border-purple-500/80' : 'border-white/15'}`}>
                  {unboxingActive ? (
                    <Sparkles className="w-10 h-10 text-purple-400 animate-spin" />
                  ) : (
                    <Gift className={`w-10 h-10 ${BOXES[selectedBox].color.split(' ')[0]}`} />
                  )}
                </div>

                <div className="text-center">
                  <p className="text-[10px] uppercase text-gray-500">Prêt à Ouvrir :</p>
                  <p className="text-xs font-bold text-white mt-0.5">{BOXES[selectedBox].name}</p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenBox}
                  disabled={unboxingActive}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition uppercase tracking-wider text-xs cursor-pointer shadow-lg"
                >
                  Ouvrir le Coffre (${BOXES[selectedBox].price.toLocaleString()})
                </button>
              </div>
            </div>

            {/* Unboxing Feedback */}
            {boxFeedback && (
              <div className={`p-4 rounded-xl border text-center space-y-1.5 animate-fade-in ${
                boxFeedback.success ? 'bg-green-500/10 border-green-500/20 text-green-300' : 'bg-red-500/10 border-red-500/20 text-red-300'
              }`}>
                {boxFeedback.success ? (
                  <>
                    <p className="text-[10px] font-bold text-green-400 tracking-widest uppercase flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> UNBOXING REUSSI ! Rareté : {boxFeedback.rarity}
                    </p>
                    <p className="text-sm font-extrabold text-white">{boxFeedback.itemName}</p>
                    <p className="text-xs text-gray-400">
                      Valeur estimée de l'objet : <strong className="text-green-400">${boxFeedback.itemValue.toLocaleString()}</strong>.
                      Objet ajouté à votre collection ! (Plus 40% de valeur propre créditée en banque).
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] font-bold text-red-400 tracking-widest uppercase flex items-center justify-center gap-1">
                      <Flame className="w-3.5 h-3.5 animate-pulse" /> BOOSTER SANS RETOUR
                    </p>
                    <p className="text-xs font-bold text-white">La boîte a explosé lors de l'amplification !</p>
                    <p className="text-[11px] text-gray-400">
                      Le booster {riskMultiplier} a échoué (marge de chance non atteinte). Le coffre est irrécupérable.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Collection Showcase */}
          <div className="bg-[#0A0A0E] border border-white/5 p-5 rounded-xl space-y-3 font-mono">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              🏆 Votre Collection d'Objets d'Art, de Luxe et de Pièces rares ({currentPlayer.possessions?.length || 0})
            </h4>
            {currentPlayer.possessions && currentPlayer.possessions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {currentPlayer.possessions.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#111118] border border-white/5 text-xs text-white flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate" title={item}>{item}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                Vous ne possédez aucun objet d'exception. Ouvrez des boîtes mystères au Casino pour constituer votre collection d'empire !
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
