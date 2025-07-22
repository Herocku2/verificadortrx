import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useUser } from '../../context/UserContext';
import { isAdminWallet, getAdminUsers } from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';

const UsersContainer = styled.div`
  padding: 2rem 0;
`;

const UsersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const UsersTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
`;

const TotalUsers = styled.div`
  background-color: rgba(0, 120, 255, 0.2);
  color: var(--color-primary);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

const UsersTable = styled.div`
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
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const TokensCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TokenIcon = styled.span`
  color: var(--color-primary);
`;

const StatusBadge = styled.div`
  background-color: ${props => props.active ? 'rgba(0, 200, 83, 0.2)' : 'rgba(255, 61, 0, 0.2)'};
  color: ${props => props.active ? 'var(--color-success)' : 'var(--color-danger)'};
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const ActionsMenu = styled.div`
  position: relative;
  cursor: pointer;
`;

const ActionsDots = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
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

const AdminUsers = () => {
  const { wallet } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('All Plans');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Verificar si es wallet de administrador
  useEffect(() => {
    if (wallet && isAdminWallet(wallet)) {
      setIsAdmin(true);
    }
  }, [wallet]);
  
  // Cargar usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // En un entorno real, esto haría una llamada a la API
        // const data = await getAdminUsers(wallet);
        
        // Datos de ejemplo para la demostración
        const data = [
          { wallet: 'TMuKGY...31rW9', plan: 'Premium', tokens: 45, totalScans: 234, joinDate: '2024-01-15', status: 'active' },
          { wallet: 'TLyqYv...M3ZYH', plan: 'Basic', tokens: 12, totalScans: 89, joinDate: '2024-01-10', status: 'active' },
          { wallet: 'TAbCbc...234567', plan: 'Free', tokens: 2, totalScans: 3, joinDate: '2024-01-18', status: 'active' },
          { wallet: 'TXyzAb...212345', plan: 'Unlimited', tokens: Infinity, totalScans: 1567, joinDate: '2023-12-20', status: 'active' },
          { wallet: 'TPQRst...567890', plan: 'Basic', tokens: 8, totalScans: 42, joinDate: '2024-01-05', status: 'active' },
          { wallet: 'TUVWxy...123456', plan: 'Intermedio', tokens: 65, totalScans: 120, joinDate: '2024-01-12', status: 'active' },
          { wallet: 'TGHIjk...789012', plan: 'Free', tokens: 1, totalScans: 2, joinDate: '2024-01-20', status: 'active' },
          { wallet: 'TLMNop...345678', plan: 'Premium', tokens: 38, totalScans: 187, joinDate: '2023-12-28', status: 'active' },
          { wallet: 'TJF7Br...s37hm', plan: 'Admin', tokens: Infinity, totalScans: 9999, joinDate: '2023-12-01', status: 'active' }
        ];
        
        setUsers(data);
      } catch (err) {
        console.error('Error al cargar usuarios:', err);
        setError('No se pudieron cargar los usuarios');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [wallet]);
  
  // Redirigir si no es administrador
  if (!isAdmin && !loading) {
    return <Navigate to="/" replace />;
  }
  
  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.wallet.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === 'All Plans' || user.plan === planFilter;
    return matchesSearch && matchesPlan;
  });
  
  // Paginación
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  if (loading) {
    return <div className="container">Cargando usuarios...</div>;
  }
  
  return (
    <div className="container" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
      <div>
        <AdminSidebar />
      </div>
      <UsersContainer>
        <UsersHeader>
          <UsersTitle>User Management</UsersTitle>
          <TotalUsers>
            <span>👥</span>
            <span>{users.length} Total Users</span>
          </TotalUsers>
        </UsersHeader>
        
        <SearchBar>
          <SearchInput
            type="text"
            placeholder="Search by wallet address or plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon>🔍</SearchIcon>
        </SearchBar>
        
        <FiltersContainer>
          <FilterSelect
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
          >
            <option value="All Plans">All Plans</option>
            <option value="Free">Free</option>
            <option value="Basic">Basic</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Premium">Premium</option>
            <option value="Unlimited">Unlimited</option>
          </FilterSelect>
        </FiltersContainer>
        
        <UsersTable>
          <TableHeader>
            <HeaderCell>Wallet Address</HeaderCell>
            <HeaderCell>Plan</HeaderCell>
            <HeaderCell>Tokens</HeaderCell>
            <HeaderCell>Total Scans</HeaderCell>
            <HeaderCell>Join Date</HeaderCell>
            <HeaderCell>Status</HeaderCell>
          </TableHeader>
          
          <TableBody>
            {currentUsers.map((user, index) => (
              <TableRow key={index}>
                <Cell>
                  <WalletAddress>{user.wallet}</WalletAddress>
                </Cell>
                <Cell>
                  <PlanBadge plan={user.plan}>{user.plan}</PlanBadge>
                </Cell>
                <TokensCell>
                  <TokenIcon>🔹</TokenIcon>
                  {user.tokens === Infinity ? '∞' : user.tokens}
                </TokensCell>
                <Cell>{user.totalScans}</Cell>
                <Cell>{new Date(user.joinDate).toLocaleDateString()}</Cell>
                <Cell>
                  <StatusBadge active={user.status === 'active'}>
                    {user.status}
                  </StatusBadge>
                </Cell>
              </TableRow>
            ))}
          </TableBody>
        </UsersTable>
        
        <Pagination>
          <PageInfo>
            Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
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
      </UsersContainer>
    </div>
  );
};

export default AdminUsers;