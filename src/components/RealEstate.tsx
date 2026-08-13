import React, { useState } from 'react';
import { FullGlobalState, ManagedProperty } from '../types/wealth';
import { Building2, Key, Zap, DollarSign, Home, Warehouse, Server, Sparkles, TrendingUp, Coins, Network, Store } from 'lucide-react';

interface RealEstateProps {
  state: FullGlobalState;
  onUpdateState: (newState: FullGlobalState) => void;
}

export const RealEstate: React.FC<RealEstateProps> = ({ state, onUpdateState }) => {
  const currentPlayer = state.players[state.current_player_id] || Object.values(state.players)[0];

  const availablePropertiesForSale: Omit<ManagedProperty, 'property_id' | 'owner_id' | 'owner_name'>[] = [
    {
      name: 'Garage Résidentiel Suburb',
      type: 'GARAGE',
      rent_monthly: 450,
      estimated_value: 45000,
      power_capacity_kw: 10
    },
    {
      name: 'Hangar Industriel Dock 14',
      type: 'HANGAR',
      rent_monthly: 3200,
      estimated_value: 420000,
      power_capacity_kw: 180
    },
    {
      name: 'Data Center CyberZone 2',
      type: 'DATA_CENTER',
      rent_monthly: 12000,
      estimated_value: 1800000,
      power_capacity_kw: 500
    },

    // === RÉSEAUX TRADITIONNELS & FRANCHISES ===
    {
      name: 'ORPI - Agence Coopérative Immobilière (+1 250 agences)',
      type: 'AGENCY_FRANCHISE',
      rent_monthly: 1600,
      estimated_value: 190000,
      power_capacity_kw: 25
    },
    {
      name: 'Century 21 - Agence Franchise Globale (+950 agences)',
      type: 'AGENCY_FRANCHISE',
      rent_monthly: 2100,
      estimated_value: 240000,
      power_capacity_kw: 30
    },
    {
      name: 'Laforêt Immobilier - Agence Nationale (+700 agences)',
      type: 'AGENCY_FRANCHISE',
      rent_monthly: 1550,
      estimated_value: 180000,
      power_capacity_kw: 22
    },
    {
      name: 'Guy Hoquet - Réseau Multiservices (+500 agences)',
      type: 'AGENCY_FRANCHISE',
      rent_monthly: 1450,
      estimated_value: 170000,
      power_capacity_kw: 20
    },
    {
      name: 'ERA Immobilier - Franchise Européenne (+380 agences)',
      type: 'AGENCY_FRANCHISE',
      rent_monthly: 1350,
      estimated_value: 160000,
      power_capacity_kw: 18
    },
    {
      name: 'Nestenn & L\'Adresse - Agence de Proximité',
      type: 'AGENCY_FRANCHISE',
      rent_monthly: 1300,
      estimated_value: 155000,
      power_capacity_kw: 15
    },
    {
      name: 'Stéphane Plaza Immobilier - Accompagnement & Home Staging (+600 agences)',
      type: 'AGENCY_FRANCHISE',
      rent_monthly: 1850,
      estimated_value: 210000,
      power_capacity_kw: 25
    },

    // === GESTIONNAIRES & ADMINISTRATION DE BIENS ===
    {
      name: 'Foncia (Groupe Emeria) - Bureau Régional Syndic & Copropriétés',
      type: 'ADMIN_BIENS',
      rent_monthly: 11500,
      estimated_value: 1400000,
      power_capacity_kw: 200
    },
    {
      name: 'Citya Immobilier - Cabinet de Gestion Locative',
      type: 'ADMIN_BIENS',
      rent_monthly: 8200,
      estimated_value: 980000,
      power_capacity_kw: 140
    },
    {
      name: 'Nexity - Centre d\'Affaires Promoteur Global',
      type: 'ADMIN_BIENS',
      rent_monthly: 24500,
      estimated_value: 2800000,
      power_capacity_kw: 450
    },

    // === RÉSEAUX DE MANDATAIRES INDÉPENDANTS (100% DIGITAUX) ===
    {
      name: 'IAD France - Pôle de Mandataires Digitaux (+15 000 conseillers)',
      type: 'MANDATAIRE',
      rent_monthly: 3900,
      estimated_value: 450000,
      power_capacity_kw: 10
    },
    {
      name: 'Safti - Hub National de Mandataires Indépendants',
      type: 'MANDATAIRE',
      rent_monthly: 3200,
      estimated_value: 380000,
      power_capacity_kw: 8
    },
    {
      name: 'Capifrance & Optimhome - Antenne de Courtage Sans Agence Physique',
      type: 'MANDATAIRE',
      rent_monthly: 2950,
      estimated_value: 350000,
      power_capacity_kw: 8
    },

    // === IMMOBILIER DE LUXE & PRESTIGE ===
    {
      name: 'Barnes International - Agence Biens d\'Exception Prestige',
      type: 'PRESTIGE',
      rent_monthly: 31000,
      estimated_value: 380000,
      power_capacity_kw: 180
    },
    {
      name: 'Sotheby’s International Realty - Bureau d\'Art & Propriétés d\'Exception',
      type: 'PRESTIGE',
      rent_monthly: 44000,
      estimated_value: 520000,
      power_capacity_kw: 220
    },
    {
      name: 'Engel & Völkers - Agence Allemande Premium segment Ultra-Luxe',
      type: 'PRESTIGE',
      rent_monthly: 35000,
      estimated_value: 410000,
      power_capacity_kw: 190
    },

    // === FONCIÈRES COTÉES (SIIC) & CENTRES COMMERCIAUX ===
    {
      name: 'Unibail-Rodamco-Westfield (URW) - Complexe Centre Commercial Majeur',
      type: 'FONCIERE',
      rent_monthly: 145000,
      estimated_value: 1650000,
      power_capacity_kw: 1200
    },
    {
      name: 'Klepierre - Galeries Commerciales d\'Envergure Europe',
      type: 'FONCIERE',
      rent_monthly: 92000,
      estimated_value: 1100000,
      power_capacity_kw: 850
    },
    {
      name: 'Gecina - Immeubles de Bureaux Haussmanniens (Paris/IDF)',
      type: 'FONCIERE',
      rent_monthly: 120000,
      estimated_value: 1400000,
      power_capacity_kw: 1000
    },
    {
      name: 'Covivio - Parc d\'Hôtels & Bureaux Mixtes Europe',
      type: 'FONCIERE',
      rent_monthly: 78000,
      estimated_value: 950000,
      power_capacity_kw: 750
    },
    {
      name: 'Mercialys - Ensemble Commercial & Galeries Marchandes',
      type: 'FONCIERE',
      rent_monthly: 55000,
      estimated_value: 680000,
      power_capacity_kw: 500
    },

    // === LOGISTIQUE & INDUSTRIE ===
    {
      name: 'Argan - Plateforme Logistique & Entrepôt d\'Envergure',
      type: 'LOGISTIQUE',
      rent_monthly: 23000,
      estimated_value: 290000,
      power_capacity_kw: 600
    },
    {
      name: 'Prologis - Parc de Stockage Logistique Ultra-Connecté',
      type: 'LOGISTIQUE',
      rent_monthly: 48000,
      estimated_value: 580000,
      power_capacity_kw: 1100
    },

    // === SOCIÉTÉS DE GESTION DE SCPI ===
    {
      name: 'Corum L\'Épargne - Portefeuille SCPI Diversifié International',
      type: 'SCPI',
      rent_monthly: 1250,
      estimated_value: 150000,
      power_capacity_kw: 5
    },
    {
      name: 'Sofidy - SCPI de Rendement Commerces & Bureaux Europe',
      type: 'SCPI',
      rent_monthly: 2700,
      estimated_value: 320000,
      power_capacity_kw: 8
    },
    {
      name: 'La Française REM - Épargne Foncière Patrimoniale Historique',
      type: 'SCPI',
      rent_monthly: 4100,
      estimated_value: 480000,
      power_capacity_kw: 12
    },
    {
      name: 'Amundi Immobilier & Primonial REIM - Fonds d\'Actifs Tertiaires & Santé',
      type: 'SCPI',
      rent_monthly: 7300,
      estimated_value: 850000,
      power_capacity_kw: 20
    }
  ];

  const handleBuyProperty = (item: typeof availablePropertiesForSale[0]) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[next.current_player_id];

    const mutationFee = item.estimated_value * 0.08; // 8% property transfer fee
    const totalPrice = item.estimated_value + mutationFee;

    if (player.bank_clean < totalPrice) {
      alert(`Fonds bancaires insuffisants! Requis: $${totalPrice.toLocaleString()} (dont 8% frais de mutation $${mutationFee.toLocaleString()})`);
      return;
    }

    player.bank_clean -= totalPrice;

    const newProp: ManagedProperty = {
      property_id: `prop_${Date.now()}`,
      name: item.name,
      type: item.type,
      owner_id: player.id,
      owner_name: player.name,
      tenant_id: player.id,
      tenant_name: player.name,
      rent_monthly: item.rent_monthly,
      estimated_value: item.estimated_value,
      power_capacity_kw: item.power_capacity_kw
    };

    // Add to first real estate agency
    if (next.real_estate_agencies.length > 0) {
      next.real_estate_agencies[0].managed_properties.push(newProp);
    }

    // Set as new mining farm location if applicable
    next.mining_farms[player.id] = {
      location_id: newProp.property_id,
      location_name: newProp.name,
      power_capacity_watts: newProp.power_capacity_kw * 1000,
      cooling_type: newProp.type === 'DATA_CENTER' ? 'LIQUID' : 'AIR',
      rigs: next.mining_farms[player.id]?.rigs || []
    };

    next.logs.unshift({
      id: `log_prop_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: player.id,
      message: `IMMOBILIER: ${player.name} a acheté '${item.name}' pour $${totalPrice.toLocaleString()} (Capacité élec: ${item.power_capacity_kw} kW)`,
      status: 'OK'
    });

    onUpdateState(next);
  };

  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredProperties = availablePropertiesForSale.filter(prop => {
    if (filterType === 'ALL') return true;
    if (filterType === 'STANDARD') return ['GARAGE', 'HANGAR', 'DATA_CENTER'].includes(prop.type);
    if (filterType === 'FRANCHISE') return prop.type === 'AGENCY_FRANCHISE' || prop.type === 'ADMIN_BIENS';
    if (filterType === 'MANDATAIRE') return prop.type === 'MANDATAIRE';
    if (filterType === 'PRESTIGE') return prop.type === 'PRESTIGE';
    if (filterType === 'FONCIERE') return prop.type === 'FONCIERE' || prop.type === 'LOGISTIQUE';
    if (filterType === 'SCPI') return prop.type === 'SCPI';
    return true;
  });

  const getIconForType = (type: ManagedProperty['type']) => {
    switch (type) {
      case 'GARAGE': return <Home className="w-5 h-5 text-amber-400" />;
      case 'HANGAR': return <Warehouse className="w-5 h-5 text-cyan-400" />;
      case 'DATA_CENTER': return <Server className="w-5 h-5 text-purple-400" />;
      case 'AGENCY_FRANCHISE': return <Store className="w-5 h-5 text-cyan-400" />;
      case 'ADMIN_BIENS': return <Network className="w-5 h-5 text-amber-500" />;
      case 'MANDATAIRE': return <Network className="w-5 h-5 text-blue-400" />;
      case 'PRESTIGE': return <Sparkles className="w-5 h-5 text-yellow-400" />;
      case 'FONCIERE': return <Building2 className="w-5 h-5 text-rose-400" />;
      case 'LOGISTIQUE': return <Warehouse className="w-5 h-5 text-teal-400" />;
      case 'SCPI': return <Coins className="w-5 h-5 text-emerald-400" />;
      default: return <Building2 className="w-5 h-5 text-green-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
          <Building2 className="w-5 h-5 text-cyan-400" />
          Parcs Immobiliers & Agences P2P
        </h1>
        <p className="text-xs text-gray-400">
          Achetez des locaux pour vos fermes de minage ou percevez des loyers et commissions d'agences.
        </p>
      </div>

      {/* Available Properties for Sale */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-3">
          <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
            Offres Immobilières du Serveur (Frais de mutation: 8%)
          </h3>

          {/* Elegant Category Filters */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filterType === 'ALL' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20' : 'text-gray-400 hover:text-white'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterType('STANDARD')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filterType === 'STANDARD' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20' : 'text-gray-400 hover:text-white'
              }`}
            >
              Locaux Standard
            </button>
            <button
              onClick={() => setFilterType('FRANCHISE')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filterType === 'FRANCHISE' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20' : 'text-gray-400 hover:text-white'
              }`}
            >
              Réseaux & Gérance
            </button>
            <button
              onClick={() => setFilterType('MANDATAIRE')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filterType === 'MANDATAIRE' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20' : 'text-gray-400 hover:text-white'
              }`}
            >
              Mandataires
            </button>
            <button
              onClick={() => setFilterType('PRESTIGE')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filterType === 'PRESTIGE' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20' : 'text-gray-400 hover:text-white'
              }`}
            >
              Prestige
            </button>
            <button
              onClick={() => setFilterType('FONCIERE')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filterType === 'FONCIERE' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20' : 'text-gray-400 hover:text-white'
              }`}
            >
              Foncières & Logistique
            </button>
            <button
              onClick={() => setFilterType('SCPI')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filterType === 'SCPI' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20' : 'text-gray-400 hover:text-white'
              }`}
            >
              SCPI Pierre-Papier
            </button>
          </div>
        </div>

        {filteredProperties.length === 0 ? (
          <div className="bg-[#0F0F16] border border-white/5 rounded-xl p-8 text-center text-gray-500 font-mono text-xs">
            Aucun bien immobilier disponible dans cette catégorie.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredProperties.map((prop, idx) => {
              const mutation = prop.estimated_value * 0.08;
              const total = prop.estimated_value + mutation;

              return (
                <div key={idx} className="bg-[#0F0F16] border border-white/5 rounded-xl p-5 space-y-4 hover:border-cyan-500/30 transition shadow-xl">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                      {getIconForType(prop.type)}
                    </div>
                    <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded font-bold uppercase">
                      {prop.type.replace('_', ' ')}
                    </span>
                  </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{prop.name}</h4>
                  <div className="mt-2 space-y-1 font-mono text-xs text-gray-400">
                    <p className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> Puissance: <span className="text-white font-bold">{prop.power_capacity_kw} kW</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-green-400" /> Loyer estimé: <span className="text-green-300">${prop.rent_monthly}/mois</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between font-mono">
                  <div>
                    <p className="text-sm font-bold text-cyan-400">${total.toLocaleString()}</p>
                    <p className="text-[9px] text-gray-500">Val: ${prop.estimated_value.toLocaleString()} + 8% frais</p>
                  </div>

                  <button
                    onClick={() => handleBuyProperty(prop)}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition cursor-pointer"
                  >
                    Acquérir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

      {/* Managed Agencies & Properties List */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-widest text-purple-400 font-bold">
          Agences Immobilières P2P Enregistrées
        </h3>

        {state.real_estate_agencies.map(agency => (
          <div key={agency.agency_id} className="bg-[#0F0F16] border border-white/5 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3 font-mono">
              <div>
                <h4 className="text-sm font-bold text-white">{agency.name}</h4>
                <p className="text-xs text-gray-400">Courtier: <span className="text-cyan-400">{agency.owner_name}</span></p>
              </div>
              <span className="text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded">
                Commission: {(agency.commission_rate * 100).toFixed(0)}%
              </span>
            </div>

            <div className="divide-y divide-white/5 font-mono text-xs">
              {agency.managed_properties.map(p => (
                <div key={p.property_id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-3">
                    {getIconForType(p.type)}
                    <div>
                      <p className="font-bold text-white">{p.name}</p>
                      <p className="text-[10px] text-gray-400">
                        Propriétaire: {p.owner_name} | Locataire: {p.tenant_name || 'Aucun'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-amber-400">{p.power_capacity_kw} kW</span>
                    <span className="text-green-400 font-bold">${p.rent_monthly.toLocaleString()}/mois</span>
                    <span className="text-gray-400 text-[10px]">Taxe foncière (1%/mois): ${(p.estimated_value * 0.01).toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
