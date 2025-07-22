import React from 'react';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const ProgressContainer = styled.div`
  width: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  height: ${props => props.height || '8px'};
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => props.animated 
    ? `linear-gradient(
        90deg,
        var(--color-primary) 0%,
        var(--color-secondary) 50%,
        var(--color-primary) 100%
      )`
    : 'var(--color-primary)'
  };
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
  border-radius: 10px;
  position: relative;
  
  ${props => props.animated && `
    background-size: 200px 100%;
    animation: ${shimmer} 2s infinite linear;
  `}
`;

const ProgressText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-text);
  font-size: 0.75rem;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const ProgressLabel = styled.div`
  margin-bottom: 0.5rem;
  color: var(--color-text);
  font-size: 0.875rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProgressBar = ({ 
  progress = 0, 
  height = '8px',
  showText = false,
  showLabel = false,
  label = '',
  animated = false,
  className = ''
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={className}>
      {showLabel && (
        <ProgressLabel>
          <span>{label}</span>
          <span>{clampedProgress.toFixed(0)}%</span>
        </ProgressLabel>
      )}
      <ProgressContainer height={height}>
        <ProgressFill 
          progress={clampedProgress} 
          animated={animated}
        />
        {showText && (
          <ProgressText>
            {clampedProgress.toFixed(0)}%
          </ProgressText>
        )}
      </ProgressContainer>
    </div>
  );
};

export default ProgressBar;