import React, { useState } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';

const DiaristasADM = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    tempoPermanencia: '1 hr - R$ 90',
    horario: '',
    dataJogo: ''
  });

  const handleTelefone = (v) => {
    let n = v.replace(/\D/g, '');
    if (n.length > 11) n = n.slice(0, 11);
    return n.length <= 10 
      ? n.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
      : n.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const salvar = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // BLINDAGEM CONTRA O ERRO DE TRIM:
      // Criamos uma variável simples para o valor
      let valorFinal = "R$ 90";
      
      if (form.tempoPermanencia && form.tempoPermanencia.includes('-')) {
        const partes = form.tempoPermanencia.split('-');
        // Pegamos o segundo item e limpamos espaços de forma segura
        valorFinal = String(partes).trim();
      }

      const dados = {
        nome: form.nome.toUpperCase().trim(),
        telefone: form.telefone,
        valor: valorFinal,
        horario: form.horario,
        dataJogo: form.dataJogo,
        tempoPermanencia: form.tempoPermanencia,
        tipo: 'DIARISTA',
        criadoEm: new Date().toISOString()
      };

      // 1. Salva no Firebase
      await addDoc(collection(db, "diaristas"), dados);

      // 2. Prepara dados para o Link da Agenda (Google Calendar)
      const dataLimpa = form.dataJogo.split('-').join('');
      const horaLimpa = form.horario.split(':').join('');
      const linkAgenda = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('DIARISTA: ' + dados.nome)}&dates=${dataLimpa}T${horaLimpa}00/${dataLimpa}T${horaLimpa}00&ctz=America/Recife`;

      // 3. Envia Notificação via EmailJS
      await emailjs.send(
        'service_233qjjw', 
        'template_50j4t97', 
        {
          nome: dados.nome,
          whatsapp: form.telefone.replace(/\D/g, ''),
          data: form.dataJogo,
          horario: form.horario,
          duracao: form.tempoPermanencia,
          linkAgenda: linkAgenda
        }, 
        'KXItBnd5tPOtCMzC8'
      );

      alert("✅ AGENDAMENTO REALIZADO COM SUCESSO!");
      navigate('/administracao');

    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro crítico: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { maxWidth: '500px', margin: '40px auto', padding: '20px', fontFamily: "'Poppins', sans-serif" },
    card: { background: '#FFF', padding: '25px', border: '3px solid #00002B', boxShadow: '10px 10px 0px #FDCC1A' },
    label: { fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '5px', display: 'block' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', border: '2px solid #00002B', fontWeight: '800', boxSizing: 'border-box', fontSize: '16px' },
    btn: { width: '100%', padding: '15px', background: '#00002B', color: '#FFF', fontWeight: '900', border: 'none', cursor: 'pointer', textTransform: 'uppercase', marginTop: '10px' }
  };

  return (
    <div style={styles.container}>
      <button 
        onClick={() => navigate('/administracao')} 
        style={{ marginBottom: '20px', fontWeight: '900', cursor: 'pointer', background: 'none', border: 'none', color: '#00002B' }}
      >
        ⬅ VOLTAR AO PAINEL
      </button>
      
      <div style={styles.card}>
        <h2 style={{ fontWeight: '900', textTransform: 'uppercase', marginBottom: '20px', textAlign: 'center' }}>
          Novo <span style={{ color: '#FDCC1A' }}>Diarista</span>
        </h2>
        
        <form onSubmit={salvar}>
          <label style={styles.label}>Nome do Cliente:</label>
          <input 
            style={styles.input} 
            placeholder="EX: JOÃO SILVA"
            value={form.nome}
            onChange={e => setForm({...form, nome: e.target.value})} 
            required 
          />
          
          <label style={styles.label}>WhatsApp / Zap:</label>
          <input 
            style={styles.input} 
            placeholder="(81) 9.9999-9999"
            value={form.telefone} 
            onChange={e => setForm({...form, telefone: handleTelefone(e.target.value)})} 
            required 
          />
          
          <label style={styles.label}>Tempo e Valor:</label>
          <select 
            style={styles.input} 
            value={form.tempoPermanencia}
            onChange={e => setForm({...form, tempoPermanencia: e.target.value})}
          >
            <option value="1 hr - R$ 90">1 hr - R$ 90</option>
            <option value="1:30 hr - R$ 110">1:30 hr - R$ 110</option>
            <option value="2 hr - R$ 120">2 hr - R$ 120</option>
            <option value="3 hr - R$ 150">3 hr - R$ 150</option>
            <option value="4 hr - R$ 200">4 hr - R$ 200</option>
          </select>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Horário Início:</label>
              <input 
                type="time" 
                style={styles.input} 
                value={form.horario}
                onChange={e => setForm({...form, horario: e.target.value})} 
                required 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Data do Jogo:</label>
              <input 
                type="date" 
                style={styles.input} 
                value={form.dataJogo}
                onChange={e => setForm({...form, dataJogo: e.target.value})} 
                required 
              />
            </div>
          </div>

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'PROCESSANDO...' : 'CONFIRMAR AGENDAMENTO'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DiaristasADM;