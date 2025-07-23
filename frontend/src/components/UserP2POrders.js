import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Button from './Button';
import p2pService from '../services/p2pService';

const OrdersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OrderCard = styled(motion.div)`
  background: rgba(30, 40, 60, 0.6);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--color-primary);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const OrderId = styled.span`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
`;

const OrderStatus = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch(props.status) {
      case 'pendiente': return 'rgba(255, 214, 0, 0.2)';
      case 'pagado': return 'rgba(0, 120, 255, 0.2)';
      case 'confirmado': return 'rgba(0, 200, 83, 0.2)';
      case 'completado': return 'rgba(0, 200, 83, 0.2)';
      case 'disputado': return 'rgba(255, 61, 0, 0.2)';
      case 'cancelado': return 'rgba(255, 61, 0, 0.2)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'pendiente': return 'var(--color-warning)';
      case 'pagado': return 'var(--color-primary)';
      case 'confirmado': return 'var(--color-success)';
      case 'completado': return 'var(--color-success)';
      case 'disputado': return 'var(--color-danger)';
      case 'cancelado': return 'var(--color-danger)';
      default: return 'var(--color-text-secondary)';
    }
  }};
`;

const OrderAmount = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
`;

const OrderDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const OrderDetail = styled.div`
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

const OrderActions = styled.div`
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

const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  color: ${props => props.active ? 'var(--color-primary)' : 'var(--color-text-secondary)'};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? 'var(--color-primary)' : 'transparent'};
  transition: all 0.3s ease;

  &:hover {
    color: var(--color-primary);
  }
`;

const paymentMethods = {
  transferencia_bancaria: 'Transferencia Bancaria',
  billetera_digital: 'Billetera Digital',
  efectivo: 'Efectivo',
  tarjeta_credito: 'Tarjeta de Crédito',
  tarjeta_debito: 'Tarjeta de Débito'
};

