import { useState, useEffect } from 'react';

const useIPLimits = () => {
  const [ipLimits, setIpLimits] = useState({
    remaining: 3,
    resetTime: null,
    canScan: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkIPLimits();
  }, []);

  const checkIPLimits = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/ip-limits/check`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setIpLimits({
          remaining: data.remaining,
          resetTime: data.resetTime,
          canScan: data.remaining > 0
        });
      }
    } catch (error) {
      console.error('Error checking IP limits:', error);
      // Default to allowing scans if there's an error
      setIpLimits({
        remaining: 3,
        resetTime: null,
        canScan: true
      });
    } finally {
      setLoading(false);
    }
  };

  const consumeIPLimit = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/ip-limits/consume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setIpLimits({
          remaining: data.remaining,
          resetTime: data.resetTime,
          canScan: data.remaining > 0
        });
        return { success: true, data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error consuming IP limit:', error);
      return { success: false, message: 'Network error' };
    }
  };

  const getTimeUntilReset = () => {
    if (!ipLimits.resetTime) return null;
    
    const now = new Date().getTime();
    const resetTime = new Date(ipLimits.resetTime).getTime();
    const diff = resetTime - now;
    
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes };
  };

  return {
    ipLimits,
    loading,
    checkIPLimits,
    consumeIPLimit,
    getTimeUntilReset
  };
};

export default useIPLimits;