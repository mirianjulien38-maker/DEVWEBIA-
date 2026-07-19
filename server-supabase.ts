import { createClient } from '@supabase/supabase-js';

let supabaseClient: any = null;

export function getSupabase() {
  if (supabaseClient) return supabaseClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (url && key) {
    try {
      supabaseClient = createClient(url, key);
      console.log("🟢 Supabase client initialized successfully!");
      return supabaseClient;
    } catch (e) {
      console.error("⚠️ Failed to initialize Supabase client:", e);
    }
  } else {
    console.warn(`⚠️ Supabase configuration missing! URL: ${url ? 'present' : 'missing'}, Key: ${key ? 'present' : 'missing'}`);
  }
  return null;
}

export async function supabaseSyncNewProject(
  userId: string,
  userEmail: string,
  projectName: string,
  prompt: string,
  htmlCode: string
) {
  const client = getSupabase();
  if (!client) {
    return { status: "mocked", message: "Supabase not configured in .env, mock-synced successfully." };
  }

  try {
    // 1. Check if a website with the same name and user email already exists
    const { data: existing, error: fetchError } = await client
      .from('websites')
      .select('id')
      .eq('user_email', userEmail)
      .eq('name', projectName)
      .limit(1);

    if (fetchError) {
      console.warn("⚠️ Warning checking existing website in Supabase:", fetchError);
    }

    if (existing && existing.length > 0) {
      // 2. If it exists, update the existing website record
      console.log(`🔄 Updating existing website in Supabase for ${userEmail} (ID: ${existing[0].id})`);
      const { data, error } = await client
        .from('websites')
        .update({
          prompt: prompt,
          code: htmlCode,
          created_at: new Date().toISOString()
        })
        .eq('id', existing[0].id)
        .select();

      if (error) {
        console.error("❌ Supabase update error:", error);
        return { status: "error", error: error.message };
      }

      return { status: "synced_updated", projectId: existing[0].id, data };
    } else {
      // 3. Otherwise, insert a new website record
      console.log(`➕ Inserting new website in Supabase for ${userEmail}`);
      const { data, error } = await client
        .from('websites')
        .insert([
          {
            user_id: userId,
            user_email: userEmail,
            name: projectName,
            prompt: prompt,
            code: htmlCode,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        console.error("❌ Supabase insert error:", error);
        return { status: "error", error: error.message };
      }

      const newId = data && data[0] ? data[0].id : null;
      return { status: "synced_inserted", projectId: newId, data };
    }
  } catch (e: any) {
    console.error("❌ Supabase sync exception:", e);
    return { status: "error", error: e.message || e };
  }
}
