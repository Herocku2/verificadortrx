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

  &:hover {
    border-color: var(--color-primary);
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
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
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
        <Button onClick={onCreateOffer} style={{ marginTop: '1rem' }}>
          Crear Nueva Oferta
        </Button>
      </EmptyState>
    );
  }

  return (
    <OffersContainer>
      {offers.map(offer => (
        <OfferCard
          key={offer.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <OfferHeader>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <OfferType type={offer.tipo}>
                {offer.tipo === 'compra' ? 'Comprando' : 'Vendiendo'} USDT
              </OfferType>
              <OfferStatus status={offer.status}>
                {offer.status}
              </OfferStatus>
            </div>
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
                {paymentMethods[offer.metodo_pago] || offer.metodo_pago}
              </DetailValue>
            </OfferDetail>
            <OfferDetail>
              <DetailLabel>País</DetailLabel>
              <DetailValue>{offer.pais_codigo}</DetailValue>
            </OfferDetail>
            <OfferDetail>
              <DetailLabel>Trades Completados</DetailLabel>
              <DetailValue>{offer.trades_completados || 0}</DetailValue>
            </OfferDetail>
          </OfferDetails>

          <OfferActions>
            {offer.status !== 'cancelada' && offer.status !== 'completada' && (
              <>
                <Button 
                  size="small" 
                  variant={offer.status === 'activa' ? 'warning' : 'success'}
                  onClick={() => handleToggleStatus(offer)}
                >
                  {offer.status === 'activa' ? 'Pausar' : 'Activar'}
                </Button>
                <Button 
                  size="small" 
                  variant="danger"
                  onClick={() => handleDeleteOffer(offer)}
                >
                  Eliminar
                </Button>
              </>
            )}
          </OfferActions>
        </OfferCard>
      ))}
    </OffersContainer>
  );
};

export default UserP2POffers;