import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import WalletInput from '../components/WalletInput';
import LimitReachedModal from '../components/LimitReachedModal';
import { useUser } from '../context/UserContext';
import { verifyWallet, verifyWalletDetailed } from '../services/api';
import useIPLimits from '../hooks/useIPLimits';

const ScannerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
`;

const ScannerHeader = styled.div`
  text-align: center;
  max-width: 800px;
  margin: 0 auto 3rem;
  padding: 0 20px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const ResultsContainer = styled(motion.div)`
  width: 100%;
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 20px;
`;

const ResultCard = styled.div`
  background-color: rgba(30, 40, 60, 0.6);
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const WalletInfo = styled.div``;

const WalletAddress = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  word-break: break-all;
`;

const ScanTime = styled.div`
  color: var(--color-text-secondary);
  font-size: 0.875rem;
`;

const RiskBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  background-color: ${props => {
    if (props.risk.includes('Alto')) return 'rgba(255, 61, 0, 0.2)';
    if (props.risk.includes('Medio')) return 'rgba(255, 214, 0, 0.2)';
    return 'rgba(0, 200, 83, 0.2)';
  }};
  color: ${props => {
    if (props.risk.includes('Alto')) return 'var(--color-danger)';
    if (props.risk.includes('Medio')) return 'var(--color-warning)';
    return 'var(--color-success)';
  }};
`;

const ResultContent = styled.div`
  margin-top: 2rem;
`;

const ResultSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const EventsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const EventItem = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: var(--border-radius);
  padding: 1rem;
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const EventType = styled.div`
  font-weight: 500;
  color: ${props => {
    if (props.type === 'AddedBlackList') return 'var(--color-danger)';
    if (props.type === 'RemovedBlackList') return 'var(--color-warning)';
    return 'var(--color-text)';
  }};
`;

const EventDate = styled.div`
  color: var(--color-text-secondary);
  font-size: 0.875rem;
`;

const NoEvents = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: var(--border-radius);
  padding: 1rem;
  text-align: center;
  color: var(--color-text-secondary);
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid var(--color-primary);
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  color: var(--color-text-secondary);
`;

const ErrorContainer = styled.div`
  background-color: rgba(255, 61, 0, 0.1);
  border: 1px solid rgba(255, 61, 0, 0.2);
  border-radius: var(--border-radius);
  padding: 1rem;
  color: var(--color-danger);
  margin-bottom: 1rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  
  & p {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: var(--color-text-secondary);
  }
  
  & button {
    margin-top: 1rem;
    background-color: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-weight: 500;
    
    &:hover {
      background-color: var(--color-secondary);
    }
  }
`;

const TokensInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
`;

const TokenIcon = styled.span`
  color: var(--color-primary);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionButton = styled(motion.button)`
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const PrimaryButton = styled(ActionButton)`
  background-color: var(--color-primary);
  color: white;
  border: none;
  
  &:hover {
    background-color: var(--color-secondary);
  }
