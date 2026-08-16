import React from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Zap, 
  Activity, 
  AlertTriangle, 
  Landmark, 
  Percent, 
  DollarSign, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';
import { FullGlobalState } from '../types/wealth';

interface ChargesTabProps {
  state: FullGlobalState;
  onUpdateState: (state: FullGlobalState) => void;
}

export const ChargesTab: React.FC<ChargesTabProps> = ({ state, onUpdateState }) => {
  const player = state.players[state.current_player_id] || Object.values(state.players)[0];
  
  if (!player) return null;

  // Ensure arrays exist
  const activeSubs = player.active_subscriptions || [];
  const playerShops = state.player_shops.filter(s => s.owner_id === player.id);
  const activePositions = player.active_positions || [];

  // 1. Calculate Wealth and ISF
  const totalWealth = player.bank_clean + player.cash_dirty;
  const isfThreshold = state.server_config.isf_threshold;
  const isSubjectToISF = totalWealth > isfThreshold;
  const taxableAmount = Math.max(0, totalWealth - isfThreshold);
  const estimatedISF = taxableAmount * 0.01;

  // 2. Calculate Shop Taxes
  const totalShopTaxes = playerShops.reduce((sum, shop) => sum + shop.monthly_taxes_due, 0);

  // 3. Subscriptions Available
  const subscriptionsPool = [
    { 
      id: 'vpn_premium', 
      name: 'VPN CyberShield Premium', 
      cost: 100, 
      icon: <ShieldCheck className="w-5 h-5 text-cyan-400" />,
      description: "Crypte vos activités réseau virtuelles. Réduit le risque d'audit fiscal sur votre compteur piraté de 3% à seulement 0.5% par cycle.",
      benefit: "Risque d'Audit Électrique -83%"
    },
    { 
      id: 'garde_du_corps', 
      name: 'Service de Protection & Garde du Corps', 
      cost: 500, 
      icon: <UserCheck className="w-5 h-5 text-purple-400" />,
      description: "Garde du corps armé d'élite à vos côtés lors de vos déplacements de fonds. Bloque à 100% les agressions et vols de liquide dans la rue.",
      benefit: "Protection Agression de Rue 100%"
    },
    { 
      id: 'green_electricity', 
      name: 'Abonnement Énergie Tarif Vert', 
      cost: 250, 
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
      description: "Négocie l'achat de kilowatts-heures d'origine verte en gros volume. Réduit de 25% la facture d'électricité de votre ferme de minage crypto.",
      benefit: "Coût électricité -25%"
    }
  ];

  // Toggle subscription helper
  const handleToggleSubscription = (subId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const p = next.players[player.id];

    if (!p.active_subscriptions) p.active_subscriptions = [];

    const isSubscribed = p.active_subscriptions.includes(subId);
    const subInfo = subscriptionsPool.find(s => s.id === subId);

    if (isSubscribed) {
      // Unsubscribe
      p.active_subscriptions = p.active_subscriptions.filter(id => id !== subId);
      
      next.logs.unshift({
        id: `log_sub_cancel_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'DB_WRITE',
        uid: player.id,
        message: `ABONNEMENT : ${p.name} s'est désabonné de '${subInfo?.name}'`,
        status: 'WARN'
      });
      alert(`Vous vous êtes désabonné de ${subInfo?.name}.`);
    } else {
      // Subscribe (check if has enough money for first month/billing)
      if (p.bank_clean < (subInfo?.cost || 0)) {
        alert(`Fonds bancaires propres insuffisants pour activer l'abonnement ($${subInfo?.cost} requis).`);
        return;
      }
      p.bank_clean -= subInfo?.cost || 0;
      p.active_subscriptions.push(subId);

      next.logs.unshift({
        id: `log_sub_opt_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'DB_WRITE',
        uid: player.id,
        message: `ABONNEMENT : ${p.name} a souscrit à '${subInfo?.name}' (-$${subInfo?.cost})`,
        status: 'OK'
      });
      alert(`Abonnement activé avec succès ! Frais de mise en service prélevés : $${subInfo?.cost}`);
    }

    onUpdateState(next);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Tab Title */}
      <div>
        <h1 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400 animate-pulse" />
          Dashboard Fiscalité & Abonnements
        </h1>
        <p className="text-xs text-gray-400">
          Gérez vos charges mensuelles récurrentes, optimisez vos taxes et sécurisez vos actifs grâce à nos abonnements spécialisés.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Subscriptions & Protection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0F0F16] border border-white/5 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/5 pb-2">
              🛡️ SERVICES SÉCURITÉ & LOGISTIQUE EN LIGNE
            </h3>

            <div className="space-y-4">
              {subscriptionsPool.map(sub => {
                const isSubbed = activeSubs.includes(sub.id);
                return (
                  <div 
                    key={sub.id}
                    className={`p-4 rounded-xl border transition-all duration-150 ${
                      isSubbed 
                        ? 'bg-purple-950/10 border-purple-500/30' 
                        : 'bg-[#08080C] border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${isSubbed ? 'bg-purple-500/20' : 'bg-white/5'}`}>
                          {sub.icon}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-white flex items-center gap-2">
                            {sub.name}
                            {isSubbed && (
                              <span className="text-[8px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded uppercase font-bold">
                                ACTIF
                              </span>
                            )}
                          </h4>
                          <p className="text-[10px] text-gray-400 leading-relaxed max-w-lg">
                            {sub.description}
                          </p>
                          <div className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5 pt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                            Bénéfice : {sub.benefit}
                          </div>
                        </div>
                      </div>

                      <div className="text-right space-y-2 shrink-0">
                        <div className="text-xs font-black text-white">${sub.cost}/mois</div>
                        <button
                          onClick={() => handleToggleSubscription(sub.id)}
                          className={`px-3 py-1.5 rounded text-[10px] font-black tracking-widest uppercase transition-all cursor-pointer ${
                            isSubbed
                              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                              : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20'
                          }`}
                        >
                          {isSubbed ? 'Résilier' : 'Souscrire'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Leverage Positions List */}
          <div className="bg-[#0F0F16] border border-white/5 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/5 pb-2">
              📈 ENGAGEMENTS DE BOURSE EN COURS
            </h3>
            
            {activePositions.length === 0 ? (
              <p className="text-[10px] text-gray-500 text-center py-4">Aucun engagement ou effet de levier actif en bourse actuellement.</p>
            ) : (
              <div className="space-y-2">
                {activePositions.map((pos) => {
                  const marketItem = state.market_prices.find(m => m.symbol === pos.symbol);
                  const curPrice = marketItem ? marketItem.price : pos.entry_price;
                  const ratio = curPrice / pos.entry_price;
                  const pnl = pos.is_long ? (ratio - 1) * pos.leverage : (1 - ratio) * pos.leverage;
                  const pnlAmount = pos.margin * pnl;
                  const isPositive = pnlAmount >= 0;

                  return (
                    <div key={pos.id} className="p-3 bg-[#08080C] border border-white/5 rounded-lg flex justify-between items-center text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{pos.symbol}</span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            pos.is_long ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {pos.is_long ? 'LONG' : 'SHORT'} x{pos.leverage}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500">
                          Entrée: <span className="text-gray-300">${pos.entry_price}</span> | Actuel: <span className="text-gray-300">${curPrice}</span>
                        </div>
                        <div className="text-[10px] text-gray-500">
                          Marge engagée: <span className="text-cyan-400">${pos.margin.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className={`font-black ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {isPositive ? '+' : ''}${pnlAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[9px] text-gray-500">
                          SL: {pos.stop_loss ? `$${pos.stop_loss}` : 'Aucun'} | TP: {pos.take_profit ? `$${pos.take_profit}` : 'Aucun'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tax Audit & Fiscal Obligations */}
        <div className="space-y-6">
          
          {/* Virtual ISF Widget */}
          <div className="bg-[#0F0F16] border border-white/5 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/5 pb-2">
              ⚖️ IMPÔT SUR LA FORTUNE (ISF)
            </h3>

            <div className="bg-[#08080C] border border-white/5 rounded-xl p-4 space-y-3 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-gray-400 uppercase">Fortune Totale Active</span>
                <span className="text-sm font-black text-white font-mono">${totalWealth.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-[10px] text-gray-400 uppercase">Seuil d'Exemption (ISF)</span>
                <span className="text-xs font-bold text-cyan-400 font-mono">${isfThreshold.toLocaleString()}</span>
              </div>

              <div className="border-t border-white/5 pt-2.5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 uppercase">Statut Fiscal</span>
                  {isSubjectToISF ? (
                    <span className="text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-red-400" /> IMPOSABLE (1%)
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold bg-green-500/20 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-400" /> EXEMPTÉ
                    </span>
                  )}
                </div>

                {isSubjectToISF && (
                  <div className="space-y-2 bg-red-500/5 border border-red-500/10 p-2.5 rounded-lg">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-400">Assiette taxable :</span>
                      <span className="text-red-400 font-bold">${taxableAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] border-t border-white/5 pt-1.5 font-bold">
                      <span className="text-gray-300">Impôt mensuel estimé :</span>
                      <span className="text-red-400">-${estimatedISF.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className="text-[10px] text-gray-500 leading-relaxed">
              L'ISF est calculé automatiquement à chaque cycle mensuel (100 ticks) sur la base de 1% de l'excédent de votre fortune totale (Banque + Cash Sale) au-delà de $1,000,000.
            </p>
          </div>

          {/* Shop Taxes Widget */}
          <div className="bg-[#0F0F16] border border-white/5 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/5 pb-2">
              🏪 TAXES D'EXPLOITATION COMMERCIALE
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Boutiques possédées :</span>
                <span className="text-white font-bold">{playerShops.length}</span>
              </div>

              {playerShops.length === 0 ? (
                <div className="bg-[#08080C] p-3 rounded-lg text-center text-[10px] text-gray-500 border border-white/5">
                  Aucune taxe d'exploitation de boutique due.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {playerShops.map(shop => (
                    <div key={shop.shop_id} className="p-2 bg-[#08080C] border border-white/5 rounded flex justify-between text-[10px]">
                      <span className="text-gray-300 truncate max-w-[120px]">{shop.name}</span>
                      <span className="text-red-400 font-bold">-${shop.monthly_taxes_due}/cycle</span>
                    </div>
                  ))}
                  <div className="border-t border-white/5 pt-2 flex justify-between text-xs font-bold text-red-400">
                    <span>Total Taxes Exploitation :</span>
                    <span>-${totalShopTaxes.toLocaleString()}/cycle</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recurrent Charges Summary */}
          <div className="bg-[#0F0F16] border border-white/5 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/5 pb-2">
              🧾 RÉCAPITULATIF PRÉLÈVEMENTS
            </h3>

            <div className="space-y-3 bg-[#08080C] border border-white/5 p-4 rounded-xl text-xs">
              <div className="flex justify-between text-gray-400">
                <span>ISF Estimé</span>
                <span className={estimatedISF > 0 ? "text-red-400 font-bold" : "text-gray-500"}>
                  -${estimatedISF.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Taxes Boutiques</span>
                <span className={totalShopTaxes > 0 ? "text-red-400 font-bold" : "text-gray-500"}>
                  -${totalShopTaxes.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Abonnements actifs ({activeSubs.length})</span>
                {activeSubs.length > 0 ? (
                  <span className="text-red-400 font-bold">
                    -${activeSubs.reduce((acc, subId) => acc + (subscriptionsPool.find(s => s.id === subId)?.cost || 0), 0)}
                  </span>
                ) : (
                  <span className="text-gray-500">-$0</span>
                )}
              </div>

              <div className="border-t border-white/5 pt-2.5 flex justify-between font-black text-red-400 uppercase text-xs">
                <span>Total Charges / cycle :</span>
                <span>
                  -${(
                    estimatedISF + 
                    totalShopTaxes + 
                    activeSubs.reduce((acc, subId) => acc + (subscriptionsPool.find(s => s.id === subId)?.cost || 0), 0)
                  ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
