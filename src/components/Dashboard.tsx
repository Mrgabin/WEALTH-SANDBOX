import React from 'react';
import { FullGlobalState, ManagedProperty } from '../types/wealth';
import { 
  DollarSign, 
  Building, 
  ShieldCheck, 
  Cpu, 
  AlertTriangle, 
  Terminal, 
  Sparkles,
  TrendingUp,
  Percent,
  Coins,
  Gem,
  ArrowRight,
  Handshake,
  CheckCircle2
} from 'lucide-react';

interface DashboardProps {
  state: FullGlobalState;
  onNavigateTab: (tab: any) => void;
  onUpdateState: (newState: FullGlobalState) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, onNavigateTab, onUpdateState }) => {
  const currentPlayer = state.players[state.current_player_id] || Object.values(state.players)[0];
  const currentFarm = state.mining_farms[currentPlayer.id];

  // Hashrate & Watts calculation
  let totalHashrate = 0;
  let totalWatts = 0;
  if (currentFarm && currentFarm.rigs) {
    currentFarm.rigs.forEach(r => {
      if (r.wear_condition > 0.05) {
        const oc = r.overclocked ? 1.25 : 1.0;
        const coolingBoost = (currentFarm.cooling_type === 'LIQUID' && r.hashrate_th > 0) ? 1.08 : 1.0;
        totalHashrate += r.hashrate_th * r.wear_condition * oc * coolingBoost;
        totalWatts += r.watts_consumption * oc;
      }
    });
  }

  // Calculated revenues & taxes stats
  const isfLimit = state.server_config.isf_threshold;
  const isISFAffected = currentPlayer.bank_clean > isfLimit;
  const isfTaxEstimate = isISFAffected ? (currentPlayer.bank_clean - isfLimit) * state.server_config.isf_rate : 0;

  const totalCapital = currentPlayer.cash_dirty + currentPlayer.bank_clean;
  const cleanRatio = totalCapital > 0 ? (currentPlayer.bank_clean / totalCapital) * 100 : 50;

  // Real estate revenues
  let totalRealEstateValue = 0;
  let totalRentRevenueMonthly = 0;
  let ownedPropertiesCount = 0;

  state.real_estate_agencies.forEach(agency => {
    agency.managed_properties.forEach(prop => {
      if (prop.owner_id === currentPlayer.id) {
        totalRealEstateValue += prop.estimated_value;
        ownedPropertiesCount += 1;
        // Rent revenue if someone else or even themselves is tenant, but they receive the rent
        totalRentRevenueMonthly += prop.rent_monthly;
      }
    });
  });

  // Laundering capacity
  let totalLaunderingCapacity = 0;
  const playerBusinesses = state.laundering_businesses[currentPlayer.id] || [];
  playerBusinesses.forEach(b => {
    totalLaunderingCapacity += b.capacity_per_tick;
  });

  // Crypto revenues (approx per tick)
  const btcItem = state.market_prices.find(m => m.symbol === 'BTCUSDT');
  const btcPrice = btcItem ? btcItem.price : 92450;
  const minedBTC = (totalHashrate / state.server_config.global_net_hashrate_th) * state.server_config.btc_block_reward_24h;
  const cryptoRevenueTick = minedBTC * btcPrice; // approximate revenue per tick

  // Handler: Accept buyout offer for a property
  const handleAcceptBuyout = (propertyId: string, offerPrice: number) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[next.current_player_id];
    
    // Find the property inside the agency
    let foundProperty: ManagedProperty | null = null;
    next.real_estate_agencies.forEach(agency => {
      const prop = agency.managed_properties.find(p => p.property_id === propertyId);
      if (prop) {
        foundProperty = prop;
      }
    });

    if (!foundProperty) return;

    // Credit player
    player.bank_clean += offerPrice;
    
    // Log the transaction
    next.logs.unshift({
      id: `log_buyout_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: player.id,
      message: `RACHAT COMMERCE: ${player.name} a accepté l'offre de rachat de '${(foundProperty as ManagedProperty).name}' pour un montant exceptionnel de $${offerPrice.toLocaleString()}`,
      status: 'OK'
    });

    // Remove property owner or transfer to system/buyer
    (foundProperty as ManagedProperty).owner_id = 'npc_buyer_holding';
    (foundProperty as ManagedProperty).owner_name = 'Groupe d\'Investissement Omni';
    (foundProperty as ManagedProperty).tenant_id = undefined;
    (foundProperty as ManagedProperty).tenant_name = undefined;

    // Show a global grand popup for this beautiful buyout
    next.active_event = {
      id: `event_buyout_${Date.now()}`,
      title: "TRANSACTION IMMOBILIÈRE MAJEURE !",
      description: `Vous avez validé la vente de '${(foundProperty as ManagedProperty).name}' à un groupe d'investisseurs internationaux de premier plan. Les fonds ont été virés sur votre compte propre d'Omni.`,
      type: 'WINDFALL',
      severity: 'SUCCESS',
      impactText: `Crédit instantané de +$${offerPrice.toLocaleString()} sur votre solde bancaire.`
    };

    onUpdateState(next);
  };

  // Generate buyout offers for each owned property
  const buyoutOffers = [];
  state.real_estate_agencies.forEach(agency => {
    agency.managed_properties.forEach(prop => {
      if (prop.owner_id === currentPlayer.id) {
        const premiumMult = 1.35; // Offers are 1.35x value
        const offerPrice = Math.round(prop.estimated_value * premiumMult);
        
        // Premium buyers list based on property type
        let buyerName = "Fonds Souverain d'Omni";
        if (prop.type === 'DATA_CENTER') buyerName = "OmniTech Cloud Services";
        else if (prop.type === 'HANGAR') buyerName = "Logistique Global Express";
        else if (prop.type === 'APARTMENT') buyerName = "Syndicat Immobilier Privé";
        else if (prop.type === 'GARAGE') buyerName = "Atelier de Tuning Élite";

        buyoutOffers.push({
          propertyId: prop.property_id,
          propertyName: prop.name,
          buyerName,
          value: prop.estimated_value,
          offerPrice
        });
      }
    });
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner / Status Alert */}
      <div className="bg-[#0F0F16] border border-cyan-500/20 p-5 rounded-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -z-0 pointer-events-none"></div>
        <div className="z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
              WEALTH SANDBOX OMNI ENGINE
            </span>
            <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#22c55e]"></span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Aperçu Financier & Moteur P2P de <span className="text-cyan-400 font-mono">{currentPlayer.name}</span>
          </h1>
          <p className="text-xs text-gray-400 max-w-2xl">
            Système 100% régulé par les joueurs. Votre capital est séparé entre Cash Liquide (Dirty) et Argent Bancaire (Clean).
          </p>
        </div>

        <div className="z-10 flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('mining')}
            className="px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold transition cursor-pointer flex items-center gap-2"
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            Minage ({Math.round(totalHashrate)} TH/s)
          </button>
          <button
            onClick={() => onNavigateTab('laundering')}
            className="px-4 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-mono font-semibold transition cursor-pointer flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4 text-purple-400" />
            Blanchir Cash
          </button>
        </div>
      </div>

      {/* 4 Primary Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Dirty Cash */}
        <div className="bg-[#0F0F16] border border-red-500/20 p-5 rounded-xl shadow-xl relative overflow-hidden group hover:border-red-500/40 transition-all">
          <div className="flex justify-between items-start">
            <p className="text-[10px] uppercase font-bold text-red-400/80 tracking-widest">
              Argent Liquide (Dirty Cash)
            </p>
            <span className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-mono font-extrabold text-red-400 tracking-tight">
              ${currentPlayer.cash_dirty.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
            </span>
            <p className="text-[11px] text-gray-500 mt-1">Non traçable • Risque de confiscation</p>
          </div>
        </div>

        {/* Card 2: Clean Bank */}
        <div className="bg-[#0F0F16] border border-cyan-500/20 p-5 rounded-xl shadow-xl relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex justify-between items-start">
            <p className="text-[10px] uppercase font-bold text-cyan-400/80 tracking-widest">
              Solde Bancaire (Clean)
            </p>
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Building className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-mono font-extrabold text-cyan-400 tracking-tight">
              ${currentPlayer.bank_clean.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
            </span>
            <p className="text-[11px] text-gray-500 mt-1">Traçable • Accès Bourse & Taxes</p>
          </div>
        </div>

        {/* Card 3: Credit Score & ISF */}
        <div className="bg-[#0F0F16] border border-purple-500/20 p-5 rounded-xl shadow-xl relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex justify-between items-start">
            <p className="text-[10px] uppercase font-bold text-purple-400/80 tracking-widest">
              Score de Crédit & ISF
            </p>
            <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-mono font-extrabold text-purple-300">
                {currentPlayer.credit_score} <span className="text-xs text-gray-500 font-normal">/ 850</span>
              </span>
              <p className="text-[11px] text-gray-500 mt-1">
                {isISFAffected ? (
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> ISF Virtuel: -${isfTaxEstimate.toFixed(0)}/tick
                  </span>
                ) : (
                  <span className="text-green-400">Exonéré ISF (&lt;$1M)</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Card 4: Mining Hashrate */}
        <div className="bg-[#0F0F16] border border-green-500/20 p-5 rounded-xl shadow-xl relative overflow-hidden group hover:border-green-500/40 transition-all">
          <div className="flex justify-between items-start">
            <p className="text-[10px] uppercase font-bold text-green-400/80 tracking-widest">
              Puissance de Minage
            </p>
            <span className="p-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
              <Cpu className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-mono font-extrabold text-green-400 tracking-tight">
              {Math.round(totalHashrate)} <span className="text-sm font-normal text-gray-400">TH/s</span>
            </span>
            <p className="text-[11px] text-gray-500 mt-1">
              {currentPlayer.electricity_meter_hacked ? (
                <span className="text-red-400 font-bold">Compteur Piraté (Vol d'élec)</span>
              ) : (
                <span>Électricité légale ($0.12/kWh)</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Capital Clean / Dirty Ratio Bar */}
      <div className="bg-[#0F0F16] border border-white/5 p-5 rounded-xl space-y-3">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-gray-400">Répartition du Capital Total (${totalCapital.toLocaleString()})</span>
          <div className="flex items-center gap-4">
            <span className="text-cyan-400">Clean: {cleanRatio.toFixed(1)}%</span>
            <span className="text-red-400">Dirty: {(100 - cleanRatio).toFixed(1)}%</span>
          </div>
        </div>
        <div className="h-2.5 w-full bg-[#08080C] rounded-full overflow-hidden flex p-0.5 border border-white/5">
          <div 
            className="h-full bg-cyan-400 rounded-l-full transition-all duration-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
            style={{ width: `${cleanRatio}%` }}
          />
          <div 
            className="h-full bg-red-500 rounded-r-full transition-all duration-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
            style={{ width: `${100 - cleanRatio}%` }}
          />
        </div>
      </div>

      {/* NEW PANEL: Comprehensive Business Revenue Stats, Possessions & Buyout Offers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* STATS PANEL: Consolidated Revenues, Cash Flow, and Taxes */}
        <div className="bg-[#0F0F16] border border-white/5 rounded-xl overflow-hidden flex flex-col shadow-2xl">
          <div className="p-4 border-b border-white/5 bg-[#13131D] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs uppercase tracking-widest font-bold text-white font-mono">
                Statistiques Financières & Flux
              </h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              SYNCHRONISÉ
            </span>
          </div>

          <div className="p-4 bg-[#08080C] flex-1 space-y-4 font-mono text-xs">
            {/* Real Estate Yield */}
            <div className="bg-[#0F0F16] p-3.5 rounded-xl border border-white/5 space-y-1.5">
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>Rentes Immobilières:</span>
                <span className="text-green-400 font-bold">+${totalRentRevenueMonthly.toLocaleString()}/mois</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Patrimoine Estimé:</span>
                <span>${totalRealEstateValue.toLocaleString()} ({ownedPropertiesCount} actifs)</span>
              </div>
            </div>

            {/* Crypto Mining Yield */}
            <div className="bg-[#0F0F16] p-3.5 rounded-xl border border-white/5 space-y-1.5">
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>Rendement Minage/Tick:</span>
                <span className="text-cyan-400 font-bold">+${cryptoRevenueTick.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Conso d'Électricité:</span>
                <span>{(totalWatts / 1000).toFixed(1)} kW {currentPlayer.electricity_meter_hacked ? '(PIRATÉ)' : '($0.12/kWh)'}</span>
              </div>
            </div>

            {/* Laundering Capacity */}
            <div className="bg-[#0F0F16] p-3.5 rounded-xl border border-white/5 space-y-1.5">
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>Capacité de Blanchiment:</span>
                <span className="text-purple-400 font-bold">${totalLaunderingCapacity.toLocaleString()}/tick</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Commerces Actifs:</span>
                <span>{playerBusinesses.length} blanchisseries enregistrées</span>
              </div>
            </div>

            {/* Taxes Paid */}
            <div className="bg-[#0F0F16] p-3.5 rounded-xl border border-white/5 space-y-1.5">
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>TVA Serveur:</span>
                <span className="text-red-400 font-bold">{(state.server_config.tva_rate * 100)}% aux achats</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Taux ISF (&gt;$1M):</span>
                <span>{state.server_config.isf_rate * 100}% par tick de jeu</span>
              </div>
            </div>
          </div>
        </div>

        {/* LUXURY POSSESSIONS PANEL: Show off purchased prestigious luxury objects */}
        <div className="bg-[#0F0F16] border border-white/5 rounded-xl overflow-hidden flex flex-col shadow-2xl">
          <div className="p-4 border-b border-white/5 bg-[#13131D] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gem className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs uppercase tracking-widest font-bold text-white font-mono">
                Objets de Prestige & Possessions ({currentPlayer.possessions?.length || 0})
              </h2>
            </div>
            <button 
              onClick={() => onNavigateTab('shops')}
              className="text-[10px] font-mono text-amber-400 hover:underline cursor-pointer"
            >
              Acheter luxe
            </button>
          </div>

          <div className="p-4 bg-[#08080C] flex-1 max-h-[320px] overflow-y-auto space-y-3">
            {!currentPlayer.possessions || currentPlayer.possessions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 font-mono">
                <Gem className="w-8 h-8 text-gray-600 animate-pulse" />
                <p className="text-[11px] text-gray-500">Aucun objet de luxe possédé.</p>
                <p className="text-[9px] text-gray-600">Allez dans "Marchés & P2P" puis "Loisirs & Objets" pour acquérir des Rolex, Supercars, Yachts ou Jets privés !</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 font-mono text-xs">
                {currentPlayer.possessions.map((item, index) => {
                  let icon = "⏱️";
                  if (item.toLowerCase().includes('ferrari') || item.toLowerCase().includes('porsche') || item.toLowerCase().includes('bugatti') || item.toLowerCase().includes('tesla')) icon = "🏎️";
                  else if (item.toLowerCase().includes('jet') || item.toLowerCase().includes('gulfstream') || item.toLowerCase().includes('cessna')) icon = "✈️";
                  else if (item.toLowerCase().includes('yacht')) icon = "🛥️";
                  else if (item.toLowerCase().includes('villa') || item.toLowerCase().includes('penthouse')) icon = "🏢";
                  else if (item.toLowerCase().includes('bague') || item.toLowerCase().includes('birkin')) icon = "💎";

                  return (
                    <div key={index} className="bg-[#0F0F16] border border-white/5 p-3 rounded-xl flex items-center gap-3 hover:border-amber-500/20 transition">
                      <span className="text-xl shrink-0">{icon}</span>
                      <div className="text-left">
                        <p className="text-xs font-bold text-white leading-none">{item}</p>
                        <p className="text-[9px] text-amber-400/80 mt-1 uppercase font-semibold">Prestige Élite Garanti</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* UNSOLICITED ACQUISITION OFFERS (Offres de rachat d'actifs) */}
        <div className="bg-[#0F0F16] border border-white/5 rounded-xl overflow-hidden flex flex-col shadow-2xl">
          <div className="p-4 border-b border-white/5 bg-[#13131D] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Handshake className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs uppercase tracking-widest font-bold text-white font-mono">
                Offres de Rachat Actives ({buyoutOffers.length})
              </h2>
            </div>
            <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
              OFFRES DIRECTES
            </span>
          </div>

          <div className="p-4 bg-[#08080C] flex-1 max-h-[320px] overflow-y-auto space-y-3.5">
            {buyoutOffers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 font-mono">
                <Handshake className="w-8 h-8 text-gray-600 animate-pulse" />
                <p className="text-[11px] text-gray-500">Aucune offre de rachat active.</p>
                <p className="text-[9px] text-gray-600">Vous devez posséder des actifs immobiliers (Hangar, Héliport, Data Center) pour attirer des offres de rachat d'investisseurs.</p>
              </div>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                {buyoutOffers.map(offer => (
                  <div key={offer.propertyId} className="bg-[#0F0F16] border border-cyan-500/10 p-3.5 rounded-xl space-y-2.5 hover:border-cyan-500/35 transition">
                    <div>
                      <p className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider leading-none">Offre reçue de :</p>
                      <p className="text-sm font-black text-white mt-1 leading-none">{offer.buyerName}</p>
                    </div>

                    <div className="text-[11px] text-gray-400 space-y-1 bg-[#08080C] p-2 rounded border border-white/5">
                      <p className="flex justify-between">
                        <span>Actif visé:</span>
                        <span className="text-gray-200 font-bold">{offer.propertyName}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Valeur estimée:</span>
                        <span className="text-gray-400">${offer.value.toLocaleString()}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Offre de rachat:</span>
                        <span className="text-green-400 font-black">+${offer.offerPrice.toLocaleString()} (Clean)</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleAcceptBuyout(offer.propertyId, offer.offerPrice)}
                      className="w-full py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-500/40 text-green-300 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      Accepter et Vendre (+35% Premium)
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Terminal logs (moved below but preserved) */}
      <div className="grid grid-cols-1 gap-6">
        {/* Terminal Monitor */}
        <div className="bg-[#0F0F16] border border-white/5 rounded-xl overflow-hidden flex flex-col shadow-2xl">
          <div className="p-4 border-b border-white/5 bg-[#13131D] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs uppercase tracking-widest font-bold text-white font-mono">
                Real-time Database & Kernel Monitor
              </h2>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
              STREAMS ACTIVE [{state.logs.length}]
            </span>
          </div>

          <div className="p-4 font-mono text-xs space-y-2.5 max-h-[300px] overflow-y-auto bg-[#08080C]">
            {state.logs.slice(0, 15).map(log => {
              let borderClass = 'border-cyan-500/30 text-purple-300';
              if (log.status === 'ALERT' || log.type === 'AUTH_ERR') borderClass = 'border-red-500/40 text-red-400 bg-red-500/5';
              if (log.status === 'WARN' || log.type === 'TAX_ISF') borderClass = 'border-amber-500/40 text-amber-300';
              if (log.type === 'MINING') borderClass = 'border-green-500/30 text-green-300';

              return (
                <div key={log.id} className={`flex items-start gap-3 border-l-2 pl-3 py-1 ${borderClass}`}>
                  <span className="text-gray-500 shrink-0">[{log.timestamp}]</span>
                  <span className="font-bold shrink-0">{log.type}</span>
                  <span className="text-gray-300 break-words">{log.message}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
