import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useUser } from '../../context/UserContext';
import { isAdminWallet } from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';

const DashboardContainer = styled.div`
  padding: 2rem 0;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const DashboardTitle = styled.h1`
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background-color: rgba(30, 40, 60, 0.6);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
`;

const StatIcon = styled.div`
  color: ${props => props.color || 'var(--color-primary)'};
  font-size: 1.25rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const StatTrend = styled.div`
  font-size: 0.875rem;
  color: ${props => props.positive ? 'var(--color-success)' : 'var(--color-danger)'};
`;

const AdminDashboard = () => {
  const { wallet } = useUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Cargar estadísticas del dashboard
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Datos de ejemplo para la demostración
        const data = {
          totalUsers: 1247,
          usersTrend: 12,
          activeUsers: 89,
          totalScans: 15830,
          scansTrend: 15,
          revenue: 12450,
          revenueTrend: 7.5
        };
        
        setStats(data);
      } catch (err) {
        console.error('Error al cargar estadísticas:', err);
        setError('No se pudieron cargar las estadísticas del dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [wallet]);
  
  // Verificar si es wallet de administrador
  if (!wallet || !isAdminWallet(wallet)) {
    return <Navigate to="/" replace />;
  }
  
  if (loading) {
    return <div className="container">Cargando estadísticas...</div>;
  }
  
  if (error) {
    return <div className="container">{error}</div>;
  }
  
  return (
    <DashboardContainer className="container">
      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
        <div>
          <AdminSidebar />
        </div>
        <div>
          <DashboardHeader>
            <DashboardTitle>Admin Dashboard</DashboardTitle>
            <SystemStatus>
              <span>●</span>
              <span>System Online</span>
            </SystemStatus>
          </DashboardHeader>
      
          <StatsGrid>
            <StatCard>
              <StatHeader>
                <span>Total Users</span>
                <StatIcon color="#0078FF">👥</StatIcon>
              </StatHeader>
              <StatValue>{stats.totalUsers.toLocaleString()}</StatValue>
              <StatTrend positive={true}>+{stats.usersTrend}% from last month</StatTrend>
            </StatCard>
            
            <StatCard>
              <StatHeader>
                <span>Active Users</span>
                <StatIcon color="#00C853">👤</StatIcon>
              </StatHeader>
              <StatValue>{stats.activeUsers}</StatValue>
              <StatTrend positive={true}>Currently active</StatTrend>
            </StatCard>
            
            <StatCard>
              <StatHeader>
                <span>Total Scans</span>
                <StatIcon color="#651FFF">🔍</StatIcon>
              </StatHeader>
              <StatValue>{stats.totalScans.toLocaleString()}</StatValue>
              <StatTrend positive={true}>+{stats.scansTrend}% from last week</StatTrend>
            </StatCard>
        
            <StatCard>
              <StatHeader>
                <span>Revenue</span>
                <StatIcon color="#00BFA5">$</StatIcon>
              </StatHeader>
              <StatValue>${stats.revenue.toLocaleString()}</StatValue>
              <StatTrend positive={true}>+{stats.revenueTrend}% from last month</StatTrend>
            </StatCard>
          </StatsGrid>
        </div>
      </div>
    </DashboardContainer>
  );
};

export default AdminDashboard;