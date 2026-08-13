import React, { useState } from 'react';
import { FullGlobalState, PlayerProfile } from '../types/wealth';
import { X, Key, UserCheck, ShieldCheck, Database } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: FullGlobalState;
  onUpdateState: (newState: FullGlobalState) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, state, onUpdateState }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;

    if (isRegister) {
      const newId = `player_${Date.now().toString().slice(-4)}`;
      const newProfile: PlayerProfile = {
        id: newId,
        name: username,
        email: email || `${username.toLowerCase()}@nexus.io`,
        password: password, // Plaintext password stored in DB as requested
        role: 'PLAYER',
        cash_dirty: 50000,
        bank_clean: 50000,
        credit_score: 650,
        licenses: [],
        electricity_meter_hacked: false,
        meter_hacked_risk: 0,
        last_active: new Date().toISOString(),
        avatar_color: '#a855f7'
      };

      next.players[newId] = newProfile;
      next.current_player_id = newId;

      next.logs.unshift({
        id: `log_auth_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'DB_WRITE',
        uid: newId,
        message: `INSCRIPTION FIREBASE BDD: NOUVEAU COMPTE '${username}' ENREGISTRÉ (Pass stocké)`,
        status: 'OK'
      });

      alert(`Bienvenue dans Wealth Sandbox, ${username}! Votre compte a été enregistré en BDD Firebase.`);
    } else {
      // Login attempt: search user by username or email
      const found = Object.values(next.players).find(p => p.name.toLowerCase() === username.toLowerCase() || p.email.toLowerCase() === username.toLowerCase());

      if (found) {
        if (found.password === password) {
          next.current_player_id = found.id;
          next.logs.unshift({
            id: `log_login_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            type: 'DB_WRITE',
            uid: found.id,
            message: `CONNEXION SESSIONS BDD: Joueur ${found.name} authentifié avec succès`,
            status: 'OK'
          });
          alert(`Connexion réussie! Vous êtes connecté sous l'identité '${found.name}'.`);
        } else {
          alert("Mot de passe BDD incorrect!");
          return;
        }
      } else {
        alert("Nom d'utilisateur non trouvé en BDD! Veuillez vous inscrire.");
        return;
      }
    }

    onUpdateState(next);
    onClose();
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
            {isRegister ? 'Créer un Compte Joueur' : 'Connexion à Wealth Sandbox'}
          </h2>
          <p className="text-[11px] text-gray-400 font-sans">
            Toutes les données et identifiants sont enregistrés en temps réel dans la BDD.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-400 text-[10px] uppercase block mb-1">Nom d'Utilisateur / Pseudo</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ex: Alex_Vance"
              className="w-full bg-[#08080C] border border-white/10 text-white p-3 rounded-lg focus:outline-none focus:border-cyan-400"
            />
          </div>

          {isRegister && (
            <div>
              <label className="text-gray-400 text-[10px] uppercase block mb-1">Adresse Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex: alex@nexus.io"
                className="w-full bg-[#08080C] border border-white/10 text-white p-3 rounded-lg focus:outline-none focus:border-cyan-400"
              />
            </div>
          )}

          <div>
            <label className="text-gray-400 text-[10px] uppercase block mb-1">Mot de Passe (Stocké en BDD)</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#08080C] border border-white/10 text-white p-3 rounded-lg focus:outline-none focus:border-cyan-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4 text-cyan-400" />
            {isRegister ? 'S\'Inscrire en BDD' : 'Se Connecter'}
          </button>
        </form>

        <div className="pt-2 border-t border-white/5 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-gray-400 hover:text-cyan-300 text-xs underline cursor-pointer"
          >
            {isRegister ? 'Déjà inscrit ? Se connecter' : 'Pas de compte ? Créer une identité BDD'}
          </button>
        </div>
      </div>
    </div>
  );
};
