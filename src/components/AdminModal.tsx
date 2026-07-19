import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, X, Check, Trash2, Key, Users, DollarSign, RefreshCw, AlertCircle, Plus } from 'lucide-react';
import { TRANSLATIONS, Language } from '../translations';
import { AppUser } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  user: AppUser | null;
}

export default function AdminModal({
  isOpen,
  onClose,
  language,
  user
}: AdminModalProps) {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'users' | 'payments' | 'keys'>('users');
  const [usersList, setUsersList] = useState<AppUser[]>([]);
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [keysList, setKeysList] = useState<string[]>([]);
  
  const [newKey, setNewKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch admin stats from server on mount/tab open
  const fetchStats = async () => {
    if (!user || user.email !== "horlandobe@gmail.com") return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/dashboard-stats?adminEmail=${user.email}`);
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        console.error("Non-JSON stats response:", text);
        throw new Error(`Erreur parse (${res.status}) rehefa haka stats.`);
      }
      if (!res.ok) throw new Error(data.error || "Failed to load admin stats");
      
      setUsersList(data.users || []);
      setPaymentsList(data.payments || []);
      setKeysList(data.geminiKeys || []);
    } catch (e: any) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Add / Save Keys
  const handleAddKey = () => {
    if (!newKey.trim()) return;
    if (keysList.includes(newKey.trim())) return;
    const updated = [...keysList, newKey.trim()];
    setKeysList(updated);
    setNewKey("");
  };

  const handleRemoveKey = (index: number) => {
    const updated = keysList.filter((_, idx) => idx !== index);
    setKeysList(updated);
  };

  const handleSaveKeys = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/save-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail: user?.email,
          keys: keysList
        })
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        console.error("Non-JSON save-keys response:", text);
        throw new Error(`Erreur parse (${res.status}) rehefa hitahiry keys.`);
      }
      if (!res.ok) throw new Error(data.error);
      
      setKeysList(data.keys || []);
      alert("Voasoratra soa aman-tsara ny rotaka Gemini Keys rehetra!");
    } catch (e: any) {
      setError(e.message || "Failed to save keys");
    } finally {
      setLoading(false);
    }
  };

  // Process Payments: Approve / Reject
  const handleProcessPayment = async (paymentId: string, action: 'approve' | 'reject') => {
    setError(null);
    setLoading(true);
    try {
      const endpoint = `/api/admin/payments/${action}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail: user?.email,
          paymentId
        })
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        console.error("Non-JSON process-payment response:", text);
        throw new Error(`Erreur parse (${res.status}) rehefa handray fandoavana.`);
      }
      if (!res.ok) throw new Error(data.error);

      // Re-fetch stats after approval
      await fetchStats();
    } catch (e: any) {
      setError(e.message || "Failed to process action");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        <button
          id="admin-close-btn"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 bg-slate-850 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl">
              <Shield className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display tracking-tight text-white">
                {t.adminPanel}
              </h3>
              <p className="text-xs text-slate-400">
                Fitantanana SaaS mivantana ho an'ny horlandobe@gmail.com
              </p>
            </div>
          </div>

          <button
            onClick={fetchStats}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white cursor-pointer"
            title="Sintona indray"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs p-3 rounded-2xl flex gap-2 mb-4 items-start">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex bg-slate-950 rounded-2xl p-1 border border-slate-800/80 mb-6">
          <button
            id="admin-tab-users"
            onClick={() => setActiveTab('users')}
            className={`flex-grow py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'users' 
                ? 'bg-rose-600 text-white font-black' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t.userManagement}</span>
          </button>

          <button
            id="admin-tab-payments"
            onClick={() => setActiveTab('payments')}
            className={`flex-grow py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'payments' 
                ? 'bg-rose-600 text-white font-black' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>{t.paymentManagement}</span>
          </button>

          <button
            id="admin-tab-keys"
            onClick={() => setActiveTab('keys')}
            className={`flex-grow py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'keys' 
                ? 'bg-rose-600 text-white font-black' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>{t.geminiKeys}</span>
          </button>
        </div>

        {/* Tab view contents */}
        <div className="min-h-[250px]">
          {activeTab === 'users' && (
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Lisitry ny mpanjifa rehetra</span>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {usersList.map((usr) => (
                  <div key={usr.id} className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex justify-between items-center gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-200">{usr.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{usr.email}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-amber-400 block">{usr.credits} credits</span>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5">{usr.tokensUsed || 0} tokens</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t.pendingPayments}</span>
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {paymentsList.filter(p => p.status === 'pending').length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20 text-xs text-slate-500">
                    Tsy misy fandoavam-bola miandry fankatoavana amin'izao fotoana izao.
                  </div>
                ) : (
                  paymentsList.filter(p => p.status === 'pending').map((p) => (
                    <div key={p.id} className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-100">{p.email}</span>
                          <span className="text-[9px] bg-amber-500/10 text-amber-400 font-bold px-2 py-0.5 rounded-full uppercase">{p.plan}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Ref: <strong className="text-slate-300">{p.transactionRef}</strong> | Phone: <strong className="text-slate-300">{p.senderPhone}</strong>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          id={`admin-reject-payment-${p.id}`}
                          onClick={() => handleProcessPayment(p.id, 'reject')}
                          className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                        >
                          {t.reject}
                        </button>
                        
                        <button
                          id={`admin-approve-payment-${p.id}`}
                          onClick={() => handleProcessPayment(p.id, 'approve')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                        >
                          {t.approve}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'keys' && (
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Fitantanana rotaka Gemini API Keys</span>
              
              <div className="flex gap-2">
                <input
                  id="admin-input-newkey"
                  type="text"
                  placeholder="Ampidiro ny Gemini API Key vaovao..."
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="flex-grow p-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 text-white placeholder:text-slate-700"
                />
                <button
                  id="admin-add-key-btn"
                  onClick={handleAddKey}
                  className="p-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {keysList.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                    Tsy misy Keys mbola tafiditra. Mampiasa ny .env.GEMINI_API_KEY ho fallback ny server.
                  </div>
                ) : (
                  keysList.map((key, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-950/50 border border-slate-850 rounded-xl flex justify-between items-center gap-3">
                      <span className="text-xs font-mono text-slate-400 truncate max-w-[80%]">
                        {key.slice(0, 15)}...{key.slice(-10)}
                      </span>
                      <button
                        onClick={() => handleRemoveKey(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-500 transition-colors"
                        title="Hamafa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <button
                id="admin-save-keys-btn"
                onClick={handleSaveKeys}
                className="w-full py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Hitahiry ny Key rehetra any amin'ny Server
              </button>
            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
}
