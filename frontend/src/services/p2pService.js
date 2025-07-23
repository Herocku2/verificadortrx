import axios from 'axios';

// Configuración de la URL de la API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5174/api';

// Cliente axios específico para P2P
const p2pClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000 // 10 segundos de timeout para evitar esperas largas
});

// Interceptor para manejar errores de red
p2pClient.interceptors.response.use(
  response => response,
  error => {
    // Manejar errores de red
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.warn('Error de conexión a la API P2P. Verificando si hay datos en caché...');
    }
    
    return Promise.reject(error);
  }
);

// Datos de ejemplo para usar en modo offline
const mockData = {
  countries: [
    { code: 'CO', name: 'Colombia', currency: 'COP', currency_name: 'Peso Colombiano', symbol: '$', reference_price: 3850 },
    { code: 'MX', name: 'México', currency: 'MXN', currency_name: 'Peso Mexicano', symbol: '$', reference_price: 17.5 },
    { code: 'AR', name: 'Argentina', currency: 'ARS', currency_name: 'Peso Argentino', symbol: '$', reference_price: 850 },
    { code: 'VE', name: 'Venezuela', currency: 'VES', currency_name: 'Bolívar', symbol: 'Bs.', reference_price: 36.5 },
    { code: 'PE', name: 'Perú', currency: 'PEN', currency_name: 'Sol', symbol: 'S/', reference_price: 3.7 },
    { code: 'CL', name: 'Chile', currency: 'CLP', currency_name: 'Peso Chileno', symbol: '$', reference_price: 950 },
    { code: 'BR', name: 'Brasil', currency: 'BRL', currency_name: 'Real', symbol: 'R$', reference_price: 5.2 },
    { code: 'ES', name: 'España', currency: 'EUR', currency_name: 'Euro', symbol: '€', reference_price: 0.92 },
    { code: 'US', name: 'Estados Unidos', currency: 'USD', currency_name: 'Dólar', symbol: '$', reference_price: 1 }
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

// Función para guardar datos en localStorage
const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error guardando en localStorage:', error);
  }
};

// Función para obtener datos de localStorage
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
    console.error('Error: Se requiere un país para obtener ofertas P2P');
    return { success: false, data: [], meta: { total: 0 } };
  }
  
  const cacheKey = `p2p_offers_${country}`;
  
  try {
    const response = await p2pClient.get(`/p2p/offers/country/${country}`, {
      params: filters
    });
    
    // Guardar en caché
    saveToLocalStorage(cacheKey, response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener ofertas P2P:', error);
    
    // Si es un error de red, usar datos en caché
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      const cachedData = getFromLocalStorage(cacheKey, { 
        success: true, 
        data: [],
        meta: { total: 0, country: mockData.countries.find(c => c.code === country) || {} }
      });
      
      console.log('Usando datos en caché para ofertas P2P');
      return cachedData;
    }
    
    throw error;
  }
};

// Crear nueva oferta P2P
export const createP2POffer = async (offerData) => {
  try {
    const response = await p2pClient.post('/p2p/offers', offerData);
    
    // Actualizar caché de ofertas del usuario
    const userOffers = getFromLocalStorage(`p2p_user_offers_${offerData.wallet}`, { success: true, data: [] });
    userOffers.data.unshift(response.data.data);
    saveToLocalStorage(`p2p_user_offers_${offerData.wallet}`, userOffers);
    
    return response.data;
  } catch (error) {
    console.error('Error al crear oferta P2P:', error);
    
    // Si es un error de red, simular respuesta exitosa
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.log('Backend no disponible, guardando oferta localmente');
      
      // Crear ID temporal
      const tempId = 'temp_' + Date.now();
      const newOffer = {
        ...offerData,
        id: tempId,
        status: 'activa',
        createdAt: new Date().toISOString(),
        puntuacion_reputacion: 5.0,
        trades_completados: 0,
        _offline: true
      };
      
      // Guardar en caché local
      const userOffers = getFromLocalStorage(`p2p_user_offers_${offerData.wallet}`, { success: true, data: [] });
      userOffers.data.unshift(newOffer);
      saveToLocalStorage(`p2p_user_offers_${offerData.wallet}`, userOffers);
      
      return {
        success: true,
        data: newOffer,
        _offline: true,
        message: 'Oferta creada en modo offline. Se sincronizará cuando el servidor esté disponible.'
      };
    }
    
    throw error;
  }
};

// Obtener países disponibles para P2P
export const getP2PCountries = async () => {
  try {
    const response = await p2pClient.get('/p2p/countries');
    
    // Guardar en caché
    saveToLocalStorage('p2p_countries', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener países P2P:', error);
    
    // Si es un error de red, usar datos de ejemplo
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      const cachedData = getFromLocalStorage('p2p_countries', { 
        success: true, 
        data: mockData.countries
      });
      
      console.log('Usando datos en caché para países P2P');
      return cachedData;
    }
    
    throw error;
  }
};

// Obtener bancos por país
export const getBanksByCountry = async (countryCode) => {
  try {
    const response = await p2pClient.get(`/p2p/countries/${countryCode}/banks`);
    
    // Guardar en caché
    saveToLocalStorage(`p2p_banks_${countryCode}`, response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener bancos por país:', error);
    
    // Si es un error de red, usar datos de ejemplo
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      const countryBanks = mockData.banks[countryCode] || [];
      const cachedData = getFromLocalStorage(`p2p_banks_${countryCode}`, { 
        success: true, 
        data: {
          country: {
            code: countryCode,
            name: mockData.countries.find(c => c.code === countryCode)?.name || countryCode,
            currency: mockData.countries.find(c => c.code === countryCode)?.currency || 'USD'
          },
          banks: countryBanks
        }
      });
      
      console.log('Usando datos en caché para bancos');
      return cachedData;
    }
    
    throw error;
  }
};

