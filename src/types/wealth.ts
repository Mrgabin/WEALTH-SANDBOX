export interface ServerConfig {
  tva_rate: number; // e.g. 0.05
  property_tax_rate: number; // e.g. 0.01 per month
  isf_threshold: number; // e.g. 1,000,000 $
  isf_rate: number; // 0.001 per tick
  electricity_kwh_rate: number; // $0.12 / kWh
  global_net_hashrate_th: number; // e.g. 5,000,000 TH/s
  btc_block_reward_24h: number; // e.g. 6.25 BTC
}

export interface TradingPosition {
  id: string;
  symbol: string;
  is_long: boolean;
  entry_price: number;
  margin: number;
  leverage: number;
  size: number;
  stop_loss?: number;
  take_profit?: number;
}

export interface ShopProperty {
  id: string;
  city: string; // e.g. "Paris Centre", "Mende (Lozère)", etc.
  type: 'EPICERIE' | 'BOULANGERIE' | 'BISTRO' | 'BOUTIQUE_MODE' | 'HIGH_TECH' | 'BIJOUTERIE';
  name: string;
  buy_cost: number;
  base_revenue: number;
  current_stock: number;
  max_stock: number;
  selected_supply_type: 'LOW_COST' | 'STANDARD' | 'PREMIUM';
  sell_price_multiplier: number; // e.g. 1.0 to 3.0
  com_campaign: 'NONE' | 'FLYERS' | 'SOCIAL_MEDIA' | 'TV';
  last_tick_revenue?: number;
  last_tick_profit?: number;
  upgrade_level?: number;
  months_owned?: number;
  estimated_value?: number;
  listed_for_sale?: boolean;
  sale_price?: number;
  buyout_offer?: { offer_price: number; expires_tick: number; } | null;
}

export interface PlayerProfile {
  id: string;
  name: string;
  email: string;
  password: string; // Plaintext in DB as explicitly required by prompt
  role: 'PLAYER' | 'ADMIN';
  cash_dirty: number;
  bank_clean: number;
  credit_score: number;
  licenses: string[];
  electricity_meter_hacked: boolean;
  meter_hacked_risk: number; // risk percentage of audit
  last_active: string;
  avatar_color?: string;
  possessions?: string[]; // Item codes or names owned by the player
  active_positions?: TradingPosition[];
  account_age_months?: number;
  cooling_inventory?: string[]; // Owned unassigned watercoolers (e.g. wc_arctic_lf3_240)
  active_subscriptions?: string[]; // Active subscriptions (e.g. ['vpn_premium'])
  shop_properties?: ShopProperty[]; // Owned small shops in France
  achievements?: string[]; // List of unlocked achievement IDs
}

export interface PlayerShopItem {
  id: string;
  item_code: string;
  name: string;
  type: 'GPU' | 'ASIC' | 'RIG_CASE' | 'CHIP' | 'LUXURY_WATCH' | 'SAFE_KEY' | 'VEHICLE' | 'WATERCOOLING';
  buy_cost: number;
  sell_price: number;
  stock: number;
  hashrate_th?: number;
  watts_consumption?: number;
  description?: string;
}

export interface PlayerShop {
  shop_id: string;
  owner_id: string;
  owner_name: string;
  name: string;
  inventory: PlayerShopItem[];
  monthly_taxes_due: number;
}

export interface ManagedProperty {
  property_id: string;
  name: string;
  type: 'GARAGE' | 'HANGAR' | 'APARTMENT' | 'DATA_CENTER' | string;
  owner_id: string;
  owner_name: string;
  tenant_id?: string;
  tenant_name?: string;
  rent_monthly: number;
  estimated_value: number;
  power_capacity_kw: number;
  upgrade_level?: number;
  months_owned?: number;
  listed_for_sale?: boolean;
  sale_price?: number;
  buyout_offer?: { offer_price: number; expires_tick: number; } | null;
  electrical_failure_type?: 'NONE' | 'OVERLOAD' | 'WIRING_FAULT' | 'TRANSFORMER_BLOWN';
  electrical_failure_details?: string;
  electrical_repair_cost?: number;
}

export interface RealEstateAgency {
  agency_id: string;
  owner_id: string;
  owner_name: string;
  name: string;
  commission_rate: number;
  managed_properties: ManagedProperty[];
}

