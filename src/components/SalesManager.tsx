import React, { useState } from 'react';
import { FullGlobalState, ManagedProperty, ShopProperty, MiningRig } from '../types/wealth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Store, 
  Cpu, 
  DollarSign, 
  Sparkles, 
  Wrench, 
  ShieldAlert, 
  Check, 
  Trash2, 
  Clock, 
  Compass, 
  X,
  Package,
  Layers,
  Flame,
  ArrowRight,
  TrendingUp,
  Tag,
  Ban,
  Coins
} from 'lucide-react';

interface SalesManagerProps {
  state: FullGlobalState;
  onUpdateState: (newState: FullGlobalState) => void;
}

type SubTab = 'properties' | 'shops' | 'rigs' | 'components';

export const SalesManager: React.FC<SalesManagerProps> = ({ state, onUpdateState }) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('properties');
  
  // Local price input states
  const [propSalePrices, setPropSalePrices] = useState<Record<string, string>>({});
  const [shopSalePrices, setShopSalePrices] = useState<Record<string, string>>({});
  const [rigSalePrices, setRigSalePrices] = useState<Record<string, string>>({});

  const currentPlayer = state.players[state.current_player_id || 'player_1'] || state.players['player_1'];

  // Helper notification function
  const [notification, setNotification] = useState<{ message: string; isError?: boolean } | null>(null);
  const showNotification = (msg: string, isErr = false) => {
    setNotification({ message: msg, isError: isErr });
    setTimeout(() => setNotification(null), 4000);
  };

  // Data extraction
  const myProperties: ManagedProperty[] = [];
  if (state.real_estate_agencies) {
    state.real_estate_agencies.forEach(agency => {
      agency.managed_properties.forEach(p => {
        if (p.owner_id === currentPlayer.id) {
          myProperties.push(p);
        }
      });
    });
  }

  const myShops = currentPlayer.shop_properties || [];
  const farm = state.mining_farms[currentPlayer.id];
  const myRigs = farm?.rigs || [];
  const myCoolers = currentPlayer.inventory_coolers || [];
  const mySpareParts = currentPlayer.inventory_spare_parts || [];

  // ==========================================
  // REAL ESTATE ACTIONS
  // ==========================================
  const handleListProperty = (propId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id];
    
    let prop: ManagedProperty | undefined;
    for (const agency of next.real_estate_agencies) {
      prop = agency.managed_properties.find(p => p.property_id === propId);
      if (prop) break;
    }

    if (!prop) return;

    const rawInput = propSalePrices[propId];
    const price = rawInput ? parseInt(rawInput) : prop.estimated_value;

    if (isNaN(price) || price <= 0) {
      showNotification("Veuillez saisir un prix de vente valide supérieur à 0.", true);
      return;
    }

    prop.listed_for_sale = true;
    prop.sale_price = price;

    next.logs.unshift({
      id: `log_list_prop_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: player.id,
      message: `MARKETPLACE : ${player.name} a mis en vente son bien '${prop.name}' pour ${price.toLocaleString()}$ (Valeur estimée : ${prop.estimated_value.toLocaleString()}$).`,
      status: 'OK'
    });

    onUpdateState(next);
    showNotification(`Bien '${prop.name}' mis en vente à $${price.toLocaleString()}`);
  };

  const handleCancelPropertySale = (propId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id];
    
    let prop: ManagedProperty | undefined;
    for (const agency of next.real_estate_agencies) {
      prop = agency.managed_properties.find(p => p.property_id === propId);
      if (prop) break;
    }

    if (!prop) return;

    prop.listed_for_sale = false;
    prop.sale_price = undefined;

    next.logs.unshift({
      id: `log_cancel_prop_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: player.id,
      message: `MARKETPLACE : ${player.name} a retiré '${prop.name}' de la vente.`,
      status: 'OK'
    });

    onUpdateState(next);
    showNotification(`Mise en vente annulée pour '${prop.name}'`);
  };

  const handleAcceptPropertyBuyout = (propId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id];
    
    let prop: ManagedProperty | undefined;
    let agencyIndex = -1;
    let propIndex = -1;

    for (let i = 0; i < next.real_estate_agencies.length; i++) {
      const idx = next.real_estate_agencies[i].managed_properties.findIndex(p => p.property_id === propId);
      if (idx !== -1) {
        agencyIndex = i;
        propIndex = idx;
        prop = next.real_estate_agencies[i].managed_properties[idx];
        break;
      }
    }

    if (!prop || !prop.buyout_offer) return;

    const cashEarned = prop.buyout_offer.offer_price;
    player.bank_clean += cashEarned;

    // Move active mining farm back to personal garage if this property was used
    const playerFarm = next.mining_farms[player.id];
    if (playerFarm && playerFarm.location_id === prop.property_id) {
      playerFarm.location_id = 'default_garage';
      playerFarm.location_name = 'Garage Personnel';
      playerFarm.power_capacity_watts = 15000;
      playerFarm.cooling_type = 'AIR';
    }

    // Delete property
    next.real_estate_agencies[agencyIndex].managed_properties.splice(propIndex, 1);

    next.logs.unshift({
      id: `log_buyout_prop_accept_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: player.id,
      message: `CESSION CAPITAL : ${player.name} a accepté l'offre de rachat de '${prop.name}' pour ${cashEarned.toLocaleString()}$. Le bien a été cédé.`,
      status: 'OK'
    });

    onUpdateState(next);
    showNotification(`Propriété vendue ! +$${cashEarned.toLocaleString()} ajoutés à votre compte.`);
  };

  const handleDeclinePropertyBuyout = (propId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    let prop: ManagedProperty | undefined;
    for (const agency of next.real_estate_agencies) {
      prop = agency.managed_properties.find(p => p.property_id === propId);
      if (prop) break;
    }

    if (!prop) return;
    prop.buyout_offer = null;

    onUpdateState(next);
    showNotification("Offre de rachat déclinée.");
  };

  // ==========================================
  // SHOPS ACTIONS
  // ==========================================
  const handleListShop = (shopId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id];
    const shop = player.shop_properties?.find(s => s.id === shopId);

    if (!shop) return;

    const rawInput = shopSalePrices[shopId];
    const estVal = shop.estimated_value || shop.buy_cost;
    const price = rawInput ? parseInt(rawInput) : estVal;

    if (isNaN(price) || price <= 0) {
      showNotification("Veuillez saisir un prix de vente valide supérieur à 0.", true);
      return;
    }

    shop.listed_for_sale = true;
    shop.sale_price = price;

    next.logs.unshift({
      id: `log_list_shop_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: player.id,
      message: `MARKETPLACE : ${player.name} a mis en vente sa boutique '${shop.name}' pour ${price.toLocaleString()}$.`,
      status: 'OK'
    });

    onUpdateState(next);
    showNotification(`Boutique '${shop.name}' mise en vente à $${price.toLocaleString()}`);
  };

  const handleCancelShopSale = (shopId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id];
    const shop = player.shop_properties?.find(s => s.id === shopId);

    if (!shop) return;

    shop.listed_for_sale = false;
    shop.sale_price = undefined;

    next.logs.unshift({
      id: `log_cancel_shop_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: player.id,
      message: `MARKETPLACE : ${player.name} a retiré '${shop.name}' de la vente.`,
      status: 'OK'
    });

    onUpdateState(next);
    showNotification(`Mise en vente annulée pour '${shop.name}'`);
  };

  const handleAcceptShopBuyout = (shopId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id];
    const shopIndex = player.shop_properties?.findIndex(s => s.id === shopId) ?? -1;

    if (shopIndex === -1) return;
    const shop = player.shop_properties![shopIndex];
    if (!shop.buyout_offer) return;

    const cashEarned = shop.buyout_offer.offer_price;
    player.bank_clean += cashEarned;

    player.shop_properties!.splice(shopIndex, 1);

    next.logs.unshift({
      id: `log_buyout_shop_accept_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: player.id,
      message: `CESSION CAPITAL : ${player.name} a accepté le rachat de sa boutique '${shop.name}' pour ${cashEarned.toLocaleString()}$.`,
      status: 'OK'
    });

    onUpdateState(next);
    showNotification(`Boutique vendue ! +$${cashEarned.toLocaleString()} crédités.`);
  };

  const handleDeclineShopBuyout = (shopId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id];
    const shop = player.shop_properties?.find(s => s.id === shopId);

    if (!shop) return;
    shop.buyout_offer = null;

    onUpdateState(next);
    showNotification("Offre de rachat déclinée.");
  };

  // ==========================================
  // RIGS ACTIONS
  // ==========================================
  const handleListRig = (rigId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id];
    const playerFarm = next.mining_farms[player.id];
    const rig = playerFarm?.rigs?.find(r => r.rig_id === rigId);

    if (!rig) return;

    const basePrice = rig.hashrate_th > 1000 ? rig.hashrate_th * 3 : rig.hashrate_th * 7;
    const wear = rig.wear_condition ?? 1.0;
    const estVal = Math.round(Math.max(50, basePrice * wear * 0.8));

    const rawInput = rigSalePrices[rigId];
    const price = rawInput ? parseInt(rawInput) : estVal;

    if (isNaN(price) || price <= 0) {
      showNotification("Veuillez saisir un prix de vente valide supérieur à 0.", true);
      return;
    }

    rig.listed_for_sale = true;
    rig.sale_price = price;

    next.logs.unshift({
      id: `log_list_rig_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: player.id,
      message: `MARKETPLACE : ${player.name} a listé le rig '${rig.name}' à la revente pour ${price.toLocaleString()}$.`,
      status: 'OK'
    });

    onUpdateState(next);
    showNotification(`Rig '${rig.name}' mis en vente à $${price.toLocaleString()}`);
  };

  const handleCancelRigSale = (rigId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id];
    const playerFarm = next.mining_farms[player.id];
    const rig = playerFarm?.rigs?.find(r => r.rig_id === rigId);

    if (!rig) return;

    rig.listed_for_sale = false;
    rig.sale_price = undefined;

    next.logs.unshift({
      id: `log_cancel_rig_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: player.id,
      message: `MARKETPLACE : ${player.name} a annulé la vente de '${rig.name}'.`,
      status: 'OK'
    });

    onUpdateState(next);
    showNotification(`Vente annulée pour '${rig.name}'`);
  };

  const handleAcceptRigBuyout = (rigId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id];
    const playerFarm = next.mining_farms[player.id];
    const rigIndex = playerFarm?.rigs?.findIndex(r => r.rig_id === rigId) ?? -1;

    if (rigIndex === -1) return;
    const rig = playerFarm.rigs[rigIndex];
    if (!rig.buyout_offer) return;

    const cashEarned = rig.buyout_offer.offer_price;
    player.bank_clean += cashEarned;

    playerFarm.rigs.splice(rigIndex, 1);

    next.logs.unshift({
      id: `log_buyout_rig_accept_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: player.id,
      message: `P2P HARDWARE : ${player.name} a accepté le rachat de '${rig.name}' pour ${cashEarned.toLocaleString()}$.`,
      status: 'OK'
    });

    onUpdateState(next);
    showNotification(`Rig vendu ! +$${cashEarned.toLocaleString()} crédités.`);
  };

  const handleDeclineRigBuyout = (rigId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id];
    const playerFarm = next.mining_farms[player.id];
    const rig = playerFarm?.rigs?.find(r => r.rig_id === rigId);

    if (!rig) return;
    rig.buyout_offer = null;

    onUpdateState(next);
    showNotification("Offre de rachat d'occasion déclinée.");
  };

  // ==========================================
  // COMPONENT LIQUIDATION
  // ==========================================
  const handleLiquidateComponent = (code: string, isCooler: boolean) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id];

    if (isCooler) {
      const idx = player.cooling_inventory?.indexOf(code) ?? -1;
      if (idx === -1) return;
      
      const standardPrice = code.includes('custom') ? 500 : 150;
      const liqVal = Math.round(standardPrice * 0.70);

      player.cooling_inventory!.splice(idx, 1);
      player.bank_clean += liqVal;

      next.logs.unshift({
        id: `log_liq_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'DB_WRITE',
        uid: player.id,
        message: `LIQUIDATION : ${player.name} a liquidé 1 Kit de Refroidissement '${code}' pour ${liqVal.toLocaleString()}$ cash.`,
        status: 'OK'
      });
      
      onUpdateState(next);
      showNotification(`Liquidé 1 Kit pour $${liqVal.toLocaleString()}`);
    } else {
      const idx = player.possessions?.indexOf(`spare_part:${code}`) ?? -1;
      if (idx === -1) return;

      const catalogInfo = [
        { code: 'VRAM_RTX_5090', price: 450 },
        { code: 'PROC_RTX_5090', price: 650 },
        { code: 'FAN_RTX_5090', price: 180 },
        { code: 'VRAM_RTX_4090', price: 380 },
        { code: 'PROC_RTX_4090', price: 550 },
        { code: 'FAN_RTX_4090', price: 150 },
        { code: 'VRAM_RTX_3090', price: 250 },
        { code: 'PROC_RTX_3090', price: 350 },
        { code: 'FAN_RTX_3090', price: 100 },
        { code: 'VRAM_ASIC', price: 300 },
        { code: 'PROC_ASIC', price: 800 },
        { code: 'FAN_ASIC', price: 200 }
      ];

      const pInfo = catalogInfo.find(p => p.code === code);
      const standardPrice = pInfo ? pInfo.price : 100;
      const liqVal = Math.round(standardPrice * 0.70);

      player.possessions!.splice(idx, 1);
      player.bank_clean += liqVal;

      next.logs.unshift({
        id: `log_liq_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'DB_WRITE',
        uid: player.id,
        message: `LIQUIDATION : ${player.name} a liquidé 1 composant '${code}' pour ${liqVal.toLocaleString()}$ cash.`,
        status: 'OK'
      });

      onUpdateState(next);
      showNotification(`Liquidé 1 composant pour $${liqVal.toLocaleString()}`);
    }
  };

  // Subtab helpers
  const subTabs = [
    { id: 'properties', label: '🏢 Immobilier', count: myProperties.length },
    { id: 'shops', label: '🛒 Commerces', count: myShops.length },
    { id: 'rigs', label: '⚙️ Rigs de Minage', count: myRigs.length },
    { id: 'components', label: '📦 Composants & Pièces', count: myCoolers.length + mySpareParts.length },
  ] as const;

  return (
    <div className="space-y-6">
      
      {/* Dynamic Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border font-mono text-xs shadow-xl flex items-center gap-2 ${
              notification.isError 
                ? 'bg-red-950/90 border-red-500/30 text-red-300' 
                : 'bg-green-950/90 border-green-500/30 text-green-300'
            }`}
          >
            {notification.isError ? <ShieldAlert className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <div className="bg-[#0F0F16] border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-widest">
            PLATEFORME D'OCCASION & CESSIONS
          </span>
          <h1 className="text-xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <Coins className="w-5 h-5 text-purple-400" /> Centre de Vente & Liquidation
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl font-mono leading-relaxed">
            Consolidez et gérez l'intégralité de vos ventes secondaires. Ajustez vos prix de revente, étudiez les offres spontanées des promoteurs de capital-risque, ou liquidez vos surplus de pièces à prix brisé.
          </p>
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-2">
        {subTabs.map(tab => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition cursor-pointer flex items-center gap-2 ${
                isActive 
                  ? 'bg-purple-500/10 border border-purple-500/25 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {tab.label}
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-purple-500/25 text-purple-200' : 'bg-white/5 text-gray-500'
              }`}>{tab.count}</span>
            </button>
          );
        })}
      </div>

      {/* Subtab content container */}
      <div className="space-y-6">

        {/* 1. PROPERTIES SUBTAB */}
        {activeSubTab === 'properties' && (
          <div className="space-y-4">
            {myProperties.length === 0 ? (
              <div className="bg-[#0F0F16] border border-white/5 rounded-2xl p-8 text-center space-y-3 font-mono">
                <Building2 className="w-10 h-10 text-purple-400 mx-auto animate-pulse" />
                <h3 className="text-white font-bold text-sm">Aucun patrimoine immobilier</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Vous ne possédez pas encore de biens d'infrastructure à revendre. Achetez des locaux dans l'onglet <strong className="text-cyan-400">Immobilier & Parcs</strong>.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {myProperties.map(p => {
                  const upgLvl = p.upgrade_level || 1;
                  const saleInput = propSalePrices[p.property_id] ?? "";

                  return (
                    <div key={p.property_id} className={`bg-[#0F0F16] border rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-lg relative overflow-hidden ${
                      p.buyout_offer ? 'border-amber-500/40 shadow-amber-950/10' : 'border-white/5'
                    }`}>
                      {/* Buyout banner */}
                      {p.buyout_offer && (
                        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2 flex items-center justify-between text-[11px] font-mono text-black font-extrabold shadow-md">
                          <span className="flex items-center gap-1.5 animate-pulse">
                            <Sparkles className="w-3.5 h-3.5" /> OFFRE DE RACHAT CASH REÇUE
                          </span>
                          <span className="bg-black text-amber-400 px-2 py-0.5 rounded text-[10px]">
                            {p.buyout_offer.offer_price.toLocaleString()}$ cash
                          </span>
                        </div>
                      )}

                      <div className={p.buyout_offer ? 'pt-4 space-y-4' : 'space-y-4'}>
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">{p.type}</span>
                            <h3 className="text-sm font-bold text-white font-mono mt-0.5">{p.name}</h3>
                          </div>
                          
                          <div className="flex gap-1.5 shrink-0">
                            <span className="text-[9px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded uppercase">
                              Niveau {upgLvl}
                            </span>
                            {p.listed_for_sale && (
                              <span className="text-[9px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/25 px-2 py-0.5 rounded uppercase animate-pulse">
                                Listé en vente
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 font-mono text-[10px] text-gray-400 bg-black/30 p-2.5 rounded-lg border border-white/5">
                          <p>Valeur estimée : <strong className="text-white">${p.estimated_value.toLocaleString()}</strong></p>
                          <p>Élec : <strong className="text-amber-400">{p.power_capacity_kw} kW</strong></p>
                          <p className="col-span-2">Rendement : <strong className="text-green-400">${p.rent_monthly.toLocaleString()}/mois</strong></p>
                        </div>

                        {/* Buyout decisions */}
                        {p.buyout_offer && (
                          <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl space-y-2 font-mono text-xs">
                            <p className="text-gray-400 text-[10px]">Un promoteur souhaite acquérir ce bien immédiatement sans délais d'annonce :</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAcceptPropertyBuyout(p.property_id)}
                                className="flex-1 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-extrabold uppercase transition cursor-pointer text-[10px] tracking-wider text-center"
                              >
                                Céder immédiatement
                              </button>
                              <button
                                onClick={() => handleDeclinePropertyBuyout(p.property_id)}
                                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer text-[10px]"
                              >
                                Décliner
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Sale action controls */}
                      <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3 justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-mono">
                          {p.listed_for_sale ? "En vente publique d'occasion" : "Pas de mise en vente en cours"}
                        </span>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          {p.listed_for_sale ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-purple-400 font-bold">Prix : ${p.sale_price?.toLocaleString()}</span>
                              <button
                                onClick={() => handleCancelPropertySale(p.property_id)}
                                className="px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-mono text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                              >
                                <Ban className="w-3 h-3" /> Retirer
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 font-mono">
                              <div className="relative w-28">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-[10px]">$</span>
                                <input
                                  type="number"
                                  placeholder={p.estimated_value.toString()}
                                  value={saleInput}
                                  onChange={e => setPropSalePrices({ ...propSalePrices, [p.property_id]: e.target.value })}
                                  className="w-full bg-black/40 border border-white/15 rounded px-2 pl-5 py-1 text-[11px] text-white focus:outline-none focus:border-purple-500"
                                />
                              </div>
                              <button
                                onClick={() => handleListProperty(p.property_id)}
                                className="px-3 py-1.5 rounded bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/35 text-purple-300 font-bold text-[10px] uppercase transition cursor-pointer flex items-center gap-1"
                              >
                                <Tag className="w-3 h-3" /> Vendre
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. SHOPS SUBTAB */}
        {activeSubTab === 'shops' && (
          <div className="space-y-4">
            {myShops.length === 0 ? (
              <div className="bg-[#0F0F16] border border-white/5 rounded-2xl p-8 text-center space-y-3 font-mono">
                <Store className="w-10 h-10 text-purple-400 mx-auto animate-pulse" />
                <h3 className="text-white font-bold text-sm">Aucun commerce disponible</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Vous ne possédez aucune boutique légitime à céder. Achetez-en dans l'onglet <strong className="text-cyan-400">Blanchiment & ISF</strong>.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {myShops.map(shop => {
                  const upgLvl = shop.upgrade_level || 1;
                  const shopVal = shop.estimated_value || shop.buy_cost;
                  const monthlyProfit = shop.last_tick_profit || (shop.base_revenue * 4);
                  const saleInput = shopSalePrices[shop.id] ?? "";

                  return (
                    <div key={shop.id} className={`bg-[#0F0F16] border rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-lg relative overflow-hidden ${
                      shop.buyout_offer ? 'border-amber-500/40 shadow-amber-950/10' : 'border-white/5'
                    }`}>
                      {/* Spontaneous offer */}
                      {shop.buyout_offer && (
                        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2 flex items-center justify-between text-[11px] font-mono text-black font-extrabold shadow-md">
                          <span className="flex items-center gap-1.5 animate-pulse">
                            <Sparkles className="w-3.5 h-3.5" /> OFFRE DE RACHAT DE FRANCHISE
                          </span>
                          <span className="bg-black text-amber-400 px-2 py-0.5 rounded text-[10px]">
                            {shop.buyout_offer.offer_price.toLocaleString()}$ cash
                          </span>
                        </div>
                      )}

                      <div className={shop.buyout_offer ? 'pt-4 space-y-4' : 'space-y-4'}>
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-widest">{shop.type} • {shop.city}</span>
                            <h3 className="text-sm font-bold text-white font-mono mt-0.5">{shop.name}</h3>
                          </div>
                          
                          <div className="flex gap-1.5 shrink-0">
                            <span className="text-[9px] font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded uppercase">
                              Niveau {upgLvl}
                            </span>
                            {shop.listed_for_sale && (
                              <span className="text-[9px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/25 px-2 py-0.5 rounded uppercase animate-pulse">
                                En vente
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 font-mono text-[10px] text-gray-400 bg-black/30 p-2.5 rounded-lg border border-white/5">
                          <p>Fonds estimé : <strong className="text-white">${shopVal.toLocaleString()}</strong></p>
                          <p>Capacité stock : <strong className="text-white">{shop.current_stock} / {shop.max_stock} u</strong></p>
                          <p className="col-span-2">Rendement mensuel : <strong className="text-green-400">+${monthlyProfit.toLocaleString()}</strong></p>
                        </div>

                        {/* Spontaneous franchise buyout */}
                        {shop.buyout_offer && (
                          <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl space-y-2 font-mono text-xs">
                            <p className="text-gray-400 text-[10px]">Un groupement de franchise veut racheter votre fonds cash aujourd'hui :</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAcceptShopBuyout(shop.id)}
                                className="flex-1 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-extrabold uppercase transition cursor-pointer text-[10px] tracking-wider text-center"
                              >
                                Céder le fonds cash
                              </button>
                              <button
                                onClick={() => handleDeclineShopBuyout(shop.id)}
                                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer text-[10px]"
                              >
                                Décliner
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Listed actions */}
                      <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3 justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-mono">
                          {shop.listed_for_sale ? "Actuellement listé d'occasion" : "En exploitation privée"}
                        </span>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          {shop.listed_for_sale ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-purple-400 font-bold">Prix : ${shop.sale_price?.toLocaleString()}</span>
                              <button
                                onClick={() => handleCancelShopSale(shop.id)}
                                className="px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-mono text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                              >
                                <Ban className="w-3 h-3" /> Retirer
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 font-mono">
                              <div className="relative w-28">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-[10px]">$</span>
                                <input
                                  type="number"
                                  placeholder={shopVal.toString()}
                                  value={saleInput}
                                  onChange={e => setShopSalePrices({ ...shopSalePrices, [shop.id]: e.target.value })}
                                  className="w-full bg-black/40 border border-white/15 rounded px-2 pl-5 py-1 text-[11px] text-white focus:outline-none focus:border-purple-500"
                                />
                              </div>
                              <button
                                onClick={() => handleListShop(shop.id)}
                                className="px-3 py-1.5 rounded bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/35 text-purple-300 font-bold text-[10px] uppercase transition cursor-pointer flex items-center gap-1"
                              >
                                <Tag className="w-3 h-3" /> Vendre
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. RIGS SUBTAB */}
        {activeSubTab === 'rigs' && (
          <div className="space-y-4">
            {myRigs.length === 0 ? (
              <div className="bg-[#0F0F16] border border-white/5 rounded-2xl p-8 text-center space-y-3 font-mono">
                <Cpu className="w-10 h-10 text-purple-400 mx-auto animate-pulse" />
                <h3 className="text-white font-bold text-sm">Aucun Rig de Minage</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Votre ferme n'est équipée d'aucun rig ou puce graphique en exploitation. Achetez-en dans l'onglet <strong className="text-cyan-400">Marchés & P2P</strong>.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {myRigs.map(rig => {
                  const basePrice = rig.hashrate_th > 1000 ? rig.hashrate_th * 3 : rig.hashrate_th * 7;
                  const wear = rig.wear_condition ?? 1.0;
                  const estVal = Math.round(Math.max(50, basePrice * wear * 0.8));
                  const saleInput = rigSalePrices[rig.rig_id] ?? "";

                  return (
                    <div key={rig.rig_id} className={`bg-[#0F0F16] border rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-lg relative overflow-hidden ${
                      rig.buyout_offer ? 'border-amber-500/40 shadow-amber-950/10' : 'border-white/5'
                    }`}>
                      {/* Spontaneous rig offer */}
                      {rig.buyout_offer && (
                        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2 flex items-center justify-between text-[11px] font-mono text-black font-extrabold shadow-md">
                          <span className="flex items-center gap-1.5 animate-pulse">
                            <Sparkles className="w-3.5 h-3.5" /> OFFRE DE RACHAT GPU D'OCCASION
                          </span>
                          <span className="bg-black text-amber-400 px-2 py-0.5 rounded text-[10px]">
                            {rig.buyout_offer.offer_price.toLocaleString()}$ cash
                          </span>
                        </div>
                      )}

                      <div className={rig.buyout_offer ? 'pt-4 space-y-4' : 'space-y-4'}>
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[10px] font-mono text-gray-500 block">ID : {rig.rig_id}</span>
                            <h3 className="text-sm font-bold text-white font-mono mt-0.5">{rig.name}</h3>
                          </div>
                          
                          <div className="flex gap-1.5 shrink-0">
                            <span className="text-[9px] font-mono font-bold bg-white/5 text-gray-300 border border-white/10 px-2 py-0.5 rounded uppercase">
                              État : {Math.round(wear * 100)}%
                            </span>
                            {rig.listed_for_sale && (
                              <span className="text-[9px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/25 px-2 py-0.5 rounded uppercase animate-pulse">
                                En vente d'occaz'
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 font-mono text-[10px] text-gray-400 bg-black/30 p-2.5 rounded-lg border border-white/5">
                          <p>Hashrate : <strong className="text-white">{rig.hashrate_th} TH/s</strong></p>
                          <p>Conso : <strong className="text-white">{rig.watts_consumption}W</strong></p>
                          <p className="col-span-2 text-cyan-400">Occasion estimée : <strong>${estVal.toLocaleString()}</strong></p>
                        </div>

                        {/* Buyout button */}
                        {rig.buyout_offer && (
                          <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl space-y-2 font-mono text-xs">
                            <p className="text-gray-400 text-[10px]">Un acheteur P2P propose de racheter ce rig maintenant :</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAcceptRigBuyout(rig.rig_id)}
                                className="flex-1 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-extrabold uppercase transition cursor-pointer text-[10px] tracking-wider text-center"
                              >
                                Accepter l'offre
                              </button>
                              <button
                                onClick={() => handleDeclineRigBuyout(rig.rig_id)}
                                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer text-[10px]"
                              >
                                Refuser
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3 justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-mono">
                          {rig.listed_for_sale ? "Listé sur le marché P2P" : "Fonctionne au sein de la ferme"}
                        </span>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          {rig.listed_for_sale ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-purple-400 font-bold">Prix : ${rig.sale_price?.toLocaleString()}</span>
                              <button
                                onClick={() => handleCancelRigSale(rig.rig_id)}
                                className="px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-mono text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                              >
                                <Ban className="w-3 h-3" /> Annuler
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 font-mono">
                              <div className="relative w-24">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-[10px]">$</span>
                                <input
                                  type="number"
                                  placeholder={estVal.toString()}
                                  value={saleInput}
                                  onChange={e => setRigSalePrices({ ...rigSalePrices, [rig.rig_id]: e.target.value })}
                                  className="w-full bg-black/40 border border-white/15 rounded px-2 pl-4 py-1 text-[11px] text-white focus:outline-none focus:border-purple-500"
                                />
                              </div>
                              <button
                                onClick={() => handleListRig(rig.rig_id)}
                                className="px-3 py-1.5 rounded bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/35 text-purple-300 font-bold text-[10px] uppercase transition cursor-pointer flex items-center gap-1"
                              >
                                <Tag className="w-3 h-3" /> Revente
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 4. COMPONENTS SUBTAB (Instant liquidation) */}
        {activeSubTab === 'components' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Subsection A: Coolers stock */}
            <div className="bg-[#0F0F16] border border-white/5 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-2">
                <Package className="w-4 h-4 text-cyan-400" />
                Kits Watercooling en Stock ({myCoolers.length})
              </h4>
              <p className="text-[11px] text-gray-400 font-mono leading-relaxed">
                Ces systèmes de watercooling ne sont pas équipés. Vous pouvez les liquider immédiatement pour 70% de leur valeur d'origine.
              </p>

              {myCoolers.length === 0 ? (
                <p className="text-xs text-gray-600 font-mono text-center py-6">Aucun kit de refroidissement en inventaire.</p>
              ) : (
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto font-mono text-xs">
                  {(() => {
                    const counts: Record<string, number> = {};
                    myCoolers.forEach(c => counts[c] = (counts[c] || 0) + 1);

                    return Object.entries(counts).map(([code, qty]) => {
                      const standardPrice = code.includes('custom') ? 500 : 150;
                      const liqVal = Math.round(standardPrice * 0.70);
                      const cleanName = code.toUpperCase().replace('WC_', '').replace(/_/g, ' ');

                      return (
                        <div key={code} className="bg-[#08080C] border border-white/5 p-3 rounded-lg flex items-center justify-between">
                          <div>
                            <p className="text-white font-bold text-xs">{cleanName} <span className="text-cyan-400 font-extrabold ml-1">x{qty}</span></p>
                            <p className="text-[9px] text-gray-500 mt-0.5">Origine : ${standardPrice} | Liquidation (70%) : ${liqVal}</p>
                          </div>
                          <button
                            onClick={() => handleLiquidateComponent(code, true)}
                            className="px-2.5 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold font-mono text-[9px] uppercase transition cursor-pointer"
                          >
                            Liquider
                          </button>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>

            {/* Subsection B: Spare parts workbench */}
            <div className="bg-[#0F0F16] border border-white/5 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-widest text-purple-400 font-bold flex items-center gap-2">
                <Wrench className="w-4 h-4 text-purple-400" />
                Pièces Détachées de l'Établi ({mySpareParts.length})
              </h4>
              <p className="text-[11px] text-gray-400 font-mono leading-relaxed">
                Puces de silicium, VRAM haut de gamme ou ventilateurs turbos non installés. Liquidation immédiate pour 70% de leur tarif d'Atelier.
              </p>

              {mySpareParts.length === 0 ? (
                <p className="text-xs text-gray-600 font-mono text-center py-6">Aucune pièce détachée en stock.</p>
              ) : (
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto font-mono text-xs">
                  {(() => {
                    const counts: Record<string, number> = {};
                    mySpareParts.forEach(p => {
                      const code = p.replace('spare_part:', '');
                      counts[code] = (counts[code] || 0) + 1;
                    });

                    const catalogInfo = [
                      { code: 'VRAM_RTX_5090', price: 450, name: 'VRAM RTX 5090' },
                      { code: 'PROC_RTX_5090', price: 650, name: 'Core RTX 5090' },
                      { code: 'FAN_RTX_5090', price: 180, name: 'Fan RTX 5090' },
                      { code: 'VRAM_RTX_4090', price: 380, name: 'VRAM RTX 4090' },
                      { code: 'PROC_RTX_4090', price: 550, name: 'Core RTX 4090' },
                      { code: 'FAN_RTX_4090', price: 150, name: 'Fan RTX 4090' },
                      { code: 'VRAM_RTX_3090', price: 250, name: 'VRAM RTX 3090' },
                      { code: 'PROC_RTX_3090', price: 350, name: 'Core RTX 3090' },
                      { code: 'FAN_RTX_3090', price: 100, name: 'Fan RTX 3090' },
                      { code: 'VRAM_ASIC', price: 300, name: 'VRAM ASIC' },
                      { code: 'PROC_ASIC', price: 800, name: 'Processeur ASIC' },
                      { code: 'FAN_ASIC', price: 200, name: 'Ventilo ASIC' }
                    ];

                    return Object.entries(counts).map(([code, qty]) => {
                      const pInfo = catalogInfo.find(p => p.code === code);
                      const standardPrice = pInfo ? pInfo.price : 100;
                      const cleanName = pInfo ? pInfo.name : code;
                      const liqVal = Math.round(standardPrice * 0.70);

                      return (
                        <div key={code} className="bg-[#08080C] border border-white/5 p-3 rounded-lg flex items-center justify-between">
                          <div>
                            <p className="text-white font-bold text-xs">{cleanName} <span className="text-purple-400 font-extrabold ml-1">x{qty}</span></p>
                            <p className="text-[9px] text-gray-500 mt-0.5">Valeur d'Atelier : ${standardPrice} | Liquidation (70%) : ${liqVal}</p>
                          </div>
                          <button
                            onClick={() => handleLiquidateComponent(code, false)}
                            className="px-2.5 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold font-mono text-[9px] uppercase transition cursor-pointer"
                          >
                            Liquider
                          </button>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
};