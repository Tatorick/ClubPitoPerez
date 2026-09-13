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
    
    // Las credenciales de Facturero Móvil deben estar en la tabla config_club
    // (campo facturero_user y facturero_password). NO usar variables VITE_* 
    // en el frontend ya que esas quedarían expuestas en el bundle del navegador.
    const username = this.config?.facturero_user;
    const password = this.config?.facturero_password;
    const ambiente = this.config?.facturero_ambiente || 'pruebas';
    const baseUrl = ambiente === 'produccion' ? 'https://app.factureromovil.com/api' : 'https://apptest.factureromovil.com/api';

    if (!username || !password) {
      throw new Error('Faltan credenciales de Facturero Móvil en la Configuración del Club (Ajustes → Configuración de Facturación)');
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
    const baseUrl = ambiente === 'produccion' ? 'https://app.factureromovil.com/api' : 'https://apptest.factureromovil.com/api';

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

  /**
   * Construye el desglose de ítems para Facturero Móvil a partir de una transacción y los datos del miembro.
   * - Matrícula ('MAT'): se factura con el precio de matrícula (ej. $25) SIN descuento.
   * - Pensión ('OCT', 'NOV', etc.): se factura con el precio base de pensión (ej. $55) y el descuento correspondiente (beca/porcentaje).
   */
  construirDetallesFactura(transaccion, miembro, config = this.config) {
    const mesesCubiertos = transaccion?.meses_cubiertos || [];
    const precioMatricula = Number(config?.precio_matricula || 25.00);
    const precioPension = Number(config?.precio_pension || 55.00);
    const prodMatriculaId = config?.facturero_producto_matricula_id || '1';
    const prodPensionId = config?.facturero_producto_pension_id || '2';

    const tieneMatricula = mesesCubiertos.includes('MAT');
    const mesesPension = mesesCubiertos.filter(m => m !== 'MAT');

    const detalles = [];

    // 1. Matrícula: Siempre valor completo, nunca tiene descuento
    if (tieneMatricula) {
      detalles.push({
        producto: prodMatriculaId.toString(),
        cantidad: 1.00,
        precioUnitario: precioMatricula,
        descuento: 0.00
      });
    }

    // 2. Pensión: Aplica el porcentaje de beca/descuento correspondiente
    if (mesesPension.length > 0) {
      const descuentoPorcentaje = Number(miembro?.descuento_porcentaje || 0);
      let descuentoUnitario = 0;

      if (descuentoPorcentaje > 0) {
        descuentoUnitario = Number(((precioPension * descuentoPorcentaje) / 100).toFixed(2));
      } else if (miembro?.monto_pension && Number(miembro.monto_pension) < precioPension) {
        // Para deportistas con pensión fija reducida (ej: $25 en lugar de $55)
        descuentoUnitario = Number((precioPension - Number(miembro.monto_pension)).toFixed(2));
      }

      const cantidad = mesesPension.length;
      const descuentoTotal = Number((descuentoUnitario * cantidad).toFixed(2));

      detalles.push({
        producto: prodPensionId.toString(),
        cantidad: Number(cantidad.toFixed(2)),
        precioUnitario: precioPension,
        descuento: descuentoTotal
      });
    }

    // Caso de respaldo: Si la transacción no tiene meses_cubiertos especificados
    if (detalles.length === 0) {
      const monto = Number(transaccion?.monto_real || precioPension);
      detalles.push({
        producto: prodPensionId.toString(),
        cantidad: 1.00,
        precioUnitario: monto,
        descuento: 0.00
      });
    }

    return detalles;
  }

  /**
   * Emite una factura en Facturero Móvil.
   * Soporta un array de detalles o un monto numérico directo (retrocompatibilidad).
   */
  async emitirFactura(clienteId, itemsOrMonto, tipoProducto = 'pension') {
    if (!this.config) await this.loadConfig();
    const hoy = new Date().toISOString().split('T')[0];
    
    let detallesFactura = [];
    let totalFactura = 0;

    if (Array.isArray(itemsOrMonto)) {
      detallesFactura = itemsOrMonto.map(item => {
        const cantidad = Number(item.cantidad || 1);
        const precioUnitario = parseFloat(item.precioUnitario || 0);
        const descuento = parseFloat(item.descuento || 0);
        const subtotal = (cantidad * precioUnitario) - descuento;
        totalFactura += subtotal > 0 ? subtotal : 0;

        return {
          producto: (item.producto || item.productoId || '1').toString(),
          cantidad: cantidad,
          precioUnitario: precioUnitario,
          descuento: descuento
        };
      });
    } else {
      // Retrocompatibilidad con llamadas legacy: emitirFactura(clienteId, monto, tipoProducto)
      const productoId = tipoProducto === 'matricula' 
        ? (this.config?.facturero_producto_matricula_id || '1')
        : (this.config?.facturero_producto_pension_id || '2');

      const monto = parseFloat(itemsOrMonto || 0);
      totalFactura = monto;
      detallesFactura = [
        {
          producto: productoId.toString(),
          cantidad: 1.00,
          precioUnitario: monto,
          descuento: 0
        }
      ];
    }

    const payload = {
      fechaEmision: hoy,
      cliente: clienteId,
      infoFactura: {
        detallesFactura
      },
      pagos: [
        {
          formaPagoSri: 20,
          total: totalFactura.toFixed(2),
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

  /**
   * Método de alto nivel para emitir la factura de una transacción:
   * 1. Extrae los datos de facturación del representante/miembro
   * 2. Crea u obtiene el cliente en Facturero Móvil
   * 3. Desglosa los productos (Matrícula sin descuento y Pensión con descuento)
   * 4. Emite la factura y actualiza la transacción en Supabase
   */
  async emitirFacturaTransaccion({ transaccion, miembro }) {
    if (!this.config) await this.loadConfig();
    await this.login();

    // Extraer datos del comprador priorizando los datos de facturación de la ficha
    const cedula = (miembro.facturacion_ruc || miembro.cedula || '9999999999999').trim();
    const nombre = (miembro.facturacion_nombre || miembro.nombres || 'Consumidor Final').trim();
    const direccion = (miembro.facturacion_direccion || this.config?.direccion_matriz || 'Quito').trim();
    const telefono = (miembro.facturacion_telefono || miembro.madre_telefono || miembro.padre_telefono || '0999999999').trim();
    const email = (miembro.facturacion_correo || this.config?.email_club || 'correo@ejemplo.com').trim();

    let clienteId = null;
    try {
      const resCliente = await this.crearCliente({
        cedula,
        nombre,
        direccion,
        telefono,
        email
      });
      clienteId = resCliente?.id || resCliente?.cliente?.id || resCliente?.idCliente;
    } catch (clienteErr) {
      console.warn('Nota al crear/buscar cliente en Facturero Móvil:', clienteErr.message);
      // Si el cliente ya existía, intentamos obtener su ID
      try {
        const searchRes = await this.fetchWithAuth(`/clientes?search=${encodeURIComponent(cedula)}`);
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          const items = Array.isArray(searchData) ? searchData : (searchData.items || searchData.clientes || []);
          const encontrado = items.find(c => c.identificacion === cedula) || items[0];
          if (encontrado?.id) clienteId = encontrado.id;
        }
      } catch (e) {
        console.warn('No se pudo buscar cliente existente:', e);
      }
    }

    if (!clienteId) {
      clienteId = 43604; // Fallback por defecto si no se pudo determinar
    }

    // Desglosar ítems diferenciando Matrícula y Pensión con sus descuentos
    const detalles = this.construirDetallesFactura(transaccion, miembro, this.config);

    // Emitir factura electrónica en Facturero Móvil
    const resFactura = await this.emitirFactura(clienteId, detalles);

    const numeroDoc = resFactura.numeroDocumento || resFactura.id || 'TBD';
    const pdfUrl = resFactura.pdf || resFactura.urlPdf || '';
    const xmlUrl = resFactura.xml || resFactura.urlXml || '';

    // Actualizar transacción en Supabase
    const { error: dbErr } = await supabase
      .from('transacciones')
      .update({
        factura_id: numeroDoc,
        factura_pdf: pdfUrl,
        factura_xml: xmlUrl,
        estado_factura: 'autorizado'
      })
      .eq('id', transaccion.id);

    if (dbErr) {
      console.error('Error actualizando transacción en Supabase:', dbErr);
    }

    return {
      ...resFactura,
      numeroDocumento: numeroDoc,
      pdf: pdfUrl,
      xml: xmlUrl,
      detalles
    };
  }
}

export const factureroService = new FactureroService();
