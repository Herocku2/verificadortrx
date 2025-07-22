import React from 'react';
import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import { useUser } from './context/UserContext';
import { isAdminWallet } from './services/api';
import TestComponent from './TestComponent';

// Componentes
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Páginas principales
import HomePage from './pages/HomePage';
import ScannerPage from './pages/ScannerPage';
import PricingPage from './pages/PricingPage';
import ResultsPage from './pages/ResultsPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelPage from './pages/PaymentCancelPage';
import NotFoundPage from './pages/NotFoundPage';

// Páginas de administración
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPayments from './pages/admin/AdminPayments';
import AdminSettings from './pages/admin/AdminSettings';
import AdminResellers from './pages/admin/AdminResellers';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 20px 0;
`;

// Componente para proteger rutas de administrador
const AdminRoute = ({ children }) => {
  const { wallet } = useUser();
  
  if (!wallet || !isAdminWallet(wallet)) {
    return <NotFoundPage />;
  }
  
  return (
    <div style={{ display: 'flex' }}>
      {children}
    </div>
  );
};

function App() {
  return (
    <AppContainer>
      <Navbar />
      <MainContent>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/scanner" element={<ScannerPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/results/:wallet" element={<ResultsPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/cancel" element={<PaymentCancelPage />} />
          
          {/* Rutas de administración */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          } />
          <Route path="/admin/payments" element={
            <AdminRoute>
              <AdminPayments />
            </AdminRoute>
          } />
          <Route path="/admin/settings" element={
            <AdminRoute>
              <AdminSettings />
            </AdminRoute>
          } />
          <Route path="/admin/resellers" element={
            <AdminRoute>
              <AdminResellers />
            </AdminRoute>
          } />
          
          {/* Ruta 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MainContent>
      <Footer />
    </AppContainer>
  );
}

export default App;