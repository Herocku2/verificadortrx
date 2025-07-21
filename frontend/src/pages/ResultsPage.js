import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { verifyWallet, verifyWalletDetailed } from '../services/api';
import ReportGenerator from '../components/ReportGenerator';

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
`;

const ResultsHeader = styled.div`
  text-align: center;
  max-width: 800px;
  margin: 0 auto 2rem;
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

const ResultCard = styled(motion.div)`
  background-color: rgba(30, 40, 60, 0.6);
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
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
  width: 100%;
  max-width: 800px;
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
  flex-wrap: wrap;
  
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

const ResultsPage = () => {
  const { wallet: walletParam } = useParams();
  const { user, updateTokens } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState(null);
  const navigate = useNavigate();
  
  // Cargar resultados al montar el componente
  useEffect(() => {
    const fetchResults = async () => {
      if (!walletParam) {
        setError('No wallet address provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Determinar qué tipo de análisis realizar según el plan del usuario
        let response;
        
        if (user && (user.plan === 'Intermedio' || user.plan === 'Unlimited' || user.plan === 'Premium')) {
          response = await verifyWalletDetailed(walletParam);
        } else {
          response = await verifyWallet(walletParam);
        }
        
        setResult(response);
        
        // Actualizar tokens restantes en el contexto
        if (response.tokens_restantes !== undefined) {
          updateTokens(response.tokens_restantes);
        }
      } catch (err) {
        console.error('Error al obtener resultados:', err);
        
        if (err.response?.status === 403) {
          setError('No tienes suficientes tokens para realizar esta consulta. Por favor, adquiere un plan.');
        } else {
          setError('Error al analizar la wallet. Por favor, intenta de nuevo.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [walletParam, user]);
  
  const handleNewScan = () => {
    navigate('/scanner');
  };
  
  const handleUpgrade = () => {
    navigate('/pricing');
  };
  
  return (
    <ResultsContainer>
      <ResultsHeader>
        <Title>Wallet Analysis Results</Title>
      </ResultsHeader>
      
      {loading && (
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Analyzing wallet...</LoadingText>
        </LoadingContainer>
      )}
      
      {error && (
        <ErrorContainer>
          {error}
        </ErrorContainer>
      )}
      
      {result && (
        <ResultCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
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
            
            {/* Componente para generar y compartir informes */}
            <ReportGenerator 
              wallet={result.wallet} 
              onTokensUpdate={(tokens) => updateTokens(tokens)} 
            />
          </ResultContent>
        </ResultCard>
      )}
    </ResultsContainer>
  );
};

export default ResultsPage;