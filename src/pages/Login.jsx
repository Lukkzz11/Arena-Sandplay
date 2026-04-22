import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      
      // ✅ Atualizado para a nova rota de Administração
      // Se no seu App.js o 'path' ainda for '/admin-mensalistas', mantenha como estava.
      // Se você mudou o 'path' para '/administracao', altere aqui também.
      navigate('/administracao'); 
      
    } catch (error) {
      alert("ACESSO NEGADO: Credenciais incorretas.");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { 
      maxWidth: '400px', 
      margin: '80px auto', 
      padding: '20px', 
      fontFamily: "'Poppins', sans-serif",
      color: '#00002B' 
    },
    card: { 
      background: '#fff', 
      padding: '40px 30px', 
      border: '3px solid #00002B', 
      boxShadow: '15px 15px 0px #FDCC1A',
      textAlign: 'center'
    },
    label: { 
      display: 'block', 
      fontSize: '11px', 
      fontWeight: '800', 
      marginBottom: '5px', 
      textTransform: 'uppercase',
      textAlign: 'left'
    },
    input: { 
      width: '100%', 
      padding: '15px', 
      marginBottom: '20px', 
      border: '2px solid #00002B', 
      fontSize: '16px', 
      outline: 'none', 
      boxSizing: 'border-box',
      fontFamily: 'inherit'
    },
    btn: { 
      width: '100%', 
      padding: '18px', 
      background: '#00002B', 
      color: 'white', 
      border: '2px solid #00002B', 
      fontWeight: '900', 
      cursor: 'pointer', 
      textTransform: 'uppercase', 
      letterSpacing: '2px',
      marginTop: '10px',
      transition: '0.2s'
    },
    logoArea: {
      marginBottom: '30px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoArea}>
          <h1 style={{ fontWeight: '900', fontSize: '28px', margin: 0 }}>
            ARENA <span style={{ color: '#FDCC1A', WebkitTextStroke: '1px #00002B' }}>SANDPLAY</span>
          </h1>
          <p style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '3px', marginTop: '5px' }}>
            PAINEL ADMINISTRATIVO
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <label style={styles.label}>E-mail de acesso:</label>
          <input 
            style={styles.input} 
            type="email" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <label style={styles.label}>Senha:</label>
          <input 
            style={styles.input} 
            type="password" 
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
          />

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'AUTENTICANDO...' : 'ENTRAR NO SISTEMA'}
          </button>
        </form>
        
        <p style={{ fontSize: '10px', marginTop: '30px', opacity: 0.6, fontWeight: '700' }}>
          PROPRIEDADE EXCLUSIVA ARENA SANDPLAY
        </p>
      </div>
    </div>
  );
};

export default Login;