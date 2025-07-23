import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Button from './Button';
import p2pService from '../services/p2pService';

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
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: var(--color-primary);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${props => props.type === 'compra' ? 'var(--color-success)' : 'var(--color-danger)'};
  }
`;

const OfferHeader = styled.div`
  display: flex;
  justify-content: space-between;
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
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  &:before {
    content: ${props => props.type === 'compra' ? '"⬇️"' : '"⬆️"'};
    font-size: 0.875rem;
  }
`;

const OfferStatus = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch(props.status) {
      case 'activa': return 'rgba(0, 200, 83, 0.2)';
      case 'pausada': return 'rgba(255, 214, 0, 0.2)';
      case 'completada': return 'rgba(0, 120, 255, 0.2)';
      case 'cancelada': return 'rgba(255, 61, 0, 0.2)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'activa': return 'var(--color-success)';
      case 'pausada': return 'var(--color-warning)';
      case 'completada': return 'var(--color-primary)';
      case 'cancelada': return 'var(--color-danger)';
      default: return 'var(--color-text-secondary)';
    }
  }};
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
  justify-content: flex-end;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  gap: 0.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--color-text-secondary);
  background: rgba(30, 40, 60, 0.4);
  border-radius: var(--border-radius);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  margin: 1rem 0;
  
  h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    color: var(--color-text);
  }
  
  p {
    margin-bottom: 1.5rem;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  
  &:before {
    content: '';
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: var(--color-primary);
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const CreateOfferButton = styled(Button)`
  background: var(--color-success);
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 200, 83, 0.3);
  }
