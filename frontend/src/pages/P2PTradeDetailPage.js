import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import Button from '../components/Button';
import p2pService from '../services/p2pService';

const TradeContainer = styled.div`
  padding: 2rem 0;
  min-height: 100vh;
`;

const TradeHeader = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: var(--color-text-secondary);
`;

const TradeCard = styled(motion.div)`
  background: rgba(30, 40, 60, 0.6);
  border-radius: var(--border-radius);
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 2rem;
`;

const TradeSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-primary);
`;

const OfferDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const DetailLabel = styled.span`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 500;
`;

const DetailValue = styled.span`
  font-size: 1rem;
  color: var(--color-text);
  font-weight: 500;
`;

const PaymentDetails = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const PaymentMethod = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-weight: 500;
`;

const PaymentIcon = styled.span`
  font-size: 1.5rem;
`;

const BankDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const TradeForm = styled.form`
  margin-top: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--color-text);
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
`;

const AmountSummary = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 1rem;
`;

const TotalRow = styled(SummaryRow)`
  font-weight: 700;
  font-size: 1.25rem;
  padding-top: 0.75rem;
  margin-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ErrorMessage = styled.div`
  color: var(--color-danger);
  margin-top: 0.5rem;
  font-size: 0.875rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
`;

const NotFoundContainer = styled.div`
  text-align: center;
  padding: 3rem;
