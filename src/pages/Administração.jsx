import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';

const Administração = () => {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renovados, setRenovados] = useState({});
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [editando, setEditando] = useState(false);
  const navigate = useNavigate();

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [sM, sD] = await Promise.all([
        getDocs(collection(db, "mensalistas")),
        getDocs(collection(db, "diaristas"))
      ]);
      const dM = sM.docs.map(d => ({ id: d.id, tipoCol: 'mensalistas', ...d.data() }));
      const dD = sD.docs.map(d => ({ id: d.id, tipoCol: 'diaristas', ...d.data() }));
      const consolidado = [...dM, ...dD].sort((a, b) => a.horario.localeCompare(b.horario));
      setLista(consolidado);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { carregarDados(); }, []);

  const salvarEdicao = async (e) => {
    e.preventDefault();
    try {
      const ref = doc(db, itemSelecionado.tipoCol, itemSelecionado.id);
      
      // Se for Diarista, precisamos garantir que o valor seja extraído se mudarem o pacote
      let valorFinal = itemSelecionado.valor;
      if (itemSelecionado.tipo === 'DIARISTA' && itemSelecionado.tempoPermanencia.includes('-')) {
        valorFinal = itemSelecionado.tempoPermanencia.split('-').trim();
      }

      const dadosParaSalvar = { ...itemSelecionado, valor: valorFinal };
      await updateDoc(ref, dadosParaSalvar);

      await emailjs.send('service_233qjjw', 'template_50j4t97', {
        nome: itemSelecionado.nome,
        whatsapp: itemSelecionado.telefone.replace(/\D/g, ''),
        data: itemSelecionado.tipo === 'MENSALISTA' ? `MENSALISTA (${itemSelecionado.mes})` : itemSelecionado.dataJogo,
        horario: itemSelecionado.horario,
        status: "⚠️ AGENDAMENTO ATUALIZADO"
      }, 'KXItBnd5tPOtCMzC8');

      alert("✅ Atualizado e Cliente Notificado!");
      setEditando(false);
      setItemSelecionado(null);
      carregarDados();
    } catch (e) { alert("Erro ao salvar edição"); }
  };

  const handleRenovar = async (id, colecao) => {
    try {
      await updateDoc(doc(db, colecao, id), { ultimaRenovacao: new Date().toISOString() });
      setRenovados(prev => ({ ...prev, [id]: true }));
      setTimeout(() => setRenovados(prev => ({ ...prev, [id]: false })), 3000);
    } catch (e) { alert("Erro ao renovar"); }
  };

  const excluirRegistro = async (id, colecao, nome) => {
    if (window.confirm(`Apagar ${nome}?`)) {
      try {
        await deleteDoc(doc(db, colecao, id));
        carregarDados();
      } catch (e) { alert("Erro ao excluir"); }
    }
  };

  const styles = {
    main: { maxWidth: '1100px', margin: '20px auto', padding: '0 20px', fontFamily: "'Poppins', sans-serif" },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    gridBotoes: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' },
    cardAcao: { background: '#FFF', padding: '25px', border: '3px solid #000', boxShadow: '8px 8px 0px #FDCC1A', cursor: 'pointer', textAlign: 'center' },
    item: { padding: '20px', border: '2px solid #000', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFF', boxShadow: '4px 4px 0px #000', cursor: 'pointer' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { background: '#FFF', padding: '30px', border: '4px solid #000', width: '90%', maxWidth: '550px', boxShadow: '15px 15px 0px #FDCC1A', position: 'relative', maxHeight: '90vh', overflowY: 'auto' },
    input: { width: '100%', padding: '12px', marginBottom: '12px', border: '2px solid #000', fontWeight: 'bold', boxSizing: 'border-box' },
    label: { fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }
  };

  return (
    <div style={styles.main}>
      <header style={styles.header}>
        <h1 style={{ fontWeight: '900' }}>PAINEL <span style={{ color: '#FDCC1A' }}>ARENA</span></h1>
        <button onClick={carregarDados} style={{ fontWeight: '900', border: 'none', background: 'none', cursor: 'pointer' }}>🔄 ATUALIZAR</button>
      </header>

      <div style={styles.gridBotoes}>
        <div style={styles.cardAcao} onClick={() => navigate('/mensalistas-adm')}><h2>+ MENSALISTA</h2></div>
        <div style={styles.cardAcao} onClick={() => navigate('/diaristas-adm')}><h2>+ DIARISTA</h2></div>
      </div>

      <h3 style={{ fontWeight: '900', textTransform: 'uppercase' }}>Lista de Agendamentos</h3>
      {loading ? <p>Carregando...</p> : lista.map(m => (
        <div key={m.id} style={styles.item} onClick={() => { setItemSelecionado(m); setEditando(false); }}>
          <div style={{ flex: 1 }}>
            <span style={{ background: m.tipo === 'MENSALISTA' ? '#000' : '#FDCC1A', color: m.tipo === 'MENSALISTA' ? '#FFF' : '#000', padding: '2px 8px', fontSize: '10px', fontWeight: '900' }}>{m.tipo}</span>
            <p style={{ fontWeight: '900', fontSize: '18px', margin: '5px 0' }}>{m.nome}</p>
            <div style={{ fontSize: '13px', fontWeight: '700' }}>🕒 {m.horario} | {m.tipo === 'MENSALISTA' ? `Dia ${m.diaSemana}` : m.dataJogo}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
            {m.tipo === 'MENSALISTA' && (
              <button style={{ background: renovados[m.id] ? '#2ecc71' : '#FFF', border: '2px solid #000', fontWeight: '900', padding: '8px' }} onClick={() => handleRenovar(m.id, m.tipoCol)}>RENOVAR</button>
            )}
            <button style={{ background: '#FDCC1A', border: '2px solid #000', fontWeight: '900', padding: '8px' }} onClick={() => { setItemSelecionado(m); setEditando(true); }}>EDITAR</button>
            <button style={{ background: '#FF4D4D', color: '#FFF', border: '2px solid #000', fontWeight: '900', padding: '8px' }} onClick={() => excluirRegistro(m.id, m.tipoCol, m.nome)}>X</button>
          </div>
        </div>
      ))}

      {itemSelecionado && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button style={{ position: 'absolute', top: '10px', right: '10px', background: '#000', color: '#FFF', border: 'none', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => { setItemSelecionado(null); setEditando(false); }}>X</button>
            <h2 style={{ fontWeight: '900' }}>{editando ? 'EDITAR REGISTRO' : 'DETALHES COMPLETO'}</h2>
            <hr style={{ border: '2px solid #000', marginBottom: '20px' }} />

            {editando ? (
              <form onSubmit={salvarEdicao}>
                <label style={styles.label}>Nome:</label>
                <input style={styles.input} value={itemSelecionado.nome} onChange={e => setItemSelecionado({...itemSelecionado, nome: e.target.value.toUpperCase()})} />
                
                <label style={styles.label}>WhatsApp:</label>
                <input style={styles.input} value={itemSelecionado.telefone} onChange={e => setItemSelecionado({...itemSelecionado, telefone: e.target.value})} />

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Horário:</label>
                    <input type="time" style={styles.input} value={itemSelecionado.horario} onChange={e => setItemSelecionado({...itemSelecionado, horario: e.target.value})} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Valor Atual:</label>
                    <input style={styles.input} value={itemSelecionado.valor} onChange={e => setItemSelecionado({...itemSelecionado, valor: e.target.value})} />
                  </div>
                </div>

                {itemSelecionado.tipo === 'MENSALISTA' ? (
                  <>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={styles.label}>Duração (h):</label>
                        <select style={styles.input} value={itemSelecionado.duracao} onChange={e => setItemSelecionado({...itemSelecionado, duracao: e.target.value})}>
                          <option value="1">1h</option><option value="1.5">1:30h</option><option value="2">2h</option><option value="3">3h</option><option value="4">4h</option>
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={styles.label}>Dia Semana:</label>
                        <select style={styles.input} value={itemSelecionado.diaSemana} onChange={e => setItemSelecionado({...itemSelecionado, diaSemana: e.target.value})}>
                          <option value="1">Segunda</option><option value="2">Terça</option><option value="3">Quarta</option><option value="4">Quinta</option><option value="5">Sexta</option><option value="6">Sábado</option><option value="0">Domingo</option>
                        </select>
                      </div>
                    </div>
                    <label style={styles.label}>Mês:</label>
                    <select style={styles.input} value={itemSelecionado.mes} onChange={e => setItemSelecionado({...itemSelecionado, mes: e.target.value})}>
                      {["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].map(m => <option key={m}>{m}</option>)}
                    </select>
                  </>
                ) : (
                  <>
                    <label style={styles.label}>Data do Jogo:</label>
                    <input type="date" style={styles.input} value={itemSelecionado.dataJogo} onChange={e => setItemSelecionado({...itemSelecionado, dataJogo: e.target.value})} />
                    <label style={styles.label}>Pacote/Tempo:</label>
                    <select style={styles.input} value={itemSelecionado.tempoPermanencia} onChange={e => setItemSelecionado({...itemSelecionado, tempoPermanencia: e.target.value})}>
                      <option value="1 hr - R$ 90">1 hr - R$ 90</option><option value="1:30 hr - R$ 110">1:30 hr - R$ 110</option><option value="2 hr - R$ 120">2 hr - R$ 120</option><option value="3 hr - R$ 150">3 hr - R$ 150</option><option value="4 hr - R$ 200">4 hr - R$ 200</option>
                    </select>
                  </>
                )}
                <button type="submit" style={{ ...styles.input, background: '#000', color: '#FFF', cursor: 'pointer', marginTop: '10px' }}>SALVAR E NOTIFICAR CLIENTE</button>
              </form>
            ) : (
              <div style={{ fontWeight: 'bold', fontSize: '15px' }}>
                <p>📌 TIPO: {itemSelecionado.tipo}</p>
                <p>👤 NOME: {itemSelecionado.nome}</p>
                <p>📞 WHATSAPP: {itemSelecionado.telefone}</p>
                <p>🕒 HORÁRIO: {itemSelecionado.horario}</p>
                <p>💰 VALOR: {itemSelecionado.valor}</p>
                {itemSelecionado.tipo === 'MENSALISTA' ? (
                  <>
                    <p>⏳ DURAÇÃO: {itemSelecionado.duracao}h</p>
                    <p>📅 DIA: {itemSelecionado.diaSemana}</p>
                    <p>🗓 MÊS: {itemSelecionado.mes}</p>
                  </>
                ) : (
                  <>
                    <p>📅 DATA: {itemSelecionado.dataJogo}</p>
                    <p>⏳ PACOTE: {itemSelecionado.tempoPermanencia}</p>
                  </>
                )}
                <button onClick={() => setEditando(true)} style={{ width: '100%', padding: '12px', background: '#FDCC1A', border: '2px solid #000', fontWeight: '900', marginTop: '15px', cursor: 'pointer' }}>EDITAR INFORMAÇÕES</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Administração;