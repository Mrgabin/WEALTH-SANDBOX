import React, { useState } from 'react';
import { FullGlobalState, StockMarketItem, TradingPosition } from '../types/wealth';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Shield, 
  Percent, 
  Plus, 
  Minus, 
  Clock, 
  X,
  Compass,
  Briefcase
} from 'lucide-react';

interface StockMarketProps {
  state: FullGlobalState;
  onUpdateState: (newState: FullGlobalState) => void;
}

export const StockMarket: React.FC<StockMarketProps> = ({ state, onUpdateState }) => {
  const [marketTab, setMarketTab] = useState<'CRYPTO' | 'STOCK'>('CRYPTO');
  const [selectedItem, setSelectedItem] = useState<StockMarketItem>(
    state.market_prices.find(p => p.category === 'CRYPTO') || state.market_prices[0]
  );
  const [tradeAmount, setTradeAmount] = useState<number>(5000);
  const [leverage, setLeverage] = useState<number>(10); // 1x to 100x
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [limitPrice, setLimitPrice] = useState<number>(selectedItem.price);
  
  // Advanced parameters
  const [useSL, setUseSL] = useState<boolean>(false);
  const [useTP, setUseTP] = useState<boolean>(false);
  const [stopLoss, setStopLoss] = useState<number>(Math.round(selectedItem.price * 0.95));
  const [takeProfit, setTakeProfit] = useState<number>(Math.round(selectedItem.price * 1.10));

  const currentPlayer = state.players[state.current_player_id] || Object.values(state.players)[0];

  // When selected item changes, update default limit price, SL, TP
  const handleSelectItem = (item: StockMarketItem) => {
    setSelectedItem(item);
    setLimitPrice(item.price);
    setStopLoss(Math.round(item.price * 0.95));
    setTakeProfit(Math.round(item.price * 1.10));
  };

  const handleExecuteTrade = (isLong: boolean) => {
    if (currentPlayer.bank_clean < tradeAmount) {
      alert(`Solde bancaire propre insuffisant ! Requis : $${tradeAmount.toLocaleString()}`);
      return;
    }

    const entryPrice = orderType === 'MARKET' ? selectedItem.price : limitPrice;
    
    // Check if limit price makes sense
    if (orderType === 'LIMIT' && limitPrice <= 0) {
      alert("Le prix limite doit être supérieur à 0.");
      return;
    }

    const positionSize = tradeAmount * leverage;
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id];

    // Deduct margin capital
    player.bank_clean -= tradeAmount;

    // Create new TradingPosition
    const newPosition: TradingPosition = {
      id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      symbol: selectedItem.symbol,
      is_long: isLong,
      entry_price: entryPrice,
      margin: tradeAmount,
      leverage: leverage,
      size: positionSize,
      stop_loss: useSL ? stopLoss : undefined,
      take_profit: useTP ? takeProfit : undefined
    };

    if (!player.active_positions) {
      player.active_positions = [];
    }
    player.active_positions.push(newPosition);

    next.logs.unshift({
      id: `log_trade_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: player.id,
      message: `TRADING : ${player.name} a ouvert une position ${isLong ? 'LONG' : 'SHORT'} x${leverage} sur ${selectedItem.symbol} au prix de $${entryPrice.toLocaleString()} (Marge engagée: $${tradeAmount.toLocaleString()})`,
      status: 'OK'
    });

    onUpdateState(next);
  };

  const handleClosePosition = (posId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id];
    
    if (!player.active_positions) return;
    
    const posIndex = player.active_positions.findIndex(p => p.id === posId);
    if (posIndex === -1) return;

    const pos = player.active_positions[posIndex];
    const marketItem = next.market_prices.find(m => m.symbol === pos.symbol);
    
    if (!marketItem) {
      alert("Cours de marché introuvable pour clôturer.");
      return;
    }

    const currentPrice = marketItem.price;
    const priceRatio = currentPrice / pos.entry_price;
    const pnlRatio = pos.is_long 
      ? (priceRatio - 1) * pos.leverage
      : (1 - priceRatio) * pos.leverage;

    const profitLossAmount = pos.margin * pnlRatio;
    const totalRefund = pos.margin + profitLossAmount;

    // Return remaining margin + PnL (capped at >= 0, though liquidation should have occurred)
    player.bank_clean = Math.max(0, player.bank_clean + totalRefund);
    
    // Remove from active list
    player.active_positions.splice(posIndex, 1);

    next.logs.unshift({
      id: `log_close_manual_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: player.id,
      message: `TRADING : ${player.name} a fermé manuellement sa position ${pos.is_long ? 'LONG' : 'SHORT'} sur ${pos.symbol} à $${currentPrice.toLocaleString()}. PnL : ${profitLossAmount >= 0 ? '+' : ''}$${profitLossAmount.toFixed(2)}`,
      status: profitLossAmount >= 0 ? 'OK' : 'WARN'
    });

    onUpdateState(next);
  };

  const handleBuyBond = () => {
    const bondCost = 1000;
    if (currentPlayer.bank_clean < bondCost) {
      alert("Fonds insuffisants pour acheter l'Obligation du Serveur ($1,000)");
      return;
    }

    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id];

    player.bank_clean -= bondCost;

    next.logs.unshift({
      id: `log_bond_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: player.id,
      message: `OBLIGATION : ${player.name} a souscrit à 1x Obligation du Serveur (Rendement garanti +4% par cycle mensuel)`,
      status: 'OK'
    });

    onUpdateState(next);
    alert("Obligation du Serveur souscrite avec succès ! Intérêts payés à chaque mois.");
  };

  // Filter prices by active tab
  const filteredPrices = state.market_prices.filter(p => p.category === marketTab);

  // Generate procedural candlesticks from sparkline histories for selected item
  const generateCandles = (history: number[]) => {
    return history.map((val, idx) => {
      const prevVal = idx > 0 ? history[idx - 1] : val;
      const isGreen = val >= prevVal;
      
      // Procedural noise for High / Low
      const spread = val * 0.003;
      const high = Math.max(val, prevVal) + (Math.random() * spread);
      const low = Math.min(val, prevVal) - (Math.random() * spread);
      
      return {
        open: prevVal,
        close: val,
        high: high,
        low: low,
        isGreen
      };
    });
  };

  const candles = generateCandles(selectedItem.history);

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400 animate-pulse" />
            Marché Boursier & Cryptomonnaies
          </h1>
          <p className="text-xs text-gray-400">
            Plateforme d'investissement à levier ultra-rapide. Les taux de change et les actions fluctuent en temps réel.
          </p>
        </div>

        {/* Categories Tab Selector */}
        <div className="flex bg-[#0A0A0F] border border-white/5 rounded-lg p-1 shrink-0 font-mono">
          <button
            onClick={() => {
              setMarketTab('CRYPTO');
              const firstCrypto = state.market_prices.find(p => p.category === 'CRYPTO');
              if (firstCrypto) handleSelectItem(firstCrypto);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              marketTab === 'CRYPTO' 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            CRYPTOMONNAIES
          </button>
          <button
            onClick={() => {
              setMarketTab('STOCK');
              const firstStock = state.market_prices.find(p => p.category === 'STOCK');
              if (firstStock) handleSelectItem(firstStock);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              marketTab === 'STOCK' 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ACTIONS WALL STREET
          </button>
        </div>
      </div>

      {/* Grid of tickers for the selected tab */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
        {filteredPrices.map((item) => {
          const isSelected = item.symbol === selectedItem.symbol;
          const isPositive = item.change_percent >= 0;

          return (
            <button
              key={item.symbol}
              onClick={() => handleSelectItem(item)}
              className={`p-4 rounded-xl border text-left transition duration-150 cursor-pointer ${
                isSelected
                  ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'bg-[#0F0F16] border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-black text-white">{item.symbol}</span>
                <span className={`text-[10px] flex items-center font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                  {isPositive ? '+' : ''}{item.change_percent}%
                </span>
              </div>
              <p className="text-lg font-black text-cyan-300 mt-2">${item.price.toLocaleString()}</p>
              <p className="text-[9px] text-gray-500 uppercase mt-1">{item.name}</p>
            </button>
          );
        })}
      </div>

      {/* Main charting & trading interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
        {/* Candlestick Chart view */}
        <div className="lg:col-span-2 bg-[#0F0F16] border border-white/5 rounded-xl p-5 space-y-4 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">{selectedItem.category} LIVE FEED</span>
                <h3 className="text-lg font-bold text-white">{selectedItem.name} ({selectedItem.symbol})</h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-cyan-300">${selectedItem.price.toLocaleString()}</span>
                <p className={`text-xs font-bold ${selectedItem.change_percent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {selectedItem.change_percent >= 0 ? '+' : ''}{selectedItem.change_percent}%
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Candlestick Chart container */}
          <div className="bg-[#08080C] p-4 rounded-xl border border-white/5 h-64 flex flex-col justify-between relative overflow-hidden">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-5">
              <div className="border-b border-white w-full"></div>
              <div className="border-b border-white w-full"></div>
              <div className="border-b border-white w-full"></div>
              <div className="border-b border-white w-full"></div>
            </div>

            {/* Candlesticks view */}
            <div className="flex-1 flex items-end gap-3 justify-between z-10 pt-4">
              {candles.map((candle, idx) => {
                const maxPrice = Math.max(...selectedItem.history) * 1.002;
                const minPrice = Math.min(...selectedItem.history) * 0.998;
                const priceRange = maxPrice - minPrice;

                const getPercent = (price: number) => {
                  return priceRange === 0 ? 50 : ((price - minPrice) / priceRange) * 100;
                };

                const bodyHigh = Math.max(candle.open, candle.close);
                const bodyLow = Math.min(candle.open, candle.close);

                const topBody = getPercent(bodyHigh);
                const bottomBody = getPercent(bodyLow);
                const wickTop = getPercent(candle.high);
                const wickBottom = getPercent(candle.low);

                const bodyHeight = Math.max(2, topBody - bottomBody);
                const wickHeight = Math.max(4, wickTop - wickBottom);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 bg-[#0D0D14] border border-white/15 p-2 rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-[10px] space-y-0.5 text-left min-w-[120px]">
                      <p className="text-gray-400">Haut : <span className="text-white font-bold">${candle.high.toFixed(2)}</span></p>
                      <p className="text-gray-400">Bas : <span className="text-white font-bold">${candle.low.toFixed(2)}</span></p>
                      <p className="text-gray-400">Ouv : <span className="text-white font-bold">${candle.open.toFixed(2)}</span></p>
                      <p className="text-gray-400">Clôt : <span className="text-white font-bold">${candle.close.toFixed(2)}</span></p>
                    </div>

                    {/* Wick (high/low line) */}
                    <div 
                      className={`absolute w-[1.5px] ${candle.isGreen ? 'bg-green-400/50' : 'bg-red-400/50'}`}
                      style={{ 
                        height: `${wickHeight}%`,
                        bottom: `${wickBottom}%`
                      }}
                    />

                    {/* Body (open/close bar) */}
                    <div 
                      className={`w-full rounded-sm z-10 transition-all ${
                        candle.isGreen 
                          ? 'bg-green-400 hover:bg-green-300 shadow-[0_0_8px_rgba(74,222,128,0.3)]' 
                          : 'bg-red-400 hover:bg-red-300 shadow-[0_0_8px_rgba(248,113,113,0.3)]'
                      }`}
                      style={{ 
                        height: `${bodyHeight}%`,
                        bottom: `${bottomBody}%`
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Volume indicator bars at the bottom */}
            <div className="h-8 flex gap-3 items-end opacity-20 border-t border-white/5 pt-1 mt-2 z-10">
              {candles.map((candle, idx) => (
                <div 
                  key={idx} 
                  className={`flex-1 rounded-t-sm ${candle.isGreen ? 'bg-green-400' : 'bg-red-400'}`}
                  style={{ height: `${20 + (idx * 15) % 80}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Order Execution Side Panel */}
        <div className="bg-[#0F0F16] border border-white/5 rounded-xl p-5 space-y-4 shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/5 pb-3 flex justify-between items-center">
              <span>Passer un Ordre</span>
              <span className="text-cyan-400 font-mono text-[10px]">LEVIER x1 - x100</span>
            </h3>

            {/* Order Type Toggle */}
            <div className="grid grid-cols-2 gap-1 bg-[#08080C] p-1 rounded-lg border border-white/5">
              <button
                onClick={() => setOrderType('MARKET')}
                className={`py-1 rounded text-[10px] font-bold transition ${
                  orderType === 'MARKET' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'
                }`}
              >
                AU MARCHÉ
              </button>
              <button
                onClick={() => setOrderType('LIMIT')}
                className={`py-1 rounded text-[10px] font-bold transition ${
                  orderType === 'LIMIT' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'
                }`}
              >
                LIMITE
              </button>
            </div>

            {/* Margin Capital input */}
            <div>
              <label className="text-gray-400 text-[10px] uppercase block mb-1">Marge Engagée (Capital Propre)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500 font-bold">$</span>
                <input
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(Math.max(100, Number(e.target.value)))}
                  className="w-full bg-[#08080C] border border-white/10 text-white pl-7 pr-3 py-2.5 rounded focus:outline-none focus:border-cyan-400 font-bold font-mono text-sm"
                  step={1000}
                />
              </div>
            </div>

            {/* Limit Price Input if orderType is LIMIT */}
            {orderType === 'LIMIT' && (
              <div>
                <label className="text-gray-400 text-[10px] uppercase block mb-1">Prix de Déclenchement Limite</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 font-bold">$</span>
                  <input
                    type="number"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(Math.max(0.1, Number(e.target.value)))}
                    className="w-full bg-[#08080C] border border-white/10 text-cyan-300 pl-7 pr-3 py-2.5 rounded focus:outline-none focus:border-cyan-400 font-bold font-mono text-sm"
                  />
                </div>
              </div>
            )}

            {/* Leverage Slider */}
            <div>
              <div className="flex justify-between text-gray-400 text-[10px] uppercase mb-1">
                <span>Effet de Levier:</span>
                <span className="text-cyan-400 font-bold text-sm">x{leverage}</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={leverage}
                onChange={(e) => setLeverage(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[8px] text-gray-600 mt-0.5">
                <span>x1 (Aucun)</span>
                <span>x10</span>
                <span>x25</span>
                <span>x50</span>
                <span>x100 (Max)</span>
              </div>
            </div>

            {/* Advanced Take Profit / Stop Loss toggles */}
            <div className="space-y-2 border-t border-white/5 pt-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={useSL} 
                    onChange={(e) => setUseSL(e.target.checked)} 
                    className="rounded accent-cyan-400"
                  />
                  <span className="text-[10px] text-gray-400 uppercase">Stop Loss</span>
                </label>
                {useSL && (
                  <input
                    type="number"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(Number(e.target.value))}
                    className="w-24 bg-[#08080C] border border-white/10 text-white p-1 rounded font-mono text-center text-xs"
                  />
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={useTP} 
                    onChange={(e) => setUseTP(e.target.checked)} 
                    className="rounded accent-cyan-400"
                  />
                  <span className="text-[10px] text-gray-400 uppercase">Take Profit</span>
                </label>
                {useTP && (
                  <input
                    type="number"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(Number(e.target.value))}
                    className="w-24 bg-[#08080C] border border-white/10 text-white p-1 rounded font-mono text-center text-xs"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            {/* Position Information summary */}
            <div className="p-3 bg-[#08080C] rounded border border-white/5 space-y-1.5 text-[11px]">
              <p className="text-gray-400 flex justify-between">
                <span>Exposition Totale :</span> 
                <span className="text-white font-black">${(tradeAmount * leverage).toLocaleString()}</span>
              </p>
              <p className="text-amber-400 flex justify-between">
                <span>Seuil de Liquidation :</span> 
                <span className="font-bold">{-((1 / leverage) * 100).toFixed(1)}% ({leverage >= 10 ? 'Risque Élevé' : 'Risque Modéré'})</span>
              </p>
            </div>

            {/* Long and Short execution buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleExecuteTrade(true)}
                className="py-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 font-bold text-xs transition duration-150 cursor-pointer shadow-md flex flex-col items-center justify-center gap-1 uppercase"
              >
                <span>LONG (Achat)</span>
                <span className="text-[9px] font-mono text-green-500/70 font-normal">Hausse du cours</span>
              </button>
              <button
                onClick={() => handleExecuteTrade(false)}
                className="py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs transition duration-150 cursor-pointer shadow-md flex flex-col items-center justify-center gap-1 uppercase"
              >
                <span>SHORT (Vente)</span>
                <span className="text-[9px] font-mono text-red-500/70 font-normal">Baisse du cours</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Positions Portfolio view */}
      {currentPlayer.active_positions && currentPlayer.active_positions.length > 0 && (
        <div className="bg-[#0F0F16] border border-white/5 rounded-xl p-5 space-y-4 shadow-2xl font-mono">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/5 pb-3 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-cyan-400" />
            Vos Positions Actives de Trading à Effet de Levier
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 font-bold">
                  <th className="pb-3 pr-2">Symbole</th>
                  <th className="pb-3 pr-2">Sens</th>
                  <th className="pb-3 pr-2">Levier</th>
                  <th className="pb-3 pr-2">Prix d'Entrée</th>
                  <th className="pb-3 pr-2">Prix Actuel</th>
                  <th className="pb-3 pr-2">Seuil Liq.</th>
                  <th className="pb-3 pr-2">Marge / Exposition</th>
                  <th className="pb-3 pr-2">SL / TP</th>
                  <th className="pb-3 pr-2">PnL Non Réalisé</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPlayer.active_positions.map((pos) => {
                  const marketItem = state.market_prices.find(m => m.symbol === pos.symbol);
                  const currentPrice = marketItem ? marketItem.price : pos.entry_price;
                  const priceRatio = currentPrice / pos.entry_price;
                  
                  const pnlRatio = pos.is_long 
                    ? (priceRatio - 1) * pos.leverage
                    : (1 - priceRatio) * pos.leverage;

                  const pnlValue = pos.margin * pnlRatio;
                  const isPositive = pnlValue >= 0;

                  // Liquidation Price calculation
                  const liqPrice = pos.is_long
                    ? pos.entry_price * (1 - 0.90 / pos.leverage)
                    : pos.entry_price * (1 + 0.90 / pos.leverage);

                  return (
                    <tr key={pos.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-3 pr-2 font-bold text-white">{pos.symbol}</td>
                      <td className="py-3 pr-2">
                        <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase ${
                          pos.is_long 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {pos.is_long ? 'LONG' : 'SHORT'}
                        </span>
                      </td>
                      <td className="py-3 pr-2 text-cyan-400 font-bold">x{pos.leverage}</td>
                      <td className="py-3 pr-2 text-gray-300">${pos.entry_price.toLocaleString()}</td>
                      <td className="py-3 pr-2 text-white font-bold">${currentPrice.toLocaleString()}</td>
                      <td className="py-3 pr-2 text-amber-500 font-bold">${liqPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="py-3 pr-2 text-gray-400">
                        <span className="text-white">${pos.margin.toLocaleString()}</span>
                        <span className="block text-[10px] text-gray-500">Exp: ${pos.size.toLocaleString()}</span>
                      </td>
                      <td className="py-3 pr-2 text-[10px] text-gray-500">
                        <div>SL : {pos.stop_loss ? `$${pos.stop_loss}` : 'Aucun'}</div>
                        <div>TP : {pos.take_profit ? `$${pos.take_profit}` : 'Aucun'}</div>
                      </td>
                      <td className={`py-3 pr-2 font-black text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}${pnlValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className="block text-[10px] font-normal">({(pnlRatio * 100).toFixed(2)}%)</span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleClosePosition(pos.id)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 border border-white/10 hover:border-red-500/30 text-white font-bold transition duration-150 cursor-pointer"
                        >
                          Fermer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Server Bonds purchase panel */}
      <div className="bg-[#0F0F16] border border-purple-500/20 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-white uppercase">Obligations Sécurisées du Serveur (Bonds)</span>
          </div>
          <p className="text-xs text-gray-400 max-w-xl">
            Protégez votre capital des krachs boursiers. Souscrivez à des titres de créance virtuels qui rapportent un intérêt garanti de 4% payé à chaque fin de mois directement sur votre solde bancaire propre.
          </p>
        </div>

        <button
          onClick={handleBuyBond}
          className="px-5 py-2.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition duration-150 cursor-pointer shrink-0"
        >
          Souscrire Obligation ($1,000 @ +4%/mois)
        </button>
      </div>
    </div>
  );
};
