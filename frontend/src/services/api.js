import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Cliente axios con configuración base
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    const response = await apiClient.get(`/verify/${wallet}`);
    return response.data;
  } catch (error) {
    console.error('Error en verificación completa:', error);
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
    const response = await apiClient.get(`/users/info/${wallet}`);
    return response.data.user;
  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
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
    return response.data;
  } catch (error) {
    console.error('Error al registrar usuario:', error);
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
    return response.data;
  } catch (error) {
    console.error('Error al actualizar plan:', error);
    throw error;
  }
};

// Consumir token del usuario
export const consumeUserToken = async (wallet) => {
  try {
    const response = await apiClient.post('/users/consume-token', {
      wallet
    });
    return response.data;
  } catch (error) {
    console.error('Error al consumir token:', error);
    throw error;
  }
};

// Obtener planes disponibles
export const getAvailablePlans = async () => {
  try {
    const response = await apiClient.get('/users/plans/available');
    return response.data;
  } catch (error) {
    console.error('Error al obtener planes disponibles:', error);
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