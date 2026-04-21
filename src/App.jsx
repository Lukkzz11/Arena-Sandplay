import { BrowserRouter, Routes, Route } from 'react-router-dom';

// ✅ tudo minúsculo (PADRÃO)
import Home from './pages/Home';
import Reserva from './pages/Reserva';
import Pagamento from './pages/Pagamento';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reserva" element={<Reserva />} />
        <Route path="/pagamento" element={<Pagamento />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;