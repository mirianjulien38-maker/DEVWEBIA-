import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sliders, X, Check, Database, Save, Trash2 } from 'lucide-react';
import { TRANSLATIONS, Language } from '../translations';

interface DatabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export default function DatabaseSettingsModal({
  isOpen,
  onClose,
  language
}: DatabaseSettingsModalProps) {
  const t = TRANSLATIONS[language];
  const [firebaseConfig, setFirebaseConfig] = useState("");
  const [supabaseConfig, setSupabaseConfig] = useState("");
  const [saved, setSaved] = useState(false);
  const [serverSupabaseStatus, setServerSupabaseStatus] = useState<{
    isConfigured: boolean;
    url: string | null;
    keyType: string | null;
  } | null>(null);

  // Load configuration from localStorage on mount and fetch server Supabase status
  useEffect(() => {
    if (isOpen) {
      const fb = localStorage.getItem('devweb-ia-firebase-config') || "";
      const sb = localStorage.getItem('devweb-ia-supabase-config') || "";
      setFirebaseConfig(fb);
      setSupabaseConfig(sb);

      fetch('/api/supabase-status')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setServerSupabaseStatus({
              isConfigured: data.isConfigured,
              url: data.url,
              keyType: data.keyType
            });
          }
        })
        .catch(err => console.error("Failed to fetch Supabase server status:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('devweb-ia-firebase-config', firebaseConfig);
    localStorage.setItem('devweb-ia-supabase-config', supabaseConfig);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    localStorage.removeItem('devweb-ia-firebase-config');
    localStorage.removeItem('devweb-ia-supabase-config');
    setFirebaseConfig("");
    setSupabaseConfig("");
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-2xl relative"
      >
        <button
          id="dbsettings-close-btn"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 bg-slate-850 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display tracking-tight text-white">
              {t.databaseSettings}
            </h3>
            <p className="text-xs text-slate-400">
              {t.customWebConfig}
            </p>
          </div>
        </div>

        {/* Configurations input area */}
        <div className="space-y-4 mb-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-amber-500" /> Google Firebase Creds
            </label>
            <textarea
              id="dbsettings-firebase-creds"
              value={firebaseConfig}
              onChange={(e) => setFirebaseConfig(e.target.value)}
              placeholder='{"apiKey": "...", "projectId": "..."}'
              className="w-full h-20 p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[10px] text-emerald-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-indigo-400" /> Supabase postgres Creds
            </label>
            <textarea
              id="dbsettings-supabase-creds"
              value={supabaseConfig}
              onChange={(e) => setSupabaseConfig(e.target.value)}
              placeholder='{"url": "...", "anonKey": "..."}'
              className="w-full h-20 p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[10px] text-emerald-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {serverSupabaseStatus && (
            <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-1">
              <span className="text-[9px] font-bold text-indigo-400 block uppercase tracking-wider">Server SaaS Connection Status</span>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${serverSupabaseStatus.isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="text-[11px] text-slate-300 font-medium">
                  {serverSupabaseStatus.isConfigured 
                    ? `Tafiditra soa aman-tsara (URL: ${serverSupabaseStatus.url})` 
                    : "Mbola tsy mifandray amin'ny Supabase ny Server"}
                </span>
              </div>
              <span className="text-[9px] text-slate-500 block leading-normal mt-1">
                {serverSupabaseStatus.isConfigured 
                  ? `Miasa ny sync automatique ho an'ny tranonkala rehetra amboarinao. (${serverSupabaseStatus.keyType === 'service_role' ? 'Service Role Key' : 'Anon Key'} no ampiasaina)`
                  : "Mampiasa 'Mock Sync' ny rafitra ho fallback rehefa mamorona tranonkala."}
              </span>
            </div>
          )}
        </div>

        {/* Actions buttons */}
        <div className="flex gap-3 justify-end">
          <button
            id="dbsettings-clear-btn"
            onClick={handleClear}
            className="px-4 py-2.5 bg-slate-800/80 hover:bg-rose-650/20 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Fafana</span>
          </button>

          <button
            id="dbsettings-save-btn"
            onClick={handleSave}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            {saved ? <Check className="w-3.5 h-3.5 text-white" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saved ? 'Saved!' : t.saveConfig}</span>
          </button>
        </div>

      </motion.div>
    </div>
  );
}
