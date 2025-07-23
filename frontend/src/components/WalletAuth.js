import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
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

// Usar $plan en lugar de plan para evitar que se pase al DOM
const PlanBadge = styled.span`
  background-color: ${props => {
    switch(props.$plan) {
      case 'Basic': return 'rgba(0, 200, 83, 0.2)';
      case 'Intermedio': return 'rgba(0, 120, 255, 0.2)';
      case 'Unlimited': return 'rgba(156, 39, 176, 0.2)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  color: ${props => {
    switch(props.$plan) {
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

  // Check for TronWeb availability and detect wallet changes
  useEffect(() => {
    let lastAddress = null;
    
    const checkTronWeb = () => {
      if (window.tronWeb) {
        try {
          // Verificar si tronWeb está disponible sin acceder a .ready directamente
          if (window.tronWeb.defaultAddress && window.tronWeb.defaultAddress.base58) {
            const currentAddress = window.tronWeb.defaultAddress.base58;
            
            // Actualizar el estado de tronWeb
            setTronWeb(window.tronWeb);
            
            // Detectar cambio de wallet en TronLink
            if (lastAddress && currentAddress !== lastAddress && wallet && currentAddress !== wallet) {
              console.log(`Cambio de wallet detectado: ${lastAddress} -> ${currentAddress}`);
              
              // Preguntar al usuario si desea cambiar de wallet
              if (window.confirm(`Se ha detectado un cambio de wallet en TronLink.\n\nWallet actual: ${wallet}\nNueva wallet: ${currentAddress}\n\n¿Deseas cambiar a la nueva wallet?`)) {
                // Desconectar la wallet actual
                disconnect();
                
                // Esperar un momento y luego conectar la nueva wallet
                setTimeout(() => {
                  updateWallet(currentAddress);
                  window.location.reload();
                }, 500);
              }
            }
            
            lastAddress = currentAddress;
          }
        } catch (error) {
          console.error('Error checking TronWeb:', error);
        }
      }
    };

    checkTronWeb();
    // Usar un intervalo más largo para evitar bucles y advertencias de deprecación
    const interval = setInterval(checkTronWeb, 3000);
    return () => clearInterval(interval);
  }, [wallet]);

  const connectWallet = async () => {
    // Si ya hay una wallet conectada, primero desconectarla
    if (wallet) {
      if (window.confirm('Ya tienes una wallet conectada. ¿Deseas desconectarla y conectar otra?')) {
        disconnect();
        // Esperar a que se complete la desconexión
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
      return;
    }
    
    // Verificar si TronLink está instalado
    if (!window.tronWeb) {
      if (window.confirm('TronLink no detectado. ¿Deseas instalar la extensión TronLink?')) {
        window.open('https://www.tronlink.org/', '_blank');
      }
      return;
    }

    setConnecting(true);
    try {
      // Intentar acceder a la wallet de forma más segura
      if (window.tronWeb && window.tronWeb.defaultAddress) {
        const address = window.tronWeb.defaultAddress.base58;
        if (address) {
          console.log("Wallet detectada:", address);
          
          // Verificar si la wallet está desbloqueada
          try {
            // Intentar obtener la cuenta actual
            await window.tronWeb.trx.getAccount(address);
            console.log("Wallet desbloqueada:", address);
            
            try {
              // Check if user exists
              const data = await checkUserExists(address);
              
              if (data && data.exists) {
                // User exists, log them in
                updateWallet(address);
                setShowWelcome(true);
                setTimeout(() => setShowWelcome(false), 3000);
              } else {
                // New user, show registration modal
                updateWallet(address);
                setShowRegisterModal(true);
              }
            } catch (apiError) {
              console.error('Error API al verificar usuario:', apiError);
              
              // Si es un error de red, asumir que el usuario existe
              if (apiError.message === 'Network Error' || apiError.code === 'ERR_NETWORK') {
                console.log('Backend no disponible, asumiendo que el usuario existe');
                updateWallet(address);
                setShowWelcome(true);
                setTimeout(() => setShowWelcome(false), 3000);
              } else {
                // Si hay otro tipo de error con la API, al menos conectamos la wallet
                updateWallet(address);
                alert('Wallet conectada, pero hubo un problema al verificar tu cuenta. El backend podría estar desconectado.');
              }
            }
          } catch (walletError) {
            console.error('Error al verificar wallet:', walletError);
            alert('Por favor desbloquea tu wallet TronLink y vuelve a intentarlo');
          }
        } else {
          alert('Por favor desbloquea tu wallet TronLink y vuelve a intentarlo');
        }
      } else {
        alert('TronLink detectado pero no está listo. Por favor desbloquea tu wallet y recarga la página.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Error al conectar wallet: ' + (error.message || 'Error desconocido'));
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
      
      // Si es un error de red, simular registro exitoso
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        console.log('Backend no disponible, simulando registro exitoso');
        
        const defaultUser = {
          usuario: wallet,
          username: username,
          tokens_disponibles: 3,
          plan: 'Free',
          expira: null
        };
        
        localStorage.setItem(`user_${wallet}`, JSON.stringify(defaultUser));
        
        setShowRegisterModal(false);
        setShowWelcome(true);
        setTimeout(() => {
          setShowWelcome(false);
          window.location.reload();
        }, 3000);
      } else {
        alert('Registration failed. Please try again.');
      }
    } finally {
      setRegistering(false);
    }
  };

  const disconnect = () => {
    // Limpiar el estado local
    setShowWelcome(false);
    setTronWeb(null);
    
    // Limpiar localStorage
    localStorage.removeItem('wallet');
    
    // Actualizar el contexto
    updateWallet(null);
    
    // Forzar recarga de la página para asegurar que todo se reinicie correctamente
    setTimeout(() => {
      window.location.reload();
    }, 100);
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

  if (wallet) {
    // Si hay wallet pero no hay usuario (podría estar cargando o haber un error)
    if (!user) {
      return (
        <AuthContainer>
          <WalletInfo>
            <WalletAddress>{formatWallet(wallet)}</WalletAddress>
          </WalletInfo>
          <Button variant="outline" size="small" onClick={disconnect}>
            Disconnect
          </Button>
        </AuthContainer>
      );
    }
    
    // Si hay wallet y usuario
    return (
      <AuthContainer>
        <WalletInfo>
          <TokensDisplay>
            <span>🔹</span>
            <span>{user.tokens_disponibles === Infinity ? '∞' : user.tokens_disponibles || 0} tokens</span>
          </TokensDisplay>
          <PlanBadge $plan={user.plan || 'Free'}>{user.plan || 'Free'}</PlanBadge>
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
