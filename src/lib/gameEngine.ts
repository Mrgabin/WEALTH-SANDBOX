import { FullGlobalState, PlayerProfile, ServerLog, StockMarketItem } from '../types/wealth';

const LOCAL_STORAGE_KEY = 'wealth_sandbox_omni_v8_state';

export const INITIAL_STATE: FullGlobalState = {
  server_config: {
    tva_rate: 0.05,
    property_tax_rate: 0.01,
    isf_threshold: 1000000.0,
    isf_rate: 0.001,
    electricity_kwh_rate: 0.12,
    global_net_hashrate_th: 5000000,
    btc_block_reward_24h: 6.25,
  },
  current_player_id: 'player_102',
  players: {
    'player_102': {
      id: 'player_102',
      name: 'Alex_Vance',
      email: 'alex.vance@nexus.io',
      password: 'CyberPass_2026!',
      role: 'ADMIN',
      cash_dirty: 85400.00,
      bank_clean: 1420000.00,
      credit_score: 780,
      licenses: ['HARDWARE_STORE_OWNER', 'REAL_ESTATE_BROKER', 'CASINO_VIP', 'LOAN_SHARK_LICENSE'],
      electricity_meter_hacked: false,
      meter_hacked_risk: 15,
      last_active: new Date().toISOString(),
      avatar_color: '#06b6d4',
      account_age_months: 24,
      active_positions: []
    },
    'player_45': {
      id: 'player_45',
      name: 'Marc_Dupuis',
      email: 'marc.dupuis@email.com',
      password: 'Paris2024!',
      role: 'PLAYER',
      cash_dirty: 342000.00,
      bank_clean: 185000.00,
      credit_score: 620,
      licenses: ['HARDWARE_STORE_OWNER'],
      electricity_meter_hacked: true,
      meter_hacked_risk: 45,
      last_active: new Date().toISOString(),
      avatar_color: '#a855f7',
      account_age_months: 12,
      active_positions: []
    },
    'player_88': {
      id: 'player_88',
      name: 'Julie_Dev',
      email: 'julie_dev@nexus.io',
      password: 'react_is_fun',
      role: 'PLAYER',
      cash_dirty: 12000.00,
      bank_clean: 890000.00,
      credit_score: 740,
      licenses: ['REAL_ESTATE_BROKER'],
      electricity_meter_hacked: false,
      meter_hacked_risk: 0,
      last_active: new Date().toISOString(),
      avatar_color: '#22c35e',
      account_age_months: 6,
      active_positions: []
    },
    'player_99': {
      id: 'player_99',
      name: 'Guest_882',
      email: 'guest882@nexus.io',
      password: 'welcome123',
      role: 'PLAYER',
      cash_dirty: 50000.00,
      bank_clean: 50000.00,
      credit_score: 550,
      licenses: [],
      electricity_meter_hacked: false,
      meter_hacked_risk: 0,
      last_active: new Date().toISOString(),
      avatar_color: '#f59e0b',
      account_age_months: 1,
      active_positions: []
    }
  },
  player_shops: [
    {
      shop_id: 'shop_01',
      owner_id: 'player_102',
      owner_name: 'Alex_Vance',
      name: 'Apex Hardware & Mining Tech',
      inventory: [
        { id: 'i1', item_code: 'GPU_RTX_4090', name: 'NVIDIA RTX 4090 24GB', type: 'GPU', buy_cost: 1400.00, sell_price: 1950.00, stock: 6, hashrate_th: 120, watts_consumption: 450 },
        { id: 'i2', item_code: 'ASIC_BITMAIN_S19', name: 'Bitmain Antminer S19 Pro', type: 'ASIC', buy_cost: 3200.00, sell_price: 4100.00, stock: 3, hashrate_th: 450, watts_consumption: 3250 },
        { id: 'i3', item_code: 'CHIP_ASIC_CUSTOM', name: 'Custom Overclock Microchip', type: 'CHIP', buy_cost: 250.00, sell_price: 490.00, stock: 12 },
        { id: 'i4', item_code: 'RIG_FRAME_OCTO', name: 'Rig Frame 8-GPU Liquid Cooling', type: 'RIG_CASE', buy_cost: 350.00, sell_price: 600.00, stock: 5 }
      ],
      monthly_taxes_due: 450.00
    },
    {
      shop_id: 'shop_02',
      owner_id: 'player_45',
      owner_name: 'Marc_Dupuis',
      name: 'BlackMarket Luxury Goods',
      inventory: [
        { id: 'i5', item_code: 'ROLEX_DAYTONA', name: 'Rolex Daytona Gold Edition', type: 'LUXURY_WATCH', buy_cost: 22000.00, sell_price: 31000.00, stock: 2 },
        { id: 'i6', item_code: 'SAFE_KEY_DOCK12', name: 'Clé de Coffre Fort Dock 12', type: 'SAFE_KEY', buy_cost: 5000.00, sell_price: 12000.00, stock: 1 }
      ],
      monthly_taxes_due: 1200.00
    }
  ],
  real_estate_agencies: [
    {
      agency_id: 'agency_01',
      owner_id: 'player_102',
      owner_name: 'Alex_Vance',
      name: 'Nexus Prime Real Estate Agency',
      commission_rate: 0.06,
      managed_properties: [
        {
          property_id: 'hangar_dock_12',
          name: 'Hangar Industriel Dock 12',
          type: 'HANGAR',
          owner_id: 'player_45',
          owner_name: 'Marc_Dupuis',
          tenant_id: 'player_88',
          tenant_name: 'Julie_Dev',
          rent_monthly: 2500.00,
          estimated_value: 350000.00,
          power_capacity_kw: 150
        },
        {
          property_id: 'datacenter_zone_4',
          name: 'Data Center CyberZone 4',
          type: 'DATA_CENTER',
          owner_id: 'player_102',
          owner_name: 'Alex_Vance',
          tenant_id: 'player_102',
          tenant_name: 'Alex_Vance',
          rent_monthly: 8500.00,
          estimated_value: 1200000.00,
          power_capacity_kw: 500
        },
        {
          property_id: 'garage_res_08',
          name: 'Garage Résidentiel Suburb',
          type: 'GARAGE',
          owner_id: 'player_88',
          owner_name: 'Julie_Dev',
          tenant_id: 'player_99',
          tenant_name: 'Guest_882',
          rent_monthly: 450.00,
          estimated_value: 45000.00,
          power_capacity_kw: 10
        }
      ]
    }
  ],
  mining_farms: {
    'player_102': {
      location_id: 'datacenter_zone_4',
      location_name: 'Data Center CyberZone 4',
      power_capacity_watts: 500000,
      cooling_type: 'LIQUID',
      rigs: [
        { rig_id: 'rig_01', name: 'Cluster GPU Alpha 1', type: 'CUSTOM_RIG_PRO', bought_from_shop: 'shop_01', hashrate_th: 950, watts_consumption: 4200, wear_condition: 0.98, overclocked: true },
        { rig_id: 'rig_02', name: 'ASIC Bitmain S19 Rack', type: 'ASIC_BITMAIN_S19', bought_from_shop: 'shop_01', hashrate_th: 450, watts_consumption: 3250, wear_condition: 0.94, overclocked: false },
        { rig_id: 'rig_03', name: 'NVIDIA RTX 4090 Array', type: 'GPU_RTX_4090', bought_from_shop: 'shop_01', hashrate_th: 360, watts_consumption: 1350, wear_condition: 0.89, overclocked: false }
      ]
    },
    'player_45': {
      location_id: 'hangar_dock_12',
      location_name: 'Hangar Industriel Dock 12',
      power_capacity_watts: 150000,
      cooling_type: 'AIR',
      rigs: [
        { rig_id: 'rig_04', name: 'Clandestine Mining Rig', type: 'ASIC_BITMAIN_S19', bought_from_shop: 'shop_01', hashrate_th: 400, watts_consumption: 3300, wear_condition: 0.75, overclocked: true }
      ]
    }
  },
  auction_items: [
    {
      id: 'auc_01',
      seller_id: 'player_45',
      seller_name: 'Marc_Dupuis',
      title: 'Lot de 4x GPUs RTX 4090 (Sous Scellés)',
      description: 'Matériel neuf importé directement du port. Vente discrète en liquide.',
      current_bid: 6800.00,
      buyout_price: 8500.00,
      is_cash_only: true,
      highest_bidder_id: 'player_88',
      highest_bidder_name: 'Julie_Dev',
      expires_in_ticks: 45
    },
    {
      id: 'auc_02',
      seller_id: 'player_102',
      seller_name: 'Alex_Vance',
      title: 'Licence Exclusive Courtier Immobilier',
      description: 'Autorise la gestion de mandats exclusifs et la perception de 6% de commissions.',
      current_bid: 25000.00,
      buyout_price: 40000.00,
      is_cash_only: false,
      expires_in_ticks: 120
    }
  ],
  loans: [
    {
      id: 'loan_01',
      lender_id: 'player_102',
      lender_name: 'Alex_Vance',
      borrower_id: 'player_45',
      borrower_name: 'Marc_Dupuis',
      amount: 100000.00,
      weekly_interest_rate: 0.15,
      is_dirty: true,
      collateral: 'Hangar Industriel Dock 12',
      due_ticks_remaining: 14
    }
  ],
  laundering_businesses: {
    'player_102': [
      { id: 'laund_01', owner_id: 'player_102', name: 'CyberClub Neon Pulse (Boîte de Nuit)', type: 'NIGHTCLUB', capacity_per_tick: 5000.00, fee_rate: 0.20, total_laundered: 450000.00 }
    ],
    'player_45': [
      { id: 'laund_02', owner_id: 'player_45', name: 'Pressing Express 24/7 (Lavomatique)', type: 'LAUNDROMAT', capacity_per_tick: 2500.00, fee_rate: 0.15, total_laundered: 120000.00 }
    ]
  },
  market_prices: [
    { symbol: 'BTCUSDT', name: 'Bitcoin / USDT', price: 92450.00, change_percent: +3.42, history: [89000, 90200, 91500, 91100, 92450], category: 'CRYPTO' },
    { symbol: 'ETHUSDT', name: 'Ethereum / USDT', price: 3450.00, change_percent: +1.85, history: [3300, 3380, 3410, 3450], category: 'CRYPTO' },
    { symbol: 'SOLUSDT', name: 'Solana / USDT', price: 215.00, change_percent: -0.45, history: [220, 218, 212, 215], category: 'CRYPTO' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 138.50, change_percent: +4.12, history: [131, 134, 136, 138.5], category: 'STOCK' },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.80, change_percent: -2.10, history: [255, 251, 248, 245.8], category: 'STOCK' },
    { symbol: 'AAPL', name: 'Apple Inc.', price: 228.30, change_percent: +0.75, history: [225, 226, 227.5, 228.3], category: 'STOCK' },
    { symbol: 'SP500', name: 'S&P 500 Index', price: 5820.00, change_percent: +0.35, history: [5780, 5800, 5820], category: 'STOCK' },
    { symbol: 'SERVER_BOND_1Y', name: 'Obligation Serveur 1 An', price: 1000.00, change_percent: 0.00, history: [1000, 1000, 1000], category: 'BOND', yearly_yield: 0.04 }
  ],
  logs: [
    { id: 'log_01', timestamp: new Date().toLocaleTimeString(), type: 'TICK', message: 'Wealth Sandbox Kernel Initialized v8.0 OMNI', status: 'OK' },
    { id: 'log_02', timestamp: new Date().toLocaleTimeString(), type: 'DB_WRITE', message: 'Firebase Live Sync Node ready (Auth & Firestore)', status: 'OK' }
  ],
  tick_count: 142,
  is_tick_running: true,
  global_hardware_stock: {
    'gpu_gb200_nvl72': 2,
    'gpu_b200': 8,
    'gpu_mi300x': 10,
    'gpu_h200': 10,
    'gpu_h100': 12,
    'gpu_rtx_6000_ada': 15,
    'gpu_w7900': 15,
    'gpu_rtx_a6000': 15,
    'gpu_rtx_8000': 15,
    'gpu_rtx_5090': 20,
    'gpu_rtx_5080': 25,
    'gpu_rtx_5070ti': 30,
    'gpu_rtx_5070': 30,
    'gpu_rtx_5060ti': 35,
    'gpu_rtx_5060': 40,
    'gpu_rtx_4090': 20,
    'gpu_rtx_4090d': 20,
    'gpu_rtx_4080s': 20,
    'gpu_rtx_4070tis': 20,
    'gpu_rtx_4070ti': 25,
    'gpu_rtx_4070s': 25,
    'gpu_rtx_4070': 25,
    'gpu_rtx_4060ti_16g': 30,
    'gpu_rtx_4060ti_8g': 30,
    'gpu_rtx_4060': 30,
    'gpu_rtx_3090ti': 20,
    'gpu_rtx_3090': 20,
    'gpu_rtx_3080ti': 25,
    'gpu_rtx_3080_12g': 25,
    'gpu_rtx_3080_10g': 25,
    'gpu_rtx_3070ti': 30,
    'gpu_rtx_3070': 30,
    'gpu_rtx_3060ti': 35,
    'gpu_rtx_3060_12g': 40,
    'gpu_rtx_3060_8g': 40,
    'gpu_rtx_3050_8g': 45,
    'gpu_rtx_3050_6g': 50,
    'gpu_titan_rtx': 10,
    'gpu_rtx_2080ti': 15,
    'gpu_rtx_2080s': 20,
    'gpu_rtx_2080': 20,
    'gpu_rtx_2070s': 25,
    'gpu_rtx_2070': 25,
    'gpu_rtx_2060s': 30,
    'gpu_rtx_2060_12g': 30,
    'gpu_rtx_2060_6g': 30,
    'gpu_rx_7900xtx': 20,
    'gpu_rx_6900xt': 15,
    'asic_s21_hyd': 5,
    'asic_s19_xp': 5,
    'asic_m50s': 5,
    'asic_k9': 5,
    // === WATERCOOLINGS AIO (TOUT-EN-UN) ===
    'wc_arctic_lf3_240': 15,
    'wc_arctic_lf3_280': 15,
    'wc_arctic_lf3_360': 15,
    'wc_thermalright_fe': 20,
    'wc_thermalright_fn': 20,
    'wc_thermalright_gv': 20,
    'wc_msi_a13': 15,
    'wc_cm_atmos': 15,
    'wc_cm_atmos_stealth': 15,
    'wc_nzxt_kraken_elite_240': 10,
    'wc_nzxt_kraken_elite_280': 10,
    'wc_nzxt_kraken_elite_360': 10,
    'wc_corsair_titan_rx': 12,
    'wc_corsair_titan_rx_lcd': 10,
    'wc_asus_ryujin_3': 8,
    'wc_asus_ryuo_4': 10,
    'wc_lianli_galahad_2_lcd': 12,
    'wc_lianli_hydroshift': 12,
    'wc_tryx_panorama_360': 6,
    'wc_bequiet_pure_loop_3': 15,
    'wc_bequiet_silent_loop_2': 15,
    'wc_bequiet_light_loop': 15,
    'wc_corsair_nautilus_360': 20,
    // === WATERCOOLINGS CUSTOM ===
    'wc_custom_ekwb': 8,
    'wc_custom_corsair_hydro_x': 10,
    'wc_custom_alphacool': 10,
    'wc_custom_bitspower': 12,
    'wc_custom_barrow_bykski': 15
  }
};

