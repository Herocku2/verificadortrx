import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5174/api';

// Cliente axios específico para P2P
const p2pClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Obtener ofertas P2P por país
export const getP2POffers = async (country, filters = {}) => {
  try {
    const response = await p2pClient.get(`/p2p/offers/country/${country}`, {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener ofertas P2P:', error);
    throw error;
  }
};

// Crear nueva oferta P2P
export const createP2POffer = async (offerData) => {
  try {
    const response = await p2pClient.post('/p2p/offers', offerData);
    return response.data;
  } catch (error) {
    console.error('Error al crear oferta P2P:', error);
    throw error;
  }
};

// Obtener países disponibles para P2P
export const getP2PCountries = async () => {
  try {
    const response = await p2pClient.get('/p2p/countries');
    return response.data;
  } catch (error) {
    console.error('Error al obtener países P2P:', error);
    throw error;
  }
};

// Obtener bancos por país
export const getBanksByCountry = async (countryCode) => {
  try {
    const response = await p2pClient.get(`/p2p/countries/${countryCode}/banks`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener bancos por país:', error);
    throw error;
  }
};

// Obtener ofertas del usuario
export const getUserP2POffers = async (wallet) => {
  try {
    const response = await p2pClient.get(`/p2p/offers/wallet/${wallet}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener ofertas del usuario:', error);
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
    return response.data;
  } catch (error) {
    console.error('Error al actualizar estado de oferta:', error);
    throw error;
  }
};

// Crear orden P2P
export const createP2POrder = async (orderData) => {
  try {
    const response = await p2pClient.post('/p2p/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error al crear orden P2P:', error);
    throw error;
  }
};

// Obtener órdenes P2P del usuario
export const getUserP2POrders = async (wallet) => {
  try {
    const response = await p2pClient.get(`/p2p/orders/wallet/${wallet}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener órdenes P2P del usuario:', error);
    throw error;
  }
};

// Obtener estadísticas P2P
export const getP2PStats = async () => {
  try {
    const response = await p2pClient.get('/p2p/stats');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas P2P:', error);
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
  getP2PStats
};