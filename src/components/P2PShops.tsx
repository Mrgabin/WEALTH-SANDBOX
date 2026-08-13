import React, { useState } from 'react';
import { FullGlobalState, PlayerShopItem } from '../types/wealth';
import { ShoppingBag, Gavel, Gem, Check, Info, ShieldAlert } from 'lucide-react';

interface P2PShopsProps {
  state: FullGlobalState;
  onUpdateState: (newState: FullGlobalState) => void;
}

// Full array of ALL real-world GPUs & ASICs with realistic specs
const DETAILED_HARDWARE_ITEMS: PlayerShopItem[] = [
  // === PUCES MONSTRES D'IA & SUPERCALCULATEURS ===
  { id: 'gpu_gb200_nvl72', item_code: 'GPU_GB200_NVL72', name: 'NVIDIA GB200 NVL72 Rack (72x Blackwell)', type: 'GPU', buy_cost: 2800000.00, sell_price: 3000000.00, stock: 2, hashrate_th: 1440000, watts_consumption: 120000 },
  { id: 'gpu_b200', item_code: 'GPU_B200', name: 'NVIDIA B200 Blackwell 180GB HBM3e', type: 'GPU', buy_cost: 300000.00, sell_price: 350000.00, stock: 8, hashrate_th: 20000, watts_consumption: 850 },
  { id: 'gpu_mi300x', item_code: 'GPU_MI300X', name: 'AMD Instinct MI300X 192GB CDNA 3', type: 'GPU', buy_cost: 15000.00, sell_price: 18000.00, stock: 10, hashrate_th: 15000, watts_consumption: 750 },
  { id: 'gpu_h200', item_code: 'GPU_H200', name: 'NVIDIA H200 SXM Hopper 141GB HBM3e', type: 'GPU', buy_cost: 32000.00, sell_price: 35000.00, stock: 10, hashrate_th: 12000, watts_consumption: 700 },
  { id: 'gpu_h100', item_code: 'GPU_H100', name: 'NVIDIA H100 SXM Hopper 80GB HBM3', type: 'GPU', buy_cost: 25000.00, sell_price: 28000.00, stock: 12, hashrate_th: 9000, watts_consumption: 700 },

  // === CARTES STATION DE TRAVAIL PRO ===
  { id: 'gpu_rtx_6000_ada', item_code: 'GPU_RTX_6000_ADA', name: 'NVIDIA RTX 6000 Ada Generation 48GB', type: 'GPU', buy_cost: 6500.00, sell_price: 7200.00, stock: 15, hashrate_th: 2500, watts_consumption: 300 },
  { id: 'gpu_w7900', item_code: 'GPU_W7900', name: 'AMD Radeon PRO W7900 48GB ECC', type: 'GPU', buy_cost: 3500.00, sell_price: 4000.00, stock: 15, hashrate_th: 1800, watts_consumption: 295 },
  { id: 'gpu_rtx_a6000', item_code: 'GPU_RTX_A6000', name: 'NVIDIA RTX A6000 48GB (Ampere PRO)', type: 'GPU', buy_cost: 4000.00, sell_price: 4500.00, stock: 15, hashrate_th: 1500, watts_consumption: 300 },
  { id: 'gpu_rtx_8000', item_code: 'GPU_RTX_8000', name: 'Quadro RTX 8000 48GB (Turing PRO)', type: 'GPU', buy_cost: 2500.00, sell_price: 3000.00, stock: 15, hashrate_th: 1000, watts_consumption: 260 },

  // === GAMME NVIDIA RTX BLACKWELL (SÉRIE 5000) ===
  { id: 'gpu_rtx_5090', item_code: 'GPU_RTX_5090', name: 'NVIDIA GeForce RTX 5090 32GB GDDR7', type: 'GPU', buy_cost: 1800.00, sell_price: 2199.00, stock: 20, hashrate_th: 310, watts_consumption: 575 },
  { id: 'gpu_rtx_5080', item_code: 'GPU_RTX_5080', name: 'NVIDIA GeForce RTX 5080 16GB GDDR7', type: 'GPU', buy_cost: 850.00, sell_price: 1090.00, stock: 25, hashrate_th: 180, watts_consumption: 360 },
  { id: 'gpu_rtx_5070ti', item_code: 'GPU_RTX_5070TI', name: 'NVIDIA GeForce RTX 5070 Ti 16GB GDDR7', type: 'GPU', buy_cost: 650.00, sell_price: 790.00, stock: 30, hashrate_th: 135, watts_consumption: 300 },
  { id: 'gpu_rtx_5070', item_code: 'GPU_RTX_5070', name: 'NVIDIA GeForce RTX 5070 12GB GDDR7', type: 'GPU', buy_cost: 500.00, sell_price: 620.00, stock: 30, hashrate_th: 110, watts_consumption: 250 },
  { id: 'gpu_rtx_5060ti', item_code: 'GPU_RTX_5060TI', name: 'NVIDIA GeForce RTX 5060 Ti 16GB GDDR7', type: 'GPU', buy_cost: 380.00, sell_price: 470.00, stock: 35, hashrate_th: 78, watts_consumption: 180 },
  { id: 'gpu_rtx_5060', item_code: 'GPU_RTX_5060', name: 'NVIDIA GeForce RTX 5060 8GB GDDR7', type: 'GPU', buy_cost: 300.00, sell_price: 370.00, stock: 40, hashrate_th: 65, watts_consumption: 140 },

  // === GAMME NVIDIA RTX ADA LOVELACE (SÉRIE 4000) ===
  { id: 'gpu_rtx_4090', item_code: 'GPU_RTX_4090', name: 'NVIDIA GeForce RTX 4090 24GB GDDR6X', type: 'GPU', buy_cost: 1600.00, sell_price: 1950.00, stock: 20, hashrate_th: 175, watts_consumption: 450 },
  { id: 'gpu_rtx_4090d', item_code: 'GPU_RTX_4090D', name: 'NVIDIA GeForce RTX 4090 D 24GB (China)', type: 'GPU', buy_cost: 1300.00, sell_price: 1590.00, stock: 20, hashrate_th: 150, watts_consumption: 425 },
  { id: 'gpu_rtx_4080s', item_code: 'GPU_RTX_4080S', name: 'NVIDIA GeForce RTX 4080 Super 16GB', type: 'GPU', buy_cost: 1000.00, sell_price: 1250.00, stock: 20, hashrate_th: 120, watts_consumption: 320 },
  { id: 'gpu_rtx_4070tis', item_code: 'GPU_RTX_4070TIS', name: 'NVIDIA GeForce RTX 4070 Ti Super 16GB', type: 'GPU', buy_cost: 750.00, sell_price: 900.00, stock: 20, hashrate_th: 96, watts_consumption: 285 },
  { id: 'gpu_rtx_4070ti', item_code: 'GPU_RTX_4070TI', name: 'NVIDIA GeForce RTX 4070 Ti 12GB GDDR6X', type: 'GPU', buy_cost: 650.00, sell_price: 790.00, stock: 25, hashrate_th: 90, watts_consumption: 285 },
  { id: 'gpu_rtx_4070s', item_code: 'GPU_RTX_4070S', name: 'NVIDIA GeForce RTX 4070 Super 12GB', type: 'GPU', buy_cost: 520.00, sell_price: 640.00, stock: 25, hashrate_th: 82, watts_consumption: 220 },
  { id: 'gpu_rtx_4070', item_code: 'GPU_RTX_4070', name: 'NVIDIA GeForce RTX 4070 12GB GDDR6X', type: 'GPU', buy_cost: 480.00, sell_price: 590.00, stock: 25, hashrate_th: 74, watts_consumption: 200 },
  { id: 'gpu_rtx_4060ti_16g', item_code: 'GPU_RTX_4060TI_16G', name: 'NVIDIA GeForce RTX 4060 Ti 16GB', type: 'GPU', buy_cost: 380.00, sell_price: 460.00, stock: 30, hashrate_th: 58, watts_consumption: 165 },
  { id: 'gpu_rtx_4060ti_8g', item_code: 'GPU_RTX_4060TI_8G', name: 'NVIDIA GeForce RTX 4060 Ti 8GB', type: 'GPU', buy_cost: 320.00, sell_price: 390.00, stock: 30, hashrate_th: 52, watts_consumption: 160 },
  { id: 'gpu_rtx_4060', item_code: 'GPU_RTX_4060', name: 'NVIDIA GeForce RTX 4060 8GB GDDR6', type: 'GPU', buy_cost: 250.00, sell_price: 310.00, stock: 30, hashrate_th: 45, watts_consumption: 115 },

  // === GAMME NVIDIA RTX AMPERE (SÉRIE 3000) ===
  { id: 'gpu_rtx_3090ti', item_code: 'GPU_RTX_3090TI', name: 'NVIDIA GeForce RTX 3090 Ti 24GB', type: 'GPU', buy_cost: 1100.00, sell_price: 1390.00, stock: 20, hashrate_th: 115, watts_consumption: 450 },
  { id: 'gpu_rtx_3090', item_code: 'GPU_RTX_3090', name: 'NVIDIA GeForce RTX 3090 24GB GDDR6X', type: 'GPU', buy_cost: 900.00, sell_price: 1150.00, stock: 20, hashrate_th: 105, watts_consumption: 350 },
  { id: 'gpu_rtx_3080ti', item_code: 'GPU_RTX_3080TI', name: 'NVIDIA GeForce RTX 3080 Ti 12GB', type: 'GPU', buy_cost: 700.00, sell_price: 880.00, stock: 25, hashrate_th: 95, watts_consumption: 350 },
  { id: 'gpu_rtx_3080_12g', item_code: 'GPU_RTX_3080_12G', name: 'NVIDIA GeForce RTX 3080 12GB GDDR6X', type: 'GPU', buy_cost: 600.00, sell_price: 750.00, stock: 25, hashrate_th: 88, watts_consumption: 350 },
  { id: 'gpu_rtx_3080_10g', item_code: 'GPU_RTX_3080_10G', name: 'NVIDIA GeForce RTX 3080 10GB GDDR6X', type: 'GPU', buy_cost: 550.00, sell_price: 680.00, stock: 25, hashrate_th: 82, watts_consumption: 320 },
  { id: 'gpu_rtx_3070ti', item_code: 'GPU_RTX_3070TI', name: 'NVIDIA GeForce RTX 3070 Ti 8GB GDDR6X', type: 'GPU', buy_cost: 400.00, sell_price: 500.00, stock: 30, hashrate_th: 64, watts_consumption: 290 },
  { id: 'gpu_rtx_3070', item_code: 'GPU_RTX_3070', name: 'NVIDIA GeForce RTX 3070 8GB GDDR6', type: 'GPU', buy_cost: 350.00, sell_price: 440.00, stock: 30, hashrate_th: 58, watts_consumption: 220 },
  { id: 'gpu_rtx_3060ti', item_code: 'GPU_RTX_3060TI', name: 'NVIDIA GeForce RTX 3060 Ti 8GB', type: 'GPU', buy_cost: 280.00, sell_price: 360.00, stock: 35, hashrate_th: 48, watts_consumption: 200 },
  { id: 'gpu_rtx_3060_12g', item_code: 'GPU_RTX_3060_12G', name: 'NVIDIA GeForce RTX 3060 12GB GDDR6', type: 'GPU', buy_cost: 240.00, sell_price: 310.00, stock: 40, hashrate_th: 40, watts_consumption: 170 },
  { id: 'gpu_rtx_3060_8g', item_code: 'GPU_RTX_3060_8G', name: 'NVIDIA GeForce RTX 3060 8GB GDDR6', type: 'GPU', buy_cost: 200.00, sell_price: 260.00, stock: 40, hashrate_th: 35, watts_consumption: 170 },
  { id: 'gpu_rtx_3050_8g', item_code: 'GPU_RTX_3050_8G', name: 'NVIDIA GeForce RTX 3050 8GB GDDR6', type: 'GPU', buy_cost: 160.00, sell_price: 210.00, stock: 45, hashrate_th: 26, watts_consumption: 130 },
  { id: 'gpu_rtx_3050_6g', item_code: 'GPU_RTX_3050_6G', name: 'NVIDIA GeForce RTX 3050 6GB GDDR6', type: 'GPU', buy_cost: 120.00, sell_price: 160.00, stock: 50, hashrate_th: 22, watts_consumption: 70 },

  // === GAMME NVIDIA RTX TURING (SÉRIE 2000) ===
  { id: 'gpu_titan_rtx', item_code: 'GPU_TITAN_RTX', name: 'NVIDIA TITAN RTX 24GB GDDR6 (The T-Rex)', type: 'GPU', buy_cost: 1200.00, sell_price: 1490.00, stock: 10, hashrate_th: 80, watts_consumption: 280 },
  { id: 'gpu_rtx_2080ti', item_code: 'GPU_RTX_2080TI', name: 'NVIDIA GeForce RTX 2080 Ti 11GB GDDR6', type: 'GPU', buy_cost: 600.00, sell_price: 750.00, stock: 15, hashrate_th: 65, watts_consumption: 250 },
  { id: 'gpu_rtx_2080s', item_code: 'GPU_RTX_2080S', name: 'NVIDIA GeForce RTX 2080 Super 8GB GDDR6', type: 'GPU', buy_cost: 450.00, sell_price: 550.00, stock: 20, hashrate_th: 55, watts_consumption: 250 },
  { id: 'gpu_rtx_2080', item_code: 'GPU_RTX_2080', name: 'NVIDIA GeForce RTX 2080 8GB GDDR6', type: 'GPU', buy_cost: 400.00, sell_price: 490.00, stock: 20, hashrate_th: 50, watts_consumption: 215 },
  { id: 'gpu_rtx_2070s', item_code: 'GPU_RTX_2070S', name: 'NVIDIA GeForce RTX 2070 Super 8GB GDDR6', type: 'GPU', buy_cost: 320.00, sell_price: 400.00, stock: 25, hashrate_th: 45, watts_consumption: 215 },
  { id: 'gpu_rtx_2070', item_code: 'GPU_RTX_2070', name: 'NVIDIA GeForce RTX 2070 8GB GDDR6', type: 'GPU', buy_cost: 280.00, sell_price: 350.00, stock: 25, hashrate_th: 42, watts_consumption: 175 },
  { id: 'gpu_rtx_2060s', item_code: 'GPU_RTX_2060S', name: 'NVIDIA GeForce RTX 2060 Super 8GB GDDR6', type: 'GPU', buy_cost: 240.00, sell_price: 300.00, stock: 30, hashrate_th: 38, watts_consumption: 175 },
  { id: 'gpu_rtx_2060_12g', item_code: 'GPU_RTX_2060_12G', name: 'NVIDIA GeForce RTX 2060 12GB GDDR6', type: 'GPU', buy_cost: 190.00, sell_price: 250.00, stock: 30, hashrate_th: 33, watts_consumption: 184 },
  { id: 'gpu_rtx_2060_6g', item_code: 'GPU_RTX_2060_6G', name: 'NVIDIA GeForce RTX 2060 6GB GDDR6', type: 'GPU', buy_cost: 160.00, sell_price: 220.00, stock: 30, hashrate_th: 30, watts_consumption: 160 },

  // === DIVERS FLAGSHIPS & ASICs ===
  { id: 'gpu_rx_7900xtx', item_code: 'GPU_RX_7900XTX', name: 'AMD Radeon RX 7900 XTX 24GB', type: 'GPU', buy_cost: 900.00, sell_price: 1050.00, stock: 20, hashrate_th: 140, watts_consumption: 355 },
  { id: 'gpu_rx_6900xt', item_code: 'GPU_RX_6900XT', name: 'AMD Radeon RX 6900 XT 16GB', type: 'GPU', buy_cost: 500.00, sell_price: 650.00, stock: 15, hashrate_th: 60, watts_consumption: 300 },
  { id: 'asic_s21_hyd', item_code: 'ASIC_S21_HYD', name: 'Bitmain Antminer S21 Hyd (Hydro-Cooling)', type: 'ASIC', buy_cost: 5200.00, sell_price: 6500.00, stock: 5, hashrate_th: 3350, watts_consumption: 5360 },
  { id: 'asic_s19_xp', item_code: 'ASIC_S19_XP', name: 'Bitmain Antminer S19 XP', type: 'ASIC', buy_cost: 3000.00, sell_price: 3800.00, stock: 5, hashrate_th: 1410, watts_consumption: 3030 },
  { id: 'asic_m50s', item_code: 'ASIC_M50S', name: 'MicroBT Whatsminer M50S++', type: 'ASIC', buy_cost: 3300.00, sell_price: 4200.00, stock: 5, hashrate_th: 1520, watts_consumption: 3420 },
  { id: 'asic_k9', item_code: 'ASIC_K9', name: 'Bitmain Antminer K9 (LTC/DOGE)', type: 'ASIC', buy_cost: 4500.00, sell_price: 5500.00, stock: 5, hashrate_th: 2200, watts_consumption: 3250 },

  // === WATERCOOLINGS AIO (TOUT-EN-UN) ===
  { id: 'wc_arctic_lf3_240', item_code: 'WC_ARCTIC_LF3_240', name: 'ARCTIC Liquid Freezer III 240 (Pro AIO)', type: 'WATERCOOLING', buy_cost: 90.00, sell_price: 110.00, stock: 15 },
  { id: 'wc_arctic_lf3_280', item_code: 'WC_ARCTIC_LF3_280', name: 'ARCTIC Liquid Freezer III 280 (Pro AIO)', type: 'WATERCOOLING', buy_cost: 110.00, sell_price: 130.00, stock: 15 },
  { id: 'wc_arctic_lf3_360', item_code: 'WC_ARCTIC_LF3_360', name: 'ARCTIC Liquid Freezer III 360 (Pro AIO)', type: 'WATERCOOLING', buy_cost: 130.00, sell_price: 150.00, stock: 15 },
  { id: 'wc_thermalright_fe', item_code: 'WC_THERMALRIGHT_FE', name: 'Thermalright Frozen Edge 360', type: 'WATERCOOLING', buy_cost: 70.00, sell_price: 90.00, stock: 20 },
  { id: 'wc_thermalright_fn', item_code: 'WC_THERMALRIGHT_FN', name: 'Thermalright Frozen Notte 360 ARGB', type: 'WATERCOOLING', buy_cost: 80.00, sell_price: 100.00, stock: 20 },
  { id: 'wc_thermalright_gv', item_code: 'WC_THERMALRIGHT_GV', name: 'Thermalright Grand Vision 360', type: 'WATERCOOLING', buy_cost: 95.00, sell_price: 120.00, stock: 20 },
  { id: 'wc_msi_a13', item_code: 'WC_MSI_A13', name: 'MSI MAG CoreLiquid A13', type: 'WATERCOOLING', buy_cost: 120.00, sell_price: 145.00, stock: 15 },
  { id: 'wc_cm_atmos', item_code: 'WC_CM_ATMOS', name: 'Cooler Master MasterLiquid Atmos 360', type: 'WATERCOOLING', buy_cost: 140.00, sell_price: 175.00, stock: 15 },
  { id: 'wc_cm_atmos_stealth', item_code: 'WC_CM_ATMOS_STEALTH', name: 'Cooler Master MasterLiquid Atmos Stealth', type: 'WATERCOOLING', buy_cost: 150.00, sell_price: 185.00, stock: 15 },
  { id: 'wc_nzxt_kraken_elite_240', item_code: 'WC_NZXT_KRAKEN_ELITE_240', name: 'NZXT Kraken Elite 240 (Écran LCD • Premium)', type: 'WATERCOOLING', buy_cost: 220.00, sell_price: 260.00, stock: 10 },
  { id: 'wc_nzxt_kraken_elite_280', item_code: 'WC_NZXT_KRAKEN_ELITE_280', name: 'NZXT Kraken Elite 280 (Écran LCD • Premium)', type: 'WATERCOOLING', buy_cost: 240.00, sell_price: 285.00, stock: 10 },
  { id: 'wc_nzxt_kraken_elite_360', item_code: 'WC_NZXT_KRAKEN_ELITE_360', name: 'NZXT Kraken Elite 360 (Écran LCD • Premium)', type: 'WATERCOOLING', buy_cost: 260.00, sell_price: 310.00, stock: 10 },
  { id: 'wc_corsair_titan_rx', item_code: 'WC_CORSAIR_TITAN_RX', name: 'Corsair iCUE LINK Titan 360 RX', type: 'WATERCOOLING', buy_cost: 180.00, sell_price: 220.00, stock: 12 },
  { id: 'wc_corsair_titan_rx_lcd', item_code: 'WC_CORSAIR_TITAN_RX_LCD', name: 'Corsair iCUE LINK Titan RX LCD', type: 'WATERCOOLING', buy_cost: 270.00, sell_price: 320.00, stock: 10 },
  { id: 'wc_asus_ryujin_3', item_code: 'WC_ASUS_RYUJIN_3', name: 'ASUS ROG Ryujin III 360 (Écran LCD)', type: 'WATERCOOLING', buy_cost: 320.00, sell_price: 390.00, stock: 8 },
  { id: 'wc_asus_ryuo_4', item_code: 'WC_ASUS_RYUO_4', name: 'ASUS ROG Ryuo IV 360 ARGB', type: 'WATERCOOLING', buy_cost: 240.00, sell_price: 290.00, stock: 10 },
  { id: 'wc_lianli_galahad_2_lcd', item_code: 'WC_LIANLI_GALAHAD_2_LCD', name: 'Lian Li Galahad II 360 LCD', type: 'WATERCOOLING', buy_cost: 250.00, sell_price: 295.00, stock: 12 },
  { id: 'wc_lianli_hydroshift', item_code: 'WC_LIANLI_HYDROSHIFT', name: 'Lian Li HydroShift LCD 360S', type: 'WATERCOOLING', buy_cost: 240.00, sell_price: 280.00, stock: 12 },
  { id: 'wc_tryx_panorama_360', item_code: 'WC_TRYX_PANORAMA_360', name: 'TRYX PANORAMA 360 ARGB Curved LCD', type: 'WATERCOOLING', buy_cost: 340.00, sell_price: 410.00, stock: 6 },
  { id: 'wc_bequiet_pure_loop_3', item_code: 'WC_BEQUIET_PURE_LOOP_3', name: 'be quiet! Pure Loop 3 360 (Épuré)', type: 'WATERCOOLING', buy_cost: 110.00, sell_price: 135.00, stock: 15 },
  { id: 'wc_bequiet_silent_loop_2', item_code: 'WC_BEQUIET_SILENT_LOOP_2', name: 'be quiet! Silent Loop 2 360 (Pro)', type: 'WATERCOOLING', buy_cost: 140.00, sell_price: 170.00, stock: 15 },
  { id: 'wc_bequiet_light_loop', item_code: 'WC_BEQUIET_LIGHT_LOOP', name: 'be quiet! Light Loop 360 ARGB', type: 'WATERCOOLING', buy_cost: 150.00, sell_price: 180.00, stock: 15 },
  { id: 'wc_corsair_nautilus_360', item_code: 'WC_CORSAIR_NAUTILUS_360', name: 'Corsair Nautilus 360 RS (Épuré/Sobre)', type: 'WATERCOOLING', buy_cost: 100.00, sell_price: 120.00, stock: 20 },

  // === WATERCOOLINGS CUSTOM (SUR MESURE) ===
  { id: 'wc_custom_ekwb', item_code: 'WC_CUSTOM_EKWB', name: 'EKWB Premium Custom Loop Complete Pack', type: 'WATERCOOLING', buy_cost: 650.00, sell_price: 790.00, stock: 8 },
  { id: 'wc_custom_corsair_hydro_x', item_code: 'WC_CUSTOM_CORSAIR_HYDRO_X', name: 'Corsair Hydro X Series iCUE Custom Loop', type: 'WATERCOOLING', buy_cost: 580.00, sell_price: 690.00, stock: 10 },
  { id: 'wc_custom_alphacool', item_code: 'WC_CUSTOM_ALPHACOOL', name: 'Alphacool NexXxoS Copper Radiator & Reservoir Kit', type: 'WATERCOOLING', buy_cost: 480.00, sell_price: 570.00, stock: 10 },
  { id: 'wc_custom_bitspower', item_code: 'WC_CUSTOM_BITSPOWER', name: 'Bitspower Premium Hardline Fittings & Block Pack', type: 'WATERCOOLING', buy_cost: 350.00, sell_price: 420.00, stock: 12 },
  { id: 'wc_custom_barrow_bykski', item_code: 'WC_CUSTOM_BARROW_BYKSKI', name: 'Barrow & Bykski Affordable Custom Loop', type: 'WATERCOOLING', buy_cost: 280.00, sell_price: 340.00, stock: 15 }
];

