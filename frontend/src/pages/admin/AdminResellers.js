import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useUser } from '../../context/UserContext';
import { isAdminWallet } from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';

const PageContainer = styled.div`
  display: flex;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ContentContainer = styled.div`
  flex: 1;
  padding: 0 2rem;
`;

const ResellersContainer = styled.div`
  padding: 2rem 0;
`;

const ResellersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const ResellersTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
`;

const AddButton = styled.button`
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

const ResellersTable = styled.div`
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

const StatusBadge = styled.div`
  background-color: ${props => props.active ? 'rgba(0, 200, 83, 0.2)' : 'rgba(255, 61, 0, 0.2)'};
  color: ${props => props.active ? 'var(--color-success)' : 'var(--color-danger)'};
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

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-secondary);
`;

const AdminResellers = () => {
  const { wallet } = useUser();
  const [resellers, setResellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const resellersPerPage = 10;
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Verificar si es wallet de administrador
    if (wallet && isAdminWallet(wallet)) {
      setIsAdmin(true);
    }
  }, [wallet]);
  
  // Cargar revendedores
  useEffect(() => {
    const fetchResellers = async () => {
      try {
        setLoading(true);
        
        // Datos de ejemplo para la demostración
        const data = [
          { id: 1, wallet: 'TMuKGY...31rW9', name: 'Crypto Solutions', commission: '10%', clients: 15, earnings: '$250.50', status: 'active', joinDate: '2024-01-15' },
          { id: 2, wallet: 'TLyqYv...M3ZYH', name: 'Blockchain Partners', commission: '8%', clients: 8, earnings: '$120.75', status: 'active', joinDate: '2024-01-10' },
          { id: 3, wallet: 'TAbCbc...234567', name: 'TRX Experts', commission: '12%', clients: 22, earnings: '$345.20', status: 'active', joinDate: '2024-01-18' },
          { id: 4, wallet: 'TXyzAb...212345', name: 'Crypto Advisors', commission: '9%', clients: 5, earnings: '$75.30', status: 'inactive', joinDate: '2023-12-20' }
        ];
        
        setResellers(data);
      } catch (err) {
        console.error('Error al cargar revendedores:', err);
        setError('No se pudieron cargar los revendedores');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResellers();
  }, []);
  
  // Redirigir si no es administrador
  if (!isAdmin && !loading) {
    return <Navigate to="/" replace />;
  }
  
  // Filtrar revendedores
  const filteredResellers = resellers.filter(reseller => {
    return reseller.wallet.toLowerCase().includes(searchTerm.toLowerCase()) ||
           reseller.name.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Paginación
  const indexOfLastReseller = currentPage * resellersPerPage;
  const indexOfFirstReseller = indexOfLastReseller - resellersPerPage;
  const currentResellers = filteredResellers.slice(indexOfFirstReseller, indexOfLastReseller);
  const totalPages = Math.ceil(filteredResellers.length / resellersPerPage);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  if (loading) {
    return <div className="container">Cargando revendedores...</div>;
  }
  
  return (
    <PageContainer>
      <AdminSidebar />
      
      <ContentContainer>
        <ResellersContainer>
          <ResellersHeader>
            <ResellersTitle>Resellers Management</ResellersTitle>
            <AddButton>
              <span>+</span>
              <span>Add Reseller</span>
            </AddButton>
          </ResellersHeader>
          
          <SearchBar>
            <SearchInput
              type="text"
              placeholder="Search by wallet or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon>🔍</SearchIcon>
          </SearchBar>
          
          {error ? (
            <EmptyState>{error}</EmptyState>
          ) : filteredResellers.length === 0 ? (
            <EmptyState>No resellers found</EmptyState>
          ) : (
            <>
              <ResellersTable>
                <TableHeader>
                  <HeaderCell>Wallet / Name</HeaderCell>
                  <HeaderCell>Commission</HeaderCell>
                  <HeaderCell>Clients</HeaderCell>
                  <HeaderCell>Earnings</HeaderCell>
                  <HeaderCell>Join Date</HeaderCell>
                  <HeaderCell>Status</HeaderCell>
                </TableHeader>
                
                <TableBody>
                  {currentResellers.map((reseller) => (
                    <TableRow key={reseller.id}>
                      <Cell>
                        <div>
                          <WalletAddress>{reseller.wallet}</WalletAddress>
                          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                            {reseller.name}
                          </div>
                        </div>
                      </Cell>
                      <Cell>{reseller.commission}</Cell>
                      <Cell>{reseller.clients}</Cell>
                      <Cell>{reseller.earnings}</Cell>
                      <Cell>{new Date(reseller.joinDate).toLocaleDateString()}</Cell>
                      <Cell>
                        <StatusBadge active={reseller.status === 'active'}>
                          {reseller.status}
                        </StatusBadge>
                      </Cell>
                    </TableRow>
                  ))}
                </TableBody>
              </ResellersTable>
              
              <Pagination>
                <PageInfo>
                  Showing {indexOfFirstReseller + 1} to {Math.min(indexOfLastReseller, filteredResellers.length)} of {filteredResellers.length} resellers
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
            </>
          )}
        </ResellersContainer>
      </ContentContainer>
    </PageContainer>
  );
};

export default AdminResellers;