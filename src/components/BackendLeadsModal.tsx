import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Inbox, X, Trash2, Calendar, Globe, Sparkles, ShieldCheck, Code2, Search, Check, Copy } from 'lucide-react';
import { TRANSLATIONS, Language } from '../translations';
import { AppUser, FormSubmission } from '../types';

interface BackendLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  user: AppUser | null;
  onUpdateUser: (updatedUser: AppUser) => void;
}

export default function BackendLeadsModal({
  isOpen,
  onClose,
  language,
  user,
  onUpdateUser
}: BackendLeadsModalProps) {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'submissions' | 'apiDocs'>('submissions');
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const submissions: FormSubmission[] = user?.submissions || [];

  const filteredSubmissions = submissions.filter(sub => {
    const projMatch = sub.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const formMatch = sub.formName.toLowerCase().includes(searchTerm.toLowerCase());
    const dataMatch = JSON.stringify(sub.data).toLowerCase().includes(searchTerm.toLowerCase());
    return projMatch || formMatch || dataMatch;
  }).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  const handleDelete = async (subId: string) => {
    if (!user?.email) return;
    setIsDeleting(subId);
    try {
      const res = await fetch('/api/user/submissions/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          submissionId: subId
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        onUpdateUser(data.user);
      }
    } catch (e) {
      console.error("Failed to delete submission:", e);
    } finally {
      setIsDeleting(null);
    }
  };

  const protocol = window.location.protocol;
  const host = window.location.host;
  const submitUrl = `${protocol}//${host}/api/public/submit`;

  const apiSnippet = `<!-- Kaody fampifandraisana Formulaire amin'ny Backend-nao -->
<form id="secure-contact-form">
  <div>
    <label>Anarana</label>
    <input type="text" name="name" required />
  </div>
  <div>
    <label>Email</label>
    <input type="email" name="email" required />
  </div>
  <div>
    <label>Hafatra</label>
    <textarea name="message" required></textarea>
  </div>
  <button type="submit">Alefaso</button>
</form>

<script>
  document.getElementById('secure-contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    try {
      const response = await fetch('${submitUrl}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: "${user?.email || 'your-email@example.com'}",
          projectName: "Tetikasa",
          formName: "Fifandraisana",
          data: Object.fromEntries(formData)
        })
      });
      
      const result = await response.json();
      if (response.ok && result.success) {
        alert("Tafiditra soa aman-tsara ny hafatrao!");
        form.reset();
      } else {
        alert("Nisy olana: " + result.error);
      }
    } catch (error) {
      alert("Tsy nety ny fifandraisana amin'ny Backend server.");
    }
  });
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(apiSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="max-w-3xl w-full h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-2xl relative flex flex-col"
      >
        <button
          id="leads-close-btn"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 bg-slate-850 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 shrink-0">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <Inbox className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display tracking-tight text-white flex items-center gap-2">
              DevWeb Secure Back-End
              <span className="text-[10px] bg-emerald-950 border border-emerald-800/80 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase">
                Aktiva
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Tahirizo soa aman-tsara ao amin'ny Backend-nao ny hafatra sy formulaire rehetra avy amin'ny tranonkalanao.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 mb-5 shrink-0">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`pb-3 px-4 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'submissions' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Hafatra Voaray ({submissions.length})
            {activeTab === 'submissions' && (
              <motion.div layoutId="activeLeadTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('apiDocs')}
            className={`pb-3 px-4 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'apiDocs' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ahoana ny fampiasana azy? (Backend API)
            {activeTab === 'apiDocs' && (
              <motion.div layoutId="activeLeadTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
            )}
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow overflow-y-auto min-h-0 pr-1">
          {activeTab === 'submissions' ? (
            <div className="space-y-4 h-full flex flex-col">
              {/* Search Bar */}
              {submissions.length > 0 && (
                <div className="relative shrink-0">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Sivanina ny tetikasa, na ny votoatin'ny hafatra..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-white placeholder:text-slate-600"
                  />
                </div>
              )}

              {/* Submissions List */}
              {filteredSubmissions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSubmissions.map((sub) => (
                    <motion.div
                      key={sub.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-slate-950/60 border border-slate-850 hover:border-slate-800 rounded-2xl flex flex-col justify-between gap-3 transition-all relative group"
                    >
                      <div>
                        {/* Meta */}
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className="text-[10px] bg-slate-850 text-slate-300 font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                            <Globe className="w-3 h-3 text-emerald-400" />
                            {sub.projectName}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1 shrink-0">
                            <Calendar className="w-3 h-3" />
                            {new Date(sub.submittedAt).toLocaleDateString('mg-MG', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        {/* Title Form name */}
                        <h4 className="text-xs font-black text-amber-300 mb-2.5 uppercase tracking-wider">{sub.formName}</h4>

                        {/* Data Values Grid */}
                        <div className="space-y-1.5 p-3 bg-slate-950/80 rounded-xl border border-slate-900 font-medium">
                          {Object.entries(sub.data).map(([key, val]) => (
                            <div key={key} className="text-xs flex flex-col sm:flex-row sm:items-start gap-1">
                              <span className="text-slate-500 font-bold shrink-0 capitalize min-w-[70px]">{key}:</span>
                              <span className="text-slate-200 break-words">{String(val)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex justify-end pt-1">
                        <button
                          disabled={isDeleting === sub.id}
                          onClick={() => {
                            if (confirm("Tena tianao hofafana tokoa ve ity hafatra voaray ity?")) {
                              handleDelete(sub.id);
                            }
                          }}
                          className="text-xs text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isDeleting === sub.id ? 'Fafana...' : 'Fafao'}</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-3xl bg-slate-950/20">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-full text-slate-600 mb-4">
                    <Inbox className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-300 mb-1">Mbola tsy misy hafatra voaray</h4>
                  <p className="text-xs text-slate-500 max-w-sm mb-4 leading-normal">
                    Rehefa mamorona tranonkala misy formulaire (Fifandraisana/Contact) ny IA ary misy mandefa hafatra, dia ho hita eto izany.
                  </p>
                  <div className="flex flex-col items-center gap-2 p-3 bg-slate-950 rounded-2xl border border-slate-900 max-w-md">
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" /> Ny fomba fiasa
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Mampiditra kaody mampifandray ny contact forms rehetra ho any amin'ity Back-end ity ho azy ny DEVWEB IA isaky ny mamorona tranonkala vaovao ianao!
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span>Azo antoka sy Sécurisé ny Back-End-nao</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tsy mila manangana server hafa na database sarotra intsony ianao. Ny server an'ny <strong>DEVWEB IA</strong> no mikarakara sy mitahiry ny drakitra (leads) rehetra avy amin'ireo tranonkala izay vokarinao ka voapetraka ao amin'ny GitHub Pages mivantana.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px] text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" /> CORS voaporofo (GitHub Pages to DevWeb API)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" /> No credentials exposed to browser
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" /> Fiarovana amin'ny spam sy bot
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" /> Tsy misy fetra ny hafatra voaray
                  </div>
                </div>
              </div>

              {/* API Snippet Box */}
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-slate-950 px-3 py-2 rounded-t-xl border-t border-x border-slate-800 text-[11px] font-bold text-slate-400">
                  <span className="flex items-center gap-1">
                    <Code2 className="w-3.5 h-3.5 text-amber-500" /> Hampiasaina amin'ny Kaody hafa koa
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-b-xl font-mono text-[10px] text-emerald-400 overflow-x-auto max-h-[250px]">
                  {apiSnippet}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 font-bold shrink-0">
          <span>PIROTRA NY FIAINAN'NY DRAKITRA: 30 DAYS RETENTION</span>
          <span>DEVWEB BACK-END ENGINE</span>
        </div>
      </motion.div>
    </div>
  );
}
