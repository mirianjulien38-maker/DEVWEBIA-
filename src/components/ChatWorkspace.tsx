import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Sparkles, 
  MessageSquare, 
  RefreshCw, 
  Check, 
  AlertTriangle,
  Flame,
  Wand2,
  ChevronDown,
  Eye,
  Plus
} from 'lucide-react';
import { TRANSLATIONS, Language } from '../translations';
import { ChatMessage, WebSiteProject, PredefinedTemplate } from '../types';
import { PREDEFINED_TEMPLATES } from '../data';

interface ChatWorkspaceProps {
  chatHistory: ChatMessage[];
  currentProject: WebSiteProject | null;
  onGenerate: (prompt: string, refine: boolean) => void;
  isGenerating: boolean;
  language: Language;
  errorMessage: string | null;
  onTogglePreview: () => void;
  onNewProject?: () => void;
}

export default function ChatWorkspace({
  chatHistory,
  currentProject,
  onGenerate,
  isGenerating,
  language,
  errorMessage,
  onTogglePreview,
  onNewProject
}: ChatWorkspaceProps) {
  const t = TRANSLATIONS[language];
  const [inputText, setInputText] = useState("");
  const [refine, setRefine] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest chat messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isGenerating]);

  // Set default refine state based on project existence
  useEffect(() => {
    if (currentProject) {
      setRefine(true);
    } else {
      setRefine(false);
    }
  }, [currentProject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;
    onGenerate(inputText, refine);
    setInputText("");
  };

  const handleSelectTemplate = (tpl: PredefinedTemplate) => {
    onGenerate(tpl.prompt, false);
  };

  return (
    <div className="flex flex-col justify-between h-[calc(100vh-140px)] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      
      {/* Top Status Bar indicator */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800/80 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider truncate max-w-[140px] sm:max-w-[200px]">
              {currentProject ? `${currentProject.name}` : "Hatsarana Tranonkala"}
            </span>
          </div>
          <button
            id="workspace-preview-toggle-btn"
            onClick={onTogglePreview}
            className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-indigo-950 border border-indigo-500/30 shrink-0"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {currentProject && (
            <span className="hidden sm:flex text-[10px] bg-rose-950/80 border border-rose-800/50 text-rose-300 font-bold px-2 py-0.5 rounded-full items-center gap-1">
              <Flame className="w-3 h-3 text-rose-400" /> Active Refinement
            </span>
          )}
          {onNewProject && currentProject && (
            <button
              id="workspace-new-chat-btn"
              onClick={onNewProject}
              className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-amber-950/40 border border-amber-500/30 shrink-0"
              title={t.newChat || "Resaka Vaovao"}
            >
              <Plus className="w-3 h-3" />
              <span>{t.newChat || "Nouveau Chat"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        
        {chatHistory.length === 0 ? (
          /* Empty State / Predefined Templates list */
          <div className="space-y-6 py-6">
            <div className="text-center max-w-sm mx-auto space-y-2">
              <div className="p-3 bg-slate-800/80 rounded-full inline-block text-amber-400">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-slate-200">
                Inona no tranonkala tianao hamboarina?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Mifidiana modely haingana iray etsy ambany, na soraty mivantana eo amin'ny boaty ny hevitrao!
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 max-w-md mx-auto">
              {PREDEFINED_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  id={`preset-tpl-btn-${tpl.id}`}
                  onClick={() => handleSelectTemplate(tpl)}
                  className="p-3.5 bg-slate-950/60 border border-slate-850 hover:bg-slate-800/80 hover:border-amber-500/30 text-left rounded-xl transition-all flex items-start gap-3 cursor-pointer group"
                >
                  <span className="text-2xl p-1.5 bg-slate-900 rounded-lg shrink-0">{tpl.icon}</span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-200 block group-hover:text-amber-300 transition-colors">
                      {tpl.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                      {tpl.description}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat Message bubble rendering */
          <div className="space-y-4">
            {chatHistory.map((msg) => {
              const isAI = msg.sender === 'ai';
              return (
                <div 
                  key={msg.id} 
                  className={`flex ${isAI ? 'justify-start' : 'justify-end'} gap-2.5`}
                >
                  {/* Avatar */}
                  {isAI && (
                    <div className="w-7 h-7 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold">
                      AI
                    </div>
                  )}

                  <div className={`
                    max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm
                    ${isAI 
                      ? 'bg-slate-850 border border-slate-800 text-slate-200 rounded-tl-none' 
                      : 'bg-gradient-to-br from-amber-500 to-rose-500 text-white rounded-tr-none'
                    }
                  `}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    {msg.code && (
                      <div className="mt-2.5 bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[10px] text-emerald-400 max-h-[120px] overflow-y-auto block whitespace-pre">
                        <code>{msg.code.slice(0, 300)}...</code>
                      </div>
                    )}
                    <span className={`block text-[9px] mt-1.5 font-mono text-right ${isAI ? 'text-slate-500' : 'text-rose-100'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* AI Generator Loading skeleton */}
            {isGenerating && (
              <div className="flex justify-start gap-2.5">
                <div className="w-7 h-7 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold animate-spin">
                  AI
                </div>
                <div className="bg-slate-850 border border-slate-800 rounded-2xl rounded-tl-none p-4 text-slate-400 text-xs space-y-2 max-w-[85%] w-64 shadow-md">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span className="font-semibold text-slate-300">Natao tamin'ny alalan'ny Gemini AI...</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full w-full overflow-hidden relative">
                    <div className="h-full bg-amber-500 absolute left-0 top-0 w-1/3 animate-shimmer" />
                  </div>
                </div>
              </div>
            )}

            {/* Error Message rendering inside chat workspace */}
            {errorMessage && (
              <div className="p-3 bg-rose-950/30 border border-rose-900/50 rounded-xl flex gap-2.5 text-rose-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                <div>
                  <span className="font-bold">Fahadisoana:</span>
                  <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

      </div>

      {/* Prompt input Form */}
      <div className="p-4 bg-slate-950 border-t border-slate-800/80 shrink-0">
        <form onSubmit={handleSubmit} className="space-y-3">
          
          <div className="flex items-center justify-between gap-4">
            {/* Toggle Switch Refine existing code */}
            {currentProject && (
              <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 tracking-wider uppercase cursor-pointer select-none">
                <input
                  id="chat-refine-checkbox"
                  type="checkbox"
                  checked={refine}
                  onChange={(e) => setRefine(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-900 text-amber-500 focus:ring-rose-500 h-3.5 w-3.5"
                />
                <span>{t.refinePrompt}</span>
              </label>
            )}
          </div>

          <div className="relative">
            <input
              id="chat-prompt-input"
              required
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.chatPlaceholder}
              disabled={isGenerating}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-4 pr-12 py-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder:text-slate-600 transition-all"
            />
            
            <button
              id="chat-send-btn"
              type="submit"
              disabled={!inputText.trim() || isGenerating}
              className="absolute right-2 top-2 p-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-30 disabled:hover:bg-amber-500"
              title={t.generateBtn}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
