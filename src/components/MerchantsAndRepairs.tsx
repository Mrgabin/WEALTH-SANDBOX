import React, { useState } from 'react';
import { FullGlobalState, MiningRig } from '../types/wealth';
import { Cpu, Watch, Car, Wrench, ShieldAlert, CheckCircle2, TrendingUp, DollarSign, ArrowUpRight, ShieldCheck, Hammer } from 'lucide-react';

interface MerchantsAndRepairsProps {
  state: FullGlobalState;
  onUpdateState: (newState: FullGlobalState) => void;
}

interface LuxuryWatchDeal {
  id: string;
  brand: string;
  model: string;
  buy_price: number;
  repair_cost: number;
  restored_sell_price: number;
  condition: number; // 0.1 to 0.4 (worn)
  is_repaired?: boolean;
}

interface SalvageCarDeal {
  id: string;
  brand: string;
  model: string;
  buy_price: number;
  repair_cost: number;
  restored_sell_price: number;
  condition: number; // 0.1 to 0.4 (damaged)
  is_repaired?: boolean;
}

export const MerchantsAndRepairs: React.FC<MerchantsAndRepairsProps> = ({ state, onUpdateState }) => {
  const currentPlayer = state.players[state.current_player_id] || Object.values(state.players)[0];
  const farm = state.mining_farms[currentPlayer.id];

  // Active sub-shop selection
  const [activeSubShop, setActiveSubShop] = useState<'it' | 'watch' | 'car'>('it');

  // Local state for Watch and Car Trading (persisted in player sessions conceptually or via state if we buy them)
  const [watchDeals, setWatchDeals] = useState<LuxuryWatchDeal[]>([
    { id: 'watch_1', brand: 'Rolex', model: 'Submariner Date Ref. 116610LN', buy_price: 5200, repair_cost: 1500, restored_sell_price: 11500, condition: 0.35 },
    { id: 'watch_2', brand: 'Patek Philippe', model: 'Nautilus Ref. 5711/1A', buy_price: 26000, repair_cost: 8500, restored_sell_price: 68000, condition: 0.25 },
    { id: 'watch_3', brand: 'Audemars Piguet', model: 'Royal Oak Ref. 15400ST', buy_price: 14000, repair_cost: 4500, restored_sell_price: 32000, condition: 0.3 },
    { id: 'watch_4', brand: 'Omega', model: 'Speedmaster Moonwatch Professional', buy_price: 2500, repair_cost: 800, restored_sell_price: 5900, condition: 0.4 },
    { id: 'watch_5', brand: 'Richard Mille', model: 'RM 11-03 Flyback Chronograph', buy_price: 65000, repair_cost: 20000, restored_sell_price: 165000, condition: 0.15 }
  ]);

  const [carDeals, setCarDeals] = useState<SalvageCarDeal[]>([
    { id: 'car_1', brand: 'Porsche', model: '911 Carrera S (992) - Suspension HS', buy_price: 28000, repair_cost: 14000, restored_sell_price: 64000, condition: 0.3 },
    { id: 'car_2', brand: 'Ferrari', model: 'F430 Spider - Boîte de Vitesse Morte', buy_price: 45000, repair_cost: 22000, restored_sell_price: 98000, condition: 0.2 },
    { id: 'car_3', brand: 'Tesla', model: 'Model S Plaid - Cellules Batterie HS', buy_price: 19000, repair_cost: 18000, restored_sell_price: 52000, condition: 0.15 },
    { id: 'car_4', brand: 'BMW', model: 'M4 Competition - Face Avant Accidentée', buy_price: 15000, repair_cost: 9500, restored_sell_price: 38000, condition: 0.35 },
    { id: 'car_5', brand: 'Audi', model: 'R8 V10 Spyder - Culasse Fêlée', buy_price: 38000, repair_cost: 25000, restored_sell_price: 85000, condition: 0.25 }
  ]);

  // Inventory of bought watches/cars for the active player (saved on the client local session state)
  const [playerWatches, setPlayerWatches] = useState<(LuxuryWatchDeal)[]>([]);
  const [playerCars, setPlayerCars] = useState<(SalvageCarDeal)[]>([]);

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showFeedback = (message: string, type: 'success' | 'error') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // --- 1. IT REPAIR / GPU RESTORATION HANDLERS ---
  const handleRepairGPU = (rigId: string) => {
    if (!farm) return;
    const rig = farm.rigs.find(r => r.rig_id === rigId);
    if (!rig) return;

    // Calculate dynamic repair price based on wear and chip type
    const wearMultiplier = 1.0 - rig.wear_condition;
    let baseGpuValue = 1800;
    if (rig.type.toLowerCase().includes('asic')) baseGpuValue = 5000;
    else if (rig.name.includes('5090')) baseGpuValue = 3500;
    else if (rig.name.includes('H100') || rig.name.includes('B200')) baseGpuValue = 25000;

    const price = Math.round(baseGpuValue * wearMultiplier * 0.6); // 60% of damage value to repair

    if (currentPlayer.bank_clean < price) {
      showFeedback(`Fonds propres insuffisants ! Il vous faut $${price.toLocaleString()} propres en banque.`, 'error');
      return;
    }

    // Process repair
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const nextPlayer = next.players[currentPlayer.id];
    const nextFarm = next.mining_farms[currentPlayer.id];
    const nextRig = nextFarm.rigs.find(r => r.rig_id === rigId);

    if (nextRig && nextPlayer) {
      nextPlayer.bank_clean -= price;
      nextRig.wear_condition = 1.0; // Restored to mint condition!
      
      // Unlock achievement if GPU was dead (< 5% wear)
      const isRevivingDead = rig.wear_condition <= 0.05;
      if (isRevivingDead) {
        if (!nextPlayer.achievements) nextPlayer.achievements = [];
        if (!nextPlayer.achievements.includes('ach_first_rig')) {
          // This ensures achievements structure is safe
        }
      }

      next.logs.unshift({
        id: `log_repair_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'DB_WRITE',
        uid: currentPlayer.id,
        message: `ATELIER INFORMATIQUE : ${currentPlayer.name} a fait réparer son GPU '${rig.name}' à neuf pour $${price.toLocaleString()} (Usure résolue).`,
        status: 'OK'
      });

      onUpdateState(next);
      showFeedback(`Félicitations, votre matériel '${rig.name}' a été restauré à 100% !`, 'success');
    }
  };

  // --- 2. LUXURY WATCH TRADING HANDLERS ---
  const handleBuyWatch = (deal: LuxuryWatchDeal) => {
    if (currentPlayer.bank_clean < deal.buy_price) {
      showFeedback(`Fonds propres insuffisants en banque pour acquérir cette ${deal.brand}.`, 'error');
      return;
    }

    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const nextPlayer = next.players[currentPlayer.id];
    if (nextPlayer) {
      nextPlayer.bank_clean -= deal.buy_price;
      
      // Add watch to player watches
      setPlayerWatches(prev => [...prev, { ...deal }]);
      // Remove deal from available
      setWatchDeals(prev => prev.filter(w => w.id !== deal.id));

      next.logs.unshift({
        id: `log_buy_watch_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'DB_WRITE',
        uid: currentPlayer.id,
        message: `RÉPARATEUR HORLOGER : Achat d'une montre de luxe d'occasion '${deal.brand} ${deal.model}' pour $${deal.buy_price.toLocaleString()}`,
        status: 'OK'
      });

      onUpdateState(next);
      showFeedback(`Vous avez acquis la ${deal.brand} ${deal.model} d'occasion ! Amenez-la à l'atelier de polissage.`, 'success');
    }
  };

  const handleRepairWatch = (watchId: string) => {
    const watch = playerWatches.find(w => w.id === watchId);
    if (!watch) return;

    if (currentPlayer.bank_clean < watch.repair_cost) {
      showFeedback(`Il vous faut $${watch.repair_cost.toLocaleString()} propres pour restaurer ce garde-temps.`, 'error');
      return;
    }

    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const nextPlayer = next.players[currentPlayer.id];
    if (nextPlayer) {
      nextPlayer.bank_clean -= watch.repair_cost;

      setPlayerWatches(prev => prev.map(w => w.id === watchId ? { ...w, is_repaired: true, condition: 1.0 } : w));

      next.logs.unshift({
        id: `log_repair_watch_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'DB_WRITE',
        uid: currentPlayer.id,
        message: `RÉPARATEUR HORLOGER : Restauration, lubrification & polissage d'une ${watch.brand} pour $${watch.repair_cost.toLocaleString()}.`,
        status: 'OK'
      });

      onUpdateState(next);
      showFeedback(`La montre ${watch.brand} est désormais dans un état NEUF étincelant !`, 'success');
    }
  };

  const handleSellWatch = (watchId: string) => {
    const watch = playerWatches.find(w => w.id === watchId);
    if (!watch) return;

    // Repaired watches fetch full value; broken ones fetch only 80% of buy price
    const finalPrice = watch.is_repaired ? watch.restored_sell_price : Math.round(watch.buy_price * 0.8);

    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const nextPlayer = next.players[currentPlayer.id];
    if (nextPlayer) {
      nextPlayer.bank_clean += finalPrice;

      setPlayerWatches(prev => prev.filter(w => w.id !== watchId));
      
      // Regenerate the deal in shop with a slightly shifted id for replayability
      const newDeal: LuxuryWatchDeal = {
        ...watch,
        id: `watch_deal_${Date.now()}`,
        is_repaired: false,
        condition: Number((0.15 + Math.random() * 0.25).toFixed(2))
      };
      setWatchDeals(prev => [...prev, newDeal]);

      // Unlock "Contrebandier / Luxe" achievement if watch sold for > 50K profit
      const profit = finalPrice - watch.buy_price - (watch.is_repaired ? watch.repair_cost : 0);
      if (profit > 10000) {
        if (!nextPlayer.achievements) nextPlayer.achievements = [];
        if (!nextPlayer.achievements.includes('ach_launder_king')) {
          nextPlayer.achievements.push('ach_launder_king');
          next.logs.unshift({
            id: `log_ach_launder_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            type: 'DB_WRITE',
            uid: currentPlayer.id,
            message: `🏆 SUCCÈS DÉVERROUILLÉ: 'Négociant d'Élite' pour ${currentPlayer.name} ! (Bénéfice de +$10k sur un commerce de luxe)`,
            status: 'OK'
          });
        }
      }

      next.logs.unshift({
        id: `log_sell_watch_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'DB_WRITE',
        uid: currentPlayer.id,
        message: `RÉPARATEUR HORLOGER : Vente d'une '${watch.brand} ${watch.model}' restaurée pour un montant de $${finalPrice.toLocaleString()}`,
        status: 'OK'
      });

      onUpdateState(next);
      showFeedback(`Montre vendue avec succès à un collectionneur pour $${finalPrice.toLocaleString()} !`, 'success');
    }
  };

  // --- 3. CAR SALVAGE & RESTORATION HANDLERS ---
  const handleBuyCar = (deal: SalvageCarDeal) => {
    if (currentPlayer.bank_clean < deal.buy_price) {
      showFeedback(`Fonds propres insuffisants en banque pour acquérir ce véhicule accidenté.`, 'error');
      return;
    }

    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const nextPlayer = next.players[currentPlayer.id];
    if (nextPlayer) {
      nextPlayer.bank_clean -= deal.buy_price;
      
      setPlayerCars(prev => [...prev, { ...deal }]);
      setCarDeals(prev => prev.filter(c => c.id !== deal.id));

      next.logs.unshift({
        id: `log_buy_car_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'DB_WRITE',
        uid: currentPlayer.id,
        message: `GARAGE AUTOMOBILE : Acquisition d'un véhicule accidenté '${deal.brand} ${deal.model}' pour $${deal.buy_price.toLocaleString()}`,
        status: 'OK'
      });

      onUpdateState(next);
      showFeedback(`Véhicule ${deal.brand} acheté ! Envoyez-le sur le pont élévateur pour démontage et réfection.`, 'success');
    }
  };

  const handleRepairCar = (carId: string) => {
    const car = playerCars.find(c => c.id === carId);
    if (!car) return;

    if (currentPlayer.bank_clean < car.repair_cost) {
      showFeedback(`Il vous faut $${car.repair_cost.toLocaleString()} propres pour acheter les pièces de rechange et payer les mécaniciens.`, 'error');
      return;
    }

    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const nextPlayer = next.players[currentPlayer.id];
    if (nextPlayer) {
      nextPlayer.bank_clean -= car.repair_cost;

      setPlayerCars(prev => prev.map(c => c.id === carId ? { ...c, is_repaired: true, condition: 1.0 } : c));

      next.logs.unshift({
        id: `log_repair_car_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'DB_WRITE',
        uid: currentPlayer.id,
        message: `GARAGE AUTOMOBILE : Réfection moteur, tolerie & peinture sur la ${car.brand} pour $${car.repair_cost.toLocaleString()}.`,
        status: 'OK'
      });

      onUpdateState(next);
      showFeedback(`Le véhicule ${car.brand} est restauré à neuf, prêt à rugir sur l'asphalte !`, 'success');
    }
  };

  const handleSellCar = (carId: string) => {
    const car = playerCars.find(c => c.id === carId);
    if (!car) return;

    const finalPrice = car.is_repaired ? car.restored_sell_price : Math.round(car.buy_price * 0.75);

    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const nextPlayer = next.players[currentPlayer.id];
    if (nextPlayer) {
      nextPlayer.bank_clean += finalPrice;

      setPlayerCars(prev => prev.filter(c => c.id !== carId));
      
      const newDeal: SalvageCarDeal = {
        ...car,
        id: `car_deal_${Date.now()}`,
        is_repaired: false,
        condition: Number((0.15 + Math.random() * 0.2).toFixed(2))
      };
      setCarDeals(prev => [...prev, newDeal]);

      next.logs.unshift({
        id: `log_sell_car_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'DB_WRITE',
        uid: currentPlayer.id,
        message: `GARAGE AUTOMOBILE : Revente de '${car.brand} ${car.model}' entièrement restaurée pour $${finalPrice.toLocaleString()}`,
        status: 'OK'
      });

      onUpdateState(next);
      showFeedback(`Véhicule vendu pour $${finalPrice.toLocaleString()} ! Superbe plus-value.`, 'success');
    }
  };


  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-[#0F0F16] border border-purple-500/20 p-5 rounded-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -z-0 pointer-events-none"></div>
        <div className="z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-purple-400 uppercase tracking-widest font-bold">
              MAIN CONTROLS : MARCHANDS & ATELIERS
            </span>
            <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]"></span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            Magasin Marchands & Réparations Spécialisées
          </h1>
          <p className="text-xs text-gray-400 max-w-2xl">
            Restaurez vos mineurs et explorez l'économie parallèle d'achat-revente de montres de prestige ou de supercars accidentées.
          </p>
        </div>

        <div className="z-10 flex items-center gap-1.5 p-1 bg-[#08080C] rounded-lg border border-white/5 font-mono text-[11px]">
          <span className="text-gray-500 px-2 py-1">Solde propre:</span>
          <span className="text-green-400 font-bold bg-green-950/30 px-2.5 py-1 rounded">
            ${currentPlayer.bank_clean.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Floating Alert Feedback */}
      {feedback && (
        <div className={`p-4 rounded-xl border font-mono text-xs shadow-xl animate-fade-in flex items-center gap-3 ${
          feedback.type === 'success' ? 'bg-green-950/20 border-green-500/30 text-green-300' : 'bg-red-950/20 border-red-500/30 text-red-300'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <ShieldAlert className="w-4 h-4 text-red-400" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Inner Shop Switcher Tabs */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => setActiveSubShop('it')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-mono font-bold tracking-wider uppercase border-b-2 transition cursor-pointer ${
            activeSubShop === 'it' 
              ? 'border-cyan-400 text-cyan-300 bg-cyan-950/5' 
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4 text-cyan-400" />
          Réparateur Informatique (GPUs/ASICs)
        </button>

        <button
          onClick={() => setActiveSubShop('watch')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-mono font-bold tracking-wider uppercase border-b-2 transition cursor-pointer ${
            activeSubShop === 'watch' 
              ? 'border-amber-500 text-amber-400 bg-amber-950/5' 
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Watch className="w-4 h-4 text-amber-400" />
          Réparateur Horloger (Rolex/Patek)
        </button>

        <button
          onClick={() => setActiveSubShop('car')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-mono font-bold tracking-wider uppercase border-b-2 transition cursor-pointer ${
            activeSubShop === 'car' 
              ? 'border-red-500 text-red-400 bg-red-950/5' 
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Car className="w-4 h-4 text-red-400" />
          Réparateur de Voitures (Supercars)
        </button>
      </div>

      {/* SHOP CONTENT PANELS */}
      {activeSubShop === 'it' && (
        <div className="space-y-4">
          <div className="bg-[#0A0A0E] border border-white/5 p-4 rounded-xl space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-cyan-400" /> Remise en état de vos puces & rigs
            </h3>
            <p className="text-xs text-gray-400">
              Chaque rig ou puce s'use au fil du temps. En dessous de 5% de condition, les cartes s'arrêtent et passent HS. Confiez-les aux techniciens de l'atelier pour une réfection de pâte thermique, ventilateurs et condensateurs.
            </p>
          </div>

          {!farm || farm.rigs.length === 0 ? (
            <div className="bg-[#0F0F16] border border-white/5 p-8 rounded-xl text-center text-gray-500 text-xs font-mono">
              Aucun rig ou carte installée dans votre ferme de minage pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {farm.rigs.map(rig => {
                const isWorn = rig.wear_condition < 1.0;
                const isDead = rig.wear_condition <= 0.05;
                const wearPercent = Math.round(rig.wear_condition * 100);

                // Calculate repair cost
                const damageLevel = 1.0 - rig.wear_condition;
                let baseVal = 1800;
                if (rig.type.toLowerCase().includes('asic')) baseVal = 5000;
                else if (rig.name.includes('5090')) baseVal = 3500;
                else if (rig.name.includes('H100') || rig.name.includes('B200')) baseVal = 25000;
                const repairCost = Math.round(baseVal * damageLevel * 0.6);

                return (
                  <div key={rig.rig_id} className="bg-[#0F0F16] border border-white/5 rounded-xl p-4 space-y-3 shadow-md relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-mono bg-white/5 text-gray-400 px-1.5 py-0.5 rounded uppercase font-bold">
                          {rig.type}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1.5">{rig.name}</h4>
                      </div>
                      {isDead ? (
                        <span className="text-[10px] font-mono bg-red-950 text-red-400 border border-red-900/50 px-2 py-0.5 rounded font-black uppercase animate-pulse">
                          H.S / Mort
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-cyan-400 font-bold">
                          Condition: {wearPercent}%
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            isDead ? 'bg-red-500' : wearPercent < 50 ? 'bg-amber-500' : 'bg-cyan-400'
                          }`}
                          style={{ width: `${wearPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono text-xs">
                      <div>
                        <p className="text-[10px] text-gray-500">Coût de réfection</p>
                        <p className={`font-bold ${isWorn ? 'text-cyan-300' : 'text-gray-400'}`}>
                          {isWorn ? `$${repairCost.toLocaleString()}` : 'AUCUN'}
                        </p>
                      </div>

                      {isWorn ? (
                        <button
                          onClick={() => handleRepairGPU(rig.rig_id)}
                          className="px-3 py-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold tracking-wider transition cursor-pointer"
                        >
                          Réparer à neuf
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] text-green-400 font-bold bg-green-950/20 px-2 py-1 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5" /> À Neuf
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeSubShop === 'watch' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section: Available salvage watches */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-2">
              <Hammer className="w-4 h-4 text-amber-500 animate-bounce" /> Marché des montres abîmées & usées
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {watchDeals.length === 0 ? (
                <div className="bg-[#0F0F16] border border-white/5 p-8 rounded-xl text-center text-gray-500 text-xs font-mono col-span-2">
                  Aucun arrivage de montre cassée pour le moment. Revenez bientôt !
                </div>
              ) : (
                watchDeals.map(deal => (
                  <div key={deal.id} className="bg-[#0F0F16] border border-white/5 rounded-xl p-4 space-y-4 shadow-md relative group hover:border-amber-500/30 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono text-amber-500 font-bold uppercase">{deal.brand}</span>
                        <h4 className="text-sm font-bold text-white mt-1 leading-tight">{deal.model}</h4>
                      </div>
                      <span className="text-[10px] font-mono text-red-400 bg-red-950/30 px-2 py-0.5 rounded border border-red-900/30 font-bold uppercase">
                        Usure: {Math.round((1 - deal.condition) * 100)}%
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center font-mono text-[10px] text-gray-400">
                      <div className="bg-[#08080C] p-2 rounded">
                        <p className="text-gray-500">Prix d'Achat</p>
                        <p className="font-bold text-white mt-0.5">${deal.buy_price.toLocaleString()}</p>
                      </div>
                      <div className="bg-[#08080C] p-2 rounded">
                        <p className="text-gray-500">Restauration</p>
                        <p className="font-bold text-amber-300 mt-0.5">${deal.repair_cost.toLocaleString()}</p>
                      </div>
                      <div className="bg-[#08080C] p-2 rounded">
                        <p className="text-gray-500">Valeur Neuf</p>
                        <p className="font-bold text-green-400 mt-0.5">${deal.restored_sell_price.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono text-xs">
                      <div className="text-green-400 font-extrabold flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        Est. Plus-value: +${(deal.restored_sell_price - deal.buy_price - deal.repair_cost).toLocaleString()}
                      </div>
                      <button
                        onClick={() => handleBuyWatch(deal)}
                        className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-black font-bold transition text-[11px] cursor-pointer"
                      >
                        Acheter
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar: Player watch inventory to polish and sell */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              Votre Établi Horloger ({playerWatches.length})
            </h3>

            {playerWatches.length === 0 ? (
              <div className="bg-[#0F0F16] border border-white/5 p-6 rounded-xl text-center text-gray-500 text-xs font-mono">
                Vous n'avez aucune montre en cours de restauration. Achetez-en une sur le marché !
              </div>
            ) : (
              <div className="space-y-3">
                {playerWatches.map(watch => (
                  <div key={watch.id} className="bg-[#0A0A0E] border border-white/10 p-3.5 rounded-xl space-y-3 shadow-md">
                    <div>
                      <p className="text-[10px] font-mono text-amber-500 font-bold">{watch.brand}</p>
                      <h4 className="text-xs font-bold text-white mt-0.5 leading-tight">{watch.model}</h4>
                    </div>

                    <div className="flex justify-between items-center text-[11px] font-mono bg-white/5 p-2 rounded">
                      <span className="text-gray-400">Statut:</span>
                      {watch.is_repaired ? (
                        <span className="text-green-400 font-bold uppercase flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Restaurée à Neuf
                        </span>
                      ) : (
                        <span className="text-red-400 font-bold uppercase">Abîmée</span>
                      )}
                    </div>

                    <div className="flex gap-2 justify-end font-mono text-[11px]">
                      {!watch.is_repaired && (
                        <button
                          onClick={() => handleRepairWatch(watch.id)}
                          className="px-2.5 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold transition cursor-pointer"
                        >
                          Polir (${watch.repair_cost.toLocaleString()})
                        </button>
                      )}
                      <button
                        onClick={() => handleSellWatch(watch.id)}
                        className={`px-3 py-1.5 rounded font-bold transition cursor-pointer ${
                          watch.is_repaired ? 'bg-green-500 text-black hover:bg-green-600' : 'bg-white/10 hover:bg-white/15 text-white'
                        }`}
                      >
                        Vendre (${(watch.is_repaired ? watch.restored_sell_price : Math.round(watch.buy_price * 0.8)).toLocaleString()})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubShop === 'car' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section: Available salvage cars */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-red-400 font-bold flex items-center gap-2">
              <Hammer className="w-4 h-4 text-red-500 animate-bounce" /> Véhicules Accidentés de Saisie ou d'Encan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {carDeals.length === 0 ? (
                <div className="bg-[#0F0F16] border border-white/5 p-8 rounded-xl text-center text-gray-500 text-xs font-mono col-span-2">
                  Aucun arrivage automobile cassé pour le moment. Revenez bientôt !
                </div>
              ) : (
                carDeals.map(deal => (
                  <div key={deal.id} className="bg-[#0F0F16] border border-white/5 rounded-xl p-4 space-y-4 shadow-md relative group hover:border-red-500/30 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono text-red-500 font-bold uppercase">{deal.brand}</span>
                        <h4 className="text-sm font-bold text-white mt-1 leading-tight">{deal.model}</h4>
                      </div>
                      <span className="text-[10px] font-mono text-red-400 bg-red-950/30 px-2 py-0.5 rounded border border-red-900/30 font-bold uppercase">
                        État carosserie: {Math.round(deal.condition * 100)}%
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center font-mono text-[10px] text-gray-400">
                      <div className="bg-[#08080C] p-2 rounded">
                        <p className="text-gray-500">Prix Cassé</p>
                        <p className="font-bold text-white mt-0.5">${deal.buy_price.toLocaleString()}</p>
                      </div>
                      <div className="bg-[#08080C] p-2 rounded">
                        <p className="text-gray-500">Pièces & Main</p>
                        <p className="font-bold text-red-300 mt-0.5">${deal.repair_cost.toLocaleString()}</p>
                      </div>
                      <div className="bg-[#08080C] p-2 rounded">
                        <p className="text-gray-500">Valeur Argus</p>
                        <p className="font-bold text-green-400 mt-0.5">${deal.restored_sell_price.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono text-xs">
                      <div className="text-green-400 font-extrabold flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        Est. Profit: +${(deal.restored_sell_price - deal.buy_price - deal.repair_cost).toLocaleString()}
                      </div>
                      <button
                        onClick={() => handleBuyCar(deal)}
                        className="px-3 py-1.5 rounded bg-red-500 hover:bg-red-600 text-white font-bold transition text-[11px] cursor-pointer"
                      >
                        Acheter l'Épave
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar: Player car inventory to restore and sell */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              Votre Atelier Automobile ({playerCars.length})
            </h3>

            {playerCars.length === 0 ? (
              <div className="bg-[#0F0F16] border border-white/5 p-6 rounded-xl text-center text-gray-500 text-xs font-mono">
                Vous n'avez aucun véhicule sur le pont de levage. Achetez une épave à gauche !
              </div>
            ) : (
              <div className="space-y-3">
                {playerCars.map(car => (
                  <div key={car.id} className="bg-[#0A0A0E] border border-white/10 p-3.5 rounded-xl space-y-3 shadow-md">
                    <div>
                      <p className="text-[10px] font-mono text-red-500 font-bold">{car.brand}</p>
                      <h4 className="text-xs font-bold text-white mt-0.5 leading-tight">{car.model}</h4>
                    </div>

                    <div className="flex justify-between items-center text-[11px] font-mono bg-white/5 p-2 rounded">
                      <span className="text-gray-400">Statut mécanique:</span>
                      {car.is_repaired ? (
                        <span className="text-green-400 font-bold uppercase flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Prête à Rouler
                        </span>
                      ) : (
                        <span className="text-red-400 font-bold uppercase">Pont de Levage</span>
                      )}
                    </div>

                    <div className="flex gap-2 justify-end font-mono text-[11px]">
                      {!car.is_repaired && (
                        <button
                          onClick={() => handleRepairCar(car.id)}
                          className="px-2.5 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 font-bold transition cursor-pointer"
                        >
                          Restaurer (${car.repair_cost.toLocaleString()})
                        </button>
                      )}
                      <button
                        onClick={() => handleSellCar(car.id)}
                        className={`px-3 py-1.5 rounded font-bold transition cursor-pointer ${
                          car.is_repaired ? 'bg-green-500 text-black hover:bg-green-600' : 'bg-white/10 hover:bg-white/15 text-white'
                        }`}
                      >
                        Vendre (${(car.is_repaired ? car.restored_sell_price : Math.round(car.buy_price * 0.7)).toLocaleString()})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
