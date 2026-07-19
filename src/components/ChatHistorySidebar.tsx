import React from 'react';
import { 
  Plus, 
  Folder, 
  HelpCircle, 
  CreditCard, 
  Sparkles, 
  ChevronRight, 
  X,
  Code,
  Compass,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { TRANSLATIONS, Language } from '../translations';
import { WebSiteProject } from '../types';

interface ChatHistorySidebarProps {
  projects: WebSiteProject[];
  currentProject: WebSiteProject | null;
  onSelectProject: (p: WebSiteProject) => void;
  onNewProject: () => void;
  language: Language;
  onOpenRecharge: () => void;
  onOpenFaq: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (o: boolean) => void;
}

export default function ChatHistorySidebar({
  projects,
  currentProject,
  onSelectProject,
  onNewProject,
  language,
  onOpenRecharge,
  onOpenFaq,
  isSidebarOpen,
  setIsSidebarOpen
}: ChatHistorySidebarProps) {
  const t = TRANSLATIONS[language];

  return (
    <>
      {/* Mobile Sidebar backdrop overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 z-30 md:hidden backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-[62px] bottom-0 left-0 w-72 bg-slate-900 border-r border-slate-800 z-30 transition-transform duration-300 transform md:translate-x-0 flex flex-col justify-between
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:static md:w-64 lg:w-72'}
      `}>
        
        {/* Main Content Area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-6">
          
          {/* Header Actions */}
          <div className="flex justify-between items-center md:hidden pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mpanampy</span>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* New Project CTA */}
          <button
            id="sidebar-new-project-btn"
            onClick={() => {
              onNewProject();
              setIsSidebarOpen(false); // Auto close on mobile
            }}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newProject}</span>
          </button>

          {/* Project List */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-slate-500" /> {t.myProjects} ({projects.length})
            </span>

            {projects.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-2xl bg-slate-950/30">
                <p className="text-xs text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                  {t.noProjectsYet}
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
                {projects.map((p) => {
                  const isActive = currentProject?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      id={`project-item-${p.id}`}
                      onClick={() => {
                        onSelectProject(p);
                        setIsSidebarOpen(false); // Auto close on mobile
                      }}
                      className={`w-full p-3 rounded-xl text-left border transition-all duration-200 flex items-center justify-between gap-2.5 cursor-pointer group ${
                        isActive 
                          ? 'bg-gradient-to-r from-slate-800 to-slate-850 border-amber-500/50 shadow-sm text-white' 
                          : 'bg-slate-950/30 border-slate-850 hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <div className="min-w-0 flex items-center gap-2">
                        <MessageSquare className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                        <span className="text-xs font-semibold block truncate leading-none">
                          {p.name || "Untitled Applet"}
                        </span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 shrink-0 transition-transform ${isActive ? 'translate-x-0.5' : ''}`} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Prompt Suggestion Shortcuts quick notes */}
          <div className="bg-slate-950/40 border border-slate-800/80 p-3.5 rounded-2xl">
            <span className="text-[10px] font-bold text-amber-500 tracking-wider uppercase block mb-1">
              💡 {t.customPromptTitle}
            </span>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Mampiasà fehezanteny mazava tsara rehefa mandefa baiko ho an'ny Gemini AI. Afaka mangataka fanovana, menus, na effects vaovao koa ianao!
            </p>
          </div>

        </div>

        {/* Dynamic Footer section */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 space-y-2">
          {/* Quick Recharge button */}
          <button
            id="sidebar-recharge-btn"
            onClick={onOpenRecharge}
            className="w-full p-2.5 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700/80 text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{t.rechargeBtn}</span>
          </button>

          {/* Quick FAQ info */}
          <button
            id="sidebar-faq-btn"
            onClick={onOpenFaq}
            className="w-full p-2.5 bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs flex items-center justify-center gap-1 transition-all cursor-pointer rounded-xl"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{t.faqTitle}</span>
          </button>

          <div className="text-[9px] text-slate-600 text-center pt-2">
            DEVWEB IA • Madagasikara 2026
          </div>
        </div>

      </aside>
    </>
  );
}
