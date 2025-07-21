import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: rgba(10, 25, 41, 0.9);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem 0;
  margin-top: auto;
`;

const FooterContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FooterLogo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-text);
  font-weight: 700;
  font-size: 1.5rem;
  text-decoration: none;
  margin-bottom: 0.5rem;
`;

const LogoIcon = styled.div`
  color: var(--color-primary);
  font-size: 1.8rem;
`;

const FooterDescription = styled.p`
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
`;

const FooterHeading = styled.h3`
  color: var(--color-text);
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FooterLink = styled(Link)`
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--color-primary);
  }
`;

const ExternalLink = styled.a`
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--color-primary);
  }
`;

const BottomBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 2rem auto 0;
  padding: 1rem 20px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const Copyright = styled.p`
  color: var(--color-text-secondary);
  font-size: 0.875rem;
`;

const PoweredBy = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
`;

const PoweredByLink = styled.a`
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--color-secondary);
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
`;

const SocialLink = styled.a`
  color: var(--color-text-secondary);
  font-size: 1.25rem;
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--color-primary);
  }
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterLogo to="/">
            <LogoIcon>🛡️</LogoIcon>
            TRXGuardian
          </FooterLogo>
          <FooterDescription>
            Advanced forensic wallet risk scanner for the TRON network. Protecting your investments with comprehensive security analysis.
          </FooterDescription>
        </FooterSection>
        
        <FooterSection>
          <FooterHeading>Product</FooterHeading>
          <FooterLinks>
            <FooterLink to="/scanner">Forensic Scanner</FooterLink>
            <FooterLink to="/pricing">Risk Assessment</FooterLink>
            <FooterLink to="/pricing">API Access</FooterLink>
            <FooterLink to="/pricing">Batch Analysis</FooterLink>
          </FooterLinks>
        </FooterSection>
        
        <FooterSection>
          <FooterHeading>Resources</FooterHeading>
          <FooterLinks>
            <FooterLink to="/docs">Documentation</FooterLink>
            <FooterLink to="/api-docs">API Reference</FooterLink>
            <FooterLink to="/support">Support Center</FooterLink>
            <FooterLink to="/security">Security Guide</FooterLink>
          </FooterLinks>
        </FooterSection>
        
        <FooterSection>
          <FooterHeading>Company</FooterHeading>
          <FooterLinks>
            <FooterLink to="/about">About Us</FooterLink>
            <FooterLink to="/privacy">Privacy Policy</FooterLink>
            <FooterLink to="/terms">Terms of Service</FooterLink>
            <FooterLink to="/contact">Contact</FooterLink>
          </FooterLinks>
        </FooterSection>
      </FooterContent>
      
      <BottomBar>
        <Copyright>© {new Date().getFullYear()} TRXGuardian. All rights reserved.</Copyright>
        
        <PoweredBy>
          Powered by <PoweredByLink href="https://www.nowpayments.io/" target="_blank" rel="noopener noreferrer">NowPayments</PoweredByLink>
        </PoweredBy>
        
        <SocialLinks>
          <SocialLink href="#" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <i className="fab fa-github"></i>
          </SocialLink>
          <SocialLink href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <i className="fab fa-twitter"></i>
          </SocialLink>
          <SocialLink href="#" target="_blank" rel="noopener noreferrer" aria-label="Email">
            <i className="fas fa-envelope"></i>
          </SocialLink>
        </SocialLinks>
      </BottomBar>
    </FooterContainer>
  );
};

export default Footer;