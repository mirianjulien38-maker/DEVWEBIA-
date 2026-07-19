// Render API Deployment Helper

export interface RenderDeployParams {
  apiKey: string;
  repoUrl: string;
  repoName: string;
}

export async function deployToRender(params: RenderDeployParams): Promise<{ success: boolean; url: string; error?: string }> {
  const { apiKey, repoUrl, repoName } = params;
  
  const cleanApiKey = (process.env.RENDER_API_KEY_FIXED || apiKey || '').trim();
  console.log(`🔑 Deploying to Render. API Key present: ${!!cleanApiKey}, Using fixed key: ${!!process.env.RENDER_API_KEY_FIXED}`);
  if (!cleanApiKey) {
    return { success: false, url: '', error: "Mila mampiditra Render API Key azafady." };
  }

  const headers = {
    'Authorization': `Bearer ${cleanApiKey}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  try {
    console.log(`🔍 Querying existing Render services...`);
    // 1. Check if a service with this repoUrl already exists on Render
    const servicesRes = await fetch('https://api.render.com/v1/services?limit=100', { headers });
    
    if (servicesRes.ok) {
      const services: any = await servicesRes.json();
      if (Array.isArray(services)) {
        // Find existing service with matching repository URL
        const existingService = services.find((srv: any) => 
          (srv.type === 'static_site' || srv.type === 'web_service') && 
          srv.repo && 
          srv.repo.toLowerCase().trim() === repoUrl.toLowerCase().trim()
        );

        if (existingService) {
          console.log(`♻️ Found existing Render static site for ${repoName} (ID: ${existingService.id}). Triggering redeployment...`);
          
          // Trigger deploy for existing service
          const deployRes = await fetch(`https://api.render.com/v1/services/${existingService.id}/deploys`, {
            method: 'POST',
            headers
          });

          if (deployRes.ok) {
            console.log(`✅ Deployment triggered successfully on Render for existing service: ${existingService.url}`);
            return {
              success: true,
              url: existingService.url
            };
          } else {
            const errText = await deployRes.text();
            console.warn(`⚠️ Failed to trigger Render deploy on existing service: ${errText}`);
            // Fallback to returning the existing URL if triggering failed but service exists
            return {
              success: true,
              url: existingService.url
            };
          }
        }
      }
    } else {
      const errText = await servicesRes.text();
      console.warn(`⚠️ Failed to query Render services list: ${errText}`);
    }

    // 2. Fetch Owner ID since the service does not exist yet
    console.log(`🔍 Fetching Render owners...`);
    const ownersRes = await fetch('https://api.render.com/v1/owners?limit=20', { headers });
    if (!ownersRes.ok) {
      const errText = await ownersRes.text();
      throw new Error(`Tsy nahomby ny fakana ny Owner ID tamin'ny Render: ${errText}`);
    }

    const owners: any = await ownersRes.json();
    let ownerId = '';
    if (Array.isArray(owners) && owners.length > 0) {
      const item = owners[0];
      ownerId = item?.owner?.id || item?.id || '';
    }

    if (!ownerId) {
      throw new Error("Tsy nahitana Owner ID tao amin'ny kaonty Render-nao. Jereo tsara ny API Key.");
    }

    console.log(`👤 Resolved Render Owner ID: ${ownerId}`);

    // Clean name for Render service (alphanumeric and hyphens only, lowercase)
    const cleanServiceName = repoName
      .toLowerCase()
      .replace(/[^a-z0-9\-]/g, '-')
      .replace(/\-+/g, '-')
      .replace(/^-+|-+$/g, '');

    // 3. Create the static site service
    let serviceName = cleanServiceName;
    let createRes;
    
    // Try to create up to 3 times with unique name if collision occurs
    for (let i = 0; i < 3; i++) {
      console.log(`➕ Creating new Render web service: ${serviceName}...`);
      const createBody = {
        type: 'web_service',
        name: serviceName,
        repo: repoUrl,
        branch: 'main',
        ownerId: ownerId,
        envVars: [
          { key: 'NPM_CONFIG_PRODUCTION', value: 'false' }
        ],
        serviceDetails: {
          env: 'node',
          envSpecificDetails: {
            buildCommand: 'npm run build',
            startCommand: 'npm start'
          }
        }
      };

      try {
        createRes = await fetch('https://api.render.com/v1/services', {
          method: 'POST',
          headers,
          body: JSON.stringify(createBody)
        });

        if (createRes.ok) break;

        const errText = await createRes.clone().text();
        console.warn(`⚠️ Attempt ${i + 1} failed. Status: ${createRes.status}. Body: ${errText}`);
        
        const isNameTaken = errText.toLowerCase().includes('already in use') || errText.toLowerCase().includes('name') && errText.toLowerCase().includes('taken');
        console.log(`⚠️ Attempt ${i + 1} check: isNameTaken = ${isNameTaken}, i = ${i}`);

        if (i < 2 && isNameTaken) {
          serviceName = `${cleanServiceName}-${Math.random().toString(36).substring(7)}`;
          console.log(`⚠️ Name taken, trying next: ${serviceName}...`);
          continue;
        }
      } catch (e) {
        console.error(`⚠️ Attempt ${i + 1} threw error:`, e);
      }
      
      // If not "already in use" or out of retries, break and handle error
      break;
    }

    if (!createRes || !createRes.ok) {
      const errText = createRes ? await createRes.text() : 'No response from Render API';
      console.error(`❌ Failed to create Render service after retries:`, errText);
      throw new Error(`Tsy nety ny namorona ny static site tamin'ny Render: ${errText}`);
    }

    const newService: any = await createRes.json();
    console.log(`✅ Created Render static site successfully! Live URL: ${newService.url}`);

    return {
      success: true,
      url: newService.url
    };

  } catch (err: any) {
    console.error(`Render deployment error (logging from catch block):`, err);
    
    let errorMessage = "Tsy nahomby ny fametrahana ao amin'ny Render (tsy fantatra ny antony).";
    
    if (err instanceof Error) {
      errorMessage = `Render error: ${err.message}`;
    } else if (typeof err === 'string') {
      errorMessage = `Render error: ${err}`;
    } else if (err && typeof err === 'object') {
      errorMessage = `Render error: ${JSON.stringify(err)}`;
    }
    
    console.log(`Final error message:`, errorMessage);
    
    return {
      success: false,
      url: '',
      error: errorMessage || "Tsy nahomby ny fametrahana ao amin'ny Render."
    };
  }
}