// Obtener ofertas del usuario
export const getUserP2POffers = async (wallet) => {
  try {
    const response = await p2pClient.get(`/p2p/offers/wallet/${wallet}`);
    
    // Guardar en caché
    saveToLocalStorage(`p2p_user_offers_${wallet}`, response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener ofertas del usuario:', error);
    
    // Si es un error de red, usar datos en caché
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      const cachedData = getFromLocalStorage(`p2p_user_offers_${wallet}`, { 
        success: true, 
        data: [],
        meta: { total: 0 }
      });
      
      console.log('Usando datos en caché para ofertas del usuario');
      return cachedData;
    }
    
    throw error;
  }
};

// Actualizar estado de oferta
export const updateOfferStatus = async (offerId, wallet, status) => {
  try {
    const response = await p2pClient.put(`/p2p/offers/${offerId}/status`, {
      wallet,
      status
    });
    
    // Actualizar caché
    const userOffers = getFromLocalStorage(`p2p_user_offers_${wallet}`, { success: true, data: [] });
    const updatedOffers = userOffers.data.map(offer => 
      offer.id === offerId ? { ...offer, status } : offer
    );
    userOffers.data = updatedOffers;
    saveToLocalStorage(`p2p_user_offers_${wallet}`, userOffers);
    
    return response.data;
  } catch (error) {
    console.error('Error al actualizar estado de oferta:', error);
    
    // Si es un error de red, actualizar localmente
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.log('Backend no disponible, actualizando oferta localmente');
      
      // Actualizar en caché local
      const userOffers = getFromLocalStorage(`p2p_user_offers_${wallet}`, { success: true, data: [] });
      const updatedOffers = userOffers.data.map(offer => 
        offer.id === offerId ? { ...offer, status, _offline: true } : offer
      );
      userOffers.data = updatedOffers;
      saveToLocalStorage(`p2p_user_offers_${wallet}`, userOffers);
      
      const updatedOffer = updatedOffers.find(offer => offer.id === offerId);
      
      return {
        success: true,
        data: updatedOffer,
        _offline: true,
        message: 'Estado actualizado en modo offline. Se sincronizará cuando el servidor esté disponible.'
      };
    }
    
    throw error;
  }
};

// Crear orden P2P
export const createP2POrder = async (orderData) => {
  try {
    const response = await p2pClient.post('/p2p/orders', orderData);
    
    // Guardar en caché
    const userOrders = getFromLocalStorage(`p2p_user_orders_${orderData.wallet}`, { success: true, orders: [] });
    userOrders.orders.unshift(response.data.order);
    saveToLocalStorage(`p2p_user_orders_${orderData.wallet}`, userOrders);
    
    return response.data;
  } catch (error) {
    console.error('Error al crear orden P2P:', error);
    
    // Si es un error de red, simular respuesta exitosa
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.log('Backend no disponible, guardando orden localmente');
      
      // Crear ID temporal y orden
      const tempId = 'temp_' + Date.now();
      const newOrder = {
        order_id: tempId,
        ...orderData,
        status: 'active',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        _offline: true
      };
      
      // Guardar en caché local
      const userOrders = getFromLocalStorage(`p2p_user_orders_${orderData.wallet}`, { success: true, orders: [] });
      userOrders.orders.unshift(newOrder);
      saveToLocalStorage(`p2p_user_orders_${orderData.wallet}`, userOrders);
      
      return {
        success: true,
        order: newOrder,
        _offline: true,
        message: 'Orden creada en modo offline. Se sincronizará cuando el servidor esté disponible.'
      };
    }
    
    throw error;
  }
};

// Obtener órdenes P2P del usuario
export const getUserP2POrders = async (wallet) => {
  try {
    const response = await p2pClient.get(`/p2p/orders/wallet/${wallet}`);
    
    // Guardar en caché
    saveToLocalStorage(`p2p_user_orders_${wallet}`, response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener órdenes P2P del usuario:', error);
    
    // Si es un error de red, usar datos en caché
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      const cachedData = getFromLocalStorage(`p2p_user_orders_${wallet}`, { 
        success: true, 
        orders: []
      });
      
      console.log('Usando datos en caché para órdenes del usuario');
      return cachedData;
    }
    
    throw error;
  }
};

// Obtener estadísticas P2P
export const getP2PStats = async () => {
  try {
    const response = await p2pClient.get('/p2p/stats');
    
    // Guardar en caché
    saveToLocalStorage('p2p_stats', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas P2P:', error);
    
    // Si es un error de red, usar datos en caché o datos de ejemplo
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      const cachedData = getFromLocalStorage('p2p_stats', { 
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
      });
      
      console.log('Usando datos en caché para estadísticas P2P');
      return cachedData;
    }
    
    throw error;
  }
};

// Obtener precios de referencia
export const getReferencePrices = async () => {
  try {
    const response = await p2pClient.get('/p2p/reference-prices');
    
    // Guardar en caché
    saveToLocalStorage('p2p_reference_prices', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener precios de referencia:', error);
    
    // Si es un error de red, usar datos de ejemplo
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      const cachedData = getFromLocalStorage('p2p_reference_prices', { 
        success: true, 
        data: mockData.referencePrices
      });
      
      console.log('Usando datos en caché para precios de referencia');
      return cachedData;
    }
    
    throw error;
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
  getReferencePrices
};
