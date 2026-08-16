import React, { useState } from 'react';
import { FullGlobalState } from '../types/wealth';
import { Play, ShieldCheck, Trophy, Sparkles, RefreshCw, HelpCircle } from 'lucide-react';

interface BlackjackGameProps {
  state: FullGlobalState;
  onUpdateState: (newState: FullGlobalState) => void;
}

interface Card {
  suit: string;
  label: string;
  val: number;
}

export const BlackjackGame: React.FC<BlackjackGameProps> = ({ state, onUpdateState }) => {
  const [bjBetAmount, setBjBetAmount] = useState<number>(2000);
  const [bjStatus, setBjStatus] = useState<'idle' | 'player_turn' | 'dealer_turn' | 'ended'>('idle');
  const [bjPlayerHand, setBjPlayerHand] = useState<Card[]>([]);
  const [bjDealerHand, setBjDealerHand] = useState<Card[]>([]);
  const [bjFeedback, setBjFeedback] = useState<string | null>(null);

  const currentPlayer = state.players[state.current_player_id] || Object.values(state.players)[0];

  const generateDeck = (): Card[] => {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = [
      { name: '2', val: 2 },
      { name: '3', val: 3 },
      { name: '4', val: 4 },
      { name: '5', val: 5 },
      { name: '6', val: 6 },
      { name: '7', val: 7 },
      { name: '8', val: 8 },
      { name: '9', val: 9 },
      { name: '10', val: 10 },
      { name: 'J', val: 10 },
      { name: 'Q', val: 10 },
      { name: 'K', val: 10 },
      { name: 'A', val: 11 },
    ];
    let deck: Card[] = [];
    for (let s of suits) {
      for (let r of ranks) {
        deck.push({ suit: s, label: r.name, val: r.val });
      }
    }
    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  };

  const getHandValue = (hand: Card[]): number => {
    let sum = hand.reduce((acc, card) => acc + card.val, 0);
    let aces = hand.filter(card => card.label === 'A').length;
    while (sum > 21 && aces > 0) {
      sum -= 10;
      aces -= 1;
    }
    return sum;
  };

  const handleStartBlackjack = () => {
    if (currentPlayer.bank_clean < bjBetAmount) {
      alert("Solde bancaire propre insuffisant pour parier !");
      return;
    }

    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id] || next.players[next.current_player_id] || Object.values(next.players)[0];
    player.bank_clean -= bjBetAmount;

    const deck = generateDeck();
    const pHand = [deck[0], deck[1]];
    const dHand = [deck[2], deck[3]];

    setBjPlayerHand(pHand);
    setBjDealerHand(dHand);
    setBjFeedback(null);

    const pVal = getHandValue(pHand);
    if (pVal === 21) {
      const dVal = getHandValue(dHand);
      if (dVal === 21) {
        player.bank_clean += bjBetAmount;
        setBjFeedback("Égalité parfaite ! Vous et le croupier avez un Blackjack.");
        setBjStatus('ended');
      } else {
        const payout = Math.round(bjBetAmount * 2.5);
        player.bank_clean += payout;
        setBjFeedback(`🎉 BLACKJACK NATUREL ! Vous gagnez +$${payout.toLocaleString()} !`);
        setBjStatus('ended');
        next.logs.unshift({
          id: `log_bj_bj_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'CASINO',
          uid: player.id,
          message: `🃏 BLACKJACK : ${player.name} obtient un Blackjack naturel et gagne $${payout.toLocaleString()}`,
          status: 'OK'
        });
      }
      onUpdateState(next);
    } else {
      setBjStatus('player_turn');
      onUpdateState(next);
    }
  };

  const handleBjHit = () => {
    if (bjStatus !== 'player_turn') return;
    const deck = generateDeck();
    const newCard = deck[Math.floor(Math.random() * deck.length)];
    const newHand = [...bjPlayerHand, newCard];
    setBjPlayerHand(newHand);

    const val = getHandValue(newHand);
    if (val > 21) {
      setBjStatus('ended');
      setBjFeedback(`💥 SAUTÉ (BUST) ! Votre total est de ${val}. Vous perdez la mise.`);

      const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
      const player = next.players[currentPlayer.id] || next.players[next.current_player_id] || Object.values(next.players)[0];
      next.logs.unshift({
        id: `log_bj_bust_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'CASINO',
        uid: player.id,
        message: `🃏 BLACKJACK : ${player.name} a sauté à ${val} et perd $${bjBetAmount.toLocaleString()}`,
        status: 'WARN'
      });
      onUpdateState(next);
    }
  };

  const handleBjStand = () => {
    if (bjStatus !== 'player_turn') return;
    setBjStatus('dealer_turn');

    let currentDealerHand = [...bjDealerHand];
    const deck = generateDeck();
    while (getHandValue(currentDealerHand) < 17) {
      const newCard = deck[Math.floor(Math.random() * deck.length)];
      currentDealerHand.push(newCard);
    }
    setBjDealerHand(currentDealerHand);

    const dVal = getHandValue(currentDealerHand);
    const pVal = getHandValue(bjPlayerHand);

    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id] || next.players[next.current_player_id] || Object.values(next.players)[0];

    let feedback = "";
    if (dVal > 21) {
      const payout = bjBetAmount * 2;
      player.bank_clean += payout;
      feedback = `🎉 VICTOIRE ! Le croupier a sauté à ${dVal}. Vous gagnez +$${payout.toLocaleString()} !`;
      next.logs.unshift({
        id: `log_bj_win_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'CASINO',
        uid: player.id,
        message: `🃏 BLACKJACK : ${player.name} gagne $${payout.toLocaleString()} (Le croupier a sauté à ${dVal})`,
        status: 'OK'
      });
    } else if (pVal > dVal) {
      const payout = bjBetAmount * 2;
      player.bank_clean += payout;
      feedback = `🎉 VICTOIRE ! Votre score de ${pVal} bat le ${dVal} du croupier. +$${payout.toLocaleString()}`;
      next.logs.unshift({
        id: `log_bj_win_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'CASINO',
        uid: player.id,
        message: `🃏 BLACKJACK : ${player.name} gagne $${payout.toLocaleString()} (${pVal} vs ${dVal})`,
        status: 'OK'
      });
    } else if (pVal < dVal) {
      feedback = `💥 PERDU ! Le ${dVal} du croupier bat votre total de ${pVal}.`;
      next.logs.unshift({
        id: `log_bj_lose_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'CASINO',
        uid: player.id,
        message: `🃏 BLACKJACK : ${player.name} perd sa mise de $${bjBetAmount.toLocaleString()} (${pVal} vs ${dVal})`,
        status: 'WARN'
      });
    } else {
      player.bank_clean += bjBetAmount;
      feedback = `🤝 ÉGALITÉ (PUSH) ! Même score de ${pVal}. Votre mise vous est restituée.`;
      next.logs.unshift({
        id: `log_bj_push_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'CASINO',
        uid: player.id,
        message: `🃏 BLACKJACK : Égalité pour ${player.name} (${pVal} vs ${dVal})`,
        status: 'INFO'
      });
    }

    setBjFeedback(feedback);
    setBjStatus('ended');
    onUpdateState(next);
  };

  const getCardColor = (suit: string) => {
    return (suit === '♥' || suit === '♦') ? 'text-red-500' : 'text-slate-200';
  };

  return (
    <div className="bg-[#0F0F16] border border-emerald-500/20 rounded-xl p-6 space-y-6 shadow-2xl font-mono">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
          <Trophy className="w-4 h-4 text-emerald-400" /> Blackjack VIP (RTP 99.5%)
        </h3>
        <span className="text-[10px] text-gray-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase">
          Banque du Casino
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Table de jeu */}
        <div className="bg-[#08080C] p-6 rounded-xl border border-white/5 flex flex-col justify-between space-y-6 min-h-[300px]">
          {/* Croupier Hand */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>MAIN DU CROUPIER</span>
              {bjStatus !== 'idle' && (
                <span className="bg-[#111] px-2 py-0.5 rounded text-gray-300">
                  Total : {bjStatus === 'player_turn' ? '?' : getHandValue(bjDealerHand)}
                </span>
              )}
            </div>
            <div className="flex gap-2 min-h-[80px]">
              {bjStatus === 'idle' ? (
                <div className="w-14 h-20 rounded bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-gray-600 text-xs">
                  Vide
                </div>
              ) : (
                bjDealerHand.map((card, i) => (
                  <div
                    key={i}
                    className={`w-14 h-20 rounded bg-[#111118] border border-white/10 p-2 flex flex-col justify-between shadow-md transition-all ${
                      i === 1 && bjStatus === 'player_turn' ? 'bg-gradient-to-br from-indigo-950 to-purple-950 border-purple-500/40' : ''
                    }`}
                  >
                    {i === 1 && bjStatus === 'player_turn' ? (
                      <div className="flex-1 flex items-center justify-center text-purple-400 animate-pulse">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                    ) : (
                      <>
                        <span className={`text-xs font-bold ${getCardColor(card.suit)}`}>{card.label}</span>
                        <span className={`text-xl self-center ${getCardColor(card.suit)}`}>{card.suit}</span>
                        <span className={`text-xs font-bold self-end ${getCardColor(card.suit)}`}>{card.label}</span>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Player Hand */}
          <div className="space-y-2 border-t border-white/5 pt-4">
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>VOTRE MAIN</span>
              {bjStatus !== 'idle' && (
                <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">
                  Total : {getHandValue(bjPlayerHand)}
                </span>
              )}
            </div>
            <div className="flex gap-2 min-h-[80px]">
              {bjStatus === 'idle' ? (
                <div className="w-14 h-20 rounded bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-gray-600 text-xs">
                  Vide
                </div>
              ) : (
                bjPlayerHand.map((card, i) => (
                  <div key={i} className="w-14 h-20 rounded bg-[#111118] border border-white/15 p-2 flex flex-col justify-between shadow-md hover:scale-105 transition">
                    <span className={`text-xs font-bold ${getCardColor(card.suit)}`}>{card.label}</span>
                    <span className={`text-xl self-center ${getCardColor(card.suit)}`}>{card.suit}</span>
                    <span className={`text-xs font-bold self-end ${getCardColor(card.suit)}`}>{card.label}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Contrôles et Feedback */}
        <div className="flex flex-col justify-between space-y-4 bg-[#08080C]/40 p-5 rounded-xl border border-white/5">
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="text-gray-400 text-[10px] uppercase block mb-1">MISE DE DÉPART (BANQUE PROPRE)</label>
              <input
                type="number"
                value={bjBetAmount}
                onChange={(e) => setBjBetAmount(Math.max(100, Number(e.target.value)))}
                disabled={bjStatus === 'player_turn'}
                className="w-full bg-[#08080C] border border-white/10 text-white p-2.5 rounded focus:outline-none focus:border-emerald-400"
              />
            </div>

            {bjFeedback && (
              <div className={`p-3 rounded-lg border text-center font-bold font-mono text-[11px] animate-fade-in ${
                bjFeedback.includes('VICTOIRE') || bjFeedback.includes('BLACKJACK')
                  ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                  : bjFeedback.includes('Égalité') || bjFeedback.includes('EGALITÉ')
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {bjFeedback}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {bjStatus === 'idle' || bjStatus === 'ended' ? (
              <button
                type="button"
                onClick={handleStartBlackjack}
                className="w-full py-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold transition flex items-center justify-center gap-2 cursor-pointer uppercase text-xs tracking-wider font-bold"
              >
                <Play className="w-4 h-4 text-emerald-400" /> Distribuer les cartes (-${bjBetAmount.toLocaleString()})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleBjHit}
                  className="py-3 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 font-bold transition cursor-pointer text-xs uppercase font-bold"
                >
                  ➕ Carte (Hit)
                </button>
                <button
                  type="button"
                  onClick={handleBjStand}
                  className="py-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold transition cursor-pointer text-xs uppercase font-bold"
                >
                  ✋ Rester (Stand)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
