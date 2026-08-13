import React, { useState } from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  Code2, 
  Layers, 
  Database, 
  Zap, 
  DollarSign, 
  Cpu, 
  ShieldAlert, 
  Globe, 
  Terminal, 
  Award, 
  TrendingUp, 
  Building2, 
  Dices, 
  CheckCircle2, 
  Server,
  Lock,
  Flame,
  Info
} from 'lucide-react';

export const GuideAndKnowledge: React.FC = () => {
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [activeTab, setActiveTab] = useState<'gameplay' | 'tech' | 'secrets'>('gameplay');

  return (
    <div className="space-y-6">
      {/* Header & Language Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cyan-500/20 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded">
              {lang === 'fr' ? 'BASE DE CONNAISSANCES & DOCUMENTATION' : 'KNOWLEDGE BASE & DOCUMENTATION'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight mt-1.5 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            {lang === 'fr' ? 'Guide du Jeu & Coulisses Techniques' : 'Game Guide & Behind The Scenes'}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {lang === 'fr' 
              ? 'Toutes les explications sur le fonctionnement de Wealth Sandbox v8.0 OMNI et son architecture.' 
              : 'Complete explanations on Wealth Sandbox v8.0 OMNI mechanics and technical implementation.'}
          </p>
        </div>

        {/* Language Switcher Button */}
        <div className="flex items-center gap-2 bg-[#0F0F16] border border-white/10 p-1 rounded-xl font-mono text-xs">
          <button
            onClick={() => setLang('fr')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              lang === 'fr' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>🇫🇷</span> Français
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              lang === 'en' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>🇬🇧</span> English
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex bg-[#0F0F16] p-1.5 rounded-xl border border-white/10 font-mono text-xs w-fit gap-1">
        <button
          onClick={() => setActiveTab('gameplay')}
          className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'gameplay' 
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          {lang === 'fr' ? '1. Comment Jouer & But du Jeu' : '1. How to Play & Game Goal'}
        </button>
        <button
          onClick={() => setActiveTab('tech')}
          className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'tech' 
              ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Code2 className="w-4 h-4 text-purple-400" />
          {lang === 'fr' ? '2. Réalisation & Moteur Firebase' : '2. How It Was Built & Firebase'}
        </button>
        <button
          onClick={() => setActiveTab('secrets')}
          className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'secrets' 
              ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4 text-amber-400" />
          {lang === 'fr' ? '3. Algorithmes & Coulisses Ignorées' : '3. Algorithms & Hidden Details'}
        </button>
      </div>

      {/* TAB 1: HOW TO PLAY & GOAL OF THE GAME */}
      {activeTab === 'gameplay' && (
        <div className="space-y-6">
          {/* Main Goal Banner */}
          <div className="bg-gradient-to-r from-cyan-950/40 via-[#0F0F16] to-purple-950/40 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Award className="w-48 h-48 text-cyan-400" />
            </div>
            
            <div className="max-w-3xl space-y-3 relative z-10">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded">
                {lang === 'fr' ? 'LE CONCEPT GLOBAL' : 'THE GLOBAL CONCEPT'}
              </span>
              <h2 className="text-xl font-extrabold text-white">
                {lang === 'fr' 
                  ? 'Quel est le but ultime de Wealth Sandbox ?' 
                  : 'What is the ultimate goal of Wealth Sandbox?'}
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed font-sans">
                {lang === 'fr' ? (
                  <>
                    <strong>Wealth Sandbox v8.0 OMNI</strong> est un simulateur financier et économique complet en temps réel. 
                    Votre objectif est de bâtir un empire financier en gérant deux types de monnaies : 
                    <span className="text-green-400 font-bold font-mono"> l'Argent Propre (Banque)</span> et 
                    <span className="text-amber-400 font-bold font-mono"> l'Argent Sale (Cash)</span>, tout en maîtrisant le minage de crypto-monnaies 24/7, le blanchiment d'argent, la gestion immobilière et le trading à levier.
                  </>
                ) : (
                  <>
                    <strong>Wealth Sandbox v8.0 OMNI</strong> is a complete real-time economic and financial simulator. 
                    Your goal is to build a financial empire by managing two monetary circuits: 
                    <span className="text-green-400 font-bold font-mono"> Clean Money (Bank)</span> and 
                    <span className="text-amber-400 font-bold font-mono"> Dirty Cash</span>, while mastering 24/7 crypto mining, money laundering, real estate, and leveraged stock trading.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* SERVER TICKS EXPLANATION CARD */}
          <div className="bg-[#0F0F16] border border-cyan-500/30 rounded-2xl p-5 space-y-3 font-sans">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
                ⏱️
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wide font-mono">
                  {lang === 'fr' ? 'À quoi correspondent les TICKS (Cycles Serveur) ?' : 'What are Server TICKS?'}
                </h3>
                <p className="text-[11px] text-cyan-400 font-mono">
                  {lang === 'fr' ? 'Indicateur en haut à droite : Tick #1, Tick #2, etc.' : 'Top-right indicator: Tick #1, Tick #2, etc.'}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {lang === 'fr' ? (
                <>
                  Un <strong>Tick</strong> représente un <strong>cycle d'horloge du serveur (qui tourne toutes les 3 secondes)</strong>. À chaque tick, le moteur de jeu s'exécute automatiquement pour :
                  <br/>
                  • <strong>Générer les revenus de minage</strong> de vos cartes graphiques et ASICs.<br/>
                  • <strong>Actualiser le cours des cryptos et de la bourse</strong>.<br/>
                  • <strong>Calculer l'usure de votre matériel</strong> (-0.5% à -1.5% par tick).<br/>
                  • <strong>Appliquer les impôts récurrents</strong> (taxe ISF 0.1% sur la banque si solde &gt; 1M$).<br/>
                  • <strong>Évaluer le risque de contrôle fiscal</strong> si votre compteur électrique est piraté.
                </>
              ) : (
                <>
                  A <strong>Tick</strong> is a <strong>server clock cycle (every 3 seconds)</strong>. Every tick, the game engine automatically runs to:
                  <br/>
                  • <strong>Generate mining income</strong> from your GPUs and ASICs.<br/>
                  • <strong>Update crypto & stock market prices</strong>.<br/>
                  • <strong>Calculate hardware degradation</strong> (-0.5% to -1.5% per tick).<br/>
                  • <strong>Apply wealth tax (ISF)</strong> if bank balance &gt; $1,000,000.<br/>
                  • <strong>Evaluate audit risk</strong> if your electric meter is hacked.
                </>
              )}
            </p>
          </div>

          {/* Step-by-Step Gameplay Guides */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Step 1: Clean vs Dirty */}
            <div className="bg-[#0F0F16] border border-white/10 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400 font-bold font-mono">
                  01
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  {lang === 'fr' ? 'Circuit Financier : Banque vs Cash' : 'Financial Circuit: Bank vs Cash'}
                </h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                {lang === 'fr' ? (
                  <>
                    • <strong>Banque (Clean) :</strong> Sert à acheter des commerces officiels, des biens immobiliers et des obligations d'État. Attention : tout solde bancaire dépassant <strong>1 000 000 $</strong> est prélevé de la taxe <strong>ISF Virtuel (0.1% par tick)</strong> !<br/>
                    • <strong>Cash (Dirty) :</strong> Issu des gains du casino, ventes P2P et transactions sous le manteau. Il n'est pas taxé par l'ISF mais doit être blanchi pour acheter des commerces légaux.
                  </>
                ) : (
                  <>
                    • <strong>Clean Bank Balance:</strong> Used to buy official shops, real estate deeds, and bonds. Warning: clean balances above <strong>$1,000,000</strong> trigger the <strong>ISF Wealth Tax (0.1% per tick)</strong>!<br/>
                    • <strong>Dirty Cash:</strong> Earned from casino wins, P2P sales, and off-the-books deals. Untaxed by ISF, but must be laundered to buy legal businesses.
                  </>
                )}
              </p>
            </div>

            {/* Step 2: Mining 24/7 */}
            <div className="bg-[#0F0F16] border border-white/10 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold font-mono">
                  02
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  {lang === 'fr' ? 'Fermes de Minage Crypto 24/7' : '24/7 Crypto Mining Rigs'}
                </h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                {lang === 'fr' ? (
                  <>
                    • Achetez des <strong>NVIDIA RTX 4090</strong> ou <strong>ASIC Bitmain S19</strong> dans les boutiques P2P.<br/>
                    • Placez-les dans vos hangars ou Data Centers. Chaque rig génère du Bitcoin calculé selon le Hashrate global.<br/>
                    • <strong>Surcadencement (Overclock) :</strong> Augmente le Hashrate de +25%, mais accélère l'usure du matériel par 3 !
                  </>
                ) : (
                  <>
                    • Purchase <strong>NVIDIA RTX 4090s</strong> or <strong>Bitmain S19 ASICs</strong> from P2P shops.<br/>
                    • Place them in garages, hangars, or data centers. Each rig mines BTC based on global difficulty.<br/>
                    • <strong>Overclocking:</strong> Grants +25% hashrate, but accelerates hardware wear by 3x!
                  </>
                )}
              </p>
            </div>

            {/* Step 3: Electricity & Meter Hacking */}
            <div className="bg-[#0F0F16] border border-white/10 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold font-mono">
                  03
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  {lang === 'fr' ? 'Électricité & Piratage de Compteur' : 'Electricity & Electric Meter Hacking'}
                </h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                {lang === 'fr' ? (
                  <>
                    • Le minage consomme des Watts facturés à <strong>0,12 $/kWh</strong>.<br/>
                    • Vous pouvez <strong>pirater votre compteur électrique</strong> pour réduire la facture à 0 $ !<br/>
                    • ⚠️ <strong>Attention :</strong> Pirater le compteur augmente le risque de contrôle fiscal à chaque tick, pouvant entraîner une amende sévère de 50 000 $.
                  </>
                ) : (
                  <>
                    • Mining consumes power billed at <strong>$0.12/kWh</strong>.<br/>
                    • You can <strong>hack your electric meter</strong> to drop electricity bills to $0!<br/>
                    • ⚠️ <strong>Warning:</strong> Hacking increases audit risk per tick, risking a $50,000 fine if caught.
                  </>
                )}
              </p>
            </div>

            {/* Step 4: Laundering & Real Estate */}
            <div className="bg-[#0F0F16] border border-white/10 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold font-mono">
                  04
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  {lang === 'fr' ? 'Blanchiment & Agence Immobilière' : 'Laundering & Real Estate Agencies'}
                </h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                {lang === 'fr' ? (
                  <>
                    • <strong>Nightclubs & Laveries :</strong> Injectent votre Cash sale et le restituent en virement bancaire propre contre une commission (15-30%).<br/>
                    • <strong>Agences Immobilières :</strong> Achetez et louez des studios, hangars et Data Centers à d'autres joueurs avec commission d'agence (8%) et taxe foncière (1%).
                  </>
                ) : (
                  <>
                    • <strong>Nightclubs & Laundromats:</strong> Convert dirty cash into clean bank deposits for a 15-30% fee.<br/>
                    • <strong>Real Estate Agencies:</strong> Buy and lease properties to players with an 8% commission and 1% monthly property tax.
                  </>
                )}
              </p>
            </div>

            {/* Step 5: Leverage Trading & Stock Market */}
            <div className="bg-[#0F0F16] border border-white/10 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold font-mono">
                  05
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  {lang === 'fr' ? 'Trading à Levier (1x à 50x)' : 'Leveraged Trading (1x to 50x)'}
                </h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                {lang === 'fr' ? (
                  <>
                    • Spéculez sur le Bitcoin, Ethereum, NVIDIA et Tesla avec un levier jusqu'à <strong>50x</strong> !<br/>
                    • Nouveauté : Les <strong>Obligations d'État (Server Bonds)</strong> garantissent un rendement fixe de 4% sans risque.
                  </>
                ) : (
                  <>
                    • Trade BTC, ETH, NVIDIA, and Tesla with leverage up to <strong>50x</strong>!<br/>
                    • New: <strong>Server Bonds</strong> provide a guaranteed risk-free 4% annual yield.
                  </>
                )}
              </p>
            </div>

            {/* Step 6: P2P Auctions & Loans */}
            <div className="bg-[#0F0F16] border border-white/10 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold font-mono">
                  06
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  {lang === 'fr' ? 'Enchères P2P & Prêteurs sur Gages' : 'P2P Auctions & Loan Sharks'}
                </h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                {lang === 'fr' ? (
                  <>
                    • Vendez et achetez des montres de luxe ou clés de coffre aux enchères Cash-Only.<br/>
                    • Empruntez auprès de prêteurs sur gages avec un taux d'intérêt hebdomadaire et un nantissement de garantie.
                  </>
                ) : (
                  <>
                    • Auction luxury watches or safe keys in cash-only bidding wars.<br/>
                    • Borrow money from loan sharks with weekly interest rates and collateral pledged.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TECHNICAL IMPLEMENTATION & FIREBASE */}
      {activeTab === 'tech' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Tech Architecture Card */}
          <div className="bg-[#0F0F16] border border-purple-500/30 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest bg-purple-500/10 border border-purple-500/30 px-2.5 py-0.5 rounded">
                  {lang === 'fr' ? 'ARCHITECTURE APPLICATIVE' : 'APPLICATION ARCHITECTURE'}
                </span>
                <h2 className="text-lg font-bold text-white mt-1">
                  {lang === 'fr' ? 'Comment le site a été conçu' : 'How the Application was Built'}
                </h2>
              </div>
              <Server className="w-8 h-8 text-purple-400" />
            </div>

            <p className="text-gray-300 font-sans text-xs leading-relaxed">
              {lang === 'fr' ? (
                <>
                  Cette application a été construite selon les standards de développement full-stack modernes React & Firebase. 
                  Voici le détail des technologies utilisées pour assurer des performances optimales et une persistance en temps réel :
                </>
              ) : (
                <>
                  This application was engineered following modern React & Firebase full-stack architecture standards. 
                  Below is the detailed technical stack powering real-time persistence and UI performance:
                </>
              )}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-[#08080C] p-4 rounded-xl border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <Zap className="w-4 h-4" /> Frontend & UI Engine
                </div>
                <ul className="text-gray-400 space-y-1 text-[11px] font-sans">
                  <li>• <strong>React 18 + TypeScript :</strong> Typage strict de tous les états globaux (`FullGlobalState`).</li>
                  <li>• <strong>Vite Single Page Application :</strong> Chargement instantané sans rafraîchissement de page.</li>
                  <li>• <strong>Tailwind CSS :</strong> Palette personnalisée sombre Obsidian (`#050507`) et effets néon cyan/purple.</li>
                  <li>• <strong>Lucide React Icons :</strong> Système d'icônes vectorielles légères.</li>
                </ul>
              </div>

              <div className="bg-[#08080C] p-4 rounded-xl border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold">
                  <Database className="w-4 h-4" /> Firebase Backend & Realtime DB
                </div>
                <ul className="text-gray-400 space-y-1 text-[11px] font-sans">
                  <li>• <strong>Projet ID Firebase :</strong> <code className="text-cyan-300">wealthsand-c07bb</code></li>
                  <li>• <strong>Firebase Firestore :</strong> Synchronisation temps réel des collections de joueurs et transactions.</li>
                  <li>• <strong>Firebase Authentication :</strong> Inscription et connexion sécurisée des comptes joueurs.</li>
                  <li>• <strong>Moteur JSON Fallback :</strong> Moteur de secours local si la connexion réseau est interrompue.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Database Credentials Summary Box */}
          <div className="bg-[#08080C] border border-cyan-500/20 rounded-xl p-5 space-y-3">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              {lang === 'fr' ? 'Configuration Firebase & Projet Assigné' : 'Firebase Project Credentials'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono text-[11px]">
              <div className="p-2.5 bg-[#0F0F16] border border-white/5 rounded-lg">
                <span className="text-gray-500 block text-[9px] uppercase">Project ID</span>
                <span className="text-cyan-300 font-bold">wealthsand-c07bb</span>
              </div>
              <div className="p-2.5 bg-[#0F0F16] border border-white/5 rounded-lg">
                <span className="text-gray-500 block text-[9px] uppercase">Project Number</span>
                <span className="text-purple-300 font-bold">780025664387</span>
              </div>
              <div className="p-2.5 bg-[#0F0F16] border border-white/5 rounded-lg">
                <span className="text-gray-500 block text-[9px] uppercase">Auth Domain</span>
                <span className="text-green-300 font-bold">wealthsand-c07bb.firebaseapp.com</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ALGORITHMS & HIDDEN DETAILS */}
      {activeTab === 'secrets' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-[#0F0F16] border border-amber-500/30 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded">
                  {lang === 'fr' ? 'MATHEMATIQUES & REGLES DU JEU' : 'MATHEMATICS & GAME MECHANICS'}
                </span>
                <h2 className="text-lg font-bold text-white mt-1">
                  {lang === 'fr' ? 'Les Coulisses Techniques & Algorithmes Ignorés' : 'Behind The Scenes & Ignored Mechanics'}
                </h2>
              </div>
              <Terminal className="w-8 h-8 text-amber-400" />
            </div>

            <p className="text-gray-300 font-sans text-xs leading-relaxed">
              {lang === 'fr' ? (
                <>
                  De nombreux joueurs ignorent les formules mathématiques précises qui régissent le monde de Wealth Sandbox. 
                  Voici le détail des règles calculées automatiquement à chaque tick de 3 secondes :
                </>
              ) : (
                <>
                  Many players overlook the precise mathematical formulas governing Wealth Sandbox. 
                  Here is the breakdown of rules executed automatically on every 3-second server tick:
                </>
              )}
            </p>

            <div className="space-y-3 font-sans text-xs">
              <div className="p-4 bg-[#08080C] border border-white/5 rounded-xl space-y-1">
                <h4 className="font-bold text-amber-300 font-mono">
                  1. Formule de l'Impôt ISF Virtuel (Wealth Tax)
                </h4>
                <p className="text-gray-400 text-[11px]">
                  <code>SI Solde_Banque &gt; 1 000 000 $ ALORS Prélèvement = (Solde_Banque - 1 000 000 $) * 0,001 par tick</code>.<br/>
                  Gardez votre argent sous forme de Cash sale ou d'actifs immobiliers pour échapper légalement à l'ISF !
                </p>
              </div>

              <div className="p-4 bg-[#08080C] border border-white/5 rounded-xl space-y-1">
                <h4 className="font-bold text-cyan-300 font-mono">
                  2. Simulation Stochastique de la Bourse
                </h4>
                <p className="text-gray-400 text-[11px]">
                  Les prix du Bitcoin, Ethereum, NVIDIA et Tesla utilisent un modèle stochastique de mouvement brownien géométrique avec une volatilité aléatoire comprise entre -3.5% et +3.5% par cycle.
                </p>
              </div>

              <div className="p-4 bg-[#08080C] border border-white/5 rounded-xl space-y-1">
                <h4 className="font-bold text-red-300 font-mono">
                  3. Dégradation du Matériel de Minage
                </h4>
                <p className="text-gray-400 text-[11px]">
                  Les cartes graphiques et ASICs s'usent de 0,5% par tick. Si l'Overclock est activé, l'usure passe à 1,5% par tick. À 0% de durabilité, le matériel ne produit plus aucun Hashrate !
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
