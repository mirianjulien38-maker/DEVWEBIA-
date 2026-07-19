import express from 'express';
import path from 'path';
import * as fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { readDb, writeDb, rotateGeminiKey, DbUser, DbPaymentClaim } from './server-db';
import { supabaseSyncNewProject } from './server-supabase';
import { deployToGitHub } from './server-github';
import { deployToRender } from './server-render';

const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // API Routes MUST go FIRST
  
  // POST /api/register
  app.post('/api/register', (req, res) => {
    try {
      const { email, name, password } = req.body;
      if (!email || !name) {
        return res.status(400).json({ error: "Email and Name are required" });
      }

      const db = readDb();
      const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (existing) {
        // Return existing user
        return res.json({ success: true, user: existing });
      }

      // Create new user with 15 free credits
      const isAdmin = email.toLowerCase() === "horlandobe@gmail.com";
      const newUser: DbUser = {
        id: 'usr_' + Math.random().toString(36).substr(2, 9),
        email: email.toLowerCase(),
        name: name,
        password: password || "",
        credits: 15, // 15 free credits
        tokensUsed: 0,
        bonusClaimsCount: 0,
        createdAt: new Date().toISOString()
      };

      db.users.push(newUser);
      writeDb(db);

      res.json({ success: true, user: { ...newUser, isAdmin } });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST /api/login
  app.post('/api/login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const db = readDb();
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        return res.status(404).json({ error: "User not found. Please register first." });
      }

      // In this simple custom auth, we verify password if provided, or log in directly if they registered with password
      if (password && user.password && user.password !== password) {
        return res.status(401).json({ error: "Incorrect password" });
      }

      const isAdmin = email.toLowerCase() === "horlandobe@gmail.com";
      res.json({ success: true, user: { ...user, isAdmin } });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST /api/user-status
  app.post('/api/user-status', (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const db = readDb();
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const isAdmin = email.toLowerCase() === "horlandobe@gmail.com";
      res.json({ success: true, user: { ...user, isAdmin } });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST /api/sync-render-session
  app.post('/api/sync-render-session', (req, res) => {
    try {
      const { user, geminiKeys } = req.body;
      if (!user || !user.email) {
        return res.status(400).json({ error: "User is required" });
      }

      const db = readDb();
      let existing = db.users.find(u => u.email.toLowerCase() === user.email.toLowerCase());

      if (!existing) {
        // Restore user to database cache if absent (Stateless container recovery helper)
        existing = {
          id: user.id || 'usr_' + Math.random().toString(36).substr(2, 9),
          email: user.email.toLowerCase(),
          name: user.name || user.email.split('@')[0],
          credits: typeof user.credits === 'number' ? user.credits : 15,
          tokensUsed: user.tokensUsed || 0,
          bonusClaimsCount: user.bonusClaimsCount || 0,
          createdAt: new Date().toISOString()
        };
        db.users.push(existing);
      } else {
        // Update credentials if newer
        if (typeof user.credits === 'number') existing.credits = user.credits;
        if (user.tokensUsed) existing.tokensUsed = user.tokensUsed;
      }

      // Sync backup client-side gemini keys if provided
      if (Array.isArray(geminiKeys)) {
        geminiKeys.forEach(k => {
          if (k && !db.geminiKeys.includes(k)) {
            db.geminiKeys.push(k);
          }
        });
      }

      writeDb(db);
      const isAdmin = user.email.toLowerCase() === "horlandobe@gmail.com";
      res.json({ success: true, user: { ...existing, isAdmin } });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // GET /api/supabase-status
  app.get('/api/supabase-status', (req, res) => {
    try {
      const url = process.env.SUPABASE_URL || null;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || null;
      const isConfigured = !!(url && key);
      
      res.json({
        success: true,
        isConfigured,
        url: url ? `${url.slice(0, 15)}...` : null,
        keyType: process.env.SUPABASE_SERVICE_ROLE_KEY ? "service_role" : (process.env.SUPABASE_ANON_KEY ? "anon" : null)
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST /api/claim-free-bonus
  app.post('/api/claim-free-bonus', (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const db = readDb();
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Validation: max 3 claims per 30 days
      if (user.bonusClaimsCount >= 3) {
        return res.status(400).json({ error: "Efa nahatratra ny fetra farany ianao (Max 3 claims per 30 days)." });
      }

      // Cooldown validation: 24h
      if (user.lastBonusClaimed) {
        const lastClaim = new Date(user.lastBonusClaimed).getTime();
        const diffMs = Date.now() - lastClaim;
        const hoursPassed = diffMs / (1000 * 60 * 60);
        if (hoursPassed < 24) {
          return res.status(400).json({ error: "Afaka mangataka indray rehefa afaka 24 ora. Miandrasa azafady." });
        }
      }

      // Award +10 credits
      user.credits = (user.credits || 0) + 10;
      user.bonusClaimsCount = (user.bonusClaimsCount || 0) + 1;
      user.lastBonusClaimed = new Date().toISOString();

      writeDb(db);

      const isAdmin = email.toLowerCase() === "horlandobe@gmail.com";
      res.json({ success: true, user: { ...user, isAdmin } });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST /api/submit-payment
  app.post('/api/submit-payment', (req, res) => {
    try {
      const { email, plan, transactionRef, senderPhone } = req.body;
      if (!email || !plan || !transactionRef || !senderPhone) {
        return res.status(400).json({ error: "Fenoy daholo ny mombamomba ny fandoavam-bola azafady." });
      }

      const db = readDb();
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        return res.status(404).json({ error: "Mila misoratra anarana aloha." });
      }

      const newClaim: DbPaymentClaim = {
        id: 'pay_' + Math.random().toString(36).substr(2, 9),
        email: email.toLowerCase(),
        plan: plan,
        transactionRef: transactionRef,
        senderPhone: senderPhone,
        status: "pending",
        createdAt: new Date().toISOString()
      };

      db.payments.push(newClaim);
      writeDb(db);

      res.json({ success: true, claim: newClaim });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ADMIN ENDPOINTS
  app.get('/api/admin/dashboard-stats', (req, res) => {
    try {
      const { adminEmail } = req.query;
      if (adminEmail !== "horlandobe@gmail.com") {
        return res.status(403).json({ error: "Unauthorized access" });
      }

      const db = readDb();
      res.json({
        success: true,
        users: db.users,
        payments: db.payments,
        geminiKeys: db.geminiKeys || []
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/admin/save-keys', (req, res) => {
    try {
      const { adminEmail, keys } = req.body;
      if (adminEmail !== "horlandobe@gmail.com") {
        return res.status(403).json({ error: "Unauthorized access" });
      }

      if (!Array.isArray(keys)) {
        return res.status(400).json({ error: "Keys must be an array" });
      }

      const db = readDb();
      db.geminiKeys = keys.filter(k => typeof k === 'string' && k.trim().length > 0);
      writeDb(db);

      res.json({ success: true, keys: db.geminiKeys });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/admin/payments/approve', (req, res) => {
    try {
      const { adminEmail, paymentId } = req.body;
      if (adminEmail !== "horlandobe@gmail.com") {
        return res.status(403).json({ error: "Unauthorized access" });
      }

      const db = readDb();
      const payment = db.payments.find(p => p.id === paymentId);

      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      if (payment.status !== "pending") {
        return res.status(400).json({ error: "Payment already processed" });
      }

      const user = db.users.find(u => u.email.toLowerCase() === payment.email.toLowerCase());
      if (!user) {
        return res.status(404).json({ error: "Associated user not found" });
      }

      // Map plans to credits
      // 10000ar -> 150 credits
      // 20000ar -> 300 credits
      // 50000ar -> 450 credits
      let creditAdd = 0;
      if (payment.plan === "10000ar") creditAdd = 150;
      else if (payment.plan === "20000ar") creditAdd = 300;
      else if (payment.plan === "50000ar") creditAdd = 450;

      user.credits = (user.credits || 0) + creditAdd;
      payment.status = "approved";

      writeDb(db);

      res.json({ success: true, user, payment });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/admin/payments/reject', (req, res) => {
    try {
      const { adminEmail, paymentId } = req.body;
      if (adminEmail !== "horlandobe@gmail.com") {
        return res.status(403).json({ error: "Unauthorized access" });
      }

      const db = readDb();
      const payment = db.payments.find(p => p.id === paymentId);

      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      payment.status = "rejected";
      writeDb(db);

      res.json({ success: true, payment });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // GET /api/github/status
  app.get('/api/github/status', (req, res) => {
    try {
      const hasToken = !!process.env.GITHUB_TOKEN;
      const hasRenderFixedKey = !!process.env.RENDER_API_KEY_FIXED;
      res.json({
        success: true,
        hasToken,
        hasRenderFixedKey
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST /api/github/deploy
  app.post('/api/github/deploy', async (req, res) => {
    try {
      const { token, username, repoName, htmlCode, email, renderApiKey, deployPlatform } = req.body;
      const effectiveToken = (token || '').trim() || (process.env.GITHUB_TOKEN || '').trim();

      if (!effectiveToken || !repoName || !htmlCode) {
        return res.status(400).json({ 
          error: "Fenoy daholo ny mombamomba ny fametrahana azafady. " + 
                 (!effectiveToken ? "Mila mampiditra GitHub Token." : "Mila anarana repository.") 
        });
      }

      console.log(`🚀 Starting GitHub deployment for user ${username || 'Server default'} to repo ${repoName}...`);
      const result = await deployToGitHub({
        token: (token || '').trim(), // Let deployToGitHub resolve default if blank
        username: (username || '').trim(),
        repoName,
        htmlCode
      });

      if (result.success) {
        let finalPagesUrl = result.pagesUrl || `https://${username || 'default'}.github.io/${repoName}/`;
        let deployType = "github";

        // If Render is requested, also trigger Render Static Site Deployment!
        if (deployPlatform === 'render') {
          console.log(`🚀 Render deployment initiated for repo: ${result.repoUrl}...`);
          const renderResult = await deployToRender({
            apiKey: (renderApiKey || '').trim(),
            repoUrl: result.repoUrl,
            repoName
          });
          
          console.log(`🔍 Render result:`, renderResult);

          if (renderResult.success && renderResult.url) {
            finalPagesUrl = renderResult.url;
            deployType = "render";
            console.log(`✅ Render deployment completed successfully: ${finalPagesUrl}`);
          } else {
            const errorMsg = renderResult.error || 'Tsy fantatra ny antony';
            console.error(`❌ Render deployment failed:`, errorMsg);
            return res.status(500).json({ 
              error: `Nahomby ny fampitahana tamin'ny GitHub, saingy nisy olana ny fametrahana tamin'ny Render: ${errorMsg}` 
            });
          }
        }

        let updatedUser = null;
        if (email) {
          const db = readDb();
          const userIndex = db.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
          if (userIndex >= 0) {
            const user = db.users[userIndex];
            if (!user.deployments) {
              user.deployments = [];
            }
            // Check if repoName is already in deployments
            const existingIndex = user.deployments.findIndex(d => d.repoName.toLowerCase() === repoName.toLowerCase());
            const deployItem = {
              repoName,
              repoUrl: result.repoUrl || `https://github.com/${username || 'default'}/${repoName}`,
              pagesUrl: finalPagesUrl,
              updatedAt: new Date().toISOString()
            };
            if (existingIndex >= 0) {
              user.deployments[existingIndex] = deployItem;
            } else {
              user.deployments.push(deployItem);
            }
            db.users[userIndex] = user;
            writeDb(db);
            const isAdmin = email.toLowerCase() === "horlandobe@gmail.com";
            updatedUser = { ...user, isAdmin };
          }
        }
        res.json({ 
          success: true, 
          repoUrl: result.repoUrl, 
          pagesUrl: finalPagesUrl,
          deployType,
          user: updatedUser
        });
      } else {
        res.status(500).json({ error: result.error });
      }
    } catch (e: any) {
      console.error("GitHub/Render deployment controller error:", e);
      res.status(500).json({ error: e.message || "Tsy nandeha ny famoronana ao amin'ny GitHub/Render." });
    }
  });

  // OPTIONS /api/public/submit (CORS preflight)
  app.options('/api/public/submit', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
  });

  // POST /api/public/submit (Secure public form endpoint for AI generated sites)
  app.post('/api/public/submit', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    try {
      const { email, projectName, formName, data } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Site owner email is required." });
      }

      const db = readDb();
      const userIndex = db.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

      if (userIndex < 0) {
        return res.status(404).json({ error: "Site owner not found." });
      }

      const user = db.users[userIndex];
      if (!user.submissions) {
        user.submissions = [];
      }

      const newSubmission = {
        id: 'sub_' + Math.random().toString(36).substr(2, 9),
        projectName: projectName || "Tetikasa",
        formName: formName || "Contact Form",
        data: data || {},
        submittedAt: new Date().toISOString()
      };

      user.submissions.push(newSubmission);
      db.users[userIndex] = user;
      writeDb(db);

      res.json({ 
        success: true, 
        message: "Tafiditra soa aman-tsara ny hafatrao (Form submitted securely)!" 
      });
    } catch (e: any) {
      console.error("Public submission endpoint error:", e);
      res.status(500).json({ error: e.message || "Tsy nandeha ny fandefasana." });
    }
  });

  // POST /api/user/submissions/delete (Securely delete a form submission)
  app.post('/api/user/submissions/delete', (req, res) => {
    try {
      const { email, submissionId } = req.body;
      if (!email || !submissionId) {
        return res.status(400).json({ error: "Email and submissionId are required." });
      }

      const db = readDb();
      const userIndex = db.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

      if (userIndex < 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = db.users[userIndex];
      if (user.submissions) {
        user.submissions = user.submissions.filter(s => s.id !== submissionId);
      }

      db.users[userIndex] = user;
      writeDb(db);

      const isAdmin = email.toLowerCase() === "horlandobe@gmail.com";
      res.json({ success: true, user: { ...user, isAdmin } });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST /api/generate-site
  app.post('/api/generate-site', async (req, res) => {
    try {
      const { prompt, existingCode, userEmail } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      // 1. Verify User exists and has credits
      const db = readDb();
      let user = db.users.find(u => u.email.toLowerCase() === (userEmail || "").toLowerCase());

      if (!user) {
        return res.status(400).json({ error: "Mila misoratra anarana aloha." });
      }

      if (user.credits <= 0) {
        return res.status(402).json({ error: "Lany ny credits-nao. Manaraha recharge azafady mba hitohizana.", isCreditsExhausted: true });
      }

      // 2. Select Gemini Key from multiple options (Rotation/Env/Db)
      let activeKey = rotateGeminiKey();
      if (!activeKey) {
        activeKey = process.env.GEMINI_API_KEY || null;
      }

      if (!activeKey) {
        return res.status(500).json({ error: "Tsy misy Gemini API Key voamarina amin'izao fotoana izao. Mifandraisa amin'ny Admin." });
      }

      const protocol = req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
      const hostUrl = `${protocol}://${req.get('host')}`;

      // 3. Assemble full system instruction & prompt
      const SYSTEM_INSTRUCTION = `Ianao dia DEVWEB IA, mpamorona tranonkala matihanina.
Fitsipika :
1. Output = HTML tokana (single-file) fotsiny, miaraka amin'ny styles (Tailwind CSS) sy JavaScript interactive.
2. Tailwind CSS dia tsy maintsy CDN fotsiny: <script src="https://cdn.tailwindcss.com"></script>
3. Mampiasa Font Awesome v6.4.0 (ho an'ny icons): <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
4. Google Fonts tsara tarehy araka ny soso-kevitra (Plus Jakarta Sans, Space Grotesk, Playfair Display, sns.)
5. Mampiasa sary Unsplash matihanina fotsiny ho an'ny sary (ohatra: https://images.unsplash.com/photo-...).
6. Lahatsoratra tena misy dikany sy mifanaraka amin'ny tontolo Malagasy. TSY MAHAZO mampiasa Lorem Ipsum mihitsy.
7. JavaScript interactive feno: Hamburger menu, dark-mode toggle, smooth scrolling, modal popup, portfolio filters.
8. RAFI-DRAFITRA BACKEND SY FIAROVANA (SECURE BACK-END FOR FORMS):
   Raha misy formulaire (Contact, Booking, Newsletter registration, sns.) ity tranonkala ity, ampiasao ity kaody JavaScript ity rehefa misy mandefa (submit) ny formulaire:
   - Alefaso amin'ny alalan'ny fetch() ny angon-drakitra miaraka amin'ny POST request any amin'ny: "${hostUrl}/api/public/submit"
   - Ny headers dia: { 'Content-Type': 'application/json' }
   - Ny body dia JSON manana ity rafitra ity:
     {
       "email": "${user.email}",
       "projectName": "${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}",
       "formName": "Formulaire",
       "data": Object.fromEntries(new FormData(formElement))
     }
   - Ohatra amin'ny fampiharana:
     const form = document.querySelector('form');
     form.addEventListener('submit', async (e) => {
       e.preventDefault();
       try {
         const formData = new FormData(form);
         const res = await fetch('${hostUrl}/api/public/submit', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             email: '${user.email}',
             projectName: '${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}',
             formName: 'Fifandraisana',
             data: Object.fromEntries(formData)
           })
         });
         const data = await res.json();
         // Aorian'ny fahombiazana (success), asehoy ny modal success tsara tarehy miaraka amin'ny hafatra madio
         alert('Tafiditra soa aman-tsara ny hafatrao! Handray an-tanana izany izahay aorian\'ny fanamarinana.');
       } catch (err) {
         console.error(err);
       }
     });
9. Rohy rehetra:
     - TSY MAHAZO href="/" na action="/" mba tsy hiverenana any amin'ny applet.
     - Ny nav rehetra dia href="#section-id" na href="javascript:void(0)".
10. Kaody madio misy comments Malagasy fohy.

Raha misy existingCode omena anao, ovay araka ny fangatahana fotsiny io fa aza soloina tanteraka. Tazomy ny rafitra sy ny design efa misy ary hatsarao fotsiny.
Ny valiny omena dia TSY MAHAZO misy resaka na fanazavana hafa ankoatry ny code HTML ao anaty block \`\`\`html ... \`\`\` fotsiny.`;

      let userQuery = "";
      if (existingCode) {
        userQuery = `Ity ny kaody efa misy izao:\n\`\`\`html\n${existingCode}\n\`\`\`\n\nFangatahana fanovana na fampitomboana vaovao: ${prompt}`;
      } else {
        userQuery = `Mamoròna tranonkala vaovao mifanaraka amin'ity soso-kevitra ity: ${prompt}`;
      }

      // 4. Initialize Gemini API Client
      const ai = new GoogleGenAI({ apiKey: activeKey });
      
      console.log(`🤖 Invoking Gemini API via rotated key... User: ${userEmail}`);
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: userQuery }]
          }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7
        }
      });

      const responseText = response.text || "";
      
      // 5. Extract HTML block cleanly
      let htmlCode = "";
      const match = responseText.match(/```html([\s\S]*?)```/i);
      if (match && match[1]) {
        htmlCode = match[1].trim();
      } else {
        // Fallback: search for <html> tag or use raw response
        if (responseText.includes("<html") || responseText.includes("<!DOCTYPE")) {
          htmlCode = responseText.trim();
        } else {
          throw new Error("Tsy nahazo kaody HTML manan-kery avy amin'ny Gemini AI. Andramo indray.");
        }
      }

      // 6. Token calculations & billing
      // Calculate token approximation if not returned
      const totalTokens = response.usageMetadata?.totalTokenCount || Math.ceil(htmlCode.length / 3.5);
      
      // Credit system: 1 credit = 20,000 tokens
      const creditCost = parseFloat((totalTokens / 20000).toFixed(4));
      
      user.credits = Math.max(0, parseFloat((user.credits - creditCost).toFixed(4)));
      user.tokensUsed = (user.tokensUsed || 0) + totalTokens;
      
      writeDb(db);

      // 7. Supabase SaaS Sync
      const supabaseResult = await supabaseSyncNewProject(
        user.id,
        user.email,
        prompt.slice(0, 30),
        prompt,
        htmlCode
      );

      res.json({
        success: true,
        code: htmlCode,
        rawExplanation: responseText.replace(/```html[\s\S]*?```/i, "").trim(),
        tokensUsed: totalTokens,
        creditCost: creditCost,
        userCredits: user.credits,
        supabaseResult
      });

    } catch (e: any) {
      console.error("AI Generation failed:", e);
      res.status(500).json({ error: e.message || "Tsy nandeha ny famoronana tranonkala. Manaraha fanandramana indray azafady." });
    }
  });

  // Integrate Vite for dev, serve static in production
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 DEVWEB IA Backend Server listening on http://localhost:${PORT}`);
  });
}

startServer();
