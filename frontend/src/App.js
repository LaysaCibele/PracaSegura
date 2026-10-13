import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom';

import Dashboard from './components/Dashboard/Dashboard';
import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import OccurrenceForm from './components/OccurrenceForm/OccurrenceForm';
import OccurrenceList from './components/OccurrenceList/OccurrenceList';
import OccurrenceFilters from './components/OccurrenceFilters/OccurrenceFilters';
import SectionIntro from './components/SectionIntro/SectionIntro';
import SquareManagement from './components/SquareManagement/SquareManagement';
import SquareSelector from './components/SquareSelector/SquareSelector';
import SquaresSection from './components/SquaresSection/SquaresSection';
import Login from './pages/Login/Login';
import SquareDetails from './pages/SquareDetails/SquareDetails';
import { getCurrentUser, logout } from './services/authService';
import { getSquares } from './services/squareService';

import './App.css';

function HomePage() {
  return (
    <>
      <Hero />
      <div className="content-container">
        <SectionIntro />
        <SquaresSection />
      </div>
    </>
  );
}

function OccurrencesPage({ user, squares, squareId, onSquareChange, refreshKey, onRefresh, filters, onFiltersChange }) {
  return (
    <div className="page-content">
      <header className="page-heading">
        <span className="section-label">ACOMPANHAMENTO</span>
        <h1>{user?.role === 'GESTOR' || !user ? 'Ocorrências' : 'Acompanhe seus registros'}</h1>
        <p>{user?.role === 'GESTOR'
          ? 'Consulte registros de todas as praças ou filtre por um espaço específico.'
          : user
            ? 'Consulte apenas os relatos que você registrou e envie um novo relato.'
            : 'Entre na sua conta para consultar e registrar seus próprios relatos.'}</p>
      </header>

      <SquareSelector
        squares={squares}
        squareId={squareId}
        onChange={onSquareChange}
      />

      {user?.role === 'GESTOR' && <OccurrenceFilters value={filters} onChange={onFiltersChange} />}

      {user?.role === 'GESTOR' && <Dashboard refreshKey={refreshKey} squareId={squareId} filters={filters} />}

      <OccurrenceList
        user={user}
        refreshKey={refreshKey}
        squareId={squareId}
        filters={user?.role === 'GESTOR' ? filters : undefined}
        onOccurrenceUpdated={onRefresh}
      />

      {user?.role !== 'GESTOR' && (
        <OccurrenceForm user={user} onCreated={onRefresh} />
      )}
    </div>
  );
}

function ManagementPage({ squares, squareId, onSquareChange, refreshKey, filters, onFiltersChange }) {
  return (
    <div className="page-content">
      <header className="page-heading">
        <span className="section-label">ÁREA ADMINISTRATIVA</span>
        <h1>Gestão</h1>
        <p>Acompanhe os indicadores e mantenha os cadastros das praças.</p>
      </header>

      <SquareSelector
        squares={squares}
        squareId={squareId}
        onChange={onSquareChange}
      />
      <OccurrenceFilters value={filters} onChange={onFiltersChange} />
      <Dashboard refreshKey={refreshKey} squareId={squareId} filters={filters} />
      <SquareManagement />
    </div>
  );
}

function MainLayout({ user, loadingUser, onLogout }) {
  return (
    <div className="app">
      <Header user={user} loadingUser={loadingUser} onLogout={onLogout} />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function ManagerOnly({ user, loadingUser, children }) {
  if (loadingUser) {
    return <p className="route-loading" role="status">Carregando sua sessão...</p>;
  }

  if (user?.role !== 'GESTOR') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [squares, setSquares] = useState([]);
  const [selectedSquareId, setSelectedSquareId] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState({ from: '', to: '', category: '', status: '' });

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoadingUser(false));
  }, []);

  useEffect(() => {
    getSquares().then(setSquares).catch(() => setSquares([]));
  }, []);

  function refreshData() {
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
    <Routes>
      <Route element={
        <MainLayout
          user={user}
          loadingUser={loadingUser}
          onLogout={handleLogout}
        />
      }>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/pracas/:id"
          element={<SquareDetails user={user} refreshKey={refreshKey} onRefresh={refreshData} filters={filters} onFiltersChange={setFilters} />}
        />
        <Route
          path="/ocorrencias"
          element={
            <OccurrencesPage
              user={user}
              squares={squares}
              squareId={selectedSquareId}
              onSquareChange={setSelectedSquareId}
              refreshKey={refreshKey}
              onRefresh={refreshData}
              filters={filters}
              onFiltersChange={setFilters}
            />
          }
        />
        <Route
          path="/gestao"
          element={
            <ManagerOnly user={user} loadingUser={loadingUser}>
              <ManagementPage
                squares={squares}
                squareId={selectedSquareId}
                onSquareChange={setSelectedSquareId}
                refreshKey={refreshKey}
                filters={filters}
                onFiltersChange={setFilters}
              />
            </ManagerOnly>
          }
        />
      </Route>
      <Route path="/login" element={<Login onAuthenticated={setUser} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
