import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
