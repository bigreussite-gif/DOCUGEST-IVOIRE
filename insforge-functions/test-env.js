// Insforge edge function - test env vars availability (Deno runtime)
module.exports = async function(req: Request): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Proxy-Secret',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Deno runtime only
  const getEnv = (key: string): string | undefined => Deno.env.get(key);

  // Check available env vars (masking sensitive values)
  const envKeys = [
    'API_KEY', 'SERVICE_API_KEY', 'SERVICE_KEY', 'ANON_KEY',
    'API_BASE_URL', 'INSFORGE_BASE_URL', 'DATABASE_URL',
    'PG_CONNECTION', 'PGHOST', 'PGUSER', 'PGDATABASE'
  ];

  const available: Record<string, string> = {};
  for (const key of envKeys) {
    const val = getEnv(key);
    if (val) {
      available[key] = val.slice(0, 20) + '...';
    }
  }

  // Try to call rawsql with available keys
  const apiKey = getEnv('API_KEY') ?? getEnv('SERVICE_API_KEY') ?? getEnv('SERVICE_KEY');
  const baseUrl = getEnv('API_BASE_URL') ?? getEnv('INSFORGE_BASE_URL');
  let sqlResult: unknown = null;

  if (apiKey && baseUrl) {
    try {
      const resp = await fetch(`${baseUrl}/api/database/advance/rawsql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify({ query: 'SELECT 1 as ok', params: [] })
      });
      sqlResult = await resp.json();
    } catch(err) {
      sqlResult = { error: err instanceof Error ? err.message : String(err) };
    }
  }

  return new Response(JSON.stringify({
    runtime: 'deno',
    availableEnvKeys: Object.keys(available),
    maskedValues: available,
    sqlTestResult: sqlResult
  }, null, 2), {
    status: 200,
    headers: corsHeaders
  });
};
