import React, { useState } from 'react';
import { FullGlobalState, MiningRig } from '../types/wealth';
import { Cpu, Zap, AlertOctagon, Wrench, Flame, ShieldAlert, CheckCircle2, Sliders, Play, X, RefreshCw } from 'lucide-react';

interface MiningFarmProps {
  state: FullGlobalState;
  onUpdateState: (newState: FullGlobalState) => void;
}

export const MiningFarm: React.FC<MiningFarmProps> = ({ state, onUpdateState }) => {
  const currentPlayer = state.players[state.current_player_id] || Object.values(state.players)[0];
  const farm = state.mining_farms[currentPlayer.id];

  // Overclock mini-game state
  const [selectedRigOC, setSelectedRigOC] = useState<MiningRig | null>(null);
  const [voltage, setVoltage] = useState<number>(1.0); // 0.8 to 1.3V
  const [frequency, setFrequency] = useState<number>(2000); // 1500 to 2800 MHz
  const [ocError, setOcError] = useState<string | null>(null);
  const [ocSuccess, setOcSuccess] = useState<string | null>(null);

  // Meter bypass state
  const [isHackingMeter, setIsHackingMeter] = useState<boolean>(false);
  const [relays, setRelays] = useState<number[]>([35, 60, 42]); // Target is exactly 50 for all three
  const [hackSteps, setHackSteps] = useState<number>(0);
  const [hackStatus, setHackStatus] = useState<'IDLE' | 'FAILED' | 'SUCCESS'>('IDLE');

  // Overclock action submission
  const handleTestOverclock = () => {
    if (!selectedRigOC) return;

    // Mathematical sweet spot formula
    // Ideal Voltage for frequency: e.g. at 1500MHz ideal is 0.85V, at 2800MHz ideal is 1.25V
    const idealVoltage = 0.85 + ((frequency - 1500) / 1300) * 0.40;
    const diff = Math.abs(voltage - idealVoltage);

    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const currentFarm = next.mining_farms[currentPlayer.id];
    if (!currentFarm) return;
    const rig = currentFarm.rigs.find(r => r.rig_id === selectedRigOC.rig_id);
    if (!rig) return;

    if (diff <= 0.04) {
      // SUCCESS
      rig.overclocked = true;
      rig.wear_condition = Math.max(0.01, rig.wear_condition - 0.05); // immediate slight wear from tuning stress
      setOcSuccess(`STABILITÉ ASSURÉE ! Tension de ${voltage.toFixed(2)}V parfaite pour ${frequency} MHz. L'Overclock est validé (+25% de hashrate).`);
      setOcError(null);

      next.logs.unshift({
        id: `log_oc_ok_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'MINING',
        uid: currentPlayer.id,
        message: `TUNING REUSSI: ${rig.name} optimisé avec succès à ${voltage.toFixed(2)}V / ${frequency}MHz!`,
        status: 'OK'
      });

      // Update state in 2 seconds and close
      setTimeout(() => {
        onUpdateState(next);
        setSelectedRigOC(null);
        setOcSuccess(null);
      }, 2500);

    } else if (voltage < idealVoltage) {
      // FAILURE: Under-volt crash
      rig.overclocked = false;
      rig.wear_condition = Math.max(0, rig.wear_condition - 0.25); // high damage
      setOcError(`CRASH SYSTEME ! Tension de ${voltage.toFixed(2)}V trop basse pour alimenter ${frequency} MHz. Le matériel a subi un court-circuit (-25% de durabilité).`);
      setOcSuccess(null);

      next.logs.unshift({
        id: `log_oc_crash_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'MINING',
        uid: currentPlayer.id,
        message: `CRASH MATÉRIEL: Sous-tension critique sur ${rig.name}! Le rig s'est éteint en urgence.`,
        status: 'WARN'
      });

      setTimeout(() => {
        onUpdateState(next);
        setSelectedRigOC(null);
        setOcError(null);
      }, 3500);

    } else {
      // FAILURE: Over-volt heat damage
      rig.overclocked = false;
      rig.wear_condition = Math.max(0, rig.wear_condition - 0.40); // massive damage
      setOcError(`SURCHAUFFE CRITIQUE ! Tension de ${voltage.toFixed(2)}V trop élevée. Le GPU a fondu sous l'effet de la chaleur (-40% de durabilité).`);
      setOcSuccess(null);

      next.logs.unshift({
        id: `log_oc_heat_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'MINING',
        uid: currentPlayer.id,
        message: `INCENDIE ÉVITÉ: Surtension thermique sur ${rig.name}! Dégâts de chaleur extrêmes.`,
        status: 'ALERT'
      });

      setTimeout(() => {
        onUpdateState(next);
        setSelectedRigOC(null);
        setOcError(null);
      }, 3500);
    }
  };

  // Adjust Relay frequency for meter hacking
  const adjustRelay = (index: number, delta: number) => {
    setRelays(prev => {
      const copy = [...prev];
      copy[index] = Math.max(20, Math.min(80, copy[index] + delta));
      return copy;
    });
    setHackSteps(s => s + 1);
  };

  // Submit Electric meter bypass
  const submitBypassHack = () => {
    // Relays must all be close to exactly 50 Hz (balanced phase bypass)
    const isSuccess = relays.every(r => Math.abs(r - 50) <= 2);
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id];

    if (isSuccess) {
      setHackStatus('SUCCESS');
      player.electricity_meter_hacked = true;

      next.logs.unshift({
        id: `log_bypass_success_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'MINING',
        uid: player.id,
        message: `INTRUSION COMPTEUR: ${player.name} a réussi à ponter la phase du compteur d'électricité ! Factures à $0/kWh.`,
        status: 'ALERT'
      });

      setTimeout(() => {
        onUpdateState(next);
        setIsHackingMeter(false);
        setHackStatus('IDLE');
        setRelays([35, 60, 42]);
        setHackSteps(0);
      }, 2500);

    } else {
      setHackStatus('FAILED');
      player.electricity_meter_hacked = false;
      // Consequences! Tax/Police Audit surprise with huge fine
      const fine = 35000;
      player.bank_clean = Math.max(0, player.bank_clean - fine);
      player.credit_score = Math.max(300, player.credit_score - 100); // Massive hit to credit score

      // Trigger Grand Event Popup
      next.active_event = {
        id: `event_audit_${Date.now()}`,
        title: "ALERTE SÉCURITÉ : FRAUDE DÉTECTÉE !",
        description: `Le gestionnaire du réseau électrique national (OmniGrid) a intercepté une tentative de déphasage et de pontage sur votre compteur. Des inspecteurs des impôts escortés par la gendarmerie sont intervenus en urgence.`,
        type: 'TAX_AUDIT',
        severity: 'CRITICAL',
        impactText: `Amende de $${fine.toLocaleString()} prélevée directement sur votre compte. Votre score de crédit est détruit (-100 points).`
      };

      next.logs.unshift({
        id: `log_bypass_fail_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'TAX_ISF',
        uid: player.id,
        message: `AUDIT SÉVÈRE: Tentative avortée de piratage électrique par ${player.name}. Saisie immédiate de $${fine.toLocaleString()} !`,
        status: 'ALERT'
      });

      setTimeout(() => {
        onUpdateState(next);
        setIsHackingMeter(false);
        setHackStatus('IDLE');
        setRelays([35, 60, 42]);
        setHackSteps(0);
      }, 3000);
    }
  };

  // Standard safe toggle off
  const handleDisableMeterHack = () => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id];
    player.electricity_meter_hacked = false;

    next.logs.unshift({
      id: `log_hack_off_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'MINING',
      uid: player.id,
      message: `ÉLECTRICITÉ: ${player.name} a retiré le bypass du compteur électrique. Retour au tarif civil légal.`,
      status: 'OK'
    });

    onUpdateState(next);
  };

  // Repair rig wear
  const handleRepairRig = (rigId: string) => {
    const next = JSON.parse(JSON.stringify(state)) as FullGlobalState;
    const player = next.players[currentPlayer.id];
    const currentFarm = next.mining_farms[currentPlayer.id];
    if (!currentFarm) return;

    const rig = currentFarm.rigs.find(r => r.rig_id === rigId);
    if (!rig) return;

    const repairCost = Math.round((1 - rig.wear_condition) * 2000);
    if (player.bank_clean < repairCost) {
      alert(`Solde bancaire insuffisant pour la réparation! Requis: $${repairCost}`);
      return;
    }

    player.bank_clean -= repairCost;
    rig.wear_condition = 1.0;

    next.logs.unshift({
      id: `log_repair_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'DB_WRITE',
      uid: player.id,
      message: `RÉPARATION: ${rig.name} restauré à 100% d'efficience pour $${repairCost}`,
      status: 'OK'
    });

    onUpdateState(next);
  };

  if (!farm || !farm.rigs || farm.rigs.length === 0) {
    return (
      <div className="bg-[#0F0F16] border border-white/5 rounded-xl p-8 text-center space-y-4 font-mono">
        <Cpu className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
        <h2 className="text-lg font-bold text-white">Aucune Ferme de Minage Active</h2>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          Rendez-vous dans la rubrique <span className="text-cyan-400">Marchés & P2P</span> pour acheter des cartes graphiques réelles (RTX 4090, RX 7900 XTX) ou des ASICs de pointe, puis installez-les dans vos hangars.
        </p>
      </div>
    );
  }

  let totalWatts = 0;
  let totalHashrate = 0;
  farm.rigs.forEach(r => {
    if (r.wear_condition > 0.05) {
      const oc = r.overclocked ? 1.25 : 1.0;
      const coolingBoost = (farm.cooling_type === 'LIQUID' && r.hashrate_th > 0) ? 1.08 : 1.0;
      totalWatts += r.watts_consumption * oc;
      totalHashrate += r.hashrate_th * r.wear_condition * oc * coolingBoost;
    }
  });

  const dailyKWh = (totalWatts / 1000) * 24;
  const electricityCostDaily = currentPlayer.electricity_meter_hacked ? 0 : dailyKWh * state.server_config.electricity_kwh_rate;

  return (
    <div className="space-y-6">
      {/* Top Farm Stats Header */}
      <div className="bg-[#0F0F16] border border-cyan-500/20 p-5 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest">
                INFRANODE CRYPTO MINING 24/7
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Refroidissement: {farm.cooling_type}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1">
              Ferme de Minage: <span className="text-cyan-400">{farm.location_name}</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {currentPlayer.electricity_meter_hacked ? (
              <button
                onClick={handleDisableMeterHack}
                className="px-4 py-2 rounded-lg font-mono text-xs font-bold transition cursor-pointer bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)] flex items-center gap-2"
                title="Désactiver le bypass et redevenir légal"
              >
                <ShieldAlert className="w-4 h-4" />
                Désactiver Vol d'Élec
              </button>
            ) : (
              <button
                onClick={() => setIsHackingMeter(true)}
                className="px-4 py-2 rounded-lg font-mono text-xs font-bold transition cursor-pointer bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-2"
                title="Piratage physique délicat du compteur pour électricité gratuite"
              >
                <Zap className="w-4 h-4 text-green-400" />
                Pirater le Compteur
              </button>
            )}
          </div>
        </div>

        {/* Real-time Mining Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="bg-[#08080C] p-3.5 rounded-lg border border-white/5 space-y-1">
            <p className="text-gray-400 text-[10px] uppercase">Puissance Hashrate Total</p>
            <p className="text-xl font-extrabold text-cyan-400">{Math.round(totalHashrate).toLocaleString()} TH/s</p>
          </div>

          <div className="bg-[#08080C] p-3.5 rounded-lg border border-white/5 space-y-1">
            <p className="text-gray-400 text-[10px] uppercase">Consommation Électrique</p>
            <p className="text-xl font-extrabold text-amber-400">
              {(totalWatts / 1000).toFixed(1)} kW <span className="text-xs text-gray-500">/ {(farm.power_capacity_watts / 1000)} kW Max</span>
            </p>
          </div>

          <div className="bg-[#08080C] p-3.5 rounded-lg border border-white/5 space-y-1">
            <p className="text-gray-400 text-[10px] uppercase">Coût Électrique Estimé / 24h</p>
            <p className="text-xl font-extrabold text-green-400">
              ${electricityCostDaily.toFixed(2)}
              {currentPlayer.electricity_meter_hacked && <span className="text-xs text-red-400 font-normal"> (GRATUIT • PIRATE)</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Rigs Hardware Inventory */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
          Matériels & Rigs Installés ({farm.rigs.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {farm.rigs.map(rig => {
            const wearPercent = Math.round(rig.wear_condition * 100);
            const repairCost = Math.round((1 - rig.wear_condition) * 2000);

            return (
              <div key={rig.rig_id} className={`bg-[#0F0F16] border rounded-xl p-4 space-y-4 shadow-xl hover:border-cyan-500/30 transition ${
                rig.type === 'WATERCOOLING' ? 'border-cyan-500/20 shadow-cyan-950/10' : 'border-white/5'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">{rig.type}</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{rig.name}</h4>
                  </div>
                  {rig.type === 'WATERCOOLING' ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-bold animate-pulse">
                      LIQUID ACTIVE
                    </span>
                  ) : rig.overclocked && (
                    <span className="flex items-center gap-1 text-[10px] font-mono bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-bold animate-pulse">
                      <Flame className="w-3 h-3" /> OC +25%
                    </span>
                  )}
                </div>

                <div className="space-y-2 font-mono text-xs">
                  {rig.type === 'WATERCOOLING' ? (
                    <>
                      <div className="flex justify-between text-gray-400">
                        <span>Refroidissement:</span>
                        <span className="text-cyan-400 font-bold">ACTIF (LIQUID)</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Usure globale rigs:</span>
                        <span className="text-green-400 font-bold">DIVISÉE PAR 2</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-gray-400">
                      <span>Hashrate Efficace:</span>
                      <span className="text-white font-bold">
                        {Math.round(rig.hashrate_th * rig.wear_condition * (rig.overclocked ? 1.25 : 1) * (farm.cooling_type === 'LIQUID' ? 1.08 : 1)).toLocaleString()} TH/s
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-400">
                    <span>Conso Watt:</span>
                    <span className="text-amber-300 font-bold">{Math.round(rig.watts_consumption * (rig.overclocked ? 1.25 : 1))} W</span>
                  </div>

                  {/* Wear Condition Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-400">Condition Hardware:</span>
                      <span className={wearPercent > 50 ? 'text-green-400' : 'text-red-400'}>{wearPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#08080C] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${wearPercent > 50 ? 'bg-green-400 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}
                        style={{ width: `${wearPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Controls: Overclock tuner & Repair button */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 font-mono text-xs">
                  {rig.type === 'WATERCOOLING' ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      Refroidissement Connecté
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedRigOC(rig);
                        setVoltage(1.0);
                        setFrequency(2000);
                      }}
                      className={`px-3 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 text-[11px] font-bold ${
                        rig.overclocked
                          ? 'bg-red-500/20 border-red-500/40 text-red-300'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      {rig.overclocked ? 'Réajuster OC' : 'Overclocker'}
                    </button>
                  )}

                  {wearPercent < 95 && (
                    <button
                      onClick={() => handleRepairRig(rig.rig_id)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 transition cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      Réparer (${repairCost})
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* OVERCLOCKING TUNER INTERACTIVE MODAL */}
      {selectedRigOC && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0A0E] border border-cyan-500/30 max-w-lg w-full rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.15)] flex flex-col">
            <div className="bg-[#0F0F16] border-b border-white/10 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-400 animate-pulse" />
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                  Hardware Overclocking & Calibration
                </h3>
              </div>
              <button 
                onClick={() => setSelectedRigOC(null)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-[#08080C] border border-white/5 p-4 rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">{selectedRigOC.type}</span>
                <h4 className="text-base font-bold text-white">{selectedRigOC.name}</h4>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Trouvez l'équilibre exact de tension (Voltage) pour supporter la fréquence ciblée. Une tension trop basse provoquera une panne, tandis qu'une tension excessive fera fondre le silicium !
                </p>
              </div>

              {/* Sliders */}
              <div className="space-y-4">
                {/* Slider 1: Frequency */}
                <div className="space-y-2">
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-gray-400">Fréquence Core GPU:</span>
                    <span className="text-cyan-300 font-bold">{frequency} MHz</span>
                  </div>
                  <input
                    type="range"
                    min="1500"
                    max="2800"
                    step="50"
                    value={frequency}
                    onChange={(e) => setFrequency(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-600 font-mono">
                    <span>1500 MHz (Eco)</span>
                    <span>2800 MHz (Extrême)</span>
                  </div>
                </div>

                {/* Slider 2: Voltage */}
                <div className="space-y-2">
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-gray-400">Tension Core (VDD):</span>
                    <span className="text-amber-400 font-bold">{voltage.toFixed(2)} V</span>
                  </div>
                  <input
                    type="range"
                    min="0.80"
                    max="1.30"
                    step="0.01"
                    value={voltage}
                    onChange={(e) => setVoltage(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-600 font-mono">
                    <span>0.80 V (Undervolt)</span>
                    <span>1.30 V (Surtension)</span>
                  </div>
                </div>
              </div>

              {/* Status and Logs */}
              {ocError && (
                <div className="bg-red-500/15 border border-red-500/30 p-4 rounded-xl text-red-400 font-mono text-xs leading-relaxed flex gap-2">
                  <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{ocError}</span>
                </div>
              )}

              {ocSuccess && (
                <div className="bg-green-500/15 border border-green-500/30 p-4 rounded-xl text-green-400 font-mono text-xs leading-relaxed flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <span>{ocSuccess}</span>
                </div>
              )}

              {/* Action Button */}
              {!ocSuccess && !ocError && (
                <button
                  onClick={handleTestOverclock}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-amber-600 hover:from-red-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider font-mono transition flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" /> Tester la stabilité & overclocker
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ELECTRIC METER BYPASS HACK INTERACTIVE MODAL */}
      {isHackingMeter && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0A0E] border border-red-500/30 max-w-lg w-full rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.2)] flex flex-col">
            <div className="bg-[#0F0F16] border-b border-white/10 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                  PIRATAGE DU COMPTEUR ÉLECTRIQUE
                </h3>
              </div>
              <button 
                onClick={() => {
                  if (hackStatus === 'IDLE') {
                    setIsHackingMeter(false);
                  }
                }}
                disabled={hackStatus !== 'IDLE'}
                className="text-gray-400 hover:text-white transition disabled:opacity-20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl space-y-2">
                <h4 className="text-xs font-mono font-bold text-red-400 uppercase">Attention aux répercussions !</h4>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  Pour contourner le compteur d'OmniGrid, vous devez **déphaser les 3 relais d'alimentation** et stabiliser leur fréquence harmonique à exactement **50 Hz** (+/- 2 Hz) afin d'éviter la coupure de sécurité.
                </p>
                <p className="text-[11px] text-amber-400 font-mono">
                  ⚠️ Si vous soumettez un bypass déséquilibré, OmniGrid enverra automatiquement le fisc chez vous !
                </p>
              </div>

              {/* Relays Tuning */}
              <div className="space-y-4">
                {relays.map((freq, idx) => {
                  const balanced = Math.abs(freq - 50) <= 2;
                  return (
                    <div key={idx} className="bg-[#08080C] border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4 font-mono text-xs">
                      <div>
                        <p className="text-gray-400 text-[10px] uppercase">Relais de phase 0{idx + 1}</p>
                        <p className={`text-base font-extrabold mt-1 ${balanced ? 'text-green-400' : 'text-amber-400'}`}>
                          {freq} Hz {balanced && '✓ Balanced'}
                        </p>
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={() => adjustRelay(idx, -5)}
                          disabled={hackStatus !== 'IDLE'}
                          className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded text-red-400 font-bold transition disabled:opacity-20 cursor-pointer"
                        >
                          -5 Hz
                        </button>
                        <button
                          onClick={() => adjustRelay(idx, -1)}
                          disabled={hackStatus !== 'IDLE'}
                          className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded text-red-400 font-bold transition disabled:opacity-20 cursor-pointer"
                        >
                          -1 Hz
                        </button>
                        <button
                          onClick={() => adjustRelay(idx, 1)}
                          disabled={hackStatus !== 'IDLE'}
                          className="px-2.5 py-1 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded text-green-400 font-bold transition disabled:opacity-20 cursor-pointer"
                        >
                          +1 Hz
                        </button>
                        <button
                          onClick={() => adjustRelay(idx, 5)}
                          disabled={hackStatus !== 'IDLE'}
                          className="px-2.5 py-1 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded text-green-400 font-bold transition disabled:opacity-20 cursor-pointer"
                        >
                          +5 Hz
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status and Action */}
              {hackStatus === 'SUCCESS' && (
                <div className="bg-green-500/15 border border-green-500/30 p-4 rounded-xl text-green-400 font-mono text-xs leading-relaxed flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <span>DÉPHASAGE VALIDÉ ! Compteur intercepté avec succès. Électricité gratuite active.</span>
                </div>
              )}

              {hackStatus === 'FAILED' && (
                <div className="bg-red-500/15 border border-red-500/30 p-4 rounded-xl text-red-400 font-mono text-xs leading-relaxed flex gap-2">
                  <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>COURT-CIRCUIT ! Alerte de sabotage reçue chez OmniGrid. Des inspecteurs arrivent chez vous !</span>
                </div>
              )}

              {hackStatus === 'IDLE' && (
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={submitBypassHack}
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-amber-600 hover:from-red-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider font-mono transition flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Activer le bypass ({hackSteps} ajustements)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
