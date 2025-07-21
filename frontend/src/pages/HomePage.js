import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import WalletInput from '../components/WalletInput';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
`;

const HeroSection = styled.section`
  text-align: center;
  max-width: 800px;
  margin: 0 auto 4rem;
  padding: 0 20px;
`;

const Title = styled(motion.h1)`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  background: linear-gradient(90deg, #0078FF, #00C9FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  margin-bottom: 2.5rem;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const FeaturesSection = styled.section`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 4rem;
  padding: 0 20px;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const FeatureCard = styled(motion.div)`
  background-color: rgba(30, 40, 60, 0.6);
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  }
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: var(--color-primary);
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const FeatureDescription = styled.p`
  color: var(--color-text-secondary);
  line-height: 1.6;
`;

const StatsSection = styled.section`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 4rem;
  padding: 0 20px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 1.5rem;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--color-primary);
`;

const StatLabel = styled.div`
  color: var(--color-text-secondary);
  font-size: 1rem;
`;

const StatIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--color-primary);
`;

const CTASection = styled.section`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem 20px;
  text-align: center;
`;

const CTATitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const CTADescription = styled.p`
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const HomePage = () => {
  const navigate = useNavigate();
  
  const handleAnalyze = (wallet) => {
    navigate(`/scanner?wallet=${wallet}`);
  };
  
  // Animación para elementos que aparecen al hacer scroll
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  
  return (
    <HomeContainer>
      <HeroSection>
        <Title
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          TRXGuardian
        </Title>
        <Subtitle>
          Advanced Forensic Wallet Risk Scanner for TRON Network
        </Subtitle>
        
        <WalletInput onAnalyze={handleAnalyze} />
      </HeroSection>
      
      <FeaturesSection>
        <FeaturesGrid>
          <FeatureCard
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <FeatureIcon>🛡️</FeatureIcon>
            <FeatureTitle>Forensic Analysis</FeatureTitle>
            <FeatureDescription>
              Advanced risk assessment and blacklist verification to protect your investments from fraudulent wallets.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <FeatureIcon>🔒</FeatureIcon>
            <FeatureTitle>Anonymous</FeatureTitle>
            <FeatureDescription>
              No personal data required, complete privacy. We don't collect emails, passwords or any personal information.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <FeatureIcon>⚡</FeatureIcon>
            <FeatureTitle>Instant Results</FeatureTitle>
            <FeatureDescription>
              Get comprehensive forensic reports in seconds with our high-performance blockchain analysis engine.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>
      </FeaturesSection>
      
      <StatsSection>
        <StatsGrid>
          <StatCard>
            <StatIcon>📈</StatIcon>
            <StatValue>99.9%</StatValue>
            <StatLabel>Accuracy Rate</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatIcon>👥</StatIcon>
            <StatValue>50K+</StatValue>
            <StatLabel>Wallets Analyzed</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatIcon>🛡️</StatIcon>
            <StatValue>24/7</StatValue>
            <StatLabel>Monitoring</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatIcon>🌐</StatIcon>
            <StatValue>Global</StatValue>
            <StatLabel>Coverage</StatLabel>
          </StatCard>
        </StatsGrid>
      </StatsSection>
      
      <CTASection>
        <CTATitle>Ready to secure your TRON investments?</CTATitle>
        <CTADescription>
          Start with our free plan or upgrade for advanced features and unlimited scans.
        </CTADescription>
        <motion.button
          className="btn btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/pricing')}
        >
          View Plans
        </motion.button>
      </CTASection>
    </HomeContainer>
  );
};

export default HomePage;