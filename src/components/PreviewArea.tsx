import React, { useState } from 'react';
import { 
  Copy, 
  Download, 
  ExternalLink, 
  Check, 
  Eye, 
  Code2, 
  FileCode,
  Sparkles,
  Smartphone,
  Monitor,
  MessageSquare,
  ArrowLeft,
  Github,
  Globe,
  X,
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { TRANSLATIONS, Language } from '../translations';
import { AppUser } from '../types';

interface PreviewAreaProps {
  code: string;
  projectName: string;
  language: Language;
  isGenerating: boolean;
  supabaseProjectId?: string;
  supabaseStatus?: string;
  user: AppUser | null;
  onUpdateUser: (updatedUser: AppUser) => void;
  onReturnToChat?: () => void;
}

export default function PreviewArea({
  code,
  projectName,
  language,
  isGenerating,
  supabaseProjectId,
  supabaseStatus,
  user,
  onUpdateUser,
  onReturnToChat
}: PreviewAreaProps) {
  const t = TRANSLATIONS[language];
  const [activeView, setActiveView] = useState<'preview' | 'code'>('preview');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);

  // GitHub Deployment State
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('devweb_ia_github_token') || '');
  const [githubUsername, setGithubUsername] = useState(() => localStorage.getItem('devweb_ia_github_username') || '');
  const [hasServerToken, setHasServerToken] = useState(false);
  const [hasRenderFixedKey, setHasRenderFixedKey] = useState(false);
  
  // New States for Copied indicators in Success Panel
  const [copiedPagesUrl, setCopiedPagesUrl] = useState(false);
  const [copiedRepoUrl, setCopiedRepoUrl] = useState(false);

  // Helper to slugify repository name
  const getSlugName = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\-]/g, '-')
      .replace(/\-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const [githubRepoName, setGithubRepoName] = useState(() => getSlugName(projectName) || 'my-project');
  const [saveCredentials, setSaveCredentials] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [deployResult, setDeployResult] = useState<{ repoUrl: string; pagesUrl: string; deployType?: string } | null>(null);
  const [renderApiKey, setRenderApiKey] = useState(() => localStorage.getItem('devweb_ia_render_api_key') || '');
  const [deployPlatform, setDeployPlatform] = useState<'render' | 'github'>('render');

  // Synchronize repo name if project name changes
  React.useEffect(() => {
    setGithubRepoName(getSlugName(projectName) || 'my-project');
  }, [projectName]);

  // Check if GITHUB_TOKEN is configured in the server
  React.useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        const res = await fetch('/api/github/status');
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.hasToken === 'boolean') {
            setHasServerToken(data.hasToken);
          }
          if (data && typeof data.hasRenderFixedKey === 'boolean') {
            setHasRenderFixedKey(data.hasRenderFixedKey);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch server github status:", err);
      }
    };
    fetchServerStatus();
  }, [isPublishModalOpen]);

  const handleGithubDeploy = async (forcedRepoName?: string) => {
    const targetRepo = (forcedRepoName || githubRepoName).trim();
    const effectiveToken = githubToken.trim() || (hasServerToken ? "SERVER_DEFAULT" : "");

    // Revised validation:
    // Just proceed. The server will handle the fallback.

    if (!effectiveToken) {
      setDeployError("Fenoy daholo ny mombamomba ny GitHub azafady, na ampifandraiso amin'ny GITHUB_TOKEN amin'ny Server.");
      return;
    }

    if (!targetRepo) {
      setDeployError("Mila anarana repository (nom du projet) azafady.");
      return;
    }

    setIsDeploying(true);
    setDeployError(null);
    setDeployResult(null);

    try {
      const res = await fetch('/api/github/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: githubToken.trim(),
          username: githubUsername.trim(),
          repoName: targetRepo,
          htmlCode: code,
          email: user?.email,
          deployPlatform: deployPlatform,
          renderApiKey: renderApiKey.trim()
        })
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        console.error("Non-JSON deployment response:", text);
        if (text.includes("<!doctype") || text.includes("<html")) {
          throw new Error(`Erreur Serveur (${res.status}): Nahazo valiny HTML tsy nampoizina avy amin'ny mpizara (server). Mety mbola mamelona na misy olana ny mpizara, andramo indray afaka fotoana fohy.`);
        }
        throw new Error(`Erreur Parse (${res.status}): ${text.substring(0, 150)}`);
      }

      if (!res.ok) {
        throw new Error(data.error || "Tsy nahomby ny fametrahana.");
      }

      setDeployResult(data);
      
      if (data.user) {
        onUpdateUser(data.user);
      }
      
      if (saveCredentials) {
        localStorage.setItem('devweb_ia_github_token', githubToken.trim());
        localStorage.setItem('devweb_ia_github_username', githubUsername.trim());
        if (deployPlatform === 'render') {
          localStorage.setItem('devweb_ia_render_api_key', renderApiKey.trim());
        }
      } else {
        localStorage.removeItem('devweb_ia_github_token');
        localStorage.removeItem('devweb_ia_github_username');
        localStorage.removeItem('devweb_ia_render_api_key');
      }
    } catch (err: any) {
      setDeployError(err.message || "Nisy olana tsy nampoizina.");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Failed to copy using clipboard API:", err);
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.toLowerCase().replace(/\s+/g, '-') || 'website'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download failed:", e);
    }
  };

  return (
    <div className="flex flex-col justify-between h-[calc(100vh-140px)] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      
      {/* Top action bar */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800/80 flex flex-wrap justify-between items-center gap-3 shrink-0">
        
        <div className="flex items-center gap-2">
          {onReturnToChat && (
            <button
              id="preview-return-to-chat-btn"
              onClick={onReturnToChat}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-extrabold border border-slate-700 rounded-xl text-xs transition-all cursor-pointer shadow-sm shrink-0"
              title={t.returnToChat || "Hiverina amin'ny Resaka"}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.returnToChat || "Retour Chat"}</span>
            </button>
          )}

          {/* Toggle Preview vs Code view */}
          <div className="flex bg-slate-900 rounded-xl p-0.5 border border-slate-800">
            <button
              id="preview-toggle-view"
              onClick={() => setActiveView('preview')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeView === 'preview' 
                  ? 'bg-slate-800 text-amber-400 font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t.previewTab}</span>
            </button>
          
          <button
            id="preview-toggle-code"
            onClick={() => setActiveView('code')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeView === 'code' 
                ? 'bg-slate-800 text-amber-400 font-bold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{t.codeTab}</span>
          </button>
        </div>
        </div>

        {/* Device responsive simulator controls (only for preview mode) */}
        {activeView === 'preview' && (
          <div className="hidden sm:flex bg-slate-900 rounded-lg p-0.5 border border-slate-850">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`p-1 rounded ${deviceMode === 'desktop' ? 'bg-slate-850 text-amber-400' : 'text-slate-500 hover:text-white'}`}
              title="Desktop view"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`p-1 rounded ${deviceMode === 'mobile' ? 'bg-slate-850 text-amber-400' : 'text-slate-500 hover:text-white'}`}
              title="Mobile view"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Global Copy & Download Actions */}
        <div className="flex items-center gap-2">
          {/* Publish GitHub Button */}
          <button
            id="preview-publish-github-btn"
            onClick={() => {
              setDeployResult(null);
              setDeployError(null);
              setIsPublishModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs transition-all shadow cursor-pointer font-bold border border-purple-500/20"
            title={t.githubDeploy}
          >
            <Github className="w-3.5 h-3.5" />
            <span>{t.publishBtn}</span>
          </button>

          {/* Copy Button */}
          <button
            id="preview-copy-btn"
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs transition-colors cursor-pointer"
            title={t.copyBtn}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{t.copyBtn}</span>
              </>
            )}
          </button>

          {/* Download HTML Button */}
          <button
            id="preview-download-btn"
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs transition-all shadow cursor-pointer font-bold"
            title={t.downloadBtn}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.downloadBtn}</span>
          </button>
        </div>

      </div>

      {/* Main viewport area */}
      <div className="flex-grow bg-slate-950 p-3 flex justify-center items-center overflow-hidden">
        
        {isGenerating ? (
          /* Loading overlay skeleton */
          <div className="text-center space-y-4 max-w-sm">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-full inline-block animate-bounce text-amber-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-slate-200 text-sm font-semibold">Hamorona sangan'asa vaovao ny Gemini...</h4>
              <p className="text-slate-500 text-xs mt-1">Ny kanto sy ny tsiro dia andrasana kely fotsiny. Misaotra betsaka amin'ny faharetanao!</p>
            </div>
          </div>
        ) : (
          /* Main Display */
          <div className="w-full h-full flex justify-center items-center">
            {activeView === 'preview' ? (
              /* Live Preview iframe */
              <div className={`h-full transition-all duration-300 bg-white rounded-xl shadow-lg border border-slate-800 overflow-hidden ${
                deviceMode === 'mobile' ? 'w-[375px]' : 'w-full'
              }`}>
                <iframe
                  id="preview-site-iframe"
                  title="Rendered SaaS HTML Site Preview"
                  srcDoc={code}
                  sandbox="allow-scripts allow-popups"
                  className="w-full h-full border-0"
                />
              </div>
            ) : (
              /* HTML code textarea view */
              <textarea
                id="preview-code-textarea"
                readOnly
                value={code}
                className="w-full h-full bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-[11px] text-emerald-400 focus:outline-none resize-none overflow-y-auto"
              />
            )}
          </div>
        )}

      </div>

      {/* Mini info bar */}
      <div className="bg-slate-950 px-4 py-2 border-t border-slate-850 flex justify-between items-center text-[10px] text-slate-500 shrink-0 gap-3 flex-wrap">
        <span className="flex items-center gap-1">
          <FileCode className="w-3 h-3 text-slate-500" /> Standalone Single-File HTML
        </span>
        {supabaseProjectId && (
          <span className="flex items-center gap-1 bg-indigo-950/50 border border-indigo-900/60 text-indigo-400 px-2 py-0.5 rounded-full font-semibold">
            <span className="w-1 h-1 bg-emerald-400 rounded-full animate-ping" />
            Supabase Project ID: <span className="font-mono text-[9px] text-slate-300">{supabaseProjectId}</span>
          </span>
        )}
        <span>HTML + TailwindCSS CDN + FontAwesome + JS</span>
      </div>
      {/* Render/GitHub Deploy Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200 text-left">
            {/* Close Button */}
            <button
              onClick={() => setIsPublishModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 p-2 rounded-full cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className={`p-3 rounded-2xl border ${
                deployPlatform === 'render' 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
              }`}>
                {deployPlatform === 'render' ? <Globe className="w-6 h-6" /> : <Github className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-white font-black text-base uppercase tracking-tight">
                  {deployPlatform === 'render' ? 'MANDROSO AMIN\'I RENDER' : t.githubDeploy}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  {deployPlatform === 'render' 
                    ? 'Apetraho amin\'ny Web Server Render ny tranonkalanao' 
                    : 'Mamorona repository sy mamoaka ny tranonkala static'}
                </p>
              </div>
            </div>

            {/* Platform Selection Tabs */}
            {!deployResult && (
              <div className="flex bg-slate-950 p-1 rounded-2xl mb-5 border border-slate-850">
                <button
                  type="button"
                  onClick={() => {
                    setDeployPlatform('render');
                    setDeployError(null);
                  }}
                  className={`flex-1 py-2 text-center text-xs font-black rounded-xl transition-all cursor-pointer ${
                    deployPlatform === 'render' 
                      ? 'bg-amber-500 text-slate-950 shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⚡ Render Web Server (Azo antoka)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeployPlatform('github');
                    setDeployError(null);
                  }}
                  className={`flex-1 py-2 text-center text-xs font-black rounded-xl transition-all cursor-pointer ${
                    deployPlatform === 'github' 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  GitHub Pages
                </button>
              </div>
            )}

            {/* Body */}
            {!deployResult ? (
              <div className="space-y-4">
                {deployPlatform === 'render' ? (
                  /* Render Fields */
                  <>
                    <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-2xl text-[11px] text-slate-300 leading-relaxed space-y-1">
                      <p className="text-amber-400 font-extrabold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> DEPLOIEMENT RENDER AUTOMATIQUE
                      </p>
                      <p className="text-slate-400">
                        Ny server-nay no mikarakara ny GitHub repository ho azy mialoha ny handefasana azy any amin'ny Render-nao. Tsy mila kaonty GitHub ianao!
                      </p>
                    </div>

                    {/* Render API Key */}
                    {!hasRenderFixedKey && (
                      <div>
                        <label className="block text-slate-300 font-bold text-xs uppercase tracking-wider mb-1.5">
                          Render API Key <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="password"
                          placeholder="rnd_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          value={renderApiKey}
                          onChange={(e) => setRenderApiKey(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none transition-colors font-mono"
                        />
                        <p className="text-[10px] text-slate-500 mt-1.5">
                          Azonao alaina ao amin'ny <a href="https://dashboard.render.com/it/users/settings" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline font-bold font-sans">Render Account Settings &rarr; API Keys</a> ny Token-nao.
                        </p>
                      </div>
                    )}

                    {/* Site/Repo name */}
                    <div>
                      <label className="block text-slate-300 font-bold text-xs uppercase tracking-wider mb-1.5">
                        Anaran'ny tranonkala (Render Subdomain)
                      </label>
                      <input
                        type="text"
                        placeholder="nom-du-projet"
                        value={githubRepoName}
                        onChange={(e) => setGithubRepoName(getSlugName(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none transition-colors font-mono"
                      />
                    </div>
                  </>
                ) : (
                  /* GitHub Fields */
                  <>
                    {/* Server-Side GITHUB_TOKEN active banner */}
                    {hasServerToken && (
                      <div className="p-3 bg-emerald-950/40 border border-emerald-900/60 rounded-2xl text-emerald-400 text-xs flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                        <div>
                          <p className="font-extrabold text-emerald-300">✓ TOKEN GITHUB FIXE AKTIVA</p>
                          <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                            Efa misy Token voafetra mialoha eo amin'ny server. Azonao avela malalaka ny Token sy ny Username, ary ny anaran'ny tetikasa ihany no ampidirina.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Token Input */}
                    <div>
                      <label className="block text-slate-300 font-bold text-xs uppercase tracking-wider mb-1.5">
                        {t.githubToken} {hasServerToken && <span className="text-emerald-400 text-[10px] normal-case font-medium">(Safidy / Optionnel)</span>}
                      </label>
                      <input
                        type="password"
                        placeholder={hasServerToken ? "Mampiasa ny Token'ny Server" : "ghp_xxxxxxxxxxxxxxxxxxxx"}
                        value={githubToken}
                        onChange={(e) => setGithubToken(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none transition-colors font-mono"
                      />
                      {!hasServerToken && (
                        <p className="text-[10px] text-slate-500 mt-1">
                          Mila token misy <code className="text-indigo-400 font-mono text-[9px]">repo</code> scope avy any amin'ny <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">GitHub Settings</a>.
                        </p>
                      )}
                    </div>

                    {/* Username Input */}
                    <div>
                      <label className="block text-slate-300 font-bold text-xs uppercase tracking-wider mb-1.5">
                        {t.githubUsername} {hasServerToken && <span className="text-emerald-400 text-[10px] normal-case font-medium">(Safidy / Optionnel)</span>}
                      </label>
                      <input
                        type="text"
                        placeholder={hasServerToken ? "Mampiasa ny mpampiasa an'ny Server" : "Anaranao ao amin'ny GitHub"}
                        value={githubUsername}
                        onChange={(e) => setGithubUsername(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Repo Name Input */}
                    <div>
                      <label className="block text-slate-300 font-bold text-xs uppercase tracking-wider mb-1.5">{t.githubRepoName}</label>
                      <input
                        type="text"
                        placeholder="nom-du-projet"
                        value={githubRepoName}
                        onChange={(e) => setGithubRepoName(getSlugName(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none transition-colors font-mono"
                      />
                    </div>
                  </>
                )}

                {/* Save Credentials Checkbox */}
                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="save-credentials-checkbox"
                    checked={saveCredentials}
                    onChange={(e) => setSaveCredentials(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="save-credentials-checkbox" className="text-xs text-slate-400 cursor-pointer select-none">
                    Tadidio ireto fikirana ireto (Tehirizina ao amin'ny browser)
                  </label>
                </div>

                {/* Error Banner */}
                {deployError && (
                  <div className="space-y-2 p-3 bg-rose-950/50 border border-rose-900/60 rounded-xl text-rose-300 text-xs">
                    <div className="flex gap-2">
                      <AlertTriangle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                      <span className="font-bold">Misy olana:</span>
                    </div>
                    <div className="pl-6.5 text-slate-300 space-y-1">
                      <p className="text-rose-200 font-mono text-[11px] break-all">{deployError}</p>
                      {deployError.includes('Resource not accessible') && (
                        <div className="mt-2 text-[11px] text-amber-200 bg-amber-955/30 border border-amber-900/30 p-3 rounded-lg space-y-2">
                          <p className="font-bold text-amber-300">💡 Torohevitra manan-danja (Solution) :</p>
                          <p>Misy fitsipika roa tsy maintsy arahina rehefa mamorona <strong>Fine-grained Token</strong> ao amin'ny GitHub mba hahafahany mamorona repository vaovao:</p>
                          <ol className="list-decimal list-inside space-y-1.5 pl-1">
                            <li>
                              Ao amin'ny <strong>Repository access</strong>, tsy maintsy fidina ny <strong className="text-white bg-slate-950 px-1 rounded">"All repositories"</strong>. 
                              <br />
                              <span className="text-slate-400 text-[10px] pl-4 block">⚠️ Raha "Only select repositories" no fidinao, dia tsy mamela hamorona repository vaovao ny GitHub.</span>
                            </li>
                            <li>
                              Ao amin'ny <strong>Repository permissions</strong> (eo ambany kokoa), omeo fahazoan-dalana <strong className="text-white bg-slate-950 px-1 rounded">"Read and Write"</strong> ireto:
                              <ul className="list-disc list-inside pl-4 mt-0.5 space-y-0.5 text-slate-300">
                                <li><b>Contents</b> (Mba ahafahany manoratra ny fichier <code>index.html</code>)</li>
                                <li><b>Pages</b> (Mba ahafahany mampandeha ny tranonkala mivantana)</li>
                              </ul>
                            </li>
                          </ol>
                          <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                            Raha Classic Token kosa no ampiasainao, hamarino fa voasesika (checked) ny scope <b>"repo"</b>.
                          </p>
                        </div>
                      )}
                      {(deployError.includes('Not Found') || deployError.includes('404')) && (
                        <div className="mt-2 text-[11px] text-amber-200 bg-amber-955/30 border border-amber-900/30 p-2 rounded-lg space-y-1">
                          <p className="font-bold">💡 Torohevitra (Solution) :</p>
                          <p>Mila omenao alalana (Write access) hanoratra fichiers ny Token-nao:</p>
                          <ul className="list-disc list-inside space-y-0.5 ml-1">
                            <li>Raha <strong>Classic Token</strong>: Hamarino tsara fa voafidy ny scope <b>"repo"</b> rehefa mamorona Token.</li>
                            <li>Raha <strong>Fine-grained Token</strong>: Ao amin'ny <b>"Repository permissions"</b>, omeo <b>"Read and Write"</b> ny alalana <b>"Contents"</b> mba hahafahany manoratra ny <code>index.html</code>.</li>
                            <li>Hamarino ihany koa raha marina tsara ny anarana mpampiasa (Username) sy ny Token nampidirinao.</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  onClick={() => handleGithubDeploy()}
                  disabled={isDeploying}
                  className={`w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer ${
                    deployPlatform === 'render' 
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                  }`}
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className={`w-4 h-4 animate-spin ${deployPlatform === 'render' ? 'text-slate-950' : 'text-white'}`} />
                      <span>{t.deploying}</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      <span>{deployPlatform === 'render' ? 'ALEFASO NY DEPLOIEMENT RENDER' : 'ALEFASO NY DEPLOIEMENT GITHUB'}</span>
                    </>
                  )}
                </button>

                {/* Deployed sites list */}
                {user?.deployments && user.deployments.length > 0 && (
                  <div className="pt-4 border-t border-slate-800">
                    <h4 className="text-slate-300 font-extrabold text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      Ireo site efa voapetraka ({user.deployments.length})
                    </h4>
                    <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                      {user.deployments.map((dep, idx) => (
                        <div key={idx} className="p-2 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl flex items-center justify-between gap-2.5 transition-colors">
                          <div className="min-w-0 flex-grow">
                            <p className="text-slate-200 text-xs font-bold truncate">{dep.repoName}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <a 
                                href={dep.pagesUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-[10px] text-indigo-400 hover:underline flex items-center gap-0.5 shrink-0"
                              >
                                Live {dep.pagesUrl.includes('render.com') || dep.pagesUrl.includes('onrender.com') ? 'Render' : 'GitHub'} <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                              <span className="text-slate-700 text-[9px]">•</span>
                              <span className="text-slate-500 text-[9px]">
                                {new Date(dep.updatedAt).toLocaleDateString('mg-MG', {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 shrink-0">
                            {/* Copy button */}
                            <button
                              onClick={() => {
                                try {
                                  navigator.clipboard.writeText(dep.pagesUrl);
                                  alert("Adika ny rohy mivantana (Pages URL copied)!");
                                } catch (e) {}
                              }}
                              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-all cursor-pointer"
                              title="Adikao ny rohy mivantana"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            
                            {/* Update Deployment button */}
                            <button
                              disabled={isDeploying}
                              onClick={() => {
                                if (confirm(`Mise à jour: Tianao hapetraka amin'ilay repository "${dep.repoName}" ve ity kaody vaovao ity?`)) {
                                  handleGithubDeploy(dep.repoName);
                                }
                              }}
                              className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded-md transition-all cursor-pointer disabled:opacity-50"
                              title="Hanavao (Mettre à jour)"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isDeploying ? 'animate-spin' : ''}`} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Deploy Success Panel
              <div className="space-y-4 text-center">
                <div className="mx-auto w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/20">
                  <Check className="w-6 h-6" />
                </div>
                
                <div>
                  <h4 className="text-white font-extrabold text-sm">
                    {deployResult.deployType === 'render' ? 'Tafapetraka soa aman-tsara amin\'i Render!' : t.deploySuccess}
                  </h4>
                  <p className="text-slate-400 text-xs mt-1">
                    {deployResult.deployType === 'render' 
                      ? 'Efa mandeha mivantana ao amin\'ny Render ny tranonkalanao miaraka amin\'ny Back-end azo antoka.'
                      : 'Tafapetraka ao amin\'ny GitHub ary eo am-pandefasana ny GitHub Pages ny tranonkalanao.'}
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl text-left space-y-3 font-medium">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                      {deployResult.deployType === 'render' ? 'Rohy mivantana amin\'i Render' : t.githubPagesUrl}
                    </span>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <a
                        href={deployResult.pagesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:underline text-xs flex items-center gap-1.5 break-all font-mono"
                      >
                        <span>{deployResult.pagesUrl}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                      <button
                        onClick={() => {
                          try {
                            navigator.clipboard.writeText(deployResult.pagesUrl);
                            setCopiedPagesUrl(true);
                            setTimeout(() => setCopiedPagesUrl(false), 2000);
                          } catch (e) {}
                        }}
                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                        title="Copier le lien"
                      >
                        {copiedPagesUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Dépôt sur GitHub</span>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <a
                        href={deployResult.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-300 hover:underline text-xs flex items-center gap-1.5 break-all font-mono"
                      >
                        <span>{deployResult.repoUrl}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                      <button
                        onClick={() => {
                          try {
                            navigator.clipboard.writeText(deployResult.repoUrl);
                            setCopiedRepoUrl(true);
                            setTimeout(() => setCopiedRepoUrl(false), 2000);
                          } catch (e) {}
                        }}
                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                        title="Copier le lien"
                      >
                        {copiedRepoUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 flex items-center gap-1.5 bg-amber-950/20 border border-amber-900/30 p-2.5 rounded-xl text-left">
                  <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                  <span>
                    {deployResult.deployType === 'render'
                      ? 'Mety mila miandry 2-4 minitra ianao vao ho feno sy ho vonona tanteraka ny tranonkala any amin\'ny Render.'
                      : 'Mety mila miandry 1-3 minitra vao miseho mivantana ny tranonkala amin\'io rohy io.'}
                  </span>
                </div>

                <button
                  onClick={() => setIsPublishModalOpen(false)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
                >
                  Fermer (Hidy)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