// Luxury prestige items matching "loisirs et objets qui ne servent à rien aux achats tomber beaucoup plus dans mes 150 (montres, avions, voitures)"
interface LuxuryItem {
  id: string;
  name: string;
  category: 'WATCH' | 'CAR' | 'JET' | 'YACHT' | 'ESTATE' | 'JEWELRY';
  price: number;
  description: string;
  prestigePoints: number;
}

const LUXURY_PRESTIGE_MARKETPLACE: LuxuryItem[] = [
  { id: 'lux_richard_mille', name: 'Richard Mille RM 035 Rafael Nadal (Horlogerie)', category: 'WATCH', price: 150000, description: 'Montre squelette ultra-légère conçue pour le tennis professionnel. Totalement inutile, symbole de statut ultime.', prestigePoints: 1500 },
  { id: 'lux_ap_double_balance', name: 'Audemars Piguet Royal Oak Double Balancier', category: 'WATCH', price: 150000, description: 'Or rose 18 carats avec double balancier squelette. Indique l\'heure avec prestige.', prestigePoints: 1200 },
  { id: 'lux_porsche_turbo', name: 'Porsche 911 Turbo S (Sportcar)', category: 'CAR', price: 150000, description: 'Moteur Flat-6 biturbo de 650 chevaux. Le monstre polyvalent d\'exception.', prestigePoints: 1100 },
  { id: 'lux_aston_vantage', name: 'Aston Martin Vantage V12 Roadster', category: 'CAR', price: 150000, description: 'Cabriolet britannique de luxe à moteur V12 symphonique de 700 chevaux.', prestigePoints: 1150 },
  { id: 'lux_cirrus_jet_share', name: 'Copropriété Cirrus Vision Jet SF50 (Aviation)', category: 'JET', price: 150000, description: 'Quote-part d\'utilisation exclusive de 150 heures par an sur jet privé monomoteur.', prestigePoints: 2500 },
  { id: 'lux_bell_helicopter_share', name: 'Quote-part Bell 505 Jet Ranger (Aviation)', category: 'JET', price: 150000, description: 'Part d\'hélicoptère de luxe pour vos déplacements rapides et sans embouteillage.', prestigePoints: 2400 },
  { id: 'lux_rolex', name: 'Rolex Daytona Gold Edition', category: 'WATCH', price: 31000, description: 'Chronomographe légendaire en or jaune 18ct, cadran noir brillant.', prestigePoints: 150 },
  { id: 'lux_ferrari', name: 'Ferrari SF90 Stradale', category: 'CAR', price: 550000, description: 'Supercar hybride de 1000 chevaux, 0-100 km/h en 2.5 secondes.', prestigePoints: 1200 },
  { id: 'lux_bugatti', name: 'Bugatti Chiron Super Sport', category: 'CAR', price: 3820000, description: 'Moteur W16 quadriturbo de 1600 chevaux. Vitesse max de 440 km/h.', prestigePoints: 9500 },
  { id: 'lux_gulfstream', name: 'Gulfstream G650 Jet Privé', category: 'JET', price: 65000000, description: 'Le summum de l\'aviation privée d\'affaires. Portée transcontinentale.', prestigePoints: 150000 },
  { id: 'lux_yacht', name: 'Yacht Benetti Oasis 40M', category: 'YACHT', price: 22000000, description: 'Superyacht de 40 mètres avec piscine à débordement et plage arrière.', prestigePoints: 48000 },

  // === COLLECTION ROLEX OFFICIELLE (MSRP) ===
  // Submariner
  { id: 'rol_sub_no_date', name: 'Rolex Submariner (41 mm, Acier)', category: 'WATCH', price: 9800, description: 'L\'icône de plongée sans date. Référence épurée en acier Oystersteel.', prestigePoints: 98 },
  { id: 'rol_sub_date_kermit', name: 'Rolex Submariner Date Starbucks (Lunette verte)', category: 'WATCH', price: 11550, description: 'Submariner Date avec lunette tournante Cerachrom verte et cadran noir.', prestigePoints: 115 },
  { id: 'rol_sub_date_rolesor', name: 'Rolex Submariner Date Rolesor (Acier & Or)', category: 'WATCH', price: 18400, description: 'Alliance légendaire de l\'acier Oystersteel et de l\'or jaune 18 ct.', prestigePoints: 184 },
  { id: 'rol_sub_date_or_massif', name: 'Rolex Submariner Date (Or jaune massif)', category: 'WATCH', price: 47100, description: 'Modèle d\'exception en or jaune 18 ct massif avec cadran bleu royal.', prestigePoints: 470 },
  { id: 'rol_sub_date_or_gris', name: 'Rolex Submariner Date (Or gris massif)', category: 'WATCH', price: 50800, description: 'Montre de prestige ultime en or gris 18 ct avec lunette bleue.', prestigePoints: 510 },

  // Cosmograph Daytona
  { id: 'rol_daytona_acier', name: 'Rolex Cosmograph Daytona Acier', category: 'WATCH', price: 16350, description: 'Chronomographe iconique très convoité en acier, cadran blanc Panda.', prestigePoints: 165 },
  { id: 'rol_daytona_rolesor', name: 'Rolex Cosmograph Daytona Rolesor', category: 'WATCH', price: 23300, description: 'Daytona bicolore en acier Oystersteel et or jaune, cadran noir brillant.', prestigePoints: 235 },
  { id: 'rol_daytona_oysterflex', name: 'Rolex Cosmograph Daytona (Oysterflex)', category: 'WATCH', price: 39550, description: 'Or Everose 18 ct sur bracelet élastomère Oysterflex haute performance.', prestigePoints: 400 },
  { id: 'rol_daytona_or_massif', name: 'Rolex Cosmograph Daytona (Or Everose)', category: 'WATCH', price: 56750, description: 'Chronomographe légendaire en or Everose 18 ct massif avec bracelet en or.', prestigePoints: 570 },
  { id: 'rol_daytona_platine', name: 'Rolex Cosmograph Daytona Platine', category: 'WATCH', price: 82100, description: 'Le summum de la gamme Daytona en Platine 950 avec cadran bleu glacier.', prestigePoints: 820 },

  // GMT-Master II
  { id: 'rol_gmt_pepsi', name: 'Rolex GMT-Master II Pepsi (Acier)', category: 'WATCH', price: 11100, description: 'Lunette bicolore rouge et bleue Cerachrom sur bracelet Jubilé.', prestigePoints: 110 },
  { id: 'rol_gmt_batman', name: 'Rolex GMT-Master II Batman (Acier)', category: 'WATCH', price: 11300, description: 'Lunette bicolore bleue et noire Cerachrom sur bracelet Oyster.', prestigePoints: 113 },
  { id: 'rol_gmt_rolesor', name: 'Rolex GMT-Master II Rolesor (Or Everose)', category: 'WATCH', price: 17500, description: 'Le GMT mythique bicolore en acier et or Everose 18 ct.', prestigePoints: 175 },
  { id: 'rol_gmt_or_jaune', name: 'Rolex GMT-Master II (Or jaune massif)', category: 'WATCH', price: 41500, description: 'GMT luxueux en or jaune 18 ct massif avec lunette grise et noire.', prestigePoints: 415 },

  // Explorer & Air-King
  { id: 'rol_explorer_36', name: 'Rolex Explorer (36 mm, Acier)', category: 'WATCH', price: 7500, description: 'La montre d\'exploration par excellence en acier Oystersteel.', prestigePoints: 75 },
  { id: 'rol_explorer_ii', name: 'Rolex Explorer II (42 mm, Blanc)', category: 'WATCH', price: 10100, description: 'Cadran blanc "Polar" avec aiguille GMT orange caractéristique.', prestigePoints: 101 },
  { id: 'rol_air_king', name: 'Rolex Air-King (40 mm, Acier)', category: 'WATCH', price: 7900, description: 'Hommage à l\'âge d\'or de l\'aviation, cadran noir d\'une grande lisibilité.', prestigePoints: 79 },

  // Sea-Dweller & Deepsea
  { id: 'rol_sea_dweller', name: 'Rolex Sea-Dweller (Rolesor)', category: 'WATCH', price: 18600, description: 'Montre de plongée ultra-profonde bicolore étanche jusqu\'à 1 220 mètres.', prestigePoints: 186 },
  { id: 'rol_deepsea_or', name: 'Rolex Deepsea (Or jaune massif)', category: 'WATCH', price: 54000, description: 'Monstre marin de plongée extrême en or jaune 18 ct massif, étanche à 3 900m.', prestigePoints: 540 },

  // Yacht-Master
  { id: 'rol_yacht_titane', name: 'Rolex Yacht-Master 42 (Titane RLX)', category: 'WATCH', price: 14500, description: 'Superbe montre de skipper ultra-légère et robuste taillée en Titane RLX.', prestigePoints: 145 },
  { id: 'rol_yacht_everose', name: 'Rolex Yacht-Master 40 (Or Everose)', category: 'WATCH', price: 28500, description: 'Yacht-Master chic en or Everose 18 ct sur bracelet Oysterflex.', prestigePoints: 285 },

  // Classiques
  { id: 'rol_op_41', name: 'Rolex Oyster Perpetual 41 (Acier)', category: 'WATCH', price: 6750, description: 'La pureté originelle de l\'Oyster Perpetual avec cadran de prestige.', prestigePoints: 67 },
  { id: 'rol_datejust_36', name: 'Rolex Datejust 36 (Lunette or gris)', category: 'WATCH', price: 9850, description: 'Lunette cannelée en or gris avec cadran bleu soleillé et bracelet Jubilé.', prestigePoints: 98 },
  { id: 'rol_datejust_41', name: 'Rolex Datejust 41 (Lunette or gris)', category: 'WATCH', price: 11550, description: 'Modèle intemporel de 41 mm en acier et lunette cannelée en or blanc.', prestigePoints: 115 },
  { id: 'rol_daydate_36_or', name: 'Rolex Day-Date 36 (Or jaune massif)', category: 'WATCH', price: 38000, description: 'Le président par excellence en or jaune 18 ct avec guichet jour complet.', prestigePoints: 380 },
  { id: 'rol_daydate_40_everose', name: 'Rolex Day-Date 40 (Or Everose)', category: 'WATCH', price: 41200, description: 'Day-Date de 40 mm en or Everose 18 ct avec cadran vert olive président.', prestigePoints: 412 },
  { id: 'rol_daydate_40_platine', name: 'Rolex Day-Date 40 (Platine 950)', category: 'WATCH', price: 62500, description: 'Le summum absolu en Platine 950 massif avec cadran bleu glacier cannelé.', prestigePoints: 625 },
  { id: 'rol_perpetual_1908_or', name: 'Rolex Perpetual 1908 (Or jaune)', category: 'WATCH', price: 26800, description: 'Nouvelle ligne classique habillée rétro-chic de Rolex en or jaune.', prestigePoints: 268 },
  { id: 'rol_perpetual_1908_platine', name: 'Rolex Perpetual 1908 (Platine)', category: 'WATCH', price: 32700, description: 'Modèle ultra-raffiné en platine massif avec cadran bleu grainé habillé.', prestigePoints: 327 }
];

