import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  background-color: rgba(20, 30, 50, 0.8);
  width: 250px;
  min-height: calc(100vh - 70px);
  padding: 1.5rem 0;
  position: sticky;
  top: 70px;
  
  @media (max-width: 768px) {
    width: 100%;
    min-height: auto;
    position: relative;
    top: 0;
  }
`;

const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: var(--color-text);
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  &.active {
    background-color: rgba(0, 120, 255, 0.1);
    border-left-color: var(--color-primary);
    color: var(--color-primary);
  }
`;

const NavIcon = styled.div`
  font-size: 1.25rem;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NavText = styled.div`
  font-weight: 500;
`;

const SectionTitle = styled.div`
  padding: 0.75rem 1.5rem;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 1rem;
  
  &:first-child {
    margin-top: 0;
  }
`;

const AdminSidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { 
      section: 'General',
      items: [
        { path: '/admin', icon: '📊', text: 'Dashboard' }
      ]
    },
    {
      section: 'Management',
      items: [
        { path: '/admin/users', icon: '👥', text: 'Users' },
        { path: '/admin/resellers', icon: '🤝', text: 'Resellers' },
        { path: '/admin/payments', icon: '💰', text: 'Payments' }
      ]
    },
    {
      section: 'Configuration',
      items: [
        { path: '/admin/settings', icon: '⚙️', text: 'Settings' }
      ]
    }
  ];
  
  return (
    <SidebarContainer>
      <SidebarNav>
        {navItems.map((section, sectionIndex) => (
          <React.Fragment key={sectionIndex}>
            <SectionTitle>{section.section}</SectionTitle>
            {section.items.map((item, itemIndex) => (
              <NavItem 
                key={`${sectionIndex}-${itemIndex}`} 
                to={item.path}
                className={({ isActive }) => isActive ? 'active' : ''}
                end={item.path === '/admin'}
              >
                <NavIcon>{item.icon}</NavIcon>
                <NavText>{item.text}</NavText>
              </NavItem>
            ))}
          </React.Fragment>
        ))}
      </SidebarNav>
    </SidebarContainer>
  );
};

export default AdminSidebar;