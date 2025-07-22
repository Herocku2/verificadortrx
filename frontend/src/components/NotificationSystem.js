import React, { useState, useEffect, createContext, useContext } from 'react';
import styled, { keyframes } from 'styled-components';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const NotificationContainer = styled.div`
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 400px;
  
  @media (max-width: 768px) {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
  }
`;

const NotificationItem = styled.div`
  background-color: ${props => {
    switch(props.type) {
      case 'success': return 'rgba(0, 200, 83, 0.9)';
      case 'error': return 'rgba(255, 61, 0, 0.9)';
      case 'warning': return 'rgba(255, 214, 0, 0.9)';
      case 'info': return 'rgba(0, 120, 255, 0.9)';
      default: return 'rgba(30, 40, 60, 0.9)';
    }
  }};
  color: white;
  padding: 1rem 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: ${props => props.isLeaving ? slideOut : slideIn} 0.3s ease-out;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const NotificationIcon = styled.div`
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const NotificationMessage = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 1;
  }
`;

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isLeaving: true }
          : notification
      )
    );

    // Remove from DOM after animation
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 300);
  };

  const showSuccess = (title, message) => {
    addNotification({
      type: 'success',
      title,
      message,
      icon: '✅'
    });
  };

  const showError = (title, message) => {
    addNotification({
      type: 'error',
      title,
      message,
      icon: '❌',
      duration: 7000
    });
  };

  const showWarning = (title, message) => {
    addNotification({
      type: 'warning',
      title,
      message,
      icon: '⚠️'
    });
  };

  const showInfo = (title, message) => {
    addNotification({
      type: 'info',
      title,
      message,
      icon: 'ℹ️'
    });
  };

  const value = {
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer>
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            type={notification.type}
            isLeaving={notification.isLeaving}
            onClick={() => removeNotification(notification.id)}
          >
            <NotificationIcon>{notification.icon}</NotificationIcon>
            <NotificationContent>
              {notification.title && (
                <NotificationTitle>{notification.title}</NotificationTitle>
              )}
              <NotificationMessage>{notification.message}</NotificationMessage>
            </NotificationContent>
            <CloseButton onClick={(e) => {
              e.stopPropagation();
              removeNotification(notification.id);
            }}>
              ×
            </CloseButton>
          </NotificationItem>
        ))}
      </NotificationContainer>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;