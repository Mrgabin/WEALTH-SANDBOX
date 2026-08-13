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
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
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

      farm.rigs.forEach(rig => {
        if (rig.wear_condition > 0.05) {
          const ocMult = rig.overclocked ? 1.25 : 1.0;
          const coolingBoost = (farm.cooling_type === 'LIQUID' && rig.hashrate_th > 0) ? 1.08 : 1.0;
          totalWatts += rig.watts_consumption * ocMult;
          totalHashrate += rig.hashrate_th * rig.wear_condition * ocMult * coolingBoost;
          
          // Wear condition degradation
          const degradation = (rig.overclocked ? 0.0001 : 0.00003) * (farm.cooling_type === 'LIQUID' ? 0.5 : 1.0);
          rig.wear_condition = Math.max(0, rig.wear_condition - degradation);
        }
      });

      const dailyKWh = (totalWatts / 1000) * 24;
      const electricityCost = player.electricity_meter_hacked 
        ? 0 
        : dailyKWh * nextState.server_config.electricity_kwh_rate;

      // Hacked meter risk check
      if (player.electricity_meter_hacked) {
        if (Math.random() < 0.03) { // 3% chance per tick
          const fine = 25000;
          player.bank_clean = Math.max(0, player.bank_clean - fine);
          newLogs.push({
            id: `log_audit_${Date.now()}_${pid}`,
            timestamp: nowStr,
            type: 'MINING',
            uid: player.id,
            message: `AUDIT SERVEUR: Piratage de compteur détecté chez ${player.name}! Amende infligée: ${fine.toLocaleString()}$`,
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
          if (pos.is_long && currentPrice <= pos.stop_loss) {
            shouldClose = true;
            closeReason = 'STOP LOSS ATTEINT';
            closePrice = pos.stop_loss;
          } else if (!pos.is_long && currentPrice >= pos.stop_loss) {
            shouldClose = true;
            closeReason = 'STOP LOSS ATTEINT';
            closePrice = pos.stop_loss;
          }
        }

        if (!shouldClose && pos.take_profit !== undefined) {
          if (pos.is_long && currentPrice >= pos.take_profit) {
            shouldClose = true;
            closeReason = 'TAKE PROFIT ATTEINT';
            closePrice = pos.take_profit;
          } else if (!pos.is_long && currentPrice <= pos.take_profit) {
            shouldClose = true;
            closeReason = 'TAKE PROFIT ATTEINT';
            closePrice = pos.take_profit;
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

    // 2. Process monthly rents (executed once per month, outside of the player loop)
    if (nextState.real_estate_agencies && nextState.real_estate_agencies.length > 0) {
      nextState.real_estate_agencies[0].managed_properties.forEach(prop => {
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
              message: `LOYER IMMOBILIER : ${tenant.name} a payé un loyer de $${rent.toLocaleString()} à ${owner.name} pour '${prop.name}'`,
              status: 'OK'
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
          message: `FISCALITÉ BOUTIQUE : Taxes mensuelles payées par ${player.name} pour '${shop.name}': -$${taxes.toLocaleString()}`,
          status: 'WARN'
        });
      });

      // Street Robbery Random check (5% chance if holding more than $10,000 cash dirty)
      if (player.cash_dirty > 10000 && Math.random() < 0.05) {
        const stolenPercent = 0.15 + Math.random() * 0.15;
        const lossAmount = Math.floor(player.cash_dirty * stolenPercent);
        player.cash_dirty -= lossAmount;

        newLogs.push({
          id: `log_robbery_${Date.now()}_${pid}`,
          timestamp: nowStr,
          type: 'TAX_ISF',
          uid: player.id,
          message: `SÉCURITÉ URBAINE : ${player.name} s'est fait détrousser dans la rue. Perte de -$${lossAmount.toLocaleString()} de cash sale !`,
          status: 'ALERT'
        });

        if (player.id === nextState.current_player_id) {
          nextState.active_event = {
            id: `event_robbery_${Date.now()}`,
            title: "💥 AGRESSION DANS LA RUE !",
            description: "En marchant dans une zone non sécurisée avec une forte somme de liquide sur vous, vous avez été pris pour cible par des délinquants armés.",
            type: 'TAX_AUDIT',
            severity: 'CRITICAL',
            impactText: `Ils ont fouillé vos poches et volé -$${lossAmount.toLocaleString()} de votre Cash Sale.`
          };
        }
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

  // 3. Auction Expiration
  nextState.auction_items = nextState.auction_items.map(auc => {
    if (auc.expires_in_ticks > 0) {
      return { ...auc, expires_in_ticks: auc.expires_in_ticks - 1 };
    }
    return auc;
  });

  // 4. Random Server-side Events (2% chance per tick)
  // Only trigger if no active event is currently shown to avoid event stacking
  if (!nextState.active_event && Math.random() < 0.02) {
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
        id: `ev_donation_${Date.now()}`,
        title: "DONATION ANONYME EXCEPTIONNELLE !",
        description: "Un donateur anonyme, fervent défenseur de la finance décentralisée, distribue des subventions de soutien aux pionniers du réseau.",
        type: "WINDFALL" as any,
        severity: "SUCCESS" as any,
        impactText: "Votre compte bancaire propre vient d'être crédité de +$50,000 sans aucune contrepartie."
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
      if (chosen.title.includes("DONATION")) {
        activePlayer.bank_clean += 50000;
        newLogs.push({
          id: `log_ev_don_${Date.now()}`,
          timestamp: nowStr,
          type: 'DB_WRITE',
          uid: activePlayer.id,
          message: `ÉVÉNEMENT: Donation anonyme de $50,000 créditée sur le compte de ${activePlayer.name}`,
          status: 'OK'
        });
      } else if (chosen.title.includes("SUBVENTION")) {
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
