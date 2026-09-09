const API_URL = import.meta.env.VITE_FACTURERO_API_URL || 'http://apptest.factureromovil.com/api';

/**
 * Servicio para interactuar con Facturero Móvil
 */
class FactureroService {
  constructor() {
    this.token = null;
  }

  async login() {
    const username = import.meta.env.VITE_FACTURERO_USER;
    const password = import.meta.env.VITE_FACTURERO_PASSWORD;

    if (!username || !password) {
      throw new Error('Faltan credenciales de Facturero Móvil en las variables de entorno');
    }

    const response = await fetch(`${API_URL}/login_check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        _username: username,
        _password: password
      })
    });

    if (!response.ok) {
      throw new Error('Error al autenticar con Facturero Móvil');
    }

    const data = await response.json();
    this.token = data.token;
    return this.token;
  }

  async fetchWithAuth(endpoint, options = {}) {
    if (!this.token) {
      await this.login();
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...(options.headers || {})
      }
    });

    if (response.status === 401) {
      await this.login();
      return fetch(`${API_URL}${endpoint}`, {
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
    const hoy = new Date().toISOString().split('T')[0];
    const productoId = import.meta.env.VITE_FACTURERO_PRODUCTO_ID || "1868"; // Reemplazar con ID real
    
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