const UserP2POrders = ({ wallet }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    if (wallet) {
      loadUserOrders();
    }
  }, [wallet, activeTab]);

  const loadUserOrders = async () => {
    try {
      setLoading(true);
      const response = await p2pService.getUserP2POrders(wallet);
      
      let filteredOrders = response.data.data || [];
      
      if (activeTab === 'active') {
        filteredOrders = filteredOrders.filter(order => 
          ['pendiente', 'pagado', 'confirmado', 'disputado'].includes(order.estado)
        );
      } else {
        filteredOrders = filteredOrders.filter(order => 
          ['completado', 'cancelado'].includes(order.estado)
        );
      }
      
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error loading user orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (order) => {
    try {
      await p2pService.updateP2POrderStatus(order.id, 'pagado', {
        wallet,
        comprobante_pago: 'Pago realizado',
        notas: 'Pago realizado por el usuario'
      });
      
      // Actualizar la orden localmente
      setOrders(prevOrders => 
        prevOrders.map(o => 
          o.id === order.id ? { ...o, estado: 'pagado' } : o
        )
      );
    } catch (error) {
      console.error('Error marking order as paid:', error);
      alert('Error al marcar la orden como pagada');
    }
  };

  const handleConfirmPayment = async (order) => {
    try {
      await p2pService.updateP2POrderStatus(order.id, 'confirmado', {
        wallet,
        notas: 'Pago confirmado por el vendedor'
      });
      
      // Actualizar la orden localmente
      setOrders(prevOrders => 
        prevOrders.map(o => 
          o.id === order.id ? { ...o, estado: 'confirmado' } : o
        )
      );
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert('Error al confirmar el pago');
    }
  };

  const handleOpenDispute = async (order) => {
    const reason = prompt('Por favor, indica el motivo de la disputa:');
    if (!reason) return;

    try {
      await p2pService.updateP2POrderStatus(order.id, 'disputado', {
        wallet,
        razon: reason
      });
      
      // Actualizar la orden localmente
      setOrders(prevOrders => 
        prevOrders.map(o => 
          o.id === order.id ? { ...o, estado: 'disputado' } : o
        )
      );
    } catch (error) {
      console.error('Error opening dispute:', error);
      alert('Error al abrir disputa');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getTimeLeft = (timeLimit) => {
    if (!timeLimit) return 'N/A';
    
    const limitTime = new Date(timeLimit);
    const now = new Date();
    const diffMs = limitTime - now;
    
    if (diffMs <= 0) return 'Expirado';
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    }
    
    return `${diffMins}m`;
  };

  if (loading) {
    return <LoadingState>Cargando tus órdenes...</LoadingState>;
  }

  return (
    <>
      <TabsContainer>
        <Tab 
          active={activeTab === 'active'} 
          onClick={() => setActiveTab('active')}
        >
          Órdenes Activas
        </Tab>
        <Tab 
          active={activeTab === 'history'} 
          onClick={() => setActiveTab('history')}
        >
          Historial
        </Tab>
      </TabsContainer>

      {orders.length === 0 ? (
        <EmptyState>
          <h3>No tienes órdenes {activeTab === 'active' ? 'activas' : 'completadas'}</h3>
          <p>{activeTab === 'active' ? 'Busca ofertas para empezar a tradear' : 'Tu historial de órdenes aparecerá aquí'}</p>
        </EmptyState>
      ) : (
        <OrdersContainer>
          {orders.map(order => (
            <OrderCard
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <OrderHeader>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <OrderId>Orden #{order.order_id || order.id}</OrderId>
                  <OrderStatus status={order.estado}>
                    {order.estado}
                  </OrderStatus>
                </div>
                <OrderAmount>
                  {order.cantidad_usdt} USDT
                </OrderAmount>
              </OrderHeader>

              <OrderDetails>
                <OrderDetail>
                  <DetailLabel>Precio</DetailLabel>
                  <DetailValue>
                    {order.precio_acordado} {order.moneda_fiat}
                  </DetailValue>
                </OrderDetail>
                <OrderDetail>
                  <DetailLabel>Total</DetailLabel>
                  <DetailValue>
                    {order.cantidad_fiat} {order.moneda_fiat}
                  </DetailValue>
                </OrderDetail>
                <OrderDetail>
                  <DetailLabel>Método de Pago</DetailLabel>
                  <DetailValue>
                    {paymentMethods[order.metodo_pago_usado] || order.metodo_pago_usado}
                  </DetailValue>
                </OrderDetail>
                <OrderDetail>
                  <DetailLabel>Tiempo Límite</DetailLabel>
                  <DetailValue>
                    {getTimeLeft(order.tiempo_limite)}
                  </DetailValue>
                </OrderDetail>
              </OrderDetails>

              <OrderDetails>
                <OrderDetail>
                  <DetailLabel>Contraparte</DetailLabel>
                  <DetailValue>
                    {order.wallet_comprador === wallet ? 
                      `${order.wallet_vendedor.substring(0, 8)}...` : 
                      `${order.wallet_comprador.substring(0, 8)}...`}
                  </DetailValue>
                </OrderDetail>
                <OrderDetail>
                  <DetailLabel>Fecha</DetailLabel>
                  <DetailValue>
                    {formatDate(order.createdAt)}
                  </DetailValue>
                </OrderDetail>
              </OrderDetails>

              <OrderActions>
                {order.estado === 'pendiente' && order.wallet_comprador === wallet && (
                  <Button 
                    size="small" 
                    variant="primary"
                    onClick={() => handleMarkAsPaid(order)}
                  >
                    Marcar como Pagado
                  </Button>
                )}

                {order.estado === 'pagado' && order.wallet_vendedor === wallet && (
                  <Button 
                    size="small" 
                    variant="success"
                    onClick={() => handleConfirmPayment(order)}
                  >
                    Confirmar Pago
                  </Button>
                )}

                {['pendiente', 'pagado'].includes(order.estado) && (
                  <Button 
                    size="small" 
                    variant="danger"
                    onClick={() => handleOpenDispute(order)}
                  >
                    Abrir Disputa
                  </Button>
                )}

                {order.estado === 'confirmado' && (
                  <span style={{ color: 'var(--color-success)' }}>
                    USDT liberados
                  </span>
                )}
              </OrderActions>
            </OrderCard>
          ))}
        </OrdersContainer>
      )}
    </>
  );
};

export default UserP2POrders;