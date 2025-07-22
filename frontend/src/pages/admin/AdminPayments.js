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
        // En un entorno real, esto haría una llamada a la API
        // const data = await getAdminPayments(wallet);
        
        // Datos de ejemplo para la demostración
        const data = [
          { wallet: 'TMuKGY...31rW9', plan: 'Premium', amount: '$19.99 USD', status: 'completed', transactionId: 'tx_abc123', paymentMethod: 'TRX', date: '2024-01-20' },
          { wallet: 'TLyqYv...M3ZYH', plan: 'Basic', amount: '$9.99 USD', status: 'completed', transactionId: 'tx_def456', paymentMethod: 'USDT', date: '2024-01-19' },
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
          if (payment.status === 'completed' && new Date(payment.date).getMonth() === new Date().getMonth()) {
            const amount = parseFloat(payment.amount.replace('$', '').split(' ')[0]);
            return sum + amount;
          }
          return sum;
        }, 0);
        
        const totalTrans = data.length;
        
        const successRt = data.length > 0
          ? (data.filter(p => p.status === 'completed').length / data.length) * 100
          : 0;
          
        setStats({
          totalRevenue: totalRev,
          monthlyRevenue: monthlyRev,
          totalTransactions: totalTrans,
          successRate: successRt
        });
      } catch (err) {
        console.error('Error al cargar pagos:', err);
        setError('No se pudieron cargar los pagos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPayments();
  }, [wallet]);
  
  // Filtrar pagos
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.wallet.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  // Paginación
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);
  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const handleExportCSV = () => {
    // En un entorno real, esto generaría un archivo CSV para descargar
    alert('Exportando datos a CSV...');
  };
  
  if (loading) {
    return <div className="container">Cargando pagos...</div>;
  }
  
  if (error) {
    return <div className="container">{error}</div>;
  }
  
  return (
    <PaymentsContainer className="container">
      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
        <div>
          <AdminSidebar />
        </div>
        <div>
          <PaymentsHeader>
            <PaymentsTitle>Payment Management</PaymentsTitle>
            <ExportButton onClick={handleExportCSV}>
              <span>Export CSV</span>
            </ExportButton>
          </PaymentsHeader>
          
          <StatsGrid>
            <StatCard>
              <StatHeader>
                <span>Total Revenue</span>
                <StatIcon color="#00BFA5">$</StatIcon>
              </StatHeader>
              <StatValue>${stats.totalRevenue.toFixed(2)}</StatValue>
              <StatSubtext>All time earnings</StatSubtext>
            </StatCard>
            
            <StatCard>
              <StatHeader>
                <span>Monthly Revenue</span>
                <StatIcon color="#0078FF">$</StatIcon>
              </StatHeader>
              <StatValue>${stats.monthlyRevenue.toFixed(2)}</StatValue>
              <StatSubtext>This month</StatSubtext>
            </StatCard>
            
            <StatCard>
              <StatHeader>
                <span>Total Transactions</span>
                <StatIcon color="#651FFF">4</StatIcon>
              </StatHeader>
              <StatValue>{stats.totalTransactions}</StatValue>
              <StatSubtext>Payment attempts</StatSubtext>
            </StatCard>
            
            <StatCard>
              <StatHeader>
                <span>Success Rate</span>
                <StatIcon color="#00C853">📈</StatIcon>
              </StatHeader>
              <StatValue>{stats.successRate.toFixed(1)}%</StatValue>
              <StatSubtext>Successful payments</StatSubtext>
            </StatCard>
          </StatsGrid>
          
          <SearchBar>
            <SearchInput
              type="text"
              placeholder="Search by wallet, transaction ID, or plan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon>🔍</SearchIcon>
          </SearchBar>
          
          <FiltersContainer>
            <FilterSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All Status">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </FilterSelect>
          </FiltersContainer>
          
          <PaymentsTable>
            <TableHeader>
              <HeaderCell>Wallet Address</HeaderCell>
              <HeaderCell>Plan</HeaderCell>
              <HeaderCell>Amount</HeaderCell>
              <HeaderCell>Status</HeaderCell>
              <HeaderCell>Transaction ID</HeaderCell>
              <HeaderCell>Payment Method</HeaderCell>
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
              Showing {indexOfFirstPayment + 1} to {Math.min(indexOfLastPayment, filteredPayments.length)} of {filteredPayments.length} payments
            </PageInfo>
            
            <PageControls>
              <PageButton
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </PageButton>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                <PageButton
                  key={pageNumber}
                  active={pageNumber === currentPage}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </PageButton>
              ))}
              
              <PageButton
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </PageButton>
            </PageControls>
          </Pagination>
        </div>
      </div>
    </PaymentsContainer>
  );
};

export default AdminPayments;