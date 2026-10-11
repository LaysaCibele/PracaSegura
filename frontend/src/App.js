
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import SectionIntro from './components/SectionIntro/SectionIntro';
import SquaresSection from './components/SquaresSection/SquaresSection';
import Footer from './components/Footer/Footer';
import Login from './pages/Login/Login';
import OccurrenceForm from './components/OccurrenceForm/OccurrenceForm';
import OccurrenceList from './components/OccurrenceList/OccurrenceList';
import { getCurrentUser, logout } from './services/authService';

import './App.css';

function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoadingUser(false));
  }, []);

  function handleOccurrenceCreated() {
    setRefreshKey((current) => current + 1);
  }

  async function handleLogout() {
    try {
      await logout();
      setUser(null);
    } catch (error) {
      window.alert(error.message);
    }
  }

  return (
    <div className="app">
      <Header />

      <main>
        <Hero />

        <div className="content-container">
          {!loadingUser && (
            <div className="account-bar">
              {user ? (
                <>
                  <span>
                    Olá, {user.name} ·{' '}
                    {user.role === 'GESTOR' ? 'Gestor' : 'Cidadão'}
                  </span>

                  <button type="button" onClick={handleLogout}>
                    Sair
                  </button>
                </>
              ) : (
                <span>
                  <Link to="/login">Entre ou crie sua conta</Link>
                  {' '}para registrar ocorrências.
                </span>
              )}
            </div>
          )}

          <SectionIntro />
          <SquaresSection />

          <OccurrenceForm
            user={user}
            onCreated={handleOccurrenceCreated}
          />

          <OccurrenceList
            user={user}
            refreshKey={refreshKey}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;