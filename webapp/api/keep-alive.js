export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Faltan credenciales de Supabase' });
    }

    // Hacemos un pequeño ping a una tabla cualquiera (ej. miembros) limitando a 1 para no consumir recursos
    const response = await fetch(`${supabaseUrl}/rest/v1/miembros?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error en el ping: ${response.statusText}`);
    }

    const data = await response.json();

    return res.status(200).json({ 
      success: true, 
      message: 'Ping a Supabase exitoso. Proyecto activo.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
