import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';

const SuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
`;

const SuccessIcon = styled(motion.div)`
  font-size: 5rem;
  color: var(--color-success);
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const PlanDetails = styled.div`
  background-color: rgba(30, 40, 60, 0.6);
  border-radius: var(--border-radius);
  padding: 2rem;
  width: 100%;
  margin-bottom: 2rem;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.div`
  color: var(--color-text-secondary);
`;

const DetailValue = styled.div`
  font-weight: 500;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
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

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan');
  const { user, updatePlan } = useUser();
  const navigate = useNavigate();
  
  // Obtener detalles del plan
  const getPlanDetails = () => {
    switch (planId) {
      case 'BASIC':
        return {
          name: 'Basic',
          price: '$9.99',
          tokens: 25,
          bonusTokens: 5,
          totalTokens: 30
        };
      case 'INTERMEDIO':
        return {
          name: 'Intermedio',
          price: '$19.99',
          tokens: 75,
          bonusTokens: 5,
          totalTokens: 80
        };
      case 'UNLIMITED':
        return {
          name: 'Unlimited',
          price: '$49.99',
          tokens: 'Unlimited',
          bonusTokens: 5,
          totalTokens: 'Unlimited'
        };
      default:
        return {
          name: 'Unknown',
          price: '$0.00',
          tokens: 0,
          bonusTokens: 0,
          totalTokens: 0
        };
    }
  };
  
  const plan = getPlanDetails();
  
  // Simular actualización del plan en el contexto
  useEffect(() => {
    if (planId && user) {
      // En un entorno real, esto se haría a través de la API
      updatePlan(plan.name, plan.totalTokens === 'Unlimited' ? Infinity : plan.totalTokens);
    }
  }, [planId, user]);
  
  const handleScanNow = () => {
    navigate('/scanner');
  };
  
  const handleGoHome = () => {
    navigate('/');
  };
  
  return (
    <SuccessContainer>
      <SuccessIcon
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        ✅
      </SuccessIcon>
      
      <Title>Payment Successful!</Title>
      <Subtitle>
        Thank you for your purchase. Your plan has been activated and tokens have been added to your account.
      </Subtitle>
      
      <PlanDetails>
        <DetailRow>
          <DetailLabel>Plan</DetailLabel>
          <DetailValue>{plan.name}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Amount</DetailLabel>
          <DetailValue>{plan.price}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Tokens</DetailLabel>
          <DetailValue>{plan.tokens}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Bonus Tokens</DetailLabel>
          <DetailValue>+{plan.bonusTokens}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Total Tokens</DetailLabel>
          <DetailValue>{plan.totalTokens}</DetailValue>
        </DetailRow>
      </PlanDetails>
      
      <ActionButtons>
        <PrimaryButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleScanNow}
        >
          Scan Now
        </PrimaryButton>
        
        <SecondaryButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGoHome}
        >
          Go to Home
        </SecondaryButton>
      </ActionButtons>
    </SuccessContainer>
  );
};

export default PaymentSuccessPage;