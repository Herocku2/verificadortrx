import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { createPayment } from '../services/api';

const PricingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
`;

const PricingHeader = styled.div`
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

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
`;

const Tab = styled.button`
  background-color: ${props => props.active ? 'var(--color-primary)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'var(--color-text)'};
  border: 1px solid ${props => props.active ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: var(--border-radius);
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--color-secondary)' : 'rgba(255, 255, 255, 0.05)'};
  }
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const PlanCard = styled(motion.div)`
  background-color: rgba(30, 40, 60, 0.6);
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.popular ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.1)'};
  position: relative;
  overflow: hidden;
  
  ${props => props.popular && `
    transform: scale(1.05);
    
    @media (max-width: 1024px) {
      transform: scale(1);
    }
  `}
`;

const PopularBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: var(--color-primary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const PlanIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: ${props => {
    switch(props.plan) {
      case 'Basic': return 'var(--color-success)';
      case 'Intermedio': return 'var(--color-primary)';
      case 'Unlimited': return '#9c27b0';
      default: return 'var(--color-text-secondary)';
    }
  }};
`;

const PlanName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const PlanPrice = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: ${props => {
    switch(props.plan) {
      case 'Basic': return 'var(--color-success)';
      case 'Intermedio': return 'var(--color-primary)';
      case 'Unlimited': return '#9c27b0';
      default: return 'var(--color-text)';
    }
  }};
`;

const PlanTokens = styled.div`
  margin-bottom: 1.5rem;
  color: var(--color-text-secondary);
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 2rem;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  color: ${props => props.included ? 'var(--color-text)' : 'var(--color-text-secondary)'};
`;

const FeatureIcon = styled.span`
  color: ${props => props.included ? 'var(--color-success)' : 'var(--color-text-secondary)'};
`;

const PurchaseButton = styled(motion.button)`
  width: 100%;
  background-color: ${props => {
    switch(props.plan) {
      case 'Basic': return 'var(--color-success)';
      case 'Intermedio': return 'var(--color-primary)';
      case 'Unlimited': return '#9c27b0';
      default: return 'var(--color-text-secondary)';
    }
  }};
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 0.75rem 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background-color: rgba(255, 255, 255, 0.1);
    color: var(--color-text-secondary);
    cursor: not-allowed;
    transform: none;
  }
`;

const BonusText = styled.div`
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  text-align: center;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-left: 0.5rem;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: var(--color-danger);
  margin-top: 1rem;
  text-align: center;
`;

const PricingPage = () => {
  const { user, wallet } = useUser();
  const [activeTab, setActiveTab] = useState('pricing');
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const plans = [
    {
      id: 'FREE',
      name: 'Free',
      price: '$0',
      tokens: '3 tokens',
      icon: '⚡',
      popular: false,
      features: [
        { text: '3 forensic scans', included: true },
        { text: 'Basic risk assessment', included: true },
        { text: 'Blacklist verification', included: true },
        { text: 'Limited support', included: true },
        { text: 'Connected wallets analysis', included: false },
        { text: 'Email support', included: false },
        { text: 'API access', included: false }
      ],
      buttonText: 'Get Started'
    },
    {
      id: 'BASIC',
      name: 'Basic',
      price: '$9.99',
      tokens: '25 tokens',
      icon: '⭐',
      popular: false,
      features: [
        { text: '25 forensic scans', included: true },
        { text: 'Full risk assessment', included: true },
        { text: 'Blacklist verification', included: true },
        { text: 'Connected wallets analysis', included: true },
        { text: 'Email support', included: true },
        { text: '+5 bonus tokens', included: true },
        { text: 'API access', included: false }
      ],
      buttonText: 'Purchase Basic'
    },
    {
      id: 'INTERMEDIO',
      name: 'Intermedio',
      price: '$19.99',
      tokens: '75 tokens',
      icon: '👑',
      popular: true,
      features: [
        { text: '75 forensic scans', included: true },
        { text: 'Advanced risk scoring', included: true },
        { text: 'Complete forensic report', included: true },
        { text: 'Transaction history analysis', included: true },
        { text: 'Priority support', included: true },
        { text: 'API access (beta)', included: true },
        { text: '+5 bonus tokens', included: true }
      ],
      buttonText: 'Purchase Intermedio'
    },
    {
      id: 'UNLIMITED',
      name: 'Unlimited',
      price: '$49.99',
      tokens: 'Unlimited tokens',
      icon: '∞',
      popular: false,
      features: [
        { text: 'Unlimited forensic scans', included: true },
        { text: 'Premium risk analysis', included: true },
        { text: 'Batch wallet scanning', included: true },
        { text: 'Advanced API access', included: true },
        { text: 'Custom reporting', included: true },
        { text: '24/7 priority support', included: true },
        { text: 'White-label option', included: true }
      ],
      buttonText: 'Go Unlimited'
    }
  ];
  
  const handlePurchase = async (planId) => {
    if (!wallet) {
      setError('Please connect your wallet first');
      return;
    }
    
    setLoading({ ...loading, [planId]: true });
    setError(null);
    
    try {
      // En un entorno real, esto haría una llamada a la API
      // const response = await createPayment(planId, wallet);
      
      // Simulamos una llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirigir a la página de pago (en un entorno real, esto sería la URL de NowPayments)
      navigate('/payment/success?plan=' + planId);
    } catch (err) {
      console.error('Error al crear pago:', err);
      setError('Error creating payment. Please try again.');
    } finally {
      setLoading({ ...loading, [planId]: false });
    }
  };
  
  return (
    <PricingContainer>
      <PricingHeader>
        <Title>Choose Your Plan</Title>
        <Subtitle>
          Select the perfect plan for your forensic analysis needs. All plans include bonus tokens and comprehensive support.
        </Subtitle>
        
        <TabsContainer>
          <Tab 
            active={activeTab === 'pricing'} 
            onClick={() => setActiveTab('pricing')}
          >
            <span>💰</span> Pricing
          </Tab>
          <Tab 
            active={activeTab === 'scanner'} 
            onClick={() => setActiveTab('scanner')}
          >
            <span>🔍</span> Scanner
          </Tab>
        </TabsContainer>
      </PricingHeader>
      
      <PlansGrid>
        {plans.map((plan) => (
          <PlanCard 
            key={plan.id}
            popular={plan.popular}
            whileHover={{ translateY: -10 }}
            transition={{ duration: 0.3 }}
          >
            {plan.popular && <PopularBadge>Most Popular</PopularBadge>}
            
            <PlanIcon plan={plan.name}>{plan.icon}</PlanIcon>
            <PlanName>{plan.name}</PlanName>
            <PlanPrice plan={plan.name}>{plan.price}</PlanPrice>
            <PlanTokens>{plan.tokens}</PlanTokens>
            
            <FeaturesList>
              {plan.features.map((feature, index) => (
                <FeatureItem key={index} included={feature.included}>
                  <FeatureIcon included={feature.included}>
                    {feature.included ? '✓' : '✗'}
                  </FeatureIcon>
                  <span>{feature.text}</span>
                </FeatureItem>
              ))}
            </FeaturesList>
            
            <PurchaseButton
              plan={plan.name}
              onClick={() => handlePurchase(plan.id)}
              disabled={loading[plan.id] || (user?.plan === plan.name && plan.id !== 'FREE')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading[plan.id] ? (
                <>
                  <span>Processing...</span>
                  <LoadingSpinner />
                </>
              ) : user?.plan === plan.name && plan.id !== 'FREE' ? (
                'Current Plan'
              ) : (
                plan.buttonText
              )}
            </PurchaseButton>
            
            {plan.id !== 'FREE' && (
              <BonusText>Includes 5 bonus tokens • No expiration</BonusText>
            )}
          </PlanCard>
        ))}
      </PlansGrid>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </PricingContainer>
  );
};

export default PricingPage;