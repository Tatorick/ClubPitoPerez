import { supabase } from './../lib/supabase';

/**
 * Servicio para interactuar con Facturero Móvil
 */
class FactureroService {
  constructor() {
    this.token = null;
    this.config = null;
  }

  async loadConfig() {
    const { data } = await supabase.from('config_club').select('*').maybeSingle();
    this.config = data;
    return data;
  }

  async login() {
    if (!this.config) await this.loadConfig();
    
    const username = this.config?.facturero_user || import.meta.env.VITE_FACTURERO_USER;
    const password = this.config?.facturero_password || import.meta.env.VITE_FACTURERO_PASSWORD;
    const ambiente = this.config?.facturero_ambiente || 'pruebas';
    const baseUrl = ambiente === 'produccion' 
      ? 'https://app.factureromovil.com/api' 
      : 'http://apptest.factureromovil.com/api';

    if (!username || !password) {
      throw new Error('Faltan credenciales de Facturero Móvil en la Configuración del Club');
    }

    const response = await fetch(`${baseUrl}/login_check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _username: username, _password: password })
    });

    if (!response.ok) {
      throw new Error('Error al autenticar con Facturero Móvil');
    }

    const data = await response.json();
    this.token = data.token;
    return this.token;
  }

  async fetchWithAuth(endpoint, options = {}) {
    const ambiente = this.config?.facturero_ambiente || 'pruebas';
    const baseUrl = ambiente === 'produccion' ? 'https://app.factureromovil.com/api' : 'http://apptest.factureromovil.com/api';

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...(options.headers || {})
      }
    });

    if (response.status === 401) {
      await this.login();
      return fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
          ...(options.headers || {})
        }
      });
    }

    return response;
  }

  async crearCliente(cliente) {
    const payload = {
      identificacion: cliente.cedula || '9999999999999',
      tipoIdentificacion: (cliente.cedula && cliente.cedula.length === 13) ? 1 : 2,
      razonSocial: cliente.nombre || 'Consumidor Final',
      direccion: cliente.direccion || 'Quito',
      telefonos: cliente.telefono || '0999999999',
      email: cliente.email || 'correo@ejemplo.com'
    };

    const response = await this.fetchWithAuth('/clientes', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.warn('Error al crear cliente en Facturero (puede que ya exista):', data);
      throw new Error(data.message || 'Error al crear cliente en Facturero Móvil');
    }

    return data;
  }

  async emitirFactura(clienteId, monto) {
    if (!this.config) await this.loadConfig();
    const hoy = new Date().toISOString().split('T')[0];
    const productoId = this.config?.facturero_producto_id || import.meta.env.VITE_FACTURERO_PRODUCTO_ID || "1868";
    
    const payload = {
      fechaEmision: hoy,
      cliente: clienteId,
      infoFactura: {
        detallesFactura: [
          {
            producto: productoId, // ID numérico o string dependiendo de la API, el manual dice producto: "87639"
            cantidad: 1.00,
            precioUnitario: parseFloat(monto),
            descuento: 0
          }
        ]
      },
      pagos: [
        {
          formaPagoSri: 20,
          total: monto.toString(),
          plazo: 1,
          unidadTiempo: "Dias"
        }
      ]
    };

    const response = await this.fetchWithAuth('/documentos/facturas', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Error al emitir factura: ${err}`);
    }

    return await response.json();
  }
}

export const factureroService = new FactureroService();
