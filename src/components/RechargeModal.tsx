import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CreditCard, X, Check, Gift, RefreshCw, AlertCircle, Phone, Info } from 'lucide-react';
import { TRANSLATIONS, Language } from '../translations';
import { AppUser } from '../types';

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  user: AppUser | null;
  onUpdateUser: (u: AppUser) => void;
}

export default function RechargeModal({
  isOpen,
  onClose,
  language,
  user,
  onUpdateUser
}: RechargeModalProps) {
  const t = TRANSLATIONS[language];
  const [activePlan, setActivePlan] = useState<"10000ar" | "20000ar" | "50000ar">("10000ar");
  const [phone, setPhone] = useState("");
  const [ref, setRef] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [bonusLoading, setBonusLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClaimBonus = async () => {
    if (!user) return;
    setError(null);
    setSuccessMsg(null);
    setBonusLoading(true);

    try {
      const res = await fetch('/api/claim-free-bonus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        console.error("Non-JSON claim-free-bonus response:", text);
        if (text.includes("<!doctype") || text.includes("<html")) {
          throw new Error(`Erreur Serveur (${res.status}): Nahazo valiny HTML fa tsy JSON avy amin'ny mpizara.`);
        }
        throw new Error(`Erreur Parse (${res.status}): ${text.substring(0, 100)}`);
      }

      if (!res.ok) {
        throw new Error(data.error || t.bonusClaimError);
      }

      if (data.success && data.user) {
        onUpdateUser(data.user);
        setSuccessMsg(t.bonusClaimSuccess);
      }
    } catch (e: any) {
      setError(e.message || t.bonusClaimError);
    } finally {
      setBonusLoading(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    if (!phone || !ref) {
      setError("Fenoy daholo ny banga azafady.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/submit-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          plan: activePlan,
          transactionRef: ref,
          senderPhone: phone
        })
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        console.error("Non-JSON submit-payment response:", text);
        if (text.includes("<!doctype") || text.includes("<html")) {
          throw new Error(`Erreur Serveur (${res.status}): Nahazo valiny HTML fa tsy JSON avy amin'ny mpizara.`);
        }
        throw new Error(`Erreur Parse (${res.status}): ${text.substring(0, 100)}`);
      }

      if (!res.ok) {
        throw new Error(data.error || "Tsy nandeha ny fandefasana fandoavam-bola.");
      }

      setSuccessMsg("Voaray ny fandoavam-bolanao! Handray fanamarinana avy amin'ny Admin ianao vantany vao vita ny fanamarinana.");
      setPhone("");
      setRef("");
    } catch (e: any) {
      setError(e.message || "Misy olana.");
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
        className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        <button
          id="recharge-close-btn"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 bg-slate-850 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white cursor-pointer animate-pulse"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl animate-bounce">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display tracking-tight text-white">
              {t.rechargeTitle}
            </h3>
            <p className="text-xs text-slate-400">
              Hanampy credits hamoronana tranonkala matihanina
            </p>
          </div>
        </div>

        {/* Success / Error Banners */}
        {error && (
          <div className="bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs p-3 rounded-2xl flex gap-2 mb-4 items-start">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs p-3 rounded-2xl flex gap-2 mb-4 items-start animate-pulse">
            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Free Claim Bonus Segment */}
        <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-2xl mb-6 flex flex-col justify-between sm:flex-row items-center gap-3">
          <div className="text-center sm:text-left min-w-0">
            <span className="text-xs font-bold text-emerald-400 block flex items-center gap-1 justify-center sm:justify-start">
              <Gift className="w-4 h-4 text-emerald-400 animate-spin-slow" /> {t.freeBonus}
            </span>
            <span className="text-[10px] text-slate-500 block leading-tight mt-0.5 max-w-[200px]">
              Mangataka +10 credits maimaim-poana. (Max 3 isaky ny 30 andro, cooldown 24h).
            </span>
          </div>
          <button
            id="recharge-claim-bonus-btn"
            onClick={handleClaimBonus}
            disabled={bonusLoading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-900 text-white font-bold text-xs rounded-xl cursor-pointer transition-all shrink-0 flex items-center gap-1"
          >
            {bonusLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
            <span>{t.claimBonus}</span>
          </button>
        </div>

        {/* Plans selector */}
        <div className="space-y-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Misafidiana Plan</span>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: "10000ar", price: "10 000 Ar", credits: "+150 Credits" },
              { id: "20000ar", price: "20 000 Ar", credits: "+300 Credits" },
              { id: "50000ar", price: "50 000 Ar", credits: "+450 Credits" }
            ].map((plan) => (
              <button
                key={plan.id}
                id={`recharge-select-plan-${plan.id}`}
                onClick={() => setActivePlan(plan.id as any)}
                className={`p-3 border rounded-xl text-center transition-all duration-200 cursor-pointer ${
                  activePlan === plan.id
                    ? 'bg-rose-500/10 border-rose-500 shadow-sm'
                    : 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
                }`}
              >
                <span className="text-xs font-bold block text-white">{plan.price}</span>
                <span className="text-[9px] text-slate-400 block mt-1">{plan.credits}</span>
              </button>
            ))}
          </div>

          {/* Payment instructions */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Fomba handoavana vola
            </span>
            <div className="text-[10px] text-slate-400 space-y-1.5 leading-relaxed">
              <p>1. Alefaso any amin'ny laharana <strong>034 00 000 00</strong> (Mvola) na <strong>032 00 000 00</strong> (Orange Money) ny vola araka ny plan safidinao.</p>
              <p>2. Soraty eto ambany ny laharana nandefasanao sy ny <strong>Transaction Reference ID</strong> azonao.</p>
            </div>
          </div>

          {/* Payment Submit Form */}
          <form onSubmit={handleSubmitPayment} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Laharana nandefasana finday</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Phone className="w-3.5 h-3.5" />
                </span>
                <input
                  id="recharge-input-phone"
                  required
                  type="text"
                  placeholder="034 xx xxx xx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Transaction Reference ID</label>
              <input
                id="recharge-input-ref"
                required
                type="text"
                placeholder="Ex: TXN12938102"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs text-white"
              />
            </div>

            <button
              id="recharge-submit-payment-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-bold rounded-2xl text-xs transition-all shadow-lg flex items-center justify-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
              <span>Andefa hohamarinin'ny Admin</span>
            </button>
          </form>
        </div>

      </motion.div>
    </div>
  );
}
