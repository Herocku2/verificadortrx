import axios from 'axios';

// Configuración de la URL de la API
// Aseguramos que la URL sea correcta para el entorno
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5173/api';

// Cliente axios para P2P
const p2pClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor
p2pClient.interceptors.response.use(
  response => response,
  error => {
    // Manejar errores de red
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.warn('Error de conexión a la API P2P. Verificando si hay datos en caché...');
      
      // La lógica específica para manejar errores de red está en cada función
    }
    
    return Promise.reject(error);
  }
);

// Datos de ejemplo para usar en modo offline
const mockData = {
  countries: [
    { code: 'CO', name: 'Colombia', currency: 'COP', price: 3850 },
    { code: 'MX', name: 'México', currency: 'MXN', price: 17.5 },
    { code: 'AR', name: 'Argentina', currency: 'ARS', price: 850 },
    { code: 'VE', name: 'Venezuela', currency: 'VES', price: 36.5 },
    { code: 'PE', name: 'Perú', currency: 'PEN', price: 3.7 },
    { code: 'CL', name: 'Chile', currency: 'CLP', price: 950 },
    { code: 'BR', name: 'Brasil', currency: 'BRL', price: 5.2 },
    { code: 'ES', name: 'España', currency: 'EUR', price: 0.92 },
    { code: 'US', name: 'Estados Unidos', currency: 'USD', price: 1 }
  ],
  banks: {
    CO: [
      { nombre: 'Bancolombia', swift: 'BANCOL' },
      { nombre: 'Banco de Bogotá', swift: 'BBOGCO' },
      { nombre: 'Davivienda', swift: 'DAVICO' },
      { nombre: 'Nequi', swift: 'NEQUICO' }
    ],
    MX: [
      { nombre: 'BBVA México', swift: 'BBVAMX' },
      { nombre: 'Banorte', swift: 'BANOMX' },
      { nombre: 'Santander México', swift: 'SANTMX' }
    ],
    AR: [
      { nombre: 'Banco Nación', swift: 'NACNAR' },
      { nombre: 'Banco Galicia', swift: 'GALIAR' },
      { nombre: 'Mercado Pago', swift: 'MERCPAR' }
    ]
  },
  referencePrices: {
    CO: { currency: 'COP', price: 3850 },
    MX: { currency: 'MXN', price: 17.5 },
    AR: { currency: 'ARS', price: 850 },
    VE: { currency: 'VES', price: 36.5 },
    PE: { currency: 'PEN', price: 3.7 },
    CL: { currency: 'CLP', price: 950 },
    BR: { currency: 'BRL', price: 5.2 },
    ES: { currency: 'EUR', price: 0.92 },
    US: { currency: 'USD', price: 1 }
  }
};

// Guardar en localStorage
const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error guardando en localStorage:', error);
  }
};

// Obtener de localStorage
const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Error leyendo de localStorage:', error);
    return defaultValue;
  }
};

// Obtener ofertas P2P por país
export const getP2POffers = async (country, filters = {}) => {
  if (!country) {
    console.error('Error: Se requiere un país para obtener ofertas');
    return { success: false, error: 'País no especificado', data: [], meta: { total: 0 } };
  }
  
  const cacheKey = `p2p_offers_${country}`;
  
  try {
    const response = await p2pClient.get(`/p2p/offers/country/${country}`, {
      params: filters
    });
    
    // Verificar que la respuesta tenga la estructura esperada
    if (response.data && response.data.success !== undefined) {
      // Guardar en caché
      saveToLocalStorage(cacheKey, response.data);
      return response.data;
    } else {
      console.warn('La respuesta de getP2POffers no tiene la estructura esperada:', response.data);
      
      // Intentar usar datos en caché
      const cachedData = getFromLocalStorage(cacheKey);
      if (cachedData) {
        console.log('Usando datos en caché para ofertas P2P');
        return cachedData;
      }
      
      // Si no hay datos en caché, devolver un objeto vacío
      return { 
        success: true, 
        data: [],
        meta: { 
          total: 0, 
          country: country 
        }
      };
    }
  } catch (error) {
    console.error('Error al obtener ofertas P2P:', error);
    
    // Si es un error de red, usar datos en caché
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      const cachedData = getFromLocalStorage(cacheKey);
      if (cachedData) {
        console.log('Usando datos en caché para ofertas P2P');
        return cachedData;
      }
      
      // Si no hay datos en caché, devolver un objeto vacío
      return { 
        success: true, 
        data: [],
        meta: { 
          total: 0,
          country: country
        },
        _offline: true
      };
    }
    
    // Para otros errores, devolver un objeto de error
    return { 
      success: false, 
      error: error.message || 'Error desconocido',
      data: [],
      meta: { total: 0 }
    };
  }
};

