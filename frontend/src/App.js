import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import SectionIntro from './components/SectionIntro/SectionIntro';
import SquaresSection from './components/SquaresSection/SquaresSection';
import Footer from './components/Footer/Footer';
import Login from './pages/Login/Login';

import './App.css';

function Home() {
  return (
    <div className="app">
      <Header />

      <main>
        <Hero />

        <div className="content-container">
          <SectionIntro />
          <SquaresSection />
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