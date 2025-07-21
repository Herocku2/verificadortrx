import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useUser } from '../context/UserContext';
import { isAdminWallet } from '../services/api';

const NavbarContainer = styled.nav`
  background-color: rgba(10, 25, 41, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const NavContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-text);
  font-weight: 700;
  font-size: 1.5rem;
  text-decoration: none;
`;

const LogoIcon = styled.div`
  color: var(--color-primary);
  font-size: 1.8rem;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
`;

const NavLink = styled(Link)`
  color: ${props => props.active ? 'var(--color-primary)' : 'var(--color-text)'};
  text-decoration: none;
  font-weight: 500;
  position: relative;
  padding: 0.5rem 0;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: ${props => props.active ? '100%' : '0'};
    height: 2px;
    background-color: var(--color-primary);
    transition: width 0.3s ease;
  }
  
  &:hover::after {
    width: 100%;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TokenBadge = styled.div`
  background-color: rgba(0, 120, 255, 0.2);
  border: 1px solid var(--color-primary);
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const TokenIcon = styled.span`
  color: var(--color-primary);
`;

const WalletBadge = styled.div`
  background-color: rgba(30, 40, 60, 0.8);
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 5px;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PlanBadge = styled.div`
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
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
`;

const Navbar = () => {
  const location = useLocation();
  const { user, wallet } = useUser();
  const isAdmin = wallet && isAdminWallet(wallet);
  
  return (
    <NavbarContainer>
      <NavContent>
        <Logo to="/">
          <LogoIcon>🛡️</LogoIcon>
          TRXGuardian
        </Logo>
        
        <NavLinks>
          <NavLink to="/" active={location.pathname === '/' ? 'true' : undefined}>
            Home
          </NavLink>
          <NavLink to="/scanner" active={location.pathname === '/scanner' ? 'true' : undefined}>
            Scanner
          </NavLink>
          <NavLink to="/pricing" active={location.pathname === '/pricing' ? 'true' : undefined}>
            Pricing
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" active={location.pathname.startsWith('/admin') ? 'true' : undefined}>
              Admin
            </NavLink>
          )}
        </NavLinks>
        
        <UserSection>
          {user && wallet && (
            <>
              <TokenBadge>
                <TokenIcon>🔹</TokenIcon>
                {user.tokens_disponibles === Infinity ? '∞' : user.tokens_disponibles} tokens
              </TokenBadge>
              <PlanBadge plan={user.plan}>
                {user.plan}
              </PlanBadge>
              <WalletBadge>
                {wallet.substring(0, 6)}...{wallet.substring(wallet.length - 4)}
              </WalletBadge>
            </>
          )}
        </UserSection>
      </NavContent>
    </NavbarContainer>
  );
};

export default Navbar;