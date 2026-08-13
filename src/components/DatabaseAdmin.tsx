import React, { useState } from 'react';
import { FullGlobalState, PlayerProfile } from '../types/wealth';
import { Database, Key, Shield, UserPlus, Download, Lock, RefreshCw, Terminal, Eye, EyeOff } from 'lucide-react';

interface DatabaseAdminProps {
  state: FullGlobalState;
  onUpdateState: (newState: FullGlobalState) => void;
}

export const DatabaseAdmin: React.FC<DatabaseAdminProps> = ({ state, onUpdateState }) => {
  const [showPasswords, setShowPasswords] = useState<boolean>(true);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'raw_db' | 'logs'>('users');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;

    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const newId = `player_${Date.now().toString().slice(-4)}`;

    const newProfile: PlayerProfile = {
      id: newId,
      name: newUsername,
      email: newEmail || `${newUsername.toLowerCase()}@nexus.io`,
      password: newPassword, // Plaintext password stored in DB as requested
      role: 'PLAYER',
      cash_dirty: 50000,
      bank_clean: 50000,
      credit_score: 650,
      licenses: [],
      electricity_meter_hacked: false,
      meter_hacked_risk: 0,
      last_active: new Date().toISOString(),
      avatar_color: '#06b6d4'
    };

    next.players[newId] = newProfile;

    next.logs.unshift({
      id: `log_useradd_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: newId,
      message: `NOUVEL UTILISATEUR BDD CRÉÉ: ${newUsername} (Pass enregistré en BDD)`,
      status: 'OK'
    });

    setNewUsername('');
    setNewEmail('');
    setNewPassword('');

    onUpdateState(next);
    alert(`Joueur '${newUsername}' enregistré avec succès dans la BDD!`);
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wealth_sandbox_db_export_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-red-400 font-bold uppercase tracking-widest bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">
              ACCÈS ROOT ADMIN BDD
            </span>
          </div>
          <h1 className="text-xl font-bold text-white uppercase tracking-tight mt-1 flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            Base de Données Firestore & Synchronisation Firebase
          </h1>
          <p className="text-xs text-gray-400">
            Profils et sessions de jeux synchronisés en direct avec la base Firebase wealthsand-c07bb.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold transition cursor-pointer flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Exporter JSON BDD
          </button>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex bg-[#0F0F16] p-1 rounded-lg border border-white/10 font-mono text-xs w-fit">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-3.5 py-1.5 rounded transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'users' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Key className="w-3.5 h-3.5 text-red-400" /> Utilisateurs & Mots de Passe BDD
        </button>
        <button
          onClick={() => setActiveSubTab('raw_db')}
          className={`px-3.5 py-1.5 rounded transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'raw_db' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5" /> Explorer BDD (JSON State)
        </button>
      </div>

      {/* SUB TAB 1: USERS & PASSWORDS IN DATABASE */}
      {activeSubTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Passwords Table */}
          <div className="lg:col-span-2 bg-[#0F0F16] border border-white/5 rounded-xl p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-3 font-mono">
              <h3 className="text-xs uppercase tracking-widest font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-red-400" /> Comptes & Mots de Passe Stockés en BDD
              </h3>
              <button
                onClick={() => setShowPasswords(!showPasswords)}
                className="text-xs text-cyan-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPasswords ? 'Masquer' : 'Afficher Passwords'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-gray-500 uppercase text-[10px]">
                    <th className="py-2.5 px-3">UID</th>
                    <th className="py-2.5 px-3">Nom Joueur</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Mot de Passe (BDD)</th>
                    <th className="py-2.5 px-3 text-right">Banque (Clean)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(Object.values(state.players) as PlayerProfile[]).map(p => (
                    <tr key={p.id} className="hover:bg-white/5 transition">
                      <td className="py-3 px-3 text-gray-500 text-[10px]">{p.id}</td>
                      <td className="py-3 px-3 font-bold text-cyan-300">{p.name} ({p.role})</td>
                      <td className="py-3 px-3 text-gray-400">{p.email}</td>
                      <td className="py-3 px-3">
                        {showPasswords ? (
                          <span className="bg-red-500/10 border border-red-500/20 text-red-300 px-2 py-0.5 rounded font-bold tracking-wider">
                            {p.password}
                          </span>
                        ) : (
                          <span className="text-gray-500">••••••••</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-green-400">${p.bank_clean.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add User Form */}
          <div className="bg-[#0F0F16] border border-white/5 rounded-xl p-5 space-y-4 shadow-2xl font-mono text-xs">
            <h3 className="text-xs uppercase tracking-widest font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <UserPlus className="w-4 h-4 text-cyan-400" /> Ajouter un Utilisateur en BDD
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="text-gray-400 text-[10px] uppercase block mb-1">Nom d'Utilisateur / Pseudo</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="ex: Hackeur_99"
                  className="w-full bg-[#08080C] border border-white/10 text-white p-2.5 rounded focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-gray-400 text-[10px] uppercase block mb-1">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="ex: hackeur99@nexus.io"
                  className="w-full bg-[#08080C] border border-white/10 text-white p-2.5 rounded focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-gray-400 text-[10px] uppercase block mb-1">Mot de Passe (Stocké en BDD)</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="ex: PassSecret2026!"
                  className="w-full bg-[#08080C] border border-white/10 text-white p-2.5 rounded focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold transition cursor-pointer mt-2"
              >
                Enregistrer en Base de Données
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUB TAB 2: RAW JSON DATABASE STATE EXPLORER */}
      {activeSubTab === 'raw_db' && (
        <div className="bg-[#0F0F16] border border-white/5 rounded-xl p-5 space-y-4 font-mono text-xs shadow-2xl">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="text-xs uppercase tracking-widest font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" /> Structure de Données Globale JSON (JSON State Engine)
            </h3>
            <span className="text-[10px] text-gray-500">Mise à jour en direct à chaque tick</span>
          </div>

          <pre className="bg-[#08080C] p-4 rounded-lg border border-white/5 text-cyan-300/90 max-h-[500px] overflow-auto text-[11px] leading-relaxed">
            {JSON.stringify(state, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
