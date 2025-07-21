import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const CancelContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
`;

const CancelIcon = styled(motion.div)`
  font-size: 5rem;
  color: var(--color-warning);
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

const PaymentCancelPage = () => {
  const navigate = useNavigate();
  
  const handleTryAgain = () => {
    navigate('/pricing');
  };
  
  const handleGoHome = () => {
    navigate('/');
  };
  
  return (
    <CancelContainer>
      <CancelIcon
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        ⚠️
      </CancelIcon>
      
      <Title>Payment Cancelled</Title>
      <Subtitle>
        Your payment process was cancelled. No charges have been made to your account.
        You can try again or continue using your current plan.
      </Subtitle>
      
      <ActionButtons>
        <PrimaryButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleTryAgain}
        >
          Try Again
        </PrimaryButton>
        
        <SecondaryButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGoHome}
        >
          Go to Home
        </SecondaryButton>
      </ActionButtons>
    </CancelContainer>
  );
};

export default PaymentCancelPage;