import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from './Modal';
import Button from './Button';
import { verifyWalletBasic } from '../services/api';

const DiagnosticsContainer = styled.div`
  max-width: 600px;
  color: var(--color-text);
`;

const DiagnosticSection = styled.div`
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 4px solid ${props => {
    switch(props.status) {
      case 'success': return 'var(--color-success)';
      case 'warning': return 'var(--color-warning)';
      case 'error': return 'var(--color-danger)';
      default: return 'var(--color-text-secondary)';
    }
  }};
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusIcon = styled.span`
  font-size: 1.2rem;
`;

const DetailsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
`;

const DetailItem = styled.li`
  padding: 0.25rem 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  display: flex;
  justify-content: space-between;
`;

const TestButton = styled(Button)`
  margin-top: 1rem;
  width: 100%;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: var(--color-primary);
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const DiagnosticsModal = ({ isOpen, onClose }) => {
  const [diagnostics, setDiagnostics] = useState({
    frontend: { status: 'checking', details: {} },
    backend: { status: 'checking', details: {} },
    blockchain: { status: 'checking', details: {} },
    network: { status: 'checking', details: {} }
  });
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen]);

  const runDiagnostics = async () => {
    setTesting(true);
    
    // Test Frontend
    const frontendTest = testFrontend();
    setDiagnostics(prev => ({ ...prev, frontend: frontendTest }));

    // Test Backend Connection
    try {
      const backendTest = await testBackend();
      setDiagnostics(prev => ({ ...prev, backend: backendTest }));
    } catch (error) {
      setDiagnostics(prev => ({ 
        ...prev, 
        backend: { 
          status: 'error', 
          details: { error: error.message } 
        } 
      }));
    }

    // Test Blockchain Connection
    try {
      const blockchainTest = await testBlockchain();
      setDiagnostics(prev => ({ ...prev, blockchain: blockchainTest }));
    } catch (error) {
      setDiagnostics(prev => ({ 
        ...prev, 
        blockchain: { 
          status: 'error', 
          details: { error: error.message } 
        } 
      }));
    }

    // Test Network
    const networkTest = await testNetwork();
    setDiagnostics(prev => ({ ...prev, network: networkTest }));

    setTesting(false);
  };

  const testFrontend = () => {
    const details = {
      'React Version': React.version,
      'User Agent': navigator.userAgent.split(' ')[0],
      'Local Storage': typeof(Storage) !== "undefined" ? 'Available' : 'Not Available',
      'API URL': process.env.REACT_APP_API_URL || 'http://localhost:5173/api'
    };

    return {
      status: 'success',
      details
    };
  };

  const testBackend = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5173/api'}/verify/diagnostics`);
      
      if (response.ok) {
        const data = await response.json();
        return {
          status: 'success',
          details: {
            'Server Status': data.server?.status || 'Unknown',
            'Uptime': data.server?.uptime ? `${Math.floor(data.server.uptime / 60)} minutes` : 'Unknown',
            'Environment': data.server?.nodeEnv || 'Unknown'
          }
        };
      } else {
        return {
          status: 'error',
          details: {
            'HTTP Status': response.status,
            'Status Text': response.statusText
          }
        };
      }
    } catch (error) {
      return {
        status: 'error',
        details: {
          'Error': error.message,
          'Type': error.name
        }
      };
    }
  };

  const testBlockchain = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5173/api'}/verify/status`);
      
      if (response.ok) {
        const data = await response.json();
        return {
          status: data.success ? 'success' : 'error',
          details: {
            'TRON Connection': data.success ? 'Connected' : 'Disconnected',
            'Method': data.method || 'Unknown',
            'Block Number': data.block_number || 'Unknown',
            'Timestamp': data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : 'Unknown'
          }
        };
      } else {
        return {
          status: 'error',
          details: {
            'HTTP Status': response.status,
            'Error': 'Failed to check TRON status'
          }
        };
      }
    } catch (error) {
      return {
        status: 'error',
        details: {
          'Error': error.message,
          'Type': 'Network Error'
        }
      };
    }
  };

  const testNetwork = async () => {
    const startTime = Date.now();
    
    try {
      // Test basic connectivity
      const response = await fetch('https://api.trongrid.io/wallet/getnowblock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      if (response.ok) {
        return {
          status: latency < 2000 ? 'success' : 'warning',
          details: {
            'TronGrid API': 'Accessible',
            'Latency': `${latency}ms`,
            'Status': latency < 1000 ? 'Good' : latency < 2000 ? 'Slow' : 'Very Slow'
          }
        };
      } else {
        return {
          status: 'error',
          details: {
            'TronGrid API': 'Not Accessible',
            'HTTP Status': response.status,
            'Latency': `${latency}ms`
          }
        };
      }
    } catch (error) {
      return {
        status: 'error',
        details: {
          'TronGrid API': 'Connection Failed',
          'Error': error.message
        }
      };
    }
  };

  const testWalletVerification = async () => {
    setTesting(true);
    
    try {
      // Test with a known wallet address
      const testWallet = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // USDT contract address
      const result = await verifyWalletBasic(testWallet);
      
      alert(`Test successful! Wallet verification is working. Result: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      alert(`Test failed: ${error.message}`);
    }
    
    setTesting(false);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'checking': return <LoadingSpinner />;
      default: return '❓';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'success': return 'OK';
      case 'warning': return 'Warning';
      case 'error': return 'Error';
      case 'checking': return 'Checking...';
      default: return 'Unknown';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="System Diagnostics">
      <DiagnosticsContainer>
        <DiagnosticSection status={diagnostics.frontend.status}>
          <SectionTitle>
            <StatusIcon>{getStatusIcon(diagnostics.frontend.status)}</StatusIcon>
            Frontend - {getStatusText(diagnostics.frontend.status)}
          </SectionTitle>
          <DetailsList>
            {Object.entries(diagnostics.frontend.details).map(([key, value]) => (
              <DetailItem key={key}>
                <span>{key}:</span>
                <span>{value}</span>
              </DetailItem>
            ))}
          </DetailsList>
        </DiagnosticSection>

        <DiagnosticSection status={diagnostics.backend.status}>
          <SectionTitle>
            <StatusIcon>{getStatusIcon(diagnostics.backend.status)}</StatusIcon>
            Backend - {getStatusText(diagnostics.backend.status)}
          </SectionTitle>
          <DetailsList>
            {Object.entries(diagnostics.backend.details).map(([key, value]) => (
              <DetailItem key={key}>
                <span>{key}:</span>
                <span>{value}</span>
              </DetailItem>
            ))}
          </DetailsList>
        </DiagnosticSection>

        <DiagnosticSection status={diagnostics.blockchain.status}>
          <SectionTitle>
            <StatusIcon>{getStatusIcon(diagnostics.blockchain.status)}</StatusIcon>
            Blockchain - {getStatusText(diagnostics.blockchain.status)}
          </SectionTitle>
          <DetailsList>
            {Object.entries(diagnostics.blockchain.details).map(([key, value]) => (
              <DetailItem key={key}>
                <span>{key}:</span>
                <span>{value}</span>
              </DetailItem>
            ))}
          </DetailsList>
        </DiagnosticSection>

        <DiagnosticSection status={diagnostics.network.status}>
          <SectionTitle>
            <StatusIcon>{getStatusIcon(diagnostics.network.status)}</StatusIcon>
            Network - {getStatusText(diagnostics.network.status)}
          </SectionTitle>
          <DetailsList>
            {Object.entries(diagnostics.network.details).map(([key, value]) => (
              <DetailItem key={key}>
                <span>{key}:</span>
                <span>{value}</span>
              </DetailItem>
            ))}
          </DetailsList>
        </DiagnosticSection>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <TestButton 
            onClick={runDiagnostics} 
            disabled={testing}
            variant="secondary"
          >
            {testing ? 'Running Tests...' : 'Run Tests Again'}
          </TestButton>
          
          <TestButton 
            onClick={testWalletVerification} 
            disabled={testing}
          >
            {testing ? 'Testing...' : 'Test Wallet Verification'}
          </TestButton>
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Common Issues & Solutions:</h4>
          <ul style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', paddingLeft: '1rem' }}>
            <li>If Backend shows error: Make sure the backend server is running on port 5173</li>
            <li>If Blockchain shows error: TRON network might be experiencing issues</li>
            <li>If Network is slow: Try again later or check your internet connection</li>
            <li>If you have tokens but can't scan: Try the "Test Wallet Verification" button</li>
          </ul>
        </div>
      </DiagnosticsContainer>
    </Modal>
  );
};

export default DiagnosticsModal;