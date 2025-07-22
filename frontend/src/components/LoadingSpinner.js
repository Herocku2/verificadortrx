import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
`;

const Spinner = styled.div`
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  border: 3px solid rgba(0, 120, 255, 0.1);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.div`
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const LoadingSpinner = ({ 
  size = '40px', 
  text = 'Loading...', 
  showText = true 
}) => {
  return (
    <SpinnerContainer>
      <Spinner size={size} />
      {showText && <LoadingText>{text}</LoadingText>}
    </SpinnerContainer>
  );
};

export default LoadingSpinner;