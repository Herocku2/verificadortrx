import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';

const WalletInputContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 1.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1.5rem;
  padding-right: 120px;
  background-color: rgba(30, 40, 60, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius);
  color: var(--color-text);
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(0, 120, 255, 0.2);
  }
  
  &::placeholder {
    color: var(--color-text-secondary);
  }
`;

const AnalyzeButton = styled(motion.button)`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 0.5rem 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:disabled {
    background-color: rgba(0, 120, 255, 0.5);
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: var(--color-danger);
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const OptionsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const OptionCard = styled.div`
  flex: 1;
  background-color: rgba(30, 40, 60, 0.6);
  border: 1px solid ${props => props.selected ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: var(--border-radius);
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--color-primary);
    background-color: rgba(30, 40, 60, 0.8);
  }
`;

const OptionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.color || 'var(--color-text)'};
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const OptionDescription = styled.p`
  color: var(--color-text-secondary);
  font-size: 0.875rem;
`;

const ConnectOptions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const ConnectButton = styled(motion.button)`
  flex: 1;
  background-color: ${props => props.primary ? 'var(--color-primary)' : 'transparent'};
  color: ${props => props.primary ? 'white' : 'var(--color-text)'};
  border: 1px solid ${props => props.primary ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: var(--border-radius);
  padding: 0.75rem 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.primary ? 'var(--color-secondary)' : 'rgba(255, 255, 255, 0.05)'};
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  color: ${props => props.connected ? 'var(--color-success)' : 'var(--color-danger)'};
  font-size: 0.875rem;
`;

const WalletInput = ({ onAnalyze, showOptions = true, showConnect = true }) => {
  const [wallet, setWallet] = useState('');
  const [error, setError] = useState('');
  const [analysisType, setAnalysisType] = useState('instant');
  const [tronLinkStatus, setTronLinkStatus] = useState('Not Detected');
  const navigate = useNavigate();
  const { updateWallet } = useUser();
  
  // Validar formato de wallet TRX
  const validateWallet = (address) => {
    if (!address) {
      setError('Por favor ingresa una dirección de wallet');
      return false;
    }
    
    if (!address.startsWith('T')) {
      setError('La dirección debe comenzar con T (formato TRON)');
      return false;
    }
    
    if (address.length !== 34) {
      setError('La dirección debe tener 34 caracteres');
      return false;
    }
    
    setError('');
    return true;
  };
  
  const handleInputChange = (e) => {
    const value = e.target.value;
    setWallet(value);
    if (value) validateWallet(value);
  };
  
  const handleAnalyze = () => {
    if (validateWallet(wallet)) {
      updateWallet(wallet);
      onAnalyze(wallet, analysisType);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };
  
  const connectTronLink = async () => {
    if (window.tronWeb && window.tronWeb.ready) {
      try {
        const address = window.tronWeb.defaultAddress.base58;
        setWallet(address);
        setTronLinkStatus('Connected');
        updateWallet(address);
      } catch (error) {
        console.error('Error connecting to TronLink:', error);
        setTronLinkStatus('Connection Error');
      }
    } else {
      setTronLinkStatus('Not Detected');
      window.open('https://www.tronlink.org/', '_blank');
    }
  };
  
  // Verificar si TronLink está instalado
  React.useEffect(() => {
    const checkTronLink = () => {
      if (window.tronWeb && window.tronWeb.ready) {
        setTronLinkStatus('Detected');
      }
    };
    
    checkTronLink();
    
    // Verificar periódicamente
    const interval = setInterval(checkTronLink, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <WalletInputContainer>
      <InputWrapper>
        <Input
          type="text"
          placeholder="Enter TRON wallet address (T...)"
          value={wallet}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
        <AnalyzeButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAnalyze}
          disabled={!wallet}
        >
          <span>Analyze</span>
          <span>(1 token)</span>
        </AnalyzeButton>
      </InputWrapper>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {showOptions && (
        <OptionsContainer>
          <OptionCard 
            selected={analysisType === 'instant'} 
            onClick={() => setAnalysisType('instant')}
          >
            <OptionTitle color="var(--color-success)">
              <span>✓</span>
              <span>Instant Analysis</span>
            </OptionTitle>
            <OptionDescription>Results in seconds</OptionDescription>
          </OptionCard>
          
          <OptionCard 
            selected={analysisType === 'comprehensive'} 
            onClick={() => setAnalysisType('comprehensive')}
          >
            <OptionTitle color="var(--color-primary)">
              <span>○</span>
              <span>Comprehensive</span>
            </OptionTitle>
            <OptionDescription>Full forensic report</OptionDescription>
          </OptionCard>
          
          <OptionCard 
            selected={analysisType === 'risk'} 
            onClick={() => setAnalysisType('risk')}
          >
            <OptionTitle color="var(--color-warning)">
              <span>⚠</span>
              <span>Risk Assessment</span>
            </OptionTitle>
            <OptionDescription>Advanced scoring</OptionDescription>
          </OptionCard>
        </OptionsContainer>
      )}
      
      {showConnect && (
        <>
          <h3 className="text-center mb-2">Connect Your Wallet</h3>
          <p className="text-center text-secondary mb-3">Connect with TronLink or enter your TRON wallet address</p>
          
          <ConnectOptions>
            <ConnectButton 
              primary
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={connectTronLink}
            >
              <span>TronLink</span>
            </ConnectButton>
            
            <ConnectButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/scanner')}
            >
              <span>Manual</span>
            </ConnectButton>
          </ConnectOptions>
          
          <StatusIndicator connected={tronLinkStatus === 'Connected'}>
            <span>•</span>
            <span>TronLink Status: {tronLinkStatus}</span>
          </StatusIndicator>
          
          {tronLinkStatus === 'Not Detected' && (
            <p className="text-center mt-2" style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Install TronLink extension to connect automatically
            </p>
          )}
        </>
      )}
    </WalletInputContainer>
  );
};

export default WalletInput;