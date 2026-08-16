import React, { useState } from 'react';
import { FullGlobalState, ManagedProperty, ShopProperty, MiningRig } from '../types/wealth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Store, 
  Cpu, 
  ArrowUpRight, 
  Sparkles, 
  DollarSign, 
  Wrench, 
  Hammer, 
  ShieldAlert, 
  Check, 
  Trash2, 
  Clock, 
  Compass, 
  X,
  Package,
  Layers,
  Flame,
  ArrowRight
} from 'lucide-react';

interface BusinessManagerProps {
  state: FullGlobalState;
  onUpdateState: (newState: FullGlobalState) => void;
}

export const BusinessManager: React.FC<BusinessManagerProps> = ({ state, onUpdateState }) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'shops' | 'hardware'>('properties');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Listing input state maps
  const [propSalePrices, setPropSalePrices] = useState<Record<string, string>>({});
  const [shopSalePrices, setShopSalePrices] = useState<Record<string, string>>({});
  const [rigSalePrices, setRigSalePrices] = useState<Record<string, string>>({});

  const currentPlayer = state.players[state.current_player_id] || Object.values(state.players)[0];

  // Helper utility: Display nice notifications
  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  // 1. Gather Owned Real Estate properties
  const myProperties = state.real_estate_agencies?.flatMap(agency => 
    agency.managed_properties.filter(p => p.owner_id === currentPlayer.id)
  ) || [];

  // 2. Gather Owned Shops
  const myShops = currentPlayer.shop_properties || [];

  // 3. Gather Owned Rigs
  const farm = state.mining_farms[currentPlayer.id];
  const myRigs = farm?.rigs || [];

  // 4. Spare Parts and Watercoolings inventory
  const mySpareParts = currentPlayer.possessions?.filter(p => p.startsWith('spare_part:')) || [];
  const myCoolers = currentPlayer.cooling_inventory || [];

  // 5. Total Portfolio Stats
  const totalPropertyVal = myProperties.reduce((sum, p) => sum + p.estimated_value, 0);
  const totalShopVal = myShops.reduce((sum, s) => sum + (s.estimated_value || s.buy_cost), 0);
  
  // Calculate rigs value based on hashrate & condition
  const totalRigsVal = myRigs.reduce((sum, rig) => {
    const basePrice = rig.hashrate_th > 1000 ? rig.hashrate_th * 3 : rig.hashrate_th * 7;
    const wear = rig.wear_condition ?? 1.0;
    return sum + Math.max(50, basePrice * wear * 0.8);
  }, 0);

  const totalPortfolioValue = totalPropertyVal + totalShopVal + totalRigsVal;

  // Monthly yield
  const propertyMonthlyYield = myProperties.reduce((sum, p) => sum + (p.tenant_id !== p.owner_id ? p.rent_monthly : 0), 0);
  const shopMonthlyYield = myShops.reduce((sum, s) => sum + (s.last_tick_profit || s.base_revenue * 4), 0); // approx monthly shop profit
  const totalMonthlyYield = propertyMonthlyYield + shopMonthlyYield;

  const totalOffersCount = 
    myProperties.filter(p => p.buyout_offer).length + 
    myShops.filter(s => s.buyout_offer).length + 
    myRigs.filter(r => r.buyout_offer).length;

  // ==========================================
  // REAL ESTATE ACTIONS
  // ==========================================
  const handleUpgradeProperty = (propId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id];
    
    // Find property
    let prop: ManagedProperty | undefined;
    for (const agency of next.real_estate_agencies) {
      prop = agency.managed_properties.find(p => p.property_id === propId);
      if (prop) break;
    }

    if (!prop) return;

    // Must have an active electrical breakdown to do this!
    if (!prop.electrical_failure_type || prop.electrical_failure_type === 'NONE') {
      showNotification("Le réseau électrique de ce bâtiment est déjà en état nominal (pas de panne à réparer) !", true);
      return;
    }

    const repairCost = prop.electrical_repair_cost || Math.round(prop.estimated_value * 0.08);
    if (player.bank_clean < repairCost) {
      showNotification("Fonds propres insuffisants pour la réparation ! Requis: " + repairCost.toLocaleString() + "$", true);
      return;
    }

    player.bank_clean -= repairCost;
    
    // Clear the breakdown
    const prevType = prop.electrical_failure_type;
    prop.electrical_failure_type = 'NONE';
    prop.electrical_failure_details = undefined;
    prop.electrical_repair_cost = undefined;
    
    // Upgrade effects: as care reward, the building levels up
    const upgLevel = (prop.upgrade_level || 1) + 1;
    prop.upgrade_level = upgLevel;
    prop.power_capacity_kw = Math.round(prop.power_capacity_kw * 1.20); // +20% power grid
    prop.rent_monthly = Math.round(prop.rent_monthly * 1.15); // +15% rent
    prop.estimated_value = Math.round(prop.estimated_value * 1.25); // +25% valuation

    // If it's the active mining farm, update capacity!
    const playerFarm = next.mining_farms[player.id];
    if (playerFarm && playerFarm.location_id === prop.property_id) {
      playerFarm.power_capacity_watts = prop.power_capacity_kw * 1000;
    }

    next.logs.unshift({
      id: `log_repair_prop_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: player.id,
      message: `MAINTENANCE IMMOBILIÈRE : ${player.name} a résolu la panne électrique (${prevType}) de '${prop.name}'. Grâce aux soins apportés, le local passe Niveau ${upgLevel} (+20% kW élec, +25% valeur).`,
      status: 'OK'
    });

    onUpdateState(next);
    showNotification(`Panne résolue ! Le local '${prop.name}' passe au Niveau ${upgLevel}.`);
  };

  const handleListProperty = (propId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    
    let prop: ManagedProperty | undefined;
    for (const agency of next.real_estate_agencies) {
      prop = agency.managed_properties.find(p => p.property_id === propId);
      if (prop) break;
    }

    if (!prop) return;

    const enteredPrice = parseFloat(propSalePrices[propId]);
    const price = isNaN(enteredPrice) || enteredPrice <= 0 ? prop.estimated_value : enteredPrice;

    prop.listed_for_sale = true;
    prop.sale_price = price;

    next.logs.unshift({
      id: `log_list_prop_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: currentPlayer.id,
      message: `PATRIMOINE : ${currentPlayer.name} a listé '${prop.name}' pour revente à ${price.toLocaleString()}$.`,
      status: 'INFO'
    });

    onUpdateState(next);
    showNotification(`Mise en vente activée pour '${prop.name}' au prix de ${price.toLocaleString()}$.`);
  };

  const handleCancelPropertySale = (propId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    
    let prop: ManagedProperty | undefined;
    for (const agency of next.real_estate_agencies) {
      prop = agency.managed_properties.find(p => p.property_id === propId);
      if (prop) break;
    }

    if (!prop) return;

    prop.listed_for_sale = false;
    prop.sale_price = undefined;

    next.logs.unshift({
      id: `log_cancel_prop_sale_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: currentPlayer.id,
      message: `PATRIMOINE : ${currentPlayer.name} a retiré '${prop.name}' de la vente.`,
      status: 'WARN'
    });

    onUpdateState(next);
    showNotification(`Mise en vente annulée.`);
  };

  const handleAcceptPropertyBuyout = (propId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id];
    
    let agencyIndex = -1;
    let propIndex = -1;

    for (let i = 0; i < next.real_estate_agencies.length; i++) {
      const idx = next.real_estate_agencies[i].managed_properties.findIndex(p => p.property_id === propId);
      if (idx !== -1) {
        agencyIndex = i;
        propIndex = idx;
        break;
      }
    }

    if (agencyIndex === -1 || propIndex === -1) return;
    const prop = next.real_estate_agencies[agencyIndex].managed_properties[propIndex];
    if (!prop.buyout_offer) return;

    const offerPrice = prop.buyout_offer.offer_price;

    // Credit player
    player.bank_clean += offerPrice;

    // Reset mining farm back to default garage if used
    const playerFarm = next.mining_farms[player.id];
    if (playerFarm && playerFarm.location_id === prop.property_id) {
      playerFarm.location_id = 'default_garage';
      playerFarm.location_name = 'Garage Personnel';
      playerFarm.power_capacity_watts = 15000;
      playerFarm.cooling_type = 'AIR';
    }

    // Remove property from game completely
    next.real_estate_agencies[agencyIndex].managed_properties.splice(propIndex, 1);

    next.logs.unshift({
      id: `log_prop_buyout_accept_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: player.id,
      message: `🔥 RACHAT ACCEPTÉ : ${player.name} a cédé sa propriété '${prop.name}' pour une offre spontanée de ${offerPrice.toLocaleString()}$ !`,
      status: 'OK'
    });

    onUpdateState(next);
    showNotification(`Fonds de rachat encaissés ! +${offerPrice.toLocaleString()}$ ajoutés à votre compte.`);
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
    showNotification(`Offre de rachat déclinée.`);
  };

  // ==========================================
  // SHOPS (BUSINESS) ACTIONS
  // ==========================================
  const handleUpgradeShop = (shopId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id];
    
    const shop = player.shop_properties?.find(s => s.id === shopId);
    if (!shop) return;

    // Costs 30% of base value
    const upgradeCost = Math.round((shop.estimated_value || shop.buy_cost) * 0.25);
    if (player.bank_clean < upgradeCost) {
      showNotification(`Fonds propres insuffisants ! Requis: ${upgradeCost.toLocaleString()}$`, true);
      return;
    }

    player.bank_clean -= upgradeCost;

    const upgLevel = (shop.upgrade_level || 1) + 1;
    shop.upgrade_level = upgLevel;
    shop.max_stock = Math.round(shop.max_stock * 1.30); // +30% capacity
    shop.base_revenue = Math.round(shop.base_revenue * 1.20); // +20% base revenue
    shop.estimated_value = Math.round((shop.estimated_value || shop.buy_cost) * 1.25); // +25% value

    next.logs.unshift({
      id: `log_upgrade_shop_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: player.id,
      message: "LOGISTIQUE BOUTIQUE : " + player.name + " a upgradé '" + shop.name + "' au Niveau " + upgLevel + " (-" + upgradeCost.toLocaleString() + "$ pour +30% stock).",
      status: 'OK'
    });

    onUpdateState(next);
    showNotification(`Amélioration effectuée ! Commerce '${shop.name}' optimisé au Niveau ${upgLevel}.`);
  };

  const handleListShop = (shopId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id];
    
    const shop = player.shop_properties?.find(s => s.id === shopId);
    if (!shop) return;

    const enteredPrice = parseFloat(shopSalePrices[shopId]);
    const price = isNaN(enteredPrice) || enteredPrice <= 0 ? (shop.estimated_value || shop.buy_cost) : enteredPrice;

    shop.listed_for_sale = true;
    shop.sale_price = price;

    next.logs.unshift({
      id: `log_list_shop_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: player.id,
      message: "COMMERCE : " + player.name + " a mis en vente '" + shop.name + "' pour " + price.toLocaleString() + "$.",
      status: 'INFO'
    });

    onUpdateState(next);
    showNotification("Commerce '" + shop.name + "' répertorié pour revente à " + price.toLocaleString() + "$.");
  };

  const handleCancelShopSale = (shopId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id];
    
    const shop = player.shop_properties?.find(s => s.id === shopId);
    if (!shop) return;

    shop.listed_for_sale = false;
    shop.sale_price = undefined;

    next.logs.unshift({
      id: `log_cancel_shop_sale_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: player.id,
      message: "COMMERCE : " + player.name + " a retiré de la vente '" + shop.name + "'.",
      status: 'WARN'
    });

    onUpdateState(next);
    showNotification("Mise en vente annulée.");
  };

  const handleAcceptShopBuyout = (shopId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id];
    
    const shopIdx = player.shop_properties?.findIndex(s => s.id === shopId);
    if (shopIdx === undefined || shopIdx === -1) return;

    const shop = player.shop_properties![shopIdx];
    if (!shop.buyout_offer) return;

    const offerPrice = shop.buyout_offer.offer_price;

    // Credit player
    player.bank_clean += offerPrice;

    // Delete shop completely
    player.shop_properties!.splice(shopIdx, 1);

    next.logs.unshift({
      id: `log_shop_buyout_accept_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: player.id,
      message: "🔥 RACHAT ACCEPTÉ : " + player.name + " a vendu son fonds de commerce '" + shop.name + "' pour " + offerPrice.toLocaleString() + "$ !",
      status: 'OK'
    });

    onUpdateState(next);
    showNotification("Fonds de commerce cédé ! +" + offerPrice.toLocaleString() + "$ encaissés.");
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
    const currentFarm = next.mining_farms[currentPlayer.id];
    if (!currentFarm) return;

    const rig = currentFarm.rigs.find(r => r.rig_id === rigId);
    if (!rig) return;

    const basePrice = rig.hashrate_th > 1000 ? rig.hashrate_th * 3 : rig.hashrate_th * 7;
    const wear = rig.wear_condition ?? 1.0;
    const estVal = Math.max(50, basePrice * wear * 0.8);

    const enteredPrice = parseFloat(rigSalePrices[rigId]);
    const price = isNaN(enteredPrice) || enteredPrice <= 0 ? Math.round(estVal) : enteredPrice;

    rig.listed_for_sale = true;
    rig.sale_price = price;

    next.logs.unshift({
      id: `log_list_rig_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: currentPlayer.id,
      message: "MATÉRIEL : " + currentPlayer.name + " a listé '" + rig.name + "' pour revente d'occasion à " + price.toLocaleString() + "$.",
      status: 'INFO'
    });

    onUpdateState(next);
    showNotification("Matériel '" + rig.name + "' répertorié à " + price.toLocaleString() + "$ d'occasion.");
  };

  const handleCancelRigSale = (rigId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const currentFarm = next.mining_farms[currentPlayer.id];
    if (!currentFarm) return;

    const rig = currentFarm.rigs.find(r => r.rig_id === rigId);
    if (!rig) return;

    rig.listed_for_sale = false;
    rig.sale_price = undefined;

    next.logs.unshift({
      id: `log_cancel_rig_sale_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: currentPlayer.id,
      message: `MATÉRIEL : ${currentPlayer.name} a retiré '${rig.name}' de la vente.`,
      status: 'WARN'
    });

    onUpdateState(next);
    showNotification(`Mise en vente d'occasion annulée.`);
  };

  const handleAcceptRigBuyout = (rigId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id];
    const currentFarm = next.mining_farms[currentPlayer.id];
    if (!currentFarm) return;

    const rigIdx = currentFarm.rigs.findIndex(r => r.rig_id === rigId);
    if (rigIdx === -1) return;

    const rig = currentFarm.rigs[rigIdx];
    if (!rig.buyout_offer) return;

    const offerPrice = rig.buyout_offer.offer_price;

    // Credit player
    player.bank_clean += offerPrice;

    // Delete rig completely
    currentFarm.rigs.splice(rigIdx, 1);

    next.logs.unshift({
      id: `log_rig_buyout_accept_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: player.id,
      message: `🔥 RACHAT ACCEPTÉ : ${player.name} a vendu son rig '${rig.name}' pour ${offerPrice.toLocaleString()}$ d'occasion !`,
      status: 'OK'
    });

    onUpdateState(next);
    showNotification(`Matériel vendu ! +${offerPrice.toLocaleString()}$ encaissés.`);
  };

  const handleDeclineRigBuyout = (rigId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const currentFarm = next.mining_farms[currentPlayer.id];
    if (!currentFarm) return;

    const rig = currentFarm.rigs.find(r => r.rig_id === rigId);
    if (!rig) return;

    rig.buyout_offer = null;

    onUpdateState(next);
    showNotification(`Offre de rachat déclinée.`);
  };

  // ==========================================
  // COMPONENT INSTANT LIQUIDATION (CASH OUT)
  // ==========================================
  const handleLiquidateComponent = (code: string, isWatercooler: boolean) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id];
    
    let basePrice = 150;
    let nameText = code;

    if (isWatercooler) {
      basePrice = code.includes('custom') ? 500 : 150;
      nameText = code.toUpperCase().replace('WC_', '').replace(/_/g, ' ');

      // Remove from cooling inventory
      const idx = player.cooling_inventory?.indexOf(code);
      if (idx === undefined || idx === -1) return;
      player.cooling_inventory!.splice(idx, 1);
    } else {
      // Remove from spare parts (possessions)
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
      basePrice = pInfo ? pInfo.price : 100;
      nameText = code;

      const idx = player.possessions?.indexOf(`spare_part:${code}`);
      if (idx === undefined || idx === -1) return;
      player.possessions!.splice(idx, 1);
    }

    const liquidationValue = Math.round(basePrice * 0.70); // 70% immediate buyout
    player.bank_clean += liquidationValue;

    next.logs.unshift({
      id: `log_liquidate_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: player.id,
      message: `REVENTE : Liquidation immédiate de '${nameText}' par ${player.name} pour ${liquidationValue.toLocaleString()}$ propres.`,
      status: 'OK'
    });

    onUpdateState(next);
    showNotification(`Composant liquidé pour ${liquidationValue.toLocaleString()}$ !`);
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Header with stats cards */}
      <div className="bg-[#0F0F16] border border-cyan-500/15 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-5 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">
                Dashboard de Gestion de Patrimoine
              </span>
            </div>
            <h1 className="text-xl font-black text-white mt-1 tracking-tight">
              ADMINISTRATION DU PORTFEUILLE D'ACTIFS
            </h1>
            <p className="text-xs text-gray-400 max-w-xl font-sans mt-0.5">
              Suivez la valorisation de vos locaux et fonds de commerce, optimisez leur efficience par des travaux de modernisation et arbitrez vos reventes.
            </p>
          </div>

          {totalOffersCount > 0 && (
            <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold flex items-center gap-2 animate-pulse shrink-0">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{totalOffersCount} OFFRE(S) DE RACHAT ACTIVES !</span>
            </div>
          )}
        </div>

        {/* Financial metrics grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 font-mono text-xs">
          <div className="bg-[#08080C] p-4 rounded-xl border border-white/5 space-y-1">
            <p className="text-gray-400 text-[10px] uppercase">Actifs & Patrimoine Est.</p>
            <p className="text-2xl font-black text-white">${totalPortfolioValue.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500">Locaux, commerces & hardware</p>
          </div>

          <div className="bg-[#08080C] p-4 rounded-xl border border-white/5 space-y-1">
            <p className="text-gray-400 text-[10px] uppercase">Loyers & Rendement Passif / Cycle</p>
            <p className="text-2xl font-black text-green-400">+${totalMonthlyYield.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500">
              Locatif : ${propertyMonthlyYield.toLocaleString()} | Commerce : ${shopMonthlyYield.toLocaleString()}
            </p>
          </div>

          <div className="bg-[#08080C] p-4 rounded-xl border border-white/5 space-y-1">
            <p className="text-gray-400 text-[10px] uppercase">Rendement Annuel Moyen</p>
            <p className="text-2xl font-black text-cyan-400">
              {totalPortfolioValue > 0 ? ((totalMonthlyYield * 12 / totalPortfolioValue) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-[10px] text-gray-500">Rentabilité nette du capital</p>
          </div>
        </div>
      </div>

      {/* Action Notification Feed */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-mono p-4 rounded-xl flex items-center gap-2"
          >
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono p-4 rounded-xl flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs navigation */}
      <div className="flex border-b border-white/10 gap-1.5 font-mono text-xs">
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold uppercase transition cursor-pointer ${
            activeTab === 'properties' 
              ? 'border-cyan-400 text-cyan-300 bg-cyan-950/5' 
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4 text-cyan-400" />
          Locaux & Logements ({myProperties.length})
        </button>

        <button
          onClick={() => setActiveTab('shops')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold uppercase transition cursor-pointer ${
            activeTab === 'shops' 
              ? 'border-purple-500 text-purple-400 bg-purple-950/5' 
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Store className="w-4 h-4 text-purple-400" />
          Commerces en France ({myShops.length})
        </button>

        <button
          onClick={() => setActiveTab('hardware')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold uppercase transition cursor-pointer ${
            activeTab === 'hardware' 
              ? 'border-amber-500 text-amber-400 bg-amber-950/5' 
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4 text-amber-400" />
          Hardware & Composants ({myRigs.length + mySpareParts.length + myCoolers.length})
        </button>
      </div>

      {/* Tab content */}
      <div className="space-y-6">

        {/* -------------------- TAB 1: PROPERTIES -------------------- */}
        {activeTab === 'properties' && (
          <div className="space-y-4">
            {myProperties.length === 0 ? (
              <div className="bg-[#0F0F16] border border-white/5 rounded-2xl p-8 text-center space-y-3 font-mono">
                <Compass className="w-10 h-10 text-cyan-400 mx-auto animate-pulse" />
                <h3 className="text-white font-bold text-sm">Aucun patrimoine immobilier</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Vous n'avez pas encore acheté de biens d'infrastructure. Visitez l'onglet <strong className="text-cyan-400">Immobilier & Parcs</strong> pour acquérir des garages ou hangars.
                </p>
                <div className="pt-2">
                  <span className="text-[10px] text-gray-500">Astuce : Améliorer vos locaux augmente leur valeur d'occasion et de rachat au fil du temps.</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {myProperties.map((p) => {
                  const age = p.months_owned || 0;
                  const upgLvl = p.upgrade_level || 1;
                  const upgCost = Math.round(p.estimated_value * 0.25);
                  const isTenantActive = p.tenant_id && p.tenant_id !== p.owner_id;

                  return (
                    <div key={p.property_id} className={`bg-[#0F0F16] border rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-lg relative overflow-hidden transition hover:border-cyan-500/30 ${
                      p.buyout_offer ? 'border-amber-500/40 shadow-amber-950/10' : 'border-white/5'
                    }`}>
                      {/* Spontaneous Buyout Offer Banner */}
                      {p.buyout_offer && (
                        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2 flex items-center justify-between text-[11px] font-mono text-black font-extrabold shadow-md">
                          <span className="flex items-center gap-1.5 animate-pulse">
                            <Sparkles className="w-3.5 h-3.5" /> OFFRE DE RACHAT SPONTANÉE REÇUE
                          </span>
                          <span className="bg-black text-amber-400 px-2 py-0.5 rounded text-[10px]">
                            {p.buyout_offer.offer_price.toLocaleString()}$ cash
                          </span>
                        </div>
                      )}

                      <div className={p.buyout_offer ? 'pt-4 space-y-4' : 'space-y-4'}>
                        {/* Title and stats badges */}
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
                                Mis en vente
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Property values & stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px] text-gray-400">
                          <div className="bg-[#08080C] p-2 rounded border border-white/5 space-y-0.5">
                            <span className="text-gray-500 uppercase text-[8px] block">Valeur Actuelle</span>
                            <span className="text-white font-bold block">${p.estimated_value.toLocaleString()}</span>
                          </div>
                          <div className="bg-[#08080C] p-2 rounded border border-white/5 space-y-0.5">
                            <span className="text-gray-500 uppercase text-[8px] block">Puissance Grille</span>
                            <span className="text-amber-400 font-bold block">{p.power_capacity_kw} kW</span>
                          </div>
                          <div className="bg-[#08080C] p-2 rounded border border-white/5 space-y-0.5">
                            <span className="text-gray-500 uppercase text-[8px] block">Revenus Locatifs</span>
                            <span className={`font-bold block ${isTenantActive ? 'text-green-400' : 'text-gray-500'}`}>
                              {isTenantActive ? `+${p.rent_monthly.toLocaleString()}` : '$0 (Sans locataire)'}
                            </span>
                          </div>
                          <div className="bg-[#08080C] p-2 rounded border border-white/5 space-y-0.5">
                            <span className="text-gray-500 uppercase text-[8px] block">Âge d'acquisition</span>
                            <span className="text-purple-300 font-bold block">{age} cycles</span>
                          </div>
                        </div>

                        {/* Active Electrical Breakdown Warning Panel */}
                        {p.electrical_failure_type && p.electrical_failure_type !== 'NONE' && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 font-mono space-y-1 animate-pulse">
                            <div className="font-bold flex items-center gap-1.5 text-red-300">
                              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                              ⚠️ PANNE ÉLECTRIQUE ACTIVE : {p.electrical_failure_type}
                            </div>
                            <p className="text-gray-300 text-[11px] leading-relaxed">{p.electrical_failure_details}</p>
                            <p className="text-[10px] text-amber-400/90 font-bold">🚨 Rigs hors-ligne (0 TH/s), loyers perçus amputés de -80% !</p>
                          </div>
                        )}

                        {/* Accept / Decline buyout offer buttons if active */}
                        {p.buyout_offer && (
                          <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl space-y-2 font-mono text-xs">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-gray-400">Un promoteur propose de racheter ce bien pour :</span>
                              <strong className="text-amber-300 text-sm">${p.buyout_offer.offer_price.toLocaleString()}</strong>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAcceptPropertyBuyout(p.property_id)}
                                className="flex-1 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-extrabold uppercase transition cursor-pointer text-[10px] tracking-wider text-center"
                              >
                                Céder et encaisser
                              </button>
                              <button
                                onClick={() => handleDeclinePropertyBuyout(p.property_id)}
                                className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer text-[10px]"
                              >
                                Refuser
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Upgrade & Listing controls */}
                      <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                        {/* Conditional Repair Button or Nominal Status Badge */}
                        {p.electrical_failure_type && p.electrical_failure_type !== 'NONE' ? (
                          <button
                            onClick={() => handleUpgradeProperty(p.property_id)}
                            className="px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-mono text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 animate-pulse"
                            title="Réparer la panne électrique pour restaurer le courant et augmenter le niveau de la propriété (+20% kW, +15% loyers, +25% valeur)"
                          >
                            <Wrench className="w-3.5 h-3.5 text-red-400" />
                            Réparer la panne (-{(p.electrical_repair_cost || Math.round(p.estimated_value * 0.08)).toLocaleString()}$)
                          </button>
                        ) : (
                          <div className="px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/25 text-green-400 font-mono text-xs font-bold flex items-center gap-1.5 select-none" title="Le réseau électrique fonctionne de manière nominale. Aucun problème signalé.">
                            <Check className="w-3.5 h-3.5 text-green-400" />
                            Réseau Élec : Nominal
                          </div>
                        )}

                        {/* Listing Sales controls */}
                        <div className="flex items-center gap-1.5">
                          {p.listed_for_sale ? (
                            <div className="flex items-center gap-2 w-full">
                              <span className="text-[10px] font-mono text-purple-400 font-bold">Listé à: ${p.sale_price?.toLocaleString()}</span>
                              <button
                                onClick={() => handleCancelPropertySale(p.property_id)}
                                className="px-3 py-1 rounded bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-mono text-[10px] font-bold transition cursor-pointer"
                              >
                                Annuler
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 w-full sm:w-auto font-mono">
                              <div className="relative w-28">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-[10px]">$</span>
                                <input
                                  type="number"
                                  placeholder={p.estimated_value.toString()}
                                  value={propSalePrices[p.property_id] ?? ""}
                                  onChange={(e) => setPropSalePrices({
                                    ...propSalePrices,
                                    [p.property_id]: e.target.value
                                  })}
                                  className="w-full bg-black/40 border border-white/15 rounded px-2 pl-5 py-1 text-[11px] text-white focus:outline-none focus:border-cyan-500"
                                />
                              </div>
                              <button
                                onClick={() => handleListProperty(p.property_id)}
                                className="px-2.5 py-1.5 rounded bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/35 text-purple-300 font-bold text-[10px] uppercase transition cursor-pointer shrink-0"
                              >
                                Revente
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

        {/* -------------------- TAB 2: SHOPS -------------------- */}
        {activeTab === 'shops' && (
          <div className="space-y-4">
            {myShops.length === 0 ? (
              <div className="bg-[#0F0F16] border border-white/5 rounded-2xl p-8 text-center space-y-3 font-mono">
                <Store className="w-10 h-10 text-purple-400 mx-auto animate-pulse" />
                <h3 className="text-white font-bold text-sm">Aucune boutique commerciale</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Vous ne possédez aucun commerce légal en France. Devenez propriétaire d'épiceries ou de bijouteries en visitant la gérance dans l'onglet <strong className="text-cyan-400">Blanchiment & ISF</strong>.
                </p>
                <div className="pt-2">
                  <span className="text-[10px] text-gray-500">Astuce : Améliorer les gérances accroît l'espace de stockage et les marges d'exploitation.</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {myShops.map((shop) => {
                  const age = shop.months_owned || 0;
                  const upgLvl = shop.upgrade_level || 1;
                  const shopVal = shop.estimated_value || shop.buy_cost;
                  const upgCost = Math.round(shopVal * 0.25);
                  const monthlyProfit = shop.last_tick_profit || (shop.base_revenue * 4);

                  return (
                    <div key={shop.id} className={`bg-[#0F0F16] border rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-lg relative overflow-hidden transition hover:border-purple-500/30 ${
                      shop.buyout_offer ? 'border-amber-500/40 shadow-amber-950/10' : 'border-white/5'
                    }`}>
                      {/* Spontaneous Buyout Offer Banner */}
                      {shop.buyout_offer && (
                        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2 flex items-center justify-between text-[11px] font-mono text-black font-extrabold shadow-md">
                          <span className="flex items-center gap-1.5 animate-pulse">
                            <Sparkles className="w-3.5 h-3.5" /> OFFRE DE RACHAT SPONTANÉE REÇUE
                          </span>
                          <span className="bg-black text-amber-400 px-2 py-0.5 rounded text-[10px]">
                            {shop.buyout_offer.offer_price.toLocaleString()}$ cash
                          </span>
                        </div>
                      )}

                      <div className={shop.buyout_offer ? 'pt-4 space-y-4' : 'space-y-4'}>
                        {/* Title and stats badges */}
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
                                Mis en vente
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Shop stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px] text-gray-400">
                          <div className="bg-[#08080C] p-2 rounded border border-white/5 space-y-0.5">
                            <span className="text-gray-500 uppercase text-[8px] block">Valeur Actuelle</span>
                            <span className="text-white font-bold block">${shopVal.toLocaleString()}</span>
                          </div>
                          <div className="bg-[#08080C] p-2 rounded border border-white/5 space-y-0.5">
                            <span className="text-gray-500 uppercase text-[8px] block">Stock / Max</span>
                            <span className="text-amber-400 font-bold block">{shop.current_stock} / {shop.max_stock} u</span>
                          </div>
                          <div className="bg-[#08080C] p-2 rounded border border-white/5 space-y-0.5">
                            <span className="text-gray-500 uppercase text-[8px] block">Profits Mensuels</span>
                            <span className="text-green-400 font-bold block">+${monthlyProfit.toLocaleString()}</span>
                          </div>
                          <div className="bg-[#08080C] p-2 rounded border border-white/5 space-y-0.5">
                            <span className="text-gray-500 uppercase text-[8px] block">Âge d'exploitation</span>
                            <span className="text-purple-300 font-bold block">{age} cycles</span>
                          </div>
                        </div>

                        {/* Accept / Decline buyout offer buttons if active */}
                        {shop.buyout_offer && (
                          <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl space-y-2 font-mono text-xs">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-gray-400">Un groupement de franchise propose de racheter votre fonds :</span>
                              <strong className="text-amber-300 text-sm">${shop.buyout_offer.offer_price.toLocaleString()}</strong>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAcceptShopBuyout(shop.id)}
                                className="flex-1 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-extrabold uppercase transition cursor-pointer text-[10px] tracking-wider text-center"
                              >
                                Vendre le fonds
                              </button>
                              <button
                                onClick={() => handleDeclineShopBuyout(shop.id)}
                                className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer text-[10px]"
                              >
                                Refuser
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Upgrade & Listing controls */}
                      <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                        {/* Upgrade Button */}
                        <button
                          onClick={() => handleUpgradeShop(shop.id)}
                          className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                          title="Agrandir la boutique, optimiser la logistique (+30% stock max, +20% base revenue, +25% valeur)"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          Upgrader logistique (-{upgCost.toLocaleString()}$)
                        </button>

                        {/* Listing Sales controls */}
                        <div className="flex items-center gap-1.5">
                          {shop.listed_for_sale ? (
                            <div className="flex items-center gap-2 w-full">
                              <span className="text-[10px] font-mono text-purple-400 font-bold">Listé à: ${shop.sale_price?.toLocaleString()}</span>
                              <button
                                onClick={() => handleCancelShopSale(shop.id)}
                                className="px-3 py-1 rounded bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-mono text-[10px] font-bold transition cursor-pointer"
                              >
                                Annuler
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 w-full sm:w-auto font-mono">
                              <div className="relative w-28">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-[10px]">$</span>
                                <input
                                  type="number"
                                  placeholder={shopVal.toString()}
                                  value={shopSalePrices[shop.id] ?? ""}
                                  onChange={(e) => setShopSalePrices({
                                    ...shopSalePrices,
                                    [shop.id]: e.target.value
                                  })}
                                  className="w-full bg-black/40 border border-white/15 rounded px-2 pl-5 py-1 text-[11px] text-white focus:outline-none focus:border-purple-500"
                                />
                              </div>
                              <button
                                onClick={() => handleListShop(shop.id)}
                                className="px-2.5 py-1.5 rounded bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/35 text-purple-300 font-bold text-[10px] uppercase transition cursor-pointer shrink-0"
                              >
                                Revente
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

        {/* -------------------- TAB 3: HARDWARE & COMPONENT RESALE -------------------- */}
        {activeTab === 'hardware' && (
          <div className="space-y-6">
            
            {/* Subsection A: Installed Mining Rigs Resale */}
            <div className="bg-[#0F0F16] border border-white/5 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-amber-400 font-black border-b border-white/5 pb-2">
                ⚙️ Vos Rigs de Minage d'Occasion ({myRigs.length})
              </h3>

              {myRigs.length === 0 ? (
                <p className="text-xs text-gray-500 font-mono py-4 text-center">Vous ne possédez aucune carte graphique ou rig ASIC dans votre ferme.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myRigs.map((rig) => {
                    const basePrice = rig.hashrate_th > 1000 ? rig.hashrate_th * 3 : rig.hashrate_th * 7;
                    const wear = rig.wear_condition ?? 1.0;
                    const estVal = Math.round(Math.max(50, basePrice * wear * 0.8));

                    return (
                      <div key={rig.rig_id} className={`bg-[#08080C] border rounded-xl p-4 space-y-3 relative overflow-hidden ${
                        rig.buyout_offer ? 'border-amber-500/30' : 'border-white/5'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-mono text-gray-500 block">ID: {rig.rig_id}</span>
                            <h4 className="text-xs font-bold text-white font-mono">{rig.name}</h4>
                          </div>

                          <div className="flex gap-1">
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-300">
                              État : {Math.round(wear * 100)}%
                            </span>
                            {rig.listed_for_sale && (
                              <span className="text-[9px] font-mono bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded font-bold uppercase">
                                Mis en vente
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-gray-400">
                          <p>Hashrate : <strong className="text-white">{rig.hashrate_th} TH/s</strong></p>
                          <p>Conso : <strong className="text-white">{rig.watts_consumption}W</strong></p>
                          <p className="col-span-2 text-cyan-400">Valeur d'occasion est. : <strong>${estVal.toLocaleString()}</strong></p>
                        </div>

                        {/* Spontaneous offer check */}
                        {rig.buyout_offer && (
                          <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-lg space-y-1.5 font-mono text-[10px] text-gray-300">
                            <p className="flex items-center gap-1 text-amber-400 font-bold uppercase text-[9px]">
                              <Sparkles className="w-3.5 h-3.5" /> Offre de rachat d'occasion reçue !
                            </p>
                            <p>Un mineur tiers propose de racheter ce rig pour : <strong className="text-white text-xs">${rig.buyout_offer.offer_price.toLocaleString()}</strong></p>
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => handleAcceptRigBuyout(rig.rig_id)}
                                className="flex-1 py-1 rounded bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase text-[9px] cursor-pointer"
                              >
                                Accepter l'offre
                              </button>
                              <button
                                onClick={() => handleDeclineRigBuyout(rig.rig_id)}
                                className="px-3 py-1 rounded bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 text-[9px] transition cursor-pointer"
                              >
                                Refuser
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Listing actions */}
                        <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                          {rig.listed_for_sale ? (
                            <div className="flex justify-between items-center w-full text-[10px] font-mono">
                              <span className="text-purple-400 font-bold">Listé à: ${rig.sale_price?.toLocaleString()}</span>
                              <button
                                onClick={() => handleCancelRigSale(rig.rig_id)}
                                className="px-2 py-0.5 rounded bg-red-500/15 hover:bg-red-500/25 text-red-400 font-bold transition cursor-pointer"
                              >
                                Annuler la vente
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 justify-end w-full">
                              <div className="relative w-24">
                                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-[9px]">$</span>
                                <input
                                  type="number"
                                  placeholder={estVal.toString()}
                                  value={rigSalePrices[rig.rig_id] ?? ""}
                                  onChange={(e) => setRigSalePrices({
                                    ...rigSalePrices,
                                    [rig.rig_id]: e.target.value
                                  })}
                                  className="w-full bg-black/40 border border-white/15 rounded px-2 pl-4 py-0.5 font-mono text-[10px] text-white focus:outline-none focus:border-amber-500"
                                />
                              </div>
                              <button
                                onClick={() => handleListRig(rig.rig_id)}
                                className="px-2 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/35 text-purple-300 font-bold font-mono text-[9px] uppercase transition cursor-pointer"
                              >
                                Revente
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Subsection B: Spare Parts & Coolers Instant Liquidation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Unequipped cooling kits */}
              <div className="bg-[#0F0F16] border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-2">
                  <Package className="w-4 h-4 text-cyan-400" />
                  Kits Watercooling en Stock ({myCoolers.length})
                </h4>
                <p className="text-[11px] text-gray-400 font-sans">
                  Ces systèmes de watercooling ne sont pas équipés. Vous pouvez les liquider immédiatement pour 70% de leur prix standard.
                </p>

                {myCoolers.length === 0 ? (
                  <p className="text-xs text-gray-600 font-mono text-center py-4">Aucun kit de refroidissement en inventaire.</p>
                ) : (
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto font-mono text-xs">
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
                              <p className="text-[9px] text-gray-500 mt-0.5">Val. d'origine : ${standardPrice} | Liquidation (70%) : ${liqVal}</p>
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

              {/* Spare parts */}
              <div className="bg-[#0F0F16] border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-mono uppercase tracking-widest text-purple-400 font-bold flex items-center gap-2">
                  <Hammer className="w-4 h-4 text-purple-400" />
                  Pièces Détachées de l'Établi ({mySpareParts.length})
                </h4>
                <p className="text-[11px] text-gray-400 font-sans">
                  Vos pièces de rechange de silicium, VRAM ou turbines de ventilation. Liquidation immédiate à 70% de leur prix d'Atelier.
                </p>

                {mySpareParts.length === 0 ? (
                  <p className="text-xs text-gray-600 font-mono text-center py-4">Aucune pièce détachée en inventaire.</p>
                ) : (
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto font-mono text-xs">
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
                              <p className="text-[9px] text-gray-500 mt-0.5">Val. d'Atelier : ${standardPrice} | Liquidation (70%) : ${liqVal}</p>
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

          </div>
        )}

      </div>
    </div>
  );
};