// Crear nueva oferta P2P
export const createP2POffer = async (offerData) => {
  if (!offerData || !offerData.wallet) {
    console.error('Error: Se requieren datos de oferta válidos');
    return { success: false, error: 'Datos de oferta inválidos' };
  }
  
  const cacheKey = `p2p_user_offers_${offerData.wallet}`;
  
  try {
    const response = await p2pClient.post('/p2p/offers', offerData);
    
    // Verificar que la respuesta tenga la estructura esperada
    if (response.data && response.data.success !== undefined) {
      // Guardar en caché
      const userOffers = getFromLocalStorage(cacheKey, { success: true, data: [] });
      
      if (response.data.data) {
        userOffers.data.unshift(response.data.data);
        saveToLocalStorage(cacheKey, userOffers);
      }
      
      return response.data;
    } else {
      console.warn('La respuesta de createP2POffer no tiene la estructura esperada:', response.data);
      return { success: false, error: 'Respuesta del servidor inválida' };
    }
  } catch (error) {
    console.error('Error al crear oferta P2P:', error);
    
    // Si es un error de red, simular respuesta exitosa
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.log('Backend no disponible, guardando oferta en modo offline');
      
      // Crear ID temporal
      const tempId = 'temp_' + Date.now();
      const newOffer = {
        ...offerData,
        id: tempId,
        status: 'activa',
        created_at: new Date().toISOString(),
        trades_completados: 0,
        _offline: true
      };
      
      // Guardar en local
      const userOffers = getFromLocalStorage(cacheKey, { success: true, data: [] });
      userOffers.data.unshift(newOffer);
      saveToLocalStorage(cacheKey, userOffers);
      
      return {
        success: true,
        data: newOffer,
        _offline: true,
        message: 'Oferta creada en modo offline. Se sincronizará cuando el servidor esté disponible.'
      };
    }
    
    // Para otros errores, devolver un objeto de error
    return { 
      success: false, 
      error: error.response?.data?.error || error.message || 'Error desconocido' 
    };
  }
};

// Obtener países disponibles para P2P
export const getP2PCountries = async () => {
  const cacheKey = 'p2p_countries';
  
  try {
    const response = await p2pClient.get('/p2p/countries');
    
    // Verificar que la respuesta tenga la estructura esperada
    if (response.data && response.data.success !== undefined) {
      // Guardar en caché
      saveToLocalStorage(cacheKey, response.data);
      return response.data;
    } else {
      console.warn('La respuesta de getP2PCountries no tiene la estructura esperada:', response.data);
      
      // Intentar usar datos en caché
      const cachedData = getFromLocalStorage(cacheKey);
      if (cachedData) {
        console.log('Usando datos en caché para países P2P');
        return cachedData;
      }
      
      // Si no hay datos en caché, usar datos de ejemplo
      return { 
        success: true, 
        data: mockData.countries
      };
    }
  } catch (error) {
    console.error('Error al obtener países P2P:', error);
    
    // Si es un error de red, usar datos en caché o los de ejemplo
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      const cachedData = getFromLocalStorage(cacheKey);
      if (cachedData) {
        console.log('Usando datos en caché para países P2P');
        return cachedData;
      }
      
      // Si no hay datos en caché, usar datos de ejemplo
      return { 
        success: true, 
        data: mockData.countries,
        _offline: true
      };
    }
    
    // Para otros errores, devolver un objeto de error
    return { 
      success: false, 
      error: error.message || 'Error desconocido',
      data: []
    };
  }
};