export function loadSavedState(): FullGlobalState {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const merged = { ...INITIAL_STATE, ...parsed };
      if (!merged.global_hardware_stock) {
        merged.global_hardware_stock = { ...INITIAL_STATE.global_hardware_stock };
      } else {
        // Guarantee all new keys are initialized
        Object.keys(INITIAL_STATE.global_hardware_stock).forEach(key => {
          if (merged.global_hardware_stock[key] === undefined) {
            merged.global_hardware_stock[key] = INITIAL_STATE.global_hardware_stock[key];
          }
        });
      }
      // Ensure all players have account_age_months and active_positions initialized
      Object.keys(merged.players).forEach(pid => {
        if (merged.players[pid].account_age_months === undefined) {
          merged.players[pid].account_age_months = INITIAL_STATE.players[pid]?.account_age_months ?? 1;
        }
        if (!merged.players[pid].active_positions) {
          merged.players[pid].active_positions = [];
        }
      });
      return merged;
    }
  } catch (e) {
    console.error("Error loading local state:", e);
  }
  return INITIAL_STATE;
}

export function saveGlobalState(state: FullGlobalState) {
  try {
    const isAuth = localStorage.getItem('wealth_sandbox_is_authenticated') === 'true';
    if (isAuth) {
      // Wipes browser state cache to avoid conflict with online Firestore database
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    }
  } catch (e) {
    console.error("Error saving state:", e);
  }
}

