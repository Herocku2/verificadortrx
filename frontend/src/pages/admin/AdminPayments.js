import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useUser } from '../../context/UserContext';
import { isAdminWallet, getAdminPayments } from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';

const PaymentsContainer = styled.div`
  padding: 2rem 0;
`;

const PaymentsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const PaymentsTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
`;

const ExportButton = styled.button`
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: var(--color-secondary);
  }
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

const StatSubtext = styled.div`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
`;

const SearchBar = styled.div`
  position: relative;
  margin-bottom: 2rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1.5rem;
  background-color: rgba(30, 40, 60, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius);
  color: var(--color-text);
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(0, 120, 255, 0.2);
  }
  
  &::placeholder {
    color: var(--color-text-secondary);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
`;

const FiltersContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const FilterSelect = styled.select`
  padding: 0.5rem 1rem;
  background-color: rgba(30, 40, 60, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius);
  color: var(--color-text);
  font-size: 0.875rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
`;

const PaymentsTable = styled.div`
  background-color: rgba(30, 40, 60, 0.6);
  border-radius: var(--border-radius);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  padding: 1rem 1.5rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  
  @media (max-width: 768px) {
    grid-template-columns: 2fr 1fr 1fr;
  }
`;

const HeaderCell = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
`;

const TableBody = styled.div``;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 2fr 1fr 1fr;
    padding: 1rem;
    gap: 0.5rem;
  }
`;

const Cell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const WalletAddress = styled.div`
  font-weight: 500;
`;

const PlanBadge = styled.div`
  background-color: ${props => {
    switch(props.plan) {
      case 'Basic': return 'rgba(0, 200, 83, 0.2)';
      case 'Intermedio': return 'rgba(0, 120, 255, 0.2)';
      case 'Premium': return 'rgba(156, 39, 176, 0.2)';
      case 'Unlimited': return 'rgba(156, 39, 176, 0.2)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  color: ${props => {
    switch(props.plan) {
      case 'Basic': return 'var(--color-success)';
      case 'Intermedio': return 'var(--color-primary)';
      case 'Premium': return '#9c27b0';
      case 'Unlimited': return '#9c27b0';
      default: return 'var(--color-text-secondary)';
    }
  }};
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const StatusBadge = styled.div`
  background-color: ${props => {
    switch(props.status) {
      case 'completed': return 'rgba(0, 200, 83, 0.2)';
      case 'pending': return 'rgba(255, 214, 0, 0.2)';
      case 'failed': return 'rgba(255, 61, 0, 0.2)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'completed': return 'var(--color-success)';
      case 'pending': return 'var(--color-warning)';
      case 'failed': return 'var(--color-danger)';
      default: return 'var(--color-text-secondary)';
    }
  }};
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
`;

const PageInfo = styled.div`
  color: var(--color-text-secondary);
  font-size: 0.875rem;
