import React, { useState } from 'react';
import { FullGlobalState, PlayerProfile } from '../types/wealth';
import { signInWithGoogle } from '../lib/firebase';
import { X, ShieldCheck, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: FullGlobalState;
  onUpdateState: (newState: FullGlobalState) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, state, onUpdateState }) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

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

      // Look if this email already exists in players
      const found = Object.values(next.players).find(p => p.email.toLowerCase() === targetEmail.toLowerCase());

      const activeUser = found || {
        id: `player_${Date.now().toString().slice(-4)}`,
        name: displayName,
        email: targetEmail,
        password: '', // Plaintext password empty for Google Auth
        role: 'PLAYER' as const,
        cash_dirty: 50000,
        bank_clean: 50000,
        credit_score: 650,
        licenses: [],
        electricity_meter_hacked: false,
        meter_hacked_risk: 0,
        last_active: new Date().toISOString(),
        avatar_color: '#a855f7'
      };

      if (!found) {
        next.players[activeUser.id] = activeUser;
      }

      next.current_player_id = activeUser.id;
      next.logs.unshift({
        id: `log_login_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'DB_WRITE',
        uid: activeUser.id,
        message: `CONNEXION GOOGLE AUTH: Joueur ${activeUser.name} authentifié avec succès`,
        status: 'OK'
      });

      alert(`Connexion réussie via Google! Bienvenue ${activeUser.name}.`);
      onUpdateState(next);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur lors de la connexion Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F0F16] border border-cyan-500/30 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl relative font-mono text-xs">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse"></span>
            <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">
              Firebase Auth & Realtime BDD
            </span>
          </div>
          <h2 className="text-lg font-bold text-white font-sans">
            Connexion à Wealth Sandbox
          </h2>
          <p className="text-[11px] text-gray-400 font-sans">
            Connectez-vous de façon instantanée et sécurisée via votre compte Google pour charger et synchroniser votre progression.
          </p>
        </div>

        <div className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
              ⚠ {errorMessage}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
            ) : (
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {loading ? 'Connexion en cours...' : 'Se connecter avec Google'}
          </button>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-center gap-2 text-gray-500 text-[10px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Authentification sécurisée par les serveurs Google & Firebase</span>
        </div>
      </div>
    </div>
  );
};