// Obtener bancos por país
export const getBanksByCountry = async (countryCode) => {
  if (!countryCode) {
    console.error('Error: Se requiere un código de país para obtener bancos');
    return { success: false, data: { banks: [] } };
  }
  
  const cacheKey = `p2p_banks_${countryCode}`;
  
  try {
    const response = await p2pClient.get(`/p2p/banks/${countryCode}`);
    
    // Verificar que la respuesta tenga la estructura esperada
    if (response.data && response.data.success !== undefined) {
      // Guardar en caché
      saveToLocalStorage(cacheKey, response.data);
      return response.data;
    } else {
      console.warn('La respuesta de getBanksByCountry no tiene la estructura esperada:', response.data);
      
      // Intentar usar datos en caché
      const cachedData = getFromLocalStorage(cacheKey);
      if (cachedData) {
        console.log('Usando datos en caché para bancos');
        return cachedData;
      }
      
      // Si no hay datos en caché, usar datos de ejemplo
      const countryBanks = mockData.banks[countryCode] || [];
      
      return { 
        success: true, 
        data: {
          country: {
            code: countryCode,
            name: mockData.countries.find(c => c.code === countryCode)?.name || countryCode,
            currency: mockData.countries.find(c => c.code === countryCode)?.currency || 'USD'
          },
          banks: countryBanks
        }
      };
    }
  } catch (error) {
    console.error('Error al obtener bancos por país:', error);
    
    // Si es un error de red, usar datos en caché o los de ejemplo
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      const cachedData = getFromLocalStorage(cacheKey);
      if (cachedData) {
        console.log('Usando datos en caché para bancos');
        return cachedData;
      }
      
      // Si no hay datos en caché, usar datos de ejemplo
      const countryBanks = mockData.banks[countryCode] || [];
      
      return { 
        success: true, 
        data: {
          country: {
            code: countryCode,
            name: mockData.countries.find(c => c.code === countryCode)?.name || countryCode,
            currency: mockData.countries.find(c => c.code === countryCode)?.currency || 'USD'
          },
          banks: countryBanks
        },
        _offline: true
      };
    }
    
    // Para otros errores, devolver un objeto de error
    return { 
      success: false, 
      error: error.message || 'Error desconocido',
      data: { banks: [] }
    };
  }
};

// Obtener ofertas del usuario
export const getUserP2POffers = async (wallet) => {
  if (!wallet) {
    console.error('Error: Se requiere una wallet para obtener ofertas del usuario');
    return { success: false, data: [], meta: { total: 0 } };
  }
  
  const cacheKey = `p2p_user_offers_${wallet}`;
  
  try {
    const response = await p2pClient.get(`/p2p/offers/wallet/${wallet}`);
    
    // Verificar que la respuesta tenga la estructura esperada
    if (response.data && response.data.success !== undefined) {
      // Guardar en caché
      saveToLocalStorage(cacheKey, response.data);
      return response.data;
    } else {
      console.warn('La respuesta de getUserP2POffers no tiene la estructura esperada:', response.data);
      
      // Intentar usar datos en caché
      const cachedData = getFromLocalStorage(cacheKey);
      if (cachedData) {
        console.log('Usando datos en caché para ofertas del usuario');
        return cachedData;
      }
      
      // Si no hay datos en caché, devolver un objeto vacío
      return { 
        success: true, 
        data: [],
        meta: { total: 0 }
      };
    }
  } catch (error) {
    console.error('Error al obtener ofertas del usuario:', error);
    
    // Si es un error de red, usar datos en caché
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      const cachedData = getFromLocalStorage(cacheKey);
      if (cachedData) {
        console.log('Usando datos en caché para ofertas del usuario');
        return cachedData;
      }
      
      // Si no hay datos en caché, devolver un objeto vacío
      return { 
        success: true, 
        data: [],
        meta: { total: 0 },
        _offline: true
      };
    }
    
    // Para otros errores, devolver un objeto de error
    return { 
      success: false, 
      error: error.message || 'Error desconocido',
      data: [],
      meta: { total: 0 }
    };
  }
};

