import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useUser } from '../../context/UserContext';
import { isAdminWallet, updateSystemSettings } from '../../services/api';

const SettingsContainer = styled.div`
  padding: 2rem 0;
`;

const SettingsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const SettingsTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
`;

const SystemStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: rgba(0, 200, 83, 0.2);
  color: var(--color-success);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const SettingsSection = styled.div`
  background-color: rgba(30, 40, 60, 0.6);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const SectionIcon = styled.div`
  color: var(--color-primary);
  font-size: 1.25rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const FormDescription = styled.p`
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius);
  color: var(--color-text);
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
  
  &::placeholder {
    color: var(--color-text-secondary);
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius);
  color: var(--color-text);
  font-size: 0.875rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
  
  &::placeholder {
    color: var(--color-text-secondary);
  }
`;

const ToggleSwitch = styled.div`
  display: inline-block;
  position: relative;
  width: 60px;
  height: 30px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: var(--color-primary);
  }
  
  &:checked + span:before {
    transform: translateX(30px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.1);
  transition: 0.4s;
  border-radius: 34px;
  
  &:before {
    position: absolute;
    content: "";
    height: 22px;
    width: 22px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ToggleLabel = styled.div`
  font-weight: 500;
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
`;

const PrimaryButton = styled(Button)`
  background-color: var(--color-primary);
  color: white;
  border: none;
  
  &:hover {
    background-color: var(--color-secondary);
  }
`;

const SecondaryButton = styled(Button)`
  background-color: transparent;
  color: var(--color-text);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const AdminSettings = () => {
  const { wallet } = useUser();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Estado para los ajustes
  const [settings, setSettings] = useState({
    general: {
      systemName: 'TRXGuardian',
      systemDescription: 'Advanced Forensic Wallet Risk Scanner for TRON Network',
      maintenanceMode: false
    },
    security: {
      maxTokensPerUser: 1000,
      scanRateLimit: 60,
      suspiciousActivityThreshold: 70
    },
    payment: {
      nowPaymentsApiKey: '',
      enableCryptoPayments: true,
      supportedCurrencies: 'TRX, BTC, ETH, USDT'
    },
    api: {
      trongridApiKey: '',
      tronscanApiKey: '',
      enableApiLogging: true
    },
    notification: {
      adminEmail: 'admin@trxguardian.com',
      emailNotifications: true,
      systemAlerts: true
    }
  });
  
  // Verificar si es wallet de administrador
  if (!wallet || !isAdminWallet(wallet)) {
    return <Navigate to="/" replace />;
  }
  
  // Manejar cambios en los inputs
  const handleInputChange = (section, field, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value
      }
    });
  };
  
  // Manejar cambios en los toggles
  const handleToggleChange = (section, field) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: !settings[section][field]
      }
    });
  };
  
  // Guardar configuración
  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // En un entorno real, esto haría una llamada a la API
      // await updateSystemSettings(wallet, settings);
      
      // Simulamos una llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error al guardar configuración:', err);
      setError('No se pudo guardar la configuración');
    } finally {
      setLoading(false);
    }
  };
  
  // Restablecer configuración por defecto
  const handleResetSettings = () => {
    // En un entorno real, esto cargaría la configuración por defecto desde el backend
    setSettings({
      general: {
        systemName: 'TRXGuardian',
        systemDescription: 'Advanced Forensic Wallet Risk Scanner for TRON Network',
        maintenanceMode: false
      },
      security: {
        maxTokensPerUser: 1000,
        scanRateLimit: 60,
        suspiciousActivityThreshold: 70
      },
      payment: {
        nowPaymentsApiKey: '',
        enableCryptoPayments: true,
        supportedCurrencies: 'TRX, BTC, ETH, USDT'
      },
      api: {
        trongridApiKey: '',
        tronscanApiKey: '',
        enableApiLogging: true
      },
      notification: {
        adminEmail: 'admin@trxguardian.com',
        emailNotifications: true,
        systemAlerts: true
      }
    });
  };
  
  return (
    <SettingsContainer className="container">
      <SettingsHeader>
        <SettingsTitle>System Settings</SettingsTitle>
        <SystemStatus>
          <span>●</span>
          <span>System Online</span>
        </SystemStatus>
      </SettingsHeader>
      
      <SettingsGrid>
        <SettingsSection>
          <SectionHeader>
            <SectionIcon>⚙️</SectionIcon>
            <SectionTitle>General Settings</SectionTitle>
          </SectionHeader>
          
          <FormGroup>
            <FormLabel>System Name</FormLabel>
            <FormInput
              type="text"
              value={settings.general.systemName}
              onChange={(e) => handleInputChange('general', 'systemName', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel>System Description</FormLabel>
            <FormTextarea
              value={settings.general.systemDescription}
              onChange={(e) => handleInputChange('general', 'systemDescription', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <ToggleContainer>
              <ToggleLabel>Maintenance Mode</ToggleLabel>
              <ToggleSwitch>
                <ToggleInput
                  type="checkbox"
                  checked={settings.general.maintenanceMode}
                  onChange={() => handleToggleChange('general', 'maintenanceMode')}
                />
                <ToggleSlider />
              </ToggleSwitch>
            </ToggleContainer>
            <FormDescription>Enable to prevent user access during updates</FormDescription>
          </FormGroup>
        </SettingsSection>
        
        <SettingsSection>
          <SectionHeader>
            <SectionIcon>🔒</SectionIcon>
            <SectionTitle>Security Settings</SectionTitle>
          </SectionHeader>
          
          <FormGroup>
            <FormLabel>Max Tokens Per User</FormLabel>
            <FormInput
              type="number"
              value={settings.security.maxTokensPerUser}
              onChange={(e) => handleInputChange('security', 'maxTokensPerUser', parseInt(e.target.value))}
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel>Scan Rate Limit (per minute)</FormLabel>
            <FormInput
              type="number"
              value={settings.security.scanRateLimit}
              onChange={(e) => handleInputChange('security', 'scanRateLimit', parseInt(e.target.value))}
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel>Suspicious Activity Threshold (%)</FormLabel>
            <FormInput
              type="number"
              value={settings.security.suspiciousActivityThreshold}
              onChange={(e) => handleInputChange('security', 'suspiciousActivityThreshold', parseInt(e.target.value))}
            />
          </FormGroup>
        </SettingsSection>
      </SettingsGrid>
      
      <SettingsSection>
        <SectionHeader>
          <SectionIcon>💰</SectionIcon>
          <SectionTitle>Payment Settings</SectionTitle>
        </SectionHeader>
        
        <FormGroup>
          <FormLabel>NowPayments API Key</FormLabel>
          <FormInput
            type="password"
            value={settings.payment.nowPaymentsApiKey}
            onChange={(e) => handleInputChange('payment', 'nowPaymentsApiKey', e.target.value)}
            placeholder="Enter your NowPayments API key"
          />
        </FormGroup>
        
        <FormGroup>
          <ToggleContainer>
            <ToggleLabel>Enable Crypto Payments</ToggleLabel>
            <ToggleSwitch>
              <ToggleInput
                type="checkbox"
                checked={settings.payment.enableCryptoPayments}
                onChange={() => handleToggleChange('payment', 'enableCryptoPayments')}
              />
              <ToggleSlider />
            </ToggleSwitch>
          </ToggleContainer>
          <FormDescription>Allow users to pay with cryptocurrencies</FormDescription>
        </FormGroup>
        
        <FormGroup>
          <FormLabel>Supported Currencies</FormLabel>
          <FormInput
            type="text"
            value={settings.payment.supportedCurrencies}
            onChange={(e) => handleInputChange('payment', 'supportedCurrencies', e.target.value)}
          />
        </FormGroup>
      </SettingsSection>
      
      <SettingsGrid>
        <SettingsSection>
          <SectionHeader>
            <SectionIcon>🔌</SectionIcon>
            <SectionTitle>API Settings</SectionTitle>
          </SectionHeader>
          
          <FormGroup>
            <FormLabel>Trongrid API Key</FormLabel>
            <FormInput
              type="password"
              value={settings.api.trongridApiKey}
              onChange={(e) => handleInputChange('api', 'trongridApiKey', e.target.value)}
              placeholder="Enter your Trongrid API key"
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel>Tronscan API Key</FormLabel>
            <FormInput
              type="password"
              value={settings.api.tronscanApiKey}
              onChange={(e) => handleInputChange('api', 'tronscanApiKey', e.target.value)}
              placeholder="Enter your Tronscan API key"
            />
          </FormGroup>
          
          <FormGroup>
            <ToggleContainer>
              <ToggleLabel>Enable API Logging</ToggleLabel>
              <ToggleSwitch>
                <ToggleInput
                  type="checkbox"
                  checked={settings.api.enableApiLogging}
                  onChange={() => handleToggleChange('api', 'enableApiLogging')}
                />
                <ToggleSlider />
              </ToggleSwitch>
            </ToggleContainer>
            <FormDescription>Log all API requests for debugging</FormDescription>
          </FormGroup>
        </SettingsSection>
        
        <SettingsSection>
          <SectionHeader>
            <SectionIcon>🔔</SectionIcon>
            <SectionTitle>Notification Settings</SectionTitle>
          </SectionHeader>
          
          <FormGroup>
            <FormLabel>Admin Email</FormLabel>
            <FormInput
              type="email"
              value={settings.notification.adminEmail}
              onChange={(e) => handleInputChange('notification', 'adminEmail', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <ToggleContainer>
              <ToggleLabel>Email Notifications</ToggleLabel>
              <ToggleSwitch>
                <ToggleInput
                  type="checkbox"
                  checked={settings.notification.emailNotifications}
                  onChange={() => handleToggleChange('notification', 'emailNotifications')}
                />
                <ToggleSlider />
              </ToggleSwitch>
            </ToggleContainer>
            <FormDescription>Receive system alerts via email</FormDescription>
          </FormGroup>
          
          <FormGroup>
            <ToggleContainer>
              <ToggleLabel>System Alerts</ToggleLabel>
              <ToggleSwitch>
                <ToggleInput
                  type="checkbox"
                  checked={settings.notification.systemAlerts}
                  onChange={() => handleToggleChange('notification', 'systemAlerts')}
                />
                <ToggleSlider />
              </ToggleSwitch>
            </ToggleContainer>
            <FormDescription>Enable system monitoring alerts</FormDescription>
          </FormGroup>
        </SettingsSection>
      </SettingsGrid>
      
      {error && (
        <div style={{ color: 'var(--color-danger)', marginTop: '1rem' }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ color: 'var(--color-success)', marginTop: '1rem' }}>
          Settings saved successfully!
        </div>
      )}
      
      <ButtonsContainer>
        <SecondaryButton onClick={handleResetSettings}>
          Reset to Default
        </SecondaryButton>
        <PrimaryButton onClick={handleSaveSettings} disabled={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </PrimaryButton>
      </ButtonsContainer>
    </SettingsContainer>
  );
};

export default AdminSettings;