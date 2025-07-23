/**
 * Servicio de Autenticación
 * Maneja la autenticación y autorización de usuarios
 */

import axios from 'axios';
import { getUserInfo, checkUserExists, registerUser } from './api';

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

// Función para conectar wallet
export const connectWallet = async (tronWeb) => {
  if (!tronWeb) {
    throw new Error('TronLink no detectado');
  }
  
  try {
    // Verificar si tronWeb está disponible
    if (!tronWeb.defaultAddress || !tronWeb.defaultAddress.base58) {
      throw new Error('Wallet no disponible. Por favor desbloquea TronLink');
    }
    
    const address = tronWeb.defaultAddress.base58;
    
    // Guardar wallet en localStorage
    localStorage.setItem('wallet', address);
    
    // Verificar si el usuario existe
    try {
      const data = await checkUserExists(address);
      
      if (data && data.exists) {
        // Usuario existe, obtener información
        try {
          const userData = await getUserInfo(address);
          return {
            success: true,
            wallet: address,
            user: userData,
            isNewUser: false
          };
        } catch (userError) {
          console.error('Error al obtener información del usuario:', userError);
          
          // Si hay un error, crear un usuario por defecto
          const defaultUser = {
            usuario: address,
            username: address.substring(0, 6) + '...',
            tokens_disponibles: 3,
            plan: 'Free',
            expira: null
          };
          
          saveToLocalStorage(`user_${address}`, defaultUser);
          
          return {
            success: true,
            wallet: address,
            user: defaultUser,
            isNewUser: false,
            _offline: true
          };
        }
      } else {
        // Usuario no existe, devolver información para registro
        return {
          success: true,
          wallet: address,
          isNewUser: true
        };
      }
    } catch (checkError) {
      console.error('Error al verificar usuario:', checkError);
      
      // Si es un error de red, asumir que el usuario existe
      if (checkError.message === 'Network Error' || checkError.code === 'ERR_NETWORK') {
        console.log('Backend no disponible, asumiendo que el usuario existe');
        
        // Intentar recuperar datos del usuario del localStorage
        const cachedUserData = getFromLocalStorage(`user_${address}`);
        if (cachedUserData) {
          return {
            success: true,
            wallet: address,
            user: cachedUserData,
            isNewUser: false,
            _offline: true
          };
        } else {
          // Si no hay datos en caché, crear un usuario por defecto
          const defaultUser = {
            usuario: address,
            username: address.substring(0, 6) + '...',
            tokens_disponibles: 3,
            plan: 'Free',
            expira: null
          };
          
          saveToLocalStorage(`user_${address}`, defaultUser);
          
          return {
            success: true,
            wallet: address,
            user: defaultUser,
            isNewUser: false,
            _offline: true
          };
        }
      }
      
      throw checkError;
    }
  } catch (error) {
    console.error('Error al conectar wallet:', error);
    throw error;
  }
};

// Función para registrar un nuevo usuario
export const registerNewUser = async (wallet, username) => {
  if (!wallet || !username) {
    throw new Error('Wallet y nombre de usuario son obligatorios');
  }
  
  try {
    const data = await registerUser(wallet, username);
    
    if (data && data.success) {
      // Obtener información del usuario
      try {
        const userData = await getUserInfo(wallet);
        return {
          success: true,
          wallet,
          user: userData
        };
      } catch (userError) {
        console.error('Error al obtener información del usuario después del registro:', userError);
        
        // Si hay un error, crear un usuario por defecto
        const defaultUser = {
          usuario: wallet,
          username,
          tokens_disponibles: 3,
          plan: 'Free',
          expira: null
        };
        
        saveToLocalStorage(`user_${wallet}`, defaultUser);
        
        return {
          success: true,
          wallet,
          user: defaultUser,
          _offline: true
        };
      }
    } else {
      throw new Error(data.message || 'Error al registrar usuario');
    }
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    
    // Si es un error de red, simular registro exitoso
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.log('Backend no disponible, simulando registro exitoso');
      
      const defaultUser = {
        usuario: wallet,
        username,
        tokens_disponibles: 3,
        plan: 'Free',
        expira: null
      };
      
      saveToLocalStorage(`user_${wallet}`, defaultUser);
      
      return {
        success: true,
        wallet,
        user: defaultUser,
        _offline: true
      };
    }
    
    throw error;
  }
};

// Función para desconectar wallet
export const disconnectWallet = () => {
  localStorage.removeItem('wallet');
  return { success: true };
};

// Función para verificar si hay una wallet conectada
export const checkWalletConnection = () => {
  const wallet = localStorage.getItem('wallet');
  return wallet ? { connected: true, wallet } : { connected: false };
};

// Función para verificar si el usuario es administrador
export const isAdmin = (wallet) => {
  const adminWallet = 'TJF7BrGJREfNFjBoCVdSNQyLw1PV5s37hm'; // Debería venir de una variable de entorno
  return wallet === adminWallet;
};

export default {
  connectWallet,
  registerNewUser,
  disconnectWallet,
  checkWalletConnection,
  isAdmin
};