`;

const SecondaryButton = styled(ActionButton)`
  background-color: transparent;
  color: var(--color-text);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const ScannerPage = () => {
  const [searchParams] = useSearchParams();
  const initialWallet = searchParams.get('wallet');
  const { user, wallet: userWallet, updateTokens } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [analysisType, setAnalysisType] = useState('instant');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitType, setLimitType] = useState('ip');
  const navigate = useNavigate();
  const { ipLimits, consumeIPLimit, getTimeUntilReset } = useIPLimits();
  
  // Si hay una wallet en los parámetros de búsqueda, realizar análisis automáticamente
  useEffect(() => {
    if (initialWallet) {
      handleAnalyze(initialWallet, 'instant');
    }
  }, [initialWallet]);
  
  const handleAnalyze = async (wallet, type) => {
    setLoading(true);
    setError(null);
    setAnalysisType(type);
    
    try {
      // Si el usuario no está logueado, verificar límites por IP
      if (!user || !userWallet) {
        if (!ipLimits.canScan) {
          setLimitType('ip');
          setShowLimitModal(true);
          setLoading(false);
          return;
        }
        
        // Consumir límite por IP
        const ipResult = await consumeIPLimit();
        if (!ipResult.success) {
          setLimitType('ip');
          setShowLimitModal(true);
          setLoading(false);
          return;
        }
      } else {
        // Usuario logueado: verificar tokens
        if (user.tokens_disponibles <= 0 && user.tokens_disponibles !== Infinity) {
          setLimitType('tokens');
          setShowLimitModal(true);
          setLoading(false);
          return;
        }
      }
      
      let response;
      
      if (type === 'comprehensive') {
        response = await verifyWalletDetailed(wallet);
      } else {
        response = await verifyWallet(wallet);
      }
      
      setResult(response);
      
      // Actualizar tokens restantes en el contexto
      if (response.tokens_restantes !== undefined) {
        updateTokens(response.tokens_restantes);
      }
    } catch (err) {
      console.error('Error al analizar wallet:', err);
      
      if (err.response?.status === 403) {
        setError('You don\'t have enough tokens to perform this query. Please purchase a plan.');
      } else if (err.response?.status === 429) {
        setLimitType('ip');
        setShowLimitModal(true);
      } else if (err.response?.data?.error) {
        // Usar el mensaje de error proporcionado por el servidor
        setError(err.response.data.error);
      } else if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        setError('Network connection error. Please check your internet connection and try again.');
      } else {
        setError('Error analyzing wallet. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleNewScan = () => {
    setResult(null);
    setError(null);
  };
  
  const handleUpgrade = () => {
    navigate('/pricing');
  };
  
  return (
    <ScannerContainer>
      <ScannerHeader>
        <Title>Wallet Forensic Scanner</Title>
        <Subtitle>
          Enter a TRON wallet address to perform forensic analysis and risk assessment
        </Subtitle>
        
        {!result && (
          <WalletInput 
            onAnalyze={handleAnalyze} 
            showOptions={true}
            showConnect={false}
          />
        )}
      </ScannerHeader>
      
      {loading && (
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Analyzing wallet...</LoadingText>
        </LoadingContainer>
      )}
      
      {error && (
        <ErrorContainer>
          <strong>{error}</strong>
          {error.includes('conexión') || error.includes('connection') || error.includes('Network') ? (
            <>
              <p>
                Esto puede deberse a problemas de conectividad con la blockchain de TRON o con tu conexión a internet.
                Por favor, verifica tu conexión e intenta nuevamente en unos momentos.
              </p>
              <button onClick={() => setError(null)}>Intentar nuevamente</button>
            </>
          ) : null}
        </ErrorContainer>
      )}
      
      {result && (
        <ResultsContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ResultCard>
            <ResultHeader>
              <WalletInfo>
                <WalletAddress>{result.wallet}</WalletAddress>
                <ScanTime>Scanned on {new Date(result.timestamp || Date.now()).toLocaleString()}</ScanTime>
              </WalletInfo>
              
              <RiskBadge risk={result.riesgo}>
                <span>{result.riesgo}</span>
              </RiskBadge>
            </ResultHeader>
            
            <ResultContent>
              <ResultSection>
                <SectionTitle>
                  <span>📋</span>
                  <span>Blacklist Events</span>
                </SectionTitle>
                
                {result.eventos && result.eventos.length > 0 ? (
                  <EventsList>
                    {result.eventos.map((evento, index) => (
                      <EventItem key={index}>
                        <EventHeader>
                          <EventType type={evento.event}>
                            {evento.event === 'AddedBlackList' ? 'Added to Blacklist' : 'Removed from Blacklist'}
                          </EventType>
                          <EventDate>{new Date(evento.fecha).toLocaleString()}</EventDate>
                        </EventHeader>
                      </EventItem>
                    ))}
                  </EventsList>
                ) : (
                  <NoEvents>No blacklist events found for this wallet</NoEvents>
                )}
              </ResultSection>
              
              {result.connectedWallets && (
                <ResultSection>
                  <SectionTitle>
                    <span>🔗</span>
                    <span>Connected Wallets</span>
                  </SectionTitle>
                  
                  {result.connectedWallets.length > 0 ? (
                    <EventsList>
                      {result.connectedWallets.map((connected, index) => (
                        <EventItem key={index}>
                          <EventHeader>
                            <EventType>
                              {connected.wallet}
                            </EventType>
                            <div>
                              Risk: <EventType type={connected.riesgo === 'Alto' ? 'AddedBlackList' : ''}>
                                {connected.riesgo}
                              </EventType>
                            </div>
                          </EventHeader>
                          <div>Transactions: {connected.transacciones}</div>
                        </EventItem>
                      ))}
                    </EventsList>
                  ) : (
                    <NoEvents>No connected wallets found</NoEvents>
                  )}
                </ResultSection>
              )}
              
              {result.reporte && (
                <ResultSection>
                  <SectionTitle>
                    <span>📊</span>
                    <span>Detailed Report</span>
                  </SectionTitle>
                  
                  <EventItem>
                    <div>Total Events: {result.reporte.totalEventos}</div>
                    {result.reporte.primerEvento && (
                      <div>First Event: {new Date(result.reporte.primerEvento).toLocaleString()}</div>
                    )}
                    {result.reporte.ultimoEvento && (
                      <div>Last Event: {new Date(result.reporte.ultimoEvento).toLocaleString()}</div>
                    )}
                    {result.riesgoScore !== undefined && (
                      <div>Risk Score: {result.riesgoScore}/100</div>
                    )}
                  </EventItem>
                </ResultSection>
              )}
              
              <TokensInfo>
                <TokenIcon>🔹</TokenIcon>
                <span>
                  {result.tokens_restantes === Infinity 
                    ? 'Unlimited tokens remaining' 
                    : `${result.tokens_restantes} tokens remaining`}
                </span>
              </TokensInfo>
              
              <ActionButtons>
                <PrimaryButton
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNewScan}
                >
                  New Scan
                </PrimaryButton>
                
                <SecondaryButton
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUpgrade}
                >
                  Upgrade Plan
                </SecondaryButton>
              </ActionButtons>
            </ResultContent>
          </ResultCard>
        </ResultsContainer>
      )}

      <LimitReachedModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        timeUntilReset={getTimeUntilReset()}
        type={limitType}
      />
    </ScannerContainer>
  );
};

export default ScannerPage;