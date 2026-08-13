import React from 'react';
import { FullGlobalState } from '../types/wealth';
import { Shield, Zap, Database, UserCheck, Key, RefreshCw } from 'lucide-react';

interface NavbarProps {
  state: FullGlobalState;
  onSwitchPlayer: (id: string) => void;
  onOpenAuth: () => void;
  onManualTick: () => void;
  onOpenGuide?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ state, onSwitchPlayer, onOpenAuth, onManualTick, onOpenGuide, onLogout }) => {
  const currentPlayer = state.players[state.current_player_id] || Object.values(state.players)[0];
  const btcItem = state.market_prices.find(m => m.symbol === 'BTCUSDT');
  const ethItem = state.market_prices.find(m => m.symbol === 'ETHUSDT');

  return (
    <header className="h-16 border-b border-cyan-500/20 bg-[#0A0A0E] flex items-center justify-between px-6 shrink-0 z-30">
      {/* Brand & Title */}
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center text-black font-extrabold text-lg">
          Ω
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-widest text-lg text-white uppercase">
              WEALTH<span className="text-cyan-400">SANDBOX</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              v8.0 OMNI
            </span>
          </div>
          <p className="text-[10px] text-gray-400 hidden sm:block">Simulateur Financier P2P & Moteur BDD Temps Réel</p>
        </div>
      </div>

      {/* Live Market Tickers */}
      <div className="hidden lg:flex items-center gap-6 font-mono text-xs border-x border-white/5 px-6">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">BTC/USDT:</span>
          <span className="text-cyan-400 font-bold">${btcItem?.price.toLocaleString()}</span>
          <span className={`text-[10px] ${(btcItem?.change_percent || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {(btcItem?.change_percent || 0) >= 0 ? '▲' : '▼'}{btcItem?.change_percent}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">ETH/USDT:</span>
          <span className="text-purple-300 font-bold">${ethItem?.price.toLocaleString()}</span>
          <span className={`text-[10px] ${(ethItem?.change_percent || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {(ethItem?.change_percent || 0) >= 0 ? '▲' : '▼'}{ethItem?.change_percent}%
          </span>
        </div>
      </div>

      {/* Connection status & User controls */}
      <div className="flex items-center gap-3">
        {/* Guide button */}
        {onOpenGuide && (
          <button
            onClick={onOpenGuide}
            className="hidden sm:flex items-center gap-1.5 text-xs font-mono bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1.5 rounded-md transition cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Comment Jouer</span>
          </button>
        )}

        {/* Automated real-time tick synchronizer badge */}
        <div 
          className="flex items-center gap-1.5 text-xs font-mono bg-[#0F0F16] text-cyan-300 border border-cyan-500/20 px-3 py-1.5 rounded-md"
          title="Cycle serveur synchronisé automatique en temps réel"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
          <span>Automatique • Cycle #{state.tick_count}</span>
        </div>

        {/* Server Status Badge */}
        <div className="hidden xl:flex items-center gap-2 bg-[#0F0F16] border border-cyan-500/30 px-3 py-1.5 rounded-md">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse"></div>
          <span className="text-[11px] font-mono uppercase tracking-tight text-cyan-400">
            SERVEUR EN LIGNE
          </span>
        </div>

        <div className="h-6 w-[1px] bg-white/10 hidden sm:block"></div>

        {/* User Account Info */}
        <div className="flex items-center gap-3">
          {/* Explicit Logout Button */}
          {onLogout ? (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-mono font-bold transition cursor-pointer"
              title="Se déconnecter et revenir à l'accueil"
            >
              <Key className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold transition cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.2)]"
              title="Connexion"
            >
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span>Connexion</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
