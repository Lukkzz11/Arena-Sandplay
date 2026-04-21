import { BrowserRouter, Routes, Route } from 'react-router-dom';

// ✅ tudo minúsculo (PADRÃO)
import Home from './pages/Home';
import Reserva from './pages/Reserva';
import Pagamento from './pages/Pagamento';
import AdminMensalistas from './pages/AdminMensalistas';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reserva" element={<Reserva />} />
        <Route path="/pagamento" element={<Pagamento />} />
        <Route path="/admin-mensalistas" element={<AdminMensalistas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;