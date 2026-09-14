import { supabase } from './../lib/supabase';

/**
 * Servicio para interactuar con Facturero Móvil a través del proxy serverless.
 *
 * Las credenciales de Facturero Móvil están almacenadas como variables de entorno
 * en Vercel (FACTURERO_USER, FACTURERO_PASSWORD, FACTURERO_AMBIENTE).
 * El proxy maneja el login internamente — el frontend nunca ve las credenciales.
 */
class FactureroService {
  constructor() {
    this.fmToken = null;     // JWT de Facturero Móvil (cacheado en memoria)
    this.config = null;
    this.productosCache = null; // Cache de productos disponibles en FM
  }

  async loadConfig() {
    const { data } = await supabase.from('config_club').select('*').maybeSingle();
    this.config = data;
    return data;
  }

  /**
   * Llama al proxy serverless /api/facturero-proxy.
   */
  async callProxy({ path, method = 'GET', body, token }) {
    const res = await fetch('/api/facturero-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, method, body, token }),
    });
    return res;
  }

  /**
   * Login con Facturero Móvil. El proxy usa las credenciales de env vars.
   */
  async login() {
    const response = await this.callProxy({
      path: '/login_check',
      method: 'POST',
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error || err?.message || `Error al autenticar con Facturero Móvil (${response.status})`);
    }

    const data = await response.json();
    this.fmToken = data.token;
    return this.fmToken;
  }

  async fetchWithAuth(path, options = {}) {
    const bodyData = typeof options.body === 'string'
      ? JSON.parse(options.body)
      : options.body;

    const response = await this.callProxy({
      path,
      method: options.method || 'GET',
      body: bodyData,
      token: this.fmToken,
    });

    if (response.status === 401) {
      await this.login();
      return this.callProxy({
        path,
        method: options.method || 'GET',
        body: bodyData,
        token: this.fmToken,
      });
    }

    return response;
  }

  /**
   * Obtiene la lista de productos disponibles en Facturero Móvil.
   * Usa caché en memoria para no hacer múltiples llamadas por sesión.
   */
  async getProductos() {
    if (this.productosCache) return this.productosCache;

    try {
      const res = await this.fetchWithAuth('/productos');
      if (res.ok) {
        const data = await res.json();
        // FM puede devolver array directo o { items: [...] }
        const lista = Array.isArray(data) ? data : (data?.items || data?.productos || []);
        this.productosCache = lista;
        console.log(`[FactureroService] ${lista.length} productos encontrados en FM`);
        return lista;
      }
    } catch (e) {
      console.warn('[FactureroService] No se pudo obtener lista de productos:', e.message);
    }
    return [];
  }

  /**
   * Resuelve el ID real de un producto en FM.
   * Orden de prioridad:
   *   1. ID configurado en config_club (si es un número válido, no "001"/"002")
   *   2. Buscar en la lista de productos por nombre (matrícula o pensión)
   *   3. Usar el primer producto disponible como fallback
   */
  async resolverProductoId(tipo, idConfigurado) {
    // Si el ID configurado es un número real (> 3 dígitos o != "001"/"002")
    const idNum = parseInt(idConfigurado, 10);
    const esIdValido = !isNaN(idNum) && idNum > 100 && idConfigurado !== '001' && idConfigurado !== '002';
    if (esIdValido) return idNum;

    // Buscar en la lista de productos de FM
    const productos = await this.getProductos();

    if (productos.length === 0) {
      throw new Error(
        'No hay productos configurados en Facturero Móvil. ' +
        'Crea al menos un producto en tu cuenta (Inventario → Productos) ' +
        'e ingresa su ID en Ajustes → Facturación.'
      );
    }

    // Intentar encontrar el producto correcto por nombre
    const keywords = tipo === 'matricula'
      ? ['matr', 'inscr', 'registr']
      : ['mens', 'pens', 'cuota', 'memb'];

    const encontrado = productos.find(p => {
      const nombre = (p.nombre || p.descripcion || p.name || '').toLowerCase();
      return keywords.some(k => nombre.includes(k));
    });

    if (encontrado) {
      console.log(`[FactureroService] Producto '${tipo}' encontrado por nombre: ${encontrado.id}`);
      return encontrado.id;
    }

    // Fallback: usar el primer producto disponible
    console.warn(`[FactureroService] No se encontró producto '${tipo}' por nombre, usando el primero disponible: ${productos[0].id}`);
    return productos[0].id;
  }

  async crearCliente(cliente) {
    const payload = {
      identificacion: cliente.cedula || '9999999999999',
      tipoIdentificacion: (cliente.cedula && cliente.cedula.length === 13) ? 1 : 2,
      razonSocial: cliente.nombre || 'Consumidor Final',
      direccion: cliente.direccion || 'Quito',
      telefonos: cliente.telefono || '0999999999',
      email: cliente.email || 'correo@ejemplo.com',
    };

    const response = await this.fetchWithAuth('/clientes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn('Error al crear cliente en Facturero (puede que ya exista):', data);
      throw new Error(data.message || 'Error al crear cliente en Facturero Móvil');
    }

    return data;
  }

  /**
   * Construye el desglose de ítems para Facturero Móvil.
   * Se asegura de que la suma de los ítems sea EXACTAMENTE igual al monto_real de la transacción.
   */
  async construirDetallesFactura(transaccion, miembro, config = this.config) {
    const mesesCubiertos = transaccion?.meses_cubiertos || [];
    const precioMatricula = Number(config?.precio_matricula || 25.00);
    const montoReal = Number(transaccion?.monto_real || 0);

    const tieneMatricula = mesesCubiertos.includes('MAT');
    const mesesPension   = mesesCubiertos.filter(m => m !== 'MAT');

    const detalles = [];
    let restante = montoReal;

    // 1. Matrícula — siempre cobra su valor (o lo que quede)
    if (tieneMatricula) {
      const idMatricula = await this.resolverProductoId('matricula', config?.facturero_producto_matricula_id);
      const valorMatricula = restante >= precioMatricula ? precioMatricula : restante;
      
      if (valorMatricula > 0) {
        detalles.push({
          producto: idMatricula,
          cantidad: 1.00,
          precioUnitario: valorMatricula,
          descuento: 0.00,
        });
        restante = Number((restante - valorMatricula).toFixed(2));
      }
    }

    // 2. Pensión — el resto del dinero pagado va a la pensión
    if (mesesPension.length > 0 && restante > 0) {
      const idPension = await this.resolverProductoId('pension', config?.facturero_producto_pension_id);
      
      detalles.push({
        producto: idPension,
        cantidad: 1.00, // Mandamos cantidad 1 para evitar errores de redondeo de centavos
        precioUnitario: restante,
        descuento: 0.00,
      });
      restante = 0;
    }

    // Fallback por si no hubo meses especificados
    if (detalles.length === 0 && restante > 0) {
      const idPension = await this.resolverProductoId('pension', config?.facturero_producto_pension_id);
      detalles.push({
        producto: idPension,
        cantidad: 1.00,
        precioUnitario: restante,
        descuento: 0.00,
      });
    }

    return detalles;
  }

  /**
   * Emite una factura en Facturero Móvil.
   */
  async emitirFactura(clienteId, detallesFactura) {
    const hoy = new Date().toISOString().split('T')[0];

    // Calcular total
    const totalFactura = detallesFactura.reduce((sum, item) => {
      const subtotal = (Number(item.cantidad) * Number(item.precioUnitario)) - Number(item.descuento || 0);
      return sum + (subtotal > 0 ? subtotal : 0);
    }, 0);

    const payload = {
      fechaEmision: hoy,
      cliente: clienteId,
      infoFactura: { detallesFactura },
      pagos: [{
        formaPagoSri: 20,
        total: totalFactura.toFixed(2),
        plazo: 1,
        unidadTiempo: 'Dias',
      }],
    };

    const response = await this.fetchWithAuth('/documentos/facturas', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`Error al emitir factura: ${err?.message || JSON.stringify(err)}`);
    }

    return await response.json();
  }

  /**
   * Método principal: emite la factura de una transacción completa.
   */
  async emitirFacturaTransaccion({ transaccion, miembro }) {
    if (!this.config) await this.loadConfig();

    // 1. Autenticarse con FM (proxy usa env vars)
    await this.login();

    // 2. Datos del comprador
    const cedula    = (miembro.facturacion_ruc || miembro.cedula || '9999999999999').trim();
    const nombre    = (miembro.facturacion_nombre || miembro.nombres || 'Consumidor Final').trim();
    const direccion = (miembro.facturacion_direccion || this.config?.direccion_matriz || 'Quito').trim();
    const telefono  = (miembro.facturacion_telefono || miembro.madre_telefono || miembro.padre_telefono || '0999999999').trim();
    const email     = (miembro.facturacion_correo || this.config?.email_club || 'correo@ejemplo.com').trim();

    // 3. Crear o localizar cliente en FM
    let clienteId = null;
    try {
      const resCliente = await this.crearCliente({ cedula, nombre, direccion, telefono, email });
      clienteId = resCliente?.id || resCliente?.cliente?.id || resCliente?.idCliente;
    } catch (clienteErr) {
      console.warn('Nota al crear cliente:', clienteErr.message);
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
      // Intentar buscar un cliente "Consumidor Final" existente
      try {
        const searchRes = await this.fetchWithAuth('/clientes?search=consumidor');
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          const items = Array.isArray(searchData) ? searchData : (searchData.items || searchData.clientes || []);
          if (items.length > 0) clienteId = items[0].id;
        }
      } catch (e) { /* ignorar */ }
    }

    if (!clienteId) {
      throw new Error(
        'No se pudo crear ni encontrar el cliente en Facturero Móvil. ' +
        'Verifica que los datos de facturación del deportista (cédula y nombre) sean correctos.'
      );
    }

    // 4. Construir ítems (resuelve IDs de productos automáticamente)
    const detalles = await this.construirDetallesFactura(transaccion, miembro, this.config);

    // 5. Emitir factura
    const resFactura = await this.emitirFactura(clienteId, detalles);

    const numeroDoc = resFactura.numeroDocumento || resFactura.id || 'TBD';
    const pdfUrl    = resFactura.pdf || resFactura.urlPdf || '';
    const xmlUrl    = resFactura.xml || resFactura.urlXml || '';

    // 6. Actualizar transacción en Supabase
    const { error: dbErr } = await supabase
      .from('transacciones')
      .update({
        factura_id:     numeroDoc,
        factura_pdf:    pdfUrl,
        factura_xml:    xmlUrl,
        estado_factura: 'autorizado',
      })
      .eq('id', transaccion.id);

    if (dbErr) console.error('Error actualizando transacción:', dbErr);

    return { ...resFactura, numeroDocumento: numeroDoc, pdf: pdfUrl, xml: xmlUrl, detalles };
  }
}

export const factureroService = new FactureroService();
