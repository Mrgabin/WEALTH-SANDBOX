import React, { useState } from 'react';
import { FullGlobalState, PlayerProfile } from '../types/wealth';
import { signInWithGoogle } from '../lib/firebase';
import { 
  Rocket,
  Key,
  Cpu, 
  DollarSign, 
  Building2, 
  TrendingUp, 
  Dices, 
  ShieldCheck, 
  Database, 
  Terminal, 
  Sparkles, 
  ChevronRight, 
  Lock, 
  CheckCircle2, 
  Info,
  HelpCircle,
  Zap,
  Globe,
  Award,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface LandingPageProps {
  state: FullGlobalState;
  onLoginSuccess: (playerId: string, updatedState: FullGlobalState) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ state, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'showcase' | 'about' | 'auth'>('showcase');

  // Form State
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const scrollToAuth = () => {
    setActiveTab('auth');
    const authElem = document.getElementById('auth-form-section');
    if (authElem) {
      authElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      const user = result.user;
      if (!user) throw new Error("Impossible d'obtenir les informations de l'utilisateur Google.");

      const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
      const targetEmail = user.email || `${user.displayName?.toLowerCase().replace(/\s+/g, '') || 'googleuser'}@gmail.com`;
      const displayName = user.displayName || targetEmail.split('@')[0];

      // Match existing profile
      const found = Object.values(next.players).find(
        p => p.email.toLowerCase() === targetEmail.toLowerCase()
      );

      if (found) {
        next.current_player_id = found.id;
        next.logs.unshift({
          id: `log_login_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'DB_WRITE',
          uid: found.id,
          message: `CONNEXION GOOGLE AUTH: Utilisateur ${found.name} authentifié avec succès`,
          status: 'OK'
        });

        setLoading(false);
        onLoginSuccess(found.id, next);
      } else {
        const newId = `player_${Date.now().toString().slice(-4)}`;
        const newProfile: PlayerProfile = {
          id: newId,
          name: displayName,
          email: targetEmail,
          password: '',
          role: 'PLAYER',
          cash_dirty: 50000,
          bank_clean: 50000,
          credit_score: 650,
          licenses: [],
          electricity_meter_hacked: false,
          meter_hacked_risk: 0,
          last_active: new Date().toISOString(),
          avatar_color: '#3b82f6'
        };
        next.players[newId] = newProfile;
        next.current_player_id = newId;

        next.logs.unshift({
          id: `log_auth_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'DB_WRITE',
          uid: newId,
          message: `INSCRIPTION GOOGLE AUTH: Compte '${displayName}' (${targetEmail}) enregistré en BDD`,
          status: 'OK'
        });

        setLoading(false);
        onLoginSuccess(newId, next);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur lors de l'authentification Google.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#D1D1D1] font-sans flex flex-col selection:bg-cyan-500/30 selection:text-cyan-300">
      {/* Top Navbar Header */}
      <header className="h-16 border-b border-white/10 bg-[#0A0A0E]/90 backdrop-blur-md px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.4)]">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-wider font-mono">
              WEALTH SANDBOX <span className="text-cyan-400 font-normal">V8.0 OMNI</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              SERVEUR: <span className="text-cyan-300">SÉCURISÉ & EN LIGNE</span>
            </p>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <button
            onClick={() => setActiveTab('showcase')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'showcase' ? 'bg-white/10 text-cyan-300 font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Aperçu du Jeu
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'about' ? 'bg-white/10 text-cyan-300 font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            À Propos & Conception
          </button>
          <button
            onClick={() => scrollToAuth()}
            className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold transition cursor-pointer flex items-center gap-2 shadow-[0_0_12px_rgba(34,211,238,0.2)]"
          >
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            <span>Se Connecter</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12 space-y-16">
        {/* HERO SECTION */}
        <section className="relative rounded-3xl bg-gradient-to-br from-[#0A0A10] via-[#0F0F18] to-[#05050A] border border-cyan-500/30 p-8 md:p-14 overflow-hidden shadow-2xl space-y-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-3xl space-y-5 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> Simulation Économique Full-Stack & Firebase
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight font-sans">
              Bâtissez votre Empire Financier <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400">
                Légal et Clandestin
              </span>
            </h2>

            <p className="text-sm md:text-base text-gray-300 leading-relaxed font-sans">
              Wealth Sandbox est un simulateur économique ultra-réaliste synchronisé en temps réel. 
              Naviguez entre <strong className="text-green-400 font-mono">l'Argent Propre (Banque)</strong> soumis à l'impôt ISF et <strong className="text-amber-400 font-mono">l'Argent Sale (Cash)</strong>, administrez des fermes de minage crypto 24/7, des blanchisseries, des parcs immobiliers et spéculez en Bourse à levier 50x !
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => scrollToAuth()}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold font-mono text-sm uppercase tracking-wider transition cursor-pointer shadow-[0_0_25px_rgba(34,211,238,0.4)] flex items-center gap-3 transform hover:-translate-y-0.5"
              >
                <Rocket className="w-5 h-5" />
                <span>Commencer l'Aventure ($50 000 Offerts)</span>
              </button>

              <button
                onClick={() => setActiveTab('about')}
                className="px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs font-bold transition cursor-pointer flex items-center gap-2"
              >
                <Info className="w-4 h-4 text-purple-400" />
                <span>Découvrir comment le site est conçu</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/10 pt-8 font-mono text-xs">
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-gray-400 block text-[10px] uppercase">Moteur Temps Réel</span>
              <span className="text-cyan-300 font-bold text-sm">Tick Serveur 3s</span>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-gray-400 block text-[10px] uppercase">Base de Données</span>
              <span className="text-purple-300 font-bold text-sm">Firebase Firestore</span>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-gray-400 block text-[10px] uppercase">Impôt ISF Virtuel</span>
              <span className="text-green-300 font-bold text-sm">0.1% au-delà de $1M</span>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-gray-400 block text-[10px] uppercase">Levier Boursier</span>
              <span className="text-amber-300 font-bold text-sm">Jusqu'à 50x</span>
            </div>
          </div>
        </section>

        {/* SECTION: GAME SHOWCASE / PREVIEW EXAMPLES */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full">
              FONCTIONNALITÉS EXCLUSIVES DU JEU
            </span>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">
              À Quoi Consiste Wealth Sandbox ?
            </h3>
            <p className="text-xs text-gray-400 max-w-2xl mx-auto">
              Découvrez tous les modules interconnectés que vous débloquerez dès votre inscription.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Minage Crypto */}
            <div className="bg-[#0F0F16] border border-cyan-500/20 hover:border-cyan-500/50 rounded-2xl p-6 space-y-4 transition group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition">
                <Cpu className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Minage Crypto 24/7 & Hack de Compteur</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Achetez des GPU NVIDIA RTX 4090 ou des ASICs Bitmain S19. Placez-les dans des Data Centers et hackez votre compteur électrique pour éliminer les factures de courant !
              </p>
            </div>

            {/* Feature 2: Circuit Financier */}
            <div className="bg-[#0F0F16] border border-green-500/20 hover:border-green-500/50 rounded-2xl p-6 space-y-4 transition group">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 group-hover:scale-110 transition">
                <DollarSign className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Banque vs Cash Sale & Blanchiment</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Gagnez du Cash clandestin au Casino ou via les enchères P2P. Blanchissez-le dans vos Nightclubs pour transformer votre argent sale en solde bancaire propre.
              </p>
            </div>

            {/* Feature 3: Agences Immobilières */}
            <div className="bg-[#0F0F16] border border-purple-500/20 hover:border-purple-500/50 rounded-2xl p-6 space-y-4 transition group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition">
                <Building2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Immobilier & Parcs Industriels</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Investissez dans des hangars, appartements et data centers. Percevez des loyers récurrents tout en vous acquittant de la taxe foncière municipale de 1%.
              </p>
            </div>

            {/* Feature 4: Trading Bourse */}
            <div className="bg-[#0F0F16] border border-blue-500/20 hover:border-blue-500/50 rounded-2xl p-6 space-y-4 transition group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Trading à Levier & Obligations d'État</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Prenez des positions LONG/SHORT à levier 50x sur le Bitcoin et les actions tech (NVIDIA, Tesla) ou sécurisez vos capitaux dans des Server Bonds garantis à 4%.
              </p>
            </div>

            {/* Feature 5: Casino */}
            <div className="bg-[#0F0F16] border border-amber-500/20 hover:border-amber-500/50 rounded-2xl p-6 space-y-4 transition group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
                <Dices className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Casino, Roulette & Crash Game</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Misez votre Cash sale à la Roulette Européenne, au Crash Game à multiplicateur stochastique ou au Plinko pour multiplier vos liquidités clandestines.
              </p>
            </div>

            {/* Feature 6: Enchères P2P */}
            <div className="bg-[#0F0F16] border border-red-500/20 hover:border-red-500/50 rounded-2xl p-6 space-y-4 transition group">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:scale-110 transition">
                <Database className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Marché P2P & Prêteurs sur Gages</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Échangez du matériel de minage, montres de luxe et coffres-forts aux enchères en Cash direct, ou empruntez du capital auprès de prêt-sur-gages.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION: ABOUT & CONCEPTION DES SITES */}
        {activeTab === 'about' && (
          <section className="bg-[#0F0F16] border border-purple-500/30 rounded-3xl p-8 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <Terminal className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-bold text-white">Comment le Site a été Créé & Architecture Technique</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-300 leading-relaxed font-sans">
              <div className="space-y-3">
                <h4 className="font-bold text-cyan-400 font-mono text-sm uppercase">1. Stack Technique Modern Full-Stack</h4>
                <p>
                  Le site est développé avec **React 18** et **TypeScript** pour garantir un typage parfait de l'état du jeu. L'interface utilise **Tailwind CSS** avec un thème sombre Obsidian (`#050507`) rehaussé d'accents néon cyan et violet.
                </p>
                <p>
                  La compilation rapide et le rechargement à chaud sont gérés par **Vite**, offrant une réactivité instantanée à chaque action du joueur.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-purple-400 font-mono text-sm uppercase">2. Intégration Firebase Firestore (`wealthsand-c07bb`)</h4>
                <p>
                  Chaque joueur possède un document utilisateur dans la base **Firebase Firestore** sous le projet <code className="text-cyan-300">wealthsand-c07bb</code>. 
                </p>
                <p>
                  Les authentifications sont sécurisées par **Firebase Authentication**, permettant de lier l'identifiant UID unique du joueur à son empire financier (solde bancaire, machines de minage, biens immobiliers).
                </p>
              </div>

              <div className="space-y-3 md:col-span-2 bg-[#08080C] p-5 rounded-2xl border border-white/5 space-y-2">
                <h4 className="font-bold text-amber-400 font-mono text-sm uppercase">3. Moteur Économique & Formules Mathématiques</h4>
                <p>
                  • <strong>Boucle de Tick (3 secondes) :</strong> Toutes les 3 secondes, un serveur virtuel simule les revenus de minage, l'usure des cartes graphiques (-0.5%), la consommation électrique ($0.12/kWh) et l'impôt ISF Virtuel (0.1% prélevé sur les comptes banques au-delà de 1 000 000 $).<br/>
                  • <strong>Simulation Boursière Stochastique :</strong> Les cours des crypto-actifs et des actions évoluent selon un mouvement brownien avec volatilité dynamique.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* DEDICATED AUTH SECTION (FORMULES D'INSCRIPTION & CONNEXION) */}
        <section id="auth-form-section" className="scroll-mt-24">
          <div className="max-w-md mx-auto bg-[#0F0F16] border border-cyan-500/40 rounded-3xl p-8 shadow-[0_0_50px_rgba(34,211,238,0.15)] space-y-6 relative">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5" /> CONNEXION SÉCURISÉE
              </div>
              <h3 className="text-2xl font-black text-white font-sans">
                Rejoindre Wealth Sandbox
              </h3>
              <p className="text-xs text-gray-400 font-sans leading-relaxed">
                Connectez-vous instantanément à l'aide de votre compte Google pour créer votre profil de joueur (avec $50,000 offerts) ou reprendre votre progression là où vous vous étiez arrêté.
              </p>
            </div>

            {/* Error Display */}
            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-xs font-mono">
                ⚠ {errorMessage}
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-white hover:bg-white/95 text-black font-extrabold text-xs uppercase tracking-wider transition cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>CONNEXION EN COURS...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>S'identifier avec Google</span>
                </>
              )}
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0A0A0E] py-6 px-6 text-center text-xs text-gray-500 font-mono space-y-2">
        <p>© 2026 WEALTH SANDBOX V8.0 OMNI • TOUS DROITS RÉSERVÉS</p>
        <p className="text-[10px] text-gray-600">Base de données en temps réel • Connexion sécurisée</p>
      </footer>
    </div>
  );
};
