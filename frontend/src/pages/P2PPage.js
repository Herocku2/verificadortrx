import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import Button from '../components/Button';
import Modal from '../components/Modal';
import p2pService from '../services/p2pService';
import CreateP2POfferModal from '../components/CreateP2POfferModal';
import UserP2POffers from '../components/UserP2POffers';
import UserP2POrders from '../components/UserP2POrders';

const P2PContainer = styled.div`
  padding: 2rem 0;
  min-height: 100vh;
`;

const P2PHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto;
`;

const TabsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Tab = styled.button`
  padding: 1rem 2rem;
  background: none;
  border: none;
  color: ${props => props.active ? 'var(--color-primary)' : 'var(--color-text-secondary)'};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? 'var(--color-primary)' : 'transparent'};
  transition: all 0.3s ease;

  &:hover {
    color: var(--color-primary);
  }
`;

const FiltersContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(30, 40, 60, 0.6);
  border-radius: var(--border-radius);
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 500;
`;

const FilterSelect = styled.select`
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--color-text);
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
`;

const FilterInput = styled.input`
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--color-text);
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
`;

const OffersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OfferCard = styled(motion.div)`
  background: rgba(30, 40, 60, 0.6);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--color-primary);
    transform: translateY(-2px);
  }
`;

const OfferHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1rem;
`;

const OfferType = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => props.type === 'compra' ? 'rgba(0, 200, 83, 0.2)' : 'rgba(255, 61, 0, 0.2)'};
  color: ${props => props.type === 'compra' ? 'var(--color-success)' : 'var(--color-danger)'};
`;

const OfferPrice = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
`;

const OfferDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const OfferDetail = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const DetailLabel = styled.span`
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  font-weight: 500;
`;

const DetailValue = styled.span`
  font-size: 0.875rem;
  color: var(--color-text);
  font-weight: 500;
`;

const OfferActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UserRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--color-warning);
`;

const CreateOfferButton = styled(Button)`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 1.5rem;
  z-index: 1000;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--color-text-secondary);
`;

const countries = [
  { code: 'CO', name: 'Colombia', currency: 'COP' },
  { code: 'MX', name: 'México', currency: 'MXN' },
  { code: 'AR', name: 'Argentina', currency: 'ARS' },
  { code: 'VE', name: 'Venezuela', currency: 'VES' },
  { code: 'PE', name: 'Perú', currency: 'PEN' },
  { code: 'CL', name: 'Chile', currency: 'CLP' },
  { code: 'BR', name: 'Brasil', currency: 'BRL' },
  { code: 'ES', name: 'España', currency: 'EUR' },
  { code: 'US', name: 'Estados Unidos', currency: 'USD' }
];

const paymentMethods = [
  { id: 'transferencia_bancaria', name: 'Transferencia Bancaria', icon: '🏦' },
  { id: 'billetera_digital', name: 'Billetera Digital', icon: '📱' },
  { id: 'efectivo', name: 'Efectivo', icon: '💵' },
  { id: 'tarjeta_credito', name: 'Tarjeta de Crédito', icon: '💳' },
  { id: 'tarjeta_debito', name: 'Tarjeta de Débito', icon: '💳' }
];