`;

const paymentMethods = {
  transferencia_bancaria: 'Transferencia Bancaria',
  billetera_digital: 'Billetera Digital',
  efectivo: 'Efectivo',
  tarjeta_credito: 'Tarjeta de Crédito',
  tarjeta_debito: 'Tarjeta de Débito'
};

const UserP2POffers = ({ wallet, onCreateOffer }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wallet) {
      loadUserOffers();
    }
  }, [wallet]);

  const loadUserOffers = async () => {
    try {
      setLoading(true);
      const response = await p2pService.getUserP2POffers(wallet);
      setOffers(response.data.data || []);
    } catch (error) {
      console.error('Error loading user offers:', error);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (offer) => {
    try {
      const newStatus = offer.status === 'activa' ? 'pausada' : 'activa';
      const response = await p2pService.updateOfferStatus(offer.id, wallet, newStatus);
      
      // Actualizar la oferta localmente
      setOffers(prevOffers => 
        prevOffers.map(o => 
          o.id === offer.id ? { ...o, status: newStatus } : o
        )
      );
      
      // Si estamos en modo offline, mostrar mensaje
      if (response && response._offline) {
        alert('Cambio guardado en modo offline. Se sincronizará cuando el servidor esté disponible.');
      }
    } catch (error) {
      console.error('Error updating offer status:', error);
      
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        alert('Error de conexión al servidor. El cambio se guardará localmente y se sincronizará cuando el servidor esté disponible.');
        
        // Actualizar la oferta localmente de todos modos
        const newStatus = offer.status === 'activa' ? 'pausada' : 'activa';
        setOffers(prevOffers => 
          prevOffers.map(o => 
            o.id === offer.id ? { ...o, status: newStatus, _offline: true } : o
          )
        );
      } else {
        alert('Error al actualizar el estado de la oferta: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleDeleteOffer = async (offer) => {
    // Usar window.confirm para evitar problemas con ESLint
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta oferta?')) {
      return;
    }

    try {
      const response = await p2pService.updateOfferStatus(offer.id, wallet, 'cancelada');
      
      // Eliminar la oferta de la lista
      setOffers(prevOffers => prevOffers.filter(o => o.id !== offer.id));
      
      // Si estamos en modo offline, mostrar mensaje
      if (response && response._offline) {
        alert('Oferta eliminada en modo offline. Se sincronizará cuando el servidor esté disponible.');
      }
    } catch (error) {
      console.error('Error deleting offer:', error);
      
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        alert('Error de conexión al servidor. La oferta se eliminará localmente y se sincronizará cuando el servidor esté disponible.');
        
        // Eliminar la oferta de la lista de todos modos
        setOffers(prevOffers => prevOffers.filter(o => o.id !== offer.id));
      } else {
        alert('Error al eliminar la oferta: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  if (loading) {
    return <LoadingState>Cargando tus ofertas...</LoadingState>;
  }

  if (offers.length === 0) {
    return (
      <EmptyState>
        <h3>No tienes ofertas creadas</h3>
        <p>Crea tu primera oferta para empezar a tradear</p>
        <CreateOfferButton onClick={onCreateOffer}>
          + Crear Nueva Oferta
        </CreateOfferButton>
      </EmptyState>
    );
  }

  return (
    <OffersContainer>
      {offers.map(offer => (
        <OfferCard
          key={offer.id}
          type={offer.tipo}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <OfferHeader>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <OfferType type={offer.tipo}>
                {offer.tipo === 'compra' ? 'Compra' : 'Venta'} USDT
              </OfferType>
              <OfferStatus status={offer.status}>
                {offer.status}
              </OfferStatus>
              {offer._offline && (
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--color-warning)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <span>⚠️</span> Pendiente de sincronizar
                </span>
              )}
            </div>
            <OfferPrice>
              {offer.precio_usdt} <span style={{ fontSize: '0.875rem', fontWeight: 'normal' }}>{offer.moneda_local}</span>
            </OfferPrice>
          </OfferHeader>

          <OfferDetails>
            <OfferDetail>
              <DetailLabel>Límites</DetailLabel>
              <DetailValue>
                <span style={{ color: 'var(--color-primary)' }}>{offer.cantidad_min} - {offer.cantidad_max}</span> USDT
              </DetailValue>
            </OfferDetail>
            <OfferDetail>
              <DetailLabel>Método de Pago</DetailLabel>
              <DetailValue>
                {offer.metodo_pago === 'transferencia_bancaria' && <span>🏦</span>}
                {offer.metodo_pago === 'billetera_digital' && <span>📱</span>}
                {offer.metodo_pago === 'efectivo' && <span>💵</span>}
                {offer.metodo_pago === 'tarjeta_credito' && <span>💳</span>}
                {offer.metodo_pago === 'tarjeta_debito' && <span>💳</span>}
                {' '}{paymentMethods[offer.metodo_pago] || offer.metodo_pago}
              </DetailValue>
            </OfferDetail>
            <OfferDetail>
              <DetailLabel>País</DetailLabel>
              <DetailValue>
                {offer.pais_codigo === 'CO' && '🇨🇴'}
                {offer.pais_codigo === 'MX' && '🇲🇽'}
                {offer.pais_codigo === 'AR' && '🇦🇷'}
                {offer.pais_codigo === 'VE' && '🇻🇪'}
                {offer.pais_codigo === 'PE' && '🇵🇪'}
                {offer.pais_codigo === 'CL' && '🇨🇱'}
                {offer.pais_codigo === 'BR' && '🇧🇷'}
                {offer.pais_codigo === 'ES' && '🇪🇸'}
                {offer.pais_codigo === 'US' && '🇺🇸'}
                {' '}{offer.pais_codigo}
              </DetailValue>
            </OfferDetail>
            <OfferDetail>
              <DetailLabel>Tiempo Límite</DetailLabel>
              <DetailValue>
                <span style={{ color: 'var(--color-warning)' }}>⏱️ {offer.tiempo_limite}</span> min
              </DetailValue>
            </OfferDetail>
          </OfferDetails>

          <OfferActions>
            {offer.status !== 'cancelada' && offer.status !== 'completada' && (
              <>
                <Button 
                  size="small" 
                  variant={offer.status === 'activa' ? 'warning' : 'success'}
                  onClick={() => handleToggleStatus(offer)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    borderRadius: '6px',
                    fontWeight: '600'
                  }}
                >
                  {offer.status === 'activa' ? (
                    <>
                      <span>⏸️</span> Pausar
                    </>
                  ) : (
                    <>
                      <span>▶️</span> Activar
                    </>
                  )}
                </Button>
                <Button 
                  size="small" 
                  variant="danger"
                  onClick={() => handleDeleteOffer(offer)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    borderRadius: '6px',
                    fontWeight: '600'
                  }}
                >
                  <span>🗑️</span> Eliminar
                </Button>
              </>
            )}
          </OfferActions>
        </OfferCard>
      ))}
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginTop: '2rem' 
      }}>
        <CreateOfferButton onClick={onCreateOffer}>
          + Crear Nueva Oferta
        </CreateOfferButton>
      </div>
    </OffersContainer>
  );
};

export default UserP2POffers;