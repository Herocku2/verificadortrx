import { useState, useCallback } from 'react';

const useLoading = (initialState = false) => {
  const [loading, setLoading] = useState(initialState);
  const [error, setError] = useState(null);

  const startLoading = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  const setLoadingError = useCallback((error) => {
    setError(error);
    setLoading(false);
  }, []);

  const executeAsync = useCallback(async (asyncFunction) => {
    try {
      startLoading();
      const result = await asyncFunction();
      stopLoading();
      return result;
    } catch (err) {
      setLoadingError(err);
      throw err;
    }
  }, [startLoading, stopLoading, setLoadingError]);

  return {
    loading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    executeAsync
  };
};

export default useLoading;