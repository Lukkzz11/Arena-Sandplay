import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

// Importando todas as imagens da sua pasta assets
import pix90Img from '../assets/Pix 90 reais.png';
import pix110Img from '../assets/Pix 110 reais.png';
import pix120Img from '../assets/Pix 120 reais.png';
import pix150Img from '../assets/Pix 150 reais.png';
import pix200Img from '../assets/Pix 200 reais.png';

function Pagamento() {
  const location = useLocation();
  const navigate = useNavigate();
  const [copiado, setCopiado] = useState(false);

  // Recupera os dados da reserva
  const { nome, data, horario, duracao } = location.state || {};

  // TABELA COMPLETA DE PREÇOS E CÓDIGOS
  // TABELA DE PREÇOS ATUALIZADA
  const pixConfig = {
    "1h": {
      valor: "90,00",
      imagem: pix90Img,
      copiaCola: "00020126580014br.gov.bcb.pix013646f710fd-90fd-44e0-a9b6-77fc7bbbea30520400005303986540590.005802BR5922LUCAS EMANOEL DA SILVA6006Brasil62290525202604210122F3WBOGOC333IG6304D01D"
    },
    "1h30": {
      valor: "110,00",
      imagem: pix110Img,
      copiaCola: "00020126580014br.gov.bcb.pix013646f710fd-90fd-44e0-a9b6-77fc7bbbea305204000053039865406110.005802BR5922LUCAS EMANOEL DA SILVA6006Brasil62290525202604210138UEXGBHB5UU37B6304EB91"
    },
    "2h": {
      valor: "120,00",
      imagem: pix120Img,
      copiaCola: "00020126580014br.gov.bcb.pix013646f710fd-90fd-44e0-a9b6-77fc7bbbea305204000053039865406120.005802BR5922LUCAS EMANOEL DA SILVA6006Brasil62290525202604210137OKSVI6L0OEXV36304DD6C"
    },
    "3h": {
      valor: "150,00",
      imagem: pix150Img,
      copiaCola: "00020126580014br.gov.bcb.pix013646f710fd-90fd-44e0-a9b6-77fc7bbbea305204000053039865406150.005802BR5922LUCAS EMANOEL DA SILVA6006Brasil6229052520260421012960GH7C78X996I630451F6"
    },
    "4h": {
      valor: "200,00",
      imagem: pix200Img,
      copiaCola: "00020126580014br.gov.bcb.pix013646f710fd-90fd-44e0-a9b6-77fc7bbbea305204000053039865406200.005802BR5922LUCAS EMANOEL DA SILVA6006Brasil62290525202604210137FKMQFU7F07UK963040F7F"
    }
  };
  // Seleciona a configuração baseada na duração. Padrão: 1h.
  const atual = pixConfig[duracao] || pixConfig["1h"];

  const copiarPix = () => {
    navigator.clipboard.writeText(atual.copiaCola);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleWhatsApp = () => {
    const mensagem = `Oi! Fiz uma reserva para o dia ${data} às ${horario} (${duracao}) em nome de ${nome}. Segue o comprovante do PIX de R$ ${atual.valor}:`;
    const url = `https://wa.me/5581998805031?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const styles = {
    page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#FFFFFF', fontFamily: "'Poppins', sans-serif, Arial", color: '#00002B', padding: '20px' },
    card: { background: '#fff', padding: '40px 20px', width: '95%', maxWidth: '500px', border: '3px solid #00002B', boxShadow: '15px 15px 0px #FDCC1A', textAlign: 'center', marginTop: '20px' },
    resumo: { fontSize: '15px', marginBottom: '20px', textAlign: 'left', padding: '15px', borderLeft: '5px solid #FDCC1A', backgroundColor: '#f9f9f9', lineHeight: '1.6' },
    pixBox: { backgroundColor: '#f8f8f8', border: '2px solid #00002B', padding: '20px', margin: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    buttonPrimary: { width: '100%', padding: '15px', backgroundColor: '#00002B', color: '#FFF', border: '2px solid #00002B', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase', marginBottom: '10px' },
    buttonSecondary: { width: '100%', padding: '15px', backgroundColor: '#25D366', color: '#FFF', border: '2px solid #00002B', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase' }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={{fontSize: '28px', fontWeight: '900', marginBottom: '10px'}}>PAGAMENTO</h1>
        
        <div style={styles.resumo}>
          <strong>Detalhes do Jogo:</strong><br/>
          👤 {nome || 'Cliente'}<br/>
          📅 {data} às {horario}<br/>
          ⏱️ Duração: {duracao}<br/>
          💰 <span style={{fontSize: '18px', color: '#00002B'}}>VALOR: <strong>R$ {atual.valor}</strong></span>
        </div>

        <p style={{fontWeight: '700', marginBottom: '5px'}}>Escaneie o QR Code abaixo:</p>

        <div style={styles.pixBox}>
          <img 
            src={atual.imagem} 
            alt="QR Code Pix" 
            style={{width: '210px', height: '210px', marginBottom: '15px', border: '1px solid #000'}}
          />
          <button onClick={copiarPix} style={{...styles.buttonPrimary, fontSize: '12px', backgroundColor: copiado ? '#25D366' : '#00002B'}}>
            {copiado ? '✅ CÓDIGO COPIADO!' : 'COPIAR PIX COPIA E COLA'}
          </button>
        </div>

        <button onClick={handleWhatsApp} style={styles.buttonSecondary}>
          ENVIAR COMPROVANTE AGORA 📱
        </button>

        <p onClick={() => navigate('/')} style={{marginTop: '20px', fontSize: '12px', cursor: 'pointer', fontWeight: '700', textDecoration: 'underline'}}>CANCELAR E VOLTAR</p>
      </div>
    </div>
  );
}

export default Pagamento;