import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Wand2, RefreshCw } from 'lucide-react';

import Header from './components/Header';
import AuthScreen from './components/AuthScreen';
import ChatHistorySidebar from './components/ChatHistorySidebar';
import ChatWorkspace from './components/ChatWorkspace';
import PreviewArea from './components/PreviewArea';

import DatabaseWizardModal from './components/DatabaseWizardModal';
import DatabaseSettingsModal from './components/DatabaseSettingsModal';
import BackendLeadsModal from './components/BackendLeadsModal';
import RechargeModal from './components/RechargeModal';
import AdminModal from './components/AdminModal';
import FaqModal from './components/FaqModal';

import { AppUser, WebSiteProject, ChatMessage } from './types';
import { DEFAULT_WEBSITE_CODE } from './defaultWebsite';
import { Language } from './translations';

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [language, setLanguage] = useState<Language>('mg');
  const [projects, setProjects] = useState<WebSiteProject[]>([]);
  const [currentProject, setCurrentProject] = useState<WebSiteProject | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'chat' | 'preview'>('chat');

  // Modals
  const [isDbWizardOpen, setIsDbWizardOpen] = useState(false);
  const [isDbSettingsOpen, setIsDbSettingsOpen] = useState(false);
  const [isLeadsOpen, setIsLeadsOpen] = useState(false);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);

  // 1. Session restore from localStorage and sync state
  useEffect(() => {
    const storedUser = localStorage.getItem('devweb-ia-user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        syncUserStatus(parsedUser);
      } catch (e) {
        console.error("Failed to parse stored session:", e);
      }
    }
  }, []);

  const syncUserStatus = async (currentUser: AppUser) => {
    try {
      // Sync or recover state on the backend stateless container
      const response = await fetch('/api/sync-render-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser })
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.warn("Non-JSON response for sync-render-session:", text);
        data = null;
      }
      if (response.ok && data && data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('devweb-ia-user', JSON.stringify(data.user));
        loadUserProjects(data.user.email);
      } else {
        setUser(currentUser);
        loadUserProjects(currentUser.email);
      }
    } catch (e) {
      console.warn("Backend sync failed. Using local offline session fallback.", e);
      setUser(currentUser);
      loadUserProjects(currentUser.email);
    }
  };

  const loadUserProjects = (email: string) => {
    try {
      const storedProj = localStorage.getItem(`devweb-ia-projects-${email}`);
      if (storedProj) {
        const parsed = JSON.parse(storedProj);
        setProjects(parsed);
        if (parsed.length > 0) {
          setCurrentProject(parsed[0]);
          setChatHistory(parsed[0].chatHistory || []);
        } else {
          loadDefaultGastroArt();
        }
      } else {
        loadDefaultGastroArt();
      }
    } catch (e) {
      loadDefaultGastroArt();
    }
  };

  const loadDefaultGastroArt = () => {
    const defaultProj: WebSiteProject = {
      id: 'proj_default',
      name: 'GastroArt Landing Page',
      prompt: 'Tranonkala Restaurant Malagasy manara-penitra',
      code: DEFAULT_WEBSITE_CODE,
      createdAt: new Date().toISOString(),
      chatHistory: [
        {
          id: 'msg_def_1',
          sender: 'ai',
          text: 'Tongasoa eto amin\'ny DEVWEB IA! Ity misy modely tsara tarehy indrindra amin\'ny tranonkala GastroArt mampiseho ny fahaizan\'ny sehatray. Azonao sivanina na ovaina araka izay tianao ny kaody!',
          timestamp: new Date().toLocaleTimeString(),
          code: DEFAULT_WEBSITE_CODE
        }
      ]
    };
    setProjects([defaultProj]);
    setCurrentProject(defaultProj);
    setChatHistory(defaultProj.chatHistory || []);
  };

  const handleLoginSuccess = (loggedInUser: AppUser) => {
    setUser(loggedInUser);
    localStorage.setItem('devweb-ia-user', JSON.stringify(loggedInUser));
    syncUserStatus(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    setProjects([]);
    setCurrentProject(null);
    setChatHistory([]);
    localStorage.removeItem('devweb-ia-user');
  };

  const handleUpdateUser = (updatedUser: AppUser) => {
    setUser(updatedUser);
    localStorage.setItem('devweb-ia-user', JSON.stringify(updatedUser));
  };

  // Sync projects list to localStorage whenever projects change
  useEffect(() => {
    if (user && projects.length > 0) {
      localStorage.setItem(`devweb-ia-projects-${user.email}`, JSON.stringify(projects));
    }
  }, [projects, user]);

  // Project Selection
  const handleSelectProject = (project: WebSiteProject) => {
    setCurrentProject(project);
    setChatHistory(project.chatHistory || []);
  };

  // New Project
  const handleNewProject = () => {
    setCurrentProject(null);
    setChatHistory([]);
    setViewMode('chat');
  };

  // 2. Main Gemini AI Generation Handler
  const handleGenerateSite = async (prompt: string, refine: boolean) => {
    if (!user) return;
    setIsGenerating(true);
    setErrorMessage(null);

    // Add Optimistic user message to chat history
    const userMsg: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString()
    };
    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);

    try {
      const res = await fetch('/api/generate-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          existingCode: (refine && currentProject) ? currentProject.code : undefined,
          userEmail: user.email
        })
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        console.error("Non-JSON generation response:", text);
        if (text.includes("<!doctype") || text.includes("<html")) {
          throw new Error(`Erreur Serveur (${res.status}): Nahazo valiny HTML fa tsy JSON avy amin'ny mpizara. Mety mbola mamelona na misy olana ny mpizara, andramo indray afaka kely.`);
        }
        throw new Error(`Erreur Parse (${res.status}): ${text.substring(0, 150)}`);
      }

      if (!res.ok) {
        if (data.isCreditsExhausted) {
          setIsRechargeOpen(true);
        }
        throw new Error(data.error || "Tsy nandeha ny fandefasana baiko tamin'ny Gemini AI.");
      }

      if (data.success && data.code) {
        const generatedCode = data.code;
        const aiMsg: ChatMessage = {
          id: 'msg_' + Math.random().toString(36).substr(2, 9),
          sender: 'ai',
          text: "Tontosa soa aman-tsara ny famoronana na fanitsiana ny tranonkalanao! Azonao jerena eo ankavanana ny vokany.",
          timestamp: new Date().toLocaleTimeString(),
          code: generatedCode
        };

        const finalHistory = [...updatedHistory, aiMsg];
        setChatHistory(finalHistory);

        // Update local user credits
        handleUpdateUser({
          ...user,
          credits: data.userCredits,
          tokensUsed: (user.tokensUsed || 0) + data.tokensUsed
        });

        const pName = currentProject ? currentProject.name : (prompt.slice(0, 24) + "...");
        const newProjectObj: WebSiteProject = {
          id: currentProject ? currentProject.id : ('proj_' + Math.random().toString(36).substr(2, 9)),
          name: pName,
          prompt: prompt,
          code: generatedCode,
          createdAt: currentProject ? currentProject.createdAt : new Date().toISOString(),
          chatHistory: finalHistory,
          supabaseProjectId: data.supabaseResult?.projectId || undefined,
          supabaseStatus: data.supabaseResult?.status || undefined
        };

        if (currentProject) {
          setProjects(prev => prev.map(p => p.id === currentProject.id ? newProjectObj : p));
        } else {
          setProjects(prev => [newProjectObj, ...prev]);
        }
        setCurrentProject(newProjectObj);
        setViewMode('preview');
      }
    } catch (e: any) {
      setErrorMessage(e.message || "Misy olana.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top National Accent Band */}
      <div className="h-1.5 w-full flex shrink-0">
        <div className="w-1/3 bg-white" />
        <div className="w-1/3 bg-rose-600" />
        <div className="w-1/3 bg-emerald-600" />
      </div>

      {/* Main SaaS Header */}
      <Header
        user={user}
        onLogout={handleLogout}
        language={language}
        setLanguage={setLanguage}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenRecharge={() => setIsRechargeOpen(true)}
        onOpenFaq={() => setIsFaqOpen(true)}
        onOpenDatabaseSettings={() => setIsDbSettingsOpen(true)}
        onOpenDatabaseWizard={() => setIsDbWizardOpen(true)}
        onOpenLeads={() => setIsLeadsOpen(true)}
      />

      <div className="flex-grow flex relative">
        <AnimatePresence mode="wait">
          {!user ? (
            /* Non Authenticated view */
            <motion.div 
              key="auth-screen"
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AuthScreen 
                language={language} 
                onLoginSuccess={handleLoginSuccess} 
              />
            </motion.div>
          ) : (
            /* Main Dashboard workspace area */
            <motion.div 
              key="main-workspace"
              className="w-full flex flex-col md:flex-row flex-grow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              
              {/* Chat Sidebar Navigation */}
              <ChatHistorySidebar
                projects={projects}
                currentProject={currentProject}
                onSelectProject={handleSelectProject}
                onNewProject={handleNewProject}
                language={language}
                onOpenRecharge={() => setIsRechargeOpen(true)}
                onOpenFaq={() => setIsFaqOpen(true)}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
              />

              {/* Main Content Workspace */}
              <div className="flex-grow p-4 md:p-6 flex flex-col min-w-0">
                
                {/* Floating sidebar menu toggle for mobile */}
                <button
                  id="mobile-sidebar-toggle-btn"
                  onClick={() => setIsSidebarOpen(true)}
                  className="md:hidden p-3 bg-slate-900 border border-slate-800 text-amber-400 rounded-2xl flex items-center gap-2 mb-4 w-fit cursor-pointer"
                >
                  <Menu className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Tetikasa</span>
                </button>

                <AnimatePresence mode="wait">
                  {viewMode === 'chat' ? (
                    <motion.div
                      key="chat-panel"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="w-full flex-grow"
                    >
                      <ChatWorkspace
                        chatHistory={chatHistory}
                        currentProject={currentProject}
                        onGenerate={handleGenerateSite}
                        isGenerating={isGenerating}
                        language={language}
                        errorMessage={errorMessage}
                        onTogglePreview={() => setViewMode('preview')}
                        onNewProject={handleNewProject}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="preview-panel"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="w-full flex-grow"
                    >
                      <PreviewArea
                        code={currentProject ? currentProject.code : DEFAULT_WEBSITE_CODE}
                        projectName={currentProject ? currentProject.name : "GastroArt"}
                        language={language}
                        isGenerating={isGenerating}
                        supabaseProjectId={currentProject?.supabaseProjectId}
                        supabaseStatus={currentProject?.supabaseStatus}
                        user={user}
                        onUpdateUser={handleUpdateUser}
                        onReturnToChat={() => setViewMode('chat')}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals Containers */}
      <DatabaseWizardModal
        isOpen={isDbWizardOpen}
        onClose={() => setIsDbWizardOpen(false)}
        language={language}
      />

      <DatabaseSettingsModal
        isOpen={isDbSettingsOpen}
        onClose={() => setIsDbSettingsOpen(false)}
        language={language}
      />

      <BackendLeadsModal
        isOpen={isLeadsOpen}
        onClose={() => setIsLeadsOpen(false)}
        language={language}
        user={user}
        onUpdateUser={handleUpdateUser}
      />

      <RechargeModal
        isOpen={isRechargeOpen}
        onClose={() => setIsRechargeOpen(false)}
        language={language}
        user={user}
        onUpdateUser={handleUpdateUser}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        language={language}
        user={user}
      />

      <FaqModal
        isOpen={isFaqOpen}
        onClose={() => setIsFaqOpen(false)}
        language={language}
      />

    </div>
  );
}
