import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, Sparkles, AlertCircle, RefreshCw, LogIn, ArrowRight } from 'lucide-react';
import { TRANSLATIONS, Language } from '../translations';
import { AppUser } from '../types';

interface AuthScreenProps {
  language: Language;
  onLoginSuccess: (user: AppUser) => void;
}

export default function AuthScreen({ language, onLoginSuccess }: AuthScreenProps) {
  const t = TRANSLATIONS[language];
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email) {
      setError(t.enterEmail);
      setLoading(false);
      return;
    }
    if (!password) {
      setError(t.enterPassword);
      setLoading(false);
      return;
    }
    if (!isLogin && !name) {
      setError(t.enterName);
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const body = isLogin ? { email, password } : { email, name, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        console.error("Non-JSON auth response:", text);
        if (text.includes("<!doctype") || text.includes("<html")) {
          throw new Error(`Erreur Serveur (${res.status}): Nahazo valiny HTML fa tsy JSON avy amin'ny mpizara. Andramo indray afaka fotoana fohy.`);
        }
        throw new Error(`Erreur Parse (${res.status}): ${text.substring(0, 100)}`);
      }

      if (!res.ok) {
        throw new Error(data.error || "Misy fahadisoana. Andramo indray.");
      }

      if (data.success && data.user) {
        onLoginSuccess(data.user);
      } else {
        throw new Error("Misy fahadisoana. Tsy tafiditra.");
      }
    } catch (e: any) {
      setError(e.message || "Tsy nahomby ny fifandraisana tamin'ny server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4 min-h-[calc(100vh-140px)] bg-slate-950 text-slate-100 relative overflow-hidden">
      
      {/* Background Ambience elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-700" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-slate-900 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10"
      >
        {/* Brand Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-gradient-to-tr from-amber-500 to-rose-500 p-3.5 rounded-2xl shadow-lg mb-4 text-white">
            <Sparkles className="w-6 h-6 animate-spin-slow" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-black bg-gradient-to-r from-amber-400 via-rose-400 to-emerald-400 bg-clip-text text-transparent tracking-tight">
            {t.appName}
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
            {t.tagline}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-950/40 border border-rose-800/50 rounded-2xl p-3.5 mb-6 flex gap-3 text-rose-300 text-xs items-start">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name (Registration only) */}
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                {t.fullName}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="auth-name-input"
                  required
                  type="text"
                  placeholder="Jean de Dieu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm placeholder:text-slate-600 transition-all text-white"
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              {t.email}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="auth-email-input"
                required
                type="email"
                placeholder="jean@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm placeholder:text-slate-600 transition-all text-white"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              {t.password}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="auth-password-input"
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm placeholder:text-slate-600 transition-all text-white"
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 hover:from-amber-600 hover:via-rose-600 hover:to-emerald-600 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm shrink-0 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : isLogin ? (
              <>
                <span>{t.login}</span>
                <LogIn className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>{t.createAccount}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle between Login and register */}
        <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800 pt-5">
          {isLogin ? (
            <p>
              {t.noAccount}{" "}
              <button
                id="auth-toggle-register"
                onClick={() => {
                  setIsLogin(false);
                  setError(null);
                }}
                className="text-amber-400 hover:text-amber-300 font-bold hover:underline cursor-pointer"
              >
                {t.register}
              </button>
            </p>
          ) : (
            <p>
              {t.haveAccount}{" "}
              <button
                id="auth-toggle-login"
                onClick={() => {
                  setIsLogin(true);
                  setError(null);
                }}
                className="text-amber-400 hover:text-amber-300 font-bold hover:underline cursor-pointer"
              >
                {t.login}
              </button>
            </p>
          )}
        </div>

        {/* Gift hint */}
        {!isLogin && (
          <div className="mt-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-2.5 text-center text-[10px] text-emerald-400">
            🎁 Fisoratana anarana vaovao = <strong>+15 credits gratuit</strong>!
          </div>
        )}

      </motion.div>
    </div>
  );
}
