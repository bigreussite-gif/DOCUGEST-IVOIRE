// Insforge edge function - SQL proxy for Vercel app
// Uses injected API_KEY to execute raw SQL queries
// Protected by a shared secret

const PROXY_SECRET = "docugest_sql_proxy_2026_x7k9p2m4";

module.exports = async function(req: Request): Promise<Response> {
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Proxy-Secret',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders
    });
  }

  // Authenticate
  const secret = req.headers.get('X-Proxy-Secret');
  if (!secret || secret !== PROXY_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: corsHeaders
    });
  }

  // Parse body
  let query: string;
  let params: unknown[];
  try {
    const body = await req.json();
    query = body.query;
    params = body.params ?? [];
  } catch(err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: corsHeaders
    });
  }

  if (!query || typeof query !== 'string') {
    return new Response(JSON.stringify({ error: 'Missing query' }), {
      status: 400,
      headers: corsHeaders
    });
  }

  // Execute SQL using injected API_KEY
  const apiKey = Deno.env.get('API_KEY');
  const baseUrl = Deno.env.get('INSFORGE_BASE_URL');

  if (!apiKey || !baseUrl) {
    return new Response(JSON.stringify({ error: 'Missing env config' }), {
      status: 500,
      headers: corsHeaders
    });
  }

  try {
    const resp = await fetch(`${baseUrl}/api/database/advance/rawsql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({ query, params })
    });

    const result = await resp.json();

    return new Response(JSON.stringify(result), {
      status: resp.status,
      headers: corsHeaders
    });
  } catch(err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
