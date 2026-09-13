export default async function handler(req, res) {
  try {
    // IMPORTANTE: En Vercel Serverless, las variables VITE_* solo existen en el
    // bundle del frontend. El servidor usa SUPABASE_URL y SUPABASE_ANON_KEY
    // (sin prefijo VITE_). Asegúrate de tenerlas definidas en Vercel Dashboard.
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Faltan credenciales de Supabase (SUPABASE_URL / SUPABASE_ANON_KEY)' });
    }

    // Ping liviano: solo pedimos el id de 1 fila para confirmar que Supabase está activo
    const response = await fetch(`${supabaseUrl}/rest/v1/miembros?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error en el ping: ${response.statusText}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Ping a Supabase exitoso. Proyecto activo.',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
