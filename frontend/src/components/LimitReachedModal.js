import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Modal from './Modal';
import Button from './Button';

const ModalContent = styled.div`
  text-align: center;
  padding: 1rem 0;
`;

const Icon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text);
`;

const Message = styled.p`
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const ResetInfo = styled.div`
  background-color: rgba(255, 214, 0, 0.1);
  border: 1px solid rgba(255, 214, 0, 0.3);
  border-radius: var(--border-radius);
  padding: 1rem;
  margin-bottom: 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const PlanHighlight = styled.div`
  background-color: rgba(0, 120, 255, 0.1);
  border: 1px solid rgba(0, 120, 255, 0.3);
  border-radius: var(--border-radius);
  padding: 1rem;
  margin: 1rem 0;
`;

const PlanList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0;
  text-align: left;
`;

const PlanItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  color: var(--color-text-secondary);
  
  &::before {
    content: '✓';
    color: var(--color-success);
    font-weight: bold;
  }
`;

const LimitReachedModal = ({ 
  isOpen, 
  onClose, 
  timeUntilReset,
  type = 'ip' // 'ip' or 'tokens'
}) => {
  const navigate = useNavigate();

  const handleViewPlans = () => {
    onClose();
    navigate('/pricing');
  };

  const formatResetTime = () => {
    if (!timeUntilReset) return 'soon';
    const { hours, minutes } = timeUntilReset;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getModalContent = () => {
    if (type === 'tokens') {
      return {
        icon: '🔹',
        title: 'No Tokens Remaining',
        message: 'You have used all your available tokens for this billing period.',
        resetMessage: 'Tokens will reset based on your plan cycle, or you can upgrade for more tokens.'
      };
    }

    return {
      icon: '⏰',
      title: 'Daily Limit Reached',
      message: 'You have reached the maximum number of free scans allowed per day (3 scans per IP).',
      resetMessage: `Your free scans will reset in ${formatResetTime()}.`
    };
  };

  const content = getModalContent();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Scan Limit Reached"
      size="medium"
    >
      <ModalContent>
        <Icon>{content.icon}</Icon>
        <Title>{content.title}</Title>
        <Message>{content.message}</Message>

        {timeUntilReset && type === 'ip' && (
          <ResetInfo>
            <strong>Reset Time:</strong> {content.resetMessage}
          </ResetInfo>
        )}

        <PlanHighlight>
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>
            Upgrade for Unlimited Access
          </h3>
          <PlanList>
            <PlanItem>No daily limits</PlanItem>
            <PlanItem>Advanced forensic analysis</PlanItem>
            <PlanItem>Priority support</PlanItem>
            <PlanItem>API access</PlanItem>
            <PlanItem>Detailed reports</PlanItem>
          </PlanList>
        </PlanHighlight>

        <ButtonGroup>
          <Button variant="primary" onClick={handleViewPlans}>
            View Plans & Pricing
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </ButtonGroup>
      </ModalContent>
    </Modal>
  );
};

export default LimitReachedModal;