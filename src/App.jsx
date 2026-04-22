import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// ✅ Imports das páginas
import Home from './pages/Home';
import Reserva from './pages/Reserva';
import Pagamento from './pages/Pagamento';
import Administração from './pages/Administração'; // Nome atualizado aqui
import Login from './pages/Login';

// --- COMPONENTE DE PROTEÇÃO ---
const PrivateRoute = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null; 
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/reserva" element={<Reserva />} />
        <Route path="/pagamento" element={<Pagamento />} />
        <Route path="/login" element={<Login />} />

        {/* Rota Protegida (Só entra com login) */}
        <Route 
          path="/administracao" 
          element={
            <PrivateRoute>
              <Administração /> {/* Nome atualizado aqui */}
            </PrivateRoute>
          } 
        />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;