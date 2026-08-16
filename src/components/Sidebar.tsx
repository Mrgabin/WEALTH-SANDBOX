import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Building2, 
  Cpu, 
  DollarSign, 
  Dices, 
  TrendingUp, 
  Database,
  Activity,
  BookOpen,
  Wallet,
  Landmark,
  Briefcase
} from 'lucide-react';
import { PlayerProfile } from '../types/wealth';

export type ActiveTab = 'dashboard' | 'guide' | 'shops' | 'bank' | 'realestate' | 'mining' | 'laundering' | 'casino' | 'stocks' | 'charges' | 'investments';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  player?: PlayerProfile;
  dbLoadPercent?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, player, dbLoadPercent = 38 }) => {
  const menuItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Live Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'guide', label: 'Guide & Connaissances', icon: <BookOpen className="w-4 h-4 text-cyan-400" />, badge: 'DOCS' },
    { id: 'shops', label: 'Marchés & P2P', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'bank', label: 'Banque & Crédit', icon: <Landmark className="w-4 h-4 text-emerald-400" /> },
    { id: 'realestate', label: 'Immobilier & Parcs', icon: <Building2 className="w-4 h-4" /> },
    { id: 'investments', label: 'Gestion de Patrimoine', icon: <Briefcase className="w-4 h-4 text-purple-400" />, badge: 'ACTIFS' },
    { id: 'mining', label: 'Minage Crypto 24/7', icon: <Cpu className="w-4 h-4" />, badge: 'LIVE' },
    { id: 'laundering', label: 'Blanchiment & ISF', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'charges', label: 'Taxes & Abonnements', icon: <Activity className="w-4 h-4 text-purple-400" />, badge: 'IMPÔTS' },
    { id: 'casino', label: 'Casino & Mini-Jeux', icon: <Dices className="w-4 h-4" /> },
    { id: 'stocks', label: 'Bourse & Cryptos', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  const cash = player?.cash_dirty ?? 0;
  const bank = player?.bank_clean ?? 0;
  const total = cash + bank;
  const creditScore = player?.credit_score ?? 650;

  return (
    <aside className="w-64 bg-[#08080C] border-r border-white/5 p-5 flex flex-col justify-between shrink-0 select-none">
      <div className="space-y-6">
        {/* FINANCIAL SUMMARY INTEGRATION */}
        {player && (
          <div className="space-y-3 bg-[#0C0C12] border border-white/10 rounded-xl p-4 shadow-md">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold font-mono">
              SOLDE DU PORTEFEUILLE
            </h4>
            
            <div className="space-y-2.5">
              {/* Cash dirty */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-amber-500" /> Cash (Sale)
                </span>
                <span className="text-xs font-bold text-amber-400 font-mono">
                  ${cash.toLocaleString()}
                </span>
              </div>

              {/* Bank clean */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-green-500" /> Banque (Propre)
                </span>
                <span className="text-xs font-bold text-green-400 font-mono">
                  ${bank.toLocaleString()}
                </span>
              </div>

              <div className="border-t border-white/5 pt-2 flex items-center justify-between">
                <span className="text-xs text-gray-300 font-medium">Actif Net Total</span>
                <span className="text-xs font-black text-white font-mono">
                  ${total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Credit Score Indicator */}
            <div className="border-t border-white/5 pt-2.5 space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-500">Score de Crédit</span>
                <span className={`font-mono font-bold ${
                  creditScore > 720 ? 'text-green-400' : creditScore > 650 ? 'text-cyan-400' : 'text-amber-500'
                }`}>
                  {creditScore} / 850
                </span>
              </div>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 transition-all"
                  style={{ width: `${Math.min(100, (creditScore / 850) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold mb-3 px-2">
            Main Controls
          </h3>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between p-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-300 border-l-2 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-cyan-400' : 'text-gray-500'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                      item.badge === 'PASS' 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Removed Server Status Widget per user instruction */}
    </aside>
  );
};
