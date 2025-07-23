import React, { createContext, useState, useEffect, useContext } from 'react';
import { getUserInfo } from '../services/api';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(localStorage.getItem('wallet') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar información del usuario cuando se establece la wallet
  useEffect(() => {
    const fetchUserData = async () => {
      if (!wallet) {
        setUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      
      // Crear un usuario por defecto en caso de que todo falle
      const defaultUser = {
        usuario: wallet,
        username: wallet.substring(0, 6) + '...',
        tokens_disponibles: 3,
        plan: 'Free',
        expira: null
      };
      
      try {
        // Intentar obtener datos del usuario del backend
        const userData = await getUserInfo(wallet);
        
        // La función getUserInfo ya maneja los errores de red y devuelve datos en caché o por defecto
        if (userData) {
          setUser(userData);
          localStorage.setItem('wallet', wallet);
        } else {
          console.warn('getUserInfo devolvió datos nulos o indefinidos');
          setUser(defaultUser);
        }
      } catch (err) {
        console.error('Error inesperado al cargar datos del usuario:', err);
        setError('Error inesperado al cargar datos del usuario');
        
        // Intentar recuperar datos del usuario del localStorage
        const cachedUserData = localStorage.getItem(`user_${wallet}`);
        if (cachedUserData) {
          try {
            setUser(JSON.parse(cachedUserData));
          } catch (parseErr) {
            console.error('Error al parsear datos en caché:', parseErr);
            setUser(defaultUser);
          }
        } else {
          setUser(defaultUser);
        }
      } finally {
        setLoading(false);
      }
    };

    // Ejecutar fetchUserData solo si hay wallet
    if (wallet) {
      fetchUserData();
    } else {
      // Si no hay wallet, asegurarse de que user sea null
      setUser(null);
      setLoading(false);
    }
  }, [wallet]);

  // Función para actualizar la wallet del usuario
  const updateWallet = (newWallet) => {
    if (newWallet && newWallet.startsWith('T')) {
      setWallet(newWallet);
      localStorage.setItem('wallet', newWallet);
    } else if (newWallet === null) {
      setWallet(null);
      localStorage.removeItem('wallet');
      setUser(null);
    }
  };

  // Función para actualizar los tokens del usuario después de una consulta
  const updateTokens = (newTokens) => {
    if (user) {
      setUser({
        ...user,
        tokens_disponibles: newTokens
      });
    }
  };

  // Función para actualizar el plan del usuario después de un pago
  const updatePlan = (newPlan, newTokens) => {
    if (user) {
      setUser({
        ...user,
        plan: newPlan,
        tokens_disponibles: newTokens
      });
    }
  };

  const value = {
    user,
    wallet,
    loading,
    error,
    updateWallet,
    updateTokens,
    updatePlan
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};