// Actualizar estado de oferta
export const updateOfferStatus = async (offerId, wallet, status) => {
  if (!offerId || !wallet || !status) {
    console.error('Error: Se requieren datos válidos para actualizar estado');
    return { success: false, error: 'Datos inválidos' };
  }
  
  const cacheKey = `p2p_user_offers_${wallet}`;
  
  try {
    const response = await p2pClient.put(`/p2p/offers/${offerId}/status`, {
      wallet,
      status
    });
    
    // Verificar que la respuesta tenga la estructura esperada
    if (response.data && response.data.success !== undefined) {
      // Actualizar caché
      const userOffers = getFromLocalStorage(cacheKey, { success: true, data: [] });
      const updatedOffers = userOffers.data.map(offer => 
        offer.id === offerId ? { ...offer, status } : offer
      );
      userOffers.data = updatedOffers;
      saveToLocalStorage(cacheKey, userOffers);
      
      return response.data;
    } else {
      console.warn('La respuesta de updateOfferStatus no tiene la estructura esperada:', response.data);
      return { success: false, error: 'Respuesta del servidor inválida' };
    }
  } catch (error) {
    console.error('Error al actualizar estado de oferta:', error);
    
    // Si es un error de red, actualizar localmente
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.log('Backend no disponible, actualizando oferta localmente');
      
      // Actualizar en caché local
      const userOffers = getFromLocalStorage(cacheKey, { success: true, data: [] });
      const updatedOffers = userOffers.data.map(offer => 
        offer.id === offerId ? { ...offer, status, _offline: true } : offer
      );
      userOffers.data = updatedOffers;
      saveToLocalStorage(cacheKey, userOffers);
      
      const updatedOffer = updatedOffers.find(offer => offer.id === offerId);
      
      if (updatedOffer) {
        return {
          success: true,
          data: updatedOffer,
          _offline: true,
          message: 'Estado actualizado en modo offline. Se sincronizará cuando el servidor esté disponible.'
        };
      } else {
        return {
          success: false,
          error: 'No se encontró la oferta para actualizar',
          _offline: true
        };
      }
    }
    
    // Para otros errores, devolver un objeto de error
    return { 
      success: false, 
      error: error.response?.data?.error || error.message || 'Error desconocido' 
    };
  }
};

// Crear orden P2P
export const createP2POrder = async (orderData) => {
  if (!orderData || !orderData.wallet) {
    console.error('Error: Se requieren datos de orden válidos');
    return { success: false, error: 'Datos de orden inválidos' };
  }
  
  const cacheKey = `p2p_user_orders_${orderData.wallet}`;
  
  try {
    const response = await p2pClient.post('/p2p/orders', orderData);
    
    // Verificar que la respuesta tenga la estructura esperada
    if (response.data && response.data.success !== undefined) {
      // Guardar en caché
      const userOrders = getFromLocalStorage(cacheKey, { success: true, orders: [] });
      
      if (response.data.order) {
        userOrders.orders.unshift(response.data.order);
        saveToLocalStorage(cacheKey, userOrders);
      }
      
      return response.data;
    } else {
      console.warn('La respuesta de createP2POrder no tiene la estructura esperada:', response.data);
      return { success: false, error: 'Respuesta del servidor inválida' };
    }
  } catch (error) {
    console.error('Error al crear orden P2P:', error);
    
    // Si es un error de red, simular respuesta exitosa
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.log('Backend no disponible, guardando orden en local');
      
      // Crear ID temporal y orden
      const tempId = 'temp_' + Date.now();
      const newOrder = {
        ...orderData,
        order_id: tempId,
        status: 'active',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        _offline: true
      };
      
      // Guardar en caché local
      const userOrders = getFromLocalStorage(cacheKey, { success: true, orders: [] });
      userOrders.orders.unshift(newOrder);
      saveToLocalStorage(cacheKey, userOrders);
      
      return {
        success: true,
        order: newOrder,
        _offline: true,
        message: 'Orden creada en modo offline. Se sincronizará cuando el servidor esté disponible.'
      };
    }
    
    // Para otros errores, devolver un objeto de error
    return { 
      success: false, 
      error: error.response?.data?.error || error.message || 'Error desconocido' 
    };
  }
};

// Obtener órdenes P2P del usuario
export const getUserP2POrders = async (wallet) => {
  if (!wallet) {
    console.error('Error: Se requiere una wallet para obtener órdenes del usuario');
    return { success: false, orders: [] };
  }
  
  const cacheKey = `p2p_user_orders_${wallet}`;
  
  try {
    const response = await p2pClient.get(`/p2p/orders/wallet/${wallet}`);
    
    // Verificar que la respuesta tenga la estructura esperada
    if (response.data && response.data.success !== undefined) {
      // Guardar en caché
      saveToLocalStorage(cacheKey, response.data);
      return response.data;
    } else {
      console.warn('La respuesta de getUserP2POrders no tiene la estructura esperada:', response.data);
      
      // Intentar usar datos en caché
      const cachedData = getFromLocalStorage(cacheKey);
      if (cachedData) {
        console.log('Usando datos en caché para órdenes del usuario');
        return cachedData;
      }
      
      // Si no hay datos en caché, devolver un objeto vacío
      return { 
        success: true, 
        orders: []
      };
    }
  } catch (error) {
    console.error('Error al obtener órdenes P2P del usuario:', error);
    
    // Si es un error de red, usar datos en caché
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      const cachedData = getFromLocalStorage(cacheKey);
      if (cachedData) {
        console.log('Usando datos en caché para órdenes del usuario');
        return cachedData;
      }
      
      // Si no hay datos en caché, devolver un objeto vacío
      return { 
        success: true, 
        orders: [],
        _offline: true
      };
    }
    
    // Para otros errores, devolver un objeto de error
    return { 
      success: false, 
      error: error.message || 'Error desconocido',
      orders: []
    };
  }
};

