import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, serviceKey, { db: { schema: "verge_customization" } });

async function run() {
  const { data } = await supabase.from("conversations").select("created_at").limit(1);
  console.log("created_at string:", data?.[0]?.created_at);
  console.log("With T?", data?.[0]?.created_at.includes("T"));
}

run();
