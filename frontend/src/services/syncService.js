/**
 * Servicio de Sincronización
 * Maneja la sincronización de datos guardados en modo offline cuando el backend vuelve a estar disponible
 */

import axios from 'axios';
import p2pService from './p2pService';
import { getUserInfo } from './api';

// Configuración de la URL de la API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5174/api';

// Cliente axios para sincronización
const syncClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000 // 10 segundos de timeout
});

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

// Función para verificar si el backend está disponible
export const checkBackendAvailability = async () => {
  try {
    const response = await syncClient.get('/health', { timeout: 3000 });
    return response.status === 200;
  } catch (error) {
    console.warn('Backend no disponible:', error.message);
    return false;
  }
};

// Función para sincronizar ofertas P2P creadas en modo offline
export const syncOfflineP2POffers = async (wallet) => {
  if (!wallet) return { synced: 0, failed: 0 };
  
  const cacheKey = `p2p_user_offers_${wallet}`;
  const userOffers = getFromLocalStorage(cacheKey, { success: true, data: [] });
  
  // Filtrar ofertas creadas en modo offline
  const offlineOffers = userOffers.data.filter(offer => offer._offline);
  
  if (offlineOffers.length === 0) {
    return { synced: 0, failed: 0 };
  }
  
  console.log(`Sincronizando ${offlineOffers.length} ofertas P2P creadas en modo offline`);
  
  let synced = 0;
  let failed = 0;
  
  // Intentar sincronizar cada oferta
  for (const offer of offlineOffers) {
    try {
      // Eliminar propiedades específicas del modo offline
      const { _offline, id, ...offerData } = offer;
      
      // Intentar crear la oferta en el backend
      const response = await syncClient.post('/p2p/offers', offerData);
      
      if (response.data && response.data.success) {
        // Actualizar la oferta en caché
        const updatedOffers = userOffers.data.map(o => 
          o.id === id ? { ...response.data.data, _synced: true } : o
        );
        userOffers.data = updatedOffers;
        saveToLocalStorage(cacheKey, userOffers);
        
        synced++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error('Error al sincronizar oferta P2P:', error);
      failed++;
    }
  }
  
  return { synced, failed };
};

// Función para sincronizar órdenes P2P creadas en modo offline
export const syncOfflineP2POrders = async (wallet) => {
  if (!wallet) return { synced: 0, failed: 0 };
  
  const cacheKey = `p2p_user_orders_${wallet}`;
  const userOrders = getFromLocalStorage(cacheKey, { success: true, orders: [] });
  
  // Filtrar órdenes creadas en modo offline
  const offlineOrders = userOrders.orders.filter(order => order._offline);
  
  if (offlineOrders.length === 0) {
    return { synced: 0, failed: 0 };
  }
  
  console.log(`Sincronizando ${offlineOrders.length} órdenes P2P creadas en modo offline`);
  
  let synced = 0;
  let failed = 0;
  
  // Intentar sincronizar cada orden
  for (const order of offlineOrders) {
    try {
      // Eliminar propiedades específicas del modo offline
      const { _offline, order_id, ...orderData } = order;
      
      // Intentar crear la orden en el backend
      const response = await syncClient.post('/p2p/orders', orderData);
      
      if (response.data && response.data.success) {
        // Actualizar la orden en caché
        const updatedOrders = userOrders.orders.map(o => 
          o.order_id === order_id ? { ...response.data.order, _synced: true } : o
        );
        userOrders.orders = updatedOrders;
        saveToLocalStorage(cacheKey, userOrders);
        
        synced++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error('Error al sincronizar orden P2P:', error);
      failed++;
    }
  }
  
  return { synced, failed };
};

// Función para sincronizar actualizaciones de estado de ofertas P2P
export const syncOfflineStatusUpdates = async (wallet) => {
  if (!wallet) return { synced: 0, failed: 0 };
  
  const cacheKey = `p2p_status_updates_${wallet}`;
  const statusUpdates = getFromLocalStorage(cacheKey, []);
  
  if (statusUpdates.length === 0) {
    return { synced: 0, failed: 0 };
  }
  
  console.log(`Sincronizando ${statusUpdates.length} actualizaciones de estado`);
  
  let synced = 0;
  let failed = 0;
  
  // Intentar sincronizar cada actualización de estado
  for (const update of statusUpdates) {
    try {
      const { offerId, status } = update;
      
      // Intentar actualizar el estado en el backend
      const response = await syncClient.put(`/p2p/offers/${offerId}/status`, {
        wallet,
        status
      });
      
      if (response.data && response.data.success) {
        synced++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error('Error al sincronizar actualización de estado:', error);
      failed++;
    }
  }
  
  // Si se sincronizaron todas las actualizaciones, limpiar la caché
  if (failed === 0) {
    localStorage.removeItem(cacheKey);
  } else {
    // Mantener solo las actualizaciones que fallaron
    saveToLocalStorage(cacheKey, statusUpdates.slice(synced));
  }
  
  return { synced, failed };
};

// Función para sincronizar todos los datos offline
export const syncAllOfflineData = async (wallet) => {
  if (!wallet) return;
  
  // Verificar si el backend está disponible
  const isBackendAvailable = await checkBackendAvailability();
  
  if (!isBackendAvailable) {
    console.log('Backend no disponible, no se puede sincronizar');
    return {
      success: false,
      message: 'Backend no disponible, no se puede sincronizar'
    };
  }
  
  // Sincronizar ofertas P2P
  const offersResult = await syncOfflineP2POffers(wallet);
  
  // Sincronizar órdenes P2P
  const ordersResult = await syncOfflineP2POrders(wallet);
  
  // Sincronizar actualizaciones de estado
  const statusResult = await syncOfflineStatusUpdates(wallet);
  
  // Actualizar datos del usuario
  try {
    const userData = await getUserInfo(wallet);
    if (userData) {
      // La función getUserInfo ya guarda los datos en localStorage
      console.log('Datos de usuario actualizados');
    }
  } catch (error) {
    console.error('Error al actualizar datos de usuario:', error);
  }
  
  return {
    success: true,
    offers: offersResult,
    orders: ordersResult,
    statusUpdates: statusResult,
    message: 'Sincronización completada'
  };
};

// Función para registrar una actualización de estado para sincronización posterior
export const registerStatusUpdate = (wallet, offerId, status) => {
  if (!wallet || !offerId || !status) return;
  
  const cacheKey = `p2p_status_updates_${wallet}`;
  const statusUpdates = getFromLocalStorage(cacheKey, []);
  
  // Agregar la actualización a la lista
  statusUpdates.push({
    offerId,
    status,
    timestamp: Date.now()
  });
  
  // Guardar la lista actualizada
  saveToLocalStorage(cacheKey, statusUpdates);
};

// Exportar funciones
export default {
  checkBackendAvailability,
  syncOfflineP2POffers,
  syncOfflineP2POrders,
  syncOfflineStatusUpdates,
  syncAllOfflineData,
  registerStatusUpdate
};