const P2PPage = () => {
  const { wallet } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ofertas');
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    country: 'CO',
    type: '',
    currency: 'COP',
    payment_method: '',
    min_amount: '',
    max_amount: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    // Solo cargar ofertas si estamos en la pestaña de ofertas
    if (activeTab === 'ofertas') {
      loadOffers();
    }
  }, [filters, activeTab]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const response = await p2pService.getP2POffers(filters.country, filters);
      
      // Verificar que la respuesta tenga la estructura esperada
      if (response && response.data && Array.isArray(response.data.data)) {
        setOffers(response.data.data);
        
        // Si hay ofertas offline, mostrar un mensaje
        const hasOfflineOffers = response.data.data.some(offer => offer._offline);
        if (hasOfflineOffers) {
          console.log('Algunas ofertas se están mostrando en modo offline');
        }
      } else {
        console.warn('Respuesta de ofertas con formato inesperado:', response);
        setOffers([]);
      }
    } catch (error) {
      console.error('Error loading offers:', error);
      
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        console.log('Error de conexión al servidor. Usando datos en caché si están disponibles.');
        
        // Intentar usar datos en caché del localStorage
        try {
          const cachedData = localStorage.getItem(`p2p_offers_${filters.country}`);
          if (cachedData) {
            const parsedData = JSON.parse(cachedData);
            if (parsedData && parsedData.data && Array.isArray(parsedData.data)) {
              setOffers(parsedData.data);
              console.log('Usando datos en caché para ofertas P2P');
            } else {
              console.warn('Datos en caché con formato inesperado');
              setOffers([]);
            }
          } else {
            setOffers([]);
          }
        } catch (cacheError) {
          console.error('Error al leer datos en caché:', cacheError);
          setOffers([]);
        }
      } else {
        setOffers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCreateOffer = () => {
    if (!wallet) {
      alert('Conecta tu wallet para crear ofertas');
      return;
    }
    setShowCreateModal(true);
  };

  const handleTradeOffer = (offer) => {
    if (!wallet) {
      alert('Conecta tu wallet para hacer trading');
      return;
    }
    // Navegar a la página de trading específica
    navigate(`/p2p/trade/${offer.id}`);
  };

  const renderStars = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  // Si no hay wallet, mostrar una versión limitada de la página
  if (!wallet) {
    return (
      <P2PContainer className="container">
        <P2PHeader>
          <Title>P2P Trading</Title>
          <Subtitle>
            Conecta tu wallet para acceder al trading P2P descentralizado
          </Subtitle>
        </P2PHeader>
        
        {/* Permitir ver ofertas sin wallet conectada */}
        <TabsContainer>
          <Tab 
            active={activeTab === 'ofertas'} 
            onClick={() => setActiveTab('ofertas')}
          >
            Ver Ofertas
          </Tab>
        </TabsContainer>
        
        {activeTab === 'ofertas' && (
          <>
            <FiltersContainer>
              <FilterGroup>
                <FilterLabel>País</FilterLabel>
                <FilterSelect
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                >
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </FilterSelect>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>Tipo</FilterLabel>
                <FilterSelect
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="compra">Comprar USDT</option>
                  <option value="venta">Vender USDT</option>
                </FilterSelect>
              </FilterGroup>
            </FiltersContainer>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                Cargando ofertas...
              </div>
            ) : offers.length === 0 ? (
              <EmptyState>
                <h3>No hay ofertas disponibles</h3>
                <p>Conecta tu wallet para crear la primera oferta en este país</p>
                <Button onClick={() => navigate('/scanner')} style={{ marginTop: '1rem' }}>
                  Conectar Wallet
                </Button>
              </EmptyState>
            ) : (
              <>
                <OffersContainer>
                  {offers.map(offer => (
                    <OfferCard
                      key={offer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <OfferHeader>
                        <OfferType type={offer.tipo}>
                          {offer.tipo === 'compra' ? 'Comprando' : 'Vendiendo'} USDT
                        </OfferType>
                        <OfferPrice>
                          {offer.precio_usdt} {offer.moneda_local}
                        </OfferPrice>
                      </OfferHeader>

                      <OfferDetails>
                        <OfferDetail>
                          <DetailLabel>Límites</DetailLabel>
                          <DetailValue>
                            {offer.cantidad_min} - {offer.cantidad_max} USDT
                          </DetailValue>
                        </OfferDetail>
                        <OfferDetail>
                          <DetailLabel>Método de Pago</DetailLabel>
                          <DetailValue>
                            {paymentMethods.find(m => m.id === offer.metodo_pago)?.name || offer.metodo_pago}
                          </DetailValue>
                        </OfferDetail>
                      </OfferDetails>

                      <OfferActions>
                        <UserInfo>
                          <span>{offer.wallet ? offer.wallet.substring(0, 8) + '...' : 'Usuario'}</span>
                          <UserRating>
                            {renderStars(offer.puntuacion_reputacion || 5)}
                            <span>({offer.trades_completados || 0})</span>
                          </UserRating>
                        </UserInfo>
                        <Button
                          size="small"
                          onClick={() => navigate('/scanner')}
                        >
                          Conectar para Tradear
                        </Button>
                      </OfferActions>
                    </OfferCard>
                  ))}
                </OffersContainer>
                
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <Button onClick={() => navigate('/scanner')}>
                    Conectar Wallet para Tradear
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </P2PContainer>
    );
  }

  return (
    <P2PContainer className="container">
      <P2PHeader>
        <Title>P2P Trading</Title>
        <Subtitle>
          Compra y vende USDT directamente con otros usuarios usando tu método de pago preferido
        </Subtitle>
      </P2PHeader>

      <TabsContainer>
        <Tab 
          active={activeTab === 'ofertas'} 
          onClick={() => setActiveTab('ofertas')}
        >
          Ver Ofertas
        </Tab>
        <Tab 
          active={activeTab === 'mis-ofertas'} 
          onClick={() => setActiveTab('mis-ofertas')}
        >
          Mis Ofertas
        </Tab>
        <Tab 
          active={activeTab === 'mis-ordenes'} 
          onClick={() => setActiveTab('mis-ordenes')}
        >
          Mis Órdenes
        </Tab>
      </TabsContainer>

      {activeTab === 'ofertas' && (
        <>
          <FiltersContainer>
            <FilterGroup>
              <FilterLabel>País</FilterLabel>
              <FilterSelect
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
              >
                {countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Tipo</FilterLabel>
              <FilterSelect
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="compra">Comprar USDT</option>
                <option value="venta">Vender USDT</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Método de Pago</FilterLabel>
              <FilterSelect
                value={filters.payment_method}
                onChange={(e) => handleFilterChange('payment_method', e.target.value)}
              >
                <option value="">Todos</option>
                {paymentMethods.map(method => (
                  <option key={method.id} value={method.id}>
                    {method.icon} {method.name}
                  </option>
                ))}
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Cantidad Mín.</FilterLabel>
              <FilterInput
                type="number"
                placeholder="0"
                value={filters.min_amount}
                onChange={(e) => handleFilterChange('min_amount', e.target.value)}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Cantidad Máx.</FilterLabel>
              <FilterInput
                type="number"
                placeholder="Sin límite"
                value={filters.max_amount}
                onChange={(e) => handleFilterChange('max_amount', e.target.value)}
              />
            </FilterGroup>
          </FiltersContainer>

          <OffersContainer>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                Cargando ofertas...
              </div>
            ) : offers.length === 0 ? (
              <EmptyState>
                <h3>No hay ofertas disponibles</h3>
                <p>Sé el primero en crear una oferta en este país</p>
              </EmptyState>
            ) : (
              offers.map(offer => (
                <OfferCard
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <OfferHeader>
                    <OfferType type={offer.tipo}>
                      {offer.tipo === 'compra' ? 'Comprando' : 'Vendiendo'} USDT
                    </OfferType>
                    <OfferPrice>
                      {offer.precio_usdt} {offer.moneda_local}
                    </OfferPrice>
                  </OfferHeader>

                  <OfferDetails>
                    <OfferDetail>
                      <DetailLabel>Límites</DetailLabel>
                      <DetailValue>
                        {offer.cantidad_min} - {offer.cantidad_max} USDT
                      </DetailValue>
                    </OfferDetail>
                    <OfferDetail>
                      <DetailLabel>Método de Pago</DetailLabel>
                      <DetailValue>
                        {paymentMethods.find(m => m.id === offer.metodo_pago)?.name || offer.metodo_pago}
                      </DetailValue>
                    </OfferDetail>
                    <OfferDetail>
                      <DetailLabel>Banco</DetailLabel>
                      <DetailValue>{offer.banco_nombre || 'No especificado'}</DetailValue>
                    </OfferDetail>
                    <OfferDetail>
                      <DetailLabel>Tiempo Límite</DetailLabel>
                      <DetailValue>{offer.tiempo_limite} min</DetailValue>
                    </OfferDetail>
                  </OfferDetails>

                  <OfferActions>
                    <UserInfo>
                      <span>{offer.wallet.substring(0, 8)}...</span>
                      <UserRating>
                        {renderStars(offer.puntuacion_reputacion || 5)}
                        <span>({offer.trades_completados || 0})</span>
                      </UserRating>
                    </UserInfo>
                    <Button
                      size="small"
                      onClick={() => handleTradeOffer(offer)}
                      disabled={offer.wallet === wallet}
                    >
                      {offer.wallet === wallet ? 'Tu Oferta' : 'Tradear'}
                    </Button>
                  </OfferActions>
                </OfferCard>
              ))
            )}
          </OffersContainer>
        </>
      )}

      {activeTab === 'mis-ofertas' && (
        <UserP2POffers 
          wallet={wallet} 
          onCreateOffer={handleCreateOffer}
        />
      )}

      {activeTab === 'mis-ordenes' && (
        <UserP2POrders wallet={wallet} />
      )}

      <CreateOfferButton onClick={handleCreateOffer}>
        +
      </CreateOfferButton>
    </P2PContainer>
  );
};

export default P2PPage;