`;

const PageControls = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PageButton = styled.button`
  background-color: ${props => props.active ? 'var(--color-primary)' : 'rgba(30, 40, 60, 0.6)'};
  color: ${props => props.active ? 'white' : 'var(--color-text)'};
  border: 1px solid ${props => props.active ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: var(--border-radius);
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  &:hover:not(:disabled) {
    background-color: ${props => props.active ? 'var(--color-secondary)' : 'rgba(255, 255, 255, 0.05)'};
  }
`;

const AdminPayments = () => {
  const { wallet } = useUser();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 10;
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalTransactions: 0,
    successRate: 0
  });
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Verificar si es wallet de administrador
  useEffect(() => {
    if (wallet && isAdminWallet(wallet)) {
      setIsAdmin(true);
    }
  }, [wallet]);
  
  // Cargar pagos
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        
        // Datos de ejemplo para la demostración
        const data = [
          { wallet: 'TMuKGY...31rW9', plan: 'Premium', amount: '$19.99 USD', status: 'completed', transactionId: 'tx_abc123', paymentMethod: 'USDT', date: '2024-01-25' },
          { wallet: 'TJkLmN...45qR8', plan: 'Basic', amount: '$9.99 USD', status: 'completed', transactionId: 'tx_def456', paymentMethod: 'TRX', date: '2024-01-22' },
          { wallet: 'TAbCbc...234567', plan: 'Premium', amount: '$19.99 USD', status: 'pending', transactionId: 'tx_ghi789', paymentMethod: 'BTC', date: '2024-01-20' },
          { wallet: 'TXyzAb...212345', plan: 'Unlimited', amount: '$49.99 USD', status: 'completed', transactionId: 'tx_jkl812', paymentMethod: 'ETH', date: '2024-01-18' }
        ];
        
        setPayments(data);
        
        // Calcular estadísticas
        const totalRev = data.reduce((sum, payment) => {
          if (payment.status === 'completed') {
            const amount = parseFloat(payment.amount.replace('$', '').split(' ')[0]);
            return sum + amount;
          }
          return sum;
        }, 0);
        
        const monthlyRev = data.reduce((sum, payment) => {
          if (payment.status === 'completed') {
            const amount = parseFloat(payment.amount.replace('$', '').split(' ')[0]);
            return sum + amount;
          }
          return sum;
        }, 0);
        
        const totalTransactions = data.length;
        
        const successRate = data.length > 0 
          ? (data.filter(p => p.status === 'completed').length / data.length) * 100
          : 0;
          
        setStats({
          totalRevenue: totalRev,
          monthlyRevenue: monthlyRev,
          totalTransactions: totalTransactions,
          successRate: successRate.toFixed(0)
        });
      } catch (err) {
        console.error('Error al cargar pagos:', err);
        setError('No se pudieron cargar los pagos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPayments();
  }, []);
  
  // Redirigir si no es administrador
  if (!isAdmin && !loading) {
    return <Navigate to="/" />;
  }
  
  // Filtrar pagos
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.wallet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'All Status' || payment.status === statusFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });
  
  // Paginación
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);
  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);
  
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  if (loading) {
    return <div>Cargando...</div>;
  }
  
  return (
    <div style={{ display: 'flex' }}>
      <div>
        <AdminSidebar />
      </div>
      <PaymentsContainer>
        <PaymentsHeader>
          <PaymentsTitle>Pagos</PaymentsTitle>
          <ExportButton onClick={() => console.log('Export CSV')}>
            <span>Exportar CSV</span>
          </ExportButton>
        </PaymentsHeader>
        
        <StatsGrid>
          <StatCard>
            <StatHeader>
              <span>Total de Ingresos</span>
              <StatIcon>💰</StatIcon>
            </StatHeader>
            <StatValue>${stats.totalRevenue}</StatValue>
            <StatSubtext>Ganancias totales</StatSubtext>
          </StatCard>
          
          <StatCard>
            <StatHeader>
              <span>Ingresos Mensuales</span>
              <StatIcon>📅</StatIcon>
            </StatHeader>
            <StatValue>${stats.monthlyRevenue}</StatValue>
            <StatSubtext>Este mes</StatSubtext>
          </StatCard>
          
          <StatCard>
            <StatHeader>
              <span>Transacciones</span>
              <StatIcon>🔄</StatIcon>
            </StatHeader>
            <StatValue>{stats.totalTransactions}</StatValue>
            <StatSubtext>Intentos de pago</StatSubtext>
          </StatCard>
          
          <StatCard>
            <StatHeader>
              <span>Tasa de Éxito</span>
              <StatIcon>✅</StatIcon>
            </StatHeader>
            <StatValue>{stats.successRate}%</StatValue>
            <StatSubtext>Pagos exitosos</StatSubtext>
          </StatCard>
        </StatsGrid>
        
        <SearchBar>
          <SearchInput
            type="text"
            placeholder="Buscar por wallet o ID de transacción..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <SearchIcon>🔍</SearchIcon>
        </SearchBar>
        
        <FiltersContainer>
          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All Status">Todos los estados</option>
            <option value="completed">Completados</option>
            <option value="pending">Pendientes</option>
            <option value="failed">Fallidos</option>
          </FilterSelect>
        </FiltersContainer>
        
        <PaymentsTable>
          <TableHeader>
            <HeaderCell>Wallet</HeaderCell>
            <HeaderCell>Plan</HeaderCell>
            <HeaderCell>Monto</HeaderCell>
            <HeaderCell>Estado</HeaderCell>
            <HeaderCell>ID de Transacción</HeaderCell>
            <HeaderCell>Método de Pago</HeaderCell>
          </TableHeader>
          
          <TableBody>
            {currentPayments.map((payment, index) => (
              <TableRow key={index}>
                <Cell>
                  <WalletAddress>{payment.wallet}</WalletAddress>
                </Cell>
                <Cell>
                  <PlanBadge plan={payment.plan}>{payment.plan}</PlanBadge>
                </Cell>
                <Cell>{payment.amount}</Cell>
                <Cell>
                  <StatusBadge status={payment.status}>
                    {payment.status}
                  </StatusBadge>
                </Cell>
                <Cell>{payment.transactionId}</Cell>
                <Cell>{payment.paymentMethod}</Cell>
              </TableRow>
            ))}
          </TableBody>
        </PaymentsTable>
        
        <Pagination>
          <PageInfo>
            Mostrando {indexOfFirstPayment + 1} - {Math.min(indexOfLastPayment, filteredPayments.length)} de {filteredPayments.length} pagos
          </PageInfo>
          
          <PageControls>
            <PageButton
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </PageButton>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
              <PageButton
                key={pageNumber}
                active={pageNumber === currentPage}
                onClick={() => paginate(pageNumber)}
              >
                {pageNumber}
              </PageButton>
            ))}
            
            <PageButton
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </PageButton>
          </PageControls>
        </Pagination>
      </PaymentsContainer>
    </div>
  );
};

export default AdminPayments;