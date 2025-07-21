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
        return;
      }

      setLoading(true);
      try {
        const userData = await getUserInfo(wallet);
        setUser(userData);
        localStorage.setItem('wallet', wallet);
      } catch (err) {
        console.error('Error al cargar datos del usuario:', err);
        setError('No se pudo cargar la información del usuario');
        // Si hay un error, creamos un usuario con plan gratuito
        setUser({
          usuario: wallet,
          tokens_disponibles: 3,
          plan: 'Free',
          expira: null
        });
      } finally {
        setLoading(false);
      }
    };

    if (wallet) {
      fetchUserData();
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