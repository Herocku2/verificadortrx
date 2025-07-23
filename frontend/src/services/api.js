import axios from 'axios';

// Configuración de la URL de la API
// Usar la variable de entorno REACT_APP_API_URL si está definida, de lo contrario usar la URL por defecto
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5174/api';

// Cliente axios con configuración base
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para manejar errores de red
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Manejar errores de red
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.warn('Error de conexión a la API. Verificando si hay datos en caché...');
      
      // Aquí podríamos implementar una lógica más avanzada para manejar errores de red
      // Por ahora, simplemente propagamos el error
    }
    
    return Promise.reject(error);
  }
);

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

// Verificación básica de wallet (sin consumir token)
export const verifyWalletBasic = async (wallet) => {
  try {
    const response = await apiClient.get(`/verify/basic/${wallet}`);
    return response.data;
  } catch (error) {
    console.error('Error en verificación básica:', error);
    throw error;
  }
};

// Verificación completa de wallet (consume 1 token)
export const verifyWallet = async (wallet) => {
  try {
    // Primero verificar el estado de la conexión con TRON
    try {
      const statusResponse = await apiClient.get('/verify/status');
      if (!statusResponse.data.success) {
        console.warn('La conexión con TRON no está disponible, intentando con método alternativo');
      }
    } catch (statusError) {
      console.warn('Error al verificar estado de conexión TRON:', statusError);
      // Continuar de todos modos, intentaremos con el endpoint simplificado
    }
    
    // Intentar primero con el endpoint simplificado que es más robusto
    try {
      console.log('Intentando verificación simplificada...');
      const simpleResponse = await apiClient.get(`/verify/simple/${wallet}`);
      return simpleResponse.data;
    } catch (simpleError) {
      console.warn('Error en verificación simplificada, intentando método estándar:', simpleError);
      // Si falla, intentar con el método estándar
    }
    
    // Método estándar como fallback
    const response = await apiClient.get(`/verify/${wallet}`);
    return response.data;
  } catch (error) {
    console.error('Error en verificación completa:', error);
    
    // Mejorar el mensaje de error para el usuario
    if (error.message && error.message.includes('blockchain')) {
      throw error; // Usar el mensaje personalizado
    } else if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      throw new Error('Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.');
    }
    
    throw error;
  }
};

// Verificación detallada de wallet (consume 1 token, requiere plan pagado)
export const verifyWalletDetailed = async (wallet) => {
  try {
    const response = await apiClient.get(`/verify/${wallet}/detailed`);
    return response.data;
  } catch (error) {
    console.error('Error en verificación detallada:', error);
    throw error;
  }
};

// Obtener información del usuario
export const getUserInfo = async (wallet) => {
  try {
    const cacheKey = `user_${wallet}`;
    
    const response = await apiClient.get(`/users/info/${wallet}`);
    
    // Verificar que la respuesta tenga la estructura esperada
    if (response.data && response.data.user) {
      // Guardar en localStorage para acceso offline
      saveToLocalStorage(cacheKey, response.data.user);
      return response.data.user;
    } else {
      console.warn('La respuesta de getUserInfo no tiene la estructura esperada:', response.data);
      
      // Intentar usar datos en caché
      const cachedData = getFromLocalStorage(cacheKey);
      if (cachedData) {
        console.log('Usando datos en caché para el usuario');
        return cachedData;
      }
      
      // Si no hay datos en caché, crear un usuario por defecto
      const defaultUser = {
        usuario: wallet,
        username: wallet.substring(0, 6) + '...',
        tokens_disponibles: 3,
        plan: 'Free',
        expira: null
      };
      
      saveToLocalStorage(cacheKey, defaultUser);
      return defaultUser;
    }
  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    
    // Si es un error de red, intentar usar datos en caché
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      const cacheKey = `user_${wallet}`;
      const cachedData = getFromLocalStorage(cacheKey);
      
      if (cachedData) {
        console.log('Usando datos en caché para el usuario');
        return cachedData;
      }
      
      // Si no hay datos en caché, crear un usuario por defecto
      const defaultUser = {
        usuario: wallet,
        username: wallet.substring(0, 6) + '...',
        tokens_disponibles: 3,
        plan: 'Free',
        expira: null
      };
      
      saveToLocalStorage(cacheKey, defaultUser);
      return defaultUser;
    }
    
    throw error;
  }
};

