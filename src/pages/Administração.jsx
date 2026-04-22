import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase'; 
import { collection, query, getDocs, doc, addDoc, updateDoc, deleteDoc, where } from 'firebase/firestore';

// Função auxiliar para converter "17:30" em 1050 minutos
const converterParaMinutos = (horarioStr) => {
  const [horas, minutos] = horarioStr.split(':').map(Number);
  return horas * 60 + minutos;
};

// ✅ Nome alterado para Administração
const Administração = () => {
  const [mensalistas, setMensalistas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  
  // Estados do Formulário
  const [novoNome, setNovoNome] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [valorAcordado, setValorAcordado] = useState('');
  const [novoDia, setNovoDia] = useState('1'); 
  const [novoHorario, setNovoHorario] = useState('');
  const [duracao, setDuracao] = useState('1');

  // Referências para pular campos com Enter
  const telRef = useRef(null);
  const valorRef = useRef(null);
  const diaRef = useRef(null);
  const inicioRef = useRef(null);
  const duracaoRef = useRef(null);

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

  // Navegação por Teclado
  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      }
    }
  };

  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    if (!numeros) return '';
    if (numeros.length <= 2) return `(${numeros}`;
    if (numeros.length <= 3) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 3)}.${numeros.slice(3)}`;
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 3)}.${numeros.slice(3, 7)}-${numeros.slice(7, 11)}`;
  };

  const formatarMoeda = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    if (!apenasNumeros) return '';
    return `R$ ${apenasNumeros}`;
  };

  const calcularTermino = (inicio, horasAdd) => {
    if (!inicio) return "--:--";
    const [h, m] = inicio.split(':').map(Number);
    const totalMinutos = h * 60 + m + parseFloat(horasAdd) * 60;
    const fimH = Math.floor(totalMinutos / 60) % 24;
    const fimM = totalMinutos % 60;
    return `${fimH.toString().padStart(2, '0')}:${fimM.toString().padStart(2, '0')}`;
  };

  const prepararEdicao = (m) => {
    setEditandoId(m.id);
    setNovoNome(m.nome.toUpperCase());
    setNovoTelefone(m.telefone);
    setValorAcordado(m.valor.includes('R$') ? m.valor : `R$ ${m.valor}`);
    setNovoDia(m.diaSemana.toString());
    setNovoHorario(m.horario);
    setDuracao(m.duracao);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const limparFormulario = () => {
    setEditandoId(null);
    setNovoNome(''); setNovoTelefone(''); setValorAcordado(''); setNovoHorario(''); setDuracao('1');
  };

  const excluirMensalista = async () => {
    if (!editandoId) return;
    const confirmar = window.confirm(`Deseja EXCLUIR o mensalista ${novoNome}?`);
    if (confirmar) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, "mensalistas", editandoId));
        alert("Removido!");
        limparFormulario();
        carregarMensalistas();
      } catch (error) { console.error(error); } finally { setLoading(false); }
    }
  };

  const salvarMensalista = async (e) => {
    if (e) e.preventDefault();
    if (!novoNome || !novoHorario || !novoTelefone) return alert("Campos obrigatórios!");
    setLoading(true);

    try {
      const novoInicioMin = converterParaMinutos(novoHorario);
      const novoFimMin = novoInicioMin + (parseFloat(duracao) * 60);
      const q = query(collection(db, "mensalistas"), where("diaSemana", "==", parseInt(novoDia)));
      const snap = await getDocs(q);
      
      const temConflito = snap.docs.some(docSnap => {
        if (docSnap.id === editandoId) return false;
        const m = docSnap.data();
        const mInicio = converterParaMinutos(m.horario);
        const mFim = converterParaMinutos(m.horarioFim);
        return (novoInicioMin < mFim && novoFimMin > mInicio);
      });

      if (temConflito) {
        alert("⚠️ CONFLITO DE HORÁRIO!");
        setLoading(false);
        return;
      }

      const dados = {
        nome: novoNome.toUpperCase(), telefone: novoTelefone, valor: valorAcordado,
        diaSemana: parseInt(novoDia), horario: novoHorario,
        horarioFim: calcularTermino(novoHorario, duracao), duracao: duracao
      };

      if (editandoId) {
        await updateDoc(doc(db, "mensalistas", editandoId), dados);
      } else {
        await addDoc(collection(db, "mensalistas"), dados);
      }

      limparFormulario();
      carregarMensalistas();
      alert("Sucesso!");
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const styles = {
    container: { maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: "'Poppins', sans-serif", color: '#00002B' },
    card: { background: '#fff', padding: '30px', border: '3px solid #00002B', boxShadow: '15px 15px 0px #FDCC1A' },
    label: { display: 'block', fontSize: '11px', fontWeight: '800', marginBottom: '5px', textTransform: 'uppercase' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', border: '2px solid #00002B', fontSize: '16px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
    btnPrincipal: { width: '100%', padding: '18px', background: '#00002B', color: 'white', border: '2px solid #00002B', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px' },
    btnExcluir: { width: '100%', padding: '12px', background: '#FF4D4D', color: 'white', border: '2px solid #00002B', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase', marginTop: '15px' },
    item: { padding: '15px', border: '2px solid #00002B', marginBottom: '15px', background: '#f9f9f9', cursor: 'pointer', position: 'relative' },
    badge: { position: 'absolute', top: '10px', right: '10px', background: '#FDCC1A', padding: '2px 8px', fontSize: '10px', fontWeight: '900', border: '1px solid #00002B' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ fontWeight: '900', textAlign: 'center', textTransform: 'uppercase', marginBottom: '25px' }}>
          {editandoId ? 'Editar' : 'Nova'} <span style={{ color: '#FDCC1A' }}>Administração</span>
        </h2>

        <form onSubmit={salvarMensalista}>
          <label style={styles.label}>Nome Completo:</label>
          <input 
            style={styles.input} 
            type="text" 
            value={novoNome} 
            onChange={e => setNovoNome(e.target.value.toUpperCase())} 
            onKeyDown={(e) => handleKeyDown(e, telRef)}
            autoFocus
          />

          <label style={styles.label}>WhatsApp:</label>
          <input 
            ref={telRef}
            style={styles.input} 
            type="tel" 
            value={novoTelefone} 
            onChange={e => setNovoTelefone(formatarTelefone(e.target.value))} 
            onKeyDown={(e) => handleKeyDown(e, valorRef)}
            placeholder="(XX) X.XXXX-XXXX" 
          />

          <label style={styles.label}>Valor Acordado:</label>
          <input 
            ref={valorRef}
            style={styles.input} 
            type="text" 
            value={valorAcordado} 
            onChange={e => setValorAcordado(formatarMoeda(e.target.value))} 
            onKeyDown={(e) => handleKeyDown(e, diaRef)}
            placeholder="R$" 
          />

          <label style={styles.label}>Dia da Semana:</label>
          <select 
            ref={diaRef}
            style={styles.input} 
            value={novoDia} 
            onChange={e => setNovoDia(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, inicioRef)}
          >
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
              <label style={styles.label}>Início:</label>
              <input 
                ref={inicioRef}
                style={styles.input} 
                type="time" 
                value={novoHorario} 
                onChange={e => setNovoHorario(e.target.value)} 
                onKeyDown={(e) => handleKeyDown(e, duracaoRef)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Duração:</label>
              <select 
                ref={duracaoRef}
                style={styles.input} 
                value={duracao} 
                onChange={e => setDuracao(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && salvarMensalista()}
              >
                <option value="1">1h</option>
                <option value="1.5">1h30</option>
                <option value="2">2h</option>
                <option value="3">3h</option>
                <option value="4">4h</option>
              </select>
            </div>
          </div>

          <div style={{ background: '#00002B', color: '#FFF', padding: '15px', marginBottom: '20px', textAlign: 'center', fontWeight: '900', border: '2px solid #00002B', textTransform: 'uppercase', fontSize: '12px' }}>
             Término: {calcularTermino(novoHorario, duracao)}
          </div>

          <button type="submit" disabled={loading} style={styles.btnPrincipal}>
            {loading ? 'SALVANDO...' : editandoId ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR MENSALISTA'}
          </button>
          
          {editandoId && (
            <>
              <button type="button" onClick={excluirMensalista} disabled={loading} style={styles.btnExcluir}>
                Excluir Mensalista
              </button>
              <button type="button" onClick={limparFormulario} style={{ ...styles.btnPrincipal, background: 'none', color: '#00002B', marginTop: '10px', border: 'none', textDecoration: 'underline' }}>
                CANCELAR EDIÇÃO
              </button>
            </>
          )}
        </form>
      </div>

      <div style={{ marginTop: '50px' }}>
        <h4 style={{ textTransform: 'uppercase', fontWeight: '900', marginBottom: '20px', borderBottom: '3px solid #FDCC1A', display: 'inline-block' }}>
          Lista de Mensalistas
        </h4>

        {mensalistas.map(m => (
          <div key={m.id} style={styles.item} onClick={() => prepararEdicao(m)}>
            <div style={styles.badge}>EDITAR</div>
            <div style={{ fontWeight: '900', fontSize: '16px' }}>{m.nome}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', alignItems: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>
                {m.horario} - {m.horarioFim} | Dia {m.diaSemana}
                <br />
                <span style={{ opacity: 0.7 }}>{m.telefone}</span>
              </div>
              <div style={{ background: '#00002B', color: '#FFF', padding: '5px 10px', fontWeight: '900', fontSize: '14px' }}>
                {m.valor}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ✅ Export atualizado
export default Administração;