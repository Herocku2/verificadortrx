import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Modal from './Modal';
import Button from './Button';
import p2pService from '../services/p2pService';

const ModalContent = styled.div`
  max-width: 100%;
  color: var(--color-text);
`;

const FormTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-text);
  text-align: center;
`;

const FormSubtitle = styled.h3`
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 1rem;
  color: var(--color-text-secondary);
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
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--color-text);
  font-size: 0.875rem;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.7rem center;
  background-size: 1em;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  background: ${props => props.checked ? 'rgba(0, 120, 255, 0.1)' : 'transparent'};
  border: 1px solid ${props => props.checked ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.1)'};
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 120, 255, 0.05);
  }
`;

const RadioInput = styled.input`
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid ${props => props.checked ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.3)'};
  position: relative;
  
  &:checked {
    border-color: var(--color-primary);
    
    &:after {
      content: '';
      position: absolute;
      top: 3px;
      left: 3px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-primary);
    }
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 120, 255, 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--color-text);
  font-size: 0.875rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
`;

const ErrorMessage = styled.div`
  color: var(--color-danger);
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const SuccessMessage = styled.div`
  color: var(--color-success);
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BankDetails = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
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

const CreateP2POfferModal = ({ isOpen, onClose, wallet, onSuccess }) => {
  const [formData, setFormData] = useState({
    tipo: 'venta',
    precio_usdt: '',
    precio_tipo: 'fijo', // Nuevo campo para tipo de precio (fijo o dinámico)
    cantidad_min: '',
    cantidad_max: '',
    pais_codigo: 'CO',
    moneda_local: 'COP',
    metodo_pago: 'transferencia_bancaria',
    banco_nombre: '',
    banco_swift: '',
    datos_bancarios: {
      titular: '',
      numero_cuenta: '',
      tipo_cuenta: 'Ahorros'
    },
    billetera_digital: {
      tipo: '',
      numero: ''
    },
    descripcion: '',
    instrucciones: '',
    tiempo_limite: 30
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [banks, setBanks] = useState([]);

  const [referencePrices, setReferencePrices] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadBanks(formData.pais_codigo);
      loadReferencePrices();
    }
  }, [isOpen, formData.pais_codigo]);
  
  // Cargar precios de referencia
  const loadReferencePrices = async () => {
    try {
      const response = await p2pService.getReferencePrices();
      
      // Verificar si la respuesta tiene datos
      if (response && response.data && response.data.data) {
        setReferencePrices(response.data.data || {});
        
        // Establecer precio de referencia para el país seleccionado
        if (response.data.data[formData.pais_codigo]) {
          setFormData(prev => ({
            ...prev,
            precio_usdt: response.data.data[formData.pais_codigo].price
          }));
        }
      }
    } catch (error) {
      console.error('Error loading reference prices:', error);
      
      // Si es un error de red, mostrar un mensaje
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        console.log('Error de conexión al cargar precios de referencia. Usando datos predeterminados.');
        
        // Usar precios predeterminados para algunos países comunes
        const defaultPrices = {
          CO: { price: 3850 },
          MX: { price: 17.5 },
          AR: { price: 850 },
          VE: { price: 36.5 },
          PE: { price: 3.7 },
          CL: { price: 950 },
          BR: { price: 5.2 },
          ES: { price: 0.92 },
          US: { price: 1 }
        };
        
        setReferencePrices(defaultPrices);
        
        // Establecer precio predeterminado para el país seleccionado
        if (defaultPrices[formData.pais_codigo]) {
          setFormData(prev => ({
            ...prev,
            precio_usdt: defaultPrices[formData.pais_codigo].price
          }));
        }
      }
    }
  };

  const loadBanks = async (countryCode) => {
    try {
      const response = await p2pService.getBanksByCountry(countryCode);
      
      // Verificar si la respuesta tiene datos
      if (response && response.data && response.data.data) {
        setBanks(response.data.data.banks || []);
      }
    } catch (error) {
      console.error('Error loading banks:', error);
      
      // Si es un error de red, mostrar un mensaje
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        console.log('Error de conexión al cargar bancos. Usando datos predeterminados.');
        
        // Usar bancos predeterminados para algunos países comunes
        const defaultBanks = {
          CO: [
            { nombre: 'Bancolombia', swift: 'BANCOL' },
            { nombre: 'Banco de Bogotá', swift: 'BBOGCO' },
            { nombre: 'Davivienda', swift: 'DAVICO' },
            { nombre: 'Nequi', swift: 'NEQUICO' }
          ],
          MX: [
            { nombre: 'BBVA México', swift: 'BBVAMX' },
            { nombre: 'Banorte', swift: 'BANOMX' },
            { nombre: 'Santander México', swift: 'SANTMX' }
          ],
          AR: [
            { nombre: 'Banco Nación', swift: 'NACNAR' },
            { nombre: 'Banco Galicia', swift: 'GALIAR' },
            { nombre: 'Mercado Pago', swift: 'MERCPAR' }
          ]
        };
        
        setBanks(defaultBanks[countryCode] || []);
      } else {
        setBanks([]);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Actualizar moneda y precio de referencia cuando cambia el país
    if (name === 'pais_codigo') {
      const country = countries.find(c => c.code === value);
      if (country) {
        // Actualizar moneda
        setFormData(prev => ({
          ...prev,
          moneda_local: country.currency
        }));
        
        // Actualizar precio de referencia
        if (referencePrices && referencePrices[value]) {
          setFormData(prev => ({
            ...prev,
            precio_usdt: referencePrices[value].price
          }));
        }
        
        // Cargar bancos del nuevo país
        loadBanks(value);
      }
    }
  };

  const handleBankChange = (e) => {
    const selectedBank = banks.find(bank => bank.nombre === e.target.value);
    
    if (selectedBank) {
      setFormData(prev => ({
        ...prev,
        banco_nombre: selectedBank.nombre,
        banco_swift: selectedBank.swift || ''
      }));
    }
  };

  const validateForm = () => {
    if (!formData.precio_usdt || parseFloat(formData.precio_usdt) <= 0) {
      setError('El precio debe ser mayor a 0');
      return false;
    }

    if (!formData.cantidad_min || parseFloat(formData.cantidad_min) <= 0) {
      setError('La cantidad mínima debe ser mayor a 0');
      return false;
    }

    if (!formData.cantidad_max || parseFloat(formData.cantidad_max) <= 0) {
      setError('La cantidad máxima debe ser mayor a 0');
      return false;
    }

    if (parseFloat(formData.cantidad_min) >= parseFloat(formData.cantidad_max)) {
      setError('La cantidad mínima debe ser menor que la máxima');
      return false;
    }

    if (formData.metodo_pago === 'transferencia_bancaria' && !formData.banco_nombre) {
      setError('Selecciona un banco para transferencias bancarias');
      return false;
    }

    if (formData.metodo_pago === 'transferencia_bancaria' && 
        (!formData.datos_bancarios.titular || !formData.datos_bancarios.numero_cuenta)) {
      setError('Completa los datos bancarios');
      return false;
    }

    if (formData.metodo_pago === 'billetera_digital' && 
        (!formData.billetera_digital.tipo || !formData.billetera_digital.numero)) {
      setError('Completa los datos de la billetera digital');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const offerData = {
        ...formData,
        wallet,
        precio_usdt: parseFloat(formData.precio_usdt),
        cantidad_min: parseFloat(formData.cantidad_min),
        cantidad_max: parseFloat(formData.cantidad_max),
        tiempo_limite: parseInt(formData.tiempo_limite)
      };

      const response = await p2pService.createP2POffer(offerData);
      
      // Verificar si la respuesta es de modo offline
      if (response._offline) {
        setSuccess('Oferta creada en modo offline. Se sincronizará cuando el servidor esté disponible.');
      } else {
        setSuccess('¡Oferta creada exitosamente!');
      }
      
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess(response.data);
      }, 2000);
    } catch (error) {
      console.error('Error creating offer:', error);
      
      // Mejorar el mensaje de error
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        setError('Error de conexión al servidor. Verifica tu conexión a internet.');
      } else {
        setError(error.response?.data?.error || 'Error al crear la oferta');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Nueva Oferta">
      <ModalContent>
        <FormTitle>Crear una nueva oferta</FormTitle>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <FormSubtitle>¿Estás comprando o vendiendo criptomonedas?</FormSubtitle>
            <RadioGroup>
              <RadioLabel checked={formData.tipo === 'compra'}>
                <RadioInput 
                  type="radio" 
                  name="tipo" 
                  value="compra" 
                  checked={formData.tipo === 'compra'} 
                  onChange={handleChange}
                />
                <span>Comprar USDT</span>
              </RadioLabel>
              <RadioLabel checked={formData.tipo === 'venta'}>
                <RadioInput 
                  type="radio" 
                  name="tipo" 
                  value="venta" 
                  checked={formData.tipo === 'venta'} 
                  onChange={handleChange}
                />
                <span>Vender USDT</span>
              </RadioLabel>
            </RadioGroup>
          </FormGroup>

          <FormGroup>
            <FormSubtitle>¿En qué ubicación quieres anunciar tu oferta?</FormSubtitle>
            <Select 
              name="pais_codigo" 
              value={formData.pais_codigo} 
              onChange={handleChange}
            >
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <FormSubtitle>¿Qué moneda estás {formData.tipo === 'compra' ? 'ofreciendo' : 'aceptando'}?</FormSubtitle>
            <Select 
              name="moneda_local" 
              value={formData.moneda_local} 
              onChange={handleChange}
              disabled
            >
              <option value={formData.moneda_local}>{formData.moneda_local}</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <FormSubtitle>¿Qué método de pago quieres aceptar?</FormSubtitle>
            <Select 
              name="metodo_pago" 
              value={formData.metodo_pago} 
              onChange={handleChange}
            >
              {paymentMethods.map(method => (
                <option key={method.id} value={method.id}>
                  {method.icon} {method.name}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <FormSubtitle>¿Cómo quieres establecer tu precio?</FormSubtitle>
            <RadioGroup>
              <RadioLabel checked={formData.precio_tipo === 'fijo'}>
                <RadioInput 
                  type="radio" 
                  name="precio_tipo" 
                  value="fijo" 
                  checked={formData.precio_tipo === 'fijo'} 
                  onChange={(e) => setFormData({...formData, precio_tipo: e.target.value})}
                />
                <span>Precio fijo</span>
              </RadioLabel>
              <RadioLabel checked={formData.precio_tipo === 'dinamico'}>
                <RadioInput 
                  type="radio" 
                  name="precio_tipo" 
                  value="dinamico" 
                  checked={formData.precio_tipo === 'dinamico'} 
                  onChange={(e) => setFormData({...formData, precio_tipo: e.target.value})}
                />
                <span>Precio dinámico</span>
              </RadioLabel>
            </RadioGroup>
            
            <FormRow>
              <Input 
                type="number" 
                name="precio_usdt" 
                value={formData.precio_usdt} 
                onChange={handleChange}
                placeholder="Ingresa el precio"
                step="0.01"
                min="0.01"
                required
              />
              <Input 
                type="text" 
                value={formData.moneda_local} 
                readOnly
                style={{ width: '100px', textAlign: 'center' }}
              />
            </FormRow>
            
            {referencePrices && referencePrices[formData.pais_codigo] && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                Precio de referencia: {referencePrices[formData.pais_codigo].price} {formData.moneda_local}
              </div>
            )}
          </FormGroup>

          <FormGroup>
            <FormSubtitle>¿Cuáles son los límites de trading para este intercambio?</FormSubtitle>
            <FormRow>
              <FormGroup>
                <Label>Cantidad Mínima (USDT)</Label>
                <Input 
                  type="number" 
                  name="cantidad_min" 
                  value={formData.cantidad_min} 
                  onChange={handleChange}
                  placeholder="Mínimo"
                  step="1"
                  min="1"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Cantidad Máxima (USDT)</Label>
                <Input 
                  type="number" 
                  name="cantidad_max" 
                  value={formData.cantidad_max} 
                  onChange={handleChange}
                  placeholder="Máximo"
                  step="1"
                  min="1"
                  required
                />
              </FormGroup>
            </FormRow>
          </FormGroup>

          <FormGroup>
            <FormSubtitle>Tiempo límite para completar el pago</FormSubtitle>
            <Select 
              name="tiempo_limite" 
              value={formData.tiempo_limite} 
              onChange={handleChange}
              required
            >
              <option value="15">15 minutos</option>
              <option value="30">30 minutos</option>
              <option value="45">45 minutos</option>
              <option value="60">60 minutos</option>
            </Select>
          </FormGroup>

        {formData.metodo_pago === 'transferencia_bancaria' && (
          <FormGroup>
            <FormSubtitle>Detalles de la cuenta bancaria</FormSubtitle>
            <Select 
              name="banco_nombre" 
              value={formData.banco_nombre} 
              onChange={handleBankChange}
              required
            >
              <option value="">Selecciona un banco</option>
              {banks.map(bank => (
                <option key={bank.nombre} value={bank.nombre}>
                  {bank.nombre}
                </option>
              ))}
            </Select>

            <FormRow>
              <FormGroup>
                <Label>Titular de la Cuenta</Label>
                <Input 
                  type="text" 
                  name="datos_bancarios.titular" 
                  value={formData.datos_bancarios.titular} 
                  onChange={handleChange}
                  placeholder="Nombre completo del titular"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Número de Cuenta</Label>
                <Input 
                  type="text" 
                  name="datos_bancarios.numero_cuenta" 
                  value={formData.datos_bancarios.numero_cuenta} 
                  onChange={handleChange}
                  placeholder="Número de cuenta"
                  required
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label>Tipo de Cuenta</Label>
              <Select 
                name="datos_bancarios.tipo_cuenta" 
                value={formData.datos_bancarios.tipo_cuenta} 
                onChange={handleChange}
              >
                <option value="Ahorros">Ahorros</option>
                <option value="Corriente">Corriente</option>
              </Select>
            </FormGroup>
          </FormGroup>
        )}

        {formData.metodo_pago === 'billetera_digital' && (
          <FormGroup>
            <FormSubtitle>Detalles de la billetera digital</FormSubtitle>
            <FormRow>
              <FormGroup>
                <Label>Tipo de Billetera</Label>
                <Input 
                  type="text" 
                  name="billetera_digital.tipo" 
                  value={formData.billetera_digital.tipo} 
                  onChange={handleChange}
                  placeholder="Ej: Nequi, Daviplata, etc."
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Número/Usuario</Label>
                <Input 
                  type="text" 
                  name="billetera_digital.numero" 
                  value={formData.billetera_digital.numero} 
                  onChange={handleChange}
                  placeholder="Número o usuario de la billetera"
                  required
                />
              </FormGroup>
            </FormRow>
          </FormGroup>
        )}

        <FormGroup>
          <FormSubtitle>¿Cuáles son los términos y condiciones para operar contigo?</FormSubtitle>
          <TextArea 
            name="instrucciones" 
            value={formData.instrucciones} 
            onChange={handleChange}
            placeholder="Escribe aquí tus instrucciones específicas para el pago y cualquier otra condición importante para la operación."
          />
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
            No incluyas información personal en tus términos ya que será visible públicamente.
          </div>
        </FormGroup>

        <FormGroup>
          <FormSubtitle>Información adicional (opcional)</FormSubtitle>
          <TextArea 
            name="descripcion" 
            value={formData.descripcion} 
            onChange={handleChange}
            placeholder="Añade cualquier información adicional que quieras compartir sobre tu oferta."
          />
        </FormGroup>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
          <Button type="button" variant="secondary" onClick={onClose} style={{ minWidth: '120px' }}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={loading} 
            style={{ 
              minWidth: '200px', 
              background: 'var(--color-success)', 
              fontSize: '1rem',
              padding: '0.75rem 1.5rem'
            }}
          >
            {loading ? 'Creando...' : 'Crear Oferta'}
          </Button>
        </div>
      </form>
    </ModalContent>
    </Modal>
  );
};

export default CreateP2POfferModal;