// Verificar si un usuario existe
export const checkUserExists = async (wallet) => {
  try {
    const response = await apiClient.get(`/users/check/${wallet}`);
    return response.data;
  } catch (error) {
    console.error('Error al verificar usuario:', error);
    
    // Si es un error de red, asumir que el usuario existe para permitir la conexión
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.log('Backend no disponible, asumiendo que el usuario existe');
      return { exists: true, message: 'Backend no disponible, usando modo offline' };
    }
    
    throw error;
  }
};

// Registrar un nuevo usuario
export const registerUser = async (wallet, username) => {
  try {
    const response = await apiClient.post('/users/register', {
      wallet,
      username
    });
    
    // Si el registro es exitoso, guardar el usuario en localStorage
    if (response.data && response.data.success) {
      const defaultUser = {
        usuario: wallet,
        username: username,
        tokens_disponibles: 3,
        plan: 'Free',
        expira: null
      };
      
      saveToLocalStorage(`user_${wallet}`, defaultUser);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    
    // Si es un error de red, simular registro exitoso
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.log('Backend no disponible, simulando registro exitoso');
      
      const defaultUser = {
        usuario: wallet,
        username: username,
        tokens_disponibles: 3,
        plan: 'Free',
        expira: null
      };
      
      saveToLocalStorage(`user_${wallet}`, defaultUser);
      
      return {
        success: true,
        message: 'Usuario registrado en modo offline',
        _offline: true
      };
    }
    
    throw error;
  }
};

