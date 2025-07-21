import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { generateWalletReport, generateTelegramReport } from '../services/api';

const ReportContainer = styled.div`
  background-color: rgba(30, 40, 60, 0.6);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  margin-top: 2rem;
`;

const ReportTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ReportOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ReportOption = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: var(--border-radius);
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid ${props => props.selected ? 'var(--color-primary)' : 'transparent'};
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.3);
  }
`;

const OptionTitle = styled.div`
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const OptionDescription = styled.div`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background-color: var(--color-primary);
  color: white;
  border: none;
  
  &:hover:not(:disabled) {
    background-color: var(--color-secondary);
  }
`;

const SecondaryButton = styled(Button)`
  background-color: transparent;
  color: var(--color-text);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const ErrorMessage = styled.div`
  color: var(--color-danger);
  margin-top: 1rem;
  font-size: 0.875rem;
`;

const SuccessMessage = styled.div`
  color: var(--color-success);
  margin-top: 1rem;
  font-size: 0.875rem;
`;

const ReportGenerator = ({ wallet, onTokensUpdate }) => {
  const [selectedFormat, setSelectedFormat] = useState('telegram');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      switch (selectedFormat) {
        case 'telegram':
          const telegramData = await generateTelegramReport(wallet);
          window.open(telegramData.telegramUrl, '_blank');
          setSuccess('Informe generado y listo para compartir en Telegram');
          if (onTokensUpdate && telegramData.tokens_restantes !== undefined) {
            onTokensUpdate(telegramData.tokens_restantes);
          }
          break;
          
        case 'pdf':
          window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:3000/api'}/reports/${wallet}?format=pdf`, '_blank');
          setSuccess('Descargando informe en formato PDF');
          break;
          
        case 'html':
          window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:3000/api'}/reports/${wallet}?format=html`, '_blank');
          setSuccess('Informe abierto en una nueva pestaña');
          break;
          
        case 'text':
          window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:3000/api'}/reports/${wallet}?format=text`, '_blank');
          setSuccess('Descargando informe en formato texto');
          break;
          
        default:
          setError('Formato de informe no válido');
      }
    } catch (err) {
      console.error('Error al generar informe:', err);
      setError(err.message || 'Error al generar el informe');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ReportContainer>
      <ReportTitle>
        <span>📊</span>
        <span>Generar Informe Detallado</span>
      </ReportTitle>
      
      <ReportOptions>
        <ReportOption 
          selected={selectedFormat === 'telegram'}
          onClick={() => setSelectedFormat('telegram')}
        >
          <OptionTitle>
            <span>📱</span>
            <span>Telegram</span>
          </OptionTitle>
          <OptionDescription>
            Compartir informe a través de Telegram
          </OptionDescription>
        </ReportOption>
        
        <ReportOption 
          selected={selectedFormat === 'pdf'}
          onClick={() => setSelectedFormat('pdf')}
        >
          <OptionTitle>
            <span>📄</span>
            <span>PDF</span>
          </OptionTitle>
          <OptionDescription>
            Descargar informe en formato PDF
          </OptionDescription>
        </ReportOption>
        
        <ReportOption 
          selected={selectedFormat === 'html'}
          onClick={() => setSelectedFormat('html')}
        >
          <OptionTitle>
            <span>🌐</span>
            <span>HTML</span>
          </OptionTitle>
          <OptionDescription>
            Ver informe en el navegador
          </OptionDescription>
        </ReportOption>
        
        <ReportOption 
          selected={selectedFormat === 'text'}
          onClick={() => setSelectedFormat('text')}
        >
          <OptionTitle>
            <span>📝</span>
            <span>Texto</span>
          </OptionTitle>
          <OptionDescription>
            Descargar informe en formato texto
          </OptionDescription>
        </ReportOption>
      </ReportOptions>
      
      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
        Nota: Generar un informe consume 1 token de tu cuenta.
      </div>
      
      <ActionButtons>
        <PrimaryButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGenerateReport}
          disabled={loading}
        >
          {loading ? 'Generando...' : 'Generar Informe'}
        </PrimaryButton>
      </ActionButtons>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
    </ReportContainer>
  );
};

export default ReportGenerator;