import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase'; 
import { collection, query, getDocs, writeBatch, doc, addDoc } from 'firebase/firestore';

const AdminMensalistas = () => {
  const [mensalistas, setMensalistas] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [novoNome, setNovoNome] = useState('');
  const [novoDia, setNovoDia] = useState('1'); 
  const [novoHorario, setNovoHorario] = useState('');
  const [duracao, setDuracao] = useState('1');

  // ✅ Agora busca direto na coleção "mensalistas"
  const carregarMensalistas = async () => {
    try {
      const q = collection(db, "mensalistas"); 
      const querySnapshot = await getDocs(q);
      setMensalistas(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Erro ao buscar mensalistas:", error);
    }
  };

  useEffect(() => { carregarMensalistas(); }, []);

  const calcularTermino = (inicio, horasAdd) => {
    if (!inicio) return "--:--";
    const [h, m] = inicio.split(':').map(Number);
    const totalMinutos = h * 60 + m + parseFloat(horasAdd) * 60;
    const fimH = Math.floor(totalMinutos / 60) % 24;
    const fimM = totalMinutos % 60;
    return `${fimH.toString().padStart(2, '0')}:${fimM.toString().padStart(2, '0')}`;
  };

  const salvarNovoMensalista = async (e) => {
    e.preventDefault();
    if (!novoNome || !novoHorario) return alert("Preencha tudo!");
    
    const horarioFim = calcularTermino(novoHorario, duracao);

    // ✅ Agora salva na coleção "mensalistas"
    await addDoc(collection(db, "mensalistas"), {
      nome: novoNome,
      diaSemana: parseInt(novoDia),
      horario: novoHorario,
      horarioFim: horarioFim,
      duracao: duracao
    });
    
    setNovoNome(''); setNovoHorario('');
    carregarMensalistas();
    alert("Mensalista cadastrado com sucesso!");
  };

  const gerarReservasDoMes = async () => {
  if (mensalistas.length === 0) return alert("Adicione mensalistas primeiro!");
  setLoading(true);
  const batch = writeBatch(db);
  const hoje = new Date();
  let conflitosEncontrados = 0;

  try {
    for (const m of mensalistas) {
      for (let i = 1; i <= 4; i++) {
        const dataReserva = new Date(hoje);
        dataReserva.setDate(hoje.getDate() + ((7 + m.diaSemana - hoje.getDay()) % 7) + (i * 7));
        const dataString = dataReserva.toISOString().split('T');

        // 🔍 PASSO 1: Verificar se já existe QUALQUER reserva nesse dia/horário
        const qConflito = query(
          collection(db, "reservas"),
          where("data", "==", dataString),
          where("horario", "==", m.horario)
        );
        const snapshotConflito = await getDocs(qConflito);

        // Se o snapshot estiver vazio, o horário está livre!
        if (snapshotConflito.empty) {
          const ref = doc(db, "reservas", `${m.id}_${dataString}`);
          batch.set(ref, {
            clienteId: m.id,
            nome: m.nome,
            data: dataString,
            horario: m.horario,
            horarioFim: m.horarioFim,
            tipo: "mensalista",
            status: "confirmado"
          });
        } else {
          conflitosEncontrados++;
          console.warn(`Conflito em ${dataString} às ${m.horario}. Reserva não sobreposta.`);
        }
      }
    }

    await batch.commit();
    
    if (conflitosEncontrados > 0) {
      alert(`Agenda gerada! Mas atenção: ${conflitosEncontrados} horários já estavam ocupados por diaristas e foram pulados para não duplicar.`);
    } else {
      alert("Agenda gerada com sucesso para todos os dias!");
    }

  } catch (e) {
    console.error(e);
    alert("Erro ao gerar agenda");
  }
  setLoading(false);
  carregarMensalistas();
};

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Arena Sandplay - Mensalistas</h2>

      <form onSubmit={salvarNovoMensalista} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h4>Novo Mensalista</h4>
        <input type="text" placeholder="Nome" value={novoNome} onChange={e => setNovoNome(e.target.value)} style={inputStyle} />
        
        <label style={labelStyle}>Dia da Semana:</label>
        <select value={novoDia} onChange={e => setNovoDia(e.target.value)} style={inputStyle}>
          <option value="1">Segunda-feira</option>
          <option value="2">Terça-feira</option>
          <option value="3">Quarta-feira</option>
          <option value="4">Quinta-feira</option>
          <option value="5">Sexta-feira</option>
          <option value="6">Sábado</option>
          <option value="0">Domingo</option>
        </select>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Início:</label>
            <input type="time" value={novoHorario} onChange={e => setNovoHorario(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Duração:</label>
            <select value={duracao} onChange={e => setDuracao(e.target.value)} style={inputStyle}>
              <option value="1">1h</option>
              <option value="1.5">1h30</option>
              <option value="2">2h</option>
              <option value="3">3h</option>
              <option value="4">4h</option>
            </select>
          </div>
        </div>

        <div style={{ background: '#e9ecef', padding: '10px', borderRadius: '4px', marginBottom: '10px', textAlign: 'center' }}>
           Fim previsto: <strong>{calcularTermino(novoHorario, duracao)}</strong>
        </div>

        <button type="submit" style={{ ...btnStyle, backgroundColor: '#28a745' }}>Salvar Mensalista</button>
      </form>

      <button onClick={gerarReservasDoMes} disabled={loading} style={{ ...btnStyle, backgroundColor: '#007bff' }}>
        {loading ? "Processando..." : "🔄 GERAR AGENDA DO MÊS"}
      </button>

      <div style={{ marginTop: '30px' }}>
        <h4>Lista de Mensalistas:</h4>
        {mensalistas.map(m => (
          <div key={m.id} style={{ padding: '10px', borderBottom: '1px solid #eee', fontSize: '14px' }}>
            <strong>{m.nome}</strong> - {m.horario} às {m.horarioFim} (Dia {m.diaSemana})
          </div>
        ))}
      </div>
    </div>
  );
};

const labelStyle = { fontSize: '12px', color: '#666', marginBottom: '5px', display: 'block' };
const inputStyle = { display: 'block', width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '12px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };

export default AdminMensalistas;