// Obtener estadísticas P2P
export const getP2PStats = async () => {
  const cacheKey = 'p2p_stats';
  
  try {
    const response = await p2pClient.get('/p2p/stats');
    
    // Verificar que la respuesta tenga la estructura esperada
    if (response.data && response.data.success !== undefined) {
      // Guardar en caché
      saveToLocalStorage(cacheKey, response.data);
      return response.data;
    } else {
      console.warn('La respuesta de getP2PStats no tiene la estructura esperada:', response.data);
      
      // Intentar usar datos en caché
      const cachedData = getFromLocalStorage(cacheKey);
      if (cachedData) {
        console.log('Usando datos en caché para estadísticas P2P');
        return cachedData;
      }
      
      // Si no hay datos en caché, devolver un objeto vacío
      return { 
        success: true, 
        data: {
          total_offers: 0,
          active_offers: 0,
          total_orders: 0,
          completed_orders: 0,
          countries: {},
          payment_methods: {},
          by_type: { compra: 0, venta: 0 }
        }
      };
    }
  } catch (error) {
    console.error('Error al obtener estadísticas P2P:', error);
    
    // Si es un error de red, usar datos en caché
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      const cachedData = getFromLocalStorage(cacheKey);
      if (cachedData) {
        console.log('Usando datos en caché para estadísticas P2P');
        return cachedData;
      }
      
      // Si no hay datos en caché, devolver un objeto vacío
      return { 
        success: true, 
        data: {
          total_offers: 0,
          active_offers: 0,
          total_orders: 0,
          completed_orders: 0,
          countries: {},
          payment_methods: {},
          by_type: { compra: 0, venta: 0 }
        },
        _offline: true
      };
    }
    
    // Para otros errores, devolver un objeto de error
    return { 
      success: false, 
      error: error.message || 'Error desconocido' 
    };
  }
};

// Obtener precios de referencia
export const getReferencePrices = async () => {
  const cacheKey = 'p2p_reference_prices';
  
  try {
    const response = await p2pClient.get('/p2p/reference-prices');
    
    // Verificar que la respuesta tenga la estructura esperada
    if (response.data && response.data.success !== undefined) {
      // Guardar en caché
      saveToLocalStorage(cacheKey, response.data);
      return response.data;
    } else {
      console.warn('La respuesta de getReferencePrices no tiene la estructura esperada:', response.data);
      
      // Intentar usar datos en caché
      const cachedData = getFromLocalStorage(cacheKey);
      if (cachedData) {
        console.log('Usando datos en caché para precios de referencia');
        return cachedData;
      }
      
      // Si no hay datos en caché, usar datos de ejemplo
      return { 
        success: true, 
        data: mockData.referencePrices
      };
    }
  } catch (error) {
    console.error('Error al obtener precios de referencia:', error);
    
    // Si es un error de red, usar datos en caché o los de ejemplo
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      const cachedData = getFromLocalStorage(cacheKey);
      if (cachedData) {
        console.log('Usando datos en caché para precios de referencia');
        return cachedData;
      }
      
      // Si no hay datos en caché, usar datos de ejemplo
      return { 
        success: true, 
        data: mockData.referencePrices,
        _offline: true
      };
    }
    
    // Para otros errores, devolver un objeto de error
    return { 
      success: false, 
      error: error.message || 'Error desconocido' 
    };
  }
};