export const P2PShops: React.FC<P2PShopsProps> = ({ state, onUpdateState }) => {
  const [activeSubTab, setActiveSubTab] = useState<'shops' | 'auctions' | 'luxury'>('shops');
  const [hardwareFilter, setHardwareFilter] = useState<'ALL' | 'DATACENTER' | 'WORKSTATION' | '5000' | '4000' | '3000' | '2000' | 'ASIC' | 'WATERCOOLING'>('ALL');
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

  const currentPlayer = state.players[state.current_player_id] || Object.values(state.players)[0];

  const getFilteredHardwareItems = () => {
    return DETAILED_HARDWARE_ITEMS.filter(item => {
      if (hardwareFilter === 'ALL') return true;
      if (hardwareFilter === 'ASIC') return item.type === 'ASIC';
      if (hardwareFilter === 'WATERCOOLING') return item.type === 'WATERCOOLING';
      if (hardwareFilter === 'DATACENTER') {
        return ['gpu_gb200_nvl72', 'gpu_b200', 'gpu_mi300x', 'gpu_h200', 'gpu_h100'].includes(item.id);
      }
      if (hardwareFilter === 'WORKSTATION') {
        return ['gpu_rtx_6000_ada', 'gpu_w7900', 'gpu_rtx_a6000', 'gpu_rtx_8000'].includes(item.id);
      }
      if (hardwareFilter === '5000') {
        return item.id.startsWith('gpu_rtx_50');
      }
      if (hardwareFilter === '4000') {
        return item.id.startsWith('gpu_rtx_40') || item.id === 'gpu_rx_7900xtx';
      }
      if (hardwareFilter === '3000') {
        return item.id.startsWith('gpu_rtx_30') || item.id === 'gpu_rx_6900xt';
      }
      if (hardwareFilter === '2000') {
        return item.id.startsWith('gpu_rtx_20') || item.id === 'gpu_titan_rtx';
      }
      return true;
    });
  };

  // Handler: Buy hardware item from shop
  const handleBuyShopItem = (itemId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[next.current_player_id];
    const item = DETAILED_HARDWARE_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    // Get current stock from state
    const currentStock = next.global_hardware_stock ? (next.global_hardware_stock[itemId] ?? 0) : item.stock;
    if (currentStock <= 0) {
      alert("Cet article est en rupture de stock globale ! Attendez le restockage mensuel (toutes les 5 minutes).");
      return;
    }

    const tva = item.sell_price * next.server_config.tva_rate;
    const totalPrice = item.sell_price + tva;

    if (player.bank_clean < totalPrice) {
      alert(`Fonds bancaires insuffisants! Requis: $${totalPrice.toLocaleString()} (avec TVA ${next.server_config.tva_rate * 100}%)`);
      return;
    }

    // Deduct money
    player.bank_clean -= totalPrice;

    // Decrement stock in global_hardware_stock
    if (!next.global_hardware_stock) {
      next.global_hardware_stock = {};
    }
    next.global_hardware_stock[itemId] = currentStock - 1;

    // Add hardware to player farm
    let farm = next.mining_farms[player.id];
    if (!farm) {
      farm = {
        location_id: 'default_garage',
        location_name: 'Garage Personnel',
        power_capacity_watts: 15000,
        cooling_type: 'AIR',
        rigs: []
      };
      next.mining_farms[player.id] = farm;
    }

    if (item.type === 'WATERCOOLING') {
      farm.cooling_type = 'LIQUID';
    }

    farm.rigs.push({
      id: `rig_${Date.now()}`,
      rig_id: `rig_${Date.now()}`,
      name: `${item.name} (#${farm.rigs.length + 1})`,
      type: item.type === 'WATERCOOLING' ? 'WATERCOOLING' : (item.type === 'GPU' ? 'GPU_RTX_4090' : 'ASIC_BITMAIN_S19'),
      bought_from_shop: 'Boutique Hardware Centrale',
      hashrate_th: item.hashrate_th || 0,
      watts_consumption: item.watts_consumption || (item.type === 'WATERCOOLING' ? (item.id.includes('custom') ? 35 : 15) : 1000),
      wear_condition: 1.0,
      overclocked: false
    } as any);

    next.logs.unshift({
      id: `log_buy_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: player.id,
      message: `${player.name} a acheté le matériel de minage ${item.name} pour $${totalPrice.toLocaleString()} (Stock restant : ${currentStock - 1})`,
      status: 'OK'
    });

    setPurchaseSuccess(`Matériel ${item.name} acheté et expédié à votre Ferme de Minage !`);
    setTimeout(() => setPurchaseSuccess(null), 3000);

    onUpdateState(next);
  };

  // Handler: Buy luxury prestigious item
  const handleBuyLuxuryItem = (itemId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[next.current_player_id];
    const item = LUXURY_PRESTIGE_MARKETPLACE.find(i => i.id === itemId);
    if (!item) return;

    // Luxury is taxed with standard TVA
    const tva = item.price * next.server_config.tva_rate;
    const totalPrice = item.price + tva;

    if (player.bank_clean < totalPrice) {
      alert(`Fonds bancaires propres insuffisants! Requis: $${totalPrice.toLocaleString()} (avec TVA ${next.server_config.tva_rate * 100}%)`);
      return;
    }

    // Initialize possessions array if undefined
    if (!player.possessions) {
      player.possessions = [];
    }

    // Check if they already own it (optional constraint, let's allow multiple or distinct)
    player.possessions.push(item.name);
    player.bank_clean -= totalPrice;

    // Gain some credit score/prestige bonus
    player.credit_score = Math.min(850, player.credit_score + 10);

    next.logs.unshift({
      id: `log_lux_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: player.id,
      message: `PRESTIGE: ${player.name} s'est offert un prestige exceptionnel en acquérant '${item.name}' pour $${totalPrice.toLocaleString()}`,
      status: 'OK'
    });

    setPurchaseSuccess(`Félicitations! Vous possédez désormais l'objet de prestige : ${item.name} !`);
    setTimeout(() => setPurchaseSuccess(null), 4000);

    onUpdateState(next);
  };

  // Handler: Place Auction Bid
  const handleBidAuction = (auctionId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[next.current_player_id];
    const auc = next.auction_items.find(a => a.id === auctionId);
    if (!auc) return;

    const bidIncrease = 1000;
    const minBid = auc.current_bid + bidIncrease;

    if (auc.is_cash_only) {
      if (player.cash_dirty < minBid) {
        alert(`Cash Liquide (Dirty) insuffisant! Requis: $${minBid.toLocaleString()}`);
        return;
      }
      player.cash_dirty -= minBid;
    } else {
      if (player.bank_clean < minBid) {
        alert(`Solde bancaire insuffisant! Requis: $${minBid.toLocaleString()}`);
        return;
      }
      player.bank_clean -= minBid;
    }

    auc.current_bid = minBid;
    auc.highest_bidder_id = player.id;
    auc.highest_bidder_name = player.name;

    next.logs.unshift({
      id: `log_bid_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'AUCTION',
      uid: player.id,
      message: `${player.name} a enchéri $${minBid.toLocaleString()} sur '${auc.title}'`,
      status: 'OK'
    });

    onUpdateState(next);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-cyan-400" />
            Marchés & Catalogues de Biens
          </h1>
          <p className="text-xs text-gray-400">
            Achetez du matériel informatique de pointe ou investissez vos capitaux propres dans des objets de prestige.
          </p>
        </div>

        <div className="flex bg-[#0F0F16] p-1 rounded-lg border border-white/10 font-mono text-xs shrink-0">
          <button
            onClick={() => setActiveSubTab('shops')}
            className={`px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'shops' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Boutique Hardware
          </button>
          <button
            onClick={() => setActiveSubTab('luxury')}
            className={`px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'luxury' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Gem className="w-3.5 h-3.5 text-amber-400" /> Loisirs & Objets (Luxe)
          </button>
          <button
            onClick={() => setActiveSubTab('auctions')}
            className={`px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'auctions' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Gavel className="w-3.5 h-3.5" /> Enchères P2P
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {purchaseSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-mono p-4 rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-green-400" />
          <span>{purchaseSuccess}</span>
        </div>
      )}

      {/* Sub-Tab 1: Boutiques Hardware */}
      {activeSubTab === 'shops' && (
        <div className="space-y-6">
          <div className="bg-[#0F0F16] border border-cyan-500/25 rounded-2xl p-5 space-y-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-4 gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Encyclopédie & Boutique du Matériel de Minage
                </h3>
                <p className="text-xs text-gray-400">Puces IA monstres, stations de calcul d'ingénierie, cartes grand public NVIDIA RTX et ASICs haute efficacité.</p>
              </div>
              <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-1 rounded shrink-0">
                TVA Réglementaire: {state.server_config.tva_rate * 100}%
              </span>
            </div>

            {/* Hardware filter subcategory chips */}
            <div className="flex flex-wrap gap-1.5 bg-[#08080C] p-1.5 rounded-xl border border-white/5 font-mono text-[11px]">
              <button
                onClick={() => setHardwareFilter('ALL')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  hardwareFilter === 'ALL' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25' : 'text-gray-400 hover:text-white'
                }`}
              >
                TOUT ({DETAILED_HARDWARE_ITEMS.length})
              </button>
              <button
                onClick={() => setHardwareFilter('DATACENTER')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  hardwareFilter === 'DATACENTER' ? 'bg-purple-500/15 text-purple-300 border border-purple-500/25' : 'text-gray-400 hover:text-white'
                }`}
              >
                DATACENTERS (IA)
              </button>
              <button
                onClick={() => setHardwareFilter('WORKSTATION')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  hardwareFilter === 'WORKSTATION' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25' : 'text-gray-400 hover:text-white'
                }`}
              >
                STATIONS PRO
              </button>
              <button
                onClick={() => setHardwareFilter('5000')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  hardwareFilter === '5000' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25' : 'text-gray-400 hover:text-white'
                }`}
              >
                RTX SÉRIE 5000
              </button>
              <button
                onClick={() => setHardwareFilter('4000')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  hardwareFilter === '4000' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25' : 'text-gray-400 hover:text-white'
                }`}
              >
                RTX SÉRIE 4000
              </button>
              <button
                onClick={() => setHardwareFilter('3000')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  hardwareFilter === '3000' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25' : 'text-gray-400 hover:text-white'
                }`}
              >
                RTX SÉRIE 3000
              </button>
              <button
                onClick={() => setHardwareFilter('2000')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  hardwareFilter === '2000' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25' : 'text-gray-400 hover:text-white'
                }`}
              >
                RTX SÉRIE 2000
              </button>
              <button
                onClick={() => setHardwareFilter('ASIC')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  hardwareFilter === 'ASIC' ? 'bg-green-500/15 text-green-300 border border-green-500/25' : 'text-gray-400 hover:text-white'
                }`}
              >
                ASICS
              </button>
              <button
                onClick={() => setHardwareFilter('WATERCOOLING')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  hardwareFilter === 'WATERCOOLING' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25' : 'text-gray-400 hover:text-white'
                }`}
              >
                REFROIDISSEMENT
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredHardwareItems().map(item => {
                const tvaAmount = item.sell_price * state.server_config.tva_rate;
                const total = item.sell_price + tvaAmount;
                const stock = state.global_hardware_stock ? (state.global_hardware_stock[item.id] ?? 0) : item.stock;
                const isOutOfStock = stock <= 0;

                return (
                  <div key={item.id} className={`bg-[#08080C] border rounded-xl p-4.5 space-y-3.5 flex flex-col justify-between transition ${
                    isOutOfStock ? 'border-red-500/10 opacity-60' : 'border-white/5 hover:border-cyan-500/30'
                  }`}>
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">{item.type}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          isOutOfStock ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/10 text-green-400'
                        }`}>
                          {isOutOfStock ? 'Rupture de stock' : `Stock global: ${stock}`}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1.5">{item.name}</h4>

                      {item.type === 'WATERCOOLING' ? (
                        <div className="mt-2.5 font-mono text-[11px] text-gray-400 space-y-1 bg-cyan-950/20 p-2.5 rounded border border-cyan-500/10">
                          <p className="flex justify-between text-cyan-300">
                            <span>Type:</span>
                            <span className="font-bold">LIQUID COOLING</span>
                          </p>
                          <p className="flex justify-between">
                            <span>Conso Ventilateur & Pompe:</span>
                            <span className="text-amber-300 font-bold">{item.id.includes('custom') ? '35' : '15'} W</span>
                          </p>
                          <p className="flex justify-between text-green-300">
                            <span>Usure Globale Rigs:</span>
                            <span className="font-bold">-50% (Moitié Moins)</span>
                          </p>
                          <p className="flex justify-between text-cyan-400">
                            <span>Hashrate Bonus Rigs:</span>
                            <span className="font-bold">+8% (Thermique Idéale)</span>
                          </p>
                        </div>
                      ) : (
                        <div className="mt-2.5 font-mono text-[11px] text-gray-400 space-y-1 bg-[#0F0F16]/50 p-2.5 rounded border border-white/5">
                          <p className="flex justify-between">
                            <span>Hashrate Brut:</span>
                            <span className="text-cyan-300 font-bold">{item.hashrate_th} TH/s</span>
                          </p>
                          <p className="flex justify-between">
                            <span>Consommation:</span>
                            <span className="text-amber-300">{item.watts_consumption} W</span>
                          </p>
                          <p className="flex justify-between">
                            <span>Rendement TH/W:</span>
                            <span className="text-purple-300">{((item.hashrate_th || 1) / (item.watts_consumption || 1) * 1000).toFixed(2)} TH/kW</span>
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-white font-mono">${total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                        <p className="text-[9px] text-gray-500 font-mono">dont TVA ${tvaAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      </div>
                      <button
                        onClick={() => handleBuyShopItem(item.id)}
                        disabled={isOutOfStock}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                          isOutOfStock 
                            ? 'bg-red-500/10 text-red-400/50 border border-red-500/20 cursor-not-allowed'
                            : 'bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300'
                        }`}
                      >
                        {isOutOfStock ? 'Épuisé' : 'Acheter'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Luxury Items Store */}
      {activeSubTab === 'luxury' && (
        <div className="space-y-6">
          <div className="bg-[#0F0F16] border border-amber-500/20 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                  Salon d'Excellence, Loisirs & Prestige
                </h3>
                <p className="text-xs text-gray-400">Dépensez vos millions dans des montres de luxe, des supercars de sport ou des jets d'affaires privés.</p>
              </div>
              <span className="text-[10px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/20 px-2 py-1 rounded">
                Légitime • Taxé à {state.server_config.tva_rate * 100}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {LUXURY_PRESTIGE_MARKETPLACE.map(item => {
                const tvaAmount = item.price * state.server_config.tva_rate;
                const total = item.price + tvaAmount;

                return (
                  <div key={item.id} className="bg-[#08080C] border border-white/5 rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:border-amber-500/30 transition shadow-xl">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                          {item.category === 'WATCH' ? '⏱️ HORLOGERIE' : item.category === 'CAR' ? '🏎️ SUPERCAR' : item.category === 'JET' ? '✈️ AVIATION' : item.category === 'YACHT' ? '🛥️ YACHTING' : item.category === 'JEWELRY' ? '💎 JOAILLERIE' : '🏢 DOMAINE'}
                        </span>
                        <span className="text-[10px] font-mono text-amber-300 font-bold flex items-center gap-1">
                          ★ +{item.prestigePoints} Prestige
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-white">{item.name}</h4>
                      <p className="text-xs text-gray-400 font-sans leading-relaxed">{item.description}</p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <div>
                        <p className="text-base font-black text-white font-mono">${total.toLocaleString()}</p>
                        <p className="text-[9px] text-gray-500 font-mono">dont TVA ${tvaAmount.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => handleBuyLuxuryItem(item.id)}
                        className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold transition cursor-pointer"
                      >
                        Acquérir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Auctions */}
      {activeSubTab === 'auctions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {state.auction_items.map(auc => (
            <div key={auc.id} className="bg-[#0F0F16] border border-white/5 rounded-xl p-5 space-y-4 shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                    auc.is_cash_only ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {auc.is_cash_only ? 'Vente Discrète (Dirty Cash)' : 'Enchère Civile (Clean)'}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">{auc.title}</h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase font-mono">Expire dans</p>
                  <p className="text-xs font-mono text-amber-400 font-bold">{auc.expires_in_ticks} Ticks</p>
                </div>
              </div>

              <p className="text-xs text-gray-300 bg-[#08080C] p-3 rounded border border-white/5">{auc.description}</p>

              <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                <div className="bg-[#08080C] p-2.5 rounded border border-white/5">
                  <p className="text-[10px] text-gray-500 uppercase">Offre Actuelle</p>
                  <p className="text-sm font-bold text-cyan-400">${auc.current_bid.toLocaleString()}</p>
                  <p className="text-[9px] text-gray-400">{auc.highest_bidder_name || 'Aucun'}</p>
                </div>
                <div className="bg-[#08080C] p-2.5 rounded border border-white/5">
                  <p className="text-[10px] text-gray-500 uppercase">Achat Immédiat</p>
                  <p className="text-sm font-bold text-green-400">${auc.buyout_price.toLocaleString()}</p>
                </div>
              </div>

              <button
                onClick={() => handleBidAuction(auc.id)}
                className="w-full py-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Gavel className="w-4 h-4" /> Enchérir +$1,000 (${(auc.current_bid + 1000).toLocaleString()})
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
