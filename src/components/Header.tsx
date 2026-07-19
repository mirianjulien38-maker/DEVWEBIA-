import React from 'react';
import { 
  Sparkles, 
  LogOut, 
  User, 
  Shield, 
  CreditCard, 
  Globe, 
  HelpCircle,
  Database,
  Sliders,
  Inbox
} from 'lucide-react';
import { TRANSLATIONS, Language } from '../translations';
import { AppUser } from '../types';

interface HeaderProps {
  user: AppUser | null;
  onLogout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onOpenAdmin: () => void;
  onOpenRecharge: () => void;
  onOpenFaq: () => void;
  onOpenDatabaseSettings: () => void;
  onOpenDatabaseWizard: () => void;
  onOpenLeads: () => void;
}

export default function Header({
  user,
  onLogout,
  language,
  setLanguage,
  onOpenAdmin,
  onOpenRecharge,
  onOpenFaq,
  onOpenDatabaseSettings,
  onOpenDatabaseWizard,
  onOpenLeads
}: HeaderProps) {
  const t = TRANSLATIONS[language];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white py-3 px-4 sm:px-6 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-rose-500 via-amber-500 to-emerald-500 p-2 rounded-xl shadow-lg animate-pulse">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-bold tracking-tight font-display bg-gradient-to-r from-amber-400 via-rose-400 to-emerald-400 bg-clip-text text-transparent">
                {t.appName}
              </h1>
              <span className="text-[10px] bg-emerald-950 border border-emerald-800/80 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase">
                SaaS v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wide">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Dynamic Navigation and User Panel */}
        <div className="flex items-center flex-wrap gap-2.5">
          
          {/* Language Switcher */}
          <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            {(['mg', 'fr', 'en'] as Language[]).map((lang) => (
              <button
                key={lang}
                id={`lang-select-${lang}`}
                onClick={() => setLanguage(lang)}
                className={`px-2 py-1 text-xs font-semibold uppercase rounded-md transition-all cursor-pointer ${
                  language === lang 
                    ? 'bg-slate-700 text-amber-400 shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {user && (
            <>
              {/* Credits Pill */}
              <button
                id="header-recharge-trigger"
                onClick={onOpenRecharge}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-500/30 hover:border-amber-500/80 px-3 py-1.5 rounded-xl cursor-pointer transition-all"
                title={t.rechargeBtn}
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span className="text-xs font-bold text-amber-300">
                  {user.credits} {t.credits}
                </span>
              </button>

               {/* Database Config Panel Actions */}
              <button
                id="header-leads-trigger"
                onClick={onOpenLeads}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 cursor-pointer transition-colors relative"
                title="Hafatra Voaray (Secure Backend Leads)"
              >
                <Inbox className="w-4 h-4 text-emerald-400" />
                {user.submissions && user.submissions.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[8px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full animate-pulse border border-slate-900">
                    {user.submissions.length}
                  </span>
                )}
              </button>

              <button
                id="header-wizard-trigger"
                onClick={onOpenDatabaseWizard}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 cursor-pointer transition-colors"
                title={t.databaseWizard}
              >
                <Database className="w-4 h-4" />
              </button>

              <button
                id="header-dbsettings-trigger"
                onClick={onOpenDatabaseSettings}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 cursor-pointer transition-colors"
                title={t.databaseSettings}
              >
                <Sliders className="w-4 h-4" />
              </button>

              {/* FAQ Button */}
              <button
                id="header-faq-trigger"
                onClick={onOpenFaq}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 cursor-pointer transition-colors"
                title={t.faqTitle}
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {/* Admin Button (only for horlandobe@gmail.com) */}
              {user.isAdmin && (
                <button
                  id="header-admin-trigger"
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1 bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white px-2.5 py-1.5 rounded-xl cursor-pointer transition-all text-xs font-bold"
                  title={t.adminPanel}
                >
                  <Shield className="w-3.5 h-3.5 text-rose-400" />
                  <span>Admin</span>
                </button>
              )}

              {/* User Profile Info & Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="hidden md:block text-right">
                  <div className="text-xs font-bold text-slate-200">{user.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{user.email}</div>
                </div>
                <button
                  id="header-logout-trigger"
                  onClick={onLogout}
                  className="p-2 bg-slate-800/80 hover:bg-rose-600/30 hover:text-rose-400 text-slate-400 rounded-xl cursor-pointer transition-all border border-slate-700/60"
                  title={t.logout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </header>
  );
}
