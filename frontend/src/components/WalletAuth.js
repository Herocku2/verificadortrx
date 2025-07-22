import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { checkUserExists, registerUser } from '../services/api';
import Modal from './Modal';
import Button from './Button';

const AuthContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const WalletInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: rgba(30, 40, 60, 0.6);
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const TokensDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--color-primary);
  font-weight: 500;
`;

const WalletAddress = styled.span`
  font-family: monospace;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
`;

const PlanBadge = styled.span`
  background-color: ${props => {
    switch(props.plan) {
      case 'Basic': return 'rgba(0, 200, 83, 0.2)';
      case 'Intermedio': return 'rgba(0, 120, 255, 0.2)';
      case 'Unlimited': return 'rgba(156, 39, 176, 0.2)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  color: ${props => {
    switch(props.plan) {
      case 'Basic': return 'var(--color-success)';
      case 'Intermedio': return 'var(--color-primary)';
      case 'Unlimited': return '#9c27b0';
      default: return 'var(--color-text-secondary)';
    }
  }};
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const RegisterForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: var(--color-text);
`;

const Input = styled.input`
  padding: 0.75rem;
  background-color: rgba(30, 40, 60, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius);
  color: var(--color-text);
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(0, 120, 255, 0.2);
  }
  
  &::placeholder {
    color: var(--color-text-secondary);
  }
`;

const ConnectedWallet = styled.div`
  background-color: rgba(0, 200, 83, 0.1);
  border: 1px solid rgba(0, 200, 83, 0.3);
  border-radius: var(--border-radius);
  padding: 1rem;
  margin-bottom: 1rem;
`;

const WelcomeMessage = styled.div`
  text-align: center;
  padding: 2rem;
  background-color: rgba(0, 200, 83, 0.1);
  border: 1px solid rgba(0, 200, 83, 0.3);
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
`;

const WalletAuth = () => {
  const { user, wallet, updateWallet, loading } = useUser();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [username, setUsername] = useState('');
  const [registering, setRegistering] = useState(false);
  const [tronWeb, setTronWeb] = useState(null);
  const [connecting, setConnecting] = useState(false);

  // Check for TronWeb availability
  useEffect(() => {
    const checkTronWeb = () => {
      if (window.tronWeb && window.tronWeb.ready) {
        setTronWeb(window.tronWeb);
      }
    };

    checkTronWeb();
    const interval = setInterval(checkTronWeb, 1000);
    return () => clearInterval(interval);
  }, []);

  const connectWallet = async () => {
    if (!tronWeb) {
      window.open('https://www.tronlink.org/', '_blank');
      return;
    }

    setConnecting(true);
    try {
      const address = tronWeb.defaultAddress.base58;
      if (address) {
        // Check if user exists
        const data = await checkUserExists(address);
        
        if (data.exists) {
          // User exists, log them in
          updateWallet(address);
          setShowWelcome(true);
          setTimeout(() => setShowWelcome(false), 3000);
        } else {
          // New user, show registration modal
          updateWallet(address);
          setShowRegisterModal(true);
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setConnecting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username.trim() || !wallet) return;

    setRegistering(true);
    try {
      const data = await registerUser(wallet, username.trim());
      
      if (data.success) {
        setShowRegisterModal(false);
        setShowWelcome(true);
        setTimeout(() => setShowWelcome(false), 3000);
        // Refresh user data
        window.location.reload();
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  const disconnect = () => {
    updateWallet(null);
    setShowWelcome(false);
  };

  const formatWallet = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (showWelcome && user) {
    return (
      <WelcomeMessage>
        <h3>Welcome {user.username}!</h3>
        <p>Successfully connected to TRXGuardian</p>
      </WelcomeMessage>
    );
  }

  if (user && wallet) {
    return (
      <AuthContainer>
        <WalletInfo>
          <TokensDisplay>
            <span>🔹</span>
            <span>{user.tokens_disponibles === Infinity ? '∞' : user.tokens_disponibles} tokens</span>
          </TokensDisplay>
          <PlanBadge plan={user.plan}>{user.plan}</PlanBadge>
          <WalletAddress>{formatWallet(wallet)}</WalletAddress>
        </WalletInfo>
        <Button variant="outline" size="small" onClick={disconnect}>
          Disconnect
        </Button>
      </AuthContainer>
    );
  }

  return (
    <>
      <AuthContainer>
        <Button 
          variant="primary" 
          onClick={connectWallet}
          loading={connecting}
          loadingText="Connecting..."
        >
          {tronWeb ? 'Connect Wallet' : 'Install TronLink'}
        </Button>
      </AuthContainer>

      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="Complete Registration"
        closeOnOverlayClick={false}
      >
        <ConnectedWallet>
          <strong>Connected Wallet:</strong>
          <br />
          <code>{wallet}</code>
        </ConnectedWallet>

        <RegisterForm onSubmit={handleRegister}>
          <FormGroup>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              maxLength={50}
            />
          </FormGroup>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={registering}
            loadingText="Creating Account..."
            disabled={!username.trim()}
          >
            Create Account
          </Button>
        </RegisterForm>

        <p style={{ 
          fontSize: '0.875rem', 
          color: 'var(--color-text-secondary)', 
          textAlign: 'center',
          marginTop: '1rem'
        }}>
          Your wallet address will be used as your unique identifier.
          No email verification required.
        </p>
      </Modal>
    </>
  );
};

export default WalletAuth;