`;

const paymentMethodIcons = {
  transferencia_bancaria: '🏦',
  billetera_digital: '📱',
  efectivo: '💵',
  tarjeta_credito: '💳',
  tarjeta_debito: '💳'
};

const paymentMethodNames = {
  transferencia_bancaria: 'Transferencia Bancaria',
  billetera_digital: 'Billetera Digital',
  efectivo: 'Efectivo',
  tarjeta_credito: 'Tarjeta de Crédito',
  tarjeta_debito: 'Tarjeta de Débito'
};

const P2PTradeDetailPage = () => {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const { wallet } = useUser();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState('');
  const [totalFiat, setTotalFiat] = useState(0);

  useEffect(() => {
    if (!wallet) {
      navigate('/p2p');
      return;
    }
    
    loadOfferDetails();
  }, [offerId, wallet]);

  const loadOfferDetails = async () => {
    try {
      setLoading(true);
      // En un entorno real, esto sería una llamada a la API
      // const response = await p2pService.getOfferDetails(offerId);
      
      // Simulación de datos para desarrollo
      const mockOffer = {
        id: offerId,
        wallet: 'TMuKGY31rW9abcdefghijklmnopqrstuvwx',
        tipo: 'venta',
        precio_usdt: 3850,
        cantidad_min: 50,
        cantidad_max: 1000,
        pais_codigo: 'CO',
        moneda_local: 'COP',
        metodo_pago: 'transferencia_bancaria',
        banco_nombre: 'Bancolombia',
        banco_swift: 'COLOCOBM',
        datos_bancarios: {
          titular: 'Juan Pérez',
          numero_cuenta: '****1234',
          tipo_cuenta: 'Ahorros'
        },
        descripcion: 'Venta rápida de USDT, pago inmediato',
        instrucciones: 'Realizar transferencia y enviar comprobante',
        tiempo_limite: 30,
        status: 'activa',
        puntuacion_reputacion: 4.8,
        trades_completados: 127
      };
      
      // Verificar que la oferta no sea del usuario actual
      if (mockOffer.wallet === wallet) {
        setError('No puedes tradear con tu propia oferta');
      }
      
      setOffer(mockOffer);
      setAmount(mockOffer.cantidad_min.toString());
      setTotalFiat(mockOffer.cantidad_min * mockOffer.precio_usdt);
    } catch (error) {
      console.error('Error loading offer details:', error);
      setError('Error al cargar los detalles de la oferta');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    
    if (offer && !isNaN(value) && value !== '') {
      const amountValue = parseFloat(value);
      setTotalFiat(amountValue * offer.precio_usdt);
    } else {
      setTotalFiat(0);
    }
  };

  const validateAmount = () => {
    if (!amount || isNaN(amount)) {
      return 'Ingresa una cantidad válida';
    }
    
    const amountValue = parseFloat(amount);
    
    if (amountValue < offer.cantidad_min) {
      return `La cantidad mínima es ${offer.cantidad_min} USDT`;
    }
    
    if (amountValue > offer.cantidad_max) {
      return `La cantidad máxima es ${offer.cantidad_max} USDT`;
    }
    
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateAmount();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    try {
      // En un entorno real, esto sería una llamada a la API
      // const response = await p2pService.createOrder({
      //   offerId,
      //   wallet,
      //   amount: parseFloat(amount)
      // });
      
      // Simulación de creación de orden
      alert(`Orden creada exitosamente por ${amount} USDT`);
      navigate('/p2p/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      setError('Error al crear la orden');
    }
  };

  if (loading) {
    return (
      <TradeContainer className="container">
        <LoadingContainer>
          <div>Cargando detalles de la oferta...</div>
        </LoadingContainer>
      </TradeContainer>
    );
  }

  if (!offer) {
    return (
      <TradeContainer className="container">
        <NotFoundContainer>
          <h2>Oferta no encontrada</h2>
          <p>La oferta que buscas no existe o ha sido eliminada</p>
          <Button onClick={() => navigate('/p2p')}>
            Volver a P2P
          </Button>
        </NotFoundContainer>
      </TradeContainer>
    );
  }

  return (
    <TradeContainer className="container">
      <TradeHeader>
        <Title>
          {offer.tipo === 'compra' ? 'Vender' : 'Comprar'} USDT
        </Title>
        <Subtitle>
          Estás {offer.tipo === 'compra' ? 'vendiendo a' : 'comprando de'} {offer.wallet.substring(0, 8)}...
        </Subtitle>
      </TradeHeader>

      <TradeCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <TradeSection>
          <SectionTitle>Detalles de la Oferta</SectionTitle>
          <OfferDetails>
            <DetailItem>
              <DetailLabel>Precio por USDT</DetailLabel>
              <DetailValue>{offer.precio_usdt} {offer.moneda_local}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Límites</DetailLabel>
              <DetailValue>{offer.cantidad_min} - {offer.cantidad_max} USDT</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Tiempo Límite</DetailLabel>
              <DetailValue>{offer.tiempo_limite} minutos</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Reputación</DetailLabel>
              <DetailValue>
                {'★'.repeat(Math.floor(offer.puntuacion_reputacion))}
                {'☆'.repeat(5 - Math.floor(offer.puntuacion_reputacion))}
                {' '}({offer.trades_completados})
              </DetailValue>
            </DetailItem>
          </OfferDetails>
        </TradeSection>

        <TradeSection>
          <SectionTitle>Método de Pago</SectionTitle>
          <PaymentDetails>
            <PaymentMethod>
              <PaymentIcon>{paymentMethodIcons[offer.metodo_pago] || '💰'}</PaymentIcon>
              <span>{paymentMethodNames[offer.metodo_pago] || offer.metodo_pago}</span>
            </PaymentMethod>

            {offer.metodo_pago === 'transferencia_bancaria' && (
              <BankDetails>
                <DetailItem>
                  <DetailLabel>Banco</DetailLabel>
                  <DetailValue>{offer.banco_nombre}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Titular</DetailLabel>
                  <DetailValue>{offer.datos_bancarios.titular}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Cuenta</DetailLabel>
                  <DetailValue>{offer.datos_bancarios.numero_cuenta}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Tipo</DetailLabel>
                  <DetailValue>{offer.datos_bancarios.tipo_cuenta}</DetailValue>
                </DetailItem>
              </BankDetails>
            )}

            {offer.metodo_pago === 'billetera_digital' && offer.billetera_digital && (
              <BankDetails>
                <DetailItem>
                  <DetailLabel>Tipo</DetailLabel>
                  <DetailValue>{offer.billetera_digital.tipo}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Número/Usuario</DetailLabel>
                  <DetailValue>{offer.billetera_digital.numero}</DetailValue>
                </DetailItem>
              </BankDetails>
            )}
          </PaymentDetails>

          {offer.instrucciones && (
            <div>
              <DetailLabel>Instrucciones de Pago</DetailLabel>
              <p style={{ marginTop: '0.5rem' }}>{offer.instrucciones}</p>
            </div>
          )}
        </TradeSection>

        <TradeForm onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Cantidad USDT</Label>
            <Input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder={`Min: ${offer.cantidad_min}, Max: ${offer.cantidad_max}`}
              min={offer.cantidad_min}
              max={offer.cantidad_max}
              step="0.01"
              required
            />
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </FormGroup>

          <AmountSummary>
            <SummaryRow>
              <span>Cantidad USDT:</span>
              <span>{parseFloat(amount || 0).toFixed(2)} USDT</span>
            </SummaryRow>
            <SummaryRow>
              <span>Precio por USDT:</span>
              <span>{offer.precio_usdt} {offer.moneda_local}</span>
            </SummaryRow>
            <TotalRow>
              <span>Total a {offer.tipo === 'venta' ? 'pagar' : 'recibir'}:</span>
              <span>{totalFiat.toFixed(2)} {offer.moneda_local}</span>
            </TotalRow>
          </AmountSummary>

          <Button type="submit" fullWidth>
            {offer.tipo === 'venta' ? 'Comprar USDT' : 'Vender USDT'}
          </Button>
        </TradeForm>
      </TradeCard>
    </TradeContainer>
  );
};

export default P2PTradeDetailPage;