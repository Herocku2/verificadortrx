import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
`;

const NotFoundIcon = styled(motion.div)`
  font-size: 5rem;
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

const HomeButton = styled(motion.button)`
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: var(--color-secondary);
  }
`;

const NotFoundPage = () => {
  return (
    <NotFoundContainer>
      <NotFoundIcon
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        🔍
      </NotFoundIcon>
      
      <Title>404 - Page Not Found</Title>
      <Subtitle>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </Subtitle>
      
      <Link to="/">
        <HomeButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Go to Home
        </HomeButton>
      </Link>
    </NotFoundContainer>
  );
};

export default NotFoundPage;