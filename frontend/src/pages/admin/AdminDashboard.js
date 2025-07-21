import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useUser } from '../../context/UserContext';
import { isAdminWallet, getAdminDashboardStats } from '../../services/api';
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

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background-color: rgba(30, 40, 60, 0.6);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PerformanceMetrics = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const MetricItem = styled.div``;

const MetricHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
`;

const MetricLabel = styled.div`
  color: var(--color-text);
`;

const MetricValue = styled.div`
  color: var(--color-text-secondary);
`;

const ProgressBar = styled.div`
  height: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
`;

const Progress = styled.div`
  height: 100%;
  background-color: var(--color-primary);
  width: ${props => props.value}%;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  
  &:last-child {
    border-bottom: none;
  }
`;

const ActivityIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${props => {
    switch(props.risk) {
      case 'high': return 'rgba(255, 61, 0, 0.2)';
      case 'medium': return 'rgba(255, 214, 0, 0.2)';
      case 'low': return 'rgba(0, 200, 83, 0.2)';
      default: return 'rgba(0, 120, 255, 0.2)';
    }
  }};
  color: ${props => {
    switch(props.risk) {
      case 'high': return 'var(--color-danger)';
      case 'medium': return 'var(--color-warning)';
      case 'low': return 'var(--color-success)';
      default: return 'var(--color-primary)';
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityWallet = styled.div`
  font-weight: 500;
`;

const ActivityMeta = styled.div`
  display: flex;
  justify-content: space-between;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const SystemStatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatusIndicator = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.active ? 'var(--color-success)' : 'var(--color-danger)'};
`;

const StatusContent = styled.div``;

const StatusLabel = styled.div`
  font-weight: 500;
`;

const StatusValue = styled.div`
  color: var(--color-text-secondary);
  font-size: 0.875rem;
`;

const AdminDashboard = () => {
  const { wallet } = useUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Verificar si es wallet de administrador
  if (!wallet || !isAdminWallet(wallet)) {
    return <Navigate to="/" replace />;
  }
  
  // Cargar estadísticas del dashboard
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // En un entorno real, esto haría una llamada a la API
        // const data = await getAdminDashboardStats(wallet);
        
        // Datos de ejemplo para la demostración
        const data = {
          totalUsers: 1247,
          usersTrend: 12,
          activeUsers: 89,
          totalScans: 15830,
          scansTrend: 15,
          revenue: 12450,
          revenueTrend: 7.5,
          performance: {
            successRate: 99.2,
            responseTime: 1.2,
            apiUptime: 99.9
          },
          recentActivity: [
            { wallet: 'TMuME...J27h', risk: 'low', time: '2 min ago' },
            { wallet: 'TLye...XRLJ9', risk: 'payment', amount: '$19.99', time: '8 min ago' },
            { wallet: 'TABc...123X', risk: 'high', time: '8 min ago' },
            { wallet: 'TDM...456Y', risk: 'medium', time: '12 min ago' },
            { wallet: 'TON...789Z', risk: 'medium', time: '15 min ago' }
          ],
          systemStatus: {
            apiService: true,
            database: true,
            payments: true
          }
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
      
      <SectionGrid>
        <Section>
          <SectionHeader>
            <SectionTitle>
              <span>📊</span>
              <span>System Performance</span>
            </SectionTitle>
          </SectionHeader>
          
          <PerformanceMetrics>
            <MetricItem>
              <MetricHeader>
                <MetricLabel>Success Rate</MetricLabel>
                <MetricValue>{stats.performance.successRate}%</MetricValue>
              </MetricHeader>
              <ProgressBar>
                <Progress value={stats.performance.successRate} />
              </ProgressBar>
            </MetricItem>
            
            <MetricItem>
              <MetricHeader>
                <MetricLabel>Avg Response Time</MetricLabel>
                <MetricValue>{stats.performance.responseTime}s</MetricValue>
              </MetricHeader>
              <ProgressBar>
                <Progress value={(stats.performance.responseTime / 5) * 100} />
              </ProgressBar>
            </MetricItem>
            
            <MetricItem>
              <MetricHeader>
                <MetricLabel>API Uptime</MetricLabel>
                <MetricValue>{stats.performance.apiUptime}%</MetricValue>
              </MetricHeader>
              <ProgressBar>
                <Progress value={stats.performance.apiUptime} />
              </ProgressBar>
            </MetricItem>
          </PerformanceMetrics>
        </Section>
        
        <Section>
          <SectionHeader>
            <SectionTitle>
              <span>🔔</span>
              <span>Recent Activity</span>
            </SectionTitle>
          </SectionHeader>
          
          <ActivityList>
            {stats.recentActivity.map((activity, index) => (
              <ActivityItem key={index}>
                <ActivityIcon risk={activity.risk}>
                  {activity.risk === 'payment' ? '$' : '👤'}
                </ActivityIcon>
                <ActivityContent>
                  <ActivityWallet>{activity.wallet}</ActivityWallet>
                  <ActivityMeta>
                    <span>{activity.risk === 'payment' ? activity.amount : activity.risk}</span>
                    <span>{activity.time}</span>
                  </ActivityMeta>
                </ActivityContent>
              </ActivityItem>
            ))}
          </ActivityList>
        </Section>
      </SectionGrid>
      
      <Section>
        <SectionHeader>
          <SectionTitle>
            <span>🖥️</span>
            <span>System Status</span>
          </SectionTitle>
        </SectionHeader>
        
        <SystemStatusGrid>
          <StatusItem>
            <StatusIndicator active={stats.systemStatus.apiService} />
            <StatusContent>
              <StatusLabel>API Service</StatusLabel>
              <StatusValue>Operational</StatusValue>
            </StatusContent>
          </StatusItem>
          
          <StatusItem>
            <StatusIndicator active={stats.systemStatus.database} />
            <StatusContent>
              <StatusLabel>Database</StatusLabel>
              <StatusValue>Operational</StatusValue>
            </StatusContent>
          </StatusItem>
          
          <StatusItem>
            <StatusIndicator active={stats.systemStatus.payments} />
            <StatusContent>
              <StatusLabel>Payments</StatusLabel>
              <StatusValue>Operational</StatusValue>
            </StatusContent>
          </StatusItem>
        </SystemStatusGrid>
      </Section>
    </DashboardContainer>
  );
};

export default AdminDashboard;