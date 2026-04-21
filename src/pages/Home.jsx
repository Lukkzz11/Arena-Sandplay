import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import img1 from '../assets/Imagem carrossel 1.jpg';
import img2 from '../assets/Imagem carrossel 2.jpg';
import img3 from '../assets/Imagem carrossel 3.jpg';
import logo from '../assets/Arena sandplay 2.png';

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoverBtn, setHoverBtn] = useState(false);
  const [hoverLoc, setHoverLoc] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const navigate = useNavigate();

  const slides = [
    { url: img1, title: 'Nossas Quadras' },
    { url: img2, title: 'Ambiente' },
    { url: img3, title: 'Jogos' },
  ];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const abrirMapa = () => {
    const endereco = "Segunda - Tv. Belém de São Francisco - Cohab2, Caruaru - PE, 55038-275";
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
    window.open(url, '_blank');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      fontFamily: "'Poppins', sans-serif, Arial",
      backgroundColor: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      color: '#00002B',
      overflowX: 'hidden'
    },
    topBarContainer: { width: '100%', display: 'flex', flexDirection: 'column' },
    stripeBlue: { width: '100%', height: '12px', backgroundColor: '#00002B' },
    stripeYellow: { width: '100%', height: '8px', backgroundColor: '#FDCC1A' },
    
    header: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: isMobile ? '20px 10px' : '30px 20px',
      textAlign: 'center'
    },
    logo: {
      width: isMobile ? '60px' : '75px',
      marginBottom: '10px',
      cursor: 'pointer', // Adicionado para indicar que é clicável
      transition: '0.3s opacity'
    },
    title: {
      fontSize: isMobile ? '24px' : '32px',
      fontWeight: '900',
      color: '#00002B',
      letterSpacing: '-1px',
      textTransform: 'uppercase',
      margin: 0
    },
    
    carouselContainer: {
      width: '95%',
      maxWidth: '950px',
      position: 'relative',
      marginTop: '10px',
      paddingBottom: isMobile ? '10px' : '0'
    },
    carousel: {
      width: '100%',
      height: isMobile ? '250px' : '480px', 
      borderRadius: '4px',
      overflow: 'hidden',
      boxShadow: isMobile ? '8px 8px 0px #FDCC1A' : '15px 15px 0px #FDCC1A',
      position: 'relative',
      border: '2px solid #00002B',
      touchAction: 'pan-y'
    },
    img: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    arrow: {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      background: '#00002B',
      color: '#FDCC1A',
      border: 'none',
      width: isMobile ? '35px' : '40px',
      height: isMobile ? '50px' : '60px',
      cursor: 'pointer',
      fontSize: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      transition: '0.3s'
    },
    
    section: {
      marginTop: isMobile ? '30px' : '50px',
      textAlign: 'center',
      padding: isMobile ? '30px 15px' : '40px 20px',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    button: {
      background: hoverBtn ? '#FDCC1A' : '#00002B',
      color: hoverBtn ? '#00002B' : '#FFFFFF',
      border: '3px solid #00002B',
      padding: isMobile ? '15px 30px' : '18px 50px',
      borderRadius: '0px',
      fontSize: isMobile ? '16px' : '18px',
      fontWeight: '900',
      cursor: 'pointer',
      transition: '0.3s all ease',
      letterSpacing: '1px',
      boxShadow: hoverBtn ? 'none' : '8px 8px 0px #FDCC1A',
      width: isMobile ? '90%' : 'auto',
      maxWidth: '350px',
      transform: hoverBtn ? 'translate(4px, 4px)' : 'none'
    },

    locationBar: {
      width: '90%',
      maxWidth: '850px',
      backgroundColor: '#FFFFFF',
      padding: isMobile ? '25px 15px' : '35px 20px',
      marginTop: '60px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      cursor: 'pointer',
      border: '3px solid #00002B',
      boxShadow: hoverLoc ? 'none' : (isMobile ? '10px 10px 0px #FDCC1A' : '15px 15px 0px #FDCC1A'),
      transition: '0.2s all ease',
      transform: hoverLoc ? 'translate(5px, 5px)' : 'none',
      marginBottom: '50px'
    },
    addressText: {
      fontSize: isMobile ? '14px' : '19px',
      fontWeight: '800',
      color: '#00002B',
      margin: '10px 0',
      letterSpacing: '0.5px',
      lineHeight: '1.4',
      textTransform: 'uppercase'
    },

    footer: {
      marginTop: 'auto',
      width: '100%',
      padding: '40px 0',
      backgroundColor: '#00002B',
      color: '#FFFFFF',
      textAlign: 'center',
    },
    link: {
      color: '#FDCC1A',
      margin: '0 15px',
      textDecoration: 'none',
      fontWeight: '800',
      fontSize: isMobile ? '13px' : '15px',
      textTransform: 'uppercase'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.topBarContainer}>
        <div style={styles.stripeBlue}></div>
        <div style={styles.stripeYellow}></div>
      </div>

      <header style={styles.header}>
        {/* LOGO COM FUNÇÃO DE NAVEGAÇÃO PARA LOGIN */}
        <img 
          src={logo} 
          alt="Logo" 
          style={styles.logo} 
          onClick={() => navigate('/login')}
        />
        <h1 style={styles.title}>ARENA <span style={{color: '#FDCC1A'}}>SANDPLAY</span></h1>
        <p style={{color: '#666', fontWeight: '600', fontSize: isMobile ? '12px' : '14px', margin: '5px 0 0 0'}}>
          BEACH TENNIS • FUTEVÔLEI • VÔLEI DE PRAIA
        </p>
      </header>

      <div style={styles.carouselContainer}>
        <div style={styles.carousel}>
          <img src={slides[currentSlide].url} alt="Arena" style={styles.img} />
          <button onClick={prevSlide} style={{ ...styles.arrow, left: '0' }}>‹</button>
          <button onClick={nextSlide} style={{ ...styles.arrow, right: '0' }}>›</button>
        </div>
      </div>

      <section style={styles.section}>
        <h2 style={{fontSize: isMobile ? '20px' : '24px', fontWeight: '800', marginBottom: '25px', color: '#00002B'}}>
          PRONTO PARA ENTRAR EM QUADRA?
        </h2>
        
        <button
          style={styles.button}
          onClick={() => navigate('/reserva')}
          onMouseEnter={() => setHoverBtn(true)}
          onMouseLeave={() => setHoverBtn(false)}
        >
          RESERVAR AGORA
        </button>

        <div 
          style={styles.locationBar} 
          onClick={abrirMapa}
          onMouseEnter={() => setHoverLoc(true)}
          onMouseLeave={() => setHoverLoc(false)}
        >
          <span style={{backgroundColor: '#FDCC1A', color: '#00002B', padding: '2px 10px', fontWeight: '900', fontSize: '12px', letterSpacing: '1px', marginBottom: '10px'}}>
            📍 NOSSA LOCALIZAÇÃO
          </span>
          <p style={styles.addressText}>
            Segunda - Tv. Belém de São Francisco, Cohab2<br/>
            Caruaru - PE, 55038-275
          </p>
          <span style={{fontSize: '11px', color: '#666', fontWeight: '700', textDecoration: 'underline'}}>
            CLIQUE PARA ABRIR NO MAPA
          </span>
        </div>
      </section>

      <footer style={styles.footer}>
        <div>
            <a href="https://www.instagram.com/arenasandplay/" target="_blank" rel="noreferrer" style={styles.link}>INSTAGRAM</a>
            <span style={{color: '#FFFFFF', fontWeight: '900', opacity: 0.3}}>|</span>
            <a href="https://wa.me/5581998805031" target="_blank" rel="noreferrer" style={styles.link}>WHATSAPP</a>
        </div>
        <p style={{ marginTop: '20px', fontSize: '10px', opacity: 0.5, fontWeight: '700', letterSpacing: '1px' }}>
          ARENA SANDPLAY • CARUARU - PE
        </p>
      </footer>
    </div>
  );
}

export default Home;