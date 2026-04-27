import React, { useState } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';

const MensalistasADM = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: '', 
    telefone: '', 
    valor: '', 
    horario: '', 
    duracao: '1', 
    mes: 'Janeiro', 
    diaSemana: '1',
    dataInicio: '' // Novo campo para o calendário
  });

  const handleTelefone = (v) => {
    let n = v.replace(/\D/g, '');
    if (n.length > 11) n = n.slice(0, 11);
    return n.length <= 10 
      ? n.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
      : n.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const calcularTermino = (i, d) => {
    if (!i || !i.includes(':')) return "--:--";
    const [h, m] = i.split(':').map(Number);
    const total = h * 60 + m + parseFloat(d) * 60;
    return `${Math.floor(total/60).toString().padStart(2,'0')}:${(total%60).toString().padStart(2,'0')}`;
  };

  const salvar = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dados = {
        ...form,
        nome: form.nome.toUpperCase().trim(),
        tipo: 'MENSALISTA',
        horarioFim: calcularTermino(form.horario, form.duracao),
        criadoEm: new Date().toISOString()
      };

      await addDoc(collection(db, "mensalistas"), dados);

      // CORREÇÃO DO ERRO: Primeiro split, depois pega o index, depois replace
      let dataBase = "";
      if (form.dataInicio) {
        dataBase = form.dataInicio.replace(/-/g, '');
      } else {
        dataBase = new Date().toISOString().split('T').replace(/-/g, '');
      }

      const horaLimpa = form.horario.replace(/:/g, '');
      const link = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('MENSALISTA: ' + dados.nome)}&dates=${dataBase}T${horaLimpa}00/${dataBase}T${horaLimpa}00&ctz=America/Recife`;

      await emailjs.send('service_233qjjw', 'template_50j4t97', {
        nome: dados.nome,
        whatsapp: form.telefone.replace(/\D/g, ''),
        data: `Mensalista - Início: ${form.dataInicio} (${form.mes})`,
        horario: form.horario,
        duracao: `${form.duracao}h`,
        linkAgenda: link
      }, 'KXItBnd5tPOtCMzC8');

      alert("✅ Mensalista cadastrado com sucesso!");
      navigate('/administracao');
    } catch (err) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { maxWidth: '500px', margin: '40px auto', padding: '20px', fontFamily: "'Poppins', sans-serif" },
    card: { background: '#FFF', padding: '25px', border: '3px solid #00002B', boxShadow: '10px 10px 0px #FDCC1A' },
    label: { fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '5px', display: 'block' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', border: '2px solid #00002B', fontWeight: '800', boxSizing: 'border-box' },
    btn: { width: '100%', padding: '15px', background: '#00002B', color: '#FFF', fontWeight: '900', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }
  };

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/administracao')} style={{ marginBottom: '20px', fontWeight: '900', cursor: 'pointer', background: 'none', border: 'none' }}>⬅ VOLTAR</button>
      <div style={styles.card}>
        <h2 style={{ fontWeight: '900', textTransform: 'uppercase' }}>Novo <span style={{ color: '#FDCC1A' }}>Mensalista</span></h2>
        <form onSubmit={salvar}>
          <label style={styles.label}>Nome do Cliente:</label>
          <input style={styles.input} onChange={e => setForm({...form, nome: e.target.value})} required />
          
          <label style={styles.label}>WhatsApp:</label>
          <input style={styles.input} value={form.telefone} onChange={e => setForm({...form, telefone: handleTelefone(e.target.value)})} placeholder="(81) 99999-9999" required />
          
          <label style={styles.label}>Valor Mensal:</label>
          <input style={styles.input} placeholder="R$ 200" onChange={e => setForm({...form, valor: e.target.value})} required />

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Data de Início:</label>
              <input type="date" style={styles.input} onChange={e => setForm({...form, dataInicio: e.target.value})} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Dia da Semana:</label>
              <select style={styles.input} value={form.diaSemana} onChange={e => setForm({...form, diaSemana: e.target.value})}>
                <option value="1">Segunda</option><option value="2">Terça</option><option value="3">Quarta</option>
                <option value="4">Quinta</option><option value="5">Sexta</option><option value="6">Sábado</option><option value="0">Domingo</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Hora Início:</label>
              <input type="time" style={styles.input} onChange={e => setForm({...form, horario: e.target.value})} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Duração:</label>
              <select style={styles.input} value={form.duracao} onChange={e => setForm({...form, duracao: e.target.value})}>
                <option value="1">1 hr</option>
                <option value="1.5">1:30 hr</option>
                <option value="2">2 hr</option>
                <option value="3">3 hr</option>
                <option value="4">4 hr</option>
              </select>
            </div>
          </div>

          <label style={styles.label}>Mês de Referência:</label>
          <select style={styles.input} value={form.mes} onChange={e => setForm({...form, mes: e.target.value})}>
            <option>Janeiro</option><option>Fevereiro</option><option>Março</option><option>Abril</option><option>Maio</option><option>Junho</option>
            <option>Julho</option><option>Agosto</option><option>Setembro</option><option>Outubro</option><option>Novembro</option><option>Dezembro</option>
          </select>

          <div style={{ background: '#00002B', color: '#FFF', padding: '10px', marginBottom: '15px', textAlign: 'center', fontWeight: '900', fontSize: '13px' }}>
            TÉRMINO: {calcularTermino(form.horario, form.duracao)}
          </div>

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'SALVANDO...' : 'CADASTRAR MENSALISTA'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MensalistasADM;