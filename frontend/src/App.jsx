import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <CartProvider>
          <Router>
            <Toaster position="bottom-right" reverseOrder={false} />
            <AppRoutes />
          </Router>
        </CartProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