// Actualizar el plan del usuario
export const updateUserPlan = async (wallet, plan, tokens, subscriptionExpires) => {
  try {
    const response = await apiClient.post('/users/update-plan', {
      wallet,
      plan,
      tokens,
      subscription_expires: subscriptionExpires
    });
    
    // Si la actualización es exitosa, actualizar el usuario en localStorage
    if (response.data && response.data.success) {
      const cachedUser = getFromLocalStorage(`user_${wallet}`);
      if (cachedUser) {
        cachedUser.plan = plan;
        cachedUser.tokens_disponibles = tokens;
        cachedUser.expira = subscriptionExpires;
        saveToLocalStorage(`user_${wallet}`, cachedUser);
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Error al actualizar plan:', error);
    
    // Si es un error de red, simular actualización exitosa
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.log('Backend no disponible, simulando actualización de plan exitosa');
      
      const cachedUser = getFromLocalStorage(`user_${wallet}`);
      if (cachedUser) {
        cachedUser.plan = plan;
        cachedUser.tokens_disponibles = tokens;
        cachedUser.expira = subscriptionExpires;
        saveToLocalStorage(`user_${wallet}`, cachedUser);
      }
      
      return {
        success: true,
        message: 'Plan actualizado en modo offline',
        _offline: true
      };
    }
    
    throw error;
  }
};

// Consumir token del usuario
export const consumeUserToken = async (wallet) => {
  try {
    const response = await apiClient.post('/users/consume-token', {
      wallet
    });
    
    // Si el consumo es exitoso, actualizar el usuario en localStorage
    if (response.data && response.data.success) {
      const cachedUser = getFromLocalStorage(`user_${wallet}`);
      if (cachedUser && cachedUser.tokens_disponibles > 0) {
        cachedUser.tokens_disponibles -= 1;
        saveToLocalStorage(`user_${wallet}`, cachedUser);
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Error al consumir token:', error);
    
    // Si es un error de red, simular consumo exitoso
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.log('Backend no disponible, simulando consumo de token exitoso');
      
      const cachedUser = getFromLocalStorage(`user_${wallet}`);
      if (cachedUser && cachedUser.tokens_disponibles > 0) {
        cachedUser.tokens_disponibles -= 1;
        saveToLocalStorage(`user_${wallet}`, cachedUser);
        
        return {
          success: true,
          tokens_remaining: cachedUser.tokens_disponibles,
          message: 'Token consumido en modo offline',
          _offline: true
        };
      } else {
        return {
          success: false,
          message: 'No tienes tokens disponibles',
          _offline: true
        };
      }
    }
    
    throw error;
  }
};

// Obtener planes disponibles
export const getAvailablePlans = async () => {
  try {
    const response = await apiClient.get('/users/plans/available');
    
    // Guardar en caché
    saveToLocalStorage('available_plans', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener planes disponibles:', error);
    
    // Si es un error de red, usar datos en caché
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      const cachedData = getFromLocalStorage('available_plans');
      if (cachedData) {
        console.log('Usando datos en caché para planes disponibles');
        return cachedData;
      }
      
      // Si no hay datos en caché, usar planes por defecto
      const defaultPlans = {
        success: true,
        plans: [
          { id: 'basic', name: 'Basic', price: 9.99, tokens: 100, duration_days: 30 },
          { id: 'premium', name: 'Premium', price: 19.99, tokens: 300, duration_days: 30 },
          { id: 'unlimited', name: 'Unlimited', price: 49.99, tokens: Infinity, duration_days: 30 }
        ]
      };
      
      saveToLocalStorage('available_plans', defaultPlans);
      return defaultPlans;
    }
    
    throw error;
  }
};

// Crear orden de pago
export const createPayment = async (planType, wallet) => {
  try {
    const response = await apiClient.post('/payments/create', { planType, wallet });
    return response.data;
  } catch (error) {
    console.error('Error al crear orden de pago:', error);
    throw error;
  }
};

// Verificar estado de pago
export const checkPaymentStatus = async (paymentId) => {
  try {
    const response = await apiClient.get(`/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Error al verificar estado de pago:', error);
    throw error;
  }
};

// Generar informe de wallet
export const generateWalletReport = async (wallet, format = 'json') => {
  try {
    const response = await apiClient.get(`/reports/${wallet}?format=${format}`);
    return response.data;
  } catch (error) {
    console.error('Error al generar informe:', error);
    throw error;
  }
};

// Generar informe para Telegram
export const generateTelegramReport = async (wallet) => {
  try {
    const response = await apiClient.get(`/reports/${wallet}/telegram`);
    return response.data;
  } catch (error) {
    console.error('Error al generar informe para Telegram:', error);
    throw error;
  }
};

// Obtener configuración de TronGrid API
export const getTronGridConfig = async () => {
  try {
    const response = await apiClient.get('/config/trongrid');
    return response.data;
  } catch (error) {
    console.error('Error al obtener configuración de TronGrid:', error);
    throw error;
  }
};

// ADMIN API - Solo accesible para la wallet de administrador
const ADMIN_WALLET = 'TJF7BrGJREfNFjBoCVdSNQyLw1PV5s37hm';

// Verificar si la wallet es de administrador
export const isAdminWallet = (wallet) => {
  return wallet === ADMIN_WALLET;
};

// Obtener estadísticas del dashboard (solo admin)
export const getAdminDashboardStats = async (wallet) => {
  if (!isAdminWallet(wallet)) {
    throw new Error('Acceso denegado: No eres administrador');
  }
  
  try {
    const response = await apiClient.get('/admin/dashboard', {
      headers: { 'X-Admin-Wallet': wallet }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    throw error;
  }
};

// Obtener lista de usuarios (solo admin)
export const getAdminUsers = async (wallet) => {
  if (!isAdminWallet(wallet)) {
    throw new Error('Acceso denegado: No eres administrador');
  }
  
  try {
    const response = await apiClient.get('/admin/users', {
      headers: { 'X-Admin-Wallet': wallet }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener lista de usuarios:', error);
    throw error;
  }
};

// Obtener lista de pagos (solo admin)
export const getAdminPayments = async (wallet) => {
  if (!isAdminWallet(wallet)) {
    throw new Error('Acceso denegado: No eres administrador');
  }
  
  try {
    const response = await apiClient.get('/admin/payments', {
      headers: { 'X-Admin-Wallet': wallet }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener lista de pagos:', error);
    throw error;
  }
};

// Actualizar configuración del sistema (solo admin)
export const updateSystemSettings = async (wallet, settings) => {
  if (!isAdminWallet(wallet)) {
    throw new Error('Acceso denegado: No eres administrador');
  }
  
  try {
    const response = await apiClient.put('/admin/settings', settings, {
      headers: { 'X-Admin-Wallet': wallet }
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar configuración del sistema:', error);
    throw error;
  }
};

// Obtener lista de revendedores (solo admin)
export const getAdminResellers = async (wallet) => {
  if (!isAdminWallet(wallet)) {
    throw new Error('Acceso denegado: No eres administrador');
  }
  
  try {
    const response = await apiClient.get('/admin/resellers', {
      headers: { 'X-Admin-Wallet': wallet }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener lista de revendedores:', error);
    throw error;
  }
};

// Crear un nuevo revendedor (solo admin)
export const createReseller = async (wallet, resellerData) => {
  if (!isAdminWallet(wallet)) {
    throw new Error('Acceso denegado: No eres administrador');
  }
  
  try {
    const response = await apiClient.post('/admin/resellers', resellerData, {
      headers: { 'X-Admin-Wallet': wallet }
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear revendedor:', error);
    throw error;
  }
};

// Actualizar cuota de un revendedor (solo admin)
export const updateResellerQuota = async (wallet, resellerWallet, newQuota) => {
  if (!isAdminWallet(wallet)) {
    throw new Error('Acceso denegado: No eres administrador');
  }
  
  try {
    const response = await apiClient.put(`/admin/resellers/${resellerWallet}/quota`, { newQuota }, {
      headers: { 'X-Admin-Wallet': wallet }
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar cuota de revendedor:', error);
    throw error;
  }
};

// RESELLER API - Solo accesible para revendedores autorizados

// Obtener información del revendedor
export const getResellerInfo = async (wallet) => {
  try {
    const response = await apiClient.get('/resellers/info', {
      headers: { 'X-Reseller-Wallet': wallet }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener información de revendedor:', error);
    throw error;
  }
};

// Aplicar descuento a un cliente
export const applyResellerDiscount = async (resellerWallet, customerWallet, planType) => {
  try {
    const response = await apiClient.post('/resellers/discount', 
      { customerWallet, planType },
      { headers: { 'X-Reseller-Wallet': resellerWallet } }
    );
    return response.data;
  } catch (error) {
    console.error('Error al aplicar descuento:', error);
    throw error;
  }
};

// Obtener estadísticas del revendedor
export const getResellerStats = async (wallet) => {
  try {
    const response = await apiClient.get('/resellers/stats', {
      headers: { 'X-Reseller-Wallet': wallet }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de revendedor:', error);
    throw error;
  }
};

// ===== FUNCIONES P2P =====

// Obtener ofertas P2P por país
export const getP2POffers = async (country, filters = {}) => {
  try {
    const response = await apiClient.get(`/p2p/offers/country/${country}`, {
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
    const response = await apiClient.post('/p2p/offers', offerData);
    return response.data;
  } catch (error) {
    console.error('Error al crear oferta P2P:', error);
    throw error;
  }
};

// Obtener países disponibles para P2P
export const getP2PCountries = async () => {
  try {
    const response = await apiClient.get('/p2p/countries');
    return response.data;
  } catch (error) {
    console.error('Error al obtener países P2P:', error);
    throw error;
  }
};

// Obtener bancos por país
export const getBanksByCountry = async (countryCode) => {
  try {
    const response = await apiClient.get(`/p2p/countries/${countryCode}/banks`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener bancos por país:', error);
    throw error;
  }
};

// Crear orden P2P
export const createP2POrder = async (orderData) => {
  try {
    const response = await apiClient.post('/p2p/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error al crear orden P2P:', error);
    throw error;
  }
};

// Obtener órdenes P2P del usuario
export const getUserP2POrders = async (wallet) => {
  try {
    const response = await apiClient.get(`/p2p/orders/user/${wallet}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener órdenes P2P del usuario:', error);
    throw error;
  }
};

// Actualizar estado de orden P2P
export const updateP2POrderStatus = async (orderId, status, data = {}) => {
  try {
    const response = await apiClient.put(`/p2p/orders/${orderId}/status`, {
      status,
      ...data
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar estado de orden P2P:', error);
    throw error;
  }
};

// Obtener chat de orden P2P
export const getP2POrderChat = async (orderId) => {
  try {
    const response = await apiClient.get(`/p2p/orders/${orderId}/chat`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener chat de orden P2P:', error);
    throw error;
  }
};

// Enviar mensaje en chat P2P
export const sendP2PChatMessage = async (orderId, message) => {
  try {
    const response = await apiClient.post(`/p2p/orders/${orderId}/chat`, {
      message
    });
    return response.data;
  } catch (error) {
    console.error('Error al enviar mensaje en chat P2P:', error);
    throw error;
  }
};