// MAIN GAME ENGINE TICK LOOP
export function executeGlobalServerTick(prevState: FullGlobalState): FullGlobalState {
  const nextState: FullGlobalState = JSON.parse(JSON.stringify(prevState));
  nextState.tick_count += 1;
  const nowStr = new Date().toLocaleTimeString();

  const newLogs: ServerLog[] = [];

  // 1. Update Market Prices with random drift
  nextState.market_prices = nextState.market_prices.map(item => {
    const volatility = item.category === 'CRYPTO' ? 0.015 : 0.005;
    const deltaPercent = (Math.random() - 0.49) * volatility;
    const newPrice = Math.max(1, item.price * (1 + deltaPercent));
    const history = [...item.history.slice(-14), Number(newPrice.toFixed(2))];
    return {
      ...item,
      price: Number(newPrice.toFixed(2)),
      change_percent: Number((deltaPercent * 100).toFixed(2)),
      history
    };
  });

  const btcItem = nextState.market_prices.find(m => m.symbol === 'BTCUSDT');
  const btcPrice = btcItem ? btcItem.price : 92450;

  // 2. Process each player's mining farm, ISF tax, and laundering
  Object.keys(nextState.players).forEach(pid => {
    const player = nextState.players[pid];
    const farm = nextState.mining_farms[pid];

    // --- Crypto Mining Processing ---
    if (farm && farm.rigs && farm.rigs.length > 0) {
      let totalWatts = 0;
      let totalHashrate = 0;

      // Handle Datacenter failures
      if (!farm.datacenter_failure_type) {
        farm.datacenter_failure_type = 'NONE';
      }

      if (farm.datacenter_failure_type === 'NONE') {
        // 0.25% chance of datacenter failure per tick
        if (Math.random() < 0.0025) {
          const dcFailures: ('SWITCH_FAILURE' | 'HVAC_FAILURE' | 'TRANSFORMER_BLOWN')[] = ['SWITCH_FAILURE', 'HVAC_FAILURE', 'TRANSFORMER_BLOWN'];
          const chosenFail = dcFailures[Math.floor(Math.random() * dcFailures.length)];
          farm.datacenter_failure_type = chosenFail;
          if (chosenFail === 'SWITCH_FAILURE') {
            farm.datacenter_failure_details = "Panne critique du Switch Réseau Principal. Perte totale de connectivité réseau.";
          } else if (chosenFail === 'HVAC_FAILURE') {
            farm.datacenter_failure_details = "Système de Climatisation Industriel (HVAC) en surchauffe. Températures critiques, consommation augmentée et dégradation accélérée.";
          } else if (chosenFail === 'TRANSFORMER_BLOWN') {
            farm.datacenter_failure_details = "Explosion d'un transformateur de moyenne tension de la sous-station électrique. Coupure d'alimentation totale.";
          }

          newLogs.push({
            id: `log_dc_fail_${Date.now()}_${pid}`,
            timestamp: nowStr,
            type: 'MINING',
            uid: player.id,
            message: `🚨 ALERTE INFRASTRUCTURE (${farm.location_name}) : ${farm.datacenter_failure_details}`,
            status: 'ALERT'
          });
        }
      }

      farm.rigs.forEach(rig => {
        if (rig.shelved || rig.listed_for_sale) return; // Skip shelved/listed hardware

        // Ensure failure properties are initialized
        if (!rig.failure_type) {
          rig.failure_type = 'NONE';
        }

        // Random component failure check (only if rig is otherwise working and not dead)
        if (rig.failure_type === 'NONE' && rig.wear_condition > 0.05) {
          const failChance = rig.overclocked ? 0.006 : 0.002;
          if (Math.random() < failChance) {
            const compFailures: ('VRAM' | 'PROCESSOR' | 'FAN')[] = ['VRAM', 'PROCESSOR', 'FAN'];
            const chosenComp = compFailures[Math.floor(Math.random() * compFailures.length)];
            rig.failure_type = chosenComp;

            let partCode = 'VRAM_RTX_4090';
            const rName = rig.name || '';
            const rType = rig.type || '';
            if (rName.includes('5090') || rType.includes('5090')) {
              partCode = `${chosenComp}_RTX_5090`;
            } else if (rName.includes('4090') || rType.includes('4090')) {
              partCode = `${chosenComp}_RTX_4090`;
            } else if (rName.includes('3090') || rType.includes('3090')) {
              partCode = `${chosenComp}_RTX_3090`;
            } else if (rName.includes('4070') || rType.includes('4070')) {
              partCode = `${chosenComp}_RTX_4070`;
            } else if (rType.includes('ASIC') || rName.toLowerCase().includes('asic')) {
              partCode = `${chosenComp}_ASIC`;
            } else {
              partCode = `${chosenComp}_RTX_4090`;
            }

            rig.required_spare_part_code = partCode;
            if (chosenComp === 'VRAM') {
              rig.failure_details = `Mémoire vidéo (VRAM) défectueuse sur ${rig.name}. Code pièce requis: ${partCode}`;
            } else if (chosenComp === 'PROCESSOR') {
              rig.failure_details = `Processeur principal (Silicon Core) instable ou grillé sur ${rig.name}. Code pièce requis: ${partCode}`;
            } else if (chosenComp === 'FAN') {
              rig.failure_details = `Unité de ventilation grippée. Surchauffe immédiate. Code pièce requis: ${partCode}`;
            }

            newLogs.push({
              id: `log_rig_fail_${Date.now()}_${rig.rig_id}`,
              timestamp: nowStr,
              type: 'MINING',
              uid: player.id,
              message: `⚠️ PANNE DE COMPOSANT : ${rig.name} a subi un crash de type ${chosenComp} ! (${rig.failure_details})`,
              status: 'WARN'
            });
          }
        }

        // Adjust variables depending on active failures
        let dcHashrateMult = 1.0;
        let dcWattsMult = 1.0;
        let dcWearMult = 1.0;

        if (farm.datacenter_failure_type === 'SWITCH_FAILURE') {
          dcHashrateMult = 0.0;
        } else if (farm.datacenter_failure_type === 'TRANSFORMER_BLOWN') {
          dcHashrateMult = 0.0;
          dcWattsMult = 0.0;
        } else if (farm.datacenter_failure_type === 'HVAC_FAILURE') {
          dcWattsMult = 2.0;
          dcWearMult = 5.0;
        }

        let rigHashrateMult = 1.0;
        let rigWattsMult = 1.0;
        let rigWearMult = 1.0;

        if (rig.failure_type === 'VRAM') {
          rigHashrateMult = 0.0;
          rigWattsMult = 0.1; // Idle power consumption
        } else if (rig.failure_type === 'PROCESSOR') {
          rigHashrateMult = 0.0;
          rigWattsMult = 0.05; // Offline power
        } else if (rig.failure_type === 'FAN') {
          rigHashrateMult = 0.15; // Throttled extremely low to prevent core meltdown
          rigWattsMult = 0.4;
          rigWearMult = 4.0; // Accelerates wear of other remaining components
        }

        if (rig.wear_condition > 0.05) {
          const ocMult = rig.overclocked ? 1.25 : 1.0;
          const coolingBoost = (farm.cooling_type === 'LIQUID' && rig.hashrate_th > 0) ? 1.08 : 1.0;
          totalWatts += rig.watts_consumption * ocMult * dcWattsMult * rigWattsMult;
          totalHashrate += rig.hashrate_th * rig.wear_condition * ocMult * coolingBoost * dcHashrateMult * rigHashrateMult;
          
          // Wear condition degradation
          const degradation = (rig.overclocked ? 0.0001 : 0.00003) * (farm.cooling_type === 'LIQUID' ? 0.5 : 1.0) * dcWearMult * rigWearMult;
          rig.wear_condition = Math.max(0, rig.wear_condition - degradation);
        }
      });

      const baseRate = player.active_subscriptions?.includes('green_electricity') 
        ? nextState.server_config.electricity_kwh_rate * 0.75 
        : nextState.server_config.electricity_kwh_rate;
      const dailyKWh = (totalWatts / 1000) * 24;
      const electricityCost = player.electricity_meter_hacked 
        ? 0 
        : dailyKWh * baseRate;

      // Hacked meter risk check (VPN premium reduces risk from 3% to 0.5%)
      if (player.electricity_meter_hacked) {
        const auditRisk = player.active_subscriptions?.includes('vpn_premium') ? 0.005 : 0.03;
        if (Math.random() < auditRisk) {
          const fine = 25000;
          player.bank_clean = Math.max(0, player.bank_clean - fine);
          newLogs.push({
            id: `log_audit_${Date.now()}_${pid}`,
            timestamp: nowStr,
            type: 'MINING',
            uid: player.id,
            message: `AUDIT SERVEUR: Piratage de compteur détecté chez ${player.name}! ${player.active_subscriptions?.includes('vpn_premium') ? '(Le VPN a limité les dégâts)' : ''} Amende infligée: ${fine.toLocaleString()}`,
            status: 'ALERT'
          });
        }
      }

      const minedBTC = (totalHashrate / nextState.server_config.global_net_hashrate_th) * nextState.server_config.btc_block_reward_24h;
      const cryptoRevenue = minedBTC * btcPrice;
      const netGain = cryptoRevenue - electricityCost;

      player.bank_clean = Math.max(0, player.bank_clean + netGain);

      if (netGain !== 0 && nextState.tick_count % 5 === 0) {
        newLogs.push({
          id: `log_mine_${Date.now()}_${pid}`,
          timestamp: nowStr,
          type: 'MINING',
          uid: player.id,
          message: `${player.name} Hashrate: ${Math.round(totalHashrate)} TH/s | Gain Crypto: +${cryptoRevenue.toFixed(2)}$ | Élec: -${electricityCost.toFixed(2)}$`,
          status: 'OK'
        });
      }
    }

    // --- Small Shops (Boutiques de France) Real-Time Processing ---
    if (player.shop_properties && player.shop_properties.length > 0) {
      player.shop_properties.forEach(shop => {
        // Base constants based on shop type
        let stdSupplyCost = 4;
        let stdSellPrice = 12;
        if (shop.type === 'BOULANGERIE') { stdSupplyCost = 2; stdSellPrice = 7; }
        else if (shop.type === 'BISTRO') { stdSupplyCost = 5; stdSellPrice = 18; }
        else if (shop.type === 'BOUTIQUE_MODE') { stdSupplyCost = 15; stdSellPrice = 45; }
        else if (shop.type === 'HIGH_TECH') { stdSupplyCost = 80; stdSellPrice = 220; }
        else if (shop.type === 'BIJOUTERIE') { stdSupplyCost = 400; stdSellPrice = 1200; }

        // Quality adjustments
        let qualityCostMult = 1.0;
        let qualitySellMult = 1.0;
        if (shop.selected_supply_type === 'LOW_COST') {
          qualityCostMult = 0.6;
          qualitySellMult = 0.7;
        } else if (shop.selected_supply_type === 'PREMIUM') {
          qualityCostMult = 1.6;
          qualitySellMult = 1.8;
        }

        // City Multipliers (both for buy cost and sell price / demand!)
        let cityRevenueMult = 1.0;
        const lowerCity = shop.city.toLowerCase();
        if (lowerCity.includes('paris')) cityRevenueMult = 4.5;
        else if (lowerCity.includes('lyon')) cityRevenueMult = 2.3;
        else if (lowerCity.includes('marseille')) cityRevenueMult = 1.7;
        else if (lowerCity.includes('bordeaux')) cityRevenueMult = 1.9;
        else if (lowerCity.includes('nice')) cityRevenueMult = 2.1;
        else if (lowerCity.includes('chamonix')) cityRevenueMult = 1.3;
        else if (lowerCity.includes('mende')) cityRevenueMult = 0.6;
        else if (lowerCity.includes('guéret')) cityRevenueMult = 0.5;

        // Marketing Campaign Multipliers and ticking Costs
        let marketingDemandMult = 1.0;
        let marketingCostTick = 0;
        if (shop.com_campaign === 'FLYERS') {
          marketingDemandMult = 1.25;
          marketingCostTick = 5;
        } else if (shop.com_campaign === 'SOCIAL_MEDIA') {
          marketingDemandMult = 1.6;
          marketingCostTick = 20;
        } else if (shop.com_campaign === 'TV') {
          marketingDemandMult = 2.5;
          marketingCostTick = 80;
        }

        // Pricing Multiplier Demand Adjustment
        // High multipliers crash demand; low multipliers surge it
        let pricingDemandMult = 1.0;
        if (shop.sell_price_multiplier > 1.0) {
          pricingDemandMult = Math.max(0.05, 2.0 - shop.sell_price_multiplier);
        } else if (shop.sell_price_multiplier < 1.0) {
          pricingDemandMult = 1.0 + (1.0 - shop.sell_price_multiplier) * 1.5;
        }

        // Overall Demand calculation
        const overallDemandFactor = marketingDemandMult * pricingDemandMult * (0.8 + Math.random() * 0.4);

        // Max units that can be sold per tick (proportional to shop scale/type)
        let maxTickSales = 3;
        if (shop.type === 'BOULANGERIE') maxTickSales = 6;
        else if (shop.type === 'BIJOUTERIE') maxTickSales = 1;

        let unitsSold = 0;
        let tickRevenue = 0;
        let tickCost = marketingCostTick;
        let netProfit = 0;

        if (shop.current_stock > 0) {
          const rawSales = Math.round(maxTickSales * overallDemandFactor);
          unitsSold = Math.min(shop.current_stock, Math.max(0, rawSales));

          if (unitsSold > 0) {
            const sellPricePerUnit = stdSellPrice * shop.sell_price_multiplier * cityRevenueMult * qualitySellMult;
            const supplyCostPerUnit = stdSupplyCost * cityRevenueMult * qualityCostMult;

            tickRevenue = unitsSold * sellPricePerUnit;
            tickCost += unitsSold * supplyCostPerUnit;
            
            // Deduct sold stock
            shop.current_stock -= unitsSold;
          }
        }

        netProfit = tickRevenue - tickCost;
        player.bank_clean = Math.max(0, player.bank_clean + netProfit);

        shop.last_tick_revenue = Number(tickRevenue.toFixed(2));
        shop.last_tick_profit = Number(netProfit.toFixed(2));

        // Unlock Multi-Propriétaire Achievement if player owns 3+ shops
        if (player.shop_properties.length >= 3 && !player.achievements?.includes('ach_real_estate_king')) {
          if (!player.achievements) player.achievements = [];
          player.achievements.push('ach_real_estate_king');
          newLogs.push({
            id: `log_ach_sh_king_${Date.now()}`,
            timestamp: nowStr,
            type: 'DB_WRITE',
            uid: player.id,
            message: `🏆 SUCCÈS DÉVERROUILLÉ: 'Multi-Propriétaire' pour ${player.name} ! (Achat de 3+ boutiques)`,
            status: 'OK'
          });
        }
      });
    }

    // --- Trading Position Real-Time Processing ---
    if (player.active_positions && player.active_positions.length > 0) {
      const activePositions: typeof player.active_positions = [];
      player.active_positions.forEach(pos => {
        const marketItem = nextState.market_prices.find(m => m.symbol === pos.symbol);
        if (!marketItem) {
          activePositions.push(pos);
          return;
        }

        const currentPrice = marketItem.price;
        const priceRatio = currentPrice / pos.entry_price;
        const pnlRatio = pos.is_long 
          ? (priceRatio - 1) * pos.leverage
          : (1 - priceRatio) * pos.leverage;

        // Liquidation check (loss of 90% or more)
        if (pnlRatio <= -0.90) {
          newLogs.push({
            id: `log_liq_${Date.now()}_${pos.id}`,
            timestamp: nowStr,
            type: 'TAX_ISF',
            uid: player.id,
            message: `LIQUIDATION CRITIQUE : Position ${pos.is_long ? 'LONG' : 'SHORT'} x${pos.leverage} sur ${pos.symbol} liquidée chez ${player.name} ! Perte de la marge de $${pos.margin.toLocaleString()}`,
            status: 'ALERT'
          });

          if (player.id === nextState.current_player_id) {
            nextState.active_event = {
              id: `event_liq_${Date.now()}`,
              title: "🚨 LIQUIDATION DE POSITION !",
              description: `Le cours de ${pos.symbol} a évolué contre vous à $${currentPrice.toLocaleString()}. Votre marge de $${pos.margin.toLocaleString()} a été entièrement absorbée par l'effet de levier x${pos.leverage}.`,
              type: 'MARKET_CRASH' as any,
              severity: 'CRITICAL',
              impactText: `Position clôturée de force. Perte sèche de -$${pos.margin.toLocaleString()}`
            };
          }
          return;
        }

        // Take Profit / Stop Loss check
        let shouldClose = false;
        let closeReason = '';
        let closePrice = currentPrice;

        if (pos.stop_loss !== undefined) {
          // Verify valid SL boundary to prevent instant-trigger exploits
          const isValidSL = pos.is_long ? (pos.stop_loss < pos.entry_price) : (pos.stop_loss > pos.entry_price);
          if (isValidSL) {
            if (pos.is_long && currentPrice <= pos.stop_loss) {
              shouldClose = true;
              closeReason = 'STOP LOSS ATTEINT';
              closePrice = currentPrice;
            } else if (!pos.is_long && currentPrice >= pos.stop_loss) {
              shouldClose = true;
              closeReason = 'STOP LOSS ATTEINT';
              closePrice = currentPrice;
            }
          }
        }

        if (!shouldClose && pos.take_profit !== undefined) {
          // Verify valid TP boundary to prevent instant-trigger exploits
          const isValidTP = pos.is_long ? (pos.take_profit > pos.entry_price) : (pos.take_profit < pos.entry_price);
          if (isValidTP) {
            if (pos.is_long && currentPrice >= pos.take_profit) {
              shouldClose = true;
              closeReason = 'TAKE PROFIT ATTEINT';
              closePrice = currentPrice;
            } else if (!pos.is_long && currentPrice <= pos.take_profit) {
              shouldClose = true;
              closeReason = 'TAKE PROFIT ATTEINT';
              closePrice = currentPrice;
            }
          }
        }

        if (shouldClose) {
          const finalRatio = closePrice / pos.entry_price;
          const finalPnlRatio = pos.is_long 
            ? (finalRatio - 1) * pos.leverage
            : (1 - finalRatio) * pos.leverage;

          const profitLossAmount = pos.margin * finalPnlRatio;
          const totalRefund = pos.margin + profitLossAmount;

          player.bank_clean = Math.max(0, player.bank_clean + totalRefund);

          newLogs.push({
            id: `log_close_${Date.now()}_${pos.id}`,
            timestamp: nowStr,
            type: 'DB_WRITE',
            uid: player.id,
            message: `TRADING (${closeReason}) : Position ${pos.is_long ? 'LONG' : 'SHORT'} sur ${pos.symbol} fermée à $${closePrice.toLocaleString()}. PnL: ${profitLossAmount >= 0 ? '+' : ''}$${profitLossAmount.toFixed(2)}`,
            status: profitLossAmount >= 0 ? 'OK' : 'WARN'
          });

          if (player.id === nextState.current_player_id) {
            nextState.active_event = {
              id: `event_close_${Date.now()}`,
              title: `🎯 ${closeReason} SUR ${pos.symbol} !`,
              description: `Votre ordre automatique a été exécuté avec succès au prix de $${closePrice.toLocaleString()}.`,
              type: 'WINDFALL' as any,
              severity: profitLossAmount >= 0 ? 'SUCCESS' : 'WARNING',
              impactText: `PnL Réalisé : ${profitLossAmount >= 0 ? '+' : ''}$${profitLossAmount.toLocaleString()}`
            };
          }
          return;
        }

        activePositions.push(pos);
      });
      player.active_positions = activePositions;
    }

    // --- Automatic Laundering Businesses ---
    const businesses = nextState.laundering_businesses[pid];
    if (businesses && businesses.length > 0 && player.cash_dirty > 0) {
      businesses.forEach(biz => {
        if (player.cash_dirty > 0) {
          const amountToLaunder = Math.min(player.cash_dirty, biz.capacity_per_tick);
          const taxFee = amountToLaunder * biz.fee_rate;
          const cleanReceived = amountToLaunder - taxFee;

          player.cash_dirty -= amountToLaunder;
          player.bank_clean += cleanReceived;
          biz.total_laundered += amountToLaunder;

          newLogs.push({
            id: `log_launder_${Date.now()}_${biz.id}`,
            timestamp: nowStr,
            type: 'LAUNDER',
            uid: player.id,
            message: `BLANCHIMENT (${biz.name}): ${amountToLaunder.toLocaleString()}$ Dirty -> ${cleanReceived.toLocaleString()}$ Clean (Frais: ${biz.fee_rate * 100}%)`,
            status: 'OK'
          });
        }
      });
    }
  });

  // --- MONTHLY TRANSITION (Every 100 ticks = 5 minutes) ---
  const isMonthTick = nextState.tick_count % 100 === 0;
  if (isMonthTick) {
    // 1. Restock Global Hardware Store with Dynamic Market Regulation (Supply & Demand Fluctuations)
    if (nextState.global_hardware_stock) {
      let outOfStockCount = 0;
      let shortageCount = 0;
      let standardCount = 0;
      let overstockCount = 0;

      Object.keys(nextState.global_hardware_stock).forEach(key => {
        const baseStock = INITIAL_STATE.global_hardware_stock[key] ?? 20;
        const roll = Math.random();

        if (roll < 0.15) {
          // 15% chance of severe out of stock
          nextState.global_hardware_stock![key] = 0;
          outOfStockCount++;
        } else if (roll < 0.35) {
          // 20% chance of critical shortage (1 to 3 items)
          nextState.global_hardware_stock![key] = Math.floor(Math.random() * 3) + 1;
          shortageCount++;
        } else if (roll < 0.80) {
          // 45% chance of standard optimal restock
          nextState.global_hardware_stock![key] = baseStock;
          standardCount++;
        } else {
          // 20% chance of massive overproduction (1.5x to 2x stock)
          const multiplier = 1.5 + (Math.random() * 0.5);
          nextState.global_hardware_stock![key] = Math.round(baseStock * multiplier);
          overstockCount++;
        }
      });

      newLogs.push({
        id: `log_restock_${Date.now()}`,
        timestamp: nowStr,
        type: 'MINING',
        message: `LOGISTIQUE MONDIALE (Régulation du marché) : Restockage mensuel effectué. Sur ${Object.keys(nextState.global_hardware_stock).length} modèles de puces, ${outOfStockCount} sont en rupture totale, ${shortageCount} en pénurie critique (1-3 u.), et ${overstockCount} en surproduction massive.`,
        status: outOfStockCount > shortageCount ? 'WARN' : 'OK'
      });
    }

    // 2. Process monthly rents & real estate property taxes (executed once per month)
    if (nextState.real_estate_agencies && nextState.real_estate_agencies.length > 0) {
      nextState.real_estate_agencies[0].managed_properties.forEach(prop => {
        // Rent payment
        if (prop.tenant_id && prop.owner_id && prop.tenant_id !== prop.owner_id) {
          const tenant = nextState.players[prop.tenant_id];
          const owner = nextState.players[prop.owner_id];
          
          if (tenant && owner) {
            const rent = prop.rent_monthly;
            tenant.bank_clean = Math.max(0, tenant.bank_clean - rent);
            owner.bank_clean += rent;
            
            const salt = Math.random().toString(36).substring(2, 6);
            newLogs.push({
              id: `log_rent_${Date.now()}_${prop.property_id}_${salt}`,
              timestamp: nowStr,
              type: 'DB_WRITE',
              uid: tenant.id,
              message: `LOYER IMMOBILIER : ${tenant.name} a payé un loyer de ${rent.toLocaleString()} à ${owner.name} pour '${prop.name}'`,
              status: 'OK'
            });
          }
        }

        // Property Tax (Taxe foncière, 1% of estimated value)
        if (prop.owner_id) {
          const owner = nextState.players[prop.owner_id];
          if (owner) {
            const propTax = Math.round(prop.estimated_value * 0.01);
            owner.bank_clean = Math.max(0, owner.bank_clean - propTax);
            
            const salt = Math.random().toString(36).substring(2, 6);
            newLogs.push({
              id: `log_proptax_${Date.now()}_${prop.property_id}_${salt}`,
              timestamp: nowStr,
              type: 'TAX_ISF',
              uid: owner.id,
              message: `FISCALITÉ IMMOBILIÈRE : Taxe foncière mensuelle (1%) payée par ${owner.name} pour '${prop.name}' : -${propTax.toLocaleString()}`,
              status: 'WARN'
            });
          }
        }
      });
    }

    // 3. Process ISF tax, shop taxes, street robberies, and ages for each player
    Object.keys(nextState.players).forEach(pid => {
      const player = nextState.players[pid];
      
      // Increment Account Age
      player.account_age_months = (player.account_age_months || 0) + 1;

      // Monthly ISF Tax (1% on wealth above threshold)
      const totalWealth = player.bank_clean + player.cash_dirty;
      if (totalWealth > nextState.server_config.isf_threshold) {
        const taxableAmount = totalWealth - nextState.server_config.isf_threshold;
        const isfTax = taxableAmount * 0.01; // 1% monthly ISF tax
        player.bank_clean = Math.max(0, player.bank_clean - isfTax);
        newLogs.push({
          id: `log_isf_monthly_${Date.now()}_${pid}`,
          timestamp: nowStr,
          type: 'TAX_ISF',
          uid: player.id,
          message: `FISCALITÉ MENSUELLE : Prélèvement ISF Virtuel (1% sur fortune excédentaire) sur le solde de ${player.name}: -${isfTax.toFixed(2)}$`,
          status: 'WARN'
        });
      }

      // Monthly Shop Taxes
      const playerShops = nextState.player_shops.filter(s => s.owner_id === player.id);
      playerShops.forEach(shop => {
        const taxes = shop.monthly_taxes_due;
        player.bank_clean = Math.max(0, player.bank_clean - taxes);
        newLogs.push({
          id: `log_shoptax_${Date.now()}_${shop.shop_id}`,
          timestamp: nowStr,
          type: 'TAX_ISF',
          uid: player.id,
          message: `FISCALITÉ BOUTIQUE : Taxes mensuelles payées par ${player.name} pour '${shop.name}': -${taxes.toLocaleString()}`,
          status: 'WARN'
        });
      });

      // Monthly Subscriptions Deductions
      if (!player.active_subscriptions) {
        player.active_subscriptions = [];
      }
      
      const subscriptionsPool = [
        { id: 'vpn_premium', name: 'VPN CyberShield', cost: 100 },
        { id: 'garde_du_corps', name: 'Garde du Corps Privé', cost: 500 },
        { id: 'green_electricity', name: 'Tarif Électricité Vert', cost: 250 }
      ];
      
      player.active_subscriptions.forEach(subId => {
        const sub = subscriptionsPool.find(s => s.id === subId);
        if (sub) {
          if (player.bank_clean >= sub.cost) {
            player.bank_clean -= sub.cost;
            newLogs.push({
              id: `log_sub_${Date.now()}_${sub.id}`,
              timestamp: nowStr,
              type: 'TAX_ISF',
              uid: player.id,
              message: `ABONNEMENT : Prélèvement mensuel pour '${sub.name}': -${sub.cost.toLocaleString()}`,
              status: 'INFO'
            });
          } else {
            // Cancel subscription due to lack of funds
            player.active_subscriptions = player.active_subscriptions!.filter(id => id !== subId);
            newLogs.push({
              id: `log_sub_cancel_${Date.now()}_${sub.id}`,
              timestamp: nowStr,
              type: 'TAX_ISF',
              uid: player.id,
              message: `ABONNEMENT SUSPENDU : Défaut de paiement pour '${sub.name}'. Solde propre insuffisant (${sub.cost} requis)`,
              status: 'WARN'
            });
          }
        }
      });

      // Street Robbery Random check (5% chance if holding more than $10,000 cash dirty)
      const hasBodyguard = player.active_subscriptions?.includes('garde_du_corps');
      if (player.cash_dirty > 10000 && Math.random() < 0.05 && !hasBodyguard) {
        const stolenPercent = 0.15 + Math.random() * 0.15;
        const lossAmount = Math.floor(player.cash_dirty * stolenPercent);
        player.cash_dirty -= lossAmount;

        newLogs.push({
          id: `log_robbery_${Date.now()}_${pid}`,
          timestamp: nowStr,
          type: 'TAX_ISF',
          uid: player.id,
          message: `SÉCURITÉ URBAINE : ${player.name} s'est fait détrousser dans la rue. Perte de -${lossAmount.toLocaleString()} de cash sale !`,
          status: 'ALERT'
        });

        if (player.id === nextState.current_player_id) {
          nextState.active_event = {
            id: `event_robbery_${Date.now()}`,
            title: "💥 AGRESSION DANS LA RUE !",
            description: "En marchant dans une zone non sécurisée avec une forte somme de liquide sur vous, vous avez été pris pour cible par des délinquants armés.",
            type: 'TAX_AUDIT',
            severity: 'CRITICAL',
            impactText: `Ils ont fouillé vos poches et volé -${lossAmount.toLocaleString()} de votre Cash Sale.`
          };
        }
      }

      // Monthly GPU Resale Market Check (chance of listed rigs to sell)
      const farm = nextState.mining_farms[player.id];
      if (farm && farm.rigs && farm.rigs.length > 0) {
        const soldRigIds: string[] = [];
        
        farm.rigs.forEach(rig => {
          if (rig.listed_for_sale && rig.sale_price) {
            // Find base hardware estimate based on hashrate
            const basePrice = rig.hashrate_th > 1000 ? rig.hashrate_th * 3 : rig.hashrate_th * 7;
            const wear = rig.wear_condition ?? 1.0;
            const estVal = Math.max(50, basePrice * wear * 0.8);
            const priceRatio = rig.sale_price / estVal;
            
            // Determine percentage chance to sell this monthly tick
            let sellChance = 0.0;
            if (priceRatio <= 0.6) sellChance = 0.45;
            else if (priceRatio <= 0.8) sellChance = 0.30;
            else if (priceRatio <= 1.0) sellChance = 0.15;
            else if (priceRatio <= 1.2) sellChance = 0.08;
            else if (priceRatio <= 1.5) sellChance = 0.03;
            else sellChance = 0.01;
            
            if (Math.random() < sellChance) {
              soldRigIds.push(rig.rig_id);
              player.bank_clean += rig.sale_price;
              
              const salt = Math.random().toString(36).substring(2, 6);
              newLogs.push({
                id: `log_gpu_sold_${Date.now()}_${rig.rig_id}_${salt}`,
                timestamp: nowStr,
                type: 'DB_WRITE',
                uid: player.id,
                message: `📦 VENTE D'OCCASION : Un acquéreur sur eBay a acheté votre '${rig.name}' d'occasion pour ${rig.sale_price.toLocaleString()} !`,
                status: 'OK'
              });
            }
          }
        });
        
        if (soldRigIds.length > 0) {
          farm.rigs = farm.rigs.filter(r => !soldRigIds.includes(r.rig_id));
        }
      }

      // --- NEW: Monthly Real Estate Appreciation & Listed Properties Auto-Sale ---
      if (nextState.real_estate_agencies && nextState.real_estate_agencies.length > 0) {
        const agency = nextState.real_estate_agencies[0];
        const propertiesToKeep: any[] = [];

        agency.managed_properties.forEach(prop => {
          if (prop.owner_id === player.id) {
            // 1. Months owned counter & Appreciation
            prop.months_owned = (prop.months_owned || 0) + 1;
            const upgLvl = (prop.upgrade_level || 1);
            // 1% to 2% base monthly appreciation + small bonus if highly upgraded
            const appreciationFactor = 1.01 + Math.random() * 0.01 + (upgLvl - 1) * 0.002;
            prop.estimated_value = Math.round(prop.estimated_value * appreciationFactor);

            // 2. Listing Sale Check
            if (prop.listed_for_sale && prop.sale_price) {
              const priceRatio = prop.sale_price / prop.estimated_value;
              let sellChance = 0.01;
              if (priceRatio <= 0.6) sellChance = 0.40;
              else if (priceRatio <= 0.8) sellChance = 0.25;
              else if (priceRatio <= 1.0) sellChance = 0.12;
              else if (priceRatio <= 1.2) sellChance = 0.06;
              else if (priceRatio <= 1.5) sellChance = 0.02;

              if (Math.random() < sellChance) {
                // SOLD!
                player.bank_clean += prop.sale_price;

                // Move active mining farm back to personal garage if this property was used
                const playerFarm = nextState.mining_farms[player.id];
                if (playerFarm && playerFarm.location_id === prop.property_id) {
                  playerFarm.location_id = 'default_garage';
                  playerFarm.location_name = 'Garage Personnel';
                  playerFarm.power_capacity_watts = 15000;
                  playerFarm.cooling_type = 'AIR';
                }

                newLogs.push({
                  id: `log_prop_sold_${Date.now()}_${prop.property_id}`,
                  timestamp: nowStr,
                  type: 'DB_WRITE',
                  uid: player.id,
                  message: `📦 TRANSACTION IMMOBILIÈRE : Votre propriété '${prop.name}' a été vendue sur le marché d'occasion pour ${prop.sale_price.toLocaleString()}$ propres !`,
                  status: 'OK'
                });
                return; // Exclude from propertiesToKeep
              }
            }
          }
          propertiesToKeep.push(prop);
        });

        agency.managed_properties = propertiesToKeep;
      }

      // --- NEW: Monthly Small Shops Appreciation & Listed Shops Auto-Sale ---
      if (player.shop_properties && player.shop_properties.length > 0) {
        const shopsToKeep: any[] = [];

        player.shop_properties.forEach(shop => {
          shop.months_owned = (shop.months_owned || 0) + 1;
          shop.estimated_value = shop.estimated_value || shop.buy_cost;
          const upgLvl = (shop.upgrade_level || 1);
          const appreciationFactor = 1.01 + Math.random() * 0.01 + (upgLvl - 1) * 0.002;
          shop.estimated_value = Math.round(shop.estimated_value * appreciationFactor);

          if (shop.listed_for_sale && shop.sale_price) {
            const priceRatio = shop.sale_price / shop.estimated_value;
            let sellChance = 0.01;
            if (priceRatio <= 0.6) sellChance = 0.40;
            else if (priceRatio <= 0.8) sellChance = 0.25;
            else if (priceRatio <= 1.0) sellChance = 0.12;
            else if (priceRatio <= 1.2) sellChance = 0.06;
            else if (priceRatio <= 1.5) sellChance = 0.02;

            if (Math.random() < sellChance) {
              player.bank_clean += shop.sale_price;

              newLogs.push({
                id: `log_shop_sold_${Date.now()}_${shop.id}`,
                timestamp: nowStr,
                type: 'DB_WRITE',
                uid: player.id,
                message: `📦 COMMERCE CÉDÉ : Votre boutique '${shop.name}' à ${shop.city} a été rachetée sur le marché secondaire pour ${shop.sale_price.toLocaleString()}$ propres !`,
                status: 'OK'
              });
              return; // Exclude from shopsToKeep
            }
          }
          shopsToKeep.push(shop);
        });

        player.shop_properties = shopsToKeep;
      }
    });

    newLogs.push({
      id: `log_month_tick_${Date.now()}`,
      timestamp: nowStr,
      type: 'TICK',
      message: `CYCLE MENSUEL COMPLETÉ : Rentrées locatives, taxes d'exploitation et ISF prélevés.`,
      status: 'OK'
    });
  }

  // --- NEW: Spontaneous Buyout Offers Generation & Ticker Expirations ---
  // A. Offer Expirations check (Runs on every single tick)
  Object.keys(nextState.players).forEach(pid => {
    const player = nextState.players[pid];
    
    // Check Real Estate Buyout offers expiration
    if (nextState.real_estate_agencies && nextState.real_estate_agencies.length > 0) {
      nextState.real_estate_agencies[0].managed_properties.forEach(prop => {
        if (prop.owner_id === player.id && prop.buyout_offer) {
          if (nextState.tick_count >= prop.buyout_offer.expires_tick) {
            newLogs.push({
              id: `log_prop_bo_expired_${Date.now()}_${prop.property_id}`,
              timestamp: nowStr,
              type: 'TICK',
              uid: player.id,
              message: `⏳ OFFRE EXPIRÉE : L'offre d'achat de ${prop.buyout_offer.offer_price.toLocaleString()}$ sur '${prop.name}' a expiré.`,
              status: 'INFO'
            });
            prop.buyout_offer = null;
          }
        }
      });
    }

    // Check Shops Buyout offers expiration
    if (player.shop_properties) {
      player.shop_properties.forEach(shop => {
        if (shop.buyout_offer) {
          if (nextState.tick_count >= shop.buyout_offer.expires_tick) {
            newLogs.push({
              id: `log_shop_bo_expired_${Date.now()}_${shop.id}`,
              timestamp: nowStr,
              type: 'TICK',
              uid: player.id,
              message: `⏳ OFFRE EXPIRÉE : L'offre d'achat de ${shop.buyout_offer.offer_price.toLocaleString()}$ sur votre commerce '${shop.name}' a expiré.`,
              status: 'INFO'
            });
            shop.buyout_offer = null;
          }
        }
      });
    }

    // Check Rigs Buyout offers expiration
    const playerFarm = nextState.mining_farms[player.id];
    if (playerFarm && playerFarm.rigs) {
      playerFarm.rigs.forEach(rig => {
        if (rig.buyout_offer) {
          if (nextState.tick_count >= rig.buyout_offer.expires_tick) {
            newLogs.push({
              id: `log_rig_bo_expired_${Date.now()}_${rig.rig_id}`,
              timestamp: nowStr,
              type: 'TICK',
              uid: player.id,
              message: `⏳ OFFRE EXPIRÉE : L'offre d'achat de ${rig.buyout_offer.offer_price.toLocaleString()}$ sur votre matériel '${rig.name}' a expiré.`,
              status: 'INFO'
            });
            rig.buyout_offer = null;
          }
        }
      });
    }
  });

  // B. Generates spontaneous buyout offers every 15 ticks with 20% chance per player
  if (nextState.tick_count % 15 === 0) {
    Object.keys(nextState.players).forEach(pid => {
      const player = nextState.players[pid];
      if (Math.random() < 0.20) {
        // Collect all assets
        const ownedProperties = nextState.real_estate_agencies && nextState.real_estate_agencies.length > 0
          ? nextState.real_estate_agencies[0].managed_properties.filter(p => p.owner_id === player.id)
          : [];
        const ownedShops = player.shop_properties || [];
        const playerFarm = nextState.mining_farms[player.id];
        const ownedRigs = playerFarm ? (playerFarm.rigs || []) : [];

        const totalAssets = ownedProperties.length + ownedShops.length + ownedRigs.length;
        if (totalAssets > 0) {
          const randIdx = Math.floor(Math.random() * totalAssets);
          if (randIdx < ownedProperties.length) {
            // Generate for a Real Estate Property
            const prop = ownedProperties[randIdx];
            if (!prop.buyout_offer) {
              const age = prop.months_owned || 0;
              const upg = prop.upgrade_level || 1;
              const multiplier = 1.15 + Math.random() * 0.25; // 15% to 40% premium
              const ageBonus = 1 + age * 0.005;
              const upgBonus = 1 + (upg - 1) * 0.08;
              const offerPrice = Math.round(prop.estimated_value * multiplier * ageBonus * upgBonus);

              prop.buyout_offer = {
                offer_price: offerPrice,
                expires_tick: nextState.tick_count + 60
              };

              newLogs.push({
                id: `log_prop_bo_new_${Date.now()}_${prop.property_id}`,
                timestamp: nowStr,
                type: 'TICK',
                uid: player.id,
                message: `📥 OFFRE REÇUE : Un investisseur immobilier vous propose d'acquérir '${prop.name}' pour ${offerPrice.toLocaleString()}$ ! Réponse requise sous 3 min.`,
                status: 'WARN'
              });
            }
          } else if (randIdx < ownedProperties.length + ownedShops.length) {
            // Generate for a Shop Property
            const shop = ownedShops[randIdx - ownedProperties.length];
            if (!shop.buyout_offer) {
              const age = shop.months_owned || 0;
              const upg = shop.upgrade_level || 1;
              const multiplier = 1.20 + Math.random() * 0.30; // 20% to 50% premium
              const ageBonus = 1 + age * 0.005;
              const upgBonus = 1 + (upg - 1) * 0.08;
              const baseVal = shop.estimated_value || shop.buy_cost;
              const offerPrice = Math.round(baseVal * multiplier * ageBonus * upgBonus);

              shop.buyout_offer = {
                offer_price: offerPrice,
                expires_tick: nextState.tick_count + 60
              };

              newLogs.push({
                id: `log_shop_bo_new_${Date.now()}_${shop.id}`,
                timestamp: nowStr,
                type: 'TICK',
                uid: player.id,
                message: `📥 OFFRE REÇUE : Un groupement commercial propose de racheter votre fonds '${shop.name}' à ${shop.city} pour ${offerPrice.toLocaleString()}$ !`,
                status: 'WARN'
              });
            }
          } else {
            // Generate for a Mining Rig
            const rig = ownedRigs[randIdx - ownedProperties.length - ownedShops.length];
            if (!rig.buyout_offer) {
              const basePrice = rig.hashrate_th > 1000 ? rig.hashrate_th * 3 : rig.hashrate_th * 7;
              const wear = rig.wear_condition ?? 1.0;
              const estVal = Math.max(50, basePrice * wear * 0.8);
              const offerPrice = Math.round(estVal * (1.10 + Math.random() * 0.25));

              rig.buyout_offer = {
                offer_price: offerPrice,
                expires_tick: nextState.tick_count + 60
              };

              newLogs.push({
                id: `log_rig_bo_new_${Date.now()}_${rig.rig_id}`,
                timestamp: nowStr,
                type: 'TICK',
                uid: player.id,
                message: `📥 OFFRE REÇUE : Un mineur indépendant propose de racheter votre matériel d'occasion '${rig.name}' pour ${offerPrice.toLocaleString()}$ !`,
                status: 'WARN'
              });
            }
          }
        }
      }
    });
  }

  // 3. Auction Expiration
  nextState.auction_items = nextState.auction_items.map(auc => {
    if (auc.expires_in_ticks > 0) {
      return { ...auc, expires_in_ticks: auc.expires_in_ticks - 1 };
    }
    return auc;
  });

  // 4. Random Server-side Events (2% chance per tick)
  // Only trigger if no active event is currently shown to avoid event stacking
  if (!nextState.active_event) {
    const isRareDonation = Math.random() < 0.0005; // 0.05% chance per tick (approx once per 2000 cycles)
    const isStandardEvent = Math.random() < 0.02;

    if (isRareDonation) {
      const activePlayer = nextState.players[nextState.current_player_id];
      if (activePlayer) {
        nextState.active_event = {
          id: `ev_donation_${Date.now()}`,
          title: "🎁 DONATION ANONYME EXCEPTIONNELLE !",
          description: "Un mécène anonyme, grand partisan du Web3, vient de vous envoyer une enveloppe de soutien financier après avoir analysé votre rig.",
          type: "WINDFALL" as any,
          severity: "SUCCESS" as any,
          impactText: "Votre compte bancaire propre vient d'être crédité de +$50,000 !"
        };
        activePlayer.bank_clean += 50000;
        
        // Unlock achievement
        if (!activePlayer.achievements) activePlayer.achievements = [];
        if (!activePlayer.achievements.includes('ach_donation_small')) {
          activePlayer.achievements.push('ach_donation_small');
        }

        newLogs.push({
          id: `log_ev_don_${Date.now()}`,
          timestamp: nowStr,
          type: 'DB_WRITE',
          uid: activePlayer.id,
          message: `ÉVÉNEMENT TRÈS RARE: Donation anonyme de $50,000 créditée chez ${activePlayer.name}. Succès Déverrouillé !`,
          status: 'OK'
        });
      }
    } else if (isStandardEvent) {
      const eventPool = [
        {
          id: `ev_tax_${Date.now()}`,
          title: "ALERTE : INSPECTION ENEDIS/OMNIGRID",
          description: "Une équipe technique d'enquêteurs circule actuellement pour vérifier les raccordements frauduleux et les compteurs pontés.",
          type: "TAX_AUDIT" as any,
          severity: "CRITICAL" as any,
          impactText: "Les joueurs piratant l'électricité ont 35% de risques d'être repérés et verbalisés à hauteur de $35,000 lors des prochains cycles."
        },
        {
          id: `ev_crash_${Date.now()}`,
          title: "PANIQUE SUR LES MARCHÉS CRYPTO !",
          description: "Des rumeurs de régulation drastique des banques centrales provoquent une panique et de fortes ventes sur le Bitcoin.",
          type: "MARKET_CRASH" as any,
          severity: "WARNING" as any,
          impactText: "La valeur du Bitcoin subit un ajustement temporaire. Soyez vigilants sur vos marges d'investissement !"
        },
        {
          id: `ev_gift_${Date.now()}`,
          title: "SUBVENTION ÉCOLOGIQUE DE L'ÉTAT",
          description: "La métropole d'Omni-City attribue une prime spéciale d'incitation écologique pour l'adoption d'équipements informatiques labellisés verts.",
          type: "WINDFALL" as any,
          severity: "SUCCESS" as any,
          impactText: "Félicitations! Vous recevez une subvention de +$15,000 sur votre compte bancaire propre pour récompenser vos efforts d'efficience énergétique."
        }
      ];

      const chosen = eventPool[Math.floor(Math.random() * eventPool.length)];
      nextState.active_event = chosen;

      const activePlayer = nextState.players[nextState.current_player_id];
      if (activePlayer) {
        if (chosen.title.includes("SUBVENTION")) {
          activePlayer.bank_clean += 15000;
          newLogs.push({
            id: `log_ev_sub_${Date.now()}`,
            timestamp: nowStr,
            type: 'DB_WRITE',
            uid: activePlayer.id,
            message: `ÉVÉNEMENT: Subvention écologique de $15,000 créditée sur le compte de ${activePlayer.name}`,
            status: 'OK'
          });
        }
      }
    }
  }

  // Add system tick log
  if (nextState.tick_count % 10 === 0) {
    newLogs.push({
      id: `log_tick_${Date.now()}`,
      timestamp: nowStr,
      type: 'TICK',
      message: `TICK DE JEU #${nextState.tick_count} - Moteur de simulation synchronisé`,
      status: 'OK'
    });
  }

  // Append new logs and limit total log history to 100 entries
  nextState.logs = [...newLogs, ...nextState.logs].slice(0, 100);

  saveGlobalState(nextState);
  return nextState;
}
