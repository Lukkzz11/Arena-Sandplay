import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import emailjs from '@emailjs/browser';

function Reserva() {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [duracao, setDuracao] = useState('');
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const navigate = useNavigate();

  const telefoneRef = useRef(null);
  const dataRef = useRef(null);
  const horarioRef = useRef(null);
  const duracaoRef = useRef(null);

  // Listener para detectar mudança de tamanho de tela
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    if (!numeros) return '';
    if (numeros.length <= 2) return `(${numeros}`;
    if (numeros.length <= 3) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 3)}.${numeros.slice(3)}`;
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 3)}.${numeros.slice(3, 7)}-${numeros.slice(7, 11)}`;
  };

  const handleTelefoneChange = (e) => {
    setTelefone(formatarTelefone(e.target.value));
  };

  const abrirSeletor = (ref) => {
    if (ref.current && ref.current.showPicker) {
      try { ref.current.showPicker(); } catch (err) { ref.current.focus(); }
    }
  };

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter' && nextRef) {
      e.preventDefault();
      nextRef.current.focus();
      setTimeout(() => abrirSeletor(nextRef), 50);
    }
  };

const reservar = async () => {
    if (!nome || !telefone || !data || !horario || !duracao) {
      alert('Preencha todos os campos!');
      return;
    }
    setLoading(true);
    try {
      const q = query(
        collection(db, 'reservas'),
        where('data', '==', data),
        where('horario', '==', horario)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        alert('Esse horário exato já está reservado!');
        setLoading(false);
        return;
      }

      // --- AJUSTE AQUI: Limpeza do número para o link ---
      const apenasNumeros = telefone.replace(/\D/g, '');
      const whatsappLimpo = apenasNumeros.startsWith('55') ? apenasNumeros : `55${apenasNumeros}`;
      // ------------------------------------------------

      const dataLimpa = data.replace(/-/g, '');
      const horaLimpa = horario.replace(/:/g, '');
      const dataInicio = `${dataLimpa}T${horaLimpa}00`;
      const horaFimNum = (parseInt(horaLimpa.substring(0, 2)) + 1).toString().padStart(2, '0');
      const dataFim = `${dataLimpa}T${horaFimNum}${horaLimpa.substring(2)}00`;
      const linkAgenda = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('RESERVA: ' + nome)}&details=${encodeURIComponent('Whats: ' + telefone + ' | Duração: ' + duracao)}&dates=${dataInicio}/${dataFim}&ctz=America/Recife`;

      await addDoc(collection(db, 'reservas'), { nome, telefone, data, horario, duracao, createdAt: new Date() });
      
      // Enviando whatsappLimpo para o link e telefone (formatado) para o texto
      await emailjs.send('service_233qjjw', 'template_50j4t97', { 
        nome, 
        whatsapp: whatsappLimpo, 
        whatsapp_display: telefone, 
        data, 
        horario, 
        duracao, 
        linkAgenda 
      }, 'KXItBnd5tPOtCMzC8');

      navigate('/pagamento', { state: { nome, data, horario, telefone, duracao } });
    } catch (error) {
      console.error(error);
      alert('Erro ao processar reserva.');
    } finally {
      setLoading(false);
    }
  };
  const styles = {
    page: { 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      backgroundColor: '#FFFFFF', 
      fontFamily: "'Poppins', sans-serif", 
      color: '#00002B',
      paddingBottom: '40px'
    },
    topBarContainer: { width: '100%', display: 'flex', flexDirection: 'column' },
    stripeBlue: { width: '100%', height: '12px', backgroundColor: '#00002B' },
    stripeYellow: { width: '100%', height: '8px', backgroundColor: '#FDCC1A' },
    card: { 
      background: '#fff', 
      padding: isMobile ? '30px 15px' : '50px 40px', 
      width: '90%', 
      maxWidth: '550px', 
      border: '3px solid #00002B', 
      boxShadow: isMobile ? '12px 12px 0px #FDCC1A' : '20px 20px 0px #FDCC1A', 
      textAlign: 'center', 
      marginTop: isMobile ? '20px' : '40px' 
    },
    label: { textAlign: 'left', display: 'block', fontSize: '11px', fontWeight: '800', marginBottom: '5px', color: '#00002B', textTransform: 'uppercase' },
    input: { 
      width: '100%', 
      padding: isMobile ? '14px' : '18px', 
      marginBottom: '15px', 
      borderRadius: '0px', 
      border: '2px solid #00002B', 
      fontSize: isMobile ? '16px' : '18px', 
      outline: 'none', 
      boxSizing: 'border-box', 
      fontFamily: 'inherit', 
      backgroundColor: 'white',
      WebkitAppearance: 'none' // Remove sombras internas no iOS
    },
    button: { 
      width: '100%', 
      padding: '18px', 
      border: '2px solid #00002B', 
      background: hover ? '#FDCC1A' : '#00002B', 
      color: hover ? '#00002B' : '#FFFFFF', 
      fontWeight: '900', 
      fontSize: isMobile ? '16px' : '18px', 
      cursor: 'pointer', 
      transition: '0.2s all ease', 
      textTransform: 'uppercase', 
      letterSpacing: '1px',
      marginTop: '10px'
    },
    mensalistaBox: { 
      marginTop: '20px', 
      padding: '15px', 
      border: '2px dashed #00002B', 
      cursor: 'pointer', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: '10px', 
      fontWeight: '800', 
      fontSize: isMobile ? '13px' : '15px',
      transition: '0.2s' 
    },
    backLink: { 
      marginTop: '25px', 
      display: 'inline-block', 
      color: '#00002B', 
      fontSize: '12px', 
      fontWeight: '700', 
      cursor: 'pointer', 
      textTransform: 'uppercase', 
      letterSpacing: '1px',
      textDecoration: 'underline'
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.topBarContainer}>
        <div style={styles.stripeBlue}></div>
        <div style={styles.stripeYellow}></div>
      </div>
      <div style={styles.card}>
        <h1 style={{fontSize: isMobile ? '28px' : '36px', fontWeight: '900', margin: '0 0 5px 0', lineHeight: '1.1'}}>
          RESERVAR <span style={{color: '#FDCC1A'}}>QUADRA</span>
        </h1>
        <p style={{marginBottom: isMobile ? '20px' : '35px', color: '#666', fontWeight: '600', fontSize: '13px'}}>Arena Sandplay Caruaru</p>
        
        <label style={styles.label}>Quem vai jogar?</label>
        <input style={styles.input} type="text" placeholder="NOME COMPLETO" value={nome} onChange={(e) => setNome(e.target.value.toUpperCase())} onKeyDown={(e) => handleKeyDown(e, telefoneRef)} autoFocus />
        
        <label style={styles.label}>WhatsApp:</label>
        <input ref={telefoneRef} style={styles.input} type="tel" placeholder="(XX) X.XXXX-XXXX" value={telefone} onChange={handleTelefoneChange} onKeyDown={(e) => handleKeyDown(e, dataRef)} maxLength={17} />
        
        <label style={styles.label}>Data do jogo:</label>
        <input ref={dataRef} style={styles.input} type="date" value={data} onChange={(e) => setData(e.target.value)} onClick={() => abrirSeletor(dataRef)} onKeyDown={(e) => handleKeyDown(e, horarioRef)} />
        
        <label style={styles.label}>Horário de início:</label>
        <input ref={horarioRef} style={styles.input} type="time" value={horario} onChange={(e) => setHorario(e.target.value)} onClick={() => abrirSeletor(horarioRef)} onKeyDown={(e) => handleKeyDown(e, duracaoRef)} />
        
        <label style={styles.label}>Tempo de permanência:</label>
        <select ref={duracaoRef} style={styles.input} value={duracao} onChange={(e) => setDuracao(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && reservar()} >
          <option value="">SELECIONE A DURAÇÃO</option>
          <option value="1h">1 HORA (R$ 90)</option>
          <option value="1h30">1 HORA E 30 MIN (R$ 110)</option>
          <option value="2h">2 HORAS (R$ 120)</option>
          <option value="3h">3 HORAS (R$ 150)</option>
          <option value="4h">4 HORAS (R$ 200)</option>
        </select>
        
        <button style={styles.button} onClick={reservar} disabled={loading} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} >
          {loading ? 'PROCESSANDO...' : 'CONFIRMAR AGORA'}
        </button>
        
        <div style={styles.mensalistaBox} 
             onClick={() => window.open('https://wa.me/5581998805031?text=Quero+ser+mensalista', '_blank')}
             onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FDCC1A'} 
             onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} >
          🏆 QUERO SER MENSALISTA
        </div>
        
        <div onClick={() => navigate('/')} style={styles.backLink}>← CANCELAR</div>
      </div>
      <footer style={{padding: '20px', opacity: 0.6, fontSize: '11px', textAlign: 'center', fontWeight: '700'}}>
        ARENA SANDPLAY • CARUARU PE
      </footer>
    </div>
  );
}

export default Reserva;