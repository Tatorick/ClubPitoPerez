import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useClubConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConfig() {
      const { data, error } = await supabase.from('config_club').select('*').maybeSingle();
      if (!error && data) {
        setConfig(data);
      }
      setLoading(false);
    }
    loadConfig();
  }, []);

  return {
    config,
    precioPension: Number(config?.precio_pension ?? 55.00),
    loading
  };
}