// Actualizar estado de una orden P2P
export const updateP2POrderStatus = async (orderId, status, data = {}) => {
  if (!orderId || !status) {
    console.error('Error: Se requieren datos válidos para actualizar estado de orden');
    return { success: false, error: 'Datos inválidos' };
  }
  
  const cacheKey = `p2p_user_orders_${data.wallet}`;
  
  try {
    const response = await p2pClient.put(`/p2p/orders/${orderId}/status`, {
      status,
      ...data
    });
    
    // Verificar que la respuesta tenga la estructura esperada
    if (response.data && response.data.success !== undefined) {
      // Actualizar caché
      const userOrders = getFromLocalStorage(cacheKey, { success: true, data: [] });
      const updatedOrders = userOrders.data.map(order => 
        order.id === orderId ? { ...order, estado: status, ...data } : order
      );
      userOrders.data = updatedOrders;
      saveToLocalStorage(cacheKey, userOrders);
      
      return response.data;
    } else {
      console.warn('La respuesta de updateP2POrderStatus no tiene la estructura esperada:', response.data);
      return { success: false, error: 'Respuesta del servidor inválida' };
    }
  } catch (error) {
    console.error('Error al actualizar estado de orden P2P:', error);
    
    // Si es un error de red, actualizar localmente
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.log('Backend no disponible, actualizando orden localmente');
      
      // Actualizar en caché local
      const userOrders = getFromLocalStorage(cacheKey, { success: true, data: [] });
      const updatedOrders = userOrders.data.map(order => 
        order.id === orderId ? { ...order, estado: status, ...data, _offline: true } : order
      );
      userOrders.data = updatedOrders;
      saveToLocalStorage(cacheKey, userOrders);
      
      const updatedOrder = updatedOrders.find(order => order.id === orderId);
      
      if (updatedOrder) {
        return {
          success: true,
          data: updatedOrder,
          _offline: true,
          message: 'Estado de orden actualizado en modo offline. Se sincronizará cuando el servidor esté disponible.'
        };
      } else {
        return {
          success: false,
          error: 'No se encontró la orden para actualizar',
          _offline: true
        };
      }
    }
    
    // Para otros errores, devolver un objeto de error
    return { 
      success: false, 
      error: error.response?.data?.error || error.message || 'Error desconocido' 
    };
  }
};

// Obtener detalles de una oferta específica
export const getOfferDetails = async (offerId) => {
  if (!offerId) {
    console.error('Error: Se requiere un ID de oferta');
    return { success: false, error: 'ID de oferta no especificado' };
  }
  
  const cacheKey = `p2p_offer_${offerId}`;
  
  try {
    const response = await p2pClient.get(`/p2p/offers/${offerId}`);
    
    // Verificar que la respuesta tenga la estructura esperada
    if (response.data && response.data.success !== undefined) {
      // Guardar en caché
      saveToLocalStorage(cacheKey, response.data);
      return response.data;
    } else {
      console.warn('La respuesta de getOfferDetails no tiene la estructura esperada:', response.data);
      
      // Intentar usar datos en caché
      const cachedData = getFromLocalStorage(cacheKey);
      if (cachedData) {
        console.log('Usando datos en caché para detalles de oferta');
        return cachedData;
      }
      
      // Si no hay datos en caché, buscar en todas las ofertas
      const allOffers = getFromLocalStorage('p2p_offers_all');
      if (allOffers && allOffers.data) {
        const foundOffer = allOffers.data.find(offer => offer.id === offerId);
        if (foundOffer) {
          return { success: true, data: foundOffer };
        }
      }
      
      return { success: false, error: 'Oferta no encontrada' };
    }
  } catch (error) {
    console.error('Error al obtener detalles de oferta:', error);
    
    // Si es un error de red, usar datos en caché
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      const cachedData = getFromLocalStorage(cacheKey);
      if (cachedData) {
        console.log('Usando datos en caché para detalles de oferta');
        return cachedData;
      }
      
      // Si no hay datos en caché específica, buscar en todas las ofertas
      const allOffers = getFromLocalStorage('p2p_offers_all');
      if (allOffers && allOffers.data) {
        const foundOffer = allOffers.data.find(offer => offer.id === offerId);
        if (foundOffer) {
          return { success: true, data: foundOffer, _offline: true };
        }
      }
      
      return { 
        success: false, 
        error: 'Oferta no encontrada en modo offline',
        _offline: true
      };
    }
    
    // Para otros errores, devolver un objeto de error
    return { 
      success: false, 
      error: error.response?.data?.error || error.message || 'Error desconocido' 
    };
  }
};

export default {
  getP2POffers,
  createP2POffer,
  getP2PCountries,
  getBanksByCountry,
  getUserP2POffers,
  updateOfferStatus,
  createP2POrder,
  getUserP2POrders,
  getP2PStats,
  getReferencePrices,
  updateP2POrderStatus,
  getOfferDetails
};