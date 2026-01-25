import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import FloatingHearts from './components/FloatingHearts';
import Navbar from './components/Navbar';
import PasswordGate from './components/PasswordGate';
import Home from './pages/Home';
import Feelings from './pages/Feelings';
import Gallery from './pages/Gallery';
import Admin from './pages/Admin';

import MusicPlayer from './components/MusicPlayer';
// import CursorTrail from './components/CursorTrail';
import Surprise from './components/Surprise';

function App() {
  return (
    <Router>
      <PasswordGate>
        <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflowX: 'hidden' }}>
          {/* <FloatingHearts /> */}
          {/* <CursorTrail /> */}
          <Navbar />

          <MusicPlayer />
          <Surprise />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/feelings" element={<Feelings />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </PasswordGate>
    </Router>
  );
}

export default App;
