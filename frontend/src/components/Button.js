import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const StyledButton = styled.button`
  background: ${props => {
    if (props.disabled) return 'rgba(255, 255, 255, 0.1)';
    switch(props.variant) {
      case 'primary': return 'var(--color-primary)';
      case 'secondary': return 'var(--color-secondary)';
      case 'success': return 'var(--color-success)';
      case 'danger': return 'var(--color-danger)';
      case 'warning': return 'var(--color-warning)';
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      default: return 'var(--color-primary)';
    }
  }};
  
  color: ${props => {
    if (props.disabled) return 'rgba(255, 255, 255, 0.5)';
    if (props.variant === 'outline' || props.variant === 'ghost') {
      return 'var(--color-primary)';
    }
    return 'white';
  }};
  
  border: ${props => {
    if (props.variant === 'outline') {
      return '2px solid var(--color-primary)';
    }
    return 'none';
  }};
  
  border-radius: var(--border-radius);
  padding: ${props => {
    switch(props.size) {
      case 'small': return '0.5rem 1rem';
      case 'large': return '1rem 2rem';
      default: return '0.75rem 1.5rem';
    }
  }};
  
  font-size: ${props => {
    switch(props.size) {
      case 'small': return '0.875rem';
      case 'large': return '1.125rem';
      default: return '1rem';
    }
  }};
  
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: ${props => {
    switch(props.size) {
      case 'small': return '32px';
      case 'large': return '48px';
      default: return '40px';
    }
  }};
  
  &:hover:not(:disabled) {
    background: ${props => {
      switch(props.variant) {
        case 'primary': return 'var(--color-secondary)';
        case 'secondary': return 'var(--color-primary)';
        case 'outline': return 'var(--color-primary)';
        case 'ghost': return 'rgba(0, 120, 255, 0.1)';
        default: return 'var(--color-secondary)';
      }
    }};
    
    color: ${props => {
      if (props.variant === 'outline') return 'white';
      return props.variant === 'ghost' ? 'var(--color-primary)' : 'white';
    }};
    
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 120, 255, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    animation: ${pulse} 0.2s ease;
  }
  
  ${props => props.fullWidth && 'width: 100%;'}
  
  ${props => props.loading && `
    pointer-events: none;
    opacity: 0.8;
  `}
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const ButtonContent = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: ${props => props.loading ? 0 : 1};
  transition: opacity 0.2s ease;
`;

const LoadingContainer = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  loadingText = 'Loading...',
  icon,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      loading={loading}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      onClick={onClick}
      type={type}
      className={className}
      {...props}
    >
      <ButtonContent loading={loading}>
        {icon && <span>{icon}</span>}
        {children}
      </ButtonContent>
      
      {loading && (
        <LoadingContainer>
          <LoadingSpinner />
          <span>{loadingText}</span>
        </LoadingContainer>
      )}
    </StyledButton>
  );
};

export default Button;