export interface MiningRig {
  rig_id: string;
  name: string;
  type: 'GPU_RTX_4090' | 'ASIC_BITMAIN_S19' | 'CUSTOM_RIG_PRO' | 'WATERCOOLING' | string;
  bought_from_shop: string;
  hashrate_th: number;
  watts_consumption: number;
  wear_condition: number; // 0.0 - 1.0
  overclocked: boolean;
  assigned_cooler?: string; // ID of assigned cooler (e.g., wc_arctic_lf3_240)
  shelved?: boolean; // Set aside/remisée, doesn't consume power or produce hash
  // Component failures
  failure_type?: 'NONE' | 'VRAM' | 'PROCESSOR' | 'FAN';
  failure_details?: string; // e.g. "AD102 VRAM défectueuse. Pièce de rechange requise : VRAM_RTX_4090"
  required_spare_part_code?: string; // e.g. "VRAM_RTX_4090" or "PROC_RTX_4090"
  listed_for_sale?: boolean; // GPU is packed and listed for sale on resale market
  sale_price?: number; // Listed resale price
  buyout_offer?: { offer_price: number; expires_tick: number; } | null;
}

export interface MiningFarm {
  location_id: string;
  location_name: string;
  power_capacity_watts: number;
  cooling_type: 'AIR' | 'LIQUID';
  rigs: MiningRig[];
  power_upgrade_kw?: number; // Total purchased grid power upgrades in kW
  // Datacenter-specific failures
  datacenter_failure_type?: 'NONE' | 'SWITCH_FAILURE' | 'HVAC_FAILURE' | 'TRANSFORMER_BLOWN';
  datacenter_failure_details?: string;
}

export interface AuctionItem {
  id: string;
  seller_id: string;
  seller_name: string;
  title: string;
  description: string;
  current_bid: number;
  buyout_price: number;
  is_cash_only: boolean;
  highest_bidder_id?: string;
  highest_bidder_name?: string;
  expires_in_ticks: number;
  is_second_hand?: boolean; // true if used/occasion
  wear_condition?: number; // 0.0 - 1.0 condition remaining
}

export interface LoanRecord {
  id: string;
  lender_id: string;
  lender_name: string;
  borrower_id: string;
  borrower_name: string;
  amount: number;
  weekly_interest_rate: number;
  is_dirty: boolean;
  collateral: string;
  due_ticks_remaining: number;
}

export interface LaunderingBusiness {
  id: string;
  owner_id: string;
  name: string;
  type: 'NIGHTCLUB' | 'LAUNDROMAT' | 'REAL_ESTATE_FRONT';
  capacity_per_tick: number;
  fee_rate: number; // e.g. 0.20 (20%)
  total_laundered: number;
}

export interface StockMarketItem {
  symbol: string;
  name: string;
  price: number;
  change_percent: number;
  history: number[];
  category: 'CRYPTO' | 'STOCK' | 'BOND';
  yearly_yield?: number; // for server bonds
}

export interface ServerLog {
  id: string;
  timestamp: string;
  type: 'TICK' | 'USER_UPDT' | 'DB_WRITE' | 'AUTH_ERR' | 'TAX_ISF' | 'LAUNDER' | 'CASINO' | 'AUCTION' | 'MINING';
  uid?: string;
  message: string;
  status: 'OK' | 'ALERT' | 'INFO' | 'WARN';
}

export interface GameEventAlert {
  id: string;
  title: string;
  description: string;
  type: 'TAX_AUDIT' | 'DONATION' | 'BLACK_OUT' | 'MARKET_CRASH' | 'WINDFALL';
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  impactText: string;
}

export interface FullGlobalState {
  server_config: ServerConfig;
  current_player_id: string;
  players: Record<string, PlayerProfile>;
  player_shops: PlayerShop[];
  real_estate_agencies: RealEstateAgency[];
  mining_farms: Record<string, MiningFarm>; // key by player_id
  auction_items: AuctionItem[];
  loans: LoanRecord[];
  laundering_businesses: Record<string, LaunderingBusiness[]>; // key by player_id
  market_prices: StockMarketItem[];
  logs: ServerLog[];
  tick_count: number;
  is_tick_running: boolean;
  active_event?: GameEventAlert | null;
  global_hardware_stock?: Record<string, number>;
}
