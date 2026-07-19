// GitHub API Deployment Helper
import { Buffer } from 'buffer';

export async function deployToGitHub(params: {
  token: string;
  username: string;
  repoName: string;
  htmlCode: string;
}) {
  const { token, username, repoName, htmlCode } = params;

  // 0. Robust Sanitization to prevent non-ASCII or ByteString conversion errors
  let cleanToken = (token || '').trim();
  if (cleanToken.toLowerCase().startsWith('bearer ')) {
    cleanToken = cleanToken.slice(7).trim();
  }
  // Keep only classic GitHub PAT characters (alphanumeric, underscores, hyphens)
  cleanToken = cleanToken.replace(/[^a-zA-Z0-9_\-]/g, '');

  // Fallback to server GITHUB_TOKEN if client token is empty or invalid
  if (!cleanToken && process.env.GITHUB_TOKEN) {
    let fallbackToken = process.env.GITHUB_TOKEN.trim();
    if (fallbackToken.toLowerCase().startsWith('bearer ')) {
      fallbackToken = fallbackToken.slice(7).trim();
    }
    cleanToken = fallbackToken.replace(/[^a-zA-Z0-9_\-]/g, '');
  }

  // Keep only alphanumeric and hyphen characters for username
  let cleanUsername = (username || '').trim().replace(/[^a-zA-Z0-9\-]/g, '');

  // Keep only alphanumeric, hyphen, underscore, or period for repository name
  const cleanRepoName = (repoName || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-_.]/g, '-')
    .replace(/\-+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!cleanToken) {
    throw new Error("Ny token-nao dia tsy mety na tsy misy (Token invalide).");
  }

  const headers = {
    "Authorization": `Bearer ${cleanToken}`,
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "DEVWEB-IA-Applet"
  };

  // 0.5. Verify token and resolve exact username/login to avoid typos
  let tokenScopes: string | null = null;
  try {
    console.log(`🔍 Verifying GitHub token and fetching user profile...`);
    const userRes = await fetch("https://api.github.com/user", { headers });
    
    // Read the X-OAuth-Scopes header which lists scopes of a classic token
    tokenScopes = userRes.headers.get("X-OAuth-Scopes");
    console.log(`GitHub token scopes header: ${tokenScopes}`);

    if (userRes.ok) {
      const userData: any = await userRes.json();
      if (userData && userData.login) {
        console.log(`👤 Authenticated as GitHub user: ${userData.login}`);
        // Always use the exact authenticated username to prevent any typo, casing, or email mismatch issues.
        console.log(`🔄 Force-overriding username '${cleanUsername}' with actual token owner: '${userData.login}'`);
        cleanUsername = userData.login;
      }
    } else {
      const errText = await userRes.text();
      console.warn(`⚠️ Could not verify user profile (status: ${userRes.status}): ${errText}`);
      if (userRes.status === 401) {
        throw new Error("Tsy mety ny Token nampidirinao (Token invalide). Hamarino tsara fa nadikanao manontolo izy io.");
      }
    }
  } catch (err: any) {
    console.warn(`⚠️ Error checking GitHub user profile:`, err);
    if (err.message && err.message.includes("Token invalide")) {
      throw err;
    }
  }

  // If token is Classic but lacks 'repo' scope
  if (tokenScopes !== null) {
    const scopeList = tokenScopes.split(',').map(s => s.trim());
    if (!scopeList.includes('repo')) {
      throw new Error(`Ny Token-nao dia tsy manana ny alalana "repo" (Scopes misy: [${tokenScopes}]). Jereo tsara ilay sary torolalana ary asio marika (check) ny "repo" rehefa mamorona token ao amin'ny GitHub.`);
    }
  }

  if (!cleanUsername) {
    throw new Error("Ny anaran'ny mpampiasa (Username) dia tsy mety.");
  }
  if (!cleanRepoName) {
    throw new Error("Ny anaran'ny repository dia tsy mety.");
  }

  let defaultBranch = "main";

  try {
    // 1. Check if repository exists
    console.log(`🔍 Checking if repository ${cleanUsername}/${cleanRepoName} exists...`);
    const repoCheckRes = await fetch(`https://api.github.com/repos/${cleanUsername}/${cleanRepoName}`, { headers });
    
    if (repoCheckRes.status === 404) {
      // 2. Create the repository since it does not exist
      console.log(`➕ Repository ${cleanRepoName} not found, creating it...`);
      const createRes = await fetch(`https://api.github.com/user/repos`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: cleanRepoName,
          description: "Mamorona tranonkala amin'ny alalan'ny DEVWEB IA",
          private: false,
          auto_init: true
        })
      });

      if (!createRes.ok) {
        const errText = await createRes.text();
        if (createRes.status === 403 || errText.includes("Resource not accessible")) {
          if (tokenScopes === null) {
            throw new Error(
              "KOLONTSAINA: Mampiasa Fine-grained Token ianao na tsy misy scopes. " +
              "Ny Fine-grained Token dia tsy mahazo mamorona repository ho an'ny kaonty manokana. " +
              "Azafady, mamorona \"Classic Token\" ary asio marika ny \"repo\" (toy ny ao amin'ny sary nalefanao) mba hahafahany mamorona repository."
            );
          } else {
            throw new Error(
              `Tsy nahazo alalana hamorona repository ny Token-nao (Scopes: [${tokenScopes}]). ` +
              `Hamarino tsara fa voafidy ny "repo" scope amin'ny Classic Token-nao.`
            );
          }
        }
        throw new Error(`Tsy nahomby ny famoronana repository: ${errText}`);
      }
      
      const createdRepo = await createRes.json();
      if (createdRepo && createdRepo.default_branch) {
        defaultBranch = createdRepo.default_branch;
      }
      console.log(`✅ Repository ${cleanRepoName} created successfully. Default branch: ${defaultBranch}`);
      
      // Wait for GitHub to initialize the default branch
      await new Promise(resolve => setTimeout(resolve, 3000));
    } else if (repoCheckRes.ok) {
      const existingRepo = await repoCheckRes.json();
      if (existingRepo && existingRepo.default_branch) {
        defaultBranch = existingRepo.default_branch;
      }
      console.log(`✅ Repository ${cleanRepoName} already exists. Default branch: ${defaultBranch}`);
    } else {
      const errText = await repoCheckRes.text();
      throw new Error(`Fanamarinana repository tsy nahomby: ${errText}`);
    }

    // 3. Write index.html to the repository
    const base64Content = Buffer.from(htmlCode, 'utf-8').toString('base64');
    
    console.log(`🔍 Checking if index.html already exists in ${cleanUsername}/${cleanRepoName}...`);
    let fileSha: string | undefined = undefined;
    const fileCheckRes = await fetch(`https://api.github.com/repos/${cleanUsername}/${cleanRepoName}/contents/index.html?ref=${defaultBranch}`, { headers });
    
    if (fileCheckRes.ok) {
      const fileData: any = await fileCheckRes.json();
      fileSha = fileData.sha;
      console.log(`✅ index.html exists on branch ${defaultBranch}. SHA found: ${fileSha}`);
    }

    console.log(`✍️ Writing index.html to ${cleanUsername}/${cleanRepoName} on branch ${defaultBranch}...`);
    const writeRes = await fetch(`https://api.github.com/repos/${cleanUsername}/${cleanRepoName}/contents/index.html`, {
      method: "PUT",
      headers: {
        ...headers,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Déploiement automatique depuis DEVWEB IA",
        content: base64Content,
        sha: fileSha,
        branch: defaultBranch
      })
    });

    if (!writeRes.ok) {
      const errText = await writeRes.text();
      throw new Error(`Tsy nahomby ny fanoratana index.html: ${errText}`);
    }
    console.log(`✅ index.html written successfully.`);

    // 4. Enable GitHub Pages if not already set up
    console.log(`🔍 Checking/Enabling GitHub Pages for ${cleanUsername}/${cleanRepoName}...`);
    const pagesCheckRes = await fetch(`https://api.github.com/repos/${cleanUsername}/${cleanRepoName}/pages`, { headers });
    
    if (pagesCheckRes.status === 404) {
      console.log(`🌐 GitHub Pages is not enabled. Activating now with branch ${defaultBranch}...`);
      const enablePagesRes = await fetch(`https://api.github.com/repos/${cleanUsername}/${cleanRepoName}/pages`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          source: {
            branch: defaultBranch,
            path: "/"
          }
        })
      });

      if (!enablePagesRes.ok) {
        const errText = await enablePagesRes.text();
        console.warn(`⚠️ Warning activating Pages: ${errText}`);
      } else {
        console.log(`🌐 GitHub Pages enabled successfully.`);
      }
    } else {
      console.log(`🌐 GitHub Pages is already configured.`);
    }

    return {
      success: true,
      repoUrl: `https://github.com/${cleanUsername}/${cleanRepoName}`,
      pagesUrl: `https://${cleanUsername}.github.io/${cleanRepoName}/`
    };

  } catch (error: any) {
    console.error("❌ GitHub deploy error:", error);
    return {
      success: false,
      error: error.message || error
    };
  }
}
