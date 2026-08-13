import React, { useState, useEffect } from 'react';
import { FullGlobalState } from './types/wealth';
import { loadSavedState, saveGlobalState, executeGlobalServerTick } from './lib/gameEngine';
import { subscribeAuthState, logoutFirebase } from './lib/firebase';
import { LandingPage } from './components/LandingPage';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { P2PShops } from './components/P2PShops';
import { RealEstate } from './components/RealEstate';
import { MiningFarm } from './components/MiningFarm';
import { Laundering } from './components/Laundering';
import { Casino } from './components/Casino';
import { StockMarket } from './components/StockMarket';
import { BankTab } from './components/BankTab';
import { GuideAndKnowledge } from './components/GuideAndKnowledge';
import { AuthModal } from './components/AuthModal';
import { ShieldAlert, Sparkles, TrendingDown, Megaphone, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<FullGlobalState>(() => loadSavedState());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  
  // Track Authentication Status (defaults to false for unauthenticated visitors)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('wealth_sandbox_is_authenticated') === 'true';
  });

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeAuthState((user) => {
      if (user) {
        setIsAuthenticated(true);
        localStorage.setItem('wealth_sandbox_is_authenticated', 'true');
      }
    });
    return () => unsubscribe();
  }, []);

  // Periodic Global Server Tick (runs every 3 seconds)
  useEffect(() => {
    if (!state.is_tick_running) return;

    const timer = setInterval(() => {
      setState(prevState => executeGlobalServerTick(prevState));
    }, 3000);

    return () => clearInterval(timer);
  }, [state.is_tick_running]);

  const handleUpdateState = (newState: FullGlobalState) => {
    setState(newState);
    saveGlobalState(newState);
  };

  const handleCloseActiveEvent = () => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    next.active_event = undefined;
    handleUpdateState(next);
  };

  const handleSwitchPlayer = (playerId: string) => {
    const next = { ...state, current_player_id: playerId };
    setState(next);
    saveGlobalState(next);
  };

  const handleManualTick = () => {
    const next = executeGlobalServerTick(state);
    setState(next);
  };

  const handleLoginSuccess = (playerId: string, updatedState: FullGlobalState) => {
    setIsAuthenticated(true);
    localStorage.setItem('wealth_sandbox_is_authenticated', 'true');
    handleUpdateState(updatedState);
  };

  const handleLogout = async () => {
    await logoutFirebase();
    setIsAuthenticated(false);
    localStorage.removeItem('wealth_sandbox_is_authenticated');
  };

  // If visitor is NOT authenticated, show the public Landing/Showcase Page
  if (!isAuthenticated) {
    return <LandingPage state={state} onLoginSuccess={handleLoginSuccess} />;
  }

  const currentPlayer = state.players[state.current_player_id] || Object.values(state.players)[0];

  return (
    <div className="h-screen w-screen bg-[#050507] text-[#D1D1D1] font-sans flex flex-col overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-300">
      {/* Top Navigation */}
      <Navbar
        state={state}
        onSwitchPlayer={handleSwitchPlayer}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onManualTick={handleManualTick}
        onOpenGuide={() => setActiveTab('guide')}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Cyber Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} player={currentPlayer} dbLoadPercent={38} />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.03),_transparent_40%)]">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Onboarding Welcome Banner */}
            {showWelcomeBanner && activeTab === 'dashboard' && (
              <div className="bg-gradient-to-r from-cyan-950/60 via-[#0D0D14] to-purple-950/60 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse"></span>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">
                      BIENVENUE SUR WEALTH SANDBOX V8.0 • SERVEUR SÉCURISÉ
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white font-sans">
                    Comment Jouer & À Quoi Consiste le Jeu ?
                  </h2>
                  <p className="text-xs text-gray-300 font-sans leading-relaxed">
                    Wealth Sandbox est un simulateur financier en temps réel. Bâtissez votre empire en gérant <strong className="text-green-400 font-mono">l'Argent Propre (Banque)</strong> et <strong className="text-amber-400 font-mono">l'Argent Sale (Cash)</strong>, minez du Bitcoin 24/7, blanchissez vos gains et spéculez en Bourse à levier !
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab('guide')}
                    className="px-3.5 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold transition cursor-pointer"
                  >
                    📖 Lire le Guide Complet
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-3.5 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-mono font-bold transition cursor-pointer"
                  >
                    🔑 Déconnexion
                  </button>
                  <button
                    onClick={() => setShowWelcomeBanner(false)}
                    className="text-gray-500 hover:text-white p-2 text-xs font-mono"
                    title="Masquer le message"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <Dashboard state={state} onNavigateTab={(tab) => setActiveTab(tab)} onUpdateState={handleUpdateState} />
            )}
            {activeTab === 'guide' && (
              <GuideAndKnowledge />
            )}
            {activeTab === 'shops' && (
              <P2PShops state={state} onUpdateState={handleUpdateState} />
            )}
            {activeTab === 'bank' && (
              <BankTab state={state} onUpdateState={handleUpdateState} />
            )}
            {activeTab === 'realestate' && (
              <RealEstate state={state} onUpdateState={handleUpdateState} />
            )}
            {activeTab === 'mining' && (
              <MiningFarm state={state} onUpdateState={handleUpdateState} />
            )}
            {activeTab === 'laundering' && (
              <Laundering state={state} onUpdateState={handleUpdateState} />
            )}
            {activeTab === 'casino' && (
              <Casino state={state} onUpdateState={handleUpdateState} />
            )}
            {activeTab === 'stocks' && (
              <StockMarket state={state} onUpdateState={handleUpdateState} />
            )}
          </div>
        </main>
      </div>

      {/* Footer matching Immersive UI */}
      <footer className="h-8 bg-[#0A0A0E] border-t border-white/5 px-8 flex items-center justify-between text-[9px] uppercase tracking-[0.2em] shrink-0">
        <p className="opacity-40">© 2026 WEALTH SANDBOX V8.0 OMNI • SIMULATEUR EN LIGNE</p>
        <div className="flex items-center gap-6 font-mono text-gray-400">
          <span className="text-cyan-400">LATENCY: 12ms</span>
          <span className="text-purple-400">BUFFER: 0.01%</span>
          <span className="text-green-400 font-bold hidden sm:inline">NODES: ONLINE</span>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        state={state}
        onUpdateState={handleUpdateState}
      />

      {/* GRAND EVENT POPUP SYSTEM */}
      {state.active_event && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-[#07070B] border border-cyan-500/35 max-w-xl w-full rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.3)] flex flex-col relative">
            
            {/* Pulsing decoration bar based on severity */}
            <div className={`h-2.5 w-full ${
              state.active_event.severity === 'CRITICAL' ? 'bg-gradient-to-r from-red-600 via-red-500 to-amber-600 animate-pulse' :
              state.active_event.severity === 'SUCCESS' ? 'bg-gradient-to-r from-emerald-500 via-green-400 to-teal-500' :
              'bg-gradient-to-r from-amber-500 to-orange-500'
            }`} />

            <div className="p-8 text-center space-y-6">
              {/* Massive Icon in a glowing circle */}
              <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center border bg-[#0C0C12] shadow-2xl relative">
                {state.active_event.severity === 'CRITICAL' ? (
                  <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping" />
                ) : null}

                {state.active_event.severity === 'CRITICAL' && <ShieldAlert className="w-10 h-10 text-red-500" />}
                {state.active_event.severity === 'SUCCESS' && <Sparkles className="w-10 h-10 text-emerald-400" />}
                {state.active_event.severity === 'WARNING' && <TrendingDown className="w-10 h-10 text-amber-500" />}
                {state.active_event.severity === undefined && <Megaphone className="w-10 h-10 text-cyan-400" />}
              </div>

              {/* Event Metadata Label */}
              <div className="space-y-1.5">
                <span className={`text-[10px] font-mono font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full ${
                  state.active_event.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                  state.active_event.severity === 'SUCCESS' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                  'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  Événement Serveur Majeur
                </span>
                <h2 className="text-xl font-black text-white uppercase tracking-tight font-mono pt-2">
                  {state.active_event.title}
                </h2>
              </div>

              {/* Description and Storytelling */}
              <p className="text-sm text-gray-300 font-sans leading-relaxed bg-[#0E0E14] p-5 rounded-2xl border border-white/5 text-center">
                {state.active_event.description}
              </p>

              {/* Financial Impact Box */}
              <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 font-mono text-xs text-left space-y-1">
                <p className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Impact Direct sur le Sandbox :</p>
                <p className="text-gray-200 leading-normal">{state.active_event.impactText}</p>
              </div>

              {/* Accept Consequences Button */}
              <button
                onClick={handleCloseActiveEvent}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs uppercase tracking-widest font-mono transition-all duration-300 shadow-xl cursor-pointer"
              >
                Prendre acte et continuer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
